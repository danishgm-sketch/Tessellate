import { writeFile } from 'node:fs/promises';
import { createZipArchive } from '../../../packages/exporter/src/zip.ts';

const archive = createZipArchive({
  'package.json': JSON.stringify(
    { name: 'tessellate-zip-consumer-fixture', version: '1.0.0' },
    null,
    2
  ),
  'README.md': '# Tessellate ZIP consumer fixture\n\nIndependent extraction check.\n',
  'src/App.tsx': 'export function App() { return <main>ZIP extraction verified</main>; }\n',
});

await writeFile('quality/evidence/step-37/zip-consumer-fixture.zip', archive, { flag: 'wx' });
