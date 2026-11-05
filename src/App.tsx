import { useCallback, useEffect, useRef, useState } from 'react';
import { worlds, worldById, type WorldId } from './content';
import { activeActivity, collectTreasure, completedCount, isLevelUnlocked, mastered, recordMistake, resumeState, startLevel, validateActivity, type GameState, type View } from './progress';
import { exportSave, loadSave, parseImport, resetSave, writeSave } from './storage';
import { Companion, ItemArt, MissionSetpiece, NourArt, TreasureArt, WorldBackdrop } from './Art';
import ActivityPanel from './ActivityPanel';

const positions = [[13,70],[24,54],[36,66],[47,45],[59,61],[70,42],[81,58],[87,31],[65,25],[39,25]];
const worldSymbols: Record<WorldId, string> = { forest: 'A', numbers: '5', village: 'M', island: '◎', castle: '✧' };
const worldDescriptions: Record<WorldId, string> = { forest: 'Lis les lettres et les premières histoires.', numbers: 'Compte, ajoute et trouve les trésors.', village: 'Écris les mots du village.', island: 'Observe la nature et le temps.', castle: 'Résous des énigmes de logique.' };

function useNarrator(state: GameState | null) {
  const contextRef = useRef<AudioContext | null>(null);
  const speak = useCallback((text: string) => {
    if (!state?.sound.voice || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/@[a-z]+/g, 'dessin'));
    utterance.lang = 'fr-FR'; utterance.rate = 0.86; utterance.pitch = 1.08;
    const voice = speechSynthesis.getVoices().find(item => item.lang.toLowerCase().startsWith('fr'));
    if (voice) utterance.voice = voice;
    speechSynthesis.speak(utterance);
  }, [state?.sound.voice]);
  const effect = useCallback((success = true) => {
    if (!state?.sound.effects) return;
    try {
      const context = contextRef.current ?? new AudioContext(); contextRef.current = context;
      if (context.state === 'suspended') void context.resume();
      const now = context.currentTime;
      (success ? [523,659,784] : [392,349]).forEach((frequency,index) => {
        const oscillator = context.createOscillator(); const gain = context.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, now + index * .11);
        gain.gain.exponentialRampToValueAtTime(.09, now + index * .11 + .02);
        gain.gain.exponentialRampToValueAtTime(.0001, now + index * .11 + .27);
        oscillator.connect(gain).connect(context.destination); oscillator.start(now + index * .11); oscillator.stop(now + index * .11 + .28);
      });
    } catch { /* Audio is optional on browsers that block it. */ }
  }, [state?.sound.effects]);
  useEffect(() => {
    if (!state?.sound.music) return;
    let note = 0;
    const timer = window.setInterval(() => {
      try {
        const context = contextRef.current ?? new AudioContext(); contextRef.current = context;
        if (context.state === 'suspended') return;
        const oscillator = context.createOscillator(); const gain = context.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = [261.63,329.63,392,329.63,293.66,349.23,440,349.23][note++ % 8];
        gain.gain.setValueAtTime(.0001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(.018, context.currentTime + .12);
        gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + 1.2);
        oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 1.21);
      } catch { /* Optional music. */ }
    }, 1500);
    return () => window.clearInterval(timer);
  }, [state?.sound.music]);
  return { speak, effect };
}

export default function App() {
  const [state, setState] = useState<GameState | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [parentGate, setParentGate] = useState(false);
  const [parentAnswer, setParentAnswer] = useState('');
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [pauseSuggested, setPauseSuggested] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const { speak, effect } = useNarrator(state);

  useEffect(() => { loadSave().then(saved => { const welcome = { ...saved, view: 'home' as View }; stateRef.current = welcome; setState(welcome); }).catch(() => setError('La sauvegarde locale est indisponible. Vérifiez les réglages du navigateur.')); }, []);
  const commit = useCallback(async (update: (old: GameState) => GameState) => {
    const old = stateRef.current;
    if (!old) return;
    const next = update(old);
    if (next === old) return;
    stateRef.current = next; setState(next);
    writeQueue.current = writeQueue.current.catch(() => {}).then(() => writeSave(next));
    try { await writeQueue.current; setError(''); }
    catch { setError('Impossible d’enregistrer maintenant. Gardez cette page ouverte et réessayez.'); }
  }, []);
  const show = (view: View) => { setGuideOpen(false); void commit(old => ({ ...old, view })); };

  useEffect(() => {
    if (!state) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setSessionSeconds(value => { if (value + 15 >= 720) setPauseSuggested(true); return value + 15; });
      void commit(old => ({ ...old, playTimeMs: old.playTimeMs + 15_000 }));
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [!!state, commit]);
  useEffect(() => { const stop = () => { if (document.hidden && 'speechSynthesis' in window) speechSynthesis.cancel(); }; document.addEventListener('visibilitychange', stop); return () => document.removeEventListener('visibilitychange', stop); }, []);

  const enterWorld = (id: WorldId) => {
    if (!state?.worlds[id].unlocked) return;
    setGuideOpen(false);
    void commit(old => ({ ...old, currentWorld: id, view: 'world' }));
    speak(`Bienvenue dans ${worldById(id).name}.`);
  };
  const start = (id: WorldId, number: number) => {
    if (!state || !isLevelUnlocked(state,id,number)) return;
    void commit(old => startLevel(old,id,number));
    speak(worldById(id).levels[number-1].story);
  };
  const move = (dx: number, dy: number) => void commit(old => {
    const id = old.currentWorld; const position = old.worlds[id].position;
    return { ...old, worlds: { ...old.worlds, [id]: { ...old.worlds[id], position: { x: Math.max(6, Math.min(94, position.x + dx)), y: Math.max(15, Math.min(82, position.y + dy)) } } } };
  });
  const openTreasure = () => {
    if (!state || state.foundTreasures.includes(state.currentWorld)) return;
    const { x, y } = progress.position;
    if (Math.abs(x - 91) + Math.abs(y - 76) > 18) {
      void commit(old => ({ ...old, worlds: { ...old.worlds, [old.currentWorld]: { ...old.worlds[old.currentWorld], position: { x: 89, y: 74 } } } }));
      setNotice('Nour s’approche du coffre. Touche-le encore pour l’ouvrir !');
      return;
    }
    void commit(old => collectTreasure(old, old.currentWorld));
    effect(); setNotice('Un trésor découvert ! Deux pièces et un souvenir pour la maison.');
  };
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (stateRef.current?.view !== 'world' || ['INPUT','TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) return;
      const directions: Record<string,[number,number]> = { ArrowLeft:[-4,0], ArrowRight:[4,0], ArrowUp:[0,-4], ArrowDown:[0,4], a:[-4,0], d:[4,0], w:[0,-4], s:[0,4] };
      if (directions[event.key]) { event.preventDefault(); move(...directions[event.key]); }
    };
    window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown);
  }, [commit]);
  const active = state ? activeActivity(state) : null;
  const activity = active?.level.activities[active.index];
  const succeed = async () => {
    if (!activity || !state) return;
    const before = state;
    await commit(old => validateActivity(old, activity.id));
    effect();
    speak('Bravo Nour ! Tu as réussi !');
    const after = stateRef.current;
    if (after && !before.worlds[active!.worldId].levels[active!.number]?.completed && after.worlds[active!.worldId].levels[active!.number]?.completed) {
      setNotice(`Mission accomplie ! Trois étoiles et « ${active!.level.reward} » pour Nour.`);
      const opened = worlds.find(world => !before.worlds[world.id].unlocked && after.worlds[world.id].unlocked);
      if (opened) { setNotice(`Un nouveau monde s’ouvre : ${opened.name} !`); speak(`Félicitations ! Tu viens de débloquer ${opened.name} !`); }
    }
  };
  const mistake = async () => { if (!activity) return; await commit(old => recordMistake(old, activity.id)); effect(false); speak('Ce n’est pas grave, essayons ensemble !'); };
  const openParent = () => { setParentAnswer(''); setParentGate(true); };
  const checkParent = () => { if (Number(parentAnswer) === 43) { setParentUnlocked(true); setParentGate(false); show('parent'); } else setError('Réponse incorrecte. Demande l’aide d’un adulte.'); };
  const importFile = async (file?: File) => {
    if (!file) return;
    try { const imported = await parseImport(file); await writeQueue.current; await writeSave(imported); stateRef.current = imported; setState(imported); setNotice('Sauvegarde importée. L’aventure est prête.'); setError(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Importation impossible.'); }
  };
  const exportFile = () => {
    if (!state) return;
    const url = URL.createObjectURL(exportSave(state)); const link = document.createElement('a'); link.href = url; link.download = 'les-mondes-de-nour-sauvegarde.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const reset = async () => {
    if (!window.confirm('Réinitialiser toute l’aventure de Nour sur cet appareil ? Cette action efface la progression locale. Exportez la sauvegarde avant si vous voulez la garder.')) return;
    await writeQueue.current; const fresh = await resetSave(); stateRef.current = fresh; setState(fresh); setParentUnlocked(false); setNotice('Une nouvelle aventure peut commencer.');
  };

  if (!state) return <main className="loading"><Companion/><h1>Les Mondes de Nour</h1><p>{error || 'La magie se prépare…'}</p>{error && <button onClick={() => window.location.reload()}>Réessayer</button>}</main>;
  const currentWorld = worldById(state.currentWorld);
  const progress = state.worlds[state.currentWorld];
  return <div className={`app theme-${state.currentWorld}`}>
    <header className="topbar"><button className="brand" onClick={() => show('home')} aria-label="Retour à l’accueil"><span className="brand-mark">N</span><span>LES MONDES<br/><strong>DE NOUR</strong></span></button><div className="top-stats"><span title="Étoiles">✦ {state.stars}</span><span title="Pièces">◈ {state.coins}</span></div><button className="top-link" onClick={openParent}>Espace parent</button></header>
    {error && <div className="error" role="alert">{error}<button onClick={() => setError('')}>Fermer</button></div>}
    {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice('')}>D’accord</button></div>}
    {pauseSuggested && <div className="pause-note"><Companion worldId={state.currentWorld}/><div><strong>Une petite pause ?</strong><p>Tu joues depuis environ {Math.floor(sessionSeconds/60)} minutes. Ton aventure t’attendra ici.</p></div><button onClick={() => setPauseSuggested(false)}>Continuer</button><button onClick={() => { setPauseSuggested(false); show('home'); }}>Faire une pause</button></div>}

    {state.view === 'home' && <main className="home-screen"><div className="home-illustration"><WorldBackdrop worldId="forest"/><div className="home-nour"><NourArt dress={state.outfit.dress} accessory={state.outfit.accessory}/></div><div className="home-companion"><Companion/></div><div className="floating-letter l1">A</div><div className="floating-letter l2">3</div><div className="floating-letter l3">✦</div></div><div className="home-copy"><p className="eyebrow">UNE AVENTURE POUR APPRENDRE EN JOUANT</p><h1>Bonjour Nour !<br/><em>On continue notre aventure ?</em></h1><p>Les chemins magiques gardent tous tes progrès. Choisis où aller aujourd’hui.</p><div className="home-actions"><button className="primary giant" onClick={() => void commit(resumeState)}>Continuer mon aventure <span>→</span></button><button className="secondary" onClick={() => show('map')}>Choisir un monde</button><button className="secondary" onClick={() => show('house')}>Ma maison</button><button className="secondary" onClick={() => show('rewards')}>Mes récompenses</button></div><div className="home-foot">{completedCount(state)} missions terminées · {worlds.filter(world => state.worlds[world.id].unlocked).length} mondes découverts</div></div></main>}

    {state.view === 'map' && <main className="page"><div className="page-heading"><p className="eyebrow">LA GRANDE CARTE</p><h1>Où va l’aventure ?</h1><p>Les mondes découverts restent ouverts pour toujours.</p></div><div className="world-grid">{worlds.map((world,index) => { const unlocked = state.worlds[world.id].unlocked; const done = completedCount(state,world.id); return <button key={world.id} className={`world-card card-${world.id} ${unlocked ? '' : 'locked'}`} onClick={() => enterWorld(world.id)} disabled={!unlocked}><div className="world-card-art"><WorldBackdrop worldId={world.id}/><span className="world-symbol">{unlocked ? worldSymbols[world.id] : '⌁'}</span></div><div className="world-card-content"><span className="world-number">MONDE 0{index+1} {unlocked ? '' : '· VERROUILLÉ'}</span><h2>{world.name}</h2><p>{unlocked ? worldDescriptions[world.id] : 'Un nouveau chemin apparaîtra bientôt.'}</p><span className="world-progress">{unlocked ? `${done} / 10 missions` : 'À découvrir'}</span></div></button>; })}</div></main>}

    {state.view === 'world' && <main className="world-page"><div className="world-toolbar"><button className="back" onClick={() => show('map')}>← Grande carte</button><div><p className="eyebrow">{currentWorld.subtitle}</p><h1>{currentWorld.name}</h1></div><span className="world-counter">{completedCount(state,state.currentWorld)} / 10</span></div><div className="scene-frame"><div className="scene" onClick={event => { if ((event.target as HTMLElement).closest('button')) return; const rect = event.currentTarget.getBoundingClientRect(); const x = Math.round((event.clientX-rect.left)/rect.width*100); const y = Math.round((event.clientY-rect.top)/rect.height*100); void commit(old => ({ ...old, worlds: { ...old.worlds, [old.currentWorld]: { ...old.worlds[old.currentWorld], position: {x,y} } } })); }}><WorldBackdrop worldId={state.currentWorld}/><div className="scene-grain"/>{currentWorld.levels.map((level,index) => { const [x,y] = positions[index]; const unlocked = isLevelUnlocked(state,state.currentWorld,index+1); const done = !!progress.levels[index+1]?.completed; return <button key={level.id} className={`level-node ${done ? 'done' : ''} ${unlocked ? '' : 'locked'}`} style={{left:`${x}%`,top:`${y}%`}} disabled={!unlocked} onClick={() => start(state.currentWorld,index+1)} aria-label={`${level.title}, ${done ? 'terminé' : unlocked ? 'disponible' : 'verrouillé'}`}><span>{done ? '✦' : unlocked ? index+1 : '◇'}</span></button>; })}<div className="player" style={{left:`${progress.position.x}%`,top:`${progress.position.y}%`}}><NourArt mood="walk" dress={state.outfit.dress} accessory={state.outfit.accessory}/></div><button className="scene-companion" onClick={() => { setGuideOpen(true); speak(`Bonjour Nour ! Je suis ${currentWorld.guide}. Je t’accompagne dans ${currentWorld.name}.`); }} aria-label={`Parler à ${currentWorld.guide}`}><Companion worldId={state.currentWorld}/><span>Parle-moi</span></button><button className="scene-treasure" onClick={openTreasure} aria-label={state.foundTreasures.includes(state.currentWorld) ? 'Coffre déjà ouvert' : 'Découvrir le coffre'}><TreasureArt open={state.foundTreasures.includes(state.currentWorld)}/></button></div><div className="controls"><span>Déplace Nour pour explorer · touche le guide ou le coffre</span><div><button onClick={() => move(-4,0)} aria-label="Aller à gauche">←</button><button onClick={() => move(0,-4)} aria-label="Aller en haut">↑</button><button onClick={() => move(0,4)} aria-label="Aller en bas">↓</button><button onClick={() => move(4,0)} aria-label="Aller à droite">→</button></div></div></div>{guideOpen && <div className="guide-dialogue"><Companion worldId={state.currentWorld}/><div><strong>{currentWorld.guide}</strong><p>Bonjour Nour ! Explore le chemin et touche une pierre numérotée pour commencer une mission. Je peux t’accompagner vers la prochaine.</p></div><button className="primary" onClick={() => { setGuideOpen(false); start(state.currentWorld, progress.currentLevel); }}>Allons-y !</button><button className="dialogue-close" onClick={() => setGuideOpen(false)} aria-label="Fermer la discussion">×</button></div>}<div className="level-list">{currentWorld.levels.map((level,index) => { const number=index+1; const unlocked=isLevelUnlocked(state,state.currentWorld,number); const record=progress.levels[number]; return <button key={level.id} disabled={!unlocked} className={`level-row ${record?.completed ? 'complete' : ''}`} onClick={() => start(state.currentWorld,number)}><span className="level-badge">{record?.completed ? '✦' : unlocked ? number : '◇'}</span><span><strong>{level.title}</strong><small>{record?.completed ? 'Terminé · rejouer' : record?.activityIndex ? `Reprendre à l’activité ${record.activityIndex+1}` : unlocked ? 'Prêt à explorer' : 'Chemin verrouillé'}</small></span><span className="row-arrow">{unlocked ? '→' : ''}</span></button>; })}</div></main>}

    {state.view === 'mission' && active && activity && <main className="mission-page"><div className="mission-top"><button className="back" onClick={() => show('world')}>← Quitter la mission</button><div className="mission-mini">{currentWorld.name} · Mission {active.number}</div></div><div className="mission-layout"><aside className="mission-story"><div className="story-visual"><WorldBackdrop worldId={active.worldId}/><MissionSetpiece levelId={active.level.id} complete={active.index} total={active.level.activities.length}/><div className="story-nour"><NourArt mood="think" dress={state.outfit.dress} accessory={state.outfit.accessory}/></div></div><div className="story-copy"><p className="eyebrow">MISSION {active.number} / 10</p><h1>{active.level.title}</h1><p>{active.level.story}</p><div className="mission-progress"><div className="progress-track"><span style={{width:`${active.index/active.level.activities.length*100}%`}}/></div><small>Étape {active.index+1} sur {active.level.activities.length}</small></div></div><div className="guide-box"><Companion worldId={active.worldId}/><p>Prends ton temps, Nour. Je suis avec toi !</p></div></aside><ActivityPanel key={activity.id} activity={activity} attempts={active.record?.attempts[activity.id] ?? 0} onSuccess={succeed} onMistake={mistake} speak={speak}/></div></main>}

    {state.view === 'house' && <main className="page house-page"><div className="page-heading"><p className="eyebrow">UN PETIT REFUGE</p><h1>La maison de Nour</h1><p>Une place tranquille pour tes découvertes.</p></div><div className="house-room"><div className="house-window"><span className="sun"/></div><div className="house-shelf">{state.decor.map(item=><div key={item} title={item}><ItemArt name={item} size={55}/></div>)}</div><div className="house-avatar"><NourArt dress={state.outfit.dress} accessory={state.outfit.accessory}/></div><div className="house-rug"/><div className="house-companion"><Companion worldId={state.currentWorld}/></div></div><div className="customize"><h2>Habille Nour</h2><div className="option-group">{(['corail','lavande','menthe'] as const).map((color,index)=><button key={color} disabled={index>0 && completedCount(state)<index*3} className={state.outfit.dress===color?'chosen':''} onClick={() => void commit(old => ({...old,outfit:{...old.outfit,dress:color}}))}>{color}{index>0 && completedCount(state)<index*3 ? ` · ${index*3} missions` : ''}</button>)}</div><h2>Accessoires</h2><div className="option-group">{(['aucun','fleur','couronne'] as const).map((accessory,index)=><button key={accessory} disabled={index===1 && completedCount(state)<1 || index===2 && !state.worlds.castle.levels[10]?.completed} className={state.outfit.accessory===accessory?'chosen':''} onClick={() => void commit(old=>({...old,outfit:{...old.outfit,accessory}}))}>{accessory}</button>)}</div><h2>Décorer l’étagère</h2><div className="option-group">{['fleur','livre','etoile'].map((item,index)=><button key={item} disabled={completedCount(state)<index+1} className={state.decor.includes(item)?'chosen':''} onClick={() => void commit(old=>({...old,decor:old.decor.includes(item)?old.decor.filter(x=>x!==item):[...old.decor,item]}))}><ItemArt name={item} size={36}/>{item}</button>)}</div></div></main>}

    {state.view === 'rewards' && <main className="page"><div className="page-heading"><p className="eyebrow">LES TRÉSORS DE L’AVENTURE</p><h1>Mes récompenses</h1><p>Chaque trésor rappelle une mission accomplie.</p></div><div className="reward-summary"><div><strong>{state.stars}</strong><span>étoiles</span></div><div><strong>{state.coins}</strong><span>pièces virtuelles</span></div><div><strong>{state.rewards.length}</strong><span>trésors uniques</span></div></div><div className="reward-grid">{state.rewards.length ? state.rewards.map((reward,index)=><div className="reward-card" key={reward}><div className="reward-medal">{index%3===0?'✦':index%3===1?'◇':'✧'}</div><strong>{reward}</strong></div>) : <p>Ton premier trésor t’attend dans la Forêt des Lettres.</p>}</div></main>}

    {state.view === 'parent' && parentUnlocked && <main className="page parent-page"><div className="page-heading"><p className="eyebrow">ESPACE PARENT</p><h1>Suivre Nour à son rythme</h1><p>Les données restent dans ce navigateur. Pensez à exporter une copie avant de changer d’appareil.</p></div><div className="parent-stats"><div><strong>{completedCount(state)} / 50</strong><span>niveaux terminés</span></div><div><strong>{Math.round(state.playTimeMs/60000)} min</strong><span>temps de jeu enregistré</span></div><div><strong>{Object.values(state.struggles).reduce((a,b)=>a+b,0)}</strong><span>essais accompagnés</span></div></div><div className="parent-grid"><section className="parent-card"><h2>Progression par monde</h2>{worlds.map(world=><div className="parent-world" key={world.id}><div><strong>{world.name}</strong><span>{completedCount(state,world.id)} / 10</span></div><div className="progress-track"><span style={{width:`${completedCount(state,world.id)*10}%`}}/></div><small>{mastered(state,world.id)?'Plusieurs activités réussies':'Compétences en construction'}</small></div>)}</section><section className="parent-card"><h2>Révisions utiles</h2>{Object.entries(state.struggles).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([id,tries])=>{ const [worldId,number] = id.split('-') as [WorldId,string]; const level=worldById(worldId).levels[Number(number)-1]; return <div className="revision" key={id}><span>{level?.title} · {tries} essais</span><button onClick={() => start(worldId,Number(number))}>Revoir</button></div>; })}{Object.keys(state.struggles).length===0 && <p>Aucune difficulté enregistrée pour le moment.</p>}</section><section className="parent-card"><h2>Son et voix</h2>{(['voice','effects','music'] as const).map(key=><label className="setting" key={key}><span>{key==='voice'?'Consignes vocales':key==='effects'?'Effets sonores':'Musique douce'}</span><input type="checkbox" checked={state.sound[key]} onChange={event=>void commit(old=>({...old,sound:{...old.sound,[key]:event.target.checked}}))}/></label>)}</section><section className="parent-card"><h2>Sauvegarde</h2><p>Exportez un fichier pour garder ou transférer la progression. L’import remplace la progression de cet appareil.</p><div className="parent-actions"><button className="secondary" onClick={exportFile}>Exporter</button><button className="secondary" onClick={()=>fileRef.current?.click()}>Importer</button><input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={event=>{void importFile(event.target.files?.[0]);event.target.value='';}}/></div><button className="danger" onClick={()=>void reset()}>Réinitialiser la progression</button></section></div></main>}

    {parentGate && <div className="modal-backdrop" role="presentation"><div className="parent-modal" role="dialog" aria-modal="true" aria-labelledby="parent-title"><h2 id="parent-title">Espace réservé aux adultes</h2><p>Pour ouvrir les réglages, résolvez ce calcul : <strong>17 + 26 = ?</strong></p><input autoFocus inputMode="numeric" value={parentAnswer} onChange={event=>setParentAnswer(event.target.value)} onKeyDown={event=>{if(event.key==='Enter')checkParent();}} aria-label="Réponse au calcul"/><div><button className="secondary" onClick={()=>setParentGate(false)}>Annuler</button><button className="primary" onClick={checkParent}>Entrer</button></div></div></div>}
    <footer className="footer"><span>Une aventure à ton rythme</span><div><button onClick={()=>show('home')}>Accueil</button><button onClick={()=>show('map')}>Carte</button><button onClick={()=>show('house')}>Maison</button><button onClick={()=>show('rewards')}>Trésors</button></div></footer>
  </div>;
}
