import {questions,type Layer} from './content';
export type Result={tries:number;points:number;done:boolean;revealed:boolean;everWrong:boolean;answer?:string;layers:Layer[]};
export type Session={version:1;team:number;count:number;individual:boolean;mode:string;index:number;results:Record<string,Result>;seen:string[]};
export const fresh=():Session=>({version:1,team:0,count:3,individual:false,mode:'explorar',index:0,results:{},seen:[]});
export const emptyResult=():Result=>({tries:0,points:0,done:false,revealed:false,everWrong:false,layers:[]});
export const keyFor=(s:Session,qid:string)=>`${s.individual?'solo':s.team}:${qid}`;
export function answerResult(old:Result,correct:boolean,max:number):Result {
 return {...old,tries:old.tries+1,done:true,everWrong:old.everWrong||!correct,points:old.points||(!old.revealed&&correct?max:0)};
}
export function score(s:Session,team:number|string) {return Object.entries(s.results).filter(([k])=>k.startsWith(`${team}:`)).reduce((n,[,v])=>n+v.points,0);}
export function restore(raw:string|null):Session {
 if(!raw)return fresh();
 try{const s=JSON.parse(raw);if(s.version!==1||!Number.isInteger(s.count)||s.count<1||s.count>6||!Number.isInteger(s.team)||s.team<0||s.team>=s.count||typeof s.individual!=='boolean'||!['explorar','localizar','relacionar','explicar','taller','modelo3d','core','juego','planos-juego','palancas-juego','aprender'].includes(s.mode)||!Number.isInteger(s.index)||s.index<0||s.index>=Math.max(1,questions.filter(q=>q.mode===s.mode).length)||!s.results||typeof s.results!=='object'||!Array.isArray(s.seen))return fresh();
 for(const [key,v]of Object.entries(s.results) as [string,Result][]) {if(!/^(solo|[0-5]):/.test(key)||!questions.some(q=>key.endsWith(':'+q.id))||!v||!Number.isFinite(v.points)||v.points<0||v.points>2||!Number.isInteger(v.tries)||v.tries<0||typeof v.done!=='boolean'||typeof v.revealed!=='boolean'||typeof v.everWrong!=='boolean'||!Array.isArray(v.layers)||v.layers.some(l=>!['muscles','bones','joints'].includes(l)))return fresh();}
 return {...s,seen:s.seen.filter((x:unknown)=>typeof x==='string')};}catch{return fresh();}
}


