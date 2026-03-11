# Bibliothèque de templates

Templates copier-coller pour démarrer rapidement.

## Agents

### Agent reviewer (Sonnet)

```yaml
---
name: code-reviewer
description: Review de code avec checklist qualite et securite
tools: Read, Glob, Grep
model: sonnet
---

# Code Review

Analyser les fichiers modifies (git diff) et verifier :

## Checklist
1. **Architecture** : separation des responsabilites
2. **Standards** : conventions de style, nommage
3. **Securite** : injection, validation, auth
4. **Tests** : couverture, cas limites, mocking
5. **Performance** : N+1, boucles, memoire

## Severites
- CRITIQUE : bloquant, faille securite
- ELEVE : bug probable, mauvais design
- MOYEN : lisibilite, maintenabilite
- BAS : suggestion, style

## Verdict
APPROVED | CORRECTIONS REQUIRED | REFONTE NEEDED
```

### Agent test writer (Sonnet)

```yaml
---
name: test-writer
description: Generer des tests exhaustifs pour le code existant
tools: Read, Glob, Grep, Write
model: sonnet
---

# Test Writer

Pour chaque fichier/classe cible :

1. Identifier les methodes publiques
2. Pour chaque methode, generer :
   - Test nominal (happy path)
   - Tests aux limites (edge cases)
   - Tests d'erreur (exceptions, invalides)
3. Utiliser le framework de test du projet
4. Conventions de nommage : test_[methode]_[scenario]
```

### Agent security auditor (Sonnet)

```yaml
---
name: security-auditor
description: Audit OWASP Top 10 sur le code source
tools: Read, Glob, Grep
model: sonnet
---

# Security Audit

Scanner pour les vulnerabilites OWASP Top 10 :

1. Injection (SQL, Command, LDAP)
2. Broken Authentication
3. Sensitive Data Exposure
4. XML External Entities (XXE)
5. Broken Access Control
6. Security Misconfiguration
7. Cross-Site Scripting (XSS)
8. Insecure Deserialization
9. Using Components with Known Vulnerabilities
10. Insufficient Logging & Monitoring

## Format du rapport
Pour chaque trouvaille :
- Severite : CRITIQUE / HAUTE / MOYENNE / BASSE
- Fichier et ligne
- Description du risque
- Remediation suggeree
```

### Agent planner (Opus, read-only)

```yaml
---
name: architecture-planner
description: Planification architecturale sans modification de code
tools: Read, Glob, Grep
model: opus
---

# Architecture Planning

1. Analyser la structure actuelle du projet
2. Identifier les patterns en place
3. Proposer un plan d'implementation detaille :
   - Fichiers a creer/modifier
   - Ordre de creation (dependances)
   - Tests a ecrire
   - Risques et alternatives

NE JAMAIS modifier de code. Seulement analyser et recommander.
```

---

## Skills

### Skill passive — Conventions TypeScript

```yaml
---
name: ts-conventions
description: Conventions TypeScript pour le projet.
  Style, patterns, architecture des composants.
user-invocable: false
---

# Conventions TypeScript

## Style
- Strict mode (`"strict": true` dans tsconfig)
- Interfaces > Types (sauf unions/intersections)
- Pas de `any` — utiliser `unknown` + type guards
- Enums string > Enums numeriques

## Architecture
- Barrel exports (`index.ts`) par module
- Services dans `services/`, types dans `types/`
- Composants : PascalCase fichiers, kebab-case dossiers

## Tests
- Fichiers `.test.ts` a cote du source
- Describe/it en anglais, messages descriptifs
```

### Skill launcher — Feature flag toggle

```yaml
---
name: toggle-feature
description: Activer/desactiver un feature flag en production
disable-model-invocation: true
argument-hint: "[flag-name] [on|off]"
---

# Toggle Feature Flag

1. Verifier que le flag `$0` existe dans la config
2. Modifier la valeur a `$1` (on/off)
3. Lancer les tests de smoke
4. Si tests OK → commiter avec `feat(flags): toggle $0 $1`
5. Si tests KO → rollback + rapport d'erreur
```

---

## Hooks

### Hook sécurité complet

```bash
#!/bin/bash
# security-gate.sh — reference dans settings.json hooks
# PreToolUse matcher: Bash

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Commandes destructrices
BLOCKED=(
  'rm -rf /'
  'rm -rf \.'
  'chmod 777'
  'curl.*| bash'
  'wget.*| sh'
  'git push.*--force.*main'
  'git reset --hard'
  'DROP TABLE'
  'DROP DATABASE'
  'TRUNCATE'
)

for p in "${BLOCKED[@]}"; do
  if echo "$COMMAND" | grep -qiE "$p"; then
    echo "BLOQUE: $p" >&2
    exit 2
  fi
done

exit 0
```

### Hook détection de secrets

```bash
#!/bin/bash
# secret-scanner.sh — reference dans settings.json hooks
# PreToolUse matcher: Write, Edit

INPUT=$(cat)
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // empty')

SECRETS=(
  'AKIA[0-9A-Z]{16}'                # AWS
  'sk-[a-zA-Z0-9]{48}'              # OpenAI
  'ghp_[a-zA-Z0-9]{36}'             # GitHub PAT
  'xoxb-[0-9]+-[a-zA-Z0-9]+'        # Slack
  'AIza[0-9A-Za-z_-]{35}'           # Google API
  'SG\.[a-zA-Z0-9_-]{22}\.'        # SendGrid
)

for p in "${SECRETS[@]}"; do
  if echo "$CONTENT" | grep -qE "$p"; then
    echo "BLOQUE: secret detecte ($p)" >&2
    exit 2
  fi
done

exit 0
```

---

## Configurations

### settings.json — Projet web (Node.js)

```json
{
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(npm test *)",
      "Bash(npm run *)",
      "Bash(npx *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git add *)",
      "Bash(ls *)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Write(.env*)",
      "Edit(.env*)"
    ]
  }
}
```

### settings.json — Projet Docker (PHP/Symfony)

```json
{
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(docker compose *)",
      "Bash(git status)", "Bash(git diff *)",
      "Bash(git log *)", "Bash(git add *)",
      "Bash(ls *)", "Bash(find *)", "Bash(mkdir *)"
    ],
    "deny": [
      "Write(legacy-src/**)",
      "Edit(legacy-src/**)",
      "Bash(rm -rf *)"
    ]
  }
}
```

### CLAUDE.md — Template de démarrage

```markdown
# Mon Projet

## Stack
- Runtime : [Node.js 20 / PHP 8.2 / Python 3.12]
- Framework : [Express / Symfony / FastAPI]
- DB : [PostgreSQL / MySQL / MongoDB]
- Tests : [Jest / PHPUnit / pytest]

## Commandes
- `[npm test / docker compose exec app phpunit]` : Tests
- `[npm run lint / phpcs]` : Lint
- `[npm run build / docker compose build]` : Build

## Conventions
- [Style : camelCase / snake_case]
- [Architecture : MVC / Hexagonal / Clean]
- [Tests avant code (TDD)]

## Workflow
1. /plan → Explorer
2. Implementer → Tests first
3. /dev/commit → Conventional Commits
```

---

## Rules

### Rule de protection

```markdown
---
paths:
  - "legacy/**"
---

# Legacy — LECTURE SEULE

NE JAMAIS modifier ces fichiers. Read, Glob, Grep uniquement.
```

### Rule de délégation

```markdown
---
paths:
  - "src/api/**"
---

# API

Charger la skill `api-conventions` pour les conventions.
Rappels : REST, validation DTO, tests intégration.
```

### Rule globale (git)

```markdown
---
---

# Git

- Conventional Commits : type(scope): description
- Ne jamais force-push sur main
- Toujours utiliser /dev/commit
```

---

## GitHub Actions

### Review automatique de PR

```yaml
# .github/workflows/claude-review.yml
name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Claude Review
        run: |
          gh pr diff ${{ github.event.pull_request.number }} > /tmp/diff.txt
          # Envoyer le diff a Claude via API pour review
```

## Ressources

- [Exemples officiels Anthropic](https://github.com/anthropics/skills)
- [Templates Bruniaux](https://github.com/FlorianBruniaux/claude-code-ultimate-guide/tree/main/examples)
