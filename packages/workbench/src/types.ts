import type {
  ProjectManifest,
  ProjectScreen,
  PartialDesignDNA,
  NodeLocks,
  HistoryOperation,
  ResourceManifest,
  ProjectMutation,
} from '@tessellate/schemas';
import type { Checkpoint, CheckpointTrigger } from './history/checkpoints.js';
import type { RecomposeOptions } from './mutations/recomposition.js';
import type { SurpriseMeOptions } from './mutations/surprise.js';
import type { BlendConfig } from './blend/blend-engine.js';

export type WorkbenchMode = 'compose' | 'structure' | 'style' | 'motion' | 'content' | 'audit';

export type LeftTab = 'brief' | 'pages' | 'layers' | 'library';

export type RightTab = 'intent' | 'style' | 'motion' | 'content' | 'constraints' | 'resource';

export type DevicePreset = 'responsive' | '1440' | '1280' | '1024' | '768' | '430' | '390' | '360';

export type MobileTab = 'preview' | 'pages' | 'selection' | 'command' | 'audit';

export type InheritanceStatus = 'inherited' | 'overridden' | 'locked';

export interface BreadcrumbItem {
  id: string;
  name: string;
  role: string;
  nodeType: string;
}

export interface FeelTrait {
  id: string;
  name: string;
  value: number; // 0 - 100
  isPinned: boolean;
  status: InheritanceStatus;
  isCustom?: boolean;
}

export interface WorkbenchState {
  // Project State
  manifest: ProjectManifest;
  activeScreenId: string;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;

  // Editor Navigation & Modes
  activeLeftTab: LeftTab;
  activeRightTab: RightTab;
  activeMode: WorkbenchMode;

  // Canvas Viewport & Camera
  devicePreset: DevicePreset;
  zoom: number; // 0.25 to 2.0
  pan: { x: number; y: number };
  isPreview: boolean;
  reducedMotion: boolean;

  // Mobile Adaptation
  isMobileDrawerOpen: boolean;
  mobileTab: MobileTab;

  // Advanced Flow Modals
  compareManifest: ProjectManifest | null;
  isCompareOpen: boolean;
  isBlendOpen: boolean;
  isReplaceDrawerOpen: boolean;

  // History & Checkpoints
  history: ProjectManifest[];
  future: ProjectManifest[];
  operations: HistoryOperation[];
  checkpoints: Checkpoint[];

  // Basic Setters
  setManifest: (manifest: ProjectManifest) => void;
  setActiveScreen: (screenId: string) => void;
  selectNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  selectParentNode: () => void;
  setActiveLeftTab: (tab: LeftTab) => void;
  setActiveRightTab: (tab: RightTab) => void;
  setActiveMode: (mode: WorkbenchMode) => void;
  setDevicePreset: (preset: DevicePreset) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  togglePreview: () => void;
  toggleReducedMotion: () => void;
  setMobileDrawerOpen: (open: boolean) => void;
  setMobileTab: (tab: MobileTab) => void;

  // Flow Modals
  openCompare: (compareWith?: ProjectManifest) => void;
  closeCompare: () => void;
  openBlend: () => void;
  closeBlend: () => void;
  openReplaceDrawer: () => void;
  closeReplaceDrawer: () => void;

  // Checkpoints
  createCheckpoint: (name?: string, trigger?: CheckpointTrigger, description?: string) => void;
  restoreCheckpoint: (checkpoint: Checkpoint) => void;

  // Semantic Mutation & Flow Actions
  executeOperation: (op: HistoryOperation) => void;
  executeMutation: (mutation: ProjectMutation) => void;
  recomposeScreenAroundLocks: (screenId: string, options?: RecomposeOptions) => void;
  surpriseMe: (options?: SurpriseMeOptions) => void;
  replaceNodeWithResource: (nodeId: string, resource: ResourceManifest, variant?: string) => void;
  blendWith: (otherManifest: ProjectManifest, config: BlendConfig) => void;

  // DNA & Node Mutations
  updateProjectDNA: (dnaChanges: PartialDesignDNA) => void;
  updateNodeDNA: (nodeId: string, dnaOverrides: PartialDesignDNA) => void;
  resetNodeDNA: (nodeId: string) => void;
  updateNodeProps: (nodeId: string, props: Record<string, unknown>) => void;
  toggleNodeLock: (nodeId: string, lockType: keyof NodeLocks) => void;
  unlockAllNodeLocks: (nodeId: string) => void;

  // Screen Mutations
  addScreen: (screen: ProjectScreen) => void;
  deleteScreen: (screenId: string) => void;
  renameScreen: (screenId: string, name: string) => void;

  // Project Level
  updateProjectName: (name: string) => void;
  loadSampleProject: (briefId?: string) => void;

  // History Actions
  undo: () => void;
  redo: () => void;
}
