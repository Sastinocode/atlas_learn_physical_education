// Prueba en navegador real: entra en cada modo, en escritorio y en móvil, y falla si algo se rompe.
// Usa el Chrome o Edge instalado (no descarga navegadores). Necesita `npm run build:pages` antes.
import {chromium} from 'playwright-core';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join,extname,resolve} from 'node:path';
import {tmpdir} from 'node:os';

const dist=resolve('dist-offline');
if(!existsSync(join(dist,'index.html'))){console.error('FALLO: no existe dist-offline. Ejecuta antes `npm run build:pages`.');process.exit(1);}

const candidates=[process.env.CHROME_PATH,
 'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe',
 '/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser',
 '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
const executablePath=candidates.find(p=>existsSync(p));
if(!executablePath){console.error('FALLO: no encuentro Chrome ni Edge. Indica la ruta con la variable CHROME_PATH.');process.exit(1);}

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json','.webmanifest':'application/manifest+json'};
const server=createServer(async(req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://x').pathname);
 const file=resolve(join(dist,path==='/'?'index.html':path));
 if(!file.startsWith(dist)){res.writeHead(403).end();return;}
 let body;
 try{body=await readFile(file);}catch{res.writeHead(404).end();return;}
 res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream'}).end(body);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}/`;

const failures=[];
// El modo Juego 10 consulta /api/info para ver si hay aula en directo; sin servidor de aula (como en Pages) da 404 y es normal.
let ignoreInfo=false;
const fail=(where,msg)=>{failures.push(`${where}: ${msg}`);console.error(`  ✗ ${where}: ${msg}`);};
const browser=await chromium.launch({executablePath,headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});

const viewports=[
 {name:'escritorio',options:{viewport:{width:1280,height:800}}},
 {name:'móvil',options:{viewport:{width:375,height:812},isMobile:true,hasTouch:true}}
];
for(const vp of viewports){
 const context=await browser.newContext({...vp.options,acceptDownloads:true,serviceWorkers:'block'});
 const page=await context.newPage();
 let where=`${vp.name} · inicio`;
 let loaded3d=false;
 page.on('request',r=>{if(r.url().endsWith('/atlas3d.js'))loaded3d=true;});
 page.on('pageerror',e=>fail(where,`error de la página: ${e.message}`));
 page.on('console',m=>{if(m.type()==='error'&&!(ignoreInfo&&/404/.test(m.text())))fail(where,`error en consola: ${m.text()}`);});
 page.on('requestfailed',r=>!r.url().endsWith('/api/info')&&fail(where,`no se pudo cargar ${r.url()}`));
 page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/api/info'))fail(where,`respuesta ${r.status()} en ${r.url()}`);});

 await page.goto(url);
 await page.waitForSelector('.mode-nav .mode-chip');
 await page.getByRole('button',{name:/Abrir el atlas/}).click();
 if(loaded3d)fail(where,'el 3D se descarga al abrir la app, debería cargarse solo al entrar en Atlas 3D');
 const chips=page.locator('.mode-nav .mode-chip');
 const total=await chips.count();
 if(total!==11)fail(vp.name,`se esperaban 11 modos y hay ${total}`);
 for(let i=0;i<total;i++){
  const chip=chips.nth(i);
  const name=(await chip.innerText()).split('\n')[0].trim();
  where=`${vp.name} · modo ${name}`;
  ignoreInfo=name==='Juego 10';
  await chip.click();
  await page.waitForTimeout(700);
  if(await chip.getAttribute('data-active')===null)fail(where,'el modo no queda activo al pulsarlo');
  if(name==='Lecciones'){
   try{await page.locator('.lesson-stage .mannequin canvas').first().waitFor({timeout:20000});}catch{fail(where,'no aparece el maniquí 3D de planos y ejes');}
  }
  if(name==='Core'){
   try{await page.locator('.core3d canvas').first().waitFor({timeout:20000});}catch{fail(where,'no aparece el core en 3D');}
  }
  if(name==='Atlas 3D'){
   if(!loaded3d)fail(where,'no se ha pedido atlas3d.js');
   try{await page.locator('main canvas').first().waitFor({timeout:30000});}catch{fail(where,'no aparece el visor 3D (canvas)');}
  }
  const text=(await page.locator('main').innerText()).trim();
  if(text.length<80)fail(where,'la pantalla casi no tiene contenido');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  if(overflow)fail(where,'hay desplazamiento horizontal de la página');
  console.log(`  ✓ ${where}`);
 }

 // Guardar y recuperar progreso
 where=`${vp.name} · guardar y recuperar progreso`;
 await page.evaluate(()=>localStorage.setItem('cuerpo-prueba-navegador','ok'));
 await page.getByRole('button',{name:/Guardar o recuperar mi progreso/}).click();
 const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:/Guardar mi progreso en un archivo/}).click()]);
 const dir=await mkdtemp(join(tmpdir(),'atlas-'));
 const saved=join(dir,'progreso.json');
 await download.saveAs(saved);
 const parsed=JSON.parse(await readFile(saved,'utf8'));
 if(parsed.data?.['cuerpo-prueba-navegador']!=='ok')fail(where,'el archivo guardado no contiene el progreso');
 await page.evaluate(()=>localStorage.removeItem('cuerpo-prueba-navegador'));
 await Promise.all([page.waitForNavigation(),page.locator('input[type=file]').setInputFiles(saved)]);
 const back=await page.evaluate(()=>localStorage.getItem('cuerpo-prueba-navegador'));
 if(back!=='ok')fail(where,'al recuperar el archivo no vuelve el progreso');
 else console.log(`  ✓ ${where}`);
 await writeFile(saved,'{"a":1}');
 await rm(dir,{recursive:true,force:true});
 await context.close();
}
await browser.close();
server.close();
if(failures.length){console.error(`\nFALLO: ${failures.length} problema(s) en el navegador.`);process.exit(1);}
console.log('PASS navegador: 11 modos en escritorio y móvil sin errores (maniquí en Lecciones y Core; el 3D anatómico solo se carga al entrar), y guardado/recuperación de progreso.');
