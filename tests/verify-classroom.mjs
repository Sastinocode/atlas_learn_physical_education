import assert from 'node:assert/strict';
import {createClassroomServer} from '../scripts/classroom-server.mjs';
let time=100000;const server=createClassroomServer({now:()=>time,online:true,publicUrl:()=>'https://aula.example'});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
async function call(path,{body,token,headers={}}={}){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...headers,...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};}
try{
 // La página que sirve el servidor del aula lleva la marca que activa la consulta del Juego 10
 assert.ok((await (await fetch(base+'/')).text()).includes('<meta name="aula-en-directo" content="1">'),'La página del aula lleva la marca');
 assert.equal((await call('/api/info',{headers:{'cf-connecting-ip':'1.2.3.4'}})).data.canHost,false);
 assert.equal((await call('/api/rooms',{body:{seconds:15},headers:{'cf-connecting-ip':'1.2.3.4'}})).status,403);
 assert.equal((await call('/api/rooms',{body:{seconds:15},headers:{Origin:'https://evil.example'}})).status,403);
 const host=(await call('/api/rooms',{body:{seconds:15}})).data,route=`/api/rooms/${host.code}`;
 assert.equal((await call(route)).status,401);
 const one=(await call(route+'/join',{body:{alias:'Lince 01'}})).data;
 assert.equal((await call(route+'/join',{body:{alias:'lince 01'}})).status,400);
 assert.equal((await call(route+'/join',{body:{alias:'<script>'}})).status,400);
 const two=(await call(route+'/join',{body:{alias:'Lince 02'}})).data;
 assert.equal((await call(route+'/control',{token:one.token,body:{action:'start'}})).status,403);
 let state=(await call(route+'/control',{token:host.token,body:{action:'start'}})).data;
 assert.ok(state.qrSvg.includes('<svg'));assert.equal(state.addresses.length,0);assert.equal(state.publicUrl,'https://aula.example');assert.equal(state.phase,'question');assert.equal(state.question.correct,undefined);assert.equal(state.question.why,undefined);
 assert.equal((await call(route+'/join',{body:{alias:'Tardío'}})).status,400);
 const responses=await Promise.all([one,two].map(p=>call(route+'/answer',{token:p.token,body:{index:0,choice:0}})));
 assert.ok(responses.every(r=>r.status===200));
 assert.equal((await call(route+'/answer',{token:one.token,body:{index:0,choice:1}})).status,400);
 state=(await call(route,{token:host.token})).data;assert.equal(state.answered,2);assert.ok(state.ranking.every(p=>p.score===100&&p.rank===1));
 time+=15000;state=(await call(route,{token:one.token})).data;assert.equal(state.phase,'review');assert.equal(state.me.choice,0);assert.equal(state.qrSvg,undefined);assert.equal(state.question.correct,undefined);
 state=(await call(route+'/control',{token:host.token,body:{action:'reveal'}})).data;assert.equal(state.question.correct,0);assert.ok(state.question.why);
 for(let i=1;i<10;i++){state=(await call(route+'/control',{token:host.token,body:{action:'next'}})).data;assert.equal(state.index,i);assert.equal(state.question.correct,undefined);time+=15000;assert.equal((await call(route+'/answer',{token:two.token,body:{index:i,choice:0}})).status,400);}
 state=(await call(route+'/control',{token:host.token,body:{action:'next'}})).data;assert.equal(state.phase,'finished');assert.equal(state.corrections.length,10);
 const exported=(await call(route+'/export',{token:host.token})).data;assert.equal(exported.results.length,2);assert.equal(exported.results[0].answers[9],null);assert.equal(exported.results[0].score,100);assert.equal(JSON.stringify(exported).includes(one.token),false);
 assert.equal((await call(route+'/export',{token:one.token})).status,405);
 await call(route+'/control',{token:host.token,body:{action:'close'}});assert.equal((await call(route,{token:one.token})).status,404);
 console.log('OK: dos participantes, empate, 10 preguntas, tiempos, reconexión, permisos, exportación y cierre.');
}finally{await new Promise(resolve=>server.close(resolve));}
