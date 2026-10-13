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

// src/locale.mjs
var namespace = "artifacts-search-desktop";
var dictionaries = {
  en: {
    presented: "Presented {title} below this reply",
    generating: "Generating interactive artifact\u2026",
    unavailable: "Artifact unavailable",
    artifact: "Interactive artifact {title}",
    completed: "Artifacts in this reply",
    fullscreen: "View fullscreen",
    exitFullscreen: "Exit fullscreen",
    fullscreenError: "Could not open fullscreen. Please try again.",
    source: "Source",
    preview: "Preview",
    reset: "Reset",
    download: "Download HTML",
    isolation: "Sandboxed \xB7 Network disabled",
    searching: "Searching DuckDuckGo\u2026",
    noResults: "No results found",
    truncated: " \xB7 Results truncated"
  },
  zh: {
    presented: "\u5DF2\u5728\u56DE\u590D\u4E0B\u65B9\u663E\u793A {title}",
    generating: "\u6B63\u5728\u751F\u6210\u4EA4\u4E92\u4F5C\u54C1\u2026",
    unavailable: "\u4F5C\u54C1\u4E0D\u53EF\u7528",
    artifact: "\u4EA4\u4E92\u4F5C\u54C1 {title}",
    completed: "\u672C\u8F6E\u4EA4\u4E92\u4F5C\u54C1",
    fullscreen: "\u5168\u5C4F\u67E5\u770B",
    exitFullscreen: "\u9000\u51FA\u5168\u5C4F",
    fullscreenError: "\u65E0\u6CD5\u8FDB\u5165\u5168\u5C4F\uFF0C\u8BF7\u91CD\u8BD5\u3002",
    source: "\u6E90\u7801",
    preview: "\u9884\u89C8",
    reset: "\u91CD\u7F6E",
    download: "\u4E0B\u8F7D HTML",
    isolation: "\u9694\u79BB\u8FD0\u884C \xB7 \u7F51\u7EDC\u5DF2\u7981\u7528",
    searching: "DuckDuckGo \u641C\u7D22\u4E2D\u2026",
    noResults: "\u672A\u627E\u5230\u7ED3\u679C",
    truncated: " \xB7 \u7ED3\u679C\u5DF2\u622A\u53D6"
  }
};

// src/preview.mjs
var CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; media-src data: blob:; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'";
function previewDocument(html) {
  return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${CSP}"><meta name="viewport" content="width=device-width,initial-scale=1"><script>window.addEventListener('keydown',event=>{if(event.key==='Escape')parent.postMessage({type:'dsh-artifact-escape'},'*')},true)<\/script><style>body{margin:0;padding:20px;font:14px system-ui;color:#18243a;background:#fff}*{box-sizing:border-box}</style></head><body>${html}</body></html>`;
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
var inject = ["slots", "locale"];
var button = { border: "1px solid #d8deea", borderRadius: 8, background: "transparent", color: "inherit", padding: "5px 10px", cursor: "pointer" };
function Artifact({ phase, block, t }) {
  const [source, setSource] = (0, import_react.useState)(false);
  const [revision, setRevision] = (0, import_react.useState)(0);
  const [fullscreen, setFullscreen] = (0, import_react.useState)(false);
  const [fullscreenError, setFullscreenError] = (0, import_react.useState)(false);
  const container = (0, import_react.useRef)(null);
  const preview = (0, import_react.useRef)(null);
  const fullscreenButton = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const onMessage = (event) => {
      if (event.source === preview.current?.contentWindow && event.data?.type === "dsh-artifact-escape" && container.current?.matches(":modal")) container.current.close();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  function leaveFullscreen() {
    if (container.current?.matches(":modal")) return;
    if (container.current) container.current.open = true;
    setFullscreen(false);
    fullscreenButton.current?.focus({ preventScroll: true });
  }
  function toggleFullscreen() {
    setFullscreenError(false);
    try {
      const dialog = container.current;
      if (dialog.matches(":modal")) dialog.close();
      else {
        dialog.removeAttribute("open");
        dialog.showModal();
        setFullscreen(true);
      }
    } catch {
      if (container.current) container.current.open = true;
      setFullscreenError(true);
    }
  }
  if (phase !== "result") return /* @__PURE__ */ import_react.default.createElement("p", null, t("generating"));
  const artifact = artifactFromBlock(block);
  if (!artifact) return /* @__PURE__ */ import_react.default.createElement("pre", null, block.content?.map((c) => c.text ?? "").join("\n") || t("unavailable"));
  function download() {
    const url = URL.createObjectURL(new Blob([artifact.html], { type: "text/html" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = artifact.id.replace(/[^a-zA-Z0-9_-]/g, "_") + ".html";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  }
  return /* @__PURE__ */ import_react.default.createElement("dialog", { open: true, ref: container, onClose: leaveFullscreen, role: fullscreen ? "dialog" : "region", "aria-modal": fullscreen || void 0, "aria-label": t("artifact", { title: artifact.title }), style: { border: "1px solid #d8deea", borderRadius: fullscreen ? 0 : 14, overflow: "hidden", margin: fullscreen ? 0 : "12px 0", width: fullscreen ? "100vw" : "100%", padding: 0, maxWidth: "none", maxHeight: "none", color: "inherit", background: "inherit", ...fullscreen ? { position: "fixed", inset: 0, height: "100dvh", display: "flex", flexDirection: "column", background: "Canvas", color: "CanvasText" } : { position: "static" } } }, /* @__PURE__ */ import_react.default.createElement("header", { style: { display: "flex", gap: 8, alignItems: "center", padding: 12, flexWrap: "wrap", flexShrink: 0 } }, /* @__PURE__ */ import_react.default.createElement("strong", { style: { flex: 1 } }, artifact.title), /* @__PURE__ */ import_react.default.createElement("button", { ref: fullscreenButton, style: button, "aria-pressed": fullscreen, onClick: toggleFullscreen }, t(fullscreen ? "exitFullscreen" : "fullscreen")), /* @__PURE__ */ import_react.default.createElement("button", { style: button, onClick: () => setSource(!source) }, t(source ? "preview" : "source")), /* @__PURE__ */ import_react.default.createElement("button", { style: button, onClick: () => setRevision(revision + 1) }, t("reset")), /* @__PURE__ */ import_react.default.createElement("button", { style: button, onClick: download }, t("download"))), fullscreenError && /* @__PURE__ */ import_react.default.createElement("p", { role: "alert", style: { padding: "0 12px" } }, t("fullscreenError")), source && /* @__PURE__ */ import_react.default.createElement("pre", { style: { whiteSpace: "pre-wrap", padding: 16, maxHeight: fullscreen ? "none" : 560, overflow: "auto", ...fullscreen ? { flex: 1, minHeight: 0, margin: 0 } : {} } }, artifact.html), /* @__PURE__ */ import_react.default.createElement("iframe", { ref: preview, key: revision, title: artifact.title, sandbox: "allow-scripts", referrerPolicy: "no-referrer", srcDoc: previewDocument(artifact.html), style: { width: "100%", height: fullscreen ? "100%" : 480, ...fullscreen ? { flex: 1, minHeight: 0 } : {}, border: 0, background: "#fff", display: source ? "none" : "block" } }), /* @__PURE__ */ import_react.default.createElement("footer", { style: { fontSize: 11, padding: "7px 12px", opacity: 0.65, flexShrink: 0 } }, t("isolation"), " \xB7 ", artifact.id));
}
function ArtifactReceipt({ phase, block, t }) {
  if (phase !== "result") return /* @__PURE__ */ import_react.default.createElement("p", null, t("generating"));
  const artifact = artifactFromBlock(block);
  return /* @__PURE__ */ import_react.default.createElement("p", null, artifact ? t("presented", { title: artifact.title }) : block.content?.map((c) => c.text ?? "").join("\n") || t("unavailable"));
}
function Search({ phase, block, t }) {
  if (phase !== "result") return /* @__PURE__ */ import_react.default.createElement("p", null, t("searching"));
  const value = block.meta?.search;
  if (!value || block.isError) return /* @__PURE__ */ import_react.default.createElement("pre", { style: { whiteSpace: "pre-wrap" } }, block.content?.map((c) => c.text ?? "").join("\n"));
  return /* @__PURE__ */ import_react.default.createElement("section", { style: { borderLeft: "3px solid #7294dc", padding: "8px 16px", margin: "10px 0" } }, /* @__PURE__ */ import_react.default.createElement("strong", null, "DuckDuckGo \xB7 ", value.query), value.sources.map((s) => /* @__PURE__ */ import_react.default.createElement("p", { key: s.url }, /* @__PURE__ */ import_react.default.createElement("a", { href: s.url, target: "_blank", rel: "noreferrer noopener" }, s.title || s.url), /* @__PURE__ */ import_react.default.createElement("br", null), /* @__PURE__ */ import_react.default.createElement("small", null, s.snippet))), !value.sources.length && /* @__PURE__ */ import_react.default.createElement("p", null, t("noResults")), /* @__PURE__ */ import_react.default.createElement("small", null, value.retrievedAt, value.truncated ? t("truncated") : ""));
}
function CompletedArtifacts({ turn, useChat, t }) {
  const snapshot = useChat((value) => value);
  const artifacts = /* @__PURE__ */ new Map();
  function visit(block) {
    if (block.kind === "tool-result" && block.call?.name === "present_artifact") {
      const artifact = artifactFromBlock(block);
      if (artifact) artifacts.set(artifact.id, block);
    }
    for (const child of block.subCalls ?? []) visit(child);
  }
  for (const node of snapshot.nodes.values()) {
    if (node.kind === "tool-call" && node.location?.turn?.turn === turn.turn) visit(node.data.root);
  }
  return artifacts.size ? /* @__PURE__ */ import_react.default.createElement("div", { "aria-label": t("completed") }, [...artifacts.values()].map((block) => /* @__PURE__ */ import_react.default.createElement(Artifact, { key: block.callId, phase: "result", block, t }))) : null;
}
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(namespace, dictionaries));
  ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({ name: "conversation.chat.turnTail", id: "interactive-artifacts", order: 0, locale: namespace }, CompletedArtifacts));
  ctx.slots.inject("tool.call.toolview", function* () {
    yield ctx.slots.register({ name: "tool.call.toolview", key: "present_artifact", locale: namespace }, ArtifactReceipt);
    yield ctx.slots.register({ name: "tool.call.toolview", key: "duckduckgo_search", locale: namespace }, Search);
  });
}

return module.exports;}});
