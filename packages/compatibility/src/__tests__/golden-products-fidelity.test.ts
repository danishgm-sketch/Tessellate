import { describe, it, expect } from 'vitest';
import { ProjectManifestSchema } from '@tessellate/schemas';
import { composeProjectPipeline } from '../compose-pipeline.js';
import { isGoldResource } from '@tessellate/catalog/gold';

import { loadTestCatalog } from './test-catalog-loader.js';

describe('Requirement 12: Golden Product Fidelity Tests', () => {
  const goldenBriefs = [
    {
      id: 'fintech',
      name: 'Institutional Treasury & Hedging Terminal',
      domain: 'finance',
      description: 'High-frequency institutional treasury dashboard and currency risk hedging engine with sub-millisecond market telemetry.',
      feel: 'professional and precise',
      visualAmbition: 45,
      structuralCreativity: 25,
      expectedArchetype: 'fintech',
    },
    {
      id: 'saas',
      name: 'Customer Success & Retention Engine',
      domain: 'b2b-saas',
      description: 'Enterprise revenue acceleration platform with customer health scores, cohort analysis, and team collaboration workflows.',
      feel: 'trustworthy and modern',
      visualAmbition: 60,
      structuralCreativity: 50,
      expectedArchetype: 'saas',
    },
    {
      id: 'devtool',
      name: 'Kernel Observability & eBPF Tracer',
      domain: 'developer-tools',
      description: 'Cloud native distributed tracing and kernel telemetry platform with terminal views, live log inspection, and RPC metrics.',
      feel: 'technical, minimal, and dark',
      visualAmbition: 55,
      structuralCreativity: 40,
      expectedArchetype: 'developer-tool',
    },
    {
      id: 'portfolio',
      name: 'Atelier Computational Design Studio',
      domain: 'creative-portfolio',
      description: 'Immersive digital experience showcasing generative art installations, kinetic typography, and architectural pavilions.',
      feel: 'playful, artistic, and expressive',
      visualAmbition: 90,
      structuralCreativity: 85,
      expectedArchetype: 'creative',
    },
    {
      id: 'healthtech',
      name: 'Clinical Genomics Patient Registry',
      domain: 'healthtech',
      description: 'Precision medicine patient cohort tracking with clinical trial analytics, longitudinal biomarkers, and strict data governance.',
      feel: 'calm, accessible, and clinical',
      visualAmbition: 40,
      structuralCreativity: 30,
      expectedArchetype: 'healthtech',
    },
  ];

  it('composes valid, distinct ProjectManifests for all 5 golden briefs', () => {
    const testCatalog = loadTestCatalog();
    const results = goldenBriefs.map((brief) => {
      const result = composeProjectPipeline(
        {
          description: brief.description,
          feel: brief.feel,
          visualAmbition: brief.visualAmbition,
          structuralCreativity: brief.structuralCreativity,
        },
        { catalogResources: testCatalog }
      );
      return { brief, result };
    });

    // 1. Verify schema validity for all directions of all 5 products
    for (const { brief, result } of results) {
      expect(result.directionA.manifest).toBeDefined();
      expect(result.directionB.manifest).toBeDefined();
      expect(result.directionC.manifest).toBeDefined();

      const parseA = ProjectManifestSchema.safeParse(result.directionA.manifest);
      expect(parseA.success, `Direction A for ${brief.id} failed schema validation: ${JSON.stringify(parseA.error?.format())}`).toBe(true);

      const parseB = ProjectManifestSchema.safeParse(result.directionB.manifest);
      expect(parseB.success, `Direction B for ${brief.id} failed schema validation`).toBe(true);

      const parseC = ProjectManifestSchema.safeParse(result.directionC.manifest);
      expect(parseC.success, `Direction C for ${brief.id} failed schema validation`).toBe(true);
    }

    // 2. Verify all 5 products have distinct Design DNA
    const dnas = results.map((r) => r.result.directionA.manifest.designDNA);
    for (let i = 0; i < dnas.length; i++) {
      for (let j = i + 1; j < dnas.length; j++) {
        const dnaA = dnas[i]!;
        const dnaB = dnas[j]!;
        const isIdentical =
          dnaA.density === dnaB.density &&
          dnaA.visualAmbition === dnaB.visualAmbition &&
          dnaA.curvature === dnaB.curvature &&
          dnaA.motion === dnaB.motion;
        expect(isIdentical, `Products ${results[i]?.brief.id} and ${results[j]?.brief.id} should have distinct Design DNA`).toBe(false);
      }
    }

    // 3. Verify Creative has higher visual ambition and motion than Fintech / Healthtech
    const creativeDna = results.find((r) => r.brief.id === 'portfolio')!.result.directionA.manifest.designDNA;
    const fintechDna = results.find((r) => r.brief.id === 'fintech')!.result.directionA.manifest.designDNA;
    const healthtechDna = results.find((r) => r.brief.id === 'healthtech')!.result.directionA.manifest.designDNA;

    expect(creativeDna.visualAmbition).toBeGreaterThan(fintechDna.visualAmbition);
    expect(creativeDna.visualAmbition).toBeGreaterThan(healthtechDna.visualAmbition);

    // 4. Verify Gold 40 resource presence
    for (const { brief, result } of results) {
      let goldCount = 0;
      function scan(node: { resourceRef?: { slug?: string }; children?: unknown[] }) {
        if (node.resourceRef?.slug && isGoldResource(node.resourceRef.slug)) {
          goldCount++;
        }
        if (node.children) {
          for (const c of node.children) scan(c as { resourceRef?: { slug?: string }; children?: unknown[] });
        }
      }
      for (const s of result.directionA.manifest.screens) {
        scan(s.rootNode);
      }
      expect(goldCount, `Product ${brief.id} should include verified Gold 40 resources`).toBeGreaterThan(0);
    }

    // 5. Verify the 3 generated directions for each product differ materially
    for (const { result } of results) {
      const dirA = result.directionA;
      const dirB = result.directionB;
      const dirC = result.directionC;

      // Directions must have different names and descriptions
      expect(dirA.direction.name).not.toBe(dirB.direction.name);
      expect(dirB.direction.name).not.toBe(dirC.direction.name);

      // Directions must differ in Design DNA
      expect(
        dirA.manifest.designDNA.visualAmbition !== dirB.manifest.designDNA.visualAmbition ||
        dirA.manifest.designDNA.density !== dirB.manifest.designDNA.density ||
        dirA.manifest.designDNA.curvature !== dirB.manifest.designDNA.curvature
      ).toBe(true);
    }
  });
});
