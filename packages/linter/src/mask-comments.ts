/** Replaces JavaScript/TypeScript comments with spaces while preserving offsets and lines. */
export function maskComments(source: string): string {
  const output = source.split('');
  let state: 'code' | 'single' | 'double' | 'template' | 'line-comment' | 'block-comment' = 'code';

  const mask = (index: number) => {
    if (output[index] !== '\n' && output[index] !== '\r') output[index] = ' ';
  };

  for (let index = 0; index < source.length; index++) {
    const current = source[index]!;
    const next = source[index + 1];

    if (state === 'line-comment') {
      if (current === '\n' || current === '\r') state = 'code';
      else mask(index);
      continue;
    }
    if (state === 'block-comment') {
      mask(index);
      if (current === '*' && next === '/') {
        mask(index + 1);
        index++;
        state = 'code';
      }
      continue;
    }
    if (state === 'single' || state === 'double' || state === 'template') {
      if (current === '\\') {
        index++;
        continue;
      }
      if (
        (state === 'single' && current === "'") ||
        (state === 'double' && current === '"') ||
        (state === 'template' && current === '`')
      ) {
        state = 'code';
      }
      continue;
    }

    if (current === '/' && next === '/') {
      mask(index);
      mask(index + 1);
      index++;
      state = 'line-comment';
    } else if (current === '/' && next === '*') {
      mask(index);
      mask(index + 1);
      index++;
      state = 'block-comment';
    } else if (current === "'") {
      state = 'single';
    } else if (current === '"') {
      state = 'double';
    } else if (current === '`') {
      state = 'template';
    }
  }

  return output.join('');
}
