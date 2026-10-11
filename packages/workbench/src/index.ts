// Workbench state, canvas, history, mutations and panels
export const WORKBENCH_VERSION = '0.1.0';

export * from './types.js';
export * from './store/workbench-store.js';
export * from './store/sample-project.js';
export {
  findNodeById,
  findParentNode,
  getNodePath,
  updateNodeInTree,
  deleteNodeInTree,
  addNodeToTree,
  flattenTree,
} from './utils/tree-helpers.js';
export * from './utils/dna-helpers.js';

// Phase 10: Locks, Mutations, History, Compare, Blend
export * from './locks/lock-engine.js';
export * from './mutations/executor.js';
export * from './mutations/inverse.js';
export * from './mutations/recomposition.js';
export * from './mutations/surprise.js';
export * from './mutations/replace.js';
export * from './history/history-manager.js';
export * from './history/checkpoints.js';
export * from './compare/compare-engine.js';
export * from './blend/blend-engine.js';

// Phase 11: Local Persistence & Recovery
export * from './persistence/storage.js';
export * from './persistence/recovery.js';

// Phase 12: Audit System
export * from './audit/audit-engine.js';
export { AuditPanel } from './components/audit/AuditPanel.js';

// Phase 13: AI-assisted layer
export * from './ai/index.js';

// Components
export { WorkbenchShell } from './components/WorkbenchShell.js';
export { TopToolbar } from './components/TopToolbar.js';
export { CommandBar } from './components/CommandBar.js';
export { LeftPanel } from './components/left-panel/LeftPanel.js';
export { BriefTab } from './components/left-panel/BriefTab.js';
export { PagesTab } from './components/left-panel/PagesTab.js';
export { LayersTab } from './components/left-panel/LayersTab.js';
export { LibraryTab } from './components/left-panel/LibraryTab.js';
export { WorkbenchCanvas } from './components/canvas/WorkbenchCanvas.js';
export { DeviceFrame } from './components/canvas/DeviceFrame.js';
export { CanvasToolbar } from './components/canvas/CanvasToolbar.js';
export { BreadcrumbBar } from './components/canvas/BreadcrumbBar.js';
export { RightInspector } from './components/right-inspector/RightInspector.js';
export { IntentTab } from './components/right-inspector/IntentTab.js';
export { StyleTab } from './components/right-inspector/StyleTab.js';
export { MotionTab } from './components/right-inspector/MotionTab.js';
export { ContentTab } from './components/right-inspector/ContentTab.js';
export { ConstraintsTab } from './components/right-inspector/ConstraintsTab.js';
export { ResourceTab } from './components/right-inspector/ResourceTab.js';
export { FeelMixer } from './components/feel-mixer/FeelMixer.js';
export { MobileWorkbench } from './components/mobile/MobileWorkbench.js';
export { PreviewModal } from './components/preview/PreviewModal.js';
export { CompareModal } from './components/compare/CompareModal.js';
export { BlendModal } from './components/blend/BlendModal.js';
export { ReplaceDrawer } from './components/replace/ReplaceDrawer.js';
export { CheckpointsMenu } from './components/checkpoints/CheckpointsMenu.js';
