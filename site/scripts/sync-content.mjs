import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(siteRoot, "..");
const catalog = JSON.parse(fs.readFileSync(path.join(repoRoot, "catalog", "challenges.json"), "utf8"));

function frontmatter(markdown) {
  if (!markdown.startsWith("---\n")) return { attributes: {}, body: markdown.trim() };
  const end = markdown.indexOf("\n---\n", 4);
  if (end === -1) return { attributes: {}, body: markdown.trim() };
  const attributes = {};
  for (const line of markdown.slice(4, end).split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    attributes[key] = value;
  }
  return { attributes, body: markdown.slice(end + 5).trim() };
}

const challenges = catalog.challenges.map((challenge) => {
  const workspaceReadme = fs.readFileSync(path.join(repoRoot, challenge.workspace, "README.md"), "utf8");
  const status = workspaceReadme.match(/^status: (todo|solving|solved|blocked)$/m)?.[1] ?? "todo";
  const writeupPath = path.join(repoRoot, "writeups", `${challenge.id}.md`);
  let writeup = null;
  if (fs.existsSync(writeupPath)) {
    const parsed = frontmatter(fs.readFileSync(writeupPath, "utf8"));
    writeup = { title: parsed.attributes.title || challenge.name, body: parsed.body };
  }
  return { ...challenge, status, writeup };
});

fs.mkdirSync(path.join(siteRoot, "data"), { recursive: true });
fs.writeFileSync(path.join(siteRoot, "data", "content.json"), `${JSON.stringify({ source_revision: catalog.source_revision, challenges }, null, 2)}\n`);
console.log(`Synced ${challenges.length} challenges and ${challenges.filter((item) => item.writeup).length} write-ups`);
