import { levelById, worldById, worlds, type WorldId } from './content';

export const SAVE_VERSION = 2;
export type View = 'home' | 'map' | 'world' | 'mission' | 'house' | 'rewards' | 'parent';
export interface LevelRecord { activityIndex: number; validated: string[]; completed: boolean; attempts: Record<string, number> }
export interface WorldProgress { unlocked: boolean; currentLevel: number; position: { x: number; y: number }; levels: Record<number, LevelRecord> }
export interface GameState {
  version: number;
  updatedAt: number;
  view: View;
  currentWorld: WorldId;
  currentLevelId: string | null;
  replayIndex: number;
  worlds: Record<WorldId, WorldProgress>;
  stars: number;
  coins: number;
  rewards: string[];
  outfit: { dress: string; accessory: string };
  decor: string[];
  sound: { voice: boolean; effects: boolean; music: boolean };
  skillEvidence: Record<string, number>;
  struggles: Record<string, number>;
  playTimeMs: number;
}

const freshWorld = (unlocked: boolean): WorldProgress => ({ unlocked, currentLevel: 1, position: { x: 14, y: 70 }, levels: {} });
export function initialState(): GameState {
  return {
    version: SAVE_VERSION, updatedAt: Date.now(), view: 'home', currentWorld: 'forest', currentLevelId: null, replayIndex: 0,
    worlds: { forest: freshWorld(true), numbers: freshWorld(false), village: freshWorld(false), island: freshWorld(false), castle: freshWorld(false) },
    stars: 0, coins: 0, rewards: [], outfit: { dress: 'corail', accessory: 'aucun' }, decor: [],
    sound: { voice: true, effects: true, music: false }, skillEvidence: {}, struggles: {}, playTimeMs: 0
  };
}

export const completedCount = (state: GameState, worldId?: WorldId): number =>
  (worldId ? [worldId] : worlds.map(world => world.id)).reduce((total, id) => total + Object.values(state.worlds[id].levels).filter(record => record.completed).length, 0);

export const isLevelUnlocked = (state: GameState, worldId: WorldId, number: number): boolean =>
  state.worlds[worldId].unlocked && (number === 1 || !!state.worlds[worldId].levels[number - 1]?.completed);

export function activeActivity(state: GameState) {
  const level = state.currentLevelId ? levelById(state.currentLevelId) : undefined;
  if (!level) return null;
  const worldId = state.currentLevelId!.split('-')[0] as WorldId;
  const number = Number(state.currentLevelId!.split('-')[1]);
  const record = state.worlds[worldId].levels[number];
  return { level, worldId, number, index: record?.completed ? state.replayIndex : record?.activityIndex ?? 0, record };
}

export function startLevel(state: GameState, worldId: WorldId, number: number): GameState {
  if (!isLevelUnlocked(state, worldId, number) || number < 1 || number > 10) return state;
  return { ...state, currentWorld: worldId, currentLevelId: `${worldId}-${number}`, replayIndex: 0, view: 'mission',
    worlds: { ...state.worlds, [worldId]: { ...state.worlds[worldId], currentLevel: number } } };
}

export function resumeState(state: GameState): GameState {
  if (state.currentLevelId) {
    const [worldId, raw] = state.currentLevelId.split('-') as [WorldId, string];
    if (isLevelUnlocked(state, worldId, Number(raw)) && !state.worlds[worldId].levels[Number(raw)]?.completed) {
      return { ...state, view: 'mission', currentWorld: worldId };
    }
  }
  const current = state.worlds[state.currentWorld];
  const next = Math.min(10, Array.from({ length: 10 }, (_, i) => i + 1).find(n => isLevelUnlocked(state, state.currentWorld, n) && !current.levels[n]?.completed) ?? 10);
  if (current.levels[next]?.completed) return { ...state, view: 'world' };
  return startLevel(state, state.currentWorld, next);
}

export function recordMistake(state: GameState, activityId: string): GameState {
  const active = activeActivity(state);
  if (!active) return state;
  const { worldId, number } = active;
  const previous = state.worlds[worldId].levels[number] ?? { activityIndex: 0, validated: [], completed: false, attempts: {} };
  return { ...state,
    struggles: { ...state.struggles, [activityId]: (state.struggles[activityId] ?? 0) + 1 },
    worlds: { ...state.worlds, [worldId]: { ...state.worlds[worldId], levels: { ...state.worlds[worldId].levels,
      [number]: { ...previous, attempts: { ...previous.attempts, [activityId]: (previous.attempts[activityId] ?? 0) + 1 } } } } }
  };
}

export function validateActivity(state: GameState, activityId: string): GameState {
  const active = activeActivity(state);
  if (!active) return state;
  const { level, worldId, number, index } = active;
  if (level.activities[index]?.id !== activityId) return state;
  const old = state.worlds[worldId].levels[number] ?? { activityIndex: 0, validated: [], completed: false, attempts: {} };
  if (old.validated.includes(activityId) && !old.completed) return state;
  // A completed level can be replayed, but its rewards and evidence remain unchanged.
  if (old.completed) return index + 1 < level.activities.length ? { ...state, replayIndex: index + 1 } : { ...state, currentLevelId: null, replayIndex: 0, view: 'world' };
  const validated = [...old.validated, activityId];
  const finished = validated.length === level.activities.length;
  const nextRecord: LevelRecord = { ...old, validated, activityIndex: finished ? level.activities.length : index + 1, completed: finished };
  const nextWorld = { ...state.worlds[worldId], levels: { ...state.worlds[worldId].levels, [number]: nextRecord }, currentLevel: finished ? Math.min(number + 1, 10) : number };
  const next = { ...state, worlds: { ...state.worlds, [worldId]: nextWorld },
    currentLevelId: finished ? null : state.currentLevelId, view: finished ? 'world' as View : 'mission' as View,
    stars: state.stars + (finished ? 3 : 0), coins: state.coins + (finished ? 5 : 0),
    rewards: finished && !state.rewards.includes(level.reward) ? [...state.rewards, level.reward] : state.rewards,
    skillEvidence: { ...state.skillEvidence, [worldId]: (state.skillEvidence[worldId] ?? 0) + 1 }
  };
  if (finished) {
    const forest = completedCount(next, 'forest');
    const numbers = completedCount(next, 'numbers');
    const total = completedCount(next);
    if (forest >= 2) next.worlds.numbers = { ...next.worlds.numbers, unlocked: true };
    if (forest >= 4) next.worlds.village = { ...next.worlds.village, unlocked: true };
    if (numbers >= 3) next.worlds.island = { ...next.worlds.island, unlocked: true };
    if (total >= 8 && forest >= 4 && numbers >= 3) next.worlds.castle = { ...next.worlds.castle, unlocked: true };
  }
  return next;
}

export function mastered(state: GameState, worldId: WorldId): boolean { return (state.skillEvidence[worldId] ?? 0) >= 3; }
export function worldForLevel(levelId: string): WorldId { return levelId.split('-')[0] as WorldId; }
export function levelNumber(levelId: string): number { return Number(levelId.split('-')[1]); }
export function nextLevelTitle(state: GameState, worldId: WorldId): string {
  return worldById(worldId).levels[state.worlds[worldId].currentLevel - 1]?.title ?? '';
}
