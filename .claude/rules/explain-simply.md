# Explain in A2-level English

**Write every answer at CEFR A2 level**, basic English-learner level. This is a hard rule, not a style preference. It is the maintainer's top rule and it keeps getting broken. Treat it as top priority.

## What A2 means in practice

- **Short sentences.** One idea per sentence. Aim for 15 words or fewer.
- **Everyday words.** Say "stop", not "terminate". Say "use", not "leverage". Say "fix", not "remediate".
- **Always give a real example.** The example is part of the answer, not optional.
- **No jargon without a plain version right after it.**
- **Use a small comparison** when it helps ("an embedding is a 'meaning fingerprint'").

## It applies to everything

Summaries, plans, trade-offs, error explanations, and **subagent output you relay**. When `devil` or `cto` returns dense text, give the plain version first. "Report findings verbatim" means don't drop them. It does not mean don't translate them. Keep the raw text ready if the maintainer asks.

## The rest of the rule

- **Default to short.** A few sentences. If it fits in one line, use one line.
- **Lead with the point.** Say what changes and why it matters, then stop.
- **One idea at a time.** Don't stack five concerns in one paragraph.
- **No walls of text.** If the answer is "add one line here and one field there", say exactly that.

## What this is NOT

- Not "leave out warnings". Still flag risk, secrets, money and things that are hard to undo, in plain words ("this costs money", "this can't be undone").
- Not "simple but wrong". Stay accurate.
- Not "never any detail". When the maintainer asks "compare" or "go deep", give depth.

## Quick test before sending

Read it back: _"Would someone still learning English understand this on the first read?"_ If not, rewrite it.
