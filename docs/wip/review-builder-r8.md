## Content review: `content/builder/08-production-peaks` c1–c6 lessons + c5 case.json (branch `content/template-builder-r8` @ 529a968, compared with `origin/canary`)

**VERDICT: fix before merge**

In short: every vendor fact is true, and every graded question is taught. But several worked examples copy the case or boss setups. One ramp example also has a time error. One streaming line goes further than its source.

- **content:check:** passes ("every content file is valid").
- **Pages checked:** I fetched all 26 cited pages as `.md` with curl.
- **Quotes:** I searched for every quoted string automatically. All vendor quotes are verbatim. Only our own scenario lines were not found, which is expected.
- **Source rule:** every lesson cites at least one Anthropic page and one OpenAI page.
- **Shared chapters:** `content/shared-chapters.json` has no builder/r8 member.

---

### Must-fix (exact replacement text)

**[BLOCKER] c5/lesson.mdx:87–89. The streaming claim is not what the source says.**

- The lesson says streaming and chunking "really do cut the time before users can read". Then it adds, with no source: "streaming does not make the full answer finish sooner".
- The OpenAI page says: "streaming & chunking genuinely do reduce overall latency once you consider the app + user system: the user will finish reading a response sooner" (https://developers.openai.com/api/docs/guides/latency-optimization).
- Why it matters: c5 case Q2 has a wrong option, "Total time falls". A learner who reads the OpenAI line could think that option is true.
- Replace lines 87–89 with:
  > The OpenAI guide adds that streaming and chunking "genuinely do reduce overall latency once you consider the app + user system: the user will finish reading a response sooner". The model's work does not shrink. The [Claude guide](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency) says streaming lets the model "start sending back its response before the full output is complete". So the last word arrives at the same time; the reader just starts earlier.
- Both quotes are verbatim on the cited pages.

**[BLOCKER] c6/lesson.mdx:154–166. The ramp copies case Q3, and the time is wrong.**

- It starts at 1,000,000, the same as the case. The table shows 1.5M, 2.25M and 3.375M, which is the case's own answer path.
- "Opens traffic at 18:00 … full peak is possible before the 19:00 news story" is wrong: 18:00 + 60 min is exactly 19:00, not before.
- The logic is also wrong: the riders only come after the news, so you cannot ramp up to the news peak before it airs.
- Replace Step 4 with:
  > ### Step 4: the ramp (the other hard case)
  >
  > The riders arrive only after the news story, so the team cannot ramp before 19:00. The flag holds back the share of riders who see the assistant. At 19:00 the assistant serves 1,200,000 input tokens a minute. Full demand is about 6,000,000.
  >
  > ```text
  > 19:00    1,200,000
  > 19:15    1,800,000
  > 19:30    2,700,000
  > 19:45    4,050,000   (still below 6,000,000)
  > 20:00    6,075,000   (above full demand)
  > ```
  >
  > That is four steps, so about 60 minutes. Until 20:00, riders outside the flag see the normal timetable page.
- Also change the Step 6 bullet to: "The ramp follows the OpenAI docs' rule of thumb and reaches full demand in about an hour."
- I checked the math: 1.2 × 1.5⁴ = 6.075, and 1.2 × 1.5³ = 4.05 < 6.

**[BLOCKER] c6/lesson.mdx:129–137. Step 1 copies the c6 case exhibit.**

- The case exhibit has: a preview model "chosen because it scored best", a fallback on ANY error with no eval, and a hard limit equal to the budget with no alerts. Step 1 has the same three rows, in the same order.
- Replace the code block with:
  ```text
  model id:          written into 6 source files
  retirement dates:  nobody tracks them
  fallback:          a second model, never load-tested
  traffic:           all riders at 19:00, when the news story airs
  rollback:          redeploy the old version (about 25 minutes)
  ```
- Step 2 becomes: "Our fix: move the model id into config, keep a list of retirement dates with an owner, and keep any `-preview` model out of production."
- Step 6 bullet 1 becomes: "A model retirement is a config change, not a code hunt."

**[BLOCKER] c6/lesson.mdx:143–152. Step 3 copies the boss FALLBACK block.**

- Both compare the fallback limit with the peak, compute a share and queue the rest. The boss asks the same thing with 400k / 1M.
- Replace with:
  > ### Step 3: the fallback (a hard case)
  >
  > Only capacity errors trigger it, and the fallback model passed the team's evals. Its limit is lower than the main model's, so the team decides which traffic may use it.
  >
  > ```text
  > fallback model limit:    1,200,000 input tokens/min
  > live rider chat (peak):    900,000  -> may fall back
  > nightly FAQ refresh:       700,000  -> never falls back; waits for the main model
  > ```
  >
  > Rider chat fits inside the fallback limit with room left. The nightly job would push the total to 1,600,000, so it pauses instead.

**[BLOCKER] c4/lesson.mdx:149–157. Step 4 copies the boss KEYS block.**

- The boss has: revoke old, create new, deploy (about 10 min). Step 4's "weak order" is the same, with 15 min.
- Replace with:
  > ### Step 4: rotate without downtime (the hard case)
  >
  > The production key expires on Friday. The team follows the order in the OpenAI production guide, for this Claude key:
  >
  > ```text
  > Monday     create key B in homework-prod; store it in the secrets manager
  > Tuesday    deploy: servers read key B; key A still works
  > Wednesday  the Usage and Cost API shows no usage on key A for 24 hours
  > Thursday   delete key A
  > ```
  >
  > Both keys work from Monday to Thursday, so no request fails during the switch.

**[BLOCKER] c2/lesson.mdx:129–137 and 165–174. Steps 1 and 5 copy the c2 case exhibit.**

- The case has: one batch over 100,000 requests, results paired by line number, and succeeded/errored/canceled/expired counts followed by "resend the failed ids".
- New Step 1 code block:
  ```text
  submit:  two batches of 90,000 requests
  check:   none before the run
  retry:   if anything failed, run the whole batch again
  ```
- New "What goes wrong" bullets:
  - "90,000 is under the request limit, but each batch is too big in MB (step 3)."
  - "A wrong field fails every request, and you only learn it at the end."
  - "A full rerun pays again for thousands of good results."
- New Step 5:
  > Batch 1 ends. Sort the results that did not succeed by type:
  >
  > ```text
  > errored, invalid request  -> fix the params, then resend
  > errored, server error     -> resend as it is
  > expired                   -> resend as it is
  > succeeded                 -> keep; never resend
  > ```
  >
  > Put the resend ids into one new, small batch. The good summaries stay as they are.

**[BLOCKER] Common mistakes that repeat the wording of a correct option.**

- **c3/lesson.mdx:172.** It shares the 31-character run "log metadata by default, and" with the correct option of c3 case Q4. New fix line: "Fix: keep ids, status, timings and token counts in every line. Turn on prompt text only when you debug, for a short time and for a few people."
- **c6/lesson.mdx:187.** It is close to c6 case Q4's correct option ("Add alerts below the cap, and plan what the app does at the stop"). New fix line: "Fix: send a warning at 50% and 80% of the budget, and write the message users see if traffic stops."
- **c5/lesson.mdx:172.** It is close to c5 case Q4's correct option ("Stream the response, or use Batch if nobody is waiting"). New fix line: "Fix: turn on streaming for any reply that can run for minutes. If no person waits for it, send it as a batch job."

---

### Should-fix

**Worked numbers**

- **c5:136.** Change "well under half a second" to "at most about 0.4 s in total (5% of 8.0 s of model time)". 5% of 8.0 s is 0.4 s, so "well under" is too strong.
- **c5:160.** Change "3 × 30 = 90 s" to "at least 3 × 30 = 90 s, plus the waits between tries".

**Close copies of graded setups (same calculation, new numbers)**

- **c1 Steps 1 and 4** (12 requests; a 429 with header room) solve c1 case Q4 and Q1 ahead of time.
- **c3:77 and Step 2** (3.0 s vs 2,600 ms) solve boss Q3 ahead of time.
- **c1 Try it (167–172)** repeats c1 quick-check Q2: more Gemini keys, and the daily reset time.
- **c6 Try it** repeats c6 quick-check Q3 (the fast-mode fallback misses the cache).
- Fix: change the setup, or test a different fact.

**Quotes credited to a company instead of "the <vendor> docs"**

- c2:67–68: "**Claude:**" / "**Gemini:**" → "**Claude docs:**" / "**Gemini docs:**"
- c2:77: "On OpenAI, "…"" → "The OpenAI docs say "…""
- c2:123: "Claude stores batch…" → "The Claude docs say batch data is stored "for up to 29 days after batch creation"."
- c3:71: "The rules:" → "The OpenAI API reference sets the rules:"
- c4:67: "OpenAI administrators can "…"" → "The OpenAI production guide says administrators can "…""
- c5:120: "Claude can return 529 … when "…"" → "The Claude errors page says a 529 `overloaded_error` can happen when "…""
- c1:55, c5:148, c6:91 and c6:169: "OpenAI's rule of thumb" → "the OpenAI docs' rule of thumb"

**Our own claims with no "Our…" label**

- **c4:72.** "Hiding or minifying the code does not help…" is not on the Gemini page. Add "Our note:" in front.
- **c4:74.** "Your server then holds the key and owns the rules…" → start with "Our pattern:".
- **c1:68.** "Another key gets the same error." → "Our reading: another key in the same organization gets the same error." The page says only that the cap is "the maximum your organization can spend".
- **c6:68.** "Nobody moves your calls for you." → "Our reading of the page: nobody moves your calls for you."

---

### Supported (the claims you asked about)

**Rate limits and errors (c1)**

- 429 `slow_down` and 503 `server_is_overloaded`: "The API can return `slow_down` when your request rate increases too quickly, or `server_is_overloaded` when the requested model is temporarily overloaded". The status table shows 429 / 503.
- "Don't retry quota, billing, or other errors that require you to take action": verbatim (OpenAI rate limits page).
- Headers: `anthropic-ratelimit-*-remaining` are "rounded to the nearest thousand". `x-ratelimit-remaining-requests` and `-tokens` are on the OpenAI page.
- Spend cap: "API usage pauses until 00:00 UTC on the first day of the next month". No `retry-after`. `enforced_spend_limit_reached`. A self-set limit gives a 400 that begins "You have reached your specified API usage limits".
- The Claude SDK retries "twice by default, honoring the `retry-after` header" (errors page).
- Workspace rules, Gemini per-project limits and the midnight Pacific reset, and the 2M ITPM / 80% cache → 10M example: all verbatim.

**Batching (c2)**

- "limited to either 100,000 Message requests or 256 MB in size, whichever is reached first".
- "charged at 50%".
- "Batches expire if processing does not complete within 24 hours".
- `stream`, `speed` and `max_tokens: 0` are not supported in a batch.
- OpenAI: 50,000 requests / 200 MB / 2,000 batches per hour; embeddings capped at 50,000 inputs.
- Gemini: 20MB inline / 2GB file / 48 h expiry.
- Flex: 10-minute default timeout, examples use 15; `429 Resource Unavailable` "You will not be charged".
- Math: 180,000 × 5 KB = 900 MB and 45,000 × 5 KB = 225 MB, both right. Note that the Must-fix above replaces the 180,000 one-batch plan and the 44,710 / 170 / 0 / 120 count example.

**Request ids (c3)**

- The server id is the Claude `request-id` header / `request_id` field, and OpenAI `x-request-id`.
- The client id is OpenAI `X-Client-Request-Id`: "only ASCII characters and be no more than 512 characters long".
- Claude Code `client_request_id` is "available for failures such as timeouts that never produced a server `request_id`".

**Keys and data (c4)**

- Gemini: "run a backend proxy server to make the actual API calls".
- OpenAI rotation order: "create a replacement, update your applications to use it, and revoke the old key once you've verified that the replacement works".
- Files API under ZDR: the table says "No", and "Under ZDR, the API does **not** block these features; using one is a choice to step outside your ZDR arrangement".
- Batch has 29-day retention. Expiry choices: 3 hours / 1 day / 7 days / 30 days / custom / Never. Disable is reversible; Delete is permanent.

**Latency and fast mode (c5)**

- "For speed-critical applications, **Claude Haiku 5.5** offers the fastest response times". The c5 case.json change ("The Claude docs name Haiku 5.5…") is correct.
- Fast mode on Opus 5.5 / 5 / 4.8, and "not available on Claude Opus 4.7 … return an error".
- OpenAI `service_tier` `fast` or `priority`, the ETL warning, and the downgrade to `service_tier: "default"`.
- 8.3 s → about 4.3 s follows the lesson's own rules: B and C run in parallel → 5.8 s, then half of D's output → 0.3 + 2.5 + 1.5 = 4.3 s.

**Launch (c6)**

- Fallback 1.2M / 1.6M = 75% is correct math, but the Must-fix above replaces it.
- Ramp arithmetic 1M → 5.06M in 4 steps is correct, but the time and the copy problem are in Must-fix.
- Notice periods (60 days / 6 months / 3 months / 2 weeks), Usage CSV export, fast-mode fallback cache miss, spend alert vs hard limit, and the per-user usage limit (OpenAI rate limits page): all verbatim.

---

### Teaching gaps

None found. I checked every fact each graded item needs against the lessons: all 6 cases, 6 quick checks and the 5 boss questions. Each one is taught in its chapter. No wrong option became true by the docs. Only c5 Q2 "Total time falls" is at risk, and the c5 Must-fix above closes that gap.

### Rule checks

- No hype words.
- No `<DialogBox>` in any of the six lessons.
- Template order is right in all six.
- There is no real code, so no "Simplified" labels are needed.
- `minutes: 12` is honest (about 1,700–1,800 words each).

### Sources checked (all [MATCHES], fetched as `.md`)

- Claude: rate-limits, errors, batch-processing, reduce-latency, usage-cost-api, authentication, workspaces, api-and-data-retention, fast-mode, service-tiers, model-deprecations.
- Claude Code: monitoring-usage.
- OpenAI: rate-limits, production-best-practices, batch, flex-processing, reference/overview, agents/integrations-observability, latency-optimization, your-data, safety-best-practices, priority-processing (now titled "Fast mode"), deprecations.
- Gemini: rate-limits, batch-api, api-key.

## Summary: Blockers: 7 · Warnings: 7 groups (Should-fix above)

Files: `/home/user/sigmorai/.claude/worktrees/agent-a6002b003b698b43b/content/builder/08-production-peaks/c{1..6}/lesson.mdx`, `/home/user/sigmorai/.claude/worktrees/agent-a6002b003b698b43b/content/builder/08-production-peaks/c5/case.json`
