'use client';
import {useEffect,useState,type ComponentType} from 'react';

type Atlas3DProps={onQuestion:(id:string)=>void};
type Loaded={__atlas3d?:{default:ComponentType<Atlas3DProps>}};

// El 3D (modelo y Three.js) va en atlas3d.js y se descarga al entrar en este modo.
// Se carga con una etiqueta <script> normal para que también funcione abriendo el archivo con doble clic.
export default function Atlas3DLazy(props:Atlas3DProps){
 const [Comp,setComp]=useState<ComponentType<Atlas3DProps>|null>(()=>(window as Loaded).__atlas3d?.default??null);
 const [failed,setFailed]=useState(false);
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{
  if(Comp)return;
  setFailed(false);
  const script=document.createElement('script');
  script.src='./atlas3d.js';
  script.onload=()=>{const loaded=(window as Loaded).__atlas3d?.default;if(loaded)setComp(()=>loaded);else setFailed(true);};
  script.onerror=()=>setFailed(true);
  document.head.appendChild(script);
  return()=>{script.onload=null;script.onerror=null;script.remove();};
 },[Comp,attempt]);
 if(Comp)return <Comp {...props}/>;
 if(failed)return <div className="notice" role="alert">No se ha podido cargar el modelo 3D. Comprueba la conexión y <button className="text-button" onClick={()=>setAttempt(a=>a+1)}>vuelve a intentarlo</button>.</div>;
 return <div className="notice" role="status">Cargando el modelo 3D… (la primera vez tarda unos segundos)</div>;
}
