## Content review: `content/template-strategist-r8` @ 3b16443, strategist/r8 c1–c6 lesson.mdx

**VERDICT: fix before merge**

The facts are right. I checked every cited page (20 pages, raw `.md`) and every claim you asked about is supported. The schema check passes: `bun run content:check` → "every content file is valid".

The problem is mirroring. In all six lessons, the worked example and Common mistakes solve that chapter's case (and sometimes a boss question) ahead of time. Often the wording is almost the same as the correct option. A learner who reads the lesson can match the text and pass without thinking.

There is also one false contract line (c3) and one overclaim (c1).

Files: `/home/user/sigmorai/.claude/worktrees/agent-af9412950f2bea3bf/content/strategist/08-production-peaks/c{1..6}/lesson.mdx`

---

## Must-fix

### c1 (`c1/lesson.mdx`)

**M1. Line 116: overclaim.** "Rule 4 uses key expiry and role audits, which both vendors recommend." The cited OpenAI pages never recommend role audits (no "role" advice in production-best-practices or safety-best-practices). Why it matters: learners repeat claims like this to their boss.
Replace with:
`- **Rule 4** uses key expiry, which the OpenAI production guide recommends, and regular role audits and key rotation, which the Claude Admin API page recommends.`

**M2. Lines 90–117 (Steps 2–3) solve case Q1–Q4.** Each rewritten rule is the case's correct answer:

- Data: check the retention per project, no playground
- Review: per use, a manager approves money
- Access: smallest role, keys expire, quarterly role review
- Reports: a named team owns the form

Replace Steps 2–3 with:

````
### Step 2: make two rules checkable

Our example rewrite of the first two questions for the hotel group:

```text
1 Tools   Approved: OpenAI project "guest-replies" and Claude
          workspace "finance-invoices". Nothing else.
          A new project or workspace is approved only after IT
          records three things: owner, retention setting, date.
2 Data    Data class              Allowed in
          Public (menus, prices)  any approved project
          Staff rotas             approved projects
          Guest personal data     only where IT recorded the
                                  retention setting
          Card numbers            no AI tool
```

### Step 3: check each rule against the docs

- **Rule 1** names accounts, not vendors. "OpenAI is approved" would also approve the revenue manager's new project, and an OpenAI project can select None for its retention control.
- **Rule 2** sorts data by class. One line per class is easier to check than "be careful".
- **Review, access and reports** follow the same pattern: an action, an owner, and a setting where one exists.
````

Also replace Step 5 lines 137–139:

```
- **Checkable.** Each rule names an account, a data class or an owner. An auditor can see if it happened.
- **Tied to settings.** Rules 1 and 2b name the retention setting and the products it does not cover.
- **Easy to extend.** A new tool joins through one recorded check.
```

**M3. Lines 119–133 (the hard case) are boss Q1.** Both use the same setup (a ZDR org wants Claude Fable 5.1) and the same fix (legal approves 30-day retention, name the model).

- First, move the fact into The idea, after line 61: `An organization with ZDR "can make these models available in a specific workspace by enabling 30-day retention for that workspace only."`
- Then replace the hard case with:

````
### Step 4: the hard case

**The hard case is a new product, not a new project.** Finance asks to use Claude for Excel on supplier invoice sheets. The group has ZDR with Anthropic, so the team assumes the data is covered.

The Claude retention page says otherwise: "Claude for Excel: Not currently ZDR-eligible." It also lists the Claude Teams and Claude Enterprise product interfaces as not ZDR-eligible.

So the data rule needs a products line. Our example:

```text
2b Products  ZDR covers API calls from our Claude organization.
             Not covered: the vendor console and playground,
             Claude for Excel, chat products. No guest or
             supplier personal data in these.
```

Our advice: list products by name, so staff don't have to guess.
````

(Sources: retention page, "Claude for Excel: Not currently ZDR-eligible." and "Claude Teams and Claude Enterprise product interfaces: These interfaces are not ZDR-eligible.")

**M4. Lines 143–145: Common mistakes repeat correct options.**

- #1 repeats case Q1.
- #2 repeats case Q2.
- #3 repeats case Q4 ("Nobody owns the inbox. A named team should monitor…").

Replace with:

```
1. **Approving a vendor instead of an account.** "OpenAI is approved" also approves every new project anyone opens. Fix: approve named projects and workspaces.
2. **A policy with no owner or review date.** Nobody notices when it stops matching the settings. Fix: name a policy owner and a review date.
3. **Using our five questions as a legal template.** They are a course tool. Fix: legal and the data protection lead approve the final policy.
```

### c2 (`c2/lesson.mdx`)

**M5. Lines 126–137 (Step 3) copy two correct options.**

- Website assistant: "approved pages, input screened, length limited, red-teamed before launch" is case Q2's correct option.
- Deposit tool: "proposes deductions; a property manager approves each one before it is written. No other write access" is case Q3's correct option, with new names.

Replace the block with:

```text
Newsletter (low)       Author edits. Dates and amounts checked
                       against the source. Owner: comms lead.
Website assistant      Tenants log in first. Each answer links to
(medium)               the house-rule page it came from. A report
                       button goes to the digital team.
                       Owner: digital lead.
Deposit tool (high)    A tool guardrail rejects a deduction with no
                       photo or lease clause attached. A human
                       approval step pauses the run before anything
                       is written to the accounts. Owner: head of
                       accounts.
Lease summary (low)    See the hard case.
```

The facts case Q2 and Q3 need stay in The idea.

**M6. Lines 163–164: Common mistakes repeat correct options.**

- #2 repeats case Q3 (spot check vs approve first).
- #3 repeats case Q4 and quick-check Q3 (re-tier on audience change).

Replace with:

```
2. **Tiering by tool, not by use.** The same model can draft a newsletter and move money. Fix: tier each use on its own line.
3. **A register with no owner per line.** Nobody updates it, and nobody answers for a use. Fix: one named owner per use.
```

### c3 (`c3/lesson.mdx`)

**M7. Lines 132 and 109–110: false for this scenario.** The pharmacy is HIPAA-enabled, not ZDR. The suggested contract line says the provider "does not keep prompts after a reply". But the Claude retention page says HIPAA readiness applies safeguards "rather than requiring immediate deletion" (https://platform.claude.com/docs/en/manage-claude/api-and-data-retention). The lesson teaches a contract promise that is not true. That is the exact mistake this hard case warns about.

- Replace line 132 with:
  `Our advice: legal writes the contract line from the vendor's own words, with the exceptions. For example: "Our AI provider processes health data under a signed BAA. It may keep data where the law requires it, and may keep content flagged by its automated safety systems for up to 2 years." Then legal checks it against the signed agreement.`
- Replace lines 109–110 with:

```
Q2 How long   HIPAA-enabled organization, signed BAA. HIPAA
              readiness adds safeguards; it does not mean
              immediate deletion. Exceptions: see Step 4.
```

**M8. Lines 116–124 (Step 3 maths) are case Q2.** Both use the same setup (a monthly token cost at the standard rate, Claude 4.6+, US-only) and the same fix (× 1.1). Today's maths is correct: $5,000 × 1.1 = $5,500, which adds $500. The shape is the problem.
Replace Step 3 with:

````
### Step 3: add the cost

Our example maths, with made-up numbers. Legal asks for US-only processing for the prescription tool only. The order tool has no health data, so it stays on the standard rate.

```text
Order tool          $3,000 a month, standard rate
Prescription tool   $5,000 a month, standard rate
US-only uplift      1.1x on $5,000 = $500 more a month
Per year            $500 x 12 = $6,000
```

Putting the order tool on US-only "just in case" would add another $300 a month. Finance must see these numbers before launch.
````

(Check: 5,000 × 0.1 = 500; 500 × 12 = 6,000; 3,000 × 0.1 = 300.)

**M9. Lines 152–153: Common mistakes repeat correct options.**

- #1 repeats case Q3 (check the eligibility table first).
- #2 repeats case Q4 (logging on before launch).

Replace with:

```
1. **An answer with no date.** Vendor pages change, so "compliant" without a date proves little. Fix: record the date you checked each setting.
2. **IT deciding which law applies.** That is legal's job. Fix: legal names the rules; IT shows the settings that meet them.
```

### c4 (`c4/lesson.mdx`)

**M10. The hard case and the plan copy case Q2, its P1 trap and quick-check Q2.**

- Lines 130–134 (hard case): remove the developer, the workspace key keeps working, set the key to inactive.
- Lines 112–114 (Step 2 Contain): "set it to inactive, make a new key, lower the workspace spend limit. Never archive a shared workspace" is case Q2's correct option plus the P2 trap.
- Lines 44–46 (The problem): the alert to an unread team address and "delete the developer's account" are the case's Q1 and P1.

Replace lines 44–46:

```
On a Sunday, a developer copies an API key into a public code page by mistake. By Monday morning, the AI bill for the weekend is many times a normal weekend. The key sits in the company's Default Workspace, next to the keys for both tools.

On Monday nobody knows who leads. One person wants to shut down every AI tool in the company. Another wants to email all customers that "no data was affected", before anyone has checked.
```

Line 100: `- **Spot:** nobody looked at spend until Monday.`

Lines 112–114:

```
2 Contain    Leaked key: set it to inactive and make a new one.
             After that, move each tool to its own workspace
             with its own spend limit.
```

Hard case:

```
### Step 4: the hard case

**The hard case is the Default Workspace.** Someone says "lower the workspace spend limit". But the leaked key and both tools sit in the Default Workspace. The Claude workspaces page says: "You cannot set limits on the Default Workspace". The same page says the Default Workspace "cannot be renamed, archived, or deleted."

The fix: contain by the key. Set it to inactive and make a new one. Then, as a Learn action with an owner, move each tool to its own workspace, so the next incident can be capped there.
```

Also delete our phrase "the alert went to an address". It is 30+ characters shared with case Q1's correct option.

**M11. Lines 144–146: Common mistakes repeat correct options.**

- #1 repeats case Q1.
- #2 repeats case Q2.
- #3 repeats boss Q3.

Replace with:

```
1. **No owner named before the incident.** On the day, people argue about who leads. Fix: name an owner and a deputy for each AI use now.
2. **One shared key for every tool.** When it leaks, turning it off stops everything. Fix: one key per tool, so you can turn off just one.
3. **Testing the plan for the first time in a real incident.** Gaps show up when it costs most. Fix: walk through it once a year with a made-up case, like a fire drill.
```

### c5 (`c5/lesson.mdx`)

**M12. Lines 140–153 (Step 3) contain four of the case's correct options.**

- "Development, staging, production; testers only in development and staging" is case Q2.
- "Below the organization limit, near expected cost, alerts" is case Q3.
- "Trigger / action / fallback, old templates kept" is case Q4.
- "Offices start on different days" is case Q1.

Replace with:

````
### Step 3: one check per part

Our example. Each line names who checks and where the result is written:

```text
Before each wave          Checked by        Result goes to
  Controls tested         IT security       wave log
  Test area in use        platform lead     wave log
  Limits and alerts set   finance partner   wave log
  Start times spread      office managers   wave log
  Way back written        wave owner        wave log
```

The wave owner signs the log before the wave starts. A blank line means the wave waits. The roles are our own choices.
````

**M13. Lines 174–176: Common mistakes repeat correct options.**

- #1 repeats boss Q4.
- #2 repeats case Q3.
- #3 repeats case Q4.

Replace with:

```
1. **Training as the only preparation.** A video does not test settings or limits. Fix: train, and also run the checks before each wave.
2. **A stop rule nobody measures.** "Too many errors" with no number never fires. Fix: write the number and where it is measured.
3. **Counting usage as success.** The ChatGPT usage and cost guide says: "Usage alone doesn't establish savings". Fix: compare against the group's baseline before you expand.
```

### c6 (`c6/lesson.mdx`)

**M14. Lines 131–137 (the hard case) are case Q1.** Both use the same setup (an item's model retires before its launch) and the same fix (plan on the replacement and test it first). The gpt-5.1 fact is correct. Keep it in The idea as an example after line 78:
`For example, its 2026-10-01 entry says `gpt-5.1` "will be removed from the API on April 1, 2027, with six months' notice."`

Replace the hard case:

```
### Step 3: the hard case

**The hard case is the review rhythm.** The model-change row says "each half year". The Claude deprecations page promises "at least 60 days' notice before model retirement for publicly released models". The OpenAI page lists "At least 3 months" for specialized variants. So a notice can arrive, and the model can retire, between two half-year checks.

Our fix: the OpenAI page says it notifies "customers who are actively using the model by email". Send vendor notices to the row's owner, not a shared inbox. A notice starts an early review that week. The half-year check stays, to catch what the notices miss.
```

In Step 2 (line 112), change the essay item to `Needs first: none known; model on the model-change row`. Then the essay item does not hint at case Q1.

**M15. Lines 147–149: Common mistakes repeat correct options.**

- #1 repeats case Q3 (start simple).
- #2 repeats case Q2 and Q3 (own line and owner).
- #3 repeats boss Q5 (Stopped list).

Replace with:

```
1. **Dates with no uncertainty shown.** The board reads a Later date as a promise. Fix: label Later items "no promise".
2. **Checking only one vendor's deprecation page.** Two vendors means two calendars. Fix: the model-change row lists every model and both pages.
3. **No measure of value.** An item can't show it worked, so it can't pass a gate. Fix: write how you will measure value before it moves to Now.
```

---

## Should-fix

- **c1 line 46 and c2:** fine. No hype and no DialogBox in any of the six lessons.
- **c2 line 87, c6 line 65:** "Anthropic's post … says" credits the company. Change to "The Anthropic engineering post [Building effective agents] says".
- **c2 Step 2 / c5 Step 2 / c6 Problem + Step 2:** these teach the same model the case tests (a 4-use register; a wave with gate/stop/owner, as in boss Q4; a 4-item roadmap with an agent team and a high-tier item with no approval). They are not word-for-word, but the shape is close. If you want a strict pass, change the setup to new uses (for example, other kinds of items than "agent team" and "pays claims").
- **c3 line 106–107:** delete "Every key in it runs in the US." It pre-answers case Q1.
- **c3 line 67, a teaching gap for boss Q2.** The boss option says "EU domain prefix", but the lesson never says "prefixed domain". Replace with: `You can also choose regional processing for one request: send it to the prefixed regional domain with a key from a project that has Global geography. That changes where the request runs, not where the project stores data.` Source: "select regional processing for an individual request by using the prefixed domain with an API key from a project having Global geography" (https://developers.openai.com/api/docs/guides/your-data).
- **c4 lines 77 and 132:** add the exception. The Admin API page says: "In the Claude Code workspace, each key is bound to the member who created it and stops working when that member is removed." Suggested text: "a workspace key (outside the Claude Code workspace) does not stop…".
- **c4 line 139: "A key can be made active again".** This is true, but not on a cited page. The status enum `"active" or "archived" or "inactive"` is on https://platform.claude.com/docs/en/api/admin/api_keys/update. Add that page to sources, or soften the line.
- **c5 line 36:** our phrase "an AI assistant that drafts l…" shares 30 characters with the boss scenario. Use `Forty accountants tested an AI tool that writes first drafts of tax letters to clients.`
- **c5 line 65:** the ChatGPT quote "Test an action the policy should allow…" comes from Step 8, about Local computer access with Work Cloud. Say "for example, the ChatGPT admin rollout guide says, for local computer access:" so the context is honest.
- **Outside this diff (FYI):**
  - c5 `case.json` Q1 asks what "OpenAI's rate limits page" warns, but the scenario says the tool calls the Claude API.
  - c4 `quick-check.json` Q1 option C: the OpenAI guide does document hard spend limits. The question still holds, because it asks about _spotting_.

---

## Supported (quote + URL)

**c1**

- ZDR is per organization: "ZDR is enabled per organization; each new organization requires ZDR to be enabled separately… does not automatically extend to other organizations under the same account." (Claude retention page)
- The Console is not covered: "Any usage in the Claude Console, including playground."
- The 30-day exception: "Claude Fable 5.1, Claude Mythos 5.1, Claude Fable 5, and Claude Mythos 5: These models require 30-day data retention and are not available under ZDR unless expressly authorized by Anthropic." The workspace path: "enabling 30-day retention for that workspace only."
- OpenAI project controls: "select `default` to inherit the organization-level setting… or select **None** to disable these controls for that project." (https://developers.openai.com/api/docs/guides/your-data)
- OpenAI key lifetime and types: "We strongly recommend setting an expiration date…"; "Project limits cannot exceed the organization limit."; "allow only service-account keys, allow only user-owned project keys, or disable all new API key creation… These controls apply only to new key creation; existing API keys are unaffected." (production-best-practices)
- Claude roles: "There are five organization-level roles."; developer "Can use playground and manage API keys"; admin "plus manage users"; "Regularly audit member roles and permissions". (admin-api)
- Review and reporting: "Wherever possible…", "especially critical in high-stakes domains, and for code generation", "This method should be monitored by a human…" (safety-best-practices)

**c2**

- Guardrail types match the OpenAI table verbatim: "Block disallowed user requests before the main model runs | Input guardrails", "Validate or redact the final output…", "Check arguments or results around a function tool call", "Pause before side effects like cancellations, edits…". Also "pauses the run so a person or policy can approve or reject a sensitive action."
- Claude: harmlessness screen "before it reaches your main conversation"; least privilege "so that a successful injection can do minimal damage"; hallucinations "don't eliminate them entirely. Always validate critical information, especially for high-stakes decisions."
- OpenAI safety: input/output limits, validated materials, KYC, red-teaming. All supported.
- Building effective agents: "higher costs, and the potential for compounding errors" and "extensive testing in sandboxed environments". Supported.

**c3**

- Inference geo vs workspace geo: "Two independent settings"; workspace controls "enforce geo policies across all keys in a workspace"; "Workspace geo is set when you create a workspace and can't be changed afterward. Currently, "us" is the only available workspace geo."
- "Rate limits are shared across all geos."
- Older models "return a 400 error".
- "US-only inference… is priced at 1.1x the standard rate" for Claude 4.6+ models. (data-residency)
- OpenAI residency is per project: region set "when creating a new project"; non-US needs "a Modified Retention amendment"; "does not apply to system data" (the examples include usage statistics and billing information); "charged a 10% uplift for models released on or after March 5, 2026".
- BAA: the Claude page says "Your signed BAA is the official source of truth…" and gives a `400` for non-eligible features. OpenAI's text on the Business Associate and Healthcare Addendum plus "Endpoint and feature limitations listed on this page still apply." Both supported.
- Audit logs: "Recording is not retroactive… not backfilled"; "retained for 6 years". OpenAI: "list recent user actions and configuration changes".
- Retention exceptions: "required by law or… flagged… up to 2 years".
- The maths $5,000 × 1.1 = $5,500 (+$500) adds up.

**c4**

- Removing a person: "Personal keys stop working when their user is removed… Workspace API keys continue to work." The API "can only read, rename, and change the status of existing keys". Archiving a workspace "cannot be undone".
- Per-user identifiers: `metadata.user_id` "should be a uuid, hash value, or other opaque identifier… Do not include any identifying information such as name, email address, or phone number." OpenAI: "Hash the username or email address…"; "you can send a session ID instead"; "respond to abuse faster".
- Also supported: spend alerts, "throttling or banning", "Regularly analyze outputs…", and "revoke it promptly and replace it with a new key".

**c5**

- 429 vs 503: `429 | slow_down | Your request rate increased too quickly. | Follow Retry-After… reduce your request rate, and then increase it gradually.` and `503 | server_is_overloaded | The requested model is temporarily overloaded. | … increase the delay between retry attempts.`
- "can occur even when your traffic is within its requests-per-minute and tokens-per-minute limits"; the 1M TPM / 50% / 15 minutes rule of thumb; limits are set per organization and project, "not user level".
- Claude workspaces: "lower than (but not higher than)"; "Organization-wide limits always apply"; "cannot set limits on the Default Workspace"; the Claude Code workspace "is the only workspace that supports per-user monthly spend limits"; dev/staging/prod table.
- Also supported: `/status` → `Enterprise managed settings`, and the ChatGPT rollout and baseline lines.

**c6**

- gpt-5.1: "The following models are deprecated and will be removed from the API on April 1, 2027, with six months' notice." Table row: `Apr 1, 2027 | gpt-5.1 | gpt-6-sol`.
- OpenAI notice periods: "Generally available models: At least 6 months."; "Specialized variants…: At least 3 months." (Codex example given); preview "may be retired with much shorter notice, such as 2 weeks"; "Unless safety or compliance concerns require a faster timeline…"; email + page + "blog posts for larger changes".
- Claude: the four states quoted verbatim; "at least 60 days' notice"; CSV "broken down by API key and model"; "well before the retirement date".
- Agents post: "simplest solution possible" and "trade latency and cost".

**Teaching coverage**
Every fact needed by case Q1–Q4, quick-check Q1–Q3 (c1–c6) and boss Q1–Q5 is taught in its lesson's The idea section. There is one gap: c3 does not name the "prefixed domain" (see Should-fix).

No wrong option became true after the rewrite.

Try it sections: c1, c2, c3, c5 and c6 are distinct from the graded questions. c4's Try it is fine.

## Sources checked

All 20 cited URLs returned content and **[MATCHES]**: the Claude pages (api-and-data-retention, admin-api, workspaces, data-residency, compliance-activity-feed, messages/create, mitigate-jailbreaks, reduce-hallucinations, model-deprecations); the Claude Code docs (admin-setup); the Anthropic engineering post (building-effective-agents); the OpenAI pages (your-data, production-best-practices, safety-best-practices, agents/guardrails-approvals, admin-apis, rate-limits, deprecations); and the ChatGPT pages (enterprise/admin-setup, chatgpt-work-usage-and-cost). Each lesson has at least one Anthropic and one OpenAI page.

## Summary: Must-fix 15 (1 false claim, 1 overclaim, 13 mirror/leak) · Should-fix 9
