import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { validProjectFixture } from '@tessellate/schemas';
import { resolveResourceFromDisk } from '../node-disk-resolver.js';
import { generateSourceTree } from '../source-tree.js';

const temporaryPaths: string[] = [];

afterEach(() => {
  vi.restoreAllMocks();
  for (const temporaryPath of temporaryPaths.splice(0)) {
    fs.rmSync(temporaryPath, { recursive: true, force: true });
  }
});

describe('Node disk resource resolver security', () => {
  it('does not resolve a resource slug that traverses above the resource root', () => {
    const repositoryRoot = process.cwd();
    const externalResource = fs.mkdtempSync(path.join(repositoryRoot, 'resource-resolver-audit-'));
    temporaryPaths.push(externalResource);
    fs.writeFileSync(
      path.join(externalResource, 'index.tsx'),
      'export const LocalSecret = "outside the resources tree";'
    );

    const slug = `../../${path.basename(externalResource)}`;
    expect(resolveResourceFromDisk(slug)).toBeNull();
  });

  it('fails a standalone export instead of copying a source file named by a hostile project manifest', () => {
    const repositoryRoot = process.cwd();
    const externalResource = fs.mkdtempSync(path.join(repositoryRoot, 'resource-export-audit-'));
    temporaryPaths.push(externalResource);
    fs.writeFileSync(
      path.join(externalResource, 'index.tsx'),
      'export const LocalSecret = "outside the resources tree";'
    );

    const hostileManifest = structuredClone(validProjectFixture);
    hostileManifest.screens[0]!.rootNode.resourceRef = {
      id: 'res_hostile_path',
      slug: `../../${path.basename(externalResource)}`,
      version: '1.0.0',
    };

    expect(() => generateSourceTree(hostileManifest)).toThrow(/unresolved resource/i);
  });

  it('does not read a resource directory symlink that points outside the resource root', () => {
    const repositoryRoot = process.cwd();
    const resourcesRoot = path.join(repositoryRoot, 'resources');
    const category = `resolver-audit-${Math.random().toString(36).slice(2, 10)}`;
    const categoryDirectory = path.join(resourcesRoot, category);
    const resourceSlug = 'external-target';
    const resourceDirectory = path.join(categoryDirectory, resourceSlug);
    const externalResource = fs.mkdtempSync(path.join(repositoryRoot, 'resource-link-audit-'));
    temporaryPaths.push(categoryDirectory, externalResource);
    fs.mkdirSync(categoryDirectory, { recursive: true });
    fs.writeFileSync(
      path.join(externalResource, 'index.tsx'),
      'export const LocalSecret = "outside the resources tree";'
    );
    fs.symlinkSync(
      externalResource,
      resourceDirectory,
      process.platform === 'win32' ? 'junction' : 'dir'
    );

    expect(resolveResourceFromDisk(resourceSlug)).toBeNull();
  });

  it('does not traverse a symlink used as the resources search root', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(process.cwd(), 'resource-root-link-audit-'));
    const actualRoot = path.join(temporaryRoot, 'actual-resources');
    const resourceSlug = `root-link-audit-${Math.random().toString(36).slice(2, 10)}`;
    const resourceDirectory = path.join(actualRoot, 'category', resourceSlug);
    const linkedRoot = path.join(temporaryRoot, 'resources');
    temporaryPaths.push(temporaryRoot);
    fs.mkdirSync(resourceDirectory, { recursive: true });
    fs.writeFileSync(path.join(resourceDirectory, 'index.tsx'), 'export const LocalSecret = "outside";');
    fs.symlinkSync(actualRoot, linkedRoot, process.platform === 'win32' ? 'junction' : 'dir');
    vi.spyOn(process, 'cwd').mockReturnValue(temporaryRoot);

    expect(resolveResourceFromDisk(resourceSlug)).toBeNull();
  });
});
