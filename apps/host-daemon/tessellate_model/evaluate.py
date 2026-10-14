"""
Held-out evaluation for the brief model (Phase 28 gate).

    python -m tessellate_model.evaluate [--weights DIR] [--show-errors]

Metrics (micro-averaged over eval/briefs.jsonl):
  archetype_top1   primary archetype is one of the acceptable gold archetypes
  entity_f1        F1 between mentioned entities (assumed suggestions excluded) and gold entities
  screen_recall    share of gold required screen types present in the planned screens
"""

import argparse
import json
import os
from typing import Dict, List

from .text import lemma, tokenize

THRESHOLDS = {"archetype_top1": 0.85, "entity_f1": 0.80, "screen_recall": 0.85}
EVAL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "eval", "briefs.jsonl")


def norm(name: str) -> str:
    return " ".join(lemma(t.text) for t in tokenize(name) if t.text.isalnum() or "-" in t.text)


def evaluate(interpreter, path: str = EVAL_PATH, show_errors: bool = False) -> Dict[str, float]:
    with open(path, encoding="utf-8") as f:
        items = [json.loads(line) for line in f if line.strip()]
    arch_ok = 0
    tp = fp = fn = 0
    screens_hit = screens_total = 0
    for item in items:
        out = interpreter.interpret(item["brief"])
        pm = out["productModel"]
        primary = pm["productArchetypes"][0]["tag"]
        if primary in item["archetypes"]:
            arch_ok += 1
        elif show_errors:
            print(f"[archetype] got {primary}, want {item['archetypes']}: {item['brief'][:70]}")

        mentioned = {norm(n) for n, c in out["confidence"]["entities"].items() if c > 0.45}
        gold = {norm(n) for n in item["entities"]}
        tp += len(mentioned & gold)
        fp += len(mentioned - gold)
        fn += len(gold - mentioned)
        if show_errors and (gold - mentioned or mentioned - gold):
            print(f"[entities] missing {sorted(gold - mentioned)} extra {sorted(mentioned - gold)}: {item['brief'][:60]}")

        planned = {s["screenType"] for g in out["screenGraph"]["groups"] for s in g["screens"]}
        want = set(item["screens"])
        screens_hit += len(want & planned)
        screens_total += len(want)
        if show_errors and want - planned:
            print(f"[screens] missing {sorted(want - planned)}: {item['brief'][:60]}")

    precision = tp / max(tp + fp, 1)
    recall = tp / max(tp + fn, 1)
    return {
        "briefs": len(items),
        "archetype_top1": round(arch_ok / max(len(items), 1), 4),
        "entity_precision": round(precision, 4),
        "entity_recall": round(recall, 4),
        "entity_f1": round(2 * precision * recall / max(precision + recall, 1e-9), 4),
        "screen_recall": round(screens_hit / max(screens_total, 1), 4),
    }


def passes(metrics: Dict[str, float]) -> List[str]:
    return [f"{k} {metrics[k]:.3f} < {v}" for k, v in THRESHOLDS.items() if metrics[k] < v]


if __name__ == "__main__":
    from .runtime import load_interpreter

    ap = argparse.ArgumentParser()
    ap.add_argument("--weights", default=None)
    ap.add_argument("--set", default=EVAL_PATH, help="JSONL evaluation set (default eval/briefs.jsonl)")
    ap.add_argument("--show-errors", action="store_true")
    args = ap.parse_args()
    m = evaluate(load_interpreter(args.weights), path=args.set, show_errors=args.show_errors)
    print(json.dumps(m, indent=2))
    failed = passes(m)
    print("PASS" if not failed else "FAIL: " + "; ".join(failed))
    raise SystemExit(1 if failed else 0)
