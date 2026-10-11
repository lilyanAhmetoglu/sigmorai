## voice-guardian: content/creator/06-eval-arena c1–c6 lesson.mdx (branch content/template-creator-r6 @ 9949e37)

VERDICT: must-change (3 small structure fixes; no voice, lore, hype or fact failures)

I checked every quoted string in all six lessons against the live cited pages (downloaded today). All quotes are verbatim and credited to "the <vendor> docs" or "the Anthropic post". All maths is marked "Our maths/Our example" and is correct. No lore, no "realm", no hype, no gendered pronouns, no "Next:" line. Template order, "Not graded." opener, `### Answer`, 3 Common mistakes and 3 Recap bullets are present in every file.

### MUST-FIX

1. `/home/user/sigmorai/.claude/worktrees/agent-a3860cccd6e64c918/content/creator/06-eval-arena/c1/lesson.mdx:88` — one paragraph chains 5 quotes. Rule: 3+ quotes → one per bullet. Replace lines 88 with:

```
The OpenAI docs put this first and say to do it early:

- Their process starts with "Define eval objective".
- Their tips say: "Evaluate early and often."
- They call it an anti-pattern to use "it seems like it's working" as an evaluation strategy.
- They also call it an anti-pattern to wait "until you ship before implementing any evals".

The Anthropic post says that early on, "evals force product teams to specify what success means".
```

2. `/home/user/sigmorai/.claude/worktrees/agent-a3860cccd6e64c918/content/creator/06-eval-arena/c2/lesson.mdx:57` — 3 quotes in one paragraph. Replace line 57 with:

```
The [Claude docs on evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests) say how a grader should answer:

- The output should be "Empirical or specific".
- Their example is to tell the grader "to output only 'correct' or 'incorrect', or to judge from a scale of 1–5".
- They add: "Purely qualitative evaluations are hard to assess quickly and at scale."
```

3. `/home/user/sigmorai/.claude/worktrees/agent-a3860cccd6e64c918/content/creator/06-eval-arena/c4/lesson.mdx:107` — 3 quotes in one paragraph. Replace line 107 with:

```
You could also send half of your real work to each version. The Anthropic post lists what that gives and costs:

- It "Measures actual user outcomes".
- It is "Slow; days or weeks to reach significance and requires sufficient traffic".
- It "Only tests changes you deploy".

Our advice: run the blind offline test first. Use a live test later, if you have enough volume.
```

### SHOULD-FIX

- **c1 length.** 1,855 words (target 1,400–1,700). `minutes: 11` is still honest (about 9 minutes reading plus the exercise), so no change to `minutes` if you keep it. To trim ~150 words: cut `c1/lesson.mdx:80` (the OpenAI "Biased design" line repeats the point of line 78), cut `c1/lesson.mdx:144` ("This is inside the 20-50 range..." repeats line 82), and drop the fourth bullet in Step 5 (line 159, already the whole of Step 4).
- `/home/user/sigmorai/.claude/worktrees/agent-a3860cccd6e64c918/content/creator/06-eval-arena/c5/lesson.mdx:71` — "threshold" is on the gloss list but is never glossed (used again at 167–170). Rewrite the bullet start: `- **Off unless you turn them on.** A **threshold** is the line where the filter starts to block. The page says: "If the threshold is not set, the default block threshold is **Off** for Gemini 2.5 and 3 models." ...`
- `/home/user/sigmorai/.claude/worktrees/agent-a3860cccd6e64c918/content/creator/06-eval-arena/c3/lesson.mdx:51` — three short quoted list items in one sentence. Borderline (they are one list from the source). Safer as bullets: `The Anthropic post lists the weak points of model graders:` then `- "Non-deterministic"` / `- "More expensive than code"` / `- "Requires calibration with human graders for accuracy"`, with the gloss sentence after.
- `/home/user/sigmorai/.claude/worktrees/agent-a3860cccd6e64c918/content/creator/06-eval-arena/c3/lesson.mdx:86` — the "grader hacking" quote on the OpenAI graders page is about a model being _trained_ against a grader. The lesson applies it to everyday judging. Add one honest clause: `It also warns about "grader hacking" (its example is a model in training): ...`
- `/home/user/sigmorai/.claude/worktrees/agent-a3860cccd6e64c918/content/creator/06-eval-arena/c3/lesson.mdx:143` — "Add 'Check all four edges' (already in step 3)" reads as a contradiction. Rewrite: `Say the reasons show it looked only at the centre. That is why the step 3 prompt says "Check all four edges". Add that line, run the same 40 again, and compare.`

### CLEAR

- Quotes: every `"..."` in c1–c6 found verbatim on the cited page (Anthropic evals post, Claude develop-tests, Claude define-outcomes, Claude vision, OpenAI eval best practices, OpenAI graders, OpenAI image generation, OpenAI moderation, OpenAI deprecations, Gemini safety-settings, Gemini safety-guidance, Gemini image generation). Model names (Sunburst, Flare, Nano Banana 2 Lite, Nano Banana 2.1), prices ($8 / $30 per million), size limit (3840 px, multiples of 16), defaults (`auto`, Off), dates (Oct 31 / Nov 30, 2026) and the moderation "Text only" categories all match the live pages.
- Maths: 23/5 = 4.6; 34/40 = 85%; $0.06 / $0.18; $0.02 + $0.135 = $0.155 (13%); 565/580 = 97.4%; 0.95^4 ≈ 81%; 1 − 0.2^3 = 0.992. All correct and marked as ours.
- Voice: plain, active, sentence case; one comparison per lesson; "Our advice/reading/habit" marks every own claim; "Simplified" label on the two prompt/setup code blocks (c3:123, c5:135).
- Glossed on first use: eval, criterion, rubric, grader, anchor, consensus vote, model judge, non-deterministic, calibrate, A/B test, baseline, moderation check, pass^k, pass@k, regression, suite, nondeterminism. Only "threshold" is missing (above).
