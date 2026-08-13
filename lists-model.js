/* Prompt Vault Lists & Tasks — shared, dependency-free data model. */
const PVListsModel=(()=>{
  "use strict";
  const KEY="pv_lists";
  const TYPES=new Set(["bulleted","numbered","checklist","kanban","sticky"]);
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
  function normalizeFile(file){
    const f=file&&typeof file==="object"?file:{};
    f.id=typeof f.id==="string"&&f.id?f.id:uid("list");
    f.title=typeof f.title==="string"&&f.title.trim()?f.title.trim():"Untitled";
    f.type=TYPES.has(f.type)?f.type:"bulleted";
    f.created=Number.isFinite(f.created)?f.created:now();
    f.modified=Number.isFinite(f.modified)?f.modified:f.created;
    if(f.type==="kanban"){
      f.columns=Array.isArray(f.columns)&&f.columns.length?f.columns.map(normalizeColumn):[
        {id:uid("col"),title:"To do",cards:[]},{id:uid("col"),title:"Doing",cards:[]},{id:uid("col"),title:"Done",cards:[]}
      ];
      delete f.items;
    }else{
      f.items=Array.isArray(f.items)?f.items.map(normalizeItem):[];
      delete f.columns;
    }
    return f;
  }
  function normalizeItem(item){
    const x=item&&typeof item==="object"?item:{text:String(item??"")};
    return{id:typeof x.id==="string"&&x.id?x.id:uid("item"),text:typeof x.text==="string"?x.text:"",done:!!x.done,color:typeof x.color==="string"?x.color:"#f3d37a"};
  }
  function normalizeColumn(col){
    const c=col&&typeof col==="object"?col:{};
    return{id:typeof c.id==="string"&&c.id?c.id:uid("col"),title:typeof c.title==="string"&&c.title.trim()?c.title.trim():"Column",cards:Array.isArray(c.cards)?c.cards.map(normalizeItem):[]};
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
  function moveCard(file,cardId,toColumnId,toIndex){
    if(!file||file.type!=="kanban")return false;
    let card=null;
    for(const col of file.columns||[]){const i=col.cards.findIndex(x=>x.id===cardId);if(i>=0){[card]=col.cards.splice(i,1);break}}
    const dest=(file.columns||[]).find(x=>x.id===toColumnId);
    if(!card||!dest)return false;
    dest.cards.splice(Math.max(0,Math.min(Number.isFinite(toIndex)?toIndex:dest.cards.length,dest.cards.length)),0,card);
    file.modified=now();return true;
  }
  function removeFolder(root,id){const i=(root.children||[]).findIndex(x=>x.id===id);if(i>=0){const f=root.children[i];if((f.children||[]).length||(f.prompts||[]).length)return false;root.children.splice(i,1);return true}for(const child of root.children||[])if(removeFolder(child,id))return true;return false}
  return{KEY,TYPES:[...TYPES],clone,uid,defaultStore,normalizeStore,findFolder,findFile,folderStats,createFile,normalizeItem,normalizeColumn,move,moveCard,removeFolder};
})();
