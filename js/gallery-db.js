// Fertige Bilder in IndexedDB. Fällt bei Problemen auf den Arbeitsspeicher zurück.
// Jede Operation hat eine Zeitgrenze – iOS Safari antwortet manchmal gar nicht.
import { mapIndex } from './curriculum.js';

const DB = 'malstrasse';
const STORE = 'bilder';
const TIMEOUT_MS = 1500;
const memory = [];
let dbPromise = null;

const withTimeout = (promise, fallback) =>
  Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(fallback), TIMEOUT_MS))]);

/** Bilder von der alten 100er-Straße (ohne v) zeigen auf das richtige neue Schild. */
export const normalizePicture = (p) => (p.v === 3 ? p : { ...p, v: 3, stationIndex: mapIndex(p.stationIndex, p.v === 2 ? 2 : 1) });

const isBlob = (b) => typeof Blob !== 'undefined' && b instanceof Blob;

function openDb() {
  if (dbPromise) return dbPromise;
  const opening = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  dbPromise = withTimeout(opening, null);
  return dbPromise;
}

const done = (tx) => new Promise((resolve) => { tx.oncomplete = () => resolve(true); tx.onerror = tx.onabort = () => resolve(false); });

export async function addPicture({ stationIndex, blob }) {
  if (!isBlob(blob)) return;
  const entry = { stationIndex, blob, createdAt: Date.now(), v: 3 };
  const db = await openDb();
  if (db) {
    try {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).add(entry);
      if (await withTimeout(done(tx), false)) return;
    } catch { /* unten im Speicher ablegen */ }
  }
  memory.push({ id: `m${memory.length}`, ...entry });
}

export async function listPictures() {
  let rows = [];
  const db = await openDb();
  if (db) {
    try {
      rows = await withTimeout(new Promise((resolve) => {
        const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      }), []);
    } catch { rows = []; }
  }
  return [...rows, ...memory].filter((p) => isBlob(p.blob)).map(normalizePicture).sort((a, b) => b.createdAt - a.createdAt);
}
