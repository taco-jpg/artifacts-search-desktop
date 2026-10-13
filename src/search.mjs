import { parseHTML } from 'linkedom';
export function parseResults(html) {
  const { document } = parseHTML(html);
  if (document.querySelector('#challenge-form, #anomaly-form') || /anomaly\.js|bots use DuckDuckGo/i.test(html)) {
    throw new Error('DDG_CHALLENGE: DuckDuckGo requires a CAPTCHA. Try again later or use another search provider; no challenge bypass is attempted.');
  }
  const sources = [];
  for (const a of document.querySelectorAll('a.result__a')) {
    let url;
    try {
      const link = new URL(a.getAttribute('href'), 'https://duckduckgo.com');
      url = new URL(link.searchParams.get('uddg') ?? link.href);
    } catch { continue; }
    if (!['https:', 'http:'].includes(url.protocol)) continue;
    if (sources.some(s => s.url === url.href)) continue;
    const row = a.closest('.result');
    sources.push({ title: a.textContent.trim(), url: url.href, snippet: row?.querySelector('.result__snippet')?.textContent.trim() ?? '' });
  }
  if (!sources.length && !document.querySelector('.no-results')) throw new Error('DDG_UNRECOGNIZED_RESPONSE: No results or recognized empty-result notice. Upstream may have changed or blocked the request.');
  return sources;
}
export async function search(query, { signal, region, maxResults, fetchImpl = fetch } = {}) {
  if (typeof query !== 'string' || !query.trim()) throw new Error('query must be a nonempty string');
  if (maxResults !== undefined && (!Number.isInteger(maxResults) || maxResults < 1)) throw new Error('maxResults must be a positive integer');
  const url = new URL('https://html.duckduckgo.com/html/');
  url.searchParams.set('q', query.trim());
  if (region) url.searchParams.set('kl', region);
  const response = await fetchImpl(url, { signal, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' } });
  if (!response.ok) throw new Error(`DDG_HTTP_${response.status}: DuckDuckGo search unavailable`);
  if (!/text\/html/i.test(response.headers.get('content-type') ?? '')) throw new Error('DDG_CONTENT_TYPE: Expected HTML');
  const all = parseResults(await response.text());
  const sources = maxResults === undefined ? all : all.slice(0, maxResults);
  return { query: query.trim(), sources, truncated: sources.length < all.length, provider: 'duckduckgo-html', retrievedAt: new Date().toISOString() };
}
