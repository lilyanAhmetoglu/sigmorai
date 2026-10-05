/**
 * Code runner limits (lib/runner). User code only ever runs in the E2B sandbox;
 * `fake` is for dev and E2E and never runs code at all.
 */

/** CODE_RUNNER env values. Unset → `fake`, except on Vercel production → `e2b`. */
export const RUNNER_KINDS = ['fake', 'e2b'] as const;

/**
 * Hard wall-clock limit for one run, sandbox start included. A safety net
 * only: the budgets below end a slow run first, with per-test results.
 */
export const RUN_TIMEOUT_MS = 15_000;
/** Time harness.py may spend on all tests: RUN_TIMEOUT_MS minus ~3s for sandbox start. */
export const RUN_HARNESS_BUDGET_S = 12;
/** commands.run limit: the harness budget plus 1s to print. Below RUN_TIMEOUT_MS. */
export const RUN_COMMAND_TIMEOUT_MS = RUN_HARNESS_BUDGET_S * 1_000 + 1_000;
/** Limit for one test inside the sandbox, so one infinite loop can't eat the run. */
export const RUN_TEST_TIMEOUT_S = 5;
/** Address-space cap per test process, so a memory bomb fails one test only. */
export const RUN_TEST_MEMORY_BYTES = 256 * 1024 * 1024;
/** E2B kills the sandbox itself after this, even if our kill() call is lost. */
export const RUN_SANDBOX_TTL_MS = RUN_TIMEOUT_MS + 15_000;
/**
 * A users.sandbox_pending_at lock older than this is ignored (the function
 * that set it died). Past the sandbox TTL plus slack, so a live run is never
 * overlapped by a second one.
 */
export const RUN_STALE_MS = RUN_SANDBOX_TTL_MS + 10_000;

/** What a sandbox call is for: free practice (Run) or a graded attempt (Submit). */
export const SANDBOX_KINDS = ['run', 'submit'] as const;
/**
 * Sandbox calls per user per UTC day (quest-actions spec). Check E2B's live
 * pricing before launch. Cases and quick checks never count.
 */
export const RUN_DAILY_CAP = 40;
export const SUBMIT_DAILY_CAP = 30;

/** Learner stdout kept per run, and the longest error line kept per test. */
export const RUN_OUTPUT_MAX_CHARS = 4_000;
/** Longest code a learner can submit. */
export const RUN_CODE_MAX_CHARS = 20_000;
/** /api/run request body cap. Checked before JSON parsing. */
export const RUN_BODY_MAX_BYTES = 32_000;

/**
 * E2B sandbox template. `base` is E2B's default image (Debian + python3).
 * TODO: swap for a custom template with pinned Python + libs when a realm needs them.
 */
export const E2B_TEMPLATE = 'base';

/**
 * Comments the fake runner looks for in submitted code. It never runs the
 * code: it only searches the text, so E2E can script each outcome.
 */
export const FAKE_RUNNER_MARKERS = {
  fail: 'sigmorai:fake-fail',
  timeout: 'sigmorai:fake-timeout',
  error: 'sigmorai:fake-error',
} as const;
