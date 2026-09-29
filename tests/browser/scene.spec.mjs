import {test,expect} from '@playwright/test';
test('templates work without AI; reset releases lights and geometry',async({page})=>{
 await page.goto('/frontend/');await page.waitForFunction(()=>window.tom?.scene3d);
 await page.locator('#prompt').fill('build a city');await page.locator('#runBtn').click();await expect(page.locator('#runBtn')).toBeEnabled({timeout:15000});
 expect(await page.evaluate(()=>tom.scene3d.objects.length)).toBeGreaterThan(0);
 const result=await page.evaluate(()=>{const s=tom.scene3d;s.reset();s.apply({name:'add_box',args:{y:0}});let disposed=false;s.objects[0].geometry.addEventListener('dispose',()=>disposed=true);const y=s.objects[0].position.y;s.apply({name:'add_light',args:{intensity:0,y:0}});const light=s.lights[0];s.reset();return {y,disposed,removed:!light.parent,count:s.objects.length,lights:s.lights.length};});
 expect(result).toEqual({y:0,disposed:true,removed:true,count:0,lights:0});await page.screenshot({path:'.artifacts/browser.png'});
});
test('duplicate Enter cannot run concurrent inference; invalid tools allow template fallback',async({page})=>{
 await page.goto('/frontend/');await page.waitForFunction(()=>window.tom?.scene3d);
 await page.evaluate(()=>{window.calls=0;tom.engine={chat:{completions:{create:async function*(){calls++;await new Promise(r=>setTimeout(r,100));yield {choices:[{delta:{content:'TOOL:unknown {}'}}]};}}}};});
 await page.locator('#prompt').fill('build a forest');await page.locator('#prompt').press('Enter');await page.locator('#prompt').fill('build a city');await page.locator('#prompt').press('Enter');await expect(page.locator('#runBtn')).toBeEnabled({timeout:15000});expect(await page.evaluate(()=>calls)).toBe(1);expect(await page.evaluate(()=>tom.scene3d.objects.length)).toBeGreaterThan(0);
});

test('exported file roundtrips, invalid import preserves scene and AI absence recovers',async({page})=>{
 await page.goto('/frontend/');await page.waitForFunction(()=>window.tom?.scene3d);
 await page.evaluate(()=>{Object.defineProperty(navigator,'gpu',{value:undefined,configurable:true});tom.scene3d.apply({name:'add_box',args:{width:2,height:2,depth:2,y:1}});});
 await page.locator('#loadBtn').click();await expect(page.locator('#loadBtn')).toBeEnabled();await expect(page.locator('#modelLabel')).toContainText('retry');
 const downloadPromise=page.waitForEvent('download');await page.evaluate(()=>tom.exportBuild());const download=await downloadPromise;await download.saveAs('.artifacts/twin-builder.json');
 await page.locator('#importBuild').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"schemaVersion":999}')});await expect(page.locator('#term')).toContainText('Import failed');expect(await page.evaluate(()=>tom.scene3d.objects.length)).toBe(1);
 await page.evaluate(()=>tom.scene3d.reset());await page.locator('#importBuild').setInputFiles('.artifacts/twin-builder.json');await expect(page.locator('#term')).toContainText('Imported 1 shapes');expect(await page.evaluate(()=>tom.scene3d.objects.length)).toBe(1);
 await page.screenshot({path:'.artifacts/builder-roundtrip.png'});
});

test('mobile viewport keeps controls reachable without horizontal overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/frontend/');await page.waitForFunction(()=>window.tom?.scene3d);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.locator('#prompt').fill('city');await page.locator('#runBtn').click();await expect(page.locator('#runBtn')).toBeEnabled({timeout:15000});
 await page.screenshot({path:'.artifacts/mobile.png',fullPage:true});
});
