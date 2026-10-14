"""
Unit tests for bespoke deep learning engine.
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "model"))
from inference import BespokeInferenceEngine, NotUnderstood  # noqa: E402

SCREEN = {
    "id": "root", "semanticRole": "sidebar-shell", "nodeType": "layout",
    "children": [
        {"id": "node-nav", "semanticRole": "app-navigation", "nodeType": "layout", "children": []},
        {"id": "node-header", "semanticRole": "page-header", "nodeType": "section", "children": []},
        {"id": "node-table", "semanticRole": "data-table", "nodeType": "section", "children": [], "locks": ["structure"]},
    ],
}
ALLOWED = {
    "action", "summary", "targetScreenId", "targetNodeIds", "preserveLockedNodes", "feelDescriptors",
    "dnaDeltas", "categoricalDna", "lockDimensions", "replacementResourceSlug", "explanation",
}


class TestBespokeModel(unittest.TestCase):
    def test_unrelated_or_gibberish_requests_are_refused_not_guessed(self):
        engine = BespokeInferenceEngine.get_instance()
        for prompt in ("what is the weather in paris", "asdf qwer zxcv"):
            with self.assertRaises(NotUnderstood):
                engine.infer_intent(prompt, SCREEN)

    def test_lock_the_named_section_becomes_a_canonical_command(self):
        cmd = BespokeInferenceEngine.get_instance().infer_intent("lock the table", SCREEN)
        self.assertEqual(cmd["action"], "lock-nodes")
        self.assertEqual(cmd["targetNodeIds"], ["node-table"])
        self.assertTrue(set(cmd).issubset(ALLOWED), set(cmd) - ALLOWED)

    def test_this_refers_to_the_selected_section(self):
        cmd = BespokeInferenceEngine.get_instance().infer_intent("lock this", SCREEN, "node-header")
        self.assertEqual(cmd["targetNodeIds"], ["node-header"])

    def test_lock_without_a_target_asks_for_one(self):
        with self.assertRaises(NotUnderstood):
            BespokeInferenceEngine.get_instance().infer_intent("lock this", SCREEN, None)

    def test_dna_direction_and_intensity(self):
        engine = BespokeInferenceEngine.get_instance()
        calmer = engine.infer_intent("make it calmer", SCREEN)
        self.assertEqual(calmer["action"], "adjust-dna")
        self.assertLess(calmer["dnaDeltas"]["motion"], 0)
        much = engine.infer_intent("make it much denser", SCREEN)["dnaDeltas"]["density"]
        slight = engine.infer_intent("make it slightly denser", SCREEN)["dnaDeltas"]["density"]
        self.assertGreater(much, slight)
        self.assertGreater(slight, 0)

    def test_feel_and_surprise(self):
        engine = BespokeInferenceEngine.get_instance()
        feel = engine.infer_intent("apply the calm precision feel", SCREEN)
        self.assertEqual(feel["action"], "apply-feel")
        self.assertEqual(feel["feelDescriptors"], "calm precision")
        self.assertEqual(engine.infer_intent("surprise me", SCREEN)["action"], "surprise-me")

    def test_unlock_everything_targets_locked_sections(self):
        cmd = BespokeInferenceEngine.get_instance().infer_intent("unlock everything", SCREEN)
        self.assertEqual(cmd["action"], "unlock-nodes")
        self.assertEqual(cmd["targetNodeIds"], ["node-table"])

    def test_empty_prompt_and_brief_interpretation_are_explicit_refusals(self):
        engine = BespokeInferenceEngine.get_instance()
        with self.assertRaises(NotUnderstood):
            engine.infer_intent("   ", {})
        with self.assertRaises(NotUnderstood):
            engine.interpret_brief("clinic app", {})

    def test_physio_brief_meets_phase_28_acceptance(self):
        engine = BespokeInferenceEngine.get_instance()
        out = engine.interpret_brief(
            "A booking platform for independent physiotherapy clinics. Patients book appointments and pay deposits; "
            "clinicians manage calendars, treatment notes and invoices. Calm, trustworthy, accessible for older users.",
            {},
        )
        self.assertEqual(out["kind"], "interpretation")
        self.assertIn(out["productModel"]["productArchetypes"][0]["tag"], {"healthcare-clinic", "booking-scheduling"})
        mentioned = {n for n, c in out["confidence"]["entities"].items() if c > 0.45}
        self.assertTrue({"Patient", "Appointment", "Clinician", "Invoice", "Deposit"} <= mentioned, mentioned)
        screen_types = {s["screenType"] for g in out["screenGraph"]["groups"] for s in g["screens"]}
        self.assertIn("booking-flow", screen_types)
        self.assertEqual(out["productModel"]["constraints"]["accessibilityFloor"], "AAA")
        self.assertTrue(out["modelVersion"])

    def test_promoted_model_card_reports_fresh_holdout_honestly(self):
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
        from tessellate_model.runtime import model_card

        card = model_card()
        self.assertEqual(card["gate"], "pass")
        self.assertEqual(card["intent"]["gate"], "pass")
        self.assertIn("freshHoldoutMetrics", card)
        self.assertIn("knownLimitations", card)


if __name__ == "__main__":
    unittest.main()
