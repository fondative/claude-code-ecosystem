# Diagrammes d'architecture

Représentations visuelles des mécanismes internes de Claude Code.

## Boucle principale (Master Loop)

```
┌─────────────────────────────────────────────────────────┐
│                    MASTER LOOP                           │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐   │
│  │ Recevoir │───►│ Choisir  │───►│ Executer outil   │   │
│  │ message  │    │ outil(s) │    │ (Read/Write/Bash) │   │
│  └──────────┘    └──────────┘    └────────┬─────────┘   │
│       ▲                                    │             │
│       │          ┌──────────┐              │             │
│       │          │ Analyser │◄─────────────┘             │
│       └──────────┤ resultat │                            │
│    (si besoin    └──────────┘                            │
│     de continuer)      │                                 │
│                        ▼ (si reponse prete)              │
│                  ┌──────────┐                            │
│                  │ Repondre │                            │
│                  └──────────┘                            │
└─────────────────────────────────────────────────────────┘

Pas de DAG, pas de classifier, pas de RAG.
Le modele decide TOUT a chaque iteration.
```

## Hiérarchie de mémoire

```
┌─────────────────────────────────────────────┐
│          CHARGEMENT AU DEMARRAGE             │
│                                             │
│  1. Enterprise managed settings  (priorite max)
│  │
│  2. ~/.claude/CLAUDE.md          (personnel)
│  │   ~/.claude/settings.json
│  │
│  3. ./CLAUDE.md                  (projet)
│  │   .claude/settings.json
│  │
│  4. Descriptions des skills      (budget 2%)
│  │
│  5. Auto-memoire MEMORY.md       (evolutif)
│                                             │
│  ─────────────────────────────────          │
│  EN COURS DE SESSION :                      │
│                                             │
│  6. Rules injectees selon fichiers (globs)  │
│  7. Skills chargees a la demande            │
│  8. Outils MCP decouverts via ToolSearch    │
└─────────────────────────────────────────────┘
```

## Pipeline de permissions

```
Claude veut utiliser un outil
         │
         ▼
┌─────────────────┐
│  Check DENY     │──── Match ? ──── ❌ BLOQUE
│  (settings.json)│                  (toujours prioritaire)
└────────┬────────┘
         │ Pas de deny
         ▼
┌─────────────────┐
│  Check HOOKS    │──── Exit 2 ? ─── ❌ BLOQUE
│  (PreToolUse)   │                  (avec message stderr)
└────────┬────────┘
         │ Exit 0
         ▼
┌─────────────────┐
│  Check ALLOW    │──── Match ? ──── ✅ AUTORISE
│  (settings.json)│                  (sans confirmation)
└────────┬────────┘
         │ Ni allow ni deny
         ▼
┌─────────────────┐
│  Mode permission│
│  Default → 🔔 Demande confirmation
│  Accept Edits → ✅ Auto (edits) / 🔔 (bash)
│  Don't Ask → ✅ Auto (allowlist)
│  Bypass → ✅ Auto (tout, danger)
│  Plan Mode → ❌ Bloque
└─────────────────┘
```

## Architecture MCP

```
┌─────────────────────────────────────────────────┐
│                 CLAUDE CODE                      │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │           Outils natifs                   │  │
│  │  Read │ Write │ Edit │ Bash │ Glob │ Grep │  │
│  │  Agent │ TodoWrite                        │  │
│  └───────────────────────────────────────────┘  │
│                      │                          │
│               ToolSearch (lazy)                  │
│                      │                          │
│  ┌───────────────────┼───────────────────────┐  │
│  │        Outils MCP (deferred)              │  │
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

## Cycle de vie des skills

```
┌──────────────────────────────────────────────────┐
│              SKILLS LIFECYCLE                     │
│                                                  │
│  AU DEMARRAGE                                    │
│  ┌─────────────────────────────────────────┐     │
│  │ Charger DESCRIPTIONS de toutes skills   │     │
│  │ (budget: 2% fenetre ≈ 16K car.)        │     │
│  └─────────────────────────────────────────┘     │
│                                                  │
│  INVOCATION DIRECTE (/nom)                       │
│  ┌──────┐    ┌──────────────┐    ┌───────────┐  │
│  │ /nom │───►│ Charge       │───►│ Execute   │  │
│  │      │    │ SKILL.md     │    │ instruct. │  │
│  └──────┘    │ complet      │    └───────────┘  │
│              └──────────────┘                    │
│                                                  │
│  CHARGEMENT AUTO (par Claude)                    │
│  ┌──────────┐    ┌──────────┐    ┌───────────┐  │
│  │ Message  │───►│ Descript.│───►│ Charge    │  │
│  │ user     │    │ matche ? │    │ si oui    │  │
│  └──────────┘    └──────────┘    └───────────┘  │
│                                                  │
│  HÉRITAGE AGENT                                  │
│  ┌──────────┐    ┌──────────────┐                │
│  │ Agent    │───►│ SKILL.md     │                │
│  │ skills:  │    │ COMPLET      │                │
│  │ [api-c.] │    │ injecte au   │                │
│  └──────────┘    │ demarrage    │                │
│                  └──────────────┘                │
└──────────────────────────────────────────────────┘
```

## Pipeline multi-agents (projet réel)

```
/modernization/analyze-legacy
│
├── Stage 1: Analyse technique ────────────── Opus
│   └── 7 fichiers → output/technique/
│       ├── 00-index.md
│       ├── 01-overview.md
│       ├── 02-data-flow.md
│       ├── 03-database.md
│       ├── 04-dependencies.md
│       ├── 05-deployment.md
│       └── 06-audit.md
│
├── Stage 2: Inventaire fonctionnel ───────── Opus
│   └── output/features/
│       ├── 0-index.md (features)
│       └── 0-features-tree.json
│
└── Stage 3: Audit ────────────────────────── Haiku
    └── Enrichissement de l'inventaire


/modernization/migrate-feature Search_Engine
│
├── Stage 1: Spécification ────────────────── Opus
│   └── Search_Engine_spec.md (12 sections)
│   ✓ Checkpoint: fichier existe ?
│
├── Stage 2: Planification ────────────────── Sonnet (parallèle)
│   ├── backend_analysis.md
│   └── frontend_analysis.md
│   ✓ Checkpoint: les deux fichiers existent ?
│
├── Stage 3: Implémentation TDD ───────────── Sonnet (séquentiel)
│   ├── backend-tasks-executor
│   │   └── Tests → Code → Verify
│   └── frontend-tasks-executor
│       └── Tests → Code → Verify
│   ✓ Checkpoint: tous les tests passent ?
│
└── Stage 4: Conformité ───────────────────── Sonnet
    └── CONFORMITY_REPORT-V1.md (scoring /100)
```

## Couches de sécurité

```
┌─────────────────────────────────────────────────────┐
│                COUCHES DE SECURITE                    │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ Couche 4 : MCP Permissions                    │  │
│  │ allow/deny par outil MCP                      │  │
│  │                                               │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │ Couche 3 : Hooks (PreToolUse)           │  │  │
│  │  │ Scripts dynamiques : patterns, secrets   │  │  │
│  │  │                                         │  │  │
│  │  │  ┌───────────────────────────────────┐  │  │  │
│  │  │  │ Couche 2 : Rules                  │  │  │  │
│  │  │  │ Rappels contextuels auto-injectes │  │  │  │
│  │  │  │                                   │  │  │  │
│  │  │  │  ┌─────────────────────────────┐  │  │  │  │
│  │  │  │  │ Couche 1 : Settings deny    │  │  │  │  │
│  │  │  │  │ Statique, zero latence      │  │  │  │  │
│  │  │  │  │ TOUJOURS prioritaire        │  │  │  │  │
│  │  │  │  └─────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Relations entre composants

```
CLAUDE.md ◄──── Source unique de verite (chemins)
    │
    ├── settings.json ◄── Permissions (allow/deny)
    │       │
    │       └── hooks ◄── Validation dynamique
    │
    ├── rules/ ◄───── Auto-injection par glob
    │   │
    │   └── delegation ──► skills/ (detail)
    │
    ├── skills/
    │   ├── Passives ◄─── Héritées par agents (skills:)
    │   │   └── references/ ◄── Chargées à la demande
    │   └── Launchers ──► Orchestrent agents
    │
    ├── agents/ ◄───── Spawnés par skills launchers
    │   │               ou par l'outil Agent
    │   └── Checkpoints ──► fichiers intermediaires
    │
    └── commands/ ◄─── Fusionnés avec skills (même frontmatter)

    mcpServers ◄───── Outils externes (ToolSearch)
```

## Ressources

- [Documentation officielle](https://code.claude.com/docs/en/skills)
