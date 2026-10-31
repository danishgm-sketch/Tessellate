/** Preserve a resource's editable JSON contract without accepting arbitrary renderer-breaking values. */
export function assertContentShape(template:unknown,value:unknown,path='content'):void {
 if(Array.isArray(template)){
  if(!Array.isArray(value))throw new Error(`${path} must be an array.`);
  if(template.length)for(const [index,item] of value.entries())assertContentShape(template[0],item,`${path}[${index}]`);
 }else if(template!==null && typeof template==='object'){
  if(value===null || typeof value!=='object' || Array.isArray(value))throw new Error(`${path} must be an object.`);
  for(const [key,child] of Object.entries(template))assertContentShape(child,(value as Record<string,unknown>)[key],`${path}.${key}`);
 }else if(typeof template!==typeof value || (typeof value==='number'&&!Number.isFinite(value)))throw new Error(`${path} must be ${typeof template}.`);
}
