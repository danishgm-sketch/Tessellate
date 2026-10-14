# Tessellate host daemon

Runs Tessellate’s bespoke model (Tree-GNN + Bi-GRU, no LLM — D-034) on the owner’s machine and serves the
public intelligence queue (D-033/D-035). It only makes **outbound** connections, so it needs no open ports
or public IP.

## Quick start

1. Python 3.11+.
2. `pip install -r requirements.txt` (only `websockets`, for the realtime transport; the daemon falls back to
   HTTP polling without it).
3. Issue a device token: **Admin → Daemon devices → Issue token** on the site, or
   `pnpm --filter @tessellate/api daemon:token "Studio PC" --remote`. The token is shown once.
4. `cp daemon.env.example daemon.env` and set `TESSELLATE_API_URL` and `TESSELLATE_DAEMON_TOKEN`.
5. `python -u daemon.py`

## Run as a service

- **Linux:** `service/tessellate-daemon.service` (systemd; restarts automatically, stops if the token is revoked).
- **Windows:** `service/install-windows-task.ps1` (scheduled task at log-on with automatic restart).

## How work flows

- The daemon holds one WebSocket to the queue hub (a Durable Object). When a ticket is queued the hub
  announces work; the daemon claims it, runs the model and sends the result.
- Claims carry a 90-second lease. If the daemon crashes or restarts mid-task, the ticket is re-queued
  automatically (up to 3 attempts) — no ticket is lost.
- Low-confidence predictions are reported as “not understood” instead of guessed (D-034).
- Prompts are never logged. The API purges prompt text 24 hours after completion.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Stopped normally |
| 2 | No token configured |
| 3 | Token rejected or revoked — issue a new one |
