# Sigmorai — Share kit (SIG-48)

> The contract for the share buttons and the per-page share images: what a share sends, what it never sends, where the buttons live, and how the images are built.

## Status

**STATUS: Built. Track: all.**

## What is shared

- **The page URL plus plain text.** The text is in `lib/constants/share.ts` (`SHARE_TEXT`). It uses the plain product voice: no hype, no lore.
- **UTM tags on every shared URL:** `utm_source=<linkedin|x|facebook|copy|native>&utm_medium=social&utm_campaign=share`. They only say which button made the link. Web Analytics sees them as part of the page address.
- **The leaderboard share** carries the viewer's rank and the range ("I'm #4 … (this week)"). Only the viewer can share it, from their own signed-in page. The page already shows that rank.
- **The level-clear share** carries the realm (or Math Tower) page and the cleared step's title.

## What is never shared

- No user id, hero name, XP amount, grade, picked answers or correct answers. None of these go in a share URL, a share text or a share image.
- Nothing goes to a network until the person clicks. The buttons are plain links. No network script, widget or pixel loads on our pages. Copy link and Share… stay in the browser (clipboard, `navigator.share`).
- The privacy page (`lib/constants/legal-copy.ts` → "Share buttons") says the same.

## The primitive

`components/share-buttons.tsx` (`ShareButtons`) is generic. It takes `target={{ url, text }}`, where `url` is a site path or an absolute URL. It also takes an optional `networks` subset, a `heading` and a heading level `as` (h2 or h3). LinkedIn, X and Facebook are `<a target="_blank">` links, so they work without JavaScript. Copy link and Share… render only after hydration, and only when the browser has them. Pure URL builders: `lib/utils/share-links.ts` (tested).

## Where the buttons live

- **Realm pages:** in the aside, under the NPC DialogBox.
- **Blog posts:** in the aside, after TRY THE QUEST.
- **Math Tower:** under the floors.
- **Leaderboard:** under the list. A ranked viewer shares their rank; everyone else shares the board.
- **Level clear:** inside `ClearedPanel` after a case, boss or quick-check pass.

## Share images

- **Files:** `opengraph-image.tsx` in `realms/[realm]`, `blog/[slug]`, `math`, `leaderboard` and the site root `(marketing)`. Shared parts (fonts, colours, art loaders, the title panel) are in `lib/og/og-card.tsx`. Sizes are in `lib/constants/og.ts`. The og and twitter tags come from `lib/og/metadata.ts`.
- **Realm image:** the realm's own level art at 3× (pixelated, kept sharp), its name, tier, path and topic. The topic is the default path's, because the OG URL has no `?track=`.
- **Post image:** the post's own cover, plus its title. Satori can't read WebP, so `sharp` turns the cover into a PNG.
- **Math and leaderboard images:** simple branded cards. The leaderboard card shows no ranks, because it is built once.
- **Prerendered at build time:** one image per realm and per post. A route handler doesn't inherit its layout's params, so each image route re-exports `generateStaticParams` from its `layout.tsx` and sets `dynamicParams = false`.
- **Shared alt text:** for the same reason, the realm and post images have one alt line each, not one per page. `generateImageMetadata` would replace that `generateStaticParams`.
- **Files shipped anyway:** `outputFileTracingIncludes` in `next.config.ts` ships the art, covers, logo and fonts with the two image routes, in case one renders on demand.
- **No session needed:** crawlers get these images without signing in. `proxy.ts` protects only `/dashboard` and `/profile`.
