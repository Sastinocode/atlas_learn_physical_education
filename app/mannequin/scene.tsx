'use client';
// Maniquí 3D articulado para enseñar planos, ejes y movimientos.
// Cuerpo simplificado por piezas (no es el modelo anatómico): sí se puede mover sin romperse.
// Ejes del mundo: +y arriba, +z anterior, la derecha de la figura está en -x (la vemos a nuestra izquierda de frente).
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {COLOR,UPPER_ARM,THIGH,buildBody,createStage} from './body';
import {planeDefinitions,planeMotions,jointNames,type JointId,type MotionId,type PlaneId} from '../planes-content';

export type MannequinCamera='oblique'|'front'|'side'|'top';
export type MannequinProps={
 joint:JointId;motion:MotionId;
 progress?:number;          // 0-100; se ignora si autoplay
 autoplay?:boolean;         // repite el gesto ida y vuelta
 camera?:MannequinCamera;
 showPlane?:boolean;showAxis?:boolean;
 compact?:boolean;          // sin leyenda, para tarjetas y correcciones
};

// Código de colores científico (igual que en globals.css)
const PLANE_COLOR:Record<PlaneId,string>={sagittal:'#2f5d8c',frontal:'#56732a',transverse:'#9a6212'};
const AXIS_WORLD:Record<PlaneId,T.Vector3>={sagittal:new T.Vector3(1,0,0),frontal:new T.Vector3(0,0,1),transverse:new T.Vector3(0,1,0)};
const CAMERAS:Record<MannequinCamera,[number,number,number]>={oblique:[-225,195,295],front:[0,115,370],side:[-370,115,0],top:[0,450,1]};

function angleAt(motion:MotionId,progress:number){const m=planeMotions.find(x=>x.id===motion)!;return m.from+(m.to-m.from)*progress/100;}
function rotationOf(motion:MotionId):'x'|'y'|'z'{const p=planeMotions.find(x=>x.id===motion)!.plane;return p==='sagittal'?'x':p==='frontal'?'z':'y';}

export default function Mannequin({joint,motion,progress=0,autoplay=false,camera='oblique',showPlane=true,showAxis=true,compact=false}:MannequinProps){
 const stageRef=useRef<HTMLDivElement>(null),labelRef=useRef<HTMLSpanElement>(null);
 const live=useRef({joint,motion,progress,autoplay,showPlane,showAxis});
 const api=useRef<{setCamera:(c:MannequinCamera)=>void;rebuild:()=>void}|null>(null);
 const [failed,setFailed]=useState(false);
 live.current={joint,motion,progress,autoplay,showPlane,showAxis};
 const m=planeMotions.find(x=>x.id===motion)!,plane=planeDefinitions[m.plane];

 useEffect(()=>{
  const stage=stageRef.current;if(!stage)return;
  let stageApi:ReturnType<typeof createStage>;
  try{stageApi=createStage(stage);}catch{setFailed(true);return;}
  const {scene,cam,controls}=stageApi;
  const {limbs}=buildBody(scene);
  const setCamera=(c:MannequinCamera)=>stageApi.lookFrom(CAMERAS[c],[0,c==='top'?90:100,0]);
  setCamera(camera);

  // Capas didácticas: plano, eje, arcos
  const overlay=new T.Group();scene.add(overlay);
  const movingMat=new T.MeshStandardMaterial({color:COLOR.moving,roughness:.7});
  const restMat=(limbs.shoulderR.meshes[0].material) as T.Material;
  let arcLine:T.Mesh|null=null,center=new T.Vector3(),rest=new T.Vector3(),axisK=new T.Vector3(),radius=22;
  const rebuild=()=>{
   const {joint,motion,showPlane,showAxis}=live.current;
   overlay.clear();
   const p=planeMotions.find(x=>x.id===motion)!.plane,color=PLANE_COLOR[p];
   for(const k of ['shoulderR','hipR'])for(const mesh of limbs[k].meshes)mesh.material=restMat;
   for(const mesh of limbs[joint+'R'].meshes)mesh.material=movingMat;
   for(const l of Object.values(limbs)){l.root.rotation.set(0,0,0);l.mid.rotation.set(0,0,0);}
   const rotationMove=motion==='ir'||motion==='er',limb=limbs[joint+'R'];
   // En las rotaciones el codo o la rodilla se flexionan 90° para que se vea el giro
   if(rotationMove)limb.mid.rotation.x=joint==='shoulder'?-Math.PI/2:Math.PI/2;
   scene.updateMatrixWorld(true);
   (rotationMove?limb.mid:limb.root).getWorldPosition(center);
   axisK=AXIS_WORLD[p].clone();
   rest=rotationMove?new T.Vector3(0,0,joint==='shoulder'?1:-1):new T.Vector3(0,-1,0);
   radius=rotationMove?30:joint==='shoulder'?40:52;
   // Las anotaciones (eje y arco) se dibujan siempre encima del cuerpo, como en una lámina
   const onTop=(o:T.Object3D,order:number)=>{o.renderOrder=order;o.traverse(x=>{const mat=(x as T.Mesh).material as T.Material|undefined;if(mat){mat.depthTest=false;mat.transparent=true;}});return o;};
   if(showPlane){
    const size=rotationMove?70:joint==='shoulder'?95:110;
    const q=new T.Mesh(new T.PlaneGeometry(size,size),new T.MeshBasicMaterial({color,transparent:true,opacity:p==='transverse'?.26:.16,side:T.DoubleSide,depthWrite:false}));
    const edge=new T.LineSegments(new T.EdgesGeometry(new T.PlaneGeometry(size,size)),new T.LineBasicMaterial({color,transparent:true,opacity:.85}));
    for(const o of [q,edge]){o.position.copy(center);if(p==='sagittal')o.rotation.y=Math.PI/2;if(p==='transverse')o.rotation.x=-Math.PI/2;overlay.add(o);}
   }
   if(showAxis){
    const len=rotationMove?120:90;
    const rod=new T.Mesh(new T.CylinderGeometry(.9,.9,len,12),new T.MeshBasicMaterial({color:COLOR.ink}));
    const tipA=new T.Mesh(new T.ConeGeometry(2.6,7,14),new T.MeshBasicMaterial({color:COLOR.ink})),tipB=tipA.clone();
    const holder=new T.Group();holder.add(rod);tipA.position.y=len/2;tipB.position.y=-len/2;tipB.rotation.z=Math.PI;holder.add(tipA,tipB);
    holder.position.copy(center);holder.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),axisK);
    if(rotationMove)holder.position.y=center.y+(joint==='shoulder'?UPPER_ARM:THIGH)/2; // eje longitudinal del húmero/fémur
    overlay.add(onTop(holder,10));
   }
   // Recorrido completo (discontinuo) y arco del ángulo actual
   const mm=planeMotions.find(x=>x.id===motion)!,maxA=Math.abs(mm.from)>Math.abs(mm.to)?mm.from:mm.to;
   const pts=Array.from({length:33},(_,i)=>center.clone().add(rest.clone().applyAxisAngle(axisK,-T.MathUtils.degToRad(maxA*i/32)).multiplyScalar(radius)));
   const dashed=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineDashedMaterial({color,dashSize:2.4,gapSize:1.8,transparent:true,opacity:.7}));dashed.computeLineDistances();overlay.add(onTop(dashed,11));
   // Abanico relleno (el ángulo) y borde grueso: las líneas WebGL siempre miden 1 px, por eso se usa un tubo
   arcLine=new T.Mesh(new T.BufferGeometry(),new T.MeshBasicMaterial({color,transparent:true,opacity:.32,side:T.DoubleSide,depthWrite:false}));overlay.add(onTop(arcLine,12));
   const rim=new T.Mesh(new T.BufferGeometry(),new T.MeshBasicMaterial({color}));rim.name='arc-rim';overlay.add(onTop(rim,13));
   const dot=new T.Mesh(new T.SphereGeometry(2,12,8),new T.MeshBasicMaterial({color}));dot.name='arc-dot';overlay.add(onTop(dot,14));
  };
  rebuild();

  const start=performance.now(),tmp=new T.Vector3();
  stageApi.loop(now=>{
   const {joint,motion,autoplay}=live.current;
   const prog=autoplay?(1-Math.cos(((now-start)/1700)*Math.PI))/2*100:live.current.progress;
   const a=angleAt(motion,prog),rad=T.MathUtils.degToRad(a),limb=limbs[joint+'R'],ax=rotationOf(motion);
   limb.root.rotation.set(0,0,0);limb.root.rotation[ax]=-rad;
   if(arcLine){
    const n=Math.max(2,Math.round(Math.abs(a)/2)+2);
    const pts=Array.from({length:n},(_,i)=>center.clone().add(rest.clone().applyAxisAngle(axisK,-rad*i/(n-1)).multiplyScalar(radius)));
    const fan:T.Vector3[]=[];for(let i=0;i<pts.length-1;i++)fan.push(center,pts[i],pts[i+1]);
    arcLine.geometry.dispose();arcLine.geometry=new T.BufferGeometry().setFromPoints(fan);
    const rim=overlay.getObjectByName('arc-rim') as T.Mesh|undefined;
    if(rim){rim.geometry.dispose();rim.geometry=Math.abs(a)<.5?new T.BufferGeometry():new T.TubeGeometry(new T.CatmullRomCurve3(pts),Math.max(2,pts.length*2),.7,6,false);}
    const end=pts[pts.length-1],dot=overlay.getObjectByName('arc-dot');dot?.position.copy(end);
    if(labelRef.current){
     // La etiqueta va por fuera del arco, en la bisectriz del ángulo, para no tapar nada
     tmp.copy(rest).applyAxisAngle(axisK,-rad/2).multiplyScalar(radius+14).add(center).project(cam);
     const w=stage.clientWidth,h=stage.clientHeight,el=labelRef.current;
     el.style.transform=`translate(${(tmp.x+1)/2*w-el.offsetWidth/2}px,${(1-tmp.y)/2*h-el.offsetHeight/2}px)`;labelRef.current.textContent=`${Math.round(Math.abs(a))}°`;}
   }
  });
  api.current={setCamera,rebuild};
  return()=>{stageApi.dispose();api.current=null;};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(()=>{api.current?.rebuild();},[joint,motion,showPlane,showAxis]);
 useEffect(()=>{api.current?.setCamera(camera);},[camera]);

 if(failed)return <p className="notice" role="alert">Este navegador no puede mostrar el maniquí 3D (WebGL desactivado).</p>;
 const label=`Maniquí 3D: ${m.name.toLowerCase()} de ${jointNames[joint].toLowerCase()} derecha. Plano ${plane.name.toLowerCase()} y eje ${plane.axis.toLowerCase()}, perpendicular al plano.`;
 return <figure className={compact?'mannequin compact':'mannequin'} role="img" aria-label={label}>
  <div className="mannequin-stage" ref={stageRef}><span className="mannequin-angle" ref={labelRef} style={{color:PLANE_COLOR[m.plane]}}>0°</span></div>
  {!compact&&<figcaption className="mannequin-legend">
   {showPlane&&<span><i style={{background:PLANE_COLOR[m.plane]}}/>Plano {plane.name.toLowerCase()}</span>}
   {showAxis&&<span><i className="axis"/>Eje {plane.axis.toLowerCase()}</span>}
   <span><i className="moving"/>Segmento que se mueve</span>
   <span>▲ Flecha del suelo = anterior · arrastra para girar</span>
  </figcaption>}
 </figure>;
}
