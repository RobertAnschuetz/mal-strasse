// Sprachausgabe: vorab aufgenommene Sätze (natürliche Stimme), sonst die deutsche Systemstimme des iPads.
import { clipKey, personalize, speechChunks } from './phrases.js';
import { getAudioContext } from './sound.js';
const FEMALE = ['anna', 'helena', 'petra', 'marlene', 'sandy', 'shelley', 'vicki', 'katja', 'hedda'];
const MALE = ['markus', 'yannick', 'martin', 'reed', 'eddy', 'rocko', 'grandpa', 'stefan'];
const ENHANCED = /premium|erweitert|enhanced/i;

const isGerman = (voice) => /^de([-_]|$)/i.test(voice.lang || '');
const hasName = (voice, names) => names.some((n) => (voice.name || '').toLowerCase().includes(n));

function rank(voice) {
  const female = hasName(voice, FEMALE);
  if (female && ENHANCED.test(voice.name)) return 4;
  if (female) return 3;
  if (!hasName(voice, MALE)) return 2;
  return 1;
}

export function pickVoice(voices) {
  const german = (voices || []).filter(isGerman);
  if (!german.length) return null;
  return german.reduce((best, v) => (rank(v) > rank(best) ? v : best));
}

export const fillName = (text, name) => String(text).replaceAll('{name}', name || '');

export const randomFrom = (list, rng = Math.random) => list[Math.min(list.length - 1, Math.floor(rng() * list.length))];


const synth = () => globalThis.speechSynthesis || null;
let voice = null;

function loadVoice() {
  const s = synth();
  if (!s) return;
  voice = pickVoice(s.getVoices()) || voice;
}

/** Beim ersten Tipp aufrufen – iPadOS erlaubt Sprache erst nach einer Berührung. */
export function unlockSpeech() {
  const s = synth();
  if (!s) return;
  loadVoice();
  s.addEventListener?.('voiceschanged', loadVoice);
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    s.speak(u);
  } catch { /* egal */ }
}

// ---------- Aufnahmen (menschliche Stimme) mit iPad-Stimme als Notlösung ----------
let clips = new Set();
let voiceImpl = null; // nur für Tests
let token = 0;
let currentSource = null;
const buffers = new Map();

let voiceName = '';
/** Name des Kindes für die iPad-Stimme (Aufnahmen bleiben ohne Namen). */
export function setVoiceName(name) { voiceName = name || ''; }

/** Nur für Tests: eigene Abspiel-Funktionen einsetzen (null = Standard). */
export function configureVoice(impl) { voiceImpl = impl; }

/** Liste der vorhandenen Aufnahmen laden (audio/manifest.json). */
export async function loadClips() {
  try {
    const res = await fetch('audio/manifest.json');
    if (res.ok) clips = new Set(await res.json());
  } catch { /* keine Aufnahmen – iPad-Stimme */ }
}

async function playClip(key) {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') throw new Error('Ton noch nicht freigeschaltet');
  let buf = buffers.get(key);
  if (!buf) {
    const data = await (await fetch(`audio/${key}.mp3`)).arrayBuffer();
    buf = await new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject));
    buffers.set(key, buf);
  }
  await new Promise((resolve) => {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.onended = resolve;
    currentSource = src;
    src.start();
  });
}

function speakUtterance(s, text, rate) {
  return new Promise((resolve) => {
    try {
      if (!voice) loadVoice();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice?.lang || 'de-DE';
      if (voice) u.voice = voice;
      u.rate = rate;
      u.pitch = 1.1;
      u.onend = resolve;
      u.onerror = resolve;
      s.speak(u);
    } catch {
      resolve();
    }
  });
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

/** iPad-Stimme. Einzelne Buchstaben kommen langsam und abgesetzt, damit man sie gut versteht. */
async function speakTTS(text) {
  const s = synth();
  if (!s || typeof SpeechSynthesisUtterance === 'undefined') return;
  const my = token;
  for (const chunk of speechChunks(text)) {
    if (my !== token) return;
    if (chunk.slow) {
      await pause(200);
      await speakUtterance(s, chunk.text, 0.6);
      await pause(350);
    } else {
      await speakUtterance(s, chunk.text, 0.95);
    }
  }
}

const defaultImpl = { has: (key) => clips.has(key), play: playClip, speak: speakTTS };
const limit = (promise, ms) => Promise.race([promise, new Promise((r) => setTimeout(r, ms))]);

function stopCurrent() {
  try { currentSource?.stop(); } catch { /* schon zu Ende */ }
  currentSource = null;
  try { synth()?.cancel(); } catch { /* egal */ }
}

/** Beendet jede laufende Ansage (z. B. beim Bildschirmwechsel). */
export function stopSpeech() {
  token++;
  stopCurrent();
}

/**
 * Spricht einen Satz oder mehrere Satzteile nacheinander. Bricht eine laufende Ansage ab.
 * Aufgenommene Sätze klingen menschlich; fehlt eine Aufnahme, spricht die iPad-Stimme. Löst immer auf.
 */
export async function sage(textOrParts) {
  const parts = (Array.isArray(textOrParts) ? textOrParts : [textOrParts]).filter(Boolean);
  const my = ++token;
  stopCurrent();
  for (const part of parts) {
    if (my !== token) return;
    const impl = voiceImpl || defaultImpl;
    const key = clipKey(part);
    try {
      if (impl.has(key)) await limit(impl.play(key), 10000);
      else await limit(impl.speak(personalize(part, voiceName)), 8000);
    } catch {
      if (my === token) await limit(impl.speak(personalize(part, voiceName)), 8000);
    }
  }
}
