'use client';
import {useEffect,useState} from 'react';
import AnatomyScene from './three/scene';
import model from './three/model.json';
import type {Atlas,SceneState,SystemId,View} from './three/anatomy';
import {opacityFor} from './three/display-options';
import {structures,questions} from './content';

export const THREE_STORAGE='cuerpo-movimiento-3d-v1';
const atlas=model as unknown as Atlas;
const initial=():SceneState=>({visible:['skeletal','muscular','connective'],selected:[],isolate:false,explode:0,view:'front',rotate:false,reset:0,offset:[0,0,0],opacity:{skeletal:1,muscular:1,connective:1},lightweight:false});
const layerNames={skeletal:'Huesos',muscular:'Músculos',connective:'Tendón calcáneo'};
const related:Record<string,string[]>={pectoral:['r4','e4'],deltoid:['r6','e6'],biceps:['r5','e5'],triceps:['r4'],glute:['r2','m4'],glutemed:['m1','m3','m9'],quad:['r1'],hamstrings:['m9'],gastro:['r3'],soleus:['e3'],tibant:['m2','m10'],achilles:['m5','m8'],coxal:['m7','m9'],femur:['m9']};
export default function Atlas3D({onQuestion}:{onQuestion:(id:string)=>void}){
 const [state,setState]=useState<SceneState>(initial),[history,setHistory]=useState<SceneState[]>([]);
 const [progress,setProgress]=useState(0),[error,setError]=useState(''),[ready,setReady]=useState(false),[saveError,setSaveError]=useState(false);
 const [query,setQuery]=useState(''),[retry,setRetry]=useState(0),[focus,setFocus]=useState(false);
 useEffect(()=>{const exit=(e:KeyboardEvent)=>{if(e.key==='Escape')setFocus(false);};window.addEventListener('keydown',exit);return()=>window.removeEventListener('keydown',exit);},[]);
 const guide=model.learning.find(c=>c.elements.some(id=>state.selected.includes(id)));
 const selected=atlas.parts.find(p=>state.selected.includes(p.id));
 const original=structures.find(s=>s.id===guide?.id);
 const ficha=guide?.id==='oblique'&&original?{...original,kind:'Músculo · oblicuo externo',location:'Pared anterolateral del abdomen. Aquí se representa solo el oblicuo externo de ambos lados.',fn:'Contribuye al movimiento y estabilización del tronco junto con otros músculos abdominales.'}:original;
 const available=model.learning.filter(c=>c.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()));
 const challenges=questions.filter(q=>guide&&(q.target===guide.id||related[guide.id]?.includes(q.id)));
 useEffect(()=>{
  if(typeof DecompressionStream==='undefined')setError('Este navegador no admite la carga comprimida. Usa una versión actual de Edge, Chrome o Firefox, o continúa con el atlas 2D.');
  try{const raw=JSON.parse(localStorage.getItem(THREE_STORAGE)||'null');
   if(raw&&Array.isArray(raw.visible)&&raw.visible.every((x:string)=>Object.hasOwn(layerNames,x))&&Array.isArray(raw.selected)&&raw.selected.every((id:string)=>atlas.parts.some(p=>p.id===id))&&['front','back','side','three-quarter'].includes(raw.view)&&typeof raw.isolate==='boolean'&&typeof raw.rotate==='boolean'&&Number.isFinite(raw.explode)&&raw.explode>=0&&raw.explode<=1&&Array.isArray(raw.offset)&&raw.offset.length===3&&raw.offset.every((n:number)=>Number.isFinite(n)&&Math.abs(n)<=.6))setState({...initial(),...raw,opacity:Object.fromEntries(Object.keys(layerNames).map(id=>[id,opacityFor(raw.opacity,id as SystemId)])),lightweight:raw.lightweight===true,rotate:false,reset:0});
  }catch{setSaveError(true);}setReady(true);
 },[]);
 useEffect(()=>{if(ready)try{localStorage.setItem(THREE_STORAGE,JSON.stringify(state));}catch{setSaveError(true);}},[ready,state]);
 function commit(next:SceneState){setHistory(h=>[...h.slice(-19),state]);setState(next);}
 function select(id:string){const c=model.learning.find(x=>x.id===id||x.elements.includes(id));const part=atlas.parts.find(p=>p.id===(c?.elements[0]||id));const opacity=part&&opacityFor(state.opacity,part.system)<.15?{...state.opacity,[part.system]:1}:state.opacity;commit({...state,opacity,selected:c?c.elements:[id],isolate:false,explode:0,offset:[0,0,0],rotate:false});}
 function translate(axis:number,value:number){const offset=[...(state.offset||[0,0,0])] as [number,number,number];offset[axis]=value;commit({...state,offset,isolate:false});}
 const scope='Selección docente de 25 estructuras o grupos, con 313 mallas incluidas las piezas óseas de contexto. Referencia corporal adulta masculina; no representa todas las anatomías.';
 return <section className={`atlas3d ${focus?'three-focus':''}`} id="workspace" aria-label="Atlas anatómico en tres dimensiones">
  <div className="workshop-heading"><div><div className="eyebrow">HUMAN ATLAS · BODYPARTS3D · SELECCIÓN TSEAS</div><h2>Explora el cuerpo en 3D</h2><p>Selecciona, aísla y desplaza estructuras anatómicas reales del modelo.</p></div><button className="secondary" onClick={()=>commit({...initial(),reset:state.reset+1})}>Reiniciar vista 3D</button></div>
  <div className="three-tools" aria-label="Opciones del visor"><button className="secondary" aria-pressed={focus} onClick={()=>setFocus(!focus)}>{focus?'Mostrar fichas y controles':'Modo proyector · ampliar modelo'}</button><button className="secondary" aria-pressed={!!state.lightweight} onClick={()=>commit({...state,lightweight:!state.lightweight})}>{state.lightweight?'✓ Modo ligero activado':'Modo ligero para equipos lentos'}</button><button className="secondary" onClick={()=>commit({...state,visible:['skeletal','muscular','connective'],opacity:{skeletal:1,muscular:.2,connective:1}})}>Ver huesos bajo músculos</button><button className="secondary" onClick={()=>commit({...state,opacity:{skeletal:1,muscular:1,connective:1}})}>Restaurar opacidad</button></div>
  {focus&&<p className="small-note">Modo proyector: selecciona sobre el modelo. Pulsa Escape o «Mostrar fichas y controles» para volver.</p>}
  <div className="three-grid">
   <aside className="three-library"><h3>Capas visibles</h3>{Object.entries(layerNames).map(([id,name])=><label className="three-check" key={id}><input type="checkbox" checked={state.visible.includes(id as SystemId)} onChange={()=>commit({...state,selected:[],isolate:false,offset:[0,0,0],visible:state.visible.includes(id as SystemId)?state.visible.filter(x=>x!==id):[...state.visible,id as SystemId]})}/>{name}</label>)}
    <details className="three-opacity"><summary>Transparencia por capas</summary><p className="small-note">100 % = opaco. Las capas por debajo del 15 % dejan pasar la selección hacia el interior.</p>{Object.entries(layerNames).map(([id,name])=><label className="three-slider" key={id}>{name} · {Math.round(opacityFor(state.opacity,id as SystemId)*100)} %<input aria-label={`Opacidad de ${name.toLowerCase()}`} type="range" min="0" max="100" step="5" value={Math.round(opacityFor(state.opacity,id as SystemId)*100)} onChange={e=>commit({...state,opacity:{...state.opacity,[id]:Number(e.target.value)/100}})}/></label>)}</details>
    <label className="three-search">Buscar una ficha<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ej.: sóleo, radio, tendón…"/></label>
    <nav className="three-list" aria-label="Estructuras 3D">{available.map(c=><button key={c.id} className={guide?.id===c.id?'selected':''} aria-pressed={guide?.id===c.id} onClick={()=>select(c.id)}>{c.name}<small>{c.elements.length} piezas del modelo</small></button>)}{!available.length&&<p>No hay coincidencias en la selección docente.</p>}</nav>
   </aside>
   <div className="three-center"><div className="three-views" aria-label="Vistas del modelo">{(['front','back','side','three-quarter'] as View[]).map((v,i)=><button className="secondary" key={v} aria-pressed={state.view===v} onClick={()=>commit({...state,view:v,explode:0,reset:state.reset+1,rotate:false})}>{['Anterior','Posterior','Lateral','Oblicua'][i]}</button>)}</div>
    <div className="three-canvas">{ready&&!error&&<AnatomyScene key={retry} atlas={atlas} state={state} onSelect={select} onProgress={setProgress} onError={setError}/>}
     {progress<100&&!error&&<p className="three-loading" role="status">Preparando modelo 3D… {progress}%</p>}
     {error&&<div className="three-loading" role="alert"><p>{error}</p><button className="secondary" onClick={()=>{setError('');setProgress(0);setRetry(n=>n+1);}}>Reintentar carga</button><p>El atlas 2D y los retos siguen disponibles en las pestañas superiores.</p></div>}
    </div>
    <p className="small-note">Arrastra el cuerpo para girar y usa la rueda o el gesto de pinza para acercarte. También puedes seleccionar por nombre y cambiar de vista con los botones.</p>
    <label className="three-slider">Separar las piezas: {Math.round(state.explode*100)} %<input aria-label="Separar las piezas" type="range" min="0" max="100" value={Math.round(state.explode*100)} onChange={e=>commit({...state,explode:Number(e.target.value)/100,isolate:false,offset:[0,0,0],rotate:false})}/></label>
    <button className="secondary" disabled={!history.length} onClick={()=>{setState(history.at(-1)!);setHistory(history.slice(0,-1));}}>Deshacer cambio 3D</button>
   </div>
   <aside className="three-detail" aria-live="polite"><div className="eyebrow">FICHA Y EXPERIMENTACIÓN</div><h2>{guide?.name||selected?.name||'Selecciona una estructura'}</h2>
    {guide?<><span className="pill">{ficha?.kind||'Tendón'}</span><h3>Localización</h3><p>{ficha?.location||'Región posterior del tobillo; une el tríceps sural con el calcáneo.'}</p><h3>Función</h3><p>{ficha?.fn||'Transmite la fuerza del gastrocnemio y el sóleo al calcáneo; participa en la flexión plantar sin generar contracción muscular.'}</p><p className="notice">{ficha?.example||'Durante el ascenso de talones transmite la fuerza de los flexores plantares.'}</p>
    <button className="primary full" disabled={progress<100||!!error} onClick={()=>commit({...state,isolate:!state.isolate,explode:0,offset:[0,0,0],reset:state.reset+1})}>{state.isolate?'Ver en el cuerpo':'Aislar estructura'}</button>
    <h3>Desplazar la selección</h3><p className="small-note">Mueve sus piezas juntas para observar lo que hay debajo. Las flechas del teclado ajustan los controles.</p>{['Horizontal','Vertical','Profundidad'].map((label,i)=><label className="three-slider" key={label}>{label}<input aria-label={`Desplazamiento ${label.toLowerCase()}`} type="range" min="-.6" max=".6" step=".05" value={state.offset?.[i]||0} onChange={e=>translate(i,Number(e.target.value))}/></label>)}
    <button className="secondary full" onClick={()=>commit({...state,offset:[0,0,0],explode:0,isolate:false})}>Devolver a su posición</button>
    {challenges.length>0&&<><h3>Preguntas para el aula</h3>{challenges.map(q=><button className="text-button full" key={q.id} onClick={()=>onQuestion(q.id)}>{q.mode} · {q.topic} →</button>)}</>}
    <details><summary>Identificadores y alcance</summary><p>{guide.elements.length} mallas; un grupo puede reunir varios músculos y ambos lados. Referencias: {guide.sourceIds.join(', ')}.</p></details></>:<p>{selected?'Pieza del esqueleto de contexto. Se conserva su nombre original en inglés; no tiene ficha funcional propia en esta selección.':'Elige una ficha de la lista o pulsa el modelo. Las fichas conservan su función y conexión con las preguntas.'}</p>}
   </aside>
  </div>
  {focus&&<p className="notice"><b>{guide?.name||selected?.name||'Selecciona una estructura'}</b>{ficha?` · ${ficha.fn}`:''}</p>}
  <p className="notice"><b>Separar piezas no simula un movimiento articular.</b> Los desplazamientos sirven para inspeccionar la anatomía; no representan inserciones modificadas, amplitudes de movilidad ni contracciones. Las articulaciones y los movimientos se trabajan en el atlas 2D y el Taller.</p>
  <details className="three-credits"><summary>Fuentes, licencias y límites de esta adaptación</summary><p>{scope}</p><p>El dorsal ancho y el recto abdominal siguen disponibles en 2D; no se ha establecido una correspondencia inequívoca para ellos en este conjunto de mallas.</p><p>Motor adaptado de <a href="https://github.com/ashemag/human-atlas" target="_blank" rel="noreferrer">Human Atlas, ashemag</a> (MIT). Modelos: BodyParts3D, © The Database Center for Life Science, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Adaptaciones: selección docente, agrupación y nombres en español, corrección de clasificación del tibial anterior, empaquetado local y desplazamientos de inspección. Se conservan las geometrías simplificadas del repositorio.</p><p><a href="./credits/human-atlas-MIT.txt" target="_blank">Licencia del código</a> · <a href="./credits/BodyParts3D.md" target="_blank">Atribución completa de los datos</a></p></details>
  <p className="small-note">{saveError?'⚠ No se ha podido recuperar o guardar la vista 3D.':'✓ Vista 3D guardada en este navegador.'} La exploración 3D no concede puntos; las preguntas enlazadas usan el marcador del equipo activo.</p>
 </section>;
}
