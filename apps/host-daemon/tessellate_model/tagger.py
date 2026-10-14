"""
Span tagger (D-034a): averaged structured perceptron over BIO tags with Viterbi decoding.

Bespoke, dependency-free and fast to train on the owner's machine. Features combine the word, its lemma,
shape and affixes with a ±2-token context window and ontology lexicon hits, so the tagger recognises
domain nouns it has never seen from their position ("patients can book ___").
"""

import json
from collections import defaultdict
from typing import Dict, Iterable, List, Sequence, Tuple

from . import ontology_source as src
from .ontology import load
from .text import lemma, shape
from .synth import TAGS

_ACTORS = {lemma(w) for w in src.ACTOR_WORDS}
_VERBS = set(src.ACTION_VERBS)
_FEEL = set(src.FEEL_WORDS)
_CON_WORDS = {lemma(w) for phrase in src.CONSTRAINT_LEXICON for w in phrase.split()}
_DETERMINERS = {"the", "a", "an", "their", "all", "our", "your", "new", "past", "upcoming", "shared", "and", "or", ","}


def _allowed(prev: str, cur: str) -> bool:
    """BIO constraint: I-X may only follow B-X or I-X."""
    if cur.startswith("I-"):
        return prev[2:] == cur[2:] and prev != "O"
    return True


def token_features(tokens: Sequence[str], i: int, lexicon_hits: Sequence[bool]) -> List[str]:
    def tok(j: int) -> str:
        return tokens[j].lower() if 0 <= j < len(tokens) else ("<s>" if j < 0 else "</s>")

    def lem(j: int) -> str:
        return lemma(tokens[j]) if 0 <= j < len(tokens) else ("<s>" if j < 0 else "</s>")

    w, l = tok(i), lem(i)
    feats = [
        "b",
        f"w={w}",
        f"l={l}",
        f"sh={shape(tokens[i])}",
        f"s3={w[-3:]}",
        f"s2={w[-2:]}",
        f"p3={w[:3]}",
        f"pw={tok(i - 1)}",
        f"pl={lem(i - 1)}",
        f"ppw={tok(i - 2)}",
        f"nw={tok(i + 1)}",
        f"nl={lem(i + 1)}",
        f"nnw={tok(i + 2)}",
        f"pw|w={tok(i - 1)}|{w}",
        f"w|nw={w}|{tok(i + 1)}",
        f"lex={lexicon_hits[i]}",
        f"plex={lexicon_hits[i - 1] if i > 0 else False}",
        f"nlex={lexicon_hits[i + 1] if i + 1 < len(tokens) else False}",
        f"actor={l in _ACTORS}",
        f"verb={l in _VERBS}",
        f"pverb={lem(i - 1) in _VERBS or (lem(i - 1) in _DETERMINERS and lem(i - 2) in _VERBS)}",
        f"feel={w in _FEEL}",
        f"con={l in _CON_WORDS}",
        f"cap_mid={i > 0 and tokens[i][:1].isupper() and tok(i - 1) not in {'.', ';'}}",
        f"first={i == 0 or tok(i - 1) in {'.', ';', '!', '?'}}",
        f"punct={not any(c.isalnum() for c in tokens[i])}",
    ]
    return feats


def lexicon_hits(tokens: Sequence[str]) -> List[bool]:
    onto = load()
    lemmas = [lemma(t) for t in tokens]
    hits = [False] * len(tokens)
    for s, e, _ids in onto.find_entity_phrases(lemmas):
        for k in range(s, e):
            hits[k] = True
    return hits


class StructuredPerceptron:
    def __init__(self) -> None:
        self.weights: Dict[str, Dict[str, float]] = defaultdict(dict)  # feature → tag → weight
        self.trans: Dict[Tuple[str, str], float] = defaultdict(float)
        self._totals: Dict[Tuple[str, str], float] = defaultdict(float)
        self._stamps: Dict[Tuple[str, str], int] = defaultdict(int)
        self._ttotals: Dict[Tuple[str, str], float] = defaultdict(float)
        self._tstamps: Dict[Tuple[str, str], int] = defaultdict(int)
        self._step = 0

    # --- inference -------------------------------------------------------------------------------
    def _emissions(self, feats: List[List[str]]) -> List[Dict[str, float]]:
        out = []
        for fs in feats:
            scores = dict.fromkeys(TAGS, 0.0)
            for f in fs:
                row = self.weights.get(f)
                if row:
                    for t, w in row.items():
                        scores[t] += w
            out.append(scores)
        return out

    def predict(self, tokens: Sequence[str]) -> List[str]:
        if not tokens:
            return []
        hits = lexicon_hits(tokens)
        feats = [token_features(tokens, i, hits) for i in range(len(tokens))]
        return self._viterbi(self._emissions(feats))

    def predict_with_margins(self, tokens: Sequence[str]) -> Tuple[List[str], List[float]]:
        """Tags plus a per-token margin (best minus runner-up emission score) used as confidence."""
        if not tokens:
            return [], []
        hits = lexicon_hits(tokens)
        feats = [token_features(tokens, i, hits) for i in range(len(tokens))]
        em = self._emissions(feats)
        tags = self._viterbi(em)
        margins = []
        for scores, tag in zip(em, tags):
            others = [v for k, v in scores.items() if k != tag]
            margins.append(scores[tag] - max(others) if others else 0.0)
        return tags, margins

    def _viterbi(self, em: List[Dict[str, float]]) -> List[str]:
        n = len(em)
        best = [{t: (em[0][t] + self.trans.get(("<s>", t), 0.0) if _allowed("O", t) else float("-inf")) for t in TAGS}]
        back: List[Dict[str, str]] = [{}]
        for i in range(1, n):
            row, ptr = {}, {}
            for t in TAGS:
                cand = [(best[i - 1][p] + self.trans.get((p, t), 0.0), p) for p in TAGS if _allowed(p, t)]
                score, prev = max(cand)
                row[t], ptr[t] = score + em[i][t], prev
            best.append(row)
            back.append(ptr)
        tag = max(best[-1], key=best[-1].get)
        path = [tag]
        for i in range(n - 1, 0, -1):
            tag = back[i][tag]
            path.append(tag)
        return path[::-1]

    # --- training ------------------------------------------------------------------------------
    def _update_w(self, f: str, t: str, delta: float) -> None:
        key = (f, t)
        self._totals[key] += (self._step - self._stamps[key]) * self.weights[f].get(t, 0.0)
        self._stamps[key] = self._step
        self.weights[f][t] = self.weights[f].get(t, 0.0) + delta

    def _update_t(self, key: Tuple[str, str], delta: float) -> None:
        self._ttotals[key] += (self._step - self._tstamps[key]) * self.trans.get(key, 0.0)
        self._tstamps[key] = self._step
        self.trans[key] = self.trans.get(key, 0.0) + delta

    def train(self, data: Iterable[Tuple[List[str], List[str]]], epochs: int = 6, seed: int = 1, log=print) -> None:
        import random

        examples = list(data)
        rng = random.Random(seed)
        cached = []
        for tokens, gold in examples:
            hits = lexicon_hits(tokens)
            cached.append(([token_features(tokens, i, hits) for i in range(len(tokens))], gold))
        for epoch in range(epochs):
            rng.shuffle(cached)
            errors = total = 0
            for feats, gold in cached:
                self._step += 1
                guess = self._viterbi(self._emissions(feats))
                total += len(gold)
                if guess == gold:
                    continue
                for i, (g, p) in enumerate(zip(gold, guess)):
                    if g != p:
                        errors += 1
                        for f in feats[i]:
                            self._update_w(f, g, 1.0)
                            self._update_w(f, p, -1.0)
                    pg = gold[i - 1] if i else "<s>"
                    pp = guess[i - 1] if i else "<s>"
                    if (pg, g) != (pp, p):
                        self._update_t((pg, g), 1.0)
                        self._update_t((pp, p), -1.0)
            log(f"[tagger] epoch {epoch + 1}/{epochs} token error {errors / max(total, 1):.4f}")
        self._average()

    def _average(self) -> None:
        step = max(self._step, 1)
        for f, row in self.weights.items():
            for t in list(row):
                key = (f, t)
                total = self._totals[key] + (self._step - self._stamps[key]) * row[t]
                avg = total / step
                if abs(avg) < 1e-6:
                    del row[t]
                else:
                    row[t] = round(avg, 5)
        self.weights = defaultdict(dict, {f: r for f, r in self.weights.items() if r})
        for key in list(self.trans):
            total = self._ttotals[key] + (self._step - self._tstamps[key]) * self.trans[key]
            self.trans[key] = round(total / step, 5)

    # --- persistence ---------------------------------------------------------------------------
    def to_json(self) -> dict:
        return {"weights": self.weights, "trans": {f"{a}\t{b}": w for (a, b), w in self.trans.items() if w}}

    @classmethod
    def from_json(cls, data: dict) -> "StructuredPerceptron":
        m = cls()
        m.weights = defaultdict(dict, {f: dict(r) for f, r in data["weights"].items()})
        m.trans = defaultdict(float, {tuple(k.split("\t")): w for k, w in data["trans"].items()})
        return m

    def save(self, path: str) -> None:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.to_json(), f, separators=(",", ":"))

    @classmethod
    def load(cls, path: str) -> "StructuredPerceptron":
        with open(path, encoding="utf-8") as f:
            return cls.from_json(json.load(f))


def spans(tokens: Sequence[str], tags: Sequence[str]) -> List[Tuple[str, int, int]]:
    """BIO tags → (label, start, end) spans."""
    out, i = [], 0
    while i < len(tags):
        if tags[i].startswith("B-"):
            label, j = tags[i][2:], i + 1
            while j < len(tags) and tags[j] == f"I-{label}":
                j += 1
            out.append((label, i, j))
            i = j
        else:
            i += 1
    return out
