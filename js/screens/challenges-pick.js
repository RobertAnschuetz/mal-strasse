// Zeit-Spiele aussuchen (freiwillig, wie Puzzles und "Was passt nicht?").
import { CHALLENGES, CHALLENGE_PHRASES, starsFor } from '../challenges.js';
import { sage } from '../speech.js';
import { playPop } from '../sound.js';

const starRow = (n) => [0, 1, 2].map((i) => `<span class="${i < n ? 'on' : ''}">★</span>`).join('');

export function render(root, ctx) {
  const best = ctx.store.getChallenges();
  const screen = document.createElement('section');
  screen.className = 'screen challenges-screen';
  screen.innerHTML = `
    <button class="btn worlds-home" aria-label="Zur Straße">🏠</button>
    <div class="challenges-grid">
      ${CHALLENGES.map((c) => `
        <button class="challenge-card" data-id="${c.id}" aria-label="${c.name}">
          <span class="challenge-icon">${c.icon}</span>
          <span class="challenge-name">${c.name}</span>
          <span class="challenge-time">⏱ ${c.seconds} s</span>
          <span class="challenge-stars">${starRow(starsFor(c, best[c.id] || 0))}</span>
        </button>`).join('')}
    </div>`;
  root.appendChild(screen);
  screen.querySelector('.worlds-home').addEventListener('click', () => { playPop(); ctx.go('road'); });
  screen.querySelectorAll('.challenge-card').forEach((b) => b.addEventListener('click', () => {
    playPop();
    ctx.go('challengePlay', { id: b.dataset.id });
  }));
  sage(CHALLENGE_PHRASES.pick);
}
