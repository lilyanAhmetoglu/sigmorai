## voice-guardian: content/strategist/08-production-peaks/c1–c6/lesson.mdx (branch content/template-strategist-r8 @ 3b16443)

VERDICT: must-change (quote chains + two unverified new facts; voice itself is clean)

Paths below are relative to `/home/user/sigmorai/.claude/worktrees/agent-a06d87fc67e6c9e6f/`.

### MUST-FIX

**1. Quote chains of 3+ in one paragraph/bullet (rule: one quote per bullet)**

- `c1/lesson.mdx:70` (4 quotes). Replace the bullet with:
  ```
  - The [Claude Admin API page](https://platform.claude.com/docs/en/manage-claude/admin-api) says: "There are five organization-level roles."
  - The same page says a developer "Can use playground and manage API keys". An admin can do all of that, "plus manage users".
  - Its best practices include "Regularly audit member roles and permissions" and rotating keys periodically.
  ```
- `c2/lesson.mdx:87` (3 quotes). Replace the paragraph with:
  ```
  Two more controls fit the high tier:

  - **Least privilege.** The Claude jailbreak guide says to give the AI only the data and actions it needs, "so that a successful injection can do minimal damage".
  - **Test in a sandbox first.** The Anthropic engineering post [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) says: "The autonomous nature of agents means higher costs, and the potential for compounding errors." (A **sandbox** is a copy of the system where a mistake can't hurt real data.)
  - The same post recommends "extensive testing in sandboxed environments, along with the appropriate guardrails."
  ```
- `c3/lesson.mdx:53` (3 quotes). Replace with:
  ```
  **Start with your data.** The [OpenAI production guide](https://developers.openai.com/api/docs/guides/production-best-practices) says that before production you must assess "any security and compliance requirements". That means looking at the data you handle, how the API processes it, and which regulations apply.

  - It names "data storage, data transmission, and data retention" as common areas.
  - It asks for privacy protections "such as encryption or anonymization where possible."
  ```
- `c5/lesson.mdx:74` (4 quotes). Replace the bullet with:
  ```
  - The Claude workspaces page says you can set workspace limits "lower than (but not higher than) your organization's limits".
  - The same page says "Organization-wide limits always apply", and you "cannot set limits on the Default Workspace".
  - It also lets you set alerts "when spending reaches certain thresholds."
  ```
- `c5/lesson.mdx:79` (3 quotes). Replace the paragraph with:
  ```
  **Ramp traffic in steps.** Rate limits are about speed of growth too. The exact point varies by model and traffic. This is OpenAI's rule; check your own vendor's page.

  - The OpenAI rate limits page says a `slow_down` error means "Your request rate increased too quickly."
  - It "can occur even when your traffic is within its requests-per-minute and tokens-per-minute limits."
  - Its rule of thumb: "once your traffic reaches 1 million input tokens per minute (TPM), increase it by no more than 50% every 15 minutes."
  ```
- `c6/lesson.mdx:76` (4 quotes). Replace the paragraph with:
  ```
  - The page warns: "Deprecated models are likely to be less reliable than active models."
  - Customers with a live deployment get "at least 60 days' notice before model retirement for publicly released models."
  - To find where you use a model, go to the Usage page in the Claude Console and export a CSV. It shows usage "broken down by API key and model."
  - It also says to test "with the new models well before the retirement date."
  ```

**2. New facts not in the old lessons; verify against the live page before merge (rule: no fake facts)**

- `c6/lesson.mdx:133` — `gpt-5.1` "deprecated" in a 2026-10-01 entry, "will be removed from the API on April 1, 2027, with six months' notice", replacement `gpt-6-sol`. Not present in the canary version of this lesson. If the live OpenAI deprecations page does not show exactly this entry, rewrite the hard case around an entry it does show (keep the lesson logic: launch quarter starts on or after the removal date).
- `c1/lesson.mdx:61` and `:121` — the model list "Claude Fable 5.1, Claude Mythos 5.1, Claude Fable 5 and Claude Mythos 5" that "require 30-day data retention". Not present in the canary version. Confirm the names and the quoted sentence match the live retention page; if the list differs, copy the live list verbatim.

### SHOULD-FIX

- `c2/lesson.mdx:87`, `c6/lesson.mdx:65` — "Anthropic's post ... says". Company named as speaker. Use "The Anthropic engineering post [Building effective agents](...) says".
- Missing first-use glosses (business audience):
  - `c2/lesson.mdx:71` "hallucinations" → add "(a **hallucination** is a confident answer the model made up)".
  - `c3/lesson.mdx:62` "**data residency**" → add "(where your data is stored and processed)". `:58` "kept at rest" → "stored (at rest)". `:83` "ZDR" → add "(zero data retention: the vendor does not keep prompts after the reply)". `:67` "Global geography" is unexplained; say "a project with no fixed region (Global)".
  - `c5/lesson.mdx:36` "go rule" → "(the pilot result that meant 'go ahead')". `:69` "staging" → "(a copy of the live system for final tests)". `:185-186` 429/503 → after the code block add: "The OpenAI rate limits page says a 429 is a rate limit error. A 503 is an overload error, a different problem." (this sentence was in the canary version and traces to the same page).
  - `c6/lesson.mdx:25` "gate" → "(a **gate** is the check that must pass before a step starts)". `:33` "agents" → gloss once: "(an **agent** is an AI that can take actions, not only write text)".
- `c3/lesson.mdx:74` — 27-word sentence. Rewrite: "The OpenAI data controls page covers PHI too. Customers sign a Business Associate and Healthcare Addendum. Then they may use BAA-eligible endpoints, once their setup meets OpenAI's conditions."
- `c1/lesson.mdx` word count is 1,736 (frontmatter included); body is inside the target, no action needed.

### CLEAR

- No lore, "realm N", RPG or NPC talk left (all seven old "realm" asides removed in the diff). No hype words. No gendered pronouns. No "Next:" line.
- Template order, "Not graded. Write your answer down before you read the answer.", `### Answer`, 3-bullet Recap, 3 Common mistakes in every lesson.
- Strategist habits present in all six: bold inline terms, one "(October 2026)" sentence, "Our example:" / "Our advice:", own numbers marked as ours (90 days, 1 hour, 4 weeks, $5,000 maths).
- Quotes are attributed to pages/guides, not to "Claude" or "OpenAI" as speakers (except the two "Anthropic's post" lines above).
- Lengths 1,594–1,736 words; `minutes` 11–12 is honest.
- Screenshot test: reads as sober business guidance, not marketing.
