# Image Builder Content Pack Format

## Overview

Content packs are `.md` files that add capsules, panels, and influences to the Image Builder. Drop them into the `content-packs/` folder and run the converter to generate JS.

There are two pack types: **capsule packs** (pills for baskets) and **influence packs** (artists for the voice system).

---

## Capsule Pack Format

File naming: `capsules-*.md` (e.g., `capsules-architecture.md`, `capsules-anime-styles.md`)

```markdown
# Pack: Architecture & Interior
<!-- Optional metadata line. "Pack:" prefix is stripped. -->

## Architectural Style | 🏛️ | 6
<!-- ## Panel Title | icon (emoji) | layer (2-6, default 6) -->
<!-- Layer: 2=character, 3=world, 4=camera, 5=light, 6=style -->

### Historical
<!-- ### Group Name -->

- Brutalist concrete raw exposed structure | Brutalist | Raw concrete, exposed structure, oppressive geometry. Barbican, Trellick Tower
- Gothic cathedral pointed arch ribbed vault | Gothic | Pointed arches, ribbed vaults, flying buttresses, stained glass
- Art Deco lobby terrazzo geometric pattern | Art Deco Interior | Terrazzo floors, geometric brass, Chrysler Building lobby
<!-- - prompt value | Label | Description -->
<!-- Label and Description are optional. If omitted, value is used as label. -->

### Contemporary
- parametric architecture Zaha Hadid flowing | Parametric | Zaha Hadid flowing geometry, computational design
- Japanese minimalist wabi-sabi interior | Wabi-Sabi | Imperfect beauty, natural materials, empty space, Zen simplicity
```

### Rules

- `## Heading` = New panel (basket). Pipe-separated: `Title | icon | layer`
- `### Heading` = New group within the current panel
- `- line` = Capsule. Pipe-separated: `value | label | description`
- Lines starting with `<!--` are comments (ignored)
- Blank lines are ignored
- If a line has no pipes, the entire text is used as both value and label

---

## Influence Pack Format

File naming: `influences-*.md` (e.g., `influences-manga.md`, `influences-architecture.md`)

```markdown
# Pack: Manga & Anime Illustrators

## Manga Artists — Shonen Masters
<!-- ## Category Name (shows as accordion header in Voice panel) -->

- Akira Toriyama | Dragon Ball, Dragon Quest, Chrono Trigger. Clean line, round forms, playful anatomy
- Eiichiro Oda | One Piece. Exaggerated proportion, kinetic action, world-building density
- Masashi Kishimoto | Naruto. Dynamic action poses, ninja-meets-streetwear character design
<!-- - Artist Name | Description -->

## Manga Artists — Seinen & Literary
- Naoki Urasawa | Monster, 20th Century Boys. Realistic faces, psychological tension, pacing master
- Junji Ito | Uzumaki, Tomie. Body horror, spiral obsession, the beautiful becoming grotesque
```

### Rules

- `## Heading` = Category (accordion section in the influence browser)
- `- line` = Artist. Pipe-separated: `name | description`
- Everything else follows the same comment/blank rules as capsule packs

---

## Where Packs Go

After conversion, the packs produce JS files that are loaded by the image builder:

- `content-packs/compiled/capsule-packs.js` — auto-appended to MJC_LIBRARY
- `content-packs/compiled/influence-packs.js` — auto-appended to MJ_INFLUENCE_LIBRARY

To add your packs:
1. Write `.md` files in `content-packs/`
2. Run `node content-packs/convert.mjs`
3. Reload the extension

Or: hand the `.md` file to Claude and say "add this to the builder" — Claude can convert it inline.

---

## Quick-Add Shortcuts

### Adding capsules to an EXISTING basket (no converter needed)

The builder already supports drag-and-drop import of `.csv`, `.tsv`, and `.txt` files directly onto any basket panel. Format:

```
value,label,description
14mm ultra-wide angle,14mm Ultra,Extreme distortion and vast spaces
16mm wide angle,16mm,Wide environmental sweep
```

or tab-separated, or one-per-line (value only, label = value).

### Adding via Claude

Paste your raw list to Claude and say:
> "Convert these to capsule pack format for the image builder"

or:
> "Add these to the Architectural Style panel in the builder"

Claude knows the format.

---

## Tips for Writing Good Capsules

- **Value** should be the actual prompt text the image platform will see. Write it as you'd type it into the prompt box.
- **Label** should be short (1-3 words) — it's the pill button text.
- **Description** should answer: "What does this actually look like?" in 1-2 sentences. Reference specific examples (films, photographers, buildings) when possible.
- Keep values lowercase (MJ doesn't care about case, and lowercase compiles cleaner).
- Test your values in MJ before committing — some phrases produce surprisingly different results than you'd expect.
