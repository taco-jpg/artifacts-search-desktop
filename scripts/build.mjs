import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await build({entryPoints:['src/index.mjs'],bundle:true,platform:'node',format:'esm',target:'node22',outfile:'dist/index.mjs'});
const client = await build({entryPoints:['src/client.jsx'],bundle:true,platform:'browser',format:'cjs',target:'es2020',external:['react'],write:false});
await writeFile('dist/client.js', 'window.__ModuleLoader__.load({id:"artifacts-search-desktop",factory:(require)=>{var module={exports:{}};var exports=module.exports;\n'+client.outputFiles[0].text+'\nreturn module.exports;}});\n');
