// BUILD: 2026-08-05T04:53:33.456Z | src/ modules: 45
// ═══════════════════════════════════════════════════════════════
// PROMPT VAULT v7.2 — Hardened Architecture
// ═══════════════════════════════════════════════════════════════
//
// COLOR SYSTEM
// ────────────
// --ac  (gold)    Prompts tab color AND global brand accent.
// --tab-ac        Set on :root by render() to match the active tab.
//                 CSS pattern: var(--tab-ac, var(--ac)) follows active tab, falls back to gold.
// --ed-ac         Set inline on .ed containers for editor-specific accent.
//
// Remaining raw var(--ac) references are intentionally gold:
//   - Prompts tab tree selection, card stars, chain arrows
//   - Backup banner, storage chart prompts slice
//   - Universal search prompt icon, follow-up picker arrows
//   - Settings sync status (syncing state)
//
// Tab colors: --ac (prompts), --ip (images), --sn (clips), --bk (bookmarks),
//             --nt (notes), --sk (skills), --gp (GPTs)
//
// Backup schema version: pv-schema-version.js (side panel + service worker). Fallback:
if(typeof globalThis!=="undefined"&&!globalThis.PV_VAULT_EXPORT_VERSION)globalThis.PV_VAULT_EXPORT_VERSION="7.2";

const PK="pv_p",SK="pv_s",BK="pv_b",NK="pv_n",KK="pv_k",GK="pv_g",IK="pv_ip",PHK="pv_ph",LSK="pv_lists",PRK="pv_pr",CHK="pv_ch",WSK="pv_ws",MK="pv_m",CK="pv_cfg",SP="pv_sn_",UCK="pv_uc";
/** Cloud backends with a working implementation (Settings UI lists these only). */
const SUPPORTED_CLOUD_PROVIDERS=["google-drive"];
/** Bookmark section-panel display modes — canonical vocabulary (see docs/DATA_AUTHORITY.md). */
const BOOKMARK_PANEL_MODES=Object.freeze(["capsule","favicon","link"]);
const BOOKMARK_PANEL_MODE_SET=new Set(BOOKMARK_PANEL_MODES);
function normalizeBookmarkPanelMode(m){
  return typeof m==="string"&&BOOKMARK_PANEL_MODE_SET.has(m)?m:"capsule";
}
// HTML entities for symbols (avoids UTF-8 encoding issues in build/display)
const S={bolt:"&#9889;",clip:"&#128203;",inbox:"&#128229;",pin:"&#128204;",x:"&#10005;",check:"&#10003;",bullet:"&#8226;",emdash:"&#8212;",rquote:"&#187;",lab:"&#9851;",expand:"&#9190;",link:"&#128279;",fav:"&#128302;",cap:"&#128138;",panels:"&#128267;",star:"&#9733;",starEmpty:"&#9734;",openw:"&#8635;",ai:"&#129302;",web:"&#127760;",chevR:"&#9656;",chevD:"&#9662;",gear:"&#9881;",cam:"&#128247;",bulb:"&#128161;",film:"&#127902;",paint:"&#127912;",fog:"&#127787;",frame:"&#128444;",wrench:"&#128295;",note:"&#128221;",dot:"&#9679;",steth:"&#129658;",checkbox:"&#9745;",checkboxEmpty:"&#9744;",pilcrow:"&#182;",paperclip:"&#128226;",rocket:"&#128640;",doc:"&#128196;",package:"&#128230;",warn:"&#9888;",hamburger:"&#9776;",grid:"&#9636;",newWindow:"&#10695;",labFlask:"&#9879;",arrow:"&#8594;",folder:"&#128193;"};
const MAX_SN=10,MAX_D=5,UNDO=20,TR_D=30,BK_S=50,BK_DY=7;
const SIMILARITY_THRESHOLD=0.85,TRASH_MAX=100,INJECT_TIMEOUT=1500,TOAST_DURATION=2200,TOAST_FADE=1800,STREAMING_TIMEOUT=30000,CARD_PAGE_SIZE=40;
const COLORS=[{n:"Default",v:""},{n:"Gold",v:"#d4a843"},{n:"Red",v:"#d94848"},{n:"Rose",v:"#d45c8a"},{n:"Violet",v:"#9b5de5"},{n:"Blue",v:"#4895ef"},{n:"Teal",v:"#38b2a5"},{n:"Green",v:"#48b85c"},{n:"Orange",v:"#e07530"},{n:"Brown",v:"#8a6840"}];
const TAG_COLORS=[
  {n:"None",v:"",bg:"rgba(255,255,255,.06)",fg:"#8a8790"},
  {n:"Rose",v:"#c45c6a",bg:"rgba(196,92,106,.15)",fg:"#d88a96"},
  {n:"Coral",v:"#c97a5c",bg:"rgba(201,122,92,.15)",fg:"#d9a07e"},
  {n:"Gold",v:"#c9a45c",bg:"rgba(201,164,92,.15)",fg:"#d9be7e"},
  {n:"Lime",v:"#7ab847",bg:"rgba(122,184,71,.12)",fg:"#96cc6e"},
  {n:"Mint",v:"#5ca46c",bg:"rgba(92,164,108,.12)",fg:"#7ec48e"},
  {n:"Teal",v:"#4ca6a0",bg:"rgba(76,166,160,.12)",fg:"#6ec4be"},
  {n:"Sky",v:"#5c8ec4",bg:"rgba(92,142,196,.12)",fg:"#7eaad4"},
  {n:"Indigo",v:"#6c6cc9",bg:"rgba(108,108,201,.12)",fg:"#8e8ed9"},
  {n:"Violet",v:"#8a6cc9",bg:"rgba(138,108,201,.12)",fg:"#a88ed9"},
  {n:"Pink",v:"#c45c9a",bg:"rgba(196,92,154,.12)",fg:"#d88ab6"},
];
const mkDef=(id,name)=>({folders:{id,name,children:[],prompts:[],color:""},trash:[],nextId:1});

// ── Default LLM Platforms ──
const DEFAULT_PLATFORMS=[
  {id:"anthropic",name:"Anthropic / Claude",urls:["claude.ai"],icon:"&#128314;"},
  {id:"openai",name:"OpenAI / ChatGPT",urls:["chatgpt.com","chat.openai.com"],icon:"&#128994;"},
  {id:"google",name:"Google / Gemini",urls:["gemini.google.com"],icon:"&#128998;"},
  {id:"xai",name:"xAI / Grok",urls:["grok.x.ai","x.com/i/grok"],icon:"&#9899;"},
  {id:"perplexity",name:"Perplexity",urls:["perplexity.ai"],icon:"&#128995;"},
  {id:"mistral",name:"Mistral",urls:["chat.mistral.ai"],icon:"&#128992;"},
  {id:"deepseek",name:"DeepSeek",urls:["chat.deepseek.com"],icon:"&#128311;"},
  {id:"meta",name:"Meta / Llama",urls:["meta.ai"],icon:"&#128313;"},
  {id:"copilot",name:"Microsoft Copilot",urls:["copilot.microsoft.com"],icon:"&#128310;"},
  {id:"typingmind",name:"TypingMind",urls:["typingmind.com","www.typingmind.com"],icon:"&#9000;"},
  {id:"poe",name:"Poe",urls:["poe.com"],icon:"&#128993;"},
  {id:"hugging",name:"HuggingChat",urls:["huggingface.co/chat"],icon:"&#129303;"},
  {id:"cohere",name:"Cohere",urls:["coral.cohere.com"],icon:"&#11035;"},
  {id:"midjourney",name:"Midjourney",urls:["midjourney.com"],icon:"&#127912;"},
  {id:"runway",name:"Runway",urls:["app.runwayml.com"],icon:"&#127902;"},
  {id:"leonardo",name:"Leonardo AI",urls:["app.leonardo.ai"],icon:"&#128444;"},
  {id:"ideogram",name:"Ideogram",urls:["ideogram.ai"],icon:"&#9998;"},
  {id:"firefly",name:"Adobe Firefly",urls:["firefly.adobe.com"],icon:"&#128293;"},
  {id:"other",name:"Other",urls:[],icon:"&#11035;"},
];

// ─────────────────────────────────────────────────────────────
// IMG_PLATFORMS — canonical list for the image prompt builder.
// MIRROR this list in fullview-shared.js when adding/removing platforms.
// ─────────────────────────────────────────────────────────────
const IMG_PLATFORMS=[
  {id:"midjourney",name:"Midjourney",icon:"&#127912;"},
  {id:"runway",name:"Runway",icon:"&#127902;"},
  {id:"leonardo",name:"Leonardo AI",icon:"&#128444;"},
  {id:"ideogram",name:"Ideogram",icon:"&#9998;"},
  {id:"firefly",name:"Adobe Firefly",icon:"&#128293;"},
  {id:"flux",name:"Flux",icon:"&#9889;"},
  {id:"imagen",name:"Google Imagen",icon:"&#128998;"},
  {id:"dalle",name:"DALL·E",icon:"&#128994;"},
];
// ── Wallpaper presets (CSS gradients, no external images) ──
const WALLPAPER_PRESETS=[
  {id:"none",name:"None",css:""},
  {id:"warm-dusk",name:"Warm dusk",css:"linear-gradient(135deg,#2d1b1b 0%,#1a1520 50%,#0f1419 100%)"},
  {id:"cool-mist",name:"Cool mist",css:"linear-gradient(160deg,#0f1820 0%,#1a2433 40%,#15202b 100%)"},
  {id:"slate",name:"Slate",css:"linear-gradient(180deg,#1e2228 0%,#252a32 50%,#1a1e24 100%)"},
  {id:"forest-dim",name:"Forest dim",css:"linear-gradient(145deg,#0d1612 0%,#152018 50%,#0f1814 100%)"},
  {id:"ocean-deep",name:"Ocean deep",css:"linear-gradient(170deg,#0a1520 0%,#0d1f2d 40%,#0f2433 100%)"},
  {id:"ember",name:"Ember",css:"linear-gradient(135deg,#1a1210 0%,#251a14 50%,#1a0f0d 100%)"},
  {id:"twilight",name:"Twilight",css:"linear-gradient(150deg,#1a1525 0%,#151a28 50%,#0f141c 100%)"},
  {id:"aurora",name:"Aurora",css:"linear-gradient(140deg,#0d1a18 0%,#0f1f28 40%,#0a1520 100%)"},
  {id:"sand",name:"Sand",css:"linear-gradient(160deg,#1f1c18 0%,#252219 50%,#1a1814 100%)"},
  {id:"ink",name:"Ink",css:"linear-gradient(180deg,#0a0a0f 0%,#12121a 50%,#0d0d12 100%)"},
  {id:"moon",name:"Moon",css:"linear-gradient(135deg,#1c1c24 0%,#252530 40%,#1a1a22 100%)"},
  {id:"sage",name:"Sage",css:"linear-gradient(155deg,#121a14 0%,#18201a 50%,#0f1612 100%)"},
  {id:"graphite",name:"Graphite",css:"linear-gradient(180deg,#181a1e 0%,#222428 50%,#141618 100%)"},
  {id:"wine",name:"Wine",css:"linear-gradient(145deg,#1a0f12 0%,#251418 50%,#180d10 100%)"},
  {id:"steel",name:"Steel",css:"linear-gradient(170deg,#14181c 0%,#1e2428 40%,#161a1e 100%)"},
  {id:"mist",name:"Mist",css:"linear-gradient(160deg,#1a1e22 0%,#22282e 50%,#181c20 100%)"},
  {id:"charcoal",name:"Charcoal",css:"linear-gradient(135deg,#0f0f12 0%,#1a1a1f 50%,#0d0d10 100%)"},
  {id:"navy",name:"Navy",css:"linear-gradient(150deg,#0a0e18 0%,#0f1522 50%,#080c14 100%)"},
  {id:"umber",name:"Umber",css:"linear-gradient(155deg,#1a1612 0%,#221c16 50%,#14100d 100%)"}
];
const DEFAULT_CFG={platforms:[...DEFAULT_PLATFORMS],autoDetect:true,starredTags:{prompts:[],snippets:[],bookmarks:[],notes:[],skills:[],customgpts:[],imgprompts:[],photos:[],chats:[]},tagColors:{},disabledPlatforms:[],archiveEnabled:false,mjcCustom:{},vaultLockEnabled:false,vaultLockHash:"",vaultLockSalt:"",vaultLockKdf:"",captureEnabled:false,captureBlockedDomains:[],captureAllowedDomains:[],faviconsDisabled:false,pvBridgeEnabled:true,tabsCollapsed:false,secChromeCollapsed:false,bannerCollapsed:false,workspaces:[],activeWorkspace:"",bookmarkSyncMode:"vault-only",theme:"dark",background:"none",backgroundCustom:"",cloudPullOnStartup:true,cloudProvider:"google-drive",quickAccessFolders:[],tabOrder:["tabP","tabI","tabS","tabB","tabN","tabK","tabCC","tabG","tabPH","tabLS","tabW"]};

let P=null,SN=null,BM=null,NT=null,KL=null,GP=null,IP=null,PH=null,LS=null,PRJ=null,CH=null,WS=null,meta=null,cfg=null,UC=null;
let aTab="prompts"; // prompts|imgprompts|snippets|bookmarks|notes|skills|customgpts|photos|claudecmds|workspace|templates|settings
let pSt={sel:"root",exp:{root:1},view:"list",eId:null,eTi:"",eCo:"",eTg:"",eUrl:"",ePlat:"",q:"",sort:"modified",treeOn:1,sortOn:0,colOn:0,platFilter:"",toolsOn:0,tagFilter:"",listMode:"card",platBarOn:0,collFilter:"",bulkMode:false,bulkSel:[]};
let kSt={sel:"kroot",exp:{kroot:1},view:"list",eId:null,eTi:"",eCo:"",eTg:"",eUrl:"",q:"",sort:"modified",treeOn:1,sortOn:0,colOn:0,toolsOn:0,tagFilter:"",listMode:"card",collFilter:""};
let sSt={sel:"sroot",exp:{sroot:1},view:"list",eId:null,eTi:"",eCo:"",eTg:"",eUrl:"",ePlat:"",q:"",sort:"modified",treeOn:1,sortOn:0,colOn:0,toolsOn:0,tagFilter:"",listMode:"card",collFilter:"",bulkMode:false,bulkSel:[]};
let bSt={sel:"broot",exp:{broot:1},view:"list",eId:null,eTi:"",eCo:"",eTg:"",eUrl:"",q:"",sort:"modified",treeOn:1,sortOn:0,colOn:0,toolsOn:0,tagFilter:"",listMode:"card",bulkMode:false,bulkSel:[],collFilter:""};
let nSt={sel:"nroot",exp:{nroot:1},view:"list",eId:null,eTi:"",eCo:"",eTg:"",eUrl:"",q:"",sort:"modified",treeOn:1,sortOn:0,colOn:0,toolsOn:0,tagFilter:"",listMode:"card",collFilter:""};
let iPSt={sel:"iroot",exp:{iroot:1},view:"list",eId:null,eTi:"",eCo:"",eTg:"",eUrl:"",ePlat:"midjourney",q:"",sort:"modified",treeOn:1,sortOn:0,colOn:0,toolsOn:0,tagFilter:"",listMode:"card",collFilter:""};
let gSt={sel:"groot",exp:{groot:1},view:"list",eId:null,eTi:"",eCo:"",eTg:"",eUrl:"",q:"",sort:"modified",treeOn:0,sortOn:0,colOn:0,toolsOn:0,tagFilter:"",listMode:"launcher",bulkMode:false,bulkSel:[],collFilter:""};
let prSt={sel:"projroot",exp:{projroot:1},view:"list",eId:null,eTi:"",eCo:"",eTg:"",eUrl:"",q:"",sort:"modified",treeOn:1,sortOn:0,colOn:0,toolsOn:0,tagFilter:"",listMode:"card",bulkMode:false,bulkSel:[],collFilter:""};
let chSt={sel:"chroot",exp:{chroot:1},view:"list",eId:null,eTi:"",eCo:"",eTg:"",eUrl:"",ePlat:"",q:"",sort:"modified",treeOn:1,sortOn:0,colOn:0,toolsOn:0,tagFilter:"",listMode:"card",bulkMode:false,bulkSel:[],collFilter:""};
let phSt={sel:"phroot",exp:{phroot:1},view:"list",eId:null,eTi:"",eCo:"",eTg:"",eUrl:"",q:"",sort:"modified",treeOn:1,sortOn:0,colOn:0,toolsOn:0,tagFilter:"",listMode:"gallery",collFilter:""};
let wsSt={sel:null,bsel:null,exp:{},view:"list",q:""};
let undo=[],tTmr=null,autoSaveTmr=null;

const _TST={prompts:()=>pSt,imgprompts:()=>iPSt,skills:()=>kSt,snippets:()=>sSt,notes:()=>nSt,customgpts:()=>gSt,bookmarks:()=>bSt,photos:()=>phSt,projects:()=>prSt,chats:()=>chSt};function st(){return(_TST[aTab]||_TST.bookmarks)()}
const _TDT={prompts:()=>P,imgprompts:()=>IP,skills:()=>KL,snippets:()=>SN,notes:()=>NT,customgpts:()=>GP,bookmarks:()=>BM,photos:()=>PH,projects:()=>PRJ,chats:()=>CH};function dt(){return(_TDT[aTab]||_TDT.bookmarks)()}
const _TRID={prompts:"root",imgprompts:"iroot",skills:"kroot",snippets:"sroot",notes:"nroot",customgpts:"groot",bookmarks:"broot",photos:"phroot",projects:"projroot",chats:"chroot"};function rId(){return _TRID[aTab]||"broot"}
function isP(){return aTab==="prompts"}function isI(){return aTab==="imgprompts"}function isK(){return aTab==="skills"}function isS(){return aTab==="snippets"}function isB(){return aTab==="bookmarks"}function isN(){return aTab==="notes"}function isG(){return aTab==="customgpts"}function isPh(){return aTab==="photos"}function isPR(){return aTab==="projects"}function isCh(){return aTab==="chats"}function isCC(){return aTab==="claudecmds"}function isWs(){return aTab==="workspace"}function isDevNotes(){return aTab==="devnotes"}function isL(){return isB()||isG()||isPR()||isCh()}
const _TAC={prompts:"p",imgprompts:"i",skills:"k",snippets:"s",notes:"n",customgpts:"g",bookmarks:"b",photos:"ph"};function acC(){return _TAC[aTab]||"b"}
const _TAV={prompts:"ac",imgprompts:"ip",skills:"sk",snippets:"sn",notes:"nt",customgpts:"gp",bookmarks:"bk",photos:"ph"};function acV(){return _TAV[aTab]||"bk"}

// Phase 4: folders marked here surface in both Prompt Vault's blank-area menu and
// Chrome's extension context menu. References are IDs, so renames stay in sync.
const PV_QUICK_FOLDER_SILOS={snippets:{store:()=>SN,state:()=>sSt,root:"sroot",label:"Clips"},notes:{store:()=>NT,state:()=>nSt,root:"nroot",label:"Notes"},photos:{store:()=>PH,state:()=>phSt,root:"phroot",label:"Photos"}};
function pvQuickFolderRefs(){if(!cfg)return[];cfg.quickAccessFolders=Array.isArray(cfg.quickAccessFolders)?cfg.quickAccessFolders:[];return cfg.quickAccessFolders}
function pvQuickFolderIsMarked(silo,id){return pvQuickFolderRefs().some(x=>x&&x.silo===silo&&x.id===id)}
function pvQuickFolderToggle(silo,id){
  if(!PV_QUICK_FOLDER_SILOS[silo]||!id)return false;
  const refs=pvQuickFolderRefs(),i=refs.findIndex(x=>x&&x.silo===silo&&x.id===id);
  if(i>=0)refs.splice(i,1);else refs.push({silo,id});
  save();return i<0;
}
function pvQuickFolderResolved(){
  const out=[];
  for(const ref of pvQuickFolderRefs()){
    const meta2=PV_QUICK_FOLDER_SILOS[ref?.silo],store=meta2?.store();
    const folder=store?.folders?findFolder(store.folders,ref.id):null;
    if(folder)out.push({silo:ref.silo,id:ref.id,name:folder.name,label:meta2.label});
  }
  return out;
}
function pvQuickFolderGo(ref){
  const meta2=PV_QUICK_FOLDER_SILOS[ref.silo];if(!meta2)return;
  aTab=ref.silo;const state=meta2.state();state.sel=ref.id;state.exp[meta2.root]=1;state.exp[ref.id]=1;state.view="list";render();
}
function claudeToolsHeader(active){
  return `<div class="claude-tools-switch"><span class="claude-tools-name">Claude Tools</span><span class="claude-tools-hint">Commands and Skills share Claude's slash/backslash workflow</span><button class="claude-tools-link${active==="commands"?' active-cc':''}" data-ct-go="commands">Commands</button><button class="claude-tools-link${active==="skills"?' active-sk':''}" data-ct-go="skills">Skills</button></div>`;
}
function wireClaudeToolsHeader(root=document){
  root.querySelectorAll?.("[data-ct-go]").forEach(btn=>btn.addEventListener("click",()=>{aTab=btn.dataset.ctGo==="commands"?"claudecmds":"skills";render()}));
}

// ── Platform detection ──
function detectPlatform(url){
  if(!url||!cfg?.autoDetect)return "";
  try{const h=new URL(url).hostname.replace("www.","");
    for(const p of cfg.platforms){if((cfg.disabledPlatforms||[]).includes(p.id))continue;for(const u of(p.urls||[])){const uh=u.replace("www.","");if(h===uh||h.endsWith("."+uh))return p.id}}
  }catch{}
  return "";
}
function getPlatName(id){const p=cfg?.platforms?.find(x=>x.id===id);return p?p.name:""}
function getPlatIcon(id){const p=cfg?.platforms?.find(x=>x.id===id);return p?p.icon:""}
function activePlatforms(){return(cfg?.platforms||[]).filter(p=>!(cfg.disabledPlatforms||[]).includes(p.id))}
function isImgPlatform(id){return["midjourney","runway","leonardo","ideogram","firefly"].includes(id)}


// ═══════════════════════════════════════════════════════════════
// LIVE BUILDER STATE — shared in-flight state key for image builder.
// Sidebar (this bundle) and fullview-imgbuilder.html both read and write
// to this single chrome.storage.local key. Each surface tags writes with
// its own random source ID to break the echo loop.
// Shape: {subject, capSel (array of strings), capWeights, platform, params, updatedAt, source}
// ═══════════════════════════════════════════════════════════════
const LIVE_BUILDER_KEY = "pv_builder_live";
const PV_SURFACE_ID = "sb_" + Math.random().toString(36).slice(2, 10);

// ═══════ MINIMAL ZIP WRITER (store method, no deps) ═══════
// Images are already compressed, so a store-only .zip is both valid and
// appropriately sized. Used for "Download selected photos as ZIP".
// pvMakeZip(files) → Uint8Array, where files = [{name, data:Uint8Array|ArrayBuffer}].
function pvCrc32(bytes){
  let c=0xFFFFFFFF;
  for(let i=0;i<bytes.length;i++){
    c^=bytes[i];
    for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));
  }
  return (c^0xFFFFFFFF)>>>0;
}
function pvMakeZip(files){
  const enc=new TextEncoder();
  const u16=n=>[n&255,(n>>8)&255];
  const u32=n=>[n&255,(n>>8)&255,(n>>16)&255,(n>>24)&255];
  const parts=[];        // local headers + data
  const central=[];      // central directory metadata
  let offset=0;
  // De-duplicate names so a zip never has colliding entries.
  const used=new Set();
  for(const f of files){
    let name=f.name||"file";
    if(used.has(name)){
      const dot=name.lastIndexOf(".");const stem=dot>0?name.slice(0,dot):name;const ext=dot>0?name.slice(dot):"";
      let i=2;while(used.has(`${stem} (${i})${ext}`))i++;name=`${stem} (${i})${ext}`;
    }
    used.add(name);
    const nameBytes=enc.encode(name);
    const data=f.data instanceof Uint8Array?f.data:new Uint8Array(f.data);
    const crc=pvCrc32(data);
    const header=new Uint8Array([
      ...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),
      ...u32(crc),...u32(data.length),...u32(data.length),
      ...u16(nameBytes.length),...u16(0),...nameBytes,
    ]);
    parts.push(header,data);
    central.push({crc,size:data.length,nameBytes,offset});
    offset+=header.length+data.length;
  }
  const cdStart=offset;
  const cdArr=[];
  for(const c of central){
    cdArr.push(
      ...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),
      ...u32(c.crc),...u32(c.size),...u32(c.size),
      ...u16(c.nameBytes.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),
      ...u32(c.offset),...c.nameBytes,
    );
  }
  const cd=new Uint8Array(cdArr);
  const eocd=new Uint8Array([
    ...u32(0x06054b50),...u16(0),...u16(0),
    ...u16(central.length),...u16(central.length),
    ...u32(cd.length),...u32(cdStart),...u16(0),
  ]);
  const total=parts.reduce((s,p)=>s+p.length,0)+cd.length+eocd.length;
  const out=new Uint8Array(total);
  let p=0;
  for(const part of parts){out.set(part,p);p+=part.length;}
  out.set(cd,p);p+=cd.length;
  out.set(eocd,p);
  return out;
}
if(typeof module!=="undefined"&&module.exports){module.exports={pvCrc32,pvMakeZip}}

// ═══════ MIDJOURNEY SUFFIX BUILDER ═══════
const MJ_DEFS={
  ar:{label:"Aspect Ratio",tip:"Shape of your image. 1:1 is square, 16:9 is widescreen, 9:16 is phone portrait.",type:"pills",
    opts:[{v:"1:1",l:"1:1",d:"Square"},{v:"16:9",l:"16:9",d:"Landscape"},{v:"9:16",l:"9:16",d:"Portrait"},{v:"4:3",l:"4:3",d:"Photo"},{v:"3:2",l:"3:2",d:"Classic"},{v:"2:3",l:"2:3",d:"Tall"},{v:"3:4",l:"3:4",d:"Poster"}],def:"1:1"},
  v:{label:"Model Version",tip:"Each version has a different style. V7 is newest and most realistic. Niji is anime-focused.",type:"pills",
    opts:[{v:"7",l:"V7",d:"Latest"},{v:"6.1",l:"V6.1",d:"Refined"},{v:"6",l:"V6",d:"Classic"},{v:"5.2",l:"V5.2",d:"Legacy"},{v:"niji 6",l:"Niji",d:"Anime"}],def:"7"},
  s:{label:"Stylize",tip:"Low = follows your prompt literally. High = more artistic freedom. Default is 100.",type:"slider",min:0,max:1000,step:50,def:100,
    marks:[{v:0,l:"Literal"},{v:250,l:"Balanced"},{v:500,l:"Artistic"},{v:750,l:"Dramatic"},{v:1000,l:"Max"}]},
  c:{label:"Chaos",tip:"Low = consistent, predictable results. High = wild variation between images.",type:"slider",min:0,max:100,step:5,def:0,
    marks:[{v:0,l:"Calm"},{v:25,l:"Some"},{v:50,l:"Wild"},{v:100,l:"Mayhem"}]},
  q:{label:"Quality",tip:"Rendering time. Lower = faster/cheaper. Higher = more detail.",type:"pills",
    opts:[{v:"0.25",l:".25",d:"Draft"},{v:"0.5",l:".5",d:"Quick"},{v:"1",l:"1",d:"Full"}],def:"1"},
  w:{label:"Weird",tip:"Pushes results into unusual, unexpected territory. 0 is normal, higher gets increasingly strange.",type:"slider",min:0,max:3000,step:100,def:0,
    marks:[{v:0,l:"Normal"},{v:500,l:"Quirky"},{v:1500,l:"Strange"},{v:3000,l:"Bizarre"}]},
  style:{label:"Raw Mode",tip:"Removes Midjourney's default artistic polish. Images are more literal and photographic.",type:"toggle",def:false},
  tile:{label:"Tile Mode",tip:"Creates seamless repeating patterns — great for wallpapers and textures.",type:"toggle",def:false},
  no:{label:"Exclude",tip:"Tell Midjourney what NOT to include. Separate items with commas.",type:"text",placeholder:"text, watermark, blurry...",def:""},
  seed:{label:"Seed",tip:"Use the same seed number to reproduce similar results. Leave blank for random.",type:"number",placeholder:"Random",def:""},
  sref:{label:"Style Reference",tip:"URL to an image whose style Midjourney should mimic.",type:"url",placeholder:"https://...",def:""},
  cref:{label:"Character Reference",tip:"URL to a character image for consistent character across generations.",type:"url",placeholder:"https://...",def:""}
};
const MJ_DEF_PARAMS={ar:"1:1",v:"7",s:100,c:0,q:"1",w:0,style:false,tile:false,no:"",seed:"",sref:"",cref:"",influences:[{name:"",weight:100}]};
const MJ_INFLUENCE_MIN=5;

/* ═══ MIDJOURNEY PROMPT COMPOSER — Creative Vocabulary Panels ═══ */
const MJC_PANELS=[
  {id:"cam",icon:S.cam,title:"Camera & Lens",sub:"Perspective, depth, spatial feel",groups:[
    {label:"Focal Length",pills:[
      {v:"24mm wide angle",l:"24mm Wide",d:"Exaggerated perspective, dramatic distortion. Landscapes, architecture, action."},
      {v:"35mm lens",l:"35mm",d:"Natural wide view. Street photography, environmental portraits."},
      {v:"50mm lens",l:"50mm",d:"Closest to human eye. Clean, neutral perspective."},
      {v:"85mm portrait lens",l:"85mm",d:"Portrait king. Compressed background, subject isolation, creamy bokeh."},
      {v:"135mm telephoto",l:"135mm",d:"Extreme compression. Flattened layers, intimate telephoto feel."},
      {v:"macro lens extreme close-up",l:"Macro",d:"Extreme close-up. Insect eyes, water droplets, tiny textures."}
    ]},
    {label:"Camera Angle",pills:[
      {v:"low angle hero shot",l:"Low Angle",d:"Looking up at subject. Power, dominance, grandeur."},
      {v:"eye level shot",l:"Eye Level",d:"Neutral, natural perspective."},
      {v:"high angle shot",l:"High Angle",d:"Looking down. Vulnerability, scale, overview."},
      {v:"bird's eye view",l:"Bird's Eye",d:"Directly above. Maps, patterns, God's perspective."},
      {v:"Dutch angle",l:"Dutch Tilt",d:"Tilted camera. Unease, tension, disorientation."},
      {v:"over the shoulder",l:"OTS",d:"Looking past a foreground subject. Cinematic depth."},
      {v:"worm's eye view",l:"Worm's Eye",d:"From the ground looking up. Dramatic, towering."}
    ]},
    {label:"Special Lens",pills:[
      {v:"tilt-shift miniature effect",l:"Tilt-Shift",d:"Makes real scenes look like tiny models."},
      {v:"anamorphic lens flare",l:"Anamorphic",d:"Cinematic horizontal flares. Hollywood blockbuster look."},
      {v:"fisheye lens",l:"Fisheye",d:"Extreme 180° distortion. Skate videos, surreal spaces."}
    ]}
  ]},
  {id:"lit",icon:S.bulb,title:"Lighting",sub:"The biggest lever between flat and stunning",groups:[
    {label:"Studio Lighting",pills:[
      {v:"Rembrandt lighting",l:"Rembrandt",d:"Triangle of light on one cheek. Classic portraiture."},
      {v:"split lighting",l:"Split",d:"Half the face lit, half in shadow. Mystery, duality."},
      {v:"rim lighting",l:"Rim Light",d:"Bright edge around subject, dark center. Separation from background."},
      {v:"butterfly lighting",l:"Butterfly",d:"Light directly above. Shadow under nose. Fashion, beauty."},
      {v:"broad lighting",l:"Broad",d:"Lit side of face toward camera. Open, friendly feel."},
      {v:"chiaroscuro",l:"Chiaroscuro",d:"Extreme contrast between light and dark. Caravaggio drama."},
      {v:"high-key lighting",l:"High Key",d:"Bright, minimal shadows. Clean, airy, commercial."},
      {v:"low-key lighting",l:"Low Key",d:"Dark, dramatic, heavy shadows. Noir, suspense."}
    ]},
    {label:"Natural & Ambient",pills:[
      {v:"golden hour backlit",l:"Golden Hour",d:"Warm, soft, magical. Last hour before sunset."},
      {v:"blue hour ambient light",l:"Blue Hour",d:"Cool, moody twilight. Just after sunset."},
      {v:"overcast flat light",l:"Overcast",d:"Soft, even, no harsh shadows. Muted, contemplative."},
      {v:"harsh midday sun",l:"Midday Sun",d:"Strong shadows, high contrast. Desert, summer, raw."},
      {v:"volumetric god rays through fog",l:"God Rays",d:"Shafts of light through atmosphere. Ethereal, spiritual."},
      {v:"neon ambient light",l:"Neon",d:"Colorful artificial glow. Cyberpunk, nightlife."},
      {v:"candlelight",l:"Candlelight",d:"Warm, flickering, intimate. Low light, soft shadows."}
    ]}
  ]},
  {id:"film",icon:S.film,title:"Film Stock",sub:"Color personality that changes everything",groups:[
    {label:"Film Stocks",pills:[
      {v:"Kodak Portra 400",l:"Portra 400",d:"Warm skin tones, soft pastels. The portrait standard."},
      {v:"Fujifilm Velvia 50",l:"Velvia 50",d:"Punchy saturated colors. Vivid landscapes, intense blues and greens."},
      {v:"Kodak Tri-X 400",l:"Tri-X 400",d:"Classic black & white. Rich grain, deep contrast. Photojournalism."},
      {v:"Kodachrome",l:"Kodachrome",d:"1970s warmth. Rich reds, deep blues, nostalgic golden tones."},
      {v:"Kodak Ektar 100",l:"Ektar 100",d:"Ultra-saturated color negative. Vivid but natural. Landscapes."},
      {v:"Ilford HP5 Plus",l:"HP5 Plus",d:"Versatile B&W. Softer grain than Tri-X. Documentary, street."},
      {v:"Fujifilm Pro 400H",l:"Pro 400H",d:"Cool, ethereal pastels. Wedding photography, dreamy."},
      {v:"CineStill 800T",l:"CineStill 800T",d:"Cinema tungsten film. Halation glow around highlights. Night photography."}
    ]},
    {label:"Processing",pills:[
      {v:"cross-processed",l:"Cross-Process",d:"Wrong chemistry, surreal color shifts. Green shadows, magenta highlights."},
      {v:"bleach bypass",l:"Bleach Bypass",d:"Desaturated with high contrast. Gritty, metallic. Saving Private Ryan look."},
      {v:"pushed two stops",l:"Pushed Film",d:"Overcooked development. Extra grain, extra contrast, extra mood."}
    ]}
  ]},
  {id:"style",icon:S.paint,title:"Style & Era",sub:"Artistic movements and mediums",groups:[
    {label:"Art Movement",pills:[
      {v:"Art Nouveau organic forms",l:"Art Nouveau",d:"Flowing curves, natural motifs, decorative elegance. 1890–1910."},
      {v:"Art Deco geometric",l:"Art Deco",d:"Sharp geometry, luxury materials, bold symmetry. 1920s–1930s."},
      {v:"Bauhaus graphic design",l:"Bauhaus",d:"Functional minimalism, primary colors, geometric shapes."},
      {v:"Soviet constructivist poster",l:"Constructivist",d:"Bold red/black, diagonal composition, revolutionary energy."},
      {v:"Ukiyo-e woodblock print",l:"Ukiyo-e",d:"Japanese woodblock. Flat color, flowing lines, wave and nature motifs."},
      {v:"Memphis Group 1980s",l:"Memphis",d:"Loud patterns, clashing colors, playful postmodern chaos."},
      {v:"Vaporwave aesthetic",l:"Vaporwave",d:"Neon grids, pink/teal/purple, Roman busts, retro-digital nostalgia."},
      {v:"Swiss International Typographic Style",l:"Swiss Style",d:"Grid-based, clean, Helvetica, rational order."}
    ]},
    {label:"Medium",pills:[
      {v:"gouache on textured paper",l:"Gouache",d:"Opaque watercolor. Matte, chalky, illustration feel."},
      {v:"oil painting impasto",l:"Oil Impasto",d:"Thick brushstrokes you can feel. Texture, dimension, old master energy."},
      {v:"cyanotype print",l:"Cyanotype",d:"Prussian blue and white. Sun-printed, botanical, antique."},
      {v:"linocut print",l:"Linocut",d:"Carved block printing. Bold shapes, stark contrast, handmade."},
      {v:"risograph print",l:"Risograph",d:"Neon ink layers, slight misregistration. Zine culture, indie posters."},
      {v:"wet plate collodion photograph",l:"Wet Plate",d:"Antique photography process. Shallow focus, silver tones, haunting."},
      {v:"pencil sketch on moleskine",l:"Pencil Sketch",d:"Raw, personal, sketchbook feel. Lines, crosshatching, imperfection."},
      {v:"digital vector illustration",l:"Vector",d:"Clean, scalable, flat. Modern app illustration, icon design."}
    ]}
  ]},
  {id:"atmo",icon:S.fog,title:"Atmosphere & Detail",sub:"Micro-details that separate AI from photograph",groups:[
    {label:"Atmosphere",pills:[
      {v:"particulate haze",l:"Haze",d:"Soft, diffused air. Reduces contrast, adds distance."},
      {v:"dense fog",l:"Fog",d:"Visibility drops. Mystery, isolation, horror."},
      {v:"underwater caustics",l:"Caustics",d:"Light patterns refracting through water. Swimming pool, ocean."},
      {v:"heat shimmer",l:"Heat Shimmer",d:"Wavy distortion from hot ground. Desert, summer asphalt."},
      {v:"dust motes in shaft of light",l:"Dust Motes",d:"Floating particles catching light beams. Old library, abandoned church."},
      {v:"rain on glass with city lights refracted",l:"Rain Glass",d:"Blurred city bokeh through wet window. Moody, romantic, urban."},
      {v:"breath visible in cold air",l:"Cold Breath",d:"Steam from mouth in freezing weather. Winter, survival, intimacy."},
      {v:"bokeh circles in background",l:"Bokeh",d:"Out-of-focus light circles. Dreamy separation, shallow depth of field."},
      {v:"lens flare",l:"Lens Flare",d:"Light hitting the lens. Optimism, warmth, JJ Abrams energy."}
    ]},
    {label:"Texture & Material",pills:[
      {v:"subsurface scattering on translucent skin",l:"SSS Skin",d:"Light passing through skin. Ears, fingertips glowing. Hyperreal."},
      {v:"brushed aluminum with machining marks",l:"Brushed Metal",d:"Industrial, precise, Apple product photography."},
      {v:"cracked oil paint impasto",l:"Cracked Paint",d:"Aged painting surface. Time, decay, museum artifact."},
      {v:"oxidized copper patina",l:"Copper Patina",d:"Green-blue corrosion on copper. Statue of Liberty, aged rooftops."},
      {v:"hand-blown glass with air bubbles",l:"Glass Bubbles",d:"Artisanal glass imperfections. Craft, light refraction, delicacy."},
      {v:"weathered leather",l:"Worn Leather",d:"Creased, aged, softened. Story, character, vintage."}
    ]}
  ]},
  {id:"comp",icon:S.frame,title:"Composition",sub:"Where does the eye go?",groups:[
    {label:"Composition",pills:[
      {v:"rule of thirds composition",l:"Rule of Thirds",d:"Subject at intersection points. Balanced, dynamic, professional."},
      {v:"centered symmetrical composition",l:"Centered",d:"Subject dead center. Power, confrontation, Wes Anderson."},
      {v:"negative space on the right",l:"Negative Space",d:"Empty area creates breathing room. Minimalist, editorial."},
      {v:"foreground framing through archway",l:"Framing",d:"Shoot through a window, door, or branches. Layers of depth."},
      {v:"layered depth with atmospheric perspective",l:"Depth Layers",d:"Foreground, midground, background all distinct. Epic, cinematic."},
      {v:"extreme close-up filling the frame",l:"Close-Up Fill",d:"Subject fills edge to edge. Detail, intimacy, impact."},
      {v:"diagonal leading lines",l:"Leading Lines",d:"Lines pull the eye through the image. Roads, rails, architecture."}
    ]}
  ]}
];

function getMjcPanels(){
  const custom=cfg?.mjcCustom||{};
  return MJC_PANELS.map(panel=>{
    const c=custom[panel.id]||{};
    const removed=new Set((c.removed||[]).map(x=>x.toLowerCase()));
    const groups=panel.groups.map(g=>{
      const pills=g.pills.filter(p=>!removed.has(p.v.toLowerCase()));
      return{...g,pills:[...pills,...(c.added||[]).filter(a=>(a.group||g.label)===g.label)]};
    });
    // If custom pills don't match any existing group, add to last group
    const ungrouped=(c.added||[]).filter(a=>!a.group);
    if(ungrouped.length&&groups.length){
      const last=groups[groups.length-1];
      ungrouped.forEach(u=>{if(!last.pills.find(p=>p.v===u.v))last.pills.push(u)});
    }
    return{...panel,groups};
  });
}

function rMjComposer(container){
  const ta=$("edTa");
  const txt=ta?ta.value.toLowerCase():"";
  const openId=container._mjcOpen||null;
  const editingId=container._mjcEditing||null;
  const panels=getMjcPanels();
  const preview=container._mjcPreviewDetail||(container._mjcPreview?mjcFindPill(container._mjcPreview.panelId,container._mjcPreview.value,panels):null);
  let h=`<div class="mjc-wrap"><div class="mjc-master-row"><button class="mjc-master" id="mjcToggle"><span class="mjc-master-icon">${S.paint}</span><span class="mjc-master-title">Visual Prompt Workshop</span><span class="mjc-master-sub">Learn by seeing</span><span class="mjc-chev" id="mjcChev">${container._mjcHidden?S.chevR:S.chevD}</span></button><button class="mjc-glossary-btn" id="mjcGlossary" title="Browse all visual examples">Gallery</button></div>`;
  if(!container._mjcHidden){
    h+=`<div id="mjcLearning">${preview?mjcLearningDeckHtml(preview.panel,preview.pill,container._mjcPreview.pinned):mjcWorkshopIntroHtml()}</div>`;
    h+=`<div class="mjc-panels">`;
    panels.forEach(panel=>{
      const isOpen=openId===panel.id;
      const isEditing=editingId===panel.id;
      let activeCount=0;
      panel.groups.forEach(g=>g.pills.forEach(p=>{if(txt.includes(p.v.toLowerCase()))activeCount++}));
      const badge=activeCount?`<span class="mjc-badge">${activeCount}</span>`:"";
      h+=`<div class="mjc-panel${isOpen?" open":""}">`;
      h+=`<button class="mjc-panel-hdr" data-mjc-panel="${panel.id}"><span class="mjc-panel-icon">${panel.icon}</span><span class="mjc-panel-title">${panel.title}</span><span class="mjc-panel-sub">${panel.sub}</span>${badge}<button class="mjc-gear${isEditing?" active":""}" data-mjc-gear="${panel.id}" title="Customize pills">${S.gear}</button><span class="mjc-panel-chev">${isOpen?S.chevD:S.chevR}</span></button>`;
      if(isOpen){
        h+=`<div class="mjc-panel-body">`;
        panel.groups.forEach(g=>{
          h+=`<div class="mjc-group"><div class="mjc-group-label">${g.label}</div><div class="mjc-pills">`;
          g.pills.forEach(p=>{
            const active=txt.includes(p.v.toLowerCase());
            const isCustom=p._custom;
            if(isEditing){
              h+=`<span class="mjc-pill-wrap editing"><button class="mj-pill mjc-pill${active?" active":""}${isCustom?" custom-pill":""}" data-mjc-val="${escAttr(p.v)}" data-mjc-preview="${escAttr(p.v)}" data-mjc-preview-panel="${escAttr(panel.id)}" aria-label="${escAttr(p.l+": "+p.d)}">${esc(p.l)}</button><span class="mjc-rm" data-mjc-rm="${escAttr(p.v)}" data-mjc-rm-panel="${escAttr(panel.id)}">${S.x}</span></span>`;
            } else {
              h+=`<button class="mj-pill mjc-pill${active?" active":""}${isCustom?" custom-pill":""}" data-mjc-val="${escAttr(p.v)}" data-mjc-preview="${escAttr(p.v)}" data-mjc-preview-panel="${escAttr(panel.id)}" aria-label="${escAttr(p.l+": "+p.d)}">${esc(p.l)}</button>`;
            }
          });
          h+=`</div></div>`;
        });
        if(isEditing){
          h+=`<div class="mjc-edit-row"><input class="mjc-edit-inp" id="mjcAddInp" placeholder="Add custom pill (label:value or just text)" data-mjc-add-panel="${panel.id}"><button class="mjc-edit-add" id="mjcAddBtn">+ Add</button></div>`;
        }
        h+=`</div>`;
      }
      h+=`</div>`;
    });
    h+=`</div>`;
  }
  h+=`</div>`;
  container.innerHTML=h;
  mjcWireLearningDeck(container);
  // Wire master toggle
  $("mjcToggle")?.addEventListener("click",()=>{container._mjcHidden=!container._mjcHidden;rMjComposer(container)});
  $("mjcGlossary")?.addEventListener("click",()=>mjcOpenVisualGlossary(container));
  // Wire panel accordions
  container.querySelectorAll("[data-mjc-panel]").forEach(btn=>{btn.addEventListener("click",e=>{
    if(e.target.closest("[data-mjc-gear]"))return;
    e.stopPropagation();
    const pid=btn.dataset.mjcPanel;
    container._mjcOpen=container._mjcOpen===pid?null:pid;
    if(container._mjcOpen!==pid)container._mjcEditing=null;
    rMjComposer(container);
  })});
  // Wire gear icons
  container.querySelectorAll("[data-mjc-gear]").forEach(btn=>{btn.addEventListener("click",e=>{
    e.stopPropagation();
    const pid=btn.dataset.mjcGear;
    // Open the panel if not open
    if(container._mjcOpen!==pid)container._mjcOpen=pid;
    container._mjcEditing=container._mjcEditing===pid?null:pid;
    rMjComposer(container);
  })});
  // Wire remove buttons
  container.querySelectorAll("[data-mjc-rm]").forEach(btn=>{btn.addEventListener("click",e=>{
    e.stopPropagation();
    const val=btn.dataset.mjcRm;
    const pid=btn.dataset.mjcRmPanel;
    if(!cfg.mjcCustom)cfg.mjcCustom={};
    if(!cfg.mjcCustom[pid])cfg.mjcCustom[pid]={added:[],removed:[]};
    // Check if it's a custom pill (remove from added) or default (add to removed)
    const addedIdx=(cfg.mjcCustom[pid].added||[]).findIndex(a=>a.v===val);
    if(addedIdx!==-1){cfg.mjcCustom[pid].added.splice(addedIdx,1)}
    else{if(!cfg.mjcCustom[pid].removed)cfg.mjcCustom[pid].removed=[];cfg.mjcCustom[pid].removed.push(val)}
    save();rMjComposer(container);
  })});
  // Wire add button
  $("mjcAddBtn")?.addEventListener("click",()=>{
    const inp=$("mjcAddInp");if(!inp)return;
    const raw=inp.value.trim();if(!raw)return;
    const pid=inp.dataset.mjcAddPanel;
    // Parse "label:value" or just use text as both
    let label,value;
    if(raw.includes(":")){const parts=raw.split(":");label=parts[0].trim();value=parts.slice(1).join(":").trim()}
    else{label=raw;value=raw.toLowerCase()}
    if(!cfg.mjcCustom)cfg.mjcCustom={};
    if(!cfg.mjcCustom[pid])cfg.mjcCustom[pid]={added:[],removed:[]};
    if(!cfg.mjcCustom[pid].added)cfg.mjcCustom[pid].added=[];
    cfg.mjcCustom[pid].added.push({v:value,l:label,d:"Custom",_custom:true});
    // Also un-remove if it was previously removed
    if(cfg.mjcCustom[pid].removed){cfg.mjcCustom[pid].removed=cfg.mjcCustom[pid].removed.filter(r=>r.toLowerCase()!==value.toLowerCase())}
    save();rMjComposer(container);
  });
  $("mjcAddInp")?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("mjcAddBtn")?.click()}});
  // Visual learning cards appear on hover/focus and stay pinned after selection.
  container.querySelectorAll("[data-mjc-preview]").forEach(pill=>{
    const show=()=>mjcShowLearning(container,pill.dataset.mjcPreviewPanel,pill.dataset.mjcPreview,false);
    pill.addEventListener("mouseenter",show);pill.addEventListener("focus",show);
    pill.addEventListener("mouseleave",()=>mjcClearLearning(container));pill.addEventListener("blur",()=>mjcClearLearning(container));
  });
  // Wire pill clicks — insert into textarea
  container.querySelectorAll("[data-mjc-val]").forEach(pill=>{pill.addEventListener("click",e=>{
    e.stopPropagation();
    if(!ta||container._mjcEditing)return; // Don't insert when editing
    const val=pill.dataset.mjcVal;
    container._mjcPreviewDetail=null;
    container._mjcPreview={panelId:pill.dataset.mjcPreviewPanel,value:val,pinned:true};
    const lo=val.toLowerCase();
    if(ta.value.toLowerCase().includes(lo)){
      let raw=ta.value;
      const idx=raw.toLowerCase().indexOf(lo);
      if(idx!==-1){
        let start=idx,end=idx+val.length;
        if(raw[end]===","&&raw[end+1]===" ")end+=2;
        else if(raw[end]===",")end+=1;
        else if(start>0&&raw[start-2]===","&&raw[start-1]===" ")start-=2;
        else if(start>0&&raw[start-1]===",")start-=1;
        raw=raw.slice(0,start)+raw.slice(end);
        raw=raw.replace(/^,\s*/,"").replace(/,\s*$/,"").trim();
        ta.value=raw;
      }
    } else {
      const pos=ta.selectionStart;
      const before=ta.value;
      if(before.length===0){ta.value=val}
      else if(pos!==undefined&&pos<before.length&&document.activeElement===ta){
        const pre=before.slice(0,pos),post=before.slice(pos);
        const sep=(pre.length>0&&!pre.endsWith(", ")&&!pre.endsWith(",")&&!pre.endsWith(" "))?", ":"";
        ta.value=pre+sep+val+post;
        const newPos=pre.length+sep.length+val.length;
        ta.setSelectionRange(newPos,newPos);
      } else {
        const sep=(before.length>0&&!before.endsWith(", ")&&!before.endsWith(",")&&!before.endsWith(" "))?", ":"";
        ta.value=before+sep+val;
      }
    }
    ta.dispatchEvent(new Event("input",{bubbles:true}));
    rMjComposer(container);
    ta.focus();
  })});
}

function buildMjSuffix(p){
  if(!p)return"";let s="";
  if(p.ar&&p.ar!=="1:1")s+=` --ar ${p.ar}`;
  if(p.v&&p.v!=="7")s+=` --v ${p.v}`;
  if(p.s!=null&&p.s!==100)s+=` --s ${p.s}`;
  if(p.c)s+=` --c ${p.c}`;
  if(p.q&&p.q!=="1")s+=` --q ${p.q}`;
  if(p.style)s+=` --style raw`;
  if(p.w)s+=` --w ${p.w}`;
  if(p.no)s+=` --no ${p.no}`;
  if(p.seed)s+=` --seed ${p.seed}`;
  if(p.tile)s+=` --tile`;
  if(p.sref)s+=` --sref ${p.sref}`;
  if(p.cref)s+=` --cref ${p.cref}`;
  return s;
}

function buildInfluencesString(p){
  const inf=(p?.influences||[]).filter(i=>i&&(i.name||"").trim());
  if(!inf.length)return"";
  const total=inf.reduce((s,i)=>s+(i.weight||0),0);
  const sorted=[...inf].sort((a,b)=>(b.weight||0)-(a.weight||0));
  const parts=[];
  sorted.forEach((s,i)=>{
    const w=total>0?Math.round((s.weight||0)/total*100):0;
    const name=(s.name||"").trim();
    if(!name)return;
    if(i===0)parts.push(`in the style of ${name}`);
    else if(w>=20)parts.push(`with ${name} influence`);
    else parts.push(`subtle ${name} influence`);
  });
  return parts.length?parts.join(", "):"";
}

function normalizeInfluences(inf){
  if(!Array.isArray(inf)||!inf.length)return[{name:"",weight:100}];
  const out=inf.slice(0,3).map(i=>({name:(i?.name||"").trim(),weight:Math.max(MJ_INFLUENCE_MIN,Math.min(95,i?.weight||50))}));
  const filled=out.filter(i=>i.name);
  if(filled.length){
    const sum=filled.reduce((s,i)=>s+i.weight,0);
    if(sum!==100){
      const w=Math.floor(100/filled.length);
      filled.forEach((i,idx)=>{i.weight=idx<filled.length-1?w:100-w*(filled.length-1);});
    }
  }else out[0].weight=100;
  return out.length?out:[{name:"",weight:100}];
}

function balanceInfluenceWeights(inf,draggedIdx,newVal){
  const min=MJ_INFLUENCE_MIN;
  const v=Math.max(min,Math.min(95,newVal));
  inf[draggedIdx].weight=v;
  const otherIdxs=inf.map((_,i)=>i).filter(i=>i!==draggedIdx);
  const remaining=100-v;
  if(otherIdxs.length===1){
    inf[otherIdxs[0]].weight=Math.max(min,Math.min(95,remaining));
  }else if(otherIdxs.length>=2){
    const ratioSum=otherIdxs.reduce((s,i)=>s+(inf[i].weight||min),0);
    otherIdxs.forEach((idx,i)=>{
      const r=ratioSum>0?(inf[idx].weight||min)/ratioSum:1/otherIdxs.length;
      inf[idx].weight=Math.max(min,Math.round(remaining*r));
    });
    const diff=100-v-otherIdxs.reduce((s,i)=>s+inf[i].weight,0);
    if(diff!==0&&otherIdxs.length)inf[otherIdxs[0]].weight+=diff;
  }
}

function compactMjBadge(p){
  if(!p)return"";const parts=[];
  if(p.ar&&p.ar!=="1:1")parts.push(p.ar);
  if(p.v&&p.v!=="7")parts.push("v"+p.v);
  if(p.s!=null&&p.s!==100)parts.push("s"+p.s);
  if(p.c)parts.push("c"+p.c);
  if(p.style)parts.push("raw");
  if(p.w)parts.push("w"+p.w);
  if(p.tile)parts.push("tile");
  return parts.length?parts.join(" · "):"";
}

function rMjBuilder(container,params,onChange){
  let h=`<div class="mj-builder"><div class="mj-hdr"><span class="mj-hdr-icon">🎨</span><span class="mj-hdr-title">Midjourney Settings</span></div>`;
  // Aspect Ratio
  const d=MJ_DEFS;
  h+=mjPillRow("ar",d.ar,params);
  h+=mjPillRow("v",d.v,params);
  h+=mjSliderRow("s",d.s,params);
  h+=mjSliderRow("c",d.c,params);
  h+=mjPillRow("q",d.q,params);
  h+=mjSliderRow("w",d.w,params);
  // Toggles
  h+=`<div class="mj-row mj-toggles">`;
  h+=mjToggle("style",d.style,params);
  h+=mjToggle("tile",d.tile,params);
  h+=`</div>`;
  // Text fields
  h+=mjTextField("no",d.no,params);
  h+=mjTextField("seed",d.seed,params);
  h+=mjTextField("sref",d.sref,params);
  h+=mjTextField("cref",d.cref,params);
  // Influences (user-defined, up to 3)
  if(!params.influences||!params.influences.length)params.influences=[{name:"",weight:100}];
  params.influences=normalizeInfluences(params.influences);
  const inf=params.influences;
  h+=`<div class="mj-row mj-influences-hdr"><div class="mj-label">Influences<span class="mj-tip" title="Style influences (e.g. directors, artists). Up to 3. Weights auto-balance.">?</span></div></div>`;
  inf.forEach((i,idx)=>{
    h+=`<div class="mj-row mj-influence-row" data-mj-inf-idx="${idx}"><input type="text" class="mj-input mj-inf-name" placeholder="e.g. Quentin Tarantino" value="${esc(i.name||"")}" data-mj-inf-idx="${idx}"><span class="mj-inf-weight-wrap">`;
    if(inf.length>1){
      const pct=((i.weight||50)-MJ_INFLUENCE_MIN)/(95-MJ_INFLUENCE_MIN)*100;
      h+=`<span class="mj-inf-weight-val" data-mj-inf-idx="${idx}">${i.weight}%</span><input type="range" class="mj-slider mj-inf-slider" min="${MJ_INFLUENCE_MIN}" max="95" value="${i.weight||50}" data-mj-inf-idx="${idx}" style="--pct:${pct}%">`;
    }
    h+=`</span></div>`;
  });
  if(inf.length<3&&inf.some(i=>(i.name||"").trim())){
    h+=`<button type="button" class="mj-add-inf" data-mj-add-inf="1">+ Add influence</button>`;
  }
  // Live suffix preview
  const sfx=buildMjSuffix(params);
  h+=`<div class="mj-preview"><span class="mj-preview-label">Suffix:</span><code class="mj-preview-code">${sfx?esc(sfx):'<em style="opacity:.4">Default settings — no suffix needed</em>'}</code></div>`;
  h+=`</div>`;
  container.innerHTML=h;
  const _oc=()=>{if(typeof onChange==="function")onChange()};
  // Wire controls
  container.querySelectorAll("[data-mj-pill]").forEach(el=>{el.addEventListener("click",()=>{
    const key=el.dataset.mjKey,def=MJ_DEFS[key],opt=def?.opts?.find(o=>String(o.v)===el.dataset.mjPill),workshop=$("mjComposer");if(workshop&&opt)mjcShowParameterLearning(workshop,key,def,opt,true);
    params[key]=el.dataset.mjPill;rMjBuilder(container,params,onChange);_oc();
  })});
  container.querySelectorAll("[data-mj-pill]").forEach(el=>{const key=el.dataset.mjKey,def=MJ_DEFS[key],opt=def?.opts?.find(o=>String(o.v)===el.dataset.mjPill),workshop=$("mjComposer");if(!workshop||!opt)return;const show=()=>mjcShowParameterLearning(workshop,key,def,opt,false);el.addEventListener("mouseenter",show);el.addEventListener("focus",show);el.addEventListener("mouseleave",()=>mjcClearLearning(workshop));el.addEventListener("blur",()=>mjcClearLearning(workshop))});
  container.querySelectorAll("[data-mj-slider]").forEach(el=>{el.addEventListener("input",()=>{
    params[el.dataset.mjKey]=+el.value;
    el.closest(".mj-row").querySelector(".mj-slider-val").textContent=el.value;
    const pct=((el.value-el.min)/(el.max-el.min))*100;el.style.setProperty("--pct",pct+"%");
    container.querySelector(".mj-preview-code").innerHTML=esc(buildMjSuffix(params))||'<em style="opacity:.4">Default settings</em>';
    _oc();
  })});
  container.querySelectorAll("[data-mj-toggle]").forEach(el=>{el.addEventListener("change",()=>{
    params[el.dataset.mjKey]=el.checked;rMjBuilder(container,params,onChange);_oc();
  })});
  container.querySelectorAll("[data-mj-text]").forEach(el=>{el.addEventListener("input",()=>{
    params[el.dataset.mjKey]=el.dataset.mjType==="number"?(el.value.trim()?+el.value:""):el.value;
    container.querySelector(".mj-preview-code").innerHTML=esc(buildMjSuffix(params))||'<em style="opacity:.4">Default settings</em>';
    _oc();
  })});
  // Influences
  container.querySelectorAll(".mj-inf-name").forEach(el=>{
    el.addEventListener("input",()=>{
      const idx=+el.dataset.mjInfIdx;
      if(params.influences[idx])params.influences[idx].name=el.value;
      rMjBuilder(container,params,onChange);_oc();
    });
  });
  container.querySelectorAll(".mj-inf-slider").forEach(el=>{
    el.addEventListener("input",()=>{
      const idx=+el.dataset.mjInfIdx;
      const v=+el.value;
      balanceInfluenceWeights(params.influences,idx,v);
      rMjBuilder(container,params,onChange);_oc();
    });
  });
  container.querySelector("[data-mj-add-inf]")?.addEventListener("click",()=>{
    if(params.influences.length>=3)return;
    const n=params.influences.length+1;
    const w=Math.floor(100/n);
    params.influences.forEach((i,idx)=>{i.weight=idx<n-1?w:100-w*(n-1);});
    params.influences.push({name:"",weight:w});
    rMjBuilder(container,params,onChange);_oc();
  });
}
function mjPillRow(key,def,params){
  const cur=params[key]!=null?String(params[key]):def.def;
  return`<div class="mj-row"><div class="mj-label">${def.label}<span class="mj-tip" title="${esc(def.tip)}">?</span></div><div class="mj-pills">${def.opts.map(o=>`<button class="mj-pill${String(o.v)===cur?' active':''}" data-mj-pill="${escAttr(String(o.v))}" data-mj-key="${escAttr(key)}" aria-label="${escAttr(def.label+": "+o.l+". "+def.tip+" "+o.d)}">${esc(o.l)}</button>`).join("")}</div></div>`;
}
function mjSliderRow(key,def,params){
  const cur=params[key]!=null?params[key]:def.def;
  const pct=((cur-def.min)/(def.max-def.min))*100;
  return`<div class="mj-row"><div class="mj-label">${def.label}<span class="mj-tip" title="${esc(def.tip)}">?</span><span class="mj-slider-val">${cur}</span></div><div class="mj-slider-wrap"><input type="range" class="mj-slider" min="${def.min}" max="${def.max}" step="${def.step}" value="${cur}" data-mj-slider="1" data-mj-key="${key}" style="--pct:${pct}%"><div class="mj-marks">${def.marks.map(m=>`<span class="mj-mark" style="left:${((m.v-def.min)/(def.max-def.min))*100}%">${m.l}</span>`).join("")}</div></div></div>`;
}
function mjToggle(key,def,params){
  const cur=params[key]!=null?params[key]:def.def;
  return`<label class="mj-tog"><input type="checkbox" ${cur?'checked':''} data-mj-toggle="1" data-mj-key="${key}"><span class="mj-tog-track"><span class="mj-tog-thumb"></span></span><span class="mj-tog-label">${def.label}</span><span class="mj-tip" title="${esc(def.tip)}">?</span></label>`;
}
function mjTextField(key,def,params){
  const cur=params[key]!=null?params[key]:def.def;
  return`<div class="mj-row mj-row-sm"><div class="mj-label">${def.label}<span class="mj-tip" title="${esc(def.tip)}">?</span></div><input type="${def.type||'text'}" class="mj-input" value="${esc(String(cur||''))}" placeholder="${esc(def.placeholder||'')}" data-mj-text="1" data-mj-key="${key}" data-mj-type="${def.type||'text'}"></div>`;
}

// ═════════ VISUAL PROMPT WORKSHOP ═════════
// Every built-in creative vocabulary pill has a four-scene visual learning deck.
// The same reference scenes are intentionally reused so changes are comparable.

const MJC_REFERENCE_SCENES=[
  {id:"portrait",label:"Portrait",src:"assets/visual-workshop/reference-portrait.webp",alt:"Portrait reference scene"},
  {id:"place",label:"Place",src:"assets/visual-workshop/reference-place.webp",alt:"Landscape and architecture reference scene"},
  {id:"object",label:"Object",src:"assets/visual-workshop/reference-object.webp",alt:"Still-life product reference scene"},
  {id:"night",label:"Night",src:"assets/visual-workshop/reference-night.webp",alt:"Night street reference scene"}
];

function mjcFindPill(panelId,value,panels){
  for(const panel of(panels||getMjcPanels())){if(panel.id!==panelId)continue;for(const group of panel.groups)for(const pill of group.pills)if(pill.v===value)return{panel,group,pill}}
  return null;
}

function mjcVisualProfile(panelId,value,sceneIndex){
  const v=String(value||"").toLowerCase();let filter="",transform="scale(1.01)",position="center",effect="none";
  if(panelId==="param-ar"){
    if(v==="16:9")transform="scale(1.01)";else if(v==="9:16"){transform="scale(1.48)";effect="portrait-crop"}else if(v==="4:3")transform="scale(1.12)";else if(v==="3:2")transform="scale(1.07)";else if(v==="2:3"||v==="3:4"){transform="scale(1.38)";effect="portrait-crop"}else effect="square-crop";
  }else if(panelId==="param-v"){
    if(v.includes("niji")){filter="saturate(1.45) contrast(1.25)";effect="anime"}else if(v==="5.2"){filter="saturate(1.12) contrast(1.1)";effect="legacy"}else if(v==="6"){filter="contrast(1.06) saturate(1.05)"}else if(v==="6.1")filter="contrast(1.03) saturate(1.02)";
  }else if(panelId==="param-q"){
    if(v==="0.25"){filter="blur(1.4px) contrast(.94)";effect="draft"}else if(v==="0.5")filter="blur(.55px)";
  }else if(panelId==="film"){
    if(v.includes("portra"))filter="sepia(.12) saturate(.9) contrast(.95) brightness(1.04)";
    else if(v.includes("velvia"))filter="saturate(1.55) contrast(1.14)";
    else if(v.includes("tri-x"))filter="grayscale(1) contrast(1.38) brightness(.93)";
    else if(v.includes("kodachrome"))filter="sepia(.2) saturate(1.28) contrast(1.1)";
    else if(v.includes("ektar"))filter="saturate(1.48) contrast(1.09) brightness(1.02)";
    else if(v.includes("hp5"))filter="grayscale(1) contrast(1.16) brightness(.98)";
    else if(v.includes("400h"))filter="brightness(1.1) saturate(.78) contrast(.88) hue-rotate(7deg)";
    else if(v.includes("cinestill")){filter="brightness(.88) saturate(1.3) contrast(1.22)";effect="halation"}
    else if(v.includes("cross")){filter="saturate(1.55) contrast(1.22) hue-rotate(24deg)";effect="color-shift"}
    else if(v.includes("bleach")){filter="grayscale(.72) saturate(.42) contrast(1.46)";effect="silver"}
    else if(v.includes("pushed")){filter="contrast(1.38) saturate(.82) brightness(.9)";effect="grain"}
  }else if(panelId==="lit"){
    if(v.includes("rembrandt"))effect="rembrandt";else if(v.includes("split"))effect="split";else if(v.includes("rim "))effect="rim";else if(v.includes("butterfly"))effect="butterfly";else if(v.includes("broad"))effect="broad";else if(v.includes("chiaroscuro")){filter="contrast(1.38) brightness(.78)";effect="chiaroscuro"}else if(v.includes("high-key")){filter="brightness(1.22) contrast(.82) saturate(.85)";effect="high-key"}else if(v.includes("low-key")){filter="brightness(.64) contrast(1.35)";effect="low-key"}else if(v.includes("golden")){filter="sepia(.2) saturate(1.16) brightness(1.07)";effect="golden"}else if(v.includes("blue hour")){filter="brightness(.82) saturate(.9) hue-rotate(15deg)";effect="blue"}else if(v.includes("overcast")){filter="saturate(.72) contrast(.82) brightness(1.03)";effect="soft"}else if(v.includes("midday")){filter="contrast(1.28) saturate(1.08)";effect="hard"}else if(v.includes("god rays")){filter="brightness(.9)";effect="rays"}else if(v.includes("neon")){filter="saturate(1.45) contrast(1.15) brightness(.82)";effect="neon"}else if(v.includes("candle")){filter="sepia(.42) saturate(1.12) brightness(.74)";effect="candle"}
  }else if(panelId==="cam"){
    if(v.includes("24mm")){transform="scale(1.18) perspective(300px) rotateY("+(sceneIndex%2?"-4deg":"4deg")+")";effect="wide"}else if(v.includes("35mm"))transform="scale(1.1)";else if(v.includes("50mm"))transform="scale(1.04)";else if(v.includes("85mm")){transform="scale(1.2)";effect="shallow"}else if(v.includes("135mm")){transform="scale(1.35)";effect="compressed"}else if(v.includes("macro")){transform="scale(1.75)";effect="macro"}else if(v.includes("low angle")||v.includes("worm")){position="center bottom";transform="scale(1.14) perspective(250px) rotateX(-5deg)"}else if(v.includes("high angle")||v.includes("bird")){position="center top";transform="scale(1.18) perspective(250px) rotateX(6deg)"}else if(v.includes("dutch"))transform="scale(1.13) rotate(-8deg)";else if(v.includes("shoulder")){transform="scale(1.16)";effect="foreground"}else if(v.includes("tilt-shift")){filter="saturate(1.2) contrast(1.08)";effect="tilt-shift"}else if(v.includes("anamorphic")){transform="scale(1.08)";effect="anamorphic"}else if(v.includes("fisheye")){transform="scale(1.22)";effect="fisheye"}
  }else if(panelId==="atmo"){
    if(v.includes("haze"))effect="haze";else if(v.includes("fog"))effect="fog";else if(v.includes("caustic"))effect="caustics";else if(v.includes("heat"))effect="heat";else if(v.includes("dust"))effect="dust";else if(v.includes("rain"))effect="rain";else if(v.includes("breath"))effect="cold";else if(v.includes("bokeh"))effect="bokeh";else if(v.includes("lens flare"))effect="flare";else if(v.includes("subsurface"))effect="subsurface";else if(v.includes("aluminum")){filter="saturate(.58) contrast(1.15)";effect="metal"}else if(v.includes("cracked"))effect="crackle";else if(v.includes("copper")){filter="sepia(.2) hue-rotate(110deg) saturate(1.15)";effect="patina"}else if(v.includes("glass"))effect="glass";else if(v.includes("leather")){filter="sepia(.35) saturate(.8) contrast(1.1)";effect="grain"}
  }else if(panelId==="style"){
    if(v.includes("art nouveau")){filter="sepia(.16) saturate(1.1)";effect="nouveau"}else if(v.includes("art deco")){filter="contrast(1.18) saturate(.78)";effect="deco"}else if(v.includes("bauhaus")){filter="contrast(1.25) saturate(1.35)";effect="bauhaus"}else if(v.includes("construct")){filter="grayscale(.55) contrast(1.35) sepia(.18)";effect="construct"}else if(v.includes("ukiyo")){filter="saturate(.76) contrast(.92) sepia(.12)";effect="woodblock"}else if(v.includes("memphis")){filter="saturate(1.5) contrast(1.1)";effect="memphis"}else if(v.includes("vapor")){filter="hue-rotate(28deg) saturate(1.5) contrast(1.06)";effect="vapor"}else if(v.includes("swiss")){filter="saturate(.4) contrast(1.25)";effect="grid"}else if(v.includes("gouache")){filter="saturate(1.15) contrast(.92)";effect="paper"}else if(v.includes("impasto")){filter="saturate(1.12) contrast(1.18)";effect="paint"}else if(v.includes("cyanotype")){filter="grayscale(1) sepia(1) hue-rotate(165deg) saturate(2.4) contrast(1.1)";effect="paper"}else if(v.includes("linocut")){filter="grayscale(1) contrast(2.1)";effect="ink"}else if(v.includes("risograph")){filter="saturate(1.55) contrast(1.12)";effect="riso"}else if(v.includes("wet plate")){filter="grayscale(.9) sepia(.35) contrast(1.2)";effect="plate"}else if(v.includes("pencil")){filter="grayscale(1) contrast(1.4) brightness(1.12)";effect="sketch"}else if(v.includes("vector")){filter="saturate(1.3) contrast(1.25)";effect="vector"}
  }else if(panelId==="comp"){
    if(v.includes("thirds")){position=sceneIndex%2?"66% 50%":"34% 50%";effect="thirds"}else if(v.includes("centered")){position="center";effect="symmetry"}else if(v.includes("negative")){position="25% center";transform="scale(1.05)";effect="space"}else if(v.includes("framing"))effect="frame";else if(v.includes("layered"))effect="layers";else if(v.includes("close-up")){transform="scale(1.65)";effect="close"}else if(v.includes("leading"))effect="lines";
  }
  return{filter,transform,position,effect};
}

function mjcExampleDeckHtml(panel,pill,compact){
  return`<div class="mjc-example-grid${compact?" compact":""}">${MJC_REFERENCE_SCENES.map((scene,i)=>{const p=mjcVisualProfile(panel.id,pill.v,i);return`<figure class="mjc-example"><div class="mjc-example-visual" data-mjc-effect="${escAttr(p.effect)}"><img src="${escAttr(scene.src)}" alt="${escAttr(pill.l+" — "+scene.alt)}" style="filter:${escAttr(p.filter||"none")};transform:${escAttr(p.transform)};object-position:${escAttr(p.position)}"></div><figcaption>${esc(scene.label)}</figcaption></figure>`}).join("")}</div>`;
}

function mjcLearningDeckHtml(panel,pill,pinned){
  const custom=pill._custom?'<span class="mjc-learning-custom">Custom term</span>':"";
  return`<section class="mjc-learning${pinned?" pinned":""}" aria-live="polite"><div class="mjc-learning-head"><div><span class="mjc-learning-kicker">${esc(panel.title)} · four visual references</span><h4>${esc(pill.l)}</h4></div>${custom}<button class="mjc-learning-pin" id="mjcLearningPin" title="${pinned?"Unpin this explanation":"Keep this explanation open"}" aria-label="${pinned?"Unpin":"Pin"} ${escAttr(pill.l)}">${pinned?"Pinned":"Pin"}</button></div><p>${esc(pill.d||"Custom vocabulary. Add a description and reference images to teach its visual effect.")}</p>${mjcExampleDeckHtml(panel,pill,false)}<div class="mjc-learning-foot"><span>Prompt phrase</span><code>${esc(pill.v)}</code><small>Illustrative references—generation models interpret terms differently.</small></div></section>`;
}

function mjcWorkshopIntroHtml(){return`<section class="mjc-learning mjc-learning-intro"><div><span class="mjc-learning-kicker">Visual learning mode</span><h4>Hover a term. See what it does.</h4></div><p>Every built-in term has four comparable examples. Click a pill to add it to your prompt and keep its learning card open.</p><div class="mjc-intro-scenes">${MJC_REFERENCE_SCENES.map(s=>`<span>${esc(s.label)}</span>`).join("")}</div></section>`}

function mjcShowLearning(container,panelId,value,pinned){
  const found=mjcFindPill(panelId,value);if(!found)return;container._mjcPreviewDetail=null;container._mjcPreview={panelId,value,pinned:!!pinned};const host=container.querySelector("#mjcLearning");if(host){host.innerHTML=mjcLearningDeckHtml(found.panel,found.pill,!!pinned);mjcWireLearningDeck(container)}
}
function mjcShowParameterLearning(container,key,def,opt,pinned){const panel={id:"param-"+key,title:def.label},pill={v:String(opt.v),l:opt.l,d:def.tip+" "+opt.d};container._mjcPreviewDetail={panel,pill,key,def,opt};container._mjcPreview={panelId:panel.id,value:pill.v,pinned:!!pinned};const host=container.querySelector("#mjcLearning");if(host){host.innerHTML=mjcLearningDeckHtml(panel,pill,!!pinned);mjcWireLearningDeck(container)}}
function mjcClearLearning(container){if(container._mjcPreview?.pinned)return;container._mjcPreview=null;container._mjcPreviewDetail=null;const host=container.querySelector("#mjcLearning");if(host)host.innerHTML=mjcWorkshopIntroHtml()}
function mjcWireLearningDeck(container){container.querySelector("#mjcLearningPin")?.addEventListener("click",e=>{e.stopPropagation();const p=container._mjcPreview;if(!p)return;p.pinned=!p.pinned;if(container._mjcPreviewDetail){const d=container._mjcPreviewDetail;mjcShowParameterLearning(container,d.key,d.def,d.opt,p.pinned)}else mjcShowLearning(container,p.panelId,p.value,p.pinned)})}

function mjcOpenVisualGlossary(container){
  const parameterPanels=Object.entries(MJ_DEFS).filter(([,d])=>Array.isArray(d.opts)).map(([key,d])=>({id:"param-"+key,title:d.label,groups:[{label:"Choices",pills:d.opts.map(o=>({v:String(o.v),l:o.l,d:d.tip+" "+o.d}))}]}));
  const panels=[...getMjcPanels(),...parameterPanels],count=panels.reduce((n,p)=>n+p.groups.reduce((m,g)=>m+g.pills.length,0),0);
  showModal(`<div class="mjc-glossary"><div class="mjc-glossary-head"><div><span class="mjc-learning-kicker">Visual Prompt Workshop</span><h3>${count} terms · four examples each</h3></div><button class="bg-btn" id="mjcGlossaryX">Close</button></div><input id="mjcGlossarySearch" class="ti" placeholder="Search film, lighting, lenses, styles…"><div class="mjc-glossary-list" id="mjcGlossaryList">${panels.map(panel=>`<section data-glossary-section><h4>${esc(panel.title)}</h4><div class="mjc-glossary-grid">${panel.groups.flatMap(g=>g.pills).map(pill=>`<button class="mjc-glossary-card" data-glossary-panel="${escAttr(panel.id)}" data-glossary-value="${escAttr(pill.v)}" data-glossary-search="${escAttr((pill.l+" "+pill.v+" "+pill.d).toLowerCase())}"><strong>${esc(pill.l)}</strong>${mjcExampleDeckHtml(panel,pill,true)}<span>${esc(pill.d)}</span></button>`).join("")}</div></section>`).join("")}</div></div>`,mc=>{
    mc.querySelector("#mjcGlossaryX").addEventListener("click",closeModal);const search=mc.querySelector("#mjcGlossarySearch");search.addEventListener("input",()=>{const q=search.value.trim().toLowerCase();mc.querySelectorAll("[data-glossary-search]").forEach(card=>{card.hidden=!!q&&!card.dataset.glossarySearch.includes(q)});mc.querySelectorAll("[data-glossary-section]").forEach(sec=>{sec.hidden=![...sec.querySelectorAll("[data-glossary-search]")].some(c=>!c.hidden)})});mc.querySelectorAll("[data-glossary-value]").forEach(card=>card.addEventListener("click",()=>{const pid=card.dataset.glossaryPanel,val=card.dataset.glossaryValue;closeModal();if(pid.startsWith("param-")){const key=pid.slice(6),def=MJ_DEFS[key],opt=def?.opts?.find(o=>String(o.v)===val);if(opt)mjcShowParameterLearning(container,key,def,opt,true)}else{container._mjcOpen=pid;mjcShowLearning(container,pid,val,true)}rMjComposer(container);setTimeout(()=>container.querySelector("#mjcLearning")?.scrollIntoView({block:"nearest",behavior:"smooth"}),50)}));search.focus();
  },"wide");
}


// ── SVG ──
const V={
  f:(o,c)=>o?`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${c||'currentColor'}" stroke-width="2"><path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v1M5 19h14a2 2 0 0 0 2-2l-2-7H5l-2 7a2 2 0 0 0 2 2z"/></svg>`:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${c||'currentColor'}" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  ch:o=>`<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" style="transform:rotate(${o?90:0}deg);transition:transform .15s"><polyline points="9 18 15 12 9 6"/></svg>`,
  st:f=>`<svg width="11" height="11" viewBox="0 0 24 24" fill="${f?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
};
const I={
  plus:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  trash:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  edit:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  copy:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  dup:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16V4a2 2 0 0 1 2-2h12"/></svg>',
  move:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>',
  hist:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  back:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  sort:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="8" y2="18"/></svg>',
  pal:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="2.5"/><path d="M21 12c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c1 0 1.5-.5 1.5-1.5 0-.39-.15-.74-.39-1.04-.26-.34-.39-.74-.39-1.16 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5z"/></svg>',
  grip:'<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>',
  bolt:'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  rest:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
  send:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  dl:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  open:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  coll:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  share:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  spark:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="M12 7l1.8 3.2L17 12l-3.2 1.8L12 17l-1.8-3.2L7 12l3.2-1.8z"/></svg>',
  flask:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><line x1="7" y1="15" x2="17" y2="15"/></svg>',
  more:'<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
};


// ═══════ ENSURE DEFAULTS ═══════
// Deep-merges DEFAULT_CFG into loaded cfg, filling any missing keys.
// Preserves all existing user values. Only adds what's absent.
// Handles nested objects (starredTags, etc.) without overwriting.
function ensureDefaults(target, defaults) {
  if (!target || typeof target !== "object") return deepClone(defaults);
  for (const key of Object.keys(defaults)) {
    if (target[key] === undefined || target[key] === null) {
      target[key] = deepClone(defaults[key]);
    } else if (
      typeof defaults[key] === "object" &&
      defaults[key] !== null &&
      !Array.isArray(defaults[key]) &&
      typeof target[key] === "object" &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      ensureDefaults(target[key], defaults[key]);
    }
  }
  return target;
}

// ── Util ──
function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}
let _aiCache={};
function allItemsCached(folders){const key=folders?.id||"?";if(_aiCache[key])return _aiCache[key];_aiCache[key]=allItems(folders);return _aiCache[key]}
function invalidateItemCache(){_aiCache={}}
function generateId(x){const id=`i_${x.nextId}`;x.nextId++;return id}
function buildItem(store,title,content,tags,extra){
  const item={id:generateId(store),title:title||"Untitled",content:content||"",tags:tags||[],created:Date.now(),modified:Date.now(),usageCount:0,favorited:false,versions:[]};
  if(extra)Object.assign(item,extra);
  return item;
}
function findFolder(n,id){if(n.id===id)return n;for(const c of(n.children||[])){const f=findFolder(c,id);if(f)return f}return null}
function findParent(n,t,p=null){if(n.id===t)return p;for(const c of(n.children||[])){const f=findParent(c,t,n);if(f)return f}return null}
function getDepth(n,r){let d=0,c=n;while(c&&c.id!==r.id){const p=findParent(r,c.id);if(!p)break;d++;c=p}return d}
function countItems(n){
  // Counts are used by the shared header/footer and onboarding before a user opens
  // any particular silo. A partial legacy tree must therefore degrade to zero, not
  // take every section down while startup validation repairs the stored shape.
  if(!n||typeof n!=="object")return{prompts:0,folders:0};
  const children=Array.isArray(n.children)?n.children.filter(c=>c&&typeof c==="object"):[];
  let p=Array.isArray(n.prompts)?n.prompts.length:0,f=children.length;
  for(const c of children){const x=countItems(c);p+=x.prompts;f+=x.folders}
  return{prompts:p,folders:f};
}
function searchAll(q,n,path="",platFilter="",tagFilter=""){let r=[];const ql=q.toLowerCase(),p2=path?path+" / "+n.name:n.name;
  for(const p of(n.prompts||[])){
    if(platFilter&&p.platform!==platFilter)continue;
    if(tagFilter&&!(p.tags||[]).some(t=>t.toLowerCase()===tagFilter.toLowerCase()))continue;
    if(!q||p.title.toLowerCase().includes(ql)||(p.content||"").toLowerCase().includes(ql)||(p.url||"").toLowerCase().includes(ql)||(p.tags||[]).some(t=>t.toLowerCase().includes(ql)))
      r.push({...p,folderName:n.name,folderId:n.id,folderPath:p2})}
  for(const c of(n.children||[]))r=r.concat(searchAll(q,c,p2,platFilter,tagFilter));return r}
function allFolders(n,dp=0,l=[]){l.push({id:n.id,name:n.name,depth:dp,color:n.color});for(const c of(n.children||[]))allFolders(c,dp+1,l);return l}
function getFavorited(n){let r=[];for(const p of(n.prompts||[]))if(p.favorited)r.push({...p,folderId:n.id,folderName:n.name});for(const c of(n.children||[]))r=r.concat(getFavorited(c));return r}
function extractVars(t){const m=(t||"").match(/\{\{([^}]+)\}\}/g);return m?[...new Set(m.filter(x=>!x.startsWith("{{ref:")).map(x=>x.slice(2,-2).trim()))]:[]}
function parseVarDef(raw){const ci=raw.indexOf(":");if(ci<0)return{label:raw,raw,type:"text",options:null};
  const label=raw.slice(0,ci).trim(),after=raw.slice(ci+1);
  if(after.trim()==="+long")return{label,raw,type:"long",options:null};
  if(after.startsWith("+multi:")){const opts=after.slice(7).split("|").map(o=>o.trim()).filter(Boolean);return{label,raw,type:"multi",options:opts}}
  if(!after.includes("|"))return{label:raw,raw,type:"text",options:null};
  return{label,raw,type:"dropdown",options:after.split("|").map(o=>o.trim()).filter(Boolean)}}
/** HTML-escape, safe in text nodes AND quoted attributes. Single source of truth.
 *  NOTE: must escape quotes. The old DOM-path (textContent->innerHTML) did not
 *  escape " or ', which made esc() unsafe in attribute context (and behaved
 *  differently in Node vs browser, hiding the bug from tests). */
function esc(s){
  return String(s==null?"":s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
/** Alias retained for existing call sites — esc() is now fully attribute-safe. */
function escAttr(s){return esc(s);}
/** Allowlist URL schemes before using a stored URL as an href or open target.
 *  Blocks javascript:, data:, etc. which execute even when quotes are escaped. */
function safeUrl(u){
  const s=String(u==null?"":u).trim();
  return /^(https?:|mailto:|tel:)/i.test(s)?s:"";
}
// Gates EXPLICIT user captures (right-click saves), so it checks only the
// domain blocklist. cfg.captureEnabled governs the passive AI-response
// observer in content.js and must not veto deliberate saves.
function isCaptureBlocked(url,cfg){
  if(!url)return false;
  const blocked=cfg?.captureBlockedDomains||[];
  if(!blocked.length)return false;
  try{const host=new URL(url).hostname.replace("www.","").toLowerCase();
    return blocked.some(p=>{const pt=(p||"").toLowerCase().trim();if(!pt)return false;
      if(pt.startsWith("*.")){const d=pt.slice(2);return host===d||host.endsWith("."+d)}
      return host===pt||host.endsWith("."+pt)})}catch{return false}
}
function formatDate(t){return new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
function formatDateTime(t){return new Date(t).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}
function formatFull(t){return new Date(t).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
function deepClone(o){return JSON.parse(JSON.stringify(o))}
function daysSince(t){return(Date.now()-t)/864e5}
function tokenEstimate(t){return Math.ceil((t||"").length/4)}
const SAFE_HEX_COLOR_RE=/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
function safeUiColor(v){
  if(typeof v!=="string")return "";
  const c=v.trim();
  if(!c)return "";
  return SAFE_HEX_COLOR_RE.test(c)?c:"";
}
function safeTagColorValue(v){
  return TAG_COLORS.some(c=>c.v===v)?v:"";
}
function walkTree(node,fn){
  if(!node||typeof node!=="object")return;
  fn(node);
  (node.children||[]).forEach(ch=>walkTree(ch,fn));
}
function bookmarkIdSet(){
  const ids=new Set();
  if(!BM?.folders)return ids;
  walkTree(BM.folders,node=>{(node.prompts||[]).forEach(p=>{if(typeof p?.id==="string")ids.add(p.id)})});
  return ids;
}
function sanitizeCollections(store){
  if(!Array.isArray(store?.collections))return false;
  let changed=false;
  store.collections=store.collections.filter(col=>col&&typeof col==="object").map(col=>{
    const next={...col};
    const safeColor=safeTagColorValue(next.color||"");
    if((next.color||"")!==safeColor){next.color=safeColor;changed=true}
    if(!Array.isArray(next.items)){next.items=[];changed=true}
    next.items=[...new Set(next.items.filter(id=>typeof id==="string"))];
    if(typeof next.name!=="string"){next.name="Untitled";changed=true}
    if(typeof next.id!=="string"){next.id="col_"+Date.now()+"_"+Math.random().toString(36).slice(2,6);changed=true}
    return next;
  });
  return changed;
}
function sanitizeConfigColors(){
  let changed=false;
  cfg=cfg||deepClone(DEFAULT_CFG);
  cfg.tagColors=cfg.tagColors||{};
  Object.keys(cfg.tagColors).forEach(tag=>{
    const safe=safeTagColorValue(cfg.tagColors[tag]);
    if(safe!==cfg.tagColors[tag]){changed=true;if(safe)cfg.tagColors[tag]=safe;else delete cfg.tagColors[tag]}
  });
  return changed;
}
function pruneSectionPanels(){
  if(!BM)return false;
  let changed=false;
  if(!Array.isArray(BM.sectionPanels)){BM.sectionPanels=[];return true}
  const validIds=bookmarkIdSet();
  BM.sectionPanels=BM.sectionPanels.filter(panel=>panel&&typeof panel==="object").map((panel,pi)=>{
    const next={...panel};
    if(typeof next.id!=="string"){next.id="sp_"+Date.now()+"_"+pi;changed=true}
    if(typeof next.name!=="string"){next.name="Section Panel";changed=true}
    const nm=normalizeBookmarkPanelMode(next.mode);
    if(nm!==next.mode){next.mode=nm;changed=true}
    if(!Array.isArray(next.clusters)){next.clusters=[];changed=true}
    next.clusters=next.clusters.filter(cl=>cl&&typeof cl==="object").map((cluster,ci)=>{
      const cl2={...cluster};
      if(typeof cl2.id!=="string"){cl2.id="cl_"+Date.now()+"_"+pi+"_"+ci;changed=true}
      if(typeof cl2.label!=="string"){cl2.label="";changed=true}
      const safeClusterColor=safeUiColor(cl2.color||"");
      if((cl2.color||"")!==safeClusterColor){cl2.color=safeClusterColor;changed=true}
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
function sanitizeBookmarkUiState(){
  let changed=false;
  changed=sanitizeCollections(BM)||changed;
  changed=pruneSectionPanels()||changed;
  return changed;
}
function sanitizeAllUiState(){
  let changed=false;
  [P,KL,SN,BM,NT].forEach(store=>{changed=sanitizeCollections(store)||changed});
  changed=sanitizeConfigColors()||changed;
  changed=sanitizeBookmarkUiState()||changed;
  return changed;
}
function wordCount(t){return(t||"").split(/\s+/).filter(Boolean).length}
function allItems(n,l=[]){for(const p of(n.prompts||[]))l.push({...p,folderName:n.name,folderId:n.id});for(const c of(n.children||[]))allItems(c,l);return l}
function domain(url){try{return new URL(url).hostname.replace("www.","")}catch{return url||""}}
// Site icons come from Chrome's local favicon cache (_favicon, "favicon"
// permission) — no request ever leaves the device. Sites Chrome hasn't
// visited get its default globe icon.
function favicon(url,size=16){if(cfg?.faviconsDisabled)return `<span style="display:inline-block;width:${size}px;height:${size}px;background:var(--bl);border-radius:2px;vertical-align:middle;flex-shrink:0"></span>`;try{new URL(url);const src=chrome.runtime.getURL(`/_favicon/?pageUrl=${encodeURIComponent(url)}&size=${Math.min(64,size*2)}`);return `<img class="pv-favicon" src="${src}" width="${size}" height="${size}" style="border-radius:2px;vertical-align:middle;flex-shrink:0">`}catch{return ""}}
// Inline onerror is blocked by the extension CSP — hide failed favicons via one
// delegated capture-phase listener (error events don't bubble).
document.addEventListener("error",e=>{const t=e.target;if(t&&t.tagName==="IMG"&&t.classList.contains("pv-favicon"))t.style.display="none"},true);
function srcType(url){return detectPlatform(url)?"ai":"web"} // auto-classify source as AI or website
// ── Tag helpers ──
function starredTagKey(){return aTab==="prompts"?"prompts":aTab==="imgprompts"?"imgprompts":aTab==="skills"?"skills":aTab==="snippets"?"snippets":aTab==="notes"?"notes":aTab==="customgpts"?"customgpts":"bookmarks"}
function getStarredTags(){return(cfg?.starredTags?.[starredTagKey()])||[]}
function toggleStarTag(tag){const k=starredTagKey();cfg.starredTags=cfg.starredTags||{};cfg.starredTags[k]=cfg.starredTags[k]||[];const i=cfg.starredTags[k].indexOf(tag);if(i>=0)cfg.starredTags[k].splice(i,1);else cfg.starredTags[k].push(tag);save()}
function allTagsForTab(){const items=allItemsCached(dt().folders),tags={};items.forEach(p=>(p.tags||[]).forEach(t=>{tags[t]=(tags[t]||0)+1}));return Object.entries(tags).sort((a,b)=>b[1]-a[1]).map(([t,c])=>({tag:t,count:c}))}
// ── Tag color system ──
function getTagColor(tag){const v=cfg?.tagColors?.[tag];if(!v)return TAG_COLORS[0];return TAG_COLORS.find(c=>c.v===v)||TAG_COLORS[0]}
function setTagColor(tag,colorVal){cfg.tagColors=cfg.tagColors||{};if(!colorVal)delete cfg.tagColors[tag];else cfg.tagColors[tag]=colorVal;save()}
function tagColorStyle(tag){const tc=getTagColor(tag);return`background:${tc.bg};color:${tc.fg}`}
// ── Domain extraction for bookmarks ──
function extractDomains(items){const doms={};items.forEach(p=>{const d=domain(p.url||"");if(d){doms[d]=(doms[d]||0)+1}});return Object.entries(doms).sort((a,b)=>b[1]-a[1]).map(([d,c])=>({domain:d,count:c}))}
function groupByDomain(items){const groups={};items.forEach(p=>{const d=domain(p.url||"")||"(no domain)";if(!groups[d])groups[d]=[];groups[d].push(p)});return Object.entries(groups).sort((a,b)=>b[1].length-a[1].length).map(([d,items])=>({domain:d,items,count:items.length}))}
function folderColorFor(fid){const d2=dt();const f=findFolder(d2.folders,fid);return f?.color||""}
// ── Find bookmark anywhere in tree by id ──
function findItemGlobal(node,id){for(const p of(node.prompts||[]))if(p.id===id)return p;for(const c of(node.children||[])){const f=findItemGlobal(c,id);if(f)return f}return null}
// ── Collection helpers (work for Prompts and Bookmarks) ──
function collData(){return isP()?P:isI()?IP:isK()?KL:isS()?SN:isN()?NT:isG()?GP:isPh()?PH:BM}
function getCollections(){return collData().collections||[]}
function saveCollections(cols){collData().collections=cols;save()}
function newCollId(){return"cl_"+(Date.now().toString(36))}
function getCollItems(colId){const cd=collData();const col=(cd.collections||[]).find(c=>c.id===colId);if(!col)return[];const all=allItemsCached(cd.folders);return(col.items||[]).map(id=>{const p=all.find(x=>x.id===id);return p?{...p}:null}).filter(Boolean)}
function isInColl(colId,itemId){const col=(collData().collections||[]).find(c=>c.id===colId);return col?.items?.includes(itemId)||false}
function addToColl(colId,itemId){const col=(collData().collections||[]).find(c=>c.id===colId);if(!col)return;col.items=col.items||[];if(!col.items.includes(itemId))col.items.push(itemId);save()}
function removeFromColl(colId,itemId){const col=(collData().collections||[]).find(c=>c.id===colId);if(!col)return;col.items=(col.items||[]).filter(id=>id!==itemId);save()}
// ── Duplicate URL detection ──
function findDuplicateUrl(url,data){if(!url)return null;try{const norm=new URL(url).href.replace(/\/$/,"")}catch{return null}const normUrl=(u)=>{try{return new URL(u).href.replace(/\/$/,"")}catch{return u}};const target=normUrl(url);const items=allItemsCached(data.folders);const dup=items.find(p=>(p.url&&normUrl(p.url)===target)||(p.sourceUrl&&normUrl(p.sourceUrl)===target));return dup||null}
// ── Related prompts (tag overlap, same folder) ──
function findRelated(item,store,limit=5){if(!item||!store?.folders)return[];const items=allItemsCached(store.folders).filter(p=>p.id!==item.id);const myTags=new Set((item.tags||[]).map(t=>t.toLowerCase()));const myFolder=item.folderId||"";const scored=items.map(p=>{let s=0;const pt=new Set((p.tags||[]).map(t=>t.toLowerCase()));for(const t of myTags)if(pt.has(t))s+=2;if((p.folderId||"")===myFolder)s+=1;return{...p,_score:s}}).filter(x=>x._score>0).sort((a,b)=>b._score-a._score);return scored.slice(0,limit).map(({_score,...p})=>p)}
// ── Similar prompts (Jaccard on word tokens) ──
function tokenize(t){return new Set((t||"").toLowerCase().replace(/\s+/g," ").split(" ").filter(w=>w.length>1))}
function jaccard(a,b){if(!a.size||!b.size)return 0;let inter=0;for(const w of a)if(b.has(w))inter++;return inter/(a.size+b.size-inter)}
function findSimilarPrompts(content,store,excludeId,threshold=0.85){if(!content||!store?.folders)return[];const tokA=tokenize(content);if(!tokA.size)return[];const items=allItemsCached(store.folders).filter(p=>p.id!==excludeId);const out=[];for(const p of items){const txt=(p.title||"")+" "+(p.content||"");const tokB=tokenize(txt);if(!tokB.size)continue;const sim=jaccard(tokA,tokB);if(sim>=threshold)out.push({...p,similarity:sim})}return out.sort((a,b)=>b.similarity-a.similarity).slice(0,5)}
// ── Universal search: tag:/platform: filters + token / fuzzy match ──
function parseUniQuery(raw){
  const q=(raw||"").trim();
  const out={text:"",tag:"",platform:"",tokens:[]};
  const parts=[];let cur="";let i=0;
  const push=()=>{const w=cur.trim();if(w)parts.push(w);cur=""};
  while(i<q.length){
    if(q[i]===" "){push();i++;continue}
    if(q[i]==='"'||q[i]==="'"){const qc=q[i];i++;while(i<q.length&&q[i]!==qc){cur+=q[i];i++}i++;push();continue}
    cur+=q[i];i++;
  }
  push();
  const textParts=[];
  for(const p of parts){
    const tl=p.toLowerCase();
    const tm=tl.match(/^tag:(.+)$/);
    const pm=tl.match(/^platform:(.+)$/);
    if(tm)out.tag=(tm[1]||"").trim();
    else if(pm)out.platform=(pm[1]||"").trim();
    else textParts.push(p);
  }
  out.text=textParts.join(" ").trim();
  out.tokens=out.text.toLowerCase().split(/\s+/).filter(Boolean);
  return out;
}
function fuzzyCharsInOrder(q,text){
  if(!q)return true;
  const ql=q.toLowerCase(),tl=(text||"").toLowerCase();
  let j=0;for(let i=0;i<tl.length&&j<ql.length;i++)if(tl[i]===ql[j])j++;
  return j===ql.length;
}
function uniItemMatchScore(filters,p){
  const needTag=(filters.tag||"").toLowerCase();
  const needPlat=(filters.platform||"").toLowerCase();
  if(needTag&&!(p.tags||[]).some(t=>(t||"").toLowerCase().includes(needTag)))return 0;
  if(needPlat){
    const pid=(p.platform||"").toLowerCase();
    let pname="";
    try{pname=(typeof getPlatName==="function"?String(getPlatName(p.platform)||""):"").toLowerCase()}catch{pname=""}
    if(!pid.includes(needPlat)&&!pname.includes(needPlat))return 0;
  }
  const tokens=filters.tokens||[];
  const gl=(filters.text||"").toLowerCase();
  const hay=[p.title,(p.content||""),(p.url||""),...(p.tags||[]),(p.sourceTitle||"")].join("\n").toLowerCase();
  if(!tokens.length&&!gl){
    return needTag||needPlat?50:0;
  }
  if(!tokens.length&&gl){
    if((p.title||"").toLowerCase().includes(gl))return 100;
    if(hay.includes(gl))return 80;
    if(fuzzyCharsInOrder(gl,hay))return 55;
    return 0;
  }
  let sc=0;
  for(const t of tokens){
    if(!t)continue;
    if((p.title||"").toLowerCase().includes(t))sc+=40;
    else if(hay.includes(t))sc+=26;
    else if(fuzzyCharsInOrder(t,hay))sc+=14;
  }
  return sc;
}
const $=id=>document.getElementById(id);


// ═══════ PROMPT CHAINS — annotation model + integrity enforcer ═══════
//
// A chain is a named sequence of prompts. Membership is an ANNOTATION carried by the prompt
// itself — "AA2" means "stage 2 of chain AA" — not a pointer to another prompt's id.
// That choice is the whole point: generated ids are re-minted on import (generateId), so
// pointer-based chains die on any round-trip, while an annotation travels with the prompt
// like a tag and survives export, import, uninstall and reinstall.
//
// Two consequences worth knowing:
//   • Deleting a middle step leaves a visible GAP instead of severing everything downstream.
//   • A prompt can carry several annotations, so one prompt can be a step in several chains.
//
// cfg.chainGlossary maps prefix → {title}. The annotations alone reconstruct the STRUCTURE;
// the glossary only supplies the NAME. So a lost glossary degrades to "Unnamed chain AA"
// rather than a broken chain — losing it is survivable by design.
//
// Everything below is written to be run against untrusted data (hand-edited CSV, a
// half-restored vault, an LLM's best guess). Nothing here throws on bad input and NOTHING is
// ever silently discarded: unparseable annotations are quarantined on the item that carried
// them so a human can still see and recover them.

const PV_CHAIN_MAX_STAGE=999;      // guards absurd stage numbers from a bad import
const PV_CHAIN_MAX_PREFIX=676;     // AA..ZZ
// One optional separator BETWEEN the prefix and the stage — never inside either. Blanket-
// stripping punctuation first looks friendlier but silently rewrites meaning: "AA1.5" would
// collapse to stage 15. Anything that does not fit this shape is quarantined, not guessed at.
const PV_CHAIN_TAG_RE=/^([A-Z]{2})[\s._-]?([0-9]{1,3})$/;

function pvChainIndexToPrefix(i){
  if(!(i>=0)||i>=PV_CHAIN_MAX_PREFIX)return "";
  return String.fromCharCode(65+Math.floor(i/26))+String.fromCharCode(65+(i%26));
}
function pvChainPrefixToIndex(p){
  if(typeof p!=="string"||!/^[A-Z]{2}$/.test(p))return -1;
  return (p.charCodeAt(0)-65)*26+(p.charCodeAt(1)-65);
}

// Lenient parse, strict output. Accepts "aa2", " AA-2 ", "AA_2" → {prefix:"AA",stage:2}.
// Returns null for anything it cannot make canonical sense of — callers quarantine those.
function pvChainParseTag(raw){
  if(raw===null||raw===undefined)return null;
  const s=String(raw).trim().toUpperCase();
  const m=PV_CHAIN_TAG_RE.exec(s);
  if(!m)return null;
  const stage=parseInt(m[2],10);
  if(!(stage>=1)||stage>PV_CHAIN_MAX_STAGE)return null;
  return {prefix:m[1],stage,tag:m[1]+stage};
}
function pvChainTag(prefix,stage){return String(prefix)+String(stage)}

// Normalizes one item's annotations in place. Returns what changed so callers can report.
// Guarantees afterwards: item.chains is an array of canonical tags, sorted, with at most one
// entry per prefix; anything unparseable lives on item.chainBad instead of being dropped.
function pvChainNormalizeItem(item){
  if(!item||typeof item!=="object")return{changed:false,quarantined:[],dropped:[]};
  const raw=Array.isArray(item.chains)?item.chains:(item.chains?[item.chains]:[]);
  const seen=new Map(),quarantined=[],dropped=[];
  for(const entry of raw){
    const parsed=pvChainParseTag(entry);
    if(!parsed){
      const text=String(entry===null||entry===undefined?"":entry).trim();
      if(text)quarantined.push(text);
      continue;
    }
    // One prompt cannot occupy two stages of the SAME chain — keep the lowest, report the rest.
    const prior=seen.get(parsed.prefix);
    if(prior===undefined)seen.set(parsed.prefix,parsed.stage);
    else{dropped.push(parsed.tag);if(parsed.stage<prior)seen.set(parsed.prefix,parsed.stage)}
  }
  const next=[...seen.entries()].map(([p,s])=>pvChainTag(p,s)).sort();
  const before=JSON.stringify(raw),after=JSON.stringify(next);
  item.chains=next;
  if(quarantined.length){
    const keep=Array.isArray(item.chainBad)?item.chainBad.slice():[];
    for(const q of quarantined)if(!keep.includes(q))keep.push(q);
    item.chainBad=keep;
  }
  if(!item.chains.length)delete item.chains;
  return{changed:before!==after,quarantined,dropped};
}

// Live walker — allItems() returns copies, which cannot be mutated.
function pvChainWalk(node,fn,folder){
  if(!node)return;
  for(const p of(node.prompts||[]))fn(p,node);
  for(const c of(node.children||[]))pvChainWalk(c,fn,c);
}
function pvChainAllItems(root){const out=[];pvChainWalk(root,(p,f)=>out.push({item:p,folder:f}));return out}

// Every prefix currently claimed by an annotation, whether or not the glossary knows it.
function pvChainCollect(root){
  const map=new Map();
  pvChainWalk(root,(p,f)=>{
    for(const tag of(Array.isArray(p.chains)?p.chains:[])){
      const parsed=pvChainParseTag(tag);
      if(!parsed)continue;
      if(!map.has(parsed.prefix))map.set(parsed.prefix,[]);
      map.get(parsed.prefix).push({item:p,folder:f,stage:parsed.stage});
    }
  });
  for(const rows of map.values())rows.sort((a,b)=>a.stage-b.stage||String(a.item.id).localeCompare(String(b.item.id)));
  return map;
}

function pvChainGlossary(){
  if(typeof cfg==="undefined"||!cfg)return{};
  if(!cfg.chainGlossary||typeof cfg.chainGlossary!=="object"||Array.isArray(cfg.chainGlossary))cfg.chainGlossary={};
  return cfg.chainGlossary;
}
function pvChainTitle(prefix,glossary){
  const g=glossary||pvChainGlossary();
  const e=g[prefix];
  return (e&&typeof e.title==="string"&&e.title.trim())?e.title.trim():("Unnamed chain "+prefix);
}

// Lowest UNUSED prefix, considering the glossary and live annotations together. Counting
// chains would collide the moment one is deleted, so scan for a genuine hole instead.
function pvChainAllocPrefix(root,glossary){
  const used=new Set(Object.keys(glossary||pvChainGlossary()).filter(k=>/^[A-Z]{2}$/.test(k)));
  for(const prefix of pvChainCollect(root).keys())used.add(prefix);
  for(let i=0;i<PV_CHAIN_MAX_PREFIX;i++){
    const p=pvChainIndexToPrefix(i);
    if(!used.has(p))return p;
  }
  return "";   // exhausted — caller must report, never silently reuse
}

function pvChainCreate(root,title){
  const g=pvChainGlossary(),prefix=pvChainAllocPrefix(root,g);
  if(!prefix)return null;
  g[prefix]={title:String(title||"").trim()||("Chain "+prefix),created:Date.now()};
  return prefix;
}

// Append an item as the next stage. Idempotent: an item already in the chain keeps its stage.
function pvChainAppend(root,item,prefix){
  if(!item||!/^[A-Z]{2}$/.test(prefix||""))return null;
  pvChainNormalizeItem(item);
  const existing=(item.chains||[]).map(pvChainParseTag).find(x=>x&&x.prefix===prefix);
  if(existing)return existing.stage;
  const rows=pvChainCollect(root).get(prefix)||[];
  const stage=Math.min(PV_CHAIN_MAX_STAGE,(rows.length?rows[rows.length-1].stage:0)+1);
  item.chains=[...(item.chains||[]),pvChainTag(prefix,stage)];
  pvChainNormalizeItem(item);
  return stage;
}
function pvChainRemove(item,prefix){
  if(!item||!Array.isArray(item.chains))return false;
  const before=item.chains.length;
  item.chains=item.chains.filter(t=>{const p=pvChainParseTag(t);return !p||p.prefix!==prefix});
  pvChainNormalizeItem(item);
  return (item.chains||[]).length!==before;
}

// Renumber a chain densely from 1 in the given id order. Written as one in-memory pass so a
// half-applied renumber (which would leave duplicate stages) cannot happen.
function pvChainReorder(root,prefix,orderedIds){
  const rows=pvChainCollect(root).get(prefix)||[];
  if(!rows.length)return 0;
  const byId=new Map(rows.map(r=>[String(r.item.id),r]));
  const seq=[];
  for(const id of(orderedIds||[]))if(byId.has(String(id))){seq.push(byId.get(String(id)));byId.delete(String(id))}
  for(const r of rows)if(byId.has(String(r.item.id))){seq.push(r);byId.delete(String(r.item.id))}   // anything not named keeps its relative place
  seq.forEach((r,i)=>{
    const stage=i+1;
    r.item.chains=(r.item.chains||[]).filter(t=>{const p=pvChainParseTag(t);return !p||p.prefix!==prefix});
    r.item.chains.push(pvChainTag(prefix,stage));
    pvChainNormalizeItem(r.item);
  });
  return seq.length;
}
// Close gaps left by deletions without changing order.
function pvChainCompact(root,prefix){
  const rows=pvChainCollect(root).get(prefix)||[];
  return pvChainReorder(root,prefix,rows.map(r=>r.item.id));
}

// A copy is not the same step. Duplicating a prompt must never mint a second claim on a
// stage — strip membership and let the user re-file the copy deliberately.
function pvChainStripForCopy(item){
  if(!item)return item;
  delete item.chains;delete item.chainBad;
  return item;
}

// Ordered steps of one chain, each annotated with its position for "step 3 of 6".
function pvChainSteps(root,prefix){
  const rows=pvChainCollect(root).get(prefix)||[];
  return rows.map((r,i)=>({...r,index:i+1,total:rows.length}));
}
// The next step after `item`, used to chamber a follow-up. `preferPrefix` keeps a run inside
// the chain the user actually started when a prompt belongs to several.
function pvChainNextStep(root,item,preferPrefix){
  if(!item||!Array.isArray(item.chains)||!item.chains.length)return null;
  const mine=item.chains.map(pvChainParseTag).filter(Boolean);
  if(!mine.length)return null;
  const ordered=preferPrefix?[...mine.filter(m=>m.prefix===preferPrefix),...mine.filter(m=>m.prefix!==preferPrefix)]:mine;
  for(const m of ordered){
    const steps=pvChainSteps(root,m.prefix);
    const at=steps.findIndex(s=>String(s.item.id)===String(item.id));
    if(at>=0&&at+1<steps.length){
      const nxt=steps[at+1];
      return{prefix:m.prefix,item:nxt.item,stage:nxt.stage,index:nxt.index,total:nxt.total};
    }
  }
  return null;   // last step of every chain it belongs to
}

// ── The audit: every way this can be wrong, named ──
// severity: "error" needs a decision, "warn" is survivable, "info" is cosmetic.
function pvChainAudit(root,glossary){
  const g=glossary||pvChainGlossary();
  const collected=pvChainCollect(root),issues=[],chains=[];
  const push=(kind,severity,prefix,detail,fix)=>issues.push({kind,severity,prefix,detail,fix});

  for(const [prefix,rows] of [...collected.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){
    const byStage=new Map();
    for(const r of rows){
      if(!byStage.has(r.stage))byStage.set(r.stage,[]);
      byStage.get(r.stage).push(r);
    }
    const dupes=[...byStage.entries()].filter(([,v])=>v.length>1);
    for(const [stage,v] of dupes)push("duplicate-stage","error",prefix,`${v.length} prompts both claim ${prefix}${stage}`,"compact");
    const stages=[...byStage.keys()].sort((a,b)=>a-b);
    const gaps=[];
    for(let s=1;s<=(stages[stages.length-1]||0);s++)if(!byStage.has(s))gaps.push(s);
    if(gaps.length)push("gap","warn",prefix,`missing stage${gaps.length>1?"s":""} ${gaps.join(", ")} — a step was probably deleted`,"compact");
    if(!g[prefix])push("missing-glossary","warn",prefix,"chain has steps but no name","name");
    chains.push({prefix,title:pvChainTitle(prefix,g),steps:rows,gaps,duplicates:dupes.map(([s])=>s),count:rows.length});
  }
  for(const prefix of Object.keys(g)){
    if(!/^[A-Z]{2}$/.test(prefix)){push("bad-prefix","error",prefix,"glossary key is not a two-letter prefix","drop-glossary");continue}
    if(!collected.has(prefix))push("empty-chain","info",prefix,`"${pvChainTitle(prefix,g)}" has no steps`,"drop-glossary");
  }
  let quarantined=0;
  pvChainWalk(root,p=>{if(Array.isArray(p.chainBad)&&p.chainBad.length)quarantined+=p.chainBad.length});
  if(quarantined)push("quarantined","warn","",`${quarantined} unreadable chain annotation${quarantined>1?"s":""} kept aside for review`,"review");
  if(collected.size>=PV_CHAIN_MAX_PREFIX)push("exhausted","error","","all 676 chain prefixes are in use","");

  return{chains,issues,total:collected.size,
    errors:issues.filter(i=>i.severity==="error").length,
    warnings:issues.filter(i=>i.severity==="warn").length};
}

// ── Repair: only ever does what the audit named, always reports what it touched ──
function pvChainRepair(root,opts){
  opts=opts||{};
  const g=pvChainGlossary(),report={normalized:0,compacted:[],named:[],droppedGlossary:[],clearedQuarantine:0};
  pvChainWalk(root,p=>{const r=pvChainNormalizeItem(p);if(r.changed||r.quarantined.length||r.dropped.length)report.normalized++});
  const audit=pvChainAudit(root,g);
  for(const c of audit.chains){
    if(opts.compact!==false&&(c.duplicates.length||c.gaps.length)){pvChainCompact(root,c.prefix);report.compacted.push(c.prefix)}
    if(opts.name!==false&&!g[c.prefix]){g[c.prefix]={title:"Unnamed chain "+c.prefix,created:Date.now(),recovered:true};report.named.push(c.prefix)}
  }
  if(opts.dropEmpty){
    for(const i of audit.issues)if(i.kind==="empty-chain"||i.kind==="bad-prefix"){delete g[i.prefix];report.droppedGlossary.push(i.prefix)}
  }
  if(opts.clearQuarantine){
    pvChainWalk(root,p=>{if(Array.isArray(p.chainBad)&&p.chainBad.length){report.clearedQuarantine+=p.chainBad.length;delete p.chainBad}});
  }
  return report;
}

// ── Migration from the old single `nextId` pointer ──
// Walks each chain head (a prompt nothing points at) and lays down annotations. Cycle-safe,
// and leaves nextId untouched so the old behaviour still works if this needs backing out.
function pvChainMigrateFromNextId(root){
  const rows=pvChainAllItems(root),byId=new Map(rows.map(r=>[String(r.item.id),r.item]));
  const pointedAt=new Set();
  for(const {item} of rows)if(item.nextId&&byId.has(String(item.nextId)))pointedAt.add(String(item.nextId));
  const heads=rows.filter(r=>r.item.nextId&&byId.has(String(r.item.nextId))&&!pointedAt.has(String(r.item.id)));
  const g=pvChainGlossary(),made=[];
  const claim=item=>Array.isArray(item.chains)&&item.chains.length;
  for(const head of heads){
    if(claim(head.item))continue;                       // already migrated — never double-apply
    const prefix=pvChainAllocPrefix(root,g);
    if(!prefix)break;                                    // out of prefixes: stop, report, lose nothing
    g[prefix]={title:(head.item.title||"Chain")+"",created:Date.now(),migrated:true};
    let cur=head.item,stage=1;const guard=new Set();
    while(cur&&stage<=PV_CHAIN_MAX_STAGE){
      if(guard.has(String(cur.id)))break;               // pointer cycle — stop cleanly
      guard.add(String(cur.id));
      cur.chains=[...(cur.chains||[]),pvChainTag(prefix,stage)];
      pvChainNormalizeItem(cur);
      const nxt=cur.nextId?byId.get(String(cur.nextId)):null;
      if(!nxt)break;
      cur=nxt;stage++;
    }
    made.push({prefix,steps:stage});
  }
  return made;
}

if(typeof module!=="undefined"&&module.exports){
  module.exports={pvChainParseTag,pvChainNormalizeItem,pvChainCollect,pvChainAllocPrefix,pvChainAppend,pvChainRemove,pvChainReorder,pvChainCompact,pvChainAudit,pvChainRepair,pvChainMigrateFromNextId,pvChainIndexToPrefix,pvChainPrefixToIndex,pvChainStripForCopy,pvChainCreate,pvChainTag,pvChainSteps,pvChainNextStep};
}

// ═══════ RECENT ACTIVITY + LAST INJECT (storage keys shared with service worker) ═══════
const PV_RECENT_KEY = "pv_recent_activity";
const PV_LAST_INJECT_KEY = "pv_last_inject";

/** @param {{kind?:string,action?:string,id:string,folderId?:string,title?:string}} o */
function recordVaultRecent(o) {
  if (!o || !o.id) return;
  const entry = {
    kind: o.kind || "prompt",
    action: o.action || "open",
    id: o.id,
    folderId: o.folderId || "",
    title: (o.title || "").slice(0, 120),
    ts: Date.now()
  };
  chrome.storage.local.get([PV_RECENT_KEY], (res) => {
    let arr = res[PV_RECENT_KEY] || [];
    arr = arr.filter((x) => !(x.id === entry.id && x.kind === entry.kind));
    arr.unshift(entry);
    if (arr.length > 40) arr = arr.slice(0, 40);
    chrome.storage.local.set({ [PV_RECENT_KEY]: arr });
  });
}

function setLastInjectMeta(promptId, folderId) {
  if (!promptId) return;
  chrome.storage.local.set({
    [PV_LAST_INJECT_KEY]: { promptId, folderId: folderId || "", ts: Date.now() }
  });
}

// ═══════ VAULT BACKUP / RESTORE PAYLOAD — pure validation (no Chrome APIs) ═══════
// Used by cloud restore, Drive pull, and import paths. Covered by pvtest.html / tests/.

const PV_PAYLOAD_MAX_DEPTH = 96;
const PV_PAYLOAD_MAX_NODES = 250000;
const PV_PAYLOAD_MAX_CHILDREN = 5000;
const PV_PAYLOAD_MAX_PROMPTS = 100000;
const PV_PAYLOAD_MAX_ID_LEN = 256;
const PV_PAYLOAD_MAX_NAME_LEN = 4000;

/**
 * Reject prototype-pollution keys anywhere in the parsed JSON tree.
 * @param {unknown} obj
 * @param {number} [depth]
 * @param {WeakSet<object>|undefined} [seen]
 * @returns {boolean} true if unsafe key found
 */
function vaultPayloadHasUnsafeKeys(obj, depth, seen) {
  if (depth === undefined) depth = 0;
  if (depth > 48) return true;
  if (obj === null || typeof obj !== "object") return false;
  if (!seen) seen = new WeakSet();
  if (seen.has(obj)) return false;
  seen.add(obj);
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (k === "__proto__" || k === "constructor" || k === "prototype") return true;
    if (vaultPayloadHasUnsafeKeys(obj[k], depth + 1, seen)) return true;
  }
  if (Array.isArray(obj)) {
    for (let j = 0; j < obj.length; j++) {
      if (vaultPayloadHasUnsafeKeys(obj[j], depth + 1, seen)) return true;
    }
  }
  return false;
}

/**
 * Iterative folder-tree shape check (depth, fan-out, total node budget).
 * @param {unknown} node
 * @returns {boolean}
 */
function isValidFolderTree(node) {
  if (!node || typeof node !== "object") return false;
  const stack = [{ n: node, d: 0 }];
  let remaining = PV_PAYLOAD_MAX_NODES;
  while (stack.length) {
    if (--remaining < 0) return false;
    const cur = stack.pop();
    const n = cur.n;
    const d = cur.d;
    if (!n || typeof n !== "object") return false;
    if (d > PV_PAYLOAD_MAX_DEPTH) return false;
    if (typeof n.id !== "string" || n.id.length === 0 || n.id.length > PV_PAYLOAD_MAX_ID_LEN) return false;
    if (typeof n.name !== "string" || n.name.length > PV_PAYLOAD_MAX_NAME_LEN) return false;
    if (!Array.isArray(n.children) || !Array.isArray(n.prompts)) return false;
    if (n.children.length > PV_PAYLOAD_MAX_CHILDREN || n.prompts.length > PV_PAYLOAD_MAX_PROMPTS) return false;
    for (let i = 0; i < n.children.length; i++) stack.push({ n: n.children[i], d: d + 1 });
  }
  return true;
}

/**
 * @param {unknown} store
 * @returns {boolean}
 */
function isValidStoreShape(store) {
  if (!store || typeof store !== "object" || Array.isArray(store)) return false;
  if (!store.folders || typeof store.folders !== "object") return false;
  if (!isValidFolderTree(store.folders)) return false;
  if (store.trash !== undefined && !Array.isArray(store.trash)) return false;
  if (store.collections !== undefined && !Array.isArray(store.collections)) return false;
  if (store.nextId !== undefined && (typeof store.nextId !== "number" || !Number.isFinite(store.nextId))) return false;
  return true;
}

function isPlainJsonObject(x) {
  if (!x || typeof x !== "object" || Array.isArray(x)) return false;
  return Object.getPrototypeOf(x) === Object.prototype;
}

/**
 * Optional top-level fields (not counted toward validStores).
 * @param {unknown} uc
 * @returns {boolean}
 */
function isValidUniversalCapsulesField(uc) {
  if (uc === undefined) return true;
  if (!uc || typeof uc !== "object" || Array.isArray(uc)) return false;
  if (!isPlainJsonObject(uc)) return false;
  if (vaultPayloadHasUnsafeKeys(uc)) return false;
  return true;
}

/**
 * Full-view image builder basket state (pv_baskets).
 * @param {unknown} b
 * @returns {boolean}
 */
function isValidImgBuilderBasketsField(b) {
  if (b === undefined) return true;
  if (!b || typeof b !== "object" || Array.isArray(b)) return false;
  if (!isPlainJsonObject(b)) return false;
  if (vaultPayloadHasUnsafeKeys(b)) return false;
  return true;
}

/**
 * @param {unknown} d Parsed JSON or object from backup file / Drive
 * @returns {boolean} true if structure is safe to pass into restoreVault()
 */
function isValidVaultPayload(d) {
  if (!d || typeof d !== "object" || Array.isArray(d)) return false;
  if (!isPlainJsonObject(d)) return false;
  if (vaultPayloadHasUnsafeKeys(d)) return false;
  if (d.version !== undefined && typeof d.version !== "string") return false;
  if (d.exportedAt !== undefined && typeof d.exportedAt !== "string") return false;
  const stores = ["prompts", "snippets", "bookmarks", "notes", "skills", "customgpts", "photos", "lists", "chats", "projects", "files"];
  let validStores = 0;
  for (let s = 0; s < stores.length; s++) {
    const k = stores[s];
    if (d[k]) {
      if (!isValidStoreShape(d[k])) return false;
      validStores++;
    }
  }
  if (d.imgprompts) {
    if (!isValidStoreShape(d.imgprompts)) return false;
    validStores++;
  }
  if (d.workspaces !== undefined) {
    if (!isPlainJsonObject(d.workspaces) || vaultPayloadHasUnsafeKeys(d.workspaces)) return false;
    if (!Array.isArray(d.workspaces.workspaces)) return false;
  }
  if (d.config !== undefined) {
    if (!isPlainJsonObject(d.config)) return false;
    if (vaultPayloadHasUnsafeKeys(d.config)) return false;
  }
  if (!isValidUniversalCapsulesField(d.universalCapsules)) return false;
  if (!isValidImgBuilderBasketsField(d.imgBuilderBaskets)) return false;
  return validStores >= 1;
}

/**
 * Human-readable rejection reason for logs / support (not shown to users verbatim).
 * @param {unknown} d
 * @returns {string}
 */
function describeVaultPayloadRejection(d) {
  if (d === null || d === undefined) return "payload is null or undefined";
  if (typeof d !== "object") return "payload is not an object";
  if (Array.isArray(d)) return "payload is an array";
  if (!isPlainJsonObject(d)) return "payload is not a plain object";
  if (vaultPayloadHasUnsafeKeys(d)) return "payload contains unsafe keys (__proto__, constructor, or prototype)";
  if (d.version !== undefined && typeof d.version !== "string") return "version must be a string when present";
  if (d.exportedAt !== undefined && typeof d.exportedAt !== "string") return "exportedAt must be a string when present";
  const stores = ["prompts", "snippets", "bookmarks", "notes", "skills", "customgpts", "photos", "lists", "chats", "projects", "files"];
  let validStores = 0;
  for (let s = 0; s < stores.length; s++) {
    const k = stores[s];
    if (!d[k]) continue;
    if (!isValidStoreShape(d[k])) return `store "${k}" has invalid folder tree or metadata`;
    validStores++;
  }
  if (d.imgprompts) {
    if (!isValidStoreShape(d.imgprompts)) return "imgprompts has invalid folder tree or metadata";
    validStores++;
  }
  if (d.config !== undefined && (!isPlainJsonObject(d.config) || vaultPayloadHasUnsafeKeys(d.config))) return "config is invalid or unsafe";
  if (!isValidUniversalCapsulesField(d.universalCapsules)) return "universalCapsules is invalid or unsafe";
  if (!isValidImgBuilderBasketsField(d.imgBuilderBaskets)) return "imgBuilderBaskets is invalid or unsafe";
  if (validStores < 1) return "no valid store (need at least one of prompts/snippets/bookmarks/notes/skills/customgpts/imgprompts)";
  return "unknown";
}

// ═══════ GOOGLE DRIVE AUTO-SYNC (BULLETPROOF) ═══════
// HTTP + payload + prune + archive merge: drive-shared.js (PVDrive) — also used by the service worker.
function pvGdHttp(){
  if(typeof PVDrive==="undefined")throw new Error("drive-shared.js not loaded — reload the extension");
  if(!GD._driveHttp){
    GD._driveHttp=PVDrive.createDriveHttp({
      getToken:async (interactive)=>{await GD.getToken(interactive);return GD._token},
      invalidateToken:()=>{GD._token=null}
    },{keepDaily:GD.KEEP_DAILY,keepWeekly:GD.KEEP_WEEKLY});
  }
  return GD._driveHttp;
}
const GD={
  FOLDER_NAME:"Prompt Vault Backups",
  ARCHIVE_FOLDER_NAME:"Prompt Vault Archive",
  SCOPE:"https://www.googleapis.com/auth/drive.file",
  _token:null,_driveHttp:null,_syncing:false,_lastSync:0,_timer:null,_error:null,_connected:false,_paused:false,_archiving:false,
  DEBOUNCE:120000, // 2 minutes
  KEEP_DAILY:14,   // keep 14 daily backups
  KEEP_WEEKLY:4,   // keep 4 weekly beyond that

  // ── Item count snapshot for data loss detection ──
  itemCounts(){
    let wsN=0;try{if(WS&&Array.isArray(WS.workspaces)){const w=x=>{wsN+=1+(Array.isArray(x.blocks)?x.blocks.length:0);(x.children||[]).forEach(w)};WS.workspaces.forEach(w);wsN+=Array.isArray(WS.inbox)?WS.inbox.length:0}}catch{}
    return{
      prompts:countItems(P.folders).prompts,imgprompts:countItems(IP.folders).prompts,skills:countItems(KL.folders).prompts,
      snippets:countItems(SN.folders).prompts,bookmarks:countItems(BM.folders).prompts,
      notes:countItems(NT.folders).prompts,customgpts:countItems(GP.folders).prompts,
      lists:LS?.folders?countItems(LS.folders).prompts:0,
      projects:PRJ?.folders?countItems(PRJ.folders).prompts:0,chats:CH?.folders?countItems(CH.folders).prompts:0,workspaces:wsN,
      files:(typeof PVF!=="undefined"&&PVF.D&&PVF.D.folders)?countItems(PVF.D.folders).prompts:0,
      get total(){return this.prompts+this.imgprompts+this.skills+this.snippets+this.bookmarks+this.notes+this.customgpts+this.lists+this.projects+this.chats+this.workspaces+this.files}
    };
  },
  // Authoritative, files-aware count for data-loss gates (pre-restore safety copy +
  // startup pull). Fetches pv_f from storage and routes through the shared counter,
  // so a vault holding ONLY file metadata is never mistaken for empty. The sync
  // itemCounts() above is best-effort (counts files only when the Files tree is in memory).
  async itemCountsFull(){
    try{
      const r=await new Promise(res=>chrome.storage.local.get(["pv_f"],x=>res(x||{})));
      if(typeof PVDrive!=="undefined"&&PVDrive.itemCountsFromStores){
        return PVDrive.itemCountsFromStores(P,SN,BM,NT,KL,GP,IP,PRJ,CH,WS,r.pv_f,LS);
      }
    }catch(e){console.warn("[PV] itemCountsFull fell back to sync:",e&&e.message)}
    return GD.itemCounts();
  },

  async getToken(interactive=false){
    return new Promise((res,rej)=>{
      chrome.identity.getAuthToken({interactive},token=>{
        if(chrome.runtime.lastError){rej(chrome.runtime.lastError);return}
        GD._token=token;GD._connected=true;res(token);
      });
    });
  },

  async api(path,opts){return pvGdHttp().api(path,opts||{})},

  async findOrCreateFolder(){return pvGdHttp().findOrCreateMainFolder(GD.FOLDER_NAME)},

  async uploadFile(folderId,fileName,jsonStr,existingFileId){return pvGdHttp().uploadFile(folderId,fileName,jsonStr,existingFileId)},

  async findFile(folderId,fileName){return pvGdHttp().findFile(folderId,fileName)},

  buildPayload(){return PVDrive.buildVaultBackupPayload(P,SN,BM,NT,KL,GP,IP,cfg,UC,undefined,meta,CH,WS,PRJ,undefined,PH,LS)},

  // ═══ PUSH — service worker is source of truth (runs with UI closed; uses chrome.alarms) ═══
  async push(force=false){
    if(GD._syncing||!GD._connected)return;
    GD._syncing=true;GD._error=null;rFtr();
    try{
      const pushRes=await new Promise((res,rej)=>{
        try{
          chrome.runtime.sendMessage({type:"RUN_DRIVE_PUSH",force:!!force},response=>{
            if(chrome.runtime.lastError)rej(new Error(chrome.runtime.lastError.message));
            else res(response||{});
          });
        }catch(e){rej(e)}
      });
      await new Promise(res=>chrome.storage.local.get([MK],o=>{if(o[MK]&&typeof meta!=="undefined")Object.assign(meta,o[MK]);res()}));
      syncGdStateFromMeta();
      if(pushRes&&!pushRes.ok&&pushRes.error)GD._error=pushRes.error;
    }catch(e){
      GD._error=e.message||"Push failed";
      console.error("Drive sync error:",e);
    }
    GD._syncing=false;rFtr();
  },

  // ═══ FORCE PUSH — user explicitly confirms pushing potentially reduced data ═══
  async forcePush(){
    await GD.push(true);
    if(!GD._error)flash("OK Force synced to Drive");
  },

  async pruneBackups(folderId){return pvGdHttp().pruneOldDailyBackups(folderId)},

  // ═══ LIST BACKUPS — browse all available versions on Drive ═══
  async listBackups(){
    try{
      const fid=await GD.findOrCreateFolder();
      const sr=await GD.api(`/drive/v3/files?q='${fid}' in parents and trashed=false&orderBy=modifiedTime desc&pageSize=50&fields=files(id,name,modifiedTime,size)`);
      const sd=await sr.json();
      return(sd.files||[]).map(f=>({id:f.id,name:f.name,modified:f.modifiedTime,size:f.size?Math.round(+f.size/1024):null}));
    }catch(e){GD._error=e.message;throw e}
  },

  // ═══ PULL — fetch a specific backup by ID, or latest ═══
  async pull(fileId){
    try{
      const fid=await GD.findOrCreateFolder();
      let fTarget;
      if(fileId){
        // Specific file requested
        fTarget={id:fileId};
      }else{
        // Get latest (the "prompt-vault-backup.json" file)
        const sr=await GD.api(`/drive/v3/files?q=name='prompt-vault-backup.json' and '${fid}' in parents and trashed=false&fields=files(id,name,modifiedTime)`);
        const sd=await sr.json();
        if(!sd.files?.length){
          // Fallback: get most recent dated file
          const sr2=await GD.api(`/drive/v3/files?q='${fid}' in parents and trashed=false&orderBy=modifiedTime desc&pageSize=1&fields=files(id,name,modifiedTime)`);
          const sd2=await sr2.json();
          if(!sd2.files?.length)return null;
          fTarget=sd2.files[0];
        }else{fTarget=sd.files[0]}
      }
      const dr=await GD.api(`/drive/v3/files/${fTarget.id}?alt=media`);
      const json=await dr.text();
      const data=JSON.parse(json);
      // Validate before returning — never pass garbage to restoreVault
      if(typeof isValidVaultPayload==="function"&&!isValidVaultPayload(data)){
        console.error("[PV] Pull blocked: invalid payload from Drive",fTarget.name,typeof describeVaultPayloadRejection==="function"?describeVaultPayloadRejection(data):"");
        GD._error="Backup file is invalid or empty";
        return null;
      }
      return{data,name:fTarget.name||"backup",modified:fTarget.modifiedTime||""};
    }catch(e){GD._error=e.message;throw e}
  },

  // ═══ SAFE RESTORE — auto-saves current state before replacing ═══
  async safeRestore(fileId){
    // Step 1: Save current state as a "pre-restore" safety backup
    const currentCounts=await GD.itemCountsFull();
    if(currentCounts.total>0){
      try{
        const fid=await GD.findOrCreateFolder();
        const safetyName=`prompt-vault-pre-restore-${new Date().toISOString().slice(0,19).replace(/[T:]/g,"-")}.json`;
        const safetyPayload=await new Promise((res,rej)=>{
          chrome.storage.local.get(["pv_baskets","pv_f"],r=>{
            try{
              res(PVDrive.buildVaultBackupPayload(P,SN,BM,NT,KL,GP,IP,cfg,UC,r.pv_baskets,meta,CH,WS,PRJ,r.pv_f,PH));
            }catch(e){rej(e)}
          });
        });
        await GD.uploadFile(fid,safetyName,JSON.stringify(safetyPayload),null);
      }catch(e){console.warn("Pre-restore safety backup failed:",e)}
    }
    // Step 2: Pull the requested backup
    const r=await GD.pull(fileId);
    if(!r)return null;
    // Step 3: Apply (caller does the actual data replacement)
    return r;
  },

  // ═══ PERMANENT ARCHIVE — append-only, items go in but never come out ═══

  async findOrCreateArchiveFolder(){return pvGdHttp().findOrCreateArchiveFolder(GD.ARCHIVE_FOLDER_NAME)},

  collectAllItems(){return PVDrive.collectArchiveItems(P,KL,SN,BM,NT,GP)},

  async archivePush(){
    if(!GD._connected||!cfg.archiveEnabled||GD._archiving)return;
    GD._archiving=true;
    try{
      const fid=await GD.findOrCreateArchiveFolder();
      const fname="prompt-vault-archive.json";

      // Read existing archive from Drive (if any)
      let archive={items:{},version:"1.0",updatedAt:null,totalItems:0};
      const existingFile=await GD.findFile(fid,fname);
      if(existingFile){
        try{
          const dr=await GD.api(`/drive/v3/files/${existingFile.id}?alt=media`);
          const json=await dr.text();
          archive=JSON.parse(json);
        }catch(e){console.warn("Archive read failed, starting fresh:",e)}
      }

      const currentItems=GD.collectAllItems();
      archive=PVDrive.mergeIntoArchive(archive,currentItems);

      // Write back
      const json=JSON.stringify(archive);
      await GD.uploadFile(fid,fname,json,existingFile?.id||null);

      meta.gdArchiveSync=Date.now();
      meta.gdArchiveCount=archive.totalItems;
      chrome.storage.local.set({[MK]:meta});
    }catch(e){console.error("Archive push error:",e)}
    GD._archiving=false;
  },

  async archiveRead(){
    try{
      const fid=await GD.findOrCreateArchiveFolder();
      const fname="prompt-vault-archive.json";
      const existingFile=await GD.findFile(fid,fname);
      if(!existingFile)return null;
      const dr=await GD.api(`/drive/v3/files/${existingFile.id}?alt=media`);
      const json=await dr.text();
      return JSON.parse(json);
    }catch(e){GD._error=e.message;throw e}
  },

  // Recover items from archive into local stores
  recoverFromArchive(archive,itemIds){
    if(!archive?.items)return 0;
    let recovered=0;
    const storeMap={prompts:P,skills:KL,snippets:SN,bookmarks:BM,notes:NT,customgpts:GP,projects:PRJ,chats:CH};
    const rootMap={prompts:"root",skills:"kroot",snippets:"sroot",bookmarks:"broot",notes:"nroot",customgpts:"groot",chats:"chroot"};

    for(const id of itemIds){
      const archived=archive.items[id];
      if(!archived)continue;
      const store=storeMap[archived.store];
      if(!store)continue;

      // Check if item already exists locally
      const existing=findItemGlobal(store.folders,id);
      if(existing)continue; // skip — already in local state

      // Find or use root folder
      let targetFolder=findFolder(store.folders,archived.folderId);
      if(!targetFolder)targetFolder=store.folders; // fall back to root

      targetFolder.prompts=targetFolder.prompts||[];
      const item={
        id:archived.id,title:archived.title,content:archived.content,
        tags:archived.tags||[],url:archived.url||"",platform:archived.platform||"",
        sourceUrl:archived.sourceUrl||"",sourceTitle:archived.sourceTitle||"",
        sourceType:archived.sourceType||"",capturedAt:archived.capturedAt||null,
        description:archived.description||"",
        created:archived.created||Date.now(),modified:Date.now(),
        usageCount:archived.usageCount||0,favorited:archived.favorited||false,
        versions:(archived.versions||[]).slice(-20) // restore version history, capped at local limit
      };
      if(archived.store==="skills")item.files=archived.files||{};
      targetFolder.prompts.push(item);
      recovered++;
    }
    if(recovered>0)save();
    return recovered;
  },

  async connect(){
    try{
      await GD.getToken(true);
      GD._connected=true;
      cfg.driveConnected=true;
      save();
      flash("OK Google Drive connected");
      rFtr();
      try{chrome.runtime.sendMessage({type:"RUN_DRIVE_PUSH",force:false},()=>{})}catch{}
    }catch(e){
      GD._connected=false;
      const msg=e.message||"";
      if(msg.includes("bad client id")||msg.includes("{0}"))flash("Drive not configured — set OAuth client ID in manifest.json");
      else if(msg.includes("canceled")||msg.includes("cancelled"))flash("Drive connection canceled");
      else flash("Drive error: "+msg.slice(0,60));
    }
  },

  disconnect(){
    try{chrome.runtime.sendMessage({type:"CANCEL_DRIVE_PUSH"},()=>{})}catch{}
    if(GD._token){chrome.identity.removeCachedAuthToken({token:GD._token},()=>{})}
    GD._driveHttp?.resetFolderCaches();
    GD._driveHttp=null;
    GD._token=null;GD._connected=false;GD._lastSync=0;GD._error=null;GD._paused=false;GD._archiving=false;
    cfg.driveConnected=false;save();flash("Drive disconnected");rFtr();
  },

  schedulePush(){
    if(!GD._connected)return;
    try{chrome.runtime.sendMessage({type:"SCHEDULE_DRIVE_PUSH"},()=>{})}catch{}
  },

  async init(){
    if(!cfg.driveConnected)return;
    try{await GD.getToken(false);GD._connected=true;GD._lastSync=meta.gdSync||0;syncGdStateFromMeta();rFtr()}
    catch{GD._connected=false;cfg.driveConnected=false}
  },

  // Pull from cloud on startup when enabled (login → auto-pull)
  async pullOnStartupIfEnabled(){
    if(!cfg.driveConnected||!cfg.cloudPullOnStartup)return;
    if(!GD._connected)await GD.init();
    if(!GD._connected)return;
    try{
      // DATA AUTHORITY: Local wins. Cloud pull on startup is disaster-recovery only.
      // See docs/DATA_AUTHORITY.md — never replace a non-empty local vault here.
      const localCounts=await GD.itemCountsFull();
      if(localCounts.total>0){
        console.info("[PV] Startup cloud pull skipped — local vault has",localCounts.total,"items (local is source of truth; use toolbar restore to replace intentionally).");
        return;
      }
      const r=await GD.pull();
      if(r?.data){
        if(restoreVault(r.data,{source:"drive-startup-empty-vault"})){
          render();
          flash("OK Restored from cloud!");
        }
      }
    }catch(e){
      console.warn("[PV] Startup pull failed:",e.message);
    }
  },

  statusText(){
    if(!GD._connected)return"";
    if(GD._syncing)return"Syncing...";
    if(typeof meta!=="undefined"&&meta.gdWorkerSyncing)return"Syncing...";
    if(GD._paused)return"⚠ Sync paused";
    if(GD._error)return"Sync error";
    if(!GD._lastSync)return"Drive OK";
    const m=Math.floor((Date.now()-GD._lastSync)/60000);
    if(m<1)return"Synced just now";
    if(m<60)return`Synced ${m}m ago`;
    const h=Math.floor(m/60);
    return`Synced ${h}h ago`;
  }
};

function syncGdStateFromMeta(){
  if(typeof meta==="undefined")return;
  GD._lastSync=meta.gdSync||GD._lastSync;
  GD._error=meta.gdWorkerError!=null&&meta.gdWorkerError!==""?meta.gdWorkerError:null;
  GD._paused=!!meta.gdWorkerPaused;
}

// ── Section Panels migration — converts old speedDial to sectionPanels ──
function migrateSectionPanels(){
  if(!BM)return;
  if(!BM.sectionPanels)BM.sectionPanels=[];
  // Migrate old speedDial format to sectionPanels with clusters
  if(BM.speedDial&&BM.speedDial.length&&!BM.sectionPanels.length){
    BM.sectionPanels=BM.speedDial.map(g=>({
      id:g.id.replace("sd_","sp_"),name:g.name,mode:g.mode||"capsule",
      clusters:[{
        id:"cl_"+Date.now()+"_"+Math.random().toString(36).slice(2,6),
        label:"",color:safeUiColor(g.color||""),
        items:(g.items||[]).map(si=>({id:si.id,color:safeUiColor(si.colorOverride||"")||null}))
      }]
    }));
    delete BM.speedDial;
  }
  // Clean up old key
  if(BM.speedDial&&!BM.speedDial.length)delete BM.speedDial;
  pruneSectionPanels();
}


// ═══════ CLOUD SYNC — Provider Abstraction Layer ═══════
// Active backend: Google Drive (GD). Additional providers can be registered here later.
//
// Cloud Provider Interface (implement in each provider):
//   id, name           — provider identifier and display name
//   _connected         — boolean connection state
//   connect()          — user-initiated connect (OAuth, etc.)
//   disconnect()      — disconnect and clear tokens
//   init()             — silent init on startup (restore session)
//   push(force?)       — push backup to cloud
//   pull(fileId?)      — pull backup (null = latest), returns {data,name,modified}
//   pullOnStartupIfEnabled() — pull on startup when cfg.cloudPullOnStartup
//   schedulePush()    — debounced push after local changes
//   itemCounts()       — {prompts,skills,snippets,bookmarks,notes,customgpts,total}
//   buildPayload()     — backup payload object
//   listBackups()      — list available backups
//   safeRestore(fileId?) — restore with pre-backup
//   forcePush()        — force push (bypass data-loss check)
//   archivePush(), archiveRead(), recoverFromArchive() — optional archive
//   statusText()      — UI status string
//   _syncing, _error, _paused, _archiving — state for UI

const CLOUD_PROVIDER_NAMES={ "google-drive":"Google Drive", "dropbox":"Dropbox", "onedrive":"OneDrive", "custom":"Custom API" };

const CLOUD_PROVIDERS={};
function registerCloudProvider(id,provider){CLOUD_PROVIDERS[id]=provider}
if(typeof GD!=="undefined"){GD.id="google-drive";GD.name="Google Drive";registerCloudProvider("google-drive",GD)}

// Cloud facade — delegates to active provider
function getCloudProvider(){const id=cfg?.cloudProvider||"google-drive";return CLOUD_PROVIDERS[id]||CLOUD_PROVIDERS["google-drive"]}
const Cloud=new Proxy({},{
  get(_,prop){
    const p=getCloudProvider();
    const v=p?.[prop];
    return typeof v==="function"?v.bind(p):v;
  }
});

// isValidVaultPayload: vault-payload.js (loaded before this module in vault.js)

// ═══ DATA AUTHORITY (see docs/DATA_AUTHORITY.md) ═══
// • chrome.storage.local is the runtime source of truth.
// • Google Drive holds backups (JSON snapshots), not a live CRDT.
// • restoreVault() is an explicit REPLACE for each store key present in the payload
//   (prompts, snippets, …) — not a merge. User-initiated restore + undo stack mitigate loss.
// • Optional: universalCapsules (pv_uc), imgBuilderBaskets (pv_baskets) when present in payload.
// • Startup cloud pull runs only when local item count is 0 (gdrive.js pullOnStartupIfEnabled).

// ═══ AUTHORITATIVE RESTORE — the ONE function that replaces vault state ═══
// Every restore path (cloud, import, settings) MUST call this. No exceptions.
// Returns true on success, false if blocked.
// @param {object} opts
// @param {boolean} [opts.skipUndo]
// @param {string} [opts.source] Log label for support/debug (e.g. "drive-latest-toolbar")
function restoreVault(d,opts){
  opts=opts||{};
  // Step 1: Validate
  if(!isValidVaultPayload(d)){
    console.error("[PV] Blocked restore: invalid payload —",describeVaultPayloadRejection(d));
    flash("Restore blocked — backup data is invalid or empty");
    return false;
  }
  // Normalize optional config before touching live state. This keeps config:{} and
  // older partial configs from throwing midway through an otherwise valid restore.
  let restoredCfg=null;
  if(d.config!==undefined){
    restoredCfg=Object.assign(deepClone(DEFAULT_CFG),deepClone(d.config));
    if(!Array.isArray(restoredCfg.platforms))restoredCfg.platforms=[];
    restoredCfg.platforms=restoredCfg.platforms.filter(p=>p&&typeof p==="object"&&typeof p.id==="string");
    for(const dp of DEFAULT_PLATFORMS){if(!restoredCfg.platforms.find(p=>p.id===dp.id))restoredCfg.platforms.push(deepClone(dp))}
  }
  const payloadStores=["prompts","imgprompts","snippets","bookmarks","notes","skills","customgpts","photos","lists","chats","workspaces"].filter(k=>!!d[k]);
  const extras=[];
  if(d.universalCapsules!==undefined)extras.push("universalCapsules");
  if(d.imgBuilderBaskets!==undefined)extras.push("imgBuilderBaskets");
  console.info("[PV] restoreVault: replace-mode, source="+(opts.source||"unspecified")+" stores="+payloadStores.join(",")+(d.config?",config":"")+(extras.length?","+extras.join(","):""));
  // Step 2: Snapshot current state for undo
  if(!opts.skipUndo)pushUndo();
  // Step 3: Replace stores (only if present in payload — never null out a store)
  if(d.prompts)P=d.prompts;
  if(d.imgprompts)IP=d.imgprompts;
  if(d.photos)PH=d.photos;
  if(d.lists)LS=typeof PVListsModel!=="undefined"?PVListsModel.normalizeStore(deepClone(d.lists)):d.lists;
  if(d.skills)KL=d.skills;
  if(d.snippets)SN=d.snippets;
  if(d.bookmarks)BM=d.bookmarks;
  if(d.projects)foldLegacyTreeIntoBM(d.projects,"Projects");
  if(d.chats)foldLegacyTreeIntoBM(d.chats,"Chats");
  if(d.workspaces)WS=d.workspaces;
  if(d.notes)NT=d.notes;
  if(d.customgpts)GP=d.customgpts;
  if(d.universalCapsules!==undefined){
    UC=deepClone(d.universalCapsules);
    if(!UC.pills&&!UC.subs&&!UC.groups&&!UC.archive){
      const old=UC;UC={pills:{},subs:{},groups:{},archive:[]};
      for(const pid of Object.keys(old)){if(Array.isArray(old[pid]))UC.groups[pid]=old[pid]}
    }
    if(!UC.pills)UC.pills={};if(!UC.subs)UC.subs={};if(!UC.groups)UC.groups={};if(!UC.archive)UC.archive=[];
  }
  if(d.imgBuilderBaskets!==undefined){
    chrome.storage.local.set({pv_baskets:deepClone(d.imgBuilderBaskets)});
  }
  if(d.files!==undefined){
    try{if(isValidStoreShape(d.files))chrome.storage.local.set({pv_f:deepClone(d.files)});}catch{}
  }
  // Step 4: Config (additive — never removes user platforms)
  if(restoredCfg)cfg=restoredCfg;
  // Step 5: Normalize all stores
  [P,SN,BM,NT,KL,GP,IP,LS].forEach(x=>{x.trash=x.trash||[];x.collections=x.collections||[]});
  migrateSectionPanels();
  if(!KL||!KL.folders)KL=mkDef("kroot","My Skills");
  if(!IP||!IP.folders)IP=mkDef("iroot","My Image Prompts");
  // Step 6: Validate + fix IDs
  validateAll();
  // Step 7: Update metadata
  meta.lastSyncTimestamp=Date.now();
  meta.lastSyncDeviceId=meta?.deviceId||"";
  // Restore dev notes / issue tracker if present in backup
  const ct=Cloud.itemCounts();
  meta.gdLastCounts={prompts:ct.prompts,imgprompts:ct.imgprompts,skills:ct.skills,snippets:ct.snippets,bookmarks:ct.bookmarks,notes:ct.notes,customgpts:ct.customgpts,total:ct.total};
  meta.gdWorkerPaused=false;
  meta.gdWorkerError=null;
  Cloud._paused=false;Cloud._error=null;
  // Step 8: Persist
  save();
  console.log("[PV] Restore complete:",ct.total,"items");
  return true;
}
// Legacy alias — callers that haven't been updated yet still work
function applyRestoreData(d){return restoreVault(d,{source:"applyRestoreData"})}

// ═══════ SKILLS TAB — PACKAGE SYSTEM ═══════
function isSkillTab(){return isK()}
// Parse YAML frontmatter from SKILL.md
function parseSkillYaml(content){
  const m=(content||"").match(/^---\n([\s\S]*?)\n---/);if(!m)return{};
  const yaml=m[1],result={};
  const nm=yaml.match(/^name:\s*(.+)/m);if(nm)result.name=nm[1].trim();
  // description can be single-line or multi-line (| or >)
  const descM=yaml.match(/^description:\s*[|>]?\s*\n?([\s\S]*?)(?=\n\w|\n---|\n$)/m);
  if(descM)result.description=descM[1].replace(/^\s+/gm,"").trim();
  else{const d1=yaml.match(/^description:\s*(.+)/m);if(d1)result.description=d1[1].trim()}
  return result;
}
// Build file tree summary from skill files object
function skillFileTree(files){
  if(!files||!Object.keys(files).length)return{dirs:{},total:0};
  const dirs={};let total=0;
  Object.keys(files).forEach(path=>{
    total++;
    const parts=path.split("/");
    if(parts.length>1){const d=parts[0];dirs[d]=(dirs[d]||0)+1}
    else{dirs["(root)"]=(dirs["(root)"]||0)+1}
  });
  return{dirs,total};
}
function skillFileSummary(p){
  const fc=p.files?Object.keys(p.files).length:0;
  const totalBytes=(p.content||"").length+(p.files?Object.values(p.files).reduce((a,b)=>a+(b||"").length,0):0);
  return{fileCount:fc+1,totalKB:(totalBytes/1024).toFixed(1),dirs:p.files?skillFileTree(p.files).dirs:{}}
}
function downloadSkillMd(p){
  const fname=(p.title||"skill").replace(/[^a-zA-Z0-9_-]/g,"-").toLowerCase()+".md";
  const blob=new Blob([p.content||""],{type:"text/markdown"});const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=fname;a.click();URL.revokeObjectURL(url);flash("✓ Downloaded .md")
}
// Minimal zip builder (STORE method — no compression, text files)
async function deflate(data){
  try{const cs=new CompressionStream("deflate-raw");const w=cs.writable.getWriter();w.write(data);w.close();
    const r=cs.readable.getReader();const chunks=[];let len=0;
    while(true){const{done,value}=await r.read();if(done)break;chunks.push(value);len+=value.length}
    const out=new Uint8Array(len);let off=0;chunks.forEach(c=>{out.set(c,off);off+=c.length});return out;
  }catch{return null}// fallback to STORE if deflate unavailable
}
async function buildZip(files){
  const enc=new TextEncoder();
  let offset=0;const locals=[],centrals=[];
  for(const f of files){
    const nameBytes=enc.encode(f.name);
    const crc=crc32(f.data);
    const compressed=await deflate(f.data);
    const useDeflate=compressed&&compressed.length<f.data.length;
    const stored=useDeflate?compressed:f.data;
    const method=useDeflate?8:0;
    const lh=new Uint8Array(30+nameBytes.length+stored.length);
    const lv=new DataView(lh.buffer);
    lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0,true);lv.setUint16(8,method,true);
    lv.setUint16(10,0,true);lv.setUint16(12,0,true);lv.setUint32(14,crc,true);
    lv.setUint32(18,stored.length,true);lv.setUint32(22,f.data.length,true);
    lv.setUint16(26,nameBytes.length,true);lv.setUint16(28,0,true);
    lh.set(nameBytes,30);lh.set(stored,30+nameBytes.length);
    locals.push(lh);
    const cd=new Uint8Array(46+nameBytes.length);
    const cv=new DataView(cd.buffer);
    cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);
    cv.setUint16(8,0,true);cv.setUint16(10,method,true);cv.setUint16(12,0,true);cv.setUint16(14,0,true);
    cv.setUint32(16,crc,true);cv.setUint32(20,stored.length,true);cv.setUint32(24,f.data.length,true);
    cv.setUint16(28,nameBytes.length,true);cv.setUint16(30,0,true);cv.setUint16(32,0,true);
    cv.setUint16(34,0,true);cv.setUint16(36,0,true);cv.setUint32(38,0,true);cv.setUint32(42,offset,true);
    cd.set(nameBytes,46);
    centrals.push(cd);
    offset+=lh.length;
  }
  const cdOffset=offset;let cdSize=0;centrals.forEach(c=>cdSize+=c.length);
  const eocd=new Uint8Array(22);const ev2=new DataView(eocd.buffer);
  ev2.setUint32(0,0x06054b50,true);ev2.setUint16(4,0,true);ev2.setUint16(6,0,true);
  ev2.setUint16(8,files.length,true);ev2.setUint16(10,files.length,true);
  ev2.setUint32(12,cdSize,true);ev2.setUint32(16,cdOffset,true);ev2.setUint16(20,0,true);
  const total=offset+cdSize+22;const out=new Uint8Array(total);let pos=0;
  locals.forEach(l=>{out.set(l,pos);pos+=l.length});
  centrals.forEach(c=>{out.set(c,pos);pos+=c.length});
  out.set(eocd,pos);
  return out;
}
function crc32(data){
  let crc=0xFFFFFFFF;
  for(let i=0;i<data.length;i++){crc^=data[i];for(let j=0;j<8;j++)crc=(crc>>>1)^(crc&1?0xEDB88320:0)}
  return(crc^0xFFFFFFFF)>>>0;
}
async function downloadSkillZip(p){
  const enc=new TextEncoder();
  const name=(p.title||"skill").replace(/[^a-zA-Z0-9_-]/g,"-").toLowerCase();
  const files=[{name:name+"/SKILL.md",data:enc.encode(p.content||"")}];
  if(p.files){Object.entries(p.files).forEach(([path,content])=>{
    files.push({name:name+"/"+path,data:enc.encode(content||"")})
  })}
  const zip=await buildZip(files);
  const blob=new Blob([zip],{type:"application/zip"});const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=name+".skill";a.click();URL.revokeObjectURL(url);
  flash("✓ Downloaded .skill");
}
function deploySkill(p){
  const hasFiles=p.files&&Object.keys(p.files).length>0;
  if(hasFiles){downloadSkillPackage(p)}else{downloadSkillMd(p)}
  // Track usage
  const f=findFolder(KL.folders,kSt.sel);if(f){const pr=f.prompts.find(x=>x.id===p.id);if(pr){pr.usageCount=(pr.usageCount||0)+1;pr.usageHistory=pr.usageHistory||[];pr.usageHistory.push(Date.now());pr.lastDeployed=Date.now();save()}}
}
// Download as .skill file (native format — zip with .skill extension)
async function downloadSkillPackage(p){
  const enc=new TextEncoder();
  const name=(p.title||"skill").replace(/[^a-zA-Z0-9_-]/g,"-").toLowerCase();
  const files=[{name:name+"/SKILL.md",data:enc.encode(p.content||"")}];
  if(p.files){Object.entries(p.files).forEach(([path,content])=>{
    files.push({name:name+"/"+path,data:enc.encode(content||"")})
  })}
  const zip=await buildZip(files);
  const blob=new Blob([zip],{type:"application/zip"});const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=name+".skill";a.click();URL.revokeObjectURL(url);
  flash("✓ Downloaded "+name+".skill — drag into your conversation");
}
// Minimal ZIP reader (STORE method — handles our own zips and many standard zips)
async function readZipFiles(buffer){
  const view=new DataView(buffer);const files=[];let pos=0;
  const dec=new TextDecoder();
  while(pos<buffer.byteLength-4){
    const sig=view.getUint32(pos,true);
    if(sig!==0x04034b50)break;
    const comprMethod=view.getUint16(pos+8,true);
    const compSize=view.getUint32(pos+18,true);
    const uncompSize=view.getUint32(pos+22,true);
    const nameLen=view.getUint16(pos+26,true);
    const extraLen=view.getUint16(pos+28,true);
    const name=dec.decode(new Uint8Array(buffer,pos+30,nameLen));
    const dataStart=pos+30+nameLen+extraLen;
    if(!name.endsWith("/")){
      if(comprMethod===0){// STORE — uncompressed
        const data=new Uint8Array(buffer,dataStart,uncompSize);
        files.push({name,data,text:dec.decode(data)});
      }else if(comprMethod===8){// DEFLATE — use browser's DecompressionStream
        try{
          const compressed=new Uint8Array(buffer,dataStart,compSize);
          const ds2=new DecompressionStream("deflate-raw");
          const writer=ds2.writable.getWriter();
          writer.write(compressed);writer.close();
          const reader=ds2.readable.getReader();
          const chunks=[];let totalLen=0;
          while(true){const{done,value}=await reader.read();if(done)break;chunks.push(value);totalLen+=value.length}
          const decompressed=new Uint8Array(totalLen);let offset=0;
          chunks.forEach(ch=>{decompressed.set(ch,offset);offset+=ch.length});
          files.push({name,data:decompressed,text:dec.decode(decompressed)});
        }catch(e){console.warn("Failed to decompress",name,e)}
      }
    }
    pos=dataStart+compSize;
  }
  return files;
}
// Import skill from file — handles .md, .yaml, .yml, .json, .zip
function importSkillFile(){
  const input=document.createElement("input");
  input.type="file";input.accept=".md,.yaml,.yml,.json,.zip,.skill";input.multiple=true;
  input.addEventListener("change",async()=>{
    const fileList=[...input.files];if(!fileList.length)return;
    for(const file of fileList){
      const ext=file.name.split(".").pop().toLowerCase();
      if(ext==="zip"||ext==="skill"){
        // Unpack zip into skill package
        const buf=await file.arrayBuffer();
        const entries=await readZipFiles(buf);
        if(!entries.length){flash("Empty or unsupported zip");continue}
        // Find SKILL.md (may be at root or inside a single top-level directory)
        let skillMd=entries.find(e=>e.name==="SKILL.md"||e.name.endsWith("/SKILL.md"));
        // Determine base path (strip top-level directory if all files share one)
        const allPaths=entries.map(e=>e.name);
        const firstSlash=allPaths[0]?.indexOf("/");
        let basePath="";
        if(firstSlash>0){const prefix=allPaths[0].slice(0,firstSlash+1);if(allPaths.every(p=>p.startsWith(prefix)))basePath=prefix}
        const skillContent=skillMd?skillMd.text:"";
        const ym=parseSkillYaml(skillContent);
        const title=ym.name||file.name.replace(/\.zip$/i,"").replace(/[_-]/g," ");
        const files={};
        entries.forEach(e=>{
          let path=basePath?e.name.slice(basePath.length):e.name;
          if(path&&path!=="SKILL.md"&&!path.endsWith("/"))files[path]=e.text;
        });
        // Create skill item
        pushUndo();const f=findFolder(KL.folders,kSt.sel);if(!f)continue;f.prompts=f.prompts||[];
        const item={id:generateId(KL),title,content:skillContent,description:ym.description||"",files,
          tags:[],created:Date.now(),modified:Date.now(),usageCount:0,favorited:false,versions:[]};
        f.prompts.push(item);save();flash("✓ Imported "+title);
      } else {
        // Single file: .md, .yaml, .yml, .json, .skill
        const text=await file.text();
        const ym=parseSkillYaml(text);
        const title=ym.name||file.name.replace(/\.(md|yaml|yml|json|skill)$/i,"").replace(/[_-]/g," ");
        pushUndo();const f=findFolder(KL.folders,kSt.sel);if(!f)continue;f.prompts=f.prompts||[];
        const item={id:generateId(KL),title,content:text,description:ym.description||"",files:{},
          tags:[],created:Date.now(),modified:Date.now(),usageCount:0,favorited:false,versions:[]};
        f.prompts.push(item);save();flash("✓ Imported "+title);
      }
    }
    aTab="skills";render();
  });
  input.click();
}
function pvSkillItemFromEntries(entries,fileName){
  if(!entries?.length)return null;
  const skillMd=entries.find(e=>e.name==="SKILL.md"||e.name.endsWith("/SKILL.md"));
  if(!skillMd)return null;
  const mdPath=skillMd.name.replace(/\\/g,"/");
  const basePath=mdPath.slice(0,mdPath.length-"SKILL.md".length);
  const ym=parseSkillYaml(skillMd.text||"");
  const files={};
  entries.forEach(e=>{
    const full=e.name.replace(/\\/g,"/");
    if(basePath&&!full.startsWith(basePath))return;
    const rel=basePath?full.slice(basePath.length):full;
    if(rel&&rel!=="SKILL.md"&&!rel.endsWith("/"))files[rel]=e.text||"";
  });
  const fallback=(basePath.split("/").filter(Boolean).pop()||fileName||"Imported skill").replace(/\.(zip|skill|md)$/i,"").replace(/[_-]/g," ");
  return{title:ym.name||fallback,content:skillMd.text||"",description:ym.description||"",files,tags:["claude-skill-import"],_store:"skills",_sourceKind:"user-selected-skill-package"};
}

function pvPickAuthorizedSkillFiles(directory=false){
  const input=document.createElement("input");
  input.type="file";input.multiple=true;
  if(directory){input.webkitdirectory=true;input.setAttribute("webkitdirectory","")}
  else input.accept=".skill,.zip,.md,.markdown,.yaml,.yml,.json";
  input.addEventListener("change",async()=>{
    const selected=[...input.files];if(!selected.length)return;
    const items=[];const rejected=[];
    if(directory){
      const entries=[];
      for(const file of selected){
        const name=(file.webkitRelativePath||file.name).replace(/\\/g,"/");
        entries.push({name,text:await file.text()});
      }
      const skillMds=entries.filter(e=>e.name==="SKILL.md"||e.name.endsWith("/SKILL.md"));
      skillMds.forEach(md=>{
        const base=md.name.slice(0,md.name.length-"SKILL.md".length);
        const group=entries.filter(e=>!base||e.name.startsWith(base));
        const item=pvSkillItemFromEntries(group,base);if(item)items.push(item);
      });
      if(!skillMds.length)rejected.push("No SKILL.md found in the selected folder");
    }else{
      for(const file of selected){
        const ext=file.name.split(".").pop().toLowerCase();
        if(ext==="zip"||ext==="skill"){
          try{const item=pvSkillItemFromEntries(await readZipFiles(await file.arrayBuffer()),file.name);if(item)items.push({...item,_sourceFile:file.name});else rejected.push(file.name+": no SKILL.md found")}
          catch(e){rejected.push(file.name+": "+e.message)}
        }else{
          const text=await file.text(),ym=parseSkillYaml(text);
          items.push({title:ym.name||file.name.replace(/\.(md|markdown|yaml|yml|json)$/i,"").replace(/[_-]/g," "),content:text,description:ym.description||"",files:{},tags:["claude-skill-import"],_store:"skills",_sourceFile:file.name,_sourceKind:"user-selected-file"});
        }
      }
    }
    if(!items.length){flash(rejected[0]||"No importable Skills found");return}
    if(rejected.length)items[0]._importWarning=rejected.join("; ");
    showImportPreview([{file:directory?"Selected Skills folder":selected.map(f=>f.name).join(", "),format:"Claude Skill package",items}],items.length,{store:"skills",folder:pvImportDefaultFolder("skills")});
  });
  input.click();
}

function pvPickAuthorizedCustomGptFiles(directory=false){
  const input=document.createElement("input");
  input.type="file";input.multiple=true;
  if(directory){input.webkitdirectory=true;input.setAttribute("webkitdirectory","")}
  else input.accept=".json,.md,.markdown,.csv,.tsv,.txt,.yaml,.yml,.zip";
  input.addEventListener("change",async()=>{
    const selected=[...input.files];if(!selected.length)return;
    const sources=[];
    for(const file of selected){
      const ext=file.name.split(".").pop().toLowerCase();
      if(ext==="zip"){
        try{(await readZipFiles(await file.arrayBuffer())).filter(e=>/\.(json|md|markdown|csv|tsv|txt|yaml|yml)$/i.test(e.name)).forEach(e=>sources.push({name:file.name+" / "+e.name,text:e.text}))}
        catch(e){console.warn("Prompt Vault: skipped Custom GPT ZIP",file.name,e)}
      }else sources.push({name:file.webkitRelativePath||file.name,text:await file.text()});
    }
    const parsed=[];let total=0;
    for(const src of sources){
      const result=parseImportFile(src.text,src.name);
      if(result.error||!result.items?.length)continue;
      const items=result.items.map(item=>({...item,_store:"customgpts",_sourceFile:src.name,_sourceKind:"user-selected-config"}));
      parsed.push({file:src.name,format:result.format,items});total+=items.length;
    }
    if(!total){flash("No importable Custom GPT configurations found");return}
    showImportPreview(parsed,total,{store:"customgpts",folder:pvImportDefaultFolder("customgpts")});
  });
  input.click();
}

async function pvImportAuthorizedPaste(storeKey){
  try{
    const text=await navigator.clipboard.readText();if(!text?.trim()){flash("Clipboard is empty");return}
    if(storeKey==="skills"){
      const ym=parseSkillYaml(text),item={title:ym.name||"Pasted Claude Skill",content:text,description:ym.description||"",files:{},tags:["claude-skill-import"],_store:"skills",_sourceKind:"user-pasted"};
      showImportPreview([{file:"Clipboard",format:"Claude Skill text",items:[item]}],1,{store:"skills",folder:pvImportDefaultFolder("skills")});return;
    }
    const looksJson=typeof pvLooksLikeJson==="function"?pvLooksLikeJson(text):/^[\s\uFEFF]*[\[{]/.test(text);
    const parsed=parseImportFile(text,looksJson?"pasted-custom-gpt.json":"pasted-custom-gpt.md");
    if(parsed.error||!parsed.items?.length){flash(parsed.error||"No Custom GPT configuration found");return}
    const items=parsed.items.map(item=>({...item,_store:"customgpts",_sourceKind:"user-pasted"}));
    showImportPreview([{file:"Clipboard",format:parsed.format,items}],items.length,{store:"customgpts",folder:pvImportDefaultFolder("customgpts")});
  }catch{flash("Cannot read clipboard — paste into a local file and choose it instead")}
}

function openAuthorizedImport(storeKey){
  const skills=storeKey==="skills",label=skills?"Claude Skills":"Custom GPT configurations";
  showModal(`<h3>Import ${label}</h3>
    <p style="font-size:10px;color:var(--mu);line-height:1.5">Import only content you own or are authorized to use. Prompt Vault reads files/folders you explicitly choose or text you explicitly paste.</p>
    <div class="exp-opt" id="authFiles"><div class="eo-t">${I.dl} ${skills?"Choose .skill, ZIP, or Skill files":"Choose exported/configuration files"}</div><div class="eo-d">${skills?"Supports .skill/.zip packages plus SKILL.md, Markdown, YAML, and JSON":"Supports JSON, Markdown, CSV/TSV, YAML, and text with preview and destination mapping"}</div></div>
    <div class="exp-opt" id="authFolder"><div class="eo-t">${S.folder} Choose a local ${skills?"Skills":"configuration"} folder</div><div class="eo-d">${skills?"Finds each explicitly selected SKILL.md and keeps its companion text files together":"Imports supported configuration files from the folder you explicitly select"}</div></div>
    <div class="exp-opt" id="authPaste"><div class="eo-t">${S.clip} Paste user-provided ${skills?"SKILL.md":"configuration/export"}</div><div class="eo-d">Preview before importing; exact-title duplicates can be skipped, updated, or kept</div></div>
    <div style="margin-top:8px;padding:7px;border:1px solid var(--bl);border-radius:5px;font-size:9px;color:var(--dm);line-height:1.5"><strong style="color:var(--tx)">Permission boundary</strong><br>No silent Claude/ChatGPT account access. No credential or cookie extraction. No undocumented scraping of private pages. Account or web content can be imported only when you explicitly supply/export it, or if a documented API is added later with your authorization.</div>
    <div class="brow"><button class="bg-btn" id="authX">Cancel</button></div>`,mc=>{
    mc.querySelector("#authX").addEventListener("click",closeModal);
    mc.querySelector("#authFiles").addEventListener("click",()=>{closeModal();if(skills)pvPickAuthorizedSkillFiles(false);else pvPickAuthorizedCustomGptFiles(false)});
    mc.querySelector("#authFolder").addEventListener("click",()=>{closeModal();if(skills)pvPickAuthorizedSkillFiles(true);else pvPickAuthorizedCustomGptFiles(true)});
    mc.querySelector("#authPaste").addEventListener("click",()=>{closeModal();pvImportAuthorizedPaste(storeKey)});
  });
}

// Render skill file tree as HTML
function renderSkillTree(p,editable){
  const files=p.files||{};const paths=Object.keys(files).sort();
  const dirs={};const rootFiles=[];
  paths.forEach(path=>{
    const parts=path.split("/");
    if(parts.length>1){const d=parts[0];if(!dirs[d])dirs[d]=[];dirs[d].push({path,name:parts.slice(1).join("/"),size:((files[path]||"").length/1024).toFixed(1)})}
    else rootFiles.push({path,name:path,size:((files[path]||"").length/1024).toFixed(1)})
  });
  let h=`<div class="skt-file skt-root" data-sf="SKILL.md"><span class="skt-icon">📄</span><span class="skt-name">SKILL.md</span><span class="skt-size">${((p.content||"").length/1024).toFixed(1)}KB</span></div>`;
  Object.keys(dirs).sort().forEach(d=>{
    h+=`<div class="skt-dir"><span class="skt-icon">📁</span><span class="skt-dname">${esc(d)}/</span><span class="skt-size">${dirs[d].length} files</span></div>`;
    dirs[d].forEach(f=>{h+=`<div class="skt-file" data-sf="${esc(f.path)}"><span class="skt-indent"></span><span class="skt-icon">${f.name.endsWith('.py')?'🐍':f.name.endsWith('.html')?'🌐':'📄'}</span><span class="skt-name">${esc(f.name)}</span><span class="skt-size">${f.size}KB</span>${editable?`<button class="skt-rm" data-rm="${esc(f.path)}">✕</button>`:''}</div>`})
  });
  rootFiles.forEach(f=>{h+=`<div class="skt-file" data-sf="${esc(f.path)}"><span class="skt-icon">${f.name.endsWith('.py')?'🐍':'📄'}</span><span class="skt-name">${esc(f.name)}</span><span class="skt-size">${f.size}KB</span>${editable?`<button class="skt-rm" data-rm="${esc(f.path)}">✕</button>`:''}</div>`});
  return h;
}


// ═══════ STORAGE ═══════
async function loadData(){
  return new Promise(r=>{
    const keys=[PK,SK,BK,NK,KK,GK,IK,PHK,LSK,PRK,CHK,WSK,MK,CK,UCK,"pv_pending_snippet","pv_pending_bookmark","pv_pending_skill","pv_pending_note","pv_pending_chat","pv_pending_prompt"];
    for(let i=0;i<MAX_SN;i++)keys.push(SP+"p"+i,SP+"s"+i,SP+"b"+i,SP+"n"+i,SP+"k"+i,SP+"g"+i,SP+"i"+i);
    chrome.storage.local.get(keys,res=>{
      meta=res[MK]||{sc:0,lb:0,lbs:0,si:0};
      if(!meta.deviceId){meta.deviceId=crypto.randomUUID();chrome.storage.local.set({[MK]:meta})}
      if(!meta.deviceName)meta.deviceName="";
      cfg=ensureDefaults(res[CK]||{},DEFAULT_CFG);
      if(SUPPORTED_CLOUD_PROVIDERS.length&&!SUPPORTED_CLOUD_PROVIDERS.includes(cfg.cloudProvider))cfg.cloudProvider=SUPPORTED_CLOUD_PROVIDERS[0];
      // Ensure all default platforms exist (additive — never removes user platforms)
      for(const dp of DEFAULT_PLATFORMS){if(!cfg.platforms.find(p=>p.id===dp.id))cfg.platforms.push(deepClone(dp))}
      P=res[PK]?.folders?res[PK]:mkDef("root","My Prompts");
      SN=res[SK]?.folders?res[SK]:mkDef("sroot","My Snippets");
      BM=res[BK]?.folders?res[BK]:mkDef("broot","My Bookmarks");
      NT=res[NK]?.folders?res[NK]:mkDef("nroot","My Notes");
      KL=res[KK]?.folders?res[KK]:mkDef("kroot","My Skills");
      GP=res[GK]?.folders?res[GK]:mkDef("groot","My Custom GPTs");
      IP=res[IK]?.folders?res[IK]:mkDef("iroot","My Image Prompts");
      PH=res[PHK]?.folders?res[PHK]:mkDef("phroot","My Photos");
      // pv_lists is absent on every profile that has never saved Lists (fresh installs
      // and upgrades from ≤7.24). deepClone is JSON-based, so cloning that undefined
      // would throw inside this storage callback and the panel would never boot.
      LS=typeof PVListsModel!=="undefined"?PVListsModel.normalizeStore(res[LSK]?deepClone(res[LSK]):null):(res[LSK]?.folders?res[LSK]:mkDef("lroot","My Lists & Tasks"));
      PRJ=mkDef("projroot","My Projects");
      CH=mkDef("chroot","My Chats");
      // Legacy silos: fold any Projects/Chats items into Bookmarks, then drop the keys.
      const _folded=foldLegacySilosIntoBookmarks(res[PRK],res[CHK]);
      WS=res[WSK]?.workspaces?res[WSK]:mkWsDefault();
      UC=res[UCK]||{};
      // Migrate UC from v1 (panelId→[groups]) to v2 (pills/subs/groups/archive)
      if(!UC.pills&&!UC.subs&&!UC.groups&&!UC.archive){
        const old=UC;const newUC={pills:{},subs:{},groups:{},archive:[]};
        for(const pid of Object.keys(old)){if(Array.isArray(old[pid]))newUC.groups[pid]=old[pid]}
        UC=newUC;
      }
      if(!UC.pills)UC.pills={};if(!UC.subs)UC.subs={};if(!UC.groups)UC.groups={};if(!UC.archive)UC.archive=[];
      // Validate every tree before any shared counter, photo cleanup, onboarding, or
      // render path can read it. Older/partial profiles may have a root object but be
      // missing its arrays (or contain an invalid child); merely checking `.folders`
      // above is not sufficient.
      const _startupDataRepaired=validateAll(false);
      [P,SN,BM,NT,KL,GP,IP,PH,LS,PRJ,CH].forEach(x=>x.trash=x.trash||[]);
      // ── Prompt-chain self-heal (non-destructive) ──
      // Runs on every load against whatever shape the data arrived in — a hand-edited CSV, a
      // partial restore, another device's sync. Normalizes annotations, quarantines anything
      // unreadable rather than dropping it, and names chains that lost their glossary entry.
      // Gaps and duplicates are NOT auto-compacted here: renumbering is a user-visible change
      // and belongs behind an explicit repair, not a silent startup rewrite.
      let _chainDirty=false;
      try{
        if(typeof pvChainRepair==="function"&&P?.folders){
          const rep=pvChainRepair(P.folders,{compact:false});
          if(rep&&(rep.normalized||rep.named.length))_chainDirty=true;
          if(typeof pvChainMigrateFromNextId==="function"&&!cfg._chainsMigrated){
            const made=pvChainMigrateFromNextId(P.folders);
            cfg._chainsMigrated=1;_chainDirty=true;
            if(made.length)console.info("[PV] migrated "+made.length+" follow-up chain(s) to annotations");
          }
        }
      }catch(e){console.warn("[PV] chain self-heal skipped:",e&&e.message)}
      // Resume an interrupted chain run. Only restored if the queued prompt still exists —
      // a step deleted between sessions must not leave a chamber pointing at nothing.
      try{
        const rn=cfg.chainRun;
        if(rn&&rn.nextId&&typeof allItems==="function"&&allItems(P.folders).some(x=>String(x.id)===String(rn.nextId))){
          pSt._chambered={id:rn.nextId,fromTitle:rn.fromTitle||"",chain:rn.prefix,index:rn.index,total:rn.total};
          pSt._chainRun=rn.prefix||"";
        }else if(rn){delete cfg.chainRun}
      }catch(e){/* resume is a convenience, never a blocker */}
      if(!BM.collections)BM.collections=[];
      if(!PRJ.collections)PRJ.collections=[];
      if(!CH.collections)CH.collections=[];
      if(!P.collections)P.collections=[];
      if(!SN.collections)SN.collections=[];
      if(!NT.collections)NT.collections=[];
      if(!KL.collections)KL.collections=[];
      if(!GP.collections)GP.collections=[];
      if(!IP.collections)IP.collections=[];
      if(!PH.collections)PH.collections=[];
      // Section Panels (bookmarks only) — migrates old speedDial
      migrateSectionPanels();
      // Photos: sweep IndexedDB blobs whose item is gone from tree AND trash
      if(typeof pvImgCleanup==="function"){
        const valid=new Set();
        (function w(n){(n.prompts||[]).forEach(p=>valid.add(p.id));(n.children||[]).forEach(w)})(PH.folders);
        (PH.trash||[]).forEach(t=>{const it=t.item||t;if(it&&it.id)valid.add(it.id)});
        pvImgCleanup(valid).catch(()=>{});
      }
      if(_folded)setTimeout(()=>{try{save()}catch(e){/* deferred */}},0);
      // The self-heal above mutates P/cfg. Without persisting, the migration flag never
      // sticks and it would re-run every load; deferred so it lands after loadData resolves.
      if(_chainDirty)setTimeout(()=>{try{save()}catch(e){/* deferred */}},0);
      if(_startupDataRepaired)setTimeout(()=>{try{save()}catch(e){/* deferred */}},0);
      // Ensure clips "Inbox" folder for quick capture
      if(!SN.folders.children.find(c=>c.id==="s_inbox")){SN.folders.children.unshift({id:"s_inbox",name:"Inbox",children:[],prompts:[],color:""})}
      const ps=res.pv_pending_snippet,pb=res.pv_pending_bookmark,pk=res.pv_pending_skill;
      if(ps){chrome.storage.local.remove("pv_pending_snippet");setTimeout(()=>showCapture("snippet",ps.text,ps.url,ps.pageTitle,"",ps.linkedPromptId),300)}
      else if(pb){chrome.storage.local.remove("pv_pending_bookmark");setTimeout(()=>showCapture("bookmark","",pb.url,pb.title,pb.description),300)}
      else if(pk){chrome.storage.local.remove("pv_pending_skill");setTimeout(()=>showCapture("skill",pk.text,pk.url,pk.pageTitle),300)}
      const pn=res.pv_pending_note;
      if(pn){chrome.storage.local.remove("pv_pending_note");setTimeout(()=>showCapture("note",pn.text,pn.url,pn.pageTitle),300)}
      const pc=res.pv_pending_chat;
      if(pc){chrome.storage.local.remove("pv_pending_chat");setTimeout(()=>showCapture("chat","",pc.url,pc.title),300)}
      const pp=res.pv_pending_prompt;
      if(pp){chrome.storage.local.remove("pv_pending_prompt");setTimeout(()=>{if(typeof promptFromSelection==="function")promptFromSelection(pp.text,pp.url,pp.pageTitle)},300)}
      r();
    });
  });
}
function pushUndo(){undo.push({P:deepClone(P),SN:deepClone(SN),BM:deepClone(BM),NT:deepClone(NT),KL:deepClone(KL),GP:deepClone(GP),IP:deepClone(IP),PH:deepClone(PH),LS:deepClone(LS),PRJ:deepClone(PRJ),CH:deepClone(CH),WS:deepClone(WS)});if(undo.length>UNDO)undo.shift();$("undoBtn").style.display=undo.length?"flex":"none"}
function doUndo(){if(!undo.length)return;const u=undo.pop();P=u.P;SN=u.SN;BM=u.BM;NT=u.NT;KL=u.KL;GP=u.GP;IP=u.IP||IP;PH=u.PH||PH;LS=u.LS||LS;PRJ=u.PRJ||PRJ;CH=u.CH||CH;WS=u.WS||WS;save();$("undoBtn").style.display=undo.length?"flex":"none";flash("Undone");render()}
let _savePending=false,_saveTimer=null,_pvSyncQuotaWarned=false;
function save(){
  invalidateItemCache();
  if(_saveTimer){_savePending=true;return}
  _doSave();
  _saveTimer=setTimeout(()=>{_saveTimer=null;if(_savePending){_savePending=false;save()}},300);
}
function flushPendingSave(){
  if(!_saveTimer)return;
  clearTimeout(_saveTimer);
  _saveTimer=null;
  if(_savePending){_savePending=false;_doSave()}
}
function _doSave(){
  sanitizeAllUiState();
  (BM.sectionPanels||[]).forEach(panel=>{
    if(!panel.clusters||panel.clusters.length<=1)return;
    panel.clusters=panel.clusters.filter(cl=>{
      const hasItems=(cl.items||[]).length>0;
      const hasIdentity=!!(cl.label||cl.color);
      return hasItems||hasIdentity;
    });
    if(!panel.clusters.length)panel.clusters=[{id:"cl_"+Date.now(),label:"",color:"",items:[]}];
  });
  chrome.storage.local.set({[PK]:P,[SK]:SN,[BK]:BM,[NK]:NT,[KK]:KL,[GK]:GP,[IK]:IP,[PHK]:PH,[LSK]:LS,[WSK]:WS,[CK]:cfg,[UCK]:UC},()=>{
    try{chrome.runtime.sendMessage({type:"REBUILD_MENUS"})}catch{}
  });
  meta.sc=(meta.sc||0)+1;
  if(meta.sc%10===0){
    const i=meta.si%MAX_SN;
    chrome.storage.local.set({[SP+"p"+i]:deepClone(P),[SP+"s"+i]:deepClone(SN),[SP+"b"+i]:deepClone(BM),[SP+"n"+i]:deepClone(NT),[SP+"k"+i]:deepClone(KL),[SP+"g"+i]:deepClone(GP),[SP+"i"+i]:deepClone(IP)});
    if(!meta.snapshots)meta.snapshots={};
    const ct=Cloud.itemCounts?Cloud.itemCounts():{total:0};
    meta.snapshots[i]={ts:Date.now(),total:ct.total,prompts:ct.prompts||0,imgprompts:ct.imgprompts||0,skills:ct.skills||0,snippets:ct.snippets||0,bookmarks:ct.bookmarks||0,notes:ct.notes||0,customgpts:ct.customgpts||0};
    meta.si++;
  }
  chrome.storage.local.set({[MK]:meta});
  try{const strip=n=>{if(!n||typeof n!=="object")return{id:"_",name:"_",children:[],c:0};return{id:n.id,name:n.name,children:(n.children||[]).map(strip),c:(n.prompts||[]).length}};
    const syncData={pv_sync:{p:strip(P?.folders),i:strip(IP?.folders),s:strip(SN?.folders),b:strip(BM?.folders),n:strip(NT?.folders),k:strip(KL?.folders),g:strip(GP?.folders),at:Date.now()}};
    const syncSize=JSON.stringify(syncData).length;
    if(syncSize>7500){console.info("[PV] pv_sync skipped — outline too large ("+syncSize+"b, limit ~8KB)")}
    else{chrome.storage.sync.set(syncData,()=>{
      if(chrome.runtime.lastError){
        console.info("[PV] pv_sync:",chrome.runtime.lastError.message);
      }
    })}
  }catch(e){/* pv_sync is optional — never block save */}
  setTimeout(()=>clearBackupBanner(),0);
  Cloud.schedulePush();
}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")flushPendingSave()});
window.addEventListener("pagehide",flushPendingSave);
window.addEventListener("beforeunload",flushPendingSave);
function clearBackupBanner(){$("bannerC").innerHTML=""}
function needsBackup(){const d=meta.lb?daysSince(meta.lb):999,s=meta.sc-(meta.lbs||0);return d>=BK_DY||s>=BK_S}
function vaultBackupExportVersion(){return typeof PVDrive!=="undefined"&&PVDrive.BACKUP_VERSION?PVDrive.BACKUP_VERSION:((typeof globalThis!=="undefined"&&globalThis.PV_VAULT_EXPORT_VERSION)||"7.3")}
function backupPayloadBase(res){
  const all={prompts:P,imgprompts:IP,skills:KL,snippets:SN,bookmarks:BM,notes:NT,customgpts:GP,photos:PH,lists:LS,projects:PRJ,chats:CH,workspaces:WS,config:cfg,universalCapsules:UC,exportedAt:new Date().toISOString(),version:vaultBackupExportVersion()};
  if(res.pv_baskets!==undefined)all.imgBuilderBaskets=res.pv_baskets;
  if(res.pv_f!==undefined)all.files=res.pv_f;
  return all;
}
// Fold full-resolution photo/file bytes into the payload. Without this a backup holds only
// metadata and a thumbnail, so a restore (or a reinstall, which wipes IndexedDB) loses the
// originals. Returns a short suffix naming anything that could NOT be included — never
// drop attachments silently.
async function attachBackupBytes(all){
  if(typeof pvBuildBackupAttachments!=="function")return"";
  try{
    const att=await pvBuildBackupAttachments();
    if(att.skipped)return" — attachments too large to embed; use Recovery Center → Full Backup";
    if(att.attachments){
      all.attachments=att.attachments;
      all.attachmentBytes=att.bytes;
      const n=att.attachments.reduce((s,g)=>s+(g.rows||[]).length,0);
      return n?` · ${n} attachment${n!==1?"s":""}`:"";
    }
  }catch(e){return" — attachment bytes could not be read"}
  return"";
}
function doBackup(){
  chrome.storage.local.get(["pv_baskets","pv_f"],async res=>{
    const all=backupPayloadBase(res);
    meta.lb=Date.now();meta.lbs=meta.sc;chrome.storage.local.set({[MK]:meta});$("bannerC").innerHTML="";flash("Backing up...");
    const note=await attachBackupBytes(all);
    chrome.runtime.sendMessage({type:"AUTO_BACKUP",data:JSON.stringify(all,null,2)},r=>{flash((r?.success?"Backup saved":"Backup downloaded")+note);setTimeout(()=>clearBackupBanner(),100)});
  });
}
function manualExport(){
  chrome.storage.local.get(["pv_baskets","pv_f"],async res=>{
    const all=backupPayloadBase(res);
    flash("Exporting...");
    const note=await attachBackupBytes(all);
    const blob=new Blob([JSON.stringify(all,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");
    a.href=url;a.download=`prompt-vault-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);
    meta.lb=Date.now();meta.lbs=meta.sc;chrome.storage.local.set({[MK]:meta});flash("Exported"+note);clearBackupBanner();
  });
}


// ── Legacy silo fold (v7.9 cut of Projects/Chats tabs) ─────────────────
// Items from the retired Projects/Chats silos move into Bookmarks under a
// top-level folder, with fresh ids from BM's counter to avoid collisions.
function foldLegacyTreeIntoBM(legacy,label){
  if(!legacy?.folders)return false;
  let count=0;
  (function tally(n){count+=(n.prompts||[]).length;(n.children||[]).forEach(tally)})(legacy.folders);
  if(!count)return false;
  const remap=n=>({id:generateId(BM),name:n.name||label,color:n.color||"",
    prompts:(n.prompts||[]).map(p=>({...deepClone(p),id:generateId(BM)})),
    children:(n.children||[]).map(remap)});
  const merged=remap(legacy.folders);
  merged.name=label;
  BM.folders.children=BM.folders.children||[];
  BM.folders.children.push(merged);
  return true;
}
function foldLegacySilosIntoBookmarks(rawPrj,rawCh){
  let did=false;
  try{
    if(foldLegacyTreeIntoBM(rawPrj,"Projects"))did=true;
    if(foldLegacyTreeIntoBM(rawCh,"Chats"))did=true;
  }catch(e){console.warn("[PV] legacy silo fold failed:",e);return false}
  if(rawPrj||rawCh)chrome.storage.local.remove([PRK,CHK]);
  return did;
}

// ═════════ ENCRYPTED FULL-FIDELITY PORTABLE BACKUP ═════════
// Includes the JSON vault plus known IndexedDB attachment stores.

const PV_PORTABLE_FORMAT="prompt-vault-portable";
const PV_PORTABLE_VERSION=1;
const PV_PORTABLE_KDF_ITERATIONS=310000;
const PV_PORTABLE_STORES=[{kind:"photos",db:"pv-images",store:"blobs"},{kind:"files",db:"pv_files_blobs",store:"blobs"}];

function pvBytesToBase64(bytes){
  const u=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);let bin="";const chunk=0x8000;
  for(let i=0;i<u.length;i+=chunk)bin+=String.fromCharCode.apply(null,u.subarray(i,i+chunk));
  return btoa(bin);
}
function pvBase64ToBytes(text){const bin=atob(text);const out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out}

async function pvPortableKey(passphrase,salt,cryptoApi){
  cryptoApi=cryptoApi||crypto;const enc=new TextEncoder();
  const base=await cryptoApi.subtle.importKey("raw",enc.encode(passphrase),"PBKDF2",false,["deriveKey"]);
  return cryptoApi.subtle.deriveKey({name:"PBKDF2",hash:"SHA-256",salt,iterations:PV_PORTABLE_KDF_ITERATIONS},base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
async function pvEncryptPortablePayload(payload,passphrase,cryptoApi){
  if(!passphrase||passphrase.length<12)throw new Error("Use a passphrase of at least 12 characters");
  cryptoApi=cryptoApi||crypto;const salt=cryptoApi.getRandomValues(new Uint8Array(16)),iv=cryptoApi.getRandomValues(new Uint8Array(12));
  const key=await pvPortableKey(passphrase,salt,cryptoApi),plain=new TextEncoder().encode(JSON.stringify(payload));
  const encrypted=await cryptoApi.subtle.encrypt({name:"AES-GCM",iv},key,plain);
  return{format:PV_PORTABLE_FORMAT,version:PV_PORTABLE_VERSION,createdAt:new Date().toISOString(),kdf:{name:"PBKDF2-SHA256",iterations:PV_PORTABLE_KDF_ITERATIONS,salt:pvBytesToBase64(salt)},cipher:{name:"AES-256-GCM",iv:pvBytesToBase64(iv)},data:pvBytesToBase64(encrypted)};
}
async function pvDecryptPortablePackage(pkg,passphrase,cryptoApi){
  if(!pkg||pkg.format!==PV_PORTABLE_FORMAT||pkg.version!==PV_PORTABLE_VERSION)throw new Error("Not a supported Prompt Vault portable backup");
  if(pkg.kdf?.iterations!==PV_PORTABLE_KDF_ITERATIONS||pkg.cipher?.name!=="AES-256-GCM")throw new Error("Unsupported backup encryption settings");
  cryptoApi=cryptoApi||crypto;const salt=pvBase64ToBytes(pkg.kdf.salt),iv=pvBase64ToBytes(pkg.cipher.iv),data=pvBase64ToBytes(pkg.data);
  try{const key=await pvPortableKey(passphrase,salt,cryptoApi);const plain=await cryptoApi.subtle.decrypt({name:"AES-GCM",iv},key,data);return JSON.parse(new TextDecoder().decode(plain))}
  catch{throw new Error("Incorrect passphrase or damaged backup")}
}

async function pvSerializePortableValue(value){
  if(value instanceof Blob){return{kind:"blob",type:value.type||"application/octet-stream",name:value.name||"",lastModified:value.lastModified||0,data:pvBytesToBase64(await value.arrayBuffer())}}
  if(value instanceof ArrayBuffer||ArrayBuffer.isView(value)){const bytes=value instanceof ArrayBuffer?new Uint8Array(value):new Uint8Array(value.buffer,value.byteOffset,value.byteLength);return{kind:"bytes",data:pvBytesToBase64(bytes)}}
  return{kind:"json",value:deepClone(value)};
}
function pvDeserializePortableValue(entry){
  if(entry.kind==="blob"){const blob=new Blob([pvBase64ToBytes(entry.data)],{type:entry.type||"application/octet-stream"});if(entry.name){try{return new File([blob],entry.name,{type:entry.type||"application/octet-stream",lastModified:entry.lastModified||Date.now()})}catch{/* File is unavailable in some test/browser contexts; Blob preserves the bytes. */}}return blob}
  if(entry.kind==="bytes")return pvBase64ToBytes(entry.data).buffer;
  return deepClone(entry.value);
}

async function pvIdbExists(name){
  if(typeof indexedDB.databases!=="function")return true;
  try{return(await indexedDB.databases()).some(d=>d.name===name)}catch{return true}
}
function pvOpenKnownDb(name,store){return new Promise((resolve,reject)=>{const req=indexedDB.open(name,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(store))req.result.createObjectStore(store)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function pvReadPortableStore(spec){
  if(!await pvIdbExists(spec.db))return[];const db=await pvOpenKnownDb(spec.db,spec.store);
  try{return await new Promise((resolve,reject)=>{const os=db.transaction(spec.store,"readonly").objectStore(spec.store),kr=os.getAllKeys(),vr=os.getAll();let keys,vals;const done=async()=>{if(!keys||!vals)return;try{const rows=[];for(let i=0;i<keys.length;i++)rows.push({key:keys[i],value:await pvSerializePortableValue(vals[i])});resolve(rows)}catch(e){reject(e)}};kr.onsuccess=()=>{keys=kr.result;done()};vr.onsuccess=()=>{vals=vr.result;done()};kr.onerror=vr.onerror=()=>reject(kr.error||vr.error)})}finally{db.close()}
}
async function pvWritePortableStore(spec,rows){
  const db=await pvOpenKnownDb(spec.db,spec.store);
  try{await new Promise((resolve,reject)=>{const tx=db.transaction(spec.store,"readwrite"),os=tx.objectStore(spec.store);os.clear();for(const row of(rows||[]))os.put(pvDeserializePortableValue(row.value),row.key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error("Attachment restore aborted"))})}finally{db.close()}
}

// ── Attachment bytes for the ORDINARY (unencrypted) backup ──
// Photo/file bytes live in IndexedDB, not chrome.storage, so a plain JSON backup used to
// carry only metadata + a 320px thumbnail. Restoring one produced empty frames, and an
// extension reinstall (which wipes both chrome.storage and IndexedDB) lost the originals
// outright. These helpers put the real bytes in the scheduled and manual backups too.
// Guarded by size: an honest metadata-only backup beats a silent 300MB download.
const PV_BACKUP_ATTACHMENT_LIMIT=180*1024*1024;
async function pvBuildBackupAttachments(){
  const attachments=[];let bytes=0;
  for(const spec of PV_PORTABLE_STORES){
    const rows=await pvReadPortableStore(spec);
    // base64 length is ~4/3 of the real size; decode it so the limit and the reported
    // figure agree with pvPortableManifest instead of over-reporting by a third.
    bytes+=rows.reduce((s,r)=>s+((r.value&&r.value.data)?Math.ceil(r.value.data.length*3/4):0),0);
    attachments.push({kind:spec.kind,db:spec.db,store:spec.store,rows});
  }
  if(bytes>PV_BACKUP_ATTACHMENT_LIMIT)return{attachments:null,bytes,skipped:true};
  return{attachments,bytes,skipped:false};
}
// Writes attachment rows back when a restored payload carries them. Older backups have no
// `attachments` key at all — those restore exactly as before, leaving existing bytes alone.
async function pvRestoreBackupAttachments(payload){
  if(!payload||!Array.isArray(payload.attachments))return 0;
  let n=0;
  for(const spec of PV_PORTABLE_STORES){
    const group=payload.attachments.find(g=>g&&g.kind===spec.kind&&g.db===spec.db&&g.store===spec.store);
    if(!group||!Array.isArray(group.rows))continue;
    for(const row of group.rows)pvDeserializePortableValue(row.value);   // validate before mutating
    await pvWritePortableStore(spec,group.rows);
    n+=group.rows.length;
  }
  return n;
}

function pvVaultItemCounts(vault){
  const keys=["prompts","imgprompts","snippets","bookmarks","notes","skills","customgpts","photos","lists","files"],out={};let total=0;
  const countTree=n=>{let c=(n?.prompts||[]).length;for(const ch of(n?.children||[]))c+=countTree(ch);return c};
  for(const k of keys){out[k]=countTree(vault?.[k]?.folders);total+=out[k]}
  out.total=total;return out;
}
function pvPortableManifest(vault,attachments){
  const counts=pvVaultItemCounts(vault),attachmentCounts={},attachmentBytes={};let bytes=0;
  for(const group of attachments||[]){attachmentCounts[group.kind]=(group.rows||[]).length;attachmentBytes[group.kind]=(group.rows||[]).reduce((sum,r)=>sum+(r.value?.data?Math.ceil(r.value.data.length*3/4):0),0);bytes+=attachmentBytes[group.kind]}
  return{createdAt:new Date().toISOString(),schemaVersion:vault.version||"",counts,attachmentCounts,attachmentBytes,totalAttachmentBytes:bytes};
}
async function pvBuildPortablePayload(){
  flushPendingSave();const extras=await chrome.storage.local.get(["pv_baskets","pv_f"]);
  const vault={prompts:deepClone(P),imgprompts:deepClone(IP),skills:deepClone(KL),snippets:deepClone(SN),bookmarks:deepClone(BM),notes:deepClone(NT),customgpts:deepClone(GP),photos:deepClone(PH),lists:deepClone(LS),projects:deepClone(PRJ),chats:deepClone(CH),workspaces:deepClone(WS),config:deepClone(cfg),universalCapsules:deepClone(UC),exportedAt:new Date().toISOString(),version:vaultBackupExportVersion()};
  if(extras.pv_baskets!==undefined)vault.imgBuilderBaskets=deepClone(extras.pv_baskets);if(extras.pv_f!==undefined)vault.files=deepClone(extras.pv_f);
  const attachments=[];for(const spec of PV_PORTABLE_STORES)attachments.push({...spec,rows:await pvReadPortableStore(spec)});
  return{format:"prompt-vault-full-payload",version:1,vault,attachments,manifest:pvPortableManifest(vault,attachments)};
}
function pvValidatePortablePayload(payload){
  if(!payload||payload.format!=="prompt-vault-full-payload"||payload.version!==1)return"Unsupported portable payload";
  if(!isValidVaultPayload(payload.vault))return"Vault data is invalid: "+describeVaultPayloadRejection(payload.vault);
  if(!Array.isArray(payload.attachments))return"Attachment manifest is missing";
  for(const spec of PV_PORTABLE_STORES){if(payload.attachments.filter(g=>g.kind===spec.kind&&g.db===spec.db&&g.store===spec.store).length!==1)return`Required attachment store is missing or duplicated: ${spec.kind}`}
  for(const group of payload.attachments){if(!PV_PORTABLE_STORES.some(s=>s.kind===group.kind&&s.db===group.db&&s.store===group.store)||!Array.isArray(group.rows))return"Attachment store is invalid";for(const row of group.rows){if(!row||row.key===undefined||!row.value||!["blob","bytes","json"].includes(row.value.kind))return"Attachment record is invalid"}}
  return"";
}
function pvPortableDiff(payload){
  const current=pvVaultItemCounts({prompts:P,imgprompts:IP,snippets:SN,bookmarks:BM,notes:NT,skills:KL,customgpts:GP,photos:PH,lists:LS}),incoming=payload.manifest?.counts||pvVaultItemCounts(payload.vault),rows=[];
  for(const k of["prompts","imgprompts","snippets","bookmarks","notes","skills","customgpts","photos","lists"])rows.push({key:k,current:current[k]||0,incoming:incoming[k]||0,delta:(incoming[k]||0)-(current[k]||0)});
  return{rows,currentTotal:current.total,incomingTotal:incoming.total||0,attachmentCounts:payload.manifest?.attachmentCounts||{}};
}

async function pvExportPortable(passphrase){
  const payload=await pvBuildPortablePayload(),pkg=await pvEncryptPortablePayload(payload,passphrase),json=JSON.stringify(pkg),blob=new Blob([json],{type:"application/vnd.promptvault.portable+json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=`prompt-vault-full-${new Date().toISOString().slice(0,10)}.pvault`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  meta.fullBackupAt=Date.now();meta.fullBackupManifest=payload.manifest;chrome.storage.local.set({[MK]:meta});return payload.manifest;
}
async function pvReadPortableFile(file,passphrase){const pkg=JSON.parse(await file.text()),payload=await pvDecryptPortablePackage(pkg,passphrase),error=pvValidatePortablePayload(payload);if(error)throw new Error(error);return payload}
async function pvRestorePortablePayload(payload){
  const error=pvValidatePortablePayload(payload);if(error)throw new Error(error);
  // Decode every attachment and retain current stores before mutating anything.
  for(const group of payload.attachments)for(const row of group.rows)pvDeserializePortableValue(row.value);
  const before=[];for(const spec of PV_PORTABLE_STORES)before.push({...spec,rows:await pvReadPortableStore(spec)});
  if(!restoreVault(payload.vault,{source:"encrypted-portable-backup"}))throw new Error("Vault restore was blocked");
  try{for(const spec of PV_PORTABLE_STORES){const group=payload.attachments.find(g=>g.kind===spec.kind);await pvWritePortableStore(spec,group.rows)} }
  catch(e){try{for(const old of before)await pvWritePortableStore(old,old.rows);if(typeof doUndo==="function")doUndo()}catch(rollbackError){throw new Error(`Attachment restore failed and rollback also failed: ${rollbackError.message}`)}throw new Error("Attachment restore failed; previous vault and attachments were restored: "+e.message)}
  meta.fullRestoreAt=Date.now();chrome.storage.local.set({[MK]:meta});return payload.manifest;
}
async function pvPortableAttachmentStats(){
  const stats={};for(const spec of PV_PORTABLE_STORES){const rows=await pvReadPortableStore(spec);stats[spec.kind]={count:rows.length,bytes:rows.reduce((s,r)=>s+(r.value?.data?Math.ceil(r.value.data.length*3/4):0),0)}}return stats;
}

function pvPortablePassphraseModal(mode,file){
  const isExport=mode==="export";
  showModal(`<h3>${isExport?"Create Encrypted Full Backup":"Unlock Portable Backup"}</h3><p style="font-size:10px;color:var(--mu);line-height:1.5">${isExport?"Includes vault data, full-resolution photos, and legacy file attachments. The passphrase cannot be recovered.":"Enter the passphrase to validate and inspect this backup before restoring."}</p><input type="password" id="pvPass1" class="lock-inp" style="width:100%" placeholder="Passphrase (12+ characters)" autocomplete="new-password">${isExport?'<input type="password" id="pvPass2" class="lock-inp" style="width:100%;margin-top:5px" placeholder="Confirm passphrase" autocomplete="new-password">':""}<div class="lock-err" id="pvPassErr" style="margin-top:5px"></div><div class="brow"><button class="bg-btn" id="pvPassX">Cancel</button><button class="bp" id="pvPassGo">${isExport?"Encrypt & Download":"Unlock & Inspect"}</button></div>`,mc=>{
    mc.querySelector("#pvPassX").addEventListener("click",closeModal);mc.querySelector("#pvPass1").focus();
    mc.querySelector("#pvPassGo").addEventListener("click",async()=>{const pass=mc.querySelector("#pvPass1").value,err=mc.querySelector("#pvPassErr"),btn=mc.querySelector("#pvPassGo");if(pass.length<12){err.textContent="Use at least 12 characters";err.style.display="block";return}if(isExport&&pass!==mc.querySelector("#pvPass2").value){err.textContent="Passphrases do not match";err.style.display="block";return}btn.disabled=true;btn.textContent=isExport?"Encrypting…":"Decrypting…";try{if(isExport){const man=await pvExportPortable(pass);closeModal();flash(`Full backup saved · ${man.counts.total} items · ${(man.totalAttachmentBytes/1048576).toFixed(1)}MB attachments`);if(aTab==="recovery")renderRecoveryCenter()}else{const payload=await pvReadPortableFile(file,pass);closeModal();pvShowPortableInspection(payload,file.name)}}catch(e){err.textContent=e.message;err.style.display="block";btn.disabled=false;btn.textContent=isExport?"Encrypt & Download":"Unlock & Inspect"}});
  });
}
function pvPickPortableBackup(){const input=document.createElement("input");input.type="file";input.accept=".pvault,application/json";input.addEventListener("change",()=>{const f=input.files?.[0];if(f)pvPortablePassphraseModal("restore",f)});input.click()}
function pvShowPortableInspection(payload,fileName){
  const diff=pvPortableDiff(payload),rows=diff.rows.map(r=>`<div class="rc-diff-row"><span>${esc(r.key)}</span><span>${r.current}</span><span>${r.incoming}</span><span style="color:${r.delta<0?'var(--dn)':r.delta>0?'var(--gn)':'var(--dm)'}">${r.delta>0?'+':''}${r.delta}</span></div>`).join(""),att=payload.manifest?.attachmentCounts||{};
  showModal(`<h3>Verified Portable Backup</h3><p style="font-size:10px;color:var(--gn)">Authenticated and structurally valid · ${esc(fileName)}</p><div class="rc-diff"><div class="rc-diff-row rc-diff-h"><span>Store</span><span>Current</span><span>Backup</span><span>Δ</span></div>${rows}</div><p style="font-size:9px;color:var(--mu)">Full-resolution attachments: ${att.photos||0} photos · ${att.files||0} files. Restore replaces vault stores and these attachment stores.</p><div class="brow"><button class="bg-btn" id="pviX">Close</button><button class="bdn" id="pviGo">Restore Verified Backup</button></div>`,mc=>{mc.querySelector("#pviX").addEventListener("click",closeModal);mc.querySelector("#pviGo").addEventListener("click",()=>{showModal(`<h3 style="color:var(--dn)">Restore Full Backup?</h3><p>This replaces current vault data and full-resolution attachment stores. Create a current full backup first if needed.</p><div class="brow"><button class="bg-btn" id="pvrX">Cancel</button><button class="bdn" id="pvrGo">Replace Vault</button></div>`,mx=>{mx.querySelector("#pvrX").addEventListener("click",closeModal);mx.querySelector("#pvrGo").addEventListener("click",async()=>{const b=mx.querySelector("#pvrGo");b.disabled=true;b.textContent="Restoring…";try{await pvRestorePortablePayload(payload);closeModal();flash("Full portable backup restored");aTab="recovery";render()}catch(e){b.disabled=false;b.textContent="Replace Vault";flash("Restore failed: "+e.message)}})})})});
}

// ═════════ RECOVERY CENTER ═════════
function pvRecoveryTime(ts){return ts?new Date(ts).toLocaleString():"Never"}
function pvRecoveryBytes(n){if(!n)return"0 B";if(n<1024)return n+" B";if(n<1048576)return(n/1024).toFixed(1)+" KB";return(n/1048576).toFixed(1)+" MB"}

function renderRecoveryCenter(){
  const m=$("main");if(!m)return;const counts=Cloud.itemCounts(),snaps=Object.entries(meta.snapshots||{}).filter(([,s])=>s?.ts).sort((a,b)=>b[1].ts-a[1].ts);
  m.innerHTML=`<div class="recovery-center"><div class="rc-head"><div><h2>Recovery Center</h2><p>Know what is protected, verify backups before restoring, and recover without guessing.</p></div><span class="rc-health" id="rcHealth">Checking attachments…</span></div>
  <div class="rc-summary"><div class="rc-stat"><span>Vault items</span><strong>${counts.total||0}</strong></div><div class="rc-stat"><span>Full backup</span><strong>${meta.fullBackupAt?"Ready":"Needed"}</strong><small>${pvRecoveryTime(meta.fullBackupAt)}</small></div><div class="rc-stat"><span>Drive metadata backup</span><strong>${Cloud._connected?"Connected":"Off"}</strong><small>${pvRecoveryTime(Cloud._lastSync||meta.gdLastSync)}</small></div><div class="rc-stat"><span>Local snapshots</span><strong>${snaps.length}</strong><small>Rolling checkpoints</small></div></div>
  <div class="rc-card rc-primary"><div class="rc-card-title">Encrypted full portable backup <span class="rc-badge">Recommended</span></div><p>Includes vault JSON plus full-resolution photo and legacy file bytes. Protected by your passphrase with AES-256-GCM.</p><div id="rcAttachmentStats" class="rc-detail">Counting local attachments…</div><div class="rc-actions"><button class="bp" id="rcFullExport">Create full backup</button><button class="bs" id="rcInspect">Test or restore a backup</button></div></div>
  <div class="rc-grid"><div class="rc-card"><div class="rc-card-title">Prompt spreadsheet</div><p>Human- and LLM-editable prompt safekeeping. Excellent for prompt recovery; not a complete vault backup.</p><div class="rc-actions"><button class="bs" id="rcCsv">Export prompts</button><button class="bs" id="rcCsvIn">Reload edited CSV</button></div></div>
  <div class="rc-card"><div class="rc-card-title">Google Drive</div><p>Automatic JSON backup. It protects metadata and thumbnails, but not full-resolution attachment bytes.</p><div class="rc-actions"><button class="bs" id="rcDrivePush">Back up now</button><button class="bs" id="rcDriveRestore">Restore latest…</button></div></div></div>
  <div class="rc-card"><div class="rc-card-title">Local rolling snapshots</div><p>Fast checkpoints stored in this Chrome profile. Useful for recent mistakes; not protection against profile or device loss.</p><div class="rc-snaps">${snaps.length?snaps.map(([i,s])=>`<div class="rc-snap"><div><strong>${new Date(s.ts).toLocaleString()}</strong><span>${s.total||0} items · snapshot ${i}</span></div><button class="bs" data-rc-snap="${i}">Preview restore</button></div>`).join(""):'<div class="rc-empty">No snapshots yet. They appear automatically as you save.</div>'}</div></div>
  <div class="rc-card"><div class="rc-card-title">Backup coverage</div><div class="rc-coverage"><div><span class="rc-dot ok"></span><strong>Full portable</strong><small>Vault + photo/file bytes</small></div><div><span class="rc-dot warn"></span><strong>Drive / JSON</strong><small>Vault metadata + thumbnails only</small></div><div><span class="rc-dot info"></span><strong>Prompt CSV</strong><small>Prompts only, designed for editing</small></div><div><span class="rc-dot muted"></span><strong>Snapshots</strong><small>Local profile only</small></div></div></div></div>`;
  pvPortableAttachmentStats().then(stats=>{const ph=stats.photos||{count:0,bytes:0},fi=stats.files||{count:0,bytes:0},el=$("rcAttachmentStats"),health=$("rcHealth");if(el)el.textContent=`${ph.count} full-resolution photos (${pvRecoveryBytes(ph.bytes)}) · ${fi.count} files (${pvRecoveryBytes(fi.bytes)})`;if(health){health.textContent=meta.fullBackupAt?"Last full backup "+pvRecoveryTime(meta.fullBackupAt):((ph.count+fi.count)>0?"Attachments need a full backup":"Vault ready to back up");health.className="rc-health "+(meta.fullBackupAt?"ok":"warn")}}).catch(e=>{const el=$("rcAttachmentStats");if(el)el.textContent="Attachment scan unavailable: "+e.message});
  $("rcFullExport")?.addEventListener("click",()=>pvPortablePassphraseModal("export"));
  $("rcInspect")?.addEventListener("click",pvPickPortableBackup);
  $("rcCsv")?.addEventListener("click",()=>pvDownloadPromptSheet(false));
  $("rcCsvIn")?.addEventListener("click",importPickFiles);
  $("rcDrivePush")?.addEventListener("click",async()=>{if(!await cloudEnsureConnected($("cloudDot")))return;flash("Backing up to Drive…");await Cloud.push(true);flash(Cloud._error?Cloud._error:"Drive backup complete");renderRecoveryCenter()});
  $("rcDriveRestore")?.addEventListener("click",()=>openRestoreLatestFromDriveModal({returnTo:"recovery"}));
  m.querySelectorAll("[data-rc-snap]").forEach(b=>b.addEventListener("click",()=>pvRecoverySnapshotModal(+b.dataset.rcSnap)));
  updTabs();rFtr();
}

function pvRecoverySnapshotModal(idx){
  const sm=(meta.snapshots||{})[idx],counts=Cloud.itemCounts();if(!sm){flash("Snapshot metadata not found");return}
  showModal(`<h3>Preview Snapshot Restore</h3><div class="rc-diff"><div class="rc-diff-row rc-diff-h"><span>Store</span><span>Current</span><span>Snapshot</span><span>Δ</span></div>${[["prompts",counts.prompts,sm.prompts],["snippets",counts.snippets,sm.snippets],["bookmarks",counts.bookmarks,sm.bookmarks],["notes",counts.notes,sm.notes],["skills",counts.skills,sm.skills],["customgpts",counts.customgpts,sm.customgpts]].map(([k,c,n])=>`<div class="rc-diff-row"><span>${k}</span><span>${c||0}</span><span>${n||0}</span><span>${(n||0)-(c||0)}</span></div>`).join("")}</div><p style="font-size:9px;color:var(--mu)">Snapshot from ${new Date(sm.ts).toLocaleString()}. This restores JSON stores only; it does not change full-resolution attachments.</p><div class="brow"><button class="bg-btn" id="rcsX">Cancel</button><button class="bdn" id="rcsGo">Restore Snapshot</button></div>`,mc=>{mc.querySelector("#rcsX").addEventListener("click",closeModal);mc.querySelector("#rcsGo").addEventListener("click",()=>{const keys=[SP+"p"+idx,SP+"s"+idx,SP+"b"+idx,SP+"n"+idx,SP+"k"+idx,SP+"g"+idx,SP+"i"+idx];chrome.storage.local.get(keys,res=>{const data={prompts:res[keys[0]],snippets:res[keys[1]],bookmarks:res[keys[2]],notes:res[keys[3]],skills:res[keys[4]],customgpts:res[keys[5]],imgprompts:res[keys[6]]};Object.keys(data).forEach(k=>{if(!data[k])delete data[k]});if(!isValidVaultPayload(data)){flash("Snapshot failed validation");return}if(restoreVault(data,{source:"recovery-center-snapshot"})){closeModal();flash("Snapshot restored");aTab="recovery";render()}})})});
}

// ═════════ PROMPT SPREADSHEET ROUND-TRIP ═════════
// Excel-ready UTF-8 CSV: export → edit/LLM-fill → preview → safe upsert.

const PV_PROMPT_SHEET_HEADERS=["action","id","folder","title","prompt","tags","platform","goal","favorite","chain","notes"];

function pvCsvParse(text,sep){
  sep=sep||",";text=String(text||"").replace(/^\uFEFF/,"");
  const rows=[];let row=[],field="",quoted=false;
  const pushRow=()=>{row.push(field);field="";if(row.some(v=>String(v).trim()!==""))rows.push(row);row=[]};
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){
      if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted;
    }else if(c===sep&&!quoted){row.push(field);field=""}
    else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&text[i+1]==="\n")i++;pushRow()}
    else field+=c;
  }
  if(field!==""||row.length)pushRow();
  return rows;
}

function pvSheetSafeText(value){
  const s=String(value??"");
  return /^[=+\-@]/.test(s)?"'"+s:s;
}
function pvSheetRestoreText(value){
  const s=String(value??"");
  return /^'[=+\-@]/.test(s)?s.slice(1):s;
}
function pvCsvCell(value){return `"${pvSheetSafeText(value).replace(/"/g,'""')}"`}

function pvPromptSheetRows(root){
  const rows=[];
  const walk=(folder,path)=>{
    for(const p of(folder.prompts||[]))rows.push({
      action:"UPSERT",id:p.id||"",folder:path,title:p.title||"",prompt:p.content||"",
      tags:JSON.stringify(p.tags||[]),platform:p.platform||"",goal:p.goal||"",
      favorite:p.favorited?"TRUE":"FALSE",chain:(p.chains||[]).join(" "),notes:p.description||""
    });
    for(const child of(folder.children||[]))walk(child,path?path+" / "+child.name:child.name);
  };
  if(root)walk(root,"");
  return rows;
}

function pvPromptSheetCsv(root,includeExample){
  const rows=pvPromptSheetRows(root);
  if(includeExample&&rows.length===0)rows.push({action:"SKIP",id:"",folder:"Examples / Writing",title:"Example prompt",prompt:"Write a concise {{topic}} briefing for {{audience}}.",tags:'["example","writing"]',platform:"",goal:"Create a reusable briefing",favorite:"FALSE",chain:"",notes:"Change SKIP to UPSERT when ready"});
  const lines=[PV_PROMPT_SHEET_HEADERS.map(pvCsvCell).join(",")];
  for(const r of rows)lines.push(PV_PROMPT_SHEET_HEADERS.map(h=>pvCsvCell(r[h]??"")).join(","));
  return "\uFEFF"+lines.join("\r\n");
}

function pvPromptSheetParse(text,fileName){
  const ext=(fileName||"").split(".").pop().toLowerCase();
  const records=pvCsvParse(text,ext==="tsv"?"\t":",");
  if(!records.length)return null;
  const headers=records[0].map(h=>String(h).toLowerCase().trim().replace(/[\s-]+/g,"_"));
  const col=(...names)=>{for(const n of names){const i=headers.indexOf(n);if(i>=0)return i}return-1};
  const titleCol=col("title","name","prompt_name","label"),promptCol=col("prompt","content","text","body","template");
  if(titleCol<0&&promptCol<0)return null;
  const actionCol=col("action"),idCol=col("id","prompt_id"),folderCol=col("folder","folder_path"),tagsCol=col("tags","categories"),platformCol=col("platform"),goalCol=col("goal"),favCol=col("favorite","favorited"),chainCol=col("chain","chains"),notesCol=col("notes","description");
  const value=(r,i)=>i>=0?pvSheetRestoreText(r[i]||""):"";
  const items=[];
  for(let i=1;i<records.length;i++){
    const r=records[i];
    const title=value(r,titleCol).trim(),content=value(r,promptCol);
    if(!title&&!content&&!value(r,idCol))continue;
    let tags=[];const rawTags=value(r,tagsCol).trim();
    if(rawTags){try{const j=JSON.parse(rawTags);tags=Array.isArray(j)?j.map(String):[]}catch{tags=rawTags.split(/[|;,]/).map(t=>t.trim()).filter(Boolean)}}
    const fav=/^(true|yes|1|y)$/i.test(value(r,favCol).trim());
    items.push({_promptSheet:true,_row:i+1,action:(value(r,actionCol)||"UPSERT").trim().toUpperCase(),_id:value(r,idCol).trim(),folder:value(r,folderCol).trim(),title:title||content.slice(0,60)||`Row ${i+1}`,content,tags,platform:value(r,platformCol).trim(),goal:value(r,goalCol),favorited:fav,chains:(chainCol<0?undefined:pvSheetParseChains(value(r,chainCol))),description:value(r,notesCol)});
  }
  return{format:"Prompt Vault Prompt Spreadsheet",isPromptSheet:true,items};
}

function pvPromptIndex(store){
  const byId=new Map();
  const walk=(f,parent)=>{for(const p of(f.prompts||[]))byId.set(String(p.id),{item:p,folder:f,parent});for(const c of(f.children||[]))walk(c,f)};
  if(store?.folders)walk(store.folders,null);return byId;
}

function pvPromptSheetPlan(rows,store){
  const byId=pvPromptIndex(store),seen=new Set(),planned=[];let adds=0,updates=0,skips=0;const errors=[];
  for(const r of rows){
    const action=(r.action||"UPSERT").toUpperCase();
    if(action==="SKIP"){skips++;planned.push({...r,_status:"skip"});continue}
    if(!["UPSERT","ADD","UPDATE"].includes(action)){errors.push(`Row ${r._row}: action must be UPSERT, ADD, UPDATE, or SKIP`);planned.push({...r,_status:"error"});continue}
    if(!r.title&&!r.content){errors.push(`Row ${r._row}: title or prompt is required`);planned.push({...r,_status:"error"});continue}
    if(r._id){if(seen.has(r._id)){errors.push(`Row ${r._row}: duplicate id ${r._id}`);planned.push({...r,_status:"error"});continue}seen.add(r._id)}
    const existing=r._id?byId.get(r._id):null;
    if(action==="UPDATE"&&!existing){errors.push(`Row ${r._row}: UPDATE id was not found`);planned.push({...r,_status:"error"});continue}
    if(action==="ADD"||!existing){adds++;planned.push({...r,_status:"add",_existing:null})}
    else{updates++;planned.push({...r,_status:"update",_existing:existing})}
  }
  return{rows:planned,adds,updates,skips,errors};
}

function pvSheetFolder(store,path,create){
  let cur=store.folders;const parts=String(path||"").split(/\s*\/\s*/).map(s=>s.trim()).filter(Boolean);
  for(const name of parts){let child=(cur.children||[]).find(c=>c.name.toLowerCase()===name.toLowerCase());if(!child&&create){child={id:generateId(store),name,children:[],prompts:[],color:""};cur.children=cur.children||[];cur.children.push(child)}if(!child)return null;cur=child}
  return cur;
}

// Parses a `chain` cell such as "AA2" or "AA2 BC5" into canonical tags. Unreadable entries
// are passed through verbatim so pvChainNormalizeItem quarantines them on the prompt — a
// typo in a spreadsheet should be recoverable, not erased.
function pvSheetParseChains(raw){
  if(raw===undefined||raw===null)return undefined;   // column absent → membership untouched
  const out=[];
  for(const part of String(raw).split(/[\s,;|]+/).map(s=>s.trim()).filter(Boolean)){
    const parsed=(typeof pvChainParseTag==="function")?pvChainParseTag(part):null;
    const val=parsed?parsed.tag:part;
    if(!out.includes(val))out.push(val);
  }
  return out;
}

function pvApplyPromptSheet(plan,store){
  if(plan.errors.length)throw new Error("Spreadsheet has validation errors");
  let cleared=0;   // prompts whose chain membership the sheet explicitly emptied
  for(const r of plan.rows){
    if(r._status==="skip")continue;
    const target=pvSheetFolder(store,r.folder||((r._status==="add")?"📥 Spreadsheet Imports":""),true)||store.folders;
    if(r._status==="update"){
      const hit=r._existing,p=hit.item;
      if(p.title!==r.title||p.content!==r.content||(p.tags||[]).join("\u0000")!==r.tags.join("\u0000")){
        p.versions=p.versions||[];p.versions.push({title:p.title,content:p.content,tags:[...(p.tags||[])],saved:Date.now(),note:"Before spreadsheet reload"});if(p.versions.length>20)p.versions=p.versions.slice(-20);
      }
      p.title=r.title;p.content=r.content;p.tags=r.tags;p.platform=r.platform;p.goal=r.goal;p.favorited=r.favorited;p.description=r.description;p.modified=Date.now();
      // Only touch membership when the sheet actually carried a chain column. A CSV written
      // before this column existed must never be read as "remove from every chain".
      if(Array.isArray(r.chains)){
        if(!r.chains.length&&(p.chains||[]).length)cleared++;
        p.chains=r.chains.slice();
        if(typeof pvChainNormalizeItem==="function")pvChainNormalizeItem(p);
        if(!(p.chains||[]).length)delete p.chains;
      }
      if(hit.folder!==target){hit.folder.prompts=hit.folder.prompts.filter(x=>x!==p);target.prompts=target.prompts||[];target.prompts.push(p)}
    }else{
      target.prompts=target.prompts||[];target.prompts.push({id:generateId(store),title:r.title||"Untitled",content:r.content||"",tags:r.tags||[],platform:r.platform||"",goal:r.goal||"",favorited:!!r.favorited,description:r.description||"",created:Date.now(),modified:Date.now(),usageCount:0,versions:[],nextId:"",injectIntent:"user"});
      if(Array.isArray(r.chains)&&r.chains.length){
        const fresh=target.prompts[target.prompts.length-1];
        fresh.chains=r.chains.slice();
        if(typeof pvChainNormalizeItem==="function")pvChainNormalizeItem(fresh);
      }
    }
  }
  return{adds:plan.adds,updates:plan.updates,skips:plan.skips,chainsCleared:cleared};
}

function pvPromptSheetLlmInstructions(){
  return `You are editing a Prompt Vault CSV. Keep the header row exactly unchanged. Each data row is one prompt. Use action UPSERT to add or update and SKIP to ignore a row. Keep an existing id unchanged to update that prompt; leave id blank to create a new prompt. folder uses slash-separated nesting, for example Work / Writing. prompt may contain multiline text and {{variables}}. tags should be a JSON array such as ["writing","research"]. favorite is TRUE or FALSE. Do not add commentary before or after the CSV, do not invent IDs, and do not create DELETE rows.`;
}

function pvDownloadPromptSheet(blank){
  const csv=pvPromptSheetCsv(blank?null:P.folders,!!blank),d=new Date().toISOString().slice(0,10),fn=blank?"prompt-vault-llm-template.csv":`prompt-vault-prompts-${d}.csv`;
  chrome.runtime.sendMessage({type:"EXPORT_FILE",data:csv,filename:fn,mimeType:"text/csv;charset=utf-8"},()=>flash(blank?"Template downloaded":"Prompt spreadsheet exported"));
}

// ═════════ JSON ROUND-TRIP (LLM-friendly sibling of the CSV) ═════════
// Same field model as the CSV, but tags as arrays and favorite as a boolean, and
// a tolerant importer — so a model like Cowork or Codex can edit the file and
// hand it straight back without tripping on fences, comments, or trailing commas.

// Strip // and /* */ comments and trailing commas without touching string contents.
function pvJsonRepair(src){
  let out="",i=0,inStr=false,esc=false;const n=src.length;
  while(i<n){
    const c=src[i];
    if(inStr){out+=c;if(esc)esc=false;else if(c==="\\")esc=true;else if(c==='"')inStr=false;i++;continue}
    if(c==='"'){inStr=true;out+=c;i++;continue}
    if(c==="/"&&src[i+1]==="/"){i+=2;while(i<n&&src[i]!=="\n")i++;continue}
    if(c==="/"&&src[i+1]==="*"){i+=2;while(i<n&&!(src[i]==="*"&&src[i+1]==="/"))i++;i+=2;continue}
    out+=c;i++;
  }
  return out.replace(/,(\s*[}\]])/g,"$1");
}
// Remove a wrapping Markdown code fence: drop the opening ```lang line and a
// trailing ``` line. Only the outer fence is stripped, so backticks inside the
// JSON payload (they are valid inside JSON string values) are preserved.
function pvStripFence(text){
  let t=String(text||"").replace(/^\uFEFF/,"").trim();
  if(t.startsWith("```")){
    const nl=t.indexOf("\n");
    if(nl>=0)t=t.slice(nl+1).replace(/\s*```\s*$/,"").trim();
  }
  return t;
}
// Does this text look like JSON (possibly wrapped in a Markdown code fence)?
function pvLooksLikeJson(text){
  const t=pvStripFence(text);
  return t.startsWith("{")||t.startsWith("[");
}
// Parse JSON tolerantly: BOM, ```json fences, // and /* */ comments, trailing
// commas, and surrounding prose. Throws only if nothing parseable is found.
function pvParseLenientJson(text){
  const tryP=s=>{try{return{ok:true,v:JSON.parse(s)}}catch(e){return{ok:false,e}}};
  const raw=String(text||"").replace(/^\uFEFF/,"").trim();
  let r=tryP(raw);if(r.ok)return r.v;
  const unfenced=pvStripFence(raw);
  if(unfenced!==raw){r=tryP(unfenced);if(r.ok)return r.v}
  const rep=pvJsonRepair(unfenced);
  r=tryP(rep);if(r.ok)return r.v;
  const starts=[rep.indexOf("{"),rep.indexOf("[")].filter(x=>x>=0);
  const a=starts.length?Math.min(...starts):-1,b=Math.max(rep.lastIndexOf("}"),rep.lastIndexOf("]"));
  if(a>=0&&b>a){r=tryP(rep.slice(a,b+1));if(r.ok)return r.v}
  throw (r.e||new Error("Unparseable JSON"));
}
// Map one loose JSON prompt object → the prompt-sheet row shape, so JSON imports
// get the same forgiving upsert as the CSV (folder routing, update-by-id,
// version history, no-delete, preview).
function pvJsonPromptToSheetItem(p,idx){
  const s=v=>v==null?"":String(v);
  let tags=p.tags!=null?p.tags:(p.categories!=null?p.categories:(p.category!=null?[p.category]:[]));
  if(Array.isArray(tags))tags=tags.map(s).map(t=>t.trim()).filter(Boolean);
  else if(typeof tags==="string")tags=tags.split(/[|;,]/).map(t=>t.trim()).filter(Boolean);
  else tags=[];
  const content=s(p.content!=null?p.content:(p.prompt!=null?p.prompt:(p.text!=null?p.text:(p.body!=null?p.body:p.template))));
  const title=s(p.title||p.name||p.prompt_name||p.label||"").trim()||content.slice(0,60);
  const favRaw=p.favorite!=null?p.favorite:p.favorited;
  return {_promptSheet:true,_row:idx+2,
    action:(s(p.action||"UPSERT").trim().toUpperCase())||"UPSERT",
    _id:s(p.id||p.prompt_id||"").trim(),
    folder:s(p.folder||p.folder_path||p.path||"").trim(),
    title,content,tags,
    platform:s(p.platform||"").trim(),
    goal:s(p.goal||""),
    favorited:favRaw===true||/^(true|yes|1|y)$/i.test(s(favRaw).trim()),
    // `chain` mirrors the CSV column: absent key → undefined → membership untouched;
    // present-but-empty → [] → explicitly cleared. Without this a JSON round-trip would
    // silently drop every chain annotation.
    chains:((p.chain!==undefined)?pvSheetParseChains(p.chain):((p.chains!==undefined)?pvSheetParseChains(Array.isArray(p.chains)?p.chains.join(" "):p.chains):undefined)),
    description:s(p.notes!=null?p.notes:(p.description!=null?p.description:(p.desc!=null?p.desc:p.summary)))};
}
// Pull the prompt array out of any recognized wrapper shape.
function pvJsonPromptArray(j){
  const arr=Array.isArray(j)?j:(Array.isArray(j&&j.prompts)?j.prompts:Array.isArray(j&&j.items)?j.items:Array.isArray(j&&j.data)?j.data:null);
  if(!arr||!arr.length)return null;
  const f=arr[0];
  if(!f||typeof f!=="object")return null;
  if(f.title||f.name||f.prompt||f.content||f.text||f.prompt_name||f.label||f.id!=null)return arr;
  return null;
}
function pvPromptSheetJsonObject(root){
  const rows=pvPromptSheetRows(root).map(r=>({
    action:r.action,id:r.id,folder:r.folder,title:r.title,prompt:r.prompt,
    tags:(()=>{try{const t=JSON.parse(r.tags);return Array.isArray(t)?t:[]}catch{return[]}})(),
    platform:r.platform,goal:r.goal,favorite:r.favorite==="TRUE",chain:r.chain||"",notes:r.notes
  }));
  return {_format:"prompt-vault-prompts",_version:1,_instructions:pvPromptJsonLlmInstructions(),prompts:rows};
}
function pvPromptSheetJson(root,blank){
  const obj=pvPromptSheetJsonObject(root);
  if(blank&&obj.prompts.length===0)obj.prompts.push({action:"UPSERT",id:"",folder:"Work / Writing",title:"Example prompt",prompt:"Write a concise {{topic}} briefing for {{audience}}.",tags:["example","writing"],platform:"",goal:"Create a reusable briefing",favorite:false,notes:"Leave id blank to create; keep an id to update."});
  return JSON.stringify(obj,null,2);
}
function pvPromptJsonLlmInstructions(){
  return "You are editing a Prompt Vault prompt library as JSON. Return ONLY the JSON object with a top-level \"prompts\" array (wrapping it in a fenced code block is fine). Each prompt is one object. Set \"action\" to \"UPSERT\" to add or update, or \"SKIP\" to ignore it. Keep an existing \"id\" unchanged to update that prompt; leave \"id\" empty (\"\") to create a new one. \"folder\" uses slash-separated nesting, e.g. \"Work / Writing\". \"prompt\" may be multiline and contain {{variables}}. \"tags\" is an array of strings. \"favorite\" is true or false. Do not invent ids and never delete prompts.";
}
function pvDownloadPromptJson(blank){
  const json=pvPromptSheetJson(blank?{id:"root",name:"My Prompts",children:[],prompts:[]}:P.folders,!!blank);
  const d=new Date().toISOString().slice(0,10),fn=blank?"prompt-vault-llm-template.json":`prompt-vault-prompts-${d}.json`;
  chrome.runtime.sendMessage({type:"EXPORT_FILE",data:json,filename:fn,mimeType:"application/json"},()=>flash(blank?"JSON template downloaded":"Prompts exported as JSON"));
}

// ═══════ SINGLE PROMPT EXPORT / SHARE ═══════
function exportSinglePrompt(p){
  if(!p)return;
  const md=buildPromptMarkdown(p);
  const json=JSON.stringify({title:p.title,content:p.content,tags:p.tags||[],platform:p.platform||"",params:p.params||null,created:p.created,modified:p.modified,goal:p.goal||"",nextId:p.nextId||"",versions:(p.versions||[]).length},null,2);

  showModal(`<h3>Share Prompt</h3><p style="font-size:10px;color:var(--dm)">${esc(p.title)}</p>
    <div class="exp-opt" data-sp="md"><div class="eo-t">${S.clip} Copy as Markdown</div><div class="eo-d">Paste into docs, Slack, or share with colleagues</div></div>
    <div class="exp-opt" data-sp="json"><div class="eo-t">${S.doc} Copy as JSON</div><div class="eo-d">Import into another Prompt Vault instance</div></div>
    <div class="exp-opt" data-sp="file"><div class="eo-t">${I.dl} Download .md file</div><div class="eo-d">Save as a standalone file</div></div>
    <div class="exp-opt" data-sp="raw"><div class="eo-t">${I.copy} Copy raw content</div><div class="eo-d">Just the prompt text, nothing else</div></div>
    <div class="brow"><button class="bg-btn" id="spX">Cancel</button></div>`,mc=>{
    mc.querySelector("#spX").addEventListener("click",closeModal);
    mc.querySelectorAll("[data-sp]").forEach(el=>{el.addEventListener("click",()=>{
      const fmt=el.dataset.sp;
      if(fmt==="md"){navigator.clipboard.writeText(md).then(()=>{flash("Copied Markdown");closeModal()})}
      else if(fmt==="json"){navigator.clipboard.writeText(json).then(()=>{flash("Copied JSON");closeModal()})}
      else if(fmt==="file"){
        const fn=(p.title||"prompt").replace(/[^a-zA-Z0-9 _-]/g,"").replace(/\s+/g,"-").toLowerCase()+".md";
        chrome.runtime.sendMessage({type:"EXPORT_FILE",data:md,filename:fn,mimeType:"text/markdown"},()=>flash("Downloaded"));closeModal();
      }
      else if(fmt==="raw"){navigator.clipboard.writeText(p.content||"").then(()=>{flash("Copied raw content");closeModal()})}
    })});
  });
}

function buildPromptMarkdown(p){
  let md=`# ${p.title}\n\n`;
  if(p.platform)md+=`**Platform:** ${getPlatName(p.platform)||p.platform}\n`;
  if((p.tags||[]).length)md+=`**Tags:** ${p.tags.join(", ")}\n`;
  if(p.goal)md+=`**Goal:** ${p.goal}\n`;
  if(p.platform||p.tags?.length||p.goal)md+=`\n`;
  if(p.content){
    const hasVars=p.content.includes("{{");
    if(hasVars)md+=`## Prompt\n\n\`\`\`\n${p.content}\n\`\`\`\n\n`;
    else md+=`## Prompt\n\n${p.content}\n\n`;
  }
  if(p.params){
    const sfx=buildMjSuffix(p.params);
    if(sfx)md+=`**Midjourney Settings:** \`${sfx.trim()}\`\n\n`;
    const inf=(p.params.influences||[]).filter(i=>(i.name||"").trim());
    if(inf.length)md+=`**Influences:** ${inf.map(i=>`${i.name} (${i.weight}%)`).join(", ")}\n\n`;
  }
  const vars=extractVars(p.content);
  if(vars.length){
    md+=`## Variables\n\n`;
    vars.forEach(v=>{const d=parseVarDef(v);md+=`- **${d.label}**${d.type!=="text"?` (${d.type})`:""}${d.options?" — "+d.options.join(", "):""}\n`});
    md+=`\n`;
  }
  md+=`---\n*Exported from Prompt Vault · ${new Date().toISOString().slice(0,10)}*\n`;
  return md;
}

// ═══════ EXPORTS PER TAB ═══════
function exportCollectionAsHtml(col){
  const items=getCollItems(col.id);
  const label=`Collection: ${col.name}`;
  const d=new Date().toISOString().slice(0,10);
  let html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${label} Digest — ${d}</title><style>body{font-family:'Georgia','Times New Roman',serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.6}h1{font-size:22px;border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:24px}article{margin-bottom:28px;page-break-inside:avoid}h2{font-size:15px;font-weight:600;margin:0 0 4px;color:#111}.meta{font-size:11px;color:#888;margin-bottom:8px}.tags{margin-bottom:6px}.tag{display:inline-block;font-size:10px;background:#f0f0f0;color:#555;padding:1px 7px;border-radius:3px;margin-right:3px}pre{background:#f7f7f7;border:1px solid #e0e0e0;border-radius:4px;padding:12px;font-family:'Courier New',monospace;font-size:12px;line-height:1.5;white-space:pre-wrap;overflow-wrap:break-word}.content{font-size:13px;white-space:pre-wrap}hr{border:none;border-top:1px solid #ddd;margin:0}.source{font-size:10px;color:#888;margin-top:4px}a{color:#2a6cb6}@media print{body{margin:20px}article{page-break-inside:avoid}}</style></head><body>`;
  html+=`<h1>${label} Digest</h1><p style="font-size:12px;color:#888;margin-top:-16px;margin-bottom:24px">${items.length} item${items.length!==1?'s':''} · exported ${d}</p>`;
  items.forEach(p=>{
    html+=`<article><h2>${esc(p.title)}</h2>`;
    const metaParts=[];
    if(p.platform)metaParts.push(getPlatName(p.platform)||p.platform);
    if(p.capturedAt)metaParts.push(formatDateTime(p.capturedAt));
    else if(p.created)metaParts.push(formatDate(p.created));
    if(p.folderName)metaParts.push(p.folderName);
    if(metaParts.length)html+=`<div class="meta">${metaParts.join(' · ')}</div>`;
    if(p.tags?.length)html+=`<div class="tags">${p.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`;
    if(p.content){
      if((isS()||isN())&&p.content.includes("\n"))html+=`<pre>${esc(p.content)}</pre>`;
      else html+=`<div class="content">${esc(p.content)}</div>`;
    }
    if(p.url)html+=`<div class="source"><a href="${esc(safeUrl(p.url))}">${esc(p.url)}</a></div>`;
    if(p.sourceUrl)html+=`<div class="source">Source: <a href="${esc(safeUrl(p.sourceUrl))}">${esc(p.sourceTitle||p.sourceUrl)}</a></div>`;
    html+=`</article><hr>`;
  });
  html+=`</body></html>`;
  const fn=`collection-${(col.name||"export").replace(/[^a-zA-Z0-9]/g,"-").toLowerCase()}-${d}.html`;
  chrome.runtime.sendMessage({type:"EXPORT_FILE",data:html,filename:fn,mimeType:"text/html"},()=>flash("Exported HTML"));
}
function showExpMd(){
  const s2=st(),collId=s2.collFilter;
  const items=collId?getCollItems(collId):allItems(dt().folders);
  const col=collId?(collData().collections||[]).find(c=>c.id===collId):null;
  const label=col?`Collection: ${col.name}`:isP()?"Prompts":isI()?"Image Prompts":isK()?"Skills":isS()?"Clips":isN()?"Notes":isG()?"Custom GPTs":"Bookmarks";
  showModal(`<h3>Export ${label}</h3>
    <div class="exp-opt" data-f="digest"><div class="eo-t">${S.clip} Digest</div><div class="eo-d">Clean, printable HTML — formatting preserved</div></div>
    <div class="exp-opt" data-f="md"><div class="eo-t">Markdown</div><div class="eo-d">Readable, Google Docs</div></div>
    <div class="exp-opt" data-f="csv"><div class="eo-t">${isP()&&!collId?"Reloadable prompt CSV":"CSV"}</div><div class="eo-d">${isP()&&!collId?"Excel-ready · edit or let an LLM add prompts · import it back":"Sheets, Excel, Notion"}</div></div>
    <div class="exp-opt" data-f="json"><div class="eo-t">JSON</div><div class="eo-d">Full backup</div></div>
    <div class="brow"><button class="bg-btn" id="exX">Cancel</button></div>`,c=>{
    c.querySelector("#exX").addEventListener("click",closeModal);
    c.querySelectorAll(".exp-opt").forEach(el=>{el.addEventListener("click",()=>{
      const fmt=el.dataset.f;let data,fn,mime;const d=new Date().toISOString().slice(0,10);
      if(fmt==="digest"){
        let html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${label} Digest — ${d}</title><style>body{font-family:'Georgia','Times New Roman',serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.6}h1{font-size:22px;border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:24px}article{margin-bottom:28px;page-break-inside:avoid}h2{font-size:15px;font-weight:600;margin:0 0 4px;color:#111}.meta{font-size:11px;color:#888;margin-bottom:8px}.tags{margin-bottom:6px}.tag{display:inline-block;font-size:10px;background:#f0f0f0;color:#555;padding:1px 7px;border-radius:3px;margin-right:3px}pre{background:#f7f7f7;border:1px solid #e0e0e0;border-radius:4px;padding:12px;font-family:'Courier New',monospace;font-size:12px;line-height:1.5;white-space:pre-wrap;overflow-wrap:break-word}.content{font-size:13px;white-space:pre-wrap}hr{border:none;border-top:1px solid #ddd;margin:0}.source{font-size:10px;color:#888;margin-top:4px}a{color:#2a6cb6}@media print{body{margin:20px}article{page-break-inside:avoid}}</style></head><body>`;
        html+=`<h1>${label} Digest</h1><p style="font-size:12px;color:#888;margin-top:-16px;margin-bottom:24px">${items.length} item${items.length!==1?'s':''} · exported ${d}</p>`;
        items.forEach(p=>{
          html+=`<article><h2>${esc(p.title)}</h2>`;
          const metaParts=[];
          if(p.platform)metaParts.push(getPlatName(p.platform)||p.platform);
          if(p.capturedAt)metaParts.push(formatDateTime(p.capturedAt));
          else if(p.created)metaParts.push(formatDate(p.created));
          if(p.folderName)metaParts.push(p.folderName);
          if(metaParts.length)html+=`<div class="meta">${metaParts.join(' · ')}</div>`;
          if(p.tags?.length)html+=`<div class="tags">${p.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`;
          if(p.content){
            if((isS()||isN())&&p.content.includes("\n"))html+=`<pre>${esc(p.content)}</pre>`;
            else html+=`<div class="content">${esc(p.content)}</div>`;
          }
          if(p.url)html+=`<div class="source"><a href="${esc(safeUrl(p.url))}">${esc(p.url)}</a></div>`;
          if(p.sourceUrl)html+=`<div class="source">Source: <a href="${esc(safeUrl(p.sourceUrl))}">${esc(p.sourceTitle||p.sourceUrl)}</a></div>`;
          html+=`</article><hr>`;
        });
        html+=`</body></html>`;
        data=html;fn=col?`collection-${(col.name||"export").replace(/[^a-zA-Z0-9]/g,"-").toLowerCase()}-${d}.html`:`vault-${label.toLowerCase()}-digest-${d}.html`;mime="text/html"
      }
      else if(fmt==="md"){let md=`# ${label}\n\n`;items.forEach(p=>{md+=`## ${p.title}\n\n`;
        if(p.platform)md+=`**Platform:** ${getPlatName(p.platform)||p.platform}\n\n`;
        if(p.tags?.length)md+=`**Tags:** ${p.tags.join(", ")}\n\n`;if(p.url)md+=`**URL:** ${p.url}\n\n`;
        if(p.sourceUrl)md+=`**Source:** [${p.sourceTitle||"link"}](${p.sourceUrl})\n\n`;
        if(p.capturedAt)md+=`**Captured:** ${formatDateTime(p.capturedAt)}\n\n`;
        if(p.content){
          // For clips and notes, preserve exact formatting with fenced block
          if((isS()||isN())&&p.content.includes("\n"))md+=`\`\`\`\n${p.content}\n\`\`\`\n\n`;
          else md+=`${p.content}\n\n`;
        }md+=`---\n\n`});
        data=md;fn=`vault-${label.toLowerCase()}-${d}.md`;mime="text/markdown"}
      else if(fmt==="csv"&&isP()&&!collId){data=pvPromptSheetCsv(P.folders,false);fn=`prompt-vault-prompts-${d}.csv`;mime="text/csv;charset=utf-8"}
      else if(fmt==="csv"){const rows=[["Title","Platform","Tags","Content","URL","Source URL","Captured","Created","Modified","Usage"].join(",")];
        items.forEach(p=>rows.push([p.title,getPlatName(p.platform)||"",(p.tags||[]).join("; "),(p.content||"").replace(/[\r\n]+/g," "),p.url||"",p.sourceUrl||"",p.capturedAt?new Date(p.capturedAt).toISOString():"",p.created?new Date(p.created).toISOString():"",p.modified?new Date(p.modified).toISOString():"",p.usageCount||0].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")));
        data=rows.join("\n");fn=`vault-${label.toLowerCase()}-${d}.csv`;mime="text/csv"}
      else{const payload=collId?{collection:col,items}:(isB()?{_format:"prompt-vault-bookmarks",_version:1,bookmarks:deepClone(BM),exportedAt:new Date().toISOString()}:dt());data=JSON.stringify(payload,null,2);fn=isB()&&!collId?`prompt-vault-bookmarks-${d}.json`:`vault-${(col?col.name:label).toLowerCase().replace(/[^a-z0-9]/g,"-")}-${d}.json`;mime="application/json"}
      chrome.runtime.sendMessage({type:"EXPORT_FILE",data,filename:fn,mimeType:mime},()=>flash(`Exported ${fmt.toUpperCase()}`));closeModal()})})
  })}

// ═══════ NOTE EXPORT (HTML → Markdown download) ═══════
function exportNote(p){
  if(!p)return;
  let md=`# ${p.title}\n\n`;
  if((p.tags||[]).length)md+=`**Tags:** ${p.tags.join(", ")}\n\n`;
  // Convert note HTML content to readable text
  if(p.content){
    const text=typeof htmlToFormattedText==="function"?htmlToFormattedText(p.content):(p.content||"").replace(/<[^>]+>/g,"").trim();
    md+=text+"\n\n";
  }
  md+=`---\n*Exported from Prompt Vault · ${new Date().toISOString().slice(0,10)}*\n`;
  const fn=(p.title||"note").replace(/[^a-zA-Z0-9 _-]/g,"").replace(/\s+/g,"-").toLowerCase()+".md";
  chrome.runtime.sendMessage({type:"EXPORT_FILE",data:md,filename:fn,mimeType:"text/markdown"},()=>flash("Note exported"));
}

// ═══════ REPORT BUILDER — combine Notes + Clips into one report ═══════
// Pull every note and clip into one normalized, orderable list.
function pvReportSources(){
  const out=[];
  const walk=(f,type)=>{
    (f.prompts||[]).forEach(p=>out.push(type==="note"
      ?{type:"note",id:p.id,title:p.title||"Untitled note",content:p.content||"",tags:p.tags||[],created:p.created||0,modified:p.modified||0}
      :{type:"clip",id:p.id,title:p.title||"Untitled clip",content:p.content||"",tags:p.tags||[],created:p.created||0,modified:p.modified||0,sourceUrl:p.sourceUrl||"",sourceTitle:p.sourceTitle||"",platform:p.platform||"",capturedAt:p.capturedAt||0}));
    (f.children||[]).forEach(c=>walk(c,type));
  };
  if(typeof NT!=="undefined"&&NT?.folders)walk(NT.folders,"note");
  if(typeof SN!=="undefined"&&SN?.folders)walk(SN.folders,"clip");
  return out;
}
function pvReportOrder(items,mode){
  const a=items.slice();
  if(mode==="new")a.sort((x,y)=>(y.capturedAt||y.modified||y.created||0)-(x.capturedAt||x.modified||x.created||0));
  else if(mode==="old")a.sort((x,y)=>(x.capturedAt||x.created||0)-(y.capturedAt||y.created||0));
  else if(mode==="title")a.sort((x,y)=>(x.title||"").localeCompare(y.title||""));
  else a.sort((x,y)=>(x.type===y.type?0:x.type==="note"?-1:1)); // notes, then clips (stable)
  return a;
}
// Notes store HTML; clips store plain text.
function pvReportItemText(it){
  if(it.type==="note")return typeof htmlToFormattedText==="function"?htmlToFormattedText(it.content):(it.content||"").replace(/<[^>]+>/g,"").trim();
  return it.content||"";
}
function pvReportCounts(items){return{notes:items.filter(i=>i.type==="note").length,clips:items.filter(i=>i.type==="clip").length}}
function pvBuildReportMarkdown(title,items){
  const d=new Date().toISOString().slice(0,10),c=pvReportCounts(items);
  let md=`# ${title}\n\n_Generated ${d} · ${c.notes} note${c.notes!==1?"s":""} · ${c.clips} clip${c.clips!==1?"s":""}_\n\n`;
  items.forEach(it=>{
    md+=`## ${it.title}\n\n`;
    const meta=[it.type==="note"?"Note":"Clip"];
    if(it.type==="clip"){if(it.platform)meta.push(getPlatName(it.platform)||it.platform);if(it.capturedAt&&typeof formatDateTime==="function")meta.push(formatDateTime(it.capturedAt))}
    if((it.tags||[]).length)meta.push(it.tags.join(", "));
    md+=`*${meta.join(" · ")}*\n\n`;
    const body=pvReportItemText(it);
    if(body)md+=(body.includes("\n")&&it.type==="clip"?"```\n"+body+"\n```":body)+"\n\n";
    if(it.type==="clip"&&it.sourceUrl)md+=`> Source: [${it.sourceTitle||it.sourceUrl}](${it.sourceUrl})\n\n`;
    md+=`---\n\n`;
  });
  md+=`*Compiled from Prompt Vault · ${d}*\n`;
  return md;
}
function pvBuildReportHtml(title,items){
  const d=new Date().toISOString().slice(0,10),c=pvReportCounts(items);
  const css=`body{font-family:'Georgia','Times New Roman',serif;max-width:720px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.6}h1{font-size:23px;border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:6px}.sub{font-size:12px;color:#888;margin-bottom:20px}article{margin-bottom:26px;page-break-inside:avoid}h2{font-size:16px;font-weight:600;margin:0 0 4px;color:#111}.meta{font-size:11px;color:#888;margin-bottom:8px}.tag{display:inline-block;font-size:10px;background:#f0f0f0;color:#555;padding:1px 7px;border-radius:3px;margin-right:3px}.content{font-size:13px;white-space:pre-wrap}pre{background:#f7f7f7;border:1px solid #e0e0e0;border-radius:4px;padding:12px;font-family:'Courier New',monospace;font-size:12px;line-height:1.5;white-space:pre-wrap;overflow-wrap:break-word}.source{font-size:10px;color:#888;margin-top:6px}a{color:#2a6cb6}hr{border:none;border-top:1px solid #ddd;margin:0}@media print{body{margin:20px}.noprint{display:none}article{page-break-inside:avoid}}`;
  let html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(title)}</title><style>${css}</style></head><body>`;
  html+=`<div class="noprint sub">Tip: press Ctrl/Cmd+P to save this report as a PDF.</div>`;
  html+=`<h1>${esc(title)}</h1><div class="sub">${c.notes} note${c.notes!==1?"s":""} · ${c.clips} clip${c.clips!==1?"s":""} · compiled ${d}</div>`;
  items.forEach(it=>{
    html+=`<article><h2>${esc(it.title)}</h2>`;
    const meta=[it.type==="note"?"Note":"Clip"];
    if(it.type==="clip"){if(it.platform)meta.push(esc(getPlatName(it.platform)||it.platform));if(it.capturedAt&&typeof formatDateTime==="function")meta.push(esc(formatDateTime(it.capturedAt)))}
    html+=`<div class="meta">${meta.join(" · ")}</div>`;
    if((it.tags||[]).length)html+=`<div>${it.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>`;
    const body=pvReportItemText(it);
    if(body)html+=body.includes("\n")?`<pre>${esc(body)}</pre>`:`<div class="content">${esc(body)}</div>`;
    if(it.type==="clip"&&it.sourceUrl)html+=`<div class="source">Source: <a href="${esc(safeUrl(it.sourceUrl))}">${esc(it.sourceTitle||it.sourceUrl)}</a></div>`;
    html+=`</article><hr>`;
  });
  html+=`</body></html>`;
  return html;
}
// Report as a Notes-silo note (allowed tags only).
function pvBuildReportNoteHtml(title,items){
  let h=`<h2>${esc(title)}</h2>`;
  items.forEach(it=>{
    h+=`<h3>${esc(it.title)}</h3>`;
    if(it.type==="clip"){const meta=[];if(it.platform)meta.push(esc(getPlatName(it.platform)||it.platform));if(it.capturedAt&&typeof formatDateTime==="function")meta.push(esc(formatDateTime(it.capturedAt)));if(meta.length)h+=`<p><em>${meta.join(" · ")}</em></p>`}
    const body=pvReportItemText(it);
    if(body)h+=`<p>${esc(body).replace(/\n/g,"<br>")}</p>`;
    if(it.type==="clip"&&it.sourceUrl)h+=`<blockquote>Source: ${esc(it.sourceTitle||it.sourceUrl)} — ${esc(it.sourceUrl)}</blockquote>`;
  });
  return typeof sanitizeNoteHtml==="function"?sanitizeNoteHtml(h):h;
}
function pvReportFileName(title){return(title||"report").replace(/[^a-zA-Z0-9 _-]/g,"").replace(/\s+/g,"-").toLowerCase()||"report"}
function pvSaveReportNote(title,items){
  pushUndo();
  let rf=findFolder(NT.folders,"n_reports");
  if(!rf){rf={id:"n_reports",name:"📄 Reports",children:[],prompts:[],color:"#c9a45c"};NT.folders.children.unshift(rf)}
  const item=buildItem(NT,title,pvBuildReportNoteHtml(title,items),["report"]);
  item.provenance={source:"report-builder",capturedAt:Date.now(),count:items.length};
  rf.prompts.unshift(item);
  save();
  aTab="notes";nSt.sel="n_reports";if(nSt.exp){nSt.exp.n_reports=1;nSt.exp.nroot=1}
  flash("OK Report saved to Notes › Reports");render();
}
function pvOpenReportHtml(title,items){
  const html=pvBuildReportHtml(title,items);
  const dl=()=>chrome.runtime.sendMessage({type:"EXPORT_FILE",data:html,filename:pvReportFileName(title)+".html",mimeType:"text/html"},()=>flash("Report HTML downloaded — open it to print/PDF"));
  try{
    const url=URL.createObjectURL(new Blob([html],{type:"text/html"}));
    if(chrome.tabs&&chrome.tabs.create){chrome.tabs.create({url},()=>{if(chrome.runtime.lastError)dl();setTimeout(()=>URL.revokeObjectURL(url),60000)})}
    else dl();
  }catch(_){dl()}
}
function openReportBuilder(){
  const all=pvReportSources();
  if(!all.length){flash("No notes or clips to compile yet");return}
  const d=new Date().toISOString().slice(0,10);
  const rowHtml=it=>`<div class="iw-row" data-rid="${escAttr(it.id)}"><label class="iw-cb"><input type="checkbox" data-rc="${escAttr(it.id)}"></label><div class="iw-info"><div class="iw-title">${it.type==="note"?"📝":"📋"} ${esc(it.title)}</div><div class="iw-meta">${esc((pvReportItemText(it)||"").slice(0,70).replace(/\s+/g," "))||"(empty)"}</div></div></div>`;
  showModal(`<h3>Build report from notes &amp; clips</h3>
    <input type="text" id="rbTitle" value="Report — ${d}" style="width:100%;margin-bottom:6px">
    <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px"><input type="text" id="rbSearch" placeholder="Filter…" style="flex:1"><select id="rbOrder" style="font-size:11px"><option value="type">Notes, then clips</option><option value="new">Newest first</option><option value="old">Oldest first</option><option value="title">Title A–Z</option></select></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><div><button class="bs" id="rbAll" style="font-size:9px">All</button> <button class="bs" id="rbNone" style="font-size:9px">None</button></div><div style="font-size:9px;color:var(--dm)" id="rbCount">0 selected</div></div>
    <div id="rbList" style="max-height:250px;overflow-y:auto">${all.map(rowHtml).join("")}</div>
    <div class="brow" style="margin-top:8px"><button class="bg-btn" id="rbX">Cancel</button><button class="bs" id="rbMd">Download .md</button><button class="bs" id="rbHtml">Printable HTML</button><button class="bp" id="rbNote">Save as note</button></div>`,mc=>{
    const byId=Object.fromEntries(all.map(i=>[i.id,i]));
    const selected=()=>{
      const ids=[...mc.querySelectorAll("[data-rc]:checked")].map(cb=>cb.dataset.rc);
      return pvReportOrder(ids.map(id=>byId[id]).filter(Boolean),mc.querySelector("#rbOrder").value);
    };
    const upd=()=>{mc.querySelector("#rbCount").textContent=mc.querySelectorAll("[data-rc]:checked").length+" selected"};
    mc.querySelectorAll("[data-rc]").forEach(cb=>cb.addEventListener("change",upd));
    mc.querySelector("#rbAll").addEventListener("click",()=>{mc.querySelectorAll(".iw-row").forEach(r=>{if(r.style.display!=="none"){const cb=r.querySelector("[data-rc]");if(cb)cb.checked=true}});upd()});
    mc.querySelector("#rbNone").addEventListener("click",()=>{mc.querySelectorAll("[data-rc]").forEach(cb=>cb.checked=false);upd()});
    mc.querySelector("#rbSearch").addEventListener("input",e=>{const q=e.target.value.toLowerCase();mc.querySelectorAll(".iw-row").forEach(r=>{const t=(r.querySelector(".iw-title").textContent||"").toLowerCase(),m=(r.querySelector(".iw-meta").textContent||"").toLowerCase();r.style.display=(t.includes(q)||m.includes(q))?"":"none"})});
    mc.querySelector("#rbX").addEventListener("click",closeModal);
    const title=()=>((mc.querySelector("#rbTitle").value||"").trim()||("Report — "+d));
    const need=fn=>{const items=selected();if(!items.length){flash("Select at least one item");return}fn(items)};
    mc.querySelector("#rbMd").addEventListener("click",()=>need(items=>{chrome.runtime.sendMessage({type:"EXPORT_FILE",data:pvBuildReportMarkdown(title(),items),filename:pvReportFileName(title())+".md",mimeType:"text/markdown"},()=>flash("Report .md downloaded"));closeModal()}));
    mc.querySelector("#rbHtml").addEventListener("click",()=>need(items=>{pvOpenReportHtml(title(),items);closeModal()}));
    mc.querySelector("#rbNote").addEventListener("click",()=>need(items=>{pvSaveReportNote(title(),items);closeModal()}));
  });
}

// ═══════ TRASH ═══════
function purge(){[P,SN,BM,NT,KL,GP,IP].forEach(x=>x.trash=(x.trash||[]).filter(t=>daysSince(t.deletedAt)<TR_D))}
function toTrash(type,id,name,content){const x=dt();x.trash.push({type,id,name,content:deepClone(content),deletedAt:Date.now(),from:st().sel});if(x.trash.length>100)x.trash=x.trash.slice(-100)}
function restTrash(idx){const x=dt(),item=x.trash[idx];if(!item)return;const dest=findFolder(x.folders,item.from)?item.from:rId();if(item.type==="prompt"){const t=findFolder(x.folders,dest);t.prompts=t.prompts||[];t.prompts.push(item.content)}else{const p=findFolder(x.folders,dest);p.children=p.children||[];p.children.push(item.content)}x.trash.splice(idx,1);save();flash("Restored");render()}


// ═══════ UI CORE ═══════
function applyThemeAndBackground(){
  const b=document.body;const m=$("main");if(!b||!m)return;
  const theme=cfg?.theme||"dark";const bg=cfg?.background||"none";const custom=cfg?.backgroundCustom||"";
  b.setAttribute("data-theme",theme);
  m.classList.remove("has-bg");m.style.background="";m.style.backgroundImage="";
  if(bg==="custom"&&custom){
    m.classList.add("has-bg");m.style.backgroundImage=`url(${custom})`;
  }else if(bg&&bg!=="none"){
    const preset=WALLPAPER_PRESETS.find(p=>p.id===bg);
    if(preset?.css){m.classList.add("has-bg");m.style.background=preset.css}
  }
}
function flash(m){const c=$("toastC");if(!c)return;const isSuccess=m.startsWith("OK ");const isBolt=m.startsWith("Injected");
  const tabCls=aTab==="skills"?"toast-sk":aTab==="snippets"?"toast-sn":aTab==="bookmarks"?"toast-bk":aTab==="notes"?"toast-nt":aTab==="customgpts"?"toast-gp":aTab==="imgprompts"?"toast-ip":aTab==="photos"?"toast-ph":"toast-ok";
  const cls=isSuccess||isBolt?tabCls:"";
  c.innerHTML=`<div class="toast ${cls}">${esc(m)}</div>`;clearTimeout(tTmr);tTmr=setTimeout(()=>c.innerHTML="",isSuccess?TOAST_DURATION:TOAST_FADE)}
/**
 * @param {string} h Trusted HTML body (caller must escape user data with esc() / escAttr()).
 * @param {(root:HTMLElement)=>void} [fn]
 */
function showModal(h,fn){const c=$("modalC");if(!c)return;c.innerHTML=`<div class="mo"><div class="md">${h}</div></div>`;c.querySelector(".mo").addEventListener("click",e=>{if(e.target===e.currentTarget)closeModal()});if(fn)fn(c)}
function closeModal(){$("modalC").innerHTML=""}
/** Core context-menu renderer: renders at (x,y), then measures and clamps to the
 *  viewport (the old items.length*24 estimate drifted on long menus in a short panel).
 *  Closes on outside click or Escape. */
function _renderCtxMenu(x,y,items){const c=$("ctxC");
  c.innerHTML=`<div class="ctx" style="left:0;top:0;visibility:hidden">${items.map(i=>i.sep?'<div class="ctx-s"></div>':`<div class="ctx-i ${escAttr(i.cls||"")}" data-a="${escAttr(String(i.a))}">${i.ic||""} ${esc(i.l)}</div>`).join("")}</div>`;
  const m=c.firstElementChild,mw=m.offsetWidth,mh=m.offsetHeight;
  m.style.left=Math.max(4,Math.min(x,document.body.clientWidth-mw-4))+"px";
  m.style.top=Math.max(4,Math.min(y,document.body.clientHeight-mh-4))+"px";
  m.style.visibility="";
  const close=()=>{c.innerHTML="";document.removeEventListener("click",close);document.removeEventListener("contextmenu",close,true);document.removeEventListener("keydown",onKey,true)};
  const onKey=ev=>{if(ev.key==="Escape"){ev.stopPropagation();close()}};
  c.querySelectorAll(".ctx-i").forEach(el=>{el.addEventListener("click",()=>{const it=items.find(i=>String(i.a)===el.dataset.a);close();it?.fn?.()})});
  setTimeout(()=>{document.addEventListener("click",close);document.addEventListener("contextmenu",close,true);document.addEventListener("keydown",onKey,true)},10)}
function showContextMenu(e,items){e.preventDefault();e.stopPropagation();_renderCtxMenu(e.clientX,e.clientY,items)}
/** Open the same menu from a left-clicked anchor element (the ⋯ button) — the
 *  discoverable path to everything right-click offers. */
function showContextMenuAt(el,items){const r=el.getBoundingClientRect();_renderCtxMenu(r.right-190,r.bottom+4,items)}
function showInjectFeedbackBar(promptId){
  const c=$("toastC");if(!c)return;
  c.innerHTML=`<div class="toast" style="display:flex;align-items:center;gap:8px">Did it work? <button class="ib" id="fbUp" title="Yes">&#128077;</button><button class="ib" id="fbDn" title="No">&#128078;</button></div>`;
  const up=$("fbUp"),dn=$("fbDn");
  if(up&&typeof recordInjectFeedback==="function")up.addEventListener("click",()=>{recordInjectFeedback(promptId,1);c.innerHTML="";flash("OK Thanks")});
  if(dn&&typeof recordInjectFeedback==="function")dn.addEventListener("click",()=>{recordInjectFeedback(promptId,0);c.innerHTML="";flash("Noted")});
  setTimeout(()=>{if(c.querySelector(".toast")&&c.querySelector("#fbUp"))c.innerHTML=""},8000);
}
function inject(text,promptId,folderId,platform){
  // Always copy to clipboard first — guaranteed action even if routing fails
  const send=()=>{
    try{
      chrome.runtime.sendMessage({type:"INJECT_PROMPT",text,promptId:promptId||"",folderId:folderId||"",platform:platform||""},r=>{
        if(chrome.runtime.lastError){console.warn("[PV] Inject failed:",chrome.runtime.lastError.message);flash("Copied — Ctrl+V to paste");return}
        if(r?.success){flash("OK Injected!");return}
        if(r?.needsTarget){showInjectTargetPicker(text,promptId,folderId,r);return}
        console.warn("[PV] Inject failed:",r?.error||"unknown");
        flash("Copied — Ctrl+V to paste");
      });
    }catch(e){console.error("[PV] Inject send error:",e);flash("Copied — Ctrl+V to paste")}
  };
  navigator.clipboard.writeText(text).then(send).catch(send);
}
/** "Send to…" picker when the target LLM is ambiguous (no tag, 0 or 2+ LLM tabs open). */
function showInjectTargetPicker(text,promptId,folderId,resp){
  const openTabs=resp?.openTabs||[];
  const cur=resp?.currentTab||null;
  const last=cfg?.lastInjectTarget||"";
  const plats=activePlatforms().filter(p=>p.id!=="other"&&p.urls&&p.urls.length);
  let h=`<h3>Send prompt to&#8230;</h3>`;
  if(openTabs.length){
    h+=`<div class="itp-sec">Open now</div>`;
    openTabs.forEach(t=>{h+=`<div class="fpi itp-opt" data-tab="${escAttr(String(t.tabId))}" data-plat="${escAttr(t.platform)}"><span>${getPlatIcon(t.platform)||S.ai}</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(getPlatName(t.platform)||t.platform)}<span style="color:var(--dm)"> ${S.emdash} ${esc((t.title||"").slice(0,50))}</span></span></div>`});
  }
  if(cur)h+=`<div class="fpi itp-opt" data-tab="${escAttr(String(cur.tabId))}" data-plat=""><span>${S.web}</span><span style="flex:1">This tab<span style="color:var(--dm)"> ${S.emdash} ${esc((cur.title||"").slice(0,50))}</span></span></div>`;
  h+=`<div class="itp-sec">Open new</div>`;
  plats.forEach(p=>{h+=`<div class="fpi itp-opt${p.id===last?" sel":""}" data-open="${escAttr(p.id)}" data-plat="${escAttr(p.id)}"><span>${p.icon}</span><span style="flex:1">${esc(p.name)}</span>${p.id===last?'<span style="font-size:8px;color:var(--dm)">last used</span>':""}</div>`});
  h+=`<div class="brow"><button class="bg-btn" id="itpX">Cancel</button></div>`;
  showModal(h,mc=>{
    mc.querySelector("#itpX").addEventListener("click",closeModal);
    mc.querySelectorAll(".itp-opt").forEach(el=>{el.addEventListener("click",()=>{
      const plat=el.dataset.plat||"";
      if(plat&&cfg){cfg.lastInjectTarget=plat;save()}
      const msg=el.dataset.open
        ?{type:"INJECT_TO",platformId:el.dataset.open,text,promptId:promptId||"",folderId:folderId||""}
        :{type:"INJECT_TO",tabId:+el.dataset.tab,text,promptId:promptId||"",folderId:folderId||""};
      closeModal();
      flash(el.dataset.open?"Opening "+(getPlatName(plat)||plat).split("/")[0].trim()+"…":"Injecting…");
      try{chrome.runtime.sendMessage(msg,r=>{
        if(chrome.runtime.lastError||!r?.success)flash("Copied — Ctrl+V to paste");
        else flash("OK Injected!");
      })}catch{flash("Copied — Ctrl+V to paste")}
    })});
  });
}
function openUrl(url){const u=safeUrl(url);if(!u){flash("Blocked unsafe link");return}chrome.runtime.sendMessage({type:"OPEN_URL",url:u})}
function openUrlWindow(url){const u=safeUrl(url);if(!u){flash("Blocked unsafe link");return}chrome.runtime.sendMessage({type:"OPEN_URL_WINDOW",url:u})}
function createBookmarkFromUrl(url){
  if(!isB())return null;
  try{new URL(url)}catch{return null}
  pushUndo();const d=dt(),s2=st(),f=findFolder(d.folders,s2.sel)||d.folders;
  const id=generateId(d);
  const title=domain(url);
  const bm={id,title,content:"",url,tags:[],created:Date.now(),modified:Date.now(),favorited:false,usageCount:0,versions:[]};
  f.prompts=f.prompts||[];f.prompts.push(bm);
  save();render();flash("Bookmark created: "+title);
  return bm;
}
function openFullView(mode){
  const page=mode==="prompts"?"fullview-prompts.html":mode==="imgprompts"?"fullview-prompts.html?tab=imgprompts":mode==="skills"?"fullview-clips.html?tab=skills":mode==="clips"?"fullview-clips.html":mode==="notes"?"fullview-clips.html?tab=notes":mode==="bookmarks"?"fullview.html":mode==="customgpts"?"fullview.html?store=customgpts":mode==="gpt-cards"?"fullview.html?store=customgpts&focus="+encodeURIComponent(gSt.sel):mode==="bk-cards"?"fullview.html?focus="+encodeURIComponent(bSt.sel):mode==="photos"?"sidepanel.html?tab=photos":mode==="lists"?"fullview-lists.html":"fullview.html";
  console.log(`[PV] openFullView: mode=${mode} → page=${page} | activeTab=${aTab}`);
  try{chrome.windows.create({url:chrome.runtime.getURL(page),type:"popup",width:1100,height:750})}
  catch(e){chrome.runtime.sendMessage({type:"OPEN_FULLVIEW",page})}
}

// ═══════ CLIPBOARD PASTE WITH FORMATTING ═══════
function htmlToFormattedText(html){
  const doc=new DOMParser().parseFromString(html,"text/html");const body=doc.body;
  // Pre-process: convert block elements to structured text
  function walk(node){
    if(node.nodeType===3)return node.textContent;
    if(node.nodeType!==1)return"";
    const tag=node.tagName.toLowerCase();
    // Skip invisible elements
    if(tag==="script"||tag==="style"||tag==="head")return"";
    const kids=[...node.childNodes].map(walk).join("");
    // Block elements get newlines
    if(tag==="br")return"\n";
    if(tag==="p"||tag==="div")return"\n\n"+kids.trim()+"\n";
    if(tag==="h1"||tag==="h2"||tag==="h3"||tag==="h4"||tag==="h5"||tag==="h6")return"\n\n"+kids.trim()+"\n";
    if(tag==="li")return"\n• "+kids.trim();
    if(tag==="ul"||tag==="ol")return"\n"+kids+"\n";
    if(tag==="tr")return kids.trim()+"\n";
    if(tag==="td"||tag==="th")return kids.trim()+"\t";
    if(tag==="blockquote")return"\n> "+kids.trim().replace(/\n/g,"\n> ")+"\n";
    // Pre/code: preserve whitespace exactly
    if(tag==="pre")return"\n```\n"+node.textContent+"\n```\n";
    if(tag==="code"&&node.parentElement?.tagName!=="PRE")return"`"+kids+"`";
    // Inline formatting → markdown
    if(tag==="strong"||tag==="b")return"**"+kids+"**";
    if(tag==="em"||tag==="i")return"*"+kids+"*";
    return kids;
  }
  let text=walk(body);
  // Clean up excessive whitespace while preserving intentional structure
  text=text.replace(/^\n+/,"").replace(/\n{4,}/g,"\n\n\n").replace(/[ \t]+$/gm,"").replace(/\n +\n/g,"\n\n");
  return text.trim();
}

async function clipFromClipboard(){
  try{
    // Read active tab context FIRST (URL, title, platform)
    let tabUrl="",tabTitle="";
    try{
      const tab=await new Promise(r=>{chrome.runtime.sendMessage({type:"GET_ACTIVE_TAB"},r)});
      tabUrl=tab?.url||"";tabTitle=tab?.title||"";
    }catch{}
    // Try to read HTML from clipboard (preserves formatting)
    let text="";let gotHtml=false;
    try{
      const items=await navigator.clipboard.read();
      for(const item of items){
        if(item.types.includes("text/html")){
          const blob=await item.getType("text/html");
          const html=await blob.text();
          text=htmlToFormattedText(html);
          gotHtml=true;
          break;
        }
      }
    }catch(e){/* clipboard.read() may be blocked — fall through to readText */}
    // Fallback: plain text (still preserves line breaks)
    if(!gotHtml){
      text=await navigator.clipboard.readText();
    }
    if(!text||!text.trim()){flash("Clipboard is empty");return}
    showCapture("snippet",text,tabUrl,tabTitle);
  }catch(e){
    flash("Cannot read clipboard — try Ctrl+V in a new clip");
  }
}

// ── Cloud status dot in header ──
function updateCloudDot(){
  const dot=$("cloudDot");if(!dot)return;
  if(Cloud._syncing||Cloud._archiving)dot.className="cloud-dot sync";
  else if(Cloud._connected)dot.className="cloud-dot on";
  else dot.className="cloud-dot off";
}


// ═══════ CAPTURE OVERLAY ═══════
function buildCaptureProvenance(type,url,pageTitle,linkedPromptId,now){let host="";try{host=new URL(url).hostname}catch{/* Non-URL captures retain an empty source domain. */}return{sourceUrl:url||"",sourceTitle:pageTitle||"",sourceDomain:host,capturedAt:now||Date.now(),captureMethod:"reviewed-capture",contentType:type||"",platform:detectPlatform(url)||"",linkedPromptId:linkedPromptId||""}}
function showCapture(type,text,url,pageTitle,description,linkedPromptId){
  const m=$("main"),isSnip=type==="snippet",isSkill=type==="skill",isBm=type==="bookmark",isGpt=type==="customgpt",isNote=type==="note",isChat=type==="chat";
  // Auto-title: skills try YAML name/first heading, snippets use first line, bookmarks use page title
  let autoT="Untitled";
  if(isSkill){
    const nm=(text||"").match(/^name:\s*(.+)$/m);const hd=(text||"").match(/^#\s+(.+)$/m);
    autoT=nm?nm[1].trim():hd?hd[1].trim():(text||"").slice(0,60).split("\n")[0]||"Untitled Skill";
  }else if(isSnip||isNote){autoT=(text||"").slice(0,60).split("\n")[0]||"Untitled"}
  else{autoT=pageTitle||domain(url)||"Untitled"}
  // Auto-description for skills from YAML frontmatter
  let autoDesc="";
  if(isSkill){const dm=(text||"").match(/^description:\s*(.+)$/m);if(dm)autoDesc=dm[1].trim().replace(/^["']|["']$/g,"")}
  const detectedPlat=detectPlatform(url);
  const targetData=isSkill?KL:isSnip?SN:isNote?NT:isGpt?GP:BM;const targetSt=isSkill?kSt:isSnip?sSt:isNote?nSt:isGpt?gSt:bSt;
  let cSel=targetSt.sel,cExp={...targetSt.exp};
  document.querySelector(".snap")?.remove();
  const div=document.createElement("div");div.className="snap";
  const cls=isSkill?"s-sk":isSnip?"s-sn":isNote?"s-nt":"s-bk";
  const now=new Date();const nowStr=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,16);
  const platOpts=activePlatforms().map(p=>`<option value="${p.id}" ${p.id===detectedPlat?'selected':''}>${p.icon} ${p.name}</option>`).join("");
  const treePrefix=isSkill?"k":isSnip?"s":isNote?"n":isGpt?"g":isChat?"ch":"b";
  const btnCls=isSkill?" bp-k":isSnip?" bp-s":isNote?" bp-n":isGpt?" bp-g":" bp-b";
  const folderBtnCls=isSkill?"sk":isSnip?"sn":isNote?"nt":isGpt?"gp":"bk";

  // Clean AI platform suffixes from page title to get conversation name
  let convTitle=pageTitle||"";
  if(detectedPlat&&convTitle){
    const suffixes=[" - Claude"," - ChatGPT"," | ChatGPT"," - Gemini"," - Google AI"," - Grok"," | Grok"," - Perplexity"," | Perplexity"," - Mistral"," - DeepSeek"," - Copilot"," - Poe"," - Meta AI"," - HuggingChat"," - Coral"];
    for(const s of suffixes){if(convTitle.endsWith(s)){convTitle=convTitle.slice(0,-s.length);break}}
  }

  let formFields="";
  if(isSkill){
    formFields=`<textarea id="capSkDesc" placeholder="Description (what this skill does)..." style="width:100%;min-height:36px;max-height:60px;background:var(--inp);border:1px solid var(--bl);border-radius:4px;padding:4px 7px;color:var(--sk);font-size:10px;outline:none;resize:vertical;margin-bottom:4px;font-family:inherit">${esc(autoDesc)}</textarea>`;
  }else if(isSnip){
    formFields=`<input type="text" id="capSrc" value="${esc(convTitle)}" placeholder="${detectedPlat?'Conversation name...':'Source / where did this come from?'}" style="color:var(--sn);font-size:10px">
    <div class="snap-row">
      <select id="capPlat" style="flex:1">${platOpts}</select>
      <input type="datetime-local" id="capDT" value="${nowStr}" style="flex:1;background:var(--inp);border:1px solid var(--bl);border-radius:4px;padding:3px 6px;color:var(--tx);font-size:10px;outline:none">
    </div>`;
  }else{
    formFields=`<input type="text" id="capUrl" value="${esc(url||"")}" placeholder="URL..." style="color:var(--bk)">
    <textarea id="capDesc" placeholder="Description / notes..." style="width:100%;min-height:36px;max-height:60px;background:var(--inp);border:1px solid var(--bl);border-radius:4px;padding:4px 7px;color:var(--mu);font-size:10px;outline:none;resize:vertical;margin-bottom:4px;font-family:inherit">${esc(description||"")}</textarea>`;
  }

  div.innerHTML=`<div class="snap-hdr ${cls}">${isSkill?S.wrench+" Save as Skill":isSnip?S.clip+" Review & Save Snippet":isGpt?S.ai+" Review & Save Custom GPT":isChat?S.ai+" Review & Save Chat":S.pin+" Review & Save Bookmark"}</div>
    ${text?`<div style="font-size:8px;color:var(--dm);margin-bottom:3px">EXACT CONTENT TO STORE · ${(text||"").length} characters</div><textarea id="capBody" style="width:100%;min-height:86px;max-height:180px;background:var(--inp);border:1px solid var(--bl);border-radius:5px;padding:6px;color:var(--tx);font:10px/1.45 var(--mono);resize:vertical;margin-bottom:5px">${esc(text||"")}</textarea>`:''}
    ${url?`<div class="snap-src" style="display:flex;align-items:center;gap:4px">${favicon(url)} <span>${esc(pageTitle||url)}</span></div><div style="font-size:8px;color:var(--dm);word-break:break-all;margin:-2px 0 5px">${esc(url)}</div>`:''}
    <input type="text" id="capTi" value="${esc(autoT)}" placeholder="Title...">
    <input type="text" id="capTg" placeholder="Tags (comma separated)...">
    ${formFields}
    <div style="font-size:9px;color:var(--dm);margin-bottom:3px;font-weight:600">SAVE TO:</div>
    <div class="snap-tree" id="capTree"></div>
    <div class="snap-nf"><input type="text" id="capNF" placeholder="New folder..."><button class="bs ${folderBtnCls}" id="capAF">${I.plus}</button></div>
    <div class="snap-btns"><button class="bg-btn" id="capX">Cancel</button><button class="bp${btnCls}" id="capOK">Save</button></div>`;
  m.appendChild(div);

  function rTree(){
    $("capTree").innerHTML=rtN(targetData.folders,0,cSel,cExp,treePrefix);
    $("capTree").querySelectorAll(".tr").forEach(r=>{r.addEventListener("click",()=>{
      cSel=r.dataset.id;const n=findFolder(targetData.folders,cSel);if(n&&(n.children||[]).length)cExp[cSel]=!cExp[cSel];rTree()})});
  }
  rTree();
  $("capAF").addEventListener("click",()=>{const nm=$("capNF").value.trim();if(!nm)return;
    const par=findFolder(targetData.folders,cSel);if(!par||getDepth(par,targetData.folders)>=MAX_D-1){flash("Max depth");return}
    pushUndo();const id=generateId(targetData);par.children=par.children||[];par.children.push({id,name:nm,children:[],prompts:[],color:""});
    cExp[cSel]=1;cSel=id;cExp[id]=1;save();rTree();$("capNF").value=""});
  $("capX").addEventListener("click",()=>div.remove());
  $("capOK").addEventListener("click",()=>{
    const ti=$("capTi").value.trim()||"Untitled",tg=$("capTg").value.split(",").map(x=>x.trim()).filter(Boolean);
    const reviewedText=$("capBody")?.value??text;
    // Duplicate URL check for link silos only
    if(isBm||isGpt||isChat){
      const checkUrl=$("capUrl")?.value||url||"";
      const dup=findDuplicateUrl(checkUrl,targetData);
      if(dup){showModal(`<h3>Duplicate Found</h3><p>"${esc(dup.title)}" already exists in ${esc(dup.folderName||'your bookmarks')}.</p><div class="brow"><button class="bg-btn" id="dupX">Cancel</button><button class="bp" id="dupY">Save Anyway</button></div>`,mc=>{
        mc.querySelector("#dupX").addEventListener("click",closeModal);
        mc.querySelector("#dupY").addEventListener("click",()=>{closeModal();doCapSave(targetData,cSel,type,ti,tg,reviewedText,url,pageTitle,div,targetSt,linkedPromptId)})});return}
    }
    // Similar content check for snippets
    if(isSnip&&(reviewedText||"").trim().length>20){
      const similar=findSimilarPrompts((ti+" "+(reviewedText||"")).trim(),targetData,null,0.85);
      if(similar.length){const list=similar.map(s=>`<div class="fpi" data-id="${s.id}" style="padding:4px 0;cursor:pointer;border-bottom:1px solid var(--bl)">${esc(s.title)} · ${Math.round((s.similarity||0)*100)}%</div>`).join("");showModal(`<h3>Similar clip found</h3><p>You may already have something similar:</p><div style="max-height:120px;overflow-y:auto">${list}</div><div class="brow" style="margin-top:8px"><button class="bg-btn" id="simX">Cancel</button><button class="bp" id="simY">Save Anyway</button></div>`,mc=>{
        mc.querySelector("#simX").addEventListener("click",closeModal);
        mc.querySelector("#simY").addEventListener("click",()=>{closeModal();doCapSave(targetData,cSel,type,ti,tg,reviewedText,url,pageTitle,div,targetSt,linkedPromptId)});
        mc.querySelectorAll(".fpi").forEach(el=>{el.addEventListener("click",()=>{const it=similar.find(s=>s.id===el.dataset.id);if(it){closeModal();targetSt.sel=it.folderId||cSel;targetSt.eId=it.id;targetSt.view="edit";aTab="snippets";div.remove();render()}})})});return}
    }
    doCapSave(targetData,cSel,type,ti,tg,reviewedText,url,pageTitle,div,targetSt,linkedPromptId)});
  $("capTi").focus();$("capTi").select();
}

// ── Capture save (extracted for duplicate check flow) ──
function doCapSave(targetData,cSel,type,ti,tg,text,url,pageTitle,div,targetSt,linkedPromptId){
  const isSnip=type==="snippet",isSkill=type==="skill",isGpt=type==="customgpt",isChat=type==="chat";
  pushUndo();const f=findFolder(targetData.folders,cSel);if(!f)return;f.prompts=f.prompts||[];
  const item=buildItem(targetData,ti,text,tg);
  item._lastModifiedBy={deviceId:meta?.deviceId||"",deviceName:meta?.deviceName||"",timestamp:Date.now()};
  item.provenance=buildCaptureProvenance(type,url,pageTitle,linkedPromptId);
  if(isSkill){
    item.description=$("capSkDesc")?.value||"";
    item.files={};
    item.sourceUrl=url||"";item.sourceTitle=pageTitle||"";
  }else if(isSnip){
    item.sourceUrl=url||"";
    item.sourceTitle=$("capSrc")?.value||pageTitle||"";
    item.platform=$("capPlat")?.value||"";
    item.sourceType=item.platform?"ai":"web";
    const dtVal=$("capDT")?.value;item.capturedAt=dtVal?new Date(dtVal).getTime():Date.now();
    item.linkedPromptId=linkedPromptId||"";
  }else{item.url=$("capUrl")?.value||url||"";item.content=$("capDesc")?.value||"";if(isChat)item.platform=detectPlatform(item.url)}
  f.prompts.push(item);save();
  if(type==="bookmark"&&item.url){try{chrome.runtime.sendMessage({type:"BM_SYNC_PUSH",item})}catch{/* Bookmark sync is best-effort. */}}
  flash(isSkill?"OK Skill saved":isSnip?"OK Clip saved":isGpt?"OK Custom GPT saved":isChat?"OK Chat saved":"OK Bookmark saved");div.remove();
  aTab=isSkill?"skills":isSnip?"snippets":isGpt?"customgpts":isChat?"chats":"bookmarks";targetSt.sel=cSel;targetSt.view="list";render();updTabs()}

// ═══════ SETTINGS PANEL ═══════
const PRIVACY_PERMS=[
  {perm:"storage",why:"Stores all vault data locally in Chrome. No cloud unless you opt in."},
  {perm:"unlimitedStorage",why:"Vault can exceed Chrome's default 10MB. No size cap."},
  {perm:"sidePanel",why:"The side panel is the primary UI. No popup clutter."},
  {perm:"activeTab",why:"Injects prompts into the active page's text input when you click."},
  {perm:"scripting",why:"Content script for inject and capture. Runs only on pages you visit."},
  {perm:"downloads",why:"Exports (backup files, digests, CSV). You choose when."},
  {perm:"contextMenus",why:"Right-click save/inject menus built from your folder structure."},
  {perm:"tabs",why:"Reads the active tab URL for platform detection. No history access."},
  {perm:"alarms",why:"Scheduled backup reminders. Local only."},
  {perm:"bookmarks",why:"Chrome bookmark import and sync. User-initiated."},
  {perm:"identity",why:"Google Drive OAuth. Only if you enable cloud backup."},
  {perm:"favicon",why:"Site icons from Chrome's local favicon cache. Zero network requests."},
  {perm:"nativeMessaging",why:"PV bridge: local AI agents (MCP) can read/add vault items. Dormant unless you install the PV host."}
];

// Toolbar + Settings: pull latest Drive backup into local vault (safeRestore + restoreVault).
async function runRestoreLatestFromDrive(){
  try{
    const r=await Cloud.safeRestore(null);
    if(!r){flash("No backup found on Drive");return}
    if(!restoreVault(r.data,{source:"drive-restore-latest"})){flash("Restore blocked — invalid backup");return}
    flash("OK Restored from Drive ("+r.name+")");
    aTab="prompts";
    render();
    if(typeof updateCloudDot==="function")updateCloudDot();
  }catch(e){flash("Restore failed: "+e.message)}
}

/**
 * @param {{forceConfirm?:boolean}} [opts] If forceConfirm, always show the confirm modal (even when vault is empty).
 */
function openRestoreLatestFromDriveModal(opts){
  opts=opts||{};
  const localCounts=Cloud.itemCounts();
  const skipModal=localCounts.total===0&&!opts.forceConfirm;
  if(skipModal){
    flash("Restoring vault from Drive...");
    void runRestoreLatestFromDrive();
    return;
  }
  const hasLocalChanges=meta.sc>(meta.lbs||0);
  const conflictWarn=hasLocalChanges?`<p style="font-size:11px;color:var(--dn);background:var(--inp);padding:8px;border-radius:4px;margin:8px 0">⚠ You have local changes since your last backup. Restoring will replace them.</p>`:"";
  showModal(`<h3>Restore Latest from Drive</h3>
    <p>This will replace your local data with the most recent backup.</p>
    ${conflictWarn}
    <p style="font-size:10px;color:var(--gn)">OK Your current data (${localCounts.total} items) will be saved as a safety copy on Drive first.</p>
    <p style="font-size:10px;color:var(--dm)">For a specific version, use "Browse Backups" instead.</p>
    <div class="brow"><button class="bg-btn" id="grX">${hasLocalChanges?"Keep local":"Cancel"}</button><button class="bp" id="grY">Use Drive backup</button></div>`,mc=>{
    mc.querySelector("#grX").addEventListener("click",closeModal);
    mc.querySelector("#grY").addEventListener("click",()=>{
      closeModal();
      flash("Saving safety copy & restoring...");
      void runRestoreLatestFromDrive();
    });
  });
}

function normalizeImprovementNotes(){
  if(Array.isArray(meta.improvementNotes))return meta.improvementNotes;
  const legacy=typeof meta.devNotes==="string"?meta.devNotes:"";
  meta.improvementNotes=legacy.split(/\r?\n+/).map(s=>s.replace(/^\s*(?:[-*•]|\d+[.)]|\[[ xX]\])\s*/,"").trim()).filter(Boolean).map((text,i)=>({
    id:"imp_"+Date.now().toString(36)+"_"+i,
    text,
    created:Date.now(),
    modified:Date.now()
  }));
  delete meta.devNotes;
  chrome.storage.local.set({[MK]:meta});
  return meta.improvementNotes;
}
function saveImprovementNotes(){chrome.storage.local.set({[MK]:meta})}
const PV_CLAUDE_SKILLS_URL="https://claude.com/skills";
function openOfficialClaudeSkills(){openUrl(PV_CLAUDE_SKILLS_URL)}

function renderSettings(){
  const m=$("main");
  if(!cfg.disabledPlatforms)cfg.disabledPlatforms=[];
  let h=`<div class="settings"><h2>${S.gear} Settings</h2>`;

  // ═══════════════════════════════════════════════════════════════
  // TRUST & PRIVACY — collapsed by default; facts, not marketing.
  // Prompt Vault does not collect, transmit, or share any user data.
  // Optional response capture observes recognized AI response DOM only
  // when enabled. All content stays in Chrome local storage unless the
  // user connects Google Drive for their own backups.
  // ═══════════════════════════════════════════════════════════════
  h+=`<div class="sec trust-dashboard"><details class="trust-details">
    <summary class="sec-title" style="cursor:pointer">🛡 Privacy &amp; trust — local-only, no telemetry, no tracking</summary>
    <div class="trust-grid">
      <div class="trust-card">
        <div class="trust-card-h">What we store</div>
        <ul class="trust-list">
          <li>Prompts, clips, snippets, bookmarks, notes, skills, custom GPTs</li>
          <li>Folder structure, tags, metadata</li>
          <li>Settings and preferences</li>
        </ul>
        <div class="trust-foot">All in Chrome local storage. On your machine.</div>
      </div>
      <div class="trust-card">
        <div class="trust-card-h">What we never do</div>
        <ul class="trust-list">
          <li>No analytics. No telemetry. No usage tracking.</li>
          <li>No phone home. No external servers (except your own Drive).</li>
          <li>No selling, sharing, or transmitting your content.</li>
        </ul>
      </div>
    </div>
    <div class="trust-where">
      <div class="trust-card-h">Where your data lives</div>
      <div class="trust-row"><span class="trust-dot" style="background:var(--gn)"></span><strong>Local:</strong> Chrome storage on this device. Only you have access.</div>
      <div class="trust-row"><span class="trust-dot" style="background:var(--ac)"></span><strong>Drive (optional):</strong> Your Google Drive. Only if you connect. We never see your Drive outside your backup folder.</div>
    </div>
    <details class="trust-details">
      <summary>Content script (all pages)</summary>
      <div class="trust-perms">
        <p style="margin:0 0 6px;font-size:10px;color:var(--mu);line-height:1.5">Runs on all pages because: prompt injection targets any AI chat, clip/bookmark capture works anywhere, response capture listens on AI platforms.</p>
        <p style="margin:0;font-size:10px;color:var(--gn);font-weight:500;line-height:1.5">It does not send page content externally. Most reads follow an explicit action; optional response capture observes recognized AI response DOM while enabled.</p>
      </div>
    </details>
    <details class="trust-details">
      <summary>Why each permission?</summary>
      <div class="trust-perms">
        ${PRIVACY_PERMS.map(p=>`<div class="trust-perm-row"><code>${esc(p.perm)}</code><span>${esc(p.why)}</span></div>`).join("")}
      </div>
    </details>
    <details class="trust-details">
      <summary>Network requests</summary>
      <div class="trust-perms">
        <div class="trust-perm-row"><code>Google Drive API</code><span>Only when you enable Drive backup. Requires OAuth consent.</span></div>
        <div class="trust-perm-row"><code>Site icons</code><span>Served by Chrome's local favicon cache (the "favicon" permission). No favicon request ever leaves your device.</span></div>
        <div class="trust-perm-row"><code>URL health checks</code><span>HEAD/GET to bookmarked URLs. User-initiated from health checker.</span></div>
      </div>
    </details>
    <div class="setting-row" style="margin-top:10px"><label>Hide site icons <span style="color:var(--dm)">(icons come from Chrome's local cache — nothing is fetched from the web either way)</span></label><label class="toggle"><input type="checkbox" id="faviconsDisabledTog" ${cfg.faviconsDisabled?'checked':''}><span class="slider"></span></label></div>
    <div class="setting-row" style="margin-top:6px"><label>PV bridge <span style="color:var(--dm)">(lets local AI agents — Claude Code, Codex, ChatGPT via MCP — search and add to this vault; requires the PV host from docs/PV.md; localhost only)</span></label><label class="toggle"><input type="checkbox" id="pvBridgeTog" ${cfg.pvBridgeEnabled!==false?'checked':''}><span class="slider"></span></label></div>
    <button class="bs" id="trustReviewBtn" style="margin-top:8px">Review trust setup</button>
  </details></div>`;

  // ── Improvement notes — structured bullets with migration from the legacy paragraph ──
  const improvementNotes=normalizeImprovementNotes();
  h+=`<div class="sec"><div class="sec-title">📌 Improvement notes</div>
    <div id="improvementNotesList">${improvementNotes.map(n=>`<div class="setting-row" data-imp-row="${escAttr(n.id)}" style="gap:6px;margin-bottom:5px"><span style="color:var(--tab-ac);font-size:14px;line-height:1">•</span><input type="text" data-imp-text="${escAttr(n.id)}" value="${escAttr(n.text||"")}" aria-label="Improvement note" style="flex:1;min-width:0"><button class="ib dng" data-imp-del="${escAttr(n.id)}" title="Delete note">${I.trash}</button></div>`).join("")||`<div style="font-size:10px;color:var(--dm);margin-bottom:6px">No improvement notes yet.</div>`}</div>
    <div style="display:flex;gap:4px"><input type="text" id="improvementNoteNew" placeholder="Add an improvement note…" style="flex:1;min-width:0"><button class="bs" id="improvementNoteAdd">+ Add</button></div>
    <div style="font-size:9px;color:var(--dm);margin-top:4px">Each bullet is saved locally and can be edited or removed independently.</div>
  </div>`;

  // ── Appearance: Theme & Background ──
  const theme=cfg.theme||"dark";const bg=cfg.background||"none";
  h+=`<div class="sec"><div class="sec-title">Appearance</div>`;
  h+=`<div class="setting-row" style="margin-bottom:10px"><label>Theme</label><select id="themeSel" style="background:var(--inp);border:1px solid var(--bl);border-radius:4px;padding:4px 8px;color:var(--tx);font-size:11px"><option value="dark" ${theme==="dark"?"selected":""}>Dark</option><option value="light" ${theme==="light"?"selected":""}>Light</option></select></div>`;
  h+=`<div style="font-size:10px;color:var(--dm);margin-bottom:8px">Background (shows behind your content)</div>`;
  h+=`<div class="wp-grid">`;
  WALLPAPER_PRESETS.forEach(p=>{
    const sel=bg===p.id||(p.id==="none"&&!bg);
    h+=`<div class="wp-swatch ${sel?"wp-sel":""}" data-wp="${esc(p.id)}" title="${esc(p.name)}" style="${p.css?`background:${p.css}`:""}">${p.id==="none"?"-":""}</div>`;
  });
  h+=`</div>`;
  h+=`<div style="margin-top:8px;display:flex;align-items:center;gap:8px"><input type="file" id="wpUpload" accept="image/*" style="display:none"><button class="bs" id="wpUploadBtn">Upload your photo</button>${bg==="custom"&&cfg.backgroundCustom?`<button class="bs dng" id="wpClearBtn">Remove custom</button>`:""}</div>`;
  h+=`</div>`;

  // ── Vault Lock & Capture Controls ──
  const lockOn=!!cfg.vaultLockEnabled;
  const hasPasscode=!!cfg.vaultLockHash;
  const capOn=cfg.captureEnabled===true;
  const blockedDomains=(cfg.captureBlockedDomains||[]).join("\n");
  const allowedDomains=(cfg.captureAllowedDomains||[]).join("\n");
  h+=`<div class="sec"><div class="sec-title">Vault Privacy Screen</div>`;
  h+=`<p style="font-size:10px;color:var(--dm);line-height:1.45;margin:0 0 8px">This hides the side-panel UI from casual viewing. It does not encrypt vault data or protect it from other extension processes.</p>`;
  h+=`<div class="setting-row" style="margin-bottom:8px"><label>Lock vault on open</label><label class="toggle"><input type="checkbox" id="lockVaultTog" ${lockOn?'checked':''} ${!hasPasscode?'disabled':''}><span class="slider"></span></label></div>`;
  h+=`<div style="font-size:10px;color:var(--dm);margin-bottom:6px">Requires a passcode. When enabled, the vault shows a lock screen until you enter it.</div>`;
  h+=`<div style="display:flex;gap:4px;margin-bottom:8px">`;
  h+=hasPasscode?`<button class="bs" id="lockChangeBtn">Change passcode</button><button class="bs dng" id="lockRemoveBtn">Remove passcode</button><button class="bs" id="lockNowBtn">Lock now</button>`:`<button class="bp" id="lockSetBtn">Set passcode</button>`;
  h+=`</div></div>`;

  h+=`<div class="sec"><div class="sec-title">Capture Scope</div>`;
  h+=`<div style="font-size:10px;color:var(--mu);margin-bottom:8px">Control where response capture (save buttons on AI responses) appears.</div>`;
  h+=`<div class="setting-row" style="margin-bottom:8px"><label>Response capture (reads AI response DOM when enabled)</label><label class="toggle"><input type="checkbox" id="captureTog" ${capOn?'checked':''}><span class="slider"></span></label></div>`;
  h+=`<div style="font-size:10px;color:var(--dm);margin-bottom:4px">Only capture on these domains (leave empty = all except blocked):</div>`;
  h+=`<textarea id="captureAllowedDomains" rows="2" placeholder="claude.ai&#10;chatgpt.com&#10;(empty = everywhere except blocked)" style="width:100%;resize:vertical;font-size:11px;font-family:monospace;padding:6px;border-radius:4px;border:1px solid var(--bl);background:var(--inp);color:var(--tx);margin-bottom:8px">${esc(allowedDomains)}</textarea>`;
  h+=`<div style="font-size:10px;color:var(--dm);margin-bottom:4px">Block capture on these domains (one per line, e.g. bank.com or *.sensitive.com):</div>`;
  h+=`<textarea id="captureBlockedDomains" rows="3" placeholder="example.com&#10;*.internal.com" style="width:100%;resize:vertical;font-size:11px;font-family:monospace;padding:6px;border-radius:4px;border:1px solid var(--bl);background:var(--inp);color:var(--tx)">${esc(blockedDomains)}</textarea>`;
  h+=`</div>`;

  // ── Cloud Sync (provider abstraction: Google Drive, Dropbox, OneDrive, Custom) ──
  const cloudProv=cfg.cloudProvider||"google-drive";
  const provName=CLOUD_PROVIDER_NAMES[cloudProv]||"Google Drive";
  const counts=Cloud.itemCounts();
  h+=`<div class="sec"><div class="sec-title" style="display:flex;justify-content:space-between;align-items:center">Cloud Sync<span style="font-size:9px;color:${Cloud._connected?'var(--gn)':'var(--dm)'}">${Cloud._connected?'&#9679; Connected':'&#9675; Not connected'}</span></div>`;
  h+=`<div class="setting-row" style="margin-bottom:8px"><label>Cloud provider</label><select id="cloudProviderSel" style="background:var(--inp);border:1px solid var(--bl);border-radius:4px;padding:4px 8px;color:var(--tx);font-size:11px">`;
  (typeof SUPPORTED_CLOUD_PROVIDERS!=="undefined"?SUPPORTED_CLOUD_PROVIDERS:["google-drive"]).forEach(id=>{
    h+=`<option value="${id}" ${cloudProv===id?"selected":""}>${CLOUD_PROVIDER_NAMES[id]||id}</option>`});
  h+=`</select></div>`;
  h+=`<div style="font-size:9px;color:var(--dm);margin-bottom:8px">Toolbar cloud: restore latest backup. Shift+click cloud: backup now. If latest on Drive is wrong, use <strong>Browse Backups</strong> for dated copies.</div>`;
  if(!Cloud._connected){
    h+=`<div style="font-size:10px;color:var(--mu);margin-bottom:6px">${cloudProv==="google-drive"?"Auto-sync your vault to Google Drive. Backups are silent and automatic — 2 minutes after any change. Keeps 14 daily + 4 weekly versions.":"Connect to enable backups."}</div>`;
    h+=`<button class="bp" id="gdConnBtn" style="width:100%">Connect ${provName}</button>`;
    if(!cfg.driveConnected&&!meta.gdDismissed){
      h+=`<button class="bg-btn" id="gdSkipBtn" style="width:100%;margin-top:4px;font-size:9px">Skip for now</button>`;
    }
  }else{
    const syncTxt=Cloud.statusText();
    // Data loss warning banner
    if(Cloud._paused){
      h+=`<div class="gd-warn"><div class="gd-warn-title">⚠ Auto-sync paused</div>`;
      h+=`<div class="gd-warn-body">${esc(Cloud._error||'Significant data reduction detected.')}</div>`;
      h+=`<div style="font-size:9px;color:var(--dm);margin:4px 0">Your local data: ${counts.total} items. Last sync had: ${meta.gdLastCounts?.total||'?'} items.</div>`;
      h+=`<div style="display:flex;gap:4px;margin-top:4px"><button class="bs" id="gdForceBtn">Push Anyway</button><button class="bs" id="gdDismissWarn">Dismiss</button></div>`;
      h+=`</div>`;
    }
    h+=`<div style="font-size:10px;color:var(--mu);margin-bottom:6px">${syncTxt}${Cloud._error&&!Cloud._paused?' — <span style="color:var(--dn)">'+esc(Cloud._error)+'</span>':''}</div>`;
    const cloudPullOn=!!cfg.cloudPullOnStartup;
    h+=`<div class="setting-row" style="margin-bottom:6px"><label style="flex:1">Pull from cloud on startup</label><label class="toggle"><input type="checkbox" id="cloudPullTog" ${cloudPullOn?'checked':''}><span class="slider"></span></label></div>`;
    h+=`<div style="font-size:9px;color:var(--dm);margin-bottom:6px"><strong>Authority:</strong> Local vault is always primary. This option only runs when your <strong>local vault is empty</strong> (new install / wiped) — then the latest Drive backup is loaded. It does <strong>not</strong> merge or overwrite an existing vault on open. Use Restore / Backup buttons to move data intentionally.</div>`;
    h+=`<div style="font-size:9px;color:var(--dm);margin-bottom:6px">Current vault: ${counts.prompts}p · ${counts.imgprompts||0}i · ${counts.snippets}s · ${counts.bookmarks}b · ${counts.notes}n · ${counts.skills}sk · ${counts.customgpts}g (${counts.total} total)</div>`;
    h+=`<div style="display:flex;gap:4px;flex-wrap:wrap">`;
    h+=`<button class="bs" id="gdSyncBtn" ${Cloud._syncing?'disabled':''}>${Cloud._syncing?'Backing up...':'Backup to Drive'}</button>`;
    h+=`<button class="bs" id="gdBrowseBtn">Browse Backups</button>`;
    h+=`<button class="bs" id="gdRestoreBtn">Restore Latest</button>`;
    h+=`<button class="bs dng" id="gdDiscBtn">Disconnect</button>`;
    h+=`</div>`;
  }
  h+=`</div>`;

  // ── Permanent Archive (append-only) ──
  if(Cloud._connected){
    const archiveOn=cfg.archiveEnabled||false;
    const archiveCount=meta.gdArchiveCount||0;
    const archiveSync=meta.gdArchiveSync;
    const archiveAge=archiveSync?Math.floor(daysSince(archiveSync)):null;
    h+=`<div class="sec"><div class="sec-title" style="display:flex;justify-content:space-between;align-items:center">Permanent Archive<span style="font-size:9px;color:${archiveOn?'var(--gn)':'var(--dm)'}">${archiveOn?'&#9679; Active':'&#9675; Off'}</span></div>`;
    h+=`<div style="font-size:10px;color:var(--mu);margin-bottom:6px">A separate, <strong>append-only</strong> folder on your Drive (<code>Prompt Vault Archive</code>). Items are merged in over time; the main backup file is still the source for full restore. Use archive to recover individual items you may have deleted from the vault.</div>`;
    h+=`<div class="setting-row" style="margin-bottom:8px"><label style="flex:1">Enable Permanent Archive</label><label class="toggle"><input type="checkbox" id="archiveTog" ${archiveOn?'checked':''}><span class="slider"></span></label></div>`;
    if(archiveOn){
      h+=`<div style="font-size:9px;color:var(--dm);margin-bottom:6px">Archive: ${archiveCount} total items${archiveAge!==null?' · last sync '+archiveAge+'d ago':''}. Stored in Drive → "${Cloud.ARCHIVE_FOLDER_NAME}"</div>`;
      h+=`<div style="display:flex;gap:4px"><button class="bs" id="archivePushBtn">${Cloud._archiving?'Archiving...':'Sync to Archive Now'}</button><button class="bs" id="archiveBrowseBtn">Browse Archive</button></div>`;
    }
    h+=`</div>`;
  }

  // Platforms
  h+=`<div class="sec"><div class="sec-title" style="display:flex;justify-content:space-between;align-items:center">LLM Platforms<button class="bs" id="resetPlatBtn" style="font-size:8px">${I.rest} Reset defaults</button></div>`;
  cfg.platforms.forEach((p,i)=>{
    const disabled=cfg.disabledPlatforms.includes(p.id);
    h+=`<div class="plat-item ${disabled?'plat-disabled':''}"><span>${p.icon}</span><span class="plat-name">${esc(p.name)}</span><span class="plat-urls">${(p.urls||[]).join(", ")}</span>`;
    h+=`<label class="toggle tog-sm"><input type="checkbox" data-tog-plat="${p.id}" ${!disabled?'checked':''}><span class="slider"></span></label>`;
    const isDefault=DEFAULT_PLATFORMS.some(dp=>dp.id===p.id);
    if(!isDefault)h+=`<button class="ib dng" data-del-plat="${i}" title="Remove custom platform">${I.trash}</button>`;
    h+=`</div>`;
  });
  h+=`<div class="add-plat"><input type="text" id="newPlatName" placeholder="Platform name..."><input type="text" id="newPlatUrl" placeholder="domain.com"><button class="bs" id="addPlatBtn">${I.plus} Add</button></div>`;
  h+=`</div>`;

  // Auto-detect
  h+=`<div class="sec"><div class="setting-row"><label>Auto-detect AI from URL</label><label class="toggle"><input type="checkbox" id="autoDetectTog" ${cfg.autoDetect?'checked':''}><span class="slider"></span></label></div></div>`;

  // ── Device (for sync conflict awareness) ──
  const devName=meta?.deviceName||"";
  h+=`<div class="sec"><div class="sec-title">This Device</div>`;
  h+=`<div style="font-size:10px;color:var(--dm);margin-bottom:6px">Optional name for conflict detection when syncing across devices.</div>`;
  h+=`<input type="text" id="deviceName" value="${esc(devName)}" placeholder="e.g. Work Laptop" style="width:100%;padding:6px;background:var(--inp);border:1px solid var(--bl);border-radius:4px;color:var(--tx);font-size:11px">`;
  h+=`</div>`;

  // ── Bookmark Sync (Chrome ↔ Vault) ──
  const bmMode=cfg.bookmarkSyncMode||"vault-only";
  h+=`<div class="sec"><div class="sec-title">Bookmark Sync</div>`;
  h+=`<div style="font-size:10px;color:var(--mu);margin-bottom:6px">Sync bookmarks between Chrome and the Marks tab. Two-way: changes in either reflect in the other. Chrome-only: vault mirrors Chrome.</div>`;
  h+=`<div class="setting-row"><label>Sync mode</label><select id="bookmarkSyncMode" style="background:var(--inp);border:1px solid var(--bl);border-radius:4px;padding:4px 8px;color:var(--tx);font-size:11px">`;
  h+=`<option value="vault-only" ${bmMode==="vault-only"?"selected":""}>Vault only (no sync)</option>`;
  h+=`<option value="chrome-only" ${bmMode==="chrome-only"?"selected":""}>Chrome → Vault</option>`;
  h+=`<option value="two-way" ${bmMode==="two-way"?"selected":""}>Two-way</option>`;
  h+=`</select></div></div>`;

  // ── Storage Transparency Dashboard ──
  const pSize=JSON.stringify(P).length,kSize=JSON.stringify(KL).length,sSize=JSON.stringify(SN).length,bSize=JSON.stringify(BM).length,nSize=JSON.stringify(NT).length,gSize=JSON.stringify(GP).length,iSize=JSON.stringify(IP).length;
  const cfgSize=JSON.stringify(cfg).length,metaSize=JSON.stringify(meta).length;
  const snapshotEst=pSize+sSize+bSize+nSize;// one snapshot set
  const totalData=pSize+kSize+sSize+bSize+nSize+gSize+iSize+cfgSize+metaSize;
  const totalWithSnaps=totalData+(snapshotEst*MAX_SN);
  const bars=[
    {label:"Prompts",size:pSize,color:"var(--ac)"},
    {label:"Images",size:iSize,color:"var(--ip)"},
    {label:"Skills",size:kSize,color:"var(--sk)"},
    {label:"Clips",size:sSize,color:"var(--sn)"},
    {label:"Bookmarks",size:bSize,color:"var(--bk)"},{label:"Custom GPTs",size:gSize,color:"var(--gp)"},
    {label:"Notes",size:nSize,color:"var(--nt)"},
    {label:"Snapshots",size:snapshotEst*MAX_SN,color:"var(--dm)"},
  ];
  const maxBar=Math.max(...bars.map(b=>b.size),1);
  h+=`<div class="sec"><div class="sec-title">Storage</div>`;
  h+=`<div class="stor-chart">`;
  bars.forEach(b=>{
    const pct=Math.max((b.size/maxBar)*100,2);
    const kb=(b.size/1024).toFixed(1);
    h+=`<div class="stor-row"><span class="stor-lbl">${b.label}</span><div class="stor-bar-bg"><div class="stor-bar" style="width:${pct}%;background:${b.color}"></div></div><span class="stor-val">${kb}KB</span></div>`;
  });
  h+=`</div>`;
  h+=`<div class="stor-total">Total: ${(totalWithSnaps/1024).toFixed(1)}KB</div>`;
  h+=`<div id="storActual" class="stor-actual"></div>`;
  h+=`<div class="stor-note">This does not affect Chrome performance. Data stays in local storage with <code>unlimitedStorage</code> permission — no size cap, no speed impact.</div>`;
  h+=`</div>`;

  // Backup
  const bkDays=meta.lb?Math.floor(daysSince(meta.lb)):null;
  const bkNeed=needsBackup();
  h+=`<div class="sec"><div class="sec-title">Local Backup</div>`;
  h+=`<div style="font-size:10px;color:${bkNeed?'var(--ac)':'var(--mu)'};margin-bottom:6px">${bkDays!==null?`Last file backup: ${bkDays} day${bkDays!==1?'s':''} ago`:'No file backup yet'}${bkNeed?' — backup recommended':''}</div>`;
  h+=`<div style="display:flex;gap:4px"><button class="bs" id="bkNowBtn">${I.dl} Backup Now</button><button class="bs" id="expNowBtn">${I.dl} Export JSON</button></div>`;
  h+=`</div>`;

  h+=`<div class="sec"><div class="sec-title">Prompt Spreadsheet</div>`;
  h+=`<div style="font-size:10px;color:var(--mu);line-height:1.5;margin-bottom:7px">Export every prompt to an Excel-ready CSV. Edit it yourself or give it to an LLM, then reload it. Existing IDs update prompts; blank IDs add prompts. Reload never deletes.</div>`;
  h+=`<div style="display:flex;gap:4px;flex-wrap:wrap"><button class="bp" id="promptSheetExport">${I.dl} Export for Excel</button><button class="bs" id="promptSheetImport">Reload edited CSV</button><button class="bs" id="promptSheetBlank">Blank template</button><button class="bs" id="promptSheetGuide">${I.copy} LLM instructions</button></div>`;
  h+=`</div>`;

  // Local Snapshots (rolling auto-saves)
  {
    const snaps=meta.snapshots||{};
    const snapEntries=Object.entries(snaps).filter(([i,s])=>s&&s.ts).sort((a,b)=>b[1].ts-a[1].ts);
    h+=`<div class="sec"><div class="sec-title">Local Snapshots</div>`;
    h+=`<div style="font-size:10px;color:var(--mu);margin-bottom:6px">${MAX_SN} rolling snapshots (auto-saved every ~10 changes). Survive even if Drive is disconnected.</div>`;
    if(snapEntries.length){
      snapEntries.forEach(([i,s])=>{
        const age=Math.floor(daysSince(s.ts));
        const timeStr=age<1?"today":age===1?"yesterday":`${age}d ago`;
        h+=`<div class="gd-bk-row" style="border-left:3px solid var(--dm)"><div class="gd-bk-info"><div class="gd-bk-label">Snapshot #${i} — ${timeStr}</div><div class="gd-bk-meta">${new Date(s.ts).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})} · ${s.total||0} items (${s.prompts||0}p · ${s.snippets||0}s · ${s.bookmarks||0}b · ${s.notes||0}n · ${s.skills||0}sk · ${s.customgpts||0}g)</div></div><button class="bs" data-snap-idx="${i}">Restore</button></div>`;
      });
    }else{
      h+=`<div style="font-size:10px;color:var(--dm)">No snapshots yet — they'll appear after a few more saves.</div>`;
    }
    h+=`</div>`;
  }

  // Danger zone
  h+=`<div class="sec"><div class="sec-title" style="color:var(--dn)">Danger Zone</div>`;
  h+=`<button class="bs dng" id="resetAllBtn">${I.trash} Reset All Data</button>`;
  h+=`</div>`;

  h+=`</div>`;
  m.innerHTML=h;

  // ── Accordion: sections collapse to their titles (state kept per session) ──
  if(!window._pvSecOpen)window._pvSecOpen=new Set(["Privacy Dashboard","Prompt Spreadsheet"]);
  m.querySelectorAll(".sec").forEach(sec=>{
    const t=sec.querySelector(".sec-title");if(!t)return;
    const key=(t.textContent||"").trim().split("\n")[0].slice(0,40);
    sec.classList.add("sec-acc");
    if(!window._pvSecOpen.has(key))sec.classList.add("sec-closed");
    t.addEventListener("click",e=>{
      if(e.target.closest("button,input,select,a,label"))return;
      const closed=sec.classList.toggle("sec-closed");
      if(closed)window._pvSecOpen.delete(key);else window._pvSecOpen.add(key);
    });
  });

  // ── Fetch actual storage usage from Chrome API ──
  try{chrome.storage.local.getBytesInUse(null,bytes=>{
    const el=$("storActual");
    if(el)el.innerHTML=`<span>Chrome reports: ${(bytes/1024).toFixed(1)}KB used</span>`;
  })}catch{}

  // ── Wire Google Drive buttons ──
  $("gdConnBtn")?.addEventListener("click",safeHandler(()=>{Cloud.connect().then(()=>renderSettings())}));
  $("gdSkipBtn")?.addEventListener("click",()=>{meta.gdDismissed=true;chrome.storage.local.set({[MK]:meta});renderSettings()});
  $("gdSyncBtn")?.addEventListener("click",safeHandler(()=>{Cloud.push().then(()=>{if(!Cloud._paused)flash("OK Synced to Drive");renderSettings()})}));
  $("gdForceBtn")?.addEventListener("click",safeHandler(()=>{
    const ct=Cloud.itemCounts();
    showModal(`<h3 style="color:var(--dn)">Force Sync?</h3>
      <p>Auto-sync was paused because your data appears to have shrunk significantly.</p>
      <div style="font-size:10px;color:var(--dm);margin:6px 0;background:var(--inp);padding:8px;border-radius:4px">
        <div style="display:flex;justify-content:space-between"><span>Last sync:</span><strong>${meta.gdLastCounts?.total||'?'} items</strong></div>
        <div style="display:flex;justify-content:space-between"><span>Current:</span><strong>${ct.total} items</strong></div>
        <div style="display:flex;justify-content:space-between;color:var(--dn)"><span>Difference:</span><strong>−${(meta.gdLastCounts?.total||0)-ct.total} items</strong></div>
      </div>
      <p style="font-size:10px;color:var(--dn)">If you deleted items intentionally, this is fine. If something went wrong, cancel and use "Browse Backups" to restore first.</p>
      <div class="brow"><button class="bg-btn" id="fpX">Cancel</button><button class="bdn" id="fpY">Yes, Push Current Data</button></div>`,mc=>{
      mc.querySelector("#fpX").addEventListener("click",closeModal);
      mc.querySelector("#fpY").addEventListener("click",async()=>{closeModal();await Cloud.forcePush();renderSettings()})
    });
  }));
  $("gdDismissWarn")?.addEventListener("click",()=>{
    chrome.storage.local.get([MK],r=>{
      const m=r[MK]||{};
      m.gdWorkerPaused=false;
      m.gdWorkerError=null;
      chrome.storage.local.set({[MK]:m},()=>{
        if(typeof meta!=="undefined")Object.assign(meta,m);
        Cloud._paused=false;Cloud._error=null;renderSettings();
      });
    });
  });
  $("cloudProviderSel")?.addEventListener("change",e=>{cfg.cloudProvider=e.target.value;save();renderSettings();flash("Cloud provider: "+CLOUD_PROVIDER_NAMES[e.target.value])});
  $("cloudPullTog")?.addEventListener("change",e=>{cfg.cloudPullOnStartup=e.target.checked;save();renderSettings();flash(e.target.checked?"Cloud pull on startup enabled":"Cloud pull on startup disabled")});

  // ── Archive toggle and buttons ──
  $("archiveTog")?.addEventListener("change",e=>{cfg.archiveEnabled=e.target.checked;save();renderSettings();
    if(e.target.checked){flash("Permanent Archive enabled");Cloud.archivePush().catch(e=>console.warn("Archive error:",e))}else{flash("Archive paused (existing archive kept on Drive)")}});
  $("archivePushBtn")?.addEventListener("click",safeHandler(async()=>{
    flash("Syncing to archive...");await Cloud.archivePush();flash("OK Archive updated ("+((meta.gdArchiveCount)||0)+" items)");renderSettings();
  }));
  $("archiveBrowseBtn")?.addEventListener("click",safeHandler(async()=>{
    flash("Loading archive...");
    try{
      const archive=await Cloud.archiveRead();
      if(!archive||!archive.items||!Object.keys(archive.items).length){flash("Archive is empty");return}
      const items=Object.values(archive.items).sort((a,b)=>(b.lastSeen||b.modified||0)-(a.lastSeen||a.modified||0));
      const storeIcons={prompts:S.bolt,skills:S.wrench,snippets:S.clip,bookmarks:S.pin,notes:S.note,customgpts:S.ai};
      const storeColors={prompts:"var(--ac)",skills:"var(--sk)",snippets:"var(--sn)",bookmarks:"var(--bk)",notes:"var(--nt)",customgpts:"var(--gp)"};
      // Check which items are currently in local state
      const localIds=new Set();
      [P,KL,SN,BM,NT].forEach(store=>allItems(store.folders).forEach(p=>localIds.add(p.id)));
      const missingItems=items.filter(i=>!localIds.has(i.id));
      const presentItems=items.filter(i=>localIds.has(i.id));
      const totalVersions=items.reduce((s,i)=>s+(i.versions||[]).length,0);

      let h2=`<h3>Permanent Archive</h3>`;
      h2+=`<div style="font-size:10px;color:var(--dm);margin-bottom:4px">${items.length} items · ${totalVersions} saved versions · ${missingItems.length} not in current vault · Updated ${archive.updatedAt?new Date(archive.updatedAt).toLocaleString():''}</div>`;
      h2+=`<div style="margin-bottom:8px"><input type="text" id="archQ" placeholder="Search archive..." style="width:100%"></div>`;
      if(missingItems.length){
        h2+=`<div style="margin-bottom:4px"><button class="bp" id="archRecAll" style="width:100%">Recover All ${missingItems.length} Missing Items</button></div>`;
      }
      h2+=`<div id="archList" style="max-height:300px;overflow-y:auto">`;
      items.slice(0,100).forEach(i=>{
        const missing=!localIds.has(i.id);
        const icon=storeIcons[i.store]||"";
        const color=storeColors[i.store]||"var(--dm)";
        const lastStr=i.lastSeen?formatDateTime(i.lastSeen):"";
        const vCt=(i.versions||[]).length;
        h2+=`<div class="gd-bk-row" style="border-left:3px solid ${missing?'var(--dn)':color}"><div class="gd-bk-info"><div class="gd-bk-label">${icon} ${esc(i.title)}${missing?' <span style="color:var(--dn);font-size:9px">&#9679; missing</span>':''}</div><div class="gd-bk-meta">${esc(i.store)} · ${lastStr}${vCt?' · '+vCt+'v':''}${(i.tags||[]).length?' · '+i.tags.slice(0,3).join(', '):''}</div></div>${missing?`<button class="bs" data-arch-rec="${i.id}">Recover</button>`:''}</div>`;
      });
      if(items.length>100)h2+=`<div style="font-size:9px;color:var(--dm);padding:6px;text-align:center">Showing 100 of ${items.length} — use search</div>`;
      h2+=`</div>`;
      h2+=`<div class="brow" style="margin-top:8px"><button class="bg-btn" id="archX">Close</button></div>`;

      showModal(h2,mc=>{
        mc.querySelector("#archX").addEventListener("click",closeModal);
        // Search filter
        mc.querySelector("#archQ")?.addEventListener("input",e=>{
          const q=e.target.value.toLowerCase();
          mc.querySelectorAll(".gd-bk-row").forEach(row=>{
            const label=row.querySelector(".gd-bk-label")?.textContent?.toLowerCase()||"";
            const meta2=row.querySelector(".gd-bk-meta")?.textContent?.toLowerCase()||"";
            row.style.display=(label.includes(q)||meta2.includes(q))?"":"none";
          });
        });
        // Recover individual item
        mc.querySelectorAll("[data-arch-rec]").forEach(btn=>{btn.addEventListener("click",()=>{
          pushUndo();const n=Cloud.recoverFromArchive(archive,[btn.dataset.archRec]);
          if(n>0){flash("OK Recovered "+n+" item");closeModal()}else{flash("Already exists locally")}
        })});
        // Recover all missing
        mc.querySelector("#archRecAll")?.addEventListener("click",()=>{
          pushUndo();const n=Cloud.recoverFromArchive(archive,missingItems.map(i=>i.id));
          flash("OK Recovered "+n+" items");closeModal();render();
        });
      });
    }catch(e){flash("Failed to load archive: "+e.message)}
  }));

  // ── Browse Drive Backups ──
  $("gdBrowseBtn")?.addEventListener("click",safeHandler(async()=>{
    flash("Loading backups...");
    try{
      const backups=await Cloud.listBackups();
      if(!backups.length){flash("No backups found on Drive");return}
      const localCounts=Cloud.itemCounts();
      let rows=backups.map(b=>{
        const isLatest=b.name==="prompt-vault-backup.json";
        const isSafety=b.name.includes("pre-restore");
        const dateStr=b.modified?new Date(b.modified).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}):"";
        const sizeStr=b.size?`${b.size}KB`:"";
        const label=isLatest?"Latest auto-backup":isSafety?"⛑ Pre-restore safety copy":b.name.replace("prompt-vault-","").replace(".json","");
        const cls=isLatest?"gd-bk-latest":isSafety?"gd-bk-safety":"";
        return`<div class="gd-bk-row ${cls}" data-bkid="${b.id}"><div class="gd-bk-info"><div class="gd-bk-label">${esc(label)}</div><div class="gd-bk-meta">${dateStr}${sizeStr?' · '+sizeStr:''}</div></div><button class="bs gd-bk-restore" data-bkid="${b.id}">Restore</button></div>`;
      }).join("");
      showModal(`<h3>Drive Backups</h3>
        <div style="font-size:10px;color:var(--dm);margin-bottom:8px">Your vault now: ${localCounts.total} items (${localCounts.prompts}p · ${localCounts.snippets}s · ${localCounts.bookmarks}b · ${localCounts.notes}n · ${localCounts.skills}sk · ${localCounts.customgpts||0}g)</div>
        <div style="max-height:300px;overflow-y:auto">${rows}</div>
        <div class="brow" style="margin-top:8px"><button class="bg-btn" id="bbX">Close</button></div>`,mc=>{
        mc.querySelector("#bbX").addEventListener("click",closeModal);
        mc.querySelectorAll(".gd-bk-restore").forEach(btn=>{btn.addEventListener("click",async()=>{
          const bkId=btn.dataset.bkid;
          closeModal();flash("Downloading backup...");
          try{
            // First, peek at the backup to show comparison
            const r=await Cloud.pull(bkId);
            if(!r){flash("Could not read backup");return}
            const d=r.data;
            const remoteCounts=d.counts||{prompts:'?',skills:'?',snippets:'?',bookmarks:'?',notes:'?',customgpts:'?',total:'?'};
            // If backup doesn't have embedded counts, calculate them
            if(!d.counts){
              const rc={};
              if(d.prompts?.folders)rc.prompts=countItems(d.prompts.folders).prompts;
              if(d.skills?.folders)rc.skills=countItems(d.skills.folders).prompts;
              if(d.snippets?.folders)rc.snippets=countItems(d.snippets.folders).prompts;
              if(d.bookmarks?.folders)rc.bookmarks=countItems(d.bookmarks.folders).prompts;
              if(d.notes?.folders)rc.notes=countItems(d.notes.folders).prompts;
              rc.total=(rc.prompts||0)+(rc.skills||0)+(rc.snippets||0)+(rc.bookmarks||0)+(rc.notes||0);
              Object.assign(remoteCounts,rc);
            }
            const hasLocalChanges=meta.sc>(meta.lbs||0);
            const conflictWarn=hasLocalChanges?`<p style="font-size:11px;color:var(--dn);background:var(--inp);padding:8px;border-radius:4px;margin:8px 0">⚠ You have local changes since your last backup. Restoring will replace them.</p>`:"";
            showModal(`<h3>Restore Backup?</h3>
              <p style="font-size:10px;color:var(--dm)">From: ${esc(r.name)}${r.modified?' · '+new Date(r.modified).toLocaleString():''}</p>
              ${conflictWarn}
              <div style="font-size:10px;background:var(--inp);padding:8px;border-radius:4px;margin:8px 0">
                <div style="display:flex;justify-content:space-between;padding:2px 0"><span></span><span style="font-weight:600;color:var(--dm)">Backup</span><span style="font-weight:600;color:var(--dm)">Current</span></div>
                <div style="display:flex;justify-content:space-between;padding:2px 0"><span>Prompts</span><span>${remoteCounts.prompts}</span><span>${localCounts.prompts}</span></div>
                <div style="display:flex;justify-content:space-between;padding:2px 0"><span>Skills</span><span>${remoteCounts.skills}</span><span>${localCounts.skills}</span></div>
                <div style="display:flex;justify-content:space-between;padding:2px 0"><span>Clips</span><span>${remoteCounts.snippets}</span><span>${localCounts.snippets}</span></div>
                <div style="display:flex;justify-content:space-between;padding:2px 0"><span>Bookmarks</span><span>${remoteCounts.bookmarks}</span><span>${localCounts.bookmarks}</span></div>
                <div style="display:flex;justify-content:space-between;padding:2px 0"><span>Custom GPTs</span><span>${remoteCounts.customgpts||0}</span><span>${localCounts.customgpts||0}</span></div>
                <div style="display:flex;justify-content:space-between;padding:2px 0"><span>Notes</span><span>${remoteCounts.notes}</span><span>${localCounts.notes}</span></div>
                <div style="display:flex;justify-content:space-between;padding:2px 0;border-top:1px solid var(--bl);margin-top:3px;padding-top:4px;font-weight:600"><span>Total</span><span>${remoteCounts.total}</span><span>${localCounts.total}</span></div>
              </div>
              <p style="font-size:10px;color:var(--gn)">OK Your current data will be auto-saved to Drive as a safety copy before restoring.</p>
              <div class="brow"><button class="bg-btn" id="brX">${hasLocalChanges?"Keep local":"Cancel"}</button><button class="bp" id="brY">Use Drive backup</button></div>`,mc2=>{
              mc2.querySelector("#brX").addEventListener("click",closeModal);
              mc2.querySelector("#brY").addEventListener("click",async()=>{
                closeModal();flash("Saving safety copy & restoring...");
                try{
                  // safeRestore auto-saves current state before pulling
                  const r2=await Cloud.safeRestore(bkId);
                  if(!r2){flash("Restore failed — no data");return}
                  if(!restoreVault(r2.data,{source:"drive-restore-browse"})){flash("Restore blocked — invalid backup");return}
                  flash("OK Restored from "+r2.name);aTab="prompts";render();
                }catch(e){flash("Restore failed: "+e.message)}
              });
            });
          }catch(e){flash("Failed: "+e.message)}
        })});
      });
    }catch(e){flash("Failed to list backups: "+e.message)}
  }));

  // ── Restore Latest (quick path with safety) ──
  $("gdRestoreBtn")?.addEventListener("click",safeHandler(()=>{openRestoreLatestFromDriveModal()}));
  $("gdDiscBtn")?.addEventListener("click",()=>{
    showModal(`<h3>Disconnect Drive?</h3><p>Your local data stays safe. Auto-sync will stop.</p><div class="brow"><button class="bg-btn" id="ddX">Cancel</button><button class="bdn" id="ddY">Disconnect</button></div>`,mc=>{
      mc.querySelector("#ddX").addEventListener("click",closeModal);
      mc.querySelector("#ddY").addEventListener("click",()=>{Cloud.disconnect();closeModal();renderSettings()});
    });
  });

  // Wire platform toggles
  m.querySelectorAll("[data-tog-plat]").forEach(tog=>{
    tog.addEventListener("change",()=>{
      const pid=tog.dataset.togPlat;
      cfg.disabledPlatforms=cfg.disabledPlatforms||[];
      if(tog.checked)cfg.disabledPlatforms=cfg.disabledPlatforms.filter(x=>x!==pid);
      else if(!cfg.disabledPlatforms.includes(pid))cfg.disabledPlatforms.push(pid);
      save();renderSettings();flash(tog.checked?"Platform enabled":"Platform hidden");
    });
  });
  // Wire platform deletion (custom only) with confirmation
  m.querySelectorAll("[data-del-plat]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const idx=+btn.dataset.delPlat;const plat=cfg.platforms[idx];
      showModal(`<h3 style="color:var(--dn)">Remove Platform?</h3><p>Permanently remove <strong>${esc(plat.name)}</strong>?</p><p style="font-size:10px;color:var(--dm)">Type the platform name to confirm:</p><input type="text" id="delPlatConf" placeholder="${esc(plat.name)}"><div class="brow"><button class="bg-btn" id="dpX">Cancel</button><button class="bdn" id="dpY" disabled>Remove</button></div>`,mc=>{
        const inp=mc.querySelector("#delPlatConf"),okBtn=mc.querySelector("#dpY");
        inp.focus();
        inp.addEventListener("input",()=>{okBtn.disabled=inp.value.trim().toLowerCase()!==plat.name.toLowerCase()});
        mc.querySelector("#dpX").addEventListener("click",closeModal);
        okBtn.addEventListener("click",()=>{if(okBtn.disabled)return;cfg.platforms.splice(idx,1);cfg.disabledPlatforms=(cfg.disabledPlatforms||[]).filter(x=>x!==plat.id);save();closeModal();renderSettings();flash("Platform removed")});
        inp.addEventListener("keydown",e=>{if(e.key==="Enter"&&!okBtn.disabled)okBtn.click()})
      });
    });
  });
  // Reset platforms to defaults
  $("resetPlatBtn")?.addEventListener("click",()=>{
    showModal(`<h3>Reset Platforms?</h3><p>Restore all default platforms. Custom platforms will be kept.</p><div class="brow"><button class="bg-btn" id="rpX">Cancel</button><button class="bp" id="rpY">Reset</button></div>`,mc=>{
      mc.querySelector("#rpX").addEventListener("click",closeModal);
      mc.querySelector("#rpY").addEventListener("click",()=>{
        for(const dp of DEFAULT_PLATFORMS){if(!cfg.platforms.find(p=>p.id===dp.id))cfg.platforms.push(deepClone(dp))}
        cfg.disabledPlatforms=[];save();closeModal();renderSettings();flash("OK Platforms restored")
      })
    })
  });
  $("addPlatBtn")?.addEventListener("click",()=>{
    const name=$("newPlatName").value.trim(),url=$("newPlatUrl").value.trim();
    if(!name){flash("Name required");return}
    const id=name.toLowerCase().replace(/[^a-z0-9]/g,"_");
    cfg.platforms.push({id,name,urls:url?[url]:[],icon:"⬜"});
    save();renderSettings();flash("Platform added");
  });
  $("autoDetectTog")?.addEventListener("change",e=>{cfg.autoDetect=e.target.checked;save()});

  // ── Trust: Lock & Capture ──
  $("lockVaultTog")?.addEventListener("change",e=>{cfg.vaultLockEnabled=e.target.checked;save();renderSettings();flash(e.target.checked?"Vault will lock on next open":"Lock disabled")});
  $("lockSetBtn")?.addEventListener("click",()=>{
    showModal(`<h3>Set Privacy-Screen Passcode</h3><p style="font-size:10px;color:var(--dm);margin-bottom:8px">This hides the side panel; it does not encrypt stored vault data. Use at least 8 characters.</p><input type="password" id="lockNew1" placeholder="New passcode" class="lock-inp" style="width:100%;margin-bottom:6px" autocomplete="new-password"><input type="password" id="lockNew2" placeholder="Confirm passcode" class="lock-inp" style="width:100%" autocomplete="new-password"><div id="lockSetErr" class="lock-err" style="margin-top:4px"></div><div class="brow" style="margin-top:8px"><button class="bg-btn" id="lockSetX">Cancel</button><button class="bp" id="lockSetY">Set</button></div>`,mc=>{
      mc.querySelector("#lockSetX").addEventListener("click",closeModal);
      mc.querySelector("#lockSetY").addEventListener("click",async()=>{
        const p1=$("lockNew1").value,p2=$("lockNew2").value,err=mc.querySelector("#lockSetErr");
        if(!p1||p1.length<8){err.textContent="Enter at least 8 characters";err.style.display="block";return}
        if(p1!==p2){err.textContent="Passcodes don't match";err.style.display="block";return}
        err.style.display="none";
        const salt=crypto.getRandomValues(new Uint8Array(16)).reduce((s,b)=>s+b.toString(16).padStart(2,"0"),"");
        cfg.vaultLockKdf="pbkdf2-sha256-v1";cfg.vaultLockHash=await lockHash(p1,salt,cfg.vaultLockKdf);cfg.vaultLockSalt=salt;cfg.vaultLockEnabled=true;
        save();closeModal();renderSettings();flash("Passcode set — vault will lock on next open");
      });
    });
  });
  $("lockChangeBtn")?.addEventListener("click",()=>{
    showModal(`<h3>Change Passcode</h3><p style="font-size:10px;color:var(--dm);margin-bottom:8px">Enter current passcode, then the new one.</p><input type="password" id="lockCur" placeholder="Current passcode" class="lock-inp" style="width:100%;margin-bottom:6px" autocomplete="current-password"><input type="password" id="lockNew1" placeholder="New passcode" class="lock-inp" style="width:100%;margin-bottom:6px" autocomplete="new-password"><input type="password" id="lockNew2" placeholder="Confirm new passcode" class="lock-inp" style="width:100%" autocomplete="new-password"><div id="lockChgErr" class="lock-err" style="margin-top:4px"></div><div class="brow" style="margin-top:8px"><button class="bg-btn" id="lockChgX">Cancel</button><button class="bp" id="lockChgY">Change</button></div>`,mc=>{
      mc.querySelector("#lockChgX").addEventListener("click",closeModal);
      mc.querySelector("#lockChgY").addEventListener("click",async()=>{
        const cur=$("lockCur").value,p1=$("lockNew1").value,p2=$("lockNew2").value,err=mc.querySelector("#lockChgErr");
        if(!await verifyLock(cur)){err.textContent="Incorrect current passcode";err.style.display="block";return}
        if(!p1||p1.length<8){err.textContent="New passcode: at least 8 characters";err.style.display="block";return}
        if(p1!==p2){err.textContent="New passcodes don't match";err.style.display="block";return}
        err.style.display="none";
        const salt=crypto.getRandomValues(new Uint8Array(16)).reduce((s,b)=>s+b.toString(16).padStart(2,"0"),"");
        cfg.vaultLockKdf="pbkdf2-sha256-v1";cfg.vaultLockHash=await lockHash(p1,salt,cfg.vaultLockKdf);cfg.vaultLockSalt=salt;
        save();closeModal();renderSettings();flash("Passcode changed");
      });
    });
  });
  $("lockNowBtn")?.addEventListener("click",()=>{sessionStorage.removeItem("pv_unlocked");renderLockScreen()});
  $("lockRemoveBtn")?.addEventListener("click",()=>{
    showModal(`<h3>Remove Passcode</h3><p style="font-size:10px;color:var(--dm);margin-bottom:8px">Enter current passcode to disable the lock.</p><input type="password" id="lockCur" placeholder="Current passcode" class="lock-inp" style="width:100%" autocomplete="current-password"><div id="lockRmErr" class="lock-err" style="margin-top:4px"></div><div class="brow" style="margin-top:8px"><button class="bg-btn" id="lockRmX">Cancel</button><button class="bdn" id="lockRmY">Remove</button></div>`,mc=>{
      mc.querySelector("#lockRmX").addEventListener("click",closeModal);
      mc.querySelector("#lockRmY").addEventListener("click",async()=>{
        const cur=$("lockCur").value,err=mc.querySelector("#lockRmErr");
        if(!await verifyLock(cur)){err.textContent="Incorrect passcode";err.style.display="block";return}
        cfg.vaultLockHash="";cfg.vaultLockSalt="";cfg.vaultLockKdf="";cfg.vaultLockEnabled=false;
        save();closeModal();renderSettings();flash("Passcode removed");
      });
    });
  });
  $("captureTog")?.addEventListener("change",e=>{cfg.captureEnabled=e.target.checked;save();renderSettings();flash(e.target.checked?"Response capture enabled":"Response capture disabled")});
  $("captureAllowedDomains")?.addEventListener("blur",e=>{
    const raw=(e.target.value||"").trim().split(/\n/).map(s=>s.trim()).filter(Boolean);
    cfg.captureAllowedDomains=raw;save();flash("Capture allowlist saved");
  });
  $("captureBlockedDomains")?.addEventListener("blur",e=>{
    const raw=(e.target.value||"").trim().split(/\n/).map(s=>s.trim()).filter(Boolean);
    cfg.captureBlockedDomains=raw;save();flash("Blocked domains saved");
  });
  $("bookmarkSyncMode")?.addEventListener("change",e=>{cfg.bookmarkSyncMode=e.target.value;save();renderSettings();flash("Bookmark sync updated")});
  $("deviceName")?.addEventListener("blur",e=>{meta.deviceName=(e.target.value||"").trim();chrome.storage.local.set({[MK]:meta});flash("Device name saved")});
  $("faviconsDisabledTog")?.addEventListener("change",e=>{cfg.faviconsDisabled=e.target.checked;save();renderSettings();flash(e.target.checked?"Site icons hidden":"Site icons shown")});
  $("pvBridgeTog")?.addEventListener("change",e=>{cfg.pvBridgeEnabled=e.target.checked;save();renderSettings();flash(e.target.checked?"PV bridge enabled":"PV bridge disabled")});
  const _improvementNotesSave=debounce(saveImprovementNotes,400);
  document.querySelectorAll("[data-imp-text]").forEach(el=>el.addEventListener("input",e=>{const n=meta.improvementNotes.find(x=>x.id===e.target.dataset.impText);if(n){n.text=e.target.value;n.modified=Date.now();_improvementNotesSave()}}));
  document.querySelectorAll("[data-imp-del]").forEach(el=>el.addEventListener("click",()=>{meta.improvementNotes=meta.improvementNotes.filter(x=>x.id!==el.dataset.impDel);saveImprovementNotes();renderSettings()}));
  const addImprovementNote=()=>{const inp=$("improvementNoteNew"),text=(inp?.value||"").trim();if(!text)return;meta.improvementNotes.push({id:"imp_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7),text,created:Date.now(),modified:Date.now()});saveImprovementNotes();renderSettings()};
  $("improvementNoteAdd")?.addEventListener("click",addImprovementNote);
  $("improvementNoteNew")?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addImprovementNote()}});
  $("trustReviewBtn")?.addEventListener("click",()=>openTrustOnboarding(true));

  $("themeSel")?.addEventListener("change",e=>{cfg.theme=e.target.value;save();applyThemeAndBackground();flash("Theme: "+e.target.value)});
  document.querySelectorAll(".wp-swatch").forEach(el=>{el.addEventListener("click",()=>{const id=el.dataset.wp;cfg.background=id;save();applyThemeAndBackground();renderSettings();flash(id==="none"?"Background cleared":"Background: "+id)})});
  $("wpUploadBtn")?.addEventListener("click",()=>$("wpUpload")?.click());
  $("wpUpload")?.addEventListener("change",e=>{
    const f=e.target.files?.[0];if(!f||!f.type.startsWith("image/"))return;
    const r=new FileReader();r.onload=()=>{const data=r.result;if(data&&data.length<500000){cfg.background="custom";cfg.backgroundCustom=data;save();applyThemeAndBackground();renderSettings();flash("Custom photo set")}else flash("Image too large — try smaller")};r.readAsDataURL(f);e.target.value="";
  });
  $("wpClearBtn")?.addEventListener("click",()=>{cfg.background="none";cfg.backgroundCustom="";save();applyThemeAndBackground();renderSettings();flash("Custom photo removed")});

  $("bkNowBtn")?.addEventListener("click",doBackup);
  $("expNowBtn")?.addEventListener("click",manualExport);
  $("promptSheetExport")?.addEventListener("click",()=>pvDownloadPromptSheet(false));
  $("promptSheetImport")?.addEventListener("click",importPickFiles);
  $("promptSheetBlank")?.addEventListener("click",()=>pvDownloadPromptSheet(true));
  $("promptSheetGuide")?.addEventListener("click",()=>navigator.clipboard.writeText(pvPromptSheetLlmInstructions()).then(()=>flash("LLM instructions copied")).catch(()=>flash("Copy failed")));
  // ── Local snapshot restore ──
  m.querySelectorAll("[data-snap-idx]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const idx=+btn.dataset.snapIdx;
      const snapMeta=(meta.snapshots||{})[idx];
      const localCounts=Cloud.itemCounts();
      showModal(`<h3>Restore Snapshot #${idx}?</h3>
        <p style="font-size:10px;color:var(--dm)">${snapMeta?new Date(snapMeta.ts).toLocaleString():'Unknown time'} · ${snapMeta?.total||'?'} items</p>
        <div style="font-size:10px;background:var(--inp);padding:8px;border-radius:4px;margin:8px 0">
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span></span><span style="font-weight:600;color:var(--dm)">Snapshot</span><span style="font-weight:600;color:var(--dm)">Current</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span>Prompts</span><span>${snapMeta?.prompts||'?'}</span><span>${localCounts.prompts}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span>Skills</span><span>${snapMeta?.skills||'?'}</span><span>${localCounts.skills}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span>Clips</span><span>${snapMeta?.snippets||'?'}</span><span>${localCounts.snippets}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span>Bookmarks</span><span>${snapMeta?.bookmarks||'?'}</span><span>${localCounts.bookmarks}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span>Custom GPTs</span><span>${snapMeta?.customgpts||'?'}</span><span>${localCounts.customgpts||0}</span></div>
          <div style="display:flex;justify-content:space-between;padding:2px 0"><span>Notes</span><span>${snapMeta?.notes||'?'}</span><span>${localCounts.notes}</span></div>
        </div>
        <p style="font-size:10px;color:var(--mu)">This replaces your current data with the snapshot. Your current data is lost unless you export or sync to Drive first.</p>
        <div class="brow"><button class="bg-btn" id="srX">Cancel</button><button class="bp" id="srY">Restore Snapshot</button></div>`,mc=>{
        mc.querySelector("#srX").addEventListener("click",closeModal);
        mc.querySelector("#srY").addEventListener("click",()=>{
          closeModal();
          chrome.storage.local.get([SP+"p"+idx,SP+"s"+idx,SP+"b"+idx,SP+"n"+idx,SP+"k"+idx,SP+"g"+idx],res=>{
            const sp=res[SP+"p"+idx],ss=res[SP+"s"+idx],sb=res[SP+"b"+idx],sn=res[SP+"n"+idx],sk=res[SP+"k"+idx],sg=res[SP+"g"+idx];
            if(!sp&&!ss&&!sb){flash("Snapshot data not found");return}
            pushUndo();
            if(sp)P=sp;if(ss)SN=ss;if(sb)BM=sb;if(sn)NT=sn;if(sk)KL=sk;if(sg)GP=sg;
            [P,SN,BM,NT,KL,GP].forEach(x=>{x.trash=x.trash||[];x.collections=x.collections||[]});
            
            if(!BM.speedDial)BM.speedDial=[];
            migrateSectionPanels();
            const ct=Cloud.itemCounts();
            meta.gdLastCounts={prompts:ct.prompts,skills:ct.skills,snippets:ct.snippets,bookmarks:ct.bookmarks,notes:ct.notes,total:ct.total};
            validateAll();save();
            flash("OK Restored from snapshot #"+idx);aTab="prompts";render();
          });
        });
      });
    });
  });
  $("resetAllBtn")?.addEventListener("click",()=>{
    showModal(`<h3 style="color:var(--dn)">Reset Everything?</h3><p>This permanently deletes all prompts, clips, bookmarks, custom GPTs, and settings. Cannot be undone.</p><p style="font-size:10px;color:var(--dm)">Type <strong>RESET</strong> to confirm:</p><input type="text" id="rstConf" placeholder="RESET"><div class="brow"><button class="bg-btn" id="rstX">Cancel</button><button class="bdn" id="rstY" disabled>Reset</button></div>`,c=>{
      const inp=c.querySelector("#rstConf"),okBtn=c.querySelector("#rstY");
      inp.focus();
      inp.addEventListener("input",()=>{okBtn.disabled=inp.value.trim()!=="RESET"});
      c.querySelector("#rstX").addEventListener("click",closeModal);
      okBtn.addEventListener("click",()=>{if(okBtn.disabled)return;
        P=mkDef("root","My Prompts");KL=mkDef("kroot","My Skills");SN=mkDef("sroot","My Snippets");BM=mkDef("broot","My Bookmarks");NT=mkDef("nroot","My Notes");GP=mkDef("groot","My Custom GPTs");[P,KL,SN,BM,NT,GP].forEach(x=>x.collections=[]);BM.sectionPanels=[];
        cfg=deepClone(DEFAULT_CFG);meta={sc:0,lb:0,lbs:0,si:0};undo=[];
        save();closeModal();aTab="prompts";render();flash("All data reset");
      });
    });
  });
}

// ═══════ ERROR BOUNDARIES ═══════

// Renders a visible, recoverable error panel inside #main.
// This is the last line of defense — if render() itself throws,
// the user sees this instead of a blank panel.
function showErrorPanel(error){
  const m=$("main");
  if(!m)return;
  m.innerHTML=`<div class="err-panel">
    <div class="err-icon">⚠</div>
    <div class="err-title">Something went wrong</div>
    <div class="err-msg">${esc(error?.message||String(error)||"Unknown error")}</div>
    <div class="err-actions">
      <button id="errReset">Reset View</button>
      <button class="err-primary" id="errReload">Reload Extension</button>
    </div>
  </div>`;
  $("errReset")?.addEventListener("click",resetView);
  $("errReload")?.addEventListener("click",()=>location.reload());
}

// Resets UI state to a clean list view and re-renders.
// If even that fails, falls back to the error panel.
function resetView(){
  const s2=st();
  s2.view="list";
  s2.eId=null;
  s2.q="";
  s2.collFilter="";
  try{render()}catch(e){showErrorPanel(e)}
}

// Wraps any event handler in try/catch. On failure: logs, toasts,
// attempts re-render. If re-render fails, shows error panel.
function safeHandler(fn){
  return function(){
    try{fn.apply(this,arguments)}
    catch(e){
      console.error("[PV] Handler error:",e);
      flash("Error: "+e.message);
      try{render()}catch{showErrorPanel(e)}
    }
  };
}

// Global last-resort error handlers — catches anything that
// safeHandler and render()'s try/catch don't cover.
function initGlobalErrorHandlers(){
  window.addEventListener("error",e=>{
    console.error("[PV] Uncaught error:",e.error||e.message);
    flash("Unexpected error — try Reset View");
  });
  window.addEventListener("unhandledrejection",e=>{
    console.error("[PV] Unhandled rejection:",e.reason);
    const msg=String(e.reason?.message||e.reason||"");
    // Don't alarm user for expected Drive/network issues
    if(msg.includes("token")||msg.includes("auth")||msg.includes("Drive")||msg.includes("fetch")||msg.includes("network")||msg.includes("Failed to fetch"))return;
    flash("Async error — try Reset View");
  });
}


// ═══════ VAULT LOCK ═══════
const VAULT_LOCK_ITERATIONS=250000;
async function lockHash(passcode,salt,kdf){
  const enc=new TextEncoder();
  let buf;
  if(kdf==="pbkdf2-sha256-v1"){
    const key=await crypto.subtle.importKey("raw",enc.encode(passcode||""),"PBKDF2",false,["deriveBits"]);
    buf=await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:enc.encode(salt),iterations:VAULT_LOCK_ITERATIONS},key,256);
  }else{
    // Backward compatibility for existing locks created before v7.9.2.
    buf=await crypto.subtle.digest("SHA-256",enc.encode((passcode||"")+salt));
  }
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
async function verifyLock(passcode){
  if(!cfg?.vaultLockHash||!cfg?.vaultLockSalt)return false;
  const h=await lockHash(passcode,cfg.vaultLockSalt,cfg.vaultLockKdf||"");
  return h===cfg.vaultLockHash;
}
function renderLockScreen(){
  const m=$("main");if(!m)return;
  m.innerHTML=`<div class="lock-screen">
    <div class="lock-icon">🔒</div>
    <div class="lock-title">Vault Locked</div>
    <div class="lock-desc">Enter passcode to unlock</div>
    <input type="password" id="lockPin" placeholder="Passcode" class="lock-inp" autocomplete="off">
    <div id="lockErr" class="lock-err"></div>
    <button class="bp" id="lockUnlock">Unlock</button>
  </div>`;
  const inp=$("lockPin"),err=$("lockErr"),btn=$("lockUnlock");
  inp.focus();
  const doUnlock=async()=>{
    const p=inp.value;
    if(!p){err.textContent="Enter passcode";err.style.display="block";return}
    err.style.display="none";
    const ok=await verifyLock(p);
    if(ok){sessionStorage.pv_unlocked="1";inp.value="";validateAll();render();clearBackupBanner();try{chrome.runtime.sendMessage({type:"REBUILD_MENUS"})}catch{};Cloud.init().then(()=>{syncGdStateFromMeta();return Cloud.pullOnStartupIfEnabled()})}
    else{err.textContent="Incorrect passcode";err.style.display="block";inp.select()}
  };
  btn.addEventListener("click",doUnlock);
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")doUnlock()});
}
function isVaultLocked(){
  if(!cfg?.vaultLockEnabled||!cfg?.vaultLockHash)return false;
  return sessionStorage.pv_unlocked!=="1";
}

// ═══════ NOTES EDITOR — Notepad-style WYSIWYG toolbar ═══════
// contenteditable + execCommand: Bold, Italic, Underline, Align, Bullets, Numbering, Indent

const NOTE_ALLOWED_TAGS=new Set(["b","i","u","strong","em","p","div","br","ul","ol","li","span","blockquote","h1","h2","h3"]);

function sanitizeNoteHtml(html){
  if(!html||typeof html!=="string")return"";
  const doc=new DOMParser().parseFromString(html,"text/html");
  function walk(n){
    if(n.nodeType===3)return n.cloneNode(true);
    if(n.nodeType!==1)return null;
    const tag=n.tagName.toLowerCase();
    if(!NOTE_ALLOWED_TAGS.has(tag)&&tag!=="body")return null;
    const out=doc.createElement(tag==="body"?"div":tag);
    if(tag==="span"||tag==="p"||tag==="div"){const s=n.getAttribute("style");if(s&&/text-align|margin/.test(s))out.setAttribute("style",s)}
    for(let c=n.firstChild;c;c=c.nextSibling){const w=walk(c);if(w)out.appendChild(w)}
    return out;
  }
  const body=doc.body;
  const frag=document.createDocumentFragment();
  for(let c=body.firstChild;c;c=c.nextSibling){const w=walk(c);if(w)frag.appendChild(w)}
  const wrap=document.createElement("div");
  wrap.appendChild(frag);
  return wrap.innerHTML;
}

// Plain text to HTML (backward compat)
function plainToNoteHtml(text){
  if(!text||typeof text!=="string")return"";
  if(text.trim().startsWith("<")&&/<\/[a-z]+>/i.test(text))return sanitizeNoteHtml(text);
  const esc=(s)=>{const d=document.createElement("div");d.textContent=s;return d.innerHTML};
  return text.split(/\r?\n/).map(l=>l?`<p>${esc(l)}</p>`:"<br>").join("");
}

// HTML to display (sanitized)
function renderNoteContent(html){
  if(!html||typeof html!=="string")return"";
  if(html.trim().startsWith("<")&&/<\/[a-z]+>/i.test(html))return sanitizeNoteHtml(html);
  const esc=(s)=>{const d=document.createElement("div");d.textContent=s;return d.innerHTML};
  return "<p>"+esc(html).replace(/\n/g,"</p><p>")+"</p>";
}

// Notepad-style toolbar
function renderNoteToolbar(){
  return `<div class="note-toolbar ntb-notepad" id="noteToolbar">
    <button type="button" class="ntb-btn" data-cmd="bold" title="Bold"><b>B</b></button>
    <button type="button" class="ntb-btn" data-cmd="italic" title="Italic"><i>I</i></button>
    <button type="button" class="ntb-btn" data-cmd="underline" title="Underline"><u>U</u></button>
    <span class="ntb-sep"></span>
    <button type="button" class="ntb-btn" data-cmd="justifyLeft" title="Align Left">&#8678;</button>
    <button type="button" class="ntb-btn" data-cmd="justifyCenter" title="Center">&#8644;</button>
    <button type="button" class="ntb-btn" data-cmd="justifyRight" title="Align Right">&#8680;</button>
    <span class="ntb-sep"></span>
    <button type="button" class="ntb-btn" data-cmd="insertUnorderedList" title="Bullet list">&#8226;</button>
    <button type="button" class="ntb-btn" data-cmd="insertOrderedList" title="Numbered list">1.</button>
    <span class="ntb-sep"></span>
    <button type="button" class="ntb-btn" data-cmd="indent" title="Increase indent">&#8594;</button>
    <button type="button" class="ntb-btn" data-cmd="outdent" title="Decrease indent">&#8592;</button>
  </div>`;
}

function initNoteEditor(edBody,s2){
  if(!edBody)return null;
  edBody.contentEditable="true";
  edBody.addEventListener("input",()=>{
    s2.eCo=edBody.innerHTML;
    const st=$("edSt");if(st)st.textContent=`${edBody.innerText.length}c · ${(edBody.innerText.match(/\S+/g)||[]).length}w`;
    if(s2.eId&&s2.eId!=="new"){clearTimeout(autoSaveTmr);autoSaveTmr=setTimeout(()=>{saveItem(true);if(st)st.textContent+=" · saved"},1200)}
  });
  edBody.addEventListener("paste",e=>{
    e.preventDefault();
    const text=(e.clipboardData||window.clipboardData).getData("text/plain");
    document.execCommand("insertText",false,text);
  });
  return edBody;
}

function wireNoteToolbar(edBody){
  const bar=document.getElementById("noteToolbar");
  if(!bar||!edBody)return;
  bar.querySelectorAll(".ntb-btn").forEach(btn=>{
    btn.addEventListener("click",e=>{
      e.preventDefault();
      edBody.focus();
      const cmd=btn.dataset.cmd;
      if(cmd==="indent")document.execCommand("indent",false);
      else if(cmd==="outdent")document.execCommand("outdent",false);
      else document.execCommand(cmd,false,null);
    });
  });
}

// For render.js: notes use contenteditable, not textarea — return the body element for init
function getNoteEditorValue(edBody){return edBody?edBody.innerHTML:""}
function setNoteEditorValue(edBody,val){if(edBody)edBody.innerHTML=plainToNoteHtml(val||"")}

// ═══════ RENDER ═══════
let _uiBoostPlat="";
function rtN(n,dp,selId,expM,mode){
  const is=selId===n.id,io=expM[n.id],hk=(n.children||[]).length>0,pc=countItems(n).prompts,col=n.color||"";
  const sc=is?(mode==="k"?"sel-k":mode==="s"?"sel-s":mode==="b"?"sel-b":mode==="n"?"sel-n":mode==="i"?"sel-i":mode==="g"?"sel-g":mode==="ph"?"sel-ph":"sel"):"";
  const ac2=is?(mode==="k"?"color:var(--sk)":mode==="s"?"color:var(--sn)":mode==="b"?"color:var(--bk)":mode==="n"?"color:var(--nt)":mode==="i"?"color:var(--ip)":mode==="g"?"color:var(--gp)":mode==="ph"?"color:var(--ph)":"color:var(--ac)"):col?"color:"+col:"color:var(--mu)";
  let h=`<div class="tr ${sc}" data-id="${n.id}" style="padding-left:${5+dp*12}px"><span style="width:9px;display:flex;opacity:${hk?1:.2}">${V.ch(io)}</span><span style="display:flex;${ac2}">${V.f(io,col||undefined)}</span><span class="nm">${esc(n.name)}</span>${pc?`<span class="ct">${pc}</span>`:''}</div>`;
  if(io&&hk)for(const c of n.children)h+=rtN(c,dp+1,selId,expM,mode);return h}

function renderListsHub(){
  purge();const m=$("main");if(!m)return;
  const stats=typeof PVListsModel!=="undefined"?PVListsModel.folderStats(LS?.folders):{folders:0,files:countItems(LS?.folders||{}).prompts||0};
  const types={bulleted:0,numbered:0,checklist:0,kanban:0,sticky:0};
  (function walk(n){for(const file of n?.prompts||[])if(types[file.type]!==undefined)types[file.type]++;for(const child of n?.children||[])walk(child)})(LS?.folders);
  m.innerHTML=`<div style="padding:14px;overflow:auto;flex:1"><div style="border:1px solid var(--bl);border-left:3px solid var(--ls);border-radius:8px;background:var(--sf);padding:14px"><div style="font-size:15px;font-weight:700;color:var(--ls);margin-bottom:4px">Lists &amp; Tasks</div><div style="font-size:10px;color:var(--mu);line-height:1.5;margin-bottom:12px">An independent folder tree for numbered and bulleted lists, checklists, split-column Kanban boards, and sticky notes.</div><button class="ba" id="openLists" style="background:var(--lsd);border-color:var(--ls);color:var(--ls)">${S.expand} Open Lists &amp; Tasks</button><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:12px"><div class="ins-section"><strong>${stats.files}</strong><div style="font-size:9px;color:var(--dm)">files</div></div><div class="ins-section"><strong>${stats.folders}</strong><div style="font-size:9px;color:var(--dm)">folders</div></div>${Object.entries(types).map(([k,v])=>`<div class="ins-section"><strong>${v}</strong><div style="font-size:9px;color:var(--dm);text-transform:capitalize">${esc(k)}</div></div>`).join("")}</div><div style="font-size:9px;color:var(--dm);margin-top:10px">Kanban follows Compass: horizontally split columns, independent column scrolling, and cards that move within or across columns.</div></div></div>`;
  $("openLists")?.addEventListener("click",()=>openFullView("lists"));updTabs();rFtr();
}

function render(){
  try{
  // Set tab-aware accent color on root for all UI elements
  const _tabAcMap={prompts:'var(--ac)',imgprompts:'var(--ip)',snippets:'var(--sn)',bookmarks:'var(--bk)',notes:'var(--nt)',skills:'var(--sk)',customgpts:'var(--gp)',photos:'var(--ph)',claudecmds:'var(--cc)',lists:'var(--ls)',workspace:'var(--ws)',templates:'var(--ac)',settings:'var(--ac)'};
  document.documentElement.style.setProperty('--tab-ac',_tabAcMap[aTab]||'var(--ac)');
  $("qlDrop")?.classList.remove("open");
  if(aTab==="settings"){renderSettings();updTabs();rFtr();return}
  if(aTab==="recovery"){renderRecoveryCenter();return}
  if(aTab==="templates"){renderTemplateGallery();updTabs();rFtr();return}
  if(aTab==="workspace"){renderWorkspaceHub();return}
  if(aTab==="claudecmds"){renderClaudeCommands();return}
  if(aTab==="lists"){renderListsHub();return}
  purge();const m=$("main"),s2=st(),d2=dt();
  let snapNode=null;const snap=document.querySelector(".snap");if(snap){snapNode=snap;snapNode.remove()}
  // Lean chrome: the editor takes the whole panel; an empty silo shows only its welcome card.
  const _lean=s2.view==="edit"||(countItems(d2.folders).prompts===0&&!(d2.trash||[]).length&&s2.view!=="trash");
  // Section toolbar (search + filters + collections) is collapsible as a block.
  const _chromeHidden=!!cfg?.secChromeCollapsed;
  let h='';
  if(isK())h+=claudeToolsHeader("skills");
  if(!_lean)h+=`<div class="tree-hdr sec-chrome-hdr" id="secChromeTog" role="button" tabindex="0" aria-expanded="${_chromeHidden?'false':'true'}" title="${_chromeHidden?'Show':'Hide'} search & filters"><span class="tree-lbl">Search &amp; Filters</span><span style="color:var(--dm)">${V.ch(!_chromeHidden)}</span></div>`;
  if(typeof wsBarHtml==="function")h+=wsBarHtml();
  if(!_lean&&!_chromeHidden)h+=`<div class="srch-box"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--dm)" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" id="qIn" placeholder="Search..." value="${esc(s2.q)}"><button class="ib" id="qX" style="display:${s2.q?'flex':'none'}"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>`;

  // Platform filter bar (prompts only) — collapsible
  if(isP()&&!_lean&&!_chromeHidden){
    const hasFilter=!!pSt.platFilter;
    const platOpen=pSt.platBarOn||false;
    h+=`<div class="plat-sec"><div class="plat-hdr" id="platTog"><span class="plat-lbl">Platforms${hasFilter?' · <span style="color:var(--ac)">'+esc(getPlatName(pSt.platFilter).split("/")[0].trim())+'</span>':''}</span><span style="color:var(--dm)">${V.ch(platOpen)}</span></div>`;
    h+=`<div class="plat-body" style="display:${platOpen?'block':'none'}"><div class="plat-bar"><div class="plat-pill ${!pSt.platFilter?'active':''}" data-pf="">All</div>`;
    activePlatforms().forEach(p=>{h+=`<div class="plat-pill ${pSt.platFilter===p.id?'active':''}" data-pf="${p.id}">${p.icon} ${p.name.split("/")[0].trim()}</div>`});
    h+=`</div></div></div>`;
  }

  // Starred tag filter bar (all tabs)
  const sTags=getStarredTags();
  if(sTags.length&&!_lean&&!_chromeHidden){
    h+=`<div class="tag-bar"><div class="tag-pill ${!s2.tagFilter?'active':''}" data-tf="">All</div>`;
    sTags.forEach(t=>{h+=`<div class="tag-pill ${s2.tagFilter===t?'active':''}" data-tf="${esc(t)}"><span class="tag-star" data-unstar="${esc(t)}">${S.star}</span> ${esc(t)}</div>`});
    h+=`</div>`;
  }

  const favs=getFavorited(d2.folders),tc=(d2.trash||[]).length,ac=acC();

  // ── Custom collection pills + toolbar icons (all tabs) ──
  if(!_lean&&!_chromeHidden){
    const cd=collData();
    const cols=cd.collections||[];
    const cf=st().collFilter||"";
    h+=`<div class="coll-row">`;
    cols.forEach(col=>{
      const cnt=col.items?col.items.filter(id=>findItemGlobal(cd.folders,id)).length:0;
      const bg=col.color?TAG_COLORS.find(tc=>tc.v===col.color):null;
      const style=bg?`background:${bg.bg};color:${bg.fg};border-color:${bg.v}40`:'';
      h+=`<div class="coll-pill ${cf===col.id?'active':''}" data-coll="${col.id}" style="${cf===col.id&&bg?`background:${bg.bg};color:${bg.fg};border-color:${bg.v}`:style}">${esc(col.name)}${cnt?` <span class="coll-ct">${cnt}</span>`:''}</div>`;
    });
    h+=`<div class="coll-pill coll-add" id="collAdd">${I.plus} Collection</div>`;
    if(isB())h+=`<div class="coll-pill coll-imp" id="bkImpChr">${S.inbox} Chrome</div>`;
    // ── Toolbar icons (right side) ──
    const _ecv=ac==='p'?'--ac':ac==='i'?'--ip':ac==='s'?'--sn':ac==='b'?'--bk':ac==='n'?'--nt':ac==='k'?'--sk':ac==='g'?'--gp':ac==='ph'?'--ph':'--ac';
    h+=`<span style="flex:1"></span>`;
    h+=`<button class="bk-tb ${s2.view==='fav'?'active':''}" id="favB" title="Favorites" ${s2.view==='fav'?`style="background:color-mix(in srgb,var(${_ecv}) 12%,transparent);border-color:color-mix(in srgb,var(${_ecv}) 25%,transparent);color:var(${_ecv})"`:''}>${S.star}${favs.length?` ${favs.length}`:''}</button>`;
    if(isB()){
      h+=`<button class="bk-tb" id="bkCurB" title="Bookmark This Page">${S.pin}</button>`;
    }
    h+=`<button class="bk-tb ${s2.view==='trash'?'active':''}" id="trB" title="Trash" ${s2.view==='trash'?`style="background:color-mix(in srgb,var(${_ecv}) 12%,transparent);border-color:color-mix(in srgb,var(${_ecv}) 25%,transparent);color:var(${_ecv})"`:''}>${I.trash}${tc?` ${tc}`:''}</button>`;
    if(isP())h+=`<button class="bk-tb ${s2.view==='chains'?'active':''}" id="chainsB" title="Prompt chains" ${s2.view==='chains'?`style="background:color-mix(in srgb,var(${_ecv}) 12%,transparent);border-color:color-mix(in srgb,var(${_ecv}) 25%,transparent);color:var(${_ecv})"`:''}>${S.arrow} Chains</button>`;
    h+=`<button class="bk-tb" id="expFB" title="Export">${I.dl}</button>`;
    h+=`<span class="bk-tb-sep"></span>`;
    h+=`<button class="bk-tb expand-btn" id="fullViewBtn" title="Open expanded view" style="background:color-mix(in srgb,var(${_ecv}) 12%,transparent);border-color:color-mix(in srgb,var(${_ecv}) 25%,transparent);color:var(${_ecv});font-weight:600;padding:2px 8px;letter-spacing:.2px">${S.expand} Expand</button>`;
    h+=`</div>`;
  }

  // ═══════ BOOKMARKS: Section Panels (mosaic) ═══════
  if(isB()&&!_lean){
    const sp=BM.sectionPanels||[];
    const spOn=bSt._spOn!==undefined?bSt._spOn:sp.length>0;
    h+=`<div class="sp-inline"><div class="sp-inline-hdr" id="spTog"><span class="sp-inline-lbl">${S.panels} Panels${sp.length?' '+S.bullet+' '+sp.length:''}</span><span style="color:var(--dm)">${V.ch(spOn)}</span></div>`;
    h+=`<div class="sp-inline-body" id="spBody" style="display:${spOn?'block':'none'}">`;
    sp.forEach((panel,pi)=>{
      const pExp=bSt._spExp?bSt._spExp[panel.id]:true;
      const clusters=panel.clusters||[];
      const totalItems=clusters.reduce((s,c)=>(c.items||[]).length+s,0);
      const dispMode=normalizeBookmarkPanelMode(panel.mode);
      h+=`<div class="sp-panel" data-sp="${panel.id}" draggable="true" data-sp-drag-panel="${panel.id}"><div class="sp-phdr" data-sp-tog="${panel.id}"><span class="sp-grip">${I.grip}</span><span class="sp-pmode">${dispMode==="favicon"?S.fav:dispMode==="link"?S.link:S.cap}</span><span class="sp-pname">${esc(panel.name)}</span><span class="sp-pct">${totalItems}</span><span class="sp-pch">${V.ch(pExp!==false)}</span></div>`;
      if(pExp!==false){
        h+=`<div class="sp-pbody" data-sp-body="${panel.id}">`;
        if(!clusters.length){
          h+=`<div class="sp-empty">Drag bookmarks here or right-click → Pin</div>`;
        }else{
          const mode=dispMode;
          clusters.forEach(cl=>{
            const hasItems=(cl.items||[]).filter(si=>findItemGlobal(BM.folders,si.id)).length>0;
            const clColor=cl.color||'';
            // Vibrant color: 38% bg opacity — zones should pop as colored regions
            const clBg=clColor?`background:${clColor}60;border-radius:5px`:'';
            const emptyClass=!hasItems?' sp-cluster-empty':'';
            h+=`<div class="sp-cluster${clColor?' sp-cluster-colored':''}${emptyClass}" draggable="true" data-sp-cl="${cl.id}" data-sp-panel="${panel.id}" data-sp-drag-cl="${cl.id}" style="${clBg}">`;
            const showHdr=cl.label&&cl.label.trim();
            if(showHdr){
              h+=`<div class="sp-cl-hdr"><span class="sp-cl-grip">${I.grip}</span>`;
              h+=`<span class="sp-cl-label" style="${clColor?`color:${clColor}`:'color:var(--dm)'}">${esc(cl.label)}</span>`;
              h+=`</div>`;
            }
            if(hasItems){
              h+=`<div class="sp-cl-items sp-mode-${mode}">`;
              (cl.items||[]).forEach((si,idx)=>{
                const bm=findItemGlobal(BM.folders,si.id);
                if(!bm)return;
                if(mode==='favicon'){
                  h+=`<div class="sp-fav" draggable="true" title="${esc(bm.title||domain(bm.url||''))}" data-sp-open="${esc(bm.url||'')}" data-sp-item="${si.id}" data-sp-cl="${cl.id}" data-sp-panel="${panel.id}" data-sp-idx="${idx}">${favicon(bm.url,20)}</div>`;
                }else if(mode==='link'){
                  h+=`<div class="sp-link" draggable="true" data-sp-open="${esc(bm.url||'')}" data-sp-item="${si.id}" data-sp-cl="${cl.id}" data-sp-panel="${panel.id}" data-sp-idx="${idx}"><span style="display:flex;align-items:center;flex-shrink:0">${favicon(bm.url,14)}</span><span class="sp-link-url">${esc(bm.title||domain(bm.url||''))}</span></div>`;
                }else{
                  h+=`<div class="sp-cap" draggable="true" data-sp-open="${esc(bm.url||'')}" data-sp-item="${si.id}" data-sp-cl="${cl.id}" data-sp-panel="${panel.id}" data-sp-idx="${idx}">${favicon(bm.url,16)}<span class="sp-cap-label">${esc(bm.title||domain(bm.url||''))}</span></div>`;
                }
              });
              h+=`</div>`;
            }else{
              h+=`<div class="sp-cl-empty-hint">Drop bookmarks here</div>`;
            }
            h+=`</div>`;
          });
        }
        h+=`<div class="sp-cl-add" data-sp-addcl="${panel.id}">+ Add Color Zone</div>`;
        h+=`</div>`;
      }
      h+=`</div>`;
    });
    if(sp.length<10){
      h+=`<div class="sp-add" id="spAddBtn">+ New Section Panel</div>`;
    }
    h+=`</div></div>`;
  }

  // ═══════ NON-BOOKMARKS: Quick Access + Tools now in collection row above ═══════

  if(!_lean){
  const _wsTree=(typeof wsVirtualTree==="function"?wsVirtualTree(d2.folders):null)||d2.folders;
  h+=`<div class="tree-sec"><div class="tree-hdr" id="tTog"><span class="tree-lbl">Folders</span><span style="display:flex;align-items:center;gap:4px"><span style="color:var(--dm)">${V.ch(s2.treeOn)}</span></span></div>`;
  h+=`<div class="tree-list" id="tList" style="display:${s2.treeOn?'':'none'}">${rtN(_wsTree,0,s2.sel,s2.exp,ac)}</div>`;
  h+=`<div class="tree-acts" id="tActs"></div><div class="color-row" id="cRow" style="display:none"></div></div>`;
  }
  h+=`<div id="chmBar"></div><div class="scroll" id="cArea"></div>`;
  m.innerHTML=h;
  if(snapNode)m.appendChild(snapNode);
  wireClaudeToolsHeader(m);
  wireAll();rTActs();rContent();rFtr();updTabs();
  }catch(e){console.error("[PV] Render error:",e);showErrorPanel(e)}
}

function wireAll(){
  const s2=st(),d2=dt();
  $("tList")?.querySelectorAll(".tr").forEach(r=>{const id=r.dataset.id;
    r.addEventListener("click",()=>{s2.sel=id;s2.view="list";s2.q="";s2.collFilter="";const n=findFolder(d2.folders,id);if(n&&(n.children||[]).length)s2.exp[id]=!s2.exp[id];render()});
    r.addEventListener("contextmenu",e=>{const f=findFolder(d2.folders,id);if(!f)return;
      const items=[{a:"add",l:"New Subfolder",ic:I.plus,fn:()=>{s2.sel=id;s2.exp[id]=1;addFolder()}},{a:"rn",l:"Rename",ic:I.edit,fn:()=>rnMd(id,f.name)},{a:"co",l:"Color",ic:I.pal,fn:()=>{s2.colOn=1;s2.sel=id;render()}},{a:"ws",l:"Workspace…",ic:S.grid,fn:()=>wsAssignFolderMd(id)}];
      if(isPh())items.push({sep:1},{a:"slide",l:"Start folder slideshow",ic:S.frame,fn:()=>pvStartFolderSlideshow(id)},{a:"report",l:"Print / export photo report…",ic:I.dl,fn:()=>pvOpenPhotoReportForFolder(id)});
      if(PV_QUICK_FOLDER_SILOS[aTab]){
        const marked=pvQuickFolderIsMarked(aTab,id);
        items.push({a:"quick",l:marked?"Remove from Quick Access":"Mark for Quick Access",ic:marked?S.star:S.starEmpty,fn:()=>{const on=pvQuickFolderToggle(aTab,id);flash(on?"Folder added to Quick Access":"Folder removed from Quick Access");render()}});
      }
      if(id!==rId())items.push({sep:1},{a:"dl",l:"Delete",ic:I.trash,cls:"dng",fn:()=>delMd("folder",id,f.name)});showContextMenu(e,items)});
    r.draggable=true;
    r.addEventListener("dragstart",e=>{e.dataTransfer.setData("fid",id)});
    r.addEventListener("dragover",e=>{
      e.preventDefault();
      const rect=r.getBoundingClientRect();
      const y=e.clientY-rect.top;
      const pct=y/rect.height;
      r.classList.remove("dov","dov-above","dov-below");
      if(pct<0.25)r.classList.add("dov-above");
      else if(pct>0.75)r.classList.add("dov-below");
      else r.classList.add("dov");
      r.dataset.dropPos=pct<0.25?"above":pct>0.75?"below":"inside";
    });
    r.addEventListener("dragleave",()=>{r.classList.remove("dov","dov-above","dov-below");delete r.dataset.dropPos});
    r.addEventListener("drop",e=>{e.preventDefault();const pos=r.dataset.dropPos||"inside";r.classList.remove("dov","dov-above","dov-below");delete r.dataset.dropPos;handleDrop(e,id,pos)})});
  $("favB")?.addEventListener("click",()=>{s2.view=s2.view==="fav"?"list":"fav";s2.q="";render()});
  $("trB")?.addEventListener("click",()=>{s2.view=s2.view==="trash"?"list":"trash";s2.q="";render()});
  $("chainsB")?.addEventListener("click",()=>{s2.view=s2.view==="chains"?"list":"chains";s2.q="";pSt._chainSel="";render()});
  $("toolsTog")?.addEventListener("click",()=>{s2.toolsOn=!s2.toolsOn;render()});
  $("utilTog")?.addEventListener("click",()=>{
    if(isB()){bSt._bkToolsOn=!bSt._bkToolsOn}else{st()._toolsUtilOn=!st()._toolsUtilOn}
    render();
  });
  $("tTog")?.addEventListener("click",e=>{if(e.target.closest("#fullViewBtn"))return;s2.treeOn=!s2.treeOn;render()});
  const _secTogFire=()=>{cfg.secChromeCollapsed=!cfg.secChromeCollapsed;save();render()};
  $("secChromeTog")?.addEventListener("click",_secTogFire);
  $("secChromeTog")?.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();_secTogFire()}});
  if(typeof wireWsBar==="function")wireWsBar();
  $("fullViewBtn")?.addEventListener("click",e=>{e.stopPropagation();openFullView(isP()?"prompts":isI()?"imgprompts":isS()?"clips":isB()?"bookmarks":isN()?"notes":isK()?"skills":isG()?"customgpts":isPh()?"photos":"prompts")});
  $("expFB")?.addEventListener("click",showExpMd);
  const _debouncedSearch=debounce(()=>render(),150);
  $("qIn")?.addEventListener("input",e=>{s2.q=e.target.value;const qx=$("qX");if(qx)qx.style.display=s2.q?"flex":"none";if(!s2.q){s2.view="list";render()}else{s2.collFilter="";_debouncedSearch()}});
  $("qX")?.addEventListener("click",()=>{s2.q="";s2.view="list";render()});
  // Platform filter
  $("platTog")?.addEventListener("click",()=>{pSt.platBarOn=!pSt.platBarOn;render()});
  document.querySelectorAll("[data-pf]").forEach(el=>{el.addEventListener("click",()=>{pSt.platFilter=el.dataset.pf;render()})});
  // Tag filter
  document.querySelectorAll("[data-tf]").forEach(el=>{el.addEventListener("click",e=>{if(e.target.closest("[data-unstar]"))return;s2.tagFilter=el.dataset.tf;render()})});
  document.querySelectorAll("[data-unstar]").forEach(el=>{el.addEventListener("click",e=>{e.stopPropagation();toggleStarTag(el.dataset.unstar);s2.tagFilter="";render()})});
  // ── Collection pills (all tabs) ──
  document.querySelectorAll("[data-coll]").forEach(el=>{
    el.addEventListener("click",()=>{const cf=el.dataset.coll;const s=st();s.collFilter=s.collFilter===cf?"":cf;render()});
    el.addEventListener("contextmenu",e=>{e.preventDefault();const col=(collData().collections||[]).find(c=>c.id===el.dataset.coll);if(!col)return;
      showContextMenu(e,[{a:"rn",l:"Rename",ic:I.edit,fn:()=>collRenameMd(col)},{a:"co",l:"Color",ic:I.pal,fn:()=>collColorMd(col)},{sep:1},{a:"dl",l:"Delete",ic:I.trash,cls:"dng",fn:()=>collDeleteMd(col)}])})
  });
  $("collAdd")?.addEventListener("click",collCreateMd);
  // Bookmark this page — FIXED: use proper callback
  $("bkCurB")?.addEventListener("click",()=>{
    chrome.runtime.sendMessage({type:"GET_ACTIVE_TAB"},tab=>{
      if(chrome.runtime.lastError){flash("Cannot access tab");return}
      if(tab&&tab.url)showCapture("bookmark","",tab.url,tab.title);
      else flash("No active page found");
    });
  });
  // ── Section Panel wiring ──
  $("spTog")?.addEventListener("click",()=>{const _spCur=bSt._spOn!==undefined?bSt._spOn:(BM.sectionPanels||[]).length>0;bSt._spOn=!_spCur;render()});
  $("spAddBtn")?.addEventListener("click",()=>spCreatePanel());
  document.querySelectorAll("[data-sp-tog]").forEach(el=>{el.addEventListener("click",()=>{
    if(!bSt._spExp)bSt._spExp={};
    const pid=el.dataset.spTog;
    bSt._spExp[pid]=bSt._spExp[pid]===false;
    render();
  })});
  // Right-click on panel header
  document.querySelectorAll("[data-sp-tog]").forEach(el=>{el.addEventListener("contextmenu",e=>{
    const pid=el.dataset.spTog;
    const panel=(BM.sectionPanels||[]).find(x=>x.id===pid);if(!panel)return;
    showContextMenu(e,[
      {a:"rn",l:"Rename",ic:I.edit,fn:()=>spRenamePanel(pid)},
      {a:"cl",l:"Add Color Zone",ic:I.plus,fn:()=>spCreateCluster(pid)},
      {sep:1},
      {a:"dl",l:"Delete Panel",ic:I.trash,cls:"dng",fn:()=>spDeletePanel(pid)}
    ]);
  })});
  // Right-click on cluster zone
  document.querySelectorAll(".sp-cluster").forEach(el=>{el.addEventListener("contextmenu",e=>{
    if(e.target.closest("[data-sp-item]"))return; // let item context menu handle
    const clId=el.dataset.spCl;const panelId=el.dataset.spPanel;
    const panel=(BM.sectionPanels||[]).find(x=>x.id===panelId);if(!panel)return;
    const cluster=(panel.clusters||[]).find(c=>c.id===clId);if(!cluster)return;
    showContextMenu(e,[
      {a:"rn",l:"Rename Zone",ic:I.edit,fn:()=>spRenameCluster(panelId,clId)},
      {a:"co",l:"Zone Color",ic:I.pal,fn:()=>spColorCluster(panelId,clId)},
      {sep:1},
      {a:"dl",l:"Delete Zone",ic:I.trash,cls:"dng",fn:()=>spDeleteCluster(panelId,clId)}
    ]);
  })});
  // Add cluster buttons
  document.querySelectorAll("[data-sp-addcl]").forEach(el=>{el.addEventListener("click",()=>spCreateCluster(el.dataset.spAddcl))});
  // Click to open URLs
  document.querySelectorAll("[data-sp-open]").forEach(el=>{el.addEventListener("click",e=>{if(e.target.closest(".sp-cl-add"))return;const url=el.dataset.spOpen;if(url)openUrl(url)})});
  // Right-click on section panel items
  document.querySelectorAll("[data-sp-item]").forEach(el=>{el.addEventListener("contextmenu",e=>{
    e.preventDefault();e.stopPropagation();
    const itemId=el.dataset.spItem;const clId=el.dataset.spCl;const panelId=el.dataset.spPanel;
    if(!panelId||!clId||!itemId)return;
    const panel=(BM.sectionPanels||[]).find(x=>x.id===panelId);if(!panel)return;
    const otherClusters=(panel.clusters||[]).filter(c=>c.id!==clId);
    const items=[
      {a:"opn",l:"Open in New Tab",ic:I.open,fn:()=>{const url=el.dataset.spOpen;if(url)openUrl(url)}},
      {a:"opnw",l:"Open in New Window",ic:I.open,fn:()=>{const url=el.dataset.spOpen;if(url)openUrlWindow(url)}},
      {a:"co",l:"Change Color",ic:I.pal,fn:()=>spItemColor(panelId,clId,itemId)}
    ];
    if(otherClusters.length)items.push({a:"mv",l:"Move to Zone...",ic:I.move,fn:()=>spMoveItem(panelId,clId,itemId)});
    items.push({sep:1},{a:"up",l:"Unpin",ic:I.trash,cls:"dng",fn:()=>{
      const cl2=(panel.clusters||[]).find(c=>c.id===clId);
      if(cl2){cl2.items=(cl2.items||[]).filter(x=>x.id!==itemId);save();render()}
    }});
    showContextMenu(e,items);
  })});
  // Drag-to-reorder within panels (item-level)
  document.querySelectorAll("[data-sp-item]").forEach(el=>{
    el.addEventListener("dragstart",e=>{
      e.stopPropagation(); // prevent cluster/panel drag handlers from firing
      e.dataTransfer.setData("sp-item",el.dataset.spItem);
      e.dataTransfer.setData("sp-cl",el.dataset.spCl);
      e.dataTransfer.setData("sp-panel",el.dataset.spPanel);
      e.dataTransfer.effectAllowed="move";
      el.classList.add("sp-dragging");
    });
    el.addEventListener("dragend",()=>{el.classList.remove("sp-dragging");document.querySelectorAll(".sp-drag-over").forEach(x=>x.classList.remove("sp-drag-over"))});
    el.addEventListener("dragover",e=>{
      e.preventDefault();
      const srcPanel=e.dataTransfer.types.includes("sp-panel");
      const srcPid=e.dataTransfer.types.includes("pid"); // bookmark card drag
      if(!srcPanel&&!srcPid)return;
      el.classList.add("sp-drag-over");
    });
    el.addEventListener("dragleave",()=>{el.classList.remove("sp-drag-over")});
    el.addEventListener("drop",e=>{
      e.preventDefault();e.stopPropagation();
      el.classList.remove("sp-drag-over");
      const srcItemId=e.dataTransfer.getData("sp-item");
      const srcClId=e.dataTransfer.getData("sp-cl");
      const srcPanelId=e.dataTransfer.getData("sp-panel");
      const tgtItemId=el.dataset.spItem;
      const tgtClId=el.dataset.spCl;
      const tgtPanelId=el.dataset.spPanel;
      // Reorder within same panel
      if(srcPanelId===tgtPanelId&&srcItemId&&srcItemId!==tgtItemId){
        const panel=(BM.sectionPanels||[]).find(x=>x.id===tgtPanelId);if(!panel)return;
        const srcCl=(panel.clusters||[]).find(c=>c.id===srcClId);
        const tgtCl=(panel.clusters||[]).find(c=>c.id===tgtClId);
        if(!srcCl||!tgtCl)return;
        // Remove from source
        const srcIdx=(srcCl.items||[]).findIndex(x=>x.id===srcItemId);
        if(srcIdx<0)return;
        const[moved]=srcCl.items.splice(srcIdx,1);
        // Insert at target position
        const tgtIdx=(tgtCl.items||[]).findIndex(x=>x.id===tgtItemId);
        tgtCl.items.splice(tgtIdx>=0?tgtIdx:tgtCl.items.length,0,moved);
        save();render();
      }
      // External bookmark card dropped onto an item
      const extPid=e.dataTransfer.getData("pid");
      if(extPid&&tgtPanelId){
        spPinToCluster(tgtPanelId,tgtClId,extPid);
      }
    });
  });
  // Drop zones on panel body and clusters for pinning bookmarks + URL drops
  document.querySelectorAll("[data-sp-body]").forEach(el=>{
    el.addEventListener("dragover",e=>{
      // Don't show drop indicator for panel/cluster reorder drags
      if(e.dataTransfer.types.includes("sp-reorder-panel")||e.dataTransfer.types.includes("sp-reorder-cl"))return;
      e.preventDefault();el.closest(".sp-panel")?.classList.add("sp-drop")});
    el.addEventListener("dragleave",e=>{if(!el.contains(e.relatedTarget))el.closest(".sp-panel")?.classList.remove("sp-drop")});
    el.addEventListener("drop",e=>{
      e.preventDefault();e.stopPropagation();
      el.closest(".sp-panel")?.classList.remove("sp-drop");
      const panelId=el.dataset.spBody;
      const panel=(BM.sectionPanels||[]).find(x=>x.id===panelId);
      if(!panel)return;
      if(!panel.clusters||!panel.clusters.length){
        panel.clusters=[{id:"cl_"+Date.now(),label:"",color:"",items:[]}];
      }
      // Internal bookmark card drag
      const pid=e.dataTransfer.getData("pid");
      if(pid){spPinToCluster(panelId,panel.clusters[0].id,pid);return}
      // External URL drop (address bar, other sources)
      const url=e.dataTransfer.getData("text/uri-list")||e.dataTransfer.getData("text/plain")||"";
      if(url&&url.match(/^https?:\/\//)){
        const bk=createBookmarkFromUrl(url);
        if(bk)spPinToCluster(panelId,panel.clusters[0].id,bk.id);
      }
    });
  });

  // ── Panel reorder: drag panels to change order ──
  document.querySelectorAll("[data-sp-drag-panel]").forEach(el=>{
    el.addEventListener("dragstart",e=>{
      // Only fire panel drag from header area — items/clusters handle their own drags via stopPropagation
      if(e.target.closest("[data-sp-item]")||e.target.closest("[data-sp-drag-cl]"))return;
      e.dataTransfer.setData("sp-reorder-panel",el.dataset.spDragPanel);
      e.dataTransfer.effectAllowed="move";
      el.classList.add("sp-panel-dragging");
    });
    el.addEventListener("dragend",()=>{el.classList.remove("sp-panel-dragging");document.querySelectorAll(".sp-panel-drop-above,.sp-panel-drop-below").forEach(x=>x.classList.remove("sp-panel-drop-above","sp-panel-drop-below"))});
    el.addEventListener("dragover",e=>{
      if(!e.dataTransfer.types.includes("sp-reorder-panel"))return;
      e.preventDefault();
      const rect=el.getBoundingClientRect();
      const pct=(e.clientY-rect.top)/rect.height;
      el.classList.remove("sp-panel-drop-above","sp-panel-drop-below");
      el.classList.add(pct<0.5?"sp-panel-drop-above":"sp-panel-drop-below");
    });
    el.addEventListener("dragleave",()=>{el.classList.remove("sp-panel-drop-above","sp-panel-drop-below")});
    el.addEventListener("drop",e=>{
      const srcId=e.dataTransfer.getData("sp-reorder-panel");
      if(!srcId)return;
      e.preventDefault();e.stopPropagation();
      el.classList.remove("sp-panel-drop-above","sp-panel-drop-below");
      const tgtId=el.dataset.spDragPanel;
      if(srcId===tgtId)return;
      const sp=BM.sectionPanels||[];
      const srcIdx=sp.findIndex(x=>x.id===srcId);
      const tgtIdx=sp.findIndex(x=>x.id===tgtId);
      if(srcIdx<0||tgtIdx<0)return;
      const rect=el.getBoundingClientRect();
      const pct=(e.clientY-rect.top)/rect.height;
      const[moved]=sp.splice(srcIdx,1);
      let insertAt=sp.findIndex(x=>x.id===tgtId);
      if(insertAt<0)insertAt=sp.length;
      else if(pct>=0.5)insertAt++;
      sp.splice(insertAt,0,moved);
      save();render();
    });
  });

  // ── Cluster reorder: drag clusters to change order within a panel ──
  document.querySelectorAll("[data-sp-drag-cl]").forEach(el=>{
    el.addEventListener("dragstart",e=>{
      // Only fire cluster drag from the cluster itself, not from items inside
      if(e.target.closest("[data-sp-item]"))return;
      e.stopPropagation(); // prevent panel drag from firing
      e.dataTransfer.setData("sp-reorder-cl",el.dataset.spDragCl);
      e.dataTransfer.setData("sp-reorder-cl-panel",el.dataset.spPanel);
      e.dataTransfer.effectAllowed="move";
      el.classList.add("sp-cluster-dragging");
    });
    el.addEventListener("dragend",()=>{el.classList.remove("sp-cluster-dragging");document.querySelectorAll(".sp-cluster-drop-above,.sp-cluster-drop-below").forEach(x=>x.classList.remove("sp-cluster-drop-above","sp-cluster-drop-below"))});
    el.addEventListener("dragover",e=>{
      // Accept cluster reorder drags AND bookmark drops onto empty clusters
      const isClDrag=e.dataTransfer.types.includes("sp-reorder-cl");
      const isPidDrag=e.dataTransfer.types.includes("pid");
      const isItemDrag=e.dataTransfer.types.includes("sp-item");
      if(!isClDrag&&!isPidDrag&&!isItemDrag)return;
      e.preventDefault();
      if(isClDrag){
        e.stopPropagation(); // prevent panel body drop zone from highlighting
        const rect=el.getBoundingClientRect();
        const pct=(e.clientY-rect.top)/rect.height;
        el.classList.remove("sp-cluster-drop-above","sp-cluster-drop-below");
        el.classList.add(pct<0.5?"sp-cluster-drop-above":"sp-cluster-drop-below");
      }else{
        el.classList.add("sp-drag-over");
      }
    });
    el.addEventListener("dragleave",e=>{if(!el.contains(e.relatedTarget)){el.classList.remove("sp-cluster-drop-above","sp-cluster-drop-below","sp-drag-over")}});
    el.addEventListener("drop",e=>{
      el.classList.remove("sp-cluster-drop-above","sp-cluster-drop-below","sp-drag-over");
      // Cluster reorder
      const srcClId=e.dataTransfer.getData("sp-reorder-cl");
      const srcPanelId=e.dataTransfer.getData("sp-reorder-cl-panel");
      if(srcClId&&srcPanelId){
        e.preventDefault();e.stopPropagation();
        const tgtClId=el.dataset.spDragCl;
        const tgtPanelId=el.dataset.spPanel;
        if(srcPanelId!==tgtPanelId||srcClId===tgtClId)return;
        const panel=(BM.sectionPanels||[]).find(x=>x.id===tgtPanelId);if(!panel)return;
        const cls=panel.clusters||[];
        const srcIdx=cls.findIndex(x=>x.id===srcClId);
        const tgtIdx=cls.findIndex(x=>x.id===tgtClId);
        if(srcIdx<0||tgtIdx<0)return;
        const rect=el.getBoundingClientRect();
        const pct=(e.clientY-rect.top)/rect.height;
        const[moved]=cls.splice(srcIdx,1);
        let insertAt=cls.findIndex(x=>x.id===tgtClId);
        if(insertAt<0)insertAt=cls.length;
        else if(pct>=0.5)insertAt++;
        cls.splice(insertAt,0,moved);
        save();render();
        return;
      }
      // Bookmark card dropped onto an empty cluster — pin to this cluster
      const pid=e.dataTransfer.getData("pid");
      if(pid){
        e.preventDefault();e.stopPropagation();
        const panelId=el.dataset.spPanel;const clId=el.dataset.spDragCl;
        if(panelId&&clId)spPinToCluster(panelId,clId,pid);
        return;
      }
      // Item dropped onto empty cluster — move to this cluster
      const itemId=e.dataTransfer.getData("sp-item");
      const itemSrcCl=e.dataTransfer.getData("sp-cl");
      const itemSrcPanel=e.dataTransfer.getData("sp-panel");
      if(itemId&&itemSrcPanel===el.dataset.spPanel){
        e.preventDefault();e.stopPropagation();
        const panelId=el.dataset.spPanel;const tgtClId=el.dataset.spDragCl;
        const panel=(BM.sectionPanels||[]).find(x=>x.id===panelId);if(!panel)return;
        const srcCl=(panel.clusters||[]).find(c=>c.id===itemSrcCl);
        const tgtCl=(panel.clusters||[]).find(c=>c.id===tgtClId);
        if(!srcCl||!tgtCl||itemSrcCl===tgtClId)return;
        const srcIdx=(srcCl.items||[]).findIndex(x=>x.id===itemId);
        if(srcIdx<0)return;
        const[moved]=srcCl.items.splice(srcIdx,1);
        tgtCl.items=tgtCl.items||[];tgtCl.items.push(moved);
        save();render();
      }
    });
  });

  // External image/URL/text drops are handled globally by the drag-capture
  // overlay (src/drop-capture.js): image → Photos, text → Note/Clip, link →
  // Bookmark — from any section. Section-panel pin drops keep their own handler.

  // Import Chrome Bookmarks (direct API)
  $("bkImpChr")?.addEventListener("click",()=>{
    if(!chrome.bookmarks){flash("Bookmarks API not available");return}
    showModal(`<h3>Import Chrome Bookmarks</h3><p>This will pull your Chrome bookmarks directly into the Marks tab, preserving folder structure.</p><p style="font-size:10px;color:var(--dm)">Duplicates will be skipped. Chrome internal folders (Bookmarks Bar, Other, Mobile) merge into your root.</p><div class="brow"><button class="bg-btn" id="icX">Cancel</button><button class="bp" id="icY">Import</button></div>`,mc=>{
      mc.querySelector("#icX").addEventListener("click",closeModal);
      mc.querySelector("#icY").addEventListener("click",()=>{closeModal();doDirectChromeImport()})
    });
  });
  wireKeyboard();
}

let _renderIndexes=null;
function buildRenderIndexes(){
  const promptById=new Map(allItemsCached(P.folders).map(p=>[p.id,p]));
  const clipCountByPromptId=new Map();
  allItemsCached(SN.folders).forEach(clip=>{
    if(!clip.linkedPromptId)return;
    clipCountByPromptId.set(clip.linkedPromptId,(clipCountByPromptId.get(clip.linkedPromptId)||0)+1);
  });
  return{promptById,clipCountByPromptId};
}

let _kbdHandler=null;
function wireKeyboard(){
  if(_kbdHandler)document.removeEventListener("keydown",_kbdHandler);
  _kbdHandler=e=>{
    if(e.target.matches("input,textarea,select,[contenteditable]"))return;
    if($("modalC")?.innerHTML)return;
    const cards=document.querySelectorAll("#iList .pc, #iList .pc-compact, #fL .pc, #fL .pc-compact, #sL .pc, #sL .pc-compact, #clL .pc, #clL .pc-compact");
    if(!cards.length&&!["Escape","/"].includes(e.key))return;
    const s2=st();
    if(s2._kbdIdx==null)s2._kbdIdx=0;
    const setKbd=idx=>{
      s2._kbdIdx=Math.max(0,Math.min(idx,cards.length-1));
      cards.forEach((c,i)=>{c.classList.toggle("kbd-sel",i===s2._kbdIdx)});
      cards[s2._kbdIdx]?.scrollIntoView({behavior:"smooth",block:"nearest"});
    };
    if(e.key==="ArrowDown"||e.key==="j"){e.preventDefault();setKbd((s2._kbdIdx||0)+1)}
    else if(e.key==="ArrowUp"||e.key==="k"){e.preventDefault();setKbd((s2._kbdIdx||0)-1)}
    else if(e.key==="Enter"&&cards[s2._kbdIdx]){e.preventDefault();const pid=cards[s2._kbdIdx].dataset?.pid;if(pid){const p=allItemsCached(dt().folders).find(x=>x.id===pid);if(p){s2.sel=p.folderId||s2.sel;openItem(p);render()}}}
    else if(e.key==="Escape"){e.preventDefault();if(s2.view==="edit"){s2.view="list";s2.eId=null;render()}else if(s2.q){s2.q="";s2.view="list";render()}else{s2._kbdIdx=0;cards.forEach(c=>c.classList.remove("kbd-sel"))}}
    else if(e.key==="/"){e.preventDefault();$("qIn")?.focus()}
    else if(e.key==="i"&&cards[s2._kbdIdx]){const pid=cards[s2._kbdIdx].dataset?.pid;if(pid){const fid=cards[s2._kbdIdx].dataset?.psrc||s2.sel;const p=allItemsCached(dt().folders).find(x=>x.id===pid);if(p)handleUse(fid,p,"inject")}}
    else if(e.key==="c"&&cards[s2._kbdIdx]){const pid=cards[s2._kbdIdx].dataset?.pid;if(pid){const fid=cards[s2._kbdIdx].dataset?.psrc||s2.sel;const p=allItemsCached(dt().folders).find(x=>x.id===pid);if(p)handleUse(fid,p,"copy")}}
  };
  document.addEventListener("keydown",_kbdHandler);
}

function rTActs(){
  const c=$("tActs"),s2=st(),d2=dt(),ac=acC();
  if(!c)return;
  const onRoot=s2.sel===rId();
  let h=`<button class="bs ${ac==='k'?'sk':ac==='s'?'sn':ac==='b'?'bk':ac==='n'?'nt':ac==='ph'?'ph':''}" id="addF" style="flex:1" title="${onRoot?'Add folder at root':'Add subfolder under selected'}">${I.plus} Folder</button>`;
  if(!onRoot)h+=`<button class="bs" id="addTopF" title="Add a top-level folder at root">${I.plus} Top</button>`;
  if(!onRoot)h+=`<button class="bs" id="colF">${I.pal}</button><button class="bs" id="rnF">${I.edit}</button><button class="bs dng" id="delF">${I.trash}</button>`;
  c.innerHTML=h;
  $("addF")?.addEventListener("click",addFolder);
  $("addTopF")?.addEventListener("click",addTopFolder);
  $("colF")?.addEventListener("click",()=>{s2.colOn=!s2.colOn;rColRow()});
  $("rnF")?.addEventListener("click",()=>{const f=findFolder(d2.folders,s2.sel);if(f)rnMd(s2.sel,f.name)});
  $("delF")?.addEventListener("click",()=>{const f=findFolder(d2.folders,s2.sel);if(f)delMd("folder",s2.sel,f.name)});
  rColRow();
}

function rColRow(){const r=$("cRow"),s2=st(),d2=dt();if(!r)return;if(!s2.colOn||s2.sel===rId()){r.style.display="none";return}
  r.style.display="flex";const f=findFolder(d2.folders,s2.sel);
  r.innerHTML=COLORS.map(c=>`<div class="color-dot ${(f?.color||"")===c.v?'sel':''}" data-c="${c.v}" title="${c.n}" style="background:${c.v||'var(--sf)'}"></div>`).join("");
  r.querySelectorAll(".color-dot").forEach(dot=>{dot.addEventListener("click",()=>{pushUndo();if(f){f.color=dot.dataset.c;save();s2.colOn=0;render()}})})}

function updTabs(){
  const _tc=(id,cls)=>{const el=$(id);if(el)el.className=cls};
  _tc("tabP","tab "+(aTab==="prompts"?"t-p":""));
  _tc("tabS","tab "+(aTab==="snippets"?"t-s":""));
  _tc("tabB","tab "+(aTab==="bookmarks"?"t-b":""));
  _tc("tabN","tab "+(aTab==="notes"?"t-n":""));
  _tc("tabK","tab "+(aTab==="skills"?"t-k":""));
  _tc("tabG","tab "+(aTab==="customgpts"?"t-g":""));
  _tc("tabI","tab "+(aTab==="imgprompts"?"t-i":""));
  _tc("tabPH","tab "+(aTab==="photos"?"t-ph":""));
  _tc("tabCC","tab "+(aTab==="claudecmds"?"t-cc":""));
  _tc("tabLS","tab "+(aTab==="lists"?"t-ls":""));
  _tc("tabW","tab "+(aTab==="workspace"?"t-w":""));
  ["primaryFind","primarySave","primaryOrganize","primaryRecover"].forEach(id=>$(id)?.classList.remove("active"));
  if(aTab==="workspace")$("primaryOrganize")?.classList.add("active");else if(aTab==="recovery")$("primaryRecover")?.classList.add("active");
  const _tt=(id,v)=>{const el=$(id);if(el)el.textContent=v};
  _tt("tPC",countItems(P.folders).prompts||"");
  _tt("tSC",countItems(SN.folders).prompts||"");
  _tt("tBC",countItems(BM.folders).prompts||"");
  _tt("tNC",countItems(NT.folders).prompts||"");
  _tt("tKC",countItems(KL.folders).prompts||"");
  _tt("tGC",countItems(GP.folders).prompts||"");
  _tt("tIC",countItems(IP.folders).prompts||"");
  _tt("tPHC",countItems(PH.folders).prompts||"");
  _tt("tCC",(typeof pvCcFlat==="function"?pvCcFlat().length:0)||"");
  _tt("tLSC",LS?.folders?countItems(LS.folders).prompts||"":"");
}

function rFtr(){const p=countItems(P.folders),s=countItems(SN.folders),b=countItems(BM.folders),n=countItems(NT.folders),k=countItems(KL.folders),g=countItems(GP.folders),ip=countItems(IP.folders),phc=countItems(PH.folders),lsc=LS?.folders?countItems(LS.folders):{prompts:0};
  const ftrS=$("ftrS");if(ftrS)ftrS.innerHTML=`${p.prompts}p ${S.bullet} ${ip.prompts}img ${S.bullet} ${s.prompts}s ${S.bullet} ${b.prompts}b ${S.bullet} ${n.prompts}n ${S.bullet} ${k.prompts}sk ${S.bullet} ${g.prompts}g ${S.bullet} ${phc.prompts}ph ${S.bullet} ${lsc.prompts}ls <span class="ftr-links"><span class="ftr-link${aTab==='templates'?' ftr-link-on':''}" id="ftrTpl">&#128218; Templates</span></span>`;
  $("ftrTpl")?.addEventListener("click",()=>{meta._tplSilo=siloHasTemplates(aTab)?aTab:"prompts";meta._tplCat="";aTab="templates";render()});
  const days=meta.lb?Math.floor(daysSince(meta.lb)):null;
  const ftrB=$("ftrB");
  if(ftrB){ftrB.textContent=days!==null?`Backup: ${days}d`:"No backup";ftrB.style.color=(!meta.lb||days>=7)?"var(--ac)":"var(--dm)"}
  const syncEl=$("ftrSync");
  if(syncEl){const st=Cloud.statusText();syncEl.textContent=st;syncEl.style.color=Cloud._error?"var(--dn)":Cloud._syncing?"var(--ac)":"var(--dm)";syncEl.style.display=st?"":"none"}
  updateCloudDot();
}

function rContent(){const c=$("cArea"),s2=st();if(!c)return;
  _renderIndexes=s2.view==="edit"||s2.view==="trash"?null:buildRenderIndexes();
  // ── Chambered prompt bar (next in chain) ──
  let chmHtml="";
  if(isP()&&pSt._chambered){
    const nxt=allItems(P.folders).find(x=>x.id===pSt._chambered.id);
    if(nxt){
      const _cm=pSt._chambered,_prog=_cm.total?` ${S.bullet} step ${_cm.index} of ${_cm.total}`:"";
      const _cname=_cm.chain&&typeof pvChainTitle==="function"?esc(pvChainTitle(_cm.chain)):"";
      chmHtml=`<div class="chm-bar"><div class="chm-info"><span class="chm-label">Next up${_prog?esc(_prog):""}</span><span class="chm-title">${esc(nxt.title)}${_cname?` <span style="color:var(--dm);font-weight:400">${_cname}</span>`:""}</span></div><div class="chm-acts"><button class="inj-btn" id="chmInj">${S.bolt} Inject</button><button class="bs" id="chmDis">Dismiss</button></div></div>`;
    }else{pSt._chambered=null}
  }
  const chmEl=$("chmBar");if(chmEl)chmEl.innerHTML=chmHtml;
  if(pSt._chambered){
    $("chmInj")?.addEventListener("click",()=>{
      const nxt=allItems(P.folders).find(x=>x.id===pSt._chambered.id);
      if(nxt)handleUse(nxt.folderId,nxt,"inject");
      else{pSt._chambered=null;render()}
    });
    $("chmDis")?.addEventListener("click",()=>{pSt._chambered=null;render()});
  }
  if(s2.view==="edit"){rEditor(c);return}if(s2.view==="fav"){rFavs(c);return}
  if(s2.view==="trash"){rTrash(c);return}
  if(isP()&&s2.view==="chains"){renderChainManager(c);return}
  if(s2.collFilter){rCollView(c);return}
  if(s2.q.trim()||(isP()&&pSt.platFilter)||s2.tagFilter){rFiltered(c);return}rFolder(c)}

function rEditor(c){
  const s2=st(),label=isP()?"Prompt":isI()?"Image Prompt":isK()?"Skill":isS()?"Clip":isN()?"Note":isG()?"Custom GPT":isPR()?"Project":"Bookmark",ac=acC();

  // ═══ SKILL EDITOR — package-aware ═══
  if(isK()){
    if(!s2._skFiles)s2._skFiles={};
    if(!s2._skView)s2._skView="SKILL.md"; // which file is being viewed
    const viewing=s2._skView;
    const viewContent=viewing==="SKILL.md"?s2.eCo:(s2._skFiles[viewing]||"");
    const summary=skillFileSummary({content:s2.eCo,files:s2._skFiles});
    c.innerHTML=`<div class="ed sk-ed" style="--ed-ac:var(--sk)"><div class="ed-bk"><button id="edBk">${I.back}</button><span>${s2.eId==="new"?"New Skill":"Edit Skill"}</span></div>
    <input class="ti" id="edTi" value="${esc(s2.eTi)}" placeholder="Skill name (e.g. story-guru)...">
    <input class="tg sk-summary-input" id="skSummary" value="${escAttr(s2._skSummary||"")}" placeholder="Summary — what this Skill does and when Claude should use it">
    <input class="tg" id="edTg" value="${esc(s2.eTg)}" placeholder="Tags...">
    <div class="sk-tree-panel">
      <div class="sk-tree-hdr"><span class="sk-tree-title">Package · ${summary.fileCount} file${summary.fileCount===1?'':'s'} · ${summary.totalKB}KB</span></div>
      <div class="sk-tree" id="skTree">${renderSkillTree({content:s2.eCo,files:s2._skFiles},true)}</div>
      <div class="sk-tree-acts">
        <button class="bs sk" id="skAddFile">${I.plus} Add File</button>
        <button class="bs" id="skDlMd">${I.dl} .md</button>
        <button class="bs" id="skDlZip">${I.dl} .skill</button>
      </div>
    </div>
    <div class="sk-view-hdr"><span class="sk-view-file">${S.doc} ${esc(viewing)}</span><span class="sk-view-size">${(viewContent.length/1024).toFixed(1)}KB</span></div>
    <textarea id="edTa" placeholder="Paste SKILL.md content here...">${esc(viewContent)}</textarea>
    <div class="br"><span class="cc" id="edSt">${viewContent.length}c · ${wordCount(viewContent)}w</span><div class="btns"><button class="bg-btn" id="edX">Cancel</button><button class="bp bp-k" id="edOK">Save</button></div></div></div>`;
    // Wire skill file tree clicks
    c.querySelectorAll("[data-sf]").forEach(el=>{el.addEventListener("click",()=>{
      // Save current view content first
      const ta=$("edTa");if(ta){
        if(s2._skView==="SKILL.md")s2.eCo=ta.value;
        else s2._skFiles[s2._skView]=ta.value;
      }
      s2._skView=el.dataset.sf;render()})});
    // Wire remove file buttons
    c.querySelectorAll("[data-rm]").forEach(btn=>{btn.addEventListener("click",e=>{
      e.stopPropagation();const path=btn.dataset.rm;
      delete s2._skFiles[path];if(s2._skView===path)s2._skView="SKILL.md";render()})});
    // Wire add file
    $("skAddFile")?.addEventListener("click",()=>{
      showModal(`<h3>Add File</h3><input type="text" id="afPath" placeholder="Path (e.g. references/my-doc.md)"><textarea id="afContent" placeholder="Paste file content..." style="height:120px;width:100%;margin-top:6px;background:var(--inp);border:1px solid var(--bl);border-radius:4px;padding:6px;color:var(--tx);font-family:ui-monospace,SFMono-Regular,'SF Mono',Consolas,monospace;font-size:11px;resize:vertical"></textarea>
      <div class="ht" style="margin-top:4px">Or upload a file:</div><input type="file" id="afFile" accept=".md,.py,.txt,.html,.yaml,.yml,.json,.csv,.skill" style="margin-top:4px">
      <div class="brow"><button class="bg-btn" id="afX">Cancel</button><button class="bp bp-k" id="afOK">Add</button></div>`,mc=>{
        mc.querySelector("#afX").addEventListener("click",closeModal);
        mc.querySelector("#afFile")?.addEventListener("change",e=>{
          const f=e.target.files?.[0];if(!f)return;
          const pathI=mc.querySelector("#afPath");if(!pathI.value)pathI.value=f.name;
          const r=new FileReader();r.onload=ev=>{mc.querySelector("#afContent").value=ev.target.result};r.readAsText(f)});
        mc.querySelector("#afOK").addEventListener("click",()=>{
          const path=mc.querySelector("#afPath").value.trim();
          const content=mc.querySelector("#afContent").value;
          if(!path){flash("Path required");return}
          s2._skFiles[path]=content;closeModal();render()})})});
    // Wire downloads
    $("skDlMd")?.addEventListener("click",()=>{downloadSkillMd({title:s2.eTi,content:s2.eCo})});
    $("skDlZip")?.addEventListener("click",()=>{downloadSkillZip({title:s2.eTi,content:s2.eCo,files:s2._skFiles})});
    // Wire textarea changes
    const ta=$("edTa"),ti=$("edTi"),tg=$("edTg"),skSummary=$("skSummary");
    ta?.addEventListener("input",()=>{
      if(s2._skView==="SKILL.md")s2.eCo=ta.value;
      else s2._skFiles[s2._skView]=ta.value;
      $("edSt").textContent=`${ta.value.length}c · ${wordCount(ta.value)}w`});
    ti?.addEventListener("input",()=>{s2.eTi=ti.value});
    tg?.addEventListener("input",()=>{s2.eTg=tg.value});
    skSummary?.addEventListener("input",()=>{s2._skSummary=skSummary.value});
    $("edBk")?.addEventListener("click",()=>{s2.view="list";s2.eId=null;s2._skFiles=null;s2._skView=null;render()});
    $("edX")?.addEventListener("click",()=>{s2.view="list";s2.eId=null;s2._skFiles=null;s2._skView=null;render()});
    $("edOK")?.addEventListener("click",()=>saveItem());
    setTimeout(()=>ta?.focus(),50);
    return;
  }

  // ═══ STANDARD EDITOR (Prompts/Clips/Notes/Bookmarks) ═══
  const platOpts=(isI()?activePlatforms().filter(p=>isImgPlatform(p.id)):activePlatforms().filter(p=>!isImgPlatform(p.id))).map(p=>`<option value="${p.id}" ${s2.ePlat===p.id?'selected':''}>${p.icon} ${p.name}</option>`).join("");
  // Find linked prompt for clips
  const linkedPId=isS()&&s2.eId&&s2.eId!=="new"?(() =>{const f=findFolder(SN.folders,sSt.sel);const item=f?.prompts?.find(x=>x.id===s2.eId);return item?.linkedPromptId||""})():"";
  const linkedPName=linkedPId?(() =>{const pi=allItems(P.folders).find(x=>x.id===linkedPId);return pi?pi.title:""})():"";
  c.innerHTML=`<div class="ed" style="--ed-ac:var(${ac==='p'?'--ac':ac==='i'?'--ip':ac==='s'?'--sn':ac==='k'?'--sk':ac==='n'?'--nt':ac==='g'?'--gp':'--bk'})"><div class="ed-bk"><button id="edBk">${I.back}</button><span>${s2.eId==="new"?"New "+label:"Edit"}</span></div>
  <input class="ti" id="edTi" value="${esc(s2.eTi)}" placeholder="Title...">
  <input class="tg" id="edTg" value="${esc(s2.eTg)}" placeholder="Tags...">
  <div class="tag-sug" id="tagSug"></div>
  ${isS()?`<div class="link-row"><span class="link-label">${S.link} Source prompt:</span><span class="link-val" id="linkVal">${linkedPName?esc(linkedPName):'<em style="color:var(--dm)">None</em>'}</span><button class="bs" id="linkPick">Link</button>${linkedPId?`<button class="bs dng" id="linkClear">${S.x}</button>`:''}</div>`:''}
  ${(isP()||isI())?`<div class="meta-row"><label>Platform:</label><select id="edPlat">${isI()?'':`<option value="">- None -</option>`}${platOpts}</select></div>`:''}
  ${isP()?`<div class="meta-row"><label>Inject as:</label><select id="edInjectIntent"><option value="user" ${(s2._eInjectIntent||"user")==="user"?"selected":""}>User message</option><option value="system" ${(s2._eInjectIntent||"")==="system"?"selected":""}>System/instructions</option></select></div>`:''}
  ${isP()?`<input class="ti" id="edGoal" value="${esc(s2._eGoal||"")}" placeholder="What I'm trying to achieve (e.g. 2-sentence Slack summary)...">`:''}
  ${isL()?`<input class="url-in" id="edUrl" value="${esc(s2.eUrl)}" placeholder="https://...">`:''}
  ${isP()?`<div class="ht" style="display:flex;justify-content:space-between;align-items:center"><span>{{ref:Title}} to include another prompt</span><button class="vbb-add" id="addVarBtn">+ Variable</button></div>
  <div class="vbb" id="varBuilder" style="display:none">
    <div class="vbb-row"><input class="vbb-name" id="vbbName" placeholder="Variable name (e.g. Award Focus)"></div>
    <div class="vbb-row"><div class="vbb-types" id="vbbTypes">
      <button class="vbb-t" data-vt="text"><span class="vbb-ti">Aa</span><span class="vbb-tl">Text</span><span class="vbb-td">They type it</span></button>
      <button class="vbb-t" data-vt="dropdown"><span class="vbb-ti">${S.chevD}</span><span class="vbb-tl">Pick one</span><span class="vbb-td">Dropdown</span></button>
      <button class="vbb-t vbb-t-multi" data-vt="multi"><span class="vbb-ti">${S.checkbox}</span><span class="vbb-tl">Pick many</span><span class="vbb-td">Checkboxes</span></button>
      <button class="vbb-t" data-vt="long"><span class="vbb-ti">${S.pilcrow}</span><span class="vbb-tl">Paragraph</span><span class="vbb-td">Big text box</span></button>
    </div></div>
    <div class="vbb-opts" id="vbbOptsWrap" style="display:none">
      <div class="vbb-opts-label">Options:</div>
      <div class="vbb-pills" id="vbbPills"></div>
      <input class="vbb-opt-inp" id="vbbOptInp" placeholder="Type a choice, press Enter">
    </div>
    <div class="vbb-acts"><button class="bg-btn" id="vbbX">Cancel</button><button class="bp" id="vbbOK">Insert Variable</button></div>
  </div>`:''}
  ${isK()?'<div class="ht" style="color:var(--sk)">Paste your SKILL.md content below · Drag this skill from the card into Claude to deploy</div>':''}
  ${isL()?'<div class="ht">Notes (optional)</div>':''}
  ${isN()?renderNoteToolbar():''}
  ${isI()?'<div class="ip-sticky-dock"><div class="ip-sticky-label">Your vision · stays visible while you explore</div>':''}
  ${isN()?`<div id="edNoteBody" class="ed-note-body">${(s2.eCo&&s2.eCo.trim().startsWith("<"))?s2.eCo:plainToNoteHtml(s2.eCo||"")}</div>`:`<textarea id="edTa" placeholder="${isI()?'Describe your image - what do you want to see?':isL()?'Notes...':isS()?'Clip...':isK()?'# Skill Name\n\nPaste SKILL.md content here...':'Prompt...'}">${esc(s2.eCo)}</textarea>`}
  ${isI()?`<div class="ip-compile" id="ipCompile"><div class="ip-compile-hdr"><span>${S.bolt}</span> Live compiled prompt</div><div class="ip-compile-preview" id="ipPreview"><em>Type a subject above to see your compiled prompt</em></div><div class="ip-actions"><button class="ip-btn" id="ipInject">${S.bolt} Inject</button><button class="ip-btn" id="ipCopy">${S.clip} Copy</button></div></div></div>`:''}
  <div id="mjComposer"></div>
  <div class="vp" id="edVp"></div>
  <div id="mjPanel"></div>
  ${isP()&&s2.eId&&s2.eId!=="new"?`<div class="ed-chain-row" id="edChainRow"></div>`:''}
  ${isP()?`<div class="chain-row" id="chainRow"><span class="chain-label">${S.arrow} Follow-up:</span><span class="chain-val" id="chainVal">${s2._nextTitle||'<em style="color:var(--dm)">None</em>'}</span><button class="bs" id="chainPick">Link</button>${s2._nextId?`<button class="bs dng" id="chainClear">${S.x}</button>`:''}</div>`:''}
  <div class="br"><span class="cc" id="edSt"></span><div class="btns"><button class="bg-btn" id="edX">Cancel</button><button class="bp${ac==='k'?' bp-k':ac==='i'?' bp-i':ac==='s'?' bp-s':ac==='b'?' bp-b':ac==='n'?' bp-n':ac==='g'?' bp-g':''}" id="edOK">Save</button></div></div>
  ${isP()&&s2.eId&&s2.eId!=="new"?'<input class="ti" id="edVersionNote" placeholder="Change note (optional)" style="font-size:10px;margin-top:4px" value="">':''}
  ${!isL()?'<div class="tok" id="edTok"></div>':''}
  <div id="edFluff" style="display:none;font-size:9px;color:var(--dn);margin-top:2px"></div>
  ${s2.eId&&s2.eId!=="new"&&(isP()||isS()||isK())?`<div class="related-sec" id="edRelated"><div class="related-hdr">Related</div><div class="related-list" id="edRelatedList"></div></div>`:''}</div>`;
  const ti=$("edTi"),tg=$("edTg"),ta=isN()?null:$("edTa"),edNoteBody=isN()?$("edNoteBody"):null,ul=$("edUrl"),pl=$("edPlat");
  const upd=()=>{const v=ta?ta.value:(edNoteBody?edNoteBody.innerText:"");$("edSt").textContent=`${v.length}c · ${wordCount(v)}w`;
    if(!isL()&&$("edTok")){const tc=tokenEstimate(v);const warn=getTokenWarning?.(v);$("edTok").textContent=warn?`~${tc} tokens ${S.warn}`:`~${tc} tokens`;$("edTok").style.color=warn?.level==="high"?"var(--dn)":warn?.level==="med"?"var(--ac)":""}
    if(isP()&&typeof detectFluff==="function"){const fluff=detectFluff(v);const flEl=$("edFluff");if(fluff.length&&flEl){flEl.style.display="block";flEl.textContent=`Fluff: ${fluff.slice(0,3).join(", ")}${fluff.length>3?"...":""}`}else if(flEl)flEl.style.display="none"}
    if(isP()){const vars=extractVars(v);const refs=(v.match(/\{\{ref:([^}]+)\}\}/g)||[]).map(x=>x.slice(6,-2));
      let badges=vars.map(x=>{const d=parseVarDef(x);const ic=d.type==="dropdown"?S.chevD+" ":d.type==="multi"?S.checkbox+" ":d.type==="long"?S.pilcrow+" ":"";const tc=d.type==="dropdown"||d.type==="multi"?" vb-dd":d.type==="long"?" vb-long":"";return`<span class="vb${tc}" data-vedit="${esc(x)}" title="Click to edit">${ic}{{${esc(d.label)}}}</span>`});
      refs.forEach(r=>badges.push(`<span class="vb vb-ref">${S.paperclip} ${esc(r)}</span>`));
      const _vp=$("edVp");if(_vp)_vp.innerHTML=badges.join(" ")}};
  // Auto-tag suggestions
  const showTagSug=()=>{const content=(ta?ta.value:edNoteBody?.innerText||"")+' '+ti.value;const suggested=suggestTags(content);const current=(tg.value||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
    const novel=suggested.filter(t=>!current.includes(t.toLowerCase()));
    const _ts=$("tagSug");if(_ts)_ts.innerHTML=novel.length?novel.map(t=>`<span class="tag-sug-pill" data-st="${esc(t)}">${esc(t)}</span>`).join("")+'<span class="tag-sug-lbl">suggested</span>':""};
  ti.addEventListener("input",()=>{s2.eTi=ti.value});
  tg.addEventListener("input",()=>{s2.eTg=tg.value});
  $("edGoal")?.addEventListener("input",()=>{s2._eGoal=$("edGoal").value});
  $("edInjectIntent")?.addEventListener("change",()=>{s2._eInjectIntent=$("edInjectIntent").value});
  if(ta){ta.addEventListener("input",()=>{s2.eCo=ta.value;upd();showTagSug();updIpPreview();
    if(isN()&&s2.eId&&s2.eId!=="new"){clearTimeout(autoSaveTmr);autoSaveTmr=setTimeout(()=>{saveItem(true);const st2=$("edSt");if(st2)st2.textContent+=" · saved"},1200)}
  })}
  if(ul)ul.addEventListener("input",()=>{s2.eUrl=ul.value});
  if(pl){pl.addEventListener("change",()=>{s2.ePlat=pl.value;showMjPanel()});showMjPanel()}
  function showMjPanel(){const panel=$("mjPanel"),comp=$("mjComposer");const isMj=s2.ePlat==="midjourney";if(panel){if(isMj){if(!s2._params)s2._params={...MJ_DEF_PARAMS};rMjBuilder(panel,s2._params,updIpPreview)}else{panel.innerHTML=""}}if(comp){if(isMj){rMjComposer(comp)}else{comp.innerHTML=""}}updIpPreview()}
  function updIpPreview(){const prev=$("ipPreview");if(!prev)return;const subj=(ta?ta.value:"").trim();const inf=(s2._params&&s2.ePlat==="midjourney")?buildInfluencesString(s2._params):"";const sfx=(s2._params&&s2.ePlat==="midjourney")?buildMjSuffix(s2._params):"";if(!subj){prev.innerHTML='<em>Type a subject above to see your compiled prompt</em>';return}prev.textContent=subj+(inf?" "+inf:"")+(sfx?" "+sfx:"")}
  // Image prompt compile/inject/copy
  $("ipInject")?.addEventListener("click",()=>{const subj=(ta?ta.value:"").trim();if(!subj){flash("Write a subject first");return}const inf=(s2._params&&s2.ePlat==="midjourney")?buildInfluencesString(s2._params):"";const sfx=(s2._params&&s2.ePlat==="midjourney")?buildMjSuffix(s2._params):"";const full=subj+(inf?" "+inf:"")+(sfx?" "+sfx:"");inject(full,s2.eId&&s2.eId!=="new"?s2.eId:"",s2.sel,s2.ePlat||"")});
  $("ipCopy")?.addEventListener("click",()=>{const subj=(ta?ta.value:"").trim();if(!subj){flash("Write a subject first");return}const inf=(s2._params&&s2.ePlat==="midjourney")?buildInfluencesString(s2._params):"";const sfx=(s2._params&&s2.ePlat==="midjourney")?buildMjSuffix(s2._params):"";const full=subj+(inf?" "+inf:"")+(sfx?" "+sfx:"");navigator.clipboard.writeText(full).then(()=>flash("Copied"))});
  if(isN()&&edNoteBody){initNoteEditor(edNoteBody,s2);wireNoteToolbar(edNoteBody)}
  upd();showTagSug();
  // Related items (prompts, clips, skills)
  const relList=$("edRelatedList"),relSec=$("edRelated");
  if(relList&&relSec){
    const curItem=allItems(dt().folders).find(p=>p.id===s2.eId);
    const store=isP()?P:isS()?SN:isK()?KL:null;
    if(curItem&&store){const related=findRelated(curItem,store,5);relList.innerHTML=related.length?related.map(r=>`<div class="fpi" data-id="${r.id}" data-fid="${r.folderId||''}" style="padding:4px 0;cursor:pointer;font-size:11px;color:var(--mu)">${esc(r.title)}${r.folderName?` · ${esc(r.folderName)}`:''}</div>`).join(""):'<span style="font-size:10px;color:var(--dm)">None</span>';relList.querySelectorAll(".fpi").forEach(el=>{el.addEventListener("click",()=>{s2.sel=el.dataset.fid||s2.sel;s2.eId=el.dataset.id;s2.view="edit";render()})})}
  }
  // Tag suggestion click-to-add
  $("tagSug")?.addEventListener("click",e=>{const pill=e.target.closest("[data-st]");if(pill){const t=pill.dataset.st;const cur=tg.value.trim();tg.value=cur?(cur+", "+t):t;s2.eTg=tg.value;showTagSug()}});
  // Clip link-to-prompt picker
  $("linkPick")?.addEventListener("click",()=>linkPickerMd(s2.eId));
  $("linkClear")?.addEventListener("click",()=>{const f=findFolder(SN.folders,sSt.sel);const item=f?.prompts?.find(x=>x.id===s2.eId);if(item){item.linkedPromptId="";save();render()}});
  $("chainPick")?.addEventListener("click",()=>followUpPickerMd());
  $("chainClear")?.addEventListener("click",()=>{s2._nextId="";s2._nextTitle="";render()});
  // Chain membership chips — the editor's window into the annotation model.
  const _ecr=$("edChainRow");
  if(_ecr&&isP()&&typeof pvChainSteps==="function"){
    const _live=allItems(P.folders).find(x=>String(x.id)===String(s2.eId));
    const _folder=_live?findFolder(P.folders,_live.folderId):null;
    const _item=_folder?.prompts?.find(x=>String(x.id)===String(s2.eId));
    const _mine=(_item&&Array.isArray(_item.chains)?_item.chains:[]).map(t=>pvChainParseTag(t)).filter(Boolean);
    const _chips=_mine.map(m=>{
      const st3=pvChainSteps(P.folders,m.prefix).find(x=>String(x.item.id)===String(s2.eId));
      return `<span class="ed-chain-chip">${esc(pvChainTitle(m.prefix))} ${S.bullet} step ${st3?st3.index:m.stage}${st3?" of "+st3.total:""}</span>`;
    }).join("");
    _ecr.innerHTML=`<span style="color:var(--dm)">${S.arrow} Chains:</span>${_chips||'<span style="color:var(--dm)"><em>none</em></span>'}<button class="bs" id="edChainEdit">Manage</button>`;
    $("edChainEdit")?.addEventListener("click",()=>{if(_item)chainAssignModal(_item);else flash("Save the prompt first")});
  }
  $("edBk")?.addEventListener("click",()=>{s2.view="list";s2.eId=null;render()});
  $("edX")?.addEventListener("click",()=>{s2.view="list";s2.eId=null;render()});
  $("edOK")?.addEventListener("click",()=>{if(isN()&&edNoteBody)s2.eCo=sanitizeNoteHtml(edNoteBody.innerHTML);if($("edVersionNote"))s2._eVersionNote=$("edVersionNote").value;saveItem()});
  // ── Variable Builder ──
  if(isP()){
    const vbb={type:"text",options:[],editing:null};
    function vbbShow(editRaw){
      const bld=$("varBuilder");bld.style.display="block";
      vbb.editing=editRaw||null;vbb.type="text";vbb.options=[];
      if(editRaw){const d=parseVarDef(editRaw);$("vbbName").value=d.label;vbb.type=d.type;vbb.options=d.options?[...d.options]:[];$("vbbOK").textContent="Update Variable"}
      else{$("vbbName").value="";$("vbbOK").textContent="Insert Variable"}
      vbbUpdType();vbbUpdPills();$("vbbName").focus();$("vbbName").select();
    }
    function vbbUpdType(){
      $("vbbTypes").querySelectorAll(".vbb-t").forEach(b=>{b.classList.toggle("vbb-t-on",b.dataset.vt===vbb.type)});
      $("vbbOptsWrap").style.display=(vbb.type==="dropdown"||vbb.type==="multi")?"block":"none";
    }
    function vbbUpdPills(){
      $("vbbPills").innerHTML=vbb.options.map((o,i)=>`<span class="vbb-pill">${esc(o)}<button class="vbb-pill-x" data-oi="${i}">${S.x}</button></span>`).join("");
      $("vbbPills").querySelectorAll(".vbb-pill-x").forEach(b=>{b.addEventListener("click",e=>{e.stopPropagation();vbb.options.splice(+b.dataset.oi,1);vbbUpdPills()})});
    }
    function vbbBuild(){
      const name=$("vbbName").value.trim();if(!name)return null;
      if(vbb.type==="text")return`{{${name}}}`;
      if(vbb.type==="long")return`{{${name}:+long}}`;
      if(vbb.type==="dropdown"&&vbb.options.length)return`{{${name}:${vbb.options.join("|")}}}`;
      if(vbb.type==="multi"&&vbb.options.length)return`{{${name}:+multi:${vbb.options.join("|")}}}`;
      if((vbb.type==="dropdown"||vbb.type==="multi")&&!vbb.options.length)return null;
      return`{{${name}}}`;
    }
    $("addVarBtn")?.addEventListener("click",()=>vbbShow(null));
    $("vbbTypes").querySelectorAll(".vbb-t").forEach(b=>{b.addEventListener("click",()=>{vbb.type=b.dataset.vt;vbbUpdType()})});
    $("vbbOptInp")?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();const v=$("vbbOptInp").value.trim();if(v&&!vbb.options.includes(v)){vbb.options.push(v);vbbUpdPills()}$("vbbOptInp").value=""}});
    $("vbbX")?.addEventListener("click",()=>{$("varBuilder").style.display="none"});
    $("vbbOK")?.addEventListener("click",()=>{
      const syntax=vbbBuild();
      if(!syntax){flash("Add a name"+(vbb.type==="dropdown"||vbb.type==="multi"?" and at least one option":""));return}
      if(vbb.editing){
        const old=`{{${vbb.editing}}}`;ta.value=ta.value.replace(old,syntax)
      }else{
        const start=ta.selectionStart,end=ta.selectionEnd;
        ta.value=ta.value.slice(0,start)+syntax+ta.value.slice(end);
        ta.selectionStart=ta.selectionEnd=start+syntax.length;
      }
      s2.eCo=ta.value;upd();$("varBuilder").style.display="none";ta.focus();
    });
    // Badge click-to-edit
    $("edVp")?.addEventListener("click",e=>{const b=e.target.closest("[data-vedit]");if(b)vbbShow(b.dataset.vedit)});
  }
  setTimeout(()=>(isL()&&ul?ul:isN()?edNoteBody:ta)?.focus(),50);
}

function rFavs(c){const favs=getFavorited(dt().folders);c.innerHTML=`<div class="pad"><div style="font-size:9px;color:var(--dm);margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Favorites</div><div id="fL"></div></div>`;
  const l=$("fL");if(!favs.length){l.innerHTML=`<div class="empty-guide"><div class="empty-icon" style="font-size:16px">${S.starEmpty}</div>No favorites yet<div class="empty-hint">Click the ${S.star} star on any card to add it here for quick access</div></div>`;return}
  favs.forEach(p=>l.appendChild(mkCard(p,p.folderId,{showF:1})))}

function rTrash(c){const tr=dt().trash||[];
  c.innerHTML=`<div class="pad"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px"><span style="font-size:9px;color:var(--dm);text-transform:uppercase;letter-spacing:1px;font-weight:600">Trash (${TR_D}d)</span>${tr.length?`<button class="bs dng" id="emT">${I.trash} Empty</button>`:''}</div><div id="tL"></div></div>`;
  if(tr.length)$("emT")?.addEventListener("click",()=>{showModal(`<h3>Empty Trash?</h3><p>${tr.length} items permanently deleted.</p><div class="brow"><button class="bg-btn" id="emX">Cancel</button><button class="bdn" id="emY">Empty</button></div>`,m=>{m.querySelector("#emX").addEventListener("click",closeModal);m.querySelector("#emY").addEventListener("click",()=>{pushUndo();dt().trash=[];save();closeModal();render()})})});
  const l=$("tL");if(!tr.length){l.innerHTML=`<div class="empty-guide"><div class="empty-icon" style="font-size:16px">${I.trash}</div>Trash is empty<div class="empty-hint">Deleted items appear here for ${TR_D} days before permanent removal</div></div>`;return}
  [...tr].reverse().forEach((item,i)=>{const ri=tr.length-1-i,days=Math.floor(daysSince(item.deletedAt));
    const el=document.createElement("div");el.className="tc";
    el.innerHTML=`<div class="th"><span class="tt">${item.type==="folder"?S.folder+" ":""}${esc(item.name)}</span><div class="ta"><button class="ib gn" data-r="${ri}">${I.rest}</button><button class="ib dng" data-d="${ri}">${I.trash}</button></div></div><div class="td">${days}d ago · ${Math.max(0,TR_D-days)}d left</div>`;
    el.querySelector("[data-r]").addEventListener("click",()=>{pushUndo();restTrash(ri)});
    el.querySelector("[data-d]").addEventListener("click",()=>{pushUndo();dt().trash.splice(ri,1);save();render();flash("Deleted")});l.appendChild(el)})}

function rFiltered(c){
  let results=searchAll(st().q,dt().folders,"",isP()?pSt.platFilter:"",st().tagFilter);
  const s2=st(),hasQ=s2.q.trim(),hasTag=s2.tagFilter,hasPF=isP()&&pSt.platFilter;
  const label=hasQ?'result':'item';
  let filterDesc='';if(hasTag)filterDesc+=`tag: ${s2.tagFilter}`;if(hasPF)filterDesc+=(filterDesc?' + ':'')+'platform filtered';
  c.innerHTML=`<div class="pad"><div style="font-size:9px;color:var(--dm);margin-bottom:4px">${results.length} ${label}${results.length!==1?'s':''}${filterDesc?' ('+filterDesc+')':''}</div><div id="sL"></div></div>`;
  const l=$("sL");if(!results.length){l.innerHTML=`<div class="empty-guide"><div class="empty-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--dm)" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>No matches for "${esc(s2.q||s2.tagFilter||"")}"<div class="empty-hint">Try different keywords or check other tabs</div></div>`;return}
  const PAGE=40;const visible=results.slice(0,PAGE);
  l.classList.toggle("launch-grid",isG()&&st().listMode==="launcher");
  l.classList.toggle("photo-grid",isPh()&&st().listMode==="gallery");
  if(isPh()&&st().listMode==="gallery")visible.forEach(p=>l.appendChild(mkPhotoTile(p,p.folderId)));
  else if(isG()&&st().listMode==="launcher")visible.forEach(p=>l.appendChild(mkLaunchTile(p,p.folderId)));
  else if(isL()&&s2.listMode==="compact")visible.forEach(p=>l.appendChild(mkCompactCard(p,p.folderId)));
  else visible.forEach(p=>l.appendChild(mkCard(p,p.folderId,{showF:1})));
  if(results.length>PAGE){const more=document.createElement("button");more.className="bs show-more-btn";more.textContent=`Show ${results.length-PAGE} more`;more.addEventListener("click",()=>{more.remove();const rest=results.slice(PAGE);if(isPh()&&st().listMode==="gallery")rest.forEach(p=>l.appendChild(mkPhotoTile(p,p.folderId)));else if(isG()&&st().listMode==="launcher")rest.forEach(p=>l.appendChild(mkLaunchTile(p,p.folderId)));else if(isL()&&s2.listMode==="compact")rest.forEach(p=>l.appendChild(mkCompactCard(p,p.folderId)));else rest.forEach(p=>l.appendChild(mkCard(p,p.folderId,{showF:1})))});l.appendChild(more)}}

// ── Collection View (all tabs) ──
function rCollView(c){
  const cd=collData();
  const s2=st();
  const col=(cd.collections||[]).find(x=>x.id===s2.collFilter);
  if(!col){s2.collFilter="";rFolder(c);return}
  const items=getCollItems(col.id);
  const bg=col.color?TAG_COLORS.find(tc=>tc.v===col.color):null;
  const acCol='var(--tab-ac)';
  const colStyle=bg?`color:${bg.fg}`:`color:${acCol}`;
  const dotStyle=bg?`background:${bg.v}`:`background:${acCol}`;
  c.innerHTML=`<div class="pad"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px"><div style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:50%;${dotStyle};flex-shrink:0"></span><span style="font-size:12px;font-weight:600;${colStyle}">${esc(col.name)}</span><span style="font-size:9px;color:var(--dm)">${items.length}</span></div><button class="bs" id="collExportHtml" title="${isPh()?"Print or export this photo collection":"Export collection as HTML"}">${I.dl} ${isPh()?"Photo report":"Export as HTML"}</button></div><div id="clL"></div></div>`;
  const l=$("clL");
  const itemLabel=isP()?"prompts":isI()?"image prompts":isK()?"skills":isS()?"clips":isN()?"notes":isG()?"custom GPTs":isPh()?"photos":"bookmarks";
  const itemSingular=isP()?"prompt":isI()?"image prompt":isK()?"skill":isS()?"clip":isN()?"note":isG()?"GPT":isPh()?"photo":"bookmark";
  const exportCollection=()=>isPh()?pvOpenPhotoReport({name:col.name,items:getCollItems(col.id),kind:"collection"}):exportCollectionAsHtml(col);
  if(!items.length){l.innerHTML=`<div class="empty-guide"><div class="empty-icon" style="font-size:20px">${S.pin}</div>No ${itemLabel} yet<div class="empty-hint">Use the ${S.pin} button on any ${itemSingular} to add it here</div></div>`;$("collExportHtml")?.addEventListener("click",exportCollection);return}
  if(!isPh())items.sort((a,b)=>(b.modified||0)-(a.modified||0));
  const PAGE=40;const visible=items.slice(0,PAGE);
  l.classList.toggle("launch-grid",isG()&&st().listMode==="launcher");
  l.classList.toggle("photo-grid",isPh()&&st().listMode==="gallery");
  if(isPh()&&st().listMode==="gallery")visible.forEach(p=>l.appendChild(mkPhotoTile(p,p.folderId)));
  else if(isG()&&st().listMode==="launcher")visible.forEach(p=>l.appendChild(mkLaunchTile(p,p.folderId)));
  else if(isL()&&st().listMode==="compact")visible.forEach(p=>l.appendChild(mkCompactCard(p,p.folderId)));
  else visible.forEach(p=>l.appendChild(mkCard(p,p.folderId,{showF:1,collId:col.id})));
  if(items.length>PAGE){const more=document.createElement("button");more.className="bs show-more-btn";more.textContent=`Show ${items.length-PAGE} more`;more.addEventListener("click",()=>{more.remove();const rest=items.slice(PAGE);if(isL()&&st().listMode==="compact")rest.forEach(p=>l.appendChild(mkCompactCard(p,p.folderId)));else rest.forEach(p=>l.appendChild(mkCard(p,p.folderId,{showF:1,collId:col.id})))});l.appendChild(more)}
  $("collExportHtml")?.addEventListener("click",exportCollection);
}

function rFolder(c){
  const s2=st(),d2=dt(),f=findFolder(d2.folders,s2.sel),ac=acC();if(!f)return;
  if(isP()){
    chrome.runtime.sendMessage({type:"GET_ACTIVE_TAB"},t=>{
      const nu=typeof detectPlatform==="function"?detectPlatform(t?.url||""):"";
      if(nu!==_uiBoostPlat){_uiBoostPlat=nu;render()}
    });
  }
  const crumbs=[];let n=f;while(n){crumbs.unshift(n);n=findParent(d2.folders,n.id)}
  let h='<div class="pad">';
  h+='<div class="bc">';crumbs.forEach((b,i)=>{if(i)h+='<span class="sep">/</span>';h+=`<span class="c ${i===crumbs.length-1?'cur':''}" data-nav="${b.id}">${esc(b.name)}</span>`});h+='</div>';
  if(f.children?.length){h+='<div class="sf-chips">';f.children.forEach(ch=>{const col=ch.color||"";h+=`<div class="sf-chip" data-nav="${ch.id}"><span style="display:flex;${col?'color:'+col:'color:var(--'+acV()+')'}">${V.f(0,col||undefined)}</span><span>${esc(ch.name)}</span><span style="font-size:8px;color:var(--dm)">${countItems(ch).prompts}</span></div>`});h+='</div>'}
  const label=isP()?"Prompt":isI()?"Image Prompt":isK()?"Skill":isS()?"Clip":isN()?"Note":isG()?"Custom GPT":isPh()?"Photo":isPR()?"Project":"Bookmark";
  h+=`<div style="display:flex;gap:3px;margin-bottom:5px;flex-wrap:wrap"><button class="ba ba-${ac}" id="newI">${I.plus} New ${label}</button><button class="bs" id="newF" title="Create a folder in the current location">${S.folder} New Folder</button>${(isP()||isS()||isB())?`<button class="bs" id="sectionImport" title="Import files directly into ${label}s">${S.inbox} Import</button>`:''}${isB()?`<button class="bs" id="bookmarkRestore" title="Preview and restore a bookmarks JSON backup">${I.rest} Restore Backup</button>`:''}${(isK()||isG())?`<button class="ba ba-${ac}" id="authorizedImport" style="border-style:dashed" title="Import only files, folders, or text you explicitly provide">${S.inbox} Authorized Import</button>`:''}${isK()?`<button class="bs" id="claudeSkillsPage" title="Open the official Claude Skills page">${I.open} Official Claude Skills</button>`:''}${isS()?`<button class="ba ba-s" id="clipPaste" style="border-style:dashed">${S.clip} Paste</button><button class="ba ba-s" id="upClip" style="border-style:dashed" title="Upload .md/.txt files as clips">${S.inbox} Upload</button>`:''}${isN()?`<button class="ba ba-n" id="upNote" style="border-style:dashed" title="Upload .md/.txt files as notes">${S.inbox} Upload</button>`:''}${isP()?`<button class="ba ba-p" id="promptPaste" style="border-style:dashed">${S.clip} Paste</button>`:''}${isPh()?`<button class="ba ba-${ac}" id="phPaste" style="border-style:dashed" title="Paste an image from the clipboard (or press Ctrl+V)">${S.clip} Paste image</button>`:''}${(isN()||isS())?`<button class="ba ba-${ac}" id="reportBtn" style="border-style:dashed" title="Combine notes & clips into one report">${S.doc} Report</button>`:''}<div class="sort-w"><button class="bs" id="soB">${I.sort}</button><div class="sort-m" id="soM" style="display:${s2.sortOn?'block':'none'}">${[["modified","Modified"],["name","Name"],["created","Created"],["usage","Used"],["custom","Custom"]].map(([k,l])=>`<div class="sort-o ${s2.sort===k?'a':''}" data-s="${k}">${l}</div>`).join("")}</div></div>${isL()?`<button class="bs" id="listModeBtn" title="${s2.listMode==='compact'?'Card view':'Compact view'}">${s2.listMode==='compact'?S.hamburger:S.grid}</button>`:''}${(isP()||isS()||isL()||isPh())?`<button class="bs ${st().bulkMode?'active-bulk':''}" id="bulkBtn" title="Select multiple">${S.checkbox}${isPh()?(st().bulkMode?' Done':' Select'):''}</button>`:''}${isL()?`<button class="bs" id="contentExpandBtn" title="Expand view"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>`:''}</div>`;
  if((isP()||isS()||isL())&&st().bulkMode&&st().bulkSel.length){
    h+=`<div class="bulk-bar"><span>${st().bulkSel.length} selected</span>${(isP()||isS())?`<button class="bs" id="bulkTag">+ Tags</button>`:''}<button class="bs" id="bulkMv">${I.move} Move</button><button class="bs dng" id="bulkDl">${I.trash} Delete</button><button class="bs" id="bulkX">Clear</button></div>`;
  }
  if(isPh()&&st().bulkMode&&st().bulkSel.length){
    h+=`<div class="bulk-bar"><span>${st().bulkSel.length} selected · drag any selected photo or use Move mob</span><button class="bs" id="phZip">${I.dl} ZIP</button><button class="bs" id="phEach">${I.dl} Each</button><button class="bs" id="bulkMv">${I.move} Move mob</button><button class="bs dng" id="bulkDl">${I.trash} Delete</button><button class="bs" id="bulkX">Clear</button></div>`;
  }
  if(isP()&&s2.sel===rId()&&!s2.q&&!s2.tagFilter&&!s2.bulkMode){
    const top=allItems(P.folders).filter(x=>(x.usageCount||0)>1).sort((a,b)=>(b.usageCount||0)-(a.usageCount||0)).slice(0,4);
    if(top.length>=2)h+=`<div class="qb">${top.map(t=>`<button class="qb-chip" data-qb="${escAttr(t.id)}" title="Inject: ${escAttr(t.title)} (used ${t.usageCount}x)">${S.bolt} ${esc(t.title.length>24?t.title.slice(0,24)+"\u2026":t.title)}</button>`).join("")}</div>`;
  }
  h+='<div id="iList"></div>';
  if(!f.prompts?.length&&!f.children?.length){
    const totalAll=countItems(P.folders).prompts+countItems(SN.folders).prompts+countItems(BM.folders).prompts+countItems(NT.folders).prompts+countItems(KL.folders).prompts+countItems(GP.folders).prompts+countItems(IP.folders).prompts;
    if(s2.sel===rId()&&totalAll===0){
      h+=`<div class="empty-guide"><div class="empty-icon" style="font-size:24px;margin-bottom:8px">&#9889;</div><div style="font-size:12px;font-weight:600;color:var(--tx);margin-bottom:4px">Welcome to Prompt Vault</div>Your vault is empty. Start with an item or organize first with an empty folder.<div class="empty-action"><button class="bp" id="emptyNew">${I.plus} New ${label}</button><button class="bs" id="emptyFolder">${S.folder} New Folder</button>${siloHasTemplates(aTab)?`<button class="bs" id="emptyTpl">&#128218; Browse Templates</button>`:""}</div><div class="empty-hint" style="text-align:left;max-width:280px;margin:10px auto 0;line-height:1.7">${S.bolt} Press <kbd style="background:var(--hv);padding:1px 4px;border-radius:3px;font-size:8px">Alt+Shift+V</kbd> on any AI chat page for the quick palette<br>${S.clip} Highlight text on any page &rarr; right-click &rarr; <strong>Save clip</strong><br>${S.pin} Right-click any page &rarr; <strong>Bookmark in Prompt Vault</strong><br><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> <kbd style="background:var(--hv);padding:1px 4px;border-radius:3px;font-size:8px">Ctrl+K</kbd> searches everything</div></div>`;
    }else{
      const tabHint=isS()?`<div class="empty-hint" style="margin-top:6px">Tip: AI responses have a &#128190; save button — look for the gold icon on any AI chat page</div>`:"";
      h+=`<div class="empty-guide"><div class="empty-icon" style="font-size:16px">&#128193;</div>No items yet<div class="empty-hint">Click <strong>+ New ${label}</strong> to create one</div>${tabHint}</div>`;
    }
  }else if(!f.prompts?.length&&f.children?.length){
    // Folder has subfolders but no direct items — guide instead of a blank pane.
    const subCount=countItems(f).prompts;
    const lowLabel=isG()?"custom GPT":label.toLowerCase();
    if(subCount>0)h+=`<div class="empty-guide"><div class="empty-icon" style="font-size:16px">&#128193;</div>${subCount} ${esc(lowLabel)}${subCount===1?'':'s'} in subfolders<div class="empty-hint">Open a folder above, or click <strong>+ New ${label}</strong> to add one here</div></div>`;
    else h+=`<div class="empty-guide"><div class="empty-icon" style="font-size:16px">&#128193;</div>No items yet<div class="empty-hint">Click <strong>+ New ${label}</strong> to create one</div></div>`;
  }h+='</div>';c.innerHTML=h;
  c.querySelectorAll("[data-nav]").forEach(el=>{
    el.addEventListener("click",()=>{s2.sel=el.dataset.nav;s2.exp[s2.sel]=1;s2.view="list";render()});
    if(el.classList.contains("sf-chip")){el.addEventListener("dragover",e=>{e.preventDefault();el.classList.add("drop")});el.addEventListener("dragleave",()=>el.classList.remove("drop"));el.addEventListener("drop",e=>{e.preventDefault();el.classList.remove("drop");handleDrop(e,el.dataset.nav);render()})}});
  $("newI")?.addEventListener("click",addItem);
  $("newF")?.addEventListener("click",addFolder);
  $("sectionImport")?.addEventListener("click",()=>{const store=isS()?"snippets":isB()?"bookmarks":"prompts";importPickFiles({store,folder:pvImportDefaultFolder(store)})});
  $("bookmarkRestore")?.addEventListener("click",openBookmarksBackupImport);
  c.querySelectorAll("[data-qb]").forEach(el=>el.addEventListener("click",()=>{
    const t=allItems(P.folders).find(x=>x.id===el.dataset.qb);
    if(t)handleUse(t.folderId,t,"inject");
  }));
  $("emptyNew")?.addEventListener("click",addItem);
  $("emptyFolder")?.addEventListener("click",addFolder);
  $("emptyTpl")?.addEventListener("click",()=>{meta._tplSilo=aTab;meta._tplCat="";aTab="templates";render()});
  $("authorizedImport")?.addEventListener("click",()=>openAuthorizedImport(isK()?"skills":"customgpts"));
  $("claudeSkillsPage")?.addEventListener("click",openOfficialClaudeSkills);
  $("clipPaste")?.addEventListener("click",clipFromClipboard);
  // Upload text files straight into the current Notes/Clips folder — one item per file.
  const _uploadTextFiles=silo=>{
    const input=document.createElement("input");
    input.type="file";input.accept=".md,.markdown,.txt,.text";input.multiple=true;
    input.addEventListener("change",async()=>{
      const files=[...input.files];if(!files.length)return;
      pushUndo();
      const d2=dt();const fold=findFolder(d2.folders,st().sel)||d2.folders;
      fold.prompts=fold.prompts||[];
      let n=0;
      for(const file of files){
        const text=await file.text();
        const title=file.name.replace(/\.(md|markdown|txt|text)$/i,"");
        if(fold.prompts.find(p=>p.title===title))continue;
        const item=buildItem(d2,title,text,[]);
        item.provenance={source:"file-upload",fileName:file.name,capturedAt:Date.now()};
        if(silo==="snippets"){item.sourceType="web";item.capturedAt=Date.now()}
        fold.prompts.push(item);n++;
      }
      save();render();flash(`OK Uploaded ${n} file${n!==1?"s":""}`);
    });
    input.click();
  };
  $("upClip")?.addEventListener("click",()=>_uploadTextFiles("snippets"));
  $("upNote")?.addEventListener("click",()=>_uploadTextFiles("notes"));
  $("phPaste")?.addEventListener("click",pvPastePhoto);
  $("reportBtn")?.addEventListener("click",()=>openReportBuilder());
  $("promptPaste")?.addEventListener("click",async()=>{
    try{
      let text="";
      try{const items=await navigator.clipboard.read();for(const item of items){if(item.types.includes("text/html")){const blob=await item.getType("text/html");text=htmlToFormattedText(await blob.text());break}}}catch{}
      if(!text)text=await navigator.clipboard.readText();
      if(!text||!text.trim()){flash("Clipboard is empty");return}
      const s2=st(),d2=dt(),f=findFolder(d2.folders,s2.sel);if(!f){flash("No folder selected");return}
      pushUndo();
      const id=generateId(d2);
      const title=(text.split("\n")[0]||"").slice(0,80).trim()||"Pasted Prompt";
      f.prompts=f.prompts||[];
      f.prompts.push({id,title,content:text.trim(),tags:[],platform:detectPlatform("")||"",created:Date.now(),modified:Date.now(),usageCount:0,favorited:false,versions:[]});
      save();render();flash("Prompt saved from clipboard");
    }catch(e){flash("Cannot read clipboard")}
  });
  $("soB")?.addEventListener("click",()=>{s2.sortOn=!s2.sortOn;render()});
  $("listModeBtn")?.addEventListener("click",()=>{s2.listMode=isG()?(s2.listMode==="launcher"?"card":s2.listMode==="card"?"compact":"launcher"):(s2.listMode==="compact"?"card":"compact");render()});
  $("bulkBtn")?.addEventListener("click",()=>{st().bulkMode=!st().bulkMode;st().bulkSel=[];render()});
  $("phZip")?.addEventListener("click",()=>pvPhotoBulkZip());
  $("phEach")?.addEventListener("click",()=>pvPhotoBulkEach());
  $("contentExpandBtn")?.addEventListener("click",()=>{openFullView(isG()?"gpt-cards":"bk-cards")});
  $("bulkX")?.addEventListener("click",()=>{st().bulkSel=[];render()});
  $("bulkTag")?.addEventListener("click",()=>{const sel=st().bulkSel;if(!sel.length)return;
    showModal(`<h3>Add tags to ${sel.length} items</h3><input type="text" id="bulkTagIn" placeholder="comma separated" style="width:100%;margin-top:6px;background:var(--inp);border:1px solid var(--bl);border-radius:4px;padding:6px;color:var(--tx);font-size:11px"><div class="brow" style="margin-top:8px"><button class="bg-btn" id="btX">Cancel</button><button class="bp" id="btY">Apply</button></div>`,mc=>{
      mc.querySelector("#btX").addEventListener("click",closeModal);
      mc.querySelector("#btY").addEventListener("click",()=>{
        const tags=(mc.querySelector("#bulkTagIn").value||"").split(",").map(x=>x.trim()).filter(Boolean);
        if(!tags.length){closeModal();return}
        pushUndo();const d2=dt();
        for(const pid of sel){
          for(const fi of allFolders(d2.folders)){
            const fold=findFolder(d2.folders,fi.id);if(!fold)continue;
            const pr=fold.prompts?.find(x=>x.id===pid);
            if(pr){pr.tags=[...new Set([...(pr.tags||[]),...tags])];pr.modified=Date.now();break}
          }
        }
        save();st().bulkSel=[];st().bulkMode=false;closeModal();flash("Tagged");render()})})});
  $("bulkDl")?.addEventListener("click",()=>{if(!st().bulkSel.length)return;
    const n=st().bulkSel.length;
    showModal(`<h3>Delete ${n} items?</h3><p>All selected items → Trash (${TR_D}d).</p><div class="brow"><button class="bg-btn" id="bdX">Cancel</button><button class="bdn" id="bdY">Delete</button></div>`,mc=>{
      mc.querySelector("#bdX").addEventListener("click",closeModal);
      mc.querySelector("#bdY").addEventListener("click",()=>{pushUndo();const d2=dt();
        for(const pid of st().bulkSel){for(const fi of allFolders(d2.folders)){const fold=findFolder(d2.folders,fi.id);if(fold){const idx=fold.prompts.findIndex(x=>x.id===pid);if(idx>=0){toTrash("prompt",pid,fold.prompts[idx].title,fold.prompts[idx]);fold.prompts.splice(idx,1);break}}}}
        save();st().bulkSel=[];st().bulkMode=false;closeModal();flash("Deleted");render()})})});
  $("bulkMv")?.addEventListener("click",()=>{if(!st().bulkSel.length)return;
    const flds=allFolders(dt().folders);const n=st().bulkSel.length;
    showModal(`<h3>Move ${n} items to</h3><div class="fp">${flds.map(f=>`<div class="fpi" data-id="${f.id}" style="padding-left:${6+f.depth*10}px">${V.f(0,f.color||undefined)} ${esc(f.name)}</div>`).join("")}</div>`,mc=>{
      mc.querySelectorAll(".fpi").forEach(el=>{el.addEventListener("click",()=>{pushUndo();const d2=dt(),tgt=findFolder(d2.folders,el.dataset.id);if(!tgt)return;
        if(isPh())pvMovePhotoMob(st().bulkSel,el.dataset.id);
        else for(const pid of st().bulkSel){for(const fi of allFolders(d2.folders)){const fold=findFolder(d2.folders,fi.id);if(fold&&fold.id!==el.dataset.id){const idx=fold.prompts.findIndex(x=>x.id===pid);if(idx>=0){const[p]=fold.prompts.splice(idx,1);tgt.prompts=tgt.prompts||[];tgt.prompts.push(p);break}}}}
        save();st().bulkSel=[];st().bulkMode=false;closeModal();flash("Moved");render()})})})});
  c.querySelectorAll(".sort-o").forEach(el=>{el.addEventListener("click",()=>{s2.sort=el.dataset.s;s2.sortOn=0;render()})});
  const l=$("iList");if(f.prompts?.length){const sorted=getSorted(f);
    l.classList.toggle("launch-grid",isG()&&st().listMode==="launcher");
    l.classList.toggle("photo-grid",isPh()&&st().listMode==="gallery");
    const PAGE=40;const visible=sorted.slice(0,PAGE);
    if(isPh()&&st().listMode==="gallery")visible.forEach(p=>l.appendChild(mkPhotoTile(p,s2.sel)));
    else if(isG()&&st().listMode==="launcher")visible.forEach(p=>l.appendChild(mkLaunchTile(p,s2.sel)));
    else if(isL()&&s2.listMode==="compact")visible.forEach(p=>l.appendChild(mkCompactCard(p,s2.sel)));
    else visible.forEach(p=>l.appendChild(mkCard(p,s2.sel)));
    if(sorted.length>PAGE){const more=document.createElement("button");more.className="bs show-more-btn";more.textContent=`Show ${sorted.length-PAGE} more`;more.addEventListener("click",()=>{more.remove();const rest=sorted.slice(PAGE);if(isPh()&&st().listMode==="gallery")rest.forEach(p=>l.appendChild(mkPhotoTile(p,s2.sel)));else if(isG()&&st().listMode==="launcher")rest.forEach(p=>l.appendChild(mkLaunchTile(p,s2.sel)));else if(isL()&&s2.listMode==="compact")rest.forEach(p=>l.appendChild(mkCompactCard(p,s2.sel)));else rest.forEach(p=>l.appendChild(mkCard(p,s2.sel)))});l.appendChild(more)}}}
function getSorted(f){const s2=st(),p=[...(f.prompts||[])];
  if(s2.sort==="custom")return isPh()?p:[...p.filter(x=>x.favorited),...p.filter(x=>!x.favorited)];
  switch(s2.sort){case"name":p.sort((a,b)=>a.title.localeCompare(b.title));break;case"created":p.sort((a,b)=>(b.created||0)-(a.created||0));break;case"usage":p.sort((a,b)=>(b.usageCount||0)-(a.usageCount||0));break;default:p.sort((a,b)=>(b.modified||0)-(a.modified||0))}
  if(isP()&&_uiBoostPlat){
    const bump=arr=>arr.slice().sort((a,b)=>(b.platform===_uiBoostPlat?1:0)-(a.platform===_uiBoostPlat?1:0));
    return[...bump(p.filter(x=>x.favorited)),...bump(p.filter(x=>!x.favorited))];
  }
  return[...p.filter(x=>x.favorited),...p.filter(x=>!x.favorited)]}

// ── Card rendering helpers (shared patterns for mkCard) ──
function cardHeader(p,opts={}){const showF=opts.showF;return`<div style="display:flex;align-items:center;gap:3px"><span class="ttext" title="${escAttr(p.title)}">${esc(p.title)}</span>${p.favorited?`<span style="color:var(--tab-ac);display:flex">${V.st(1)}</span>`:''}</div>${showF?`<div style="font-size:8px;color:var(--dm);margin-top:1px">${esc(p.folderName||'')}</div>`:''}`}
function cardMeta(p,opts={}){const dateStr=opts.dateStr||formatDate(p.modified||p.created);const extras=opts.extras||[];return`<div class="meta"><span>${dateStr}</span><div class="metar">${extras.join('')}</div></div>`}
function cardTags(p,opts={}){const ac=opts.ac||acC();const platBadge=p.platform?`<span class="tag tag-plat">${getPlatIcon(p.platform)} ${getPlatName(p.platform).split("/")[0].trim()}</span>`:'';const mjBadge=p.platform==="midjourney"&&p.params?`<span class="tag tag-mj" title="${esc(buildMjSuffix(p.params))}">${compactMjBadge(p.params)}</span>`:'';const srcBadge=p.sourceType?`<span class="tag tag-plat">${p.sourceType==="ai"?S.ai+" AI":S.web+" Web"}</span>`:'';const regTags=(p.tags||[]).map(t=>`<span class="tag tag-${ac} tag-clickable" data-star-tag="${esc(t)}">${getStarredTags().includes(t)?S.star+' ':''}${esc(t)}</span>`).join('');return platBadge+mjBadge+srcBadge+(opts.extraBadges||'')+regTags}
/** One primary verb per silo + favorite + ⋯ overflow. Everything else lives in
 *  the item menu (right-click or ⋯) — same actions, no icon soup. */
function moreBtn(){return `<button class="ib more-btn" data-a="more" title="More actions">${I.more}</button>`}
function cardActions(p,fid,opts={}){const ac=opts.ac||acC();
  let btns=`<button class="ib ac" data-a="fv" title="${p.favorited?'Unfavorite':'Favorite'}">${V.st(p.favorited)}</button>`;
  // Primary button follows the silo's verb: prompts fire, clips/notes get copied.
  if(isP())btns=`<button class="inj-btn inj-${ac}" data-a="inj" title="Inject into chat">${S.bolt} Inject</button><button class="ib ac" data-a="cp" title="Copy to clipboard">${I.copy}</button>`+btns;
  if(isS()||isN())btns=`<button class="inj-btn inj-${ac}" data-a="cp" title="Copy to clipboard">${I.copy} Copy</button>`+btns;
  if(isK())btns=`<button class="ib gn" data-a="inj" title="Inject">${I.bolt}</button>`+btns;
  if(isL()&&p.url)btns=`<button class="ib bki" data-a="opn" title="Open">${I.open}</button>`+btns;
  btns+=moreBtn();return btns}

/** Every action available on an item, in one place. Used by both right-click and
 *  the ⋯ button on each card — same menu, two doors. */
function cardMenuItems(p,fid,opts={}){
  const items=[];
  if(isP()||isI()||isK()||isS()||isN())items.push({a:"inj",l:"Inject into page",ic:I.bolt,fn:()=>handleUse(fid,p,"inject")});
  if(isK())items.push({a:"deploy",l:"Deploy to conversation",ic:I.send,fn:()=>deploySkill(p)});
  if(isK())items.push({a:"sys",l:"Inject as system context",ic:I.bolt,fn:()=>handleUse(fid,p,"inject_system")});
  if(isK())items.push({a:"dlmd",l:"Download SKILL.md",ic:I.dl,fn:()=>downloadSkillMd(p)});
  // Some views hand cardMenuItems a copy (allItems spreads) — always mutate the live item.
  const _liveItem=()=>{const f=findFolder(dt().folders,p.folderId||fid);return f?.prompts?.find(x=>x.id===p.id)||p};
  if(isK()&&!/^\s*---\n/.test(p.content||""))items.push({a:"yaml",l:"Convert to Claude skill format",ic:S.wrench,fn:()=>{
    // Claude skills need YAML front matter (name + description). Prepend it.
    const live=_liveItem();
    pushUndo();
    const slug=(live.title||"skill").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,64)||"skill";
    const desc=(live.description||live.content||"").split("\n")[0].slice(0,200)||live.title;
    live.content=`---\nname: ${slug}\ndescription: ${desc}\n---\n\n`+(live.content||"");
    live.modified=Date.now();save();render();flash("OK Claude YAML front matter added");
  }});
  if(isG())items.push({a:"acct",l:p.account?`ChatGPT account: ${p.account}`:"Set ChatGPT account…",ic:S.gear,fn:()=>{
    showModal(`<h3>ChatGPT Account</h3><p style="font-size:10px;color:var(--dm)">Which ChatGPT account hosts this custom GPT (e.g. work@…, personal). Shown on the tile.</p><input type="text" id="gaI" value="${escAttr(p.account||"")}" placeholder="personal / work@company.com"><div class="brow"><button class="bg-btn" id="gaX">Cancel</button><button class="bp" id="gaY">Save</button></div>`,mc=>{
      const inp=mc.querySelector("#gaI");inp.focus();inp.select();
      mc.querySelector("#gaX").addEventListener("click",closeModal);
      mc.querySelector("#gaY").addEventListener("click",()=>{const live=_liveItem();live.account=inp.value.trim();live.modified=Date.now();save();closeModal();render()});
      inp.addEventListener("keydown",e=>{if(e.key==="Enter")mc.querySelector("#gaY").click()});
    });
  }});
  if(isK()&&p.files&&Object.keys(p.files).length)items.push({a:"dlzip",l:"Download .skill package",ic:I.dl,fn:()=>downloadSkillZip(p)});
  if((isS()||isN()))items.push({a:"mkprompt",l:"Turn into a prompt",ic:S.bolt,fn:()=>promoteToPrompt(fid,p)});
  if(isL()&&p.url)items.push({a:"opn",l:"Open in New Tab",ic:I.open,fn:()=>openUrl(p.url)},{a:"opnw",l:"Open in New Window",ic:I.open,fn:()=>openUrlWindow(p.url)});
  if(isB()&&(BM.sectionPanels||[]).length)items.push({a:"pin",l:"Pin to Section Panel",ic:S.pin,fn:()=>spPinToPanel(p.id)});
  items.push({a:"cp",l:"Copy",ic:I.copy,fn:()=>handleUse(fid,p,"copy")},
    {a:"share",l:"Share / Export",ic:I.share,fn:()=>exportSinglePrompt(p)});
  if(isN())items.push({a:"expmd",l:"Download as .md",ic:I.dl,fn:()=>exportNote(p)});
  items.push({sep:1},
    {a:"ed",l:"Edit",ic:I.edit,fn:()=>{if(fid!==st().sel)st().sel=fid;openItem(p);render()}},
    {a:"dp",l:"Duplicate",ic:I.dup,fn:()=>dupItem(fid,p.id)},
    {a:"mv",l:"Move to...",ic:I.move,fn:()=>mvMd(p.id,fid)},
    {a:"cpf",l:"Copy to folders...",ic:I.copy,fn:()=>copyMd(p.id,fid)});
  items.push({a:"coll",l:"Add to collection...",ic:I.coll,fn:()=>collAssignMd(p.id)});
  if(WS_TYPE&&WS_TYPE[aTab])items.push({a:"ws2",l:"Add to workspace...",ic:I.coll,fn:()=>wsAssignItem(aTab,p.id,p.title||p.content||p.url)});
  if(WS_TYPE&&WS_TYPE[aTab])items.push({a:"wsin",l:"Send to workspace Inbox",ic:S.inbox,fn:()=>wsInboxCapture(aTab,p.id)});
  if(opts.collId)items.push({a:"rmcoll",l:"Remove from collection",ic:I.trash,fn:()=>{removeFromColl(opts.collId,p.id);flash("Removed");render()}});
  items.push(
    {a:"fv",l:p.favorited?"Unfavorite":"Favorite",ic:V.st(p.favorited),fn:()=>togFav(fid,p.id)},
    {a:"hi",l:"History",ic:I.hist,fn:()=>hiMd(p,fid)},
    isP()?{a:"sim",l:"Prompts like this",ic:I.spark,fn:()=>similarPromptsMd(p)}:null,
    isP()?{a:"lab",l:"Add to Lab",ic:I.flask,fn:()=>addPromptToLab(p.id)}:null,
    {sep:1},{a:"dl",l:"Delete",ic:I.trash,cls:"dng",fn:()=>delMd("prompt",p.id,p.title)});
  return items.filter(Boolean);
}

function mkCard(p,fid,opts={}){
  const ac=acC(),el=document.createElement("div");el.className="pc";el.draggable=true;el.dataset.pid=p.id;el.dataset.psrc=fid;
  el.addEventListener("dragstart",e=>{
    e.dataTransfer.setData("pid",p.id);e.dataTransfer.setData("psrc",fid);el.classList.add("drag");
    // Skills: attach as a real File so it can be dropped into Claude as a file upload
    if(isK()&&p.content){
      const fname=(p.title||"skill").replace(/[^a-zA-Z0-9_-]/g,"-").toLowerCase()+".md";
      const file=new File([p.content],fname,{type:"text/markdown"});
      try{e.dataTransfer.items.add(file);e.dataTransfer.effectAllowed="copyMove"}catch(err){console.warn("File drag not supported:",err)}
    }
  });
  el.addEventListener("dragend",()=>el.classList.remove("drag"));
  // Card-level drop zone for reordering within same folder
  el.addEventListener("dragover",e=>{
    e.preventDefault();
    const rect=el.getBoundingClientRect();
    const pct=(e.clientY-rect.top)/rect.height;
    el.classList.remove("dov-above","dov-below");
    el.classList.add(pct<0.5?"dov-above":"dov-below");
    el.dataset.cardDropPos=pct<0.5?"above":"below";
  });
  el.addEventListener("dragleave",()=>{el.classList.remove("dov-above","dov-below");delete el.dataset.cardDropPos});
  el.addEventListener("drop",e=>{
    e.preventDefault();e.stopPropagation();
    const pos=el.dataset.cardDropPos||"below";
    el.classList.remove("dov-above","dov-below");delete el.dataset.cardDropPos;
    const dragPid=e.dataTransfer.getData("pid"),dragSrc=e.dataTransfer.getData("psrc"),dragFid=e.dataTransfer.getData("fid");
    // Card-to-card reorder within same folder
    if(dragPid&&dragSrc===fid&&dragPid!==p.id){
      pushUndo();const folder=findFolder(dt().folders,fid);if(folder){
        const srcIdx=folder.prompts.findIndex(x=>x.id===dragPid);
        if(srcIdx>=0){
          const[moved]=folder.prompts.splice(srcIdx,1);
          let tgtIdx=folder.prompts.findIndex(x=>x.id===p.id);
          if(tgtIdx<0)tgtIdx=folder.prompts.length;
          else if(pos==="below")tgtIdx++;
          folder.prompts.splice(tgtIdx,0,moved);
          st().sort="custom"; // Preserve manual order
          save();render();
        }
      }
    }
    // Card dragged to different folder — fall through to handleDrop
    else if(dragPid&&dragSrc&&dragSrc!==fid){handleDrop(e,fid,"inside")}
    // Folder dragged onto card — treat as move into this card's folder
    else if(dragFid){handleDrop(e,fid,"inside")}
  });
  el.addEventListener("contextmenu",e=>showContextMenu(e,cardMenuItems(p,fid,opts)));

  const vars=isP()?extractVars(p.content):[];
  const btns=cardActions(p,fid,{ac});

  // ── Bookmark-specific card layout: color stripe + colored tags ──
  if(isL()){
    const fColor=folderColorFor(fid);
    // First colored tag as fallback stripe color
    const firstTagColor=(p.tags||[]).map(t=>getTagColor(t)).find(tc=>tc.v);
    const stripeColor=fColor||firstTagColor?.v||"";
    const stripeHi=stripeColor||"var(--mu)";
    el.className="pc pc-bk";
    if(stripeColor)el.style.setProperty("--bk-stripe",stripeColor);
    if(stripeHi)el.style.setProperty("--bk-stripe-hi",stripeHi);

    const inBulk=st().bulkMode;const isSel=inBulk&&st().bulkSel.includes(p.id);
    // Collection membership dots
    const cols=collData().collections||[];
    const inCols=cols.filter(c=>(c.items||[]).includes(p.id));
    const collDots=inCols.map(c=>{const bg2=c.color?TAG_COLORS.find(tc=>tc.v===c.color):null;return`<span class="coll-dot" title="${esc(c.name)}" style="background:${bg2?.v||'var(--dm)'}"></span>`}).join('');
    let bkBtns=p.url?`<button class="ib bki" data-a="opn" title="Open in Tab">${I.open}</button>`:"";
    bkBtns+=`<button class="ib" data-a="fv" title="${p.favorited?'Unfavorite':'Favorite'}">${V.st(p.favorited)}</button>`;
    bkBtns+=moreBtn();
    // Colored tags
    const bkTags=(p.tags||[]).map(t=>{const tc=getTagColor(t);return`<span class="tag-col ${tc.v?'':'tag-col-default'}" style="${tc.v?`background:${tc.bg};color:${tc.fg}`:''}" data-star-tag="${esc(t)}" data-tag-color="${esc(t)}">${getStarredTags().includes(t)?S.star+' ':''}${esc(t)}</span>`}).join('');
    el.innerHTML=`<div class="trow"><div class="tleft" data-a="${inBulk?'bulk':'opn'}" style="cursor:pointer">${inBulk?`<span class="bulk-chk ${isSel?'checked':''}" data-a="bulk">${isSel?S.checkbox:S.checkboxEmpty}</span>`:`<span class="bk-icon">${favicon(p.url,24)}</span>`}<div style="min-width:0"><div style="display:flex;align-items:center;gap:4px"><span class="ttext" title="${escAttr(p.title)}">${esc(p.title)}</span>${p.favorited?`<span style="color:var(--tab-ac);display:flex">${V.st(1)}</span>`:''}</div><div class="bk-domain">${esc(domain(p.url||''))}</div>${opts.showF?`<div style="font-size:8px;color:var(--dm);margin-top:1px">${esc(p.folderName||'')}</div>`:''}${bkTags?`<div class="tags" style="margin-top:2px">${bkTags}</div>`:''}</div></div>${inBulk?'':`<div class="acts">${bkBtns}</div>`}</div>
    ${p.content?`<div class="prev bk-notes" data-a="open">${esc(p.content)}</div>`:''}
    <div class="meta"><span>${formatDate(p.modified||p.created)}</span><div class="metar">${collDots}${(p.usageCount||0)>0?`<span>${p.usageCount}x</span>`:''}${(p.versions?.length||0)>0?`<span>${p.versions.length}v</span>`:''}</div></div>
    <div class="coll-drop" data-drop-for="${p.id}" style="display:none"></div>`;
    if(isSel)el.style.borderColor='var(--nt)';
  } else if(isK()){
  // ── Skill card: file package, drag-to-deploy ──
  el.className="pc pc-skill";
  const summary=skillFileSummary(p);
  const dirPills=Object.entries(summary.dirs).map(([d,ct])=>`<span class="sk-dp">${esc(d==="(root)"?"":d+"/")}${ct}</span>`).join("");
  const fname=(p.title||"skill").replace(/[^a-zA-Z0-9_-]/g,"-").toLowerCase();
  const desc=p.description||parseSkillYaml(p.content).description||"";
  const skTags=(p.tags||[]).map(t=>`<span class="tag tag-k tag-clickable" data-star-tag="${esc(t)}">${getStarredTags().includes(t)?S.star+' ':''}${esc(t)}</span>`).join('');
  el.innerHTML=`<div class="sk-card">
    <div class="sk-drag" title="Drag into Claude conversation">
      <div class="sk-icon">${S.package}</div>
      <div class="sk-grip">${I.grip}<br>${I.grip}</div>
    </div>
    <div class="sk-body" data-a="open">
      <div class="sk-title" title="${escAttr(p.title)}">${esc(p.title)}${p.favorited?` <span style="color:var(--sk)">${V.st(1)}</span>`:''}</div>
      <div class="sk-fname">${esc(fname)}/ · ${summary.fileCount} file${summary.fileCount===1?'':'s'} · ${summary.totalKB}KB</div>
      ${desc?`<div class="sk-desc">${esc(desc.slice(0,100))}${desc.length>100?'...':''}</div>`:''}
      ${dirPills?`<div class="sk-dirs">${dirPills}</div>`:''}
      ${skTags?`<div class="tags" style="margin-top:3px">${skTags}</div>`:''}
    </div>
    <div class="sk-acts">
      <button class="ib sk-deploy" data-a="deploy" title="Deploy to conversation">${S.rocket}</button>
      <button class="ib" data-a="fv" title="${p.favorited?'Unfavorite':'Favorite'}">${V.st(p.favorited)}</button>
      ${moreBtn()}
    </div>
  </div>
  <div class="meta"><span>${formatDate(p.modified||p.created)}</span><div class="metar">${p.lastDeployed?`<span class="sk-ld">deployed ${formatDate(p.lastDeployed)}</span>`:''}${(p.usageCount||0)>0?`<span>${p.usageCount}x</span>`:''}${(p.versions?.length||0)>0?`<span>${p.versions.length}v</span>`:''}</div></div>`;
  } else {
  const indexes=opts.indexes||_renderIndexes;
  // Linked prompt indicator (clips)
  const linkedP=isS()&&p.linkedPromptId?indexes?.promptById?.get(p.linkedPromptId)||null:null;
  const linkedBadge=linkedP?`<span class="tag tag-link" title="Linked to: ${esc(linkedP.title)}">${S.link} ${esc(linkedP.title.slice(0,20))}</span>`:'';
  const linkedClipCt=isP()?(indexes?.clipCountByPromptId?.get(p.id)||0):0;
  const clipBadge=linkedClipCt?`<span class="tag tag-link">${S.clip} ${linkedClipCt} clip${linkedClipCt!==1?'s':''}</span>`:'';
  const fragRefs=(p.content||"").match(/\{\{ref:([^}]+)\}\}/g);
  const fragBadge=fragRefs?`<span class="tag tag-frag">${S.paperclip} ${fragRefs.length} ref${fragRefs.length!==1?'s':''}</span>`:'';
  const nextP=isP()&&p.nextId?indexes?.promptById?.get(p.nextId)||null:null;
  const nextBadge=nextP?`<span class="tag tag-chain" title="Follow-up: ${esc(nextP.title)}">${S.arrow} ${esc(nextP.title.slice(0,20))}</span>`:'';
  const extraBadges=linkedBadge+clipBadge+fragBadge+nextBadge;
  const metaDateStr=!(isS()&&(p.sourceTitle||p.sourceUrl))&&p.capturedAt?formatDateTime(p.capturedAt):formatDate(p.modified||p.created);
  const metaExtras=[!isL()&&tokenEstimate(p.content)>0?`<span>~${tokenEstimate(p.content)}t</span>`:'',(p.usageCount||0)>0?`<span>${p.usageCount}x</span>`:'',vars.length?'<span style="color:var(--tab-ac)">&lt;v&gt;</span>':'',(p.versions?.length||0)>0?`<span>${p.versions.length}v</span>`:''].filter(Boolean);
  const inBulkPs=(isP()||isS())&&st().bulkMode;
  const isBulkSel=inBulkPs&&st().bulkSel.includes(p.id);
  const prov=p.provenance||null;

  el.innerHTML=`<div class="trow"><div class="tleft" data-a="${inBulkPs?'bulk':'open'}" style="cursor:pointer">${inBulkPs?`<span class="bulk-chk ${isBulkSel?'checked':''}" data-a="bulk">${isBulkSel?S.checkbox:S.checkboxEmpty}</span>`:`<span style="color:var(--dm);cursor:grab;padding-top:1px">${I.grip}</span>`}<div style="min-width:0">${cardHeader(p,{showF:opts.showF})}
  <div class="tags">${cardTags(p,{ac,extraBadges})}</div></div></div><div class="acts">${btns}</div></div>
  ${p.content?`<div class="prev note-rendered" data-a="open">${isN()?renderNoteContent(p.content):esc(p.content)}</div>`:''}
  ${p.url?`<div class="src src-bk" data-a="opn" style="cursor:pointer;display:flex;align-items:center;gap:4px" title="${esc(p.url)}">${favicon(p.url)} ${esc(domain(p.url))}</div>`:''}
  ${(isS()||isN())&&(p.sourceTitle||p.sourceUrl)?`<div class="conv-stamp${p.platform?' conv-ai':''}">${p.platform?`<span class="conv-plat">${getPlatIcon(p.platform)}</span>`:(p.sourceUrl?favicon(p.sourceUrl):'')}<span class="conv-title">${esc(p.sourceTitle||(p.sourceUrl?domain(p.sourceUrl):''))}</span>${p.capturedAt?`<span class="conv-time">${formatDateTime(p.capturedAt)}</span>`:''}</div>`:''}
  ${prov?`<div class="prov-stamp" title="${esc(prov.sourceUrl||'')}"><span>Captured</span>${prov.sourceDomain?`<strong>${esc(prov.sourceDomain)}</strong>`:''}${prov.captureMethod?`<span>${esc(prov.captureMethod.replace(/-/g,' '))}</span>`:''}${prov.capturedAt?`<span>${formatDateTime(prov.capturedAt)}</span>`:''}</div>`:''}
  ${cardMeta(p,{dateStr:metaDateStr,extras:metaExtras})}
  ${!isL()?`<div class="coll-drop" data-drop-for="${p.id}" style="display:none"></div>`:''}`;
  if(isBulkSel)el.style.borderColor="var(--nt)";
  }

  el.querySelectorAll("[data-a]").forEach(btn=>{btn.addEventListener("click",e=>{e.stopPropagation();e.preventDefault();
    switch(btn.dataset.a){
      case"open":if(fid!==st().sel)st().sel=fid;openItem(p);render();break;
      case"inj":handleUse(fid,p,"inject");break;case"cp":handleUse(fid,p,"copy");break;
      case"mkprompt":promoteToPrompt(fid,p);break;
      case"dlmd":downloadSkillMd(p);break;
      case"deploy":deploySkill(p);break;
      case"opn":if(p.url)openUrl(p.url);break;
      case"opnw":if(p.url)openUrlWindow(p.url);break;
      case"fv":togFav(fid,p.id);break;case"dl":delMd("prompt",p.id,p.title);break;
      case"more":showContextMenuAt(btn,cardMenuItems(p,fid,opts));break;
      case"pin":showCollDrop(el,p.id);break;
      case"bulk":if((isL()||isP()||isS())&&st().bulkMode){const idx=st().bulkSel.indexOf(p.id);if(idx>=0)st().bulkSel.splice(idx,1);else st().bulkSel.push(p.id);render()}break;
    }})});
  // Tag click-to-star / right-click for color
  el.querySelectorAll("[data-star-tag]").forEach(te=>{
    te.addEventListener("click",e=>{e.stopPropagation();const tag=te.dataset.starTag;const starred=getStarredTags();if(!starred.includes(tag))toggleStarTag(tag);st().tagFilter=tag;render()});
    te.addEventListener("contextmenu",e=>{e.preventDefault();e.stopPropagation();showTagColorPicker(te.dataset.starTag,e.clientX,e.clientY)})
  });
  return el}


// ── Launcher tile (GPTs) — the whole tile is the launch button ──
function mkLaunchTile(p,fid){
  const el=document.createElement("div");el.className="lt";el.dataset.pid=p.id;el.dataset.psrc=fid;
  el.title=p.content?p.title+" — "+p.content.slice(0,120):p.title;
  el.innerHTML=`<span class="lt-ic">${favicon(p.url,32)}</span><span class="lt-t">${esc(p.title)}</span>${p.account?`<span style="font-size:7px;color:var(--dm);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.account)}</span>`:""}${p.favorited?`<span class="lt-fv">${V.st(1)}</span>`:""}<button class="ib tile-more" title="More actions">${I.more}</button>`;
  if(p.account)el.title+=" · "+p.account;
  const tileMenu=()=>[
    {a:"edit",l:"Edit",ic:I.edit,fn:()=>{if(fid!==st().sel)st().sel=fid;openItem(p);render()}},
    {a:"opnw",l:"Open in window",ic:I.open,fn:()=>{if(p.url)openUrlWindow(p.url)}},
    {a:"fv",l:p.favorited?"Unfavorite":"Favorite",fn:()=>togFav(fid,p.id)},
    {sep:1},
    {a:"dl",l:"Delete",cls:"dng",ic:I.trash,fn:()=>delMd("prompt",p.id,p.title)},
  ];
  el.addEventListener("click",()=>{if(p.url){handleUse(fid,p,"launch");openUrl(p.url)}else{if(fid!==st().sel)st().sel=fid;openItem(p);render()}});
  el.querySelector(".tile-more").addEventListener("click",e=>{e.stopPropagation();showContextMenuAt(e.currentTarget,tileMenu())});
  el.addEventListener("contextmenu",e=>showContextMenu(e,tileMenu()));
  return el;
}


// ── Photo tile (Photos silo gallery) ──
// Download a photo in its stored format, or transcoded to PNG/JPEG via canvas
// — Chrome decodes anything it can display (webp/avif/gif/…), all local.
async function pvDownloadPhoto(p,fmt){
  try{
    let blob=null;
    if(typeof pvImgGet==="function")blob=await pvImgGet(p.id).catch(()=>null);
    if(!blob&&p.url){const r=await fetch(p.url);blob=await r.blob()}
    if(!blob){flash("No image bytes stored for this photo");return}
    const base=(p.title||"photo").replace(/[^\w\- ]+/g,"").trim()||"photo";
    let out=blob,ext=(blob.type.split("/")[1]||"img").replace("jpeg","jpg");
    if(fmt){
      const bmp=await createImageBitmap(blob);
      const cv=new OffscreenCanvas(bmp.width,bmp.height);
      const cx=cv.getContext("2d");
      if(fmt==="jpeg"){cx.fillStyle="#fff";cx.fillRect(0,0,bmp.width,bmp.height)} // JPEG has no alpha
      cx.drawImage(bmp,0,0);
      out=await cv.convertToBlob(fmt==="png"?{type:"image/png"}:{type:"image/jpeg",quality:0.92});
      ext=fmt==="png"?"png":"jpg";
    }
    const url=URL.createObjectURL(out);
    const a=document.createElement("a");a.href=url;a.download=`${base}.${ext}`;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),4000);
    flash(`OK Downloaded ${ext.toUpperCase()}`);
  }catch(e){flash("Convert failed: "+(e.message||"unsupported image"))}
}

async function pvPhotoBulkZip(){
  const ids=phSt.bulkSel.slice();if(!ids.length)return;
  const items=allItems(PH.folders).filter(p=>ids.includes(p.id));
  flash("Zipping "+items.length+" photos…");
  const files=[];
  for(const p of items){
    let blob=null;
    if(typeof pvImgGet==="function")blob=await pvImgGet(p.id).catch(()=>null);
    if(!blob&&p.url){try{blob=await(await fetch(p.url)).blob()}catch{/* skip unfetchable */}}
    if(!blob)continue;
    const ext=(blob.type.split("/")[1]||"img").replace("jpeg","jpg").replace("svg+xml","svg");
    const base=(p.title||"photo").replace(/[^\w\- ]+/g,"").trim()||"photo";
    files.push({name:base+"."+ext,data:new Uint8Array(await blob.arrayBuffer())});
  }
  if(!files.length){flash("No image bytes to zip");return}
  const zip=pvMakeZip(files);
  const url=URL.createObjectURL(new Blob([zip],{type:"application/zip"}));
  const a=document.createElement("a");a.href=url;a.download=`pv-photos-${new Date().toISOString().slice(0,10)}.zip`;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),5000);
  flash(`OK Zipped ${files.length} photo${files.length!==1?'s':''}`);
}
async function pvPhotoBulkEach(){
  const ids=phSt.bulkSel.slice();if(!ids.length)return;
  const items=allItems(PH.folders).filter(p=>ids.includes(p.id));
  flash("Downloading "+items.length+"…");
  for(const p of items){await pvDownloadPhoto(p,"");await new Promise(r=>setTimeout(r,300))}
}
// ── Photo clipboard: copy a photo out, paste an image in ──
// Ingest raw image bytes as a photo: convert to a data URL and reuse the
// ADD_PHOTO_BY_URL path (background fetches the data URL, builds thumb+dims,
// writes the record + IndexedDB bytes) — no server re-fetch of a remote URL.
function pvIngestImageBlob(blob,folderId,title){
  return new Promise(resolve=>{
    if(!blob||!(blob.type||"").startsWith("image/")){flash("Not an image");resolve(null);return}
    const fr=new FileReader();
    fr.onerror=()=>{flash("Could not read image");resolve(null)};
    fr.onload=()=>{
      flash("Saving image…");
      chrome.runtime.sendMessage({type:"ADD_PHOTO_BY_URL",url:fr.result,folderId:folderId||"phroot",title:title||"Pasted image"},r=>{
        if(r?.success){loadData().then(()=>{aTab="photos";render();flash("OK Image added to Photos")})}
        else flash("Save failed — image may be too large");
        resolve(r);
      });
    };
    fr.readAsDataURL(blob);
  });
}
// Paste an image from the OS clipboard into the current Photos folder.
async function pvPastePhoto(){
  let items=null;
  try{items=await navigator.clipboard.read()}
  catch(e){flash("Clipboard blocked — click the panel then retry, or press Ctrl+V");return}
  let blob=null;
  for(const it of items||[]){
    const imgType=(it.types||[]).find(t=>t.startsWith("image/"));
    if(imgType){try{blob=await it.getType(imgType)}catch{/* next */}if(blob)break}
  }
  if(!blob){flash("No image on the clipboard");return}
  await pvIngestImageBlob(blob,phSt.sel||"phroot","Pasted image");
}
// Copy a stored photo to the OS clipboard as PNG (Chrome's ClipboardItem only
// reliably accepts image/png, so transcode anything else first).
async function pvCopyPhotoToClipboard(p){
  try{
    let blob=null;
    if(typeof pvImgGet==="function")blob=await pvImgGet(p.id).catch(()=>null);
    if(!blob&&p.url){try{blob=await(await fetch(p.url)).blob()}catch{/* unfetchable */}}
    if(!blob){flash("No image bytes stored for this photo");return}
    let png=blob;
    if(blob.type!=="image/png"){
      const bmp=await createImageBitmap(blob);
      const cv=new OffscreenCanvas(bmp.width,bmp.height);
      cv.getContext("2d").drawImage(bmp,0,0);
      png=await cv.convertToBlob({type:"image/png"});
    }
    await navigator.clipboard.write([new ClipboardItem({"image/png":png})]);
    flash("OK Image copied to clipboard");
  }catch(e){flash("Copy failed: "+(e.message||"clipboard blocked"))}
}
function pvPhotoActualItems(node,out=[]){for(const p of(node.prompts||[]))out.push({item:p,folderId:node.id});for(const c of(node.children||[]))pvPhotoActualItems(c,out);return out}
function pvMovePhotoMob(ids,targetFid){
  const wanted=new Set((ids||[]).map(String));if(!wanted.size)return 0;
  const target=findFolder(PH.folders,targetFid);if(!target)return 0;
  const ordered=pvPhotoActualItems(PH.folders).filter(x=>wanted.has(String(x.item.id))).map(x=>x.item);if(!ordered.length)return 0;
  for(const fi of allFolders(PH.folders)){const f=findFolder(PH.folders,fi.id);if(f?.prompts)f.prompts=f.prompts.filter(x=>!wanted.has(String(x.id)))}
  target.prompts=target.prompts||[];target.prompts.push(...ordered);return ordered.length;
}
function pvReorderPhoto(fid,dragId,targetId,pos){
  const folder=findFolder(PH.folders,fid);if(!folder||dragId===targetId)return false;
  const src=folder.prompts.findIndex(x=>String(x.id)===String(dragId));if(src<0)return false;
  const[moved]=folder.prompts.splice(src,1);let dst=folder.prompts.findIndex(x=>String(x.id)===String(targetId));
  if(dst<0)dst=folder.prompts.length;else if(pos==="after")dst++;folder.prompts.splice(dst,0,moved);return true;
}
function pvReorderPhotoCollection(collId,dragId,targetId,pos){
  const col=(PH.collections||[]).find(c=>c.id===collId);if(!col||dragId===targetId)return false;
  const ids=col.items||[];const src=ids.findIndex(id=>String(id)===String(dragId));if(src<0)return false;
  const[moved]=ids.splice(src,1);let dst=ids.findIndex(id=>String(id)===String(targetId));
  if(dst<0)dst=ids.length;else if(pos==="after")dst++;ids.splice(dst,0,moved);return true;
}
function pvClearPhotoDropMarks(){document.querySelectorAll(".pht-drop-before,.pht-drop-after,.pht-drag").forEach(x=>x.classList.remove("pht-drop-before","pht-drop-after","pht-drag"))}
function mkPhotoTile(p,fid){
  const el=document.createElement("div");el.className="pht";el.dataset.pid=p.id;el.dataset.psrc=fid;
  const inBulk=isPh()&&phSt.bulkMode;const isSel=inBulk&&phSt.bulkSel.includes(p.id);
  const canReorder=!inBulk&&!phSt.q&&!phSt.tagFilter;
  if(isSel)el.classList.add("pht-sel");
  el.draggable=canReorder||isSel;
  if(el.draggable)el.addEventListener("dragstart",e=>{
    if(inBulk&&isSel){e.dataTransfer.setData("pv-photo-mob",JSON.stringify(phSt.bulkSel));e.dataTransfer.setData("psrc",fid)}
    else{e.dataTransfer.setData("pid",p.id);e.dataTransfer.setData("psrc",fid)}
    e.dataTransfer.effectAllowed="move";el.classList.add("pht-drag");
  });
  el.addEventListener("dragend",pvClearPhotoDropMarks);
  if(canReorder){
    el.addEventListener("dragover",e=>{const dragId=e.dataTransfer.getData("pid");if(!dragId||dragId===String(p.id))return;e.preventDefault();e.dataTransfer.dropEffect="move";const r=el.getBoundingClientRect(),pos=e.clientX-r.left<r.width/2?"before":"after";el.classList.toggle("pht-drop-before",pos==="before");el.classList.toggle("pht-drop-after",pos==="after");el.dataset.photoDropPos=pos});
    el.addEventListener("dragleave",()=>{el.classList.remove("pht-drop-before","pht-drop-after");delete el.dataset.photoDropPos});
    el.addEventListener("drop",e=>{e.preventDefault();e.stopPropagation();const dragId=e.dataTransfer.getData("pid"),src=e.dataTransfer.getData("psrc"),pos=el.dataset.photoDropPos||"after";pvClearPhotoDropMarks();delete el.dataset.photoDropPos;if(!dragId||dragId===String(p.id))return;
      pushUndo();let changed=false;
      if(phSt.collFilter)changed=pvReorderPhotoCollection(phSt.collFilter,dragId,p.id,pos);
      else if(src===fid)changed=pvReorderPhoto(fid,dragId,p.id,pos);
      else changed=pvMovePhotoMob([dragId],fid)>0;
      if(changed){phSt.sort="custom";save();flash("Photo order updated");render()}
    });
  }
  const src=p.thumb||p.url||"";
  el.title=(p.title||"")+(p.w?` — ${p.w}×${p.h}`:"");
  el.innerHTML=`${src?`<img class="pht-img" src="${escAttr(src)}" loading="lazy" draggable="false">`:`<div class="pht-none">${S.frame}</div>`}${inBulk?`<span class="pht-cb">${isSel?S.checkbox:S.checkboxEmpty}</span>`:""}${p.favorited?`<span class="pht-fv">${V.st(1)}</span>`:""}<button class="ib tile-more" title="More actions">${I.more}</button>`;
  const _im=el.querySelector(".pht-img");
  if(_im)_im.addEventListener("error",()=>{const d=document.createElement("div");d.className="pht-none";d.innerHTML=S.frame;_im.replaceWith(d)});
  const photoMenu=()=>[
    {a:"view",l:"View / slideshow",ic:I.open,fn:()=>openPhotoViewer(fid,p)},
    {a:"src",l:"Open source page",fn:()=>{if(p.pageUrl)openUrl(p.pageUrl);else if(p.url)openUrl(p.url)}},
    {a:"cpy",l:"Copy image",ic:I.copy,fn:()=>pvCopyPhotoToClipboard(p)},
    {a:"cpf",l:"Copy to folders...",ic:I.copy,fn:()=>copyMd(p.id,fid)},
    {a:"coll",l:"Add to collection...",ic:I.coll,fn:()=>collAssignMd(p.id)},
    {a:"dlo",l:"Download (original)",ic:I.dl,fn:()=>pvDownloadPhoto(p,"")},
    {a:"dlp",l:"Download as PNG",ic:I.dl,fn:()=>pvDownloadPhoto(p,"png")},
    {a:"dlj",l:"Download as JPEG",ic:I.dl,fn:()=>pvDownloadPhoto(p,"jpeg")},
    {a:"fv",l:p.favorited?"Unfavorite":"Favorite",fn:()=>togFav(fid,p.id)},
    {sep:1},
    {a:"dl",l:"Delete",cls:"dng",ic:I.trash,fn:()=>delMd("prompt",p.id,p.title)},
  ];
  el.addEventListener("click",()=>{
    if(inBulk){const i=phSt.bulkSel.indexOf(p.id);if(i>=0)phSt.bulkSel.splice(i,1);else phSt.bulkSel.push(p.id);render();return}
    openPhotoViewer(fid,p);
  });
  el.querySelector(".tile-more").addEventListener("click",e=>{e.stopPropagation();showContextMenuAt(e.currentTarget,photoMenu())});
  el.addEventListener("contextmenu",e=>showContextMenu(e,photoMenu()));
  return el;
}
function _phKB(b){return b>1048576?(b/1048576).toFixed(1)+" MB":b>1024?Math.round(b/1024)+" KB":b+" B"}
function pvPhotoViewerItems(fid){
  if(phSt.collFilter){const col=(PH.collections||[]).find(c=>c.id===phSt.collFilter);if(col)return getCollItems(col.id)}
  const f=findFolder(PH.folders,fid);return(f?.prompts||[]).map(x=>({...x,folderId:fid,folderName:f.name}));
}
function pvStartFolderSlideshow(fid){const f=findFolder(PH.folders,fid),items=f?allItems(f):[];if(!items.length){flash("No photos in this folder");return}openPhotoViewer(items[0].folderId,items[0],items)}
async function openPhotoViewer(fid,p,scopeItems){
  const seq=(scopeItems?.length?[...scopeItems]:pvPhotoViewerItems(fid));if(!seq.some(x=>String(x.id)===String(p.id)))seq.unshift({...p,folderId:fid});
  let idx=Math.max(0,seq.findIndex(x=>String(x.id)===String(p.id))),objUrl="",timer=0,loadToken=0;
  showModal(`<div class="phv"><div class="phv-stage"><button class="phv-nav phv-prev" id="phvPrev" title="Previous photo" aria-label="Previous photo">‹</button><img id="phvImg" alt=""><button class="phv-nav phv-next" id="phvNext" title="Next photo" aria-label="Next photo">›</button></div>
    <div style="display:flex;align-items:center;gap:6px"><div class="phv-t" id="phvTitle"></div><div class="phv-count" id="phvCount"></div></div><div class="phv-m" id="phvMeta"></div>
    <div class="brow" style="flex-wrap:wrap;justify-content:flex-start"><button class="bs" id="phvPlay">▶ Slideshow</button><button class="bs" id="phvPage">Source page</button><button class="bs" id="phvOrig">Original</button><button class="bs" id="phvFetch">Re-fetch</button><button class="bs" id="phvDl">Download</button><button class="bs dng" id="phvDel">Delete</button><span style="flex:1"></span><button class="bg-btn" id="phvX">Close</button></div></div>`,mc=>{
    const img=mc.querySelector("#phvImg"),play=mc.querySelector("#phvPlay");
    const release=()=>{if(objUrl){try{URL.revokeObjectURL(objUrl)}catch{}objUrl=""}};
    const stop=()=>{if(timer){clearInterval(timer);timer=0}if(play)play.textContent="▶ Slideshow"};
    const cleanup=()=>{stop();release();document.removeEventListener("keydown",keys);observer.disconnect()};
    const draw=async()=>{const token=++loadToken,cur=seq[idx];release();let src=cur.thumb||cur.url||"";try{if(typeof pvImgGet==="function"){const blob=await pvImgGet(cur.id);if(blob&&token===loadToken){objUrl=URL.createObjectURL(blob);src=objUrl}}}catch{}if(token!==loadToken)return;
      img.src=src;img.alt=cur.title||"Photo";mc.querySelector("#phvTitle").textContent=cur.title||"Untitled photo";mc.querySelector("#phvCount").textContent=seq.length>1?`${idx+1} / ${seq.length}`:"";
      const meta2=[cur.w?cur.w+"×"+cur.h:"",cur.mime?cur.mime.replace("image/",""):"",cur.bytes?_phKB(cur.bytes):""].filter(Boolean).join(" · ");mc.querySelector("#phvMeta").innerHTML=esc(meta2)+(cur.hasBlob===false?' · <span style="color:var(--dn)">link only</span>':"");
      mc.querySelector("#phvPage").style.display=cur.pageUrl?"":"none";mc.querySelector("#phvOrig").style.display=cur.url&&!cur.url.startsWith("data:")?"":"none";mc.querySelector("#phvFetch").style.display=cur.hasBlob===false&&cur.url?"":"none";
    };
    const step=n=>{idx=(idx+n+seq.length)%seq.length;draw()};
    const keys=e=>{if(!$("modalC")?.contains(mc))return;if(e.key==="ArrowLeft"){e.preventDefault();step(-1)}else if(e.key==="ArrowRight"){e.preventDefault();step(1)}else if(e.key===" "){e.preventDefault();play.click()}};
    const observer=new MutationObserver(()=>{if(!document.body.contains(mc))cleanup()});observer.observe($("modalC"),{childList:true});document.addEventListener("keydown",keys);
    mc.querySelector("#phvPrev").addEventListener("click",()=>step(-1));mc.querySelector("#phvNext").addEventListener("click",()=>step(1));
    play.addEventListener("click",()=>{if(timer){stop();return}timer=setInterval(()=>step(1),3500);play.textContent="❚❚ Pause"});
    mc.querySelector("#phvX").addEventListener("click",()=>{cleanup();closeModal()});
    mc.querySelector("#phvPage").addEventListener("click",()=>{const cur=seq[idx];if(cur.pageUrl)openUrl(cur.pageUrl)});
    mc.querySelector("#phvOrig").addEventListener("click",()=>{const cur=seq[idx];if(cur.url)openUrl(cur.url)});
    mc.querySelector("#phvFetch").addEventListener("click",()=>{const cur=seq[idx];flash("Fetching…");chrome.runtime.sendMessage({type:"REFETCH_PHOTO",id:cur.id,url:cur.url},r2=>{if(r2?.success){flash("OK Fetched");loadData().then(()=>{cleanup();closeModal();render()})}else flash("Fetch failed — source may be gone")})});
    mc.querySelector("#phvDl").addEventListener("click",()=>pvDownloadPhoto(seq[idx],""));
    mc.querySelector("#phvDel").addEventListener("click",()=>{const cur=seq[idx];cleanup();closeModal();delMd("prompt",cur.id,cur.title)});
    if(seq.length<2){mc.querySelector("#phvPrev").style.display="none";mc.querySelector("#phvNext").style.display="none";play.style.display="none"}draw();
  });
}

async function pvPhotoLoadBlob(p){
  try{if(typeof pvImgGet==="function"){const stored=await pvImgGet(p.id);if(stored)return stored}}catch{}
  if(p.url){try{const r=await fetch(p.url);if(r.ok||p.url.startsWith("data:"))return await r.blob()}catch{}}
  return null;
}
function pvBlobDataUrl(blob){return new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=()=>reject(fr.error||new Error("Could not read image"));fr.readAsDataURL(blob)})}
function pvPhotoBaseName(p){return((p.title||"photo").replace(/[^a-zA-Z0-9 _-]+/g,"").trim().replace(/\s+/g,"-")||"photo").slice(0,80)}
function pvPhotoExtension(blob,p){const t=(blob?.type||p.mime||"").toLowerCase();return t.includes("jpeg")?"jpg":t.includes("png")?"png":t.includes("webp")?"webp":t.includes("gif")?"gif":t.includes("avif")?"avif":t.includes("svg")?"svg":"img"}
async function pvPreparePhotoReport(items){
  const out=[],used=new Set();
  for(let i=0;i<items.length;i++){
    const p=items[i],blob=await pvPhotoLoadBlob(p);let w=Number(p.w)||0,h=Number(p.h)||0;
    if(blob&&(!w||!h)){try{const bmp=await createImageBitmap(blob);w=bmp.width;h=bmp.height;if(bmp.close)bmp.close()}catch{}}
    let name=pvPhotoBaseName(p)+"."+pvPhotoExtension(blob,p),n=2;while(used.has(name.toLowerCase())){name=pvPhotoBaseName(p)+"-"+(n++)+"."+pvPhotoExtension(blob,p)}used.add(name.toLowerCase());
    let dataUrl="";if(blob)try{dataUrl=await pvBlobDataUrl(blob)}catch{}
    out.push({photo:p,blob,dataUrl,w,h,fileName:name});
  }
  return out;
}
function pvBuildPhotoReportHtml(title,records,embedded){
  const date=new Date().toISOString().slice(0,10),available=records.filter(r=>r.blob).length;
  let html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)} — Photo Report</title><style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#171717;background:#fff;max-width:1100px;margin:32px auto;padding:0 24px;line-height:1.45}h1{font-size:25px;margin:0 0 4px}.summary{color:#666;font-size:12px;margin:0 0 28px}.photo{margin:0 0 34px;break-inside:avoid;page-break-inside:avoid;border-top:1px solid #ddd;padding-top:18px}.photo h2{font-size:16px;margin:0 0 4px}.meta,.source{font-size:11px;color:#666;margin:3px 0}.photo img{display:block;width:auto;height:auto;max-width:100%;margin:12px 0 0;object-fit:contain;image-rendering:auto}.missing{padding:22px;border:1px dashed #999;margin-top:10px;color:#777}.native{font-size:10px;color:#555;margin-top:5px}@media print{body{max-width:none;margin:0;padding:12mm}.photo{break-inside:avoid;page-break-inside:avoid}.photo img{width:auto!important;height:auto!important;max-width:100%!important}}</style></head><body><h1>${esc(title)}</h1><p class="summary">${records.length} photo${records.length===1?"":"s"} · ${available} with original image bytes · compiled ${date}. Images retain their original files and intrinsic dimensions; small images are never enlarged.</p>`;
  records.forEach((r,i)=>{const p=r.photo,src=r.blob?(embedded?r.dataUrl:"images/"+encodeURIComponent(r.fileName)):"",dims=r.w&&r.h?`${r.w}×${r.h}`:"dimensions unavailable",kind=(r.blob?.type||p.mime||"").replace("image/","");html+=`<section class="photo"><h2>${i+1}. ${esc(p.title||"Untitled photo")}</h2><div class="meta">${esc([dims,kind,r.blob?_phKB(r.blob.size):"image bytes unavailable",p.folderName||""].filter(Boolean).join(" · "))}</div>`;
    if(src)html+=`<img src="${escAttr(src)}" alt="${escAttr(p.title||"Photo")}"${r.w?` width="${r.w}"`:""}${r.h?` height="${r.h}"`:""}><div class="native">Native size: ${esc(dims)}. Display may shrink to fit the page but will not upscale.</div>`;else html+=`<div class="missing">Image bytes are unavailable in this vault. The metadata and source link are retained below.</div>`;
    if(p.pageUrl||p.url)html+=`<div class="source">Source: <a href="${escAttr(safeUrl(p.pageUrl||p.url)||"")}">${esc(p.pageUrl||p.url)}</a></div>`;html+=`</section>`});
  return html+`</body></html>`;
}
function pvBuildPhotoReportMarkdown(title,records){let md=`# ${title}\n\n${records.length} photos. Original files are in the \`images\` folder; dimensions are recorded without resampling.\n\n`;records.forEach((r,i)=>{const p=r.photo,d=r.w&&r.h?`${r.w}×${r.h}`:"dimensions unavailable";md+=`## ${i+1}. ${p.title||"Untitled photo"}\n\n- Native dimensions: ${d}\n- Format: ${(r.blob?.type||p.mime||"unknown").replace("image/","")}\n- Folder: ${p.folderName||""}\n`;if(r.blob)md+=`\n![${(p.title||"Photo").replace(/[\[\]]/g,"")}](images/${encodeURIComponent(r.fileName)})\n`;if(p.pageUrl||p.url)md+=`\nSource: ${p.pageUrl||p.url}\n`;md+="\n"});return md}
function pvDownloadBrowserBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
function pvPrintPhotoReport(html){
  const blobUrl=URL.createObjectURL(new Blob([html],{type:"text/html"})),frame=document.createElement("iframe");frame.style.cssText="position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:.01";frame.src=blobUrl;document.body.appendChild(frame);
  const clean=()=>{try{frame.remove()}catch{}URL.revokeObjectURL(blobUrl)};frame.onload=()=>setTimeout(()=>{try{frame.contentWindow.focus();frame.contentWindow.print();frame.contentWindow.addEventListener("afterprint",clean,{once:true})}catch{clean();flash("Print preview could not open")}},100);setTimeout(clean,120000);
}
function pvPhotoReportSlug(name){return(name||"photo-collection").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,70)||"photo-collection"}
function pvOpenPhotoReport(scope){
  const items=scope?.items||[],title=scope?.name||"Photo Collection";if(!items.length){flash("No photos to report");return}
  showModal(`<h3>${esc(title)} — Photo Report</h3><p>${items.length} photo${items.length===1?"":"s"} will be compiled for printing or aggregate LLM review.</p><div class="ph-report-note"><strong>Native-quality rule:</strong> reports use each stored original file directly. They never draw through canvas, enlarge thumbnails, or upscale small images. Large images may shrink only for page display.</div><div class="exp-opt" id="phReportPrint"><div class="eo-t">Print / Save PDF</div><div class="eo-d">Self-contained printable report with original images</div></div><div class="exp-opt" id="phReportHtml"><div class="eo-t">Self-contained HTML</div><div class="eo-d">One portable report with original image bytes embedded</div></div><div class="exp-opt" id="phReportZip"><div class="eo-t">LLM review package (.zip)</div><div class="eo-d">HTML + Markdown index + original image files</div></div><div class="brow"><button class="bg-btn" id="phReportX">Cancel</button></div>`,mc=>{
    let prepared=null;const need=async action=>{mc.querySelectorAll("button,.exp-opt").forEach(x=>x.style.pointerEvents="none");flash(`Preparing ${items.length} original photos…`);try{prepared=prepared||await pvPreparePhotoReport(items);closeModal();await action(prepared)}catch(e){closeModal();flash("Photo report failed: "+(e.message||"unknown error"))}};
    mc.querySelector("#phReportX").addEventListener("click",closeModal);
    mc.querySelector("#phReportPrint").addEventListener("click",()=>need(records=>pvPrintPhotoReport(pvBuildPhotoReportHtml(title,records,true))));
    mc.querySelector("#phReportHtml").addEventListener("click",()=>need(records=>{pvDownloadBrowserBlob(new Blob([pvBuildPhotoReportHtml(title,records,true)],{type:"text/html"}),pvPhotoReportSlug(title)+"-photo-report.html");flash("Photo report downloaded")}));
    mc.querySelector("#phReportZip").addEventListener("click",()=>need(async records=>{const enc=new TextEncoder(),files=[{name:"photo-report.html",data:enc.encode(pvBuildPhotoReportHtml(title,records,false))},{name:"photo-report.md",data:enc.encode(pvBuildPhotoReportMarkdown(title,records))}];for(const r of records)if(r.blob)files.push({name:"images/"+r.fileName,data:new Uint8Array(await r.blob.arrayBuffer())});const zip=pvMakeZip(files);pvDownloadBrowserBlob(new Blob([zip],{type:"application/zip"}),pvPhotoReportSlug(title)+"-llm-review.zip");flash(`LLM package exported with ${files.length-2} original images`)}));
  });
}
function pvOpenPhotoReportForFolder(fid){const f=findFolder(PH.folders,fid);if(!f){flash("Photo folder not found");return}pvOpenPhotoReport({name:f.name,items:allItems(f),kind:"folder"})}

// ── Compact bookmark card (dense one-liner) ──
function mkCompactCard(p,fid){
  const el=document.createElement("div");el.className="pc-compact";
  el.dataset.pid=p.id;el.dataset.psrc=fid;
  const fColor=folderColorFor(fid);
  if(isL()&&fColor)el.style.borderLeft=`3px solid ${fColor}`;
  el.innerHTML=`<span class="bk-icon-sm">${favicon(p.url,16)}</span><span class="cc-title" data-a="opn" title="${escAttr(p.title)}">${esc(p.title)}</span><span class="cc-domain">${esc(domain(p.url||''))}</span>${(p.tags||[]).slice(0,2).map(t=>{const tc=getTagColor(t);return`<span class="tag-col" style="font-size:9px;padding:0 5px;line-height:15px;${tc.v?`background:${tc.bg};color:${tc.fg}`:'background:rgba(255,255,255,.06);color:var(--dm)'}">${esc(t)}</span>`}).join('')}<span class="cc-acts"><button class="ib" data-a="opn" title="Open">${I.open}</button><button class="ib" data-a="fv" title="${p.favorited?'Unfavorite':'Favorite'}">${V.st(p.favorited)}</button>${moreBtn()}</span>`;
  const compactMenu=()=>{
    const items=[];
    if(p.url)items.push({a:"opn",l:"Open in New Tab",ic:I.open,fn:()=>openUrl(p.url)},{a:"opnw",l:"Open in New Window",ic:I.open,fn:()=>openUrlWindow(p.url)});
    if((BM.sectionPanels||[]).length)items.push({a:"sdpin",l:"Pin to Section Panel",ic:S.pin,fn:()=>spPinToPanel(p.id)});
    items.push({a:"cp",l:"Copy URL",ic:I.copy,fn:()=>{navigator.clipboard.writeText(p.url||p.content||"").then(()=>flash("Copied"))}},{sep:1},
      {a:"ed",l:"Edit",ic:I.edit,fn:()=>{if(fid!==st().sel)st().sel=fid;openItem(p);render()}},
      {a:"mv",l:"Move to...",ic:I.move,fn:()=>mvMd(p.id,fid)},
      {a:"fv",l:p.favorited?"Unfavorite":"Favorite",ic:V.st(p.favorited),fn:()=>togFav(fid,p.id)},{sep:1},
      ...(WS_TYPE&&WS_TYPE[aTab]?[{a:"ws2",l:"Add to workspace...",ic:I.coll,fn:()=>wsAssignItem(aTab,p.id,p.title||p.url)},{a:"wsin",l:"Send to workspace Inbox",ic:S.inbox,fn:()=>wsInboxCapture(aTab,p.id)},{sep:1}]:[]),
      {a:"dl",l:"Delete",ic:I.trash,cls:"dng",fn:()=>delMd("prompt",p.id,p.title)});
    return items;
  };
  el.addEventListener("contextmenu",e=>showContextMenu(e,compactMenu()));
  el.querySelectorAll("[data-a]").forEach(btn=>{btn.addEventListener("click",e=>{e.stopPropagation();
    switch(btn.dataset.a){
      case"opn":if(p.url)openUrl(p.url);break;
      case"fv":togFav(fid,p.id);break;
      case"more":showContextMenuAt(btn,compactMenu());break;
    }})});return el}

// ═══════ WORKSPACE SILO ═══════
// Tranche 1: the container system. Workspaces + nestable subject buckets.
// A workspace IS a bucket mounted at the top (isMount). Buckets nest via children.
// Blocks (references) land in tranche 2 — kept empty here.

function mkWsDefault() {
  const ws = { workspaces: [], nextId: 1 };
  WS = ws; // newWsNode reads WS.nextId
  const root = newWsNode("My Workspace", true);
  root.color = "var(--ws)";
  ["Drafts", "Reference", "Research", "Conversations"].forEach(nm => root.children.push(newWsNode(nm, false)));
  ws.workspaces.push(root);
  return ws;
}

function newWsNode(name, isMount) {
  return {
    id: "wn_" + (WS.nextId++),
    name: name || "Untitled",
    color: "",
    icon: "",
    isMount: !!isMount,
    oneLiner: "",
    viewMode: "list",
    children: [],
    blocks: []
  };
}

function findWsNode(list, id) {
  for (const n of (list || [])) {
    if (n.id === id) return n;
    const hit = findWsNode(n.children, id);
    if (hit) return hit;
  }
  return null;
}

// Returns the array that directly contains the node with `id` (for move/delete).
function findWsParentList(list, id) {
  for (const n of (list || [])) {
    if (n.id === id) return list;
    const hit = findWsParentList(n.children, id);
    if (hit) return hit;
  }
  return null;
}

function activeWs() {
  return (WS.workspaces || []).find(w => w.id === wsSt.sel) || null;
}

function wsDepthOf(ws, id, list, d) {
  list = list || ws.children; d = d || 0;
  for (const n of (list || [])) {
    if (n.id === id) return d;
    const hit = wsDepthOf(ws, id, n.children, d + 1);
    if (hit >= 0) return hit;
  }
  return -1;
}

function wsBreadcrumb(ws, id) {
  // Walk root→id collecting names (excludes the node itself).
  const path = [];
  function walk(list, trail) {
    for (const n of (list || [])) {
      if (n.id === id) { path.push(...trail); return true; }
      if (walk(n.children, [...trail, n.name])) return true;
    }
    return false;
  }
  walk(ws.children, []);
  return path.join(" › ");
}

// ── Small naming modal ──
function wsPrompt(title, initial, onOk) {
  showModal(`<h3>${esc(title)}</h3><input type="text" id="wsPi" value="${esc(initial || "")}" placeholder="Name..." style="width:100%;background:var(--inp);border:1px solid var(--bl);border-radius:5px;padding:7px 9px;color:var(--tx);font-size:13px;outline:none;margin-top:6px"><div class="brow" style="margin-top:12px"><button class="bg-btn" id="wsPx">Cancel</button><button class="bp" id="wsPok">OK</button></div>`, mc => {
    const inp = mc.querySelector("#wsPi");
    inp.focus(); inp.select();
    const ok = () => { const v = inp.value.trim(); if (v) { closeModal(); onOk(v); } };
    mc.querySelector("#wsPx").addEventListener("click", closeModal);
    mc.querySelector("#wsPok").addEventListener("click", ok);
    inp.addEventListener("keydown", e => { if (e.key === "Enter") ok(); });
  });
}

// ── CRUD ──
function wsCreateWorkspace() {
  wsPrompt("New workspace", "", name => {
    const w = newWsNode(name, true);
    w.color = "var(--ws)";
    WS.workspaces.push(w);
    wsSt.sel = w.id; wsSt.bsel = null;
    save(); render();
  });
}

function wsRenameWorkspace(ws) {
  wsPrompt("Rename workspace", ws.name, name => { ws.name = name; ws.modified = Date.now(); save(); render(); });
}

function wsDeleteWorkspace(ws) {
  showModal(`<h3>Delete workspace?</h3><p>"${esc(ws.name)}" and its bucket tree will be removed. Items in your other silos are untouched.</p><div class="brow"><button class="bg-btn" id="wsDx">Cancel</button><button class="bp" id="wsDy" style="background:var(--dn)">Delete</button></div>`, mc => {
    mc.querySelector("#wsDx").addEventListener("click", closeModal);
    mc.querySelector("#wsDy").addEventListener("click", () => {
      WS.workspaces = WS.workspaces.filter(w => w.id !== ws.id);
      if (wsSt.sel === ws.id) { wsSt.sel = WS.workspaces[0]?.id || null; wsSt.bsel = null; }
      closeModal(); save(); render();
    });
  });
}

function wsAddBucket(ws, parentId) {
  const parent = parentId ? findWsNode(ws.children, parentId) : ws;
  if (!parent) return;
  // depth cap mirrors the rest of the app (MAX_D), counting from workspace root
  if (parentId) {
    const d = wsDepthOf(ws, parentId, null, 0);
    if (d >= (typeof MAX_D === "number" ? MAX_D - 1 : 6)) { flash("Max depth"); return; }
  }
  wsPrompt(parentId ? "New sub-bucket" : "New bucket", "", name => {
    const n = newWsNode(name, false);
    parent.children = parent.children || [];
    parent.children.push(n);
    if (parentId) wsSt.exp[parentId] = 1;
    wsSt.bsel = n.id;
    save(); render();
  });
}

function wsRenameBucket(ws, id) {
  const n = findWsNode(ws.children, id);
  if (!n) return;
  wsPrompt("Rename bucket", n.name, name => { n.name = name; save(); render(); });
}

function wsDeleteBucket(ws, id) {
  const n = findWsNode(ws.children, id);
  if (!n) return;
  const kids = (n.children || []).length;
  showModal(`<h3>Delete bucket?</h3><p>"${esc(n.name)}"${kids ? ` and its ${kids} sub-bucket${kids > 1 ? "s" : ""}` : ""} will be removed. Referenced items stay in their home silos.</p><div class="brow"><button class="bg-btn" id="wsBx">Cancel</button><button class="bp" id="wsBy" style="background:var(--dn)">Delete</button></div>`, mc => {
    mc.querySelector("#wsBx").addEventListener("click", closeModal);
    mc.querySelector("#wsBy").addEventListener("click", () => {
      const list = findWsParentList(ws.children, id);
      if (list) { const i = list.findIndex(x => x.id === id); if (i >= 0) list.splice(i, 1); }
      if (wsSt.bsel === id) wsSt.bsel = null;
      closeModal(); save(); render();
    });
  });
}

// ── Render ──
function wsTreeNode(n, depth) {
  const hasKids = (n.children || []).length > 0;
  const open = !!wsSt.exp[n.id];
  const sel = wsSt.bsel === n.id;
  const folderIc = (typeof S !== "undefined" && S.folder) ? S.folder : "";
  let h = `<div class="ws-node" data-bk="${n.id}" style="display:flex;align-items:center;gap:5px;padding:3px 6px;padding-left:${6 + depth * 15}px;border-radius:6px;cursor:pointer;${sel ? "background:color-mix(in srgb,var(--ws) 15%,transparent);font-weight:600" : ""}">`;
  if (hasKids) h += `<span class="ws-chev" data-chev="${n.id}" style="display:flex;align-items:center;cursor:pointer;color:var(--dm)">${V.ch(open)}</span>`;
  else h += `<span style="width:9px;flex-shrink:0"></span>`;
  h += `<span style="display:flex;align-items:center;color:${n.color || "var(--dm)"};flex-shrink:0">${n.icon || folderIc}</span>`;
  h += `<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(n.name)}</span>`;
  const _bc = (n.blocks || []).length;
  if (_bc) h += `<span style="font-size:10px;color:var(--dm);flex-shrink:0">${_bc}</span>`;
  h += `</div>`;
  if (hasKids && open) for (const c of n.children) h += wsTreeNode(c, depth + 1);
  return h;
}

function renderWorkspace() {
  const m = $("main");
  document.querySelector(".snap")?.remove();
  const wss = WS.workspaces || [];
  if (wsSt.sel && !wss.find(w => w.id === wsSt.sel)) wsSt.sel = null;
  if (!wsSt.sel && wss.length) wsSt.sel = wss[0].id;
  wsSt.bcol = wsSt.bcol || {};
  wsSt.stripCol = wsSt.stripCol || {};
  if (typeof window !== "undefined" && !window.__wsResizeBound) { window.__wsResizeBound = true; let _rt; window.addEventListener("resize", () => { clearTimeout(_rt); _rt = setTimeout(() => { if (aTab === "workspace") render(); }, 150); }); }
  const wide = (typeof window !== "undefined" && window.innerWidth >= 900);
  const ws = activeWs();

  let h = `<div style="padding:9px 11px${wide ? ";max-width:1500px;margin:0 auto" : ""}">`;

  // Workspace switcher
  h += `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:11px">`;
  const onHome = !wsSt.bsel && !wsSt.inboxOpen && !wsSt.finderQ;
  h += `<div id="wsHome" title="Where you left off" style="display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:7px;border:1px solid ${onHome ? "var(--ws)" : "var(--bl)"};background:${onHome ? "color-mix(in srgb,var(--ws) 13%,transparent)" : "transparent"};cursor:pointer;font-size:12px;color:${onHome ? "var(--tx)" : "var(--dm)"}">⌂ Home</div>`;
  wss.forEach(w => {
    const active = w.id === wsSt.sel;
    const dot = w.color || "var(--ws)";
    h += `<div class="ws-pill" data-ws="${w.id}" style="display:flex;align-items:center;gap:6px;padding:4px 10px;border-radius:7px;border:1px solid ${active ? "var(--ws)" : "var(--bl)"};background:${active ? "color-mix(in srgb,var(--ws) 13%,transparent)" : "transparent"};cursor:pointer;font-size:12px"><span style="width:8px;height:8px;border-radius:3px;background:${dot};flex-shrink:0"></span>${esc(w.name)}</div>`;
  });
  h += `<div id="wsNew" style="display:flex;align-items:center;gap:4px;padding:4px 9px;border-radius:7px;border:1px dashed var(--bl);cursor:pointer;font-size:12px;color:var(--dm)">${I.plus} Workspace</div>`;
  if (!wide) h += `<div id="wsExpand" title="Open the workspace in a full browser tab" style="margin-left:auto;display:flex;align-items:center;gap:4px;padding:4px 9px;border-radius:7px;border:1px solid var(--bl);cursor:pointer;font-size:11px;color:var(--dm)">${S.expand} Expand</div>`;
  h += `</div>`;

  if (!ws) {
    h += `<div style="text-align:center;color:var(--dm);font-size:12px;padding:34px 10px">No workspaces yet.<br>Create one to build your first desk.</div></div>`;
    m.innerHTML = h; wireWsSwitcher(); return;
  }

  if (wsSt.bsel && wsSt.bsel !== ws.id && !findWsNode(ws.children, wsSt.bsel)) wsSt.bsel = null;

  // ── Compose the pieces, then arrange by width (wide = expanded two-column desk) ──
  const topBlock = wsRenderToolbar(ws) + wsFinderBox();

  const headerBlock = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
    <span id="wsOpenRoot" title="Open workspace root" style="display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;cursor:pointer"><span style="width:9px;height:9px;border-radius:3px;background:${ws.color || "var(--ws)"};flex-shrink:0"></span>${esc(ws.name)}</span>
    <span id="wsCfg" title="Rename / delete workspace" style="display:flex;cursor:pointer;color:var(--dm)">${S.gear}</span>
  </div><div style="font-size:11px;color:var(--dm);margin:0 0 9px 16px">${esc(ws.oneLiner || "your tree")}</div>`;

  let treeBlock = `<div id="wsTree" style="font-size:13px">`;
  (ws.children || []).forEach(n => treeBlock += wsTreeNode(n, 0));
  if (!(ws.children || []).length) treeBlock += `<div style="color:var(--dm);font-size:12px;padding:4px 6px">No buckets yet.</div>`;
  treeBlock += `</div><div id="wsAddBk" style="display:flex;align-items:center;gap:5px;margin-top:7px;padding:5px 6px;color:var(--dm);font-size:12px;cursor:pointer">${I.plus} bucket</div>`;
  treeBlock += wsInboxAnchor();

  const bk = wsSt.bsel ? (wsSt.bsel === ws.id ? ws : findWsNode(ws.children, wsSt.bsel)) : null;
  let pane = "";
  if (wsSt.finderQ) pane = wsRenderFinder();
  else if (wsSt.inboxOpen) pane = wsRenderInbox(ws);
  else if (bk) {
    const crumb = (bk === ws) ? "" : wsBreadcrumb(ws, bk.id);
    if (crumb) pane += `<div style="font-size:11px;color:var(--dm);margin-bottom:2px">${esc(crumb)}</div>`;
    pane += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:9px"><div style="font-size:14px;font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(bk.name)}${bk === ws ? ` <span style="font-size:10px;font-weight:400;color:var(--dm)">(root)</span>` : ""}</div><button class="bg-btn ws-connect-btn" id="wsConnectBtn" title="Summon connections across this material" style="font-size:10.5px;padding:3px 9px;flex-shrink:0;display:flex;align-items:center;gap:4px">${I.spark} Connect</button></div>`;
    pane += wsPinnedStrip(ws, bk);
    pane += wsBlocksPane(bk);
  } else pane = wsRenderHome(ws);

  if (wide) {
    h += topBlock;
    h += `<div style="display:flex;gap:20px;align-items:flex-start;margin-top:4px">`;
    h += `<div style="width:290px;flex-shrink:0">${headerBlock}${treeBlock}</div>`;
    h += `<div style="flex:1;min-width:0;border-left:1px solid var(--bl);padding-left:20px">${pane}</div>`;
    h += `</div>`;
  } else {
    h += topBlock + headerBlock + treeBlock;
    h += `<div style="margin-top:14px;border-top:1px solid var(--bl);padding-top:12px">${pane}</div>`;
  }
  h += `</div>`;

  m.innerHTML = h;
  wireWsSwitcher();
  wireWsTree(ws);
  wireWsBlocks(ws, bk);
  wireWsReach(ws, bk);
  wireWsInbox(ws);
  wireWsFinder(ws);
  wireWsDnD(ws);
  wireWsHome(ws);
  $("wsExpand")?.addEventListener("click", () => { try { chrome.tabs.create({ url: chrome.runtime.getURL("sidepanel.html") }); } catch (e) { try { window.open(chrome.runtime.getURL("sidepanel.html"), "_blank"); } catch (e2) {} } });
  if (bk && !wsSt.inboxOpen && !wsSt.finderQ) $("wsConnectBtn")?.addEventListener("click", () => wsConnectModal(ws, bk));
  if (wsSt.finderQ) { const fi = $("wsFinder"); if (fi) { fi.focus(); try { fi.setSelectionRange(fi.value.length, fi.value.length); } catch (e) {} } }
}

function wireWsSwitcher() {
  document.querySelectorAll(".ws-pill").forEach(el => el.addEventListener("click", () => {
    wsSt.sel = el.dataset.ws; wsSt.bsel = null; render();
  }));
  $("wsNew")?.addEventListener("click", wsCreateWorkspace);
}

function wireWsTree(ws) {
  $("wsCfg")?.addEventListener("click", e => {
    showContextMenu(e, [
      { a: "rn", l: "Rename workspace", ic: I.edit, fn: () => wsRenameWorkspace(ws) },
      { a: "appr", l: "Appearance…", ic: I.spark, fn: () => wsBucketAppearance(ws) },
      { a: "add", l: "New bucket", ic: I.plus, fn: () => wsAddBucket(ws, null) },
      { sep: 1 },
      { a: "dl", l: "Delete workspace", ic: I.trash, cls: "dng", fn: () => wsDeleteWorkspace(ws) }
    ]);
  });
  $("wsOpenRoot")?.addEventListener("click", () => { wsSt.bsel = ws.id; wsTouch(ws.id, ws.id); render(); });
  $("wsAddBk")?.addEventListener("click", () => wsAddBucket(ws, null));

  document.querySelectorAll("#wsTree .ws-chev").forEach(el => el.addEventListener("click", e => {
    e.stopPropagation();
    const id = el.dataset.chev; wsSt.exp[id] = !wsSt.exp[id]; render();
  }));
  document.querySelectorAll("#wsTree .ws-node").forEach(el => {
    el.addEventListener("click", () => { wsSt.bsel = el.dataset.bk; wsTouch(ws.id, el.dataset.bk); render(); });
    el.addEventListener("contextmenu", e => {
      const id = el.dataset.bk;
      showContextMenu(e, [
        { a: "add", l: "New sub-bucket", ic: I.plus, fn: () => wsAddBucket(ws, id) },
        { a: "rn", l: "Rename", ic: I.edit, fn: () => wsRenameBucket(ws, id) },
        { a: "appr", l: "Appearance…", ic: I.spark, fn: () => wsBucketAppearance(findWsNode(ws.children, id) || ws) },
        { sep: 1 },
        { a: "dl", l: "Delete", ic: I.trash, cls: "dng", fn: () => wsDeleteBucket(ws, id) }
      ]);
    });
  });
}

// ═══════ WORKSPACE BLOCKS (tranche 3) ═══════
// A block is a REFERENCE to a source item that lives once in its home silo
// (the "Spotify song" model). ref:{store,itemId}. Editing the source changes it
// everywhere; the same item can be cross-filed into many buckets. Deleting a block
// removes only the reference, never the source item.

const WS_TYPE = {
  prompts:    { label: "PROMPT",  color: "#9b5de5" },
  imgprompts: { label: "IMG",     color: "#c97a5c" },
  snippets:   { label: "CLIP",    color: "#38b2a5" },
  bookmarks:  { label: "LINK",    color: "#d8743a", link: 1 },
  notes:      { label: "NOTE",    color: "#c9a45c" },
  skills:     { label: "SKILL",   color: "#48b85c" },
  customgpts: { label: "GPT",     color: "#4895ef", link: 1 },
  chats:      { label: "CHAT",    color: "#c45c9a", link: 1 },
  projects:   { label: "PROJECT", color: "#e07530", link: 1 }
};

function wsStoreData(store) {
  return (typeof _TDT === "object" && _TDT[store]) ? _TDT[store]() : null;
}

// Resolve a block reference back to its live source item (single source of truth).
function wsResolveBlock(b) {
  if (!b || !b.ref) return null;
  const data = wsStoreData(b.ref.store);
  if (!data || !data.folders) return null;
  const item = findItemGlobal(data.folders, b.ref.itemId);
  return item ? { item, store: b.ref.store } : null;
}

function wsNewBlock(store, itemId) {
  return { id: "wb_" + (WS.nextId++), ref: { store, itemId }, order: Date.now(), localLabel: "" };
}

// Folder id that directly holds an item — used to select it on jump-to-source.
function wsItemFolderId(node, itemId) {
  if ((node.prompts || []).some(p => p.id === itemId)) return node.id;
  for (const c of (node.children || [])) { const f = wsItemFolderId(c, itemId); if (f) return f; }
  return null;
}

// ── Assign flow (called from every silo's card right-click menu) ──
function wsAssignItem(store, itemId, title) {
  if (!WS_TYPE[store]) { flash("Can't add this type to a workspace"); return; }
  if (!(WS.workspaces || []).length) { flash("Create a workspace first"); return; }
  wsFilePicker(title, (ws, node) => {
    node.blocks = node.blocks || [];
    if (node.blocks.some(b => b.ref && b.ref.store === store && b.ref.itemId === itemId)) {
      flash("Already in “" + node.name + "”"); return;
    }
    if (typeof pushUndo === "function") pushUndo();
    node.blocks.push(wsNewBlock(store, itemId));
    save();
    flash("Added to “" + node.name + "”");
  });
}

// Pick a workspace, then a bucket (or the workspace root) to file into.
function wsFilePicker(title, onPick) {
  const wss = WS.workspaces || [];
  let pick = (wsSt.sel && wss.find(w => w.id === wsSt.sel)) ? wsSt.sel : wss[0].id;
  const folderIc = (typeof S !== "undefined" && S.folder) ? S.folder : "";
  function rows(ws) {
    let h = "";
    (function walk(node, depth, isRoot) {
      h += `<div class="wfp-row" data-node="${node.id}" style="display:flex;align-items:center;gap:6px;padding:6px 8px;padding-left:${8 + depth * 15}px;border-radius:6px;cursor:pointer"><span style="color:var(--dm)">${folderIc}</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(node.name)}${isRoot ? ` <span style="font-size:10px;color:var(--dm)">(root)</span>` : ""}</span></div>`;
      (node.children || []).forEach(c => walk(c, depth + 1, false));
    })(ws, 0, true);
    return h;
  }
  function body() {
    const ws = wss.find(w => w.id === pick) || wss[0];
    let h = `<h3>Add to workspace</h3><div style="font-size:11px;color:var(--dm);margin:-4px 0 9px">${esc(title || "item")}</div>`;
    if (wss.length > 1) {
      h += `<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px">`;
      wss.forEach(w => { h += `<div class="wfp-ws" data-ws="${w.id}" style="padding:3px 9px;border-radius:7px;border:1px solid ${w.id === pick ? "var(--ws)" : "var(--bl)"};background:${w.id === pick ? "color-mix(in srgb,var(--ws) 13%,transparent)" : "transparent"};cursor:pointer;font-size:12px">${esc(w.name)}</div>`; });
      h += `</div>`;
    }
    h += `<div style="max-height:240px;overflow:auto;border:1px solid var(--bl);border-radius:8px;padding:4px">${rows(ws)}</div>`;
    h += `<div class="brow" style="margin-top:11px"><button class="bg-btn" id="wfpX">Cancel</button></div>`;
    return h;
  }
  showModal(body(), function wire(mc) {
    mc.querySelectorAll(".wfp-ws").forEach(el => el.addEventListener("click", () => { pick = el.dataset.ws; mc.innerHTML = body(); wire(mc); }));
    mc.querySelectorAll(".wfp-row").forEach(el => el.addEventListener("click", () => {
      const ws = wss.find(w => w.id === pick) || wss[0];
      const node = (ws.id === el.dataset.node) ? ws : findWsNode(ws.children, el.dataset.node);
      if (node) { closeModal(); onPick(ws, node); }
    }));
    mc.querySelector("#wfpX").addEventListener("click", closeModal);
  });
}

// ── Block rendering ──
function wsBlockCard(b) {
  const collapsed = !!wsSt.bcol[b.id];
  const r = wsResolveBlock(b);
  if (!r) {
    return `<div class="ws-blk" style="border:1px dashed var(--bl);border-radius:8px;padding:9px 11px;margin-bottom:7px;opacity:.75"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:9px;font-weight:600;padding:1px 6px;border-radius:5px;background:rgba(217,72,72,.15);color:#d98a96;flex-shrink:0">REMOVED</span><span style="flex:1;font-size:12.5px;color:var(--dm)">source no longer exists</span><span class="ws-blk-x" data-blk="${b.id}" title="Remove reference" style="cursor:pointer;color:var(--dm);flex-shrink:0">${I.trash}</span></div></div>`;
  }
  const it = r.item, native = r.store === "notes" && it.wsMode;
  const ty = native ? wsNativeMeta(it) : (WS_TYPE[r.store] || { label: "ITEM", color: "#888" });
  const ttl = wsBlockTitle(r);
  const lbl = b.localLabel ? `<span style="font-size:10px;color:var(--dm);margin-left:6px;font-style:italic">${esc(b.localLabel)}</span>` : "";
  let h = `<div class="ws-blk" style="border:1px solid var(--bl);border-radius:8px;padding:9px 11px;margin-bottom:7px;${native && it.wsMode === "jot" ? "background:color-mix(in srgb,#c9a45c 7%,transparent)" : ""}">`;
  h += `<div class="ws-blk-bar" data-blk="${b.id}" style="display:flex;align-items:center;gap:8px;cursor:pointer">`;
  h += `<span style="font-size:9px;font-weight:600;padding:1px 6px;border-radius:5px;background:${ty.color}22;color:${ty.color};flex-shrink:0">${ty.label}</span>`;
  h += `<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px">${esc(ttl)}${lbl}</span>`;
  if (native && it.wsMode === "todo") { const { tasks } = wsParseTodo(it.content); if (tasks.length) h += `<span style="font-size:10px;color:var(--dm);flex-shrink:0">${tasks.filter(t => t.done).length}/${tasks.length}</span>`; }
  h += `<span class="ws-blk-menu" data-blk="${b.id}" title="Block actions" style="cursor:pointer;color:var(--dm);flex-shrink:0;display:flex">${S.gear}</span></div>`;
  if (!collapsed) {
    if (native && it.wsMode === "todo") h += wsTodoBody(b, it);
    else if (native && (it.wsMode === "jot" || it.wsMode === "doc")) h += wsEditBody(b, it, it.wsMode === "doc");
    else {
      let body = "";
      if (ty.link && it.url) body = `<a href="${escAttr(it.url)}" target="_blank" rel="noopener" style="color:var(--ws);font-size:11.5px;word-break:break-all">${esc(it.url)}</a>`;
      else if (it.content) body = `<div style="font-size:12px;color:var(--dm);white-space:pre-wrap;max-height:150px;overflow:auto">${esc(it.content.slice(0, 600))}${it.content.length > 600 ? "…" : ""}</div>`;
      if (body) h += `<div style="margin-top:7px">${body}</div>`;
    }
  }
  h += `</div>`;
  return h;
}

function wsBlocksPane(bk) {
  const blocks = (bk.blocks || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const kids = (bk.children || []);
  const wide = (typeof window !== "undefined" && window.innerWidth >= 900);
  // Canvas-first when there's room: board is the surface you spread out on.
  const board = bk.viewMode ? bk.viewMode === "board" : wide;
  let h = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:8px">`;
  h += `<div style="display:flex;border:1px solid var(--bl);border-radius:6px;overflow:hidden;font-size:11px"><span class="ws-vm" data-vm="list" style="padding:3px 9px;cursor:pointer;${!board ? "background:color-mix(in srgb,var(--ws) 16%,transparent);color:var(--tx)" : "color:var(--dm)"}">List</span><span class="ws-vm" data-vm="board" style="padding:3px 9px;cursor:pointer;${board ? "background:color-mix(in srgb,var(--ws) 16%,transparent);color:var(--tx)" : "color:var(--dm)"}">Board</span></div>`;
  if (blocks.length && !board) { const anyOpen = blocks.some(b => !wsSt.bcol[b.id]); h += `<span id="wsColAll" style="font-size:11px;color:var(--ws);cursor:pointer">${anyOpen ? "collapse all" : "expand all"}</span>`; }
  h += `</div>`;
  // Visible add palette — the four drop primitives, always in reach (not a hidden link).
  const chip = (pal, label) => `<span class="ws-pal" data-pal="${pal}" style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:5px 11px;border:1px dashed var(--bl);border-radius:15px;color:var(--mu);cursor:pointer;background:var(--inp)">${I.plus} ${label}</span>`;
  h += `<div class="ws-palette" style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px">${chip("jot", "Jot")}${chip("doc", "Doc")}${chip("todo", "To-do")}${chip("sub", "Sub-bucket")}</div>`;
  // Sub-buckets sit on the canvas as tiles you click into.
  if (kids.length) {
    h += `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">`;
    kids.forEach(k => {
      const ic = k.icon || (typeof S !== "undefined" ? S.folder : "");
      const cnt = (k.blocks || []).length + (k.children || []).length;
      h += `<div class="ws-bucket-tile" data-bk="${k.id}" title="Open ${esc(k.name)}" style="display:flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid var(--bl);border-left:3px solid ${k.color || "var(--ws)"};border-radius:8px;cursor:pointer;background:var(--inp);min-width:118px"><span style="display:flex;color:${k.color || "var(--dm)"}">${ic}</span><span style="flex:1;font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(k.name)}</span>${cnt ? `<span style="font-size:10px;color:var(--dm)">${cnt}</span>` : ""}</div>`;
    });
    h += `</div>`;
  }
  if (!blocks.length) {
    h += `<div style="text-align:center;color:var(--dm);font-size:12px;padding:24px 10px;border:1px dashed var(--bl);border-radius:8px;line-height:1.6">${kids.length ? "No blocks here yet." : "Empty bucket."}<br>Use the palette above for a jot, doc, to-do, or sub-bucket,<br>or right-click any item in its silo → “Add to workspace”.</div>`;
    return h;
  }
  if (board) {
    h += `<div id="wsBoard" style="position:relative;min-height:min(64vh,560px);border:1px solid var(--bl);border-radius:8px;overflow:hidden;background:repeating-linear-gradient(45deg,transparent,transparent 11px,color-mix(in srgb,var(--bl) 28%,transparent) 11px,color-mix(in srgb,var(--bl) 28%,transparent) 12px)">`;
    blocks.forEach((b, i) => { const pos = b.boardPos || { x: 10 + (i % 4) * 156, y: 10 + Math.floor(i / 4) * 96 }; h += wsBoardCard(b, pos); });
    h += `</div>`;
  } else {
    blocks.forEach(b => h += wsBlockCard(b));
  }
  return h;
}

function wsRemoveBlock(bk, id) {
  if (typeof pushUndo === "function") pushUndo();
  bk.blocks = (bk.blocks || []).filter(b => b.id !== id);
  save(); render();
}

function wsLabelBlock(bk, b) {
  wsPrompt("Label (this bucket only)", b.localLabel || "", v => { b.localLabel = v; save(); render(); });
}

function wsJumpToSource(store, itemId) {
  const data = wsStoreData(store);
  if (!data || !data.folders) { flash("Source unavailable"); return; }
  const fid = wsItemFolderId(data.folders, itemId);
  aTab = store;
  const stt = (_TST[store] && _TST[store]());
  if (stt) { if (fid) { stt.sel = fid; stt.exp = stt.exp || {}; stt.exp[fid] = 1; } stt.view = "list"; }
  render();
  if (typeof updTabs === "function") updTabs();
}

function wireWsBlocks(ws, bk) {
  if (!bk) return;
  const openMenu = (e, id) => {
    if (e.preventDefault) e.preventDefault();
    e.stopPropagation();
    const b = (bk.blocks || []).find(x => x.id === id);
    if (!b) return;
    const r = wsResolveBlock(b);
    const items = [];
    if (r) {
      const native = r.store === "notes" && r.item.wsMode;
      items.push({ a: "open", l: "Open source", ic: I.open, fn: () => wsJumpToSource(r.store, b.ref.itemId) });
      if (native) { /* native title comes from content */ }
      const pinnedLocal = !!wsFindPin(bk, b.ref, "local");
      items.push({ a: "pin", l: pinnedLocal ? "Unpin from bucket" : "Pin to this bucket", ic: S.pin, fn: () => wsTogglePin(bk, b.ref, "local") });
      const pinnedBranch = !!wsFindPin(bk, b.ref, "branch");
      items.push({ a: "pinb", l: pinnedBranch ? "Unpin from branch" : "Pin to branch", ic: S.pin, fn: () => wsTogglePin(bk, b.ref, "branch") });
      items.push({ a: "pinm", l: "Pin to top toolbar", ic: S.pin, fn: () => wsPinToMaster(ws, b.ref) });
      items.push({ a: "detach", l: "Detach (independent copy)", ic: I.coll, fn: () => wsDetachBlock(bk, b) });
    }
    items.push({ a: "lbl", l: "Label…", ic: I.edit, fn: () => wsLabelBlock(bk, b) });
    items.push({ sep: 1 }, { a: "rm", l: "Remove from bucket", ic: I.trash, cls: "dng", fn: () => wsRemoveBlock(bk, id) });
    showContextMenu(e, items);
  };

  // view mode toggle
  document.querySelectorAll(".ws-vm").forEach(el => el.addEventListener("click", () => { bk.viewMode = el.dataset.vm; save(); render(); }));

  // visible add palette (the drop primitives) + sub-bucket tiles
  document.querySelectorAll(".ws-pal").forEach(el => el.addEventListener("click", ev => {
    ev.stopPropagation();
    const p = el.dataset.pal;
    if (p === "sub") wsAddBucket(ws, bk === ws ? null : bk.id);
    else wsCreateNative(bk, p);
  }));
  document.querySelectorAll(".ws-bucket-tile").forEach(el => el.addEventListener("click", () => { wsSt.bsel = el.dataset.bk; wsTouch(ws.id, el.dataset.bk); render(); }));

  $("wsColAll")?.addEventListener("click", () => {
    const blocks = bk.blocks || [];
    const anyOpen = blocks.some(b => !wsSt.bcol[b.id]);
    blocks.forEach(b => wsSt.bcol[b.id] = anyOpen ? 1 : 0);
    render();
  });

  // list banners
  document.querySelectorAll(".ws-blk-bar").forEach(el => {
    el.addEventListener("click", e => { if (e.target.closest(".ws-blk-menu")) return; const id = el.dataset.blk; wsSt.bcol[id] = !wsSt.bcol[id]; render(); });
    el.addEventListener("contextmenu", e => openMenu(e, el.dataset.blk));
  });
  document.querySelectorAll(".ws-blk-menu").forEach(el => el.addEventListener("click", e => openMenu(e, el.dataset.blk)));
  document.querySelectorAll(".ws-blk-x").forEach(el => el.addEventListener("click", () => wsRemoveBlock(bk, el.dataset.blk)));

  // native jot/doc inline edit (blur-save, no mid-edit re-render)
  document.querySelectorAll(".ws-edit").forEach(el => {
    if (wsSt.edit === el.dataset.blk) { wsSt.edit = null; el.focus(); try { el.setSelectionRange(el.value.length, el.value.length); } catch (e) {} }
    el.addEventListener("blur", () => { const b = (bk.blocks || []).find(x => x.id === el.dataset.blk); if (b) wsSaveNoteContent(b, el.value); });
  });

  // to-do
  document.querySelectorAll(".ws-todo-box").forEach(el => el.addEventListener("click", e => { e.stopPropagation(); const b = (bk.blocks || []).find(x => x.id === el.dataset.blk); if (b) wsTodoToggle(b, +el.dataset.ti); }));
  document.querySelectorAll(".ws-todo-add").forEach(el => el.addEventListener("click", () => { const inp = document.querySelector(`.ws-todo-input[data-blk="${el.dataset.blk}"]`); const b = (bk.blocks || []).find(x => x.id === el.dataset.blk); if (b && inp) wsTodoAdd(b, inp.value); }));
  document.querySelectorAll(".ws-todo-input").forEach(el => el.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); const b = (bk.blocks || []).find(x => x.id === el.dataset.blk); if (b) wsTodoAdd(b, el.value); } }));

  // board: drag to reposition (boardPos rides the block)
  document.querySelectorAll(".ws-board-card").forEach(el => {
    el.addEventListener("contextmenu", e => openMenu(e, el.dataset.blk));
    el.addEventListener("mousedown", e => {
      if (e.target.closest(".ws-blk-menu")) return;
      e.preventDefault();
      const boardEl = document.getElementById("wsBoard"); if (!boardEl) return;
      const id = el.dataset.blk;
      const br = boardEl.getBoundingClientRect(), cr = el.getBoundingClientRect();
      const offX = e.clientX - cr.left, offY = e.clientY - cr.top;
      let moved = false;
      el.style.cursor = "grabbing"; el.style.zIndex = "10";
      const move = ev => { moved = true; let x = ev.clientX - br.left - offX, y = ev.clientY - br.top - offY; x = Math.max(0, Math.min(x, br.width - el.offsetWidth)); y = Math.max(0, y); el.style.left = x + "px"; el.style.top = y + "px"; };
      const up = () => {
        document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up);
        el.style.cursor = "grab"; el.style.zIndex = "";
        if (moved) { const b = (bk.blocks || []).find(x => x.id === id); if (b) { b.boardPos = { x: parseInt(el.style.left) || 0, y: parseInt(el.style.top) || 0 }; save(); } }
      };
      document.addEventListener("mousemove", move); document.addEventListener("mouseup", up);
    });
  });
}

// ═══════ WORKSPACE COMPOSE (tranche 4) ═══════
// Native authoring: a jot, a doc, and a to-do are the SAME object — a real Note in
// the Notes silo — at three view modes (it.wsMode). Born already-filed into the bucket
// as a block. Editing here edits the canonical Note everywhere. Plus board view + the
// drop palette (jot / doc / to-do / sub-bucket).

function wsNotesHomeFolder() {
  if (!NT || !NT.folders) return null;
  NT.folders.children = NT.folders.children || [];
  let f = NT.folders.children.find(c => c.id === "n_ws" || c.name === "Workspace");
  if (!f) { f = { id: "n_ws", name: "Workspace", children: [], prompts: [], color: "" }; NT.folders.children.push(f); }
  return f;
}

function wsCreateNative(bk, mode) {
  const home = wsNotesHomeFolder();
  if (!home) { flash("Notes silo unavailable"); return; }
  if (typeof pushUndo === "function") pushUndo();
  const note = buildItem(NT, "", "", [], { wsMode: mode });
  home.prompts.push(note);
  bk.blocks = bk.blocks || [];
  const blk = wsNewBlock("notes", note.id);
  if (bk.viewMode === "board") blk.boardPos = { x: 14, y: 14 };
  bk.blocks.push(blk);
  wsSt.bcol[blk.id] = 0;
  wsSt.edit = blk.id;
  save(); render();
}

// Detach — the escape hatch on the Spotify model. Forks the block's referenced item
// into an independent Note copy and repoints the block at it, so edits here stop
// propagating to the original (and vice-versa). Native jot/doc/to-do keep their mode;
// any other source becomes a frozen doc snapshot (title folded into the first line).
function wsDetachBlock(bk, b) {
  const r = wsResolveBlock(b);
  if (!r) { flash("Nothing to detach — source already gone"); return; }
  const home = wsNotesHomeFolder();
  if (!home) { flash("Notes silo unavailable"); return; }
  if (typeof pushUndo === "function") pushUndo();
  let content, wsMode;
  if (r.store === "notes" && r.item.wsMode) {
    content = r.item.content || "";
    wsMode = r.item.wsMode;
  } else {
    const t = wsBlockTitle(r) || "";
    const body = r.item.content || r.item.body || r.item.text || r.item.prompt || "";
    content = t ? (body ? t + "\n\n" + body : t) : body;
    wsMode = "doc";
  }
  const note = buildItem(NT, "", content, [], { wsMode });
  home.prompts.push(note);
  b.ref = { store: "notes", itemId: note.id };
  b.detached = true;
  flash("Detached — edits here no longer touch the original");
  save(); render();
}

// Per-node color + icon. Works on a workspace or any bucket/sub-bucket node.
function wsBucketAppearance(node) {
  if (!node) return;
  const colors = ["#7c6cff", "#5ca46c", "#c9a45c", "#d98a96", "#5c9bd9", "#b06cc9", "#d97e4a", "#8891a0"];
  const icons = ["", S.folder, S.star, S.pin, S.bulb, S.rocket, S.labFlask, S.note];
  const swatch = c => `<span class="wsap-c" data-c="${c}" style="width:24px;height:24px;border-radius:7px;background:${c};cursor:pointer;border:2px solid ${node.color === c ? "var(--tx)" : "transparent"}"></span>`;
  const ibtn = ic => `<span class="wsap-i" data-i="${encodeURIComponent(ic)}" style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:7px;border:1px solid ${(node.icon || "") === ic ? "var(--ws)" : "var(--bl)"};cursor:pointer;color:var(--dm)">${ic || "—"}</span>`;
  showModal(
    `<h3>Appearance — ${esc(node.name)}</h3>` +
    `<div style="font-size:11px;color:var(--dm);margin:8px 0 6px">Color</div>` +
    `<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px">${colors.map(swatch).join("")}</div>` +
    `<div style="font-size:11px;color:var(--dm);margin-bottom:6px">Icon</div>` +
    `<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px">${icons.map(ibtn).join("")}</div>` +
    `<div class="brow"><button class="bp" id="wsapDone">Done</button></div>`,
    mc => {
      mc.querySelectorAll(".wsap-c").forEach(el => el.addEventListener("click", () => { node.color = el.dataset.c; save(); closeModal(); render(); }));
      mc.querySelectorAll(".wsap-i").forEach(el => el.addEventListener("click", () => { node.icon = decodeURIComponent(el.dataset.i); save(); closeModal(); render(); }));
      mc.querySelector("#wsapDone")?.addEventListener("click", closeModal);
    }
  );
}

function wsParseTodo(content) {
  const lines = (content || "").split("\n"); const tasks = [];
  lines.forEach((ln, i) => { const m = ln.match(/^(\s*)[-*] \[([ xX])\]\s?(.*)$/); if (m) tasks.push({ i, done: m[2].toLowerCase() === "x", text: m[3] }); });
  return { lines, tasks };
}

function wsNoteByBlock(b) { const r = wsResolveBlock(b); return r && r.store === "notes" ? r.item : null; }

function wsSaveNoteContent(b, content) {
  const note = wsNoteByBlock(b); if (!note || note.content === content) return;
  if (typeof pushUndo === "function") pushUndo();
  note.content = content; note.modified = Date.now(); save();
}

function wsTodoToggle(b, taskIdx) {
  const note = wsNoteByBlock(b); if (!note) return;
  const { lines, tasks } = wsParseTodo(note.content); const t = tasks[taskIdx]; if (!t) return;
  lines[t.i] = lines[t.i].replace(/\[([ xX])\]/, t.done ? "[ ]" : "[x]");
  note.content = lines.join("\n"); note.modified = Date.now(); save(); render();
}

function wsTodoAdd(b, text) {
  const note = wsNoteByBlock(b); if (!note) return; text = (text || "").trim(); if (!text) return;
  const base = (note.content || "").replace(/\s+$/, "");
  note.content = (base ? base + "\n" : "") + "- [ ] " + text; note.modified = Date.now(); save(); render();
}

function wsNativeMeta(it) {
  return ({ jot: { label: "JOT", color: "#c9a45c" }, doc: { label: "DOC", color: "#c9a45c" }, todo: { label: "TO-DO", color: "#5ca46c" } })[it.wsMode] || { label: "NOTE", color: "#c9a45c" };
}

function wsBlockTitle(r) {
  const it = r.item, native = r.store === "notes" && it.wsMode;
  return it.title
    || ((it.content || "").split("\n").map(s => s.replace(/^[-*] \[[ xX]\]\s?/, "").trim()).find(Boolean))
    || it.url
    || (native ? wsNativeMeta(it).label : "Untitled");
}

function wsTodoBody(b, it) {
  const { tasks } = wsParseTodo(it.content);
  const done = tasks.filter(t => t.done).length, tot = tasks.length;
  const pct = tot ? Math.round(done / tot * 100) : 0;
  let h = `<div style="margin-top:8px">`;
  h += `<div style="height:5px;background:var(--bl);border-radius:3px;overflow:hidden;margin-bottom:8px"><div style="height:100%;width:${pct}%;background:#5ca46c;transition:width .15s"></div></div>`;
  tasks.forEach((t, ti) => {
    h += `<div style="display:flex;align-items:flex-start;gap:7px;padding:2px 0"><span class="ws-todo-box" data-blk="${b.id}" data-ti="${ti}" style="cursor:pointer;color:${t.done ? "#5ca46c" : "var(--dm)"};flex-shrink:0;font-size:14px;line-height:1.3">${t.done ? S.checkbox : S.checkboxEmpty}</span><span style="flex:1;font-size:12.5px;${t.done ? "color:var(--dm);text-decoration:line-through" : ""}">${esc(t.text) || "<span style=\"color:var(--dm)\">(empty)</span>"}</span></div>`;
  });
  if (!tot) h += `<div style="font-size:11.5px;color:var(--dm);padding:2px 0">No tasks yet.</div>`;
  h += `<div style="display:flex;gap:6px;margin-top:7px"><input class="ws-todo-input" data-blk="${b.id}" placeholder="Add task…" style="flex:1;background:var(--inp);border:1px solid var(--bl);border-radius:5px;padding:5px 8px;color:var(--tx);font-size:12px;outline:none"><span class="ws-todo-add" data-blk="${b.id}" title="Add task" style="cursor:pointer;color:var(--ws);display:flex;align-items:center;padding:0 4px">${I.plus}</span></div></div>`;
  return h;
}

function wsEditBody(b, it, big) {
  return `<div style="margin-top:8px"><textarea class="ws-edit" data-blk="${b.id}" placeholder="${big ? "Write…" : "Jot something…"}" style="width:100%;box-sizing:border-box;background:var(--inp);border:1px solid var(--bl);border-radius:6px;padding:7px 9px;color:var(--tx);font-size:12.5px;outline:none;resize:vertical;min-height:${big ? "120px" : "54px"};font-family:inherit;line-height:1.5">${esc(it.content || "")}</textarea></div>`;
}

function wsBoardCard(b, pos) {
  const r = wsResolveBlock(b);
  const ty = r ? (r.store === "notes" && r.item.wsMode ? wsNativeMeta(r.item) : (WS_TYPE[r.store] || { label: "ITEM", color: "#888" })) : { label: "REMOVED", color: "#d98a96" };
  const ttl = r ? wsBlockTitle(r) : "source removed";
  let extra = "";
  if (r && r.store === "notes" && r.item.wsMode === "todo") { const { tasks } = wsParseTodo(r.item.content); if (tasks.length) extra = `<div style="font-size:9px;color:var(--dm);margin-top:3px">${tasks.filter(t => t.done).length}/${tasks.length} done</div>`; }
  let h = `<div class="ws-board-card" data-blk="${b.id}" style="position:absolute;left:${pos.x}px;top:${pos.y}px;width:142px;border:1px solid var(--bl);border-radius:8px;background:var(--inp);padding:8px 9px;cursor:grab;box-shadow:0 2px 7px rgba(0,0,0,.28)">`;
  h += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="font-size:8px;font-weight:600;padding:1px 5px;border-radius:4px;background:${ty.color}22;color:${ty.color}">${ty.label}</span><span class="ws-blk-menu" data-blk="${b.id}" style="margin-left:auto;cursor:pointer;color:var(--dm);display:flex">${S.gear}</span></div>`;
  h += `<div style="font-size:11.5px;line-height:1.35;max-height:48px;overflow:hidden">${esc(ttl)}</div>${extra}</div>`;
  return h;
}

// ═══════ WORKSPACE REACH (tranche 5) ═══════
// Pins + two surfaces. Per-bucket pinned strip (local now; the branch-cascade resolver
// is built here, the branch *affordance* is the fast-follow) and the per-workspace
// master toolbar (one composable strip of Custom / Bookmarks / Projects bars).
// Chrome is lazy: a strip exists only when a bucket has pins; the toolbar collapses to
// a thin "+ toolbar" link when empty — so a write day stays tree-plus-blocks.

// ── Pin model (lives on node.pins) ──
function wsNodePins(n) { n.pins = n.pins || []; return n.pins; }
function wsRefEq(a, b) { return !!(a && b && a.store === b.store && a.itemId === b.itemId); }
function wsFindPin(n, ref, scope) { return wsNodePins(n).find(p => wsRefEq(p.ref, ref) && (!scope || p.scope === scope)); }

function wsTogglePin(n, ref, scope) {
  const pins = wsNodePins(n);
  const i = pins.findIndex(p => wsRefEq(p.ref, ref) && p.scope === scope);
  if (typeof pushUndo === "function") pushUndo();
  if (i >= 0) pins.splice(i, 1);
  else pins.push({ id: "wp_" + (WS.nextId++), ref: { store: ref.store, itemId: ref.itemId }, scope, anchorId: n.id });
  save(); render();
}

// Ancestor chain of a bucket (root→parent, excludes the node). Branch pins cascade down this.
function wsAncestorChain(ws, id) {
  const chain = [];
  (function walk(node, trail) {
    if (node.id === id) { chain.push(...trail); return true; }
    for (const c of (node.children || [])) if (walk(c, [...trail, node])) return true;
    return false;
  })(ws, []);
  return chain;
}

// Total-cascade resolver: local pins on this bucket + branch pins on it and every
// ancestor. No overrides — a branch pin reaches every descendant, period (§6).
function wsResolveStripPins(ws, bk) {
  const raw = [];
  wsNodePins(bk).forEach(p => { if (p.scope === "local" || p.scope === "branch") raw.push({ pin: p, source: bk, inherited: false }); });
  wsAncestorChain(ws, bk.id).slice().reverse().forEach(anc => {
    wsNodePins(anc).forEach(p => { if (p.scope === "branch") raw.push({ pin: p, source: anc, inherited: true }); });
  });
  // One chip per item: own pins (local/branch on this bucket) win over inherited;
  // nearest ancestor wins among inherited (ancestor chain reversed above).
  const seen = new Set(), out = [];
  raw.forEach(e => { const k = e.pin.ref.store + "::" + e.pin.ref.itemId; if (seen.has(k)) return; seen.add(k); out.push(e); });
  return out;
}

function wsFindPinById(ws, id) {
  let found = null;
  (function walk(n) { if (found) return; wsNodePins(n).forEach(p => { if (p.id === id) found = p; }); (n.children || []).forEach(walk); })(ws);
  return found;
}

// ── Open behaviour for a pinned chip / toolbar launcher ──
function wsOpenRef(ref) {
  const r = wsResolveBlock({ ref });
  if (!r) { flash("Source removed"); return; }
  const it = r.item, ty = WS_TYPE[r.store] || {};
  if (ty.link && it.url && r.store !== "projects") { window.open(it.url, "_blank", "noopener"); return; }
  wsJumpToSource(r.store, ref.itemId);
}

// ── Per-bucket pinned strip ──
function wsPinnedStrip(ws, bk) {
  const pins = wsResolveStripPins(ws, bk);
  if (!pins.length) return "";                       // no band until there's a reason for one
  const col = !!wsSt.stripCol[bk.id];
  let h = `<div style="margin-bottom:9px">`;
  h += `<div class="ws-strip-hd" data-bk="${bk.id}" style="display:flex;align-items:center;gap:6px;cursor:pointer;color:var(--dm);font-size:10.5px;margin-bottom:${col ? "0" : "5px"};user-select:none"><span style="display:flex">${V.ch(!col)}</span><span style="display:flex">${S.pin}</span><span>Pinned · ${pins.length}</span></div>`;
  if (!col) {
    h += `<div style="display:flex;flex-wrap:wrap;gap:5px">`;
    pins.forEach(({ pin, source, inherited }) => h += wsPinChip(pin, source, inherited));
    h += `</div>`;
  }
  h += `</div>`;
  return h;
}

function wsPinChip(pin, source, inherited) {
  const r = wsResolveBlock({ ref: pin.ref });
  const native = r && r.store === "notes" && r.item.wsMode;
  const ty = r ? (native ? wsNativeMeta(r.item) : (WS_TYPE[r.store] || { label: "ITEM", color: "#888" })) : { label: "GONE", color: "#d98a96" };
  const ttl = r ? wsBlockTitle(r) : "removed";
  let h = `<div class="ws-pin-chip" data-pin="${pin.id}" title="${escAttr(ttl)}" style="display:flex;align-items:center;gap:5px;max-width:190px;padding:3px 7px;border:1px solid var(--bl);border-radius:13px;background:var(--inp);cursor:pointer;font-size:11px">`;
  h += `<span style="width:6px;height:6px;border-radius:2px;background:${ty.color};flex-shrink:0"></span>`;
  h += `<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(ttl)}</span>`;
  if (inherited) h += `<span title="inherited from ${escAttr(source.name)} — unpin there" style="color:var(--dm);flex-shrink:0;font-size:9px">↑${esc(source.name)}</span>`;
  else h += `<span class="ws-pin-x" data-pin="${pin.id}" data-src="${source.id}" title="Unpin" style="color:var(--dm);flex-shrink:0;display:flex;font-size:9px">${S.x}</span>`;
  h += `</div>`;
  return h;
}

// ── Master toolbar (composable bars on the mount node) ──
const WS_BAR_FLAVORS = {
  custom:    { label: "Custom",    stores: null },
  bookmarks: { label: "Bookmarks", stores: ["bookmarks"] },
  projects:  { label: "Projects",  stores: ["projects"] }
};

function wsEnsureToolbar(ws) { ws.toolbar = ws.toolbar || { collapsed: false, bars: [] }; ws.toolbar.bars = ws.toolbar.bars || []; return ws.toolbar; }

function wsRenderToolbar(ws) {
  const tb = wsEnsureToolbar(ws);
  if (!tb.bars.length) return `<div id="wsTbAdd" style="display:inline-flex;align-items:center;gap:4px;margin:0 0 10px;padding:2px 0;color:var(--dm);font-size:11px;cursor:pointer"><span style="display:flex">${S.pin}</span> + toolbar</div>`;
  let h = `<div style="margin-bottom:11px;border:1px solid var(--bl);border-radius:8px;background:color-mix(in srgb,var(--ws) 5%,transparent)">`;
  h += `<div class="ws-tb-hd" style="display:flex;align-items:center;gap:6px;padding:5px 8px;cursor:pointer;user-select:none"><span style="display:flex;color:var(--dm)">${V.ch(!tb.collapsed)}</span><span style="display:flex;color:var(--ws)">${S.pin}</span><span style="font-size:11px;color:var(--dm);flex:1">Toolbar</span><span id="wsTbBar" title="Add a bar" style="display:flex;color:var(--dm);cursor:pointer">${I.plus}</span></div>`;
  if (!tb.collapsed) {
    h += `<div style="padding:0 8px 8px;display:flex;flex-direction:column;gap:7px">`;
    tb.bars.forEach(bar => h += wsRenderBar(bar));
    h += `</div>`;
  }
  h += `</div>`;
  return h;
}

function wsRenderBar(bar) {
  const fl = WS_BAR_FLAVORS[bar.flavor] || WS_BAR_FLAVORS.custom;
  let h = `<div style="border-top:1px solid var(--bl);padding-top:6px">`;
  h += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span class="ws-bar-cfg" data-bar="${bar.id}" title="Rename / remove bar" style="font-size:9px;font-weight:600;letter-spacing:.04em;color:var(--dm);cursor:pointer">${esc((bar.label || fl.label).toUpperCase())}</span><span class="ws-bar-add" data-bar="${bar.id}" title="Add to ${escAttr(fl.label)}" style="display:flex;color:var(--dm);cursor:pointer;font-size:10px">${I.plus}</span></div>`;
  h += `<div style="display:flex;flex-wrap:wrap;gap:5px">`;
  if (!(bar.items || []).length) h += `<span style="font-size:10.5px;color:var(--dm)">empty — add launchers</span>`;
  (bar.items || []).forEach(ref => h += wsBarLauncher(bar, ref));
  h += `</div></div>`;
  return h;
}

function wsBarLauncher(bar, ref) {
  const r = wsResolveBlock({ ref });
  if (!r) return `<div class="ws-launch" data-bar="${bar.id}" data-store="${ref.store}" data-id="${ref.itemId}" style="display:flex;align-items:center;gap:4px;padding:3px 7px;border:1px solid var(--bl);border-radius:13px;font-size:10.5px;color:var(--dm);opacity:.7">removed <span class="ws-launch-x" data-bar="${bar.id}" data-store="${ref.store}" data-id="${ref.itemId}" title="Remove" style="cursor:pointer;display:flex">${S.x}</span></div>`;
  const it = r.item, ty = WS_TYPE[r.store] || { label: "ITEM", color: "#888" };
  const isLink = ty.link && it.url && r.store !== "projects";
  const ttl = wsBlockTitle(r);
  let h = `<div class="ws-launch" data-bar="${bar.id}" data-store="${ref.store}" data-id="${ref.itemId}" title="${escAttr(ttl)}" style="display:flex;align-items:center;gap:5px;max-width:170px;padding:3px 8px;border:1px solid var(--bl);border-radius:13px;background:var(--inp);cursor:pointer;font-size:11px">`;
  if (isLink) h += `<span style="display:flex;flex-shrink:0">${favicon(it.url, 13)}</span>`;
  else h += `<span style="width:6px;height:6px;border-radius:2px;background:${ty.color};flex-shrink:0"></span>`;
  h += `<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(ttl)}</span>`;
  h += `<span class="ws-launch-x" data-bar="${bar.id}" data-store="${ref.store}" data-id="${ref.itemId}" title="Remove" style="color:var(--dm);flex-shrink:0;display:flex;font-size:9px">${S.x}</span></div>`;
  return h;
}

// ── Toolbar mutations ──
function wsTbAddBar(ws, e) {
  showContextMenu(e, Object.keys(WS_BAR_FLAVORS).map(fl => ({
    a: fl, l: WS_BAR_FLAVORS[fl].label + " bar", ic: I.plus,
    fn: () => { const tb = wsEnsureToolbar(ws); tb.bars.push({ id: "wbar_" + (WS.nextId++), flavor: fl, label: WS_BAR_FLAVORS[fl].label, items: [] }); tb.collapsed = false; save(); render(); }
  })));
}

function wsBarConfig(ws, barId, e) {
  const tb = wsEnsureToolbar(ws); const bar = tb.bars.find(b => b.id === barId); if (!bar) return;
  showContextMenu(e, [
    { a: "rn", l: "Rename bar", ic: I.edit, fn: () => wsPrompt("Bar name", bar.label, v => { bar.label = v; save(); render(); }) },
    { sep: 1 },
    { a: "dl", l: "Remove bar", ic: I.trash, cls: "dng", fn: () => { tb.bars = tb.bars.filter(b => b.id !== barId); save(); render(); } }
  ]);
}

function wsBarAddItem(ws, barId) {
  const tb = wsEnsureToolbar(ws); const bar = tb.bars.find(b => b.id === barId); if (!bar) return;
  const fl = WS_BAR_FLAVORS[bar.flavor] || WS_BAR_FLAVORS.custom;
  wsSiloPicker(fl.stores, "Add to " + (bar.label || fl.label), ref => {
    bar.items = bar.items || [];
    if (bar.items.some(x => wsRefEq(x, ref))) { flash("Already on this bar"); return; }
    if (typeof pushUndo === "function") pushUndo();
    bar.items.push({ store: ref.store, itemId: ref.itemId }); save(); render();
  });
}

function wsBarRemoveItem(ws, barId, store, itemId) {
  const tb = wsEnsureToolbar(ws); const bar = tb.bars.find(b => b.id === barId); if (!bar) return;
  bar.items = (bar.items || []).filter(x => !(x.store === store && x.itemId === itemId)); save(); render();
}

// Pin a block to the master toolbar — drops into a Custom bar, made on demand.
function wsPinToMaster(ws, ref) {
  const tb = wsEnsureToolbar(ws);
  let bar = tb.bars.find(b => b.flavor === "custom");
  if (!bar) { bar = { id: "wbar_" + (WS.nextId++), flavor: "custom", label: "Custom", items: [] }; tb.bars.push(bar); }
  bar.items = bar.items || [];
  if (bar.items.some(x => wsRefEq(x, ref))) { flash("Already on the toolbar"); return; }
  if (typeof pushUndo === "function") pushUndo();
  bar.items.push({ store: ref.store, itemId: ref.itemId }); tb.collapsed = false; save(); render();
}

// ── Silo item picker (browse a silo's tree, pick an item) ──
function wsSiloPicker(allowedStores, title, onPick) {
  const stores = (allowedStores && allowedStores.length) ? allowedStores : Object.keys(WS_TYPE);
  let cur = stores[0];
  const folderIc = (typeof S !== "undefined" && S.folder) ? S.folder : "";
  function rows(store) {
    const data = wsStoreData(store);
    if (!data || !data.folders) return `<div style="color:var(--dm);font-size:11px;padding:8px">Silo unavailable.</div>`;
    let h = "";
    (function walk(node, depth, isRoot) {
      if (!isRoot) h += `<div style="font-size:10px;color:var(--dm);padding:5px 8px 2px;padding-left:${8 + depth * 12}px;display:flex;align-items:center;gap:5px"><span style="display:flex">${folderIc}</span>${esc(node.name)}</div>`;
      (node.prompts || []).forEach(it => {
        const ttl = wsBlockTitle({ item: it, store }) || "Untitled";
        h += `<div class="wsp-it" data-store="${store}" data-id="${it.id}" style="padding:5px 8px;padding-left:${(isRoot ? 8 : 8 + (depth + 1) * 12)}px;border-radius:5px;cursor:pointer;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(ttl)}</div>`;
      });
      (node.children || []).forEach(c => walk(c, depth + 1, false));
    })(data.folders, 0, true);
    return h || `<div style="color:var(--dm);font-size:11px;padding:10px 8px">Nothing in this silo yet.</div>`;
  }
  function body() {
    let h = `<h3>${esc(title)}</h3>`;
    if (stores.length > 1) {
      h += `<div style="display:flex;gap:5px;flex-wrap:wrap;margin:6px 0 9px">`;
      stores.forEach(s => { const t = WS_TYPE[s] || { label: s }; h += `<div class="wsp-silo" data-silo="${s}" style="padding:3px 9px;border-radius:7px;border:1px solid ${s === cur ? "var(--ws)" : "var(--bl)"};background:${s === cur ? "color-mix(in srgb,var(--ws) 13%,transparent)" : "transparent"};cursor:pointer;font-size:11px">${esc(t.label)}</div>`; });
      h += `</div>`;
    }
    h += `<div style="max-height:280px;overflow:auto;border:1px solid var(--bl);border-radius:8px;padding:3px;margin-top:${stores.length > 1 ? "0" : "8px"}">${rows(cur)}</div>`;
    h += `<div class="brow" style="margin-top:11px"><button class="bg-btn" id="wspX">Cancel</button></div>`;
    return h;
  }
  showModal(body(), function wire(mc) {
    mc.querySelectorAll(".wsp-silo").forEach(el => el.addEventListener("click", () => { cur = el.dataset.silo; mc.innerHTML = body(); wire(mc); }));
    mc.querySelectorAll(".wsp-it").forEach(el => el.addEventListener("click", () => { closeModal(); onPick({ store: el.dataset.store, itemId: el.dataset.id }); }));
    mc.querySelector("#wspX").addEventListener("click", closeModal);
  });
}

// ── Wiring for both reach surfaces ──
function wireWsReach(ws, bk) {
  // toolbar
  $("wsTbAdd")?.addEventListener("click", e => wsTbAddBar(ws, e));
  $("wsTbBar")?.addEventListener("click", e => { e.stopPropagation(); wsTbAddBar(ws, e); });
  document.querySelector(".ws-tb-hd")?.addEventListener("click", e => { if (e.target.closest("#wsTbBar")) return; const tb = wsEnsureToolbar(ws); tb.collapsed = !tb.collapsed; save(); render(); });
  document.querySelectorAll(".ws-bar-cfg").forEach(el => el.addEventListener("click", e => wsBarConfig(ws, el.dataset.bar, e)));
  document.querySelectorAll(".ws-bar-add").forEach(el => el.addEventListener("click", e => { e.stopPropagation(); wsBarAddItem(ws, el.dataset.bar); }));
  document.querySelectorAll(".ws-launch").forEach(el => el.addEventListener("click", e => { if (e.target.closest(".ws-launch-x")) return; wsOpenRef({ store: el.dataset.store, itemId: el.dataset.id }); }));
  document.querySelectorAll(".ws-launch-x").forEach(el => el.addEventListener("click", e => { e.stopPropagation(); wsBarRemoveItem(ws, el.dataset.bar, el.dataset.store, el.dataset.id); }));
  // strip
  document.querySelectorAll(".ws-strip-hd").forEach(el => el.addEventListener("click", () => { wsSt.stripCol[el.dataset.bk] = !wsSt.stripCol[el.dataset.bk]; render(); }));
  document.querySelectorAll(".ws-pin-chip").forEach(el => el.addEventListener("click", e => { if (e.target.closest(".ws-pin-x")) return; const pin = wsFindPinById(ws, el.dataset.pin); if (pin) wsOpenRef(pin.ref); }));
  document.querySelectorAll(".ws-pin-x").forEach(el => el.addEventListener("click", e => {
    e.stopPropagation();
    const src = findWsNode([ws], el.dataset.src) || ws;
    const pins = wsNodePins(src); const i = pins.findIndex(p => p.id === el.dataset.pin);
    if (i >= 0) { if (typeof pushUndo === "function") pushUndo(); pins.splice(i, 1); save(); render(); }
  }));
}

// ═══════ WORKSPACE INBOX (tranche 6 — capture / triage) ═══════
// One global pen (WS.inbox), toss-in only. Capture defers the "which bucket?"
// decision; triage drains it like email. Anchored at the base of the tree.
function wsInbox() { WS.inbox = WS.inbox || []; return WS.inbox; }

function wsInboxCapture(store, itemId) {
  if (!WS_TYPE[store]) { flash("Can't capture this type"); return; }
  const pen = wsInbox();
  if (pen.some(b => b.ref && b.ref.store === store && b.ref.itemId === itemId)) { flash("Already in the Inbox"); return; }
  if (typeof pushUndo === "function") pushUndo();
  pen.push(wsNewBlock(store, itemId));
  save(); flash("Sent to workspace Inbox");
  if (aTab === "workspace") render();
}

function wsInboxFileTo(blockId) {
  const b = wsInbox().find(x => x.id === blockId);
  if (!b) return;
  const r = wsResolveBlock(b);
  wsFilePicker(r ? wsBlockTitle(r) : "item", (ws, node) => {
    node.blocks = node.blocks || [];
    if (!node.blocks.some(x => x.ref && x.ref.store === b.ref.store && x.ref.itemId === b.ref.itemId)) {
      if (typeof pushUndo === "function") pushUndo();
      node.blocks.push(wsNewBlock(b.ref.store, b.ref.itemId));
    }
    WS.inbox = wsInbox().filter(x => x.id !== blockId);
    save(); flash("Filed to “" + node.name + "”"); render();
  });
}

function wsInboxDiscard(blockId) {
  if (typeof pushUndo === "function") pushUndo();
  WS.inbox = wsInbox().filter(x => x.id !== blockId);
  save(); render();
}

function wsInboxAnchor() {
  const n = wsInbox().length, open = !!wsSt.inboxOpen;
  return `<div id="wsInboxAnchor" style="display:flex;align-items:center;gap:6px;margin-top:9px;padding:6px 8px;border:1px solid ${open ? "var(--ws)" : "var(--bl)"};border-radius:8px;background:${open ? "color-mix(in srgb,var(--ws) 10%,transparent)" : (n ? "var(--inp)" : "transparent")};cursor:pointer;font-size:12px"><span style="display:flex">${S.inbox}</span><span style="flex:1">Inbox</span>${n ? `<span style="min-width:18px;text-align:center;padding:1px 6px;border-radius:9px;background:var(--ws);color:#fff;font-size:10px;font-weight:600">${n}</span>` : `<span style="color:var(--dm);font-size:10px">empty</span>`}</div>`;
}

function wsRenderInbox() {
  const pen = wsInbox();
  let h = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px"><div style="font-size:14px;font-weight:600;display:flex;align-items:center;gap:6px"><span style="display:flex">${S.inbox}</span>Inbox triage</div><span id="wsInboxClose" style="font-size:11px;color:var(--dm);cursor:pointer;display:flex;align-items:center;gap:3px"><span style="display:flex">${S.x}</span>close</span></div>`;
  if (!pen.length) {
    h += `<div style="text-align:center;color:var(--dm);font-size:12px;padding:26px 10px;line-height:1.6">Inbox empty — nothing to file.<br>Right-click any item → “Send to workspace Inbox” to capture without deciding where it goes.</div>`;
    return h;
  }
  h += `<div style="font-size:11px;color:var(--dm);margin-bottom:8px">${pen.length} to file. Drain to empty.</div>`;
  h += `<div style="display:flex;flex-direction:column;gap:6px">`;
  pen.forEach(b => {
    const r = wsResolveBlock(b);
    const native = r && r.store === "notes" && r.item.wsMode;
    const ty = r ? (native ? wsNativeMeta(r.item) : (WS_TYPE[r.store] || { label: "ITEM", color: "#888" })) : { label: "GONE", color: "#d98a96" };
    const ttl = r ? wsBlockTitle(r) : "source removed";
    h += `<div ${r ? `draggable="true" data-ws-drag='${JSON.stringify({ src: "inbox", blockId: b.id })}'` : ""} style="display:flex;align-items:center;gap:8px;padding:7px 9px;border:1px solid var(--bl);border-radius:8px;background:var(--inp)${r ? ";cursor:grab" : ""}">`;
    h += `<span style="width:7px;height:7px;border-radius:2px;background:${ty.color};flex-shrink:0"></span>`;
    h += `<div style="flex:1;min-width:0"><div style="font-size:9px;font-weight:600;letter-spacing:.04em;color:var(--dm)">${esc(ty.label)}</div><div style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap${r ? "" : ";text-decoration:line-through;color:var(--dm)"}">${esc(ttl)}</div></div>`;
    if (r) h += `<button class="bg-btn ws-inbox-file" data-id="${b.id}" style="font-size:11px;padding:3px 9px;flex-shrink:0">File to ▾</button>`;
    h += `<span class="ws-inbox-x" data-id="${b.id}" title="Discard" style="display:flex;color:var(--dm);cursor:pointer;flex-shrink:0">${S.x}</span>`;
    h += `</div>`;
  });
  h += `</div>`;
  return h;
}

function wireWsInbox() {
  $("wsInboxAnchor")?.addEventListener("click", () => { wsSt.inboxOpen = true; render(); });
  $("wsInboxClose")?.addEventListener("click", () => { wsSt.inboxOpen = false; render(); });
  document.querySelectorAll(".ws-inbox-file").forEach(el => el.addEventListener("click", () => wsInboxFileTo(el.dataset.id)));
  document.querySelectorAll(".ws-inbox-x").forEach(el => el.addEventListener("click", () => wsInboxDiscard(el.dataset.id)));
}

// ═══════ WORKSPACE FINDER (tranche 6 — cross-everything search) ═══════
// One box over every block in every bucket in every workspace (+ the Inbox).
// Results grouped by workspace, each row labeled with where it lives. Click to
// jump. Dead-reference rows are struck through (the safe form of broken-link).
function wsFinderResults(q) {
  const needle = (q || "").trim().toLowerCase();
  if (!needle) return [];
  const groups = [];
  const scan = (ws, node, isInbox) => {
    const rows = [];
    const consider = (b, ownerNode) => {
      const r = wsResolveBlock(b);
      const store = r ? r.store : (b.ref && b.ref.store) || "";
      const native = r && r.store === "notes" && r.item.wsMode;
      const ty = r ? (native ? wsNativeMeta(r.item) : (WS_TYPE[r.store] || { label: "ITEM", color: "#888" })) : { label: "GONE", color: "#d98a96" };
      const ttl = r ? wsBlockTitle(r) : "(source removed)";
      const hay = (ttl + " " + (r && r.item.content ? r.item.content : "") + " " + ty.label).toLowerCase();
      if (!hay.includes(needle)) return;
      let path;
      if (isInbox) path = "Inbox (unfiled)";
      else if (ownerNode === ws) path = ws.name;
      else { const bc = wsBreadcrumb(ws, ownerNode.id); path = ws.name + " › " + (bc ? bc + " › " : "") + ownerNode.name; }
      rows.push({ block: b, wsId: ws.id, nodeId: isInbox ? null : ownerNode.id, store, ty, ttl, path, dead: !r, isInbox });
    };
    if (isInbox) { (node || []).forEach(b => consider(b, null)); }
    else { (function walk(n) { (n.blocks || []).forEach(b => consider(b, n)); (n.children || []).forEach(walk); })(node); }
    return rows;
  };
  (WS.workspaces || []).forEach(ws => { const rows = scan(ws, ws, false); if (rows.length) groups.push({ name: ws.name, wsId: ws.id, rows }); });
  const inboxRows = scan({ id: null, name: "Inbox" }, wsInbox(), true);
  if (inboxRows.length) groups.push({ name: "Inbox", wsId: null, rows: inboxRows, isInbox: true });
  return groups;
}

function wsRenderFinder() {
  const q = wsSt.finderQ || "";
  const groups = wsFinderResults(q);
  const filter = wsSt.finderType || null;
  const typeset = new Map();
  groups.forEach(g => g.rows.forEach(r => { if (!typeset.has(r.store)) typeset.set(r.store, r.ty); }));
  let total = 0; groups.forEach(g => g.rows.forEach(r => { if (!filter || r.store === filter) total++; }));
  let h = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px"><div style="font-size:14px;font-weight:600">Found ${total}</div><span id="wsFinderClose" style="font-size:11px;color:var(--dm);cursor:pointer;display:flex;align-items:center;gap:3px"><span style="display:flex">${S.x}</span>close</span></div>`;
  if (typeset.size > 1) {
    h += `<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px">`;
    h += `<div class="ws-fnt" data-ft="" style="padding:2px 9px;border-radius:11px;border:1px solid ${!filter ? "var(--ws)" : "var(--bl)"};background:${!filter ? "color-mix(in srgb,var(--ws) 13%,transparent)" : "transparent"};cursor:pointer;font-size:10.5px">All</div>`;
    typeset.forEach((ty, store) => { h += `<div class="ws-fnt" data-ft="${store}" style="padding:2px 9px;border-radius:11px;border:1px solid ${filter === store ? "var(--ws)" : "var(--bl)"};background:${filter === store ? "color-mix(in srgb,var(--ws) 13%,transparent)" : "transparent"};cursor:pointer;font-size:10.5px">${esc(ty.label)}</div>`; });
    h += `</div>`;
  }
  if (!total) { h += `<div style="text-align:center;color:var(--dm);font-size:12px;padding:22px 10px">No matches for “${esc(q)}”.</div>`; return h; }
  groups.forEach(g => {
    const rows = g.rows.filter(r => !filter || r.store === filter);
    if (!rows.length) return;
    h += `<div style="font-size:10px;font-weight:600;letter-spacing:.04em;color:var(--dm);text-transform:uppercase;margin:10px 0 5px">${esc(g.name)} · ${rows.length}</div>`;
    rows.forEach((r, i) => {
      h += `<div class="ws-fnd-row" draggable="true" data-ws-drag='${JSON.stringify({ src: r.isInbox ? "inbox" : "bucket", wsId: r.wsId, nodeId: r.nodeId, blockId: r.block.id })}' data-ws="${r.wsId == null ? "" : r.wsId}" data-node="${r.nodeId == null ? "" : r.nodeId}" data-inbox="${r.isInbox ? 1 : 0}" style="display:flex;align-items:center;gap:8px;padding:6px 8px;border:1px solid var(--bl);border-radius:7px;margin-bottom:5px;cursor:pointer">`;
      h += `<span style="font-size:8.5px;font-weight:600;padding:1px 5px;border-radius:4px;background:${r.ty.color}22;color:${r.ty.color};flex-shrink:0">${esc(r.ty.label)}</span>`;
      h += `<div style="flex:1;min-width:0"><div style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap${r.dead ? ";text-decoration:line-through;color:var(--dm)" : ""}">${esc(r.ttl)}</div><div style="font-size:9.5px;color:var(--dm);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.path)}</div></div>`;
      h += `</div>`;
    });
  });
  return h;
}

function wsFinderJump(wsId, nodeId, isInbox) {
  wsSt.finderQ = "";
  if (isInbox) { wsSt.inboxOpen = true; }
  else { wsSt.inboxOpen = false; if (wsId) wsSt.sel = wsId; wsSt.bsel = nodeId || wsId; wsTouch(wsSt.sel, wsSt.bsel); }
  render();
}

function wsFinderBox() {
  const q = wsSt.finderQ || "";
  return `<div class="srch-box" style="margin-bottom:10px"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--dm)" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" id="wsFinder" placeholder="Search all workspaces…" value="${escAttr(q)}" style="color:var(--tx)"><button class="ib" id="wsFinderX" style="display:${q ? "flex" : "none"}"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>`;
}

function wireWsFinder() {
  const fi = $("wsFinder");
  if (fi) {
    fi.addEventListener("input", e => { wsSt.finderQ = e.target.value; wsSt.inboxOpen = false; render(); });
    fi.addEventListener("keydown", e => { if (e.key === "Escape") { wsSt.finderQ = ""; render(); } });
  }
  $("wsFinderX")?.addEventListener("click", () => { wsSt.finderQ = ""; render(); });
  $("wsFinderClose")?.addEventListener("click", () => { wsSt.finderQ = ""; render(); });
  document.querySelectorAll(".ws-fnt").forEach(el => el.addEventListener("click", () => { wsSt.finderType = el.dataset.ft || null; render(); }));
  document.querySelectorAll(".ws-fnd-row").forEach(el => el.addEventListener("click", () => wsFinderJump(el.dataset.ws || null, el.dataset.node || null, el.dataset.inbox === "1")));
}

// ═══════ WORKSPACE CONNECT (tranche 7 — AI-summoned connection export) ═══════
// No hand-maintained graph. Assemble the pile (substance verbatim, links as
// receipts, instruments excluded), carry each piece's folder path as a relatedness
// signal, hand it to an AI, and let the answer file itself back as a block.
const WS_CONNECT_SUB = ["notes", "snippets"];      // material: ships verbatim
const WS_CONNECT_CITE = ["chats", "customgpts"];   // receipts: title + link only
// excluded entirely: prompts, imgprompts, skills, bookmarks, projects (instruments/launchers)

function wsConnectPath(ws, node) {
  if (node === ws) return ws.name;
  const bc = wsBreadcrumb(ws, node.id);
  return ws.name + " › " + (bc ? bc + " › " : "") + node.name;
}

function wsConnectCollect(ws, scopeType, bk) {
  const out = [];
  const add = n => (n.blocks || []).forEach(b => out.push({ b, node: n }));
  if (scopeType === "bucket") add(bk);
  else { const root = scopeType === "branch" ? bk : ws; (function walk(n) { add(n); (n.children || []).forEach(walk); })(root); }
  return out;
}

function wsConnectBundle(ws, scopeType, bk) {
  const items = wsConnectCollect(ws, scopeType, bk);
  const subs = [], cites = [];
  items.forEach(({ b, node }) => {
    const r = wsResolveBlock(b);
    if (!r) return;
    const store = r.store, native = store === "notes" && r.item.wsMode;
    const ty = native ? wsNativeMeta(r.item) : (WS_TYPE[store] || { label: store });
    const title = wsBlockTitle(r), path = wsConnectPath(ws, node);
    if (WS_CONNECT_SUB.includes(store)) subs.push({ path, title, label: ty.label, content: (r.item.content || "").trim() });
    else if (WS_CONNECT_CITE.includes(store)) cites.push({ path, title, label: ty.label, url: r.item.url || "" });
  });
  const scopeLabel = scopeType === "bucket" ? bk.name : scopeType === "branch" ? (bk.name + " + descendants") : ws.name + " (whole workspace)";
  let md = `# Connection export — ${scopeLabel}\n\n`;
  md += `Point an AI at this material and ask it to find the through-lines — recurring motifs, relatedness, where the same idea surfaces in more than one place. Pieces filed near each other (see each path) are already a relatedness signal worth weighing.\n\n`;
  if (subs.length) {
    md += `## Material\n\n`;
    subs.forEach(s => { md += `### ${s.title || "Untitled"}  [${s.label}]\n_${s.path}_\n\n${s.content || "(empty)"}\n\n`; });
  }
  if (cites.length) {
    md += `## References (receipts — where things came from, not ingested)\n\n`;
    cites.forEach(c => { md += `- **${c.title || "Untitled"}** [${c.label}] — _${c.path}_${c.url ? " — " + c.url : ""}\n`; });
    md += `\n`;
  }
  if (!subs.length && !cites.length) md += `_Nothing to export in this scope yet — add some clips, notes, jots, docs, or chats._\n`;
  return { md, subCount: subs.length, citeCount: cites.length };
}

function wsConnectFileBack(bk, pasted) {
  const home = wsNotesHomeFolder();
  if (!home) { flash("Notes silo unavailable"); return; }
  if (typeof pushUndo === "function") pushUndo();
  const title = "Connection map — " + new Date().toLocaleDateString();
  const content = "# " + title + "\n\n" + pasted.trim();
  const note = buildItem(NT, title, content, [], { wsMode: "doc" });
  home.prompts.push(note);
  bk.blocks = bk.blocks || [];
  bk.blocks.push(wsNewBlock("notes", note.id));
  save();
}

function wsConnectModal(ws, bk) {
  let scopeType = (bk === ws) ? "workspace" : "bucket";
  const scopes = (bk === ws)
    ? [["workspace", "Whole workspace"]]
    : [["bucket", "This bucket"], ["branch", "This branch"], ["workspace", "Whole workspace"]];
  function body() {
    const { md, subCount, citeCount } = wsConnectBundle(ws, scopeType, bk);
    let h = `<h3 style="display:flex;align-items:center;gap:6px">${I.spark} Summon connections</h3>`;
    h += `<div style="font-size:11px;color:var(--dm);margin:2px 0 9px">Bundle the pile, take it to any AI, paste the map back. It files itself as a block.</div>`;
    if (scopes.length > 1) {
      h += `<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px">`;
      scopes.forEach(([k, lbl]) => { h += `<div class="wsc-scope" data-sc="${k}" style="padding:3px 10px;border-radius:8px;border:1px solid ${scopeType === k ? "var(--ws)" : "var(--bl)"};background:${scopeType === k ? "color-mix(in srgb,var(--ws) 13%,transparent)" : "transparent"};cursor:pointer;font-size:11px">${esc(lbl)}</div>`; });
      h += `</div>`;
    }
    h += `<div style="font-size:10.5px;color:var(--dm);margin-bottom:5px">${subCount} material · ${citeCount} cited</div>`;
    h += `<textarea id="wscOut" readonly style="width:100%;box-sizing:border-box;height:150px;font-size:11px;font-family:monospace;background:var(--inp);color:var(--tx);border:1px solid var(--bl);border-radius:8px;padding:8px;resize:vertical">${esc(md)}</textarea>`;
    h += `<div class="brow" style="margin-top:8px;display:flex;gap:6px"><button class="bg-btn" id="wscCopy" style="flex:1">Copy bundle</button></div>`;
    h += `<div style="border-top:1px solid var(--bl);margin:13px 0 9px"></div>`;
    h += `<div style="font-size:12px;font-weight:600;margin-bottom:5px">Close the loop</div>`;
    h += `<div style="font-size:11px;color:var(--dm);margin-bottom:6px">Paste the connection map your AI gave you — it lands as a doc block in “${esc(bk.name)}”.</div>`;
    h += `<textarea id="wscBack" placeholder="Paste the AI's connection map here…" style="width:100%;box-sizing:border-box;height:90px;font-size:12px;background:var(--inp);color:var(--tx);border:1px solid var(--bl);border-radius:8px;padding:8px;resize:vertical"></textarea>`;
    h += `<div class="brow" style="margin-top:9px;display:flex;gap:6px"><button class="bg-btn" id="wscX" style="flex:1">Close</button><button class="bg-btn pri ws-c-save" id="wscSave" style="flex:1">Save map as block</button></div>`;
    return h;
  }
  showModal(body(), function wire(mc) {
    mc.querySelectorAll(".wsc-scope").forEach(el => el.addEventListener("click", () => { scopeType = el.dataset.sc; mc.innerHTML = body(); wire(mc); }));
    mc.querySelector("#wscCopy")?.addEventListener("click", () => { const { md } = wsConnectBundle(ws, scopeType, bk); navigator.clipboard.writeText(md).then(() => flash("Bundle copied")).catch(() => flash("Copy failed")); });
    mc.querySelector("#wscX")?.addEventListener("click", closeModal);
    mc.querySelector("#wscSave")?.addEventListener("click", () => {
      const v = mc.querySelector("#wscBack").value.trim();
      if (!v) { flash("Nothing pasted to save"); return; }
      wsConnectFileBack(bk, v); closeModal(); flash("Connection map filed as a block"); render();
    });
  });
}

// ═══════ WORKSPACE DRAG-TO-FILE (tranche 8b) ═══════
// Drag an Inbox item or a finder result onto any bucket in the tree to file/refile
// it there — no picker, the drop target IS the decision.
function wsFileInboxToBucket(blockId, target) {
  const b = wsInbox().find(x => x.id === blockId);
  if (!b || !target) return;
  if (typeof pushUndo === "function") pushUndo();
  target.blocks = target.blocks || [];
  if (!target.blocks.some(x => x.ref && x.ref.store === b.ref.store && x.ref.itemId === b.ref.itemId)) target.blocks.push(wsNewBlock(b.ref.store, b.ref.itemId));
  WS.inbox = wsInbox().filter(x => x.id !== blockId);
  save(); flash("Filed to “" + target.name + "”"); render();
}

function wsMoveBlockToBucket(srcWsId, srcNodeId, blockId, target) {
  const srcWs = (WS.workspaces || []).find(w => w.id === srcWsId);
  if (!srcWs || !target) return;
  const srcNode = (srcNodeId === srcWsId) ? srcWs : findWsNode(srcWs.children, srcNodeId);
  if (!srcNode || srcNode === target) return;
  const idx = (srcNode.blocks || []).findIndex(b => b.id === blockId);
  if (idx < 0) return;
  if (typeof pushUndo === "function") pushUndo();
  const [blk] = srcNode.blocks.splice(idx, 1);
  target.blocks = target.blocks || [];
  if (!target.blocks.some(b => b.ref && b.ref.store === blk.ref.store && b.ref.itemId === blk.ref.itemId)) target.blocks.push(blk);
  save(); flash("Moved to “" + target.name + "”"); render();
}

function wireWsDnD(ws) {
  // drag sources (inbox rows + finder rows carry a JSON payload)
  document.querySelectorAll("[data-ws-drag]").forEach(el => {
    el.addEventListener("dragstart", e => { e.dataTransfer.setData("ws-drag", el.dataset.wsDrag); e.dataTransfer.effectAllowed = "move"; el.style.opacity = ".5"; });
    el.addEventListener("dragend", () => { el.style.opacity = ""; });
  });
  // drop targets (every bucket in the tree)
  document.querySelectorAll(".ws-node").forEach(el => {
    el.addEventListener("dragover", e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; el.style.outline = "2px solid var(--ws)"; el.style.outlineOffset = "-1px"; });
    el.addEventListener("dragleave", () => { el.style.outline = ""; });
    el.addEventListener("drop", e => {
      e.preventDefault(); el.style.outline = "";
      const raw = e.dataTransfer.getData("ws-drag"); if (!raw) return;
      let p; try { p = JSON.parse(raw); } catch (e2) { return; }
      const targetId = el.dataset.bk;
      const target = (targetId === ws.id) ? ws : findWsNode(ws.children, targetId);
      if (!target) return;
      if (p.src === "inbox") wsFileInboxToBucket(p.blockId, target);
      else wsMoveBlockToBucket(p.wsId, p.nodeId, p.blockId, target);
    });
  });
}

// ═══════ WORKSPACE WELCOME-BACK HOME (tranche 8c) ═══════
// The "where was I" landing: recent buckets to jump back into + Inbox status.
// Shows whenever no bucket is open. Recency persists on WS (rides Drive sync).
function wsRecent() { WS.recent = WS.recent || []; return WS.recent; }

function wsTouch(wsId, nodeId) {
  if (!wsId || !nodeId) return;
  const list = wsRecent();
  if (list[0] && list[0].nodeId === nodeId) { list[0].ts = Date.now(); return; }  // same bucket: no churn
  WS.recent = [{ wsId, nodeId, ts: Date.now() }].concat(list.filter(r => r.nodeId !== nodeId)).slice(0, 8);
  save();
}

function wsResolveRecent() {
  return wsRecent().map(r => {
    const w = (WS.workspaces || []).find(x => x.id === r.wsId);
    if (!w) return null;
    const node = (r.nodeId === r.wsId) ? w : findWsNode(w.children, r.nodeId);
    return node ? { ws: w, node, ts: r.ts } : null;
  }).filter(Boolean);
}

function wsRenderHome(ws) {
  const recents = wsResolveRecent(), inboxN = wsInbox().length;
  let h = `<div style="font-size:15px;font-weight:600;margin-bottom:3px">Welcome back</div>`;
  h += `<div style="font-size:11px;color:var(--dm);margin-bottom:14px">Where you left off across your desk.</div>`;
  h += `<div style="display:flex;align-items:center;gap:9px;padding:9px 11px;border:1px solid var(--bl);border-radius:9px;margin-bottom:14px;background:${inboxN ? "color-mix(in srgb,var(--ws) 6%,transparent)" : "transparent"}">`;
  h += `<span style="display:flex">${S.inbox}</span><div style="flex:1;min-width:0"><div style="font-size:12.5px;font-weight:600">Inbox</div><div style="font-size:10.5px;color:var(--dm)">${inboxN ? inboxN + " unfiled — drain it like email" : "clear — nothing waiting"}</div></div>`;
  if (inboxN) h += `<button class="bg-btn" id="wsHomeTriage" style="font-size:11px;padding:3px 11px;flex-shrink:0">Triage →</button>`;
  h += `</div>`;
  h += `<div style="font-size:10px;font-weight:600;letter-spacing:.04em;color:var(--dm);text-transform:uppercase;margin-bottom:7px">Jump back in</div>`;
  if (!recents.length) {
    h += `<div style="color:var(--dm);font-size:12px;padding:12px 4px;line-height:1.6">Open a bucket and it lands here, so next time you can pick up right where you left off.</div>`;
    return h;
  }
  h += `<div style="display:flex;flex-direction:column;gap:6px">`;
  recents.forEach(({ ws: w, node }) => {
    const path = node === w ? w.name : w.name + " › " + (wsBreadcrumb(w, node.id) || node.name);
    const n = (node.blocks || []).length;
    h += `<div class="ws-home-card" data-ws="${w.id}" data-node="${node.id}" style="display:flex;align-items:center;gap:9px;padding:9px 11px;border:1px solid var(--bl);border-radius:9px;cursor:pointer">`;
    h += `<span style="width:9px;height:9px;border-radius:3px;background:${w.color || "var(--ws)"};flex-shrink:0"></span>`;
    h += `<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(node.name)}</div><div style="font-size:10px;color:var(--dm);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(path)}</div></div>`;
    h += `<span style="font-size:10px;color:var(--dm);flex-shrink:0">${n} block${n === 1 ? "" : "s"}</span></div>`;
  });
  h += `</div>`;
  return h;
}

function wireWsHome(ws) {
  $("wsHome")?.addEventListener("click", () => { wsSt.bsel = null; wsSt.inboxOpen = false; wsSt.finderQ = ""; render(); });
  $("wsHomeTriage")?.addEventListener("click", () => { wsSt.inboxOpen = true; render(); });
  document.querySelectorAll(".ws-home-card").forEach(el => el.addEventListener("click", () => {
    wsSt.sel = el.dataset.ws; wsSt.bsel = el.dataset.node; wsTouch(el.dataset.ws, el.dataset.node); render();
  }));
}

// ═══════ WORKSPACES v2 — folder-level subject pools ═══════
// A workspace (Work, School, Literary…) is a set of FOLDERS across silos.
// Entering one virtualizes each section's tree: root reads "My Clips (Literary)"
// with only the ordained folders beneath it (real ids — selection/content work
// unchanged). Sections with no assigned folders render normally. Combined View
// (activeWorkspace="") restores everything. Registry lives in cfg.workspaces;
// folder nodes carry wsIds:[].

function wsList(){return cfg?.workspaces||[]}
function wsActive(){return wsList().find(w=>w.id===cfg?.activeWorkspace)||null}
function wsFolderHas(f,wsId){return Array.isArray(f.wsIds)&&f.wsIds.includes(wsId)}

/** Collect folders assigned to wsId in a tree (top-most wins — an assigned
 *  folder brings its whole subtree, so nested assignments are redundant). */
function wsAssignedIn(rootNode,wsId){
  const out=[];
  (function walk(n){
    if(n!==rootNode&&wsFolderHas(n,wsId)){out.push(n);return}
    (n.children||[]).forEach(walk);
  })(rootNode);
  return out;
}

/** Virtual tree for the active workspace, or null when combined view /
 *  no assignments in this silo. Root keeps the REAL id; name gains the tag. */
function wsVirtualTree(rootNode){
  const ws=wsActive();if(!ws)return null;
  const picked=wsAssignedIn(rootNode,ws.id);
  if(!picked.length)return null;
  return{id:rootNode.id,name:`${rootNode.name} (${ws.name})`,color:ws.color||rootNode.color||"",prompts:[],children:picked,_wsVirtual:true};
}

function wsSave(){save()}
function wsNewId(){return "ws2_"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}

// Open the LLM Workbench in a real (draggable) browser tab — a text surface for
// Cowork/Codex/computer-use agents to edit a silo; Save writes back to the vault.
function openWorkbench(scope){
  const url=chrome.runtime.getURL("workbench.html"+(scope?("?scope="+encodeURIComponent(scope)):""));
  try{chrome.tabs.create({url})}catch(e){try{window.open(url,"_blank")}catch(_){/* last resort */}}
}
const WB_SCOPES=[["prompts","Prompts"],["imgprompts","Image Prompts"],["snippets","Clips"],["bookmarks","Bookmarks"],["notes","Notes"],["skills","Skills"],["customgpts","Custom GPTs"],["photos","Photos"],["vault","Whole vault"]];

/** Assign/unassign the folder to workspaces — folder right-click → Workspace… */
function wsAssignFolderMd(folderId){
  const d2=dt();const f=findFolder(d2.folders,folderId);if(!f)return;
  const rows=wsList().map(w=>`<div class="fpi" data-wsa="${w.id}" style="display:flex;gap:6px;align-items:center;padding:5px 7px;cursor:pointer"><span style="width:9px;height:9px;border-radius:50%;background:${escAttr(w.color||'var(--ws)')};flex-shrink:0"></span><span style="flex:1">${esc(w.name)}</span><span style="color:var(--gn)">${wsFolderHas(f,w.id)?S.check:""}</span></div>`).join("")||`<div style="font-size:10px;color:var(--dm);padding:6px">No workspaces yet — create one below.</div>`;
  showModal(`<h3>Workspaces — ${esc(f.name)}</h3><p style="font-size:10px;color:var(--dm)">This folder (and everything in it) surfaces when a checked workspace is active.</p><div style="max-height:180px;overflow-y:auto">${rows}</div><div style="display:flex;gap:4px;margin-top:8px"><input type="text" id="wsNewI" placeholder="New workspace (e.g. Literary)" style="flex:1"><button class="bs" id="wsNewB">+ Create</button></div><div class="brow"><button class="bp" id="wsDone">Done</button></div>`,mc=>{
    mc.querySelectorAll("[data-wsa]").forEach(el=>el.addEventListener("click",()=>{
      const id=el.dataset.wsa;f.wsIds=Array.isArray(f.wsIds)?f.wsIds:[];
      const i=f.wsIds.indexOf(id);if(i>=0)f.wsIds.splice(i,1);else f.wsIds.push(id);
      wsSave();closeModal();wsAssignFolderMd(folderId);
    }));
    mc.querySelector("#wsNewB").addEventListener("click",()=>{
      const nm=mc.querySelector("#wsNewI").value.trim();if(!nm)return;
      cfg.workspaces=wsList();
      const colors=["#8b82e8","#43b38b","#c9a45c","#5c8ec4","#cf7a9e","#7ab87a","#d98a5c"];
      const nw={id:wsNewId(),name:nm,color:colors[cfg.workspaces.length%colors.length]};
      cfg.workspaces.push(nw);
      // Auto-assign the folder you're standing on — creating a workspace here
      // means this folder belongs to it, so it's never born empty.
      f.wsIds=Array.isArray(f.wsIds)?f.wsIds:[];
      if(!f.wsIds.includes(nw.id))f.wsIds.push(nw.id);
      wsSave();closeModal();flash("Workspace “"+nm+"” created · "+f.name+" added");wsAssignFolderMd(folderId);
    });
    mc.querySelector("#wsDone").addEventListener("click",()=>{closeModal();render()});
  });
}

/** Active-workspace strip shown at the top of every section. */
function wsBarHtml(){
  const ws=wsActive();if(!ws)return "";
  return`<div id="wsBar" style="display:flex;align-items:center;gap:6px;margin:3px 10px 2px;padding:3px 9px;border-radius:6px;background:color-mix(in srgb,${escAttr(ws.color||'var(--ws)')} 14%,transparent);border:1px solid color-mix(in srgb,${escAttr(ws.color||'var(--ws)')} 35%,transparent);font-size:10px;cursor:pointer" title="Click for Combined View"><span style="width:8px;height:8px;border-radius:50%;background:${escAttr(ws.color||'var(--ws)')}"></span><strong style="color:${escAttr(ws.color||'var(--ws)')}">${esc(ws.name)}</strong><span style="color:var(--dm)">workspace — click for Combined View</span></div>`;
}
function wireWsBar(){$("wsBar")?.addEventListener("click",()=>{cfg.activeWorkspace="";wsSave();render();flash("Combined View")})}

/** The Workspace tab — hub: enter/exit, see assignments, manage. */
function renderWorkspaceHub(){
  const m=$("main");if(!m)return;
  const silos=[["prompts",P,"root"],["imgprompts",IP,"iroot"],["snippets",SN,"sroot"],["bookmarks",BM,"broot"],["notes",NT,"nroot"],["skills",KL,"kroot"],["customgpts",GP,"groot"],["photos",PH,"phroot"]];
  const labels={prompts:"Prompts",imgprompts:"Images",snippets:"Clips",bookmarks:"Bookmarks",notes:"Notes",skills:"Skills",customgpts:"Custom GPTs",photos:"Photos"};
  let h=`<div class="pad" style="padding:10px"><h2 style="font-size:14px;margin-bottom:2px">Workspaces</h2><p style="font-size:10px;color:var(--mu);margin-bottom:8px">Subject pools built from folders. Right-click any folder → <strong>Workspace…</strong> to ordain it. Enter one and every section shows only its folders; Combined View shows everything.</p>`;
  // ── AI Workbench launcher ──
  h+=`<div style="border:1px solid var(--bl);border-radius:8px;padding:9px;margin-bottom:12px;background:var(--sf)">
    <div style="font-weight:600;font-size:11px">${S.package} AI Workbench <span style="color:var(--dm);font-weight:400">— a tab for work LLMs to edit inside the vault</span></div>
    <div style="font-size:9px;color:var(--dm);margin:3px 0 7px">Opens a draggable browser tab that shows a silo (or the whole vault) as one editable document. Cowork, Codex, or a computer-use agent can add, optimize, and reorganize there; <strong>Save to Vault</strong> writes straight back. Drag the tab into your assistant's window and let it work.</div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center">
      <select id="wbScopeSel" style="background:var(--inp);color:var(--tx);border:1px solid var(--bl);border-radius:6px;padding:5px 7px;font-size:11px">${WB_SCOPES.map(([v,l])=>`<option value="${v}">${esc(l)}</option>`).join("")}</select>
      <button class="bp" id="wbOpen">Open Workbench tab</button>
    </div>
  </div>`;
  h+=`<div class="fpi" data-wsgo="" style="padding:7px 9px;cursor:pointer;${!cfg.activeWorkspace?'background:var(--hv);border-radius:6px;font-weight:600':''}">${S.grid} Combined View ${!cfg.activeWorkspace?'<span style="color:var(--gn)">'+S.check+'</span>':''}</div>`;
  wsList().forEach(w=>{
    const counts=silos.map(([k,store])=>({k,n:wsAssignedIn(store.folders,w.id).length})).filter(x=>x.n);
    const sub=counts.length?counts.map(x=>`${labels[x.k]} ${x.n}`).join(" · "):"no folders yet";
    h+=`<div class="fpi" data-wsgo="${w.id}" style="display:flex;gap:7px;align-items:center;padding:7px 9px;cursor:pointer;${cfg.activeWorkspace===w.id?'background:var(--hv);border-radius:6px':''}"><span style="width:10px;height:10px;border-radius:50%;background:${escAttr(w.color||'var(--ws)')};flex-shrink:0"></span><div style="flex:1;min-width:0"><div style="font-weight:600">${esc(w.name)} ${cfg.activeWorkspace===w.id?'<span style="color:var(--gn)">'+S.check+'</span>':''}</div><div style="font-size:9px;color:var(--dm)">${esc(sub)}</div></div><button class="ib" data-wsrn="${w.id}" title="Rename">${I.edit}</button><button class="ib dng" data-wsdel="${w.id}" title="Delete">${I.trash}</button></div>`;
  });
  h+=`<div style="display:flex;gap:4px;margin-top:10px"><input type="text" id="wsHubNewI" placeholder="New workspace name…" style="flex:1"><button class="bp" id="wsHubNewB">+ Create</button></div>`;
  h+=`<div style="margin-top:12px;font-size:9px;color:var(--dm);line-height:1.6">Tip: an ordained folder brings its whole subtree. Assign a folder to several workspaces if it belongs to more than one subject.</div></div>`;
  m.innerHTML=h;
  m.querySelectorAll("[data-wsgo]").forEach(el=>el.addEventListener("click",e=>{
    if(e.target.closest("[data-wsrn],[data-wsdel]"))return;
    cfg.activeWorkspace=el.dataset.wsgo;wsSave();
    if(cfg.activeWorkspace){const w=wsActive();flash("Workspace: "+w.name)}else flash("Combined View");
    render();
  }));
  m.querySelectorAll("[data-wsrn]").forEach(el=>el.addEventListener("click",()=>{
    const w=wsList().find(x=>x.id===el.dataset.wsrn);if(!w)return;
    showModal(`<h3>Rename Workspace</h3><input type="text" id="wsRnI" value="${escAttr(w.name)}"><div class="brow"><button class="bg-btn" id="wsRnX">Cancel</button><button class="bp" id="wsRnY">Save</button></div>`,mc=>{
      const inp=mc.querySelector("#wsRnI");inp.focus();inp.select();
      mc.querySelector("#wsRnX").addEventListener("click",closeModal);
      mc.querySelector("#wsRnY").addEventListener("click",()=>{w.name=inp.value.trim()||w.name;wsSave();closeModal();render()});
    });
  }));
  m.querySelectorAll("[data-wsdel]").forEach(el=>el.addEventListener("click",()=>{
    const w=wsList().find(x=>x.id===el.dataset.wsdel);if(!w)return;
    showModal(`<h3 style="color:var(--dn)">Delete "${esc(w.name)}"?</h3><p>Folders and their contents are untouched — only the workspace grouping is removed.</p><div class="brow"><button class="bg-btn" id="wsDX">Cancel</button><button class="bdn" id="wsDY">Delete</button></div>`,mc=>{
      mc.querySelector("#wsDX").addEventListener("click",closeModal);
      mc.querySelector("#wsDY").addEventListener("click",()=>{
        const wid=w.id;
        cfg.workspaces=wsList().filter(x=>x.id!==wid);
        if(cfg.activeWorkspace===wid)cfg.activeWorkspace="";
        // Strip the deleted workspace's id from every folder so no orphan refs linger.
        [P,IP,SN,BM,NT,KL,GP,PH].forEach(store=>{if(store?.folders)(function strip(n){if(Array.isArray(n.wsIds)){const i=n.wsIds.indexOf(wid);if(i>=0)n.wsIds.splice(i,1)}(n.children||[]).forEach(strip)})(store.folders)});
        wsSave();closeModal();render();
      });
    });
  }));
  $("wbOpen")?.addEventListener("click",()=>openWorkbench($("wbScopeSel")?.value||"prompts"));
  $("wsHubNewB")?.addEventListener("click",()=>{
    const nm=$("wsHubNewI").value.trim();if(!nm)return;
    cfg.workspaces=wsList();
    const colors=["#8b82e8","#43b38b","#c9a45c","#5c8ec4","#cf7a9e","#7ab87a","#d98a5c"];
    cfg.workspaces.push({id:wsNewId(),name:nm,color:colors[cfg.workspaces.length%colors.length]});
    wsSave();render();
  });
  rFtr();updTabs();
}

if(typeof module!=="undefined"&&module.exports){module.exports={wsAssignedIn,wsVirtualTree,wsFolderHas,wsActive,wsList}}

// ═══════ SECTION PANELS ═══════
function spCreatePanel(){
  if((BM.sectionPanels||[]).length>=10){flash("Maximum 10 panels");return}
  showModal(`<h3>New Section Panel</h3><p style="font-size:10px;color:var(--mu);margin-bottom:8px">Create a collapsible panel with pinned bookmarks. Choose a display mode — favicon tiles, labeled capsules, or hyperlink lists. Mode is locked after creation.</p><input type="text" id="spNameI" placeholder="Panel name (e.g. Financial, Dev Tools, Music...)"><div style="margin-top:8px"><span style="font-size:9px;color:var(--dm);display:block;margin-bottom:4px">DISPLAY MODE (locked after creation)</span><div id="spModePick" style="display:flex;gap:4px;flex-wrap:wrap"></div></div><div class="brow"><button class="bg-btn" id="spX">Cancel</button><button class="bp" id="spY">Create Panel</button></div>`,mc=>{
    const inp=mc.querySelector("#spNameI");inp.focus();
    let pickedMode="capsule";
    const mpick=mc.querySelector("#spModePick");
    const modeLabels={favicon:S.fav+" Favicons - dense icon grid",capsule:S.cap+" Capsules - icon + label",link:S.link+" Links - full hyperlinks"};
    BOOKMARK_PANEL_MODES.forEach(k=>{
      const l=modeLabels[k];
      const btn=document.createElement("button");btn.className="bs"+(pickedMode===k?" sel":"");btn.textContent=l;btn.style.fontSize="10px";btn.style.padding="5px 8px";
      btn.addEventListener("click",()=>{pickedMode=k;mpick.querySelectorAll(".bs").forEach(b=>b.classList.remove("sel"));btn.classList.add("sel")});
      mpick.appendChild(btn);
    });
    mc.querySelector("#spX").addEventListener("click",closeModal);
    mc.querySelector("#spY").addEventListener("click",()=>{
      const name=inp.value.trim();
      if(!name){inp.style.borderColor='var(--dn)';inp.setAttribute("placeholder","Name is required");inp.focus();return}
      const mode=normalizeBookmarkPanelMode(pickedMode);
      BM.sectionPanels=BM.sectionPanels||[];
      BM.sectionPanels.push({id:"sp_"+Date.now(),name,mode,clusters:[{id:"cl_"+Date.now(),label:"",color:"",items:[]}]});
      save();closeModal();bSt._spOn=true;render();flash("Panel created — drag bookmarks here or right-click → Pin");
    });
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")mc.querySelector("#spY").click()});
    inp.addEventListener("input",()=>{inp.style.borderColor=''});
  });
}
function spRenamePanel(panelId){
  const panel=(BM.sectionPanels||[]).find(x=>x.id===panelId);if(!panel)return;
  showModal(`<h3>Rename Panel</h3><input type="text" id="spRnI" value="${esc(panel.name)}"><div class="brow"><button class="bg-btn" id="spRnX">Cancel</button><button class="bp" id="spRnY">Save</button></div>`,mc=>{
    const inp=mc.querySelector("#spRnI");inp.focus();inp.select();
    mc.querySelector("#spRnX").addEventListener("click",closeModal);
    mc.querySelector("#spRnY").addEventListener("click",()=>{panel.name=inp.value.trim()||panel.name;save();closeModal();render()});
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")mc.querySelector("#spRnY").click()});
  });
}
function spDeletePanel(panelId){
  const panel=(BM.sectionPanels||[]).find(x=>x.id===panelId);if(!panel)return;
  showModal(`<h3 style="color:var(--dn)">Delete Panel?</h3><p>Remove "${esc(panel.name)}" section panel. Bookmarks are not deleted — only unpinned.</p><div class="brow"><button class="bg-btn" id="spDX">Cancel</button><button class="bdn" id="spDY">Delete</button></div>`,mc=>{
    mc.querySelector("#spDX").addEventListener("click",closeModal);
    mc.querySelector("#spDY").addEventListener("click",()=>{BM.sectionPanels=(BM.sectionPanels||[]).filter(x=>x.id!==panelId);save();closeModal();render()});
  });
}
function spCreateCluster(panelId){
  const panel=(BM.sectionPanels||[]).find(x=>x.id===panelId);if(!panel)return;
  showModal(`<h3>New Color Zone</h3><p style="font-size:10px;color:var(--mu);margin-bottom:8px">Add a colored zone inside "${esc(panel.name)}". Items pinned here will sit on this background color.</p><input type="text" id="clLblI" placeholder="Legend label (optional — e.g. Banking, Music...)"><div style="margin-top:8px"><span style="font-size:9px;color:var(--dm);display:block;margin-bottom:4px">ZONE COLOR</span><div id="clColorPick" style="display:flex;gap:4px;flex-wrap:wrap"></div></div><div class="brow"><button class="bg-btn" id="clX">Cancel</button><button class="bp" id="clY">Create Zone</button></div>`,mc=>{
    const inp=mc.querySelector("#clLblI");inp.focus();
    let picked="";
    const cpick=mc.querySelector("#clColorPick");
    [...COLORS.filter(c=>c.v),...TAG_COLORS.filter(c=>c.v)].forEach(c=>{
      const dot=document.createElement("div");dot.className="tag-cdot";dot.style.background=c.v;
      dot.addEventListener("click",()=>{picked=c.v;cpick.querySelectorAll(".tag-cdot").forEach(d=>d.classList.remove("sel"));dot.classList.add("sel")});
      cpick.appendChild(dot);
    });
    mc.querySelector("#clX").addEventListener("click",closeModal);
    mc.querySelector("#clY").addEventListener("click",()=>{
      if(!picked){flash("Pick a color");return}
      panel.clusters=panel.clusters||[];
      panel.clusters.push({id:"cl_"+Date.now(),label:inp.value.trim(),color:picked,items:[]});
      save();closeModal();render();flash("Color zone added");
    });
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")mc.querySelector("#clY").click()});
  });
}
function spRenameCluster(panelId,clId){
  const panel=(BM.sectionPanels||[]).find(x=>x.id===panelId);if(!panel)return;
  const cluster=(panel.clusters||[]).find(c=>c.id===clId);if(!cluster)return;
  showModal(`<h3>Rename Zone</h3><input type="text" id="clRnI" value="${esc(cluster.label||'')}"><div class="brow"><button class="bg-btn" id="clRnX">Cancel</button><button class="bp" id="clRnY">Save</button></div>`,mc=>{
    const inp=mc.querySelector("#clRnI");inp.focus();inp.select();
    mc.querySelector("#clRnX").addEventListener("click",closeModal);
    mc.querySelector("#clRnY").addEventListener("click",()=>{cluster.label=inp.value.trim();save();closeModal();render()});
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")mc.querySelector("#clRnY").click()});
  });
}
function spColorCluster(panelId,clId){
  const panel=(BM.sectionPanels||[]).find(x=>x.id===panelId);if(!panel)return;
  const cluster=(panel.clusters||[]).find(c=>c.id===clId);if(!cluster)return;
  let h2=`<h3>Zone Color</h3><p style="font-size:10px;color:var(--dm)">Background color for items in this zone.</p><div id="clCPick" style="display:flex;gap:5px;flex-wrap:wrap;margin:8px 0"></div><div class="brow"><button class="bg-btn" id="ccX">Cancel</button><button class="bp" id="ccY">Save</button></div>`;
  showModal(h2,mc=>{
    let picked=cluster.color||"";
    const cpick=mc.querySelector("#clCPick");
    [{n:"None",v:""},...COLORS.filter(c=>c.v),...TAG_COLORS.filter(c=>c.v)].forEach(c=>{
      const dot=document.createElement("div");dot.className="tag-cdot"+(picked===c.v?" sel":"");
      dot.style.background=c.v||"var(--hv)";
      if(!c.v)dot.classList.add("tag-cdot-none");
      dot.addEventListener("click",()=>{picked=c.v;cpick.querySelectorAll(".tag-cdot").forEach(d=>d.classList.remove("sel"));dot.classList.add("sel")});
      cpick.appendChild(dot);
    });
    mc.querySelector("#ccX").addEventListener("click",closeModal);
    mc.querySelector("#ccY").addEventListener("click",()=>{cluster.color=picked;save();closeModal();render()});
  });
}
function spDeleteCluster(panelId,clId){
  const panel=(BM.sectionPanels||[]).find(x=>x.id===panelId);if(!panel)return;
  const cluster=(panel.clusters||[]).find(c=>c.id===clId);if(!cluster)return;
  const ct=(cluster.items||[]).length;
  showModal(`<h3 style="color:var(--dn)">Delete Zone?</h3><p>Remove "${esc(cluster.label||'this zone')}"${ct?' and unpin '+ct+' bookmark'+(ct>1?'s':''):''} from "${esc(panel.name)}".</p><div class="brow"><button class="bg-btn" id="cdX">Cancel</button><button class="bdn" id="cdY">Delete</button></div>`,mc=>{
    mc.querySelector("#cdX").addEventListener("click",closeModal);
    mc.querySelector("#cdY").addEventListener("click",()=>{panel.clusters=(panel.clusters||[]).filter(c=>c.id!==clId);save();closeModal();render()});
  });
}
function spItemColor(panelId,clId,itemId){
  const panel=(BM.sectionPanels||[]).find(x=>x.id===panelId);if(!panel)return;
  const cluster=(panel.clusters||[]).find(c=>c.id===clId);if(!cluster)return;
  const si=(cluster.items||[]).find(x=>x.id===itemId);if(!si)return;
  let h2=`<h3>Item Color</h3><p style="font-size:10px;color:var(--dm)">Override the zone color for this bookmark. Choose "Zone Default" to inherit.</p><div id="siCPick" style="display:flex;gap:5px;flex-wrap:wrap;margin:8px 0"></div><div class="brow"><button class="bg-btn" id="siX">Cancel</button><button class="bp" id="siY">Save</button></div>`;
  showModal(h2,mc=>{
    let picked=si.color||"";
    const cpick=mc.querySelector("#siCPick");
    [{n:"Zone Default",v:""},...COLORS.filter(c=>c.v),...TAG_COLORS.filter(c=>c.v)].forEach(c=>{
      const dot=document.createElement("div");dot.className="tag-cdot"+(picked===c.v?" sel":"");
      dot.style.background=c.v||"var(--hv)";
      if(!c.v)dot.classList.add("tag-cdot-none");
      dot.addEventListener("click",()=>{picked=c.v;cpick.querySelectorAll(".tag-cdot").forEach(d=>d.classList.remove("sel"));dot.classList.add("sel")});
      cpick.appendChild(dot);
    });
    mc.querySelector("#siX").addEventListener("click",closeModal);
    mc.querySelector("#siY").addEventListener("click",()=>{si.color=picked||null;save();closeModal();render()});
  });
}
function spMoveItem(panelId,srcClId,itemId){
  const panel=(BM.sectionPanels||[]).find(x=>x.id===panelId);if(!panel)return;
  const others=(panel.clusters||[]).filter(c=>c.id!==srcClId);
  if(!others.length){flash("No other zones");return}
  let h2=`<h3>Move to Zone</h3>`;
  others.forEach(cl=>{
    const dotCol=cl.color||'var(--dm)';
    h2+=`<div class="cd-row" data-mvz="${cl.id}" style="padding:6px 8px;cursor:pointer"><span class="cd-dot" style="background:${dotCol}"></span><span class="cd-name">${esc(cl.label||'(unlabeled)')}</span></div>`;
  });
  h2+=`<div class="brow"><button class="bg-btn" id="mvzX">Cancel</button></div>`;
  showModal(h2,mc=>{
    mc.querySelector("#mvzX").addEventListener("click",closeModal);
    mc.querySelectorAll("[data-mvz]").forEach(el=>{el.addEventListener("click",()=>{
      const tgtClId=el.dataset.mvz;
      const srcCl=(panel.clusters||[]).find(c=>c.id===srcClId);
      const tgtCl=(panel.clusters||[]).find(c=>c.id===tgtClId);
      if(!srcCl||!tgtCl)return;
      const idx=(srcCl.items||[]).findIndex(x=>x.id===itemId);
      if(idx<0)return;
      const[moved]=srcCl.items.splice(idx,1);
      tgtCl.items=tgtCl.items||[];tgtCl.items.push(moved);
      save();closeModal();render();flash("Moved");
    })});
  });
}
function spPinToCluster(panelId,clId,bookmarkId){
  const panel=(BM.sectionPanels||[]).find(x=>x.id===panelId);if(!panel)return;
  // Check if already in this panel
  for(const cl of(panel.clusters||[])){
    if((cl.items||[]).find(x=>x.id===bookmarkId)){flash("Already in "+panel.name);return}
  }
  const cluster=(panel.clusters||[]).find(c=>c.id===clId);
  if(!cluster){flash("Zone not found");return}
  cluster.items=cluster.items||[];
  cluster.items.push({id:bookmarkId,color:null});
  save();render();flash("Pinned to "+panel.name);
}
function spPinToPanel(bookmarkId){
  const sp=BM.sectionPanels||[];
  if(!sp.length){flash("Create a Section Panel first");return}
  if(sp.length===1){
    const panel=sp[0];
    if(!panel.clusters||!panel.clusters.length){
      panel.clusters=[{id:"cl_"+Date.now(),label:"",color:"",items:[]}];
    }
    spPinToCluster(panel.id,panel.clusters[0].id,bookmarkId);return;
  }
  let h2=`<h3>Pin to Section Panel</h3>`;
  sp.forEach(panel=>{
    const allItems=(panel.clusters||[]).flatMap(c=>c.items||[]);
    const already=allItems.find(x=>x.id===bookmarkId);
    const pm=normalizeBookmarkPanelMode(panel.mode);
    const modeIcon=pm==="favicon"?'&#9726;':pm==="link"?S.link:'&#128138;';
    h2+=`<div class="cd-row${already?' cd-in':''}" data-sppin="${panel.id}" style="padding:6px 8px;cursor:pointer"><span style="margin-right:4px">${modeIcon}</span><span class="cd-name">${esc(panel.name)}</span>${already?'<span style="font-size:8px;color:var(--dm)">pinned</span>':''}</div>`;
  });
  h2+=`<div class="brow"><button class="bg-btn" id="sppX">Cancel</button></div>`;
  showModal(h2,mc=>{
    mc.querySelector("#sppX").addEventListener("click",closeModal);
    mc.querySelectorAll("[data-sppin]").forEach(el=>{el.addEventListener("click",()=>{
      const panel=sp.find(x=>x.id===el.dataset.sppin);if(!panel)return;
      if(!panel.clusters||!panel.clusters.length){
        panel.clusters=[{id:"cl_"+Date.now(),label:"",color:"",items:[]}];
      }
      spPinToCluster(panel.id,panel.clusters[0].id,bookmarkId);
      closeModal();
    })});
  });
}


// ═══════ ACTIONS ═══════
function addFolder(){const s2=st(),d2=dt();let p=findFolder(d2.folders,s2.sel);if(!p){s2.sel=rId();p=findFolder(d2.folders,s2.sel)}if(!p){flash("Root folder missing");return}if(getDepth(p,d2.folders)>=MAX_D-1){flash("Max depth");return}pushUndo();const id=generateId(d2);p.children=p.children||[];p.children.push({id,name:"New Folder",children:[],prompts:[],color:""});s2.exp[s2.sel]=1;save();render();rnMd(id,"New Folder")}
function addTopFolder(){const s2=st(),d2=dt(),root=findFolder(d2.folders,rId());if(!root){flash("Root folder missing");return}pushUndo();const id=generateId(d2);root.children=root.children||[];root.children.push({id,name:"New Folder",children:[],prompts:[],color:""});s2.sel=rId();s2.exp[rId()]=1;save();render();rnMd(id,"New Folder")}
function addItem(){
  if(isPh()){addPhotoByUrlMd();return}
  const s2=st();s2.eId="new";s2.eTi="";s2.eCo="";s2.eTg="";s2.eUrl="";s2.ePlat=isI()?"midjourney":"";s2._nextId="";s2._nextTitle="";s2._params=null;s2._eGoal="";s2._eInjectIntent="user";s2._eVersionNote="";if(isI())s2._capSel=[];if(isK()){s2._skFiles={};s2._skView="SKILL.md";s2._skSummary=""}s2.view="edit";render()}
function openItem(p){const s2=st();if(isP())recordVaultRecent({kind:"prompt",action:"open",id:p.id,folderId:s2.sel,title:p.title});if(isS())recordVaultRecent({kind:"clip",action:"open",id:p.id,folderId:s2.sel,title:p.title});s2.eId=p.id;s2.eTi=p.title;s2.eCo=p.content||"";s2.eTg=(p.tags||[]).join(", ");s2.eUrl=p.url||"";s2.ePlat=p.platform||"";s2._nextId=p.nextId||"";const nxt=s2._nextId?allItems(P.folders).find(x=>x.id===s2._nextId):null;s2._nextTitle=nxt?nxt.title:"";s2._params=isI()?((!p.platform||p.platform==="midjourney")&&p.params?deepClone(p.params):null):(p.params?deepClone(p.params):null);s2._eGoal=p.goal||"";s2._eInjectIntent=p.injectIntent||"user";s2._eVersionNote="";s2.view="edit";if(isI())s2._capSel=p._capSel?[...p._capSel]:[];if(isK()){s2._skFiles=p.files?deepClone(p.files):{};s2._skSummary=p.description||parseSkillYaml(p.content).description||""}render()}
function saveItem(silent,skipSimilarCheck){
  const s2=st(),d2=dt();
  if(!s2.eTi.trim()&&!s2.eCo.trim()&&!s2.eUrl.trim()){if(!silent)flash("Add a title, content, or URL before saving");return}
  if(!skipSimilarCheck&&isP()&&(s2.eCo||"").trim().length>20){
    const similar=findSimilarPrompts((s2.eTi+" "+(s2.eCo||"")).trim(),P,s2.eId,0.85);
    if(similar.length){const list=similar.map(s=>`<div class="fpi" data-id="${s.id}" data-fid="${s.folderId||''}" style="padding:4px 0;cursor:pointer;border-bottom:1px solid var(--bl)">${esc(s.title)} · ${Math.round((s.similarity||0)*100)}%</div>`).join("");showModal(`<h3>Similar prompt found</h3><p>You may already have something similar. Merge to combine tags and keep one version.</p><div style="max-height:120px;overflow-y:auto">${list}</div><div class="brow" style="margin-top:8px"><button class="bg-btn" id="simX">Cancel</button><button class="bs" id="simMerge" disabled title="Select one above">Merge with selected</button><button class="bp" id="simY">Save Anyway</button></div>`,mc=>{let sel=null;mc.querySelector("#simX").addEventListener("click",closeModal);mc.querySelector("#simY").addEventListener("click",()=>{closeModal();saveItem(silent,true)});mc.querySelectorAll(".fpi").forEach(el=>{el.addEventListener("click",()=>{mc.querySelectorAll(".fpi").forEach(x=>x.classList.remove("sel"));el.classList.add("sel");sel={id:el.dataset.id,fid:el.dataset.fid};mc.querySelector("#simMerge").disabled=false})});mc.querySelector("#simMerge").addEventListener("click",()=>{if(!sel)return;const it=similar.find(s=>s.id===sel.id);if(!it)return;pushUndo();const tgt=findFolder(dt().folders,sel.fid);if(tgt){const tp=tgt.prompts.find(x=>x.id===sel.id);if(tp){tp.versions=tp.versions||[];tp.versions.push({title:tp.title,content:tp.content,tags:[...(tp.tags||[])],saved:Date.now(),note:"Before merge"});if(tp.versions.length>20)tp.versions=tp.versions.slice(-20);const allTags=[...new Set([...(tp.tags||[]),...tg])];tp.tags=allTags;tp.content=s2.eCo||tp.content;tp.title=s2.eTi.trim()||tp.title;tp.modified=Date.now();save();closeModal();s2.sel=sel.fid;s2.eId=null;s2.view="list";flash("Merged");render()}}})});return}}
  if(!silent)pushUndo();
  let f=findFolder(d2.folders,s2.sel);
  if(!f){
    // Auto-recover: selection drifted or is stale, fall back to section root
    s2.sel=rId();
    f=findFolder(d2.folders,s2.sel);
    if(!f){if(!silent)flash("Could not find a destination folder — save aborted");return}
    if(!silent)flash("Saved to "+(f.name||"root"));
  }
  f.prompts=f.prompts||[];
  const tg=s2.eTg.split(",").map(x=>x.trim()).filter(Boolean);
  const lastMod={deviceId:meta?.deviceId||"",deviceName:meta?.deviceName||"",timestamp:Date.now()};
  if(s2.eId==="new"){const item=buildItem(d2,s2.eTi.trim(),s2.eCo,tg);
    item._lastModifiedBy=lastMod;
    if(isP()){item.platform=s2.ePlat;item.nextId=s2._nextId||"";if(s2._params)item.params=deepClone(s2._params);item.goal=(s2._eGoal||"").trim();item.injectIntent=s2._eInjectIntent||"user"}
    if(isI()){item.platform=s2.ePlat||"midjourney";if(s2.ePlat==="midjourney"&&s2._params)item.params=deepClone(s2._params);if(s2._capSel)item._capSel=[...s2._capSel]}if(isL())item.url=s2.eUrl;
    if(isK()){const ym=parseSkillYaml(s2.eCo);if(ym.name&&!s2.eTi.trim())item.title=ym.name;item.description=(s2._skSummary||ym.description||"").trim();item.files=s2._skFiles||{}}
    f.prompts.push(item);s2.eId=item.id}
  else{const p=f.prompts.find(x=>x.id===s2.eId);if(p){if(!silent&&(p.content!==s2.eCo||p.title!==s2.eTi.trim())){p.versions=p.versions||[];p.versions.push({title:p.title,content:p.content,tags:[...(p.tags||[])],saved:Date.now(),note:(s2._eVersionNote||"").trim()});if(p.versions.length>20)p.versions=p.versions.slice(-20)}
    p.title=s2.eTi.trim()||"Untitled";p.content=s2.eCo;p.tags=tg;p.modified=Date.now();p._lastModifiedBy=lastMod;
    if(isP()){p.platform=s2.ePlat;p.nextId=s2._nextId||"";p.params=s2._params?deepClone(s2._params):null;p.goal=(s2._eGoal||"").trim();p.injectIntent=s2._eInjectIntent||"user"}
    if(isI()){p.platform=s2.ePlat||"midjourney";p.params=s2.ePlat==="midjourney"&&s2._params?deepClone(s2._params):null;if(s2._capSel)p._capSel=[...s2._capSel]}if(isL())p.url=s2.eUrl;
    if(isK()){const ym=parseSkillYaml(s2.eCo);p.description=(s2._skSummary||ym.description||"").trim();if(s2._skFiles)p.files=s2._skFiles}}}
  save();if(!silent){
    if(isB()&&s2.eUrl){const f=findFolder(dt().folders,s2.sel);const p=f?.prompts?.find(x=>x.id===s2.eId);if(p?.url){try{chrome.runtime.sendMessage({type:"BM_SYNC_PUSH",item:p})}catch{}}}
    // Visual confirmation on the save button before navigating away
    const btn=$("edOK");
    if(btn){
      btn.textContent="OK Saved";btn.classList.add("bp-saved");btn.disabled=true;
      flash("OK Saved");
      setTimeout(()=>{s2.view="list";s2.eId=null;render()},400);
    } else {
      s2.view="list";s2.eId=null;flash("OK Saved");render();
    }
  }}function togFav(fid,pid){const f=findFolder(dt().folders,fid);if(f){const p=f.prompts.find(x=>x.id===pid);if(p){pushUndo();p.favorited=!p.favorited;save();flash(p.favorited?"\u2605 Favorited":"\u2606 Unfavorited");render()}}}
function dupItem(fid,pid){const d2=dt(),f=findFolder(d2.folders,fid);if(f){const p=f.prompts.find(x=>x.id===pid);if(p){pushUndo();const n=deepClone(p);n.id=generateId(d2);n.title+=" (copy)";n.created=n.modified=Date.now();n.usageCount=0;n.versions=[];f.prompts.push(n);save();flash("Duplicated");render()}}}
function doInjectWithChecks(text,p,act,fid){
  const runInject=()=>{
    inject(text,p.id,fid||"",p.platform||"");
    if(p.id&&typeof showInjectFeedbackBar==="function")setTimeout(()=>showInjectFeedbackBar(p.id),600);
  };
  // Warn only when the active tab IS an LLM but a different one than the prompt's tag.
  // Every other case (no tab, wrong tab, nothing open) is handled by background routing.
  if(typeof getPlatformFromUrl==="function"&&p.platform){
    chrome.runtime.sendMessage({type:"GET_ACTIVE_TAB"},tab=>{
      const curPlat=getPlatformFromUrl(tab?.url);
      if(curPlat&&!platformMatches(p.platform,curPlat)){
        const platName=getPlatName?.(p.platform)||p.platform;
        const curName=getPlatName?.(curPlat)||curPlat;
        showModal(`<h3>Platform mismatch</h3><p>This prompt is tagged for <strong>${esc(platName)}</strong> but you're on <strong>${esc(curName)}</strong>.</p><div class="brow"><button class="bg-btn" id="pmX">Cancel</button><button class="bs" id="pmHere">Inject here</button><button class="bp" id="pmGo">Take it to ${esc(platName.split("/")[0].trim())}</button></div>`,mc=>{
          mc.querySelector("#pmX").addEventListener("click",closeModal);
          mc.querySelector("#pmHere").addEventListener("click",()=>{closeModal();inject(text,p.id,fid||"","");if(p.id&&typeof showInjectFeedbackBar==="function")setTimeout(()=>showInjectFeedbackBar(p.id),600)});
          mc.querySelector("#pmGo").addEventListener("click",()=>{
            closeModal();
            try{chrome.runtime.sendMessage({type:"INJECT_TO",platformId:p.platform,text,promptId:p.id||"",folderId:fid||""},r=>{
              flash(r?.success?"OK Injected!":"Copied — Ctrl+V to paste");
            })}catch{flash("Inject failed")}
            navigator.clipboard.writeText(text).catch(()=>{});
          });
        });
        return;
      }
      runInject();
    });
  }else runInject();
}
function handleUse(fid,p,act){
  if(isP()&&(act==="inject"||act==="inject_system"||act==="copy"))recordVaultRecent({kind:"prompt",action:act==="copy"?"cp":"inj",id:p.id,folderId:fid,title:p.title});
  if(isS()&&(act==="inject"||act==="copy"))recordVaultRecent({kind:"clip",action:act==="copy"?"cp":"inj",id:p.id,folderId:fid,title:p.title});
  const f=findFolder(dt().folders,fid);if(f){const pr=f.prompts.find(x=>x.id===p.id);if(pr){pr.usageCount=(pr.usageCount||0)+1;pr.usageHistory=pr.usageHistory||[];pr.usageHistory.push(Date.now());if(pr.usageHistory.length>30)pr.usageHistory=pr.usageHistory.slice(-30);save()}}
  let text=p.content||(isL()?p.url:"")||"";
  text=resolveFragments(text);
  if(text===null){flash("Circular ref detected — fix {{ref:...}} chain");return}
  // Append Midjourney influences + suffix
  if(p.platform==="midjourney"&&p.params){const inf=buildInfluencesString(p.params);text+=inf?" "+inf:"";text+=buildMjSuffix(p.params)}
  if(isP()&&extractVars(text).length>0){varMd(p,act,fid);return}
  if(act==="launch")return;
  if(act==="inject")doInjectWithChecks(text,p,act,fid);
  else if(act==="inject_system"){const sysText="[SYSTEM CONTEXT "+S.emdash+" the following is a skill definition that sets behavior for this conversation]\n\n"+text+"\n\n[END SYSTEM CONTEXT]\n\n";doInjectWithChecks(sysText,p,"inject_system",fid)}
  else navigator.clipboard.writeText(text).then(()=>flash("Copied")).catch(()=>flash("Failed"));
  // Chamber the next step (prompts only). Chain annotations win over the legacy nextId
  // pointer; _chainRun keeps a run inside the chain the user actually started when a prompt
  // belongs to several. Position is mirrored into cfg so closing the panel does not lose it.
  if(isP()&&(act==="inject"||act==="inject_system")){
    let next=null;
    try{if(typeof pvChainNextStep==="function")next=pvChainNextStep(P.folders,p,pSt._chainRun||"")}catch(e){next=null}
    if(next){
      pSt._chambered={id:next.item.id,fromTitle:p.title,chain:next.prefix,index:next.index,total:next.total};
      pSt._chainRun=next.prefix;
      try{cfg.chainRun={prefix:next.prefix,nextId:String(next.item.id),index:next.index,total:next.total,fromTitle:p.title,at:Date.now()};save()}catch(e){/* resume is a convenience */}
      render();
    }else if(p.nextId){
      pSt._chambered={id:p.nextId,fromTitle:p.title};render();
    }else if(pSt._chainRun){
      // Chain finished — clear the saved position so it cannot resurrect later.
      pSt._chainRun="";try{if(cfg.chainRun){delete cfg.chainRun;save()}}catch(e){}
      render();
    }
  }
}
function handleDrop(e,tid,pos){
  pos=pos||"inside";
  const pid=e.dataTransfer.getData("pid"),ps=e.dataTransfer.getData("psrc"),fid=e.dataTransfer.getData("fid"),d2=dt();

  // Photos can travel as a selected "mob". Removing first and appending once
  // preserves the gallery order and prevents duplicates when sources differ.
  const photoMobRaw=isPh()?e.dataTransfer.getData("pv-photo-mob"):"";
  if(photoMobRaw&&pos==="inside"){
    let ids=[];try{ids=JSON.parse(photoMobRaw)}catch{/* malformed external drag */}
    if(Array.isArray(ids)&&ids.length){pushUndo();const moved=pvMovePhotoMob(ids,tid);if(moved){phSt.bulkSel=[];phSt.bulkMode=false;phSt.sort="custom";save();flash(`Moved ${moved} selected photos`);render()}return}
  }

  // ── Card dropped on folder (move to folder) — unchanged ──
  if(pid&&ps&&ps!==tid&&pos==="inside"){pushUndo();const src=findFolder(d2.folders,ps),tgt=findFolder(d2.folders,tid);if(src&&tgt){const i=src.prompts.findIndex(p=>p.id===pid);if(i>=0){const[p]=src.prompts.splice(i,1);tgt.prompts=tgt.prompts||[];tgt.prompts.push(p);save();flash("Moved");render()}}}

  // ── Card reorder within same folder (above/below on another card) ──
  else if(pid&&ps&&pos!=="inside"){
    // tid here is actually a card ID target — need special handling via handleCardDrop
    // This path is used when dropping on folder tree above/below — treat as move to parent
    const tgtParent=findParent(d2.folders,tid);
    if(tgtParent){pushUndo();const src=findFolder(d2.folders,ps),tgt=tgtParent;if(src&&tgt&&src.id!==tgt.id){const i=src.prompts.findIndex(p=>p.id===pid);if(i>=0){const[p]=src.prompts.splice(i,1);tgt.prompts=tgt.prompts||[];tgt.prompts.push(p);save();flash("Moved");render()}}}
  }

  // ── Folder dropped inside another folder ──
  else if(fid&&fid!==tid&&fid!==rId()&&pos==="inside"){
    const tgt=findFolder(d2.folders,tid);
    if(tgt&&getDepth(tgt,d2.folders)<MAX_D-1){pushUndo();const par=findParent(d2.folders,fid);if(par&&par.id!==tid){const i=par.children.findIndex(c=>c.id===fid);if(i>=0){const[m]=par.children.splice(i,1);tgt.children=tgt.children||[];tgt.children.push(m);st().exp[tid]=1;save();flash("Moved");render()}}}}

  // ── Folder reorder as sibling (above/below) ──
  else if(fid&&fid!==tid&&fid!==rId()&&(pos==="above"||pos==="below")){
    const tgtParent=findParent(d2.folders,tid);
    const srcParent=findParent(d2.folders,fid);
    if(tgtParent&&srcParent){
      pushUndo();
      // Remove from source
      const srcIdx=srcParent.children.findIndex(c=>c.id===fid);
      if(srcIdx>=0){
        const[moved]=srcParent.children.splice(srcIdx,1);
        // Find target index in parent
        let tgtIdx=tgtParent.children.findIndex(c=>c.id===tid);
        if(tgtIdx<0){tgtParent.children.push(moved)}
        else{
          if(pos==="below")tgtIdx++;
          // Adjust for same-parent removal shift
          if(srcParent.id===tgtParent.id&&srcIdx<tgtIdx)tgtIdx--;
          tgtParent.children.splice(tgtIdx,0,moved);
        }
        save();render();
      }
    }
  }
}


/** Clip/note → draft prompt: opens the prompt editor pre-filled; user titles and saves. */
function promoteToPrompt(fid,p){
  aTab="prompts";
  pSt.view="edit";pSt.eId="new";
  pSt.eTi=p.title||"";pSt.eCo=p.content||"";pSt.eTg=(p.tags||[]).join(", ");
  pSt.eUrl="";pSt.ePlat=p.platform||"";pSt._nextId="";pSt._nextTitle="";pSt._params=null;
  pSt._eGoal="";pSt._eInjectIntent="user";pSt._eVersionNote="";
  render();flash("Draft prompt \u2014 edit and save");
}

/** Right-click "Edit as prompt": open the prompt editor pre-filled from a page text selection. */
function promptFromSelection(text,url,pageTitle){
  const t=(text||"").trim();
  if(!t){flash("Nothing selected");return}
  aTab="prompts";
  pSt.view="edit";pSt.eId="new";
  pSt.eTi=(t.split("\n")[0]||"").slice(0,80);pSt.eCo=t;pSt.eTg="";
  pSt.eUrl="";pSt.ePlat="";pSt._nextId="";pSt._nextTitle="";pSt._params=null;
  pSt._eGoal="";pSt._eInjectIntent="user";pSt._eVersionNote="";
  if(typeof render==="function")render();
  flash("Draft prompt \u2014 edit and save");
}

/** Photos: "New Photo" = paste an image URL; background fetches bytes + thumbnail. */
function addPhotoByUrlMd(){
  showModal(`<h3>Add photo by URL</h3><input type="text" id="phUrl" placeholder="https://\u2026/image.jpg (or paste any image address)" style="width:100%"><div class="brow"><button class="bg-btn" id="phX">Cancel</button><button class="bp" id="phY">Fetch &amp; save</button></div>`,mc=>{
    const inp=mc.querySelector("#phUrl");inp.focus();
    const go=()=>{
      const url=(inp.value||"").trim();
      if(!url){flash("Paste an image URL");return}
      closeModal();flash("Fetching\u2026");
      chrome.runtime.sendMessage({type:"ADD_PHOTO_BY_URL",url,folderId:phSt.sel||"phroot"},r=>{
        if(r?.success){loadData().then(()=>{flash("OK Photo saved");render()})}
        else flash("Fetch failed \u2014 check the URL");
      });
    };
    mc.querySelector("#phX").addEventListener("click",closeModal);
    mc.querySelector("#phY").addEventListener("click",go);
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")go()});
  });
}

// ═══════ MODALS ═══════
// Standard modal builder: title, bodyHtml, buttons [{id, label, cls, primary, action}], onWire(container)
function buildModal(title,bodyHtml,buttons,onWire){
  const btnClass=b=>b.primary?'bp':b.cls==='dng'?'bdn':'bg-btn';
  const brow=buttons.map(b=>`<button class="${btnClass(b)} ${b.cls&&b.cls!=='dng'?b.cls:''}" id="${b.id}">${esc(b.label)}</button>`).join('');
  showModal(`<h3>${esc(title)}</h3>${bodyHtml}<div class="brow">${brow}</div>`,c=>{
    buttons.forEach(b=>{const el=c.querySelector("#"+b.id);if(el&&b.action)el.addEventListener("click",b.action)});
    if(onWire)onWire(c);
  });
}
function rnMd(fid,name){const go=()=>{pushUndo();const f=findFolder(dt().folders,fid);if(f){f.name=$("rnI").value.trim()||f.name;save()}closeModal();render()};
  buildModal("Rename",`<input type="text" id="rnI" value="${esc(name)}">`,[{id:"rnX",label:"Cancel",action:closeModal},{id:"rnOK",label:"Save",primary:true,action:go}],c=>{
  const i=c.querySelector("#rnI");i.focus();i.select();
  i.addEventListener("keydown",e=>{if(e.key==="Enter")go();if(e.key==="Escape")closeModal()})})}
function delMd(type,id,name){
  let msg;
  if(type==="folder"){
    const f=findFolder(dt().folders,id);
    const counts=f?countItems(f):{prompts:0,folders:0};
    const label=isP()?"prompt":isK()?"skill":isS()?"clip":isN()?"note":isG()?"custom GPT":"bookmark";
    const parts=[];
    if(counts.prompts)parts.push(`<strong>${counts.prompts}</strong> ${label}${counts.prompts!==1?'s':''}`);
    if(counts.folders)parts.push(`<strong>${counts.folders}</strong> subfolder${counts.folders!==1?'s':''}`);
    const warn=parts.length?`<p style="color:var(--dn);font-size:11px">This folder contains ${parts.join(' and ')}. Everything inside moves to Trash.</p>`:'';
    msg=`<h3>Delete Folder?</h3><p>"${esc(name)}" ${S.arrow} Trash (${TR_D}d).</p>${warn}<div class="brow"><button class="bg-btn" id="dlX">Cancel</button><button class="bdn" id="dlY">Delete</button></div>`;
  }else{
    msg=`<h3>Delete?</h3><p>"${esc(name)}" ${S.arrow} Trash (${TR_D}d).</p><div class="brow"><button class="bg-btn" id="dlX">Cancel</button><button class="bdn" id="dlY">Delete</button></div>`;
  }
  showModal(msg,c=>{
  c.querySelector("#dlX").addEventListener("click",closeModal);c.querySelector("#dlY").addEventListener("click",()=>{
    pushUndo();const d2=dt(),s2=st();
    if(type==="folder"&&id!==rId()){const p=findParent(d2.folders,id),f=findFolder(d2.folders,id);if(p&&f){toTrash("folder",id,f.name,f);p.children=p.children.filter(x=>x.id!==id);if(s2.sel===id)s2.sel=p.id;save()}}
    else if(type==="prompt"){const f=findFolder(d2.folders,s2.sel);if(f){const p=f.prompts.find(x=>x.id===id);if(p){toTrash("prompt",id,p.title,p);f.prompts=f.prompts.filter(x=>x.id!==id);save()}}if(s2.eId===id){s2.view="list";s2.eId=null}}
    closeModal();render()})})}
function mvMd(pid,fid){const flds=allFolders(dt().folders);showModal(`<h3>Move to</h3><div class="fp">${flds.filter(f=>f.id!==fid).map(f=>`<div class="fpi" data-id="${f.id}" style="padding-left:${6+f.depth*10}px">${V.f(0,f.color||undefined)} ${esc(f.name)}</div>`).join("")}</div>`,c=>{
  c.querySelectorAll(".fpi").forEach(el=>{el.addEventListener("click",()=>{pushUndo();const src=findFolder(dt().folders,fid),tgt=findFolder(dt().folders,el.dataset.id);if(src&&tgt){const i=src.prompts.findIndex(x=>x.id===pid);if(i>=0){const[p]=src.prompts.splice(i,1);tgt.prompts=tgt.prompts||[];tgt.prompts.push(p);save();flash("Moved")}}closeModal();render()})})})}
/** Copy an asset into one or more OTHER folders (independent copies). Lets one
 *  asset surface across multiple workspaces, since workspaces cull by folder.
 *  Photos also get their IndexedDB blob duplicated under the new id. */
function copyMd(pid,fid){
  const d2=dt();const src=findFolder(d2.folders,fid);const p=src?.prompts?.find(x=>x.id===pid);if(!p)return;
  const flds=allFolders(d2.folders).filter(f=>f.id!==fid);
  const rows=flds.map(f=>`<label class="fpi" data-id="${f.id}" style="display:flex;align-items:center;gap:7px;padding-left:${6+f.depth*10}px;cursor:pointer"><input type="checkbox" class="cp-cb" value="${f.id}" style="accent-color:var(--tab-ac,var(--ac));flex-shrink:0">${V.f(0,f.color||undefined)} <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(f.name)}</span></label>`).join("");
  showModal(`<h3>Copy to folders</h3><p style="font-size:10px;color:var(--dm)">Places an independent copy of "${esc(p.title)}" in each folder you check — handy for surfacing one asset across multiple workspaces.</p><div class="fp" style="max-height:230px;overflow-y:auto">${rows||'<div class="empty">No other folders yet</div>'}</div><div class="brow"><button class="bg-btn" id="cpX">Cancel</button><button class="bp" id="cpY">Copy</button></div>`,c=>{
    c.querySelector("#cpX").addEventListener("click",closeModal);
    c.querySelector("#cpY").addEventListener("click",()=>{
      const ids=[...c.querySelectorAll(".cp-cb:checked")].map(x=>x.value);
      if(!ids.length){flash("Pick at least one folder");return}
      pushUndo();let n=0;
      for(const tid of ids){
        const tgt=findFolder(d2.folders,tid);if(!tgt)continue;
        const copy=deepClone(p);copy.id=generateId(d2);copy.modified=Date.now();copy.usageCount=0;copy.versions=[];
        // A copy is not the same step: cloning chain membership would put two prompts on one
        // stage. Strip it and let the user file the copy deliberately.
        if(typeof pvChainStripForCopy==="function")pvChainStripForCopy(copy);
        tgt.prompts=tgt.prompts||[];tgt.prompts.push(copy);
        if(isPh()&&typeof pvImgGet==="function"&&typeof pvImgPut==="function"){
          pvImgGet(p.id).then(b=>{if(b)pvImgPut(copy.id,b)}).catch(()=>{/* thumb-only copy still usable */});
        }
        n++;
      }
      save();closeModal();flash(`OK Copied to ${n} folder${n!==1?'s':''}`);render();
    });
  });
}
function hiMd(p,fid){const v=p.versions||[];if(!v.length){showModal(`<h3>History</h3><p>${esc(p.title)}</p><div class="empty">No versions</div><div class="brow"><button class="bg-btn" id="hX">Close</button></div>`,c=>{c.querySelector("#hX").addEventListener("click",closeModal)});return}
  showModal(`<h3>History</h3><p>${esc(p.title)} · ${v.length} version${v.length!==1?'s':''}</p>
  <div id="hiDiffC" style="display:none;margin-bottom:8px"></div>
  ${[...v].reverse().map((x,i)=>{const ri=v.length-1-i;const note=x.note?` <span style="font-size:9px;color:var(--dm)">— ${esc(x.note)}</span>`:'';return`<div class="vi"><div class="vh"><span class="vt">${esc(x.title)}</span><span class="vd">${formatFull(x.saved)}</span>${note}</div><div class="vpr">${esc(x.content)}</div><div style="display:flex;gap:3px;margin-top:4px"><button class="vrb" data-i="${ri}">Restore</button><button class="vrb vdb" data-diff="${ri}">Diff vs current</button>${ri>0?`<button class="vrb vdb" data-diff2="${ri}">Diff vs prev</button>`:''}</div></div>`}).join("")}`,c=>{
    c.querySelectorAll(".vrb[data-i]").forEach(btn=>{btn.addEventListener("click",()=>{pushUndo();const f=findFolder(dt().folders,fid);if(f){const pr=f.prompts.find(x=>x.id===p.id);if(pr&&pr.versions[+btn.dataset.i]){pr.versions.push({title:pr.title,content:pr.content,tags:[...(pr.tags||[])],saved:Date.now()});const vv=pr.versions[+btn.dataset.i];pr.title=vv.title;pr.content=vv.content;pr.tags=vv.tags||[];pr.modified=Date.now();save();flash("Restored")}}closeModal();render()})});
    c.querySelectorAll("[data-diff]").forEach(btn=>{btn.addEventListener("click",()=>{const idx=+btn.dataset.diff;const old=v[idx]?.content||"";const cur=p.content||"";const dc=c.querySelector("#hiDiffC");dc.style.display="block";dc.innerHTML=`<div class="diff-hdr">v${idx+1} ${S.arrow} current</div><div class="diff-body">${renderDiff(old,cur)}</div>`})});
    c.querySelectorAll("[data-diff2]").forEach(btn=>{btn.addEventListener("click",()=>{const idx=+btn.dataset.diff2;const old=v[idx-1]?.content||"";const cur=v[idx]?.content||"";const dc=c.querySelector("#hiDiffC");dc.style.display="block";dc.innerHTML=`<div class="diff-hdr">v${idx} ${S.arrow} v${idx+1}</div><div class="diff-body">${renderDiff(old,cur)}</div>`})})
  })}
// ── Dropdown variable helpers ──
function varFieldHtml(v,idx,cls){const d=parseVarDef(v);
  if(d.type==="dropdown"){return`<div class="vf${cls?' '+cls:''}"><div class="vfl">{{${esc(d.label)}}}</div><select class="vfs" data-v="${esc(v)}" data-vi="${idx}">${d.options.map(o=>`<option value="${esc(o)}">${esc(o)}</option>`).join("")}<option value="_pv_other_">Other...</option></select><input class="vfi vfi-other" data-v="${esc(v)}" data-vi="${idx}" placeholder="Custom value..." style="display:none"></div>`}
  if(d.type==="multi"){return`<div class="vf${cls?' '+cls:''}"><div class="vfl">{{${esc(d.label)}}} <span class="vfl-hint">pick one or more</span></div><div class="vf-multi" data-vi="${idx}">${d.options.map(o=>`<label class="vf-cb"><input type="checkbox" value="${esc(o)}" data-vi="${idx}"><span>${esc(o)}</span></label>`).join("")}<label class="vf-cb vf-cb-other"><input type="checkbox" value="_pv_other_" data-vi="${idx}" data-is-other="1"><span>Other...</span></label></div><input class="vfi vfi-other" data-v="${esc(v)}" data-vi="${idx}" placeholder="Custom value..." style="display:none"></div>`}
  if(d.type==="long"){return`<div class="vf${cls?' '+cls:''}"><div class="vfl">{{${esc(d.label)}}} <span class="vfl-hint">paragraph</span></div><textarea class="vfi vfi-long" data-v="${esc(v)}" data-vi="${idx}" placeholder="${esc(d.label)}..." rows="4"></textarea></div>`}
  return`<div class="vf${cls?' '+cls:''}"><div class="vfl">{{${esc(v)}}}</div><input class="vfi" data-v="${esc(v)}" data-vi="${idx}" placeholder="${esc(v)}"></div>`}
function wireVarOther(c){
  c.querySelectorAll(".vfs").forEach(sel=>{sel.addEventListener("change",()=>{const o=c.querySelector(`.vfi-other[data-vi="${sel.dataset.vi}"]`);if(o){o.style.display=sel.value==="_pv_other_"?"block":"none";if(sel.value==="_pv_other_")o.focus()}})});
  c.querySelectorAll('.vf-cb input[data-is-other="1"]').forEach(cb=>{cb.addEventListener("change",()=>{const o=c.querySelector(`.vfi-other[data-vi="${cb.dataset.vi}"]`);if(o){o.style.display=cb.checked?"block":"none";if(cb.checked)o.focus()}})})
}
function collectVarVals(c,vars){const vals={};vars.forEach((v,i)=>{
  const sel=c.querySelector(`.vfs[data-vi="${i}"]`);
  const inp=c.querySelector(`.vfi[data-vi="${i}"]:not(.vfi-other):not(.vfi-long)`);
  const oth=c.querySelector(`.vfi-other[data-vi="${i}"]`);
  const long=c.querySelector(`.vfi-long[data-vi="${i}"]`);
  const multi=c.querySelector(`.vf-multi[data-vi="${i}"]`);
  if(multi){const checked=[...multi.querySelectorAll('input[type="checkbox"]:checked')].map(cb=>cb.value==="_pv_other_"?(oth?.value||""):cb.value).filter(Boolean);vals[v]=checked.join(", ")}
  else if(sel)vals[v]=sel.value==="_pv_other_"?(oth?.value||""):sel.value;
  else if(long)vals[v]=long.value;
  else if(inp)vals[v]=inp.value;
  else vals[v]=""});return vals}
function fillVarText(text,vars,vals){let t=text;vars.forEach(v=>{t=t.replaceAll(`{{${v}}}`,vals[v]||`{{${v}}}`)});return t}

function varMd(p,act,fid){const vars=extractVars(p.content);
  const fields=vars.map((v,i)=>varFieldHtml(v,i,"")).join("");
  const mainLabel=act==="inject"?"Inject":"Copy";
  const checklist=typeof getConstraintChecklist==="function"?getConstraintChecklist(p):[];
  const checklistHtml=checklist.length?`<p style="font-size:10px;color:var(--dm);margin:6px 0">Consider: ${checklist.map(x=>esc(x)).join(", ")}</p>`:"";
  showModal(`<h3>Variables</h3><p>${esc(p.title)}</p>${fields}${checklistHtml}<div class="brow"><button class="bg-btn" id="vrR">Raw</button><button class="bp" id="vrF">${mainLabel}</button></div>`,c=>{
  wireVarOther(c);
  (c.querySelector(".vfi:not(.vfi-other)")||c.querySelector(".vfs"))?.focus();
  const doInject=(text)=>{if(typeof doInjectWithChecks==="function")doInjectWithChecks(text,p,act,fid||st().sel);else inject(text,p.id,fid||st().sel,p.platform||"");closeModal()};
  c.querySelector("#vrR").addEventListener("click",()=>{let rt=resolveFragments(p.content);if(rt===null){flash("Circular ref — fix {{ref:...}} chain");return}if(p.platform==="midjourney"&&p.params){const inf=buildInfluencesString(p.params);rt+=inf?" "+inf:"";rt+=buildMjSuffix(p.params)}if(act==="inject"){if(typeof hasUnfilledVars==="function"&&hasUnfilledVars(rt,vars)){flash("Variables unfilled — use filled or fill above");return}doInject(rt)}else{navigator.clipboard.writeText(rt).then(()=>flash("Copied"));closeModal()}});
  c.querySelector("#vrF").addEventListener("click",()=>{let t=resolveFragments(p.content);if(t===null){flash("Circular ref — fix {{ref:...}} chain");return}const vals=collectVarVals(c,vars);t=fillVarText(t,vars,vals);if(typeof hasUnfilledVars==="function"&&hasUnfilledVars(t,vars)){flash("Fill all variables first");return}if(p.platform==="midjourney"&&p.params){const inf=buildInfluencesString(p.params);t+=inf?" "+inf:"";t+=buildMjSuffix(p.params)}if(act==="inject")doInject(t);else{navigator.clipboard.writeText(t).then(()=>flash("Copied"));closeModal()}});
  c.querySelectorAll(".vfi,.vfs").forEach(i=>{i.addEventListener("keydown",e=>{if(e.key==="Enter")c.querySelector("#vrF").click()})})})}
// ── Chrome Bookmark Import (Direct API) ──
function doDirectChromeImport(){
  flash("Reading Chrome bookmarks...");
  chrome.bookmarks.getTree(tree=>{
    if(chrome.runtime.lastError){flash("Error: "+chrome.runtime.lastError.message);return}
    if(!tree||!tree.length){flash("No bookmarks found");return}

    let importCount=0,folderCount=0,skipCount=0;
    pushUndo(); // save undo state

    function walkNode(node,parentFolder){
      // Chrome's top-level nodes are containers (Bookmarks Bar, Other, Mobile)
      const isRoot=!node.url&&(!node.parentId||node.parentId==="0");
      const isInternal=["Bookmarks bar","Bookmarks Bar","Other bookmarks","Other Bookmarks","Mobile bookmarks","Mobile Bookmarks"].includes(node.title);

      if(node.url){
        // It's a bookmark
        if(node.url.startsWith("javascript:")||node.url.startsWith("chrome://"))return;
        if(findDuplicateUrl(node.url,BM)){skipCount++;return}
        const item={
          id:generateId(BM),
          title:(node.title||"").trim()||domain(node.url)||"Untitled",
          content:"",url:node.url,
          tags:[],
          chromeId:node.id,
          created:node.dateAdded||Date.now(),
          modified:node.dateAdded||Date.now(),
          usageCount:0,favorited:false,versions:[]
        };
        parentFolder.prompts=parentFolder.prompts||[];
        parentFolder.prompts.push(item);
        importCount++;
      }else if(node.children){
        // It's a folder
        let target;
        if(isRoot||isInternal){
          target=parentFolder; // merge into parent
        }else{
          const id=generateId(BM);
          target={id,name:(node.title||"").trim()||"Imported",children:[],prompts:[],color:""};
          parentFolder.children=parentFolder.children||[];
          parentFolder.children.push(target);
          folderCount++;
        }
        for(const child of node.children)walkNode(child,target);
      }
    }

    for(const root of tree){
      if(root.children)for(const child of root.children)walkNode(child,BM.folders);
    }

    save();
    render();
    showModal(`<h3>Import Complete</h3><p>Imported <strong>${importCount}</strong> bookmark${importCount!==1?'s':''} across <strong>${folderCount}</strong> folder${folderCount!==1?'s':''}.</p>${skipCount?`<p style="font-size:10px;color:var(--dm)">${skipCount} duplicate${skipCount!==1?'s':''} skipped.</p>`:''}
      <div class="brow"><button class="bp" id="idOK">Done</button></div>`,mc=>{
      mc.querySelector("#idOK").addEventListener("click",()=>{closeModal();render()})
    });
  });
}

// ── Inline Collection Dropdown on Card ──
function showCollDrop(cardEl,itemId){
  // Close any other open dropdowns
  document.querySelectorAll(".coll-drop.open").forEach(d=>{d.style.display="none";d.classList.remove("open");d.innerHTML=""});
  const drop=cardEl.querySelector(".coll-drop");
  if(!drop)return;
  const cols=collData().collections||[];
  if(!cols.length){
    drop.innerHTML=`<div class="cd-empty">No collections yet — create one with the <strong>+</strong> pill above</div>`;
    drop.style.display="block";drop.classList.add("open");
    setTimeout(()=>document.addEventListener("click",function h3(e){if(!drop.contains(e.target)){drop.style.display="none";drop.classList.remove("open");drop.innerHTML="";document.removeEventListener("click",h3)}},{once:false}),10);
    return;
  }
  function buildDrop(){
    drop.innerHTML=cols.map(c=>{
      const isIn=(c.items||[]).includes(itemId);
      const bg=c.color?TAG_COLORS.find(tc=>tc.v===c.color):null;
      const dotBg=bg?bg.v:'var(--dm)';
      return`<div class="cd-row ${isIn?'cd-in':''}" data-cid="${c.id}"><span class="cd-chk">${isIn?S.check:''}</span><span class="cd-dot" style="background:${dotBg}"></span><span class="cd-name">${esc(c.name)}</span></div>`;
    }).join('');
    drop.style.display="block";drop.classList.add("open");
    drop.querySelectorAll(".cd-row").forEach(row=>{row.addEventListener("click",e=>{
      e.stopPropagation();const cid=row.dataset.cid;
      if(isInColl(cid,itemId)){removeFromColl(cid,itemId);flash("Removed")}
      else{addToColl(cid,itemId);flash("Added")}
      buildDrop(); // rebuild in place
      // Update the dots in the meta row
      const metaDots=cardEl.querySelector(".metar");
      if(metaDots){const existingDots=metaDots.querySelectorAll(".coll-dot");existingDots.forEach(d=>d.remove());
        const updCols=(collData().collections||[]).filter(c2=>(c2.items||[]).includes(itemId));
        updCols.forEach(c2=>{const bg2=c2.color?TAG_COLORS.find(tc=>tc.v===c2.color):null;const dot=document.createElement("span");dot.className="coll-dot";dot.title=c2.name;dot.style.background=bg2?.v||'var(--dm)';metaDots.insertBefore(dot,metaDots.firstChild)})}
    })});
  }
  buildDrop();
  setTimeout(()=>{const closer=e=>{if(!drop.contains(e.target)&&!e.target.closest('[data-a="pin"]')){drop.style.display="none";drop.classList.remove("open");drop.innerHTML="";document.removeEventListener("click",closer)}};document.addEventListener("click",closer)},10);
}

// ── Collection Modals ──
function collCreateMd(){
  const colColors=TAG_COLORS.filter(c=>c.v); // skip "None"
  showModal(`<h3>New Collection</h3><input type="text" id="collNm" placeholder="Collection name..."><div style="margin-top:8px"><div style="font-size:9px;color:var(--dm);margin-bottom:4px;text-transform:uppercase;letter-spacing:.8px;font-weight:600">Color</div><div style="display:flex;gap:4px;flex-wrap:wrap" id="collCols">${colColors.map(c=>`<div class="tag-cdot" style="background:${c.v}" data-cv="${c.v}"></div>`).join('')}</div></div><div class="brow"><button class="bg-btn" id="ccX">Cancel</button><button class="bp bp-b" id="ccOK">Create</button></div>`,mc=>{
    let selColor=colColors[0]?.v||"";mc.querySelector(`[data-cv="${selColor}"]`)?.classList.add("sel");
    mc.querySelectorAll(".tag-cdot").forEach(d=>{d.addEventListener("click",()=>{mc.querySelectorAll(".tag-cdot").forEach(x=>x.classList.remove("sel"));d.classList.add("sel");selColor=d.dataset.cv})});
    mc.querySelector("#collNm").focus();
    mc.querySelector("#ccX").addEventListener("click",closeModal);
    mc.querySelector("#ccOK").addEventListener("click",()=>{const nm=mc.querySelector("#collNm").value.trim();if(!nm){flash("Name required");return}
      const cd=collData();cd.collections=cd.collections||[];cd.collections.push({id:newCollId(),name:nm,color:selColor,items:[]});save();closeModal();flash("Collection created");render()});
    mc.querySelector("#collNm").addEventListener("keydown",e=>{if(e.key==="Enter")mc.querySelector("#ccOK").click()})
  });
}
function collRenameMd(col){
  const doSave=()=>{col.name=$("crNm").value.trim()||col.name;save();closeModal();render();flash("Renamed")};
  buildModal("Rename Collection",`<input type="text" id="crNm" value="${esc(col.name)}">`,[{id:"crX",label:"Cancel",action:closeModal},{id:"crOK",label:"Save",primary:true,action:doSave}],mc=>{
    const inp=mc.querySelector("#crNm");inp.focus();inp.select();
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")mc.querySelector("#crOK").click()})
  });
}
function collColorMd(col){
  const colColors=TAG_COLORS.filter(c=>c.v);
  const body=`<div style="display:flex;gap:5px;flex-wrap:wrap">${colColors.map(c=>`<div class="tag-cdot ${col.color===c.v?'sel':''}" style="background:${c.v}" data-cv="${c.v}"></div>`).join('')}</div>`;
  buildModal("Collection Color",body,[{id:"ccX",label:"Cancel",action:closeModal}],mc=>{
    mc.querySelectorAll(".tag-cdot").forEach(d=>{d.addEventListener("click",()=>{col.color=d.dataset.cv;save();closeModal();render();flash("Color updated")})})
  });
}
function collDeleteMd(col){
  const doDel=()=>{const cd=collData();cd.collections=(cd.collections||[]).filter(c=>c.id!==col.id);if(st().collFilter===col.id)st().collFilter="";save();closeModal();render();flash("Deleted")};
  buildModal("Delete Collection?",`<p>"${esc(col.name)}" will be deleted. Bookmarks inside are not affected.</p>`,[{id:"cdX",label:"Cancel",action:closeModal},{id:"cdY",label:"Delete",cls:"dng",action:doDel}]);
}
function collAssignMd(itemId){
  const cols=collData().collections||[];
  if(!cols.length){showModal(`<h3>No Collections</h3><p>Create a collection first using the + button in the pill bar.</p><div class="brow"><button class="bp" id="caX">OK</button></div>`,mc=>{mc.querySelector("#caX").addEventListener("click",closeModal)});return}
  showModal(`<h3>Add to Collection</h3>${cols.map(c=>{const inIt=isInColl(c.id,itemId);const bg=c.color?TAG_COLORS.find(tc=>tc.v===c.color):null;
    return`<div class="fpi" data-acid="${c.id}" style="padding:5px 9px;display:flex;align-items:center;gap:6px;border-radius:4px;cursor:pointer;font-size:11px;transition:all .1s${inIt?';background:var(--bkd);color:var(--bk)':''}"><span style="width:10px;height:10px;border-radius:50%;background:${bg?.v||'var(--dm)'};flex-shrink:0"></span><span style="flex:1">${esc(c.name)}</span><span style="font-size:9px;color:var(--dm)">${inIt?S.check+' In collection':''}</span></div>`}).join('')}<div class="brow" style="margin-top:10px"><button class="bg-btn" id="caX">Done</button></div>`,mc=>{
    mc.querySelector("#caX").addEventListener("click",()=>{closeModal();render()});
    mc.querySelectorAll("[data-acid]").forEach(el=>{el.addEventListener("click",()=>{
      const cid=el.dataset.acid;if(isInColl(cid,itemId)){removeFromColl(cid,itemId);flash("Removed")}else{addToColl(cid,itemId);flash("Added")}closeModal();collAssignMd(itemId)})})
  });
}
function collManageMd(col,filter=""){
  const allBk=allItems(collData().folders);
  const inCol=new Set(col.items||[]);
  const fl=filter.toLowerCase();
  const matched=fl?allBk.filter(p=>p.title.toLowerCase().includes(fl)||domain(p.url||"").toLowerCase().includes(fl)||(p.tags||[]).some(t=>t.toLowerCase().includes(fl))):allBk;
  // Sort: items in collection first, then rest
  const sorted=[...matched.filter(p=>inCol.has(p.id)),...matched.filter(p=>!inCol.has(p.id))];
  const bg=col.color?TAG_COLORS.find(tc=>tc.v===col.color):null;
  const colStyle=bg?`color:${bg.fg}`:'';

  showModal(`<h3 style="${colStyle}">${esc(col.name)}</h3><p>${inCol.size} bookmark${inCol.size!==1?'s':''} in collection · ${allBk.length} total</p>
    <input type="text" id="cmQ" placeholder="Filter bookmarks..." value="${esc(filter)}" style="margin-bottom:6px">
    <div style="max-height:260px;overflow-y:auto;margin-bottom:6px" id="cmList">${sorted.slice(0,60).map(p=>{
      const isIn=inCol.has(p.id);
      return`<div class="fpi cm-item ${isIn?'cm-in':''}" data-cmid="${p.id}" style="padding:4px 8px;display:flex;align-items:center;gap:6px;font-size:10px;cursor:pointer;border-radius:4px;transition:all .1s;${isIn?'background:var(--bkd);':''}"><span style="width:14px;font-size:12px;flex-shrink:0;text-align:center">${isIn?S.check:''}</span>${favicon(p.url,14)}<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.title)}</span><span style="font-size:8px;color:var(--dm);flex-shrink:0">${esc(domain(p.url||'').slice(0,18))}</span></div>`}).join('')}${sorted.length>60?`<div style="font-size:9px;color:var(--dm);padding:4px;text-align:center">Showing 60 of ${sorted.length} — use filter</div>`:''}</div>
    <div class="brow"><button class="bg-btn" id="cmX">Done</button></div>`,mc=>{
    mc.querySelector("#cmX").addEventListener("click",()=>{closeModal();render()});
    mc.querySelector("#cmQ").focus();
    if(filter)mc.querySelector("#cmQ").setSelectionRange(filter.length,filter.length);
    mc.querySelector("#cmQ").addEventListener("input",e=>{closeModal();collManageMd(col,e.target.value)});
    mc.querySelectorAll("[data-cmid]").forEach(el=>{el.addEventListener("click",()=>{
      const id=el.dataset.cmid;if(inCol.has(id)){removeFromColl(col.id,id);flash("Removed")}else{addToColl(col.id,id);flash("Added")}
      closeModal();collManageMd(col,filter)})})
  });
}

// ── Similar prompts (prompts like this) ──
function similarPromptsMd(p){
  const txt=((p.title||"")+" "+(p.content||"")).trim();
  const similar=findSimilarPrompts(txt,P,p.id,0.5);
  if(!similar.length){showModal(`<h3>Prompts like this</h3><p>No similar prompts found.</p><div class="brow"><button class="bp" id="simOk">OK</button></div>`,mc=>{mc.querySelector("#simOk").addEventListener("click",closeModal)});return}
  const list=similar.slice(0,8).map(s=>`<div class="fpi" data-id="${s.id}" data-fid="${s.folderId||''}" style="padding:5px 9px">${esc(s.title)} · ${Math.round((s.similarity||0)*100)}%</div>`).join("");
  showModal(`<h3>Prompts like this</h3><p>${similar.length} similar prompt${similar.length!==1?'s':''} found:</p><div style="max-height:180px;overflow-y:auto">${list}</div><div class="brow" style="margin-top:8px"><button class="bg-btn" id="simOk">Close</button></div>`,mc=>{
    mc.querySelector("#simOk").addEventListener("click",closeModal);
    mc.querySelectorAll(".fpi").forEach(el=>{el.addEventListener("click",()=>{const id=el.dataset.id,fid=el.dataset.fid;if(id&&fid){st().sel=fid;openItem(allItems(P.folders).find(x=>x.id===id));closeModal();render()}})});
  });
}

// ── Tag Color Picker ──
function showTagColorPicker(tag,x,y){
  const c=$("ctxC");
  const cur=cfg?.tagColors?.[tag]||"";
  let h=`<div class="tag-cpick" style="left:${Math.min(x,document.body.clientWidth-145)}px;top:${Math.min(y,document.body.clientHeight-80)}px">`;
  h+=`<div class="tag-cpick-title">${esc(tag)}</div>`;
  TAG_COLORS.forEach(tc=>{
    if(!tc.v)h+=`<div class="tag-cdot tag-cdot-none ${!cur?'sel':''}" data-tc=""></div>`;
    else h+=`<div class="tag-cdot ${cur===tc.v?'sel':''}" style="background:${tc.v}" data-tc="${tc.v}"></div>`;
  });
  h+=`</div>`;c.innerHTML=h;
  c.querySelectorAll(".tag-cdot").forEach(dot=>{dot.addEventListener("click",e=>{
    e.stopPropagation();setTagColor(tag,dot.dataset.tc);c.innerHTML="";render()})});
  setTimeout(()=>document.addEventListener("click",function h2(){c.innerHTML="";document.removeEventListener("click",h2)},{once:true}),10);
}

// ═══════ FEATURE: QUICK LINKS — LLM LAUNCHER ═══════
function toggleQuickLinks(){
  const drop=$("qlDrop");
  if(!drop)return;
  if(drop.classList.contains("open")){drop.classList.remove("open");return}
  const plats=activePlatforms().filter(p=>p.urls&&p.urls.length&&p.id!=="other");
  let h=`<div class="ql-title">Quick Links</div><div class="ql-grid">`;
  plats.forEach(p=>{
    const url="https://"+p.urls[0];
    h+=`<div class="ql-item" data-ql-url="${esc(url)}" title="${esc(p.name)}"><span class="ql-item-icon">${p.icon}</span><span class="ql-item-name">${esc(p.name.split("/")[0].trim())}</span></div>`;
  });
  h+=`</div>`;
  const photoCols=(PH?.collections||[]).filter(c=>(c.items||[]).some(id=>findItemGlobal(PH.folders,id)));
  if(photoCols.length){
    h+=`<div class="ql-sep"></div><div class="ql-title">Photo Collections</div><div class="ql-grid">`;
    photoCols.forEach(c=>{h+=`<div class="ql-item" data-ql-photo="${escAttr(c.id)}" title="Open ${escAttr(c.name)}"><span class="ql-item-icon">${S.frame}</span><span class="ql-item-name">${esc(c.name)}</span><span style="font-size:8px;color:var(--dm)">${(c.items||[]).length}</span></div>`});
    h+=`</div>`;
  }
  h+=`<div class="ql-sep"></div><div class="ql-edit" id="qlSettings">Manage platforms in Settings</div>`;
  drop.innerHTML=h;
  drop.classList.add("open");
  drop.querySelectorAll("[data-ql-url]").forEach(el=>{
    el.addEventListener("click",()=>{openUrl(el.dataset.qlUrl);drop.classList.remove("open")});
  });
  drop.querySelectorAll("[data-ql-photo]").forEach(el=>{
    el.addEventListener("click",()=>{aTab="photos";phSt.view="list";phSt.q="";phSt.tagFilter="";phSt.collFilter=el.dataset.qlPhoto;drop.classList.remove("open");render()});
  });
  $("qlSettings")?.addEventListener("click",()=>{drop.classList.remove("open");aTab="settings";render()});
  setTimeout(()=>document.addEventListener("click",function qlClose(e){
    if(!drop.contains(e.target)&&e.target.id!=="quickLinksBtn"&&!e.target.closest("#quickLinksBtn")){
      drop.classList.remove("open");document.removeEventListener("click",qlClose)}
  }),10);
}

// ═══════ FEATURE: CACHE CLEAR ═══════
function clearCache(){
  let h=`<h3>Clear Cache & Data</h3><p style="font-size:10px;color:var(--mu);margin-bottom:10px">Select what to clear. Your prompts, clips, bookmarks, notes, skills, and custom GPTs are safe unless you check the nuclear option.</p>`;
  h+=`<div style="display:flex;flex-direction:column;gap:6px">`;
  const items=[
    {id:"snapshots",label:"Recovery Snapshots",desc:"Rolling undo checkpoints (10 slots × 5 stores)",safe:true,checked:true},
    {id:"healthcache",label:"Health Check Cache",desc:"Last scan results and broken link data",safe:true,checked:true},
    {id:"pending",label:"Pending Captures",desc:"Queued clip/bookmark/skill saves that didn't complete",safe:true,checked:true},
    {id:"meta",label:"Sync & Backup Metadata",desc:"Save counters, backup timestamps, snapshot tracking",safe:true,checked:false},
    {id:"drivesync",label:"Google Drive Sync State",desc:"Force re-sync on next backup",safe:true,checked:false},
    {id:"nuclear",label:S.warn+" DELETE ALL DATA",desc:"Prompts, clips, bookmarks, notes, skills, custom GPTs, settings — everything",safe:false,checked:false},
  ];
  items.forEach(it=>{
    h+=`<label style="display:flex;align-items:flex-start;gap:8px;padding:5px 7px;border-radius:5px;cursor:pointer;border:1px solid ${it.safe?'var(--bl)':'var(--dn)'};background:${it.safe?'var(--sf)':'rgba(196,92,92,.08)'};transition:all .1s" class="cc-opt">
      <input type="checkbox" id="cc_${it.id}" ${it.checked?'checked':''} style="margin-top:2px;accent-color:${it.safe?'var(--ac)':'var(--dn)'}">
      <div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:500;color:${it.safe?'var(--tx)':'var(--dn)'}">${it.label}</div><div style="font-size:9px;color:var(--dm);margin-top:1px">${it.desc}</div></div>
    </label>`;
  });
  h+=`</div>`;
  h+=`<div class="brow"><button class="bg-btn" id="ccX">Cancel</button><button class="bp" id="ccY">Clear Selected</button></div>`;
  showModal(h,mc=>{
    // Nuclear checkbox disables/unchecks everything else
    const nuke=mc.querySelector("#cc_nuclear");
    nuke.addEventListener("change",()=>{
      items.filter(i=>i.safe).forEach(i=>{
        const cb=mc.querySelector("#cc_"+i.id);
        if(nuke.checked){cb.checked=false;cb.disabled=true;cb.closest("label").style.opacity=".35"}
        else{cb.disabled=false;cb.closest("label").style.opacity="1"}
      });
      const btn=mc.querySelector("#ccY");
      if(nuke.checked){btn.textContent="DELETE EVERYTHING";btn.className="bdn"}
      else{btn.textContent="Clear Selected";btn.className="bp"}
    });
    mc.querySelector("#ccX").addEventListener("click",closeModal);
    mc.querySelector("#ccY").addEventListener("click",()=>{
      const isNuke=mc.querySelector("#cc_nuclear").checked;
      if(isNuke){
        closeModal();
        showModal(`<h3 style="color:var(--dn)">Are you absolutely sure?</h3><p style="font-size:10px;color:var(--mu);line-height:1.5">This will <strong>permanently delete</strong> all your data. Export a backup first if you haven't.</p><div class="brow"><button class="bg-btn" id="nkX">Cancel</button><button class="bdn" id="nkY">Yes, Delete Everything</button></div>`,mc2=>{
          mc2.querySelector("#nkX").addEventListener("click",closeModal);
          mc2.querySelector("#nkY").addEventListener("click",()=>{
            closeModal();flash("Wiping all data...");
            chrome.storage.local.clear(()=>{
              flash("All data cleared — reloading...");
              setTimeout(()=>location.reload(),800);
            });
          });
        });
        return;
      }
      // Selective clear
      const keysToRemove=[];
      const doSnap=mc.querySelector("#cc_snapshots").checked;
      const doHc=mc.querySelector("#cc_healthcache").checked;
      const doPend=mc.querySelector("#cc_pending").checked;
      const doMeta=mc.querySelector("#cc_meta").checked;
      const doDrive=mc.querySelector("#cc_drivesync").checked;
      if(doSnap){for(let i=0;i<10;i++){keysToRemove.push("pv_sn_p"+i,"pv_sn_s"+i,"pv_sn_b"+i,"pv_sn_n"+i,"pv_sn_k"+i)}}
      if(doPend){keysToRemove.push("pv_pending_snippet","pv_pending_bookmark","pv_pending_skill","pv_pending_note","pv_pending_chat")}
      let cleared=[];
      if(doSnap)cleared.push("snapshots");
      if(doPend)cleared.push("pending");
      chrome.storage.local.remove(keysToRemove,()=>{
        if(meta&&(doHc||doMeta||doDrive)){
          if(doHc){delete meta.hcStats;delete meta.hcResults;delete meta.hcLastScan;cleared.push("health cache")}
          if(doMeta){delete meta.snapshots;meta.si=0;meta.sc=0;cleared.push("metadata")}
          if(doDrive){delete meta.gdLastSync;delete meta.gdFileId;delete meta.gdBackupId;cleared.push("Drive sync")}
          chrome.storage.local.set({[MK]:meta});
        }
        closeModal();
        flash("OK Cleared: "+cleared.join(", "));
        render();
      });
    });
  });
}

// ═══════ EVENTS ═══════
$("tabP")?.addEventListener("click",()=>{aTab="prompts";render()});
$("tabI")?.addEventListener("click",()=>{aTab="imgprompts";render()});
$("tabS")?.addEventListener("click",()=>{aTab="snippets";render()});
$("tabB")?.addEventListener("click",()=>{aTab="bookmarks";render()});
$("tabN")?.addEventListener("click",()=>{aTab="notes";render()});
$("tabK")?.addEventListener("click",()=>{aTab="skills";render()});
$("tabG")?.addEventListener("click",()=>{aTab="customgpts";render()});
$("tabPH")?.addEventListener("click",()=>{aTab="photos";render()});
$("tabCC")?.addEventListener("click",()=>{aTab="claudecmds";render()});
$("tabLS")?.addEventListener("click",()=>{aTab="lists";render()});
$("tabW")?.addEventListener("click",()=>{aTab="workspace";render()});
$("primaryFind")?.addEventListener("click",openUniversalSearch);
// ── Right-click on empty content area: create/paste without hunting for buttons ──
$("main")?.addEventListener("contextmenu",e=>{
  if(e.target.closest(".pc,.pc-compact,.lt,.pht,.sk-card,button,input,textarea,select,a,[data-star-tag],[data-nav],.tr,.ctx,.tag,.sf-chip"))return;
  if(!["prompts","imgprompts","snippets","bookmarks","notes","skills","customgpts","photos"].includes(aTab))return;
  const label=isP()?"Prompt":isI()?"Image Prompt":isK()?"Skill":isS()?"Clip":isN()?"Note":isG()?"Custom GPT":isPh()?"Photo":"Bookmark";
  const items=[{a:"new",l:"New "+label,ic:I.plus,fn:addItem},{a:"nf",l:"New Folder",ic:I.plus,fn:addFolder}];
  if(isS())items.push({a:"paste",l:"Paste as Clip",ic:I.copy,fn:clipFromClipboard});
  if(isP())items.push({a:"paste",l:"Paste as Prompt",ic:I.copy,fn:async()=>{try{const t=await navigator.clipboard.readText();if(!t||!t.trim()){flash("Clipboard is empty");return}const s2=st(),d2=dt(),f=findFolder(d2.folders,s2.sel);if(!f){flash("No folder selected");return}pushUndo();const id=generateId(d2);const title=(t.split("\n")[0]||"").slice(0,80).trim()||"Pasted Prompt";f.prompts=f.prompts||[];f.prompts.push({id,title,content:t.trim(),tags:[],created:Date.now(),modified:Date.now(),favorited:false,usageCount:0,versions:[]});save();render();flash("Prompt created: "+title)}catch{flash("Clipboard unavailable")}}});
  const fvMode=isP()?"prompts":isI()?"imgprompts":isS()?"clips":isB()?"bookmarks":isN()?"notes":isK()?"skills":isG()?"customgpts":isPh()?"photos":"";
  if(fvMode)items.push({sep:1},{a:"fv2",l:"Open Full View",ic:I.open,fn:()=>openFullView(fvMode)});
  const quick=pvQuickFolderResolved();
  if(quick.length){items.push({sep:1});quick.forEach(ref=>items.push({a:"qf",l:`Quick: ${ref.label} › ${ref.name}`,ic:S.star,fn:()=>pvQuickFolderGo(ref)}))}
  showContextMenu(e,items);
});
// ── Right-click a tab: jump to root or pop out the full-window view ──
(()=>{
  const tabMeta={tabP:["prompts","Prompts","prompts"],tabI:["imgprompts","Image Prompts","imgprompts"],tabS:["snippets","Clips","clips"],tabB:["bookmarks","Bookmarks","bookmarks"],tabN:["notes","Notes","notes"],tabK:["skills","Claude Tools › Skills","skills"],tabCC:["claudecmds","Claude Tools › Commands",""],tabG:["customgpts","GPTs","customgpts"],tabPH:["photos","Photos","photos"],tabW:["workspace","Workspace",""]};
  Object.entries(tabMeta).forEach(([id,[tab,name,fvMode]])=>{
    $(id)?.addEventListener("contextmenu",e=>{
      const items=[{a:"go",l:"Go to "+name,fn:()=>{aTab=tab;render()}}];
      if(fvMode)items.push({a:"fv",l:"Open "+name+" in Full View",ic:I.open,fn:()=>openFullView(fvMode)});
      items.push({sep:1},{a:"hint",l:"Drag tabs to reorder",cls:"ctx-hint",fn:()=>{}});
      showContextMenu(e,items);
    });
  });
})();
$("primarySave")?.addEventListener("click",()=>{aTab="prompts";render();addItem()});
$("primaryOrganize")?.addEventListener("click",()=>{aTab="workspace";render()});
$("primaryRecover")?.addEventListener("click",()=>{aTab="recovery";render()});
$("settingsBtn")?.addEventListener("click",()=>{aTab=aTab==="settings"?"prompts":"settings";render()});
$("quickLinksBtn")?.addEventListener("click",toggleQuickLinks);
$("refreshBtn")?.addEventListener("click",()=>{flushPendingSave();loadData().then(()=>{render();flash("OK Refreshed")})});
// ── Collapsible tab bar — the strip under the tabs toggles them away ──
function applyTabsCollapsed(){
  document.body.classList.toggle("tabs-collapsed",!!cfg?.tabsCollapsed);
  const t=$("tabsTog");if(t){t.setAttribute("aria-expanded",cfg?.tabsCollapsed?"false":"true");t.title=cfg?.tabsCollapsed?"Show tab bar":"Hide tab bar"}
}
// #tabsTog is a native <button>, so Enter/Space already fire click — no keydown handler needed.
$("tabsTog")?.addEventListener("click",()=>{cfg.tabsCollapsed=!cfg.tabsCollapsed;save();applyTabsCollapsed()});
// ── Collapsible top symbol banner — hides the .hdr-r icon cluster; toggle stays in .hdr-l ──
function applyBannerCollapsed(){
  document.body.classList.toggle("banner-collapsed",!!cfg?.bannerCollapsed);
  const b=$("bannerTog");if(b){b.setAttribute("aria-expanded",cfg?.bannerCollapsed?"false":"true");b.title=cfg?.bannerCollapsed?"Show toolbar":"Hide toolbar"}
}
$("bannerTog")?.addEventListener("click",()=>{cfg.bannerCollapsed=!cfg.bannerCollapsed;save();applyBannerCollapsed()});
// ── Quick note: post-it in the header → Notes / Quick Notes folder ──
function quickNoteMd(){
  showModal(`<h3>Quick Note</h3><textarea id="qnTa" placeholder="Jot it down — first line becomes the title..." style="width:100%;min-height:110px"></textarea><div class="brow"><button class="bg-btn" id="qnX">Cancel</button><button class="bp" id="qnY">Save to Quick Notes</button></div>`,mc=>{
    const ta=mc.querySelector("#qnTa");ta.focus();
    const go=()=>{
      const text=(ta.value||"").trim();
      if(!text){ta.focus();return}
      pushUndo();
      let qf=findFolder(NT.folders,"n_quick");
      if(!qf){qf={id:"n_quick",name:"Quick Notes",children:[],prompts:[],color:"#c9a45c"};NT.folders.children.unshift(qf)}
      const title=text.split("\n")[0].slice(0,80);
      const item=buildItem(NT,title,text,["quick"]);
      qf.prompts.unshift(item);
      save();closeModal();flash("OK Quick note saved");
      if(aTab==="notes")render();
    };
    mc.querySelector("#qnX").addEventListener("click",closeModal);
    mc.querySelector("#qnY").addEventListener("click",go);
    ta.addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey))go()});
  });
}
$("quickNoteBtn")?.addEventListener("click",quickNoteMd);
$("saveVaultBtn")?.addEventListener("click",()=>{
  flushPendingSave();
  flash("Vault saved");
  Cloud.schedulePush();
});
$("cacheClearBtn")?.addEventListener("click",()=>{clearCache()});
$("uniSearchBtn")?.addEventListener("click",openUniversalSearch);
$("expBtn")?.addEventListener("click",syncExportMd);
$("impBtn")?.addEventListener("click",openImportWizard);
$("impFile")?.addEventListener("change",e=>{e.target.value=""});
// ── Cloud: explicit menu — backup and restore are separate, visible choices ──
async function cloudEnsureConnected(dot){
  if(Cloud._connected)return true;
  flash("Connecting to Google Drive...");
  if(dot)dot.className="cloud-dot sync";
  try{await Cloud.connect()}catch(err){/* fall through */}
  if(!Cloud._connected){flash("Drive connection failed");if(dot)dot.className="cloud-dot off";return false}
  return true;
}
$("cloudBtn")?.addEventListener("click",()=>{
  const dot=$("cloudDot");
  const st=Cloud._connected?"Connected":"Not connected";
  showModal(`<h3>Google Drive</h3><p style="font-size:10px;color:var(--mu);margin-bottom:8px">${st}${Cloud._lastSync?" · last backup "+new Date(Cloud._lastSync).toLocaleString():""}</p>
    <div class="exp-opt" id="cbPush"><div class="eo-t">&#8682; Back up now</div><div class="eo-d">Push the current vault to Drive</div></div>
    <div class="exp-opt" id="cbPull"><div class="eo-t">&#8681; Restore from Drive&#8230;</div><div class="eo-d">Replace this vault with the latest Drive backup (undo available)</div></div>
    <div class="exp-opt" id="cbRecovery"><div class="eo-t">${S.steth} Recovery Center</div><div class="eo-d">Encrypted full backups, prompt spreadsheet, snapshots, coverage</div></div>
    <div class="brow"><button class="bg-btn" id="cbX">Cancel</button></div>`,mc=>{
    mc.querySelector("#cbX").addEventListener("click",closeModal);
    mc.querySelector("#cbRecovery").addEventListener("click",()=>{closeModal();aTab="recovery";render()});
    mc.querySelector("#cbPush").addEventListener("click",async()=>{
      closeModal();
      if(!await cloudEnsureConnected(dot))return;
      if(dot)dot.className="cloud-dot sync";
      flash("Backing up to Drive...");
      try{
        await Cloud.push(true);
        if(Cloud._error){const m=Cloud._error;flash(m.length>90?m.slice(0,90)+"\u2026":m)}
        else flash("OK Backed up to Drive!");
      }catch(err){console.warn("[PV] Push error:",err.message);flash("Connected! Will sync on next save.")}
      updateCloudDot();
    });
    mc.querySelector("#cbPull").addEventListener("click",async()=>{
      closeModal();
      if(!await cloudEnsureConnected(dot))return;
      openRestoreLatestFromDriveModal();
    });
  });
});
$("undoBtn")?.addEventListener("click",doUndo);
$("ftrB")?.addEventListener("click",doBackup);
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="z"&&!e.target.matches("input,textarea,select")){e.preventDefault();doUndo()}
  if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();openUniversalSearch()}});
document.addEventListener("click",e=>{const s2=st();if(s2?.sortOn&&!e.target.closest(".sort-w")){s2.sortOn=0;render()}});
// Ctrl/Cmd+V on the Photos tab pastes a clipboard image straight into the current folder.
document.addEventListener("paste",e=>{
  if(typeof isPh!=="function"||!isPh())return;
  const t=e.target;
  if(t&&(t.matches?.("input,textarea,[contenteditable],[contenteditable='true']")||t.closest?.("input,textarea,[contenteditable]")))return;
  const its=e.clipboardData&&e.clipboardData.items?[...e.clipboardData.items]:[];
  const imgIt=its.find(it=>it.kind==="file"&&(it.type||"").startsWith("image/"));
  if(!imgIt)return;
  const file=imgIt.getAsFile();if(!file)return;
  e.preventDefault();
  if(typeof pvIngestImageBlob==="function")pvIngestImageBlob(file,phSt.sel||"phroot","Pasted image");
});
chrome.runtime.onMessage.addListener(msg=>{
  if(msg.type==="SNIPPET_CAPTURE"){chrome.storage.local.remove("pv_pending_snippet");if(isCaptureBlocked(msg.url,cfg)){flash("Capture blocked on this domain");return}showCapture("snippet",msg.text,msg.url,msg.pageTitle)}
  if(msg.type==="BOOKMARK_CAPTURE"){chrome.storage.local.remove("pv_pending_bookmark");if(isCaptureBlocked(msg.url,cfg)){flash("Capture blocked on this domain");return}showCapture("bookmark","",msg.url,msg.title,msg.description)}
  if(msg.type==="CHAT_CAPTURE"){chrome.storage.local.remove("pv_pending_chat");if(isCaptureBlocked(msg.url,cfg)){flash("Capture blocked on this domain");return}showCapture("bookmark","",msg.url,msg.title)}
  if(msg.type==="SKILL_CAPTURE"){chrome.storage.local.remove("pv_pending_skill");if(isCaptureBlocked(msg.url,cfg)){flash("Capture blocked on this domain");return}showCapture("skill",msg.text,msg.url,msg.pageTitle)}
  if(msg.type==="NOTE_CAPTURE"){chrome.storage.local.remove("pv_pending_note");if(isCaptureBlocked(msg.url,cfg)){flash("Capture blocked on this domain");return}showCapture("note",msg.text,msg.url,msg.pageTitle)}
  if(msg.type==="PROMPT_CAPTURE"){chrome.storage.local.remove("pv_pending_prompt");if(isCaptureBlocked(msg.url,cfg)){flash("Capture blocked on this domain");return}promptFromSelection(msg.text,msg.url,msg.pageTitle)}
  if(msg.type==="CAPTURE_BLOCKED"){flash("Capture blocked on this domain")}
  if(msg.type==="BACKUP_REMINDER")clearBackupBanner()
  if(msg.type==="QUICK_SAVED"){loadData().then(()=>{
    // Re-run save() to sync metadata, snapshots, and cloud scheduling
    // for changes made by background.js quick-save (which bypasses the full pipeline)
    meta.sc=(meta.sc||0)+1;
    chrome.storage.local.set({[MK]:meta});
    Cloud.schedulePush();
    flash(msg.label||"Saved");render();
  })}
  if(msg.type==="QUICK_CLIPPED"){loadData().then(()=>{
    meta.sc=(meta.sc||0)+1;chrome.storage.local.set({[MK]:meta});Cloud.schedulePush();
    flash("OK Clipped to Inbox");render();
  })}
  // Fullview windows write directly to storage — pick up changes and schedule cloud sync
  if(msg.type==="DATA_CHANGED"||msg.type==="REBUILD_MENUS"){
    loadData().then(()=>{Cloud.schedulePush();try{render()}catch(e){console.warn("[PV] re-render after DATA_CHANGED:",e)}});
  }
});

// ═══════ FEATURE: UNIVERSAL SEARCH (Ctrl+K) ═══════
function openUniversalSearch(){
  const c=$("modalC");
  c.innerHTML=`<div class="mo"><div class="md uni-md"><div class="uni-hdr"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--dm)" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" id="uniQ" placeholder="Search · tag:x · platform:openai · multi-word fuzzy" autofocus><kbd class="uni-kbd">Esc</kbd></div><div id="uniRes" class="uni-res"></div></div></div>`;
  c.querySelector(".mo").addEventListener("click",e=>{if(e.target===e.currentTarget)closeModal()});
  const q=$("uniQ"),res=$("uniRes");
  let sel=0;
  function uniSnippet(text,query,maxLen){
    if(!text||!query)return"";
    const tl=text.toLowerCase(),ql2=query.toLowerCase();
    const idx=tl.indexOf(ql2);if(idx<0)return"";
    const start=Math.max(0,idx-30);const end=Math.min(text.length,idx+query.length+60);
    let snip=(start>0?"...":"")+text.slice(start,end).replace(/\n/g," ")+(end<text.length?"...":"");
    const re=new RegExp("("+query.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","gi");
    return esc(snip).replace(re,"<mark>$1</mark>");
  }
  const doSearch=()=>{const query=q.value.trim();if(!query){res.innerHTML='<div class="uni-hint">Add keywords (fuzzy, any order). Filters: <code>tag:name</code> <code>platform:anthropic</code>. All vault types.</div>';return}
    const fil=parseUniQuery(query);const results=[];
    const hlToken=(fil.text||fil.tokens.join(" ")||query).trim()||query;
    const pickField=(p)=>{
      const tl=(p.title||"").toLowerCase(),gl=(fil.text||"").toLowerCase(),tok=fil.tokens||[];
      if(gl&&tl.includes(gl))return"title";
      if(tok.some(t=>t&&tl.includes(t)))return"title";
      if((p.url||"").toLowerCase().includes(gl||(tok[0]||"").toLowerCase()))return"url";
      if(fil.tag&&(p.tags||[]).some(tg=>(tg||"").toLowerCase().includes(fil.tag.toLowerCase())))return"tag";
      if((p.sourceTitle||"").toLowerCase().includes(gl||(tok[0]||"").toLowerCase()))return"source";
      return"content";
    };
    const searchStore=(data,type,icon,color)=>{allItemsCached(data.folders).forEach(p=>{
      const sc=uniItemMatchScore(fil,p);
      if(sc<=0)return;
      results.push({...p,_type:type,_icon:icon,_color:color,_matchField:pickField(p),_uscore:sc})})};
    searchStore(P,"prompts",S.bolt,"var(--ac)");searchStore(SN,"snippets",S.clip,"var(--sn)");searchStore(BM,"bookmarks",S.pin,"var(--bk)");searchStore(NT,"notes",S.note,"var(--nt)");searchStore(KL,"skills",S.wrench,"var(--sk)");searchStore(GP,"customgpts",S.ai,"var(--gp)");searchStore(PH,"photos",S.frame,"var(--ph)");
    results.sort((a,b)=>{if((b._uscore||0)!==(a._uscore||0))return(b._uscore||0)-(a._uscore||0);if(a._matchField==="title"&&b._matchField!=="title")return-1;if(b._matchField==="title"&&a._matchField!=="title")return 1;return(b.modified||0)-(a.modified||0)});
    if(!results.length){res.innerHTML='<div class="uni-hint">No results for "'+esc(query)+'"</div>';return}
    sel=Math.min(sel,results.length-1);
    res.innerHTML=results.slice(0,30).map((r,i)=>{
      let context="";
      if(r._matchField==="content")context=`<div class="uni-context">${uniSnippet(r.content,hlToken,90)}</div>`;
      else if(r._matchField==="url")context=`<div class="uni-context">${esc((r.url||"").slice(0,80))}</div>`;
      return`<div class="uni-r ${i===sel?'uni-sel':''}" data-uri="${i}"><span class="uni-type" style="color:${r._color}">${r._icon}</span><div class="uni-info"><div class="uni-title">${esc(r.title)}</div>${context}<div class="uni-meta">${r.folderName?esc(r.folderName)+' · ':''}${r._type}${(r.tags||[]).length?' · '+r.tags.slice(0,3).map(t=>esc(t)).join(', '):''}</div></div></div>`
    }).join("")+(results.length>30?`<div class="uni-hint">${results.length-30} more...</div>`:'');
    res.querySelectorAll(".uni-r").forEach(el=>{el.addEventListener("click",()=>navToResult(results[+el.dataset.uri]))});
  };
  const uniStateByType={prompts:pSt,imgprompts:iPSt,skills:kSt,snippets:sSt,notes:nSt,customgpts:gSt,bookmarks:bSt,photos:phSt,projects:prSt};
  const navToResult=(r)=>{if(r._type==="prompts")recordVaultRecent({kind:"prompt",action:"open",id:r.id,folderId:r.folderId,title:r.title});if(r._type==="snippets")recordVaultRecent({kind:"clip",action:"open",id:r.id,folderId:r.folderId,title:r.title});closeModal();aTab=r._type;const s=uniStateByType[r._type]||bSt;
    s.sel=r.folderId;s.exp[r.folderId]=1;s.view="list";s.q="";render();updTabs();
    setTimeout(()=>{const card=document.querySelector(`[data-pid="${r.id}"]`);if(card)card.scrollIntoView({behavior:"smooth",block:"center"})},100)};
  const _debouncedUniSearch=debounce(doSearch,120);
  q.addEventListener("input",()=>{sel=0;_debouncedUniSearch()});
  q.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();return}
    const rows=res.querySelectorAll(".uni-r");if(e.key==="ArrowDown"){e.preventDefault();sel=Math.min(sel+1,rows.length-1);doSearch()}
    else if(e.key==="ArrowUp"){e.preventDefault();sel=Math.max(sel-1,0);doSearch()}
    else if(e.key==="Enter"&&rows[sel]){rows[sel].click()}});
  doSearch();
}

// ═══════ FEATURE: PROMPT-CLIP LINKING ═══════
function linkPickerMd(clipId){
  const allP=allItems(P.folders);
  showModal(`<h3>Link to Prompt</h3><input type="text" id="lpQ" placeholder="Search prompts..."><div class="fp" id="lpList" style="margin-top:6px"></div><div class="brow"><button class="bg-btn" id="lpX">Cancel</button></div>`,mc=>{
    const doFilter=()=>{const q=(mc.querySelector("#lpQ")?.value||"").toLowerCase();
      const filtered=q?allP.filter(p=>p.title.toLowerCase().includes(q)||(p.tags||[]).some(t=>t.toLowerCase().includes(q))):allP.slice(0,30);
      mc.querySelector("#lpList").innerHTML=filtered.slice(0,30).map(p=>`<div class="fpi lp-item" data-lpid="${p.id}" data-lpfid="${p.folderId}" style="display:flex;gap:6px;align-items:center"><span style="color:var(--ac)">${S.bolt}</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.title)}</span><span style="font-size:8px;color:var(--dm)">${esc(p.folderName||'')}</span></div>`).join("")+(filtered.length>30?'<div style="font-size:9px;color:var(--dm);padding:4px">Use search to narrow...</div>':'');
      mc.querySelectorAll(".lp-item").forEach(el=>{el.addEventListener("click",()=>{
        const f=findFolder(SN.folders,sSt.sel);const item=f?.prompts?.find(x=>x.id===clipId);
        if(item){pushUndo();item.linkedPromptId=el.dataset.lpid;save();flash("OK Linked");closeModal();render()}})})};
    mc.querySelector("#lpQ").addEventListener("input",doFilter);
    mc.querySelector("#lpX").addEventListener("click",closeModal);
    mc.querySelector("#lpQ").focus();doFilter()})
}

// ═══════ FEATURE: PROMPT CHAIN (Follow-up Linking) ═══════
function followUpPickerMd(){
  const allP=allItems(P.folders).filter(x=>x.id!==pSt.eId); // exclude self
  showModal(`<h3>${S.arrow} Link Follow-up</h3><p style="font-size:10px;color:var(--dm);margin-bottom:6px">Pick the prompt that fires next in the chain.</p><input type="text" id="fuQ" placeholder="Search prompts..."><div class="fp" id="fuList" style="margin-top:6px"></div><div class="brow"><button class="bg-btn" id="fuX">Cancel</button></div>`,mc=>{
    const doFilter=()=>{const q=(mc.querySelector("#fuQ")?.value||"").toLowerCase();
      const filtered=q?allP.filter(p=>p.title.toLowerCase().includes(q)||(p.tags||[]).some(t=>t.toLowerCase().includes(q))):allP.slice(0,30);
      mc.querySelector("#fuList").innerHTML=filtered.slice(0,30).map(p=>`<div class="fpi fu-item" data-fuid="${p.id}" style="display:flex;gap:6px;align-items:center"><span style="color:var(--ac)">${S.arrow}</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.title)}</span><span style="font-size:8px;color:var(--dm)">${esc(p.folderName||'')}</span></div>`).join("")+(filtered.length>30?'<div style="font-size:9px;color:var(--dm);padding:4px">Use search to narrow...</div>':'');
      mc.querySelectorAll(".fu-item").forEach(el=>{el.addEventListener("click",()=>{
        pSt._nextId=el.dataset.fuid;
        const nxt=allP.find(x=>x.id===el.dataset.fuid);
        pSt._nextTitle=nxt?nxt.title:"";
        flash("OK Linked");closeModal();render()})})};
    mc.querySelector("#fuQ").addEventListener("input",doFilter);
    mc.querySelector("#fuX").addEventListener("click",closeModal);
    mc.querySelector("#fuQ").focus();doFilter()})
}

// ═══════ FEATURE: DIFF ENGINE ═══════
function renderDiff(oldText,newText){
  const oldWords=oldText.split(/(\s+)/),newWords=newText.split(/(\s+)/);
  // Simple LCS-based word diff
  const m=oldWords.length,n=newWords.length;
  const dp=Array(m+1).fill(null).map(()=>Array(n+1).fill(0));
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){if(oldWords[i-1]===newWords[j-1])dp[i][j]=dp[i-1][j-1]+1;else dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1])}
  const result=[];let i=m,j=n;
  while(i>0||j>0){if(i>0&&j>0&&oldWords[i-1]===newWords[j-1]){result.unshift({type:"same",text:oldWords[i-1]});i--;j--}
    else if(j>0&&(i===0||dp[i][j-1]>=dp[i-1][j])){result.unshift({type:"add",text:newWords[j-1]});j--}
    else{result.unshift({type:"del",text:oldWords[i-1]});i--}}
  return result.map(r=>{if(r.type==="add")return`<span class="diff-add">${esc(r.text)}</span>`;if(r.type==="del")return`<span class="diff-del">${esc(r.text)}</span>`;return esc(r.text)}).join("")
}

// ═══════ FEATURE: FRAGMENT RESOLUTION ═══════
function resolveFragments(text){
  if(typeof detectCircularRefs==="function"){const cycle=detectCircularRefs(text);if(cycle){console.warn("Circular ref detected:",cycle);return null}}
  return(text||"").replace(/\{\{ref:([^}]+)\}\}/g,(match,title)=>{const p=findPromptByRef(title.trim());return p?p.content:match})
}
function findPromptByRef(ref){
  const rl=ref.toLowerCase();const all=allItems(P.folders);
  return all.find(p=>p.title.toLowerCase()===rl)||all.find(p=>p.title.toLowerCase().includes(rl))||null
}

// ═══════ FEATURE: AUTO-TAGGING ═══════
function suggestTags(content){
  if(!content||content.length<10)return[];const cl2=content.toLowerCase();const tags=[];
  // Code detection
  if(/```|function\s|const\s|import\s|def\s|class\s|=>|\.map\(|\.filter\(/.test(content))tags.push("code");
  // Language/framework detection
  if(/\bpython\b/i.test(cl2))tags.push("python");if(/\bjavascript\b|\bjs\b|\btypescript\b/i.test(cl2))tags.push("javascript");
  if(/\breact\b/i.test(cl2))tags.push("react");if(/\bsql\b/i.test(cl2))tags.push("sql");
  // Content type
  if(/\bprompt\b|\binstruction\b|\byou are\b|\bact as\b|\brole\b/i.test(cl2))tags.push("system-prompt");
  if(/\bsummar/i.test(cl2))tags.push("summary");if(/\banalys/i.test(cl2))tags.push("analysis");
  if(/\btemplate\b|\b\{\{/i.test(cl2))tags.push("template");
  if(/\bapi\b|\bendpoint\b|\bfetch\b|\bhttp\b/i.test(cl2))tags.push("api");
  if(/\bmarketing\b|\bcopy\b|\bheadline\b|\bcta\b/i.test(cl2))tags.push("marketing");
  if(/\bemail\b|\bsubject line\b/i.test(cl2))tags.push("email");
  if(/\bwriting\b|\bstory\b|\bnarrative\b|\bcharacter\b/i.test(cl2))tags.push("creative-writing");
  if(/\bseo\b|\bkeyword/i.test(cl2))tags.push("seo");
  if(/\bdata\b.*\bclean|\bcsv\b|\bspreadsheet\b/i.test(cl2))tags.push("data");
  if(/\bdebug\b|\berror\b|\bfix\b|\bbug\b/i.test(cl2))tags.push("debugging");
  if(/\bexplain\b.*\blike|eli5|simple terms/i.test(cl2))tags.push("explanation");
  if(/\bbrainstorm\b|\bideas?\b.*\bfor\b/i.test(cl2))tags.push("brainstorm");
  // Tone/style
  if(content.length>1500)tags.push("long-form");
  if(content.length<200&&/\?/.test(content))tags.push("question");
  return[...new Set(tags)].slice(0,5)
}

// ═══════ FEATURE: SYNC EXPORT/IMPORT ═══════
function syncExportMd(){
  const all={prompts:P,imgprompts:IP,skills:KL,snippets:SN,bookmarks:BM,notes:NT,customgpts:GP,photos:PH,lists:LS,config:cfg,exportedAt:new Date().toISOString(),version:vaultBackupExportVersion()};
  const json=JSON.stringify(all,null,2);const size=(json.length/1024).toFixed(1);
  showModal(`<h3>Sync Export</h3><p>${size}KB · ${allItems(P.folders).length}p · ${allItems(KL.folders).length}sk · ${allItems(SN.folders).length}s · ${allItems(BM.folders).length}b · ${allItems(NT.folders).length}n</p>
    <div class="exp-opt" data-sf="file"><div class="eo-t">${I.dl} Save to file</div><div class="eo-d">Download .json backup — transfer between machines</div></div>
    <div class="exp-opt" data-sf="clip"><div class="eo-t">${I.copy} Copy to clipboard</div><div class="eo-d">Paste into cloud storage or another browser</div></div>
    <div class="brow"><button class="bg-btn" id="seX">Cancel</button></div>`,mc=>{
    mc.querySelector("#seX").addEventListener("click",closeModal);
    mc.querySelectorAll("[data-sf]").forEach(el=>el.addEventListener("click",()=>{
      if(el.dataset.sf==="file"){manualExport();closeModal()}
      else{navigator.clipboard.writeText(json).then(()=>{flash("OK Copied - paste in target browser's import");meta.lb=Date.now();meta.lbs=meta.sc;chrome.storage.local.set({[MK]:meta});closeModal()}).catch(()=>flash("Copy failed"))}
    }))
  })
}

// ═══════ TAB BAR — drag-to-reorder content silos ═══════
// Content silos are drag-reorderable. Order persists in cfg.tabOrder, which rides save/backup/restore
// like the rest of config. Forward-compatible: any content tab not present in
// a saved order is appended (so future tabs show up automatically).

const CONTENT_TAB_IDS = ["tabP", "tabI", "tabS", "tabB", "tabN", "tabK", "tabG", "tabPH", "tabCC", "tabLS", "tabW"];

function tabOrderResolved() {
  const saved = (cfg && Array.isArray(cfg.tabOrder)) ? cfg.tabOrder : [];
  const order = [];
  for (const id of saved) if (CONTENT_TAB_IDS.includes(id) && document.getElementById(id) && !order.includes(id)) order.push(id);
  // Any content tab missing from the saved order (e.g. a tab shipped after the user's order
  // was saved) is inserted into its canonical neighborhood — right after the nearest preceding
  // known tab — instead of being appended at the very end. So a new tab lands where it was
  // designed to sit for existing users too, and they can still drag it anywhere afterward.
  for (const id of CONTENT_TAB_IDS) {
    if (!document.getElementById(id) || order.includes(id)) continue;
    const canon = CONTENT_TAB_IDS.indexOf(id);
    let insertAt = order.length;
    for (let j = canon - 1; j >= 0; j--) {
      const pos = order.indexOf(CONTENT_TAB_IDS[j]);
      if (pos >= 0) { insertAt = pos + 1; break; }
    }
    order.splice(insertAt, 0, id);
  }
  return order;
}

function applyTabOrder() {
  const bar = document.querySelector(".tabs");
  if (!bar) return;
  tabOrderResolved().forEach(id => { const el = document.getElementById(id); if (el) bar.appendChild(el); });
}

function persistTabOrder() {
  const bar = document.querySelector(".tabs");
  if (!bar) return;
  const ids = [...bar.children].map(el => el.id).filter(id => CONTENT_TAB_IDS.includes(id));
  if (!cfg) return;
  cfg.tabOrder = ids;
  save();
}

function ensureTabReorderStyle() {
  if (document.getElementById("tab-reorder-style")) return;
  const s = document.createElement("style");
  s.id = "tab-reorder-style";
  s.textContent = `
  .tab.tab-dragging{opacity:.4}
  .tab.tab-dl{box-shadow:inset 2px 0 0 var(--tab-ac,var(--ac))}
  .tab.tab-dr{box-shadow:inset -2px 0 0 var(--tab-ac,var(--ac))}`;
  document.head.appendChild(s);
}

let _tabReorderReady = false;
function setupTabReorder() {
  ensureTabReorderStyle();
  applyTabOrder();
  if (_tabReorderReady) return;
  _tabReorderReady = true;
  const bar = document.querySelector(".tabs");
  if (!bar) return;

  const clearMarks = () => bar.querySelectorAll(".tab-dl,.tab-dr").forEach(x => x.classList.remove("tab-dl", "tab-dr"));

  CONTENT_TAB_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", e => { e.dataTransfer.setData("tabid", id); e.dataTransfer.effectAllowed = "move"; el.classList.add("tab-dragging"); });
    el.addEventListener("dragend", () => { el.classList.remove("tab-dragging"); clearMarks(); });
    el.addEventListener("dragover", e => {
      if (!e.dataTransfer.types.includes("tabid")) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const before = (e.clientX - r.left) < r.width / 2;
      el.classList.toggle("tab-dl", before);
      el.classList.toggle("tab-dr", !before);
    });
    el.addEventListener("dragleave", () => el.classList.remove("tab-dl", "tab-dr"));
    el.addEventListener("drop", e => {
      if (!e.dataTransfer.types.includes("tabid")) return;
      e.preventDefault();
      clearMarks();
      const dragId = e.dataTransfer.getData("tabid");
      const dragEl = document.getElementById(dragId);
      if (!dragEl || dragEl === el) return;
      const r = el.getBoundingClientRect();
      const before = (e.clientX - r.left) < r.width / 2;
      if (before) bar.insertBefore(dragEl, el);
      else bar.insertBefore(dragEl, el.nextSibling);
      persistTabOrder();
    });
  });

}

// ═══════ AI HELPERS — Reduce human bullshit, improve prompt quality ═══════
// Features: circular ref detection, platform match, token limits, fluff detection,
// constraint checklist, post-inject feedback, duplicate merge, version labels.

const TOKEN_WARN_4K=4000,TOKEN_WARN_8K=8000;
const FLUFF_PATTERNS=[
  /\byou are (?:an? |the )?(?:expert|best|brilliant|clever|intelligent|smart)\b/gi,
  /\bshow (?:your |me )?(?:intelligence| brilliance|expertise)\b/gi,
  /\bbe (?:clever|cleverly|intelligent|smart)\b/gi,
  /\bplease (?:be |do )?(?:thorough|comprehensive|detailed)\b/gi,
  /\b(?:as |acting )?(?:an? |the )?(?:expert|professional)\b/gi,
  /\b(?:i need |i want )?(?:you to )?(?:help me|assist me)\b/gi,
  /\b(?:great|excellent|wonderful|amazing) (?:job|work)\b/gi,
  /\b(?:thank you|thanks) (?:in advance|so much)\b/gi,
  /\b(?:i (?:would )?appreciate|please|kindly)\b/gi,
  /\b(?:make sure|ensure) (?:to |that )?\b/gi,
  /\b(?:do your best|give it your all)\b/gi,
  /\b(?:think (?:carefully|deeply|thoroughly))\b/gi,
  /\b(?:take your time|no rush)\b/gi,
  /\b(?:i (?:would )?like )?(?:you to )?(?:explain|describe|summarize|analyze)\b/gi,
  /\b(?:as (?:much |detailed )?as )?(?:possible|you can)\b/gi,
];

function detectCircularRefs(text){
  const refs=(text||"").match(/\{\{ref:([^}]+)\}\}/g);
  if(!refs||!refs.length)return null;
  const seenIds=new Set();
  const path=[];
  function walk(title){
    const p=findPromptByRef(title);
    if(!p)return null;
    if(seenIds.has(p.id))return path.concat(p.title);
    seenIds.add(p.id);
    path.push(p.title);
    const inner=(p.content||"").match(/\{\{ref:([^}]+)\}\}/g);
    if(inner)for(const m of inner){
      const t=m.slice(6,-2).trim();
      const cycle=walk(t);
      if(cycle)return cycle;
    }
    path.pop();
    seenIds.delete(p.id);
    return null;
  }
  for(const m of refs){
    const t=m.slice(6,-2).trim();
    const cycle=walk(t);
    if(cycle)return cycle;
  }
  return null;
}

function getTokenCount(text){return tokenEstimate(text)}
function getTokenWarning(text){
  const t=getTokenCount(text);
  if(t>=TOKEN_WARN_8K)return{level:"high",msg:`~${t} tokens — may exceed context limits`};
  if(t>=TOKEN_WARN_4K)return{level:"med",msg:`~${t} tokens — consider trimming`};
  return null;
}

function detectFluff(text){
  if(!text||text.length<50)return[];
  const found=[];
  for(const pat of FLUFF_PATTERNS){
    const m=text.match(pat);
    if(m)found.push(...m.map(x=>x.trim()).filter(Boolean));
  }
  return[...new Set(found)].slice(0,5);
}

function getPlatformFromUrl(url){return detectPlatform(url)||null}

function platformMatches(promptPlatform,currentPlatform){
  if(!promptPlatform)return true;
  if(!currentPlatform)return true;
  return promptPlatform===currentPlatform;
}

function getConstraintChecklist(p){
  const c=[];
  const txt=(p?.content||"").toLowerCase();
  const hasLength=/^\s*(?:output|response|length|limit|words?|characters?|sentences?)[\s:]/m.test(txt)||/\b(?:in \d+|limit to|max \d+|at most \d+)/.test(txt);
  const hasFormat=/\b(?:markdown|json|bullet|list|paragraph|table|outline)\b/.test(txt)||/\b(?:format|structure|output as)\b/.test(txt);
  const hasTone=/\b(?:tone|style|formal|casual|professional|friendly)\b/.test(txt);
  const hasExamples=/\b(?:example|e\.g\.|for instance|such as)\b/.test(txt)||/\b(?:few-shot|sample)\b/.test(txt);
  if(!hasLength)c.push("output length");
  if(!hasFormat)c.push("output format");
  if(!hasTone)c.push("tone/style");
  if(!hasExamples)c.push("examples");
  return c;
}

function hasUnfilledVars(text,vars){
  if(!vars||!vars.length)return false;
  return vars.some(v=>{
    const re=new RegExp(`\\{\\{${String(v).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\}\\}`);
    return re.test(text);
  });
}

function recordInjectFeedback(promptId,rating){
  meta.injectFeedback=meta.injectFeedback||{};
  meta.injectFeedback[promptId]=meta.injectFeedback[promptId]||{ratings:[],total:0,sum:0};
  const f=meta.injectFeedback[promptId];
  f.ratings.push({r:rating,ts:Date.now()});
  if(f.ratings.length>50)f.ratings=f.ratings.slice(-50);
  f.total=f.ratings.length;
  f.sum=f.ratings.reduce((s,x)=>s+x.r,0);
  chrome.storage.local.set({[MK]:meta});
}

function getInjectRating(promptId){
  const f=meta?.injectFeedback?.[promptId];
  if(!f||!f.ratings?.length)return null;
  return{avg:f.sum/f.ratings.length,count:f.total};
}

// ═══════ TEMPLATE LIBRARY (silo-scoped) ═══════
// Templates are scoped per silo. Each silo shows ONLY its own set and imports
// into ITS OWN store. Silos with no genuinely-useful templates (projects,
// bookmarks, clips, image prompts) have NO template affordance at all.
//
// Registry: SILO_TEMPLATES maps a tab key → category array. tplSiloMeta() maps
// a tab key → its store / root id / labels so import lands in the right place.

const PROMPT_TEMPLATES=[
  {cat:"Writing",icon:"&#9997;",templates:[
    {title:"Universal Summarizer",tags:["summary"],desc:"Condense any text to its key points in a structured format.",
      content:"Summarize the following text into 3-5 bullet points. For each bullet:\n- Lead with the key insight (bold it)\n- Follow with 1 sentence of supporting detail\n- End with any action items if applicable\n\nText to summarize:\n{{Content:+long}}\n\nOutput format: {{Format:Bullets|Numbered list|Executive brief|One paragraph}}"},
    {title:"Tone Shifter",tags:["writing","tone"],desc:"Rewrite content in a different voice while preserving meaning.",
      content:"Rewrite the following text in a {{Tone:Professional|Casual|Academic|Persuasive|Empathetic|Witty}} tone.\n\nPreserve:\n- All factual claims\n- The core argument\n- Approximate length\n\nChange:\n- Vocabulary and sentence structure\n- Level of formality\n- Rhetorical approach\n\nOriginal text:\n{{Text:+long}}"},
    {title:"Email Drafter",tags:["email","writing"],desc:"Professional emails with clear structure and purpose.",
      content:"Write a {{Type:Follow-up|Introduction|Request|Thank you|Apology|Proposal}} email.\n\nContext: {{Context}}\nRecipient: {{Recipient}}\nKey point: {{Key Point}}\nDesired outcome: {{Desired Outcome}}\n\nTone: {{Tone:Professional|Friendly|Formal|Direct}}\nLength: {{Length:Short (2-3 sentences)|Medium (1 paragraph)|Detailed (2-3 paragraphs)}}"},
  ]},
  {cat:"Code",icon:"&#128187;",templates:[
    {title:"Code Reviewer",tags:["code","review"],desc:"Thorough code review with actionable feedback.",
      content:"Review this code for:\n1. **Bugs** — logic errors, edge cases, null/undefined risks\n2. **Performance** — unnecessary loops, memory leaks, N+1 queries\n3. **Readability** — naming, structure, comments that add value\n4. **Security** — injection, auth gaps, data exposure\n\nFor each issue found:\n- Severity: Critical / Warning / Suggestion\n- Line reference\n- What's wrong and why\n- Concrete fix (show the code)\n\nCode:\n```\n{{Code:+long}}\n```"},
    {title:"Explain Like I'm a Dev",tags:["code","explanation"],desc:"Technical concept explained with code examples.",
      content:"Explain {{Concept}} to a developer who understands {{Their Background:JavaScript basics|Python basics|General programming|Database fundamentals}}.\n\nStructure:\n1. One-sentence definition\n2. Why it matters (real-world problem it solves)\n3. Minimal working code example\n4. Common gotcha or mistake\n5. When NOT to use it"},
    {title:"Debug Assistant",tags:["code","debugging"],desc:"Systematic debugging with root cause analysis.",
      content:"I'm seeing this error/behavior:\n{{Error or unexpected behavior:+long}}\n\nHere's the relevant code:\n```\n{{Code:+long}}\n```\n\nWhat I've already tried: {{What I've tried}}\nExpected behavior: {{Expected behavior}}\n\nPlease:\n1. Identify the root cause\n2. Explain WHY it's happening\n3. Provide the fix with code\n4. Suggest how to prevent this class of bug"},
  ]},
  {cat:"Analysis",icon:"&#128202;",templates:[
    {title:"Decision Matrix",tags:["analysis","decision"],desc:"Structured comparison of options with weighted criteria.",
      content:"Help me decide between these options:\n{{Option A}} vs {{Option B}}{{Option C (optional)}}\n\nContext: {{Decision context}}\n\nEvaluate on these criteria (weight 1-5 for importance):\n- {{Criterion 1}} (weight: {{W1:1|2|3|4|5}})\n- {{Criterion 2}} (weight: {{W2:1|2|3|4|5}})\n- {{Criterion 3}} (weight: {{W3:1|2|3|4|5}})\n\nFor each option:\n1. Score each criterion (1-10)\n2. Calculate weighted total\n3. List top pro and con\n4. Give a final recommendation with reasoning"},
    {title:"SWOT Analysis",tags:["analysis","strategy"],desc:"Strengths, weaknesses, opportunities, and threats.",
      content:"Perform a SWOT analysis for:\n{{Subject}}\n\nContext/Industry: {{Context}}\n\nFor each quadrant, provide 3-5 points with brief explanations:\n- **Strengths** (internal advantages)\n- **Weaknesses** (internal limitations)\n- **Opportunities** (external potential)\n- **Threats** (external risks)\n\nThen provide:\n- Top strategic recommendation\n- Biggest risk to mitigate\n- Quick win to pursue first"},
  ]},
  {cat:"Productivity",icon:"&#128640;",templates:[
    {title:"Meeting Notes to Actions",tags:["meetings","productivity"],desc:"Extract action items, decisions, and follow-ups from notes.",
      content:"Extract structured output from these meeting notes:\n\n{{Meeting Notes:+long}}\n\nProvide:\n1. **Decisions Made** — what was agreed on\n2. **Action Items** — who does what by when (table format)\n3. **Open Questions** — unresolved topics needing follow-up\n4. **Key Insights** — important points raised\n5. **Next Steps** — what happens next and when"},
    {title:"Weekly Planning Prompt",tags:["planning","productivity"],desc:"Structure your week with priorities and time blocks.",
      content:"Help me plan my week.\n\nMy top priorities this week:\n1. {{Priority 1}}\n2. {{Priority 2}}\n3. {{Priority 3}}\n\nRecurring commitments: {{Recurring meetings/obligations}}\nAvailable hours per day: {{Hours:4|6|8|10}}\nEnergy pattern: {{Pattern:Morning person|Afternoon peak|Night owl|Variable}}\n\nCreate a daily plan (Mon-Fri) that:\n- Front-loads deep work during peak energy\n- Groups similar tasks\n- Includes buffer time\n- Flags if priorities are at risk"},
  ]},
  {cat:"Creative",icon:"&#127912;",templates:[
    {title:"Brainstorm Expander",tags:["brainstorm","creative"],desc:"Take a seed idea and generate structured variations.",
      content:"Starting idea: {{Seed Idea}}\nDomain: {{Domain:Business|Product|Content|Marketing|Technical|Personal}}\n\nGenerate:\n1. **5 variations** — different angles on the same core idea\n2. **3 combinations** — merge with adjacent concepts\n3. **1 opposite** — what if we did the reverse?\n4. **1 extreme** — what if we pushed this 10x further?\n5. **Feasibility note** — which idea has the best effort-to-impact ratio"},
    {title:"Content Repurposer",tags:["content","marketing"],desc:"Transform one piece of content into multiple formats.",
      content:"Transform this content into multiple formats:\n\nOriginal content:\n{{Content:+long}}\n\nGenerate:\n1. **Twitter/X thread** (5-7 tweets, hook first)\n2. **LinkedIn post** (professional angle, 150-200 words)\n3. **Email newsletter snippet** (subject line + 2 paragraphs)\n4. **Bullet-point summary** (for internal docs)\n5. **One-liner** (could be used as a headline or tagline)"},
  ]},
  {cat:"System Prompts",icon:"&#129302;",templates:[
    {title:"Expert Persona",tags:["system-prompt","persona"],desc:"Define an AI persona with expertise, style, and constraints.",
      content:"You are {{Expert Name}}, a {{Role/Title}} with deep expertise in {{Domain}}.\n\nYour communication style:\n- {{Style:Direct and concise|Thorough and educational|Socratic (questions first)|Warm and encouraging}}\n- You always {{Key behavior, e.g. cite sources, give examples, challenge assumptions}}\n- You never {{Constraint, e.g. make up data, give medical advice, skip reasoning}}\n\nWhen responding:\n1. Start with the most actionable insight\n2. Support claims with reasoning\n3. Flag uncertainty explicitly\n4. End with a specific next step\n\nAudience: {{Audience:Beginner|Intermediate|Expert|Mixed}}"},
    {title:"Output Format Controller",tags:["system-prompt","formatting"],desc:"Force consistent output structure across conversations.",
      content:"For every response in this conversation, follow this output format:\n\n## Structure\n- **TL;DR**: One sentence summary at the top\n- **Details**: {{Format:Numbered steps|Bullet points|Paragraphs|Table}}\n- **Confidence**: Rate your confidence (High/Medium/Low) and explain why\n- **Sources/References**: If applicable\n\n## Constraints\n- Maximum length: {{Length:~200 words|~500 words|~1000 words|No limit}}\n- Reading level: {{Level:Simple (Grade 8)|Standard|Technical|Academic}}\n- If you don't know something, say so — don't fabricate\n\n## Context\n{{Additional context or domain}}"},
  ]},
];

// ── Note templates — real, widely-used note structures ──
const NOTE_TEMPLATES=[
  {cat:"Work",icon:"&#128221;",templates:[
    {title:"Meeting Notes",tags:["meeting"],desc:"Attendees, decisions, and action items captured in one pass.",
      content:"# {{Meeting Title}}\nDate: {{Date}}\nAttendees: {{Attendees}}\n\n## Agenda\n- {{Item}}\n- {{Item}}\n\n## Discussion\n{{Notes}}\n\n## Decisions\n- {{Decision}}\n\n## Action Items\n- [ ] {{Owner}} — {{Task}} (due {{Date}})\n\n## Follow-ups / Open Questions\n- {{Open question}}"},
    {title:"1:1 Notes",tags:["1on1","management"],desc:"Running structure for a recurring one-on-one.",
      content:"# 1:1 — {{Name}}\nDate: {{Date}}\n\n## Wins since last time\n- {{Win}}\n\n## What's on their mind\n- {{Topic}}\n\n## What's on my mind\n- {{Topic}}\n\n## Blockers / support needed\n- {{Blocker}}\n\n## Action items\n- [ ] {{Action}}\n\n## Carry-over for next time\n- {{Item}}"},
  ]},
  {cat:"Thinking",icon:"&#129504;",templates:[
    {title:"Decision Record",tags:["decision"],desc:"Lightweight ADR — capture the why, not just the what.",
      content:"# Decision: {{Title}}\nDate: {{Date}}\nStatus: {{Status:Proposed|Accepted|Superseded}}\n\n## Context\n{{What situation is forcing a decision?}}\n\n## Options considered\n1. {{Option}} — {{tradeoff}}\n2. {{Option}} — {{tradeoff}}\n\n## Decision\n{{What we chose}}\n\n## Why\n{{Rationale}}\n\n## Consequences\n- {{What this makes easier}}\n- {{What this makes harder}}"},
    {title:"Daily Log",tags:["journal","standup"],desc:"Fast end-of-day or standup capture.",
      content:"# {{Date}}\n\n## Done today\n- {{Item}}\n\n## In progress\n- {{Item}}\n\n## Blocked / waiting on\n- {{Item}}\n\n## Tomorrow\n- {{Item}}\n\n## Notes to self\n{{Anything worth remembering}}"},
  ]},
];

// ── Skill templates — correctly-structured SKILL.md scaffolds ──
const SKILL_TEMPLATES=[
  {cat:"Authoring",icon:"&#128296;",templates:[
    {title:"SKILL.md Scaffold",tags:["skill","scaffold"],desc:"Minimal, correctly-structured skill. The description is the part that matters — it controls triggering.",
      content:"---\nname: {{skill-name}}\ndescription: {{Lead with WHAT this does, then WHEN to use it. Trigger conditions matter most — name the specific phrases/situations that should fire it, AND what should NOT fire it.}}\n---\n\n# {{Skill Name}}\n\n## What this does\n{{One-paragraph summary of the capability.}}\n\n## When to use\n- {{Concrete trigger situation}}\n- {{Another}}\n\n## When NOT to use\n- {{Boundary case handled elsewhere}}\n\n## How to do it\n1. {{Step}}\n2. {{Step}}\n\n## Notes\n{{Gotchas, constraints, examples.}}"},
    {title:"Procedure Skill",tags:["skill","procedure"],desc:"For a repeatable multi-step task with a clear stop condition.",
      content:"---\nname: {{procedure-name}}\ndescription: {{What procedure this runs and the exact phrases/situations that should trigger it. Note what it does NOT cover.}}\n---\n\n# {{Procedure Name}}\n\n## Trigger\nRun this when: {{condition}}\n\n## Inputs needed\n- {{Input}}\n\n## Steps\n1. {{Action}} → {{expected result}}\n2. {{Action}}\n\n## Stop condition\nStop when: {{done state}}\n\n## If it goes wrong\n- {{Failure mode}} → {{recovery}}"},
  ]},
];

// ── Custom GPT templates — instruction-config scaffolds ──
const GPT_TEMPLATES=[
  {cat:"Config",icon:"&#129302;",templates:[
    {title:"Custom GPT Instructions",tags:["gpt","config"],desc:"A complete instruction block for a custom GPT — identity, behavior, guardrails, tone.",
      content:"# Identity\nYou are {{GPT Name}}, {{role/expertise}}. Your purpose is to {{primary objective}}.\n\n# How you behave\n- {{Default behavior, e.g. ask one clarifying question before long tasks}}\n- {{Style: concise / thorough / Socratic}}\n- Always {{key behavior, e.g. show your reasoning}}\n\n# Constraints\n- Never {{hard guardrail}}\n- If asked for {{out-of-scope request}}, {{what to do instead}}\n- If you're unsure, say so rather than guessing\n\n# Tone\n{{Tone description}}\n\n# Example interaction\nUser: {{example request}}\nYou: {{ideal response shape}}"},
  ]},
];

// ── Registry + per-silo metadata ──
const SILO_TEMPLATES={prompts:PROMPT_TEMPLATES,notes:NOTE_TEMPLATES,skills:SKILL_TEMPLATES,customgpts:GPT_TEMPLATES};
function templatesForSilo(silo){return SILO_TEMPLATES[silo]||null}
function siloHasTemplates(silo){const s=SILO_TEMPLATES[silo];return !!(s&&s.length)}
function tplSiloMeta(silo){
  switch(silo){
    case "notes":      return {store:NT,rootId:"nroot",label:"Note",labelPlural:"notes",aTab:"notes",color:"#7ab87a"};
    case "skills":     return {store:KL,rootId:"kroot",label:"Skill",labelPlural:"skills",aTab:"skills",color:"#6c8fd9"};
    case "customgpts": return {store:GP,rootId:"groot",label:"GPT",labelPlural:"custom GPTs",aTab:"customgpts",color:"#b07cd9"};
    default:           return {store:P,rootId:"root",label:"Prompt",labelPlural:"prompts",aTab:"prompts",color:"#d4a843"};
  }
}

function renderTemplateGallery(){
  const m=$("main");if(!m)return;
  const silo=(meta&&meta._tplSilo&&SILO_TEMPLATES[meta._tplSilo])?meta._tplSilo:"prompts";
  const SETS=SILO_TEMPLATES[silo];
  const sm=tplSiloMeta(silo);
  // selected category must belong to the current silo
  let selCat=meta?._tplCat||"";
  if(selCat&&!SETS.find(c=>c.cat===selCat))selCat="";

  let h=`<div class="tpl-gallery">`;
  h+=`<div class="tpl-header"><span style="font-size:14px">&#128218;</span><div><div class="tpl-title">${esc(sm.label)} Templates</div><div class="tpl-subtitle">Curated ${esc(sm.labelPlural)} — click to preview, import to your vault</div></div></div>`;

  h+=`<div class="tpl-cats"><span class="tpl-cat ${!selCat?'active':''}" data-tpl-cat="">All</span>`;
  SETS.forEach(c=>{
    h+=`<span class="tpl-cat ${selCat===c.cat?'active':''}" data-tpl-cat="${esc(c.cat)}">${c.icon} ${c.cat}</span>`;
  });
  h+=`</div>`;

  h+=`<div class="tpl-grid">`;
  SETS.forEach(c=>{
    if(selCat&&c.cat!==selCat)return;
    c.templates.forEach((t,ti)=>{
      const preview=(t.content||"").slice(0,120).replace(/\n/g," ");
      h+=`<div class="tpl-card" data-tpl-cat="${esc(c.cat)}" data-tpl-idx="${ti}">`;
      h+=`<div class="tpl-card-hdr"><span class="tpl-card-icon">${c.icon}</span><span class="tpl-card-title">${esc(t.title)}</span><div class="tpl-card-tags">${(t.tags||[]).map(tg=>`<span class="tpl-card-tag">${esc(tg)}</span>`).join("")}</div></div>`;
      h+=`<div class="tpl-card-desc">${esc(t.desc)}</div>`;
      h+=`<div class="tpl-card-preview">${esc(preview)}...</div>`;
      h+=`<div class="tpl-card-acts"><button class="bs" data-tpl-preview="${esc(c.cat)}|${ti}">Preview</button><button class="bp" data-tpl-import="${esc(c.cat)}|${ti}">${S.inbox} Import</button></div>`;
      h+=`</div>`;
    });
  });
  h+=`</div>`;

  h+=`<div class="tpl-import-all"><button class="bp" id="tplImportAll">${S.inbox} Import All ${esc(sm.label)} Templates</button></div>`;
  h+=`</div>`;

  m.innerHTML=h;

  m.querySelectorAll("[data-tpl-cat]").forEach(el=>{
    if(el.classList.contains("tpl-cat")){
      el.addEventListener("click",()=>{
        meta._tplCat=el.dataset.tplCat;
        renderTemplateGallery();
      });
    }
  });

  const openTplPreview=(cat,idx)=>{
    const c=SETS.find(x=>x.cat===cat);
    const t=c?.templates?.[+idx];if(!t)return;
    showModal(`<h3>${esc(t.title)}</h3><p style="font-size:10px;color:var(--dm)">${esc(t.desc)}</p><div class="share-preview">${esc(t.content)}</div><div style="font-size:9px;color:var(--dm);margin-bottom:6px">Tags: ${(t.tags||[]).join(", ")}</div><div class="brow"><button class="bg-btn" id="tpX">Close</button><button class="bp" id="tpImp">${S.inbox} Import to Vault</button></div>`,mc=>{
      mc.querySelector("#tpX").addEventListener("click",closeModal);
      mc.querySelector("#tpImp").addEventListener("click",()=>{closeModal();importTemplate(cat,+idx)});
    });
  };
  m.querySelectorAll("[data-tpl-preview]").forEach(btn=>{
    btn.addEventListener("click",e=>{
      e.stopPropagation();
      const[cat,idx]=btn.dataset.tplPreview.split("|");
      openTplPreview(cat,+idx);
    });
  });
  // The whole card previews on click — buttons inside keep their own actions.
  m.querySelectorAll(".tpl-card").forEach(card=>{
    card.addEventListener("click",e=>{
      if(e.target.closest("button"))return;
      openTplPreview(card.dataset.tplCat,+card.dataset.tplIdx);
    });
  });

  m.querySelectorAll("[data-tpl-import]").forEach(btn=>{
    btn.addEventListener("click",e=>{
      e.stopPropagation();
      const[cat,idx]=btn.dataset.tplImport.split("|");
      importTemplate(cat,+idx);
    });
  });

  $("tplImportAll")?.addEventListener("click",()=>{
    const total=SETS.reduce((s,c)=>s+c.templates.length,0);
    showModal(`<h3>Import All ${esc(sm.label)} Templates</h3><p style="font-size:10px;color:var(--mu)">This will create a "Templates" folder in your ${esc(sm.label)}s tab with ${total} curated ${esc(sm.labelPlural)}. Existing items are not affected.</p><div class="brow"><button class="bg-btn" id="iaX">Cancel</button><button class="bp" id="iaY">Import All</button></div>`,mc=>{
      mc.querySelector("#iaX").addEventListener("click",closeModal);
      mc.querySelector("#iaY").addEventListener("click",()=>{
        closeModal();importAllTemplates();
      });
    });
  });
}

function importTemplate(catName,idx){
  const silo=(meta&&meta._tplSilo&&SILO_TEMPLATES[meta._tplSilo])?meta._tplSilo:"prompts";
  const SETS=SILO_TEMPLATES[silo],sm=tplSiloMeta(silo);
  const c=SETS.find(x=>x.cat===catName);
  const t=c?.templates?.[idx];if(!t)return;
  pushUndo();
  const f=findFolder(sm.store.folders,sm.rootId);
  if(!f){flash("Error");return}
  let tplFolder=f.children.find(ch=>ch.name==="Templates");
  if(!tplFolder){
    const id=generateId(sm.store);
    tplFolder={id,name:"Templates",children:[],prompts:[],color:sm.color};
    f.children.push(tplFolder);
  }
  const dup=tplFolder.prompts.find(p=>p.title===t.title);
  if(dup){flash("Already imported: "+t.title);return}
  const item=buildItem(sm.store,t.title,t.content,t.tags||[]);
  if(silo==="prompts"||silo==="customgpts")item.platform="";
  if(silo==="skills"){const ym=(typeof parseSkillYaml==="function")?parseSkillYaml(t.content):null;if(ym&&ym.description)item.description=ym.description;item.files=item.files||{}}
  tplFolder.prompts.push(item);
  save();
  flash("OK Imported: "+t.title);
}

function importAllTemplates(){
  const silo=(meta&&meta._tplSilo&&SILO_TEMPLATES[meta._tplSilo])?meta._tplSilo:"prompts";
  const SETS=SILO_TEMPLATES[silo],sm=tplSiloMeta(silo);
  pushUndo();
  const root=findFolder(sm.store.folders,sm.rootId);
  if(!root){flash("Error");return}
  let tplFolder=root.children.find(ch=>ch.name==="Templates");
  if(!tplFolder){
    const id=generateId(sm.store);
    tplFolder={id,name:"Templates",children:[],prompts:[],color:sm.color};
    root.children.push(tplFolder);
  }
  let count=0;
  SETS.forEach(c=>{
    let catFolder=tplFolder.children.find(ch=>ch.name===c.cat);
    if(!catFolder){
      const id=generateId(sm.store);
      catFolder={id,name:c.cat,children:[],prompts:[],color:""};
      tplFolder.children.push(catFolder);
    }
    c.templates.forEach(t=>{
      const dup=catFolder.prompts.find(p=>p.title===t.title);
      if(dup)return;
      const item=buildItem(sm.store,t.title,t.content,t.tags||[]);
      if(silo==="prompts"||silo==="customgpts")item.platform="";
      if(silo==="skills"){const ym=(typeof parseSkillYaml==="function")?parseSkillYaml(t.content):null;if(ym&&ym.description)item.description=ym.description;item.files=item.files||{}}
      catFolder.prompts.push(item);
      count++;
    });
  });
  save();
  flash(`OK Imported ${count} templates`);
  aTab=sm.aTab;st().sel=tplFolder.id;st().exp[tplFolder.id]=1;render();
}

// ═══════ DATA VALIDATION ═══════
function validateStore(store,rootId,name){
  let fixed=false;
  if(!store||typeof store!=="object"){console.warn("Vault: "+name+" missing, recreating");return{store:mkDef(rootId,name),fixed:true}}
  if(!store.folders||typeof store.folders!=="object"||store.folders.id!==rootId){console.warn("Vault: "+name+" root broken, recreating");return{store:mkDef(rootId,name),fixed:true}}
  // Walk tree and fix missing arrays
  function fixNode(n){
    if(!Array.isArray(n.children)){n.children=[];fixed=true}
    if(!Array.isArray(n.prompts)){n.prompts=[];fixed=true}
    if(typeof n.id!=="string"){n.id=rootId+"_fix_"+Date.now();fixed=true}
    if(typeof n.name!=="string"){n.name="Unnamed";fixed=true}
    const safeColor=safeUiColor(n.color||"");
    if((n.color||"")!==safeColor){n.color=safeColor;fixed=true}
    // Validate each item
    n.prompts=n.prompts.filter(p=>{
      if(!p||typeof p!=="object"||typeof p.id!=="string"){fixed=true;return false}
      if(typeof p.title!=="string"){p.title="Untitled";fixed=true}
      if(typeof p.content!=="string"&&!p.url){p.content="";fixed=true}
      return true;
    });
    const before=n.children.length;
    n.children=n.children.filter(ch=>ch&&typeof ch==="object");
    if(n.children.length!==before)fixed=true;
    n.children.forEach(fixNode);
  }
  fixNode(store.folders);
  if(!Array.isArray(store.trash)){store.trash=[];fixed=true}
  if(!Array.isArray(store.collections)){store.collections=[];fixed=true}
  if(sanitizeCollections(store))fixed=true;
  if(typeof store.nextId!=="number"||store.nextId<1){
    // Recompute from max existing ID to prevent collisions
    let maxId=0;
    allItems(store.folders).forEach(p=>{
      const m=p.id?.match(/^i_(\d+)$/);
      if(m)maxId=Math.max(maxId,parseInt(m[1],10));
    });
    store.nextId=maxId+1;
    fixed=true;
  }else{
    // Even if nextId exists, ensure it's above all existing IDs
    let maxId=0;
    allItems(store.folders).forEach(p=>{
      const m=p.id?.match(/^i_(\d+)$/);
      if(m)maxId=Math.max(maxId,parseInt(m[1],10));
    });
    if(store.nextId<=maxId){store.nextId=maxId+1;fixed=true}
  }
  return{store,fixed};
}
function validateAll(persist=true){
  let anyFixed=false;
  const stores=[[P,"root","My Prompts"],[IP,"iroot","My Image Prompts"],[SN,"sroot","My Snippets"],[BM,"broot","My Bookmarks"],[NT,"nroot","My Notes"],[KL,"kroot","My Skills"],[GP,"groot","My Custom GPTs"],[PH,"phroot","My Photos"],[LS,"lroot","My Lists & Tasks"],[PRJ,"projroot","My Projects"],[CH,"chroot","My Chats"]];
  const results=stores.map(([s,id,name])=>validateStore(s,id,name));
  P=results[0].store;IP=results[1].store;SN=results[2].store;BM=results[3].store;NT=results[4].store;KL=results[5].store;GP=results[6].store;PH=results[7].store;LS=results[8].store;PRJ=results[9].store;CH=results[10].store;
  anyFixed=results.some(r=>r.fixed);
  if(sanitizeConfigColors())anyFixed=true;
  if(pruneSectionPanels())anyFixed=true;
  // Validate skills have files object
  allItems(KL.folders).forEach(p=>{if(p.files&&typeof p.files!=="object"){p.files={};anyFixed=true}});
  // Detect corrupted skills (binary garbage from bad imports)
  allItems(KL.folders).forEach(p=>{
    if(p.content&&typeof p.content==="string"&&p.content.length>50){
      // Check for high concentration of non-printable characters (binary data)
      const sample=p.content.slice(0,200);
      let nonPrint=0;
      for(let i=0;i<sample.length;i++){const c=sample.charCodeAt(i);if(c<32&&c!==10&&c!==13&&c!==9)nonPrint++}
      if(nonPrint/sample.length>0.15){console.warn("Vault: corrupted skill detected:",p.title,"(id:",p.id,") — binary content, needs reimport");p._corrupted=true;anyFixed=true}
    }
  });
  if(anyFixed){console.warn("Vault: data validation repaired issues");if(persist)save()}
  return anyFixed;
}


// ═══════ BATCH TEMPLATE IMPORT — fill-in file → collated into silos ═══════
// Round trip: Import → "Download blank template" → user (or their AI) fills it
// out → Import → drop/paste the file → preview → items land in the right silo.

const PV_BATCH_HEADER = "# Prompt Vault Batch Import";

// type aliases → silo key ("project"/"chat" are legacy concepts that live in Bookmarks)
const PV_BATCH_TYPES = {
  prompt: "prompts", prompts: "prompts",
  image: "imgprompts", images: "imgprompts", img: "imgprompts", imgprompt: "imgprompts", "image-prompt": "imgprompts",
  clip: "snippets", clips: "snippets", snippet: "snippets", snippets: "snippets",
  note: "notes", notes: "notes",
  skill: "skills", skills: "skills",
  bookmark: "bookmarks", bookmarks: "bookmarks", link: "bookmarks",
  gpt: "customgpts", gpts: "customgpts", customgpt: "customgpts", "custom-gpt": "customgpts",
  photo: "photos", photos: "photos", picture: "photos",
  project: "bookmarks", projects: "bookmarks",
  chat: "bookmarks", chats: "bookmarks",
};
const PV_BATCH_SILO_LABEL = { prompts: "Prompts", imgprompts: "Image Prompts", snippets: "Clips", notes: "Notes", skills: "Skills", bookmarks: "Bookmarks", customgpts: "Custom GPTs", photos: "Photos" };

function generateBatchTemplate() {
  return `${PV_BATCH_HEADER}
#
# HOW THIS WORKS
# 1. Each record starts with a type line, e.g.:  --- prompt ---
#    Types: prompt, image, clip, note, skill, bookmark, gpt, photo, project, chat
# 2. Then optional field lines (any order):
#      title:    name of the item
#      tags:     comma, separated
#      folder:   folder to file it under (created if missing)
#      platform: claude | chatgpt | gemini | grok | midjourney | ...
#      url:      link (bookmarks, gpts, projects)
# 3. Everything after "content:" is the body, until the next --- type --- line.
# 4. Import this file back via Import (top bar) -> Choose files, or paste it.
#
# TIP: paste this whole file into an AI along with your raw material and ask
# it to convert your stuff into records in this exact format.
#
# The "Example" records below are skipped on import unless you rename them.

--- prompt ---
title: Example - weekly status
tags: work, example
folder: Examples
platform: claude
content:
Summarize the following notes into a crisp weekly status update.
Keep it under 200 words:

{{notes}}

--- image ---
title: Example - neon noir alley
tags: example
platform: midjourney
content:
rain-slicked alleyway at night, neon signs reflecting in puddles, cinematic

--- clip ---
title: Example - something an AI said
tags: example
content:
Paste the response text you want to keep here.

--- note ---
title: Example note
content:
Anything you want to remember.

--- skill ---
title: Example skill
content:
---
name: example-skill
description: One line on what this skill does
---
Instructions for the skill go here (SKILL.md format).

--- bookmark ---
title: Example bookmark
url: https://example.com
tags: docs, example

--- gpt ---
title: Example custom GPT
url: https://chatgpt.com/g/g-example
content:
One line on what this GPT is good at.

--- project ---
title: Example project link
url: https://example.com/project
content:
Project records are filed into Bookmarks under a "Projects" folder.

--- photo ---
title: Example photo
url: https://example.com/image.jpg
tags: reference
content:
Photo records save the image URL; open it in the Photos tab and hit
Re-fetch to pull the actual bytes into your collection.
`;
}

function downloadBatchTemplate() {
  const blob = new Blob([generateBatchTemplate()], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "prompt-vault-batch-template.md"; a.click();
  URL.revokeObjectURL(url);
  flash("Template downloaded");
}

function isBatchTemplate(text) {
  const t = (text || "").slice(0, 4000);
  return t.includes(PV_BATCH_HEADER) || /^---\s*(prompt|image|img|imgprompt|clip|snippet|note|skill|bookmark|link|gpt|customgpt|project|chat|photo|picture)s?\s*---\s*$/im.test(t);
}

/** Parse a filled template → {records:[{silo,type,title,tags,folder,platform,url,content,isExample}],errors:[]} */
function parseBatchTemplate(text) {
  const lines = (text || "").replace(/\r\n/g, "\n").split("\n");
  const records = [], errors = [];
  let cur = null, inContent = false;
  const typeRe = /^---\s*([a-zA-Z-]+)\s*---\s*$/;
  const fieldRe = /^(title|tags|folder|platform|url|link)\s*:\s*(.*)$/i;
  const push = () => {
    if (!cur) return;
    cur.content = cur.content.join("\n").replace(/^\n+|\n+$/g, "");
    if (!cur.title && !cur.content && !cur.url) return; // fully blank record — ignore
    if (!cur.title) cur.title = (cur.content.split("\n")[0] || "Untitled").slice(0, 80);
    cur.isExample = /^example\b/i.test(cur.title);
    records.push(cur);
  };
  for (const raw of lines) {
    const tm = raw.match(typeRe);
    if (tm) {
      const key = tm[1].toLowerCase();
      const silo = PV_BATCH_TYPES[key];
      if (silo) {
        push();
        cur = { silo, type: key, title: "", tags: [], folder: "", platform: "", url: "", content: [] };
        // legacy concepts get a home folder unless the record names one
        if (key.startsWith("project")) cur.folder = "Projects";
        if (key.startsWith("chat")) cur.folder = "Chats";
        inContent = false;
        continue;
      }
      if (cur && inContent) { cur.content.push(raw); continue; }
      errors.push(`Unknown type "${tm[1]}" — record skipped`);
      push(); cur = null; inContent = false;
      continue;
    }
    if (!cur) continue; // preamble / comments before first record
    if (!inContent) {
      if (!raw.trim()) continue;
      if (/^content\s*:\s*$/i.test(raw)) { inContent = true; continue; }
      const cm = raw.match(/^content\s*:\s*(.+)$/i);
      if (cm) { inContent = true; cur.content.push(cm[1]); continue; }
      const fm = raw.match(fieldRe);
      if (fm) {
        const k = fm[1].toLowerCase(), v = fm[2].trim();
        if (k === "title") cur.title = v;
        else if (k === "tags") cur.tags = v.split(",").map(x => x.trim()).filter(Boolean);
        else if (k === "folder") cur.folder = v;
        else if (k === "platform") cur.platform = v;
        else cur.url = v; // url | link
        continue;
      }
      // not a field line — treat as the start of content (forgiving)
      inContent = true; cur.content.push(raw);
    } else {
      cur.content.push(raw);
    }
  }
  push();
  return { records, errors };
}

/** "claude" / "ChatGPT" / "openai" → platform id from cfg.platforms */
function resolveBatchPlatform(s) {
  const q = (s || "").trim().toLowerCase();
  if (!q) return "";
  const plats = (cfg?.platforms || DEFAULT_PLATFORMS);
  const hit = plats.find(p => p.id === q) ||
    plats.find(p => p.name.toLowerCase().split(/[\s/]+/).includes(q)) ||
    plats.find(p => p.name.toLowerCase().includes(q));
  return hit ? hit.id : "";
}

function batchFindOrCreateFolder(d, name) {
  if (!name) return d.folders;
  const want = name.trim().toLowerCase();
  let found = null;
  (function walk(n) { if (found) return; if ((n.name || "").trim().toLowerCase() === want) { found = n; return; } (n.children || []).forEach(walk); })(d.folders);
  if (found) return found;
  const nf = { id: generateId(d), name: name.trim(), children: [], prompts: [], color: "" };
  d.folders.children = d.folders.children || [];
  d.folders.children.push(nf);
  return nf;
}

const _BATCH_SILO_DATA = { prompts: () => P, imgprompts: () => IP, snippets: () => SN, notes: () => NT, skills: () => KL, bookmarks: () => BM, customgpts: () => GP, photos: () => PH };

/** Import selected records. Returns {count, bySilo} */
function importBatchRecords(records) {
  pushUndo();
  const bySilo = {};
  for (const r of records) {
    const d = _BATCH_SILO_DATA[r.silo]?.();
    if (!d) continue;
    const f = batchFindOrCreateFolder(d, r.folder);
    const item = {
      id: generateId(d), title: r.title || "Untitled", content: r.content || "",
      tags: r.tags || [], url: r.url || "", created: Date.now(), modified: Date.now(),
      favorited: false, usageCount: 0, versions: [],
    };
    const plat = resolveBatchPlatform(r.platform);
    if (r.silo === "prompts") { item.platform = plat; item.nextId = ""; item.injectIntent = "user"; item.goal = ""; }
    if (r.silo === "imgprompts") item.platform = plat || "midjourney";
    if (r.silo === "skills") {
      item.files = {};
      const ym = typeof parseSkillYaml === "function" ? parseSkillYaml(item.content) : {};
      if (ym.description) item.description = ym.description;
    }
    f.prompts = f.prompts || [];
    f.prompts.push(item);
    bySilo[r.silo] = (bySilo[r.silo] || 0) + 1;
  }
  save();
  return { count: records.length, bySilo };
}

/** Preview modal: per-record checkboxes (examples unticked), then import. */
function showBatchPreview(parsed) {
  const recs = parsed.records;
  if (!recs.length) { flash("No records found in template"); return; }
  const rows = recs.map((r, i) => `<label class="fpi" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-bri="${i}" ${r.isExample ? "" : "checked"}><span style="color:var(--tab-ac)">${esc(PV_BATCH_SILO_LABEL[r.silo] || r.silo)}</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.title)}</span>${r.folder ? `<span style="font-size:8px;color:var(--dm)">${S.folder} ${esc(r.folder)}</span>` : ""}${r.isExample ? '<span style="font-size:8px;color:var(--dm)">example</span>' : ""}</label>`).join("");
  const errs = parsed.errors.length ? `<div style="font-size:9px;color:var(--dn);margin-top:4px">${parsed.errors.map(e => esc(e)).join("<br>")}</div>` : "";
  showModal(`<h3>Batch import — ${recs.length} record${recs.length !== 1 ? "s" : ""}</h3>
    <p style="font-size:10px;color:var(--mu)">Each record goes to its own silo. Untick anything you don't want.</p>
    <div style="max-height:240px;overflow-y:auto;margin:6px 0">${rows}</div>${errs}
    <div class="brow"><button class="bg-btn" id="bpX">Cancel</button><button class="bp" id="bpY">Import selected</button></div>`, mc => {
    mc.querySelector("#bpX").addEventListener("click", closeModal);
    mc.querySelector("#bpY").addEventListener("click", () => {
      const sel = [...mc.querySelectorAll("[data-bri]:checked")].map(cb => recs[+cb.dataset.bri]);
      if (!sel.length) { flash("Nothing selected"); return; }
      closeModal();
      const res = importBatchRecords(sel);
      const parts = Object.entries(res.bySilo).map(([s, n]) => `${n} ${PV_BATCH_SILO_LABEL[s] || s}`).join(", ");
      flash(`OK Imported: ${parts}`);
      render();
    });
  });
}

// ═══════ BOOKMARKS-ONLY BACKUP / RESTORE ═══════
const PV_BOOKMARKS_FORMAT="prompt-vault-bookmarks";
const PV_BOOKMARKS_SAFETY_KEY="pv_bookmarks_restore_snapshot";

function pvBookmarksFromPayload(payload){
  const valid=s=>s&&s.folders&&typeof s.folders==="object";
  if(payload?._format===PV_BOOKMARKS_FORMAT&&valid(payload.bookmarks))return payload.bookmarks;
  if(valid(payload?.bookmarks))return payload.bookmarks; // whole-vault backup: use only its bookmark slice
  if(valid(payload))return payload; // legacy bookmarks-only JSON exported before the wrapper existed
  return null;
}
function pvBookmarkSummary(store){
  let items=0,folders=0;
  (function walk(n,root){if(!root)folders++;items+=(n?.prompts||[]).length;(n?.children||[]).forEach(ch=>walk(ch,false))})(store?.folders,true);
  return{items,folders,collections:(store?.collections||[]).length,panels:(store?.sectionPanels||[]).length};
}
function pvPrepareBookmarkStore(raw){
  if(!raw?.folders||typeof raw.folders!=="object")throw new Error("No bookmark folder tree found");
  const store=deepClone(raw),seen=new Set();let next=Math.max(1,Number(store.nextId)||1);
  const fresh=()=>{let id;do{id="i_"+(next++)}while(seen.has(id));seen.add(id);return id};
  function walk(n,isRoot){
    if(!n||typeof n!=="object")throw new Error("Invalid folder in backup");
    n.id=isRoot?"broot":((typeof n.id==="string"&&!seen.has(n.id))?(seen.add(n.id),n.id):fresh());
    n.name=typeof n.name==="string"?n.name:(isRoot?"My Bookmarks":"Imported Folder");
    n.color=typeof n.color==="string"?n.color:"";
    n.children=Array.isArray(n.children)?n.children:[];n.prompts=Array.isArray(n.prompts)?n.prompts:[];
    n.prompts=n.prompts.filter(p=>p&&typeof p==="object").map(p=>{p.id=(typeof p.id==="string"&&!seen.has(p.id))?(seen.add(p.id),p.id):fresh();p.title=String(p.title||p.name||p.url||"Untitled bookmark");p.content=String(p.content||"");p.url=String(p.url||"");p.tags=Array.isArray(p.tags)?p.tags:[];return p});
    n.children.forEach(ch=>walk(ch,false));
  }
  seen.add("broot");walk(store.folders,true);store.nextId=next;store.trash=Array.isArray(store.trash)?store.trash:[];store.collections=Array.isArray(store.collections)?store.collections:[];store.sectionPanels=Array.isArray(store.sectionPanels)?store.sectionPanels:[];
  return store;
}
function pvBookmarkIdentity(item){
  const url=(item?.url||"").trim().toLowerCase().replace(/\/$/,"");
  return url?"u:"+url:"t:"+String(item?.title||"").trim().toLowerCase()+"\u0000"+String(item?.content||"").trim().toLowerCase();
}
function pvMergeBookmarkStore(incoming){
  const idMap=new Map();let added=0,skipped=0,folders=0;
  function mergeNode(target,source){
    target.prompts=target.prompts||[];target.children=target.children||[];
    const identities=new Map(target.prompts.map(p=>[pvBookmarkIdentity(p),p.id]));
    for(const raw of(source.prompts||[])){
      const key=pvBookmarkIdentity(raw),existing=identities.get(key);
      if(existing){idMap.set(raw.id,existing);skipped++;continue}
      const item=deepClone(raw);item.id=generateId(BM);target.prompts.push(item);identities.set(key,item.id);idMap.set(raw.id,item.id);added++;
    }
    for(const srcChild of(source.children||[])){
      let dst=target.children.find(ch=>(ch.name||"").trim().toLowerCase()===(srcChild.name||"").trim().toLowerCase());
      if(!dst){dst={id:generateId(BM),name:srcChild.name||"Imported Folder",color:srcChild.color||"",children:[],prompts:[]};target.children.push(dst);folders++}
      mergeNode(dst,srcChild);
    }
  }
  mergeNode(BM.folders,incoming.folders);
  BM.collections=BM.collections||[];
  for(const src of(incoming.collections||[])){
    let dst=BM.collections.find(c=>(c.name||"").trim().toLowerCase()===(src.name||"").trim().toLowerCase());
    if(!dst){dst={id:newCollId(),name:src.name||"Imported Collection",color:src.color||"",items:[]};BM.collections.push(dst)}
    dst.items=[...new Set([...(dst.items||[]),...(src.items||[]).map(id=>idMap.get(id)).filter(Boolean)])];
  }
  return{added,skipped,folders};
}
async function pvBookmarkSafetySnapshot(mode,fileName){
  pushUndo();
  const snap={_format:"prompt-vault-bookmarks-safety",_version:1,createdAt:new Date().toISOString(),mode,fileName:fileName||"",bookmarks:deepClone(BM)};
  await chrome.storage.local.set({[PV_BOOKMARKS_SAFETY_KEY]:snap});
  meta.bookmarksSafetySnapshotAt=Date.now();meta.bookmarksSafetySnapshotMode=mode;chrome.storage.local.set({[MK]:meta});
}
async function pvRestoreBookmarkSafetySnapshot(){
  const res=await chrome.storage.local.get([PV_BOOKMARKS_SAFETY_KEY]),snap=res[PV_BOOKMARKS_SAFETY_KEY];
  if(!snap?.bookmarks){flash("No bookmarks safety snapshot found");return}
  pushUndo();BM=pvPrepareBookmarkStore(snap.bookmarks);sanitizeBookmarkUiState();save();closeModal();aTab="bookmarks";bSt.sel="broot";bSt.exp={broot:1};flash("Bookmarks safety snapshot restored");render();
}
function showBookmarksRestoreFromParsed(payload,fileName){
    let store;
    try{store=pvPrepareBookmarkStore(pvBookmarksFromPayload(payload))}catch(e){flash("Bookmark backup not recognized: "+e.message);return}
    const cur=pvBookmarkSummary(BM),inc=pvBookmarkSummary(store);
    showModal(`<h3>Restore / Import Bookmarks Backup</h3><p style="font-size:10px;color:var(--mu)">${esc(fileName||"selected backup")}</p>
      <div class="rc-diff"><div class="rc-diff-row rc-diff-h"><span></span><span>Current</span><span>Backup</span><span></span></div><div class="rc-diff-row"><span>Bookmarks</span><span>${cur.items}</span><span>${inc.items}</span><span></span></div><div class="rc-diff-row"><span>Folders</span><span>${cur.folders}</span><span>${inc.folders}</span><span></span></div><div class="rc-diff-row"><span>Collections</span><span>${cur.collections}</span><span>${inc.collections}</span><span></span></div></div>
      <p style="font-size:9px;color:var(--dm)"><strong>Merge</strong> adds folders/bookmarks and skips duplicate URLs; existing bookmarks remain. <strong>Replace</strong> restores the backup's bookmark tree, collections, and panels. Both create a durable safety snapshot plus normal Undo before changing anything.</p>
      <div class="brow"><button class="bg-btn" id="bmrX">Cancel</button>${meta.bookmarksSafetySnapshotAt?`<button class="bs" id="bmrSafety" title="Restore Bookmarks to the state before the last Merge/Replace">Restore Safety Snapshot</button>`:""}<button class="bs" id="bmrMerge">Merge into Bookmarks</button><button class="bdn" id="bmrReplace">Replace Bookmarks</button></div>`,mc=>{
      mc.querySelector("#bmrX").addEventListener("click",closeModal);
      mc.querySelector("#bmrSafety")?.addEventListener("click",pvRestoreBookmarkSafetySnapshot);
      mc.querySelector("#bmrMerge").addEventListener("click",async()=>{await pvBookmarkSafetySnapshot("merge",fileName);const result=pvMergeBookmarkStore(store);save();closeModal();aTab="bookmarks";bSt.sel="broot";flash(`Merged ${result.added} bookmarks · ${result.skipped} duplicates skipped`);render()});
      mc.querySelector("#bmrReplace").addEventListener("click",()=>showModal(`<h3 style="color:var(--dn)">Replace all Bookmarks?</h3><p>Only the Bookmarks section will be replaced. Prompts, Clips, Notes, Skills, Photos, and other sections stay unchanged.</p><div class="brow"><button class="bg-btn" id="bmrRX">Cancel</button><button class="bdn" id="bmrRY">Replace Bookmarks</button></div>`,mx=>{mx.querySelector("#bmrRX").addEventListener("click",closeModal);mx.querySelector("#bmrRY").addEventListener("click",async()=>{await pvBookmarkSafetySnapshot("replace",fileName);BM=store;sanitizeBookmarkUiState();save();closeModal();aTab="bookmarks";bSt.sel="broot";bSt.exp={broot:1};flash(`Restored ${inc.items} bookmarks from backup`);render()})}));
    });
}
function openBookmarksBackupImport(){
  const input=document.createElement("input");input.type="file";input.accept=".json,application/json";
  input.addEventListener("change",async()=>{
    const file=input.files?.[0];if(!file)return;
    try{const text=await file.text();const payload=typeof pvParseLenientJson==="function"?pvParseLenientJson(text):JSON.parse(text);showBookmarksRestoreFromParsed(payload,file.name)}
    catch(e){flash("Bookmark backup not recognized: "+e.message)}
  });
  input.click();
}

// ═══════ FEATURE: SMART IMPORT WIZARD ═══════

// ── Format parsers — each returns {format:string, items:[{title,content,tags?,description?,url?,platform?}]} ──

// Import only configuration the user explicitly supplies. This intentionally does
// not reach into a ChatGPT account or browser session. There is no credential,
// cookie, or private-page discovery path in Prompt Vault.
function pvCustomGptConfigItems(value){
  const wrappers=["customgpts","custom_gpts","customGPTs","gpts"];
  let rows=value;
  if(value&&!Array.isArray(value)&&typeof value==="object"){
    const wrapped=wrappers.map(k=>value[k]).find(Array.isArray);
    if(wrapped)rows=wrapped;
    else if(Array.isArray(value.items)&&value.items.some(p=>p?.instructions||p?.conversation_starters||p?.capabilities))rows=value.items;
    else rows=[value];
  }
  if(!Array.isArray(rows))return[];
  return rows.filter(p=>p&&typeof p==="object"&&(p.instructions||p.conversation_starters||p.conversationStarters||p.capabilities||p.actions||p.knowledge_files||p.knowledgeFiles||p.gizmo?.instructions)).map((p,i)=>{
    const g=p.gizmo&&typeof p.gizmo==="object"?{...p,...p.gizmo}:p;
    const instructions=g.instructions||g.prompt||g.system_prompt||g.systemPrompt||"";
    const starters=g.conversation_starters||g.conversationStarters||g.prompt_starters||[];
    const capabilities=g.capabilities||g.tools||null;
    const actions=g.actions||g.action_schemas||g.actionSchemas||null;
    const knowledge=g.knowledge_files||g.knowledgeFiles||g.files||null;
    const sections=[];
    if(instructions)sections.push(String(instructions));
    if(Array.isArray(starters)&&starters.length)sections.push("## Conversation starters\n"+starters.map(x=>"- "+String(typeof x==="string"?x:(x?.text||x?.prompt||JSON.stringify(x)))).join("\n"));
    if(capabilities)sections.push("## Capabilities\n```json\n"+JSON.stringify(capabilities,null,2)+"\n```");
    if(actions)sections.push("## Actions\n```json\n"+JSON.stringify(actions,null,2)+"\n```");
    if(knowledge)sections.push("## Knowledge files\n```json\n"+JSON.stringify(knowledge,null,2)+"\n```");
    return{title:g.name||g.title||g.display_name||`Custom GPT ${i+1}`,content:sections.join("\n\n"),description:g.description||g.short_description||"",url:g.url||g.share_url||g.shareUrl||"",tags:["custom-gpt-import"],_store:"customgpts",_sourceKind:"user-supplied-config"};
  });
}

function parseImportFile(text,fileName){
  const ext=(fileName||"").split(".").pop().toLowerCase();

  // Try JSON first (tolerant: fences, BOM, comments, trailing commas, prose)
  if(ext==="json"||(typeof pvLooksLikeJson==="function"?pvLooksLikeJson(text):(text.trim().startsWith("{")||text.trim().startsWith("[")))){
    try{
      const j=typeof pvParseLenientJson==="function"?pvParseLenientJson(text):JSON.parse(text);
      // Prompt Vault full backup (has .prompts.folders structure)
      const valid=d=>(d&&d.folders&&typeof d.folders.id==="string");
      const bookmarkStore=pvBookmarksFromPayload(j);
      if(bookmarkStore&&(j?._format===PV_BOOKMARKS_FORMAT||valid(j)||(!j.prompts&&!j.snippets&&valid(j.bookmarks)))){
        return{format:"Prompt Vault Bookmarks Backup",isBookmarksBackup:true,data:j,items:extractPVItems({bookmarks:bookmarkStore})}
      }
      if(j.prompts&&j.snippets&&valid(j.prompts)){
        return{format:"Prompt Vault Backup",isFullBackup:true,data:j,items:extractPVItems(j)}
      }
      // Prompt Vault archive
      if(j.items&&j.version&&j.totalItems){
        const items=Object.values(j.items).map(i=>({title:i.title,content:i.content||"",tags:i.tags||[],description:i.description||"",url:i.url||"",platform:i.platform||"",sourceUrl:i.sourceUrl||"",_store:i.store||"prompts",_id:i.id}));
        return{format:"Prompt Vault Archive",items}
      }
      const customGptItems=pvCustomGptConfigItems(j);
      if(customGptItems.length)return{format:"Custom GPT configuration",items:customGptItems};
      // TypingMind format: {prompts:[{name,content,description}]}
      if(j.prompts&&Array.isArray(j.prompts)&&j.prompts[0]?.name){
        const items=j.prompts.map(p=>({title:p.name||p.title||"Untitled",content:p.content||p.prompt||"",tags:p.tags||[],description:p.description||""}));
        return{format:"TypingMind",items}
      }
      // ChatGPT export: array of conversations [{title, mapping:{...}}]
      if(Array.isArray(j)&&j[0]?.mapping&&j[0]?.title){
        const items=j.map(conv=>{
          // Extract assistant messages as the "content"
          const msgs=Object.values(conv.mapping||{}).filter(m=>m.message?.author?.role==="assistant").map(m=>(m.message?.content?.parts||[]).join("\n")).filter(Boolean);
          return{title:conv.title||"Untitled",content:msgs.join("\n\n---\n\n"),tags:["chatgpt-import"],description:`${msgs.length} messages`}
        }).filter(i=>i.content.trim());
        return{format:"ChatGPT Export",items}
      }
      // Prompt list — a bare array or a {prompts|items|data:[…]} wrapper (incl. our
      // own JSON export). Route through the forgiving spreadsheet upsert so JSON
      // gets folders, update-by-id, version history, no-delete, and a preview.
      if(typeof pvJsonPromptArray==="function"&&typeof pvJsonPromptToSheetItem==="function"){
        const arr=pvJsonPromptArray(j);
        const explicitlyRouted=arr&&arr.some(p=>p&&(p._store||p.store||p.silo||p.section||p.type));
        if(arr&&!explicitlyRouted){
          const items=arr.map((p,i)=>pvJsonPromptToSheetItem(p,i)).filter(x=>x.title||x.content||x._id);
          if(items.length)return{format:"Prompt Vault JSON ("+items.length+" prompt"+(items.length!==1?"s":"")+")",isPromptSheet:true,items};
        }
      }
      // AIPRM / generic array of prompt objects
      if(Array.isArray(j)&&j.length&&typeof j[0]==="object"){
        const items=j.map(p=>{
          const title=p.title||p.name||p.prompt_name||p.label||(typeof p.content==="string"?p.content.slice(0,60):"Untitled");
          const content=p.content||p.prompt||p.text||p.body||p.template||"";
          const tags=p.tags||p.categories||(p.category?[p.category]:[])||[];
          const desc=p.description||p.desc||p.summary||"";
          return{title,content,tags:Array.isArray(tags)?tags:typeof tags==="string"?tags.split(",").map(t=>t.trim()):[],description:desc,url:p.url||"",platform:p.platform||"",folder:p.folder||p.folderPath||p.folder_path||p.destination||"",_store:p._store||p.store||p.silo||p.section||p.type||""}
        }).filter(i=>i.title||i.content);
        return{format:"JSON Collection",items}
      }
      // Single JSON object with content
      if(j.content||j.prompt||j.text){
        return{format:"JSON Prompt",items:[{title:j.title||j.name||"Imported",content:j.content||j.prompt||j.text||"",tags:j.tags||[],description:j.description||""}]}
      }
    }catch(e){
      if(ext==="json")return{error:"Invalid JSON: "+e.message};
      console.warn("[PV] JSON parse attempt failed for",fileName,e.message);
    }
  }

  // CSV parsing
  if(ext==="csv"||ext==="tsv"){
    const sep=ext==="tsv"?"\t":",";
    const promptSheet=typeof pvPromptSheetParse==="function"?pvPromptSheetParse(text,fileName):null;
    if(promptSheet&&promptSheet.items.length)return promptSheet;
    const records=typeof pvCsvParse==="function"?pvCsvParse(text,sep):text.split("\n").map(line=>parseCSVRow(line,sep));
    if(records.length<2)return{format:"CSV",items:[]};
    // Parse header
    const headers=records[0].map(h=>h.toLowerCase().trim());
    const titleCol=headers.findIndex(h=>/^(title|name|prompt.?name|label)$/i.test(h));
    const contentCol=headers.findIndex(h=>/^(content|prompt|text|body|template|description)$/i.test(h));
    const tagCol=headers.findIndex(h=>/^(tags|categories|category)$/i.test(h));
    const descCol=headers.findIndex(h=>/^(description|desc|summary|notes)$/i.test(h));
    const folderCol=headers.findIndex(h=>/^(folder|folder_path|destination|path)$/i.test(h));
    const siloCol=headers.findIndex(h=>/^(silo|section|store|type)$/i.test(h));
    const urlCol=headers.findIndex(h=>/^(url|link|source_url)$/i.test(h));
    if(titleCol<0&&contentCol<0)return{format:"CSV (no recognized columns)",items:[]};
    const items=[];
    for(let i=1;i<records.length;i++){
      const cols=records[i];
      if(!cols.some(v=>String(v).trim()))continue;
      const title=cols[titleCol]||cols[contentCol]?.slice(0,60)||"Row "+(i+1);
      const content=cols[contentCol]||cols[titleCol]||"";
      const tags=tagCol>=0&&cols[tagCol]?cols[tagCol].split(/[,;]/).map(t=>t.trim()).filter(Boolean):[];
      const desc=descCol>=0?cols[descCol]||"":"";
      if(title||content)items.push({title,content,tags,description:desc,folder:folderCol>=0?cols[folderCol]||"":"",_store:siloCol>=0?normalizeImportStore(cols[siloCol]):"",url:urlCol>=0?cols[urlCol]||"":""});
    }
    return{format:"CSV ("+items.length+" rows)",items}
  }

  // Markdown parsing (multiple prompts separated by ## headings)
  if(ext==="md"||ext==="markdown"||text.match(/^#{1,3}\s+/m)){
    // Split by H1/H2/H3 headings
    const sections=text.split(/^(#{1,3}\s+.+)$/m);
    if(sections.length>2){
      const items=[];let curTitle="",curContent="";
      for(const sec of sections){
        const hMatch=sec.match(/^#{1,3}\s+(.+)$/);
        if(hMatch){
          if(curTitle&&curContent.trim())items.push({title:curTitle,content:curContent.trim(),tags:[],description:""});
          curTitle=hMatch[1].trim();curContent="";
        }else{curContent+=sec}
      }
      if(curTitle&&curContent.trim())items.push({title:curTitle,content:curContent.trim(),tags:[],description:""});
      if(items.length>1)return{format:"Markdown ("+items.length+" sections)",items}
    }
    // Single markdown file = single prompt
    const titleMatch=text.match(/^#\s+(.+)$/m);
    return{format:"Markdown",items:[{title:titleMatch?titleMatch[1].trim():fileName.replace(/\.(md|markdown)$/i,""),content:text,tags:[],description:""}]}
  }

  // Plain text — single prompt
  return{format:"Text File",items:[{title:fileName.replace(/\.\w+$/,""),content:text,tags:[],description:""}]}
}

// CSV row parser (handles quoted fields)
function parseCSVRow(line,sep){
  const result=[];let current="",inQuotes=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(c==='"'){if(inQuotes&&line[i+1]==='"'){current+='"';i++}else{inQuotes=!inQuotes}}
    else if(c===sep&&!inQuotes){result.push(current);current=""}
    else{current+=c}
  }
  result.push(current);
  return result.map(s=>s.trim().replace(/^"|"$/g,""))
}

// Extract items from a Prompt Vault backup for preview
function extractPVItems(j){
  const items=[];
  const harvest=(data,store)=>{if(data?.folders)allItems(data.folders).forEach(p=>items.push({title:p.title,content:p.content||"",tags:p.tags||[],description:p.description||"",url:p.url||"",platform:p.platform||"",folder:p.folderPath||p.folderName||"",_store:store,_id:p.id}))};
  if(j.prompts)harvest(j.prompts,"prompts");
  if(j.imgprompts)harvest(j.imgprompts,"imgprompts");
  if(j.skills)harvest(j.skills,"skills");
  if(j.snippets)harvest(j.snippets,"snippets");
  if(j.bookmarks)harvest(j.bookmarks,"bookmarks");
  if(j.customgpts)harvest(j.customgpts,"customgpts");
  if(j.notes)harvest(j.notes,"notes");
  return items;
}

const PV_IMPORT_STORES={prompts:()=>P,snippets:()=>SN,bookmarks:()=>BM,skills:()=>KL,customgpts:()=>GP};
const PV_IMPORT_ROOTS={prompts:"root",snippets:"sroot",bookmarks:"broot",skills:"kroot",customgpts:"groot"};
const PV_IMPORT_LABELS={prompts:"Prompts",snippets:"Clips",bookmarks:"Bookmarks",skills:"Skills",customgpts:"Custom GPTs"};
function normalizeImportStore(value,fallback="prompts"){
  const v=String(value||"").trim().toLowerCase();
  if(["clip","clips","snippet","snippets"].includes(v))return"snippets";
  if(["bookmark","bookmarks","mark","marks"].includes(v))return"bookmarks";
  if(["skill","skills","claude-skill","claude-skills"].includes(v))return"skills";
  if(["gpt","gpts","customgpt","custom-gpt","custom gpt","customgpts","custom gpts"].includes(v))return"customgpts";
  if(["prompt","prompts"].includes(v))return"prompts";
  return fallback;
}
function pvImportFolder(store,pathText){
  const root=store.folders,parts=String(pathText||"").split(/[\\/]+/).map(x=>x.trim()).filter(Boolean).filter((x,i)=>!(i===0&&(x.toLowerCase()===String(root.name||"").toLowerCase()||x.toLowerCase()==="root")));
  let cur=root;
  for(const name of parts){let next=(cur.children||[]).find(ch=>(ch.name||"").trim().toLowerCase()===name.toLowerCase());if(!next){next={id:generateId(store),name,children:[],prompts:[],color:""};cur.children=cur.children||[];cur.children.push(next)}cur=next}
  return cur;
}
function pvImportDefaultFolder(storeKey){
  const states={prompts:pSt,snippets:sSt,bookmarks:bSt,skills:kSt,customgpts:gSt};
  const state=states[storeKey]||pSt,store=PV_IMPORT_STORES[storeKey]?.();
  const selected=store&&findFolder(store.folders,state?.sel);if(!selected||selected.id===PV_IMPORT_ROOTS[storeKey])return"";
  const parts=[];let cur=selected;while(cur&&cur.id!==PV_IMPORT_ROOTS[storeKey]){parts.unshift(cur.name);cur=findParent(store.folders,cur.id)}return parts.join(" / ");
}

// ── Import Wizard UI ──
function importParsedText(text,fileName,options={}){
  // PV drop format (front-matter markdown from agents) — additive, self-routing
  if(typeof pvDropImport==="function"&&pvDropImport(text,fileName))return true;
  // Batch template takes priority — it self-routes each record to its silo
  if(typeof isBatchTemplate==="function"&&isBatchTemplate(text)){
    showBatchPreview(parseBatchTemplate(text));
    return true;
  }
  const parsed=parseImportFile(text,fileName||"pasted.txt");
  if(parsed.error){flash(parsed.error);return false}
  if(!parsed.items||!parsed.items.length){flash("No importable items found");return false}
  if(parsed.isPromptSheet){showPromptSheetPreview(parsed,fileName||"pasted CSV");return true}
  if(parsed.isBookmarksBackup&&options.store==="bookmarks"){showBookmarksRestoreFromParsed(parsed.data,fileName||"pasted backup");return true}
  showImportPreview([{file:fileName||"pasted",format:parsed.format,items:parsed.items,isFullBackup:parsed.isFullBackup||false,data:parsed.data||null}],parsed.items.length,options);
  return true;
}
function importPickFiles(options={}){
  const input=document.createElement("input");
  input.type="file";input.accept=".json,.md,.csv,.tsv,.txt,.yaml,.yml";input.multiple=true;
  input.addEventListener("change",async()=>{
    const fileList=[...input.files];if(!fileList.length)return;
    // A single batch-template file routes straight to the batch preview
    if(fileList.length===1){
      const text=await fileList[0].text();
      if(typeof isBatchTemplate==="function"&&isBatchTemplate(text)){showBatchPreview(parseBatchTemplate(text));return}
      const parsed=parseImportFile(text,fileList[0].name);
      if(parsed.isBookmarksBackup&&options.store==="bookmarks"){showBookmarksRestoreFromParsed(parsed.data,fileList[0].name);return}
      importParsedText(text,fileList[0].name,options);return;
    }
    // PV drop files carry their own silo routing — when every selected file is
    // PV, combine them into one PV preview; when mixed, ask for separate runs.
    const texts=[];
    for(const file of fileList)texts.push({name:file.name,text:await file.text()});
    if(typeof parsePvDrop==="function"){
      const pvParsed=texts.map(t=>({name:t.name,pv:parsePvDrop(t.text)}));
      const pvFiles=pvParsed.filter(x=>x.pv);
      if(pvFiles.length===texts.length){
        const combined={docs:pvFiles.flatMap(x=>x.pv.docs),errors:pvFiles.flatMap(x=>x.pv.errors)};
        pvDropImport("",pvFiles.map(x=>x.name).join(", "),combined);
        return;
      }
      if(pvFiles.length){flash("Mix of PV and other formats — import PV files separately");return}
    }
    let allParsed=[];
    for(const t of texts){
      const parsed=parseImportFile(t.text,t.name);
      allParsed.push({file:t.name,format:parsed.format,items:parsed.items,isFullBackup:parsed.isFullBackup||false,data:parsed.data||null});
    }
    const totalItems=allParsed.reduce((s,p)=>s+p.items.length,0);
    if(!totalItems){flash("No importable items found");return}
    showImportPreview(allParsed,totalItems,options);
  });
  input.click();
}
function openImportWizard(){
  showModal(`<h3>Import</h3>
    <div class="exp-opt" id="iwFiles"><div class="eo-t">${I.dl} Choose files&#8230;</div><div class="eo-d">JSON backup, Markdown, CSV, ChatGPT/TypingMind exports, or a filled batch template</div></div>
    <div class="exp-opt" id="iwPaste"><div class="eo-t">${S.clip} Paste from clipboard</div><div class="eo-d">Paste a filled template or any supported format</div></div>
    <div class="itp-sec">Prompt spreadsheet — export, let an LLM edit it, reload it</div>
    <div class="exp-opt" id="iwSheetOut"><div class="eo-t">${I.dl} Export prompts for Excel</div><div class="eo-d">Round-trip CSV with stable IDs, folders, tags, and multiline prompt text</div></div>
    <div class="exp-opt" id="iwSheetBlank"><div class="eo-t">↓ Download blank prompt spreadsheet</div><div class="eo-d">LLM-ready template; blank IDs create new prompts</div></div>
    <div class="exp-opt" id="iwSheetGuide"><div class="eo-t">${I.copy} Copy instructions for an LLM</div><div class="eo-d">Paste these instructions together with the CSV</div></div>
    <div class="itp-sec">Prompt JSON &#8212; export, let a model (Cowork/Codex) edit it, reload it</div>
    <div class="exp-opt" id="iwJsonOut"><div class="eo-t">${I.dl} Export prompts as JSON</div><div class="eo-d">Round-trip with stable IDs, folders, array tags &#38; embedded instructions</div></div>
    <div class="exp-opt" id="iwJsonBlank"><div class="eo-t">&#8595; Download blank prompt JSON</div><div class="eo-d">Empty template with one example; blank IDs create new prompts</div></div>
    <div class="exp-opt" id="iwJsonGuide"><div class="eo-t">${I.copy} Copy JSON instructions for an LLM</div><div class="eo-d">Reimport tolerates code fences, comments &#38; trailing commas</div></div>
    <div class="itp-sec">Batch template &#8212; bulk-add prompts, skills, notes, bookmarks&#8230;</div>
    <div class="exp-opt" id="iwTplDl"><div class="eo-t">&#8595; Download blank template</div><div class="eo-d">Fill it out (or have an AI fill it), then import it back &#8212; records auto-file into their silos</div></div>
    <div class="exp-opt" id="iwTplCp"><div class="eo-t">${I.copy} Copy blank template</div><div class="eo-d">Same template, to your clipboard</div></div>
    <div class="brow"><button class="bg-btn" id="iwX">Cancel</button></div>`,mc=>{
    mc.querySelector("#iwX").addEventListener("click",closeModal);
    mc.querySelector("#iwFiles").addEventListener("click",()=>{const store=PV_IMPORT_STORES[aTab]?aTab:"prompts";closeModal();importPickFiles({store,folder:pvImportDefaultFolder(store)})});
    mc.querySelector("#iwPaste").addEventListener("click",async()=>{
      closeModal();
      try{const text=await navigator.clipboard.readText();if(!text||!text.trim()){flash("Clipboard is empty");return}const store=PV_IMPORT_STORES[aTab]?aTab:"prompts";importParsedText(text,"",{store,folder:pvImportDefaultFolder(store)})}
      catch{flash("Cannot read clipboard")}
    });
    mc.querySelector("#iwSheetOut").addEventListener("click",()=>{closeModal();pvDownloadPromptSheet(false)});
    mc.querySelector("#iwSheetBlank").addEventListener("click",()=>{closeModal();pvDownloadPromptSheet(true)});
    mc.querySelector("#iwSheetGuide").addEventListener("click",()=>{navigator.clipboard.writeText(pvPromptSheetLlmInstructions()).then(()=>{closeModal();flash("LLM instructions copied")}).catch(()=>flash("Copy failed"))});
    mc.querySelector("#iwJsonOut").addEventListener("click",()=>{closeModal();pvDownloadPromptJson(false)});
    mc.querySelector("#iwJsonBlank").addEventListener("click",()=>{closeModal();pvDownloadPromptJson(true)});
    mc.querySelector("#iwJsonGuide").addEventListener("click",()=>{navigator.clipboard.writeText(pvPromptJsonLlmInstructions()).then(()=>{closeModal();flash("LLM JSON instructions copied")}).catch(()=>flash("Copy failed"))});
    mc.querySelector("#iwTplDl").addEventListener("click",()=>{closeModal();downloadBatchTemplate()});
    mc.querySelector("#iwTplCp").addEventListener("click",()=>{
      navigator.clipboard.writeText(generateBatchTemplate()).then(()=>{closeModal();flash("OK Template copied")}).catch(()=>flash("Copy failed"));
    });
  });
}

function showPromptSheetPreview(parsed,fileName){
  const plan=pvPromptSheetPlan(parsed.items,P);
  const badge=(r)=>r._status==="update"?"UPDATE":r._status==="add"?"ADD":r._status==="skip"?"SKIP":"ERROR";
  const color=(r)=>r._status==="update"?"var(--sn)":r._status==="add"?"var(--gn)":r._status==="skip"?"var(--dm)":"var(--dn)";
  const rows=plan.rows.slice(0,80).map(r=>`<div class="iw-row"><div style="width:44px;font-size:8px;font-weight:700;color:${color(r)}">${badge(r)}</div><div class="iw-info"><div class="iw-title">${esc(r.title||"Untitled")}</div><div class="iw-meta">row ${r._row}${r.folder?` · ${esc(r.folder)}`:""}${r._id?` · id ${esc(r._id)}`:""}</div></div></div>`).join("");
  const more=plan.rows.length>80?`<div style="font-size:9px;color:var(--dm);padding:5px">…and ${plan.rows.length-80} more rows</div>`:"";
  const errs=plan.errors.length?`<div style="padding:7px;border:1px solid var(--dn);border-radius:5px;color:var(--dn);font-size:9px;line-height:1.5;margin:6px 0">${plan.errors.slice(0,12).map(esc).join("<br>")}${plan.errors.length>12?`<br>…and ${plan.errors.length-12} more`:""}</div>`:"";
  showModal(`<h3>Reload Prompt Spreadsheet</h3>
    <p style="font-size:10px;color:var(--mu)">${esc(fileName)} · ${plan.adds} new · ${plan.updates} updates · ${plan.skips} skipped</p>
    <div style="font-size:9px;color:var(--dm);margin-bottom:6px">Updates keep the same prompt ID and save the old prompt in version history. New rows get new IDs. No rows delete prompts. The whole reload can be undone.</div>
    ${errs}<div style="max-height:290px;overflow-y:auto">${rows}${more}</div>
    <div class="brow"><button class="bg-btn" id="psX">Cancel</button><button class="bs" id="psBackup">Export current first</button><button class="bp" id="psGo" ${plan.errors.length?"disabled":""}>Reload ${plan.adds+plan.updates} prompts</button></div>`,mc=>{
    mc.querySelector("#psX").addEventListener("click",closeModal);
    mc.querySelector("#psBackup").addEventListener("click",()=>pvDownloadPromptSheet(false));
    mc.querySelector("#psGo").addEventListener("click",()=>{
      if(plan.errors.length)return;
      pushUndo();const res=pvApplyPromptSheet(plan,P);save();closeModal();aTab="prompts";
      flash(`Reloaded: ${res.adds} added, ${res.updates} updated, ${res.skips} skipped`);render();
    });
  });
}

function pvFindExactImportDuplicate(folder,item,storeKey){
  const title=String(item.title||"").trim().toLowerCase(),url=String(item.url||"").trim().replace(/\/$/,"").toLowerCase();
  return(folder?.prompts||[]).find(p=>title&&String(p.title||"").trim().toLowerCase()===title||(storeKey==="customgpts"&&url&&String(p.url||"").trim().replace(/\/$/,"").toLowerCase()===url))||null;
}
function pvUniqueImportTitle(folder,title){
  const base=String(title||"Untitled").trim()||"Untitled",taken=new Set((folder?.prompts||[]).map(p=>String(p.title||"").trim().toLowerCase()));
  if(!taken.has(base.toLowerCase()))return base;let n=2;while(taken.has(`${base} (imported ${n})`.toLowerCase()))n++;return`${base} (imported ${n})`;
}
function pvUpdateImportedItem(target,item,storeKey){
  target.versions=target.versions||[];target.versions.push({title:target.title,content:target.content||"",tags:[...(target.tags||[])],files:target.files?deepClone(target.files):undefined,saved:Date.now(),note:"Before authorized import update"});
  if(target.versions.length>20)target.versions=target.versions.slice(-20);
  target.title=item.title||target.title;target.content=item.content||target.content||"";target.description=item.description||target.description||"";target.url=item.url||target.url||"";
  target.tags=[...new Set([...(target.tags||[]),...(item.tags||[])])];target.modified=Date.now();if(storeKey==="skills")target.files={...(target.files||{}),...(item.files||{})};
  target.provenance={source:"user-authorized-import",sourceFile:item._sourceFile||"",sourceKind:item._sourceKind||"user-supplied",importedAt:Date.now()};
}

function showImportPreview(parsed,totalItems,options={}){
  const isFullBackup=parsed.length===1&&parsed[0].isFullBackup;
  const storeIcons={prompts:"⚡",imgprompts:"🖼",skills:"🛠",snippets:"📋",bookmarks:"🔖",notes:"📝",customgpts:"🤖"};
  const defaultStore=normalizeImportStore(options.store,"prompts"),defaultFolder=options.folder||"";
  const storeOptions=Object.entries(PV_IMPORT_LABELS).map(([k,v])=>`<option value="${k}">${v}</option>`).join("");
  // Flatten all items with source info
  const flatItems=[];
  parsed.forEach((p,fileIdx)=>{p.items.forEach((item,i)=>{flatItems.push({...item,_fileIdx:fileIdx,_idx:i,_checked:true,_destStore:normalizeImportStore(item._store,defaultStore),_destFolder:item.folder||defaultFolder})})});

  let h=`<h3>Import Wizard</h3>`;
  // Format detection summary
  parsed.forEach((p,fileIdx)=>{
    h+=`<div style="font-size:10px;color:var(--mu);margin-bottom:4px;display:flex;gap:5px;align-items:center"><span style="flex:1">📄 ${esc(p.file)} → <strong>${esc(p.format)}</strong> · ${p.items.length} item${p.items.length!==1?'s':''}</span><select data-iw-file-store="${fileIdx}" title="Set destination section for every row in this file">${storeOptions}</select><input data-iw-file-folder="${fileIdx}" value="${escAttr(defaultFolder)}" placeholder="Folder path (all rows)" title="Set folder path for every row in this file" style="width:125px"></div>`;
  });

  if(isFullBackup){
    h+=`<div style="margin:8px 0;padding:8px;background:var(--inp);border-radius:4px;border:1px solid var(--bl)">`;
    h+=`<div style="font-size:10px;color:var(--ac);font-weight:600;margin-bottom:4px">This is a Prompt Vault backup file</div>`;
    h+=`<div style="display:flex;gap:4px"><button class="bp" id="iwFullRestore">Full Restore (replace all)</button><button class="bs" id="iwCherryPick">Cherry-pick items instead</button></div>`;
    h+=`</div>`;
  }

  h+=`<div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0">`;
  h+=`<div><button class="bs" id="iwAll" style="font-size:9px">Select All</button> <button class="bs" id="iwNone" style="font-size:9px">Select None</button></div>`;
  h+=`<div style="font-size:9px;color:var(--dm)" id="iwCount">${totalItems} selected</div>`;
  h+=`</div>`;

  h+=`<div style="margin-bottom:4px"><input type="text" id="iwSearch" placeholder="Filter items..." style="width:100%;font-size:11px"></div>`;

  h+=`<div id="iwList" style="max-height:280px;overflow-y:auto">`;
  flatItems.forEach((item,i)=>{
    const storeIcon=storeIcons[item._destStore]||"⚡";
    const preview=(item.content||"").slice(0,80).replace(/\n/g," ");
    h+=`<div class="iw-row" data-iwi="${i}">`;
    h+=`<label class="iw-cb"><input type="checkbox" checked data-iwc="${i}"></label>`;
    h+=`<div class="iw-info"><div class="iw-title">${storeIcon} ${esc(item.title)}</div>`;
    h+=`<div class="iw-meta">${preview?esc(preview):'(empty)'}${item.tags?.length?' · '+item.tags.slice(0,3).map(t=>esc(t)).join(', '):''}</div>`;
    h+=`<div style="display:flex;gap:4px;margin-top:3px"><select data-iws="${i}" aria-label="Destination section">${storeOptions}</select><input data-iwf="${i}" value="${escAttr(item._destFolder)}" placeholder="Folder / Subfolder" aria-label="Destination folder" style="flex:1;min-width:100px"></div></div></div>`;
  });
  h+=`</div>`;

  h+=`<div style="margin-top:6px;font-size:9px;color:var(--dm)">Choose a section and optional folder path for each file or row. Blank folder paths use that section's root. Nothing is forced into Prompts › Imports.</div>`;
  h+=`<div style="margin-top:6px;display:flex;gap:6px;align-items:center;font-size:9px;color:var(--mu)"><label for="iwDupMode">Exact duplicates:</label><select id="iwDupMode"><option value="skip">Skip existing (recommended)</option><option value="update">Update existing + version</option><option value="keep">Keep both</option></select></div>`;
  h+=`<div class="brow" style="margin-top:8px"><button class="bg-btn" id="iwX">Cancel</button><button class="bp" id="iwGo">Import Selected</button></div>`;

  showModal(h,mc=>{
    mc.querySelector("#iwX").addEventListener("click",closeModal);
    flatItems.forEach((item,i)=>{const s=mc.querySelector(`[data-iws="${i}"]`);if(s)s.value=item._destStore});
    parsed.forEach((p,fileIdx)=>{const s=mc.querySelector(`[data-iw-file-store="${fileIdx}"]`);if(s)s.value=defaultStore});
    mc.querySelectorAll("[data-iw-file-store]").forEach(el=>el.addEventListener("change",()=>{mc.querySelectorAll(`[data-iws]`).forEach(row=>{const i=+row.dataset.iws;if(flatItems[i]._fileIdx===+el.dataset.iwFileStore)row.value=el.value})}));
    mc.querySelectorAll("[data-iw-file-folder]").forEach(el=>el.addEventListener("input",()=>{mc.querySelectorAll(`[data-iwf]`).forEach(row=>{const i=+row.dataset.iwf;if(flatItems[i]._fileIdx===+el.dataset.iwFileFolder)row.value=el.value})}));

    // Full restore option
    mc.querySelector("#iwFullRestore")?.addEventListener("click",()=>{
      closeModal();
      showModal(`<h3 style="color:var(--dn)">Full Restore?</h3><p>This replaces all your current data with the backup.</p><p style="font-size:10px;color:var(--dn)">Current data will be lost. Use "Cherry-pick" to add without replacing.</p><div class="brow"><button class="bg-btn" id="frX">Cancel</button><button class="bdn" id="frY">Replace Everything</button></div>`,mc2=>{
        mc2.querySelector("#frX").addEventListener("click",closeModal);
        mc2.querySelector("#frY").addEventListener("click",async()=>{
          const j=parsed[0].data;
          if(restoreVault(j,{source:"import-wizard"})){
            // Backups from 7.22+ carry full-resolution photo/file bytes; older ones don't and
            // simply leave the existing attachment stores untouched.
            let extra="";
            try{const n=(typeof pvRestoreBackupAttachments==="function")?await pvRestoreBackupAttachments(j):0;if(n)extra=` · ${n} attachment${n!==1?"s":""} restored`}
            catch(e){extra=" · photo bytes could not be restored"}
            closeModal();flash("✓ Full restore complete"+extra);aTab="prompts";render();
          }else{
            closeModal();flash("Restore blocked — invalid backup file");
          }
        });
      });
    });

    // Cherry pick mode (hides full restore banner)
    mc.querySelector("#iwCherryPick")?.addEventListener("click",()=>{
      const banner=mc.querySelector("#iwFullRestore")?.parentElement;if(banner)banner.style.display="none";
    });

    // Select all/none
    mc.querySelector("#iwAll").addEventListener("click",()=>{
      mc.querySelectorAll("[data-iwc]").forEach(cb=>{cb.checked=true});updCount()});
    mc.querySelector("#iwNone").addEventListener("click",()=>{
      mc.querySelectorAll("[data-iwc]").forEach(cb=>{cb.checked=false});updCount()});

    // Search filter
    mc.querySelector("#iwSearch").addEventListener("input",e=>{
      const q=e.target.value.toLowerCase();
      mc.querySelectorAll(".iw-row").forEach(row=>{
        const title=row.querySelector(".iw-title")?.textContent?.toLowerCase()||"";
        const meta2=row.querySelector(".iw-meta")?.textContent?.toLowerCase()||"";
        row.style.display=(title.includes(q)||meta2.includes(q))?"":"none";
      });
    });

    // Count updater
    function updCount(){
      const checked=mc.querySelectorAll("[data-iwc]:checked").length;
      mc.querySelector("#iwCount").textContent=checked+" selected";
    }
    mc.querySelectorAll("[data-iwc]").forEach(cb=>{cb.addEventListener("change",updCount)});

    function runImport(selected){
      pushUndo();
      let imported=0,skipped=0,updated=0;const byStore={},duplicateMode=mc.querySelector("#iwDupMode")?.value||"skip";
      selected.forEach(i=>{
        const item=flatItems[i];if(!item)return;
        const storeKey=normalizeImportStore(mc.querySelector(`[data-iws="${i}"]`)?.value,defaultStore),store=PV_IMPORT_STORES[storeKey]?.();if(!store)return;
        const folder=pvImportFolder(store,mc.querySelector(`[data-iwf="${i}"]`)?.value||"");folder.prompts=folder.prompts||[];
        const duplicate=pvFindExactImportDuplicate(folder,item,storeKey);
        if(duplicate&&duplicateMode==="skip"){skipped++;return}
        if(duplicate&&duplicateMode==="update"){pvUpdateImportedItem(duplicate,item,storeKey);updated++;byStore[storeKey]=(byStore[storeKey]||0)+1;return}
        const created={
          id:generateId(store),title:duplicate?pvUniqueImportTitle(folder,item.title):item.title||"Untitled",content:item.content||"",
          tags:item.tags||[],created:Date.now(),modified:Date.now(),
          usageCount:0,favorited:false,versions:[],
          url:item.url||"",platform:item.platform||"",
          description:item.description||"",
          sourceUrl:item.sourceUrl||"",sourceTitle:item.sourceTitle||"",
          provenance:{source:"user-authorized-import",sourceFile:item._sourceFile||"",sourceKind:item._sourceKind||"user-supplied",importedAt:Date.now()}
        };
        if(storeKey==="skills")created.files=deepClone(item.files||{});
        folder.prompts.push(created);
        imported++;byStore[storeKey]=(byStore[storeKey]||0)+1;
      });
      save();closeModal();
      const parts=Object.entries(byStore).map(([s,n])=>`${n} ${PV_IMPORT_LABELS[s]}`).join(", ");aTab=Object.keys(byStore)[0]||defaultStore;flash(`Imported ${imported}${updated?` · ${updated} updated`:""}${skipped?` · ${skipped} duplicates skipped`:""}${parts?` · ${parts}`:""}`);render();
    }

    mc.querySelector("#iwGo").addEventListener("click",()=>{
      const selected=[];
      mc.querySelectorAll("[data-iwc]:checked").forEach(cb=>{selected.push(+cb.dataset.iwc)});
      if(!selected.length){flash("Nothing selected");return}
      const similarWarn=[];
      selected.forEach(i=>{
        const item=flatItems[i];if(!item)return;
        const storeKey=normalizeImportStore(mc.querySelector(`[data-iws="${i}"]`)?.value,defaultStore);if(storeKey!=="prompts")return;
        const txt=((item.title||"")+" "+(item.content||"")).trim();
        if(txt.length<20)return;
        const sim=findSimilarPrompts(txt,P,null,0.85);
        if(sim.length)similarWarn.push({i,item,sim:sim[0]});
      });
      if(similarWarn.length){
        const rows=similarWarn.map(w=>`<div style="font-size:10px;padding:4px 0;border-bottom:1px solid var(--bl)">${esc(w.item.title)} ≈ <strong>${esc(w.sim.title)}</strong> (${Math.round((w.sim.similarity||0)*100)}%)</div>`).join("");
        showModal(`<h3>Similar prompts already in vault</h3><p>${similarWarn.length} selected row(s) look like existing prompts (≥85% token overlap).</p><div style="max-height:140px;overflow-y:auto">${rows}</div><div class="brow"><button class="bg-btn" id="iwSimX">Cancel</button><button class="bs" id="iwSimSkip">Uncheck those rows</button><button class="bp" id="iwSimAll">Import anyway</button></div>`,mx=>{
          mx.querySelector("#iwSimX").addEventListener("click",closeModal);
          mx.querySelector("#iwSimAll").addEventListener("click",()=>{closeModal();runImport(selected)});
          mx.querySelector("#iwSimSkip").addEventListener("click",()=>{
            similarWarn.forEach(w=>{const cb=mc.querySelector(`[data-iwc="${w.i}"]`);if(cb)cb.checked=false});
            closeModal();updCount();flash("Unchecked similar rows — review list, then Import again");
          });
        });
        return;
      }
      runImport(selected);
    });
  });
}

// ═══════ PV DROP FORMAT ═══════
// Markdown files with a `pv:` front-matter block that agents (Claude Code,
// Codex, ChatGPT, …) write to disk; the Import button ingests them additively.
// One item per document; multiple documents in one file separated by a line of
// `===`. Spec + examples: docs/PV.md.
//
//   ---
//   pv: prompt            # prompt|clip|note|bookmark|skill|gpt|imgprompt
//   title: Code review checklist
//   folder: Coding/Reviews
//   tags: [coding, review]
//   url: https://…        # bookmarks / gpts
//   platform: anthropic   # optional platform id
//   source: https://…     # clips: where it was captured
//   ---
//   Body text becomes the item content.

const PV_DROP_SILOS={prompt:"prompts",clip:"snippets",note:"notes",bookmark:"bookmarks",skill:"skills",gpt:"customgpts",imgprompt:"imgprompts"};

function pvDropParseTags(v){
  if(!v)return[];
  const inner=v.trim().replace(/^\[/,"").replace(/\]$/,"");
  return inner.split(",").map(t=>t.trim().replace(/^["']|["']$/g,"")).filter(Boolean);
}

/** Parse one front-matter document. Returns {meta,body} or null when the text
 *  has no leading `---` fence. */
function pvDropParseDoc(text){
  const m=text.match(/^\uFEFF?\s*---[ \t]*\n([\s\S]*?)\n---[ \t]*\n?([\s\S]*)$/);
  if(!m)return null;
  const meta={};
  for(const line of m[1].split("\n")){
    const kv=line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if(!kv)continue;
    meta[kv[1].toLowerCase()]=kv[2].trim();
  }
  return{meta,body:(m[2]||"").trim()};
}

/** Parse a whole file. Returns null when this is not a PV drop file (lets the
 *  regular import formats have it), else {docs:[…], errors:[…]}. */
function parsePvDrop(text){
  if(!text||!/^\uFEFF?\s*---/.test(text))return null;
  const chunks=text.split(/\n={3,}[ \t]*\n/);
  const first=pvDropParseDoc(chunks[0]);
  if(!first||!first.meta.pv)return null;
  const docs=[],errors=[];
  chunks.forEach((chunk,i)=>{
    if(!chunk.trim())return;
    const doc=pvDropParseDoc(chunk.trim());
    if(!doc||!doc.meta.pv){errors.push(`Document ${i+1}: missing pv: front matter`);return}
    const type=doc.meta.pv.toLowerCase();
    const silo=PV_DROP_SILOS[type];
    if(!silo){errors.push(`Document ${i+1}: unknown pv type "${doc.meta.pv}" (use ${Object.keys(PV_DROP_SILOS).join("|")})`);return}
    const title=(doc.meta.title||doc.body.split("\n")[0]||"").trim().slice(0,200);
    if(!title){errors.push(`Document ${i+1}: needs a title (title: … or a first body line)`);return}
    if((type==="bookmark"||type==="gpt")&&!doc.meta.url){errors.push(`Document ${i+1}: ${type} needs url:`);return}
    docs.push({
      silo,type,title,
      content:doc.body,
      folder:(doc.meta.folder||"").replace(/^\/+|\/+$/g,""),
      tags:pvDropParseTags(doc.meta.tags),
      url:doc.meta.url||"",
      platform:doc.meta.platform||"",
      sourceUrl:doc.meta.source||"",
    });
  });
  if(!docs.length&&!errors.length)return null;
  return{docs,errors};
}

/** Additive apply into the live stores (panel side — uses the normal save
 *  pipeline). Duplicate = same title in the destination folder → skipped. */
function pvDropApply(parsed){
  const stores={prompts:P,snippets:SN,notes:NT,bookmarks:BM,skills:KL,customgpts:GP,imgprompts:IP};
  const roots={prompts:"root",snippets:"sroot",notes:"nroot",bookmarks:"broot",skills:"kroot",customgpts:"groot",imgprompts:"iroot"};
  pushUndo();
  let added=0,skipped=0;const touched=new Set();
  for(const doc of parsed.docs){
    const store=stores[doc.silo];if(!store)continue;
    let f=findFolder(store.folders,roots[doc.silo]);
    if(doc.silo==="snippets"&&!doc.folder){
      f=findFolder(store.folders,"s_inbox")||f; // clips default to Inbox
    }
    for(const part of doc.folder?doc.folder.split("/"):[]){
      const nm=part.trim();if(!nm)continue;
      let child=(f.children||[]).find(c=>c.name===nm);
      if(!child){child={id:generateId(store),name:nm,children:[],prompts:[],color:""};f.children=f.children||[];f.children.push(child)}
      f=child;
    }
    f.prompts=f.prompts||[];
    if(f.prompts.find(p=>p.title===doc.title)){skipped++;continue}
    const item=buildItem(store,doc.title,doc.content,doc.tags);
    item.provenance={source:"pv-drop",capturedAt:Date.now()};
    if(doc.silo==="bookmarks"||doc.silo==="customgpts")item.url=doc.url;
    if(doc.silo==="prompts"||doc.silo==="imgprompts")item.platform=doc.platform||(doc.silo==="imgprompts"?"midjourney":"");
    if(doc.silo==="snippets"){item.sourceUrl=doc.sourceUrl;item.platform=doc.platform||"";item.sourceType=item.platform?"ai":"web";item.capturedAt=Date.now()}
    if(doc.silo==="skills"){item.description=doc.content.split("\n")[0].slice(0,140);item.files={}}
    f.prompts.push(item);
    added++;touched.add(doc.silo);
  }
  save();
  return{added,skipped,errors:parsed.errors.length,silos:[...touched]};
}

/** Preview modal → apply. Returns true when the text was handled as PV drop.
 *  `preparsed` lets multi-file callers pass already-combined docs. */
function pvDropImport(text,fileName,preparsed){
  const parsed=preparsed||parsePvDrop(text);
  if(!parsed)return false;
  const siloLabel={prompts:"Prompt",snippets:"Clip",notes:"Note",bookmarks:"Bookmark",skills:"Skill",customgpts:"Custom GPT",imgprompts:"Image Prompt"};
  const rows=parsed.docs.slice(0,60).map(d=>`<div class="iw-row"><div style="width:74px;font-size:8px;font-weight:700;color:var(--gn)">${esc(siloLabel[d.silo]||d.silo)}</div><div class="iw-info"><div class="iw-title">${esc(d.title)}</div><div class="iw-meta">${d.folder?esc(d.folder):"root"}${d.tags.length?" · "+esc(d.tags.join(", ")):""}</div></div></div>`).join("");
  const more=parsed.docs.length>60?`<div style="font-size:9px;color:var(--dm);padding:5px">…and ${parsed.docs.length-60} more</div>`:"";
  const errs=parsed.errors.length?`<div style="padding:7px;border:1px solid var(--dn);border-radius:5px;color:var(--dn);font-size:9px;line-height:1.5;margin:6px 0">${parsed.errors.slice(0,10).map(esc).join("<br>")}</div>`:"";
  showModal(`<h3>PV Import</h3>
    <p style="font-size:10px;color:var(--mu)">${esc(fileName||"pasted")} · ${parsed.docs.length} item${parsed.docs.length!==1?"s":""} in PV drop format</p>
    <div style="font-size:9px;color:var(--dm);margin-bottom:6px">Additive — nothing is overwritten or deleted. Items whose title already exists in the destination folder are skipped. Undoable.</div>
    ${errs}<div style="max-height:280px;overflow-y:auto">${rows}${more}</div>
    <div class="brow"><button class="bg-btn" id="pvdX">Cancel</button><button class="bp" id="pvdGo" ${parsed.docs.length?"":"disabled"}>Import ${parsed.docs.length}</button></div>`,mc=>{
    mc.querySelector("#pvdX").addEventListener("click",closeModal);
    mc.querySelector("#pvdGo").addEventListener("click",()=>{
      const res=pvDropApply(parsed);
      closeModal();
      flash(`OK PV import: ${res.added} added${res.skipped?`, ${res.skipped} skipped`:""}`);
      render();
    });
  });
  return true;
}

if(typeof module!=="undefined"&&module.exports){module.exports={parsePvDrop,PV_DROP_SILOS}}

// ═══════ PV PANEL BRIDGE ═══════
// When the side panel is open, external adds coming through the PV native
// bridge (background pv-bridge.js) are executed HERE, through the normal
// save pipeline — one writer, undo history intact, instant repaint.
// When the panel is closed, pv-bridge.js writes storage directly and the
// panel reloads on the next PV_CHANGED it sees.

const PV_PANEL_SILOS={prompts:()=>P,snippets:()=>SN,notes:()=>NT,bookmarks:()=>BM,skills:()=>KL,customgpts:()=>GP,imgprompts:()=>IP};
const PV_PANEL_ROOTS={prompts:"root",snippets:"sroot",notes:"nroot",bookmarks:"broot",skills:"kroot",customgpts:"groot",imgprompts:"iroot"};

function pvPanelAddItem(args){
  const silo=args.silo;
  const getStore=PV_PANEL_SILOS[silo];
  if(!getStore)return{error:"unknown silo: "+silo};
  const store=getStore();
  const title=(args.title||"").trim().slice(0,200);
  if(!title)return{error:"title required"};
  pushUndo();
  let f=findFolder(store.folders,PV_PANEL_ROOTS[silo]);
  if(silo==="snippets"&&!args.folder)f=findFolder(store.folders,"s_inbox")||f;
  for(const part of args.folder?String(args.folder).split("/"):[]){
    const nm=part.trim();if(!nm)continue;
    let child=(f.children||[]).find(c=>c.name===nm);
    if(!child){child={id:generateId(store),name:nm,children:[],prompts:[],color:""};f.children=f.children||[];f.children.push(child)}
    f=child;
  }
  f.prompts=f.prompts||[];
  const dup=f.prompts.find(p=>p.title===title&&(p.content||"")===(args.content||""));
  if(dup)return{id:dup.id,folder:f.name,deduped:true};
  const item=buildItem(store,title,args.content||"",Array.isArray(args.tags)?args.tags:[]);
  item.provenance={source:"pv-mcp",agent:args.agent||"",capturedAt:Date.now()};
  if(silo==="bookmarks"||silo==="customgpts")item.url=args.url||"";
  if(silo==="prompts"||silo==="imgprompts")item.platform=args.platform||(silo==="imgprompts"?"midjourney":"");
  if(silo==="snippets"){item.sourceUrl=args.source||"";item.platform=args.platform||"";item.sourceType=item.platform?"ai":"web";item.capturedAt=Date.now()}
  if(silo==="skills"){item.description=(args.content||"").split("\n")[0].slice(0,140);item.files={}}
  f.prompts.push(item);
  save();render();
  flash("PV: added “"+title.slice(0,40)+"”");
  return{id:item.id,folder:f.name,deduped:false};
}

chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{
  if(msg?.type==="PV_PANEL_EXEC"&&msg.tool==="pv_add_item"){
    try{sendResponse({handled:true,result:pvPanelAddItem(msg.args||{})})}
    catch(e){sendResponse({handled:true,result:{error:String(e&&e.message||e)}})}
    return; // synchronous response
  }
  if(msg?.type==="PV_CHANGED"){
    // Background wrote to storage while we're open — reload and repaint.
    loadData().then(()=>{try{render()}catch(e){/* mid-modal render races are harmless */}});
  }
});

// ═══════ UNIVERSAL DRAG-INTO-PV CAPTURE ═══════
// Drag content into the side panel from anywhere and PV lights up to receive it:
//   • an image (file or from a web page) → glows, saves to Photos, pivots there
//   • highlighted text → panel BIFURCATES: drop top half = Note, bottom = Clip
//   • a link / bookmark → glows, saves a Bookmark (from any section)
// Internal card/tile drags are ignored; section-panel pin drops keep their own
// handler (we defer whenever an inner handler already claimed the drop).
(function(){
  let mode=null;      // 'text' | 'image' | 'link'
  let depth=0;

  const $d=id=>document.getElementById(id);
  const isInternal=types=>[...types].some(t=>["pid","fid","sp-item","sp-reorder-panel","sp-reorder-cl","sp-cl","sp-panel"].includes(t));
  const overSectionPanel=t=>!!(t&&t.closest&&t.closest("[data-sp-body],.sp-panel,.sp-cluster,[data-sp-drag-cl]"));

  function classify(dt){
    if(!dt)return null;
    const types=[...(dt.types||[])];
    if(types.includes("Files"))return "image";
    if(types.includes("text/uri-list"))return "link"; // link OR web image — resolved at drop
    if(types.includes("text/plain")||types.includes("text/html"))return "text";
    // Apps that build their own drag payload (Midjourney, Grok Imagine) put ONLY private
    // MIME types on the dataTransfer — none of the standard ones above. Returning null here
    // meant dragover never called preventDefault(), so the panel was not a valid drop target
    // and the cursor showed "no-drop" with no drop event at all. Accept the drag instead:
    // the page-side dragstart capture has already stashed the real bytes, and route() still
    // ignores the drop if nothing usable turns up.
    if(types.length)return "link";
    return null;
  }
  function show(m){
    const o=$d("dropCapture");if(!o)return;
    o.style.display="flex";
    const isText=m==="text";
    $d("dcNote").style.display=isText?"flex":"none";
    $d("dcClip").style.display=isText?"flex":"none";
    const single=$d("dcSingle");single.style.display=isText?"none":"flex";
    if(!isText){
      $d("dcIcon").textContent=m==="image"?"🖼️":"🔖";
      $d("dcTxt").textContent=m==="image"?"Drop to save to Photos":"Drop to save — image → Photos, link → Bookmark";
    }
  }
  function hide(){
    const o=$d("dropCapture");if(o)o.style.display="none";
    depth=0;mode=null;
    $d("dcNote")?.classList.remove("dc-hot");
    $d("dcClip")?.classList.remove("dc-hot");
  }
  function hotHalf(y){
    const top=y<window.innerHeight/2;
    $d("dcNote")?.classList.toggle("dc-hot",top);
    $d("dcClip")?.classList.toggle("dc-hot",!top);
    return top?"note":"clip";
  }

  window.addEventListener("dragenter",e=>{
    const dt=e.dataTransfer;if(!dt)return;
    if(isInternal(dt.types))return;              // moving cards/tiles inside PV
    if(overSectionPanel(e.target))return;        // let the panel-pin handler own it
    const m=classify(dt);if(!m)return;
    e.preventDefault();
    depth++;mode=m;show(m);
  },true);
  window.addEventListener("dragover",e=>{
    if(!mode)return;
    if(overSectionPanel(e.target)){hide();return}
    e.preventDefault();
    // Mirror what the source actually permits: a source that sets effectAllowed="move"
    // (or "link") rejects a "copy" dropEffect and Chrome falls back to the no-drop cursor.
    if(e.dataTransfer)try{
      const ea=String(e.dataTransfer.effectAllowed||"all").toLowerCase();
      e.dataTransfer.dropEffect=(ea==="all"||ea==="uninitialized"||ea.includes("copy"))?"copy":ea.includes("link")?"link":"move";
    }catch(_){/* some sources lock this */}
    if(mode==="text")hotHalf(e.clientY);
  },true);
  window.addEventListener("dragleave",e=>{
    if(!mode)return;
    depth--;
    if(depth<=0||e.relatedTarget===null)hide();
  },true);
  window.addEventListener("drop",e=>{
    if(!mode)return;
    if(e.defaultPrevented){hide();return}         // an inner handler (e.g. panel pin) already took it
    const dt=e.dataTransfer;const m=mode;const half=m==="text"?hotHalf(e.clientY):null;
    e.preventDefault();
    // Read synchronously — dataTransfer is emptied after the event.
    const payload={text:dt.getData("text/plain"),html:dt.getData("text/html"),uri:dt.getData("text/uri-list"),files:[...(dt.files||[])]};
    hide();
    route(m,half,payload);
  },true);

  function fileToDataUrl(f){return new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.onerror=()=>r("");fr.readAsDataURL(f)})}

  // If content.js captured the dragged image's real bytes in page context
  // (authed CDNs / blob: URLs — Grok, Midjourney, …), consume them here.
  function pvReadDragStash(){
    return new Promise(res=>{
      try{chrome.storage.local.get("pv_drag_image",r=>res((r&&r.pv_drag_image)||null))}catch(_){res(null)}
    });
  }
  async function pvConsumeDragImage(){
    let d=await pvReadDragStash();
    // The page stashes the URL synchronously but reads bytes asynchronously, so a quick drag
    // can land before they arrive. Only wait when waiting can actually help: a blob:/page-
    // scoped source is unfetchable by the service worker, so its bytes are the only way home.
    // An http(s) src needs no wait at all — the worker fetches it with host permissions.
    const needsBytes=x=>!!x&&!x.dataUrl&&!/^https?:/i.test(x.src||"");
    const deadline=Date.now()+1200;
    while(needsBytes(d)&&Date.now()<deadline){
      await new Promise(r=>setTimeout(r,60));
      d=await pvReadDragStash();
    }
    try{chrome.storage.local.remove("pv_drag_image")}catch(_){/* one-shot: always clear */}
    if(!d||(!d.dataUrl&&!d.src))return null;
    if((Date.now()-(d.ts||0))>=15000)return null;
    return {dataUrl:d.dataUrl||"",src:d.src||""};
  }

  function addPhoto(url){
    if(!url){flash("No image found in drop");return}
    flash("Fetching image…");
    try{chrome.runtime.sendMessage({type:"ADD_PHOTO_BY_URL",url,folderId:"phroot"},r=>{
      if(chrome.runtime.lastError||!r?.success){flash("Could not save that image");return}
      // A record with no bytes renders as an empty frame — name that instead of claiming success.
      const msg=r.hasBytes?"OK Photo saved":"Saved, but the image bytes couldn't be fetched";
      loadData().then(()=>{aTab="photos";flash(msg);render()});
    })}catch(_){flash("Could not save that image")}
  }

  // Create a Note / Clip / Bookmark in the right store, then jump there.
  function dropCreate(silo,value){
    const map={
      notes:{store:NT,root:"nroot",tab:"notes",label:"Note"},
      snippets:{store:SN,root:"s_inbox",tab:"snippets",label:"Clip"},
      bookmarks:{store:BM,root:"broot",tab:"bookmarks",label:"Bookmark"},
    };
    const M=map[silo];const store=M.store;if(!store)return;
    let f=findFolder(store.folders,M.root);
    if(silo==="snippets"&&!f){
      if(!store.folders.children.find(c=>c.id==="s_inbox"))store.folders.children.unshift({id:"s_inbox",name:"Inbox",children:[],prompts:[],color:""});
      f=findFolder(store.folders,"s_inbox");
    }
    if(!f)f=store.folders;
    pushUndo();
    let item;
    if(silo==="bookmarks"){
      const url=(value||"").trim();let title;try{title=new URL(url).hostname.replace("www.","")}catch(_){title=url.slice(0,60)||"Bookmark"}
      item=buildItem(store,title,"",[]);item.url=url;
    }else{
      const text=(value||"").trim();
      const title=(text.split("\n")[0]||"").slice(0,80).trim()||M.label;
      item=buildItem(store,title,text,[]);
      if(silo==="snippets"){item.sourceType="web";item.capturedAt=Date.now()}
    }
    item.provenance={source:"drag-drop",capturedAt:Date.now()};
    f.prompts=f.prompts||[];f.prompts.push(item);
    save();
    aTab=M.tab;const s=st();if(s){s.sel=f.id;s.view="list";s.exp&&(s.exp[f.id]=1)}
    flash("OK "+M.label+" saved");render();
  }

  async function route(m,half,pl){
    try{
      if(m==="text"){
        let text="";
        if(pl.html&&typeof htmlToFormattedText==="function"){try{text=htmlToFormattedText(pl.html)}catch(_){/* fall back to plain */}}
        if(!text)text=pl.text||"";
        if(!text.trim()){flash("Nothing to capture");return}
        dropCreate(half==="note"?"notes":"snippets",text);
        return;
      }
      if(m==="image"){
        const imgs=(pl.files||[]).filter(f=>f.type.startsWith("image/"));
        if(imgs.length){for(const f of imgs){const u=await fileToDataUrl(f);if(u)addPhoto(u)}return}
        // non-image file drop → ignore quietly
        if(pl.files&&pl.files.length){flash("Only images can drop into Photos");return}
      }
      // link OR web-image (uri-list present)
      const html=pl.html||"";
      const uri=(pl.uri||pl.text||"").trim();
      const imgSrc=(html.match(/<img[^>]+src="([^"]+)"/i)||[])[1]||"";
      const looksImg=/^data:image\//i.test(uri)||/\.(jpe?g|png|gif|webp|avif|svg|bmp)(\?|#|$)/i.test(uri)||!!imgSrc;
      // Real bytes captured on the SOURCE page survive auth walls / blob: URLs (Grok, Midjourney).
      // Consume the stash once, then trust it when the drop looks like an image OR the capture's
      // own source URL matches this drag — the latter rescues extensionless / blob: URLs that
      // arrive with no <img> in the drag HTML (so looksImg alone would miss them).
      const cap=await pvConsumeDragImage();
      const sameDrag=!!(cap&&cap.src&&(cap.src===uri||cap.src===imgSrc));
      // A custom-payload drag (Midjourney, Grok Imagine) exposes no URL to the drop at all —
      // whatever the source page captured for this drag IS the image.
      const capOnly=!!(cap&&(cap.dataUrl||cap.src)&&!uri&&!imgSrc);
      if(looksImg||sameDrag||capOnly){
        // Prefer real bytes; fall back to the URL, which the service worker fetches with
        // host permissions. A blob: URL is page-scoped, so without bytes it is unfetchable —
        // say so instead of filing a photo that can never render.
        const best=(cap&&cap.dataUrl)||imgSrc||uri||(cap&&cap.src)||"";
        if(!best||(/^blob:/i.test(best)&&!(cap&&cap.dataUrl))){flash("Couldn't read that image — try right-click → Save visual");return}
        addPhoto(best);
        return;
      }
      if(uri&&/^https?:\/\//i.test(uri)){dropCreate("bookmarks",uri);return}
      flash("Nothing to capture");
    }catch(_){flash("Capture failed")}
  }
})();

// ═══════ PROMPT CHAINS — UI ═══════
// The front door for src/prompt-chains.js. Lives as a view inside the Prompts tab
// (pSt.view==="chains") so it inherits the tab's chrome instead of claiming a new silo.
//
// Three surfaces: a chain list, a single chain's ordered steps, and a health panel that
// exposes the audit and its repairs. Every destructive action goes through pushUndo() first,
// and anything the enforcer flags is shown rather than quietly fixed.

function chainGoto(prefix){pSt._chainSel=prefix||"";pSt.view="chains";render()}

// ── Add / remove a prompt's chain membership ──
function chainAssignModal(item){
  if(!item)return;
  const g=pvChainGlossary();
  const prefixes=[...new Set([...Object.keys(g).filter(k=>/^[A-Z]{2}$/.test(k)),...pvChainCollect(P.folders).keys()])].sort();
  const rows=()=>prefixes.map(pfx=>{
    const steps=pvChainSteps(P.folders,pfx);
    const mine=steps.find(s=>String(s.item.id)===String(item.id));
    return `<label class="fpi" style="display:flex;align-items:center;gap:7px;padding:4px 6px;cursor:pointer"><input type="checkbox" class="ch-cb" value="${escAttr(pfx)}" ${mine?"checked":""} style="accent-color:var(--ac);flex-shrink:0"><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(pvChainTitle(pfx,g))}</span><span style="font-size:9px;color:var(--dm)">${mine?"step "+mine.index+" of "+mine.total:steps.length+" steps"}</span></label>`;
  }).join("");
  showModal(`<h3>${S.arrow} Chains for "${esc(item.title||"prompt")}"</h3>
    <p style="font-size:10px;color:var(--dm)">A prompt can be a step in several chains at once — it is referenced, not copied. Unchecking removes it from that chain only.</p>
    <div class="fp" id="chAsgList" style="max-height:220px;overflow-y:auto">${rows()||'<div class="cc-empty">No chains yet — create one below.</div>'}</div>
    <div style="display:flex;gap:4px;margin-top:8px"><input type="text" id="chAsgNew" placeholder="New chain name…" style="flex:1"><button class="bs" id="chAsgAdd">+ Create</button></div>
    <div class="brow" style="margin-top:8px"><button class="bg-btn" id="chAsgX">Cancel</button><button class="bp" id="chAsgY">Save</button></div>`,mc=>{
    mc.querySelector("#chAsgAdd").addEventListener("click",()=>{
      const inp=mc.querySelector("#chAsgNew"),nm=(inp.value||"").trim();
      if(!nm)return;
      pushUndo();
      const pfx=pvChainCreate(P.folders,nm);
      if(!pfx){flash("All 676 chain prefixes are in use");return}
      pvChainAppend(P.folders,item,pfx);save();closeModal();flash("Added to "+nm);render();
    });
    mc.querySelector("#chAsgX").addEventListener("click",closeModal);
    mc.querySelector("#chAsgY").addEventListener("click",()=>{
      const want=[...mc.querySelectorAll(".ch-cb:checked")].map(x=>x.value);
      pushUndo();
      for(const pfx of prefixes){
        const has=(item.chains||[]).some(t=>{const p=pvChainParseTag(t);return p&&p.prefix===pfx});
        if(want.includes(pfx)&&!has)pvChainAppend(P.folders,item,pfx);
        else if(!want.includes(pfx)&&has)pvChainRemove(item,pfx);
      }
      save();closeModal();flash("Chains updated");render();
    });
  });
}

// ── Health: everything the enforcer found, and the repairs offered for it ──
function chainHealthModal(){
  const audit=pvChainAudit(P.folders,pvChainGlossary());
  const sevColor=s=>s==="error"?"var(--dn)":s==="warn"?"var(--ac)":"var(--dm)";
  const list=audit.issues.length
    ? audit.issues.map(i=>`<div style="display:flex;gap:7px;align-items:baseline;padding:4px 0;border-bottom:1px solid var(--bl)"><span style="color:${sevColor(i.severity)};font-size:8px;text-transform:uppercase;font-weight:700;min-width:42px">${i.severity}</span><span style="flex:1;font-size:10px;line-height:1.5">${i.prefix?`<code style="color:var(--ac)">${esc(i.prefix)}</code> `:""}${esc(i.detail)}</span></div>`).join("")
    : `<div style="font-size:11px;color:var(--gn);padding:8px 0">${S.check} No problems found across ${audit.total} chain${audit.total===1?"":"s"}.</div>`;
  showModal(`<h3>Chain health</h3>
    <p style="font-size:10px;color:var(--dm)">${audit.errors} error${audit.errors===1?"":"s"} · ${audit.warnings} warning${audit.warnings===1?"":"s"} · ${audit.total} chain${audit.total===1?"":"s"}</p>
    <div style="max-height:220px;overflow-y:auto;margin-top:6px">${list}</div>
    <p style="font-size:9px;color:var(--mu);margin-top:8px;line-height:1.5">Repair renumbers duplicated and gapped stages, and names any chain missing a glossary entry. Quarantined annotations are kept, never deleted.</p>
    <div class="brow" style="margin-top:8px"><button class="bg-btn" id="chHX">Close</button><button class="bp" id="chHFix">Repair all</button></div>`,mc=>{
    mc.querySelector("#chHX").addEventListener("click",closeModal);
    mc.querySelector("#chHFix").addEventListener("click",()=>{
      pushUndo();
      const rep=pvChainRepair(P.folders,{compact:true});
      save();closeModal();
      flash(`Repaired — ${rep.compacted.length} renumbered, ${rep.named.length} named`);
      render();
    });
  });
}

// ── Picker: add an existing prompt as the next step of a chain ──
function chainAddStepModal(prefix){
  const all=allItems(P.folders).filter(p=>!(p.chains||[]).some(t=>{const x=pvChainParseTag(t);return x&&x.prefix===prefix}));
  const draw=(q)=>all.filter(p=>!q||(p.title||"").toLowerCase().includes(q)||(p.content||"").toLowerCase().includes(q))
    .slice(0,120).map(p=>`<div class="fpi" data-pid="${escAttr(p.id)}" style="padding:5px 6px;cursor:pointer;border-bottom:1px solid var(--bl)"><div style="font-size:11px">${esc(p.title||"Untitled")}</div><div style="font-size:9px;color:var(--dm)">${esc(p.folderName||"")}</div></div>`).join("")||'<div class="cc-empty">No matching prompts.</div>';
  showModal(`<h3>Add a step to "${esc(pvChainTitle(prefix))}"</h3>
    <input type="text" id="chStepQ" placeholder="Search prompts…" style="width:100%" autocomplete="off">
    <div class="fp" id="chStepList" style="max-height:240px;overflow-y:auto;margin-top:6px">${draw("")}</div>
    <div class="brow" style="margin-top:8px"><button class="bg-btn" id="chStepX">Close</button></div>`,mc=>{
    const listEl=mc.querySelector("#chStepList");
    mc.querySelector("#chStepQ").addEventListener("input",e=>{listEl.innerHTML=draw((e.target.value||"").toLowerCase().trim())});
    listEl.addEventListener("click",e=>{
      const row=e.target.closest("[data-pid]");if(!row)return;
      const live=allItems(P.folders).find(x=>String(x.id)===row.dataset.pid);
      const folder=live?findFolder(P.folders,live.folderId):null;
      const item=folder?.prompts?.find(x=>String(x.id)===row.dataset.pid);
      if(!item)return;
      pushUndo();pvChainAppend(P.folders,item,prefix);save();closeModal();flash("Step added");render();
    });
    mc.querySelector("#chStepQ").focus();
  });
}

// ── The panel ──
function renderChainManager(c){
  const g=pvChainGlossary(),audit=pvChainAudit(P.folders,g);
  const sel=pSt._chainSel&&audit.chains.find(x=>x.prefix===pSt._chainSel)?pSt._chainSel:"";
  const badge=audit.errors?`<span class="ch-badge ch-badge-err">${audit.errors}</span>`:audit.warnings?`<span class="ch-badge">${audit.warnings}</span>`:"";
  let h=`<div class="ch-hd"><button class="bs" id="chBack" ${sel?"":'style="display:none"'}>${S.rquote?"‹":"<"} All chains</button><span class="ch-ttl">${S.arrow} ${sel?esc(pvChainTitle(sel,g)):"Prompt Chains"}</span><span style="flex:1"></span><button class="bk-tb" id="chHealth" title="Chain health">${S.steth||"!"} Health ${badge}</button>${sel?"":'<button class="bs" id="chNew">+ New chain</button>'}</div>`;

  if(!sel){
    if(!audit.chains.length){
      h+=`<div class="cc-empty" style="margin-top:30px;line-height:1.7">No chains yet.<br><span style="font-size:9px">A chain is a sequence of prompts you fire one after another.<br>Create one, then add steps — or tag a prompt <code>AA1</code> in the CSV.</span></div>`;
    }else{
      h+=`<div class="ch-list">`;
      for(const ch of audit.chains){
        const trouble=ch.duplicates.length?`<span class="ch-warn ch-warn-err">${ch.duplicates.length} duplicate stage${ch.duplicates.length===1?"":"s"}</span>`:ch.gaps.length?`<span class="ch-warn">gap at ${ch.gaps.join(", ")}</span>`:"";
        h+=`<div class="ch-row" data-ch="${escAttr(ch.prefix)}"><div style="flex:1;min-width:0"><div class="ch-name"><code class="ch-pfx">${esc(ch.prefix)}</code> ${esc(ch.title)}</div><div class="ch-sub">${ch.count} step${ch.count===1?"":"s"} ${trouble}</div></div><button class="bs ch-run" data-run="${escAttr(ch.prefix)}" title="Inject step 1 and queue the rest">${S.bolt} Run</button></div>`;
      }
      h+=`</div>`;
    }
  }else{
    const steps=pvChainSteps(P.folders,sel);
    h+=`<div class="ch-acts"><button class="bs" id="chAddStep">+ Add step</button><button class="bs" id="chRun">${S.bolt} Run from step 1</button><button class="ib" id="chRename" title="Rename">${I.edit}</button><button class="ib dng" id="chDel" title="Delete chain">${I.trash}</button></div>`;
    if(!steps.length)h+=`<div class="cc-empty" style="margin-top:24px">This chain has no steps yet.</div>`;
    else{
      h+=`<div class="ch-steps">`;
      steps.forEach((s,i)=>{
        const gap=i>0&&s.stage!==steps[i-1].stage+1;
        if(gap)h+=`<div class="ch-gap">${S.warn||"!"} gap — a step was deleted here</div>`;
        h+=`<div class="ch-step" data-sid="${escAttr(s.item.id)}"><span class="ch-num">${s.index}</span><div style="flex:1;min-width:0"><div class="ch-name">${esc(s.item.title||"Untitled")}</div><div class="ch-sub">${esc(s.folder?.name||"")}</div></div><div class="ch-btns"><button class="ib" data-up="${escAttr(s.item.id)}" title="Move up" ${i===0?"disabled":""}>↑</button><button class="ib" data-down="${escAttr(s.item.id)}" title="Move down" ${i===steps.length-1?"disabled":""}>↓</button><button class="ib dng" data-rm="${escAttr(s.item.id)}" title="Remove from chain">${S.x}</button></div></div>`;
      });
      h+=`</div>`;
    }
  }
  c.innerHTML=h;

  $("chBack")?.addEventListener("click",()=>chainGoto(""));
  $("chHealth")?.addEventListener("click",chainHealthModal);
  $("chNew")?.addEventListener("click",()=>{
    showModal(`<h3>New chain</h3><input type="text" id="chNewI" placeholder="Chain name…" style="width:100%"><div class="brow"><button class="bg-btn" id="chNewX">Cancel</button><button class="bp" id="chNewY">Create</button></div>`,mc=>{
      const go=()=>{const nm=(mc.querySelector("#chNewI").value||"").trim();if(!nm)return;pushUndo();const pfx=pvChainCreate(P.folders,nm);if(!pfx){flash("All 676 chain prefixes are in use");return}save();closeModal();chainGoto(pfx)};
      mc.querySelector("#chNewY").addEventListener("click",go);
      mc.querySelector("#chNewI").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();go()}});
      mc.querySelector("#chNewX").addEventListener("click",closeModal);
      mc.querySelector("#chNewI").focus();
    });
  });
  c.querySelectorAll("[data-ch]").forEach(el=>el.addEventListener("click",e=>{
    if(e.target.closest("[data-run]"))return;
    chainGoto(el.dataset.ch);
  }));
  c.querySelectorAll("[data-run]").forEach(el=>el.addEventListener("click",e=>{e.stopPropagation();chainRun(el.dataset.run)}));
  $("chRun")?.addEventListener("click",()=>chainRun(sel));
  $("chAddStep")?.addEventListener("click",()=>chainAddStepModal(sel));
  $("chRename")?.addEventListener("click",()=>{
    showModal(`<h3>Rename chain</h3><input type="text" id="chRnI" value="${escAttr(pvChainTitle(sel,g))}" style="width:100%"><div class="brow"><button class="bg-btn" id="chRnX">Cancel</button><button class="bp" id="chRnY">Save</button></div>`,mc=>{
      const go=()=>{const nm=(mc.querySelector("#chRnI").value||"").trim();if(!nm)return;pushUndo();g[sel]=g[sel]||{};g[sel].title=nm;save();closeModal();render()};
      mc.querySelector("#chRnY").addEventListener("click",go);
      mc.querySelector("#chRnI").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();go()}});
      mc.querySelector("#chRnX").addEventListener("click",closeModal);
      const i2=mc.querySelector("#chRnI");i2.focus();i2.select();
    });
  });
  $("chDel")?.addEventListener("click",()=>{
    const n=pvChainSteps(P.folders,sel).length;
    showModal(`<h3 style="color:var(--dn)">Delete "${esc(pvChainTitle(sel,g))}"?</h3><p style="font-size:10px;line-height:1.6">The ${n} prompt${n===1?"":"s"} in this chain are <strong>not</strong> deleted — only their membership in it is removed. Undo restores the chain.</p><div class="brow"><button class="bg-btn" id="chDX">Cancel</button><button class="bdn" id="chDY">Delete chain</button></div>`,mc=>{
      mc.querySelector("#chDX").addEventListener("click",closeModal);
      mc.querySelector("#chDY").addEventListener("click",()=>{
        pushUndo();
        for(const s of pvChainSteps(P.folders,sel))pvChainRemove(s.item,sel);
        delete g[sel];save();closeModal();flash("Chain deleted");chainGoto("");
      });
    });
  });
  // Reorder / remove a step
  const move=(id,dir)=>{
    const ids=pvChainSteps(P.folders,sel).map(s=>String(s.item.id));
    const i=ids.indexOf(String(id)),j=i+dir;
    if(i<0||j<0||j>=ids.length)return;
    ids.splice(j,0,ids.splice(i,1)[0]);
    pushUndo();pvChainReorder(P.folders,sel,ids);save();render();
  };
  c.querySelectorAll("[data-up]").forEach(el=>el.addEventListener("click",()=>move(el.dataset.up,-1)));
  c.querySelectorAll("[data-down]").forEach(el=>el.addEventListener("click",()=>move(el.dataset.down,1)));
  c.querySelectorAll("[data-rm]").forEach(el=>el.addEventListener("click",()=>{
    const step=pvChainSteps(P.folders,sel).find(s=>String(s.item.id)===el.dataset.rm);
    if(!step)return;
    pushUndo();pvChainRemove(step.item,sel);pvChainCompact(P.folders,sel);save();flash("Removed from chain");render();
  }));
  c.querySelectorAll(".ch-step").forEach(el=>el.addEventListener("click",e=>{
    if(e.target.closest("button"))return;
    const step=pvChainSteps(P.folders,sel).find(s=>String(s.item.id)===el.dataset.sid);
    if(step){pSt.sel=step.folder?.id||pSt.sel;openItem(step.item)}
  }));
}

// Start a run: inject step 1 and let the chamber carry the rest.
function chainRun(prefix){
  const steps=pvChainSteps(P.folders,prefix);
  if(!steps.length){flash("This chain has no steps");return}
  pSt._chainRun=prefix;
  const first=steps[0];
  pSt.sel=first.folder?.id||pSt.sel;
  handleUse(first.folder?.id,first.item,"inject");
}

// ═══════ CLAUDE COMMANDS LIBRARY ═══════
// A browsable "icon section" for the master Claude cheat sheet (bundled data in
// claude-commands-data.js → global PV_CLAUDE_COMMANDS). Search by name/tag/group,
// glossary descriptions, click-to-inject (copies + injects into the active page),
// and save individual commands or the whole set into the Prompts silo.

function pvCcData(){return (typeof PV_CLAUDE_COMMANDS!=="undefined"&&PV_CLAUDE_COMMANDS)||{groups:[]}}
// ── User layer: favorites, folders, and duplicates ──
// Kept in cfg, which already rides save/backup/Drive-sync (ensureDefaults fills missing keys
// and preserves unknown ones), so none of the storage plumbing has to know about it.
// Commands are referenced by a stable key rather than copied, which is what lets one command
// sit in any number of folders at once.
function pvCcKey(c){return (c&&c._custom&&c.key)?c.key:(((c&&c._group)||"")+"|"+((c&&c.name)||""))}
function pvCcCfg(){return (typeof cfg!=="undefined"&&cfg)?cfg:null}
function pvCcCustomList(){const k=pvCcCfg();if(!k)return[];k.ccCustom=Array.isArray(k.ccCustom)?k.ccCustom:[];return k.ccCustom}
function pvCcFavs(){const k=pvCcCfg();if(!k)return[];k.ccFav=Array.isArray(k.ccFav)?k.ccFav:[];return k.ccFav}
function pvCcFolders(){const k=pvCcCfg();if(!k)return[];k.ccFolders=Array.isArray(k.ccFolders)?k.ccFolders:[];k.ccFolders.forEach(f=>{f.parentId=typeof f.parentId==="string"?f.parentId:"";f.kind=f.kind==="playlist"?"playlist":"folder";f.items=Array.isArray(f.items)?f.items:[]});return k.ccFolders}
function pvCcIsFav(key){return pvCcFavs().includes(key)}
function pvCcToggleFav(key){
  const f=pvCcFavs(),i=f.indexOf(key);
  if(i>=0)f.splice(i,1);else f.push(key);
  save();return i<0;
}
function pvCcNewFolder(name,parentId="",kind="folder"){
  const f={id:"ccf_"+Date.now().toString(36)+"_"+pvCcFolders().length,name:(name||"").trim()||(kind==="playlist"?"Playlist":"Folder"),parentId:parentId||"",kind:kind==="playlist"?"playlist":"folder",color:"",items:[]};
  pvCcFolders().push(f);save();return f;
}
function pvCcChildren(parentId=""){return pvCcFolders().filter(f=>(f.parentId||"")===(parentId||""))}
function pvCcDescendantIds(fid,set=new Set()){for(const f of pvCcChildren(fid)){set.add(f.id);pvCcDescendantIds(f.id,set)}return set}
function pvCcFolderHas(fid,key){const f=pvCcFolders().find(x=>x.id===fid);return !!(f&&(f.items||[]).includes(key))}
function pvCcFoldersOf(key){return pvCcFolders().filter(f=>(f.items||[]).includes(key))}
// Membership is by key, so filing a command into a second folder neither copies nor moves it.
function pvCcSetFolders(key,ids){
  pvCcFolders().forEach(f=>{
    f.items=Array.isArray(f.items)?f.items:[];
    const has=f.items.includes(key),want=ids.includes(f.id);
    if(want&&!has)f.items.push(key);
    else if(!want&&has)f.items=f.items.filter(x=>x!==key);
  });
  save();
}
function pvCcDeleteFolder(fid){
  const k=pvCcCfg();if(!k)return;
  const ids=pvCcDescendantIds(fid);ids.add(fid);k.ccFolders=pvCcFolders().filter(f=>!ids.has(f.id));save();
}
function pvCcMoveInFolder(fid,key,delta){
  const f=pvCcFolders().find(x=>x.id===fid);if(!f||f.kind!=="playlist")return false;
  const i=f.items.indexOf(key),to=Math.max(0,Math.min(f.items.length-1,i+delta));if(i<0||i===to)return false;
  const [moved]=f.items.splice(i,1);f.items.splice(to,0,moved);save();return true;
}
function pvCcFolderTreeHtml(parentId="",depth=0,active=""){
  return pvCcChildren(parentId).map(f=>`<div class="cc-tree-row${active===f.id?' active':''}" data-scope="${escAttr(f.id)}" data-cc-folder="${escAttr(f.id)}" style="padding-left:${5+depth*13}px"><span>${f.kind==="playlist"?'▶':'📁'}</span><span>${esc(f.name)}</span><span class="cc-tree-kind">${f.kind}</span><span class="cc-tree-count">${(f.items||[]).length}</span></div>${pvCcFolderTreeHtml(f.id,depth+1,active)}`).join("")
}
// A duplicate is an independent, editable command — the way to keep a tweaked variant of a
// bundled one without losing the original.
function pvCcDuplicate(c){
  if(!c||!pvCcCfg())return null;
  const taken=new Set(pvCcFlat().map(x=>x.name));
  const base=c.name||"Command";
  let name=base+" (copy)",n=2;
  while(taken.has(name))name=base+" (copy "+(n++)+")";
  const dup={key:"ccx_"+Date.now().toString(36)+"_"+pvCcCustomList().length,name,inject:c.inject||"",description:c.description||"",example:c.example||"",tags:(c.tags||[]).slice(),group:c._group||"My Commands"};
  pvCcCustomList().push(dup);save();return dup;
}
function pvCcDeleteCustom(key){
  const k=pvCcCfg();if(!k)return;
  k.ccCustom=pvCcCustomList().filter(x=>x.key!==key);
  k.ccFav=pvCcFavs().filter(x=>x!==key);                                  // no favourite pointing at a ghost
  pvCcFolders().forEach(f=>{f.items=(f.items||[]).filter(x=>x!==key)});   // and no folder either
  save();
}

function pvCcFlat(){
  const out=[];
  (pvCcData().groups||[]).forEach(g=>(g.commands||[]).forEach(c=>out.push(Object.assign({_group:g.name,_icon:g.icon},c))));
  // User duplicates ride alongside the bundled catalog so they search, filter and file identically.
  pvCcCustomList().forEach(c=>out.push(Object.assign({},c,{_group:c.group||"My Commands",_icon:"✎",_custom:true})));
  return out;
}
function pvCcSlug(s){return "p_cc_"+String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"").slice(0,40)}
function pvCcRoot(create){
  let f=findFolder(P.folders,"p_claude_cmds");
  if(!f&&create){f={id:"p_claude_cmds",name:"⌨️ Claude Commands",children:[],prompts:[],color:"#4a6ab0"};P.folders.children=P.folders.children||[];P.folders.children.push(f)}
  return f;
}
function pvCcGroupFolder(root,groupName,create){
  const id=pvCcSlug(groupName);
  let f=findFolder(P.folders,id);
  if(!f&&create){f={id,name:groupName,children:[],prompts:[],color:""};root.children=root.children||[];root.children.push(f)}
  return f;
}
function pvCcMakeItem(c){
  const item=buildItem(P,c.name||"Command",c.inject||"",(c.tags||[]).slice());
  item.description=c.description||"";item.goal="";item.platform="";
  item.provenance={source:"claude-commands",group:c._group||"",capturedAt:Date.now()};
  return item;
}
// Copy + inject a command into the active page (falls back to clipboard).
function pvCcUse(c){
  if(!c)return;
  if(typeof inject==="function")inject(c.inject||"");
  else navigator.clipboard.writeText(c.inject||"").then(()=>flash("Copied — Ctrl+V to paste")).catch(()=>flash("Copy failed"));
}
function pvCcSaveOne(c){
  if(!c)return;
  const existingGroup=findFolder(P.folders,pvCcSlug(c._group));
  if(existingGroup&&(existingGroup.prompts||[]).find(p=>p.title===c.name)){flash("Already in your vault");return}
  pushUndo();
  const root=pvCcRoot(true),sub=pvCcGroupFolder(root,c._group,true);
  sub.prompts=sub.prompts||[];sub.prompts.push(pvCcMakeItem(c));
  save();flash("Saved to Prompts › Claude Commands");
}
function pvCcSaveAll(){
  pushUndo();
  const root=pvCcRoot(true);let added=0;
  (pvCcData().groups||[]).forEach(g=>{
    const sub=pvCcGroupFolder(root,g.name,true);sub.prompts=sub.prompts||[];
    (g.commands||[]).forEach(c=>{
      if(sub.prompts.find(p=>p.title===c.name))return;
      sub.prompts.push(pvCcMakeItem(Object.assign({_group:g.name},c)));added++;
    });
  });
  save();
  aTab="prompts";pSt.sel="p_claude_cmds";pSt.view="list";if(pSt.exp){pSt.exp.p_claude_cmds=1;pSt.exp.root=1}
  closeModal();flash(added?("Added "+added+" commands to Prompts › Claude Commands"):"All commands already in your vault");render();
}
// Full-screen reader — the roomy standalone page (fullview-commands.html) opened in its
// own window, where there's space to actually read the whole cheat sheet.
function openClaudeCommandsFull(){
  const page="fullview-commands.html";
  try{chrome.windows.create({url:chrome.runtime.getURL(page),type:"popup",width:1180,height:820})}
  catch(e){chrome.runtime.sendMessage({type:"OPEN_FULLVIEW",page})}
}

// Multi-select folder picker — the same shape as "Copy to folders…" elsewhere in the vault,
// except nothing is copied: checking a second folder just adds another reference.
function pvCcFoldersModal(c){
  const key=pvCcKey(c);
  const depthOf=f=>{let d=0,p=f;while(p?.parentId&&d<6){p=pvCcFolders().find(x=>x.id===p.parentId);d++}return d};
  const rows=()=>pvCcFolders().map(f=>`<label class="fpi" style="display:flex;align-items:center;gap:7px;padding:4px 6px 4px ${6+depthOf(f)*12}px;cursor:pointer"><input type="checkbox" class="ccf-cb" value="${escAttr(f.id)}" ${pvCcFolderHas(f.id,key)?"checked":""} style="accent-color:var(--cc);flex-shrink:0"><span>${f.kind==="playlist"?'▶':'📁'}</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(f.name)}</span><span style="font-size:9px;color:var(--dm)">${(f.items||[]).length}</span></label>`).join("");
  showModal(`<h3>Add to folders & playlists</h3>
    <p style="font-size:10px;color:var(--dm)">“${esc(c.name)}” can sit in as many folders as you like — it is referenced, not copied, so editing or unfiling it in one place leaves the others alone.</p>
    <div class="fp" id="ccfList" style="max-height:230px;overflow-y:auto">${rows()||'<div class="cc-empty">No folders yet — make one below.</div>'}</div>
    <div style="display:flex;gap:4px;margin-top:8px"><input type="text" id="ccfNew" placeholder="New folder or playlist name…" style="flex:1"><button class="bs" id="ccfAdd">+ Folder</button><button class="bs" id="ccpAdd">+ Playlist</button></div>
    <div class="brow" style="margin-top:8px"><button class="bg-btn" id="ccfX">Cancel</button><button class="bp" id="ccfY">Save</button></div>`,mc=>{
    const addFolder=(kind="folder")=>{
      const inp=mc.querySelector("#ccfNew"),nm=(inp.value||"").trim();
      if(!nm)return;
      const checked=[...mc.querySelectorAll(".ccf-cb:checked")].map(x=>x.value);
      const f=pvCcNewFolder(nm,"",kind);checked.push(f.id);
      inp.value="";
      mc.querySelector("#ccfList").innerHTML=rows();
      mc.querySelectorAll(".ccf-cb").forEach(cb=>{cb.checked=checked.includes(cb.value)});
    };
    mc.querySelector("#ccfAdd").addEventListener("click",()=>addFolder("folder"));
    mc.querySelector("#ccpAdd").addEventListener("click",()=>addFolder("playlist"));
    mc.querySelector("#ccfNew").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addFolder("folder")}});
    mc.querySelector("#ccfX").addEventListener("click",closeModal);
    mc.querySelector("#ccfY").addEventListener("click",()=>{
      pvCcSetFolders(key,[...mc.querySelectorAll(".ccf-cb:checked")].map(x=>x.value));
      closeModal();flash("Folders updated");render();
    });
  });
}

// Editor for a duplicate. Bundled commands stay read-only — duplicate first, then edit.
function pvCcEditCustom(c){
  const item=pvCcCustomList().find(x=>x.key===c.key);if(!item)return;
  showModal(`<h3>Edit command</h3>
    <input type="text" id="ccEName" value="${escAttr(item.name)}" placeholder="Name" style="width:100%">
    <input type="text" id="ccEDesc" value="${escAttr(item.description||"")}" placeholder="What it does" style="width:100%;margin-top:5px">
    <textarea id="ccEInject" placeholder="Text injected when you use it" style="width:100%;margin-top:5px;min-height:90px">${esc(item.inject||"")}</textarea>
    <input type="text" id="ccETags" value="${escAttr((item.tags||[]).join(", "))}" placeholder="tags, comma separated" style="width:100%;margin-top:5px">
    <div class="brow" style="margin-top:8px"><button class="bg-btn" id="ccEX">Cancel</button><button class="bp" id="ccEY">Save</button></div>`,mc=>{
    mc.querySelector("#ccEX").addEventListener("click",closeModal);
    mc.querySelector("#ccEY").addEventListener("click",()=>{
      const nm=(mc.querySelector("#ccEName").value||"").trim();
      if(!nm){flash("Give it a name");return}
      item.name=nm;
      item.description=(mc.querySelector("#ccEDesc").value||"").trim();
      item.inject=mc.querySelector("#ccEInject").value||"";
      item.tags=(mc.querySelector("#ccETags").value||"").split(",").map(t=>t.trim()).filter(Boolean);
      save();closeModal();flash("Saved");render();
    });
    const f=mc.querySelector("#ccEName");if(f){f.focus();f.select()}
  });
}

// Inline tab panel — Claude Commands lives in the main tab bar (aTab==="claudecmds"),
// rendered full-width into #main. Search/scope/group state persists for the session.
let _ccPanelSt={g:"",q:"",scope:"all"};
function pvCcCreateContainerModal(kind="folder",parentId=""){
  const label=kind==="playlist"?"playlist":"folder";
  showModal(`<h3>New command ${label}</h3><input type="text" id="ccNfI" placeholder="${kind==="playlist"?'Playlist':'Folder'} name…" style="width:100%"><div class="brow"><button class="bg-btn" id="ccNfX">Cancel</button><button class="bp" id="ccNfY">Create</button></div>`,mc=>{
    const go=()=>{const nm=(mc.querySelector("#ccNfI").value||"").trim();if(!nm)return;const f=pvCcNewFolder(nm,parentId,kind);closeModal();_ccPanelSt.scope=f.id;flash(kind==="playlist"?"Playlist created":"Folder created");render()};
    mc.querySelector("#ccNfY").addEventListener("click",go);mc.querySelector("#ccNfI").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();go()}});mc.querySelector("#ccNfX").addEventListener("click",closeModal);mc.querySelector("#ccNfI").focus();
  });
}
function renderClaudeCommands(){
  const m=$("main");if(!m)return;
  const flat=pvCcFlat(),groups=pvCcData().groups||[];
  if(!flat.length){
    m.innerHTML=`<div class="cc-panel"><div class="cc-scroll"><div class="cc-empty" style="margin-top:40px">No command data loaded.<br>Reload the extension to restore the bundled cheat sheet.</div></div></div>`;
    updTabs();rFtr();return;
  }
  const st2=_ccPanelSt;
  const favs=pvCcFavs(),folders=pvCcFolders();
  // Scope survives a folder being deleted elsewhere.
  if(st2.scope!=="all"&&st2.scope!=="fav"&&!folders.some(f=>f.id===st2.scope))st2.scope="all";
  const inScope=c=>{
    if(st2.scope==="all")return true;
    const k=pvCcKey(c);
    return st2.scope==="fav"?pvCcIsFav(k):pvCcFolderHas(st2.scope,k);
  };
  const scopeChips=`<button class="cc-chip${st2.scope==="all"?" cc-chip-a":""}" data-scope="all">All <span class="cc-n">${flat.length}</span></button>`+
    `<button class="cc-chip${st2.scope==="fav"?" cc-chip-a":""}" data-scope="fav">${S.star} Favorites <span class="cc-n">${favs.length}</span></button>`+
    `<button class="cc-chip cc-chip-add" id="ccNewFolder" title="Create a command folder">${I.plus||"+"} Folder</button><button class="cc-chip cc-chip-add" id="ccNewPlaylist" title="Create an ordered command playlist">${I.plus||"+"} Playlist</button>`;
  const chips=`<button class="cc-chip${st2.g?"":" cc-chip-a"}" data-g="">All groups</button>`+
    groups.map(g=>`<button class="cc-chip${st2.g===g.name?" cc-chip-a":""}" data-g="${escAttr(g.name)}">${g.icon} ${esc(g.name)} <span class="cc-n">${(g.commands||[]).length}</span></button>`).join("");
  const activeContainer=folders.find(f=>f.id===st2.scope);
  m.innerHTML=`<div class="cc-panel">${claudeToolsHeader("commands")}
    <div class="cc-panel-hd">
      <div class="cc-panel-top"><div class="cc-panel-ttl">⌨️ Claude Commands</div><div class="cc-panel-acts"><button class="bk-tb expand-btn" id="ccExpand" title="Open the full-screen reader">${S.expand} Expand</button><button class="bs" id="ccSaveAll" title="Add every command to Prompts › Claude Commands">${I.plus||"+"} Add all to vault</button></div></div>
      <div class="cc-sub">${flat.length} commands · click a row to copy + inject · ${S.star} to favorite, ⋯ to file or duplicate</div>
      <input type="text" id="ccSearch" placeholder="Search name, description, tag, group…" autocomplete="off" value="${escAttr(st2.q)}">
      <div class="cc-chips cc-scopes" id="ccScopes">${scopeChips}</div>
      <div class="cc-tree" id="ccTree"><div class="cc-tree-row${st2.scope==="all"?' active':''}" data-scope="all"><span>⌨</span><span>All commands</span><span class="cc-tree-count">${flat.length}</span></div><div class="cc-tree-row${st2.scope==="fav"?' active':''}" data-scope="fav"><span>★</span><span>Favorites</span><span class="cc-tree-count">${favs.length}</span></div>${pvCcFolderTreeHtml("",0,st2.scope)||'<div class="cc-empty">No command folders yet.</div>'}</div>
      ${activeContainer?.kind==="playlist"?`<div class="cc-playlist-acts"><button class="bs" id="ccCopyPlaylist">${I.copy} Copy playlist</button><span class="cc-sub">Ordered top to bottom · use ⋯ to move a command</span></div>`:""}
      <div class="cc-chips" id="ccChips">${chips}</div>
    </div>
    <div class="cc-scroll"><div id="ccList" class="cc-list cc-list-panel"></div></div>
  </div>`;
  const listEl=m.querySelector("#ccList");
  const match=c=>{
    if(!inScope(c))return false;
    if(st2.g&&c._group!==st2.g)return false;
    if(!st2.q)return true;
    const q=st2.q;
    return (c.name||"").toLowerCase().includes(q)||(c.description||"").toLowerCase().includes(q)||(c._group||"").toLowerCase().includes(q)||(c.inject||"").toLowerCase().includes(q)||(c.tags||[]).some(t=>String(t).toLowerCase().includes(q));
  };
  const emptyMsg=()=>{
    if(st2.q)return `No commands match “${esc(st2.q)}”.`;
    if(st2.scope==="fav")return `No favorites yet — tap ${S.star} on any command to keep it here.`;
    if(st2.scope!=="all")return "This folder is empty — use ⋯ → Add to folders on any command.";
    return "No commands.";
  };
  const draw=()=>{
    let rows=flat.filter(match);
    const scopeFolder=folders.find(f=>f.id===st2.scope);
    if(scopeFolder?.kind==="playlist"){
      const order=new Map((scopeFolder.items||[]).map((key,i)=>[key,i]));
      rows=rows.slice().sort((a,b)=>(order.get(pvCcKey(a))??99999)-(order.get(pvCcKey(b))??99999));
    }
    if(!rows.length){listEl.innerHTML=`<div class="cc-empty">${emptyMsg()}</div>`;return}
    const cap=rows.slice(0,600);
    listEl.innerHTML=cap.map(c=>{
      const i=flat.indexOf(c),k=pvCcKey(c),fav=pvCcIsFav(k);
      const ex=c.example?`<div class="cc-exrow"><span class="cc-ex-lbl">e.g.</span> <code>${esc(c.example)}</code></div>`:"";
      const inF=pvCcFoldersOf(k);
      const fchips=inF.length?`<span class="cc-inf">${inF.map(f=>esc(f.name)).join(" · ")}</span>`:"";
      return `<div class="cc-row" data-i="${i}"><button class="cc-star${fav?" on":""}" data-fav="${i}" title="${fav?"Remove from favorites":"Add to favorites"}">${fav?S.star:S.starEmpty}</button><div class="cc-main"><div class="cc-name">${c._icon} <code>${esc(c.name)}</code> <span class="cc-grp">${esc(c._group)}</span>${c._custom?'<span class="cc-mine">mine</span>':''}</div><div class="cc-desc">${esc(c.description)}</div>${ex}<div class="cc-tags">${(c.tags||[]).slice(0,6).map(t=>`<span class="cc-tag">${esc(t)}</span>`).join("")}${fchips}</div></div><div class="cc-acts"><button class="bs cc-use" data-i="${i}" title="Copy + inject into the active page">Use</button><button class="ib cc-menu" data-i="${i}" title="More actions">${I.more||"⋯"}</button></div></div>`;
    }).join("")+(rows.length>cap.length?`<div class="cc-more">Showing first ${cap.length} of ${rows.length} — refine your search.</div>`:"");
  };
  draw();
  m.querySelector("#ccSearch")?.addEventListener("input",e=>{st2.q=(e.target.value||"").toLowerCase().trim();draw()});
  wireClaudeToolsHeader(m);
  m.querySelectorAll("#ccScopes [data-scope],#ccTree [data-scope]").forEach(ch=>ch.addEventListener("click",()=>{st2.scope=ch.dataset.scope;render()}));
  m.querySelector("#ccNewFolder")?.addEventListener("click",()=>pvCcCreateContainerModal("folder"));
  m.querySelector("#ccNewPlaylist")?.addEventListener("click",()=>pvCcCreateContainerModal("playlist"));
  m.querySelector("#ccCopyPlaylist")?.addEventListener("click",()=>{const f=pvCcFolders().find(x=>x.id===st2.scope);if(!f)return;const byKey=new Map(flat.map(c=>[pvCcKey(c),c]));const text=(f.items||[]).map(k=>byKey.get(k)?.inject||"").filter(Boolean).join("\n\n");navigator.clipboard.writeText(text).then(()=>flash("Playlist copied in order")).catch(()=>flash("Copy failed"))});
  m.querySelectorAll("#ccChips .cc-chip").forEach(ch=>ch.addEventListener("click",()=>{
    st2.g=ch.dataset.g||"";
    m.querySelectorAll("#ccChips .cc-chip").forEach(x=>x.classList.toggle("cc-chip-a",x===ch));
    draw();
  }));
  listEl.addEventListener("click",e=>{
    const st=e.target.closest("[data-fav]");
    if(st){const c=flat[+st.dataset.fav];pvCcToggleFav(pvCcKey(c));render();return}
    const mo=e.target.closest(".cc-menu");
    if(mo){
      const c=flat[+mo.dataset.i],k=pvCcKey(c),fav=pvCcIsFav(k);
      const items=[
        {a:"fav",l:fav?"Remove from favorites":"Add to favorites",ic:S.star,fn:()=>{pvCcToggleFav(k);render()}},
        {a:"fold",l:"Add to folders & playlists…",fn:()=>pvCcFoldersModal(c)},
        {a:"dup",l:"Duplicate",ic:I.copy,fn:()=>{const d=pvCcDuplicate(c);if(d){flash("Duplicated — edit your copy");render()}}},
      ];
      const activePlaylist=pvCcFolders().find(x=>x.id===st2.scope&&x.kind==="playlist");
      if(activePlaylist&&pvCcFolderHas(activePlaylist.id,k))items.push({a:"up",l:"Move earlier in playlist",fn:()=>{pvCcMoveInFolder(activePlaylist.id,k,-1);render()}},{a:"down",l:"Move later in playlist",fn:()=>{pvCcMoveInFolder(activePlaylist.id,k,1);render()}});
      if(c._custom)items.push({sep:1},{a:"edit",l:"Edit…",ic:I.edit,fn:()=>pvCcEditCustom(c)},{a:"del",l:"Delete",ic:I.trash,cls:"dng",fn:()=>{pvCcDeleteCustom(k);flash("Deleted");render()}});
      items.push({sep:1},{a:"save",l:"Save to Prompts",ic:I.plus,fn:()=>pvCcSaveOne(c)});
      showContextMenuAt(mo,items);
      return;
    }
    const use=e.target.closest(".cc-use");
    if(use){pvCcUse(flat[+use.dataset.i]);return}
    const row=e.target.closest(".cc-row");
    if(row)pvCcUse(flat[+row.dataset.i]);
  });
  // Right-click a tree node to add children, rename, or remove it.
  m.querySelectorAll("#ccTree [data-cc-folder]").forEach(ch=>{
    const fid=ch.dataset.scope;
    if(fid==="all"||fid==="fav")return;
    ch.addEventListener("contextmenu",e=>showContextMenu(e,[
      {a:"sub",l:"New subfolder…",ic:I.plus,fn:()=>pvCcCreateContainerModal("folder",fid)},
      {a:"play",l:"New playlist here…",ic:I.plus,fn:()=>pvCcCreateContainerModal("playlist",fid)},
      {a:"rn",l:"Rename…",ic:I.edit,fn:()=>{
        const f=pvCcFolders().find(x=>x.id===fid);if(!f)return;
        showModal(`<h3>Rename folder</h3><input type="text" id="ccRnI" value="${escAttr(f.name)}" style="width:100%"><div class="brow"><button class="bg-btn" id="ccRnX">Cancel</button><button class="bp" id="ccRnY">Save</button></div>`,mc=>{
          const go=()=>{f.name=(mc.querySelector("#ccRnI").value||"").trim()||f.name;save();closeModal();render()};
          mc.querySelector("#ccRnY").addEventListener("click",go);
          mc.querySelector("#ccRnI").addEventListener("keydown",ev=>{if(ev.key==="Enter"){ev.preventDefault();go()}});
          mc.querySelector("#ccRnX").addEventListener("click",closeModal);
          const i2=mc.querySelector("#ccRnI");i2.focus();i2.select();
        });
      }},
      {a:"del",l:"Delete folder / playlist",ic:I.trash,cls:"dng",fn:()=>{pvCcDeleteFolder(fid);flash("Command container deleted");render()}},
    ]));
  });
  m.querySelector("#ccExpand")?.addEventListener("click",openClaudeCommandsFull);
  m.querySelector("#ccSaveAll")?.addEventListener("click",pvCcSaveAll);
  updTabs();rFtr();
}

// ═════════ FIRST-RUN TRUST ONBOARDING ═════════
const PV_TRUST_ONBOARDING_VERSION=1;
function shouldShowTrustOnboarding(){return !meta?.trustOnboardingVersion&&(meta?.sc||0)===0&&Cloud.itemCounts().total===0}
function openTrustOnboarding(force){
  if(!force&&!shouldShowTrustOnboarding())return;
  showModal(`<div class="trust-onboard"><div class="trust-kicker">Before you start</div><h3>Your vault, your rules</h3><p>Prompt Vault is local-first. These choices control the only optional page-reading and network behaviors.</p><div class="trust-choice"><div><strong>AI response save buttons</strong><small>When enabled, recognized AI pages are observed so save buttons can appear. Captures still open a review screen before saving.</small></div><label class="toggle"><input type="checkbox" id="toCapture" ${cfg.captureEnabled?'checked':''}><span class="slider"></span></label></div><div class="trust-choice"><div><strong>Bookmark site icons</strong><small>Served from Chrome's local favicon cache — no requests leave your device. Off hides icons entirely.</small></div><label class="toggle"><input type="checkbox" id="toFavicons" ${!cfg.faviconsDisabled?'checked':''}><span class="slider"></span></label></div><div class="trust-choice"><div><strong>Google Drive metadata backup</strong><small>Optional OAuth connection using drive.file. Drive JSON does not include full-resolution attachment bytes.</small></div><label class="toggle"><input type="checkbox" id="toDrive"><span class="slider"></span></label></div><div class="trust-note"><strong>For complete safekeeping:</strong> use Recovery → Encrypted full portable backup. The side-panel privacy screen is not encryption.</div><div class="brow"><button class="bg-btn" id="toLocal">Use local-only defaults</button><button class="bp" id="toSave">Save choices</button></div></div>`,mc=>{
    const finish=async(localOnly)=>{cfg.captureEnabled=localOnly?false:mc.querySelector("#toCapture").checked;cfg.faviconsDisabled=localOnly?false:!mc.querySelector("#toFavicons").checked;/* site icons are served from Chrome's local cache, so local-only keeps them on */const connect=!localOnly&&mc.querySelector("#toDrive").checked;meta.trustOnboardingVersion=PV_TRUST_ONBOARDING_VERSION;save();chrome.storage.local.set({[MK]:meta});closeModal();flash("Trust settings saved");if(connect){try{await Cloud.connect()}catch{/* Connection UI reports OAuth errors; trust choices remain saved. */}render()}};
    mc.querySelector("#toLocal").addEventListener("click",()=>finish(true));mc.querySelector("#toSave").addEventListener("click",()=>finish(false));
  });
}

// ═══════ INIT ═══════
// View-state sync (shared with full-view windows via viewstate-shared.js)
let _vsReady=false;
const _VS_KEYS=["exp","sel","sort","q","view","treeOn","listMode","collFilter","tagFilter","platFilter"];
const _VS_SILOS=["prompts","snippets","notes","customgpts","bookmarks","skills","projects"];
function _vsStateFor(silo){return (typeof _TST!=="undefined"&&_TST[silo])?_TST[silo]():null;}
function _vsHydrate(vs){
  if(!vs)return;
  _VS_SILOS.forEach(function(silo){
    var saved=vs[silo]; if(!saved)return;
    var stObj=_vsStateFor(silo); if(!stObj)return;
    _VS_KEYS.forEach(function(k){
      if(saved[k]===undefined)return;
      stObj[k]=(k==="exp"&&saved.exp&&typeof saved.exp==="object")?JSON.parse(JSON.stringify(saved.exp)):saved[k];
    });
  });
}
function persistViewState(){
  if(!_vsReady||typeof PVViewState==="undefined")return;
  var stObj=_vsStateFor(aTab); if(!stObj)return;
  var slice={}; _VS_KEYS.forEach(function(k){ if(stObj[k]!==undefined) slice[k]=stObj[k]; });
  PVViewState.patch(aTab,slice);
}
initGlobalErrorHandlers();
loadData().then(async ()=>{
  chrome.storage.onChanged.addListener((ch, area) => {
    if (area !== "local" || !ch[MK]) return;
    if (typeof isVaultLocked === "function" && isVaultLocked()) return;
    const nv = ch[MK].newValue;
    if (typeof meta !== "undefined" && nv && typeof nv === "object") Object.assign(meta, nv);
    if (typeof syncGdStateFromMeta === "function") syncGdStateFromMeta();
    if (typeof rFtr === "function") rFtr();
  });
  applyThemeAndBackground();
  if(typeof applyTabsCollapsed==="function")applyTabsCollapsed();
  if(typeof applyBannerCollapsed==="function")applyBannerCollapsed();
  if(isVaultLocked()){renderLockScreen();return}
  if(typeof PVViewState!=="undefined"){
    await new Promise(_r=>PVViewState.load(vs=>{_vsHydrate(vs);_r()}));
    PVViewState.subscribe(vs=>{_vsHydrate(vs);if(typeof render==="function")render()});
  }
  // One-time: flip existing profiles to the GPT launcher view (new default).
  if(!meta.gptLauncherIntro){meta.gptLauncherIntro=true;gSt.listMode="launcher";gSt.treeOn=0;chrome.storage.local.set({[MK]:meta});}
  // Deep link: sidepanel.html?tab=photos (Photos expanded view) or any silo tab.
  try{
    const _bootTab=new URLSearchParams(location.search).get("tab");
    if(_bootTab&&typeof _TDT!=="undefined"&&(_TDT[_bootTab]||_bootTab==="workspace"||_bootTab==="lists"))aTab=_bootTab;
  }catch(e){/* deep link is best-effort */}
  validateAll();render();clearBackupBanner();_vsReady=true;
  if(typeof openTrustOnboarding==="function"&&shouldShowTrustOnboarding())setTimeout(()=>openTrustOnboarding(false),250);
  if(typeof setupTabReorder==="function")setupTabReorder();
  try{chrome.runtime.sendMessage({type:"REBUILD_MENUS"})}catch{};
  await Cloud.init();
  syncGdStateFromMeta();
  await Cloud.pullOnStartupIfEnabled();
}).catch(e=>{
  if(typeof showErrorPanel==="function")showErrorPanel(e);
  else console.error("[PV] loadData failed:",e);
});

// Persist view state after every side-panel render (debounced + guarded in PVViewState).
if(typeof render==="function"){
  const _origRender=render;
  render=function(){const _r=_origRender.apply(this,arguments);try{persistViewState()}catch(e){}return _r;};
}

