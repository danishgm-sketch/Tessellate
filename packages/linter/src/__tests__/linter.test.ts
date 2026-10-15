import { describe, it, expect } from 'vitest';
import { lintSource, formatPrettyReport, formatSarifReport } from '../index.js';

describe('Phase 18: @tessellate/linter Test Suite', () => {
  it('flags hardcoded colors and generates automated fix', () => {
    const code = `
      export function BadComponent() {
        return <div className="p-4 bg-[#ffffff] text-[#112233]">Hello</div>;
      }
    `;

    const result = lintSource(code, 'BadComponent.tsx', { fix: true });
    expect(result.issues.length).toBeGreaterThanOrEqual(2);
    expect(result.issues.some((i) => i.ruleId === 'no-hardcoded-colors')).toBe(true);

    expect(result.fixedCode).toBeDefined();
    expect(result.fixedCode).toContain('bg-[var(--tess-surface-secondary,#F2EFE9)]');
    expect(result.fixedCode).toContain('text-[var(--tess-ink,#111217)]');
  });

  it('detects low contrast anti-patterns according to WCAG AAA', () => {
    const code = `
      export function LowContrast() {
        return <div className="text-zinc-300 bg-white">Unreadable</div>;
      }
    `;

    const result = lintSource(code, 'LowContrast.tsx');
    expect(result.issues.some((i) => i.ruleId === 'enforce-accessible-contrast')).toBe(true);
    const issue = result.issues.find((i) => i.ruleId === 'enforce-accessible-contrast');
    expect(issue?.severity).toBe('error');
  });

  it('flags irregular off-grid spacing classes', () => {
    const code = `
      export function IrregularSpacing() {
        return <div className="p-[17px] gap-[29px]">Off Grid</div>;
      }
    `;

    const result = lintSource(code, 'IrregularSpacing.tsx', { fix: true });
    expect(result.issues.some((i) => i.ruleId === 'no-arbitrary-spacing')).toBe(true);
    expect(result.fixedCode).toContain('p-[16px]');
    expect(result.fixedCode).toContain('gap-[28px]');
  });

  it('flags animations missing motion-reduce modifiers', () => {
    const code = `
      export function AnimatedSpinner() {
        return <div className="animate-spin text-primary">Loading</div>;
      }
    `;

    const result = lintSource(code, 'AnimatedSpinner.tsx');
    expect(result.issues.some((i) => i.ruleId === 'enforce-reduced-motion')).toBe(true);
  });

  it('passes on compliant, accessible components', () => {
    const cleanCode = `
      export function CleanPage() {
        return (
          <main className="p-4 bg-surface-secondary text-ink-primary motion-reduce:transition-none">
            <h1 className="text-2xl font-bold">Compliant Title</h1>
          </main>
        );
      }
    `;

    const result = lintSource(cleanCode, 'CleanPage.tsx');
    expect(result.issues.filter((i) => i.severity === 'error').length).toBe(0);
  });

  it('formats terminal and SARIF reports correctly', () => {
    const report = {
      fileCount: 2,
      errorCount: 1,
      warningCount: 1,
      infoCount: 0,
      issues: [
        {
          ruleId: 'no-hardcoded-colors',
          severity: 'warning' as const,
          message: 'Hardcoded color detected',
          file: 'Component.tsx',
          line: 10,
          column: 5,
        },
      ],
      passed: false,
    };

    const pretty = formatPrettyReport(report);
    expect(pretty).toContain('Tessellate Design DNA Linter');
    expect(pretty).toContain('Component.tsx:10:5');

    const sarif = formatSarifReport(report);
    expect(sarif).toContain('https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json');
    expect(sarif).toContain('no-hardcoded-colors');
  });
});
