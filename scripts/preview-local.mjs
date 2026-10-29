import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist-offline/',import.meta.url));
http.createServer((req,res)=>{let p;try{const uri=decodeURIComponent((req.url||'/').split('?')[0]);p=path.resolve(root,'.'+(uri==='/'?'/index.html':uri));}catch{res.writeHead(400);res.end();return;}if(!p.startsWith(path.resolve(root)+path.sep)){res.writeHead(403);res.end();return;}fs.readFile(p,(err,data)=>{if(err){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.json':'application/json'})[path.extname(p)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(data);});}).listen(4174,'127.0.0.1',()=>console.log('http://localhost:4174/'));
