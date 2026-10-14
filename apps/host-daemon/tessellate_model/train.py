"""
Trains the brief model and writes versioned weights + a model card (D-034).

    python -m tessellate_model.train --version vX.Y.Z [--examples 8000] [--promote]

Runs entirely on the owner's machine with the standard library. The held-out evaluation set is never
used for training; its metrics are recorded in the model card and `--promote` refuses to make a model
current unless it meets the Phase 28 thresholds.
"""

import argparse
import json
import os
import time

from .classifier import AveragedPerceptron, brief_features
from .evaluate import evaluate, passes
from .interpret import BriefInterpreter
from .ontology import load
from .synth import generate
from .tagger import StructuredPerceptron

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "weights")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--version", required=True)
    ap.add_argument("--examples", type=int, default=8000)
    ap.add_argument("--tagger-epochs", type=int, default=5)
    ap.add_argument("--classifier-epochs", type=int, default=10)
    ap.add_argument("--seed", type=int, default=11)
    ap.add_argument("--promote", action="store_true", help="make this version CURRENT if it passes the gate")
    args = ap.parse_args()

    started = time.time()
    out_dir = os.path.join(ROOT, args.version)
    os.makedirs(out_dir, exist_ok=True)

    print(f"[train] generating {args.examples} synthetic briefs (+20% calibration)")
    train = generate(args.examples, seed=args.seed)
    calib = generate(max(500, args.examples // 5), seed=args.seed + 1000)

    tagger = StructuredPerceptron()
    tagger.train([(e.tokens, e.tags) for e in train], epochs=args.tagger_epochs, seed=args.seed)
    tagger.save(os.path.join(out_dir, "tagger.json"))

    classes = sorted(load().archetypes)
    clf = AveragedPerceptron(classes)
    text = lambda e: " ".join(e.tokens)  # noqa: E731
    clf.train([(brief_features(text(e)), e.archetypes) for e in train], epochs=args.classifier_epochs, seed=args.seed)
    clf.calibrate([(brief_features(text(e)), e.archetypes) for e in calib])
    clf.save(os.path.join(out_dir, "archetypes.json"))

    interpreter = BriefInterpreter(tagger, clf)
    metrics = evaluate(interpreter)
    failed = passes(metrics)
    # The development set was used while tuning, so its scores are optimistic. holdout2 was written after
    # tuning stopped; it is reported, never tuned against.
    holdout2 = os.path.join(os.path.dirname(os.path.abspath(__file__)), "eval", "holdout2.jsonl")
    fresh = evaluate(interpreter, path=holdout2) if os.path.exists(holdout2) else None
    card = {
        "version": args.version,
        "architecture": "BIO structured-perceptron span tagger + averaged-perceptron archetype classifier + ontology grounding (D-034a)",
        "trainedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "trainingSeconds": round(time.time() - started, 1),
        "syntheticExamples": args.examples,
        "ontology": {"archetypes": len(load().archetypes), "entities": len(load().entities)},
        "heldOutMetrics": metrics,
        "gate": "pass" if not failed else "fail",
        "gateFailures": failed,
        "freshHoldoutMetrics": fresh,
        "freshHoldoutFailures": passes(fresh) if fresh else None,
        "temperature": clf.temperature,
    }
    with open(os.path.join(out_dir, "model_card.json"), "w", encoding="utf-8") as f:
        json.dump(card, f, indent=2)
    print(json.dumps(card, indent=2))

    if args.promote:
        if failed:
            print("[train] NOT promoted: the model does not meet the evaluation thresholds.")
            return 1
        with open(os.path.join(ROOT, "CURRENT"), "w", encoding="utf-8") as f:
            f.write(args.version)
        print(f"[train] {args.version} is now CURRENT")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
