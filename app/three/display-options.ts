import type {SystemId} from './anatomy';
export type LayerOpacity=Partial<Record<SystemId,number>>;
export function opacityFor(values:LayerOpacity|undefined,id:SystemId){const n=values?.[id];return typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(1,n)):1;}
export function renderRatio(lightweight:boolean,deviceRatio:number,compact:boolean){return lightweight?1:Math.min(deviceRatio,compact?1.5:2);}
/** Coalesce events; stop scheduling as soon as the scene settles. */
export function createDemandLoop(step:()=>boolean,request:(cb:()=>void)=>number,cancel:(id:number)=>void,hidden:()=>boolean){
 let frame:number|null=null,disposed=false;
 const invalidate=()=>{if(disposed||frame!==null||hidden())return;frame=request(()=>{frame=null;if(disposed||hidden())return;if(step())invalidate();});};
 return {invalidate,dispose(){disposed=true;if(frame!==null)cancel(frame);frame=null;}};
}
