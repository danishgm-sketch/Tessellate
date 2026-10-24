"""
Tessellate Owner Host Daemon
Long-polling worker that runs locally on the owner/host machine.
Pulls tasks from the configured API queue, runs the isolated experimental
command model, and posts schema-compatible IntentCommand proposals back.
Requires zero open ports, no public IP, works behind any firewall/router.
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
import ipaddress
from pathlib import Path
from typing import Dict, Any
from urllib.parse import urlsplit

# Ensure model directory is on import path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "model"))
from inference import BespokeInferenceEngine

DEFAULT_API_URL = os.environ.get("TESSELLATE_API_URL", "http://localhost:8787")
secret_file = os.environ.get("TESSELLATE_HOST_SECRET_FILE")
HOST_SECRET = Path(secret_file).read_text().strip() if secret_file else os.environ.get("TESSELLATE_HOST_SECRET", "")
POLL_INTERVAL_SEC = 1.0
HEARTBEAT_INTERVAL_SEC = 5.0
MAX_RETRY_DELAY_SEC = 30.0
INTENT_COMMAND_FIELDS = {
    "action",
    "summary",
    "targetScreenId",
    "targetNodeIds",
    "preserveLockedNodes",
    "feelDescriptors",
    "dnaDeltas",
    "categoricalDna",
    "lockDimensions",
    "replacementResourceSlug",
    "explanation",
}


def retry_delay(consecutive_failures: int) -> float:
    """Bound the host's reconnect traffic while preserving a prompt recovery probe."""
    if consecutive_failures <= 0:
        return POLL_INTERVAL_SEC
    return min(POLL_INTERVAL_SEC * (2 ** (consecutive_failures - 1)), MAX_RETRY_DELAY_SEC)


def to_intent_command(proposal: Any) -> Dict[str, Any]:
    """Project experimental model output onto the shared IntentCommand contract."""
    if not isinstance(proposal, dict):
        raise ValueError("Laptop model returned a non-object proposal")
    command = {key: value for key, value in proposal.items() if key in INTENT_COMMAND_FIELDS}
    feel = proposal.get("feel")
    if isinstance(feel, str) and feel and "feelDescriptors" not in command:
        command["feelDescriptors"] = feel
    if not isinstance(command.get("action"), str) or not isinstance(command.get("summary"), str):
        raise ValueError("Laptop model proposal is missing its action or summary")
    command["preserveLockedNodes"] = True
    return command


def report_task_failure(api_base: str, task: Dict[str, Any], failure_code: str) -> Dict[str, Any]:
    return make_request(
        f"{api_base}/api/inference/fail",
        method="POST",
        data={"ticketId": task.get("id"), "leaseId": task.get("leaseId"), "failureCode": failure_code},
    )


def validate_api_url(value: str) -> str:
    """Require HTTPS remotely; permit cleartext only on loopback or Docker's API service."""
    try:
        parsed = urlsplit(value.strip())
        port = parsed.port
    except ValueError as error:
        raise ValueError("TESSELLATE_API_URL is invalid") from error
    host = (parsed.hostname or "").lower().rstrip(".")
    if (
        parsed.scheme not in {"https", "http"}
        or not host
        or parsed.username
        or parsed.password
        or parsed.path not in {"", "/"}
        or parsed.query
        or parsed.fragment
    ):
        raise ValueError("TESSELLATE_API_URL must be an origin without credentials, path, query, or fragment")
    is_loopback = host == "localhost"
    try:
        is_loopback = is_loopback or ipaddress.ip_address(host).is_loopback
    except ValueError:
        pass
    is_docker_api = host == "api" and port == 8787
    if parsed.scheme == "http" and not (is_loopback or is_docker_api):
        raise ValueError("TESSELLATE_API_URL must use HTTPS outside the local Docker network")
    return f"{parsed.scheme}://{parsed.netloc}"


def validate_request_url(value: str) -> str:
    """Validate each destination before attaching the host credential header."""
    try:
        parsed = urlsplit(value)
    except ValueError as error:
        raise ValueError("Inference API request URL is invalid") from error
    if not parsed.path.startswith("/api/") or parsed.query or parsed.fragment:
        raise ValueError("Inference API requests must use a path under /api without query or fragment")
    return validate_api_url(f"{parsed.scheme}://{parsed.netloc}") + parsed.path


class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, _request, _response, _code, _message, _headers, _new_url):
        # Never forward X-Host-Secret to a redirect target, even over HTTPS.
        return None


HTTP_OPENER = urllib.request.build_opener(NoRedirectHandler)


def make_request(url: str, method: str = "GET", data: Dict[str, Any] = None) -> Dict[str, Any]:
    """Helper to perform JSON HTTP requests with the host secret header."""
    safe_url = validate_request_url(url)
    headers = {
        "Content-Type": "application/json",
        "X-Host-Secret": HOST_SECRET,
        "User-Agent": "Tessellate-Host-Daemon/1.0",
    }
    payload = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(safe_url, data=payload, headers=headers, method=method)

    try:
        with HTTP_OPENER.open(req, timeout=4) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw_err = e.read().decode("utf-8")
        try:
            return json.loads(raw_err)
        except Exception:
            return {"error": f"HTTP {e.code}: {e.reason}"}
    except Exception as e:
        return {"error": str(e)}


def main():
    if len(HOST_SECRET) < 32:
        raise RuntimeError("Configure a generated host authentication secret before starting the daemon")
    api_base = validate_api_url(DEFAULT_API_URL)
    print("=" * 65)
    print("       TESSELLATE EXPERIMENTAL HOST INFERENCE DAEMON       ")
    print("     Local CPU inference · experimental command model     ")
    print("=" * 65)
    print(f"[Host Daemon] Target API: {api_base}")
    print("[Host Daemon] Initializing experimental local model...")

    engine = BespokeInferenceEngine.get_instance()
    last_heartbeat = 0.0
    consecutive_failures = 0

    print("[Host Daemon] Online and polling queue for tasks. Press Ctrl+C to exit.\n")

    while True:
        now = time.time()
        sleep_for = POLL_INTERVAL_SEC

        # 1. Send heartbeat if due
        if now - last_heartbeat >= HEARTBEAT_INTERVAL_SEC:
            last_heartbeat = now
            hb_resp = make_request(f"{api_base}/api/inference/heartbeat", method="POST", data={
                "deviceName": os.environ.get("TESSELLATE_DEVICE_NAME", "Tessellate laptop CPU"),
                "status": "idle",
            })
            if "error" not in hb_resp:
                Path('/tmp/host-heartbeat').write_text(str(now))
                # print(f"[Host Daemon] Heartbeat registered at {time.strftime('%H:%M:%S')}")

        # 2. Poll for queued task
        task = None
        try:
            poll_resp = make_request(f"{api_base}/api/inference/poll", method="GET")

            if "error" in poll_resp:
                consecutive_failures += 1
                sleep_for = retry_delay(consecutive_failures)
            else:
                consecutive_failures = 0

            if poll_resp and poll_resp.get("task"):
                task = poll_resp["task"]
                ticket_id = task.get("id")
                token_num = task.get("tokenNumber")
                prompt = task.get("prompt", "")
                screen_ast = task.get("screenAst", {})

                print(f"[Host Daemon] ⚡ Task Received! Token #{token_num} (ID: {ticket_id})")

                start_t = time.perf_counter()
                result_command = to_intent_command(engine.infer(prompt, screen_ast, task.get("designDna", {})))
                duration_ms = round((time.perf_counter() - start_t) * 1000, 2)

                print(f"[Host Daemon] Inferred action: \"{result_command.get('action')}\" ({duration_ms}ms)")

                # 3. Post completion back
                complete_resp = make_request(f"{api_base}/api/inference/complete", method="POST", data={
                    "ticketId": ticket_id,
                    "leaseId": task.get("leaseId"),
                    "resultCommand": result_command,
                })

                if complete_resp.get("success"):
                    print(f"[Host Daemon] ✅ Ticket #{token_num} successfully completed and committed.\n")
                else:
                    failure_code = "invalid-result" if complete_resp.get("error") == "InvalidRequest" else "worker-error"
                    failure_resp = report_task_failure(api_base, task, failure_code)
                    print(f"[Host Daemon] ⚠️ Ticket #{token_num} could not be committed; task failure recorded: {failure_resp.get('success') is True}.\n")

        except Exception as e:
            if isinstance(task, dict) and task.get("id") and task.get("leaseId"):
                report_task_failure(api_base, task, "worker-error")
            print(f"[Host Daemon] Task execution failed: {type(e).__name__}; project state is unchanged.")
            consecutive_failures += 1
            sleep_for = retry_delay(consecutive_failures)

        time.sleep(sleep_for)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[Host Daemon] Gracefully shutting down.")
        sys.exit(0)
