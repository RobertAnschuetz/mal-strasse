// Spielzeit-Grenze im Browser: zählt die Zeit, zeigt den Countdown und den Pausen-Bildschirm mit PIN.
import { normalize, tick, unlock, checkPin, formatRemaining, PIN_LENGTH, PLAYTIME_PHRASES } from './playtime.js';
import { sage, stopSpeech } from './speech.js';
import { playPop, playPling } from './sound.js';

const KEY = 'malstrasse.playtime';
const today = () => new Date().toLocaleDateString('sv'); // JJJJ-MM-TT, Ortszeit

function load() {
  try { return normalize(JSON.parse(localStorage.getItem(KEY)), today()); } catch { return normalize(null, today()); }
}
function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* läuft trotzdem weiter */ }
}

/** Startet die Zeitmessung. limits nur im Testmodus anders. */
export function startPlaytime(limits) {
  let state = load();
  let lockEl = null;
  let last = performance.now();
  let lastSaved = 0;

  const badge = document.createElement('div');
  badge.className = 'playtime-badge hidden';
  badge.setAttribute('aria-label', 'Restzeit');
  document.body.appendChild(badge);

  function showLock(speak) {
    if (lockEl) return;
    badge.classList.add('hidden');
    stopSpeech();
    lockEl = document.createElement('div');
    lockEl.className = 'lock-screen';
    lockEl.innerHTML = `
      <div class="lock-moon">🌙</div>
      <div class="lock-title">Pause!</div>
      <div class="lock-dots">${'<span></span>'.repeat(PIN_LENGTH)}</div>
      <div class="lock-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="lock-key" data-k="${n}">${n}</button>`).join('')}
        <span></span><button class="lock-key" data-k="0">0</button><button class="lock-key lock-del" data-k="del" aria-label="Löschen">⌫</button></div>`;
    // nichts darunter darf noch reagieren
    for (const type of ['pointerdown', 'pointerup', 'click', 'touchstart']) lockEl.addEventListener(type, (e) => e.stopPropagation());
    document.body.appendChild(lockEl);
    const dots = [...lockEl.querySelectorAll('.lock-dots span')];
    let entry = '';
    const show = () => dots.forEach((d, i) => d.classList.toggle('on', i < entry.length));
    lockEl.querySelectorAll('.lock-key').forEach((key) => key.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const k = key.dataset.k;
      if (k === 'del') entry = entry.slice(0, -1);
      else if (entry.length < PIN_LENGTH) entry += k;
      show();
      if (entry.length < PIN_LENGTH) return;
      if (checkPin(entry)) {
        playPling();
        state = unlock(today());
        save(state);
        lockEl.remove();
        lockEl = null;
        last = performance.now();
      } else {
        playPop();
        const box = lockEl.querySelector('.lock-dots');
        box.classList.remove('wiggle'); void box.offsetWidth; box.classList.add('wiggle');
        entry = '';
        setTimeout(show, 350);
      }
    }));
    if (speak) sage(PLAYTIME_PHRASES.locked);
  }

  function step() {
    const now = performance.now();
    const delta = now - last;
    last = now;
    if (lockEl) return;
    if (document.hidden) return; // nur Zeit zählen, in der die App zu sehen ist
    const r = tick(state, delta, today(), limits);
    state = r.state;
    if (r.events.includes('warn')) sage(PLAYTIME_PHRASES.warn);
    if (r.events.includes('oneMinute')) sage(PLAYTIME_PHRASES.oneMinute);
    if (r.phase === 'warn') {
      badge.textContent = `⏳ ${formatRemaining(r.remainingMs)}`;
      badge.classList.remove('hidden');
      badge.classList.toggle('last', r.remainingMs <= 60000);
    } else badge.classList.add('hidden');
    if (r.phase === 'locked') { save(state); showLock(true); return; }
    if (now - lastSaved > 5000 || r.events.length) { save(state); lastSaved = now; }
  }

  document.addEventListener('visibilitychange', () => { last = performance.now(); if (document.hidden) save(state); });
  window.addEventListener('pagehide', () => save(state));
  if (state.locked) showLock(false);
  setInterval(step, 1000);
}
