import {transform} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const source=await readFile(new URL('../app/game-content.ts',import.meta.url),'utf8');
const result=await transform(source,{loader:'ts',format:'esm'});
await mkdir(new URL('../live/',import.meta.url),{recursive:true});
await writeFile(new URL('../live/question-bank.mjs',import.meta.url),result.code);
console.log('Banco común actualizado para el servidor de aula.');
