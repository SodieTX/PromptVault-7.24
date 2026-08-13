import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = rel => readFileSync(path.join(root, rel), 'utf8');

function model(){
  const context={globalThis:{crypto:{randomUUID:()=>String(Math.random())}},Date,Math,JSON};
  vm.runInNewContext(read('lists-model.js')+'\n;globalThis.out=PVListsModel;',context);
  return context.globalThis.out;
}

test('vault bootstrap declares the Lists store before startup reads it',()=>{
  const vault=read('vault.js');
  const declaration=vault.match(/let P=null[^;]+;/)?.[0];
  assert.ok(declaration,'central vault store declaration is present');
  const context={globalThis:{}};
  vm.runInNewContext(declaration+'\n;globalThis.out=LS;',context);
  assert.equal(context.globalThis.out,null);
  assert.ok(vault.indexOf('LS=null')<vault.indexOf('lists:LS'),'Lists binding precedes backup/count reads');
});

test('lists model normalizes each file type and moves kanban cards across columns',()=>{
  const M=model(),store=M.normalizeStore();
  for(const type of ['bulleted','numbered','checklist','kanban','sticky'])store.folders.prompts.push(M.createFile(type,type));
  assert.deepEqual(Array.from(store.folders.prompts,x=>x.type),['bulleted','numbered','checklist','kanban','sticky']);
  const board=store.folders.prompts[3],card=M.normalizeItem({text:'Ship it'});
  board.columns[0].cards.push(card);
  assert.equal(M.moveCard(board,card.id,board.columns[2].id,0),true);
  assert.equal(board.columns[0].cards.length,0);
  assert.equal(board.columns[2].cards[0].text,'Ship it');
});

test('lists section is independently stored and included in every whole-vault path',()=>{
  const vault=read('vault.js'),drive=read('drive-shared.js'),html=read('sidepanel.html');
  assert.match(vault,/LSK="pv_lists"/);
  assert.match(vault,/lists:LS/);
  assert.match(vault,/if\(d\.lists\)LS=/);
  assert.match(vault,/\[LSK\]:LS/);
  assert.match(drive,/LSK = "pv_lists"/);
  assert.match(drive,/body\.lists = LS/);
  assert.match(html,/id="tabLS"/);
  assert.match(html,/lists-model\.js/);
});

test('lists full view exposes all formats, navigation, reorder, and kanban drag/drop',()=>{
  const html=read('fullview-lists.html'),js=read('fullview-lists.js');
  for(const type of ['bulleted','numbered','checklist','kanban','sticky'])assert.match(html,new RegExp(`value="${type}"`));
  assert.match(html,/Back \/ Exit/);
  assert.match(js,/M\.move\(/);
  assert.match(js,/M\.moveCard\(/);
  assert.match(js,/dataTransfer\.setData\("text\/pv-list-card"/);
  assert.match(js,/window\.confirm/);
});
