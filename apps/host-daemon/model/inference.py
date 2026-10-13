"""
Tessellate Bespoke ML Engine - Inference Runtime
Loads trained Tree-GNN + Bi-GRU weights and executes sub-millisecond forward inference.
Zero external LLM / transformer weights.
"""

import json
import os
from typing import Dict, Any

try:
    from .intent_network import BespokeIntentNetwork
except ImportError:
    from intent_network import BespokeIntentNetwork


class BespokeInferenceEngine:
    _instance = None

    def __init__(self, weights_path: str = None):
        if weights_path is None:
            weights_path = os.path.join(os.path.dirname(__file__), "weights.json")

        self.model = BespokeIntentNetwork(seed=42)
        if os.path.exists(weights_path):
            with open(weights_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.model.load_weights(data)
                print(f"[Tessellate DL] Loaded trained weights ({data.get('architecture', 'TreeGNN')})")
        else:
            print("[Tessellate DL] Warning: weights.json not found, using initialized weights.")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def infer(self, prompt: str, screen_ast: Dict[str, Any], design_dna: Dict[str, Any] = None) -> Dict[str, Any]:
        """Runs forward inference and formats the output into strict IntentCommand JSON."""
        clean_prompt = prompt.strip()
        if not clean_prompt:
            return {
                "action": "recompose-screen",
                "summary": "Default recomposition applied.",
                "confidence": 0.5,
                "divergenceLevel": 50,
            }

        pred = self.model.forward(clean_prompt, screen_ast or {})

        # Context-aware adjustments based on keywords
        lower = clean_prompt.lower()
        if "lock" in lower and "unlock" not in lower:
            pred["action"] = "lock-nodes"
        elif "unlock" in lower:
            pred["action"] = "unlock-nodes"
        elif "surprise" in lower:
            pred["action"] = "surprise-me"
            pred["divergenceLevel"] = max(pred.get("divergenceLevel", 60), 65)
        elif "rethink" in lower:
            pred["action"] = "rethink-screen"
            pred["divergenceLevel"] = max(pred.get("divergenceLevel", 75), 80)
        elif "recompose" in lower:
            pred["action"] = "recompose-screen"

        # Apply feel descriptor if present in prompt
        feel_descriptors = ["calm precision", "modern editorial", "high density", "playful", "fintech", "nocturne"]
        for fd in feel_descriptors:
            if fd in lower:
                pred["feel"] = fd
                break

        return pred
