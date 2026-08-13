import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = rel => readFileSync(path.join(root, rel), 'utf8');

test('website drag capture is deferred and does not use capture phase', () => {
  const content = read('content.js');
  assert.match(content, /setTimeout\(\(\)=>captureDraggedVisual\(target,path\),0\)/);
  assert.match(content, /document\.addEventListener\("dragstart"[\s\S]*?\},\{capture:false,passive:true\}\)/);
  assert.doesNotMatch(content, /document\.addEventListener\("dragstart"[\s\S]*?\},true\)/);
});

test('every takeover view exposes an exit control', () => {
  for (const rel of ['workbench.html', 'fullview.html', 'fullview-prompts.html', 'fullview-clips.html', 'fullview-commands.html']) {
    const html = read(rel);
    assert.match(html, /Back \/ Exit/, `${rel} needs an obvious Back / Exit control`);
  }
});

test('side panel exposes folder creation and structured improvement notes', () => {
  const vault = read('vault.js');
  assert.match(vault, /id="newF"/);
  assert.match(vault, /id="emptyFolder"/);
  assert.match(vault, /normalizeImprovementNotes/);
  assert.match(vault, /meta\.improvementNotes/);
  assert.doesNotMatch(vault, /id="devNotesTa"/);
});
