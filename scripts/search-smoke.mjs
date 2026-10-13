import { search } from '../src/search.mjs';
const result = await search(process.argv.slice(2).join(' ') || 'DeepSeek Harness github');
if (!result.sources.length) throw new Error('Expected live search results');
console.log(JSON.stringify(result,null,2));
