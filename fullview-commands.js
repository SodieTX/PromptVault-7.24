// Prompt Vault — Claude Commands full-screen reader.
// The bundled catalog is immutable; user favorites, custom commands, folders,
// nested trees, and ordered playlists live in pv_cfg and are portable with backups.
(function(){
  "use strict";
  const DATA=(typeof PV_CLAUDE_COMMANDS!=="undefined"&&PV_CLAUDE_COMMANDS)||{groups:[],meta:{}};
  const GROUPS=Array.isArray(DATA.groups)?DATA.groups:[];
  const FLAT=[];
  let CFG={};
  const state={q:"",g:"",scope:"all"};
  const $=id=>document.getElementById(id);
  const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
  const keyOf=c=>c&&c._custom&&c.key?c.key:((c?._group||"")+"|"+(c?.name||""));
  const folders=()=>Array.isArray(CFG.ccFolders)?CFG.ccFolders:[];
  const favorites=()=>Array.isArray(CFG.ccFav)?CFG.ccFav:[];
  const folderHas=(id,key)=>!!folders().find(f=>f.id===id)?.items?.includes(key);

  GROUPS.forEach(g=>(g.commands||[]).forEach(c=>FLAT.push(Object.assign({_group:g.name,_icon:g.icon||""},c))));

  let toastTimer=null;
  function toast(msg){const t=$("toast");if(!t)return;t.textContent=msg;t.classList.add("on");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("on"),1600)}
  function copy(text,label){
    const done=()=>toast("Copied "+(label||"command")+" — paste into Claude");
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(done).catch(fallback);else fallback();
    function fallback(){try{const ta=document.createElement("textarea");ta.value=text;ta.style.cssText="position:fixed;opacity:0";document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();done()}catch{toast("Copy failed")}}
  }
  function persist(){chrome.storage.local.set({pv_cfg:CFG})}
  function toggleFavorite(c){const key=keyOf(c),list=favorites(),i=list.indexOf(key);if(i>=0)list.splice(i,1);else list.push(key);CFG.ccFav=list;persist();renderNav();renderContent();toast(i>=0?"Removed from favorites":"Added to favorites")}
  function matches(c){
    if(state.scope==="fav"&&!favorites().includes(keyOf(c)))return false;
    if(state.scope!=="all"&&state.scope!=="fav"&&!folderHas(state.scope,keyOf(c)))return false;
    if(state.g&&c._group!==state.g)return false;
    if(!state.q)return true;
    const q=state.q;
    return(c.name||"").toLowerCase().includes(q)||(c.description||"").toLowerCase().includes(q)||(c._group||"").toLowerCase().includes(q)||(c.inject||"").toLowerCase().includes(q)||(c.example||"").toLowerCase().includes(q)||(c.tags||[]).some(t=>String(t).toLowerCase().includes(q));
  }
  function renderMeta(){const note=DATA.meta?.note||"Master cheat sheet";$("meta").textContent=FLAT.length+" commands · "+GROUPS.length+" groups · "+note}
  function treeHtml(parentId="",depth=0){
    return folders().filter(f=>(f.parentId||"")===parentId).map(f=>`<div class="nav-item${state.scope===f.id?' sel':''}" data-scope="${esc(f.id)}" style="padding-left:${10+depth*14}px"><span class="ico">${f.kind==='playlist'?'▶':'📁'}</span><span class="nm">${esc(f.name)}</span><span class="ct">${(f.items||[]).length}</span></div>${treeHtml(f.id,depth+1)}`).join("");
  }
  function renderNav(){
    const nav=$("nav");
    let h='<div class="nav-title">Claude Tools / Commands</div>';
    h+=`<div class="nav-item${state.scope==='all'?' sel':''}" data-scope="all"><span class="ico">⌨</span><span class="nm">All commands</span><span class="ct">${FLAT.length}</span></div>`;
    h+=`<div class="nav-item${state.scope==='fav'?' sel':''}" data-scope="fav"><span class="ico">★</span><span class="nm">Favorites</span><span class="ct">${favorites().length}</span></div>${treeHtml()}`;
    h+='<div class="nav-title" style="margin-top:12px">Groups</div>';
    h+=`<div class="nav-item${state.g?'':' sel'}" data-g=""><span class="ico">✦</span><span class="nm">All groups</span></div>`;
    GROUPS.forEach(g=>{h+=`<div class="nav-item${state.g===g.name?' sel':''}" data-g="${esc(g.name)}"><span class="ico">${esc(g.icon||'•')}</span><span class="nm">${esc(g.name)}</span><span class="ct">${(g.commands||[]).length}</span></div>`});
    nav.innerHTML=h;
    nav.querySelectorAll("[data-scope]").forEach(el=>el.addEventListener("click",()=>{state.scope=el.dataset.scope||"all";renderNav();renderContent()}));
    nav.querySelectorAll("[data-g]").forEach(el=>el.addEventListener("click",()=>{state.g=el.dataset.g||"";renderNav();renderContent()}));
  }
  function cardHtml(c,i){
    const ex=c.example?`<div class="ex"><b>e.g.</b><code>${esc(c.example)}</code></div>`:"";
    const tags=(c.tags||[]).length?`<div class="tags">${c.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>`:"";
    const fav=favorites().includes(keyOf(c));
    return `<div class="card" data-i="${i}" title="Click to copy"><div class="card-hd"><button class="star${fav?' on':''}" data-star="${i}" title="${fav?'Remove favorite':'Favorite'}">${fav?'★':'☆'}</button><code class="cmd">${esc(c.name)}</code><button class="copy" data-i="${i}">Copy</button></div>${c.description?`<div class="desc">${esc(c.description)}</div>`:""}${ex}${tags}</div>`;
  }
  function wireCards(el){
    el.querySelectorAll(".card").forEach(card=>card.addEventListener("click",e=>{
      const star=e.target.closest("[data-star]");if(star){e.stopPropagation();toggleFavorite(FLAT[+star.dataset.star]);return}
      const btn=e.target.closest(".copy"),idx=+((btn&&btn.dataset.i)||card.dataset.i),c=FLAT[idx];if(c)copy(c.inject||"",c.name);
    }));
  }
  function renderContent(){
    const el=$("content"),shown=[];FLAT.forEach((c,i)=>{if(matches(c))shown.push(i)});
    if(!shown.length){el.innerHTML=`<div class="empty">No commands match “${esc(state.q)}”.</div>`;return}
    let h='<div class="hint">Favorite commands with ☆, browse your command tree, or open an ordered playlist. Click any card to copy it.</div>';
    const container=folders().find(f=>f.id===state.scope);
    if(container){
      const order=new Map((container.items||[]).map((k,i)=>[k,i]));shown.sort((a,b)=>(order.get(keyOf(FLAT[a]))??99999)-(order.get(keyOf(FLAT[b]))??99999));
      h+=`<div class="section"><div class="sec-hd"><span class="ico">${container.kind==='playlist'?'▶':'📁'}</span> ${esc(container.name)} <span class="ct">${shown.length}</span></div><div class="grid">${shown.map(i=>cardHtml(FLAT[i],i)).join("")}</div></div>`;
    }else{
      const names=[...new Set(shown.map(i=>FLAT[i]._group))];
      names.forEach(name=>{const items=shown.filter(i=>FLAT[i]._group===name);if(!items.length)return;const group=GROUPS.find(g=>g.name===name);h+=`<div class="section"><div class="sec-hd"><span class="ico">${esc(group?.icon||'✎')}</span> ${esc(name)} <span class="ct">${items.length}</span></div><div class="grid">${items.map(i=>cardHtml(FLAT[i],i)).join("")}</div></div>`});
    }
    el.innerHTML=h;wireCards(el);
  }
  function start(){
    $("exit")?.addEventListener("click",()=>{if(history.length>1)history.back();else window.close()});
    if(!FLAT.length){$("content").innerHTML='<div class="empty">No command data loaded.</div>';return}
    renderMeta();renderNav();renderContent();const s=$("srch");s.addEventListener("input",e=>{state.q=(e.target.value||"").toLowerCase().trim();renderContent()});s.focus();
  }
  function init(){chrome.storage.local.get(["pv_cfg"],res=>{CFG=res.pv_cfg||{};CFG.ccFav=Array.isArray(CFG.ccFav)?CFG.ccFav:[];CFG.ccFolders=Array.isArray(CFG.ccFolders)?CFG.ccFolders:[];(Array.isArray(CFG.ccCustom)?CFG.ccCustom:[]).forEach(c=>FLAT.push(Object.assign({},c,{_group:c.group||"My Commands",_icon:"✎",_custom:true})));start()})}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
