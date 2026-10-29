import ts from 'typescript';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
// Igual que tests/verify.mjs: se transpila el .ts y se ejecuta sin servidor.
function moduleFrom(file,imports={}){const exports={};const js=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(js,{exports,require:n=>imports[n]});return exports;}
const src=readFileSync('app/content.ts','utf8');
const m=moduleFrom('app/content.ts',{'./planes-content':moduleFrom('app/planes-content.ts')});
const {structures}=m;
assert.ok(structures.length>=32,'se esperaban al menos 32 fichas');
const fallos=[];
for(const s of structures){
 const f=s.sources||[];
 if(f.length<2){fallos.push(`${s.id}: tiene ${f.length} fuente(s), mínimo 2`);continue;}
 for(const x of f){
  if(!x.label?.trim())fallos.push(`${s.id}: fuente sin etiqueta`);
  if(!/^https:\/\//.test(x.url||''))fallos.push(`${s.id}: la fuente «${x.label}» no tiene enlace https`);
 }
 if(!f.some(x=>x.url?.startsWith('https://openstax.org/books/anatomy-and-physiology-2e/pages/')))fallos.push(`${s.id}: falta OpenStax A&P 2e`);
 if(!f.some(x=>x.url?.startsWith('https://www.kenhub.com/en/library/anatomy/')))fallos.push(`${s.id}: falta Kenhub`);
 if(new Set(f.map(x=>x.label)).size!==f.length)fallos.push(`${s.id}: etiquetas de fuente repetidas`);
}
assert.ok(src.includes('reviewStatus'),'debe existir el hueco de revisión');
assert.deepEqual(fallos,[],'\n'+fallos.join('\n'));
console.log(`PASS fuentes: ${structures.length} fichas con OpenStax y Kenhub, enlaces https y hueco de revisión (reviewer/date) disponible.`);
