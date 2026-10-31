import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  reverseEngineerDna,
  mapSourceFilesToProject,
  generateAstDiff,
  applyVisualMutationToSource,
} from '../index.js';
import { ProjectManifestSchema } from '@tessellate/schemas';

describe('Phase 19: @tessellate/ingest Bidirectional AST Engine', () => {
  it('reverse engineers Design DNA palette and curvature from Tailwind code', () => {
    const emeraldCode = `
      export function EmeraldCard() {
        return (
          <div className="bg-emerald-900 border border-emerald-500 rounded-2xl p-6 dark:bg-emerald-950">
            <h2 className="text-emerald-100 font-bold">Health Metrics</h2>
            <p className="text-emerald-400">Normal range</p>
          </div>
        );
      }
    `;

    const result = reverseEngineerDna([emeraldCode]);
    expect(result.detectedPalette).toBe('emerald');
    expect(result.detectedCurvature).toBeGreaterThanOrEqual(70);
    expect(result.dna.curvature).toBeGreaterThanOrEqual(70);
  });

  it('does not infer palette or curvature from comments or dynamic CSS-module classes', () => {
    const result = reverseEngineerDna([
      `// className="bg-emerald-900 rounded-2xl"\nexport function Page() { return <main className={styles.root} />; }`,
    ]);

    expect(result.detectedPalette).toBe('unknown');
    expect(result.detectedCurvature).toBe(50);
    expect(result.detectedVisualMode).toBe('unknown');
    expect(result.confidence).toBe(0);
  });

  it('does not claim Design DNA confidence from palette evidence that cannot map to a DNA field', () => {
    const result = reverseEngineerDna([
      `export default function Page() { return <main className="bg-emerald-900" />; }`,
    ]);

    expect(result.detectedPalette).toBe('emerald');
    expect(result.confidence).toBe(0);
  });

  it('does not infer the default visual mode from dark-mode override classes', () => {
    const result = reverseEngineerDna([
      'export default function Page() { return <main className="dark:bg-slate-950" />; }',
    ]);

    expect(result.detectedVisualMode).toBe('unknown');
    expect(result.inferredFields).not.toContain('visualMode');
  });

  it('does not infer base palette or curvature from variant-prefixed utilities', () => {
    const result = reverseEngineerDna([
      'export default function Page() { return <main className="dark:bg-emerald-950 hover:text-rose-600 sm:rounded-none" />; }',
    ]);

    expect(result.detectedPalette).toBe('unknown');
    expect(result.detectedCurvature).toBe(50);
    expect(result.detectedVisualMode).toBe('unknown');
    expect(result.inferredFields).toEqual([]);
    expect(result.confidence).toBe(0);
  });

  it('discloses schema-required Design DNA defaults in a partial imported manifest', () => {
    const result = mapSourceFilesToProject([
      {
        filePath: 'app/page.tsx',
        code: 'export default function Page() { return <main><h1>People</h1></main>; }',
      },
    ]);

    expect(result.warnings.join(' ')).toMatch(/Design DNA.*schema defaults.*not inferred/i);
    expect(result.projectManifest.description).toMatch(/Design DNA.*not inferred/i);
    expect(result.inferredDna.inferredFields).toEqual([]);
    expect(result.inferredDna.defaultedFields).toContain('primaryArchetype');
    expect(result.projectManifest.designDNA.primaryArchetype).toBe('unknown');
    expect(result.projectManifest.designDNA.navigationModel).toBe('unspecified-imported');
  });

  it('maps source TSX files into a valid ProjectManifest schema', () => {
    const files = [
      {
        filePath: 'src/app/page.tsx',
        code: `
          export default function Home() {
            return (
              <div>
                <header className="h-14 border-b">Navbar</header>
                <main className="p-8">
                  <h1>Executive Overview</h1>
                  <div className="grid grid-cols-3 gap-4">
                    <div>Metric 1</div>
                  </div>
                </main>
                <footer>Footer</footer>
              </div>
            );
          }
        `,
      },
      {
        filePath: 'src/app/analytics/page.tsx',
        code: `
          export default function Analytics() {
            return (
              <main className="p-6">
                <h1>Deep Analytics</h1>
              </main>
            );
          }
        `,
      },
    ];

    const result = mapSourceFilesToProject(files, 'Ingested SaaS');
    expect(result.screens).toHaveLength(2);
    expect(result.screens[0]?.name).toBe('Home');
    expect(result.screens[1]?.name).toBe('Analytics');

    // Validate that the generated manifest conforms strictly to ProjectManifestSchema
    const parseResult = ProjectManifestSchema.safeParse(result.projectManifest);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.screens).toHaveLength(2);
    expect(parseResult.data?.screenGraph.groups[0]?.screens).toHaveLength(2);
  });

  it('applies a uniquely targeted static class mutation and preserves application logic', () => {
    const original = `import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
const AppContext = createContext('team');

export function UserDashboard({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  const activeContext = useContext(AppContext);
  const { data } = useQuery({ queryKey: ['user', userId] });

  return (
    <div className="p-4 bg-white">
      <h1 className="text-xl font-bold">Old Dashboard Title</h1>
      <button onClick={() => setActiveTab('settings')}>Go to Settings</button>
    </div>
  );
}`;

    const result = applyVisualMutationToSource(original, {
      fileName: 'UserDashboard.tsx',
      componentName: 'UserDashboard',
      elementPath: 'div[0]/h1[0]',
      attributeName: 'className',
      expectedValue: 'text-xl font-bold',
      replacementValue: 'text-3xl font-extrabold tracking-tight text-primary',
    });

    expect(result.safety).toBe('SAFE');
    expect(result.applied).toBe(true);
    expect(result.modifiedCode).toContain(
      '<h1 className="text-3xl font-extrabold tracking-tight text-primary">Old Dashboard Title</h1>'
    );
    // Ensure hooks and business logic remain untouched
    expect(result.modifiedCode).toContain('const [activeTab, setActiveTab] = useState');
    expect(result.modifiedCode).toContain('const activeContext = useContext(AppContext)');
    expect(result.modifiedCode).toContain("useQuery({ queryKey: ['user', userId] })");

    const diff = generateAstDiff('UserDashboard.tsx', original, result.modifiedCode);
    expect(diff.hasChanges).toBe(true);
    expect(diff.unifiedDiff).toContain(
      '-      <h1 className="text-xl font-bold">Old Dashboard Title</h1>'
    );
    expect(diff.unifiedDiff).toContain(
      '+      <h1 className="text-3xl font-extrabold tracking-tight text-primary">Old Dashboard Title</h1>'
    );
  });

  it('emits a unified diff that Git can validate and apply', () => {
    const original = 'export function Page() {\n  return <main className="p-4">Hello</main>;\n}\n';
    const modified = 'export function Page() {\n  return <main className="p-8">Hello</main>;\n}\n';
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-ingest-diff-'));
    try {
      fs.writeFileSync(path.join(temporaryDirectory, 'Page.tsx'), original);
      const diff = generateAstDiff('Page.tsx', original, modified);
      const patchPath = path.join(temporaryDirectory, 'change.patch');
      fs.writeFileSync(patchPath, `${diff.unifiedDiff}\n`);
      execFileSync('git', ['init', '-q'], { cwd: temporaryDirectory });
      execFileSync('git', ['config', 'core.autocrlf', 'false'], { cwd: temporaryDirectory });
      execFileSync('git', ['apply', '--check', patchPath], { cwd: temporaryDirectory });
      execFileSync('git', ['apply', patchPath], { cwd: temporaryDirectory });

      expect(fs.readFileSync(path.join(temporaryDirectory, 'Page.tsx'), 'utf-8')).toBe(modified);
    } finally {
      fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  });

  it('preserves missing final newlines in an applicable patch', () => {
    const original = 'export const title = "Before";';
    const modified = 'export const title = "After";';
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-ingest-eol-'));
    try {
      fs.writeFileSync(path.join(temporaryDirectory, 'Page.tsx'), original);
      const diff = generateAstDiff('Page.tsx', original, modified);
      const patchPath = path.join(temporaryDirectory, 'change.patch');
      fs.writeFileSync(patchPath, `${diff.unifiedDiff}\n`);
      execFileSync('git', ['init', '-q'], { cwd: temporaryDirectory });
      execFileSync('git', ['config', 'core.autocrlf', 'false'], { cwd: temporaryDirectory });
      execFileSync('git', ['apply', '--check', patchPath], { cwd: temporaryDirectory });
      execFileSync('git', ['apply', patchPath], { cwd: temporaryDirectory });

      expect(fs.readFileSync(path.join(temporaryDirectory, 'Page.tsx'), 'utf-8')).toBe(modified);
    } finally {
      fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  });

  it('applies insertions, deletions, empty files, and final-newline changes', () => {
    const cases = [
      { original: 'one\ntwo\n', modified: 'zero\none\ntwo\n' },
      { original: 'one\ntwo\nthree\n', modified: 'one\nthree\n' },
      { original: '', modified: 'one line\n' },
      { original: 'one line\n', modified: '' },
      { original: 'same line', modified: 'same line\n' },
      { original: 'before\nlast', modified: 'after\nlast' },
    ];

    for (const [index, { original, modified }] of cases.entries()) {
      const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-ingest-diff-case-'));
      try {
        fs.writeFileSync(path.join(temporaryDirectory, 'Page.tsx'), original);
        const diff = generateAstDiff('Page.tsx', original, modified);
        const patchPath = path.join(temporaryDirectory, 'change.patch');
        fs.writeFileSync(patchPath, `${diff.unifiedDiff}\n`);
        execFileSync('git', ['init', '-q'], { cwd: temporaryDirectory });
        execFileSync('git', ['config', 'core.autocrlf', 'false'], { cwd: temporaryDirectory });
        execFileSync('git', ['apply', '--check', patchPath], { cwd: temporaryDirectory });
        execFileSync('git', ['apply', patchPath], { cwd: temporaryDirectory });

        expect(
          fs.readFileSync(path.join(temporaryDirectory, 'Page.tsx'), 'utf-8'),
          `case ${index}`
        ).toBe(modified);
      } finally {
        fs.rmSync(temporaryDirectory, { recursive: true, force: true });
      }
    }
  }, 30_000);

  it('requires review for stale and dynamic class values without modifying source', () => {
    const dynamicSource = `export function Profile({ className }: { className: string }) { return <section className={className} />; }`;
    const staleSource = `export function Profile() { return <section className="p-4" />; }`;
    const request = {
      fileName: 'Profile.tsx',
      componentName: 'Profile',
      elementPath: 'section[0]',
      attributeName: 'className' as const,
      expectedValue: 'p-6',
      replacementValue: 'p-8',
    };

    for (const source of [dynamicSource, staleSource]) {
      const result = applyVisualMutationToSource(source, request);
      expect(result.safety).toBe('REVIEW_REQUIRED');
      expect(result.applied).toBe(false);
      expect(result.modifiedCode).toBe(source);
    }
  });

  it('rejects broad regular-expression edits as unsupported', () => {
    const source = '<h1>Title</h1>';
    const result = applyVisualMutationToSource(source, /<h1>.*?<\/h1>/, '<h1>Changed</h1>');

    expect(result.safety).toBe('UNSUPPORTED');
    expect(result.applied).toBe(false);
    expect(result.modifiedCode).toBe(source);
  });

  it('maps Vite and Next route entrypoints from JSX AST while excluding comments, layouts and reusable components', () => {
    const result = mapSourceFilesToProject([
      {
        filePath: 'src/App.tsx',
        code: `import { useState } from 'react';
// <main><h1>False route</h1></main>
export default function App() { const [tab, setTab] = useState('people'); return <main><h1>People</h1><form><input aria-label="Search people" /><button onClick={() => setTab('teams')}>Teams</button></form></main>; }`,
      },
      {
        filePath: 'src/app/layout.tsx',
        code: `export default function RootLayout({ children }: { children: React.ReactNode }) { return <html><body>{children}</body></html>; }`,
      },
      {
        filePath: 'src/app/team/page.tsx',
        code: `export default function TeamPage() { return <main><section><h1>Teams</h1><PeopleTable /></section></main>; }`,
      },
      {
        filePath: 'src/app/team/layout.tsx',
        code: `export default function TeamLayout({ children }: { children: React.ReactNode }) { return <section>{children}</section>; }`,
      },
      {
        filePath: 'src/app/(workspace)/settings/page.tsx',
        code: `export default function SettingsPage() { return <main><h1>Settings</h1></main>; }`,
      },
      {
        filePath: 'src/app/(workspace)/layout.tsx',
        code: `export default function WorkspaceLayout({ children }: { children: React.ReactNode }) { return <div>{children}</div>; }`,
      },
      {
        filePath: 'src/app/styles/page.tsx',
        code: `import styles from './page.module.css'; export default function StylesPage() { return <main className={styles.root} style={{ color: 'red' }}><h1>Styles</h1></main>; }`,
      },
      {
        filePath: 'src/pages/legacy.tsx',
        code: `export default function LegacyPage() { return <main><h1>Legacy route</h1></main>; }`,
      },
      {
        filePath: 'src/components/PeopleTable.tsx',
        code: `export function PeopleTable() { return <table><tbody><tr><td>Alex</td></tr></tbody></table>; }`,
      },
      {
        filePath: 'src/components/ui/button.tsx',
        code: `export function Button() { return <button className="rounded-md">Save</button>; }`,
      },
    ]);

    expect(result.screens.map((screen) => screen.filePath)).toEqual([
      'src/App.tsx',
      'src/app/team/page.tsx',
      'src/app/(workspace)/settings/page.tsx',
      'src/app/styles/page.tsx',
      'src/pages/legacy.tsx',
    ]);
    expect(result.layoutFilePaths).toEqual([
      'src/app/layout.tsx',
      'src/app/team/layout.tsx',
      'src/app/(workspace)/layout.tsx',
    ]);
    expect(result.screens[1]?.layoutFilePaths).toEqual([
      'src/app/layout.tsx',
      'src/app/team/layout.tsx',
    ]);
    expect(result.screens[2]?.route).toBe('/settings');
    expect(result.screens[2]?.layoutFilePaths).toEqual([
      'src/app/layout.tsx',
      'src/app/(workspace)/layout.tsx',
    ]);
    expect(result.screens[3]?.layoutFilePaths).toEqual(['src/app/layout.tsx']);
    expect(result.screens[4]?.layoutFilePaths).toEqual([]);
    expect(result.screens[0]?.detectedRoles).toEqual(
      expect.arrayContaining(['main', 'form', 'input', 'button'])
    );
    expect(result.screens[1]?.detectedRoles).toEqual(
      expect.arrayContaining(['main', 'section', 'h1', 'PeopleTable'])
    );
    expect(result.screens[3]?.detectedRoles).toEqual(expect.arrayContaining(['main', 'h1']));
    expect(result.ignoredSourceFilePaths).toEqual(
      expect.arrayContaining(['src/components/PeopleTable.tsx', 'src/components/ui/button.tsx'])
    );
    expect(result.warnings.join(' ')).toMatch(/CSS Modules/);
    expect(result.projectManifest.description).toMatch(
      /Next\.js layout wrappers are not included/i
    );
    expect(result.productIntentInferred).toBe(false);
    expect(result.projectManifest.productModel.productArchetypes).toEqual([
      { tag: 'unknown', weight: 1 },
    ]);
  });

  it('recognizes anonymous default React route components without inventing route content', () => {
    const result = mapSourceFilesToProject(
      [
        {
          filePath: 'app/page.tsx',
          code: 'export default () => <main><h1>People</h1></main>;',
        },
      ],
      'People app'
    );

    expect(result.screens).toHaveLength(1);
    expect(result.screens[0]).toMatchObject({ route: '/', filePath: 'app/page.tsx' });
    expect(result.screens[0]?.rootNode.children.map((node) => node.semanticRole)).toEqual(['main']);
    expect(result.projectManifest.productModel.productArchetypes).toEqual([
      { tag: 'unknown', weight: 1 },
    ]);
    expect(result.productIntentInferred).toBe(false);
  });

  it('rejects an isolated reusable component instead of presenting it as a route', () => {
    expect(() =>
      mapSourceFilesToProject([
        {
          filePath: 'src/Button.tsx',
          code: 'export function Button() { return <button>Save</button>; }',
        },
      ])
    ).toThrow(/No supported React route entrypoints were found/);
  });

  it('does not treat a helper component as a Next route without a default page export', () => {
    expect(() =>
      mapSourceFilesToProject([
        {
          filePath: 'app/page.tsx',
          code: 'function HelperCard() { return <article>Helper</article>; } export const metadata = { title: "People" };',
        },
      ])
    ).toThrow(/No supported React route entrypoints/);
  });

  it('preserves Next.js dynamic and catch-all route syntax without malformed parameters', () => {
    const result = mapSourceFilesToProject([
      {
        filePath: 'app/charts/[type]/page.tsx',
        code: 'export default function ChartPage() { return <main><h1>Chart</h1></main>; }',
      },
      {
        filePath: 'app/blocks/[...categories]/page.tsx',
        code: 'export default function BlockPage() { return <main><h1>Blocks</h1></main>; }',
      },
      {
        filePath: 'app/docs/[[...slug]]/page.tsx',
        code: 'export default function DocsPage() { return <main><h1>Docs</h1></main>; }',
      },
    ]);

    expect(result.screens.map((screen) => screen.route)).toEqual([
      '/charts/:type',
      '/blocks/[...categories]',
      '/docs/[[...slug]]',
    ]);
    expect(result.screens.map((screen) => screen.name)).toEqual(['Type', 'Categories', 'Slug']);
  });

  it('names a Next.js root route Home instead of exposing its generic Page function name', () => {
    const result = mapSourceFilesToProject([
      {
        filePath: 'app/page.tsx',
        code: 'export default function Page() { return <main><h1>Welcome</h1></main>; }',
      },
    ]);

    expect(result.projectManifest.screens[0]?.name).toBe('Home');
    expect(result.projectManifest.screenGraph.groups[0]?.screens[0]?.name).toBe('Home');
  });

  it('rejects malformed TSX entrypoints instead of emitting inferred screens', () => {
    expect(() =>
      mapSourceFilesToProject([
        {
          filePath: 'src/App.tsx',
          code: 'export default function App() { return <main>broken</div> }',
        },
      ])
    ).toThrow(/Unable to parse React source/);
  });

  it('rejects a valid component-only tree when no supported application route is present', () => {
    expect(() =>
      mapSourceFilesToProject([
        {
          filePath: 'src/components/ui/button.tsx',
          code: 'export function Button() { return <button>Save</button>; }',
        },
      ])
    ).toThrow(/No supported React route entrypoints/);
  });

  it('reports empty input instead of creating a synthetic project', () => {
    expect(() => mapSourceFilesToProject([])).toThrow(/No React source files/);
  });

  it('classifies syntactically invalid patch input as unsupported and leaves source untouched', () => {
    const source = 'export function Screen() { return <main>Broken</div>; }';
    const result = applyVisualMutationToSource(source, {
      fileName: 'Screen.tsx',
      componentName: 'Screen',
      elementPath: 'main[0]',
      attributeName: 'className',
      expectedValue: '',
      replacementValue: 'p-4',
    });

    expect(result.safety).toBe('UNSUPPORTED');
    expect(result.applied).toBe(false);
    expect(result.modifiedCode).toBe(source);
  });

  it('preserves generic, conditional, client and server component behavior during static styling edits', () => {
    const cases = [
      {
        fileName: 'Members.tsx',
        componentName: 'Members',
        elementPath: 'main[0]/section[0]/h1[0]',
        expectedValue: 'text-xl font-bold',
        replacementValue: 'text-3xl font-extrabold',
        source: `"use client";
import { useState } from 'react';
type Row = { id: string; name: string };
export default function Members<T extends Row>({ rows, title }: { rows: T[]; title: string }) {
  const [selected, setSelected] = useState('');
  const choose = (id: string) => rows.find((row) => row.id === id);
  return <main>{rows.length > 0 ? <section><h1 className="text-xl font-bold">{title}</h1><ul>{rows.map((row) => <li key={row.id} onClick={() => { choose(row.id); setSelected(row.id); }}>{row.name}</li>)}</ul><output>{selected}</output></section> : <p>No employees</p>}</main>;
}`,
        preserved: [
          '"use client";',
          'function Members<T extends Row>',
          'const choose = (id: string) => rows.find((row) => row.id === id)',
          'rows.length > 0 ? <section>',
          'setSelected(row.id)',
        ],
      },
      {
        fileName: 'TeamPage.tsx',
        componentName: 'TeamPage',
        elementPath: 'main[0]/h1[0]',
        expectedValue: 'text-2xl font-semibold',
        replacementValue: 'text-4xl font-bold',
        source: `import { getTeam } from './server-only';
export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = await getTeam(teamId);
  return <main><h1 className="text-2xl font-semibold">{team.name}</h1></main>;
}`,
        preserved: [
          "import { getTeam } from './server-only'",
          'async function TeamPage(',
          'await params',
          'await getTeam(teamId)',
        ],
      },
    ];

    for (const testCase of cases) {
      const result = applyVisualMutationToSource(testCase.source, {
        fileName: testCase.fileName,
        componentName: testCase.componentName,
        elementPath: testCase.elementPath,
        attributeName: 'className',
        expectedValue: testCase.expectedValue,
        replacementValue: testCase.replacementValue,
      });

      expect(result.safety).toBe('SAFE');
      expect(result.applied).toBe(true);
      for (const fragment of testCase.preserved) expect(result.modifiedCode).toContain(fragment);
      expect(result.modifiedCode.replace(testCase.replacementValue, testCase.expectedValue)).toBe(
        testCase.source
      );
    }
  });

  it('rejects unsafe paths in unified diff headers', () => {
    expect(() => generateAstDiff('../outside.tsx', 'before', 'after')).toThrow(
      /relative workspace path/
    );
  });
});
