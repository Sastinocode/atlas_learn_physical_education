// Piezas comunes del maniquí 3D: cuerpo articulado, suelo y escenario (luces, cámara, bucle).
// Ejes del mundo: +y arriba, +z anterior, la derecha de la figura está en -x (la vemos a nuestra izquierda de frente).
// Unidades aproximadas en centímetros (figura de unos 175 cm).
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

export const COLOR={paper:'#f8f3e9',body:'#e6dac2',moving:'#b9775a',joint:'#7a5a44',ink:'#3a2f25',ground:'#ece2cf',muscle:'#a8423a',load:'#6b5f50'};
export const HEAD_PIVOT_Y=157,SHOULDER_Y=143,HIP_Y=90,UPPER_ARM=31,FOREARM=28,THIGH=42,SHANK=40;

// Preferencia del sistema «reducir movimiento»: los maniquíes no se animan solos
export const reducedMotion=()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
export type Limb={root:T.Group;mid:T.Group;end:T.Group;meshes:T.Mesh[]};

export function buildBody(scene:T.Scene){
 const body=new T.MeshStandardMaterial({color:COLOR.body,roughness:.8,metalness:0});
 const jointMat=new T.MeshStandardMaterial({color:COLOR.joint,roughness:.6});
 const add=(parent:T.Object3D,mesh:T.Mesh,[x,y,z]:[number,number,number])=>{mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 const capsule=(r:number,len:number)=>new T.Mesh(new T.CapsuleGeometry(r,len,6,18),body);
 const root=new T.Group();scene.add(root);
 const pelvis=add(root,new T.Mesh(new T.SphereGeometry(1,24,16),body),[0,96,0]);pelvis.scale.set(14,9,9);
 const torso=add(root,capsule(13,26),[0,124,0]);torso.scale.set(1,1,.62);
 add(root,capsule(5,28),[0,SHOULDER_Y,0]).rotation.z=Math.PI/2;
 // Cabeza en su propio grupo para poder asentir sobre la articulación atlantooccipital
 add(root,new T.Mesh(new T.CylinderGeometry(4,4.5,9,16),body),[0,152,0]); // cuello
 const head=new T.Group();head.position.set(0,HEAD_PIVOT_Y,0);root.add(head);
 add(head,new T.Mesh(new T.SphereGeometry(10,28,20),body),[0,8,0]).scale.set(.85,1,.95);
 add(head,new T.Mesh(new T.ConeGeometry(1.6,4,12),body),[0,8,9.5]).rotation.x=Math.PI/2; // indica hacia dónde mira
 const limbs:Record<string,Limb>={};
 for(const side of [-1,1]){
  const tag=side<0?'R':'L';
  // Brazo
  const sh=new T.Group();sh.position.set(side*19,SHOULDER_Y,0);root.add(sh);
  add(sh,new T.Mesh(new T.SphereGeometry(5,16,12),jointMat),[0,0,0]);
  const upper=add(sh,capsule(4.2,23),[0,-15.5,0]);
  const el=new T.Group();el.position.set(0,-UPPER_ARM,0);sh.add(el);
  add(el,new T.Mesh(new T.SphereGeometry(3.8,14,10),jointMat),[0,0,0]);
  const fore=add(el,capsule(3.5,20),[0,-13.5,0]);
  const wrist=new T.Group();wrist.position.set(0,-FOREARM,0);el.add(wrist);
  const hand=add(wrist,capsule(2.6,6),[0,-2,0]);hand.scale.set(1,1,.6);
  limbs['shoulder'+tag]={root:sh,mid:el,end:wrist,meshes:[upper,fore,hand]};
  // Pierna
  const hip=new T.Group();hip.position.set(side*9,HIP_Y,0);root.add(hip);
  add(hip,new T.Mesh(new T.SphereGeometry(6,16,12),jointMat),[0,0,0]);
  const thigh=add(hip,capsule(6,30),[0,-21,0]);
  const knee=new T.Group();knee.position.set(0,-THIGH,0);hip.add(knee);
  add(knee,new T.Mesh(new T.SphereGeometry(5,14,10),jointMat),[0,0,0]);
  const shank=add(knee,capsule(4.6,31),[0,-20.5,0]);
  // Tobillo en su propio grupo para la flexión plantar (elevación de talones)
  const ankle=new T.Group();ankle.position.set(0,-SHANK,0);knee.add(ankle);
  const foot=add(ankle,new T.Mesh(new T.BoxGeometry(7,4,22),body),[0,-2,6]);
  limbs['hip'+tag]={root:hip,mid:knee,end:ankle,meshes:[thigh,shank,foot]};
 }
 return {limbs,body,root,head,torso,pelvis};
}

export function buildGround(scene:T.Scene){
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;
 const grad=g.createRadialGradient(64,64,4,64,64,64);grad.addColorStop(0,'rgba(80,60,40,.28)');grad.addColorStop(1,'rgba(80,60,40,0)');g.fillStyle=grad;g.fillRect(0,0,128,128);
 const shadow=new T.Mesh(new T.PlaneGeometry(70,70),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false}));
 shadow.rotation.x=-Math.PI/2;shadow.position.y=.6;scene.add(shadow);
 const ground=new T.Mesh(new T.CircleGeometry(95,64),new T.MeshStandardMaterial({color:COLOR.ground,roughness:1}));ground.rotation.x=-Math.PI/2;scene.add(ground);
 const ring=new T.Mesh(new T.RingGeometry(94,95.5,64),new T.MeshBasicMaterial({color:'#cdbd9f'}));ring.rotation.x=-Math.PI/2;ring.position.y=.3;scene.add(ring);
 // Flecha en el suelo: anterior
 const arrow=new T.Shape();arrow.moveTo(0,14);arrow.lineTo(-6,0);arrow.lineTo(-2,0);arrow.lineTo(-2,-8);arrow.lineTo(2,-8);arrow.lineTo(2,0);arrow.lineTo(6,0);arrow.closePath();
 const a=new T.Mesh(new T.ShapeGeometry(arrow),new T.MeshBasicMaterial({color:COLOR.ink,transparent:true,opacity:.55,side:T.DoubleSide}));a.rotation.x=Math.PI/2;a.position.set(0,.5,62);scene.add(a); // la punta mira hacia +z (anterior)
}

// Escenario completo: renderizador, luces, suelo, cámara orbital y bucle que se pausa fuera de pantalla.
// Lanza un error si el navegador no tiene WebGL (el componente lo captura y muestra un aviso).
export function createStage(stage:HTMLElement,{minDistance=140,maxDistance=600}:{minDistance?:number;maxDistance?:number}={}){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 stage.insertBefore(renderer.domElement,stage.firstChild);
 renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new T.Scene();scene.background=new T.Color(COLOR.paper);
 scene.add(new T.HemisphereLight('#fffaf0','#b8a88c',1.4));
 const sun=new T.DirectionalLight('#fff4e0',1.8);sun.position.set(-120,260,200);scene.add(sun);
 const back=new T.DirectionalLight('#e9e2ff',.5);back.position.set(150,120,-200);scene.add(back);
 buildGround(scene);
 const cam=new T.PerspectiveCamera(32,1,1,3000);
 const controls=new OrbitControls(cam,renderer.domElement);
 controls.enablePan=false;controls.enableDamping=true;controls.minDistance=minDistance;controls.maxDistance=maxDistance;controls.target.set(0,100,0);
 const resize=()=>{const w=stage.clientWidth,h=stage.clientHeight||w*.75;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();};
 const ro=new ResizeObserver(resize);ro.observe(stage);resize();
 let visible=true;const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;});io.observe(stage);
 const lookFrom=(position:[number,number,number],target:[number,number,number])=>{cam.position.set(...position);controls.target.set(...target);controls.update();};
 const loop=(frame:(now:number)=>void)=>renderer.setAnimationLoop(now=>{if(!visible||document.hidden)return;frame(now);controls.update();renderer.render(scene,cam);});
 const dispose=()=>{renderer.setAnimationLoop(null);ro.disconnect();io.disconnect();controls.dispose();
  scene.traverse(o=>{const mesh=o as T.Mesh;mesh.geometry?.dispose();const mat=mesh.material as T.Material|T.Material[]|undefined;(Array.isArray(mat)?mat:mat?[mat]:[]).forEach(x=>{(x as T.MeshBasicMaterial).map?.dispose();x.dispose();});});
  renderer.dispose();renderer.domElement.remove();};
 return {renderer,scene,cam,controls,lookFrom,loop,dispose};
}

// Proyecta un punto 3D a píxeles del escenario (para etiquetas HTML encima del lienzo)
export function toScreen(p:T.Vector3,cam:T.Camera,stage:HTMLElement){const v=p.clone().project(cam);return {x:(v.x+1)/2*stage.clientWidth,y:(1-v.y)/2*stage.clientHeight,behind:v.z>1};}

// Flecha de fuerza (cilindro + punta) con su base en `from`, apuntando en `dir`, siempre dibujada encima
export function forceArrow(color:string,length:number,radius=1.1){
 const g=new T.Group(),mat=new T.MeshBasicMaterial({color,depthTest:false,transparent:true});
 const shaft=new T.Mesh(new T.CylinderGeometry(radius,radius,length-6,12),mat);shaft.position.y=(length-6)/2;
 const tip=new T.Mesh(new T.ConeGeometry(radius*2.8,7,16),mat);tip.position.y=length-3.5;
 g.add(shaft,tip);g.renderOrder=20;g.traverse(o=>{o.renderOrder=20;});return g;
}
