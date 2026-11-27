const width = 1200;
const height = 254;
const turn = Math.PI * 2;
const loopTime = 18;
const format = value => value.toFixed(1);

function randomFrom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

function breathe(attribute, values, duration, begin = '0s') {
  return `<animate attributeName="${attribute}" values="${values}" dur="${duration}s" begin="${begin}" repeatCount="indefinite"/>`;
}

const definitions = `<defs>
    <radialGradient id="space" cx="51%" cy="47%" r="71%">
      <stop stop-color="#101c3b"/><stop offset=".62" stop-color="#080f24"/><stop offset="1" stop-color="#040914"/>
    </radialGradient>
    <linearGradient id="fade" x2="0" y2="1">
      <stop stop-color="#fff" stop-opacity="0"/><stop offset=".12" stop-color="#fff"/>
      <stop offset=".87" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="frame" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="254" style="mask-type:alpha">
      <rect width="1200" height="254" fill="url(#fade)"/>
    </mask>
    <radialGradient id="blue-dust"><stop stop-color="#2c9bff" stop-opacity=".28"/><stop offset="1" stop-color="#2c9bff" stop-opacity="0"/></radialGradient>
    <radialGradient id="violet-dust"><stop stop-color="#aa6cfe" stop-opacity=".24"/><stop offset="1" stop-color="#aa6cfe" stop-opacity="0"/></radialGradient>
    <radialGradient id="rose-dust"><stop stop-color="#f281bc" stop-opacity=".19"/><stop offset="1" stop-color="#f281bc" stop-opacity="0"/></radialGradient>
    <radialGradient id="amber-dust"><stop stop-color="#ffae6d" stop-opacity=".17"/><stop offset="1" stop-color="#ffae6d" stop-opacity="0"/></radialGradient>
    <linearGradient id="ribbon-a" gradientUnits="userSpaceOnUse" x2="1200" y2="0">
      <stop stop-color="#1b65c8"/><stop offset=".16" stop-color="#49dff2"/><stop offset=".34" stop-color="#8488fc"/>
      <stop offset=".59" stop-color="#aa8bff"/><stop offset=".76" stop-color="#ff9bc7"/><stop offset=".89" stop-color="#fbc08d"/><stop offset="1" stop-color="#8e74ed"/>
    </linearGradient>
    <linearGradient id="ribbon-b" gradientUnits="userSpaceOnUse" x2="1200" y2="0">
      <stop stop-color="#5555c4"/><stop offset=".27" stop-color="#5a89ff"/><stop offset=".53" stop-color="#c578ef"/>
      <stop offset=".68" stop-color="#79d0ff"/><stop offset=".85" stop-color="#3ae3cf"/><stop offset="1" stop-color="#2c739c"/>
    </linearGradient>
    <radialGradient id="world" cx="32%" cy="17%" r="84%">
      <stop stop-color="#6fcfea"/><stop offset=".2" stop-color="#396eaa"/>
      <stop offset=".43" stop-color="#203c73"/><stop offset=".72" stop-color="#111a42"/><stop offset="1" stop-color="#080e26"/>
    </radialGradient>
    <radialGradient id="world-light" cx="35%" cy="7%" r="87%">
      <stop stop-color="#d1ebff" stop-opacity=".62"/><stop offset=".32" stop-color="#93baff" stop-opacity=".27"/>
      <stop offset=".7" stop-color="#597cdb" stop-opacity="0"/><stop offset="1" stop-color="#080d24" stop-opacity=".64"/>
    </radialGradient>
    <linearGradient id="rim" x1="0" y1="0" x2=".7" y2="1">
      <stop stop-color="#c9f8ff"/><stop offset=".25" stop-color="#78b7fc" stop-opacity=".75"/>
      <stop offset=".66" stop-color="#7b77ff" stop-opacity=".17"/><stop offset="1" stop-color="#7b77ff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="copper" cx="29%" cy="22%" r="79%"><stop stop-color="#ffebbc"/><stop offset=".27" stop-color="#d98a75"/><stop offset=".69" stop-color="#642a53"/><stop offset="1" stop-color="#15152b"/></radialGradient>
    <radialGradient id="lilac" cx="27%" cy="24%" r="78%"><stop stop-color="#ebecff"/><stop offset=".36" stop-color="#8778c7"/><stop offset=".75" stop-color="#393468"/><stop offset="1" stop-color="#15172e"/></radialGradient>
    <radialGradient id="sea-blue" cx="54%" cy="18%" r="87%"><stop stop-color="#9de8fd" stop-opacity=".62"/><stop offset=".45" stop-color="#397dad" stop-opacity=".5"/><stop offset="1" stop-color="#182944" stop-opacity=".31"/></radialGradient>
    <radialGradient id="sea-rose" cx="32%" cy="18%" r="85%"><stop stop-color="#ffc6e6" stop-opacity=".62"/><stop offset=".5" stop-color="#a260b3" stop-opacity=".52"/><stop offset="1" stop-color="#4c2b81" stop-opacity=".28"/></radialGradient>
    <radialGradient id="sea-mint" cx="45%" cy="20%" r="82%"><stop stop-color="#c1fbe6" stop-opacity=".64"/><stop offset=".5" stop-color="#55beba" stop-opacity=".36"/><stop offset="1" stop-color="#315984" stop-opacity=".33"/></radialGradient>
    <clipPath id="planet-disc"><circle cx="600" cy="112" r="63"/></clipPath>
    <filter id="clouds" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".021 .085" numOctaves="4" seed="27"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .57  0 0 0 0 .77  0 0 0 0 .97  1.4 0 0 0 -.59"/>
    </filter>
    <filter id="crest-glow" filterUnits="userSpaceOnUse" x="-8" y="0" width="1216" height="254">
      <feMorphology operator="dilate" radius=".8"/><feGaussianBlur stdDeviation="1.6" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="spark"><stop stop-color="#e9f5ff" stop-opacity=".7"/><stop offset=".23" stop-color="#a0caff" stop-opacity=".38"/><stop offset="1" stop-color="#7198ff" stop-opacity="0"/></radialGradient>
    <g id="flare"><circle r="10" fill="url(#spark)"/><path d="M-6 0H6M0-7V7" stroke="#b5d0ff" stroke-width=".55" opacity=".7"/><circle r="1.45" fill="#f2f7ff"/></g>
  </defs>`;

function stars() {
  const random = randomFrom(2027);
  const colors = ['#d3ebff', '#8cbdff', '#d5b7ff', '#ffe0ba', '#b2f1f0'];
  const specks = Array.from({ length: 325 }, (_, index) => {
    const x = random() * width;
    const y = 8 + random() * (height - 16);
    const opacity = 0.15 + random() * 0.65;
    const radius = 0.34 + random() ** 3 * 1.19;
    const color = colors[Math.floor(random() * colors.length)];
    const twinkle = index % 12 === 0 ? breathe('opacity', `${format(opacity)};0.15;${format(opacity)}`, loopTime / 3, `${format(-random() * 6)}s`) : '';
    return `<circle cx="${format(x)}" cy="${format(y)}" r="${format(radius)}" fill="${color}" opacity="${format(opacity)}">${twinkle}</circle>`;
  }).join('\n');
  const flares = [[88, 116, 1.2], [235, 39, .9], [449, 84, .8], [779, 51, 1.25], [936, 157, 1], [1103, 45, .9], [1046, 213, .65]];
  return `${specks}\n${flares.map(([x, y, size], index) => `<g transform="translate(${x} ${y}) scale(${size})"><use href="#flare">${breathe('opacity', '.8;.34;.8', loopTime / 2, `${-index}s`)}</use></g>`).join('\n')}`;
}

function constellation(points, color) {
  const line = points.map(([x, y]) => `${x},${y}`).join(' ');
  return `<g stroke="${color}" fill="${color}"><polyline points="${line}" fill="none" stroke-width=".65" opacity=".32"/>${points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" stroke="none" opacity=".84"/>`).join('')}</g>`;
}

function ribbonPath(position) {
  const segments = 14;
  const step = (width + 60) / segments;
  let path = `M-30 ${format(position(-30))}`;
  for (let segment = 0; segment < segments; segment++) {
    const start = -30 + segment * step;
    const end = start + step;
    const slope = x => (position(x + 0.5) - position(x - 0.5));
    path += `C${format(start + step / 3)} ${format(position(start) + step * slope(start) / 3)} ${format(end - step / 3)} ${format(position(end) - step * slope(end) / 3)} ${format(end)} ${format(position(end))}`;
  }
  return path;
}

function ribbon(field, color, rows) {
  const frames = 24;
  return Array.from({ length: rows }, (_, row) => {
    const depth = row / (rows - 1);
    const paths = Array.from({ length: frames }, (_, frame) => ribbonPath(x => field(x / width, depth, turn * frame / frames)));
    const crest = row === 0 || row === rows - 1;
    const animatedPath = breathe('d', [...paths, paths[0]].join(';'), loopTime);
    const dots = crest ? '.1 3.8' : '.1 5.2';
    const glow = crest ? ' filter="url(#crest-glow)"' : '';
    const style = `stroke="url(#${color})" stroke-width="${crest ? 1.5 : 1.1}" opacity="${crest ? .89 : .48}"${glow}`;
    return `<path d="${paths[0]}" fill="none" ${style} stroke-linecap="round" stroke-dasharray="${dots}">${animatedPath}<animate attributeName="stroke-dashoffset" from="0" to="${crest ? -15.6 : -21.2}" dur="${loopTime}s" repeatCount="indefinite"/></path>`;
  }).join('\n');
}

function orbit(radiusX, radiusY, rotation, color, moonRadius, moonFill, startingPhase) {
  const left = -radiusX;
  const right = radiusX;
  const upper = `M${left} 0A${radiusX} ${radiusY} 0 1 1 ${right} 0`;
  const lower = `M${right} 0A${radiusX} ${radiusY} 0 1 1 ${left} 0`;
  const track = `fill="none" stroke="${color}" stroke-width=".85" stroke-dasharray=".65 4.4" stroke-linecap="round"`;
  const group = `transform="translate(600 116) rotate(${rotation})"`;
  return {
    back: `<path ${group} d="${upper}" ${track} opacity=".55"/>`,
    front: `<path ${group} d="${lower}" ${track} opacity=".79"/>
      <g ${group}><g><circle r="${moonRadius * 2.1}" fill="url(#spark)" opacity=".62"/><circle r="${moonRadius}" fill="url(#${moonFill})"/><animateMotion path="${upper}${lower.slice(`M${right} 0`.length)}" dur="${loopTime}s" begin="${startingPhase}s" repeatCount="indefinite"/></g></g>`,
  };
}

function drift(x, y, angle, movement, artwork) {
  return `<g transform="translate(${x} ${y}) rotate(${angle})"><g>${artwork}
    <animateTransform attributeName="transform" type="translate" values="${movement}" calcMode="spline" keyTimes="0;.25;.5;.75;1" keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1" dur="${loopTime}s" repeatCount="indefinite"/>
  </g></g>`;
}

function seaCreatures() {
  const whale = drift(306, 100, -12, '-7 1;2 -5;11 0;1 5;-7 1', `
    <path d="M0 15C3 4 17-1 32 0c19 1 37 10 52 8C92 7 96 1 102-4c1 6-2 12-6 14 5 1 12 3 16 7-8 2-14 0-20-3-14 6-39 10-59 10C16 24 3 21 0 15Z" fill="url(#sea-blue)" stroke="#8cccf2" stroke-width=".85" opacity=".90"/>
    <path d="M9 17c24 5 51 2 74-5M13 20c19 4 47 1 65-4M27 4c14-2 28 1 41 5" fill="none" stroke="#a4deff" stroke-width=".6" opacity=".48"/>
    <path d="M41 17c4 8 13 13 20 12-2-4-7-9-11-12" fill="url(#sea-blue)" stroke="#83bcef" stroke-width=".8"/>
    <circle cx="16" cy="12" r=".95" fill="#c9f5ff"/>
    <path d="M28-1q-2-5-7-7m7 7q4-5 8-6" fill="none" stroke="#bae7ff" stroke-width=".6" opacity=".52"/>`);
  const squid = drift(862, 92, 27, '1 1;-5 -8;1 -11;8 -4;1 1', `
    <path d="M0-23C-12-11-14 0-7 9c3 3 10 3 14 0C14 0 12-11 0-23Z" fill="url(#sea-rose)" stroke="#d2a0ea" stroke-width=".9"/>
    <path d="M-9-10q-9 4-10 15 7-1 11-3M9-10q9 4 10 15-7-1-11-3" fill="url(#sea-rose)" stroke="#d2a0ea" stroke-width=".75"/>
    <path d="M-6 9q-8 9-2 17t-5 15M-2 11q-5 9 0 15t-2 9M2 11q8 7 3 14t4 12M6 9q11 9 7 15t6 14" fill="none" stroke="#dfabed" stroke-width=".85" opacity=".74"/>
    <path d="M0-17q3 8 2 14" fill="none" stroke="#ffe1fc" stroke-width=".65" opacity=".57"/><circle cx="-3.5" cy="6" r=".8" fill="#ffe1fc"/><circle cx="3.5" cy="6" r=".8" fill="#ffe1fc"/>`);
  const jellyfish = drift(1011, 115, -13, '4 6;-5 0;-2 -10;7 -4;4 6', `
    <path d="M-18 3C-16-20 16-20 18 3q-4 4-8 1-5 5-10 0-5 5-10 0-4 3-8-1Z" fill="url(#sea-mint)" stroke="#9eeada" stroke-width=".9"/>
    <path d="M-12 1q2-11 10-13m4 0q8 3 10 13M-12 5q-5 9 1 18t-2 13M-7 6q4 9-1 14t2 14M0 6q3 8 0 14t3 19M7 6q5 9 0 17t5 11M13 5q-1 10 5 14t1 13" fill="none" stroke="#aaf4e0" stroke-width=".75" opacity=".67"/>
    <path d="M-16 2Q0-5 16 2" fill="none" stroke="#c4fcf0" stroke-width=".6" opacity=".54"/>`);
  return `${whale}\n${squid}\n${jellyfish}`;
}

export function astronomyWave() {
  // Both ribbons enter high at the outside edges and fall into the open space
  // below the table. They travel across the foreground independently.
  const rearField = (u, depth, phase) => 122 + 33 * Math.sin(Math.PI * u)
    + 26 * Math.sin(turn * (1.22 * u + .18 * depth) - phase)
    + (depth - .5) * (18 + 20 * Math.cos(turn * u - phase));
  const frontField = (u, depth, phase) => 133 + 58 * Math.sin(Math.PI * u)
    + 20 * Math.sin(turn * (1.66 * u - .14 * depth) + phase)
    + 9 * Math.sin(turn * (.85 * u + .44 * depth) - phase)
    + (depth - .5) * (24 + 12 * Math.sin(turn * u + phase));
  const orbits = [orbit(187, 34, -11, '#b4ccff', 4.2, 'lilac', -5), orbit(252, 56, -11, '#efb9db', 5.4, 'copper', -11), orbit(121, 27, -11, '#a3d8f0', 3.1, 'lilac', -2)];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="title description">
  <title id="title">Celestial tides</title>
  <desc id="description">Coloured particle ribbons pass a blue planet and orbiting moons. A whale, squid, and jellyfish drift through the stars.</desc>
  ${definitions}
  <g mask="url(#frame)">
    <rect width="1200" height="254" fill="url(#space)"/>
    <ellipse cx="187" cy="105" rx="280" ry="107" fill="url(#blue-dust)" transform="rotate(11 187 105)"/>
    <ellipse cx="513" cy="118" rx="320" ry="88" fill="url(#violet-dust)" transform="rotate(-13 513 118)"/>
    <ellipse cx="810" cy="128" rx="268" ry="84" fill="url(#rose-dust)" transform="rotate(10 810 128)"/>
    <ellipse cx="1092" cy="166" rx="226" ry="97" fill="url(#amber-dust)" transform="rotate(-17 1092 166)"/>
    ${stars()}
    ${constellation([[104, 68], [136, 79], [166, 51], [207, 57], [222, 79]], '#8ed7ff')}
    ${constellation([[1007, 52], [1045, 63], [1066, 43], [1103, 45], [1134, 66]], '#e4b9ee')}
    ${ribbon(rearField, 'ribbon-b', 8)}
    <ellipse cx="600" cy="112" rx="129" ry="110" fill="url(#blue-dust)" opacity=".74"/>
    ${orbits.map(orbit => orbit.back).join('\n')}
    <circle cx="600" cy="112" r="63" fill="url(#world)"/>
    <g clip-path="url(#planet-disc)">
      <g opacity=".54"><rect x="523" y="43" width="154" height="138" filter="url(#clouds)" transform="rotate(-22 600 112)"/></g>
      <circle cx="600" cy="112" r="63" fill="url(#world-light)"/>
    </g>
    <circle cx="600" cy="112" r="63" fill="none" stroke="url(#rim)" stroke-width="1.3"/>
    ${orbits.map(orbit => orbit.front).join('\n')}
    <circle cx="188" cy="135" r="12" fill="url(#copper)"/>
    <circle cx="940" cy="60" r="10" fill="url(#lilac)"/>
    ${seaCreatures()}
    ${ribbon(frontField, 'ribbon-a', 11)}
  </g>
</svg>\n`;
}
