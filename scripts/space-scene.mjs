import { readFile } from 'node:fs/promises';

const turn = 2 * Math.PI;
const round = value => Number(value.toFixed(2));
const dot = (x, y, radius = 1, opacity = 1) => `<circle cx="${round(x)}" cy="${round(y)}" r="${round(radius)}" opacity="${round(opacity)}"/>`;
const scatter = (count, draw) => Array.from({ length: count }, (_, i) => draw(i)).join('\n');

function randomFrom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

function starField(width, height, compact) {
  const random = randomFrom(142901);
  const layers = [compact ? 238 : 650, compact ? 84 : 232, compact ? 31 : 64];
  return layers.map((count, depth) => {
    const speed = 38 + depth * 11;
    const distance = (depth + 1) * 6;
    const dots = scatter(count, () => {
      const x = -25 + random() * (width + 50);
      const y = -25 + random() * (height + 50);
      return dot(x, y, .36 + depth * .14 + random() ** 2 * (.67 + depth * .22), .13 + random() ** 2 * (.39 + depth * .18));
    });
    return `<g>${dots}<animateTransform attributeName="transform" type="translate" values="0 0;${distance} ${-distance * .63};${-distance * .64} ${distance * .84};0 0" dur="${speed}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.33;.7;1" keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1"/></g>`;
  }).join('\n');
}

// Project a Fibonacci sphere so a bright hemisphere and dim points define the surface.
function sphere(radius, seed, sun = false) {
  const count = Math.round(140 + radius * 9);
  const random = randomFrom(seed);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return scatter(count, i => {
    const y = 1 - (i + .5) * 2 / count;
    const radial = Math.sqrt(1 - y * y);
    const x = Math.cos(i * goldenAngle) * radial;
    const z = Math.sin(i * goldenAngle) * radial;
    if (z < 0) return '';
    const lighting = Math.max(0, -.53 * x - .42 * y + .73 * z);
    const bands = .79 + .17 * Math.sin(y * 31 + x * 3) + .08 * Math.sin(y * 78);
    const opacity = sun ? .26 + .69 * random() ** .7 : .1 + lighting * bands * (.56 + random() * .38);
    return dot(radius * x, radius * y, .54 + random() * (sun ? .96 : .69), opacity);
  });
}

function dottedOrbit(radius, flattening, angle, count, opacity = .5) {
  const points = scatter(count, i => {
    const phase = i * turn / count;
    return dot(radius * Math.cos(phase), radius * flattening * Math.sin(phase), .76, opacity * (.68 + .32 * Math.sin(phase)));
  });
  return `<g transform="rotate(${angle})">${points}</g>`;
}

function sunlight(radius) {
  const random = randomFrom(1261);
  return scatter(136, i => {
    const ray = turn * i / 136;
    const length = radius * (1.08 + random() ** 3 * .8);
    return dot(length * Math.cos(ray), length * Math.sin(ray), .5 + random() * .77, .25 + random() * .52);
  });
}

function galaxy() {
  const random = randomFrom(1169);
  return scatter(420, i => {
    const radius = 2 + 64 * random() ** .92;
    const arm = i % 3;
    const angle = arm * turn / 3 + radius / 11 + (random() - .5) * .86;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle) * .37;
    return dot(x, y, .55 + random() * .89, (.53 + .47 * (1 - radius / 66)) * random());
  });
}

// Draw each creature from points along Bézier curves, without visible strokes or fills.
function outline(start, curves, spacing = 2.45) {
  let from = start;
  const dots = [];
  for (const [first, second, end] of curves) {
    const length = Math.hypot(first[0] - from[0], first[1] - from[1])
      + Math.hypot(second[0] - first[0], second[1] - first[1])
      + Math.hypot(end[0] - second[0], end[1] - second[1]);
    const steps = Math.ceil(length / spacing);
    for (let step = 0; step < steps; step++) {
      const t = step / steps;
      const s = 1 - t;
      const [x, y] = [0, 1].map(axis => s ** 3 * from[axis] + 3 * s ** 2 * t * first[axis] + 3 * s * t ** 2 * second[axis] + t ** 3 * end[axis]);
      dots.push(dot(x, y, .77 + .23 * Math.sin(dots.length * 2.4) ** 2, .48 + .46 * Math.sin(dots.length * 1.69) ** 2));
    }
    from = end;
  }
  return dots.join('\n');
}

function whale() {
  return [
    outline([-61, 5], [
      [[-64, -7], [-45, -21], [-23, -23]], [[1, -26], [26, -12], [42, -13]],
      [[51, -14], [55, -26], [66, -32]], [[68, -24], [64, -17], [57, -12]],
      [[65, -12], [73, -9], [79, -4]], [[67, -1], [59, -4], [52, -7]],
      [[23, 14], [-41, 27], [-61, 5]],
    ]),
    outline([-48, 10], [[[-21, 18], [1, 8], [37, -4]]], 3.6),
    outline([-41, 14], [[[-19, 20], [2, 11], [30, 3]]], 3.7),
    outline([1, 8], [[[9, 18], [21, 23], [28, 22]], [[23, 15], [14, 10], [10, 6]]]),
    outline([-31, -23], [[[-33, -29], [-38, -31], [-43, -31]], [[-39, -39], [-36, -41], [-35, -43]]], 3.4),
    dot(-46, -1, 1.8, .97),
  ].join('\n');
}

function squid() {
  const body = outline([0, -31], [
    [[-15, -13], [-20, 7], [-9, 15]], [[-5, 20], [6, 20], [10, 15]], [[21, 5], [11, -17], [0, -31]],
  ]);
  const fins = outline([-11, -13], [[[-22, -10], [-29, 1], [-28, 10]], [[-19, 7], [-14, 3], [-12, 1]]])
    + outline([11, -13], [[[22, -10], [29, 1], [28, 10]], [[19, 7], [14, 3], [12, 1]]]);
  const arms = scatter(6, i => {
    const x = (i - 2.5) * 3.6;
    const direction = i % 2 ? 1 : -1;
    return outline([x, 15], [[[x + 14 * direction, 31], [x - 10 * direction, 36], [x + 9 * direction, 54 - 2 * i]]], 2.1);
  });
  return `${body}${fins}${arms}${dot(-5, 10, 1.55)}${dot(5, 10, 1.55)}`;
}

function jellyfish() {
  const bell = outline([-26, 1], [
    [[-24, -31], [25, -36], [27, 1]], [[18, 11], [10, -3], [0, 7]], [[-8, -4], [-19, 12], [-26, 1]],
  ]);
  const folds = outline([-24, 0], [[[-12, -11], [13, -11], [25, 0]]], 3.3)
    + outline([-19, -7], [[[-15, -18], [-6, -23], [2, -24]]], 3.8);
  const tentacles = scatter(7, i => {
    const x = (i - 3) * 6;
    const length = 41 + 6 * Math.sin(i * 1.9) + (3 - Math.abs(i - 3)) * 3;
    return outline([x, 4], [[[x - 15, 20], [x + 16, 30], [x - 2, length]]], 2.35);
  });
  return `${bell}${folds}${tentacles}`;
}

function pizza() {
  const crust = outline([-30, -19], [
    [[-12, -33], [12, -33], [30, -19]],
    [[33, -16], [31, -11], [28, -11]],
    [[10, -23], [-10, -23], [-28, -11]],
    [[-32, -12], [-33, -16], [-30, -19]],
  ]);
  const slice = outline([-27, -11], [
    [[-18, 3], [-9, 18], [0, 32]],
    [[9, 18], [18, 3], [27, -11]],
  ]);
  const toppings = [[-12, -9, 4.1], [10, -6, 4.9], [-2, 7, 3.9]].map(([x, y, radius]) =>
    scatter(8, i => dot(x + radius * Math.cos(i * turn / 8), y + radius * Math.sin(i * turn / 8), .82, .78)),
  ).join('\n');
  return [crust, slice, toppings, dot(17, -11, .9, .62), dot(-9, 5, .87, .66), dot(4, 18, .9, .67)].join('\n');
}

function coffeeMug() {
  const rim = dottedOrbit(22, .21, 0, 38, .88);
  const cup = outline([-22, 0], [
    [[-21, 10], [-19, 24], [-16, 28]],
    [[-9, 34], [9, 34], [16, 28]],
    [[19, 24], [21, 10], [22, 0]],
  ]);
  const handle = outline([21, 4], [
    [[41, -4], [45, 23], [19, 23]],
    [[18, 21], [18, 18], [21, 17]],
    [[36, 17], [35, 5], [21, 10]],
  ]);
  const steam = [-8, 6].map(x => outline([x, -10], [
    [[x - 10, -19], [x + 9, -22], [x + 1, -32]],
  ], 3.2)).join('\n');
  return [rim, cup, handle, steam].join('\n');
}

function driftingObject(art, { x, y, scale = 1, tilt = 0, distance = 16, period = 24, phase = 0, turnBy = 16 }) {
  const positions = Array.from({ length: 24 }, (_, i) => {
    const step = i * turn / 24 + phase;
    return `${round(distance * Math.cos(step))} ${round(distance * .69 * Math.sin(step))}`;
  });
  const rotations = `${tilt - turnBy};${tilt + turnBy};${tilt - turnBy}`;
  return `<g transform="translate(${x} ${y}) scale(${scale})"><g><g transform="rotate(${tilt})">${art}
    <animateTransform attributeName="transform" type="rotate" values="${rotations}" dur="${period}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.5;1" keySplines=".42 0 .58 1;.42 0 .58 1"/>
  </g><animateTransform attributeName="transform" type="translate" values="${[...positions, positions[0]].join(';')}" dur="${period}s" repeatCount="indefinite"/></g></g>`;
}

const technologies = {
  mongodb: 'MongoDB', express: 'Express.js', react: 'React', nodejs: 'Node.js', python: 'Python', javascript: 'JavaScript',
  fastapi: 'FastAPI', celery: 'Celery', mysql: 'MySQL', redis: 'Redis', aws: 'AWS', docker: 'Docker', linux: 'Linux', git: 'Git',
};

async function loadLogos() {
  const names = Object.keys(technologies);
  return Object.fromEntries(await Promise.all(names.map(async name => {
    const variant = ['aws', 'express'].includes(name) ? `${name}-dark` : name;
    const file = await readFile(new URL(`../assets/icons/${variant}.svg`, import.meta.url), 'utf8');
    return [name, file.trim()];
  })));
}

function logo(logos, name, x, y, size) {
  // Inlined geometry works when GitHub loads this document as an image.
  return logos[name].replace('<svg ', `<svg x="${round(x)}" y="${round(y)}" width="${size}" height="${size}" `);
}

function label(text, x, y, size, weight = 500, color = '#f0f0f0') {
  return `<text x="${round(x)}" y="${round(y)}" fill="${color}" font-size="${size}" font-weight="${weight}" text-anchor="middle" dominant-baseline="central">${text}</text>`;
}

function card(logos, width, compact) {
  const tableWidth = compact ? 324 : 704;
  const tableX = (width - tableWidth) / 2;
  const tableY = compact ? 135 : 176;
  const heading = compact ? 23 : 34;
  const row = compact ? 52 : 49;
  const column = tableWidth / 4;
  const headings = [['MERN Stack', 'Languages'], ['Backend', 'Databases &amp; Caching'], ['Infrastructure', 'Version Control']];
  const cells = [
    [[0, 0, 'mongodb'], [1, 0, 'express'], [0, 1, 'react'], [1, 1, 'nodejs'], [2, .5, 'python'], [3, .5, 'javascript']],
    [[0, 0, 'fastapi'], [1, 0, 'celery'], [2, 0, 'mysql'], [3, 0, 'redis']],
    [[0, 0, 'aws'], [1, 0, 'docker'], [.5, 1, 'linux'], [2.5, .5, 'git']],
  ];
  const tableHeight = heading * 3 + row * 5;
  const line = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#414141" stroke-width=".8"/>`;
  const categories = headings.map(([left, right], group) => {
    const y = heading * group + row * [0, 2, 3][group];
    const bodyY = y + heading;
    const bottom = bodyY + row * (group === 1 ? 1 : 2);
    const headingSize = compact ? 11.5 : 17;
    const categoryLabels = label(left, column, y + heading / 2, headingSize, 650)
      + label(right, column * 3, y + heading / 2, headingSize, 650);
    const icons = cells[group].map(([col, entry, name]) => {
      const x = (col + .5) * column;
      const cy = bodyY + (entry + .5) * row;
      const size = compact ? 23 : 32;
      if (compact) return logo(logos, name, x - size / 2, cy - 20, size) + label(technologies[name], x, cy + 14, 11.6);
      const text = technologies[name];
      const labelWidth = text.length * 7.6;
      const left = x - (size + 9 + labelWidth) / 2;
      return logo(logos, name, left, cy - size / 2, size) + label(text, left + size + 9 + labelWidth / 2, cy, 15.6);
    }).join('\n');
    const lines = [line(0, bodyY, tableWidth, bodyY), line(column, bodyY, column, group === 2 ? bodyY + row : bottom)];
    if (group !== 2) lines.push(line(column * 3, bodyY, column * 3, bottom));
    if (group !== 1) lines.push(line(0, bodyY + row, column * 2, bodyY + row));
    if (group < 2) lines.push(line(0, bottom, tableWidth, bottom));
    return `<rect y="${y}" width="${tableWidth}" height="${heading}" fill="#222222"/>${categoryLabels}${lines.join('')}${icons}`;
  }).join('\n');

  return `<g transform="translate(${tableX} ${tableY})">
    <clipPath id="stack-clip"><rect width="${tableWidth}" height="${tableHeight}" rx="11"/></clipPath>
    <g clip-path="url(#stack-clip)"><rect width="${tableWidth}" height="${tableHeight}" fill="#101010" fill-opacity=".96"/>
      ${categories}${line(column * 2, 0, column * 2, tableHeight)}
    </g><rect width="${tableWidth}" height="${tableHeight}" rx="11" stroke="#777777" stroke-width="1" fill="none"/>
  </g>`;
}

function renderScene(logos, compact) {
  const width = compact ? 360 : 1080;
  const height = compact ? 580 : 704;
  const bodies = [
    { art: dottedOrbit(61, .36, -15, 105) + sphere(39, 89), desktop: [102, 145, 1.07], mobile: [42, 89, .62], period: 34, tilt: -9 },
    { art: sunlight(27) + sphere(27, 55, true), desktop: [926, 128, 1.12], mobile: [306, 85, .59], period: 28, turnBy: 36 },
    { art: galaxy(), desktop: [732, 85, .85], mobile: [257, 106, .48], period: 42, tilt: -19, turnBy: 28 },
    { art: whale(), desktop: [98, 355, 1], mobile: [62, 526, .61], period: 26, tilt: -20 },
    { art: squid(), desktop: [978, 288, .94], mobile: [285, 521, .47], period: 21, tilt: 27 },
    { art: jellyfish(), desktop: [947, 471, 1.03], mobile: [324, 529, .55], period: 29, tilt: -19 },
    { art: dottedOrbit(83, .36, -15, 135, .41) + sphere(54, 77), desktop: [570, 603, 1.06], mobile: [181, 527, .64], period: 40, tilt: -12 },
    { art: sphere(13, 3), desktop: [348, 598, 1], mobile: [103, 97, .65], period: 19, turnBy: 38 },
    { art: sphere(10, 51), desktop: [747, 590, 1.25], mobile: [232, 550, .75], period: 24, turnBy: 28 },
    { art: pizza(), desktop: [382, 84, 1.36], mobile: [148, 55, .62], period: 23, tilt: -20, turnBy: 31 },
    { art: coffeeMug(), desktop: [127, 553, 1.28], mobile: [39, 488, .54], period: 31, tilt: 13, turnBy: 16 },
  ];
  const sky = bodies.map((body, index) => {
    const [x, y, scale] = compact ? body.mobile : body.desktop;
    return driftingObject(body.art, { ...body, x, y, scale, phase: index * 2.4, distance: compact ? 9 : 13 + index % 4 * 3 });
  }).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="scene-title scene-description" font-family="system-ui,Segoe UI,Arial,sans-serif">
  <title id="scene-title">Tech Stack in a white-dot space scene</title>
  <desc id="scene-description">A sun, ringed planets, a galaxy, a blue whale, a squid, a jellyfish, a pizza slice, and a coffee mug drift and rotate around the Tech Stack. MERN Stack: MongoDB, Express.js, React, Node.js. Languages: Python and JavaScript. Backend: FastAPI and Celery. Databases and Caching: MySQL and Redis. Infrastructure: AWS, Docker, and Linux. Version Control: Git.</desc>
  <clipPath id="space-clip"><rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="14"/></clipPath>
  <g clip-path="url(#space-clip)">
    <rect width="${width}" height="${height}" fill="#0c0c0c"/>
    <g fill="#ffffff">${starField(width, height, compact)}${sky}</g>
    ${label('Tech Stack', width / 2, compact ? 113 : 144, compact ? 21 : 29, 700)}
    ${card(logos, width, compact)}
  </g>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="14" fill="none" stroke="#545454" stroke-width="1"/>
</svg>\n`;
}

export async function spaceScenes() {
  const logos = await loadLogos();
  return [
    ['space-scene.svg', renderScene(logos, false)],
    ['space-scene-mobile.svg', renderScene(logos, true)],
  ];
}
