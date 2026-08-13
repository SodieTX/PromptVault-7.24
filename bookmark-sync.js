// ═══════ BOOKMARK SYNC (Chrome ↔ Vault) ═══════
// Runs in background. Chrome → Vault via listeners; Vault → Chrome via BM_SYNC_PUSH message.

const BM_SYNC_FOLDER = "Prompt Vault";
let bmSyncPushing = false;

function bmSyncGetOrCreateFolder() {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree((tree) => {
      const bar = tree?.[0]?.children?.find((n) => n.title === "Bookmarks bar" || n.title === "Bookmarks Bar");
      if (!bar) {
        resolve(null);
        return;
      }
      const existing = bar.children?.find((c) => c.title === BM_SYNC_FOLDER);
      if (existing) {
        resolve(existing.id);
        return;
      }
      chrome.bookmarks.create({ parentId: bar.id, title: BM_SYNC_FOLDER }, (node) => {
        resolve(node?.id || null);
      });
    });
  });
}

async function bmSyncPushToChrome(item) {
  if (!item?.url) return;
  const cfg = await new Promise((r) => chrome.storage.local.get(["pv_cfg"], (res) => r(res.pv_cfg || {})));
  const mode = cfg.bookmarkSyncMode || "vault-only";
  if (mode !== "two-way") return;

  const folderId = await bmSyncGetOrCreateFolder();
  if (!folderId) return;

  let title = (item.title || "").trim();
  if (!title) try { title = new URL(item.url).hostname; } catch { title = "Untitled"; }

  if (item.chromeId) {
    chrome.bookmarks.update(item.chromeId, { title, url: item.url }, () => {
      if (chrome.runtime.lastError) console.warn("PV bookmark sync update:", chrome.runtime.lastError);
    });
  } else {
    bmSyncPushing = true;
    chrome.bookmarks.create({ parentId: folderId, title, url: item.url }, (node) => {
      bmSyncPushing = false;
      if (node?.id) {
        chrome.storage.local.get(["pv_b"], (res) => {
          const BM = res.pv_b || { folders: { id: "broot", name: "My Bookmarks", children: [], prompts: [] }, trash: [], nextId: 1 };
          function findAndSet(target, itemId, chromeId) {
            for (const p of (target.prompts || [])) { if (p.id === itemId) { p.chromeId = chromeId; return true; } }
            for (const c of (target.children || [])) { if (findAndSet(c, itemId, chromeId)) return true; }
            return false;
          }
          findAndSet(BM.folders, item.id, node.id);
          chrome.storage.local.set({ pv_b: BM });
        });
      }
    });
  }
}

function bmSyncChromeToVault(id, info) {
  if (bmSyncPushing) return;
  chrome.storage.local.get(["pv_b", "pv_cfg"], (res) => {
    const BM = res.pv_b;
    const cfg = res.pv_cfg || {};
    const mode = cfg.bookmarkSyncMode || "vault-only";
    if (mode !== "two-way" && mode !== "chrome-only") return;
    if (!BM?.folders) return;

    function findByChromeId(node, cid) {
      for (const p of (node.prompts || [])) if (p.chromeId === cid) return { node, item: p };
      for (const c of (node.children || [])) { const r = findByChromeId(c, cid); if (r) return r; }
      return null;
    }
    function findByUrl(node, url) {
      for (const p of (node.prompts || [])) if (p.url === url) return { node, item: p };
      for (const c of (node.children || [])) { const r = findByUrl(c, url); if (r) return r; }
      return null;
    }

    if (info.removed) {
      const found = findByChromeId(BM.folders, id);
      if (found && mode === "two-way") {
        const idx = found.node.prompts.indexOf(found.item);
        if (idx >= 0) {
          found.node.prompts.splice(idx, 1);
          chrome.storage.local.set({ pv_b: BM });
        }
      }
      return;
    }

    chrome.bookmarks.get(id, (nodes) => {
      const node = nodes?.[0];
      if (!node?.url || node.url.startsWith("javascript:") || node.url.startsWith("chrome://")) return;
      const found = findByChromeId(BM.folders, id);
      const url = (info.url !== undefined ? info.url : node.url) || "";
      const title = (info.title !== undefined ? info.title : node.title) || "";
      let titleStr = (title || "").trim();
      if (!titleStr) try { titleStr = new URL(url).hostname; } catch { titleStr = "Untitled"; }

      if (found) {
        found.item.title = titleStr;
        found.item.url = url;
        found.item.modified = Date.now();
        chrome.storage.local.set({ pv_b: BM });
        return;
      }
      const byUrl = findByUrl(BM.folders, url);
      if (byUrl) {
        byUrl.item.chromeId = id;
        byUrl.item.title = titleStr;
        byUrl.item.modified = Date.now();
        chrome.storage.local.set({ pv_b: BM });
        return;
      }
      const newItem = {
        id: "b_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
        title: titleStr,
        url,
        content: "",
        tags: [],
        chromeId: id,
        created: node.dateAdded || Date.now(),
        modified: Date.now(),
        usageCount: 0,
        favorited: false,
        versions: [],
      };
      BM.folders.prompts = BM.folders.prompts || [];
      BM.folders.prompts.push(newItem);
      chrome.storage.local.set({ pv_b: BM });
    });
  });
}

let bmSyncListenersAdded = false;
function bmSyncInit() {
  if (bmSyncListenersAdded) return;
  bmSyncListenersAdded = true;
  chrome.bookmarks.onCreated.addListener((id, node) => {
    chrome.storage.local.get(["pv_cfg"], (res) => {
      const mode = (res.pv_cfg || {}).bookmarkSyncMode || "vault-only";
      if (mode !== "two-way" && mode !== "chrome-only") return;
      if (node?.url && !node.url.startsWith("javascript:") && !node.url.startsWith("chrome://")) {
        bmSyncChromeToVault(id, {});
      }
    });
  });
  chrome.bookmarks.onChanged.addListener((id, changeInfo) => {
    chrome.storage.local.get(["pv_cfg"], (res) => {
      const mode = (res.pv_cfg || {}).bookmarkSyncMode || "vault-only";
      if (mode !== "two-way" && mode !== "chrome-only") return;
      bmSyncChromeToVault(id, changeInfo);
    });
  });
  chrome.bookmarks.onRemoved.addListener((id) => {
    chrome.storage.local.get(["pv_cfg"], (res) => {
      const mode = (res.pv_cfg || {}).bookmarkSyncMode || "vault-only";
      if (mode !== "two-way" && mode !== "chrome-only") return;
      bmSyncChromeToVault(id, { removed: true });
    });
  });
}
