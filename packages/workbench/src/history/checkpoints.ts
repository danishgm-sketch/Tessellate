import type { ProjectManifest } from '@tessellate/schemas';

export type CheckpointType = 'auto' | 'named';

export type CheckpointTrigger =
  | 'initial-generation'
  | 'pre-recompose'
  | 'pre-ai'
  | 'pre-blend'
  | 'manual'
  | 'pre-migration';

export interface Checkpoint {
  id: string;
  name: string;
  timestamp: string;
  type: CheckpointType;
  trigger: CheckpointTrigger;
  manifest: ProjectManifest;
  description?: string;
}

let checkpointCounter = 1;

/**
 * Creates an immutable checkpoint capturing the current project manifest state.
 */
export function createCheckpoint(
  manifest: ProjectManifest,
  options: {
    name?: string;
    type?: CheckpointType;
    trigger: CheckpointTrigger;
    description?: string;
  }
): Checkpoint {
  const timestamp = new Date().toISOString();
  const type = options.type ?? (options.trigger === 'manual' ? 'named' : 'auto');
  const defaultName =
    options.name ??
    (type === 'named'
      ? `Checkpoint #${checkpointCounter}`
      : `Auto: ${options.trigger.replace(/-/g, ' ')}`);

  return {
    id: `chk-${Date.now()}-${checkpointCounter++}`,
    name: defaultName,
    timestamp,
    type,
    trigger: options.trigger,
    description: options.description,
    manifest: JSON.parse(JSON.stringify(manifest)) as ProjectManifest,
  };
}

/**
 * Restores a project manifest from a checkpoint.
 * Returns a cloned manifest with updated timestamp and preserved revision continuity.
 */
export function restoreCheckpoint(checkpoint: Checkpoint): ProjectManifest {
  const restored = JSON.parse(JSON.stringify(checkpoint.manifest)) as ProjectManifest;
  return {
    ...restored,
    updatedAt: new Date().toISOString(),
  };
}
