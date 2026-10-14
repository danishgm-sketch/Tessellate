"""
Unit tests for bespoke deep learning engine.
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "model"))
from dataset import tokenize, flatten_ast, ACTIONS
from intent_network import BespokeIntentNetwork
from inference import BespokeInferenceEngine, NotUnderstood


class TestBespokeModel(unittest.TestCase):
    def test_tokenize(self):
        tokens = tokenize("recompose screen with calm precision")
        self.assertEqual(len(tokens), 24)
        self.assertGreater(tokens[1], 0)

    def test_flatten_ast(self):
        ast = {
            "id": "root",
            "semanticRole": "layout",
            "children": [
                {"id": "c1", "semanticRole": "hero", "locked": True},
                {"id": "c2", "semanticRole": "metric", "locked": False},
            ],
        }
        feats, edges, ids = flatten_ast(ast)
        self.assertEqual(len(feats), 16)
        self.assertIn("root", ids)
        self.assertIn("c1", ids)
        self.assertIn("c2", ids)
        self.assertGreater(len(edges), 0)

    def test_forward_pass(self):
        model = BespokeIntentNetwork(seed=123)
        ast = {"id": "screen", "semanticRole": "layout"}
        res = model.forward("surprise me with rich visual ambition", ast)
        self.assertIn(res["action"], ACTIONS)
        self.assertGreaterEqual(res["divergenceLevel"], 0)
        self.assertLessEqual(res["divergenceLevel"], 100)

    def test_low_confidence_is_reported_not_guessed(self):
        engine = BespokeInferenceEngine.get_instance()
        original = engine.model.forward
        engine.model.forward = lambda prompt, ast: {"action": "adjust-dna", "confidence": 0.2, "targetNodeIds": [], "dnaDeltas": {}}
        try:
            with self.assertRaises(NotUnderstood):
                engine.infer_intent("add an appointment booking calendar", {"id": "root"})
        finally:
            engine.model.forward = original

    def test_confident_prediction_becomes_canonical_intent_command(self):
        engine = BespokeInferenceEngine.get_instance()
        original = engine.model.forward
        engine.model.forward = lambda prompt, ast: {
            "action": "lock-nodes",
            "confidence": 0.93,
            "targetNodeIds": ["node-nav"],
            "dnaDeltas": {},
            "divergenceLevel": 40,
        }
        try:
            cmd = engine.infer_intent("lock the navigation bar", {"id": "root"})
        finally:
            engine.model.forward = original
        self.assertEqual(cmd["action"], "lock-nodes")
        self.assertEqual(cmd["targetNodeIds"], ["node-nav"])
        self.assertTrue(cmd["summary"])
        self.assertTrue(cmd["preserveLockedNodes"])
        # Only canonical IntentCommand keys (packages/schemas/src/intent.ts) may be emitted.
        allowed = {
            "action", "summary", "targetScreenId", "targetNodeIds", "preserveLockedNodes", "feelDescriptors",
            "dnaDeltas", "categoricalDna", "lockDimensions", "replacementResourceSlug", "explanation",
        }
        self.assertTrue(set(cmd).issubset(allowed), set(cmd) - allowed)

    def test_empty_prompt_and_brief_interpretation_are_explicit_refusals(self):
        engine = BespokeInferenceEngine.get_instance()
        with self.assertRaises(NotUnderstood):
            engine.infer_intent("   ", {})
        with self.assertRaises(NotUnderstood):
            engine.interpret_brief("A booking platform for clinics", {})


if __name__ == "__main__":
    unittest.main()
