# Architecture Diagrams

Visual representations of Claude Code's internal mechanisms.

## Main Loop (Master Loop)

```
┌─────────────────────────────────────────────────────────┐
│                    MASTER LOOP                           │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐   │
│  │ Receive  │───►│ Choose   │───►│ Execute tool      │   │
│  │ message  │    │ tool(s)  │    │ (Read/Write/Bash)  │   │
│  └──────────┘    └──────────┘    └────────┬─────────┘   │
│       ▲                                    │             │
│       │          ┌──────────┐              │             │
│       │          │ Analyze  │◄─────────────┘             │
│       └──────────┤ result   │                            │
│    (if need      └──────────┘                            │
│     to continue)       │                                 │
│                        ▼ (if response ready)             │
│                  ┌──────────┐                            │
│                  │ Respond  │                            │
│                  └──────────┘                            │
└─────────────────────────────────────────────────────────┘

No DAG, no classifier, no RAG.
The model decides EVERYTHING at each iteration.
```

## Memory Hierarchy

```
┌─────────────────────────────────────────────┐
│          LOADING AT STARTUP                  │
│                                             │
│  1. Enterprise managed settings  (max priority)
│  │
│  2. ~/.claude/CLAUDE.md          (personal)
│  │   ~/.claude/settings.json
│  │
│  3. ./CLAUDE.md                  (project)
│  │   .claude/settings.json
│  │
│  4. Skill descriptions           (2% budget)
│  │
│  5. Auto-memory MEMORY.md        (evolving)
│                                             │
│  ─────────────────────────────────          │
│  DURING SESSION:                            │
│                                             │
│  6. Rules injected based on files (globs)   │
│  7. Skills loaded on demand                 │
│  8. MCP tools discovered via ToolSearch     │
└─────────────────────────────────────────────┘
```

## Permissions Pipeline

```
Claude wants to use a tool
         │
         ▼
┌─────────────────┐
│  Check DENY     │──── Match? ──── ❌ BLOCKED
│  (settings.json)│                  (always takes priority)
└────────┬────────┘
         │ No deny
         ▼
┌─────────────────┐
│  Check HOOKS    │──── Exit 2? ─── ❌ BLOCKED
│  (PreToolUse)   │                  (with stderr message)
└────────┬────────┘
         │ Exit 0
         ▼
┌─────────────────┐
│  Check ALLOW    │──── Match? ──── ✅ ALLOWED
│  (settings.json)│                  (without confirmation)
└────────┬────────┘
         │ Neither allow nor deny
         ▼
┌─────────────────┐
│  Permission mode│
│  Default → 🔔 Ask for confirmation
│  Accept Edits → ✅ Auto (edits) / 🔔 (bash)
│  Don't Ask → ✅ Auto (allowlist)
│  Bypass → ✅ Auto (everything, danger)
│  Plan Mode → ❌ Blocked
└─────────────────┘
```

## MCP Architecture

```
┌─────────────────────────────────────────────────┐
│                 CLAUDE CODE                      │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │           Native tools                    │  │
│  │  Read │ Write │ Edit │ Bash │ Glob │ Grep │  │
│  │  Agent │ TodoWrite                        │  │
│  └───────────────────────────────────────────┘  │
│                      │                          │
│               ToolSearch (lazy)                  │
│                      │                          │
│  ┌───────────────────┼───────────────────────┐  │
│  │        MCP tools (deferred)               │  │
│  │                   │                       │  │
│  │  ┌────────┐ ┌─────────┐ ┌──────────────┐ │  │
│  │  │GitHub  │ │ Slack   │ │  PostgreSQL  │ │  │
│  │  │Server  │ │ Server  │ │   Server     │ │  │
│  │  │        │ │         │ │              │ │  │
│  │  │list_prs│ │send_msg │ │query         │ │  │
│  │  │issues  │ │read_ch  │ │list_tables   │ │  │
│  │  └───┬────┘ └────┬────┘ └──────┬───────┘ │  │
│  └──────┼───────────┼─────────────┼──────────┘  │
└─────────┼───────────┼─────────────┼──────────────┘
          ▼           ▼             ▼
      GitHub API   Slack API   PostgreSQL DB
```

## Skills Lifecycle

```
┌──────────────────────────────────────────────────┐
│              SKILLS LIFECYCLE                     │
│                                                  │
│  AT STARTUP                                      │
│  ┌─────────────────────────────────────────┐     │
│  │ Load DESCRIPTIONS of all skills         │     │
│  │ (budget: 2% window ≈ 16K chars)        │     │
│  └─────────────────────────────────────────┘     │
│                                                  │
│  DIRECT INVOCATION (/name)                       │
│  ┌──────┐    ┌──────────────┐    ┌───────────┐  │
│  │ /name│───►│ Load         │───►│ Execute   │  │
│  │      │    │ full         │    │ instruct. │  │
│  └──────┘    │ SKILL.md     │    └───────────┘  │
│              └──────────────┘                    │
│                                                  │
│  AUTO-LOADING (by Claude)                        │
│  ┌──────────┐    ┌──────────┐    ┌───────────┐  │
│  │ User     │───►│ Descript.│───►│ Load      │  │
│  │ message  │    │ matches? │    │ if yes    │  │
│  └──────────┘    └──────────┘    └───────────┘  │
│                                                  │
│  AGENT INHERITANCE                               │
│  ┌──────────┐    ┌──────────────┐                │
│  │ Agent    │───►│ FULL         │                │
│  │ skills:  │    │ SKILL.md     │                │
│  │ [api-c.] │    │ injected at  │                │
│  └──────────┘    │ startup      │                │
│                  └──────────────┘                │
└──────────────────────────────────────────────────┘
```

## Multi-Agent Pipeline (real project)

```
/modernization/analyze-legacy
│
├── Stage 1: Technical analysis ────────────── Opus
│   └── 7 files → output/technique/
│       ├── 00-index.md
│       ├── 01-overview.md
│       ├── 02-data-flow.md
│       ├── 03-database.md
│       ├── 04-dependencies.md
│       ├── 05-deployment.md
│       └── 06-audit.md
│
├── Stage 2: Functional inventory ───────── Opus
│   └── output/features/
│       ├── 0-index.md (features)
│       └── 0-features-tree.json
│
└── Stage 3: Audit ────────────────────────── Haiku
    └── Inventory enrichment


/modernization/migrate-feature Search_Engine
│
├── Stage 1: Specification ────────────────── Opus
│   └── Search_Engine_spec.md (12 sections)
│   ✓ Checkpoint: file exists?
│
├── Stage 2: Planning ────────────────── Sonnet (parallel)
│   ├── backend_analysis.md
│   └── frontend_analysis.md
│   ✓ Checkpoint: both files exist?
│
├── Stage 3: TDD Implementation ───────────── Sonnet (sequential)
│   ├── backend-tasks-executor
│   │   └── Tests → Code → Verify
│   └── frontend-tasks-executor
│       └── Tests → Code → Verify
│   ✓ Checkpoint: all tests pass?
│
└── Stage 4: Conformity ───────────────────── Sonnet
    └── CONFORMITY_REPORT-V1.md (score /100)
```

## Security Layers

```
┌─────────────────────────────────────────────────────┐
│                SECURITY LAYERS                       │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ Layer 4: MCP Permissions                      │  │
│  │ allow/deny per MCP tool                       │  │
│  │                                               │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │ Layer 3: Hooks (PreToolUse)             │  │  │
│  │  │ Dynamic scripts: patterns, secrets      │  │  │
│  │  │                                         │  │  │
│  │  │  ┌───────────────────────────────────┐  │  │  │
│  │  │  │ Layer 2: Rules                    │  │  │  │
│  │  │  │ Auto-injected contextual reminders│  │  │  │
│  │  │  │                                   │  │  │  │
│  │  │  │  ┌─────────────────────────────┐  │  │  │  │
│  │  │  │  │ Layer 1: Settings deny      │  │  │  │  │
│  │  │  │  │ Static, zero latency        │  │  │  │  │
│  │  │  │  │ ALWAYS takes priority       │  │  │  │  │
│  │  │  │  └─────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Relationships Between Components

```
CLAUDE.md <──── Single source of truth (paths)
    │
    ├── settings.json <── Permissions (allow/deny)
    │       │
    │       └── hooks <── Dynamic validation
    │
    ├── rules/ <───── Auto-injection by glob
    │   │
    │   └── delegation ──► skills/ (detail)
    │
    ├── skills/
    │   ├── Passive <─── Inherited by agents (skills:)
    │   │   └── references/ <── Loaded on demand
    │   └── Launchers ──► Orchestrate agents
    │
    ├── agents/ <───── Spawned by launcher skills
    │   │               or by the Agent tool
    │   └── Checkpoints ──► intermediate files
    │
    └── commands/ <─── Merged with skills (same frontmatter)

    mcpServers <───── External tools (ToolSearch)
```

## Resources

- [Official documentation](https://code.claude.com/docs/en/skills)
