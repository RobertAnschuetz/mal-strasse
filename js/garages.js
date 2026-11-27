// Garagen-Hütchenspiel: Wo ist das Auto? Rein, ohne Browser.

const clampLevel = (l) => Math.min(12, Math.max(1, Math.floor(l) || 1));

export const SHUFFLES_PER_ROUND = 3;

export const garageCountFor = (level) => (clampLevel(level) <= 5 ? 3 : clampLevel(level) <= 9 ? 4 : 5);

/** Anzahl Tausche: Stufe 1 → 3 … Stufe 12 → 14; nach jedem Fehlversuch 40 % weniger, mindestens 1. */
export const swapsFor = (level, failedTries = 0) =>
  Math.max(1, Math.floor((2 + clampLevel(level)) * 0.6 ** Math.max(0, failedTries)));

/** Dauer eines Tauschs in ms: 900 (Stufe 1) bis 420 (Stufe 12); nach Fehlversuch +150 ms, höchstens 1100. */
export const swapDurationFor = (level, failedTries = 0) =>
  Math.min(1100, Math.round(900 - (clampLevel(level) - 1) * (480 / 11)) + 150 * Math.max(0, failedTries));

/** Ab Stufe 5 fliegt beim Mischen ab und zu etwas vorbei – zum Üben, sich nicht ablenken zu lassen. */
export const distractorsFor = (level) => clampLevel(level) >= 5;

export function makeShuffle(count, swaps, rng = Math.random) {
  return Array.from({ length: swaps }, () => {
    const i = Math.floor(rng() * count);
    const j = (i + 1 + Math.floor(rng() * (count - 1))) % count;
    return [i, j];
  });
}

/** Wo steht das Auto nach allen Tauschen? (Plätze werden getauscht.) */
export const trackCar = (start, shuffle) =>
  shuffle.reduce((pos, [i, j]) => (pos === i ? j : pos === j ? i : pos), start);
