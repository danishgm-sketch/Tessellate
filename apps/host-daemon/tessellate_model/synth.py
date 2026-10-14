"""
Synthetic training corpus for the bespoke brief model (D-034).

Briefs are assembled from labelled segments so every token carries a gold tag:
  ENT (domain entity), ACT (actor/audience), VRB (action), CON (constraint), FEEL (look and feel), O.
To make the tagger learn *context* (not a word list), generation mixes entities across domains, injects
novel nouns that are not in the ontology, varies sentence structure, and adds distractor clauses.
The held-out evaluation set (eval/briefs.jsonl) is hand-written and never generated here.
"""

import random
from dataclasses import dataclass, field
from typing import List, Tuple

from . import ontology_source as src
from .ontology import load
from .text import tokenize

TAGS = ["O", "B-ENT", "I-ENT", "B-ACT", "I-ACT", "B-VRB", "I-VRB", "B-CON", "I-CON", "B-FEEL", "I-FEEL"]

# Nouns absent from the ontology: the tagger must recognise them as entities from context alone.
NOVEL_NOUNS = [
    "vouchers", "permits", "lockers", "kits", "plots", "allotments", "boats", "moorings", "bikes", "scooters", "drones",
    "samples", "specimens", "batteries", "panels", "hives", "vineyards", "barrels", "recipes", "ingredients", "meal plans",
    "loyalty points", "gift cards", "coupons", "badges", "parcels", "pallets", "containers", "berths", "pitches",
    "campsites", "caravans", "instruments", "rehearsals", "auditions", "manuscripts", "submissions", "grants",
    "scholarships", "bursaries", "wills", "estates", "claims", "warranties", "repairs", "parts", "spare parts", "tools",
    "rentals", "costumes", "props", "sets", "venues", "studios", "desks", "meeting rooms", "parking spaces", "chargers",
    "charging sessions", "routes", "trails", "walks", "tours", "lessons", "workshops", "retreats", "seminars",
    "webinars", "episodes", "clips", "highlights", "transcripts", "translations", "glossaries", "datasets", "models",
    "experiments", "trials", "protocols", "dosages", "vaccinations", "check-ups", "referrals", "test results",
]

# Noun-noun compounds and gerund modifiers ("pain scores", "waiting lists") common in real briefs.
COMPOUND_HEADS = ["plans", "scores", "lists", "slots", "passes", "fees", "schedules", "reports", "results", "levels",
                  "times", "dates", "requests", "notes", "records", "histories", "sizes", "logs", "rotas", "packages"]
COMPOUND_MODS = ["exercise", "pain", "shopping", "waiting", "delivery", "entry", "day", "guest", "service", "progress",
                 "test", "stock", "group", "meeting", "collection", "pickup", "training", "travel", "repair", "visitor",
                 "parking", "membership", "maintenance", "safety", "energy", "sales", "attendance", "feedback"]
# Tokens that commonly follow an entity or verb but are not entities.
TRAILERS = [" online", " in advance", " each week", " every month", " per minute", " on a map", " by email", " for free",
            " instantly", " from their phone", " in one place", " each morning", " at the gate", " automatically"]
PRONOUN_OBJECTS = ["them", "it", "each other", "everything"]
PHRASAL_VERBS = ["check out", "check in", "sign up for", "follow up on", "log in to", "top up", "set up", "look up",
                 "pick up", "drop off", "keep track of", "get", "give to", "climb", "opt in to", "pay for", "apply for"]
MID_ACTOR_LEADS = [" where ", " so ", " that lets ", " that helps ", " wants ", " lets ", " helps ", " so that "]
# Verbs that typically go with each screen pattern: conditions synthetic verbs on the domain.
PATTERN_VERBS = {
    "booking": ["book", "reserve", "schedule", "reschedule", "cancel"], "calendar": ["schedule", "book", "plan", "view"],
    "checkout": ["pay", "buy", "order", "donate", "subscribe"], "catalog": ["browse", "find", "search", "compare"],
    "thread": ["message", "chat", "reply"], "editor": ["write", "edit", "publish", "create"],
    "analytics": ["track", "monitor", "analyse", "compare", "report"], "board": ["assign", "move", "approve", "plan"],
    "map": ["find", "track", "dispatch", "locate"], "create": ["create", "submit", "apply", "request", "raise"],
    "collection": ["manage", "track", "list", "review"], "detail": ["view", "update", "review"], "billing": ["pay", "upgrade"],
}


# Functional fallback: briefs about domains the ontology does not cover are labelled by what people do.
# These domain nouns deliberately exclude every noun used in the held-out evaluation sets.
FUNCTIONAL_DOMAINS = ["kayak", "telescope", "pottery", "sauna", "drone", "3d printer", "camper van", "horse riding",
                      "piano", "climbing wall", "laser cutter", "greenhouse", "sailing", "archery", "darkroom",
                      "recording studio", "paddleboard", "ski equipment", "costume", "board game", "cello", "bouncy castle",
                      "marquee", "stand-up comedy", "karaoke", "sewing machine", "beehive", "allotment shed", "chess"]
FUNCTIONS = {
    "booking-scheduling": (["book", "reserve", "schedule", "rent", "hire"], ["sessions", "slots", "time slots", "bookings", "{d} sessions", "{d} hire"], ["members", "customers", "people", "visitors", "families"]),
    "marketplace": (["list", "sell", "buy", "message", "rate"], ["listings", "{d} listings", "offers", "sellers", "buyers"], ["sellers", "buyers", "makers", "owners", "renters"]),
    "ecommerce": (["buy", "order", "pay for", "review"], ["products", "{d} kits", "orders", "{d} accessories"], ["customers", "shoppers", "fans"]),
    "internal-tools": (["register", "record", "track", "approve", "log"], ["records", "{d} logs", "requests", "approvals", "{d} checks"], ["staff", "technicians", "operators", "the team"]),
    "productivity": (["plan", "track", "save", "organise"], ["plans", "goals", "notes", "{d} routines", "lists"], ["people", "users", "families"]),
    "consumer": (["find", "save", "share", "follow"], ["{d} spots", "favourites", "{d} guides", "updates"], ["people", "users", "friends", "families"]),
    "logistics-shipping": (["deliver", "track", "dispatch", "collect"], ["deliveries", "{d} drop-offs", "routes", "pickups"], ["drivers", "couriers", "customers"]),
}


def _functional_example(rng: random.Random) -> "Example":
    ex = Example()
    fn = rng.choice(list(FUNCTIONS))
    verbs, objects, actors = FUNCTIONS[fn]
    d = rng.choice(FUNCTIONAL_DOMAINS)
    ex.archetypes.append(fn)
    ex.add(rng.choice(["A ", "An ", "", "Our "]))
    ex.add(d)
    ex.add(" " + rng.choice(["app", "site", "platform", "service", "club app", "portal", "tool", "system"]))
    ex.add(rng.choice([": ", ". ", " where ", " for which "]))
    for c in range(rng.randint(1, 2)):
        if c:
            ex.add(rng.choice([". ", "; ", ", and "]))
        ex.add(rng.choice(actors), "ACT")
        ex.add(" " + rng.choice(["can ", "", "want to ", "should "]))
        ex.add(rng.choice(verbs), "VRB")
        ex.add(" ")
        for m in range(rng.randint(1, 2)):
            if m:
                ex.add(rng.choice([" and ", ", "]))
            ex.add(rng.choice(objects).format(d=d), "ENT")
        if rng.random() < 0.3:
            ex.add(rng.choice(TRAILERS))
    ex.add(".")
    return ex


def _verb_for(rng: random.Random, arch: Tuple) -> str:
    if rng.random() < 0.6:
        patterns = [p for e in arch[5] for p in src.ENTITIES[e][3]]
        if patterns:
            return rng.choice(PATTERN_VERBS.get(rng.choice(patterns), src.ACTION_VERBS))
    return rng.choice(src.ACTION_VERBS)

PRODUCT_NOUNS = [
    "{kw} app", "{kw} site", "A {kw} booking app", "{kw} software", "An online {kw} service", "{kw} management",
    "A {kw} platform", "An app", "A web app", "A {kw} app", "A portal", "A {kw} portal", "A marketplace", "A dashboard",
    "Software", "A SaaS product", "An internal tool", "A mobile app", "A website", "A booking system", "A tool",
    "A {kw} tool", "A {kw} service", "A system", "A site", "A product", "A {kw} management system", "A client portal",
]
FOR_PHRASES = ["for", "built for", "designed for", "aimed at", "that helps", "used by", "serving"]
DISTRACTORS = [
    "It should feel modern.", "We are a small team.", "Launching next quarter.", "Think of it as version one.",
    "We already have a logo.", "Budget is limited.", "It replaces a spreadsheet.", "Most traffic comes from search.",
    "The founders are designers.", "We want it live quickly.", "It needs to work in the UK first.",
]
CONNECT = [" and ", ", ", " or ", ", and "]
CLAUSE_SEP = [". ", "; ", ". ", ". Also, "]
MODALS = ["can", "should be able to", "need to", "want to", "", "must be able to", "will"]
ADMIN_ACTORS = ["admins", "staff", "managers", "the team", "owners", "operators", "coordinators"]


@dataclass
class Example:
    tokens: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    archetypes: List[str] = field(default_factory=list)
    entities: List[str] = field(default_factory=list)

    def add(self, text: str, tag: str = "O") -> None:
        for i, tok in enumerate(tokenize(text)):
            self.tokens.append(tok.text)
            if tag == "O" or not tok.text.strip() or not any(c.isalnum() for c in tok.text):
                self.tags.append("O")
            else:
                self.tags.append(("B-" if i == 0 else "I-") + tag)


def _surface(rng: random.Random, entity_id: str) -> str:
    name, syns = src.ENTITIES[entity_id][0], src.ENTITIES[entity_id][1]
    options = [s for s in syns if len(s.split()) <= 3] + [name.lower()]
    word = rng.choice(options)
    if rng.random() < 0.6 and not word.endswith("s"):
        word = word + ("es" if word.endswith(("ch", "sh", "x")) else "s")
    return word


def _people_entities(arch: Tuple) -> List[str]:
    people = {"patient", "clinician", "customer", "client", "member", "user", "employee", "staff-member", "student",
              "learner", "pupil", "teacher", "candidate", "donor", "volunteer", "tenant", "guest", "attendee",
              "seller", "buyer", "agent", "technician", "courier", "trainer", "stylist", "owner", "carer", "parent",
              "citizen", "player", "artist", "listener", "author", "subscriber", "contact", "lead"}
    return [e for e in arch[5] if e in people]


def generate(n: int, seed: int = 7) -> List[Example]:
    rng = random.Random(seed)
    onto = load()
    arch_ids = list(src.ARCHETYPES)
    all_entities = list(src.ENTITIES)
    feel_words = src.FEEL_WORDS
    constraints = list(src.CONSTRAINT_LEXICON)
    out: List[Example] = []

    for _ in range(n):
        if rng.random() < 0.18:
            out.append(_functional_example(rng))
            continue
        ex = Example()
        primary = rng.choice(arch_ids)
        arch = src.ARCHETYPES[primary]
        ex.archetypes.append(primary)
        secondary = rng.choice(arch_ids) if rng.random() < 0.12 else None
        if secondary and secondary != primary:
            ex.archetypes.append(secondary)

        kw = rng.choice(arch[1])
        product = rng.choice(PRODUCT_NOUNS)
        if "{kw}" in product:
            pre, post = product.split("{kw}")
            ex.add(pre)
            ex.add(kw)
            ex.add(post)
        else:
            ex.add(product)
            ex.add(rng.choice([" for ", " for a ", " for the ", " in "]))
            ex.add(kw)

        # List-style briefs: "Mobile banking app with accounts, cards and payees."
        if rng.random() < 0.25:
            ex.add(rng.choice([" with ", " that has ", " featuring ", ": "]))
            pool = list(arch[5])
            items = rng.sample(pool, min(len(pool), rng.randint(2, 4)))
            for m, eid in enumerate(items):
                if m:
                    ex.add(", " if m < len(items) - 1 else rng.choice([" and ", ", and "]))
                if rng.random() < 0.15:
                    ex.add(rng.choice(COMPOUND_MODS) + " " + rng.choice(COMPOUND_HEADS), "ENT")
                else:
                    ex.add(_surface(rng, eid), "ENT")
                    ex.entities.append(eid)
            ex.add(". ")

        # Audience clause
        people = _people_entities(arch) or ["customer"]
        actor = _surface(rng, rng.choice(people))
        if rng.random() < 0.8:
            ex.add(" " + rng.choice(FOR_PHRASES) + " ")
            if rng.random() < 0.4:
                ex.add(rng.choice(["independent ", "small ", "busy ", "local ", "growing ", "enterprise "]))
            ex.add(actor, "ACT")
        ex.add(rng.choice(CLAUSE_SEP))

        # Capability clauses: actor + verb + entities
        for clause in range(rng.randint(1, 3)):
            subject = rng.choice([actor, _surface(rng, rng.choice(people)), rng.choice(ADMIN_ACTORS)])
            if clause == 0 and rng.random() < 0.35 and ex.tokens and ex.tokens[-1] in (".", ";"):
                # Rewind the clause separator and continue mid-sentence: "... where tenants pay rent".
                ex.tokens.pop()
                ex.tags.pop()
                ex.add(rng.choice(MID_ACTOR_LEADS))
                ex.add(subject, "ACT")
            else:
                ex.add(subject[0].upper() + subject[1:], "ACT")
            modal = rng.choice(MODALS)
            if modal:
                ex.add(" " + modal)
            pool = list(arch[5])
            if rng.random() < 0.25:
                pool.append(rng.choice(all_entities))
            for j in range(rng.randint(1, 2)):
                if j:
                    ex.add(rng.choice(CONNECT))
                verb = rng.choice(PHRASAL_VERBS) if rng.random() < 0.1 else _verb_for(rng, arch)
                ex.add(" ")
                ex.add(verb, "VRB")
                if rng.random() < 0.08:
                    ex.add(" " + rng.choice(PRONOUN_OBJECTS))
                    if rng.random() < 0.5:
                        ex.add(rng.choice(TRAILERS))
                    continue
                ex.add(" ")
                if rng.random() < 0.2:
                    ex.add(rng.choice(["their ", "all ", "upcoming ", "new ", "past ", "shared "]))
                k = rng.randint(1, 3)
                for m in range(k):
                    if m:
                        ex.add(rng.choice(CONNECT))
                    r = rng.random()
                    if r < 0.10:
                        noun = rng.choice(NOVEL_NOUNS)
                    elif r < 0.20:
                        noun = rng.choice(COMPOUND_MODS) + " " + rng.choice(COMPOUND_HEADS)
                    else:
                        eid = rng.choice(pool)
                        noun = _surface(rng, eid)
                        ex.entities.append(eid)
                    ex.add(noun, "ENT")
                if rng.random() < 0.2:
                    ex.add(rng.choice(TRAILERS))
            ex.add(rng.choice(CLAUSE_SEP))

        # Look and feel
        if rng.random() < 0.7:
            words = rng.sample(feel_words, rng.randint(1, 3))
            lead = rng.choice(["It should feel ", "Feel: ", "", "The look is ", "Make it "])
            ex.add(lead)
            for i, w in enumerate(words):
                if i:
                    ex.add(rng.choice([", ", " and ", " but "]))
                ex.add(w, "FEEL")
            ex.add(rng.choice([". ", ", "]))

        # Constraints
        if rng.random() < 0.5:
            c = rng.choice(constraints)
            ex.add(rng.choice(["Must be ", "It needs to be ", "Important: ", "Designed for ", "Works for ", ""]))
            ex.add(c, "CON")
            ex.add(". ")

        if rng.random() < 0.3:
            ex.add(rng.choice(DISTRACTORS))

        out.append(ex)
    return out
