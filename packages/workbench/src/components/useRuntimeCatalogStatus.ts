import { useSyncExternalStore } from 'react';
import { getRuntimeCatalogStatus, subscribeRuntimeCatalog } from '../mutations/runtime-catalog.js';

export function useRuntimeCatalogStatus() {
  return useSyncExternalStore(subscribeRuntimeCatalog, getRuntimeCatalogStatus, getRuntimeCatalogStatus);
}
