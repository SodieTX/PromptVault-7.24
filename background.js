// Prompt Vault v7 — Background Service Worker
// Folder tree context menus + quick save
importScripts(
  "pv-schema-version.js",
  "pv-images-db.js",
  "adapters.js",
  "bookmark-sync.js",
  "drive-shared.js",
  "drive-sync-bg.js",
  "pv-bridge.js",
  "backup-guard.js"
);
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// ── Capture blocklist check (respects cfg.captureBlockedDomains) ──
// Gates EXPLICIT user actions (right-click saves, quick-clip command), so it
// checks only the domain blocklist. cfg.captureEnabled governs the passive
// AI-response observer in content.js and must not veto deliberate saves.
async function bgIsCaptureBlocked(url) {
  if (!url) return false;
  const res = await chrome.storage.local.get(["pv_cfg"]);
  const cfg = res.pv_cfg || {};
  const blocked = cfg.captureBlockedDomains || [];
  if (!blocked.length) return false;
  try {
    const host = new URL(url).hostname.replace("www.", "").toLowerCase();
    return blocked.some((p) => {
      const pt = (p || "").toLowerCase().trim();
      if (!pt) return false;
      if (pt.startsWith("*.")) { const d = pt.slice(2); return host === d || host.endsWith("." + d); }
      return host === pt || host.endsWith("." + pt);
    });
  } catch { return false; }
}

// ── Platform detection (uses adapters.js when available) ──
function bgDetectPlatform(url) {
  if (typeof pvDetectPlatform === "function") return pvDetectPlatform(url);
  if (!url) return "";
  try {
    const h = new URL(url).hostname.replace("www.", "");
    const adapters = typeof PV_ADAPTERS !== "undefined" ? PV_ADAPTERS : [];
    for (const p of adapters) {
      for (const u of (p.hosts || p.urls || [])) { if (h.includes((u || "").replace("www.", ""))) return p.id; }
    }
  } catch {}
  return "";
}

// ── Folder tree helpers ──
function findFolder(node, id) {
  if (node.id === id) return node;
  for (const c of (node.children || [])) {
    const f = findFolder(c, id);
    if (f) return f;
  }
  return null;
}

// ── Build context menus from folder structure ──
let menuBuildPending = false;
let menuBuildQueued = false;
let menuBuildTimer = null;
let _menuIds = new Set();
function buildFolderMenus() {
  if (menuBuildPending) { menuBuildQueued = true; return; }
  menuBuildPending = true;
  _menuIds = new Set();
  // Safety: reset flag after 5s in case removeAll callback never fires
  clearTimeout(menuBuildTimer);
  menuBuildTimer = setTimeout(() => { menuBuildPending = false; }, 5000);
  chrome.contextMenus.removeAll(() => {
    chrome.storage.local.get(["pv_p", "pv_s", "pv_b", "pv_k", "pv_n", "pv_ph", "pv_cfg"], res => {
      const P = res.pv_p;
      const SN = res.pv_s;
      const BM = res.pv_b;
      const KL = res.pv_k;
      const NT = res.pv_n;
      const PH = res.pv_ph;
      const cfg = res.pv_cfg || {};

      // ── Inject menu (editable fields — prompts) ──
      chrome.contextMenus.create({ id: "inj-root", title: "\u26a1 Inject from Prompt Vault", contexts: ["editable"] });
      if (P?.folders) {
        const favs = collectFavorites(P.folders);
        if (favs.length) {
          favs.slice(0, 15).forEach(p => {
            chrome.contextMenus.create({ id: "inj-p::" + p.id + "::" + p.folderId, title: "\u2b50 " + (p.title || "").slice(0, 40), parentId: "inj-root", contexts: ["editable"] });
          });
          chrome.contextMenus.create({ id: "inj-fsep", type: "separator", parentId: "inj-root", contexts: ["editable"] });
        }
        addPromptFolderMenu(P.folders, "inj-root", ["editable"]);
      }

      // ── Prompt menu (text selection → store/refine the highlight as a prompt) ──
      chrome.contextMenus.create({ id: "prompt-root", title: "⭐ Save as Prompt", contexts: ["selection"] });
      if (P?.folders) {
        chrome.contextMenus.create({ id: "prompt-save-" + P.folders.id, title: "⬇ " + P.folders.name, parentId: "prompt-root", contexts: ["selection"] });
        if (P.folders.children?.length) {
          chrome.contextMenus.create({ id: "prompt-rsep", type: "separator", parentId: "prompt-root", contexts: ["selection"] });
          for (const child of P.folders.children) {
            addFolderMenu(child, "prompt-root", "prompt", ["selection"]);
          }
        }
        chrome.contextMenus.create({ id: "prompt-dsep", type: "separator", parentId: "prompt-root", contexts: ["selection"] });
        chrome.contextMenus.create({ id: "prompt-details", title: "✏️ Edit as prompt…", parentId: "prompt-root", contexts: ["selection"] });
      }

      // ── Snippet menu (text selection) ──
      chrome.contextMenus.create({ id: "snip-root", title: "\ud83d\udccb Save clip to Prompt Vault", contexts: ["selection"] });
      if (SN?.folders) {
        chrome.contextMenus.create({ id: "snip-save-" + SN.folders.id, title: "\u2b07 " + SN.folders.name, parentId: "snip-root", contexts: ["selection"] });
        if (SN.folders.children?.length) {
          chrome.contextMenus.create({ id: "snip-rsep", type: "separator", parentId: "snip-root", contexts: ["selection"] });
          for (const child of SN.folders.children) {
            addFolderMenu(child, "snip-root", "snip", ["selection"]);
          }
        }
        chrome.contextMenus.create({ id: "snip-dsep", type: "separator", parentId: "snip-root", contexts: ["selection"] });
        chrome.contextMenus.create({ id: "snip-details", title: "\u270f\ufe0f Save with details...", parentId: "snip-root", contexts: ["selection"] });
      }

      // ── Notes menu (text selection) ──
      chrome.contextMenus.create({ id: "note-root", title: "\ud83d\udcdd Save note to Prompt Vault", contexts: ["selection"] });
      if (NT?.folders) {
        chrome.contextMenus.create({ id: "note-save-" + NT.folders.id, title: "\u2b07 " + NT.folders.name, parentId: "note-root", contexts: ["selection"] });
        if (NT.folders.children?.length) {
          chrome.contextMenus.create({ id: "note-rsep", type: "separator", parentId: "note-root", contexts: ["selection"] });
          for (const child of NT.folders.children) {
            addFolderMenu(child, "note-root", "note", ["selection"]);
          }
        }
        chrome.contextMenus.create({ id: "note-dsep", type: "separator", parentId: "note-root", contexts: ["selection"] });
        chrome.contextMenus.create({ id: "note-details", title: "\u270f\ufe0f Save with details...", parentId: "note-root", contexts: ["selection"] });
      }

      // ── Skill menu (text selection) ──
      chrome.contextMenus.create({ id: "skill-root", title: "\ud83d\udee0 Save as Skill", contexts: ["selection"] });
      if (KL?.folders) {
        chrome.contextMenus.create({ id: "skill-save-" + KL.folders.id, title: "\u2b07 " + KL.folders.name, parentId: "skill-root", contexts: ["selection"] });
        if (KL.folders.children?.length) {
          chrome.contextMenus.create({ id: "skill-rsep", type: "separator", parentId: "skill-root", contexts: ["selection"] });
          for (const child of KL.folders.children) {
            addFolderMenu(child, "skill-root", "skill", ["selection"]);
          }
        }
        chrome.contextMenus.create({ id: "skill-dsep", type: "separator", parentId: "skill-root", contexts: ["selection"] });
        chrome.contextMenus.create({ id: "skill-details", title: "\u270f\ufe0f Save with details...", parentId: "skill-root", contexts: ["selection"] });
      }

      // ── Bookmark menu (page/link) ──
      chrome.contextMenus.create({ id: "bm-root", title: "\ud83d\udd16 Bookmark in Prompt Vault", contexts: ["page", "link"] });
      if (BM?.folders) {
        chrome.contextMenus.create({ id: "bm-save-" + BM.folders.id, title: "\u2b07 " + BM.folders.name, parentId: "bm-root", contexts: ["page", "link"] });
        if (BM.folders.children?.length) {
          chrome.contextMenus.create({ id: "bm-rsep", type: "separator", parentId: "bm-root", contexts: ["page", "link"] });
          for (const child of BM.folders.children) {
            addFolderMenu(child, "bm-root", "bm", ["page", "link"]);
          }
        }
        chrome.contextMenus.create({ id: "bm-dsep", type: "separator", parentId: "bm-root", contexts: ["page", "link"] });
        chrome.contextMenus.create({ id: "bm-details", title: "\u270f\ufe0f Save with details...", parentId: "bm-root", contexts: ["page", "link"] });
      }

      // ── Chat menu (page/link — saves the conversation URL into Bookmarks) ──
      chrome.contextMenus.create({ id: "ch-root", title: "\ud83d\udcac Save chat to Prompt Vault", contexts: ["page", "link"] });
      if (BM?.folders) {
        chrome.contextMenus.create({ id: "ch-save-" + BM.folders.id, title: "\u2b07 " + BM.folders.name, parentId: "ch-root", contexts: ["page", "link"] });
        if (BM.folders.children?.length) {
          chrome.contextMenus.create({ id: "ch-rsep", type: "separator", parentId: "ch-root", contexts: ["page", "link"] });
          for (const child of BM.folders.children) {
            addFolderMenu(child, "ch-root", "ch", ["page", "link"]);
          }
        }
        chrome.contextMenus.create({ id: "ch-dsep", type: "separator", parentId: "ch-root", contexts: ["page", "link"] });
        chrome.contextMenus.create({ id: "ch-details", title: "\u270f\ufe0f Save with details...", parentId: "ch-root", contexts: ["page", "link"] });
      }

      // ── Visual menu (literal images + CSS/canvas/SVG/screenshot fallback) ──
      chrome.contextMenus.create({ id: "img-root", title: "\ud83d\uddbc Save visual to Prompt Vault", contexts: ["all"] });
      const phRoot = PH?.folders || { id: "phroot", name: "My Photos", children: [] };
      chrome.contextMenus.create({ id: "img-save-" + phRoot.id, title: "\u2b07 " + (phRoot.name || "My Photos"), parentId: "img-root", contexts: ["all"] });
      if (phRoot.children?.length) {
        chrome.contextMenus.create({ id: "img-rsep", type: "separator", parentId: "img-root", contexts: ["all"] });
        for (const child of phRoot.children) {
          addFolderMenu(child, "img-root", "img", ["all"]);
        }
      }

      // User-curated shortcuts: only marked Clips, Notes, and Photos folders are
      // repeated here, so users can save directly without traversing a tree.
      const quickRefs = Array.isArray(cfg.quickAccessFolders) ? cfg.quickAccessFolders : [];
      const quickResolved = [];
      for (const ref of quickRefs) {
        const root = ref?.silo === "snippets" ? SN?.folders : ref?.silo === "notes" ? NT?.folders : ref?.silo === "photos" ? PH?.folders : null;
        const folder = root && ref.id ? findFolder(root, ref.id) : null;
        if (folder) quickResolved.push({ silo: ref.silo, id: ref.id, name: folder.name || "Folder" });
      }
      if (quickResolved.length) {
        chrome.contextMenus.create({ id: "qa-root", title: "\u26a1 Prompt Vault Quick Access", contexts: ["all"] });
        for (const ref of quickResolved.slice(0, 20)) {
          const prefix = ref.silo === "snippets" ? "snip" : ref.silo === "notes" ? "note" : "img";
          const icon = ref.silo === "snippets" ? "\ud83d\udccb" : ref.silo === "notes" ? "\ud83d\udcdd" : "\ud83d\uddbc";
          const contexts = ref.silo === "photos" ? ["all"] : ["selection"];
          chrome.contextMenus.create({ id: `qa-${prefix}-save-${ref.id}`, title: `${icon} ${ref.name}`, parentId: "qa-root", contexts });
        }
      }

      menuBuildPending = false;
      clearTimeout(menuBuildTimer);
      if (menuBuildQueued) { menuBuildQueued = false; setTimeout(buildFolderMenus, 50); }
    });
  });
}

function addFolderMenu(folder, parentId, prefix, ctx, depth) {
  if ((depth || 0) > 4) return;
  const hasKids = folder.children && folder.children.length > 0;
  const menuId = prefix + "-f-" + folder.id;

  // Guard: skip if this folder ID was already registered in this build cycle
  if (_menuIds.has(menuId)) return;
  _menuIds.add(menuId);

  const _mc = (opts) => { chrome.contextMenus.create(opts, () => { if (chrome.runtime.lastError) { /* suppress duplicate id */ } }); };

  if (hasKids) {
    _mc({ id: menuId, title: "\ud83d\udcc1 " + folder.name, parentId, contexts: ctx });
    _mc({ id: prefix + "-save-" + folder.id, title: "\u2b07 Save here", parentId: menuId, contexts: ctx });
    _mc({ id: prefix + "-csep-" + folder.id, type: "separator", parentId: menuId, contexts: ctx });
    for (const child of folder.children) {
      addFolderMenu(child, menuId, prefix, ctx, (depth || 0) + 1);
    }
  } else {
    _mc({ id: prefix + "-save-" + folder.id, title: "\ud83d\udcc1 " + folder.name, parentId, contexts: ctx });
  }
}

// ── Collect favorited prompts from folder tree ──
function collectFavorites(node, list) {
  list = list || [];
  for (const p of (node.prompts || [])) {
    if (p.favorited) list.push({ ...p, folderId: node.id });
  }
  for (const c of (node.children || [])) collectFavorites(c, list);
  return list;
}

function bgSetLastInject(promptId, folderId) {
  if (!promptId) return;
  chrome.storage.local.set({
    pv_last_inject: { promptId, folderId: folderId || "", ts: Date.now() }
  });
}

/** Inject into tab; on success records pv_last_inject. respond optional (for message API). */
function deliverInjectToTab(tabId, text, promptId, folderId, respond) {
  const fwd = { type: "INJECT_PROMPT", text: text || "", promptId: promptId || "" };
  const finish = (r) => {
    const ok = !!(r && r.success);
    if (ok && promptId) bgSetLastInject(promptId, folderId);
    if (typeof respond === "function") respond(r || { success: false });
  };
  chrome.tabs.sendMessage(tabId, fwd, (r) => {
    if (chrome.runtime.lastError) {
      // Content script not loaded — inject both adapters.js and content.js
      chrome.scripting
        .executeScript({ target: { tabId }, files: ["adapters.js", "content.js"] })
        .then(() => {
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, fwd, (r2) => {
              if (chrome.runtime.lastError) finish({ success: false, error: "No input found" });
              else finish(r2 || { success: false });
            });
          }, 350);
        })
        .catch(() => finish({ success: false, error: "Cannot reach page" }));
    } else {
      finish(r || { success: false });
    }
  });
}

// ── Inject target resolution helpers ──
function pvIsInjectableUrl(url) {
  return !!url && (url.startsWith("http://") || url.startsWith("https://"));
}

/** All open tabs whose URL matches a known LLM platform adapter. */
function pvListLlmTabs(cb) {
  chrome.tabs.query({}, tabs => {
    const out = [];
    for (const t of (tabs || [])) {
      if (!t.id || !pvIsInjectableUrl(t.url)) continue;
      const plat = pvDetectPlatform(t.url);
      if (plat) out.push({ tabId: t.id, windowId: t.windowId, platform: plat, title: t.title || "", url: t.url });
    }
    cb(out);
  });
}

function pvFocusAndDeliver(tab, text, promptId, folderId, respond) {
  try { if (tab.windowId) chrome.windows.update(tab.windowId, { focused: true }); } catch (e) {}
  try { chrome.tabs.update(tab.tabId, { active: true }); } catch (e) {}
  deliverInjectToTab(tab.tabId, text, promptId, folderId, respond);
}

/** Open a platform's web app in a new tab, wait for load, then inject. */
function pvOpenAndDeliver(platformId, text, promptId, folderId, respond) {
  const url = typeof pvGetWebUrl === "function" ? pvGetWebUrl(platformId) : "";
  if (!url) { respond({ success: false, error: "No web app known for " + platformId }); return; }
  chrome.tabs.create({ url, active: true }, tab => {
    if (!tab || !tab.id) { respond({ success: false, error: "Could not open " + url }); return; }
    const tabId = tab.id;
    let done = false;
    const finish = r => {
      if (done) return; done = true;
      try { chrome.tabs.onUpdated.removeListener(onUpd); } catch (e) {}
      respond(r);
    };
    const onUpd = (id, info) => {
      if (id !== tabId || info.status !== "complete") return;
      chrome.tabs.onUpdated.removeListener(onUpd);
      // Give the SPA a beat to mount its composer; content-script retries cover the rest.
      setTimeout(() => deliverInjectToTab(tabId, text, promptId, folderId, finish), 1200);
    };
    chrome.tabs.onUpdated.addListener(onUpd);
    setTimeout(() => finish({ success: false, error: "Page never finished loading" }), 30000);
  });
}

// ── Build inject menu from prompts folder tree ──
function addPromptFolderMenu(folder, parentId, ctx, depth) {
  if ((depth || 0) > 4) return;
  const hasKids = folder.children && folder.children.length > 0;
  const hasPrompts = folder.prompts && folder.prompts.length > 0;
  const menuId = "inj-f-" + folder.id;

  // Guard: skip if this folder ID was already registered in this build cycle
  if (_menuIds.has(menuId)) return;
  _menuIds.add(menuId);

  const _mc = (opts) => { chrome.contextMenus.create(opts, () => { if (chrome.runtime.lastError) { /* suppress duplicate id */ } }); };

  if (hasKids || hasPrompts) {
    if (parentId !== "inj-root") {
      _mc({ id: menuId, title: "\ud83d\udcc1 " + folder.name, parentId, contexts: ctx });
    }
    const target = parentId === "inj-root" ? parentId : menuId;
    // Add prompts in this folder (non-favorited, since favs are at top)
    if (hasPrompts) {
      const unfaved = folder.prompts.filter(p => !p.favorited);
      unfaved.slice(0, 20).forEach(p => {
        _mc({ id: "inj-p::" + p.id + "::" + folder.id, title: (p.title || "").slice(0, 40), parentId: target, contexts: ctx });
      });
      if (hasKids && unfaved.length) {
        _mc({ id: "inj-psep-" + folder.id, type: "separator", parentId: target, contexts: ctx });
      }
    }
    for (const child of (folder.children || [])) {
      addPromptFolderMenu(child, target, ctx, (depth || 0) + 1);
    }
  }
}

// ── Clean AI platform suffixes from page title ──
function cleanConvTitle(title, plat) {
  if (!plat || !title) return title || "";
  const suffixes = [" - Claude", " - ChatGPT", " | ChatGPT", " - Gemini", " - Google AI", " - Grok", " | Grok", " - Perplexity", " | Perplexity", " - Mistral", " - DeepSeek", " - Copilot", " - Poe", " - Meta AI", " - HuggingChat", " - Coral"];
  for (const s of suffixes) { if (title.endsWith(s)) return title.slice(0, -s.length); }
  return title;
}

/** Writes vault tree keys only; triggers chrome.storage.onChanged (Drive debounce) in one place. */
async function bgVaultLocalSet(patch) {
  await chrome.storage.local.set(patch);
}

function runQuickClipFromTab(tab) {
  if (!tab?.id) return;
  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      func: () => {
        const sel = window.getSelection();
        if (sel && sel.toString().trim()) {
          const frag = sel.getRangeAt(0).cloneContents();
          const div = document.createElement("div");
          div.appendChild(frag);
          div.querySelectorAll("br").forEach((b) => b.replaceWith("\n"));
          div.querySelectorAll("p, div, li").forEach((el) => {
            if (el.textContent.trim()) el.prepend(document.createTextNode("\n"));
          });
          return div.textContent.replace(/^\n/, "").replace(/\n{3,}/g, "\n\n");
        }
        const blocks = document.querySelectorAll(
          '[class*="message"], [class*="response"], [class*="assistant"], .markdown, .font-claude-message, [data-message-author-role="assistant"]'
        );
        if (blocks.length) {
          const last = blocks[blocks.length - 1];
          return last.textContent?.trim().slice(0, 2000) || "";
        }
        return "";
      }
    })
    .then((results) => {
      const text = results?.[0]?.result;
      if (!text) return;
      chrome.storage.local.get(["pv_s"], (res) => {
        const SN = res.pv_s;
        if (!SN?.folders) return;
        let inbox = SN.folders.children?.find((c) => c.id === "s_inbox");
        if (!inbox) {
          inbox = { id: "s_inbox", name: "\ud83d\udce5 Inbox", children: [], prompts: [], color: "" };
          SN.folders.children = SN.folders.children || [];
          SN.folders.children.unshift(inbox);
        }
        inbox.prompts = inbox.prompts || [];
        const plat = bgDetectPlatform(tab.url);
        const convTitle = cleanConvTitle(tab.title, plat);
        inbox.prompts.push({
          id: "i_" + SN.nextId,
          title: (text || "").slice(0, 60).split("\n")[0] || "Quick clip",
          content: text,
          tags: ["inbox"],
          created: Date.now(),
          modified: Date.now(),
          usageCount: 0,
          favorited: false,
          versions: [],
          sourceUrl: tab.url || "",
          sourceTitle: convTitle,
          platform: plat,
          sourceType: plat ? "ai" : "web",
          capturedAt: Date.now()
        });
        SN.nextId++;
        bgVaultLocalSet({ pv_s: SN }).then(() => {
          try {
            chrome.runtime.sendMessage({ type: "QUICK_CLIPPED" });
          } catch {}
          try {
            chrome.runtime.sendMessage({ type: "REBUILD_MENUS" });
          } catch {}
        });
      });
    })
    .catch(() => {});
}

// ── Quick save: save directly to a folder without overlay ──
async function quickSaveSnippet(folderId, text, url, pageTitle) {
  const data = await chrome.storage.local.get(["pv_s"]);
  const SN = data.pv_s;
  if (!SN?.folders) return false;

  const folder = findFolder(SN.folders, folderId);
  if (!folder) return false;

  folder.prompts = folder.prompts || [];
  const plat = bgDetectPlatform(url);
  const convTitle = cleanConvTitle(pageTitle, plat);
  const item = {
    id: "i_" + SN.nextId,
    title: (text || "").slice(0, 60).split("\n")[0] || "Untitled",
    content: text || "",
    tags: [],
    created: Date.now(),
    modified: Date.now(),
    usageCount: 0,
    favorited: false,
    versions: [],
    sourceUrl: url || "",
    sourceTitle: convTitle,
    platform: plat,
    sourceType: plat ? "ai" : "web",
    capturedAt: Date.now()
  };
  SN.nextId++;
  folder.prompts.push(item);
  await bgVaultLocalSet({ pv_s: SN });
  return true;
}

async function quickSavePrompt(folderId, text, url, pageTitle) {
  const data = await chrome.storage.local.get(["pv_p"]);
  const P = data.pv_p;
  if (!P?.folders) return false;
  const folder = findFolder(P.folders, folderId);
  if (!folder) return false;
  folder.prompts = folder.prompts || [];
  const plat = bgDetectPlatform(url);
  const item = {
    id: "i_" + P.nextId,
    title: (text || "").slice(0, 60).split("\n")[0] || "Untitled Prompt",
    content: text || "",
    tags: [],
    created: Date.now(),
    modified: Date.now(),
    usageCount: 0,
    favorited: false,
    versions: [],
    platform: plat,
    goal: "",
    provenance: { sourceUrl: url || "", sourceTitle: cleanConvTitle(pageTitle, plat), capturedAt: Date.now(), captureMethod: "selection", contentType: "prompt" }
  };
  P.nextId++;
  folder.prompts.push(item);
  await bgVaultLocalSet({ pv_p: P });
  return true;
}

async function quickSaveNote(folderId, text, url, pageTitle) {
  const data = await chrome.storage.local.get(["pv_n"]);
  const NT = data.pv_n;
  if (!NT?.folders) return false;
  const folder = findFolder(NT.folders, folderId);
  if (!folder) return false;
  folder.prompts = folder.prompts || [];
  const item = {
    id: "i_" + NT.nextId,
    title: (text || "").slice(0, 60).split("\n")[0] || "Untitled Note",
    content: text || "",
    tags: [],
    created: Date.now(),
    modified: Date.now(),
    usageCount: 0,
    favorited: false,
    versions: [],
    sourceUrl: url || "",
    sourceTitle: pageTitle || ""
  };
  NT.nextId++;
  folder.prompts.push(item);
  await bgVaultLocalSet({ pv_n: NT });
  return true;
}

async function quickSaveBookmark(folderId, url, title, description) {
  const data = await chrome.storage.local.get(["pv_b"]);
  const BM = data.pv_b;
  if (!BM?.folders) return false;

  const folder = findFolder(BM.folders, folderId);
  if (!folder) return false;

  folder.prompts = folder.prompts || [];
  const item = {
    id: "i_" + BM.nextId,
    title: title || url || "Untitled",
    content: description || "",
    url: url || "",
    tags: [],
    created: Date.now(),
    modified: Date.now(),
    usageCount: 0,
    favorited: false,
    versions: []
  };
  BM.nextId++;
  folder.prompts.push(item);
  await bgVaultLocalSet({ pv_b: BM });
  return true;
}

// ── Quick save image → Photos silo (bytes → IndexedDB, thumb+meta → pv_ph) ──
async function bgContextVisual(tabId) {
  if (!tabId) return null;
  return new Promise(resolve => {
    try { chrome.tabs.sendMessage(tabId, { type: "GET_CONTEXT_VISUAL" }, response => resolve(chrome.runtime.lastError ? null : response || null)); }
    catch { resolve(null); }
  });
}

async function bgCaptureVisibleRect(tab, rect) {
  if (!tab?.windowId || !rect || rect.width < 2 || rect.height < 2) return null;
  const dataUrl = await new Promise(resolve => {
    try { chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, url => resolve(chrome.runtime.lastError ? "" : url || "")); }
    catch { resolve(""); }
  });
  if (!dataUrl) return null;
  try {
    const source = await (await fetch(dataUrl)).blob(), bmp = await createImageBitmap(source), scale = Math.max(.25, Number(rect.dpr) || 1);
    const sx = Math.max(0, Math.round(rect.x * scale)), sy = Math.max(0, Math.round(rect.y * scale));
    const sw = Math.min(bmp.width - sx, Math.max(1, Math.round(rect.width * scale))), sh = Math.min(bmp.height - sy, Math.max(1, Math.round(rect.height * scale)));
    if (sw < 2 || sh < 2) { bmp.close(); return null; }
    const cv = new OffscreenCanvas(sw, sh);cv.getContext("2d").drawImage(bmp, sx, sy, sw, sh, 0, 0, sw, sh);bmp.close();
    return await cv.convertToBlob({ type: "image/png" });
  } catch { return null; }
}

async function quickSaveImage(folderId, srcUrl, pageUrl, pageTitle, providedBlob, fallbackCapture) {
  if (!srcUrl && !providedBlob && !fallbackCapture) return false;
  let blob = providedBlob || null;
  try {
    if (!blob && srcUrl) { const r = await fetch(srcUrl, { credentials: "omit" }); if (r.ok) blob = await r.blob(); }
  } catch (e) { /* CORS/auth-walled image — retry with credentials below */ }
  // Retry with page-scoped credentials for cookie-authed CDNs (Grok, Midjourney, etc.).
  // We hold <all_urls>, so the service-worker fetch carries the host's cookies.
  if (!blob && srcUrl && /^https?:/i.test(srcUrl)) {
    try { const r = await fetch(srcUrl, { credentials: "include" }); if (r.ok) blob = await r.blob(); } catch (e2) { /* keep a link-only record */ }
  }
  if (!blob && fallbackCapture) blob = await fallbackCapture();
  if (blob && (!blob.type || !/^image\//.test(blob.type)) && !srcUrl.startsWith("data:")) {
    // some CDNs return octet-stream; trust it if it has bytes
    if (!blob.size) blob = null;
  }
  let thumb = "", w = 0, h = 0;
  const mime = blob?.type || "";
  if (blob && blob.size) {
    try {
      const bmp = await createImageBitmap(blob);
      w = bmp.width; h = bmp.height;
      const scale = Math.min(1, 320 / Math.max(w, h));
      const cw = Math.max(1, Math.round(w * scale)), ch2 = Math.max(1, Math.round(h * scale));
      const cv = new OffscreenCanvas(cw, ch2);
      cv.getContext("2d").drawImage(bmp, 0, 0, cw, ch2);
      const tb = await cv.convertToBlob({ type: "image/webp", quality: 0.72 });
      thumb = await pvBlobToDataURL(tb);
      bmp.close();
    } catch (e) {
      // SVG and some formats can't bitmap — tiny SVGs can BE the thumbnail
      if (/svg/.test(mime) && blob.size < 51200) { try { thumb = await pvBlobToDataURL(blob); } catch (e2) {} }
    }
  }
  const data = await chrome.storage.local.get(["pv_ph"]);
  let PH = data.pv_ph;
  if (!PH?.folders) PH = { folders: { id: "phroot", name: "My Photos", children: [], prompts: [], color: "" }, trash: [], nextId: 1 };
  const folder = findFolder(PH.folders, folderId) || PH.folders;
  let fname = "";
  try { if (/^https?:/i.test(srcUrl)) fname = decodeURIComponent((new URL(srcUrl).pathname.split("/").pop() || "")).slice(0, 80); } catch (e) {}
  const item = {
    id: "i_" + PH.nextId,
    title: fname || pageTitle || "Image",
    content: "", url: srcUrl, pageUrl: pageUrl || "",
    tags: [], mime, bytes: blob ? blob.size : 0, w, h, thumb, hasBlob: !!blob,
    provenance: { sourceUrl: srcUrl || pageUrl || "", sourceTitle: pageTitle || "", capturedAt: Date.now(), captureMethod: srcUrl ? "original-visual" : "visible-crop", contentType: "photo" },
    created: Date.now(), modified: Date.now(),
    usageCount: 0, favorited: false, versions: []
  };
  PH.nextId++;
  folder.prompts = folder.prompts || [];
  folder.prompts.push(item);
  if (blob) { try { await pvImgPut(item.id, blob); } catch (e) { item.hasBlob = false; } }
  await bgVaultLocalSet({ pv_ph: PH });
  // Object result (still truthy for `if (ok)` callers) so the caller can tell a real capture
  // from a link-only record — the latter renders as an empty frame, which reads as "nothing
  // happened" unless we say otherwise.
  return { ok: true, hasBlob: !!item.hasBlob };
}

async function quickSaveChat(folderId, url, title) {
  const data = await chrome.storage.local.get(["pv_b"]);
  const BM = data.pv_b;
  if (!BM?.folders) return false;

  const folder = findFolder(BM.folders, folderId) || BM.folders;

  folder.prompts = folder.prompts || [];
  const item = {
    id: "i_" + BM.nextId,
    title: title || url || "Untitled chat",
    content: "",
    url: url || "",
    tags: ["chat"],
    created: Date.now(),
    modified: Date.now(),
    usageCount: 0,
    favorited: false,
    versions: []
  };
  BM.nextId++;
  folder.prompts.push(item);
  await bgVaultLocalSet({ pv_b: BM });
  return true;
}

async function quickSaveSkill(folderId, text, url, pageTitle) {
  const data = await chrome.storage.local.get(["pv_k"]);
  const KL = data.pv_k;
  if (!KL?.folders) return false;

  const folder = findFolder(KL.folders, folderId);
  if (!folder) return false;

  folder.prompts = folder.prompts || [];
  // Auto-detect skill name from YAML frontmatter or first heading
  let title = "Untitled Skill";
  const nameMatch = text.match(/^name:\s*(.+)$/m);
  const headMatch = text.match(/^#\s+(.+)$/m);
  if (nameMatch) title = nameMatch[1].trim();
  else if (headMatch) title = headMatch[1].trim();
  else title = (text || "").slice(0, 60).split("\n")[0] || "Untitled Skill";

  // Try to extract description from YAML frontmatter
  let description = "";
  const descMatch = text.match(/^description:\s*(.+)$/m);
  if (descMatch) description = descMatch[1].trim().replace(/^["']|["']$/g, "");

  const item = {
    id: "i_" + KL.nextId,
    title,
    content: text || "",
    description,
    files: {},
    tags: [],
    created: Date.now(),
    modified: Date.now(),
    usageCount: 0,
    favorited: false,
    versions: [],
    sourceUrl: url || "",
    sourceTitle: pageTitle || ""
  };
  KL.nextId++;
  folder.prompts.push(item);
  await bgVaultLocalSet({ pv_k: KL });
  return true;
}

// ── Extract page meta description ──
async function getPageMeta(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const og = document.querySelector('meta[property="og:description"]');
        const meta = document.querySelector('meta[name="description"]');
        return (og?.content || meta?.content || "").slice(0, 300);
      }
    });
    return results?.[0]?.result || "";
  } catch { return ""; }
}

// ── Context menu click handler ──
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let id = info.menuItemId;
  // Quick Access aliases deliberately reuse the normal, tested save handlers.
  if (typeof id === "string" && id.startsWith("qa-")) id = id.slice(3);

  // ── Inject prompt into active field ──
  if (typeof id === "string" && id.startsWith("inj-p::")) {
    const parts = id.split("::");
    const promptId = parts[1];
    const folderId = parts[2];
    const data = await chrome.storage.local.get(["pv_p"]);
    const P = data.pv_p;
    if (P?.folders) {
      const folder = findFolder(P.folders, folderId);
      if (folder) {
        const prompt = (folder.prompts || []).find(p => p.id === promptId);
        if (prompt && tab?.id) {
          deliverInjectToTab(tab.id, prompt.content || "", promptId, folderId, () => {});
          prompt.usageCount = (prompt.usageCount || 0) + 1;
          await bgVaultLocalSet({ pv_p: P });
          try { chrome.runtime.sendMessage({ type: "QUICK_SAVED", label: "Injected" }); } catch {}
        }
      }
    }
    return;
  }

  // ── Quick save to folder (prompt) — preserve formatting ──
  if (typeof id === "string" && id.startsWith("prompt-save-")) {
    const url = tab?.url || "";
    if (await bgIsCaptureBlocked(url)) { try { chrome.runtime.sendMessage({ type: "CAPTURE_BLOCKED" }); } catch {} return; }
    const folderId = id.replace("prompt-save-", "");
    let text = info.selectionText || "";
    if (tab?.id) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return "";
            const frag = sel.getRangeAt(0).cloneContents();
            const div = document.createElement("div");
            div.appendChild(frag);
            div.querySelectorAll("br").forEach(b => b.replaceWith("\n"));
            div.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6, tr").forEach(el => {
              if (el.textContent.trim()) el.prepend(document.createTextNode("\n"));
            });
            return div.textContent.replace(/^\n/, "").replace(/\n{3,}/g, "\n\n");
          }
        });
        if (results?.[0]?.result) text = results[0].result;
      } catch {}
    }
    const ok = await quickSavePrompt(folderId, text, tab?.url, tab?.title);
    if (ok) {
      try { chrome.runtime.sendMessage({ type: "QUICK_SAVED", label: "Prompt saved" }); } catch {}
    }
    return;
  }

  // ── "Edit as prompt..." — open side panel and pre-fill the prompt editor ──
  if (id === "prompt-details" && info.selectionText) {
    const url = tab?.url || "";
    if (await bgIsCaptureBlocked(url)) { try { chrome.runtime.sendMessage({ type: "CAPTURE_BLOCKED" }); } catch {} return; }
    let text = info.selectionText || "";
    if (tab?.id) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return "";
            const frag = sel.getRangeAt(0).cloneContents();
            const div = document.createElement("div");
            div.appendChild(frag);
            div.querySelectorAll("br").forEach(b => b.replaceWith("\n"));
            div.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6, tr").forEach(el => {
              if (el.textContent.trim()) el.prepend(document.createTextNode("\n"));
            });
            return div.textContent.replace(/^\n/, "").replace(/\n{3,}/g, "\n\n");
          }
        });
        if (results?.[0]?.result) text = results[0].result;
      } catch {}
    }
    const d = { text, url: tab?.url || "", pageTitle: tab?.title || "", timestamp: Date.now() };
    await chrome.storage.local.set({ pv_pending_prompt: d });
    try { await chrome.sidePanel.open({ tabId: tab.id }); } catch {}
    retry(() => chrome.runtime.sendMessage({ type: "PROMPT_CAPTURE", ...d })
      .then(() => chrome.storage.local.remove("pv_pending_prompt")), 6, 500);
    return;
  }

  // ── Quick save to folder (snippet) — preserve formatting ──
  if (typeof id === "string" && id.startsWith("snip-save-")) {
    const url = tab?.url || "";
    if (await bgIsCaptureBlocked(url)) { try { chrome.runtime.sendMessage({ type: "CAPTURE_BLOCKED" }); } catch {} return; }
    const folderId = id.replace("snip-save-", "");
    let text = info.selectionText || "";
    // Try to get formatted text from the page (preserves line breaks)
    if (tab?.id) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return "";
            const frag = sel.getRangeAt(0).cloneContents();
            const div = document.createElement("div");
            div.appendChild(frag);
            // Convert <br>, <p>, <div> to newlines
            div.querySelectorAll("br").forEach(b => b.replaceWith("\n"));
            div.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6, tr").forEach(el => {
              if (el.textContent.trim()) el.prepend(document.createTextNode("\n"));
            });
            return div.textContent.replace(/^\n/, "").replace(/\n{3,}/g, "\n\n");
          }
        });
        if (results?.[0]?.result) text = results[0].result;
      } catch {}
    }
    const ok = await quickSaveSnippet(folderId, text, tab?.url, tab?.title);
    if (ok) {
      try { chrome.runtime.sendMessage({ type: "QUICK_SAVED", label: "Clip saved" }); } catch {}
    }
    return;
  }

  // ── Quick save to folder (note) — preserve formatting ──
  if (typeof id === "string" && id.startsWith("note-save-")) {
    const url = tab?.url || "";
    if (await bgIsCaptureBlocked(url)) { try { chrome.runtime.sendMessage({ type: "CAPTURE_BLOCKED" }); } catch {} return; }
    const folderId = id.replace("note-save-", "");
    let text = info.selectionText || "";
    if (tab?.id) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return "";
            const frag = sel.getRangeAt(0).cloneContents();
            const div = document.createElement("div");
            div.appendChild(frag);
            div.querySelectorAll("br").forEach(b => b.replaceWith("\n"));
            div.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6, tr").forEach(el => {
              if (el.textContent.trim()) el.prepend(document.createTextNode("\n"));
            });
            return div.textContent.replace(/^\n/, "").replace(/\n{3,}/g, "\n\n");
          }
        });
        if (results?.[0]?.result) text = results[0].result;
      } catch {}
    }
    const ok = await quickSaveNote(folderId, text, tab?.url, tab?.title);
    if (ok) {
      try { chrome.runtime.sendMessage({ type: "QUICK_SAVED", label: "Note saved" }); } catch {}
    }
    return;
  }

  // ── Quick save to folder (skill) — preserve formatting ──
  if (typeof id === "string" && id.startsWith("skill-save-")) {
    const url = tab?.url || "";
    if (await bgIsCaptureBlocked(url)) { try { chrome.runtime.sendMessage({ type: "CAPTURE_BLOCKED" }); } catch {} return; }
    const folderId = id.replace("skill-save-", "");
    let text = info.selectionText || "";
    if (tab?.id) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return "";
            const frag = sel.getRangeAt(0).cloneContents();
            const div = document.createElement("div");
            div.appendChild(frag);
            div.querySelectorAll("br").forEach(b => b.replaceWith("\n"));
            div.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6, tr").forEach(el => {
              if (el.textContent.trim()) el.prepend(document.createTextNode("\n"));
            });
            return div.textContent.replace(/^\n/, "").replace(/\n{3,}/g, "\n\n");
          }
        });
        if (results?.[0]?.result) text = results[0].result;
      } catch {}
    }
    const ok = await quickSaveSkill(folderId, text, tab?.url, tab?.title);
    if (ok) {
      try { chrome.runtime.sendMessage({ type: "QUICK_SAVED", label: "Skill saved" }); } catch {}
    }
    return;
  }

  // ── Quick save to folder (bookmark) ──
  if (typeof id === "string" && id.startsWith("bm-save-")) {
    const url = info.linkUrl || info.pageUrl || tab?.url || "";
    if (await bgIsCaptureBlocked(url)) { try { chrome.runtime.sendMessage({ type: "CAPTURE_BLOCKED" }); } catch {} return; }
    const folderId = id.replace("bm-save-", "");
    const desc = tab?.id ? await getPageMeta(tab.id) : "";
    const ok = await quickSaveBookmark(folderId, url, tab?.title || url, desc);
    if (ok) {
      try { chrome.runtime.sendMessage({ type: "QUICK_SAVED", label: "Bookmark saved" }); } catch {}
    }
    return;
  }

  // ── Quick save image (→ Photos) ──
  if (typeof id === "string" && id.startsWith("img-save-")) {
    let srcUrl = info.srcUrl || "";
    const pageUrl = info.pageUrl || tab?.url || "";
    if (await bgIsCaptureBlocked(pageUrl)) { try { chrome.runtime.sendMessage({ type: "CAPTURE_BLOCKED" }); } catch {} return; }
    const folderId = id.replace("img-save-", "");
    const visual=tab?.id?await bgContextVisual(tab.id):null;if(!srcUrl)srcUrl=visual?.url||"";
    const fallback=()=>bgCaptureVisibleRect(tab,visual?.rect||{x:0,y:0,width:99999,height:99999,dpr:1});
    const ok = await quickSaveImage(folderId, srcUrl, pageUrl, visual?.title||tab?.title||"", null, fallback);
    if (ok) {
      try { chrome.runtime.sendMessage({ type: "QUICK_SAVED", label: "Visual saved to Photos" }); } catch {}
    }
    return;
  }

  // ── Quick save chat (page/link URL → Chats) ──
  if (typeof id === "string" && id.startsWith("ch-save-")) {
    const url = info.linkUrl || info.pageUrl || tab?.url || "";
    if (await bgIsCaptureBlocked(url)) { try { chrome.runtime.sendMessage({ type: "CAPTURE_BLOCKED" }); } catch {} return; }
    const folderId = id.replace("ch-save-", "");
    const ok = await quickSaveChat(folderId, url, tab?.title || url);
    if (ok) {
      try { chrome.runtime.sendMessage({ type: "QUICK_SAVED", label: "Chat saved" }); } catch {}
    }
    return;
  }

  // ── "Save with details..." — open side panel with overlay ──
  if (id === "snip-details" && info.selectionText) {
    const url = tab?.url || "";
    if (await bgIsCaptureBlocked(url)) { try { chrome.runtime.sendMessage({ type: "CAPTURE_BLOCKED" }); } catch {} return; }
    let text = info.selectionText || "";
    if (tab?.id) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return "";
            const frag = sel.getRangeAt(0).cloneContents();
            const div = document.createElement("div");
            div.appendChild(frag);
            div.querySelectorAll("br").forEach(b => b.replaceWith("\n"));
            div.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6, tr").forEach(el => {
              if (el.textContent.trim()) el.prepend(document.createTextNode("\n"));
            });
            return div.textContent.replace(/^\n/, "").replace(/\n{3,}/g, "\n\n");
          }
        });
        if (results?.[0]?.result) text = results[0].result;
      } catch {}
    }
    const d = { text, url: tab?.url || "", pageTitle: tab?.title || "", timestamp: Date.now() };
    await chrome.storage.local.set({ pv_pending_snippet: d });
    try { await chrome.sidePanel.open({ tabId: tab.id }); } catch {}
    retry(() => chrome.runtime.sendMessage({ type: "SNIPPET_CAPTURE", ...d })
      .then(() => chrome.storage.local.remove("pv_pending_snippet")), 6, 500);
    return;
  }

  if (id === "bm-details") {
    const url = info.linkUrl || info.pageUrl || tab?.url || "";
    if (await bgIsCaptureBlocked(url)) { try { chrome.runtime.sendMessage({ type: "CAPTURE_BLOCKED" }); } catch {} return; }
    const desc = tab?.id ? await getPageMeta(tab.id) : "";
    const d = { url, title: tab?.title || url, description: desc, timestamp: Date.now() };
    await chrome.storage.local.set({ pv_pending_bookmark: d });
    try { await chrome.sidePanel.open({ tabId: tab.id }); } catch {}
    retry(() => chrome.runtime.sendMessage({ type: "BOOKMARK_CAPTURE", ...d })
      .then(() => chrome.storage.local.remove("pv_pending_bookmark")), 6, 500);
    return;
  }

  if (id === "ch-details") {
    const url = info.linkUrl || info.pageUrl || tab?.url || "";
    if (await bgIsCaptureBlocked(url)) { try { chrome.runtime.sendMessage({ type: "CAPTURE_BLOCKED" }); } catch {} return; }
    const d = { url, title: tab?.title || url, timestamp: Date.now() };
    await chrome.storage.local.set({ pv_pending_chat: d });
    try { await chrome.sidePanel.open({ tabId: tab.id }); } catch {}
    retry(() => chrome.runtime.sendMessage({ type: "CHAT_CAPTURE", ...d })
      .then(() => chrome.storage.local.remove("pv_pending_chat")), 6, 500);
    return;
  }

  if (id === "skill-details" && info.selectionText) {
    const url = tab?.url || "";
    if (await bgIsCaptureBlocked(url)) { try { chrome.runtime.sendMessage({ type: "CAPTURE_BLOCKED" }); } catch {} return; }
    let text = info.selectionText || "";
    if (tab?.id) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return "";
            const frag = sel.getRangeAt(0).cloneContents();
            const div = document.createElement("div");
            div.appendChild(frag);
            div.querySelectorAll("br").forEach(b => b.replaceWith("\n"));
            div.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6, tr").forEach(el => {
              if (el.textContent.trim()) el.prepend(document.createTextNode("\n"));
            });
            return div.textContent.replace(/^\n/, "").replace(/\n{3,}/g, "\n\n");
          }
        });
        if (results?.[0]?.result) text = results[0].result;
      } catch {}
    }
    const d = { text, url: tab?.url || "", pageTitle: tab?.title || "", timestamp: Date.now() };
    await chrome.storage.local.set({ pv_pending_skill: d });
    try { await chrome.sidePanel.open({ tabId: tab.id }); } catch {}
    retry(() => chrome.runtime.sendMessage({ type: "SKILL_CAPTURE", ...d })
      .then(() => chrome.storage.local.remove("pv_pending_skill")), 6, 500);
    return;
  }

  // ── "Save with details..." — note ──
  if (id === "note-details" && info.selectionText) {
    const url = tab?.url || "";
    if (await bgIsCaptureBlocked(url)) { try { chrome.runtime.sendMessage({ type: "CAPTURE_BLOCKED" }); } catch {} return; }
    let text = info.selectionText || "";
    if (tab?.id) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return "";
            const frag = sel.getRangeAt(0).cloneContents();
            const div = document.createElement("div");
            div.appendChild(frag);
            div.querySelectorAll("br").forEach(b => b.replaceWith("\n"));
            div.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6, tr").forEach(el => {
              if (el.textContent.trim()) el.prepend(document.createTextNode("\n"));
            });
            return div.textContent.replace(/^\n/, "").replace(/\n{3,}/g, "\n\n");
          }
        });
        if (results?.[0]?.result) text = results[0].result;
      } catch {}
    }
    const d = { text, url: tab?.url || "", pageTitle: tab?.title || "", timestamp: Date.now() };
    await chrome.storage.local.set({ pv_pending_note: d });
    try { await chrome.sidePanel.open({ tabId: tab.id }); } catch {}
    retry(() => chrome.runtime.sendMessage({ type: "NOTE_CAPTURE", ...d })
      .then(() => chrome.storage.local.remove("pv_pending_note")), 6, 500);
    return;
  }
});

// ── Retry helper ──
function retry(fn, n, delay) {
  if (n <= 0) return;
  setTimeout(() => fn().catch(() => retry(fn, n - 1, delay)), delay);
}

// ── Data URL helper ──
function toDataUrl(str, mime) {
  return `data:${mime};base64,${btoa(unescape(encodeURIComponent(str)))}`;
}

// ── Auto-download screenshot (fallback when content script unavailable) ──
function autoDownloadScreenshot(dataUrl, title) {
  const d = new Date();
  const ts = d.toISOString().slice(0, 10) + "-" + d.toISOString().slice(11, 19).replace(/:/g, "");
  const clean = (title || "screenshot").replace(/[^a-zA-Z0-9 _-]/g, "").slice(0, 50).trim().replace(/\s+/g, "-") || "screenshot";
  chrome.downloads.download({
    url: dataUrl,
    filename: `PromptVault-Screenshots/${clean}-${ts}.png`,
    saveAs: false,
    conflictAction: "uniquify"
  }, id => {
    if (chrome.runtime.lastError) {
      chrome.downloads.download({ url: dataUrl, filename: `screenshot-${ts}.png`, saveAs: true });
    }
  });
}

// ── Message handler ──
chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  if (msg.type === "SCHEDULE_DRIVE_PUSH") {
    try {
      globalThis.__pvDriveSchedule?.();
    } catch (e) {}
    respond?.({ ok: true });
    return false;
  }
  if (msg.type === "RUN_DRIVE_PUSH") {
    const force = msg.force === true;
    globalThis.__pvDriveRun?.(force)
      .then((r) => respond?.(r))
      .catch((e) => respond?.({ ok: false, error: e?.message || String(e) }));
    return true;
  }
  if (msg.type === "CANCEL_DRIVE_PUSH") {
    try {
      chrome.alarms.clear("pv-drive-debounced");
    } catch (e) {}
    respond?.({ ok: true });
    return false;
  }

  if (msg.type === "BM_SYNC_PUSH" && msg.item) {
    bmSyncPushToChrome(msg.item).then(() => respond?.({ success: true })).catch(() => respond?.({ success: false }));
    return true;
  }
  if (msg.type === "REFETCH_PHOTO" && msg.id && msg.url) {
    (async () => {
      try {
        const r = await fetch(msg.url, { credentials: "omit" });
        if (!r.ok) { respond?.({ success: false }); return; }
        const blob = await r.blob();
        if (!blob.size) { respond?.({ success: false }); return; }
        await pvImgPut(msg.id, blob);
        // refresh metadata: thumb + dims + size
        let thumb = "", w = 0, h = 0;
        try {
          const bmp = await createImageBitmap(blob);
          w = bmp.width; h = bmp.height;
          const scale = Math.min(1, 320 / Math.max(w, h));
          const cv = new OffscreenCanvas(Math.max(1, Math.round(w * scale)), Math.max(1, Math.round(h * scale)));
          cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
          thumb = await pvBlobToDataURL(await cv.convertToBlob({ type: "image/webp", quality: 0.72 }));
          bmp.close();
        } catch (e) {}
        const data = await chrome.storage.local.get(["pv_ph"]);
        const PH = data.pv_ph;
        if (PH?.folders) {
          (function walk(n) {
            (n.prompts || []).forEach(p => { if (p.id === msg.id) { p.hasBlob = true; p.bytes = blob.size; p.mime = blob.type || p.mime; if (thumb) p.thumb = thumb; if (w) { p.w = w; p.h = h; } p.modified = Date.now(); } });
            (n.children || []).forEach(walk);
          })(PH.folders);
          await bgVaultLocalSet({ pv_ph: PH });
        }
        respond?.({ success: true });
      } catch (e) { respond?.({ success: false }); }
    })();
    return true;
  }

  if (msg.type === "ADD_PHOTO_BY_URL" && msg.url) {
    quickSaveImage(msg.folderId || "phroot", msg.url, msg.pageUrl || "", msg.title || "")
      .then(r => respond?.({ success: !!r, hasBytes: !!(r && r.hasBlob) }))
      .catch(() => respond?.({ success: false }));
    return true;
  }
  if (msg.type === "REBUILD_MENUS") {
    buildFolderMenus();
    if (respond) respond({ success: true });
    return false;
  }

  if (msg.type === "INJECT_PROMPT") {
    // Layered target resolution:
    //   1. Active tab is an LLM page → inject right there.
    //   2. Prompt tagged for a platform → reuse its open tab, else open the web app.
    //   3. Untagged with exactly one LLM tab open → use it.
    //   4. Ambiguous → respond needsTarget so the caller can show a picker.
    const _text = msg.text, _pid = msg.promptId || "", _fid = msg.folderId || "";
    const wanted = msg.platform || "";
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
      const active = tabs?.[0];
      const activeInjectable = !!(active && active.id && pvIsInjectableUrl(active.url));
      if (activeInjectable && pvDetectPlatform(active.url)) {
        console.log("[PV bg] Inject → active LLM tab:", active.id, active.url?.slice(0, 60));
        deliverInjectToTab(active.id, _text, _pid, _fid, respond);
        return;
      }
      pvListLlmTabs(open => {
        if (wanted) {
          const match = open.find(t => t.platform === wanted);
          if (match) { pvFocusAndDeliver(match, _text, _pid, _fid, respond); return; }
          pvOpenAndDeliver(wanted, _text, _pid, _fid, respond);
          return;
        }
        if (open.length === 1) { pvFocusAndDeliver(open[0], _text, _pid, _fid, respond); return; }
        respond({
          success: false, needsTarget: true,
          openTabs: open.map(t => ({ tabId: t.tabId, platform: t.platform, title: t.title })),
          currentTab: activeInjectable ? { tabId: active.id, title: active.title || "" } : null
        });
      });
    });
    return true;
  }

  if (msg.type === "INJECT_TO") {
    // Explicit target chosen in the sidepanel picker.
    const _text = msg.text, _pid = msg.promptId || "", _fid = msg.folderId || "";
    if (msg.tabId) {
      chrome.tabs.get(msg.tabId, tab => {
        if (chrome.runtime.lastError || !tab) { respond({ success: false, error: "That tab is gone" }); return; }
        pvFocusAndDeliver({ tabId: tab.id, windowId: tab.windowId }, _text, _pid, _fid, respond);
      });
    } else if (msg.platformId) {
      pvListLlmTabs(open => {
        const match = open.find(t => t.platform === msg.platformId);
        if (match) pvFocusAndDeliver(match, _text, _pid, _fid, respond);
        else pvOpenAndDeliver(msg.platformId, _text, _pid, _fid, respond);
      });
    } else respond({ success: false, error: "No target" });
    return true;
  }

  if (msg.type === "RECORD_LAST_INJECT" && msg.promptId) {
    bgSetLastInject(msg.promptId, msg.folderId || "");
    if (respond) respond({ ok: true });
    return false;
  }

  if (msg.type === "QUICK_CLIP_CURRENT_TAB") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      runQuickClipFromTab(tabs?.[0]);
    });
    if (respond) respond({ ok: true });
    return false;
  }

  // ── Open side panel (for detailed response capture) ──
  if (msg.type === "OPEN_SIDEPANEL") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
      if (tabs[0]?.id) {
        chrome.sidePanel.open({ tabId: tabs[0].id }).then(() => respond({ success: true })).catch(() => respond({ success: false }));
      } else respond({ success: false });
    });
    return true;
  }

  if (msg.type === "GET_ACTIVE_TAB") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]) {
        respond({ url: tabs[0].url || "", title: tabs[0].title || "" });
      } else {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs2 => {
          respond(tabs2[0] ? { url: tabs2[0].url || "", title: tabs2[0].title || "" } : { url: "", title: "" });
        });
      }
    });
    return true;
  }

  if (msg.type === "AUTO_BACKUP") {
    const d = new Date().toISOString().slice(0, 10);
    const t = new Date().toISOString().slice(11, 16).replace(":", "");
    const url = toDataUrl(msg.data, "application/json");
    chrome.downloads.download({
      url, filename: `PromptVault-Backups/prompt-vault-${d}-${t}.json`,
      saveAs: false, conflictAction: "uniquify"
    }, id => {
      if (chrome.runtime.lastError) {
        chrome.downloads.download({ url, filename: `prompt-vault-backup-${d}.json`, saveAs: true },
          () => respond({ success: !chrome.runtime.lastError }));
      } else respond({ success: true });
    });
    return true;
  }

  if (msg.type === "EXPORT_FILE") {
    const url = toDataUrl(msg.data, msg.mimeType || "text/plain");
    chrome.downloads.download({ url, filename: `PromptVault-Exports/${msg.filename}`, saveAs: true },
      () => respond({ success: !chrome.runtime.lastError }));
    return true;
  }

  if (msg.type === "AUTO_BACKUP_NOW") {
    pvRunAutoBackup("manual").then(r => respond({ success: !r.skipped, ...r }));
    return true;
  }

  if (msg.type === "OPEN_URL") {
    chrome.tabs.create({ url: msg.url, active: true });
    respond({ success: true });
    return true;
  }

  if (msg.type === "OPEN_URL_WINDOW") {
    chrome.windows.create({ url: msg.url, type: "normal" });
    respond({ success: true });
    return true;
  }

  // ── URL Health Check (batch) ──
  if (msg.type === "CHECK_URLS") {
    const urls = msg.urls || [];
    const results = {};
    const check = async (url) => {
      try {
        const r = await fetch(url, { method: "HEAD", mode: "cors", redirect: "follow", signal: AbortSignal.timeout(8000) });
        return { url, status: r.status, ok: r.ok };
      } catch (e) {
        // Try GET as fallback (some servers reject HEAD)
        try {
          const r2 = await fetch(url, { method: "GET", mode: "no-cors", redirect: "follow", signal: AbortSignal.timeout(8000) });
          // no-cors gives an opaque response — reachable, but not fully verified
          return { url, status: r2.status || 0, ok: true, opaque: true, verified: false };
        } catch (e2) {
          return { url, status: 0, ok: false, error: e2.message || "unreachable" };
        }
      }
    };
    // Process in batches of 5
    (async () => {
      for (let i = 0; i < urls.length; i += 5) {
        const batch = urls.slice(i, i + 5);
        const batchResults = await Promise.all(batch.map(check));
        batchResults.forEach(r => { results[r.url] = r; });
      }
      respond(results);
    })();
    return true; // async response
  }

  // ── URL Health Check v2 (accurate, multi-strategy) ──
  if (msg.type === "HEALTH_CHECK_URLS") {
    const urls = msg.urls || [];
    const TIMEOUT = 12000;

    const checkOne = async (url) => {
      let targetUrl = (url || "").trim();
      if (!targetUrl) return { url, status: 0, alive: false, error: "empty URL" };

      // Skip non-http schemes — they're always "alive" (browser-internal)
      if (/^(chrome|javascript:|file:|data:|about:|blob:)/i.test(targetUrl)) {
        return { url, status: 0, alive: true, opaque: true };
      }
      if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
        targetUrl = "https://" + targetUrl;
      }

      // ── Strategy 1: HEAD with redirect:"manual" to detect redirects ──
      try {
        const r = await fetch(targetUrl, {
          method: "HEAD",
          redirect: "manual",
          signal: AbortSignal.timeout(TIMEOUT)
        });
        // redirect:"manual" gives us the actual 3xx status
        if (r.status >= 300 && r.status < 400) {
          return { url, status: r.status, alive: true, redirected: true, finalUrl: r.headers.get("location") || "" };
        }
        // Any response at all means the server is alive
        return { url, status: r.status, alive: true, method: "HEAD" };
      } catch (headErr) {
        // HEAD failed — could be method not allowed, CORS, or network error
      }

      // ── Strategy 2: GET with redirect:"follow" ──
      try {
        const r = await fetch(targetUrl, {
          method: "GET",
          redirect: "follow",
          signal: AbortSignal.timeout(TIMEOUT)
        });
        return {
          url,
          status: r.status,
          alive: true,
          method: "GET",
          redirected: r.redirected,
          finalUrl: r.redirected ? r.url : undefined
        };
      } catch (getErr) {
        // GET also failed — likely CORS or network
        const errMsg = getErr.message || "";

        // If it's a clear timeout, report that
        if (/timeout|abort|timed?\s*out/i.test(errMsg)) {
          return { url, status: 0, alive: false, error: "timeout" };
        }

        // ── Strategy 3: no-cors probe (last resort reachability check) ──
        try {
          const r = await fetch(targetUrl, {
            method: "GET",
            mode: "no-cors",
            redirect: "follow",
            signal: AbortSignal.timeout(TIMEOUT)
          });
          // no-cors gives opaque response — can't see status, but server answered
          return { url, status: 0, alive: true, opaque: true };
        } catch (noCorsErr) {
          // All three strategies failed — genuinely unreachable
          return { url, status: 0, alive: false, error: noCorsErr.message || "unreachable" };
        }
      }
    };

    (async () => {
      const results = {};
      const batch = await Promise.all(urls.map(checkOne));
      batch.forEach(r => { results[r.url] = r; });
      respond(results);
    })();
    return true;
  }

  if (msg.type === "OPEN_FULLVIEW") {
    const page = msg.page || "fullview.html";
    chrome.windows.create({
      url: chrome.runtime.getURL(page),
      type: "popup",
      width: 1100,
      height: 750
    });
    if (respond) respond({ success: true });
    return false;
  }

  if (msg.type === "CAPTURE_TAB") {
    // Find a real browser tab (not extension pages)
    (async () => {
      let tab = null;
      const strategies = [
        () => chrome.tabs.query({ active: true, currentWindow: true }),
        () => chrome.tabs.query({ active: true, lastFocusedWindow: true }),
      ];
      for (const fn of strategies) {
        const tabs = await fn();
        tab = tabs?.find(t => t.url && !t.url.startsWith("chrome://") && !t.url.startsWith("chrome-extension://"));
        if (tab) break;
      }
      if (!tab) {
        const wins = await chrome.windows.getAll({ windowTypes: ["normal"] });
        for (const w of wins) {
          const tabs = await chrome.tabs.query({ active: true, windowId: w.id });
          tab = tabs?.find(t => t.url && !t.url.startsWith("chrome://") && !t.url.startsWith("chrome-extension://"));
          if (tab) break;
        }
      }
      if (!tab) { respond({ success: false, error: "No capturable tab found" }); return; }
      chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, dataUrl => {
        if (chrome.runtime.lastError || !dataUrl) {
          respond({ success: false, error: chrome.runtime.lastError?.message || "Capture failed" });
          return;
        }
        autoDownloadScreenshot(dataUrl, tab.title);
        respond({ success: true, title: tab.title || "" });
      });
    })().catch(e => respond({ success: false, error: e.message }));
    return true;
  }
});

// ── Automatic on-disk safety backups (see backup-guard.js for the contract) ──
// Full storage dumps written to Downloads/PromptVault-Backups. Files survive
// extension removal, so a remove-and-reinstall can always be restored.

// Write a file without leaving a download-tray/history entry: erase the
// DownloadItem once it completes (erase removes history only — the file stays).
// Scheduled backups run twice a day and the first photo mirror writes one file
// per photo; without this the tray would drown in backup noise.
function pvSilentDownload(opts) {
  return new Promise(resolve => {
    chrome.downloads.download(opts, id => {
      if (chrome.runtime.lastError || id === undefined) { resolve(false); return; }
      const finish = ok => { try { chrome.downloads.onChanged.removeListener(listener); } catch (e) { /* gone */ } if (ok) chrome.downloads.erase({ id }, () => resolve(true)); else resolve(false); };
      const listener = delta => {
        if (delta.id !== id || !delta.state) return;
        if (delta.state.current === "complete") finish(true);
        else if (delta.state.current === "interrupted") finish(false);
      };
      chrome.downloads.onChanged.addListener(listener);
      // data: URLs often complete before the listener attaches — check once.
      chrome.downloads.search({ id }, items => {
        const it = items && items[0];
        if (it && it.state === "complete") finish(true);
        else if (it && it.state === "interrupted") finish(false);
      });
    });
  });
}
async function pvRunAutoBackup(reason) {
  try {
    const all = await new Promise(res => chrome.storage.local.get(null, r => res(r || {})));
    const version = chrome.runtime.getManifest().version;
    const dump = PVBackupGuard.buildStorageDump(all, version, reason);
    const items = PVBackupGuard.dumpItemCount(dump);
    // An empty vault must never overwrite existing backup files: right after a
    // reinstall, those files are the only surviving copy of the user's data.
    if (items === 0) { console.log("[PV] auto-backup skipped — vault is empty (" + reason + ")"); return { skipped: true, items: 0 }; }
    const json = JSON.stringify(dump);
    const url = toDataUrl(json, "application/json");
    let written = 0;
    for (const filename of PVBackupGuard.autoBackupFilenames(new Date(), reason)) {
      if (await pvSilentDownload({ url, filename, saveAs: false, conflictAction: "overwrite" })) written++;
    }
    const meta = (await new Promise(res => chrome.storage.local.get(["pv_m"], r => res(r || {})))).pv_m || {};
    meta.lastAutoBackupAt = Date.now();
    meta.lastAutoBackupItems = items;
    meta.lastAutoBackupReason = reason;
    await new Promise(res => chrome.storage.local.set({ pv_m: meta }, res));
    console.log(`[PV] auto-backup (${reason}): ${items} items, ${written} files`);
    const photos = await pvBackupPhotoOriginals().catch(e => { console.warn("[PV] photo mirror failed:", e && e.message); return { mirrored: 0 }; });
    return { skipped: false, items, written, photosMirrored: photos.mirrored || 0 };
  } catch (e) {
    console.warn("[PV] auto-backup failed:", e && e.message);
    return { skipped: true, error: e && e.message };
  }
}

// ── Photo originals mirror ──
// Full-resolution bytes live in IndexedDB, which extension removal also wipes.
// Mirror each original once to Downloads/PromptVault-Backups/photo-originals/
// as an ordinary image file named <photo-id>.<ext>. Incremental: an index in
// storage records what is already mirrored, so steady-state runs write nothing.
// The index itself rides inside every storage dump.
const PV_PHOTO_BACKUP_INDEX_KEY = "pv_photo_backup_index";
const PV_PHOTO_BACKUP_BATCH = 300;
function pvCollectPhotoItems(store) {
  const out = [];
  (function walk(n) {
    if (!n || typeof n !== "object") return;
    for (const p of Array.isArray(n.prompts) ? n.prompts : []) if (p && p.id) out.push(p);
    for (const c of Array.isArray(n.children) ? n.children : []) walk(c);
  })(store && store.folders);
  for (const t of Array.isArray(store && store.trash) ? store.trash : []) {
    const p = t && t.content && t.content.id ? t.content : t; // toTrash wraps the item as {id, content:item}
    if (p && p.id) out.push(p);
  }
  return out;
}
async function pvBackupPhotoOriginals() {
  const res = await new Promise(r => chrome.storage.local.get(["pv_ph", PV_PHOTO_BACKUP_INDEX_KEY, "pv_m"], x => r(x || {})));
  const index = res[PV_PHOTO_BACKUP_INDEX_KEY] && typeof res[PV_PHOTO_BACKUP_INDEX_KEY] === "object" ? res[PV_PHOTO_BACKUP_INDEX_KEY] : {};
  const photos = pvCollectPhotoItems(res.pv_ph);
  const todo = PVBackupGuard.photoBackupPlan(photos, index, PV_PHOTO_BACKUP_BATCH);
  let mirrored = 0;
  for (const p of todo) {
    let blob = null;
    try { blob = await pvImgGet(p.id); } catch (e) { /* db unavailable */ }
    if (!blob) continue; // thumb-only photo — nothing local to mirror
    const filename = PVBackupGuard.photoOriginalFilename(p, blob.type || p.mime);
    const url = await pvBlobToDataURL(blob);
    const ok = await pvSilentDownload({ url, filename, saveAs: false, conflictAction: "overwrite" });
    if (ok) { index[p.id] = { bytes: blob.size, file: filename }; mirrored++; }
  }
  if (mirrored) {
    const meta = res.pv_m || {};
    meta.lastPhotoBackupAt = Date.now();
    meta.photoBackupCount = Object.keys(index).length;
    await new Promise(r => chrome.storage.local.set({ [PV_PHOTO_BACKUP_INDEX_KEY]: index, pv_m: meta }, r));
    console.log(`[PV] photo mirror: ${mirrored} originals written (${Object.keys(index).length} total on disk)`);
  }
  return { mirrored, total: Object.keys(index).length };
}
// Throttled variant for startup wakes — at most one scheduled-style run per 20h.
async function pvAutoBackupIfDue(reason) {
  const res = await new Promise(r => chrome.storage.local.get(["pv_m"], x => r(x || {})));
  const last = res.pv_m?.lastAutoBackupAt || 0;
  if (Date.now() - last < 20 * 3600 * 1000) return;
  return pvRunAutoBackup(reason);
}

// ── Lifecycle ──
chrome.runtime.onInstalled.addListener(details => {
  buildFolderMenus(); bmSyncInit();
  // "update" fires with the vault data intact (same extension ID), so this
  // snapshots the vault on-disk at every single version transition.
  pvRunAutoBackup(details && details.reason ? details.reason : "install");
});
chrome.runtime.onStartup.addListener(() => { buildFolderMenus(); bmSyncInit(); pvAutoBackupIfDue("startup"); });
// Belt-and-suspenders: any write to a vault tree key refreshes the right-click menus,
// even when the write came from Drive restore, full-view windows, or quick-save paths
// that never send REBUILD_MENUS. Debounced so bulk imports build once.
let _menuChangeTimer = null;
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (!["pv_p", "pv_s", "pv_b", "pv_k", "pv_n", "pv_ph", "pv_cfg"].some(k => k in changes)) return;
  clearTimeout(_menuChangeTimer);
  _menuChangeTimer = setTimeout(buildFolderMenus, 800);
});
buildFolderMenus();
bmSyncInit();

// ── Command Palette + Quick Clip shortcuts ──
chrome.commands.onCommand.addListener((cmd) => {
  if (cmd === "open-palette") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "OPEN_PALETTE" }).catch(() => {});
      }
    });
  }
  if (cmd === "quick-clip") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      runQuickClipFromTab(tabs?.[0]);
    });
  }
  if (cmd === "take-snip") {
    (async () => {
      const wins = await chrome.windows.getAll({ windowTypes: ["normal"] });
      for (const w of wins) {
        const tabs = await chrome.tabs.query({ active: true, windowId: w.id });
        const tab = tabs?.find(t => t.url && !t.url.startsWith("chrome://") && !t.url.startsWith("chrome-extension://"));
        if (tab) {
          chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, dataUrl => {
            if (!chrome.runtime.lastError && dataUrl) autoDownloadScreenshot(dataUrl, tab.title);
          });
          break;
        }
      }
    })();
  }

  if (cmd === "inject-last-prompt") {
    (async () => {
      const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      const tab = tabs?.[0];
      if (!tab?.id || tab.url?.startsWith("chrome://") || tab.url?.startsWith("chrome-extension://")) return;
      const data = await chrome.storage.local.get(["pv_last_inject", "pv_p"]);
      const li = data.pv_last_inject;
      if (!li?.promptId || !data.pv_p?.folders) return;
      const folder = findFolder(data.pv_p.folders, li.folderId);
      const prompt = folder?.prompts?.find((p) => p.id === li.promptId);
      if (!prompt) return;
      deliverInjectToTab(tab.id, prompt.content || "", li.promptId, li.folderId, () => {});
      prompt.usageCount = (prompt.usageCount || 0) + 1;
      await bgVaultLocalSet({ pv_p: data.pv_p });
    })().catch(() => {});
  }

  const favCmd = /^inject-favorite-([1-5])$/.exec(cmd || "");
  if (favCmd) {
    const n = +favCmd[1];
    (async () => {
      const data = await chrome.storage.local.get(["pv_p"]);
      const P = data.pv_p;
      if (!P?.folders) return;
      const favs = collectFavorites(P.folders);
      const p = favs[n - 1];
      if (!p) return;
      const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      const tab = tabs?.[0];
      if (!tab?.id || tab.url?.startsWith("chrome://") || tab.url?.startsWith("chrome-extension://")) return;
      deliverInjectToTab(tab.id, p.content || "", p.id, p.folderId, () => {});
      const folder = findFolder(P.folders, p.folderId);
      const pr = folder?.prompts?.find((x) => x.id === p.id);
      if (pr) {
        pr.usageCount = (pr.usageCount || 0) + 1;
        await bgVaultLocalSet({ pv_p: P });
      }
    })().catch(() => {});
  }
});

// ── Backup alarm ──
chrome.alarms.create("bk-check", { periodInMinutes: 360 });
chrome.alarms.create("pv-auto-backup", { periodInMinutes: 720 });
chrome.alarms.onAlarm.addListener(a => {
  if (a.name === "bk-check") chrome.runtime.sendMessage({ type: "BACKUP_REMINDER" }).catch(() => {});
  if (a.name === "pv-auto-backup") pvRunAutoBackup("scheduled");
  if (a.name === "pv-reconnect") pvbConnect();
});

// ── PV bridge (MCP for local AI agents) — dormant unless the host is installed ──
pvbInit();
