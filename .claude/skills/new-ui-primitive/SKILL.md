---
name: new-ui-primitive
description: Scaffold a new Sigmorai design-system primitive in components/ (PixelButton, Panel, Badge, XPBar, TextField, Choice, LevelNode, QuestCard, DialogBox, TestResult, Toast, Tabs, TrackToggle…) with typed variants, Tailwind v4 token utilities only, zero radius, hard offset shadows (shadow-notch / shadow-drop / bevel / bevel-pressed), 2px press, 3px Spark focus ring, 44px targets. Use when adding a component more than one route will use. Not for canvas scenes.
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
components/<name-kebab>.tsx
components/<name-kebab>.test.tsx   # only when it has logic (e.g. XPBar segment maths)
```

File names are kebab-case; the export is the design-system PascalCase name (`pixel-button.tsx` → `PixelButton`).

**Types:** the component's own `Props` stay in its file. A type another file also needs (a variant union, `Track`) goes in `lib/types/`.

## Visual contract (from `design/tokens/*.css`, mapped into `@theme`)

- **No raw hex, no arbitrary values.** Only token utilities. Missing token → stop and ask; never invent a colour, font or radius.
- **Zero radius** everywhere (it's global; never add `rounded-*`).
- **Hard offset shadows only**: `shadow-notch`, `shadow-drop`, `bevel`, `bevel-pressed`. Never a blur shadow, never a gradient.
- **Press = move 2px**: `active:translate-x-[2px] active:translate-y-[2px]` style via the token utility, and swap `bevel` → `bevel-pressed`.
- **Focus ring**: 3px Spark, `focus-visible:outline-spark` with the global focus utility. Never remove outlines.
- **Fonts**: Pixelify Sans (`font-display`) for headings, Silkscreen (`font-hud`) for HUD/buttons/labels, Atkinson Hyperlegible (`font-body`) for anything people read, JetBrains Mono (`font-mono`) for code. Ligatures are off globally.
- **Targets ≥ 44px** on anything clickable, at every size (an `sm` button still has a 44px hit area).
- **XPBar is segmented**, never a smooth fill.

## Procedure

### 1. Gather inputs

- **Name**: the design-system name (`PixelButton` → `pixel-button.tsx`)
- **Variants**: from the design file, e.g. `variant: 'primary' | 'xp' | 'success' | 'secondary' | 'danger' | 'ghost'`, `size: 'sm' | 'md' | 'lg'`
- **Server or client?** Default server-safe (no hooks, no handlers required). Add `'use client'` only if it holds state or effects.
- **Wraps a native element?** Spread the element's props and accept `ref` as a prop (React 19; no `forwardRef`).

### 2. Scaffold

Read `templates/primitive.tsx.template`, substitute `{{NAME}}` and the variant maps, write `components/<name-kebab>.tsx`.

### 3. Verify

- `bun run typecheck && bun run lint`
- Render it on the page that uses it, at 375px and 1280px, with keyboard only. Compare side-by-side with the design file.

### 4. Report

- File created
- Reminders: contrast on every variant · visible focus ring · 44px targets · state never shown by colour alone (Choice correct/wrong also gets an icon or label) · motion respects `prefers-reduced-motion` (`motion-safe:` utilities)
