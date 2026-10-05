# Package manager: Bun, always

Use **Bun** for everything JS/TS: install, scripts, runtime, unit tests. **Never npm, pnpm, yarn or npx.**

| Task            | Command                                                  |
| --------------- | -------------------------------------------------------- |
| Install         | `bun install`                                            |
| Dependency      | `bun add <pkg>`                                          |
| Dev dependency  | `bun add -d <pkg>`                                       |
| Run a script    | `bun run <script>`                                       |
| One-off CLI     | `bunx <cmd>` (`bunx drizzle-kit …`, `bunx playwright …`) |
| Unit tests      | `bun test` (not vitest, not jest)                        |
| Run a TS script | `bun scripts/<name>.ts`                                  |
| Vercel CLI      | `bunx vercel <cmd>`                                      |

Commit `bun.lock`. Never commit `package-lock.json`, `pnpm-lock.yaml` or `yarn.lock`.

`README.md` quickstart says `bun install` and `bun dev`.

CI uses `oven-sh/setup-bun@v2`.

`guard-bash.sh` hard-blocks npm, pnpm, yarn and npx.
