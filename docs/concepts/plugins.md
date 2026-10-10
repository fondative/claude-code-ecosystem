# Plugins

## En bref

| Aspect | Détail |
|--------|--------|
| **Quoi** | Packages distribuables contenant [skills](/concepts/skills), [agents](/concepts/agents), [hooks](/concepts/hooks), [serveurs MCP](/concepts/mcp), serveurs [LSP](/reference/glossary#lsp) (intelligence de code), [output styles](/reference/glossary#output-style)… |
| **Où** | Installés depuis un [marketplace](/reference/glossary#marketplace) (catalogue de plugins) : `/plugin install <nom>@<marketplace>` (en session) ou `claude plugin install` (CLI) |
| **[Manifeste](/reference/glossary#manifeste)** | `.claude-plugin/plugin.json` (optionnel, seul `name` est requis ; peut déclarer un `userConfig`, les réglages demandés à l'utilisateur à l'activation du plugin, comme une URL ou un token) ; tout le reste à la racine du plugin |
| **Namespace** | `/plugin-name:skill-name` — coexiste avec les skills projet/utilisateur de même nom |
| **[Scope](/reference/glossary#scope)** | `user` (tous vos projets), `project` (`.claude/settings.json` versionné), `local` (vous, ce dépôt) |
| **Partage** | Dossier ou `.zip` (sans marketplace), marketplace privé ou public (dépôt git, URL, chemin local) ; `enabledPlugins` + `extraKnownMarketplaces` pour une équipe ou une organisation |
| **Test local** | `claude --plugin-dir ./mon-plugin` (session uniquement, sans installation) |
| **Ce que cette page apporte** | Quand empaqueter en plugin plutôt que garder un `.claude/`, comment auditer un plugin avant de l'installer, et deux approches réelles de l'équipe : le `.claude/` du projet de modernisation et le plugin recode |

---

## L'essentiel en 2 minutes

Un plugin est un **répertoire de composants** ([skills](/concepts/skills), [agents](/concepts/agents), [hooks](/concepts/hooks), [serveurs MCP](/concepts/mcp)…) que Claude Code installe et charge **comme une seule unité**. Il permet de distribuer un ensemble cohérent de capacités à travers des projets et des équipes, avec des mises à jour versionnées depuis un marketplace.

```
┌────────────────────────────────────────┐
│                 PLUGIN                 │
│                                        │
│  mon-plugin/                           │
│  ├── .claude-plugin/                   │
│  │   └── plugin.json   (manifeste)     │
│  ├── skills/                           │
│  │   ├── review-pr/SKILL.md            │
│  │   └── deploy/SKILL.md               │
│  ├── agents/                           │
│  │   └── security-auditor.md           │
│  ├── hooks/                            │
│  │   └── hooks.json                    │
│  └── .mcp.json                         │
│                                        │
│  Préfixe : /mon-plugin:review-pr       │
│            /mon-plugin:deploy          │
│            mon-plugin:security-auditor │
└────────────────────────────────────────┘
```

```json
{ "name": "mon-plugin", "description": "Review de PR et déploiement", "author": { "name": "Équipe Plateforme" } }
```

::: tip Plugin ou configuration `.claude/` ?
Skills, agents, hooks et serveurs MCP fonctionnent très bien **sans plugin**. Un plugin se justifie quand on veut **empaqueter** plusieurs composants pour les partager (équipe, plusieurs projets, versions publiées).
:::

Cinq faits changent la façon de concevoir un plugin :

1. **Tout est préfixé par le nom du plugin** : `/mon-plugin:deploy` ne peut pas entrer en conflit avec `/deploy`, mais l'invocation change. Seuls les hooks n'ont pas de préfixe.
2. **Un plugin activé pèse sur chaque session** : descriptions de ses skills et agents dans le contexte, serveurs MCP lancés, hooks déclenchés.
3. **Il exécute du code avec vos droits, hors du sandbox**, et l'auto-update peut changer ses fichiers après votre audit.
4. **Seul `plugin.json` va dans `.claude-plugin/`** ; un `CLAUDE.md` à la racine du plugin n'est pas chargé.
5. **`version` renseignée fige les utilisateurs** sur cette version : sans changement de `version`, les nouveaux commits ne leur parviennent pas.

→ Tout le fonctionnement (structure, manifeste et `userConfig`, variables, namespace, commandes CLI et en session, chargement sans installation, hooks et MCP d'un plugin, mods — plugins dont les hooks sont écrits en JavaScript et peuvent aussi afficher des panneaux —, distribution et publication) : [documentation officielle — Plugins](https://code.claude.com/docs/en/plugins) · [Plugins reference](https://code.claude.com/docs/en/plugins-reference).

---

## Quand créer un plugin ?

```
Les extensions sont-elles spécifiques à UN projet ?
├── OUI → .claude/skills/ + .claude/agents/ (pas de plugin)
│
└── NON → Avec qui les partager ?
    ├── Quelques personnes → dossier ou .zip transmis directement
    │                        (claude --plugin-dir), sans marketplace
    ├── Équipe / organisation → marketplace privé (dépôt git privé)
    │       + enabledPlugins dans .claude/settings.json du dépôt
    │       (managed settings pour l'imposer à toute l'organisation)
    └── Public → marketplace public (ou annuaire d'Anthropic)
```

Les [managed settings](/reference/glossary#managed) ne sont pas un canal de distribution : ils **enregistrent et imposent** un marketplace existant. Source : [Share your plugin](https://code.claude.com/docs/en/plugins/create#share-the-plugin).

Deux critères de plus, tirés des [choix d'architecture du plugin recode](/recode/#choix-d-architecture) : un plugin s'impose aussi quand le travail **couvre plusieurs dépôts** (un `.claude/` appartient à un seul dépôt) ou quand les dépôts de code **ne doivent garder aucune trace** de l'outillage.

---

## Bien concevoir un plugin

### Ce qu'un plugin activé coûte

Un plugin activé fait partie de **chaque session**, même quand on ne l'utilise pas :

- **Contexte** : le nom et la description de chaque skill, agent et command invocable par Claude sont dans le contexte à chaque tour. Le contenu complet ne se charge qu'à l'usage.
- **Processus** : ses serveurs MCP tournent et ses hooks se déclenchent à leurs événements.
- **Permissions** : ce qu'il exécute, il l'exécute avec vos droits.

`/plugin` (onglet **Installed**) regroupe les plugins **non utilisés récemment** ; `/skill-doctor` montre le coût de chaque skill. Désactiver sans désinstaller : `claude plugin disable <plugin>`.

### Cycle de développement

```bash
# 1. Créer le squelette (dans ~/.claude/skills/<nom>/, chargé comme <nom>@skills-dir)
claude plugin init mon-plugin --with skills hooks

# 2. Tester sans installer, pour une session (répétable, dossier ou .zip)
claude --plugin-dir ./mon-plugin

# 3. Après une modification : /reload-plugins dans la session

# 4. Valider (--strict : les avertissements deviennent des erreurs, utile en CI)
claude plugin validate ./mon-plugin --strict

# 5. Mesurer le déclenchement des skills avec des évals (v2.1.269+)
claude plugin eval ./mon-plugin
```

→ Autres modes de chargement sans installation (`--plugin-url`, `CLAUDE_CODE_PLUGIN_DIRS`) : [documentation officielle — CLI reference](https://code.claude.com/docs/en/cli-reference).

::: tip Se faire accompagner : `plugin-dev`
Le plugin `plugin-dev` du marketplace officiel ajoute des skills et agents pour écrire skills, hooks et serveurs MCP, puis valider le plugin : `/plugin install plugin-dev@claude-plugins-official`, puis `/plugin-dev:create-plugin <description>`.
:::

### Plugin minimal complet

Le plus petit plugin utile : un manifeste et une skill ([Create your first plugin](https://code.claude.com/docs/en/plugins/create#create-your-first-plugin)).

```bash
mkdir -p hello-plugin/.claude-plugin hello-plugin/skills/hello
```

```json
{
  "name": "hello-plugin",
  "description": "Plugin d'exemple : une skill de salutation",
  "author": { "name": "Votre nom" }
}
```

```markdown
---
name: hello
description: Salue l'utilisateur et lui demande comment l'aider
disable-model-invocation: true
---

Saluer chaleureusement l'utilisateur et lui demander comment l'aider aujourd'hui.
```

Le premier bloc va dans `hello-plugin/.claude-plugin/plugin.json`, le second dans `hello-plugin/skills/hello/SKILL.md`. Puis `claude plugin validate ./hello-plugin` et `claude --plugin-dir ./hello-plugin` ; la skill s'invoque avec `/hello-plugin:hello`. Sans `version`, les utilisateurs d'un marketplace suivront les commits.

### Convertir un `.claude/` en plugin

Les skills, agents et hooks existants passent dans un plugin **sans réécriture** ([Convert an existing `.claude/` setup](https://code.claude.com/docs/en/plugins/create#convert-an-existing-claude-setup)) :

1. Créer `mon-plugin/.claude-plugin/plugin.json`.
2. Copier `.claude/skills`, `.claude/agents`, `.claude/commands` à la racine du plugin (`cp -r .claude/skills mon-plugin/`…).
3. Copier l'objet `hooks` de `.claude/settings.json` dans `mon-plugin/hooks/hooks.json`, enveloppé dans `{ "hooks": … }`.
4. Tester avec `claude --plugin-dir ./mon-plugin` : `/deploy` devient `/mon-plugin:deploy`, l'agent `reviewer` devient `mon-plugin:reviewer`.
5. Une fois validé, **supprimer les originaux** de `.claude/` et retirer `hooks` des settings.

::: danger Piège : hooks exécutés deux fois
Tant que les originaux restent dans `.claude/`, skills et agents coexistent sans conflit (préfixe `mon-plugin:`), mais les **hooks n'ont pas de préfixe** : un hook présent à la fois dans les settings et dans `hooks/hooks.json` s'exécute **deux fois** à chaque événement.
:::

### Auditer un plugin avant installation

Un plugin installé peut exécuter du code arbitraire **avec vos droits**. Le nom du marketplace dit qui publie le catalogue, pas ce que fait chaque plugin : auditer quelle que soit la source ([Plugin security and trust](https://code.claude.com/docs/en/plugins/security#review-a-plugin-before-you-install)).

| Étape | Comment |
|-------|---------|
| Source du marketplace | `claude plugin marketplace list` affiche d'où vient chaque marketplace |
| Composants annoncés | `/plugin` → fiche du plugin → section **Will install** (commands, agents, skills, hooks, serveurs MCP et LSP) |
| Code réellement exécuté | Lire `hooks/hooks.json` (commande de chaque hook), `.mcp.json` (commande ou URL de chaque serveur) et **chaque fichier** de `bin/` |
| Inventaire local | `claude --plugin-dir <dossier> plugin details <nom>` sur un clone, sans démarrer de session ; après installation, `claude plugin details <nom>` |

::: warning Hors sandbox et mis à jour en arrière-plan
- Hooks, monitors (commandes que le plugin lance en arrière-plan pendant la session, par exemple pour surveiller un déploiement), serveurs MCP et LSP d'un plugin tournent **hors du [sandbox](/concepts/settings#sandbox)** et hors des règles de permission, qui ne couvrent que les appels d'outils de Claude.
- Le dossier `bin/` est ajouté au `PATH` de l'outil Bash.
- Si l'auto-update est activé pour le marketplace, les fichiers audités peuvent **changer sur le disque** sans action de votre part : le désactiver par marketplace (`/plugin` → **Marketplaces**) pour les sources tierces.
:::

### Partager avec l'équipe

Pour que tous les contributeurs d'un dépôt aient les mêmes plugins, les déclarer dans le `.claude/settings.json` versionné :

```json
{
  "extraKnownMarketplaces": {
    "team-plugins": {
      "source": { "source": "github", "repo": "org/team-plugins" }
    }
  },
  "enabledPlugins": {
    "security-audit@team-plugins": true
  }
}
```

Le marketplace n'est enregistré qu'après acceptation du [dialogue de confiance](/reference/glossary#dialogue-de-confiance) du dossier par chaque contributeur. Ensuite, tout dépend de l'emplacement du plugin dans le catalogue ([Require plugins per repository](https://code.claude.com/docs/en/plugins/org#require-plugins-per-repository)) :

- plugin rangé **dans le dépôt du marketplace** (chemin relatif) : il se charge automatiquement ;
- plugin pointant vers **une source externe** (son propre dépôt GitHub, par exemple) : chaque contributeur voit `Plugin "<nom>" is enabled in project settings but isn't installed` et doit lancer `claude plugin install <nom>@<marketplace> --scope project`.

→ Ajouter un marketplace, imposer des plugins à une organisation (managed settings), publier : [documentation officielle — Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces).

### Bonnes pratiques

| Faire | Ne pas faire |
|-------|-------------|
| Un plugin = un domaine cohérent | Un plugin fourre-tout « utils » |
| Nom descriptif en kebab-case (`security-audit`, `devops`) | Nom générique (`tools`, `helpers`) ou réservé (`claude-…`, `anthropic-…`) |
| `description` + `author` renseignés ; `version` incrémentée à chaque release **ou** omise | `version` figée alors que le code change ; manifeste non validé |
| README à la racine du plugin | Pas de documentation |
| Instructions dans des skills | Instructions dans un `CLAUDE.md` (ignoré) |
| État dans `${CLAUDE_PLUGIN_DATA}` | État dans `${CLAUDE_PLUGIN_ROOT}` (effacé à la mise à jour) |
| Hooks rapides, `timeout` réduit pour un hook qui peut bloquer (défaut 600 s pour un hook `command`, [hooks](https://code.claude.com/docs/en/hooks)) | Hook lent ou bloquant laissé au délai par défaut |

### Dans l'équipe

::: info Chez nous
Deux approches coexistent dans l'équipe. Le projet de modernisation (ce dépôt) **n'est pas un plugin** : sa configuration vit dans `.claude/`. Le [plugin recode](/recode/), documenté dans ce wiki, empaquette un autre outillage de l'équipe. Les faits ci-dessous viennent de `.claude/` et du CLAUDE.md du projet d'une part, des pages [Plugin recode](/recode/) d'autre part.

| Aspect | Projet de modernisation (`.claude/`) | Plugin recode |
|--------|--------------------------------------|---------------|
| Forme | `.claude/` versionné dans le dépôt du projet | Plugin Claude Code, « un package unique, installé et mis à jour à un seul endroit » |
| Contenu | 11 agents, 12 skills, 8 commands, 7 rules | 9 skills répartis en 4 workflows (Développement, Migration, Réalisation, Documentation) |
| Portée | Un dépôt (legacy, backend et frontend cibles en sous-dossiers) | Un workspace qui couvre plusieurs dépôts (source, cibles) |
| Chemins | Section PATHS du CLAUDE.md (+ chemins réels dans `settings.json`) | Déclarés par chaque skill ; configuration propre au workspace, stockée hors des dépôts, proposée à la première utilisation puis confirmée une fois |
| Enchaînement | Skill lanceur `/mod-migrate-feature` : specs → planification → implémentation → conformité | Chaque skill invoqué explicitement, un par un ; validation humaine à chaque étape |
| Invocation | `/mod-migrate-feature <nom>`, `/dev:commit` | `/recode:explore-need`, `/recode:analyze-app`… |
| Traces dans les dépôts de code | `.claude/` et CLAUDE.md dans le dépôt | Aucune |

Ce qu'il faut y lire : le `.claude/` convient à un outillage **propre à un projet** ; recode a été conçu en plugin parce qu'il sert **plusieurs projets et plusieurs dépôts à la fois**.
:::

### Pièges à connaître

- **`hooks/hooks.json` doit envelopper les événements dans une clé `"hooks"`**, sinon le fichier ne se charge pas.
- **`${CLAUDE_PLUGIN_ROOT}` change à chaque mise à jour** : l'état va dans `${CLAUDE_PLUGIN_DATA}`, lui-même supprimé à la désinstallation (sauf `--keep-data`). En forme shell, mettre `"${CLAUDE_PLUGIN_ROOT}"` entre guillemets.
- **Une liste blanche `strictKnownMarketplaces` bloque les plugins placés dans `skills/`** (ceux créés par `claude plugin init`), sauf si elle contient `{ "source": "skills-dir" }`.
- **`extraKnownMarketplaces` d'un projet attend le dialogue de confiance** du dossier (voir [Partager avec l'équipe](#partager-avec-l-equipe)).

Détails et sources : [documentation officielle — Plugins reference](https://code.claude.com/docs/en/plugins-reference).

### Erreurs fréquentes à éviter

→ Les pièges de toutes les briques, classés par gravité : [Catalogue des pièges](/guide/warns).

#### `WARN-001` : Recopier le même `.claude/` dans chaque projet {#warn-001 .warn-title}
*Origine : choix de conception de l'équipe, motivation du plugin recode (« au lieu de copies de `.claude/` qui divergent d'un projet à l'autre », [Choix d'architecture](/recode/#choix-d-architecture)).*

Un outillage destiné à plusieurs projets, recopié dans le `.claude/` de chacun, évolue différemment dans chaque copie.

::: danger Problème
```text
projet-a/.claude/skills/analyze-app/   ← corrigé dans ce projet
projet-b/.claude/skills/analyze-app/   ← copie d'origine
projet-c/.claude/skills/analyze-app/   ← modifié localement
→ trois versions divergentes, une trace dans l'historique de chaque dépôt,
  et un outil qui ne peut pas couvrir plusieurs dépôts à la fois
```
:::

::: info Solution
```text
recode/  (plugin, installé une fois)
→ /recode:analyze-app identique pour tous les projets
→ mis à jour à un seul endroit
→ configuration par workspace, stockée hors des dépôts
```
Réserver `.claude/` à ce qui est propre au projet (conventions, rules, permissions) ; empaqueter en plugin ce qui est commun à plusieurs projets.
:::

---

#### `WARN-002` : Composants rangés dans `.claude-plugin/` ou au mauvais endroit {#warn-002 .warn-title}
*Origine : documentation officielle ; vécu sur ce wiki (erreur trouvée dans cette page : serveurs MCP d'un plugin placés dans `mcp/mcp.json`).*

Claude Code ne cherche les composants qu'à leur emplacement standard : un dossier mal placé n'est pas chargé.

::: danger Problème
```text
mon-plugin/
├── .claude-plugin/
│   ├── plugin.json
│   └── skills/          ← ❌ ignoré : seul plugin.json va ici
├── mcp/
│   └── mcp.json         ← ❌ ignoré : les serveurs MCP vont dans .mcp.json à la racine
└── CLAUDE.md            ← ❌ jamais chargé en contexte
```
:::

::: info Solution
```text
mon-plugin/
├── .claude-plugin/
│   └── plugin.json      ← SEUL fichier de ce dossier
├── skills/<nom>/SKILL.md
├── agents/
├── hooks/hooks.json     ← enveloppé dans { "hooks": … }
└── .mcp.json            ← à la racine
```
Les instructions passent par une skill. `claude plugin validate` signale un `CLAUDE.md` à la racine ; tester ensuite avec `claude --plugin-dir` que chaque composant apparaît bien (`/plugin`, onglet **Errors** en cas de problème).
:::

---

## Exemples prêts à l'emploi

### Plugins de référence

Plutôt que de partir de zéro, lire ou installer des plugins maintenus par Anthropic (dépôt [`anthropics/claude-code/plugins`](https://github.com/anthropics/claude-code/tree/main/plugins) et marketplace `claude-plugins-official`) :

| Plugin | Intérêt |
|--------|---------|
| `feature-dev` | Développement de feature en 7 phases, agents `code-explorer`, `code-architect`, `code-reviewer` |
| `code-review` | Review de PR par plusieurs agents spécialisés, avec score de confiance pour filtrer les faux positifs |
| `commit-commands` | Commandes git (`commit`, `commit-push-pr`…) avec injection du contexte et `allowed-tools` minimaux |
| `hookify` | Créer des hooks qui empêchent des comportements indésirables, à partir de la conversation ou d'instructions |
| `security-guidance` | Hook `PreToolUse` qui avertit des failles potentielles (injection de commande, XSS, `eval`…) pendant l'édition |
| `plugin-dev`, `skill-creator` | Écrire et valider plugins et skills |
| `php-lsp`, `typescript-lsp` | **Intelligence de code** (LSP) : diagnostics après chaque édition et navigation par symbole. Binaire requis : `intelephense` (PHP), `typescript-language-server` (TS) — [Code intelligence](https://code.claude.com/docs/en/plugins/code-intelligence) |

```bash
# Ex. pour le frontend React/TS de ce projet
npm install -g typescript-language-server typescript
# puis, en session :
/plugin install typescript-lsp@claude-plugins-official
```

### Exemple 1 : Plugin de sécurité

```
security-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── security-audit/
│       ├── SKILL.md
│       └── references/
│           └── owasp-top-10.md
├── agents/
│   └── vulnerability-scanner.md
├── hooks/
│   └── hooks.json          # PreToolUse : détection de secrets
└── scripts/
    └── detect-secrets.sh
```

### Exemple 2 : Plugin DevOps

```
devops-plugin/
├── .claude-plugin/
│   └── plugin.json         # userConfig : URL et token du monitoring
├── skills/
│   ├── deploy/
│   │   └── SKILL.md
│   └── rollback/
│       └── SKILL.md
├── agents/
│   └── infra-reviewer.md
└── .mcp.json               # Serveur MCP pour le monitoring
```

---

## Avant de mettre en service

### Structure

- [ ] `.claude-plugin/` ne contient que `plugin.json`, tout le reste à la racine
- [ ] Chaque skill dans `skills/<nom>/SKILL.md`
- [ ] Chaque agent dans `agents/<nom>.md`
- [ ] Hooks dans `hooks/hooks.json`, enveloppés dans `"hooks": { … }`
- [ ] MCP dans `.mcp.json` à la racine
- [ ] Pas d'instructions dans un `CLAUDE.md` (non chargé)

### Qualité

- [ ] Chaque `description` dit quoi faire et quand
- [ ] `"${CLAUDE_PLUGIN_ROOT}"` (entre guillemets) pour les chemins du plugin, `${CLAUDE_PLUGIN_DATA}` pour l'état
- [ ] Secrets déclarés en `userConfig` avec `sensitive: true`
- [ ] Hooks rapides, `timeout` adapté pour ceux qui peuvent bloquer
- [ ] README à la racine

### Distribution

- [ ] Plugin réservé à un outillage commun à plusieurs projets ; ce qui est propre au projet reste dans `.claude/`
- [ ] Testé localement avec `claude --plugin-dir ./mon-plugin`
- [ ] `claude plugin validate --strict` en CI ; renseigner `version` ou accepter l'avertissement qu'entraîne son absence
- [ ] `version` incrémentée à chaque release, ou omise (suivi des commits)
- [ ] Hooks retirés de `.claude/settings.json` après conversion ([pourquoi](#convertir-un-claude-en-plugin))
- [ ] Nom clair, descriptif et non réservé
- [ ] Partage par le dépôt : `extraKnownMarketplaces` pris en compte après le dialogue de confiance ; plugin à source externe à installer par chaque contributeur ([détail](#partager-avec-l-equipe))

### Installation d'un plugin tiers

- [ ] Section **Will install** lue, puis `hooks/hooks.json`, `.mcp.json` et `bin/`
- [ ] Auto-update désactivé pour les marketplaces tiers non audités

---

## Pour aller plus loin

- [Plugin recode](/recode/) — le plugin de l'équipe : principes, workflows et choix d'architecture
- [Skills](/concepts/skills) — le composant principal d'un plugin
- [Hooks](/concepts/hooks) et [MCP](/concepts/mcp) — à auditer avant d'installer un plugin tiers
- [Documentation officielle — Plugins](https://code.claude.com/docs/en/plugins) · [Manifeste (plugins reference)](https://code.claude.com/docs/en/plugins-reference) · [Commandes `claude plugin`](https://code.claude.com/docs/en/plugins/cli-reference)
- [Gérer les plugins pour une organisation](https://code.claude.com/docs/en/plugins/org) · [Créer un plugin](https://code.claude.com/docs/en/plugins/create) · [Sécurité des plugins](https://code.claude.com/docs/en/plugins/security)

---

*Vérifié avec **Claude Code v2.1.295** contre la documentation officielle le 9 octobre 2026. Une fonctionnalité plus récente peut manquer : voir le [journal des modifications](https://code.claude.com/docs/en/changelog).*
