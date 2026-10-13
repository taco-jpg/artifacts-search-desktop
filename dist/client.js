window.__ModuleLoader__.load({id:"artifacts-search-desktop",factory:(require)=>{var module={exports:{}};var exports=module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.jsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(client_exports);
var import_react = __toESM(require("react"), 1);

// src/preview.mjs
var CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; media-src data: blob:; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'";
function previewDocument(html) {
  return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${CSP}"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:20px;font:14px system-ui;color:#18243a;background:#fff}*{box-sizing:border-box}</style></head><body>${html}</body></html>`;
}
function artifactFromBlock(block) {
  if (block?.isError) return null;
  const a = block?.meta?.artifact;
  if (a && ["id", "title", "html"].every((k) => typeof a[k] === "string")) return a;
  try {
    const args = JSON.parse(block?.call?.argsRaw ?? "null");
    return args && ["id", "title", "html"].every((k) => typeof args[k] === "string") ? args : null;
  } catch {
    return null;
  }
}

// src/client.jsx
var name = "artifacts-search-desktop";
var inject = ["slots"];
var button = { border: "1px solid #d8deea", borderRadius: 8, background: "transparent", color: "inherit", padding: "5px 10px", cursor: "pointer" };
function Artifact({ phase, block }) {
  const [source, setSource] = (0, import_react.useState)(false);
  const [revision, setRevision] = (0, import_react.useState)(0);
  if (phase !== "result") return /* @__PURE__ */ import_react.default.createElement("p", null, "\u6B63\u5728\u751F\u6210\u4EA4\u4E92\u4F5C\u54C1\u2026");
  const artifact = artifactFromBlock(block);
  if (!artifact) return /* @__PURE__ */ import_react.default.createElement("pre", null, block.content?.map((c) => c.text ?? "").join("\n") || "Artifact unavailable");
  function download() {
    const url = URL.createObjectURL(new Blob([artifact.html], { type: "text/html" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = artifact.id.replace(/[^a-zA-Z0-9_-]/g, "_") + ".html";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  }
  return /* @__PURE__ */ import_react.default.createElement("section", { "aria-label": "\u4EA4\u4E92\u4F5C\u54C1 " + artifact.title, style: { border: "1px solid #d8deea", borderRadius: 14, overflow: "hidden", margin: "12px 0", width: "100%" } }, /* @__PURE__ */ import_react.default.createElement("header", { style: { display: "flex", gap: 8, alignItems: "center", padding: 12, flexWrap: "wrap" } }, /* @__PURE__ */ import_react.default.createElement("strong", { style: { flex: 1 } }, artifact.title), /* @__PURE__ */ import_react.default.createElement("button", { style: button, onClick: () => setSource(!source) }, source ? "\u9884\u89C8" : "\u6E90\u7801"), /* @__PURE__ */ import_react.default.createElement("button", { style: button, onClick: () => setRevision(revision + 1) }, "\u91CD\u7F6E"), /* @__PURE__ */ import_react.default.createElement("button", { style: button, onClick: download }, "\u4E0B\u8F7D HTML")), source ? /* @__PURE__ */ import_react.default.createElement("pre", { style: { whiteSpace: "pre-wrap", padding: 16, maxHeight: 560, overflow: "auto" } }, artifact.html) : /* @__PURE__ */ import_react.default.createElement("iframe", { key: revision, title: artifact.title, sandbox: "allow-scripts", referrerPolicy: "no-referrer", srcDoc: previewDocument(artifact.html), style: { width: "100%", height: 480, border: 0, background: "#fff" } }), /* @__PURE__ */ import_react.default.createElement("footer", { style: { fontSize: 11, padding: "7px 12px", opacity: 0.65 } }, "\u9694\u79BB\u8FD0\u884C \xB7 \u7F51\u7EDC\u5DF2\u7981\u7528 \xB7 ", artifact.id));
}
function Search({ phase, block }) {
  if (phase !== "result") return /* @__PURE__ */ import_react.default.createElement("p", null, "DuckDuckGo \u641C\u7D22\u4E2D\u2026");
  const value = block.meta?.search;
  if (!value || block.isError) return /* @__PURE__ */ import_react.default.createElement("pre", { style: { whiteSpace: "pre-wrap" } }, block.content?.map((c) => c.text ?? "").join("\n"));
  return /* @__PURE__ */ import_react.default.createElement("section", { style: { borderLeft: "3px solid #7294dc", padding: "8px 16px", margin: "10px 0" } }, /* @__PURE__ */ import_react.default.createElement("strong", null, "DuckDuckGo \xB7 ", value.query), value.sources.map((s) => /* @__PURE__ */ import_react.default.createElement("p", { key: s.url }, /* @__PURE__ */ import_react.default.createElement("a", { href: s.url, target: "_blank", rel: "noreferrer noopener" }, s.title || s.url), /* @__PURE__ */ import_react.default.createElement("br", null), /* @__PURE__ */ import_react.default.createElement("small", null, s.snippet))), !value.sources.length && /* @__PURE__ */ import_react.default.createElement("p", null, "\u672A\u627E\u5230\u7ED3\u679C"), /* @__PURE__ */ import_react.default.createElement("small", null, value.retrievedAt, value.truncated ? " \xB7 \u7ED3\u679C\u5DF2\u622A\u53D6" : ""));
}
function apply(ctx) {
  ctx.slots.inject("tool.call.toolview", function* () {
    yield ctx.slots.register({ name: "tool.call.toolview", key: "present_artifact" }, Artifact);
    yield ctx.slots.register({ name: "tool.call.toolview", key: "duckduckgo_search" }, Search);
  });
}

return module.exports;}});
