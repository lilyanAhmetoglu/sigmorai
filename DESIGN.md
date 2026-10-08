# DESIGN.md: Sigmorai

Look and voice. Never makes stack calls (that's `ENGINEERING.md`).

**The source of truth is `design/`**, exported from the Claude Design project:

- `design/ui_kits/webapp/Sigmorai App.dc.html`: every screen, interaction and piece of copy
- `design/tokens/*.css`: colours, type, spacing, effects (copied verbatim into `app/globals.css`)
- `design/assets/`: logo, sprites, level SVGs, art prompts

When this file and `design/` disagree, `design/` wins; fix this file.

## Visual rules

- Match the design file exactly. Never invent a colour, font or radius.
- Zero border-radius. Hard offset shadows only (`shadow-notch`, `shadow-drop`, `bevel`, `bevel-pressed`), never blur.
- No gradients, except the text-legibility fade over canvas scenes.
- Fonts: Pixelify Sans (display), Silkscreen (HUD), Atkinson Hyperlegible (all reading text), JetBrains Mono (code). Ligatures off.
- Focus ring: 3px Spark `#FFC53D`. Tap targets ≥ 44px. Every layout reflows to phone width; the page never scrolls sideways: the world map scrolls inside its box (2026-10-07, world map); the level map is one column of cards (2026-10-08, clear maps).
- Pixel art scales by whole numbers, `image-rendering: pixelated`.

## Voice

- **Product voice: plain and technical.** Buttons, errors, lessons, mentor: short, exact, no hype.
- **Story voice: only inside parchment DialogBoxes**, spoken by the realm's NPC guide. The Oracle of Latentia is clouded by the Hallucinant, a fog of confident falsehood. Learning to verify is how you clear it.
- Never shame a broken streak. Never fake urgency.
