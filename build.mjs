import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const required = [
  'manifest.json',
  'background.js',
  'vault.js',
  'sidepanel.html',
  'workbench.html',
  'pv/host.mjs',
  'pv/pv-mcp.mjs'
];

for (const file of required) {
  const full = path.join(root, file);
  if (!existsSync(full)) {
    throw new Error(`Missing required project file: ${file}`);
  }
}

const manifest = JSON.parse(readFileSync(path.join(root, 'manifest.json'), 'utf8'));
if (!manifest || !manifest.name || !manifest.version) {
  throw new Error('manifest.json is missing required name/version fields');
}

const jsFiles = [
  'background.js',
  'content.js',
  'vault.js',
  'drive-shared.js',
  'drive-sync-bg.js',
  'adapters.js',
  'fullview.js',
  'fullview-shared.js',
  'fullview-clips.js',
  'fullview-commands.js',
  'fullview-prompts.js',
  'workbench.js',
  'pv-bridge.js',
  'pv-images-db.js',
  'pv-schema-version.js',
  'bookmark-sync.js',
  'claude-commands-data.js',
  'content-packs/convert.mjs',
  'content-packs/convert-master.mjs',
  'content-packs/export-library.mjs',
  'pv/host.mjs',
  'pv/pv-mcp.mjs'
];

for (const file of jsFiles) {
  const full = path.join(root, file);
  if (existsSync(full)) {
    const result = spawnSync(process.execPath, ['--check', full], { stdio: 'inherit' });
    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }
}

console.log(`PromptVault build validation passed for ${jsFiles.length} JS/MJS files.`);
