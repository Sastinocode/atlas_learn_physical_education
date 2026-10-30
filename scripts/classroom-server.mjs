import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {randomBytes,randomInt} from 'node:crypto';
import {networkInterfaces} from 'node:os';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
import {gameQuestions,SET_ID} from '../live/question-bank.mjs';
import QRCode from 'qrcode';

// Archivos de la app (dist-offline) que el ordenador del profesor puede pedir: todo lo de esa carpeta y nada de fuera
const APP_DIR=fileURLToPath(new URL('../dist-offline/',import.meta.url));
const APP_TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.md':'text/markdown; charset=utf-8','.txt':'text/plain; charset=utf-8'};
function appAsset(pathname){
 let file;try{file=resolve(APP_DIR,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));}catch{return null;}
 if(!file.startsWith(APP_DIR.endsWith(sep)?APP_DIR:APP_DIR+sep)||!APP_TYPES[extname(file)])return null;
 return [file,APP_TYPES[extname(file)]];
}
const token=()=>randomBytes(24).toString('hex');
const allowedTimes=[15,30,45,60,90,120,180];
const local=req=>['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress)&&/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host||'')&&!req.headers['cf-connecting-ip']&&!req.headers['x-forwarded-for'];
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
export function createClassroomServer({now=Date.now,publicUrl=()=>'',online=false}={}){
 const rooms=new Map();
 const ips=Object.values(networkInterfaces()).flat().filter(x=>x&&x.family==='IPv4'&&!x.internal).map(x=>x.address);
 function tick(room){if(room.phase==='question'&&now()>=room.deadline)room.phase='review';}
 function find(code){const r=rooms.get(code);if(!r)fail('Sala no disponible. Comprueba el código o pide un enlace nuevo.',404);tick(r);return r;}
 function auth(room,key){if(key===room.host)return {host:true};const player=room.players.find(p=>p.token===key);if(!player)fail('Vuelve a entrar con el enlace de la sala.',401);return {host:false,player};}
 const score=p=>p.answers.reduce((n,a,i)=>n+(a===gameQuestions[i]?.correct?100:0),0);
 function view(room,who){
  const publicAddress=publicUrl();
  if(who.host&&publicAddress&&room.qrAddress!==publicAddress){
   const qr=QRCode.create(`${publicAddress}/live/?room=${room.code}`,{errorCorrectionLevel:'M'}),size=qr.modules.size;
   let d='';for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(qr.modules.get(y,x))d+=`M${x+4} ${y+4}h1v1h-1z`;
   room.qrSvg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size+8} ${size+8}" role="img" aria-label="Escanea este código QR para entrar en la sala" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="white"/><path d="${d}" fill="black"/></svg>`;room.qrAddress=publicAddress;
  }
  const index=room.index,q=gameQuestions[index],reveal=room.revealed||room.phase==='finished';
  const sorted=[...room.players].sort((a,b)=>score(b)-score(a)||a.order-b.order);
  let previous=-1,rank=0;
  const ranking=sorted.map((p,i)=>{const points=score(p);if(points!==previous)rank=i+1;previous=points;return {id:p.id,alias:p.alias,score:points,rank,answered:Number.isInteger(p.answers[index]),connected:now()-p.seen<15000};});
  return {code:room.code,set:SET_ID,phase:room.phase,index,total:gameQuestions.length,seconds:room.seconds,deadline:room.deadline,serverNow:now(),revealed:reveal,ranking,answered:ranking.filter(p=>p.answered).length,
   question:q?{id:q.id,topic:q.topic,prompt:q.prompt,options:q.options,...(reveal?{correct:q.correct,why:q.why}:{})}:null,
   me:who.player?{id:who.player.id,alias:who.player.alias,score:score(who.player),choice:who.player.answers[index]??null}:null,
   ...(who.host?{addresses:online?[]:ips,publicUrl:publicAddress,online,qrSvg:publicAddress?room.qrSvg:''}:{}),
   ...(room.phase==='finished'?{corrections:gameQuestions.map((q,i)=>({...q,choice:who.player?.answers[i]??null}))}:{})};
 }
 async function body(req){let data='';for await(const chunk of req){data+=chunk;if(data.length>4096)fail('Petición demasiado grande.',413);}try{return JSON.parse(data||'{}');}catch{fail('Formato incorrecto.');}}
 const server=http.createServer(async(req,res)=>{
  const send=(value,status=200)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname.startsWith('/api/')){
    // Same-origin only: no external site can create/control a local classroom.
    if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)fail('Origen no permitido.',403);
    if(req.method==='GET'&&url.pathname==='/api/info')return send({service:'movimiento-aula',canHost:local(req),set:SET_ID});
    if(req.method==='POST'&&url.pathname==='/api/rooms'){
     if(!local(req))fail('Crea la sala desde localhost en el ordenador del profesor.',403);
     const b=await body(req);if(!allowedTimes.includes(b.seconds))fail('Tiempo no válido.');
     if(rooms.size>=20)fail('Cierra alguna sala antes de crear otra.');
     let code;do{code=String(randomInt(100000,1000000));}while(rooms.has(code));
     const room={code,host:token(),seconds:b.seconds,phase:'lobby',index:-1,deadline:0,revealed:false,created:now(),players:[]};rooms.set(code,room);
     return send({code,token:room.host});
    }
    const match=url.pathname.match(/^\/api\/rooms\/(\d{6})(?:\/(join|answer|control|export))?$/);if(!match)fail('Ruta no disponible.',404);
    const room=find(match[1]),action=match[2];
    if(req.method==='POST'&&action==='join'){
     if(room.phase!=='lobby')fail('La partida ya ha empezado. Solo pueden volver quienes ya entraron.');
     const b=await body(req),alias=typeof b.alias==='string'?b.alias.normalize('NFKC').trim().replace(/\s+/g,' '):'';
     if(!/^[\p{L}\p{N} _-]{2,20}$/u.test(alias))fail('Usa un alias de 2 a 20 letras, números, espacios o guiones.');
     if(room.players.length>=60)fail('Sala completa (60 participantes).');
     if(room.players.some(p=>p.alias.toLocaleLowerCase('es')===alias.toLocaleLowerCase('es')))fail('Ese alias ya está en uso. Elige otro.');
     const p={id:token().slice(0,12),token:token(),alias,order:room.players.length,answers:[],seen:now()};room.players.push(p);return send({code:room.code,token:p.token});
    }
    const key=(req.headers.authorization||'').replace(/^Bearer /,''),who=auth(room,key);if(who.player)who.player.seen=now();
    if(req.method==='GET'&&!action)return send(view(room,who));
    if(req.method==='POST'&&action==='answer'){
     if(!who.player)fail('Solo responde el alumnado.',403);
     const b=await body(req);tick(room);
     if(room.phase!=='question'||b.index!==room.index)fail('El plazo de esta pregunta ha terminado.');
     if(Number.isInteger(who.player.answers[room.index]))fail('Tu respuesta ya está registrada.');
     if(!Number.isInteger(b.choice)||b.choice<0||b.choice>=gameQuestions[room.index].options.length)fail('Opción no válida.');
     who.player.answers[room.index]=b.choice;return send(view(room,who));
    }
    if(req.method==='POST'&&action==='control'){
     if(!who.host)fail('Acción reservada al profesor.',403);const b=await body(req);
     if(b.action==='close'){rooms.delete(room.code);return send({closed:true});}
     if(b.action==='remove'&&room.phase==='lobby'){room.players=room.players.filter(p=>p.id!==b.id);return send(view(room,who));}
     if(b.action==='start'&&room.phase==='lobby'&&room.players.length){room.index=0;room.phase='question';room.deadline=now()+room.seconds*1000;}
     else if(b.action==='end'&&room.phase==='question'){room.phase='review';}
     else if(b.action==='reveal'&&room.phase==='review'){room.revealed=true;}
     else if(b.action==='next'&&room.phase==='review'){
      if(room.index===gameQuestions.length-1)room.phase='finished';
      else{room.index++;room.phase='question';room.revealed=false;room.deadline=now()+room.seconds*1000;}
     }else fail('Ese control no está disponible en este momento.');
     return send(view(room,who));
    }
    if(req.method==='GET'&&action==='export'&&who.host)return send({set:SET_ID,code:room.code,seconds:room.seconds,phase:room.phase,results:room.players.map(p=>({alias:p.alias,score:score(p),answers:gameQuestions.map((_,i)=>p.answers[i]??null)}))});
    fail('Acción no disponible.',405);
   }
   if(req.method!=='GET')fail('Método no permitido.',405);
   if(!local(req)&&url.pathname==='/'){res.writeHead(302,{Location:'/live/'});return res.end();}
   if(!local(req)&&!url.pathname.startsWith('/live/'))fail('Página no disponible.',404);
   const assets={'/live/':['../live/index.html','text/html; charset=utf-8'],'/live/app.js':['../live/app.js','text/javascript; charset=utf-8'],'/live/style.css':['../live/style.css','text/css']};
   const live=assets[url.pathname],asset=live?[fileURLToPath(new URL(live[0],import.meta.url)),live[1]]:appAsset(url.pathname);if(!asset)fail('Página no disponible.',404);
   let data;try{data=await readFile(asset[0]);}catch{fail('Página no disponible.',404);}
   // Marca para que el Juego 10 sepa que hay aula en directo (sin ella no consulta /api/info)
   if(url.pathname==='/')data=Buffer.from(data.toString('utf8').replace('<head>','<head><meta name="aula-en-directo" content="1">'));res.writeHead(200,{'Content-Type':asset[1],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(data);
  }catch(e){send({error:e.status?e.message:'No se ha podido completar la petición.'},e.status||500);}
 });
 const cleanup=setInterval(()=>{for(const [id,r] of rooms)if(now()-r.created>6*3600000)rooms.delete(id);},60000);cleanup.unref();server.on('close',()=>clearInterval(cleanup));
 return server;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||4175);createClassroomServer().listen(port,'0.0.0.0',()=>{
  console.log(`Profesor: http://localhost:${port}/live/`);
  console.log('Móviles: comparte el enlace de sala de la pantalla. Misma wifi. Mantén este proceso abierto.');
 });
}
