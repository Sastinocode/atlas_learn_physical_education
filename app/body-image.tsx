'use client';
import {useState} from 'react';
import anatomy from './assets/anatomy.png?inline';
import skeleton from './assets/skeleton.png?inline';
import type {View} from './content';
export default function BodyImage({view,muscles=false,onReady}:{view:View;muscles?:boolean;onReady?:(ready:boolean)=>void}){
 const [failed,setFailed]=useState(false);
 return <><img className={`body-image ${view==='p'?'back':''}`} src={muscles?anatomy:skeleton} alt="" draggable={false} onLoad={()=>{setFailed(false);onReady?.(true);}} onError={()=>{setFailed(true);onReady?.(false);}}/>
 {failed&&<div className="image-error" role="alert">No se ha podido mostrar la lámina. Recarga la aplicación antes de continuar con la localización.</div>}</>;
}
