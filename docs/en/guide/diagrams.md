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
/mod-analyze-legacy
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
├── Stage 2: Functional inventory ───────── Sonnet
│   └── output/features/
│       ├── 0-index.md (features)
│       └── 0-features-tree.json
│
├── Stage 3: Audit ────────────────────────── Haiku
│   └── Inventory enrichment
│   (Stages 1 → 2 → 3: sequential, checkpoint between each)
│
├── Stage 4: Batch specs (optional) ───────── Opus (parallel)
│   └── N × legacy-feature-analyzer (BATCH MODE)
│       └── *_spec.md, then the orchestrator updates 0-index.md
│
├── Stage 5: Visualizations ───────────────── /mod-generate-visualization
│   ├── features-tree-visualization.html
│   └── dependency-graph.html
│
└── Stage 6: Wiki sync (if the wiki exists)
    └── analyses, specs and visualizations → VitePress wiki


/mod-migrate-feature Search_Engine
│
├── Stage 0: Prerequisites
│   └── Backend + frontend stacks installed? (otherwise /dev/install-stack)
│
├── Stage 1: Specification ────────────────── Opus
│   └── Search_Engine_spec.md (12 sections)
│   ✓ Checkpoint: file exists?
│
├── Stage 2: Planning ─────────────────────── Sonnet (sequential)
│   ├── backend-tasks-planner
│   │   ├── backend_analysis.md
│   │   └── openapi.yaml
│   └── frontend-tasks-planner (reads openapi.yaml)
│       └── frontend_analysis.md
│   ✓ Checkpoint: both files exist?
│
├── Stage 3: TDD Implementation ───────────── Sonnet (sequential)
│   ├── backend-tasks-executor
│   │   └── Tests → Code → Verify
│   └── frontend-tasks-executor
│       └── Tests → Code → Verify
│   ✓ Checkpoint: all tests pass?
│
├── Stage 4: Conformity ───────────────────── Sonnet
│   └── Search_Engine_CONFORMITY_REPORT.md (score /100)
│
├── Stage 5: Quality loop (max 2 iterations)
│   └── score < 80/100 → executor fixes → -V2.md report
│       (V2 < 80/100 → STOP, human intervention)
│
└── Stage 6: Wiki sync (if the wiki exists)
    └── /mod-generate-docs Search_Engine
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
