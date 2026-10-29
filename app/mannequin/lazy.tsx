'use client';
import type {ReactNode} from 'react';
import {useBundle} from '../lazy-bundle';
import type {MannequinProps} from './scene';
import type {LeverProps} from './levers';
import type {CoreProps} from './core';

// Los maniquíes (con Three.js) van en mannequin.js y solo se descargan cuando aparecen en pantalla.
// Mientras carga, o si falla, se muestra el esquema 2D que se le pase como fallback.
function Loading({fallback,compact,failed}:{fallback?:ReactNode;compact?:boolean;failed:boolean}){
 return <div className={compact?'mannequin compact loading':'mannequin loading'} aria-busy={!failed}>
  {fallback}
  {!failed&&<span className="mannequin-loading">Cargando maniquí 3D…</span>}
 </div>;
}
export default function Mannequin3D({fallback,...props}:MannequinProps&{fallback?:ReactNode}){
 const {Comp,failed}=useBundle<MannequinProps>('./mannequin.js','__mannequin');
 return Comp?<Comp {...props}/>:<Loading fallback={fallback} compact={props.compact} failed={failed}/>;
}
export function Lever3D({fallback,...props}:LeverProps&{fallback?:ReactNode}){
 const {Comp,failed}=useBundle<LeverProps>('./mannequin.js','__mannequin','levers');
 return Comp?<Comp {...props}/>:<Loading fallback={fallback} compact={props.compact} failed={failed}/>;
}
export function Core3D({fallback,...props}:CoreProps&{fallback?:ReactNode}){
 const {Comp,failed}=useBundle<CoreProps>('./mannequin.js','__mannequin','core');
 return Comp?<Comp {...props}/>:<Loading fallback={fallback} failed={failed}/>;
}
