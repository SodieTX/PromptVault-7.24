import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root=fileURLToPath(new URL('..',import.meta.url));
const read=rel=>readFileSync(path.join(root,rel),'utf8');

function functionSource(source,name){
  const start=source.indexOf(`function ${name}(`);
  assert.notEqual(start,-1,`${name} is present`);
  const brace=source.indexOf('{',start);
  let depth=0;
  for(let i=brace;i<source.length;i++){
    if(source[i]==='{')depth++;
    else if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw new Error(`Could not extract ${name}`);
}

test('cold and partial storage bootstrap has every tree store before shared counts',()=>{
  const vault=read('vault.js');
  const declaration=vault.match(/let P=null[^;]+;/)?.[0];
  assert.ok(declaration,'central store declaration exists');

  const context={globalThis:{}};
  vm.runInNewContext(`${declaration}\n${functionSource(vault,'countItems')}\n;globalThis.out={LS,countItems};`,context);
  assert.equal(context.globalThis.out.LS,null,'Lists binding exists even before storage returns');
  assert.deepEqual({...context.globalThis.out.countItems(undefined)},{prompts:0,folders:0});
  assert.deepEqual(
    {...context.globalThis.out.countItems({id:'root',children:[undefined,{id:'ok'}]})},
    {prompts:0,folders:1},
    'a partial legacy child cannot crash the global header/footer count'
  );

  const early=vault.indexOf('const _startupDataRepaired=validateAll(false)');
  assert.ok(early>vault.indexOf('LS=typeof PVListsModel'), 'all cold-storage stores are assigned first');
  assert.ok(early<vault.indexOf('pvImgCleanup(valid)'), 'validation precedes startup cleanup');
  assert.match(vault,/\[PH,"phroot","My Photos"\],\[LS,"lroot","My Lists & Tasks"\]/);
});
