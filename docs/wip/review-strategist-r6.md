## Content review: branch `content/template-strategist-r6` @ 7165923 (strategist r6, c1–c6 lesson.mdx)

**VERDICT: fix before merge.** There are 2 small Must-fix items. Everything else is solid.

**Checks I ran**

- `bun run content:check` is green.
- Ids and `sources` did not change. Only `minutes` went up (7–8 → 11–12).
- Every lesson cites at least one Anthropic page and one OpenAI page.
- I fetched all 8 cited pages as `.md` or HTML and searched each quote word for word.
- No hype words, no `# ` heading, no "Next:" line.
- Quotes are credited to "the Claude docs", "the OpenAI guide" or "the Anthropic post". None is credited to the model.
- No lesson has 30 or more characters of wording in common with any case, quick check or the boss.
- shared-chapters.json has no strategist/r6 member, so there is no twin to check.
- No lesson makes a claim about the OpenAI Evals platform. The cited OpenAI guide shows the banner ("read-only for existing users on October 31, 2026 … shut down on November 30, 2026"), but the lessons only use its general advice. That is fine.

### Must-fix

**1. c2 line 76 says the bug fixes alone lifted the score to 95%. The source says two things changed.**
This matters because learners would think fixing the grading alone gave a 53-point jump.

- Source quote: "After fixing bugs and using a less constrained scaffold, Opus 4.5's score jumped to 95%." (https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- Replace `After the fixes, the score "jumped to 95%".` with:
  `After the team fixed the bugs and loosened the test setup, the score "jumped to 95%".`

**2. c5 breaks its own "go" rule.**
The rule at line 112 is: "go = first-call solve up 5 points or more, **no guard number worse**". In the result, wrong advice went from 2 to 6, so a guard number got worse. The result was never a "go". This matters because learners may think one good main number is enough for a "go".

- Line 133: replace `The main metric rose 6 points, which passes the "go" bar. But wrong advice in the call sample went from 2 to 6.` with:
  `The main metric rose 6 points, which clears the 5-point part of the "go" bar. But wrong advice in the call sample went from 2 to 6, so a guard number got worse.`
- Line 139: replace `They turned a "go" into a better "fix".` with:
  `They showed the result is a "fix", not a "go", and why.`

### Should-fix

**1. c6 Try it (lines 160–176): the numbers don't match the headline, and a claim band is missing.**

- 480 + 17 = 497 of 521 is 95.4%, not the "94%" in the draft summary.
- Claims from $500 to $2,000 are not in the data at all, but the lesson teaches "test the real mix".
- Suggested data block:
  ```
  Target agreed in advance: 95% correct on all claims
  Claims under $500:     480 of 500 drafts correct (96%)   measured
  Claims $500–$2,000:    not tested
  Claims over $2,000:     17 of 21 drafts correct (81%)    measured
  3,100 hours saved: vendor's calculation
  ```
- Change the summary to "The tool is 95% accurate …".
- Add to the Answer's evidence line: "Claims from $500 to $2,000: not tested yet."

**2. c3 Try it is close to the c3 case.**

- The Try it rehearses the same three moves as case Q1, Q2 and Q4: a chats/messages dashboard, a thumbs-up rate from a few voters, and a guard number.
- Answer 2 ("one signal, not everyone's view") is a near paraphrase of the case's correct option ("use it as one signal, not as everyone's view").
- At minimum, line 180 should read: `**It comes from 2% of users** who chose to vote. Few people voted, so it is not a fair picture of all users. Read the comments for real problems.`

**3. c3 line 168: the baseline row doesn't make sense.**
"Questions answered without staff 58% (email team …: 71%)" compares the bot to an email team, but an email team _is_ staff. Suggested row: `Questions fully answered          58%  (email team, same question types: 71%)`. Then change "answer rate" on line 181 to "full-answer rate".

**4. c2 code-check examples are close to the c2 case answer.**
Line 45 ("is the word count under 100?", "does the note contain the account number?") and Step 2 (80 words, account number) use the same pair of rules as the c2 case's brand rules (100 words, product code). Change them to other rules, for example "does the note include the call date?" and "is the offer one of our 6 offers?".

**5. c4 line 84 calls the OpenAI page "the same" when it is only related.**
The model selection page says to experiment "using the same inputs" and keep "the lightest setting that meets your quality bar". It does not talk about cost per completed task. Change `says the same in its own words` to `makes a related point`.

**6. c4 line 133 needs a label on the monthly ROI.**
The ~30% leaves out the $33,000 set-up, but the lesson says "count every cost". Add: `(running costs only; set-up is in the payback line)`.

**7. c4 line 152 is too broad about small samples.**
It says time saved and damage found both "rest on small samples". Only damage is labelled "small sample". Time saved is only "measured in the pilot". Either add "(small sample)" on line 111 or reword line 152.

### Supported (verbatim quote found on the cited page)

- **Claude docs, develop-tests:**
  - the four qualities (specific, measurable, achievable, relevant) and both quoted lines
  - the "Safe outputs" vs "Less than 0.1% … 10,000 trials" example
  - "multidimensional evaluation"
  - the 8 criteria headings, task fidelity to price
  - the 4-target sentiment example and the "In reality …" footnote
  - "mirror your real-world task distribution" and the 3 edge cases
  - the grader ranking and its 3 quotes
  - "'correct' or 'incorrect' … 1–5"
  - Accuracy, response time and implicit measures
  - "A/B testing: Compare performance against a baseline …"
- **OpenAI eval best practices:**
  - "vibe-based evals"
  - the three meanings of "evals"
  - "Generative AI is variable"
  - position bias and verbosity bias
  - "pairwise comparison or pass/fail"
  - "Control for response lengths"
  - "rubrics are clear and detailed"
  - "faster, cheaper, and consistently agrees with human annotations"
  - "Biased design …"
  - "Combine metrics with human judgment"
  - "70+% positively rated answers"
  - "run evals on every change …"
  - "Log everything"
- **OpenAI accuracy guide:**
  - "$1000 rather than $100" and "rough picture"
  - the $20 / $40 / $1000 values and the 5% figure
  - the full table: 815 / 175.75 / 9.25 / +20 / 81.5%
  - "even 85% could be ok"
  - the fraud case, "human would drive", "decision accuracy stat"
  - CSAT, decision accuracy and time to resolution
- **Claude cost page:**
  - "Price lists are written per token"
  - "cost per completed task"
  - "fewer turns … less backtracking"
  - "hardest tenth"
  - "a failed task still bills …"
  - "ranking flips by workload …"
  - "Batch API takes 50% off every token … within 24 hours"
- **OpenAI model selection:** "same inputs", "lightest setting …", and both quoted questions.
- **OpenAI cost optimization:** the three strategies, plus Batch API and flex processing.
- **Claude Code analytics:**
  - "excludes rejected suggestions and does not track subsequent deletions"
  - the accept rate
  - the "Measure ROI" bullets: PRs per user, with vs. without, alongside other engineering KPIs
  - "deliberately conservative … underestimate … high confidence"
- **Anthropic evals post:**
  - the eval definition
  - "force product teams …", the two engineers, and the PM / customer success / sales people
  - "judiciously", "closely calibrated", "Unknown"
  - "20-50 simple tasks", the manual checks / bug tracker / support queue
  - "two domain experts", balanced sets and the search example, the reference solution
  - pass^k and "customer-facing agents"
  - the 42% → 95% story (but see Must-fix 1), "Failures should seem fair"
  - capability evals vs regression evals, and graduating to catch drift
  - "latency, token usage, cost per task, and error rates"
  - the feedback pros and cons
  - the Swiss Cheese model and the method stages
  - the A/B pros and cons
  - "face value"
  - "An eval at 100% …"

**Maths: all correct.**

- c2: 0.9² = 81%, 0.9³ ≈ 73%, 28 of 40 = 70%.
- c3: 0.9% → 2.8% is about 3×; 12 → 40 is more than 3×.
- c4: vendor $30,000; base +$3,500; ROI ≈ 30%; payback 9.4 months; all 4 sensitivity rows; cautious −$5,000 and good +$8,500.
- c4 Try it: break-even 75%, $8,000 a month, 3 months, plus plan $13,000.
- c6: 89%, 92%, $4,500 net, range $3,500–$5,500, $10,000 a month.

**Our own advice is labelled as ours:**

- c3: the three layers and "guard numbers"
- c4: the formulas, the benefit rules, the range method
- c5: the six rules and the four questions
- c6: the report structure, the weighting, the money habits

**Teaching gaps: none.** Every fact needed by the 6 cases, 6 quick checks and the 5 boss questions is taught in its lesson:

- c1: edge cases, for boss Q1
- c2: balanced sets, for boss Q2
- c4: count only the volume that costs you, divide by 60, paid backlog work, for boss Q3
- c5: a random draw can't separate two changes, and a big gap doesn't show the cause, for boss Q4
- c6: ask first, scope fitted to risk, for boss Q5

**Answer keys: all match the sources.** No wrong option became true after the rewrite. For example:

- c1: "Leave wording out" is still wrong, because the lesson keeps cheap mistakes in the test with a looser target.
- c5: "Compare Group A with its own September" is still wrong, because the lesson says comparing a group with its own past measures the season too.

## Summary: Blockers: 2 · Warnings: 7

Files reviewed: `/home/user/sigmorai/.claude/worktrees/agent-a8f8e37f78788f2d6/content/strategist/06-eval-arena/c1/lesson.mdx` to `c6/lesson.mdx`, plus that folder's `case.json` and `quick-check.json` files and `boss/case.json`.
