import {useEffect,useRef} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createExplosionLayout} from './explosion-layout';
import {decodeModelResponse} from './model-download';
import {PointerTap} from './pointer-tap';
import {opacityFor,renderRatio,createDemandLoop} from './display-options';
import {SYSTEMS,type Atlas,type SceneState} from './anatomy';
export type NameTag={id:string;name:string;elements:string[]};
interface Props {atlas:Atlas;state:SceneState;onSelect:(id:string)=>void;onProgress:(n:number)=>void;onError:(s:string)=>void;label?:string;labels?:NameTag[]|null}
export default function AnatomyScene({atlas,state,onSelect,onProgress,onError,label,labels}:Props){
 const invalidateRef=useRef<()=>void>(()=>{});
 useEffect(()=>invalidateRef.current(),[state]);
 const names=useRef({label,labels});names.current={label,labels};
 useEffect(()=>invalidateRef.current(),[label,labels]);
 const host=useRef<HTMLDivElement>(null),latest=useRef(state),select=useRef(onSelect);
 latest.current=state;select.current=onSelect;
 useEffect(()=>{
  const el=host.current!;let disposed=false,dirty=true,ready=false,lastView='',lastReset=-1,lastIsolate='',layoutKey='',amount=0;
  let lastState:SceneState|null=null;
  const abort=new AbortController();
  let draw:()=>boolean=()=>false;
  const loop=createDemandLoop(()=>draw(),requestAnimationFrame,cancelAnimationFrame,()=>document.hidden);
  const invalidate=()=>{dirty=true;loop.invalidate();};invalidateRef.current=invalidate;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  document.addEventListener('visibilitychange',invalidate);
  let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch{onError('No se pudo iniciar WebGL. Puedes seguir utilizando el atlas 2D y el taller.');loop.dispose();document.removeEventListener('visibilitychange',invalidate);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.5:2));renderer.setClearColor('#f6f0e4');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Anatomía 3D. Arrastra para girar, usa la rueda para acercar o selecciona una estructura desde la lista.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.005,100),controls=new OrbitControls(camera,renderer.domElement);
  camera.position.set(1.4,1.05,3.6);controls.target.set(0,.85,0);controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=.07;controls.maxDistance=40;controls.maxPolarAngle=Math.PI*.96;controls.addEventListener('change',invalidate);
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xfffaf0,0xb3a58c,1.05));
  const key=new T.DirectionalLight(0xfffaf4,2.3);key.position.set(-2,4,3);scene.add(key);
  const rim=new T.DirectionalLight(0xfff0dc,1.4);rim.position.set(2,2,-3);scene.add(rim);
  const ground=new T.Mesh(new T.CircleGeometry(30,96),new T.MeshStandardMaterial({color:0xd8c9ac,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.019;scene.add(ground);
  const platform=new T.Mesh(new T.CylinderGeometry(.68,.7,.028,100),new T.MeshStandardMaterial({color:0xefe6d4,metalness:0,roughness:.8}));platform.position.y=-.016;scene.add(platform);
  const ring=new T.Mesh(new T.RingGeometry(.63,.632,128),new T.MeshBasicMaterial({color:0x8a7558,transparent:true,opacity:.45,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.001;scene.add(ring);
  const innerRing=new T.Mesh(new T.RingGeometry(.55,.551,128),new T.MeshBasicMaterial({color:0x8a7558,transparent:true,opacity:.18,side:T.DoubleSide}));innerRing.rotation.x=-Math.PI/2;innerRing.position.y=.001;scene.add(innerRing);
  const width=T.MathUtils.ceilPowerOfTwo(atlas.parts.length),data=new Float32Array(width*4),partTexture=new T.DataTexture(data,width,1,T.RGBAFormat,T.FloatType);partTexture.needsUpdate=true;
  const selectedData=new Uint8Array(width*4),selectionTexture=new T.DataTexture(selectedData,width,1);selectionTexture.needsUpdate=true;
  const materials:T.Material[]=[],geometries:T.BufferGeometry[]=[],pickers:(T.Mesh|undefined)[]=[],centers=atlas.parts.map(p=>new T.Vector3().fromArray(p.bounds[0]).add(new T.Vector3().fromArray(p.bounds[1])).multiplyScalar(.5));
  const offsets:T.Vector3[]=[],bounds=atlas.parts.map(p=>new T.Box3(new T.Vector3().fromArray(p.bounds[0]),new T.Vector3().fromArray(p.bounds[1])));
  let packingWidth=1,packingHeight=1;
  const markerPositions=new Float32Array(atlas.parts.length*3),markerGeometry=new T.BufferGeometry();markerGeometry.setAttribute('position',new T.BufferAttribute(markerPositions,3));
  const markerMaterial=new T.PointsMaterial({color:0x7a5a44,size:5,sizeAttenuation:false,transparent:true,opacity:.72,depthTest:false});
  markerMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;');};
  const markers=new T.Points(markerGeometry,markerMaterial);markers.frustumCulled=false;markers.renderOrder=10;markers.visible=false;scene.add(markers);
  const hover=document.createElement('div');hover.className='part-hover';hover.setAttribute('role','tooltip');hover.hidden=true;el.appendChild(hover);
  // Nombres sobre el modelo: etiqueta con línea guía para la selección y, opcionalmente, nombres de todas las fichas
  const svgNS='http://www.w3.org/2000/svg',leader=document.createElementNS(svgNS,'svg');leader.setAttribute('class','part-leader');leader.setAttribute('aria-hidden','true');
  const leaderLine=document.createElementNS(svgNS,'line'),leaderDot=document.createElementNS(svgNS,'circle');leaderDot.setAttribute('r','4');leader.appendChild(leaderLine);leader.appendChild(leaderDot);
  const tag=document.createElement('div');tag.className='part-label';tag.setAttribute('aria-hidden','true');
  const nameLayer=document.createElement('div');nameLayer.className='part-names';nameLayer.setAttribute('aria-hidden','true');
  el.appendChild(nameLayer);el.appendChild(leader);el.appendChild(tag);
  const indexById=new Map(atlas.parts.map((p,i)=>[p.id,i]));
  const anchorPoint=new T.Vector3(),partOffset=new T.Vector3(),occRay=new T.Raycaster(),occBox=new T.Box3(),occHit=new T.Vector3(),occDir=new T.Vector3();
  const usable=(i:number,s:SceneState)=>data[i*4+3]>.5&&opacityFor(s.opacity,atlas.parts[i].system)>=.15;
  const anchor=(ids:string[],s:SceneState)=>{
   const visibleIdx=ids.map(id=>indexById.get(id)).filter((i):i is number=>i!==undefined&&usable(i,s));
   if(!visibleIdx.length)return null;
   // En grupos de ambos lados se nombra el lado que mira a la cámara
   const side=Math.sign(camera.position.x-controls.target.x)||1,near=visibleIdx.filter(i=>Math.sign(centers[i].x)===side);
   const use=near.length?near:visibleIdx;anchorPoint.set(0,0,0);
   for(const i of use)anchorPoint.add(centers[i]).add(partOffset.set(data[i*4],data[i*4+1],data[i*4+2]));
   anchorPoint.divideScalar(use.length);const world=anchorPoint.clone();
   anchorPoint.project(camera);if(anchorPoint.z<-1||anchorPoint.z>1)return null;
   return {x:(anchorPoint.x+1)*el.clientWidth/2,y:(1-anchorPoint.y)*el.clientHeight/2,world};
  };
  // ¿Se ve desde la cámara? Rayo hasta el punto: lo primero que toca debe ser la propia estructura
  const seen=(ids:string[],world:T.Vector3,s:SceneState)=>{
   occDir.copy(world).sub(camera.position).normalize();occRay.set(camera.position,occDir);
   let nearest=Infinity,found=-1;
   pickers.forEach((mesh,i)=>{if(!mesh||!usable(i,s))return;occBox.copy(bounds[i]).translate(mesh.position);if(!occRay.ray.intersectBox(occBox,occHit)||occHit.distanceTo(camera.position)>nearest)return;const hits=occRay.intersectObject(mesh,false);if(hits[0]&&hits[0].distance<nearest){nearest=hits[0].distance;found=i;}});
   return found>=0&&ids.includes(atlas.parts[found].id);
  };
  let seenKey='',wasSettled=false;const seenCache=new Map<string,boolean>();
  const updateNames=(s:SceneState,settled:boolean)=>{
   const w=el.clientWidth,h=el.clientHeight,show=ready&&amount<.45,{label,labels}=names.current;
   // La comprobación de visibilidad se repite solo cuando la cámara y el modelo se quedan quietos
   const key=camera.position.toArray().map(n=>n.toFixed(3)).join()+s.selected.join()+s.visible.join()+JSON.stringify(s.opacity)+String(s.offset)+s.isolate+amount.toFixed(3);
   if(settled&&key!==seenKey){seenCache.clear();seenKey=key;}
   const isSeen=(id:string,ids:string[],world:T.Vector3)=>{if(!seenCache.has(id)){if(!settled)return null;seenCache.set(id,seen(ids,world,s));}return seenCache.get(id)!;};
   const taken:{l:number;r:number;t:number;b:number}[]=[];
   const point=show&&label&&s.selected.length?anchor(s.selected,s):null;
   leader.style.display=tag.style.display=point?'':'none';
   if(point){
    const visibleNow=isSeen('__selected',s.selected,point.world);
    tag.classList.toggle('behind',visibleNow===false);leader.classList.toggle('behind',visibleNow===false);
    tag.textContent=visibleNow===false?`${label} · detrás, gira el modelo`:label!;
    const tw=tag.offsetWidth,th=tag.offsetHeight,dir=point.x<w/2?-1:1;
    const left=Math.max(8,Math.min(w-tw-8,point.x+dir*(w<600?70:120)-tw/2)),top=Math.max(8,Math.min(h-th-8,point.y-th/2-24));
    tag.style.transform=`translate(${left}px,${top}px)`;
    const ex=dir<0?left+tw:left,ey=top+th/2;
    leaderLine.setAttribute('x1',String(point.x));leaderLine.setAttribute('y1',String(point.y));leaderLine.setAttribute('x2',String(ex));leaderLine.setAttribute('y2',String(ey));
    leaderDot.setAttribute('cx',String(point.x));leaderDot.setAttribute('cy',String(point.y));
    taken.push({l:left,r:left+tw,t:top,b:top+th});
   }
   const list=show&&labels?labels.filter(g=>!g.elements.some(id=>s.selected.includes(id))):[];
   while(nameLayer.children.length<list.length)nameLayer.appendChild(document.createElement('span'));
   [...nameLayer.children].forEach((node,k)=>{
    const span=node as HTMLSpanElement,g=list[k],p=g?anchor(g.elements,s):null;
    if(!g||!p||isSeen(g.id,g.elements,p.world)!==true){span.style.display='none';return;}
    span.style.display='';span.textContent=g.name;const sw=span.offsetWidth,sh=span.offsetHeight,l=p.x-sw/2,t=p.y-sh/2;
    if(taken.some(r=>l<r.r+4&&l+sw>r.l-4&&t<r.b+2&&t+sh>r.t-2)||l<4||t<4||l+sw>w-4||t+sh>h-4){span.style.display='none';return;}
    taken.push({l,r:l+sw,t,b:t+sh});span.style.transform=`translate(${l}px,${t}px)`;
   });
  };
  type Target={index:number;x:number;y:number;left:number;right:number;top:number;bottom:number};let targets:Target[]=[];
  const projected=new T.Vector3();
  const findTarget=(x:number,y:number,radius:number)=>{
   let best=-1,score=Infinity;
   for(const t of targets){const dx=Math.max(t.left-x,0,x-t.right),dy=Math.max(t.top-y,0,y-t.bottom),distance=Math.hypot(dx,dy);if(distance>radius)continue;const candidate=distance+Math.hypot(t.x-x,t.y-y)*.025;if(candidate<score){score=candidate;best=t.index;}}
   return best;
  };
  const materialFor=(system:string)=>{
   const m=new T.MeshStandardMaterial({color:SYSTEMS.find(s=>s.id===system)?.color??'#aebbb8',metalness:.08,roughness:.53,side:T.DoubleSide,transparent:system==='integumentary',opacity:system==='integumentary'?.1:1,depthWrite:system!=='integumentary'});
   m.onBeforeCompile=shader=>{
    shader.uniforms.partState={value:partTexture};shader.uniforms.selectionState={value:selectionTexture};shader.uniforms.stateWidth={value:width};
    shader.vertexShader='attribute float partIndex; uniform sampler2D partState; uniform sampler2D selectionState; uniform float stateWidth; varying float partVisible; varying float partSelected;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 state = texture2D(partState, stateUv); transformed += state.xyz; partVisible = state.w; partSelected = texture2D(selectionState, stateUv).r;');
    shader.fragmentShader='varying float partVisible; varying float partSelected;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (partVisible < 0.5) discard;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.60, 0.12), partSelected * 0.8);');
   };materials.push(m);return m;
  };
  const mats=new Map(SYSTEMS.map(s=>[s.id,materialFor(s.id)]));
  let loaded=0;
  const loadChunk=async(ci:number)=>{
   const chunk=atlas.chunks[ci],compressed=!!chunk.gzip&&typeof DecompressionStream!=='undefined';const response=await fetch(compressed?chunk.gzip!:chunk.url,{signal:abort.signal});const buffer=await decodeModelResponse(response,chunk.bytes,compressed);if(disposed)return;
   const groups=new Map<string,T.BufferGeometry[]>();
   atlas.parts.forEach((p,i)=>{
    if(p.chunk!==ci)return;
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,p.positions,p.vertexCount*3),3));
    // GPU normalized signed-short normals keep the complete atlas compact in memory.
    g.setAttribute('normal',new T.BufferAttribute(new Int16Array(buffer,p.normals,p.vertexCount*3),3,true));g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,p.indices,p.indexCount),1));
    g.boundingBox=bounds[i].clone();g.computeBoundingSphere();const pick=new T.Mesh(g);pick.matrixAutoUpdate=false;pickers[i]=pick;geometries.push(g);
    g.setAttribute('partIndex',new T.BufferAttribute(new Float32Array(p.vertexCount).fill(i),1));
    const list=groups.get(p.system)??[];list.push(g);groups.set(p.system,list);
   });
   groups.forEach((gs,system)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('No se pudo ensamblar la geometría.');geometries.push(geometry);const mesh=new T.Mesh(geometry,mats.get(system as never));mesh.frustumCulled=false;scene.add(mesh);});
   lastState=null;loaded++;onProgress(Math.round(loaded/atlas.chunks.length*100));invalidate();
  };
  (async()=>{try{let cursor=0;await Promise.all(Array.from({length:3},async()=>{while(cursor<atlas.chunks.length){const i=cursor++;await loadChunk(i);}}));if(!disposed){ready=true;invalidate();}}catch(e){if(!disposed)onError(e instanceof Error?e.message:'No se pudo cargar la anatomía.');}})();
  const fit=(view:string,extent=0)=>{
   const aspect=camera.aspect,mobile=el.clientWidth<768,normalDistance=mobile?Math.max(3.4,1.8*el.clientHeight/Math.max(160,el.clientHeight-40)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))):4;
   const reservedHeight=40;const availableAspect=Math.max(.35,(el.clientWidth-40)/Math.max(160,el.clientHeight-reservedHeight));const atlasDistance=Math.max(packingHeight,packingWidth/availableAspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*(el.clientHeight/Math.max(160,el.clientHeight-reservedHeight))*1.08;
   const distance=T.MathUtils.lerp(normalDistance,Math.max(.2,atlasDistance),extent);if(extent>.8)view='front';
   const direction=view==='front'?new T.Vector3(0,.02,1):view==='back'?new T.Vector3(0,.02,-1):view==='side'?new T.Vector3(1,.02,0):new T.Vector3(.35,.06,1).normalize();
   controls.target.set(extent>.1&&el.clientWidth>767?-packingWidth*.12:0,extent>.1||mobile?.85:.68,0);camera.position.copy(controls.target).addScaledVector(direction,distance);controls.update();dirty=true;
  };
  const resize=()=>{layoutKey='';lastState=null;renderer.setPixelRatio(renderRatio(!!latest.current.lightweight,devicePixelRatio,el.clientWidth<768||el.clientHeight<600));camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);fit(latest.current.view,amount);invalidate();};const observer=new ResizeObserver(resize);observer.observe(el);
  const raycaster=new T.Raycaster(),pointer=new T.Vector2(),tap=new PointerTap(),worldBox=new T.Box3(),hitPoint=new T.Vector3();
  const down=(e:PointerEvent)=>{hover.hidden=true;tap.down(e.pointerId,e.clientX,e.clientY,e.pointerType==='touch'?12:5);};
  const move=(e:PointerEvent)=>{tap.move(e.pointerId,e.clientX,e.clientY);if(e.buttons||amount<.5||e.pointerType==='touch'){hover.hidden=true;return;}const rect=el.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,index=findTarget(x,y,12);hover.hidden=index<0;renderer.domElement.style.cursor=index<0?'grab':'pointer';if(index>=0){hover.textContent=atlas.parts[index].name;hover.style.left=`${Math.max(8,Math.min(x+14,el.clientWidth-260))}px`;hover.style.top=`${Math.max(8,Math.min(y+18,el.clientHeight-55))}px`;}};
  const cancel=(e:PointerEvent)=>tap.cancel(e.pointerId);
  const up=(e:PointerEvent)=>{
   const validTap=tap.up(e.pointerId,e.clientX,e.clientY);if(!validTap||!ready)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
   let nearest=Infinity,found=-1;const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);
   pickers.forEach((mesh,i)=>{if(!mesh||opacityFor(latest.current.opacity,atlas.parts[i].system)<.15||data[i*4+3]<.5||(hasSolid&&atlas.parts[i].system==='integumentary'))return;worldBox.copy(bounds[i]).translate(mesh.position);if(!raycaster.ray.intersectBox(worldBox,hitPoint))return;const hits=raycaster.intersectObject(mesh,false);if(hits[0]&&hits[0].distance<nearest){nearest=hits[0].distance;found=i;}});
   if(found<0&&amount>.45)found=findTarget(e.clientX-rect.left,e.clientY-rect.top,e.pointerType==='touch'?24:16);if(found>=0){hover.hidden=true;select.current(atlas.parts[found].id);}
  };
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',cancel);
  const clock=new T.Clock();let lastExtent=-1;
  const animate=()=>{
   if(disposed)return false;const dt=Math.min(clock.getDelta(),.05),s=latest.current;
   const changed=lastState?.offset!==s.offset||lastState?.visible!==s.visible||lastState?.selected!==s.selected||lastState?.isolate!==s.isolate;
   if(lastState?.opacity!==s.opacity){mats.forEach((mat,id)=>{const alpha=opacityFor(s.opacity,id);mat.opacity=alpha;const translucent=alpha<1;if(mat.transparent!==translucent){mat.transparent=translucent;mat.depthWrite=!translucent;mat.needsUpdate=true;}});dirty=true;}
   if(lastState?.lightweight!==s.lightweight){renderer.setPixelRatio(renderRatio(!!s.lightweight,devicePixelRatio,el.clientWidth<768||el.clientHeight<600));dirty=true;}
   const moving=Math.abs(amount-s.explode)>.0001;
   if(moving){amount=motion.matches?s.explode:T.MathUtils.damp(amount,s.explode,8,dt);dirty=true;}
   if(changed||moving||lastExtent<0){
    const visible=new Set(s.visible),selection=new Set(s.selected);
    const visibleParts=atlas.parts.filter(p=>s.isolate?selection.has(p.id):visible.has(p.system)||selection.has(p.id));
    const nextLayoutKey=visibleParts.map(p=>p.id).join(',')+':'+camera.aspect.toFixed(3);
    if(nextLayoutKey!==layoutKey){const layout=createExplosionLayout(visibleParts,camera.aspect);packingWidth=layout.width;packingHeight=layout.height;atlas.parts.forEach((p,i)=>{const cell=layout.cells.get(p.id);offsets[i]=cell?new T.Vector3(cell.x,cell.y+.85,0):centers[i].clone();});layoutKey=nextLayoutKey;if(amount>.05&&!s.isolate)fit(s.view,Math.max(0,(amount-.3)/.7));}

    atlas.parts.forEach((p,i)=>{
     const c=centers[i],destination=offsets[i];let dx=0,dy=0,dz=0;
     if(amount<=.45){const t=amount/.45;const group=SYSTEMS.findIndex(sys=>sys.id===p.system);const angle=group/SYSTEMS.length*Math.PI*2;dx=Math.sin(angle)*t*.48;dy=(c.y-.85)*t*.28;dz=Math.cos(angle)*t*.48;}
     else {const t=(amount-.45)/.55,group=SYSTEMS.findIndex(sys=>sys.id===p.system),angle=group/SYSTEMS.length*Math.PI*2;dx=T.MathUtils.lerp(Math.sin(angle)*.48,destination.x-c.x,t);dy=T.MathUtils.lerp((c.y-.85)*.28,destination.y-c.y,t);dz=T.MathUtils.lerp(Math.cos(angle)*.48,-c.z,t);}
     const selected=selection.has(p.id);if(selected&&s.offset){dx+=s.offset[0];dy+=s.offset[1];dz+=s.offset[2];}data.set([dx,dy,dz,(s.isolate?selected:visible.has(p.system)||selected)?1:0],i*4);selectedData[i*4]=selected?255:0;
     markerPositions.set(data[i*4+3]>.5?[c.x+dx,c.y+dy,c.z+dz]:[10000,10000,10000],i*3);const mesh=pickers[i];if(mesh){mesh.position.set(dx,dy,dz);mesh.updateMatrix();mesh.updateMatrixWorld(true);}
    });partTexture.needsUpdate=true;selectionTexture.needsUpdate=true;markerGeometry.attributes.position.needsUpdate=true;lastState=s;lastExtent=amount;dirty=true;
   }
   if(s.view!==lastView||s.reset!==lastReset){fit(s.view,amount);lastView=s.view;lastReset=s.reset;}
   if(moving&&!s.isolate)fit(amount>.5?'front':s.view,Math.max(0,(amount-.3)/.7));
   const isolateKey=s.isolate?s.selected.join(',')+':'+s.reset+':'+s.inspectorOpen+':'+camera.aspect:'';
   if(isolateKey!==lastIsolate||(s.isolate&&moving)){
    if(s.isolate){const box=new T.Box3();atlas.parts.forEach((p,i)=>{if(s.selected.includes(p.id))box.union(bounds[i].clone().translate(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])));});
     if(!box.isEmpty()){const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());const w=el.clientWidth,h=el.clientHeight,mobile=w<768,landscape=w>h&&h<=600;let left=20,right=w-20,top=mobile?175:110,bottom=h-170;if(s.inspectorOpen){if(landscape){right=w-335;top=100;bottom=h-125;}else if(mobile){const sheet=document.querySelector('.detail-sheet')?.getBoundingClientRect(),header=document.querySelector('.identity')?.getBoundingClientRect();top=(header?.bottom??94)+16;bottom=(sheet?.top??h*.58-139)-16;}else{right=w-370;left=w>1100?285:25;}}left=20;right=w-20;top=20;bottom=h-20;const availableWidth=Math.max(150,right-left),availableHeight=Math.max(40,bottom-top);camera.setViewOffset(w,h,w/2-(left+right)/2,h/2-(top+bottom)/2,w,h);const distance=Math.max(.07,Math.max(size.y*h/availableHeight,size.x*w/availableWidth/camera.aspect,size.z)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.35);controls.maxDistance=Math.max(40,distance*2);controls.target.copy(center);camera.position.copy(center).add(new T.Vector3(.2,.1,1).normalize().multiplyScalar(distance));controls.update();dirty=true;}
    }else if(lastIsolate){camera.clearViewOffset();fit(s.view,amount);}
    lastIsolate=isolateKey;
   }
   controls.enableRotate=amount<.8;controls.mouseButtons.LEFT=amount<.8?T.MOUSE.ROTATE:T.MOUSE.PAN;controls.touches.ONE=amount<.8?T.TOUCH.ROTATE:T.TOUCH.PAN;ground.visible=platform.visible=ring.visible=innerRing.visible=amount<.5&&!s.isolate;markers.visible=amount>.75;controls.autoRotate=s.rotate&&!motion.matches&&!s.isolate&&amount<.4;controls.autoRotateSpeed=.65;const controlsMoving=controls.update();if(controls.autoRotate)dirty=true;
   if(dirty){renderer.render(scene,camera);targets=[];if(amount>.45){const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);atlas.parts.forEach((p,i)=>{if(opacityFor(s.opacity,p.system)<.15||data[i*4+3]<.5||(hasSolid&&p.system==='integumentary'))return;let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(let corner=0;corner<8;corner++){projected.set(p.bounds[(corner&1)?1:0][0]+data[i*4],p.bounds[(corner&2)?1:0][1]+data[i*4+1],p.bounds[(corner&4)?1:0][2]+data[i*4+2]).project(camera);const x=(projected.x+1)*el.clientWidth/2,y=(1-projected.y)*el.clientHeight/2;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}projected.copy(centers[i]).add(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])).project(camera);if(projected.z< -1||projected.z>1)return;targets.push({index:i,x:(projected.x+1)*el.clientWidth/2,y:(1-projected.y)*el.clientHeight/2,left,right,top,bottom});});}updateNames(s,!moving&&!controlsMoving&&!controls.autoRotate);dirty=false;}
   const settledNow=!moving&&!controlsMoving&&!controls.autoRotate;if(settledNow&&!wasSettled)updateNames(s,true);wasSettled=settledNow;

   lastState=s;return moving||controls.autoRotate||controlsMoving;
  };draw=animate;invalidate();
  const contextLost=(e:Event)=>{e.preventDefault();onError('El dispositivo ha interrumpido WebGL. Recarga el visor o vuelve al atlas 2D.');};renderer.domElement.addEventListener('webglcontextlost',contextLost);
  return()=>{disposed=true;abort.abort();loop.dispose();invalidateRef.current=()=>{};document.removeEventListener('visibilitychange',invalidate);observer.disconnect();controls.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());scene.traverse(o=>{if(o instanceof T.Mesh&&!geometries.includes(o.geometry)){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});env.dispose();partTexture.dispose();selectionTexture.dispose();markerGeometry.dispose();markerMaterial.dispose();hover.remove();leader.remove();tag.remove();nameLayer.remove();renderer.dispose();renderer.domElement.remove();};
 },[atlas]);
 return <div className="scene" ref={host}/>;
}
