// Ein Zeit-Spiel: Countdown, dann in 60–120 Sekunden so viel wie möglich schaffen.
import { CHALLENGES, CHALLENGE_PHRASES, makeField, makeSpawn, spawnDelay, starsFor } from '../challenges.js';
import { seededRandom } from '../pick.js';
import { sage } from '../speech.js';
import { playPop, playPling, playJubel } from '../sound.js';
import { burst } from '../confetti.js';
import { createPenalty, showPause, PENALTY_PHRASE } from '../penalty.js';

const balloonSvg = (color) => `<svg viewBox="0 0 60 90" class="balloon"><path d="M30 58 Q32 72 26 88" stroke="#5f6b75" stroke-width="2" fill="none"/>
  <ellipse cx="30" cy="30" rx="24" ry="29" fill="${color}" stroke="#26323d" stroke-width="2.5"/><path d="M26 58 L34 58 L30 63 Z" fill="${color}"/>
  <ellipse cx="21" cy="20" rx="6" ry="9" fill="#fff" opacity="0.45"/></svg>`;

export function render(root, ctx, { id }) {
  const base = CHALLENGES.find((c) => c.id === id);
  // Testmodus für Eltern: ?test&seconds=8 verkürzt die Spielzeit
  const testSeconds = ctx.testMode ? Number(new URLSearchParams(location.search).get('seconds')) : 0;
  const challenge = testSeconds > 0 ? { ...base, seconds: testSeconds } : base;
  const rng = seededRandom(Date.now() & 0xffffffff);
  const name = ctx.store.getName() || '';
  let score = 0;
  let running = false;
  let over = false;
  let endAt = 0;
  let saidTen = false;
  let nextOrder = 1;
  let stage = 0; // geschaffte Felder – jedes neue Feld wird größer
  let raf = 0;
  let lastFrame = 0;
  let spawnTimer = 0;
  const timers = [];
  const movers = new Set();
  // im Zeit-Spiel kürzere Pausen – die Uhr läuft weiter, das ist Strafe genug
  const penalty = createPenalty({ pauses: [3000, 4000, 5000] });
  let paused = false;

  const screen = document.createElement('section');
  screen.className = `screen challenge-screen mode-${challenge.mode} ch-${challenge.id}`;
  screen.innerHTML = `
    <button class="btn worlds-home" aria-label="Zurück zu den Zeit-Spielen">🏠</button>
    <div class="challenge-top">
      <div class="challenge-timer"><div class="challenge-timer-fill"></div></div>
      <div class="challenge-score">✔ <b>0</b></div>
    </div>
    <div class="challenge-field"></div>
    <div class="challenge-overlay"><div class="challenge-count">${challenge.icon}</div></div>`;
  root.appendChild(screen);
  const field = screen.querySelector('.challenge-field');
  const fill = screen.querySelector('.challenge-timer-fill');
  const scoreEl = screen.querySelector('.challenge-score b');
  const overlay = screen.querySelector('.challenge-overlay');
  const countEl = screen.querySelector('.challenge-count');

  screen.querySelector('.worlds-home').addEventListener('click', () => { playPop(); ctx.go('challenges'); });

  const addPoint = () => { score++; scoreEl.textContent = String(score); };
  const shake = (el) => { el.classList.remove('wiggle'); void el.offsetWidth; el.classList.add('wiggle'); };

  function makeButton(item, html) {
    const el = document.createElement('button');
    el.className = 'challenge-item';
    el.setAttribute('aria-label', item.label || '');
    el.innerHTML = html;
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!running || paused || el.classList.contains('gone')) return; // Finger und Stift
      tap(el, item);
    });
    return el;
  }

  // ---------- Suchen und Reihenfolge ----------
  function newField() {
    field.innerHTML = '';
    nextOrder = 1;
    for (const item of makeField(challenge, rng, name, stage)) {
      const el = makeButton(item, item.emoji || `<span class="challenge-char">${item.value}</span>`);
      el.style.left = `${(item.x * 100).toFixed(1)}%`;
      el.style.top = `${(item.y * 100).toFixed(1)}%`;
      el.item = item;
      field.appendChild(el);
    }
  }

  function remainingGood() {
    return [...field.children].some((el) => el.item?.good && !el.classList.contains('gone'));
  }

  function tap(el, item) {
    if (challenge.mode === 'order') {
      if (item.order !== nextOrder) { playPop(); shake(el); wrong(); return; }
      nextOrder++;
    } else if (!item.good) {
      playPop();
      shake(el);
      wrong();
      return;
    }
    penalty.right();
    el.classList.add('gone');
    playPling();
    addPoint();
    if (challenge.mode === 'float' || challenge.mode === 'fall') { movers.delete(el); setTimeout(() => el.remove(), 300); return; }
    if (!remainingGood()) { stage++; timers.push(setTimeout(() => { if (running) newField(); }, 350)); }
  }

  async function wrong() {
    const ms = penalty.wrong();
    if (!ms) return;
    paused = true;
    sage(PENALTY_PHRASE);
    await showPause(screen, Math.min(ms, Math.max(0, endAt - performance.now())));
    paused = false;
  }

  // ---------- Fliegende Dinge (Ballons steigen, Sterne fallen) ----------
  function spawn() {
    const item = makeSpawn(challenge, rng, progress());
    const el = makeButton(item, challenge.mode === 'float' ? balloonSvg(item.color) : item.emoji);
    el.item = item;
    el.y0 = challenge.mode === 'float' ? 1.05 : -0.08;
    el.y = el.y0;
    el.born = performance.now();
    el.style.left = `${(item.x * 100).toFixed(1)}%`;
    el.style.top = `${el.y * 100}%`;
    field.appendChild(el);
    movers.add(el);
  }

  // Position hängt nur von der vergangenen Zeit ab – bleibt richtig, auch wenn Bilder ausfallen
  function frame(now) {
    lastFrame = now;
    const dir = challenge.mode === 'float' ? -1 : 1;
    for (const el of movers) {
      el.y = el.y0 + dir * el.item.speed * ((now - el.born) / 1000);
      el.style.top = `${(el.y * 100).toFixed(2)}%`;
      if (el.y < -0.15 || el.y > 1.1) { movers.delete(el); el.remove(); }
    }
    if (running) raf = requestAnimationFrame(frame);
  }

  // ---------- Zeit ----------
  const progress = () => (running ? 1 - Math.max(0, endAt - performance.now()) / (challenge.seconds * 1000) : 0);

  // immer schneller: der Abstand zum nächsten Ding wird kürzer
  function scheduleSpawn() {
    spawnTimer = setTimeout(() => { if (!running) return; spawn(); scheduleSpawn(); }, spawnDelay(challenge, progress()));
  }

  function tick() {
    if (!running) return;
    const left = Math.max(0, endAt - performance.now());
    fill.style.transform = `scaleX(${left / (challenge.seconds * 1000)})`;
    screen.classList.toggle('hurry', left <= 10000);
    if (!saidTen && left <= 10000) { saidTen = true; sage(CHALLENGE_PHRASES.tenLeft); }
    if (left <= 0) finish();
  }

  function start() {
    overlay.classList.add('hidden');
    running = true;
    endAt = performance.now() + challenge.seconds * 1000;
    if (challenge.mode === 'find' || challenge.mode === 'order') newField();
    else {
      spawn();
      scheduleSpawn();
      lastFrame = performance.now();
      raf = requestAnimationFrame(frame);
    }
    timers.push(setInterval(tick, 100));
    sage(challenge.intro);
  }

  function finish() {
    running = false;
    over = true;
    clearTimeout(spawnTimer);
    cancelAnimationFrame(raf);
    const stars = starsFor(challenge, score);
    const best = ctx.store.recordChallenge(challenge.id, score, stars >= 1 ? challenge.stickerId : null);
    if (stars >= 2) { burst(screen, 3000); playJubel(); }
    overlay.classList.remove('hidden');
    overlay.innerHTML = `
      <div class="challenge-result">
        <div class="challenge-result-stars">${[0, 1, 2].map((i) => `<span class="${i < stars ? 'on' : ''}">★</span>`).join('')}</div>
        <div class="challenge-result-score">✔ ${score}</div>
        <div class="challenge-result-best">🏆 ${best}</div>
        <div class="challenge-result-buttons">
          <button class="btn btn-big btn-go challenge-again" aria-label="Nochmal">🔄</button>
          <button class="btn btn-big challenge-back" aria-label="Zu den Zeit-Spielen">⏱</button>
        </div>
      </div>`;
    overlay.querySelector('.challenge-again').addEventListener('click', () => { playPop(); ctx.go('challengePlay', { id }); });
    overlay.querySelector('.challenge-back').addEventListener('click', () => { playPop(); ctx.go('challenges'); });
    sage([CHALLENGE_PHRASES.timeUp, CHALLENGE_PHRASES.stars[stars]]);
  }

  // Countdown: "Drei, zwei, eins, los!"
  sage(CHALLENGE_PHRASES.countdown);
  ['3', '2', '1', 'Los!'].forEach((t, i) => timers.push(setTimeout(() => { if (!over) countEl.textContent = t; }, 400 + i * 800)));
  timers.push(setTimeout(() => { if (!over) start(); }, 400 + 4 * 800 - 300));

  return () => {
    running = false;
    over = true;
    timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
    clearTimeout(spawnTimer);
    cancelAnimationFrame(raf);
  };
}
