"""
Tessellate host daemon (D-033).

Runs on the owner's machine, claims tickets from the Tessellate inference queue, runs the
bespoke Tree-GNN/Bi-GRU model and posts back schema-shaped results. It only makes outbound
HTTPS requests, so it needs no open ports or public IP.

Configuration (environment variables):
  TESSELLATE_API_URL       Queue API base URL (default http://localhost:8787 for development)
  TESSELLATE_DAEMON_TOKEN  Per-device token issued with `pnpm --filter @tessellate/api daemon:token`
                           (required; there is no built-in default secret)

Privacy: prompts and project context are never written to logs; only ticket ids, kinds,
timings and outcomes are logged.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.request
from typing import Any, Dict, Optional

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "model"))
from inference import BespokeInferenceEngine, NotUnderstood  # noqa: E402

API_URL = os.environ.get("TESSELLATE_API_URL", "http://localhost:8787").rstrip("/")
DAEMON_TOKEN = os.environ.get("TESSELLATE_DAEMON_TOKEN", "")
POLL_INTERVAL_SEC = 1.0
IDLE_BACKOFF_MAX_SEC = 5.0
HEARTBEAT_INTERVAL_SEC = 15.0
USER_AGENT = "Tessellate-Host-Daemon/2.0"


class ApiError(Exception):
    def __init__(self, status: int, body: Dict[str, Any]):
        super().__init__(f"HTTP {status}: {body.get('message') or body.get('error')}")
        self.status = status
        self.body = body


def request(path: str, method: str = "GET", data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    headers = {
        "Authorization": f"Bearer {DAEMON_TOKEN}",
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
    }
    payload = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(f"{API_URL}{path}", data=payload, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            body = json.loads(raw)
        except ValueError:
            body = {"error": raw[:200]}
        raise ApiError(e.code, body) from None


def process(engine: BespokeInferenceEngine, task: Dict[str, Any]) -> Dict[str, Any]:
    """Returns the /complete payload for a claimed task: either a result or an honest error."""
    kind = task.get("kind", "intent-command")
    context = task.get("context") or {}
    try:
        if kind == "intent-command":
            result = engine.infer_intent(task.get("prompt", ""), context.get("screenAst") or {})
        elif kind == "interpret-brief":
            result = engine.interpret_brief(task.get("prompt", ""), context)
        else:
            return {"ticketId": task["id"], "error": f"Unsupported task kind: {kind}"}
    except NotUnderstood as e:
        return {"ticketId": task["id"], "error": str(e)}
    return {"ticketId": task["id"], "result": result}


def main() -> int:
    # Windows consoles default to cp1252; never let a log line crash the daemon.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")
    if not DAEMON_TOKEN:
        print("[daemon] TESSELLATE_DAEMON_TOKEN is not set. Issue one with:")
        print("         pnpm --filter @tessellate/api daemon:token <device-name> [--remote]")
        return 2

    print(f"[daemon] Tessellate host daemon - API {API_URL}")
    engine = BespokeInferenceEngine.get_instance()
    last_heartbeat = 0.0
    idle_sleep = POLL_INTERVAL_SEC

    while True:
        try:
            if time.time() - last_heartbeat >= HEARTBEAT_INTERVAL_SEC:
                request("/api/inference/heartbeat", "POST", {})
                last_heartbeat = time.time()

            task = request("/api/inference/poll").get("task")
            if not task:
                time.sleep(idle_sleep)
                idle_sleep = min(idle_sleep * 1.5, IDLE_BACKOFF_MAX_SEC)
                continue

            idle_sleep = POLL_INTERVAL_SEC
            started = time.perf_counter()
            payload = process(engine, task)
            elapsed_ms = round((time.perf_counter() - started) * 1000, 1)
            try:
                request("/api/inference/complete", "POST", payload)
                outcome = "error" if "error" in payload else "ok"
            except ApiError as e:
                outcome = f"rejected ({e.status})"
            print(f"[daemon] ticket #{task.get('tokenNumber')} {task.get('kind')} -> {outcome} in {elapsed_ms} ms")
        except ApiError as e:
            if e.status == 401:
                print("[daemon] The API rejected this device token (revoked or wrong environment). Stopping.")
                return 3
            print(f"[daemon] API error: {e}; retrying")
            time.sleep(IDLE_BACKOFF_MAX_SEC)
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            print(f"[daemon] API unreachable ({e}); retrying")
            time.sleep(IDLE_BACKOFF_MAX_SEC)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n[daemon] Stopped.")
        sys.exit(0)
