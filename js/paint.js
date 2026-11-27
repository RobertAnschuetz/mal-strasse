// Malfläche: Striche werden im 200er-Raster gespeichert und bei jeder Größenänderung neu gezeichnet.
import { GRID } from './scoring.js';

/** Handballen-Schutz: sobald ein Stift benutzt wurde, malen Finger nicht mehr. */
export function acceptPointer(state, e) {
  if (e.pointerType === 'pen') { state.penSeen = true; return true; }
  if (e.pointerType === 'touch') return !state.penSeen;
  return true;
}

/** Merkt sich für die ganze Sitzung, ob ein Stift benutzt wurde (gilt für alle Bilder). */
export const pointerSession = { penSeen: false };

/**
 * Entscheidet über einen neuen Pointer, während evtl. schon einer malt.
 * 'start'   = neuen Strich beginnen
 * 'ignore'  = nicht malen
 * 'replace' = laufenden Finger-/Handballen-Strich verwerfen und mit dem Stift neu beginnen
 * 'restart' = der laufende Strich ist vorbei (sein "Abheben" ging verloren) – neuen Strich beginnen
 */
export function arbitrate(state, activeType, e, activeId) {
  if (activeType === 'touch' && e.pointerType === 'pen') { state.penSeen = true; return 'replace'; }
  // Derselbe Zeiger setzt neu auf oder ein zweiter Stift/Maus: es gibt nur einen Stift – alter Strich ist vorbei
  if (activeType && (e.pointerId === activeId || (e.pointerType === activeType && e.pointerType !== 'touch'))) {
    if (e.pointerType === 'pen') state.penSeen = true;
    return 'restart';
  }
  if (activeType) return 'ignore';
  return acceptPointer(state, e) ? 'start' : 'ignore';
}

/** Fünf Stiftstärken (im 200er-Raster): sehr dünn bis sehr dick. */
export const BRUSH_SIZES = [3, 6, 10, 16, 26];

/** Vorausgewählt wird die Stärke, die der Stufe am nächsten liegt. */
export const defaultSizeIndex = (base) => BRUSH_SIZES.reduce((best, w, i) =>
  (Math.abs(w - base) < Math.abs(BRUSH_SIZES[best] - base) ? i : best), 0);

function drawStroke(ctx, s) {
  const pts = s.points;
  if (!pts.length) return;
  ctx.save();
  ctx.globalCompositeOperation = s.tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.strokeStyle = ctx.fillStyle = s.tool === 'eraser' ? '#000' : s.color;
  ctx.lineWidth = s.width;
  ctx.lineCap = ctx.lineJoin = 'round';
  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0][0], pts[0][1], s.width / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }
  ctx.restore();
}

const maskUrl = (svg) => `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Legt zwei Canvas-Ebenen in `container` an: unten die Farbe, oben die Vorlage (Umrisse/Punkte).
 * Das "Farbe bleibt im Bild" der leichten Stufen ist eine CSS-Maske: kostet beim Malen keine Rechenzeit.
 * opts.guide(ctx): zeichnet die Vorlage im 200er-Raster
 * opts.onStrokeEnd(): nach jedem Strich
 */
export function createPaintSurface(container, opts = {}) {
  const paper = document.createElement('div');
  const paint = document.createElement('canvas');
  const guide = document.createElement('canvas');
  paper.className = 'paper-layer';
  paint.className = 'paint-layer';
  guide.className = 'guide-layer';
  container.append(paper, paint, guide);
  const pctx = paint.getContext('2d', { desynchronized: true });
  const gctx = guide.getContext('2d');

  let strokes = [];
  let color = '#E53935';
  let tool = 'brush';
  let brushWidth = 12;
  let maskSvg = null;
  let guideFn = opts.guide || null;
  let active = null; // { id, type, stroke }
  const pointerState = opts.pointerState || pointerSession;
  let scale = 1;

  const setTransform = (ctx) => ctx.setTransform(scale, 0, 0, scale, 0, 0);

  function redraw() {
    pctx.setTransform(1, 0, 0, 1, 0, 0);
    pctx.clearRect(0, 0, paint.width, paint.height);
    setTransform(pctx);
    for (const s of strokes) drawStroke(pctx, s);
    drawGuide();
  }

  function drawGuide() {
    gctx.setTransform(1, 0, 0, 1, 0, 0);
    gctx.clearRect(0, 0, guide.width, guide.height);
    setTransform(gctx);
    if (guideFn) guideFn(gctx);
  }

  function applyMask() {
    const v = maskSvg ? maskUrl(maskSvg) : 'none';
    for (const prop of ['maskImage', 'webkitMaskImage']) paint.style[prop] = v;
    for (const prop of ['maskSize', 'webkitMaskSize']) paint.style[prop] = '100% 100%';
    for (const prop of ['maskRepeat', 'webkitMaskRepeat']) paint.style[prop] = 'no-repeat';
  }

  function resize() {
    const size = Math.floor(Math.min(container.clientWidth, container.clientHeight));
    if (!size) return;
    // Auflösung begrenzen: höchstens doppelte Pixeldichte – schneller auf dem iPad, sieht gleich aus
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    paper.style.width = paper.style.height = `${size}px`;
    for (const c of [paint, guide]) {
      c.style.width = c.style.height = `${size}px`;
      c.width = c.height = Math.round(size * dpr);
    }
    scale = paint.width / GRID;
    redraw();
  }

  const toGrid = (e) => {
    const r = paint.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * GRID, ((e.clientY - r.top) / r.height) * GRID];
  };

  function dropActiveStroke() {
    if (!active) return;
    strokes = strokes.filter((s) => s !== active.stroke);
    active = null;
    redraw();
  }

  function endActive() {
    if (!active) return;
    active = null;
    opts.onStrokeEnd?.();
  }

  function onDown(e) {
    const decision = arbitrate(pointerState, active ? active.type : null, e, active ? active.id : null);
    if (decision === 'ignore') return;
    if (decision === 'replace') dropActiveStroke();
    if (decision === 'restart') endActive();
    e.preventDefault();
    try { paint.setPointerCapture?.(e.pointerId); } catch { /* nicht kritisch */ }
    const width = tool === 'eraser' ? brushWidth * 2 : brushWidth;
    const stroke = { tool, color, width, points: [toGrid(e)] };
    strokes.push(stroke);
    active = { id: e.pointerId, type: e.pointerType, stroke };
    setTransform(pctx);
    drawStroke(pctx, stroke);
  }

  function onMove(e) {
    if (!active || e.pointerId !== active.id) return;
    e.preventDefault();
    const list = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    const s = active.stroke;
    const from = s.points.length - 1;
    for (const ev of list.length ? list : [e]) {
      const p = toGrid(ev);
      const last = s.points[s.points.length - 1];
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.4) continue;
      s.points.push(p);
    }
    // Alle neuen Punkte dieses Ereignisses als einen Linienzug zeichnen
    if (s.points.length - 1 > from) {
      setTransform(pctx);
      drawStroke(pctx, { ...s, points: s.points.slice(from) });
    }
  }

  function onUp(e) {
    if (!active || e.pointerId !== active.id) return;
    endActive();
  }

  // Vom System abgebrochene Finger-Berührung (z. B. Handballen erkannt): Strich verwerfen
  function onCancel(e) {
    if (!active || e.pointerId !== active.id) return;
    if (active.type === 'touch') dropActiveStroke();
    else endActive();
  }

  paint.addEventListener('pointerdown', onDown);
  paint.addEventListener('pointermove', onMove);
  paint.addEventListener('lostpointercapture', onUp);
  // "Abheben" auch erkennen, wenn es außerhalb der Malfläche passiert
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onCancel);
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  applyMask();
  resize();

  return {
    setColor(c) { color = c; tool = 'brush'; },
    setTool(t) { tool = t; },
    getTool: () => tool,
    getColor: () => color,
    setBrushWidth(w) { brushWidth = w; },
    getBrushWidth: () => brushWidth,
    setClipMask(svg) { maskSvg = svg || null; applyMask(); },
    setGuide(fn) { guideFn = fn; drawGuide(); },
    clear() { strokes = []; active = null; redraw(); },
    strokes: () => strokes.map((s) => ({ ...s, points: s.points.slice() })),
    redraw,
    async toPNG(size = 600) {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      // Farbe (bei Maske nur innerhalb des Motivs)
      const layer = document.createElement('canvas');
      layer.width = layer.height = size;
      const lctx = layer.getContext('2d');
      lctx.drawImage(paint, 0, 0, size, size);
      if (maskSvg) {
        const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(maskSvg)}`);
        if (img) {
          lctx.globalCompositeOperation = 'destination-in';
          lctx.drawImage(img, 0, 0, size, size);
        }
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(layer, 0, 0);
      ctx.drawImage(guide, 0, 0, size, size);
      return new Promise((resolve) => c.toBlob((b) => resolve(b), 'image/png'));
    },
    destroy() {
      ro.disconnect();
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      paper.remove();
      paint.remove();
      guide.remove();
    },
  };
}
