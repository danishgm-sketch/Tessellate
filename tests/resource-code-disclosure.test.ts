import { describe, expect, it } from 'vitest';
import { getResourceCodeDisclosure, getResourceVariantsDisclosure, getResourceVersionDisclosure } from '../apps/site/src/lib/resource-code-disclosure';

describe('resource source disclosure', () => {
  it('does not present unlicensed local source as published or installable', () => {
    expect(getResourceCodeDisclosure(false)).toEqual({
      installHeading: null,
      sourceHeading: 'Local source (UNLICENSED; rights review required):',
      notice: 'This source is shown for private local inspection only. Do not install or redistribute it while its license and upstream attribution remain unresolved.',
    });
  });

  it('shows install and published labels only after redistribution is verified', () => {
    expect(getResourceCodeDisclosure(true)).toEqual({
      installHeading: 'Install component via CLI:',
      sourceHeading: 'Published source (React + Tailwind):',
      notice: null,
    });
  });

  it('does not imply declared variants or historical releases when they are absent', () => {
    expect(getResourceVariantsDisclosure(0)).toBe('No named Tessellate variants are declared for this resource. The preview uses its source defaults.');
    expect(getResourceVersionDisclosure('1.0.0')).toBe('Version 1.0.0 is the value declared in this manifest. Historical release notes and variant certification are not available here.');
  });
});
