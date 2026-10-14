"""
Tessellate bespoke model runtime (D-033/D-034/D-034a).

Serves the promoted, versioned models in tessellate_model/weights/CURRENT:
- the brief model (interpret_brief) → ProductModel + ScreenGraph + review data;
- the Workbench command model (infer_intent) → canonical IntentCommand
  (schema in packages/schemas/src/intent.ts, re-validated by the API).
No external LLM or transformer weights are used.

Honesty rule: when a model is not confident, the daemon reports "not understood" instead of guessing.
A wrong edit applied silently is worse than an explicit refusal.
"""

import os
import sys
from typing import Any, Dict, Optional

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from tessellate_model import intent as intent_model  # noqa: E402
from tessellate_model.runtime import load_intent, load_interpreter, model_card  # noqa: E402

# Minimum calibrated probability for a command to be acted on (measured on eval/commands.jsonl).
MIN_INTENT_CONFIDENCE = 0.6
# Actions that need a section to act on.
_NEEDS_TARGET = {"lock-nodes", "replace-component"}


class NotUnderstood(Exception):
    """Raised when the model cannot confidently interpret a request."""


class BespokeInferenceEngine:
    _instance = None

    @classmethod
    def get_instance(cls) -> "BespokeInferenceEngine":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def infer_intent(self, prompt: str, screen_ast: Dict[str, Any], selected_node_id: Optional[str] = None) -> Dict[str, Any]:
        """Returns a canonical IntentCommand, or raises NotUnderstood."""
        clean = (prompt or "").strip()
        if not clean:
            raise NotUnderstood("The request was empty.")
        try:
            clf = load_intent()
            version = model_card().get("version")
        except FileNotFoundError:
            raise NotUnderstood("No command model is installed on this host. Run the training job first.") from None

        action, confidence = clf.probabilities(intent_model.features(clean))[0]
        if action == intent_model.OUT_OF_SCOPE or confidence < MIN_INTENT_CONFIDENCE:
            raise NotUnderstood(
                "Tessellate could not confidently interpret this request. Try rephrasing (for example “make it calmer” "
                "or “lock the header”), or make the change directly in the Workbench."
            )

        command: Dict[str, Any] = {
            "action": action,
            "summary": _summary(action, clean),
            "preserveLockedNodes": True,
            "explanation": f"Command model {version} (confidence {confidence:.2f}).",
        }
        targets = intent_model.resolve_targets(clean, screen_ast or {}, selected_node_id)
        if action in _NEEDS_TARGET and not targets:
            raise NotUnderstood("Select the section you mean first, or name it (for example “lock the header”).")
        if targets and action in ("lock-nodes", "unlock-nodes", "replace-component", "adjust-dna", "apply-feel"):
            command["targetNodeIds"] = targets
        if action == "unlock-nodes" and not targets:
            command["targetNodeIds"] = [n for n in _all_locked(screen_ast)]
        if action in ("adjust-dna", "recompose-screen", "surprise-me"):
            deltas = intent_model.dna_deltas(clean)
            if action == "adjust-dna" and not deltas:
                raise NotUnderstood("Say how it should change, for example “calmer”, “denser” or “rounder”.")
            if deltas:
                command["dnaDeltas"] = deltas
        if action == "apply-feel":
            feel = intent_model.feel_phrase(clean)
            if not feel:
                raise NotUnderstood("Name the feel you want, for example “calm precision” or “warm and friendly”.")
            command["feelDescriptors"] = feel
        return command

    def interpret_brief(self, brief: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Brief → ProductModel + ScreenGraph + review data, using the promoted brief model (Phase 28)."""
        text = (brief or "").strip()
        if len(text) < 12:
            raise NotUnderstood("Describe the product in a sentence or two so Tessellate can plan it.")
        try:
            interpreter = load_interpreter()
            card = model_card()
        except FileNotFoundError:
            raise NotUnderstood("No promoted brief model is installed on this host. Run the training job first.") from None
        result = interpreter.interpret(text)
        result["modelVersion"] = card.get("version")
        if result["confidence"]["overall"] < 0.35:
            raise NotUnderstood(
                "Tessellate could not confidently understand this brief. Add who uses the product and what they do in it."
            )
        return result


def _all_locked(screen_ast: Dict[str, Any]) -> list:
    out = []

    def walk(node: Any) -> None:
        if not isinstance(node, dict):
            return
        if node.get("locks") and node.get("id"):
            out.append(node["id"])
        for child in node.get("children") or []:
            walk(child)

    walk(screen_ast)
    return out


def _summary(action: str, prompt: str) -> str:
    labels = {
        "recompose-screen": "Recompose the screen",
        "rethink-screen": "Rethink the screen structure",
        "adjust-dna": "Adjust Design DNA",
        "apply-feel": "Apply a feel",
        "lock-nodes": "Lock sections",
        "unlock-nodes": "Unlock sections",
        "replace-component": "Replace a component",
        "surprise-me": "Explore a controlled variation",
    }
    return f"{labels.get(action, action)} (from: \"{prompt[:80]}\")"
