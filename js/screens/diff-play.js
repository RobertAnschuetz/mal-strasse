// Unterschiede finden: zwei Bilder, im zweiten ist etwas anders. Antippen in einem der beiden Bilder.
import { makePuzzle, hitDiff, onFoundDiff, picturesPerRound, HINT_AFTER_MS } from '../differences.js';
import { worldSvg } from '../world-images.js';
import { roundStar, DRANBLEIB_PHRASES } from '../dranbleib.js';
import { seededRandom } from '../pick.js';
import { sage } from '../speech.js';
import { playPop, playPling } from '../sound.js';
import { createPenalty, showPause, PENALTY_PHRASE, PENALTY_OVER } from '../penalty.js';
import { createSession } from './dranbleib-session.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ASPECT = 1.3; // Bildformat; der Hintergrund (1000×600) wird passend beschnitten
const MAX_ERRORS_PER_PICTURE = 3;

export function render(root, ctx) {
  const screen = document.createElement('section');
  screen.className = 'screen diff-screen';
  screen.innerHTML = `<button class="btn worlds-home" aria-label="Zurück">🏠</button>
    <div class="diff-area"><div class="diff-pic" data-side="left"></div><div class="diff-pic" data-side="right"></div></div>`;
  root.appendChild(screen);
  const area = screen.querySelector('.diff-area');
  const pics = [...screen.querySelectorAll('.diff-pic')];
  const session = createSession(screen, ctx, 'diff', () => picturesPerRound(session.level), '🔍');
  const level = session.level;
  const rng = seededRandom(Date.now() & 0xffffffff);
  const penalty = createPenalty();

  let alive = true;
  let puzzle = null;
  let found = new Set();
  let locked = true;
  let lastProgress = performance.now();
  let saidHint = false;
  let pictureInRound = 0;
  let errorsInRound = 0;
  let errorsInPicture = 0;
  let lastWorld = null;

  screen.querySelector('.worlds-home').addEventListener('click', () => { playPop(); ctx.go('dranbleib'); });

  function layout() {
    const w = area.clientWidth, h = area.clientHeight;
    const side = w / h >= ASPECT * 0.9; // nebeneinander, wenn genug Breite
    const gap = 18;
    let pw = side ? Math.min((w - gap) / 2, h * ASPECT) : Math.min(w, ((h - gap) / 2) * ASPECT);
    pw = Math.floor(pw);
    area.style.flexDirection = side ? 'row' : 'column';
    area.style.gap = `${gap}px`;
    for (const p of pics) {
      Object.assign(p.style, { width: `${pw}px`, height: `${Math.floor(pw / ASPECT)}px` });
      p.style.setProperty('--pw', `${pw}px`);
    }
  }

  const itemHtml = (it) => `<span class="diff-item${it.flip ? ' flip' : ''}" style="left:${(it.x * 100).toFixed(2)}%;top:${(it.y * 100).toFixed(2)}%">${it.emoji}</span>`;

  function newPicture() {
    // nicht zweimal hintereinander dieselbe Welt
    let tries = 0;
    do { puzzle = makePuzzle(level, rng); } while (puzzle.worldId === lastWorld && ++tries < 5);
    lastWorld = puzzle.worldId;
    found = new Set();
    errorsInPicture = 0;
    saidHint = false;
    const bg = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(worldSvg(puzzle.worldId))}")`;
    pics[0].style.backgroundImage = bg;
    pics[1].style.backgroundImage = bg;
    pics[0].innerHTML = puzzle.left.map(itemHtml).join('');
    pics[1].innerHTML = puzzle.right.map(itemHtml).join('');
    if (ctx.testMode) screen.testState = () => ({ diffs: puzzle.diffs, found: [...found] });
    session.showSteps(pictureInRound);
    lastProgress = performance.now();
    locked = false;
  }

  function mark(pic, x, y, cls) {
    const m = document.createElement('span');
    m.className = cls;
    m.style.left = `${(x * 100).toFixed(2)}%`;
    m.style.top = `${(y * 100).toFixed(2)}%`;
    pic.appendChild(m);
    return m;
  }

  pics.forEach((pic) => pic.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (locked) return; // Antippen mit Finger oder Stift
    const r = pic.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    const i = hitDiff(puzzle.diffs, found, x, y, r.width / r.height);
    if (i >= 0) hit(i);
    else if (!onFoundDiff(puzzle.diffs, found, x, y, r.width / r.height)) miss(pic, x, y);
  }));

  function hit(i) {
    found.add(i);
    penalty.right();
    const d = puzzle.diffs[i];
    for (const p of pics) mark(p, d.x, d.y, 'diff-ring');
    pics.forEach((p) => p.querySelectorAll('.diff-hint').forEach((h) => h.remove()));
    playPling();
    lastProgress = performance.now();
    if (found.size === puzzle.diffs.length) pictureDone();
  }

  async function miss(pic, x, y) {
    playPop();
    const m = mark(pic, x, y, 'diff-miss');
    setTimeout(() => m.remove(), 700);
    if (errorsInPicture < MAX_ERRORS_PER_PICTURE) { errorsInPicture++; errorsInRound++; session.addError(); }
    const ms = penalty.wrong();
    if (!ms) return;
    locked = true;
    sage(PENALTY_PHRASE);
    await showPause(screen, ms);
    if (!alive) return;
    locked = false;
    lastProgress = performance.now();
    sage(PENALTY_OVER);
  }

  async function pictureDone() {
    locked = true;
    pictureInRound++;
    session.showSteps(pictureInRound);
    await wait(1200);
    if (!alive) return;
    if (pictureInRound >= picturesPerRound(level)) {
      const star = roundStar(errorsInRound);
      pictureInRound = 0;
      errorsInRound = 0;
      if (await session.roundDone(star)) return;
    }
    if (alive) newPicture();
  }

  // Tipp nach 20 s ohne Fund: ein großer weicher Kreis grob um einen fehlenden Unterschied
  const hintTimer = setInterval(() => {
    if (!alive || locked || !puzzle || performance.now() - lastProgress < HINT_AFTER_MS) return;
    const i = puzzle.diffs.findIndex((_, k) => !found.has(k));
    if (i < 0) return;
    lastProgress = performance.now();
    const d = puzzle.diffs[i];
    const jx = (rng() - 0.5) * 0.08, jy = (rng() - 0.5) * 0.1;
    pics[1].querySelectorAll('.diff-hint').forEach((h) => h.remove());
    mark(pics[1], Math.min(0.9, Math.max(0.1, d.x + jx)), Math.min(0.85, Math.max(0.15, d.y + jy)), 'diff-hint');
    if (!saidHint) { saidHint = true; sage(DRANBLEIB_PHRASES.diffHint); }
  }, 1000);

  const ro = new ResizeObserver(() => layout());
  ro.observe(area);
  layout();
  newPicture();
  sage(DRANBLEIB_PHRASES.diffIntro);

  return () => { alive = false; clearInterval(hintTimer); ro.disconnect(); };
}
