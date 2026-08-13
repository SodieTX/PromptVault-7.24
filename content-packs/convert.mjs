#!/usr/bin/env node
/**
 * Prompt Vault — Content Pack Converter
 *
 * Reads .md files from content-packs/ and compiles them into JS files
 * that the image builder auto-loads.
 *
 * Usage:
 *   node content-packs/convert.mjs
 *   node content-packs/convert.mjs --watch
 *
 * See CONTENT-PACK-FORMAT.md for the authoring spec.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, watch } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKS_DIR = __dirname;
const OUT_DIR = join(__dirname, "compiled");

// ═══ PARSERS ═══

function parseCapsulePack(text, filename) {
  const panels = [];
  let currentPanel = null;
  let currentGroup = null;
  let packName = "";

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    // Parse metadata comments before generic skip
    if (line.startsWith("<!--")) {
      const idMatch = line.match(/^<!--\s*id:\s*(.+?)\s*-->$/);
      if (idMatch && currentPanel) { currentPanel.id = idMatch[1].trim(); continue; }
      const subMatch = line.match(/^<!--\s*sub:\s*(.+?)\s*-->$/);
      if (subMatch && currentPanel) { currentPanel.sub = subMatch[1].trim(); continue; }
      continue;
    }

    // # Pack: Title (metadata, optional)
    if (line.startsWith("# ")) {
      packName = line.slice(2).replace(/^Pack:\s*/i, "").trim();
      continue;
    }

    // ## Panel Title | icon | layer
    if (line.startsWith("## ")) {
      const parts = line.slice(3).split("|").map(s => s.trim());
      const title = parts[0] || "Untitled";
      const icon = parts[1] || "📁";
      const layer = parseInt(parts[2]) || 6;
      currentPanel = { id: slugify(title), icon, title, sub: packName || "", layer, groups: [] };
      currentGroup = null;
      panels.push(currentPanel);
      continue;
    }

    // ### Group Name
    if (line.startsWith("### ")) {
      if (!currentPanel) continue;
      const label = line.slice(4).trim();
      currentGroup = { label, pills: [] };
      currentPanel.groups.push(currentGroup);
      continue;
    }

    // - value | label | description
    if (line.startsWith("- ")) {
      const content = line.slice(2).trim();
      const parts = content.split("|").map(s => s.trim());
      const v = parts[0] || "";
      const l = parts[1] || v.slice(0, 30);
      const d = parts[2] || "";
      if (!v) continue;

      // If no group yet, create a default one
      if (!currentPanel) continue;
      if (!currentGroup) {
        currentGroup = { label: "General", pills: [] };
        currentPanel.groups.push(currentGroup);
      }
      currentGroup.pills.push({ v, l, d });
      continue;
    }
  }

  return { packName, panels, source: filename };
}

function parseInfluencePack(text, filename) {
  const categories = [];
  let currentCat = null;
  let packName = "";

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("<!--")) continue;

    if (line.startsWith("# ")) {
      packName = line.slice(2).replace(/^Pack:\s*/i, "").trim();
      continue;
    }

    // ## Category Name
    if (line.startsWith("## ")) {
      const cat = line.slice(3).trim();
      currentCat = { cat, artists: [] };
      categories.push(currentCat);
      continue;
    }

    // - Name | Description
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

  return { packName, categories, source: filename };
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

// ═══ COMPILER ═══

function compileCapsulePacks(packs) {
  const allPanels = [];
  for (const pack of packs) {
    for (const panel of pack.panels) {
      allPanels.push(panel);
    }
  }

  if (!allPanels.length) return "// No capsule packs found\n";

  let js = `// ═══ AUTO-GENERATED — do not edit. Run: node content-packs/convert.mjs ═══\n`;
  js += `// Generated: ${new Date().toISOString()}\n`;
  js += `// Sources: ${packs.map(p => p.source).join(", ")}\n\n`;
  js += `const CONTENT_PACK_PANELS = ${JSON.stringify(allPanels, null, 2)};\n\n`;
  js += `// Auto-inject into MJC_LIBRARY\n`;
  js += `(function(){\n`;
  js += `  if(typeof MJC_LIBRARY==="undefined")return;\n`;
  js += `  CONTENT_PACK_PANELS.forEach(function(panel){\n`;
  js += `    if(!MJC_LIBRARY.find(function(p){return p.id===panel.id})){\n`;
  js += `      MJC_LIBRARY.push(panel);\n`;
  js += `    }\n`;
  js += `  });\n`;
  js += `})();\n`;

  return js;
}

function compileInfluencePacks(packs) {
  const allCats = [];
  for (const pack of packs) {
    for (const cat of pack.categories) {
      allCats.push(cat);
    }
  }

  if (!allCats.length) return "// No influence packs found\n";

  let js = `// ═══ AUTO-GENERATED — do not edit. Run: node content-packs/convert.mjs ═══\n`;
  js += `// Generated: ${new Date().toISOString()}\n`;
  js += `// Sources: ${packs.map(p => p.source).join(", ")}\n\n`;
  js += `const CONTENT_PACK_INFLUENCES = ${JSON.stringify(allCats, null, 2)};\n\n`;
  js += `// Auto-inject into MJ_INFLUENCE_LIBRARY\n`;
  js += `(function(){\n`;
  js += `  if(typeof MJ_INFLUENCE_LIBRARY==="undefined")return;\n`;
  js += `  CONTENT_PACK_INFLUENCES.forEach(function(cat){\n`;
  js += `    if(!MJ_INFLUENCE_LIBRARY.find(function(c){return c.cat===cat.cat})){\n`;
  js += `      MJ_INFLUENCE_LIBRARY.push(cat);\n`;
  js += `    }\n`;
  js += `  });\n`;
  js += `})();\n`;

  return js;
}

// ═══ MAIN ═══

function build() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const files = readdirSync(PACKS_DIR).filter(f => f.endsWith(".md") && f !== "CONTENT-PACK-FORMAT.md");
  const capsuleFiles = files.filter(f => f.startsWith("capsules-"));
  const influenceFiles = files.filter(f => f.startsWith("influences-"));

  const capsulePacks = capsuleFiles.map(f => {
    const text = readFileSync(join(PACKS_DIR, f), "utf8");
    return parseCapsulePack(text, f);
  });

  const influencePacks = influenceFiles.map(f => {
    const text = readFileSync(join(PACKS_DIR, f), "utf8");
    return parseInfluencePack(text, f);
  });

  const capsuleJs = compileCapsulePacks(capsulePacks);
  const influenceJs = compileInfluencePacks(influencePacks);

  writeFileSync(join(OUT_DIR, "capsule-packs.js"), capsuleJs, "utf8");
  writeFileSync(join(OUT_DIR, "influence-packs.js"), influenceJs, "utf8");

  const totalPanels = capsulePacks.reduce((s, p) => s + p.panels.length, 0);
  const totalCapsules = capsulePacks.reduce((s, p) => s + p.panels.reduce((s2, pn) => s2 + pn.groups.reduce((s3, g) => s3 + g.pills.length, 0), 0), 0);
  const totalCats = influencePacks.reduce((s, p) => s + p.categories.length, 0);
  const totalArtists = influencePacks.reduce((s, p) => s + p.categories.reduce((s2, c) => s2 + c.artists.length, 0), 0);

  console.log(`OK Compiled content packs:`);
  console.log(`   Capsules: ${capsuleFiles.length} files → ${totalPanels} panels, ${totalCapsules} capsules`);
  console.log(`   Influences: ${influenceFiles.length} files → ${totalCats} categories, ${totalArtists} artists`);
  console.log(`   Output: content-packs/compiled/`);
}

const wantWatch = process.argv.includes("--watch");
build();

if (wantWatch) {
  const debounce = (fn, ms) => { let t; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };
  const rebuild = debounce(() => { try { console.log("\n[watch] Rebuilding..."); build(); } catch (e) { console.error("[watch] Error:", e.message); } }, 300);
  watch(PACKS_DIR, (_evt, name) => { if (name && name.endsWith(".md")) rebuild(); });
  console.log("\n[watch] Watching content-packs/ for .md changes (Ctrl+C to stop)");
}
