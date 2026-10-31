import type { ComponentType } from 'react';
import type { ProjectNode, ProjectManifest, PartialDesignDNA } from '@tessellate/schemas';

export interface RenderContext {
  designDNA?: PartialDesignDNA;
  tokenOverrides?: Record<string, string | number>;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  reducedMotion?: boolean;
  systemMode?:'light'|'dark';
  selectedNodeId?: string;
  hoveredNodeId?: string;
  onNodeSelect?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
  customComponents?: Record<string, ComponentType<Record<string, unknown>>>;
}

export interface NodeRendererProps {
  node: ProjectNode;
  context?: RenderContext;
}

export interface ManifestRendererProps {
  manifest: ProjectManifest;
  activeScreenId?: string;
  context?: RenderContext;
}

export type ResourceRendererMap = Record<string, ComponentType<Record<string, unknown>>>;
