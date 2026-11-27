// Großbuchstaben und Ziffern als Strichpfade im 200er-Raster (Druckschrift).
// Jeder Strich beginnt dort, wo das Kind anfangen soll.

const O = 'M 100 30 A 50 70 0 1 0 100 170 A 50 70 0 1 0 100 30';
const P_BOW = 'M 60 30 L 110 30 Q 145 30 145 65 Q 145 100 110 100 L 60 100';

const STROKES = {
  A: ['M 100 30 L 55 170', 'M 100 30 L 145 170', 'M 72 118 L 128 118'],
  B: ['M 60 30 L 60 170', 'M 60 30 L 112 30 Q 142 30 142 65 Q 142 100 112 100 L 60 100',
    'M 60 100 L 118 100 Q 150 100 150 135 Q 150 170 118 170 L 60 170'],
  C: ['M 142 58 A 50 70 0 1 0 142 142'],
  D: ['M 60 30 L 60 170', 'M 60 30 L 95 30 Q 145 30 145 100 Q 145 170 95 170 L 60 170'],
  E: ['M 140 30 L 60 30 L 60 170 L 140 170', 'M 60 100 L 125 100'],
  F: ['M 140 30 L 60 30 L 60 170', 'M 60 100 L 125 100'],
  G: ['M 142 58 A 50 70 0 1 0 148 112 L 105 112'],
  H: ['M 60 30 L 60 170', 'M 140 30 L 140 170', 'M 60 100 L 140 100'],
  I: ['M 100 30 L 100 170'],
  J: ['M 130 30 L 130 130 Q 130 170 95 170 Q 66 170 60 142'],
  K: ['M 60 30 L 60 170', 'M 140 30 L 60 108', 'M 88 82 L 145 170'],
  L: ['M 65 30 L 65 170 L 140 170'],
  M: ['M 50 170 L 50 30 L 100 112 L 150 30 L 150 170'],
  N: ['M 60 170 L 60 30 L 140 170 L 140 30'],
  O: [O],
  P: ['M 60 30 L 60 170', P_BOW],
  Q: [O, 'M 115 135 L 152 176'],
  R: ['M 60 30 L 60 170', P_BOW, 'M 100 100 L 145 170'],
  S: ['M 140 52 Q 126 30 100 30 Q 60 30 60 65 Q 60 100 100 100 Q 140 100 140 135 Q 140 170 100 170 Q 70 170 58 150'],
  T: ['M 50 30 L 150 30', 'M 100 30 L 100 170'],
  U: ['M 60 30 L 60 120 Q 60 170 100 170 Q 140 170 140 120 L 140 30'],
  V: ['M 55 30 L 100 170 L 145 30'],
  W: ['M 40 30 L 70 170 L 100 82 L 130 170 L 160 30'],
  X: ['M 60 30 L 140 170', 'M 140 30 L 60 170'],
  Y: ['M 55 30 L 100 100', 'M 145 30 L 100 100 L 100 170'],
  Z: ['M 60 30 L 140 30 L 60 170 L 140 170'],
  0: ['M 100 30 A 45 70 0 1 0 100 170 A 45 70 0 1 0 100 30'],
  1: ['M 70 62 L 105 30 L 105 170'],
  2: ['M 62 65 Q 65 30 100 30 Q 140 30 140 65 Q 140 98 60 170 L 145 170'],
  3: ['M 62 50 Q 75 30 100 30 Q 138 30 138 63 Q 138 98 95 98 Q 142 98 142 135 Q 142 170 100 170 Q 70 170 58 150'],
  4: ['M 120 170 L 120 30 L 55 125 L 150 125'],
  5: ['M 140 30 L 70 30 L 64 95 Q 80 85 100 85 Q 142 85 142 128 Q 142 170 100 170 Q 72 170 58 152'],
  6: ['M 135 45 Q 120 30 100 30 Q 55 30 55 105 Q 55 170 100 170 Q 142 170 142 128 Q 142 88 100 88 Q 65 88 56 115'],
  7: ['M 55 30 L 145 30 L 85 170'],
  8: ['M 100 100 Q 60 100 60 65 Q 60 30 100 30 Q 140 30 140 65 Q 140 100 100 100 Q 55 100 55 135 Q 55 170 100 170 Q 145 170 145 135 Q 145 100 100 100'],
  9: ['M 143 85 Q 135 112 100 112 Q 58 112 58 71 Q 58 30 100 30 Q 145 30 145 85 L 145 110 Q 145 170 100 170 Q 75 170 62 155'],
};

const NUMBER_NAMES = ['die Null', 'die Eins', 'die Zwei', 'die Drei', 'die Vier', 'die Fünf', 'die Sechs', 'die Sieben', 'die Acht', 'die Neun'];

export const CHARS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'];

export const charLabel = (ch) => (/[0-9]/.test(ch) ? NUMBER_NAMES[Number(ch)] : `das ${ch}`);

const startOf = (d) => {
  const [, x, y] = d.match(/^M\s*(-?[\d.]+)\s+(-?[\d.]+)/);
  return [Number(x), Number(y)];
};

export function charMotif(ch, mode) {
  const strokes = STROKES[ch];
  if (!strokes) throw new Error(`Unbekanntes Zeichen: ${ch}`);
  const label = charLabel(ch);
  const lines = strokes.map((d) => ({ d }));
  if (mode === 'write') {
    return { id: `zeichen-${ch}`, label, regions: [], lines, start: strokes.map(startOf) };
  }
  return {
    id: `zeichen-${ch}`, label,
    regions: [{ id: 'zeichen', label, d: strokes.join(' '), strokeWidth: 36 }],
    lines,
  };
}

// ---------- Wörter: mehrere Buchstaben nebeneinander ----------
const ARGS = { M: 2, L: 2, Q: 4, C: 6, A: 7, Z: 0 };
const num = (n) => String(+n.toFixed(1));

/** Pfad (absolute Befehle M L Q C A Z) skalieren und verschieben. */
export function transformPath(d, s, tx, ty) {
  const tokens = d.match(/[MLQCAZ]|-?\d*\.?\d+/gi);
  const out = [];
  let cmd = null;
  let i = 0;
  while (i < tokens.length) {
    if (/^[MLQCAZ]$/i.test(tokens[i])) { cmd = tokens[i].toUpperCase(); out.push(cmd); i++; if (cmd === 'Z') continue; }
    const n = ARGS[cmd];
    const a = tokens.slice(i, i + n).map(Number);
    i += n;
    if (cmd === 'A') out.push(num(a[0] * s), num(a[1] * s), num(a[2]), num(a[3]), num(a[4]), num(a[5] * s + tx), num(a[6] * s + ty));
    else for (let k = 0; k < a.length; k += 2) out.push(num(a[k] * s + tx), num(a[k + 1] * s + ty));
  }
  return out.join(' ');
}

/** Ein Wort zum Nachfahren: Buchstaben nebeneinander, jeder Strich mit grünem Startpunkt. */
export function wordMotif(word, label) {
  const chars = [...String(word).toUpperCase()].filter((c) => STROKES[c]);
  const n = Math.max(1, chars.length);
  const cellW = 196 / n;
  const s = Math.min(1, cellW / 130);
  const lines = [];
  const groups = [];
  chars.forEach((c, i) => {
    const cx = 2 + cellW * (i + 0.5);
    const group = [];
    for (const d of STROKES[c]) { group.push(lines.length); lines.push({ d: transformPath(d, s, cx - 100 * s, 100 - 100 * s) }); }
    groups.push(group);
  });
  return { id: `wort-${chars.join('')}`, label: label || chars.join(''), regions: [], lines, start: lines.map((l) => startOf(l.d)), groups, guideScale: s };
}
