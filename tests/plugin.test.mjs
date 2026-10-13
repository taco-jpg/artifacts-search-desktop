import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseResults, search } from '../src/search.mjs';
import { previewDocument, artifactFromBlock } from '../src/preview.mjs';
import { apply } from '../dist/index.mjs';
const html = '<div class="result"><a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fdocs">A &amp; B</a><a class="result__snippet">Useful <b>docs</b></a></div>';
test('search parses destination URLs, titles and snippets',()=>assert.deepEqual(parseResults(html),[{title:'A & B',url:'https://example.com/docs',snippet:'Useful docs'}]));
test('search rejects challenges and unexpected markup, accepts known no-results',()=>{
  assert.throws(()=>parseResults('<form id="challenge-form"></form>'),/DDG_CHALLENGE/);
  assert.throws(()=>parseResults('<h1>Service unavailable</h1>'),/UNRECOGNIZED/);
  assert.deepEqual(parseResults('<div class="no-results">No results</div>'),[]);
});
test('search filters executable result URLs and duplicates',()=>{
  assert.equal(parseResults(html+html+'<a class="result__a" href="javascript:alert(1)">bad</a>').length,1);
});
test('search propagates cancellation and upstream failures',async()=>{
  const signal = AbortSignal.abort();
  await assert.rejects(search('hello',{signal,fetchImpl:async(_url,opts)=>{assert.equal(opts.signal,signal); opts.signal.throwIfAborted();}}),/abort/i);
  await assert.rejects(search('hello',{fetchImpl:async()=>new Response('blocked',{status:429})}),/DDG_HTTP_429/);
});
test('search configured count truncates and passes region',async()=>{
  const other=html.replaceAll('example.com','second.com');
  const result=await search('hello',{maxResults:1,region:'us-en',fetchImpl:async url=>{
    assert.equal(url.searchParams.get('kl'),'us-en');return new Response(html+other,{headers:{'Content-Type':'text/html'}});
  }});
  assert.equal(result.sources.length,1); assert.equal(result.truncated,true);
});
test('preview puts CSP ahead of model code and preserves interactive scripts',()=>{
  const doc=previewDocument('<script>window.x=1</script>');
  assert.ok(doc.indexOf('Content-Security-Policy')<doc.indexOf('<script>'));
  assert.match(doc,/connect-src 'none'/);assert.match(doc,/window.x=1/);
});
test('durable artifact uses metadata or recorded arguments and hides errors',()=>{
  const a={id:'a',title:'Chart',html:'<p>Hello</p>'};
  assert.deepEqual(artifactFromBlock({meta:{artifact:a}}),a);
  assert.deepEqual(artifactFromBlock({call:{argsRaw:JSON.stringify(a)}}),a);
  assert.equal(artifactFromBlock({isError:true,meta:{artifact:a}}),null);
});
test('built plugin registers tools, bundled skills and visibility-aware guidance',async()=>{
  const tools=new Map();let provider,section;
  apply({tools:{register:t=>tools.set(t.name,t),get:n=>tools.get(n)},skills:{registerProvider:f=>provider=f()},systemPrompt:{section:s=>section=s}});
  assert.equal(tools.size,2);
  const skillList=await provider.list();assert.equal(skillList.length,2);
  assert.match((await provider.get(skillList[0])).content,/present_artifact/);
  const tool=tools.get('present_artifact'); const args={id:'test',title:'Chart',html:'<input type="range">'};
  const result=await tool.execute(args);assert.deepEqual(tool.output.presentationMeta(args,result),{artifact:args});
  assert.match(tool.output.render(args,result)[0].text,/Presented/);
  await assert.rejects(tool.execute({id:'',title:'x',html:'x'}),/nonempty/);
  tools.delete('duckduckgo_search');assert.doesNotMatch(section.text({scope:{}}),/For web research/);
});
