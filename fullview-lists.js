/* Prompt Vault Lists & Tasks full view. */
(()=>{
  "use strict";
  const M=PVListsModel,$=id=>document.getElementById(id),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const TYPE_LABEL={bulleted:"Bulleted list",numbered:"Numbered list",checklist:"Checklist",kanban:"Kanban board",sticky:"Sticky notes"};
  let store=M.defaultStore(),folderId="lroot",fileId="",saveTimer=null;
  const folder=()=>M.findFolder(store.folders,folderId)||store.folders;
  const current=()=>M.findFile(store.folders,fileId)?.file||null;
  function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("on");setTimeout(()=>el.classList.remove("on"),1600)}
  function save(){clearTimeout(saveTimer);$("saveState").textContent="Saving…";saveTimer=setTimeout(()=>chrome.storage.local.set({[M.KEY]:store},()=>{saveTimer=null;$("saveState").textContent="Saved locally"}),120)}
  function touch(file){file.modified=Date.now();save()}
  function promptText(label,value=""){const x=window.prompt(label,value);return x===null?null:x.trim()}

  // ── Lightweight modal + context menu ──
  function openModal(html,wire){
    closeMenu();const wrap=document.createElement("div");wrap.className="pvl-modal-wrap";wrap.innerHTML=`<div class="pvl-modal">${html}</div>`;
    wrap.addEventListener("mousedown",e=>{if(e.target===wrap)wrap.remove()});
    document.body.appendChild(wrap);wire?.(wrap.firstElementChild,()=>wrap.remove());
    return()=>wrap.remove();
  }
  let _menuEl=null;
  function closeMenu(){_menuEl?.remove();_menuEl=null}
  function openMenu(x,y,items){
    closeMenu();
    const el=document.createElement("div");el.className="pvl-menu";
    el.innerHTML=items.map((it,i)=>it.sep?'<div class="pvl-menu-sep"></div>':`<div class="pvl-menu-item${it.cls?' '+it.cls:''}" data-mi="${i}">${it.swatch?`<span class="pvl-swatch" style="background:${esc(it.swatch)}"></span>`:""}${esc(it.label)}</div>`).join("");
    document.body.appendChild(el);
    const r=el.getBoundingClientRect();
    el.style.left=Math.min(x,window.innerWidth-r.width-6)+"px";
    el.style.top=Math.min(y,window.innerHeight-r.height-6)+"px";
    el.addEventListener("click",e=>{const t=e.target.closest("[data-mi]");if(!t)return;closeMenu();items[+t.dataset.mi].fn?.()});
    setTimeout(()=>document.addEventListener("mousedown",function h(e){if(!el.contains(e.target)){closeMenu();document.removeEventListener("mousedown",h)}}),0);
    _menuEl=el;
  }

  // ── Folder tree (files can be dropped on any folder row) ──
  function renderFolders(){
    const walk=(n,depth)=>`<div class="folder ${n.id===folderId?'on':''}" data-folder="${esc(n.id)}" style="padding-left:${7+depth*13}px"><span>${(n.children||[]).length?'▾':'•'}</span><span class="name">${esc(n.name)}</span><span class="count">${(n.prompts||[]).length}</span></div>${(n.children||[]).map(c=>walk(c,depth+1)).join("")}`;
    $("folderTree").innerHTML=walk(store.folders,0)+`<div style="display:flex;gap:5px;padding:10px 4px"><button class="mini" id="renameFolder">Rename</button>${folderId!=="lroot"?'<button class="mini danger" id="deleteFolder">Delete empty</button>':''}</div>`;
    $("folderTree").querySelectorAll("[data-folder]").forEach(el=>{
      el.onclick=()=>{folderId=el.dataset.folder;fileId="";render()};
      el.addEventListener("dragover",e=>{if([...e.dataTransfer.types].includes("text/pv-list-file")){e.preventDefault();e.dataTransfer.dropEffect="move";el.classList.add("drop")}});
      el.addEventListener("dragleave",()=>el.classList.remove("drop"));
      el.addEventListener("drop",e=>{
        el.classList.remove("drop");const id=e.dataTransfer.getData("text/pv-list-file");if(!id)return;e.preventDefault();
        if(M.moveFile(store.folders,id,el.dataset.folder)){save();toast("Moved to "+(M.findFolder(store.folders,el.dataset.folder)?.name||"folder"));render()}
      });
    });
    $("renameFolder").onclick=()=>{const f=folder(),name=promptText("Rename folder",f.name);if(name){f.name=name;save();render()}};
    $("deleteFolder")?.addEventListener("click",()=>{if(!M.removeFolder(store.folders,folderId)){toast("Folder must be empty first");return}folderId="lroot";fileId="";save();render()});
  }

  // ── File list (files drag to folders; ↑/↓ reorder stays) ──
  function renderFiles(){
    const f=folder(),files=f.prompts||[];$("folderTitle").textContent=f.name;
    $("fileList").innerHTML=files.length?files.map((x,i)=>`<article class="file ${x.id===fileId?'on':''}" data-file="${esc(x.id)}" draggable="true" title="Drag onto a folder to move"><div class="file-main"><div class="file-title">${esc(x.title)}</div><div class="file-type">${esc(TYPE_LABEL[x.type]||x.type)}</div></div><div><button class="mini" data-file-up="${esc(x.id)}" ${i===0?'disabled':''}>↑</button><button class="mini" data-file-down="${esc(x.id)}" ${i===files.length-1?'disabled':''}>↓</button><button class="mini danger" data-file-del="${esc(x.id)}">×</button></div></article>`).join(""):'<div class="empty">This folder is empty. Choose a type above and create the first file.</div>';
    $("fileList").querySelectorAll("[data-file]").forEach(el=>{
      el.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/pv-list-file",el.dataset.file);e.dataTransfer.effectAllowed="move";el.classList.add("dragging")});
      el.addEventListener("dragend",()=>el.classList.remove("dragging"));
    });
    $("fileList").querySelectorAll("[data-file] .file-main").forEach(el=>el.onclick=()=>{fileId=el.closest("[data-file]").dataset.file;render()});
    $("fileList").querySelectorAll("[data-file-up],[data-file-down]").forEach(el=>el.onclick=e=>{e.stopPropagation();const id=el.dataset.fileUp||el.dataset.fileDown,i=files.findIndex(x=>x.id===id),to=el.dataset.fileUp!==undefined?i-1:i+1;if(M.move(files,i,to)){save();render()}});
    $("fileList").querySelectorAll("[data-file-del]").forEach(el=>el.onclick=e=>{e.stopPropagation();const x=files.find(y=>y.id===el.dataset.fileDel);if(x&&window.confirm(`Delete “${x.title}”?`)){files.splice(files.indexOf(x),1);if(fileId===x.id)fileId="";save();render()}});
  }

  // ── Simple lists / checklists (rows drag to reorder) ──
  function itemRows(file){
    return `<div class="add-row"><input id="addItemText" placeholder="Add an item…"><button id="addItem">Add</button></div><div id="items">${file.items.map((x,i)=>`<div class="list-row" data-item="${esc(x.id)}">${file.type==='checklist'?`<input type="checkbox" data-done ${x.done?'checked':''}>`:`<span class="num">${file.type==='numbered'?(i+1)+'.':'•'}</span>`}<input type="text" data-text value="${esc(x.text)}"><span class="row-actions"><span class="grip" title="Drag to reorder">⋮⋮</span><button class="mini danger" data-del>×</button></span></div>`).join("")}</div>`;
  }
  function wireItems(file){
    const add=()=>{const input=$("addItemText"),text=input.value.trim();if(!text)return;file.items.push(M.normalizeItem({text}));input.value="";touch(file);renderEditor()};
    $("addItem").onclick=add;$("addItemText").onkeydown=e=>{if(e.key==="Enter")add()};
    $("items").querySelectorAll("[data-item]").forEach(row=>{
      const item=file.items.find(x=>x.id===row.dataset.item),idx=()=>file.items.indexOf(item);
      row.querySelector("[data-text]").onchange=e=>{item.text=e.target.value;touch(file)};
      row.querySelector("[data-done]")?.addEventListener("change",e=>{item.done=e.target.checked;touch(file)});
      row.querySelector("[data-del]").onclick=()=>{file.items.splice(idx(),1);touch(file);renderEditor()};
      // Drag only from the grip — a draggable row would hijack text selection
      // inside the item's input.
      const grip=row.querySelector(".grip");
      grip.addEventListener("mousedown",()=>row.setAttribute("draggable","true"));
      row.addEventListener("mouseup",()=>row.removeAttribute("draggable"));
      row.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/pv-list-item",item.id);e.dataTransfer.effectAllowed="move";row.classList.add("dragging")});
      row.addEventListener("dragend",()=>{row.removeAttribute("draggable");row.classList.remove("dragging");$("items").querySelectorAll(".drop-above,.drop-below").forEach(x=>x.classList.remove("drop-above","drop-below"))});
      row.addEventListener("dragover",e=>{
        const dragId=[...e.dataTransfer.types].includes("text/pv-list-item");if(!dragId)return;e.preventDefault();
        const r=row.getBoundingClientRect(),before=e.clientY<r.top+r.height/2;
        row.classList.toggle("drop-above",before);row.classList.toggle("drop-below",!before);
      });
      row.addEventListener("dragleave",()=>row.classList.remove("drop-above","drop-below"));
      row.addEventListener("drop",e=>{
        e.preventDefault();const dragId=e.dataTransfer.getData("text/pv-list-item");
        row.classList.remove("drop-above","drop-below");
        if(!dragId||dragId===item.id)return;
        const from=file.items.findIndex(x=>x.id===dragId);if(from<0)return;
        const r=row.getBoundingClientRect(),before=e.clientY<r.top+r.height/2;
        let to=idx()+(before?0:1);if(from<to)to--;
        if(M.move(file.items,from,to)){touch(file);renderEditor()}
      });
    });
  }

  // ── Sticky notes (unchanged behavior) ──
  function stickyHtml(file){return `<div class="add-row"><button id="addSticky">+ Sticky note</button></div><div class="sticky-grid" id="stickies">${file.items.map((x,i)=>`<article class="sticky" data-item="${esc(x.id)}" style="background:${esc(x.color)}"><textarea data-text placeholder="Type a note…">${esc(x.text)}</textarea><div class="sticky-actions"><select data-color><option value="#f3d37a" ${x.color==='#f3d37a'?'selected':''}>Gold</option><option value="#9ed6c6" ${x.color==='#9ed6c6'?'selected':''}>Mint</option><option value="#a8c7ef" ${x.color==='#a8c7ef'?'selected':''}>Blue</option><option value="#eab0bd" ${x.color==='#eab0bd'?'selected':''}>Rose</option></select><button data-up ${i===0?'disabled':''}>←</button><button data-down ${i===file.items.length-1?'disabled':''}>→</button><button data-del>×</button></div></article>`).join("")}</div>`}
  function wireStickies(file){$("addSticky").onclick=()=>{file.items.push(M.normalizeItem({text:"",color:"#f3d37a"}));touch(file);renderEditor()};$("stickies").querySelectorAll("[data-item]").forEach(el=>{const item=file.items.find(x=>x.id===el.dataset.item),idx=()=>file.items.indexOf(item);el.querySelector("[data-text]").onchange=e=>{item.text=e.target.value;touch(file)};el.querySelector("[data-color]").onchange=e=>{item.color=e.target.value;touch(file);renderEditor()};el.querySelector("[data-up]").onclick=()=>{if(M.move(file.items,idx(),idx()-1)){touch(file);renderEditor()}};el.querySelector("[data-down]").onclick=()=>{if(M.move(file.items,idx(),idx()+1)){touch(file);renderEditor()}};el.querySelector("[data-del]").onclick=()=>{file.items.splice(idx(),1);touch(file);renderEditor()}})}

  // ── Kanban: nested columns, collapse, statuses, per-board settings ──
  function statusLabel(file,color){const s=(file.settings?.statuses||[]).find(x=>x.color===color);return s?.label||""}
  function enabledFields(file){const keys=file.settings?.cardFields||[];return M.CARD_FIELD_DEFS.filter(f=>keys.includes(f.key))}
  function cardHtml(file,card){
    const fields=enabledFields(file).filter(f=>card.fields?.[f.key]);
    const label=card.color?statusLabel(file,card.color):"";
    return `<article class="card" draggable="true" data-card="${esc(card.id)}" style="${card.color?`border-left-color:${esc(card.color)}`:""}">
      <input data-card-text value="${esc(card.text)}" placeholder="Card title…">
      ${label?`<div class="card-status" style="color:${esc(card.color)}">${esc(label)}</div>`:""}
      ${fields.map(f=>`<div class="card-field"><span>${esc(f.label)}:</span> ${esc(card.fields[f.key])}</div>`).join("")}
      <div class="card-actions">${enabledFields(file).length?`<button class="mini" data-card-open title="Edit card details">✎ Details</button>`:""}<button class="mini danger" data-card-del>Delete</button></div>
    </article>`;
  }
  function columnHtml(file,col,depth){
    const count=M.columnCardCount(col);
    if(col.collapsed)return `<section class="column collapsed" data-column="${esc(col.id)}" title="${esc(col.title)} — ${count} card${count===1?"":"s"}"><button class="mini" data-col-expand title="Expand column">⤢</button><div class="collapsed-title">${esc(col.title)}</div><div class="collapsed-count">${count}</div></section>`;
    const head=`<div class="column-head"><input data-column-title value="${esc(col.title)}"><span class="count">${count}</span><button class="mini" data-col-collapse title="Collapse column">⤡</button><button class="mini" data-col-menu title="Column options">⋯</button></div>`;
    if((col.children||[]).length)
      return `<section class="column split" data-column="${esc(col.id)}">${head}<div class="subcolumns">${col.children.map(ch=>columnHtml(file,ch,depth+1)).join("")}</div></section>`;
    return `<section class="column" data-column="${esc(col.id)}">${head}<div class="cards" data-drop-column="${esc(col.id)}">${col.cards.map(card=>cardHtml(file,card)).join("")}</div><div class="column-add"><input placeholder="Add a card…" data-card-new><button data-card-add>+</button></div></section>`;
  }
  function kanbanHtml(file){
    return `<div class="add-row"><button id="addColumn">+ Column</button><button id="boardSettings">⚙ Board settings</button><span class="count">Drag cards between columns · right-click a card to color it · ⋯ on a column to split it</span></div><div class="board" id="board">${file.columns.map(col=>columnHtml(file,col,0)).join("")}</div>`;
  }
  function openCardDetails(file,card){
    const defs=enabledFields(file);
    openModal(`<h3>Card details</h3>
      <label class="pvl-lbl">Title</label><input id="cdText" value="${esc(card.text)}">
      ${defs.map(f=>`<label class="pvl-lbl">${esc(f.label)}</label><input data-cd-field="${esc(f.key)}" type="${f.key==="due"?"date":"text"}" value="${esc(card.fields?.[f.key]||"")}">`).join("")}
      <div class="pvl-brow"><button class="mini" id="cdX">Close</button><button class="mini primary" id="cdOK">Save</button></div>`,(mc,close)=>{
      mc.querySelector("#cdX").onclick=close;
      mc.querySelector("#cdOK").onclick=()=>{
        card.text=mc.querySelector("#cdText").value;
        card.fields=card.fields||{};
        mc.querySelectorAll("[data-cd-field]").forEach(inp=>{card.fields[inp.dataset.cdField]=inp.value});
        touch(file);close();renderEditor();
      };
    });
  }
  function openBoardSettings(file){
    const s=file.settings=M.normalizeKanbanSettings(file.settings);
    openModal(`<h3>Board settings — ${esc(file.title)}</h3>
      <div class="pvl-tab-note">Settings apply to this board only.</div>
      <h4>Card creation fields</h4>
      <div class="pvl-note">Checked fields appear on this board's cards (✎ Details).</div>
      <div class="pvl-fields">${M.CARD_FIELD_DEFS.map(f=>`<label><input type="checkbox" data-bs-field="${esc(f.key)}" ${s.cardFields.includes(f.key)?"checked":""}> ${esc(f.label)}</label>`).join("")}</div>
      <h4>Status colors</h4>
      <div class="pvl-note">Name the statuses you use; assign them from a card's right-click menu.</div>
      <div class="pvl-statuses">${s.statuses.map((st,i)=>`<div class="pvl-status-row"><span class="pvl-swatch" style="background:${esc(st.color)}"></span><input data-bs-status="${i}" value="${esc(st.label)}" placeholder="Unnamed status"></div>`).join("")}</div>
      <div class="pvl-brow"><button class="mini" id="bsX">Close</button><button class="mini primary" id="bsOK">Save settings</button></div>`,(mc,close)=>{
      mc.querySelector("#bsX").onclick=close;
      mc.querySelector("#bsOK").onclick=()=>{
        s.cardFields=[...mc.querySelectorAll("[data-bs-field]:checked")].map(x=>x.dataset.bsField);
        mc.querySelectorAll("[data-bs-status]").forEach(inp=>{s.statuses[+inp.dataset.bsStatus].label=inp.value.trim()});
        touch(file);close();renderEditor();
      };
    });
  }
  function cardColorMenu(file,card,x,y){
    const items=file.settings.statuses.map(st=>({label:st.label||"Unnamed status",swatch:st.color,fn:()=>{card.color=st.color;touch(file);renderEditor()}}));
    items.push({sep:1},{label:"Clear color",fn:()=>{card.color="";touch(file);renderEditor()}},{label:"Name these statuses…",fn:()=>openBoardSettings(file)});
    openMenu(x,y,items);
  }
  function columnMenu(file,col,depth,x,y){
    const items=[];
    if(!(col.children||[]).length&&depth<M.KANBAN_MAX_SPLIT_DEPTH)items.push({label:"Split into sub-columns",fn:()=>{
      const a=promptText("First sub-column name",col.title+" · 1");if(a===null)return;
      const b=promptText("Second sub-column name",col.title+" · 2");if(b===null)return;
      if(M.splitColumn(file,col.id,a,b)){touch(file);renderEditor()}
    }});
    if((col.children||[]).length)items.push({label:"Merge sub-columns back",fn:()=>{if(M.unsplitColumn(file,col.id)){touch(file);renderEditor()}}});
    items.push({label:col.collapsed?"Expand":"Collapse",fn:()=>{col.collapsed=!col.collapsed;touch(file);renderEditor()}});
    const siblings=depth===0?file.columns:M.findColumn(file,col.id)?.parent?.children;
    const i=siblings?siblings.indexOf(col):-1;
    if(i>0)items.push({label:"Move left",fn:()=>{M.move(siblings,i,i-1);touch(file);renderEditor()}});
    if(siblings&&i>=0&&i<siblings.length-1)items.push({label:"Move right",fn:()=>{M.move(siblings,i,i+1);touch(file);renderEditor()}});
    items.push({sep:1},{label:"Delete column",cls:"danger",fn:()=>{
      if(M.columnCardCount(col)){toast("Move or delete this column's cards first");return}
      if(depth===0&&file.columns.length===1){toast("A board needs at least one column");return}
      const arr=depth===0?file.columns:M.findColumn(file,col.id).parent.children;
      arr.splice(arr.indexOf(col),1);
      // A split column whose last sub-column is deleted renders as a leaf again.
      touch(file);renderEditor();
    }});
    openMenu(x,y,items);
  }
  function wireKanban(file){
    $("addColumn").onclick=()=>{const title=promptText("Column title","New column");if(title){file.columns.push(M.normalizeColumn({title,cards:[]},0));touch(file);renderEditor()}};
    $("boardSettings").onclick=()=>openBoardSettings(file);
    $("board").querySelectorAll("[data-column]").forEach(el=>{
      const hit=M.findColumn(file,el.dataset.column);if(!hit)return;
      const{col,depth}=hit;
      el.querySelector("[data-col-collapse]")?.addEventListener("click",e=>{e.stopPropagation();col.collapsed=true;touch(file);renderEditor()});
      el.querySelector("[data-col-expand]")?.addEventListener("click",e=>{e.stopPropagation();col.collapsed=false;touch(file);renderEditor()});
      const title=el.querySelector("[data-column-title]");
      if(title&&title.closest("[data-column]")===el)title.onchange=e=>{col.title=e.target.value.trim()||"Column";touch(file)};
      const menuBtn=el.querySelector("[data-col-menu]");
      if(menuBtn&&menuBtn.closest("[data-column]")===el)menuBtn.addEventListener("click",e=>{e.stopPropagation();const r=menuBtn.getBoundingClientRect();columnMenu(file,col,depth,r.left,r.bottom+3)});
      if(el.classList.contains("collapsed"))el.addEventListener("dblclick",()=>{col.collapsed=false;touch(file);renderEditor()});
      const add=()=>{const input=el.querySelector("[data-card-new]");if(!input)return;const text=input.value.trim();if(!text)return;col.cards.push(M.normalizeCard({text}));touch(file);renderEditor()};
      const addBtn=el.querySelector("[data-card-add]");
      if(addBtn&&addBtn.closest("[data-column]")===el){addBtn.onclick=add;el.querySelector("[data-card-new]").onkeydown=e=>{if(e.key==="Enter")add()}}
    });
    $("board").querySelectorAll("[data-card]").forEach(el=>{
      const hit=M.findCard(file,el.dataset.card);if(!hit)return;
      const{card,col}=hit;
      el.ondragstart=e=>{e.dataTransfer.setData("text/pv-list-card",card.id);e.dataTransfer.effectAllowed="move";el.classList.add("dragging")};
      el.ondragend=()=>el.classList.remove("dragging");
      el.querySelector("[data-card-text]").onchange=e=>{card.text=e.target.value;touch(file)};
      el.querySelector("[data-card-del]").onclick=()=>{col.cards.splice(col.cards.indexOf(card),1);touch(file);renderEditor()};
      el.querySelector("[data-card-open]")?.addEventListener("click",()=>openCardDetails(file,card));
      el.addEventListener("contextmenu",e=>{e.preventDefault();cardColorMenu(file,card,e.clientX,e.clientY)});
    });
    $("board").querySelectorAll("[data-drop-column]").forEach(zone=>{
      zone.ondragover=e=>{if(![...e.dataTransfer.types].includes("text/pv-list-card"))return;e.preventDefault();zone.classList.add("over")};
      zone.ondragleave=()=>zone.classList.remove("over");
      zone.ondrop=e=>{
        e.preventDefault();zone.classList.remove("over");
        const id=e.dataTransfer.getData("text/pv-list-card");if(!id)return;
        const cards=[...zone.querySelectorAll("[data-card]:not(.dragging)")];
        let at=cards.length;
        for(let i=0;i<cards.length;i++){const r=cards[i].getBoundingClientRect();if(e.clientY<r.top+r.height/2){at=i;break}}
        if(M.moveCard(file,id,zone.dataset.dropColumn,at)){save();renderEditor()}
      };
    });
  }

  function renderEditor(){
    const file=current(),ed=$("editor");if(!file){ed.className="editor hidden";ed.innerHTML='<div class="empty">Choose a file or create one.</div>';return}ed.className="editor";
    const body=file.type==="kanban"?kanbanHtml(file):file.type==="sticky"?stickyHtml(file):itemRows(file);
    ed.innerHTML=`<div class="editor-head"><button id="mobileBack" class="mini">← Files</button><input id="titleInput" class="editor-title" value="${esc(file.title)}"><span class="file-type">${esc(TYPE_LABEL[file.type])}</span></div><div class="editor-body">${body}</div>`;
    $("titleInput").onchange=e=>{file.title=e.target.value.trim()||"Untitled";touch(file);renderFiles()};$("mobileBack").onclick=()=>{fileId="";renderEditor()};
    if(file.type==="kanban")wireKanban(file);else if(file.type==="sticky")wireStickies(file);else wireItems(file);
  }
  function render(){renderFolders();renderFiles();renderEditor()}
  $("newFolder").onclick=()=>{const name=promptText("New folder name");if(!name)return;folder().children.push({id:M.uid("lf"),name,children:[],prompts:[],color:""});save();render()};
  $("newFile").onclick=()=>{const type=$("newType").value,title=promptText(`Name this ${TYPE_LABEL[type]}`,TYPE_LABEL[type]);if(!title)return;const file=M.createFile(type,title);folder().prompts.push(file);fileId=file.id;save();render()};
  $("backBtn").onclick=()=>{if(history.length>1)history.back();else location.href="sidepanel.html?tab=lists"};
  $("closeBtn").onclick=()=>{window.close();setTimeout(()=>location.href="sidepanel.html?tab=lists",100)};
  window.addEventListener("keydown",e=>{if(e.key==="Escape"&&fileId&&!e.target.matches("input,textarea,select")){fileId="";renderEditor()}});
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==="local"&&changes[M.KEY]&&!saveTimer){store=M.normalizeStore(M.clone(changes[M.KEY].newValue));render()}});
  chrome.storage.local.get([M.KEY],res=>{
    store=M.normalizeStore(M.clone(res[M.KEY]));
    // Deep link from the side panel tree: fullview-lists.html?file=<id> lands
    // directly on that file, with its folder selected.
    try{
      const want=new URLSearchParams(location.search).get("file");
      const hit=want?M.findFile(store.folders,want):null;
      if(hit){folderId=hit.folder.id;fileId=hit.file.id}
    }catch(e){/* deep link is best-effort */}
    render();
  });
})();
