// Motiv → Flächenmasken, Linienpunkte und Zeichenhilfen (Browser).
import { GRID } from './scoring.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
let svgPath = null;

export function samplePathPoints(d, step = 2) {
  if (!svgPath) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.style.visibility = 'hidden';
    svgPath = document.createElementNS(SVG_NS, 'path');
    svg.appendChild(svgPath);
    document.body.appendChild(svg);
  }
  svgPath.setAttribute('d', d);
  const len = svgPath.getTotalLength();
  const pts = [];
  for (let l = 0; l <= len; l += step) {
    const p = svgPath.getPointAtLength(l);
    pts.push([p.x, p.y]);
  }
  return pts;
}

/** Zeichnet eine Region gefüllt (bzw. als dicken Strich). */
export function fillRegion(ctx, region) {
  const p = new Path2D(region.d);
  if (region.strokeWidth) {
    ctx.save();
    ctx.lineWidth = region.strokeWidth;
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.stroke(p);
    ctx.restore();
  } else {
    ctx.fill(p);
  }
}

/** Alle Regionen als Vereinigung (unabhängig von der Umlaufrichtung). */
export function fillUnion(ctx, motif) {
  for (const r of motif.regions) fillRegion(ctx, r);
}

/** SVG-Maske aller Flächen (für "Farbe bleibt im Bild" per CSS-Maske). */
export function motifMaskSvg(motif) {
  const parts = motif.regions.map((r) => (r.strokeWidth
    ? `<path d="${r.d}" fill="none" stroke="#000" stroke-width="${r.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="${r.d}" fill="#000"/>`));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" preserveAspectRatio="none">${parts.join('')}</svg>`;
}

/** Pfade, die beim Nachspuren abgefahren werden: Umrisse der Flächen (bei Strichflächen die Mittellinie) + Linien. */
export const tracePaths = (motif) => [...motif.regions.map((r) => r.d), ...motif.lines.map((l) => l.d)];

export function rasterizeMotif(motif, grid = GRID) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = grid;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = ctx.strokeStyle = '#000';
  const scale = grid / GRID;

  const regions = motif.regions.map((r) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, grid, grid);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    fillRegion(ctx, r);
    const data = ctx.getImageData(0, 0, grid, grid).data;
    const mask = new Uint8Array(grid * grid);
    for (let i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3] > 127 ? 1 : 0;
    return { id: r.id, label: r.label, mask };
  });

  const linePoints = tracePaths(motif).flatMap((d) => samplePathPoints(d)).map(([x, y]) => [x * scale, y * scale]);
  // Wörter: Linienpunkte je Buchstabe, damit jeder Buchstabe einzeln bewertet wird
  const groupPoints = motif.groups
    ? motif.groups.map((idx) => idx.flatMap((k) => samplePathPoints(motif.lines[k].d)).map(([x, y]) => [x * scale, y * scale]))
    : null;
  return { regions, linePoints, groupPoints };
}
