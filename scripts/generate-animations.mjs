import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

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
const svg = (label, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 72" width="800" height="72" role="img" aria-label="${label}"><title>${label}</title><g transform="scale(1 .69)">${body}</g></svg>\n`;

function connectivity() {
  let body = '';
  // Two folded particle surfaces breathe toward the bridge in opposite phases.
  for (const side of [-1, 1]) {
    for (let row = 0; row < 13; row++) {
      for (let column = 0; column < 35; column++) {
        const u = column / 34;
        const depth = row / 12;
        const x = 400 + side * (65 + u * 305);
        const envelope = Math.sin(u * Math.PI * 0.85) * 27 + 2;
        const y = t => 51 + Math.sin(u * 7.2 + t * side + depth * 2.8) * envelope * (0.5 + depth * 0.5) + (depth - 0.5) * 27;
        const grey = Math.round(130 + depth * 104);
        body += `<circle cx="${number(x)}" cy="${number(y(0))}" r="${number(0.45 + depth * 0.4)}" fill="rgb(${grey},${grey},${grey})" opacity="${number(0.22 + depth * 0.62)}">${animation('cy', y)}</circle>`;
      }
    }
  }
  const nodes = Array.from({ length: 9 }, (_, i) => ({ x: 297 + i * 25.75, y: t => 52 + Math.sin(i * 1.7 + t) * (i % 2 ? 13 : 6) }));
  nodes.forEach((node, i) => {
    if (i) {
      const previous = nodes[i - 1];
      body += `<line x1="${previous.x}" x2="${node.x}" y1="${number(previous.y(0))}" y2="${number(node.y(0))}" stroke="#aaa" stroke-width="0.55" opacity="0.6">${animation('y1', previous.y)}${animation('y2', node.y)}</line>`;
    }
    if (i > 1) {
      const previous = nodes[i - 2];
      body += `<line x1="${previous.x}" x2="${node.x}" y1="${number(previous.y(0))}" y2="${number(node.y(0))}" stroke="#999" stroke-width="0.4" opacity="0.15">${animation('y1', previous.y)}${animation('y2', node.y)}${animation('opacity', t => 0.14 + 0.12 * Math.sin(t + i))}</line>`;
    }
    body += `<circle cx="${node.x}" cy="${number(node.y(0))}" r="1.6" fill="#ddd">${animation('cy', node.y)}${animation('opacity', t => 0.64 + 0.3 * Math.sin(t + i))}</circle>`;
  });
  // Small particles travel across the bridge; opacity hides each periodic reset.
  for (let i = 0; i < 6; i++) {
    const position = t => ((t / tau + i / 6) % 1);
    body += `<circle r="1" fill="#eee" opacity="0">${animation('cx', t => 280 + position(t) * 240)}${animation('cy', t => 52 + Math.sin(position(t) * tau) * 8)}${animation('opacity', t => Math.sin(position(t) * Math.PI) ** 2 * 0.85)}</circle>`;
  }
  return svg('Two monochrome particle surfaces exchanging connections', body);
}

function wave() {
  let body = '';
  for (let row = 0; row < 17; row++) {
    for (let column = 0; column < 74; column++) {
      const depth = row / 16;
      const u = column / 73;
      const x = 400 + (u - 0.5) * (630 + depth * 135);
      const y = t => 51 + Math.sin(u * tau * 1.65 + t + depth * 2.4) * 18 + Math.sin(u * tau * 0.8 - t + depth) * 10 + (depth - 0.5) * 32;
      const grey = Math.round(125 + depth * 118);
      const opacity = (0.16 + depth * 0.68) * (0.15 + Math.sin(u * Math.PI) ** 0.4 * 0.85);
      body += `<circle cx="${number(x)}" cy="${number(y(0))}" r="${number(0.4 + depth * 0.48)}" fill="rgb(${grey},${grey},${grey})" opacity="${number(opacity)}">${animation('cy', y)}</circle>`;
    }
  }
  return svg('Seamlessly looping monochrome three-dimensional particle wave', body);
}

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

for (const [name, content] of [['connectivity.svg', connectivity()], ['particle-wave.svg', wave()], ['equalizer.svg', equalizer()]]) {
  await writeFile(new URL(name, destination), content);
  console.log(`${fileURLToPath(new URL(name, destination))}: ${Buffer.byteLength(content).toLocaleString()} bytes`);
}
