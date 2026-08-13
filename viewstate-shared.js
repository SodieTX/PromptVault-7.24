// ═══════ VIEW STATE SHARED ═══════
// Cross-window sync of navigational view state (expand map, selection, search,
// sort, view mode) between the side panel and the expanded full-view windows.
// Stored under chrome.storage.local["pv_vs"] = { <silo>: {exp,sel,q,sort,view,...} }.
//
// Loop safety (three independent guards):
//   1. _src stamp  — a window ignores storage changes it wrote itself.
//   2. _applying   — while applying a remote change (and the render it triggers),
//                    patch() is a no-op, so the applied render can't echo a write.
//   3. value diff  — patch() compares a deep snapshot and writes only on real change.
(function (g) {
  var KEY = "pv_vs";
  var _self = "vs_" + Math.random().toString(36).slice(2) + "_" + Date.now();
  var _cache = {};
  var _applying = false;
  var _t = null;

  function _read(cb) {
    try {
      chrome.storage.local.get([KEY], function (r) {
        _cache = (r && r[KEY]) || {};
        if (cb) cb(_cache);
      });
    } catch (e) { _cache = {}; if (cb) cb(_cache); }
  }

  function get(silo) { return (_cache && _cache[silo]) || {}; }

  function patch(silo, partial) {
    if (_applying) return;            // guard 2: never write while applying remote
    if (!silo || !partial) return;
    var cur = _cache[silo] || {};
    var merged = Object.assign({}, cur, partial);
    var ms, cs;
    try { ms = JSON.stringify(merged); cs = JSON.stringify(cur); } catch (e) { return; }
    if (ms === cs) return;            // guard 3: no real change, no write
    _cache[silo] = JSON.parse(ms);    // deep snapshot — breaks aliasing with live exp{}
    clearTimeout(_t);
    _t = setTimeout(function () {
      try {
        var payload = {};
        for (var s in _cache) { if (s !== "_src") payload[s] = _cache[s]; }
        payload._src = _self;
        chrome.storage.local.set({ [KEY]: payload });
      } catch (e) {}
    }, 180);
  }

  function subscribe(cb) {
    try {
      chrome.storage.onChanged.addListener(function (ch, area) {
        if (area !== "local" || !ch[KEY]) return;
        var nv = ch[KEY].newValue || {};
        if (nv._src === _self) return; // guard 1: ignore my own write
        _cache = nv;
        _applying = true;
        try { cb(nv); } finally { _applying = false; }
      });
    } catch (e) {}
  }

  g.PVViewState = { load: _read, get: get, patch: patch, subscribe: subscribe, KEY: KEY };
})(typeof window !== "undefined" ? window : globalThis);
