import { create } from 'zustand';
import type {
  ProjectManifest,
  ProjectScreen,
  PartialDesignDNA,
  NodeLocks,
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

const initialSample = createSampleProject();

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

  // History Stacks
  history: [],
  future: [],

  // Basic Setters
  setManifest: (manifest: ProjectManifest) => {
    set({
      manifest,
      activeScreenId: manifest.screens[0]?.id ?? '',
      selectedNodeId: null,
      history: [],
      future: [],
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
      // If selectedNodeId no longer exists in target screen, reset to null
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
