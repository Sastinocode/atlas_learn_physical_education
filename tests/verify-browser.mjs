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

 // Laboratorio de movimiento: codo, rodilla y tobillo con sus grados finales
 where=`${vp.name} · laboratorio de movimiento`;
 await page.locator('.mode-nav .mode-chip',{hasText:'Taller'}).click();
 await page.getByRole('tab',{name:/Planos y ejes/}).or(page.getByRole('button',{name:/^Planos y ejes$/})).first().click();
 await page.locator('.planes-visual .mannequin canvas').first().waitFor({timeout:20000}).catch(()=>fail(where,'no aparece el maniquí del laboratorio'));
 for(const [joint,motion,degrees] of [['Codo','FLEX','145°'],['Codo','EXT','0°'],['Rodilla','FLEX','135°'],['Rodilla','EXT','0°'],['Tobillo','FD','20°'],['Tobillo','FP','50°']]){
  where=`${vp.name} · laboratorio ${joint} ${motion}`;
  await page.locator('.lab-joints button',{hasText:joint}).click();
  await page.locator('.planes-motions button',{hasText:motion}).first().click();
  await page.locator('.lab-slider input').fill('100');
  await page.waitForTimeout(400);
  const shown=(await page.locator('.planes-visual .mannequin-angle').innerText()).trim();
  if(shown!==degrees)fail(where,`el arco marca ${shown} y debería marcar ${degrees}`);
  else console.log(`  ✓ ${where} · ${shown}`);
 }

 // Ejercicios en el maniquí 3D: poses al subir y enlace a la ficha
 for(const [name,top,ficha] of [['Sentadilla','Rodilla · 0° flexión','Cuádriceps femoral'],['Zancada','Cadera · 20° flexión',null],['Press de hombros','Hombro · 170° elevación',null]]){
  where=`${vp.name} · ejercicio ${name} en 3D`;
  await page.locator('.mode-nav .mode-chip',{hasText:'Explorar'}).click();
  await page.locator('.exercise-card',{hasText:name}).click();
  await page.getByRole('button',{name:'Maniquí 3D'}).click();
  try{await page.locator('.exercise3d canvas').first().waitFor({timeout:20000});}catch{fail(where,'no aparece el maniquí del ejercicio');}
  await page.locator('.lab-slider input').fill('50');await page.waitForTimeout(500);
  const tags=await page.locator('.joint-tag').allInnerTexts();
  if(!tags.some(t=>t.includes(top)))fail(where,`arriba debería verse «${top}» y se ve: ${tags.join(' | ')}`);else console.log(`  ✓ ${where}`);
  if(ficha){
   await page.getByRole('button',{name:new RegExp('Ver ficha · '+ficha)}).click();
   const card=await page.locator('.detail-panel').innerText();
   if(!card.includes(ficha))fail(where,'«Ver ficha» no abre la ficha en Explorar');else console.log(`  ✓ ${vp.name} · Ver ficha abre ${ficha}`);
  }else{await page.keyboard.press('Escape');await page.waitForTimeout(300);}
 }

 // Core · transmisión y estabilidad en 3D: tres casos, etiquetas de algunos pasos
 where=`${vp.name} · core transmisión y estabilidad`;
 await page.locator('.mode-nav .mode-chip',{hasText:'Core'}).click();
 await page.getByRole('button',{name:/Transmisión y estabilidad/}).click();
 try{await page.locator('.stability3d canvas').first().waitFor({timeout:20000});}catch{fail(where,'no aparece el 3D de la pestaña');}
 for(const [name,stepIndex,text] of [['Empuje de pie',3,'Empuje sobre la caja'],['Carga unilateral',0,'Peso de la maleta'],['Plancha de antebrazos',2,'Trabajo isométrico']]){
  await page.getByRole('button',{name,exact:true}).click();
  await page.locator('.core-chain > button').nth(stepIndex).click();
  // El 3D se pausa fuera de pantalla: se vuelve a mostrar antes de leer sus etiquetas
  await page.locator('.stability3d').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
  const shown=await page.locator('.stability-tag').allInnerTexts();
  if(!shown.some(t=>t.includes(text)))fail(where,`${name}, paso ${stepIndex+1}: falta «${text}» (se ve: ${shown.join(' | ')})`);else console.log(`  ✓ ${where} · ${name} paso ${stepIndex+1}`);
 }

 // Visor 3D solo con teclado: enfocar, girar, volver de frente y elegir desde la lista
 where=`${vp.name} · visor 3D con teclado`;
 await page.locator('.mode-nav .mode-chip',{hasText:'Atlas 3D'}).click();
 await page.waitForFunction(()=>document.querySelector('.three-canvas canvas')&&!document.querySelector('.three-loading'),null,{timeout:60000}).catch(()=>fail(where,'el modelo no termina de cargar'));
 const canvas3d=page.locator('.three-canvas canvas');
 await canvas3d.focus();
 if(!(await canvas3d.evaluate(el=>el===document.activeElement)))fail(where,'el modelo no recibe el foco');
 await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');
 const angle1=await canvas3d.getAttribute('data-azimuth');await page.keyboard.press('ArrowRight');const angle2=await canvas3d.getAttribute('data-azimuth');
 if(angle1===null||angle1===angle2)fail(where,`las flechas no giran el modelo (${angle1} → ${angle2})`);
 await page.keyboard.press('Home');await page.waitForTimeout(300);
 if(!(await page.locator('.three-announce').innerText()).includes('Vista anterior'))fail(where,'Inicio no anuncia la vista de frente');
 const item=page.locator('.three-list button',{hasText:'Deltoides'});await item.focus();await page.keyboard.press('Enter');await page.waitForTimeout(300);
 const said=await page.locator('.three-announce').innerText();
 if(!said.startsWith('Deltoides seleccionado.'))fail(where,`no se anuncia la estructura elegida (${said})`);else console.log(`  ✓ ${where} · giro, Inicio y «${said.slice(0,40)}…»`);

 // Repaso rápido y exportación de resultados (CSV para Excel)
 where=`${vp.name} · repaso rápido`;
 await page.locator('.mode-nav .mode-chip',{hasText:'Relacionar'}).click();
 await page.getByRole('radio').first().click();
 await page.getByRole('button',{name:/Comprobar respuesta/}).click();
 await page.getByRole('button',{name:'Profesor'}).click();
 await page.getByRole('button',{name:/Repaso rápido/}).click();
 for(let i=0;i<10;i++){await page.getByRole('button',{name:'Mostrar respuesta'}).click();await page.getByRole('button',{name:/La clase (acierta|falla)/}).nth(i%2).click();}
 const summary=await page.locator('.review-summary').innerText().catch(()=>'');
 if(!/5\s*de 10 acertadas/.test(summary))fail(where,'el resumen del repaso no muestra 5 de 10');else console.log(`  ✓ ${where} · 5 de 10`);
 await page.getByRole('button',{name:'Cerrar'}).last().click();
 where=`${vp.name} · exportar resultados`;
 await page.getByRole('button',{name:'Profesor'}).click();
 const [csvFile]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:/Exportar resultados/}).click()]);
 const csvDir=await mkdtemp(join(tmpdir(),'atlas-csv-'));const csvPath=join(csvDir,'r.csv');await csvFile.saveAs(csvPath);
 const csvText=await readFile(csvPath,'utf8');await rm(csvDir,{recursive:true,force:true});
 if(!csvText.startsWith('\uFEFFEquipo o perfil;Actividad;Tema'))fail(where,'el archivo no empieza con la cabecera esperada y BOM');
 else if(!csvText.includes(';Relacionar;'))fail(where,'el archivo no incluye la respuesta de Relacionar');
 else console.log(`  ✓ ${where} · ${csvFile.suggestedFilename()}`);
 await page.keyboard.press('Escape');await page.waitForTimeout(300);

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
{
 const ctx=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce',serviceWorkers:'block'});const pg=await ctx.newPage();
 await pg.goto(url);await pg.getByRole('button',{name:/Abrir el atlas/}).click();
 await pg.locator('.mode-nav .mode-chip',{hasText:'Lecciones'}).click();
 await pg.locator('.lesson-stage .mannequin canvas').first().waitFor({timeout:20000});await pg.waitForTimeout(800);
 const a=await pg.locator('.lesson-stage .mannequin-angle').innerText();await pg.waitForTimeout(900);const b=await pg.locator('.lesson-stage .mannequin-angle').innerText();
 if(a!==b)fail('reducir movimiento',`el maniquí sigue animándose (${a} → ${b})`);else console.log(`  ✓ reducir movimiento · maniquí quieto en ${a}`);
 await ctx.close();
}
{
 // App instalable: el modelo 3D no se guarda hasta que se abre Atlas 3D
 const ctx=await browser.newContext({viewport:{width:1280,height:800}});const pg=await ctx.newPage();
 await pg.goto(url);await pg.evaluate(()=>navigator.serviceWorker.ready);await pg.waitForTimeout(1500);
 const cached=()=>pg.evaluate(async()=>{const out=[];for(const k of await caches.keys())for(const r of await (await caches.open(k)).keys())out.push(new URL(r.url).pathname);return out;});
 const before=await cached();
 if(!before.includes('/atlas.js'))fail('app instalable','no se ha guardado la app para usarla sin conexión');
 else if(before.includes('/atlas3d.js'))fail('app instalable','el modelo 3D se descarga antes de usarlo');
 await pg.getByRole('button',{name:/Abrir el atlas/}).click();await pg.locator('.mode-nav .mode-chip',{hasText:'Atlas 3D'}).click();
 await pg.waitForFunction(()=>document.querySelector('.three-canvas canvas')&&!document.querySelector('.three-loading'),null,{timeout:60000});await pg.waitForTimeout(1000);
 const after=await cached();
 if(!after.includes('/atlas3d.js'))fail('app instalable','tras abrir Atlas 3D el modelo no queda guardado para usarlo sin conexión');
 else console.log('  ✓ app instalable · el 3D se guarda solo al usarlo');
 await ctx.close();
}
await browser.close();
server.close();
if(failures.length){console.error(`\nFALLO: ${failures.length} problema(s) en el navegador.`);process.exit(1);}
console.log('PASS navegador: 11 modos, laboratorio de codo, rodilla y tobillo, ejercicios en 3D, core en estabilidad, repaso rápido, exportación a Excel, visor 3D con teclado y 3D guardado solo al usarlo, en escritorio y móvil sin errores (maniquí en Lecciones y Core; el 3D anatómico solo se carga al entrar), y guardado/recuperación de progreso.');
