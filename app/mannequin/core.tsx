'use client';
// El core en 3D como un cilindro sobre el tronco del maniquí: paredes (recto, oblicuos, transverso),
// techo (diafragma), base (suelo pélvico) y pared posterior. Esquema didáctico: no son inserciones reales.
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {COLOR,buildBody,createStage,toScreen} from './body';
import {coreLayers,coreStructures,type CoreLayer} from '../core-content';

export type CoreProps={layer:CoreLayer;selected:string;onSelect:(id:string)=>void;breath:number};

const Y0=95,Y1=133,MID=(Y0+Y1)/2,H=Y1-Y0,FLAT=.66; // zona del core y aplanado anteroposterior
type Fibre='vertical'|'rectus'|'down'|'up'|'horizontal'|'radial';

// Textura de músculo con fibras en la dirección indicada (las líneas se ven sobre el cilindro)
function fibreTexture(kind:Fibre,mirror=false){
 const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d')!;
 g.fillStyle='#b45a4c';g.fillRect(0,0,256,256);g.strokeStyle='rgba(255,236,224,.75)';g.lineWidth=5;
 const line=(x1:number,y1:number,x2:number,y2:number)=>{g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();};
 const s=mirror?-1:1;
 if(kind==='vertical'||kind==='rectus')for(let x=12;x<256;x+=26)line(x,0,x,256);
 if(kind==='rectus'){g.strokeStyle='rgba(250,240,225,.95)';g.lineWidth=9;for(const y of [60,120,180])line(0,y,256,y);}
 if(kind==='horizontal')for(let y=10;y<256;y+=24)line(0,y,256,y);
 if(kind==='down'||kind==='up'){const k=kind==='down'?1:-1;for(let i=-256;i<512;i+=28)line(i,0,i+s*k*200,256);}
 if(kind==='radial'){for(let a=0;a<Math.PI*2;a+=Math.PI/14)line(128,128,128+Math.cos(a)*128,128+Math.sin(a)*128);}
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;return tex;
}

export default function CoreMannequin({layer,selected,onSelect,breath}:CoreProps){
 const stageRef=useRef<HTMLDivElement>(null),tagRef=useRef<HTMLSpanElement>(null),leaderRef=useRef<SVGSVGElement>(null);
 const live=useRef({layer,selected,breath,onSelect});live.current={layer,selected,breath,onSelect};
 const [failed,setFailed]=useState(false);

 useEffect(()=>{
  const stage=stageRef.current;if(!stage)return;
  let stageApi:ReturnType<typeof createStage>;
  try{stageApi=createStage(stage,{minDistance:70,maxDistance:450});}catch{setFailed(true);return;}
  const {scene,cam}=stageApi;
  const {limbs,torso,pelvis}=buildBody(scene);
  // Tronco translúcido para ver el interior; brazos algo separados para dejar ver los flancos
  const glass=new T.MeshStandardMaterial({color:COLOR.body,transparent:true,opacity:.28,depthWrite:false,roughness:.8});
  torso.material=glass;pelvis.material=glass;
  limbs.shoulderR.root.rotation.z=-.35;limbs.shoulderL.root.rotation.z=.35;
  // Columna de referencia
  const spine=new T.Mesh(new T.CylinderGeometry(1.8,1.8,62,12),new T.MeshStandardMaterial({color:'#e8dcc0',roughness:.7}));spine.position.set(0,118,-6.2);scene.add(spine);
  for(let y=92;y<150;y+=5.2){const v=new T.Mesh(new T.CylinderGeometry(2.6,2.6,3.2,12),spine.material);v.position.set(0,y,-6.2);scene.add(v);}
  // Estructuras
  const parts:{id:string;mesh:T.Mesh;anchor:T.Vector3}[]=[];
  const mat=(kind:Fibre,mirror=false)=>new T.MeshStandardMaterial({map:fibreTexture(kind,mirror),side:T.DoubleSide,roughness:.75,transparent:true});
  const wall=(id:string,r:number,from:number,length:number,kind:Fibre,mirror=false,y0=Y0,h=H)=>{
   const m=new T.Mesh(new T.CylinderGeometry(r,r,h,40,1,true,from,length),mat(kind,mirror));
   m.scale.z=FLAT;m.position.y=y0+h/2;m.userData.id=id;scene.add(m);
   const a=from+length/2;parts.push({id,mesh:m,anchor:new T.Vector3(Math.sin(a)*r,y0+h*.55,Math.cos(a)*r*FLAT)});
  };
  // Pared anterior y lateral (ángulo 0 = delante; positivo hacia el lado izquierdo de la figura)
  wall('rectus',15.4,.03,.34,'rectus');wall('rectus',15.4,-.37,.34,'rectus');
  wall('external',15.4,.4,1.5,'down',true);wall('external',15.4,-1.9,1.5,'down');
  wall('internal',14.6,.4,1.6,'up',true);wall('internal',14.6,-2.0,1.6,'up');
  wall('transverse',13.8,.12,2.2,'horizontal');wall('transverse',13.8,-2.32,2.2,'horizontal');
  // Pared posterior
  wall('multifidus',15.6,Math.PI-.14,.1,'vertical',false,92,30);wall('multifidus',15.6,Math.PI+.04,.1,'vertical',false,92,30);
  wall('erectors',16.6,Math.PI-.42,.22,'vertical',false,95,52);wall('erectors',16.6,Math.PI+.2,.22,'vertical',false,95,52);
  wall('quadratus',14.8,Math.PI-.95,.36,'up',true,97,26);wall('quadratus',14.8,Math.PI+.59,.36,'up',false,97,26);
  // Techo y base
  const diaphragm=new T.Mesh(new T.SphereGeometry(13.5,40,16,0,Math.PI*2,0,Math.PI/2),mat('radial'));diaphragm.userData.id='diaphragm';scene.add(diaphragm);
  parts.push({id:'diaphragm',mesh:diaphragm,anchor:new T.Vector3()});
  const pelvic=new T.Mesh(new T.SphereGeometry(12,40,12,0,Math.PI*2,Math.PI/2,Math.PI/2),mat('radial'));pelvic.userData.id='pelvic';scene.add(pelvic);
  parts.push({id:'pelvic',mesh:pelvic,anchor:new T.Vector3()});

  // Seleccionar tocando el modelo
  const ray=new T.Raycaster(),ptr=new T.Vector2();let downAt:[number,number]|null=null;
  const el=stageApi.renderer.domElement;
  const onDown=(e:PointerEvent)=>{downAt=[e.clientX,e.clientY];};
  const onUp=(e:PointerEvent)=>{if(!downAt||Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1])>6)return;downAt=null;
   const r=el.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,cam);
   const hit=ray.intersectObjects(parts.filter(p=>p.mesh.visible).map(p=>p.mesh),false)[0];if(hit)live.current.onSelect(hit.object.userData.id);};
  el.addEventListener('pointerdown',onDown);el.addEventListener('pointerup',onUp);

  let lastLayer:CoreLayer|null=null;
  stageApi.loop(()=>{
   const {layer,selected,breath}=live.current,b=breath/100;
   if(layer!==lastLayer){
    stageApi.lookFrom(layer==='back'?[95,140,-140]:layer==='roof'?[-85,165,125]:[-90,135,140],[0,MID+2,0]);lastLayer=layer;
   }
   // Respiración: al inspirar el diafragma desciende y se aplana; el suelo pélvico acompaña el descenso
   diaphragm.position.set(0,Y1-4-6*b,0);diaphragm.scale.set(1,.62-.25*b,FLAT);
   pelvic.position.set(0,Y0+3-2*b,0);pelvic.scale.set(1,.42+.12*b,FLAT);
   parts.find(p=>p.id==='diaphragm')!.anchor.set(0,diaphragm.position.y+13.5*diaphragm.scale.y,0);
   parts.find(p=>p.id==='pelvic')!.anchor.set(0,pelvic.position.y-12*pelvic.scale.y,0);
   for(const p of parts){
    const info=coreStructures.find(s=>s.id===p.id)!,inLayer=info.layer===layer,isSel=p.id===selected;
    p.mesh.visible=inLayer;const m=p.mesh.material as T.MeshStandardMaterial;
    m.opacity=isSel?1:.4;m.color.set(isSel?'#ffffff':'#f3e6dc');m.emissive.set(isSel?'#5a1a10':'#000000');m.emissiveIntensity=isSel?.25:0;
   }
   // Etiqueta de la estructura seleccionada
   const tag=tagRef.current,sel=parts.filter(p=>p.id===selected&&p.mesh.visible);
   if(tag){if(!sel.length){tag.style.display='none';}else{
    const front=sel.map(p=>p.anchor).sort((a,b)=>b.distanceTo(cam.position)-a.distanceTo(cam.position)).at(-1)!;
    const s=toScreen(front,cam,stage);tag.style.display='';tag.textContent=coreStructures.find(x=>x.id===selected)!.name;
    const tw=tag.offsetWidth,th=tag.offsetHeight,left=12,top=Math.max(8,Math.min(stage.clientHeight-th-8,s.y-th/2));
    tag.style.transform=`translate(${left}px,${top}px)`;
    const line=leaderRef.current?.querySelector('line'),dot=leaderRef.current?.querySelector('circle');
    line?.setAttribute('x1',String(left+tw));line?.setAttribute('y1',String(top+th/2));line?.setAttribute('x2',String(s.x));line?.setAttribute('y2',String(s.y));
    dot?.setAttribute('cx',String(s.x));dot?.setAttribute('cy',String(s.y));}
    if(leaderRef.current)leaderRef.current.style.display=tag.style.display;}
  });
  return()=>{el.removeEventListener('pointerdown',onDown);el.removeEventListener('pointerup',onUp);stageApi.dispose();};
 },[]);

 if(failed)return <p className="notice" role="alert">Este navegador no puede mostrar el core en 3D (WebGL desactivado).</p>;
 const layerName=coreLayers.find(l=>l.id===layer)?.name;
 return <figure className="mannequin core3d" role="group" aria-label={`Core en 3D: capa ${layerName?.toLowerCase()}. Toca una estructura para leer su ficha; también puedes usar los botones.`}>
  <div className="mannequin-stage" ref={stageRef}><svg className="part-leader" ref={leaderRef} aria-hidden="true"><line/><circle r="4"/></svg><span className="part-label core-tag" ref={tagRef}/></div>
  <figcaption className="mannequin-legend"><span>Tronco y pelvis translúcidos · columna de referencia</span><span>Las líneas claras marcan la dirección de las fibras</span><span>Toca una estructura o arrastra para girar</span></figcaption>
 </figure>;
}
