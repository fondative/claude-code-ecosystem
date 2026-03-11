# Agents

## TL;DR

| Aspect | Détail |
|--------|--------|
| **Quoi** | Instances spécialisées de Claude avec outils, modèle et instructions dédiés |
| **Où** | `.claude/agents/<nom>.md` |
| **Isolation** | Chaque agent a son propre contexte (pas d'historique de conversation) |
| **Modèles** | Opus (analyse complexe), Sonnet (implémentation), Haiku (tâches légères) |
| **Héritage** | Peuvent hériter de skills via le frontmatter `skills:` |

---

## Agents built-in

Claude Code inclut des agents intégrés utilisés automatiquement. Ils ne nécessitent aucune configuration.

| Agent | Modèle | Outils | Usage |
|-------|--------|--------|-------|
| **Explore** | Haiku | Lecture seule (pas de Write/Edit) | Recherche et exploration de codebase. Niveaux : `quick`, `medium`, `very thorough` |
| **Plan** | Inherit | Lecture seule | Recherche de contexte en mode plan (`/plan`) |
| **General-purpose** | Inherit | Tous | Tâches complexes multi-étapes (exploration + modification) |
| **Bash** | Inherit | Terminal | Commandes shell dans un contexte séparé |
| **Claude Code Guide** | Haiku | Lecture seule | Questions sur les fonctionnalités de Claude Code |

::: tip Gestion des agents
- `/agents` : interface interactive pour créer, éditer, supprimer des agents
- `claude agents` : lister tous les agents depuis le terminal
:::

---

## Qu'est-ce qu'un Agent ?

Un agent (ou sub-agent) est une **instance isolée de Claude** configurée pour une tâche spécifique. Chaque agent a son propre système prompt (le fichier `.md`), ses outils autorisés, son modèle, et éventuellement des skills héritées.

L'agent ne voit PAS l'historique de conversation. Il reçoit une tâche, l'exécute avec ses outils, et retourne un résultat.

```
┌─────────────────────────────────────────────┐
│              Session principale              │
│                                             │
│  Utilisateur ←→ Claude (conversation)       │
│                    │                        │
│              Agent tool                     │
│                    │                        │
│    ┌───────────────┼───────────────┐        │
│    ▼               ▼               ▼        │
│ ┌────────┐   ┌──────────┐   ┌──────────┐   │
│ │Agent A │   │ Agent B  │   │ Agent C  │   │
│ │ Opus   │   │ Sonnet   │   │ Haiku    │   │
│ │Read    │   │Read,Write│   │Read,Grep │   │
│ │Grep    │   │Edit,Bash │   │          │   │
│ │        │   │          │   │          │   │
│ │Analyse │   │Implement.│   │ Audit    │   │
│ └────────┘   └──────────┘   └──────────┘   │
│    │               │               │        │
│    ▼               ▼               ▼        │
│  Resultat       Resultat       Resultat     │
└─────────────────────────────────────────────┘
```

---

## Comment ça marche

### Format du fichier

```yaml
---
name: backend-tasks-executor
description: Implementation backend Test First
tools: Read, Glob, Grep, Write, Edit, Bash
model: sonnet
skills:
  - symfony/api-conventions
  - symfony/testing-conventions
---

# Backend Tasks Executor

## Processus
1. Lire le fichier d'analyse backend
2. Pour chaque tache :
   a. Lire la reference skill (ex: create-entity.md)
   b. Ecrire les tests d'abord (Red)
   c. Implementer le code (Green)
   d. Refactorer si necessaire
3. Marquer la tache "Processed"
```

### Frontmatter

| Champ | Requis | Type | Description |
|-------|--------|------|-------------|
| `name` | Oui | string | Identifiant unique |
| `description` | Oui | string | Ce que fait l'agent (1-2 lignes) |
| `tools` | Non | string (CSV) | `Read`, `Glob`, `Grep`, `Write`, `Edit`, `Bash`. Hérite tous les outils si omis |
| `model` | Non | string | `opus`, `sonnet`, `haiku`, `inherit`. Défaut : `inherit` (modèle de la conversation parente) |
| `skills` | Non | list | Skills héritées (contenu complet chargé au démarrage) |
| `disallowedTools` | Non | string (CSV) | Outils à exclure (denylist), retirés de la liste héritée ou spécifiée |
| `permissionMode` | Non | string | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns` | Non | number | Nombre max de tours agentic avant arrêt |
| `mcpServers` | Non | list | Serveurs [MCP](/concepts/mcp) dédiés à cet agent |
| `hooks` | Non | object | [Hooks](/concepts/hooks) lifecycle scopés à cet agent (`PreToolUse`, `PostToolUse`, `Stop`) |
| `memory` | Non | string | Mémoire persistante cross-session : `user`, `project`, `local` |
| `background` | Non | boolean | `true` pour toujours exécuter en arrière-plan. Défaut : `false` |
| `isolation` | Non | string | `worktree` pour un git worktree isolé (nettoyé si aucun changement) |

### Héritage des skills

Quand un agent déclare `skills:`, le contenu **complet** de chaque SKILL.md est injecté dans son système prompt au démarrage — pas seulement la description.

```yaml
# L'agent recoit TOUT le contenu de ces skills
skills:
  - symfony/api-conventions      # 14 references disponibles
  - symfony/testing-conventions  # 3 references disponibles
```

### Comment un agent est spawné

| Méthode | Déclencheur | Exemple |
|---------|------------|---------|
| Skill launcher | `/modernization/migrate-feature X` | La skill orchestre les agents |
| Outil Agent | Claude décide de déléguer | `Agent(subagent_type: "Explore")` |

::: warning Pas de nesting
Les subagents **ne peuvent PAS** spawner d'autres subagents. Seul le thread principal (conversation ou `claude --agent`) peut déléguer. Pour des workflows multi-niveaux, utiliser des skills ou chaîner les agents depuis la conversation principale.
:::

### Scopes et priorité

Les agents peuvent être définis à plusieurs niveaux. En cas de conflit de nom, la priorité la plus haute gagne.

| Emplacement | Scope | Priorité |
|-------------|-------|----------|
| `--agents '{JSON}'` (CLI) | Session courante uniquement | 1 (plus haute) |
| `.claude/agents/` | Projet (versionnable en git) | 2 |
| `~/.claude/agents/` | Utilisateur (tous les projets) | 3 |
| Plugin `agents/` | Projets où le plugin est actif | 4 (plus basse) |

```bash
# Agent ephemere via CLI (pas sauvegarde sur disque)
claude --agents '{
  "quick-reviewer": {
    "description": "Review rapide du code modifie",
    "prompt": "Analyse git diff et donne un feedback concis.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "haiku"
  }
}'
```

### Foreground vs Background

| Mode | Comportement | Permissions |
|------|-------------|-------------|
| **Foreground** | Bloque la conversation jusqu'à la fin | Prompts de permission passés à l'utilisateur |
| **Background** | Exécuté en parallèle (`Ctrl+B` pour backgrounder) | Permissions pré-approuvées au lancement, auto-deny sinon |

::: tip
Si un agent en background échoue par manque de permissions, on peut le **reprendre en foreground** via son agent ID pour réessayer avec les prompts interactifs.
:::

Pour désactiver complètement le background : `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`.

### Reprendre un agent (Resume)

Chaque invocation crée une instance avec un contexte frais. Pour **continuer** le travail d'un agent au lieu de repartir de zéro, demander à Claude de le reprendre :

```text
Utilise l'agent code-reviewer pour analyser le module auth
[Agent termine]

Continue cette review et analyse maintenant le module authorization
[Claude reprend l'agent avec tout son historique precedent]
```

L'agent repris conserve **tout** son historique : appels d'outils, résultats, raisonnement.

Les transcripts sont stockés dans `~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl` et persistent indépendamment de la conversation principale :
- La compaction de la conversation n'affecte pas les transcripts
- On peut reprendre un agent après redémarrage de Claude Code (même session)
- Nettoyage automatique selon `cleanupPeriodDays` (défaut : 30 jours)

### Délégation automatique

Claude décide de déléguer en fonction de la description de votre requête et du champ `description` de l'agent.

::: tip Délégation proactive
Inclure **"use proactively"** dans la description d'un agent encourage Claude à l'utiliser automatiquement sans attendre une demande explicite.

```yaml
description: Expert code reviewer. Use proactively after code changes.
```
:::

---

## Quand utiliser un subagent ?

| Situation | Recommandation |
|-----------|---------------|
| Output volumineux (tests, logs, docs) | **Subagent** — isole le bruit hors du contexte principal |
| Restrictions d'outils / permissions spécifiques | **Subagent** — outils limités au strict nécessaire |
| Tâche autonome avec résultat résumable | **Subagent** — retourne un résumé concis |
| Échanges itératifs, allers-retours fréquents | **Conversation principale** — conserve le contexte partagé |
| Phases liées (plan → implem → test) | **Conversation principale** — évite la perte de contexte |
| Changement rapide et ciblé | **Conversation principale** — pas de latence de démarrage |
| Workflow réutilisable dans le contexte principal | **[Skill](/concepts/skills)** — pas d'isolation, même contexte |
| Parallélisme soutenu cross-sessions | **[Agent Teams](https://code.claude.com/docs/en/agent-teams)** — chaque worker a son propre contexte indépendant |

---

## Guide pratique : concevoir ses agents

### Quel modèle choisir ?

```
La tache necessite de COMPRENDRE du code non documente ?
├── OUI → Opus ($$$)
│   (reverse engineering, deduction d'architecture)
└── NON
    La tache PRODUIT du code ou des specifications ?
    ├── OUI → Sonnet ($$)
    │   (implementation, planification, review)
    └── NON
        La tache suit un TEMPLATE clair ?
        ├── OUI → Haiku ($)
        │   (documentation, audit, diagnostics)
        └── NON → Sonnet (par defaut)
```

::: tip Règle d'or
Commencer par Haiku. Monter à Sonnet si la qualité ne suffit pas. Opus seulement pour l'analyse de code non documenté.
:::

### Répartition type (exemple projet)

::: info
Cette répartition est spécifique au projet de modernisation legacy. Adaptez-la à votre contexte.
:::

```
Opus (2 agents) ─────────────────────────────── $$$
├── legacy-technical-analyzer    # Reverse engineering complet
└── legacy-feature-analyzer      # Specification 12 sections

Sonnet (8 agents) ───────────────────────────── $$
├── backend-tasks-planner        # Decomposition en taches
├── backend-tasks-executor       # Implementation TDD
├── frontend-tasks-planner       # Planification frontend
├── frontend-tasks-executor      # Implementation frontend
├── frontend-design-executor     # Avec design Figma
├── legacy-feature-analyzer-refiner
├── legacy-functional-analyzer
└── conformity-reporter          # Scoring

Haiku (3 agents) ────────────────────────────── $
├── legacy-functional-analyzer-auditor
├── documentation-generator      # VitePress
└── health-check                 # Diagnostics
```

### Les erreurs à éviter

#### ❌ Piège 1 : Agent fourre-tout

```yaml
# ❌ MAUVAIS — Analyse + implementation + documentation
---
name: do-everything
description: Fait tout
model: opus
---
```

```yaml
# ✅ BON — Une seule responsabilite
---
name: backend-tasks-executor
description: Implementation backend Test First
model: sonnet
---
```

> Un agent fourre-tout perd le focus et coûte plus cher.

#### ❌ Piège 2 : Trop d'outils

```yaml
# ❌ — Agent d'analyse avec Write/Edit
tools: Read, Glob, Grep, Write, Edit, Bash
```

```yaml
# ✅ — Lecture seule pour l'analyse
tools: Read, Glob, Grep
```

> Limiter les outils empêche les actions inattendues.

#### ❌ Piège 3 : Opus partout

```yaml
# ❌ COUTEUX — Opus pour de la documentation
model: opus
```

```yaml
# ✅ ECONOMIQUE — Haiku suffit
model: haiku
```

> Haiku est ~10x moins cher pour les tâches structurées.

#### ❌ Piège 4 : Pas de checkpoint

```yaml
# ❌ — L'executor tourne a vide si l'analyse a echoue
Etape 1 : analyzer → Etape 2 : executor
```

```yaml
# ✅ — Verification avant de continuer
Etape 1 : analyzer
Checkpoint : output/analysis.md existe ?
Etape 2 : executor
```

> Sans checkpoint, un échec se propage silencieusement.

### Patterns d'orchestration

#### Séquentiel

```
Analyzer ──► spec.md ──► Planner ──► analysis.md ──► Executor
```

Usage : pipeline de migration (chaque étape dépend de la précédente).

#### Parallèle

```
         ┌── Backend Planner ──┐
Spec ────┤                     ├──► Merge
         └── Frontend Planner ─┘
```

Usage : planification backend + frontend simultanée.

#### Hiérarchique

```
Skill Launcher (orchestrateur, conversation principale)
├── Agent Analyse (Opus)
├── Agent Implementation (Sonnet)
│   ├── Sous-tache backend
│   └── Sous-tache frontend
└── Agent Conformite (Sonnet)
```

::: warning
C'est le **skill launcher** (conversation principale) qui spawne chaque agent — pas les agents entre eux. Les sous-tâches backend/frontend sont des étapes séquentielles du même agent, pas des sous-agents imbriqués.
:::

#### LLM-as-Judge

```
Executor ──► output ──► Judge ──► score
                          │
                          └── si < 80% → re-execution (max 2x)
```

---

## Contrôle avancé

### Permission modes

Le champ `permissionMode` contrôle comment l'agent gère les prompts de permission.

| Mode | Comportement |
|------|-------------|
| `default` | Vérification standard avec prompts utilisateur |
| `acceptEdits` | Auto-accepte les edits de fichiers |
| `dontAsk` | Auto-refuse les prompts (seuls les outils explicitement autorisés fonctionnent) |
| `bypassPermissions` | Ignore toutes les vérifications de permission |
| `plan` | Mode lecture seule (exploration uniquement) |

::: danger
`bypassPermissions` saute TOUTES les vérifications. À utiliser uniquement dans des environnements contrôlés (CI/CD, sandbox).
:::

### Mémoire persistante

Le champ `memory` donne à l'agent un répertoire persistant cross-sessions pour accumuler des connaissances.

| Scope | Emplacement | Usage |
|-------|------------|-------|
| `user` | `~/.claude/agent-memory/<nom>/` | Connaissances partagées entre tous les projets |
| `project` | `.claude/agent-memory/<nom>/` | Spécifique au projet, versionnable en git |
| `local` | `.claude/agent-memory-local/<nom>/` | Spécifique au projet, non commité |

Quand `memory` est activé :
- Le système prompt inclut les 200 premières lignes de `MEMORY.md` du répertoire mémoire
- Les outils Read, Write, Edit sont automatiquement activés
- L'agent peut lire et écrire ses notes entre les sessions

```yaml
---
name: code-reviewer
description: Review de code avec apprentissage continu
memory: user
---

Avant chaque review, consulte ta memoire pour les patterns deja identifies.
Apres chaque review, mets a jour ta memoire avec les nouvelles decouvertes.
```

### Désactiver un agent

On peut empêcher Claude d'utiliser un agent spécifique via `permissions.deny` dans les settings :

```json
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(mon-agent-custom)"]
  }
}
```

Ou via le CLI : `claude --disallowedTools "Agent(Explore)"`

---

## Exemples concrets

### Exemple 1 : Agent d'analyse (Opus, lecture seule)

```yaml
---
name: legacy-technical-analyzer
description: Reverse engineering complet du legacy (architecture,
  data flow, database, dependances, deploiement)
tools: Read, Glob, Grep, Write, Bash
model: opus
---

# Analyse technique

Lire les chemins depuis CLAUDE.md.

## Etapes
1. Scanner la structure du projet SOURCE_PROJECT
2. Analyser le flux : routes → controllers → models → DB
3. Documenter le schema de base de donnees
4. Identifier les dependances externes
5. Produire un audit de dette technique

## Sortie
7 fichiers dans SOURCE_TECHNICAL_DIR :
00-index, 01-overview, 02-data-flow, 03-database,
04-dependencies, 05-deployment, 06-audit
```

::: info Pourquoi Opus ?
Comprendre un codebase entier sans documentation, déduire l'architecture implicite. Sonnet ne produit pas la même profondeur.
:::

### Exemple 2 : Agent d'implémentation (Sonnet, TDD)

```yaml
---
name: backend-tasks-executor
description: Implementation backend Test First via Docker
tools: Read, Glob, Grep, Write, Edit, Bash
model: sonnet
skills:
  - symfony/api-conventions
  - symfony/testing-conventions
---

# Implementation TDD

Avant chaque tache, lire la reference skill :
- create-entity.md, create-dto.md, create-controller.md

## Processus par tache
1. Ecrire le test → Red
2. Implementer → Green
3. Refactorer
4. `docker compose exec -T app php bin/phpunit 2>&1 | cat`
5. Marquer "Processed" avec date et nb tests
```

### Exemple 3 : Agent de diagnostic (Haiku, rapide)

```yaml
---
name: health-check
description: Verification de coherence du projet
tools: Read, Glob, Grep, Bash
model: haiku
---

Verifier :
- [ ] Chemins CLAUDE.md existent
- [ ] Rules ciblent des globs valides
- [ ] Agents referent des skills existantes
- [ ] Docker repond
- [ ] Tests passent

Rapport : erreurs / warnings / OK
```

---

## Checklist de lancement

### Conception

- [ ] Une seule responsabilité par agent
- [ ] Modèle adapté ([decision tree](#quel-modele-choisir-))
- [ ] Outils limités au strict nécessaire
- [ ] `disallowedTools` si besoin d'exclure des outils spécifiques

### Description & délégation

- [ ] Description claire — Claude l'utilise pour décider quand déléguer
- [ ] `"Use proactively"` dans la description si délégation automatique souhaitée
- [ ] Skills listées explicitement (pas d'héritage depuis la conversation parente)

### Exécution

- [ ] Checkpoints entre étapes séquentielles
- [ ] `maxTurns` défini pour éviter les boucles infinies
- [ ] `permissionMode` adapté (`plan` pour lecture seule, `dontAsk` pour CI)

### Maintenance

- [ ] Fichier versionné dans `.claude/agents/` (partagé équipe)
- [ ] Convention de nommage : `{role}-{action}.md`
- [ ] Fichiers de sortie documentés dans le prompt
- [ ] `memory: user` si apprentissage cross-sessions souhaité

---

## Ressources

- [Documentation officielle — Sub-agents](https://code.claude.com/docs/en/sub-agents)
