// "Hör genau hin": Die Stimme nennt ein Zeichen, das Kind tippt die richtige Karte an. 3 Fragen pro Schild.
import { STATIONS, nameLetters } from '../curriculum.js';
import { makeRounds, pickPrompt, seededRandom, itemWord } from '../pick.js';
import { sage, randomFrom } from '../speech.js';
import { RIGHT, PICK_INTRO, SEQ_INTRO, pickIs } from '../phrases.js';
import { playPling, playPop } from '../sound.js';
import { createPenalty, showPause, PENALTY_PHRASE } from '../penalty.js';


function cardFace(item) {
  if (item.kind !== 'symbol') return `<span class="pick-char">${item.value}</span>`;
  if (item.emoji) return `<span class="pick-emoji">${item.emoji}</span>`;
  return `<svg viewBox="0 0 200 200" class="pick-shape"><path d="${item.d}" fill="${item.color}" stroke="#26323d" stroke-width="8" stroke-linejoin="round"/></svg>`;
}


export function render(root, ctx, { stationIndex }) {
  const station = STATIONS[stationIndex];
  const name = ctx.store.getName() || '';
  const rounds = makeRounds(station.level, nameLetters(name), seededRandom(Date.now() & 0xffffffff));
  let round = 0;
  let locked = false;
  let paused = false;
  const penalty = createPenalty();
  const timers = [];

  const screen = document.createElement('section');
  screen.className = 'screen pick-screen';
  screen.innerHTML = `
    <button class="btn pick-home" aria-label="Zur Straße">🏠</button>
    <div class="pick-top">
      <button class="btn pick-speaker" aria-label="Nochmal hören">👂</button>
      <div class="pick-dots">${rounds.map(() => '<span></span>').join('')}</div>
    </div>
    <div class="pick-grid"></div>`;
  root.appendChild(screen);
  const grid = screen.querySelector('.pick-grid');
  const dots = [...screen.querySelectorAll('.pick-dots span')];

  let step = 0; // wie viele Dinge der aktuellen Folge schon richtig angetippt sind
  const current = () => rounds[round].sequence[step];
  // Einzelne Frage: "Wo ist das M?" – Folge: "Hör gut zu und tipp nacheinander! Apfel. Banane. Kirsche."
  const question = (intro = false) => {
    const seq = rounds[round].sequence;
    if (seq.length === 1) return intro ? [PICK_INTRO, pickPrompt(seq[0])] : [pickPrompt(seq[0])];
    return [SEQ_INTRO, ...seq.slice(step).map(itemWord)];
  };
  const ask = () => sage(question());
  screen.querySelector('.pick-speaker').addEventListener('click', ask);
  screen.querySelector('.pick-home').addEventListener('click', () => { playPop(); ctx.go('road'); });

  function show(speak = true) {
    const { options, sequence } = rounds[round];
    step = 0;
    grid.className = `pick-grid n${options.length}`;
    grid.innerHTML = '';
    for (const item of options) {
      const card = document.createElement('button');
      card.className = 'pick-card';
      card.setAttribute('aria-label', item.label);
      card.innerHTML = cardFace(item);
      if (ctx.testMode) card.dataset.order = String(sequence.findIndex((x) => x.id === item.id));
      card.addEventListener('pointerdown', (e) => { e.preventDefault(); choose(card, item); });
      grid.appendChild(card);
    }
    locked = false;
    if (speak) ask();
  }

  function choose(card, item) {
    if (locked || paused || card.classList.contains('right')) return;
    const seq = rounds[round].sequence;
    if (item.id === current().id) {
      penalty.right();
      card.classList.add('right');
      if (seq.length > 1) card.insertAdjacentHTML('beforeend', `<span class="pick-order">${step + 1}</span>`);
      playPling();
      step++;
      if (step < seq.length) return; // weiter mit dem nächsten Ding der Folge
      locked = true;
      dots[round].classList.add('done');
      sage(randomFrom(RIGHT));
      round++;
      timers.push(setTimeout(() => {
        if (round >= rounds.length) ctx.go('reward', { stationIndex });
        else show();
      }, 1200));
    } else {
      // Kein Verlieren: sagen, was es war, und nach dem nächsten richtigen Ding fragen
      playPop();
      card.classList.remove('wrong');
      void card.offsetWidth;
      card.classList.add('wrong');
      const ms = penalty.wrong();
      if (ms) pause(ms);
      else sage([pickIs(item), pickPrompt(current())]);
    }
  }

  // Denkpause nach zu vielen Fehlern hintereinander, danach die Frage noch einmal
  async function pause(ms) {
    paused = true;
    sage(PENALTY_PHRASE);
    await showPause(screen, ms);
    if (!screen.isConnected) return;
    paused = false;
    ask();
  }

  show(false);
  timers.push(setTimeout(() => sage(question(true)), 300));

  return () => timers.forEach(clearTimeout);
}
