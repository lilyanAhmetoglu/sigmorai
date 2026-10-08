# Sigmorai — mentor credits and payments

> Every learner gets 20 free mentor questions per calendar month. After that, they can buy credit packs (1 credit = 1 question) through Stripe Checkout. Credits are granted only by a verified Stripe webhook, kept in an append-only ledger, and never expire. Read end-to-end before any code; each phase is gated by explicit approval.

## Status

**STATUS: Draft (2026-10-08). Needs devil + db-architect before Phase 1. Build step: after mentor Phase 2 (`mentor_usage` must exist). Track: both.**

## Amendments

<!-- New decisions are appended here as:
## Amendments locked YYYY-MM-DD
- ...
-->

## Decisions locked 2026-10-08 (maintainer)

- **Business in the EU/UK.** The exact country (and so VAT/OSS vs UK VAT) is still open — see Open question 1.
- **Model: free tier + credit packs.** No subscription in v1.
- **Free tier: 20 mentor questions per calendar month (UTC) per learner.** Resets 00:00 UTC on the 1st.
- **Provider: Stripe (Stripe Checkout, one-time payments).** This replaces the Paddle pick made earlier the same day. Paddle was proposed first because, as merchant of record, it files EU VAT/UK VAT for the seller. Stripe won because the maintainer already runs Stripe on another project and its card fee is much lower (≈ 1.5 % + €0.25 vs 5 % + 50¢ on a €4 sale). **The price of that choice: the maintainer is the seller and owns VAT registration and filing** (see "Tax").
- **Stripe Checkout hosted page, by redirect** — not Embedded Checkout or Elements. No card data and no Stripe script on our site, so almost no CSP change.

## Context

- **Built:** Clerk auth, `users` row per hero, `xp_events` ledger with `users.xp` as a cache written in the same transaction (`db/CLAUDE.md` invariant 3), account export (`lib/data/account.ts`) and erase (one cascading delete, `lib/account/erase.ts`), a verified Clerk webhook (`app/api/webhooks/clerk/route.ts` + pure handler in `lib/account/webhook.ts`), static CSP + COOP `same-origin-allow-popups` (`lib/security/headers.ts`), privacy page copy in `lib/constants/legal-copy.ts`.
- **Mentor (`mentor-design-plan.md`, amendments 2026-10-08):** `mentor_usage` row per question (`started` → `ok`/`no_match`/`error`/`timeout`/`stopped`), 5/min rate cap, $50 global monthly budget, ~$0.001 per question on Haiku 5.5 (worst case ≈ $0.0016). The cap changes are layered on that plan as "Amendments locked 2026-10-08 (credits)".
- **Not built:** no `stripe` dependency, no terms-of-sale page, no `/credits` route.
- **`/api/(.*)` is public in `proxy.ts`** (only `/dashboard` and `/profile` are private), so a new webhook route needs no matcher change.
- **Rules this spec binds to:** `db/CLAUDE.md` (cascade, enums as CHECK, ledger + cache), `ENGINEERING.md` (server is the boundary), `.claude/context/project.md` hard rule **"No dark patterns. No streak shaming, no paid HP refills, no loot boxes"**, `critical-behavior.md` (four async states, 360 px, secrets server-side).

## Purpose

The mentor costs real money per question. A small free allowance keeps it open to everyone; packs let heavy users keep asking and pay for that use. Paying must feel like buying a book, not a game shop: clear price, no pressure, nothing random. Credits buy mentor questions only — never XP, HP, grades, levels or anything on the leaderboard.

## Rules

1. **1 credit = 1 mentor question that reaches the model.**
2. **"Not covered" (`no_match`) costs nothing.** It makes no model call (mentor plan), so it uses no free question and no credit.
3. **A failed answer is given back.** Status `error` or `timeout` with `output_tokens = 0` → the free question or credit is returned. `stopped` (the learner pressed STOP) and partial answers are charged: the model ran.
4. **Free first, then paid.** Each question uses a free question while the month's 20 last, then 1 paid credit.
5. **Paid credits never expire.** Unused free questions do not roll over.
6. **The browser never grants or spends credits.** Grants come only from the verified Stripe webhook; spends only from the mentor route's own transaction.
7. **Balance can go negative** (a refund or dispute after the credits were used). Below 1, paid questions stop until the balance is ≥ 1 again; free questions still work.

## Packs and prices

| Pack id    | Credits | Price (VAT incl.) | Per question |
| ---------- | ------- | ----------------- | ------------ |
| `pack_100` | 100     | **€4**            | 4.0 ¢        |
| `pack_300` | 300     | **€10**           | 3.3 ¢        |

- Two packs only. No "best value" badge, no crossed-out prices, no "limited time", no countdown, no bonus credits that end.
- Prices are **VAT-inclusive** (Stripe Price `tax_behavior: 'inclusive'`), so the learner pays exactly €4 everywhere and our net changes with the buyer's VAT rate. Currency: EUR only in v1 (Open question 2).
- No pack under €4: Stripe's fixed €0.25 fee would eat a small sale.

### Margin math

Sources (all read 2026-10-08; `stripe.com` and `docs.stripe.com` were blocked by this session's network proxy, so numbers come from Stripe pages as quoted by search results — **re-check at stripe.com/<country>/pricing before Phase 2**):

- Stripe EEA card fees: standard EEA cards **1.5 % + €0.25**, premium EEA cards **1.9 % + €0.25**, UK cards **2.5 % + €0.25** (support.stripe.com/questions/pricing-updates-for-businesses-based-in-the-european-economic-area-(eea); stripe.com/mt/pricing).
- Stripe Tax, no-code integrations incl. Checkout: **0.5 % of volume** in jurisdictions where you are registered (support.stripe.com/questions/understanding-stripe-tax-pricing).
- Mentor cost: ≈ $0.001 per question, worst case $0.0016 (mentor plan, "AI and cost"). $1 ≈ €0.86 used below.

| Line                             | €4 / 100, typical (21 % VAT, standard EEA card) | €4 / 100, worst (27 % VAT, UK card, worst-case Q) | €10 / 300, typical |
| -------------------------------- | ----------------------------------------------- | ------------------------------------------------- | ------------------ |
| Gross paid                       | €4.00                                           | €4.00                                             | €10.00             |
| − VAT (inside the price)         | €0.69                                           | €0.85                                             | €1.74              |
| − Stripe card fee (on gross)     | €0.31                                           | €0.35                                             | €0.40              |
| − Stripe Tax 0.5 %               | €0.02                                           | €0.02                                             | €0.05              |
| **Net to us**                    | **€2.98**                                       | **€2.78**                                         | **€7.81**          |
| − model cost if all credits used | €0.09 (100 × $0.001)                            | €0.14 (100 × $0.0016)                             | €0.26              |
| **Margin**                       | **€2.89 (72 % of gross)**                       | **€2.64 (66 %)**                                  | **€7.55 (76 %)**   |

For comparison, Paddle at 5 % + 50¢ (paddle.com/compare/gumroad, via search) would take ≈ €0.70 of a €4 sale instead of ≈ €0.33, but would also file the VAT.

**Free tier cost:** 20 × $0.001 = **$0.02 per learner per month** (worst $0.032). 1,000 learners using all 20 ≈ $20–32, inside the $50 budget.

## Caps (replaces the mentor plan's "30 per UTC day for everyone")

| Cap                       | Value                                                     | When hit                                                       |
| ------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| Free per calendar month   | **20** questions (`MENTOR_FREE_PER_MONTH`)                | then paid credits; with none → 402 `no_credits`                |
| Paid                      | balance ≥ 1                                               | 402 `no_credits`                                               |
| Per user per UTC day      | **100** questions, free + paid (`MENTOR_DAILY_ABUSE_CAP`) | 429 `daily_cap`; worst ≈ $0.16/user/day                        |
| Per user per minute       | 5 (unchanged)                                             | 429 `rate_limited`                                             |
| Global per calendar month | `MENTOR_MONTHLY_BUDGET_USD`, default $50 (unchanged)      | 503 `paused` for everyone; **no credit is spent while paused** |

Why a daily cap of 100 and not 30: a paying learner may study a whole Saturday; 100 is far above honest use and still bounds a stolen session to ≈ $0.16/day. The $50 global budget stays a kill switch (Open question 4 on raising it as paid volume grows).

## Tax (maintainer risk — read this)

With Stripe, **the maintainer is the seller**. Stripe Tax calculates and collects VAT; **it does not register you or file returns**. Selling credits to consumers is a digital service taxed where the buyer lives.

- **If the business is in an EU country:** cross-border B2C sales of digital services under **€10,000 a year** (rolling, EU-wide) can be taxed at your home rate on your home return; above it you charge each buyer's country rate and file one quarterly **OSS** return in your home country (One Stop Shop; vat-one-stop-shop.ec.europa.eu and taxation-customs.ec.europa.eu, as summarised in search results — the Commission pages were blocked here). Sales to UK buyers then need UK VAT registration from the first sale (below).
- **If the business is in the UK:** UK VAT registration is needed once UK taxable turnover passes **£90,000** (rolling 12 months). Sales to EU consumers need the **non-Union OSS** in one EU country from the first sale (no €10,000 threshold for non-EU sellers). (gov.uk "Register for VAT"; gov.uk policy paper "VAT changes to the supply of digital services 2019" — quoted via search.)
- **Overseas sellers into the UK** must register for UK VAT "regardless of taxable turnover" (gov.uk, quoted via search, checked 2026-09-24 by the source).

**Our pick:** enable **Stripe Tax** (`automatic_tax: { enabled: true }`) with registrations added in the Stripe Dashboard **before live mode is switched on**. Stripe Tax only collects in jurisdictions you have registered in Stripe; elsewhere it charges 0 %, which is wrong if you are required to register. **The maintainer must confirm with an accountant** which registrations are needed before the first live sale (Open question 1). This is the one decision here that can cost money and penalties if wrong.

## EU/UK consumer law: withdrawal, refunds, expiry

- **14-day withdrawal right** applies to online sales to consumers. For digital content not on a tangible medium, it is lost once supply starts **only if** the consumer gave prior express consent and acknowledged losing the right (Consumer Rights Directive 2011/83/EU, Art. 16(m); legislation.gov.uk/eudr/2011/83/article/16). The UK keeps the same rule (Consumer Contracts Regulations 2013). Credits are added at once after payment, so supply starts at once.
- **What we do:**
  1. Checkout collects the consent: `consent_collection: { terms_of_service: 'required' }` + `custom_text.terms_of_service_acceptance` = _"I agree to the [Terms of sale] and ask for my credits now. I understand I lose my 14-day right to cancel once I use a credit."_ The receipt email links the terms (durable medium).
  2. **Voluntary policy, more generous than the law:** a pack with **no credit used** (balance ≥ that pack's credits since purchase) is refunded in full on request within 14 days. Simple to explain, nothing hidden.
  3. Faulty service stays covered by statutory rights (a failed answer already refunds itself, Rule 3).
- **No expiry.** No EU rule forces expiry, and expiring paid credits is a pressure tactic we don't want. Cost: unused credits are a small open liability on the books (maintainer's accountant).
- Refunds are issued **by the maintainer in the Stripe Dashboard**; the webhook removes the credits (below).

## User-visible behaviour

### Where the balance shows

| Place                     | What                                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mentor panel, above input | One plain line: _"Free questions left this month: 14 of 20. Credits: 230."_ + a **BUY CREDITS** text link.                                                               |
| Mentor panel, out of both | _"You've used this month's 20 free questions. They reset on 1 November. Buy credits to keep asking."_ + **BUY CREDITS** button. Input disabled. Never shown as an error. |
| Profile                   | A **Mentor credits** `Panel`: free left, credit balance, link to `/credits`, link to purchase history.                                                                   |
| HUD, map, quest list      | **Nothing.** No coin icon, no balance in the HUD: credits are not a game resource.                                                                                       |

### `/credits` page (new route, private: add to `isPrivate` in `proxy.ts`)

1. Heading **MENTOR CREDITS**; one paragraph: what a credit is, that 20 free questions come every month, that credits never expire, that "not covered" answers and failed answers are free.
2. Current balance line (same as the panel).
3. Two `Panel` cards: credits, price incl. VAT ("€4, VAT included. Your country's VAT may change our share, never your price."), **BUY** `PixelButton`.
4. BUY submits a Server Action → Stripe Checkout (redirect). Button shows "Opening checkout…" and `aria-disabled` while pending.
5. Back from Stripe: `?checkout=success` → _"Payment received. Your credits appear in a few seconds."_ The page polls the balance (`/api/hud`-style read, 2 s, max 30 s) and then shows the new balance. `?checkout=cancelled` → _"No payment was taken."_ Neither query value grants anything.
6. **Purchase history** table: date, pack, credits, status (paid / refunded / disputed). Stripe emails the receipt; v1 has no invoice PDF.
7. Footer links: Terms of sale, Refund policy (same page), Privacy.

### The four async states (+ gates)

| State          | `/credits` page                                                                                                                      | Mentor panel balance line                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Loading        | `loading.tsx` skeleton panels                                                                                                        | "Checking your credits…"                          |
| Empty          | Balance 0, no history: "No purchases yet."                                                                                           | "Free questions left this month: 20 of 20."       |
| Error          | `error.tsx` with TRY AGAIN; checkout start failure → inline `role="alert"`: "Checkout didn't open. No payment was taken. Try again." | Line hidden; mentor still works on its own checks |
| Success        | Balance + packs + history                                                                                                            | Balance line                                      |
| Not configured | No `STRIPE_SECRET_KEY` → packs replaced by "Buying credits isn't open yet."; free tier still works                                   | No BUY link                                       |
| Webhook slow   | After 30 s polling: "Still processing. Refresh in a minute; if credits don't appear within an hour, contact us."                     | —                                                 |

### Layout, a11y, voice

- 360 px: packs stack in one column; history table becomes a list (date + pack on one line, status below). No sideways page scroll. Tap targets ≥ 44 px. 3 px Spark focus ring.
- Status is text ("Refunded"), never colour only. Prices are real text, not images. Polling result is announced once via `aria-live="polite"`.
- Plain technical voice only. No NPC, no lore, no DialogBox on this page. The pixel font is for the heading and buttons only.
- **Never:** fake scarcity, timers, "only today", pre-ticked extras, nagging pop-ups, a buy prompt before the free questions are used, streak or shame language.

## Money flow

```
 learner ──BUY pack_100──▶ Server Action startCheckout   (Zod packId → auth() → users row → Stripe API)
                              │ checkout.sessions.create(price = server map, client_reference_id = userId,
                              │   metadata {userId, packId}, automatic_tax, consent_collection)
                              ▼
 browser ◀──redirect(session.url)──  checkout.stripe.com (card, VAT, consent, receipt email)
     │                                         │
     └──▶ /credits?checkout=success (shows only)│
                                               ▼
              Stripe ──POST signed event──▶ /api/webhooks/stripe
                                               │ constructEvent(rawBody, stripe-signature, STRIPE_WEBHOOK_SECRET)
                                               ▼
                        one tx: INSERT credit_events (purchase, +100) ON CONFLICT (stripe_ref) DO NOTHING
                                if inserted → users.credit_balance += 100
```

### Starting checkout — Server Action `lib/actions/credits.ts`

1. Zod: `{ packId: z.enum(CREDIT_PACK_IDS) }`. Nothing else is accepted from the browser — no price, no amount, no credits, no user id.
2. `auth()` → 401; `users` row → else `no_hero`; Stripe configured → else `not_configured`.
3. `stripe.checkout.sessions.create({ mode: 'payment', line_items: [{ price: <price id for packId from env>, quantity: 1 }], client_reference_id: userId, metadata: { userId, packId }, payment_intent_data: { metadata: { userId, packId } }, automatic_tax: { enabled: true }, consent_collection: { terms_of_service: 'required' }, custom_text: {…}, success_url: SITE + '/credits?checkout=success', cancel_url: SITE + '/credits?checkout=cancelled', locale: 'auto' })`, with a Stripe idempotency key per click (uuid from the form) so a double-click opens one session.
4. `redirect(session.url)` (303). Errors → `{ error: 'checkout_failed' }`, logged without the key.

No Stripe Customer is created by us (Checkout makes a guest customer by default in payment mode). We store no email.

### Webhook — `app/api/webhooks/stripe/route.ts` (thin) → `lib/credits/webhook.ts` (pure, bun-tested)

- `runtime = 'nodejs'`. `const raw = await req.text()`; `stripe.webhooks.constructEvent(raw, req.headers.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET)`. The raw body is required: "you must pass the _raw_ request body, exactly as received from Stripe, to the `constructEvent()` function; this will not work with a parsed (i.e., JSON) request body" (stripe-node 23.0.0 README). Default timestamp tolerance **300 s** (`DEFAULT_TOLERANCE: 300`, stripe-node `Webhooks.js`) = replay window. Bad signature or no secret → 400.
- Pin the API version in code (`apiVersion` in `lib/constants/credits.ts`; stripe-node 23.0.0 ships `2026-09-30.endive`) and set the same version on the webhook endpoint in the Dashboard.
- Handled events (endpoint subscribes to these only):

| Event                                        | Action                                                                                                                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `checkout.session.completed`                 | If `payment_status === 'paid'` → **grant**. If `'unpaid'` (delayed method) → 200, wait.                                                                                        |
| `checkout.session.async_payment_succeeded`   | **grant** (same function).                                                                                                                                                     |
| `checkout.session.async_payment_failed`      | 200, log only.                                                                                                                                                                 |
| `charge.refunded`                            | List the charge's refunds (`stripe.refunds.list({ charge })`); for each **succeeded** refund id insert a `refund` event of −round(pack credits × refund.amount ÷ amount paid). |
| `charge.dispute.created`                     | `dispute` event of −(pack credits), keyed by the dispute id.                                                                                                                   |
| `charge.dispute.closed` with `status: 'won'` | `dispute_won` event of +(pack credits), keyed `<dispute id>:won`.                                                                                                              |
| anything else                                | 200, ignored.                                                                                                                                                                  |

- **Grant** checks, in order: `metadata.userId === client_reference_id`; retrieve the session with `expand: ['line_items']`; exactly one line item; its price id maps to a known pack (`priceId → packId` from env, server-only); `metadata.packId` matches; `amount_total > 0`; `mode === 'payment'`; `livemode` matches the key's mode. Any mismatch → log `credits_grant_rejected` + 200 (retrying won't fix it; maintainer refunds by hand). Credits come **only** from the server constant `CREDIT_PACKS[packId].credits`.
- **Refund/dispute → user:** the `purchase` row stores the `payment_intent` id; the charge's `payment_intent` finds it. No purchase row → log + 200.
- **User gone** (account deleted before the webhook): log `credits_orphan_payment` + 200; maintainer refunds in the Dashboard. (Rare: `/credits` needs a hero.)
- DB failure → 500 so Stripe retries. All writes are idempotent (unique `stripe_ref`), so retries and duplicate or out-of-order deliveries are safe; a refund that arrives before its grant is retried until the grant exists (return 500 while the purchase row is missing for ≤ 1 h of event age, then 200 + log).

## Data model

**SCHEMA REVIEW REQUIRED: db-architect** (before any migration). Draft only. New file `db/schema/credits.ts`; changes to `users` and `mentor_usage`.

### `credit_events` — append-only ledger (the truth)

| Column            | Type                         | Notes                                                                                                                                      |
| ----------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`              | `bigint` identity PK         |                                                                                                                                            |
| `user_id`         | `text` NOT NULL              | FK `users(id)` **ON DELETE CASCADE**                                                                                                       |
| `kind`            | `text` NOT NULL              | CHECK `oneOf(CREDIT_EVENT_KINDS)` = `purchase, spend, reversal, refund, dispute, dispute_won, adjustment` (fixed set → CHECK)              |
| `amount`          | `integer` NOT NULL           | signed. CHECK `amount <> 0`; CHECK sign by kind (`purchase, reversal, dispute_won` > 0; `spend, refund, dispute` < 0; `adjustment` either) |
| `stripe_ref`      | `text` NULL                  | `cs_…` (purchase), `re_…` (refund), `dp_…` / `dp_…:won` (dispute). **Partial UNIQUE where not null** = idempotency                         |
| `payment_intent`  | `text` NULL                  | `pi_…`, set on `purchase` (refund/dispute lookup); index                                                                                   |
| `pack_id`         | `text` NULL                  | on `purchase`; text + Zod (packs will grow)                                                                                                |
| `amount_cents`    | `integer` NULL               | on `purchase`: what the learner paid incl. VAT (export, reconciliation)                                                                    |
| `currency`        | `text` NULL                  | on `purchase`                                                                                                                              |
| `mentor_usage_id` | `bigint` NULL                | FK `mentor_usage(id)` ON DELETE CASCADE, on `spend`/`reversal`. Partial UNIQUE `(mentor_usage_id, kind)`                                   |
| `note`            | `text` NULL                  | `adjustment` only (why; maintainer-written)                                                                                                |
| `created_at`      | `timestamptz` NOT NULL now() |                                                                                                                                            |

Indexes: `(user_id, created_at desc)` (history, export); partial unique `stripe_ref`; partial unique `(mentor_usage_id, kind)`; `(payment_intent)`.

Why `stripe_ref` is the object id, not the Stripe **event** id: the same session can arrive as two events (`completed` then `async_payment_succeeded`); keying on `cs_…` grants once.

### `users.credit_balance` — cache, like `users.xp`

- `integer NOT NULL default 0`, **no** `>= 0` CHECK (refunds may push it negative, Rule 7).
- Always written in the same transaction as its `credit_events` row. `bun run db:check` also fails if `credit_balance ≠ sum(credit_events.amount)`.

### `mentor_usage.billing`

- `text NOT NULL default 'none'`, CHECK `oneOf(MENTOR_BILLING) = ['free', 'credit', 'none']`.
- **Free used this month = `count(*) from mentor_usage where user_id = $1 and created_at >= utcMonthStart(now) and billing = 'free'`.** No ledger rows for free questions, nothing to reset. Served by the existing `(user_id, created_at desc)` index. `utcMonthStart` joins `lib/xp/day.ts` next to `utcDayStart`.

### Spending: one transaction, race-free

Route order (mentor plan step 7 onward, amended):

1. Cheap checks as today (keys, auth, Zod, hero, exercise, budget, daily 100, 5/min).
2. **Pre-check** (no lock): free used < 20 or balance ≥ 1, else 402 `no_credits` before spending an embedding.
3. Retrieval. Below the bar → insert `mentor_usage` with `status = 'no_match'`, `billing = 'none'`; fixed reply. **No charge.**
4. One transaction:
   - `SELECT credit_balance FROM users WHERE id = $1 FOR UPDATE` — locks this learner's row, so two tabs queue instead of both reading "19 used".
   - count free used this month (as above).
   - `< 20` → insert `mentor_usage(status 'started', billing 'free')`.
   - else `credit_balance >= 1` → insert `mentor_usage(… billing 'credit')` returning id; insert `credit_events(spend, −1, mentor_usage_id)`; `users.credit_balance -= 1`.
   - else → rollback, 402 `no_credits`.
5. Model call, stream.
6. In `after()`: update the usage row. If the final status is `error`/`timeout` with `output_tokens = 0`: `billing = 'free'` → set `billing = 'none'`; `billing = 'credit'` → insert `reversal +1` (unique on `(mentor_usage_id, kind)`) + `credit_balance += 1`, same transaction.

The lock is per user and held for a few ms; it never blocks other learners.

## API contract changes

| Code         | HTTP | Text                                                                                                                               |
| ------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `no_credits` | 402  | (Panel "out of both" state.) If balance < 0: "Your credit balance is below zero after a refund. Free questions return on the 1st." |
| `daily_cap`  | 429  | "You've reached today's limit of 100 mentor questions. It resets at 00:00 UTC."                                                    |
| `paused`     | 503  | adds: "No credits were used."                                                                                                      |

`GET /api/mentor/balance` (or a field in the existing HUD read): `{ freeLeft, freeLimit, credits, resetsAt }`, auth-scoped, `Cache-Control: no-store`.

## Environment

| Var                                              | Where       | Notes                                                                                                                                                                                              |
| ------------------------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`                              | server-only | **Test key (`sk_test_…`) on dev and every preview; live key only in Vercel Production.** Prefer a restricted key (`rk_…`) with only Checkout Sessions write, Refunds read, Prices read.            |
| `STRIPE_WEBHOOK_SECRET`                          | server-only | `whsec_…`, one per endpoint (test endpoint for preview, live for prod). Local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (docs.stripe.com/payments/checkout/fulfill-orders). |
| `STRIPE_PRICE_PACK_100`, `STRIPE_PRICE_PACK_300` | server-only | Price ids differ between test and live mode, so they are env, not constants. Credits per pack stay a constant (`CREDIT_PACKS` in `lib/constants/credits.ts`).                                      |

**No publishable key**: hosted Checkout by redirect needs none. Nothing is `NEXT_PUBLIC_`. Without `STRIPE_SECRET_KEY` the buy UI shows "not open yet" (same pattern as the newsletter). `stripe` joins `SERVER_ONLY` in `eslint.config.mjs` (allowed in `lib/credits/**`, `lib/actions/credits.ts`).

## CSP / headers (`lib/security/headers.ts`)

- **`script-src`, `connect-src`, `frame-src`: no change.** No Stripe script runs on our pages.
- **`form-action`: add `https://checkout.stripe.com`.** With JS, the Server Action redirect is a client navigation (not covered by `form-action`). Without JS (progressive enhancement), the form POST gets a 303 to `checkout.stripe.com`, and Chrome applies `form-action` to redirects after a form submit, so `'self'` alone would block it. One host, no risk.
- **COOP `same-origin-allow-popups`: no change.** Checkout is a top-level navigation, not a popup.
- `Permissions-Policy: payment=()` stays: the Payment Request API runs on Stripe's page, not ours.
- A header test asserts the new `form-action` value.

## Legal and privacy

- **Privacy page (`lib/constants/legal-copy.ts`):** add **Stripe** as a processor/independent controller for payments: what it receives (email, card details, billing country, IP), that we never see the card, our rows (purchase date, pack, amount, Stripe ids). Region and role read from Stripe's privacy policy and DPA at build time, never from memory.
- **Erasure:** deleting the account deletes every `credit_events` row (cascade) and loses any unused credits. The delete confirmation adds one line: _"Unused credits (230) will be lost. Unused packs bought in the last 14 days can be refunded first — contact us."_ **Stripe keeps its own payment records** (tax and anti-money-laundering law); we can't delete those. The privacy page says so and links Stripe's privacy policy.
- **Export (`lib/data/account.ts`):** adds `creditEvents` (all columns; nothing in them is secret, and the Stripe ids are about the learner's own payments) and `mentor_usage.billing`.
- **Terms of sale + refund policy:** new section on a `/terms` page (or `/credits/terms`): seller name and address (maintainer — Open question 1), what a credit is, no expiry, the 14-day rule and consent wording above, the voluntary unused-pack refund, how to ask (email), that credits have no cash value and aren't transferable. Copy reviewed by the maintainer; not legal advice from us.

## Security

| Threat                        | Defence                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Forged webhook                | `constructEvent` HMAC check with `STRIPE_WEBHOOK_SECRET`; 400 otherwise.                                                                    |
| Replay                        | 300 s timestamp tolerance + unique `stripe_ref` (a replayed old event grants 0).                                                            |
| Duplicate / out-of-order      | Grants and refunds keyed on Stripe object ids; one function for both checkout events.                                                       |
| Amount / pack tampering       | Browser sends only `packId`; price id from server env; credits from a server constant; webhook re-checks line item price, pack, amount > 0. |
| Granting from the success URL | `?checkout=success` only shows text; it never writes.                                                                                       |
| Someone else's user id        | `client_reference_id` is set by our server from `auth()`, never from input.                                                                 |
| Test money in prod            | Test keys on preview/dev; webhook checks `event.livemode` matches the key's mode.                                                           |
| Spend race                    | `FOR UPDATE` on the user row in the spend transaction.                                                                                      |
| Leaked key                    | Restricted key; secrets server-only; never logged.                                                                                          |

## Phases

### Phase 1 — Ledger + spending (no payments yet)

**Goal:** free 20/month and the credit balance gate the mentor; maintainer can grant credits with an `adjustment` script.

**Files:** `db/schema/credits.ts`, `db/schema/users.ts`, `db/schema/mentor.ts`, migration (after db-architect); `lib/constants/credits.ts`; `lib/types/credits.ts`; `lib/xp/day.ts` (`utcMonthStart`); `lib/credits/spend.ts`; mentor route changes; `scripts/db-check.ts` (balance = ledger); `scripts/credits-adjust.ts`.

**Verification:** bun tests for the free/paid decision, reversal, month boundary (23:59 → 00:00 UTC on the 1st), sign CHECKs; a parallel-request test (two asks at 19 used → exactly one free); `db:check`; typecheck, lint, build.

### Phase 2 — Stripe Checkout + webhook (test mode)

**Goal:** buying a pack in Stripe test mode adds credits; refund and dispute remove them.

**Files:** `package.json` (`stripe`), `lib/credits/stripe.ts`, `lib/credits/webhook.ts` (+ tests), `lib/actions/credits.ts`, `app/api/webhooks/stripe/route.ts`, `lib/security/headers.ts` (+ test), `eslint.config.mjs`, `.env.example`.

**Verification:** unit tests with recorded fixture events (paid, unpaid then async succeeded, duplicate, refund partial/full, dispute won/lost, bad price id, livemode mismatch, user gone); `stripe listen` + `stripe trigger` locally; manual test-mode purchase on a preview.

### Phase 3 — UI, legal, privacy, export

**Goal:** `/credits`, balance in mentor panel and profile, terms, privacy, export, delete warning.

**Files:** `app/(app)/credits/{page,loading,error}.tsx`, `components/quest/mentor-panel.tsx`, `app/(app)/profile/page.tsx`, `proxy.ts`, `lib/constants/{ui-copy,legal-copy}.ts` (+ tests), `lib/data/account.ts`, `e2e/` (axe on `/credits` with no Stripe key → "not open yet").

**Verification:** 360 px + desktop, keyboard only, axe; voice-guardian on the copy; typecheck, lint, test, build, test:e2e.

**Go-live gate (maintainer):** VAT registrations done and entered in Stripe Tax; live products/prices created; live webhook endpoint + secret; receipts on in Dashboard → Settings → Customer emails; terms page live.

## Acceptance criteria

- [ ] A new learner asks 20 questions in a month for free; the 21st uses 1 credit; with 0 credits it returns 402 `no_credits` and the panel shows the buy state.
- [ ] `no_match` replies and failed answers with no output cost nothing (usage `billing = 'none'` or a `reversal` row).
- [ ] Two parallel asks with 19 free used: exactly one is free.
- [ ] A test-mode purchase of `pack_100` adds exactly 100 credits once, even if the webhook is delivered 3 times and both checkout events arrive.
- [ ] A forged or stale (> 300 s) webhook gets 400 and writes nothing.
- [ ] A session whose line-item price is not a known pack grants nothing.
- [ ] A full refund removes 100; a dispute removes 100; a won dispute adds them back; balance can go below 0 and then blocks paid questions only.
- [ ] `users.credit_balance` equals the ledger sum (`bun run db:check`).
- [ ] Deleting the account deletes all `credit_events`; the export lists them.
- [ ] `/credits` works at 360 px, keyboard only, axe clean, all four states; no timer, badge or scarcity copy anywhere.
- [ ] Preview deployments use Stripe test mode only.

## Out of scope

- Subscriptions, coupons and promo codes, team or school plans, gifting, credit transfers.
- Credits for anything except mentor questions (never XP, HP, cosmetics).
- Embedded Checkout / Elements, saved cards, invoices with VAT numbers (B2B), currencies other than EUR.
- Automatic refunds from the app; a self-serve refund button.

## Open questions

1. **Which country is the business in, and is it VAT-registered?** Lean: the maintainer confirms with an accountant before go-live; Phase 1–2 don't depend on it. It decides OSS vs UK VAT, the seller details on the terms page, and Stripe Tax registrations.
2. **EUR only, or GBP too?** Lean: **EUR only** in v1; a UK seller may prefer GBP. Adding a currency is a second Price per pack, no schema change.
3. **Pack sizes.** Lean: **100/€4 and 300/€10**. Other option: a 1,000/€25 pack; downside: more unused-credit liability for little gain at launch.
4. **Should the $50 global budget pause paid learners?** Lean: **yes for v1** (one simple kill switch; no credit is spent while paused), raise it once monthly paid volume is known. Other option: budget counts free questions only; downside: paid usage then has only the Anthropic Console limit as a fence.
5. **Daily abuse cap 100.** Lean: as written. Other option: keep 30 for free-only learners; downside: two numbers to explain.
6. **Refund unused packs within 14 days.** Lean: **yes, voluntary, by email**. Other option: law minimum only; downside: harsher than needed for a €4 product.
7. **Restricted key vs full secret key.** Lean: **restricted** (`rk_…`), if Stripe's restricted keys cover Checkout Sessions + Refunds list; else the secret key.

## Companion plans

- `docs/plans/mentor-design-plan.md` ("Amendments locked 2026-10-08 (credits)" layers the caps)
- `docs/plans/quest-actions-design-plan.md` (Server Action pattern, ledger + cache)
