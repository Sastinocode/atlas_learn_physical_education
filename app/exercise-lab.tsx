import {useEffect,useState} from 'react';
import {Pause,Play,RotateCcw,Eye,ArrowRight} from 'lucide-react';
import {structures,type Exercise} from './content';
import {Exercise3D} from './mannequin/lazy';
import {exercisePoses,type ExercisePoseId} from './exercise-poses';
import {exerciseAnalysis,movementAmount,movementPhase} from './exercise-analysis';
import ExerciseMotion from './exercise-motion';
import ExerciseArt from './exercise-art';
// Fichas anatómicas de los músculos principales de cada articulación analizada (botón «Ver ficha»)
const jointFichas:Record<string,Record<string,string[]>>={
 squat:{knee:['quad'],hip:['glute','hamstrings'],ankle:['gastro','soleus']},
 lunge:{hip:['glute','glutemed'],knee:['quad']},
 press:{shoulder:['deltoid'],elbow:['triceps'],scapula:['trapezius']}
};
export default function ExerciseLab({exercise,onQuestion,onStructure}:{exercise:Exercise;onQuestion:(id:string)=>void;onStructure?:(id:string)=>void}){
 const data=exerciseAnalysis[exercise.id];
 const [progress,setProgress]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(.5),[jointIndex,setJointIndex]=useState(0);
 const [show,setShow]=useState({movement:false,forces:false,muscles:false});
 const [visual,setVisual]=useState<'anatomy'|'scheme'|'model'>('anatomy');
 const has3d=exercise.id in exercisePoses;
 const phase=movementPhase(progress),joint=data.joints[jointIndex],names=[data.start,data.drive,data.hold,data.back];
 useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>setProgress(v=>Math.min(100,v+speed)),60);return()=>window.clearInterval(timer);},[playing,speed]);
 useEffect(()=>{if(progress>=100)setPlaying(false);},[progress]);
 function seek(value:number){setPlaying(false);setProgress(value);}
 function reset(){seek(0);setJointIndex(0);setShow({movement:false,forces:false,muscles:false});setVisual('anatomy');}
 const contraction=phase===1?'Acción predominantemente concéntrica: los motores producen el gesto contra la resistencia.':phase===3?'Acción predominantemente excéntrica de los motores de la ida: frenan el retorno bajo carga.':'Sostén aproximadamente isométrico: se mantiene la posición; la tensión necesaria depende de la postura y de la carga.';
 return <div className="exercise-lab">
  <p className="lab-instruction">Observa → detén una fase → explica → revela. Actividad de análisis sin puntos automáticos.</p>
  <div className="lab-phases" aria-label="Fases del ejercicio">{names.map((name,i)=><button key={i} aria-pressed={phase===i} onClick={()=>seek([0,25,50,75][i])}><span>0{i+1}</span>{name}</button>)}</div>
  <div className="lab-columns"><div className="lab-visual">
   <div className="exercise-visual-switch" aria-label="Representación del ejercicio"><button aria-pressed={visual==='anatomy'} onClick={()=>setVisual('anatomy')}>Ilustración anatómica</button><button aria-pressed={visual==='scheme'} onClick={()=>setVisual('scheme')}>Esquema y fuerzas</button>{has3d&&<button aria-pressed={visual==='model'} onClick={()=>setVisual('model')}>Maniquí 3D</button>}</div>
   {visual==='anatomy'?<ExerciseArt id={exercise.id} name={exercise.name} amount={movementAmount(progress)} phase={names[phase]}/>:visual==='model'&&has3d?<Exercise3D id={exercise.id as ExercisePoseId} amount={movementAmount(progress)} jointId={joint.id} phaseLabel={names[phase]} fallback={<ExerciseMotion id={exercise.id} amount={movementAmount(progress)} joint={joint} forces={false} phaseLabel={names[phase]}/>}/>:<ExerciseMotion id={exercise.id} amount={movementAmount(progress)} joint={joint} forces={show.forces} phaseLabel={names[phase]}/>}
   <div className="lab-transport"><button className="primary" aria-label={playing?'Pausar movimiento':'Reproducir movimiento'} onClick={()=>{if(progress>=100)setProgress(0);setPlaying(v=>!v);}}>{playing?<Pause size={18}/>:<Play size={18}/>} {playing?'Pausar':'Reproducir'}</button><label>Velocidad<select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={.25}>Muy lenta</option><option value={.5}>Lenta</option><option value={1}>Normal</option></select></label><button className="secondary" onClick={reset}><RotateCcw size={16}/> Reiniciar</button></div>
   <label className="lab-slider">Recorrido de una repetición · {Math.round(progress)} %<input type="range" min="0" max="100" step="1" value={progress} aria-label="Recorrido de la repetición" aria-valuetext={`${Math.round(progress)} por ciento: ${names[phase]}`} onChange={e=>seek(Number(e.target.value))}/></label>
   <p className="lab-caption">{visual==='model'&&has3d?`${exercisePoses[exercise.id as ExercisePoseId].note} Ángulos orientativos; varían con la persona y la técnica. Fuente: ${exercisePoses[exercise.id as ExercisePoseId].source}`:visual==='anatomy'?'La reproducción recorre tres poses ilustradas. Para ver el recorrido continuo de las articulaciones y las fuerzas, selecciona «Esquema y fuerzas».':'Esquema cinemático didáctico. Las flechas indican direcciones, no magnitudes. No calcula fuerzas, activación muscular ni cargas articulares.'}</p>
   {show.forces&&visual==='scheme'&&<div className="force-legend"><span><b>P ↓</b> Peso corporal</span>{exercise.id==='press'&&<span><b>Pₘ ↓</b> Peso de mancuerna</span>}<span><b>R ↑</b> Reacción de apoyo</span>{exercise.id==='row'&&<span><b>T →</b> Tensión del cable</span>}</div>}
  </div><div className="lab-analysis">
   <div className="eyebrow">01 · OBSERVA LA EJECUCIÓN</div><p>{data.execution}</p>
   <h3>Selecciona qué vas a analizar</h3><div className="lab-joints">{data.joints.map((j,i)=><button key={j.id} aria-pressed={i===jointIndex} onClick={()=>setJointIndex(i)}>{j.name}</button>)}</div>
   <div className="lab-reveals">{([['movement','Movimiento'],['forces','Fuerzas'],['muscles','Músculos']] as const).map(([key,label])=><button key={key} aria-expanded={show[key]} onClick={()=>{if(key==='forces'&&!show.forces)setVisual('scheme');setShow(s=>({...s,[key]:!s[key]}));}}><Eye size={16}/>{show[key]?'Ocultar':'Revelar'} {label.toLowerCase()}</button>)}</div>
   <div aria-live="polite" className="lab-phase-label">Fase: <strong>{names[phase]}</strong></div>
    {onStructure&&(jointFichas[exercise.id]?.[joint.id]??[]).length>0&&<div className="lab-fichas"><span>Fichas de {joint.name.toLocaleLowerCase('es')}:</span>{jointFichas[exercise.id][joint.id].map(sid=><button key={sid} className="text-button" onClick={()=>{setPlaying(false);onStructure(sid);}}>Ver ficha · {structures.find(x=>x.id===sid)?.name} <ArrowRight size={14}/></button>)}</div>}
   {show.movement&&<section className="lab-box"><h3>Cinemática · qué se mueve</h3><strong>{phase===1?joint.action:phase===3?joint.returnAction:'Posición mantenida, sin desplazamiento articular intencionado'}</strong><p>{joint.plane}</p><p>{contraction}</p></section>}
   {show.forces&&<section className="lab-box"><h3>Cinética · fuerzas y momentos</h3><p>{data.kinetics}</p><p>{data.lever}</p></section>}
   {!show.movement&&!show.forces&&!show.muscles&&<div className="lab-box lab-prompt"><strong>Antes de revelar</strong><p>{data.question}</p><p>Identificad la fase, la articulación y quién produce o frena el movimiento.</p></div>}
  </div></div>
  {show.muscles&&<section className="lab-muscles"><div className="eyebrow">02 · MAPA FUNCIONAL · {joint.name.toLocaleUpperCase('es')}</div><h3>{phase===3?'¿Quién frena el retorno?':phase===1?'¿Quién produce la acción?':'¿Quién sostiene la postura?'}</h3><p className="lab-reference">Referencia de los papeles: <b>{joint.action.toLocaleLowerCase('es')}</b>. {contraction}</p><div className="muscle-roles">
   <article className="role-a"><span className="role-symbol">A</span><h4>Agonistas / motores de la ida</h4><p>{joint.agonists}</p><small>{phase===3?'En esta vuelta controlada frenan la acción contraria.':phase===1?'Producen el momento muscular de la acción indicada.':'Pueden sostener la postura junto con otros músculos.'}</small></article>
   <article className="role-b"><span className="role-symbol">B</span><h4>Antagonistas anatómicos</h4><p>{joint.antagonists}</p><small>No se presuponen inactivos: pueden coactivarse para estabilizar. No son automáticamente los motores de la vuelta.</small></article>
   <article className="role-s"><span className="role-symbol">S</span><h4>Sinergistas y estabilizadores</h4><p>{joint.synergists}</p><p><b>Estabilizan:</b> {joint.stability}</p></article>
  </div><p className="lab-nuance">↳ {joint.nuance}</p><p className="lab-caption">Las funciones dependen de la articulación, la fase, la técnica y la carga. Las listas son ejemplos, no un orden de activación ni un reparto porcentual. Los músculos biarticulares requieren matices adicionales.</p></section>}
  <div className="lab-teacher"><div><strong>Pregunta para el grupo</strong><p>{data.question}</p></div><button className="primary" onClick={()=>{setPlaying(false);onQuestion(data.questionId);}}>Llevar a Explicar <ArrowRight size={18}/></button><p className="lab-caption">Abre la pregunta existente con criterios visibles. El profesor concede de 0 a 2 puntos al perfil activo.</p></div>
  <details className="lab-sources"><summary>Alcance y referencias didácticas</summary><p>Contenido introductorio que debe contrastarse con la programación y las variantes enseñadas en clase. Las secuencias son esquemas propios, no una simulación biomecánica del Atlas 3D.</p><p><a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/11-1-interactions-of-skeletal-muscles-their-fascicle-arrangement-and-their-lever-systems" target="_blank" rel="noreferrer">OpenStax · interacción muscular y palancas</a> · <a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/10-4-nervous-system-control-of-muscle-tension" target="_blank" rel="noreferrer">Tipos de contracción</a> · <a href="https://www.acefitness.org/resources/everyone/exercise-library/" target="_blank" rel="noreferrer">ACE · biblioteca de ejercicios</a></p></details>
 </div>;
}
