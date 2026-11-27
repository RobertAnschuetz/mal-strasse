// Bunte Puzzle-Bilder (SVG, 1000×600): Schilder, Autos, Tiere aus dem Motiv-Katalog + gezeichnete Städte.
import { MOTIFS } from './motifs/catalog.js';

const INK = '#26323d';
const W = 1000, H = 600;

// ---------- Bausteine ----------
export const sky = (top = '#7cc8f2', bottom = '#d6f0ff') =>
  `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sky)"/>`;
export const ground = (y, color = '#7ccf6b', dark = '#5fb653') =>
  `<rect y="${y}" width="${W}" height="${H - y}" fill="${color}"/>` +
  Array.from({ length: 14 }, (_, i) => `<path d="M ${i * 75 + 20} ${y + 30 + (i % 3) * 25} q 8 -16 16 0" stroke="${dark}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('');
export const sun = (x = 870, y = 95, r = 55) =>
  `<circle cx="${x}" cy="${y}" r="${r + 22}" fill="#ffd23f" opacity="0.3"/><circle cx="${x}" cy="${y}" r="${r}" fill="#ffd23f"/>`;
export const cloud = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="#ffffff"><circle cx="0" cy="0" r="30"/><circle cx="35" cy="-15" r="38"/><circle cx="75" cy="0" r="30"/><rect x="0" y="0" width="75" height="30"/></g>`;
export const tree = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-10" y="0" width="20" height="60" fill="#8d5a3b"/><circle cx="0" cy="-20" r="45" fill="#3fa34d"/><circle cx="-25" cy="5" r="28" fill="#4fb85c"/><circle cx="25" cy="5" r="28" fill="#4fb85c"/></g>`;
const flower = (x, y, c) =>
  `<g transform="translate(${x} ${y})"><path d="M0 0 L0 30" stroke="#3a8d3f" stroke-width="5"/>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${Math.round(Math.cos(a * Math.PI / 180) * 11)}" cy="${Math.round(Math.sin(a * Math.PI / 180) * 11)}" r="9" fill="${c}"/>`).join('')}<circle r="7" fill="#ffd23f"/></g>`;
const road = (y, h = 110) =>
  `<rect y="${y}" width="${W}" height="${h}" fill="#5b5f66"/>` +
  Array.from({ length: 10 }, (_, i) => `<rect x="${i * 110 + 15}" y="${y + h / 2 - 5}" width="60" height="10" rx="5" fill="#ffffff"/>`).join('');
export const house = (x, y, w, h, wall, roof) =>
  `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${wall}" stroke="${INK}" stroke-width="4"/>` +
  `<path d="M ${x - 10} ${y} L ${x + w / 2} ${y - h * 0.45} L ${x + w + 10} ${y} Z" fill="${roof}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>` +
  Array.from({ length: 2 }, (_, i) => `<rect x="${x + w * 0.15 + i * w * 0.45}" y="${y + h * 0.18}" width="${w * 0.25}" height="${w * 0.25}" fill="#bfe6ff" stroke="${INK}" stroke-width="3"/>`).join('') +
  `<rect x="${x + w * 0.38}" y="${y + h * 0.55}" width="${w * 0.24}" height="${h * 0.45}" fill="#8d5a3b" stroke="${INK}" stroke-width="3"/></g>`;

/** Ein Motiv aus dem Katalog farbig zeichnen. colors: Region-ID (oder Präfix) → Farbe. */
function motif(id, x, y, size, colors, fallback = ['#ef4b4b', '#ffd23f', '#4aa8e0', '#36b37e', '#8e24aa', '#fb8c00']) {
  const m = MOTIFS[id];
  if (!m) throw new Error(`Motiv fehlt: ${id}`);
  const s = size / 200;
  const pick = (rid, k) => colors[rid] ?? colors[Object.keys(colors).find((key) => rid.startsWith(key))] ?? fallback[k % fallback.length];
  const sw = 4 / s;
  const parts = m.regions.map((r, k) => (r.strokeWidth
    ? `<path d="${r.d}" fill="none" stroke="${pick(r.id, k)}" stroke-width="${r.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="${r.d}" fill="${pick(r.id, k)}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`));
  const lines = m.lines.map((l) => `<path d="${l.d}" fill="none" stroke="${INK}" stroke-width="${sw * 0.8}" stroke-linecap="round"/>`);
  return `<g transform="translate(${x} ${y}) scale(${s})">${parts.join('')}${lines.join('')}</g>`;
}
const WHEEL = { 'rad-': '#2b2b2b', felge: '#d9d9d9', fenster: '#bfe6ff' };
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${body}</svg>`;

// ---------- Städte ----------
const brandenburgerTor = (x, y) => `<g transform="translate(${x} ${y})" stroke="${INK}" stroke-width="4">
  <rect x="0" y="60" width="300" height="34" fill="#e9d8a6"/><rect x="-10" y="94" width="320" height="18" fill="#d8c48e"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${8 + i * 52}" y="112" width="24" height="150" fill="#f1e4bd"/>`).join('')}
  <rect x="-15" y="262" width="330" height="20" fill="#d8c48e"/>
  <rect x="110" y="30" width="80" height="30" fill="#e9d8a6"/>
  <path d="M 125 30 Q 140 -5 165 10 L 175 30 Z" fill="#3e8e6b"/></g>`;
const fernsehturm = (x, y) => `<g transform="translate(${x} ${y})" stroke="${INK}" stroke-width="4">
  <rect x="-12" y="120" width="24" height="300" fill="#d9dde3"/><circle cx="0" cy="110" r="42" fill="#c0c7d0"/>
  <rect x="-44" y="104" width="88" height="10" fill="#9aa5ad"/><rect x="-5" y="-10" width="10" height="80" fill="#ef4b4b"/></g>`;
const eiffel = (x, y) => `<g transform="translate(${x} ${y})" stroke="${INK}" stroke-width="5" stroke-linejoin="round">
  <path d="M -150 460 Q -60 300 -30 120 L -12 0 L 12 0 L 30 120 Q 60 300 150 460 L 95 460 Q 40 360 0 360 Q -40 360 -95 460 Z" fill="#b8733c"/>
  <rect x="-80" y="250" width="160" height="22" fill="#9b5e2e"/><rect x="-45" y="130" width="90" height="16" fill="#9b5e2e"/>
  <path d="M -6 0 L 0 -40 L 6 0 Z" fill="#9b5e2e"/>
  <path d="M -55 272 L 55 330 M 55 272 L -55 330 M -30 146 L 30 250 M 30 146 L -30 250" stroke="#7a4722" stroke-width="4"/></g>`;
const bigBen = (x, y) => `<g transform="translate(${x} ${y})" stroke="${INK}" stroke-width="4">
  <rect x="-45" y="110" width="90" height="330" fill="#d9b26b"/><rect x="-55" y="70" width="110" height="60" fill="#c99d50"/>
  <circle cx="0" cy="100" r="38" fill="#fff8e1"/><path d="M 0 100 L 0 72 M 0 100 L 20 110" stroke-width="5"/>
  <path d="M -50 70 L 0 -40 L 50 70 Z" fill="#4a5a6a"/><rect x="-3" y="-75" width="6" height="40" fill="#4a5a6a"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="-30" y="${150 + i * 55}" width="60" height="30" fill="#b48a45"/>`).join('')}</g>`;
const kolosseum = (x, y) => `<g transform="translate(${x} ${y})" stroke="${INK}" stroke-width="4">
  <path d="M 0 300 L 0 70 Q 300 -10 600 70 L 600 300 Z" fill="#e3c08d"/>
  ${[0, 1, 2].map((row) => Array.from({ length: 10 }, (_, i) => `<path d="M ${30 + i * 56} ${280 - row * 72} l 0 -40 a 18 18 0 0 1 36 0 l 0 40 Z" fill="#8b6a43"/>`).join('')).join('')}
  <path d="M 0 85 Q 300 5 600 85" fill="none" stroke-width="6"/></g>`;
const skyline = (y) => {
  const b = [[20, 180, 110, '#5c7aa8'], [140, 260, 90, '#6d8cba'], [240, 140, 120, '#4f6c99'], [370, 330, 80, '#7b97c2'], [460, 220, 130, '#5c7aa8'],
    [600, 300, 90, '#6d8cba'], [700, 190, 120, '#4f6c99'], [830, 250, 140, '#7b97c2']];
  return b.map(([x, h, w, c]) => `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${c}" stroke="${INK}" stroke-width="3"/>` +
    Array.from({ length: Math.floor(h / 40) }, (_, r) => Array.from({ length: Math.floor(w / 30) }, (_, k) =>
      `<rect x="${x + 8 + k * 30}" y="${y - h + 12 + r * 40}" width="14" height="20" fill="#ffe28a"/>`).join('')).join('')).join('');
};
const freiheitsstatue = (x, y) => `<g transform="translate(${x} ${y})" stroke="${INK}" stroke-width="4" stroke-linejoin="round">
  <rect x="-60" y="300" width="120" height="120" fill="#b9a68a"/><path d="M -40 300 L -25 120 L 25 120 L 40 300 Z" fill="#6fb7a2"/>
  <circle cx="0" cy="95" r="28" fill="#6fb7a2"/><path d="M -28 80 L -40 50 M -14 70 L -18 38 M 0 67 L 0 32 M 14 70 L 18 38 M 28 80 L 40 50" stroke="#4f9883" stroke-width="7" stroke-linecap="round"/>
  <path d="M 20 130 L 55 20" stroke="#6fb7a2" stroke-width="18" stroke-linecap="round"/><path d="M 45 20 Q 55 -20 70 20 Z" fill="#ffb703"/></g>`;
const dom = (x, y) => `<g transform="translate(${x} ${y})" stroke="${INK}" stroke-width="4" stroke-linejoin="round">
  <rect x="0" y="180" width="380" height="250" fill="#6b6f78"/>
  ${[0, 260].map((tx) => `<rect x="${tx}" y="60" width="120" height="370" fill="#5b5f68"/><path d="M ${tx} 60 L ${tx + 60} -150 L ${tx + 120} 60 Z" fill="#4c5059"/>
    ${[0, 1, 2].map((r) => `<path d="M ${tx + 35} ${330 - r * 90} l 0 -45 a 25 25 0 0 1 50 0 l 0 45 Z" fill="#3c3f47"/>`).join('')}`).join('')}
  <circle cx="190" cy="270" r="45" fill="#9bc3e6"/><path d="M 150 430 l 0 -70 a 40 40 0 0 1 80 0 l 0 70 Z" fill="#3c3f47"/></g>`;
export const water = (y, c = '#4aa8e0') => `<rect y="${y}" width="${W}" height="${H - y}" fill="${c}"/>` +
  Array.from({ length: 8 }, (_, i) => `<path d="M ${i * 130 + 10} ${y + 30 + (i % 2) * 30} q 20 -14 40 0 t 40 0" stroke="#bfe6ff" stroke-width="5" fill="none"/>`).join('');

// ---------- Szenen ----------
const SCENES = {
  stoppschild: () => sky() + sun() + cloud(120, 90) + ground(400) + road(470) + tree(130, 330) + tree(860, 340, 0.9) +
    motif('stoppschild', 300, 20, 420, { schild: '#e53935', pfosten: '#9aa5ad' }) +
    '<text x="510" y="265" font-family="Arial, sans-serif" font-weight="900" font-size="86" fill="#fff" text-anchor="middle">STOP</text>',
  auto: () => sky() + sun(150, 90) + cloud(600, 70) + cloud(820, 130, 0.8) + ground(380) + road(430, 130) + tree(110, 320) + tree(900, 330) +
    house(620, 250, 160, 130, '#ffe0b2', '#ef4b4b') + motif('auto', 250, 220, 360, { auto: '#ef4b4b', ...WHEEL }),
  teddy: () => `<rect width="${W}" height="${H}" fill="#fde2e4"/>` + `<rect y="430" width="${W}" height="170" fill="#c49a6c"/>` +
    Array.from({ length: 12 }, (_, i) => `<rect x="${i * 90}" y="430" width="6" height="170" fill="#a87e53"/>`).join('') +
    `<rect x="60" y="80" width="200" height="150" fill="#bfe6ff" stroke="${INK}" stroke-width="6"/><path d="M 160 80 L 160 230 M 60 155 L 260 155" stroke="${INK}" stroke-width="6"/>` +
    motif('teddy', 330, 120, 380, { kopf: '#a4703f', ohr: '#8a5a30', bauch: '#c08a55', arm: '#8a5a30' }) +
    motif('ball', 770, 380, 150, { ball: '#4aa8e0' }) + motif('herz', 80, 360, 140, { herz: '#ef4b4b' }),
  feuerwehr: () => sky('#9fd3f5') + cloud(100, 80) + house(80, 220, 220, 200, '#ffd6a5', '#9b5e2e') + house(700, 240, 200, 180, '#cde7b0', '#6d4c41') +
    ground(420, '#9aa5ad', '#8a949b') + road(450, 150) + motif('feuerwehr', 260, 200, 460, { auto: '#e53935', kabine: '#e53935', fenster: '#bfe6ff', leiter: '#d9d9d9', blaulicht: '#29b6f6', 'rad-': '#2b2b2b' }),
  ampel: () => sky() + sun(120, 90) + cloud(700, 80) + ground(390) + road(430, 170) +
    Array.from({ length: 7 }, (_, i) => `<rect x="${380 + i * 40}" y="430" width="24" height="170" fill="#ffffff"/>`).join('') +
    motif('ampel', 120, 60, 380, { kasten: '#33383f', rot: '#ef4b4b', gelb: '#ffd23f', gruen: '#36b37e', pfosten: '#9aa5ad' }) +
    motif('ampel', 680, 60, 380, { kasten: '#33383f', rot: '#5a2a2a', gelb: '#5a5025', gruen: '#36b37e', pfosten: '#9aa5ad' }) + tree(900, 330, 0.8),
  katze: () => sky() + sun() + cloud(80, 100) + ground(380) + `<rect x="0" y="300" width="${W}" height="80" fill="#c98b5a"/>` +
    Array.from({ length: 16 }, (_, i) => `<rect x="${i * 64}" y="270" width="40" height="110" rx="8" fill="#e0a877" stroke="${INK}" stroke-width="3"/>`).join('') +
    motif('katze', 330, 150, 380, { kopf: '#fb8c00', ohr: '#e07000', bauch: '#ffb15c', schwanz: '#e07000' }) +
    flower(120, 470, '#ef4b4b') + flower(220, 500, '#8e24aa') + flower(820, 480, '#4aa8e0') + flower(900, 520, '#f48fb1'),
  paris: () => sky('#ffcfa0', '#fff1dd') + sun(150, 120, 50) + cloud(700, 90) + ground(470, '#9ccf7a', '#7fb85c') +
    house(60, 330, 160, 140, '#f5e6c8', '#5b6c7a') + house(760, 320, 180, 150, '#f5e6c8', '#5b6c7a') + eiffel(500, 60),
  bus: () => sky() + cloud(120, 90) + cloud(780, 70) + skyline(380) + road(400, 200) + motif('bus', 230, 190, 440, { bus: '#ffb703', fenster: '#bfe6ff', 'rad-': '#2b2b2b' }),
  elefant: () => sky('#ffd48a', '#fff3d6') + sun(820, 120, 70) + ground(400, '#e5c16a', '#cfa94d') +
    `<g><rect x="135" y="230" width="20" height="170" fill="#8d5a3b"/><ellipse cx="145" cy="225" rx="110" ry="35" fill="#5f8f3b"/></g>` +
    motif('elefant-kuscheltier', 330, 150, 400, { kopf: '#9aa5ad', ohr: '#c0c7d0', ruessel: '#9aa5ad', bauch: '#8a949b', bein: '#8a949b' }),
  london: () => sky('#b8d4ea', '#e6f0f7') + cloud(80, 90) + cloud(620, 60, 1.2) + water(470, '#4f8fc0') +
    `<rect y="430" width="${W}" height="40" fill="#9aa5ad"/>` + bigBen(220, 30) +
    motif('bus', 420, 240, 420, { bus: '#d32f2f', fenster: '#bfe6ff', 'rad-': '#2b2b2b' }),
  polizeiauto: () => sky() + sun(860, 100) + cloud(150, 80) + house(80, 260, 200, 160, '#dfe7ef', '#2f5f9e') + ground(420, '#9aa5ad', '#8a949b') + road(450, 150) +
    motif('polizeiauto', 300, 230, 420, { auto: '#ffffff', dach: '#ffffff', fenster: '#bfe6ff', blaulicht: '#1e88e5', streifen: '#1e40af', 'rad-': '#2b2b2b' }),
  schmetterling: () => sky('#bfe9ff', '#eaf8ff') + sun(120, 100) + ground(420, '#86d277', '#6cbf5e') +
    Array.from({ length: 10 }, (_, i) => flower(60 + i * 95, 470 + (i % 2) * 40, ['#ef4b4b', '#8e24aa', '#ffb703', '#f48fb1'][i % 4])).join('') +
    motif('schmetterling', 320, 40, 400, { koerper: '#4e342e', 'fluegel-1': '#fb8c00', 'fluegel-2': '#fb8c00', 'fluegel-3': '#ffd23f', 'fluegel-4': '#ffd23f', punkt: '#8e24aa' }),
  rom: () => sky('#9fd3f5', '#e3f4ff') + sun(870, 90) + cloud(120, 80) + ground(470, '#d9c38f', '#c4ad78') + kolosseum(200, 160) +
    tree(110, 400, 0.8) + tree(900, 400, 0.8),
  traktor: () => sky() + sun(150, 90) + cloud(700, 80) + ground(330, '#c9a36a', '#b08850') +
    Array.from({ length: 6 }, (_, i) => `<path d="M 0 ${360 + i * 45} L ${W} ${350 + i * 45}" stroke="#a37c45" stroke-width="10"/>`).join('') +
    motif('traktor', 300, 120, 420, { traktor: '#36b37e', kabine: '#2e9e6c', fenster: '#bfe6ff', 'rad-gross': '#2b2b2b', 'rad-klein': '#2b2b2b', nabe: '#ffd23f', auspuff: '#9aa5ad' }) + tree(880, 260),
  dino: () => sky('#ffc48a', '#ffe9cc') + `<path d="M 650 330 L 780 120 L 820 140 L 950 330 Z" fill="#8d6e63" stroke="${INK}" stroke-width="4"/><path d="M 780 120 Q 800 60 790 20 Q 830 60 820 140 Z" fill="#ef4b4b"/>` +
    ground(330, '#5fb653', '#4a9e40') + tree(120, 280, 1.1) + tree(260, 300, 0.8) +
    motif('dino', 330, 150, 400, { bauch: '#66bb6a', kopf: '#66bb6a', hals: '#66bb6a', schwanz: '#4caf50', bein: '#43a047', zacke: '#ffb703' }),
  'new-york': () => sky('#7cc0f0', '#d8eeff') + cloud(560, 60) + skyline(470) + water(470, '#3d7fb5') + freiheitsstatue(160, 40),
  rennauto: () => sky() + cloud(150, 80) + cloud(700, 60) + `<rect y="250" width="${W}" height="90" fill="#cfd8dc"/>` +
    Array.from({ length: 20 }, (_, i) => `<rect x="${i * 50}" y="250" width="25" height="45" fill="${i % 2 ? '#26323d' : '#fff'}"/><rect x="${i * 50 + 25}" y="295" width="25" height="45" fill="${i % 2 ? '#26323d' : '#fff'}"/>`).join('') +
    ground(340) + road(380, 220) + motif('rennauto', 260, 230, 460, { auto: '#e53935', fenster: '#bfe6ff', spoiler: '#26323d', nummer: '#ffffff', 'rad-': '#2b2b2b' }),
  vorfahrt: () => `<rect width="${W}" height="${H}" fill="#7ccf6b"/>` + `<rect x="420" y="0" width="160" height="${H}" fill="#5b5f66"/><rect y="220" width="${W}" height="160" fill="#5b5f66"/>` +
    Array.from({ length: 6 }, (_, i) => `<rect x="${i * 70 + 15}" y="295" width="40" height="10" fill="#fff"/><rect x="${i * 70 + 600}" y="295" width="40" height="10" fill="#fff"/>`).join('') +
    tree(120, 110, 0.9) + tree(860, 470, 0.9) + house(720, 70, 150, 110, '#ffe0b2', '#ef4b4b') +
    motif('vorfahrt', 250, 60, 150, { schild: '#ffffff' }) + motif('stoppschild', 610, 400, 150, { schild: '#e53935', pfosten: '#9aa5ad' }) +
    motif('ampel', 250, 400, 160, { kasten: '#33383f', rot: '#ef4b4b', gelb: '#ffd23f', gruen: '#36b37e', pfosten: '#9aa5ad' }) +
    motif('auto', 60, 230, 150, { auto: '#4aa8e0', ...WHEEL }) + motif('auto-2', 780, 230, 150, { auto: '#ffb703', dach: '#ffb703', ...WHEEL }) +
    motif('polizeiauto', 425, 20, 150, { auto: '#fff', dach: '#fff', fenster: '#bfe6ff', blaulicht: '#1e88e5', streifen: '#1e40af', 'rad-': '#2b2b2b' }),
  berlin: () => sky() + sun(150, 90) + cloud(560, 80) + ground(450, '#9ccf7a', '#7fb85c') + brandenburgerTor(250, 170) + fernsehturm(800, 60) + tree(110, 400, 0.8),
  koeln: () => sky('#a9cdea', '#e6f1fa') + cloud(560, 60) + cloud(80, 120, 0.8) + water(470, '#4f8fc0') +
    `<path d="M 0 470 L ${W} 470" stroke="#9aa5ad" stroke-width="16"/>` + dom(310, 150) + house(60, 360, 140, 110, '#f5e6c8', '#9b5e2e') + house(800, 360, 140, 110, '#ffe0b2', '#6d4c41'),
};

export function sceneSvg(id) {
  const scene = SCENES[id];
  if (!scene) throw new Error(`Kein Puzzle-Bild für ${id}`);
  return svg(scene());
}
