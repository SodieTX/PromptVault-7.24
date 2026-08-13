/* Prompt Vault Lists & Tasks — shared, dependency-free data model. */
const PVListsModel=(()=>{
  "use strict";
  const KEY="pv_lists";
  const TYPES=new Set(["bulleted","numbered","checklist","kanban","sticky"]);
  // Kanban columns nest KanbanTool-style: a column splits into sub-columns,
  // which can split again — up to this many levels below the root columns.
  const KANBAN_MAX_SPLIT_DEPTH=3;
  // Preloaded card-record fields a board's settings can enable for its cards.
  const CARD_FIELD_DEFS=[
    {key:"name",label:"Name"},
    {key:"company",label:"Company name"},
    {key:"address",label:"Address"},
    {key:"phone",label:"Phone number"},
    {key:"workPhone",label:"Work phone"},
    {key:"cellPhone",label:"Cell phone"},
    {key:"website",label:"Website"},
    {key:"email",label:"Email"},
    {key:"due",label:"Due date"}
  ];
  const CARD_FIELD_KEYS=new Set(CARD_FIELD_DEFS.map(f=>f.key));
  // 12 status colors; each board names its own statuses in settings.
  const STATUS_COLORS=["#e8590c","#f2b705","#8bc34a","#2e9e6b","#26c6da","#3d8bfd","#6c5ce7","#b06ab3","#d6336c","#8d6e63","#90a4ae","#dfe3e8"];
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const uid=prefix=>prefix+"_"+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2));
  const now=()=>Date.now();

  function defaultStore(){return{folders:{id:"lroot",name:"My Lists & Tasks",children:[],prompts:[],color:""},trash:[],nextId:1}}
  function normalizeFolder(folder,isRoot=false){
    const f=folder&&typeof folder==="object"?folder:{};
    f.id=typeof f.id==="string"&&f.id?f.id:(isRoot?"lroot":uid("lf"));
    f.name=typeof f.name==="string"&&f.name.trim()?f.name.trim():(isRoot?"My Lists & Tasks":"Untitled Folder");
    f.color=typeof f.color==="string"?f.color:"";
    f.children=Array.isArray(f.children)?f.children.map(x=>normalizeFolder(x,false)):[];
    f.prompts=Array.isArray(f.prompts)?f.prompts.map(normalizeFile):[];
    return f;
  }
  function normalizeKanbanSettings(s){
    const raw=s&&typeof s==="object"?s:{};
    const cardFields=Array.isArray(raw.cardFields)?raw.cardFields.filter(k=>CARD_FIELD_KEYS.has(k)):[];
    const prev=Array.isArray(raw.statuses)?raw.statuses:[];
    const statuses=STATUS_COLORS.map((color,i)=>{
      const old=prev[i]&&typeof prev[i]==="object"?prev[i]:{};
      return{color:typeof old.color==="string"&&old.color?old.color:color,label:typeof old.label==="string"?old.label:""};
    });
    return{cardFields:[...new Set(cardFields)],statuses};
  }
  function normalizeFile(file){
    const f=file&&typeof file==="object"?file:{};
    f.id=typeof f.id==="string"&&f.id?f.id:uid("list");
    f.title=typeof f.title==="string"&&f.title.trim()?f.title.trim():"Untitled";
    f.type=TYPES.has(f.type)?f.type:"bulleted";
    f.created=Number.isFinite(f.created)?f.created:now();
    f.modified=Number.isFinite(f.modified)?f.modified:f.created;
    if(f.type==="kanban"){
      f.columns=Array.isArray(f.columns)&&f.columns.length?f.columns.map(c=>normalizeColumn(c,0)):[
        {id:uid("col"),title:"To do",cards:[],children:[],collapsed:false},
        {id:uid("col"),title:"Doing",cards:[],children:[],collapsed:false},
        {id:uid("col"),title:"Done",cards:[],children:[],collapsed:false}
      ];
      f.settings=normalizeKanbanSettings(f.settings);
      delete f.items;
    }else{
      f.items=Array.isArray(f.items)?f.items.map(normalizeItem):[];
      delete f.columns;delete f.settings;
    }
    return f;
  }
  function normalizeItem(item){
    const x=item&&typeof item==="object"?item:{text:String(item??"")};
    return{id:typeof x.id==="string"&&x.id?x.id:uid("item"),text:typeof x.text==="string"?x.text:"",done:!!x.done,color:typeof x.color==="string"?x.color:"#f3d37a"};
  }
  // Kanban cards: like items, but color is empty until a status is assigned and
  // record fields (from the board's enabled cardFields) live in `fields`.
  function normalizeCard(card){
    const x=card&&typeof card==="object"?card:{text:String(card??"")};
    const fields={};
    if(x.fields&&typeof x.fields==="object")for(const k of Object.keys(x.fields))if(CARD_FIELD_KEYS.has(k))fields[k]=String(x.fields[k]??"");
    // The sticky-note gold default from older builds is not a status choice.
    const color=typeof x.color==="string"&&x.color&&x.color!=="#f3d37a"?x.color:"";
    return{id:typeof x.id==="string"&&x.id?x.id:uid("item"),text:typeof x.text==="string"?x.text:"",done:!!x.done,color,fields};
  }
  function normalizeColumn(col,depth=0){
    const c=col&&typeof col==="object"?col:{};
    const out={
      id:typeof c.id==="string"&&c.id?c.id:uid("col"),
      title:typeof c.title==="string"&&c.title.trim()?c.title.trim():"Column",
      collapsed:!!c.collapsed,
      cards:Array.isArray(c.cards)?c.cards.map(normalizeCard):[],
      children:depth<KANBAN_MAX_SPLIT_DEPTH&&Array.isArray(c.children)?c.children.map(ch=>normalizeColumn(ch,depth+1)):[]
    };
    // Cards never live on a split column — they belong to its leaves.
    if(out.children.length&&out.cards.length){out.children[0].cards=out.cards.concat(out.children[0].cards);out.cards=[]}
    return out;
  }
  function normalizeStore(store){
    const s=store&&typeof store==="object"?store:defaultStore();
    s.folders=normalizeFolder(s.folders,true);s.folders.id="lroot";
    s.trash=Array.isArray(s.trash)?s.trash:[];
    s.nextId=Number.isFinite(s.nextId)?s.nextId:1;
    return s;
  }
  function findFolder(root,id){if(!root)return null;if(root.id===id)return root;for(const c of root.children||[]){const hit=findFolder(c,id);if(hit)return hit}return null}
  function findFile(root,id){for(const f of root?.prompts||[])if(f.id===id)return{file:f,folder:root};for(const c of root?.children||[]){const hit=findFile(c,id);if(hit)return hit}return null}
  function folderStats(root){let folders=0,files=0;(function walk(n,isRoot){if(!isRoot)folders++;files+=(n.prompts||[]).length;(n.children||[]).forEach(c=>walk(c,false))})(root,true);return{folders,files}}
  function createFile(type,title){return normalizeFile({id:uid("list"),title:title||"Untitled",type,created:now(),modified:now()})}
  function move(array,from,to){if(!Array.isArray(array)||from<0||from>=array.length||to<0||to>=array.length||from===to)return false;const[x]=array.splice(from,1);array.splice(to,0,x);return true}
  /** Move a file to another folder (any file type — boards, lists, stickies). */
  function moveFile(root,fileId,targetFolderId){
    const hit=findFile(root,fileId),target=findFolder(root,targetFolderId);
    if(!hit||!target||hit.folder.id===target.id)return false;
    const i=hit.folder.prompts.indexOf(hit.file);if(i<0)return false;
    hit.folder.prompts.splice(i,1);target.prompts.push(hit.file);
    return true;
  }
  // ── Nested-column helpers ──
  function walkColumns(file,cb){
    (function walk(cols,parent,depth){
      for(const col of cols||[]){cb(col,parent,depth);walk(col.children,col,depth+1)}
    })(file?.columns||[],null,0);
  }
  function findColumn(file,colId){let hit=null;walkColumns(file,(col,parent,depth)=>{if(col.id===colId)hit={col,parent,depth}});return hit}
  function leafColumns(file){const out=[];walkColumns(file,col=>{if(!(col.children||[]).length)out.push(col)});return out}
  function columnCardCount(col){let n=(col.cards||[]).length;for(const ch of col.children||[])n+=columnCardCount(ch);return n}
  /** Split a column into two sub-columns (existing cards go to the first). */
  function splitColumn(file,colId,titleA,titleB){
    const hit=findColumn(file,colId);
    if(!hit||hit.depth>=KANBAN_MAX_SPLIT_DEPTH||(hit.col.children||[]).length)return false;
    hit.col.children=[
      {id:uid("col"),title:(titleA||"").trim()||hit.col.title+" · 1",cards:hit.col.cards,children:[],collapsed:false},
      {id:uid("col"),title:(titleB||"").trim()||hit.col.title+" · 2",cards:[],children:[],collapsed:false}
    ];
    hit.col.cards=[];
    file.modified=now();return true;
  }
  /** Merge a split column back: children removed, their cards pool into it. */
  function unsplitColumn(file,colId){
    const hit=findColumn(file,colId);
    if(!hit||!(hit.col.children||[]).length)return false;
    const cards=[];(function gather(col){cards.push(...(col.cards||[]));(col.children||[]).forEach(gather)})(hit.col);
    hit.col.cards=cards;hit.col.children=[];
    file.modified=now();return true;
  }
  function moveCard(file,cardId,toColumnId,toIndex){
    if(!file||file.type!=="kanban")return false;
    // Locate first, remove only once the move is known-valid — plucking the
    // card out before validating the destination would delete it on a refused
    // drop (e.g. onto a split column).
    let card=null,src=null,srcIdx=-1;
    walkColumns(file,col=>{if(card)return;const i=(col.cards||[]).findIndex(x=>x.id===cardId);if(i>=0){card=col.cards[i];src=col;srcIdx=i}});
    const dest=findColumn(file,toColumnId)?.col;
    if(!card||!dest||(dest.children||[]).length)return false;
    src.cards.splice(srcIdx,1);
    let at=Math.max(0,Math.min(Number.isFinite(toIndex)?toIndex:dest.cards.length,dest.cards.length));
    if(src===dest&&srcIdx<at)at--;
    dest.cards.splice(at,0,card);
    file.modified=now();return true;
  }
  function findCard(file,cardId){let hit=null;walkColumns(file,col=>{if(hit)return;const card=(col.cards||[]).find(x=>x.id===cardId);if(card)hit={card,col}});return hit}
  function removeFolder(root,id){const i=(root.children||[]).findIndex(x=>x.id===id);if(i>=0){const f=root.children[i];if((f.children||[]).length||(f.prompts||[]).length)return false;root.children.splice(i,1);return true}for(const child of root.children||[])if(removeFolder(child,id))return true;return false}
  return{KEY,TYPES:[...TYPES],KANBAN_MAX_SPLIT_DEPTH,CARD_FIELD_DEFS,STATUS_COLORS,clone,uid,defaultStore,normalizeStore,normalizeKanbanSettings,findFolder,findFile,folderStats,createFile,normalizeItem,normalizeCard,normalizeColumn,move,moveFile,walkColumns,findColumn,leafColumns,columnCardCount,splitColumn,unsplitColumn,moveCard,findCard,removeFolder};
})();
