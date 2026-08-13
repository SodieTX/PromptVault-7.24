import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const vault = readFileSync(path.join(root, 'vault.js'), 'utf8');

test('Skills and Custom GPT pages expose explicit authorized import entry points', () => {
  assert.match(vault, /id="authorizedImport"/);
  assert.match(vault, /openAuthorizedImport\(isK\(\)\?"skills":"customgpts"\)/);
  assert.match(vault, /Choose a local \$\{skills\?"Skills":"configuration"\} folder/);
  assert.match(vault, /\.skill,\.zip,\.md,\.markdown,\.yaml,\.yml,\.json/);
});

test('permission boundary explicitly rejects silent account and credential access', () => {
  assert.match(vault, /No silent Claude\/ChatGPT account access/);
  assert.match(vault, /No credential or cookie extraction/);
  assert.match(vault, /No undocumented scraping of private pages/);
  assert.match(vault, /documented API is added later with your authorization/);
});

test('authorized imports preview Skills and GPTs with destination and duplicate controls', () => {
  assert.match(vault, /skills:\(\)=>KL,customgpts:\(\)=>GP/);
  assert.match(vault, /skills:"Skills",customgpts:"Custom GPTs"/);
  assert.match(vault, /id="iwDupMode"/);
  assert.match(vault, /value="skip">Skip existing/);
  assert.match(vault, /value="update">Update existing \+ version/);
  assert.match(vault, /value="keep">Keep both/);
  assert.match(vault, /pvFindExactImportDuplicate/);
  assert.match(vault, /pvUpdateImportedItem/);
});

test('Skill packages retain companion files and GPT config exports retain structured sections', () => {
  assert.match(vault, /function pvSkillItemFromEntries/);
  assert.match(vault, /rel!=="SKILL\.md"/);
  assert.match(vault, /created\.files=deepClone\(item\.files\|\|\{\}\)/);
  assert.match(vault, /function pvCustomGptConfigItems/);
  assert.match(vault, /## Conversation starters/);
  assert.match(vault, /## Capabilities/);
  assert.match(vault, /## Actions/);
  assert.match(vault, /## Knowledge files/);
});
