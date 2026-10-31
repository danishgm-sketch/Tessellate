import { zipSync, strToU8, type Zippable } from 'fflate';

/**
 * Compresses an in-memory file record into a standard ZIP archive buffer using fflate.
 * Supported in both browser and Node.js environments with zero native dependencies.
 */
export function createZipArchive(files: Record<string, string | Uint8Array>): Uint8Array {
  // A null-prototype map keeps names such as `__proto__` from changing the
  // archive builder's object prototype.
  const zippable = Object.create(null) as Zippable;
  const normalizedPaths = new Set<string>();

  for (const [filePath, content] of Object.entries(files)) {
    const normalizedPath = filePath.replaceAll('\\', '/');
    const segments = normalizedPath.split('/');
    const hasUnsafeSegment = segments.some((segment) => {
      const windowsDeviceName = segment.split('.')[0]?.toUpperCase() ?? '';
      const hasNonPortableCharacter = segment.split('').some((character) => {
        const code = character.charCodeAt(0);
        return code < 32 || code === 127 || '<>:"|?*'.includes(character);
      });
      return (
        !segment ||
        segment === '.' ||
        segment === '..' ||
        hasNonPortableCharacter ||
        /[. ]$/.test(segment) ||
        /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/.test(windowsDeviceName)
      );
    });
    if (
      !normalizedPath ||
      normalizedPath.startsWith('/') ||
      /^[a-zA-Z]:/.test(normalizedPath) ||
      hasUnsafeSegment
    ) {
      throw new Error(`Refusing unsafe ZIP path: ${JSON.stringify(filePath)}`);
    }

    // ZIP paths are POSIX paths. Reject aliases (including Windows separators
    // and case-only collisions) so extraction cannot silently overwrite files.
    const collisionKey = normalizedPath.toLowerCase();
    if (normalizedPaths.has(collisionKey)) {
      throw new Error(`Refusing duplicate ZIP path: ${JSON.stringify(filePath)}`);
    }
    normalizedPaths.add(collisionKey);

    if (typeof content === 'string') {
      zippable[normalizedPath] = strToU8(content);
    } else {
      zippable[normalizedPath] = content;
    }
  }

  return zipSync(zippable, { level: 6 });
}
