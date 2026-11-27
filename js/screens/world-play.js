// "Was passt nicht?" – in einer Welt die Dinge finden, die nicht dorthin gehören.
import { makeWorldRound, foundSentence, fitsSentence, WORLD_DONE } from '../worlds.js';
import { worldSvg } from '../world-images.js';
import { seededRandom } from '../pick.js';
import { sage } from '../speech.js';
import { NEW_STICKER } from '../phrases.js';
import { playPop, playPling, playJubel } from '../sound.js';
import { burst } from '../confetti.js';
import { createPenalty, showPause, PENALTY_PHRASE, PENALTY_OVER } from '../penalty.js';

export function render(root, ctx, { id }) {
  const { world, items } = makeWorldRound(id, seededRandom(Date.now() & 0xffffffff));
  const total = items.filter((x) => x.misfit).length;
  const wasDone = ctx.store.getWorlds().includes(id);
  let found = 0;
  let finished = false;
  let paused = false;
  const penalty = createPenalty();
  const timers = [];

  const screen = document.createElement('section');
  screen.className = 'screen world-screen';
  screen.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(worldSvg(id))}")`;
  screen.innerHTML = `
    <button class="btn worlds-home" aria-label="Zurück zu den Welten">🏠</button>
    <div class="world-top">
      <button class="btn world-speaker" aria-label="Nochmal hören">🔊</button>
      <div class="world-dots">${Array.from({ length: total }, () => '<span></span>').join('')}</div>
    </div>
    ${items.map((it, i) => `<button class="world-item" data-i="${i}" aria-label="${it.label}" style="left:${(it.x * 100).toFixed(1)}%;top:${(it.y * 100).toFixed(1)}%">${it.emoji}</button>`).join('')}`;
  root.appendChild(screen);
  const dots = [...screen.querySelectorAll('.world-dots span')];

  screen.querySelector('.worlds-home').addEventListener('click', () => { playPop(); ctx.go('worlds'); });
  screen.querySelector('.world-speaker').addEventListener('click', () => sage(world.question));

  screen.querySelectorAll('.world-item').forEach((el) => el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (finished || paused || el.classList.contains('found')) return; // Finger und Stift
    const item = items[Number(el.dataset.i)];
    if (item.misfit) {
      penalty.right();
      el.classList.add('found');
      dots[found].classList.add('done');
      found++;
      playPling();
      if (found === total) finish(item);
      else sage(foundSentence(world, item));
    } else {
      playPop();
      el.classList.remove('wiggle');
      void el.offsetWidth;
      el.classList.add('wiggle');
      const ms = penalty.wrong();
      if (ms) pause(ms);
      else sage(fitsSentence(world, item));
    }
  }));

  // Denkpause nach zu vielen Fehlern hintereinander
  async function pause(ms) {
    paused = true;
    sage(PENALTY_PHRASE);
    await showPause(screen, ms);
    if (finished || !screen.isConnected) return;
    paused = false;
    sage(PENALTY_OVER);
  }

  function finish(lastItem) {
    finished = true;
    ctx.store.completeWorld(id, world.stickerId);
    burst(screen, 3500);
    playJubel();
    const spoken = sage([foundSentence(world, lastItem), WORLD_DONE, ...(wasDone ? [] : [NEW_STICKER])]);
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    Promise.race([Promise.all([spoken, delay(3500)]), delay(9000)]).then(() => { if (screen.isConnected) ctx.go('worlds'); });
  }

  timers.push(setTimeout(() => sage(world.question), 300));
  return () => { finished = true; timers.forEach(clearTimeout); };
}
