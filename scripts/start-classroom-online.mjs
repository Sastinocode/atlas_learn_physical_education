import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createClassroomServer} from './classroom-server.mjs';
const exe=fileURLToPath(new URL('../tools/cloudflared.exe',import.meta.url));
const port=Number(process.env.PORT||4175);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Puerto no válido.');
const dashboard=`http://localhost:${port}/live/`;
function openBrowser(){if(process.platform==='win32'&&process.env.AULA_NO_OPEN!=='1')spawn('powershell.exe',['-NoProfile','-Command',`Start-Process '${dashboard}'`],{windowsHide:true,stdio:'ignore'}).on('error',()=>console.log(`Abre ${dashboard}`));}
try{const info=await fetch(`http://127.0.0.1:${port}/api/info`,{signal:AbortSignal.timeout(1500)}).then(r=>r.json());if(info.service==='movimiento-aula'){console.log('La aplicación ya está abierta. Recuperando el panel…');openBrowser();process.exit(0);}}catch{}
if(!existsSync(exe)){console.error('No se encuentra el conector de internet. Conserva completa la carpeta de la aplicación. Consulta docs/GUIA-AULA-EN-DIRECTO.md.');process.exit(1);}
let address='',tunnel,stopping=false;
const server=createClassroomServer({publicUrl:()=>address,online:true});
server.on('error',e=>{console.error(`No se pudo abrir el servidor: ${e.message}`);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{
 openBrowser();
 console.log(`PANEL DEL PROFESOR: http://localhost:${port}/live/`);
 console.log('Preparando enlace temporal por internet. Mantén esta ventana abierta. Ctrl+C cierra la sesión.');
 tunnel=spawn(exe,['tunnel','--url',`http://127.0.0.1:${port}`,'--protocol','http2','--no-autoupdate'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
 let buffer='';
 const output=data=>{const text=String(data);buffer=(buffer+text).slice(-16000);const match=buffer.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);if(match&&!address){address=match[0];console.log(`ENLACE PÚBLICO TEMPORAL: ${address}/live/`);console.log('Crea una sala en el panel del profesor y copia su enlace, que incluye el código.');}if(/ERR/.test(text))console.error(text.trim());};
 tunnel.stdout.on('data',output);tunnel.stderr.on('data',output);
 tunnel.on('error',e=>{address='';console.error(`No se pudo abrir el enlace: ${e.message}`);server.close();});
 tunnel.on('exit',()=>{address='';if(!stopping)console.error('Enlace público desconectado. Cierra y vuelve a abrir el iniciador para una sesión nueva.');});
});
function stop(){if(stopping)return;stopping=true;tunnel?.kill();server.close(()=>process.exit());setTimeout(()=>process.exit(),2000).unref();}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
