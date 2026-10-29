import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
const m=JSON.parse(readFileSync('app/three/model.json','utf8'));
// La lista fija de app/three-ids.ts (botón «Ver en 3D» de Explorar) debe coincidir con las fichas del modelo
assert.deepEqual(JSON.parse(readFileSync('app/three-ids.ts','utf8').match(/new Set\((\[.*\])\)/)[1]).sort(),m.learning.map(l=>l.id).sort(),'app/three-ids.ts no coincide con las fichas del modelo 3D');
assert.equal(m.learning.length,25);
assert.equal(m.parts.length,313);
assert.equal(new Set(m.parts.map(p=>p.id)).size,m.parts.length);
const bytes=gunzipSync(Buffer.from(m.chunks[0].gzip.split(',')[1],'base64'));
assert.equal(bytes.length,m.chunks[0].bytes);
for(const p of m.parts){
 for(const [key,size] of [['positions',p.vertexCount*12],['normals',p.vertexCount*6],['indices',p.indexCount*4]]){
  assert.equal(p[key]%4,0);assert.ok(p[key]+size<=bytes.length);
 }
 for(let i=0;i<p.indexCount;i++)assert.ok(bytes.readUInt32LE(p.indices+4*i)<p.vertexCount);
 for(let i=0;i<p.vertexCount*3;i++)assert.ok(Number.isFinite(bytes.readFloatLE(p.positions+4*i)));
}
for(const c of m.learning){
 assert.ok(c.sourceIds.length);assert.ok(c.elements.length);
 assert.equal(new Set(c.elements).size,c.elements.length);
 for(const id of c.elements){const p=m.parts.find(p=>p.id===id);assert.ok(p);assert.equal(p.system,c.system);}
}
assert.equal(m.parts.find(p=>p.id==='FJ1439').system,'muscular');
assert.equal(m.learning.find(c=>c.id==='quad').elements.length,8);
assert.equal(m.learning.find(c=>c.id==='achilles').elements.length,2);
assert.ok(m.parts.filter(p=>p.system==='skeletal').every(p=>!['gingiva','tibialis','fibularis','cartilage'].some(w=>p.sourceName.toLowerCase().includes(w))));
console.log('PASS 3D: 25 fichas, 313 mallas, descompresión, alineación, vértices, índices, referencias y clasificación docente.');
