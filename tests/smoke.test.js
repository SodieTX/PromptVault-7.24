import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

const requiredFiles = [
  'manifest.json',
  'background.js',
  'vault.js',
  'sidepanel.html',
  'workbench.html',
  'pv/host.mjs',
  'pv/pv-mcp.mjs'
];

test('repo has required Chrome extension files', () => {
  for (const rel of requiredFiles) {
    assert.ok(existsSync(path.join(root, rel)), `Missing required file: ${rel}`);
  }
});

test('manifest.json parses', () => {
  const raw = readFileSync(path.join(root, 'manifest.json'), 'utf8');
  const manifest = JSON.parse(raw);
  assert.equal(typeof manifest.name, 'string');
  assert.equal(typeof manifest.version, 'string');
});

test('critical extension scripts can be read', () => {
  for (const rel of ['background.js', 'vault.js', 'pv/host.mjs', 'pv/pv-mcp.mjs']) {
    const text = readFileSync(path.join(root, rel), 'utf8');
    assert.ok(text.length > 0, `Empty file: ${rel}`);
  }
});
