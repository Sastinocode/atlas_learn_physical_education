// Partidas de los juegos guardadas en este navegador, en el formato de la exportación de clase.
import {GAME_BOARD,parseRun,gameScore} from './game-engine';
import {CHALLENGE_STORAGE,challengeSets,points,validRun} from './challenge-content';
import type {GameEntry} from './class-export';

export function collectGames(read:(key:string)=>string|null):GameEntry[]{
 const out:GameEntry[]=[];
 try{
  const board=JSON.parse(read(GAME_BOARD)||'[]');
  if(Array.isArray(board))for(const raw of board){const run=parseRun(raw);if(run)out.push({game:'Juego 10',profile:`Participante ${String(run.profile).padStart(2,'0')}`,points:gameScore(run),status:'Completada (10/10)',at:run.started});}
 }catch{/* marcador ilegible: se omite */}
 for(const [set,title] of [['planos','Juego planos'],['palancas','Juego palancas']] as const){
  try{
   const run=JSON.parse(read(`${CHALLENGE_STORAGE}:${set}`)||'null'),qs=challengeSets[set].questions;
   if(run&&validRun(run,qs)&&run.answers.length)out.push({game:title,profile:run.profile,points:points(qs,run.answers),status:run.answers.length>=qs.length?`Completada (${qs.length}/${qs.length})`:`En curso (${run.answers.length}/${qs.length})`});
  }catch{/* partida ilegible: se omite */}
 }
 return out;
}
