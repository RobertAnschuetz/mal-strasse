// Puzzle-Welt: alle 20 Puzzles zur freien Auswahl (freiwillig – die Straße läuft ohne sie weiter).
import { PUZZLES } from '../puzzle.js';
import { sceneSvg } from '../puzzle-images.js';
import { sage } from '../speech.js';
import { PUZZLE_WORLD } from '../phrases.js';
import { playPop } from '../sound.js';

const thumbUrl = (id) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sceneSvg(id))}`;

export function render(root, ctx) {
  const done = new Set(ctx.store.getPuzzles());
  const screen = document.createElement('section');
  screen.className = 'screen puzzles-screen';
  screen.innerHTML = `
    <button class="btn puzzles-home" aria-label="Zur Straße">🏠</button>
    <div class="puzzles-grid">
      ${PUZZLES.map((p) => `
        <button class="puzzle-card ${done.has(p.index) ? 'done' : ''}" data-i="${p.index}" aria-label="${p.label}">
          <img src="${thumbUrl(p.id)}" alt="">
          <span class="puzzle-count">🧩 ${p.pieces}</span>
          ${done.has(p.index) ? '<span class="puzzle-check">✔</span>' : ''}
        </button>`).join('')}
    </div>`;
  root.appendChild(screen);
  screen.querySelector('.puzzles-home').addEventListener('click', () => { playPop(); ctx.go('road'); });
  screen.querySelectorAll('.puzzle-card').forEach((b) => b.addEventListener('click', () => {
    playPop();
    ctx.go('puzzlePlay', { index: Number(b.dataset.i) });
  }));
  sage(PUZZLE_WORLD);
}
