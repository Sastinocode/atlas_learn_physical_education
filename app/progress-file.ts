const PREFIXES=['cuerpo-','movimiento-minijuegos-'];
const FORMAT='cuerpo-en-movimiento-progreso';
const mine=(k:string)=>PREFIXES.some(p=>k.startsWith(p));
export function exportProgress(){
 const data:Record<string,string>={};
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);const v=k&&localStorage.getItem(k);if(k&&mine(k)&&v!==null)data[k]=v;}
 const blob=new Blob([JSON.stringify({format:FORMAT,version:1,date:new Date().toISOString(),data})],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`mi-progreso-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);
 return Object.keys(data).length;
}
export async function importProgress(file:File){
 if(file.size>5_000_000)throw new Error('El archivo es demasiado grande.');
 const parsed=JSON.parse(await file.text());
 if(parsed?.format!==FORMAT||typeof parsed.data!=='object'||!parsed.data)throw new Error('Este archivo no es un progreso de El cuerpo en movimiento.');
 const entries=Object.entries(parsed.data as Record<string,unknown>).filter(([k,v])=>mine(k)&&typeof v==='string');
 if(!entries.length)throw new Error('El archivo no contiene progreso.');
 for(const [k,v] of entries)localStorage.setItem(k,v as string);
 return entries.length;
}
