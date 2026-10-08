# Sigmorai — Level art (parallax realms)

> Every realm's level map and the landing hero use layered pixel-art scenes in one shared look: lush side-view platformer worlds with floating islands, big cloudscapes and cliff platforms. Art is generated offline (Higgsfield), cleaned into true pixel art, and reviewed before it ships.

## Status

**STATUS: Substantive stub. Build step: 1 (hero) and 4 (level map). Track: both.**

## Amendments

## Amendments locked 2026-10-08 (clear maps)

- **Maintainer feedback (2026-10-08):** on `/map/<slug>` a chapter showed only a number ("1") or a lock on a side-scrolling strip, and a realm with no art (`scene: false`, r9+) showed an empty purple box. "Numbers only is misleading, make it more professional."
- **The level map is now a quest path of cards** (maintainer pick). This replaces the 2048×480 scrolling strip with `LevelNode` flags (2026-10-05, SIG-15) and the 2026-10-04 "flags at `(n*16+8)*2`" geometry on this page.
  - **Banner:** the realm's art (RealmScene, the same four layers) is a short banner at the top, cropped to the ground (no scrolling, no parallax). A `scene: false` realm gets a flat token banner with the realm name, never an empty box and never another realm's art.
  - **Path:** under the banner, one card per chapter, then the boss card, in a single column joined by a trail line with a node per card (✓ done, the number, B for the boss, a padlock when shut). The same layout on phone and desktop; nothing scrolls sideways.
  - **Card:** a small tag ("CHAPTER 1" / "BOSS BATTLE"), the title, a one-line goal, the steps (Lesson · Case · Quick check) each with its state as icon + word, the XP it gives, and a status as icon + word: Done / Continue / Open / Locked / Soon. Tier-locked shows as Locked; a chapter with no content file as Soon.
  - **Goal line:** no new copy. A chapter's goal is its case title ("Case: The summary nobody can use", from its `case.json`); the boss's is its outline `boss.task`. A chapter with no case file yet shows no goal line.
  - **Links:** unchanged. A playable card's title links to its first open step (a done card: its lesson, replay), and the link covers the whole card. A shut card is an `aria-disabled` button with the hint "Clear chapter N to open." (the boss: the same words the quest action returns).
  - **Current chapter:** the card holding the player's next step is marked (a Spark edge, `aria-current="step"`, the word Continue) and brought into view on load (only as far as needed, so the header stays when it already shows).
- **Why cards and not the strip:** a card says what a chapter is, what is left and what it is worth, in words; a numbered flag on busy art said none of that, and on a phone only two flags were in view. The art stays as the banner, so each realm keeps its look.
- **Removed:** `LEVEL_MAP`, `levelNodeX`, `levelNodeGap` and the strip's scroll-driven parallax CSS (nothing else used them). `LevelNode` stays as a primitive for a later map (Math Tower); its `level-node.css` is not imported in `globals.css` until that map uses it.
- **Review fixes (same day, cto + ui-ux):**
  - The page scrolls on load only when the current card is not the first one **and** starts below the fold. A realm with no progress never moves, so the header and "◂ World map" stay in view.
  - The current card says START while the realm has no cleared step, else CONTINUE: the same word as the header button.
  - The current card stands out on any realm colour: a raised surface (surface-3) and a 4px Spark edge drawn as a hard inset shadow (no text shift).
  - A shut card's button is `aria-describedby` its unlock hint. A card shut as a whole drops the LOCKED word on each step (the badge says it once).
  - The flat banner of a realm with no art is 96px tall (was 192px). The banner preloads only the front art layers (mid, near).
  - `getChapterGoals` returns facts (`{ kind: 'case' | 'boss', text }`); the card words them ("Case: …").

## Amendments locked 2026-10-07 (world map, SIG-59)

- **`/map` is the world map, not a redirect.** It shows every realm of a path as a land on one top-down map (`docs/plans/world-map-design-plan.md`). This replaces "/map → redirect to the player's current realm" (2026-10-05). `/map/<slug>` stays the realm's level map and gets a "◂ World map" back link; its title reads "<Realm> · Level map · Sigmorai".
- **World art is its own set** (sea, continents, landmarks, fog, islands; prompts in the world-map spec, PR 3), on a 1024×768 art grid at 1×, shown at ½, 1 or 2. Until it exists the world is a token-coloured SVG placeholder. No level art is reused.

## Amendments locked 2026-10-05 (level map, SIG-15)

- The map is DOM, not canvas. /map/[realm] (and /map → redirect to the player's current realm) renders the four PNG layers via RealmScene in a 2048×480 horizontally scrolling box (exact 2×), with seven LevelNode links on top. Why: the design file already uses <img> + buttons; canvas would only remove accessibility.
- A node is a chapter (6) or the boss (1), never a step. State = ChapterView.status; done→done, open→open (or current for the chapter holding next.step), locked|tier-locked|soon→locked. A playable node links to the chapter's first open step, else its lesson (replay). Steps stay on the realm page.
- Node geometry comes from design/assets/levels/layout.json as one LEVEL_MAP constant (1024×240 grid, ground 192, nodes [4,11,19,27,35,44,58], scale 2). The boss sits at 1872 screen px; 'boss castle at 1840' is dropped (the castle lived in the old SVGs).
- Parallax is scroll-linked and CSS only, gated by prefers-reduced-motion: no-preference; without support or with reduced motion the layers scroll 1:1. No rAF loop.
- Deferred to a follow-up ticket: hero walk + Hallucinant ghosts, the selected-level card, the NEW LEVEL banner (sync, step 8), the ALL REALMS grid (/realms exists), the Math Tower map (step 6).

## Amendments locked 2026-10-05

- **The pixelate pipeline stays outside the repo.** It is a Python script (numpy + Pillow), and this is a Bun repo. The maintainer decided not to ship it. It lives in the maintainer's local art folder with the raw Higgsfield renders. This replaces Pipeline step 2's "offline in `scripts/art/`". Only the finished PNGs are committed.
- **What the pipeline does now** (replaces the "≤32 colours per realm, snapped to tokens" line in step 2): crop each raw 2688×1152 render so its ground line lands at 80%, box-downscale to the 1024×240 grid, hard alpha (no semi-transparent pixels), quilt a seamless left↔right join on **all four** layers (near too), drop floating half-objects the join cuts, then quantise each layer on its own: sky 24, far 32, mid 64, near 48 colours. No token snapping yet. The snow realm (08) skips the fake-checkerboard removal so the white snow survives.
- **Output files:** `public/levels/realm-00` … `realm-08` and `public/levels/math`, each with `{sky,far,mid,near}.png` at **1×** (1024×240, ground at row 192). The level map scales them 2× with nearest-neighbour, so 1 art pixel = 2 screen pixels, as locked below.
  > **Amended 2026-10-07 (path curriculum, PR 1b):** a `REALMS` row has `scene: boolean`. A specialist realm (r9 and up) ships with `scene: false`: its scene is a flat `neutral` fill and its share image is the site default. Another realm's art is never reused. Its own art PR adds `public/levels/realm-NN` and sets `scene: true`; its accent stays `neutral` until a token exists. See `path-curriculum-design-plan.md` → "Amendments locked 2026-10-07 (devil pass, maintainer "go with your lean")".
- **Realm 04 near was regenerated** (2026-10-05) because the first render had a heraldic cross on a pennant. The new prompt asks for a plain solid-blue pennant with no emblem. The other 39 layers are the 2026-10-04 renders.

## Amendments locked 2026-10-04

- **The design export wins over this draft.** `design/assets/art/HIGGSFIELD_PROMPTS.md` already defines the hero layers and the per-realm subjects, and `design/assets/levels/layout.json` defines the level geometry. The per-realm table below is kept only as mood notes. Generate from the design file's prompts.
- **Two pixel scales, both fixed by the design:**
  - **Landing hero: 4×.** Higgsfield layers are 1920×640 (`hero-{sky,far,mid,near}.png`, the ground at 80% height, seamless left↔right). The canvas draws them at a 160px internal height, so 1 art pixel = 4 source pixels. This is the 4× the maintainer approved.
  - **Level maps: 2×.** Level art is a 1024×240 grid (`layout.json`: `w:1024, h:240, groundY:192`, nodes `[4,11,19,27,35,44,58]`) shown at 2048×480. Flags sit at `(n*16+8)*2 = n*32+16`, and the boss is at 1840. A generated level layer is pixelated down to 1024×240, not to 512×120, so it matches the existing `realm-XX.svg` pixel size. Mixing 2px and 4px pixels in one scene looks wrong.
- **Higgsfield MCP isn't connected yet.** Until it is, the maintainer generates in the Higgsfield app and drops the files in `design/assets/art/`. The hero falls back to the procedural scene when a file is missing.

---

## Context

Mood references from the maintainer (2026-10-04): a blue-sky cliff platformer tileset, an autumn sunset tileset, and three Owlboy screenshots (floating islands, cumulus clouds, twisted trees, a speech bubble, a segmented HP bar top-left). **These are mood references only.** One of them is a watermarked stock image and Owlboy is a commercial game, so none of these images, characters or compositions ship. We generate our own.

The level map spec (`docs/build-prompt.md` → Canvas scenes) fixes the geometry: a 2048×480 level, flags at x = [4,11,19,27,35,44] × 32 + 16, boss castle at x = 1840. The hero scene uses a 160px-tall internal resolution and `hero-{sky,far,mid,near}.png` parallax layers.

## Look (shared across all realms)

- Side view, platformer framing, horizon at about 60% height.
- Layers: **sky** (gradient bands and clouds), **far** (silhouetted mountains or islands, low contrast), **mid** (floating islands, trees, landmarks), **near** (ground and platforms the hero walks on, highest contrast).
- Hard pixel edges, limited palette per layer, dithered sky bands like the sunset reference. No anti-aliasing and no blur.
- UI over the scene follows `design/` tokens, not the art (DialogBox parchment, segmented XPBar).

## Per-realm themes

| #   | Realm             | Scene idea (keeps the shared look)                             | Time of day |
| --- | ----------------- | -------------------------------------------------------------- | ----------- |
| 00  | Bootstrap Village | grassy cliffs, small village rooftops, gentle hills            | morning     |
| 01  | Prompt Forest     | dense canopy, twisted giant trees, mossy platforms             | noon        |
| 02  | Tool Forge        | rock cliffs, forges and chimneys, sparks, anvils on ledges     | sunset      |
| 03  | Context Library   | floating stone islands with bookshelves, ruins, scrolls        | golden hour |
| 04  | Agent Citadel     | walls and towers on a plateau, banners                         | afternoon   |
| 05  | MCP Bridgelands   | rope and stone bridges between floating islands                | bright sky  |
| 06  | Eval Arena        | colosseum ring, stone tablets with check marks, target banners | autumn      |
| 07  | Swarm Spire       | a vertical spire, many small flying creatures, cloud sea       | dusk        |
| 08  | Production Peaks  | snowy peaks, observatory, aurora                               | night       |
| T   | Math Tower        | an interior tower, Σ glyph blocks, stairs                      | lamp-lit    |

The Hallucinant fog appears as a soft purple dithered layer that thins as the learner clears chapters (a later, optional effect).

## Pipeline

1. **Generate** each layer separately in Higgsfield (via its MCP when connected), wide format, with a style-locked prompt block reused across realms. Prompts live in `design/assets/art-prompts/realm-XX.md` so they're versioned.
2. **Pixelate** offline in `scripts/art/`: nearest-neighbour downscale to the target pixel grid (for example 512×120 for a 2048×480 level at 4×), then quantise to a fixed palette of ≤32 colours per realm, snapped to the token palette where a token exists.
3. **Tile check:** the left and right edges match (horizontal wrap) for sky, far and mid.
4. **Human review**, then commit to `public/levels/realm-XX/{sky,far,mid,near}.png`. The flag and castle positions stay in `lib/constants`, so the art fits the geometry and not the other way round.

The app never generates art at runtime.

## Open questions

1. **Connect Higgsfield MCP** to this Claude Code session (or generate in the Higgsfield app and drop files into `design/assets/generated/`).
2. **Pixel scale:** lean 4× (512×120 source → 2048×480). 3× looks finer but makes the 480px height awkward.
3. Is the near layer **walkable geometry** (the hero follows its top edge), or decoration over a flat path? Lean: a flat walk line in phase 1.

## Companion plans

- `docs/plans/knowledge-base-design-plan.md`
