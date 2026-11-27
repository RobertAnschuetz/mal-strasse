// Dranbleib-Spiele: Übungszeit, Stufen, Dranbleib-Sterne. Rein, ohne Browser.

export const SESSION_ROUNDS = 5;
export const MAX_LEVEL = 12;
export const STAR_MILESTONES = [5, 10, 20, 30, 50];

/** Nach einer Übungszeit: eine Stufe höher, außer bei mehr als 5 Fehlern. */
export const nextLevel = (level, sessionErrors) => (sessionErrors > 5 ? level : Math.min(MAX_LEVEL, level + 1));

/** Garagen: geschafft nach mindestens einem Fehler → Dranbleib-Stern. */
export const roundStar = (errorsInRound) => errorsInRound >= 1;

/** Labyrinth: nur wer nach dem Anstoßen neu angesetzt hat, bekommt den Stern (Streifen allein zählt nicht). */
export const mazeRoundStar = ({ bumps, resumedAfterBump }) => bumps >= 1 && !!resumedAfterBump;

/** Welche Sticker-Meilensteine wurden zwischen zwei Sternzahlen überschritten? */
export const newMilestones = (before, after) => STAR_MILESTONES.filter((m) => before < m && after >= m);

export const DRANBLEIB_PHRASES = {
  pick: 'Such dir ein Dranbleib-Spiel aus!',
  mazeIntro: 'Fahr das Auto durch die Straßen bis zur Flagge!',
  garageIntro: 'Schau genau, in welche Garage das Auto fährt!',
  distract: 'Lass dich nicht ablenken!',
  bump: 'Ups – bleib auf der Straße!',
  hint: 'Schau mal, hier geht es weiter!',
  wrongGarage: 'Fast! Schau ganz genau hin.',
  rightGarage: 'Richtig! Da ist das Auto!',
  tapPrompt: 'Wo ist das Auto? Tipp drauf!',
  roundDone: 'Super, eine Runde geschafft!',
  star: 'Du bist drangeblieben! Dafür gibt es einen Dranbleib-Stern!',
  sessionDone: 'Toll! Du hast alle Runden geschafft!',
  levelUp: 'Beim nächsten Mal wird es ein bisschen schwerer.',
  memoryIntro: 'Finde immer zwei gleiche Karten!',
  memoryPeek: 'Schau dir die Karten gut an!',
  memoryHint: 'Die zwei hast du schon gesehen!',
  diffIntro: 'Finde die Unterschiede zwischen den beiden Bildern!',
  diffHint: 'Schau mal hier, da ist etwas anders!',
};

/** Testmodus für Eltern: ?test&dranbleib=3 setzt alle Dranbleib-Spiele auf Stufe 3; 0 setzt alles zurück. */
export function parseDranbleibParam(search) {
  const p = new URLSearchParams(search || '');
  if (!p.has('test') || !p.has('dranbleib')) return null;
  const n = Math.floor(Number(p.get('dranbleib')));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(MAX_LEVEL, n);
}
