// Labyrinth-Logik für die Dranbleib-Spiele. Rein, ohne Browser. Zellen als [spalte, zeile].

const SIZES = [[3, 3], [4, 3], [4, 4], [5, 4], [5, 5], [6, 4], [6, 5], [7, 5], [7, 6], [8, 5], [8, 6], [9, 6]];
const clampLevel = (l) => Math.min(12, Math.max(1, Math.floor(l) || 1));

export const mazeSizeFor = (level) => { const [cols, rows] = SIZES[clampLevel(level) - 1]; return { cols, rows }; };
export const mazesPerRound = (level) => (clampLevel(level) <= 4 ? 3 : clampLevel(level) <= 8 ? 2 : 1);

const DIRS = { n: [0, -1, 's'], e: [1, 0, 'w'], s: [0, 1, 'n'], w: [-1, 0, 'e'] };

/** Perfektes Labyrinth per Tiefensuche: genau ein Weg zwischen je zwei Zellen. */
export function generateMaze(cols, rows, rng = Math.random) {
  const walls = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ n: true, e: true, s: true, w: true })));
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
  const stack = [[0, 0]];
  seen[0][0] = true;
  while (stack.length) {
    const [c, r] = stack[stack.length - 1];
    const options = Object.entries(DIRS).filter(([, [dc, dr]]) => {
      const nc = c + dc, nr = r + dr;
      return nc >= 0 && nr >= 0 && nc < cols && nr < rows && !seen[nr][nc];
    });
    if (!options.length) { stack.pop(); continue; }
    const [dir, [dc, dr, back]] = options[Math.floor(rng() * options.length)];
    walls[r][c][dir] = false;
    walls[r + dr][c + dc][back] = false;
    seen[r + dr][c + dc] = true;
    stack.push([c + dc, r + dr]);
  }
  return { cols, rows, walls };
}

const dirBetween = ([c, r], [c2, r2]) => Object.keys(DIRS).find((d) => DIRS[d][0] === c2 - c && DIRS[d][1] === r2 - r);

export function canMove(maze, from, to) {
  const [c, r] = from;
  if (c < 0 || r < 0 || c >= maze.cols || r >= maze.rows) return false;
  const d = dirBetween(from, to);
  if (!d) return false;
  const [c2, r2] = to;
  if (c2 < 0 || r2 < 0 || c2 >= maze.cols || r2 >= maze.rows) return false;
  return !maze.walls[r][c][d];
}

/** Kürzester Weg (Breitensuche), inklusive Start und Ziel. */
export function shortestPath(maze, from, to) {
  const key = ([c, r]) => `${c},${r}`;
  const prev = new Map([[key(from), null]]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift();
    if (cur[0] === to[0] && cur[1] === to[1]) break;
    for (const [dc, dr] of Object.values(DIRS)) {
      const next = [cur[0] + dc, cur[1] + dr];
      if (!prev.has(key(next)) && canMove(maze, cur, next)) { prev.set(key(next), cur); queue.push(next); }
    }
  }
  if (!prev.has(key(to))) return [];
  const path = [];
  for (let p = to; p; p = prev.get(key(p))) path.unshift(p);
  return path;
}

/** Höchstens eine Zelle Richtung Zeiger; an einer Wand bleibt das Auto stehen (bumped). */
export function stepToward(maze, car, pointer) {
  const dc = pointer[0] - car[0], dr = pointer[1] - car[1];
  if (!dc && !dr) return { cell: car, bumped: false };
  const horizontal = [car[0] + Math.sign(dc), car[1]];
  const vertical = [car[0], car[1] + Math.sign(dr)];
  const [first, second] = Math.abs(dc) >= Math.abs(dr) ? [horizontal, vertical] : [vertical, horizontal];
  if (canMove(maze, car, first)) return { cell: first, bumped: false };
  // Ecke abgekürzt: die andere Richtung nehmen, wenn sie auch näher an den Finger bringt
  const closer = (dc && second === horizontal) || (dr && second === vertical);
  if (closer && canMove(maze, car, second)) return { cell: second, bumped: false };
  return { cell: car, bumped: true };
}
