// Bewertung auf dem 200×200-Raster. Reines JavaScript, ohne Browser-APIs.

export const GRID = 200;

function stamp(mask, grid, cx, cy, r, value) {
  const r2 = r * r;
  const x0 = Math.max(0, Math.floor(cx - r));
  const x1 = Math.min(grid - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const y1 = Math.min(grid - 1, Math.ceil(cy + r));
  for (let y = y0; y <= y1; y++) {
    const dy = y - cy;
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx;
      if (dx * dx + dy * dy <= r2) mask[y * grid + x] = value;
    }
  }
}

/** Striche (in Rasterkoordinaten) → Maske, 1 = bemalt. */
export function strokesToMask(strokes, grid = GRID) {
  const mask = new Uint8Array(grid * grid);
  for (const s of strokes || []) {
    const pts = s.points || [];
    if (!pts.length) continue;
    const value = s.tool === 'eraser' ? 0 : 1;
    const r = Math.max(0.5, (s.width || 1) / 2);
    stamp(mask, grid, pts[0][0], pts[0][1], r, value);
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1];
      const [bx, by] = pts[i];
      const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay)));
      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        stamp(mask, grid, ax + (bx - ax) * t, ay + (by - ay) * t, r, value);
      }
    }
  }
  return mask;
}

/** Bewertung fürs Ausmalen. */
export function evaluateFill({ regions, paint }, th) {
  const n = paint.length;
  const union = new Uint8Array(n);
  for (const r of regions) for (let i = 0; i < n; i++) if (r.mask[i]) union[i] = 1;

  let unionCount = 0, paintedIn = 0, paintedOut = 0;
  for (let i = 0; i < n; i++) {
    if (union[i]) { unionCount++; if (paint[i]) paintedIn++; }
    else if (paint[i]) paintedOut++;
  }
  const painted = paintedIn + paintedOut;
  const coverage = unionCount ? paintedIn / unionCount : 0;
  const spill = painted ? paintedOut / painted : 0;

  const perRegion = {};
  let weakestId = null, weakest = Infinity;
  for (const r of regions) {
    let total = 0, hit = 0;
    for (let i = 0; i < n; i++) if (r.mask[i]) { total++; if (paint[i]) hit++; }
    const frac = total ? hit / total : 0;
    perRegion[r.id] = frac;
    if (frac < weakest) { weakest = frac; weakestId = r.id; }
  }

  const regionsOk = th.regionMin === null || Object.values(perRegion).every((f) => f >= th.regionMin);
  const passed = coverage >= th.coverage && regionsOk && (th.spillMax === null || spill <= th.spillMax);
  return { passed, coverage, perRegion, spill, weakestRegionId: passed ? null : weakestId };
}

const BIG = 1e12;

/** Exakte 1D-Transformation der quadrierten Abstände (Felzenszwalb & Huttenlocher). */
function edt1d(f, n, d, v, z) {
  let k = 0;
  v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const p = v[k];
    d[q] = (q - p) * (q - p) + f[p];
  }
}

/** Euklidischer Abstand jeder Zelle zur nächsten Saatzelle. */
function distanceMap(seeds, grid) {
  const n = grid * grid;
  const g = new Float64Array(n);
  for (let i = 0; i < n; i++) g[i] = seeds[i] ? 0 : BIG;
  const f = new Float64Array(grid), d = new Float64Array(grid);
  const v = new Int32Array(grid), z = new Float64Array(grid + 1);
  for (let x = 0; x < grid; x++) {
    for (let y = 0; y < grid; y++) f[y] = g[y * grid + x];
    edt1d(f, grid, d, v, z);
    for (let y = 0; y < grid; y++) g[y * grid + x] = d[y];
  }
  const out = new Float32Array(n);
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) f[x] = g[y * grid + x];
    edt1d(f, grid, d, v, z);
    for (let x = 0; x < grid; x++) out[y * grid + x] = d[x] >= BIG / 2 ? Infinity : Math.sqrt(d[x]);
  }
  return out;
}

/** Bewertung fürs Nachspuren und Schreiben. */
export function evaluateTrace({ linePoints, paint }, th, grid = GRID) {
  const pts = (linePoints || []).filter(([x, y]) => x >= 0 && y >= 0 && x < grid && y < grid);
  let painted = 0;
  for (let i = 0; i < paint.length; i++) if (paint[i]) painted++;
  if (!pts.length || !painted) {
    return { passed: false, coverage: 0, spill: 0, firstMissedPoint: pts[0] || null };
  }

  const distToPaint = distanceMap(paint, grid);
  let covered = 0, firstMissedPoint = null;
  for (const p of pts) {
    const d = distToPaint[Math.round(p[1]) * grid + Math.round(p[0])];
    if (d <= th.tolerance) covered++;
    else if (!firstMissedPoint) firstMissedPoint = p;
  }

  const lineSeeds = new Uint8Array(grid * grid);
  for (const [x, y] of pts) lineSeeds[Math.round(y) * grid + Math.round(x)] = 1;
  const distToLine = distanceMap(lineSeeds, grid);
  let far = 0;
  for (let i = 0; i < paint.length; i++) if (paint[i] && distToLine[i] > 2 * th.tolerance) far++;

  const coverage = covered / pts.length;
  const spill = far / painted;
  const passed = coverage >= th.coverage && (th.spillMax === null || spill <= th.spillMax);
  return { passed, coverage, spill, firstMissedPoint: passed ? null : firstMissedPoint };
}

/** Bewertung für Wörter: jeder Buchstabe muss genug abgefahren sein; "daneben" zählt gegen das ganze Wort. */
export function evaluateTraceGroups({ groups, paint }, th, grid = GRID) {
  const perLetter = groups.map((linePoints) => evaluateTrace({ linePoints, paint }, { ...th, spillMax: null }, grid));
  const whole = evaluateTrace({ linePoints: groups.flat(), paint }, { ...th, coverage: 0 }, grid);
  const missing = perLetter.find((r) => r.coverage < th.coverage);
  const coverage = perLetter.length ? Math.min(...perLetter.map((r) => r.coverage)) : 0;
  const passed = perLetter.length > 0 && !missing && (th.spillMax === null || whole.spill <= th.spillMax);
  return { passed, coverage, spill: whole.spill, firstMissedPoint: missing ? missing.firstMissedPoint : null };
}
