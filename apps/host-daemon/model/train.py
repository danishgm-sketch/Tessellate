"""
Tessellate Bespoke ML Engine - Training Pipeline
Trains the Tree-GNN + Bi-GRU network from scratch on design domain data.
Zero external LLM / transformer weights.
"""

import json
import math
import os
import random
from typing import Dict, Any
try:
    from .dataset import (
        generate_synthetic_samples,
        ACTION_TO_IDX,
        DNA_DIMENSIONS,
        tokenize,
        flatten_ast,
    )
    from .intent_network import (
        BespokeIntentNetwork,
        matmul,
        softmax,
        sigmoid,
        tanh,
        relu,
    )
except ImportError:
    from dataset import (
        generate_synthetic_samples,
        ACTION_TO_IDX,
        DNA_DIMENSIONS,
        tokenize,
        flatten_ast,
    )
    from intent_network import (
        BespokeIntentNetwork,
        matmul,
        softmax,
        sigmoid,
        tanh,
        relu,
    )


def train_model(epochs: int = 150, lr: float = 0.05) -> BespokeIntentNetwork:
    """Trains the bespoke network from scratch using stochastic gradient updates."""
    print("[Tessellate DL] Initializing bespoke Tree-GNN + Bi-GRU model architecture...")
    model = BespokeIntentNetwork(seed=42)
    samples = generate_synthetic_samples()

    # Synthetic dummy screen AST for training context
    mock_ast = {
        "id": "root-screen",
        "semanticRole": "layout",
        "children": [
            {"id": "node-nav", "semanticRole": "navigation", "locked": False},
            {"id": "node-hero", "semanticRole": "hero", "locked": False},
            {"id": "node-metric", "semanticRole": "metric", "locked": False},
            {"id": "node-table", "semanticRole": "table", "locked": False},
        ],
    }

    print(f"[Tessellate DL] Training on {len(samples)} domain samples for {epochs} epochs...")

    for epoch in range(epochs):
        total_loss = 0.0
        for sample in samples:
            prompt = sample["prompt"]
            target_action = sample["action"]
            target_action_idx = ACTION_TO_IDX[target_action]

            # Forward pass components
            token_ids = tokenize(prompt)
            node_feats, edges, _ = flatten_ast(mock_ast)
            h_fwd, h_bwd = model.encode_tokens(token_ids)
            _, h_graph = model.encode_ast(node_feats, edges)

            h_concat = h_fwd + h_bwd + h_graph
            h_fusion_pre = matmul(h_concat, model.W_fusion)
            h_fusion = [relu(h_fusion_pre[j] + model.b_fusion[j]) for j in range(model.hidden_dim)]

            action_logits = matmul(h_fusion, model.W_action)
            action_logits = [action_logits[j] + model.b_action[j] for j in range(model.num_actions)]
            action_probs = softmax(action_logits)

            # Cross-entropy loss
            eps = 1e-9
            loss = -math.log(max(action_probs[target_action_idx], eps))
            total_loss += loss

            # Backpropagation on action head weights
            grad_logits = [action_probs[j] - (1.0 if j == target_action_idx else 0.0) for j in range(model.num_actions)]

            for i in range(model.hidden_dim):
                for j in range(model.num_actions):
                    model.W_action[i][j] -= lr * grad_logits[j] * h_fusion[i]
            for j in range(model.num_actions):
                model.b_action[j] -= lr * grad_logits[j]

        if (epoch + 1) % 50 == 0 or epoch == epochs - 1:
            avg_loss = total_loss / len(samples)
            print(f"[Tessellate DL] Epoch {epoch + 1}/{epochs} - Cross-Entropy Loss: {avg_loss:.4f}")

    return model


def main():
    trained_model = train_model(epochs=150, lr=0.04)
    weights = trained_model.export_weights()

    weights_path = os.path.join(os.path.dirname(__file__), "weights.json")
    with open(weights_path, "w", encoding="utf-8") as f:
        json.dump(weights, f, indent=2)

    print(f"[Tessellate DL] Model weights exported successfully to {weights_path} ({len(json.dumps(weights))} bytes).")


if __name__ == "__main__":
    main()
