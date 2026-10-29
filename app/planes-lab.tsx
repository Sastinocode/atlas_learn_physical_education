import {useEffect,useId,useState} from 'react';
import {Play,Pause,RotateCcw,ArrowRight} from 'lucide-react';
import {add3,scale3,jointOrigin,movingLimb,planeDefinitions,planeMotions,jointNames,motionDescription,type V3,type JointId,type MotionId} from './planes-content';
type Camera='oblique'|'front'|'side'|'top';
function PlaneScene({joint,motion,progress,camera,planeVisible,axisVisible}:{joint:JointId;motion:MotionId;progress:number;camera:Camera;planeVisible:boolean;axisVisible:boolean}){
 const uid=useId().replaceAll(':',''),m=planeMotions.find(x=>x.id===motion)!,d=planeDefinitions[m.plane];
 const rotation=motion==='ir'||motion==='er',o=jointOrigin(joint),limb=movingLimb(joint,motion,progress);
 const center=rotation?limb[1]:o;
 const [yaw,pitch]=camera==='front'?[0,0]:camera==='side'?[Math.PI/2,0]:camera==='top'?[0,Math.PI/2]:[.6,.3];
 function project(p:V3){const horizontal=-p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),depth=p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw);return [270+horizontal*1.05,250-((p[1]-185)*Math.cos(pitch)+depth*Math.sin(pitch))*1.05];}
 const points=(ps:V3[])=>ps.map(p=>project(p).join(',')).join(' ');
 const planeCorners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>add3(center,add3(scale3(d.u,a*110),scale3(d.v,b*100))));
 const staticLines:V3[][]=[[[0,305,0],[0,175,0]],[[-52,290,0],[52,290,0]],[[-28,175,0],[28,175,0]],[[-52,290,0],[-58,225,0],[-62,160,0]],[[-28,175,0],[-28,95,0],[-28,15,0],[-28,15,25]]];
 if(joint==='hip')staticLines.push([[52,290,0],[58,225,0],[62,160,0]]);
 else staticLines.push([[28,175,0],[28,95,0],[28,15,0],[28,15,25]]);
 const path=Array.from({length:25},(_,i)=>movingLimb(joint,motion,i*100/24)[2]);
 const h=project([0,330,0]),jp=project(o),cp=project(center);
 const axisEnds=[add3(center,scale3(d.normal,-125)),add3(center,scale3(d.normal,125))];
 const ap=project(axisEnds[1]),pp=project(planeCorners[2]);
 const anterior=project([0,0,95]),origin=project([0,0,0]);
 return <svg className="plane-scene" viewBox="0 0 560 480" role="img" aria-label={`${jointNames[joint]} derecha: ${m.name}. Vista ${camera==='front'?'frontal':camera==='side'?'lateral':camera==='top'?'superior':'oblicua'}. ${planeVisible?'Superficie P: plano '+d.name+'. ':''}${axisVisible?'Línea E: eje '+d.axis+', perpendicular al plano.':''}`}>
  <defs><marker id={`${uid}-arrow`} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="#bd6530"/></marker></defs>
  <polygon points={points([[-130,0,-110],[130,0,-110],[130,0,110],[-130,0,110]])} fill="#f7f4f0" stroke="#e9e4db"/>
  <path d={`M${origin} L${anterior}`} stroke="#b9af9f" strokeWidth="2"/><text x={anterior[0]+5} y={anterior[1]+16} className="plane-small">ANTERIOR</text>
  {planeVisible&&<><polygon points={points(planeCorners)} fill="#b8dbee" fillOpacity=".48" stroke="#357895" strokeWidth="2"/><line x1={project(planeCorners[0])[0]} y1={project(planeCorners[0])[1]} x2={project(planeCorners[2])[0]} y2={project(planeCorners[2])[1]} stroke="#357895" strokeDasharray="3 6" opacity=".4"/><text x={pp[0]+8} y={pp[1]-7} fill="#20546e">P · plano</text></>}
  <path d={path.map((p,i)=>`${i?'L':'M'}${project(p)}`).join(' ')} fill="none" stroke="#bd6530" strokeWidth="2.5" strokeDasharray="5 5" markerEnd={`url(#${uid}-arrow)`}/>
  {staticLines.map((p,i)=><polyline key={i} points={points(p)} fill="none" stroke="#b9af9f" strokeWidth="13" strokeLinejoin="round" strokeLinecap="round"/>)}
  <polyline points={points(movingLimb(joint,motion,0))} fill="none" stroke="#c5baae" strokeWidth="11" strokeDasharray="5 5" strokeLinecap="round" opacity=".55"/>
  <circle cx={h[0]} cy={h[1]} r="20" fill="#f4eee4" stroke="#94846c" strokeWidth="3"/>
  <polyline points={points(limb)} fill="none" stroke="#754f39" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round"/>
  {limb.map((p,i)=><circle key={i} cx={project(p)[0]} cy={project(p)[1]} r="5" fill="white" stroke="#754f39" strokeWidth="2"/>)}
  {axisVisible&&<><polyline points={points(axisEnds)} stroke="#99374f" strokeWidth="4" strokeDasharray="10 5"/><circle cx={cp[0]} cy={cp[1]} r="8" fill="white" stroke="#99374f" strokeWidth="2"/><circle cx={cp[0]} cy={cp[1]} r="2" fill="#99374f"/><text x={ap[0]+9} y={ap[1]-7} fill="#832c43">E · eje</text></>}
  <circle cx={jp[0]} cy={jp[1]} r="13" fill="none" stroke="#553928" strokeWidth="2"/><text x={jp[0]+18} y={jp[1]+22} fill="#553928">{jointNames[joint]} D</text>
  <text x="18" y="26" className="plane-small">D = DERECHA DE LA FIGURA · ESQUEMA ESPACIAL</text>
  <text x="18" y="459" className="plane-small">TRAZO NARANJA = RECORRIDO · SEGMENTO MORADO = POSICIÓN ACTUAL</text>
 </svg>;
}
export default function PlanesLab({onQuestion}:{onQuestion:(id:string)=>void}){
 const [joint,setJoint]=useState<JointId>('hip'),[motion,setMotion]=useState<MotionId>('abd');
 const [progress,setProgress]=useState(0),[playing,setPlaying]=useState(false),[camera,setCamera]=useState<Camera>('oblique');
 const [planeVisible,setPlaneVisible]=useState(true),[axisVisible,setAxisVisible]=useState(true),[explanation,setExplanation]=useState(true);
 const m=planeMotions.find(x=>x.id===motion)!,d=planeDefinitions[m.plane],rotation=motion==='ir'||motion==='er';
 useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>setProgress(v=>Math.min(100,v+.7)),60);return()=>window.clearInterval(timer);},[playing]);
 useEffect(()=>{if(progress===100)setPlaying(false);},[progress]);
 function resetMotion(){setPlaying(false);setProgress(0);}
 function resetAll(){resetMotion();setJoint('hip');setMotion('abd');setCamera('oblique');setPlaneVisible(true);setAxisVisible(true);setExplanation(true);}
 return <section className="planes-lab" aria-label="Laboratorio de planos y ejes">
  <div className="planes-intro"><div><div className="eyebrow">GEOMETRÍA DEL MOVIMIENTO</div><h2>Un plano es una superficie.<br/>Un eje es una línea.</h2><p>El segmento se desplaza en un plano y gira alrededor de un eje perpendicular a él.</p></div><div className="plane-rule"><strong>90°</strong><span>entre el eje y el plano<br/>en el modelo básico</span></div></div>
  <div className="planes-select"><div><h3>1. Articulación</h3><div className="lab-joints">{(['hip','shoulder'] as JointId[]).map(j=><button key={j} aria-pressed={joint===j} onClick={()=>{setJoint(j);resetMotion();}}>{jointNames[j]}</button>)}</div></div><div><h3>2. Movimiento</h3><div className="planes-motions">{planeMotions.map(x=><button key={x.id} aria-pressed={motion===x.id} onClick={()=>{setMotion(x.id);resetMotion();}}><b>{x.short}</b><span>{x.name}</span></button>)}</div></div></div>
  <div className="planes-grid"><div className="planes-visual"><div className="planes-camera" aria-label="Vista del esquema">{([['oblique','Oblicua'],['front','Frontal'],['side','Lateral'],['top','Superior']] as const).map(([v,label])=><button key={v} aria-pressed={camera===v} onClick={()=>setCamera(v)}>{label}</button>)}</div><PlaneScene joint={joint} motion={motion} progress={progress} camera={camera} planeVisible={planeVisible} axisVisible={axisVisible}/>
   <div className="planes-toggles"><label><input type="checkbox" checked={planeVisible} onChange={e=>setPlaneVisible(e.target.checked)}/> P · mostrar plano</label><label><input type="checkbox" checked={axisVisible} onChange={e=>setAxisVisible(e.target.checked)}/> E · mostrar eje</label></div>
   <div className="lab-transport"><button className="primary" onClick={()=>{if(progress===100)setProgress(0);setPlaying(p=>!p);}}>{playing?<Pause size={17}/>:<Play size={17}/>} {playing?'Pausar gesto':'Reproducir gesto'}</button><button className="secondary" onClick={resetMotion}>Volver al inicio</button></div>
   <label className="lab-slider">Recorrido del gesto · {Math.round(progress)} %<input type="range" min="0" max="100" step="1" value={progress} aria-label="Recorrido del movimiento articular" onChange={e=>{setPlaying(false);setProgress(Number(e.target.value));}}/></label>
   <p className="lab-caption">La cámara cambia la vista, no el plano anatómico. Si el plano se ve de canto o el eje como un punto, prueba «Oblicua». Los 90° reales no siempre se ven como 90° en una proyección.</p>
  </div><div className="planes-reading"><div><span className="pill">{jointNames[joint]} derecha · {m.short}</span><h3>{m.name}</h3><p>{m.description}</p><p>{motionDescription(joint,motion)}</p></div>
   <button className="secondary" aria-expanded={explanation} onClick={()=>setExplanation(v=>!v)}>{explanation?'Ocultar':'Revelar'} plano, eje y explicación</button>
   {explanation?<><article className="plane-concept"><span>P</span><div><h4>Plano {d.name.toLocaleLowerCase('es')}</h4><p>{d.division}</p><p>Representado por una <b>superficie transparente</b>.</p></div></article><article className="axis-concept"><span>E</span><div><h4>Eje {d.axis.toLocaleLowerCase('es')}</h4><p>{d.direction}</p><p>Representado por una <b>línea discontinua</b> que atraviesa el plano.</p></div></article><p className="notice">{rotation?'El húmero o el fémur gira sobre su eje longitudinal. El codo o la rodilla se mantienen flexionados para que mano o pie indiquen el giro. El plano horizontal se dibuja a esa altura; es paralelo al plano transversal corporal.':'El plano se ha desplazado hasta la articulación para observar el gesto. Conserva su orientación anatómica. El segmento se mueve dentro de esa superficie y el eje la atraviesa.'}</p></>:<p className="notice">Antes de revelar: identifica la superficie, nombra la dirección de la línea y explica la relación entre ambas. Puedes ocultar también P y E en el dibujo.</p>}
   <button className="primary" onClick={()=>{setPlaying(false);onQuestion(`plane-${joint}-${motion}`);}}>Practicar en Relacionar · 2 pt <ArrowRight size={16}/></button>
   <p className="lab-caption">La observación no puntúa. La pregunta utiliza el equipo o perfil activo y guarda su resultado en el resumen.</p>
  </div></div>
  <details className="planes-reference"><summary>Comparar los tres planos y sus ejes</summary><div className="planes-table"><table><thead><tr><th>Plano · superficie</th><th>Eje perpendicular · línea</th><th>Ejemplos de cadera y hombro</th></tr></thead><tbody>{Object.values(planeDefinitions).map((p,i)=><tr key={p.name}><td>{p.name}</td><td>{p.axis}</td><td>{['ABD / ADD','Flexión / extensión','Rotación interna / externa'][i]}</td></tr>)}</tbody></table></div><p>«Eje transversal» y «plano transversal» no son lo mismo: el eje transversal es mediolateral y se asocia al plano sagital.</p></details>
  <div className="planes-bottom"><button className="secondary" onClick={resetAll}><RotateCcw size={16}/> Reiniciar laboratorio</button><p className="lab-caption">Modelo geométrico introductorio: recorridos ilustrativos, no amplitudes normales ni objetivos de movilidad. Pelvis y tronco estables; no representa todos los movimientos escapulares ni los ejes instantáneos reales.</p></div>
  <details className="lab-sources"><summary>Uso docente y fuentes</summary><p>Pide primero que señalen la superficie y la línea. Después, compara ABD con ADD y flexión con extensión: cambia el sentido, pero se conservan el plano y el eje. En la rotación de cadera, observa el muslo y evita deducir el movimiento solo por el pie.</p><p>Contenido introductorio para contrastar con la programación. <a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology" target="_blank" rel="noreferrer">OpenStax · planos y posición anatómica</a> · <a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/9-5-types-of-body-movements" target="_blank" rel="noreferrer">Movimientos corporales</a>. Los ajustes de esta demostración se reinician al salir; los retos sí guardan el progreso.</p></details>
 </section>;
}
