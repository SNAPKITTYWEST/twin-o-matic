import test from 'node:test';
import assert from 'node:assert/strict';
import {parseTool,validateTool,createBuildPlan,validateBuildPlan} from '../frontend/src/builder.mjs';
import {detectScene,SCENE_TEMPLATES} from '../frontend/src/templates.mjs';
test('zero positions and light intensity survive validation',()=>{assert.equal(parseTool('TOOL:add_box {"y":0}').args.y,0);assert.equal(validateTool('add_light',{intensity:0}).args.intensity,0)});
test('rejects malformed, unknown and unbounded commands',()=>{for(const line of ['TOOL:eval {}','TOOL:add_box {bad}','TOOL:add_box {"width":-1}','TOOL:add_particles {"count":10000000}'])assert.throws(()=>parseTool(line));assert.throws(()=>validateTool('add_box',{x:Infinity}));});
test('all existing templates obey the command contract',()=>{for(const commands of Object.values(SCENE_TEMPLATES))for(const c of commands)assert.doesNotThrow(()=>parseTool('TOOL:'+c));});
test('scene matching uses words',()=>{assert.equal(detectScene('research something'),null);assert.ok(detectScene('build a city'));});
test('build export roundtrips and excludes preview effects',()=>{const p=createBuildPlan([validateTool('add_box',{y:0}),validateTool('add_light',{})],{id:'test'});assert.equal(p.operations.length,1);assert.deepEqual(validateBuildPlan(JSON.parse(JSON.stringify(p))),p);assert.throws(()=>validateBuildPlan({...p,operations:[{name:'eval',args:{}}]}));});
