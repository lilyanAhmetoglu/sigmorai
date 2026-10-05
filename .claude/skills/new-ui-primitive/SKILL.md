---
name: new-ui-primitive
description: Scaffold a new Sigmorai design-system primitive in components/ (PixelButton, Panel, Badge, XPBar, TextField, Choice, LevelNode, QuestCard, DialogBox, TestResult, Toast, Tabs, TrackToggle…) with typed variants, Tailwind v4 token utilities only, zero radius, hard offset shadows (shadow-notch / shadow-drop / inset-shadow-bevel / inset-shadow-bevel-pressed), 2px press, global 3px Spark focus ring, 44px targets. Use when adding a component more than one route will use. Not for canvas scenes.
---

# Skill: new-ui-primitive

## Ask first

**Ask before creating a new primitive.** The design system names are fixed (see the component list in AGENTS.md and `design/ui_kits/webapp/Sigmorai App.dc.html`). Search `components/` and reuse or extend when anything is close:

```bash
ls components
grep -rn "<Similar>" components app --include=*.tsx
```

Canvas scenes (`HeroScene`, `LevelMap`) live in `components/scenes/` and follow the scoped pixel-art rule, not this skill.

## What it produces

```
lib/constants/ui.ts                 # option-name lists (as const)
lib/types/ui.ts                     # derived unions
app/styles/components/<file>.css    # all styles, [data-*] variants; imported in app/globals.css
components/<name-kebab>.tsx         # one base class + data-* attributes, no class maps
lib/constants/ui.test.ts            # one drift-check row per data-* option list
lib/<area>/<logic>.test.ts          # only when it has logic (e.g. lib/xp/segments.ts for XPBar)
```

File names are kebab-case; the export is the design-system PascalCase name (`pixel-button.tsx` → `PixelButton`).

**Types:** the component's own `Props` stay in its file. Variant/size/tone sets go in `lib/constants/` as `as const` values; the derived union goes in `lib/types/`. **Styles never live in TSX.** Each primitive has `app/styles/components/<file>.css` (template: `primitive.css.template`), imported in `app/globals.css`; variants, sizes and tones are `[data-*]` selectors built with `@apply` and token utilities. The TSX sets one base class plus `data-*` attributes, with no class maps. Colour tints: set `data-accent="<Accent>"` and read `var(--tint)` in CSS (`accents.css`). Join a caller's `className` with `cn()` from `@/lib/utils`. Pure logic (segment maths, sprites) goes in `lib/` with a `bun test` file next to it, not in the component.

## Visual contract (from `design/tokens/*.css`, mapped into `@theme` in `app/styles/theme.css`)

- **No raw hex, no arbitrary values.** Only token utilities: colours `bg-accent`, `text-text-on-accent`, `bg-surface-1/2/3`, `text-text-1/2/3`, `bg-xp`, `bg-success`, `bg-danger`, `bg-info`, `bg-math`, `bg-realm-0..8`, palette `bg-ember-500`…; fonts `font-display/hud/body/code`; sizes `text-hero`, `text-h1..h4`, `text-body-lg`, `text-body`, `text-small`, `text-hud`, `text-micro`; `tracking-hud`; one spacing step = 4px (`min-h-11` = 44px). Missing token → stop and ask; never invent a colour, font or radius.
- **Zero radius** everywhere (it's global; never add `rounded-*`).
- **Hard offset shadows only**: `shadow-notch`, `shadow-drop-sm/drop/drop-lg`, `shadow-glow-xp`, plus the inset bevels `inset-shadow-bevel` / `inset-shadow-bevel-pressed` (they stack with a `shadow-*`). Never a blur shadow, never a gradient.
- **Press = move 2px**: `enabled:active:translate-x-0.5 enabled:active:translate-y-0.5`, and swap `inset-shadow-bevel` → `inset-shadow-bevel-pressed`. Never scale. Transitions only behind `motion-safe:` (`motion-safe:duration-(--dur-1) motion-safe:ease-snap`).
- **Focus ring**: 3px Spark, one global `:focus-visible` rule in `app/styles/base.css`. Add no focus classes per component, and never `outline-none` / `outline-hidden`.
- **Fonts**: Pixelify Sans (`font-display`) for headings, Pixelify Sans (`font-display`, bold) for buttons, Silkscreen (`font-hud`) for HUD labels, Atkinson Hyperlegible (`font-body`) for anything people read, JetBrains Mono (`font-code`) for code. Ligatures are off globally.
- **Targets ≥ 44px** on anything clickable, at every size (an `sm` button still has a 44px hit area).
- **XPBar is segmented**, never a smooth fill.

## Procedure

### 1. Gather inputs

- **Name**: the design-system name (`PixelButton` → `pixel-button.tsx`)
- **Variants**: from the design file, e.g. `variant: 'primary' | 'xp' | 'success' | 'secondary' | 'danger' | 'ghost'`, `size: 'sm' | 'md' | 'lg'`
- **Server or client?** Default server-safe (no hooks, no handlers required). Add `'use client'` only if it holds state or effects.
- **Wraps a native element?** Spread the element's props and accept `ref` as a prop (React 19; no `forwardRef`).

### 2. Scaffold

1. Add the option lists to `lib/constants/ui.ts` and the unions to `lib/types/ui.ts`.
2. Copy `templates/primitive.css.template` to `app/styles/components/<file>.css` (substitute `{{NAME}}`, `{{FILE}}`) and import it in `app/globals.css`.
3. Copy `templates/primitive.tsx.template` to `components/<name-kebab>.tsx`.
4. Add a row per option list to `lib/constants/ui.test.ts`, so a name in TS without a CSS rule fails `bun test`.

### 3. Verify

- `bun run typecheck && bun run lint`
- Render it on the page that uses it, at 375px and 1280px, with keyboard only. Compare side-by-side with the design file.

### 4. Report

- File created
- Reminders: contrast on every variant · visible focus ring · 44px targets · state never shown by colour alone (Choice correct/wrong also gets an icon or label) · motion respects `prefers-reduced-motion` (`motion-safe:` utilities)
