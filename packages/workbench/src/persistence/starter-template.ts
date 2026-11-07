import { ProjectManifestSchema, type ProjectManifest } from '@tessellate/schemas';

declare global {
  interface Window {
    __tessellateWorkbenchStarterRequest?: Promise<unknown>;
  }
}

/** Loads the static starter manifest, reusing the request started by the route head when available. */
export async function loadWorkbenchStarterTemplate(): Promise<ProjectManifest> {
  let raw: unknown;
  if (typeof window !== 'undefined' && window.__tessellateWorkbenchStarterRequest) {
    raw = await window.__tessellateWorkbenchStarterRequest;
  } else {
    const response = await fetch('/data/workbench-starter.json');
    if (!response.ok) throw new Error(`Workbench starter HTTP ${response.status}`);
    raw = await response.json();
  }
  return ProjectManifestSchema.parse(raw);
}
