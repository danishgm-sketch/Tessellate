"""
Tessellate bespoke model runtime (D-033/D-034).

Loads the Tree-GNN + Bi-GRU weights and turns predictions into canonical IntentCommand JSON
(the schema lives in packages/schemas/src/intent.ts and is re-validated by the API).
No external LLM or transformer weights are used.

Honesty rule: when the model is not confident, the daemon reports "not understood" instead of
guessing. A wrong edit applied silently is worse than an explicit refusal.
"""

import json
import os
from typing import Any, Dict, Optional

try:
    from .intent_network import BespokeIntentNetwork
except ImportError:
    from intent_network import BespokeIntentNetwork

# Minimum softmax confidence for an intent to be acted on. Calibrated against the held-out
# evaluation set in Phase 28; until then it is deliberately strict.
MIN_INTENT_CONFIDENCE = 0.6

FEEL_PHRASES = ["calm precision", "modern editorial", "high density", "playful", "fintech", "nocturne"]


class NotUnderstood(Exception):
    """Raised when the model cannot confidently interpret a request."""


class BespokeInferenceEngine:
    _instance = None

    def __init__(self, weights_path: Optional[str] = None):
        if weights_path is None:
            weights_path = os.path.join(os.path.dirname(__file__), "weights.json")

        self.model = BespokeIntentNetwork(seed=42)
        self.weights_loaded = False
        if os.path.exists(weights_path):
            with open(weights_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.model.load_weights(data)
                self.weights_loaded = True
                print(f"[model] Loaded weights ({data.get('architecture', 'TreeGNN')})")
        else:
            print("[model] Warning: weights.json not found; every request will be reported as not understood.")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def infer(self, prompt: str, screen_ast: Dict[str, Any], design_dna: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Raw model prediction (kept for training/evaluation tooling)."""
        return self.model.forward(prompt.strip(), screen_ast or {})

    def infer_intent(self, prompt: str, screen_ast: Dict[str, Any]) -> Dict[str, Any]:
        """Returns a canonical IntentCommand, or raises NotUnderstood."""
        clean = prompt.strip()
        if not clean:
            raise NotUnderstood("The request was empty.")
        if not self.weights_loaded:
            raise NotUnderstood("The intent model is not loaded on this host.")

        pred = self.model.forward(clean, screen_ast or {})
        confidence = float(pred.get("confidence", 0.0))
        if confidence < MIN_INTENT_CONFIDENCE:
            raise NotUnderstood(
                f"Tessellate could not confidently interpret this request (confidence {confidence:.2f}). "
                "Try rephrasing, or make the change directly in the Workbench."
            )

        action = pred["action"]
        command: Dict[str, Any] = {
            "action": action,
            "summary": _summary(action, clean),
            "preserveLockedNodes": True,
            "explanation": f"Bespoke model prediction (confidence {confidence:.2f}).",
        }
        targets = [t for t in pred.get("targetNodeIds") or [] if isinstance(t, str)]
        if targets and action in ("lock-nodes", "unlock-nodes", "replace-component"):
            command["targetNodeIds"] = targets
        deltas = pred.get("dnaDeltas") or {}
        if deltas and action == "adjust-dna":
            command["dnaDeltas"] = {k: int(v) for k, v in deltas.items()}
        if action == "apply-feel":
            lower = clean.lower()
            command["feelDescriptors"] = next((fd for fd in FEEL_PHRASES if fd in lower), clean)
        return command

    def interpret_brief(self, brief: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Brief → ProductModel. Implemented by the Phase 28 model (span tagger + ontology)."""
        raise NotUnderstood("Brief interpretation is not available on this host yet.")


def _summary(action: str, prompt: str) -> str:
    labels = {
        "recompose-screen": "Recompose the screen",
        "rethink-screen": "Rethink the screen structure",
        "adjust-dna": "Adjust Design DNA",
        "apply-feel": "Apply a feel",
        "lock-nodes": "Lock the selected sections",
        "unlock-nodes": "Unlock the selected sections",
        "replace-component": "Replace a component",
        "surprise-me": "Explore a controlled variation",
    }
    return f"{labels.get(action, action)} (from: \"{prompt[:80]}\")"
