/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_TESSELLATE_PRIVATE_PREVIEW_ORIGIN?: string;
  readonly VITE_TESSELLATE_PARENT_ORIGINS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'virtual:tessellate-private-verso' {
  import type { ComponentType, ReactNode } from 'react';
  import type { ResourceManifest } from '@tessellate/schemas';

  export const PRIVATE_VERSO_ENABLED: boolean;
  export const PrivateVersoProvider: ComponentType<{
    palette?: string;
    mode?: string;
    children?: ReactNode;
  }> | null;

  export interface PrivateVersoLoadedResource {
    manifest: ResourceManifest;
    component: ComponentType<Record<string, unknown>>;
    source: {
      id: string;
      collection: string;
      path: string;
      sourceExport: string;
      sha256: string;
      props: Array<{ name: string; type: string; required: boolean }>;
      lineage: string[];
    };
  }

  export function loadPrivateVersoResource(slug: string): Promise<PrivateVersoLoadedResource | null>;
}

declare module 'virtual:tessellate-private-verso.css';
