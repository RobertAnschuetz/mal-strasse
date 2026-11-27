// Denkpause: Wer zu oft hintereinander danebentippt, muss kurz warten. Keine harte Strafe –
// nur ein paar Sekunden Pause, damit sich Raten nicht lohnt und genaues Hinschauen schon.

/** Nach so vielen Fehlern hintereinander (ohne einen Treffer dazwischen) kommt die Pause. */
export const WRONG_IN_A_ROW = 3;
/** Pausenlänge in ms: die erste kurz, jede weitere auf derselben Seite etwas länger (höchstens 8 s). */
export const PAUSES = [4000, 6000, 8000];
export const PENALTY_PHRASE = 'Stopp! Nicht einfach raten. Schau erst ganz genau hin.';
export const PENALTY_OVER = 'So, jetzt weiter. Schau genau!';

/** Zähler für eine Seite. wrong() liefert die Pausenlänge in ms (0 = keine Pause). */
export function createPenalty({ threshold = WRONG_IN_A_ROW, pauses = PAUSES } = {}) {
  let streak = 0;
  let count = 0;
  return {
    wrong() {
      streak++;
      if (streak < threshold) return 0;
      streak = 0;
      return pauses[Math.min(count++, pauses.length - 1)];
    },
    right() { streak = 0; },
    get pauses() { return count; },
  };
}

/** Zeigt die Denkpause über der Seite (Sanduhr + ablaufender Balken). Löst nach ms auf. */
export function showPause(screen, ms) {
  const el = document.createElement('div');
  el.className = 'penalty-overlay';
  el.innerHTML = `<div class="penalty-box"><div class="penalty-icon">⏳</div><div class="penalty-bar"><div style="animation-duration:${ms}ms"></div></div></div>`;
  // Tippen während der Pause bleibt ohne Wirkung
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); });
  screen.appendChild(el);
  return new Promise((resolve) => setTimeout(() => { el.remove(); resolve(); }, ms));
}
