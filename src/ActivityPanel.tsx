import { useEffect, useMemo, useState } from 'react';
import type { Activity } from './content';
import { ItemArt } from './Art';

interface Props { activity: Activity; attempts: number; onSuccess: () => Promise<void>; onMistake: () => Promise<void>; speak: (text: string) => void }
function Token({ value }: { value: string }) { return value.startsWith('@') ? <ItemArt name={value} size={66}/> : <span>{value}</span>; }
const same = (a: string[], b: string[]) => a.length === b.length && a.every((item, index) => item === b[index]);

export default function ActivityPanel({ activity, attempts, onSuccess, onMistake, speak }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [first, setFirst] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [assist, setAssist] = useState(false);
  useEffect(() => { setSelected([]); setFirst(null); setMatched([]); setFlipped([]); setFound([]); setBusy(false); setMessage(''); setAssist(false); }, [activity.id]);
  const support = assist || attempts >= 2;
  const praise = async () => { if (busy) return; setBusy(true); setMessage('Bravo ! La magie avance avec toi.'); await onSuccess(); };
  const retry = async () => { if (busy) return; setMessage('On regarde l’indice et on réessaie ensemble.'); await onMistake(); setSelected([]); setFirst(null); setBusy(false); };
  const choose = (value: string) => { if (busy) return; if (activity.kind === 'choice') value === activity.answer ? void praise() : void retry(); };

  const memoryCards = useMemo(() => {
    if (activity.kind !== 'memory') return [];
    const cards = activity.pairs.flatMap((pair, index) => pair.map((value, side) => ({ value, pair: index, id: `${index}-${side}` })));
    return cards.sort((a,b) => (a.id.charCodeAt(0) * 7 + a.id.charCodeAt(2) * 11) - (b.id.charCodeAt(0) * 7 + b.id.charCodeAt(2) * 11));
  }, [activity]);

  const handleMemory = (index: number) => {
    if (activity.kind !== 'memory' || busy || found.includes(index) || flipped.includes(index) || flipped.length === 2) return;
    const next = [...flipped, index]; setFlipped(next);
    if (next.length === 2) {
      if (memoryCards[next[0]].pair === memoryCards[next[1]].pair) {
        const all = [...found, ...next]; setFound(all); setFlipped([]);
        if (all.length === memoryCards.length) void praise();
      } else {
        window.setTimeout(() => { setFlipped([]); void retry(); }, 850);
      }
    }
  };

  const rightColumn = activity.kind === 'match' ? [...activity.pairs.map(pair => pair[1])].reverse() : [];
  const matchClick = (right: string) => {
    if (activity.kind !== 'match' || !first || busy) return;
    const expected = activity.pairs.find(pair => pair[0] === first)?.[1];
    if (expected === right) {
      const next = [...matched, first]; setMatched(next); setFirst(null);
      if (next.length === activity.pairs.length) void praise();
    } else void retry();
  };

  const ordered = activity.kind === 'order' ? activity.tokens.map((token, index) => ({ token, index })) : [];
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  useEffect(() => setUsedIndices([]), [activity.id]);

  return <section className="activity-panel" aria-label="Activité">
    <div className="activity-heading"><span className="activity-type">{({choice:'Choisis',collect:'Ramasse',order:'Construis',match:'Relie',count:'Compte',memory:'Mémorise',explore:'Explore'} as const)[activity.kind]}</span><button className="icon-button" type="button" onClick={() => speak(`${activity.prompt} ${'speak' in activity && activity.speak ? activity.speak : ''}`)} aria-label="Réécouter la consigne">Écouter ▷</button></div>
    <h2>{activity.prompt.split(/(@[a-z]+)/g).map((part, i) => part.startsWith('@') ? <ItemArt key={i} name={part} size={54}/> : part)}</h2>
    {activity.kind === 'choice' && <div className="choices">{activity.choices.filter((option, index) => !support || option === activity.answer || index === activity.choices.findIndex(item => item !== activity.answer)).map(option => <button key={option} type="button" className="choice" onClick={() => choose(option)}><Token value={option}/></button>)}</div>}
    {activity.kind === 'collect' && <><div className="token-grid">{activity.tokens.map((token, i) => <button key={`${token}-${i}`} type="button" className={`token ${selected.includes(`${i}`) ? 'selected' : ''} ${support && activity.answer.includes(token) ? 'guided' : ''}`} onClick={() => setSelected(prev => prev.includes(`${i}`) ? prev.filter(x => x !== `${i}`) : [...prev, `${i}`])}><Token value={token}/></button>)}</div><button className="primary" type="button" onClick={() => { const answer = activity.tokens.filter((_,i) => selected.includes(`${i}`)); answer.length === activity.answer.length && answer.every(value => activity.answer.includes(value)) ? void praise() : void retry(); }}>Valider ma récolte</button></>}
    {activity.kind === 'order' && <><div className="order-tray" aria-label="Réponse construite" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const index = Number(event.dataTransfer.getData('text/plain')); if (Number.isInteger(index) && index>=0 && index<activity.tokens.length && !usedIndices.includes(index)) setUsedIndices(prev => [...prev,index]); }}>{usedIndices.map((index, place) => <button key={`${index}-${place}`} type="button" className="token placed" onClick={() => setUsedIndices(prev => prev.filter((_,i) => i !== place))}><Token value={activity.tokens[index]}/></button>)}{usedIndices.length === 0 && <span>Touche ou glisse les éléments dans l’ordre</span>}</div><div className="token-grid">{ordered.filter(item => !usedIndices.includes(item.index)).map(item => <button key={item.index} type="button" draggable onDragStart={event => event.dataTransfer.setData('text/plain', String(item.index))} className={`token ${support && item.token === activity.answer[usedIndices.length] ? 'guided' : ''}`} onClick={() => setUsedIndices(prev => [...prev, item.index])}><Token value={item.token}/></button>)}</div><div className="activity-actions"><button className="secondary" type="button" onClick={() => setUsedIndices([])}>Recommencer</button><button className="primary" type="button" onClick={() => same(usedIndices.map(i => activity.tokens[i]), activity.answer) ? void praise() : void retry()}>Valider</button></div></>}
    {activity.kind === 'match' && <div className="match-columns"><div>{activity.pairs.map(([left]) => <button key={left} type="button" className={`token ${first === left ? 'selected' : ''} ${matched.includes(left) ? 'matched' : ''}`} disabled={matched.includes(left)} onClick={() => setFirst(left)}><Token value={left}/></button>)}</div><div>{rightColumn.map(right => <button key={right} type="button" className={`token ${matched.some(left => activity.pairs.find(pair => pair[0] === left)?.[1] === right) ? 'matched' : ''}`} disabled={matched.some(left => activity.pairs.find(pair => pair[0] === left)?.[1] === right)} onClick={() => matchClick(right)}><Token value={right}/></button>)}</div></div>}
    {activity.kind === 'count' && <><div className="count-scene" aria-label={`${activity.quantity} objets à compter`}>{Array.from({length:activity.quantity},(_,i)=><button key={i} type="button" className={`count-object ${selected.includes(`${i}`) ? 'counted' : ''}`} onClick={() => setSelected(prev => prev.includes(`${i}`) ? prev.filter(x=>x!==`${i}`) : [...prev, `${i}`])}><ItemArt name={activity.object} size={58}/></button>)}{activity.quantity === 0 && <span>Le panier est vide.</span>}</div><div className="choices">{activity.choices.map(number=><button key={number} type="button" className="choice" onClick={() => number === activity.quantity ? void praise() : void retry()}>{number}</button>)}</div></>}
    {activity.kind === 'memory' && <div className="memory-grid">{memoryCards.map((card,index)=><button key={card.id} type="button" className={`memory-card ${flipped.includes(index) || found.includes(index) ? 'flipped' : ''}`} onClick={() => handleMemory(index)}><span>{flipped.includes(index) || found.includes(index) ? <Token value={card.value}/> : '✦'}</span></button>)}</div>}
    {activity.kind === 'explore' && <><div className="explore-scene">{activity.objects.map((object,index)=><button key={`${object}-${index}`} type="button" className={`explore-object ${selected.includes(`${index}`) ? 'selected' : ''} ${support && activity.answer.includes(object) ? 'guided' : ''}`} style={{left:`${10+(index*37)%78}%`,top:`${12+(index*29)%63}%`}} onClick={() => setSelected(prev => prev.includes(`${index}`) ? prev.filter(x=>x!==`${index}`) : [...prev,`${index}`])}><Token value={object}/></button>)}</div><button className="primary" type="button" onClick={() => { const answer = activity.objects.filter((_,i) => selected.includes(`${i}`)); answer.length === activity.answer.length && answer.every(value => activity.answer.includes(value)) ? void praise() : void retry(); }}>J’ai trouvé !</button></>}
    {message && <p className="feedback" role="status">{message}</p>}
    {attempts >= 1 && <div className="hint"><strong>L’indice de ton compagnon</strong><p>{activity.hint}</p>{!assist && attempts < 2 && <button type="button" onClick={() => setAssist(true)}>Aide-moi un peu</button>}</div>}
  </section>;
}
