# Laptop backend

The owner's laptop runs the existing Hono API in local workerd and the existing
CPU inference daemon. The public Astro/React application remains on ChatGPT Sites.

Start from the repository root in PowerShell:

```powershell
./scripts/Start-LaptopBackend.ps1
```

Stop with `./scripts/Start-LaptopBackend.ps1 -Stop`. Docker Desktop must be running.
Containers restart unless explicitly stopped. The API listens only on
`127.0.0.1:8788`; the model has no exposed port. Resource limits are 2 CPUs / 1 GB
for the API and 2 CPUs / 512 MB for inference. No GPU or paid inference service
is required by the current model.

Local D1 uses SQLite in the persistent `tessellate-laptop_laptop-data` Docker
volume. Container replacement and ordinary shutdown preserve it. Do not delete
the volume if you need its records. Local migrations run on startup; no hosted
D1 or R2 binding is provisioned.

Service secrets are generated once under `$HOME/.tessellate/secrets`, outside
Git and Docker images. They are mounted as Docker secrets. BYO provider keys are
never stored by this setup. GitHub OAuth is unavailable until genuine OAuth
credentials are configured; no development credentials are accepted.

## Connecting the existing Site

A permanent HTTPS backend hostname or registered Sites private tunnel is required.
For a dedicated Cloudflare Tunnel, put its configuration in `tunnel-config.yml`
and its credentials in `tunnel.json` under the secrets directory, then start with
`-WithTunnel`. Route only that dedicated hostname to `http://api:8787`, followed
by a catch-all 404. Do not reuse another project's tunnel.

Set the Site's server-only `TESSELLATE_BACKEND_URL` and secret
`TESSELLATE_GATEWAY_SECRET` to the corresponding backend connection. Never put
the gateway key in a PUBLIC variable or client bundle. The proxy excludes host
control routes, rejects cross-origin mutations, restricts forwarded cookies,
and times out unreachable connections after three seconds.

The ordinary Astro static preview has no server-side gateway, so laptop
inference is shown as unavailable there and does not probe a local port. Use the
Sites runtime with its server-side backend settings to exercise Docker-backed
inference. The catalogue, composition, browser-local editing, deterministic
commands and exports continue to work in the Astro preview.

Host heartbeat expires after 15 seconds. Host-dependent commands reject offline
requests without mutating the project. Existing recognized deterministic commands
and browser-local editing remain available. Unsupported prompts never silently
recompose a project. Stopping Docker makes backend features unavailable.

Run `node scripts/verify-laptop-backend.mjs` for real Docker persistence, inference,
authorization and outage checks. It briefly pauses/restarts only Tessellate's
containers and restores them. Safe results are in `evidence/docker-runtime.json`.
