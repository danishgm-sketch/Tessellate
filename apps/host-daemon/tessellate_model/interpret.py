"""
Brief interpretation (D-033/D-034): free-text product brief → ProductModel + ScreenGraph + review data.

Pipeline: span tagger (entities, actors, actions, constraints, feel) → archetype classifier → ontology
grounding → screen planning from entity patterns and verbs → priors blended from archetype probabilities
and adjusted by constraints. Every inference carries a confidence so the Workbench "Review inferred
product" step can highlight what the user should check. Output shapes match packages/schemas.
"""

import math
import re
from collections import OrderedDict
from typing import Dict, List, Optional, Tuple

from . import ontology_source as src
from .classifier import AveragedPerceptron, brief_features
from .ontology import Ontology, load, phrase_key
from .tagger import StructuredPerceptron, spans
from .text import lemma, sentences, tokenize

SCHEMA_VERSION = "1.0.0"

# Verbs that imply specific screens for the entity they act on.
VERB_PATTERNS = {
    "book": ["booking", "calendar"], "reserve": ["booking", "calendar"], "schedule": ["calendar"],
    "reschedule": ["calendar"], "cancel": ["detail"], "pay": ["checkout"], "buy": ["catalog", "checkout"],
    "order": ["catalog", "checkout"], "donate": ["checkout"], "browse": ["catalog"], "find": ["catalog"],
    "search": ["catalog"], "track": ["collection", "analytics"], "monitor": ["analytics"], "analyse": ["analytics"],
    "analyze": ["analytics"], "report": ["analytics"], "compare": ["analytics"], "message": ["thread"],
    "chat": ["thread"], "create": ["create"], "submit": ["create"], "apply": ["create"], "write": ["editor"],
    "edit": ["editor"], "publish": ["editor"], "plan": ["board", "calendar"], "assign": ["board"],
    "dispatch": ["map", "board"], "list": ["create", "catalog"], "sell": ["create", "catalog"], "invoice": ["create"],
    "quote": ["create"], "approve": ["board"], "review": ["detail"], "manage": ["collection", "detail"],
}

VERB_STEPS = {
    "book": ["Choose a service", "Pick a time", "Enter details", "Confirm"],
    "reserve": ["Pick a date", "Choose options", "Enter details", "Confirm"],
    "pay": ["Review amount", "Enter payment details", "Confirm payment", "Receive receipt"],
    "buy": ["Browse", "Add to cart", "Check out", "Track order"],
    "order": ["Browse", "Add to order", "Check out", "Track progress"],
    "donate": ["Choose amount", "Enter details", "Pay", "Get thank-you"],
    "apply": ["Fill in the form", "Upload documents", "Submit", "Track decision"],
    "manage": ["Open list", "Filter and find", "Edit details", "Save"],
    "track": ["Open overview", "Filter", "Inspect details"],
    "create": ["Start new", "Fill in details", "Save"],
}

FALLBACK_STEPS = ["Open", "Find the right {name}", "Act on it", "Confirm"]

SHELL_SCREENS = [
    ("screen-marketing-home", "Home", "marketing", "/", "Explain the product and convert visitors.", "marketing", True),
    ("screen-sign-in", "Sign in", "authentication", "/sign-in", "Let people sign in or create an account.", "authentication", True),
    ("screen-settings", "Settings", "settings", "/settings", "Profile, notifications and preferences.", "settings", True),
]

GROUP_FOR_TYPE = {
    "marketing": "marketing", "authentication": "authentication", "settings": "settings",
    "billing-account": "settings", "booking-flow": "public", "checkout-transaction": "public",
    "search-explore": "public",
}


# Words that name a screen or the product itself rather than a record the product manages.
_INTERFACE_WORDS = {"calendar", "diary", "dashboard", "app", "application", "platform", "portal", "website", "site", "page",
                    "screen", "view", "tool", "system", "interface", "inbox", "feed", "homepage", "setting", "settings",
                    "onboarding", "marketing"}


def _feel_lemmas() -> set:
    from .ontology_source import FEEL_WORDS
    return {lemma(w) for w in FEEL_WORDS}


_FEEL_LEMMAS = _feel_lemmas()


def _plural(word: str) -> str:
    if word.endswith("y") and word[-2:-1] not in "aeiou":
        return word[:-1] + "ies"
    if word.endswith(("s", "sh", "ch", "x")):
        return word + "es"
    return word + "s"


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def _title(text: str) -> str:
    return " ".join(w[:1].upper() + w[1:] for w in text.split())


def _article(word: str) -> str:
    return ("an " if word[:1].lower() in "aeiou" else "a ") + word.lower()


_VERB_LEMMAS = set(src.ACTION_VERBS)
_SPAN_STOP = {"the", "a", "an", "their", "our", "your", "its", "all", "each", "every", "and", "or", "of", "for", "to",
              "out", "up", "in", "on", "off", "get", "it", "them", "secure", "new", "past", "upcoming", "online"}
_TRAILING_ADVERBS = {"live", "offline", "online", "nearby", "instantly", "automatically", "weekly", "daily", "monthly",
                     "together", "securely", "quickly", "easily", "free"}
# Heads too generic to name an entity on their own: "artist pages" → Artist, "card controls" → Card.
_GENERIC_HEADS = {"page", "control", "stage", "history", "view", "detail", "screen", "section", "tab", "area", "chart",
                  "update", "statuse", "status"}


def clean_span(words: List[str]) -> List[str]:
    """Trims leading/trailing function words, trailing adverbs, and anything from an uninflected verb onward."""
    out = list(words)
    for i in range(1, len(out)):
        w = out[i].lower()
        if w in _VERB_LEMMAS and lemma(w) == w and i < len(out):
            out = out[:i]
            break
    while out and (out[0].lower() in _SPAN_STOP):
        out = out[1:]
    while out and (out[-1].lower() in _SPAN_STOP or out[-1].lower() in _TRAILING_ADVERBS):
        out = out[:-1]
    if len(out) > 1 and lemma(out[-1]) in _GENERIC_HEADS:
        out = out[:-1]
    return out


class BriefInterpreter:
    def __init__(self, tagger: StructuredPerceptron, archetypes: AveragedPerceptron, ontology: Optional[Ontology] = None):
        self.tagger = tagger
        self.archetypes = archetypes
        self.onto = ontology or load()

    # ------------------------------------------------------------------ entities
    def _ground(self, phrase: List[str], arche_probs: Dict[str, float]) -> Tuple[Optional[str], float]:
        """Ground a span to an ontology entity, preferring entities of likely archetypes."""
        lemmas = [lemma(w[2:] if w.lower().startswith("e-") and len(w) > 4 else w) for w in phrase]
        for start in range(len(lemmas)):  # drop leading modifiers ("independent", "upcoming") until a phrase matches
            ids = self.onto.entity_candidates(tuple(lemmas[start:]))
            if ids:
                def score(eid: str) -> float:
                    return sum(p for a, p in arche_probs.items() if eid in self.onto.archetypes[a].core_entities)
                best = max(ids, key=score)
                return best, 1.0 if start == 0 else 0.9
        return None, 0.0

    def interpret(self, brief: str) -> dict:
        text = brief.strip()
        toks = [t.text for t in tokenize(text)]
        tags, margins = self.tagger.predict_with_margins(toks)
        found = spans(toks, tags)

        probs = self.archetypes.probabilities(brief_features(text))
        arche_probs = dict(probs[:5])
        top = [(a, p) for a, p in probs[:3] if p >= 0.08] or probs[:1]
        primary = top[0][0]
        arch = self.onto.archetypes[primary]

        assumptions: List[str] = []
        entity_conf: Dict[str, float] = OrderedDict()
        entities: "OrderedDict[str, dict]" = OrderedDict()
        verbs_for_entity: Dict[str, List[str]] = {}
        workflows: List[dict] = []
        actors: List[str] = []
        feel_words: List[str] = []
        constraint_phrases: List[str] = []

        def margin_conf(s: int, e: int) -> float:
            # Averaged-perceptron margins are small numbers; map them smoothly into (0.55, 0.95).
            m = min(margins[s:e]) if e > s else 0.0
            return round(0.55 + 0.4 * math.tanh(max(m, 0.0) / 2.0), 3)

        # Walk spans in order, linking each entity to the nearest preceding verb in the same clause.
        current_verb: Optional[str] = None
        for label, s, e in found:
            phrase = toks[s:e]
            if label == "VRB":
                current_verb = lemma(phrase[0])
            elif label == "ACT":
                phrase = clean_span(phrase) or phrase
                actors.append(" ".join(phrase).lower())
                current_verb = None
                # People who are also records the product manages (patients, members, tenants) become entities.
                eid, gconf = self._ground(phrase, arche_probs)
                if eid and eid not in entities:
                    ent = self.onto.entities[eid]
                    entities[eid] = {"name": ent.name, "description": ent.description, "fields": list(ent.fields), "_patterns": list(ent.patterns)}
                    entity_conf[ent.name] = round(margin_conf(s, e) * gconf * 0.95, 2)
            elif label == "FEEL":
                feel_words.append(" ".join(phrase).lower())
            elif label == "CON":
                constraint_phrases.append(" ".join(phrase).lower())
            elif label == "ENT":
                phrase = clean_span(phrase)
                if not phrase:
                    continue
                if len(phrase) == 1 and lemma(phrase[0]) in _VERB_LEMMAS and not self.onto.entity_candidates((lemma(phrase[0]),)):
                    continue  # a verb mis-tagged as an entity
                eid, gconf = self._ground(phrase, arche_probs)
                conf = margin_conf(s, e) * (gconf if eid else 0.85)
                if eid:
                    ent = self.onto.entities[eid]
                    key, name, fields, patterns, desc = eid, ent.name, list(ent.fields), list(ent.patterns), ent.description
                else:
                    head = lemma(phrase[-1])
                    if head in _INTERFACE_WORDS or any(lemma(w) in _FEEL_LEMMAS for w in phrase):
                        continue  # screens ("dashboard") and qualities ("fast", "settings conservative") are not records
                    name = _title(" ".join([w.lower() for w in phrase[:-1]] + [head]))
                    key, fields, patterns = _slug(name), ["name", "status", "created", "notes"], ["collection", "detail"]
                    desc = f"A {name.lower()} in this product."
                    assumptions.append(f"\"{name}\" is not in Tessellate's domain vocabulary yet; it was treated as a record you list and edit.")
                if key not in entities:
                    entities[key] = {"name": name, "description": desc, "fields": fields, "_patterns": patterns}
                    entity_conf[name] = round(conf, 2)
                if current_verb:
                    verbs_for_entity.setdefault(key, []).append(current_verb)

        # Archetype core entities the brief did not mention are offered as low-confidence suggestions.
        for eid in arch.core_entities[:5]:
            if eid not in entities and len(entities) < 8:
                ent = self.onto.entities[eid]
                entities[eid] = {"name": ent.name, "description": ent.description, "fields": list(ent.fields), "_patterns": list(ent.patterns)}
                entity_conf[ent.name] = 0.4
                assumptions.append(f"Added {ent.name} because {arch.name} products usually need it — remove it if not.")

        # Workflows from verb–entity pairs.
        for key, verbs in verbs_for_entity.items():
            name = entities[key]["name"]
            for v in OrderedDict.fromkeys(verbs):
                steps = VERB_STEPS.get(v) or [s.format(name=name.lower()) for s in FALLBACK_STEPS]
                workflows.append({"id": _slug(f"{v}-{name}"), "name": f"{v.capitalize()} {_plural(name.lower()) if v in ('manage', 'track', 'browse') else name.lower()}", "steps": steps})

        # Priors: probability-weighted blend of archetype priors, then constraint adjustments.
        weights = {a: p for a, p in top}
        z = sum(weights.values()) or 1.0
        priors = {k: round(sum(self.onto.archetypes[a].priors[k] * p for a, p in weights.items()) / z) for k in arch.priors}
        accessibility_floor = "AA"
        performance = None
        capabilities = list(arch.capabilities)
        lowered = text.lower()
        for phrase, effect in src.CONSTRAINT_LEXICON.items():
            if phrase in lowered or phrase in constraint_phrases:
                for k, v in effect.items():
                    if k == "accessibilityFloor":
                        if v == "AAA" or accessibility_floor == "A":
                            accessibility_floor = v
                    elif k == "performanceCeiling":
                        performance = v
                    elif k == "capability":
                        if v not in capabilities:
                            capabilities.append(v)
                    elif k in priors:
                        priors[k] = max(0, min(100, priors[k] + v))
                assumptions.append(f"Applied “{phrase}”: {', '.join(f'{k} {v}' for k, v in effect.items())}.")
        if accessibility_floor == "AAA":
            priors["trust"] = max(priors["trust"], 85)

        # Screens.
        screens = self._plan_screens(entities, verbs_for_entity, arch)
        audience = ", ".join(OrderedDict.fromkeys(a for a in actors if a not in ("the team", "staff", "admins"))) or arch.audience
        jobs = [w["name"] for w in workflows][:8] or [arch.objective]

        product_model = {
            "schemaVersion": SCHEMA_VERSION,
            "productArchetypes": [{"tag": a, "weight": max(1, round(p * 100))} for a, p in top],
            "primaryAudience": _title(audience) if audience == audience.lower() else audience,
            "userSophistication": priors["sophistication"],
            "primaryObjective": arch.objective,
            "secondaryObjectives": [],
            "jobsToBeDone": jobs,
            "entities": [{"name": e["name"], "description": e["description"], "fields": e["fields"]} for e in entities.values()],
            "workflows": workflows,
            "trustRequirement": priors["trust"],
            "informationComplexity": priors["complexity"],
            "dataDensity": priors["density"],
            "collaborationLevel": priors["collaboration"],
            "transactionCriticality": priors["transaction"],
            "navigationComplexity": priors["navigation"],
            "mobileImportance": priors["mobile"],
            "likelyScreens": [{"name": s["name"], "screenType": s["screenType"], "purpose": s["purpose"]} for g in screens["groups"] for s in g["screens"]],
            "requiredCapabilities": capabilities,
            "forbiddenPatterns": [],
            "constraints": {"accessibilityFloor": accessibility_floor, "targetDevices": ["desktop", "tablet", "mobile"], **({"performanceCeiling": performance} if performance else {})},
        }

        archetype_conf = top[0][1]
        return {
            "kind": "interpretation",
            "productModel": product_model,
            "screenGraph": screens,
            "feel": ", ".join(OrderedDict.fromkeys(feel_words)),
            "assumptions": assumptions,
            "confidence": {
                "archetype": round(archetype_conf, 2),
                "entities": entity_conf,
                "overall": round(min(1.0, 0.5 * archetype_conf + 0.5 * (sum(entity_conf.values()) / max(len(entity_conf), 1))), 2),
            },
            "alternatives": [{"tag": a, "probability": round(p, 3)} for a, p in probs[:5]],
        }

    # ------------------------------------------------------------------ screens
    def _plan_screens(self, entities: "OrderedDict[str, dict]", verbs: Dict[str, List[str]], arch) -> dict:
        planned: "OrderedDict[str, dict]" = OrderedDict()

        def add(sid: str, name: str, stype: str, slug: str, purpose: str, required: bool, importance: int, data: List[str], entity: Optional[str] = None):
            if sid in planned:
                planned[sid]["importance"] = max(planned[sid]["importance"], importance)
                planned[sid]["required"] = planned[sid]["required"] or required
                return
            planned[sid] = {
                "id": sid, "name": name, "slug": slug, "screenType": stype, "purpose": purpose, "jobs": [],
                "required": required, "navigationVisibility": "primary" if required else "secondary",
                "importance": importance, "expectedData": data, "requiredRoles": [], "optionalRoles": [],
            }
            if entity:
                planned[sid]["entity"] = entity

        for sid, name, stype, slug, purpose, _g, required in SHELL_SCREENS:
            add(sid, name, stype, slug, purpose, required, 60, [])
        add("screen-overview", "Overview", "dashboard", "/overview", f"Today at a glance for {arch.name.lower()}.", True, 80, [])

        for i, (key, ent) in enumerate(entities.items()):
            name = ent["name"]
            plural = _plural(name.lower())
            implied = list(ent["_patterns"])
            for v in verbs.get(key, []):
                implied += VERB_PATTERNS.get(v, [])
            primary_entity = i < 4
            for pat in OrderedDict.fromkeys(implied):
                tmpl = self.onto.patterns[pat]
                label = tmpl["name"].format(Name=name, name=name.lower(), Plural=plural[:1].upper() + plural[1:], plural=plural, aname=_article(name))
                purpose = tmpl["purpose"].format(Name=name, name=name.lower(), Plural=plural[:1].upper() + plural[1:], plural=plural, aname=_article(name))
                singleton = pat in ("calendar", "checkout", "billing", "thread")
                sid = f"screen-{pat}" if singleton else f"screen-{key}-{pat}"
                slug = f"/{pat}" if singleton else f"/{_slug(plural)}" + ("" if pat == "collection" else f"/{pat}")
                strong = pat in ("booking", "checkout", "calendar") and key in verbs
                required = (primary_entity and pat in ("collection", "catalog")) or strong
                add(sid, label, tmpl["screenType"], slug, purpose, required, 85 if strong else 70 if required else 50, ent["fields"][:5], None if singleton else name)

        groups: "OrderedDict[str, list]" = OrderedDict((g, []) for g in ("marketing", "public", "app", "settings", "authentication"))
        for s in planned.values():
            groups[GROUP_FOR_TYPE.get(s["screenType"], "app")].append(s)
        names = {"marketing": "Marketing", "public": "Customer journeys", "app": "Application", "settings": "Settings & account", "authentication": "Authentication"}
        graph_groups = [{"id": f"group-{g}", "name": names[g], "screens": sc} for g, sc in groups.items() if sc]
        edges = []
        ids = set(planned)
        for key in entities:
            if f"screen-{key}-collection" in ids and f"screen-{key}-detail" in ids:
                edges.append({"id": f"edge-{key}", "fromScreenId": f"screen-{key}-collection", "toScreenId": f"screen-{key}-detail", "label": "Open"})
        return {"id": f"graph-{arch.id}", "groups": graph_groups, "edges": edges}
