// Paare finden (Memory-Spiel) für die Dranbleib-Spiele. Rein, ohne Browser.

const clampLevel = (l) => Math.min(12, Math.max(1, Math.floor(l) || 1));
const PAIRS = [3, 3, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10];

export const pairsFor = (level) => PAIRS[clampLevel(level) - 1];
/** Wie lange alle Karten am Anfang offen liegen (ms). */
export const peekMsFor = (level) => (clampLevel(level) <= 3 ? 3000 : clampLevel(level) <= 6 ? 1500 : 0);
/** Felder pro Runde: am Anfang zwei kleine, später ein großes. */
export const boardsPerRound = (level) => (clampLevel(level) <= 4 ? 2 : 1);
export const HINT_AFTER_MS = 20000;
export const MISMATCH_SHOW_MS = 1200;

// Gut unterscheidbare Bilder
const PLAIN = ['🚗', '🚌', '🚂', '✈️', '🚀', '🚲', '🚜', '🚒', '🐶', '🐱', '🐮', '🐷', '🐸', '🦁', '🐘', '🐟',
  '🛑', '🚦', '🍎', '🍌', '🍓', '🍉', '⭐', '🌈', '⚽', '🎈', '🧸', '🌻'];
// Sich ähnelnde Gruppen (ab Stufe 7 landen zwei aus einer Gruppe im selben Feld)
const SIMILAR = [['🚗', '🚙', '🚕'], ['🚌', '🚎'], ['🐶', '🐺', '🦊'], ['🐱', '🐯'], ['🍎', '🍅', '🍒'], ['🍋', '🍌'], ['🐸', '🐢'], ['🐮', '🐷']];

function shuffle(list, rng) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Spalten für ein Feld mit n Karten: möglichst breit als hoch (Querformat). */
export function gridFor(cards, landscape = true) {
  let best = null;
  for (let cols = 2; cols <= cards; cols++) {
    const rows = Math.ceil(cards / cols);
    if (rows * cols - cards >= cols) continue;
    const ratio = landscape ? cols / rows : rows / cols;
    const score = Math.abs(ratio - 1.5) + (rows * cols - cards) * 0.3;
    if (!best || score < best.score) best = { cols, rows, score };
  }
  return { cols: best.cols, rows: best.rows };
}

/** Ein Feld: gemischte Karten, jede Karte { id, pair, emoji }. */
export function makeBoard(level, rng = Math.random) {
  const pairs = pairsFor(level);
  let pictures = [];
  if (clampLevel(level) >= 7) {
    // ein, zwei ähnliche Gruppen hinein
    for (const group of shuffle(SIMILAR, rng).slice(0, clampLevel(level) >= 10 ? 2 : 1)) pictures.push(...shuffle(group, rng).slice(0, 2));
  }
  for (const p of shuffle(PLAIN, rng)) {
    if (pictures.length >= pairs) break;
    if (!pictures.includes(p) && !SIMILAR.some((g) => g.includes(p) && g.some((x) => pictures.includes(x)))) pictures.push(p);
  }
  pictures = pictures.slice(0, pairs);
  const cards = pictures.flatMap((emoji, pair) => [{ pair, emoji }, { pair, emoji }]);
  return shuffle(cards, rng).map((c, id) => ({ ...c, id }));
}

/**
 * Spielstand eines Feldes. flip(id) liefert:
 *  { result: 'first' } – erste Karte offen
 *  { result: 'match', pair } – Paar gefunden
 *  { result: 'miss', error } – ungleich; error = hätte man wissen können (Partner schon gesehen)
 *  { result: 'ignored' } – Karte schon offen/gefunden
 */
export function createMemoryGame(cards) {
  const seen = new Set();   // Karten-IDs, die schon einmal offen waren
  const found = new Set();  // gefundene Paar-Nummern
  let open = null;          // erste offene Karte
  const partnerOf = (c) => cards.find((x) => x.pair === c.pair && x.id !== c.id);

  return {
    flip(id) {
      const card = cards[id];
      if (!card || found.has(card.pair) || (open && open.id === id)) return { result: 'ignored' };
      if (!open) {
        // eine Karte aufzudecken, deren Partner man schon kennt, ist gut; ein Fehler entsteht erst beim falschen Zweiten
        open = card;
        seen.add(id);
        return { result: 'first' };
      }
      const first = open;
      open = null;
      const firstPartnerSeen = seen.has(partnerOf(first).id);
      seen.add(id);
      if (first.pair === card.pair) { found.add(card.pair); return { result: 'match', pair: card.pair }; }
      // Fehler, wenn der Partner der ersten Karte schon bekannt war und man trotzdem woanders getippt hat
      return { result: 'miss', error: firstPartnerSeen };
    },
    /** Ein Paar, dessen beide Karten schon gesehen wurden und das noch fehlt (für den Tipp). */
    knownPair() {
      for (const c of cards) {
        const p = partnerOf(c);
        if (!found.has(c.pair) && seen.has(c.id) && seen.has(p.id)) return [c.id, p.id];
      }
      return null;
    },
    /** Nach dem Anschauen am Anfang gelten alle Karten als gesehen. */
    seeAll() { cards.forEach((c) => seen.add(c.id)); },
    get done() { return found.size === cards.length / 2; },
    get foundPairs() { return found.size; },
  };
}
