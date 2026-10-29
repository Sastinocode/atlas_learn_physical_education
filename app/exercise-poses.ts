// Poses clave de los ejercicios para el maniquí 3D (valores orientativos validados por el profesor).
// Ángulos en grados. Cadera, rodilla y codo: flexión positiva. Tobillo: flexión dorsal positiva.
// Tronco: inclinación hacia delante. Hombro: elevación (flexión en la sentadilla; plano escapular en el press).
// Con el pie plano en el suelo los ángulos van ligados: tobillo = inclinación de la tibia, y cadera = muslo + tronco.
export type ExercisePoseId='squat'|'lunge'|'press';
export type Angles={hip:number;knee:number;ankle:number;trunk:number;shoulder:number;elbow:number};
type PoseSet={low:Angles;high:Angles;stance:'stand'|'lunge'|'seated';source:string;note:string;rearKnee?:{low:number;high:number}};

const zero:Angles={hip:0,knee:0,ankle:0,trunk:0,shoulder:0,elbow:0};
export const exercisePoses:Record<ExercisePoseId,PoseSet>={
 squat:{stance:'stand',
  low:{hip:110,knee:110,ankle:30,trunk:30,shoulder:90,elbow:0},
  high:{...zero,shoulder:90},
  source:'Schoenfeld (2010), J Strength Cond Res 24(12): cinemática de la sentadilla; Hemmerich y col. (2006), J Orthop Res: recorridos de cadera, rodilla y tobillo en actividades profundas.',
  note:'Sentadilla con el muslo casi horizontal y talones apoyados. Brazos al frente para equilibrar.'},
 lunge:{stance:'lunge',
  low:{hip:85,knee:90,ankle:15,trunk:10,shoulder:0,elbow:0},
  high:{hip:20,knee:20,ankle:0,trunk:0,shoulder:0,elbow:0},
  rearKnee:{low:90,high:15},
  source:'Farrokhi y col. (2008), J Orthop Sports Phys Ther 38(7): posición del tronco en la zancada.',
  note:'Zancada estática: los pies no se mueven. Se analiza la pierna adelantada; la trasera apoya en la punta y sus ángulos se calculan para que el pie no se despegue.'},
 press:{stance:'seated',
  low:{...zero,shoulder:85,elbow:95},
  high:{...zero,shoulder:170,elbow:10},
  source:'Norkin y White, Measurement of Joint Motion; AAOS: elevación del hombro hasta unos 170–180°.',
  note:'Sentado con respaldo. Los brazos suben en el plano escapular, unos 35° por delante del frontal. La escápula acompaña con rotación superior, que el maniquí no representa por separado.'}
};
// Plano escapular: ángulo respecto al plano frontal
export const SCAPULAR_PLANE=35;

export function anglesAt(id:ExercisePoseId,amount:number):Angles{
 const {low,high}=exercisePoses[id],t=Math.min(1,Math.max(0,amount));
 return Object.fromEntries(Object.keys(low).map(k=>[k,low[k as keyof Angles]+(high[k as keyof Angles]-low[k as keyof Angles])*t])) as Angles;
}

// ---- Geometría en el plano sagital (y arriba, z delante), con las medidas del maniquí ----
export const SEG={thigh:42,shank:40,hipY:90,ankleY:8};
const rad=(d:number)=>d*Math.PI/180,deg=(r:number)=>r*180/Math.PI;
type YZ=[number,number];
// Pierna con el pie plano: inclinación de la tibia (s), del muslo (t) y del tronco (tau), en grados
export function flatLeg(a:Angles){const s=a.ankle,t=a.knee-a.ankle;return {s,t,tau:a.hip-t};}
// Posición de la cadera a partir del tobillo fijo en el suelo
export function hipFromAnkle(ankle:YZ,s:number,t:number):YZ{
 return [ankle[0]+SEG.shank*Math.cos(rad(s))+SEG.thigh*Math.cos(rad(t)),ankle[1]+SEG.shank*Math.sin(rad(s))-SEG.thigh*Math.sin(rad(t))];
}
// Punta del pie (bola) respecto al tobillo cuando el pie gira psi grados con la punta hacia abajo
export function ballOffset(psi:number):YZ{const p=rad(psi);return [-4*Math.cos(p)-13*Math.sin(p),-4*Math.sin(p)+13*Math.cos(p)];}
// Giro (rotación sobre x, en grados) que lleva el vector "abajo" a la dirección v: positivo = hacia atrás
const rotationTo=(v:YZ)=>deg(Math.atan2(-v[1],-v[0]));
const kneeFlexForDistance=(d:number)=>{const c=(SEG.thigh**2+SEG.shank**2-d*d)/(2*SEG.thigh*SEG.shank);return 180-deg(Math.acos(Math.min(1,Math.max(-1,c))));};
// Pierna trasera de la zancada: la bola del pie fija en el suelo (ball); se busca la inclinación del pie
// que deja la rodilla lo más cerca posible de la flexión deseada. Devuelve giros de muslo, tibia y pie.
export function rearLeg(hip:YZ,ball:YZ,kneeTarget:number){
 let best={err:Infinity,psi:45,ankle:[0,0] as YZ};
 for(let psi=20;psi<=85;psi+=.5){
  const o=ballOffset(psi),ankle:YZ=[ball[0]-o[0],ball[1]-o[1]];
  const d=Math.hypot(ankle[0]-hip[0],ankle[1]-hip[1]),err=Math.abs(kneeFlexForDistance(Math.min(d,SEG.thigh+SEG.shank-1e-6))-kneeTarget)+(d>SEG.thigh+SEG.shank?100+(d-SEG.thigh-SEG.shank)*10:0); // si no alcanza, la posición más cercana
  if(err<best.err)best={err,psi,ankle};
 }
 const v:YZ=[best.ankle[0]-hip[0],best.ankle[1]-hip[1]],d=Math.min(Math.hypot(...v),SEG.thigh+SEG.shank-1e-6);
 const alpha=deg(Math.acos((SEG.thigh**2+d*d-SEG.shank**2)/(2*SEG.thigh*d)));
 const thigh=rotationTo(v)-alpha,knee:YZ=[hip[0]-SEG.thigh*Math.cos(rad(thigh)),hip[1]-SEG.thigh*Math.sin(rad(thigh))];
 const shank=rotationTo([best.ankle[0]-knee[0],best.ankle[1]-knee[1]]);
 return {thigh,shank,foot:best.psi,ankle:best.ankle,knee,kneeFlex:shank-thigh};
}
// Zancada: tobillo delantero fijo. La bola del pie trasero se fija desde la pose baja: muslo trasero vertical,
// rodilla trasera a 90° y tibia horizontal; la punta apoya a la altura de la planta (tobillo − 4).
export const LUNGE_FRONT_ANKLE:YZ=[SEG.ankleY,30];
export const LUNGE_REAR_BALL:YZ=(()=>{
 const {s,t}=flatLeg(exercisePoses.lunge.low),hip=hipFromAnkle(LUNGE_FRONT_ANKLE,s,t);
 const ankle:YZ=[hip[0]-SEG.thigh,hip[1]-SEG.shank],ballY=SEG.ankleY-4;
 let psi=0;while(psi<85&&ankle[0]+ballOffset(psi)[0]>ballY)psi+=.25;
 return [ballY,ankle[1]+ballOffset(psi)[1]];
})();
