// Unterschiede finden für die Dranbleib-Spiele: zwei Bilder, im zweiten ist etwas anders. Rein, ohne Browser.
import { WORLDS } from './worlds.js';

const clampLevel = (l) => Math.min(12, Math.max(1, Math.floor(l) || 1));
const DIFFS = [3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7];
const ITEMS = [7, 8, 8, 9, 10, 10, 11, 12, 12, 13, 14, 14];

export const diffsFor = (level) => DIFFS[clampLevel(level) - 1];
export const itemsFor = (level) => ITEMS[clampLevel(level) - 1];
export const picturesPerRound = (level) => (clampLevel(level) <= 4 ? 2 : 1);
/** Welche Arten von Unterschieden es auf einer Stufe gibt. */
export function kindsFor(level) {
  const l = clampLevel(level);
  if (l <= 4) return ['missing', 'added'];
  if (l <= 8) return ['missing', 'added', 'swapped'];
  return ['missing', 'added', 'swapped', 'similar', 'mirrored'];
}
export const HINT_AFTER_MS = 20000;
/** Wie nah ein Tipp am Unterschied sein muss (Anteil der Bildbreite). */
export const HIT_RADIUS = 0.065;

// Ähnliches zum Austauschen (ab Stufe 9)
export const SIMILAR = {
  '🐒': '🦍', '🦍': '🐒', '🐯': '🦁', '🐘': '🦏', '🐸': '🐢', '🦋': '🐝', '🐪': '🐫', '🐈': '🐕', '🐊': '🦎', '🦅': '🦜',
  '🦜': '🐦', '🚀': '🛸', '🛸': '🚀', '⭐': '🌟', '🌍': '🌎', '🐠': '🐟', '🐬': '🐳', '🐳': '🐬', '🦈': '🐬', '🦀': '🦞',
  '🐙': '🦑', '🦑': '🐙', '🚂': '🚃', '🧳': '💼', '☕': '🍵', '🎒': '👜', '✈️': '🛩️', '🛩️': '✈️',
  '🧸': '🐻', '🎨': '🖌️', '📚': '📖', '🍎': '🍏', '⚽': '🏀', '🏀': '🏐', '🌳': '🌲', '🐦': '🐤', '🍦': '🍧', '🛴': '🛹',
  '🚲': '🛵', '🍌': '🍋', '🌴': '🌳', '🐍': '🪱', '🐢': '🐸',
};
// Dinge, die nach einer Seite schauen – nur bei denen sieht man das Spiegeln
export const DIRECTIONAL = new Set(['🐒', '🐍', '🦜', '🐘', '🐪', '🦂', '🐈', '🐊', '🦅', '🚀', '🐠', '🐬', '🐳', '🦈', '🐢',
  '🚂', '🚆', '🚃', '🚋', '✈️', '🚁', '🛩️', '🦍', '🐦', '🛴', '🚲', '🐯', '🦎', '🐌', '🦕', '🚜', '🐄', '🐫']);

function shuffle(list, rng) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const COLS = 6, ROWS = 3;
/** Plätze im Bild (Anteil von Breite/Höhe), mit etwas Zufall. */
function cellSpot(cell, rng) {
  const c = cell % COLS, r = Math.floor(cell / COLS);
  const cw = 0.84 / COLS, ch = 0.76 / ROWS;
  return { x: 0.08 + cw * (c + 0.5) + (rng() - 0.5) * 0.15 * cw, y: 0.14 + ch * (r + 0.5) + (rng() - 0.5) * 0.15 * ch };
}

/**
 * Ein Bilderpaar. Ergebnis: { worldId, left, right, diffs }.
 * left/right: Dinge { emoji, x, y, flip }. diffs: { x, y, kind } – dort ist der Unterschied.
 */
export function makePuzzle(level, rng = Math.random, worldId = null) {
  const world = worldId ? WORLDS.find((w) => w.id === worldId) : WORLDS[Math.floor(rng() * WORLDS.length)];
  const pool = shuffle(world.fits.map((f) => f.emoji), rng);
  const nItems = Math.min(itemsFor(level), pool.length + 4);
  const nDiffs = diffsFor(level);
  const kinds = kindsFor(level);
  const cells = shuffle(Array.from({ length: COLS * ROWS }, (_, i) => i), rng);

  // Grundbild: Dinge aus der Welt, ein paar dürfen doppelt vorkommen
  const left = Array.from({ length: nItems }, (_, i) => ({ emoji: pool[i % pool.length], ...cellSpot(cells[i], rng), flip: false }));
  const right = left.map((it) => ({ ...it }));
  const freeCells = cells.slice(nItems);
  const diffs = [];
  const touched = new Set();
  const unused = pool.filter((e) => !left.some((it) => it.emoji === e));

  for (let d = 0; d < nDiffs; d++) {
    let kind = kinds[Math.floor(rng() * kinds.length)];
    const free = shuffle(left.map((_, i) => i).filter((i) => !touched.has(i)), rng);
    if (kind === 'mirrored' && !free.some((i) => DIRECTIONAL.has(left[i].emoji))) kind = 'swapped';
    if (kind === 'similar' && !free.some((i) => SIMILAR[left[i].emoji])) kind = 'swapped';
    if (kind === 'added' && !freeCells.length) kind = 'missing';
    if (kind === 'added') {
      const spot = cellSpot(freeCells.shift(), rng);
      const emoji = unused.length ? unused.shift() : pool[Math.floor(rng() * pool.length)];
      right.push({ emoji, ...spot, flip: false });
      diffs.push({ ...spot, kind });
      continue;
    }
    const pickFrom = kind === 'mirrored' ? free.filter((i) => DIRECTIONAL.has(left[i].emoji))
      : kind === 'similar' ? free.filter((i) => SIMILAR[left[i].emoji]) : free;
    const i = pickFrom[0];
    touched.add(i);
    if (kind === 'missing') right[i] = null;
    else if (kind === 'mirrored') right[i].flip = true;
    else if (kind === 'similar') right[i].emoji = SIMILAR[left[i].emoji];
    else {
      // ausgetauscht: etwas anderes aus derselben Welt (nie dasselbe Bild)
      const other = unused.length ? unused.shift() : pool.find((e) => e !== left[i].emoji);
      right[i].emoji = other;
    }
    diffs.push({ x: left[i].x, y: left[i].y, kind });
  }
  return { worldId: world.id, left, right: right.filter(Boolean), diffs };
}

/** Liegt (x, y) auf einem schon gefundenen Unterschied? Nochmal antippen ist kein Fehler. */
export function onFoundDiff(diffs, found, x, y, aspect = 1.6) {
  return [...found].some((i) => Math.hypot(diffs[i].x - x, (diffs[i].y - y) / aspect) <= HIT_RADIUS * 1.5);
}

/** Welcher noch nicht gefundene Unterschied liegt an (x, y)? aspect = Breite/Höhe des Bildes. -1 = keiner. */
export function hitDiff(diffs, found, x, y, aspect = 1.6) {
  let best = -1, bestDist = HIT_RADIUS;
  diffs.forEach((d, i) => {
    if (found.has(i)) return;
    const dist = Math.hypot(d.x - x, (d.y - y) / aspect);
    if (dist <= bestDist) { best = i; bestDist = dist; }
  });
  return best;
}
