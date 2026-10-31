# Experimental laptop inference Lab

The laptop worker is an optional Lab. Compose, deterministic Workbench commands,
local saving and export do not depend on it. Workbench requires an explicit Lab
opt-in and presents every proposal for review before applying it.

The current Python prototype has not met Core quality. Its action head was fit
against ten synthetic prompt/action pairs; the node-selection, Design DNA and
divergence outputs are not trained or calibrated. It also has no abstention
output. The repeatable benchmark records 80% action accuracy on those training
examples, 62.5% on validation, 68.75% on held-out prompts, 0/6 named-node
selections, 0/24 requested DNA directions, a 30-point divergence error across
two held-out cases, and proposals for all 16 adversarial prompts. The actual
deterministic Workbench parser reaches 8/8 on the validation split and abstains
on the adversarial split after the shared prompt guard. Keep the model isolated
as research; these results are not a quality claim.

The cases and machine-readable result are in
[`quality/evidence/step-32/`](../../quality/evidence/step-32/). Re-run the
comparison from the repository root with:

```powershell
pnpm exec tsx scripts/evaluate-host-model.ts
```

The host process does not call an external model provider. Its prompt and screen
fragment pass through the configured Site/API connection and are queued in the
laptop's local D1 volume. A Site connection uses its configured server-side
gateway and tunnel, so the network transport is not described as zero-egress.
Never enable the host on a shared or untrusted backend.

## Run on the owner laptop

From the repository root in PowerShell:

```powershell
./scripts/Start-LaptopBackend.ps1
```

Docker Desktop must be running. The script builds the API and CPU worker
containers, generates local service secrets under
`$env:USERPROFILE\.tessellate\secrets`, and binds the API only to
`127.0.0.1:8788`. Stop the services with:

```powershell
./scripts/Start-LaptopBackend.ps1 -Stop
```

The UI reports the Lab unavailable whenever Docker, the API, or the worker is
offline. Host commands require a current heartbeat. Unfinished work remains in
the local D1 volume and can be reclaimed after the worker returns; timed-out
client requests are cancelled when the laptop is reachable. Public transport
requires HTTPS. Cleartext is accepted only for loopback development or the
`api:8787` Docker service address, and redirects are not followed with the host
secret attached.

Run the daemon and model unit checks with:

```powershell
python -m unittest discover -s apps/host-daemon/tests
```
