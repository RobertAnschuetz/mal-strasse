// Konfetti-Regen über einem Element.
const COLORS = ['#ef4b4b', '#ffd23f', '#36b37e', '#4aa8e0', '#8e24aa', '#fb8c00', '#f48fb1'];

export function burst(container, durationMs = 2500) {
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 });
  container.appendChild(canvas);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = (canvas.width = container.clientWidth * dpr);
  const h = (canvas.height = container.clientHeight * dpr);
  const ctx = canvas.getContext('2d');
  const pieces = Array.from({ length: 140 }, () => ({
    x: w / 2 + (Math.random() - 0.5) * w * 0.3,
    y: h * 0.45,
    vx: (Math.random() - 0.5) * 22 * dpr,
    vy: (-Math.random() * 22 - 8) * dpr,
    s: (6 + Math.random() * 8) * dpr,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.4,
    c: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
  const start = performance.now();
  function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, w, h);
    for (const p of pieces) {
      p.vy += 0.6 * dpr;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t / durationMs);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore();
    }
    if (t < durationMs) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}
