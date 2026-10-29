import {useState} from 'react';
import squat from './assets/exercise-squat-v1.png?inline';
import lunge from './assets/exercise-lunge-v1.png?inline';
import calf from './assets/exercise-calf-v1.png?inline';
import pushup from './assets/exercise-pushup-v1.png?inline';
import row from './assets/exercise-row-v1.png?inline';
import press from './assets/exercise-press-v1.png?inline';
const illustrations:Record<string,string>={squat,lunge,calf,pushup,row,press};
export function ExerciseThumbnail({id}:{id:string}){
 return <span className="exercise-thumbnail" aria-hidden="true" style={{backgroundImage:`url(${illustrations[id]})`}}/>;
}
export default function ExerciseArt({id,name,amount,phase}:{id:string;name:string;amount:number;phase:string}){
 const [failed,setFailed]=useState(false);
 const frame=Math.min(2,Math.max(0,Math.round(amount*2)));
 return <figure className="exercise-art">
  <div className="exercise-art-top"><span>ATLAS EN ACCIÓN</span><span>Pose {frame+1} / 3</span></div>
  <div className="exercise-art-window" role="img" aria-label={`${name}: ${phase}. Pose ilustrada ${frame+1} de 3. Figura anatómica con musculatura destacada.`}>
   <img src={illustrations[id]} alt="" draggable={false} onError={()=>setFailed(true)} style={{transform:`translateX(-${frame*100/3}%)`}}/>
   {failed&&<p className="exercise-art-error" role="alert">No se ha podido cargar la ilustración. Puedes consultar «Esquema y fuerzas».</p>}
  </div>
  <figcaption><strong>{phase}</strong><span className="art-pose-dots" aria-hidden="true">{[0,1,2].map(i=><i className={i===frame?'active':''} key={i}/>)}</span></figcaption>
  <p className="exercise-art-note">Ilustración anatómica generada con IA · 3 poses de referencia. El color localiza musculatura; no mide activación ni distingue su papel funcional.</p>
 </figure>;
}
