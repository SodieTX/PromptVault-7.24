# AGENTS.md

This repository is a Chrome extension project and the current packaged source is stored primarily at the repository root rather than in a conventional `src/` application layout.

## Working conventions
- Treat the existing top-level JS, HTML, CSS, and `pv/` files as the editable project source unless a specific refactor creates a real `src/` module tree.
- Do not remove or rename the root extension files such as `manifest.json`, `background.js`, `vault.js`, `sidepanel.html`, `workbench.html`, or the files in `pv/` without a clear project reason.
- The extension is not a typical Node framework project; this repo is a browser extension bundle with a native bridge and helper scripts.

## Build and validation
Run these commands from the repo root:

- `npm install`
- `npm run build`
- `npm test`

The repo should stay syntax-clean and manifest-valid before committing.

## Important notes
- The current project layout is a bundled extension implementation, not a Vite/React/Next app.
- If you are making changes that affect the browser extension, validate the relevant JS files and confirm the manifest remains valid.
- Prefer targeted, minimal changes over broad rewrites unless the task explicitly calls for a refactor.
