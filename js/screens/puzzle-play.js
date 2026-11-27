// Ein Puzzle legen: Teile mit Finger oder Stift aufs Brett ziehen, nahe der richtigen Stelle rasten sie ein.
import { PUZZLES, IMAGE_W, IMAGE_H, gridFor, makeEdges, piecePath, isSnapped, ghostOpacity, scatter } from '../puzzle.js';
import { sceneSvg } from '../puzzle-images.js';
import { seededRandom } from '../pick.js';
import { acceptPointer, pointerSession } from '../paint.js';
import { sage } from '../speech.js';
import { PUZZLE_START, PUZZLE_DONE, NEW_STICKER } from '../phrases.js';
import { playPop, playPling, playJubel } from '../sound.js';
import { burst } from '../confetti.js';

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function render(root, ctx, { index }) {
  const puzzle = PUZZLES[index];
  const { cols, rows } = gridFor(puzzle.pieces);
  const rng = seededRandom(Date.now() & 0xffffffff);
  const edges = makeEdges(cols, rows, rng);
  const imgSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sceneSvg(puzzle.id))}`;
  const wasDone = ctx.store.getPuzzles().includes(index);

  // Zustand je Teil: liegt es schon? Sonst Position als Bruchteil der Fläche (übersteht Drehen des iPads)
  const pieces = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pieces.push({ r, c, placed: false, fx: null, fy: null, el: null, path: null });

  const screen = document.createElement('section');
  screen.className = 'screen puzzle-screen';
  screen.innerHTML = `
    <div class="puzzle-board"><img class="puzzle-ghost" src="${imgSrc}" alt=""></div>
    <div class="puzzle-layer"></div>
    <button class="btn puzzle-home" aria-label="Zurück zu den Puzzles">🏠</button>`;
  root.appendChild(screen);
  const boardEl = screen.querySelector('.puzzle-board');
  const ghost = screen.querySelector('.puzzle-ghost');
  const layer = screen.querySelector('.puzzle-layer');
  ghost.style.opacity = String(ghostOpacity(index));

  let L = null; // aktuelles Layout
  let image = null;
  let z = 10;
  let finished = false;
  const timers = [];

  function computeLayout() {
    const W = screen.clientWidth, H = screen.clientHeight;
    const landscape = W >= H;
    const boardW = landscape ? Math.min(W * 0.6, (H - 40) * 0.75 * (IMAGE_W / IMAGE_H)) : Math.min(W - 40, H * 0.42 * (IMAGE_W / IMAGE_H));
    const boardH = boardW * (IMAGE_H / IMAGE_W);
    const x = landscape ? 24 : (W - boardW) / 2;
    const y = landscape ? (H - boardH) / 2 : 100;
    const cellW = boardW / cols, cellH = boardH / rows;
    const tab = 0.24 * Math.min(cellW, cellH);
    return { W, H, x, y, boardW, boardH, cellW, cellH, tab, pw: cellW + 2 * tab, ph: cellH + 2 * tab };
  }

  const targetOf = (p) => ({ x: L.x + p.c * L.cellW - L.tab, y: L.y + p.r * L.cellH - L.tab });

  function drawPiece(p) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cv = p.el || document.createElement('canvas');
    cv.className = 'puzzle-piece';
    cv.dataset.r = p.r;
    cv.dataset.c = p.c;
    cv.width = Math.round(L.pw * dpr);
    cv.height = Math.round(L.ph * dpr);
    cv.style.width = `${L.pw}px`;
    cv.style.height = `${L.ph}px`;
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, L.pw, L.ph);
    const path = new Path2D(piecePath(edges[p.r][p.c], L.cellW, L.cellH));
    g.save();
    g.translate(L.tab, L.tab);
    g.save();
    g.clip(path);
    if (image) g.drawImage(image, -p.c * L.cellW, -p.r * L.cellH, L.boardW, L.boardH);
    g.restore();
    g.lineWidth = 2;
    g.strokeStyle = 'rgba(38,50,61,0.55)';
    g.stroke(path);
    g.restore();
    p.path = path;
    p.el = cv;
  }

  function place(p) {
    let pos;
    if (p.placed) pos = targetOf(p);
    else pos = { x: p.fx * L.W, y: p.fy * L.H };
    p.el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    p.x = pos.x; p.y = pos.y;
    p.el.classList.toggle('placed', p.placed);
  }

  function layout() {
    L = computeLayout();
    Object.assign(boardEl.style, { left: `${L.x}px`, top: `${L.y}px`, width: `${L.boardW}px`, height: `${L.boardH}px` });
    const loose = pieces.filter((p) => !p.placed && p.fx === null);
    if (loose.length) {
      const spots = scatter(loose.length, L.pw, L.ph, { w: L.W, h: L.H }, { x: L.x - L.tab, y: L.y - L.tab, w: L.boardW + 2 * L.tab, h: L.boardH + 2 * L.tab }, rng);
      loose.forEach((p, i) => { p.fx = spots[i].x / L.W; p.fy = spots[i].y / L.H; });
    }
    for (const p of pieces) {
      drawPiece(p);
      if (!p.el.isConnected) layer.appendChild(p.el);
      place(p);
    }
  }

  // ---------- Ziehen ----------
  let drag = null; // { p, id, dx, dy }

  function pieceAt(clientX, clientY) {
    const rect = screen.getBoundingClientRect();
    const px = clientX - rect.left, py = clientY - rect.top;
    const candidates = pieces.filter((p) => !p.placed).sort((a, b) => Number(b.el.style.zIndex || 0) - Number(a.el.style.zIndex || 0));
    const g = candidates[0]?.el.getContext('2d');
    for (const p of candidates) {
      const lx = px - p.x - L.tab, ly = py - p.y - L.tab;
      if (lx < -L.tab || ly < -L.tab || lx > L.cellW + L.tab || ly > L.cellH + L.tab) continue;
      g.save();
      g.setTransform(1, 0, 0, 1, 0, 0);
      const inside = g.isPointInPath(p.path, lx, ly);
      g.restore();
      if (inside) return { p, px, py };
    }
    return null;
  }

  screen.addEventListener('pointerdown', (e) => {
    if (finished || drag || e.target.closest('button')) return;
    if (!acceptPointer(pointerSession, e)) return;
    const hit = pieceAt(e.clientX, e.clientY);
    if (!hit) return;
    e.preventDefault();
    const { p, px, py } = hit;
    p.el.style.zIndex = String(++z);
    p.el.classList.add('dragging');
    drag = { p, id: e.pointerId, dx: px - p.x, dy: py - p.y };
    try { screen.setPointerCapture(e.pointerId); } catch { /* egal */ }
  });

  screen.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    e.preventDefault();
    const rect = screen.getBoundingClientRect();
    const x = Math.min(L.W - L.pw / 2, Math.max(-L.pw / 2, e.clientX - rect.left - drag.dx));
    const y = Math.min(L.H - L.ph / 2, Math.max(-L.ph / 2, e.clientY - rect.top - drag.dy));
    drag.p.x = x; drag.p.y = y;
    drag.p.el.style.transform = `translate(${x}px, ${y}px)`;
  });

  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { p } = drag;
    drag = null;
    p.el.classList.remove('dragging');
    if (isSnapped({ x: p.x, y: p.y }, targetOf(p), L.cellW, L.cellH)) {
      p.placed = true;
      p.el.style.zIndex = '1';
      place(p);
      playPling();
      if (pieces.every((q) => q.placed)) finish();
    } else {
      p.fx = p.x / L.W; p.fy = p.y / L.H;
      playPop();
    }
  };
  screen.addEventListener('pointerup', endDrag);
  screen.addEventListener('pointercancel', endDrag);

  function finish() {
    finished = true;
    ghost.style.opacity = '1';
    ctx.store.completePuzzle(index, puzzle.stickerId);
    burst(screen, 3500);
    playJubel();
    const spoken = sage(wasDone ? PUZZLE_DONE : [PUZZLE_DONE, NEW_STICKER]);
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    Promise.race([Promise.all([spoken, delay(3500)]), delay(7000)]).then(() => { if (finished && screen.isConnected) ctx.go('puzzles'); });
    screen.addEventListener('click', () => ctx.go('puzzles'), { once: true });
  }

  screen.querySelector('.puzzle-home').addEventListener('click', () => { playPop(); ctx.go('puzzles'); });

  // Drehen / Größe ändern: neu anordnen, Fortschritt bleibt
  let resizeTimer = null;
  const ro = new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (!drag) layout(); }, 120); });

  layout();
  loadImage(imgSrc).then((img) => { image = img; if (screen.isConnected) { pieces.forEach(drawPiece); ro.observe(screen); } });
  timers.push(setTimeout(() => sage(PUZZLE_START), 300));

  return () => { finished = true; ro.disconnect(); timers.forEach(clearTimeout); clearTimeout(resizeTimer); };
}
