"""
Tessellate Owner Host Daemon
Long-polling worker that runs locally on the owner/host machine.
Pulls tasks from Cloudflare API queue, executes bespoke Tree-GNN ML inference,
and posts completed IntentCommand results back.
Requires zero open ports, no public IP, works behind any firewall/router.
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
from typing import Dict, Any

# Ensure model directory is on import path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "model"))
from inference import BespokeInferenceEngine

DEFAULT_API_URL = os.environ.get("TESSELLATE_API_URL", "http://localhost:8787")
HOST_SECRET = os.environ.get("TESSELLATE_HOST_SECRET", "tessellate_owner_secret_dev")
POLL_INTERVAL_SEC = 1.0
HEARTBEAT_INTERVAL_SEC = 15.0


def make_request(url: str, method: str = "GET", data: Dict[str, Any] = None) -> Dict[str, Any]:
    """Helper to perform JSON HTTP requests with the host secret header."""
    headers = {
        "Content-Type": "application/json",
        "X-Host-Secret": HOST_SECRET,
        "User-Agent": "Tessellate-Host-Daemon/1.0",
    }
    payload = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=payload, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
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
    print("=" * 65)
    print("       TESSELLATE BESPOKE ML HOST INFERENCE DAEMON       ")
    print("   Zero-LLM Architecture · Tree-GNN + Bi-GRU Neural Model ")
    print("=" * 65)
    print(f"[Host Daemon] Target Cloud API: {DEFAULT_API_URL}")
    print(f"[Host Daemon] Initializing bespoke inference engine...")

    engine = BespokeInferenceEngine.get_instance()
    last_heartbeat = 0.0

    print("[Host Daemon] Online and polling queue for tasks. Press Ctrl+C to exit.\n")

    while True:
        now = time.time()

        # 1. Send heartbeat if due
        if now - last_heartbeat >= HEARTBEAT_INTERVAL_SEC:
            hb_resp = make_request(f"{DEFAULT_API_URL}/api/inference/heartbeat", method="POST", data={
                "deviceName": "Host-Hardware-Worker-01",
                "status": "idle",
            })
            if "error" not in hb_resp:
                last_heartbeat = now
                # print(f"[Host Daemon] Heartbeat registered at {time.strftime('%H:%M:%S')}")

        # 2. Poll for queued task
        try:
            poll_resp = make_request(f"{DEFAULT_API_URL}/api/inference/poll", method="GET")

            if poll_resp and poll_resp.get("task"):
                task = poll_resp["task"]
                ticket_id = task.get("id")
                token_num = task.get("tokenNumber")
                prompt = task.get("prompt", "")
                screen_ast = task.get("screenAst", {})

                print(f"[Host Daemon] ⚡ Task Received! Token #{token_num} (ID: {ticket_id})")
                print(f"              Prompt: \"{prompt}\"")

                start_t = time.perf_counter()
                result_command = engine.infer(prompt, screen_ast)
                duration_ms = round((time.perf_counter() - start_t) * 1000, 2)

                print(f"[Host Daemon] Inferred action: \"{result_command.get('action')}\" ({duration_ms}ms)")

                # 3. Post completion back
                complete_resp = make_request(f"{DEFAULT_API_URL}/api/inference/complete", method="POST", data={
                    "ticketId": ticket_id,
                    "resultCommand": result_command,
                })

                if complete_resp.get("success"):
                    print(f"[Host Daemon] ✅ Ticket #{token_num} successfully completed and committed.\n")
                else:
                    print(f"[Host Daemon] ⚠️ Failed to commit ticket #{token_num}: {complete_resp}\n")

        except Exception as e:
            # print(f"[Host Daemon] Poll loop error: {e}")
            pass

        time.sleep(POLL_INTERVAL_SEC)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[Host Daemon] Gracefully shutting down.")
        sys.exit(0)
