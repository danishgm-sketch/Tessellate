import { BrowserNodeRenderer } from './browser-node-renderer.js';
import { createManifestRenderer } from './manifest-renderer-core.js';

export const BrowserManifestRenderer = createManifestRenderer(BrowserNodeRenderer);
