// Zeit-Spiele: in 60–120 Sekunden so viel wie möglich schaffen. Rein, ohne Browser.
import { nameWord } from './curriculum.js';

const T = (emoji, label) => ({ emoji, label });

const SIGNS = [T('🛑', 'das Stoppschild'), T('🚦', 'die Ampel'), T('⚠️', 'das Achtung-Schild'), T('⛔', 'das Verbotsschild'),
  T('🚸', 'das Kinder-Schild'), T('🅿️', 'das Parkschild'), T('🚧', 'die Baustelle'), T('🚏', 'die Haltestelle')];
const TREES = [T('🌳', 'der Laubbaum'), T('🌲', 'die Tanne'), T('🌴', 'die Palme'), T('🎄', 'der Weihnachtsbaum')];
const ANIMALS = [T('🐶', 'der Hund'), T('🐱', 'die Katze'), T('🐮', 'die Kuh'), T('🐷', 'das Schwein'), T('🐸', 'der Frosch'),
  T('🦁', 'der Löwe'), T('🐘', 'der Elefant'), T('🐵', 'der Affe'), T('🐰', 'der Hase'), T('🐻', 'der Bär'), T('🐔', 'das Huhn'), T('🦆', 'die Ente')];
const FRUIT = [T('🍎', 'der Apfel'), T('🍌', 'die Banane'), T('🍐', 'die Birne'), T('🍓', 'die Erdbeere'), T('🍒', 'die Kirsche'),
  T('🍇', 'die Traube'), T('🍊', 'die Orange'), T('🍋', 'die Zitrone'), T('🍉', 'die Melone'), T('🍍', 'die Ananas')];
const VEGGIES = [T('🥕', 'die Karotte'), T('🥦', 'der Brokkoli'), T('🥒', 'die Gurke'), T('🌽', 'der Mais'), T('🫑', 'die Paprika'),
  T('🥔', 'die Kartoffel'), T('🧅', 'die Zwiebel'), T('🍆', 'die Aubergine'), T('🍄', 'der Pilz')];
const THINGS = [T('🚗', 'das Auto'), T('⚽', 'der Ball'), T('🏠', 'das Haus'), T('🧸', 'der Teddy'), T('🚲', 'das Fahrrad'),
  T('🌻', 'die Blume'), T('✏️', 'der Stift'), T('🎈', 'der Luftballon'), T('📚', 'die Bücher'), T('🪨', 'der Stein'), T('🍄', 'der Pilz'), T('🌷', 'die Tulpe')];

export const CHALLENGES = [
  { id: 'schilder', name: 'Schilder-Jagd', icon: '🛑', seconds: 60, mode: 'find', intro: 'Tipp so schnell du kannst alle Schilder an!', good: SIGNS, bad: [...THINGS, ...ANIMALS.slice(0, 4)], stars: [6, 14, 24] },
  { id: 'baeume', name: 'Baum-Sammler', icon: '🌳', seconds: 60, mode: 'find', intro: 'Tipp so schnell du kannst alle Bäume an!', good: TREES, bad: [...THINGS, T('🌵', 'der Kaktus'), T('🍁', 'das Blatt')], stars: [6, 14, 24] },
  { id: 'tiere', name: 'Tier-Safari', icon: '🦁', seconds: 75, mode: 'find', intro: 'Tipp so schnell du kannst alle Tiere an!', good: ANIMALS, bad: [...THINGS, ...FRUIT.slice(0, 4)], stars: [8, 18, 30] },
  { id: 'obst', name: 'Obst-Markt', icon: '🍎', seconds: 90, mode: 'find', intro: 'Tipp nur das Obst an, kein Gemüse!', good: FRUIT, bad: VEGGIES, stars: [8, 18, 30] },
  { id: 'ballons', name: 'Ballon-Platzen', icon: '🎈', seconds: 60, mode: 'float', intro: 'Lass nur die roten Ballons platzen!', stars: [8, 18, 30] },
  { id: 'zahlen', name: 'Zahlen-Rennen', icon: '🔢', seconds: 90, mode: 'order', intro: 'Tipp die Zahlen der Reihe nach an! Fang immer bei eins an.', stars: [12, 28, 45] },
  { id: 'buchstaben', name: 'Buchstaben-Fang', icon: '🔤', seconds: 90, mode: 'find', intro: 'Finde die Buchstaben von deinem Namen!', stars: [8, 18, 28] },
  { id: 'sterne', name: 'Sternen-Fänger', icon: '⭐', seconds: 120, mode: 'fall', intro: 'Fang die Sterne! Wolken und Steine nicht.', stars: [12, 30, 50] },
].map((c, index) => ({ ...c, index, stickerId: `st-9-${index}` }));

export const BALLOON_COLORS = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#fb8c00'];
const STAR_GOOD = [T('⭐', 'der Stern'), T('🌟', 'der Stern')];
const STAR_BAD = [T('☁️', 'die Wolke'), T('🪨', 'der Stein'), T('🍂', 'das Blatt')];

function shuffle(list, rng) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Plätze auf einem Raster (5×4, ab 21 Dingen 6×4) mit etwas Zufall, ohne Überlappung. */
function spots(n, rng) {
  const cols = n > 20 ? 6 : 5, rows = 4, cw = 0.86 / cols, ch = 0.72 / rows;
  return shuffle(Array.from({ length: cols * rows }, (_, i) => i), rng).slice(0, n).map((cell) => {
    const c = cell % cols, r = Math.floor(cell / cols);
    return { x: 0.07 + cw * (c + 0.5) + (rng() - 0.5) * 0.3 * cw, y: 0.2 + ch * (r + 0.5) + (rng() - 0.5) * 0.3 * ch };
  });
}

/** Wie viele Dinge auf dem Feld liegen: mit jedem geschafften Feld (stage) mehr – 16, 20, dann 24. */
export const fieldSize = (stage = 0) => Math.min(24, 16 + 4 * Math.max(0, stage));
/** Zahlen-Rennen: erst bis 10, dann bis 15, dann bis 20. */
export const orderCount = (stage = 0) => (stage <= 0 ? 10 : stage === 1 ? 15 : 20);

/** Ein Feld für "Suchen" oder "Reihenfolge". stage = wie viele Felder in diesem Spiel schon geschafft sind. */
export function makeField(challenge, rng = Math.random, name = '', stage = 0) {
  if (challenge.mode === 'order') {
    const pos = spots(orderCount(stage), rng);
    return pos.map((p, i) => ({ ...p, value: String(i + 1), order: i + 1, good: true, label: String(i + 1) }));
  }
  const total = fieldSize(stage);
  let good, bad;
  if (challenge.id === 'buchstaben') {
    const letters = [...new Set(nameWord(name))];
    good = Array.from({ length: 6 }, (_, i) => letters[i % letters.length]).map((v) => ({ value: v, label: v }));
    const others = shuffle([...'ABCDEFGHIJKLMNOPRSTUVWZ'].filter((c) => !letters.includes(c)), rng);
    bad = Array.from({ length: total - good.length }, (_, i) => others[i % others.length]).map((v) => ({ value: v, label: v }));
  } else {
    const goodCount = 4 + Math.floor(rng() * 3);
    good = Array.from({ length: goodCount }, (_, i) => shuffle(challenge.good, rng)[i % challenge.good.length]);
    // gleiche Dinge dürfen mehrfach vorkommen (z. B. mehrere Tannen); falsche Dinge bunt gemischt
    const others = shuffle(challenge.bad, rng);
    bad = Array.from({ length: total - goodCount }, (_, i) => others[i % others.length]);
  }
  const items = shuffle([...good.map((x) => ({ ...x, good: true })), ...bad.map((x) => ({ ...x, good: false }))], rng);
  const pos = spots(items.length, rng);
  return items.map((it, i) => ({ ...it, ...pos[i] }));
}

/** Tempo im Spiel: am Anfang 1, zum Ende hin doppelt so schnell. progress = 0 (Start) bis 1 (Zeit um). */
export const tempo = (progress = 0) => 1 + Math.min(1, Math.max(0, progress));

/** Abstand bis zum nächsten fliegenden Ding in ms – wird mit der Zeit immer kürzer. */
export const spawnDelay = (challenge, progress = 0) => Math.round((challenge.mode === 'float' ? 650 : 560) / tempo(progress));

/** Ein neues fliegendes Ding (Ballon steigt auf, Stern fällt). speed = Bildschirmhöhen pro Sekunde. */
export function makeSpawn(challenge, rng = Math.random, progress = 0) {
  const good = rng() < 0.45;
  const x = 0.08 + rng() * 0.84;
  const t = tempo(progress);
  if (challenge.mode === 'float') {
    const color = good ? BALLOON_COLORS[0] : BALLOON_COLORS[1 + Math.floor(rng() * (BALLOON_COLORS.length - 1))];
    return { good, x, color, speed: (0.2 + rng() * 0.12) * t, label: good ? 'der rote Ballon' : 'ein anderer Ballon' };
  }
  const pick = good ? STAR_GOOD : STAR_BAD;
  return { good, x, ...pick[Math.floor(rng() * pick.length)], speed: (0.22 + rng() * 0.14) * t };
}

/** Sterne für eine Punktzahl (0–3). */
export const starsFor = (challenge, score) => challenge.stars.filter((t) => score >= t).length;

export const CHALLENGE_PHRASES = {
  pick: 'Such dir ein Zeit-Spiel aus!',
  countdown: 'Drei, zwei, eins, los!',
  tenLeft: 'Noch zehn Sekunden!',
  timeUp: 'Zeit ist um!',
  stars: ['Probier es gleich nochmal!', 'Du hast einen Stern!', 'Du hast zwei Sterne!', 'Du hast drei Sterne! Super!'],
};
