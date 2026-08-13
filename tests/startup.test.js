import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = rel => readFileSync(path.join(root, rel), 'utf8');

function loadListsModel() {
  // lists-model.js declares `const PVListsModel = ...` at script top level, which
  // stays in the VM's lexical scope rather than on the context object — so read
  // the binding back out as the script's completion value.
  const context = vm.createContext({ crypto: globalThis.crypto });
  const model = vm.runInContext(read('lists-model.js') + ';PVListsModel;', context, { filename: 'lists-model.js' });
  assert.ok(model && typeof model.normalizeStore === 'function', 'PVListsModel failed to load');
  return model;
}

test('lists-model normalizeStore tolerates a missing pv_lists value', () => {
  const M = loadListsModel();
  for (const value of [undefined, null, {}, { folders: null }]) {
    const store = M.normalizeStore(M.clone(value));
    assert.equal(store.folders.id, 'lroot');
    assert.ok(Array.isArray(store.folders.children));
    assert.ok(Array.isArray(store.folders.prompts));
  }
});

// Regression: 7.25.2 crashed at startup because loadData() ran
// deepClone(res["pv_lists"]) while pv_lists does not exist yet on fresh
// installs and upgrades from <=7.24 (deepClone is JSON-based, so cloning
// undefined throws and the side panel never renders). Execute the actual
// LS assignment line from vault.js against an empty storage result.
test('vault.js loadData survives a storage result with no pv_lists key', () => {
  const vaultSrc = read('vault.js');
  const lines = vaultSrc.split('\n').filter(l => l.trim().startsWith('LS='));
  const loadLine = lines.find(l => l.includes('res[LSK]'));
  assert.ok(loadLine, 'expected loadData to assign LS from res[LSK]');

  const M = loadListsModel();
  const context = vm.createContext({
    PVListsModel: M,
    LSK: 'pv_lists',
    res: {}, // pv_lists absent — the upgrade-from-7.24 condition
    LS: null,
    deepClone: o => JSON.parse(JSON.stringify(o)),
    mkDef: (id, name) => ({ folders: { id, name, children: [], prompts: [], color: '' }, trash: [], nextId: 1 }),
  });
  assert.doesNotThrow(() => vm.runInContext(loadLine.trim(), context, { filename: 'vault-ls-line.js' }));
  assert.equal(context.LS.folders.id, 'lroot');
});

test('lists surfaces contain no double-encoded UTF-8 (mojibake)', () => {
  const suspicious = /â€|Ã—|â†|â–|Â·|â—|â˜/;
  for (const rel of ['lists-model.js', 'fullview-lists.js', 'fullview-lists.html', 'vault.js', 'sidepanel.html']) {
    assert.ok(!suspicious.test(read(rel)), `Mojibake found in ${rel}`);
  }
});
