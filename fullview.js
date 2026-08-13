const MAX_D=5,TR_D=30;
const params=new URLSearchParams(window.location.search);
const STORE_MODE=params.get("store")==="customgpts"?"customgpts":"bookmarks";
const BK=STORE_MODE==="customgpts"?"pv_g":"pv_b";
const ROOT_ID=STORE_MODE==="customgpts"?"groot":"broot";
const STORE_LABEL=STORE_MODE==="customgpts"?"Custom GPTs":"Bookmarks";
const ITEM_LABEL=STORE_MODE==="customgpts"?"custom GPTs":"bookmarks";
const ITEM_LABEL_ONE=STORE_MODE==="customgpts"?"custom GPT":"bookmark";
// Health check is a bookmarks concern — hide it in the Custom GPTs view.
if(STORE_MODE==="customgpts")addEventListener("DOMContentLoaded",()=>{const b=document.getElementById("tbHealth");if(b)b.style.display="none"});
let BM=null,sel=ROOT_ID,exp={[ROOT_ID]:1};
let viewMode="cards",searchQ="",tblSort="modified",tblDir=-1;
let bulkMode=false,bulkSel=new Set();
let previewOn=false,specialView="";
let locked=false; // Lock: when true, opened tabs don't steal focus // ""=normal, "health"=broken links, "dupes"=duplicates
let healthResults={},healthScanned=false,healthScanning=false;
let dupeGroups=[];

// ═══════ Tab-specific accent color ═══════
if(STORE_MODE==="customgpts"){
  document.documentElement.style.setProperty('--ac','#43b38b');
  document.documentElement.style.setProperty('--ad','rgba(67,179,139,.12)');
  document.documentElement.style.setProperty('--ab','rgba(67,179,139,.25)');
}else{
  // Bookmarks — slate
  document.documentElement.style.setProperty('--ac','#8a8f99');
  document.documentElement.style.setProperty('--ad','rgba(138,143,153,.10)');
  document.documentElement.style.setProperty('--ab','rgba(138,143,153,.22)');
}

// ═══════ Utilities ═══════
// findFolder, fp, ci, allItems, af, deepClone, domain, favicon, esc, formatDate, $ → fullview-shared.js
function gd(n,r){let d=0,c=n;while(c&&c.id!==r.id){const p=fp(r,c.id);if(!p)break;d++;c=p}return d}
function generateId(){const id=`i_${BM.nextId}`;BM.nextId++;return id}
function normUrl(u){try{return new URL(u).href.replace(/\/$/,"").replace(/^https?:\/\/(www\.)?/,"")}catch{return u}}
function folderColor(fid){const f=findFolder(BM.folders,fid);return f?.color||""}
const SAFE_PANEL_MODES=new Set(["favicon","capsule","link"]);
const SAFE_HEX_COLOR_RE=/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
function safeUiColor(v){if(typeof v!=="string")return "";const c=v.trim();return SAFE_HEX_COLOR_RE.test(c)?c:""}
function walkTree(node,fn){if(!node||typeof node!=="object")return;fn(node);(node.children||[]).forEach(ch=>walkTree(ch,fn))}
function bookmarkIdSet(){const ids=new Set();if(!BM?.folders)return ids;walkTree(BM.folders,node=>(node.prompts||[]).forEach(p=>{if(typeof p?.id==="string")ids.add(p.id)}));return ids}
function normalizePanels(){
  if(!BM)return false;
  let changed=false;
  if(!Array.isArray(BM.sectionPanels)){BM.sectionPanels=[];return true}
  walkTree(BM.folders,node=>{const safe=safeUiColor(node.color||"");if((node.color||"")!==safe){node.color=safe;changed=true}});
  const validIds=bookmarkIdSet();
  BM.sectionPanels=BM.sectionPanels.filter(panel=>panel&&typeof panel==="object").map((panel,pi)=>{
    const next={...panel};
    if(typeof next.id!=="string"){next.id="sp_"+Date.now()+"_"+pi;changed=true}
    if(typeof next.name!=="string"){next.name="Section Panel";changed=true}
    if(!SAFE_PANEL_MODES.has(next.mode)){next.mode="capsule";changed=true}
    if(!Array.isArray(next.clusters)){next.clusters=[];changed=true}
    next.clusters=next.clusters.filter(cl=>cl&&typeof cl==="object").map((cluster,ci)=>{
      const cl2={...cluster};
      if(typeof cl2.id!=="string"){cl2.id="cl_"+Date.now()+"_"+pi+"_"+ci;changed=true}
      if(typeof cl2.label!=="string"){cl2.label="";changed=true}
      const safeColor=safeUiColor(cl2.color||"");
      if((cl2.color||"")!==safeColor){cl2.color=safeColor;changed=true}
      if(!Array.isArray(cl2.items)){cl2.items=[];changed=true}
      const seen=new Set();
      cl2.items=cl2.items.filter(item=>item&&typeof item==="object"&&typeof item.id==="string"&&validIds.has(item.id)).map(item=>{
        const safeItemColor=safeUiColor(item.color||"");
        const nextItem={id:item.id,color:safeItemColor||null};
        if((item.color||null)!==nextItem.color)changed=true;
        if(seen.has(nextItem.id)){changed=true;return null}
        seen.add(nextItem.id);
        return nextItem;
      }).filter(Boolean);
      return cl2;
    });
    return next;
  });
  return changed;
}

// ═══════ Save + Sync ═══════
function save(){
  normalizePanels();
  fvBumpMeta();
  chrome.storage.local.set({[BK]:BM});
  try{chrome.runtime.sendMessage({type:"DATA_CHANGED"})}catch{}
  try{chrome.runtime.sendMessage({type:"REBUILD_MENUS"})}catch{}
  renderStats();
}
function toTrash(type,id,name,content){
  BM.trash=BM.trash||[];
  BM.trash.push({type,id,name,content:deepClone(content),deletedAt:Date.now(),from:sel});
  if(BM.trash.length>100)BM.trash=BM.trash.slice(-100);
}

// ═══════ Toast ═══════
let toastTmr=null;
function flash(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTmr);toastTmr=setTimeout(()=>t.classList.remove("show"),1800)}

// ═══════ Context Menu ═══════
function closeCtx(){document.querySelectorAll(".ctx").forEach(c=>c.remove())}
function ctx(e,items){
  e.preventDefault();e.stopPropagation();closeCtx();
  const m=document.createElement("div");m.className="ctx";
  items.forEach(item=>{
    if(item.sep){m.appendChild(Object.assign(document.createElement("div"),{className:"ctx-sep"}));return}
    const el=document.createElement("div");
    el.className="ctx-item"+(item.cls?" "+item.cls:"");
    el.innerHTML=(item.ico||"")+item.label;
    el.addEventListener("click",()=>{closeCtx();item.fn()});
    m.appendChild(el);
  });
  document.body.appendChild(m);
  let x=e.clientX,y=e.clientY;
  if(x+m.offsetWidth>window.innerWidth)x=window.innerWidth-m.offsetWidth-4;
  if(y+m.offsetHeight>window.innerHeight)y=window.innerHeight-m.offsetHeight-4;
  m.style.left=x+"px";m.style.top=y+"px";
  setTimeout(()=>document.addEventListener("click",function h(){closeCtx();document.removeEventListener("click",h)},{once:true}),10);
}

// ═══════ Modal ═══════
function closeModal(){document.querySelectorAll(".modal-bg").forEach(m=>m.remove())}
function showModal(html,onReady){
  closeModal();
  const bg=document.createElement("div");bg.className="modal-bg";
  bg.innerHTML=`<div class="modal">${html}</div>`;
  bg.addEventListener("click",e=>{if(e.target===bg)closeModal()});
  document.body.appendChild(bg);
  if(onReady)onReady(bg.querySelector(".modal"));
}

// ═══════ SVG Icons ═══════
const I={
  open:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  copy:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  trash:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  edit:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  plus:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  move:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>',
  folder:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
};

// ═══════ Folder Operations ═══════
function addFolder(){
  const f=findFolder(BM.folders,sel);if(!f||gd(f,BM.folders)>=MAX_D-1){flash("Max depth");return}
  const id=generateId();f.children=f.children||[];
  f.children.push({id,name:"New Folder",children:[],prompts:[],color:""});
  exp[sel]=1;save();renderTree();renderContent();renameFolderModal(id,"New Folder");
}
function renameFolderModal(fid,name){
  showModal(`<h3>Rename Folder</h3><input type="text" id="rnI" value="${esc(name)}"><div class="btn-row"><button class="mbtn" id="rnX">Cancel</button><button class="mbtn primary" id="rnOK">Save</button></div>`,m=>{
    const inp=m.querySelector("#rnI");inp.focus();inp.select();
    const go=()=>{const v=inp.value.trim();if(v){const f=findFolder(BM.folders,fid);if(f){f.name=v;save();renderTree();renderContent()}}closeModal()};
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")go();if(e.key==="Escape")closeModal()});
    m.querySelector("#rnX").addEventListener("click",closeModal);m.querySelector("#rnOK").addEventListener("click",go);
  });
}
function deleteFolderModal(fid,name){
  if(fid==="broot")return;
  showModal(`<h3>Delete Folder?</h3><p>"${esc(name)}" → Trash (${TR_D}d).</p><div class="btn-row"><button class="mbtn" id="dlX">Cancel</button><button class="mbtn dng" id="dlOK">Delete</button></div>`,m=>{
    m.querySelector("#dlX").addEventListener("click",closeModal);
    m.querySelector("#dlOK").addEventListener("click",()=>{
      const parent=fp(BM.folders,fid),folder=findFolder(BM.folders,fid);
      if(parent&&folder){toTrash("folder",fid,folder.name,folder);parent.children=parent.children.filter(x=>x.id!==fid);if(sel===fid)sel=parent.id;save();renderTree();renderContent();flash("Deleted")}
      closeModal();
    });
  });
}
function deleteBookmarkModal(pid,title,folderId){
  showModal(`<h3>Delete ${STORE_MODE==="customgpts"?"Custom GPT":"Bookmark"}?</h3><p>"${esc(title)}" → Trash.</p><div class="btn-row"><button class="mbtn" id="dlX">Cancel</button><button class="mbtn dng" id="dlOK">Delete</button></div>`,m=>{
    m.querySelector("#dlX").addEventListener("click",closeModal);
    m.querySelector("#dlOK").addEventListener("click",()=>{
      fvPushUndo(BK, BM);
      const fold=findFolder(BM.folders,folderId);
      if(fold){const p=fold.prompts.find(x=>x.id===pid);if(p){toTrash("prompt",pid,p.title,p);fold.prompts=fold.prompts.filter(x=>x.id!==pid)}save();renderContent();flash("Deleted")}
      closeModal();
    });
  });
}
function moveBookmarkModal(pid,curFid){
  const flds=af(BM.folders);
  showModal(`<h3>Move to</h3><div class="fp">${flds.filter(f=>f.id!==curFid).map(f=>`<div class="fpi" data-id="${f.id}" style="padding-left:${6+f.depth*12}px">${I.folder} ${esc(f.name)}</div>`).join("")}</div><div class="btn-row"><button class="mbtn" id="mvX">Cancel</button></div>`,m=>{
    m.querySelector("#mvX").addEventListener("click",closeModal);
    m.querySelectorAll(".fpi").forEach(el=>el.addEventListener("click",()=>{
      fvPushUndo(BK, BM);
      const src=findFolder(BM.folders,curFid),tgt=findFolder(BM.folders,el.dataset.id);
      if(src&&tgt){const i=src.prompts.findIndex(x=>x.id===pid);if(i>=0){const[p]=src.prompts.splice(i,1);tgt.prompts=tgt.prompts||[];tgt.prompts.push(p);save();renderTree();renderContent();flash("Moved")}}
      closeModal();
    }));
  });
}

// ═══════ Bulk Operations ═══════
function toggleBulk(){
  bulkMode=!bulkMode;bulkSel.clear();
  $("tbBulk").classList.toggle("on",bulkMode);
  $("bulkBar").style.display=bulkMode?"flex":"none";
  $("content").classList.toggle("bulk-on",bulkMode);
  updateBulkCt();renderContent();
}
function updateBulkCt(){$("bulkCt").textContent=`${bulkSel.size} selected`}
function toggleSel(pid){if(bulkSel.has(pid))bulkSel.delete(pid);else bulkSel.add(pid);updateBulkCt();renderContent()}

function bulkTagModal(){
  if(!bulkSel.size)return;
  showModal(`<h3>Tag ${bulkSel.size} ${STORE_MODE==="customgpts"?"Custom GPT":"Bookmark"}${bulkSel.size>1?"s":""}</h3><p class="tag-hint">Comma-separated. Added to existing tags.</p><input type="text" id="btI" placeholder="tag1, tag2, ..."><div class="btn-row"><button class="mbtn" id="btX">Cancel</button><button class="mbtn primary" id="btOK">Apply</button></div>`,m=>{
    const inp=m.querySelector("#btI");inp.focus();
    const go=()=>{
      const tags=inp.value.split(",").map(t=>t.trim().toLowerCase()).filter(Boolean);
      if(!tags.length){closeModal();return}
      const all=allItems(BM.folders);
      for(const pid of bulkSel){
        const item=all.find(x=>x.id===pid);
        if(item){
          // Find the actual prompt in the tree and update it
          const fold=findFolder(BM.folders,item.folderId);
          if(fold){const p=fold.prompts.find(x=>x.id===pid);if(p){p.tags=p.tags||[];tags.forEach(t=>{if(!p.tags.includes(t))p.tags.push(t)})}}
        }
      }
      save();flash(`Tagged ${bulkSel.size} items`);bulkSel.clear();updateBulkCt();renderContent();closeModal();
    };
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")go()});
    m.querySelector("#btX").addEventListener("click",closeModal);m.querySelector("#btOK").addEventListener("click",go);
  });
}
function bulkMoveModal(){
  if(!bulkSel.size)return;
  const flds=af(BM.folders);
  showModal(`<h3>Move ${bulkSel.size} items</h3><div class="fp">${flds.map(f=>`<div class="fpi" data-id="${f.id}" style="padding-left:${6+f.depth*12}px">${I.folder} ${esc(f.name)}</div>`).join("")}</div><div class="btn-row"><button class="mbtn" id="bmX">Cancel</button></div>`,m=>{
    m.querySelector("#bmX").addEventListener("click",closeModal);
    m.querySelectorAll(".fpi").forEach(el=>el.addEventListener("click",()=>{
      const tgt=findFolder(BM.folders,el.dataset.id);if(!tgt)return;
      const all=allItems(BM.folders);
      for(const pid of bulkSel){
        const item=all.find(x=>x.id===pid);
        if(item){const src=findFolder(BM.folders,item.folderId);if(src&&src.id!==el.dataset.id){const i=src.prompts.findIndex(x=>x.id===pid);if(i>=0){const[p]=src.prompts.splice(i,1);tgt.prompts=tgt.prompts||[];tgt.prompts.push(p)}}}
      }
      save();flash(`Moved ${bulkSel.size} items`);bulkSel.clear();updateBulkCt();renderTree();renderContent();closeModal();
    }));
  });
}
function bulkDelete(){
  if(!bulkSel.size)return;
  showModal(`<h3>Delete ${bulkSel.size} ${ITEM_LABEL}?</h3><p>All selected → Trash.</p><div class="btn-row"><button class="mbtn" id="bdX">Cancel</button><button class="mbtn dng" id="bdOK">Delete</button></div>`,m=>{
    m.querySelector("#bdX").addEventListener("click",closeModal);
    m.querySelector("#bdOK").addEventListener("click",()=>{
      const all=allItems(BM.folders);
      for(const pid of bulkSel){
        const item=all.find(x=>x.id===pid);
        if(item){const fold=findFolder(BM.folders,item.folderId);if(fold){const p=fold.prompts.find(x=>x.id===pid);if(p){toTrash("prompt",pid,p.title,p);fold.prompts=fold.prompts.filter(x=>x.id!==pid)}}}
      }
      save();flash(`Deleted ${bulkSel.size}`);bulkSel.clear();updateBulkCt();renderTree();renderContent();closeModal();
    });
  });
}

// ═══════ Health Check — Resilient Scanner ═══════
let _hcAbort=false;
function runHealthCheck(){
  if(healthScanning)return;
  const all=allItems(BM.folders).filter(p=>p.url);
  if(!all.length){flash(`No ${ITEM_LABEL} to check`);return}
  healthScanning=true;_hcAbort=false;healthResults={};
  const urls=[...new Set(all.map(p=>p.url))];
  const total=urls.length;
  const chunks=[];for(let i=0;i<urls.length;i+=20)chunks.push(urls.slice(i,i+20));
  let ci2=0;
  updateHealthUI();
  function nextChunk(){
    if(_hcAbort||ci2>=chunks.length){
      healthScanning=false;healthScanned=!_hcAbort;
      if(!_hcAbort){const broken=Object.values(healthResults).filter(r=>!r.ok);flash(`Scan done: ${broken.length} broken of ${total}`)}
      updateHealthUI();if(specialView==="health")renderContent();return;
    }
    chrome.runtime.sendMessage({type:"CHECK_URLS",urls:chunks[ci2]},res=>{
      if(_hcAbort){healthScanning=false;updateHealthUI();return}
      if(res)Object.assign(healthResults,res);ci2++;
      updateHealthUI();nextChunk();
    });
  }
  nextChunk();
}
function stopHealthCheck(){_hcAbort=true;healthScanning=false;updateHealthUI();flash("Scan stopped")}
function updateHealthUI(){
  const btn=$("tbHealth");if(!btn)return;
  if(healthScanning){
    const all=allItems(BM.folders).filter(p=>p.url);
    const total=[...new Set(all.map(p=>p.url))].length;
    const done=Object.keys(healthResults).length;
    const pct=total?Math.round(done/total*100):0;
    btn.innerHTML=`🩺 <span class="hc-prog"><span class="hc-prog-fill" style="width:${pct}%"></span></span> ${pct}% <span class="hc-stop" id="hcStop">✕</span>`;
    btn.classList.add("scanning");
    $("hcStop")?.addEventListener("click",e=>{e.stopPropagation();stopHealthCheck()});
  } else if(healthScanned){
    const broken=Object.values(healthResults).filter(r=>!r.ok);
    btn.classList.remove("scanning");
    btn.innerHTML=`🩺 Health <span class="badge ${broken.length?'':'badge-gn'}">${broken.length||'✓'}</span>`;
  } else {
    btn.classList.remove("scanning");btn.innerHTML=`🩺 Health Check`;
  }
}

// ═══════ Duplicate Finder ═══════
function findDupes(){
  const all=allItems(BM.folders);
  const map={};
  all.forEach(p=>{if(!p.url)return;const k=normUrl(p.url);if(!map[k])map[k]=[];map[k].push(p)});
  dupeGroups=Object.entries(map).filter(([,v])=>v.length>1).sort((a,b)=>b[1].length-a[1].length);
  const badge=$("dupeBadge");
  if(dupeGroups.length){badge.style.display="inline";badge.textContent=dupeGroups.length}
  else{badge.style.display="inline";badge.textContent="0";badge.className="badge badge-gn"}
}

// ═══════ Preview ═══════
function showPreview(url,title){
  if(!previewOn)return;
  const pane=$("previewPane");pane.classList.add("open");
  $("pvTitle").textContent=title||url;
  $("pvFrame").style.display="block";$("pvBlocked").style.display="none";
  $("pvFrame").src=url;
  // Detect load failure after timeout
  $("pvFrame").onerror=()=>{$("pvFrame").style.display="none";$("pvBlocked").style.display="flex"};
}
function closePreview(){$("previewPane").classList.remove("open");$("pvFrame").src="about:blank"}

// ═══════ Tree ═══════
function renderTree(){
  const panel=$("treePanel");let h='';
  function walk(n,depth){
    const isSel=sel===n.id,isExp=exp[n.id],hasKids=(n.children||[]).length>0,count=ci(n).prompts;
    const col=n.color||"",colStyle=col?`color:${col}`:'color:var(--dm)';
    h+=`<div class="tn ${isSel?'sel':''}" data-id="${n.id}" style="padding-left:${8+depth*16}px">`;
    h+=`<span class="ch" style="transform:rotate(${isExp&&hasKids?90:0}deg);opacity:${hasKids?1:.2}"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"/></svg></span>`;
    h+=`<span class="fi" style="${colStyle}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${isExp?'M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v1M5 19h14a2 2 0 0 0 2-2l-2-7H5l-2 7a2 2 0 0 0 2 2z':'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'}"/></svg></span>`;
    h+=`<span class="nm">${esc(n.name)}</span>`;if(count)h+=`<span class="ct">${count}</span>`;h+=`</div>`;
    if(isExp&&hasKids)for(const c of n.children)walk(c,depth+1);
  }
  walk(BM.folders,0);panel.innerHTML=h;
  panel.querySelectorAll(".tn").forEach(el=>{
    const id=el.dataset.id;
    el.addEventListener("click",()=>{sel=id;specialView="";const n=findFolder(BM.folders,id);if(n&&(n.children||[]).length)exp[id]=!exp[id];renderTree();renderContent();renderTreeActs()});
    el.addEventListener("contextmenu",e=>{
      const f=findFolder(BM.folders,id);if(!f)return;
      const items=[{label:" New Subfolder",ico:I.plus,fn:()=>{sel=id;exp[id]=1;addFolder()}},{label:" Rename",ico:I.edit,fn:()=>renameFolderModal(id,f.name)}];
      if(id!=="broot")items.push({sep:1},{label:" Delete",ico:I.trash,cls:"dng",fn:()=>deleteFolderModal(id,f.name)});
      ctx(e,items);
    });
    el.draggable=true;
    el.addEventListener("dragstart",e=>{e.dataTransfer.setData("fid",id)});
    el.addEventListener("dragover",e=>{e.preventDefault();el.classList.add("drop-over")});
    el.addEventListener("dragleave",()=>el.classList.remove("drop-over"));
    el.addEventListener("drop",e=>{
      e.preventDefault();el.classList.remove("drop-over");
      const srcFid=e.dataTransfer.getData("fid"),srcPid=e.dataTransfer.getData("pid"),srcPfid=e.dataTransfer.getData("pfid");
      if(srcFid&&srcFid!==id){const sp=fp(BM.folders,srcFid),sn=findFolder(BM.folders,srcFid),tg=findFolder(BM.folders,id);if(sp&&sn&&tg&&!findFolder(sn,id)){sp.children=sp.children.filter(x=>x.id!==srcFid);tg.children=tg.children||[];tg.children.push(sn);exp[id]=1;save();renderTree();renderContent();flash("Folder moved")}}
      else if(srcPid&&srcPfid){const sf=findFolder(BM.folders,srcPfid),tf=findFolder(BM.folders,id);if(sf&&tf&&srcPfid!==id){const i=sf.prompts.findIndex(x=>x.id===srcPid);if(i>=0){const[p]=sf.prompts.splice(i,1);tf.prompts=tf.prompts||[];tf.prompts.push(p);save();renderTree();renderContent();flash("Moved")}}}
    });
  });
  renderTreeActs();
}
function renderTreeActs(){
  const acts=$("treeActs"),f=findFolder(BM.folders,sel);
  let h=`<button class="ta-btn" id="taAdd">${I.plus} Folder</button>`;
  if(sel!=="broot")h+=`<button class="ta-btn" id="taRn">${I.edit}</button><button class="ta-btn dng" id="taDel">${I.trash}</button>`;
  acts.innerHTML=h;
  $("taAdd")?.addEventListener("click",addFolder);
  $("taRn")?.addEventListener("click",()=>{if(f)renameFolderModal(sel,f.name)});
  $("taDel")?.addEventListener("click",()=>{if(f)deleteFolderModal(sel,f.name)});
}

// ═══════ Items + Sort ═══════
function getItems(){
  const f=findFolder(BM.folders,sel);if(!f)return[];
  const isRoot=sel===ROOT_ID;
  let items=isRoot?allItems(BM.folders):[...(f.prompts||[])].map(p=>({...p,folderName:f.name,folderId:f.id}));
  if(searchQ){const q=searchQ.toLowerCase();items=allItems(BM.folders).filter(p=>p.title.toLowerCase().includes(q)||domain(p.url||"").toLowerCase().includes(q)||(p.content||"").toLowerCase().includes(q)||(p.tags||[]).some(t=>t.toLowerCase().includes(q))||(p.folderName||"").toLowerCase().includes(q))}
  return items;
}
function sortItems(items){
  // Preserve array order when not searching — allows drag-reorder to persist (all views including table)
  if(!searchQ)return items;
  if(viewMode==="table"){const dir=tblDir,s=[...items];switch(tblSort){case"title":s.sort((a,b)=>dir*a.title.localeCompare(b.title));break;case"domain":s.sort((a,b)=>dir*domain(a.url||"").localeCompare(domain(b.url||"")));break;case"folder":s.sort((a,b)=>dir*(a.folderName||"").localeCompare(b.folderName||""));break;case"usage":s.sort((a,b)=>dir*((a.usageCount||0)-(b.usageCount||0)));break;default:s.sort((a,b)=>dir*((a.modified||0)-(b.modified||0)));break}return s}
  return[...items].sort((a,b)=>(b.modified||0)-(a.modified||0));
}
function isDead(url){return healthScanned&&healthResults[url]&&!healthResults[url].ok}

// ═══════ Context menu for bookmarks ═══════
function bkCtx(e,p){
  const items=[
    {label:" Open in New Tab",ico:I.open,fn:()=>chrome.tabs.create({url:p.url,active:!locked})},
    {label:" Open in New Window",ico:I.open,fn:()=>chrome.windows.create({url:p.url,type:"normal"})},
    {label:" Copy URL",ico:I.copy,fn:()=>{navigator.clipboard.writeText(p.url||"");flash("Copied")}}
  ];
  if(previewOn)items.push({label:" Preview",ico:"👁 ",fn:()=>showPreview(p.url,p.title)});
  items.push({sep:1});
  items.push({label:" Edit",ico:I.edit,fn:()=>editBookmarkModal(p.id,p.folderId)});
  items.push({label:" Favorite",ico:p.favorited?"★ ":"☆ ",fn:()=>{
    const all=allItems(BM.folders);const item=findInTree(BM.folders,p.id);
    if(item){item.favorited=!item.favorited;item.modified=Date.now();save();renderContent();flash(item.favorited?"Favorited":"Unfavorited")}
  }});
  // Pin to section panel
  if((BM.sectionPanels||[]).length)items.push({label:" Pin to Panel",ico:"📌 ",fn:()=>pinToPanelModal(p.id)});
  items.push({label:" Duplicate",ico:"📄 ",fn:()=>duplicateBookmark(p.id)});
  items.push({label:" Move to…",ico:I.move,fn:()=>moveBookmarkModal(p.id,p.folderId)});
  items.push({sep:1},{label:" Delete",ico:I.trash,cls:"dng",fn:()=>deleteBookmarkModal(p.id,p.title,p.folderId)});
  ctx(e,items);
}
// Find actual item in tree (not a copy)
function findInTree(node,id){
  for(const p of(node.prompts||[]))if(p.id===id)return p;
  for(const c of(node.children||[])){const f=findInTree(c,id);if(f)return f}return null;
}
// Edit bookmark modal
function editBookmarkModal(pid,fid){
  const p=findInTree(BM.folders,pid);if(!p)return;
  showModal(`<h3>Edit ${STORE_MODE==="customgpts"?"Custom GPT":"Bookmark"}</h3>
    <div style="margin-bottom:8px"><label style="font-size:10px;color:var(--dm);display:block;margin-bottom:2px">Title</label><input type="text" id="ebTi" value="${esc(p.title||'')}" style="width:100%;background:var(--inp);border:1px solid var(--bl);border-radius:4px;padding:6px 8px;color:var(--tx);font-size:12px;font-family:inherit"></div>
    <div style="margin-bottom:8px"><label style="font-size:10px;color:var(--dm);display:block;margin-bottom:2px">URL</label><input type="text" id="ebUrl" value="${esc(p.url||'')}" style="width:100%;background:var(--inp);border:1px solid var(--bl);border-radius:4px;padding:6px 8px;color:var(--tx);font-size:11px;font-family:ui-monospace,SFMono-Regular,'SF Mono',Consolas,monospace"></div>
    <div style="margin-bottom:8px"><label style="font-size:10px;color:var(--dm);display:block;margin-bottom:2px">Tags (comma separated)</label><input type="text" id="ebTg" value="${esc((p.tags||[]).join(', '))}" style="width:100%;background:var(--inp);border:1px solid var(--bl);border-radius:4px;padding:6px 8px;color:var(--tx);font-size:12px;font-family:inherit"></div>
    <div style="margin-bottom:8px"><label style="font-size:10px;color:var(--dm);display:block;margin-bottom:2px">Notes</label><textarea id="ebNt" rows="3" style="width:100%;background:var(--inp);border:1px solid var(--bl);border-radius:4px;padding:6px 8px;color:var(--tx);font-size:12px;font-family:inherit;resize:vertical">${esc(p.content||'')}</textarea></div>
    <div class="btn-row"><button class="mbtn" id="ebX">Cancel</button><button class="mbtn primary" id="ebOK">Save</button></div>`,m=>{
    m.querySelector("#ebTi").focus();
    m.querySelector("#ebX").addEventListener("click",closeModal);
    m.querySelector("#ebOK").addEventListener("click",()=>{
      p.title=m.querySelector("#ebTi").value.trim()||p.title;
      p.url=m.querySelector("#ebUrl").value.trim()||p.url;
      p.tags=m.querySelector("#ebTg").value.split(",").map(t=>t.trim().toLowerCase()).filter(Boolean);
      p.content=m.querySelector("#ebNt").value;
      p.modified=Date.now();
      save();closeModal();renderContent();flash("Saved");
    });
  });
}
// Duplicate bookmark
function duplicateBookmark(pid){
  const item=findInTree(BM.folders,pid);if(!item)return;
  const folder=findParentFolder(BM.folders,pid);if(!folder)return;
  const n=JSON.parse(JSON.stringify(item));n.id=generateId();n.title+=" (copy)";n.created=n.modified=Date.now();n.usageCount=0;n.versions=[];
  folder.prompts.push(n);save();renderContent();renderStats();flash("Duplicated");
}
function findParentFolder(node,id){for(const p of(node.prompts||[]))if(p.id===id)return node;for(const c of(node.children||[])){const f=findParentFolder(c,id);if(f)return f}return null}
// Create new bookmark
function createNewBookmark(){
  showModal(`<h3>New ${esc(STORE_MODE==="customgpts"?"Custom GPT":"Bookmark")}</h3><input type="text" id="nbUrl" placeholder="https://..."><div class="btn-row"><button class="mbtn" id="nbX">Cancel</button><button class="mbtn primary" id="nbOK">Create</button></div>`,m=>{
    const inp=m.querySelector("#nbUrl");inp.focus();
    const go=()=>{
      const u=(inp.value||"").trim();
      if(!u){inp.focus();return}
      try{new URL(u)}catch{flash("Invalid URL — include https://");inp.focus();return}
      const folder=findFolder(BM.folders,sel);if(!folder){closeModal();return}
      const id=generateId();const title=domain(u);
      const bm={id,title,content:"",url:u,tags:[],created:Date.now(),modified:Date.now(),favorited:false,usageCount:0,versions:[]};
      folder.prompts=folder.prompts||[];folder.prompts.push(bm);
      save();closeModal();renderContent();renderStats();flash("Created: "+title);
      editBookmarkModal(id,sel);
    };
    m.querySelector("#nbX").addEventListener("click",closeModal);
    m.querySelector("#nbOK").addEventListener("click",go);
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")go()});
  });
}
// Pin to panel modal
function pinToPanelModal(bookmarkId){
  const sp=BM.sectionPanels||[];
  if(!sp.length){flash("No Section Panels");return}
  if(sp.length===1){
    const panel=sp[0];
    if(!panel.clusters||!panel.clusters.length)panel.clusters=[{id:"cl_"+Date.now(),label:"",color:"",items:[]}];
    for(const cl of panel.clusters){if((cl.items||[]).find(x=>x.id===bookmarkId)){flash("Already in "+panel.name);return}}
    panel.clusters[0].items=panel.clusters[0].items||[];
    panel.clusters[0].items.push({id:bookmarkId,color:null});
    save();flash("Pinned to "+panel.name);return;
  }
  let h='<h3>Pin to Section Panel</h3>';
  sp.forEach(panel=>{
    const allI=(panel.clusters||[]).flatMap(c=>c.items||[]);
    const already=allI.find(x=>x.id===bookmarkId);
    const mi=panel.mode==='favicon'?'🔲':panel.mode==='link'?'🔗':'💊';
    h+=`<div class="fpi" data-pinp="${panel.id}" style="padding:6px 8px;cursor:pointer;display:flex;align-items:center;gap:6px${already?' ;opacity:.5':''}"><span>${mi}</span><span style="flex:1">${esc(panel.name)}</span>${already?'<span style="font-size:9px;color:var(--dm)">pinned</span>':''}</div>`;
  });
  h+='<div class="btn-row"><button class="mbtn" id="ppX">Cancel</button></div>';
  showModal(h,m=>{
    m.querySelector("#ppX").addEventListener("click",closeModal);
    m.querySelectorAll("[data-pinp]").forEach(el=>el.addEventListener("click",()=>{
      const panel=sp.find(x=>x.id===el.dataset.pinp);if(!panel)return;
      for(const cl of(panel.clusters||[])){if((cl.items||[]).find(x=>x.id===bookmarkId)){flash("Already pinned");closeModal();return}}
      if(!panel.clusters||!panel.clusters.length)panel.clusters=[{id:"cl_"+Date.now(),label:"",color:"",items:[]}];
      panel.clusters[0].items=panel.clusters[0].items||[];
      panel.clusters[0].items.push({id:bookmarkId,color:null});
      save();closeModal();flash("Pinned to "+panel.name);
    }));
  });
}

// ═══════ Render Helpers ═══════
function selBox(pid,cls){
  const checked=bulkSel.has(pid);
  return`<div class="${cls} ${checked?'checked':''}" data-sel="${pid}"></div>`;
}
function deadBadge(url){return isDead(url)?'<span class="dead-badge">dead</span>':''}

function renderCards(items,isRoot,f){
  const d=isRoot?items.slice(0,200):items;let h='<div class="cards">';
  d.forEach(p=>{
    const fCol=isRoot?folderColor(p.folderId):(f?.color||""),dead=isDead(p.url);
    h+=`<div class="card ${bulkSel.has(p.id)?'selected':''} ${dead?'dead':''}" data-pid="${p.id}" data-fid="${p.folderId}" style="${fCol?`--bk-stripe:${fCol};--bk-stripe-hi:${fCol}`:''}">`;
    if(bulkMode)h+=selBox(p.id,"card-sel");
    h+=`<div class="card-top"><div class="card-fav-icon">${favicon(p.url,22)}</div><div class="card-info"><div class="card-title"><a data-open="${esc(p.url||'')}">${esc(p.title)}</a>${deadBadge(p.url)}</div><div class="card-domain">${esc(domain(p.url||''))}</div>${isRoot&&p.folderName?`<div class="folder-path">${esc(p.folderName)}</div>`:''}</div>`;
    h+=`<div class="card-acts"><button class="card-btn" data-opentab="${esc(p.url||'')}" title="Open in new tab">${I.open}</button><button class="card-btn" data-openwin="${esc(p.url||'')}" title="Open in new window">⧉</button><button class="card-btn" data-copy="${esc(p.url||'')}" title="Copy URL">${I.copy}</button><button class="card-btn dng" data-del="${p.id}" data-delfid="${p.folderId}" data-deltitle="${esc(p.title)}" title="Delete">${I.trash}</button></div></div>`;
    if(p.content)h+=`<div class="card-notes">${esc(p.content)}</div>`;
    if(p.tags?.length)h+=`<div class="card-tags">${p.tags.map(t=>`<span class="card-tag">${esc(t)}</span>`).join('')}</div>`;
    h+=`<div class="card-meta"><span>${formatDate(p.modified||p.created)}</span>${(p.usageCount||0)>0?`<span>${p.usageCount}×</span>`:''}</div></div>`;
  });
  return h+'</div>';
}
function renderList(items,isRoot){
  const d=isRoot?items.slice(0,500):items;let h='<div class="list-view">';
  d.forEach(p=>{
    const dead=isDead(p.url);
    h+=`<div class="lr ${bulkSel.has(p.id)?'selected':''} ${dead?'dead':''}" data-pid="${p.id}" data-fid="${p.folderId}" draggable="true">`;
    if(bulkMode)h+=selBox(p.id,"lr-sel");
    h+=`<div class="lr-fav">${favicon(p.url,16)}</div><div class="lr-title"><a data-open="${esc(p.url||'')}">${esc(p.title)}</a>${deadBadge(p.url)}</div>`;
    h+=`<div class="lr-domain">${esc(domain(p.url||''))}</div>`;
    if(isRoot||searchQ)h+=`<div class="lr-folder">${esc(p.folderName||'')}</div>`;
    h+=`<div class="lr-date">${formatDate(p.modified||p.created)}</div>`;
    h+=`<div class="lr-acts"><button class="card-btn" data-opentab="${esc(p.url||'')}" title="Open in new tab">${I.open}</button><button class="card-btn" data-openwin="${esc(p.url||'')}" title="Open in new window">⧉</button><button class="card-btn" data-copy="${esc(p.url||'')}" title="Copy URL">${I.copy}</button><button class="card-btn dng" data-del="${p.id}" data-delfid="${p.folderId}" data-deltitle="${esc(p.title)}" title="Delete">${I.trash}</button></div></div>`;
  });
  return h+'</div>';
}
function renderTable(items,isRoot){
  const d=isRoot?items.slice(0,500):items;
  const cols=[{k:"title",l:"Title"},{k:"domain",l:"Domain"},{k:"folder",l:"Folder"},{k:"modified",l:"Date"},{k:"usage",l:"Used"}];
  let h='<div class="tbl-wrap"><table class="tbl"><thead><tr>';
  if(bulkMode)h+='<th class="t-sel"></th>';
  h+='<th class="t-fav"></th>';
  cols.forEach(c=>{const s=tblSort===c.k;h+=`<th class="${s?'sorted':''}" data-col="${c.k}">${c.l}${s?`<span class="arr">${tblDir===-1?'▼':'▲'}</span>`:''}</th>`});
  h+='<th class="t-acts"></th></tr></thead><tbody>';
  d.forEach(p=>{
    const dead=isDead(p.url);
    h+=`<tr class="${bulkSel.has(p.id)?'selected':''} ${dead?'dead':''}" data-pid="${p.id}" data-fid="${p.folderId}">`;
    if(bulkMode)h+=`<td class="t-sel">${selBox(p.id,"lr-sel")}</td>`;
    h+=`<td class="t-fav">${favicon(p.url,16)}</td>`;
    h+=`<td class="t-title"><a data-open="${esc(p.url||'')}">${esc(p.title)}</a>${deadBadge(p.url)}</td>`;
    h+=`<td class="t-domain">${esc(domain(p.url||''))}</td><td class="t-folder">${esc(p.folderName||'')}</td>`;
    h+=`<td class="t-date">${formatDate(p.modified||p.created)}</td><td class="t-usage">${(p.usageCount||0)||''}</td>`;
    h+=`<td class="t-acts"><button class="card-btn" data-opentab="${esc(p.url||'')}" title="Open">${I.open}</button><button class="card-btn" data-openwin="${esc(p.url||'')}" title="New window">⧉</button><button class="card-btn" data-copy="${esc(p.url||'')}" title="Copy">${I.copy}</button><button class="card-btn dng" data-del="${p.id}" data-delfid="${p.folderId}" data-deltitle="${esc(p.title)}" title="Delete">${I.trash}</button></td></tr>`;
  });
  return h+'</tbody></table></div>';
}

// ═══════ Special Views ═══════
function renderHealthView(){
  const broken=allItems(BM.folders).filter(p=>p.url&&isDead(p.url));
  if(!broken.length)return`<div class="empty">All ${ITEM_LABEL} healthy! ✓</div>`;
  let h=`<div class="info-line">${broken.length} broken link${broken.length!==1?'s':''}</div>`;
  h+='<div class="list-view">';
  broken.forEach(p=>{
    const err=healthResults[p.url];
    h+=`<div class="lr dead" data-pid="${p.id}" data-fid="${p.folderId}"><div class="lr-fav">${favicon(p.url,16)}</div><div class="lr-title"><a data-open="${esc(p.url||'')}">${esc(p.title)}</a><span class="dead-badge">${err?.status||'err'}</span></div><div class="lr-domain">${esc(domain(p.url||''))}</div><div class="lr-folder">${esc(p.folderName||'')}</div><div class="lr-acts"><button class="card-btn dng" data-del="${p.id}" data-delfid="${p.folderId}" data-deltitle="${esc(p.title)}">${I.trash}</button></div></div>`;
  });
  return h+'</div>';
}
function renderDupeView(){
  if(!dupeGroups.length)return'<div class="empty">No duplicates found ✓</div>';
  let h=`<div class="info-line">${dupeGroups.length} duplicate group${dupeGroups.length!==1?'s':''}</div>`;
  dupeGroups.forEach(([key,items])=>{
    h+=`<div class="dupe-group"><div class="dupe-group-hdr"><span class="dg-url">${esc(key)}</span><span class="dg-ct">${items.length}×</span></div>`;
    items.forEach(p=>{
      h+=`<div class="dupe-item" data-pid="${p.id}" data-fid="${p.folderId}"><div style="display:flex">${favicon(p.url,14)}</div><span class="di-title">${esc(p.title)}</span><span class="di-folder">📁 ${esc(p.folderName||'')}</span><button class="card-btn dng" data-del="${p.id}" data-delfid="${p.folderId}" data-deltitle="${esc(p.title)}" title="Delete">${I.trash}</button></div>`;
    });
    h+='</div>';
  });
  return h;
}

// ═══════ Main Content Render ═══════
function renderContent(){
  const c=$("content");c.classList.toggle("bulk-on",bulkMode);
  const f=findFolder(BM.folders,sel);
  if(!f){c.innerHTML='<div class="empty">Folder not found</div>';return}
  const isRoot=sel===ROOT_ID;

  // Special views
  if(specialView==="panels"){c.innerHTML=renderPanelsView();wirePanelEvents(c);return}
  if(specialView==="health"&&healthScanned){c.innerHTML=renderHealthView();wireContentEvents(c,[]);return}
  if(specialView==="dupes"){c.innerHTML=renderDupeView();wireContentEvents(c,[]);return}

  const items=sortItems(getItems());
  // Magazine-style folder title for non-root
  let h='';
  if(!isRoot&&!searchQ){
    const crumbs=[];let n2=f;while(n2){crumbs.unshift(n2);n2=fp(BM.folders,n2.id)}
    const pathParts=crumbs.slice(0,-1).map(b=>esc(b.name)).join(' / ');
    const col=f.color||'';
    h+=`<div class="mag-title-wrap">`;
    if(pathParts)h+=`<div class="mag-path">${pathParts}</div>`;
    h+=`<div class="mag-title" ${col?`style="color:${col}"`:''}>${esc(f.name)}</div>`;
    h+=`<div class="mag-meta">${items.length} ${items.length===1?ITEM_LABEL_ONE:ITEM_LABEL}${f.children?.length?` · ${f.children.length} subfolder${f.children.length!==1?'s':''}`:''}</div>`;
    h+=`</div>`;
  } else {
    const crumbs=[];let n=f;while(n){crumbs.unshift(n);n=fp(BM.folders,n.id)}
    h+='<div class="bc">';crumbs.forEach((b,i)=>{if(i)h+='<span style="opacity:.4"> / </span>';h+=`<span class="${i===crumbs.length-1?'cur':''}" data-nav="${b.id}">${esc(b.name)}</span>`});h+='</div>';
  }
  // Subfolders (drop targets for moving items)
  if(!searchQ&&f.children?.length){h+='<div class="sub-chips">';f.children.forEach(ch=>{const col=ch.color||"",cs=col?`color:${col}`:'color:var(--bk)';h+=`<div class="sub-chip" data-nav="${ch.id}" data-drop-fid="${ch.id}"><span style="${cs};display:flex">${I.folder}</span> ${esc(ch.name)} <span class="sub-ct">${ci(ch).prompts}</span></div>`});h+='</div>'}
  // Info
  const limit=viewMode==="cards"?200:500;
  if(searchQ)h+=`<div class="info-line">${items.length} result${items.length!==1?'s':''} for "${esc(searchQ)}"</div>`;
  else if(isRoot&&items.length)h+=`<div class="info-line">${items.length} ${ITEM_LABEL}${items.length>limit?` (showing ${limit})`:''}</div>`;
  // Items
  // + New button
  if(!searchQ)h+=`<div style="margin-bottom:8px"><button class="tb" id="fvNewBk" style="font-size:11px">+ New ${STORE_MODE==="customgpts"?"Custom GPT":"Bookmark"}</button></div>`;
  if(items.length){switch(viewMode){case"list":h+=renderList(items,isRoot);break;case"table":h+=renderTable(items,isRoot);break;default:h+=renderCards(items,isRoot,f);break}}
  else if(!f.children?.length||searchQ)h+=`<div class="empty">${searchQ?'No matches':'Empty folder'}</div>`;
  c.innerHTML=h;wireContentEvents(c,items);
}

function wireContentEvents(c){
  c.querySelectorAll("[data-nav]").forEach(el=>el.addEventListener("click",()=>{sel=el.dataset.nav;exp[sel]=1;specialView="";renderTree();renderContent()}));
  // Click title/link to open in new tab
  c.querySelectorAll("[data-open]").forEach(a=>a.addEventListener("click",e=>{
    e.preventDefault();e.stopPropagation();const url=a.dataset.open;if(!url)return;
    if(previewOn)showPreview(url,a.textContent);
    else chrome.tabs.create({url,active:!locked});
  }));
  // Click card/row body to open URL (not on buttons/links)
  c.querySelectorAll("[data-pid]").forEach(el=>{
    el.addEventListener("click",e=>{
      if(e.target.closest("[data-open],[data-opentab],[data-openwin],[data-copy],[data-del],[data-sel],[data-act],button,.card-btn,.card-sel,.lr-sel,.ab"))return;
      if(bulkMode){toggleSel(el.dataset.pid);return}
      const all=allItems(BM.folders);const p=all.find(x=>x.id===el.dataset.pid);
      if(p?.url){
        if(previewOn)showPreview(p.url,p.title);
        else chrome.tabs.create({url:p.url,active:!locked});
      }
    });
  });
  c.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();navigator.clipboard.writeText(b.dataset.copy);flash("Copied")}));
  c.querySelectorAll("[data-opentab]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();const url=b.dataset.opentab;if(url)chrome.tabs.create({url,active:!locked})}));
  c.querySelectorAll("[data-openwin]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();const url=b.dataset.openwin;if(url)chrome.windows.create({url,type:"normal"})}));
  c.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();deleteBookmarkModal(b.dataset.del,b.dataset.deltitle,b.dataset.delfid)}));
  // Selection checkboxes
  c.querySelectorAll("[data-sel]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();toggleSel(b.dataset.sel)}));
  // Table sort
  if(viewMode==="table")c.querySelectorAll("[data-col]").forEach(th=>th.addEventListener("click",()=>{const col=th.dataset.col;if(tblSort===col)tblDir*=-1;else{tblSort=col;tblDir=col==="title"||col==="domain"||col==="folder"?1:-1}renderContent()}));
  // + New bookmark button
  c.querySelector("#fvNewBk")?.addEventListener("click",()=>createNewBookmark());
  // Sub-chip drop targets (move to folder)
  c.querySelectorAll("[data-drop-fid]").forEach(chip=>{
    chip.addEventListener("dragover",e=>{if(e.dataTransfer.types.includes("pid")){e.preventDefault();chip.classList.add("drop-over")}});
    chip.addEventListener("dragleave",()=>chip.classList.remove("drop-over"));
    chip.addEventListener("drop",e=>{
      chip.classList.remove("drop-over");
      const srcPid=e.dataTransfer.getData("pid"),srcFid=e.dataTransfer.getData("pfid");
      const tgtFid=chip.dataset.dropFid;
      if(!srcPid||srcFid===tgtFid)return;
      e.preventDefault();e.stopPropagation();
      const src=findFolder(BM.folders,srcFid),tgt=findFolder(BM.folders,tgtFid);
      if(src&&tgt){const i=(src.prompts||[]).findIndex(x=>x.id===srcPid);if(i>=0){const[moved]=src.prompts.splice(i,1);tgt.prompts=tgt.prompts||[];tgt.prompts.push(moved);save();renderTree();renderContent();flash("Moved")}}
    });
  });
  // Right-click bookmarks
  c.querySelectorAll("[data-pid]").forEach(el=>{
    el.addEventListener("contextmenu",e=>{
      const pid=el.dataset.pid,fid=el.dataset.fid;
      const all=allItems(BM.folders);const p=all.find(x=>x.id===pid);
      if(p){p.folderId=fid;bkCtx(e,p)}
    });
    if(!el.draggable)el.draggable=true;
    el.addEventListener("dragstart",e=>{e.dataTransfer.setData("pid",el.dataset.pid);e.dataTransfer.setData("pfid",el.dataset.fid);el.classList.add("dragging")});
    el.addEventListener("dragend",()=>{el.classList.remove("dragging");c.querySelectorAll(".drop-above,.drop-below").forEach(x=>x.classList.remove("drop-above","drop-below"))});
    el.addEventListener("dragover",e=>{
      if(!e.dataTransfer.types.includes("pid"))return;
      e.preventDefault();
      const rect=el.getBoundingClientRect();
      const pct=(e.clientY-rect.top)/rect.height;
      el.classList.remove("drop-above","drop-below");
      el.classList.add(pct<0.5?"drop-above":"drop-below");
    });
    el.addEventListener("dragleave",()=>{el.classList.remove("drop-above","drop-below")});
    el.addEventListener("drop",e=>{
      el.classList.remove("drop-above","drop-below");
      const srcPid=e.dataTransfer.getData("pid");const srcFid=e.dataTransfer.getData("pfid");
      const tgtPid=el.dataset.pid;const tgtFid=el.dataset.fid;
      if(!srcPid||srcPid===tgtPid)return;
      e.preventDefault();e.stopPropagation();
      // Reorder within same folder
      if(srcFid===tgtFid){
        const folder=findFolder(BM.folders,tgtFid);if(!folder)return;
        const srcIdx=(folder.prompts||[]).findIndex(x=>x.id===srcPid);
        if(srcIdx<0)return;
        const[moved]=folder.prompts.splice(srcIdx,1);
        let tgtIdx=folder.prompts.findIndex(x=>x.id===tgtPid);
        const rect=el.getBoundingClientRect();
        const pct=(e.clientY-rect.top)/rect.height;
        if(tgtIdx<0)tgtIdx=folder.prompts.length;
        else if(pct>=0.5)tgtIdx++;
        folder.prompts.splice(tgtIdx,0,moved);
        save();renderContent();flash("Reordered");
      }else{
        // Move to different folder (drop on item from another folder)
        const src=findFolder(BM.folders,srcFid),tgt=findFolder(BM.folders,tgtFid);
        if(src&&tgt){const i=(src.prompts||[]).findIndex(x=>x.id===srcPid);if(i>=0){const[moved]=src.prompts.splice(i,1);tgt.prompts=tgt.prompts||[];tgt.prompts.push(moved);save();renderTree();renderContent();flash("Moved")}}
      }
    });
  });
}

// ═══════ Section Panels (Fullview) ═══════
function findItemGlobal(node,id){for(const p of(node.prompts||[]))if(p.id===id)return p;for(const c of(node.children||[])){const f=findItemGlobal(c,id);if(f)return f}return null}
function renderPanelsView(){
  const sp=BM.sectionPanels||[];
  if(!sp.length)return'<div class="empty">No Section Panels yet. Create them in the side panel.</div>';
  let h='<div class="fv-panels">';
  const panelExp=window._fvPanelExp||(window._fvPanelExp={});
  sp.forEach(panel=>{
    const pExp=panelExp[panel.id]!==false;
    const clusters=panel.clusters||[];
    const totalItems=clusters.reduce((s,c)=>(c.items||[]).length+s,0);
    const modeIcon=panel.mode==='favicon'?'🔲':panel.mode==='link'?'🔗':'💊';
    h+=`<div class="fv-panel" data-fvp="${panel.id}"><div class="fv-panel-hdr" data-fvp-tog="${panel.id}"><span class="fv-panel-mode">${modeIcon}</span><span class="fv-panel-name">${esc(panel.name)}</span><span class="fv-panel-ct">${totalItems} items</span><span class="fv-panel-ch">${pExp?'▾':'▸'}</span></div>`;
    if(pExp){
      h+=`<div class="fv-panel-body" data-fvp-body="${panel.id}">`;
      if(!clusters.length){
        h+=`<div class="fv-panel-empty">Drag ${ITEM_LABEL} here or pin from the side panel.</div>`;
      }else{
        const mode=panel.mode||'capsule';
        clusters.forEach(cl=>{
          const hasItems=(cl.items||[]).filter(si=>findItemGlobal(BM.folders,si.id)).length>0;
          const clColor=cl.color||'';
          const clBg=clColor?`background:${clColor}18;border-color:${clColor}40`:'';
          const emptyClass=!hasItems?' fv-cluster-empty':'';
          h+=`<div class="fv-cluster${clColor?' fv-cluster-colored':''}${emptyClass}" data-fvp-cl="${cl.id}" data-fvp-panel="${panel.id}" style="${clBg}">`;
          if(cl.label)h+=`<div class="fv-cl-label" style="${clColor?`color:${clColor}`:'color:var(--dm)'}">${esc(cl.label)}</div>`;
          if(hasItems){
            h+=`<div class="fv-cl-items fv-mode-${mode}">`;
            (cl.items||[]).forEach((si,idx)=>{
              const bm=findItemGlobal(BM.folders,si.id);
              if(!bm)return;
              const itemBg=si.color||clColor||'';
              const bgStyle=itemBg?`background:${itemBg}22`:'';
              if(mode==='favicon'){
                h+=`<div class="fv-fav" draggable="true" style="${bgStyle}" title="${esc(bm.title||domain(bm.url||''))}" data-fvsp-open="${esc(bm.url||'')}" data-fvsp-item="${si.id}" data-fvsp-cl="${cl.id}" data-fvsp-panel="${panel.id}">${favicon(bm.url,24)}</div>`;
              }else if(mode==='link'){
                h+=`<div class="fv-link" draggable="true" data-fvsp-open="${esc(bm.url||'')}" data-fvsp-item="${si.id}" data-fvsp-cl="${cl.id}" data-fvsp-panel="${panel.id}" style="${bgStyle?bgStyle+';border-radius:4px;padding:3px 8px':''}"><span style="display:flex;align-items:center;flex-shrink:0">${favicon(bm.url,16)}</span><span class="fv-link-url">${esc(bm.title||domain(bm.url||''))}</span></div>`;
              }else{
                h+=`<div class="fv-cap" draggable="true" style="${bgStyle}" data-fvsp-open="${esc(bm.url||'')}" data-fvsp-item="${si.id}" data-fvsp-cl="${cl.id}" data-fvsp-panel="${panel.id}">${favicon(bm.url,18)}<span class="fv-cap-label">${esc(bm.title||domain(bm.url||''))}</span></div>`;
              }
            });
            h+=`</div>`;
          }else{
            h+=`<div style="font-size:10px;color:var(--dm);font-style:italic;padding:6px;text-align:center">Empty zone</div>`;
          }
          h+=`</div>`;
        });
      }
      h+=`</div>`;
    }
    h+=`</div>`;
  });
  h+='</div>';
  return h;
}
function wirePanelEvents(c){
  c.querySelectorAll("[data-fvp-tog]").forEach(el=>{el.addEventListener("click",()=>{
    if(!window._fvPanelExp)window._fvPanelExp={};
    const pid=el.dataset.fvpTog;
    window._fvPanelExp[pid]=window._fvPanelExp[pid]===false;
    renderContent();
  })});
  c.querySelectorAll("[data-fvsp-open]").forEach(el=>{el.addEventListener("click",()=>{
    const url=el.dataset.fvspOpen;if(url)chrome.tabs.create({url,active:!locked});
  })});
  c.querySelectorAll("[data-fvsp-item]").forEach(el=>{el.addEventListener("contextmenu",e=>{
    e.preventDefault();
    const url=el.dataset.fvspOpen||'';
    const itemId=el.dataset.fvspItem;
    const clId=el.dataset.fvspCl;
    const panelId=el.dataset.fvspPanel;
    ctx(e,[
      {sep:false,label:`${I.open} Open in New Tab`,fn:()=>{if(url)chrome.tabs.create({url,active:!locked})}},
      {sep:false,label:`${I.open} Open in New Window`,fn:()=>{if(url)chrome.windows.create({url,type:"normal"})}},
      {sep:false,label:`${I.copy} Copy URL`,fn:()=>{navigator.clipboard.writeText(url);flash("Copied")}},
      {sep:true},
      {sep:false,label:`${I.trash} Unpin`,cls:"dng",fn:()=>{
        const panel=(BM.sectionPanels||[]).find(x=>x.id===panelId);if(!panel)return;
        const cluster=(panel.clusters||[]).find(cc=>cc.id===clId);
        if(cluster){cluster.items=(cluster.items||[]).filter(x=>x.id!==itemId);save();renderContent();flash("Unpinned")}
      }}
    ]);
  })});
  // Drag within panels
  c.querySelectorAll("[data-fvsp-item]").forEach(el=>{
    el.addEventListener("dragstart",e=>{
      e.dataTransfer.setData("fvsp-item",el.dataset.fvspItem);
      e.dataTransfer.setData("fvsp-cl",el.dataset.fvspCl);
      e.dataTransfer.setData("fvsp-panel",el.dataset.fvspPanel);
      el.classList.add("fv-dragging");
    });
    el.addEventListener("dragend",()=>{el.classList.remove("fv-dragging");c.querySelectorAll(".fv-drag-over").forEach(x=>x.classList.remove("fv-drag-over"))});
    el.addEventListener("dragover",e=>{e.preventDefault();el.classList.add("fv-drag-over")});
    el.addEventListener("dragleave",()=>{el.classList.remove("fv-drag-over")});
    el.addEventListener("drop",e=>{
      e.preventDefault();e.stopPropagation();
      el.classList.remove("fv-drag-over");
      const srcItem=e.dataTransfer.getData("fvsp-item");
      const srcCl=e.dataTransfer.getData("fvsp-cl");
      const srcPanel=e.dataTransfer.getData("fvsp-panel");
      const tgtItem=el.dataset.fvspItem;
      const tgtCl=el.dataset.fvspCl;
      const tgtPanel=el.dataset.fvspPanel;
      if(srcPanel===tgtPanel&&srcItem&&srcItem!==tgtItem){
        const panel=(BM.sectionPanels||[]).find(x=>x.id===tgtPanel);if(!panel)return;
        const sCl=(panel.clusters||[]).find(cc=>cc.id===srcCl);
        const tCl=(panel.clusters||[]).find(cc=>cc.id===tgtCl);
        if(!sCl||!tCl)return;
        const sIdx=(sCl.items||[]).findIndex(x=>x.id===srcItem);
        if(sIdx<0)return;
        const[moved]=sCl.items.splice(sIdx,1);
        const tIdx=(tCl.items||[]).findIndex(x=>x.id===tgtItem);
        tCl.items.splice(tIdx>=0?tIdx:tCl.items.length,0,moved);
        save();renderContent();
      }
    });
  });
}

// ═══════ Stats ═══════
function renderStats(){
  const all=allItems(BM.folders),flds=[];(function cF(n){for(const c of(n.children||[])){flds.push(c);cF(c)}})(BM.folders);
  const doms=new Set(all.map(p=>domain(p.url||"")).filter(Boolean));
  $("stats").innerHTML=`<span>📁 ${flds.length} folders</span><span>${STORE_MODE==="customgpts"?"🤖":"🔖"} ${all.length} ${ITEM_LABEL}</span><span>🌐 ${doms.size} domains</span>`;
  $("subtitle").textContent=`${all.length} ${ITEM_LABEL} · ${flds.length} folders`;
  document.title=`Prompt Vault — ${STORE_LABEL} Full View`;
  const pt=$("pageTitle"); if(pt) pt.innerHTML=`<div class="logo"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div> ${STORE_LABEL}`;
  const sb=$("searchBox"); if(sb) sb.placeholder=`Search ${ITEM_LABEL}...`;
  if(STORE_MODE==="customgpts") $("tbPanels")?.remove();
}

// ═══════ Init ═══════
chrome.storage.local.get([BK],res=>{
  BM=res[BK];
  if(!BM?.folders){$("content").innerHTML=`<div class="empty">No ${ITEM_LABEL}. Add them in the side panel first.</div>`;return}
  BM.trash=BM.trash||[];BM.nextId=BM.nextId||1;BM.sectionPanels=BM.sectionPanels||[];
  const normalized=normalizePanels();
  if(normalized)save();
  const focusId=params.get("focus");
  if(focusId&&findFolder(BM.folders,focusId)){sel=focusId;(function ep(n,t){if(n.id===t){exp[n.id]=1;return true}for(const c of(n.children||[]))if(ep(c,t)){exp[n.id]=1;return true}return false})(BM.folders,focusId)}
  (BM.folders.children||[]).forEach(c=>{exp[c.id]=1});if(focusId)exp[focusId]=1;
  renderTree();renderContent();renderStats();
  if(typeof PVViewState!=="undefined"){PVViewState.load(function(vs){_vsApply(vs);_vsReady=true})}else{_vsReady=true}

  // View toggle
  document.querySelectorAll(".vb[data-view]").forEach(btn=>btn.addEventListener("click",()=>{viewMode=btn.dataset.view;specialView="";document.querySelectorAll(".vb[data-view]").forEach(b=>b.classList.toggle("on",b.dataset.view===viewMode));renderContent()}));
  // Lock button — keeps fullview focused when opening links
  $("lockBtn")?.addEventListener("click",()=>{locked=!locked;$("lockBtn").classList.toggle("lock-on",locked);$("lockBtn").textContent=locked?"🔒":"🔓";$("lockBtn").title=locked?"Locked — links open in background":"Lock view open (prevent auto-close)"});
  // Search
  $("searchBox").addEventListener("input",e=>{searchQ=e.target.value.trim();specialView="";renderContent()});
  // Toolbar
  $("tbPanels")?.addEventListener("click",()=>{specialView=specialView==="panels"?"":"panels";$("tbPanels")?.classList.toggle("on",specialView==="panels");$("tbHealth").classList.remove("on");$("tbDupes").classList.remove("on");renderContent()});
  $("tbHealth").addEventListener("click",()=>{if(healthScanning){specialView=specialView==="health"?"":"health";renderContent();return}if(!healthScanned){runHealthCheck()}else{specialView=specialView==="health"?"":"health";$("tbHealth").classList.toggle("on",specialView==="health");$("tbDupes").classList.remove("on");$("tbPanels")?.classList.remove("on");renderContent()}});
  $("tbDupes").addEventListener("click",()=>{findDupes();specialView=specialView==="dupes"?"":"dupes";$("tbDupes").classList.toggle("on",specialView==="dupes");$("tbHealth").classList.remove("on");$("tbPanels")?.classList.remove("on");renderContent()});
  $("tbPreview").addEventListener("click",()=>{previewOn=!previewOn;$("tbPreview").classList.toggle("on",previewOn);if(!previewOn)closePreview()});
  $("tbBulk").addEventListener("click",toggleBulk);
  $("bulkTag").addEventListener("click",bulkTagModal);
  $("bulkMove").addEventListener("click",bulkMoveModal);
  $("bulkDel").addEventListener("click",bulkDelete);
  $("bulkClear").addEventListener("click",()=>{bulkSel.clear();updateBulkCt();renderContent()});
  $("pvClose").addEventListener("click",closePreview);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[BK]) return;
    chrome.storage.local.get([BK], res => {
      const next = res[BK];
      if (!next?.folders) return;
      BM = next;
      BM.trash = BM.trash || [];
      BM.nextId = BM.nextId || 1;
      BM.sectionPanels = BM.sectionPanels || [];
      const normalized = normalizePanels();
      if (normalized) save();
      if (!findFolder(BM.folders, sel)) sel = ROOT_ID;
      renderTree();
      renderContent();
      renderStats();
    });
  });
});

// ---- VIEW STATE SYNC (mirror side panel + other windows) ----
var _vsSilo=STORE_MODE;
var _vsReady=false;
function _vsApply(vs){
  var s=vs&&vs[_vsSilo]; if(!s)return;
  if(typeof BM==="undefined"||!BM)return;
  if(s.exp&&typeof s.exp==="object")exp=JSON.parse(JSON.stringify(s.exp));
  if(s.sel!==undefined)sel=s.sel;
  if(s.view!==undefined&&typeof viewMode!=="undefined")viewMode=s.view;
  if(s.q!==undefined){searchQ=s.q;var _sb=document.getElementById("searchBox");if(_sb&&_sb.value!==s.q)_sb.value=s.q;}
  try{renderTree();renderContent();}catch(e){}
}
function _persistVS(){
  if(!_vsReady||typeof PVViewState==="undefined")return;
  var slice={exp:exp,sel:sel,q:searchQ};
  if(typeof viewMode!=="undefined")slice.view=viewMode;
  PVViewState.patch(_vsSilo,slice);
}
if(typeof renderContent==="function"){var _vsOrigRC=renderContent;renderContent=function(){var _r=_vsOrigRC.apply(this,arguments);try{_persistVS()}catch(e){}return _r;};}
if(typeof PVViewState!=="undefined"){PVViewState.subscribe(function(vs){_vsApply(vs);});}
