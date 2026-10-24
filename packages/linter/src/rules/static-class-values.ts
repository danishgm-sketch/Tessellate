export interface StaticClassValue {
  value: string;
  startIndex: number;
}

function maskTemplateExpressions(template: string): string {
  const output = template.split('');
  for (let index = 0; index < template.length - 1; index++) {
    if (template[index] !== '$' || template[index + 1] !== '{') continue;
    const start = index;
    let depth = 1;
    let quote: "'" | '"' | '`' | undefined;
    let escaped = false;
    index += 2;

    for (; index < template.length && depth > 0; index++) {
      const current = template[index]!;
      if (quote) {
        if (escaped) escaped = false;
        else if (current === '\\') escaped = true;
        else if (current === quote) quote = undefined;
        continue;
      }
      if (current === "'" || current === '"' || current === '`') quote = current;
      else if (current === '{') depth++;
      else if (current === '}') depth--;
    }

    const end = Math.min(index, template.length);
    for (let cursor = start; cursor < end; cursor++) {
      if (output[cursor] !== '\n' && output[cursor] !== '\r') output[cursor] = ' ';
    }
    index = end - 1;
  }
  return output.join('');
}

/** Reads literal class attributes and static template text while omitting computed expressions. */
export function getStaticClassValues(code: string): StaticClassValue[] {
  const values: StaticClassValue[] = [];
  const patterns = [
    { regex: /\b(?:className|class)\s*=\s*"([^"]*)"/g, template: false },
    { regex: /\b(?:className|class)\s*=\s*'([^']*)'/g, template: false },
    { regex: /\b(?:className|class)\s*=\s*\{\s*`([\s\S]*?)`\s*\}/g, template: true },
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.regex.exec(code)) !== null) {
      const rawValue = match[1] ?? '';
      const captureOffset = match[0].indexOf(rawValue);
      const value = pattern.template ? maskTemplateExpressions(rawValue) : rawValue;
      values.push({ value, startIndex: match.index + captureOffset });
    }
  }

  return values.sort((a, b) => a.startIndex - b.startIndex);
}
