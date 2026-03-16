# MCP — Model Context Protocol

## TL;DR

| Aspect | Détail |
|--------|--------|
| **Quoi** | Protocole standardisé pour connecter Claude à des outils et données externes |
| **Où** | [`settings.json`](/concepts/settings) (`mcpServers`), `.mcp.json` (projet), CLI `claude mcp` |
| **Transports** | `http` (recommandé), `stdio` (local), `sse` (déprécié) |
| **Scopes** | `local` (défaut), `project` (.mcp.json, git), `user` (cross-projets) |
| **Sécurité** | Dialogue de confiance, [permissions](/concepts/settings) par outil, secrets via env vars |

---

## Qu'est-ce que MCP ?

Le Model Context Protocol est un **protocole standardisé open source** pour connecter Claude à des services externes via des serveurs. Chaque serveur expose des outils que Claude découvre et utilise comme s'ils étaient natifs.

```
┌──────────────────────────────────────────────┐
│              CLAUDE CODE                      │
│                                              │
│  Outils natifs                               │
│  ├── Read, Write, Edit, Bash                 │
│  ├── Glob, Grep, Agent                       │
│                                              │
│  Outils MCP (decouverts dynamiquement)       │
│  ├── mcp__github__list_prs                   │
│  ├── mcp__slack__send_message                │
│  ├── mcp__postgres__query                    │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ GitHub   │  │  Slack   │  │ Postgres │   │
│  │ Server   │  │  Server  │  │  Server  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼──────────────┼─────────────┼─────────┘
        ▼              ▼             ▼
    GitHub API     Slack API    PostgreSQL
```

---

## Comment ça marche

### Les 3 transports

| Transport | Description | Usage |
|-----------|-------------|-------|
| **`http`** | POST HTTP (streamable-http) | **Recommandé** — serveurs cloud |
| **`stdio`** | Processus local (stdin/stdout) | Outils locaux, scripts custom |
| **`sse`** | Server-Sent Events | **Déprécié** — utiliser http |

### Installation via CLI

```bash
# Serveur HTTP distant (recommandé)
claude mcp add --transport http github https://api.githubcopilot.com/mcp/

# Serveur HTTP avec authentification
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# Serveur stdio local
claude mcp add --transport stdio --env GITHUB_TOKEN=xxx github \
  -- npx -y @modelcontextprotocol/server-github

# Serveur avec scope spécifique
claude mcp add --transport http --scope user notion https://mcp.notion.com/mcp
```

### Gestion des serveurs

```bash
claude mcp list                      # Lister les serveurs
claude mcp get github                # Détails d'un serveur
claude mcp remove github             # Supprimer un serveur
claude mcp add-json weather '...'    # Ajouter depuis JSON
claude mcp add-from-claude-desktop   # Importer depuis Claude Desktop
claude mcp serve                     # Claude Code COMME serveur MCP
```

Dans Claude Code, `/mcp` affiche le statut et permet l'authentification OAuth.

### Configuration JSON

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

::: info Variable expansion dans .mcp.json
`${VAR}` est remplacé par la variable d'environnement. `${VAR:-default}` utilise une valeur par défaut. Fonctionne dans `command`, `args`, `env`, `url`, `headers`.
:::

### Scopes et priorité

| Scope | Stockage | Partage | Commande |
|-------|----------|---------|----------|
| **Local** (défaut) | `~/.claude.json` | Non, projet courant | `--scope local` |
| **Project** | `.mcp.json` (racine) | Oui (git) | `--scope project` |
| **User** | `~/.claude.json` | Non, tous projets | `--scope user` |
| **Managed** | `/etc/claude-code/managed-mcp.json` | Organisation | Admin |

Priorité : local > project > user. Les serveurs managed prennent le contrôle exclusif.

### Cycle de découverte

```
1. Claude Code démarre → lance chaque serveur MCP
2. Serveur expose ses outils (mcp__github__list_prs, ...)
3. Claude détecte le besoin d'un outil externe
4. ToolSearch("github") → découvre les outils
5. Claude utilise l'outil → résultat dans la conversation
```

::: info Outils "deferred" et Tool Search
Les outils MCP ne sont pas chargés au démarrage. Claude les découvre via `ToolSearch` à la demande. Quand les outils dépassent 10% du contexte, Tool Search s'active automatiquement (`ENABLE_TOOL_SEARCH=auto`).
:::

### Permissions granulaires {#permissions}

Les permissions MCP se configurent dans [`settings.json`](/concepts/settings) :

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

### Authentification OAuth 2.0

Les serveurs distants peuvent nécessiter OAuth :

```bash
# Ajouter le serveur
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# Authentifier dans Claude Code
/mcp  # → suivre le flow navigateur
```

Pour les serveurs sans registration dynamique :

```bash
claude mcp add --transport http \
  --client-id your-id --client-secret --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

### MCP resources et prompts

| Feature | Syntaxe | Description |
|---------|---------|-------------|
| **Resources** | `@github:issue://123` | Référencement via @ mentions |
| **Prompts** | `/mcp__github__pr_review 456` | Prompts MCP comme commandes |

### Output limits

| Config | Valeur | Description |
|--------|--------|-------------|
| Warning | 10 000 tokens | Avertissement affiché |
| Défaut max | 25 000 tokens | Limite par défaut |
| `MAX_MCP_OUTPUT_TOKENS` | Configurable | Augmenter pour gros résultats |
| `MCP_TIMEOUT` | ms | Timeout de démarrage serveur |

### Dynamic tool updates

Les serveurs MCP peuvent envoyer des notifications `list_changed` pour mettre à jour leurs outils sans reconnexion.

---

## Guide pratique : configurer ses serveurs MCP

### MCP vs Bash natif

| Besoin | MCP | Bash | Recommandation |
|--------|-----|------|---------------|
| Lister les PRs | ✅ | `gh pr list` | Les deux OK |
| Requête SQL | ✅ | `psql -c` | MCP = plus structuré |
| Envoyer un Slack | ✅ | `curl API` | MCP = plus simple |
| Build/test | ❌ | ✅ | Bash toujours |
| Cluster K8s | ✅ | `kubectl` | MCP = découverte auto |

::: tip Règle pratique
Si un équivalent CLI natif existe (`gh`, `kubectl`, `psql`), le privilégier. MCP brille quand l'intégration est plus riche ou qu'il n'y a pas de CLI.
:::

### Serveurs populaires

::: warning Serveurs tiers
Anthropic n'a pas vérifié la sécurité de tous les serveurs communautaires. Vérifier la source avant d'installer. Les packages `@modelcontextprotocol/` sont les références officielles du protocole.
:::

| Serveur | Commande d'installation | Type |
|---------|------------------------|------|
| **GitHub** | `claude mcp add --transport http github https://api.githubcopilot.com/mcp/` | HTTP |
| **Sentry** | `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp` | HTTP |
| **Notion** | `claude mcp add --transport http notion https://mcp.notion.com/mcp` | HTTP |
| **PostgreSQL** | `claude mcp add --transport stdio db -- npx -y @modelcontextprotocol/server-postgres` | stdio |
| **Filesystem** | `claude mcp add --transport stdio fs -- npx -y @modelcontextprotocol/server-filesystem` | stdio |

Voir le [registre complet sur GitHub](https://github.com/modelcontextprotocol/servers) pour des centaines de serveurs.

### Warnings

#### ⚠️ `WARN-001` : Token hardcodé

Inscrire un token en clair dans un fichier de configuration expose les credentials dans l'historique git.

::: danger Problème
```json
// ❌ — Token en clair dans le fichier
{ "env": { "GITHUB_TOKEN": "ghp_abc123..." } }
```
Le token est visible dans le dépôt git et dans tous ses clones.
:::

::: info Solution
```json
// ✅ — Variable d'environnement
{ "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" } }
```
Exporter dans `.bashrc` : `export GITHUB_TOKEN=ghp_...`
:::

---

#### ⚠️ `WARN-002` : Pas de deny pour les actions destructrices

Un wildcard sur les permissions allow donne à Claude un accès illimité, y compris aux actions irréversibles.

::: danger Problème
```json
// ❌ — Claude peut supprimer un repo
{ "allow": ["mcp__github__*"] }
```
Toutes les actions GitHub sont autorisées, y compris la suppression de dépôts.
:::

::: info Solution
```json
// ✅ — Actions spécifiques
{ "allow": ["mcp__github__list_prs"], "deny": ["mcp__github__delete_repo"] }
```
Toujours définir explicitement les actions destructrices dans la liste `deny`.
:::

---

#### ⚠️ `WARN-003` : Serveur de source inconnue

::: warning Attention
Chaque serveur MCP a accès au réseau. **Ne jamais** installer un serveur non vérifié. Privilégier les packages `@modelcontextprotocol/` et les serveurs HTTP officiels.
:::

---

#### ⚠️ `WARN-004` : Token expiré

::: warning Attention
**Symptôme** : Erreur vague ou résultat vide.

**Diagnostic** :
1. `echo $GITHUB_TOKEN` — variable définie ?
2. `gh auth status` — token valide ?
3. `/mcp` — statut du serveur ?
4. Régénérer si nécessaire
:::

---

#### ⚠️ `WARN-005` : Oublier --scope pour le partage équipe

Sans le flag `--scope project`, le serveur MCP reste local et invisible pour les autres membres de l'équipe.

::: danger Problème
```bash
# ❌ — Scope local par défaut, invisible pour l'équipe
claude mcp add --transport http api https://mcp.example.com
```
Le serveur est enregistré dans `~/.claude.json` et n'est pas partagé via git.
:::

::: info Solution
```bash
# ✅ — Scope project, .mcp.json dans git
claude mcp add --transport http --scope project api https://mcp.example.com
```
Le serveur est écrit dans `.mcp.json` à la racine du projet, versionné avec le code.
:::

---

## Contrôle avancé

### Claude Code comme serveur MCP

Claude Code peut lui-même servir de serveur MCP pour d'autres applications :

```bash
claude mcp serve
```

Config pour Claude Desktop :
```json
{
  "mcpServers": {
    "claude-code": {
      "type": "stdio",
      "command": "claude",
      "args": ["mcp", "serve"]
    }
  }
}
```

### Plugin MCP servers

Les [plugins](/concepts/plugins) peuvent bundler des serveurs MCP qui démarrent automatiquement :

```json
{
  "mcpServers": {
    "plugin-api": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/api-server",
      "args": ["--port", "8080"]
    }
  }
}
```

### Managed MCP (enterprise)

`managed-mcp.json` prend le contrôle exclusif — les utilisateurs ne peuvent pas ajouter de serveurs.

Allowlists/denylists pour un contrôle plus souple :

```json
{
  "allowedMcpServers": [
    { "serverName": "github" },
    { "serverUrl": "https://mcp.company.com/*" }
  ],
  "deniedMcpServers": [
    { "serverName": "dangerous-server" }
  ]
}
```

> Denylist a priorité absolue sur allowlist.

### Import et compatibilité

```bash
# Importer depuis Claude Desktop (macOS/WSL)
claude mcp add-from-claude-desktop

# Serveurs Claude.ai disponibles automatiquement
# Désactiver : ENABLE_CLAUDEAI_MCP_SERVERS=false
```

---

## Exemples concrets

### Exemple 1 : GitHub

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

```
User: "Quels PRs sont ouverts ?"
Claude → ToolSearch("github")
Claude → mcp__github__list_prs({ state: "open" })
Claude: "3 PRs ouvertes : #42, #43, #44"
```

### Exemple 2 : PostgreSQL

```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"
```

```
User: "Quel est le chiffre d'affaires ce mois ?"
Claude → mcp__db__query({ sql: "SELECT SUM(amount)..." })
```

### Exemple 3 : Permissions granulaires

```json
{
  "permissions": {
    "allow": [
      "mcp__github__list_prs",
      "mcp__github__get_issue",
      "mcp__github__get_pr_diff"
    ],
    "deny": [
      "mcp__github__delete_repo",
      "mcp__github__merge_pr"
    ]
  }
}
```

### Exemple 4 : Serveur projet partagé (.mcp.json)

```json
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```

---

## Checklist de lancement

### Installation

- [ ] Choisir le bon transport (`http` pour distant, `stdio` pour local)
- [ ] Choisir le bon scope (`project` si partage équipe, `local` sinon)
- [ ] Tester la connexion : `/mcp` dans Claude Code

### Sécurité

- [ ] Secrets via `${VARIABLE}` (jamais hardcodés)
- [ ] Permissions `allow`/`deny` par outil
- [ ] Sources vérifiées uniquement (`@modelcontextprotocol/` ou HTTP officiels)
- [ ] OAuth configuré pour les serveurs distants qui le requièrent

### Organisation

- [ ] `.mcp.json` dans git pour les serveurs équipe
- [ ] Documenter les serveurs dans CLAUDE.md
- [ ] `MAX_MCP_OUTPUT_TOKENS` si gros résultats attendus

### Architecture de sécurité

```
Couche 1 : Variables d'environnement  ← Secrets
Couche 2 : Permissions allow/deny     ← Contrôle d'accès
Couche 3 : Dialogue de confiance      ← Première utilisation
Couche 4 : Isolation par processus    ← Chaque serveur séparé
Couche 5 : Managed MCP (enterprise)   ← Contrôle organisationnel
```

---

## Ressources

- [Documentation officielle — MCP](https://code.claude.com/docs/en/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Serveurs MCP — GitHub](https://github.com/modelcontextprotocol/servers)
- [MCP SDK — Build your own](https://modelcontextprotocol.io/quickstart/server)
