// Puzzle-Logik: Liste der Puzzles, Raster, Puzzleteil-Formen, Einrasten. Rein, ohne Browser.

/** 20 Puzzles, von 15 bis 50 Teilen. label = wie die Stimme es sagt. */
export const PUZZLES = ([
  { id: 'stoppschild', kind: 'schild', label: 'das Stoppschild', pieces: 15 },
  { id: 'auto', kind: 'auto', label: 'das Auto', pieces: 15 },
  { id: 'teddy', kind: 'tier', label: 'den Teddy', pieces: 18 },
  { id: 'berlin', kind: 'stadt', label: 'Berlin', pieces: 18 },
  { id: 'feuerwehr', kind: 'auto', label: 'das Feuerwehrauto', pieces: 20 },
  { id: 'ampel', kind: 'schild', label: 'die Ampel', pieces: 20 },
  { id: 'katze', kind: 'tier', label: 'die Katze', pieces: 24 },
  { id: 'paris', kind: 'stadt', label: 'Paris', pieces: 24 },
  { id: 'bus', kind: 'auto', label: 'den Bus', pieces: 28 },
  { id: 'elefant', kind: 'tier', label: 'den Elefanten', pieces: 28 },
  { id: 'london', kind: 'stadt', label: 'London', pieces: 30 },
  { id: 'polizeiauto', kind: 'auto', label: 'das Polizeiauto', pieces: 30 },
  { id: 'schmetterling', kind: 'tier', label: 'den Schmetterling', pieces: 35 },
  { id: 'rom', kind: 'stadt', label: 'Rom', pieces: 35 },
  { id: 'traktor', kind: 'auto', label: 'den Traktor', pieces: 40 },
  { id: 'dino', kind: 'tier', label: 'den Dino', pieces: 40 },
  { id: 'new-york', kind: 'stadt', label: 'New York', pieces: 45 },
  { id: 'rennauto', kind: 'auto', label: 'das Rennauto', pieces: 45 },
  { id: 'vorfahrt', kind: 'schild', label: 'die Kreuzung mit Schildern', pieces: 50 },
  { id: 'koeln', kind: 'stadt', label: 'Köln', pieces: 50 },
]).map((p, i) => ({ ...p, index: i, stickerId: `st-6-${i}` }));

/** Bildgröße aller Puzzle-Bilder (Querformat 5:3). */
export const IMAGE_W = 1000;
export const IMAGE_H = 600;

const GRIDS = { 15: [5, 3], 18: [6, 3], 20: [5, 4], 24: [6, 4], 28: [7, 4], 30: [6, 5], 35: [7, 5], 40: [8, 5], 45: [9, 5], 50: [10, 5] };

export function gridFor(pieces) {
  const g = GRIDS[pieces];
  if (!g) throw new Error(`Keine Aufteilung für ${pieces} Teile`);
  return { cols: g[0], rows: g[1] };
}

/** Kanten jedes Teils: 0 = gerade (Rand), 1 = Nase nach außen, -1 = Loch nach innen. */
export function makeEdges(cols, rows, rng = Math.random) {
  const e = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ top: 0, right: 0, bottom: 0, left: 0 })));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c < cols - 1) { const v = rng() < 0.5 ? 1 : -1; e[r][c].right = v; e[r][c + 1].left = -v; }
      if (r < rows - 1) { const v = rng() < 0.5 ? 1 : -1; e[r][c].bottom = v; e[r + 1][c].top = -v; }
    }
  }
  return e;
}

const f = (n) => Math.round(n * 10) / 10;

/** Umriss eines Teils (lokale Koordinaten, Rechteck 0..w × 0..h, Nasen ragen bis zu t darüber hinaus). */
export function piecePath(edges, w, h) {
  const t = 0.24 * Math.min(w, h);
  const sides = [
    { a: [0, 0], b: [w, 0], n: [0, -1], v: edges.top },
    { a: [w, 0], b: [w, h], n: [1, 0], v: edges.right },
    { a: [w, h], b: [0, h], n: [0, 1], v: edges.bottom },
    { a: [0, h], b: [0, 0], n: [-1, 0], v: edges.left },
  ];
  let d = 'M 0 0';
  for (const { a, b, n, v } of sides) {
    if (!v) { d += ` L ${f(b[0])} ${f(b[1])}`; continue; }
    const p = (s, k) => {
      const x = a[0] + (b[0] - a[0]) * s + n[0] * k * t * v;
      const y = a[1] + (b[1] - a[1]) * s + n[1] * k * t * v;
      return `${f(x)} ${f(y)}`;
    };
    d += ` L ${p(0.36, 0)} C ${p(0.40, 0)} ${p(0.28, 1)} ${p(0.5, 1)} C ${p(0.72, 1)} ${p(0.60, 0)} ${p(0.64, 0)} L ${p(1, 0)}`;
  }
  return `${d} Z`;
}

/** Rastet das Teil ein? (nahe genug an seiner Stelle) */
export const isSnapped = (pos, target, cellW, cellH) =>
  Math.hypot(pos.x - target.x, pos.y - target.y) <= 0.3 * Math.min(cellW, cellH);

/** Blasse Vorlage auf dem Brett: am Anfang gut sichtbar, ab Puzzle 16 weg. */
export const ghostOpacity = (index) => Math.max(0, 0.35 * (1 - index / 15));

/** Teile zufällig neben dem Brett verteilen (pw × ph = Teilgröße inkl. Nasen). */
export function scatter(n, pw, ph, area, board, rng = Math.random) {
  const out = [];
  const onBoard = (x, y) => {
    const cx = x + pw / 2, cy = y + ph / 2;
    return cx > board.x && cx < board.x + board.w && cy > board.y && cy < board.y + board.h;
  };
  for (let i = 0; i < n; i++) {
    let pos = null;
    for (let tries = 0; tries < 400 && !pos; tries++) {
      const x = rng() * Math.max(1, area.w - pw);
      const y = rng() * Math.max(1, area.h - ph);
      if (!onBoard(x, y)) pos = { x, y };
    }
    // Kein Platz gefunden: rechts neben das Brett stapeln
    out.push(pos || { x: Math.min(area.w - pw, board.x + board.w + 4), y: Math.min(area.h - ph, (i * 13) % Math.max(1, area.h - ph)) });
  }
  return out;
}
