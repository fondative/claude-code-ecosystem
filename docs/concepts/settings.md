# Settings

## En bref

| Aspect | Détail |
|--------|--------|
| **Quoi** | Configuration des permissions, [sandbox](/reference/glossary#sandbox), modèle, hooks et comportement de Claude Code |
| **Où** | 5 niveaux : [managed](/reference/glossary#managed) (imposé par l'organisation, non modifiable par l'utilisateur) > CLI (`--settings`) > local > project > user |
| **Permissions** | [`allow` (auto), `deny` (bloqué), `ask` (confirmation)](/reference/glossary#regles-de-permission) — deny prioritaire |
| **Fichiers** | Seules les règles `Read(…)` et `Edit(…)` sont consultées — `Edit` couvre tous les outils d'écriture |
| **Modes** | 6 [modes de permission](/reference/glossary#modes-de-permission) (`default`/Manual, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`) — cycle avec `Shift+Tab` |
| **Sandbox** | Isolation filesystem + réseau (macOS, Linux, WSL2) |
| **Vérification** | `/status` pour les settings actifs, `/permissions` pour les règles et leur fichier source |
| **Ce que cette page apporte** | Quoi mettre en `allow` / `ask` / `deny`, le `settings.json` réel du projet et les règles qui semblent protéger sans rien protéger |

---

## L'essentiel en 2 minutes

`settings.json` est la **configuration** de Claude Code, appliquée par le programme lui-même et non par le modèle : permissions, sandbox, modèle, [hooks](/concepts/hooks), variables d'environnement. C'est là, et non dans CLAUDE.md, que se décide ce que Claude **peut** faire. Le fichier `.claude/settings.json` se versionne et vaut pour toute l'équipe.

```
┌─────────────────────────────────────────────────────────────┐
│                         PERMISSIONS                         │
│                                                             │
│  Claude veut : Edit("php-legacy/file.php")                  │
│    1. deny ?   deny: Edit(/php-legacy/**)                   │
│       → BLOQUÉ (ask et allow ne sont pas consultés)         │
│                                                             │
│  Claude veut : Bash("git push origin main")                 │
│    1. deny ?   aucune règle                                 │
│    2. ask ?    ask: Bash(git push *)                        │
│       → CONFIRMATION DEMANDÉE                               │
│                                                             │
│  Claude veut : Bash("docker compose exec -T app php -v")    │
│    1. deny ?   aucune règle                                 │
│    2. ask ?    aucune règle                                 │
│    3. allow ?  allow: Bash(docker compose exec -T app *)    │
│       → AUTORISÉ sans confirmation                          │
│                                                             │
│  Aucune règle ne correspond → le mode de permission décide  │
└─────────────────────────────────────────────────────────────┘
```

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": ["Bash(npm run test *)", "Bash(npm run lint *)"],
    "ask": ["Bash(git push *)", "Edit(config/**)"],
    "deny": ["Edit(/php-legacy/**)", "Read(.env*)", "Bash(rm -rf *)"]
  }
}
```

Cinq faits changent la façon d'écrire ses settings :

1. **`deny` l'emporte toujours** : un hook `PreToolUse` passe d'abord, puis `deny` → `ask` → `allow` → le mode courant. Un `deny` reste appliqué même en `bypassPermissions`.
2. **Pour les fichiers, seules `Read(…)` et `Edit(…)` comptent.** Une règle `Write(…)` est acceptée mais jamais consultée ; `Edit(…)` couvre tous les outils d'écriture.
3. **Les lectures dans le projet sont déjà libres.** Un `"Read"` nu en `allow` n'ajoute rien dans le projet, mais autorise la lecture partout ailleurs (`~/.ssh`, `~/.aws`).
4. **Une règle `Bash(…)` compare du texte**, pas un programme : `Bash(rm -rf *)` ne bloque pas `/bin/rm -rf`. Pour une garantie : un hook ou le sandbox.
5. **Les `allow` d'un settings projet n'agissent qu'après le [dialogue de confiance](/reference/glossary#dialogue-de-confiance)** du dossier, qui les liste (de même que `additionalDirectories`) ; les `deny` et `ask` s'appliquent toujours ([source](https://code.claude.com/docs/en/permissions#project-allow-rules-and-workspace-trust)). Relire ce dialogue sur un dépôt cloné.

→ Tout le fonctionnement (niveaux et fusion, résolution, règles de fichiers et Bash, patterns, modes, sandbox, variables, managed) : [documentation officielle — Permissions](https://code.claude.com/docs/en/permissions) · [Settings](https://code.claude.com/docs/en/settings) · [Sandboxing](https://code.claude.com/docs/en/sandboxing).

---

## Bien configurer ses settings

### Quoi mettre dans allow vs ask vs deny

```
Lecture dans le projet ou commande en lecture seule (ls, cd, git status) ?
├── OUI → rien à faire (déjà sans confirmation)
└── NON
    Action TOUJOURS sans risque et fréquente ?
    ├── OUI → allow, au plus près de la commande (npm run test *)
    └── NON
        Action JAMAIS autorisée ?
        ├── OUI → deny (lire/écrire .env) + hook/sandbox (rm -rf, push forcé)
        └── NON → ask (git push, déploiement, modification de config)
```

| Pattern | Où | Pourquoi |
|---------|-----|----------|
| Lectures, `ls`, `cd`, `git status/diff/log` | — | Déjà sans confirmation (lecture seule intégrée) |
| `Bash(npm run test *)` | allow | Précis ; `Bash(npm *)` couvrirait `npm publish` |
| `Bash(docker compose exec -T app *)` | allow | <span class="chez-nous">Chez nous</span> tout s'exécute dans le conteneur, avec des règles ciblées (`Bash(docker compose exec -T app php bin/phpunit *)`…). Attention, ce motif large lance n'importe quelle commande interne |
| `Bash(git push *)` | ask | Vérification avant push |
| `Edit(/php-legacy/**)` | deny | Protéger le code source (toutes écritures) |
| `Bash(rm -rf *)` | deny | Destructeur (contournable via `sh -c` : coupler au sandbox) |
| `Read(.env*)` + `Edit(.env*)` | deny | Fichiers secrets (lecture et écriture), à toute profondeur ; `./.env*` ne couvrirait que le répertoire courant |

::: tip Protéger ses secrets dans les settings **user**
Dans `~/.claude/settings.json`, valable pour tous les projets (pratique reprise de [Trail of Bits](https://github.com/trailofbits/claude-code-config)) :

```json
{
  "permissions": {
    "deny": ["Read(~/.ssh/**)", "Read(~/.aws/**)", "Read(~/.config/gh/**)"]
  }
}
```

Ces `deny` ont les limites de tout `deny` `Read(…)` (voir [Pièges à connaître](#pieges-a-connaitre)).
:::

::: tip Élaguer les « don't ask again »
Pour une commande Bash ou un domaine WebFetch, « Yes, and don't ask again » enregistre une règle dans `.claude/settings.local.json` (à la racine du dépôt git) ; pour une modification de fichier, l'accord ne vaut que jusqu'à la fin de la session et n'est pas enregistré ([source](https://code.claude.com/docs/en/permissions#permission-system)). Relire régulièrement ces règles avec `/permissions` et retirer celles qui sont trop larges ou obsolètes.
:::

### La configuration réelle du projet

<span class="chez-nous">Chez nous</span> Le `.claude/settings.json` du projet de modernisation (fichier complet dans l'[exemple 1](#exemple-1-projet-de-modernisation)) :

| Bloc | Règles | Lecture |
|------|--------|---------|
| `allow` (43) | 24 `Bash(docker compose exec -T app php …)` ciblées (`bin/phpunit`, 21 sous-commandes `bin/console` en liste blanche, `vendor/bin/phpcs`, `vendor/bin/phpcbf`), `docker compose ps *`, `docker compose up -d *`, `git add *`, `mkdir *`, `jq empty *`, 12 commandes `npm` ciblées (`npm ci`, `npm test`, `npm run lint`/`typecheck`/`format`/`format:check`/`test`/`test:unit`/`test:integration`/`test:coverage`/`build`/`docs:build`), `Edit(/output/**)`, `Edit(/legacy-wiki/**)` | Tests, lint et build dans le conteneur ou sur l'hôte, et dossiers de sortie, sans confirmation ; toute autre commande demande confirmation |
| `ask` (8) | `Bash(git commit *)`, `Bash(git push *)`, 6 commandes destructrices (`doctrine:database:drop`, `doctrine:schema:drop`, `doctrine:schema:update`, `doctrine:fixtures:load`, `doctrine:query:sql`, `dbal:run-sql`) | Chaque commit, chaque push et chaque opération destructrice sur la base passent par l'utilisateur |
| `deny` (4) | `Edit(/php-legacy/**)`, `Edit(.env*)`, `Read(.env*)`, `Bash(rm -rf *)` | Legacy en lecture seule, secrets ni lus ni écrits |
| Autres | `hooks` : un `PreToolUse` sur `Bash` (`.claude/hooks/block-rm.sh`, testé par `block-rm.test.sh`) ; `env` : `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR=1` ; `includeGitInstructions: false` | Le hook refuse les suppressions récursives (`rm -r` sous toutes ses formes, `git rm -r` sans `--cached`, `find -delete`) |
| Absent | Pas de `sandbox`, pas de `defaultMode`, aucun serveur MCP | `settings.local.json` existe mais reste personnel (ignoré par git) |

Ce qu'il faut y lire : `settings.json` contient les **chemins réels**, pas les alias PATHS du CLAUDE.md ; un renommage de `php-legacy` doit donc aussi être reporté ici (le CLAUDE.md le rappelle). `Edit(/output/**)` et `Edit(/legacy-wiki/**)` ont un `/` initial : ils partent de la **racine du projet**, pas du répertoire courant. `Bash(rm -rf *)` ne bloque que cette forme exacte : les autres formes sont couvertes par le hook `block-rm.sh`.

::: info Chez nous : éviter une règle morte
Une règle comme `Edit(*-wiki/**)` ne correspondrait à **aucun dossier** du projet (le wiki de ce site s'appelle `wiki-claude-code/`, qui ne se termine pas par `-wiki`) et n'autoriserait rien. La règle du projet vise le chemin réel de `WIKI_TARGET` (table PATHS) : `Edit(/legacy-wiki/**)`.
:::

### Sandbox avec un projet qui passe tout par Docker ? {#sandbox}

Le sandbox ne s'applique qu'aux commandes shell (Bash, PowerShell, Monitor et leurs processus enfants). La documentation officielle est explicite : « `docker` is incompatible with the sandbox » ; il faut sortir les commandes Docker avec `sandbox.excludedCommands`, et une commande exclue tourne **avec tous vos droits** ([sandboxing](https://code.claude.com/docs/en/sandboxing#run-commands-outside-the-sandbox-with-excludedcommands)). Autoriser le socket `/var/run/docker.sock` revient à donner accès à l'hôte.

**La question à se poser :** *quelles commandes, hors Docker, Claude lance-t-il sur l'hôte ?*
- Presque aucune → le sandbox apporte peu ; misez sur `deny`/`ask` et la relecture des diffs.
- Des installations de paquets, des scripts, des appels réseau → le sandbox vaut le coût, avec un `excludedCommands` **étroit**.

::: info Chez nous
Toutes les commandes backend passent par `cd <BACKEND_TARGET> && docker compose exec -T app … 2>&1` : elles sortiraient du sandbox. Il protégerait surtout les commandes `npm` (frontend, sur l'hôte) et les commandes de lecture (`find`, `ls`, `git`). Le projet ne l'a **pas** activé. Si l'équipe l'active : exclure `docker compose exec -T app *` plutôt que `docker compose *` ([WARN-008](#warn-008)).
:::

### Pièges à connaître

- **Cinq niveaux, deux règles de fusion** : managed > `--settings` > local > projet > user ; les tableaux (`allow`, `deny`…) se concatènent, les valeurs simples (`model`, `defaultMode`) viennent du niveau le plus haut.
- **`/` n'a pas le même sens partout** : dans `Read(…)`/`Edit(…)`, `/chemin` part de la racine du projet (ou de `~/.claude` dans les settings user), `//chemin` est absolu, sans préfixe c'est le répertoire courant. Dans le sandbox, `/chemin` est absolu.
- **Placer le `*` après un espace** : `Bash(ls*)` matche aussi `lsof`, et `Bash(npm *)` couvre `npm publish`.
- **`MCP(github)` n'est pas une syntaxe valide** : écrire `mcp__github__*` ou `mcp__github__<outil>`.
- **`bypassPermissions`** garde les `deny` et `ask` explicites, mais n'offre aucune protection contre l'[injection de prompt](/reference/glossary#injection-de-prompt) (des instructions malveillantes cachées dans un fichier ou une page que Claude lit) : conteneurs ou VM isolés uniquement.
- **Un `deny` `Read(…)` n'arrête pas tout** : il bloque les outils de fichiers, les commandes Bash qui nomment le chemin (`cat ~/.ssh/id_rsa`) et les redirections, mais pas un `grep -r` lancé sur le dossier ni un script qui ouvre le fichier lui-même. Seul le sandbox ferme ce trou : une fois activé, il ajoute les chemins `Read` refusés à ce qu'aucune commande sandboxée ne peut lire.
- **Pour le réseau, préférer `WebFetch(domain:…)` à `Bash(curl …)`** : une règle `Bash(curl *)` ne voit ni `/usr/bin/curl` ni `sh -c 'curl …'`.

Détails et sources : [documentation officielle — Permissions](https://code.claude.com/docs/en/permissions).

### Erreurs fréquentes à éviter

→ Les pièges de toutes les briques, classés par gravité : [Catalogue des pièges](/guide/warns).

#### ⚠️ `WARN-001` : Permissions trop larges {#warn-001}

*Origine : documentation officielle (règles au plus près de la commande).*

Autoriser `Bash(*)` revient à désactiver toute protection sur les commandes shell.

::: danger Problème
```jsonc
// ❌ — Désactive toute sécurité
{ "permissions": { "allow": ["Bash(*)"] } }
```
Claude peut exécuter n'importe quelle commande sans restriction ni confirmation.
:::

::: info Solution
```jsonc
// ✅ — Commandes spécifiques
{ "permissions": { "allow": ["Bash(npm test *)", "Bash(docker compose exec -T app *)"] } }
```
Autoriser uniquement les commandes nécessaires au workflow du projet. (En mode `auto`, Claude Code ignore d'ailleurs les allow trop larges comme `Bash(*)` tant que le mode est actif.)
:::

---

#### ⚠️ `WARN-002` : Oubli du deny en écriture {#warn-002}

*Origine : règle du projet (le legacy est en lecture seule) ; vécu sur ce projet : le legacy a d'abord été protégé par une rule seule, sans `settings.json`.*

Sans règle `deny` explicite, Claude peut écrire dans des répertoires sensibles. Voir aussi [`CLAUDE.md` WARN-005](/concepts/claude-md#warn-005) sur la différence contexte vs permissions.

::: danger Problème
```jsonc
// ❌ — Le legacy n'est pas protégé
{ "permissions": { "allow": ["Read", "Edit"] } }
```
`Edit` sans restriction autorise l'écriture partout (Edit, Write, NotebookEdit), y compris dans le code source en lecture seule.
:::

::: info Solution
```jsonc
// ✅ — Protection explicite
{ "permissions": { "deny": ["Edit(/php-legacy/**)"] } }
```
Définir explicitement les répertoires protégés en écriture via `deny` sur `Edit(…)`. Une règle `Write(/php-legacy/**)` serait ignorée.
:::

---

#### ⚠️ `WARN-003` : Glob `*` vs `**` {#warn-003}

*Origine : bonne pratique générale (syntaxe gitignore des règles de fichiers).*

Un [glob](/reference/glossary#glob) avec `*` simple ne protège que le premier niveau de répertoire, laissant les sous-dossiers exposés.

::: danger Problème
```jsonc
// ❌ — Premier niveau seulement
{ "permissions": { "deny": ["Edit(/php-legacy/*)"] } }
```
Les fichiers dans `php-legacy/src/Controller/` ne sont pas couverts par ce pattern.
:::

::: info Solution
```jsonc
// ✅ — Récursif
{ "permissions": { "deny": ["Edit(/php-legacy/**)"] } }
```
Utiliser `**` pour une protection récursive sur tous les niveaux de sous-dossiers.
:::

---

#### ⚠️ `WARN-004` : MCP sans permissions {#warn-004}

*Origine : documentation officielle ; ce projet ne déclare aucun serveur MCP.*

Un serveur [MCP](/concepts/mcp) déclaré sans règles `allow`/`deny` expose tous ses outils au flux de permissions par défaut, sans granularité.

::: danger Problème
```jsonc
// ❌ — .mcp.json : serveur déclaré, aucune règle dans settings.json
{ "mcpServers": { "github": { "type": "http", "url": "https://api.githubcopilot.com/mcp/" } } }
```
Les serveurs se déclarent dans `.mcp.json` (projet) ou `~/.claude.json` (user), pas dans `settings.json`. Sans règle, le choix se fait au cas par cas (ou en bloc avec un allow `mcp__github` trop large), y compris pour les opérations destructives.
:::

::: info Solution
```jsonc
// ✅ — settings.json : permissions granulaires
{
  "permissions": {
    "allow": ["mcp__github__get_*"],
    "deny": ["mcp__github__delete_*"]
  }
}
```
Lister explicitement les outils MCP autorisés et bloquer les outils dangereux. `mcp__server` ou `mcp__server__*` cible tous les outils d'un serveur, `mcp__server__tool` un outil précis (les noms exacts dépendent du serveur : vérifiez-les avec `/mcp`).
:::

---

#### ⚠️ `WARN-005` : Settings projet pour des préférences personnelles {#warn-005}

*Origine : documentation officielle ([portée](/reference/glossary#scope) de chaque fichier de settings).*

Mettre des préférences personnelles dans `.claude/settings.json` les impose à toute l'équipe via git.

::: danger Problème
```jsonc
// ❌ — Dans .claude/settings.json (git) : préférences perso
{ "model": "claude-opus-5-5", "language": "french" }
```
Ces préférences personnelles sont committées et s'appliquent à tous les membres de l'équipe.
:::

::: info Solution
```jsonc
// ✅ — Dans .claude/settings.local.json (gitignore)
{ "model": "claude-opus-5-5", "language": "french" }
```
Utiliser `settings.local.json` (dans `.gitignore`) pour les préférences individuelles.
:::

---

#### ⚠️ `WARN-006` : Règles de chemin `Write(…)` : une protection fantôme {#warn-006}

*Origine : vécu sur ce projet : le `settings.json` a compté jusqu'à 4 règles `Write(…)`, toutes ignorées, et ne refusait pas la lecture des `.env` ; forme corrigée : uniquement `Read(...)`/`Edit(...)`, `.env*` refusés.*

Une règle `Write(chemin)` est acceptée sans erreur bloquante, mais Claude Code ne la consulte jamais : la protection n'existe que sur le papier.

::: danger Problème
```jsonc
// ❌ — Ancien deny du projet (extrait)
"deny": [
  "Write(/php-legacy/**)", "Edit(/php-legacy/**)",
  "Write(.env*)", "Edit(.env*)",
  "Bash(rm -rf *)"
]
```
Les deux `Write(…)` n'ajoutaient rien (`Edit(…)` protégeait déjà l'écriture), et rien n'empêchait de **lire** les fichiers `.env`.
:::

::: info Solution
```jsonc
// ✅ — deny actuel du projet
"deny": ["Edit(/php-legacy/**)", "Edit(.env*)", "Read(.env*)", "Bash(rm -rf *)"]
```
`Edit(…)` pour toute écriture, `Read(…)` pour toute lecture. Après chaque modification, vérifier l'absence d'avertissement « règle ignorée » au démarrage et relire `/permissions`.
:::

---

#### ⚠️ `WARN-007` : `"Read"` nu en `allow` {#warn-007}

*Origine : vécu sur ce projet : présent dans une ancienne version du `settings.json`, retiré.*

Autoriser l'outil `Read` sans chemin ne fait gagner aucune confirmation dans le projet, mais en supprime partout ailleurs.

::: danger Problème
```jsonc
// ❌ — Ancien allow du projet (extrait)
"allow": ["Read", "Glob", "Grep", "Bash(docker compose exec -T app *)"]
```
Les lectures dans le répertoire de travail sont déjà libres ; ce `"Read"` autorisait en plus, sans confirmation, la lecture de `~/.ssh`, `~/.aws` ou de tout autre dossier de la machine.
:::

::: info Solution
```jsonc
// ✅ — allow actuel du projet (extrait) : pas de Read nu
"allow": ["Bash(docker compose exec -T app php bin/phpunit *)", "Bash(git add *)", "Bash(npm run lint *)"]
```
Pour un dossier externe réellement utile, l'ajouter explicitement (`permissions.additionalDirectories` ou `Read(~/chemin/precis/**)`), et protéger les secrets user par des `deny` (voir plus haut).
:::

---

#### ⚠️ `WARN-008` : Sortir `docker compose *` du sandbox {#warn-008}

*Origine : documentation officielle ([sandboxing — excludedCommands](https://code.claude.com/docs/en/sandboxing#run-commands-outside-the-sandbox-with-excludedcommands)).*

Exclure une commande du sandbox la fait tourner avec tous vos droits : un motif trop large rouvre ce que le sandbox fermait.

::: danger Problème
```json
{ "sandbox": { "enabled": true, "excludedCommands": ["docker compose *"] } }
```
Toute commande `docker compose` tourne hors sandbox avec vos droits. Claude peut en outre **modifier le fichier compose** (un volume, une commande) puis le lancer hors sandbox.
:::

::: info Solution
Exclure la seule forme utilisée par le projet, `docker compose exec -T app *`, garder `docker compose up`/`down` en confirmation, et ajouter les fichiers compose en `deny Edit(…)` si le sandbox doit vraiment tenir.
:::

---

## Exemples prêts à l'emploi

### Exemple 1 : Projet de modernisation

::: details Voir la configuration complète
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "includeGitInstructions": false,
  "env": {
    "CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR": "1"
  },
  "permissions": {
    "allow": [
      "Bash(docker compose exec -T app php bin/phpunit *)",
      "Bash(docker compose exec -T app php bin/console about *)",
      "Bash(docker compose exec -T app php bin/console cache:clear *)",
      "Bash(docker compose exec -T app php bin/console cache:warmup *)",
      "Bash(docker compose exec -T app php bin/console debug:router *)",
      "Bash(docker compose exec -T app php bin/console debug:container *)",
      "Bash(docker compose exec -T app php bin/console debug:autowiring *)",
      "Bash(docker compose exec -T app php bin/console debug:config *)",
      "Bash(docker compose exec -T app php bin/console debug:event-dispatcher *)",
      "Bash(docker compose exec -T app php bin/console router:match *)",
      "Bash(docker compose exec -T app php bin/console lint:container *)",
      "Bash(docker compose exec -T app php bin/console lint:yaml *)",
      "Bash(docker compose exec -T app php bin/console make:entity *)",
      "Bash(docker compose exec -T app php bin/console make:migration *)",
      "Bash(docker compose exec -T app php bin/console make:fixtures *)",
      "Bash(docker compose exec -T app php bin/console doctrine:database:create *)",
      "Bash(docker compose exec -T app php bin/console doctrine:migrations:diff *)",
      "Bash(docker compose exec -T app php bin/console doctrine:migrations:migrate *)",
      "Bash(docker compose exec -T app php bin/console doctrine:migrations:status *)",
      "Bash(docker compose exec -T app php bin/console doctrine:migrations:generate *)",
      "Bash(docker compose exec -T app php bin/console doctrine:schema:validate *)",
      "Bash(docker compose exec -T app php bin/console doctrine:mapping:info *)",
      "Bash(docker compose ps *)",
      "Bash(docker compose exec -T app php vendor/bin/phpcs *)",
      "Bash(docker compose exec -T app php vendor/bin/phpcbf *)",
      "Bash(git add *)",
      "Bash(mkdir *)",
      "Bash(jq empty *)",
      "Bash(npm run lint *)",
      "Bash(npm run typecheck *)",
      "Bash(npm run format *)",
      "Bash(npm run format:check *)",
      "Bash(npm run test *)",
      "Bash(npm run test:unit *)",
      "Bash(npm run test:integration *)",
      "Bash(npm run test:coverage *)",
      "Bash(npm run build *)",
      "Bash(npm test *)",
      "Bash(npm ci *)",
      "Bash(npm run docs:build *)",
      "Bash(docker compose up -d *)",
      "Edit(/output/**)",
      "Edit(/legacy-wiki/**)"
    ],
    "ask": [
      "Bash(git commit *)",
      "Bash(git push *)",
      "Bash(docker compose exec -T app php bin/console doctrine:database:drop *)",
      "Bash(docker compose exec -T app php bin/console doctrine:schema:drop *)",
      "Bash(docker compose exec -T app php bin/console doctrine:fixtures:load *)",
      "Bash(docker compose exec -T app php bin/console doctrine:query:sql *)",
      "Bash(docker compose exec -T app php bin/console dbal:run-sql *)",
      "Bash(docker compose exec -T app php bin/console doctrine:schema:update *)"
    ],
    "deny": [
      "Edit(/php-legacy/**)",
      "Edit(.env*)",
      "Read(.env*)",
      "Bash(rm -rf *)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-rm.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```
:::

::: info Convention de ce projet
Les règles `Bash(docker compose exec -T app …)` reflètent la règle du projet « toutes les commandes backend dans le conteneur », limitées à `phpunit`, `phpcs`/`phpcbf` et à une liste blanche de sous-commandes `bin/console` ; les sous-commandes destructrices de Doctrine passent en `ask`. Les commandes `npm` sont ciblées (`npm run lint *`… plutôt que `npm *`). `Bash(rm -rf *)` ne bloque que cette forme exacte (voir [limites des règles Bash](https://code.claude.com/docs/en/permissions#bash-rule-limits)) : le hook `block-rm.sh` refuse les autres formes de suppression récursive.
:::

### Exemple 2 : Settings personnel (local)

`.claude/settings.local.json` :

```json
{
  "model": "claude-opus-5-5",
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
      "allowWrite": ["/tmp/build"],
      "denyRead": ["~/.aws/credentials", "~/.ssh/id_rsa"]
    },
    "network": {
      "allowedDomains": ["github.com", "*.npmjs.org", "registry.yarnpkg.com"]
    }
  }
}
```

### Exemple 4 : Template de démarrage

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm test *)",
      "Bash(npm run lint *)"
    ],
    "ask": [
      "Bash(git push *)"
    ],
    "deny": [
      "Read(.env*)",
      "Edit(./.env*)"
    ]
  }
}
```

Les lectures et `git status/diff/log` n'ont pas besoin d'`allow`. Pour bloquer `rm -rf` sous toutes ses formes (`rm -fr`, `rm -r -f`, `/bin/rm -rf`…), un `deny` Bash ne suffit pas : voir le hook de l'exemple suivant, et le sandbox pour une vraie garantie.

### Exemple 5 : Fichier d'équipe officiel

Extrait du [fichier d'équipe de la doc officielle](https://code.claude.com/docs/en/settings-example#a-teams-shared-settings) ([marketplace](/reference/glossary#marketplace) de plugins omise) : un `ask`, des `deny` de lecture, un hook qui inspecte **chaque** commande Bash et le sandbox.

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)"],
    "ask": ["Bash(git push *)"],
    "deny": ["Read(.env*)", "Read(./secrets/**)"]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-rm.sh" }
        ]
      }
    ]
  },
  "sandbox": {
    "enabled": true,
    "filesystem": { "allowWrite": ["/tmp/build"] },
    "network": { "allowedDomains": ["registry.npmjs.org", "*.example.com"] }
  }
}
```

`.claude/hooks/block-rm.sh` ([doc hooks](https://code.claude.com/docs/en/hooks), `chmod +x`) — il voit le texte complet de la commande et refuse tout `rm` récursif, quel que soit l'ordre des options (`rm -rf`, `rm -fr`, `rm -r -f`, `rm -R`, `rm --recursive`, `/bin/rm -rf`, `sh -c "rm -rf …"`) :

```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command')

# rm suivi d'options dont l'une contient r/R, ou --recursive
if echo "$COMMAND" | grep -Eq '(^|[^[:alnum:]_-])rm[[:space:]]+(-[[:alnum:]]+[[:space:]]+)*(-[[:alpha:]]*[rR]|--recursive)'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Destructive command blocked by hook"
    }
  }'
else
  exit 0  # pas de décision : flux de permissions normal
fi
```

Ce filtre reste textuel : il bloque aussi `git rm -r` (faux positif à confirmer à la main) et laisse passer une suppression écrite autrement (`find … -delete`, script Python). Les `deny` `Read(…)` de ce fichier ont les limites décrites dans [Pièges à connaître](#pieges-a-connaitre), que le sandbox comble.

---

## Avant de mettre en service

### Permissions

- [ ] Pas de `"Read"` nu en `allow` (les lectures dans le projet sont déjà libres)
- [ ] `allow` : commandes fréquentes, précises (`npm run test *` plutôt que `npm *`), `*` après un espace
- [ ] `ask` : actions avec impact (git push, deploy)
- [ ] `deny` : secrets (`Read(.env*)` + `Edit(.env*)`, nom nu : toute profondeur), legacy (`Edit(...)`)
- [ ] Commandes destructrices (rm -rf, push forcé) : hook `PreToolUse` et/ou sandbox, pas seulement un `deny` Bash
- [ ] Settings user : `deny` sur `~/.ssh`, `~/.aws`, `~/.config/gh`
- [ ] « Don't ask again » relus et élagués (`/permissions`)
- [ ] Aucune règle de chemin `Write(...)` (ignorée) — utiliser `Edit(...)`
- [ ] Globs avec `**` (récursif)
- [ ] MCP avec permissions granulaires (`mcp__serveur__outil`)
- [ ] Chemins relatifs choisis en connaissance de cause : `/chemin` (racine du projet) ou `chemin` (répertoire courant)

### Fichiers

- [ ] `.claude/settings.json` pour l'équipe (git) — ses `allow` n'agissent qu'après le dialogue de confiance
- [ ] `.claude/settings.local.json` pour les préférences perso (gitignore)
- [ ] `$schema` pour l'autocomplétion IDE
- [ ] <span class="chez-nous">Chez nous</span> Chemins du `settings.json` alignés sur la table PATHS du CLAUDE.md

### Sandbox

- [ ] Sandbox activé si Claude lance sur l'hôte des commandes hors Docker (npm, scripts, réseau) — macOS, Linux, WSL2
- [ ] `denyRead` du sandbox ou deny `Read(…)` des settings user pour les credentials (`~/.aws`, `~/.ssh`) — les deux sont fusionnés
- [ ] `allowedDomains` pour le réseau
- [ ] `excludedCommands` limité à la forme utilisée (`docker compose exec -T app *`), jamais `docker compose *` ([WARN-008](#warn-008))

### Vérification

- [ ] `/status` (fichiers chargés), `/permissions` (règles et fichier source), `claude doctor` (entrées rejetées)
- [ ] Aucun avertissement de règle ignorée au démarrage
- [ ] Tester les deny : Claude doit être bloqué
- [ ] Tester les allow : pas de confirmation inutile
- [ ] Hook de sécurité testé aussi sur les commandes autorisées (pas de faux positif)

---

## Pour aller plus loin

- [Modes de permission](https://code.claude.com/docs/en/permission-modes) — chaque mode, le classifieur et les chemins protégés
- [Hooks](/concepts/hooks) — la garantie que les règles Bash ne donnent pas
- [Consigne ou blocage ?](/concepts/which-mechanism#consigne-ou-blocage) — quand une rule suffit, quand il faut un `deny` ou un hook
- [CLAUDE.md](/concepts/claude-md) — le contexte, à ne pas confondre avec les permissions
- [Documentation officielle — Settings](https://code.claude.com/docs/en/settings), [Permissions](https://code.claude.com/docs/en/permissions), [Permission modes](https://code.claude.com/docs/en/permission-modes), [Example settings files](https://code.claude.com/docs/en/settings-example), [Settings reference](https://code.claude.com/docs/en/settings-reference)
- [JSON Schema](https://json.schemastore.org/claude-code-settings.json)

---

*Vérifié avec **Claude Code v2.1.295** contre la documentation officielle le 10 octobre 2026. Une fonctionnalité plus récente peut manquer : voir le [journal des modifications](https://code.claude.com/docs/en/changelog).*
