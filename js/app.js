// Einstieg: Router und gemeinsamer Kontext für alle Bildschirme.
// Alle Bildschirme werden sofort geladen – so kann ein Update nie alte und neue Dateien mischen.
import { createStore, DRANBLEIB_GAMES } from './storage.js';
import { isTestMode } from './testmode.js';
import { setChildName, STATIONS, TOTAL } from './curriculum.js';
import { stopSpeech, loadClips, setVoiceName } from './speech.js';
import * as setup from './screens/setup.js';
import * as start from './screens/start.js';
import * as road from './screens/road.js';
import * as task from './screens/task.js';
import * as reward from './screens/reward.js';
import * as album from './screens/album.js';
import * as gallery from './screens/gallery.js';
import * as pick from './screens/pick.js';
import * as puzzles from './screens/puzzles.js';
import * as puzzlePlay from './screens/puzzle-play.js';
import * as worlds from './screens/worlds-pick.js';
import * as worldPlay from './screens/world-play.js';
import * as challenges from './screens/challenges-pick.js';
import * as challengePlay from './screens/challenge-play.js';
import * as dranbleib from './screens/dranbleib-pick.js';
import * as memoryPlay from './screens/memory-play.js';
import * as diffPlay from './screens/diff-play.js';
import * as garagePlay from './screens/garage-play.js';
import * as mazePlay from './screens/maze-play.js';
import { parseDranbleibParam } from './dranbleib.js';
import { startPlaytime } from './playtime-ui.js';
import { parsePlaytimeParams } from './playtime.js';

const SCREENS = { setup, start, road, task, reward, album, gallery, pick, puzzles, puzzlePlay, worlds, worldPlay, challenges, challengePlay, dranbleib, garagePlay, mazePlay, memoryPlay, diffPlay };
const SAFE_TO_RELOAD = new Set(['start', 'road', 'puzzles', 'worlds', 'challenges', 'dranbleib']);

const root = document.getElementById('app');
let cleanup = null;
let updateReady = false;

const ctx = {
  store: createStore(),
  testMode: isTestMode(location.search),
  go(name, params = {}) {
    // Neue Version installiert? Nur an ruhigen Stellen neu laden, nie mitten im Bild.
    if (updateReady && SAFE_TO_RELOAD.has(name)) { location.reload(); return; }
    stopSpeech();
    if (typeof cleanup === 'function') cleanup();
    root.innerHTML = '';
    setChildName(ctx.store.getName() || '');
    setVoiceName(ctx.store.getName() || '');
    const screen = SCREENS[name] || SCREENS.road;
    cleanup = screen.render(root, ctx, params) || null;
  },
};

document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());

loadClips();

// Spielzeit-Grenze: 30 Minuten, dann 3 Minuten Countdown, dann Pause bis zur PIN
startPlaytime(parsePlaytimeParams(location.search) || undefined);

// Testmodus für Eltern: ?test&dranbleib=3 setzt beide Dranbleib-Spiele auf Stufe 3, dranbleib=0 setzt zurück
const dranbleibParam = parseDranbleibParam(location.search);
if (dranbleibParam === 0) ctx.store.resetDranbleib();
else if (dranbleibParam) for (const g of DRANBLEIB_GAMES) ctx.store.setDranbleibLevel(g, dranbleibParam);

const stationParam = new URLSearchParams(location.search).get('station');
const station = stationParam === null || stationParam === '' ? NaN : Number(stationParam);
if (!ctx.store.getName()) ctx.go('setup');
else if (ctx.testMode && Number.isInteger(station) && station >= 0 && station < TOTAL) {
  setChildName(ctx.store.getName());
  ctx.go(STATIONS[station].type === 'pick' ? 'pick' : 'task', { stationIndex: station });
}
else ctx.go('start');

// Offline-Betrieb (nicht im Testmodus und nicht lokal, damit Änderungen sofort sichtbar sind)
if ('serviceWorker' in navigator && !ctx.testMode && location.hostname !== 'localhost') {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) updateReady = true; });
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
