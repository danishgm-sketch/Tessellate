"""
Text utilities for the bespoke model (D-034): tokenisation with character offsets, a small rule-based
English lemmatiser (enough to ground plural nouns and verb forms), and word-shape features.
Standard library only.
"""

import re
from dataclasses import dataclass
from typing import List

_TOKEN_RE = re.compile(r"[A-Za-z][A-Za-z'\-]*[A-Za-z]|[A-Za-z]|\d+(?:[.,]\d+)?|[^\sA-Za-z\d]")

# Irregular or tricky forms that suffix rules get wrong.
_IRREGULAR = {
    "people": "person", "children": "child", "men": "man", "women": "woman", "staff": "staff",
    "analyses": "analysis", "diagnoses": "diagnosis", "data": "data", "media": "media", "news": "news",
    "series": "series", "species": "species", "status": "status", "business": "business",
    "process": "process", "address": "address", "class": "class", "access": "access", "canvas": "canvas",
    "campus": "campus", "bus": "bus", "gas": "gas", "analytics": "analytics", "logistics": "logistics",
    "settings": "settings", "physics": "physics", "is": "be", "are": "be", "was": "be", "were": "be",
    "has": "have", "had": "have", "does": "do", "did": "do", "paid": "pay", "sold": "sell", "bought": "buy",
    "booked": "book", "led": "lead", "fed": "feed", "kept": "keep", "sent": "send", "built": "build",
    "taught": "teach", "chose": "choose", "made": "make", "ran": "run", "wrote": "write", "written": "write",
    "lives": "life", "leaves": "leave", "invoices": "invoice", "services": "service", "courses": "course",
    "houses": "house", "purchases": "purchase", "responses": "response", "licences": "licence",
    "licenses": "license", "expenses": "expense", "releases": "release", "cases": "case", "phases": "phase",
    "databases": "database", "uses": "use", "nurses": "nurse", "bases": "base", "places": "place",
    "devices": "device", "prices": "price", "sources": "source", "resources": "resource", "spaces": "space",
    "pages": "page", "images": "image", "messages": "message", "packages": "package", "stages": "stage",
    "notes": "note", "quotes": "quote", "routes": "route", "votes": "vote", "sites": "site", "rates": "rate",
    "dates": "date", "templates": "template", "updates": "update", "estates": "estate", "candidates": "candidate",
    "clients": "client", "patients": "patient", "appointments": "appointment", "deposits": "deposit",
}

_KEEP_S = ("ss", "us", "is", "ous")


def lemma(word: str) -> str:
    """Lower-cased lemma with plural/verb inflection stripped (rule-based, deterministic)."""
    w = word.lower().strip("'")
    if w in _IRREGULAR:
        return _IRREGULAR[w]
    if len(w) <= 3:
        return w
    if w.endswith("ies") and len(w) > 4:
        return w[:-3] + "y"
    if w.endswith("zes") and len(w) > 4 and w[-4] in "aeiou":
        return w[:-1]  # sizes → size, prizes → prize
    if w.endswith(("sses", "shes", "ches", "xes", "zes")):
        return w[:-2]
    if w.endswith("s") and not w.endswith(_KEEP_S):
        return w[:-1]
    if w.endswith("ing") and len(w) > 5:
        stem = w[:-3]
        if len(stem) > 2 and stem[-1] == stem[-2] and stem[-1] not in "lsz":
            stem = stem[:-1]
        return stem
    if w.endswith("ed") and len(w) > 4:
        stem = w[:-2]
        if stem.endswith("i"):
            return stem[:-1] + "y"
        if len(stem) > 2 and stem[-1] == stem[-2] and stem[-1] not in "lsz":
            return stem[:-1]
        return stem
    return w


@dataclass
class Token:
    text: str
    start: int
    end: int

    @property
    def lower(self) -> str:
        return self.text.lower()

    @property
    def lemma(self) -> str:
        return lemma(self.text)


def tokenize(text: str) -> List[Token]:
    return [Token(m.group(0), m.start(), m.end()) for m in _TOKEN_RE.finditer(text)]


def shape(word: str) -> str:
    """Collapsed word shape: 'Physio' → 'Xx', 'GDPR' → 'X', '24' → 'd', '&' → '&'."""
    out = []
    for ch in word:
        c = "X" if ch.isupper() else "x" if ch.islower() else "d" if ch.isdigit() else ch
        if not out or out[-1] != c:
            out.append(c)
    return "".join(out)[:4]


def sentences(text: str) -> List[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?;])\s+|\n+", text) if s.strip()]
