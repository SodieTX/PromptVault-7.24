#!/usr/bin/env node
/**
 * Prompt Vault — Library Exporter
 *
 * Reads the current mj-library.js + imgbuilder-extensions.js and exports
 * the entire library as editable .md files. This is the "export" half of
 * the round-trip. The "import" half is convert.mjs.
 *
 * Usage:
 *   node content-packs/export-library.mjs
 *
 * Output:
 *   content-packs/MASTER-capsules.md    — every capsule panel in the system
 *   content-packs/MASTER-influences.md  — every influence category in the system
 *
 * Workflow:
 *   1. Run this exporter → get MASTER .md files
 *   2. Edit the .md files (add sections, artists, capsules)
 *   3. Run: node content-packs/convert-master.mjs
 *      (this overwrites mj-library.js and imgbuilder-extensions.js)
 *   4. Reload extension
 *
 *   OR: for additive packs (don't touch existing, just add new):
 *   1. Create capsules-*.md / influences-*.md
 *   2. Run: node content-packs/convert.mjs
 *   3. Reload extension
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ═══ LOAD THE LIBRARIES BY EXECUTING THE JS FILES ═══

function loadLibraries() {
  const sandbox = {
    console,
    Array, Object, String, Number, Boolean, Date, JSON, Math,
    parseInt, parseFloat, Set, Map, RegExp,
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  // Load mj-library.js
  const libCode = readFileSync(join(ROOT, "src", "mj-library.js"), "utf8");
  // const is block-scoped in VM — append extraction to make values accessible
  const extractLib = libCode + `\nvar __MJC = MJC_LIBRARY; var __MJI = MJ_INFLUENCE_LIBRARY;\n`;
  vm.runInContext(extractLib, sandbox);

  // Load imgbuilder-extensions.js for ILLUSTRATION_PANELS and EXPANDED_INFLUENCES
  let extCapsules = [];
  let extInfluences = [];
  try {
    const extCode = readFileSync(join(ROOT, "imgbuilder-extensions.js"), "utf8");
    // Extract just the two arrays we need — the file has DOM code that can't run in Node
    const capMatch = extCode.match(/const ILLUSTRATION_PANELS\s*=\s*(\[[\s\S]*?\n\];)/);
    const infMatch = extCode.match(/const EXPANDED_INFLUENCES\s*=\s*(\[[\s\S]*?\n\];)/);
    if (capMatch) {
      try { extCapsules = vm.runInContext("(" + capMatch[1].slice(0, -1) + ")", sandbox); } catch (e) { console.warn("Note: capsule extraction:", e.message); }
    }
    if (infMatch) {
      try { extInfluences = vm.runInContext("(" + infMatch[1].slice(0, -1) + ")", sandbox); } catch (e) { console.warn("Note: influence extraction:", e.message); }
    }
  } catch (e) {
    console.warn("Note: extension load:", e.message);
  }

  return {
    capsules: sandbox.__MJC || [],
    influences: sandbox.__MJI || [],
    extCapsules,
    extInfluences,
  };
}

// ═══ EXPORT TO MARKDOWN ═══

function decodeHtml(str) {
  return (str || "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

function exportCapsules(panels, title) {
  let md = `# ${title}\n`;
  md += `<!-- Exported ${new Date().toISOString()} -->\n`;
  md += `<!-- Format: ## Panel Title | icon | layer -->\n`;
  md += `<!--         ### Group Name -->\n`;
  md += `<!--         - prompt value | Label | Description -->\n\n`;

  for (const panel of panels) {
    const icon = decodeHtml(panel.icon || "📁");
    const layer = panel.layer || 6;
    md += `## ${panel.title} | ${icon} | ${layer}\n`;
    // Embed original ID so round-trip preserves PILLAR_MAP references
    if (panel.id) md += `<!-- id: ${panel.id} -->\n`;
    if (panel._source) md += `<!-- source: ${panel._source} -->\n`;
    if (panel.sub) md += `<!-- sub: ${panel.sub} -->\n`;
    md += `\n`;

    for (const group of (panel.groups || [])) {
      md += `### ${group.label}\n`;
      for (const pill of (group.pills || [])) {
        const parts = [pill.v];
        if (pill.l && pill.l !== pill.v) parts.push(pill.l);
        else parts.push(pill.v.slice(0, 30));
        if (pill.d) parts.push(pill.d);
        md += `- ${parts.join(" | ")}\n`;
      }
      md += `\n`;
    }
  }

  return md;
}

function exportInfluences(categories, title) {
  let md = `# ${title}\n`;
  md += `<!-- Exported ${new Date().toISOString()} -->\n`;
  md += `<!-- Format: ## Category Name -->\n`;
  md += `<!--         - Artist Name | Description -->\n\n`;

  for (const cat of categories) {
    md += `## ${cat.cat}\n`;
    if (cat._source) md += `<!-- source: ${cat._source} -->\n`;
    for (const artist of (cat.artists || [])) {
      md += `- ${artist.name} | ${artist.d || ""}\n`;
    }
    md += `\n`;
  }

  return md;
}

// ═══ MAIN ═══

const libs = loadLibraries();

// Combine core + extension capsules, tagging source
const allCapsules = [
  ...libs.capsules.map(p => ({...p, _source: "core"})),
  ...libs.extCapsules.map(p => ({...p, _source: "ext"})),
];
const allInfluences = [
  ...libs.influences.map(c => ({...c, _source: "core"})),
  ...libs.extInfluences.map(c => ({...c, _source: "ext"})),
];

const capsuleMd = exportCapsules(allCapsules, "Pack: Master Capsule Library");
const influenceMd = exportInfluences(allInfluences, "Pack: Master Influence Library");

writeFileSync(join(__dirname, "MASTER-capsules.md"), capsuleMd, "utf8");
writeFileSync(join(__dirname, "MASTER-influences.md"), influenceMd, "utf8");

const capsuleCount = allCapsules.reduce((s, p) => s + (p.groups || []).reduce((s2, g) => s2 + (g.pills || []).length, 0), 0);
const artistCount = allInfluences.reduce((s, c) => s + (c.artists || []).length, 0);

console.log(`OK Exported master library:`);
console.log(`   MASTER-capsules.md: ${allCapsules.length} panels, ${capsuleCount} capsules`);
console.log(`   MASTER-influences.md: ${allInfluences.length} categories, ${artistCount} artists`);
console.log(`\nEdit these files, then run: node content-packs/convert-master.mjs`);
