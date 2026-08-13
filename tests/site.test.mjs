import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("home exposes the shared semantic shell and four real routes", async () => {
  const html = await read("index.html");

  assert.match(html, /<header class="site-header">/);
  assert.match(html, /<nav[^>]+aria-label="Primary"/);
  assert.match(html, /<main[^>]+class="site-main/);
  assert.match(html, /<footer class="site-footer">/);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/blog\/"/);
  assert.match(html, /href="\/notes\/"/);
  assert.match(html, /href="\/research\/"/);
  assert.match(
    html,
    /class="theme-toggle"[^>]+aria-label="Switch to light theme"[^>]+title="Switch to light theme"/,
  );
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});

test("home applies the theme before loading the stylesheet", async () => {
  const html = await read("index.html");
  const bootstrap = html.indexOf("localStorage.getItem('vangie-theme')");
  const stylesheet = html.indexOf('href="/assets/css/site.css"');

  assert.ok(bootstrap > -1);
  assert.ok(stylesheet > bootstrap);
  assert.match(html, /type="module" src="\/assets\/js\/theme\.js"/);
});

test("critical CSS tokens and accessibility rules exist", async () => {
  const css = await read("assets/css/site.css");

  for (const value of [
    "#080a10",
    "#0d1017",
    "#12161f",
    "#eef1f8",
    "#aab3c7",
    "#6f7a92",
    "#46e0b0",
    "#5a97e0",
    "#d98a2b",
    "#efece3",
  ]) {
    assert.ok(css.includes(value), `missing ${value}`);
  }
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /34px/);
});
