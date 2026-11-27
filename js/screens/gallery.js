// Galerie: alle fertigen Bilder.
import { listPictures } from '../gallery-db.js';
import { sage } from '../speech.js';
import { GALLERY, GALLERY_EMPTY } from '../phrases.js';
import { playPop } from '../sound.js';

export function render(root, ctx) {
  const screen = document.createElement('section');
  screen.className = 'screen gallery-screen';
  screen.innerHTML = `
    <div class="gallery-grid"></div>
    <button class="btn gallery-home" aria-label="Zur Straße">🏠</button>`;
  root.appendChild(screen);
  const grid = screen.querySelector('.gallery-grid');
  const urls = [];
  let alive = true;

  screen.querySelector('.gallery-home').addEventListener('click', () => { playPop(); ctx.go('road'); });

  listPictures().then((pics) => {
    if (!alive) return;
    if (!pics.length) {
      grid.innerHTML = '<div class="gallery-empty">🖼️</div>';
      sage(GALLERY_EMPTY);
      return;
    }
    sage(GALLERY);
    for (const p of pics) {
      const url = URL.createObjectURL(p.blob);
      urls.push(url);
      const tile = document.createElement('button');
      tile.className = 'gallery-tile';
      tile.setAttribute('aria-label', 'Bild');
      tile.innerHTML = `<img src="${url}" alt="">`;
      tile.addEventListener('click', () => open(url));
      grid.appendChild(tile);
    }
  });

  function open(url) {
    playPop();
    const big = document.createElement('div');
    big.className = 'overlay gallery-big';
    big.innerHTML = `<img src="${url}" alt="">`;
    big.addEventListener('click', () => big.remove());
    screen.appendChild(big);
  }

  return () => { alive = false; urls.forEach((u) => URL.revokeObjectURL(u)); };
}
