import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const vaultSrc = readFileSync(path.join(root, 'vault.js'), 'utf8');

// Regression: 7.25 hid the whole folder-tree pane whenever a silo had zero
// items, even with a full folder structure — which reads as data loss. Lean
// (welcome-only) chrome may only trigger when there are no items AND no
// folders AND no trash.
test('folder tree stays visible for silos that have folders but no items', () => {
  const leanLine = vaultSrc.split('\n').find(l => l.includes('const _lean='));
  assert.ok(leanLine, '_lean gate missing from render()');
  assert.match(leanLine, /folders===0/, 'lean chrome must require an empty folder tree, not just zero items');
});

test('sort dropdown is clamped back on-screen after the toolbar wraps', () => {
  assert.match(vaultSrc, /soM[\s\S]{0,400}getBoundingClientRect/, 'sort menu position clamp missing');
});

test('Lists hub is lean — no stats dashboard', () => {
  const hub = vaultSrc.slice(vaultSrc.indexOf('function renderListsHub'), vaultSrc.indexOf('function render(){'));
  assert.ok(hub.includes('openLists'), 'Lists hub must keep the Open button');
  assert.ok(!hub.includes('folderStats'), 'Lists hub must not render file/type statistics');
});

test('Bookmarks section offers Chrome bookmarks import', () => {
  assert.match(vaultSrc, /function pvImportChromeBookmarksModal/, 'Chrome bookmarks import flow missing');
  assert.match(vaultSrc, /chromeBmImport/, 'Chrome bookmarks import button missing from the Bookmarks toolbar');
  assert.match(vaultSrc, /pvMergeBookmarkStore\(incoming\)/, 'Chrome import must reuse the deduping merge machinery');
  assert.match(vaultSrc, /PV_BM_SYNC_FOLDER_NAME/, 'the vault→Chrome sync mirror folder must be excluded from import');
});
