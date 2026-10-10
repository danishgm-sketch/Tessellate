import { create } from 'zustand';
import type {
  ProjectManifest,
  ProjectScreen,
  PartialDesignDNA,
  NodeLocks,
  HistoryOperation,
  ResourceManifest,
} from '@tessellate/schemas';
import type {
  WorkbenchState,
  WorkbenchMode,
  LeftTab,
  RightTab,
  DevicePreset,
  MobileTab,
} from '../types.js';
import { createSampleProject } from './sample-project.js';
import {
  findNodeById,
  findParentNode,
  updateNodeInTree,
} from '../utils/tree-helpers.js';
import { applyOperation } from '../history/history-manager.js';
import {
  createCheckpoint,
  restoreCheckpoint,
  type Checkpoint,
  type CheckpointTrigger,
} from '../history/checkpoints.js';
import { recomposeScreenAroundLocks, type RecomposeOptions } from '../mutations/recomposition.js';
import { surpriseMe, type SurpriseMeOptions } from '../mutations/surprise.js';
import { createReplaceOperation } from '../mutations/replace.js';
import { blendManifests, type BlendConfig } from '../blend/blend-engine.js';

const initialSample = createSampleProject();
const initialCheckpoint = createCheckpoint(initialSample, {
  trigger: 'initial-generation',
  name: 'Initial State',
  description: 'Baseline generated project before modifications',
});

export const useWorkbenchStore = create<WorkbenchState>((set, get) => ({
  // Initial Project State
  manifest: initialSample,
  activeScreenId: initialSample.screens[0]?.id ?? 'screen-overview',
  selectedNodeId: 'node-metric-arr',
  hoveredNodeId: null,

  // Navigation & Modes
  activeLeftTab: 'layers',
  activeRightTab: 'intent',
  activeMode: 'structure',

  // Canvas & Viewport
  devicePreset: 'responsive',
  zoom: 1.0,
  pan: { x: 0, y: 0 },
  isPreview: false,
  reducedMotion: false,

  // Mobile Adaptation
  isMobileDrawerOpen: false,
  mobileTab: 'preview',

  // Advanced Flow Modals
  compareManifest: null,
  isCompareOpen: false,
  isBlendOpen: false,
  isReplaceDrawerOpen: false,

  // History & Checkpoints
  history: [],
  future: [],
  operations: [],
  checkpoints: [initialCheckpoint],

  // Basic Setters
  setManifest: (manifest: ProjectManifest) => {
    set({
      manifest,
      activeScreenId: manifest.screens[0]?.id ?? '',
      selectedNodeId: null,
      history: [],
      future: [],
      operations: [],
    });
  },

  setActiveScreen: (screenId: string) => {
    set({
      activeScreenId: screenId,
      selectedNodeId: null,
      hoveredNodeId: null,
    });
  },

  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  setHoveredNode: (nodeId: string | null) => {
    set({ hoveredNodeId: nodeId });
  },

  selectParentNode: () => {
    const { manifest, activeScreenId, selectedNodeId } = get();
    if (!selectedNodeId) return;

    const screen = manifest.screens.find((s) => s.id === activeScreenId);
    if (!screen) return;

    if (screen.rootNode.id === selectedNodeId) {
      // Already at root; clear selection
      set({ selectedNodeId: null });
      return;
    }

    const parentResult = findParentNode(screen.rootNode, selectedNodeId);
    if (parentResult) {
      set({ selectedNodeId: parentResult.parent.id });
    } else {
      set({ selectedNodeId: null });
    }
  },

  setActiveLeftTab: (tab: LeftTab) => set({ activeLeftTab: tab }),
  setActiveRightTab: (tab: RightTab) => set({ activeRightTab: tab }),
  setActiveMode: (mode: WorkbenchMode) => set({ activeMode: mode }),
  setDevicePreset: (preset: DevicePreset) => set({ devicePreset: preset }),
  setZoom: (zoom: number) => set({ zoom: Math.min(2.0, Math.max(0.25, zoom)) }),
  setPan: (pan: { x: number; y: number }) => set({ pan }),
  togglePreview: () => set((state) => ({ isPreview: !state.isPreview })),
  toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
  setMobileDrawerOpen: (open: boolean) => set({ isMobileDrawerOpen: open }),
  setMobileTab: (tab: MobileTab) => set({ mobileTab: tab }),

  // Modal Flow Controls
  openCompare: (compareWith?: ProjectManifest) => {
    const fallback = get().checkpoints[0]?.manifest ?? null;
    set({ isCompareOpen: true, compareManifest: compareWith ?? fallback });
  },
  closeCompare: () => set({ isCompareOpen: false, compareManifest: null }),
  openBlend: () => set({ isBlendOpen: true }),
  closeBlend: () => set({ isBlendOpen: false }),
  openReplaceDrawer: () => set({ isReplaceDrawerOpen: true }),
  closeReplaceDrawer: () => set({ isReplaceDrawerOpen: false }),

  // Checkpoints
  createCheckpoint: (name?: string, trigger: CheckpointTrigger = 'manual', description?: string) => {
    const { manifest, checkpoints } = get();
    const chk = createCheckpoint(manifest, { name, trigger, description });
    set({ checkpoints: [chk, ...checkpoints] });
  },

  restoreCheckpoint: (checkpoint: Checkpoint) => {
    const { manifest, history } = get();
    const restored = restoreCheckpoint(checkpoint);
    set({
      manifest: restored,
      history: [manifest, ...history],
      future: [],
      selectedNodeId: null,
    });
  },

  // Semantic Mutation & Flow Actions
  executeOperation: (op: HistoryOperation) => {
    const { manifest, history, operations } = get();
    const result = applyOperation(manifest, op);
    set({
      history: [manifest, ...history.slice(0, 49)],
      future: [],
      operations: [result.executedOperation, ...operations],
      manifest: result.nextManifest,
    });
  },

  recomposeScreenAroundLocks: (screenId: string, options?: RecomposeOptions) => {
    const { manifest, checkpoints } = get();
    // 1. Auto-checkpoint prior to structural recomposition
    const autoChk = createCheckpoint(manifest, {
      trigger: 'pre-recompose',
      name: `Pre-Recompose (${manifest.screens.find((s) => s.id === screenId)?.name ?? screenId})`,
    });

    // 2. Generate recomposition operation
    const recomposeResult = recomposeScreenAroundLocks(manifest, screenId, options);

    // 3. Apply operation
    const result = applyOperation(manifest, recomposeResult.operation);

    set({
      history: [manifest, ...get().history.slice(0, 49)],
      future: [],
      operations: [result.executedOperation, ...get().operations],
      checkpoints: [autoChk, ...checkpoints],
      manifest: result.nextManifest,
    });
  },

  surpriseMe: (options?: SurpriseMeOptions) => {
    const { manifest } = get();
    const result = surpriseMe(manifest, options);
    get().executeOperation(result.operation);
  },

  replaceNodeWithResource: (nodeId: string, resource: ResourceManifest, variant?: string) => {
    const { manifest } = get();
    const replaceOp = createReplaceOperation(manifest, nodeId, resource, variant);
    get().executeOperation(replaceOp);
    set({ isReplaceDrawerOpen: false });
  },

  blendWith: (otherManifest: ProjectManifest, config: BlendConfig) => {
    const { manifest, checkpoints } = get();
    const autoChk = createCheckpoint(manifest, {
      trigger: 'pre-blend',
      name: 'Pre-Blend Snapshot',
    });

    const blended = blendManifests(manifest, otherManifest, undefined, config);

    set({
      history: [manifest, ...get().history.slice(0, 49)],
      future: [],
      checkpoints: [autoChk, ...checkpoints],
      manifest: blended,
      isBlendOpen: false,
    });
  },

  // DNA & Mutation Actions
  updateProjectDNA: (dnaChanges: PartialDesignDNA) => {
    const { manifest, history } = get();
    const nextManifest: ProjectManifest = {
      ...manifest,
      designDNA: {
        ...manifest.designDNA,
        ...dnaChanges,
      },
      updatedAt: new Date().toISOString(),
    };

    set({
      history: [manifest, ...history.slice(0, 49)],
      future: [],
      manifest: nextManifest,
    });
  },

  updateNodeDNA: (nodeId: string, dnaOverrides: PartialDesignDNA) => {
    const { manifest, activeScreenId, history } = get();
    const screenIndex = manifest.screens.findIndex((s) => s.id === activeScreenId);
    if (screenIndex === -1) return;

    const targetScreen = manifest.screens[screenIndex];
    if (!targetScreen) return;

    const updatedRoot = updateNodeInTree(targetScreen.rootNode, nodeId, (node) => ({
      ...node,
      dnaOverrides: {
        ...(node.dnaOverrides ?? {}),
        ...dnaOverrides,
      },
    }));

    const nextScreens = [...manifest.screens];
    nextScreens[screenIndex] = {
      ...targetScreen,
      rootNode: updatedRoot,
    };

    const nextManifest: ProjectManifest = {
      ...manifest,
      screens: nextScreens,
      updatedAt: new Date().toISOString(),
    };

    set({
      history: [manifest, ...history.slice(0, 49)],
      future: [],
      manifest: nextManifest,
    });
  },

  resetNodeDNA: (nodeId: string) => {
    const { manifest, activeScreenId, history } = get();
    const screenIndex = manifest.screens.findIndex((s) => s.id === activeScreenId);
    if (screenIndex === -1) return;

    const targetScreen = manifest.screens[screenIndex];
    if (!targetScreen) return;

    const updatedRoot = updateNodeInTree(targetScreen.rootNode, nodeId, (node) => {
      const rest = { ...node };
      delete rest.dnaOverrides;
      delete rest.tokenOverrides;
      return rest;
    });

    const nextScreens = [...manifest.screens];
    nextScreens[screenIndex] = {
      ...targetScreen,
      rootNode: updatedRoot,
    };

    const nextManifest: ProjectManifest = {
      ...manifest,
      screens: nextScreens,
      updatedAt: new Date().toISOString(),
    };

    set({
      history: [manifest, ...history.slice(0, 49)],
      future: [],
      manifest: nextManifest,
    });
  },

  updateNodeProps: (nodeId: string, props: Record<string, unknown>) => {
    const { manifest, activeScreenId, history } = get();
    const screenIndex = manifest.screens.findIndex((s) => s.id === activeScreenId);
    if (screenIndex === -1) return;

    const targetScreen = manifest.screens[screenIndex];
    if (!targetScreen) return;

    const updatedRoot = updateNodeInTree(targetScreen.rootNode, nodeId, (node) => ({
      ...node,
      props: {
        ...(node.props ?? {}),
        ...props,
      },
    }));

    const nextScreens = [...manifest.screens];
    nextScreens[screenIndex] = {
      ...targetScreen,
      rootNode: updatedRoot,
    };

    const nextManifest: ProjectManifest = {
      ...manifest,
      screens: nextScreens,
      updatedAt: new Date().toISOString(),
    };

    set({
      history: [manifest, ...history.slice(0, 49)],
      future: [],
      manifest: nextManifest,
    });
  },

  toggleNodeLock: (nodeId: string, lockType: keyof NodeLocks) => {
    const { manifest, activeScreenId, history } = get();
    const screenIndex = manifest.screens.findIndex((s) => s.id === activeScreenId);
    if (screenIndex === -1) return;

    const targetScreen = manifest.screens[screenIndex];
    if (!targetScreen) return;

    const updatedRoot = updateNodeInTree(targetScreen.rootNode, nodeId, (node) => {
      const currentLocks = node.locks ?? {};
      const nextVal = !currentLocks[lockType];
      return {
        ...node,
        locks: {
          ...currentLocks,
          [lockType]: nextVal,
        },
      };
    });

    const nextScreens = [...manifest.screens];
    nextScreens[screenIndex] = {
      ...targetScreen,
      rootNode: updatedRoot,
    };

    const nextManifest: ProjectManifest = {
      ...manifest,
      screens: nextScreens,
      updatedAt: new Date().toISOString(),
    };

    set({
      history: [manifest, ...history.slice(0, 49)],
      future: [],
      manifest: nextManifest,
    });
  },

  unlockAllNodeLocks: (nodeId: string) => {
    const { manifest, activeScreenId, history } = get();
    const screenIndex = manifest.screens.findIndex((s) => s.id === activeScreenId);
    if (screenIndex === -1) return;

    const targetScreen = manifest.screens[screenIndex];
    if (!targetScreen) return;

    const updatedRoot = updateNodeInTree(targetScreen.rootNode, nodeId, (node) => ({
      ...node,
      locks: {},
    }));

    const nextScreens = [...manifest.screens];
    nextScreens[screenIndex] = {
      ...targetScreen,
      rootNode: updatedRoot,
    };

    const nextManifest: ProjectManifest = {
      ...manifest,
      screens: nextScreens,
      updatedAt: new Date().toISOString(),
    };

    set({
      history: [manifest, ...history.slice(0, 49)],
      future: [],
      manifest: nextManifest,
    });
  },

  addScreen: (screen: ProjectScreen) => {
    const { manifest, history } = get();
    const nextManifest: ProjectManifest = {
      ...manifest,
      screens: [...manifest.screens, screen],
      updatedAt: new Date().toISOString(),
    };
    set({
      history: [manifest, ...history.slice(0, 49)],
      future: [],
      manifest: nextManifest,
      activeScreenId: screen.id,
    });
  },

  deleteScreen: (screenId: string) => {
    const { manifest, history, activeScreenId } = get();
    if (manifest.screens.length <= 1) return; // Preserve at least one screen

    const nextScreens = manifest.screens.filter((s) => s.id !== screenId);
    const nextActive = activeScreenId === screenId ? (nextScreens[0]?.id ?? '') : activeScreenId;

    const nextManifest: ProjectManifest = {
      ...manifest,
      screens: nextScreens,
      updatedAt: new Date().toISOString(),
    };

    set({
      history: [manifest, ...history.slice(0, 49)],
      future: [],
      manifest: nextManifest,
      activeScreenId: nextActive,
      selectedNodeId: null,
    });
  },

  renameScreen: (screenId: string, name: string) => {
    const { manifest, history } = get();
    const nextScreens = manifest.screens.map((s) =>
      s.id === screenId ? { ...s, name } : s
    );

    const nextManifest: ProjectManifest = {
      ...manifest,
      screens: nextScreens,
      updatedAt: new Date().toISOString(),
    };

    set({
      history: [manifest, ...history.slice(0, 49)],
      future: [],
      manifest: nextManifest,
    });
  },

  updateProjectName: (name: string) => {
    set((state) => ({
      manifest: {
        ...state.manifest,
        name,
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  loadSampleProject: () => {
    const sample = createSampleProject();
    set({
      manifest: sample,
      activeScreenId: sample.screens[0]?.id ?? 'screen-overview',
      selectedNodeId: 'node-metric-arr',
      history: [],
      future: [],
      operations: [],
    });
  },

  undo: () => {
    const { history, future, manifest } = get();
    if (history.length === 0) return;

    const previous = history[0];
    if (!previous) return;
    const restHistory = history.slice(1);

    set({
      manifest: previous,
      history: restHistory,
      future: [manifest, ...future],
      selectedNodeId: (() => {
        const screen = previous.screens.find((s) => s.id === get().activeScreenId);
        if (!screen || !get().selectedNodeId) return null;
        return findNodeById(screen.rootNode, get().selectedNodeId!) ? get().selectedNodeId : null;
      })(),
    });
  },

  redo: () => {
    const { history, future, manifest } = get();
    if (future.length === 0) return;

    const next = future[0];
    if (!next) return;
    const restFuture = future.slice(1);

    set({
      manifest: next,
      history: [manifest, ...history],
      future: restFuture,
      selectedNodeId: (() => {
        const screen = next.screens.find((s) => s.id === get().activeScreenId);
        if (!screen || !get().selectedNodeId) return null;
        return findNodeById(screen.rootNode, get().selectedNodeId!) ? get().selectedNodeId : null;
      })(),
    });
  },
}));
