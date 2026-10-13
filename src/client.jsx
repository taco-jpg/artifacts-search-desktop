import React, { useState } from 'react';
import { previewDocument, artifactFromBlock } from './preview.mjs';
export const name = 'artifacts-search-desktop';
export const inject = ['slots'];
const button = { border:'1px solid #d8deea', borderRadius:8, background:'transparent', color:'inherit', padding:'5px 10px', cursor:'pointer' };
function Artifact({ phase, block }) {
  const [source, setSource] = useState(false);
  const [revision, setRevision] = useState(0);
  if (phase !== 'result') return <p>正在生成交互作品…</p>;
  const artifact = artifactFromBlock(block);
  if (!artifact) return <pre>{block.content?.map(c => c.text ?? '').join('\n') || 'Artifact unavailable'}</pre>;
  function download() {
    const url = URL.createObjectURL(new Blob([artifact.html], { type:'text/html' }));
    const a = document.createElement('a'); a.href=url; a.download=artifact.id.replace(/[^a-zA-Z0-9_-]/g,'_')+'.html'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section aria-label={'交互作品 '+artifact.title} style={{border:'1px solid #d8deea',borderRadius:14,overflow:'hidden',margin:'12px 0',width:'100%'}}>
    <header style={{display:'flex',gap:8,alignItems:'center',padding:12,flexWrap:'wrap'}}><strong style={{flex:1}}>{artifact.title}</strong>
      <button style={button} onClick={()=>setSource(!source)}>{source?'预览':'源码'}</button>
      <button style={button} onClick={()=>setRevision(revision+1)}>重置</button>
      <button style={button} onClick={download}>下载 HTML</button>
    </header>
    {source ? <pre style={{whiteSpace:'pre-wrap',padding:16,maxHeight:560,overflow:'auto'}}>{artifact.html}</pre> : <iframe key={revision} title={artifact.title} sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={previewDocument(artifact.html)} style={{width:'100%',height:480,border:0,background:'#fff'}}/>}
    <footer style={{fontSize:11,padding:'7px 12px',opacity:.65}}>隔离运行 · 网络已禁用 · {artifact.id}</footer>
  </section>;
}
function Search({ phase, block }) {
  if (phase !== 'result') return <p>DuckDuckGo 搜索中…</p>;
  const value = block.meta?.search;
  if (!value || block.isError) return <pre style={{whiteSpace:'pre-wrap'}}>{block.content?.map(c=>c.text??'').join('\n')}</pre>;
  return <section style={{borderLeft:'3px solid #7294dc',padding:'8px 16px',margin:'10px 0'}}><strong>DuckDuckGo · {value.query}</strong>
    {value.sources.map(s=><p key={s.url}><a href={s.url} target="_blank" rel="noreferrer noopener">{s.title || s.url}</a><br/><small>{s.snippet}</small></p>)}
    {!value.sources.length && <p>未找到结果</p>}<small>{value.retrievedAt}{value.truncated?' · 结果已截取':''}</small></section>;
}
function CompletedArtifacts({ turn, useChat }) {
  const snapshot = useChat(value => value);
  const artifacts = [];
  function visit(block) {
    if (block.kind === 'tool-result' && block.call?.name === 'present_artifact' && artifactFromBlock(block)) artifacts.push(block);
    for (const child of block.subCalls ?? []) visit(child);
  }
  for (const node of snapshot.nodes.values()) {
    if (node.kind === 'tool-call' && node.location?.turn?.turn === turn.turn) visit(node.data.root);
  }
  return artifacts.length ? <div aria-label="本轮交互作品">{artifacts.map(block => <Artifact key={block.callId} phase="result" block={block}/>)}</div> : null;
}
export function apply(ctx) {
  ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({ name:'conversation.chat.turnTail', id:'interactive-artifacts', order:0 }, CompletedArtifacts));
  ctx.slots.inject('tool.call.toolview', function* () {
    yield ctx.slots.register({name:'tool.call.toolview',key:'present_artifact'},Artifact);
    yield ctx.slots.register({name:'tool.call.toolview',key:'duckduckgo_search'},Search);
  });
}
