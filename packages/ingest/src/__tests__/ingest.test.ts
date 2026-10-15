import { describe, it, expect } from 'vitest';
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

  it('generates unified git diff patches and safely preserves hooks', () => {
    const original = `import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export function UserDashboard({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { data } = useQuery({ queryKey: ['user', userId] });

  return (
    <div className="p-4 bg-white">
      <h1 className="text-xl font-bold">Old Dashboard Title</h1>
      <button onClick={() => setActiveTab('settings')}>Go to Settings</button>
    </div>
  );
}`;

    const { modifiedCode, applied } = applyVisualMutationToSource(
      original,
      /<h1 className="text-xl font-bold">Old Dashboard Title<\/h1>/,
      '<h1 className="text-3xl font-extrabold tracking-tight text-primary">New Composed Dashboard Title</h1>'
    );

    expect(applied).toBe(true);
    expect(modifiedCode).toContain('New Composed Dashboard Title');
    // Ensure hooks and business logic remain untouched
    expect(modifiedCode).toContain('const [activeTab, setActiveTab] = useState');
    expect(modifiedCode).toContain("useQuery({ queryKey: ['user', userId] })");

    const diff = generateAstDiff('UserDashboard.tsx', original, modifiedCode);
    expect(diff.hasChanges).toBe(true);
    expect(diff.unifiedDiff).toContain('-      <h1 className="text-xl font-bold">Old Dashboard Title</h1>');
    expect(diff.unifiedDiff).toContain('+      <h1 className="text-3xl font-extrabold tracking-tight text-primary">New Composed Dashboard Title</h1>');
  });
});
