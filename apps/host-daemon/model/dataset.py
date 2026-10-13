"""
Tessellate Bespoke ML Engine - Domain Dataset & Vocabulary
Provides vocabulary mapping, tokenization, AST flattening, and synthetic training pairs.
Zero external LLM / transformer dependencies.
"""

import json
import re
from typing import Dict, List, Tuple, Any

ACTIONS = [
    "recompose-screen",
    "rethink-screen",
    "adjust-dna",
    "apply-feel",
    "lock-nodes",
    "unlock-nodes",
    "replace-component",
    "surprise-me",
]

ACTION_TO_IDX = {a: i for i, a in enumerate(ACTIONS)}
IDX_TO_ACTION = {i: a for i, a in enumerate(ACTIONS)}

SEMANTIC_ROLES = [
    "unknown",
    "navigation",
    "header",
    "hero",
    "metric",
    "analytics",
    "table",
    "card",
    "feed",
    "footer",
    "sidebar",
    "form",
    "action",
    "modal",
    "filter",
    "content",
]
ROLE_TO_IDX = {r: i for i, r in enumerate(SEMANTIC_ROLES)}

DNA_DIMENSIONS = [
    "dataDensity",
    "trust",
    "interactionDensity",
    "visualAmbition",
    "motion",
    "typographicExpression",
    "imageryIntensity",
    "depth",
    "colorSaturation",
    "radiusScale",
    "borderWeight",
    "contrastFloor",
]
DNA_TO_IDX = {d: i for i, d in enumerate(DNA_DIMENSIONS)}

VOCABULARY = [
    "<PAD>", "<UNK>", "<BOS>", "<EOS>",
    "recompose", "rethink", "screen", "layout", "density", "higher", "lower",
    "data", "calm", "precision", "motion", "reduce", "increase", "playful",
    "lock", "unlock", "nodes", "header", "navigation", "nav", "hero", "banner",
    "metric", "cards", "table", "feed", "activity", "replace", "swap", "component",
    "surprise", "divergence", "modern", "editorial", "minimal", "dense", "compact",
    "expressive", "nocturne", "fintech", "saas", "dashboard", "analytics", "feel",
    "trust", "contrast", "vibrant", "dark", "light", "typography", "bold", "clean",
    "restructure", "update", "change", "adjust", "dna", "tokens", "make", "with",
    "and", "the", "this", "all", "selected", "current", "more", "less", "style",
]
WORD_TO_IDX = {w: i for i, w in enumerate(VOCABULARY)}
IDX_TO_WORD = {i: w for i, w in enumerate(VOCABULARY)}


def tokenize(text: str, max_len: int = 24) -> List[int]:
    """Tokenize a natural-language prompt into fixed-length integer token IDs."""
    words = re.findall(r"\b[a-zA-Z0-9_\-]+\b", text.lower())
    tokens = [WORD_TO_IDX.get("<BOS>", 2)]
    for w in words:
        tokens.append(WORD_TO_IDX.get(w, WORD_TO_IDX["<UNK>"]))
        if len(tokens) >= max_len - 1:
            break
    tokens.append(WORD_TO_IDX.get("<EOS>", 3))
    while len(tokens) < max_len:
        tokens.append(WORD_TO_IDX.get("<PAD>", 0))
    return tokens[:max_len]


def flatten_ast(node: Dict[str, Any], max_nodes: int = 16) -> Tuple[List[List[float]], List[List[int]], List[str]]:
    """
    Traverse a screen AST and extract:
    1. Node feature vectors [node_type, role_idx, is_locked, depth, has_children]
    2. Adjacency pairs [[src, dst], ...]
    3. List of node IDs
    """
    node_features = []
    node_ids = []
    edges = []

    def traverse(curr: Dict[str, Any], depth: int = 0, parent_idx: int = -1):
        if len(node_ids) >= max_nodes:
            return
        idx = len(node_ids)
        nid = curr.get("id", f"node-{idx}")
        node_ids.append(nid)

        role = curr.get("semanticRole", "unknown").lower()
        role_idx = ROLE_TO_IDX.get(role, 0)
        is_locked = 1.0 if curr.get("locked") else 0.0
        children = curr.get("children", [])
        has_children = 1.0 if len(children) > 0 else 0.0

        feat = [
            float(depth) / 5.0,
            float(role_idx) / float(len(SEMANTIC_ROLES)),
            is_locked,
            has_children,
            1.0 if curr.get("resourceRef") else 0.0,
        ]
        node_features.append(feat)

        if parent_idx >= 0:
            edges.append([parent_idx, idx])
            edges.append([idx, parent_idx])

        for child in children:
            traverse(child, depth + 1, idx)

    traverse(node)

    # Pad up to max_nodes
    while len(node_features) < max_nodes:
        node_features.append([0.0, 0.0, 0.0, 0.0, 0.0])
        node_ids.append("")

    return node_features, edges, node_ids


def generate_synthetic_samples() -> List[Dict[str, Any]]:
    """Generates canonical synthetic training pairs for the Tessellate domain."""
    samples = [
        {
            "prompt": "recompose screen with higher data density",
            "action": "recompose-screen",
            "dna_deltas": {"dataDensity": 25, "interactionDensity": 15},
            "divergence": 50,
            "feel": "",
            "target_role": "unknown",
        },
        {
            "prompt": "rethink the layout with high divergence",
            "action": "rethink-screen",
            "dna_deltas": {"visualAmbition": 30, "motion": 20},
            "divergence": 85,
            "feel": "",
            "target_role": "unknown",
        },
        {
            "prompt": "make it feel calm and precise with reduced motion",
            "action": "apply-feel",
            "dna_deltas": {"motion": -30, "trust": 20, "contrastFloor": 10},
            "divergence": 30,
            "feel": "calm precision",
            "target_role": "unknown",
        },
        {
            "prompt": "surprise me with expressive typography and rich visual style",
            "action": "surprise-me",
            "dna_deltas": {"typographicExpression": 35, "visualAmbition": 40, "imageryIntensity": 25},
            "divergence": 75,
            "feel": "expressive",
            "target_role": "unknown",
        },
        {
            "prompt": "lock navigation and header nodes",
            "action": "lock-nodes",
            "dna_deltas": {},
            "divergence": 0,
            "feel": "",
            "target_role": "navigation",
        },
        {
            "prompt": "unlock all locked nodes in the screen",
            "action": "unlock-nodes",
            "dna_deltas": {},
            "divergence": 0,
            "feel": "",
            "target_role": "unknown",
        },
        {
            "prompt": "replace metric card with advanced analytics data display",
            "action": "replace-component",
            "dna_deltas": {"dataDensity": 20},
            "divergence": 40,
            "feel": "",
            "target_role": "metric",
            "replacement": "advanced-data-table",
        },
        {
            "prompt": "adjust design dna for modern editorial fintech style",
            "action": "adjust-dna",
            "dna_deltas": {"trust": 30, "contrastFloor": 25, "borderWeight": 15},
            "divergence": 35,
            "feel": "fintech editorial",
            "target_role": "unknown",
        },
        {
            "prompt": "increase visual ambition and motion playfulness",
            "action": "adjust-dna",
            "dna_deltas": {"visualAmbition": 30, "motion": 35},
            "divergence": 40,
            "feel": "playful",
            "target_role": "unknown",
        },
        {
            "prompt": "swap hero banner for compact app header",
            "action": "replace-component",
            "dna_deltas": {"dataDensity": 15},
            "divergence": 30,
            "feel": "",
            "target_role": "hero",
            "replacement": "app-header",
        },
    ]
    return samples
