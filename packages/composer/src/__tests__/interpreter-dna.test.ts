import { describe, expect, it } from 'vitest';
import { interpretProductBrief } from '../interpreter.js';

describe('Product brief Design DNA controls', () => {
  it('uses the same continuous ambition and creativity mapping as Workbench', () => {
    const result = interpretProductBrief({
      description: 'An employee experience platform for a 500-person technology company.',
      visualAmbition: 100,
      structuralCreativity: 100,
    });

    expect(result.initialDesignDna.visualAmbition).toBe(100);
    expect(result.initialDesignDna.typographicExpression).toBe(94);
    expect(result.initialDesignDna.motion).toBe(95);
    expect(result.initialDesignDna.structuralCreativity).toBe(100);
    expect(result.initialDesignDna.asymmetry).toBe(90);
  });
});
