# Sigmorai Design System
**sigmorai.com** — a 2D pixel-art RPG for learning AI engineering and agentic systems. Responsive web app only (no native app). Curriculum is sourced from official Anthropic and OpenAI docs plus high-star GitHub harness repos; when sources change, new levels are added to the map.

Sources given: user brief only. Reference video (not viewable here): youtube.com/watch?v=rdaSPdCkoFQ — "Build Full Stack E-Learning Coding Platform".

## Product model
- **Realms** = paths/levels on the world map (00 Bootstrap Village → 08 Production Peaks) + side **Math Tower** (8 floors).
- Each realm: 6 quests + 1 boss. A quest = short lesson → code challenge → hidden tests. Pass all tests to clear. HP = attempts.
- Accounts: register / sign in, profile with generated pixel sprite or uploaded photo, XP, level, streak.
- Story: the Oracle of Latentia (the model) is clouded by **the Hallucinant**, a fog of confident falsehood. The **Sigmorai** are builders who bind the Oracle to tools, memory and truth. Each realm has an NPC guide (Elder Maren, Ranger Iso, Smith Korren, Archivist Vela, Warden Tess, Bridgekeeper Nal, Judge Arra, The Conductor, Summit Guide Pell; Numerist Oru in the Math Tower).

## CONTENT FUNDAMENTALS
- Two voices. **Product voice**: plain, second person ("you"), short sentences, technically exact — never fantasy-washed. **Story voice**: NPC lines only, inside parchment DialogBox, one or two sentences, metaphor tied to the real concept ("A tool is a promise. Describe it truthfully…").
- HUD labels: ALL CAPS Silkscreen ("QUEST CLEARED", "+150 XP", "LV 7 → 8"). Buttons: uppercase verbs ("START QUEST", "RUN TESTS", "CLAIM & CONTINUE").
- Headings: sentence case ("Define your first tool").
- Always cite source: "SRC · ANTHROPIC", "Sources synced 3 days ago".
- No emoji. Unicode game glyphs allowed sparingly: ✓ ▸ ◂ ■ □ · Σ.
- Errors are specific and helpful: "model may omit \"location\" — add it to \"required\"".

## VISUAL FOUNDATIONS
- **Palette**: Ink night-sky neutrals (950→100) carry 90% of surfaces. Ember #FF6B35 = primary action. Spark #FFC53D = XP/rewards/focus. Mint = pass. Byte = info/links. Glitch = fail/boss/Hallucinant. Rune = Math Tower. Parchment = story only. Each realm owns a key color (--realm-0…8, --realm-math).
- **Type**: Pixelify Sans (display/UI), Silkscreen (HUD, caps, 10–14px), Atkinson Hyperlegible (all reading text — never pixel fonts for paragraphs), JetBrains Mono (code). Ligatures off.
- **Shape**: zero radius everywhere. Corners are "notched" via --notch-outline (3px offset outlines). Hard offset drop shadows (2/4/8px, ink-950, no blur). Buttons add --bevel (light top-left, dark bottom-right).
- **Backgrounds**: full-bleed pixel scenes (assets/scenes, 192×108 art, image-rendering:pixelated) with --scanlines overlay. Text on scenes uses 2–3px hard text-shadow. No gradients except stepped sky bands in scenes.
- **Cards**: surface-2 fill, notched outline, drop shadow; optional HUD title tab on top edge; optional 6px realm-colored top bar or inset left bar (toasts/banners only).
- **Progress**: segmented bars, never smooth fills (except thin realm meters).
- **Motion**: snappy and stepped. Press = translate(2px,2px) + pressed bevel. Current level pulses with steps(2). Durations 80/160/240/480ms. No blur, no fades over 240ms.
- **Hover**: brighten one step or show Spark ring. **Focus**: 3px Spark ring.
- **Transparency**: only scanlines and label backplates (ink-950 @85%).
- **Layout**: max 1200–1320px containers, sticky HUD top bar, flex-wrap / auto-fit grids so every screen reflows to mobile web.

## ICONOGRAPHY
No icon font yet. Use the Σ logo glyph, unicode glyphs above, and HUD text labels. If an icon set is needed, use **Pixelarticons** (CDN, MIT, 24px pixel grid) — flagged substitution, not yet wired in.

## Logo
assets/logo/: sigmorai-mark.svg (Ember Σ on ink tile with spark), sigmorai-mark-gold.svg (inverse), sigmorai-glyph.svg (bare Σ), sigmorai-glyph-mono.svg (currentColor), favicon.svg. Wordmark: SIGMORAI in Pixelify Sans 700. Tagline: LEARN · BUILD · ASCEND.

## Index
- styles.css → tokens/{fonts,colors,typography,spacing,effects,base}.css
- guidelines/ — foundation specimen cards
- components/core: PixelButton, Panel, Badge, XPBar, PixelAvatar · forms: TextField, Choice · game: LevelNode, QuestCard, DialogBox, TestResult · feedback: Toast · navigation: Tabs
- ui_kits/webapp/Sigmorai App.dc.html — landing, auth, world map, quest + code challenge, Math Tower, profile
- assets/scenes/ — 11 realm scenes
- SKILL.md