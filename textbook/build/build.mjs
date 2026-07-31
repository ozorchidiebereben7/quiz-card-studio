/* ============================================================
   build.mjs — Markdown -> styled HTML -> PDF (Chromium)
   Usage:
     node build.mjs <input.md> <output.pdf> ["Book Title"] ["Part label"]
   Renders Mermaid code fences as diagrams and GitHub-style
   callouts ([!NOTE], [!WARNING], [!TIP], [!BEST], [!DEBUG]).
   ============================================================ */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, basename } from "node:path";
import { marked } from "marked";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));

const [, , inPath, outPath, bookTitle = "", partLabel = ""] = process.argv;
if (!inPath || !outPath) {
  console.error("Usage: node build.mjs <input.md> <output.pdf> [title] [part]");
  process.exit(1);
}

const css = readFileSync(resolve(__dirname, "book.css"), "utf8");
const mermaidJs = readFileSync(
  resolve(__dirname, "node_modules/mermaid/dist/mermaid.min.js"),
  "utf8"
);

let md = readFileSync(resolve(inPath), "utf8");

/* ---- Extract mermaid fenced blocks so marked doesn't touch them ---- */
const mermaidBlocks = [];
md = md.replace(/```mermaid\s*\n([\s\S]*?)```/g, (_, code) => {
  const idx = mermaidBlocks.length;
  mermaidBlocks.push(code.trim());
  return `\n@@MERMAID_${idx}@@\n`;
});

/* ---- Configure marked ---- */
marked.setOptions({ gfm: true, breaks: false, headerIds: true, mangle: false });

/* ---- Callout renderer: GitHub admonition syntax in blockquotes ---- */
const calloutMeta = {
  NOTE:    { cls: "note",    label: "📘 Note" },
  WARNING: { cls: "warning", label: "⚠️ Warning" },
  TIP:     { cls: "tip",     label: "✅ Best Practice" },
  BEST:    { cls: "best",    label: "🏆 Production Standard" },
  DEBUG:   { cls: "debug",   label: "🐞 Debugging Tip" },
  INFO:    { cls: "note",    label: "ℹ️ Info" },
};

const renderer = new marked.Renderer();
const baseBlockquote = renderer.blockquote.bind(renderer);
renderer.blockquote = (quote) => {
  const m = quote.match(/^\s*<p>\s*\[!(\w+)\]\s*(<br\s*\/?>)?/i);
  if (m) {
    const key = m[1].toUpperCase();
    const meta = calloutMeta[key];
    if (meta) {
      let inner = quote.replace(/^\s*<p>\s*\[!\w+\]\s*(<br\s*\/?>)?/i, "<p>");
      inner = inner.replace(/<p>\s*<\/p>/g, "");
      return `<div class="callout ${meta.cls}"><span class="callout-title">${meta.label}</span>${inner}</div>`;
    }
  }
  return baseBlockquote(quote);
};

let bodyHtml = marked.parse(md, { renderer });

/* ---- Reinsert mermaid blocks as <pre class="mermaid"> ---- */
bodyHtml = bodyHtml.replace(/@@MERMAID_(\d+)@@/g, (_, i) => {
  const code = mermaidBlocks[Number(i)]
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<pre class="mermaid">${code}</pre>`;
});
// unwrap accidental <p>@@..@@</p>
bodyHtml = bodyHtml.replace(/<p>\s*(<pre class="mermaid">[\s\S]*?<\/pre>)\s*<\/p>/g, "$1");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${bookTitle || basename(inPath)}</title>
<style>${css}</style>
</head>
<body>
<div class="page">${bodyHtml}</div>
<script>${mermaidJs}</script>
<script>
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: {
      primaryColor: "#fdecf1", primaryBorderColor: "#ea4b71",
      primaryTextColor: "#1a2332", lineColor: "#3d4a5c",
      fontFamily: "Helvetica Neue, Arial, sans-serif", fontSize: "15px",
      clusterBkg: "#f7f9fc", clusterBorder: "#d8dee9"
    },
    flowchart: { htmlLabels: true, curve: "basis", useMaxWidth: true },
    sequence: { useMaxWidth: true }
  });
  window.__mermaidDone = mermaid.run({ querySelector: ".mermaid" })
    .then(() => { window.__ready = true; })
    .catch((e) => { window.__err = String(e); window.__ready = true; });
</script>
</body>
</html>`;

const htmlOut = outPath.replace(/\.pdf$/, ".html");
writeFileSync(htmlOut, html);

const footerTitle = (partLabel || bookTitle || "The n8n Automation Textbook")
  .replace(/</g, "&lt;");

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox", "--font-render-hinting=none"],
});
const pageCtx = await browser.newPage();
await pageCtx.goto("file://" + resolve(htmlOut), { waitUntil: "networkidle" });
await pageCtx.waitForFunction("window.__ready === true", { timeout: 120000 }).catch(() => {});
const err = await pageCtx.evaluate("window.__err || ''");
if (err) console.warn("  ⚠ mermaid:", err);
await pageCtx.waitForTimeout(400);

await pageCtx.pdf({
  path: resolve(outPath),
  format: "A4",
  printBackground: true,
  margin: { top: "20mm", bottom: "18mm", left: "18mm", right: "18mm" },
  displayHeaderFooter: true,
  headerTemplate: `<div style="font-family:Helvetica,Arial;font-size:7pt;color:#9aa4b2;width:100%;padding:0 18mm;text-align:right;">${footerTitle}</div>`,
  footerTemplate: `<div style="font-family:Helvetica,Arial;font-size:7.5pt;color:#6b7688;width:100%;padding:0 18mm;display:flex;justify-content:space-between;">
    <span>The n8n Automation Textbook</span>
    <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
  </div>`,
});

await browser.close();
console.log("  ✔ PDF:", basename(outPath));
