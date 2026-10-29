import type {Question} from './content';
export type PlaneId='frontal'|'sagittal'|'transverse';
export type JointId='hip'|'shoulder';
export type MotionId='abd'|'add'|'flex'|'ext'|'ir'|'er';
export type V3=[number,number,number];
export const planeDefinitions:Record<PlaneId,{name:string;division:string;axis:string;direction:string;normal:V3;u:V3;v:V3}>={
 frontal:{name:'Frontal o coronal',division:'Separa una parte anterior y otra posterior.',axis:'Anteroposterior (sagital)',direction:'De delante hacia atrás.',normal:[0,0,1],u:[1,0,0],v:[0,1,0]},
 sagittal:{name:'Sagital',division:'Separa una parte derecha y otra izquierda. Solo el plano medio divide en mitades.',axis:'Mediolateral (transversal)',direction:'De un lado al otro.',normal:[1,0,0],u:[0,0,1],v:[0,1,0]},
 transverse:{name:'Transversal u horizontal',division:'Separa una parte superior y otra inferior.',axis:'Longitudinal',direction:'A lo largo del húmero o del fémur; vertical en esta postura.',normal:[0,1,0],u:[1,0,0],v:[0,0,1]}
};
// Movimiento que enseña el maniquí para cada plano (coincide con los ejemplos de la lección)
export const planeDemos:Record<'sagital'|'frontal'|'transversal',{joint:JointId;motion:MotionId}>={sagital:{joint:'hip',motion:'flex'},frontal:{joint:'shoulder',motion:'abd'},transversal:{joint:'hip',motion:'er'}};
export const jointNames:Record<JointId,string>={hip:'Cadera',shoulder:'Hombro'};
export const planeMotions:{id:MotionId;name:string;short:string;plane:PlaneId;from:number;to:number;description:string}[]=[
 {id:'abd',name:'Abducción',short:'ABD',plane:'frontal',from:0,to:45,description:'Separar el segmento de la línea media por el lateral.'},
 {id:'add',name:'Aducción',short:'ADD',plane:'frontal',from:45,to:0,description:'Acercar el segmento a la línea media desde una posición separada.'},
 {id:'flex',name:'Flexión',short:'FLEX',plane:'sagittal',from:0,to:50,description:'Llevar el brazo o el muslo hacia delante respecto al tronco.'},
 {id:'ext',name:'Extensión',short:'EXT',plane:'sagittal',from:50,to:0,description:'Volver desde la flexión hacia la posición neutra. No hace falta pasar por detrás del tronco para que sea extensión.'},
 {id:'ir',name:'Rotación interna',short:'RI',plane:'transverse',from:0,to:-35,description:'Girar la cara anterior del húmero o del fémur hacia la línea media.'},
 {id:'er',name:'Rotación externa',short:'RE',plane:'transverse',from:0,to:35,description:'Girar la cara anterior del húmero o del fémur alejándola de la línea media.'}
];
export function motionDescription(joint:JointId,motion:MotionId){
 if(motion==='ir'||motion==='er')return joint==='hip'?'Cadera próxima a neutro y rodilla flexionada 90°. El muslo gira sobre su eje: en RI el pie se desplaza hacia fuera; en RE, hacia dentro. No clasifiques la rotación de cadera mirando solo el pie.':'Brazo junto al tronco y codo flexionado 90°. El húmero gira; en RI la mano va hacia el abdomen y en RE se aleja. El codo conserva la flexión: no es pronación/supinación del antebrazo.';
 return joint==='hip'?'Se mueve el muslo derecho respecto a una pelvis estable. El esquema mantiene la rodilla extendida para hacer visible el recorrido.':'Se mueve el brazo derecho respecto al tronco. Se mantiene el codo extendido. Es una simplificación glenohumeral: en el gesto real también se coordina la cintura escapular.';
}
export const planeQuestions:Question[]=(['hip','shoulder'] as JointId[]).flatMap(joint=>planeMotions.map(m=>({
 id:`plane-${joint}-${m.id}`,mode:'relacionar',topic:`${jointNames[joint]} · ${m.short} · plano y eje`,
 prompt:`${jointNames[joint]}: ${m.name.toLocaleLowerCase('es')} (${m.short}). ${m.description} ${m.id==='ir'||m.id==='er'?'Con el húmero o el fémur próximo a vertical. ':''}¿Qué pareja de plano y eje corresponde al modelo básico?`,
 options:['Plano frontal → eje anteroposterior','Plano sagital → eje mediolateral','Plano transversal → eje longitudinal'],
 correct:m.plane==='frontal'?0:m.plane==='sagittal'?1:2,
 why:`${m.name}: plano ${planeDefinitions[m.plane].name.toLocaleLowerCase('es')} y eje ${planeDefinitions[m.plane].axis.toLocaleLowerCase('es')}. El eje es perpendicular al plano. ${motionDescription(joint,m.id)}`,
 hints:{joints:`${jointNames[joint]}: ${m.description} El eje atraviesa perpendicularmente el plano del movimiento.`}
})));
export const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const scale3=(a:V3,s:number):V3=>[a[0]*s,a[1]*s,a[2]*s];
export function jointOrigin(joint:JointId):V3{return joint==='hip'?[28,175,0]:[52,290,0];}
export function movingLimb(joint:JointId,motion:MotionId,progress:number):V3[]{
 const m=planeMotions.find(x=>x.id===motion)!;
 const angle=(m.from+(m.to-m.from)*progress/100)*Math.PI/180;
 const origin=jointOrigin(joint),length=joint==='hip'?80:65;
 if(motion==='ir'||motion==='er'){
  const end=add3(origin,[0,-length,0]),z=joint==='hip'?-75:65;
  return [origin,end,add3(end,[z*Math.sin(angle),0,z*Math.cos(angle)])];
 }
 const d:V3=m.plane==='frontal'?[Math.sin(angle),-Math.cos(angle),0]:[0,-Math.cos(angle),Math.sin(angle)];
 return [origin,add3(origin,scale3(d,length)),add3(origin,scale3(d,length*2))];
}
