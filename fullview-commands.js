// ═══════ CLAUDE COMMANDS — FULL-SCREEN READER ═══════
// Standalone page (fullview-commands.html) opened in its own window from the
// Commands tab's "Expand" button. Reads the bundled global PV_CLAUDE_COMMANDS
// (claude-commands-data.js, loaded first) and renders the whole cheat sheet with
// room to actually read it: group nav + searchable card grid + click-to-copy.

(function () {
  "use strict";
  const DATA = (typeof PV_CLAUDE_COMMANDS !== "undefined" && PV_CLAUDE_COMMANDS) || { groups: [], meta: {} };
  const GROUPS = Array.isArray(DATA.groups) ? DATA.groups : [];
  const FLAT = [];
  GROUPS.forEach(g => (g.commands || []).forEach(c => FLAT.push(Object.assign({ _group: g.name, _icon: g.icon || "" }, c))));

  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const state = { q: "", g: "" };

  function matches(c) {
    if (state.g && c._group !== state.g) return false;
    if (!state.q) return true;
    const q = state.q;
    return (c.name || "").toLowerCase().includes(q)
      || (c.description || "").toLowerCase().includes(q)
      || (c._group || "").toLowerCase().includes(q)
      || (c.inject || "").toLowerCase().includes(q)
      || (c.example || "").toLowerCase().includes(q)
      || (c.tags || []).some(t => String(t).toLowerCase().includes(q));
  }

  let _toastTmr = null;
  function toast(msg) {
    const t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(_toastTmr);
    _toastTmr = setTimeout(() => t.classList.remove("on"), 1600);
  }

  function copy(text, label) {
    const done = () => toast("Copied " + (label || "command") + " — paste into Claude");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else fallback();
    function fallback() {
      try {
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
        done();
      } catch (e) { toast("Copy failed"); }
    }
  }

  function renderMeta() {
    const note = (DATA.meta && DATA.meta.note) ? DATA.meta.note : "Master cheat sheet";
    $("meta").textContent = FLAT.length + " commands · " + GROUPS.length + " groups · " + note;
  }

  function renderNav() {
    const nav = $("nav");
    let h = `<div class="nav-title">Groups</div>`;
    h += `<div class="nav-item${state.g ? "" : " sel"}" data-g=""><span class="ico">✦</span><span class="nm">All commands</span><span class="ct">${FLAT.length}</span></div>`;
    GROUPS.forEach(g => {
      h += `<div class="nav-item${state.g === g.name ? " sel" : ""}" data-g="${esc(g.name)}"><span class="ico">${esc(g.icon || "•")}</span><span class="nm">${esc(g.name)}</span><span class="ct">${(g.commands || []).length}</span></div>`;
    });
    nav.innerHTML = h;
    nav.querySelectorAll(".nav-item").forEach(el => el.addEventListener("click", () => {
      state.g = el.dataset.g || "";
      renderNav();
      renderContent();
      $("content").scrollTop = 0;
    }));
  }

  function cardHtml(c, i) {
    const ex = c.example ? `<div class="ex"><b>e.g.</b><code>${esc(c.example)}</code></div>` : "";
    const tags = (c.tags || []).length ? `<div class="tags">${(c.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : "";
    return `<div class="card" data-i="${i}" title="Click to copy"><div class="card-hd"><code class="cmd">${esc(c.name)}</code><button class="copy" data-i="${i}">Copy</button></div>${c.description ? `<div class="desc">${esc(c.description)}</div>` : ""}${ex}${tags}</div>`;
  }

  function renderContent() {
    const el = $("content");
    const shownIdx = [];
    FLAT.forEach((c, i) => { if (matches(c)) shownIdx.push(i); });
    if (!shownIdx.length) {
      el.innerHTML = `<div class="empty">No commands match “${esc(state.q)}”${state.g ? " in " + esc(state.g) : ""}.</div>`;
      return;
    }
    let h = `<div class="hint">Click any card (or its <code>Copy</code> button) to copy the command to your clipboard, then paste it into Claude. Use the search box or the groups on the left to narrow things down.</div>`;
    const activeGroups = state.g ? GROUPS.filter(g => g.name === state.g) : GROUPS;
    activeGroups.forEach(g => {
      const items = shownIdx.filter(i => FLAT[i]._group === g.name);
      if (!items.length) return;
      h += `<div class="section"><div class="sec-hd"><span class="ico">${esc(g.icon || "•")}</span> ${esc(g.name)} <span class="ct">${items.length}</span></div><div class="grid">`;
      h += items.map(i => cardHtml(FLAT[i], i)).join("");
      h += `</div></div>`;
    });
    el.innerHTML = h;
    el.querySelectorAll(".card").forEach(card => card.addEventListener("click", e => {
      const btn = e.target.closest(".copy");
      const idx = +((btn && btn.dataset.i) || card.dataset.i);
      const c = FLAT[idx];
      if (c) copy(c.inject || "", c.name);
    }));
  }

  function init() {
    if (!FLAT.length) {
      $("content").innerHTML = `<div class="empty">No command data loaded.<br>Reopen this window from the Commands tab after reloading the extension.</div>`;
      $("meta").textContent = "";
      return;
    }
    renderMeta();
    renderNav();
    renderContent();
    const s = $("srch");
    s.addEventListener("input", e => { state.q = (e.target.value || "").toLowerCase().trim(); renderContent(); });
    s.focus();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
