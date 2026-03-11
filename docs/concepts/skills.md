# Skills

## TL;DR

| Aspect | Détail |
|--------|--------|
| **Quoi** | Modules de connaissances et workflows réutilisables au format `SKILL.md` |
| **Où** | `.claude/skills/<nom>/SKILL.md` (projet) ou `~/.claude/skills/` (personnel) |
| **Types** | Passive (conventions auto-chargées), Launcher (workflows `/nom`), Standard (les deux) |
| **Standard** | [Agent Skills](https://agentskills.io) — compatible 30+ outils (Cursor, VS Code, Gemini CLI...) |
| **Taille idéale** | < 500 lignes pour SKILL.md, détail dans `references/` |

---

## Skills bundled

Claude Code inclut des skills intégrées disponibles dans chaque session. Contrairement aux commandes built-in (`/help`, `/compact`), ce sont des skills basées sur des prompts qui peuvent spawner des agents et s'adapter au codebase.

| Skill | Description |
|-------|-------------|
| **`/simplify`** | Review des fichiers modifiés (code reuse, qualité, efficacité). Spawne 3 agents en parallèle puis applique les corrections |
| **`/batch <instruction>`** | Changements à grande échelle en parallèle. Décompose en 5-30 unités, chacune dans un git worktree isolé avec PR |
| **`/debug [description]`** | Diagnostic de la session en cours via les logs de debug |
| **`/loop [interval] <prompt>`** | Exécute un prompt de manière récurrente (polling deploy, babysitting PR). Ex: `/loop 5m check if the deploy finished` |
| **`/claude-api`** | Charge la référence API Claude (Python, TS, Java, Go...) + Agent SDK. S'active aussi automatiquement quand le code importe `anthropic` |

---

## Qu'est-ce qu'une Skill ?

Une skill est un **ensemble d'instructions, scripts et ressources** que Claude peut découvrir et utiliser pour effectuer des tâches plus efficacement. On crée un fichier `SKILL.md` avec des instructions, et Claude l'ajoute à sa boîte à outils.

Les skills se distinguent des autres composants par leur **capacité à porter du contexte riche** (fichiers de référence, scripts, templates) et à être **invocables à la demande** ou **chargées automatiquement** selon le contexte.

```
┌──────────────────────────────────────────────────────────┐
│                    SKILL ECOSYSTEM                        │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Passive    │  │  Launcher   │  │    Standard     │  │
│  │             │  │             │  │                 │  │
│  │ Conventions │  │  Workflows  │  │  Les deux modes │  │
│  │ auto-load   │  │  /slash-cmd │  │  auto + /cmd    │  │
│  │             │  │             │  │                 │  │
│  │ Ex: api-    │  │ Ex: /deploy │  │ Ex: /explain-   │  │
│  │ conventions │  │ /migrate    │  │ code            │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Fichiers de référence                 │  │
│  │  references/, scripts/, templates/, examples/      │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## Comment ça marche

### Cycle de vie d'une skill

```
1. Claude demarre la session
   │
   ├── Charge les DESCRIPTIONS de toutes les skills
   │   (budget: 2% de la fenetre de contexte ≈ 16 000 car.)
   │
   ├── L'utilisateur tape une commande ou un message
   │   │
   │   ├── /skill-name → Invocation directe
   │   │   └── Charge le contenu COMPLET du SKILL.md
   │   │
   │   └── Message libre → Claude decide
   │       ├── Description matche → Charge la skill
   │       └── Pas de match → Ignore
   │
   └── Skill active
       ├── Instructions suivies
       ├── Fichiers de reference charges a la demande
       └── allowed-tools appliques
```

### Structure de fichiers

```
my-skill/
├── SKILL.md              # Point d'entree (OBLIGATOIRE)
├── references/           # Documentation detaillee
│   ├── api-guide.md      #   chargee a la demande par Claude
│   └── patterns.md
├── scripts/              # Scripts executables
│   └── validate.sh       #   Claude peut les lancer
├── templates/            # Templates a remplir
│   └── output.md
└── examples/             # Exemples de sortie attendue
    └── sample.md
```

::: tip Règle des 500 lignes
Garder `SKILL.md` sous 500 lignes. Déporter le détail dans les fichiers de référence. Claude les chargera à la demande quand le contexte l'exige.
:::

### Scopes et priorité

| Emplacement | Scope | Priorité |
|-------------|-------|----------|
| Enterprise (managed settings) | Tous les utilisateurs de l'organisation | 1 (plus haute) |
| `~/.claude/skills/<nom>/SKILL.md` | Personnel (tous les projets) | 2 |
| `.claude/skills/<nom>/SKILL.md` | Projet (versionnable en git) | 3 |
| Plugin `skills/` | Namespace `plugin:skill`, pas de conflit | 4 (plus basse) |

::: info Compatibilité commands
Les fichiers `.claude/commands/deploy.md` continuent de fonctionner — ils créent la même `/deploy` qu'une skill. Les skills sont le **format recommandé** car elles supportent les fichiers de référence, le frontmatter complet, et `context: fork`. Si une skill et une command partagent le même nom, la skill a priorité.
:::

::: details Découverte automatique en monorepo
Claude Code découvre aussi les skills dans les sous-répertoires. Si vous éditez un fichier dans `packages/frontend/`, les skills de `packages/frontend/.claude/skills/` sont aussi chargées. Les skills ajoutées via `--add-dir` sont détectées en temps réel (pas besoin de redémarrer).
:::

### Frontmatter complet

```yaml
---
name: my-skill                    # Nom et /slash-command
description: Ce que fait la skill  # CRITIQUE pour la decouverte auto
disable-model-invocation: true     # true = seulement /nom par l'utilisateur
user-invocable: false              # false = invisible dans le menu /
allowed-tools: Read, Grep, Glob   # Outils sans confirmation
model: sonnet                      # Modele force
context: fork                      # Execution dans un sub-agent isole
agent: Explore                     # Type de sub-agent (si context: fork)
argument-hint: "[feature-name]"    # Hint d'autocompletion
hooks:                             # Hooks de cycle de vie
  PreToolUse:
    - matcher: Bash
      hooks:
        - type: command
          command: "echo 'starting...'"
---
```

### Variables de substitution

| Variable | Description | Exemple |
|----------|-------------|---------|
| `$ARGUMENTS` | Tous les arguments | `/skill foo bar` → `foo bar` |
| `$ARGUMENTS[N]` / `$N` | Par index (0-based) | `$0` → `foo`, `$1` → `bar` |
| `${CLAUDE_SESSION_ID}` | ID de session | Pour logs, fichiers uniques |
| `${CLAUDE_SKILL_DIR}` | Dossier du SKILL.md | Pour `scripts/`, `references/` |
| `` !`commande` `` | Injection dynamique | `` !`gh pr diff` `` → résultat de la commande |

### Skill dans un subagent vs Subagent avec skills

Deux directions pour combiner skills et agents :

| Approche | System prompt | Tâche | Charge aussi |
|----------|--------------|-------|-------------|
| Skill avec `context: fork` | Depuis le type d'agent (`Explore`, `Plan`...) | Contenu du SKILL.md | CLAUDE.md |
| [Subagent](/concepts/agents) avec `skills:` | Corps markdown du subagent | Message de délégation de Claude | Skills préloadées + CLAUDE.md |

Avec `context: fork`, **vous** écrivez la tâche dans la skill et choisissez un agent pour l'exécuter. Avec un subagent qui déclare `skills:`, **l'agent** contrôle le prompt et utilise les skills comme contexte de référence.

::: tip Extended thinking
Inclure le mot **`ultrathink`** dans le contenu d'une skill active le mode [extended thinking](https://code.claude.com/docs/en/common-workflows#use-extended-thinking-thinking-mode) pour un raisonnement plus profond.
:::

---

## Guide pratique : concevoir ses skills

### Quel type choisir ?

#### Skill vs Rule vs Agent

| Besoin | Composant | Pourquoi |
|--------|-----------|----------|
| Conventions de code (style, archi, nommage) | **Skill passive** | Chargée automatiquement, supporte les références |
| Rappel contextuel court (< 30 lignes) | **Rule** | Plus léger, injection par glob |
| Workflow multi-étapes (migration, deploy) | **Skill launcher** | Orchestre des agents, invocable par `/nom` |
| Exécution d'une tâche atomique | **Agent** | Contexte isolé, modèle dédié |
| Action ponctuelle (commit, test) | **Command** ou skill launcher | Commands marchent toujours, skills recommandées |

#### Passive vs Launcher

```
La skill contient-elle des INSTRUCTIONS D'EXECUTION ?
│
├── OUI (deployer, migrer, commiter...)
│   └── LAUNCHER (disable-model-invocation: true)
│       Raison: on veut controler QUAND ca se lance
│
└── NON (conventions, patterns, contexte metier...)
    └── PASSIVE (user-invocable: false)
        Raison: Claude doit connaitre ca AUTOMATIQUEMENT
```

#### Matrice de visibilité

| Configuration | Utilisateur voit `/nom` | Claude charge auto | Cas d'usage |
|---------------|--------------------------|-------------------|-------------|
| (défaut) | ✅ | ✅ | Skill polyvalente |
| `disable-model-invocation: true` | ✅ | ❌ | Deploy, commit, actions à risque |
| `user-invocable: false` | ❌ | ✅ | Conventions, contexte métier |

### Organisation par namespace

```
.claude/skills/
├── symfony/                    # Par framework
│   ├── api-conventions/
│   └── testing-conventions/
├── modernization/              # Par workflow
│   ├── analyze-legacy/
│   ├── migrate-feature/
│   └── generate-docs/
├── frontend/                  # Par framework
│   ├── app-conventions/
│   └── testing-conventions/
```

### Héritage skill → agent

```yaml
# .claude/agents/backend-executor.md
---
name: backend-executor
skills:
  - symfony/api-conventions
  - symfony/testing-conventions
---
```

L'agent reçoit le contenu **complet** des skills au démarrage — pas seulement la description. Différent du chargement automatique en session normale.

### Les erreurs à éviter

#### ❌ Piège 1 : Skill trop longue

```yaml
# ❌ MAUVAIS — 2000 lignes dans SKILL.md
---
name: api-conventions
---
## Architecture (200 lignes...)
## Entites (300 lignes...)
## DTOs (400 lignes...)
```

```yaml
# ✅ BON — SKILL.md court + references
---
name: api-conventions
---
## Architecture
Controller → Service → Repository → Entity
## Voir les details
- [create-entity.md](references/create-entity.md)
- [create-dto.md](references/create-dto.md)
```

> **Pourquoi ?** Au-delà de 500 lignes, SKILL.md sature le contexte.

#### ❌ Piège 2 : Description vague ou manquante

```yaml
# ❌ MAUVAIS — Claude ne sait pas quand charger
---
name: helper
---
```

```yaml
# ✅ BON — Mots-cles precis
---
name: api-conventions
description: Conventions backend Symfony. Architecture REST, DTOs,
  repositories avec filtrage, gestion d'exceptions.
---
```

> **Pourquoi ?** Claude utilise la description pour décider QUAND charger la skill.

#### ❌ Piège 3 : Launcher sans protection

```yaml
# ❌ DANGEREUX — Claude peut deployer seul
---
name: deploy
description: Deployer en production
---
```

```yaml
# ✅ SECURISE — Controle humain obligatoire
---
name: deploy
description: Deployer en production
disable-model-invocation: true
---
```

> **Pourquoi ?** Sans protection, Claude peut déployer parce que "le code a l'air prêt".

#### ❌ Piège 4 : Duplication skill / rule

```yaml
# ❌ MAUVAIS — Meme contenu a 2 endroits
# rules/backend.md → PSR-12, camelCase...
# skills/api-conventions/SKILL.md → PSR-12, camelCase...
```

```yaml
# ✅ BON — Rule delegue, skill detaille
# rules/backend.md
# → "Charger la skill api-conventions. Rappels : Docker, TDD."
# skills/api-conventions/SKILL.md → (detail complet)
```

> **Pourquoi ?** Deux sources = désynchronisation lors des mises à jour.

#### ❌ Piège 5 : Budget de contexte dépassé

**Symptôme** : `⚠️ Some skills were excluded due to context budget limits`

**Solutions** :
1. Vérifier avec `/context` quelles skills sont exclues
2. Passer certaines skills en `disable-model-invocation: true`
3. Raccourcir les descriptions
4. Augmenter via `SLASH_COMMAND_TOOL_CHAR_BUDGET`

---

## Contrôle avancé

### Restreindre l'accès aux skills

Trois niveaux de contrôle sur les skills que Claude peut invoquer :

**Désactiver toutes les skills** — ajouter `Skill` aux règles deny dans `/permissions`.

**Autoriser/bloquer des skills spécifiques** :

```text
# Autoriser uniquement certaines skills
Skill(commit)
Skill(review-pr *)

# Bloquer certaines skills
Skill(deploy *)
```

Syntaxe : `Skill(name)` pour correspondance exacte, `Skill(name *)` pour un préfixe avec arguments.

**Masquer une skill individuellement** — `disable-model-invocation: true` dans le frontmatter. La skill disparaît complètement du contexte de Claude.

::: info
`user-invocable: false` contrôle uniquement la visibilité dans le menu `/`, pas l'accès via l'outil Skill. Utiliser `disable-model-invocation: true` pour bloquer l'invocation programmatique.
:::

### Troubleshooting

#### La skill ne se déclenche pas

1. Vérifier que la description contient des mots-clés que l'utilisateur emploierait naturellement
2. Vérifier avec `What skills are available?` que la skill apparaît
3. Reformuler la requête pour mieux correspondre à la description
4. Invoquer directement avec `/skill-name` pour tester

#### La skill se déclenche trop souvent

1. Rendre la description plus spécifique
2. Ajouter `disable-model-invocation: true` si seule l'invocation manuelle est souhaitée

#### Claude ne voit pas toutes les skills

Les descriptions de skills sont chargées dans un budget de **2% de la fenêtre de contexte** (~16 000 caractères). Si beaucoup de skills :

1. Lancer `/context` pour voir les skills exclues
2. Passer certaines en `disable-model-invocation: true` (exclues du budget)
3. Raccourcir les descriptions
4. Augmenter via `SLASH_COMMAND_TOOL_CHAR_BUDGET`

---

## Exemples concrets

### Exemple 1 : Skill passive — Conventions API

```yaml
---
name: api-conventions
description: Conventions backend Symfony pour ce projet. Architecture
  REST, DTOs, repositories avec filtrage, gestion d'exceptions.
user-invocable: false
---

# Conventions API Symfony

## Architecture
Controller → Service → Repository → Entity

## Standards
- PSR-12 strict
- UUID pour toutes les cles primaires
- camelCase methodes, PascalCase classes
- Toutes les commandes via Docker :
  `docker compose exec -T app [cmd] 2>&1 | cat`

## References detaillees
- Creer une entite → [create-entity.md](references/create-entity.md)
- Creer un DTO → [create-dto.md](references/create-dto.md)
- Creer un controller → [create-controller.md](references/create-controller.md)
```

**14 fichiers de référence** couvrent chaque pattern en détail.

::: info Pourquoi passive ?
Les conventions ne sont pas une action. Claude doit les connaître quand il travaille sur le backend, pas quand l'utilisateur tape `/api-conventions`.
:::

### Exemple 2 : Skill launcher — Migration E2E

```yaml
---
name: modernization/migrate-feature
description: Migration end-to-end d'une feature legacy vers la stack moderne
disable-model-invocation: true
argument-hint: "[feature-name] [stage]"
---

# Migration de $0

## Etape 1 : Specification detaillee
Lancer l'agent `legacy-feature-analyzer` sur la feature $0.
**Checkpoint** : Verifier que `output/features/$0_spec.md` existe.

## Etape 2 : Planification
Lancer en PARALLELE :
- `backend-tasks-planner`
- `frontend-tasks-planner`
**Checkpoint** : Les fichiers _analysis.md existent.

## Etape 3 : Implementation TDD
1. `backend-tasks-executor` (tests avant code)
2. `frontend-tasks-executor` (appels HTTP directs)
**Checkpoint** : Tous les tests passent.

## Etape 4 : Conformite
Lancer `conformity-reporter`. Ne JAMAIS ecraser — creer V2, V3...
```

::: warning disable-model-invocation: true
TOUJOURS mettre `true` pour les workflows avec effets de bord. On ne veut pas que Claude lance une migration parce qu'il "pense que c'est pertinent".
:::

### Exemple 3 : Skill avec injection dynamique

```yaml
---
name: pr-summary
description: Resume les changements d'une pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Contexte de la PR
- Diff : !`gh pr diff`
- Commentaires : !`gh pr view --comments`
- Fichiers modifies : !`gh pr diff --name-only`

## Tache
Resumer cette PR en 3-5 points. Identifier les risques.
```

::: tip Injection dynamique
La syntaxe `` !`commande` `` exécute la commande AVANT l'envoi au modèle. Claude reçoit le résultat, pas la commande. Idéal pour du contexte live (PR diff, git log, API status).
:::

### Exemple 4 : Skill avec script intégré

```yaml
---
name: codebase-visualizer
description: Genere une visualisation interactive de la structure du projet
allowed-tools: Bash(python *)
disable-model-invocation: true
---

# Visualisation du codebase

Executer le script :
`python ${CLAUDE_SKILL_DIR}/scripts/visualize.py .`

Le script genere `codebase-map.html` et l'ouvre dans le navigateur.
```

---

## Checklist de lancement

### Contenu & type

- [ ] Description précise avec mots-clés naturels
- [ ] Type correct ([decision tree](#passive-vs-launcher))
- [ ] `disable-model-invocation: true` pour les actions à risque
- [ ] SKILL.md < 500 lignes, détail dans `references/`

### Cohérence projet

- [ ] Pas de duplication avec une rule existante ([piège 4](#piege-4-duplication-skill-rule))
- [ ] Namespace cohérent (`framework/`, `workflow/`)
- [ ] Skills listées dans les agents qui en ont besoin (`skills:`)

### Sécurité & visibilité

- [ ] `allowed-tools` limité au strict nécessaire
- [ ] `context: fork` si la skill doit tourner en isolation
- [ ] Permissions deny configurées si besoin (`Skill(name *)`)

### Validation

- [ ] Testée manuellement avec `/skill-name`
- [ ] Testée en auto-invocation (message libre qui matche la description)
- [ ] Budget contexte vérifié (`/context`)

---

## Ressources

- [Documentation officielle — Skills](https://code.claude.com/docs/en/skills)
- [Standard Agent Skills](https://agentskills.io)
- [Spécification du format](https://agentskills.io/specification)
- [Exemples de skills Anthropic](https://github.com/anthropics/skills)
