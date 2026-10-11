import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkbenchStore } from '../store/workbench-store.js';
import { findNodeById } from '../utils/tree-helpers.js';
import {
  getEffectiveNodeDNA,
  getDnaPropertyStatus,
  extractFeelTraits,
  mapFeelPhraseToDna,
} from '../utils/dna-helpers.js';

describe('Phase 9 Gate — Design DNA Inheritance & Multi-Hierarchy Overrides', () => {
  beforeEach(() => {
    useWorkbenchStore.getState().loadSampleProject();
  });

  it('inherits root Project DNA across all nodes by default', () => {
    const state = useWorkbenchStore.getState();
    const projectDNA = state.manifest.designDNA;

    expect(projectDNA.professionalism).toBe(92);
    expect(projectDNA.curvature).toBe(25);
    expect(projectDNA.depth).toBe(25);

    const screen = state.manifest.screens[0]!;
    const metricNode = findNodeById(screen.rootNode, 'node-metric-arr')!;

    // By default, no local overrides exist
    expect(metricNode.dnaOverrides).toBeUndefined();

    // Effective DNA is exactly root Project DNA
    const effective = getEffectiveNodeDNA(projectDNA, metricNode.dnaOverrides);
    expect(effective.professionalism).toBe(92);
    expect(effective.curvature).toBe(25);
    expect(getDnaPropertyStatus(projectDNA, metricNode.dnaOverrides, 'curvature')).toBe('inherited');
    expect(getDnaPropertyStatus(projectDNA, metricNode.dnaOverrides, 'professionalism')).toBe('inherited');
  });

  it('alters inherited DNA on a specific component node and tracks overrides', () => {
    const store = useWorkbenchStore.getState();
    const nodeId = 'node-metric-arr';

    // Override curvature and playfulness on node-metric-arr
    store.updateNodeDNA(nodeId, {
      curvature: 85,
      playfulness: 75,
    });

    const screen = useWorkbenchStore.getState().manifest.screens[0]!;
    const node = findNodeById(screen.rootNode, nodeId)!;

    // Node now has local dnaOverrides
    expect(node.dnaOverrides).toBeDefined();
    expect(node.dnaOverrides?.curvature).toBe(85);
    expect(node.dnaOverrides?.playfulness).toBe(75);

    // Other nodes remain without overrides
    const siblingNode = findNodeById(screen.rootNode, 'node-metric-accounts')!;
    expect(siblingNode.dnaOverrides).toBeUndefined();

    // Effective DNA merges project DNA with node overrides
    const effective = getEffectiveNodeDNA(useWorkbenchStore.getState().manifest.designDNA, node.dnaOverrides);
    expect(effective.curvature).toBe(85); // Overridden
    expect(effective.playfulness).toBe(75); // Overridden
    expect(effective.professionalism).toBe(92); // Inherited from Project DNA
    expect(effective.luxury).toBe(78); // Inherited from Project DNA

    // Status inspection
    expect(getDnaPropertyStatus(useWorkbenchStore.getState().manifest.designDNA, node.dnaOverrides, 'curvature')).toBe('overridden');
    expect(getDnaPropertyStatus(useWorkbenchStore.getState().manifest.designDNA, node.dnaOverrides, 'playfulness')).toBe('overridden');
    expect(getDnaPropertyStatus(useWorkbenchStore.getState().manifest.designDNA, node.dnaOverrides, 'professionalism')).toBe('inherited');
  });

  it('alters DNA at section layout level and cascades to children without local overrides', () => {
    const store = useWorkbenchStore.getState();
    const sectionId = 'node-kpi-group';

    // Override section DNA
    store.updateNodeDNA(sectionId, {
      density: 95,
      curvature: 50,
    });

    const screen = useWorkbenchStore.getState().manifest.screens[0]!;
    const section = findNodeById(screen.rootNode, sectionId)!;
    expect(section.dnaOverrides?.density).toBe(95);
    expect(section.dnaOverrides?.curvature).toBe(50);
  });

  it('resets node overrides restoring pure inheritance from Project DNA', () => {
    const store = useWorkbenchStore.getState();
    const nodeId = 'node-metric-arr';

    store.updateNodeDNA(nodeId, {
      curvature: 99,
      depth: 90,
    });

    let screen = useWorkbenchStore.getState().manifest.screens[0]!;
    let node = findNodeById(screen.rootNode, nodeId)!;
    expect(node.dnaOverrides?.curvature).toBe(99);

    // Reset node DNA overrides
    store.resetNodeDNA(nodeId);

    screen = useWorkbenchStore.getState().manifest.screens[0]!;
    node = findNodeById(screen.rootNode, nodeId)!;
    expect(node.dnaOverrides).toBeUndefined();

    const effective = getEffectiveNodeDNA(useWorkbenchStore.getState().manifest.designDNA, node.dnaOverrides);
    expect(effective.curvature).toBe(25); // Restored Project DNA value
    expect(getDnaPropertyStatus(useWorkbenchStore.getState().manifest.designDNA, node.dnaOverrides, 'curvature')).toBe('inherited');
  });

  it('updates project-level DNA and propagates to inherited nodes while preserving local overrides', () => {
    const store = useWorkbenchStore.getState();
    const nodeId = 'node-metric-arr';

    // Node overrides curvature
    store.updateNodeDNA(nodeId, { curvature: 70 });

    // Update global Project DNA professionalism & depth
    store.updateProjectDNA({
      professionalism: 98,
      depth: 60,
    });

    const state = useWorkbenchStore.getState();
    const screen = state.manifest.screens[0]!;
    const node = findNodeById(screen.rootNode, nodeId)!;

    const effective = getEffectiveNodeDNA(state.manifest.designDNA, node.dnaOverrides);
    expect(effective.curvature).toBe(70); // Kept local override
    expect(effective.professionalism).toBe(98); // Inherited new project-level value
    expect(effective.depth).toBe(60); // Inherited new project-level value
  });

  it('extracts Feel Mixer traits and maps natural language feel phrases', () => {
    const store = useWorkbenchStore.getState();
    const traits = extractFeelTraits(store.manifest.designDNA);

    expect(traits.length).toBe(5);
    expect(traits[0]?.name).toBe('Professionalism');
    expect(traits[0]?.value).toBe(92);
    expect(traits[0]?.status).toBe('inherited');

    // Natural language phrase mapping
    const mapped = mapFeelPhraseToDna('professional but playful');
    expect(mapped).not.toBeNull();
    expect(mapped?.professionalism).toBe(80);
    expect(mapped?.playfulness).toBe(65);
    expect(mapped?.curvature).toBe(55);

    const luxuryMapped = mapFeelPhraseToDna('luxury without being flashy');
    expect(luxuryMapped).not.toBeNull();
    expect(luxuryMapped?.luxury).toBe(85);
    expect(luxuryMapped?.whitespace).toBe(75);
  });
});
