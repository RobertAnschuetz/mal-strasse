// Kleine, leise Töne mit Web Audio – keine Tondateien nötig.
let ctx = null;

export const getAudioContext = () => ctx;

export function unlockAudio() {
  try {
    ctx = ctx || new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch { ctx = null; }
}

function tone(freq, start, dur, type = 'sine', vol = 0.12) {
  if (!ctx) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function playPling() {
  tone(880, 0, 0.25, 'triangle');
  tone(1320, 0.08, 0.3, 'triangle', 0.08);
}

export function playPop() {
  tone(520, 0, 0.12, 'sine', 0.1);
}

export function playJubel() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.35, 'triangle'));
  tone(1047, 0.5, 0.6, 'sine', 0.1);
  tone(1319, 0.5, 0.6, 'sine', 0.07);
}
