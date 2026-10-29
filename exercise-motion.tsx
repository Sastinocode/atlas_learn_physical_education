import {useId} from 'react';
import type {JointAnalysis} from './exercise-analysis';
type P=[number,number];
type Pose={hip:P;knee:P;ankle:P;shoulder:P;elbow:P;hand:P;head:P;toe:P;rear?:P[];left?:P[]};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const point=(a:P,b:P,t:number):P=>[mix(a[0],b[0],t),mix(a[1],b[1],t)];
// Two-link inverse kinematics preserves segment lengths in the leg/arm being analysed.
function bend(a:P,b:P,l1:number,l2:number,side=1):P{
 const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.max(.01,Math.hypot(dx,dy));
 const along=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-along*along));
 return [a[0]+along*dx/d-side*h*dy/d,a[1]+along*dy/d+side*h*dx/d];
}
function poseFor(id:string,t:number):Pose{
 let hip:P=[220,215],knee:P=[225,290],ankle:P=[230,365],shoulder:P=[220,115],elbow:P=[250,175],hand:P=[270,225],toe:P=[265,375];
 let rear:P[]|undefined,left:P[]|undefined;
 if(id==='squat'||id==='lunge'){
  hip=point([185,272],id==='lunge'?[210,215]:[230,195],t);ankle=[245,365];knee=bend(hip,ankle,90,90,-1);
  const lean=mix(id==='lunge'?20:45,4,t);
  shoulder=[hip[0]+lean,hip[1]-Math.sqrt(10000-lean*lean)];
  elbow=[shoulder[0]+48,shoulder[1]+10];hand=[elbow[0]+43,elbow[1]-8];
  if(id==='lunge'){rear=[hip,bend(hip,[120,350],90,95,-1),[120,350],[145,375]];}
 }else if(id==='calf'){
  toe=[263,375];ankle=[263-35*Math.cos(t*.7),375-35*Math.sin(t*.7)];
  knee=[ankle[0],ankle[1]-83];hip=[knee[0],knee[1]-83];shoulder=[hip[0],hip[1]-97];
  elbow=[shoulder[0]+45,shoulder[1]+15];hand=[340,elbow[1]];
 }else if(id==='pushup'){
  toe=[92,375];ankle=[100,350];shoulder=point([332,315],[316,224],t);
  hip=point(ankle,shoulder,.53);knee=point(ankle,hip,.5);hand=[337,375];elbow=bend(shoulder,hand,78,78,1);
 }else if(id==='row'){
  hip=[177,270];knee=[265,270];ankle=[320,340];toe=[346,341];shoulder=[177,163];
  hand=point([320,195],[206,237],t);elbow=bend(shoulder,hand,83,76,1);
 }else if(id==='press'){
  hip=[235,275];knee=[268,315];ankle=[270,367];toe=[291,377];shoulder=[258,165];
  hand=point([327,154],[273,35],t);elbow=bend(shoulder,hand,66,66,1);
  left=[[212,165],[470-elbow[0],elbow[1]],[470-hand[0],hand[1]]];
 }
 const head:P=id==='pushup'?[shoulder[0]+28,shoulder[1]-12]:[id==='press'?235:shoulder[0],shoulder[1]-34];
 return {hip,knee,ankle,shoulder,elbow,hand,head,toe,rear,left};
}
export default function ExerciseMotion({id,amount,joint,forces,phaseLabel}:{id:string;amount:number;joint:JointAnalysis;forces:boolean;phaseLabel:string}){
 const uid=useId().replaceAll(':',''),p=poseFor(id,amount);
 const j=p[joint.id==='scapula'?'shoulder':joint.id];
 const path=(pts:P[])=>pts.map(v=>v.join(',')).join(' ');
 const centre=point(p.hip,p.shoulder,.4);
 function arrow(a:P,b:P,label:string,color:string){return <g><path d={`M${a} L${b}`} stroke={color} strokeWidth="3" markerEnd={`url(#${uid}-${color.slice(1)})`}/><text x={b[0]+8} y={b[1]+4} fill={color}>{label}</text></g>;}
 return <svg className="motion-svg" viewBox="0 0 480 440" role="img" aria-label={`${phaseLabel}. Esquema ${id==='press'?'frontal proyectado':'lateral'}; articulación analizada: ${joint.name}. ${forces?'Flechas de fuerzas externas cualitativas, sin escala.':''}`}>
  <defs>{['#b04b35','#23796e','#6d46ac'].map(c=><marker id={`${uid}-${c.slice(1)}`} key={c} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill={c}/></marker>)}</defs>
  <text x="22" y="28" className="motion-view">{id==='press'?'PROYECCIÓN FRONTAL':'VISTA LATERAL · ESQUEMA'}</text>
  <path d="M65 382 H407" stroke="#c9c1d6" strokeWidth="2"/>
  {(id==='press'||id==='row')&&<path d={id==='row'?'M146 278 H221 M155 278 V377':'M196 276 H279 M201 276 V377 M197 276 V166'} stroke="#bab3c7" strokeWidth="8" fill="none"/>}
  {id==='row'&&<><path d={`M${p.hand} L427 206`} stroke="#8a7bab" strokeWidth="2"/><circle cx="433" cy="206" r="10" fill="none" stroke="#8a7bab"/><path d="M320 355 L356 323" stroke="#bab3c7" strokeWidth="7"/></>}
  {id==='calf'&&<path d="M340 80 V378" stroke="#bab3c7" strokeWidth="5"/>}
  {p.rear&&<polyline points={path(p.rear)} fill="none" stroke="#a9a1b6" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"/>}
  {id==='press'&&<><polyline points={path([p.hip,[470-p.knee[0],p.knee[1]],[470-p.ankle[0],p.ankle[1]],[470-p.toe[0],p.toe[1]]])} fill="none" stroke="#8b7c97" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/><path d="M212 165 H258" stroke="#665871" strokeWidth="18" strokeLinecap="round"/></>}
  <polyline points={path([p.toe,p.ankle,p.knee,p.hip,id==='press'?[235,165]:p.shoulder])} fill="none" stroke="#665871" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
  <polyline points={path([p.shoulder,p.elbow,p.hand])} fill="none" stroke="#665871" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"/>
  {p.left&&<polyline points={path(p.left)} fill="none" stroke="#8b7c97" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"/>}
  <circle cx={p.head[0]} cy={p.head[1]} r="19" fill="#d8c8e8" stroke="#665871" strokeWidth="3"/>
  {[p.hip,p.knee,p.ankle,p.shoulder,p.elbow].map((v,i)=><circle key={i} cx={v[0]} cy={v[1]} r="5" fill="white"/>)}
  {id==='press'&&[p.hand,p.left![2]].map((h,i)=><g key={i}><path d={`M${h[0]-18} ${h[1]} H${h[0]+18}`} stroke="#3e344a" strokeWidth="6"/><path d={`M${h[0]-18} ${h[1]-9} V${h[1]+9} M${h[0]+18} ${h[1]-9} V${h[1]+9}`} stroke="#3e344a" strokeWidth="9"/></g>)}
  <circle cx={j[0]} cy={j[1]} r="15" fill="none" stroke="#6d46ac" strokeWidth="3" strokeDasharray="4 3"/>
  <path d={`M${j} L${Math.min(398,j[0]+70)} ${j[1]-27}`} stroke="#6d46ac" strokeWidth="1.5"/>
  <text x={Math.min(330,j[0]+45)} y={j[1]-33} fill="#583586">① {joint.name}</text>
  {id==='lunge'&&<text x="249" y="410" fill="#665871">Pierna adelantada</text>}
  {forces&&<>
   {arrow([centre[0]-28,centre[1]],[centre[0]-28,centre[1]+65],'P','#b04b35')}
   {id==='row'?<>{arrow(p.hand,[p.hand[0]+70,p.hand[1]+(206-p.hand[1])*.35],'T','#6d46ac')}{arrow([181,285],[181,234],'R','#23796e')}{arrow([327,347],[303,323],'R','#23796e')}</>:id==='press'?<>{[p.hand,p.left![2]].map((h,i)=><g key={i}>{arrow([h[0]+12,h[1]+5],[h[0]+12,h[1]+60],'Pₘ','#b04b35')}</g>)}{arrow([245,282],[245,228],'R','#23796e')}{arrow([p.toe[0],375],[p.toe[0],325],'R','#23796e')}</>:<>{arrow([p.toe[0],377],[p.toe[0],315],'R','#23796e')}{id==='pushup'&&arrow([p.hand[0]+7,377],[p.hand[0]+7,315],'R','#23796e')}{id==='lunge'&&arrow([145,377],[145,325],'R','#23796e')}</>}
  </>}
  <text x="22" y="434" className="motion-view">POSICIONES ORIENTATIVAS · SIN MEDICIÓN DE ÁNGULOS</text>
 </svg>;
}
