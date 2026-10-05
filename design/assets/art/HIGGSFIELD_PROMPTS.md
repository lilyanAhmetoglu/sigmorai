# Sigmorai art pack: Higgsfield prompts

Save the files you generate here (assets/art/). The landing hero picks them up automatically, with no code change. Any file that's missing falls back to the built-in pixel scene.

| File | Size | Background | Scroll speed |
|---|---|---|---|
| hero-sky.png | 1920×640 | opaque | barely moves |
| hero-far.png | 1920×640 | **transparent** | slow |
| hero-mid.png | 1920×640 | **transparent** | medium |
| hero-near.png | 1920×640 | **transparent**, ground strip in the bottom 20% | fast (1:1) |

All four must **tile seamlessly left↔right** (the left edge continues the right edge). Keep the ground line at the same height (80% down) in every layer.

## Shared style line (paste into every prompt)
> 16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, soft daylight, layered parallax, seamless horizontal tile, no text, no characters, no UI

## Prompts
**hero-sky**: clear blue sky gradient from #3AA0E0 at top to #A3E0F6 at horizon, a few small peach-cream pixel clouds, distant pale mountains in misty blue at the very bottom.

**hero-far**: a distant ancient academy of learning: library towers with arched windows, a domed observatory, floating stone bridges, all in hazy blue (#5A90C0, #3E72A4), a few warm lit windows. Transparent background.

**hero-mid**: tall brown rock cliffs with grassy tops (#A8643A, #6B3A22, grass #2E9E4E), round leafy pixel trees, a few floating open books and glowing rune stones (violet #A07BFF) between the cliffs. Transparent background.

**hero-near**: foreground ground strip: grass-topped earth brick path, small grass tufts, a stone lectern with a book, scattered scroll pickups. The ground surface sits exactly at 80% height. Transparent above.

## Realm variants (same structure, change the subject)
- Bootstrap Village: cozy village schoolhouse, morning light
- Prompt Forest: deep green forest, fireflies, signposts with blank boards
- Tool Forge: cavern workshop, anvils, glowing orange forges, gears
- Context Library: endless bookshelves, ladders, floating pages, purple night
- Agent Citadel: blue night fortress, banners, watchtowers
- MCP Bridgelands: rope and stone bridges over teal water
- Eval Arena: sandstone colosseum, pink sunset, scoreboards (blank)
- Swarm Spire: violet crystal spires, many small lights in formation
- Production Peaks: snowy summit, observatory at the top
- Math Tower: starry tower interior, chalkboards, floating geometric shapes

## Sprites (optional)
- **hero-sheet.png**: 2-frame walk cycle, 32×16 total (two 16×16 frames), facing right. A young apprentice in a hooded indigo cloak with an orange scarf. Transparent background.
- **hallucinant.png**: a 16×16 pink fog-spirit, the enemy, glitchy edges. Transparent background.
