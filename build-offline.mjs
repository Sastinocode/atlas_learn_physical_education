import {build} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import {fileURLToPath} from 'node:url';
import {copyFileSync,writeFileSync,mkdirSync,cpSync} from 'node:fs';
const root=fileURLToPath(new URL('.',import.meta.url));
await build({configFile:false,root,publicDir:false,define:{'process.env.NODE_ENV':'"production"'},plugins:[react()],resolve:{alias:{'@':root}},css:{postcss:{plugins:[tailwindcss()]}},build:{outDir:'dist-offline',emptyOutDir:true,lib:{entry:root+'offline-entry.tsx',name:'AtlasTseas',formats:['iife'],fileName:()=> 'atlas.js',cssFileName:'atlas'},cssCodeSplit:false}});
cpSync(root+'public/credits',root+'dist-offline/credits',{recursive:true});
copyFileSync(root+'GUIA-AULA-EN-DIRECTO.md',root+'dist-offline/GUIA-AULA-EN-DIRECTO.md');
copyFileSync(root+'GUIA-CORE-Y-JUEGO.md',root+'dist-offline/GUIA-CORE-Y-JUEGO.md');
copyFileSync(root+'LEEME.md',root+'dist-offline/LEEME.md');
copyFileSync(root+'TUTORIAL-PROFESOR-Y-ALUMNADO.md',root+'dist-offline/TUTORIAL-PROFESOR-Y-ALUMNADO.md');
writeFileSync(root+'dist-offline/index.html',`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>El cuerpo en movimiento · TSEAS</title><meta name="description" content="Atlas corporal interactivo y retos de anatomía funcional"><link rel="stylesheet" href="./atlas.css"></head><body><div id="root"></div><script src="./atlas.js"></script></body></html>`);
console.log('Versión sin conexión lista en dist-offline/index.html');

for (const doc of ['README.md','APRENDER-PLANOS-PALANCAS.md','JUEGOS-PLANOS-PALANCAS.md','THIRD-PARTY-NOTICES.md','COMPROBACIONES.md','REVISION-BODY-ATLAS-3D.md']) copyFileSync(root+doc,root+'dist-offline/'+doc);
writeFileSync(root+'dist-offline/.nojekyll','');
