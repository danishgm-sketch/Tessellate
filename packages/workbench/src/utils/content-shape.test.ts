import { describe, expect, it } from 'vitest';
import { assertContentShape } from './content-shape.js';

describe('editable resource content contracts', () => {
  it('keeps the array element contract available after the current value is cleared', () => {
    const originalTemplate = [{ id: 'employee-1', name: 'Mina' }];

    expect(() => assertContentShape(originalTemplate, [], 'rows')).not.toThrow();
    expect(() => assertContentShape(originalTemplate, [null], 'rows')).toThrow('rows[0] must be an object.');
    expect(() => assertContentShape(originalTemplate, [{ id: 2, name: 'Mina' }], 'rows')).toThrow('rows[0].id must be string.');
  });
});
