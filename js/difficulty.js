// Schwierigkeit je Station (0..99) und Erleichterung nach Fehlversuchen.
// Raster-Einheiten beziehen sich auf das 200×200-Motivraster.

const BANDS = [
  { clip: true, coverage: 0.40, regionMin: null, spillMax: null, tolerance: 14, brushWidth: 16, guideWidth: 10 },
  { clip: false, coverage: 0.60, regionMin: null, spillMax: 0.35, tolerance: 10, brushWidth: 12, guideWidth: 8 },
  { clip: false, coverage: 0.70, regionMin: 0.40, spillMax: 0.20, tolerance: 7, brushWidth: 9, guideWidth: 6 },
  { clip: false, coverage: 0.80, regionMin: 0.60, spillMax: 0.10, tolerance: 5, brushWidth: 7, guideWidth: 4 },
];

const clampIndex = (i) => Math.min(99, Math.max(0, Math.floor(Number(i) || 0)));

export function bandFor(index) {
  const i = clampIndex(index);
  if (i < 10) return 0;
  if (i < 30) return 1;
  if (i < 60) return 2;
  return 3;
}

export function guideOpacityFor(index) {
  const i = clampIndex(index);
  if (i <= 50) return 1;
  return 1 - 0.75 * ((i - 50) / 49);
}

export function thresholdsFor(index, failedAttempts = 0) {
  const base = BANDS[bandFor(index)];
  const k = Math.min(3, Math.max(0, Math.floor(Number(failedAttempts) || 0)));
  return {
    clip: base.clip,
    // Nur sanfte Erleichterung: ungenaues Malen soll auch nach vielen Versuchen nicht reichen
    coverage: base.coverage * (1 - 0.05 * k),
    regionMin: base.regionMin === null ? null : base.regionMin * (1 - 0.1 * k),
    spillMax: base.spillMax === null ? null : base.spillMax + 0.03 * k,
    tolerance: base.tolerance * (1 + 0.1 * k),
    brushWidth: base.brushWidth,
    guideWidth: base.guideWidth,
    guideOpacity: guideOpacityFor(index),
  };
}

/** Ein Haken-Tipp zählt nur als Versuch, wenn seit dem letzten gezählten Versuch weitergemalt wurde. */
export const countsAsAttempt = (strokeCount, lastCountedStrokes) => strokeCount > 0 && strokeCount !== lastCountedStrokes;
