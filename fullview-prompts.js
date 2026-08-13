const PK="pv_p",IK="pv_ip",CK="pv_cfg";
const _isImg=new URLSearchParams(location.search).get("tab")==="imgprompts";
const _storeKey=_isImg?IK:PK;
const _rootId=_isImg?"iroot":"root";
const _acColor=_isImg?"#b07acc":"#c9a45c";
const _label=_isImg?"Image Prompts":"Prompts";
const DEFAULT_PLATFORMS=[
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
// IMG_PLATFORMS is provided by fullview-shared.js (loaded before this file)
let P=null,cfg=null,sel=_rootId,exp={[_rootId]:1},searchQ="",viewingId=null;

// Tree utils, esc, formatDate, ev → provided by fullview-shared.js
function editorPlatformList(){return _isImg?IMG_PLATFORMS:(cfg?.platforms||DEFAULT_PLATFORMS)}
function getPlatName(id){
  if(_isImg){const ip=IMG_PLATFORMS.find(x=>x.id===id);if(ip)return ip.name}
  const p=(cfg?.platforms||DEFAULT_PLATFORMS).find(x=>x.id===id);return p?p.name:""}
function getPlatIcon(id){
  if(_isImg){const ip=IMG_PLATFORMS.find(x=>x.id===id);if(ip)return ip.icon}
  const p=(cfg?.platforms||DEFAULT_PLATFORMS).find(x=>x.id===id);return p?p.icon:""}
function tok(t){return Math.ceil((t||"").length/4)}

function renderTree(){
  const panel=document.getElementById("treePanel");
  let h='<div class="tree-title">Folders</div>';
  function walk(n,depth){
    const isSel=sel===n.id;
    const isExp=exp[n.id];
    const hasKids=(n.children||[]).length>0;
    const count=ci(n).prompts;
    const col=n.color||"";
    const colStyle=col?`color:${col}`:'color:var(--ac)';
    h+=`<div class="tn ${isSel?'sel':''}" data-id="${n.id}" style="padding-left:${8+depth*16}px">`;
    h+=`<span class="ch" style="transform:rotate(${isExp&&hasKids?90:0}deg);opacity:${hasKids?1:.2}"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"/></svg></span>`;
    h+=`<span class="fi" style="${colStyle}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${isExp?'M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v1M5 19h14a2 2 0 0 0 2-2l-2-7H5l-2 7a2 2 0 0 0 2 2z':'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'}"/></svg></span>`;
    h+=`<span class="nm">${esc(n.name)}</span>`;
    if(count)h+=`<span class="ct">${count}</span>`;
    h+=`</div>`;
    if(isExp&&hasKids)for(const c of n.children)walk(c,depth+1);
  }
  walk(P.folders,0);
  // Folder actions
  h+=`<div class="tree-acts"><button class="ta-btn" id="taAdd">+ Folder</button>`;
  if(sel!==_rootId)h+=`<button class="ta-btn" id="taRn">✎</button><button class="ta-btn ta-dng" id="taDel">🗑</button>`;
  h+=`</div>`;
  panel.innerHTML=h;
  panel.querySelectorAll(".tn").forEach(el=>{
    el.addEventListener("click",()=>{
      sel=el.dataset.id;viewingId=null;
      const n=findFolder(P.folders,sel);
      if(n&&(n.children||[]).length)exp[sel]=!exp[sel];
      renderTree();renderContent();
    });
    el.draggable=true;
    el.addEventListener("dragstart",e=>{e.dataTransfer.setData("fid",el.dataset.id);e.dataTransfer.effectAllowed="move"});
    el.addEventListener("dragover",e=>{e.preventDefault();el.classList.add("drop-over")});
    el.addEventListener("dragleave",()=>el.classList.remove("drop-over"));
    el.addEventListener("drop",e=>{
      e.preventDefault();el.classList.remove("drop-over");
      const srcFid=e.dataTransfer.getData("fid"),srcPid=e.dataTransfer.getData("pid"),srcPfid=e.dataTransfer.getData("pfid");
      const id=el.dataset.id;
      if(srcFid&&srcFid!==id){
        const sp=fpP(P.folders,srcFid),sn=findFolder(P.folders,srcFid),tg=findFolder(P.folders,id);
        if(sp&&sn&&tg&&!findFolder(sn,id)){sp.children=sp.children.filter(x=>x.id!==srcFid);tg.children=tg.children||[];tg.children.push(sn);exp[id]=1;saveP();renderTree();renderContent();flash("Folder moved")}
      }else if(srcPid&&srcPfid){
        const sf=findFolder(P.folders,srcPfid),tf=findFolder(P.folders,id);
        if(sf&&tf&&srcPfid!==id){const i=(sf.prompts||[]).findIndex(x=>x.id===srcPid);if(i>=0){const[moved]=sf.prompts.splice(i,1);tf.prompts=tf.prompts||[];tf.prompts.push(moved);moved.modified=Date.now();saveP();renderTree();renderContent();flash("Moved")}}
      }
    });
    el.addEventListener("contextmenu",e=>{e.preventDefault();
      const n=findFolder(P.folders,el.dataset.id);if(!n)return;
      const m=document.createElement("div");m.className="fv-ctx";m.style.left=e.clientX+"px";m.style.top=e.clientY+"px";
      m.innerHTML=`<div class="fv-ctx-i" data-a="add">+ New Subfolder</div><div class="fv-ctx-i" data-a="rn">✎ Rename</div>${el.dataset.id!==_rootId?'<div class="fv-ctx-i fv-ctx-dng" data-a="del">🗑 Delete</div>':''}`;
      document.body.appendChild(m);
      m.querySelectorAll("[data-a]").forEach(i=>i.addEventListener("click",()=>{
        const a=i.dataset.a;document.body.removeChild(m);
        if(a==="add"){sel=el.dataset.id;exp[sel]=1;addFolderP()}
        if(a==="rn")renameFolderP(el.dataset.id,n.name);
        if(a==="del"&&el.dataset.id!==_rootId)deleteFolderP(el.dataset.id,n.name);
      }));
      setTimeout(()=>document.addEventListener("click",function h2(){try{document.body.removeChild(m)}catch{};document.removeEventListener("click",h2)},{once:true}),10);
    });
  });
  document.getElementById("taAdd")?.addEventListener("click",()=>addFolderP());
  document.getElementById("taRn")?.addEventListener("click",()=>{const n=findFolder(P.folders,sel);if(n)renameFolderP(sel,n.name)});
  document.getElementById("taDel")?.addEventListener("click",()=>{const n=findFolder(P.folders,sel);if(n&&sel!==_rootId)deleteFolderP(sel,n.name)});
}

function gidP(){const id="i_"+P.nextId;P.nextId++;return id}
function fpP(n,t,p=null){if(n.id===t)return p;for(const c of(n.children||[])){const f=fpP(c,t,n);if(f)return f}return null}
function gdP(n){let d=0,c=n;while(c){const p=fpP(P.folders,c.id);if(!p)break;d++;c=p}return d}
function saveP(){fvBumpMeta();chrome.storage.local.set({[_storeKey]:P});try{chrome.runtime.sendMessage({type:"DATA_CHANGED"})}catch{}try{chrome.runtime.sendMessage({type:"REBUILD_MENUS"})}catch{}}

// findInTree, findParentFolder, afList, cloneObj, flash, showFvModal, closeFvModal → fullview-shared.js
// itemCtx is page-specific (hardcoded actions) — references _ctxEl from shared
function itemCtx(e,p){e.preventDefault();e.stopPropagation();if(_ctxEl)_ctxEl.remove();const m=document.createElement("div");m.className="fv-ctx";m.style.left=e.clientX+"px";m.style.top=e.clientY+"px";_ctxEl=m;let h=`<div class="fv-ctx-i" data-a="copy">📋 Copy</div><div class="fv-ctx-i" data-a="edit">✎ Edit</div><div class="fv-ctx-i" data-a="fav">${p.favorited?'★ Unfavorite':'☆ Favorite'}</div><div class="fv-ctx-i" data-a="dup">📄 Duplicate</div><div class="fv-ctx-i" data-a="move">📁 Move to…</div><div class="fv-ctx-sep"></div><div class="fv-ctx-i fv-ctx-dng" data-a="del">🗑 Delete</div>`;m.innerHTML=h;document.body.appendChild(m);const rect=m.getBoundingClientRect();if(rect.right>window.innerWidth)m.style.left=(window.innerWidth-rect.width-8)+"px";if(rect.bottom>window.innerHeight)m.style.top=(window.innerHeight-rect.height-8)+"px";m.querySelectorAll("[data-a]").forEach(i=>i.addEventListener("click",()=>{const a=i.dataset.a;m.remove();_ctxEl=null;if(a==="copy"){navigator.clipboard.writeText(p.content||"");flash("Copied")}if(a==="edit")editItemModal(p.id);if(a==="fav")toggleFav(p.id);if(a==="dup")duplicateItem(p.id);if(a==="move")moveItemModal(p.id);if(a==="del")deleteItemModal(p.id,p.title)}));setTimeout(()=>document.addEventListener("click",function h2(){if(_ctxEl){_ctxEl.remove();_ctxEl=null}document.removeEventListener("click",h2)},{once:true}),10)}
function toggleFav(pid){const item=findInTree(P.folders,pid);if(item){item.favorited=!item.favorited;item.modified=Date.now();saveP();renderContent();flash(item.favorited?"★ Favorited":"☆ Unfavorited")}}
function duplicateItem(pid){const item=findInTree(P.folders,pid);if(!item)return;const folder=findParentFolder(P.folders,pid);if(!folder)return;const n=cloneObj(item);n.id=gidP();n.title+=" (copy)";n.created=n.modified=Date.now();n.usageCount=0;n.versions=[];folder.prompts.push(n);saveP();renderContent();flash("Duplicated")}
function deleteItemModal(pid,title){showFvModal(`<h3>Delete "${esc(title)}"?</h3><p style="font-size:11px;color:var(--dm);margin-bottom:12px">This will move it to trash.</p><div class="btn-row"><button class="mbtn" id="mdX">Cancel</button><button class="mbtn dng" id="mdY">Delete</button></div>`,box=>{box.querySelector("#mdX").addEventListener("click",closeFvModal);box.querySelector("#mdY").addEventListener("click",()=>{fvPushUndo(_storeKey,P);const folder=findParentFolder(P.folders,pid);if(folder){const item=folder.prompts.find(x=>x.id===pid);if(item){P.trash=P.trash||[];P.trash.push({type:"prompt",id:pid,name:item.title,content:cloneObj(item),deletedAt:Date.now(),from:folder.id});if(P.trash.length>100)P.trash=P.trash.slice(-100);folder.prompts=folder.prompts.filter(x=>x.id!==pid);saveP();closeFvModal();renderContent();renderStats();flash("Deleted")}}})})}
function editItemModal(pid){const p=findInTree(P.folders,pid);if(!p)return;const edTitle=_isImg?"Edit Image Prompt":"Edit Prompt";const plats=editorPlatformList();showFvModal(`<h3>${edTitle}</h3><label>Title</label><input type="text" id="edTi" value="${esc(p.title||'')}"><label>Platform</label><select id="edPl" style="width:100%;background:var(--inp);border:1px solid var(--bl);border-radius:4px;padding:6px 8px;color:var(--tx);font-size:12px;margin-bottom:8px"><option value="">None</option>${plats.map(pl=>`<option value="${pl.id}" ${p.platform===pl.id?'selected':''}>${pl.icon} ${pl.name}</option>`).join('')}</select><label>Tags (comma separated)</label><input type="text" id="edTg" value="${esc((p.tags||[]).join(', '))}"><label>Content</label><textarea id="edCo" rows="8">${esc(p.content||'')}</textarea>${_isImg&&p.params?`<p style="font-size:10px;color:var(--dm);margin:4px 0 0">Structured parameters (MJ etc.) are kept when you save — edit the compiled text above, or rebuild in the image builder.</p>`:''}<div class="btn-row"><button class="mbtn" id="edX">Cancel</button><button class="mbtn primary" id="edOK">Save</button></div>`,box=>{box.querySelector("#edTi").focus();box.querySelector("#edX").addEventListener("click",closeFvModal);box.querySelector("#edOK").addEventListener("click",()=>{fvPushUndo(_storeKey,P);p.title=box.querySelector("#edTi").value.trim()||p.title;p.platform=box.querySelector("#edPl").value;p.tags=box.querySelector("#edTg").value.split(",").map(t=>t.trim().toLowerCase()).filter(Boolean);p.content=box.querySelector("#edCo").value;p.modified=Date.now();saveP();closeFvModal();renderContent();flash("Saved")})})}
function moveItemModal(pid){const flds=afList(P.folders);const curFolder=findParentFolder(P.folders,pid);const curFid=curFolder?curFolder.id:"";let h=`<h3>Move to</h3><div style="max-height:300px;overflow-y:auto">`;flds.forEach(f=>{if(f.id===curFid)return;h+=`<div class="fpi" data-mid="${f.id}" style="padding-left:${6+f.depth*12}px;cursor:pointer">📁 ${esc(f.name)}</div>`});h+=`</div><div class="btn-row"><button class="mbtn" id="mvX">Cancel</button></div>`;showFvModal(h,box=>{box.querySelector("#mvX").addEventListener("click",closeFvModal);box.querySelectorAll("[data-mid]").forEach(el=>el.addEventListener("click",()=>{fvPushUndo(_storeKey,P);const tgtId=el.dataset.mid;const srcFolder=findParentFolder(P.folders,pid);const tgtFolder=findFolder(P.folders,tgtId);if(!srcFolder||!tgtFolder)return;const idx=srcFolder.prompts.findIndex(x=>x.id===pid);if(idx<0)return;const[moved]=srcFolder.prompts.splice(idx,1);tgtFolder.prompts=tgtFolder.prompts||[];tgtFolder.prompts.push(moved);moved.modified=Date.now();saveP();closeFvModal();renderTree();renderContent();flash("Moved")}))})}
function createNewPrompt(){const folder=findFolder(P.folders,sel);if(!folder)return;const id=gidP();const item=_isImg?{id,title:"New Image Prompt",content:"",tags:[],platform:"midjourney",created:Date.now(),modified:Date.now(),usageCount:0,favorited:false,versions:[],_capSel:[]}:{id,title:"New Prompt",content:"",tags:[],platform:"",created:Date.now(),modified:Date.now(),usageCount:0,favorited:false,versions:[]};folder.prompts=folder.prompts||[];folder.prompts.push(item);saveP();renderContent();renderStats();flash("Created");editItemModal(id)}
function addFolderP(){
  const f=findFolder(P.folders,sel);if(!f||gdP(f)>=4)return;
  const id=gidP();f.children=f.children||[];f.children.push({id,name:"New Folder",children:[],prompts:[],color:""});
  exp[sel]=1;saveP();renderTree();renderContent();renameFolderP(id,"New Folder");
}
function renameFolderP(fid,name){
  const inp=prompt("Rename folder:",name);if(inp===null)return;const v=inp.trim();
  if(v){const f=findFolder(P.folders,fid);if(f){f.name=v;saveP();renderTree();renderContent()}}
}
function deleteFolderP(fid,name){
  if(!confirm(`Delete "${name}"? Contents will be lost.`))return;
  const parent=fpP(P.folders,fid),folder=findFolder(P.folders,fid);
  if(parent&&folder){parent.children=parent.children.filter(x=>x.id!==fid);if(sel===fid)sel=parent.id;saveP();renderTree();renderContent()}
}

function renderContent(){
  const c=document.getElementById("content");

  // Detail/reader view
  if(viewingId){
    const allP=allItems(P.folders);const p=allP.find(x=>x.id===viewingId);
    if(!p){viewingId=null;renderContent();return}
    renderPromptDetail(c,p);return;
  }

  const f=findFolder(P.folders,sel);
  if(!f){c.innerHTML='<div class="empty">Folder not found</div>';return}
  const isRoot=sel===_rootId;

  // Breadcrumbs
  const crumbs=[];let n=f;while(n){crumbs.unshift(n);n=fp(P.folders,n.id)}
  let h='<div class="bc">';
  crumbs.forEach((b,i)=>{
    if(i)h+=' <span style="opacity:.4">/</span> ';
    h+=`<span class="${i===crumbs.length-1?'cur':''}" data-nav="${b.id}">${esc(b.name)}</span>`;
  });
  h+='</div>';

  // Subfolders (drop targets for moving items)
  if(f.children?.length){
    h+='<div class="sub-chips">';
    f.children.forEach(ch=>{
      const col=ch.color||"";
      const colStyle=col?`color:${col}`:'color:var(--ac)';
      h+=`<div class="sub-chip" data-nav="${ch.id}" data-drop-fid="${ch.id}"><span style="${colStyle};display:flex"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span> ${esc(ch.name)} <span class="sub-ct">${ci(ch).prompts}</span></div>`;
    });
    h+='</div>';
  }

  // Items — root shows all, otherwise show folder
  let items=isRoot?allItems(P.folders):[...(f.prompts||[])];

  // Search filter
  if(searchQ){
    const q=searchQ.toLowerCase();
    const allP=allItems(P.folders);
    items=allP.filter(p=>p.title.toLowerCase().includes(q)||(p.content||"").toLowerCase().includes(q)||(p.tags||[]).some(t=>t.toLowerCase().includes(q)));
  }

  // Preserve array order when not searching — allows drag-reorder to persist (root + folder view)
  if(!searchQ){/* use order as-is */}else{items.sort((a,b)=>(b.modified||0)-(a.modified||0))}
  const displayItems=items.slice(0,200);

  if(searchQ){
    h+=`<div style="font-size:10px;color:var(--dm);margin-bottom:8px">${items.length} result${items.length!==1?'s':''} for "${esc(searchQ)}"</div>`;
  } else if(isRoot&&items.length){
    const kind=_isImg?"image prompts":"prompts";
    h+=`<div style="font-size:10px;color:var(--dm);margin-bottom:8px">${items.length} ${kind} across all folders${items.length>200?' (showing 200)':''}</div>`;
  }

  if(displayItems.length){
    h+=`<div style="margin-bottom:8px"><button class="ta-btn" id="fvNewItem" style="font-size:11px;padding:4px 12px">+ New ${_isImg?"Image Prompt":"Prompt"}</button></div>`;
    h+='<div class="cards">';
    displayItems.forEach(p=>{
      const vars=ev(p.content);
      const platIcon=getPlatIcon(p.platform);
      const platName=getPlatName(p.platform);
      h+=`<div class="card" data-open="${esc(p.id)}" data-pid="${esc(p.id)}" data-fid="${esc(p.folderId||sel)}" draggable="true">`;
      h+=`<div class="card-top"><div class="card-info"><div class="card-title">${platIcon?platIcon+' ':''}${esc(p.title)}</div>${platName?`<div class="card-plat">${esc(platName)}</div>`:''}${(isRoot||searchQ)&&p.folderName?`<div class="folder-path">📁 ${esc(p.folderName)}</div>`:''}</div>`;
      h+=`<div class="card-acts"><button class="card-btn" data-copy="${esc(p.id)}" title="Copy to clipboard"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button><button class="card-btn" data-del="${esc(p.id)}" data-deltitle="${esc(p.title)}" title="Delete" style="color:var(--dn)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5-3h4a1 1 0 0 1 1 1v1H9V4a1 1 0 0 1 1-1"/></svg></button></div>`;
      h+=`</div>`;
      if(p.content)h+=`<div class="card-body">${esc(p.content)}</div>`;
      if(p.tags?.length)h+=`<div class="card-tags">${p.tags.map(t=>`<span class="card-tag">${esc(t)}</span>`).join('')}</div>`;
      if(vars.length)h+=`<div class="card-vars">${vars.map(v=>`<span class="card-var">{{${esc(v)}}}</span>`).join('')}</div>`;
      h+=`<div class="card-meta"><span>${formatDate(p.modified||p.created)}</span><span>~${tok(p.content)}t${(p.usageCount||0)>0?` · ${p.usageCount}×`:''}</span></div>`;
      h+=`</div>`;
    });
    h+='</div>';
  } else {
    h+=`<div class="empty">No ${_isImg?"image prompts":"prompts"} found</div>`;
  }

  c.innerHTML=h;

  c.querySelectorAll("[data-nav]").forEach(el=>{
    el.addEventListener("click",()=>{sel=el.dataset.nav;exp[sel]=1;searchQ="";viewingId=null;document.getElementById("searchBox").value="";renderTree();renderContent()});
  });
  c.querySelectorAll("[data-copy]").forEach(btn=>{
    btn.addEventListener("click",e=>{
      e.stopPropagation();
      const allP=allItems(P.folders);
      const p=allP.find(x=>x.id===btn.dataset.copy);
      if(p){navigator.clipboard.writeText(p.content||"");flash("Copied")}
    });
  });
  c.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click",e=>{
      e.stopPropagation();
      deleteItemModal(btn.dataset.del,btn.dataset.deltitle||"item");
    });
  });
  // Right-click context menu on cards
  c.querySelectorAll("[data-open]").forEach(card=>{
    card.addEventListener("contextmenu",e=>{
      const allP=allItems(P.folders);
      const p=allP.find(x=>x.id===card.dataset.open);
      if(p)itemCtx(e,p);
    });
  });
  // + New button
  c.querySelector("#fvNewItem")?.addEventListener("click",()=>createNewPrompt());
  // Click-to-open detail view
  c.querySelectorAll("[data-open]").forEach(card=>{
    card.addEventListener("click",e=>{
      if(e.target.closest(".card-btn,.card-acts,button"))return;
      viewingId=card.dataset.open;renderContent();
    });
  });
  // ── Drag & drop: reorder + move ──
  c.querySelectorAll("[data-pid]").forEach(card=>{
    card.addEventListener("dragstart",e=>{e.dataTransfer.setData("pid",card.dataset.pid);e.dataTransfer.setData("pfid",card.dataset.fid);e.dataTransfer.effectAllowed="move";card.classList.add("dragging")});
    card.addEventListener("dragend",()=>{card.classList.remove("dragging");c.querySelectorAll(".drop-above,.drop-below,.drop-over").forEach(x=>x.classList.remove("drop-above","drop-below","drop-over"))});
    card.addEventListener("dragover",e=>{
      if(!e.dataTransfer.types.includes("pid"))return;
      e.preventDefault();
      const rect=card.getBoundingClientRect();
      const pct=(e.clientY-rect.top)/rect.height;
      card.classList.remove("drop-above","drop-below");
      card.classList.add(pct<0.5?"drop-above":"drop-below");
    });
    card.addEventListener("dragleave",()=>card.classList.remove("drop-above","drop-below"));
    card.addEventListener("drop",e=>{
      card.classList.remove("drop-above","drop-below");
      const srcPid=e.dataTransfer.getData("pid"),srcFid=e.dataTransfer.getData("pfid");
      const tgtPid=card.dataset.pid,tgtFid=card.dataset.fid;
      if(!srcPid||srcPid===tgtPid)return;
      if(srcFid===tgtFid){
        e.preventDefault();e.stopPropagation();
        const folder=findFolder(P.folders,tgtFid);if(!folder)return;
        const srcIdx=(folder.prompts||[]).findIndex(x=>x.id===srcPid);
        if(srcIdx<0)return;
        const[moved]=folder.prompts.splice(srcIdx,1);
        let tgtIdx=folder.prompts.findIndex(x=>x.id===tgtPid);
        const rect=card.getBoundingClientRect();
        const pct=(e.clientY-rect.top)/rect.height;
        if(tgtIdx<0)tgtIdx=folder.prompts.length;
        else if(pct>=0.5)tgtIdx++;
        folder.prompts.splice(tgtIdx,0,moved);
        saveP();renderContent();flash("Reordered");
      }else{
        e.preventDefault();e.stopPropagation();
        const src=findFolder(P.folders,srcFid),tgt=findFolder(P.folders,tgtFid);
        if(src&&tgt){const i=(src.prompts||[]).findIndex(x=>x.id===srcPid);if(i>=0){const[moved]=src.prompts.splice(i,1);tgt.prompts=tgt.prompts||[];tgt.prompts.push(moved);moved.modified=Date.now();saveP();renderTree();renderContent();flash("Moved")}}
      }
    });
  });
  c.querySelectorAll("[data-drop-fid]").forEach(chip=>{
    chip.addEventListener("dragover",e=>{if(e.dataTransfer.types.includes("pid")){e.preventDefault();chip.classList.add("drop-over")}});
    chip.addEventListener("dragleave",()=>chip.classList.remove("drop-over"));
    chip.addEventListener("drop",e=>{
      chip.classList.remove("drop-over");
      const srcPid=e.dataTransfer.getData("pid"),srcFid=e.dataTransfer.getData("pfid");
      const tgtFid=chip.dataset.dropFid;
      if(!srcPid||srcFid===tgtFid)return;
      e.preventDefault();e.stopPropagation();
      const src=findFolder(P.folders,srcFid),tgt=findFolder(P.folders,tgtFid);
      if(src&&tgt){const i=(src.prompts||[]).findIndex(x=>x.id===srcPid);if(i>=0){const[moved]=src.prompts.splice(i,1);tgt.prompts=tgt.prompts||[];tgt.prompts.push(moved);moved.modified=Date.now();saveP();renderTree();renderContent();flash("Moved")}}
    });
  });
}

// ═══════ DETAIL / READER VIEW ═══════
function renderPromptDetail(c,p){
  const platIcon=getPlatIcon(p.platform);
  const platName=getPlatName(p.platform);
  const vars=ev(p.content);

  let h=`<div class="detail">`;
  h+=`<div class="detail-nav"><button class="detail-back" id="detailBack"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back</button>`;
  h+=`<div class="detail-acts"><button class="detail-btn" id="detailCopy"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button></div></div>`;
  h+=`<div class="detail-header"><h2 class="detail-title">${platIcon?platIcon+' ':''}${esc(p.title)}${p.favorited?' <span style="color:var(--ac)">★</span>':''}</h2>`;
  const meta2=[];
  if(platName)meta2.push(platName);
  if(p.folderName)meta2.push("📁 "+p.folderName);
  if(p.modified)meta2.push(formatDate(p.modified));
  if(p.usageCount)meta2.push(p.usageCount+"×");
  meta2.push("~"+tok(p.content)+" tokens");
  h+=`<div class="detail-meta">${meta2.map(m=>esc(m)).join(' · ')}</div></div>`;
  if(p.tags?.length)h+=`<div class="detail-tags">${p.tags.map(t=>`<span class="card-tag">${esc(t)}</span>`).join('')}</div>`;
  if(vars.length)h+=`<div class="detail-vars">${vars.map(v=>`<span class="card-var">{{${esc(v)}}}</span>`).join('')}</div>`;
  if(p.content)h+=`<pre class="detail-body">${esc(p.content)}</pre>`;
  h+=`</div>`;
  c.innerHTML=h;

  document.getElementById("detailBack").addEventListener("click",()=>{viewingId=null;renderContent()});
  document.getElementById("detailCopy")?.addEventListener("click",()=>{navigator.clipboard.writeText(p.content||"");flash("Copied")});
}

function renderStats(){
  const all=allItems(P.folders);
  const folders=[];(function countF(n){for(const c of(n.children||[])){folders.push(c);countF(c)}})(P.folders);
  const plats=new Set(all.map(p=>p.platform).filter(Boolean));
  const totalTok=all.reduce((s,p)=>s+tok(p.content),0);
  document.getElementById("stats").innerHTML=`<span>📁 ${folders.length} folders</span><span>${_isImg?'🖼':'⚡'} ${all.length} ${_label.toLowerCase()}</span><span>🏷 ${plats.size} platforms</span><span>~${totalTok.toLocaleString()} tokens</span>`;
  document.getElementById("subtitle").textContent=`${all.length} ${_label.toLowerCase()} · ${folders.length} folders`;
}

try{
chrome.storage.local.get([_storeKey,CK],res=>{
  try{
  const _diag=[];
  _diag.push(`tab=${_isImg?'imgprompts':'prompts'}`);
  _diag.push(`storeKey=${_storeKey}`);
  _diag.push(`hasData=${!!res[_storeKey]}`);
  _diag.push(`hasFolders=${!!res[_storeKey]?.folders}`);
  _diag.push(`type=${typeof res[_storeKey]}`);
  if(res[_storeKey]){_diag.push(`keys=${Object.keys(res[_storeKey]).join(',')}`)}
  _diag.push(`itemCount=${res[_storeKey]?.folders?allItems(res[_storeKey].folders).length:'N/A'}`);
  console.log(`[PV-FV] fullview-prompts init |`,_diag.join(' | '));
  // Override accent color for Image Prompts tab
  if(_isImg){
    document.documentElement.style.setProperty('--ac',_acColor);
    document.documentElement.style.setProperty('--ad','rgba(176,122,204,.12)');
    document.documentElement.style.setProperty('--ab','rgba(176,122,204,.25)');
    document.title='Prompt Vault — Image Prompts Full View';
    const h1=document.querySelector('.top h1');
    if(h1)h1.innerHTML=h1.innerHTML.replace('⚡ Prompts','🖼 Image Prompts');
  }
  P=res[_storeKey];
  cfg=res[CK]||{};
  if(!P||!P.folders){
    // Initialize empty store — same default as sidepanel loadData()
    P={folders:{id:_rootId,name:_isImg?"My Image Prompts":"My Prompts",children:[],prompts:[],color:""},trash:[],nextId:1,collections:[]};
    chrome.storage.local.set({[_storeKey]:P});
    console.info("[PV-FV] Initialized empty",_storeKey,"store");
  }
  (P.folders.children||[]).forEach(c=>{exp[c.id]=1});
  renderTree();renderContent();renderStats();
  document.getElementById("searchBox").addEventListener("input",e=>{searchQ=e.target.value.trim();viewingId=null;renderContent()});
  if(typeof PVViewState!=="undefined"){PVViewState.load(function(vs){_vsApply(vs);_vsReady=true})}else{_vsReady=true}
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area!=="local")return;
    if(!changes[_storeKey]&&!changes[CK])return;
    chrome.storage.local.get([_storeKey,CK],res=>{
      const nextP=res[_storeKey],nextCfg=res[CK]||{};
      if(!nextP?.folders)return;
      P=nextP;cfg=nextCfg;
      if(!findFolder(P.folders,sel))sel=_rootId;
      if(viewingId&&!findInTree(P.folders,viewingId))viewingId=null;
      renderTree();renderContent();renderStats();
    });
  });
  }catch(innerErr){
    console.error("[PV-FV] Init error:",innerErr);
    document.getElementById("content").innerHTML='<div class="empty" style="color:#c45c5c">Fullview init error: '+innerErr.message+'</div>';
  }
});
}catch(outerErr){
  console.error("[PV-FV] Fatal:",outerErr);
  document.getElementById("content").innerHTML='<div class="empty" style="color:#c45c5c">Fatal: '+outerErr.message+'</div>';
}

// ---- VIEW STATE SYNC (mirror side panel + other windows) ----
var _vsSilo=_isImg?"imgprompts":"prompts";
var _vsReady=false;
function _vsApply(vs){
  var s=vs&&vs[_vsSilo]; if(!s)return;
  if(typeof P==="undefined"||!P)return;
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
