"""Extrae una selección docente sin alterar las geometrías de Human Atlas.
Ejecutar desde la raíz del proyecto. Requiere ../human-atlas-reference.
Las correspondencias se declaran, no se deducen por semejanza de nombres.
"""
from pathlib import Path
import json, base64, gzip

root=Path(__file__).resolve().parents[1]
source=root.parent/'human-atlas-reference/public/models'
atlas=json.loads((source/'atlas.json').read_text())
concepts={c['id']:c for c in atlas['concepts']}
mapping=[
 ('pectoral','Pectoral mayor',['FMA34686','FMA34687'],'muscular'),
 ('deltoid','Deltoides',['FMA34676'],'muscular'),
 ('biceps','Bíceps braquial',['FMA37682','FMA37683'],'muscular'),
 ('triceps','Tríceps braquial',['FMA37692','FMA37693','FMA37694'],'muscular'),
 ('oblique','Oblicuo externo',['FMA13335'],'muscular'),
 ('trapezius','Trapecio',['FMA32555','FMA32556','FMA32557'],'muscular'),
 ('glute','Glúteo mayor',['FMA22314'],'muscular'),
 ('glutemed','Glúteo medio',['FMA22315'],'muscular'),
 ('quad','Cuádriceps femoral',['FMA22429'],'muscular'),
 ('hamstrings','Isquiotibiales',['FMA45881','FMA22357','FMA22438'],'muscular'),
 ('gastro','Gastrocnemio',['FMA45950'],'muscular'),
 ('soleus','Sóleo',['FMA22542'],'muscular'),
 ('tibant','Tibial anterior',['FMA22532'],'muscular'),
 ('clavicle','Clavícula',['FMA13321'],'skeletal'),
 ('scapula','Escápula',['FMA13394'],'skeletal'),
 ('sternum','Esternón',['FMA7485'],'skeletal'),
 ('humerus','Húmero',['FMA13303'],'skeletal'),
 ('radius','Radio',['FMA23463'],'skeletal'),
 ('ulna','Cúbito',['FMA23466'],'skeletal'),
 ('coxal','Coxal',['FMA16585'],'skeletal'),
 ('femur','Fémur',['FMA9611'],'skeletal'),
 ('patella','Rótula',['FMA24485'],'skeletal'),
 ('tibia','Tibia',['FMA24476'],'skeletal'),
 ('fibula','Peroné',['FMA24479'],'skeletal'),
 ('achilles','Tendón calcáneo (Aquiles)',['FMA51061'],'connective'),
]
learning=[]
members={}
for id,name,refs,system in mapping:
    elements=sorted(set(e for ref in refs for e in concepts[ref]['elements']))
    learning.append(dict(id=id,name=name,elements=elements,sourceIds=refs,system=system))
    for e in elements:
        assert e not in members
        members[e]=(name,system,id)
# El sistema skeletal del original contiene músculos mal clasificados.
# El resto del esqueleto se conserva solo como contexto, excluyendo tejidos
# blandos identificados y cartílagos. No se inventan fichas de esas piezas.
exclude=('gingiva','fibularis','tibialis','iliotibial','subscapularis','levator','cartilage')
parts=[dict(p) for p in atlas['parts'] if p['id'] in members or
       (p['system']=='skeletal' and not any(w in p['name'].lower() for w in exclude))]
buffers={}
out=bytearray()
for p in parts:
    original=next(q for q in atlas['parts'] if q['id']==p['id'])
    ci=p['chunk']
    if ci not in buffers:buffers[ci]=(source/Path(atlas['chunks'][ci]['url']).name).read_bytes()
    for key,size in [('positions',p['vertexCount']*12),('normals',p['vertexCount']*6),('indices',p['indexCount']*4)]:
        while len(out)%4:out.append(0)
        start=original[key];p[key]=len(out)
        out.extend(buffers[ci][start:start+size])
    p['chunk']=0
    p['sourceName']=p['name']
    if p['id'] in members:
        name,system,id=members[p['id']]
        side=' · derecha' if 'right' in p['name'].lower() else ' · izquierda' if 'left' in p['name'].lower() else ''
        p['name']=name+side;p['system']=system
    else:p['name']='Contexto óseo · '+p['name']
assert all(set(c['elements'])<=set(p['id'] for p in parts) for c in learning)
encoded='data:application/gzip;base64,'+base64.b64encode(gzip.compress(bytes(out),mtime=0)).decode()
result=dict(version='tseas-curated-1',sex='male',parts=parts,concepts=[],learning=learning,
            chunks=[dict(url="",gzip=encoded,bytes=len(out))],
            triangles=sum(p['indexCount']//3 for p in parts))
(root/'app/three/model.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(f"{len(learning)} fichas 3D, {len(parts)} mallas, {len(out)} bytes; geometría comprimida {len(encoded)} caracteres.")
