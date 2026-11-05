import type { WorldId } from './content';

export function ItemArt({ name, size = 70 }: { name: string; size?: number }) {
  const key = name.replace(/^@/, '');
  const common = { stroke: '#514548', strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const art: Record<string, React.ReactNode> = {
    pomme: <><path d="M39 22q-13-12-26 0-8 10 2 31 8 18 23 12 13 6 23-12 11-22 0-31-10-10-22 0Z" fill="#e66f66" {...common}/><path d="M39 24q0-11 6-17" fill="none" {...common}/><path d="M42 13q11-11 19-3-5 11-19 10" fill="#70a67a" {...common}/></>,
    ballon: <><circle cx="38" cy="34" r="25" fill="#edbd68" {...common}/><path d="M31 59h14l-7 8Z" fill="#edbd68" {...common}/><path d="M38 67v8" fill="none" {...common}/><path d="M20 26q8-14 22-13" fill="none" stroke="#fff4dd" strokeWidth="5" strokeLinecap="round"/></>,
    etoile: <path d="m38 5 9 21 23 2-18 15 6 23-20-12-20 12 6-23L6 28l23-2Z" fill="#f6ca63" {...common}/>,
    cube: <><path d="m38 9 28 15v31L38 69 10 55V24Z" fill="#a5b9de" {...common}/><path d="M10 24 38 40l28-16M38 40v29" fill="none" {...common}/></>,
    lune: <path d="M50 8a31 31 0 1 0 18 49A28 28 0 0 1 50 8Z" fill="#f7da82" {...common}/>,
    chat: <><path d="M15 35 18 13l16 9 19-1 16-8-2 24q4 25-24 28-28 2-28-30Z" fill="#eead77" {...common}/><circle cx="30" cy="40" r="3" fill="#4d4444"/><circle cx="53" cy="40" r="3" fill="#4d4444"/><path d="m36 49 6 4 6-4M42 53v5m-21-9-12-3m12 8-12 2m52-7 12-3m-12 8 12 2" fill="none" {...common}/></>,
    oiseau: <><ellipse cx="38" cy="43" rx="26" ry="22" fill="#8dc5cc" {...common}/><path d="M40 50q-16-28-27-10 3 19 27 10" fill="#65aeb9" {...common}/><path d="m59 40 14 5-13 7" fill="#f2c565" {...common}/><circle cx="49" cy="34" r="3" fill="#3e4149"/><path d="M30 64v10m12-10v10" fill="none" {...common}/></>,
    poisson: <><ellipse cx="39" cy="38" rx="23" ry="17" fill="#88cbd3" {...common}/><path d="M17 38 4 24v28Z" fill="#5eabb9" {...common}/><circle cx="50" cy="34" r="3" fill="#3e4149"/><path d="m31 23 8-10 7 10" fill="#5eabb9" {...common}/></>,
    fleur: <><path d="M38 39v34m0-17q-12-13-23-5 3 13 23 11m0-8q11-13 23-5-2 13-23 11" fill="#6faa7c" {...common}/><circle cx="38" cy="26" r="9" fill="#f3cd6c" {...common}/>{[0,72,144,216,288].map(a=><ellipse key={a} cx="38" cy="11" rx="9" ry="13" transform={`rotate(${a} 38 26)`} fill="#e797a4" {...common}/>)}</>,
    arbre: <><path d="M33 46h12v27H33z" fill="#a47660" {...common}/><circle cx="25" cy="34" r="19" fill="#85b991" {...common}/><circle cx="48" cy="31" r="21" fill="#6ca87c" {...common}/><circle cx="38" cy="19" r="18" fill="#89bf90" {...common}/></>,
    sac: <><path d="M16 28h45l5 42H11Z" fill="#d9866b" {...common}/><path d="M28 29v-8q10-15 22 0v8" fill="none" {...common}/><path d="M17 47h47" fill="none" {...common}/></>,
    bol: <><ellipse cx="38" cy="34" rx="31" ry="9" fill="#fff0d6" {...common}/><path d="M7 34q3 34 31 34t31-34" fill="#a8c5c4" {...common}/><ellipse cx="38" cy="34" rx="31" ry="9" fill="none" {...common}/></>,
    lit: <><path d="M8 24h8v36H8m52-36h8v36h-8M16 49h44v9H16Z" fill="#b78870" {...common}/><path d="M18 34h40v15H18Z" fill="#e8c88c" {...common}/><path d="M20 31h14v10H20Z" fill="#f9f1e5" {...common}/></>,
    moto: <><circle cx="18" cy="59" r="10" fill="#6e7189" {...common}/><circle cx="59" cy="59" r="10" fill="#6e7189" {...common}/><path d="M18 58 30 36h19l10 22H18l16-13m15-10 8-11h8" fill="none" {...common}/><path d="M21 34h22l9 12H27Z" fill="#e67866" {...common}/></>,
    livre: <><path d="M38 19Q19 9 7 17v43q17-8 31 3 14-11 31-3V17Q56 9 38 19Z" fill="#e7ac73" {...common}/><path d="M38 19v44m-25-38q10-3 17 2m16 0q7-5 17-2" fill="none" {...common}/></>,
    crayon: <><path d="m15 62 7-21 34-34 14 14-35 34Z" fill="#f1c76c" {...common}/><path d="m15 62 20-7-13-14m34-34 14 14" fill="none" {...common}/><path d="m15 62 7-2-5-5Z" fill="#504649" {...common}/></>,
    cercle: <circle cx="38" cy="38" r="28" fill="#efb78e" {...common}/>,
    carre: <rect x="12" y="12" width="52" height="52" rx="4" fill="#93b7d3" {...common}/>,
    triangle: <path d="M38 8 69 65H7Z" fill="#a5c69e" {...common}/>
  };
  return <svg className="item-art" width={size} height={size} viewBox="0 0 76 76" role="img" aria-label={key}>{art[key] ?? <><circle cx="38" cy="38" r="30" fill="#f3d7a4"/><text x="38" y="45" textAnchor="middle" fontSize="16" fill="#403943">{key.slice(0,5)}</text></>}</svg>;
}

export function NourArt({ mood = 'idle', dress = 'corail', accessory = 'aucun' }: { mood?: string; dress?: string; accessory?: string }) {
  const dressColor = dress === 'lavande' ? '#a98ac4' : dress === 'menthe' ? '#75af9c' : '#dc826c';
  return <svg className={`nour-art mood-${mood}`} viewBox="0 0 100 150" role="img" aria-label="Nour l’aventurière">
    <ellipse cx="50" cy="145" rx="32" ry="5" fill="#345452" opacity=".17"/>
    <path d="M28 93 17 122m56-29 10 29" stroke="#d8a171" strokeWidth="10" strokeLinecap="round"/>
    <path d="M36 120v21m28-21v21" stroke="#9b674e" strokeWidth="12" strokeLinecap="round"/>
    <path d="M28 140h19m11 0h20" stroke="#4b5d6a" strokeWidth="11" strokeLinecap="round"/>
    <path d="M28 85q22-15 44 0l8 39H20Z" fill={dressColor} stroke="#815b59" strokeWidth="3"/>
    <path d="M44 88v33m12-33v33" stroke="#f5d3a2" strokeWidth="3" opacity=".6"/>
    <path d="M21 55q-3-43 28-45 36-2 32 44l-6 22H25Z" fill="#3e2d31"/>
    <ellipse cx="50" cy="58" rx="29" ry="33" fill="#d9a274" stroke="#9d6d55" strokeWidth="2"/>
    <path d="M22 53q2-42 29-42 26 0 28 39-15-13-22-22-12 19-35 25" fill="#3e2d31"/>
    <circle cx="39" cy="59" r="3" fill="#3e3033"/><circle cx="62" cy="59" r="3" fill="#3e3033"/>
    <path d="M44 74q7 7 14 0" fill="none" stroke="#a55b62" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="31" cy="69" r="5" fill="#e9a084" opacity=".6"/><circle cx="69" cy="69" r="5" fill="#e9a084" opacity=".6"/>
    <path d="M74 48q17 4 12 24-5 5-11-2" fill="#3e2d31"/>
    {accessory === 'couronne' && <path d="m30 27 8-13 12 11 12-11 8 13Z" fill="#f2ca65" stroke="#a77a3e" strokeWidth="2"/>}
    {accessory === 'fleur' && <g transform="translate(72 32) scale(.32)"><ItemArt name="fleur"/></g>}
  </svg>;
}

export function Companion({ worldId = 'forest' }: { worldId?: WorldId }) {
  const palette: Record<WorldId, string> = { forest: '#b58a6b', numbers: '#df9c65', village: '#b5a2b1', island: '#79b9ad', castle: '#a58bc5' };
  return <svg className="companion-art" viewBox="0 0 92 95" role="img" aria-label="Compagnon magique">
    <ellipse cx="45" cy="83" rx="23" ry="5" fill="#345452" opacity=".15"/>
    <path d="M14 40 5 13l31 15m42 12 9-27-31 15" fill={palette[worldId]} stroke="#55484d" strokeWidth="3"/>
    <ellipse cx="46" cy="48" rx="32" ry="34" fill={palette[worldId]} stroke="#55484d" strokeWidth="3"/>
    <ellipse cx="33" cy="47" rx="11" ry="15" fill="#fff4df"/><ellipse cx="59" cy="47" rx="11" ry="15" fill="#fff4df"/>
    <circle cx="35" cy="49" r="4" fill="#4a3c3f"/><circle cx="57" cy="49" r="4" fill="#4a3c3f"/>
    <path d="m42 61 4 5 4-5Z" fill="#f4c45e" stroke="#55484d" strokeWidth="2"/>
    <path d="M25 71q-19 4-14-13m56 13q19 4 14-13" fill="none" stroke="#55484d" strokeWidth="5" strokeLinecap="round"/>
    <path d="m37 78-4 9m22-9 4 9" stroke="#d4a462" strokeWidth="4" strokeLinecap="round"/>
  </svg>;
}

export function WorldBackdrop({ worldId }: { worldId: WorldId }) {
  const isForest = worldId === 'forest';
  const isNumbers = worldId === 'numbers';
  const isVillage = worldId === 'village';
  const isIsland = worldId === 'island';
  const sky = isForest ? '#d8ead5' : isNumbers ? '#f7dfb3' : isVillage ? '#f2d6ce' : isIsland ? '#bde6e1' : '#ddd4ea';
  const ground = isForest ? '#92bd83' : isNumbers ? '#d5b37c' : isVillage ? '#c9ae91' : isIsland ? '#e5d3a5' : '#a9a0c5';
  return <svg className="world-backdrop" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id={`sky-${worldId}`} x2="0" y2="1"><stop stopColor={sky}/><stop offset="1" stopColor="#fff8e8"/></linearGradient></defs>
    <rect width="1000" height="560" fill={`url(#sky-${worldId})`}/>
    <circle cx="850" cy="92" r="48" fill="#fff2b0" opacity=".85"/>
    <g fill="#fff" opacity=".8"><ellipse cx="160" cy="93" rx="85" ry="22"/><ellipse cx="210" cy="81" rx="40" ry="28"/><ellipse cx="625" cy="132" rx="90" ry="20"/></g>
    <path d="M0 330Q160 190 340 310T690 295T1000 285V560H0Z" fill={isIsland ? '#81b8a8' : isForest ? '#a8cc9b' : '#c4bec9'} opacity=".65"/>
    <path d="M0 405Q180 350 330 391T680 352T1000 390V560H0Z" fill={ground}/>
    {isIsland && <path d="M0 423Q245 383 470 443T1000 434v126H0Z" fill="#ecdbaa"/>}
    <path d="M0 493Q200 459 410 493T830 476T1000 501V560H0Z" fill={isForest ? '#74a574' : isIsland ? '#dfc890' : isNumbers ? '#bb996d' : isVillage ? '#b99c85' : '#9185af'}/>
    <path d="M48 464Q180 420 280 450T540 430T800 458T984 439" fill="none" stroke="#f6e3b1" strokeWidth="42" strokeLinecap="round" strokeDasharray="2 0" opacity=".86"/>
    {isForest && [95,210,360,730,930].map((x,i)=><g key={x} transform={`translate(${x} ${i%2 ? 315 : 289})`}><path d="M-9 50h18v130H-9Z" fill="#8c6e5c"/><circle cy="23" r="54" fill="#57976f"/><circle cx="-28" cy="43" r="41" fill="#71ac78"/><circle cx="29" cy="39" r="43" fill="#6aa578"/></g>)}
    {isNumbers && [140,690].map(x=><g key={x} transform={`translate(${x} 270)`}><path d="M-56 140V39h112v101" fill="#d7ac80" stroke="#9d735f" strokeWidth="5"/><path d="M-70 39h140L48 5H-48Z" fill="#b46d64"/><path d="M-18 140V81h36v59" fill="#846b6e"/><path d="M-37 65h15m44 0h15" stroke="#f5df9b" strokeWidth="11"/></g>)}
    {isVillage && [125,320,755].map((x,i)=><g key={x} transform={`translate(${x} ${305+i%2*20})`}><path d="M-61 125V33H61v92" fill={i===1 ? '#c2a7be' : '#e6bd9c'} stroke="#967b7b" strokeWidth="4"/><path d="M-74 34 0-16 74 34Z" fill={i===1 ? '#a37d9d' : '#cf7d70'}/><path d="M-17 125V69h34v56" fill="#9e786d"/><path d="M-43 60h20m46 0h20" stroke="#fff1bc" strokeWidth="14"/></g>)}
    {isIsland && <><path d="M700 420q-5-127 29-170" fill="none" stroke="#8e765d" strokeWidth="19"/><path d="M728 256q-85-55-130 4 77-13 130 6m0-7q7-79 71-89-34 58-67 89m0 0q61-53 122-19-77 8-122 27" fill="#72ae80" stroke="#4f8f73" strokeWidth="4"/><path d="M0 420q100-45 200 10t220 0" fill="none" stroke="#91d1cf" strokeWidth="35" opacity=".7"/></>}
    {worldId === 'castle' && <g transform="translate(680 165)"><path d="M-145 261V75h290v186Z" fill="#a99ac4" stroke="#776986" strokeWidth="6"/><path d="M-150 75V20h55v55m190 0V20h55v55M-47 75V-20h94v95" fill="#907eae" stroke="#776986" strokeWidth="6"/><path d="M-140 20h35m200 0h35M-35-20h70" stroke="#e8dca5" strokeWidth="15"/><path d="M-29 261V165q29-43 58 0v96" fill="#675f81"/><path d="M-99 122h27m145 0h27" stroke="#f4dc9b" strokeWidth="21"/></g>}
    {[120,260,480,600,900].map((x,i)=><g key={x} transform={`translate(${x} ${477+i%2*22})`}><path d="M0 19V0" stroke="#5d9b74" strokeWidth="3"/><circle r="6" fill={i%2 ? '#f1b9b5' : '#fff1bf'}/></g>)}
  </svg>;
}

export function MissionSetpiece({ levelId, complete, total }: { levelId: string; complete: number; total: number }) {
  if (levelId === 'forest-1') return <svg className="mission-setpiece lantern-setpiece" viewBox="0 0 160 175" aria-label={`${complete} lumières sur ${total} rallumées`}>
    <path d="M59 33q0-24 21-24t21 24" fill="none" stroke="#866447" strokeWidth="9"/>
    <path d="M42 40h76l-11 99H53Z" fill="#684e47" stroke="#f2d79b" strokeWidth="5"/>
    <path d="M58 56h44l-7 66H65Z" fill={complete ? '#ffed9d' : '#7a7370'} stroke="#f1d188" strokeWidth="4"/>
    {Array.from({length:total},(_,i)=><circle key={i} cx={68+(i%3)*12} cy={75+Math.floor(i/3)*24} r="7" fill={i<complete?'#fff9bd':'#8b8170'} className={i<complete?'lantern-lit':''}/>)}
    <path d="M56 139h48v14H56Z" fill="#8b684d" stroke="#f2d79b" strokeWidth="4"/>
  </svg>;
  if (levelId === 'numbers-3') return <svg className="mission-setpiece bridge-setpiece" viewBox="0 0 270 130" aria-label={`${complete} parties du pont réparées sur ${total}`}>
    <path d="M0 101q43-25 87 0m96 0q43-25 87 0" fill="none" stroke="#648e80" strokeWidth="26"/>
    <path d="M4 93h260" stroke="#8f6550" strokeWidth="6"/>
    {Array.from({length:total},(_,i)=><g key={i} opacity={i<complete?1:.18}><rect x={77+i*40} y={80} width="35" height="18" rx="4" fill="#c58b61" stroke="#765747" strokeWidth="4"/><circle cx={86+i*40} cy="87" r="2" fill="#f5d5a2"/></g>)}
  </svg>;
  return <svg className="mission-setpiece rune-setpiece" viewBox="0 0 220 140" aria-label={`${complete} étapes sur ${total} terminées`}>
    <path d="M20 112q90-150 180 0" fill="none" stroke="#fff1c5" strokeWidth="14" strokeLinecap="round"/>
    {Array.from({length:total},(_,i)=>{const x=32+(i+1)*156/(total+1);const y=112-82*Math.sin(Math.PI*(i+1)/(total+1));return <g key={i}><circle cx={x} cy={y} r="13" fill={i<complete?'#ffd178':'#b9b4a9'} stroke="#fff7dd" strokeWidth="4"/><path d={`M${x} ${y-6}v12m-6-6h12`} stroke="#fff7dd" strokeWidth="2"/></g>;})}
  </svg>;
}
