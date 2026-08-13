import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = rel => readFileSync(path.join(root, rel), 'utf8');
const vault = read('vault.js');
const panel = read('sidepanel.html');

test('Photos owns its collections and exposes collection quick links', () => {
  assert.match(vault, /isPh\(\)\?PH:BM/);
  assert.match(vault, /data-ql-photo=/);
  assert.match(vault, /phSt\.collFilter=el\.dataset\.qlPhoto/);
});

test('photo gallery supports custom reorder and selected mob moves', () => {
  assert.match(vault, /function pvReorderPhoto\(/);
  assert.match(vault, /function pvReorderPhotoCollection\(/);
  assert.match(vault, /function pvMovePhotoMob\(/);
  assert.match(vault, /setData\("pv-photo-mob"/);
  assert.match(vault, /Moved \$\{moved\} selected photos/);
  assert.match(panel, /pht-drop-before/);
});

test('photo viewer provides slideshow navigation and cleans up its timer', () => {
  assert.match(vault, /id="phvPlay">▶ Slideshow/);
  assert.match(vault, /e\.key==="ArrowLeft"/);
  assert.match(vault, /e\.key==="ArrowRight"/);
  assert.match(vault, /clearInterval\(timer\)/);
  assert.match(panel, /object-fit:contain/);
});

test('photo reports use original files and explicitly avoid upscaling', () => {
  assert.match(vault, /function pvPreparePhotoReport\(/);
  assert.match(vault, /LLM review package \(\.zip\)/);
  assert.match(vault, /Print \/ export photo report/);
  assert.match(vault, /never draw through canvas, enlarge thumbnails, or upscale small images/);
  assert.match(vault, /width:auto;height:auto;max-width:100%/);
  assert.doesNotMatch(vault, /function pvBuildPhotoReportHtml[\s\S]*?drawImage/);
});
