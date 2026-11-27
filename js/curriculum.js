// Die 100 Stationen der Straße. index 0 = erstes Schild.
import { MOTIFS } from './motifs/catalog.js';
import { charMotif, wordMotif } from './motifs/letters.js';
import { STICKERS } from './stickers.js';

// Bildstationen: index → [motifId, type]
const PICTURES = {
  // f = ausmalen, t = nachspuren, tf = erst nachspuren, dann ausmalen
  0: ['sonne', 'fill'], 1: ['ball', 'fill'], 2: ['muster-gerade', 'trace'], 4: ['stoppschild', 'fill'],
  6: ['wolke', 'trace'], 7: ['apfel', 'fill'], 9: ['mensch', 'fill'], 11: ['muster-zickzack', 'trace'],
  12: ['auto', 'fill'], 14: ['kreis-schild', 'trace'], 16: ['teddy-kopf', 'fill'], 17: ['muster-wellen', 'trace'],
  19: ['vorfahrt', 'trace'], 21: ['haus', 'fill'], 22: ['baum', 'fill'], 24: ['muster-berge', 'trace'],
  26: ['achtung-schild', 'trace'], 27: ['parkschild', 'fill'], 29: ['fisch', 'fill'], 31: ['muster-treppe', 'trace'],
  32: ['boot', 'traceFill'], 34: ['ampel', 'fill'], 36: ['deutschland', 'traceFill'], 37: ['hase', 'fill'],
  39: ['regenbogen', 'fill'], 41: ['schnecke', 'traceFill'], 42: ['muster-kreise', 'trace'], 44: ['bus', 'fill'],
  46: ['zug', 'traceFill'], 48: ['teddy', 'fill'], 50: ['italien', 'traceFill'], 52: ['lkw', 'fill'],
  54: ['muster-schlaufen', 'trace'], 55: ['stoppschild', 'traceFill'], 57: ['vogel', 'traceFill'], 59: ['polizeiauto', 'fill'],
  60: ['muster-burg', 'trace'], 62: ['rennauto', 'traceFill'], 64: ['traktor', 'fill'], 65: ['oesterreich', 'traceFill'],
  67: ['elefant-kuscheltier', 'fill'], 69: ['feuerwehr', 'traceFill'], 70: ['muster-spirale', 'trace'], 72: ['familie', 'fill'],
  74: ['bagger', 'traceFill'], 75: ['frankreich', 'traceFill'], 77: ['dino', 'fill'], 79: ['muster-achten', 'trace'],
  80: ['schloss', 'traceFill'], 82: ['schmetterling', 'fill'], 84: ['spanien', 'traceFill'], 85: ['flugzeug', 'traceFill'],
  87: ['auto-3', 'fill'], 89: ['muster-girlande', 'trace'], 90: ['teddy-2', 'fill'], 92: ['rakete', 'traceFill'],
  94: ['schmetterling', 'traceFill'], 96: ['tankstelle', 'traceFill'], 98: ['auto-3', 'traceFill'], 99: ['blume-gross', 'traceFill'],
};

const FILL_AT = [3, 5, 8, 10, 13, 15, 18, 20, 23, 25, 28, 30, 33, 35, 38, 40, 43, 45, 47, 49];
const WRITE_AT = [51, 53, 56, 58, 61, 63, 66, 68, 71, 73, 76, 78, 81, 83, 86, 88, 91, 93, 95, 97];
// Reihenfolge der übrigen Zeichen: leichte zuerst (die ersten 16 werden ausgemalt, die anderen 16 geschrieben)
const OTHER_ORDER = 'O I 1 2 M 3 E T 4 N 5 S H 6 B 7 C D 0 F G 8 J K 9 R V W X Y Z Q A U L P'.split(' ');
const PAD = ['A', 'E', 'I', 'O', 'U'];

/** Die (bis zu) vier ersten verschiedenen Buchstaben A–Z des Namens, mit Vokalen aufgefüllt. */
export function nameLetters(name) {
  const out = [];
  for (const ch of String(name || '').toUpperCase()) {
    if (/^[A-Z]$/.test(ch) && !out.includes(ch)) out.push(ch);
    if (out.length === 4) return out;
  }
  for (const v of PAD) {
    if (out.length === 4) break;
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

// Sticker verteilt über die Seiten: Station i → Seite i % 5
const stickerFor = (i) => STICKERS[(i % 5) * 20 + Math.floor(i / 5)].id;

/** Die 100 Mal-Stationen (index = level 0..99); die Buchstaben des Namens kommen zuerst. */
export const DRAW_STATIONS = [];
/** Die ganze Straße: je Block aus 4 Mal-Stationen ein Wort (nach der 2.) und eine Hör-Aufgabe (nach der 4.). */
export const STATIONS = [];
export const PICK_COUNT = 24;

// Wörter zum Schreiben. Das erste Wort ist immer der Name des Kindes (kommt zur Laufzeit vom Gerät).
export const WORDS = [
  ['OMA', 'Oma'], ['OPA', 'Opa'], ['MAMA', 'Mama'], ['PAPA', 'Papa'], ['TILLI', 'Tilli'], ['AUTO', 'Auto'],
  ['BUS', 'Bus'], ['ZUG', 'Zug'], ['BAHN', 'Bahn'], ['TOLL', 'toll'], ['LIEBE', 'Liebe'], ['ROT', 'rot'],
  ['KUH', 'Kuh'], ['BALL', 'Ball'], ['HAUS', 'Haus'], ['BAUM', 'Baum'], ['MAUS', 'Maus'], ['ENTE', 'Ente'],
  ['HASE', 'Hase'], ['MOND', 'Mond'], ['BOOT', 'Boot'], ['BLAU', 'blau'], ['SONNE', 'Sonne'], ['HALLO', 'hallo'],
];
export const WORD_COUNT = WORDS.length + 1;
export const TOTAL = 100 + PICK_COUNT + WORD_COUNT;

/** Name als Wort zum Schreiben: nur A–Z, Umlaute ausgeschrieben, höchstens 8 Buchstaben. */
export function nameWord(name) {
  const w = String(name || '').toUpperCase().replace(/Ä/g, 'AE').replace(/Ö/g, 'OE').replace(/Ü/g, 'UE').replace(/ß/g, 'SS').replace(/[^A-Z]/g, '').slice(0, 8);
  return w || 'ICH';
}

/** Feste Kennung jedes Schilds auf den bisherigen Straßen (1 = 100 Schilder, 2 = mit Hör-Aufgaben, 3 = mit Wörtern). */
export function roadKeys(version) {
  const keys = [];
  let pick = 0;
  for (let level = 0; level < 100; level++) {
    keys.push(`d${level}`);
    if (version >= 3 && level % 4 === 1) keys.push(`w${(level - 1) / 4}`);
    if (version >= 2 && level % 4 === 3 && pick < PICK_COUNT) keys.push(`p${pick++}`);
  }
  return keys;
}
const CURRENT = 3;
const currentIndexOf = new Map(roadKeys(CURRENT).map((k, i) => [k, i]));

/** Schild-Nummer einer älteren Straße → heutige Nummer. */
export const mapIndex = (i, fromVersion) => currentIndexOf.get(roadKeys(fromVersion)[i]);

/** Alte Stationsnummer (Straße mit 100 Schildern) → Nummer auf der 124er-Straße (nur noch für alte Spielstände). */
export const oldToNew = (i) => i + Math.floor(i / 4);

export function setChildName(name) {
  const first = nameLetters(name);
  const others = OTHER_ORDER.filter((c) => !first.includes(c));
  const fillChars = [...first, ...others.slice(0, 16)];
  const writeChars = [...first, ...others.slice(16, 32)];
  const STATIONS_OUT = DRAW_STATIONS;
  STATIONS_OUT.length = 0;
  for (let index = 0; index < 100; index++) {
    const stickerId = stickerFor(index);
    if (PICTURES[index]) {
      const [motifId, type] = PICTURES[index];
      STATIONS_OUT.push({ index, type, motifId, stickerId });
      continue;
    }
    let k = FILL_AT.indexOf(index);
    if (k >= 0) { STATIONS_OUT.push({ index, type: 'charFill', char: fillChars[k], stickerId }); continue; }
    k = WRITE_AT.indexOf(index);
    if (k >= 0) { STATIONS_OUT.push({ index, type: 'charWrite', char: writeChars[k], stickerId }); continue; }
    throw new Error(`Station ${index} ist nicht belegt`);
  }
  for (const d of DRAW_STATIONS) d.level = d.index;
  // Ganze Straße zusammensetzen
  const words = [[nameWord(name), null], ...WORDS];
  STATIONS.length = 0;
  for (const key of roadKeys(CURRENT)) {
    const n = Number(key.slice(1));
    if (key[0] === 'd') STATIONS.push({ ...DRAW_STATIONS[n], index: STATIONS.length });
    else if (key[0] === 'p') STATIONS.push({ index: STATIONS.length, type: 'pick', level: n, stickerId: `st-5-${n}` });
    else STATIONS.push({ index: STATIONS.length, type: 'word', level: n * 4 + 1, wordIndex: n, word: words[n][0], say: words[n][1], stickerId: `st-7-${n}` });
  }
}

/** Spielstand der 124er-Straße auf die heutige Straße übertragen. */
export function migrateProgressV2(old) {
  const map = (i) => (Number.isInteger(i) && i >= 0 && i < 124 ? mapIndex(i, 2) : undefined);
  const attempts = {};
  for (const [k, v] of Object.entries(old.attempts || {})) { const m = map(Number(k)); if (m !== undefined) attempts[m] = v; }
  return {
    ...old,
    version: 3,
    completed: (old.completed || []).map(map).filter((x) => x !== undefined).sort((a, b) => a - b),
    attempts,
    last: Number.isInteger(old.last) ? (map(old.last) ?? null) : null,
  };
}

/** Gespeicherten Fortschritt der alten 100er-Straße auf die neue Straße übertragen. */
export function migrateProgressV1(old) {
  const completed = new Set((old.completed || []).filter((i) => i >= 0 && i < 100).map(oldToNew));
  const stickers = new Set(old.stickers || []);
  const furthest = completed.size ? Math.max(...completed) : -1;
  // Hör-Aufgaben, die vor dem bisherigen Fortschritt liegen, gelten als geschafft (mit Sticker)
  roadKeys(2).forEach((key, i) => {
    if (key[0] === 'p' && i < furthest && !completed.has(i)) {
      completed.add(i);
      stickers.add(`st-5-${key.slice(1)}`);
    }
  });
  const attempts = {};
  for (const [k, v] of Object.entries(old.attempts || {})) {
    const i = Number(k);
    if (Number.isInteger(i) && i >= 0 && i < 100) attempts[oldToNew(i)] = v;
  }
  return { version: 2, name: old.name ?? null, completed: [...completed].sort((a, b) => a - b), stickers: [...stickers], attempts };
}

setChildName('');

export function motifFor(station) {
  if (station.type === 'pick') return null;
  if (station.type === 'word') return wordMotif(station.word, station.say || 'deinen Namen');
  if (station.type === 'charFill') return charMotif(station.char, 'fill');
  if (station.type === 'charWrite') return charMotif(station.char, 'write');
  return MOTIFS[station.motifId];
}

/** Anweisung für eine Station (ohne Namen – die Sätze werden vorab aufgenommen). */
export function stationPrompt(station) {
  if (station.type === 'pick') return 'Hör genau hin!';
  if (station.type === 'word') {
    return station.wordIndex === 0 ? 'Schreib deinen Namen! Fang beim grünen Punkt an.' : `Schreib das Wort ${station.say}! Fang beim grünen Punkt an.`;
  }
  const label = motifFor(station).label;
  switch (station.type) {
    case 'fill': return `Mal ${label} bunt an!`;
    case 'trace': return `Fahr die Linien nach. So malst du ${label}!`;
    case 'traceFill': return `Fahr zuerst die Linien nach. So malst du ${label}!`;
    case 'charFill': return `Das ist ${label}. Mal es bunt an!`;
    case 'charWrite': return `Schreib ${label}! Fang beim grünen Punkt an.`;
    default: return "Los geht's!";
  }
}

/** Ansage für die zweite Phase von traceFill. */
export const FILL_PHASE_PROMPT = 'Super! Und jetzt mal es bunt an!';
