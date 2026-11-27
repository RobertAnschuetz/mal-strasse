// Startbildschirm: großer Play-Knopf. Der erste Tipp schaltet Ton und Sprache frei.
import { unlockSpeech, sage } from '../speech.js';
import { GREETING } from '../phrases.js';
import { unlockAudio, playPling } from '../sound.js';
import { carSvg } from './road.js';

export function render(root, ctx) {
  const screen = document.createElement('section');
  screen.className = 'screen start-screen';
  screen.innerHTML = `
    <div class="start-sun"></div>
    <div class="start-car">${carSvg()}</div>
    <button class="btn btn-big btn-go start-play" aria-label="Los geht's">▶</button>
    <div class="start-road"></div>`;
  root.appendChild(screen);
  screen.querySelector('.start-play').addEventListener('click', () => {
    unlockSpeech();
    unlockAudio();
    playPling();
    screen.querySelector('.start-car').classList.add('drive-off');
    sage(GREETING);
    setTimeout(() => ctx.go('road', { greet: true }), 900);
  });
}
