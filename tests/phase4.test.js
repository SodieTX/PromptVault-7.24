import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('..',import.meta.url));
const read=rel=>readFileSync(path.join(root,rel),'utf8');

test('Claude Tools keeps distinct Commands and Skills surfaces',()=>{
  const html=read('sidepanel.html'),vault=read('vault.js');
  assert.match(html,/Claude Tools › Skills/);
  assert.match(html,/Claude Tools › Commands/);
  assert.match(vault,/function claudeToolsHeader/);
  assert.match(vault,/PV_CLAUDE_SKILLS_URL="https:\/\/claude\.com\/skills"/);
  assert.match(vault,/id="skSummary"/);
});

test('commands have favorites, nested folders, and ordered playlists in both views',()=>{
  const vault=read('vault.js'),full=read('fullview-commands.js');
  assert.match(vault,/function pvCcChildren/);
  assert.match(vault,/function pvCcFolderTreeHtml/);
  assert.match(vault,/kind==="playlist"/);
  assert.match(vault,/function pvCcMoveInFolder/);
  assert.match(vault,/id="ccCopyPlaylist"/);
  assert.match(full,/function toggleFavorite/);
  assert.match(full,/function treeHtml/);
  assert.match(full,/container\.kind==='playlist'/);
});

test('quick access folder marks are persisted and rebuilt into Chrome menus',()=>{
  const vault=read('vault.js'),background=read('background.js');
  assert.match(vault,/quickAccessFolders:\[\]/);
  assert.match(vault,/Mark for Quick Access/);
  assert.match(vault,/function pvQuickFolderResolved/);
  assert.match(background,/Prompt Vault Quick Access/);
  assert.match(background,/id\.startsWith\("qa-"\)/);
  assert.match(background,/"pv_cfg"\.some|"pv_cfg"/);
});
