import React, { useEffect, useRef, useState } from 'react';
import { namespace, dictionaries } from './locale.mjs';
import { previewDocument, artifactFromBlock } from './preview.mjs';
export const name = 'artifacts-search-desktop';
export const inject = ['slots', 'locale'];
const button = { border:'1px solid #d8deea', borderRadius:8, background:'transparent', color:'inherit', padding:'5px 10px', cursor:'pointer' };
function Artifact({ phase, block, t }) {
  const [source, setSource] = useState(false);
  const [revision, setRevision] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);
  const container = useRef(null);
  const preview = useRef(null);
  const fullscreenButton = useRef(null);
  useEffect(() => {
    const onMessage = event => {
      if (event.source === preview.current?.contentWindow && event.data?.type === 'dsh-artifact-escape' && container.current?.matches(':modal')) container.current.close();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  function leaveFullscreen() {
    // Keep the same dialog and iframe mounted in the inline layout.
    if (container.current?.matches(':modal')) return;
    if (container.current) container.current.open = true;
    setFullscreen(false);
    fullscreenButton.current?.focus({preventScroll:true});
  }
  function toggleFullscreen() {
    setFullscreenError(false);
    try {
      const dialog = container.current;
      if (dialog.matches(':modal')) dialog.close();
      else {
        // An open non-modal dialog must be closed before showModal. Removing the
        // attribute preserves its iframe and avoids an asynchronous close event.
        dialog.removeAttribute('open');
        dialog.showModal();
        setFullscreen(true);
      }
    } catch {
      if (container.current) container.current.open = true;
      setFullscreenError(true);
    }
  }
  if (phase !== 'result') return <p>{t('generating')}</p>;
  const artifact = artifactFromBlock(block);
  if (!artifact) return <pre>{block.content?.map(c => c.text ?? '').join('\n') || t('unavailable')}</pre>;
  function download() {
    const url = URL.createObjectURL(new Blob([artifact.html], { type:'text/html' }));
    const a = document.createElement('a'); a.href=url; a.download=artifact.id.replace(/[^a-zA-Z0-9_-]/g,'_')+'.html'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <dialog open ref={container} onClose={leaveFullscreen} role={fullscreen?'dialog':'region'} aria-modal={fullscreen||undefined} aria-label={t('artifact', {title:artifact.title})} style={{border:'1px solid #d8deea',borderRadius:fullscreen?0:14,overflow:'hidden',margin:fullscreen?0:'12px 0',width:fullscreen?'100vw':'100%',padding:0,maxWidth:'none',maxHeight:'none',color:'inherit',background:'inherit',...(fullscreen?{position:'fixed',inset:0,height:'100dvh',display:'flex',flexDirection:'column',background:'Canvas',color:'CanvasText'}:{position:'static'})}}>
    <header style={{display:'flex',gap:8,alignItems:'center',padding:12,flexWrap:'wrap',flexShrink:0}}><strong style={{flex:1}}>{artifact.title}</strong>
      <button ref={fullscreenButton} style={button} aria-pressed={fullscreen} onClick={toggleFullscreen}>{t(fullscreen?'exitFullscreen':'fullscreen')}</button>
      <button style={button} onClick={()=>setSource(!source)}>{t(source?'preview':'source')}</button>
      <button style={button} onClick={()=>setRevision(revision+1)}>{t('reset')}</button>
      <button style={button} onClick={download}>{t('download')}</button>
    </header>
    {fullscreenError && <p role="alert" style={{padding:'0 12px'}}>{t('fullscreenError')}</p>}
    {source && <pre style={{whiteSpace:'pre-wrap',padding:16,maxHeight:fullscreen?'none':560,overflow:'auto',...(fullscreen?{flex:1,minHeight:0,margin:0}:{})}}>{artifact.html}</pre>}
    <iframe ref={preview} key={revision} title={artifact.title} sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={previewDocument(artifact.html)} style={{width:'100%',height:fullscreen?'100%':480,...(fullscreen?{flex:1,minHeight:0}:{}),border:0,background:'#fff',display:source?'none':'block'}}/>
    <footer style={{fontSize:11,padding:'7px 12px',opacity:.65,flexShrink:0}}>{t('isolation')} · {artifact.id}</footer>
  </dialog>;
}
// Tool history keeps a receipt; the turn footer owns the single interactive preview.
function ArtifactReceipt({ phase, block, t }) {
  if (phase !== 'result') return <p>{t('generating')}</p>;
  const artifact = artifactFromBlock(block);
  return <p>{artifact ? t('presented', {title:artifact.title}) : block.content?.map(c=>c.text??'').join('\n') || t('unavailable')}</p>;
}
function Search({ phase, block, t }) {
  if (phase !== 'result') return <p>{t('searching')}</p>;
  const value = block.meta?.search;
  if (!value || block.isError) return <pre style={{whiteSpace:'pre-wrap'}}>{block.content?.map(c=>c.text??'').join('\n')}</pre>;
  return <section style={{borderLeft:'3px solid #7294dc',padding:'8px 16px',margin:'10px 0'}}><strong>DuckDuckGo · {value.query}</strong>
    {value.sources.map(s=><p key={s.url}><a href={s.url} target="_blank" rel="noreferrer noopener">{s.title || s.url}</a><br/><small>{s.snippet}</small></p>)}
    {!value.sources.length && <p>{t('noResults')}</p>}<small>{value.retrievedAt}{value.truncated?t('truncated'):''}</small></section>;
}
function CompletedArtifacts({ turn, useChat, t }) {
  const snapshot = useChat(value => value);
  const artifacts = new Map();
  function visit(block) {
    if (block.kind === 'tool-result' && block.call?.name === 'present_artifact') {
      const artifact = artifactFromBlock(block);
      if (artifact) artifacts.set(artifact.id, block);
    }
    for (const child of block.subCalls ?? []) visit(child);
  }
  for (const node of snapshot.nodes.values()) {
    if (node.kind === 'tool-call' && node.location?.turn?.turn === turn.turn) visit(node.data.root);
  }
  return artifacts.size ? <div aria-label={t('completed')}>{[...artifacts.values()].map(block => <Artifact key={block.callId} phase="result" block={block} t={t}/>)}</div> : null;
}
export function apply(ctx) {
  ctx.effect(() => ctx.locale.register(namespace, dictionaries));
  ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({ name:'conversation.chat.turnTail', id:'interactive-artifacts', order:0, locale:namespace }, CompletedArtifacts));
  ctx.slots.inject('tool.call.toolview', function* () {
    yield ctx.slots.register({name:'tool.call.toolview',key:'present_artifact',locale:namespace},ArtifactReceipt);
    yield ctx.slots.register({name:'tool.call.toolview',key:'duckduckgo_search',locale:namespace},Search);
  });
}
