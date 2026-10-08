---
paths:
  - 'lib/sprite/**'
  - 'components/scenes/**'
  - 'components/map/**'
  - 'components/pixel-avatar.tsx'
  - 'public/art/**'
  - 'public/levels/**'
  - 'design/assets/**'
---

# Pixel art and canvas scenes

From the build prompt and `design/ui_kits/webapp/Sigmorai App.dc.html`. Port, don't reinvent: when the design file has a function (`sprite()`, `startHero()`), port it line-for-line first, then type it.

## Sprites

- **Avatar = deterministic 8×8 symmetric sprite seeded by username** (`lib/sprite/`). Same name → same sprite on every device and the server. It has a `bun test` snapshot so a refactor can't silently change everyone's avatar.
- Uploaded photos render with `image-rendering: pixelated`.
- **Whole-number scale only.** Never `scale(1.5)`; nearest-neighbour everywhere, no smoothing, no blur.

## Canvas scenes (`components/scenes/`, client components)

- **HeroScene:** internal resolution 160px tall, scaled up by an integer with `image-rendering: pixelated`. Parallax layers `/public/art/hero-{sky,far,mid,near}.png`, tiled seamlessly, with the procedural fallback when an image is missing.
- **One `requestAnimationFrame` loop per scene,** started in `useEffect`, cancelled on unmount. Pause when off-screen (IntersectionObserver) and when the tab is hidden.
- **`prefers-reduced-motion` → a static frame,** no loop.
- **Canvas gets `aria-hidden="true"`** and a sibling text alternative describing the scene.
- No `setState` per frame. Game state lives in refs inside the loop; React only hears about events (XP popups) if it must.

## Level map (`components/map/`)

- 2048×480 level from `/public/levels/realm-0N/{sky,far,mid,near}.png` at 2× via RealmScene, horizontally scrollable on every screen size.
- Flags at `x = (n × 16 + 8) × 2`, nodes from `LEVEL_MAP` (`lib/constants/level-map.ts`), not in the component.
- Flags are real links (or aria-disabled `<button>`s when locked, ≥44px hit area) with labels; the art is decoration.
- Parallax is CSS scroll-driven (`level-map.css`), no rAF loop. Reduced motion or no support → 1:1 scroll.
- Later (follow-up ticket): click a flag → hero walks there in 800ms with `steps(16)`, flipped when moving left, and the scroller follows. Reduced motion → jump, no walk.

## World map (`components/map/world-map.tsx`, 2026-10-07)

- `/map`: one top-down world, every realm of a path as a land (`docs/plans/world-map-design-plan.md`). Geometry (anchors, rectangle footprints, slots, landmarks) only in `WORLD_MAP` (`lib/constants/world-map.ts`); the art fits it.
- A native scroll box, like the level map. Zoom steps `ZOOM_STEPS` = ½, 1, 2 only (`data-zoom` on the box); the overview needs no JS (½ under 1024px, else 1). No canvas, no pan/zoom library.
- Markers are real 44px links that do not scale with the zoom; the art, trail, fog and hero are `aria-hidden`. The "Your path" list under the box is the text view.
- Until the Higgsfield art lands, the world is a token-coloured SVG cartography map (paper sea, inked coasts, seeded terrain glyphs that keep off pins and labels, compass, frame). The art goes in the `WORLD_MAP_ART` slot (2048×1536, pixelated). Never reuse level art.

## The UI is not pixel art

Pixel fonts are for headings, HUD and buttons only. Reading text is Atkinson Hyperlegible. Panels and buttons use the token bevels and hard shadows; they are not drawn on canvas.
