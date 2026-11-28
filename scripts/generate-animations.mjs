import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spaceScenes } from './space-scene.mjs';

// Dependency-free SVG/SMIL. Open the generated files directly to see the loops.
// Every trajectory is periodic; the last sample equals the first sample.
const destination = new URL('../assets/', import.meta.url);
await mkdir(destination, { recursive: true });

for (const [name, content] of await spaceScenes()) {
  await writeFile(new URL(name, destination), content);
  console.log(`${fileURLToPath(new URL(name, destination))}: ${Buffer.byteLength(content).toLocaleString()} bytes`);
}
