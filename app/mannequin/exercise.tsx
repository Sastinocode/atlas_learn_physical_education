'use client';
// Ejercicios del gimnasio sobre el maniquí 3D: sentadilla, zancada y press de hombros.
// Las poses salen de app/exercise-poses.ts; aquí solo se colocan las piezas y las etiquetas de grados.
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {COLOR,buildBody,createStage,toScreen} from './body';
import {anglesAt,flatLeg,hipFromAnkle,rearLeg,exercisePoses,LUNGE_FRONT_ANKLE,LUNGE_REAR_BALL,SCAPULAR_PLANE,SEG,type ExercisePoseId} from '../exercise-poses';

export type ExerciseProps={id:ExercisePoseId;amount:number;jointId:string;phaseLabel:string};
const SAGITTAL='#2f5d8c';
const VIEWS:Record<ExercisePoseId,[[number,number,number],[number,number,number]]>={
 squat:[[-250,125,175],[0,68,-6]],
 lunge:[[-270,120,150],[0,62,0]],
 press:[[-190,160,240],[0,108,4]]
};
const NAMES:Record<string,string>={hip:'Cadera',knee:'Rodilla',ankle:'Tobillo',shoulder:'Hombro',elbow:'Codo',scapula:'Escápula'};
const rad=T.MathUtils.degToRad;

export default function ExerciseMannequin({id,amount,jointId,phaseLabel}:ExerciseProps){
 const stageRef=useRef<HTMLDivElement>(null),tagRefs=useRef<Record<string,HTMLSpanElement|null>>({});
 const live=useRef({id,amount,jointId});live.current={id,amount,jointId};
 const [failed,setFailed]=useState(false);
 const joints=id==='press'?['shoulder','elbow','scapula']:id==='lunge'?['hip','knee']:['hip','knee','ankle'];

 useEffect(()=>{
  const stage=stageRef.current;if(!stage)return;
  let stageApi:ReturnType<typeof createStage>;
  try{stageApi=createStage(stage,{minDistance:90,maxDistance:520});}catch{setFailed(true);return;}
  const {scene,cam}=stageApi;
  const {limbs,root}=buildBody(scene);
  const L=limbs,armR=L.shoulderR,armL=L.shoulderL,legR=L.hipR,legL=L.hipL;
  // Pierna o brazos analizados resaltados
  const moving=new T.MeshStandardMaterial({color:COLOR.moving,roughness:.7}),restMat=legL.meshes[0].material;
  // Banco con respaldo (press sentado)
  const wood=new T.MeshStandardMaterial({color:'#8a6a4f',roughness:.8});
  const bench=new T.Group();
  const seat=new T.Mesh(new T.BoxGeometry(38,4,42),wood);seat.position.set(0,SEG.ankleY+36,4);
  const back=new T.Mesh(new T.BoxGeometry(36,62,4),wood);back.position.set(0,SEG.ankleY+70,-11);
  bench.add(seat,back);
  for(const [x,z] of [[-15,-12],[15,-12],[-15,20],[15,20]]){const leg=new T.Mesh(new T.CylinderGeometry(1.4,1.4,40,10),wood);leg.position.set(x,SEG.ankleY+18,z);bench.add(leg);}
  scene.add(bench);
  // Mancuernas en ambas manos (press)
  const iron=new T.MeshStandardMaterial({color:'#4a4038',roughness:.5,metalness:.3});
  const dumbbells=[armR,armL].map(arm=>{const g=new T.Group();const bar=new T.Mesh(new T.CylinderGeometry(.9,.9,16,12),iron);bar.rotation.z=Math.PI/2;
   const plate=new T.Mesh(new T.CylinderGeometry(4.2,4.2,2.6,24),iron);plate.rotation.z=Math.PI/2;plate.position.x=6.5;const plate2=plate.clone();plate2.position.x=-6.5;
   g.add(bar,plate,plate2);g.position.set(0,-3,0);arm.end.add(g);return g;});
  // Ejes del plano escapular: el brazo derecho (−x) sube por delante del plano frontal; el izquierdo, simétrico
  const sp=rad(SCAPULAR_PLANE),axisR=new T.Vector3(Math.sin(sp),0,Math.cos(sp)),axisL=new T.Vector3(-Math.sin(sp),0,Math.cos(sp));
  const groupPos=new T.Vector3();
  let lastId:ExercisePoseId|null=null;
  stageApi.loop(()=>{
   const {id,amount}=live.current,a=anglesAt(id,amount);
   if(id!==lastId){
    stageApi.lookFrom(...VIEWS[id]);lastId=id;
    const highlight=id==='press'?[...armR.meshes,...armL.meshes]:legR.meshes;
    for(const l of Object.values(L))for(const m of l.meshes)m.material=highlight.includes(m)?moving:restMat;
    bench.visible=id==='press';dumbbells.forEach(d=>d.visible=id==='press');
   }
   // Postura neutra
   root.rotation.set(0,0,0);root.position.set(0,0,0);
   for(const l of Object.values(L)){l.root.rotation.set(0,0,0);l.mid.rotation.set(0,0,0);l.end.rotation.set(0,0,0);}
   if(id==='squat'||id==='lunge'){
    const {s,t,tau}=flatLeg(a),anchor:[number,number]=id==='lunge'?LUNGE_FRONT_ANKLE:[SEG.ankleY,0];
    const [hy,hz]=hipFromAnkle(anchor,s,t);
    root.rotation.x=rad(tau);root.position.set(0,hy-SEG.hipY*Math.cos(rad(tau)),hz-SEG.hipY*Math.sin(rad(tau)));
    const legs=id==='squat'?[legR,legL]:[legR];
    for(const leg of legs){leg.root.rotation.x=rad(-t-tau);leg.mid.rotation.x=rad(s+t);leg.end.rotation.x=rad(-s);}
    if(id==='lunge'){
     const p=exercisePoses.lunge.rearKnee!,r=rearLeg([hy,hz],LUNGE_REAR_BALL,p.low+(p.high-p.low)*amount);
     legL.root.rotation.x=rad(r.thigh-tau);legL.mid.rotation.x=rad(r.shank-r.thigh);legL.end.rotation.x=rad(r.foot-r.shank);
    }
    for(const arm of [armR,armL])arm.root.rotation.x=rad(-a.shoulder);
   }else{
    // Press sentado: cadera y rodilla a 90°, pies planos; brazos en el plano escapular
    root.position.set(0,SEG.ankleY+SEG.shank-SEG.hipY,0);
    for(const leg of [legR,legL]){leg.root.rotation.x=-Math.PI/2;leg.mid.rotation.x=Math.PI/2;}
    armR.root.quaternion.setFromAxisAngle(axisR,rad(-a.shoulder));armL.root.quaternion.setFromAxisAngle(axisL,rad(a.shoulder));
    armR.mid.quaternion.setFromAxisAngle(axisR,rad(-a.elbow));armL.mid.quaternion.setFromAxisAngle(axisL,rad(a.elbow));
   }
   scene.updateMatrixWorld(true);
   // Etiquetas con los grados de cada articulación analizada (lado derecho)
   const values:Record<string,string>={hip:`${Math.round(a.hip)}° flexión`,knee:`${Math.round(a.knee)}° flexión`,ankle:`${Math.round(a.ankle)}° flexión dorsal`,
    shoulder:`${Math.round(a.shoulder)}° elevación`,elbow:`${Math.round(a.elbow)}° flexión`,scapula:'rotación superior'};
   const at:Record<string,T.Object3D>={hip:legR.root,knee:legR.mid,ankle:legR.end,shoulder:armR.root,elbow:armR.mid,scapula:armR.root};
   for(const [key,el] of Object.entries(tagRefs.current)){
    if(!el||!at[key])continue;at[key].getWorldPosition(groupPos);if(key==='scapula')groupPos.add(new T.Vector3(4,-6,-10));
    const p=toScreen(groupPos,cam,stage);el.textContent=`${NAMES[key]} · ${values[key]}`;
    // Escápula y hombro a la derecha (el hombro encima) para no tapar la mancuerna ni la etiqueta del codo
    const right=key==='scapula'||key==='shoulder',dx=right?12:-el.offsetWidth-12,dy=key==='shoulder'?-el.offsetHeight-8:0;
    el.style.transform=`translate(${Math.max(4,Math.min(stage.clientWidth-el.offsetWidth-4,p.x+dx))}px,${Math.max(4,p.y-el.offsetHeight/2+dy)}px)`;
    const active=key===live.current.jointId;el.classList.toggle('active',active);
    // En pantallas estrechas solo se rotula la articulación seleccionada en el panel
    el.style.visibility=stage.clientWidth<420&&!active?'hidden':'';
   }
  });
  return()=>stageApi.dispose();
 },[]);

 if(failed)return <p className="notice" role="alert">Este navegador no puede mostrar el maniquí 3D (WebGL desactivado).</p>;
 const pose=exercisePoses[id];
 return <figure className="mannequin exercise3d" role="img" aria-label={`Maniquí 3D: ${phaseLabel}. ${pose.note}`}>
  <div className="mannequin-stage" ref={stageRef}>
   {joints.map(key=><span key={key} ref={el=>{tagRefs.current[key]=el;}} className={`joint-tag ${key==='shoulder'&&id==='press'?'scapular':''}`} style={key==='scapula'||(key==='shoulder'&&id==='press')?undefined:{borderColor:SAGITTAL}}/>)}
  </div>
  <figcaption className="mannequin-legend"><span><i className="moving"/>{id==='press'?'Brazos que trabajan':'Pierna analizada'}</span><span><i style={{background:SAGITTAL}}/>Grados en el plano sagital</span>{id==='press'&&<span><i className="axis"/>Hombro: plano escapular</span>}<span>Arrastra para girar</span></figcaption>
 </figure>;
}
