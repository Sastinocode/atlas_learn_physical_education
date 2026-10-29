import type {Question} from './content';
export type PlaneId='frontal'|'sagittal'|'transverse';
export type JointId='hip'|'shoulder'|'elbow'|'knee'|'ankle';
export type MotionId='abd'|'add'|'flex'|'ext'|'ir'|'er'|'df'|'pf';
export type V3=[number,number,number];
export const planeDefinitions:Record<PlaneId,{name:string;division:string;axis:string;direction:string;normal:V3;u:V3;v:V3}>={
 frontal:{name:'Frontal o coronal',division:'Separa una parte anterior y otra posterior.',axis:'Anteroposterior (sagital)',direction:'De delante hacia atrás.',normal:[0,0,1],u:[1,0,0],v:[0,1,0]},
 sagittal:{name:'Sagital',division:'Separa una parte derecha y otra izquierda. Solo el plano medio divide en mitades.',axis:'Mediolateral (transversal)',direction:'De un lado al otro.',normal:[1,0,0],u:[0,0,1],v:[0,1,0]},
 transverse:{name:'Transversal u horizontal',division:'Separa una parte superior y otra inferior.',axis:'Longitudinal',direction:'A lo largo del húmero o del fémur; vertical en esta postura.',normal:[0,1,0],u:[1,0,0],v:[0,0,1]}
};
// Movimiento que enseña el maniquí para cada plano (coincide con los ejemplos de la lección)
export const planeDemos:Record<'sagital'|'frontal'|'transversal',{joint:JointId;motion:MotionId}>={sagital:{joint:'hip',motion:'flex'},frontal:{joint:'shoulder',motion:'abd'},transversal:{joint:'hip',motion:'er'}};
export const jointNames:Record<JointId,string>={hip:'Cadera',shoulder:'Hombro',elbow:'Codo',knee:'Rodilla',ankle:'Tobillo'};
// Movimientos que se trabajan en cada articulación (el orden de cadera y hombro conserva los ids de preguntas antiguos)
export const jointMotions:Record<JointId,MotionId[]>={hip:['abd','add','flex','ext','ir','er'],shoulder:['abd','add','flex','ext','ir','er'],elbow:['flex','ext'],knee:['flex','ext'],ankle:['df','pf']};
export const planeMotions:{id:MotionId;name:string;short:string;plane:PlaneId;from:number;to:number;description:string}[]=[
 {id:'abd',name:'Abducción',short:'ABD',plane:'frontal',from:0,to:45,description:'Separar el segmento de la línea media por el lateral.'},
 {id:'add',name:'Aducción',short:'ADD',plane:'frontal',from:45,to:0,description:'Acercar el segmento a la línea media desde una posición separada.'},
 {id:'flex',name:'Flexión',short:'FLEX',plane:'sagittal',from:0,to:50,description:'Llevar el brazo o el muslo hacia delante respecto al tronco.'},
 {id:'ext',name:'Extensión',short:'EXT',plane:'sagittal',from:50,to:0,description:'Volver desde la flexión hacia la posición neutra. No hace falta pasar por detrás del tronco para que sea extensión.'},
 {id:'ir',name:'Rotación interna',short:'RI',plane:'transverse',from:0,to:-35,description:'Girar la cara anterior del húmero o del fémur hacia la línea media.'},
 {id:'er',name:'Rotación externa',short:'RE',plane:'transverse',from:0,to:35,description:'Girar la cara anterior del húmero o del fémur alejándola de la línea media.'},
 {id:'df',name:'Flexión dorsal',short:'FD',plane:'sagittal',from:0,to:20,description:'Acercar el dorso del pie a la tibia: la punta del pie sube.'},
 {id:'pf',name:'Flexión plantar',short:'FP',plane:'sagittal',from:0,to:-50,description:'Alejar el dorso del pie de la tibia: la punta baja, como al ponerse de puntillas.'}
];
// Recorridos de codo y rodilla: valores orientativos de referencia (Norkin y White, Measurement of Joint Motion; AAOS).
// Varían entre personas; el codo aparece entre 140 y 150° según el autor. Cadera y hombro mantienen sus recorridos ilustrativos.
const ranges:Partial<Record<JointId,Partial<Record<MotionId,[number,number]>>>>={
 elbow:{flex:[0,145],ext:[145,0]},knee:{flex:[0,135],ext:[135,0]}
};
export function motionRange(joint:JointId,motion:MotionId):[number,number]{const m=planeMotions.find(x=>x.id===motion)!;return ranges[joint]?.[motion]??[m.from,m.to];}
const jointMotionText:Partial<Record<JointId,Partial<Record<MotionId,string>>>>={
 elbow:{flex:'Acercar el antebrazo al brazo: el ángulo del codo se cierra.',ext:'Alejar el antebrazo del brazo hasta volver a la posición anatómica.'},
 knee:{flex:'Llevar el talón hacia el glúteo: el ángulo de la rodilla se cierra.',ext:'Estirar la rodilla hasta volver a la posición anatómica.'}
};
// Descripción del movimiento adaptada a la articulación
export function describeMotion(joint:JointId,motion:MotionId){return jointMotionText[joint]?.[motion]??planeMotions.find(x=>x.id===motion)!.description;}
export function motionDescription(joint:JointId,motion:MotionId){
 if(motion==='ir'||motion==='er')return joint==='hip'?'Cadera próxima a neutro y rodilla flexionada 90°. El muslo gira sobre su eje: en RI el pie se desplaza hacia fuera; en RE, hacia dentro. No clasifiques la rotación de cadera mirando solo el pie.':'Brazo junto al tronco y codo flexionado 90°. El húmero gira; en RI la mano va hacia el abdomen y en RE se aleja. El codo conserva la flexión: no es pronación/supinación del antebrazo.';
 if(joint==='elbow')return 'Se mueve el antebrazo derecho respecto al brazo, con el húmero junto al tronco. Recorrido orientativo de 0 a 145°; varía entre personas.';
 if(joint==='knee')return 'Se mueve la pierna (tibia) respecto al muslo, con la cadera en posición neutra. Recorrido orientativo de 0 a 135°. Con la rodilla extendida casi no puede rotar; un poco de rotación solo aparece al flexionarla.';
 if(joint==='ankle')return 'Se mueve el pie respecto a la pierna (articulación del tobillo). Para verlo, el maniquí levanta el pie del suelo flexionando cadera y rodilla. Recorrido orientativo: flexión dorsal unos 20° y flexión plantar unos 50°.';
 return joint==='hip'?'Se mueve el muslo derecho respecto a una pelvis estable. El esquema mantiene la rodilla extendida para hacer visible el recorrido.':'Se mueve el brazo derecho respecto al tronco. Se mantiene el codo extendido. Es una simplificación glenohumeral: en el gesto real también se coordina la cintura escapular.';
}
export const planeQuestions:Question[]=(['hip','shoulder','elbow','knee','ankle'] as JointId[]).flatMap(joint=>jointMotions[joint].map(id=>planeMotions.find(x=>x.id===id)!).map(m=>({
 id:`plane-${joint}-${m.id}`,mode:'relacionar',topic:`${jointNames[joint]} · ${m.short} · plano y eje`,
 prompt:`${jointNames[joint]}: ${m.name.toLocaleLowerCase('es')} (${m.short}). ${describeMotion(joint,m.id)} ${m.id==='ir'||m.id==='er'?'Con el húmero o el fémur próximo a vertical. ':''}¿Qué pareja de plano y eje corresponde al modelo básico?`,
 options:['Plano frontal → eje anteroposterior','Plano sagital → eje mediolateral','Plano transversal → eje longitudinal'],
 correct:m.plane==='frontal'?0:m.plane==='sagittal'?1:2,
 why:`${m.name}: plano ${planeDefinitions[m.plane].name.toLocaleLowerCase('es')} y eje ${planeDefinitions[m.plane].axis.toLocaleLowerCase('es')}. El eje es perpendicular al plano. ${motionDescription(joint,m.id)}`,
 hints:{joints:`${jointNames[joint]}: ${describeMotion(joint,m.id)} El eje atraviesa perpendicularmente el plano del movimiento.`}
})));
export const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const scale3=(a:V3,s:number):V3=>[a[0]*s,a[1]*s,a[2]*s];
const origins:Record<JointId,V3>={hip:[28,175,0],shoulder:[52,290,0],elbow:[58,225,0],knee:[28,95,0],ankle:[28,15,0]};
export function jointOrigin(joint:JointId):V3{return origins[joint];}
export function movingLimb(joint:JointId,motion:MotionId,progress:number):V3[]{
 const m=planeMotions.find(x=>x.id===motion)!,[from,to]=motionRange(joint,motion);
 const angle=(from+(to-from)*progress/100)*Math.PI/180;
 const origin=jointOrigin(joint),length=joint==='hip'?80:65;
 // Codo: el antebrazo va hacia delante. Rodilla: la pierna va hacia atrás y el pie la acompaña. Tobillo: el pie gira desde la horizontal.
 if(joint==='elbow'){const d:V3=[0,-Math.cos(angle),Math.sin(angle)];return [origin,add3(origin,scale3(d,65)),add3(origin,scale3(d,80))];}
 if(joint==='knee'){const shank:V3=[0,-Math.cos(angle),-Math.sin(angle)],foot:V3=[0,-Math.sin(angle),Math.cos(angle)];const ankle=add3(origin,scale3(shank,80));return [origin,ankle,add3(ankle,scale3(foot,25))];}
 if(joint==='ankle'){const foot:V3=[0,Math.sin(angle),Math.cos(angle)];return [origin,add3(origin,scale3(foot,20)),add3(origin,scale3(foot,28))];}
 if(motion==='ir'||motion==='er'){
  const end=add3(origin,[0,-length,0]),z=joint==='hip'?-75:65;
  return [origin,end,add3(end,[z*Math.sin(angle),0,z*Math.cos(angle)])];
 }
 const d:V3=m.plane==='frontal'?[Math.sin(angle),-Math.cos(angle),0]:[0,-Math.cos(angle),Math.sin(angle)];
 return [origin,add3(origin,scale3(d,length)),add3(origin,scale3(d,length*2))];
}
