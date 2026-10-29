'use client';
// Palancas corporales sobre el maniquí 3D: el gesto se repite y, al revelar, aparecen
// A (apoyo, punto negro), F (fuerza muscular, flecha carmín) y R (resistencia, flecha sepia).
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {COLOR,buildBody,createStage,forceArrow,toScreen} from './body';
import {levers} from '../levers-content';

export type LeverProps={index:number;labels:boolean;compact?:boolean};

// Encuadre de cada ejemplo, mirando desde el lado derecho de la figura
const VIEWS:[number,number,number][][]=[
 [[-175,168,95],[0,152,2]],   // cabeza
 [[-175,62,90],[0,30,6]],     // talones
 [[-170,128,95],[-19,112,14]] // codo
];

export default function LeverMannequin({index,labels,compact=false}:LeverProps){
 const stageRef=useRef<HTMLDivElement>(null),tagRefs=useRef<(HTMLSpanElement|null)[]>([]);
 const live=useRef({index,labels});live.current={index,labels};
 const [failed,setFailed]=useState(false);
 const lever=levers[index];

 useEffect(()=>{
  const stage=stageRef.current;if(!stage)return;
  let stageApi:ReturnType<typeof createStage>;
  try{stageApi=createStage(stage,{minDistance:60,maxDistance:500});}catch{setFailed(true);return;}
  const {scene,cam}=stageApi;
  const {limbs,root,head}=buildBody(scene);
  const arm=limbs.shoulderR,legR=limbs.hipR,legL=limbs.hipL;
  // Mancuerna en la mano derecha (solo en el tercer género)
  const iron=new T.MeshStandardMaterial({color:'#4a4038',roughness:.5,metalness:.3});
  const dumbbell=new T.Group();
  const bar=new T.Mesh(new T.CylinderGeometry(.9,.9,16,12),iron);bar.rotation.z=Math.PI/2;
  const plateA=new T.Mesh(new T.CylinderGeometry(4.2,4.2,2.6,24),iron);plateA.rotation.z=Math.PI/2;plateA.position.x=6.5;
  const plateB=plateA.clone();plateB.position.x=-6.5;
  dumbbell.add(bar,plateA,plateB);dumbbell.position.set(0,-3,0);arm.end.add(dumbbell);
  // Marcas A, F y R
  const fulcrum=new T.Mesh(new T.SphereGeometry(2.4,16,12),new T.MeshBasicMaterial({color:COLOR.ink,depthTest:false,transparent:true}));fulcrum.renderOrder=21;
  const force=forceArrow(COLOR.muscle,24),load=forceArrow(COLOR.load,24);
  scene.add(fulcrum,force,load);
  const up=new T.Vector3(0,1,0),tmpA=new T.Vector3(),tmpB=new T.Vector3(),dir=new T.Vector3();
  const place=(arrow:T.Group,from:T.Vector3,direction:T.Vector3)=>{arrow.position.copy(from);arrow.quaternion.setFromUnitVectors(up,direction.clone().normalize());};
  let lastIndex=-1;const start=performance.now();
  stageApi.loop(now=>{
   const {index,labels}=live.current;
   if(index!==lastIndex){stageApi.lookFrom(VIEWS[index][0],VIEWS[index][1]);lastIndex=index;}
   const t=(1-Math.cos(((now-start)/1500)*Math.PI))/2; // 0→1→0
   // Postura neutra
   head.rotation.set(0,0,0);root.position.y=0;arm.mid.rotation.set(0,0,0);
   for(const leg of [legR,legL])leg.end.rotation.set(0,0,0);
   dumbbell.visible=index===2;
   if(index===0)head.rotation.x=T.MathUtils.degToRad(-10+25*t);          // asentir
   if(index===1){                                                         // subir de talones
    const phi=T.MathUtils.degToRad(30*t);for(const leg of [legR,legL])leg.end.rotation.x=phi;
    root.position.y=4*Math.cos(phi)+17*Math.sin(phi)-4;                   // la punta del pie sigue en el suelo
   }
   if(index===2)arm.mid.rotation.x=T.MathUtils.degToRad(-(40+80*t));      // flexión de codo
   scene.updateMatrixWorld(true);
   // Posición de A, F y R según el ejemplo
   const show=labels;fulcrum.visible=force.visible=load.visible=show;
   if(show){
    if(index===0){
     head.getWorldPosition(tmpA);fulcrum.position.copy(tmpA);
     place(force,head.localToWorld(tmpB.set(0,3,-8.5)),dir.set(0,-1,-.15));
     place(load,head.localToWorld(tmpB.set(0,8,4)),dir.set(0,-1,0));
    }else if(index===1){
     fulcrum.position.copy(legR.end.localToWorld(tmpA.set(0,-4,13)));
     place(load,legR.end.getWorldPosition(tmpB).add(dir.set(0,22,0)),dir.set(0,-1,0));
     place(force,legR.end.localToWorld(tmpB.set(0,-1,-5.5)),dir.set(0,1,-.12));
    }else{
     arm.mid.getWorldPosition(tmpA);fulcrum.position.copy(tmpA);
     const insertion=arm.mid.localToWorld(tmpB.set(0,-4.5,1.5)).clone();
     place(force,insertion,arm.root.getWorldPosition(new T.Vector3()).sub(insertion));
     place(load,dumbbell.getWorldPosition(new T.Vector3()).add(dir.set(0,1,0)),dir.set(0,-1,0));
    }
    // Etiquetas HTML junto a cada marca
    const tips=[fulcrum.position.clone(),force.localToWorld(new T.Vector3(0,26,0)),load.localToWorld(new T.Vector3(0,26,0))];
    tags.forEach((key,k)=>{const el=tagRefs.current[k];if(!el)return;const p=toScreen(tips[k],cam,stage);
     el.style.transform=`translate(${p.x+6}px,${p.y-30}px)`;el.style.display=p.behind?'none':'';});
   }
  });
  return()=>stageApi.dispose();
 },[]);

 if(failed)return <p className="notice" role="alert">Este navegador no puede mostrar el maniquí 3D (WebGL desactivado).</p>;
 const text=(letter:string)=>lever.parts.find(p=>p.startsWith(letter))??letter;
 return <figure className={compact?'mannequin compact':'mannequin'} role="img" aria-label={`${lever.name}, ${lever.title.toLowerCase()}. ${labels?lever.parts.join('. '):'Observa el gesto y localiza apoyo, fuerza y resistencia.'}`}>
  <div className="mannequin-stage" ref={stageRef}>
   {tags.map((key,k)=><span key={key} ref={el=>{tagRefs.current[k]=el;}} className={`lever-tag ${key}`} hidden={!labels}>{key}</span>)}
  </div>
  {!compact&&<figcaption className="mannequin-legend lever-legend">
   {labels?tags.map(key=><span key={key}><b className={`lever-tag ${key}`}>{key}</b>{text(key).replace(/^[AFR] · /,'')}</span>):<span>Observa el gesto. ¿Dónde está el apoyo? ¿Dónde tira el músculo? ¿Dónde está la carga?</span>}
   <span>Arrastra para girar</span>
  </figcaption>}
 </figure>;
}
const tags=['A','F','R'] as const;
