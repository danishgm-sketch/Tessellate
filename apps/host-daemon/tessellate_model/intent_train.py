"""
Trains and evaluates the Workbench command model (Phase 29).

    python -m tessellate_model.intent_train --version v2.1.0 [--promote]

Writes weights/<version>/intent.json and an "intent" section in that version's model card. If the version
directory has no brief-model weights yet, the current version's brief weights are copied in first, so a
version always contains a complete model set. --promote makes the version CURRENT only if the gate passes.
"""

import argparse
import json
import os
import shutil
import time
from typing import Dict, List

from .intent import CLASSES, OUT_OF_SCOPE, dna_deltas, features, train

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "weights")
EVAL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "eval", "commands.jsonl")
THRESHOLDS = {"action_accuracy": 0.9, "out_of_scope_rejection": 0.8, "dna_direction_accuracy": 0.85}
MIN_CONFIDENCE = 0.6


def evaluate(clf, path: str = EVAL, show_errors: bool = False) -> Dict[str, float]:
    with open(path, encoding="utf-8") as f:
        items = [json.loads(line) for line in f if line.strip()]
    in_scope = [i for i in items if i["action"] != OUT_OF_SCOPE]
    oos = [i for i in items if i["action"] == OUT_OF_SCOPE]

    def predict(text: str) -> str:
        label, prob = clf.probabilities(features(text))[0]
        return label if prob >= MIN_CONFIDENCE else OUT_OF_SCOPE

    correct = 0
    for it in in_scope:
        got = predict(it["command"])
        correct += got == it["action"]
        if show_errors and got != it["action"]:
            print(f"[action] got {got}, want {it['action']}: {it['command']}")
    rejected = 0
    for it in oos:
        got = predict(it["command"])
        rejected += got == OUT_OF_SCOPE
        if show_errors and got != OUT_OF_SCOPE:
            print(f"[out-of-scope] accepted as {got}: {it['command']}")
    dna_ok = dna_total = 0
    for it in in_scope:
        for dim, sign in it.get("dna", {}).items():
            dna_total += 1
            delta = dna_deltas(it["command"]).get(dim, 0)
            ok = delta * sign > 0
            dna_ok += ok
            if show_errors and not ok:
                print(f"[dna] {dim} expected {'+' if sign > 0 else '-'}, got {delta}: {it['command']}")
    return {
        "commands": len(items),
        "action_accuracy": round(correct / max(len(in_scope), 1), 4),
        "out_of_scope_rejection": round(rejected / max(len(oos), 1), 4),
        "dna_direction_accuracy": round(dna_ok / max(dna_total, 1), 4),
    }


def passes(metrics: Dict[str, float]) -> List[str]:
    return [f"{k} {metrics[k]:.3f} < {v}" for k, v in THRESHOLDS.items() if metrics[k] < v]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--version", required=True)
    ap.add_argument("--examples", type=int, default=6000)
    ap.add_argument("--promote", action="store_true")
    ap.add_argument("--show-errors", action="store_true")
    args = ap.parse_args()

    out_dir = os.path.join(ROOT, args.version)
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(ROOT, "CURRENT"), encoding="utf-8") as f:
        current = os.path.join(ROOT, f.read().strip())
    for name in ("tagger.json", "archetypes.json", "model_card.json"):
        if not os.path.exists(os.path.join(out_dir, name)) and os.path.exists(os.path.join(current, name)):
            shutil.copy(os.path.join(current, name), os.path.join(out_dir, name))

    started = time.time()
    clf = train(args.examples)
    clf.save(os.path.join(out_dir, "intent.json"))
    metrics = evaluate(clf, show_errors=args.show_errors)
    failed = passes(metrics)

    card_path = os.path.join(out_dir, "model_card.json")
    card = json.load(open(card_path, encoding="utf-8")) if os.path.exists(card_path) else {}
    card["version"] = args.version
    card["intent"] = {
        "architecture": "averaged-perceptron action classifier with out-of-scope class + DNA direction lexicon + role-word target resolution",
        "classes": CLASSES,
        "minConfidence": MIN_CONFIDENCE,
        "syntheticExamples": args.examples,
        "trainingSeconds": round(time.time() - started, 1),
        "heldOutSet": "eval/commands.jsonl (hand-written, never tuned against)",
        "heldOutMetrics": metrics,
        "gate": "pass" if not failed else "fail",
        "gateFailures": failed,
    }
    with open(card_path, "w", encoding="utf-8") as f:
        json.dump(card, f, indent=2)
    print(json.dumps(card["intent"], indent=2))

    if args.promote:
        if failed:
            print("[intent] NOT promoted: the command model does not meet its thresholds.")
            return 1
        with open(os.path.join(ROOT, "CURRENT"), "w", encoding="utf-8") as f:
            f.write(args.version)
        print(f"[intent] {args.version} is now CURRENT")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
