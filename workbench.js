// ═══════ PROMPTVAULT WORKBENCH ═══════
// A dedicated extension page (opened in a draggable browser tab) that presents a
// silo — or the whole vault — as one editable JSON document for work LLMs
// (Cowork, Codex, computer-use agents) to operate on: add, edit, optimize,
// reorganize. "Save to Vault" validates, normalizes ids, snapshots the prior
// state for one-click revert, writes straight into chrome.storage.local, and
// pings any open side panel to reload. This tab IS the extension.

const WB_SILOS = [
  { scope: "prompts",    key: "pv_p",  root: "root",     label: "Prompts" },
  { scope: "imgprompts", key: "pv_ip", root: "iroot",    label: "Image Prompts" },
  { scope: "snippets",   key: "pv_s",  root: "sroot",    label: "Clips" },
  { scope: "bookmarks",  key: "pv_b",  root: "broot",    label: "Bookmarks" },
  { scope: "notes",      key: "pv_n",  root: "nroot",    label: "Notes" },
  { scope: "skills",     key: "pv_k",  root: "kroot",    label: "Skills" },
  { scope: "customgpts", key: "pv_g",  root: "groot",    label: "Custom GPTs" },
  { scope: "photos",     key: "pv_ph", root: "phroot",   label: "Photos" },
];
const WB_BY_SCOPE = Object.fromEntries(WB_SILOS.map(s => [s.scope, s]));
const WB_MK = "pv_m";
const $ = id => document.getElementById(id);

function sget(keys) { return new Promise(r => chrome.storage.local.get(keys, r)); }
function sset(obj)  { return new Promise(r => chrome.storage.local.set(obj, r)); }

function countItems(node) {
  let c = (node.prompts || []).length;
  (node.children || []).forEach(ch => c += countItems(ch));
  return c;
}

// Force a valid, collision-free store: canonical root id, unique ids everywhere,
// arrays present. Protects the extension from malformed LLM edits.
function normalizeStore(store, rootId) {
  if (!store || typeof store !== "object" || !store.folders || typeof store.folders !== "object") {
    throw new Error('expected an object with a "folders" root');
  }
  store.folders.id = rootId; // never let the root id drift — the app keys off it
  const seen = new Set();
  let maxN = 0;
  const scanN = id => { const m = /^i_(\d+)$/.exec(id || ""); if (m) maxN = Math.max(maxN, +m[1]); };
  (function pre(n) { scanN(n.id); (n.children || []).forEach(pre); (n.prompts || []).forEach(p => scanN(p.id)); })(store.folders);
  let next = Math.max(store.nextId || 1, maxN + 1);
  const uid = () => { let id; do { id = "i_" + (next++); } while (seen.has(id)); seen.add(id); return id; };
  (function walk(n) {
    if (!n.id || seen.has(n.id)) n.id = uid(); else seen.add(n.id);
    if (!Array.isArray(n.children)) n.children = [];
    if (!Array.isArray(n.prompts)) n.prompts = [];
    for (const p of n.prompts) {
      if (!p.id || seen.has(p.id)) p.id = uid(); else seen.add(p.id);
      if (typeof p.title !== "string") p.title = p.title == null ? "" : String(p.title);
    }
    n.children.forEach(walk);
  })(store.folders);
  store.nextId = next;
  if (!Array.isArray(store.trash)) store.trash = [];
  return countItems(store.folders);
}

function setStatus(msg, cls) { const s = $("status"); s.textContent = msg; s.className = cls || ""; }

let currentScope = "prompts";
function validScope(s) { return s === "vault" || !!WB_BY_SCOPE[s]; }

function hintFor(scope) {
  if (scope === "vault") {
    return `The document is a JSON object keyed by silo (<code>prompts</code>, <code>notes</code>, …). Each silo is a store: <code>{folders, trash, nextId, collections}</code>. Edit any store the same way as a single silo (below). <strong>Save to Vault</strong> writes every silo back.`;
  }
  return `The document is one silo's store: <code>{ "folders": {…}, "trash": [], "nextId": N, "collections": [] }</code>.
  Each folder is <code>{ id, name, color, children:[…folders], prompts:[…items] }</code>; the root is the top folder.
  An <strong>item</strong> is <code>{ id, title, content, tags:[], url?, platform? }</code> (extra fields are preserved).
  <br><br><strong>To edit</strong>: change fields, keep the item's <code>id</code>. <strong>To add</strong>: append an object to a folder's <code>prompts</code> — omit <code>id</code> and one is assigned. <strong>To delete</strong>: remove the object. <strong>To organize</strong>: move items between <code>prompts</code> arrays, reorder arrays, or add folders under <code>children</code>.
  <br><br>On <strong>Save</strong> the JSON is validated, ids are made unique, the root id is fixed, the prior state is snapshotted (use <em>Revert last save</em>), and the vault + any open side panel update immediately.`;
}

async function loadScope() {
  const scope = validScope(currentScope) ? currentScope : "prompts";
  currentScope = scope;
  $("scope").value = scope;
  $("hintBody").innerHTML = hintFor(scope);
  const sh = $("scopeHint");
  if (sh) sh.innerHTML = scope === "vault"
    ? `<b>Scope: whole vault</b> — edit any silo's store under its key.`
    : `<b>Scope: ${WB_BY_SCOPE[scope]?.label || scope}</b> only — this document is just that one silo.`;
  $("footScope").textContent = "Scope: " + (scope === "vault" ? "Whole vault" : (WB_BY_SCOPE[scope]?.label || scope));
  setStatus("Loading…");
  try {
    if (scope === "vault") {
      const res = await sget(WB_SILOS.map(s => s.key));
      const doc = {};
      for (const s of WB_SILOS) doc[s.scope] = res[s.key] || { folders: { id: s.root, name: s.label, color: "", children: [], prompts: [] }, trash: [], nextId: 1 };
      $("wbText").value = JSON.stringify(doc, null, 2);
      let total = 0; for (const s of WB_SILOS) total += countItems(doc[s.scope].folders || { prompts: [] });
      setStatus(`Loaded whole vault · ${total} items`, "ok");
    } else {
      const info = WB_BY_SCOPE[scope];
      const res = await sget([info.key]);
      const store = res[info.key] || { folders: { id: info.root, name: info.label, color: "", children: [], prompts: [] }, trash: [], nextId: 1 };
      $("wbText").value = JSON.stringify(store, null, 2);
      setStatus(`Loaded ${info.label} · ${countItems(store.folders)} items`, "ok");
    }
  } catch (e) { setStatus("Load failed: " + e.message, "err"); }
}

async function saveScope() {
  const scope = currentScope;
  let parsed;
  try { parsed = JSON.parse($("wbText").value); }
  catch (e) { setStatus("Invalid JSON — " + e.message, "err"); return; }
  try {
    if (scope === "vault") {
      if (!parsed || typeof parsed !== "object") throw new Error("expected a vault object");
      const backup = {}, writes = {}; let total = 0;
      for (const s of WB_SILOS) {
        if (!parsed[s.scope]) continue;
        total += normalizeStore(parsed[s.scope], s.root);
        writes[s.key] = parsed[s.scope];
      }
      const cur = await sget(WB_SILOS.map(s => s.key));
      for (const s of WB_SILOS) if (writes[s.key]) backup["pv_wb_bak_" + s.key] = cur[s.key] || null;
      await sset(backup);
      await sset(writes);
      await bumpMeta();
      broadcast();
      setStatus(`Saved whole vault · ${total} items · ${new Date().toLocaleTimeString()}`, "ok");
    } else {
      const info = WB_BY_SCOPE[scope];
      const n = normalizeStore(parsed, info.root);
      const cur = await sget([info.key]);
      await sset({ ["pv_wb_bak_" + info.key]: cur[info.key] || null });
      await sset({ [info.key]: parsed });
      await bumpMeta();
      broadcast();
      // reflect normalization (assigned ids) back into the editor
      $("wbText").value = JSON.stringify(parsed, null, 2);
      setStatus(`Saved ${info.label} · ${n} items · ${new Date().toLocaleTimeString()}`, "ok");
    }
  } catch (e) { setStatus("Save refused: " + e.message, "err"); }
}

async function revertScope() {
  const scope = currentScope;
  const keys = scope === "vault" ? WB_SILOS.map(s => s.key) : [WB_BY_SCOPE[scope].key];
  const bakKeys = keys.map(k => "pv_wb_bak_" + k);
  const res = await sget(bakKeys);
  const writes = {};
  let found = false;
  keys.forEach((k, i) => { const b = res["pv_wb_bak_" + k]; if (b !== undefined) { writes[k] = b; found = true; } });
  if (!found) { setStatus("No prior save to revert to", "err"); return; }
  await sset(writes);
  await bumpMeta();
  broadcast();
  await loadScope();
  setStatus("Reverted to the state before your last save", "ok");
}

async function bumpMeta() {
  const res = await sget([WB_MK]);
  const meta = res[WB_MK] || {};
  meta.sc = (meta.sc || 0) + 1;
  await sset({ [WB_MK]: meta });
}
function broadcast() {
  try { chrome.runtime.sendMessage({ type: "PV_CHANGED" }, () => void chrome.runtime.lastError); } catch (_) { /* panel may be closed */ }
  try { chrome.runtime.sendMessage({ type: "DATA_CHANGED" }, () => void chrome.runtime.lastError); } catch (_) { /* noop */ }
  try { chrome.runtime.sendMessage({ type: "REBUILD_MENUS" }, () => void chrome.runtime.lastError); } catch (_) { /* noop */ }
}

// The machine-readable contract embedded in the page, for JS/DOM agents.
function wbContract() {
  try { return JSON.parse(document.getElementById("pv-contract").textContent); }
  catch (_) { return null; }
}
// Current-state snapshot an agent can read before/after editing.
function wbInfo() {
  let doc = null, itemCount = null, keys = null, root = null;
  try {
    doc = JSON.parse($("wbText").value);
    if (currentScope === "vault") { keys = Object.keys(doc); itemCount = Object.values(doc).reduce((n, s) => n + (s && s.folders ? countItems(s.folders) : 0), 0); }
    else { itemCount = doc && doc.folders ? countItems(doc.folders) : 0; root = doc && doc.folders ? doc.folders.id : null; }
  } catch (_) { /* editor may hold work-in-progress invalid JSON */ }
  return { scope: currentScope, itemCount, root, keys, status: $("status").textContent, valid: doc !== null };
}

// Programmatic hooks for an agent that can run JS (bonus over the textarea).
window.pvWorkbench = {
  get: () => $("wbText").value,
  set: v => { $("wbText").value = v; },
  save: saveScope,
  reload: loadScope,
  revert: revertScope,
  scopes: () => WB_SILOS.map(s => s.scope).concat("vault"),
  help: wbContract,
  info: wbInfo,
};

function init() {
  const p = new URLSearchParams(location.search).get("scope");
  currentScope = validScope(p) ? p : "prompts";
  const sel = $("scope");
  WB_SILOS.forEach(s => { const o = document.createElement("option"); o.value = s.scope; o.textContent = s.label; sel.appendChild(o); });
  const o = document.createElement("option"); o.value = "vault"; o.textContent = "Whole vault"; sel.appendChild(o);
  sel.addEventListener("change", () => { currentScope = sel.value; loadScope(); });
  $("save").addEventListener("click", saveScope);
  $("reload").addEventListener("click", loadScope);
  $("revert").addEventListener("click", revertScope);
  document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); saveScope(); } });
  loadScope();
}
init();
