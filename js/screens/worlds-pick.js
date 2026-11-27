// "Was passt nicht?" – Welt aussuchen (freiwillig, wie die Puzzles).
import { WORLDS, WORLDS_PICK } from '../worlds.js';
import { worldSvg } from '../world-images.js';
import { sage } from '../speech.js';
import { playPop } from '../sound.js';

const bgUrl = (id) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(worldSvg(id))}`;

export function render(root, ctx) {
  const done = new Set(ctx.store.getWorlds());
  const screen = document.createElement('section');
  screen.className = 'screen worlds-screen';
  screen.innerHTML = `
    <button class="btn worlds-home" aria-label="Zur Straße">🏠</button>
    <div class="worlds-grid">
      ${WORLDS.map((w) => `
        <button class="world-card ${done.has(w.id) ? 'done' : ''}" data-id="${w.id}" aria-label="${w.name}"
          style="background-image:url(&quot;${bgUrl(w.id)}&quot;)">
          <span class="world-icon">${w.icon}</span>
          <span class="world-name">${w.name}</span>
          ${done.has(w.id) ? '<span class="puzzle-check">✔</span>' : ''}
        </button>`).join('')}
    </div>`;
  root.appendChild(screen);
  screen.querySelector('.worlds-home').addEventListener('click', () => { playPop(); ctx.go('road'); });
  screen.querySelectorAll('.world-card').forEach((b) => b.addEventListener('click', () => {
    playPop();
    ctx.go('worldPlay', { id: b.dataset.id });
  }));
  sage(WORLDS_PICK);
}
