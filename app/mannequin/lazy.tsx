'use client';
import type {ReactNode} from 'react';
import {useBundle} from '../lazy-bundle';
import type {MannequinProps} from './scene';

// El maniquí (con Three.js) va en mannequin.js y solo se descarga cuando aparece en pantalla.
// Mientras carga, o si falla, se muestra el esquema 2D que se le pase como fallback.
export default function Mannequin3D({fallback,...props}:MannequinProps&{fallback?:ReactNode}){
 const {Comp,failed}=useBundle<MannequinProps>('./mannequin.js','__mannequin');
 if(Comp)return <Comp {...props}/>;
 return <div className={props.compact?'mannequin compact loading':'mannequin loading'} aria-busy={!failed}>
  {fallback}
  {!failed&&<span className="mannequin-loading">Cargando maniquí 3D…</span>}
 </div>;
}
