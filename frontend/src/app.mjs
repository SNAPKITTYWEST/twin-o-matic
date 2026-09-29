import {SceneEngine} from './scene.mjs';
import {parseTool,createBuildPlan,validateBuildPlan,LIMITS} from './builder.mjs';
import {SCENE_TEMPLATES,detectScene} from './templates.mjs';
import {TOOLS_DESCRIPTION} from './prompt.mjs';
const $=id=>document.getElementById(id);
export class TwinOMatic {
  constructor(){this.engine=null;this.busy=false;this.loading=false;this.cancelled=false;this.placement={actor:'twin-builder',origin:{x:0,y:9,z:0}};this.init();}
  log(text,type='sys'){
    const line=document.createElement('div');line.className='line '+type;line.textContent=text;
    $('term').append(line);while($('term').children.length>250)$('term').firstChild.remove();$('term').scrollTop=$('term').scrollHeight;
    return line;
  }
  init(){
    try{this.scene3d=new SceneEngine($('viewport'));}catch(e){this.log('3D renderer failed: '+e.message,'err');$('runBtn').disabled=true;return;}
    $('modelDot').className='dot off';$('modelLabel').textContent='Templates ready / AI optional';
    $('gpuLabel').textContent=navigator.gpu?'WebGPU: checking on AI load':'WebGPU: unavailable (templates work)';
    this.log('Builder ready. Describe a city, forest, solar system, ocean or abstract scene.');
    this.log('Load local AI for custom designs; its model download may be hundreds of MB. Templates require no model.');
    $('prompt').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing)this.infer();});
    $('importBuild').addEventListener('change',async e=>{
      if(this.busy){this.log('Wait for the builder before importing.','err');return;}
      this.busy=true;$('runBtn').disabled=true;
      try{const f=e.target.files[0];if(!f)return;if(f.size>256*1024)throw Error('Build file exceeds 256 KiB');
        const plan=validateBuildPlan(JSON.parse(await f.text()));
        // Validate the entire document before replacing the current scene.
        this.placement={actor:plan.actor,origin:{...plan.origin}};
        this.scene3d.reset();for(const c of plan.operations)this.scene3d.apply(c);
        this.log('Imported '+plan.operations.length+' shapes from '+plan.actor,'tool');
      }catch(err){this.log('Import failed: '+err.message,'err');}finally{e.target.value='';this.busy=false;$('runBtn').disabled=false;}
    });
  }
  async loadModel(){
    if(this.loading||this.busy||this.engine)return;this.loading=true;$('loadBtn').disabled=true;
    try{
      if(!navigator.gpu)throw Error('This browser has no WebGPU. Templates remain available.');
      const adapter=await navigator.gpu.requestAdapter();if(!adapter)throw Error('No WebGPU adapter. Templates remain available.');
      const info=adapter.info??{};$('gpuDot').className='dot on';$('gpuLabel').textContent='WebGPU: '+(info.description||info.vendor||'ready').slice(0,30);
      const model=adapter.features.has('shader-f16')?'Llama-3.2-1B-Instruct-q4f16_1-MLC':'Llama-3.2-1B-Instruct-q4f32_1-MLC';
      $('modelDot').className='dot load';$('modelLabel').textContent='Loading local AI';
      const status=this.log('Loading '+model+'...');
      const webllm=await import('https://esm.run/@mlc-ai/web-llm@0.2.85');
      this.engine=await webllm.CreateMLCEngine(model,{initProgressCallback:p=>{
        $('loadBar').style.width=Math.round(Math.max(0,Math.min(1,p.progress??0))*100)+'%';status.textContent=p.text??'Loading model...';
      }});
      $('modelDot').className='dot on';$('modelLabel').textContent='Local Llama builder';$('loadBar').style.width='100%';this.log('Local AI ready.');
    }catch(e){this.log('AI load failed: '+e.message,'err');$('modelDot').className='dot off';$('modelLabel').textContent='Templates ready / retry AI';}
    finally{this.loading=false;$('loadBtn').disabled=!!this.engine;}
  }
  stop(){this.cancelled=true;this.engine?.interruptGenerate();}
  async infer(){
    if(this.busy||!this.scene3d)return;const text=$('prompt').value.trim();if(!text)return;
    this.busy=true;this.cancelled=false;$('runBtn').disabled=true;$('stopBtn').disabled=false;$('prompt').value='';this.log('> '+text,'usr');
    const started=performance.now();let executed=0;
    try{
      if(this.engine){
        const output=this.log('','llm');let full='',usage=null;
        const response=await this.engine.chat.completions.create({messages:[{role:'system',content:TOOLS_DESCRIPTION},{role:'user',content:text}],temperature:.5,max_tokens:900,stream:true,stream_options:{include_usage:true}});
        for await(const chunk of response){if(this.cancelled)break;full+=chunk.choices[0]?.delta?.content??'';if(chunk.usage)usage=chunk.usage;output.textContent=full;}
        if(!this.cancelled){
          const lines=full.split('\n').filter(l=>l.trim().startsWith('TOOL:'));
          if(lines.length>LIMITS.commands)throw Error('Model exceeded the per-request command limit');
          for(const line of lines){try{const command=parseTool(line);this.log(this.scene3d.apply(command),'tool');executed++;}catch(e){this.log('Rejected tool: '+e.message,'err');}}
        }
        $('perfLabel').textContent=usage?usage.completion_tokens+' generated tokens':'Generation completed';
      }
      if(!this.cancelled&&executed===0){
        const key=detectScene(text);
        if(key&&SCENE_TEMPLATES[key]){
          this.log('Building '+key+' from a template (not model-generated).');
          this.scene3d.reset();
          for(const command of SCENE_TEMPLATES[key]){if(this.cancelled)break;this.scene3d.apply(parseTool('TOOL:'+command));executed++;await new Promise(r=>setTimeout(r,40));}
        }else this.log('Load local AI for custom prompts, or try “build a city”.');
      }
      this.log((this.cancelled?'Stopped. ':'')+executed+' accepted commands in '+Math.round(performance.now()-started)+' ms','perf');
    }catch(e){this.log('Builder error: '+e.message,'err');}
    finally{this.busy=false;$('runBtn').disabled=false;$('stopBtn').disabled=true;}
  }
  exportBuild(){
    if(this.busy)return;
    try{const plan=createBuildPlan(this.scene3d.commands(),this.placement);const url=URL.createObjectURL(new Blob([JSON.stringify(plan,null,2)],{type:'application/json'}));
      const a=document.createElement('a');a.href=url;a.download='twin-builder.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      this.log('Exported '+plan.operations.length+' solid shapes for Repoverse. Particles/lights are preview-only.','tool');
    }catch(e){this.log(e.message,'err');}
  }
  sceneCmd(command){
    if(this.busy||!this.scene3d)return;
    const methods={reset:'reset',spin:'toggleSpin',wireframe:'toggleWireframe',explode:'explode',screenshot:'screenshot'};
    if(methods[command])this.log(this.scene3d[methods[command]](),'tool');
  }
}
window.tom=new TwinOMatic();
