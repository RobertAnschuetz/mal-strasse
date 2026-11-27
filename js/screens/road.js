// Die Straße: 10 Schilder pro Abschnitt, das Auto des Kindes steht vor dem nächsten Schild.
import { STATIONS, TOTAL, motifFor } from '../curriculum.js';
import { segmentFor, segmentCount } from '../testmode.js';
import { sage } from '../speech.js';
import { ROAD_HINT, ALL_DONE } from '../phrases.js';
import { playPop, playJubel } from '../sound.js';
import { burst } from '../confetti.js';
import { listPictures } from '../gallery-db.js';

// Positionen der 10 Schilder im 1000×700-Bild (Schlangenlinie von unten nach oben)
const SPOTS = [[120, 560], [320, 580], [520, 560], [720, 575], [880, 440], [700, 350], [480, 360], [270, 345], [120, 220], [340, 120]];
const ROAD_PTS = [[-60, 560], ...SPOTS, [620, 95], [1060, 90]];
const SHAPES = ['circle', 'triangle', 'octagon', 'square'];
const SIGN_COLORS = ['#ef4b4b', '#ffb703', '#ef4b4b', '#2f7fd8'];

/** Weiche Kurve durch alle Punkte (Catmull-Rom → Bézier). */
function smoothPath(pts) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export function carSvg(attrs = '') {
  return `<svg viewBox="0 0 120 70" class="car-svg" aria-hidden="true" ${attrs}>
    <path d="M8 48 Q8 36 20 34 L34 33 L46 14 Q48 10 54 10 L82 10 Q88 10 91 15 L102 33 Q114 35 114 48 L114 54 L8 54 Z" fill="#ef4b4b" stroke="#26323d" stroke-width="3" stroke-linejoin="round"/>
    <path d="M51 16 L82 16 L92 33 L42 33 Z" fill="#bfe6ff" stroke="#26323d" stroke-width="2.5" stroke-linejoin="round"/>
    <line x1="67" y1="16" x2="67" y2="33" stroke="#26323d" stroke-width="2.5"/>
    <circle cx="32" cy="55" r="11" fill="#26323d"/><circle cx="32" cy="55" r="4" fill="#ddd"/>
    <circle cx="92" cy="55" r="11" fill="#26323d"/><circle cx="92" cy="55" r="4" fill="#ddd"/>
    <rect x="106" y="40" width="7" height="6" rx="2" fill="#ffd23f"/>
  </svg>`;
}

function signShape(shape, color) {
  switch (shape) {
    case 'circle': return `<circle cx="0" cy="0" r="52" fill="${color}" stroke="#fff" stroke-width="8"/>`;
    case 'triangle': return `<path d="M 0 -60 L 58 44 L -58 44 Z" fill="${color}" stroke="#fff" stroke-width="8" stroke-linejoin="round"/>`;
    case 'octagon': return `<path d="M -22 -54 L 22 -54 L 54 -22 L 54 22 L 22 54 L -22 54 L -54 22 L -54 -22 Z" fill="${color}" stroke="#fff" stroke-width="8" stroke-linejoin="round"/>`;
    default: return `<rect x="-52" y="-52" width="104" height="104" rx="18" fill="${color}" stroke="#fff" stroke-width="8"/>`;
  }
}

const thumbImage = (url) => `<image href="${url}" x="-36" y="-36" width="72" height="72" clip-path="url(#round)"/>`;

function motifThumb(station) {
  if (station.type === 'pick') return '<text x="0" y="20" text-anchor="middle" font-size="54">👂</text>';
  if (station.type === 'word') {
    const size = Math.min(40, Math.floor(150 / Math.max(3, station.word.length)));
    return `<text x="0" y="${Math.round(size / 3)}" text-anchor="middle" font-size="${size}" font-weight="800" fill="#26323d">${station.word}</text>`;
  }
  if (station.char) return `<text x="0" y="22" text-anchor="middle" font-size="64" font-weight="800" fill="#26323d">${station.char}</text>`;
  const m = motifFor(station);
  const paths = [...m.regions.map((r) => r.strokeWidth
    ? `<path d="${r.d}" fill="none" stroke="#26323d" stroke-width="${r.strokeWidth * 0.5}" stroke-linecap="round"/>`
    : `<path d="${r.d}" fill="#fff" stroke="#26323d" stroke-width="7"/>`),
  ...m.lines.map((l) => `<path d="${l.d}" fill="none" stroke="#26323d" stroke-width="6"/>`)].join('');
  return `<g transform="translate(-34 -34) scale(0.34)">${paths}</g>`;
}

export function render(root, ctx, params = {}) {
  const store = ctx.store;
  const next = store.nextStation();
  const allDone = next >= TOTAL;
  const lastSeg = segmentCount(TOTAL) - 1;
  const unlocked = (i) => ctx.testMode || store.isUnlocked(i);
  const completed = new Set(store.getProgress().completed);
  let segment = params.segment ?? segmentFor(allDone ? TOTAL - 1 : next, TOTAL);

  const screen = document.createElement('section');
  screen.className = 'screen road-screen';
  root.appendChild(screen);
  let alive = true;
  let driven = false;
  const thumbs = new Map();

  function draw() {
    const base = segment * 10;
    const roadD = smoothPath(ROAD_PTS);
    const signs = SPOTS.map(([x, y], k) => {
      const i = base + k;
      if (i >= TOTAL) return '';
      const st = STATIONS[i];
      const done = completed.has(i);
      const isNext = i === next;
      const open = unlocked(i);
      const shape = SHAPES[i % 4];
      const color = open ? SIGN_COLORS[i % 4] : '#9aa5ad';
      const inner = `<g class="sign-inner" data-i="${i}">${done && thumbs.has(i)
        ? thumbImage(thumbs.get(i))
        : open ? `<circle r="38" fill="#fff"/>${motifThumb(st)}` : `<circle r="38" fill="#eef1f3"/><text y="18" text-anchor="middle" font-size="48">🔒</text>`}</g>`;
      const badge = done ? '<g transform="translate(40 -46)"><circle r="20" fill="#36b37e" stroke="#fff" stroke-width="5"/><path d="M -9 0 L -2 8 L 10 -8" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>' : '';
      return `<g class="sign ${isNext ? 'sign-next' : ''} ${open ? 'sign-open' : 'sign-locked'}" data-i="${i}" transform="translate(${x} ${y - 70})">
        <rect x="-6" y="40" width="12" height="70" rx="4" fill="#7a8791"/>
        <g class="sign-face">${signShape(shape, color)}${inner}${badge}</g>
      </g>`;
    }).join('');

    const carIndex = allDone ? TOTAL - 1 - base : Math.min(9, Math.max(0, next - base));
    const showCar = allDone ? segment === lastSeg : segmentFor(next, TOTAL) === segment;
    const finish = segment === lastSeg && TOTAL - base < SPOTS.length ? SPOTS[TOTAL - base] : null;
    const [cx, cy] = SPOTS[carIndex];
    const drive = !driven && params.driveFrom != null && params.driveFrom + 1 === next && segmentFor(params.driveFrom, TOTAL) === segment;
    const carFrom = drive ? SPOTS[params.driveFrom - base] : [cx, cy];
    const hasPrev = segment > 0;
    const hasNext = segment < lastSeg && unlocked((segment + 1) * 10);

    screen.innerHTML = `
      <svg class="road-svg" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet">
        <defs><clipPath id="round"><circle r="36"/></clipPath></defs>
        <path d="${roadD}" fill="none" stroke="#5b5f66" stroke-width="78" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${roadD}" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="26 22" stroke-linecap="round"/>
        ${signs}
        ${finish ? `<text x="${finish[0]}" y="${finish[1] - 10}" text-anchor="middle" font-size="90">🏁</text>` : ''}
        ${showCar ? `<g class="road-car" style="transform: translate(${carFrom[0] - 120}px, ${carFrom[1] - 40}px)"><g class="car-bob">${carSvg('width="120" height="70"')}</g></g>` : ''}
      </svg>
      <div class="road-top">
        <button class="btn road-dranbleib" aria-label="Dranbleib-Spiele">🎯</button>
        <button class="btn road-challenges" aria-label="Zeit-Spiele">⏱</button>
        <button class="btn road-worlds" aria-label="Was passt nicht?">🔍</button>
        <button class="btn road-puzzles" aria-label="Puzzles">🧩</button>
        <button class="btn road-album" aria-label="Sticker-Album">📒<span class="badge">${store.getProgress().stickers.length}</span></button>
        <button class="btn road-gallery" aria-label="Galerie">🖼️</button>
      </div>
      <button class="btn road-prev ${hasPrev ? '' : 'hidden'}" aria-label="Zurück">◀</button>
      <button class="btn road-next ${hasNext ? '' : 'hidden'}" aria-label="Weiter">▶</button>`;

    if (drive) {
      driven = true;
      const car = screen.querySelector('.road-car');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        car.style.transition = 'transform 1.6s ease-in-out';
        car.style.transform = `translate(${cx - 120}px, ${cy - 40}px)`;
      }));
    }

    screen.querySelectorAll('.sign').forEach((g) => g.addEventListener('click', () => {
      const i = Number(g.dataset.i);
      if (!unlocked(i)) { playPop(); sage(ROAD_HINT); return; }
      playPop();
      ctx.go(STATIONS[i].type === 'pick' ? 'pick' : 'task', { stationIndex: i });
    }));
    screen.querySelector('.road-dranbleib').addEventListener('click', () => { playPop(); ctx.go('dranbleib'); });
    screen.querySelector('.road-challenges').addEventListener('click', () => { playPop(); ctx.go('challenges'); });
    screen.querySelector('.road-worlds').addEventListener('click', () => { playPop(); ctx.go('worlds'); });
    screen.querySelector('.road-puzzles').addEventListener('click', () => { playPop(); ctx.go('puzzles'); });
    screen.querySelector('.road-album').addEventListener('click', () => { playPop(); ctx.go('album'); });
    screen.querySelector('.road-gallery').addEventListener('click', () => { playPop(); ctx.go('gallery'); });
    screen.querySelector('.road-prev').addEventListener('click', () => { playPop(); segment--; draw(); });
    screen.querySelector('.road-next').addEventListener('click', () => { playPop(); segment++; draw(); });
  }

  draw();

  // Vorschaubilder nachladen und nur die Schilder austauschen – nicht die ganze Straße
  // (sonst würde die Fahrt des Autos abgebrochen).
  listPictures().then((pics) => {
    if (!alive) return;
    for (const p of [...pics].reverse()) {
      try {
        const url = URL.createObjectURL(p.blob);
        if (thumbs.has(p.stationIndex)) URL.revokeObjectURL(thumbs.get(p.stationIndex));
        thumbs.set(p.stationIndex, url);
      } catch { /* Bild fehlt – Schild zeigt das Motiv */ }
    }
    screen.querySelectorAll('.sign-inner').forEach((g) => {
      const i = Number(g.dataset.i);
      if (completed.has(i) && thumbs.has(i)) g.innerHTML = thumbImage(thumbs.get(i));
    });
  });

  const timers = [];
  const name = store.getName();
  if (allDone) {
    timers.push(setTimeout(() => { burst(screen, 4000); playJubel(); }, 400));
    sage(ALL_DONE);
  } else if (params.greet || params.afterReward) {
    timers.push(setTimeout(() => sage(ROAD_HINT), params.greet ? 1800 : 1700));
  }

  return () => {
    alive = false;
    timers.forEach(clearTimeout);
    for (const url of thumbs.values()) URL.revokeObjectURL(url);
  };
}
