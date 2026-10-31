import { describe, it, expect } from 'vitest';
import * as ts from 'typescript';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ALL_LINT_RULES, lintSource, formatPrettyReport, formatSarifReport } from '../index.js';
import { maskComments } from '../mask-comments.js';

describe('Phase 18: @tessellate/linter Test Suite', () => {
  it('flags hardcoded color classes without guessing replacement semantics', () => {
    const code = `
      export function BadComponent() {
        return <div className="p-4 bg-[#ffffff] text-[#112233]">Hello</div>;
      }
    `;

    const result = lintSource(code, 'BadComponent.tsx', { fix: true });
    expect(result.issues.length).toBeGreaterThanOrEqual(2);
    expect(result.issues.some((i) => i.ruleId === 'no-hardcoded-colors')).toBe(true);

    const colorIssues = result.issues.filter((issue) => issue.ruleId === 'no-hardcoded-colors');
    expect(colorIssues.every((issue) => issue.fix === undefined)).toBe(true);
    expect(result.fixedCode).toBe(code);
  });

  it('flags selected low-contrast class patterns for human contrast review', () => {
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

  it('calculates explicit Tailwind color pairs without guessing through theme overrides', () => {
    const lowContrast = lintSource(
      '<p className="bg-[#ffffff] text-[#b8b8b8]">Low</p>',
      'Low.tsx'
    ).issues.filter((issue) => issue.ruleId === 'enforce-accessible-contrast');
    const readable = lintSource(
      '<p className="bg-black text-gray-400">Readable</p>',
      'Readable.tsx'
    ).issues.filter((issue) => issue.ruleId === 'enforce-accessible-contrast');
    const themed = lintSource(
      '<p className="bg-[#E7EBFF] text-[#2547E8] dark:bg-[#1C2752] dark:text-[#879DFF]">Themed</p>',
      'Themed.tsx'
    ).issues.filter((issue) => issue.ruleId === 'enforce-accessible-contrast');
    const inverseTheme = lintSource(
      '<button className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">Theme</button>',
      'InverseTheme.tsx'
    ).issues.filter((issue) => issue.ruleId === 'enforce-accessible-contrast');

    expect(lowContrast).toHaveLength(1);
    expect(lowContrast[0]?.message).toContain('below 4.5:1');
    expect(readable).toEqual([]);
    expect(themed).toEqual([]);
    expect(inverseTheme).toEqual([]);
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
    expect(sarif).toContain(
      'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json'
    );
    expect(sarif).toContain('no-hardcoded-colors');
  });

  it('does not report examples that occur only inside source comments', () => {
    const code = `
      // Example: <div className="bg-[#2547E8] p-[17px] animate-spin" />
      /* Example: <span className="text-[#111111]"> */
      export function Clean() { return <main className="p-4">Ready</main>; }
    `;

    expect(lintSource(code, 'Clean.tsx').issues).toEqual([]);
  });

  it('preserves UTF-16 source offsets when comments follow non-BMP text', () => {
    const code =
      'const greeting = "👋"; // className="bg-[#2547E8]"\nexport const Demo = () => <div className="p-[17px]" />;';
    const masked = maskComments(code);
    const result = lintSource(code, 'Offsets.tsx', { fix: true });
    const commentStart = code.indexOf('//');
    const commentEnd = code.indexOf('\n', commentStart);

    expect(masked.length).toBe(code.length);
    expect(masked.indexOf('p-[17px]')).toBe(code.indexOf('p-[17px]'));
    expect(masked.slice(commentStart, commentEnd)).toBe(' '.repeat(commentEnd - commentStart));
    expect(result.fixedCode).toContain('const greeting = "👋"; // className="bg-[#2547E8]"');
    expect(result.fixedCode).toContain('className="p-[16px]"');
    expect(result.fixedCode).toBe(
      'const greeting = "👋"; // className="bg-[#2547E8]"\nexport const Demo = () => <div className="p-[16px]" />;'
    );
  });

  it('checks reduced-motion support on the same element as each animation', () => {
    const code = `
      export function MotionExamples() {
        return <><span className="animate-spin" />
          <span className="animate-pulse motion-reduce:animate-none" />
        </>;
      }
    `;

    const findings = lintSource(code, 'MotionExamples.tsx').issues.filter(
      (issue) => issue.ruleId === 'enforce-reduced-motion'
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]?.snippet).toBe('animate-spin');
  });

  it('accepts motion-safe animations and does not flag other elements in the same file', () => {
    const code = `
      export function MotionSafe() {
        return <><span className="motion-safe:animate-spin" />
          <span className="motion-reduce:animate-none animate-pulse" />
        </>;
      }
    `;

    expect(
      lintSource(code, 'MotionSafe.tsx').issues.filter(
        (issue) => issue.ruleId === 'enforce-reduced-motion'
      )
    ).toEqual([]);
  });

  it('checks static animation classes around a computed template expression', () => {
    const code = `export const Spinner = ({ size }) => <div className={\`animate-spin \${size}\`} />;`;
    const findings = lintSource(code, 'TemplateSpinner.tsx').issues.filter(
      (issue) => issue.ruleId === 'enforce-reduced-motion'
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]?.snippet).toBe('animate-spin');
  });

  it('does not rewrite authored colors to guessed semantic roles', () => {
    const code = '<div className="bg-[#2547E8] text-[#A8AFBA] border-[#D9D6CF]" />';
    const result = lintSource(code, 'BrandButton.tsx', { fix: true });

    expect(result.issues.filter((issue) => issue.ruleId === 'no-hardcoded-colors').length).toBe(3);
    expect(
      result.issues
        .filter((issue) => issue.ruleId === 'no-hardcoded-colors')
        .every((issue) => !issue.fix)
    ).toBe(true);
    expect(result.fixedCode).toBe(code);
  });

  it('keeps every remaining automatic fix syntactically valid TSX', () => {
    const code = `
      export function Spacing() {
        return <main className="p-[17px] gap-[29px]">Hello</main>;
      }
    `;
    const result = lintSource(code, 'Spacing.tsx', { fix: true });
    const transpiled = ts.transpileModule(result.fixedCode ?? '', {
      fileName: 'Spacing.tsx',
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ESNext },
      reportDiagnostics: true,
    });

    expect(result.fixedCode).toContain('p-[16px]');
    expect(result.fixedCode).toContain('gap-[28px]');
    expect(transpiled.diagnostics).toEqual([]);
  });

  it('does not round small spacing down to zero or make a large layout guess', () => {
    const code = '<div className="mb-[1px] gap-[18px]" />';
    const result = lintSource(code, 'SmallSpacing.tsx', { fix: true });
    const spacingFindings = result.issues.filter(
      (issue) => issue.ruleId === 'no-arbitrary-spacing'
    );

    expect(spacingFindings).toHaveLength(2);
    expect(spacingFindings.every((issue) => issue.fix === undefined)).toBe(true);
    expect(result.fixedCode).toBe(code);
  });

  it('describes current checks as heuristics instead of WCAG certification', () => {
    const contrast =
      ALL_LINT_RULES.find((rule) => rule.id === 'enforce-accessible-contrast')?.description ?? '';
    const landmarks =
      ALL_LINT_RULES.find((rule) => rule.id === 'enforce-semantic-landmarks')?.description ?? '';
    expect(contrast).not.toMatch(/WCAG (?:AAA|AA)\s*(?:conformance|certification)/i);
    expect(landmarks).not.toMatch(/required for screen readers|WCAG (?:AAA|AA)/i);
  });

  it('does not say every check passes when no heuristic finding was emitted', () => {
    const pretty = formatPrettyReport({
      fileCount: 1,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      issues: [],
      passed: true,
    });

    expect(pretty).toContain('No findings from the current heuristic rules');
    expect(pretty).not.toMatch(/all .* checks pass/i);
  });

  it('uses route-directory context for landmark checks without flagging reusable components', () => {
    const routePage = lintSource(
      'export function Dashboard() { return <div />; }',
      'src/pages/dashboard/index.tsx'
    ).issues.filter((issue) => issue.ruleId === 'enforce-semantic-landmarks');
    const reusable = lintSource(
      'export function Page() { return <div />; }',
      'src/components/Page.tsx'
    ).issues.filter((issue) => issue.ruleId === 'enforce-semantic-landmarks');

    expect(routePage).toHaveLength(1);
    expect(reusable).toEqual([]);
  });

  it('matches the adjudicated precision/recall benchmark cases', () => {
    const benchmarkPath = path.resolve(process.cwd(), 'quality/linter-benchmark-cases.json');
    const cases = JSON.parse(readFileSync(benchmarkPath, 'utf8')) as Array<{
      id: string;
      rule: string;
      file: string;
      code: string;
      expected: boolean;
      scope: 'included' | 'excluded';
    }>;

    for (const sample of cases.filter((item) => item.scope === 'included')) {
      const predicted = lintSource(sample.code, sample.file).issues.some(
        (issue) => issue.ruleId === sample.rule
      );
      expect(
        predicted,
        `${sample.id} should ${sample.expected ? '' : 'not '}report ${sample.rule}`
      ).toBe(sample.expected);
    }
  });
});
