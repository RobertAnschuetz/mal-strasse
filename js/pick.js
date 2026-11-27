// "Hör genau hin": Die Stimme nennt ein Zeichen, das Kind tippt es aus mehreren Karten an.
import { charLabel } from './motifs/letters.js';
import { circle, poly, star, rect } from './motifs/shapes.js';

export const PICK_LEVELS = 24;
const KINDS = ['symbol', 'letter', 'number'];

const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const NUMBERS = [...'0123456789'];

// Symbole: Formen als Pfad, Dinge als Emoji. label = so, wie die Stimme es sagt
export const SYMBOLS = [
  { value: 'kreis', label: 'der Kreis', d: circle(100, 100, 70), color: '#29B6F6' },
  { value: 'dreieck', label: 'das Dreieck', d: poly([100, 28], [178, 166], [22, 166]), color: '#FDD835' },
  { value: 'viereck', label: 'das Viereck', d: rect(36, 36, 128, 128, 10), color: '#43A047' },
  { value: 'stern', label: 'der Stern', d: star(100, 106, 82, 36, 5), color: '#FB8C00' },
  { value: 'herz', label: 'das Herz', d: 'M 100 170 C 20 115 20 40 70 40 C 90 40 100 55 100 65 C 100 55 110 40 130 40 C 180 40 180 115 100 170 Z', color: '#E53935' },
  { value: 'sonne', label: 'die Sonne', emoji: '☀️' },
  { value: 'mond', label: 'der Mond', emoji: '🌙' },
  { value: 'auto', label: 'das Auto', emoji: '🚗' },
  { value: 'bus', label: 'der Bus', emoji: '🚌' },
  { value: 'stoppschild', label: 'das Stoppschild', emoji: '🛑' },
  { value: 'ampel', label: 'die Ampel', emoji: '🚦' },
  { value: 'teddy', label: 'der Teddy', emoji: '🧸' },
  { value: 'ball', label: 'der Ball', emoji: '⚽' },
  { value: 'baum', label: 'der Baum', emoji: '🌳' },
  { value: 'haus', label: 'das Haus', emoji: '🏠' },
  { value: 'blume', label: 'die Blume', emoji: '🌼' },
  // Neue Gruppen für Folgen (Obst, Gemüse, Tiere, Fahrzeuge)
  ...[['apfel', 'der Apfel', '🍎'], ['banane', 'die Banane', '🍌'], ['birne', 'die Birne', '🍐'], ['erdbeere', 'die Erdbeere', '🍓'],
    ['kirsche', 'die Kirsche', '🍒'], ['traube', 'die Traube', '🍇'], ['orange', 'die Orange', '🍊'], ['zitrone', 'die Zitrone', '🍋'],
    ['melone', 'die Melone', '🍉'], ['ananas', 'die Ananas', '🍍']].map(([value, label, emoji]) => ({ value, label, emoji, cat: 'obst' })),
  ...[['karotte', 'die Karotte', '🥕'], ['brokkoli', 'der Brokkoli', '🥦'], ['tomate', 'die Tomate', '🍅'], ['gurke', 'die Gurke', '🥒'],
    ['mais', 'der Mais', '🌽'], ['paprika', 'die Paprika', '🫑'], ['kartoffel', 'die Kartoffel', '🥔'], ['zwiebel', 'die Zwiebel', '🧅'],
    ['aubergine', 'die Aubergine', '🍆'], ['pilz', 'der Pilz', '🍄']].map(([value, label, emoji]) => ({ value, label, emoji, cat: 'gemuese' })),
  ...[['hund', 'der Hund', '🐶'], ['katze', 'die Katze', '🐱'], ['kuh', 'die Kuh', '🐮'], ['schwein', 'das Schwein', '🐷'],
    ['pferd', 'das Pferd', '🐴'], ['huhn', 'das Huhn', '🐔'], ['schaf', 'das Schaf', '🐑'], ['ente', 'die Ente', '🦆'],
    ['fisch', 'der Fisch', '🐟'], ['maus', 'die Maus', '🐭']].map(([value, label, emoji]) => ({ value, label, emoji, cat: 'tier' })),
  ...[['zug', 'der Zug', '🚂'], ['flugzeug', 'das Flugzeug', '✈️'], ['schiff', 'das Schiff', '🚢'], ['fahrrad', 'das Fahrrad', '🚲'],
    ['traktor', 'der Traktor', '🚜'], ['hubschrauber', 'der Hubschrauber', '🚁'], ['feuerwehrauto', 'das Feuerwehrauto', '🚒'],
    ['rakete', 'die Rakete', '🚀']].map(([value, label, emoji]) => ({ value, label, emoji, cat: 'fahrzeug' })),
].map((s) => ({
  cat: ['kreis', 'dreieck', 'viereck', 'stern', 'herz'].includes(s.value) ? 'form' : ['auto', 'bus'].includes(s.value) ? 'fahrzeug' : 'ding',
  ...s,
  id: `S-${s.value}`,
  kind: 'symbol',
}));

// Leicht zu verwechseln – am Anfang nie zusammen, später absichtlich
const LOOK_ALIKES = [
  ['O', 'Q', 'C', 'G', 'D'], ['E', 'F'], ['M', 'W', 'N'], ['P', 'R', 'B'], ['I', 'L', 'T', 'J'],
  ['U', 'V'], ['K', 'X', 'Y'], ['A', 'H'],
  ['6', '9'], ['1', '7'], ['3', '8'], ['2', '5'], ['0', '8'],
  ['kreis', 'ball', 'sonne'], ['auto', 'bus'], ['stern', 'sonne'], ['viereck', 'haus'], ['baum', 'blume'],
];
const lookAlikesOf = (v) => [...new Set(LOOK_ALIKES.filter((g) => g.includes(v)).flat())].filter((x) => x !== v);

const letterItem = (v) => ({ id: `L-${v}`, kind: 'letter', cat: 'letter', value: v, label: charLabel(v) });
const numberItem = (v) => ({ id: `N-${v}`, kind: 'number', cat: 'number', value: v, label: charLabel(v) });

/** Gruppen, aus denen Folgen gebildet werden. */
export const CATEGORIES = {
  letter: LETTERS.map(letterItem),
  number: NUMBERS.map(numberItem),
  obst: SYMBOLS.filter((x) => x.cat === 'obst'),
  gemuese: SYMBOLS.filter((x) => x.cat === 'gemuese'),
  tier: SYMBOLS.filter((x) => x.cat === 'tier'),
  fahrzeug: SYMBOLS.filter((x) => x.cat === 'fahrzeug'),
};
const SEQ_CATS = Object.keys(CATEGORIES);

/** Wie viele Dinge hintereinander: erst eins, ab Hör-Schild 11 zwei, ab 17 drei. */
export const sequenceLength = (level) => (level < 10 ? 1 : level < 16 ? 2 : 3);

/** Name ohne Artikel für Aufzählungen ("Apfel", "Sieben", "M"). */
export function itemWord(item) {
  if (item.kind === 'letter') return item.value;
  const label = item.label || charLabel(item.value);
  return label.split(' ').slice(1).join(' ');
}
const allOf = (kind) => (kind === 'letter' ? LETTERS.map(letterItem) : kind === 'number' ? NUMBERS.map(numberItem) : SYMBOLS);

/** Kleiner, wiederholbarer Zufallsgenerator (mulberry32). */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rng) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Anzahl der Karten: 2 am Anfang, bis zu 6 am Ende. */
export function optionCount(level) {
  if (level < 4) return 2;
  if (level < 9) return 3;
  if (level < 14) return 4;
  if (level < 19) return 5;
  return 6;
}

function targetPool(kind, level, nameLetters) {
  if (level >= 6) return allOf(kind);
  if (kind === 'letter') return nameLetters.map(letterItem);
  if (kind === 'number') return [...'12345'].map(numberItem);
  return SYMBOLS.slice(0, 8);
}

/** Drei Fragen für eine Station. Jede Frage hat eine Folge (sequence) von 1–3 Dingen; target = das erste. */
export function makeRounds(level, nameLetters, rng = Math.random) {
  const n = optionCount(level);
  const len = sequenceLength(level);
  const used = new Set();
  const rounds = [];
  for (let r = 0; r < 3; r++) {
    if (len > 1) {
      // Folge: mehrere Dinge aus einer Gruppe, in dieser Reihenfolge antippen
      const cat = SEQ_CATS[Math.floor(rng() * SEQ_CATS.length)];
      const pool = CATEGORIES[cat];
      const sequence = shuffle(pool.filter((x) => !used.has(x.id)), rng).slice(0, len);
      sequence.forEach((x) => used.add(x.id));
      const rest = pool.filter((x) => !sequence.includes(x));
      const similar = level >= 14 ? lookAlikesOf(sequence[0].value) : [];
      const alike = shuffle(rest.filter((x) => similar.includes(x.value)), rng).slice(0, 2);
      const distractors = [...alike, ...shuffle(rest.filter((x) => !alike.includes(x)), rng)];
      rounds.push({ target: sequence[0], sequence, options: shuffle([...sequence, ...distractors.slice(0, n - len)], rng) });
      continue;
    }
    const kind = level < 6 ? KINDS[level % 3] : KINDS[(level + r) % 3];
    const pool = targetPool(kind, level, nameLetters).filter((x) => !used.has(x.id));
    const target = shuffle(pool, rng)[0];
    used.add(target.id);

    const similar = lookAlikesOf(target.value);
    const others = allOf(kind).filter((x) => x.id !== target.id);
    let distractors;
    if (level < 9) {
      distractors = shuffle(others.filter((x) => !similar.includes(x.value)), rng);
    } else if (level >= 14) {
      const alike = shuffle(others.filter((x) => similar.includes(x.value)), rng).slice(0, 2);
      distractors = [...alike, ...shuffle(others.filter((x) => !alike.includes(x)), rng)];
    } else {
      distractors = shuffle(others, rng);
    }
    rounds.push({ target, sequence: [target], options: shuffle([target, ...distractors.slice(0, n - 1)], rng) });
  }
  return rounds;
}

/** Was die Stimme fragt. */
export function pickPrompt(item) {
  const label = item.label || charLabel(item.value);
  return `Wo ist ${label}?`;
}
