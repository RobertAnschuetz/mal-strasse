// Paare finden: Karten aufdecken, immer zwei gleiche suchen. Fehler zählt nur, wenn man es hätte wissen können.
import { makeBoard, createMemoryGame, gridFor, peekMsFor, boardsPerRound, HINT_AFTER_MS, MISMATCH_SHOW_MS } from '../memory.js';
import { roundStar, DRANBLEIB_PHRASES } from '../dranbleib.js';
import { seededRandom } from '../pick.js';
import { sage } from '../speech.js';
import { playPop, playPling } from '../sound.js';
import { createSession } from './dranbleib-session.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function render(root, ctx) {
  const screen = document.createElement('section');
  screen.className = 'screen memory-screen';
  screen.innerHTML = `<button class="btn worlds-home" aria-label="Zurück">🏠</button><div class="memory-area"><div class="memory-grid"></div></div>`;
  root.appendChild(screen);
  const area = screen.querySelector('.memory-area');
  const grid = screen.querySelector('.memory-grid');
  const session = createSession(screen, ctx, 'memory', () => boardsPerRound(session.level), '🐶');
  const level = session.level;
  const rng = seededRandom(Date.now() & 0xffffffff);

  let alive = true;
  let cards = [];
  let els = [];
  let game = null;
  let locked = true;
  let lastProgress = performance.now();
  let saidHint = false;
  let boardInRound = 0;
  let errorsInRound = 0;
  let firstOpen = null;

  screen.querySelector('.worlds-home').addEventListener('click', () => { playPop(); ctx.go('dranbleib'); });

  function layout() {
    if (!cards.length) return;
    const w = area.clientWidth, h = area.clientHeight;
    const { cols, rows } = gridFor(cards.length, w >= h);
    const gap = Math.max(8, Math.min(w, h) * 0.02);
    const size = Math.floor(Math.min((w - gap * (cols - 1)) / cols, (h - gap * (rows - 1)) / rows / 1.15));
    Object.assign(grid.style, { gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap: `${gap}px` });
    grid.style.setProperty('--card-w', `${size}px`);
  }

  const setOpen = (id, open) => els[id].classList.toggle('open', open);

  function buildBoard() {
    cards = makeBoard(level, rng);
    game = createMemoryGame(cards);
    grid.innerHTML = '';
    els = cards.map((c) => {
      const el = document.createElement('button');
      el.className = 'memory-card';
      el.setAttribute('aria-label', 'Karte');
      el.innerHTML = `<span class="memory-inner"><span class="memory-back"></span><span class="memory-front">${c.emoji}</span></span>`;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (locked) return; // Antippen mit Finger oder Stift
        flip(c.id);
      });
      grid.appendChild(el);
      return el;
    });
    if (ctx.testMode) els.forEach((el, i) => { el.dataset.pair = String(cards[i].pair); });
    layout();
  }

  async function flip(id) {
    const r = game.flip(id);
    if (r.result === 'ignored') return;
    setOpen(id, true);
    playPop();
    if (r.result === 'first') { firstOpen = id; return; }
    const a = firstOpen;
    firstOpen = null;
    if (r.result === 'match') {
      lastProgress = performance.now();
      els[a].classList.add('found');
      els[id].classList.add('found');
      playPling();
      if (game.done) boardDone();
      return;
    }
    // ungleich: kurz zeigen, dann wieder umdrehen
    if (r.error) { errorsInRound++; session.addError(); }
    locked = true;
    await wait(MISMATCH_SHOW_MS);
    if (!alive) return;
    setOpen(a, false);
    setOpen(id, false);
    locked = false;
  }

  async function startBoard() {
    buildBoard();
    saidHint = false;
    const peek = peekMsFor(level);
    if (peek) {
      locked = true;
      els.forEach((_, i) => setOpen(i, true));
      sage(DRANBLEIB_PHRASES.memoryPeek);
      await wait(peek + 600);
      if (!alive) return;
      els.forEach((_, i) => setOpen(i, false));
      game.seeAll(); // wer gut hingeschaut hat, kann sie wissen
      await wait(500);
    }
    lastProgress = performance.now();
    locked = false;
  }

  async function boardDone() {
    locked = true;
    boardInRound++;
    session.showSteps(boardInRound);
    await wait(900);
    if (!alive) return;
    if (boardInRound >= boardsPerRound(level)) {
      const star = roundStar(errorsInRound);
      boardInRound = 0;
      errorsInRound = 0;
      if (await session.roundDone(star)) return;
      session.showSteps(0);
    }
    if (alive) startBoard();
  }

  // Tipp: nach 20 s ohne Paar wackeln zwei Karten, die man beide schon gesehen hat
  const hintTimer = setInterval(() => {
    if (!alive || locked || !game || performance.now() - lastProgress < HINT_AFTER_MS) return;
    const pair = game.knownPair();
    if (!pair) return;
    lastProgress = performance.now();
    for (const id of pair) { els[id].classList.remove('hint'); void els[id].offsetWidth; els[id].classList.add('hint'); }
    if (!saidHint) { saidHint = true; sage(DRANBLEIB_PHRASES.memoryHint); }
  }, 1000);

  const ro = new ResizeObserver(() => layout());
  ro.observe(area);
  session.showSteps(0);
  sage(DRANBLEIB_PHRASES.memoryIntro).then(() => { if (alive) startBoard(); });

  return () => { alive = false; clearInterval(hintTimer); ro.disconnect(); };
}
