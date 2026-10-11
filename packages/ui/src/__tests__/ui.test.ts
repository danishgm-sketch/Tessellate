import { describe, it, expect } from 'vitest';
import { colors, radii, spacing, typography } from '../tokens.js';
import { Mark } from '../components/mark.js';
import { Button } from '../components/button.js';
import { Input } from '../components/input.js';
import { Chip } from '../components/chip.js';
import { Header } from '../components/header.js';

describe('Tessellate UI Primitives & Design Tokens', () => {
  describe('Tokens', () => {
    it('defines authoritative light tokens from DESIGN_SYSTEM.md', () => {
      expect(colors.light.canvas).toBe('#F4F2ED');
      expect(colors.light.surface).toBe('#FAF9F6');
      expect(colors.light.ink).toBe('#111217');
      expect(colors.light.cobalt).toBe('#2547E8');
      expect(colors.light.lime).toBe('#C9FF57');
    });

    it('defines authoritative dark Workbench tokens from DESIGN_SYSTEM.md', () => {
      expect(colors.dark.canvas).toBe('#0B0D10');
      expect(colors.dark.panel).toBe('#111419');
      expect(colors.dark.border).toBe('#272C34');
      expect(colors.dark.text).toBe('#F5F7FA');
      expect(colors.dark.accent).toBe('#6782FF');
    });

    it('defines 4px base geometry and sequence', () => {
      expect(radii.xs).toBe('4px');
      expect(radii.sm).toBe('8px');
      expect(radii.md).toBe('14px');
      expect(radii.lg).toBe('20px');
      expect(spacing[1]).toBe('4px');
      expect(spacing[4]).toBe('16px');
      expect(typography.fontSans).toContain('Geist');
    });
  });

  describe('Components', () => {
    it('exports all component constructors', () => {
      expect(Mark).toBeDefined();
      expect(Button).toBeDefined();
      expect(Input).toBeDefined();
      expect(Chip).toBeDefined();
      expect(Header).toBeDefined();
    });
  });
});
