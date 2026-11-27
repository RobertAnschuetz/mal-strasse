// Hintergründe für "Was passt nicht?" (SVG 1000×600, füllt den Bildschirm).
// Hell und ruhig gehalten: Die Dinge liegen auf weißen Stickern und sollen gut zu erkennen sein.
// Kräftige Details nur an den Rändern, die Mitte bleibt weich.

const W = 1000, H = 600;
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${body}</svg>`;
const range = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');

const grad = (id, stops, vertical = true) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const bg = (id, stops) => `<defs>${grad(id, stops)}</defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
const sun = (x, y, r, c = '#ffd54f') =>
  `<circle cx="${x}" cy="${y}" r="${r * 1.9}" fill="${c}" opacity="0.18"/><circle cx="${x}" cy="${y}" r="${r * 1.4}" fill="${c}" opacity="0.3"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const cloud = (x, y, s = 1, o = 0.95) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity="${o}"><ellipse cx="0" cy="10" rx="70" ry="26"/><circle cx="-25" cy="0" r="28"/><circle cx="15" cy="-14" r="36"/><circle cx="48" cy="2" r="24"/></g>`;
const hill = (y, amp, color, phase = 0) =>
  `<path d="M 0 ${y} C ${200 + phase} ${y - amp} ${350 + phase} ${y - amp} ${500} ${y} S ${800 - phase} ${y + amp * 0.6} ${W} ${y - amp * 0.3} L ${W} ${H} L 0 ${H} Z" fill="${color}"/>`;
// weicher heller Schleier in der Mitte, damit die Sticker ruhig liegen
const veil = (o = 0.28) =>
  `<defs><radialGradient id="veil" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stop-color="#fff" stop-opacity="${o}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#veil)"/>`;

const palm = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M 0 0 C 8 -60 4 -120 18 -180" stroke="#9c6b3f" stroke-width="16" fill="none" stroke-linecap="round"/>` +
  [[-80, -150], [-70, -205], [10, -235], [90, -200], [100, -150]].map(([dx, dy]) =>
    `<path d="M 18 -180 Q ${(18 + dx) / 2} ${dy - 30} ${dx} ${dy}" stroke="#43a047" stroke-width="20" fill="none" stroke-linecap="round"/>`).join('') + '</g>';
const leaf = (x, y, r, s, c) =>
  `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M 0 0 C 40 -30 120 -30 160 0 C 120 30 40 30 0 0 Z" fill="${c}"/><path d="M 5 0 L 150 0" stroke="#1b5e20" stroke-width="3" opacity="0.35"/></g>`;
const fern = (x, y, s, c) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}">${range(5, (i) => `<path d="M 0 0 Q ${-60 + i * 30} -90 ${-80 + i * 40} -150 Q ${-40 + i * 20} -80 0 0 Z"/>`)}</g>`;
const coral = (x, y, c, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})" stroke="${c}" stroke-width="11" stroke-linecap="round" fill="none">` +
  `<path d="M 0 0 L 0 -45 M 0 -25 L -28 -55 L -34 -80 M -28 -55 L -10 -78 M 0 -35 L 26 -62 L 22 -90 M 26 -62 L 44 -80"/></g>`;
const bubbles = (n) => range(n, (i) => `<circle cx="${(i * 151 + 40) % W}" cy="${(i * 97 + 30) % 470}" r="${5 + (i % 4) * 3}" fill="#fff" fill-opacity="0.15" stroke="#fff" stroke-opacity="0.6" stroke-width="2"/>`);
const window_ = (x, y, w, h) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#e3f4ff" stroke="#fff" stroke-width="8"/><path d="M ${x + w / 2} ${y} L ${x + w / 2} ${y + h} M ${x} ${y + h / 2} L ${x + w} ${y + h / 2}" stroke="#fff" stroke-width="6"/>`;

const BACKGROUNDS = {
  dschungel: () => bg('jg', [[0, '#c8ecc0'], [0.55, '#9ed79a'], [1, '#5fae62']]) +
    sun(860, 90, 40, '#fff59d') +
    hill(330, 60, '#86c97f', 40) + hill(420, 50, '#6dba6a', -60) +
    leaf(-30, 60, 20, 1.6, '#4caf50') + leaf(-20, 160, -10, 1.3, '#388e3c') + leaf(1030, 70, 160, 1.6, '#4caf50') + leaf(1030, 180, 195, 1.3, '#388e3c') +
    range(5, (i) => `<path d="M ${150 + i * 180} 0 Q ${180 + i * 180} 70 ${160 + i * 180} 120" stroke="#6d8f3a" stroke-width="5" fill="none" opacity="0.6"/>`) +
    palm(70, 600, 1.1) + palm(940, 610, 1.2) +
    fern(220, 610, 1.1, '#2e7d32') + fern(800, 610, 1, '#2e7d32') + fern(500, 620, 0.8, '#388e3c') +
    veil(0.3),
  aegypten: () => bg('eg', [[0, '#8fd3fb'], [0.6, '#ffe9b5'], [1, '#ffe0a0']]) +
    sun(150, 100, 48, '#ffca28') + cloud(780, 90, 0.8, 0.8) +
    `<path d="M 520 400 L 700 170 L 880 400 Z" fill="#f4cf7a"/><path d="M 700 170 L 880 400 L 760 400 Z" fill="#d9a94e"/>` +
    `<path d="M 780 400 L 900 250 L 1020 400 Z" fill="#f4cf7a"/><path d="M 900 250 L 1020 400 L 940 400 Z" fill="#d9a94e"/>` +
    `<path d="M -40 400 L 80 260 L 200 400 Z" fill="#f4cf7a"/><path d="M 80 260 L 200 400 L 120 400 Z" fill="#d9a94e"/>` +
    hill(400, 25, '#f8dc96', 0) + hill(470, 20, '#f3cf7f', 80) +
    `<path d="M 0 540 Q 250 515 500 540 T 1000 532 L 1000 600 L 0 600 Z" fill="#64b5f6"/><path d="M 0 548 Q 250 524 500 548 T 1000 540" stroke="#bbdefb" stroke-width="4" fill="none"/>` +
    palm(40, 560, 0.8) + palm(960, 560, 0.75) +
    veil(0.25),
  weltall: () => `<defs><radialGradient id="space" cx="0.5" cy="0.45" r="0.8"><stop offset="0" stop-color="#5a5fb0"/><stop offset="0.6" stop-color="#34397f"/><stop offset="1" stop-color="#1d2157"/></radialGradient></defs>` +
    `<rect width="${W}" height="${H}" fill="url(#space)"/>` +
    range(60, (i) => `<circle cx="${(i * 137) % W}" cy="${(i * 89) % H}" r="${1.5 + (i % 3)}" fill="#fff" opacity="${0.4 + (i % 5) / 10}"/>`) +
    `<circle cx="110" cy="110" r="60" fill="#ff8a80"/><circle cx="92" cy="95" r="12" fill="#ff5252" opacity="0.5"/><ellipse cx="110" cy="110" rx="100" ry="20" fill="none" stroke="#ffe082" stroke-width="8"/>` +
    `<circle cx="900" cy="530" r="110" fill="#64b5f6"/><path d="M 830 480 q 40 -30 80 0 q 25 40 -15 70 q -55 15 -65 -70 Z M 930 580 q 30 -20 50 10 l -10 40 q -30 0 -40 -50 Z" fill="#81c784"/>` +
    `<circle cx="880" cy="110" r="34" fill="#fff9c4"/><circle cx="870" cy="100" r="7" fill="#e6dfa0"/><circle cx="892" cy="122" r="5" fill="#e6dfa0"/>` +
    veil(0.12),
  unterwasser: () => bg('sea', [[0, '#9be7ff'], [0.5, '#4fc3f7'], [1, '#0288d1']]) +
    range(5, (i) => `<path d="M ${i * 220 + 30} 0 L ${i * 220 + 100} 0 L ${i * 220 + 180} 600 L ${i * 220 + 120} 600 Z" fill="#fff" opacity="0.1"/>`) +
    `<path d="M 0 530 Q 250 500 500 525 T 1000 515 L 1000 600 L 0 600 Z" fill="#ffe0a3"/>` +
    range(4, (i) => `<path d="M ${[40, 230, 760, 950][i]} 560 q -30 -60 0 -120 q 30 -60 0 -120" stroke="#43a047" stroke-width="14" fill="none" stroke-linecap="round"/>`) +
    coral(140, 560, '#ff8a65') + coral(860, 560, '#f48fb1', 0.9) +
    `<path d="M 480 575 l 18 -20 l 18 20 l -8 -2 l -10 10 l -10 -10 Z" fill="#ffb74d"/>` +
    bubbles(16) + veil(0.22),
  bahnhof: () => bg('st', [[0, '#bfe3fb'], [1, '#eef8ff']]) + cloud(820, 80, 0.8) + cloud(160, 60, 0.6) +
    `<path d="M 0 150 L 500 40 L 1000 150 L 1000 175 L 500 65 L 0 175 Z" fill="#90a4ae"/>` +
    range(5, (i) => `<rect x="${i * 230 + 30}" y="${150 - Math.abs(2 - i) * 20}" width="16" height="${300 + Math.abs(2 - i) * 20}" fill="#b0bec5"/>`) +
    `<circle cx="500" cy="130" r="38" fill="#fff" stroke="#546e7a" stroke-width="6"/><path d="M 500 130 L 500 106 M 500 130 L 518 138" stroke="#37474f" stroke-width="5" stroke-linecap="round"/>` +
    `<rect y="455" width="${W}" height="40" fill="#cfd8dc"/><rect y="490" width="${W}" height="8" fill="#ffd54f"/>` +
    `<rect y="498" width="${W}" height="102" fill="#a1a1a1"/>` + range(20, (i) => `<rect x="${i * 52}" y="520" width="28" height="80" rx="3" fill="#8d6e63"/>`) +
    `<rect y="535" width="${W}" height="8" fill="#eceff1"/><rect y="575" width="${W}" height="8" fill="#eceff1"/>` +
    veil(0.2),
  flughafen: () => bg('ap', [[0, '#8fd3fb'], [1, '#e8f7ff']]) + sun(120, 90, 40) + cloud(480, 80, 0.9) + cloud(820, 130, 0.7) +
    `<rect x="760" y="250" width="260" height="170" rx="10" fill="#eceff1"/>` + range(5, (i) => `<rect x="${775 + i * 46}" y="275" width="34" height="70" rx="6" fill="#90caf9"/>`) +
    `<rect x="40" y="200" width="36" height="220" fill="#cfd8dc"/><rect x="18" y="170" width="80" height="44" rx="12" fill="#4fc3f7" stroke="#eceff1" stroke-width="6"/>` +
    hill(420, 15, '#a5d6a7', 0) +
    `<rect y="480" width="${W}" height="120" fill="#78909c"/>` + range(9, (i) => `<rect x="${i * 115 + 20}" y="535" width="65" height="10" rx="5" fill="#fff"/>`) +
    veil(0.22),
  kindergarten: () => bg('kg', [[0, '#fff6d5'], [1, '#ffeeb8']]) +
    range(10, (i) => `<rect x="${i * 100}" y="0" width="50" height="440" fill="#fff" opacity="0.35"/>`) +
    window_(50, 50, 200, 150) + window_(750, 50, 200, 150) +
    `<g>${range(7, (i) => `<path d="M ${330 + i * 50} 40 L ${355 + i * 50} 80 L ${380 + i * 50} 40 Z" fill="${['#ef5350', '#ffca28', '#66bb6a', '#42a5f5', '#ab47bc', '#ff7043', '#26c6da'][i]}"/>`)}<path d="M 320 38 Q 500 60 690 38" stroke="#8d6e63" stroke-width="3" fill="none"/></g>` +
    `<rect y="440" width="${W}" height="160" fill="#d7b48a"/>` + range(11, (i) => `<rect x="${i * 95}" y="440" width="5" height="160" fill="#c49a6c"/>`) +
    `<ellipse cx="500" cy="530" rx="300" ry="50" fill="#90caf9" opacity="0.7"/>` +
    veil(0.2),
  spielplatz: () => bg('pg', [[0, '#8fd3fb'], [1, '#dff4ff']]) + sun(880, 90, 42) + cloud(170, 80, 0.8) + cloud(540, 60, 0.7) +
    hill(400, 30, '#a5d6a7', 30) + hill(450, 25, '#8bcf7f', -40) +
    `<path d="M 30 470 L 80 300 L 130 470 M 230 470 L 180 300 L 130 470 M 80 300 L 180 300" stroke="#ef5350" stroke-width="12" fill="none" stroke-linecap="round"/>` +
    `<path d="M 110 300 L 110 400 M 150 300 L 150 400" stroke="#795548" stroke-width="3"/><rect x="100" y="398" width="60" height="10" rx="4" fill="#ffca28"/>` +
    `<path d="M 840 470 L 840 330 M 840 330 L 890 330 L 990 470" stroke="#42a5f5" stroke-width="14" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="500" cy="560" rx="220" ry="34" fill="#ffe0a3"/>` +
    veil(0.22),
};

export function worldSvg(id) {
  const make = BACKGROUNDS[id];
  if (!make) throw new Error(`Kein Hintergrund für ${id}`);
  return svg(make());
}
