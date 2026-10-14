"""
Archetype and intent classifiers (D-034a): averaged multiclass perceptrons with calibrated softmax scores.

Features are lemma unigrams/bigrams plus ontology signals (archetype keyword hits and grounded entities),
so a brief that never names its archetype ("patients book appointments with physiotherapists") still
lands in the right domain.
"""

import json
import math
import random
from collections import defaultdict
from typing import Dict, Iterable, List, Sequence, Tuple

from .ontology import load
from .text import lemma, tokenize

_STOP = {"a", "an", "the", "and", "or", "for", "to", "of", "in", "on", "with", "be", "it", "that", "is", "can", "will",
         "should", "able", "we", "our", "their", "they", "need", "want", "must", ",", ".", ";", "this", "by", "as", "at"}


def brief_features(text: str) -> List[str]:
    onto = load()
    toks = tokenize(text)
    lemmas = [lemma(t.text) for t in toks if any(c.isalnum() for c in t.text)]
    feats = ["bias"]
    content = [l for l in lemmas if l not in _STOP]
    # Opening-phrase salience: people name what they are building first ("Clinic rota app", "A bakery pre-order site").
    first = []
    for t in toks:
        if t.text in {".", ";", ":", "!", "?"}:
            break
        first.append(lemma(t.text))
    head = [l for l in first[:12] if l not in _STOP]
    feats += [f"h={l}" for l in head]
    j = 0
    while j < len(first):
        for n in range(min(5, len(first) - j), 0, -1):
            arches = onto.keyword_phrases.get(tuple(first[j:j + n]))
            if arches:
                feats += [f"hkw={a}" for a in arches]
                j += n
                break
        else:
            j += 1
    feats += [f"u={l}" for l in content]
    feats += [f"bi={a}_{b}" for a, b in zip(content, content[1:])]
    # Ontology keyword phrases (longest first).
    i = 0
    while i < len(lemmas):
        for n in range(min(5, len(lemmas) - i), 0, -1):
            arches = onto.keyword_phrases.get(tuple(lemmas[i:i + n]))
            if arches:
                feats += [f"kw={a}" for a in arches]
                i += n
                break
        else:
            i += 1
    for _s, _e, ids in onto.find_entity_phrases(lemmas):
        feats += [f"ent={x}" for x in ids]
    return feats


class AveragedPerceptron:
    def __init__(self, classes: Sequence[str]) -> None:
        self.classes = list(classes)
        self.weights: Dict[str, Dict[str, float]] = defaultdict(dict)
        self._totals: Dict[Tuple[str, str], float] = defaultdict(float)
        self._stamps: Dict[Tuple[str, str], int] = defaultdict(int)
        self._step = 0
        self.temperature = 1.0

    def scores(self, feats: Iterable[str]) -> Dict[str, float]:
        s = dict.fromkeys(self.classes, 0.0)
        for f in feats:
            row = self.weights.get(f)
            if row:
                for c, w in row.items():
                    s[c] += w
        return s

    def probabilities(self, feats: Iterable[str]) -> List[Tuple[str, float]]:
        s = self.scores(feats)
        m = max(s.values())
        exps = {c: math.exp((v - m) / self.temperature) for c, v in s.items()}
        z = sum(exps.values()) or 1.0
        return sorted(((c, e / z) for c, e in exps.items()), key=lambda x: -x[1])

    def _upd(self, f: str, c: str, d: float) -> None:
        key = (f, c)
        self._totals[key] += (self._step - self._stamps[key]) * self.weights[f].get(c, 0.0)
        self._stamps[key] = self._step
        self.weights[f][c] = self.weights[f].get(c, 0.0) + d

    def train(self, data: List[Tuple[List[str], List[str]]], epochs: int = 8, seed: int = 3, log=print) -> None:
        """data: (features, gold classes); multi-label examples update toward the best-scoring gold class."""
        rng = random.Random(seed)
        data = list(data)
        for epoch in range(epochs):
            rng.shuffle(data)
            wrong = 0
            for feats, gold in data:
                self._step += 1
                s = self.scores(feats)
                guess = max(s, key=s.get)
                if guess in gold:
                    continue
                wrong += 1
                target = max(gold, key=lambda g: s[g])
                for f in feats:
                    self._upd(f, target, 1.0)
                    self._upd(f, guess, -1.0)
            log(f"[classifier] epoch {epoch + 1}/{epochs} error {wrong / max(len(data), 1):.4f}")
        step = max(self._step, 1)
        for f, row in self.weights.items():
            for c in list(row):
                key = (f, c)
                avg = (self._totals[key] + (self._step - self._stamps[key]) * row[c]) / step
                if abs(avg) < 1e-6:
                    del row[c]
                else:
                    row[c] = round(avg, 5)
        self.weights = defaultdict(dict, {f: r for f, r in self.weights.items() if r})

    def calibrate(self, data: List[Tuple[List[str], List[str]]]) -> None:
        """Picks a softmax temperature that minimises negative log-likelihood on held-out data."""
        best = (float("inf"), 1.0)
        for t in [0.05, 0.1, 0.2, 0.3, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0]:
            self.temperature = t
            nll = 0.0
            for feats, gold in data:
                probs = dict(self.probabilities(feats))
                nll -= math.log(max(sum(probs[g] for g in gold), 1e-9))
            best = min(best, (nll, t))
        self.temperature = best[1]

    def to_json(self) -> dict:
        return {"classes": self.classes, "temperature": self.temperature, "weights": self.weights}

    @classmethod
    def from_json(cls, data: dict) -> "AveragedPerceptron":
        m = cls(data["classes"])
        m.temperature = data.get("temperature", 1.0)
        m.weights = defaultdict(dict, {f: dict(r) for f, r in data["weights"].items()})
        return m

    def save(self, path: str) -> None:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.to_json(), f, separators=(",", ":"))

    @classmethod
    def load(cls, path: str) -> "AveragedPerceptron":
        with open(path, encoding="utf-8") as f:
            return cls.from_json(json.load(f))
