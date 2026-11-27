// Labyrinth mit dem Stift: Auto durch die Straßen zur Flagge ziehen. An Wänden bleibt es stehen.
import { mazeSizeFor, mazesPerRound, generateMaze, canMove, shortestPath, stepToward } from '../maze.js';
import { mazeRoundStar, DRANBLEIB_PHRASES } from '../dranbleib.js';
import { seededRandom } from '../pick.js';
import { acceptPointer, pointerSession } from '../paint.js';
import { sage } from '../speech.js';
import { playPop, playPling } from '../sound.js';
import { createSession } from './dranbleib-session.js';

const HINT_AFTER_MS = 15000;
const MAX_BUMPS_PER_MAZE = 3;

export function render(root, ctx) {
  const screen = document.createElement('section');
  screen.className = 'screen maze-screen';
  screen.innerHTML = `<button class="btn worlds-home" aria-label="Zurück">🏠</button>
    <div class="maze-area"><svg class="maze-svg"></svg><div class="maze-car">🚗</div><div class="maze-goal">🏁</div><div class="maze-hint hidden">➜</div></div>`;
  root.appendChild(screen);
  const area = screen.querySelector('.maze-area');
  const svg = screen.querySelector('.maze-svg');
  const carEl = screen.querySelector('.maze-car');
  const goalEl = screen.querySelector('.maze-goal');
  const hintEl = screen.querySelector('.maze-hint');
  const session = createSession(screen, ctx, 'maze', () => mazesPerRound(session.level));
  const { cols, rows } = mazeSizeFor(session.level);
  const rng = seededRandom(Date.now() & 0xffffffff);

  let maze = null;
  let car = [0, 0];
  let trail = [[0, 0]];
  let mazeInRound = 0;
  let round = { bumps: 0, resumedAfterBump: false };
  let bumpsInMaze = 0;
  let saidBump = false;
  let saidHint = false;
  let stroke = null; // { id, counted }
  let bumpedLastStroke = false;
  let lastProgress = performance.now();
  let busy = false;
  let alive = true;
  let cell = 40, offX = 0, offY = 0;

  screen.querySelector('.worlds-home').addEventListener('click', () => { playPop(); ctx.go('dranbleib'); });

  const goal = () => [cols - 1, rows - 1];
  const center = ([c, r]) => [offX + (c + 0.5) * cell, offY + (r + 0.5) * cell];

  function layout() {
    const w = area.clientWidth, h = area.clientHeight;
    cell = Math.floor(Math.min(w / cols, h / rows));
    offX = (w - cell * cols) / 2;
    offY = (h - cell * rows) / 2;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    draw();
  }

  function draw() {
    if (!maze) return;
    const road = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const [x, y] = center([c, r]);
        if (canMove(maze, [c, r], [c + 1, r])) road.push(`M ${x} ${y} L ${x + cell} ${y}`);
        if (canMove(maze, [c, r], [c, r + 1])) road.push(`M ${x} ${y} L ${x} ${y + cell}`);
      }
    }
    const trailD = trail.map((p, i) => `${i ? 'L' : 'M'} ${center(p).join(' ')}`).join(' ');
    svg.innerHTML = `
      <rect x="${offX - 10}" y="${offY - 10}" width="${cell * cols + 20}" height="${cell * rows + 20}" rx="18" fill="#8bc98a"/>
      <path d="${road.join(' ')}" stroke="#6b7078" stroke-width="${cell * 0.62}" stroke-linecap="round" fill="none"/>
      <path d="${road.join(' ')}" stroke="#ffffff" stroke-width="${Math.max(2, cell * 0.04)}" stroke-dasharray="${cell * 0.12} ${cell * 0.14}" fill="none"/>
      <path d="${trailD}" stroke="#ffd23f" stroke-width="${cell * 0.22}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.9"/>`;
    const size = `${Math.round(cell * 0.55)}px`;
    const [gx, gy] = center(goal());
    Object.assign(goalEl.style, { left: `${gx}px`, top: `${gy}px`, fontSize: size });
    placeCar();
  }

  function placeCar() {
    const [x, y] = center(car);
    Object.assign(carEl.style, { left: `${x}px`, top: `${y}px`, fontSize: `${Math.round(cell * 0.55)}px` });
  }

  function newMaze() {
    maze = generateMaze(cols, rows, rng);
    car = [0, 0];
    trail = [[0, 0]];
    bumpsInMaze = 0;
    bumpedLastStroke = false; // ein Anstoßen im letzten Labyrinth gilt nicht fürs nächste
    saidBump = false;
    saidHint = false;
    lastProgress = performance.now();
    hintEl.classList.add('hidden');
    layout();
  }

  const pointerCell = (e) => {
    const rect = area.getBoundingClientRect();
    return [Math.floor((e.clientX - rect.left - offX) / cell), Math.floor((e.clientY - rect.top - offY) / cell)];
  };

  area.addEventListener('pointerdown', (e) => {
    if (busy || !acceptPointer(pointerSession, e)) return;
    const p = pointerCell(e);
    if (Math.abs(p[0] - car[0]) + Math.abs(p[1] - car[1]) > 1) return; // beim Auto ansetzen
    e.preventDefault();
    try { area.setPointerCapture(e.pointerId); } catch { /* egal */ }
    if (bumpedLastStroke) { round.resumedAfterBump = true; bumpedLastStroke = false; }
    stroke = { id: e.pointerId, counted: false };
    follow(p, true);
  });

  area.addEventListener('pointermove', (e) => {
    if (!stroke || e.pointerId !== stroke.id || busy) return;
    e.preventDefault();
    follow(pointerCell(e));
  });

  const endStroke = (e) => { if (stroke && e.pointerId === stroke.id) stroke = null; };
  area.addEventListener('pointerup', endStroke);
  area.addEventListener('pointercancel', endStroke);

  function follow(target, onTouchDown = false) {
    for (let i = 0; i < cols + rows; i++) {
      const { cell: next, bumped } = stepToward(maze, car, target);
      if (bumped) { if (!onTouchDown) bump(); break; } // Aufsetzen neben dem Auto ist kein Fehler
      if (next[0] === car[0] && next[1] === car[1]) break;
      car = next;
      trail.push(next);
      lastProgress = performance.now();
      hintEl.classList.add('hidden');
      if (car[0] === goal()[0] && car[1] === goal()[1]) { draw(); reachedGoal(); return; }
    }
    draw();
  }

  function bump() {
    carEl.classList.remove('wiggle');
    void carEl.offsetWidth;
    carEl.classList.add('wiggle');
    if (!stroke || stroke.counted || bumpsInMaze >= MAX_BUMPS_PER_MAZE) return;
    stroke.counted = true;
    bumpsInMaze++;
    round.bumps++;
    bumpedLastStroke = true;
    session.addError();
    playPop();
    if (!saidBump) { saidBump = true; sage(DRANBLEIB_PHRASES.bump); }
  }

  async function reachedGoal() {
    busy = true;
    stroke = null;
    playPling();
    mazeInRound++;
    session.showSteps(mazeInRound);
    await new Promise((r) => setTimeout(r, 700));
    if (!alive) return;
    if (mazeInRound >= mazesPerRound(session.level)) {
      const star = mazeRoundStar(round);
      mazeInRound = 0;
      round = { bumps: 0, resumedAfterBump: false };
      bumpedLastStroke = false;
      if (await session.roundDone(star)) return;
      session.showSteps(0);
    }
    if (!alive) return;
    newMaze();
    busy = false;
  }

  // Tipp nach 15 s ohne Fortschritt: Pfeil zeigt zur nächsten Zelle des kürzesten Wegs
  const hintTimer = setInterval(() => {
    if (!alive || busy || !maze || performance.now() - lastProgress < HINT_AFTER_MS) return;
    const path = shortestPath(maze, car, goal());
    if (path.length < 2) return;
    const [nx, ny] = center(path[1]);
    const [cx, cy] = center(car);
    const angle = Math.atan2(ny - cy, nx - cx) * 180 / Math.PI;
    Object.assign(hintEl.style, { left: `${(cx + nx) / 2}px`, top: `${(cy + ny) / 2}px`, fontSize: `${Math.round(cell * 0.5)}px`, rotate: `${angle}deg` });
    hintEl.classList.remove('hidden');
    if (!saidHint) { saidHint = true; sage(DRANBLEIB_PHRASES.hint); }
  }, 1000);

  if (ctx.testMode) screen.testState = () => ({ maze, car, cell, offX, offY, bumps: round.bumps, resumed: round.resumedAfterBump });
  const ro = new ResizeObserver(() => layout());
  ro.observe(area);
  session.showSteps(0);
  newMaze();
  sage(DRANBLEIB_PHRASES.mazeIntro);

  return () => { alive = false; clearInterval(hintTimer); ro.disconnect(); };
}
