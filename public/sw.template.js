const CACHE='atlas-__BUILD__';
// El modelo 3D (atlas3d.js, ~5,7 MB) no se precarga: se guarda al abrir Atlas 3D por primera vez (ver fetch)
const SHELL=['./','./index.html','./atlas.js','./mannequin.js','./atlas.css','./favicon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('atlas-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 const r=e.request;
 const u=new URL(r.url);
 // El aula en directo (/api/ y /live/) siempre va a la red: nunca se guarda
 if(r.method!=='GET'||u.origin!==location.origin||u.pathname.includes('/api/')||u.pathname.includes('/live/'))return;
 e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy));}return res;}).catch(()=>r.mode==='navigate'?caches.match('./index.html'):Response.error())));
});
