// Garagen-Hütchenspiel: Auto fährt in eine Garage, Garagen werden gemischt, wo ist das Auto?
import { garageCountFor, swapsFor, swapDurationFor, distractorsFor, makeShuffle, SHUFFLES_PER_ROUND } from '../garages.js';
import { roundStar, DRANBLEIB_PHRASES } from '../dranbleib.js';
import { seededRandom } from '../pick.js';
import { sage } from '../speech.js';
import { playPop, playPling } from '../sound.js';
import { createSession } from './dranbleib-session.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function render(root, ctx) {
  const screen = document.createElement('section');
  screen.className = 'screen garage-screen';
  screen.innerHTML = `<button class="btn worlds-home" aria-label="Zurück">🏠</button><div class="garage-stage"></div>`;
  root.appendChild(screen);
  const stage = screen.querySelector('.garage-stage');
  const session = createSession(screen, ctx, 'garage', () => SHUFFLES_PER_ROUND);
  const level = session.level;
  const n = garageCountFor(level);
  const rng = seededRandom(Date.now() & 0xffffffff);
  let alive = true;
  let tapResolve = null;

  screen.querySelector('.worlds-home').addEventListener('click', () => { playPop(); ctx.go('dranbleib'); });

  // Garagen-Elemente; slotOf[g] = Platz der Garage g
  const garages = Array.from({ length: n }, (_, g) => {
    const el = document.createElement('button');
    el.className = 'garage';
    el.setAttribute('aria-label', 'Garage');
    el.innerHTML = '<div class="garage-roof"></div><div class="garage-body"><div class="garage-car">🚗</div><div class="garage-door"></div></div>';
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!tapResolve) return; // Finger und Stift
      const r = tapResolve; tapResolve = null; r(g);
    });
    stage.appendChild(el);
    return el;
  });
  const slotOf = garages.map((_, g) => g);
  const car = document.createElement('div');
  car.className = 'garage-driver';
  car.textContent = '🚗';
  stage.appendChild(car);

  const place = (duration = 0) => garages.forEach((el, g) => {
    el.style.transition = duration ? `left ${duration}ms ease-in-out, transform ${duration / 2}ms ease-in-out` : 'none';
    el.style.left = `${((slotOf[g] + 0.5) / n) * 100}%`;
  });
  const setDoor = (g, open) => garages[g].classList.toggle('open', open);
  const garageAtSlot = (s) => slotOf.indexOf(s);
  place();

  async function oneShuffle(failedTries) {
    // 1) Auto fährt sichtbar in eine Garage
    garages.forEach((_, g) => { setDoor(g, true); garages[g].classList.remove('has-car', 'empty'); });
    const startSlot = Math.floor(rng() * n);
    const target = garageAtSlot(startSlot);
    car.style.transition = 'none';
    car.style.left = '-10%';
    car.style.opacity = '1';
    await wait(50);
    car.style.transition = 'left 1.2s ease-in-out';
    car.style.left = `${((startSlot + 0.5) / n) * 100}%`;
    await wait(1300);
    car.style.opacity = '0';
    garages[target].classList.add('has-car');
    await wait(300);
    garages.forEach((_, g) => setDoor(g, false));
    await wait(700);
    if (!alive) return null;
    // 2) Mischen (mit Ablenkung ab Stufe 5)
    const duration = swapDurationFor(level, failedTries);
    const shuffle = makeShuffle(n, swapsFor(level, failedTries), rng);
    if (distractorsFor(level)) flyBird(shuffle.length * (duration + 80));
    for (const [i, j] of shuffle) {
      const gi = garageAtSlot(i), gj = garageAtSlot(j);
      slotOf[gi] = j; slotOf[gj] = i;
      // im Bogen tauschen: eine Garage nach oben, eine nach unten – sie verdecken sich nie
      garages[gi].style.transform = 'translateY(-45%)';
      garages[gj].style.transform = 'translateY(45%)';
      place(duration);
      await wait(duration / 2);
      garages[gi].style.transform = '';
      garages[gj].style.transform = '';
      await wait(duration / 2 + 80);
      if (!alive) return null;
    }
    // Das Auto steckt in der Garage "target" und wandert mit ihr (trackCar beschreibt dasselbe über die Plätze)
    return target;
  }

  function flyBird(total) {
    const bird = document.createElement('div');
    bird.className = 'garage-bird';
    bird.textContent = '🐦';
    bird.style.top = `${15 + rng() * 25}%`;
    bird.style.animationDuration = `${Math.max(1500, total)}ms`;
    screen.appendChild(bird);
    setTimeout(() => bird.remove(), Math.max(1500, total) + 200);
  }

  async function play() {
    await sage(distractorsFor(level) ? [DRANBLEIB_PHRASES.garageIntro, DRANBLEIB_PHRASES.distract] : DRANBLEIB_PHRASES.garageIntro);
    while (alive && !session.finished) {
      let errorsInRound = 0;
      session.showSteps(0);
      for (let s = 0; s < SHUFFLES_PER_ROUND && alive; s++) {
        let failedTries = 0;
        for (;;) {
          const target = await oneShuffle(failedTries);
          if (target === null) return;
          // Jetzt tippen – und nach 15 s freundlich erinnern
          sage(DRANBLEIB_PHRASES.tapPrompt);
          const reminder = setInterval(() => { if (alive && tapResolve) sage(DRANBLEIB_PHRASES.tapPrompt); }, 15000);
          const chosen = await new Promise((r) => { tapResolve = r; });
          clearInterval(reminder);
          if (!alive) return;
          setDoor(chosen, true);
          if (chosen === target) {
            playPling();
            sage(DRANBLEIB_PHRASES.rightGarage);
            await wait(1400);
            break;
          }
          garages[chosen].classList.add('empty');
          playPop();
          errorsInRound++;
          session.addError();
          failedTries++;
          await sage(DRANBLEIB_PHRASES.wrongGarage);
          setDoor(target, true); // kurz zeigen, wo es war
          await wait(1200);
        }
        session.showSteps(s + 1);
      }
      if (!alive) return;
      if (await session.roundDone(roundStar(errorsInRound))) return;
    }
  }

  play();
  return () => { alive = false; tapResolve = null; };
}
