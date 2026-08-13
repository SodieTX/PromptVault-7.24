import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = rel => readFileSync(path.join(root, rel), 'utf8');

function loadBackupGuard() {
  const context = vm.createContext({});
  context.globalThis = context;
  vm.runInContext(read('backup-guard.js'), context, { filename: 'backup-guard.js' });
  const guard = context.PVBackupGuard;
  assert.ok(guard, 'PVBackupGuard failed to load');
  return guard;
}

// ── The perpetuity contract: backups must include EVERY storage key, even for
// silos that do not exist yet, because the dump copies storage wholesale
// instead of enumerating known stores. ──
test('storage dump includes unknown future silos verbatim', () => {
  const G = loadBackupGuard();
  const all = {
    pv_p: { folders: { id: 'root', prompts: [{ id: 'i_1' }], children: [] } },
    pv_some_future_silo: { folders: { id: 'xroot', prompts: [{ id: 'i_9' }], children: [] } },
    pv_cfg: { theme: 'dark' },
    totally_unknown_key: [1, 2, 3],
    pv_drag_image: { huge: 'transient blob' }
  };
  const dump = G.buildStorageDump(all, '9.99.9', 'test');
  assert.equal(dump._format, 'prompt-vault-storage-dump');
  assert.deepEqual(dump.storage.pv_some_future_silo, all.pv_some_future_silo);
  assert.deepEqual(dump.storage.totally_unknown_key, [1, 2, 3]);
  assert.deepEqual(dump.storage.pv_cfg, { theme: 'dark' });
  assert.ok(!('pv_drag_image' in dump.storage), 'transient drag stash must not be persisted');
});

test('dump content counter sees items AND folders in any store, present or future', () => {
  const G = loadBackupGuard();
  const dump = G.buildStorageDump({
    pv_ph: { folders: { id: 'phroot', prompts: [{ id: 'a' }, { id: 'b' }], children: [{ id: 'c1', prompts: [{ id: 'c' }], children: [] }] } },
    pv_new_thing: { folders: { id: 'n', prompts: [{ id: 'd' }], children: [] } },
    pv_ws: [{ id: 'w1' }],
    pv_cfg: { theme: 'dark' }
  }, '1', 'test');
  assert.equal(G.dumpItemCount(dump), 6, '4 items + 1 folder + 1 workspace');
  assert.equal(G.dumpItemCount(G.buildStorageDump({ pv_cfg: {} }, '1', 'test')), 0, 'a virgin install is genuinely empty');
  // Regression: a vault of EMPTY FOLDERS is organized user work, not an empty
  // vault — it must be backed up, and must never be silently replaced.
  const foldersOnly = G.buildStorageDump({
    pv_p: { folders: { id: 'root', prompts: [], children: [{ id: 'f1', prompts: [], children: [{ id: 'f2', prompts: [], children: [] }] }] } }
  }, '1', 'test');
  assert.equal(G.dumpItemCount(foldersOnly), 2, 'empty folders count as content');
});

test('folder-only vaults pass every empty-guard: restore confirm, Drive push', () => {
  const vaultSrc = read('vault.js');
  assert.match(vaultSrc, /pvVaultHasAnyStructure/, 'folder-structure check missing');
  const skipLine = vaultSrc.split('\n').find(l => l.includes('const skipModal='));
  assert.ok(skipLine && skipLine.includes('pvVaultHasAnyStructure'), 'Drive restore must not skip confirmation while folders exist');
  assert.match(vaultSrc, /runRestoreLatestFromDrive[\s\S]{0,600}AUTO_BACKUP_NOW/, 'Drive restore must write a local pre-restore dump first');
  const drive = read('drive-shared.js');
  assert.match(drive, /counts\.total === 0 && !counts\.folders/, 'Drive push must accept folder-only vaults');
});

// ── The empty-vault guard is what keeps a fresh reinstall from destroying the
// only surviving copy of the user's data. ──
test('background worker refuses to overwrite backups with an empty vault', () => {
  const src = read('background.js');
  assert.match(src, /chrome\.storage\.local\.get\(null/, 'auto-backup must dump ALL of storage, not an enumerated list');
  assert.match(src, /items === 0.*skipped: true|if \(items === 0\)/s, 'auto-backup must skip when the vault is empty');
  assert.match(src, /"backup-guard\.js"/, 'backup-guard.js must be loaded by the service worker');
  assert.match(src, /AUTO_BACKUP_NOW/, 'on-demand backup message handler missing');
  assert.match(src, /pv-auto-backup/, 'scheduled backup alarm missing');
  assert.match(src, /onInstalled[\s\S]{0,500}pvRunAutoBackup/, 'every version update must snapshot the vault');
});

test('rolling filenames cover latest, weekday slots, and update snapshots', () => {
  const G = loadBackupGuard();
  const wed = new Date('2026-08-12T12:00:00Z');
  const names = G.autoBackupFilenames(wed, 'scheduled');
  assert.ok(names.some(n => n.endsWith('prompt-vault-backup-latest.json')));
  assert.equal(names.filter(n => /backup-(sun|mon|tue|wed|thu|fri|sat)\.json$/.test(n)).length, 1);
  const onUpdate = G.autoBackupFilenames(wed, 'update');
  assert.ok(onUpdate.some(n => n.endsWith('prompt-vault-backup-on-update.json')));
  for (const n of [...names, ...onUpdate]) assert.ok(n.startsWith('PromptVault-Backups/'));
});

test('side panel recognizes and restores storage dumps', () => {
  const vaultSrc = read('vault.js');
  assert.match(vaultSrc, /prompt-vault-storage-dump/, 'import parser must recognize auto-backup dumps');
  assert.match(vaultSrc, /function showStorageDumpRestore/, 'dedicated restore modal missing');
  assert.match(vaultSrc, /isStorageDump.*showStorageDumpRestore/s, 'importParsedText must route dumps to the restore modal');
  assert.match(vaultSrc, /emptyRestore/, 'empty-vault welcome card must offer Restore Backup');
  assert.match(vaultSrc, /openVaultBackupRestore/, 'restore picker missing');
});

// ── Photo originals mirror: full-resolution bytes live in IndexedDB, which
// extension removal also wipes — so each original is mirrored once to an
// ordinary file on disk and can be re-attached by id after a reinstall. ──
test('photo originals: filenames round-trip through ids and the plan is incremental', () => {
  const G = loadBackupGuard();
  const photo = { id: 'i_42', mime: 'image/jpeg', bytes: 5000 };
  const name = G.photoOriginalFilename(photo);
  assert.equal(name, 'PromptVault-Backups/photo-originals/i_42.jpg');
  assert.equal(G.photoIdFromFilename(name), 'i_42');
  assert.equal(G.photoIdFromFilename('i_9.webp'), 'i_9');
  const photos = [
    { id: 'i_1', bytes: 100 },              // already mirrored, unchanged → skip
    { id: 'i_2', bytes: 999 },              // mirrored but size changed → re-mirror
    { id: 'i_3', bytes: 50 },               // new → mirror
    { id: 'i_4', hasBlob: false },          // no local bytes → skip
  ];
  const plan = G.photoBackupPlan(photos, { i_1: { bytes: 100 }, i_2: { bytes: 111 } });
  // Spread into a host-realm array: the VM's Array.prototype fails deepStrictEqual.
  assert.deepEqual([...plan].map(p => p.id), ['i_2', 'i_3']);
  assert.equal(G.photoBackupPlan(photos, { i_1: { bytes: 100 } }, 1).length, 1, 'batch limit respected');
});

test('worker mirrors photo originals and the panel can re-attach them', () => {
  const bg = read('background.js');
  assert.match(bg, /pvBackupPhotoOriginals/, 'photo mirror missing from worker');
  assert.match(bg, /pvRunAutoBackup[\s\S]*pvBackupPhotoOriginals/, 'photo mirror must run with every backup pass');
  assert.match(bg, /pv_photo_backup_index/, 'incremental index missing');
  const vaultSrc = read('vault.js');
  assert.match(vaultSrc, /openPhotoOriginalsReattach/, 're-attach flow missing from panel');
  assert.match(vaultSrc, /photoReattach/, 'Settings re-attach button missing');
  assert.match(read('sidepanel.html'), /backup-guard\.js/, 'side panel must load the shared backup helpers');
});

test('automatic writes are silent and re-attach heals the mirror index', () => {
  const bg = read('background.js');
  assert.match(bg, /function pvSilentDownload/, 'silent download helper missing');
  assert.match(bg, /chrome\.downloads\.erase/, 'history entries must be erased so backups do not flood the tray');
  const backupFn = bg.slice(bg.indexOf('async function pvRunAutoBackup'), bg.indexOf('async function pvAutoBackupIfDue'));
  assert.match(backupFn, /pvSilentDownload/, 'storage dumps must download silently');
  const mirrorFn = bg.slice(bg.indexOf('async function pvBackupPhotoOriginals'));
  assert.match(mirrorFn, /pvSilentDownload/, 'photo mirror must download silently');
  const vaultSrc = read('vault.js');
  const reattach = vaultSrc.slice(vaultSrc.indexOf('function openPhotoOriginalsReattach'));
  assert.match(reattach.slice(0, 3000), /delete idx\[id\]/, 're-attach must clear mirrored-index entries so a new machine re-mirrors');
});

// ── Extension identity: the manifest "key" pins the extension ID, which is what
// chrome.storage.local is scoped to. Changing or dropping it silently orphans
// every user's data. It must never change. ──
test('manifest key (extension identity) is pinned forever', () => {
  const manifest = JSON.parse(read('manifest.json'));
  assert.equal(
    manifest.key,
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyW7NkTKfI54UTlxoPV6aiWkhAXDalvYD+WmPW8kG6q4KCQ9CBL5+pS4JIwUf8ahZt8q82KVZ7q4iAVlV7X//13o8bHp5673VPyWlAqldJSdvjifEDkL7u3xEaT2Oy4T2jyRS6SJw3eeJI6JwDhi71voPuLjajDsmubWM6S3K3MnBBmSM5Zzjvcaa+g/B3xBCmcD+upou4edFj1W4iTyRau35HyP+s1fFxWlcur5TfeiMhXQKg/YEbS2mZet86+dKwaZ633VEZiF0+GPU6MMnya0FvOohlzVBE5duxLT5hPMxrmCicEVYCJBFcHr3Sw4+m+pvVP87m/R74d+lXyPFwQIDAQAB',
    'The manifest "key" pins the extension ID that chrome.storage is scoped to. ' +
    'Changing it orphans every existing vault. Do not change it — ever.'
  );
  for (const perm of ['storage', 'unlimitedStorage', 'downloads', 'alarms']) {
    assert.ok(manifest.permissions.includes(perm), `backup system requires the "${perm}" permission`);
  }
});
