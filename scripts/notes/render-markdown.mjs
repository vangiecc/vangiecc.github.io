import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";
import katex from "katex";

export function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function normalizeExportIndentation(markdown) {
  return markdown.split("\n").map((line) => {
    const match = line.match(/^( +)(.*)$/);
    if (!match) return line;
    const content = match[2];
    if (!content) return "";
    return content;
  }).join("\n");
}

export function rewriteMarkdownImages(markdown, mappings, sourceRoot) {
  return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full, alt, relative) => {
    const resolved = path.resolve(sourceRoot, relative.split(/[?#]/, 1)[0].replaceAll("%20", " "));
    return mappings.has(resolved) ? `![${alt}](${mappings.get(resolved)})` : full;
  });
}

function renderMath(markdown) {
  const tokens = [];
  const stash = (tex, displayMode) => {
    const token = `MATHTOKEN${tokens.length}END`;
    const normalizedTex = tex.trim().replace(/\b(DIV|MOD|INT)\b/g, "\\operatorname{$1}");
    tokens.push({ token, displayMode, html: katex.renderToString(normalizedTex, { displayMode, throwOnError: false, trust: false, strict: false }) });
    return token;
  };
  let fenced = false;
  const transformed = markdown.split("\n").map((line) => {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; return line; }
    if (fenced) return line;
    const display = line.match(/^\s*\$\$?(.+?)\$\$?\s*$/);
    if (display) return stash(display[1], true);
    return line.replace(/(?<!\\)\$(?!\$)([^$\n]+?)(?<!\\)\$(?!\$)/g, (_, tex) => stash(tex, false));
  }).join("\n");
  return { markdown: transformed, tokens };
}

function restoreMath(html, tokens) {
  return tokens.reduce((result, token) => result.replaceAll(token.token, `<span class="math-${token.displayMode ? "display" : "inline"}">${token.html}</span>`), html);
}

export function renderMarkdown(markdown) {
  const math = renderMath(normalizeExportIndentation(markdown));
  return restoreMath(marked.parse(math.markdown), math.tokens);
}

export async function copyKatexAssets(root) {
  const source = path.join(root, "node_modules", "katex", "dist");
  const destination = path.join(root, "assets", "vendor", "katex");
  await mkdir(path.join(destination, "fonts"), { recursive: true });
  await copyFile(path.join(source, "katex.min.css"), path.join(destination, "katex.min.css"));
  for (const file of await readdir(path.join(source, "fonts"))) {
    if (file.endsWith(".woff2")) await copyFile(path.join(source, "fonts", file), path.join(destination, "fonts", file));
  }
}
