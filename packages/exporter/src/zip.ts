import { zipSync, strToU8, type Zippable } from 'fflate';

/**
 * Compresses an in-memory file record into a standard ZIP archive buffer using fflate.
 * Supported in both browser and Node.js environments with zero native dependencies.
 */
export function createZipArchive(files: Record<string, string | Uint8Array>): Uint8Array {
  const zippable: Zippable = {};

  for (const [filePath, content] of Object.entries(files)) {
    // fflate handles nested paths formatted with '/'
    if (typeof content === 'string') {
      zippable[filePath] = strToU8(content);
    } else {
      zippable[filePath] = content;
    }
  }

  return zipSync(zippable, { level: 6 });
}
