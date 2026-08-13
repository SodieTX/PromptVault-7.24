// ═══════ FULLVIEW SHARED UTILITIES ═══════
// Loaded by fullview-*.html pages BEFORE their specific JS.
// Fullview pages are isolated HTML documents — no collision with vault.js.
// Uses function declarations so page-specific overrides (e.g. fullview.js flash) win.

function $(id) { return document.getElementById(id); }
function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
function deepClone(o) { return JSON.parse(JSON.stringify(o)); }
function cloneObj(o) { return JSON.parse(JSON.stringify(o)); }
function tokenEstimate(t) { return Math.ceil((t || "").length / 4); }
function tok(t) { return Math.ceil((t || "").length / 4); }
function formatDate(t) { return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
function formatDateTime(t) { return new Date(t).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }

// ── Tree Utilities ──
function findFolder(node, id) {
  if (node.id === id) return node;
  for (var c of (node.children || [])) { var f = findFolder(c, id); if (f) return f; }
  return null;
}
function findParent(node, target, parent) {
  if (node.id === target) return parent || null;
  for (var c of (node.children || [])) { var f = findParent(c, target, node); if (f) return f; }
  return null;
}
function fp(n, t, p) { return findParent(n, t, p); }
function findInTree(node, id) {
  for (var p of (node.prompts || [])) if (p.id === id) return p;
  for (var c of (node.children || [])) { var f = findInTree(c, id); if (f) return f; }
  return null;
}
function findParentFolder(node, id) {
  for (var p of (node.prompts || [])) if (p.id === id) return node;
  for (var c of (node.children || [])) { var f = findParentFolder(c, id); if (f) return f; }
  return null;
}
function allFolders(n, dp, l) {
  dp = dp || 0; l = l || [];
  l.push({ id: n.id, name: n.name, depth: dp, color: n.color || "" });
  for (var c of (n.children || [])) allFolders(c, dp + 1, l);
  return l;
}
function afList(n, dp, l) { return allFolders(n, dp, l); }
function af(n, dp, l) { return allFolders(n, dp, l); }
function allItems(node, l) {
  l = l || [];
  for (var p of (node.prompts || [])) l.push(Object.assign({}, p, { folderId: node.id, folderName: node.name }));
  for (var c of (node.children || [])) allItems(c, l);
  return l;
}
function countItems(n) {
  var p = (n.prompts || []).length, f = (n.children || []).length;
  for (var c of (n.children || [])) { var x = countItems(c); p += x.prompts; f += x.folders; }
  return { prompts: p, folders: f };
}
function ci(n) { return countItems(n); }
function searchAll(q, n, path) {
  var r = [], ql = q.toLowerCase(), p2 = path ? path + " / " + n.name : n.name;
  for (var p of (n.prompts || [])) {
    if (!q || p.title.toLowerCase().includes(ql) || (p.content || "").toLowerCase().includes(ql) ||
        (p.url || "").toLowerCase().includes(ql) || (p.tags || []).some(function(t) { return t.toLowerCase().includes(ql); }))
      r.push(Object.assign({}, p, { folderName: n.name, folderId: n.id, folderPath: p2 }));
  }
  for (var c of (n.children || [])) r = r.concat(searchAll(q, c, p2));
  return r;
}

// ── Variables / Templates ──
function extractVars(t) {
  var m = (t || "").match(/\{\{([^}]+)\}\}/g);
  return m ? Array.from(new Set(m.filter(function(x) { return !x.startsWith("{{ref:"); }).map(function(x) { return x.slice(2, -2).trim(); }))) : [];
}
function ev(t) { return extractVars(t); }

// ── Domain + Favicon ──
function domain(url) {
  try { return new URL(url).hostname.replace("www.", ""); } catch(e) { return url || ""; }
}
// Site icons come from Chrome's local favicon cache (_favicon, "favicon"
// permission) — no request ever leaves the device.
function favicon(url, size) {
  size = size || 16;
  try {
    new URL(url);
    var src = chrome.runtime.getURL("/_favicon/?pageUrl=" + encodeURIComponent(url) + "&size=" + Math.min(64, size * 2));
    return '<img class="pv-favicon" src="' + src + '" width="' + size + '" height="' + size + '" style="border-radius:2px;vertical-align:middle;flex-shrink:0">';
  } catch(e) { return ""; }
}
// Inline onerror is blocked by the extension CSP — hide failed favicons via one
// delegated capture-phase listener (error events don't bubble).
document.addEventListener("error", function(e) {
  var t = e.target;
  if (t && t.tagName === "IMG" && t.classList && t.classList.contains("pv-favicon")) t.style.display = "none";
}, true);

// ── Toast ──
var _flashTimer = null;
function flash(msg) {
  var el = document.getElementById("fv-flash");
  if (!el) {
    el = document.createElement("div");
    el.id = "fv-flash";
    el.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);" +
      "background:var(--sf,#252530);border:1px solid var(--bl,#333);color:var(--tx,#e0e0e0);" +
      "padding:6px 16px;border-radius:6px;font-size:11px;z-index:600;" +
      "box-shadow:0 4px 12px rgba(0,0,0,.3);transition:opacity .2s;pointer-events:none";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = "1";
  clearTimeout(_flashTimer);
  _flashTimer = setTimeout(function() { el.style.opacity = "0"; }, 1800);
}

// ── Modal ──
var _modalBg = null;
function showFvModal(html, cb) {
  closeFvModal();
  _modalBg = document.createElement("div");
  _modalBg.className = "fv-modal-bg";
  var box = document.createElement("div");
  box.className = "fv-modal";
  box.innerHTML = html;
  _modalBg.appendChild(box);
  document.body.appendChild(_modalBg);
  _modalBg.addEventListener("click", function(e) { if (e.target === _modalBg) closeFvModal(); });
  if (cb) cb(box);
  return box;
}
function closeFvModal() {
  if (_modalBg) { _modalBg.remove(); _modalBg = null; }
}

// ── Context Menu ──
var _ctxEl = null;
function showFvContextMenu(e, items) {
  e.preventDefault();
  e.stopPropagation();
  closeFvContextMenu();
  var m = document.createElement("div");
  m.className = "fv-ctx";
  m.style.left = e.clientX + "px";
  m.style.top = e.clientY + "px";
  _ctxEl = m;
  m.innerHTML = items.map(function(i) {
    return i.sep ? '<div class="fv-ctx-sep"></div>' :
      '<div class="fv-ctx-i' + (i.cls ? ' fv-ctx-' + i.cls : '') + '" data-a="' + i.a + '">' + (i.ico || "") + " " + i.l + '</div>';
  }).join("");
  document.body.appendChild(m);
  var rect = m.getBoundingClientRect();
  if (rect.right > window.innerWidth) m.style.left = (window.innerWidth - rect.width - 8) + "px";
  if (rect.bottom > window.innerHeight) m.style.top = (window.innerHeight - rect.height - 8) + "px";
  m.querySelectorAll("[data-a]").forEach(function(el) {
    el.addEventListener("click", function() {
      var item = items.find(function(i) { return i.a === el.dataset.a; });
      closeFvContextMenu();
      if (item && item.fn) item.fn();
    });
  });
  setTimeout(function() {
    document.addEventListener("click", function h() {
      closeFvContextMenu();
      document.removeEventListener("click", h);
    }, { once: true });
  }, 10);
}
function closeFvContextMenu() {
  if (_ctxEl) { _ctxEl.remove(); _ctxEl = null; }
}

// ═══ FULLVIEW UNDO STACK ═══
var _fvUndo = [];
var _FV_UNDO_MAX = 15;
function fvPushUndo(storeKey, data) {
  _fvUndo.push({ key: storeKey, snap: JSON.parse(JSON.stringify(data)), ts: Date.now() });
  if (_fvUndo.length > _FV_UNDO_MAX) _fvUndo.shift();
}
function fvPopUndo(cb) {
  if (!_fvUndo.length) { flash("Nothing to undo"); return; }
  var entry = _fvUndo.pop();
  chrome.storage.local.set({ [entry.key]: entry.snap }, function() {
    flash("Undone");
    try { chrome.runtime.sendMessage({ type: "DATA_CHANGED" }); } catch(e) {}
    try { chrome.runtime.sendMessage({ type: "REBUILD_MENUS" }); } catch(e) {}
    if (cb) cb(entry.snap);
  });
}
function fvHasUndo() { return _fvUndo.length > 0; }

// Full-screen extension pages are frequently opened as popups or fresh tabs. Give every
// surface one predictable escape hatch: navigate back when there is history, otherwise
// close the extension-owned window/tab.
function fvExitView() {
  if (history.length > 1) history.back();
  else window.close();
}
document.querySelector("[data-fv-exit]")?.addEventListener("click", fvExitView);

// ═══ META BUMP — fullview saves participate in snapshot rotation ═══
function fvBumpMeta() {
  chrome.storage.local.get(["pv_m"], function(res) {
    var meta = res.pv_m || { sc: 0, lb: 0, lbs: 0, si: 0 };
    meta.sc = (meta.sc || 0) + 1;
    chrome.storage.local.set({ pv_m: meta });
  });
}


// ═══════════════════════════════════════════════════════════════
// IMG_PLATFORMS — canonical list for the image prompt builder.
// MIRROR of src/constants.js IMG_PLATFORMS. Keep the two in sync.
// ═══════════════════════════════════════════════════════════════
const IMG_PLATFORMS = [
  { id: "midjourney", name: "Midjourney",    icon: "🎨" },
  { id: "runway",     name: "Runway",        icon: "🎞" },
  { id: "leonardo",   name: "Leonardo AI",   icon: "🖼" },
  { id: "ideogram",   name: "Ideogram",      icon: "✎"  },
  { id: "firefly",    name: "Adobe Firefly", icon: "🔥" },
  { id: "flux",       name: "Flux",          icon: "⚡" },
  { id: "imagen",     name: "Google Imagen", icon: "🟢" },
  { id: "dalle",      name: "DALL·E",        icon: "🟢" },
];

// ═══════════════════════════════════════════════════════════════
// LIVE BUILDER STATE — shared key for in-flight builder sync.
// MIRROR of src/constants.js LIVE_BUILDER_KEY. Keep in sync.
// Each page generates its own PV_SURFACE_ID for loop-breaking.
// ═══════════════════════════════════════════════════════════════
const LIVE_BUILDER_KEY = "pv_builder_live";
const PV_SURFACE_ID = "fv_" + Math.random().toString(36).slice(2, 10);

// ═══════ SILO ACCENT (match expanded view to its side-panel tab color) ═══════
// Full views are single-theme; each page may serve multiple silos via ?tab.
// Override --ac per silo so all existing var(--ac) chrome matches the side panel.
(function(){
  try{
    var path=location.pathname, tab=new URLSearchParams(location.search).get("tab")||"";
    var C={prompts:"#c9a45c",imgprompts:"#b07acc",clips:"#5c8ec4",snippets:"#5c8ec4",
           skills:"#6c8fd9",notes:"#7ab87a",bookmarks:"#8a8f99",customgpts:"#43b38b"};
    var silo="";
    if(path.indexOf("fullview-prompts")>=0)      silo=(tab==="imgprompts")?"imgprompts":"prompts";
    else if(path.indexOf("fullview-clips")>=0)   silo=(tab==="skills")?"skills":(tab==="notes")?"notes":"clips";
    else if(path.indexOf("fullview-imgbuilder")>=0) silo="imgprompts";
    else if(path.indexOf("fullview")>=0)         silo=(tab==="customgpts")?"customgpts":"bookmarks";
    if(C[silo]) document.documentElement.style.setProperty("--ac", C[silo]);
  }catch(e){}
})();
