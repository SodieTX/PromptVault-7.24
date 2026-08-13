# Prompt Vault 7.25.10 — Chrome installation

1. Get the extension folder onto disk in a stable location (clone this repository, or extract a release ZIP — do not load a ZIP directly).
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select the folder containing `manifest.json`.

## Updating WITHOUT losing your data — read this first

Your vault (prompts, photos, clips, folders, everything) lives in **Chrome's
extension storage**, not in the extension folder. Chrome keeps that storage as
long as the extension stays installed — and **permanently deletes it the moment
you click Remove**.

So when updating to a new version:

- ✅ **DO**: extract/copy the new version over (or next to) the old folder, then
  press the **reload arrow** ↻ on the Prompt Vault card in `chrome://extensions`
  — or use **Load unpacked** pointed at the new folder. Same extension, same
  data. The manifest `key` keeps the extension ID identical across versions, so
  storage always carries over.
- ❌ **DON'T**: click **Remove** first. Removing wipes the vault instantly.

## Safety net: automatic backups (survive anything, including Remove)

Prompt Vault automatically writes a **complete** copy of the vault — every
section, folder structure, collection, workspace, and setting — to:

    Downloads / PromptVault-Backups /

- `prompt-vault-backup-latest.json` — refreshed twice a day and on demand
- `prompt-vault-backup-<mon…sun>.json` — a rolling 7-day window
- `prompt-vault-backup-on-update.json` — written at every version change
- `photo-originals/` — every photo's full-resolution original file, mirrored
  once (named by photo id); new photos are picked up on each backup pass

These are ordinary files on your computer. Chrome never touches them, so they
survive removing and reinstalling the extension. An empty vault never
overwrites them.

**To restore after a reinstall:**

1. Open the side panel → any empty section shows **Restore Backup** on its
   welcome card (also in Settings → Automatic safety backups).
2. Pick `prompt-vault-backup-latest.json` → **Restore everything**. The panel
   reloads with every section, folder, collection, and setting exactly as it
   was — including all photo organization, thumbnails, and source links.
3. Settings → **Re-attach photo originals…** → select the `photo-originals`
   folder. Full-resolution files reconnect to their photos by id.
