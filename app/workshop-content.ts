// Taller introductorio: revisar profundidad y terminología con la programación.
export const movementCards=[
 {id:'abduction',name:'Abducción de cadera',action:'De pie con apoyo, separa lateralmente una pierna manteniendo la pelvis estable.',joint:'Cadera · sinovial esferoidea',plane:'Plano frontal · eje anteroposterior',muscles:'Glúteo medio y menor, con participación del tensor de la fascia lata; el tronco y la pierna de apoyo estabilizan.',confusion:'Inclinar el tronco no sustituye a separar el fémur respecto de la pelvis.',symbol:'↗',question:'¿Qué se mueve respecto a qué? ¿Quién estabiliza la pelvis?'},
 {id:'dorsi',name:'Dorsiflexión de tobillo',action:'Sentado, talón apoyado: eleva el antepié hacia la tibia, sin girar la planta.',joint:'Talocrural · sinovial de tipo bisagra',plane:'Plano sagital · eje mediolateral',muscles:'Tibial anterior y extensores largos de los dedos y del dedo gordo colaboran; no interviene un único músculo.',confusion:'Dorsiflexión no equivale a inversión. En apoyo también puede acercarse la tibia al pie fijo.',symbol:'↶',question:'¿Qué cambia si el pie permanece apoyado y avanza la tibia?'},
 {id:'internal',name:'Rotación interna de cadera',action:'Con la pelvis fija, orienta la cara anterior del fémur hacia la línea media. Analiza el giro del muslo, no solo la punta del pie.',joint:'Cadera · sinovial esferoidea',plane:'Giro alrededor del eje longitudinal del fémur; plano transversal en posición anatómica.',muscles:'Pueden colaborar fibras anteriores de glúteo medio y menor y tensor de la fascia lata. Su contribución cambia con la posición de la cadera.',confusion:'El pie puede girar por otros segmentos. Fijar pelvis y observar fémur ayuda a identificar la articulación.',symbol:'↻',question:'¿Cómo comprobarías que el giro procede de la cadera y no de la pelvis?'},
 {id:'external',name:'Rotación externa de cadera',action:'Con la pelvis fija, orienta la cara anterior del fémur hacia fuera, alejándola de la línea media.',joint:'Cadera · sinovial esferoidea',plane:'Giro alrededor del eje longitudinal del fémur; plano transversal en posición anatómica.',muscles:'Glúteo mayor y rotadores profundos, entre otros, pueden colaborar. La acción de algunos músculos varía según el ángulo de cadera.',confusion:'No es lo mismo rotar el muslo que separarlo lateralmente: esto último es abducción.',symbol:'↺',question:'¿Puedes diferenciar rotación externa y abducción sin mover la pelvis?'},
 {id:'tendon',name:'Tendones y ligamentos',action:'Analiza la elevación de talones: el tendón calcáneo transmite al calcáneo la fuerza del tríceps sural.',joint:'Tobillo y articulaciones del pie',plane:'Ascenso: flexión plantar. Descenso controlado: acción excéntrica de los flexores plantares.',muscles:'Gastrocnemio y sóleo forman el tríceps sural. El tendón transmite fuerza; no genera contracción muscular.',confusion:'Un tendón conecta habitualmente músculo y hueso; un ligamento conecta huesos y contribuye a la estabilidad articular.',symbol:'↟',question:'¿Qué estructura transmite fuerza y cuáles la producen?'},
 {id:'types',name:'Tipos de músculo y articulación',action:'Distingue tejido muscular de forma muscular: esquelético, cardíaco y liso son tipos de tejido; fusiforme o penniforme describen arquitectura.',joint:'Cadera: esferoidea; talocrural: bisagra. La rodilla es más compleja que una bisagra perfecta.',plane:'La forma articular condiciona los movimientos posibles, pero ligamentos, cápsula y músculos también influyen.',muscles:'El bíceps braquial es un músculo esquelético. «Cuádriceps» es un grupo de cuatro músculos, no cuatro tipos de tejido.',confusion:'Un grupo muscular no es un tipo de tejido ni una sola articulación.',symbol:'◈',question:'¿Clasificamos por tejido, arquitectura, función o número de músculos?'}
];
export const placementIds={a:['pectoral','deltoid','biceps','rectus','quad','tibant'],p:['trapezius','triceps','lat','glute','hamstrings','gastro']} as const;
export type Placement={a:Record<string,string>;p:Record<string,string>};
export const emptyPlacement=():Placement=>({a:{},p:{}});
export function placeMuscle(state:Placement,view:'a'|'p',muscle:string,zone:string):Placement{
 const ids:readonly string[]=placementIds[view];
 if(!ids.includes(muscle)||!ids.includes(zone))return state;
 const next={...state[view]};
 // Una ficha por zona: al ocuparla, la anterior vuelve al banco.
 for(const key of Object.keys(next))if(next[key]===muscle)delete next[key];
 next[zone]=muscle;
 return {...state,[view]:next};
}
export function restorePlacement(raw:string|null):Placement{
 try{const data=JSON.parse(raw||'null');const out=emptyPlacement();
 for(const view of ['a','p'] as const){if(!data||typeof data[view]!=='object')return out;for(const [zone,muscle] of Object.entries(data[view]))if(typeof muscle==='string')Object.assign(out,placeMuscle(out,view,muscle,zone));}return out;
 }catch{return emptyPlacement();}
}
