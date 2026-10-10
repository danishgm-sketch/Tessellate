/**
 * Semantic search adapter boundary with lazy model loading and
 * WebGPU -> WASM -> text fallback capability detection.
 */

export type HardwareAcceleration = 'webgpu' | 'wasm' | 'cpu' | 'none';

export interface SemanticSearchAdapter {
  isAvailable(): boolean;
  getBackend(): HardwareAcceleration;
  loadModel(): Promise<boolean>;
  embedText(text: string): Promise<Float32Array | null>;
  cosineSimilarity(a: Float32Array, b: Float32Array): number;
}

/**
 * Detects available client hardware acceleration for local inference.
 */
export async function detectHardwareAcceleration(): Promise<HardwareAcceleration> {
  if (typeof window === 'undefined') {
    return 'cpu';
  }

  // Check WebGPU availability
  if ('gpu' in navigator && typeof (navigator as unknown as { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu?.requestAdapter === 'function') {
    try {
      const adapter = await (navigator as unknown as { gpu: { requestAdapter: () => Promise<unknown> } }).gpu.requestAdapter();
      if (adapter) {
        return 'webgpu';
      }
    } catch {
      // Fall through to WASM
    }
  }

  // Check WebAssembly availability
  if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
    return 'wasm';
  }

  return 'none';
}

/**
 * Computes cosine similarity between two float vectors.
 */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const valA = a[i] ?? 0;
    const valB = b[i] ?? 0;
    dot += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class LocalSemanticAdapter implements SemanticSearchAdapter {
  private backend: HardwareAcceleration = 'none';
  private modelLoaded = false;

  constructor() {
    // Model is never loaded on initialization to respect page performance budgets
  }

  isAvailable(): boolean {
    return this.modelLoaded;
  }

  getBackend(): HardwareAcceleration {
    return this.backend;
  }

  /**
   * Lazily loads the local embedding model upon explicit activation or user opt-in.
   */
  async loadModel(): Promise<boolean> {
    try {
      this.backend = await detectHardwareAcceleration();
      // Future hook for Transformers.js pipeline('@xenova/all-MiniLM-L6-v2')
      // For baseline local execution, flag as ready
      this.modelLoaded = true;
      return true;
    } catch {
      this.modelLoaded = false;
      this.backend = 'none';
      return false;
    }
  }

  async embedText(_text: string): Promise<Float32Array | null> {
    if (!this.modelLoaded) {
      return null;
    }
    // Placeholder returning vector for demonstration or testing
    return new Float32Array(384);
  }

  cosineSimilarity(a: Float32Array, b: Float32Array): number {
    return cosineSimilarity(a, b);
  }
}
