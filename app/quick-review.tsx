'use client';
// Repaso rápido para empezar la clase: 10 preguntas al azar de Localizar y Relacionar, sin puntos.
// El profesor muestra la respuesta y marca si la clase acierta; no modifica el progreso guardado.
import {useState} from 'react';
import {ArrowRight,Check,RotateCcw,X} from 'lucide-react';
import {Dialog,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {DialogContent} from './modal';
import {questions,structures,type Question} from './content';

const pick=()=>[...questions.filter(q=>q.mode==='localizar'||q.mode==='relacionar')].sort(()=>Math.random()-.5).slice(0,10);
function answerOf(q:Question){
 if(q.mode==='localizar'){const s=structures.find(x=>x.id===q.target);return s?`${s.name}: ${s.location}`:'';}
 return q.options?.[q.correct??0]??'';
}

export default function QuickReview({open,onOpenChange}:{open:boolean;onOpenChange:(open:boolean)=>void}){
 const [set,setSet]=useState<Question[]>(pick),[index,setIndex]=useState(0),[shown,setShown]=useState(false),[marks,setMarks]=useState<boolean[]>([]);
 const q=set[index],finished=marks.length===set.length,hits=marks.filter(Boolean).length;
 function restart(){setSet(pick());setIndex(0);setShown(false);setMarks([]);}
 function mark(hit:boolean){const next=[...marks,hit];setMarks(next);setShown(false);if(index<set.length-1)setIndex(index+1);}
 return <Dialog open={open} onOpenChange={o=>{onOpenChange(o);if(!o)restart();}}><DialogContent className="wide-modal quick-review">
  <DialogTitle className="modal-title">Repaso rápido</DialogTitle>
  <DialogDescription>10 preguntas al azar de Localizar y Relacionar. Sin puntos: no cambia el marcador ni el progreso guardado.</DialogDescription>
  {!finished?<>
   <div className="eyebrow">PREGUNTA {index+1} DE {set.length} · {q.mode==='localizar'?'LOCALIZAR':'RELACIONAR'} · {q.topic}</div>
   <h3 className="review-prompt">{q.prompt}</h3>
   {q.mode==='relacionar'&&<ol className="review-options" type="A">{q.options?.map((o,i)=><li key={o} className={shown&&i===q.correct?'right':''}>{o}</li>)}</ol>}
   {q.mode==='localizar'&&!shown&&<p className="small-note">Que la clase señale la estructura en el atlas o en su propio cuerpo.</p>}
   <div aria-live="polite">{shown&&<div className="review-answer"><b>Respuesta:</b> {answerOf(q)}<p>{q.why}</p></div>}</div>
   <div className="review-actions">
    {!shown?<button className="primary" onClick={()=>setShown(true)}>Mostrar respuesta</button>:<>
     <button className="primary" onClick={()=>mark(true)}><Check size={18}/> La clase acierta</button>
     <button className="secondary" onClick={()=>mark(false)}><X size={18}/> La clase falla</button>
    </>}
    {!shown&&<button className="text-button" onClick={()=>mark(false)}>Saltar <ArrowRight size={16}/></button>}
   </div>
  </>:<div className="review-summary">
   <p className="review-score"><b>{hits}</b> de {set.length} acertadas</p>
   {hits<set.length?<><h3>Para repasar</h3><ul>{set.filter((_,i)=>!marks[i]).map(x=><li key={x.id}><b>{x.topic}.</b> {answerOf(x)}</li>)}</ul></>:<p>¡Todo acertado!</p>}
   <div className="review-actions"><button className="primary" onClick={restart}><RotateCcw size={16}/> Otras 10 preguntas</button><button className="secondary" onClick={()=>onOpenChange(false)}>Cerrar</button></div>
  </div>}
 </DialogContent></Dialog>;
}
