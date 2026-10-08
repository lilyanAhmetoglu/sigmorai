# Higgsfield art session (paste into a new Claude Code session)

Repo: lilyanAhmetoglu/sigmorai. Read CLAUDE.md, AGENTS.md and `.claude/rules/*.md` first and follow them (Bun only; explain in A2 English; full control to push feature branches, open PRs into `canary` and merge when CI is green).

**Step 1: check Higgsfield.** Use ToolSearch for the Higgsfield MCP tools. If they are not there, stop and say the Higgsfield connector is not connected.

## Job A: realm art for the specialist realms (r9–r15)

These realms ship with `scene: false` (a flat scene). Make their layered level art.

1. Read `docs/art/higgsfield-realm-prompts.md` (28 prompts: sky, far, mid, near for r9–r15), `docs/plans/level-art-design-plan.md` (amendments: pipeline, sizes, quantise counts) and `.claude/rules/scoped/pixel-art.md`. Look at `public/levels/realm-00` … `realm-08` for the exact file set and size.
2. Render each layer in Higgsfield. At most 3 tries per layer. Keep a short log of credits spent.
3. Pixelate with a throwaway script in your scratch folder (not committed): box-downscale to 1024×240, hard alpha, quantise as the plan says. No text, letters, emblems, logos or watermarks; never reuse another realm's art.
4. Save to `public/levels/realm-09` … `realm-15` (`sky.png`, `far.png`, `mid.png`, `near.png`), then set `scene: true` for each finished realm in `lib/constants/curriculum.ts`. The curriculum test checks the folder exists for every `scene: true` realm.
5. Send me screenshots of each realm's level map. Then typecheck, lint, test, build, a `cto` and `ui-ux-reviewer` review, one PR per 2–3 realms into `canary` (`feat(ui): Higgsfield art for <realms>`), merge when CI is green.

## Job B: painted base for the world map

The world map (`/map`) is drawn in SVG and already has an art slot.

1. Read the newest amendments in `docs/plans/world-map-design-plan.md` and `WORLD_MAP` / `WORLD_MAP_ART` in `lib/constants/world-map.ts` (anchors and land footprints on a 1024×768 art grid).
2. Make one painted parchment-map base at 2048×1536 (the grid at 2×): sea, coasts and terrain only. Lands must sit inside their footprints so the pins, labels and route drawn on top still fit. No text, symbols or pins in the image.
3. Pixelate (hard pixels, quantise ~48 colours), save as `public/map/world-base.png` (≤ 600 KB), set `WORLD_MAP_ART.ready = true`. The art test checks the flag and the file match.
4. Screenshots at 1440 and 390 for all three tracks, then the same checks, reviews and a PR `feat(map): Higgsfield base art for the world map`.

Update the Notion board (Sigmorai build board) when each PR merges.
