import type {
  ProjectManifest,
  ProjectMutation,
  HistoryOperation,
  MutationActor,
} from '@tessellate/schemas';
import { executeMutation } from '../mutations/executor.js';

let operationCounter = 1;

export interface ManagedOperation extends HistoryOperation {
  priorSnapshot?: ProjectManifest;
}

export function createHistoryOperation(
  summary: string,
  mutations: ProjectMutation[],
  actor: MutationActor = 'user',
  affectedNodeIds: string[] = []
): HistoryOperation {
  const allAffectedNodes = new Set(affectedNodeIds);
  for (const m of mutations) {
    if (m.targetId && m.targetId !== 'project') {
      allAffectedNodes.add(m.targetId);
    }
  }

  return {
    id: `op-${Date.now()}-${operationCounter++}`,
    summary,
    actor,
    createdAt: new Date().toISOString(),
    mutations,
    inverseMutations: [],
    affectedNodeIds: Array.from(allAffectedNodes),
  };
}

/**
 * Applies a grouped semantic HistoryOperation to a ProjectManifest.
 * All atomic mutations in the operation are executed in order.
 * Inverses are collected in reverse order so undo can unwind them cleanly.
 */
export function applyOperation(
  manifest: ProjectManifest,
  operation: HistoryOperation
): { nextManifest: ProjectManifest; executedOperation: ManagedOperation } {
  let currentManifest = manifest;
  const inverseMutations: ProjectMutation[] = [];

  for (const mutation of operation.mutations) {
    // Sync mutation preconditionRevision with currentManifest if needed
    const preparedMutation: ProjectMutation = {
      ...mutation,
      preconditionRevision: currentManifest.historyMeta.headRevision,
    };

    const res = executeMutation(currentManifest, preparedMutation);
    currentManifest = res.nextManifest;
    // Insert inverse at beginning so inverse array is reverse order
    inverseMutations.unshift(res.inverseMutation);
  }

  const executedOperation: ManagedOperation = {
    ...operation,
    inverseMutations,
    priorSnapshot: manifest, // store exact prior snapshot for guaranteed lossless recovery
  };

  return {
    nextManifest: currentManifest,
    executedOperation,
  };
}

/**
 * Reverses a previously applied HistoryOperation.
 * Guarantees exact restoration of prior manifest.
 */
export function undoOperation(
  manifest: ProjectManifest,
  operation: ManagedOperation
): ProjectManifest {
  if (operation.priorSnapshot) {
    return operation.priorSnapshot;
  }

  // Fallback: apply inverse mutations in sequence
  let currentManifest = manifest;
  for (const inv of operation.inverseMutations) {
    const preparedInverse: ProjectMutation = {
      ...inv,
      preconditionRevision: currentManifest.historyMeta.headRevision,
    };
    const res = executeMutation(currentManifest, preparedInverse, {
      skipRevisionCheck: true,
      skipLockCheck: true,
    });
    currentManifest = res.nextManifest;
  }

  return currentManifest;
}

/**
 * Re-applies a previously undone HistoryOperation.
 */
export function redoOperation(
  manifest: ProjectManifest,
  operation: HistoryOperation
): { nextManifest: ProjectManifest; executedOperation: ManagedOperation } {
  return applyOperation(manifest, operation);
}

/**
 * Manages undo/redo stacks over semantic HistoryOperations.
 */
export class HistoryManager {
  private undoStack: ManagedOperation[] = [];
  private redoStack: ManagedOperation[] = [];
  private maxHistorySize: number;

  constructor(maxHistorySize = 50) {
    this.maxHistorySize = maxHistorySize;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public getUndoStack(): readonly ManagedOperation[] {
    return this.undoStack;
  }

  public getRedoStack(): readonly ManagedOperation[] {
    return this.redoStack;
  }

  public execute(
    manifest: ProjectManifest,
    operation: HistoryOperation
  ): { nextManifest: ProjectManifest; executedOperation: ManagedOperation } {
    const result = applyOperation(manifest, operation);
    this.undoStack.push(result.executedOperation);
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
    // Any new execution clears redo stack
    this.redoStack = [];
    return result;
  }

  public undo(manifest: ProjectManifest): {
    nextManifest: ProjectManifest;
    undoneOperation: ManagedOperation;
  } | null {
    const op = this.undoStack.pop();
    if (!op) return null;

    const nextManifest = undoOperation(manifest, op);
    this.redoStack.push(op);
    return { nextManifest, undoneOperation: op };
  }

  public redo(manifest: ProjectManifest): {
    nextManifest: ProjectManifest;
    redoneOperation: ManagedOperation;
  } | null {
    const op = this.redoStack.pop();
    if (!op) return null;

    const result = redoOperation(manifest, op);
    this.undoStack.push(result.executedOperation);
    return { nextManifest: result.nextManifest, redoneOperation: result.executedOperation };
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
