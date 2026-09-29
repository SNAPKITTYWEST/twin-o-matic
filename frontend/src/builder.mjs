// Built on Sovereign Source -- Bel Esprit D'Accord Trust
// (c) 2026 Ahmad Ali Parr -- snapkittywest.github.io
export const LIMITS = Object.freeze({objects:128, lights:8, particles:4096, commands:32});
const shapes = {
  add_box:{width:1,height:1,depth:1}, add_sphere:{radius:.7},
  add_cylinder:{radius:.5,height:2}, add_cone:{radius:.6,height:1.5},
  add_torus:{radius:1,tube:.3}
};
export function validateTool(name,args={}) {
  if(!args || typeof args!=='object' || Array.isArray(args)) throw Error('Tool arguments must be an object');
  if(!Object.hasOwn(shapes,name) && !['add_particles','add_light','set_background','reset_scene'].includes(name)) throw Error('Unknown tool: '+name);
  const out={};
  const number=(key,fallback,min,max,integer=false)=>{
    const value=args[key]??fallback;
    if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max||(integer&&!Number.isInteger(value)))throw Error('Invalid '+key);
    out[key]=value;
  };
  if(name==='reset_scene')return {name,args:out};
  const color=args.color??'#5ad1c4';
  if(typeof color!=='string'||!/^#[0-9a-f]{6}$/i.test(color))throw Error('Color must be #RRGGBB');
  out.color=color;
  if(name==='set_background')return {name,args:out};
  for(const key of ['x','y','z'])number(key,key==='y'?1:0,-256,256);
  if(Object.hasOwn(shapes,name))for(const [key,value]of Object.entries(shapes[name]))number(key,value,.02,64);
  if(name==='add_torus'&&out.tube>out.radius)throw Error('Torus tube must not exceed radius');
  if(name==='add_particles'){number('count',200,1,LIMITS.particles,true);number('spread',8,.1,100);}
  if(name==='add_light'){number('intensity',1,0,10);number('distance',15,.1,100);}
  return {name,args:out};
}
export function parseTool(line) {
  const match=line.trim().match(/^TOOL:\s*(\w+)\s*(\{.*\})?\s*$/);
  if(!match)throw Error('Expected TOOL:name {JSON}');
  return validateTool(match[1],match[2]?JSON.parse(match[2]):{});
}
export function createBuildPlan(commands, {id=crypto.randomUUID(),actor='twin-builder',origin={x:0,y:9,z:0}}={}) {
  if(typeof id!=='string'||!id.trim()||id.length>128||typeof actor!=='string'||!actor.trim()||actor.length>64)throw Error('Invalid builder identity');
  if(!origin||typeof origin!=='object')throw Error('Invalid placement origin');
  if(!Array.isArray(commands)||commands.length>LIMITS.objects)throw Error('Too many scene objects');
  const operations=commands.filter(c=>c&&Object.hasOwn(shapes,c.name)).map(c=>validateTool(c.name,c.args));
  if(!operations.length)throw Error('Add a solid shape before exporting a build');
  for(const key of ['x','y','z'])if(!Number.isInteger(origin[key])||Math.abs(origin[key])>1000000)throw Error('Invalid placement origin');
  return {schemaVersion:1,id,actor,units:'voxel',origin,operations};
}
export function validateBuildPlan(plan) {
  if(plan?.schemaVersion!==1||plan.units!=='voxel'||typeof plan.id!=='string'||!plan.id||typeof plan.actor!=='string'||!plan.actor)throw Error('Invalid build plan');
  if(!Array.isArray(plan.operations)||plan.operations.some(c=>!c||!Object.hasOwn(shapes,c.name)))throw Error('Only solid shapes can be imported');
  return createBuildPlan(plan.operations,plan);
}
