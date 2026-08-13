/**
 * Prompt Vault — shared Google Drive backup logic
 * Loaded by the service worker (importScripts) and extension pages (script src) before vault.js.
 * Single source of truth for Drive HTTP, payload shape, prune rules, and archive merge.
 */
(function () {
  const PK = "pv_p",
    SK = "pv_s",
    BK = "pv_b",
    NK = "pv_n",
    KK = "pv_k",
    GK = "pv_g",
    IK = "pv_ip",
    LSK = "pv_lists",
    CHK = "pv_ch",
    PHK = "pv_ph",
    MK = "pv_m",
    CK = "pv_cfg",
    UCK = "pv_uc",
    BSK = "pv_baskets",
    WSK = "pv_ws",
    PRK = "pv_pr",
    FK = "pv_f";

  function currentBackupSchemaVersion() {
    return (typeof globalThis !== "undefined" && globalThis.PV_VAULT_EXPORT_VERSION) || "7.3";
  }
  const DEFAULT_KEEP_DAILY = 14;
  const DEFAULT_KEEP_WEEKLY = 4;

  function countTree(n) {
    let p = (n.prompts || []).length;
    for (const c of n.children || []) p += countTree(c);
    return p;
  }

  function countWsNodes(WS) {
    if (!WS || !Array.isArray(WS.workspaces)) return 0;
    let n = 0;
    const walk = (node) => {
      n += 1 + (Array.isArray(node.blocks) ? node.blocks.length : 0);
      (node.children || []).forEach(walk);
    };
    WS.workspaces.forEach(walk);
    n += Array.isArray(WS.inbox) ? WS.inbox.length : 0;
    return n;
  }

  function itemCountsFromStores(P, SN, BM, NT, KL, GP, IP, PRJ, CH, WS, files, LS) {
    const prompts = P?.folders ? countTree(P.folders) : 0;
    const imgprompts = IP?.folders ? countTree(IP.folders) : 0;
    const skills = KL?.folders ? countTree(KL.folders) : 0;
    const snippets = SN?.folders ? countTree(SN.folders) : 0;
    const bookmarks = BM?.folders ? countTree(BM.folders) : 0;
    const notes = NT?.folders ? countTree(NT.folders) : 0;
    const customgpts = GP?.folders ? countTree(GP.folders) : 0;
    const projects = PRJ?.folders ? countTree(PRJ.folders) : 0;
    const chats = CH?.folders ? countTree(CH.folders) : 0;
    const workspaces = countWsNodes(WS);
    const filesCount = files?.folders ? countTree(files.folders) : 0;
    const lists = LS?.folders ? countTree(LS.folders) : 0;
    // Folders are content too: a vault of empty folders is organized user
    // work, and treating it as "empty" once made sync refuse to back it up.
    const countFolders = (n) => {
      if (!n || typeof n !== "object") return 0;
      let c = 0;
      for (const ch of Array.isArray(n.children) ? n.children : []) c += 1 + countFolders(ch);
      return c;
    };
    const folders = [P, SN, BM, NT, KL, GP, IP, PRJ, CH, files, LS]
      .reduce((n, s) => n + (s && s.folders ? countFolders(s.folders) : 0), 0);
    const total =
      prompts + imgprompts + skills + snippets + bookmarks + notes + customgpts +
      projects + chats + workspaces + filesCount + lists;
    return {
      prompts,
      imgprompts,
      skills,
      snippets,
      bookmarks,
      notes,
      customgpts,
      projects,
      chats,
      workspaces,
      files: filesCount,
      lists,
      folders,
      total,
    };
  }

  function mkDef(id, name) {
    return { folders: { id, name, children: [], prompts: [], color: "" }, trash: [], nextId: 1 };
  }

  function normalizeStoresFromGet(res) {
    let P = res[PK]?.folders ? res[PK] : mkDef("root", "My Prompts");
    let SN = res[SK]?.folders ? res[SK] : mkDef("sroot", "My Snippets");
    let BM = res[BK]?.folders ? res[BK] : mkDef("broot", "My Bookmarks");
    let NT = res[NK]?.folders ? res[NK] : mkDef("nroot", "My Notes");
    let KL = res[KK]?.folders ? res[KK] : mkDef("kroot", "My Skills");
    let GP = res[GK]?.folders ? res[GK] : mkDef("groot", "My Custom GPTs");
    let IP = res[IK]?.folders ? res[IK] : mkDef("iroot", "My Image Prompts");
    let CH = res[CHK]?.folders ? res[CHK] : mkDef("chroot", "My Chats");
    let PRJ = res[PRK]?.folders ? res[PRK] : mkDef("projroot", "My Projects");
    [P, SN, BM, NT, KL, GP, IP, CH, PRJ].forEach((x) => {
      x.trash = x.trash || [];
      x.collections = x.collections || [];
    });
    // Workspaces use a different shape ({workspaces, nextId}), not a folder-tree —
    // do NOT run the trash/collections normalization above on WS.
    let WS = res[WSK]?.workspaces ? res[WSK] : { workspaces: [], nextId: 1 };
    return { P, SN, BM, NT, KL, GP, IP, CH, WS, PRJ };
  }

  function buildVaultBackupPayload(P, SN, BM, NT, KL, GP, IP, cfg, uc, baskets, meta, CH, WS, PRJ, files, PH, LS) {
    const counts = itemCountsFromStores(P, SN, BM, NT, KL, GP, IP, PRJ, CH, WS, files, LS);
    const ucClean =
      uc && typeof uc === "object" && !Array.isArray(uc) ? uc : {};
    const body = {
      prompts: P,
      imgprompts: IP,
      skills: KL,
      snippets: SN,
      bookmarks: BM,
      notes: NT,
      customgpts: GP,
      config: cfg,
      universalCapsules: ucClean,
      exportedAt: new Date().toISOString(),
      version: currentBackupSchemaVersion(),
      counts: {
        prompts: counts.prompts,
        imgprompts: counts.imgprompts,
        skills: counts.skills,
        snippets: counts.snippets,
        bookmarks: counts.bookmarks,
        notes: counts.notes,
        customgpts: counts.customgpts,
        lists: counts.lists,
        total: counts.total,
      },
    };
    if (CH && typeof CH === "object" && !Array.isArray(CH)) body.chats = CH;
    if (WS && typeof WS === "object" && !Array.isArray(WS)) body.workspaces = WS;
    if (PRJ && typeof PRJ === "object" && !Array.isArray(PRJ)) body.projects = PRJ;
    if (files && typeof files === "object" && !Array.isArray(files)) body.files = files;
    if (PH && typeof PH === "object" && !Array.isArray(PH)) body.photos = PH;
    if (LS && typeof LS === "object" && !Array.isArray(LS)) body.lists = LS;
    if (baskets !== undefined && baskets !== null && typeof baskets === "object") {
      body.imgBuilderBaskets = baskets;
    }
    // Include dev notes / issue tracker if present in meta
    if (meta && typeof meta === "object") {
      if (Array.isArray(meta.devIssues) && meta.devIssues.length) body.devIssues = meta.devIssues;
      // devDiary was retired in v7.9.1 and is intentionally not emitted.
      if (typeof meta.devnotes === "string" && meta.devnotes.trim()) body.devnotes = meta.devnotes;
    }
    return JSON.parse(JSON.stringify(body));
  }

  /**
   * @param {{ getToken: (interactive: boolean) => Promise<string>, invalidateToken?: () => void }} auth
   * @param {{ keepDaily?: number, keepWeekly?: number }} opts
   */
  function createDriveHttp(auth, opts) {
    const invalidate = auth.invalidateToken || function () {};
    const keepDaily = opts?.keepDaily ?? DEFAULT_KEEP_DAILY;
    const keepWeekly = opts?.keepWeekly ?? DEFAULT_KEEP_WEEKLY;
    let mainFolderId = null;
    let archiveFolderId = null;

    async function api(path, requestOpts) {
      requestOpts = requestOpts || {};
      let tok = await auth.getToken(false);
      const base = path.startsWith("https://") ? path : "https://www.googleapis.com" + path;
      const r = await fetch(base, {
        ...requestOpts,
        headers: {
          Authorization: "Bearer " + tok,
          "Content-Type": "application/json",
          ...(requestOpts.headers || {}),
        },
      });
      if (r.status === 401) {
        invalidate();
        tok = await auth.getToken(false);
        const r2 = await fetch(base, {
          ...requestOpts,
          headers: {
            Authorization: "Bearer " + tok,
            "Content-Type": "application/json",
            ...(requestOpts.headers || {}),
          },
        });
        if (!r2.ok) throw new Error("Drive API " + r2.status);
        return r2;
      }
      if (!r.ok) throw new Error("Drive API " + r.status);
      return r;
    }

    async function findOrCreateFolderNamed(folderName, getId, setId) {
      const cached = getId();
      if (cached) return cached;
      const r = await api(
        `/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id)`
      );
      const d = await r.json();
      if (d.files?.length) {
        setId(d.files[0].id);
        return getId();
      }
      const cr = await api("/drive/v3/files", {
        method: "POST",
        body: JSON.stringify({
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
        }),
      });
      const cd = await cr.json();
      setId(cd.id);
      return getId();
    }

    return {
      api,
      resetFolderCaches() {
        mainFolderId = null;
        archiveFolderId = null;
      },
      findOrCreateMainFolder(folderName) {
        return findOrCreateFolderNamed(
          folderName,
          () => mainFolderId,
          (v) => {
            mainFolderId = v;
          }
        );
      },
      findOrCreateArchiveFolder(folderName) {
        return findOrCreateFolderNamed(
          folderName,
          () => archiveFolderId,
          (v) => {
            archiveFolderId = v;
          }
        );
      },
      async findFile(folderId, fileName) {
        const sr = await api(
          `/drive/v3/files?q=name='${fileName}' and '${folderId}' in parents and trashed=false&fields=files(id,name,modifiedTime)`
        );
        const sd = await sr.json();
        return sd.files?.[0] || null;
      },
      async uploadFile(folderId, fileName, jsonStr, existingFileId) {
        const boundary = "pv7sync";
        const metadata = { name: fileName, mimeType: "application/json" };
        if (!existingFileId) metadata.parents = [folderId];
        const body =
          "--" +
          boundary +
          "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
          JSON.stringify(metadata) +
          "\r\n--" +
          boundary +
          "\r\nContent-Type: application/json\r\n\r\n" +
          jsonStr +
          "\r\n--" +
          boundary +
          "--";
        const url = existingFileId
          ? "https://www.googleapis.com/upload/drive/v3/files/" + existingFileId + "?uploadType=multipart"
          : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
        return api(url, {
          method: existingFileId ? "PATCH" : "POST",
          headers: { "Content-Type": "multipart/related; boundary=" + boundary },
          body,
        });
      },
      async pruneOldDailyBackups(folderId) {
        try {
          const sr = await api(
            `/drive/v3/files?q='${folderId}' in parents and name contains 'prompt-vault-20' and trashed=false&orderBy=name desc&pageSize=100&fields=files(id,name,createdTime)`
          );
          const sd = await sr.json();
          const dated = (sd.files || []).filter((f) =>
            /^prompt-vault-\d{4}-\d{2}-\d{2}\.json$/.test(f.name)
          );
          if (dated.length <= keepDaily) return;

          const keep = new Set();
          dated.slice(0, keepDaily).forEach((f) => keep.add(f.id));
          const weeklySeen = new Set();
          dated.slice(keepDaily).forEach((f) => {
            const dateStr = f.name.match(/\d{4}-\d{2}-\d{2}/)?.[0];
            if (!dateStr) return;
            const d = new Date(dateStr + "T00:00:00Z");
            const week = Math.floor(d.getTime() / (7 * 864e5));
            if (!weeklySeen.has(week) && weeklySeen.size < keepWeekly) {
              weeklySeen.add(week);
              keep.add(f.id);
            }
          });
          for (const f of dated) {
            if (!keep.has(f.id)) {
              try {
                await api("/drive/v3/files/" + f.id, { method: "DELETE" });
              } catch (e) {
                console.warn("[PVDrive] Failed to delete old backup:", f.name, e);
              }
            }
          }
        } catch (e) {
          console.warn("[PVDrive] Prune failed:", e);
        }
      },
    };
  }

  function allItemsWalk(n, l) {
    l = l || [];
    for (const p of n.prompts || []) l.push({ ...p, folderName: n.name, folderId: n.id });
    for (const c of n.children || []) allItemsWalk(c, l);
    return l;
  }

  function collectArchiveItems(P, KL, SN, BM, NT, GP) {
    const items = {};
    const harvest = (store, storeKey) => {
      allItemsWalk(store.folders, []).forEach((p) => {
        items[p.id] = {
          id: p.id,
          store: storeKey,
          folderId: p.folderId,
          folderName: p.folderName,
          title: p.title,
          content: p.content || "",
          tags: p.tags || [],
          url: p.url || "",
          platform: p.platform || "",
          sourceUrl: p.sourceUrl || "",
          sourceTitle: p.sourceTitle || "",
          sourceType: p.sourceType || "",
          capturedAt: p.capturedAt || null,
          description: p.description || "",
          files: p.files || null,
          created: p.created,
          modified: p.modified,
          favorited: p.favorited || false,
          usageCount: p.usageCount || 0,
          versions: p.versions || [],
        };
      });
    };
    harvest(P, "prompts");
    harvest(KL, "skills");
    harvest(SN, "snippets");
    harvest(BM, "bookmarks");
    harvest(NT, "notes");
    harvest(GP, "customgpts");
    return items;
  }

  function mergeIntoArchive(archive, currentItems) {
    const now = Date.now();
    if (!archive.items) archive.items = {};
    for (const [id, item] of Object.entries(currentItems)) {
      const existing = archive.items[id];
      if (existing) {
        const archiveVersions = existing.versions || [];
        const localVersions = item.versions || [];
        const seenTs = new Set(archiveVersions.map((v) => v.saved));
        const merged = [...archiveVersions];
        for (const v of localVersions) {
          if (!seenTs.has(v.saved)) {
            merged.push(v);
            seenTs.add(v.saved);
          }
        }
        merged.sort((a, b) => a.saved - b.saved);
        archive.items[id] = {
          ...item,
          archivedAt: existing.archivedAt,
          lastSeen: now,
          versions: merged,
        };
      } else {
        archive.items[id] = { ...item, archivedAt: now, lastSeen: now };
      }
    }
    archive.updatedAt = new Date().toISOString();
    archive.totalItems = Object.keys(archive.items).length;
    archive.version = "1.0";
    return archive;
  }

  async function mergeMetaLocal(patch) {
    const cur = await chrome.storage.local.get([MK]);
    const meta = { ...(cur[MK] || {}), ...patch };
    await chrome.storage.local.set({ [MK]: meta });
  }

  function runArchivePushAsync(http, archiveFolderName, P, SN, BM, NT, KL, GP) {
    (async () => {
      try {
        const fid = await http.findOrCreateArchiveFolder(archiveFolderName);
        const fname = "prompt-vault-archive.json";
        let archive = { items: {}, version: "1.0", updatedAt: null, totalItems: 0 };
        const existingFile = await http.findFile(fid, fname);
        if (existingFile) {
          try {
            const dr = await http.api("/drive/v3/files/" + existingFile.id + "?alt=media");
            const json = await dr.text();
            archive = JSON.parse(json);
          } catch (e) {
            console.warn("[PVDrive] Archive read failed, starting fresh:", e);
          }
        }
        const currentItems = collectArchiveItems(P, KL, SN, BM, NT, GP);
        archive = mergeIntoArchive(archive, currentItems);
        const json = JSON.stringify(archive);
        await http.uploadFile(fid, fname, json, existingFile?.id || null);
        const cur = await chrome.storage.local.get([MK]);
        const meta = { ...(cur[MK] || {}) };
        meta.gdArchiveSync = Date.now();
        meta.gdArchiveCount = archive.totalItems;
        await chrome.storage.local.set({ [MK]: meta });
      } catch (e) {
        console.error("[PVDrive] Archive push error:", e);
      }
    })();
  }

  /**
   * Service-worker push: read storage, upload latest + daily, prune, optional archive.
   */
  async function executeDrivePush(force) {
    const MAIN = "Prompt Vault Backups";
    const ARCHIVE = "Prompt Vault Archive";

    let swToken = null;
    const http = createDriveHttp(
      {
        getToken: function (interactive) {
          return new Promise(function (res, rej) {
            chrome.identity.getAuthToken({ interactive: !!interactive }, function (token) {
              if (chrome.runtime.lastError) {
                rej(chrome.runtime.lastError);
                return;
              }
              swToken = token;
              res(token);
            });
          });
        },
        invalidateToken: function () {
          swToken = null;
        },
      },
      { keepDaily: DEFAULT_KEEP_DAILY, keepWeekly: DEFAULT_KEEP_WEEKLY }
    );

    const keys = [PK, SK, BK, NK, KK, GK, IK, PHK, LSK, CHK, MK, CK, UCK, BSK, WSK, PRK, FK];
    const res = await chrome.storage.local.get(keys);
    const cfg = res[CK] || {};
    if (!cfg.driveConnected) {
      return { ok: true, skipped: true };
    }

    try {
      await new Promise(function (res, rej) {
        chrome.identity.getAuthToken({ interactive: false }, function (token) {
          if (chrome.runtime.lastError) rej(chrome.runtime.lastError);
          else res(token);
        });
      });
    } catch (e) {
      const msg = e && e.message ? e.message : "Not signed in";
      await mergeMetaLocal({
        gdWorkerError: msg,
        gdWorkerPaused: false,
        gdWorkerSyncing: false,
        gdWorkerLastAttempt: Date.now(),
      });
      return { ok: false, error: msg };
    }

    await mergeMetaLocal({
      gdWorkerSyncing: true,
      gdWorkerLastAttempt: Date.now(),
    });

    let lastSyncResult = 0;
    try {
      const stores = normalizeStoresFromGet(res);
      const P = stores.P,
        SN = stores.SN,
        BM = stores.BM,
        NT = stores.NT,
        KL = stores.KL,
        GP = stores.GP,
        IP = stores.IP,
        CH = stores.CH,
        WS = stores.WS,
        PRJ = stores.PRJ;
      const files = res[FK];
      const ucRaw = res[UCK];
      const uc =
        ucRaw && typeof ucRaw === "object" && !Array.isArray(ucRaw) ? ucRaw : {};
      const baskets = res[BSK];
      const meta = res[MK] || {};
      const counts = itemCountsFromStores(P, SN, BM, NT, KL, GP, IP, PRJ, CH, WS, files, res[LSK]);

      if (counts.total === 0 && !counts.folders) {
        const error = force
          ? "Backup blocked — vault is empty (cloud not overwritten)"
          : "Sync blocked — vault is empty";
        await mergeMetaLocal({
          gdWorkerError: error,
          gdWorkerPaused: !force,
          gdWorkerSyncing: false,
          gdWorkerLastAttempt: Date.now(),
        });
        return { ok: false, error: error, paused: !force };
      }

      const lastCounts = meta.gdLastCounts;
      if (lastCounts && lastCounts.total > 5 && !force) {
        const dropPct = 1 - counts.total / lastCounts.total;
        if (dropPct > 0.3) {
          const error =
            "Sync paused — " +
            Math.round(dropPct * 100) +
            "% data drop detected (" +
            lastCounts.total +
            "→" +
            counts.total +
            " items)";
          console.warn("[PVDrive] Auto-sync blocked — significant data reduction.", lastCounts, "→", counts);
          await mergeMetaLocal({
            gdWorkerError: error,
            gdWorkerPaused: true,
            gdWorkerSyncing: false,
            gdWorkerLastAttempt: Date.now(),
          });
          return { ok: false, error: error, paused: true };
        }
      }

      const fid = await http.findOrCreateMainFolder(MAIN);
      const payload = buildVaultBackupPayload(P, SN, BM, NT, KL, GP, IP, cfg, uc, baskets, meta, CH, WS, PRJ, files, res[PHK], res[LSK]);
      const json = JSON.stringify(payload);

      const latestName = "prompt-vault-backup.json";
      const existing = await http.findFile(fid, latestName);
      await http.uploadFile(fid, latestName, json, existing?.id || null);

      const dname = "prompt-vault-" + new Date().toISOString().slice(0, 10) + ".json";
      const dailyExists = await http.findFile(fid, dname);
      if (!dailyExists) {
        await http.uploadFile(fid, dname, json, null);
      }

      lastSyncResult = Date.now();
      await mergeMetaLocal({
        gdSync: lastSyncResult,
        gdLastCounts: {
          prompts: counts.prompts,
          imgprompts: counts.imgprompts,
          skills: counts.skills,
          snippets: counts.snippets,
          bookmarks: counts.bookmarks,
          notes: counts.notes,
          customgpts: counts.customgpts,
          lists: counts.lists,
          total: counts.total,
        },
        gdWorkerError: null,
        gdWorkerPaused: false,
        gdWorkerSyncing: false,
        gdWorkerLastAttempt: lastSyncResult,
      });

      http.pruneOldDailyBackups(fid).catch(function (e) {
        console.warn("[PVDrive] Prune error:", e);
      });
      if (cfg.archiveEnabled) runArchivePushAsync(http, ARCHIVE, P, SN, BM, NT, KL, GP);
    } catch (e) {
      const error = e.message || String(e);
      console.error("[PVDrive] Push error:", e);
      await mergeMetaLocal({
        gdWorkerError: error,
        gdWorkerSyncing: false,
        gdWorkerLastAttempt: Date.now(),
      });
      return { ok: false, error: error };
    }

    return { ok: true, lastSync: lastSyncResult };
  }

  globalThis.PVDrive = {
    STORAGE: { PK, SK, BK, NK, KK, GK, IK, PHK, LSK, CHK, MK, CK, UCK, BSK, WSK, PRK, FK },
    get BACKUP_VERSION() {
      return currentBackupSchemaVersion();
    },
    countTree,
    itemCountsFromStores,
    normalizeStoresFromGet,
    buildVaultBackupPayload,
    createDriveHttp,
    collectArchiveItems,
    mergeIntoArchive,
    executeDrivePush,
  };
})();
