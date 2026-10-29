import ts from 'typescript';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
function moduleFrom(file,imports={}){const exports={};const js=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(js,{exports,require:n=>imports[n]});return exports;}
const c=moduleFrom('app/game-content.ts'),m=moduleFrom('app/game-engine.ts',{'./game-content':c}),a=moduleFrom('app/core-content.ts');
assert.equal(c.gameQuestions.length,10);assert.equal(new Set(c.gameQuestions.map(q=>q.id)).size,10);
for(const q of c.gameQuestions){assert.ok(q.options[q.correct]);assert.ok(q.why.length>40);}
assert.equal(a.coreStructures.length,9);for(const s of a.coreStructures){assert.ok(a.coreLayers.some(l=>l.id===s.layer));assert.ok(s.location&&s.fn&&s.example&&s.limit);}
let r=m.newRun(1,30,1000,'test-1');
r=m.answerRun(r,0,c.gameQuestions[0].correct,2000);assert.equal(r.answers.length,1);assert.equal(m.gameScore(r),100);
const duplicate=m.answerRun(r,0,1,2100);assert.equal(duplicate.answers.length,1);assert.equal(m.gameScore(duplicate),100);
const expired=m.answerRun(r,1,c.gameQuestions[1].correct,32000);assert.equal(expired.answers.length,2);assert.equal(expired.answers[1].choice,null);assert.equal(m.gameScore(expired),100);
const resumed=m.expireRun(m.restoreRun(JSON.stringify(r)),123000);assert.equal(resumed.answers.length,5);assert.equal(resumed.deadline,152000);
const completed=m.expireRun(r,1000000);assert.equal(completed.answers.length,10);assert.equal(m.expireRun(completed,2000000),completed);assert.equal(m.gameScore(completed),100);
let perfect=m.newRun(40,180,1000,'test-perfect');for(let i=0;i<10;i++)perfect=m.answerRun(perfect,i,c.gameQuestions[i].correct,2000+i*1000);assert.equal(m.gameScore(perfect),1000);
assert.equal(m.mergeBoard(m.mergeBoard([],perfect),perfect).length,1);assert.equal(m.mergeBoard([],r).length,0);
for(const invalid of [null,{}, {...r,seconds:0},{...r,profile:999},{...r,set:'OTHER'},{...r,answers:[{choice:999,expired:false}]},{...r,answers:[{choice:0,expired:true}]},{...r,answers:[{choice:null,expired:false}]}])assert.equal(m.parseRun(invalid),null);
assert.equal(m.restoreRun('broken'),null);
for(const time of m.durations){const run=m.newRun(1,time,1000,'same-list');assert.equal(run.set,c.SET_ID);assert.equal(run.deadline,1000+time*1000);}
console.log('PASS: 9 fichas core; 10 preguntas fijas; respuestas, límite exacto de tiempo, doble clic, recarga, múltiples vencimientos, fin de partida, 1000 puntos, validación e importación sin duplicados.');
