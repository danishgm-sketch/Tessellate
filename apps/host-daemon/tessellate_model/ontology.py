"""Runtime view of the domain ontology: lookups by lemma/phrase plus a JSON export for the UI."""

import json
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Dict, List, Optional, Tuple

from . import ontology_source as src
from .text import lemma, tokenize


@dataclass(frozen=True)
class Archetype:
    id: str
    name: str
    keywords: Tuple[str, ...]
    audience: str
    objective: str
    priors: Dict[str, int]
    core_entities: Tuple[str, ...]
    extra_screens: Tuple[str, ...]
    capabilities: Tuple[str, ...]


@dataclass(frozen=True)
class Entity:
    id: str
    name: str
    synonyms: Tuple[str, ...]
    fields: Tuple[str, ...]
    patterns: Tuple[str, ...]
    description: str


def phrase_key(text: str) -> Tuple[str, ...]:
    """Lemma tuple used to match multi-word phrases regardless of plural/case."""
    return tuple(lemma(t.text) for t in tokenize(text) if t.text.isalnum() or "-" in t.text or "'" in t.text)


@dataclass
class Ontology:
    archetypes: Dict[str, Archetype]
    entities: Dict[str, Entity]
    patterns: Dict[str, dict]
    entity_phrases: Dict[Tuple[str, ...], List[str]] = field(default_factory=dict)
    keyword_phrases: Dict[Tuple[str, ...], List[str]] = field(default_factory=dict)
    max_phrase_len: int = 1

    def entity_candidates(self, words: Tuple[str, ...]) -> List[str]:
        return self.entity_phrases.get(words, [])

    def archetype_for_keyword(self, words: Tuple[str, ...]) -> List[str]:
        return self.keyword_phrases.get(words, [])

    def find_entity_phrases(self, lemmas: List[str]) -> List[Tuple[int, int, List[str]]]:
        """Greedy longest-match of ontology entity phrases in a lemma sequence → (start, end, entity ids)."""
        out, i = [], 0
        while i < len(lemmas):
            for n in range(min(self.max_phrase_len, len(lemmas) - i), 0, -1):
                ids = self.entity_phrases.get(tuple(lemmas[i:i + n]))
                if ids:
                    out.append((i, i + n, ids))
                    i += n
                    break
            else:
                i += 1
        return out

    def to_json(self) -> dict:
        return {
            "archetypes": {k: a.__dict__ | {"keywords": list(a.keywords), "core_entities": list(a.core_entities)} for k, a in self.archetypes.items()},
            "entities": {k: {"name": e.name, "synonyms": list(e.synonyms), "fields": list(e.fields), "patterns": list(e.patterns), "description": e.description} for k, e in self.entities.items()},
            "patterns": self.patterns,
        }


@lru_cache(maxsize=1)
def load() -> Ontology:
    archetypes = {
        k: Archetype(k, v[0], tuple(v[1]), v[2], v[3], dict(v[4]), tuple(v[5]), tuple(v[6]), tuple(v[7]))
        for k, v in src.ARCHETYPES.items()
    }
    entities = {k: Entity(k, v[0], tuple(v[1]), tuple(v[2]), tuple(v[3]), v[4]) for k, v in src.ENTITIES.items()}
    onto = Ontology(archetypes, entities, dict(src.SCREEN_PATTERNS))

    def add(index: Dict[Tuple[str, ...], List[str]], text: str, ident: str) -> None:
        key = phrase_key(text)
        if not key:
            return
        bucket = index.setdefault(key, [])
        if ident not in bucket:
            bucket.append(ident)
        onto.max_phrase_len = max(onto.max_phrase_len, len(key))

    for e in entities.values():
        add(onto.entity_phrases, e.name, e.id)
        add(onto.entity_phrases, e.id.replace("-", " "), e.id)
        for syn in e.synonyms:
            add(onto.entity_phrases, syn, e.id)
    for a in archetypes.values():
        for kw in a.keywords:
            add(onto.keyword_phrases, kw, a.id)
    return onto


def export_json(path: str) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(load().to_json(), f, indent=1, ensure_ascii=False)


def entity_by_id(entity_id: str) -> Optional[Entity]:
    return load().entities.get(entity_id)
