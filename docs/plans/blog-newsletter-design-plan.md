# Sigmorai — Blog newsletter box

> The contract for the DISPATCH FROM LATENTIA box on the blog list and post pages: what we send to Resend, what we do not do, and what must exist before it goes live.

## Status

**STATUS: Built, not live. Track: both.** The box shows "Sign-up is not open yet." until `RESEND_API_KEY` and `RESEND_SEGMENT_ID` are set.

## Decisions

- **No double opt-in.** Resend's Contacts API sends no confirmation email, and we keep no database table of pending sign-ups. The box says "You're on the list.", never "Check your inbox".
- **No re-subscribe from the public box.** If a contact already exists, we only add it to the segment. An unsubscribed contact stays unsubscribed. Why: without double opt-in, a stranger could type someone's email and switch their emails back on.
- **The box is on the post page too.** The design's post view ends at Keep reading; we add the box there on purpose, because a reader who just finished a post is the best moment to sign up.
- **Only the email is sent to Resend.** No name, no IP, no tracking pixel. Nothing is stored in our database. The privacy page says the same.
- **The same reply for a new or an existing address**, so the form never tells who is subscribed.

## Before the env vars are set

A rate limit must exist first: a Vercel Firewall rule on `POST /blog*` (the Server Action posts to the page URL). Without it, a bot can fill the Resend list and use up Resend's 10 requests per second. The honeypot only stops simple bots.
