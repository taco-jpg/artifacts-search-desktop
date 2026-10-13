export const CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; media-src data: blob:; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'";
export function previewDocument(html) {
  // CSP precedes all model HTML. A unique sandbox origin prevents access to host storage/DOM.
  return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${CSP}"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:20px;font:14px system-ui;color:#18243a;background:#fff}*{box-sizing:border-box}</style></head><body>${html}</body></html>`;
}
export function artifactFromBlock(block) {
  if (block?.isError) return null;
  const a = block?.meta?.artifact;
  if (a && ['id','title','html'].every(k => typeof a[k] === 'string')) return a;
  // Call arguments survive result replay even if a host omits presentation metadata.
  try {
    const args = JSON.parse(block?.call?.argsRaw ?? 'null');
    return args && ['id','title','html'].every(k => typeof args[k] === 'string') ? args : null;
  } catch { return null; }
}
