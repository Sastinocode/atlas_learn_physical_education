'use client';
// Core · transmisión y estabilidad: el maniquí en la postura de cada caso (empuje, carga unilateral, plancha).
// En cada paso se ilumina en ocre la región que lo protagoniza y aparecen sus flechas:
// negra = apoyo o reacción del suelo, sepia = peso o carga, carmín = fuerza que aplica la persona.
// Las flechas indican dirección, no magnitud.
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {COLOR,buildBody,createStage,forceArrow,toScreen} from './body';

export type StabilityCase='push'|'carry'|'plank';
export type StabilityProps={caseId:StabilityCase;step:number};

const OCHRE='#c98a2c',FLOOR=4,rad=T.MathUtils.degToRad;
const VIEWS:Record<StabilityCase,[[number,number,number],[number,number,number]]>={
 push:[[-250,135,150],[0,90,25]],
 carry:[[-90,125,300],[0,92,0]],
 plank:[[-250,45,60],[0,26,25]]
};
type Tag={text:string;at:()=>T.Vector3};

export default function StabilityMannequin({caseId,step}:StabilityProps){
 const stageRef=useRef<HTMLDivElement>(null),tagRefs=useRef<(HTMLSpanElement|null)[]>([]);
 const live=useRef({caseId,step});live.current={caseId,step};
 const [failed,setFailed]=useState(false);
 const [tags,setTags]=useState<string[]>([]);

 useEffect(()=>{
  const stage=stageRef.current;if(!stage)return;
  let stageApi:ReturnType<typeof createStage>;
  try{stageApi=createStage(stage,{minDistance:80,maxDistance:520});}catch{setFailed(true);return;}
  const {scene,cam}=stageApi;
  const {limbs:L,root,pelvis,torso}=buildBody(scene);
  const glass=new T.MeshStandardMaterial({color:COLOR.body,transparent:true,opacity:.3,depthWrite:false,roughness:.8});
  const base=L.hipL.meshes[0].material as T.Material,lit=new T.MeshStandardMaterial({color:OCHRE,roughness:.6,emissive:'#5a3a08',emissiveIntensity:.25});
  // Cilindro del core (solo se ve cuando su paso lo pide), unido al tronco para que siga la postura
  const shellMat=new T.MeshStandardMaterial({color:OCHRE,transparent:true,opacity:.55,side:T.DoubleSide,depthWrite:false,emissive:'#5a3a08',emissiveIntensity:.2});
  const shell=(from:number,len:number)=>{const m=new T.Mesh(new T.CylinderGeometry(15.4,15.4,38,40,1,true,from,len),shellMat);m.scale.z=.66;m.position.y=114;root.add(m);return m;};
  const coreAll=shell(0,Math.PI*2),coreSides=[shell(.6,1.5),shell(-2.1,1.5)],coreFront=shell(-.75,1.5);
  const diaphragm=new T.Mesh(new T.SphereGeometry(13,32,12,0,Math.PI*2,0,Math.PI/2),shellMat);diaphragm.scale.z=.66;diaphragm.position.y=128;root.add(diaphragm);
  // Objetos: caja para empujar y maleta
  const wood=new T.MeshStandardMaterial({color:'#8a6a4f',roughness:.8});
  const box=new T.Mesh(new T.BoxGeometry(46,1,30),wood);scene.add(box); // su altura se ajusta a las manos
  const bag=new T.Mesh(new T.BoxGeometry(10,26,34),new T.MeshStandardMaterial({color:'#5a4636',roughness:.7}));L.shoulderR.end.add(bag);bag.position.set(0,-17,0);
  // Flechas
  const ground1=forceArrow(COLOR.ink,26),ground2=forceArrow(COLOR.ink,26),weight=forceArrow(COLOR.load,28),push=forceArrow(COLOR.muscle,26),reaction=forceArrow(COLOR.muscle,22,.8);
  reaction.traverse(o=>{const m=(o as T.Mesh).material as T.MeshBasicMaterial|undefined;if(m){m.opacity=.45;}});
  // Flecha curva (momento): arco con punta
  const curve=new T.Group();{const mat=new T.MeshBasicMaterial({color:COLOR.load,depthTest:false,transparent:true});
   const arc=new T.Mesh(new T.TorusGeometry(26,1,8,32,Math.PI*.6),mat);curve.add(arc);
   const tip=new T.Mesh(new T.ConeGeometry(3,7,14),mat);tip.position.set(26*Math.cos(Math.PI*.6),26*Math.sin(Math.PI*.6),0);tip.rotation.z=Math.PI*.6;curve.add(tip);
   curve.renderOrder=20;curve.traverse(o=>o.renderOrder=20);}
  const arrows=[ground1,ground2,weight,push,reaction,curve];scene.add(...arrows);
  const up=new T.Vector3(0,1,0),v=new T.Vector3();
  const place=(a:T.Object3D,from:T.Vector3,dir:T.Vector3)=>{a.position.copy(from);a.quaternion.setFromUnitVectors(up,dir.clone().normalize());a.visible=true;};
  const world=(o:T.Object3D,local?:[number,number,number])=>local?o.localToWorld(new T.Vector3(...local)):o.getWorldPosition(new T.Vector3());
  // Apoya la figura en el suelo: baja o sube todo hasta que el punto más bajo de los pies toque el suelo
  const settle=(points:()=>T.Vector3[])=>{scene.updateMatrixWorld(true);const low=Math.min(...points().map(p=>p.y));root.position.y+=FLOOR-low;scene.updateMatrixWorld(true);};
  const footBottom=(leg:typeof L.hipR)=>[world(leg.end,[0,-4,-5]),world(leg.end,[0,-4,17])];

  let lastCase:StabilityCase|null=null,current:Tag[]=[],plankTilt=6;
  // Plancha: inclinación del cuerpo para que antebrazos y puntas de los pies apoyen a la vez
  const plankPose=(tilt:number)=>{root.rotation.set(rad(90-tilt),0,0);root.position.set(0,0,0);for(const a of [L.shoulderR,L.shoulderL]){a.root.rotation.x=rad(-90+tilt);a.mid.rotation.x=rad(-90);}scene.updateMatrixWorld(true);};
  const plankGap=()=>world(L.shoulderR.mid,[0,-3.5,0]).y-world(L.hipR.end,[0,-4,17]).y;
  const fitPlank=()=>{let best=0,err=Infinity;for(let a=0;a<=20;a+=.25){plankPose(a);const e=Math.abs(plankGap());if(e<err){err=e;best=a;}}plankTilt=best;};
  const start=performance.now();
  stageApi.loop(now=>{
   const {caseId,step}=live.current,t=(now-start)/1000;
   if(caseId!==lastCase){stageApi.lookFrom(...VIEWS[caseId]);lastCase=caseId;if(caseId==='plank'){for(const l of Object.values(L)){l.root.rotation.set(0,0,0);l.mid.rotation.set(0,0,0);l.end.rotation.set(0,0,0);}fitPlank();}}
   // Postura base
   root.rotation.set(0,0,0);root.position.set(0,0,0);
   for(const l of Object.values(L)){l.root.rotation.set(0,0,0);l.mid.rotation.set(0,0,0);l.end.rotation.set(0,0,0);}
   for(const m of [...Object.values(L).flatMap(l=>l.meshes),pelvis,torso])m.material=base;
   for(const o of [...arrows,coreAll,...coreSides,coreFront,diaphragm])o.visible=false;
   box.visible=caseId==='push';bag.visible=caseId==='carry';diaphragm.scale.y=1;
   const light=(...ms:T.Mesh[])=>ms.forEach(m=>m.material=lit);
   // En los pasos del cilindro del core, tronco y pelvis translúcidos para ver el interior
   const coreStep=(caseId==='push'&&step===2)||(caseId==='carry'&&step===2)||(caseId==='plank'&&step>=2);
   if(coreStep){torso.material=glass;pelvis.material=glass;}
   const tagsNow:Tag[]=[];
   if(caseId==='push'){
    // Pies separados, tronco inclinado 15° y brazos al frente contra la caja
    root.rotation.x=rad(15);
    L.hipR.root.rotation.x=rad(-15-15);L.hipR.mid.rotation.x=rad(15);L.hipR.end.rotation.x=rad(0);
    L.hipL.root.rotation.x=rad(15-15);L.hipL.end.rotation.x=rad(-15);
    for(const a of [L.shoulderR,L.shoulderL]){a.root.rotation.x=rad(-80);a.mid.rotation.x=rad(-10);}
    settle(()=>[...footBottom(L.hipR),...footBottom(L.hipL)]);
    const hand=world(L.shoulderR.end),h=hand.y+12;box.scale.y=h;box.position.set(0,h/2,hand.z+17);
    if(step===0){light(L.hipR.meshes[2],L.hipL.meshes[2]);place(ground1,world(L.hipR.end,[0,-4,6]),v.set(0,1,.25));place(ground2,world(L.hipL.end,[0,-4,6]),v.set(0,1,.25));tagsNow.push({text:'Reacción del suelo',at:()=>world(ground1,[0,26,0])});}
    if(step===1)light(L.hipR.meshes[0],L.hipR.meshes[1],L.hipL.meshes[0],L.hipL.meshes[1],pelvis);
    if(step===2){coreAll.visible=true;tagsNow.push({text:'El tronco controla y transmite',at:()=>world(root,[22,118,0])});}
    if(step===3){light(...L.shoulderR.meshes,...L.shoulderL.meshes);const h=world(L.shoulderR.end);place(push,h,v.set(0,0,1));place(reaction,world(L.shoulderL.end).add(new T.Vector3(0,6,24)),v.set(0,0,-1));
     tagsNow.push({text:'Empuje sobre la caja',at:()=>world(push,[0,26,0])},{text:'Reacción de la caja',at:()=>world(reaction,[0,22,0])});}
   }else if(caseId==='carry'){
    // De pie con la maleta en la mano derecha; en el paso 4 el tronco oscila un poco: controla sin bloquear
    if(step===3)root.rotation.z=rad(2.5*Math.sin(t*2));
    L.shoulderR.root.rotation.z=rad(-10);L.shoulderL.root.rotation.z=rad(18); // brazos algo separados: se ven los laterales del tronco
    settle(()=>[...footBottom(L.hipR),...footBottom(L.hipL)]);
    if(step===0){light(...L.shoulderR.meshes);place(weight,world(bag).add(new T.Vector3(0,-14,0)),v.set(0,-1,0));
     curve.visible=true;curve.position.copy(world(root,[0,128,14]));curve.rotation.set(0,0,rad(75)); // arco por el lado de la maleta, bajando hacia ella
     tagsNow.push({text:'Peso de la maleta',at:()=>world(weight,[0,28,0])},{text:'Tiende a inclinar el tronco',at:()=>world(curve,[-8,30,0])});}
    if(step===1){light(L.hipR.meshes[2],L.hipL.meshes[2],pelvis);place(ground1,world(L.hipR.end,[0,-4,6]),up);place(ground2,world(L.hipL.end,[0,-4,6]),up);tagsNow.push({text:'Reacción del suelo',at:()=>world(ground2,[0,26,0])});}
    if(step===2){coreSides.forEach(s=>s.visible=true);tagsNow.push({text:'Ambos lados del tronco',at:()=>world(root,[24,116,0])});}
    if(step===3){light(torso,pelvis);tagsNow.push({text:'Controla sin bloquear',at:()=>world(root,[22,130,0])});}
   }else{
    // Plancha de antebrazos: cuerpo horizontal boca abajo, codos bajo los hombros, apoyo en antebrazos y puntas
    plankPose(plankTilt);
    settle(()=>[world(L.shoulderR.mid,[0,-3.5,0]),world(L.shoulderL.mid,[0,-3.5,0]),...footBottom(L.hipR).slice(1),...footBottom(L.hipL).slice(1)]);
    if(step===0){light(L.shoulderR.meshes[1],L.shoulderL.meshes[1],L.hipR.meshes[2],L.hipL.meshes[2]);
     place(ground1,world(L.shoulderR.mid,[0,-3.5,0]).add(new T.Vector3(0,-26,0)),up);place(ground2,world(L.hipR.end,[0,-4,17]).add(new T.Vector3(0,-26,0)),up);
     for(const a of [ground1,ground2])a.position.y=FLOOR;tagsNow.push({text:'Apoyo en antebrazos',at:()=>world(ground1,[0,26,0])},{text:'Apoyo en las puntas',at:()=>world(ground2,[0,26,0])});}
    if(step===1){place(weight,world(pelvis).add(new T.Vector3(0,0,0)),v.set(0,-1,0));curve.visible=true;curve.position.copy(world(pelvis).add(new T.Vector3(-20,-10,0)));curve.rotation.set(0,rad(-90),rad(200));
     tagsNow.push({text:'La gravedad tiende a hundir la cadera',at:()=>world(weight,[0,28,0])});}
    if(step===2){coreFront.visible=true;tagsNow.push({text:'Trabajo isométrico: tensión sin movimiento',at:()=>world(root,[24,112,-12])});}
    if(step===3){diaphragm.visible=true;diaphragm.scale.y=.75+.25*Math.sin(t*1.6);tagsNow.push({text:'La respiración continúa',at:()=>world(root,[22,132,0])});}
   }
   scene.updateMatrixWorld(true);
   // Etiquetas
   if(tagsNow.map(x=>x.text).join('|')!==current.map(x=>x.text).join('|'))setTags(tagsNow.map(x=>x.text));
   current=tagsNow;
   current.forEach((tag,k)=>{const el=tagRefs.current[k];if(!el)return;const p=toScreen(tag.at(),cam,stage);
    el.style.transform=`translate(${Math.max(4,Math.min(stage.clientWidth-el.offsetWidth-4,p.x-el.offsetWidth/2))}px,${Math.max(4,Math.min(stage.clientHeight-el.offsetHeight-4,p.y-el.offsetHeight-6))}px)`;});
  });
  return()=>stageApi.dispose();
 },[]);

 if(failed)return null;
 return <figure className="mannequin stability3d" role="img" aria-label={`Maniquí 3D, paso ${step+1}: ${tags.join('. ')||'región iluminada en ocre'}.`}>
  <div className="mannequin-stage" ref={stageRef}>{tags.map((t,k)=><span key={t} ref={el=>{tagRefs.current[k]=el;}} className="stability-tag">{t}</span>)}</div>
  <figcaption className="mannequin-legend"><span><i style={{background:OCHRE}}/>Región de este paso</span><span><i className="axis"/>Apoyo o reacción del suelo</span><span><i style={{background:COLOR.load}}/>Peso o carga</span><span><i style={{background:COLOR.muscle}}/>Fuerza que aplica la persona</span><span>Las flechas indican dirección, no magnitud</span></figcaption>
 </figure>;
}
