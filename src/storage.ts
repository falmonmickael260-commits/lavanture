import { initialState, SAVE_VERSION, type GameState } from './progress';
import { worlds, type WorldId } from './content';

const DB_NAME = 'les-mondes-de-nour';
const STORE = 'saves';
let databasePromise: Promise<IDBDatabase> | undefined;

function database(): Promise<IDBDatabase> {
  if (!databasePromise) databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return databasePromise;
}

export function migrateSave(input: unknown): GameState {
  if (!input || typeof input !== 'object') throw new Error('Sauvegarde illisible.');
  const old = input as Partial<GameState>;
  if (typeof old.version !== 'number' || old.version > SAVE_VERSION || old.version < 1) throw new Error('Version de sauvegarde incompatible.');
  const base = initialState();
  const mergedWorlds = { ...base.worlds };
  for (const world of worlds) {
    const previous = old.worlds?.[world.id];
    if (previous && typeof previous === 'object') mergedWorlds[world.id] = {
      ...base.worlds[world.id], ...previous,
      levels: previous.levels && typeof previous.levels === 'object' ? previous.levels : {},
      position: previous.position && Number.isFinite(previous.position.x) && Number.isFinite(previous.position.y) ? previous.position : base.worlds[world.id].position
    };
  }
  const state: GameState = {
    ...base, ...old, version: SAVE_VERSION, worlds: mergedWorlds,
    rewards: Array.isArray(old.rewards) ? [...new Set(old.rewards.filter((item): item is string => typeof item === 'string'))] : [],
    foundTreasures: Array.isArray(old.foundTreasures) ? old.foundTreasures.filter((id): id is WorldId => worlds.some(world => world.id === id)) : [],
    sound: { ...base.sound, ...old.sound }, outfit: { ...base.outfit, ...old.outfit },
    decor: Array.isArray(old.decor) ? old.decor.filter((item): item is string => typeof item === 'string') : [],
    skillEvidence: old.skillEvidence ?? {}, struggles: old.struggles ?? {}
  };
  if (!worlds.some(world => world.id === state.currentWorld)) state.currentWorld = 'forest';
  if (state.currentLevelId && !/^((forest|numbers|village|island|castle)-(10|[1-9]))$/.test(state.currentLevelId)) state.currentLevelId = null;
  if (state.currentLevelId) {
    const [worldId, number] = state.currentLevelId.split('-') as [WorldId, string];
    const record = state.worlds[worldId].levels[Number(number)];
    if (record && (!Number.isInteger(record.activityIndex) || record.activityIndex < 0 || record.activityIndex > worlds.find(w => w.id === worldId)!.levels[Number(number)-1].activities.length)) {
      record.activityIndex = 0;
    }
  }
  return state;
}

export async function loadSave(): Promise<GameState> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get('main');
    request.onsuccess = () => {
      try { resolve(request.result ? migrateSave(request.result) : initialState()); }
      catch (error) { reject(error); }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function writeSave(state: GameState): Promise<void> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put({ ...state, updatedAt: Date.now(), version: SAVE_VERSION }, 'main');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export function exportSave(state: GameState): Blob {
  return new Blob([JSON.stringify({ format: 'les-mondes-de-nour', exportedAt: new Date().toISOString(), state }, null, 2)], { type: 'application/json' });
}

export async function parseImport(file: File): Promise<GameState> {
  if (file.size > 2_000_000) throw new Error('Le fichier est trop volumineux.');
  const payload = JSON.parse(await file.text()) as { format?: string; state?: unknown };
  if (payload.format !== 'les-mondes-de-nour') throw new Error('Ce fichier ne vient pas des Mondes de Nour.');
  return migrateSave(payload.state);
}

export async function resetSave(): Promise<GameState> {
  const fresh = initialState();
  await writeSave(fresh);
  return fresh;
}
