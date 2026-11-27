// Alle Sätze, die die App spricht – an einer Stelle, damit sie vorab aufgenommen werden können.
// Kein Satz enthält den Namen des Kindes: die Aufnahmen liegen öffentlich bei der App.
import { DRAW_STATIONS, WORDS, stationPrompt, FILL_PHASE_PROMPT } from './curriculum.js';
import { MOTIFS } from './motifs/catalog.js';
import { CHARS, charLabel } from './motifs/letters.js';
import { SYMBOLS, CATEGORIES, pickPrompt, itemWord } from './pick.js';
import { WORLDS, foundSentence, fitsSentence, WORLD_DONE, WORLDS_PICK } from './worlds.js';
import { CHALLENGES, CHALLENGE_PHRASES } from './challenges.js';
import { DRANBLEIB_PHRASES } from './dranbleib.js';
import { PENALTY_PHRASE, PENALTY_OVER } from './penalty.js';
import { PLAYTIME_PHRASES } from './playtime.js';

export const GREETING = 'Hallo! Wollen wir malen?';
export const ROAD_HINT = 'Tipp auf das leuchtende Schild!';
export const ALL_DONE = 'Du hast alles geschafft! Du bist ein echter Mal-König!';
export const NEW_STICKER = 'Hier ist ein neuer Sticker für dich!';
export const ALBUM_EMPTY = 'Hier kommen deine Sticker hin!';
export const ALBUM_FIRST = 'Dein erster Sticker!';
export const ALBUM_MANY = 'Schau mal, deine Sticker!';
export const GALLERY_EMPTY = 'Hier kommen deine Bilder hin!';
export const GALLERY = 'Deine Bilder! Wunderschön!';
export const RESTART_Q = 'Nochmal von vorn anfangen?';
export const HOME_Q = 'Zurück zur Straße?';
export const PICK_INTRO = 'Hör genau hin!';
export const SEQ_INTRO = 'Hör gut zu und tipp nacheinander!';
export const PUZZLE_WORLD = 'Such dir ein Puzzle aus!';
export const PUZZLE_START = 'Puzzle-Zeit! Zieh die Teile an die richtige Stelle.';
export const PUZZLE_DONE = 'Super! Das Puzzle ist fertig!';

export const PRAISE = [
  'Super gemacht!',
  'Toll gemacht!',
  'Wow, das ist wunderschön!',
  'Klasse! Das hast du prima gemalt.',
  'Juhu! Geschafft!',
  'Du bist ein echter Künstler!',
  'Spitze! Weiter geht die Fahrt!',
  'Hurra! Das sieht richtig gut aus.',
  'Fantastisch!',
];

export const ENCOURAGE = [
  'Fast geschafft!',
  'Gleich hast du es!',
  'Prima, mach noch ein bisschen weiter!',
  'Das wird toll! Noch ein kleines bisschen.',
  'Weiter so!',
];

export const RIGHT = ['Richtig!', 'Super!', 'Genau!', 'Toll!', 'Prima!'];

export const HINT_TRACE_START = 'Fahr mit dem Stift die Punkte nach!';
export const HINT_FILL_START = 'Nimm einen Stift und mal los!';
export const HINT_TRACE_SPILL = 'Bleib ganz nah an den Punkten.';
export const HINT_FILL_SPILL = 'Versuch, in den Linien zu bleiben.';
export const HINT_TRACE_MISS = 'Fahr noch hier entlang!';
export const HINT_FILL_MISS = 'Da fehlt noch ein bisschen Farbe.';
export const HINTS = [HINT_TRACE_START, HINT_FILL_START, HINT_TRACE_SPILL, HINT_FILL_SPILL, HINT_TRACE_MISS, HINT_FILL_MISS];

export const regionHint = (label) => `Schau mal, ${label} braucht noch Farbe!`;
/** "Das ist die Fünf." – nach einem falschen Tipp */
export const pickIs = (item) => `Das ist ${item.label || charLabel(item.value)}.`;

/** Gleiche Sätze → gleicher Dateiname (FNV-1a über den normalisierten Text). */
export const normalize = (text) => String(text).trim().replace(/\s+/g, ' ');
export function clipKey(text) {
  let h = 0x811c9dc5;
  for (const ch of normalize(text)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** Alle Sätze, die aufgenommen werden. */
export function allPhrases() {
  const out = new Set([GREETING, ROAD_HINT, ALL_DONE, NEW_STICKER, ALBUM_EMPTY, ALBUM_FIRST, ALBUM_MANY,
    GALLERY_EMPTY, GALLERY, RESTART_Q, HOME_Q, PICK_INTRO, SEQ_INTRO, FILL_PHASE_PROMPT, PUZZLE_WORLD, PUZZLE_START, PUZZLE_DONE,
    ...PRAISE, ...ENCOURAGE, ...RIGHT, ...HINTS, PENALTY_PHRASE, PENALTY_OVER, ...Object.values(PLAYTIME_PHRASES)]);
  for (const s of DRAW_STATIONS) if (!s.char) out.add(stationPrompt(s));
  for (const c of CHARS) {
    out.add(stationPrompt({ type: 'charFill', char: c }));
    out.add(stationPrompt({ type: 'charWrite', char: c }));
  }
  out.add(stationPrompt({ type: 'pick' }));
  out.add(stationPrompt({ type: 'word', wordIndex: 0 }));
  WORDS.forEach(([word, say], i) => out.add(stationPrompt({ type: 'word', wordIndex: i + 1, word, say })));
  for (const m of Object.values(MOTIFS)) for (const r of m.regions) out.add(regionHint(r.label));
  const items = [...CHARS.map((c) => ({ value: c, label: charLabel(c) })), ...SYMBOLS];
  for (const it of items) { out.add(pickPrompt(it)); out.add(pickIs(it)); }
  out.add(WORLD_DONE); out.add(WORLDS_PICK);
  for (const c of CHALLENGES) out.add(c.intro);
  for (const t of Object.values(DRANBLEIB_PHRASES)) out.add(t);
  for (const t of [CHALLENGE_PHRASES.pick, CHALLENGE_PHRASES.countdown, CHALLENGE_PHRASES.tenLeft, CHALLENGE_PHRASES.timeUp, ...CHALLENGE_PHRASES.stars]) out.add(t);
  for (const w of WORLDS) {
    out.add(w.question);
    for (const m of w.misfits) out.add(foundSentence(w, m));
    for (const f of w.fits) out.add(fitsSentence(w, f));
  }
  for (const list of Object.values(CATEGORIES)) for (const it of list) { out.add(itemWord(it)); out.add(pickPrompt(it)); out.add(pickIs(it)); }
  return new Set([...out].map(normalize));
}

// ---------- Name für die iPad-Stimme ----------
// Aufnahmen bleiben ohne Namen (sie sind öffentlich). Spricht die iPad-Stimme, darf sie das Kind beim Namen nennen –
// der Name bleibt dabei auf dem Gerät.
const PERSONAL = new Map([
  [GREETING, 'Hallo {n}! Wollen wir malen?'],
  [PICK_INTRO, 'Hör genau hin, {n}!'],
  [ALL_DONE, '{n}, du hast alles geschafft! Du bist ein echter Mal-König!'],
  [ALBUM_FIRST, 'Dein erster Sticker, {n}!'],
  [ALBUM_MANY, 'Schau mal, {n}, deine Sticker!'],
  [GALLERY, 'Deine Bilder, {n}! Wunderschön!'],
  [PUZZLE_WORLD, 'Such dir ein Puzzle aus, {n}!'],
  [PUZZLE_DONE, 'Super, {n}! Das Puzzle ist fertig!'],
  [WORLD_DONE, 'Super, {n}! Du hast alles gefunden!'],
  [WORLDS_PICK, 'Such dir eine Welt aus, {n}!'],
  ['Du hast drei Sterne! Super!', 'Du hast drei Sterne, {n}! Super!'],
  ['Toll! Du hast alle Runden geschafft!', 'Toll, {n}! Du hast alle Runden geschafft!'],
  ['Du bist drangeblieben! Dafür gibt es einen Dranbleib-Stern!', 'Du bist drangeblieben, {n}! Dafür gibt es einen Dranbleib-Stern!'],
  ['Such dir ein Zeit-Spiel aus!', 'Such dir ein Zeit-Spiel aus, {n}!'],
  ['Super gemacht!', 'Super gemacht, {n}!'],
  ['Toll gemacht!', 'Toll gemacht, {n}!'],
  ['Wow, das ist wunderschön!', 'Wow, {n}, das ist wunderschön!'],
  ['Klasse! Das hast du prima gemalt.', 'Klasse, {n}! Das hast du prima gemalt.'],
  ['Juhu! Geschafft!', 'Juhu, {n}! Geschafft!'],
  ['Du bist ein echter Künstler!', 'Du bist ein echter Künstler, {n}!'],
  ['Spitze! Weiter geht die Fahrt!', 'Spitze, {n}! Weiter geht die Fahrt!'],
  ['Hurra! Das sieht richtig gut aus.', 'Hurra, {n}! Das sieht richtig gut aus.'],
  ['Fantastisch!', 'Fantastisch, {n}!'],
]);

/** Satz mit Namen für die iPad-Stimme (ohne Namen oder bei anderen Sätzen: unverändert). */
export function personalize(text, name) {
  const n = String(name || '').trim();
  if (!n) return text;
  const t = normalize(text);
  if (PERSONAL.has(t)) return PERSONAL.get(t).replaceAll('{n}', n);
  let m = t.match(/^(Mal .+ bunt an)!$/);
  if (m) return `${m[1]}, ${n}!`;
  m = t.match(/^(Fahr (?:zuerst )?die Linien nach)\. (.*)$/);
  if (m) return `${m[1]}, ${n}. ${m[2]}`;
  m = t.match(/^(Schreib .+?)! (.*)$/);
  if (m) return `${m[1]}, ${n}! ${m[2]}`;
  m = t.match(/^Das ist (das|die) (.+?)\. Mal es bunt an!$/);
  if (m) {
    const initial = n.charAt(0).toUpperCase();
    const extra = m[1] === 'das' && m[2] === initial ? ` ${initial} wie ${n}!` : '';
    return `Das ist ${m[1]} ${m[2]}.${extra} Mal es bunt an, ${n}!`;
  }
  return text;
}

// ---------- Buchstaben deutlich sprechen ----------
// Die Stimme liest ein einzelnes "M" sonst kurz und verschluckt es. Darum: Buchstabe einzeln,
// mit seinem deutschen Namen, langsam und mit kleiner Pause davor und danach.
export const LETTER_NAMES = {
  A: 'Aa', B: 'Beh', C: 'Zeh', D: 'Deh', E: 'Eh', F: 'Eff', G: 'Geh', H: 'Haa', I: 'Ih', J: 'Jott',
  K: 'Kaa', L: 'Ell', M: 'Emm', N: 'Enn', O: 'Oh', P: 'Peh', Q: 'Kuh', R: 'Err', S: 'Ess', T: 'Teh',
  U: 'Uh', V: 'Fau', W: 'Weh', X: 'Ix', Y: 'Ypsilon', Z: 'Zett',
};
const LONE_LETTER = /(?<![\p{L}\d])([A-Z])(?![\p{L}\d])/u;

/** Zerlegt einen Satz in Stücke; einzelne Buchstaben werden eigene, langsame Stücke (slow). */
export function speechChunks(text) {
  const out = [];
  let rest = String(text);
  for (let m = rest.match(LONE_LETTER); m; m = rest.match(LONE_LETTER)) {
    const before = rest.slice(0, m.index);
    if (/[\p{L}\d]/u.test(before)) out.push({ text: before.trim(), slow: false });
    out.push({ text: LETTER_NAMES[m[1]], slow: true });
    rest = rest.slice(m.index + 1);
  }
  if (/[\p{L}\d]/u.test(rest)) out.push({ text: rest.replace(/^[\s.,!?]+(?=[\p{L}\d])/u, '').trim(), slow: false });
  return out;
}
