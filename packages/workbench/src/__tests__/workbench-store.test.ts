import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkbenchStore } from '../store/workbench-store.js';
import { getNodePath, findNodeById } from '../utils/tree-helpers.js';
import { getScopedDNA } from '../utils/dna-helpers.js';

describe('Workbench Store & Tree Navigation', () => {
  beforeEach(() => {
    useWorkbenchStore.getState().loadSampleProject();
  });

  it('initializes with a valid multi-screen sample project', () => {
    const state = useWorkbenchStore.getState();
    expect(state.manifest.id).toBe('project-fintech-terminal');
    expect(state.manifest.screens.length).toBeGreaterThanOrEqual(3);
    expect(state.activeScreenId).toBe('screen-overview');
  });

  it('navigates between pages and updates active screen', () => {
    const store = useWorkbenchStore.getState();
    expect(store.activeScreenId).toBe('screen-overview');

    store.setActiveScreen('screen-analytics');
    expect(useWorkbenchStore.getState().activeScreenId).toBe('screen-analytics');

    store.setActiveScreen('screen-settings');
    expect(useWorkbenchStore.getState().activeScreenId).toBe('screen-settings');
  });

  it('adds, renames, and deletes pages cleanly', () => {
    const store = useWorkbenchStore.getState();
    const initialCount = store.manifest.screens.length;

    // Add screen
    store.addScreen({
      id: 'screen-audit',
      screenNodeId: 'screen-audit',
      name: 'Compliance Audit',
      slug: '/audit',
      rootNode: {
        id: 'node-audit-root',
        nodeType: 'layout',
        semanticRole: 'app-shell',
        props: {},
        slots: {},
        children: [],
      },
    });

    expect(useWorkbenchStore.getState().manifest.screens.length).toBe(initialCount + 1);
    expect(useWorkbenchStore.getState().activeScreenId).toBe('screen-audit');

    // Rename screen
    useWorkbenchStore.getState().renameScreen('screen-audit', 'Audit Logs');
    const renamed = useWorkbenchStore
      .getState()
      .manifest.screens.find((s) => s.id === 'screen-audit');
    expect(renamed?.name).toBe('Audit Logs');

    // Delete screen
    useWorkbenchStore.getState().deleteScreen('screen-audit');
    expect(useWorkbenchStore.getState().manifest.screens.length).toBe(initialCount);
  });

  it('selects semantic nodes and resolves breadcrumb paths', () => {
    const store = useWorkbenchStore.getState();
    store.selectNode('node-metric-arr');

    expect(useWorkbenchStore.getState().selectedNodeId).toBe('node-metric-arr');

    const screen = store.manifest.screens.find((s) => s.id === 'screen-overview')!;
    const path = getNodePath(screen.rootNode, 'node-metric-arr');

    expect(path.length).toBeGreaterThan(1);
    expect(path[0]?.id).toBe('node-app-shell');
    expect(path[path.length - 1]?.id).toBe('node-metric-arr');
  });

  it('climbs selection hierarchy when selectParentNode is called', () => {
    const store = useWorkbenchStore.getState();
    store.selectNode('node-metric-arr'); // Child of node-kpi-group
    expect(useWorkbenchStore.getState().selectedNodeId).toBe('node-metric-arr');

    // Climb up 1 level -> node-kpi-group
    store.selectParentNode();
    expect(useWorkbenchStore.getState().selectedNodeId).toBe('node-kpi-group');

    // Climb up another level -> node-main
    store.selectParentNode();
    expect(useWorkbenchStore.getState().selectedNodeId).toBe('node-main');

    // Climb up to root -> node-app-shell
    store.selectParentNode();
    expect(useWorkbenchStore.getState().selectedNodeId).toBe('node-app-shell');

    // Climb at root -> clears selection (null)
    store.selectParentNode();
    expect(useWorkbenchStore.getState().selectedNodeId).toBeNull();
  });

  it('manages node-level locks and unlocks', () => {
    const store = useWorkbenchStore.getState();
    const nodeId = 'node-metric-arr';

    // Lock structure
    store.toggleNodeLock(nodeId, 'structure');
    let screen = useWorkbenchStore.getState().manifest.screens.find((s) => s.id === 'screen-overview')!;
    let node = findNodeById(screen.rootNode, nodeId)!;
    expect(node.locks?.structure).toBe(true);

    // Lock style
    store.toggleNodeLock(nodeId, 'style');
    screen = useWorkbenchStore.getState().manifest.screens.find((s) => s.id === 'screen-overview')!;
    node = findNodeById(screen.rootNode, nodeId)!;
    expect(node.locks?.style).toBe(true);

    // Unlock all
    store.unlockAllNodeLocks(nodeId);
    screen = useWorkbenchStore.getState().manifest.screens.find((s) => s.id === 'screen-overview')!;
    node = findNodeById(screen.rootNode, nodeId)!;
    expect(node.locks?.structure).toBeFalsy();
    expect(node.locks?.style).toBeFalsy();
  });

  it('keeps the locked DNA snapshot after unlock until the user resets it', () => {
    const store = useWorkbenchStore.getState();
    const nodeId = 'node-metric-arr';
    const parentId = 'node-kpi-group';
    store.updateNodeDNA(nodeId, { warmth: 57 });
    const lockedEffectiveDNA = getScopedDNA(useWorkbenchStore.getState().manifest, 'screen-overview', nodeId);

    store.toggleNodeLock(nodeId, 'style');
    store.toggleNodeLock(nodeId, 'motion');
    store.updateNodeDNA(parentId, { playfulness: 65 });
    expect(getScopedDNA(useWorkbenchStore.getState().manifest, 'screen-overview', nodeId).playfulness).toBe(12);

    store.toggleNodeLock(nodeId, 'style');
    const stillLocked = findNodeById(
      useWorkbenchStore.getState().manifest.screens[0]!.rootNode,
      nodeId
    )!;
    expect(stillLocked.locks?.motion).toBe(true);
    expect(getScopedDNA(useWorkbenchStore.getState().manifest, 'screen-overview', nodeId).playfulness).toBe(12);

    store.unlockAllNodeLocks(nodeId);
    const unlocked = findNodeById(
      useWorkbenchStore.getState().manifest.screens[0]!.rootNode,
      nodeId
    )!;
    expect(unlocked.dnaOverrides).toEqual(lockedEffectiveDNA);
    expect(unlocked.locks).toEqual({});
    expect(getScopedDNA(useWorkbenchStore.getState().manifest, 'screen-overview', nodeId).playfulness).toBe(12);

    useWorkbenchStore.getState().resetNodeDNA(nodeId);
    expect(getScopedDNA(useWorkbenchStore.getState().manifest, 'screen-overview', nodeId).playfulness).toBe(65);
    expect(getScopedDNA(useWorkbenchStore.getState().manifest, 'screen-overview', nodeId).warmth).toBe(28);
  });

  it('supports undo and redo for workbench mutations', () => {
    const store = useWorkbenchStore.getState();

    // Mutate project name
    store.updateProjectDNA({ professionalism: 99 });
    expect(useWorkbenchStore.getState().manifest.designDNA.professionalism).toBe(99);

    // Undo mutation
    useWorkbenchStore.getState().undo();
    expect(useWorkbenchStore.getState().manifest.designDNA.professionalism).toBe(92);

    // Redo mutation
    useWorkbenchStore.getState().redo();
    expect(useWorkbenchStore.getState().manifest.designDNA.professionalism).toBe(99);
  });
});
