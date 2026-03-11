# Cheatsheet

Quick reference — everything you need in 2 minutes.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Cancel the current action |
| `Ctrl+Shift+P` | Cycle permission modes |
| `Esc` | Exit current mode |
| `Tab` | Autocompletion of `/` commands |
| `Space` | Push-to-talk (voice mode) |

## Built-in Commands

| Command | Action |
|---------|--------|
| `/help` | Contextual help |
| `/clear` | Reset the conversation (keeps context) |
| `/compact` | Compress context (run at >70% usage) |
| `/context` | View context usage and loaded skills |
| `/model` | Change model mid-session |
| `/plan` | Activate Plan mode (read-only exploration) |
| `/debug` | Session diagnostics |
| `/loop [interval] <prompt>` | Run a prompt recurrently |
| `/batch <instruction>` | Orchestrate massive changes in parallel |
| `/simplify` | Review recently modified code for quality and reuse |
| `/init` | Generate an initial CLAUDE.md for the project |
| `/memory` | View/edit automatic memory |
| `/mcp` | MCP server status and OAuth authentication |
| `/status` | View active settings and their source |
| `/hooks` | Status of configured hooks |

## Permission Modes

| Mode | Edits | Bash | When |
|------|-------|------|------|
| **Plan** | No | No | Exploration, before a refactor |
| **Default** | Ask | Ask | Daily work |
| **Accept Edits** | Auto | Ask | Speed with control |
| **Don't Ask** | Auto | Auto (allowlist) | Established workflow + hooks |
| **Bypass** | Auto | Auto (everything) | Dev/test only |

Cycle: `Ctrl+Shift+P`

## Context Management

| Threshold | Action |
|-----------|--------|
| < 70% | Normal — work |
| 70% | `/compact` — compress |
| 85% | Truncation risk — urgent `/compact` |
| 90%+ | `/clear` — start fresh |

::: warning Critical rule
Never exceed 70% without compacting. Reasoning quality degrades before truncation.
:::

## .claude/ Structure in 30 Seconds

```
.claude/
├── settings.json     # allow/deny (the firewall)
├── agents/           # Specialized instances (1 file = 1 task)
├── skills/           # Knowledge + workflows (SKILL.md + references/)
├── rules/            # Auto-injected context (< 30 lines)
└── commands/         # Slash commands (merged with skills)
```

## Effective Prompt Formula

```
WHAT : "In [file], [precise action]"
WHERE: "lines [N-M]" or "[function/class]"
HOW  : constraints, style, framework
VERIFY: "run tests" or "show the diff"
```

**Example**:
```
In src/auth/login.ts, add a JWT refresh token.
Follow the pattern from create-entity.md.
Run tests after implementation.
```

## Typical Workflow in 5 Steps

```
1. /plan          → Explore, understand context
2. Implement      → Code with conventions (skills)
3. Test           → /dev/php-test or npm test
4. Review         → /review/symfony-review
5. /dev/commit    → Conventional Commits
```

## Docker Commands (Symfony backend)

```bash
# Tests
docker compose exec -T app php bin/phpunit 2>&1 | cat
docker compose exec -T app php bin/phpunit --testsuite unit 2>&1 | cat

# Lint
docker compose exec -T app vendor/bin/phpcs --standard=PSR12 src/ 2>&1 | cat
docker compose exec -T app vendor/bin/phpcbf --standard=PSR12 src/ 2>&1 | cat

# Migrations
docker compose exec -T app php bin/console doctrine:migrations:migrate --no-interaction 2>&1 | cat

# Cache
docker compose exec -T app php bin/console cache:clear 2>&1 | cat
```

::: tip Mandatory flags
`-T`: disables TTY (avoids erroneous exit codes)
`2>&1 | cat`: captures all output
:::

## Available Models

| Model | ID | Strength | Cost |
|-------|----|----------|------|
| Opus 4.6 | `claude-opus-4-6` | Complex reasoning, analysis | $$$ |
| Sonnet 4.6 | `claude-sonnet-4-6` | Implementation, planning | $$ |
| Haiku 4.5 | `claude-haiku-4-5-20251001` | Documentation, lightweight tasks | $ |

## Quick Git

```bash
# Status
git status -u

# Full diff
git diff --staged --stat && git diff --stat

# Commit (ALWAYS use the project command)
/dev/commit

# NEVER do
git push --force        # Destructive
git reset --hard        # Loses work
git commit --amend      # After hook failure, make a NEW commit
```

## Anti-patterns to Avoid

| Don't | Do |
|-------|-----|
| Vague prompts ("fix this") | Specify file, line, expected behavior |
| Accept without reading the diff | Always review changes |
| Ignore context warnings | `/compact` at 70% |
| Opus for everything | Haiku for simple, Sonnet for implementation |
| One agent that does everything | 1 agent = 1 responsibility |
| Conventions in CLAUDE.md | Conventions in skills |

## Resources

- [Official documentation](https://code.claude.com/docs/en/skills)
- [Agent Skills Standard](https://agentskills.io)
