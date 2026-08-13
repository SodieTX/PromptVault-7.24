// ═══════ BACKUP GUARD — automatic on-disk safety backups ═══════
// Pure, dependency-free helpers shared by the background service worker
// (importScripts) and the test suite. The design contract, in perpetuity:
//
//   1. Backups are FULL storage dumps built from chrome.storage.local.get(null).
//      Every silo — including ones that do not exist yet — is included
//      automatically, because nothing here enumerates store keys. Adding a new
//      section to Prompt Vault can never silently drop it from backups.
//   2. Backups are ordinary files in the user's Downloads folder, OUTSIDE the
//      extension. Chrome deletes an extension's storage when the extension is
//      removed; it never touches Downloads. Reinstalls restore from these files.
//   3. An empty vault never overwrites an existing backup file (the fresh-install
//      case is exactly when the previous backup matters most).

const PV_STORAGE_DUMP_FORMAT = "prompt-vault-storage-dump";
const PV_BACKUP_DIR = "PromptVault-Backups";
// Ephemeral keys that are large, transient, or meaningless to restore.
const PV_DUMP_SKIP_KEYS = ["pv_drag_image"];

function pvBuildStorageDump(allStorage, appVersion, reason) {
  const storage = {};
  for (const key of Object.keys(allStorage || {})) {
    if (PV_DUMP_SKIP_KEYS.includes(key)) continue;
    storage[key] = allStorage[key];
  }
  return {
    _format: PV_STORAGE_DUMP_FORMAT,
    _version: 1,
    appVersion: String(appVersion || ""),
    reason: String(reason || ""),
    createdAt: new Date().toISOString(),
    storage
  };
}

// Generic content counter: any storage value shaped like a Prompt Vault store
// ({folders:{prompts:[],children:[]}}) is counted, whatever its key is named.
// FOLDERS COUNT AS CONTENT — a vault of empty folders is organized work the
// user built, not an empty vault. (A folders-only vault once tripped every
// "empty" guard: never auto-backed-up, and Drive restore silently replaced it.)
// Workspaces (pv_ws arrays) count as one each. Counting is structural, so
// silos that do not exist yet are covered automatically.
function pvCountTreeContent(node) {
  if (!node || typeof node !== "object") return 0;
  let n = Array.isArray(node.prompts) ? node.prompts.length : 0;
  for (const child of Array.isArray(node.children) ? node.children : []) n += 1 + pvCountTreeContent(child);
  return n;
}
function pvDumpItemCount(dump) {
  const storage = dump && dump.storage ? dump.storage : {};
  let total = 0;
  for (const key of Object.keys(storage)) {
    const value = storage[key];
    if (value && typeof value === "object" && value.folders && typeof value.folders === "object") {
      total += pvCountTreeContent(value.folders);
    } else if (key === "pv_ws" && Array.isArray(value)) {
      total += value.length;
    }
  }
  return total;
}

// Rolling filenames: one slot per weekday (a 7-day window that overwrites
// itself) plus a "latest" slot and a slot per lifecycle event.
const PV_DAY_SLOTS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
function pvAutoBackupFilenames(date, reason) {
  const day = PV_DAY_SLOTS[(date instanceof Date ? date : new Date()).getDay()] || "day";
  const names = [
    `${PV_BACKUP_DIR}/prompt-vault-backup-latest.json`,
    `${PV_BACKUP_DIR}/prompt-vault-backup-${day}.json`
  ];
  if (reason === "update" || reason === "install") {
    names.push(`${PV_BACKUP_DIR}/prompt-vault-backup-on-update.json`);
  }
  return names;
}

function pvIsStorageDump(payload) {
  return !!(payload && payload._format === PV_STORAGE_DUMP_FORMAT &&
    payload.storage && typeof payload.storage === "object" && !Array.isArray(payload.storage));
}

// ── Photo originals mirror ──
// Full-resolution image bytes live in IndexedDB (see pv-images-db.js), which
// Chrome also wipes on extension removal. Each original is therefore mirrored
// once to Downloads as an ordinary image file, named by its photo id so a
// reinstall can re-attach files to their vault items mechanically.
const PV_PHOTO_DIR = PV_BACKUP_DIR + "/photo-originals";

function pvPhotoOriginalExt(mime) {
  const t = String(mime || "").toLowerCase();
  return t.includes("jpeg") ? "jpg" : t.includes("png") ? "png" : t.includes("webp") ? "webp" :
    t.includes("gif") ? "gif" : t.includes("avif") ? "avif" : t.includes("svg") ? "svg" : "img";
}
function pvPhotoOriginalFilename(photo, mime) {
  return `${PV_PHOTO_DIR}/${String(photo.id)}.${pvPhotoOriginalExt(mime || photo.mime)}`;
}
/** Parse a photo id back out of a mirrored file's name ("i_42.jpg" → "i_42"). */
function pvPhotoIdFromFilename(name) {
  const base = String(name || "").split(/[\\/]/).pop() || "";
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(0, dot) : base;
}
/**
 * Incremental plan: which photos still need mirroring. `index` maps photo id →
 * {bytes} for already-mirrored originals; a photo is due when unseen or when
 * its recorded size changed. Photos known to have no local bytes are skipped.
 */
function pvPhotoBackupPlan(photos, index, limit) {
  const idx = index && typeof index === "object" ? index : {};
  const todo = [];
  for (const p of Array.isArray(photos) ? photos : []) {
    if (!p || typeof p.id !== "string" || p.hasBlob === false) continue;
    const prev = idx[p.id];
    if (prev && (!Number.isFinite(p.bytes) || prev.bytes === p.bytes)) continue;
    todo.push(p);
    if (Number.isFinite(limit) && todo.length >= limit) break;
  }
  return todo;
}

if (typeof globalThis !== "undefined") {
  globalThis.PVBackupGuard = {
    FORMAT: PV_STORAGE_DUMP_FORMAT,
    DIR: PV_BACKUP_DIR,
    PHOTO_DIR: PV_PHOTO_DIR,
    SKIP_KEYS: [...PV_DUMP_SKIP_KEYS],
    buildStorageDump: pvBuildStorageDump,
    dumpItemCount: pvDumpItemCount,
    autoBackupFilenames: pvAutoBackupFilenames,
    isStorageDump: pvIsStorageDump,
    photoOriginalFilename: pvPhotoOriginalFilename,
    photoIdFromFilename: pvPhotoIdFromFilename,
    photoBackupPlan: pvPhotoBackupPlan
  };
}
