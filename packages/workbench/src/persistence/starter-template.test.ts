import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSampleProject } from '../store/sample-project.js';
import { loadWorkbenchStarterTemplate } from './starter-template.js';

afterEach(() => vi.unstubAllGlobals());

describe('Workbench starter template loading', () => {
  it('reuses the early route request and still validates the manifest', async () => {
    const manifest = createSampleProject();
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('window', { __tessellateWorkbenchStarterRequest: Promise.resolve(manifest) });

    await expect(loadWorkbenchStarterTemplate()).resolves.toEqual(manifest);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('loads and validates the starter directly when the route did not preload it', async () => {
    const manifest = createSampleProject();
    vi.stubGlobal('window', undefined);
    const fetch = vi.fn(async () => ({ ok: true, json: async () => manifest }) as Response);
    vi.stubGlobal('fetch', fetch);

    await expect(loadWorkbenchStarterTemplate()).resolves.toEqual(manifest);
    expect(fetch).toHaveBeenCalledWith('/data/workbench-starter.json');
  });

  it('reports an unsuccessful starter response instead of silently substituting a project', async () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503 }) as Response));

    await expect(loadWorkbenchStarterTemplate()).rejects.toThrow('Workbench starter HTTP 503');
  });
});
