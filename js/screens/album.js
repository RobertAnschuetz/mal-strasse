// Sticker-Album: 5 Seiten à 20 Plätze. Fehlende Sticker sind graue Schatten.
import { STICKERS, PAGES } from '../stickers.js';
import { sage } from '../speech.js';
import { ALBUM_EMPTY, ALBUM_FIRST, ALBUM_MANY } from '../phrases.js';
import { playPling, playPop } from '../sound.js';

const PAGE_ICONS = ['🚗', '🚦', '🧸', '🐘', '🚀', '🧩', '🏙️', '✍️', '🔍', '⏱', '🎯'];

export function render(root, ctx, params = {}) {
  const have = new Set(ctx.store.getProgress().stickers);
  let page = params.page ?? 0;

  const screen = document.createElement('section');
  screen.className = 'screen album-screen';
  root.appendChild(screen);

  function draw() {
    const items = STICKERS.filter((s) => s.page === page);
    screen.innerHTML = `
      <div class="album-book">
        <div class="album-title">${PAGE_ICONS[page]}</div>
        <div class="album-grid">
          ${items.map((s) => `<button class="sticker ${have.has(s.id) ? 'have' : 'missing'}" data-id="${s.id}" aria-label="Sticker">${s.emoji}</button>`).join('')}
        </div>
        <div class="album-dots">${PAGES.map((_, i) => `<span class="${i === page ? 'on' : ''}"></span>`).join('')}</div>
      </div>
      <button class="btn album-home" aria-label="Zur Straße">🏠</button>
      <button class="btn album-prev ${page > 0 ? '' : 'hidden'}" aria-label="Zurück">◀</button>
      <button class="btn album-next ${page < PAGES.length - 1 ? '' : 'hidden'}" aria-label="Weiter">▶</button>`;
    screen.querySelectorAll('.sticker').forEach((b) => b.addEventListener('click', () => {
      if (b.classList.contains('have')) {
        playPling();
        b.classList.remove('hop');
        void b.offsetWidth;
        b.classList.add('hop');
      } else {
        playPop();
      }
    }));
    screen.querySelector('.album-home').addEventListener('click', () => { playPop(); ctx.go('road'); });
    screen.querySelector('.album-prev').addEventListener('click', () => { playPop(); page--; draw(); });
    screen.querySelector('.album-next').addEventListener('click', () => { playPop(); page++; draw(); });
  }

  draw();
  const n = have.size;
  sage(n ? (n === 1 ? ALBUM_FIRST : ALBUM_MANY) : ALBUM_EMPTY);
}
