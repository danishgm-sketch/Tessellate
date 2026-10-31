"""Run the frozen host-model benchmark cases and emit raw model proposals as JSON."""

import contextlib
import json
import os
import sys
from pathlib import Path
from typing import Any

MODEL_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(MODEL_DIR))

from dataset import generate_synthetic_samples  # noqa: E402
from inference import BespokeInferenceEngine  # noqa: E402


def evaluation_cases(path: Path) -> tuple[list[dict[str, Any]], dict[str, list[dict[str, Any]]]]:
    benchmark = json.loads(path.read_text(encoding="utf-8"))
    training = [
        {
            "id": f"TRAIN-{index + 1:02d}",
            "prompt": sample["prompt"],
            "expectedAction": sample["action"],
            "expectedDnaDirections": {
                dimension: 1 if value > 0 else -1
                for dimension, value in sample["dna_deltas"].items()
                if value != 0
            },
            "expectedDivergence": sample["divergence"],
            "split": "training",
        }
        for index, sample in enumerate(generate_synthetic_samples())
    ]
    splits = {
        name: [dict(case, split=name) for case in benchmark[name]]
        for name in ("validation", "heldOut", "adversarial")
    }
    return training, splits


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python apps/host-daemon/model/evaluate.py <benchmark-cases.json>")

    training, splits = evaluation_cases(Path(sys.argv[1]).resolve())
    ast = {
        "id": "root",
        "semanticRole": "screen",
        "children": [
            {"id": "site-header", "semanticRole": "header", "children": []},
            {"id": "employee-summary", "semanticRole": "metric", "children": []},
            {"id": "employee-metric", "semanticRole": "analytics", "children": []},
            {"id": "onboarding-checklist", "semanticRole": "content", "children": []},
        ],
    }

    with contextlib.redirect_stdout(sys.stderr):
        engine = BespokeInferenceEngine()

    def predict(cases: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return [
            {
                **case,
                "model": engine.infer(case["prompt"], ast),
            }
            for case in cases
        ]

    result = {"training": predict(training)}
    result.update({name: predict(cases) for name, cases in splits.items()})
    json.dump(result, sys.stdout, ensure_ascii=False)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
