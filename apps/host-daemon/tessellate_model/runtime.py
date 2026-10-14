"""Loads the current versioned weights and builds the interpreter used by the daemon."""

import json
import os
from functools import lru_cache
from typing import Optional

from .classifier import AveragedPerceptron
from .interpret import BriefInterpreter
from .tagger import StructuredPerceptron

WEIGHTS_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "weights")


def current_weights_dir() -> str:
    with open(os.path.join(WEIGHTS_ROOT, "CURRENT"), encoding="utf-8") as f:
        return os.path.join(WEIGHTS_ROOT, f.read().strip())


@lru_cache(maxsize=2)
def load_interpreter(weights_dir: Optional[str] = None) -> BriefInterpreter:
    d = weights_dir or current_weights_dir()
    return BriefInterpreter(StructuredPerceptron.load(os.path.join(d, "tagger.json")), AveragedPerceptron.load(os.path.join(d, "archetypes.json")))


def model_card(weights_dir: Optional[str] = None) -> dict:
    d = weights_dir or current_weights_dir()
    with open(os.path.join(d, "model_card.json"), encoding="utf-8") as f:
        return json.load(f)
