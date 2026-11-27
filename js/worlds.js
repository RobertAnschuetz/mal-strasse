// "Was passt nicht?": Welten mit passenden und unpassenden Dingen. Rein, ohne Browser.

const T = (emoji, label) => ({ emoji, label });

export const WORLDS = [
  {
    id: 'dschungel', name: 'Dschungel', icon: '🌴', where: 'in den Dschungel',
    fits: [T('🐒', 'der Affe'), T('🐍', 'die Schlange'), T('🦜', 'der Papagei'), T('🐯', 'der Tiger'), T('🐘', 'der Elefant'),
      T('🦍', 'der Gorilla'), T('🌴', 'die Palme'), T('🍌', 'die Banane'), T('🐸', 'der Frosch'), T('🦋', 'der Schmetterling')],
    misfits: [T('🚗', 'das Auto'), T('🚲', 'das Fahrrad'), T('🐧', 'der Pinguin'), T('⛄', 'der Schneemann'),
      T('📺', 'der Fernseher'), T('🐻‍❄️', 'der Eisbär'), T('🚒', 'das Feuerwehrauto'), T('🛴', 'der Roller')],
  },
  {
    id: 'aegypten', name: 'Altes Ägypten', icon: '🐪', where: 'ins alte Ägypten',
    fits: [T('🐪', 'das Kamel'), T('🌴', 'die Palme'), T('🐍', 'die Schlange'), T('🦂', 'der Skorpion'), T('🐈', 'die Katze'),
      T('🏺', 'der Krug'), T('🐊', 'das Krokodil'), T('🦅', 'der Adler'), T('☀️', 'die Sonne'), T('🦛', 'das Nilpferd')],
    misfits: [T('📱', 'das Handy'), T('🚗', 'das Auto'), T('🍕', 'die Pizza'), T('✈️', 'das Flugzeug'),
      T('🎮', 'die Spielkonsole'), T('🚲', 'das Fahrrad'), T('🐧', 'der Pinguin'), T('🎧', 'der Kopfhörer')],
  },
  {
    id: 'weltall', name: 'Weltall', icon: '🚀', where: 'ins Weltall',
    fits: [T('🚀', 'die Rakete'), T('🛸', 'das Ufo'), T('🪐', 'der Planet'), T('🌙', 'der Mond'), T('⭐', 'der Stern'),
      T('☄️', 'der Komet'), T('👨‍🚀', 'der Astronaut'), T('🛰️', 'der Satellit'), T('🌍', 'die Erde'), T('👽', 'der Außerirdische')],
    misfits: [T('🐟', 'der Fisch'), T('🌳', 'der Baum'), T('🚗', 'das Auto'), T('🐮', 'die Kuh'),
      T('🌂', 'der Regenschirm'), T('🚲', 'das Fahrrad'), T('🍦', 'das Eis'), T('🐶', 'der Hund')],
  },
  {
    id: 'unterwasser', name: 'Unterwasser', icon: '🐠', where: 'unter Wasser',
    fits: [T('🐠', 'der Fisch'), T('🐙', 'die Krake'), T('🦀', 'der Krebs'), T('🐬', 'der Delfin'), T('🐳', 'der Wal'),
      T('🦈', 'der Hai'), T('🐢', 'die Schildkröte'), T('🐚', 'die Muschel'), T('🪸', 'die Koralle'), T('🦑', 'der Tintenfisch')],
    misfits: [T('🚗', 'das Auto'), T('🐱', 'die Katze'), T('🔥', 'das Feuer'), T('🎈', 'der Luftballon'),
      T('🚂', 'der Zug'), T('🌵', 'der Kaktus'), T('🐿️', 'das Eichhörnchen'), T('🦒', 'die Giraffe')],
  },
  {
    id: 'bahnhof', name: 'Bahnhof', icon: '🚉', where: 'zum Bahnhof',
    fits: [T('🚂', 'die Lokomotive'), T('🚆', 'der Zug'), T('🚃', 'der Waggon'), T('🧳', 'der Koffer'), T('🕐', 'die Uhr'),
      T('🎫', 'die Fahrkarte'), T('🥨', 'die Brezel'), T('☕', 'der Kaffee'), T('🚋', 'die Straßenbahn'), T('🎒', 'der Rucksack')],
    misfits: [T('🐄', 'die Kuh'), T('🛶', 'das Kanu'), T('🐳', 'der Wal'), T('🌋', 'der Vulkan'),
      T('🛏️', 'das Bett'), T('🦒', 'die Giraffe'), T('🎄', 'der Weihnachtsbaum'), T('🐊', 'das Krokodil')],
  },
  {
    id: 'flughafen', name: 'Flughafen', icon: '✈️', where: 'zum Flughafen',
    fits: [T('✈️', 'das Flugzeug'), T('🚁', 'der Hubschrauber'), T('🧳', 'der Koffer'), T('🛩️', 'das kleine Flugzeug'), T('🎫', 'das Ticket'),
      T('🕶️', 'die Sonnenbrille'), T('🧑‍✈️', 'der Pilot'), T('📸', 'die Kamera'), T('☕', 'der Kaffee'), T('🎒', 'der Rucksack')],
    misfits: [T('🐄', 'die Kuh'), T('🚜', 'der Traktor'), T('🐠', 'der Fisch'), T('⛵', 'das Segelboot'),
      T('🦕', 'der Dino'), T('🏰', 'die Burg'), T('🐌', 'die Schnecke'), T('🌽', 'der Mais')],
  },
  {
    id: 'kindergarten', name: 'Kindergarten', icon: '🧸', where: 'in den Kindergarten',
    fits: [T('🧸', 'der Teddy'), T('🧩', 'das Puzzle'), T('🖍️', 'der Wachsmalstift'), T('🎨', 'die Farben'), T('📚', 'die Bücher'),
      T('🥁', 'die Trommel'), T('🎲', 'der Würfel'), T('🎈', 'der Luftballon'), T('🍎', 'der Apfel'), T('✂️', 'die Schere')],
    misfits: [T('🦁', 'der Löwe'), T('🚀', 'die Rakete'), T('🦈', 'der Hai'), T('🏍️', 'das Motorrad'),
      T('🐊', 'das Krokodil'), T('🌋', 'der Vulkan'), T('🚜', 'der Traktor'), T('🐫', 'das Kamel')],
  },
  {
    id: 'spielplatz', name: 'Spielplatz', icon: '🛝', where: 'auf den Spielplatz',
    fits: [T('⚽', 'der Ball'), T('🪁', 'der Drachen'), T('🛝', 'die Rutsche'), T('🪣', 'der Eimer'), T('🛴', 'der Roller'),
      T('🚲', 'das Fahrrad'), T('🌳', 'der Baum'), T('🐦', 'der Vogel'), T('🍦', 'das Eis'), T('🏀', 'der Basketball')],
    misfits: [T('🐋', 'der Wal'), T('🛸', 'das Ufo'), T('🐫', 'das Kamel'), T('🛁', 'die Badewanne'),
      T('🦈', 'der Hai'), T('🚂', 'der Zug'), T('🐙', 'die Krake'), T('🛏️', 'das Bett')],
  },
].map((w, index) => ({ ...w, index, question: `Was passt nicht ${w.where}?`, stickerId: `st-8-${index}` }));

const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);
/** "Richtig! Das Auto passt nicht in den Dschungel." */
export const foundSentence = (world, item) => `Richtig! ${capital(item.label)} passt nicht ${world.where}.`;
/** "Der Affe passt gut in den Dschungel." */
export const fitsSentence = (world, item) => `${capital(item.label)} passt gut ${world.where}.`;
export const WORLD_DONE = 'Super! Du hast alles gefunden!';
export const WORLDS_PICK = 'Such dir eine Welt aus!';

function shuffle(list, rng) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Eine Runde: 9 passende + 3–5 unpassende Dinge, ohne Überlappung verteilt (x, y als Anteil der Fläche). */
export function makeWorldRound(worldId, rng = Math.random) {
  const world = WORLDS.find((w) => w.id === worldId);
  if (!world) throw new Error(`Unbekannte Welt: ${worldId}`);
  const misfitCount = 3 + Math.floor(rng() * 3);
  const chosen = [
    ...shuffle(world.fits, rng).slice(0, 9).map((x) => ({ ...x, misfit: false })),
    ...shuffle(world.misfits, rng).slice(0, misfitCount).map((x) => ({ ...x, misfit: true })),
  ];
  const cols = 5, rows = 3;
  const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => i), rng);
  const cw = 0.84 / cols, ch = 0.70 / rows;
  const items = shuffle(chosen, rng).map((item, i) => {
    const c = cells[i] % cols, r = Math.floor(cells[i] / cols);
    return {
      ...item,
      x: 0.08 + cw * (c + 0.5) + (rng() - 0.5) * 0.25 * cw,
      y: 0.18 + ch * (r + 0.5) + (rng() - 0.5) * 0.25 * ch,
    };
  });
  return { world, items };
}
