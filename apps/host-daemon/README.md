# Tessellate Host-Hardware Bespoke DL Inference Daemon

The Tessellate Host Daemon is an autonomous, bespoke deep learning worker that runs directly on the owner/host machine (local workstation or private server) with **zero cloud LLM API cost** and **no third-party AI token dependency**.

## Architectural Highlights

- **Bespoke Neural Topology**: Custom Tree-GNN (Graph Neural Network) + Bidirectional GRU trained specifically on AST mutations, Design DNA parameters, and interface layout semantics.
- **Strict Privacy & Zero Cloud Egress**: Prompts and ASTs are processed exclusively on the host hardware. No data is sent to external commercial model vendors.
- **Token Queue Number System**: When users submit natural-language intent commands in the Workbench, requests receive a unique queue token (`Token #1042`) and position (`Pos: 1`) with an estimated wait time.
- **Fail-Closed Fallback**: If the host daemon is offline or disconnected, the Workbench automatically detects worker unavailability via `/api/inference/health` and seamlessly switches to the deterministic local composition rule engine.
- **Firewall & NAT Agnostic**: Uses an outbound HTTPS long-polling mechanism (`/api/inference/poll`, `/api/inference/heartbeat`, `/api/inference/complete`). Requires no open inbound ports or static public IP.

## Installation & Setup

### Prerequisites
- Python 3.10+
- Optional: NVIDIA CUDA or Apple Silicon Metal for accelerated tensor ops (falls back seamlessly to CPU)

### Setup
```bash
cd apps/host-daemon
pip install -r requirements.txt
```

### Run Tests
```bash
python -m unittest tests/test_model.py
```

### Launch Daemon
```bash
# Set your Cloud API endpoint and host secret
export TESSELLATE_API_URL="https://api.tessellate.design"
export TESSELLATE_HOST_SECRET="your_secure_host_secret"

# Start the worker
python daemon.py
```

When connected, the daemon logs task executions and heartbeats:
```
=================================================================
       TESSELLATE BESPOKE ML HOST INFERENCE DAEMON       
   Zero-LLM Architecture · Tree-GNN + Bi-GRU Neural Model 
=================================================================
[Host Daemon] Target Cloud API: https://api.tessellate.design
[Host Daemon] Initializing bespoke inference engine...
[Host Daemon] Online and polling queue for tasks. Press Ctrl+C to exit.

[Host Daemon] ⚡ Task Received! Token #1042 (ID: ticket_172900...)
              Prompt: "surprise me with rich visual ambition"
[Host Daemon] Inferred action: "surprise-me" (8.4ms)
```
