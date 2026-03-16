# Hooks

## TL;DR

| Aspect | Détail |
|--------|--------|
| **Quoi** | Scripts, endpoints HTTP ou prompts LLM exécutés avant/après les actions de Claude |
| **Où** | [`settings.json`](/concepts/settings) (section `hooks`), frontmatter de [skills](/concepts/skills)/[agents](/concepts/agents) |
| **Types** | `command` (shell), `http` (POST), `prompt` (LLM) |
| **Events** | 18 points d'exécution dans le lifecycle |
| **Sécurité** | Bloquer commandes dangereuses, détecter secrets, valider écritures |

---

## Qu'est-ce qu'un Hook ?

Un hook est un **script, endpoint HTTP ou prompt LLM** qui s'exécute automatiquement à des points précis du lifecycle de Claude Code. C'est le système de callbacks — validation, logging, notifications, sécurité, sans intervention manuelle.

```
┌──────────────────────────────────────────────────┐
│                  CYCLE D'UN OUTIL                 │
│                                                  │
│  Claude veut executer Bash("npm test")           │
│         │                                        │
│         ▼                                        │
│  ┌──────────────┐                                │
│  │ PreToolUse   │ ◄── validate-command.sh        │
│  │ matcher:Bash │     Exit 0 → Autorise          │
│  └──────┬───────┘     Exit 2 → BLOQUE + message  │
│         │                                        │
│         ▼ (si autorise)                          │
│  ┌──────────────┐                                │
│  │  Execution   │  npm test                      │
│  └──────┬───────┘                                │
│         │                                        │
│         ▼                                        │
│  ┌──────────────┐                                │
│  │ PostToolUse  │ ◄── log-action.sh              │
│  │ matcher:Bash │     Logging, notification       │
│  └──────────────┘                                │
└──────────────────────────────────────────────────┘
```

---

## Comment ça marche

### Les 18 events

| Event | Quand | Peut bloquer ? | Usage typique |
|-------|-------|---------------|---------------|
| `SessionStart` | Début/reprise de session | ❌ | Charger contexte, env vars |
| `UserPromptSubmit` | Soumission d'un prompt | ✅ | Valider/enrichir les prompts |
| `PreToolUse` | Avant un outil | ✅ | Sécurité, validation |
| `PermissionRequest` | Dialogue de permission | ✅ | Auto-approuver/refuser |
| `PostToolUse` | Après un outil (succès) | ❌ (feedback) | Logging, formatting |
| `PostToolUseFailure` | Après un outil (échec) | ❌ (feedback) | Diagnostic |
| `Notification` | Attention requise | ❌ | Alerte sonore, push |
| `SubagentStart` | Spawn d'un subagent | ❌ | Logging |
| `SubagentStop` | Fin d'un subagent | ✅ | Empêcher l'arrêt |
| `Stop` | Fin de tour Claude | ✅ | Forcer la continuation |
| `TeammateIdle` | Teammate va être idle | ✅ | Empêcher la mise en veille |
| `TaskCompleted` | Tâche marquée complète | ✅ | Valider avant complétion |
| `InstructionsLoaded` | [CLAUDE.md](/concepts/claude-md)/[rules](/concepts/rules) chargé | ❌ | Audit, observabilité |
| `ConfigChange` | Config modifiée | ✅ | Bloquer changements config |
| `WorktreeCreate` | Création worktree | ✅ | Personnaliser la création |
| `WorktreeRemove` | Suppression worktree | ❌ | Cleanup |
| `PreCompact` | Avant compaction | ❌ | Sauvegarde contexte |
| `SessionEnd` | Fin de session | ❌ | Cleanup, analytics |

### Les 3 types de hooks

| Type | Description | Usage |
|------|-------------|-------|
| `command` | Script shell (bash/sh) | Validation locale, logging |
| `http` | POST JSON vers un endpoint | Monitoring externe, API |
| `prompt` | Évaluation par un modèle LLM | Décisions nuancées |

### Configuration

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "bash .claude/hooks/security-gate.sh",
          "timeout": 10
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "bash .claude/hooks/lint-check.sh",
          "async": true
        }]
      }
    ]
  }
}
```

### Matchers (regex)

Le `matcher` est une **regex**, pas juste un nom d'outil :

| Pattern | Matche |
|---------|--------|
| `Bash` | Outil Bash |
| `Edit\|Write` | Edit ou Write |
| `Notebook.*` | Tout outil commençant par Notebook |
| `mcp__memory__.*` | Tous les outils du serveur [MCP](/concepts/mcp) memory |
| `mcp__.*__write.*` | Tout outil "write" de n'importe quel MCP |
| `""` ou omis | Tous les events de ce type |

::: info Events sans matcher
`UserPromptSubmit`, `Stop`, `TeammateIdle`, `TaskCompleted`, `WorktreeCreate`, `WorktreeRemove`, `InstructionsLoaded` ne supportent pas de matcher — ils se déclenchent toujours.
:::

### Protocole command

```bash
#!/bin/bash
INPUT=$(cat)                    # JSON sur stdin
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [[ "$COMMAND" == *"rm -rf /"* ]]; then
  echo "BLOQUE: destructeur" >&2   # stderr = message a Claude
  exit 2                            # EXIT 2 = BLOQUER
fi

exit 0                              # EXIT 0 = AUTORISER
```

| Exit code | Signification |
|-----------|--------------|
| **0** | Autoriser (stdout = JSON optionnel) |
| **2** | Bloquer (stderr = message à Claude) |
| Autre | Erreur non-bloquante (continue) |

### JSON output (exit 0)

Pour un contrôle plus fin que les exit codes, retourner du JSON sur stdout :

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Commande destructrice bloquee"
  }
}
```

| Champ | Description |
|-------|-------------|
| `continue` | `false` = Claude s'arrête complètement |
| `stopReason` | Message affiché quand `continue: false` |
| `decision` | `"block"` pour UserPromptSubmit, PostToolUse, Stop... |
| `hookSpecificOutput` | Contrôle riche pour PreToolUse et PermissionRequest |
| `additionalContext` | Contexte ajouté à la conversation (SessionStart, UserPromptSubmit) |

### Common input fields

Tous les hooks reçoivent ces champs en JSON sur stdin :

| Champ | Description |
|-------|-------------|
| `session_id` | ID de session |
| `transcript_path` | Chemin vers le transcript JSON |
| `cwd` | Répertoire de travail |
| `permission_mode` | `default`, `plan`, `acceptEdits`, `dontAsk`, `bypassPermissions` |
| `hook_event_name` | Nom de l'event |
| `agent_id` | ID du subagent (si applicable) |
| `agent_type` | Type d'agent (si applicable) |

### Hook locations

| Emplacement | Scope | Partage |
|-------------|-------|---------|
| `~/.claude/settings.json` | Tous vos projets | Non |
| `.claude/settings.json` | Projet | Oui (git) |
| `.claude/settings.local.json` | Projet (local) | Non (gitignore) |
| Managed policy settings | Organisation | Admin |
| [Plugin](/concepts/plugins) `hooks/hooks.json` | Quand plugin actif | Oui |
| Frontmatter [skill](/concepts/skills)/[agent](/concepts/agents) | Pendant le composant | Oui |

### Hooks dans skills et agents

Les hooks peuvent être définis dans le frontmatter YAML des skills et agents. Ils sont scopés au lifecycle du composant :

```yaml
---
name: secure-operations
description: Opérations avec contrôles sécurité
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
---
```

### Champs du handler

| Champ | Types | Description |
|-------|-------|-------------|
| `type` | tous | `command`, `http`, `prompt` |
| `timeout` | tous | Secondes avant annulation (défaut: 600 command, 30 prompt) |
| `statusMessage` | tous | Message spinner pendant l'exécution |
| `once` | skills | `true` = une seule exécution par session |
| `command` | command | Commande shell |
| `async` | command | `true` = exécution en background |
| `url` | http | URL du POST |
| `headers` | http | Headers avec interpolation `$VAR_NAME` |
| `allowedEnvVars` | http | Variables autorisées dans les headers |
| `prompt` | prompt | Prompt envoyé au modèle (`$ARGUMENTS` = input JSON) |
| `model` | prompt | Modèle à utiliser |

### Variables d'environnement

| Variable | Description |
|----------|-------------|
| `$CLAUDE_PROJECT_DIR` | Racine du projet |
| `$CLAUDE_PLUGIN_ROOT` | Racine du plugin |
| `$CLAUDE_ENV_FILE` | Fichier pour persister des env vars (SessionStart uniquement) |
| `$CLAUDE_CODE_REMOTE` | `"true"` en environnement remote |

---

## Guide pratique : concevoir ses hooks

### Quand utiliser un hook ?

```
Le besoin est STATIQUE (toujours le même pattern) ?
├── OUI → [settings.json](/concepts/settings) deny (plus simple)
└── NON
    Besoin d'ANALYSER le contenu ?
    ├── OUI → Hook PreToolUse
    └── NON
        Après l'action ?
        ├── OUI → Hook PostToolUse
        └── NON → Hook PreToolUse
```

| Besoin | Composant | Pourquoi |
|--------|-----------|----------|
| Bloquer `rm -rf` | **[Settings](/concepts/settings) deny** | Statique, zéro latence |
| Bloquer `curl \| bash` avec contexte | **Hook PreToolUse** | Logique dynamique |
| Scanner secrets dans Write | **Hook PreToolUse** | Analyse du contenu |
| Logger les actions | **Hook PostToolUse** | Après exécution |
| Alerte sonore | **Hook Notification** | Feedback utilisateur |
| Enrichir le prompt | **Hook UserPromptSubmit** | Ajouter du contexte |
| Environnement au démarrage | **Hook SessionStart** | Variables, setup |

### Couches de sécurité

```
Couche 1 : [settings.json](/concepts/settings) deny  (statique, zéro latence)
Couche 2 : [Rules](/concepts/rules)                  (rappels contextuels)
Couche 3 : Hooks PreToolUse                          (validation dynamique)
Couche 4 : [MCP](/concepts/mcp) permissions          (outils externes)
```

### Warnings

#### ⚠️ `WARN-001` : Oubli du exit 0

Sans exit explicite, le comportement du hook est imprévisible.

::: danger Problème
```bash
# ❌ — Pas d'exit explicite → comportement imprévisible
INPUT=$(cat)
# ... verification ...
```
Le script se termine sans code de retour défini.
:::

::: info Solution
```bash
# ✅ — TOUJOURS terminer par exit 0
INPUT=$(cat)
# ... verification ...
exit 0
```
Un exit 0 explicite garantit que le hook autorise l'action.
:::

---

#### ⚠️ `WARN-002` : Hook trop lent

Un hook PreToolUse bloquant doit répondre rapidement pour ne pas pénaliser chaque action de Claude.

::: danger Problème
```bash
# ❌ LENT — Appel réseau à chaque action
curl -s https://api.external.com/validate "$COMMAND"
```
Un appel réseau synchrone peut bloquer plusieurs secondes à chaque outil utilisé.
:::

::: info Solution
```bash
# ✅ RAPIDE — Vérification locale
echo "$COMMAND" | grep -qE 'rm -rf /' && exit 2
exit 0
```
Un hook PreToolUse doit s'exécuter en < 1 seconde.
:::

---

#### ⚠️ `WARN-003` : Script non exécutable

Un script sans permission d'exécution échoue silencieusement ou lève une erreur cryptique.

::: danger Problème
```bash
# ❌
$ ls -la security-gate.sh
-rw-r--r-- security-gate.sh
```
Le script ne peut pas être lancé par Claude Code.
:::

::: info Solution
```bash
# ✅
$ chmod +x security-gate.sh
```
Toujours vérifier les permissions après création d'un hook.
:::

---

#### ⚠️ `WARN-004` : Matcher trop large

Un matcher trop permissif déclenche le hook sur toutes les actions, y compris celles qui n'en ont pas besoin.

::: danger Problème
```json
// ❌ — Se déclenche sur TOUTES les actions
{ "matcher": ".*" }
```
Le hook s'exécute pour chaque outil, ajoutant de la latence inutile.
:::

::: info Solution
```json
// ✅ — Seulement sur Bash
{ "matcher": "Bash" }
```
Utiliser une regex précise pour cibler uniquement les outils concernés.
:::

---

#### ⚠️ `WARN-005` : Mixer exit code et JSON

Combiner exit 2 et une sortie JSON produit un résultat inattendu : le JSON est ignoré.

::: danger Problème
```bash
# ❌ — Exit 2 + JSON → le JSON est IGNORÉ
echo '{"decision":"block"}' && exit 2
```
Quand exit 2 est utilisé, Claude lit le stderr — le JSON sur stdout est ignoré.
:::

::: info Solution
```bash
# ✅ — Choisir l'un OU l'autre
# Méthode exit code :
echo "Raison du blocage" >&2 && exit 2
# Méthode JSON :
echo '{"decision":"block","reason":"..."}' && exit 0
```
Choisir une seule méthode : exit code (simple) ou JSON stdout (contrôle fin).
:::

---

## Contrôle avancé

### Le menu `/hooks`

Taper `/hooks` dans Claude Code ouvre le gestionnaire interactif :
- Voir tous les hooks actifs avec leur source (`[User]`, `[Project]`, `[Local]`, `[Plugin]`)
- Ajouter/supprimer des hooks sans éditer le JSON
- Activer/désactiver tous les hooks

### Désactiver les hooks

```json
{ "disableAllHooks": true }
```

::: warning Enterprise
`allowManagedHooksOnly` bloque les hooks user/project/plugin. Seuls les hooks managed policy restent actifs. `disableAllHooks` au niveau managed désactive **tout**.
:::

### Sécurité : snapshot au démarrage

Les hooks sont capturés au démarrage de la session. Les modifications en cours de session sont détectées et nécessitent une review dans le menu `/hooks` avant d'être appliquées. Cela empêche les modifications malveillantes mid-session.

### SessionStart : persister des variables

`CLAUDE_ENV_FILE` permet de persister des variables d'environnement pour toute la session :

```bash
#!/bin/bash
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=production' >> "$CLAUDE_ENV_FILE"
  echo 'export DEBUG_LOG=true' >> "$CLAUDE_ENV_FILE"
fi
exit 0
```

### Patterns avancés

#### Velocity governor (limiter la fréquence)

Un hook `PreToolUse` qui bloque si trop d'actions sont exécutées en peu de temps, empêchant les boucles incontrôlées :

```bash
#!/bin/bash
LOG="/tmp/claude-velocity.log"
NOW=$(date +%s)
echo "$NOW" >> "$LOG"
# Compter les actions dans les 10 dernières secondes
COUNT=$(awk -v threshold=$((NOW-10)) '$1 > threshold' "$LOG" | wc -l)
if [ "$COUNT" -gt 20 ]; then
  echo "Trop d'actions en 10s ($COUNT). Ralentir." >&2
  exit 2
fi
exit 0
```

#### Auto-checkpoint (git commit automatique)

Un hook `PostToolUse` sur `Write|Edit` qui crée un commit automatique après chaque modification, permettant de revenir en arrière :

```bash
#!/bin/bash
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0
git add -A && git commit -m "auto-checkpoint: $(date +%H:%M:%S)" --no-verify -q 2>/dev/null
exit 0
```

---

## Exemples concrets

### Exemple 1 : Bloquer les commandes dangereuses

```bash
#!/bin/bash
# .claude/hooks/security-gate.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

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
    echo "BLOQUE: pattern dangereux: $pattern" >&2
    exit 2
  fi
done

exit 0
```

### Exemple 2 : Scanner les secrets

```bash
#!/bin/bash
# .claude/hooks/secret-scanner.sh

INPUT=$(cat)
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // empty')

SECRET_PATTERNS=(
  'AKIA[0-9A-Z]{16}'             # AWS Access Key
  'sk-[a-zA-Z0-9]{48}'           # OpenAI API Key
  'ghp_[a-zA-Z0-9]{36}'          # GitHub PAT
  'xoxb-[0-9]+-[a-zA-Z0-9]+'     # Slack Bot Token
)

for pattern in "${SECRET_PATTERNS[@]}"; do
  if echo "$CONTENT" | grep -qE "$pattern"; then
    echo "BLOQUE: secret potentiel" >&2
    exit 2
  fi
done

exit 0
```

### Exemple 3 : Notification sonore

```bash
#!/bin/bash
# macOS
afplay /System/Library/Sounds/Ping.aiff &
```

### Exemple 4 : Hook HTTP avec auth

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "http",
        "url": "http://localhost:8080/hooks/pre-tool-use",
        "timeout": 30,
        "headers": {
          "Authorization": "Bearer $MY_TOKEN"
        },
        "allowedEnvVars": ["MY_TOKEN"]
      }]
    }]
  }
}
```

### Exemple 5 : Configuration complète

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/security-gate.sh" }]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/secret-scanner.sh" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/lint-check.sh", "async": true }]
      }
    ],
    "Notification": [
      {
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/notify.sh" }]
      }
    ]
  }
}
```

---

## Checklist de lancement

### Sécurité

- [ ] PreToolUse sur `Bash` : commandes dangereuses
- [ ] PreToolUse sur `Write|Edit` : secrets
- [ ] Coupler avec [`settings.json` deny](/concepts/settings) pour les blocages statiques

### Scripts

- [ ] `chmod +x` sur tous les scripts
- [ ] TOUJOURS `exit 0` explicite en fin de script
- [ ] Exécution < 1s pour PreToolUse (utiliser `async: true` si long)
- [ ] Tester : `echo '{"tool_input":{"command":"rm -rf /"}}' | bash hook.sh`

### Configuration

- [ ] Matchers précis (regex, pas `*`)
- [ ] Choisir exit code OU JSON, pas les deux
- [ ] `timeout` pour les hooks externes (HTTP, prompt)

### Organisation

- [ ] Scripts dans `.claude/hooks/` (versionnés)
- [ ] Hooks projet dans `.claude/settings.json` (équipe)
- [ ] Hooks personnels dans `~/.claude/settings.json`
- [ ] Hooks sensibles dans `.claude/settings.local.json` (gitignore)

---

## Ressources

- [Documentation officielle — Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Documentation officielle — Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
