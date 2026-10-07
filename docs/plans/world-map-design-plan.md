# Sigmorai — World map

> `/map` becomes a real map of Latentia: one big top-down pixel-art world, each realm a continent or island, with zoom, your path and where you are. The side-view level map (`/map/<slug>`) stays as the zoomed-in realm view. Read end-to-end before any code; each phase is gated by explicit approval.

## Status

**STATUS: Draft for review (2026-10-07). Ticket: SIG-59. Build step: 4 follow-up (level map). Track: all.**

**SCHEMA:** no schema change. The page reads the same data as `/realms` and `/map/<slug>` (`getTrackMap`). Not `SCHEMA REVIEW REQUIRED`.

## Amendments

## Amendments locked 2026-10-07 (devil pass, PR 1)

- **Zoom steps are ½, 1, 2 only.** ½ draws `world-512.png` (offline box-downscale) at 1:1; 1 and 2 draw `world.png`. ¼, 3 and 4 are dropped: 3×/4× mix pixel scales with the 2× level art (level-art amendment 2026-10-04), and ¼ was a non-link thumbnail with its own code path. Overview = ½ under 1024px wide, else 1.
- **The map box is a native scroll box, like the level map.** Drag, wheel, scrollbars, arrow keys and clamping come from the browser. No Pointer Events pan, no custom pinch, no Ctrl/⌘+wheel, no wheel hint, no `touch-action: none`, no `+ − 0` keys. Zoom = two 44px PixelButtons in one small client component (`data-zoom` on the box, scroll kept on the centre). Centring reuses `ScrollToCurrent` (selector prop, both axes).
- **Footprints are rectangles** `{ x, y, w, h }` centred on the anchor, not polygons.
- **No hero and no tag when `map.next` is null** (every realm cleared, or nothing live).
- **No skip link, no `role="group"`, no `role="status"` zoom label.** The box is a labelled `<section>`; the zoom level is visible text.
- **`heroName` comes from `getViewer().stats`**; `RealmsPage` gains `heroName: string | null`. No new reader.
- **Markers are a new `WorldMarker`** (Link + `StatusBadge` + `REALM_STATUS_TEXT`), not a `LevelNode` variant.
- **The "Your path" list lives in `components/realms/path-list.tsx`**; the dashboard (per-path PR 2) reuses it. The per-path spec gets a dated line.
- **Copy:** `/map/<slug>` title becomes "<Realm> · Level map · Sigmorai"; `MAP_TEXT.description` has no hard-coded count. `DESIGN.md` line about "only the level map scrolls sideways" gets "the level map and the world map scroll inside their boxes".
- **Order:** PR 1 lands after per-path PR 1a (merged). It does not need 1b. PR 3 island prompts 14–18 are rendered only when each creator realm ships.
- **PR 1 includes the journey layer** (trail, hero, ragged edge fog); PR 2 is folded in. Zoom lives in `components/map/zoom-controls.tsx`. Slot fog patches wait for the Higgsfield art (PR 3): in PR 1 an empty slot is plain sea. The placeholder uses land (`--mint-700`), beach (`--parchment-400`) and sea (`--byte-700`, sparse `--byte-600` waves) tokens and a seeded, uneven coast on whole tiles inside each footprint, so it reads as a map. The box height follows the overview zoom only; the overview is ½ under 68rem (1088px). The hero stands left of the current pin. Pins are 28px inside a 44px link.
- **The hero stands on the first clear side of its pin (left, right, above, below), picked per place by `heroSide`; a test checks every core place and slot at every zoom.** Above and below also clear the marker's own tag and name. Today r3 stands above (at ½ its left hides the Math Tower label); slots s3, s4, s5 and s9 stand right.

<!-- New decisions are appended here as:
## Amendments locked YYYY-MM-DD
- ...
-->

---

## Context

**The request** (maintainer, 2026-10-07): "The World map in the header is wrong: the picture is not a map, and it is the same for every path. Make a real big map: each realm is a continent; zoom in / zoom out; see your path and where you are. Use Higgsfield for the art. If you represent a map, put a map."

**What is true today** (read from the code, 2026-10-07):

| Fact                                                                                                                                                  | Where                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| The header item "World map" links to `/map`                                                                                                           | `lib/constants/nav.ts` (`NAV_ITEMS`, `MAP_HREF`)                 |
| `/map` has no page. It redirects (307) to `/map/<slug>` of the realm that holds the next step, else realm 0. It keeps a valid `?track=`               | `app/(app)/map/page.tsx`                                         |
| `/map/<slug>` is one realm's side view: 4 parallax PNG layers, 2048×480, scrolls sideways, one `LevelNode` per chapter + boss, prev/next realm arrows | `app/(app)/map/[realm]/page.tsx`, `components/map/level-map.tsx` |
| The current node is centred on load                                                                                                                   | `components/map/scroll-to-current.tsx`                           |
| One reader gives every realm's state for one track and player: `getTrackMap(track, userId)` → `TrackMap { track, realms: RealmView[], next }`         | `lib/data/realms.ts`, `lib/grading/track-map.ts`                 |
| A realm state is `cleared` · `in-progress` · `open` · `tier-locked`, with text + icon in `REALM_STATUS_TEXT`                                          | `lib/constants/curriculum.ts`, `lib/constants/realms-copy.ts`    |
| `?track=` picks the path; else the player's path; else `DEFAULT_TRACK` (strategist) for a visitor                                                     | `lib/data/realms.ts` (`pickTrack`)                               |
| Level art is committed at 1× (1024×240 grid) and scaled 2× by CSS, nearest-neighbour                                                                  | level-art spec, amendment 2026-10-05                             |
| Art comes from Higgsfield, cleaned by the maintainer's own pixelate script (outside the repo). Only finished PNGs are committed                       | level-art spec, amendment 2026-10-05                             |
| New realm art is generated fresh. Old realm images are never reused                                                                                   | `content/CLAUDE.md`                                              |
| The design file has **no** top-down world map screen. Its "WORLD MAP" screen is the side-view level map plus an ALL REALMS grid                       | `design/ui_kits/webapp/Sigmorai App.dc.html` → `isMap`           |

**Why the picture is "not a map".** The header says "World map", but the player lands on one realm's side-view strip. It looks the same on every path. Nothing shows the whole world, the path through it, or where the player stands.

**What depends on what.** The per-path curriculum spec (`origin/docs/path-curriculum`, `docs/plans/path-curriculum-design-plan.md`, amendments 2026-10-07) gives each track its own realm list: core realms r0–r8 on every path, specialist realms r9+ owned by one track, map order = the outline order. Its PR 1b adds `track` and `scene` to each `REALMS` row and makes `buildTrackMap` walk the outline order. This spec builds on that, but PR 1 here can land first (see Phases → Dependency).

**What this replaces.**

- Level-art spec, amendment 2026-10-05: "/map → redirect to the player's current realm". `/map` becomes the world map. PR 1 adds a dated line there.
- `lib/constants/nav.ts` comment on `MAP_HREF` ("`/map` sends the player to the realm they are in").
- `.claude/rules/scoped/pixel-art.md` gets a short "World map" section in PR 1 (zoom steps, no canvas, markers are links).
- `DESIGN.md` stays true: the world map pans **inside** its box. The page itself never scrolls sideways.

## Purpose

A player wants to see the whole journey: which lands they cleared, where they stand now and what is ahead. Today they only see one realm at a time. This spec gives them a real world map: one big pixel-art world where each realm is a place. It is different per path: your realms are lit, your trail is drawn, and your hero stands where you are. Tapping a continent opens that realm's level map.

**Example.** Mia is on the Creator path. She opens "World map". She sees the whole world of Latentia. Bootstrap Village and Prompt Forest have a solid gold trail between them (cleared). Her hero sprite stands on Pigment Bazaar, an island next to Prompt Forest, with the tag "YOU ARE HERE". The trail ahead is dashed. A builder who opens the same map sees fog where Mia's Creator islands are.

## User-visible behavior

### Golden path (signed in)

1. Player clicks **World map** in the header. `/map` opens. No redirect.
2. Top of the page: title "World map", the path switch (`TrackSwitch`, same as realm pages), and a one-line hint ("Tap a land to open it. Pinch or use + and − to zoom.", draft, voice-guardian).
3. The **map box** shows the whole world at the "overview" zoom (see Zoom). The player's path is lit: each realm on it is a continent or island with a **marker** (number, state icon, name).
4. The **trail** joins the path's realms in path order. Solid where the realm is cleared. Dashed ahead.
5. The **hero** (the player's `PixelAvatar` sprite) stands on the current realm, with a "YOU ARE HERE" tag.
6. The player zooms in (button, pinch, Ctrl/⌘ + wheel, or keyboard) and drags to pan.
7. The player taps a marker → `/map/<slug>` (the level map). That page gets a "◂ World map" back link.
8. Under the map box: **"Your path"**, a plain text list of the path's realms, in path order. Each row: number, name, state (icon + word), `cleared / total`, and a link. The current realm row says "YOU ARE HERE". This list is the screen-reader view and the no-JS view.

### Per path

- Everyone sees the **same world image** (sea, core continents, landmarks).
- **Core realms (r0–r8)** are on every path. They are lit and are links on every path.
- **Specialist realms (r9+)** are extra islands. Each one shows only on its owner track's map, in its reserved **slot**.
- A slot with no realm on the shown path (another path's island, or a slot not used yet) sits under **fog**. Fog has no label, no link and no focus.
- `?track=creator` shows the Creator map, like the realm pages. Progress is per track, so the player sees their own progress on that path.
- A **visitor** (signed out) sees the default path (`DEFAULT_TRACK`) with no progress: every trail segment dashed, no hero, a "START HERE" tag on the path's first open realm, and the existing `SignInNote`.

### Continent state

Every marker shows the realm state with an icon **and** a word, from `REALM_STATUS_TEXT` (never colour only):

| State         | Marker text (from `REALM_STATUS_TEXT`) | Link?                                                  |
| ------------- | -------------------------------------- | ------------------------------------------------------ |
| `cleared`     | ✓ CLEARED                              | yes                                                    |
| `in-progress` | ▸ IN PROGRESS                          | yes                                                    |
| `open`        | ▸ OPEN                                 | yes                                                    |
| `tier-locked` | · ADVANCED · LOCKED                    | yes (the level map shows it locked, same as `/realms`) |

The accessible name of a marker link: "<Realm name>, <state>, <cleared> of <total> cleared" (plus ", you are here" on the current realm). Example: "Prompt Forest, in progress, 2 of 7 cleared, you are here".

### Landmarks

The **Math Tower** and **The Frontier** stand on the world as two landmarks, on every path. Each is a plain link (`/math`, `/frontier`) with its name. No state, not on the trail. The Frontier sits at the edge of the fog, which fits its meaning ("new land from new docs").

### Zoom and pan

- **Zoom steps** (screen px per art px): **¼, ½, 1, 2, 3, 4**. Every step is a whole-number scale of some asset, so pixels stay crisp (pixel-art rule: never `scale(1.5)`):
  - ¼ and ½ draw an offline downscaled copy of the world (`world-256.png`, `world-512.png`) at 1:1.
  - 1–4 draw `world.png` (1024×768) at 1×–4× with `image-rendering: pixelated`.
- **Overview** = the biggest step where the whole world fits the box width: ¼ on a phone (256 px wide), ½ on a tablet, 1 on desktop. The page opens at the overview, centred.
- **Buttons:** "+" (zoom in), "−" (zoom out), "Whole map" (back to overview). Each is a 44px `PixelButton`, `aria-disabled` at its limit. A small HUD label shows the zoom ("2×") with `role="status"`.
- **Pointer:** drag pans (mouse or one finger). Two fingers pinch to zoom. During a pinch the scale follows the fingers; on release it snaps to the nearest step.
- **Wheel:** **Ctrl/⌘ + wheel** zooms around the pointer (trackpad pinch sends this too). A plain wheel scrolls the page, so the page never gets stuck under the map. The first plain wheel over the map shows a short hint: "Use Ctrl + scroll to zoom" (⌘ on Mac).
- **Overview tap:** at ¼ the markers are small state dots (decoration). A tap on the map zooms one step (to ½) around the tap point. From ½ up, markers are 44px links.
- **Keyboard:** the map box is focusable (`tabindex="0"`, `role="group"`, label "World map", hint in `aria-describedby`). Arrow keys pan by 64 screen px. `+` / `=` zoom in, `-` zooms out, `0` goes back to the overview. Tab moves through the markers in path order. A focused marker outside the box is panned into view.
- **Bounds:** pan is clamped, so the world never leaves the box. When the world is smaller than the box, it is centred.
- **Crisp pixels:** pan offsets are rounded to whole screen pixels.
- **Reduced motion:** zoom changes are instant (no transition). The hero does not idle-bob. Drag still follows the finger (direct control is not "motion").
- **Labels by zoom:** ¼ → dots only; ½ → number + state icon (name in the accessible name); 1 and up → number, icon and name.

### Edge cases

- **No current realm** (`map.next` is null: everything cleared, or nothing live yet): no hero and no tag. The list shows no "YOU ARE HERE".
- **Every realm cleared:** the whole trail is solid. The hero stands on the last realm of the path.
- **A realm on the path has no slot in the geometry:** impossible by test (see Acceptance). If it ever happens at runtime, the realm is left off the picture but stays in the list.
- **Art missing** (PR 1 and PR 2, or an image fails to load): the token placeholder (SVG sea + shapes) is always drawn under the art, so the map still works.
- **JS off or failed:** the map box shows the overview (CSS picks the step by width), the markers at that zoom, and the list. No pan, no zoom. Every realm is still reachable from the list.
- **Specialist realm without island art:** a flat `neutral` island shape from the geometry (same idea as the per-path spec's "no art → flat neutral fill").
- **Unknown `?track=`:** ignored, same as today (`pickTrack`).

## Fairness and integrity check

N/A for XP and grading. The page only **reads**. States come from `buildTrackMap`, which uses the same `decideOpen` as the Server Actions, so the map can't show "open" where an action refuses. No answers, no XP amounts and no other player's data reach the page. A link to a locked realm opens a page that is still locked on the server.

## Data model

N/A. No table, column, index or migration.

## API contract

No Server Action and no route handler. One read, server-only:

- **`lib/data/realms.ts`**: a small reader for the page that reuses `mapFor(trackParam)` and the cached `getViewer()`. It returns:
  - `viewer`: `Viewer['status']`
  - `map`: `TrackMap` (unchanged, from `getTrackMap`)
  - `heroName`: the player's hero name for the avatar seed, or `null` for a visitor or a player still in onboarding.
- **One pure helper** (in `lib/grading/`, next to `track-map.ts`, `bun test`) turns `TrackMap` + the geometry constant into the view the page draws:
  - `realms`: per realm on the path, in `map.realms` order: id, slug, name, href (`mapHref(slug, track)` with `track` only when `?track=` was given, like today's redirect), status, `cleared`, `total`, anchor `{ x, y }`, island kind (`base` · `art` · `shape`), `current: boolean`.
  - `trail`: one segment per pair of neighbours in path order, `{ from, to, cleared: boolean }`. A segment is solid (`cleared`) when its `from` realm is cleared.
  - `fog`: the slot ids with no realm on this path.
  - `current`: `map.next?.realm ?? null`.
- Shared types go in `lib/types` (Props stay in their component file).
- **Metadata:** title "World map · Sigmorai", canonical `/map` (no `?track=`). Not in the sitemap (same as `/map/*` today).
- `/map` stays dynamic (it reads `auth()` for progress), like `/map/<slug>`.

## Geometry: one constant

All positions live in **one constant**, `lib/constants/world-map.ts` (barrel `@/lib/constants`), so art and code agree. Code reads it; the art is made to fit it (level-art rule: "the art fits the geometry, not the other way round").

- **Art grid:** 1024×768 art px (64×48 tiles of 16). Same idea as the level map (1024-wide grid, committed at 1×). At zoom 2 it is 2048×1536 screen px.
- **Core realms:** an anchor `{ x, y }` (marker point, in art px) and a footprint polygon on the 16px tile grid (for the placeholder shape and the overlap test), per realm id 0–8.
- **Specialist slots:** a list of slot ids (`s1`…`s10`), each with an anchor and a footprint. A specialist realm gets a slot when it ships: one line `realmId → slotId` in the same constant, plus `island: 'art' | 'shape'`.
- **Landmarks:** Math Tower and The Frontier, each with an anchor and a footprint.
- **Rules (tested):** every anchor is inside the grid; no two footprints overlap; any two anchors are at least 96 art px apart (so 44px markers never overlap at zoom ½); every core realm has an anchor; every assigned slot exists and is used once.

**Starting layout** (PR 1 tunes it in the browser before the art is made; the art prompts copy the final numbers):

| Place                 | Anchor (x, y) | Look (for the art)                                          |
| --------------------- | ------------- | ----------------------------------------------------------- |
| r0 Bootstrap Village  | 140, 640      | south-west, gentle green hills, a small village             |
| r1 Prompt Forest      | 140, 420      | west, dense deep-green forest                               |
| r2 Tool Forge         | 380, 600      | south, dark rock with glowing orange forges                 |
| r3 Context Library    | 330, 200      | north-west of centre, stone ruins, purple dusk light        |
| r4 Agent Citadel      | 560, 400      | centre, a blue fortress on a plateau                        |
| r5 MCP Bridgelands    | 640, 640      | south, many small islands joined by bridges, teal water     |
| r6 Eval Arena         | 870, 560      | south-east, sandstone colosseum, pink sand                  |
| r7 Swarm Spire        | 860, 320      | east, violet crystal spires                                 |
| r8 Production Peaks   | 620, 140      | north, snowy peaks, an observatory                          |
| Math Tower (landmark) | 120, 180      | north-west, a small rocky isle with one tall tower          |
| The Frontier          | 950, 110      | north-east edge, a half-drawn coast going into the fog      |
| Slots s1–s10          | see below     | **open sea** in the world image (islands are placed on top) |

Slots (open sea, footprint 80×64 art px): s1 260,520 · s2 520,520 · s3 200,280 · s4 470,260 · s5 760,680 · s6 720,470 · s7 930,440 · s8 780,170 · s9 280,700 · s10 380,420. Footprints: core continents 160×120, landmarks 80×80, all centred on the anchor. This layout passes the geometry rules (checked: no overlap, every anchor pair ≥ 96 art px apart).

**Creator slot lean** (outline order from the per-path spec: r0, r1, r11, r2, r10, r12, r3, r13, r4, r5, r9, r6, r7, r8): r11 Pigment Bazaar → s1 · r10 Reel Hollow → s2 · r12 Echo Caverns → s10 · r13 Pattern Atelier → s4 · r9 Canvas Workshop → s5. Each specialist realm is placed next to the core realm it builds on, so the Creator trail does not cross itself. s3 and s6–s9 stay for builder and strategist realms later.

## Look

- **Top-down view**, same palette mood as the level art (16-bit, hard pixels, soft daylight). The level map stays side-view.
- **Sea:** deep blue to teal shallows. **Edge of the world:** a band of Hallucinant fog (purple-pink, dithered), baked into the world image.
- **Markers:** UI, not art. Built from tokens like `LevelNode` (bevel, hard shadow, notch outline, realm accent via `data-accent`). Search `components/` first; extend `LevelNode` with a world variant if it fits, else a new `components/map/` piece and say why.
- **Trail:** SVG in art px over the image. Square dots (`stroke-linecap: square`), `shape-rendering: crispEdges`. Cleared: `--spark-500` solid. Ahead: `--ink-200` dashed. Both have an `--ink-950` underlay so they read on sea and land. Solid vs dashed carries the meaning, not colour.
- **Hero:** the existing `PixelAvatar` (seeded by hero name), size sm, standing on the current marker. Decoration (`aria-hidden`); "YOU ARE HERE" is a text tag.
- **Fog (PR 2 placeholder):** an SVG checker pattern (2 art px dither) in `--ink-400` over the slot footprint. PR 3 swaps in the fog art.
- **Placeholder world (PR 1):** flat sea `--byte-700`, land in `--surface-3` with a 2-art-px coast in the realm key (`--realm-N`, `neutral` for specialist), drawn as SVG from the footprints, `crispEdges`. No old realm art is reused.
- **Tokens only.** No new hex, zero radius, hard shadows, no gradient. Reading text (list, hint) is Atkinson; marker names and HUD labels use the HUD font.

## Accessibility

- The art, placeholder, trail, fog and hero are **decoration** (`aria-hidden="true"`, empty `alt`).
- Markers are **real links** with full accessible names (see Continent state). At ¼ they are hidden dots (not focusable, `aria-hidden`), because the list below is the way in.
- A **skip link** at the start of the map box: "Skip to the realm list". Screen readers get the list, not the pixels.
- The **"Your path" list** is always rendered (also with JS off). It is an `<ol>` in path order. State = icon + word (`StatusBadge`). Rows ≥ 44px.
- Every control ≥ 44px. Focus ring = the global 3px Spark ring, on markers, buttons and the map box.
- The zoom label is `role="status"` (polite). No other live announcements.
- `prefers-reduced-motion`: no zoom transition, no hero idle animation.
- 360px: no page scroll sideways; the box pans inside itself; the list stacks (name, then state).

## AI and cost

N/A in the product: no model call. The art is generated offline in Higgsfield (PR 3). **This costs Higgsfield credits**: 18 prompts (13 now, 5 Creator islands as their realms ship), with 2–4 tries each. No art is generated at runtime.

## States and transitions

| State                            | What the player sees                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Loading (`loading.tsx`)          | A map-box skeleton at its final size (no layout jump) and 6 list-row skeletons. `role="status"` "Loading the map". No spinner. |
| Error (`error.tsx`)              | `RouteError` with `MAP_TEXT.error` and Retry, same as `/map/<slug>`.                                                           |
| Empty: visitor / nothing started | All trail dashed, no hero, "START HERE" on the first open realm, `SignInNote` for a visitor.                                   |
| Empty: no current realm          | No hero, no tag (see Edge cases).                                                                                              |
| Success                          | Lit path, trail, hero, markers, list.                                                                                          |
| Onboarding (signed in, no row)   | Same as a visitor (default path, no progress), no `SignInNote`.                                                                |
| Art loading (PR 3)               | The smaller copy (or the placeholder) shows first, scaled with nearest-neighbour; the bigger copy replaces it when loaded.     |
| JS off                           | Overview + markers at that zoom + list. No zoom controls (they render only after hydration).                                   |
| Phone (≤ 390px)                  | Overview ¼, tap to zoom, box at least 320px tall, list below.                                                                  |
| Keyboard only                    | Skip link, box focus, arrows / + / − / 0, Tab through markers in path order.                                                   |

## Phases

### Dependency on the per-path curriculum (PR 1b)

The world map needs each track's realm list in path order. That arrives in per-path **PR 1b** (`REALMS` rows get `track`; `buildTrackMap` walks the outline order).

**How PR 1 here lands before 1b:** today every track has r0–r8 in order, so `map.realms` is already a correct path. PR 1 draws core realms only. All 10 slots exist in the geometry, unassigned, so they are fogged (PR 2) or plain sea (PR 1). The trail follows `map.realms` order, so when 1b changes that order, the map follows with **no world-map code change**. After 1b, each specialist realm's content PR adds one line (`realmId → slotId`) to the geometry. A test fails if a `REALMS` row owned by a track has no slot, so a specialist realm can't ship without a place on the map.

### PR 1 — `feat(map)`: world map engine with placeholder art

**Goal:** `/map` is a real map page with the token placeholder world, markers, pan/zoom and the text list.

**Files**

- `lib/constants/world-map.ts` _(new)_ — geometry (grid, anchors, footprints, slots, landmarks, zoom steps). Searched first: `LEVEL_MAP` is per-realm side-view geometry and does not fit.
- `lib/grading/world-map.ts` + `.test.ts` _(new)_ — the pure view helper and the geometry tests.
- `lib/data/realms.ts` _(modify)_ — the page reader (reuses `mapFor`, `getViewer`).
- `app/(app)/map/page.tsx` _(modify)_ — redirect → world map page. `loading.tsx`, `error.tsx` _(new, at `/map`)_.
- `components/map/world-map.tsx` _(new, server)_ — box, placeholder SVG, markers, list.
- `components/map/world-viewport.tsx` _(new, client)_ — pan/zoom. State in refs and CSS custom properties (`--z`, `--tx`, `--ty`) on the box; no React state per pointer move. Markers sit in an unscaled layer, positioned from the same variables, so they stay 44px at every zoom.
- The "Your path" list: reuse the per-path PR 2 list if it has landed. Else build it as `components/realms/path-list.tsx`, and PR 2 reuses it (one place).
- `app/(app)/map/[realm]/page.tsx` _(modify)_ — "◂ World map" back link.
- `app/styles/components/world-map.css` _(new)_; copy in `lib/constants/realms-copy.ts` (`WORLD_MAP_TEXT`, voice-guardian); `lib/constants/nav.ts` comment.
- Docs: dated line in `level-art-design-plan.md`; "World map" section in `.claude/rules/scoped/pixel-art.md`.

This is more than 5 files. It goes as two commits in one PR: (a) static map + list (no client JS), (b) the viewport. Each commit builds green.

**No map library and no canvas.** Pointer Events + one CSS transform are enough. Libraries (pan-zoom packages) add weight and don't snap to whole-number steps or keep markers unscaled. Canvas would hide the links from assistive tech (same reason as the level map, 2026-10-05).

**Verification:** `bun run typecheck`, `lint`, `test`, `build`. Browser at 360px and desktop: drag, pinch (real phone or DevTools touch), Ctrl + wheel, buttons, keyboard walk (skip link, arrows, + / − / 0, Tab), JS off, `?track=` for each path, a visitor, reduced motion. Lighthouse accessibility on `/map`. The E2E flow keeps passing (no `/map` step today); add an axe check for `/map` signed out.

**Gates:** devil → ui-ux-reviewer → voice-guardian (copy) → cto.

### PR 2 — `feat(map)`: trail, hero and fog

**Goal:** the journey layer.

**Files:** `components/map/world-map.tsx` (trail SVG, hero, tags, fog pattern) · `lib/grading/world-map.ts` + test (trail segments, fog slots, current) · `app/styles/components/world-map.css` · copy ("YOU ARE HERE", "START HERE").

**Tests:** trail order = `map.realms` order; a segment is solid only when its `from` realm is cleared; visitor → all dashed and `current` = first open realm; fog = slots not assigned to a realm on the shown path; no hero when `next` is null.

**Verification:** as PR 1, plus each state from the States table on each path. **Gates:** devil → ui-ux-reviewer → voice-guardian → cto.

### PR 3 — `feat(map)`: Higgsfield art swap

**Goal:** replace the placeholder with real pixel art.

**Needs a session where the Higgsfield MCP is connected.** In the session that wrote this spec (2026-10-07) the Higgsfield MCP failed to connect (proxy refused the tunnel, 403). Else the maintainer generates in the Higgsfield app and drops the raw renders in the local art folder (level-art amendment 2026-10-04).

**Pipeline** (the maintainer's local script, outside the repo, as for the level art):

1. Render each prompt below. Pick the best try.
2. Pixelate each piece to its art-px size (box downscale, hard alpha, quantise: sea 32 colours, each continent 32, fog 16).
3. **Composite** the 9 core continents and 2 landmarks onto the sea at their geometry anchors (the footprint box is the target). This is how the art fits the geometry exactly: image models can't place things at exact points, so we place them.
4. Export `world.png` (1024×768), then box-downscale to `world-512.png` and `world-256.png`.
5. Export `fog.png` and one `islands/r<N>.png` per specialist realm that has art.
6. Human review at every zoom step. Commit to `public/world/`.

**Size budget:** `world.png` ≤ 400 KB, `world-512.png` ≤ 120 KB, `world-256.png` ≤ 40 KB, `fog.png` ≤ 20 KB, each island ≤ 30 KB.

**Loading:** each zoom step loads its asset on first use (`unoptimized`, like `RealmScene`: a resize would blur pixels). A phone at overview downloads only `world-256.png`. The smaller copy (or the placeholder) shows until the bigger one loads.

**Files:** `public/world/*` _(new)_ · `components/map/world-map.tsx` (image layers over the placeholder) · `lib/constants/world-map.ts` (`island: 'art'` for islands with art).

**Gates:** devil → ui-ux-reviewer → cto. Pixel-art review by the maintainer before commit.

---

## Higgsfield prompt set (PR 3)

**Shared style line (paste into every prompt):**

> 16-bit pixel art, top-down fantasy world map seen from straight above, orthographic, crisp hard pixels, no anti-aliasing, no blur, limited palette, soft daylight, same mood as a cozy 16-bit RPG overworld, no text, no letters, no numbers, no labels, no characters, no UI, no compass, no grid lines

**Transparent pieces** add: "isolated on a fully transparent background, nothing outside the island, clean hard edge".

| #   | File                         | Render size → art size | Prompt (after the style line)                                                                                                                                                                                                                                                                                                   |
| --- | ---------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `sea` (base of world.png)    | 2048×1536 → 1024×768   | A calm open ocean filling the whole image, deep blue (#0B5A8A) with lighter teal shallows (#1A8FD1) in soft patches, small white-blue wave pixels (#40C4FF), a few tiny rocks. A thick band of purple-pink magic fog (#C77DFF, #FF4F8B, dithered) all around the outer edge, thinning toward the centre. No land in the middle. |
| 2   | `continent-r0`               | 640×480 → 160×120      | A small island continent seen from above: gentle green hills, a cozy village with a schoolhouse and red roofs, dirt paths, a little harbour. Morning light.                                                                                                                                                                     |
| 3   | `continent-r1`               | 640×480 → 160×120      | A forest continent seen from above: dense deep-green tree canopy, twisted giant trees, mossy clearings, tiny glowing fireflies, blank wooden signposts.                                                                                                                                                                         |
| 4   | `continent-r2`               | 640×480 → 160×120      | A rocky volcanic continent seen from above: dark stone cliffs, cavern mouths, glowing orange forges and lava channels (#FF6B35), anvils, gears. Sunset light.                                                                                                                                                                   |
| 5   | `continent-r3`               | 640×480 → 160×120      | A continent of floating stone ruins seen from above: open-air libraries, bookshelves, ladders, scattered pages, violet dusk light (#A07BFF).                                                                                                                                                                                    |
| 6   | `continent-r4`               | 640×480 → 160×120      | A plateau continent seen from above: a blue stone fortress with walls and watchtowers, plain solid-blue banners with no emblem, courtyards.                                                                                                                                                                                     |
| 7   | `continent-r5`               | 640×480 → 160×120      | An archipelago seen from above: many small grassy islands joined by rope and stone bridges over teal water (#5CE1E6).                                                                                                                                                                                                           |
| 8   | `continent-r6`               | 640×480 → 160×120      | A sandstone continent seen from above: a round colosseum arena, pink sand (#FF9DBE), blank stone scoreboards, autumn trees.                                                                                                                                                                                                     |
| 9   | `continent-r7`               | 640×480 → 160×120      | A crystal continent seen from above: tall violet crystal spires (#C77DFF), many tiny lights moving in formation, a sea of low clouds around it. Dusk.                                                                                                                                                                           |
| 10  | `continent-r8`               | 640×480 → 160×120      | A snowy mountain continent seen from above: white peaks, glaciers, a small domed observatory on the top, faint green aurora light on the snow. Night-blue shadows.                                                                                                                                                              |
| 11  | `landmark-math`              | 320×320 → 80×80        | A small rocky isle seen from above with one tall round stone tower in the middle, starry dark-violet roof, floating geometric shapes (cubes, spheres) around it.                                                                                                                                                                |
| 12  | `landmark-frontier`          | 320×320 → 80×80        | A half-drawn coastline seen from above that fades into purple-pink fog: a small lighthouse on the last rock, a wooden pier, unfinished land at the fog edge.                                                                                                                                                                    |
| 13  | `fog`                        | 320×256 → 80×64        | A thick cloud of purple-pink magic fog seen from above (#C77DFF, #FF4F8B, #57518C), dithered, fully opaque in the middle, ragged soft-pixel edges, covering whatever is below.                                                                                                                                                  |
| 14  | `island-r9` Canvas Workshop  | 320×256 → 80×64        | A small island seen from above: an artist workshop with easels and big blank canvases, paint pots, cables running like bridges to small docks.                                                                                                                                                                                  |
| 15  | `island-r10` Reel Hollow     | 320×256 → 80×64        | A small island seen from above: a round hollow valley with ring-shaped stone circles like film reels, a lighthouse with a wide projector beam.                                                                                                                                                                                  |
| 16  | `island-r11` Pigment Bazaar  | 320×256 → 80×64        | A small island seen from above: a market of stalls with colourful awnings and dye vats in many bright colours, a small harbour.                                                                                                                                                                                                 |
| 17  | `island-r12` Echo Caverns    | 320×256 → 80×64        | A small rocky island seen from above: sea caves, rock rings like sound waves in the water, hanging crystal chimes.                                                                                                                                                                                                              |
| 18  | `island-r13` Pattern Atelier | 320×256 → 80×64        | A small island seen from above: garden plots in a neat modular grid, a workshop with plain swatch banners in a row, tiled stone paths.                                                                                                                                                                                          |

Notes:

- Realm names in 14–18 are the per-path spec's **drafts**; the prompts follow any rename. A builder or strategist specialist realm gets its island prompt in its own art PR, same size and style.
- Hex values are the existing tokens (`--byte-*`, `--realm-*`, `--glitch-*`, `--rune-*`, `--ink-500`). They guide the mood; the pipeline does not snap to tokens (level-art amendment 2026-10-05).
- "Plain banners with no emblem" and "blank boards" avoid symbols and text in the art (the realm 04 lesson, 2026-10-05).

---

## Acceptance criteria

- [ ] `/map` renders the world map (HTTP 200), not a redirect. The header "World map" still links to `/map`.
- [ ] Every realm on the shown path has a marker at its anchor and a row in "Your path", in `map.realms` order.
- [ ] Another path's specialist islands never show. Unassigned slots are fog: no label, no link, no focus.
- [ ] `?track=builder|strategist|creator` switches the map like the realm pages. A visitor sees `DEFAULT_TRACK` with no progress and the sign-in note.
- [ ] Each marker and list row shows state as icon + word. Marker accessible names include name, state and `cleared of total`.
- [ ] Trail (PR 2): solid after a cleared realm, dashed ahead, in path order. Hero + "YOU ARE HERE" on `map.next.realm`; none when `next` is null.
- [ ] Zoom steps are ¼, ½, 1, 2, 3, 4 only (pinch snaps on release). Pixels are crisp at every step (no smoothing, whole-pixel pan).
- [ ] Buttons, pinch, Ctrl/⌘ + wheel and keyboard (arrows, + / − / 0) all work. A plain wheel scrolls the page.
- [ ] Markers are 44px links at ½ and up; never overlap (anchor test). Focus ring is the 3px Spark ring.
- [ ] Reduced motion: no zoom transition, no hero animation.
- [ ] JS off: overview + markers + list; every realm reachable.
- [ ] 360px: no sideways page scroll; the box pans inside itself.
- [ ] No canvas, no map library, no new hex, zero radius, no gradient. No old realm art reused.
- [ ] Geometry tests pass: anchors inside the grid, no footprint overlap, ≥ 96 art px between anchors, every core realm placed, every assigned slot exists once, every track-owned `REALMS` row has a slot (after per-path 1b).
- [x] `/map/<slug>` has a "◂ World map" back link. The dashboard "Your path" list (per-path PR 2) links to `/map` ("View on world map"), in whichever PR lands second.
- [ ] PR 3: asset sizes inside the budget; a phone at overview downloads only `world-256.png`.
- [ ] typecheck, lint, test, build green; axe passes on `/map` signed out.

## Risks

- **Art size and phone performance.** At 4× the world is 4096×3072 screen px. Showing one 1024×768 image scaled by the GPU is cheap, but the SVG layers (trail, placeholder) are redrawn at that size. Test on a mid-range Android. If it stutters: cap phones at 3×, and add `will-change: transform` only while a gesture runs.
- **Zoom on touch.** `touch-action: none` on the box means a finger on the map can't scroll the page. The box is capped (about 60% of the screen height on phones), so there is always page outside it to swipe. Watch for players getting "stuck".
- **Image models can't place things exactly.** That is why continents are made one by one and composited at the anchors (PR 3 step 3). The sea render can still put odd shapes where a slot is; the pipeline checks slot areas are open sea.
- **Specialist islands appear later.** Each one needs a slot line and, later, an island render. Until then: a `neutral` shape. The test makes sure no specialist realm ships without a slot. 10 slots may run out once builder and strategist add realms; adding slots means a new sea render (the world image must have open sea there).
- **The design file has no world map screen.** This spec derives the look from the level map and the tokens. A Claude Design pass should add the screen; until then `design/` can't settle a look question.
- **Overview on a phone is small** (256 px wide). Fine for "where am I", but every detail needs a zoom. The list below is the fast way in.

## Out of scope

- Animated travel (the hero walking between realms), ships, weather, day/night.
- Multiplayer: other players on the map, friends, presence.
- Quests, NPCs or dialog on the world map. Chapters stay on the level map.
- Fog that thins as the player clears realms (the level-art "later, optional" idea).
- A minimap, search, or saving the last zoom and position.
- Changing `/map/<slug>` beyond the back link.
- New design tokens. Specialist accents stay `neutral` until a Claude Design pass.
- Putting `/map` in the sitemap.

## Calls I'm under 95% on

1. **`/map` is a top-down world map, not a redirect.** Lean: yes; one large pixel-art world, each realm a continent/island; `/map/<slug>` stays as the zoomed-in realm view, reached by tapping a marker. Why: it is what you asked for, and the level map already does the realm view well. Other option: a zoomable stack of the side-view strips; downside: still not a map.
2. **Pan + zoom with one CSS transform, no library, no canvas.** Lean: yes; Pointer Events, steps ¼ ½ 1 2 3 4, offline downscaled copies for ¼ and ½, whole-pixel pan, reduced motion = instant zoom. Why: crisp pixels, accessible links, small code. Other option: a pan-zoom library; downside: more weight, no step snapping, markers would scale with the art.
3. **Same world for everyone; specialist islands only on their owner's map; fog on every unused slot.** Lean: yes. Why: one image to make; "your path" is shown by what is lit, labelled and on the trail. Other option: a different world image per path; downside: 3× the art, and the core realms would move between paths.
4. **Trail and hero.** Lean: SVG trail in path order, solid after a cleared realm, dashed ahead; `PixelAvatar` hero on `map.next.realm`; visitors get "START HERE" and no hero. Why: reuses the sprite and the existing "next step" rule. Other option: hero on the last cleared realm; downside: it points to the past, not where to go.
5. **Geometry in one constant, art composited to it; 1024×768 art grid.** Lean: yes; the world is 1024×768 art px (2048×1536 screen px at 2×), continents rendered one by one and placed at the anchors. Why: same 1× + CSS-scale rule as the level art, small files for phones, and exact placement. Other option: a 2048×1536 art-px world from one render; downside: about 4× the file size, and the model decides where land goes, so the anchors must chase the art.
6. **Ctrl/⌘ + wheel zooms; plain wheel scrolls the page.** Lean: yes. Why: the page never gets stuck under the map. Other option: plain wheel zooms; downside: desktop players can't scroll past the map to the list.
7. **Overview starts the page; at ¼ markers are dots and a tap zooms in.** Lean: yes. Why: you see the whole path first, and 44px markers can't fit at ¼ on a phone. Other option: start at ½ centred on the hero; downside: you don't see the whole world on a phone.
8. **Math Tower and The Frontier as landmarks** (plain links, every path, no state). Lean: yes. Why: the world image must reserve their space now anyway, and they left the header. Other option: leave them off; downside: a later sea re-render to add them.
9. **Tier-locked realms are still links.** Lean: yes, like `/realms`: you can look, the level map shows the lock. Other option: no link; downside: a dead-looking land with nothing to read.
10. **Accessibility.** Lean: markers are real links (in path order), art/trail/fog/hero `aria-hidden`, a skip link to the always-rendered "Your path" list, which is also the no-JS view. Other option: hide the markers from assistive tech; downside: a focusable but hidden link breaks the rules.
11. **Header and dashboard.** Lean: "World map" still → `/map`; the dashboard "Your path" list (per-path PR 2) links to `/map`; the list component lives in `components/realms/` so the map and the dashboard share it. Other option: a separate list on each page; downside: two lists that drift apart.

## Open questions

- Do you accept a world that the design file does not show yet? Should a Claude Design pass add the world map screen before PR 3?
- Can PR 3 run in a session where the Higgsfield MCP connects? (It failed to connect on 2026-10-07: proxy 403.) Else, will you render the 18 prompts in the Higgsfield app?
- Do you want the Creator slot lean (r11→s1, r10→s2, r12→s10, r13→s4, r9→s5)?

## Companion plans

- `docs/plans/path-curriculum-design-plan.md` (branch `docs/path-curriculum`) — realm lists per path, specialist realms, the dashboard "Your path" list (PR 2). PR 1b is the dependency.
- `docs/plans/level-art-design-plan.md` — level art, pipeline, the `/map` redirect this replaces.
- `docs/plans/curriculum-design-plan.md` — header amendment (2026-10-07), Math Tower and Frontier entry points.
