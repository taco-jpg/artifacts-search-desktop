import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { chromium } from 'playwright-core';

// Mount the shipped client bundle through its actual ModuleLoader and slot contracts.
const harness = await build({ stdin: { contents: `
import React from 'react';
import { createRoot } from 'react-dom/client';
const slots = new Map();
window.__ModuleLoader__ = { load({factory}) {
  factory(name => { if (name === 'react') return React; throw new Error('Unexpected module: '+name); }).apply({slots:{
    inject(name, callback) { const result=callback(); if(result?.next) for(const _ of result) {} },
    register(spec, component) { slots.set(spec.key ?? spec.id, component); return () => slots.delete(spec.key ?? spec.id); }
  }});
}};
window.mountArtifact = artifact => {
  // Real ToolResultNode has no turn property; ownership lives on its Chat node location.
  const root={kind:'tool-result',callId:'test-chart',call:{name:'present_artifact',argsRaw:JSON.stringify(artifact)},meta:{artifact},content:[],subCalls:[]};
  const snapshot={nodes:new Map([['test',{kind:'tool-call',location:{turn:{turn:1}},data:{root}}]])};
  createRoot(document.getElementById('root')).render(React.createElement(slots.get('interactive-artifacts'),{turn:{turn:1},useChat:selector=>selector(snapshot)}));
};`, resolveDir: process.cwd(), loader: 'js' }, bundle: true, platform: 'browser', format: 'iife', write: false });
const client = await readFile('dist/client.js', 'utf8');
const html = await readFile('tests/fixtures/interaction-chart.html','utf8');
const artifact = {id:'plugin-interaction-bar-chart',title:'插件交互验证',html};

export async function exerciseChart(page, outputDirectory) {
  const card = page.getByLabel('本轮交互作品').getByLabel('交互作品 插件交互验证',{exact:true});
  const getFrame = async () => (await card.locator('iframe').elementHandle()).contentFrame();
  const state = async () => {
    const frame = await getFrame();
    await frame.locator('.tick-label').last().waitFor({state:'attached'});
    return frame.evaluate(() => ({
    multiplier: document.querySelector('#multiplierText').textContent,
    values: [...document.querySelectorAll('.bar-value')].map(el=>el.textContent),
    heights: [...document.querySelectorAll('.bar')].map(el=>Number(el.getAttribute('height'))),
    maxTick: [...document.querySelectorAll('.tick-label')].at(-1).textContent,
  }));
  };
  await card.waitFor({state:'visible'});
  await card.getByRole('button',{name:'重置',exact:true}).click();
  const before = await state();
  assert.equal(before.multiplier,'×1'); assert.deepEqual(before.values,['10','20','30']);
  const button = () => getFrame().then(frame=>frame.getByRole('button',{name:'所有数值翻倍',exact:true}));
  await (await button()).click();
  const first = await state();
  assert.equal(first.multiplier,'×2'); assert.deepEqual(first.values,['20','40','60']); assert.equal(first.maxTick,'60');
  await (await button()).click();
  const second = await state();
  assert.equal(second.multiplier,'×4'); assert.deepEqual(second.values,['40','80','120']); assert.equal(second.maxTick,'150');
  assert.ok(second.heights.every(h=>Number.isFinite(h)&&h>0));
  assert.notDeepEqual(second.heights,before.heights);
  if (outputDirectory) await card.screenshot({path:outputDirectory+'/chart-after-clicks.png',animations:'disabled'});
  await card.getByRole('button',{name:'源码',exact:true}).click();
  assert.match(await card.locator('pre').innerText(),/doubleBtn/);
  assert.equal(await card.locator('iframe').isVisible(),false);
  await card.getByRole('button',{name:'预览',exact:true}).click();
  assert.deepEqual(await state(),second,'Source toggle must retain the live iframe and chart state');
  await card.getByRole('button',{name:'重置',exact:true}).click();
  assert.deepEqual(await state(),before,'Reset must recreate initial chart state');
  const [download] = await Promise.all([
    page.waitForEvent('download'),card.getByRole('button',{name:'下载 HTML',exact:true}).click(),
  ]);
  assert.equal(download.suggestedFilename(),'plugin-interaction-bar-chart.html');
  const stream = await download.createReadStream(); const chunks=[];
  for await(const chunk of stream) chunks.push(chunk);
  const downloaded=Buffer.concat(chunks).toString('utf8');
  assert.equal(downloaded,html,'Download must preserve the complete original HTML');
  const isolation = await (await getFrame()).evaluate(async()=>{
    let hostBlocked=false,networkBlocked=false;
    try{void parent.document.body;}catch{hostBlocked=true;}
    try{await fetch('https://artifact-test.invalid/probe');}catch{networkBlocked=true;}
    return {hostBlocked,networkBlocked};
  });
  assert.deepEqual(isolation,{hostBlocked:true,networkBlocked:true});
  return {before,first,second,sourcePreserved:true,resetRestored:true,downloadBytes:Buffer.byteLength(downloaded),isolation};
}

// Imported by the desktop smoke script without launching a separate test browser.
if (!process.env.DSH_DESKTOP_SMOKE_IMPORT) {
  test('shipped artifact client: real iframe clicks, source persistence, reset, download and sandbox',async()=>{
    const browser=await chromium.launch({headless:true});
    try {
      const context=await browser.newContext({acceptDownloads:true});
      const page=await context.newPage(); const errors=[]; const externalRequests=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.route('https://artifact-test.invalid/**',route=>{externalRequests.push(route.request().url());return route.abort();});
      await page.setContent('<div id="root"></div>');
      await page.addScriptTag({content:harness.outputFiles[0].text});
      await page.addScriptTag({content:client});
      await page.evaluate(a=>window.mountArtifact(a),artifact);
      await exerciseChart(page);
      assert.deepEqual(errors,[]); assert.deepEqual(externalRequests,[],'CSP must stop fetch before it reaches the network');
    } finally {await browser.close();}
  });
}
