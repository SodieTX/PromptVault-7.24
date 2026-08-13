// Prompt Vault v7 — Clips/Notes/Skills Full View
// Detects tab from URL param: ?tab=notes → notes mode, ?tab=skills → skills mode, otherwise clips
const params = new URLSearchParams(window.location.search);
const tabMode = params.get("tab") || "clips";
const isNotes = tabMode === "notes";
const isSkills = tabMode === "skills";
const STORE_KEY = isSkills ? "pv_k" : isNotes ? "pv_n" : "pv_s";
const ROOT_ID = isSkills ? "kroot" : isNotes ? "nroot" : "sroot";
const CK = "pv_cfg";
const LABEL = isSkills ? "Skills" : isNotes ? "Notes" : "Clips";
const EMOJI = isSkills ? "🛠" : isNotes ? "📝" : "📋";
const SEL_CLASS = isSkills ? "sel-k" : isNotes ? "sel-n" : "sel-s";
const TAG_CLASS = isSkills ? "card-tag-k" : isNotes ? "card-tag-n" : "card-tag-s";
const CARD_CLASS = isSkills ? "skill-card" : isNotes ? "note-card" : "";
const BTN_CLASS = isSkills ? "skill-btn" : isNotes ? "note-btn" : "";
const ACCENT = isSkills ? "var(--sk)" : isNotes ? "var(--nt)" : "var(--sn)";

const DEFAULT_PLATFORMS = [
  {id:"anthropic",name:"Anthropic / Claude",icon:"🟤"},
  {id:"openai",name:"OpenAI / ChatGPT",icon:"🟢"},
  {id:"google",name:"Google / Gemini",icon:"🔵"},
  {id:"xai",name:"xAI / Grok",icon:"⚫"},
  {id:"perplexity",name:"Perplexity",icon:"🟣"},
  {id:"mistral",name:"Mistral",icon:"🟠"},
  {id:"deepseek",name:"DeepSeek",icon:"🔷"},
  {id:"meta",name:"Meta / Llama",icon:"🔹"},
  {id:"copilot",name:"Microsoft Copilot",icon:"🔶"},
  {id:"poe",name:"Poe",icon:"🟡"},
  {id:"other",name:"Other",icon:"⬛"},
];

let D = null, cfg = null, sel = ROOT_ID, exp = {}, searchQ = "", viewingId = null;
exp[ROOT_ID] = 1;

// Set heading
document.getElementById("heading").className = isSkills ? "skills" : isNotes ? "notes" : "clips";
document.getElementById("headingText").textContent = `${EMOJI} ${LABEL} — Full View`;
document.querySelector(".srch").placeholder = `Search ${LABEL.toLowerCase()}...`;
if (isNotes) {
  document.documentElement.style.setProperty('--ac', '#7ab87a');
  document.documentElement.style.setProperty('--ad', 'rgba(122,184,122,.12)');
  document.documentElement.style.setProperty('--ab', 'rgba(122,184,122,.25)');
  document.querySelector(".top .srch").style.setProperty("--focus-color", "var(--nt)");
} else if (isSkills) {
  document.documentElement.style.setProperty('--ac', '#6c8fd9');
  document.documentElement.style.setProperty('--ad', 'rgba(108,143,217,.12)');
  document.documentElement.style.setProperty('--ab', 'rgba(108,143,217,.25)');
  document.querySelector(".top .srch").style.setProperty("--focus-color", "var(--sk)");
} else {
  // Clips — blue
  document.documentElement.style.setProperty('--ac', '#5c8ec4');
  document.documentElement.style.setProperty('--ad', 'rgba(92,142,196,.12)');
  document.documentElement.style.setProperty('--ab', 'rgba(92,142,196,.25)');
}

// findFolder, fp, ci, allItems, esc, formatDate, formatDateTime, tok, domain, favicon → fullview-shared.js
function getPlatName(id) { const p = (cfg?.platforms || DEFAULT_PLATFORMS).find(x => x.id === id); return p ? p.name : ""; }
function getPlatIcon(id) { const p = (cfg?.platforms || DEFAULT_PLATFORMS).find(x => x.id === id); return p ? p.icon : ""; }
function wc(t) { return (t || "").split(/\s+/).filter(Boolean).length; }
// Notes: HTML or markdown render (matches sidepanel notes-editor.js)
const NOTE_ALLOWED = new Set(["b","i","u","strong","em","p","div","br","ul","ol","li","span","blockquote","h1","h2","h3"]);
function sanitizeNoteHtml(html) {
  if (!html || typeof html !== "string") return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  function walk(n) {
    if (n.nodeType === 3) return n.cloneNode(true);
    if (n.nodeType !== 1) return null;
    const tag = n.tagName.toLowerCase();
    if (!NOTE_ALLOWED.has(tag) && tag !== "body") return null;
    const out = doc.createElement(tag === "body" ? "div" : tag);
    if (tag === "span" || tag === "p" || tag === "div") { const s = n.getAttribute("style"); if (s && /text-align|margin/.test(s)) out.setAttribute("style", s); }
    for (let c = n.firstChild; c; c = c.nextSibling) { const w = walk(c); if (w) out.appendChild(w); }
    return out;
  }
  const frag = document.createDocumentFragment();
  for (let c = doc.body.firstChild; c; c = c.nextSibling) { const w = walk(c); if (w) frag.appendChild(w); }
  const wrap = document.createElement("div"); wrap.appendChild(frag); return wrap.innerHTML;
}
function renderNoteContent(html) {
  if (!html || typeof html !== "string") return "";
  if (html.trim().startsWith("<") && /<\/[a-z]+>/i.test(html)) return sanitizeNoteHtml(html);
  return parseNoteMarkdown(html);
}
function parseNoteMarkdown(text) {
  if (!text || typeof text !== "string") return "";
  const e = (s) => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  let html = "", inCode = false, codeBuf = [];
  const flushCode = () => { if (codeBuf.length) { html += `<pre class="note-code"><code>${e(codeBuf.join("\n"))}</code></pre>`; codeBuf = []; } };
  const inline = (s) => { let t = e(s); t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/~~(.+?)~~/g, "<s>$1</s>").replace(/`([^`]+)`/g, "<code class=\"note-inline-code\">$1</code>").replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, l, u) => `<a href="${e(u)}" target="_blank" rel="noopener" class="note-link">${e(l)}</a>`); return t; };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) { if (inCode) { flushCode(); inCode = false; } else { inCode = true; } continue; }
    if (inCode) { codeBuf.push(line); continue; }
    const h1 = line.match(/^#\s+(.+)$/), h2 = line.match(/^##\s+(.+)$/), h3 = line.match(/^###\s+(.+)$/);
    if (h1) { flushCode(); html += `<h1 class="note-h1">${e(h1[1])}</h1>`; continue; }
    if (h2) { flushCode(); html += `<h2 class="note-h2">${e(h2[1])}</h2>`; continue; }
    if (h3) { flushCode(); html += `<h3 class="note-h3">${e(h3[1])}</h3>`; continue; }
    const bq = line.match(/^>\s*(.*)$/); if (bq) { html += `<blockquote class="note-bq">${e(bq[1])}</blockquote>`; continue; }
    const cbU = line.match(/^[-*]\s+\[ \]\s+(.*)$/), cbC = line.match(/^[-*]\s+\[x\]\s+(.*)$/i);
    if (cbU) { html += `<div class="note-todo"><span class="note-todo-box">&#9744;</span>${e(cbU[1])}</div>`; continue; }
    if (cbC) { html += `<div class="note-todo done"><span class="note-todo-box">&#9745;</span>${e(cbC[1])}</div>`; continue; }
    const ul = line.match(/^[-*]\s+(.*)$/); if (ul) { html += `<div class="note-ul-item">&#8226; ${inline(ul[1])}</div>`; continue; }
    const ol = line.match(/^(\d+)\.\s+(.*)$/); if (ol) { html += `<div class="note-ol-item"><span class="note-ol-num">${ol[1]}.</span> ${inline(ol[2])}</div>`; continue; }
    if (/^[-*_]{3,}$/.test(line.trim())) { html += "<hr class=\"note-hr\">"; continue; }
    const btn = line.match(/^\[>\s*(.+?)\]\s*\((.+?)\)$/); if (btn) { html += `<a href="${e(btn[2])}" target="_blank" rel="noopener" class="note-btn">${e(btn[1])}</a>`; continue; }
    if (!line.trim()) { html += "<br>"; continue; }
    html += `<p class="note-p">${inline(line)}</p>`;
  }
  flushCode();
  return html;
}
// Skill helpers
function parseSkillYaml(content) {
  const m = (content || "").match(/^---\n([\s\S]*?)\n---/); if (!m) return {};
  const yaml = m[1], result = {};
  const nm = yaml.match(/^name:\s*(.+)/m); if (nm) result.name = nm[1].trim();
  const d1 = yaml.match(/^description:\s*(.+)/m); if (d1) result.description = d1[1].trim();
  return result;
}
function skillFileSummary(p) {
  const fc = p.files ? Object.keys(p.files).length : 0;
  const totalBytes = (p.content || "").length + (p.files ? Object.values(p.files).reduce((a, b) => a + (b || "").length, 0) : 0);
  const dirs = {};
  if (p.files) Object.keys(p.files).forEach(path => {
    const parts = path.split("/");
    if (parts.length > 1) { const d = parts[0]; dirs[d] = (dirs[d] || 0) + 1; }
    else { dirs["(root)"] = (dirs["(root)"] || 0) + 1; }
  });
  return { fileCount: fc + 1, totalKB: (totalBytes / 1024).toFixed(1), dirs };
}

function renderTree() {
  const panel = document.getElementById("treePanel");
  let h = `<div class="tree-title">${LABEL} Folders</div>`;
  function walk(n, depth) {
    const isSel = sel === n.id;
    const isExp = exp[n.id];
    const hasKids = (n.children || []).length > 0;
    const count = ci(n).prompts;
    const col = n.color || "";
    const colStyle = col ? `color:${col}` : `color:${ACCENT}`;
    h += `<div class="tn ${isSel ? SEL_CLASS : ''}" data-id="${n.id}" style="padding-left:${8 + depth * 16}px">`;
    h += `<span class="ch" style="transform:rotate(${isExp && hasKids ? 90 : 0}deg);opacity:${hasKids ? 1 : .2}"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"/></svg></span>`;
    h += `<span class="fi" style="${colStyle}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${isExp ? 'M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v1M5 19h14a2 2 0 0 0 2-2l-2-7H5l-2 7a2 2 0 0 0 2 2z' : 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'}"/></svg></span>`;
    h += `<span class="nm">${esc(n.name)}</span>`;
    if (count) h += `<span class="ct">${count}</span>`;
    h += `</div>`;
    if (isExp && hasKids) for (const c of n.children) walk(c, depth + 1);
  }
  walk(D.folders, 0);
  // Folder actions
  h += `<div class="tree-acts"><button class="ta-btn" id="taAdd">+ Folder</button>`;
  if (sel !== ROOT_ID) h += `<button class="ta-btn" id="taRn">✎</button><button class="ta-btn ta-dng" id="taDel">🗑</button>`;
  h += `</div>`;
  panel.innerHTML = h;
  panel.querySelectorAll(".tn").forEach(el => {
    el.addEventListener("click", () => {
      sel = el.dataset.id; viewingId = null;
      const n = findFolder(D.folders, sel);
      if (n && (n.children || []).length) exp[sel] = !exp[sel];
      renderTree(); renderContent();
    });
    el.draggable = true;
    el.addEventListener("dragstart", e => { e.dataTransfer.setData("fid", el.dataset.id); e.dataTransfer.effectAllowed = "move"; });
    el.addEventListener("dragover", e => { e.preventDefault(); el.classList.add("drop-over"); });
    el.addEventListener("dragleave", () => el.classList.remove("drop-over"));
    el.addEventListener("drop", e => {
      e.preventDefault(); el.classList.remove("drop-over");
      const srcFid = e.dataTransfer.getData("fid"), srcPid = e.dataTransfer.getData("pid"), srcPfid = e.dataTransfer.getData("pfid");
      const id = el.dataset.id;
      if (srcFid && srcFid !== id) {
        const sp = fpD(D.folders, srcFid), sn = findFolder(D.folders, srcFid), tg = findFolder(D.folders, id);
        if (sp && sn && tg && !findFolder(sn, id)) { sp.children = sp.children.filter(x => x.id !== srcFid); tg.children = tg.children || []; tg.children.push(sn); exp[id] = 1; saveD(); renderTree(); renderContent(); flash("Folder moved"); }
      } else if (srcPid && srcPfid) {
        const sf = findFolder(D.folders, srcPfid), tf = findFolder(D.folders, id);
        if (sf && tf && srcPfid !== id) { const i = (sf.prompts || []).findIndex(x => x.id === srcPid); if (i >= 0) { const [moved] = sf.prompts.splice(i, 1); tf.prompts = tf.prompts || []; tf.prompts.push(moved); moved.modified = Date.now(); saveD(); renderTree(); renderContent(); flash("Moved"); } }
      }
    });
    el.addEventListener("contextmenu", e => { e.preventDefault();
      const n = findFolder(D.folders, el.dataset.id); if (!n) return;
      const m = document.createElement("div"); m.className = "fv-ctx"; m.style.left = e.clientX + "px"; m.style.top = e.clientY + "px";
      m.innerHTML = `<div class="fv-ctx-i" data-a="add">+ New Subfolder</div><div class="fv-ctx-i" data-a="rn">✎ Rename</div>${el.dataset.id !== ROOT_ID ? '<div class="fv-ctx-i fv-ctx-dng" data-a="del">🗑 Delete</div>' : ''}`;
      document.body.appendChild(m);
      m.querySelectorAll("[data-a]").forEach(i => i.addEventListener("click", () => {
        const a = i.dataset.a; try { document.body.removeChild(m) } catch {};
        if (a === "add") { sel = el.dataset.id; exp[sel] = 1; addFolderD() }
        if (a === "rn") renameFolderD(el.dataset.id, n.name);
        if (a === "del" && el.dataset.id !== ROOT_ID) deleteFolderD(el.dataset.id, n.name);
      }));
      setTimeout(() => document.addEventListener("click", function h2() { try { document.body.removeChild(m) } catch {}; document.removeEventListener("click", h2) }, { once: true }), 10);
    });
  });
  document.getElementById("taAdd")?.addEventListener("click", () => addFolderD());
  document.getElementById("taRn")?.addEventListener("click", () => { const n = findFolder(D.folders, sel); if (n) renameFolderD(sel, n.name) });
  document.getElementById("taDel")?.addEventListener("click", () => { const n = findFolder(D.folders, sel); if (n && sel !== ROOT_ID) deleteFolderD(sel, n.name) });
}

function gidD() { const id = "i_" + D.nextId; D.nextId++; return id }
function fpD(n, t, p = null) { if (n.id === t) return p; for (const c of (n.children || [])) { const f = fpD(c, t, n); if (f) return f } return null }
function gdD(n) { let d = 0, c = n; while (c) { const p = fpD(D.folders, c.id); if (!p) break; d++; c = p } return d }
function saveD() { fvBumpMeta(); chrome.storage.local.set({ [STORE_KEY]: D }); try { chrome.runtime.sendMessage({ type: "DATA_CHANGED" }) } catch {} try { chrome.runtime.sendMessage({ type: "REBUILD_MENUS" }) } catch {} }

// findInTree, findParentFolder, afList, cloneObj, flash, showFvModal, closeFvModal → fullview-shared.js

// ═══════ PARITY: Context Menu ═══════
// Page-specific itemCtx — references _ctxEl from shared
function itemCtx(e,p){
  e.preventDefault();e.stopPropagation();
  if(_ctxEl)_ctxEl.remove();
  const m=document.createElement("div");m.className="fv-ctx";m.style.left=e.clientX+"px";m.style.top=e.clientY+"px";
  _ctxEl=m;
  let h=`<div class="fv-ctx-i" data-a="copy">📋 Copy</div>`;
  h+=`<div class="fv-ctx-i" data-a="edit">✎ Edit</div>`;
  h+=`<div class="fv-ctx-i" data-a="fav">${p.favorited?'★ Unfavorite':'☆ Favorite'}</div>`;
  h+=`<div class="fv-ctx-i" data-a="dup">📄 Duplicate</div>`;
  h+=`<div class="fv-ctx-i" data-a="move">📁 Move to…</div>`;
  h+=`<div class="fv-ctx-sep"></div>`;
  h+=`<div class="fv-ctx-i fv-ctx-dng" data-a="del">🗑 Delete</div>`;
  m.innerHTML=h;
  document.body.appendChild(m);
  const rect=m.getBoundingClientRect();
  if(rect.right>window.innerWidth)m.style.left=(window.innerWidth-rect.width-8)+"px";
  if(rect.bottom>window.innerHeight)m.style.top=(window.innerHeight-rect.height-8)+"px";
  m.querySelectorAll("[data-a]").forEach(i=>i.addEventListener("click",()=>{
    const a=i.dataset.a;m.remove();_ctxEl=null;
    if(a==="copy"){navigator.clipboard.writeText(p.content||"");flash("Copied")}
    if(a==="edit")editItemModal(p.id);
    if(a==="fav")toggleFav(p.id);
    if(a==="dup")duplicateItem(p.id);
    if(a==="move")moveItemModal(p.id);
    if(a==="del")deleteItemModal(p.id,p.title);
  }));
  setTimeout(()=>document.addEventListener("click",function h2(){if(_ctxEl){_ctxEl.remove();_ctxEl=null}document.removeEventListener("click",h2)},{once:true}),10);
}

// ═══════ PARITY: Item Actions ═══════
function toggleFav(pid){
  const item=findInTree(D.folders,pid);
  if(item){item.favorited=!item.favorited;item.modified=Date.now();saveD();renderContent();flash(item.favorited?"★ Favorited":"☆ Unfavorited")}
}
function duplicateItem(pid){
  const item=findInTree(D.folders,pid);if(!item)return;
  const folder=findParentFolder(D.folders,pid);if(!folder)return;
  const n=cloneObj(item);n.id=gidD();n.title+=" (copy)";n.created=n.modified=Date.now();n.usageCount=0;n.versions=[];
  folder.prompts.push(n);saveD();renderContent();flash("Duplicated");
}
function deleteItemModal(pid,title){
  showFvModal(`<h3>Delete "${esc(title)}"?</h3><p style="font-size:11px;color:var(--dm);margin-bottom:12px">This will move it to trash.</p><div class="btn-row"><button class="mbtn" id="mdX">Cancel</button><button class="mbtn dng" id="mdY">Delete</button></div>`,box=>{
    box.querySelector("#mdX").addEventListener("click",closeFvModal);
    box.querySelector("#mdY").addEventListener("click",()=>{
      fvPushUndo(STORE_KEY, D);
      const folder=findParentFolder(D.folders,pid);
      if(folder){
        const item=folder.prompts.find(x=>x.id===pid);
        if(item){
          D.trash=D.trash||[];D.trash.push({type:"prompt",id:pid,name:item.title,content:cloneObj(item),deletedAt:Date.now(),from:folder.id});
          if(D.trash.length>100)D.trash=D.trash.slice(-100);
          folder.prompts=folder.prompts.filter(x=>x.id!==pid);
          saveD();closeFvModal();renderContent();renderStats();flash("Deleted");
        }
      }
    });
  });
}
function editItemModal(pid){
  const p=findInTree(D.folders,pid);if(!p)return;
  showFvModal(`<h3>Edit ${LABEL.slice(0,-1)}</h3>
    <label>Title</label><input type="text" id="edTi" value="${esc(p.title||'')}">
    <label>Tags (comma separated)</label><input type="text" id="edTg" value="${esc((p.tags||[]).join(', '))}">
    <label>Content</label><textarea id="edCo" rows="6">${esc(p.content||'')}</textarea>
    <div class="btn-row"><button class="mbtn" id="edX">Cancel</button><button class="mbtn primary" id="edOK">Save</button></div>`,box=>{
    box.querySelector("#edTi").focus();
    box.querySelector("#edX").addEventListener("click",closeFvModal);
    box.querySelector("#edOK").addEventListener("click",()=>{
      fvPushUndo(STORE_KEY, D);
      p.title=box.querySelector("#edTi").value.trim()||p.title;
      p.tags=box.querySelector("#edTg").value.split(",").map(t=>t.trim().toLowerCase()).filter(Boolean);
      p.content=box.querySelector("#edCo").value;
      p.modified=Date.now();
      saveD();closeFvModal();renderContent();flash("Saved");
    });
  });
}
function moveItemModal(pid){
  const flds=afList(D.folders);
  const curFolder=findParentFolder(D.folders,pid);
  const curFid=curFolder?curFolder.id:"";
  let h=`<h3>Move to</h3><div style="max-height:300px;overflow-y:auto">`;
  flds.forEach(f=>{
    if(f.id===curFid)return;
    h+=`<div class="fpi" data-mid="${f.id}" style="padding-left:${6+f.depth*12}px;cursor:pointer">📁 ${esc(f.name)}</div>`;
  });
  h+=`</div><div class="btn-row"><button class="mbtn" id="mvX">Cancel</button></div>`;
  showFvModal(h,box=>{
    box.querySelector("#mvX").addEventListener("click",closeFvModal);
    box.querySelectorAll("[data-mid]").forEach(el=>el.addEventListener("click",()=>{
      const tgtId=el.dataset.mid;
      const srcFolder=findParentFolder(D.folders,pid);
      const tgtFolder=findFolder(D.folders,tgtId);
      if(!srcFolder||!tgtFolder)return;
      const idx=srcFolder.prompts.findIndex(x=>x.id===pid);
      if(idx<0)return;
      const[moved]=srcFolder.prompts.splice(idx,1);
      tgtFolder.prompts=tgtFolder.prompts||[];tgtFolder.prompts.push(moved);
      moved.modified=Date.now();
      saveD();closeFvModal();renderTree();renderContent();flash("Moved");
    }));
  });
}
function createNewItem(){
  const folder=findFolder(D.folders,sel);if(!folder)return;
  const id=gidD();
  const item={id,title:"New "+LABEL.slice(0,-1),content:"",tags:[],created:Date.now(),modified:Date.now(),usageCount:0,favorited:false,versions:[]};
  if(isSkills){item.files={};item.description=""}
  folder.prompts=folder.prompts||[];folder.prompts.push(item);
  saveD();renderContent();renderStats();flash("Created");
  editItemModal(id);
}
function addFolderD() {
  const f = findFolder(D.folders, sel); if (!f || gdD(f) >= 4) return;
  const id = gidD(); f.children = f.children || []; f.children.push({ id, name: "New Folder", children: [], prompts: [], color: "" });
  exp[sel] = 1; saveD(); renderTree(); renderContent(); renameFolderD(id, "New Folder");
}
function renameFolderD(fid, name) {
  const inp = prompt("Rename folder:", name); if (inp === null) return; const v = inp.trim();
  if (v) { const f = findFolder(D.folders, fid); if (f) { f.name = v; saveD(); renderTree(); renderContent() } }
}
function deleteFolderD(fid, name) {
  if (!confirm(`Delete "${name}"? Contents will be lost.`)) return;
  const parent = fpD(D.folders, fid), folder = findFolder(D.folders, fid);
  if (parent && folder) { parent.children = parent.children.filter(x => x.id !== fid); if (sel === fid) sel = parent.id; saveD(); renderTree(); renderContent() }
}

function renderContent() {
  const c = document.getElementById("content");

  // ── Detail/Reader view ──
  if (viewingId) {
    const all = allItems(D.folders);
    const p = all.find(x => x.id === viewingId);
    if (!p) { viewingId = null; renderContent(); return; }
    renderDetail(c, p);
    return;
  }

  const f = findFolder(D.folders, sel);
  if (!f) { c.innerHTML = '<div class="empty">Folder not found</div>'; return; }
  const isRoot = sel === ROOT_ID;

  // Breadcrumbs
  const crumbs = []; let n = f; while (n) { crumbs.unshift(n); n = fp(D.folders, n.id); }
  let h = '<div class="bc">';
  crumbs.forEach((b, i) => {
    if (i) h += ' <span style="opacity:.4">/</span> ';
    h += `<span class="${i === crumbs.length - 1 ? 'cur' : ''}" data-nav="${b.id}">${esc(b.name)}</span>`;
  });
  h += '</div>';

  // Subfolders (drop targets for moving items)
  if (f.children?.length) {
    h += '<div class="sub-chips">';
    f.children.forEach(ch => {
      const col = ch.color || "";
      const colStyle = col ? `color:${col}` : `color:${ACCENT}`;
      h += `<div class="sub-chip" data-nav="${ch.id}" data-drop-fid="${ch.id}"><span style="${colStyle};display:flex"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span> ${esc(ch.name)} <span class="sub-ct">${ci(ch).prompts}</span></div>`;
    });
    h += '</div>';
  }

  // Items
  let items = isRoot ? allItems(D.folders) : [...(f.prompts || [])];

  // Search filter
  if (searchQ) {
    const q = searchQ.toLowerCase();
    const all = allItems(D.folders);
    items = all.filter(p => p.title.toLowerCase().includes(q) || (p.content || "").toLowerCase().includes(q) || (p.tags || []).some(t => t.toLowerCase().includes(q)) || (p.sourceTitle || "").toLowerCase().includes(q));
  }

  // Preserve array order when not searching — allows drag-reorder to persist (root + folder view)
  if (!searchQ) { /* use order as-is */ } else { items.sort((a, b) => (b.modified || 0) - (a.modified || 0)); }
  const displayItems = items.slice(0, 200);

  if (searchQ) {
    h += `<div style="font-size:10px;color:var(--dm);margin-bottom:8px">${items.length} result${items.length !== 1 ? 's' : ''} for "${esc(searchQ)}"</div>`;
  } else if (isRoot && items.length) {
    h += `<div style="font-size:10px;color:var(--dm);margin-bottom:8px">${items.length} ${LABEL.toLowerCase()} across all folders${items.length > 200 ? ' (showing 200)' : ''}</div>`;
  }

  if (displayItems.length) {
    h += `<div style="margin-bottom:8px"><button class="ta-btn" id="fvNewItem" style="font-size:11px;padding:4px 12px">+ New ${LABEL.slice(0,-1)}</button></div>`;
    h += '<div class="cards">';
    displayItems.forEach(p => {
      const platIcon = getPlatIcon(p.platform);
      const platName = getPlatName(p.platform);

      if (isSkills) {
        // ── Skill card: package layout with file tree, deploy ──
        const summary = skillFileSummary(p);
        const dirPills = Object.entries(summary.dirs).map(([d, ct]) => `<span class="sk-dp">${esc(d === "(root)" ? "" : d + "/")}${ct}</span>`).join("");
        const fname = (p.title || "skill").replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
        const desc = p.description || parseSkillYaml(p.content).description || "";
        h += `<div class="card skill-card" data-open="${esc(p.id)}" data-pid="${esc(p.id)}" data-fid="${esc(p.folderId||sel)}" draggable="true">`;
        h += `<div class="card-top"><div class="sk-icon-lg">📦</div><div class="card-info"><div class="card-title">${esc(p.title)}${p.favorited ? ' <span style="color:var(--sk)">★</span>' : ''}</div>`;
        h += `<div class="sk-fname">${esc(fname)}/ · ${summary.fileCount} files · ${summary.totalKB}KB</div>`;
        if (desc) h += `<div class="sk-desc">${esc(desc.slice(0, 120))}${desc.length > 120 ? '...' : ''}</div>`;
        if (dirPills) h += `<div class="sk-dirs">${dirPills}</div>`;
        if ((isRoot || searchQ) && p.folderName) h += `<div class="folder-path">📁 ${esc(p.folderName)}</div>`;
        h += `</div>`;
        h += `<div class="card-acts"><button class="card-btn skill-btn" data-deploy="${esc(p.id)}" title="Deploy to conversation">🚀</button><button class="card-btn skill-btn" data-copy="${esc(p.id)}" title="Copy SKILL.md"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button></div>`;
        h += `</div>`;
        if (p.tags?.length) h += `<div class="card-tags">${p.tags.map(t => `<span class="card-tag card-tag-k">${esc(t)}</span>`).join('')}</div>`;
        h += `<div class="card-meta"><span>${formatDate(p.modified || p.created)}</span><span>${summary.fileCount} files${p.lastDeployed ? ` · deployed ${formatDate(p.lastDeployed)}` : ''}${(p.usageCount || 0) > 0 ? ` · ${p.usageCount}×` : ''}</span></div>`;
        h += `</div>`;
      } else {
        // ── Standard clip/note card ──
        h += `<div class="card ${CARD_CLASS}" data-open="${esc(p.id)}" data-pid="${esc(p.id)}" data-fid="${esc(p.folderId||sel)}" draggable="true">`;
        h += `<div class="card-top"><div class="card-info"><div class="card-title">${platIcon ? platIcon + ' ' : ''}${esc(p.title)}</div>`;
        if (platName) h += `<div class="card-plat">${esc(platName)}</div>`;
        if ((isRoot || searchQ) && p.folderName) h += `<div class="folder-path">📁 ${esc(p.folderName)}</div>`;
        if (!isNotes && p.sourceUrl) {
          h += `<div class="card-source">${favicon(p.sourceUrl, 12)} ${esc(p.sourceTitle || domain(p.sourceUrl))}</div>`;
        }
        h += `</div>`;
        h += `<div class="card-acts"><button class="card-btn ${BTN_CLASS}" data-copy="${esc(p.id)}" title="Copy to clipboard"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button><button class="card-btn ${BTN_CLASS}" data-del="${esc(p.id)}" title="Delete" style="color:var(--dn)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5-3h4a1 1 0 0 1 1 1v1H9V4a1 1 0 0 1 1-1"/></svg></button></div>`;
        h += `</div>`;
        if (p.content) h += `<div class="card-body note-rendered">${isNotes ? renderNoteContent(p.content) : esc(p.content)}</div>`;
        if (p.tags?.length) h += `<div class="card-tags">${p.tags.map(t => `<span class="card-tag ${TAG_CLASS}">${esc(t)}</span>`).join('')}</div>`;
        h += `<div class="card-meta"><span>${p.capturedAt ? formatDateTime(p.capturedAt) : formatDate(p.modified || p.created)}</span><span>${wc(p.content)}w · ~${tok(p.content)}t${(p.usageCount || 0) > 0 ? ` · ${p.usageCount}×` : ''}</span></div>`;
        h += `</div>`;
      }
    });
    h += '</div>';
  } else {
    h += `<div class="empty">No ${LABEL.toLowerCase()} found</div>`;
    h += `<div style="margin-top:8px;text-align:center"><button class="ta-btn" id="fvNewItem" style="font-size:11px;padding:4px 12px">+ New ${LABEL.slice(0,-1)}</button></div>`;
  }

  c.innerHTML = h;

  c.querySelectorAll("[data-nav]").forEach(el => {
    el.addEventListener("click", () => { sel = el.dataset.id; exp[sel] = 1; searchQ = ""; viewingId = null; document.getElementById("searchBox").value = ""; renderTree(); renderContent(); });
  });
  c.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const all = allItems(D.folders);
      const p = all.find(x => x.id === btn.dataset.copy);
      if (p) {navigator.clipboard.writeText(p.content || "");flash("Copied")}
    });
  });
  c.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const all = allItems(D.folders);
      const p = all.find(x => x.id === btn.dataset.del);
      if(p) deleteItemModal(p.id, p.title);
    });
  });
  // Right-click context menu on items
  c.querySelectorAll("[data-open]").forEach(card => {
    card.addEventListener("contextmenu", e => {
      const all = allItems(D.folders);
      const p = all.find(x => x.id === card.dataset.open);
      if(p) itemCtx(e, p);
    });
  });
  // + New button
  c.querySelector("#fvNewItem")?.addEventListener("click", () => createNewItem());
  c.querySelectorAll("[data-deploy]").forEach(btn => {
    btn.addEventListener("click", () => {
      const all = allItems(D.folders);
      const p = all.find(x => x.id === btn.dataset.deploy);
      if (!p) return;
      // Download as .skill or .md
      const hasFiles = p.files && Object.keys(p.files).length > 0;
      const fname = (p.title || "skill").replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
      if (hasFiles) {
        // Build minimal zip for multi-file skills
        const enc = new TextEncoder();
        const files = [{ name: fname + "/SKILL.md", data: enc.encode(p.content || "") }];
        if (p.files) Object.entries(p.files).forEach(([path, content]) => {
          files.push({ name: fname + "/" + path, data: enc.encode(content || "") });
        });
        // Use STORE method (simple, no compression needed for text)
        buildStoreZip(files).then(zip => {
          const blob = new Blob([zip], { type: "application/zip" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = fname + ".skill"; a.click(); URL.revokeObjectURL(url);
        });
      } else {
        const blob = new Blob([p.content || ""], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = fname + ".md"; a.click(); URL.revokeObjectURL(url);
      }
      // Bump usage
      const folder = findFolder(D.folders, p.folderId || sel);
      if (folder) { const pr = folder.prompts?.find(x => x.id === p.id); if (pr) { pr.usageCount = (pr.usageCount || 0) + 1; pr.lastDeployed = Date.now(); saveD(); } }
    });
  });
  // ── Click-to-open detail view ──
  c.querySelectorAll("[data-open]").forEach(card => {
    card.style.cursor = "pointer";
    card.addEventListener("click", e => {
      // Don't open if clicking a button
      if (e.target.closest(".card-btn, .card-acts, button")) return;
      viewingId = card.dataset.open;
      renderContent();
    });
  });
  // ── Drag & drop: reorder + move ──
  c.querySelectorAll("[data-pid]").forEach(card => {
    card.addEventListener("dragstart", e => { e.dataTransfer.setData("pid", card.dataset.pid); e.dataTransfer.setData("pfid", card.dataset.fid); e.dataTransfer.effectAllowed = "move"; card.classList.add("dragging"); });
    card.addEventListener("dragend", () => { card.classList.remove("dragging"); c.querySelectorAll(".drop-above,.drop-below,.drop-over").forEach(x => x.classList.remove("drop-above", "drop-below", "drop-over")); });
    card.addEventListener("dragover", e => {
      if (!e.dataTransfer.types.includes("pid")) return;
      e.preventDefault();
      const rect = card.getBoundingClientRect();
      const pct = (e.clientY - rect.top) / rect.height;
      card.classList.remove("drop-above", "drop-below");
      card.classList.add(pct < 0.5 ? "drop-above" : "drop-below");
    });
    card.addEventListener("dragleave", () => card.classList.remove("drop-above", "drop-below"));
    card.addEventListener("drop", e => {
      card.classList.remove("drop-above", "drop-below");
      const srcPid = e.dataTransfer.getData("pid"), srcFid = e.dataTransfer.getData("pfid");
      const tgtPid = card.dataset.pid, tgtFid = card.dataset.fid;
      if (!srcPid || srcPid === tgtPid) return;
      if (srcFid === tgtFid) {
        e.preventDefault(); e.stopPropagation();
        const folder = findFolder(D.folders, tgtFid); if (!folder) return;
        const srcIdx = (folder.prompts || []).findIndex(x => x.id === srcPid);
        if (srcIdx < 0) return;
        const [moved] = folder.prompts.splice(srcIdx, 1);
        let tgtIdx = folder.prompts.findIndex(x => x.id === tgtPid);
        const rect = card.getBoundingClientRect();
        const pct = (e.clientY - rect.top) / rect.height;
        if (tgtIdx < 0) tgtIdx = folder.prompts.length;
        else if (pct >= 0.5) tgtIdx++;
        folder.prompts.splice(tgtIdx, 0, moved);
        saveD(); renderContent(); flash("Reordered");
      } else {
        e.preventDefault(); e.stopPropagation();
        const src = findFolder(D.folders, srcFid), tgt = findFolder(D.folders, tgtFid);
        if (src && tgt) { const i = (src.prompts || []).findIndex(x => x.id === srcPid); if (i >= 0) { const [moved] = src.prompts.splice(i, 1); tgt.prompts = tgt.prompts || []; tgt.prompts.push(moved); moved.modified = Date.now(); saveD(); renderTree(); renderContent(); flash("Moved"); } }
      }
    });
  });
  c.querySelectorAll("[data-drop-fid]").forEach(chip => {
    chip.addEventListener("dragover", e => { if (e.dataTransfer.types.includes("pid")) { e.preventDefault(); chip.classList.add("drop-over"); } });
    chip.addEventListener("dragleave", () => chip.classList.remove("drop-over"));
    chip.addEventListener("drop", e => {
      chip.classList.remove("drop-over");
      const srcPid = e.dataTransfer.getData("pid"), srcFid = e.dataTransfer.getData("pfid");
      const tgtFid = chip.dataset.dropFid;
      if (!srcPid || srcFid === tgtFid) return;
      e.preventDefault(); e.stopPropagation();
      const src = findFolder(D.folders, srcFid), tgt = findFolder(D.folders, tgtFid);
      if (src && tgt) { const i = (src.prompts || []).findIndex(x => x.id === srcPid); if (i >= 0) { const [moved] = src.prompts.splice(i, 1); tgt.prompts = tgt.prompts || []; tgt.prompts.push(moved); moved.modified = Date.now(); saveD(); renderTree(); renderContent(); flash("Moved"); } }
    });
  });
}

// ═══════ DETAIL / READER VIEW ═══════
function renderDetail(c, p) {
  const platIcon = getPlatIcon(p.platform);
  const platName = getPlatName(p.platform);
  const storeIcons = { prompts: "⚡", skills: "🛠", snippets: "📋", bookmarks: "🔖", notes: "📝" };

  let h = `<div class="detail">`;
  h += `<div class="detail-nav"><button class="detail-back" id="detailBack"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back</button>`;
  h += `<div class="detail-acts">`;
  h += `<button class="detail-btn" id="detailCopy"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button>`;
  if (isSkills) h += `<button class="detail-btn" id="detailDeploy">🚀 Deploy</button>`;
  h += `</div></div>`;

  // Title + metadata
  h += `<div class="detail-header">`;
  h += `<h2 class="detail-title">${platIcon ? platIcon + ' ' : ''}${esc(p.title)}${p.favorited ? ' <span style="color:' + ACCENT + '">★</span>' : ''}</h2>`;
  const metaParts = [];
  if (platName) metaParts.push(platName);
  if (p.folderName) metaParts.push("📁 " + p.folderName);
  if (p.capturedAt) metaParts.push(formatDateTime(p.capturedAt));
  else if (p.modified) metaParts.push(formatDate(p.modified));
  if (p.usageCount) metaParts.push(p.usageCount + "×");
  if (metaParts.length) h += `<div class="detail-meta">${metaParts.map(m => esc(m)).join(' · ')}</div>`;
  h += `</div>`;

  // Tags
  if (p.tags?.length) {
    h += `<div class="detail-tags">${p.tags.map(t => `<span class="card-tag ${TAG_CLASS}">${esc(t)}</span>`).join('')}</div>`;
  }

  // Source info (clips)
  if (p.sourceUrl || p.sourceTitle) {
    h += `<div class="detail-source">${p.sourceUrl ? favicon(p.sourceUrl, 14) : ''} ${esc(p.sourceTitle || domain(p.sourceUrl || ''))}${p.sourceUrl ? ` · <a href="${esc(p.sourceUrl)}" target="_blank" style="color:${ACCENT}">${esc(domain(p.sourceUrl))}</a>` : ''}</div>`;
  }

  // Skill package info
  if (isSkills) {
    const summary = skillFileSummary(p);
    const fname = (p.title || "skill").replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
    const desc = p.description || parseSkillYaml(p.content).description || "";
    h += `<div class="detail-skill-info">`;
    h += `<div class="sk-fname">${esc(fname)}/ · ${summary.fileCount} files · ${summary.totalKB}KB</div>`;
    if (desc) h += `<div class="sk-desc" style="margin-top:4px">${esc(desc)}</div>`;
    const dirPills = Object.entries(summary.dirs).map(([d, ct]) => `<span class="sk-dp">${esc(d === "(root)" ? "" : d + "/")}${ct}</span>`).join("");
    if (dirPills) h += `<div class="sk-dirs" style="margin-top:4px">${dirPills}</div>`;
    h += `</div>`;

    // Show file tabs for multi-file skills
    if (p.files && Object.keys(p.files).length) {
      h += `<div class="detail-files">`;
      h += `<div class="detail-file-tabs"><button class="detail-file-tab active" data-sf="SKILL.md">📄 SKILL.md</button>`;
      Object.keys(p.files).sort().forEach(path => {
        const icon = path.endsWith('.py') ? '🐍' : path.endsWith('.html') ? '🌐' : '📄';
        h += `<button class="detail-file-tab" data-sf="${esc(path)}">${icon} ${esc(path)}</button>`;
      });
      h += `</div>`;
      h += `<div class="detail-file-content" id="detailFileContent"><pre class="detail-body">${esc(p.content || '')}</pre></div>`;
      h += `</div>`;
    } else {
      h += `<pre class="detail-body">${esc(p.content || '')}</pre>`;
    }
  } else {
    // Standard content display (notes: rendered markdown; clips: plain)
    if (p.content) {
      if (isNotes) h += `<div class="detail-body note-rendered">${renderNoteContent(p.content)}</div>`;
      else h += `<pre class="detail-body">${esc(p.content)}</pre>`;
    }
  }

  // URL for bookmarks
  if (p.url) {
    h += `<div class="detail-url"><a href="${esc(p.url)}" target="_blank" style="color:${ACCENT};font-size:11px">${esc(p.url)}</a></div>`;
  }

  h += `</div>`;
  c.innerHTML = h;

  // Wire back button
  document.getElementById("detailBack").addEventListener("click", () => { viewingId = null; renderContent(); });

  // Wire copy
  document.getElementById("detailCopy")?.addEventListener("click", () => {
    navigator.clipboard.writeText(p.content || "");
  });

  // Wire deploy (skills)
  document.getElementById("detailDeploy")?.addEventListener("click", () => {
    const hasFiles = p.files && Object.keys(p.files).length > 0;
    const fname = (p.title || "skill").replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
    if (hasFiles) {
      const enc = new TextEncoder();
      const files = [{ name: fname + "/SKILL.md", data: enc.encode(p.content || "") }];
      if (p.files) Object.entries(p.files).forEach(([path, content]) => {
        files.push({ name: fname + "/" + path, data: enc.encode(content || "") });
      });
      buildStoreZip(files).then(zip => {
        const blob = new Blob([zip], { type: "application/zip" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = fname + ".skill"; a.click(); URL.revokeObjectURL(url);
      });
    } else {
      const blob = new Blob([p.content || ""], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = fname + ".md"; a.click(); URL.revokeObjectURL(url);
    }
    const folder = findFolder(D.folders, p.folderId || sel);
    if (folder) { const pr = folder.prompts?.find(x => x.id === p.id); if (pr) { pr.usageCount = (pr.usageCount || 0) + 1; pr.lastDeployed = Date.now(); saveD(); } }
  });

  // Wire file tabs (skills)
  c.querySelectorAll(".detail-file-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      c.querySelectorAll(".detail-file-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const sf = tab.dataset.sf;
      const content = sf === "SKILL.md" ? (p.content || "") : (p.files?.[sf] || "");
      document.getElementById("detailFileContent").innerHTML = `<pre class="detail-body">${esc(content)}</pre>`;
    });
  });
}

function renderStats() {
  const all = allItems(D.folders);
  const folders = []; (function countF(n) { for (const c of (n.children || [])) { folders.push(c); countF(c); } })(D.folders);
  const totalTok = all.reduce((s, p) => s + tok(p.content), 0);
  const totalWords = all.reduce((s, p) => s + wc(p.content), 0);
  if (isSkills) {
    const totalFiles = all.reduce((s, p) => s + 1 + (p.files ? Object.keys(p.files).length : 0), 0);
    document.getElementById("stats").innerHTML = `<span>📁 ${folders.length} folders</span><span>🛠 ${all.length} skills</span><span>📄 ${totalFiles} files</span><span>~${totalTok.toLocaleString()} tokens</span>`;
  } else if (isNotes) {
    document.getElementById("stats").innerHTML = `<span>📁 ${folders.length} folders</span><span>📝 ${all.length} notes</span><span>${totalWords.toLocaleString()} words</span><span>~${totalTok.toLocaleString()} tokens</span>`;
  } else {
    const plats = new Set(all.map(p => p.platform).filter(Boolean));
    document.getElementById("stats").innerHTML = `<span>📁 ${folders.length} folders</span><span>📋 ${all.length} clips</span><span>🏷 ${plats.size} platforms</span><span>~${totalTok.toLocaleString()} tokens</span>`;
  }
  document.getElementById("subtitle").textContent = `${all.length} ${LABEL.toLowerCase()} · ${folders.length} folders`;
}

// ── Simple STORE-method zip builder (for skill deploy in fullview) ──
function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) { crc ^= data[i]; for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0); }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
async function buildStoreZip(files) {
  const enc = new TextEncoder(); let offset = 0; const locals = [], centrals = [];
  for (const f of files) {
    const nameBytes = enc.encode(f.name); const crc = crc32(f.data);
    const lh = new Uint8Array(30 + nameBytes.length + f.data.length); const lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(8, 0, true);
    lv.setUint32(14, crc, true); lv.setUint32(18, f.data.length, true); lv.setUint32(22, f.data.length, true);
    lv.setUint16(26, nameBytes.length, true); lh.set(nameBytes, 30); lh.set(f.data, 30 + nameBytes.length);
    locals.push(lh);
    const cd = new Uint8Array(46 + nameBytes.length); const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, f.data.length, true); cv.setUint32(24, f.data.length, true);
    cv.setUint16(28, nameBytes.length, true); cv.setUint32(42, offset, true); cd.set(nameBytes, 46);
    centrals.push(cd); offset += lh.length;
  }
  const cdOffset = offset; let cdSize = 0; centrals.forEach(c => cdSize += c.length);
  const eocd = new Uint8Array(22); const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true); ev.setUint32(16, cdOffset, true);
  const total = offset + cdSize + 22; const out = new Uint8Array(total); let pos = 0;
  locals.forEach(l => { out.set(l, pos); pos += l.length }); centrals.forEach(c => { out.set(c, pos); pos += c.length }); out.set(eocd, pos);
  return out;
}

chrome.storage.local.get([STORE_KEY, CK], res => {
  D = res[STORE_KEY];
  cfg = res[CK] || {};
  if (!D?.folders) { document.getElementById("content").innerHTML = `<div class="empty">No ${LABEL.toLowerCase()} found. Create some in the side panel first.</div>`; return; }
  (D.folders.children || []).forEach(c => { exp[c.id] = 1; });
  renderTree(); renderContent(); renderStats();
  if(typeof PVViewState!=="undefined"){PVViewState.load(function(vs){_vsApply(vs);_vsReady=true})}else{_vsReady=true}
  document.getElementById("searchBox").addEventListener("input", e => { searchQ = e.target.value.trim(); viewingId = null; renderContent(); });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (!changes[STORE_KEY] && !changes[CK]) return;
    chrome.storage.local.get([STORE_KEY, CK], res => {
      const nextD = res[STORE_KEY], nextCfg = res[CK] || {};
      if (!nextD?.folders) return;
      D = nextD; cfg = nextCfg;
      if (!findFolder(D.folders, sel)) sel = ROOT_ID;
      if (viewingId && !findInTree(D.folders, viewingId)) viewingId = null;
      renderTree(); renderContent(); renderStats();
    });
  });
});

// ---- VIEW STATE SYNC (mirror side panel + other windows) ----
var _vsSilo=(tabMode==="clips")?"snippets":tabMode;
var _vsReady=false;
function _vsApply(vs){
  var s=vs&&vs[_vsSilo]; if(!s)return;
  if(typeof D==="undefined"||!D)return;
  if(s.exp&&typeof s.exp==="object")exp=JSON.parse(JSON.stringify(s.exp));
  if(s.sel!==undefined)sel=s.sel;
  if(s.q!==undefined){searchQ=s.q;var _sb=document.getElementById("searchBox");if(_sb&&_sb.value!==s.q)_sb.value=s.q;}
  try{renderTree();renderContent();}catch(e){}
}
function _persistVS(){
  if(!_vsReady||typeof PVViewState==="undefined")return;
  PVViewState.patch(_vsSilo,{exp:exp,sel:sel,q:searchQ});
}
if(typeof renderContent==="function"){var _vsOrigRC=renderContent;renderContent=function(){var _r=_vsOrigRC.apply(this,arguments);try{_persistVS()}catch(e){}return _r;};}
if(typeof PVViewState!=="undefined"){PVViewState.subscribe(function(vs){_vsApply(vs);});}
