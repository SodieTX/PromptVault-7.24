/**
 * Prompt Vault — service worker Drive scheduler only
 * Backup implementation: drive-shared.js (also used by the UI via PVDrive).
 */
(function () {
  const S = globalThis.PVDrive && PVDrive.STORAGE;
  if (!S) {
    console.error("[PV] drive-shared.js must load before drive-sync-bg.js");
    return;
  }
  const PK = S.PK,
    SK = S.SK,
    BK = S.BK,
    NK = S.NK,
    KK = S.KK,
    GK = S.GK,
    IK = S.IK,
    CHK = S.CHK,
    CK = S.CK,
    MK = S.MK,
    BSK = S.BSK || "pv_baskets",
    WSK = S.WSK || "pv_ws";

  const DRIVE_ALARM = "pv-drive-debounced";
  const PERIODIC_ALARM = "pv-drive-periodic";
  const DEBOUNCE_MIN = 2;
  const PERIODIC_MIN = 2;

  const VAULT_DIRTY_KEYS = new Set([PK, SK, BK, NK, KK, GK, IK, CHK, "pv_uc", BSK, CK, WSK]);

  let _pushChain = Promise.resolve();

  function enqueuePush(force) {
    _pushChain = _pushChain
      .then(function () {
        return PVDrive.executeDrivePush(!!force);
      })
      .catch(function (e) {
        return { ok: false, error: e.message || String(e) };
      });
    return _pushChain;
  }

  function scheduleDebouncedDrivePush() {
    chrome.alarms.clear(DRIVE_ALARM, function () {
      chrome.alarms.create(DRIVE_ALARM, { delayInMinutes: DEBOUNCE_MIN });
    });
  }

  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area !== "local") return;
    const hit = Object.keys(changes).some(function (k) {
      return VAULT_DIRTY_KEYS.has(k);
    });
    if (!hit) return;
    chrome.storage.local.get([CK, MK], function (r) {
      const cfg = r[CK] || {};
      const m = r[MK] || {};
      if (!cfg.driveConnected || m.gdWorkerPaused) return;
      scheduleDebouncedDrivePush();
    });
  });

  chrome.alarms.onAlarm.addListener(function (a) {
    if (a.name !== DRIVE_ALARM && a.name !== PERIODIC_ALARM) return;
    chrome.storage.local.get([CK, MK], function (r) {
      const cfg = r[CK] || {};
      const m = r[MK] || {};
      if (!cfg.driveConnected || m.gdWorkerPaused) return;
      enqueuePush(false);
    });
  });

  try {
    chrome.alarms.create(PERIODIC_ALARM, { periodInMinutes: PERIODIC_MIN });
  } catch (e) {
    console.warn("[PV] Periodic Drive alarm:", e);
  }

  globalThis.__pvDriveSchedule = scheduleDebouncedDrivePush;
  globalThis.__pvDriveRun = function (force) {
    return enqueuePush(!!force);
  };

  globalThis.__pvDriveOnStartup = function () {
    chrome.storage.local.get([CK], function (r) {
      if (r[CK] && r[CK].driveConnected) scheduleDebouncedDrivePush();
    });
  };
})();
