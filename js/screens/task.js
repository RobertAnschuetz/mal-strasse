// Aufgaben-Bildschirm: Motiv ausmalen, nachspuren oder schreiben.
import { STATIONS, motifFor, stationPrompt, FILL_PHASE_PROMPT } from '../curriculum.js';
import { thresholdsFor, countsAsAttempt } from '../difficulty.js';
import { strokesToMask, evaluateFill, evaluateTrace, evaluateTraceGroups } from '../scoring.js';
import { createPaintSurface, BRUSH_SIZES, defaultSizeIndex } from '../paint.js';
import { rasterizeMotif, motifMaskSvg, fillRegion, tracePaths, samplePathPoints } from '../masks.js';
import { sage, randomFrom } from '../speech.js';
import * as P from '../phrases.js';
import { playPling, playPop } from '../sound.js';
import { addPicture } from '../gallery-db.js';

export const CRAYONS = ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#29B6F6', '#1E40AF', '#8E24AA', '#F48FB1', '#6D4C41', '#222222'];

const isTracePhaseType = (t) => t === 'trace' || t === 'charWrite' || t === 'traceFill' || t === 'word';

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

/** Zeichnet die Vorlage: Umrisse (Ausmalen) oder gestrichelte Linien mit Startpunkten (Nachspuren). */
function makeGuide(motif, th, phase, highlight) {
  return (ctx) => {
    ctx.lineCap = ctx.lineJoin = 'round';
    if (highlight) drawHighlight(ctx, motif, highlight);
    if (phase === 'trace') {
      ctx.save();
      ctx.globalAlpha = th.guideOpacity;
      ctx.strokeStyle = '#5a6672';
      // Bei kleinen Buchstaben (Wörter) werden Punkte, Pfeile und Striche mitverkleinert
      const k = motif.guideScale || 1;
      ctx.lineWidth = Math.max(2, th.guideWidth * 0.8 * k);
      ctx.setLineDash([Math.max(0.6, th.guideWidth * 0.2 * k), Math.max(3, th.guideWidth * 1.6 * k)]);
      for (const d of tracePaths(motif)) ctx.stroke(new Path2D(d));
      ctx.restore();
      motif.lines.forEach((l, i) => { if (motif.start?.[i]) drawStartArrow(ctx, l.d, motif.guideScale || 1); });
      for (const [x, y] of motif.start || []) {
        ctx.fillStyle = '#36b37e';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(x, y, Math.max(3, 7 * (motif.guideScale || 1)), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      return;
    }
    // Ausmalen: kräftige Umrisse
    ctx.strokeStyle = '#26323d';
    ctx.lineWidth = th.guideWidth * 0.55;
    for (const r of motif.regions) {
      if (r.strokeWidth) continue;
      ctx.stroke(new Path2D(r.d));
    }
    const thick = motif.regions.filter((r) => r.strokeWidth);
    if (thick.length) {
      // Umriss eines dicken Strichs: breit zeichnen, Innenteil wieder ausschneiden
      ctx.save();
      for (const r of thick) {
        ctx.lineWidth = r.strokeWidth + th.guideWidth * 1.1;
        ctx.stroke(new Path2D(r.d));
      }
      ctx.globalCompositeOperation = 'destination-out';
      for (const r of thick) {
        ctx.lineWidth = r.strokeWidth;
        ctx.stroke(new Path2D(r.d));
      }
      ctx.restore();
    }
    ctx.lineWidth = Math.max(2, th.guideWidth * 0.4);
    for (const l of motif.lines) ctx.stroke(new Path2D(l.d));
  };
}

/** Kleiner grüner Pfeil am Strichanfang: zeigt die Richtung (wird nicht geprüft). */
function drawStartArrow(ctx, d, k = 1) {
  const pts = samplePathPoints(d, 4 * k).slice(0, 7);
  if (pts.length < 5) return;
  const [x0, y0] = pts[2];
  const [x1, y1] = pts[pts.length - 1];
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.save();
  ctx.strokeStyle = ctx.fillStyle = '#36b37e';
  ctx.setLineDash([]);
  ctx.lineWidth = Math.max(1.5, 3 * k);
  const h = Math.max(3.5, 7 * k);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1 + h * Math.cos(a), y1 + h * Math.sin(a));
  ctx.lineTo(x1 + h * Math.cos(a + 2.4), y1 + h * Math.sin(a + 2.4));
  ctx.lineTo(x1 + h * Math.cos(a - 2.4), y1 + h * Math.sin(a - 2.4));
  ctx.fill();
  ctx.restore();
}

function drawHighlight(ctx, motif, h) {
  ctx.save();
  ctx.fillStyle = ctx.strokeStyle = 'rgba(255, 196, 0, 0.55)';
  if (h.regionId) {
    const r = motif.regions.find((x) => x.id === h.regionId);
    if (r) fillRegion(ctx, r);
  }
  if (h.point) {
    ctx.beginPath();
    ctx.arc(h.point[0], h.point[1], 16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function render(root, ctx, { stationIndex }) {
  const station = STATIONS[stationIndex];
  const motif = motifFor(station);
  const name = ctx.store.getName() || '';
  const raster = rasterizeMotif(motif);
  let phase = isTracePhaseType(station.type) ? 'trace' : 'fill';
  let busy = false;
  let lastCountedStrokes = -1;
  const attempts = () => ctx.store.getProgress().attempts[stationIndex] || 0;
  const th = () => thresholdsFor(station.level, attempts());

  const screen = el('section', 'screen task-screen');
  const tools = el('div', 'task-tools');
  const host = el('div', 'paint-host task-canvas');
  const actions = el('div', 'task-actions');
  screen.append(tools, host, actions);
  root.appendChild(screen);

  const surface = createPaintSurface(host, {});
  const startSize = defaultSizeIndex(th().brushWidth * (motif.guideScale ? Math.max(0.5, motif.guideScale) : 1));
  surface.setBrushWidth(BRUSH_SIZES[startSize]);

  function applyPhase() {
    const t = th();
    surface.setClipMask(phase === 'fill' && t.clip ? motifMaskSvg(motif) : null);
    surface.setGuide(makeGuide(motif, t, phase));
  }
  applyPhase();

  // Sofort beim Antippen reagieren (Finger oder Stift), nicht erst beim Loslassen
  const onTap = (btn, fn) => btn.addEventListener('pointerdown', (e) => { e.preventDefault(); fn(); });

  // Farbstifte
  const crayonButtons = CRAYONS.map((c) => {
    const b = el('button', 'crayon');
    b.style.setProperty('--c', c);
    b.setAttribute('aria-label', 'Farbe');
    onTap(b, () => { surface.setColor(c); select(b); playPop(); });
    tools.appendChild(b);
    return b;
  });
  const eraser = el('button', 'btn tool-btn', '🧽');
  eraser.setAttribute('aria-label', 'Radiergummi');
  onTap(eraser, () => { surface.setTool('eraser'); select(eraser); playPop(); });
  tools.appendChild(eraser);
  function select(btn) {
    for (const b of [...crayonButtons, eraser]) b.classList.toggle('selected', b === btn);
    sizeRow.style.setProperty('--dot', btn === eraser ? '#9aa5ad' : btn.style.getPropertyValue('--c'));
  }

  // Stiftstärke: fünf Stufen von sehr dünn bis sehr dick
  const sizeRow = el('div', 'size-row');
  const sizeButtons = BRUSH_SIZES.map((w, i) => {
    const b = el('button', 'size-btn');
    b.setAttribute('aria-label', ['Sehr dünn', 'Dünn', 'Mittel', 'Dick', 'Sehr dick'][i]);
    b.style.setProperty('--s', `${[5, 10, 16, 24, 34][i]}px`);
    onTap(b, () => {
      surface.setBrushWidth(w);
      sizeButtons.forEach((x) => x.classList.toggle('selected', x === b));
      playPop();
    });
    sizeRow.appendChild(b);
    return b;
  });
  sizeButtons[startSize].classList.add('selected');
  tools.appendChild(sizeRow);
  select(crayonButtons[0]);

  // Aktionen
  const done = el('button', 'btn btn-go task-done', '✔');
  const speaker = el('button', 'btn', '🔊');
  const restart = el('button', 'btn', '🔄');
  const home = el('button', 'btn', '🏠');
  done.setAttribute('aria-label', 'Fertig');
  speaker.setAttribute('aria-label', 'Nochmal hören');
  restart.setAttribute('aria-label', 'Nochmal von vorn');
  home.setAttribute('aria-label', 'Zur Straße');
  actions.append(home, speaker, restart, done);

  const prompt = () => (phase === 'fill' && station.type === 'traceFill' ? FILL_PHASE_PROMPT : stationPrompt(station));
  speaker.addEventListener('click', () => sage(prompt()));
  // Zur Straße: mit Rückfrage, sobald schon gemalt wurde – ein verirrter Tipp soll kein Bild löschen
  home.addEventListener('click', () => {
    if (!surface.strokes().length) { playPop(); ctx.go('road'); return; }
    confirm('🏠', P.HOME_Q, () => ctx.go('road'));
  });
  restart.addEventListener('click', () => confirm('🔄', P.RESTART_Q, () => {
    surface.clear();
    if (station.type === 'traceFill') { phase = 'trace'; applyPhase(); }
  }));
  done.addEventListener('click', () => check());

  let debug = null;
  if (ctx.testMode) { debug = el('div', 'debug'); screen.appendChild(debug); }

  const timers = [setTimeout(() => sage(prompt()), 350)];

  function confirm(icon, question, onYes) {
    playPop();
    const overlay = el('div', 'overlay');
    const yes = el('button', 'btn btn-big btn-go', '✔');
    const no = el('button', 'btn btn-big', '✖');
    overlay.append(el('div', 'overlay-icon', icon), yes, no);
    screen.appendChild(overlay);
    sage(question);
    yes.addEventListener('click', () => { overlay.remove(); onYes(); });
    no.addEventListener('click', () => overlay.remove());
  }

  async function blink(highlight) {
    const t = th();
    for (let i = 0; i < 3; i++) {
      surface.setGuide(makeGuide(motif, t, phase, highlight));
      await new Promise((r) => setTimeout(r, 380));
      surface.setGuide(makeGuide(motif, t, phase));
      await new Promise((r) => setTimeout(r, 260));
    }
  }

  async function check() {
    if (busy) return;
    busy = true;
    const t = th();
    const paint = strokesToMask(surface.strokes());
    const result = phase === 'trace'
      ? (raster.groupPoints ? evaluateTraceGroups({ groups: raster.groupPoints, paint }, t) : evaluateTrace({ linePoints: raster.linePoints, paint }, t))
      : evaluateFill({ regions: raster.regions, paint }, t);
    if (debug) debug.textContent = `Abdeckung ${(result.coverage * 100).toFixed(0)} % · daneben ${(result.spill * 100).toFixed(0)} % · Versuche ${attempts()} · ${result.passed ? 'OK' : 'noch nicht'}`;

    if (result.passed) {
      if (phase === 'trace' && station.type === 'traceFill') {
        playPling();
        phase = 'fill';
        applyPhase();
        await sage(FILL_PHASE_PROMPT);
        busy = false;
        return;
      }
      // Die Galerie ist ein Extra: höchstens 2 s warten, dann auf jeden Fall weiter zur Belohnung
      const save = surface.toPNG().then((png) => addPicture({ stationIndex, blob: png })).catch(() => {});
      await Promise.race([save, new Promise((r) => setTimeout(r, 2000))]);
      ctx.go('reward', { stationIndex });
      return;
    }

    // Nur ein Versuch, wenn seit dem letzten Mal weitergemalt wurde – sonst könnte man sich "durchtippen"
    const strokeCount = surface.strokes().length;
    const nothing = strokeCount === 0;
    if (countsAsAttempt(strokeCount, lastCountedStrokes)) {
      ctx.store.recordFailedAttempt(stationIndex);
      lastCountedStrokes = strokeCount;
    }
    let hint;
    let highlight = null;
    const spillProblem = t.spillMax !== null && result.spill > t.spillMax && result.coverage >= t.coverage;
    if (nothing) {
      hint = phase === 'trace' ? P.HINT_TRACE_START : P.HINT_FILL_START;
    } else if (spillProblem) {
      hint = phase === 'trace' ? P.HINT_TRACE_SPILL : P.HINT_FILL_SPILL;
    } else if (phase === 'trace') {
      hint = P.HINT_TRACE_MISS;
      highlight = { point: result.firstMissedPoint };
    } else {
      const region = raster.regions.find((r) => r.id === result.weakestRegionId);
      hint = region && raster.regions.length > 1 ? P.regionHint(region.label) : P.HINT_FILL_MISS;
      highlight = { regionId: result.weakestRegionId };
    }
    sage([randomFrom(P.ENCOURAGE), hint]);
    // Doppeltipps abfangen: mindestens 1,5 s bis zur nächsten Bewertung
    await Promise.all([highlight ? blink(highlight) : null, new Promise((r) => setTimeout(r, 1500))]);
    busy = false;
  }

  return () => { timers.forEach(clearTimeout); surface.destroy(); };
}
