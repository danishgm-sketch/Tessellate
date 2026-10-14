"""
Workbench command model (D-034a, Phase 29): natural-language edit → canonical IntentCommand.

- Action: an averaged perceptron over lemma n-grams, trained on synthetic paraphrases, with an explicit
  "out-of-scope" class so unrelated text is refused instead of guessed.
- Targets: the selected section ("this", "it", "selected") or sections named by role words ("the header").
- Design DNA changes: a direction lexicon ("calmer", "denser", "rounder") with intensity modifiers
  ("much", "slightly") and negation ("less playful").

Standard library only. The output is validated again by the API (IntentCommandSchema).
"""

import random
import re
from typing import Dict, List, Optional, Tuple

from .classifier import AveragedPerceptron
from .text import lemma, tokenize

ACTIONS = ["recompose-screen", "rethink-screen", "adjust-dna", "apply-feel", "lock-nodes", "unlock-nodes",
           "replace-component", "surprise-me"]
OUT_OF_SCOPE = "out-of-scope"
CLASSES = ACTIONS + [OUT_OF_SCOPE]

# Direction words → Design DNA deltas (dimension names match DesignDNASchema).
DNA_LEXICON: Dict[str, Dict[str, int]] = {
    "calm": {"motion": -20, "motionPlayfulness": -15, "colourfulness": -10},
    "quiet": {"visualAmbition": -15, "colourfulness": -10, "motion": -10},
    "playful": {"playfulness": 20, "motionPlayfulness": 15, "curvature": 10},
    "serious": {"playfulness": -20, "professionalism": 15},
    "professional": {"professionalism": 20, "playfulness": -10},
    "dense": {"density": 20, "dataDensity": 15, "whitespace": -15},
    "compact": {"density": 20, "whitespace": -15},
    "spacious": {"whitespace": 20, "density": -15},
    "airy": {"whitespace": 20, "density": -15},
    "bold": {"visualAmbition": 20, "contrast": 10, "typographicExpression": 15},
    "striking": {"visualAmbition": 25, "typographicExpression": 15},
    "minimal": {"visualAmbition": -15, "whitespace": 15, "colourfulness": -10},
    "round": {"curvature": 25},
    "soft": {"curvature": 15, "contrast": -10, "depth": 10},
    "sharp": {"curvature": -25},
    "motion": {"motion": 20},
    "animated": {"motion": 20, "motionPlayfulness": 10},
    "colourful": {"colourfulness": 20},
    "colorful": {"colourfulness": 20},
    "vibrant": {"colourfulness": 20, "visualAmbition": 10},
    "warm": {"warmth": 20},
    "luxurious": {"luxury": 20, "whitespace": 10},
    "premium": {"luxury": 15, "visualAmbition": 10},
    "technical": {"technicality": 20},
    "editorial": {"editorial": 20, "typographicExpression": 10},
    "futuristic": {"futurism": 20},
    "contrast": {"contrast": 20},
    "trustworthy": {"trust": 20},
    "accessible": {"accessibilityPriority": 20, "contrast": 10},
    "fast": {"performancePriority": 20, "motion": -10},
    "deep": {"depth": 20},
    "flat": {"depth": -20},
}
_DNA_FORMS = {
    "calmer": "calm", "quieter": "quiet", "denser": "dense", "bolder": "bold", "rounder": "round", "rounded": "round",
    "softer": "soft", "sharper": "sharp", "warmer": "warm", "flatter": "flat", "deeper": "deep", "faster": "fast",
    "animation": "animated", "animations": "animated", "luxury": "luxurious", "colour": "colourful", "color": "colourful",
    "space": "spacious", "whitespace": "spacious", "tighter": "compact", "tight": "compact", "simpler": "minimal",
    "simple": "minimal", "cleaner": "minimal", "clean": "minimal", "fun": "playful", "funnier": "playful",
}
_LESS = {"less", "fewer", "reduce", "lower", "decrease", "tone", "dial", "remove", "without", "no"}
_STRONG = {"much", "lot", "very", "far", "way", "really", "significantly"}
_WEAK = {"slightly", "bit", "little", "touch", "somewhat", "subtly"}

# Role words a user might say → substrings of canonical semantic roles in the screen AST.
ROLE_WORDS: Dict[str, List[str]] = {
    "header": ["header", "navigation"], "nav": ["navigation"], "navigation": ["navigation"], "menu": ["navigation"],
    "sidebar": ["app-navigation", "sidebar"], "hero": ["hero"], "footer": ["footer"], "table": ["table"],
    "list": ["table", "list"], "chart": ["chart"], "graph": ["chart"], "kpi": ["metric", "kpi"], "metric": ["metric", "kpi"],
    "number": ["metric", "kpi"], "card": ["card", "metric"], "feed": ["feed", "activity"], "activity": ["activity", "feed"],
    "filter": ["filter"], "search": ["search"], "calendar": ["calendar"], "form": ["form"], "pricing": ["pricing"],
    "faq": ["faq"], "cta": ["cta"], "button": ["cta"], "feature": ["feature", "value-proposition"], "map": ["map"],
    "board": ["board"], "timeline": ["timeline"],
}
_THIS = {"this", "it", "selected", "selection", "that", "these", "them"}

_FEEL_PHRASES = ["calm precision", "modern editorial", "high density", "luxury without being flashy", "playful",
                 "minimal", "nocturne", "editorial", "technical", "warm", "premium", "calm", "bold", "clinical"]


def features(text: str) -> List[str]:
    lemmas = [lemma(t.text) for t in tokenize(text) if any(c.isalnum() for c in t.text)]
    lemmas = [_DNA_FORMS.get(l, l) for l in lemmas]
    feats = ["bias"] + [f"u={l}" for l in lemmas] + [f"bi={a}_{b}" for a, b in zip(lemmas, lemmas[1:])]
    feats += [f"first={lemmas[0]}"] if lemmas else []
    feats += [f"dna" for l in lemmas if l in DNA_LEXICON]
    feats += [f"role" for l in lemmas if l in ROLE_WORDS]
    feats += [f"this" for l in lemmas if l in _THIS]
    feats.append(f"len={min(len(lemmas), 12) // 3}")
    return feats


# ---------------------------------------------------------------------------------------------------------
# Synthetic training data
# ---------------------------------------------------------------------------------------------------------

_DNA_WORDS = ["calmer", "more playful", "denser", "more spacious", "bolder", "more minimal", "rounder", "sharper",
              "softer", "more colourful", "warmer", "more premium", "more technical", "more editorial", "less playful",
              "less motion", "more animated", "higher contrast", "more professional", "airier", "more serious",
              "flatter", "more vibrant", "quieter", "more futuristic", "more accessible", "less dense", "tighter"]
_MODS = ["", "", "", "much ", "slightly ", "a bit ", "a lot ", "way "]
_ROLES = list(ROLE_WORDS)
_FEELS = ["calm precision", "modern editorial", "luxury without being flashy", "playful", "minimal", "technical",
          "warm and friendly", "clinical and trustworthy", "premium", "bold and energetic", "nocturne", "high density"]

_TEMPLATES: Dict[str, List[str]] = {
    "adjust-dna": ["make it {m}{d}", "make the {r} {m}{d}", "can you make this {m}{d}", "{m}{d} please", "{d}",
                   "I want it {m}{d}", "make everything {m}{d}", "make this section {m}{d}", "go {m}{d}",
                   "the {r} should be {m}{d}", "try {m}{d}", "make the whole page {m}{d}", "{d} and {d2}",
                   "make it {d} and {d2}", "could it be {m}{d}"],
    "apply-feel": ["give it a {f} feel", "apply a {f} feel", "make it feel {f}", "use the {f} feel", "feel: {f}",
                   "I want a {f} look", "restyle it as {f}", "change the feel to {f}", "go for {f}",
                   "apply {f} style to the {r}", "make the vibe {f}", "switch to a {f} aesthetic"],
    "lock-nodes": ["lock this", "lock the {r}", "lock it", "freeze this section", "don't change the {r}",
                   "keep the {r} as it is", "lock the selected section", "protect the {r}", "pin this section",
                   "lock {r} and {r2}", "lock the {r} styling", "don't touch this", "keep this fixed", "lock this {r}"],
    "unlock-nodes": ["unlock this", "unlock the {r}", "unlock it", "unfreeze this section", "let the {r} change again",
                     "unlock everything", "unlock all sections", "remove the lock on the {r}", "unpin this",
                     "you can change the {r} now", "unlock the selected section", "release the lock"],
    "replace-component": ["replace this", "replace the {r}", "swap the {r} for something else", "use a different {r}",
                          "change this component", "try another {r}", "swap this out", "replace this {r} with a table",
                          "show me alternatives for the {r}", "use something else here", "swap the {r}",
                          "replace the selected section"],
    "recompose-screen": ["recompose this screen", "recompose the page", "rearrange the sections", "reorganise the layout",
                         "re-layout this screen", "redo the layout", "compose this screen again",
                         "rebuild the page around the locked parts", "recompose with {m}{d} sections",
                         "refresh the layout", "reflow the sections"],
    "rethink-screen": ["rethink this screen", "rethink the structure", "completely restructure the page",
                       "try a radically different layout", "reimagine this screen", "start this page over",
                       "give me a totally new structure", "rethink the whole layout", "a bold new structure please",
                       "rethink the page from scratch"],
    "surprise-me": ["surprise me", "show me something unexpected", "try something different", "give me a wild idea",
                    "show me a variation", "explore a different direction", "inspire me", "random variation please",
                    "surprise me with something {d}", "shake it up", "show me an alternative take"],
    OUT_OF_SCOPE: ["what time is it", "write me a poem", "hello", "thanks", "who are you", "how much does this cost",
                   "delete my account", "send an email to the team", "what is the capital of france",
                   "book a flight to paris", "asdf qwer zxcv", "lorem ipsum dolor sit amet", "tell me a joke",
                   "export to figma", "what's the weather", "run the tests", "translate this to spanish",
                   "order a pizza", "who won the match", "call my mum", "frobnicate the widget", "blah blah",
                   "how do I cook pasta", "summarise this article", "play some music", "ok", "yes", "no"],
}


def _fill(template: str, rng: random.Random) -> str:
    out = template
    for key, pool in (("{d2}", _DNA_WORDS), ("{d}", _DNA_WORDS), ("{r2}", _ROLES), ("{r}", _ROLES), ("{f}", _FEELS),
                      ("{m}", _MODS)):
        while key in out:
            out = out.replace(key, rng.choice(pool), 1)
    return re.sub(r"\s+", " ", out).strip()


def generate(n: int = 4000, seed: int = 7) -> List[Tuple[str, str]]:
    rng = random.Random(seed)
    data = []
    for i in range(n):
        action = CLASSES[i % len(CLASSES)]
        text = _fill(rng.choice(_TEMPLATES[action]), rng)
        if rng.random() < 0.3:
            text = rng.choice(["please ", "can you ", "could you ", "", "ok "]) + text
        if rng.random() < 0.3:
            text = text.capitalize()
        data.append((text, action))
    return data


def train(n: int = 4000, seed: int = 7, epochs: int = 12) -> AveragedPerceptron:
    clf = AveragedPerceptron(CLASSES)
    data = [(features(t), [a]) for t, a in generate(n, seed)]
    clf.train(data, epochs=epochs, seed=seed, log=lambda *_: None)
    clf.calibrate([(features(t), [a]) for t, a in generate(max(500, n // 5), seed + 1)])
    return clf


# ---------------------------------------------------------------------------------------------------------
# Inference helpers
# ---------------------------------------------------------------------------------------------------------

def dna_deltas(text: str) -> Dict[str, int]:
    words = [_DNA_FORMS.get(lemma(t.text), lemma(t.text)) for t in tokenize(text) if t.text.isalpha()]
    raw = [t.text.lower() for t in tokenize(text) if t.text.isalpha()]
    out: Dict[str, int] = {}
    for i, w in enumerate(words):
        if w not in DNA_LEXICON:
            continue
        window = set(raw[max(0, i - 3):i])
        sign = -1 if window & _LESS else 1
        scale = 1.5 if window & _STRONG else 0.5 if window & _WEAK else 1.0
        if w == "contrast" and raw[max(0, i - 1):i] == ["lower"]:
            sign = -1
        for dim, delta in DNA_LEXICON[w].items():
            out[dim] = max(-60, min(60, out.get(dim, 0) + int(round(sign * scale * delta))))
    return {k: v for k, v in out.items() if v}


def feel_phrase(text: str) -> Optional[str]:
    lower = text.lower()
    for phrase in _FEEL_PHRASES:
        if phrase in lower:
            return phrase
    m = re.search(r"(?:feel|look|style|vibe|aesthetic)(?: to| of| is|:)?\s+(?:a |an )?([a-z ,\-]{3,40})", lower)
    if m:
        return m.group(1).strip(" .,")
    m = re.search(r"(?:a|an)\s+([a-z ,\-]{3,40}?)\s+(?:feel|look|style|vibe|aesthetic)", lower)
    return m.group(1).strip() if m else None


def _walk(node: dict, out: List[dict]) -> None:
    if not isinstance(node, dict):
        return
    out.append(node)
    for child in node.get("children") or []:
        _walk(child, out)


def resolve_targets(text: str, screen_ast: dict, selected_node_id: Optional[str]) -> List[str]:
    words = [lemma(t.text) for t in tokenize(text) if t.text.isalpha()]
    nodes: List[dict] = []
    _walk(screen_ast or {}, nodes)
    sections = [n for n in nodes if n.get("id") and n.get("semanticRole") and n.get("nodeType") != "layout"
                or n.get("semanticRole") in ("navigation", "app-navigation")]
    named = [w for w in words if w in ROLE_WORDS]
    if named:
        hits = [n["id"] for n in sections
                if any(sub in str(n.get("semanticRole", "")) for w in named for sub in ROLE_WORDS[w])]
        if hits:
            return list(dict.fromkeys(hits))
    if selected_node_id and (set(words) & _THIS or not named):
        return [selected_node_id]
    return []
