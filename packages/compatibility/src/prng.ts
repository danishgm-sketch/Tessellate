/**
 * Deterministic pseudo-random number generator (Mulberry32) for reproducible composition.
 */
export class SeededRandom {
  private state: number;

  constructor(seed: string | number = 42) {
    if (typeof seed === 'string') {
      this.state = SeededRandom.hashString(seed);
    } else {
      this.state = seed | 0;
    }
  }

  /**
   * Hashes a string into a 32-bit signed integer using FNV-1a.
   */
  public static hashString(str: string): number {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash | 0;
  }

  /**
   * Returns a pseudo-random floating point number in [0, 1).
   */
  public next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a pseudo-random integer in [min, max] inclusive.
   */
  public nextInt(min: number, max: number): number {
    const r = this.next();
    return Math.floor(r * (max - min + 1)) + min;
  }

  /**
   * Random choice from an array.
   */
  public pick<T>(array: readonly T[]): T | undefined {
    if (array.length === 0) return undefined;
    const idx = this.nextInt(0, array.length - 1);
    return array[idx];
  }

  /**
   * Shuffles an array deterministically without mutating the original.
   */
  public shuffle<T>(array: readonly T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      const temp = copy[i]!;
      copy[i] = copy[j]!;
      copy[j] = temp;
    }
    return copy;
  }
}

export function createSeededRandom(seed: string | number): SeededRandom {
  return new SeededRandom(seed);
}
