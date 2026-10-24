import * as path from 'node:path';
import * as ts from 'typescript';

function staticManifestDataError(filePath: string, detail: string): Error {
  return new Error(
    `Manifest module '${filePath}' must contain static manifest data only: ${detail}`
  );
}

function readStaticExpression(expression: ts.Expression, filePath: string): unknown {
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isTypeAssertionExpression(expression) ||
    ts.isSatisfiesExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    return readStaticExpression(expression.expression, filePath);
  }

  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text;
  }
  if (ts.isNumericLiteral(expression)) {
    const value = Number(expression.text);
    if (Number.isFinite(value)) return value;
  }
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (expression.kind === ts.SyntaxKind.NullKeyword) return null;
  if (
    ts.isPrefixUnaryExpression(expression) &&
    (expression.operator === ts.SyntaxKind.MinusToken || expression.operator === ts.SyntaxKind.PlusToken) &&
    ts.isNumericLiteral(expression.operand)
  ) {
    const value = Number(expression.operand.text) * (expression.operator === ts.SyntaxKind.MinusToken ? -1 : 1);
    if (Number.isFinite(value)) return value;
  }
  if (ts.isArrayLiteralExpression(expression)) {
    return expression.elements.map((element) => {
      if (ts.isSpreadElement(element) || ts.isOmittedExpression(element)) {
        throw staticManifestDataError(filePath, 'spread and sparse array entries are not allowed');
      }
      return readStaticExpression(element, filePath);
    });
  }
  if (ts.isObjectLiteralExpression(expression)) {
    const result: Record<string, unknown> = {};
    for (const property of expression.properties) {
      if (!ts.isPropertyAssignment(property)) {
        throw staticManifestDataError(filePath, 'only plain object properties are allowed');
      }
      const name = property.name;
      if (!name || ts.isComputedPropertyName(name)) {
        throw staticManifestDataError(filePath, 'computed property names are not allowed');
      }
      const key = ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)
        ? name.text
        : undefined;
      if (key === undefined || Object.hasOwn(result, key)) {
        throw staticManifestDataError(filePath, 'property names must be unique static keys');
      }
      Object.defineProperty(result, key, {
        value: readStaticExpression(property.initializer, filePath),
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
    return result;
  }

  throw staticManifestDataError(filePath, 'calls, identifiers, imports, and computed values are not allowed');
}

/** Reads only data literals from code-form manifests. It never evaluates module code. */
export function readStaticManifestModule(filePath: string, source: string): unknown {
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    path.extname(filePath).toLowerCase() === '.js' ? ts.ScriptKind.JS : ts.ScriptKind.TS
  );
  const parseDiagnostics = (sourceFile as ts.SourceFile & { parseDiagnostics: readonly ts.Diagnostic[] })
    .parseDiagnostics;
  if (parseDiagnostics.length > 0) {
    const detail = ts.flattenDiagnosticMessageText(parseDiagnostics[0]!.messageText, '\n');
    throw staticManifestDataError(filePath, `source cannot be parsed (${detail})`);
  }

  let manifest: unknown;
  let hasManifest = false;
  for (const statement of sourceFile.statements) {
    if (ts.isVariableStatement(statement)) {
      const isExported = statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      );
      const declaration = statement.declarationList.declarations[0];
      if (
        !isExported ||
        (statement.declarationList.flags & ts.NodeFlags.Const) === 0 ||
        statement.declarationList.declarations.length !== 1 ||
        !declaration ||
        !ts.isIdentifier(declaration.name) ||
        declaration.name.text !== 'manifest' ||
        !declaration.initializer ||
        hasManifest
      ) {
        throw staticManifestDataError(filePath, 'only one exported const manifest declaration is allowed');
      }
      manifest = readStaticExpression(declaration.initializer, filePath);
      hasManifest = true;
      continue;
    }

    if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
      if (ts.isIdentifier(statement.expression) && statement.expression.text === 'manifest') {
        if (!hasManifest) {
          throw staticManifestDataError(filePath, 'default export must reference the static manifest declaration');
        }
        continue;
      }
      if (hasManifest) {
        throw staticManifestDataError(filePath, 'multiple manifest exports are not allowed');
      }
      manifest = readStaticExpression(statement.expression, filePath);
      hasManifest = true;
      continue;
    }

    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement) || ts.isEmptyStatement(statement)) {
      continue;
    }

    throw staticManifestDataError(filePath, 'executable statements and imports are not allowed');
  }

  if (!hasManifest) {
    throw staticManifestDataError(filePath, 'an exported static manifest value is required');
  }
  return manifest;
}
