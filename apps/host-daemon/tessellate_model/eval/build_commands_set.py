"""
Held-out Workbench command set (Phase 29). Written by hand in phrasing the template generator does not use;
never used for tuning. Run this file to regenerate commands.jsonl.
"""

import json
import os

# (command, gold action, expected DNA dimensions that must move and in which direction)
COMMANDS = [
    ("tone down the animation a little", "adjust-dna", {"motion": -1}),
    ("I'd like this to look a lot more spacious", "adjust-dna", {"whitespace": 1}),
    ("crank up the contrast", "adjust-dna", {"contrast": 1}),
    ("this feels too busy, make it calmer", "adjust-dna", {"motion": -1}),
    ("make the corners rounder", "adjust-dna", {"curvature": 1}),
    ("sharper edges please", "adjust-dna", {"curvature": -1}),
    ("pack more data onto the dashboard, denser", "adjust-dna", {"density": 1}),
    ("less playful, it's for a bank", "adjust-dna", {"playfulness": -1}),
    ("could the colours be more vibrant", "adjust-dna", {"colourfulness": 1}),
    ("a touch warmer", "adjust-dna", {"warmth": 1}),
    ("make it way bolder", "adjust-dna", {"visualAmbition": 1}),
    ("reduce the motion", "adjust-dna", {"motion": -1}),
    ("more professional overall", "adjust-dna", {"professionalism": 1}),
    ("make it feel like a luxury hotel brand", "apply-feel", {}),
    ("apply the calm precision feel", "apply-feel", {}),
    ("give the whole thing an editorial magazine look", "apply-feel", {}),
    ("restyle with a nocturne aesthetic", "apply-feel", {}),
    ("change the vibe to warm and friendly", "apply-feel", {}),
    ("lock the navigation so it stays put", "lock-nodes", {}),
    ("keep this exactly as it is", "lock-nodes", {}),
    ("freeze the hero", "lock-nodes", {}),
    ("don't let anything change the footer", "lock-nodes", {}),
    ("lock the table", "lock-nodes", {}),
    ("unlock the hero section", "unlock-nodes", {}),
    ("you can edit the navigation again", "unlock-nodes", {}),
    ("unfreeze everything", "unlock-nodes", {}),
    ("take the lock off this", "unlock-nodes", {}),
    ("swap this chart for another one", "replace-component", {}),
    ("I don't like this table, show me other options", "replace-component", {}),
    ("use a different hero", "replace-component", {}),
    ("replace the footer", "replace-component", {}),
    ("try a different component here", "replace-component", {}),
    ("recompose the dashboard keeping the locked bits", "recompose-screen", {}),
    ("reorganise this page", "recompose-screen", {}),
    ("rearrange the layout of this screen", "recompose-screen", {}),
    ("redo this screen's layout", "recompose-screen", {}),
    ("throw it all out and rethink the structure", "rethink-screen", {}),
    ("reimagine the page completely", "rethink-screen", {}),
    ("give me a radically different structure", "rethink-screen", {}),
    ("surprise me!", "surprise-me", {}),
    ("show me something I wouldn't expect", "surprise-me", {}),
    ("explore a variation", "surprise-me", {}),
    ("inspire me with an alternative", "surprise-me", {}),
    ("what's the weather in London", "out-of-scope", {}),
    ("please email this to my client", "out-of-scope", {}),
    ("who made Tessellate", "out-of-scope", {}),
    ("good morning", "out-of-scope", {}),
    ("convert this to a PDF invoice", "out-of-scope", {}),
    ("qwerty uiop", "out-of-scope", {}),
    ("how many users signed up today", "out-of-scope", {}),
]

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "commands.jsonl")
    with open(out, "w", encoding="utf-8") as f:
        for text, action, dna in COMMANDS:
            f.write(json.dumps({"command": text, "action": action, "dna": dna}, ensure_ascii=False) + "\n")
    print(f"{len(COMMANDS)} commands written to {out}")
