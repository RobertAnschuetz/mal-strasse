// Gemeinsamer Rahmen einer Übungszeit (5 Runden): Punkte oben, Sterne, Stufenaufstieg, Abschluss.
import { SESSION_ROUNDS, DRANBLEIB_PHRASES, nextLevel } from '../dranbleib.js';
import { sage } from '../speech.js';
import { NEW_STICKER } from '../phrases.js';
import { playPling, playJubel } from '../sound.js';
import { burst } from '../confetti.js';

/**
 * Baut die Kopfzeile (🏠, 5 Runden-Punkte, kleine Schritt-Anzeige) und liefert Helfer.
 * game: 'maze' | 'garage' | 'memory' | 'diff'
 */
export function createSession(screen, ctx, game, stepsPerRound, stepIcon = '🚗') {
  const level = ctx.store.getDranbleib().levels[game];
  let round = 0;
  let sessionErrors = 0;
  let done = false;
  const head = document.createElement('div');
  head.className = 'dranbleib-head';
  head.innerHTML = `
    <div class="dranbleib-rounds">${Array.from({ length: SESSION_ROUNDS }, () => '<span></span>').join('')}</div>
    <div class="dranbleib-steps"></div>`;
  screen.appendChild(head);
  const dots = [...head.querySelectorAll('.dranbleib-rounds span')];
  const steps = head.querySelector('.dranbleib-steps');

  const showSteps = (doneSteps, total = stepsPerRound()) => {
    steps.innerHTML = Array.from({ length: total }, (_, i) => `<span class="${i < doneSteps ? 'on' : ''}">${stepIcon}</span>`).join('');
  };

  return {
    level,
    get round() { return round; },
    get finished() { return done; },
    showSteps,
    addError() { sessionErrors++; },
    /** Runde fertig: Stern (falls verdient), Punkt füllen. Gibt true zurück, wenn die Übungszeit vorbei ist. */
    async roundDone(starEarned) {
      const gone = () => !screen.isConnected;
      dots[round].classList.add('done');
      round++;
      playPling();
      if (starEarned) {
        const { stickerIds } = ctx.store.addDranbleibStar();
        await sage(stickerIds.length ? [DRANBLEIB_PHRASES.star, NEW_STICKER] : DRANBLEIB_PHRASES.star);
      } else {
        await sage(DRANBLEIB_PHRASES.roundDone);
      }
      if (gone()) return true; // Seite verlassen: nichts mehr abschließen oder ansagen
      if (round < SESSION_ROUNDS) return false;
      done = true;
      const newLevel = nextLevel(level, sessionErrors);
      ctx.store.setDranbleibLevel(game, newLevel);
      burst(screen, 2500);
      playJubel();
      await sage(newLevel > level ? [DRANBLEIB_PHRASES.sessionDone, DRANBLEIB_PHRASES.levelUp] : DRANBLEIB_PHRASES.sessionDone);
      setTimeout(() => { if (screen.isConnected) ctx.go('dranbleib'); }, 1500);
      return true;
    },
  };
}
