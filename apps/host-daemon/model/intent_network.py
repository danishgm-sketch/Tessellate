"""
Tessellate Bespoke ML Engine - Graph-Recurrent Intent Network
Pure mathematical implementation of Tree-GNN + Bi-directional Sequence Model.
Zero external LLM or transformer dependencies.
"""

import math
import os
import random
import sys
from typing import Dict, List, Tuple, Any

try:
    from .dataset import (
        ACTIONS,
        ACTION_TO_IDX,
        IDX_TO_ACTION,
        DNA_DIMENSIONS,
        DNA_TO_IDX,
        VOCABULARY,
        WORD_TO_IDX,
        tokenize,
        flatten_ast,
    )
except ImportError:
    from dataset import (
        ACTIONS,
        ACTION_TO_IDX,
        IDX_TO_ACTION,
        DNA_DIMENSIONS,
        DNA_TO_IDX,
        VOCABULARY,
        WORD_TO_IDX,
        tokenize,
        flatten_ast,
    )


def sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-max(min(x, 20.0), -20.0)))


def tanh(x: float) -> float:
    return math.tanh(max(min(x, 20.0), -20.0))


def relu(x: float) -> float:
    return max(0.0, x)


def softmax(vec: List[float]) -> List[float]:
    max_val = max(vec) if vec else 0.0
    exps = [math.exp(max(min(v - max_val, 20.0), -20.0)) for v in vec]
    s = sum(exps) or 1.0
    return [e / s for e in exps]


def matmul(vec: List[float], mat: List[List[float]]) -> List[float]:
    """Compute vector * matrix: out[j] = sum_i(vec[i] * mat[i][j])"""
    out_dim = len(mat[0])
    in_dim = len(vec)
    out = [0.0] * out_dim
    for j in range(out_dim):
        s = 0.0
        for i in range(in_dim):
            s += vec[i] * mat[i][j]
        out[j] = s
    return out


class BespokeIntentNetwork:
    """
    A domain-specific Neural Network combining a Tree Graph Convolutional Network (Tree-GNN)
    with a Bidirectional Recurrent Sequence Encoder (Bi-GRU) and Multi-Head Decoders.
    """

    def __init__(
        self,
        vocab_size: int = len(VOCABULARY),
        embed_dim: int = 16,
        hidden_dim: int = 24,
        node_feat_dim: int = 5,
        num_actions: int = len(ACTIONS),
        num_dna_dims: int = len(DNA_DIMENSIONS),
        seed: int = 42,
    ):
        random.seed(seed)
        self.vocab_size = vocab_size
        self.embed_dim = embed_dim
        self.hidden_dim = hidden_dim
        self.node_feat_dim = node_feat_dim
        self.num_actions = num_actions
        self.num_dna_dims = num_dna_dims

        # 1. Word Embeddings: [vocab_size, embed_dim]
        self.W_embed = self._init_mat(vocab_size, embed_dim, scale=0.1)

        # 2. Sequence GRU Weights: [embed_dim, hidden_dim]
        self.W_gru_fwd = self._init_mat(embed_dim, hidden_dim, scale=0.1)
        self.W_gru_bwd = self._init_mat(embed_dim, hidden_dim, scale=0.1)

        # 3. Tree-GNN Weights: node features -> hidden_dim
        self.W_gnn_self = self._init_mat(node_feat_dim, hidden_dim, scale=0.1)
        self.W_gnn_neigh = self._init_mat(node_feat_dim, hidden_dim, scale=0.1)
        self.b_gnn = [0.0] * hidden_dim

        # 4. Joint Fusion: [hidden_dim * 3, hidden_dim] (fwd + bwd + gnn_pool)
        self.W_fusion = self._init_mat(hidden_dim * 3, hidden_dim, scale=0.1)
        self.b_fusion = [0.0] * hidden_dim

        # 5. Action Classification Head: [hidden_dim, num_actions]
        self.W_action = self._init_mat(hidden_dim, num_actions, scale=0.1)
        self.b_action = [0.0] * num_actions

        # 6. Divergence Head: [hidden_dim, 1]
        self.W_divergence = self._init_mat(hidden_dim, 1, scale=0.1)
        self.b_divergence = 0.0

        # 7. DNA Deltas Head: [hidden_dim, num_dna_dims]
        self.W_dna = self._init_mat(hidden_dim, num_dna_dims, scale=0.1)
        self.b_dna = [0.0] * num_dna_dims

        # 8. Node Selection Pointer Head: [hidden_dim, hidden_dim]
        self.W_ptr = self._init_mat(hidden_dim, hidden_dim, scale=0.1)

    def _init_mat(self, rows: int, cols: int, scale: float = 0.1) -> List[List[float]]:
        return [[random.gauss(0.0, scale) for _ in range(cols)] for _ in range(rows)]

    def encode_tokens(self, token_ids: List[int]) -> Tuple[List[float], List[float]]:
        """Bidirectional recurrent encoding over prompt tokens."""
        # Embeddings
        embeds = []
        for tid in token_ids:
            safe_id = tid if 0 <= tid < self.vocab_size else 1
            embeds.append(self.W_embed[safe_id])

        # Forward pass
        h_fwd = [0.0] * self.hidden_dim
        for emb in embeds:
            proj = matmul(emb, self.W_gru_fwd)
            h_fwd = [tanh(h_fwd[j] * 0.5 + proj[j]) for j in range(self.hidden_dim)]

        # Backward pass
        h_bwd = [0.0] * self.hidden_dim
        for emb in reversed(embeds):
            proj = matmul(emb, self.W_gru_bwd)
            h_bwd = [tanh(h_bwd[j] * 0.5 + proj[j]) for j in range(self.hidden_dim)]

        return h_fwd, h_bwd

    def encode_ast(
        self, node_features: List[List[float]], edges: List[List[int]]
    ) -> Tuple[List[List[float]], List[float]]:
        """Tree-GNN graph convolution over screen nodes."""
        num_nodes = len(node_features)
        # Build adjacency mapping
        neighbors: Dict[int, List[int]] = {i: [] for i in range(num_nodes)}
        for src, dst in edges:
            if src < num_nodes and dst < num_nodes:
                neighbors[src].append(dst)

        # Graph convolution
        h_nodes = []
        for i in range(num_nodes):
            self_feat = matmul(node_features[i], self.W_gnn_self)
            neigh_sum = [0.0] * self.node_feat_dim
            for n_idx in neighbors[i]:
                for k in range(self.node_feat_dim):
                    neigh_sum[k] += node_features[n_idx][k]
            neigh_feat = matmul(neigh_sum, self.W_gnn_neigh)

            node_h = [
                relu(self_feat[j] + neigh_feat[j] + self.b_gnn[j])
                for j in range(self.hidden_dim)
            ]
            h_nodes.append(node_h)

        # Graph mean-pooling
        h_graph = [0.0] * self.hidden_dim
        if num_nodes > 0:
            for j in range(self.hidden_dim):
                h_graph[j] = sum(h_nodes[i][j] for i in range(num_nodes)) / float(num_nodes)

        return h_nodes, h_graph

    def forward(
        self, prompt: str, screen_ast: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Complete forward pass of the bespoke deep learning model.
        Returns predicted Action, Target Nodes, DNA deltas, Divergence, and Confidence.
        """
        # 1. Tokenize & flatten inputs
        token_ids = tokenize(prompt)
        node_feats, edges, node_ids = flatten_ast(screen_ast)

        # 2. Neural encoders
        h_fwd, h_bwd = self.encode_tokens(token_ids)
        h_nodes, h_graph = self.encode_ast(node_feats, edges)

        # 3. Cross-context fusion vector
        h_concat = h_fwd + h_bwd + h_graph
        h_fusion_pre = matmul(h_concat, self.W_fusion)
        h_fusion = [relu(h_fusion_pre[j] + self.b_fusion[j]) for j in range(self.hidden_dim)]

        # 4. Action prediction head
        action_logits = matmul(h_fusion, self.W_action)
        action_logits = [action_logits[j] + self.b_action[j] for j in range(self.num_actions)]
        action_probs = softmax(action_logits)
        best_action_idx = action_probs.index(max(action_probs))
        predicted_action = IDX_TO_ACTION[best_action_idx]
        confidence = round(max(action_probs), 3)

        # 5. Divergence prediction head (0 to 100)
        div_raw = matmul(h_fusion, self.W_divergence)[0] + self.b_divergence
        predicted_divergence = int(round(sigmoid(div_raw) * 100.0))

        # 6. DNA deltas prediction head (-50 to +50)
        dna_raw = matmul(h_fusion, self.W_dna)
        dna_deltas = {}
        for idx, dim in enumerate(DNA_DIMENSIONS):
            val = round(tanh(dna_raw[idx] + self.b_dna[idx]) * 50.0)
            if abs(val) >= 5:
                dna_deltas[dim] = int(val)

        # 7. Node selection pointer head (which node in the AST is targeted)
        target_node_ids = []
        if predicted_action in ["lock-nodes", "unlock-nodes", "replace-component"]:
            h_ptr_proj = matmul(h_fusion, self.W_ptr)
            node_scores = []
            for i, n_h in enumerate(h_nodes):
                if node_ids[i]:
                    score = sum(h_ptr_proj[j] * n_h[j] for j in range(self.hidden_dim))
                    node_scores.append((score, node_ids[i]))
            if node_scores:
                node_scores.sort(key=lambda x: x[0], reverse=True)
                target_node_ids = [node_scores[0][1]]

        # Construct validated IntentCommand structure
        return {
            "action": predicted_action,
            "summary": f"Bespoke Host ML: Executed {predicted_action} on screen AST.",
            "confidence": confidence,
            "divergenceLevel": predicted_divergence,
            "dnaDeltas": dna_deltas,
            "targetNodeIds": target_node_ids,
        }

    def export_weights(self) -> Dict[str, Any]:
        """Serializes trained weights to a portable JSON format."""
        return {
            "version": "1.0.0",
            "architecture": "TreeGNN-BiGRU-Bespoke",
            "vocab_size": self.vocab_size,
            "embed_dim": self.embed_dim,
            "hidden_dim": self.hidden_dim,
            "W_embed": self.W_embed,
            "W_gru_fwd": self.W_gru_fwd,
            "W_gru_bwd": self.W_gru_bwd,
            "W_gnn_self": self.W_gnn_self,
            "W_gnn_neigh": self.W_gnn_neigh,
            "b_gnn": self.b_gnn,
            "W_fusion": self.W_fusion,
            "b_fusion": self.b_fusion,
            "W_action": self.W_action,
            "b_action": self.b_action,
            "W_divergence": self.W_divergence,
            "b_divergence": self.b_divergence,
            "W_dna": self.W_dna,
            "b_dna": self.b_dna,
            "W_ptr": self.W_ptr,
        }

    def load_weights(self, data: Dict[str, Any]):
        """Loads trained weights from serialized dictionary."""
        self.W_embed = data["W_embed"]
        self.W_gru_fwd = data["W_gru_fwd"]
        self.W_gru_bwd = data["W_gru_bwd"]
        self.W_gnn_self = data["W_gnn_self"]
        self.W_gnn_neigh = data["W_gnn_neigh"]
        self.b_gnn = data["b_gnn"]
        self.W_fusion = data["W_fusion"]
        self.b_fusion = data["b_fusion"]
        self.W_action = data["W_action"]
        self.b_action = data["b_action"]
        self.W_divergence = data["W_divergence"]
        self.b_divergence = data["b_divergence"]
        self.W_dna = data["W_dna"]
        self.b_dna = data["b_dna"]
        self.W_ptr = data["W_ptr"]
