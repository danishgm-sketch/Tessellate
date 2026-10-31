import * as path from 'node:path';
import * as ts from 'typescript';
import type { AstDiff, JSXAttributeMutation, VisualMutationResult } from './types.js';

function safeRelativePath(filePath: string): string {
  const normalized = filePath.replaceAll('\\', '/');
  const segments = normalized.split('/');
  if (
    !normalized ||
    path.posix.isAbsolute(normalized) ||
    path.win32.isAbsolute(filePath) ||
    segments.some((segment) => segment === '..') ||
    normalized.split('').some((character) => character.charCodeAt(0) < 32)
  ) {
    throw new Error('Diff path must be a safe relative workspace path.');
  }
  return normalized.replace(/^(?:\.\/)+/, '');
}

function sourceSyntaxError(sourceCode: string, fileName: string): string | undefined {
  const result = ts.transpileModule(sourceCode, {
    fileName,
    reportDiagnostics: true,
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
    },
  });
  const diagnostic = result.diagnostics?.find(
    (item) => item.category === ts.DiagnosticCategory.Error
  );
  return diagnostic ? ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ') : undefined;
}

function componentNameFor(node: ts.Node): string | undefined {
  let current: ts.Node | undefined = node;
  while (current) {
    if (ts.isFunctionDeclaration(current) && current.name) return current.name.text;
    if (
      ts.isVariableDeclaration(current) &&
      ts.isIdentifier(current.name) &&
      current.initializer &&
      (ts.isArrowFunction(current.initializer) || ts.isFunctionExpression(current.initializer))
    )
      return current.name.text;
    current = current.parent;
  }
  return undefined;
}

function tagNameOf(node: ts.JsxElement | ts.JsxSelfClosingElement): string {
  return (ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName).getText();
}

function collectDirectJsxChildren(
  node: ts.JsxElement
): Array<ts.JsxElement | ts.JsxSelfClosingElement> {
  const children: Array<ts.JsxElement | ts.JsxSelfClosingElement> = [];
  const visit = (child: ts.Node) => {
    if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
      children.push(child);
      return;
    }
    if (ts.isJsxFragment(child)) {
      child.children.forEach(visit);
      return;
    }
    if (ts.isJsxExpression(child) && child.expression) {
      ts.forEachChild(child.expression, visit);
      return;
    }
    if (
      ts.isCallExpression(child) ||
      ts.isArrowFunction(child) ||
      ts.isConditionalExpression(child) ||
      ts.isArrayLiteralExpression(child)
    ) {
      ts.forEachChild(child, visit);
    }
  };
  node.children.forEach(visit);
  return children;
}

function directJsxRoots(component: ts.Node): Array<ts.JsxElement | ts.JsxSelfClosingElement> {
  const roots: Array<ts.JsxElement | ts.JsxSelfClosingElement> = [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      roots.push(node);
      return;
    }
    if (ts.isJsxFragment(node)) {
      node.children.forEach(visit);
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(component);
  return roots.filter((element) => {
    let parent = element.parent;
    while (parent && parent !== component) {
      if (ts.isJsxElement(parent)) return false;
      parent = parent.parent;
    }
    return parent === component;
  });
}

function jsxElementPath(
  node: ts.JsxElement | ts.JsxSelfClosingElement,
  component: ts.Node
): string | undefined {
  const chain: Array<ts.JsxElement | ts.JsxSelfClosingElement> = [];
  let current: ts.Node | undefined = node;
  while (current && current !== component) {
    if (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current)) chain.push(current);
    current = current.parent;
  }
  if (current !== component || chain.length === 0) return undefined;
  chain.reverse();

  const segments: string[] = [];
  for (let index = 0; index < chain.length; index++) {
    const element = chain[index]!;
    const parent = index === 0 ? undefined : chain[index - 1];
    const siblings =
      parent && ts.isJsxElement(parent)
        ? collectDirectJsxChildren(parent)
        : directJsxRoots(component);
    const sameTag = siblings.filter((sibling) => tagNameOf(sibling) === tagNameOf(element));
    const occurrence = sameTag.indexOf(element);
    if (occurrence < 0) return undefined;
    segments.push(`${tagNameOf(element)}[${occurrence}]`);
  }
  return segments.join('/');
}

function escapeAttributeValue(value: string, quote: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll(quote, `\\${quote}`)
    .replaceAll('\r', ' ')
    .replaceAll('\n', ' ')
    .replaceAll('\0', ' ');
}

function review(sourceCode: string, reason: string): VisualMutationResult {
  return { safety: 'REVIEW_REQUIRED', reason, modifiedCode: sourceCode, applied: false };
}

/**
 * Applies only an exact, uniquely-addressed, static JSX className edit.
 * Broad text/regular-expression replacements are explicitly unsupported.
 */
export function applyVisualMutationToSource(
  sourceCode: string,
  mutation: JSXAttributeMutation | RegExp | string,
  legacyReplacement?: string
): VisualMutationResult {
  if (typeof mutation === 'string' || mutation instanceof RegExp) {
    void legacyReplacement;
    return {
      safety: 'UNSUPPORTED',
      reason: 'Text and regular-expression replacements do not prove a safe JSX edit boundary.',
      modifiedCode: sourceCode,
      applied: false,
    };
  }

  const syntaxError = sourceSyntaxError(sourceCode, mutation.fileName);
  if (syntaxError) {
    return {
      safety: 'UNSUPPORTED',
      reason: `Source has a syntax error and cannot be safely patched: ${syntaxError}`,
      modifiedCode: sourceCode,
      applied: false,
    };
  }

  const sourceFile = ts.createSourceFile(
    mutation.fileName,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );
  const matches: Array<{ element: ts.JsxElement | ts.JsxSelfClosingElement; component: ts.Node }> =
    [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      if (componentNameFor(node) === mutation.componentName) {
        const component = (() => {
          let current: ts.Node | undefined = node;
          while (current) {
            if (
              (ts.isFunctionDeclaration(current) &&
                current.name?.text === mutation.componentName) ||
              (ts.isVariableDeclaration(current) &&
                ts.isIdentifier(current.name) &&
                current.name.text === mutation.componentName)
            )
              return current;
            current = current.parent;
          }
          return undefined;
        })();
        if (component && jsxElementPath(node, component) === mutation.elementPath)
          matches.push({ element: node, component });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  if (matches.length !== 1) {
    return review(
      sourceCode,
      matches.length === 0
        ? 'The requested component and JSX path no longer match this source; inspect the current file before patching.'
        : 'The requested component and JSX path matched more than one element; inspect the current file before patching.'
    );
  }

  const element = matches[0]!.element;
  const opening = ts.isJsxElement(element) ? element.openingElement : element;
  const attributes = opening.attributes.properties.filter(
    (property): property is ts.JsxAttribute =>
      ts.isJsxAttribute(property) && property.name.getText(sourceFile) === mutation.attributeName
  );
  if (attributes.length !== 1)
    return review(sourceCode, 'The requested static className attribute was missing or ambiguous.');

  const attribute = attributes[0]!;
  if (!attribute.initializer || !ts.isStringLiteral(attribute.initializer)) {
    return review(
      sourceCode,
      'Computed or expression-based className values require manual review.'
    );
  }
  if (attribute.initializer.text !== mutation.expectedValue) {
    return review(
      sourceCode,
      'The current className differs from the expected source value; the project may have changed since analysis.'
    );
  }
  if (mutation.replacementValue === mutation.expectedValue) {
    return {
      safety: 'SAFE',
      reason: 'The requested className is already present.',
      modifiedCode: sourceCode,
      applied: false,
    };
  }

  const literal = attribute.initializer;
  const quote = sourceCode[literal.getStart(sourceFile)]!;
  const replacementLiteral = `${quote}${escapeAttributeValue(mutation.replacementValue, quote)}${quote}`;
  const modifiedCode =
    sourceCode.slice(0, literal.getStart(sourceFile)) +
    replacementLiteral +
    sourceCode.slice(literal.end);
  const postEditError = sourceSyntaxError(modifiedCode, mutation.fileName);
  if (postEditError)
    return review(
      sourceCode,
      `The proposed edit did not preserve valid TSX syntax: ${postEditError}`
    );

  return {
    safety: 'SAFE',
    reason:
      'One exact static className literal was changed; surrounding source remains byte-for-byte intact.',
    modifiedCode,
    applied: true,
  };
}

/** Creates a valid single-hunk unified diff for a changed, safe relative source path. */
export function generateAstDiff(
  filePath: string,
  originalContent: string,
  modifiedContent: string
): AstDiff {
  const safePath = safeRelativePath(filePath);
  if (originalContent === modifiedContent) {
    return {
      filePath: safePath,
      originalContent,
      modifiedContent,
      hasChanges: false,
      unifiedDiff: '',
    };
  }

  const toLines = (content: string) => {
    if (content.length === 0) return [];
    const hasFinalNewline = content.endsWith('\n');
    const lines = content.split('\n');
    if (hasFinalNewline) lines.pop();
    return lines.map((text, index) => ({
      text,
      hasNewline: index < lines.length - 1 || hasFinalNewline,
    }));
  };
  const originalLines = toLines(originalContent);
  const modifiedLines = toLines(modifiedContent);
  const sameLine = (
    left: (typeof originalLines)[number] | undefined,
    right: (typeof modifiedLines)[number] | undefined
  ) => left?.text === right?.text && left?.hasNewline === right?.hasNewline;
  let commonPrefix = 0;
  while (
    commonPrefix < originalLines.length &&
    commonPrefix < modifiedLines.length &&
    sameLine(originalLines[commonPrefix], modifiedLines[commonPrefix])
  )
    commonPrefix++;
  let commonSuffix = 0;
  while (
    commonSuffix < originalLines.length - commonPrefix &&
    commonSuffix < modifiedLines.length - commonPrefix &&
    sameLine(
      originalLines[originalLines.length - commonSuffix - 1],
      modifiedLines[modifiedLines.length - commonSuffix - 1]
    )
  )
    commonSuffix++;

  const contextBefore = Math.max(0, commonPrefix - 3);
  const trailingContextCount = Math.min(3, commonSuffix);
  const oldChangedEnd = originalLines.length - commonSuffix;
  const newChangedEnd = modifiedLines.length - commonSuffix;
  const leadingContext = originalLines
    .slice(contextBefore, commonPrefix)
    .map((line) => ` ${line.text}`);
  const removedTokens = originalLines.slice(commonPrefix, oldChangedEnd);
  const addedTokens = modifiedLines.slice(commonPrefix, newChangedEnd);
  const trailingTokens = originalLines.slice(oldChangedEnd, oldChangedEnd + trailingContextCount);
  const noNewlineMarker = '\\ No newline at end of file';
  const removedLines = removedTokens.flatMap((line) =>
    line.hasNewline ? [`-${line.text}`] : [`-${line.text}`, noNewlineMarker]
  );
  const addedLines = addedTokens.flatMap((line) =>
    line.hasNewline ? [`+${line.text}`] : [`+${line.text}`, noNewlineMarker]
  );
  const trailingContext = trailingTokens.flatMap((line) =>
    line.hasNewline ? [` ${line.text}`] : [` ${line.text}`, noNewlineMarker]
  );
  const newCount = leadingContext.length + addedTokens.length + trailingTokens.length;
  const oldLineCount = leadingContext.length + removedTokens.length + trailingTokens.length;
  const oldStart = oldLineCount === 0 ? contextBefore : contextBefore + 1;
  const newStart = newCount === 0 ? contextBefore : contextBefore + 1;
  const hunk = [
    `@@ -${oldStart},${oldLineCount} +${newStart},${newCount} @@`,
    ...leadingContext,
    ...removedLines,
    ...addedLines,
    ...trailingContext,
  ];
  // Counts describe source lines, excluding the metadata marker lines.
  const unifiedDiff = [`--- a/${safePath}`, `+++ b/${safePath}`, ...hunk].join('\n');

  return { filePath: safePath, originalContent, modifiedContent, hasChanges: true, unifiedDiff };
}
