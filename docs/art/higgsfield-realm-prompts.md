# Higgsfield prompts: specialist realms r9 to r16

Ready to paste. Each realm has four layer prompts (sky, far, mid, near). Style block copied from `design/assets/art/HIGGSFIELD_PROMPTS.md` and the level-art plan (2026-10-05 amendments). Nothing here edits the repo.

## How to use

- Generate each layer separately, one image per prompt. Render size **2688x1152** (raw), ground at **80% height**. The pixelate step turns it into the final **1024x240** (ground at row 192).
- sky = **opaque**. far, mid, near = **transparent**. All four tile left to right.
- Keep the centre of mid and near calm: the 7 level nodes sit on the walk line (columns 4, 11, 19, 27, 35, 44, 58 of 64).
- Never reuse another realm's image. If a render has a symbol, a cross, a letter, a face or a brand, regenerate it (this happened to realm 04 near, and was fixed with a plain solid pennant).
- Note: the shipped realm-00 to realm-08 prompts are not in the repo (the file only has hero + one-line variants), so these follow the plan's rules and the existing layer roles, not a copy of the old raw prompts.

### Shared style block (already pasted inside every prompt below)

> 16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background

### Palette rule

Brand palette (tokens in `design/tokens/colors.css`): ink-950 #0A0913, ember #FF6B35, spark #FFC53D, mint #3EE08F, byte #40C4FF, glitch #FF4F8B, rune #A07BFF, parchment #FBF3DF. Core realms already use ember (r0), mint (r1), spark (r2), rune (r3), byte (r4), teal #5CE1E6 (r5), glitch pink (r6), violet #C77DFF (r7), ink-white snow (r8). The specialist realms below use scene colours that avoid repeating those moods. Art colours are not tokens (the pipeline does not snap to tokens), but keep hues close to the lists given.

### Core rotation check

r0 morning, r1 noon, r2 sunset, r3 golden hour, r4 afternoon, r5 bright sky, r6 autumn pink sunset, r7 dusk, r8 night. New: r9 late morning (cream), r10 night hollow (oxblood/amber), r11 high noon (aqua/saffron), r12 cave (slate/cyan), r13 overcast (oatmeal/ochre), r14 cold dawn (steel/yellow), r15 blue hour (indigo/honey), r16 after-rain morning (sage/terracotta).

---

## r9 Canvas Workshop (creator, NPC Guildmaster Ines)

**Mood:** Bright late morning, cool north-studio light. Accent: cobalt blue + tomato red on warm cream (not forge orange, not sky blue).

**Palette:** cream #F6EBCB, butter yellow #F2D98A, cobalt #2F5FD0, tomato red #E5483D, light timber #C9A06A

**sky.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. OPAQUE full-frame sky layer, no ground, no buildings; clouds or ceiling only; dithered colour bands. Realm "Canvas Workshop": soft butter-cream sky with a few wide flat white clouds, faint pale-blue band at the very top. Palette: cream #F6EBCB, butter yellow #F2D98A, cobalt #2F5FD0, tomato red #E5483D, light timber #C9A06A.
```

**far.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; distant low-contrast silhouettes only, sitting on the 80% line, hazy and soft in colour (not blurry); nothing above 65% height except tall landmarks. Realm "Canvas Workshop": a distant hillside of stilted timber studios with huge slanted skylight windows and tall chimneys, hazy cream-blue and dusty tan. Palette: cream #F6EBCB, butter yellow #F2D98A, cobalt #2F5FD0, tomato red #E5483D, light timber #C9A06A.
```

**mid.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; mid-distance landmarks and platforms, medium contrast, base sits on the 80% line; leave open space in the centre for gameplay. Realm "Canvas Workshop": floating blank empty canvases on wooden easel frames, scaffolding towers, paint-pot-shaped stone pillars with plain colour splashes (cobalt, tomato), rope-and-brush-handle bridges between cliff ledges, no pictures drawn on the canvases. Palette: cream #F6EBCB, butter yellow #F2D98A, cobalt #2F5FD0, tomato red #E5483D, light timber #C9A06A.
```

**near.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; foreground ground strip: a flat walkable path whose top surface is exactly at 80% height, with the highest contrast and a few small props on it; fully transparent above the ground. Realm "Canvas Workshop": light timber plank walkway on a stone base, a few easels, stacked blank frames, empty paint tins, rolled paper scrolls, short grass tufts. Palette: cream #F6EBCB, butter yellow #F2D98A, cobalt #2F5FD0, tomato red #E5483D, light timber #C9A06A.
```

---

## r10 Reel Hollow (creator, NPC Lanternist Oto)

**Mood:** Deep night inside a sunken hollow, lantern glow. Accent: amber on oxblood and charcoal (distinct from the blue and violet night realms).

**Palette:** charcoal #1E1418, oxblood #5A1F2B, plum-brown #7A3A3A, amber #FFB347, warm cream #FFE7B0

**sky.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. OPAQUE full-frame sky layer, no ground, no buildings; clouds or ceiling only; dithered colour bands. Realm "Reel Hollow": the dark ceiling of a huge hollow: charcoal to oxblood vertical bands, a few tiny warm star-like specks, soft amber glow low at the horizon. Palette: charcoal #1E1418, oxblood #5A1F2B, plum-brown #7A3A3A, amber #FFB347, warm cream #FFE7B0.
```

**far.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; distant low-contrast silhouettes only, sitting on the 80% line, hazy and soft in colour (not blurry); nothing above 65% height except tall landmarks. Realm "Reel Hollow": distant tiers of stone seats and a row of tall round arched windows carved in the hollow wall, dim oxblood and charcoal, tiny warm lit points. Palette: charcoal #1E1418, oxblood #5A1F2B, plum-brown #7A3A3A, amber #FFB347, warm cream #FFE7B0.
```

**mid.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; mid-distance landmarks and platforms, medium contrast, base sits on the 80% line; leave open space in the centre for gameplay. Realm "Reel Hollow": rows of hanging lanterns on chains, each lantern holding one small glowing blank square frame, tall stone projector-like lamp posts with round lenses, long stone steps with square perforation holes like a film strip, heavy drawn curtains of stone-grey cloth, no pictures inside the frames. Palette: charcoal #1E1418, oxblood #5A1F2B, plum-brown #7A3A3A, amber #FFB347, warm cream #FFE7B0.
```

**near.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; foreground ground strip: a flat walkable path whose top surface is exactly at 80% height, with the highest contrast and a few small props on it; fully transparent above the ground. Realm "Reel Hollow": dark stone stage floor with a strip of square holes along the edge like film perforations, a few round lantern bases, coiled rope, small cloth bundles, warm amber rim light on the ground top. Palette: charcoal #1E1418, oxblood #5A1F2B, plum-brown #7A3A3A, amber #FFB347, warm cream #FFE7B0.
```

---

## r11 Pigment Bazaar (creator, NPC Dyer Sabe)

**Mood:** Hot high noon. Accent: saffron yellow + indigo + madder red on pale aqua sky (distinct from the pink sunset arena and the warm forge).

**Palette:** pale aqua #BDEBE4, bleached sand #EBD9B0, saffron #F2B71F, indigo #2C3A8C, madder red #B8332E

**sky.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. OPAQUE full-frame sky layer, no ground, no buildings; clouds or ceiling only; dithered colour bands. Realm "Pigment Bazaar": bright pale-aqua noon sky fading to near-white at the horizon, tiny flat cirrus streaks. Palette: pale aqua #BDEBE4, bleached sand #EBD9B0, saffron #F2B71F, indigo #2C3A8C, madder red #B8332E.
```

**far.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; distant low-contrast silhouettes only, sitting on the 80% line, hazy and soft in colour (not blurry); nothing above 65% height except tall landmarks. Realm "Pigment Bazaar": a distant terraced hillside market town, flat-roofed clay houses stacked in steps, tall dye-drying towers, hazy sand and terracotta. Palette: pale aqua #BDEBE4, bleached sand #EBD9B0, saffron #F2B71F, indigo #2C3A8C, madder red #B8332E.
```

**mid.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; mid-distance landmarks and platforms, medium contrast, base sits on the 80% line; leave open space in the centre for gameplay. Realm "Pigment Bazaar": striped market awnings in plain colour bands only (saffron, indigo, madder, cream), big cones of loose coloured powder in open bowls, drying cloth lines hung with plain dyed cloth in solid colours, stone stairs between terraces, large clay jars. Palette: pale aqua #BDEBE4, bleached sand #EBD9B0, saffron #F2B71F, indigo #2C3A8C, madder red #B8332E.
```

**near.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; foreground ground strip: a flat walkable path whose top surface is exactly at 80% height, with the highest contrast and a few small props on it; fully transparent above the ground. Realm "Pigment Bazaar": sunbaked sand-brick market path, scattered small mounds of coloured powder, clay pots, a few folded plain cloths, short dry grass tufts. Palette: pale aqua #BDEBE4, bleached sand #EBD9B0, saffron #F2B71F, indigo #2C3A8C, madder red #B8332E.
```

---

## r12 Echo Caverns (creator, NPC Bard Lio)

**Mood:** Underground, cold light shafts from ceiling cracks. Accent: cold cyan-white on slate navy (a cave, with no open sky; distinct from the teal bright-sky bridges).

**Palette:** deep slate #121C33, slate blue #2A3F6B, steel #5A7BA8, cyan #7FE3F0, ice white #E6FBFF

**sky.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. OPAQUE full-frame sky layer, no ground, no buildings; clouds or ceiling only; dithered colour bands. Realm "Echo Caverns": the ceiling of a vast cave: slate navy bands with pale cyan light shafts falling from small cracks, dithered, dark at the top and lighter near the horizon. Palette: deep slate #121C33, slate blue #2A3F6B, steel #5A7BA8, cyan #7FE3F0, ice white #E6FBFF.
```

**far.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; distant low-contrast silhouettes only, sitting on the 80% line, hazy and soft in colour (not blurry); nothing above 65% height except tall landmarks. Realm "Echo Caverns": distant cavern walls with long stalactites and stalagmites, a far glowing pool, hazy steel blue, low contrast. Palette: deep slate #121C33, slate blue #2A3F6B, steel #5A7BA8, cyan #7FE3F0, ice white #E6FBFF.
```

**mid.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; mid-distance landmarks and platforms, medium contrast, base sits on the 80% line; leave open space in the centre for gameplay. Realm "Echo Caverns": huge curved stone horn-shaped formations, tall crystal columns that glow cyan, still pools with concentric ripple rings drawn in pixels, stalactite curtains, natural stone arches, no instruments, no faces. Palette: deep slate #121C33, slate blue #2A3F6B, steel #5A7BA8, cyan #7FE3F0, ice white #E6FBFF.
```

**near.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; foreground ground strip: a flat walkable path whose top surface is exactly at 80% height, with the highest contrast and a few small props on it; fully transparent above the ground. Realm "Echo Caverns": wet dark stone floor with a flat path, shallow puddles with tiny ripple rings, small glowing crystal shards, pebbles, a few low stalagmites at the edges. Palette: deep slate #121C33, slate blue #2A3F6B, steel #5A7BA8, cyan #7FE3F0, ice white #E6FBFF.
```

---

## r13 Pattern Atelier (creator, NPC Weaver Hale)

**Mood:** Soft overcast midday, open-air weavers' terrace. Accent: ochre + indigo + sage on oatmeal (muted, textile colours; distinct from forest green and pink).

**Palette:** oatmeal #EDE3CC, linen grey #CFC6B0, ochre #C98B2B, indigo #2B3A7A, sage #8FA77A

**sky.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. OPAQUE full-frame sky layer, no ground, no buildings; clouds or ceiling only; dithered colour bands. Realm "Pattern Atelier": soft oatmeal-grey overcast sky with long flat woven-looking cloud bands, slightly lighter near the horizon. Palette: oatmeal #EDE3CC, linen grey #CFC6B0, ochre #C98B2B, indigo #2B3A7A, sage #8FA77A.
```

**far.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; distant low-contrast silhouettes only, sitting on the 80% line, hazy and soft in colour (not blurry); nothing above 65% height except tall landmarks. Realm "Pattern Atelier": a distant range of cliffs whose rock strata look like folded cloth stripes, with tiny loom frames on the ridges, hazy linen grey and sage. Palette: oatmeal #EDE3CC, linen grey #CFC6B0, ochre #C98B2B, indigo #2B3A7A, sage #8FA77A.
```

**mid.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; mid-distance landmarks and platforms, medium contrast, base sits on the 80% line; leave open space in the centre for gameplay. Realm "Pattern Atelier": giant upright looms strung with long coloured threads as vertical lines, hanging woven cloth panels with abstract repeating geometric patterns only (diamonds, stripes, zigzags; no symbols), huge spools as pillars, thread-line bridges between platforms, a big open pattern-book shape on a stone stand with blank pages. Palette: oatmeal #EDE3CC, linen grey #CFC6B0, ochre #C98B2B, indigo #2B3A7A, sage #8FA77A.
```

**near.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; foreground ground strip: a flat walkable path whose top surface is exactly at 80% height, with the highest contrast and a few small props on it; fully transparent above the ground. Realm "Pattern Atelier": wooden terrace floor of woven-looking planks, a few spools, folded cloth stacks, thread loops, a small shuttle, short sage grass tufts at the edges. Palette: oatmeal #EDE3CC, linen grey #CFC6B0, ochre #C98B2B, indigo #2B3A7A, sage #8FA77A.
```

---

## r14 Agent Workshop (builder, NPC Foreman Ryn)

**Mood:** Cold early morning, dim workshop haze. Accent: safety yellow + graphite + olive on steel dawn (distinct from the orange forge).

**Palette:** steel dawn #AEBBC4, graphite #3A4048, olive #6B7440, safety yellow #FFD21F, pale grey #DADFE3

**sky.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. OPAQUE full-frame sky layer, no ground, no buildings; clouds or ceiling only; dithered colour bands. Realm "Agent Workshop": cold steel-grey to pale-grey dawn sky, long flat cloud bands, a thin pale-yellow line at the horizon. Palette: steel dawn #AEBBC4, graphite #3A4048, olive #6B7440, safety yellow #FFD21F, pale grey #DADFE3.
```

**far.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; distant low-contrast silhouettes only, sitting on the 80% line, hazy and soft in colour (not blurry); nothing above 65% height except tall landmarks. Realm "Agent Workshop": a distant industrial workshop skyline: long sheds with sawtooth roofs, tall crane silhouettes, chimneys with thin smoke, hazy grey-blue. Palette: steel dawn #AEBBC4, graphite #3A4048, olive #6B7440, safety yellow #FFD21F, pale grey #DADFE3.
```

**mid.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; mid-distance landmarks and platforms, medium contrast, base sits on the 80% line; leave open space in the centre for gameplay. Realm "Agent Workshop": giant pegboard cliff walls with big tool silhouettes hung on pegs (wrench, hammer, saw, clamp), huge workbench platforms, gear-driven lifts, hanging chains and hooks, yellow-black hazard-striped beams (stripes only), robot-arm cranes as machinery without faces. Palette: steel dawn #AEBBC4, graphite #3A4048, olive #6B7440, safety yellow #FFD21F, pale grey #DADFE3.
```

**near.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; foreground ground strip: a flat walkable path whose top surface is exactly at 80% height, with the highest contrast and a few small props on it; fully transparent above the ground. Realm "Agent Workshop": steel-plate walkway with rivets and a flat top at 80%, scattered bolts, nuts, small tool props, a coiled cable, yellow edge line, olive crates. Palette: steel dawn #AEBBC4, graphite #3A4048, olive #6B7440, safety yellow #FFD21F, pale grey #DADFE3.
```

---

## r15 Guild Hall (strategist, NPC Steward Oda)

**Mood:** Blue hour, early evening, lit windows (distinct from golden-hour library and the afternoon citadel). Accent: honey windows + rust-red roofs on indigo-blue sky.

**Palette:** indigo-blue #2C3E7A, dusk blue #5A78B8, rust red #A8442A, honey stone #D9B77A, window amber #FFC857

**sky.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. OPAQUE full-frame sky layer, no ground, no buildings; clouds or ceiling only; dithered colour bands. Realm "Guild Hall": clear blue-hour sky: indigo at the top to dusk blue to a pale peach strip at the horizon, dithered bands, a few early small stars. Palette: indigo-blue #2C3E7A, dusk blue #5A78B8, rust red #A8442A, honey stone #D9B77A, window amber #FFC857.
```

**far.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; distant low-contrast silhouettes only, sitting on the 80% line, hazy and soft in colour (not blurry); nothing above 65% height except tall landmarks. Realm "Guild Hall": a distant town of tall timber-and-stone guild houses with steep rust-red roofs and many warm lit windows, hazy dusk blue. Palette: indigo-blue #2C3E7A, dusk blue #5A78B8, rust red #A8442A, honey stone #D9B77A, window amber #FFC857.
```

**mid.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; mid-distance landmarks and platforms, medium contrast, base sits on the 80% line; leave open space in the centre for gameplay. Realm "Guild Hall": one grand hall with a wide arched doorway and a long roof with a clock-less tower, a round stone table on a terrace, rows of long benches, hanging plain solid-colour pennants (no emblems, no symbols), blank notice boards, neat stacks of crates and shared tool chests, lamp posts with warm glow. Palette: indigo-blue #2C3E7A, dusk blue #5A78B8, rust red #A8442A, honey stone #D9B77A, window amber #FFC857.
```

**near.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; foreground ground strip: a flat walkable path whose top surface is exactly at 80% height, with the highest contrast and a few small props on it; fully transparent above the ground. Realm "Guild Hall": honey-stone cobble plaza with a flat top at 80%, a few lamp bases, small benches, potted shrubs, rolled blank scrolls, short grass tufts at the edges. Palette: indigo-blue #2C3E7A, dusk blue #5A78B8, rust red #A8442A, honey stone #D9B77A, window amber #FFC857.
```

---

## r16 Trade Quarter (strategist, NPC Envoy Rasa)

**Mood:** Fresh morning just after rain, wet stone (distinct from the noon Pigment Bazaar and the blue-hour Guild Hall). Accent: terracotta + plum awnings and bottle-green trim on a rain-washed sage sky.

**Palette:** rain-washed sage #CBD9CF, bottle green #3F6B4A, terracotta #C2603A, plum #6E3B5C, warm sand #E6CC9A

**sky.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. OPAQUE full-frame sky layer, no ground, no buildings; clouds or ceiling only; dithered colour bands. Realm "Trade Quarter": a fresh morning sky just after rain: pale rain-washed sage at the top to soft warm sand near the horizon, a few broken grey-green rain clouds drifting off, dithered bands. Sky and clouds only: no land, no hills, no towers, no castles, no birds. Palette: rain-washed sage #CBD9CF, bottle green #3F6B4A, terracotta #C2603A, plum #6E3B5C, warm sand #E6CC9A.
```

**far.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; distant low-contrast silhouettes only, sitting on the 80% line, hazy and soft in colour (not blurry); nothing above 65% height except tall landmarks. Realm "Trade Quarter": a distant market town of low flat-roofed houses and many peaked tent tops, a few round warehouse domes and one tall plain watch tower, hazy grey-green. Palette: rain-washed sage #CBD9CF, bottle green #3F6B4A, terracotta #C2603A, plum #6E3B5C, warm sand #E6CC9A.
```

**mid.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; mid-distance landmarks and platforms, medium contrast, base sits on the 80% line; leave open space in the centre for gameplay. Realm "Trade Quarter": a market street of narrow two-storey trading houses with striped terracotta and plum awnings (stripes only), open-front stalls with plain cloth canopies, crates and sacks, a set of hanging balance scales, a long plain wooden counter, rope lines with plain solid-colour cloths drying (no emblems, no symbols), blank hanging shop boards. Palette: rain-washed sage #CBD9CF, bottle green #3F6B4A, terracotta #C2603A, plum #6E3B5C, warm sand #E6CC9A.
```

**near.png** (raw 2688x1152, final 1024x240)

```text
16-bit pixel art, side-scrolling platformer background layer, crisp hard pixels, no anti-aliasing, limited palette, layered parallax, seamless horizontal tile (left edge continues the right edge), no text, no letters, no numbers, no characters, no UI, no logos, no emblems, no symbols on banners or flags, no real brands, no watermark, no fake checkerboard background. wide landscape render 2688x1152, ground line at exactly 80% height. TRANSPARENT background; foreground ground strip: a flat walkable path whose top surface is exactly at 80% height, with the highest contrast and a few small props on it; fully transparent above the ground. Realm "Trade Quarter": wet sand-coloured flagstone street with a flat top at 80%, small puddles, a few wooden crates, a sack of grain, a small hand cart, clay jars, short grass tufts at the edges. Palette: rain-washed sage #CBD9CF, bottle green #3F6B4A, terracotta #C2603A, plum #6E3B5C, warm sand #E6CC9A.
```

---

## After generating

### 1. Files and folders (mirror `public/levels/realm-0X`)

Folder number is two digits (`realmNumber()` pads the id), so r9 is `realm-09`, r10 is `realm-10`.

| Realm               | Folder                    | Files (each 1024x240 RGBA, 1x)           |
| ------------------- | ------------------------- | ---------------------------------------- |
| r9 Canvas Workshop  | `public/levels/realm-09/` | `sky.png` `far.png` `mid.png` `near.png` |
| r10 Reel Hollow     | `public/levels/realm-10/` | `sky.png` `far.png` `mid.png` `near.png` |
| r11 Pigment Bazaar  | `public/levels/realm-11/` | `sky.png` `far.png` `mid.png` `near.png` |
| r12 Echo Caverns    | `public/levels/realm-12/` | `sky.png` `far.png` `mid.png` `near.png` |
| r13 Pattern Atelier | `public/levels/realm-13/` | `sky.png` `far.png` `mid.png` `near.png` |
| r14 Agent Workshop  | `public/levels/realm-14/` | `sky.png` `far.png` `mid.png` `near.png` |
| r15 Guild Hall      | `public/levels/realm-15/` | `sky.png` `far.png` `mid.png` `near.png` |
| r16 Trade Quarter   | `public/levels/realm-16/` | `sky.png` `far.png` `mid.png` `near.png` |

Same four names as realm-00 to realm-08 and `public/levels/math`. Only finished PNGs are committed; raw renders stay in your local art folder. Needs your `commit` go-word (git-safety rule).

### 2. Pixelate step (level-art plan, amendment 2026-10-05; script lives outside the repo)

1. Crop each raw 2688x1152 render so the ground line lands at 80% height.
2. Box-downscale to the **1024x240** grid (ground at row 192).
3. Hard alpha: no semi-transparent pixels (sky stays opaque).
4. Quilt a seamless left-right join on **all four** layers (near too). Drop floating half-objects the join cuts.
5. Quantise each layer on its own: **sky 24, far 32, mid 64, near 48** colours. No token snapping.
6. Run the fake-checkerboard removal (none of these realms is snow, so keep it on).
7. Human review: tile check at the join, no symbols or letters, ground at row 192, then drop the PNGs in the folder.

### 3. Code step: flip `scene` (per realm, after its 4 PNGs exist)

File: `lib/constants/curriculum.ts` (on `origin/canary`; the local checkout is behind and has no `scene` field yet). In the realm's `REALMS` row, change `scene: false` to `scene: true`. Example for r9:

```ts
{ id: 9, slug: 'canvas-workshop', name: 'Canvas Workshop', npc: 'Guildmaster Ines',
  tier: 'intermediate', track: 'creator', scene: true },
```

What `scene` does (checked in `lib/content/curriculum.ts` and `lib/grading/track-map.ts`):

- `realmArt(id)` returns `/levels/realm-NN` when `scene` is true, else `null`. `RealmScene` (`components/realms/realm-scene.tsx`) then loads the four layers from `LEVEL_ART_LAYERS` (sky, far, mid, near). With `false` the caller draws a flat `neutral` scene and the share image is the site default.
- `buildTrackMap` copies `scene` to the realm view, so the level map, realm page, realm card and OG card show the art.
- Test `lib/content/curriculum.test.ts` runs `existsSync` on `public/levels/realm-NN` for every `scene: true` realm. So the PNG folder must be in the same change, or the test fails. The `scene: false` test (`realmArt` is null) skips the flipped realm by itself.
- The accent stays `neutral` until a `--realm-N` token exists (Claude Design pass). Do not invent one in code.
- The world map (`lib/constants/world-map.ts`) has its own island art (`island: 'art' | 'shape'`). That is a separate Higgsfield job and not part of this file.

Then run `bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`, and open `/map/<slug>` at 360px and desktop to check the art and the node positions. r15 Guild Hall has no `REALMS` row yet: its row (`guild-hall`, `Steward Oda`, `beginner`, `strategist`) comes from the path-curriculum spec, so add the art with that row or after it.
