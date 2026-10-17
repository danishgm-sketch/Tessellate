import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import {
  runRegistryGate,
  checkSchemaValidity,
  checkTokenHygiene,
  checkAccessibilityGate,
  checkResponsiveGate,
  checkReducedMotionGate,
  checkSecurityIsolationGate,
  checkBundleBudgetGate,
  checkLicenseProvenanceGate,
} from '../index.js';

describe('Phase 18 — @tessellate/registry-gate Test Suite', () => {
  const repoRoot = path.resolve(__dirname, '../../../..');
  const buttonDir = path.join(repoRoot, 'resources/primitives/button');

  it('runs complete quality gate audit on canonical button primitive and passes', async () => {
    const report = await runRegistryGate(buttonDir);

    expect(report.resourceSlug).toBe('button');
    expect(report.resourceName).toBe('Button');
    expect(report.overallStatus).toBe('approved');
    expect(report.failedChecks).toBe(0);
    expect(report.totalScore).toBeGreaterThanOrEqual(90);
    expect(report.markdownReport).toContain('GATE PASSED — APPROVED FOR REGISTRY');
  });

  it('correctly catches hardcoded colors in token hygiene check', () => {
    const badCode = `
      export function BadCard() {
        return <div className="bg-[#123456] text-[#FFFFFF] p-[17px]">Hello</div>;
      }
    `;
    const res = checkTokenHygiene(badCode);
    expect(res.status).toBe('fail');
    expect(res.details).toContain('unapproved arbitrary color');
    expect(res.remediation).toBeDefined();
  });

  it('correctly catches security violations (eval, dangerouslySetInnerHTML)', () => {
    const dangerousCode = `
      export function Insecure() {
        eval("alert('pwned')");
        return <div dangerouslySetInnerHTML={{ __html: '<span>danger</span>' }} />;
      }
    `;
    const res = checkSecurityIsolationGate(dangerousCode);
    expect(res.status).toBe('fail');
    expect(res.score).toBe(0);
    expect(res.details).toContain('dynamic code execution');
    expect(res.details).toContain('dangerouslySetInnerHTML');
  });

  it('correctly catches unhandled motion without reduced-motion fallback', () => {
    const animatedCode = `
      export function SpinningLoader() {
        return <div className="animate-spin duration-300">Loading...</div>;
      }
    `;
    const res = checkReducedMotionGate(animatedCode);
    expect(res.status).toBe('fail');
    expect(res.remediation).toContain('motion-reduce:animate-none');

    const safeCode = `
      export function SafeLoader() {
        return <div className="animate-spin motion-reduce:animate-none">Loading...</div>;
      }
    `;
    const safeRes = checkReducedMotionGate(safeCode);
    expect(safeRes.status).toBe('pass');
  });

  it('correctly flags fixed wide containers that break mobile', () => {
    const rigidCode = `
      export function WideTable() {
        return <div className="w-[1400px]">Content</div>;
      }
    `;
    const res = checkResponsiveGate(rigidCode);
    expect(res.status).toBe('fail');
    expect(res.details).toContain('360px mobile viewports');
  });

  it('rejects a resource in sandbox audit when multiple critical gates fail', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-bad-comp-'));
    try {
      fs.writeFileSync(
        path.join(tempDir, 'manifest.json'),
        JSON.stringify({
          schemaVersion: '1.0.0',
          id: 'bad-comp',
          name: 'Bad Component',
          // Missing required fields
        }),
        'utf-8'
      );
      fs.writeFileSync(
        path.join(tempDir, 'index.tsx'),
        `
          export function Bad() {
            eval('bad()');
            return <div className="bg-[#ff0000] w-[1600px] animate-bounce">Bad</div>;
          }
        `,
        'utf-8'
      );

      const report = await runRegistryGate(tempDir);
      expect(report.overallStatus).toBe('rejected');
      expect(report.failedChecks).toBeGreaterThanOrEqual(3);
      expect(report.markdownReport).toContain('GATE FAILED — REJECTED');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
