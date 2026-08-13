// ═══════ PV BRIDGE (service worker side) ═══════
// Connects the extension to the PV native messaging host (pv/host.mjs), which
// relays MCP tool calls from local AI agents (Claude Code, Codex, ChatGPT…).
//
// Write path: if the side panel is open, adds are executed there through the
// normal save pipeline (single writer — see src/pv-panel.js). If not, this
// module writes chrome.storage.local directly with minimal additive logic and
// notifies any panel that opens later via PV_CHANGED.
//
// Loaded by background.js via importScripts; unit-tested in Node via the
// module.exports guard at the bottom (chrome is stubbed there).

const PV_HOST_NAME = "com.sodietx.pv";
const PV_KEYS = {
  prompts:   { key: "pv_p",  root: "root",   name: "My Prompts" },
  imgprompts:{ key: "pv_ip", root: "iroot",  name: "My Image Prompts" },
  snippets:  { key: "pv_s",  root: "sroot",  name: "My Snippets" },
  bookmarks: { key: "pv_b",  root: "broot",  name: "My Bookmarks" },
  notes:     { key: "pv_n",  root: "nroot",  name: "My Notes" },
  skills:    { key: "pv_k",  root: "kroot",  name: "My Skills" },
  customgpts:{ key: "pv_g",  root: "groot",  name: "My Custom GPTs" },
};
const PV_BRIDGE_VERSION = "1.0";

const PVB = { port: null, connected: false };

function pvbLog(...a) { try { console.log("[PV]", ...a); } catch { /* fire-and-forget */ } }

// ── storage helpers ─────────────────────────────────────────────
function pvbGet(keys) { return new Promise(r => chrome.storage.local.get(keys, r)); }
function pvbSet(obj)  { return new Promise(r => chrome.storage.local.set(obj, r)); }

function pvbDefStore(rootId, name) {
  return { folders: { id: rootId, name, children: [], prompts: [], color: "" }, trash: [], nextId: 1 };
}
function pvbWalk(node, fn, path) {
  fn(node, path || []);
  (node.children || []).forEach(c => pvbWalk(c, fn, (path || []).concat(node.name)));
}
function pvbFindFolder(node, id) {
  if (node.id === id) return node;
  for (const c of node.children || []) { const r = pvbFindFolder(c, id); if (r) return r; }
  return null;
}

// ── tools ───────────────────────────────────────────────────────
async function pvbStatus() {
  const keys = Object.values(PV_KEYS).map(s => s.key);
  const res = await pvbGet(keys);
  const counts = {};
  for (const [silo, spec] of Object.entries(PV_KEYS)) {
    let n = 0;
    if (res[spec.key]?.folders) pvbWalk(res[spec.key].folders, f => { n += (f.prompts || []).length; });
    counts[silo] = n;
  }
  const manifest = chrome.runtime.getManifest ? chrome.runtime.getManifest() : { version: "?" };
  return { ok: true, extension: "Prompt Vault " + manifest.version, bridge: PV_BRIDGE_VERSION, counts };
}

async function pvbListFolders(args) {
  const silo = args?.silo;
  const silos = silo ? { [silo]: PV_KEYS[silo] } : PV_KEYS;
  if (silo && !PV_KEYS[silo]) return { error: "unknown silo: " + silo };
  const res = await pvbGet(Object.values(silos).map(s => s.key));
  const out = {};
  for (const [name, spec] of Object.entries(silos)) {
    const store = res[spec.key];
    const rows = [];
    if (store?.folders) pvbWalk(store.folders, (f, path) => {
      rows.push({ path: path.concat(f.name).slice(1).join("/") || "(root)", items: (f.prompts || []).length });
    });
    out[name] = rows;
  }
  return out;
}

async function pvbAddItem(args) {
  const silo = args?.silo;
  const spec = PV_KEYS[silo];
  if (!spec) return { error: "unknown silo: " + silo + " (use " + Object.keys(PV_KEYS).join("|") + ")" };
  const title = String(args.title || "").trim().slice(0, 200);
  if (!title) return { error: "title required" };
  if ((silo === "bookmarks" || silo === "customgpts") && !args.url) return { error: silo + " needs url" };

  // Panel-first: if the side panel is open it owns the write.
  const viaPanel = await new Promise(resolve => {
    let done = false;
    const t = setTimeout(() => { if (!done) { done = true; resolve(null); } }, 800);
    try {
      chrome.runtime.sendMessage({ type: "PV_PANEL_EXEC", tool: "pv_add_item", args }, resp => {
        if (done) return;
        done = true; clearTimeout(t);
        if (chrome.runtime.lastError || !resp?.handled) resolve(null);
        else resolve(resp.result);
      });
    } catch { if (!done) { done = true; clearTimeout(t); resolve(null); } }
  });
  if (viaPanel) return { ...viaPanel, via: "panel" };

  // Direct additive write.
  const res = await pvbGet([spec.key]);
  const store = res[spec.key]?.folders ? res[spec.key] : pvbDefStore(spec.root, spec.name);
  store.trash = store.trash || [];
  let f = pvbFindFolder(store.folders, spec.root);
  if (silo === "snippets") {
    if (!store.folders.children.find(c => c.id === "s_inbox")) {
      store.folders.children.unshift({ id: "s_inbox", name: "Inbox", children: [], prompts: [], color: "" });
    }
    if (!args.folder) f = pvbFindFolder(store.folders, "s_inbox");
  }
  for (const part of args.folder ? String(args.folder).split("/") : []) {
    const nm = part.trim(); if (!nm) continue;
    let child = (f.children || []).find(c => c.name === nm);
    if (!child) {
      child = { id: "i_" + store.nextId++, name: nm, children: [], prompts: [], color: "" };
      f.children = f.children || []; f.children.push(child);
    }
    f = child;
  }
  f.prompts = f.prompts || [];
  const dup = f.prompts.find(p => p.title === title && (p.content || "") === (args.content || ""));
  if (dup) return { id: dup.id, folder: f.name, deduped: true, via: "direct" };
  const now = Date.now();
  const item = {
    id: "i_" + store.nextId++, title, content: String(args.content || ""),
    tags: Array.isArray(args.tags) ? args.tags.map(String) : [],
    created: now, modified: now, usageCount: 0, favorited: false, versions: [],
    provenance: { source: "pv-mcp", agent: String(args.agent || ""), capturedAt: now },
  };
  if (silo === "bookmarks" || silo === "customgpts") item.url = String(args.url || "");
  if (silo === "prompts" || silo === "imgprompts") item.platform = String(args.platform || (silo === "imgprompts" ? "midjourney" : ""));
  if (silo === "snippets") {
    item.sourceUrl = String(args.source || ""); item.platform = String(args.platform || "");
    item.sourceType = item.platform ? "ai" : "web"; item.capturedAt = now;
  }
  if (silo === "skills") { item.description = item.content.split("\n")[0].slice(0, 140); item.files = {}; }
  f.prompts.push(item);
  await pvbSet({ [spec.key]: store });
  try { chrome.runtime.sendMessage({ type: "PV_CHANGED", silo }, () => { void chrome.runtime.lastError; }); } catch { /* fire-and-forget */ }
  return { id: item.id, folder: f.name, deduped: false, via: "direct" };
}

async function pvbSearch(args) {
  const q = String(args?.query || "").toLowerCase().trim();
  if (!q) return { error: "query required" };
  const limit = Math.min(50, args?.limit || 15);
  const silos = args?.silo ? { [args.silo]: PV_KEYS[args.silo] } : PV_KEYS;
  if (args?.silo && !PV_KEYS[args.silo]) return { error: "unknown silo: " + args.silo };
  const res = await pvbGet(Object.values(silos).map(s => s.key));
  const hits = [];
  for (const [name, spec] of Object.entries(silos)) {
    const store = res[spec.key]; if (!store?.folders) continue;
    pvbWalk(store.folders, (folder, path) => {
      for (const p of folder.prompts || []) {
        const title = (p.title || "").toLowerCase();
        const content = (p.content || "").toLowerCase();
        const tags = (p.tags || []).join(" ").toLowerCase();
        let score = 0;
        if (title.includes(q)) score += 3;
        if (tags.includes(q)) score += 2;
        if (content.includes(q)) score += 1;
        if (!score) return;
        const idx = content.indexOf(q);
        hits.push({
          silo: name, id: p.id, title: p.title,
          folder: path.concat(folder.name).slice(1).join("/") || "(root)",
          url: p.url || undefined,
          snippet: idx >= 0 ? (p.content || "").slice(Math.max(0, idx - 40), idx + 80).replace(/\s+/g, " ") : undefined,
          modified: p.modified, score,
        });
      }
    });
  }
  hits.sort((a, b) => b.score - a.score || (b.modified || 0) - (a.modified || 0));
  return { total: hits.length, results: hits.slice(0, limit) };
}

async function pvbGetItem(args) {
  const spec = PV_KEYS[args?.silo];
  if (!spec) return { error: "unknown silo: " + (args?.silo || "(none)") };
  const res = await pvbGet([spec.key]);
  if (!res[spec.key]?.folders) return { error: "empty silo" };
  let found = null;
  pvbWalk(res[spec.key].folders, (f, path) => {
    for (const p of f.prompts || []) if (p.id === args.id) found = { ...p, folder: path.concat(f.name).slice(1).join("/") || "(root)" };
  });
  return found || { error: "not found: " + args.id };
}

async function pvbRecent(args) {
  const limit = Math.min(50, args?.limit || 10);
  const silos = args?.silo ? { [args.silo]: PV_KEYS[args.silo] } : PV_KEYS;
  if (args?.silo && !PV_KEYS[args.silo]) return { error: "unknown silo: " + args.silo };
  const res = await pvbGet(Object.values(silos).map(s => s.key));
  const all = [];
  for (const [name, spec] of Object.entries(silos)) {
    const store = res[spec.key]; if (!store?.folders) continue;
    pvbWalk(store.folders, (f, path) => {
      for (const p of f.prompts || []) all.push({ silo: name, id: p.id, title: p.title, folder: path.concat(f.name).slice(1).join("/") || "(root)", modified: p.modified });
    });
  }
  all.sort((a, b) => (b.modified || 0) - (a.modified || 0));
  return { results: all.slice(0, limit) };
}

const PV_TOOL_IMPL = {
  pv_status: pvbStatus,
  pv_list_folders: pvbListFolders,
  pv_add_item: pvbAddItem,
  pv_search: pvbSearch,
  pv_get_item: pvbGetItem,
  pv_recent: pvbRecent,
};

async function pvbExec(tool, args) {
  const impl = PV_TOOL_IMPL[tool];
  if (!impl) return { error: "unknown tool: " + tool };
  const cfgRes = await pvbGet(["pv_cfg"]);
  if (cfgRes.pv_cfg && cfgRes.pv_cfg.pvBridgeEnabled === false) return { error: "PV bridge is disabled in Settings" };
  return impl(args || {});
}

// ── native port lifecycle ───────────────────────────────────────
function pvbConnect() {
  if (PVB.connected) return;
  let port;
  try { port = chrome.runtime.connectNative(PV_HOST_NAME); }
  catch (e) { return; } // host not installed — PV stays dormant
  PVB.port = port; PVB.connected = true;
  port.onMessage.addListener(async msg => {
    if (msg?.type === "PV_TOOL") {
      let result;
      try { result = await pvbExec(msg.tool, msg.args); }
      catch (e) { result = { error: String(e && e.message || e) }; }
      try { port.postMessage({ type: "PV_RESULT", id: msg.id, result }); } catch { /* fire-and-forget */ }
    } else if (msg?.type === "PV_PING") {
      try { port.postMessage({ type: "PV_PONG", id: msg.id }); } catch { /* fire-and-forget */ }
    }
  });
  port.onDisconnect.addListener(() => {
    PVB.port = null; PVB.connected = false;
    void chrome.runtime.lastError; // "host not found" is the normal dormant case
  });
  try { port.postMessage({ type: "PV_HELLO", bridge: PV_BRIDGE_VERSION }); } catch { /* fire-and-forget */ }
}

function pvbInit() {
  pvbConnect();
  try { chrome.alarms.create("pv-reconnect", { periodInMinutes: 1 }); } catch { /* fire-and-forget */ }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { pvbExec, pvbAddItem, pvbSearch, pvbListFolders, pvbStatus, pvbGetItem, pvbRecent, PV_KEYS };
}
