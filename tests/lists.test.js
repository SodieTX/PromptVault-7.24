import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = rel => readFileSync(path.join(root, rel), 'utf8');

function loadModel() {
  const context = vm.createContext({ crypto: globalThis.crypto });
  return vm.runInContext(read('lists-model.js') + ';PVListsModel;', context, { filename: 'lists-model.js' });
}
const board = M => M.normalizeStore({
  folders: { id: 'lroot', name: 'root', children: [{ id: 'lf_a', name: 'A', children: [], prompts: [] }], prompts: [
    { id: 'list_k', title: 'Board', type: 'kanban', columns: [{ id: 'c1', title: 'To do', cards: [{ id: 'k1', text: 'one' }, { id: 'k2', text: 'two' }] }, { id: 'c2', title: 'Done', cards: [] }] }
  ] }
});

test('kanban files gain per-board settings: 12 statuses + validated card fields', () => {
  const M = loadModel();
  const file = board(M).folders.prompts[0];
  assert.equal(file.settings.statuses.length, 12);
  assert.ok(file.settings.statuses.every(s => /^#/.test(s.color) && typeof s.label === 'string'));
  const custom = M.normalizeKanbanSettings({ cardFields: ['email', 'due', 'bogus'], statuses: [{ color: '#111111', label: 'Hot lead' }] });
  assert.deepEqual([...custom.cardFields], ['email', 'due'], 'unknown field keys must be dropped');
  assert.equal(custom.statuses[0].label, 'Hot lead');
  assert.equal(custom.statuses[0].color, '#111111');
  assert.equal(custom.statuses.length, 12, 'status palette is always 12 slots');
  assert.equal(M.CARD_FIELD_DEFS.length, 9, 'name/company/address/phone/work/cell/website/email/due');
});

test('columns split into sub-columns up to three levels deep, then refuse', () => {
  const M = loadModel();
  const file = board(M).folders.prompts[0];
  assert.ok(M.splitColumn(file, 'c1', 'Left', 'Right'), 'first split');
  const c1 = M.findColumn(file, 'c1').col;
  assert.equal(c1.cards.length, 0, 'split column holds no cards itself');
  assert.equal(c1.children[0].cards.length, 2, 'existing cards move to the first sub-column');
  const lvl1 = c1.children[0];
  assert.ok(M.splitColumn(file, lvl1.id), 'second split');
  const lvl2 = M.findColumn(file, lvl1.id).col.children[0];
  assert.ok(M.splitColumn(file, lvl2.id), 'third split');
  const lvl3 = M.findColumn(file, lvl2.id).col.children[0];
  assert.equal(M.splitColumn(file, lvl3.id), false, 'a fourth nested split is refused');
  assert.ok(M.unsplitColumn(file, 'c1'), 'merge pools everything back');
  assert.equal(M.findColumn(file, 'c1').col.cards.length, 2);
  assert.equal(M.findColumn(file, 'c1').col.children.length, 0);
});

test('cards move only into leaf columns, wherever they nest', () => {
  const M = loadModel();
  const file = board(M).folders.prompts[0];
  M.splitColumn(file, 'c1', 'L', 'R');
  const right = M.findColumn(file, 'c1').col.children[1];
  assert.ok(M.moveCard(file, 'k1', right.id, 0), 'card moves into nested leaf');
  assert.equal(right.cards[0].id, 'k1');
  assert.equal(M.moveCard(file, 'k2', 'c1', 0), false, 'split (non-leaf) columns refuse cards');
  assert.equal(M.findCard(file, 'k2').col.id, M.findColumn(file, 'c1').col.children[0].id, 'refused move leaves the card in place');
});

test('any file moves between folders; collapse state and card colors survive normalize', () => {
  const M = loadModel();
  const store = board(M);
  assert.ok(M.moveFile(store.folders, 'list_k', 'lf_a'));
  assert.equal(M.findFile(store.folders, 'list_k').folder.id, 'lf_a');
  assert.equal(M.moveFile(store.folders, 'list_k', 'lf_a'), false, 'same-folder move is a no-op');
  const renorm = M.normalizeStore(M.clone(store));
  const file = renorm.folders.children[0].prompts[0];
  file.columns[0].collapsed = true;
  file.columns[0].cards[0] = M.normalizeCard({ id: 'k1', text: 'one', color: '#e8590c', fields: { email: 'a@b.c', junk: 'x' } });
  const again = M.normalizeStore(M.clone(renorm));
  const kept = again.folders.children[0].prompts[0];
  assert.equal(kept.columns[0].collapsed, true, 'collapsed flag survives');
  assert.equal(kept.columns[0].cards[0].color, '#e8590c', 'status color survives');
  assert.deepEqual({ ...kept.columns[0].cards[0].fields }, { email: 'a@b.c' }, 'unknown card fields are dropped');
  assert.equal(M.normalizeCard({ text: 'x', color: '#f3d37a' }).color, '', 'legacy sticky-gold default is not a status');
});

test('expanded view and side-panel hub wire the new features', () => {
  const fv = read('fullview-lists.js');
  assert.match(fv, /contextmenu[\s\S]{0,80}cardColorMenu/, 'card right-click color menu missing');
  assert.match(fv, /openBoardSettings/, 'per-board settings modal missing');
  assert.match(fv, /data-col-collapse/, 'column collapse missing');
  assert.match(fv, /splitColumn/, 'column split missing');
  assert.match(fv, /text\/pv-list-file/, 'file→folder drag missing');
  assert.match(fv, /text\/pv-list-item/, 'list item drag-reorder missing');
  assert.match(fv, /searchParams|URLSearchParams/, 'deep-link ?file= handling missing');
  const vaultSrc = read('vault.js');
  assert.match(vaultSrc, /data-lsfile/, 'Lists hub file tree missing');
  assert.match(vaultSrc, /pvOpenListsView/, 'Lists hub deep-link opener missing');
  assert.match(vaultSrc, /gptTreeRestored/, 'Custom GPTs tree restore migration missing');
});
