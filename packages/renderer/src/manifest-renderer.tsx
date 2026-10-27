import { createManifestRenderer } from './manifest-renderer-core.js';
import { NodeRenderer } from './node-renderer.js';

export const ManifestRenderer = createManifestRenderer(NodeRenderer);
