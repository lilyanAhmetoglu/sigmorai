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

## Level map (`components/map/`, clear-maps 2026-10-08)

- `/map/<slug>` is a quest path, not a scrolling strip (`docs/plans/level-art-design-plan.md` → clear maps). The realm's four layers are a short banner at exactly 2× (RealmScene, cropped to the ground, no parallax); a `scene: false` realm gets a flat token banner with its name, never an empty box.
- Under it, one card per chapter, then the boss, in one column joined by a trail. Each card: tag, title, goal, steps with icon + word, XP, status icon + word (Done / Start or Continue / Open / Locked / Soon). Same layout on every screen; nothing scrolls sideways.
- The card's title is a real link (or an aria-disabled `<button>` when shut, with an unlock hint) that covers the card. The current card is marked; the page scrolls to it only when it starts below the fold and is not the first card.

## World map (`components/map/world-map.tsx`, 2026-10-07)

- `/map`: one top-down world, every realm of a path as a land (`docs/plans/world-map-design-plan.md`). Geometry (anchors, rectangle footprints, slots, landmarks) only in `WORLD_MAP` (`lib/constants/world-map.ts`); the art fits it.
- A native scroll box. Zoom steps `ZOOM_STEPS` = ½, 1, 2 only (`data-zoom` on the box); it starts at 1 with no JS. No canvas, no pan/zoom library.
- Markers are real 44px links that do not scale with the zoom; the art, trail, fog and hero are `aria-hidden`. The "Your path" list under the box is the text view.
- Until the Higgsfield art lands, the world is a token-coloured SVG cartography map (paper sea, organic stepped coasts on an 8 art px grid, seeded terrain glyphs that keep off pins and labels, compass, frame). The art goes in the `WORLD_MAP_ART` slot (2048×1536, pixelated). Never reuse level art.
- Marker labels (clear-maps 2026-10-08): from zoom 1, one small parchment plate under the pin (148 × 36 max): the name; the number as a small tag with the status as icon + word (one word per state, as in the path list); and a thin segmented bar. Its box is `WORLD_HERO.detail`; a test keeps it off every pin, plate and landmark label. At ½ only the pin and its state pip show (the plate on focus). The map starts at zoom 1 on every screen.

## The UI is not pixel art

Pixel fonts are for headings, HUD and buttons only. Reading text is Atkinson Hyperlegible. Panels and buttons use the token bevels and hard shadows; they are not drawn on canvas.
