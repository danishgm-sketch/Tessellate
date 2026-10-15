import type { AstDiff } from './types.js';

/**
 * Creates a standard unified diff between original and modified file contents.
 */
export function generateAstDiff(
  filePath: string,
  originalContent: string,
  modifiedContent: string
): AstDiff {
  if (originalContent === modifiedContent) {
    return {
      filePath,
      originalContent,
      modifiedContent,
      hasChanges: false,
      unifiedDiff: '',
    };
  }

  const originalLines = originalContent.split('\n');
  const modifiedLines = modifiedContent.split('\n');

  const diffLines: string[] = [
    `--- a/${filePath}`,
    `+++ b/${filePath}`,
    `@@ -1,${originalLines.length} +1,${modifiedLines.length} @@`,
  ];

  const maxLines = Math.max(originalLines.length, modifiedLines.length);
  for (let i = 0; i < maxLines; i++) {
    const orig = originalLines[i];
    const mod = modifiedLines[i];

    if (orig !== mod) {
      if (orig !== undefined) diffLines.push(`-${orig}`);
      if (mod !== undefined) diffLines.push(`+${mod}`);
    } else if (orig !== undefined) {
      diffLines.push(` ${orig}`);
    }
  }

  return {
    filePath,
    originalContent,
    modifiedContent,
    hasChanges: true,
    unifiedDiff: diffLines.join('\n'),
  };
}

/**
 * Safely applies a visual AST mutation to existing TSX source code,
 * replacing the target JSX element while preserving imports, React hooks,
 * and custom business logic.
 */
export function applyVisualMutationToSource(
  sourceCode: string,
  targetPattern: RegExp | string,
  replacementJsx: string
): { modifiedCode: string; applied: boolean } {
  if (typeof targetPattern === 'string') {
    if (!sourceCode.includes(targetPattern)) {
      return { modifiedCode: sourceCode, applied: false };
    }
    const modifiedCode = sourceCode.replace(targetPattern, replacementJsx);
    return { modifiedCode, applied: true };
  }

  if (!targetPattern.test(sourceCode)) {
    return { modifiedCode: sourceCode, applied: false };
  }

  const modifiedCode = sourceCode.replace(targetPattern, replacementJsx);
  return { modifiedCode, applied: true };
}
