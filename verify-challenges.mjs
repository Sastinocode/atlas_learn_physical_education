import assert from 'node:assert/strict';
import {challengeSets,points,validRun} from './app/challenge-content.ts';
for(const set of Object.values(challengeSets)){
 assert.equal(set.questions.length,10);
 for(const q of set.questions){assert.ok(q.correct>=0&&q.correct<q.options.length);assert.equal(new Set(q.options).size,q.options.length);assert.ok(q.why.length>40);}
 assert.equal(points(set.questions,set.questions.map(q=>q.correct)),1000);
 assert.equal(points(set.questions,Array(10).fill(null)),0);
 assert.equal(validRun({answers:[999],seconds:60,deadline:0,profile:'Equipo',started:true},set.questions),false);
 assert.equal(validRun({answers:[null],seconds:60,deadline:0,profile:'Equipo',started:true},set.questions),true);
}
console.log('PASS: dos bancos de 10, opciones válidas, puntuación perfecta, tiempos agotados y validación del guardado.');
