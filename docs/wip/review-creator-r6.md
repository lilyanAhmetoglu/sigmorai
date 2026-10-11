## Content review: `content/template-creator-r6` @ 9949e37, creator/06-eval-arena c1–c6 `lesson.mdx`

VERDICT: **fix before merge**

The facts are fine. I fetched 12 cited pages and found 0 false facts. Every quoted line in the 6 lessons appears word for word in its cited page, and every worked number adds up. The problem is different: five worked examples and one Try it do the same job as a graded question, so the lesson gives the answer away before the quiz. c1 (vibe-based term) and c5 (Try it Q3, BLOCK_LOW_AND_ABOVE) also need a small Idea line.

- `bun run content:check`: green.
- Source rule: every lesson has at least one Anthropic page and one OpenAI page.
- No hype words, no `<DialogBox>`. No line credits a quote to a model or a company ("Claude says"). All say "the X docs", "the Anthropic post" or similar.
- Line numbers below are per file.

---

## Must-fix (exact replacement text)

**M1. c1:146–152. The Step 4 hard case copies c1 case Q5.** Both use a size over 3840 px, both kits fail, the answer is "broken test". The Idea section (line 96) still teaches the 3840 fact, so you can swap the hard case. Replace Step 4 with:

> ### Step 4: the hard case
>
> **The hard case is test 27.** Its brief says: "The fox at the market, in his usual clothes." The art lead marks the new kit's spread a pass. The editor marks the same spread a fail: she reads "usual" as the yellow coat, and the fox wears only a scarf.
>
> The weak reading: "One of them is wrong. Let the art lead decide." The better reading: the brief is unclear, so two experts cannot reach the same verdict. The Anthropic post says "Ambiguity in task specifications becomes noise in metrics." The test is broken, not the kit.
>
> Fix the test, and write down why. Our fix: "The fox at the market, in the yellow coat from the character sheet." Now both mark the spread a fail, for the same reason. Our advice: never drop or change a test without a short note. The note shows the team what was wrong and why.

Line 159: replace with `- **An unclear test is caught.** Nobody blames the kit for a vague brief.`

The quote was checked: it is verbatim on the Anthropic post page.

**M2. c2. The worked example copies 3 case questions.**

- Step 2 (lines 107–109) copies case Q2 (draft from approved work).
- Step 4 (130–143) copies case Q3 and boss Q1 (a must-have failure the average hides, so add a gate).
- Step 5 (145–152) copies case Q4 (reviewers differ, fix the wording, run another round).

Do this:

- Delete Step 2. The Idea section already teaches it at line 51.
- Replace Step 4 with:

> ### Step 4: the hard case
>
> **The hard case is two failed covers.** Both fail, but not in the same way. The scores are our example.
>
> ```text
>         Cover A                        Cover B
> G1      yes                            no  (show name misspelled)
> G2      yes                            no  (episode 41, not 14)
> G3      no  (name unreadable at 200x200)  no
> W1      5                              2
> W2      4                              2
> Result  FAIL                           FAIL
> ```
>
> The weak reading: "Both failed, so redo both from zero." The better reading: keep the line-by-line result. Cover A misses one gate, and its weights add up to 9. Making the show name bigger is one fix. Cover B fails every gate and its weights add up to 4, so the prompt itself needs work. Neither ships, but they go to different queues. This is partial credit: the result shows how far each image is from a pass.

- Delete Step 5. Then add this at the end of "Test the rubric on people" (after line 95), so case Q4 is still taught:

> Our habit: three reviewers score the same set alone. Where two differ by 2 points or more on a line, talk about those images, fix the wording or add an anchor, then score a fresh set.

- Line 159: replace with `- **Line-by-line results** show a near miss apart from a far miss.`

**M3. c3:125–147. The Step 4 calibration copies case Q1, and the Step 5 rerun copies case Q4.** Case Q1 is about 22 of 30 agreement with a lenient judge. Case Q4 is about flipping grades, so tighten the line.

Replace Steps 4 and 5 with:

> ### Step 4: the hard case
>
> **The hard case is the UNKNOWN pile.** A person has already marked 40 icons on the "no stray letters" line. The judge from step 3 grades the same 40. The numbers are our example.
>
> ```text
> PASS     26
> FAIL      5
> UNKNOWN   9
> Total    40
> ```
>
> The weak reading: "UNKNOWN means the judge found no letters, so count those 9 as passes." The better reading: UNKNOWN is the way out working as planned. The judge is saying "I can't tell", so a person decides those 9. Read the judge's reasons first: 7 of the 9 say there are thin marks along one edge. The person checks the 9 and finds stray letters on 4. Counting UNKNOWN as PASS would have shipped those 4 icons.
>
> Then improve the line, not the count. Add one sentence to the prompt: "Thin marks along an edge that could be letters count as text." Run the same 40 again. Our habit: track how many icons land in UNKNOWN. If the pile stays big, the line needs an anchor image.

Add after line 88, so case Q1 and Q4 are still taught:

> Our advice: count the two kinds of mistake apart. A judge can pass work a person failed (too lenient), or fail work a person passed (too strict). Both lower the same overall agreement, so one agreement number cannot tell you which one you have. For a quality gate, the lenient mistake usually costs more, because the bad work ships.
>
> The same judge can grade the same image differently on another run. Our habit: run the judge two or three times on the same set. If a line's grades keep flipping, the wording is too loose. Tighten it or add an anchor image.

- Line 153 (Step 6): add `- **UNKNOWN goes to a person**, never to PASS.`
- Line 157: replace "85% can hide a judge that lets most bad work through." with "A high overall agreement can hide a judge that lets bad work through."

**M4. c4:140–154. The Step 4/5 small-gap reading copies case Q5.** Q5 is 54 vs 46, small gap, call it a tie. Line 103 already teaches the tie rule, marked as ours. Replace Steps 4 and 5 with:

> ### Step 4: write the decision rule first
>
> ```text
> Clear win:  one kit preferred in 30 or more of 40 pairs,
>             AND it passes every must-have gate.
> Otherwise:  keep the current kit and test again later.
> ```
>
> The numbers are our example.
>
> ### Step 5: the hard case
>
> **The hard case is a clear win that breaks a gate.** The blind result: v2 preferred 33 times, v1 5 times, no difference 2 times (33 + 5 + 2 = 40).
>
> The weak reading: "v2 wins, switch today." The better reading: 33 is above the 30 the team wrote down, so the preference part is met. Then the desk checks the gates. On 4 of the 40 briefs, v2 drops the city name from the map label. v1 never does. A gate is a must-have, so by the rule v1 stays. The desk fixes the label line in v2's style block and runs the same 40 briefs again.

Line 160: replace with `- **The rule came before the result**, so a strong preference cannot hide a broken gate.`

**M5. c4:172–182. Try it has the same shape as case Q4.** Both turn `usage` tokens times a rate into a cost per image. Replace the Try it body and answer with:

> An editing job on a GPT Image 2.5 model sends reference images. The response `usage` shows 1,500 image input tokens per job, on average. The studio's budget is $0.15 per job. Leave text input out. Use the rates from the OpenAI image docs above.
>
> 1. What does the image input cost per job?
> 2. How much of the budget is left for image output?
> 3. About how many image output tokens can each job use and stay in budget?
>
> ### Answer
>
> 1. **$0.012.** 1,500 / 1,000,000 x $8 = $0.012.
> 2. **$0.138.** $0.15 - $0.012 = $0.138.
> 3. **About 4,600.** $0.138 / $30 x 1,000,000 = 4,600. This is our maths; read your own `usage`. If you counted only output, you would think 5,000 tokens fit, and every job would go over budget.

The maths was checked: 0.15 / 30 × 1,000,000 = 5,000, and 0.138 / 30 × 1,000,000 = 4,600.

**M6. c5:137–149. The Step 5 per-set reading copies boss Q4.** Boss Q4 is "overall 97% hides weak hard sets, so judge by the worst set". Replace Step 5 with:

> ### Step 5: the hard case
>
> **The hard case is the second run.** Step 4 runs every set twice. Here is the edge set. The numbers are our example.
>
> ```text
> Edge set, 120 briefs
> Run 1:  117 safe
> Run 2:  116 safe
> Briefs unsafe in at least one run: 7
> ```
>
> The weak reading: "Run 1 is 97.5%, so edge passes." The better reading: a brief that made one unsafe frame can make one again. Count a brief as safe only if it was safe in every run: 120 - 7 = 113 of 120, which is 94.2%. That is below the 97% target. The Gemini guidance says "Multiple rounds of testing may be needed to catch more of the problematic outputs." A person reviews the 7 briefs, and the team writes 10 more like them for the next round.

The maths was checked: 117/120 = 97.5%, 113/120 = 94.2%, and 3 + 4 = 7 unsafe briefs is possible.

Then add after line 57, so boss Q4 is still taught:

> Read the results set by set. The guidance says that with more than one metric, "you may want to focus on worst-case performance across your evaluation set rather than average performance." Our habit: report each set on its own line. A big easy set can lift the overall rate and hide a weak hard set.

**M7. c5:171 and 177. Try it Q3 copies case Q3.** Case Q3 is "Now all severe hateful content is blocked" with the answer "probability, not severity".

- Line 171: replace Q3 with `3. They now want to block dangerous content even at a low probability. Which API value does that, and what is it called in Google AI Studio?`
- Line 177: replace the answer with `3. **`BLOCK_LOW_AND_ABOVE`**, shown as Block most. It blocks low, medium and high probability. It still works on probability, not severity, so keep testing with your own edge and adversarial briefs.`
- Line 71: add `` `BLOCK_LOW_AND_ABOVE` (Block most) blocks low, medium and high. `` The Gemini page table says: "Block most | `BLOCK_LOW_AND_ABOVE` | Block when low, medium or high probability of unsafe content".

**M8. c6:136–147. The Step 4 set-of-four maths (0.95⁴) copies case Q3 (0.9³, set of 3).** Line 268 still teaches pass^k with the Anthropic post's own example. Replace Step 4 with:

> ### Step 4: the hard case
>
> **The hard case is the "harmless" edit.** A designer adds "gold foil look" to the style block. It only changes colour, so she wants to re-run just the colour jobs. The team's rule says: run the whole regression list on every change. The numbers are our example.
>
> ```text
> Job    What it checks            Before    After the edit
> R-01   two initials with "&"     20 of 20  11 of 20
> R-02   three initials, script    20 of 20  20 of 20
> R-03   wreath, sage green only   20 of 20  20 of 20
> ```
>
> The weak reading: "The colour job passes, so the edit is safe." The better reading: R-01 has nothing to do with colour, and it broke. The "&" now goes missing in 9 of 20 runs. You do not need to know why to see it. A run of only the "related" jobs would have missed it. Our advice: run the full regression list on every change, because you cannot predict what a prompt edit touches. Then fix the style block and run the whole list again.

Line 180 (Recap): replace "so 95% per image is about 81% for a set of four" with "in the Anthropic post's example, 75% per try is about 42% for three tries".

---

## Should-fix

**S1. c1:88. Teaching gap for QC Q3.** QC Q3 uses the name "vibe-based eval", but the lesson never says it. Replace "The same docs call it an anti-pattern to use … any evals"." with:

> The same docs name an anti-pattern "Vibe-based evals": using "it seems like it's working" as an evaluation strategy, or waiting "until you ship before implementing any evals".

The page says: "Vibe-based evals: Using "it seems like it's working" as an evaluation strategy, or waiting until you ship before implementing any evals." Source: developers.openai.com/api/docs/guides/evaluation-best-practices

**S2. c3:86. Grader hacking is missing its context.** The page is about models _being trained_: "Models being trained sometimes learn to exploit weaknesses in model graders…". Replace the clause with:

> It also warns about "grader hacking": a model being trained can learn to exploit a model grader, so it scores high there "but score poorly on expert human evaluations".

**S3. c4:39, 114–115 and 164. The Problem and Step 1 use the same high-vs-auto mismatch as case Q2.** Common mistake 1 says the case answer again.

- Line 39: "v2 runs at size `1536x1024`. v1 ran at `1024x1024`."
- Lines 114–115: `v2: this week's 6 articles, size 1536x1024` and `v1: last month's articles, size 1024x1024`.
- Line 164: `1. **Different settings on each side.** The test compares settings, not versions. Fix: write size and quality into the plan, the same on both sides, and never leave one side on `auto`.`

---

## Supported (checked against the live pages)

- **3840 px (c1):** "neither edge may exceed 3840 pixels". The fix 2560x1280 meets every rule on the page: multiples of 16, ratio between 1:3 and 3:1, pixel total between 655,360 and 8,294,400. Case Q5 is correct: 4096 breaks both the edge rule and the pixel total.
- **Criterion traits (c1):** Specific, Measurable, Achievable and Relevant are verbatim from the Claude develop-tests page. So are the 0.1% / 10,000-trials line and the common criteria (Consistency, Tone and style, Latency, Price).
- **Rubric gates and anchors (c2):** "weighted … binary … or a hybrid" (Anthropic post). "show rather than tell … (e.g., 1, 3, and 8 out of 10)" and "Include a pass/fail threshold" (OpenAI docs). The outcomes page says "per-criterion scoring" and calls the feature beta. 23/5 = 4.6 is correct.
- **Model-grader numbers (c3):** the old example (29 + 5 = 34/40 = 85%, 34 passes, 6 wrong) adds up. Case Q1 (22/30, 24 passes, 8 wrong) and Q2 (B wins 70 + 32 = 102/200) add up. Grader types, "Test to ensure reliability first then scale", "with thinking on", "Position bias … verbosity bias" and "give the LLM a way out" are all verbatim.
- **A/B reading (c4):** "35 of 40 clear, 22 of 40 is a tie" is clearly marked as ours ("Our rule for a studio…", "The numbers are our example"). The Anthropic post backs it: "large effect size means small sample sizes suffice", "More mature agents may need larger, more difficult evals to detect smaller effects". 22 + 16 + 2 = 40.
- **Cost (c4):** "$8 per million image input tokens … $30 per million image output tokens", "Equal token rates don't mean equal cost per image", "Both default to `auto`" (quality). The old Try it maths is also correct: $0.02 + $0.135 = $0.155, input about 13%.
- **Safety rates (c5):** 565/580 = 97.4%, 114/120 = 95.0%, 51/60 = 85.0%. Boss safety numbers and gate means (96.7% / 95.0%) are correct.
- **Gemini safety (c5):** four categories; core harms "always blocked and cannot be adjusted"; "probability … and not the severity"; "If the threshold is not set, the default block threshold is **Off** for Gemini 2.5 and 3 models"; Block few = `BLOCK_ONLY_HIGH`, Block some = `BLOCK_MEDIUM_AND_ABOVE`.
- **OpenAI moderation (c5):** omni-moderation text+image, no audio, free, 20 MB; "Text only" categories return 0 for image-only input; flagged → categories for routing; scores are signals; recalibration; CSAM rule; `moderation` auto/low. All verbatim.
- **pass^k / pass@k (c6):** both definitions and the (0.75)³ ≈ 42% example are verbatim. 0.95⁴ = 0.8145 is correct. The Try it maths 1 − 0.2³ = 0.992 is correct.
- **Dates and vendor notes (c6):** "Oct 31, 2026: Existing evals become read-only", "Nov 30, 2026 … scheduled to shut down", the Promptfoo guide, "Recommended for all new projects to use Nano Banana 2.1", "For new integrations, use one of the GPT Image 2.5 models".
- **Teaching gaps:** every case, quick-check and boss question has its fact in a lesson. One exception is c1 QC Q3 (S1). After M2–M8, I moved the needed facts into the Idea sections.
- **Wrong options:** none became true. The c4 Q1 shortlist key (Sunburst + Pro) matches the vendor lines.
- **Overlaps of 30+ characters** between a lesson and graded text are all verbatim vendor quotes, never our own words. No lesson quotes our own option text.

## Sources checked

All **[MATCHES]**:

- https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
- https://platform.claude.com/docs/en/managed-agents/define-outcomes
- https://platform.claude.com/docs/en/build-with-claude/vision
- https://developers.openai.com/api/docs/guides/evaluation-best-practices
- https://developers.openai.com/api/docs/guides/graders (see S2 for context)
- https://developers.openai.com/api/docs/deprecations
- https://developers.openai.com/api/docs/guides/image-generation
- https://developers.openai.com/api/docs/guides/moderation
- https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- https://ai.google.dev/gemini-api/docs/image-generation
- https://ai.google.dev/gemini-api/docs/safety-settings
- https://ai.google.dev/gemini-api/docs/safety-guidance

## Summary: Blockers: 0 false facts · Must-fix: 8 · Should-fix: 3

My replacement hard cases for c1 (unclear brief) and c6 (harmless edit) are close to c2 case Q4 and c6 case Q1, but they ask a different question. Please give them a second look. Nothing was edited or committed.

Files reviewed: `/home/user/sigmorai/.claude/worktrees/agent-a3b3987095483adc4/content/creator/06-eval-arena/c1/lesson.mdx` through `c6/lesson.mdx`. To check for teaching gaps, I also read the `case.json` and `quick-check.json` in c1–c6 and `boss/case.json` in the same folder.
