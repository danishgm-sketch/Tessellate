"""
Unit tests for bespoke deep learning engine.
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "model"))
from dataset import tokenize, flatten_ast, ACTIONS
from intent_network import BespokeIntentNetwork
from inference import BespokeInferenceEngine


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

    def test_inference_engine(self):
        engine = BespokeInferenceEngine.get_instance()
        res = engine.infer("lock the navigation bar", {"id": "root"})
        self.assertEqual(res["action"], "lock-nodes")

        res_surprise = engine.infer("surprise me with motion", {"id": "root"})
        self.assertEqual(res_surprise["action"], "surprise-me")


if __name__ == "__main__":
    unittest.main()
