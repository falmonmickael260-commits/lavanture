import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { worlds } from './content';
import { activeActivity, completedCount, initialState, isLevelUnlocked, recordMistake, resumeState, startLevel, validateActivity } from './progress';
import { loadSave, migrateSave, resetSave, writeSave } from './storage';

beforeEach(async () => { await resetSave(); });

function finishLevel(state: ReturnType<typeof initialState>, world: 'forest'|'numbers'|'village'|'island'|'castle', number: number) {
  let next = startLevel(state, world, number);
  const level = worlds.find(item => item.id === world)!.levels[number-1];
  for (const activity of level.activities) next = validateActivity(next, activity.id);
  return next;
}

describe('sauvegarde et progression', () => {
  it('reprend au troisième exercice après deux réponses validées', async () => {
    let state = startLevel(initialState(), 'forest', 1);
    const activities = worlds[0].levels[0].activities;
    state = validateActivity(state, activities[0].id);
    state = validateActivity(state, activities[1].id);
    await writeSave(state);
    const restored = resumeState(await loadSave());
    expect(activeActivity(restored)?.index).toBe(2);
    expect(activeActivity(restored)?.record?.validated).toEqual([activities[0].id, activities[1].id]);
  });

  it('garde la progression de chaque monde indépendamment et bloque les mondes fermés', () => {
    let state = initialState();
    expect(startLevel(state, 'numbers', 1)).toBe(state);
    state = finishLevel(state, 'forest', 1);
    state = finishLevel(state, 'forest', 2);
    expect(state.worlds.numbers.unlocked).toBe(true);
    state = startLevel(state, 'numbers', 1);
    state = validateActivity(state, worlds[1].levels[0].activities[0].id);
    state = startLevel(state, 'forest', 3);
    expect(state.worlds.numbers.levels[1].activityIndex).toBe(1);
    expect(state.worlds.forest.levels[2].completed).toBe(true);
    expect(isLevelUnlocked(state, 'castle', 1)).toBe(false);
  });

  it('débloque le niveau suivant, garde les étoiles et évite les récompenses en double', async () => {
    let state = finishLevel(initialState(), 'forest', 1);
    expect(isLevelUnlocked(state, 'forest', 2)).toBe(true);
    expect(state.stars).toBe(3);
    expect(state.rewards).toHaveLength(1);
    state = startLevel(state, 'forest', 1);
    for (const activity of worlds[0].levels[0].activities) state = validateActivity(state, activity.id);
    expect(state.stars).toBe(3);
    expect(state.coins).toBe(5);
    expect(state.rewards).toHaveLength(1);
    await writeSave(state);
    expect((await loadSave()).stars).toBe(3);
  });

  it('conserve un essai et la position après fermeture au milieu d’une mission', async () => {
    let state = startLevel(initialState(), 'forest', 1);
    const id = worlds[0].levels[0].activities[0].id;
    state = recordMistake(state, id);
    state = validateActivity(state, id);
    state.worlds.forest.position = { x: 51, y: 39 };
    await writeSave(state);
    const loaded = await loadSave();
    expect(loaded.worlds.forest.levels[1].attempts[id]).toBe(1);
    expect(loaded.worlds.forest.position).toEqual({ x: 51, y: 39 });
    expect(activeActivity(resumeState(loaded))?.index).toBe(1);
  });

  it('lit une sauvegarde ancienne et complète ses champs manquants', () => {
    const old = { ...initialState(), version: 1, sound: { voice: false }, decor: undefined, skillEvidence: undefined };
    const migrated = migrateSave(old);
    expect(migrated.version).toBe(2);
    expect(migrated.sound.voice).toBe(false);
    expect(migrated.sound.effects).toBe(true);
    expect(migrated.decor).toEqual([]);
    expect(migrated.skillEvidence).toEqual({});
  });

  it('ouvre les autres mondes seulement avec les prérequis prévus', () => {
    let state = initialState();
    for (let i=1;i<=4;i++) state=finishLevel(state,'forest',i);
    expect(state.worlds.village.unlocked).toBe(true);
    expect(state.worlds.island.unlocked).toBe(false);
    for (let i=1;i<=3;i++) state=finishLevel(state,'numbers',i);
    expect(state.worlds.island.unlocked).toBe(true);
    expect(state.worlds.castle.unlocked).toBe(false);
    state=finishLevel(state,'village',1);
    expect(state.worlds.castle.unlocked).toBe(true);
    expect(completedCount(state)).toBe(8);
  });
});

describe('contenu pédagogique', () => {
  it('contient exactement 5 mondes et 50 niveaux avec plusieurs activités', () => {
    expect(worlds).toHaveLength(5);
    expect(worlds.flatMap(world => world.levels)).toHaveLength(50);
    expect(worlds.every(world => world.levels.length === 10 && world.levels.every(level => level.activities.length >= 3))).toBe(true);
  });

  it('ne propose les nombres jusqu’à 100 qu’au dernier niveau du royaume', () => {
    const levels = worlds.find(world => world.id === 'numbers')!.levels;
    expect(levels[0].title).toContain('cinq');
    expect(levels.slice(0,9).flatMap(level => level.activities).some(activity => activity.prompt.includes('100'))).toBe(false);
    expect(levels[9].activities.some(activity => activity.kind === 'choice' && activity.answer === '100')).toBe(true);
  });

  it('donne des réponses correctes aux calculs arithmétiques explicites', () => {
    const activities = worlds.flatMap(world => world.levels).flatMap(level => level.activities);
    const calculations = activities.filter(activity => activity.kind === 'choice' && /\d+\s*[+-]\s*\d+\s*=/.test(activity.prompt));
    expect(calculations.length).toBeGreaterThan(7);
    for (const activity of calculations) {
      if (activity.kind !== 'choice') continue;
      const match = activity.prompt.match(/(\d+)\s*([+-])\s*(\d+)\s*=/)!;
      const expected = match[2] === '+' ? Number(match[1])+Number(match[3]) : Number(match[1])-Number(match[3]);
      expect(Number(activity.answer), activity.prompt).toBe(expected);
    }
  });

  it('cible les voyelles au premier niveau de français', () => {
    const first = worlds[0].levels[0];
    expect(first.activities).toHaveLength(5);
    expect(first.activities[0].kind).toBe('collect');
    if (first.activities[0].kind === 'collect') expect(first.activities[0].answer).toEqual(['A','E','I','O','U']);
  });
});
