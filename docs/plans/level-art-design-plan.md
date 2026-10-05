# Sigmorai — Level art (parallax realms)

> Every realm's level map and the landing hero use layered pixel-art scenes in one shared look: lush side-view platformer worlds with floating islands, big cloudscapes and cliff platforms. Art is generated offline (Higgsfield), cleaned into true pixel art, and reviewed before it ships.

## Status

**STATUS: Substantive stub. Build step: 1 (hero) and 4 (level map). Track: both.**

## Amendments

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
