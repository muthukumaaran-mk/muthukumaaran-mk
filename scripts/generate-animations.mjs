import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spaceScenes } from './space-scene.mjs';

// Dependency-free SVG/SMIL. Open the generated files directly to see the loops.
// Every trajectory is periodic; the last sample equals the first sample.
const destination = new URL('../assets/', import.meta.url);
await mkdir(destination, { recursive: true });
const tau = Math.PI * 2;
const samples = 48;
const duration = 8;
const number = x => x.toFixed(2);
const values = fn => Array.from({ length: samples + 1 }, (_, i) => number(fn(tau * (i % samples) / samples))).join(';');
const animation = (attribute, fn) => `<animate attributeName="${attribute}" values="${values(fn)}" dur="${duration}s" repeatCount="indefinite"/>`;
function equalizer() {
  let body = '<path d="M2 6.5 7 10 2 13.5Z" fill="#92979e"/>';
  for (let i = 0; i < 4; i++) {
    const h = t => 3 + (Math.sin(t + i * 1.6) + 1) * 4;
    body += `<rect x="${11 + i * 3.5}" y="${number(10 - h(0) / 2)}" width="1.8" height="${number(h(0))}" rx="0.9" fill="#9ba1a8">${animation('height', h).replace('8s', '1.6s')}${animation('y', t => 10 - h(t) / 2).replace('8s', '1.6s')}</rect>`;
  }
  // GitHub strips custom HTML link colours. Keep this small music label in
  // the vector so it stays monochrome; its song title is also image alt text.
  body += '<text x="31" y="13.5" fill="#9ba1a8" font-family="Arial,Helvetica,sans-serif" font-size="12">Tame Impala — Loser</text>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 154 20" width="154" height="20" role="img" aria-label="Tame Impala — Loser; play song"><title>Tame Impala — Loser; play song</title>${body}</svg>\n`;
}

for (const [name, content] of [...await spaceScenes(), ['equalizer.svg', equalizer()]]) {
  await writeFile(new URL(name, destination), content);
  console.log(`${fileURLToPath(new URL(name, destination))}: ${Buffer.byteLength(content).toLocaleString()} bytes`);
}
