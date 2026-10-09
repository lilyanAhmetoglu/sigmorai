## voice-guardian: content/builder/08-production-peaks c1–c6 lesson.mdx (branch content/template-builder-r8, 529a968)

VERDICT: must-change (small fixes; the facts hold up)

Base path for every line below: `/home/user/sigmorai/.claude/worktrees/agent-a27184cd0e8b74a2d/content/builder/08-production-peaks/`

MUST-CHANGE

Company named as the speaker (rule: credit "the <vendor> docs")

- `c2/lesson.mdx:87` — "OpenAI says the output line order "may not match" the input order." — rewrite: "The OpenAI docs say the output line order "may not match" the input order."
- `c5/lesson.mdx:67` — "For structured output, OpenAI suggests shorter function names and less syntax." — rewrite: "For structured output, the OpenAI guide suggests shorter function names and less syntax."
- `c6/lesson.mdx:108` — "OpenAI also suggests a usage limit for each individual user." — rewrite: "The OpenAI rate limits guide also suggests a usage limit for each individual user."
- `c1/lesson.mdx:55` — "**OpenAI's rule of thumb:**" — rewrite: "**The OpenAI docs' rule of thumb:**"
- `c5/lesson.mdx:148` — "By OpenAI's rule of thumb" — rewrite: "By the OpenAI guide's rule of thumb"
- `c6/lesson.mdx:180` — "The ramp fits OpenAI's rule of thumb and ends in time." — rewrite: "The ramp fits the OpenAI guide's rule of thumb and ends in time."
- `c6/lesson.mdx:201` — "Anthropic promises 60 days' notice or more, OpenAI 6 months or more for models that are generally available" — rewrite: "The Claude docs promise 60 days' notice or more. The OpenAI docs promise 6 months or more for generally available models, and preview models can go in about 2 weeks."

Jargon not glossed on first use (the caller's named list: backoff, p95, quota)

- `c1/lesson.mdx:75` — "If the header is missing, use exponential backoff with jitter." — rewrite: "If the header is missing, use exponential backoff with jitter. Backoff means you wait longer after each failed try, for example 1 s, then 2 s, then 4 s."
- `c1/lesson.mdx:68` — first "quota" is inside the OpenAI quote and never explained; `c1:99` then uses "daily quotas" — rewrite line 99: "**Gemini daily quotas** (a quota is a fixed allowance for a period) "reset at midnight Pacific time", and preview models have tighter limits."
- `c3/lesson.mdx:85` — "**Latency as p50 and p95**, not only the average. A few very slow calls hide in an average." — rewrite: "**Latency as p50 and p95**, not only the average. p95 is the time that 95 of every 100 calls finish within; only the slowest 5% take longer. A few very slow calls hide in an average." (p95 first appears unexplained in the diagram at `c3:60`; the gloss at 85 covers it.)

SHOULD-FIX

- `c1/lesson.mdx:37` — "429" is the lesson's core term and is never glossed. Rewrite: "Some calls get a 429 error (the "too many requests" status code), but the dashboard says they are far below the per-minute limit."
- `c1/lesson.mdx:89` — "The Claude docs let you set custom spend and rate limits per workspace" — the docs describe it, the Console does it. Rewrite: "On Claude you can set custom spend and rate limits per workspace, "to protect Workspaces in your Organization from potential overuse"."
- `c1/lesson.mdx:97` — quote "not user level" has no source named. Rewrite: "**OpenAI:** the rate limits guide says limits are set at the organization and project level, "not user level"."
- `c3/lesson.mdx:106` — "OpenTelemetry" and "span" unglossed. Rewrite: "It exports metrics and events with OpenTelemetry (an open standard for sending metrics, logs and traces), and traces in beta. Each user prompt starts a `claude_code.interaction` span (one timed step inside a trace), and API calls and tool calls are its children."
- `c4/lesson.mdx:42` — 30-word sentence, and ZDR is named but not explained. Rewrite: "The school's contract with Anthropic includes zero data retention (ZDR). ZDR means the vendor keeps no prompt or answer after the reply. The school has a firm rule: no student text may stay at the vendor."
- `c4/lesson.mdx:62` — "CI" unglossed. Rewrite: "such as CI (the automated build and test system) and production services".
- `c4/lesson.mdx:65` — "identity provider" unglossed. Rewrite: "...from your identity provider (the system that proves who your service is) for a short-lived Claude token".
- `c4/lesson.mdx:71` — "secrets manager" unglossed. Add after the quote: "A secrets manager is a service that stores keys and hands them to servers at run time."
- `c4/lesson.mdx:107` — "except for Covered Models (30 days)" — the term means nothing to a learner. Rewrite: "except for Covered Models, a small set of models the docs list, which keep it for 30 days".
- `c5/lesson.mdx:115` — "horizontal scaling, vertical scaling" unglossed. Rewrite: "lists horizontal scaling (more servers), vertical scaling (bigger servers), caching and load balancing."
- `c6/lesson.mdx:99` — "The OpenAI guide separates two controls:" — the table is from the rate limits guide, and line 106 then cites the production guide. Rewrite: "The OpenAI rate limits guide separates two controls:".

CLEAR

- Facts: I fetched every cited Claude, OpenAI, Gemini and Claude Code page and checked about 120 quotes and numbers. All verbatim, including: fast mode models (Opus 5.5 / 5 / 4.8, Opus 4.7 returns an error, beta header `fast-mode-2026-02-01`), batch limits (100,000 / 256 MB; 50,000 / 200 MB / 2,000 batches per hour; 20 MB / 2 GB / 48 h), key expiry options, ZDR table, deprecation notice periods, the spend-cap 429 text (it is on the rate-limits page, which c1 also cites), Usage and Cost API notes, Priority Tier "no longer available for purchase".
- Arithmetic in every worked example checks out (12 requests, 4 × 45,000 batches, 45,000 sum, 8.3 → 5.8 → 4.3 s, 75%, four 1.5× steps).
- Template order, "Not graded." opening, `### Answer`, three Common mistakes each, no "Next:" line, no DialogBox or lore, no realm/RPG words, no hype, no gendered pronouns.
- Own advice is marked ("Our example", "Our rule", "Our habits", "Our reading of the docs"). No quote chains of 3+ in one paragraph.
- No real code, so no "Simplified" label is needed.
- Length: body words c1 1,679 · c2 1,715 · c3 1,566 · c4 1,678 · c5 1,620 · c6 1,657. `minutes: 12` is honest for all six.

WATCH

- `c1/lesson.mdx:85` "think of bursts or acceleration, not the minute total" is an inference, not a docs line. Marking it "Our reading:" would match the rest of the lesson.
- `c3/lesson.mdx:94` "The cost endpoint is daily only" was the one claim I did not find word-for-word on the page (the Priority Tier exclusion is there). Worth a glance by content-reviewer.
