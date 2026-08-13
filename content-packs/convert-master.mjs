#!/usr/bin/env node
/**
 * Prompt Vault — Master Library Converter (Round-Trip)
 *
 * Reads MASTER-capsules.md and MASTER-influences.md, converts them back
 * to the JS source files. This OVERWRITES mj-library.js and the relevant
 * arrays in imgbuilder-extensions.js.
 *
 * Usage:
 *   node content-packs/convert-master.mjs
 *
 * Prerequisite: run export-library.mjs first to get the MASTER .md files.
 *
 * IMPORTANT: This replaces the entire library, not just additions.
 * For additive-only changes, use convert.mjs with capsules-*.md files instead.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ═══ PARSE (same logic as convert.mjs) ═══

function parseCapsuleMd(text) {
  const panels = [];
  let currentPanel = null;
  let currentGroup = null;

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    // Parse metadata comments (id, sub, source) — must come before the generic comment skip
    if (line.startsWith("<!--")) {
      const idMatch = line.match(/^<!--\s*id:\s*(.+?)\s*-->$/);
      if (idMatch && currentPanel) { currentPanel.id = idMatch[1].trim(); continue; }
      const subMatch = line.match(/^<!--\s*sub:\s*(.+?)\s*-->$/);
      if (subMatch && currentPanel) { currentPanel.sub = subMatch[1].trim(); continue; }
      const srcMatch = line.match(/^<!--\s*source:\s*(.+?)\s*-->$/);
      if (srcMatch && currentPanel) { currentPanel._source = srcMatch[1].trim(); continue; }
      continue; // skip other comments
    }
    if (line.startsWith("# ")) continue; // pack title, skip

    if (line.startsWith("## ")) {
      const parts = line.slice(3).split("|").map(s => s.trim());
      const title = parts[0] || "Untitled";
      const icon = parts[1] || "📁";
      const layer = parseInt(parts[2]) || 6;
      // Use slugified title as fallback ID; metadata comment overrides it
      currentPanel = { id: slugify(title), icon, title, layer, groups: [], sub: "" };
      currentGroup = null;
      panels.push(currentPanel);
      continue;
    }

    if (line.startsWith("### ")) {
      if (!currentPanel) continue;
      currentGroup = { label: line.slice(4).trim(), pills: [] };
      currentPanel.groups.push(currentGroup);
      continue;
    }

    if (line.startsWith("- ")) {
      if (!currentPanel) continue;
      if (!currentGroup) {
        currentGroup = { label: "General", pills: [] };
        currentPanel.groups.push(currentGroup);
      }
      const content = line.slice(2).trim();
      const parts = content.split("|").map(s => s.trim());
      const v = parts[0] || "";
      const l = parts[1] || v.slice(0, 30);
      const d = parts[2] || "";
      if (v) currentGroup.pills.push({ v, l, d });
      continue;
    }
  }
  return panels;
}

function parseInfluenceMd(text) {
  const categories = [];
  let currentCat = null;

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("<!--")) {
      const srcMatch = line.match(/^<!--\s*source:\s*(.+?)\s*-->$/);
      if (srcMatch && currentCat) { currentCat._source = srcMatch[1].trim(); continue; }
      continue;
    }
    if (line.startsWith("# ")) continue;

    if (line.startsWith("## ")) {
      currentCat = { cat: line.slice(3).trim(), artists: [], _source: "core" };
      categories.push(currentCat);
      continue;
    }

    if (line.startsWith("- ")) {
      if (!currentCat) continue;
      const content = line.slice(2).trim();
      const pipe = content.indexOf("|");
      if (pipe > 0) {
        currentCat.artists.push({
          name: content.slice(0, pipe).trim(),
          d: content.slice(pipe + 1).trim(),
        });
      } else {
        currentCat.artists.push({ name: content, d: "" });
      }
      continue;
    }
  }
  return categories;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

// ═══ ICON ENCODING ═══
// The original mj-library.js uses HTML entities for icons. We need to convert
// emoji back to entities for consistency.
function emojiToEntity(str) {
  let out = "";
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (cp > 127) out += `&#${cp};`;
    else out += ch;
  }
  return out;
}

// ═══ GENERATE JS ═══

function generateMjLibraryJs(panels) {
  let js = `// ═══════════════════════════════════════════════════════════════════\n`;
  js += `// PROMPT VAULT — PROFESSIONAL MIDJOURNEY CREATIVE LIBRARY\n`;
  js += `// ═══════════════════════════════════════════════════════════════════\n`;
  js += `// AUTO-GENERATED from MASTER-capsules.md — edit the .md, not this file.\n`;
  js += `// Run: node content-packs/export-library.mjs (to export)\n`;
  js += `//      node content-packs/convert-master.mjs (to import back)\n`;
  js += `// Generated: ${new Date().toISOString()}\n`;
  js += `//\n`;
  js += `// Compilation Layers:\n`;
  js += `//   1 = Subject & Action        (user-typed, not in pills)\n`;
  js += `//   2 = Character Detail         (face, skin, hair, wardrobe, emotion)\n`;
  js += `//   3 = Scene & Environment      (weather, atmosphere, setting)\n`;
  js += `//   4 = Camera & Composition     (lens, angle, framing, motion, filters)\n`;
  js += `//   5 = Lighting                 (all lighting setups)\n`;
  js += `//   6 = Style & Medium           (film, color grade, era, genre, render, post)\n`;
  js += `//   7 = Influences               (artist blend — handled by influence mixer)\n`;
  js += `//   8 = Parameters               (--ar, --v, --s, etc — handled by param builder)\n`;
  js += `// ═══════════════════════════════════════════════════════════════════\n\n`;
  js += `const MJC_LIBRARY = [\n\n`;

  for (const panel of panels) {
    const icon = emojiToEntity(panel.icon || "📁");
    js += `{id:"${panel.id}",icon:"${icon}",title:"${esc(panel.title)}",sub:"${esc(panel.sub || "")}",layer:${panel.layer},groups:[\n`;
    for (const group of (panel.groups || [])) {
      js += `  {label:"${esc(group.label)}",pills:[\n`;
      for (const pill of (group.pills || [])) {
        js += `    {v:"${esc(pill.v)}",l:"${esc(pill.l)}",d:"${esc(pill.d)}"},\n`;
      }
      js += `  ]},\n`;
    }
    js += `]},\n\n`;
  }

  js += `];\n`;
  return js;
}

function generateInfluenceSection(categories) {
  let js = `const MJ_INFLUENCE_LIBRARY = [\n`;
  for (const cat of categories) {
    js += `  {cat:"${esc(cat.cat)}",artists:[\n`;
    for (const a of (cat.artists || [])) {
      js += `    {name:"${esc(a.name)}",d:"${esc(a.d)}"},\n`;
    }
    js += `  ]},\n`;
  }
  js += `];\n`;
  return js;
}

function esc(s) {
  return (s || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

// ═══ MAIN ═══

const capsuleFile = join(__dirname, "MASTER-capsules.md");
const influenceFile = join(__dirname, "MASTER-influences.md");

if (!existsSync(capsuleFile)) {
  console.error("MASTER-capsules.md not found. Run export-library.mjs first.");
  process.exit(1);
}
if (!existsSync(influenceFile)) {
  console.error("MASTER-influences.md not found. Run export-library.mjs first.");
  process.exit(1);
}

const capsuleMd = readFileSync(capsuleFile, "utf8");
const influenceMd = readFileSync(influenceFile, "utf8");

const panels = parseCapsuleMd(capsuleMd);
const categories = parseInfluenceMd(influenceMd);

// Split panels by source tag (embedded by exporter). Default to "core" for new/untagged panels.
const corePanels = panels.filter(p => (p._source || "core") === "core");
const extPanels = panels.filter(p => p._source === "ext");

// Split influences by source tag
const coreInfluences = categories.filter(c => (c._source || "core") === "core");
const extInfluences = categories.filter(c => c._source === "ext");

// Generate core library (mj-library.js) — capsules + core influences
let mjLib = generateMjLibraryJs(corePanels);
mjLib += `\n`;
mjLib += generateInfluenceSection(coreInfluences);

// Write
const mjLibPath = join(ROOT, "src", "mj-library.js");
writeFileSync(mjLibPath, mjLib, "utf8");

// Count
const coreCapCount = corePanels.reduce((s, p) => s + (p.groups || []).reduce((s2, g) => s2 + (g.pills || []).length, 0), 0);
const coreArtCount = coreInfluences.reduce((s, c) => s + (c.artists || []).length, 0);
const extCapCount = extPanels.reduce((s, p) => s + (p.groups || []).reduce((s2, g) => s2 + (g.pills || []).length, 0), 0);
const extArtCount = extInfluences.reduce((s, c) => s + (c.artists || []).length, 0);

console.log(`OK Master library converted:`);
console.log(`   src/mj-library.js: ${corePanels.length} panels (${coreCapCount} capsules), ${coreInfluences.length} categories (${coreArtCount} artists)`);
if (extPanels.length || extInfluences.length) {
  console.log(`   Extension panels: ${extPanels.length} (${extCapCount} capsules), ${extInfluences.length} categories (${extArtCount} artists)`);
  console.log(`   (Extension content stays in imgbuilder-extensions.js — edit that file directly or use additive packs)`);
}
console.log(`\nNext: reload extension on chrome://extensions`);
console.log(`(If you also changed src/ files: run npm run build first to rebuild vault.js)`);
