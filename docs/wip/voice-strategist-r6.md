## voice-guardian: content/strategist/06-eval-arena c1–c6 (branch content/template-strategist-r6 @ 7165923)

VERDICT: must-change (3 small fixes, all in c2 and c5)

Checked every quoted phrase in the six lessons against the live source pages (fetched today). All quotes are verbatim and attributed to "the <vendor> docs" or "the Anthropic post", never to the model. The maths in c2, c4 and c6 is right. No lore, no hype, no gendered pronouns, no "Next:". Template order, "Not graded." opener, `### Answer`, one "(October 2026)" line and 2–3 Common mistakes are all in place.

### MUST-FIX

1. `/home/user/sigmorai/.claude/worktrees/agent-a1bb729ef30b1e81a/content/strategist/06-eval-arena/c2/lesson.mdx:76` — "After the fixes, the score "jumped to 95%"." — No fake facts. The post says the jump came after fixing the bugs **and** "using a less constrained scaffold", not from grading fixes alone. The same paragraph also chains five quotes. Replace the whole paragraph with:

```
**Read the answers, not only the score.** A score can be wrong because the test is wrong. The post tells how one model "initially scored 42%" on a public benchmark. A researcher found problems in the test:

- a rule that marked "96.12" wrong because it expected "96.124991…"
- unclear task descriptions
- tasks that could not be repeated the same way twice

After the bugs were fixed and the model was given a looser setup, the score "jumped to 95%". The post's rule: "Failures should seem fair".
```

2. `/home/user/sigmorai/.claude/worktrees/agent-a1bb729ef30b1e81a/content/strategist/06-eval-arena/c5/lesson.mdx:55` — "It is "Slow; days or weeks to reach significance and requires sufficient traffic"." — Unglossed jargon for a business reader (the brief names "statistical significance"). Replace with:

```
- It is "Slow; days or weeks to reach significance and requires sufficient traffic". **Significance** means the gap is too big to be luck.
```

3. `/home/user/sigmorai/.claude/worktrees/agent-a1bb729ef30b1e81a/content/strategist/06-eval-arena/c4/lesson.mdx:84` — four quotes chained in one paragraph. Replace with:

```
The [OpenAI model selection page](https://developers.openai.com/api/docs/guides/model-selection) says the same in its own words: experiment "using the same inputs" and keep "the lightest setting" that still meets your quality bar. It lists questions to ask first:

- "How often does your workflow run?"
- "How important is the quality of the result?"

A cheaper option is fine if it still meets your bar. If its accuracy falls below break-even, it loses money, whatever its price.
```

### SHOULD-FIX

- `c4/lesson.mdx` has no "Our example:" / "Our advice:" line (the other five have 1–2). Easy fix at line 88: `**Show a range, not one number.** Our advice: build a cautious, a base and a good case. ...`
- `c4/lesson.mdx:86` — "flex processing" is unglossed. Suggest: `plus its Batch API and flex processing (slower, cheaper requests)`. Backed by the OpenAI cost page ("lower costs ... in exchange for slower response times").
- More 3+ quote chains in one paragraph, same fix (bullets): `c2:64` ("faster, cheaper" / "closely calibrated" / "Unknown"), `c2:81`, `c3:70` (four quotes from the analytics page), `c3:99`, `c4:82`, `c4:86`, `c5:72`, `c6:72`, `c6:80`, `c6:82`. The worst is `c3:70`; split "Track changes in PRs per user over time" and "Compare PRs and lines of code shipped with vs. without Claude Code" into two bullets.
- `c5/lesson.mdx:66` — the last sentence ("And a big gap doesn't tell you which change caused it.") repeats the first. Cut it; that also trims c5.
- Length: c2 (1,770 incl. frontmatter), c4 (1,741) and c5 (1,783) are only 40–80 words over. No trim needed; the bullet splits above add no words. `minutes: 11–12` is honest for 1,600–1,700 body words plus the exercise.

### CLEAR

- Quotes: all 100+ quoted phrases found verbatim in the cited pages (Claude develop-tests, Claude cost page, Claude Code analytics, OpenAI eval best practices, accuracy, model selection, cost optimization, Anthropic "Demystifying evals"). The c4 table numbers (815 / 175.75 / 9.25 / 81.5%) and "5% of the failures" match the OpenAI page.
- Our own maths is marked "ours" / "our arithmetic" and checks out (break-even 81.5% and 75%, ROI 30%, payback 9.4 and 3 months, 0.9² = 81%, real-mix 89% and 92%, sensitivity table, cautious/good cases).
- Glosses present: eval, KPI, ROI, baseline, A/B test, rubric, grader, token, confound, CI/CD, CSAT, PR, drift, saturation, pass^k, position/verbosity bias, loaded cost.
- Voice: plain, active, no "realm"/RPG words, no vendor or model as speaker, no streak/urgency copy. Passes the screenshot test.
