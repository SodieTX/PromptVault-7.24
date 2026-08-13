// Prompt Vault v7 — Content Script + Command Palette
(function(){
  "use strict";
  if(window._pvContentInit)return;
  window._pvContentInit=true;

  // ═══════ Input Detection (uses adapters.js registry) ═══════
  const _platform=typeof pvDetectPlatform==="function"?pvDetectPlatform(location.href):"";
  const S=typeof pvGetInputSelectors==="function"?pvGetInputSelectors(_platform):(typeof PV_INPUT_SELECTORS!=="undefined"?PV_INPUT_SELECTORS:['div.ProseMirror[contenteditable="true"]','#prompt-textarea','textarea[placeholder*="Ask"]','div[contenteditable="true"]']);
  function find(){
    // Try platform-specific selectors first
    for(const s of S){try{const e=document.querySelector(s);if(e&&vis(e))return e}catch{}}
    // Fallback: any visible textarea
    for(const t of document.querySelectorAll("textarea"))if(vis(t))return t;
    // Fallback: any visible contenteditable with reasonable size
    for(const e of document.querySelectorAll('[contenteditable="true"]'))if(vis(e)&&e.offsetHeight>30)return e;
    // Last resort: any contenteditable at all
    for(const e of document.querySelectorAll('[contenteditable="true"]'))if(vis(e))return e;
    return null;
  }
  function vis(e){if(!e)return false;const r=e.getBoundingClientRect(),s=window.getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=="none"&&s.visibility!=="hidden"&&s.opacity!=="0"}
  function injectText(e,t){
    return new Promise(resolve=>{
      e.focus();
      // Wait two frames so the framework finishes processing focus before we write.
      requestAnimationFrame(()=>{requestAnimationFrame(()=>{
        const isField=e.tagName==="TEXTAREA"||e.tagName==="INPUT";
        const readVal=()=>isField?(e.value||""):(e.innerText||e.textContent||"");
        // VERIFY the text actually committed (handles huge/multi-line; tolerant of
        // whitespace reflow by frameworks like ProseMirror). No more false "success".
        const norm=s=>String(s||"").replace(/\s+/g," ").trim();
        const landed=()=>{
          const nv=norm(readVal()),nt=norm(t);
          if(!nt)return true;
          // Require the actual text (a real prefix of it) in the field.
          // A bare length heuristic false-positives on pre-existing drafts.
          return nv.indexOf(nt.slice(0,Math.min(nt.length,48)))!==-1;
        };
        // Put a caret inside e with everything selected, so a write replaces existing content.
        const selectAllIn=()=>{try{const s=window.getSelection(),r=document.createRange();r.selectNodeContents(e);s.removeAllRanges();s.addRange(r);}catch(_){}};
        const clearCE=()=>{selectAllIn();try{document.execCommand("delete",false,null)}catch(_){}};

        // --- strategies (each returns after attempting; landed() decides) ---
        const setField=()=>{try{
          const proto=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
          const setter=Object.getOwnPropertyDescriptor(proto,"value")?.set;
          if(setter)setter.call(e,t);else e.value=t;
          e.dispatchEvent(new Event("input",{bubbles:true}));
          e.dispatchEvent(new Event("change",{bubbles:true}));
        }catch(_){}};
        // PASTE: ProseMirror / Lexical / Tiptap honor a real paste event natively.
        // This is the reliable path that execCommand was failing on Claude/ChatGPT.
        const viaPaste=()=>{try{
          clearCE();
          const dt=new DataTransfer();dt.setData("text/plain",t);
          const ev=new ClipboardEvent("paste",{clipboardData:dt,bubbles:true,cancelable:true});
          return e.dispatchEvent(ev);
        }catch(_){return false}};
        const viaExec=()=>{try{selectAllIn();document.execCommand("selectAll",false,null);return document.execCommand("insertText",false,t);}catch(_){return false}};
        const viaBeforeInput=()=>{try{
          clearCE();
          e.dispatchEvent(new InputEvent("beforeinput",{inputType:"insertFromPaste",data:t,bubbles:true,cancelable:true}));
          e.dispatchEvent(new InputEvent("input",{inputType:"insertFromPaste",data:t,bubbles:true}));
          return true;
        }catch(_){return false}};
        const viaDom=()=>{try{
          if(isField){e.value=t;}
          else{e.textContent="";const frag=document.createDocumentFragment();t.split("\n").forEach(l=>{const p=document.createElement("p");p.textContent=l||"\u200B";frag.appendChild(p)});e.appendChild(frag);}
          e.dispatchEvent(new InputEvent("input",{bubbles:true,inputType:"insertText",data:t}));
          return true;
        }catch(_){return false}};

        let ok=false;
        try{
          if(isField){
            setField(); ok=landed();
            if(!ok){ viaBeforeInput(); ok=landed(); }
            if(!ok){ viaDom(); ok=landed(); }
          }else{
            // contenteditable: paste first (best for framework editors), then escalate.
            viaPaste(); ok=landed();
            if(!ok){ viaExec(); ok=landed(); }
            if(!ok){ viaBeforeInput(); ok=landed(); }
            if(!ok){ viaDom(); ok=landed(); }
          }
          // caret to end
          try{if(!isField){const r2=document.createRange(),s2=window.getSelection();r2.selectNodeContents(e);r2.collapse(false);s2.removeAllRanges();s2.addRange(r2);}}catch(_){}
          e.focus();
          if(ok){const o=e.style.outline,ot=e.style.transition;e.style.transition="outline .15s";e.style.outline="2px solid #c9a45c";setTimeout(()=>{e.style.outline=o;e.style.transition=ot},600);}
        }catch(err){console.error("PV inject error:",err);ok=landed();}
        // Honest result: true only if the text is verifiably in the field.
        resolve(ok);
      })});
    });
  }

  // ═══════ Last Injected Prompt Tracking (for Response Capture auto-linking) ═══════
  let lastInjectedPromptId=null;

  // ═══════ Right-click visual discovery ═══════
  // Chrome only labels literal <img> clicks as an "image" context. Remember the
  // actual page target so Prompt Vault can also save CSS backgrounds, canvases,
  // SVGs, video posters, and screenshot-crop fallbacks.
  let pvLastVisualTarget=null;
  document.addEventListener("contextmenu",e=>{pvLastVisualTarget=e.target instanceof Element?e.target:null},true);
  function pvVisualRect(el){const b=el?.getBoundingClientRect?.();if(!b||b.width<2||b.height<2)return null;const x=Math.max(0,b.left),y=Math.max(0,b.top),right=Math.min(innerWidth,b.right),bottom=Math.min(innerHeight,b.bottom);if(right-x<2||bottom-y<2)return null;return{x,y,width:right-x,height:bottom-y,dpr:devicePixelRatio||1}}
  function pvContextVisual(){
    const target=pvLastVisualTarget;if(!target)return{rect:{x:0,y:0,width:innerWidth,height:innerHeight,dpr:devicePixelRatio||1},title:document.title||"Visible page"};
    const visualScope=target.closest?.("figure,picture,[role='img']");
    const img=target.closest?.("img")||visualScope?.querySelector?.("img");
    if(img){const url=img.currentSrc||img.src||"";if(url)return{url,title:img.alt||img.title||document.title||"Image",rect:pvVisualRect(img)}}
    const video=target.closest?.("video")||visualScope?.querySelector?.("video");
    if(video?.poster)return{url:video.poster,title:video.title||document.title||"Video poster",rect:pvVisualRect(video)};
    const canvas=target.closest?.("canvas")||visualScope?.querySelector?.("canvas");
    if(canvas){try{const dataUrl=canvas.toDataURL("image/png");if(dataUrl&&dataUrl!=="data:,")return{url:dataUrl,title:canvas.getAttribute("aria-label")||document.title||"Canvas image",rect:pvVisualRect(canvas)}}catch{/* A tainted canvas is captured from the visible tab instead. */}return{rect:pvVisualRect(canvas),title:canvas.getAttribute("aria-label")||document.title||"Canvas image"}}
    const svg=target.closest?.("svg")||visualScope?.querySelector?.("svg");
    if(svg){try{const xml=new XMLSerializer().serializeToString(svg),url="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(xml);return{url,title:svg.getAttribute("aria-label")||document.title||"SVG image",rect:pvVisualRect(svg)}}catch{/* Fall through to the screenshot crop. */}}
    let el=target;
    for(let i=0;el&&i<5;i++,el=el.parentElement){const bg=getComputedStyle(el).backgroundImage||"",m=bg.match(/url\((['"]?)(.*?)\1\)/);if(m?.[2])return{url:m[2],title:el.getAttribute("aria-label")||el.title||document.title||"Background image",rect:pvVisualRect(el)}}
    const fallback=target.closest?.("figure,[role='img'],picture")||target;
    return{rect:pvVisualRect(fallback),title:fallback.getAttribute?.("aria-label")||fallback.getAttribute?.("alt")||fallback.title||document.title||"Visible visual"};
  }

  // ═══════ Message Listener (sidebar inject) ═══════
  chrome.runtime.onMessage.addListener((m,_,r)=>{
    if(m.type==="INJECT_PROMPT"){
      if(m.promptId)lastInjectedPromptId=m.promptId;
      // Try with retries — dynamic UIs (Perplexity, Gemini) may not have input ready immediately
      let attempts=0;const maxAttempts=4;const retryDelay=400;
      function tryInject(){
        attempts++;
        const f=find();
        console.log("[PV] Inject attempt",attempts+"/"+maxAttempts+":",_platform||"unknown","| Found:",!!f,f?f.tagName+"."+f.className.slice(0,40):"none","| URL:",location.hostname);
        if(f){
          injectText(f,m.text).then(ok=>{console.log("[PV] Inject result:",ok);r({success:ok})});
        }else if(attempts<maxAttempts){
          setTimeout(tryInject,retryDelay);
        }else{
          console.warn("[PV] No input found after",maxAttempts,"attempts. Selectors:",S);
          r({success:false,error:"No input found"});
        }
      }
      tryInject();
      return true; // async response
    }
    if(m.type==="GET_CONTEXT_VISUAL"){r(pvContextVisual());return false}
    if(m.type==="OPEN_PALETTE"){openPalette();r({success:true});return false}
    return false;
  });

  function pvPageToast(msg,isErr){
    let t=document.getElementById("_pvToast");
    if(!t){
      t=document.createElement("div");
      t.id="_pvToast";
      t.setAttribute("role","status");
      t.style.cssText="position:fixed;bottom:28px;left:50%;transform:translateX(-50%);max-width:min(420px,92vw);padding:12px 18px;border-radius:10px;font:13px/1.4 system-ui,-apple-system,sans-serif;z-index:2147483646;box-shadow:0 8px 32px rgba(0,0,0,.4);pointer-events:none;opacity:0;transition:opacity .2s ease";
      document.documentElement.appendChild(t);
    }
    t.textContent=msg;
    t.style.background=isErr?"#2a181c":"#151d18";
    t.style.color=isErr?"#f2c6c6":"#c8e6c9";
    t.style.border="1px solid "+(isErr?"#6b3038":"#3d5c3d");
    requestAnimationFrame(()=>{t.style.opacity="1"});
    clearTimeout(t._pvHide);
    t._pvHide=setTimeout(()=>{t.style.opacity="0"},isErr?5200:3400);
  }

  // ═══════ COMMAND PALETTE (search + recents + launcher) ═══════
  let paletteHost=null,paletteShadow=null,paletteOpen=false;
  let allPrompts=[],filteredPrompts=[],paletteItems=[],recentResolved=[];
  let selIdx=0,varMode=false,varPrompt=null;

  const PLAT_ICONS={anthropic:"🟤",openai:"🟢",google:"🔵",xai:"⚫",perplexity:"🟣",mistral:"🟠",deepseek:"🔷",meta:"🔹",copilot:"🔶",poe:"🟡",hugging:"🤗",cohere:"⬜",other:"⬛"};

  const PALETTE_ACTIONS=[
    {label:"Open Prompt Vault",hint:"Side panel",icon:"\ud83d\udcc2",run(){chrome.runtime.sendMessage({type:"OPEN_SIDEPANEL"});closePalette()}},
    {label:"Quick clip to Inbox",hint:"Alt+Shift+C",icon:"\u2702",run(){chrome.runtime.sendMessage({type:"QUICK_CLIP_CURRENT_TAB"});closePalette()}},
    {label:"Run Drive backup now",hint:"Force upload",icon:"\u2601",run(){closePalette();chrome.runtime.sendMessage({type:"RUN_DRIVE_PUSH",force:true},res=>{if(chrome.runtime.lastError){pvPageToast(chrome.runtime.lastError.message,true);return}if(res&&!res.ok&&res.error)pvPageToast(res.error,true);else if(res&&res.ok)pvPageToast(res.skipped?"Google Drive is not connected — open Prompt Vault → Settings.":"Backed up to Google Drive");else pvPageToast("Backup finished — open Prompt Vault if something looks wrong.",false)})}}
  ];

  function allItemsFromTree(n,l=[]){
    for(const p of(n.prompts||[]))l.push({...p,folderName:n.name,folderId:n.id});
    for(const c of(n.children||[]))allItemsFromTree(c,l);
    return l;
  }

  function extractVars(text){
    const m=(text||"").match(/\{\{([^}]+)\}\}/g);
    return m?[...new Set(m.filter(x=>!x.startsWith("{{ref:")).map(x=>x.slice(2,-2).trim()))]:[];
  }
  function parseVarDef(raw){const ci=raw.indexOf(":");if(ci<0)return{label:raw,raw,type:"text",options:null};
    const label=raw.slice(0,ci).trim(),after=raw.slice(ci+1);
    if(after.trim()==="+long")return{label,raw,type:"long",options:null};
    if(after.startsWith("+multi:")){const opts=after.slice(7).split("|").map(o=>o.trim()).filter(Boolean);return{label,raw,type:"multi",options:opts}}
    if(!after.includes("|"))return{label:raw,raw,type:"text",options:null};
    return{label,raw,type:"dropdown",options:after.split("|").map(o=>o.trim()).filter(Boolean)}}

  function fuzzy(q,text){
    if(!q)return true;
    const ql=q.toLowerCase(),tl=text.toLowerCase();
    if(tl.includes(ql))return true;
    // Simple fuzzy: all chars appear in order
    let j=0;for(let i=0;i<tl.length&&j<ql.length;i++)if(tl[i]===ql[j])j++;
    return j===ql.length;
  }

  function loadPrompts(cb){
    chrome.storage.local.get(["pv_p","pv_s","pv_cfg","pv_recent_activity"],res=>{
      const P=res.pv_p,SN=res.pv_s;
      allPrompts=[];
      if(P?.folders)allItemsFromTree(P.folders).forEach(p=>{p._src="prompt";allPrompts.push(p)});
      if(SN?.folders)allItemsFromTree(SN.folders).forEach(p=>{p._src="clip";allPrompts.push(p)});
      allPrompts.sort((a,b)=>{
        if(a.favorited&&!b.favorited)return -1;if(!a.favorited&&b.favorited)return 1;
        if((b.usageCount||0)!==(a.usageCount||0))return(b.usageCount||0)-(a.usageCount||0);
        return(b.modified||0)-(a.modified||0);
      });
      recentResolved=[];
      for(const e of (res.pv_recent_activity||[])){
        if(recentResolved.length>=10)break;
        if(!e||!e.id)continue;
        const store=e.kind==="clip"?SN:P;
        if(!store?.folders)continue;
        const fold=findInTree(store.folders,e.folderId);
        const pr=fold?.prompts?.find(x=>x.id===e.id);
        if(pr)recentResolved.push({...pr,folderId:e.folderId||fold.id,folderName:fold.name,_src:e.kind==="clip"?"clip":"prompt",_recentTag:(e.action||"opn").slice(0,4)});
      }
      if(cb)cb();
    });
  }

  function filterPrompts(q){
    let tagF="",platF="",qrest=(q||"").trim();
    const tgm=qrest.match(/\btag:([^\s]+)/i);
    const plm=qrest.match(/\bplatform:([^\s]+)/i);
    if(tgm){tagF=tgm[1].toLowerCase();qrest=qrest.replace(tgm[0]," ").replace(/\s+/g," ").trim()}
    if(plm){platF=plm[1].toLowerCase();qrest=qrest.replace(plm[0]," ").replace(/\s+/g," ").trim()}
    const test=p=>{
      if(tagF&&!(p.tags||[]).some(t=>(t||"").toLowerCase().includes(tagF)))return false;
      if(platF){const pid=(p.platform||"").toLowerCase();if(!pid.includes(platF))return false}
      if(!qrest)return true;
      return fuzzy(qrest,p.title)||fuzzy(qrest,p.content||"")||(p.tags||[]).some(t=>fuzzy(qrest,t))||fuzzy(qrest,p.folderName||"")||fuzzy(qrest,p.platform||"");
    };
    if(!qrest&&!tagF&&!platF){filteredPrompts=allPrompts.filter(test).slice(0,45);return}
    filteredPrompts=allPrompts.filter(test).slice(0,50);
  }

  function rebuildPaletteItems(query){
    paletteItems=[];
    const qt=(query||"").trim();
    const actionMode=qt.startsWith(">");
    const qAct=actionMode?qt.slice(1).trim().toLowerCase():"";
    if(actionMode){
      PALETTE_ACTIONS.forEach(a=>{
        if(qAct&&!a.label.toLowerCase().includes(qAct)&&!(a.hint&&a.hint.toLowerCase().includes(qAct)))return;
        paletteItems.push({kind:"act",act:a});
      });
      if(!paletteItems.length)paletteItems.push({kind:"empty"});
      return;
    }
    if(!qt){
      PALETTE_ACTIONS.forEach(a=>paletteItems.push({kind:"act",act:a}));
      recentResolved.forEach(p=>paletteItems.push({kind:"recent",p}));
    }
    filterPrompts(qt);
    const skip=new Set();
    if(!qt)recentResolved.forEach(p=>skip.add(p.id));
    filteredPrompts.forEach(p=>{if(!skip.has(p.id))paletteItems.push({kind:"prompt",p})});
    if(!paletteItems.length)paletteItems.push({kind:"empty"});
  }

  // ═══════ Palette UI (Shadow DOM) ═══════
  const CSS=`
    *{box-sizing:border-box;margin:0;padding:0}
    :host{position:fixed;inset:0;z-index:2147483647;display:flex;justify-content:center;padding-top:min(15vh,120px);font-family:'Segoe UI',-apple-system,sans-serif;font-size:13px}
    .bg{position:absolute;inset:0;background:rgba(0,0,0,.45)}
    .pal{position:relative;width:560px;max-height:70vh;background:#1f1f25;border:1px solid #2c2c38;border-radius:10px;box-shadow:0 16px 48px rgba(0,0,0,.6);display:flex;flex-direction:column;overflow:hidden;color:#e4e2dc}
    .pal-hdr{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid #252530}
    .pal-hdr .bolt{width:20px;height:20px;border-radius:5px;background:linear-gradient(135deg,#c9a45c,#8a6d3b);display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .pal-hdr .bolt svg{width:10px;height:10px;stroke:#18181c;fill:none;stroke-width:2.5}
    .pal-hdr input{flex:1;background:transparent;border:none;color:#e4e2dc;font-size:14px;outline:none;font-family:inherit}
    .pal-hdr input::placeholder{color:#55535e}
    .pal-hdr .hint{font-size:9px;color:#55535e;white-space:nowrap}
    .pal-list{flex:1;overflow-y:auto;padding:4px}
    .pal-list::-webkit-scrollbar{width:5px}.pal-list::-webkit-scrollbar-thumb{background:#2c2c38;border-radius:3px}
    .pi{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;cursor:pointer;transition:background .06s}
    .pi:hover,.pi.sel{background:#272730}
    .pi.sel{outline:1px solid rgba(138,143,153,.25)}
    .pi-icon{font-size:12px;width:18px;text-align:center;flex-shrink:0}
    .pi-info{flex:1;min-width:0}
    .pi-title{font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .pi-meta{font-size:9px;color:#55535e;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .pi-fav{color:#c9a45c;font-size:10px;flex-shrink:0}
    .pi-tags{display:flex;gap:3px;flex-shrink:0}
    .pi-tag{font-size:8px;padding:1px 5px;border-radius:3px;background:rgba(201,164,92,.12);color:#c9a45c}
    .pi-vars{font-size:8px;color:#8a6cc9;flex-shrink:0}
    .pi-act{display:flex;gap:2px;flex-shrink:0;opacity:0;transition:opacity .1s}
    .pi:hover .pi-act{opacity:1}
    .pi-btn{background:none;border:none;color:#55535e;cursor:pointer;padding:2px;display:flex;border-radius:3px}
    .pi-btn:hover{color:#e4e2dc;background:#2e2e3a}
    .empty{text-align:center;padding:24px;color:#55535e;font-size:12px}
    /* Variable form */
    .var-form{padding:12px 14px}
    .var-form h3{font-size:13px;margin-bottom:8px;display:flex;align-items:center;gap:6px}
    .var-form .vf-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
    .var-form .vf-label{font-size:11px;color:#8a6cc9;font-weight:500;width:100px;flex-shrink:0;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .var-form input{flex:1;background:#1a1a20;border:1px solid #2c2c38;border-radius:5px;padding:5px 8px;color:#e4e2dc;font-size:12px;outline:none;font-family:inherit}
    .var-form input:focus{border-color:#8a6cc9}
    .var-form select{flex:1;background:#1a1a20;border:1px solid #2c2c38;border-radius:5px;padding:5px 8px;color:#e4e2dc;font-size:12px;outline:none;font-family:inherit;cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238a8790'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;padding-right:24px}
    .var-form select:focus{border-color:#8a6cc9}
    .var-form select option{background:#1f1f25;color:#e4e2dc}
    .var-form input[data-var-other]{border-color:rgba(138,108,201,.4);color:#8a6cc9}
    .vf-multi-wrap{display:flex;flex-wrap:wrap;gap:4px}
    .vf-cb-pal{display:flex;align-items:center;gap:4px;font-size:11px;cursor:pointer;padding:3px 8px;border-radius:4px;border:1px solid #2c2c38;background:#1a1a20;transition:all .1s}
    .vf-cb-pal:hover{border-color:#55535e}
    .vf-cb-pal input{accent-color:#8a6cc9}
    .vf-cb-pal-other{color:#8a6cc9;border-style:dashed}
    .var-form .vf-acts{display:flex;gap:6px;justify-content:flex-end;margin-top:10px}
    .var-form .vf-btn{padding:5px 14px;border-radius:5px;border:1px solid #2c2c38;background:#272730;color:#e4e2dc;font-size:11px;cursor:pointer;font-family:inherit}
    .var-form .vf-btn:hover{background:#2e2e3a}
    .var-form .vf-btn.primary{background:rgba(138,143,153,.1);border-color:#8a8f99;color:#8a8f99}
    .var-form .vf-btn.primary:hover{background:rgba(138,143,153,.2)}
    .pal-ftr{padding:6px 14px;border-top:1px solid #252530;font-size:9px;color:#55535e;display:flex;gap:12px;flex-wrap:wrap}
    .pal-ftr kbd{background:#272730;border:1px solid #2c2c38;border-radius:3px;padding:0 4px;font-size:9px;font-family:inherit}
    .pi-actrow{border-left:2px solid #5c8ec4}
    .pi-recent{border-left:2px solid #c9a45c}
    .pi-lbl{font-size:8px;color:#55535e;text-transform:uppercase;letter-spacing:.5px;padding:4px 10px 2px}
  `;

  function buildPalette(){
    if(paletteHost)return paletteHost;
    paletteHost=document.createElement("div");
    paletteHost.id="pv-palette-host";
    paletteShadow=paletteHost.attachShadow({mode:"closed"});
    const style=document.createElement("style");style.textContent=CSS;
    paletteShadow.appendChild(style);
    const wrap=document.createElement("div");wrap.id="pv-wrap";
    paletteShadow.appendChild(wrap);
    document.body.appendChild(paletteHost);
    return paletteHost;
  }

  function openPalette(){
    if(paletteOpen){closePalette();return}
    loadPrompts(()=>{
      paletteOpen=true;varMode=false;varPrompt=null;selIdx=0;
      buildPalette();
      const wrap=paletteShadow.getElementById("pv-wrap");
      rebuildPaletteItems("");
      renderPalette(wrap,"");
    });
  }

  function closePalette(){
    paletteOpen=false;varMode=false;varPrompt=null;
    if(paletteHost){paletteHost.remove();paletteHost=null;paletteShadow=null}
  }

  function renderPalette(wrap,query){
    const copyIcon='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

    if(varMode&&varPrompt){
      renderVarForm(wrap);return;
    }

    rebuildPaletteItems(query);
    const n=paletteItems.length;
    if(selIdx>=n)selIdx=Math.max(0,n-1);

    let h=`<div class="bg"></div><div class="pal"><div class="pal-hdr"><div class="bolt"><svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div><input type="text" id="pvInput" placeholder="Search · tag:x · platform:openai · &gt;actions" value="${escH(query)}"><div class="hint">Alt+Shift+V</div></div>`;
    h+='<div class="pal-list" id="pvList">';
    let lastLbl="";
    paletteItems.forEach((row,i)=>{
      if(row.kind==="empty"){h+='<div class="empty">No matches</div>';return}
      if(row.kind==="act"){
        if(lastLbl!=="act"){h+='<div class="pi-lbl">'+(query.trim().startsWith(">")?"Actions":"Actions")+'</div>';lastLbl="act"}
        const a=row.act;
        h+=`<div class="pi pi-actrow ${i===selIdx?'sel':''}" data-idx="${i}"><div class="pi-icon">${escH(a.icon)}</div><div class="pi-info"><div class="pi-title">${escH(a.label)}</div><div class="pi-meta">${escH(a.hint||"")}</div></div></div>`;
        return;
      }
      if(row.kind==="recent"){
        if(lastLbl!=="rec"){h+='<div class="pi-lbl">Recent</div>';lastLbl="rec"}
        const p=row.p;
        const icon=PLAT_ICONS[p.platform]||(p._src==="clip"?"\u2702":"\u26a1");
        const vars=extractVars(p.content);
        h+=`<div class="pi pi-recent ${i===selIdx?'sel':''}" data-idx="${i}">`;
        h+=`<div class="pi-icon">${icon}</div>`;
        h+=`<div class="pi-info"><div class="pi-title">${escH(p.title)}</div><div class="pi-meta">${escH(p._recentTag||"")} \u00b7 ${escH(p.folderName||"")}${p.content?` \u00b7 ${p.content.length}c`:''}</div></div>`;
        if(p.favorited)h+='<div class="pi-fav">\u2605</div>';
        if(vars.length)h+=`<div class="pi-vars">{{${vars.length}}}</div>`;
        h+=`<div class="pi-act"><button class="pi-btn" data-cp="${i}" title="Copy">${copyIcon}</button></div>`;
        h+='</div>';
        return;
      }
      if(row.kind==="prompt"){
        if(lastLbl!=="pr"&&query.trim()){h+='<div class="pi-lbl">Results</div>';lastLbl="pr"}
        const p=row.p;
        const icon=PLAT_ICONS[p.platform]||(p._src==="clip"?"\u2702":"\u26a1");
        const vars=extractVars(p.content);
        h+=`<div class="pi ${i===selIdx?'sel':''}" data-idx="${i}">`;
        h+=`<div class="pi-icon">${icon}</div>`;
        h+=`<div class="pi-info"><div class="pi-title">${escH(p.title)}</div><div class="pi-meta">${escH(p.folderName||"")}${p.content?` \u00b7 ${p.content.length}c`:''}</div></div>`;
        if(p.favorited)h+='<div class="pi-fav">\u2605</div>';
        if(vars.length)h+=`<div class="pi-vars">{{${vars.length}}}</div>`;
        if(p.tags?.length)h+=`<div class="pi-tags">${p.tags.slice(0,2).map(t=>`<span class="pi-tag">${escH(t)}</span>`).join("")}</div>`;
        h+=`<div class="pi-act"><button class="pi-btn" data-cp="${i}" title="Copy">${copyIcon}</button></div>`;
        h+='</div>';
      }
    });
    h+='</div>';
    h+=`<div class="pal-ftr"><span><kbd>&uarr;&darr;</kbd> nav</span><span><kbd>Enter</kbd> inject</span><span><kbd>Tab</kbd> copy</span><span><kbd>&gt;</kbd> actions</span><span><kbd>Esc</kbd> close</span></div>`;
    h+='</div>';
    wrap.innerHTML=h;

    const input=wrap.querySelector("#pvInput");
    const bg=wrap.querySelector(".bg");
    input.focus();

    input.addEventListener("input",()=>{
      selIdx=0;
      renderPalette(wrap,input.value.trim());
    });

    input.addEventListener("keydown",e=>{
      const max=Math.max(0,paletteItems.length-1);
      if(e.key==="ArrowDown"){e.preventDefault();selIdx=Math.min(selIdx+1,max);renderPalette(wrap,input.value.trim())}
      else if(e.key==="ArrowUp"){e.preventDefault();selIdx=Math.max(selIdx-1,0);renderPalette(wrap,input.value.trim())}
      else if(e.key==="Enter"){e.preventDefault();doUse(wrap,selIdx,"inject")}
      else if(e.key==="Tab"){e.preventDefault();doUse(wrap,selIdx,"copy")}
      else if(e.key==="Escape"){closePalette()}
    });

    bg.addEventListener("click",closePalette);

    wrap.querySelectorAll(".pi[data-idx]").forEach(el=>{
      el.addEventListener("click",()=>doUse(wrap,+el.dataset.idx,"inject"));
    });
    wrap.querySelectorAll("[data-cp]").forEach(btn=>{
      btn.addEventListener("click",e=>{e.stopPropagation();doUse(wrap,+btn.dataset.cp,"copy")});
    });

    const selEl=wrap.querySelector(".pi.sel");
    if(selEl)selEl.scrollIntoView({block:"nearest"});
  }

  function paletteNotifyLastInject(p){
    if(!p||!p.id)return;
    lastInjectedPromptId=p.id;
    try{chrome.runtime.sendMessage({type:"RECORD_LAST_INJECT",promptId:p.id,folderId:p.folderId||""})}catch{}
  }

  function doUse(wrap,idx,action){
    const row=paletteItems[idx];
    if(!row||row.kind==="empty")return;
    if(row.kind==="act"){row.act.run();return}
    const p=row.p;
    const vars=extractVars(p.content);
    bumpUsage(p);
    if(vars.length){
      varMode=true;varPrompt={...p,_action:action};
      renderVarForm(wrap);return;
    }
    if(action==="inject"){
      const f=find();
      closePalette();
      if(f){
        injectText(f,p.content).then(ok=>{if(ok)paletteNotifyLastInject(p)});
      }else{
        navigator.clipboard.writeText(p.content||"");
      }
    }else{
      navigator.clipboard.writeText(p.content||"").then(()=>closePalette());
    }
  }

  function renderVarForm(wrap){
    const p=varPrompt;
    const vars=extractVars(p.content);
    let h=`<div class="bg"></div><div class="pal"><div class="var-form"><h3>⚡ ${escH(p.title)}</h3>`;
    vars.forEach((v,i)=>{
      const d=parseVarDef(v);
      if(d.type==="dropdown"){
        h+=`<div class="vf-row"><div class="vf-label">{{${escH(d.label)}}}</div><div style="flex:1;display:flex;flex-direction:column;gap:3px"><select data-var="${escH(v)}" data-vi="${i}">${d.options.map(o=>`<option value="${escH(o)}">${escH(o)}</option>`).join("")}<option value="_pv_other_">Other…</option></select><input type="text" data-var-other="${escH(v)}" data-vi="${i}" placeholder="Custom value…" style="display:none"></div></div>`;
      }else if(d.type==="multi"){
        h+=`<div class="vf-row" style="align-items:flex-start"><div class="vf-label" style="padding-top:2px">{{${escH(d.label)}}}</div><div style="flex:1;display:flex;flex-direction:column;gap:2px"><div class="vf-multi-wrap" data-vi="${i}">${d.options.map(o=>`<label class="vf-cb-pal"><input type="checkbox" value="${escH(o)}" data-vi="${i}"><span>${escH(o)}</span></label>`).join("")}<label class="vf-cb-pal vf-cb-pal-other"><input type="checkbox" value="_pv_other_" data-vi="${i}" data-is-other="1"><span>Other…</span></label></div><input type="text" data-var-other="${escH(v)}" data-vi="${i}" placeholder="Custom value…" style="display:none"></div></div>`;
      }else if(d.type==="long"){
        h+=`<div class="vf-row" style="align-items:flex-start"><div class="vf-label" style="padding-top:4px">{{${escH(d.label)}}}</div><textarea data-var-long="${escH(v)}" data-vi="${i}" placeholder="${escH(d.label)}…" rows="4" style="flex:1;background:#1a1a20;border:1px solid #2c2c38;border-radius:5px;padding:5px 8px;color:#e4e2dc;font-size:12px;outline:none;font-family:inherit;resize:vertical;min-height:60px"></textarea></div>`;
      }else{
        h+=`<div class="vf-row"><div class="vf-label">{{${escH(v)}}}</div><input type="text" data-var="${escH(v)}" data-vi="${i}" placeholder="${escH(v)}"></div>`;
      }
    });
    h+=`<div class="vf-acts"><button class="vf-btn" id="vfRaw">${p._action==="inject"?"Inject Raw":"Copy Raw"}</button><button class="vf-btn primary" id="vfFill">${p._action==="inject"?"Inject Filled":"Copy Filled"}</button></div></div></div>`;
    wrap.innerHTML=h;

    const bg=wrap.querySelector(".bg");
    bg.addEventListener("click",closePalette);
    // Wire dropdown "Other" toggles
    wrap.querySelectorAll("select[data-var]").forEach(sel=>{
      sel.addEventListener("change",()=>{
        const oth=wrap.querySelector(`input[data-var-other][data-vi="${sel.dataset.vi}"]`);
        if(oth){oth.style.display=sel.value==="_pv_other_"?"block":"none";if(sel.value==="_pv_other_")oth.focus()}
      });
    });
    // Wire multi "Other" checkbox toggles
    wrap.querySelectorAll('input[data-is-other="1"]').forEach(cb=>{
      cb.addEventListener("change",()=>{
        const oth=wrap.querySelector(`input[data-var-other][data-vi="${cb.dataset.vi}"]`);
        if(oth){oth.style.display=cb.checked?"block":"none";if(cb.checked)oth.focus()}
      });
    });
    // Focus first interactive element
    (wrap.querySelector("input[data-var]")||wrap.querySelector("select[data-var]")||wrap.querySelector("textarea[data-var-long]"))?.focus();
    // Keyboard: Enter triggers fill, Escape closes
    wrap.querySelectorAll("input[data-var],input[data-var-other],select[data-var]").forEach(el=>{
      el.addEventListener("keydown",e=>{
        if(e.key==="Enter"){e.preventDefault();doFill(wrap,p,false)}
        if(e.key==="Escape"){closePalette()}
      });
    });
    wrap.querySelector("#vfRaw").addEventListener("click",()=>doFill(wrap,p,true));
    wrap.querySelector("#vfFill").addEventListener("click",()=>doFill(wrap,p,false));
  }

  function doFill(wrap,p,raw){
    let text=p.content;
    if(!raw){
      const vars=extractVars(text);
      vars.forEach((v,i)=>{
        const d=parseVarDef(v);
        const sel=wrap.querySelector(`select[data-vi="${i}"]`);
        const inp=wrap.querySelector(`input[data-var][data-vi="${i}"]`);
        const oth=wrap.querySelector(`input[data-var-other][data-vi="${i}"]`);
        const long=wrap.querySelector(`textarea[data-var-long][data-vi="${i}"]`);
        const multiWrap=wrap.querySelector(`.vf-multi-wrap[data-vi="${i}"]`);
        let val;
        if(multiWrap){const checked=[...multiWrap.querySelectorAll('input[type="checkbox"]:checked')].map(cb=>cb.value==="_pv_other_"?(oth?.value||""):cb.value).filter(Boolean);val=checked.join(", ")}
        else if(sel)val=sel.value==="_pv_other_"?(oth?.value||""):sel.value;
        else if(long)val=long.value;
        else if(inp)val=inp.value;
        text=text.replaceAll(`{{${v}}}`,val||`{{${v}}}`);
      });
    }
    if(p._action==="inject"){
      const f=find();
      closePalette();
      if(f){injectText(f,text).then(ok=>{if(ok)paletteNotifyLastInject(p)})}
      else{navigator.clipboard.writeText(text)}
    }else{
      navigator.clipboard.writeText(text).then(()=>closePalette());
    }
  }

  function bumpUsage(p){
    // Update usage count in storage
    const key=p._src==="clip"?"pv_s":"pv_p";
    chrome.storage.local.get([key],res=>{
      const data=res[key];if(!data?.folders)return;
      const fold=findInTree(data.folders,p.folderId);
      if(fold){const pr=fold.prompts?.find(x=>x.id===p.id);if(pr){pr.usageCount=(pr.usageCount||0)+1;pr.modified=Date.now();chrome.storage.local.set({[key]:data})}}
    });
  }

  function findInTree(n,id){
    if(n.id===id)return n;
    for(const c of(n.children||[])){const f=findInTree(c,id);if(f)return f}
    return null;
  }

  function escH(s){return(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}

  // ═══════ Global keyboard shortcut fallback ═══════
  // In case chrome.commands doesn't fire (some contexts), also listen for the key combo
  document.addEventListener("keydown",e=>{
    if(e.altKey&&e.shiftKey&&(e.key==="V"||e.key==="v")){
      e.preventDefault();openPalette();
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // RESPONSE CAPTURE — Floating save button on AI response bubbles
  // ═══════════════════════════════════════════════════════════════

  // ── Platform detection (uses adapters.js registry) ──
  function rcDetectPlatform(){
    try{
      const h=location.hostname.replace("www.","");
      if(typeof PV_ADAPTERS!=="undefined"){for(const p of PV_ADAPTERS){for(const u of(p.hosts||p.urls||[])){if(h.includes((u||"").replace("www.","")))return p.id}}}
    }catch{}
    return "";
  }
  const rcPlatform=rcDetectPlatform();
  const rcSelectors=typeof pvGetResponseSelectors==="function"?pvGetResponseSelectors(rcPlatform):['.font-claude-message','[data-message-author-role="assistant"]','[class*="message"][class*="response"]','.markdown'];

  // Check if capture is allowed for this domain (cfg from storage)
  function rcHostnameMatches(host,pattern){
    const h=host.toLowerCase();
    const p=(pattern||"").toLowerCase().trim();
    if(!p)return false;
    if(p.startsWith("*.")){const d=p.slice(2);return h===d||h.endsWith("."+d)}
    return h===p||h.endsWith("."+p);
  }
  function rcCaptureAllowed(cfg){
    // Response scanning is opt-in. Missing settings from older profiles are off.
    if(!cfg||cfg.captureEnabled!==true)return false;
    const host=location.hostname.replace("www.","");
    const allowed=cfg?.captureAllowedDomains||[];
    const blocked=cfg?.captureBlockedDomains||[];
    if(allowed.length>0)return allowed.some(p=>rcHostnameMatches(host,p))&&!blocked.some(p=>rcHostnameMatches(host,p));
    return!blocked.some(p=>rcHostnameMatches(host,p));
  }

  // Only activate on AI platforms (and when capture allowed)
  chrome.storage.local.get(["pv_cfg"],res=>{
  const cfg=res.pv_cfg||{};
  if(!rcPlatform||!rcCaptureAllowed(cfg))return;

    // ── Conversation title cleaning ──
    const RC_SUFFIXES=[" - Claude"," - ChatGPT"," | ChatGPT"," - Gemini"," - Google AI"," - Grok"," | Grok"," - Perplexity"," | Perplexity"," - Mistral"," - DeepSeek"," - Copilot"," - Poe"," - Meta AI"," - HuggingChat"," - Coral"];
    function rcCleanTitle(t){if(!t)return"";for(const s of RC_SUFFIXES){if(t.endsWith(s))return t.slice(0,-s.length)}return t}

    // ── Text extraction (preserves line breaks) ──
    function rcExtractText(el){
      const div=el.cloneNode(true);
      // Remove any PV-injected elements from clone
      div.querySelectorAll("[data-pv-capture]").forEach(h=>h.remove());
      div.querySelectorAll("br").forEach(b=>b.replaceWith("\n"));
      div.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6, tr, pre").forEach(el=>{
        if(el.textContent.trim())el.prepend(document.createTextNode("\n"));
      });
      return div.textContent.replace(/^\n/,"").replace(/\n{3,}/g,"\n\n").trim();
    }

    // ── Toast notification (Shadow DOM isolated) ──
    let rcToastHost=null;
    function rcToast(msg,duration){
      duration=duration||1500;
      if(!rcToastHost){
        rcToastHost=document.createElement("div");
        rcToastHost.attachShadow({mode:"closed"}).innerHTML=`
          <style>
            :host{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:2147483647;pointer-events:none}
            .t{background:#1f1f25;color:#c9a45c;padding:8px 18px;border-radius:8px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
              font-size:13px;font-weight:500;box-shadow:0 4px 16px rgba(0,0,0,.5);border:1px solid rgba(201,164,92,.3);
              opacity:0;transition:opacity .2s;white-space:nowrap}
            .t.show{opacity:1}
          </style>
          <div class="t"></div>`;
        document.body.appendChild(rcToastHost);
      }
      const t=rcToastHost.shadowRoot.querySelector(".t");
      t.textContent=msg;
      requestAnimationFrame(()=>{t.classList.add("show");
        setTimeout(()=>{t.classList.remove("show")},duration);
      });
    }

    // ── Quick save clip directly to chrome.storage.local ──
    let rcSaveCooldown=false;
    function rcQuickSave(text){
      if(rcSaveCooldown)return;
      rcSaveCooldown=true;
      setTimeout(()=>{rcSaveCooldown=false},1500);

      chrome.storage.local.get(["pv_s"],res=>{
        const SN=res.pv_s||{folders:{id:"sroot",name:"My Snippets",children:[],prompts:[],color:""},trash:[],nextId:1};
        // Find or create Inbox folder
        let inbox=SN.folders.children.find(c=>c.id==="s_inbox");
        if(!inbox){inbox={id:"s_inbox",name:"\ud83d\udce5 Inbox",children:[],prompts:[],color:""};SN.folders.children.unshift(inbox)}
        inbox.prompts=inbox.prompts||[];
        const id="i_"+SN.nextId;SN.nextId++;
        const clip={
          id,
          title:(text||"").slice(0,60).split("\n")[0]||"Captured Response",
          content:text,
          tags:["response-capture"],
          created:Date.now(),
          modified:Date.now(),
          usageCount:0,
          favorited:false,
          versions:[],
          sourceUrl:location.href,
          sourceTitle:rcCleanTitle(document.title),
          platform:rcPlatform,
          sourceType:"ai",
          capturedAt:Date.now(),
          linkedPromptId:lastInjectedPromptId||""
        };
        inbox.prompts.push(clip);
        chrome.storage.local.set({pv_s:SN},()=>{
          // Clear the one-shot prompt link after use
          lastInjectedPromptId=null;
          rcToast("\u26a1 Saved to Vault");
          try{chrome.runtime.sendMessage({type:"REBUILD_MENUS"})}catch{}
        });
      });
    }

    // ── Detailed save (opens side panel with capture form) ──
    function rcDetailedSave(text){
      const pending={text,url:location.href,pageTitle:document.title,linkedPromptId:lastInjectedPromptId||""};
      chrome.storage.local.set({pv_pending_snippet:pending},()=>{
        lastInjectedPromptId=null;
        try{chrome.runtime.sendMessage({type:"OPEN_SIDEPANEL"})}catch{}
        rcToast("Opening Vault...",1000);
      });
    }

    // ── Attach floating save button to a response element ──
    function rcAttachButton(el){
      if(el.hasAttribute("data-pv-capture"))return;
      el.setAttribute("data-pv-capture","1");

      // Ensure relative positioning for absolute button placement
      const pos=getComputedStyle(el).position;
      if(pos==="static")el.style.position="relative";

      const host=document.createElement("div");
      host.setAttribute("data-pv-capture","btn");
      host.style.cssText="position:absolute;bottom:4px;right:4px;z-index:10000;pointer-events:auto";
      const shadow=host.attachShadow({mode:"closed"});
      shadow.innerHTML=`
        <style>
          :host{display:block}
          .pv-rc{
            width:24px;height:24px;border-radius:6px;cursor:pointer;
            display:flex;align-items:center;justify-content:center;
            background:rgba(201,164,92,.12);border:1px solid rgba(201,164,92,.2);
            opacity:0.35;transition:opacity .15s,transform .1s;
            pointer-events:auto;
          }
          :host(:hover) .pv-rc,.pv-rc:focus{opacity:1}
          .pv-rc:hover{background:rgba(201,164,92,.85);transform:scale(1.08);border-color:rgba(201,164,92,.6)}
          .pv-rc:hover svg{stroke:#18181c}
          .pv-rc.saved{background:rgba(92,164,108,.8);border-color:rgba(92,164,108,.6);opacity:1;pointer-events:none}
          .pv-rc.saved svg{stroke:#18181c}
          svg{stroke:#c9a45c;transition:stroke .1s}
          .tip{position:absolute;bottom:calc(100% + 6px);right:0;background:#1f1f25;color:#e4e2dc;
            font-size:11px;padding:4px 8px;border-radius:4px;white-space:nowrap;opacity:0;
            pointer-events:none;transition:opacity .15s;border:1px solid rgba(201,164,92,.2);
            font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
          .pv-rc:hover+.tip{opacity:1}
        </style>
        <div class="pv-rc" tabindex="0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
        </div>
        <div class="tip">Review and save to Vault</div>`;

      const btn=shadow.querySelector(".pv-rc");
      btn.addEventListener("click",e=>{
        e.stopPropagation();e.preventDefault();
        const text=rcExtractText(el);
        if(!text){rcToast("No text to capture");return}
        rcDetailedSave(text);
      });

      el.addEventListener("mouseenter",()=>{if(!btn.classList.contains("saved"))btn.style.opacity="1"});
      el.addEventListener("mouseleave",()=>{if(!btn.classList.contains("saved"))btn.style.opacity=""});

      el.appendChild(host);
    }

    // ── Streaming detection: wait for response to finish before attaching button ──
    function rcWaitForStreaming(el){
      // Platform-specific fast path: Claude's data-is-streaming attribute
      if(rcPlatform==="anthropic"){
        const check=()=>{
          const parent=el.closest("[data-is-streaming]");
          if(parent&&parent.getAttribute("data-is-streaming")==="true"){
            setTimeout(check,500);
          }else{
            rcAttachButton(el);
          }
        };
        check();return;
      }
      // Generic: debounce — no child mutations for 1500ms means done
      let timer=null;
      const obs=new MutationObserver(()=>{
        clearTimeout(timer);
        timer=setTimeout(()=>{obs.disconnect();rcAttachButton(el)},1500);
      });
      obs.observe(el,{childList:true,subtree:true,characterData:true});
      // Initial timer in case response is already complete
      timer=setTimeout(()=>{obs.disconnect();rcAttachButton(el)},1500);
      // Safety cap: always attach after 30s even if still mutating
      setTimeout(()=>{obs.disconnect();rcAttachButton(el)},30000);
    }

    // ── MutationObserver: watch for new response elements ──
    function rcFindResponses(root){
      for(const sel of rcSelectors){
        try{
          const els=root.querySelectorAll?root.querySelectorAll(sel):[];
          els.forEach(el=>{
            if(!el.hasAttribute("data-pv-capture")&&el.textContent.trim().length>10){
              rcWaitForStreaming(el);
            }
          });
        }catch{}
      }
    }

    // Initial scan for existing responses on page load
    setTimeout(()=>rcFindResponses(document.body),1000);

    // Watch for new responses
    const rcObserver=new MutationObserver(muts=>{
      for(const m of muts){
        for(const node of m.addedNodes){
          if(node.nodeType!==1)continue;
          // Check if the added node itself is a response
          for(const sel of rcSelectors){
            try{if(node.matches&&node.matches(sel)&&!node.hasAttribute("data-pv-capture")&&node.textContent.trim().length>10){rcWaitForStreaming(node)}}catch{}
          }
          // Check descendants
          rcFindResponses(node);
        }
      }
    });
    rcObserver.observe(document.body,{childList:true,subtree:true});

  }); // end storage.get + rcPlatform check

})();

// ═══════ Drag-out image capture ═══════
// When the user starts dragging an image, read its bytes in PAGE context — where
// page cookies, CORS, and blob: URLs all resolve — and stash them locally so the
// Prompt Vault side panel can save the real image even from auth-walled CDNs
// (Grok, Midjourney, X, …). Passive: it never modifies the page's own drag.
// The stash is a single local key with a short TTL, ignored by Drive sync and the
// menu-rebuild listener (both filter to vault keys only).
(function(){
  if(window._pvDragCapInit)return;
  window._pvDragCapInit=true;
  function blobToDataUrl(b){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(b)})}
  // Grok Imagine (and other generators) render results as <video>. Grab the current frame so
  // a dragged clip still saves a real still; fall back to the poster if the frame is tainted.
  function frameFromVideo(v){
    try{
      if(v.videoWidth&&v.videoHeight){
        const cv=document.createElement("canvas");
        cv.width=v.videoWidth;cv.height=v.videoHeight;
        cv.getContext("2d").drawImage(v,0,0);
        return cv.toDataURL("image/png");
      }
    }catch(_){/* cross-origin video taints the canvas — use the poster below */}
    return v.poster||v.currentSrc||v.src||"";
  }
  function srcFromTarget(t){
    if(!t||!t.tagName)return "";
    if(t.tagName==="IMG")return t.currentSrc||t.src||"";
    if(t.tagName==="CANVAS"){try{return t.toDataURL("image/png")}catch(_){return ""}}
    if(t.tagName==="VIDEO")return frameFromVideo(t);
    if(t.querySelector){
      const im=t.querySelector("img");if(im)return im.currentSrc||im.src||"";
      const vid=t.querySelector("video");if(vid){const u=frameFromVideo(vid);if(u)return u}
    }
    let n=t;for(let i=0;i<4&&n;i++,n=n.parentElement){try{const bg=getComputedStyle(n).backgroundImage;const m=bg&&bg.match(/url\(["']?([^"')]+)["']?\)/);if(m)return m[1]}catch(_){/* keep walking */}}
    return "";
  }
  async function readBytes(src,target){
    if(!src)return "";
    if(/^data:image\//i.test(src))return src;
    // 1) fetch in page context (carries page credentials; reads blob: URLs)
    try{const r=await fetch(src,{credentials:"include"});if(r.ok){const b=await r.blob();if(b&&/^image\//.test(b.type||""))return await blobToDataUrl(b)}}catch(_){/* try canvas */}
    // 2) canvas from an already-decoded <img> (CORS-enabled images)
    try{
      const esc=(window.CSS&&CSS.escape)?CSS.escape(src):src.replace(/"/g,'\\"');
      const img=(target&&target.tagName==="IMG")?target:document.querySelector('img[src="'+esc+'"]');
      if(img&&img.naturalWidth){const cv=document.createElement("canvas");cv.width=img.naturalWidth;cv.height=img.naturalHeight;cv.getContext("2d").drawImage(img,0,0);return cv.toDataURL("image/png")}
    }catch(_){/* tainted or missing */}
    return "";
  }
  document.addEventListener("dragstart",e=>{
    try{
      // Inside a shadow root e.target is retargeted to the host, and these apps wrap the real
      // <img>/<video> in layers of overlay divs. Walk the composed path so we resolve the
      // innermost real visual rather than whatever wrapper the event surfaced.
      let src="";
      const path=(typeof e.composedPath==="function"&&e.composedPath())||[];
      for(let i=0;i<path.length&&i<6;i++){
        const n=path[i];
        if(!(n&&n.nodeType===1))break;
        src=srcFromTarget(n);
        if(src)break;
      }
      if(!src)src=srcFromTarget(e.target);
      if(!src)return;
      const ts=Date.now();
      // Stash the source URL IMMEDIATELY, before attempting to read bytes. Byte reading
      // usually fails for these apps: under MV3 a content-script fetch is CORS-bound (a
      // cdn.* host rarely sends ACAO) and a cross-origin <img> taints the canvas, so
      // readBytes returns "". Previously that meant nothing was stashed at all and the drop
      // had nothing to save. The URL alone is enough — the service worker holds <all_urls>
      // and can fetch it with credentials even when the page cannot.
      const stash=o=>{try{chrome.storage&&chrome.storage.local&&chrome.storage.local.set({pv_drag_image:Object.assign({src,ts},o)})}catch(_){/* storage unavailable */}};
      stash({});
      // Self-clear well after any drop so image bytes don't linger in storage.
      setTimeout(()=>{try{chrome.storage.local.get("pv_drag_image",r=>{if(r&&r.pv_drag_image&&r.pv_drag_image.ts===ts)chrome.storage.local.remove("pv_drag_image")})}catch(_){/* storage gone */}},20000);
      // Bytes are still worth having: blob:/canvas sources can ONLY be resolved in the page,
      // and real bytes survive auth walls. Upgrade the stash if they arrive.
      readBytes(src,e.target).then(dataUrl=>{if(dataUrl)stash({dataUrl})}).catch(()=>{});
    }catch(_){/* never break the page's own drag */}
  },true);
})();
