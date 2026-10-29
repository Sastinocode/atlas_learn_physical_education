import ts from 'typescript';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
function moduleFrom(file,imports={}){const exports={};const js=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(js,{exports,require:n=>imports[n]});return exports;}
const pc=moduleFrom('app/planes-content.ts');
const c=moduleFrom('app/content.ts',{'./planes-content':pc});
const m=moduleFrom('app/session.ts',{'./content':c});
assert.equal(c.structures.length,32);assert.equal(c.questions.length,42);assert.equal(c.exercises.length,6);
assert.equal(new Set(c.structures.map(x=>x.id)).size,32);assert.equal(new Set(c.questions.map(x=>x.id)).size,42);
for(const [layer,min] of [['muscles',12],['bones',10],['joints',6]])assert.ok(c.structures.filter(x=>x.layer===layer).length>=min);
for(const x of c.structures){assert.ok(x.location&&x.fn&&x.example&&x.kind);assert.ok(Object.keys(x.points).length);for(const p of Object.values(x.points))assert.ok(p.every(n=>Number.isFinite(n)&&n>0&&n<100));}
for(const q of c.questions){assert.ok(q.why&&q.topic);if(q.mode==='localizar')assert.ok(c.structures.some(x=>x.id===q.target));else if(q.exercise)assert.ok(c.exercises.some(x=>x.id===q.exercise));if(q.mode==='relacionar')assert.ok(q.options.length>=3&&q.correct>=0&&q.correct<q.options.length);if(q.mode==='explicar')assert.equal(q.criteria.length,2);}
for(const x of c.exercises)for(const field of ['variant','phase','movement','muscles','bones','joints','control'])assert.ok(x[field]);
const r=m.emptyResult();assert.equal(m.answerResult(r,false,1).points,0);const hit=m.answerResult(r,true,1);assert.equal(hit.points,1);assert.equal(m.answerResult(hit,true,1).points,1);assert.equal(m.answerResult({...r,revealed:true},true,2).points,0);assert.equal(m.answerResult(m.answerResult(r,false,2),true,2).everWrong,true);
const s=m.fresh();for(const q of c.questions)s.results[m.keyFor(s,q.id)]={...m.emptyResult(),done:true,points:q.mode==='localizar'?1:2};assert.equal(m.score(s,0),76);assert.equal(m.score(s,1),0);assert.equal(m.score(s,'solo'),0);assert.equal(JSON.stringify(m.restore(JSON.stringify(s))),JSON.stringify(s));for(const raw of ['bad','null','[]','{"version":4}',JSON.stringify({...s,team:99}),JSON.stringify({...s,results:{'0:l1':{points:Infinity}}})])assert.equal(m.restore(raw).mode,'explorar');
console.log('PASS: 32 fichas, 42 preguntas, 6 ejercicios; referencias, coordenadas, rúbricas, puntuación, no duplicación, ayudas, equipos y restauración.');

const w=moduleFrom('app/workshop-content.ts');
const placed=w.placeMuscle(w.emptyPlacement(),'a','quad','biceps');
assert.equal(placed.a.biceps,'quad');
const moved=w.placeMuscle(placed,'a','quad','quad');
assert.equal(moved.a.biceps,undefined);assert.equal(moved.a.quad,'quad');
assert.equal(w.placeMuscle(moved,'a','lat','quad'),moved);
assert.equal(JSON.stringify(w.restorePlacement(JSON.stringify(moved))),JSON.stringify(moved));
assert.equal(JSON.stringify(w.restorePlacement('invalid')),JSON.stringify(w.emptyPlacement()));
assert.equal(m.restore(JSON.stringify({...s,mode:'relacionar',index:13})).index,13);
assert.equal(m.restore(JSON.stringify({...s,mode:'taller',index:0})).mode,'taller');
console.log('PASS: taller, movimiento sin duplicados, rechazo de fichas ajenas, restauración y nuevos índices.');

const motion=moduleFrom('app/exercise-analysis.ts');
assert.equal(Object.keys(motion.exerciseAnalysis).sort().join(','),c.exercises.map(x=>x.id).sort().join(','));
for(const [id,a] of Object.entries(motion.exerciseAnalysis)){
 assert.ok(c.questions.some(q=>q.id===a.questionId&&q.exercise===id&&q.mode==='explicar'),'Pregunta enlazada al ejercicio correcto');
 assert.ok(a.joints.length>0);assert.equal(new Set(a.joints.map(j=>j.id)).size,a.joints.length);
 for(const j of a.joints)for(const field of ['name','action','returnAction','plane','agonists','antagonists','synergists','stability','nuance'])assert.ok(j[field],`${id}: falta ${field}`);
}
for(let i=0;i<=100;i++){assert.ok(motion.movementAmount(i)>=0&&motion.movementAmount(i)<=1);assert.ok([0,1,2,3].includes(motion.movementPhase(i)));}
assert.equal(motion.movementAmount(0),motion.movementAmount(100));
assert.equal(motion.movementAmount(45),motion.movementAmount(55));
console.log('PASS: seis análisis biomecánicos completos; enlaces a sus rúbricas; ciclo cerrado y recorrido acotado.');

const dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0);
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const norm=a=>Math.hypot(...a);
for(const p of Object.values(pc.planeDefinitions)){
 assert.equal(dot(p.normal,p.u),0);assert.equal(dot(p.normal,p.v),0);assert.equal(dot(p.u,p.v),0);
 assert.equal(norm(p.normal),1);
}
for(const joint of ['hip','shoulder'])for(const motion of pc.planeMotions){
 const origin=pc.jointOrigin(joint),normal=pc.planeDefinitions[motion.plane].normal;
 let lengths;
 for(let t=0;t<=100;t+=5){
  const points=pc.movingLimb(joint,motion.id,t);
  assert.ok(points.flat().every(Number.isFinite));
  const measured=[norm(sub(points[1],points[0])),norm(sub(points[2],points[1]))];
  if(!lengths)lengths=measured;
  measured.forEach((v,i)=>assert.ok(Math.abs(v-lengths[i])<1e-8,'Longitudes constantes durante el gesto'));
  const center=['ir','er'].includes(motion.id)?points[1]:origin;
  assert.ok(Math.abs(dot(sub(points[2],center),normal))<1e-8,'El recorrido pertenece al plano perpendicular al eje');
 }
 assert.ok(c.questions.some(q=>q.id===`plane-${joint}-${motion.id}`&&q.mode==='relacionar'));
}
assert.ok(pc.movingLimb('hip','ir',100)[2][0]>pc.jointOrigin('hip')[0],'Con rodilla flexionada, RI desplaza el pie hacia fuera');
assert.ok(pc.movingLimb('shoulder','ir',100)[2][0]<pc.jointOrigin('shoulder')[0],'RI lleva la mano hacia medial');
const previous={...m.fresh(),results:{'0:r1':{...m.emptyResult(),done:true,points:2}}};
assert.equal(m.restore(JSON.stringify(previous)).results['0:r1'].points,2,'La ampliación conserva resultados previos');
console.log('PASS: tres planos y ejes ortogonales; doce gestos planos, longitudes constantes, rotaciones coherentes y conservación del progreso anterior.');
