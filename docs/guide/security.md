# Sécurité & Permissions

## Vue d'ensemble

La sécurité dans Claude Code repose sur 4 couches complémentaires :

```
Couche 1 : Settings (permissions allow/deny)
Couche 2 : Rules (rappels contextuels)
Couche 3 : Hooks (validation active pre/post)
Couche 4 : MCP (confiance par serveur)
```

## Couche 1 : Permissions (settings.json)

### Principe du moindre privilège

Autoriser uniquement ce qui est nécessaire :

```json
{
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(npm test *)",
      "Bash(git status)",
      "Bash(docker compose exec *)"
    ],
    "deny": [
      "Write(secrets/**)",
      "Edit(secrets/**)",
      "Bash(rm -rf *)",
      "Bash(curl * | bash)",
      "Bash(git push --force *)"
    ]
  }
}
```

### Patterns de deny critiques

| Pattern | Protection |
|---------|-----------|
| `Write(secrets/**)` | Empêche l'écriture dans les fichiers secrets |
| `Bash(rm -rf *)` | Bloque la suppression récursive |
| `Bash(curl * \| bash)` | Bloque l'exécution de code distant |
| `Bash(git push --force *)` | Empêche le force push |
| `Write(.env*)` | Protège les fichiers d'environnement |

### Protéger le code source

Pour un projet de migration, protéger le legacy en lecture seule :

```json
{
  "permissions": {
    "deny": [
      "Write(php-legacy/**)",
      "Edit(php-legacy/**)"
    ]
  }
}
```

## Couche 2 : Rules de sécurité

Rappels injectés automatiquement pour les zones sensibles :

```markdown
---
paths:
  - "infrastructure/**"
---

# Infrastructure — Zone critique

- Ne JAMAIS modifier les fichiers Terraform sans review manuelle
- Ne JAMAIS supprimer de ressources cloud
- Proposer les changements, attendre validation explicite
```

## Couche 3 : Hooks de validation

### Bloquer les commandes dangereuses

```bash
#!/bin/bash
# security-gate.sh — reference depuis settings.json

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Liste noire de commandes
BLOCKED_PATTERNS=(
  'rm -rf /'
  'curl.*| bash'
  'wget.*| sh'
  'chmod 777'
  'git push.*--force.*main'
  'DROP TABLE'
  'DROP DATABASE'
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    echo "BLOQUE: pattern dangereux detecte: $pattern" >&2
    exit 2
  fi
done

exit 0
```

### Détecter les secrets dans le code

```bash
#!/bin/bash
# secret-scanner.sh — reference depuis settings.json

INPUT=$(cat)
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // empty')

SECRET_PATTERNS=(
  'AKIA[0-9A-Z]{16}'           # AWS Access Key
  'sk-[a-zA-Z0-9]{48}'         # OpenAI API Key
  'ghp_[a-zA-Z0-9]{36}'        # GitHub PAT
  'xoxb-[0-9]+-[a-zA-Z0-9]+'   # Slack Bot Token
  'password\s*=\s*["\x27][^"\x27]{8,}'  # Mot de passe hardcode
)

for pattern in "${SECRET_PATTERNS[@]}"; do
  if echo "$CONTENT" | grep -qE "$pattern"; then
    echo "BLOQUE: secret potentiel detecte" >&2
    exit 2
  fi
done

exit 0
```

### Configuration des hooks dans settings.json

::: info Hooks = settings.json, pas un dossier
Les hooks sont configurés dans `settings.json` (champ `hooks`), pas dans un dossier `.claude/hooks/`. Les scripts référencés peuvent être placés n'importe où dans le projet.
:::

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "bash scripts/security-gate.sh"
        }]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "bash scripts/secret-scanner.sh"
        }]
      }
    ]
  }
}
```

## Couche 4 : Sécurité MCP

### Vérification des serveurs

- Ne jamais installer de serveurs MCP de sources non vérifiées
- Vérifier les permissions de chaque outil exposé
- Utiliser des variables d'environnement pour les tokens

### Permissions MCP granulaires

```json
{
  "permissions": {
    "allow": [
      "mcp__github__list_prs",
      "mcp__github__get_issue"
    ],
    "deny": [
      "mcp__github__delete_repo",
      "mcp__github__create_release"
    ]
  }
}
```

## Checklist de sécurité

### Projet neuf

- [ ] `settings.json` avec deny explicites
- [ ] Rule de protection pour les fichiers sensibles
- [ ] Convention de secrets via variables d'environnement
- [ ] `.gitignore` incluant `.env`, `credentials*`, `*.pem`

### Projet en production

- [ ] Hooks PreToolUse pour bloquer les commandes dangereuses
- [ ] Hooks de détection de secrets dans Write/Edit
- [ ] Permissions MCP granulaires
- [ ] Audit régulier des permissions allow

### Équipe

- [ ] Managed settings au niveau enterprise
- [ ] Skills de review sécurité partagées
- [ ] Documentation des permissions dans CLAUDE.md
- [ ] Formation sur les modes de permission

## Modes de permission

| Situation | Mode recommandé |
|-----------|----------------|
| Exploration initiale | Plan Mode (lecture seule) |
| Développement quotidien | Default (confirmation par action) |
| Workflow rodé avec hooks | Accept Edits |
| CI/CD automatisé | Don't Ask (avec hooks de sécurité) |
| Dev/test uniquement | Bypass Permissions (désactive toute sécurité) |

::: danger Bypass Permissions
Désactive **toute** sécurité. Peut être bloqué par l'admin via `permissions.disableBypassPermissionsMode: "disable"` dans managed settings.
:::

## Couche 5 : Sandbox

Le sandbox isole les commandes Bash du filesystem et du réseau (macOS, Linux, WSL2) :

```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "filesystem": {
      "allowWrite": ["//tmp/build"],
      "denyRead": ["~/.aws/credentials", "~/.ssh/id_rsa"]
    },
    "network": {
      "allowedDomains": ["github.com", "*.npmjs.org"]
    }
  }
}
```

## Ressources

- [Documentation officielle — Permissions](https://code.claude.com/docs/en/permissions)
- [Documentation officielle — Settings](https://code.claude.com/docs/en/settings)
- [Documentation officielle — Hooks](https://code.claude.com/docs/en/hooks)
