import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../../../../quality/evidence/step-26/verify-installed-cli.mjs', import.meta.url));
const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('packaged CLI', () => {
  it('installs and runs its command surface from outside the monorepo', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tess CLI package test-'));
    tempDirs.push(tempDir);
    const reportPath = path.join(tempDir, 'report.json');
    const result = spawnSync(process.execPath, [script], {
      cwd: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..'),
      encoding: 'utf8',
      timeout: 120_000,
      env: { ...process.env, TESS_CLI_REPORT_PATH: reportPath },
    });

    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr || result.stdout).toBe(0);
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as {
      status: string;
      packedAndInstalledOutsideMonorepo: boolean;
      commandCount: number;
      commands: Array<{ command: string; status: number | null }>;
    };
    expect(report.status).toBe('passed');
    expect(report.packedAndInstalledOutsideMonorepo).toBe(true);
    expect(report.commandCount).toBe(14);
    expect(report.commands.every((command) => command.status === 0)).toBe(true);
  }, 120_000);
});
