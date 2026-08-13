import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const vault = readFileSync(path.join(root, 'vault.js'), 'utf8');

test('bookmarks page has scoped backup restore with merge, replace, and safety snapshot', () => {
  assert.match(vault, /id="bookmarkRestore"/);
  assert.match(vault, /Merge into Bookmarks/);
  assert.match(vault, /Replace Bookmarks/);
  assert.match(vault, /PV_BOOKMARKS_SAFETY_KEY/);
  assert.match(vault, /pvBookmarkSafetySnapshot\("merge"/);
  assert.match(vault, /pvBookmarkSafetySnapshot\("replace"/);
});

test('bookmarks-only JSON exports carry a recognized format marker', () => {
  assert.match(vault, /_format:"prompt-vault-bookmarks"/);
  assert.match(vault, /function pvBookmarksFromPayload/);
  assert.match(vault, /isBookmarksBackup:true/);
});

test('section imports expose file and row destination mapping without a forced prompt inbox', () => {
  assert.match(vault, /id="sectionImport"/);
  assert.match(vault, /data-iw-file-store/);
  assert.match(vault, /data-iw-file-folder/);
  assert.match(vault, /data-iws=/);
  assert.match(vault, /data-iwf=/);
  assert.match(vault, /function pvImportFolder/);
  assert.match(vault, /parts\.join\(" \/ "\)/);
  assert.match(vault, /const explicitlyRouted=/);
  assert.doesNotMatch(vault, /function ensureImportInbox/);
  assert.doesNotMatch(vault, /Selected items will be imported to .*Imports folder/);
});
