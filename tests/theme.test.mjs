import test from "node:test";
import assert from "node:assert/strict";
import { resolveTheme, setTheme } from "../assets/js/theme.js";

test("resolveTheme prefers a valid saved value", () => {
  assert.equal(resolveTheme("dark", true), "dark");
  assert.equal(resolveTheme("light", false), "light");
});

test("resolveTheme falls back to the system preference", () => {
  assert.equal(resolveTheme(null, true), "light");
  assert.equal(resolveTheme(null, false), "dark");
  assert.equal(resolveTheme("invalid", false), "dark");
});

test("setTheme updates the root and persists the value", () => {
  const root = { dataset: {} };
  const writes = [];
  const storage = { setItem: (key, value) => writes.push([key, value]) };

  setTheme(root, storage, "light");

  assert.equal(root.dataset.theme, "light");
  assert.deepEqual(writes, [["vangie-theme", "light"]]);
});
