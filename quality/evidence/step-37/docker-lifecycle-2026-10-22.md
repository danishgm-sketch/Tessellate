# Laptop backend lifecycle verification — 2026-10-22

**Result:** PASS. `node scripts/verify-laptop-backend.mjs` completed all eight Docker lifecycle checks. The machine-readable output is `apps/laptop-backend/evidence/docker-runtime.json`.

The run verified real model completion, host-control authentication, local worker rate limiting (20 allowed and the next request rejected), queue recovery across API restart, 503 while the host is stopped, pending-task recovery after host resume, inference recovery after host-container restart, and API unavailability while the API container is stopped. It also confirmed locked-node preservation for the inference result.

After the verifier restored the services, a gateway-authenticated health check reported `hostOnline: true`; both API and host containers were healthy. Their Docker restart policies are `unless-stopped`. The post-run state is recorded in `docker-lifecycle-postcheck-2026-10-22.json`.

The backend and Sites worker transport tests passed 8/8. The desktop Workbench offline-Lab browser test passed; the configured mobile skip applies because this command bar is desktop-only. The current 1440 × 900 screenshot is `laptop-backend-offline-workbench-1440x900.png`.

**Boundary:** This is local Docker evidence. `cloudflared` is installed but no service or process is running, and D-041 says no public tunnel is provisioned. Therefore this does not show that a deployed Site can reach the laptop backend. A fresh OS restart and public ingress remain unverified. Backend-dependent Lab features must remain unavailable when the backend is offline.
