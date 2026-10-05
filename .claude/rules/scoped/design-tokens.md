---
paths:
  - 'app/globals.css'
  - 'components/**'
  - 'design/tokens/**'
---

# Design tokens

`design/tokens/*.css` is the source. `app/globals.css` keeps the raw `--*` vars verbatim and maps every one into Tailwind v4 `@theme`.

- **Never invent a colour, font, radius, shadow or spacing value.** If the design needs one that isn't a token, stop and ask.
- **Zero border-radius globally.** No `rounded-*` anywhere.
- **Hard offset shadows only** (`shadow-notch`, `shadow-drop`, `bevel`, `bevel-pressed`). Never a blur radius.
- **No gradients**, except the text-legibility fade over canvas scenes.
- **Fonts via `next/font/google`:** Pixelify Sans (display), Silkscreen (HUD), Atkinson Hyperlegible (body, all reading text), JetBrains Mono (code). Ligatures off globally.
- **Focus ring = 3px Spark (`#FFC53D`)** on every interactive element, via one shared utility.
- **Buttons press 2px** (translate + swap to `bevel-pressed`), never scale.
- **XPBar is segmented**, never a smooth fill.
- **Tap targets ≥ 44px** at every size variant.
- When a token changes in `design/tokens/`, re-copy it; never hand-edit the copy in `globals.css` to drift from the source.
