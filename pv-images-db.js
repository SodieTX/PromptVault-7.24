// ═══════ PHOTO BLOB STORE (IndexedDB) ═══════
// Shared by the service worker (importScripts) and the side panel (script tag).
// Full-resolution image bytes live HERE, keyed by photo item id. The vault
// store (pv_ph) holds metadata + a small webp thumbnail that rides backups;
// blobs are local-only by design — the source URL allows re-fetching.

const PV_IMG_DB = "pv-images";
const PV_IMG_STORE = "blobs";

function pvImgDb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(PV_IMG_DB, 1);
    r.onupgradeneeded = () => { r.result.createObjectStore(PV_IMG_STORE); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function pvImgPut(id, blob) {
  const db = await pvImgDb();
  return new Promise((res, rej) => {
    const tx = db.transaction(PV_IMG_STORE, "readwrite");
    tx.objectStore(PV_IMG_STORE).put(blob, id);
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}

async function pvImgGet(id) {
  const db = await pvImgDb();
  return new Promise((res, rej) => {
    const rq = db.transaction(PV_IMG_STORE, "readonly").objectStore(PV_IMG_STORE).get(id);
    rq.onsuccess = () => res(rq.result || null);
    rq.onerror = () => rej(rq.error);
  });
}

async function pvImgDel(id) {
  const db = await pvImgDb();
  return new Promise((res, rej) => {
    const tx = db.transaction(PV_IMG_STORE, "readwrite");
    tx.objectStore(PV_IMG_STORE).delete(id);
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}

async function pvImgKeys() {
  const db = await pvImgDb();
  return new Promise((res, rej) => {
    const rq = db.transaction(PV_IMG_STORE, "readonly").objectStore(PV_IMG_STORE).getAllKeys();
    rq.onsuccess = () => res(rq.result || []);
    rq.onerror = () => rej(rq.error);
  });
}

/** Remove blobs whose photo item no longer exists anywhere (incl. trash). */
async function pvImgCleanup(validIdSet) {
  try {
    const keys = await pvImgKeys();
    const orphans = keys.filter(k => !validIdSet.has(k));
    for (const k of orphans) await pvImgDel(k);
    return orphans.length;
  } catch (e) { return 0; }
}

/** Blob → data: URL without FileReader (service workers don't have it). */
async function pvBlobToDataURL(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  return "data:" + (blob.type || "application/octet-stream") + ";base64," + btoa(bin);
}
