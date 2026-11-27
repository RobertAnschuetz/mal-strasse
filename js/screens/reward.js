// Belohnung: Konfetti, Lob und ein neuer Sticker.
import { STATIONS } from '../curriculum.js';
import { stickerById } from '../stickers.js';
import { sage, randomFrom } from '../speech.js';
import { PRAISE, NEW_STICKER } from '../phrases.js';
import { playJubel } from '../sound.js';
import { burst } from '../confetti.js';

export function render(root, ctx, { stationIndex }) {
  const station = STATIONS[stationIndex];
  const wasDone = ctx.store.getProgress().completed.includes(stationIndex);
  // Sofort speichern – falls die App jetzt geschlossen wird, bleibt der Fortschritt.
  ctx.store.completeStation(stationIndex, station.stickerId);
  const sticker = stickerById(station.stickerId);
  const newSticker = !wasDone;

  const screen = document.createElement('section');
  screen.className = 'screen reward-screen';
  screen.innerHTML = `
    <div class="reward-rays"></div>
    <div class="reward-sticker ${newSticker ? '' : 'again'}">${newSticker ? sticker.emoji : '⭐'}</div>
    <div class="reward-album">📒</div>`;
  root.appendChild(screen);

  burst(screen, 3000);
  playJubel();
  const praise = randomFrom(PRAISE);
  const spoken = sage(newSticker ? [praise, NEW_STICKER] : praise);

  const shownAt = performance.now();
  let left = false;
  const leave = () => {
    if (left) return;
    left = true;
    ctx.go('road', { afterReward: true, driveFrom: wasDone ? null : stationIndex });
  };
  const flyTimer = setTimeout(() => screen.querySelector('.reward-sticker').classList.add('fly'), 2600);
  // Weiter, wenn das Lob ausgesprochen ist (mindestens 3,6 s, höchstens 6 s)
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  Promise.race([Promise.all([spoken, delay(3600)]), delay(6000)]).then(leave);
  screen.addEventListener('click', () => { if (performance.now() - shownAt > 800) leave(); });

  return () => { left = true; clearTimeout(flyTimer); };
}
