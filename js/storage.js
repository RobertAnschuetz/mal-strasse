// Name, Fortschritt und Versuche – lokal auf dem Gerät.
import { TOTAL, migrateProgressV1, migrateProgressV2 } from './curriculum.js';
import { newMilestones } from './dranbleib.js';

export const DRANBLEIB_GAMES = ['maze', 'garage', 'memory', 'diff'];
const freshDranbleib = () => ({ levels: Object.fromEntries(DRANBLEIB_GAMES.map((g) => [g, 1])), stars: 0 });

const KEY = 'malstrasse.v1';
const VERSION = 3; // 3 = Straße mit Hör-Aufgaben und Wörtern (149 Schilder)
const fresh = () => ({ version: VERSION, name: null, completed: [], stickers: [], attempts: {}, last: null, puzzles: [], worlds: [], challenges: {}, dranbleib: freshDranbleib() });

function load(backend) {
  try {
    const raw = backend && backend.getItem(KEY);
    if (!raw) return fresh();
    let s = JSON.parse(raw);
    if (!s.version) s = migrateProgressV1(s); // alter Spielstand von der 100er-Straße
    if (s.version === 2) s = migrateProgressV2(s); // Spielstand von der 124er-Straße
    return {
      version: VERSION,
      name: typeof s.name === 'string' && s.name.trim() ? s.name : null,
      completed: Array.isArray(s.completed) ? s.completed.filter(Number.isInteger) : [],
      stickers: Array.isArray(s.stickers) ? s.stickers.filter((x) => typeof x === 'string') : [],
      attempts: s.attempts && typeof s.attempts === 'object' ? s.attempts : {},
      puzzles: Array.isArray(s.puzzles) ? s.puzzles.filter(Number.isInteger) : [],
      worlds: Array.isArray(s.worlds) ? s.worlds.filter((x) => typeof x === 'string') : [],
      challenges: s.challenges && typeof s.challenges === 'object' ? s.challenges : {},
      dranbleib: s.dranbleib && s.dranbleib.levels ? {
        levels: Object.fromEntries(DRANBLEIB_GAMES.map((g) => [g, Number(s.dranbleib.levels[g]) || 1])),
        stars: Number(s.dranbleib.stars) || 0,
      } : freshDranbleib(),
      // zuletzt geschafftes Schild (bei alten Spielständen: das höchste geschaffte)
      last: Number.isInteger(s.last) ? s.last : (Array.isArray(s.completed) && s.completed.length ? Math.max(...s.completed.filter(Number.isInteger)) : null),
    };
  } catch {
    return fresh();
  }
}

function defaultBackend() {
  try { return globalThis.localStorage || null; } catch { return null; }
}

export function createStore(backend = defaultBackend()) {
  const state = load(backend);
  const save = () => {
    try { backend && backend.setItem(KEY, JSON.stringify(state)); } catch { /* weiter im Speicher */ }
  };

  save(); // umgewandelten alten Spielstand gleich sichern

  const store = {
    getName: () => state.name,
    setName(n) {
      const name = String(n ?? '').trim();
      if (!name) throw new Error('Name darf nicht leer sein');
      state.name = name;
      save();
    },
    getProgress: () => ({
      completed: [...state.completed],
      stickers: [...state.stickers],
      attempts: { ...state.attempts },
    }),
    /** Das nächste offene Schild nach dem zuletzt geschafften; sonst das erste offene; alles fertig → TOTAL. */
    nextStation() {
      const done = new Set(state.completed);
      const from = state.last === null ? 0 : state.last + 1;
      for (let i = from; i < TOTAL; i++) if (!done.has(i)) return i;
      for (let i = 0; i < TOTAL; i++) if (!done.has(i)) return i;
      return TOTAL;
    },
    /** Alle Level sind frei wählbar. */
    isUnlocked: (i) => Number.isInteger(i) && i >= 0 && i < TOTAL,
    completeStation(i, stickerId) {
      if (!state.completed.includes(i)) {
        state.completed.push(i);
        state.completed.sort((a, b) => a - b);
        if (stickerId && !state.stickers.includes(stickerId)) state.stickers.push(stickerId);
      }
      state.attempts[i] = 0;
      state.last = i;
      save();
    },
    getPuzzles: () => [...state.puzzles],
    getWorlds: () => [...state.worlds],
    getChallenges: () => ({ ...state.challenges }),
    getDranbleib: () => ({ levels: { ...state.dranbleib.levels }, stars: state.dranbleib.stars }),
    setDranbleibLevel(game, level) {
      state.dranbleib.levels[game] = Math.min(12, Math.max(1, Math.floor(level) || 1));
      save();
    },
    resetDranbleib() {
      state.dranbleib = freshDranbleib();
      save();
    },
    /** Einen Dranbleib-Stern dazu; liefert neue Sternzahl und neu verdiente Sticker. */
    addDranbleibStar() {
      const before = state.dranbleib.stars;
      state.dranbleib.stars = before + 1;
      const stickerIds = newMilestones(before, before + 1).map((m) => `st-10-${[5, 10, 20, 30, 50].indexOf(m)}`);
      for (const id of stickerIds) if (!state.stickers.includes(id)) state.stickers.push(id);
      save();
      return { stars: state.dranbleib.stars, stickerIds };
    },
    /** Bestwert eines Zeit-Spiels merken; gibt den Bestwert zurück. stickerId nur beim ersten Stern übergeben. */
    recordChallenge(id, score, stickerId) {
      state.challenges[id] = Math.max(state.challenges[id] || 0, score);
      if (stickerId && !state.stickers.includes(stickerId)) state.stickers.push(stickerId);
      save();
      return state.challenges[id];
    },
    completeWorld(id, stickerId) {
      if (!state.worlds.includes(id)) state.worlds.push(id);
      if (stickerId && !state.stickers.includes(stickerId)) state.stickers.push(stickerId);
      save();
    },
    completePuzzle(i, stickerId) {
      if (!state.puzzles.includes(i)) state.puzzles.push(i);
      state.puzzles.sort((a, b) => a - b);
      if (stickerId && !state.stickers.includes(stickerId)) state.stickers.push(stickerId);
      save();
    },
    recordFailedAttempt(i) {
      state.attempts[i] = (state.attempts[i] || 0) + 1;
      save();
      return state.attempts[i];
    },
  };
  return store;
}
