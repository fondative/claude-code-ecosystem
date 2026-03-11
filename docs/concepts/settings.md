# Settings

## TL;DR

| Aspect | Détail |
|--------|--------|
| **Quoi** | Configuration des permissions, sandbox, modèle, hooks et comportement de Claude Code |
| **Où** | 5 niveaux : managed > CLI > local > project > user |
| **Permissions** | `allow` (auto), `deny` (bloqué), `ask` (confirmation) — deny prioritaire |
| **Sandbox** | Isolation filesystem + réseau (macOS, Linux, WSL2) |
| **Vérification** | `/status` pour voir les settings actifs et leur source |

---

## Qu'est-ce que Settings ?

Le fichier `settings.json` configure le **comportement complet de Claude Code** : permissions, sandbox, modèle, hooks, variables d'environnement, et plus. C'est le pare-feu et le tableau de bord du projet.

```
┌────────────────────────────────────────────┐
│              PERMISSIONS                    │
│                                            │
│  Claude veut : Write("php-legacy/file.php")│
│         │                                  │
│         ▼                                  │
│  ┌──────────────┐                          │
│  │ Check deny   │ deny: Write(php-legacy/**) │
│  │              │ → BLOQUE ❌               │
│  └──────────────┘                          │
│                                            │
│  Claude veut : Bash("docker compose exec") │
│         │                                  │
│         ▼                                  │
│  ┌──────────────┐                          │
│  │ Check allow  │ allow: Bash(docker *)    │
│  │              │ → AUTORISE ✅            │
│  └──────────────┘                          │
│                                            │
│  Claude veut : Bash("git push origin main")│
│         │                                  │
│         ▼                                  │
│  ┌──────────────┐                          │
│  │ Check ask    │ ask: Bash(git push *)    │
│  │              │ → CONFIRMATION REQUISE    │
│  └──────────────┘                          │
└────────────────────────────────────────────┘
```

---

## Comment ça marche

### Fichiers de settings

| Scope | Fichier | Partage | Priorité |
|-------|---------|---------|----------|
| **Managed** | `/etc/claude-code/managed-settings.json` | Organisation (admin) | 1 (plus haute) |
| **CLI args** | `--model`, `--permission-mode`, etc. | Session | 2 |
| **Local** | `.claude/settings.local.json` | Non (gitignore) | 3 |
| **Project** | `.claude/settings.json` | Oui (git) | 4 |
| **User** | `~/.claude/settings.json` | Non (personnel) | 5 (plus basse) |

::: tip settings.local.json
Idéal pour les préférences personnelles sur un projet sans polluer le repo : permissions supplémentaires, env vars locales, hooks de dev.
:::

### Logique de résolution des permissions

```
1. deny matche ? → BLOQUE (toujours prioritaire)
2. ask matche ?  → DEMANDE CONFIRMATION
3. allow matche ? → AUTORISE (sans confirmation)
4. Rien ne matche → DEMANDE CONFIRMATION
```

::: warning deny est prioritaire
`deny` l'emporte toujours sur `allow` et `ask`. Si un outil matche deny, il est bloqué même s'il est dans allow.
:::

### Permissions : 3 niveaux

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(docker compose *)",
      "Bash(git status)"
    ],
    "ask": [
      "Bash(git push *)",
      "Edit(config/**)"
    ],
    "deny": [
      "Write(php-legacy/**)",
      "Edit(php-legacy/**)",
      "Bash(rm -rf *)"
    ]
  }
}
```

### Tool patterns

| Pattern | Cible |
|---------|-------|
| `Bash(npm run *)` | Commandes commençant par `npm run` |
| `Read(.env*)` | Fichiers .env |
| `Write(src/**)` | Écriture récursive dans src/ |
| `WebFetch(domain:example.com)` | Requêtes vers un domaine |
| `MCP(github)` | Outils du serveur MCP github |
| `Agent(codereview)` | Agent nommé "codereview" |
| `Skill(deploy *)` | Skill deploy avec arguments |

### 5 modes de permission

| Mode | Éditions | Exécutions | Usage |
|------|----------|------------|-------|
| **Plan** | Bloquées | Bloquées | Exploration read-only |
| **Default** | Confirmation | Confirmation | Travail sécurisé |
| **Accept Edits** | Auto | Confirmation | Vitesse + contrôle |
| **Don't Ask** | Auto | Auto (allowlist) | Haute confiance |
| **Bypass Permissions** | Auto | Auto (tout) | Dev/test uniquement |

Cycler : `Ctrl+Shift+P`. Configurer le défaut :

```json
{ "permissions": { "defaultMode": "acceptEdits" } }
```

::: danger bypassPermissions
Désactive **toute** sécurité. Peut être bloqué par l'admin via `permissions.disableBypassPermissionsMode: "disable"` dans managed settings.
:::

### Settings au-delà des permissions

| Champ | Type | Description |
|-------|------|-------------|
| `model` | string | Modèle par défaut (`"claude-sonnet-4-6"`) |
| `availableModels` | array | Restreindre les modèles dans `/model` |
| `language` | string | Langue préférée des réponses |
| `outputStyle` | string | Style du system prompt |
| `env` | object | Variables d'environnement par session |
| `attribution.commit` | string | Attribution pour les commits git |
| `attribution.pr` | string | Attribution pour les PRs |
| `cleanupPeriodDays` | number | Suppression des sessions inactives (défaut: 30) |
| `autoMemoryEnabled` | boolean | Mémoire automatique |
| `alwaysThinkingEnabled` | boolean | Extended thinking par défaut |
| `includeGitInstructions` | boolean | Instructions git dans le prompt |
| `permissions.additionalDirectories` | array | Répertoires de travail supplémentaires |

### Sandbox

Le sandbox isole les commandes Bash du filesystem et du réseau (macOS, Linux, WSL2) :

```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "filesystem": {
      "allowWrite": ["//tmp/build", "~/.kube"],
      "denyWrite": ["//etc"],
      "denyRead": ["~/.aws/credentials"]
    },
    "network": {
      "allowedDomains": ["github.com", "*.npmjs.org"],
      "allowLocalBinding": true
    }
  }
}
```

| Préfixe path | Signification |
|--------------|---------------|
| `//` | Absolu depuis la racine (`//tmp` → `/tmp`) |
| `~/` | Home directory |
| `/` | Relatif au dossier settings |
| `./` | Relatif au répertoire courant |

### Variables d'environnement

Le champ `env` dans settings.json définit des variables pour chaque session :

```json
{
  "env": {
    "NODE_ENV": "development",
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1"
  }
}
```

Env vars notables :

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_MODEL` | Override le modèle |
| `CLAUDE_CODE_EFFORT_LEVEL` | `low\|medium\|high` (raisonnement) |
| `BASH_DEFAULT_TIMEOUT_MS` | Timeout commandes (défaut: 120000) |
| `MAX_MCP_OUTPUT_TOKENS` | Limite sortie MCP |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Désactiver la mémoire auto |
| `CLAUDE_CODE_AUTOCOMPACT_PCT_OVERRIDE` | % pour auto-compaction |

### Merge behavior

Les settings se **mergent** entre scopes :

| Type | Comportement |
|------|-------------|
| **Arrays** (`allow`, `deny`, `ask`, `allowWrite`, `allowedDomains`...) | Concaténés et dédupliqués |
| **Non-arrays** (`model`, `language`, `defaultMode`...) | Le scope le plus haut gagne |

---

## Guide pratique : configurer ses settings

### Quoi mettre dans allow vs ask vs deny

```
Action TOUJOURS safe ?
├── OUI → allow (Read, Glob, Grep, git status)
└── NON
    Action JAMAIS autorisée ?
    ├── OUI → deny (rm -rf, force push, écrire .env)
    └── NON → ask (git push, deploy, edit config)
```

| Pattern | Où | Pourquoi |
|---------|-----|----------|
| `Read`, `Glob`, `Grep` | allow | Lecture toujours safe |
| `Bash(docker compose *)` | allow | Commande fréquente, safe |
| `Bash(git status/diff/log)` | allow | Read-only git |
| `Bash(git push *)` | ask | Vérification avant push |
| `Write(php-legacy/**)` | deny | Protéger le code source |
| `Bash(rm -rf *)` | deny | Destructeur |
| `Write(.env*)` | deny | Fichiers secrets |

### Les erreurs à éviter

#### ❌ Piège 1 : Permissions trop larges

```json
// ❌ — Désactive toute sécurité
{ "allow": ["Bash(*)"] }
```

```json
// ✅ — Commandes spécifiques
{ "allow": ["Bash(npm test *)", "Bash(docker compose *)"] }
```

#### ❌ Piège 2 : Oubli du deny en écriture

```json
// ❌ — Le legacy n'est pas protégé
{ "allow": ["Read", "Write"] }
```

```json
// ✅ — Protection explicite
{ "deny": ["Write(php-legacy/**)", "Edit(php-legacy/**)"] }
```

#### ❌ Piège 3 : Glob `*` vs `**`

```json
// ❌ — Premier niveau seulement
{ "deny": ["Write(php-legacy/*)"] }

// ✅ — Récursif
{ "deny": ["Write(php-legacy/**)"] }
```

#### ❌ Piège 4 : MCP sans permissions

```json
// ❌ — Tous les outils GitHub autorisés
{ "mcpServers": { "github": {} } }
```

```json
// ✅ — Permissions granulaires
{
  "permissions": {
    "allow": ["mcp__github__list_prs"],
    "deny": ["mcp__github__delete_repo"]
  }
}
```

#### ❌ Piège 5 : Settings projet pour des préférences personnelles

```json
// ❌ — Dans .claude/settings.json (git) : préférences perso
{ "model": "claude-opus-4-6", "language": "french" }
```

```json
// ✅ — Dans .claude/settings.local.json (gitignore)
{ "model": "claude-opus-4-6", "language": "french" }
```

---

## Contrôle avancé

### Vérification avec `/status`

`/status` affiche :
- Quels fichiers settings sont actifs
- Source de chaque configuration (Managed, User, Project, Local)
- Erreurs de configuration

### Managed settings (enterprise)

3 mécanismes de delivery :

| Mécanisme | Plateforme |
|-----------|------------|
| **Serveur** | Via Claude.ai admin console |
| **MDM/OS** | macOS plist, Windows registry (HKLM) |
| **Fichier** | `managed-settings.json` dans `/etc/claude-code/` |

Settings réservés au managed :

| Setting | Effet |
|---------|-------|
| `allowManagedPermissionRulesOnly` | Seules les rules managed s'appliquent |
| `allowManagedHooksOnly` | Bloque les hooks user/project/plugin |
| `allowManagedMcpServersOnly` | Seuls les MCP admin sont autorisés |
| `disableBypassPermissionsMode` | Empêche le mode bypass |
| `strictKnownMarketplaces` | Allowlist des sources de plugins |

### Attribution

```json
{
  "attribution": {
    "commit": "Co-Authored-By: Claude <noreply@anthropic.com>",
    "pr": "Generated with Claude Code"
  }
}
```

Mettre `""` pour masquer l'attribution.

---

## Exemples concrets

### Exemple 1 : Projet de modernisation

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(docker compose exec *)",
      "Bash(git status)", "Bash(git diff *)",
      "Bash(git log *)", "Bash(git add *)",
      "Bash(ls *)", "Bash(find *)", "Bash(mkdir *)"
    ],
    "ask": [
      "Bash(git push *)",
      "Bash(git commit *)"
    ],
    "deny": [
      "Write(php-legacy/**)",
      "Edit(php-legacy/**)",
      "Bash(rm -rf *)"
    ]
  }
}
```

### Exemple 2 : Settings personnel (local)

`.claude/settings.local.json` :

```json
{
  "model": "claude-opus-4-6",
  "language": "french",
  "env": {
    "NODE_ENV": "development"
  },
  "permissions": {
    "defaultMode": "acceptEdits"
  }
}
```

### Exemple 3 : Sandbox strict

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
      "allowedDomains": ["github.com", "*.npmjs.org", "registry.yarnpkg.com"]
    }
  }
}
```

### Exemple 4 : Template de démarrage universel

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
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
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Write(.env*)"
    ]
  }
}
```

---

## Checklist de lancement

### Permissions

- [ ] `allow` : lecture (Read/Glob/Grep) + commandes fréquentes
- [ ] `ask` : actions avec impact (git push, deploy)
- [ ] `deny` : destruction (rm -rf), secrets (.env), legacy
- [ ] Globs avec `**` (récursif)
- [ ] MCP avec permissions granulaires

### Fichiers

- [ ] `.claude/settings.json` pour l'équipe (git)
- [ ] `.claude/settings.local.json` pour les préférences perso (gitignore)
- [ ] `$schema` pour l'autocomplétion IDE

### Sandbox

- [ ] Activer si macOS/Linux/WSL2
- [ ] `denyRead` pour les credentials (`~/.aws`, `~/.ssh`)
- [ ] `allowedDomains` pour le réseau

### Vérification

- [ ] `/status` pour vérifier les settings actifs
- [ ] Tester les deny : Claude doit être bloqué
- [ ] Tester les allow : pas de confirmation inutile

---

## Ressources

- [Documentation officielle — Settings](https://code.claude.com/docs/en/settings)
- [Documentation officielle — Permissions](https://code.claude.com/docs/en/permissions)
- [JSON Schema](https://json.schemastore.org/claude-code-settings.json)
