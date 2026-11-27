// Spielzeit-Grenze: nach 30 Minuten kommt ein 3-Minuten-Countdown, danach schläft die App,
// bis ein Erwachsener die PIN eingibt. Rein, ohne Browser.
import { clipKey } from './phrases.js';

export const LIMIT_MS = 30 * 60 * 1000;
export const WARN_MS = 3 * 60 * 1000;
// Die PIN steht nicht im Klartext im Code, nur ihr Prüfwert.
const PIN_CHECK = 'fc82e972';
export const PIN_LENGTH = 4;

export const PLAYTIME_PHRASES = {
  warn: 'Noch drei Minuten, dann macht die Mal-Straße Pause.',
  oneMinute: 'Noch eine Minute!',
  locked: 'Jetzt ist Pause. Bis später!',
};

export const checkPin = (pin) => String(pin).length === PIN_LENGTH && clipKey(`pin:${pin}`) === PIN_CHECK;

/** Gespeicherten Stand lesen; unbrauchbare Werte werden zu einem frischen Stand. */
export function normalize(raw, today) {
  const s = raw && typeof raw === 'object' ? raw : {};
  return {
    day: typeof s.day === 'string' ? s.day : today,
    played: Number.isFinite(s.played) && s.played >= 0 ? s.played : 0,
    locked: s.locked === true,
  };
}

/**
 * Zeit vergeht (nur während gespielt wird). Liefert neuen Stand, Phase und neue Ereignisse.
 * Ein neuer Tag fängt bei 0 an – aber nur, wenn die App nicht gesperrt ist (Sperre hebt nur die PIN auf).
 * limits: { limit, warn } in ms (für den Testmodus kürzer).
 */
export function tick(state, deltaMs, today, { limit = LIMIT_MS, warn = WARN_MS } = {}) {
  let s = { ...state };
  if (!s.locked && s.day !== today) s = { day: today, played: 0, locked: false };
  const events = [];
  if (s.locked) return { state: s, phase: 'locked', remainingMs: 0, events };
  const before = s.played;
  s.played = before + Math.max(0, Math.min(deltaMs, 5000)); // große Sprünge (Schlaf, Hintergrund) zählen nicht
  const end = limit + warn;
  if (before < limit && s.played >= limit) events.push('warn');
  if (before < end - 60000 && s.played >= end - 60000 && s.played >= limit && warn > 60000) events.push('oneMinute');
  if (s.played >= end) { s.locked = true; events.push('locked'); }
  const phase = s.locked ? 'locked' : s.played >= limit ? 'warn' : 'play';
  return { state: s, phase, remainingMs: Math.max(0, end - s.played), events };
}

/** Richtige PIN: entsperrt und die Spielzeit fängt von vorne an. */
export const unlock = (today) => ({ day: today, played: 0, locked: false });

export const formatRemaining = (ms) => {
  const sec = Math.ceil(ms / 1000);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
};

/** Testmodus für Eltern: ?test&playlimit=20&playwarn=10 (Sekunden) verkürzt die Zeiten zum Ausprobieren. */
export function parsePlaytimeParams(search) {
  const p = new URLSearchParams(search || '');
  if (!p.has('test')) return null;
  const limit = Number(p.get('playlimit')), warn = Number(p.get('playwarn'));
  if (!(limit > 0)) return null;
  return { limit: limit * 1000, warn: (warn > 0 ? warn : 10) * 1000 };
}
