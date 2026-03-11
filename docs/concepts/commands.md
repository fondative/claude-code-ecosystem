# Commands

## TL;DR

| Aspect | Détail |
|--------|--------|
| **Quoi** | Actions invocables par l'utilisateur via `/nom` |
| **Où** | `.claude/commands/` (projet) ou `~/.claude/commands/` (personnel) |
| **Status** | Fusionné avec les skills — commands continuent de fonctionner, skills recommandées pour les nouveaux workflows |
| **Priorité** | Un command et un skill avec le même nom → le skill gagne |
| **Arguments** | Via `$ARGUMENTS`, `$0`, `$1`, `${CLAUDE_SESSION_ID}`, `${CLAUDE_SKILL_DIR}` |

---

## Qu'est-ce qu'un Command ?

Un command (ou slash command) est un fichier Markdown dans `.claude/commands/` qui définit une **action invocable par l'utilisateur** via `/nom`. Depuis la fusion avec les skills, les commands partagent **le même système de frontmatter** que les skills. Les skills sont recommandées pour les nouveaux workflows car elles supportent des fonctionnalités supplémentaires (fichiers de support, chargement automatique).

```
┌──────────────────────────────────────┐
│  Utilisateur tape : /dev/commit      │
│         │                            │
│         ▼                            │
│  Claude charge :                     │
│  .claude/commands/dev/commit.md      │
│         │                            │
│         ▼                            │
│  Execute les instructions :          │
│  1. git diff --staged                │
│  2. Determiner type/scope            │
│  3. Proposer message                 │
│  4. Commiter                         │
└──────────────────────────────────────┘
```

::: info Commands = Skills sans dossier
Les commands supportent **le même frontmatter** que les skills. La seule différence : un command est un fichier `.md` unique, un skill est un dossier avec `SKILL.md` + fichiers de support optionnels.
:::

---

## Comment ça marche

### Équivalence Skills / Commands

| Aspect | Command | Skill |
|--------|---------|-------|
| Emplacement | `.claude/commands/review.md` | `.claude/skills/review/SKILL.md` |
| Invocation | `/review` | `/review` |
| Fichiers de support | ❌ | ✅ (`references/`, `scripts/`) |
| Chargement auto | ❌ | ✅ (sauf `disable-model-invocation`) |
| Frontmatter | **Même système complet** | **Même système complet** |
| **Recommandation** | Existants OK | **Préféré pour les nouveaux** |

::: info Migration progressive
Vos fichiers `.claude/commands/` continuent de fonctionner. Si un command et un skill partagent le même nom, le skill a priorité. Migrez progressivement.
:::

### Frontmatter (même que skills)

Les commands supportent **tous** les champs du frontmatter skills :

| Champ | Description |
|-------|-------------|
| `name` | Nom affiché (défaut : nom du fichier) |
| `description` | Ce que fait le command — aide l'autocomplétion |
| `argument-hint` | Indice pour les arguments (`[unit\|path]`) |
| `disable-model-invocation` | `true` = invocation manuelle uniquement |
| `user-invocable` | `false` = invisible dans le menu `/` |
| `allowed-tools` | Outils autorisés sans confirmation |
| `model` | Modèle à utiliser |
| `context` | `fork` pour exécuter dans un subagent isolé |
| `agent` | Type de subagent si `context: fork` |
| `hooks` | Hooks scopés au lifecycle du command |

### Variables de substitution

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | Tous les arguments passés |
| `$ARGUMENTS[N]` ou `$N` | Argument par index (0-based) |
| `${CLAUDE_SESSION_ID}` | ID de la session courante |
| `${CLAUDE_SKILL_DIR}` | Répertoire contenant le fichier |

### Injection dynamique

La syntaxe `` !`command` `` exécute du shell **avant** l'envoi du contenu à Claude :

```yaml
---
name: pr-summary
description: Resume les changements d'une PR
context: fork
---

## Contexte PR
- Diff: !`gh pr diff`
- Commentaires: !`gh pr view --comments`
- Fichiers: !`gh pr diff --name-only`

## Tache
Resumer cette pull request...
```

Les commandes shell s'exécutent d'abord, leur sortie remplace le placeholder, et Claude reçoit le prompt final avec les données réelles.

### Scopes et priorité

| Scope | Emplacement | Priorité | Partage |
|-------|-------------|----------|---------|
| **Enterprise** | Managed settings | La plus haute | Organisation |
| **Personnel** | `~/.claude/commands/*.md` | Moyenne | Tous vos projets |
| **Projet** | `.claude/commands/*.md` | Standard | Équipe (git) |

Les commands projet écrasent les commands personnels avec le même nom.

::: tip Commands personnels
`~/.claude/commands/` permet de définir des commandes qui vous suivent sur **tous** vos projets (ex: `/my-commit`, `/my-review`).
:::

### Organisation en sous-dossiers

Les sous-dossiers deviennent des namespaces :

```
.claude/commands/
├── dev/
│   ├── commit.md        # → /dev/commit
│   ├── php-test.md      # → /dev/php-test
│   └── php-lint.md      # → /dev/php-lint
└── review/
    └── symfony-review.md # → /review/symfony-review
```

---

## Guide pratique : concevoir ses commands

### Quand utiliser un command vs un skill ?

```
Besoin de fichiers de support (references, scripts) ?
├── OUI → SKILL (seul format qui le supporte)
└── NON
    Besoin de chargement automatique par Claude ?
    ├── OUI → SKILL (avec description)
    └── NON
        Command existant et fonctionnel ?
        ├── OUI → Garder le command (pas de migration urgente)
        └── NON → Creer un SKILL (format moderne)
```

### Quand migrer vers skill

Migrer un command vers un skill quand :
- Besoin de fichiers de référence
- Besoin de scripts exécutables
- Besoin de `context: fork` (exécution isolée)
- Besoin de `hooks` scopés au lifecycle
- Création d'un nouveau workflow

### Les erreurs à éviter

#### ❌ Piège 1 : Command et Skill avec le même nom

```
# ❌ — Conflit de noms
.claude/commands/review.md
.claude/skills/review/SKILL.md
# → Le skill a priorite, le command est ignore
```

> Choisir l'un ou l'autre, pas les deux.

#### ❌ Piège 2 : Oubli des flags Docker

```bash
# ❌ — TTY + sortie perdue
docker compose exec app php bin/phpunit
```

```bash
# ✅ — Flags corrects
docker compose exec -T app php bin/phpunit 2>&1 | cat
```

#### ❌ Piège 3 : Command sans description

```yaml
# ❌ — L'autocompletion ne montre rien d'utile
---
name: test
---
```

```yaml
# ✅ — Description claire
---
name: php-test
description: Lancer les tests backend via Docker Compose
argument-hint: "[unit|integration|functional]"
---
```

#### ❌ Piège 4 : Logique trop complexe

```markdown
# ❌ — Branching, conditions, 200 lignes d'instructions
```

```markdown
# ✅ — Extraire la logique complexe dans un skill avec fichiers de support
```

> Un command = un fichier unique. Si la logique déborde, c'est un skill.

#### ❌ Piège 5 : Dépendances cachées

```yaml
# ❌ — Necessite gh CLI + Docker mais ne le dit pas
---
name: deploy
---
```

```yaml
# ✅ — Prerequis documentes
---
name: deploy
description: Deploy via Docker (necessite gh CLI et Docker)
---
```

---

## Exemples concrets

### Exemple 1 : /dev/commit

```yaml
---
name: commit
description: Commit avec Conventional Commits
disable-model-invocation: true
---

# Commit

1. Analyser `git diff --staged` et `git diff`
2. Determiner le type : feat, fix, refactor, docs, test, chore
3. Deduire le scope depuis les fichiers modifies
4. Proposer : `type(scope): description concise`
5. Ajouter `Co-Authored-By: Claude <noreply@anthropic.com>`

⚠️ Si hook pre-commit echoue → corriger → NOUVEAU commit (PAS amend)
```

### Exemple 2 : /dev/php-test

```yaml
---
name: php-test
description: Lancer les tests backend via Docker
disable-model-invocation: true
argument-hint: "[unit|integration|functional|path]"
---

# Tests PHP

Commande : `docker compose exec -T app php bin/phpunit $ARGUMENTS 2>&1 | cat`

## Arguments
- (vide) : tous les tests
- `unit` : `--testsuite unit`
- `integration` : `--testsuite integration`
- `functional` : `--testsuite functional`
- chemin : fichier ou dossier specifique
```

::: tip Flags Docker
`-T` désactive le TTY (évite les problèmes d'exit code).
`2>&1 | cat` capture toute la sortie.
:::

### Exemple 3 : /review/symfony-review

```yaml
---
name: symfony-review
description: Review de code avec checklist qualite
disable-model-invocation: true
argument-hint: "[path]"
---

# Code Review Symfony

## Checklist
1. **Architecture** : Controller → Service → Repository
2. **Standards** : PSR-12, nommage, typage
3. **Securite** : injection, validation, auth
4. **Tests** : couverture, cas limites
5. **Qualite** : DRY, SOLID, lisibilite

## Severites
- CRITIQUE : bloquant, securite
- ELEVE : bug potentiel
- MOYEN : style, lisibilite
- BAS : suggestion

## Verdict
APPROVED | CORRECTIONS REQUIRED | REFONTE NEEDED
```

### Exemple 4 : Injection dynamique

```yaml
---
name: pr-review
description: Review automatique de la PR courante
disable-model-invocation: true
context: fork
agent: Explore
---

## Contexte
- Diff: !`gh pr diff`
- Fichiers modifies: !`gh pr diff --name-only`

## Tache
Analyser les changements et produire une review structuree.
```

---

## Checklist de lancement

### Contenu

- [ ] Un fichier = une action (extraire la logique complexe en skill)
- [ ] `description` claire et `argument-hint` si arguments
- [ ] Prérequis documentés (outils, services requis)

### Invocation

- [ ] `disable-model-invocation: true` pour les commandes à effet de bord
- [ ] Pas de conflit de nom avec un skill existant
- [ ] `argument-hint` pour guider l'autocomplétion

### Organisation

- [ ] Sous-dossiers sémantiques (`dev/`, `review/`, `deploy/`)
- [ ] Commands personnels dans `~/.claude/commands/` si multi-projets
- [ ] Nommage : `{action}.md` (kebab-case)

### Docker (si applicable)

- [ ] Flag `-T` pour désactiver le TTY
- [ ] `2>&1 | cat` pour capturer toute la sortie
- [ ] Chemin complet de la commande dans le container

---

## Ressources

- [Documentation officielle — Skills (section Commands)](https://code.claude.com/docs/en/skills)
- [Documentation officielle — Interactive Mode](https://code.claude.com/docs/en/interactive-mode)
