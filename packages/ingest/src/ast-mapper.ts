import * as path from 'node:path';
import type { ProjectManifest, ProjectScreen, ProjectNode } from '@tessellate/schemas';
import { ProductModelSchema } from '@tessellate/schemas';
import { DEFAULT_DESIGN_DNA } from '@tessellate/dna';
import type { IngestionResult, IngestedScreen, InferredDnaResult } from './types.js';
import { reverseEngineerDna } from './dna-reverse-engineer.js';

function extractNameFromPath(filePath: string): string {
  const base = path.basename(filePath, path.extname(filePath));
  if (base.toLowerCase() === 'page' || base.toLowerCase() === 'index') {
    const parent = path.basename(path.dirname(filePath)).toLowerCase();
    if (!parent || parent === '.' || parent === 'app' || parent === 'pages' || parent === 'src') {
      return 'Home';
    }
    return toTitleCase(parent);
  }
  return toTitleCase(base.replace(/(?:screen|view|page)$/i, ''));
}

function toTitleCase(str: string): string {
  const clean = str.replace(/[^a-zA-Z0-9]/g, ' ').trim();
  return clean.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || 'Screen';
}

function parseNodesFromJsx(code: string, screenSlug: string): ProjectNode {
  const children: ProjectNode[] = [];
  const detectedRoles: string[] = [];

  // Check for header/nav
  if (/<header[\s>]|<nav[\s>]/i.test(code)) {
    children.push({
      id: `${screenSlug}-shell-1`,
      nodeType: 'layout',
      semanticRole: 'shell',
      variant: 'default',
      children: [],
      slots: {},
      props: { title: 'App Shell' },
    });
    detectedRoles.push('shell');
  }

  // Check for primary main / hero content
  if (/<main[\s>]|<h1[\s>]/i.test(code)) {
    children.push({
      id: `${screenSlug}-hero-1`,
      nodeType: 'section',
      semanticRole: 'hero',
      variant: 'statement',
      children: [],
      slots: {},
      props: {},
    });
    detectedRoles.push('hero');
  }

  // Check for metric cards / data displays
  if (/(?:metric|stat|kpi|card)/i.test(code)) {
    children.push({
      id: `${screenSlug}-content-1`,
      nodeType: 'block',
      semanticRole: 'primary-content',
      variant: 'metric-grid',
      children: [],
      slots: {},
      props: {},
    });
    detectedRoles.push('primary-content');
  } else {
    children.push({
      id: `${screenSlug}-content-1`,
      nodeType: 'block',
      semanticRole: 'primary-content',
      variant: 'default',
      children: [],
      slots: {},
      props: {},
    });
    detectedRoles.push('primary-content');
  }

  // Check for footer
  if (/<footer[\s>]/i.test(code)) {
    children.push({
      id: `${screenSlug}-footer-1`,
      nodeType: 'layout',
      semanticRole: 'footer',
      variant: 'minimal',
      children: [],
      slots: {},
      props: {},
    });
    detectedRoles.push('footer');
  }

  return {
    id: `${screenSlug}-root`,
    nodeType: 'layout',
    semanticRole: 'screen-root',
    variant: 'canvas',
    children,
    slots: {},
    props: {},
  };
}

export function mapSourceFilesToProject(
  files: Array<{ filePath: string; code: string }>,
  projectName = 'Ingested Project'
): IngestionResult {
  const contents = files.map((f) => f.code);
  const inferredDna = reverseEngineerDna(contents);

  const screens: IngestedScreen[] = [];
  const manifestScreens: ProjectScreen[] = [];
  const nodes: Array<{ id: string; name: string; route: string; role: string; screenType: string }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const name = extractNameFromPath(file.filePath);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `screen-${i + 1}`;
    const rootNode = parseNodesFromJsx(file.code, slug);
    const id = `screen-${slug}`;

    const ingestedScreen: IngestedScreen = {
      id,
      name,
      slug,
      filePath: file.filePath,
      rootNode,
      detectedRoles: rootNode.children.map((c) => c.semanticRole),
    };
    screens.push(ingestedScreen);

    manifestScreens.push({
      id,
      name,
      slug,
      screenNodeId: rootNode.id,
      rootNode,
    });
  }

  const screenNodes = screens.map((s, idx) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    screenType: 'standard',
    purpose: `Manage and view ${s.name}`,
    jobs: ['monitor', 'view'],
    required: true,
    navigationVisibility: (idx === 0 ? 'primary' : 'secondary') as 'primary' | 'secondary',
    importance: idx === 0 ? 100 : 75,
    expectedData: ['items'],
    requiredRoles: s.detectedRoles,
    optionalRoles: [],
  }));

  const screenGraph = {
    id: `sg_${Date.now()}`,
    groups: [
      {
        id: 'grp-main',
        name: 'Main Application',
        screens: screenNodes,
      },
    ],
    edges: screens.slice(1).map((s, idx) => ({
      id: `edge-${screens[0]!.id}-${s.id}-${idx}`,
      fromScreenId: screens[0]!.id,
      toScreenId: s.id,
      label: s.name,
    })),
  };

  const projectManifest: ProjectManifest = {
    schemaVersion: '1.0.0',
    id: `proj_ingested_${Date.now()}`,
    name: projectName,
    description: `Ingested from existing codebase containing ${files.length} interface files.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    catalogVersion: '1.0.0',
    seed: `tess-ingest-${Date.now()}`,
    productModel: ProductModelSchema.parse({
      schemaVersion: '1.0.0',
      productArchetypes: [{ tag: 'saas', weight: 1.0 }],
      primaryAudience: 'operators',
      userSophistication: 50,
      primaryObjective: 'Manage and orchestrate operations',
      jobsToBeDone: ['Monitor metrics', 'Execute workflows'],
      trustRequirement: 80,
      informationComplexity: 50,
      dataDensity: 50,
      collaborationLevel: 30,
      transactionCriticality: 40,
      navigationComplexity: 40,
      mobileImportance: 50,
      constraints: {
        accessibilityFloor: 'AAA',
        performanceCeiling: 'balanced',
        targetDevices: ['desktop', 'tablet', 'mobile'],
      },
    }),
    designDNA: inferredDna.dna,
    constraints: {
      accessibilityFloor: 'AAA',
      performanceCeiling: 'balanced',
      targetDevices: ['desktop', 'tablet', 'mobile'],
    },
    screenGraph,
    screens: manifestScreens,
    navigation: {
      model: 'sidebar-fixed',
      primaryItems: screens.map((s, idx) => ({
        id: `nav-${s.slug}`,
        label: s.name,
        targetScreenId: s.id,
        order: idx + 1,
      })),
    },
    assets: [],
    locks: [],
    historyMeta: {
      totalOperations: 1,
      headRevision: 1,
    },
    exportSettings: {
      framework: 'react',
      styling: 'tailwind',
      includeTypes: true,
      target: 'vite-react-tailwind',
    },
  };

  return {
    projectManifest,
    screens,
    inferredDna,
    sourceFileCount: files.length,
  };
}
