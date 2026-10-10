# MCP — Model Context Protocol

## En bref

| Aspect | Détail |
|--------|--------|
| **Quoi** | Protocole standardisé pour connecter Claude à des outils et données externes |
| **Où** | `.mcp.json` (projet), `~/.claude.json` (utilisateur / local), CLI `claude mcp add` — les permissions des outils MCP restent dans [`settings.json`](/concepts/settings) |
| **Transports** | `http` (recommandé), [`stdio`](/reference/glossary#stdio) (processus local lancé par Claude Code), `ws` (WebSocket), `sse` (déprécié) |
| **[Scopes](/reference/glossary#scope)** | `local` (défaut), `project` (.mcp.json, git), `user` (tous vos projets) + serveurs de plugins, connecteurs claude.ai et [managed](/reference/glossary#managed) |
| **Sécurité** | Serveurs de confiance uniquement (risque d'[injection de prompt](/reference/glossary#injection-de-prompt)), [permissions](/concepts/settings) par outil, [OAuth](/reference/glossary#oauth) plutôt que tokens |
| **Ce que cette page apporte** | Quand préférer une CLI à un serveur MCP, comment connecter un serveur sans exposer de secret ni d'action destructrice, et pourquoi le projet de modernisation s'en passe |

---

## L'essentiel en 2 minutes

Le Model Context Protocol est un **protocole standardisé open source** pour connecter Claude à des services externes via des serveurs. Chaque serveur expose des outils (`mcp__<serveur>__<outil>`) que Claude découvre et utilise comme s'ils étaient natifs.

```
┌──────────────────────────────────────────────┐
│                 CLAUDE CODE                  │
│                                              │
│  Outils natifs                               │
│  ├── Read, Write, Edit, Bash                 │
│  └── Glob, Grep, Agent                       │
│                                              │
│  Outils MCP (découverts dynamiquement)       │
│  ├── mcp__github__list_prs                   │
│  ├── mcp__slack__send_message                │
│  └── mcp__db__query                          │
│                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │ serveur  │   │ serveur  │   │ serveur  │  │
│  │  GitHub  │   │  Slack   │   │  DBHub   │  │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘  │
└───────┼──────────────┼──────────────┼────────┘
        ▼              ▼              ▼
    GitHub API     Slack API      PostgreSQL
```

```bash
# Serveur distant, partagé avec l'équipe via .mcp.json ; authentification ensuite dans /mcp
claude mcp add --transport http --scope project notion https://mcp.notion.com/mcp
```

Cinq faits changent la façon de choisir et configurer un serveur :

1. **La CLI d'abord.** La doc officielle recommande `gh`, `aws`, `psql`… quand ils existent : aucune liste d'outils à charger, rien à maintenir.
2. **Un serveur est du code de confiance.** Un serveur stdio tourne avec vos droits, hors du [sandbox](/reference/glossary#sandbox) et des règles de permission ; un serveur qui lit du contenu externe peut injecter des instructions.
3. **Le scope par défaut est `local`** : sans `--scope project`, le serveur n'est ni dans `.mcp.json` ni partagé.
4. **[Tool Search](/reference/glossary#tool-search) est actif par défaut** : seuls les noms d'outils sont chargés au démarrage, Claude charge la définition complète d'un outil quand il en a besoin.
5. **Les permissions se règlent par outil** (`mcp__serveur__outil`) : lecture en `allow`, écriture en `ask`, irréversible en `deny` ([règles de permission](/reference/glossary#regles-de-permission)).

→ Tout le fonctionnement (transports, commandes `claude mcp`, champs d'un serveur, expansion de variables, scopes et priorité, Tool Search, syntaxe des permissions, OAuth, resources et prompts, limites, managed MCP) : [documentation officielle — MCP](https://code.claude.com/docs/en/mcp).

---

## MCP ou CLI ?

La documentation officielle recommande **la CLI d'abord** : `gh`, `aws`, `gcloud`, `sentry-cli`… sont la façon la plus économe en contexte d'interagir avec un service externe, car elles n'ajoutent aucune liste d'outils ([best practices — Use CLI tools](https://code.claude.com/docs/en/best-practices#use-cli-tools), [costs](https://code.claude.com/docs/en/costs#reduce-token-usage)).

| Besoin | Recommandation | Pourquoi |
|--------|----------------|----------|
| PRs, issues GitHub | `gh` | CLI connue de Claude, authentifiée |
| Requête SQL ponctuelle | `psql` avec un utilisateur lecture seule | Pas de serveur à maintenir |
| Cluster Kubernetes | `kubectl` | Idem |
| Build / tests | Bash | Toujours |
| Service sans CLI (Notion, Slack…) ou authentifié par OAuth | **MCP** | Intégration et auth gérées par le serveur |
| Outils réservés à un seul agent | **MCP** via `mcpServers` du [subagent](/concepts/agents) | Outils absents du contexte principal |

::: tip Règle pratique
Une CLI existe et Claude sait s'en servir → la CLI. MCP quand il n'y a pas de CLI, quand l'auth OAuth est nécessaire ou pour donner un jeu d'outils précis à un agent. Préférer peu d'outils, bien ciblés : les jeux d'outils trop larges rendent le choix ambigu ([Anthropic Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)).
:::

---

## Bien configurer ses serveurs MCP

### Sécurité : ce qu'il faut savoir avant de connecter un serveur

::: danger Injection de prompt
Un serveur qui récupère du contenu externe (pages web, issues, tickets, e-mails) peut renvoyer des instructions malveillantes que Claude lira comme du contenu de travail. La doc officielle demande de **vérifier qu'on fait confiance à chaque serveur avant de le connecter** ([MCP](https://code.claude.com/docs/en/mcp), [prompt injection](https://code.claude.com/docs/en/security#protect-against-prompt-injection)). Garder les outils d'écriture en `ask` ou `deny`.
:::

- **Source** : préférer les connecteurs revus de l'[Anthropic Directory](https://claude.ai/directory) (ajoutables avec `claude mcp add`) et les serveurs officiels des éditeurs.
- **Dépôt cloné** : relire son `.mcp.json` avant d'approuver ses serveurs ; un serveur stdio lance une commande avec vos droits. En session interactive, Claude Code demande d'approuver les serveurs projet (après le [dialogue de confiance](/reference/glossary#dialogue-de-confiance) du dossier) ; avec `claude -p`, l'Agent SDK ou une session cloud, ils sont chargés **sans confirmation**.
- **CI / scripts** : `claude -p --strict-mcp-config --mcp-config ci-mcp.json` n'utilise que les serveurs passés explicitement ; `disabledMcpjsonServers` bloque un serveur projet dans tous les modes.
- **Contexte** : `/context` montre ce qui occupe le contexte ; désactiver dans `/mcp` les serveurs inutilisés.

### Serveurs populaires

::: warning Serveurs tiers
Anthropic n'a pas vérifié la sécurité de tous les serveurs communautaires. Vérifier la source avant d'installer. Parmi les serveurs de référence `@modelcontextprotocol/`, seuls certains sont encore maintenus (`everything`, `fetch`, `filesystem`, `git`, `memory`, `sequentialthinking`, `time`) : `server-github` et `server-postgres` sont **archivés** (plus de correctifs) — préférer le serveur GitHub distant officiel et un serveur base de données maintenu.
:::

Commandes d'installation : GitHub et PostgreSQL dans les [exemples](#exemples-prets-a-l-emploi), Notion dans [L'essentiel](#l-essentiel-en-2-minutes) ; Sentry s'ajoute de la même façon (`claude mcp add --transport http sentry https://mcp.sentry.dev/mcp`). Voir aussi le [dépôt des serveurs de référence](https://github.com/modelcontextprotocol/servers) et ses liens vers les registres de serveurs.

### Dans le projet de modernisation

::: info Chez nous
Le projet de modernisation **n'utilise aucun serveur MCP** : pas de `.mcp.json`, aucune règle `mcp__…` dans `.claude/settings.json`, aucun `mcpServers` dans ses 11 agents. Ses accès externes passent par des CLI pré-autorisées :

| Besoin | Ce que fait le projet | Alternative MCP possible |
|--------|----------------------|--------------------------|
| Commandes backend (PHP, Composer, tests, base PostgreSQL du conteneur) | `allow` ciblé sur `docker compose exec -T app` (`php bin/phpunit`, `phpcs`/`phpcbf`, une liste de `php bin/console`) | Serveur base de données réservé à un agent (exemple 5) |
| Git | `allow: Bash(git add *)` ; `ask` sur `commit` et `push` ; `git status`, `git diff`, `git log` pré-approuvés par l'`allowed-tools` de la command `/dev:commit` | Serveur GitHub distant (exemple 1) |
| Frontend | `allow: Bash(npm ci *)`, `npm test *`, `npm run` limité à `lint`, `typecheck`, `format`, `format:check`, `test*`, `build`, `docs:build` | — |

C'est l'application directe de la règle « CLI d'abord » : tout ce dont le pipeline a besoin a une CLI, déjà encadrée par les permissions Bash.
:::

### Pièges à connaître

- **`type` est obligatoire dès qu'il y a une `url`** : sans lui, l'entrée est lue comme stdio et ignorée.
- **Les credentials de Claude Code (`ANTHROPIC_API_KEY`…) sont lus comme vides** dans `url`/`headers` d'un serveur distant, même via `${VAR}`.
- **`mcp__*` en `allow` est ignoré** (avec un avertissement) ; il ne fonctionne qu'en `deny`/`ask`. La forme `MCP(...)` n'existe pas.
- **Un même serveur défini à plusieurs scopes n'est pas fusionné** : l'entrée gagnante (local > project > user > plugin > connecteurs) est utilisée entière.
- **Un gros résultat d'outil est sauvé dans un fichier** et Claude ne reçoit que son chemin, dans deux cas : au-delà de 25 000 tokens (seuil relevable avec `MAX_MCP_OUTPUT_TOKENS`), et dès qu'un résultat texte dépasse 50 000 caractères, quel que soit son nombre de tokens (seuil que `MAX_MCP_OUTPUT_TOKENS` ne change pas ; seul le serveur peut le relever pour un outil).
- **`tools:` dans un subagent est une liste d'autorisation** : un agent limité à `tools: Read` n'a accès à aucun outil MCP. Soit y lister les outils MCP voulus (`mcp__db__search_objects`…), soit utiliser `disallowedTools` pour ne retirer que les outils interdits ([sub-agents](https://code.claude.com/docs/en/sub-agents)).

Détails et sources : [documentation officielle — MCP](https://code.claude.com/docs/en/mcp).

### Erreurs fréquentes à éviter

→ Les pièges de toutes les briques, classés par gravité : [Catalogue des pièges](/guide/warns).

#### `WARN-001` : Token hardcodé {#warn-001 .warn-title}
*Origine : bonne pratique générale ; ordre OAuth → `headersHelper` → variables tiré de la documentation officielle.*

Inscrire un token en clair dans un fichier de configuration expose les credentials dans l'historique git.

::: danger Problème
```jsonc
// ❌ — Token en clair dans le fichier
{ "headers": { "Authorization": "Bearer ghp_abc123..." } }
```
Le token est visible dans le dépôt git et dans tous ses clones.
:::

::: info Solution, par ordre de préférence
1. **OAuth** si le serveur le supporte : aucun token à stocker (`/mcp` ou `claude mcp login <nom>`).
2. **[`headersHelper`](/reference/glossary#headershelper)** : une commande lit le token dans un gestionnaire de secrets à chaque connexion ([dynamic headers](https://code.claude.com/docs/en/mcp#use-dynamic-headers-for-custom-authentication)).

```json
{ "type": "http", "url": "https://mcp.example.com/mcp", "headersHelper": "/opt/bin/mcp-headers.sh" }
```

```bash
#!/bin/bash
# /opt/bin/mcp-headers.sh — imprime les headers en JSON (exemple avec pass)
jq -nc --arg t "$(pass show mcp/example)" '{Authorization: ("Bearer " + $t)}'
```

3. À défaut, `${VAR}` dans `.mcp.json`, la variable étant injectée par un gestionnaire de secrets — pas écrite en clair dans `.bashrc`.
:::

---

#### `WARN-002` : Pas de deny pour les actions destructrices {#warn-002 .warn-title}
*Origine : bonne pratique générale, appuyée sur la syntaxe officielle des permissions MCP.*

Un `allow` qui couvre tous les outils d'un serveur (`mcp__github__*`) auto-approuve aussi ses écritures et ses actions irréversibles (merge, suppression).

::: info Solution
`allow` limité à des outils de lecture précis, écritures en `ask`, actions irréversibles en `deny` (voir l'[exemple 3](#exemple-3-permissions-granulaires)). Problème et solution détaillés : [Settings — WARN-004](/concepts/settings#warn-004).
:::

---

#### `WARN-003` : Serveur de source inconnue {#warn-003 .warn-title}
*Origine : documentation officielle (vérifier la confiance accordée à chaque serveur).*

::: warning Attention
Un serveur stdio s'exécute avec vos droits utilisateur ; un serveur distant voit tout ce que Claude lui envoie. **Ne jamais** installer un serveur non vérifié. Privilégier les serveurs HTTP officiels des éditeurs et les serveurs de référence encore maintenus (pas les packages archivés).
:::

---

#### `WARN-004` : Token expiré {#warn-004 .warn-title}
*Origine : bonne pratique générale (diagnostic avec les commandes officielles).*

::: warning Attention
**Symptôme** : Erreur vague ou résultat vide.

**Diagnostic** :
1. `claude mcp list` / `claude mcp get <nom>` — statut et détail de l'échec (code HTTP, ex. 401)
2. Variable `${VAR}` définie ? (une variable manquante est signalée dans `claude mcp list`)
3. `/mcp` → **Re-authenticate** pour un serveur OAuth, ou `claude mcp login <nom>`
4. Régénérer le token si nécessaire (et le mettre à jour là où le lit le `headersHelper`)
:::

---

#### `WARN-005` : Oublier --scope pour le partage équipe {#warn-005 .warn-title}
*Origine : documentation officielle (le scope par défaut est `local`).*

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

## Exemples prêts à l'emploi

### Exemple 1 : GitHub

Serveur distant officiel de GitHub, authentifié par un token d'accès personnel (fine-grained) envoyé en header.

::: warning `--header "Authorization: Bearer $GITHUB_PAT"` écrit le token en clair
C'est la forme montrée par la doc officielle, mais le shell remplace `$GITHUB_PAT` **avant** que Claude Code ne voie la commande : le token est enregistré en clair dans `~/.claude.json`, exactement ce que [WARN-001](#warn-001) cherche à éviter. Préférer OAuth (`/mcp`) quand le serveur le propose, sinon un `headersHelper` qui lit le token à chaque connexion :
:::

```bash
claude mcp add-json github '{"type":"http","url":"https://api.githubcopilot.com/mcp/","headersHelper":"$HOME/bin/github-mcp-headers.sh"}'
```

```bash
#!/bin/bash
# ~/bin/github-mcp-headers.sh — lit le token dans le gestionnaire de secrets (ici pass)
jq -nc --arg t "$(pass show github/mcp-pat)" '{Authorization: ("Bearer " + $t)}'
```

Les guillemets simples empêchent le shell de remplacer `$HOME` à l'ajout ; Claude Code lance le `headersHelper` dans un shell à chaque connexion. Vérifier avec `/mcp` que le serveur est `connected` (un mauvais token apparaît en `failed` avec le code HTTP, ex. 401).

```
Utilisateur : « Quelles PR sont ouvertes ? »
Claude → ToolSearch("github")
Claude → mcp__github__<outil de listing des PR>({ state: "open" })
Claude : « 3 PR ouvertes : #42, #43, #44 »
```

### Exemple 2 : PostgreSQL (DBHub)

[DBHub](https://github.com/bytebase/dbhub) (`@bytebase/dbhub`) connecte Claude à une base relationnelle via une chaîne de connexion. Utiliser un utilisateur **en lecture seule** :

```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"
```

Comme le token de l'exemple 1, la chaîne de connexion, mot de passe compris, est enregistrée telle quelle dans `~/.claude.json` : pour l'en sortir, la passer par la variable `DSN` (exemple 5).

```
Utilisateur : « Quel est le chiffre d'affaires ce mois ? »
Claude → mcp__db__query({ sql: "SELECT SUM(amount)..." })
```

### Exemple 3 : Permissions granulaires

```json
{
  "permissions": {
    "allow": [
      "mcp__github__get_issue",
      "mcp__db__search_objects"
    ],
    "ask": [
      "mcp__db__execute_sql"
    ],
    "deny": [
      "mcp__github__merge_pull_request"
    ]
  }
}
```

`search_objects` et `execute_sql` sont les deux outils exposés par DBHub ; vérifier les noms réels dans `/mcp`.

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

### Exemple 5 : Base de données réservée à un subagent

- **Serveur défini dans l'agent** (`mcpServers` inline) : il se connecte au démarrage du subagent, se déconnecte à la fin, et ses outils n'occupent pas le contexte principal ([sub-agents — Scope MCP servers](https://code.claude.com/docs/en/sub-agents#scope-mcp-servers-to-a-subagent)).
- **Chaîne de connexion** : DBHub la lit dans la variable d'environnement `DSN` ([doc DBHub](https://dbhub.ai/config/command-line)). La définir dans l'environnement du shell qui lance Claude Code (le serveur stdio en hérite), de préférence injectée par un gestionnaire de secrets plutôt qu'écrite dans `.bashrc` ou dans le fichier de l'agent.
- **Lecture seule** : `DSN` doit pointer vers un utilisateur PostgreSQL **en lecture seule** : c'est la base qui garantit l'absence d'écriture.
- **`disallowedTools` plutôt que `tools`** : voir [Pièges à connaître](#pieges-a-connaitre).

```markdown
---
name: db-analyst
description: Répond aux questions sur les données via des requêtes SELECT en lecture seule.
disallowedTools: Write, Edit, Bash
mcpServers:
  - db:
      type: stdio
      command: npx
      args: ["-y", "@bytebase/dbhub"]
---

Explore le schéma avec search_objects avant d'écrire une requête.
Retourne la requête utilisée et un résumé du résultat, pas les lignes brutes.
```

---

## Avant de mettre en service

### Installation

- [ ] Choisir le bon transport (`http` pour distant, `stdio` pour local, `ws` si le serveur pousse des événements) ; `type` renseigné dès qu'il y a une `url`
- [ ] Choisir le bon scope (`project`, soit `.mcp.json` dans git, si partage équipe ; `local` sinon)
- [ ] Tester la connexion : `/mcp` dans Claude Code

### Sécurité

- [ ] OAuth, puis `headersHelper`, sinon `${VARIABLE}` (jamais de token en clair)
- [ ] `allow` limité aux outils de lecture ; écritures en `ask`, actions irréversibles en `deny`
- [ ] Serveurs de confiance, de sources vérifiées (serveurs HTTP officiels, serveurs de référence maintenus — pas de packages archivés ; risque d'injection de prompt) ; `.mcp.json` d'un dépôt cloné relu avant approbation

### Organisation

- [ ] CLI d'abord (`gh`, `psql`, `kubectl`) ; MCP quand il apporte quelque chose
- [ ] `/context` pour mesurer le coût ; serveurs inutilisés désactivés dans `/mcp`
- [ ] `--strict-mcp-config` en CI
- [ ] `MAX_MCP_OUTPUT_TOKENS` si gros résultats attendus ; `timeout` par serveur pour les outils longs
- [ ] Serveurs lourds réservés à un subagent via `mcpServers` plutôt que dans `.mcp.json`
- [ ] Subagent avec `tools:` : outils MCP voulus listés, ou `disallowedTools` à la place

### Architecture de sécurité

```
Couche 1 : Choix des serveurs         ← Sources de confiance (injection de prompt)
Couche 2 : Secrets hors des fichiers  ← OAuth, headersHelper, variables
Couche 3 : Permissions allow/ask/deny ← Contrôle d'accès par outil
Couche 4 : Approbation .mcp.json      ← Dialogue de confiance (absent en -p / SDK)
Couche 5 : Managed MCP (enterprise)   ← Contrôle organisationnel
```

Le fait que chaque serveur tourne dans son propre processus n'est **pas** une barrière de sécurité : un serveur stdio s'exécute avec vos droits utilisateur, hors du sandbox et des règles de permission (qui ne portent que sur les appels d'outils de Claude).

---

## Pour aller plus loin

- [Agents](/concepts/agents) — réserver un serveur à un subagent avec `mcpServers`
- [Hooks](/concepts/hooks) — contrôler les appels d'outils MCP avec un matcher `mcp__<serveur>__.*` ; le type de hook `mcp_tool` et les événements `Elicitation` sont décrits dans la [référence officielle des hooks](https://code.claude.com/docs/en/hooks)
- [Settings](/concepts/settings) — où vivent les permissions `mcp__…`
- [Documentation officielle — MCP](https://code.claude.com/docs/en/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io) · [Serveurs MCP — GitHub](https://github.com/modelcontextprotocol/servers) · [MCP SDK — Build your own](https://modelcontextprotocol.io/quickstart/server)

---

*Vérifié avec **Claude Code v2.1.295** contre la documentation officielle le 10 octobre 2026. Une fonctionnalité plus récente peut manquer : voir le [journal des modifications](https://code.claude.com/docs/en/changelog).*
