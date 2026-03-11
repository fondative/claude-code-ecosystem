# Démarrage rapide

## Prérequis

- Claude Code installé (`npm install -g @anthropic-ai/claude-code` ou via l'extension VS Code)
- Un projet existant avec un dossier `.git/`

## Étape 1 : Initialiser CLAUDE.md

::: tip Alternative rapide
Utiliser `/init` dans Claude Code pour générer automatiquement un CLAUDE.md adapté à votre projet (analyse la structure, stack et commandes).
:::

Ou créer manuellement un fichier `CLAUDE.md` à la racine du projet :

```markdown
# Mon Projet

## Stack
- Runtime : Node.js 20
- Framework : Express
- Base de donnees : PostgreSQL
- Tests : Jest

## Commandes
- `npm test` : Lancer les tests
- `npm run lint` : Verifier le style
- `npm run build` : Build de production

## Conventions
- camelCase pour les variables et fonctions
- PascalCase pour les classes
- Tests avant code (TDD)
```

::: tip
Gardez le fichier court et factuel. Claude le charge à chaque session.
:::

## Étape 2 : Créer le dossier .claude/

```bash
mkdir -p .claude/{agents,skills,rules,commands}
```

## Étape 3 : Première rule

Créer `.claude/rules/git.md` pour standardiser les commits :

```markdown
---
---

# Git

- Toujours utiliser Conventional Commits : `type(scope): description`
- Types : feat, fix, refactor, docs, test, chore
- Ne jamais force-push sur main
```

## Étape 4 : Première skill

Créer `.claude/skills/code-review/SKILL.md` :

```yaml
---
name: code-review
description: Review de code avec checklist qualite
disable-model-invocation: true
---

# Code Review

Analyser les fichiers modifies et verifier :

1. **Lisibilite** : nommage clair, fonctions courtes
2. **Securite** : pas d'injection, validation des entrees
3. **Tests** : couverture des cas principaux et limites
4. **Performance** : pas de N+1, pas de boucles inutiles

Donner un verdict : APPROVED / CORRECTIONS NEEDED
```

Tester : `/code-review src/auth/`

## Étape 5 : Premier agent

Créer `.claude/agents/code-explainer.md` :

```yaml
---
name: code-explainer
description: Explique le code avec des analogies et diagrammes
tools: Read, Glob, Grep
model: haiku
---

Quand on te demande d'expliquer du code :

1. Commence par une analogie du quotidien
2. Dessine un diagramme ASCII du flux
3. Explique etape par etape
4. Signale un piege courant
```

## Étape 6 : Configurer les permissions

Créer `.claude/settings.json` :

```json
{
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(npm test *)",
      "Bash(npm run lint *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)"
    ],
    "deny": [
      "Bash(rm -rf *)"
    ]
  }
}
```

## Structure obtenue

```
mon-projet/
├── CLAUDE.md
├── .claude/
│   ├── settings.json
│   ├── agents/
│   │   └── code-explainer.md
│   ├── skills/
│   │   └── code-review/
│   │       └── SKILL.md
│   ├── rules/
│   │   └── git.md
│   └── commands/
└── src/
```

## Prochaines étapes

- [Bonnes pratiques](/guide/best-practices) pour structurer un projet complet
- [Patterns multi-agents](/guide/patterns) pour orchestrer des workflows complexes
- [Sécurité](/guide/security) pour durcir la configuration
- [Exemples concrets](/examples/) d'un projet réel
