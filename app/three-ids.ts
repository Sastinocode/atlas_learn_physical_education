// Fichas que también existen en el visor 3D (ids de model.json · learning).
// Lista fija para no cargar el modelo de 8 MB en el archivo principal; tests/verify-3d.mjs comprueba que coincide.
export const THREE_IDS=new Set(["pectoral","deltoid","biceps","triceps","oblique","trapezius","glute","glutemed","quad","hamstrings","gastro","soleus","tibant","clavicle","scapula","sternum","humerus","radius","ulna","coxal","femur","patella","tibia","fibula","achilles"]);
