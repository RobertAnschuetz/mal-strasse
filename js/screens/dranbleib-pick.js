// Dranbleib-Spiele aussuchen: Labyrinth, Garagen, Paare finden, Unterschiede.
import { DRANBLEIB_PHRASES } from '../dranbleib.js';
import { sage } from '../speech.js';
import { playPop } from '../sound.js';

export function render(root, ctx) {
  const { levels, stars } = ctx.store.getDranbleib();
  const screen = document.createElement('section');
  screen.className = 'screen dranbleib-screen';
  screen.innerHTML = `
    <button class="btn worlds-home" aria-label="Zur Straße">🏠</button>
    <div class="dranbleib-stars" aria-label="Dranbleib-Sterne">🌟 <b>${stars}</b></div>
    <div class="dranbleib-cards">
      <button class="dranbleib-card" data-go="mazePlay" aria-label="Labyrinth">
        <span class="dranbleib-icon">🚗🏁</span><span class="dranbleib-name">Labyrinth</span><span class="dranbleib-level">Stufe ${levels.maze}</span>
      </button>
      <button class="dranbleib-card" data-go="garagePlay" aria-label="Garagen">
        <span class="dranbleib-icon">🏠🚗🏠</span><span class="dranbleib-name">Garagen</span><span class="dranbleib-level">Stufe ${levels.garage}</span>
      </button>
      <button class="dranbleib-card" data-go="memoryPlay" aria-label="Paare finden">
        <span class="dranbleib-icon">🐶🐶</span><span class="dranbleib-name">Paare finden</span><span class="dranbleib-level">Stufe ${levels.memory}</span>
      </button>
      <button class="dranbleib-card" data-go="diffPlay" aria-label="Unterschiede finden">
        <span class="dranbleib-icon">🖼️🔍</span><span class="dranbleib-name">Unterschiede</span><span class="dranbleib-level">Stufe ${levels.diff}</span>
      </button>
    </div>`;
  root.appendChild(screen);
  screen.querySelector('.worlds-home').addEventListener('click', () => { playPop(); ctx.go('road'); });
  screen.querySelectorAll('.dranbleib-card').forEach((b) => b.addEventListener('click', () => { playPop(); ctx.go(b.dataset.go); }));
  sage(DRANBLEIB_PHRASES.pick);
}
