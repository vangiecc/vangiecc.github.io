import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const sourceRoot = path.join(projectRoot, "notes", "CS+755cf848-063d-44c", "CS+755cf848-063d-44cd-8126-c4ead1ceeebf");

export async function chapterSourcePath(chapter) {
  const matches = (await readdir(sourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.startsWith(chapter.sourcePrefix) && entry.name.endsWith(".md"));
  if (matches.length !== 1) throw new Error(`${chapter.slug}: expected one source Markdown file, found ${matches.length}`);
  return path.join(sourceRoot, matches[0].name);
}

export function validateManifest(chapter, source) {
  const lines = source.split("\n");
  const meaningfulLines = new Set(lines.flatMap((line, index) => line.trim() ? [index + 1] : []));
  const coveredLines = new Set();
  const ids = new Set();
  const visit = (node) => {
    if (!node.id || ids.has(node.id)) throw new Error(`${chapter.slug}: duplicate node id ${node.id}`);
    ids.add(node.id);
    const hasStart = Number.isInteger(node.startLine);
    const hasEnd = Number.isInteger(node.endLine);
    if (hasStart !== hasEnd) throw new Error(`${chapter.slug}/${node.id}: both startLine and endLine are required`);
    if (hasStart) {
      if (node.startLine < 1 || node.endLine < node.startLine || node.endLine > lines.length) throw new Error(`${chapter.slug}/${node.id}: invalid range ${node.startLine}-${node.endLine}`);
      for (let line = node.startLine; line <= node.endLine; line += 1) {
        if (!meaningfulLines.has(line)) continue;
        if (coveredLines.has(line)) throw new Error(`${chapter.slug}/${node.id}: overlap at line ${line}`);
        coveredLines.add(line);
      }
    }
    for (const child of node.children ?? []) visit(child);
  };
  for (const node of chapter.nodes ?? []) visit(node);
  for (const line of meaningfulLines) if (!coveredLines.has(line)) throw new Error(`${chapter.slug}: uncovered content at line ${line}`);
  return { coveredLines, meaningfulLines };
}

export async function loadChapter(chapter) {
  const file = await chapterSourcePath(chapter);
  const source = await readFile(file, "utf8");
  validateManifest(chapter, source);
  return { file, source };
}
