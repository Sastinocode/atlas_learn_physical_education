// Exportación de resultados de clase a CSV para Excel (separador ; y UTF-8 con BOM).
// Funciones puras: reciben los datos y devuelven texto, para poder probarlas sin navegador.
import type {Session} from './session';
import type {Question,Structure} from './content';

export type GameEntry={game:string;profile:string;points:number;status:string;at?:number};
export const CSV_HEADER=['Equipo o perfil','Actividad','Tema','Pregunta','Resultado','Puntos','Intentos','Ayudas usadas','Respuesta','Fecha y hora'];
const activity:Record<string,string>={localizar:'Localizar',relacionar:'Relacionar',explicar:'Explicar'};

// Celda segura: comillas cuando hace falta y apóstrofo delante de lo que Excel tomaría por fórmula
export function csvCell(value:unknown){
 let s=String(value??'');
 if(/^[=+\-@\t\r]/.test(s))s="'"+s;
 return /[;"\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;
}
export function toCsv(rows:unknown[][]){return '﻿'+rows.map(r=>r.map(csvCell).join(';')).join('\r\n')+'\r\n';}
export const formatDate=(value?:string|number)=>{if(value===undefined||value==='')return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString('es-ES',{dateStyle:'short',timeStyle:'short'});};

// Una fila por equipo (o modo individual) y pregunta respondida
export function resultRows(session:Session,questions:Question[],structures:Structure[],teamNames:string[]):string[][]{
 const rows:string[][]=[];
 for(const [key,r] of Object.entries(session.results)){
  if(!r.done)continue;
  const [who,qid]=[key.slice(0,key.indexOf(':')),key.slice(key.indexOf(':')+1)],q=questions.find(x=>x.id===qid);if(!q)continue;
  const team=who==='solo'?'Individual':`Equipo ${teamNames[Number(who)]??Number(who)+1}`;
  let outcome:string,answer=r.answer??'';
  if(q.mode==='explicar')outcome=`Valorada ${r.points}/2`;
  else{
   const right=q.mode==='localizar'?r.answer===q.target:Number(r.answer)===q.correct;
   outcome=r.points>0?(r.everWrong?'Correcta tras fallar':'Correcta'):right?'Correcta con ayudas (sin puntos)':'Incorrecta';
   answer=q.mode==='localizar'?(structures.find(s=>s.id===r.answer)?.name??answer):q.options?.[Number(r.answer)]??answer;
  }
  rows.push([team,activity[q.mode]??q.mode,q.topic,q.prompt,outcome,String(r.points),String(r.tries),r.revealed?(r.layers.join(', ')||'sí'):'',answer,formatDate(r.at)]);
 }
 return rows.sort((a,b)=>a[0].localeCompare(b[0],'es')||a[1].localeCompare(b[1],'es'));
}
export function gameRows(games:GameEntry[]):string[][]{
 return games.map(g=>[g.profile,g.game,'','',g.status,String(g.points),'','','',formatDate(g.at)]);
}
export function classCsv(session:Session,questions:Question[],structures:Structure[],teamNames:string[],games:GameEntry[]){
 return toCsv([CSV_HEADER,...resultRows(session,questions,structures,teamNames),...gameRows(games)]);
}
