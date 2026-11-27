// Kleine Helfer, um SVG-Pfade im 200er-Raster zu bauen.
const r1 = (n) => Math.round(n * 10) / 10;

export const ellipse = (cx, cy, rx, ry) =>
  `M ${r1(cx - rx)} ${cy} A ${rx} ${ry} 0 1 0 ${r1(cx + rx)} ${cy} A ${rx} ${ry} 0 1 0 ${r1(cx - rx)} ${cy} Z`;

export const circle = (cx, cy, r) => ellipse(cx, cy, r, r);

export const rect = (x, y, w, h, r = 0) => {
  if (!r) return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  return `M ${x + r} ${y} L ${x + w - r} ${y} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${y + h - r} ` +
    `A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} L ${x + r} ${y + h} A ${r} ${r} 0 0 1 ${x} ${y + h - r} ` +
    `L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
};

export const poly = (...pts) => `M ${pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join(' L ')} Z`;

export const ngon = (cx, cy, r, n, rotDeg = -90) =>
  poly(...Array.from({ length: n }, (_, i) => {
    const a = ((rotDeg + (360 / n) * i) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }));

export const star = (cx, cy, outer, inner, n, rotDeg = -90) =>
  poly(...Array.from({ length: n * 2 }, (_, i) => {
    const a = ((rotDeg + (180 / n) * i) * Math.PI) / 180;
    const r = i % 2 ? inner : outer;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }));

/** Fläche zum Ausmalen. */
export const R = (id, label, d) => ({ id, label, d });
/** Fläche, die als dicker Strich gerastert wird (Arme, Leitern, Bögen …). */
export const S = (id, label, d, strokeWidth) => ({ id, label, d, strokeWidth });
/** Linie zum Nachspuren / Detail. */
export const L = (d) => ({ d });
