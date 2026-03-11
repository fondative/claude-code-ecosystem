# Référence Frontmatter

## Agents

Les agents utilisent un frontmatter YAML en début de fichier `.claude/agents/<nom>.md` :

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
```

### Champs

| Champ | Requis | Type | Description |
|-------|--------|------|-------------|
| `name` | Oui | string | Identifiant unique de l'agent |
| `description` | Oui | string | Ce que fait l'agent (1-2 lignes). Utilisée par Claude pour la délégation auto |
| `tools` | Oui | string (CSV) | Outils autorisés : `Read`, `Glob`, `Grep`, `Write`, `Edit`, `Bash` |
| `model` | Oui | string | Modèle : `opus`, `sonnet`, `haiku` |
| `skills` | Non | list | Skills héritées (noms de dossiers dans `.claude/skills/`) |
| `allowed-tools` | Non | string (CSV) | Outils autorisés sans confirmation (ex: `Bash(docker *)`) |
| `disable-model-invocation` | Non | boolean | `true` = seul l'utilisateur peut spawner cet agent |
| `user-invocable` | Non | boolean | `false` = invisible dans le menu, délégation Claude uniquement |
| `context` | Non | string | `fork` = exécuter dans un sub-agent isolé |
| `agent` | Non | string | Type de sub-agent si `context: fork` (défaut: `general-purpose`) |
| `argument-hint` | Non | string | Hint d'autocomplétion (ex: `[feature-name]`) |
| `hooks` | Non | object | Hooks spécifiques au cycle de vie de l'agent |
| `run_in_background` | Non | boolean | Exécuter l'agent en arrière-plan |

### Valeurs de model

| Valeur | Modèle | ID complet |
|--------|--------|-----------|
| `opus` | Claude Opus 4.6 | `claude-opus-4-6` |
| `sonnet` | Claude Sonnet 4.6 | `claude-sonnet-4-6` |
| `haiku` | Claude Haiku 4.5 | `claude-haiku-4-5-20251001` |

### Outils disponibles

| Outil | Description | Usage type |
|-------|-------------|-----------|
| `Read` | Lire un fichier | Analyse, consultation |
| `Glob` | Rechercher des fichiers par pattern | Navigation |
| `Grep` | Rechercher du contenu dans les fichiers | Analyse de code |
| `Write` | Créer/écraser un fichier | Génération |
| `Edit` | Modifier un fichier existant | Implémentation |
| `Bash` | Exécuter une commande shell | Tests, build, git |

---

## Skills

Les skills utilisent un frontmatter YAML en début de `SKILL.md` :

```yaml
---
name: api-conventions
description: Conventions backend Symfony pour ce projet
user-invocable: false
---
```

```yaml
---
name: deploy
description: Déployer l'application en production
disable-model-invocation: true
context: fork
agent: Explore
allowed-tools: Bash(gh *), Read
argument-hint: "[environment]"
---
```

### Champs

| Champ | Requis | Type | Défaut | Description |
|-------|--------|------|--------|-------------|
| `name` | Non | string | nom du dossier | Nom d'affichage et `/slash-command`. Minuscules, chiffres, tirets (max 64 car.) |
| `description` | Recommandé | string | 1er paragraphe | Ce que fait la skill. Claude l'utilise pour décider quand la charger |
| `disable-model-invocation` | Non | boolean | `false` | `true` = seulement l'utilisateur peut invoquer |
| `user-invocable` | Non | boolean | `true` | `false` = invisible dans le menu `/` |
| `allowed-tools` | Non | string (CSV) | - | Outils autorisés sans confirmation |
| `model` | Non | string | - | Modèle à utiliser |
| `context` | Non | string | - | `fork` = exécuter dans un sub-agent isolé |
| `agent` | Non | string | `general-purpose` | Type de sub-agent si `context: fork` |
| `argument-hint` | Non | string | - | Hint d'autocomplétion (ex: `[issue-number]`) |
| `hooks` | Non | object | - | Hooks spécifiques au cycle de vie de la skill |

### Combinaisons de visibilité

| `user-invocable` | `disable-model-invocation` | Utilisateur | Claude | Description chargée |
|-------------------|--------------------------|-------------|--------|-------------------|
| `true` (défaut) | `false` (défaut) | ✅ | ✅ | Oui |
| `true` | `true` | ✅ | ❌ | Non |
| `false` | `false` | ❌ | ✅ | Oui |

### Variables de substitution

| Variable | Description | Exemple |
|----------|-------------|---------|
| `$ARGUMENTS` | Tous les arguments | `/skill foo bar` → `foo bar` |
| `$ARGUMENTS[N]` | Argument par index | `$ARGUMENTS[0]` → `foo` |
| `$N` | Raccourci pour `$ARGUMENTS[N]` | `$0` → `foo` |
| `${CLAUDE_SESSION_ID}` | ID de la session | `abc123-def456` |
| `${CLAUDE_SKILL_DIR}` | Dossier du SKILL.md | `/path/to/.claude/skills/my-skill` |

### Injection dynamique

```markdown
Contenu avant : !`gh pr diff`
```

La commande entre `` !` `` et `` ` `` est exécutée avant l'envoi au modèle. La sortie remplace le placeholder.

---

## Rules

Les rules utilisent un frontmatter YAML minimal :

```yaml
---
paths:
  - "api-rest-symfony-target/**"
  - "api-rest-symfony-target/tests/**"
---
```

### Champs

| Champ | Requis | Type | Description |
|-------|--------|------|-------------|
| `paths` | Non | list | Glob patterns. Si absent = rule globale (toujours active) |

### Exemples de glob patterns

| Pattern | Matche |
|---------|--------|
| `src/**` | Tous les fichiers dans src/ récursivement |
| `src/*.ts` | Fichiers .ts au premier niveau de src/ |
| `src/**/*.test.ts` | Tous les fichiers de test dans src/ |
| `*.md` | Fichiers Markdown à la racine |
| `**` | Tous les fichiers (à éviter) |

---

## Commands

Les commands supportent le même frontmatter que les skills :

```yaml
---
name: commit
description: Commit avec Conventional Commits
disable-model-invocation: true
---
```

Les champs sont identiques à ceux des skills. La différence est l'emplacement : `.claude/commands/` vs `.claude/skills/`.
