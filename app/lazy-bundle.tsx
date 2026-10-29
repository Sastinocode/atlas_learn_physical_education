'use client';
import {useEffect,useState,type ComponentType} from 'react';

// Carga un archivo .js aparte (con una etiqueta <script> normal, que también funciona con doble clic)
// y devuelve el componente que ese archivo deja en window[key].
export function useBundle<P>(src:string,key:string){
 const read=()=>(window as unknown as Record<string,{default:ComponentType<P>}|undefined>)[key]?.default??null;
 const [Comp,setComp]=useState<ComponentType<P>|null>(read);
 const [failed,setFailed]=useState(false);
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{
  if(Comp)return;
  const existing=read();if(existing){setComp(()=>existing);return;}
  setFailed(false);
  let script=document.querySelector<HTMLScriptElement>(`script[data-bundle="${key}"]`);
  const onLoad=()=>{const loaded=read();if(loaded)setComp(()=>loaded);else setFailed(true);};
  const onError=()=>{script?.remove();setFailed(true);};
  if(!script){script=document.createElement('script');script.src=src;script.dataset.bundle=key;document.head.appendChild(script);}
  script.addEventListener('load',onLoad);script.addEventListener('error',onError);
  return()=>{script?.removeEventListener('load',onLoad);script?.removeEventListener('error',onError);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[Comp,attempt]);
 return {Comp,failed,retry:()=>setAttempt(a=>a+1)};
}
