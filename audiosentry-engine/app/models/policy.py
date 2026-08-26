from functools import lru_cache
from pathlib import Path

import yaml

_POLICY_DIR = Path(__file__).resolve().parent.parent / "policies"


@lru_cache(maxsize=None)
def load_policy(name: str) -> dict:
    """Loads app/policies/{name}.yaml. Cached — these files don't change at
    runtime, only via a deliberate redeploy (Master Blueprint Section 3.1)."""
    path = _POLICY_DIR / f"{name}.yaml"
    with open(path) as f:
        return yaml.safe_load(f)


def select_policy_for_metadata(metadata: dict) -> dict:
    """Section 3.1: the active profile is driven by transaction context, not
    hardcoded per call type. Tune this mapping as the demo's mock accounts
    (Week 2, Days 9-10) settle."""
    ctx = metadata.get("transaction_context", {})
    if ctx.get("privilege_escalation") or ctx.get("transfer_value", 0) > 100_000:
        return load_policy("strict")
    if ctx.get("transfer_value", 0) > 1_000:
        return load_policy("balanced")
    return load_policy("lenient")