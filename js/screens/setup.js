// Einmalige Einrichtung (für die Eltern): Name des Kindes.
export function render(root, ctx) {
  const screen = document.createElement('section');
  screen.className = 'screen setup-screen';
  screen.innerHTML = `
    <div class="setup-card">
      <div class="setup-car">🚗</div>
      <h1>Mal-Straße</h1>
      <label for="kid-name">Wie heißt dein Kind?</label>
      <input id="kid-name" type="text" autocomplete="off" autocapitalize="words" maxlength="20" placeholder="Name">
      <button class="btn btn-go setup-go" disabled>Los</button>
      <p class="setup-hint">Der Name bleibt nur auf diesem Gerät.</p>
    </div>`;
  root.appendChild(screen);
  const input = screen.querySelector('input');
  const go = screen.querySelector('.setup-go');
  input.addEventListener('input', () => { go.disabled = !input.value.trim(); });
  const submit = () => {
    if (!input.value.trim()) return;
    ctx.store.setName(input.value);
    ctx.go('start');
  };
  go.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  setTimeout(() => input.focus(), 300);
}
