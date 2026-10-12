import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProjectManifestSchema, type ProjectNode, type ResourceManifest } from '@tessellate/schemas';
import { composeProjectPipeline } from '../packages/compatibility/src/compose-pipeline.js';
import { ManifestRenderer } from '@tessellate/renderer';
import { getReplaceCandidates, createReplaceOperation } from '../packages/workbench/src/mutations/replace.js';
import { applyOperation } from '../packages/workbench/src/history/history-manager.js';
import { useWorkbenchStore } from '../packages/workbench/src/store/workbench-store.js';
import { getNodePath } from '../packages/workbench/src/utils/tree-helpers.js';
import { normalizeDesignTokens } from '@tessellate/renderer';
import {surpriseMe} from '../packages/workbench/src/mutations/surprise.js';
import { getSemanticPalette } from '@tessellate/dna';

const brief = {
  description: 'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.',
  feel: 'professional but playful', visualAmbition: 40, structuralCreativity: 55,
};
const resources: ResourceManifest[] = JSON.parse(readFileSync('apps/site/public/data/catalog.json', 'utf8')).resources;
const result = () => composeProjectPipeline(brief, {catalogResources: resources, seed: 'employee-audit'});
const walk = (node: ProjectNode): ProjectNode[] => [node, ...node.children.flatMap(walk)];

describe('Deployed employee journey regressions', () => {
  it('applies a persisted semantic palette rather than changing an unrelated DNA number',()=>{
    const manifest=result().directionA.manifest;
    const palette=getSemanticPalette('coral-human')!;
    const tokens=normalizeDesignTokens(manifest.designDNA,{tokenOverrides:{paletteId:palette.id}});
    expect(tokens.colors.accent).toBe(palette.light.accent);
  });
  it('infers people workflows rather than incidental dashboard/technical vocabulary', () => {
    const product = result().productModel;
    expect(product.primaryAudience).toMatch(/employee|people/i);
    expect(product.entities.map(e => e.name)).toEqual(expect.arrayContaining(['Employee', 'Team']));
    expect(product.likelyScreens.some(s => s.screenType === 'onboarding')).toBe(true);
    expect(JSON.stringify(product)).not.toMatch(/telemetry|trading|order.book|quantitative performance/i);
  });

  it('renders role-appropriate components and employee copy in every direction', () => {
    const composed = result();
    for (const output of [composed.directionA, composed.directionB, composed.directionC]) {
      expect(output.diagnostics).toEqual([]);
      expect(ProjectManifestSchema.safeParse(output.manifest).success).toBe(true);
      expect(output.manifest.screens.some(s=>s.slug==='/onboarding')).toBe(true);
      const dashboard = output.manifest.screens.find(s=>s.slug==='/overview')!;
      expect(walk(dashboard.rootNode).find(n=>n.semanticRole==='metric-cards')?.resourceRef?.slug).toBe('dashboard-kpi-grid');
      const html = output.manifest.screens.map(s=>renderToStaticMarkup(<ManifestRenderer manifest={output.manifest} activeScreenId={s.id}/>)).join('\n');
      expect(html).toMatch(/people|employee|onboarding/i);
      expect(html).not.toMatch(/High CPU|Incidents Queue|Ingestion|Active Clusters|sub-millisecond|Marcus Vance|Nav Tree|Visual Canvas/);
    }
  });

  it('never offers a chart for a profile header or an unknown runtime variant', () => {
    const manifest = result().directionC.manifest;
    const node = manifest.screens.flatMap(s=>walk(s.rootNode)).find(n=>n.semanticRole==='overview-header')!;
    const candidates = getReplaceCandidates(manifest, node.id, resources);
    expect(candidates.map(c=>c.resource.slug)).not.toContain('area-chart');
    for(const candidate of candidates) {
      const op = createReplaceOperation(manifest,node.id,candidate.resource,candidate.defaultVariant);
      const changed = applyOperation(manifest,op).nextManifest;
      const replacement = changed.screens.flatMap(s=>walk(s.rootNode)).find(n=>n.id===node.id)!;
      expect(['quiet','expressive','nocturne']).toContain(replacement.variant);
      expect(ProjectManifestSchema.safeParse(changed).success).toBe(true);
    }
  });

  it('compares against the loaded project and opens truthful mode controls', () => {
    const manifest = result().directionC.manifest;
    useWorkbenchStore.getState().setManifest(manifest);
    useWorkbenchStore.getState().openCompare();
    expect(useWorkbenchStore.getState().compareManifest?.id).toBe(manifest.id);
    for (const mode of ['style','motion','content'] as const) {
      useWorkbenchStore.getState().setActiveMode(mode);
      expect(useWorkbenchStore.getState().activeRightTab).toBe(mode);
    }
  });

  it('keeps a locked summary visually unchanged when project intent changes', () => {
    const manifest = result().directionC.manifest;
    const dashboard = manifest.screens.find(s=>s.slug==='/overview')!;
    const node = walk(dashboard.rootNode).find(n=>n.semanticRole==='metric-cards')!;
    const store = useWorkbenchStore.getState();
    store.setManifest(manifest);
    store.setActiveScreen(dashboard.id);
    const effective = () => getNodePath(useWorkbenchStore.getState().manifest.screens.find(s=>s.id===dashboard.id)!.rootNode,node.id).reduce((dna,n)=>({...dna,...n.dnaOverrides}),useWorkbenchStore.getState().manifest.designDNA);
    const originalDNA = effective();
    store.toggleNodeLock(node.id,'node');
    const locked = JSON.stringify(walk(useWorkbenchStore.getState().manifest.screens.find(s=>s.id===dashboard.id)!.rootNode).find(n=>n.id===node.id));
    store.updateProjectDNA({playfulness:95,curvature:95});
    expect(effective()).toEqual(originalDNA);
    store.updateNodeProps(node.id,{title:'Should not replace locked content'});
    expect(JSON.stringify(walk(useWorkbenchStore.getState().manifest.screens.find(s=>s.id===dashboard.id)!.rootNode).find(n=>n.id===node.id))).toBe(locked);
    expect(useWorkbenchStore.getState().manifest.locks.some(lock=>lock.targetNodeId===node.id)).toBe(true);
  });

  it('preserves every real resource and unique identity across repeated radical recomposition',()=>{
    const manifest=result().directionC.manifest;
    const screen=manifest.screens.find(item=>item.slug==='/overview')!;
    const summary=walk(screen.rootNode).find(node=>node.semanticRole==='metric-cards')!;
    const store=useWorkbenchStore.getState();store.setManifest(manifest);store.setActiveScreen(screen.id);store.toggleNodeLock(summary.id,'node');
    const originalRefs=walk(screen.rootNode).filter(node=>node.resourceRef).map(node=>node.resourceRef!.slug).sort();
    for(let attempt=0;attempt<3;attempt++){
      store.recomposeScreenAroundLocks(screen.id,{divergenceLevel:95});
      const nodes=walk(useWorkbenchStore.getState().manifest.screens.find(item=>item.id===screen.id)!.rootNode);
      expect(nodes.filter(node=>node.resourceRef).map(node=>node.resourceRef!.slug).sort()).toEqual(originalRefs);
      expect(new Set(nodes.map(node=>node.id)).size).toBe(nodes.length);
    }
  });
});

it('Surprise Me changes the visible navigation topology and keeps its DNA truthful',()=>{
 const manifest=result().directionC.manifest;
 const changed=applyOperation(manifest,surpriseMe(manifest,{divergenceLevel:60,seed:'topology'}).operation).nextManifest;
 expect(changed.designDNA.navigationModel).toBe(changed.navigation.model);
 for(const screen of changed.screens.filter(screen=>screen.rootNode.semanticRole!=='marketing-page' && walk(screen.rootNode).some(node=>node.semanticRole==='navigation'))){
  const expected=changed.navigation.model==='sidebar'?'sidebar-shell':changed.navigation.model==='top-nav'?'top-nav-page-canvas':'workspace-dock-shell';
  expect(screen.rootNode.semanticRole).toBe(expected);
 }
});

it('gives employee dashboard roles distinct headings and respects the stated organisation size',()=>{
 const output=composeProjectPipeline({...brief,description:brief.description.replace('500-person','1200-person')},{catalogResources:resources,seed:'employee-size'}).directionC.manifest;
 const dashboard=output.screens.find(screen=>screen.slug==='/overview')!;
 const nodes=walk(dashboard.rootNode).filter(node=>node.resourceRef);
 const titles=nodes.filter(node=>node.semanticRole!=='navigation').map(node=>node.props.title);
 expect(new Set(titles).size).toBe(titles.length);
 const summary=nodes.find(node=>node.semanticRole==='metric-cards')!;
 expect(JSON.stringify(summary.props.cards)).toContain('1200');
 expect(JSON.stringify(summary.props.cards)).not.toContain('500');
});

it('projects a local playfulness edit into visible resource geometry',()=>{
 const reserved=normalizeDesignTokens({curvature:65,playfulness:0});
 const playful=normalizeDesignTokens({curvature:65,playfulness:100});
 expect(reserved.radius.xl).not.toBe(playful.radius.xl);
 expect(parseFloat(playful.radius.xl)).toBeGreaterThan(parseFloat(reserved.radius.xl));
});
