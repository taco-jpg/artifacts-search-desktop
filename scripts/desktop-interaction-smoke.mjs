import { chromium } from 'playwright-core';
import { mkdir,writeFile } from 'node:fs/promises';
process.env.DSH_DESKTOP_SMOKE_IMPORT='1';
const {exerciseChart}=await import('../tests/browser/interaction.test.mjs');
const endpoint=process.argv[2];
if(!endpoint) throw new Error('Usage: node scripts/desktop-interaction-smoke.mjs http://127.0.0.1:PORT');
if(new URL(endpoint).hostname!=='127.0.0.1') throw new Error('Use the local Desktop debugging endpoint');
const browser=await chromium.connectOverCDP(endpoint);
try {
  const page=browser.contexts().flatMap(c=>c.pages()).find(p=>p.url()==='dsh-app://app/');
  if(!page)throw new Error('No DeepSeek Harness Desktop page found');
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await mkdir('.inspect/interaction-evidence',{recursive:true});
  const result=await exerciseChart(page,'.inspect/interaction-evidence');
  await page.reload();
  const afterReload=await exerciseChart(page);
  if(errors.length)throw new Error(JSON.stringify(errors));
  const evidence={app:'DeepSeek Harness Desktop',url:page.url(),testedAt:new Date().toISOString(),...result,afterReload,scriptErrors:errors};
  await writeFile('.inspect/interaction-evidence/result.json',JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify(evidence,null,2));
} finally {await browser.close();}
