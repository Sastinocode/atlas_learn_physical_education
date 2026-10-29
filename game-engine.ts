import {gameQuestions,SET_ID} from './game-content';
export const GAME_STORAGE='cuerpo-juego-core10-v1';
export const GAME_BOARD='cuerpo-juego-marcadores-v1';
export const durations=[15,30,45,60,90,120,180];
export type GameAnswer={choice:number|null;expired:boolean};
export type GameRun={version:1;set:string;id:string;profile:number;seconds:number;started:number;deadline:number;answers:GameAnswer[]};
export const newRun=(profile:number,seconds:number,now:number,id:string):GameRun=>({version:1,set:SET_ID,id,profile,seconds,started:now,deadline:now+seconds*1000,answers:[]});
export const gameScore=(run:GameRun)=>run.answers.reduce((n,a,i)=>n+(a.choice===gameQuestions[i]?.correct?100:0),0);
// Absolute deadlines survive background tabs, navigation and page reloads.
export function expireRun(run:GameRun,now:number):GameRun{
 let next=run;
 while(next.answers.length<gameQuestions.length&&now>=next.deadline){next={...next,answers:[...next.answers,{choice:null,expired:true}],deadline:next.deadline+next.seconds*1000};}
 return next;
}
export function answerRun(run:GameRun,questionIndex:number,choice:number,now:number):GameRun{
 const live=expireRun(run,now);
 if(live.answers.length!==questionIndex||questionIndex>=gameQuestions.length||!Number.isInteger(choice)||choice<0||choice>=gameQuestions[questionIndex].options.length)return live;
 return {...live,answers:[...live.answers,{choice,expired:false}],deadline:now+live.seconds*1000};
}
export function parseRun(value:unknown):GameRun|null{
 if(!value||typeof value!=='object')return null;const r=value as GameRun;
 if(r.version!==1||r.set!==SET_ID||typeof r.id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(r.id)||!Number.isInteger(r.profile)||r.profile<1||r.profile>40||!durations.includes(r.seconds)||!Number.isFinite(r.started)||r.started<0||!Number.isFinite(r.deadline)||r.deadline<r.started||!Array.isArray(r.answers)||r.answers.length>10)return null;
 if(r.answers.some((a,i)=>!a||typeof a.expired!=='boolean'||(a.choice!==null&&(!Number.isInteger(a.choice)||a.choice<0||a.choice>=gameQuestions[i].options.length))||(a.expired&&a.choice!==null)||(!a.expired&&a.choice===null)))return null;
 return {version:1,set:SET_ID,id:r.id,profile:r.profile,seconds:r.seconds,started:r.started,deadline:r.deadline,answers:r.answers.map(a=>({choice:a.choice,expired:a.expired}))};
}
export function restoreRun(raw:string|null):GameRun|null{try{return parseRun(JSON.parse(raw||'null'));}catch{return null;}}
export function mergeBoard(board:GameRun[],run:GameRun){if(run.answers.length!==10)return board;return [...board.filter(r=>r.id!==run.id),run].slice(-200);}
