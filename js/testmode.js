// Kleine reine Helfer für Router und Straße.
export const isTestMode = (search) => new URLSearchParams(search || '').has('test');

/** Anzahl der Abschnitte bei 10 Schildern pro Abschnitt. */
export const segmentCount = (total) => Math.ceil(total / 10);

/** Abschnitt, in dem ein Schild liegt. */
export const segmentFor = (index, total) => Math.min(segmentCount(total) - 1, Math.max(0, Math.floor(index / 10)));
