// ZIP export, manifest export, agent handoff package generator
export const EXPORTER_VERSION = '0.1.0';

export * from './manifest-io.js';
export * from './dependencies.js';
export * from './source-tree.js';
export * from './zip.js';
export * from './agent-handoff.js';
export * from './validation.js';
export * from './generated-gold-sources.js';
// Node consumers opt into @tessellate/exporter/node-disk-resolver.
// The browser entry must not load a filesystem adapter or its side effects.
export * from './targets/w3c-tokens.js';
export * from './targets/expo-native.js';
export * from './targets/swiftui.js';


