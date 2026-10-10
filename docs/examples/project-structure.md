# Structure du projet .claude/

::: tip Ce que vous trouverez sur cette page
La configuration Claude Code **réelle** du projet de modernisation : chaque fichier, ce qu'il fait, et comment l'ensemble s'enchaîne. Pour la structure générique valable dans n'importe quel projet, voir d'abord [Architecture .claude/](/introduction/architecture).
:::

## Vue d'ensemble

| Composant | Quantité | Répartition |
|-----------|----------|-------------|
| Agents | 11 | 5 d'analyse, 2 de planification, 2 d'implémentation, 1 de conformité, 1 de diagnostic (`health-check`) |
| Skills | 12 | 4 de lancement, 6 de conventions, 2 sur Claude Code (`claude-code-`) |
| Rules | 7 | 1 chargée en permanence (`git`) + 6 ciblées par `paths` |
| Commands | 8 | 6 `dev:` + 2 `review:` (ancien format, voir plus bas) |
| Références de skill | 41 | Fichiers `.md` des dossiers `references/` : 15 backend + 3 tests backend + 9 frontend + 3 tests frontend + 4 conformité + 3 génération de docs + 1 visualisation + 3 skill-command-model. `mod-generate-docs/references/` contient en plus `package.json`, `vitepress-config.ts` et `wiki-src/` (9 sources copiées dans le wiki : données TS, composants Vue, CSS, page de Cartographie) |
| Hooks | 1 | `PreToolUse` sur `Bash` → `hooks/block-rm.sh` : refuse les suppressions récursives (`rm -r`, `git rm -r` sans `--cached`, `find -delete`), requiert `jq`, testé par `hooks/block-rm.test.sh` |
| Serveurs MCP | 0 | Pas de `.mcp.json` |

À la racine du dépôt, à côté de `.claude/`, le `CLAUDE.md` est la **source unique des chemins** du projet (`SOURCE_PROJECT`, `BACKEND_TARGET`…) : les agents et les skills les y lisent au lieu de les écrire en dur. Trois endroits ne peuvent pas lire le `CLAUDE.md` et contiennent donc des chemins réels : les règles `Edit(...)` de `settings.json`, le `paths:` des rules et `STACK_DIRS` du script `scripts/install-stack.sh`. L'agent `health-check` vérifie qu'ils restent alignés sur la table des chemins.

## Arborescence complète

```
.claude/
├── README.md
├── settings.json                          # Permissions, env et hooks de l'équipe (commité)
├── settings.local.json                    # Réglages personnels (non commité)
├── agents/
│   ├── legacy-technical-analyzer.md      # Opus - Reverse engineering
│   ├── legacy-functional-analyzer.md     # Sonnet - Inventaire fonctionnel
│   ├── legacy-functional-analyzer-auditor.md  # Haiku - Audit
│   ├── legacy-feature-analyzer.md        # Opus - Spec 14 sections
│   ├── legacy-feature-analyzer-refiner.md # Sonnet - Affinement
│   ├── backend-tasks-planner.md          # Sonnet - Planification backend
│   ├── backend-tasks-executor.md         # Sonnet - Implementation TDD (acceptEdits)
│   ├── frontend-tasks-planner.md         # Sonnet - Planification frontend
│   ├── frontend-tasks-executor.md        # Sonnet - Implementation frontend + design (acceptEdits)
│   ├── conformity-reporter.md            # Sonnet - Scoring
│   └── health-check.md                   # Haiku - Diagnostics + chemins en dur (plan)
├── skills/
│   ├── mod-analyze-legacy/SKILL.md          # Pipeline d'analyse (launcher)
│   ├── mod-migrate-feature/SKILL.md         # Migration E2E (launcher)
│   ├── mod-generate-visualization/          # ECharts (appelée par mod-analyze-legacy)
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── echarts-spec.md
│   ├── mod-generate-docs/                   # VitePress (launcher, aussi appelée par mod-migrate-feature pour la sync wiki)
│   │   ├── SKILL.md
│   │   └── references/                      # 14 fichiers
│   │       ├── home-page.md
│   │       ├── migration-status.md
│   │       ├── theme-and-styles.md
│   │       ├── package.json
│   │       ├── vitepress-config.ts
│   │       └── wiki-src/                    # Copié dans le wiki : tableaux de bord calculés
│   │           ├── data/                    # migration.data.ts, migration-states.ts
│   │           ├── pages/                   # mapping-index.md (Cartographie)
│   │           └── theme/                   # index.ts, custom.css, components/Migration*.vue (4)
│   ├── mod-conformity-conventions/          # Scoring et rapports
│   │   ├── SKILL.md
│   │   └── references/                      # 4 fichiers
│   │       ├── scoring-methodology.md
│   │       ├── report-template.md
│   │       ├── version-management.md
│   │       └── issue-reporting.md
│   ├── sym-api-conventions/
│   │   ├── SKILL.md                         # Conventions backend
│   │   └── references/                      # 15 fichiers
│   │       ├── getting-started.md
│   │       ├── request-lifecycle.md
│   │       ├── create-entity.md
│   │       ├── create-dto.md
│   │       ├── create-mapper.md
│   │       ├── create-repository.md
│   │       ├── create-service.md
│   │       ├── create-controller.md
│   │       ├── api-reference.md
│   │       ├── exception-handling.md
│   │       ├── database-setup.md
│   │       ├── jwt-auth.md
│   │       ├── email-service.md
│   │       ├── logging.md
│   │       └── debugging.md
│   ├── sym-testing-conventions/
│   │   ├── SKILL.md                         # TDD et stratégies
│   │   └── references/                      # 3 fichiers
│   │       ├── tdd-conventions.md
│   │       ├── testing.md
│   │       └── mocking-strategies.md
│   ├── front-app-conventions/
│   │   ├── SKILL.md                         # Conventions frontend
│   │   └── references/                      # 9 fichiers
│   │       ├── getting-started.md
│   │       ├── architecture.md
│   │       ├── code-standards.md
│   │       ├── api-integration.md
│   │       ├── authentication.md
│   │       ├── state-management.md
│   │       ├── routing.md
│   │       ├── features.md
│   │       └── styling.md
│   ├── front-design-conventions/
│   │   └── SKILL.md                         # Conventions design Figma
│   ├── front-testing-conventions/
│   │   ├── SKILL.md                         # TDD et stratégies
│   │   └── references/                      # 3 fichiers
│   │       ├── tdd-conventions.md
│   │       ├── testing.md
│   │       └── mocking-strategies.md
│   ├── claude-code-parallel-agents/
│   │   └── SKILL.md                         # Agents en parallèle
│   └── claude-code-skill-command-model/
│       ├── SKILL.md                         # Skill vs command, audit .claude/
│       └── references/
│           ├── framework.md
│           ├── skill-template.md
│           └── command-template.md
├── rules/
│   ├── legacy-readonly.md    # php-legacy/** → LECTURE SEULE
│   ├── symfony-api.md        # api-rest-symfony-target/** → Conventions
│   ├── frontend.md           # app-react-target/** → Délégation vers skills
│   ├── output-format.md      # output/** → Format Markdown
│   ├── design.md             # output/design/** → Figma JSON
│   ├── docs.md               # api-rest-symfony-target/docs/** → OpenAPI
│   └── git.md                # (global) → Conventional Commits
├── commands/                 # Ancien format des skills (toujours lu)
│   ├── dev/
│   │   ├── commit.md         # /dev:commit
│   │   ├── install-stack.md  # /dev:install-stack
│   │   ├── php-test.md       # /dev:php-test
│   │   ├── php-lint.md       # /dev:php-lint
│   │   ├── front-test.md     # /dev:front-test
│   │   └── front-lint.md     # /dev:front-lint
│   └── review/
│       ├── symfony-review.md  # /review:symfony-review
│       └── frontend-review.md # /review:frontend-review
├── hooks/
│   ├── block-rm.sh           # PreToolUse (Bash) : refuse les suppressions récursives
│   └── block-rm.test.sh      # Cas bloqués et autorisés (bash .claude/hooks/block-rm.test.sh)
└── scripts/
    └── install-stack.sh      # Lancé par /dev:install-stack (option --force)
```

## Settings : la couche de sécurité

Extrait de `.claude/settings.json` (la liste blanche `allow` est abrégée ; les autres sections sont complètes) :

```jsonc
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "includeGitInstructions": false,
  "env": {
    "CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR": "1"
  },
  "permissions": {
    "allow": [
      "Bash(docker compose exec -T app php bin/phpunit *)",
      "Bash(docker compose exec -T app php bin/console debug:router *)",
      "Bash(docker compose exec -T app php bin/console doctrine:migrations:migrate *)",
      // … 19 autres sous-commandes bin/console (about, cache:*, debug:*, router:match,
      //   lint:*, make:*, doctrine:database:create, doctrine:migrations:*, …)
      "Bash(docker compose exec -T app php vendor/bin/phpcs *)",
      "Bash(docker compose exec -T app php vendor/bin/phpcbf *)",
      "Bash(docker compose ps *)",
      "Bash(docker compose up -d *)",
      "Bash(git add *)",
      "Bash(mkdir *)",
      "Bash(jq empty *)",
      "Bash(npm run lint *)",
      "Bash(npm run typecheck *)",
      // … npm run format, format:check, test, test:unit, test:integration,
      //   test:coverage, build, docs:build
      "Bash(npm test *)",
      "Bash(npm ci *)",
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

**Logique** :
- **Lecture** : lire des fichiers, chercher (Grep, Glob) et lancer des commandes en lecture seule (`git status`, `git diff`, `git log`…) ne demande pas d'autorisation dans le dossier de travail. C'est le comportement par défaut de Claude Code ([Permissions](https://code.claude.com/docs/en/permissions)), pas un effet de `settings.json`. Les fichiers `.env` (secrets) ne peuvent être ni lus ni modifiés.
- **Commandes** : une **liste blanche** plutôt qu'un joker. Dans le conteneur, seuls `phpunit`, `phpcs`/`phpcbf` et une sélection de sous-commandes `bin/console` passent sans confirmation ; côté frontend, `npm ci`, `npm test` et des scripts `npm run` nommés. Les six commandes de base de données destructives (`doctrine:database:drop`, `doctrine:schema:drop`, `doctrine:schema:update`, `doctrine:fixtures:load`, `doctrine:query:sql`, `dbal:run-sql`), `git commit` et `git push` demandent toujours confirmation.
- **Écriture** : sans confirmation dans `/output/**` et `/legacy-wiki/**` (le `/` initial désigne la racine du projet ; `legacy-wiki` est le `WIKI_TARGET` du `CLAUDE.md`). Le legacy (`php-legacy/`) ne peut pas être modifié.
- **Suppressions récursives** : bloquées deux fois, par `deny: Bash(rm -rf *)` et par le hook `block-rm.sh`, qui rattrape aussi les variantes (`rm -r`, `rm -fr`, `git rm -r` sans `--cached`, `find -delete`, `rm` derrière `sudo`, `xargs` ou `sh -c`…). Le hook est un garde-fou, pas une frontière de sécurité : le script liste lui-même ce qu'il ne voit pas. → [Hooks](/concepts/hooks)

::: info Chez nous
- `"includeGitInstructions": false` retire les consignes git intégrées de Claude Code : les conventions de commit viennent de la rule `git` et de `/dev:commit`.
- `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR=1` ramène le shell à la racine du projet après chaque commande Bash : les commandes du pipeline s'écrivent donc `cd <cible> && <commande> 2>&1`.

Rôle exact de ces deux réglages : [documentation officielle des settings](https://code.claude.com/docs/en/settings) ; usage dans le projet : [Settings](/concepts/settings).
:::

::: info Pourquoi `Edit(...)` et pas `Write(...)`
Claude Code ne vérifie les chemins de fichiers qu'avec les règles `Read(...)` et `Edit(...)` ; une règle `Edit` couvre tous les outils qui écrivent (y compris `Write`). Une règle `Write(...)` serait acceptée mais jamais appliquée. → [Settings](/concepts/settings)
:::

## Relations clés

### Deux sortes de skills

Le projet utilise les skills de deux façons. Ce ne sont pas deux types techniques : c'est le frontmatter qui décide qui peut les déclencher.

| Sorte | Rôle | Qui la déclenche | Réglage dans le frontmatter | Skills du projet |
|-------|------|------------------|-----------------------------|------------------|
| **Skill de conventions** (« passive ») | Transmettre des règles de code aux agents | Les agents qui la listent dans leur champ `skills:`, ou Claude quand il la juge utile — **pas** l'utilisateur | `user-invocable: false` (absente du menu `/`) | `sym-*`, `front-*`, `mod-conformity-conventions` |
| **Skill de lancement** (« launcher ») | Dérouler un workflow complet en lançant des agents | **Vous**, en tapant `/nom` | `disable-model-invocation: true` (Claude ne la lance pas de lui-même) | `/mod-analyze-legacy`, `/mod-migrate-feature` |

`mod-generate-docs` et `mod-generate-visualization` n'ont aucun des deux réglages : vous pouvez les lancer, et les skills de lancement les appellent aussi. Il en va de même pour les deux skills `claude-code-*` (aide à la maintenance de `.claude/` : agents en parallèle, classement skill/command).

### Skills héritées par les agents

Chaque agent démarre avec ces skills déjà chargées (champ `skills:` de son frontmatter) :

| Agent | Skills héritées |
|-------|----------------|
| `backend-tasks-planner` | `sym-api-conventions`, `sym-testing-conventions` |
| `backend-tasks-executor` | `sym-api-conventions`, `sym-testing-conventions` |
| `frontend-tasks-planner` | `front-app-conventions`, `front-testing-conventions`, `front-design-conventions` |
| `frontend-tasks-executor` | `front-app-conventions`, `front-testing-conventions`, `front-design-conventions` |
| `conformity-reporter` | `sym-api-conventions`, `sym-testing-conventions`, `front-app-conventions`, `front-testing-conventions`, `mod-conformity-conventions` |

Les agents d'analyse du legacy (`legacy-*`) et `health-check` n'ont pas de champ `skills:` : ils décrivent le code existant sans appliquer les conventions de la cible.

### Rules et leur renfort settings

Une rule est une **consigne** (Claude la suit, sans garantie) ; le `settings.json` l'**impose**. Les rules importantes sont donc doublées par une permission :

| Rule | Glob pattern | Renfort settings.json |
|------|-------------|----------------------|
| `legacy-readonly.md` | `php-legacy/**` | `deny: Edit(/php-legacy/**)` |
| `symfony-api.md` | `api-rest-symfony-target/**` | `allow` : liste blanche `phpunit` / `bin/console` / `phpcs` dans le conteneur ; `ask` : commandes Doctrine destructives |
| `git.md` | (global) | `ask: Bash(git commit/push *)` : la rule interdit le commit hors du launcher `/mod-migrate-feature`, et `ask` fait valider chaque commit de lot |
| (pas de rule) | — | Suppressions récursives : `deny: Bash(rm -rf *)` + hook `block-rm.sh` (`rm -r`, `git rm -r` sans `--cached`, `find -delete`) |

### Pipeline des skills launchers

```
/mod-analyze-legacy
  → legacy-technical-analyzer (Opus)
  → legacy-functional-analyzer (Sonnet)
  → legacy-functional-analyzer-auditor (Haiku)
  → legacy-feature-analyzer x N en batch (Opus, optionnel)
  → /mod-generate-visualization
  → sync wiki (si le dossier wiki existe)

/mod-migrate-feature <nom>
  → pré-requis : stacks cibles installés (sinon /dev:install-stack)
  → legacy-feature-analyzer (Opus) → arbitrage des écarts au legacy (vous)
  → /mod-generate-docs <nom> (sync wiki de la spec, si le dossier wiki existe)
  → backend-tasks-planner (Sonnet)
  → frontend-tasks-planner (Sonnet)
  → /mod-generate-docs <nom> (sync wiki de la planification)
  → backend-tasks-executor (Sonnet), par lots de 3 tâches : tests verts → commit du lot (ask)
  → frontend-tasks-executor (Sonnet), idem
  → conformity-reporter (Sonnet) → commit du rapport
  → boucle qualité (si score < 80/100 : 1 passe de correction par lots, puis rapport V2 ; pas de V3)
  → /mod-generate-docs <nom> (sync wiki, si le dossier wiki existe)
```

Tâches `Blocked` et ligne `Decision`, reprise d'un lot interrompu, passage final sans tâche : voir [Pipeline](/examples/pipeline).

### Exemple : ce qui se passe pendant `/mod-migrate-feature panier`

1. Vous tapez `/mod-migrate-feature panier` : la skill de lancement se charge (Claude ne l'aurait pas lancée seul).
2. Elle vérifie que les stacks cibles existent, puis délègue la spécification à `legacy-feature-analyzer`.
3. Les planificateurs découpent le travail ; `backend-tasks-executor` démarre avec `sym-api-conventions` et `sym-testing-conventions` déjà chargées.
4. Dès que l'exécutant modifie un fichier de `api-rest-symfony-target/`, la rule `symfony-api` s'ajoute à son contexte.
5. S'il tentait de modifier `php-legacy/`, la règle `deny` de `settings.json` bloquerait l'action, quelle que soit sa décision.
6. Après chaque lot de 3 tâches, le launcher rejoue les tests : verts, il lance `git commit` (vous validez, règle `ask`) ; rouges, il s'arrête sans commiter.
7. `conformity-reporter` note le résultat ; sous 80/100, les exécutants corrigent une seule fois (lots de 3 corrections, chacun commité), puis `conformity-reporter` produit un rapport V2 ; sous 80/100 en V2, le pipeline s'arrête pour une intervention humaine.

## Commands du projet {#commands-du-projet}

Les 8 fichiers de `commands/` sont l'ancien format des skills : ils fonctionnent toujours, mais n'acceptent ni `name` ni `paths` et ne peuvent pas avoir de fichiers annexes. Un sous-dossier devient un préfixe séparé par `:` : `commands/dev/commit.md` s'invoque avec **`/dev:commit`** (écrire `/dev/commit` documenterait une invocation qui n'existe pas : [Commands, WARN-008](/concepts/commands#warn-008)). Pourquoi migrer, différences entre les deux formats, règle de nommage : [Commands](/concepts/commands#quand-migrer-vers-skill).

Qui les déclenche :
- **Réservées à l'utilisateur** (`disable-model-invocation: true`) : `/dev:commit` et `/dev:install-stack`.
- **Aussi déclenchées par Claude** : les quatre commandes `dev:` de test et de lint (leur `description` dit « Utiliser après… ») ; le launcher `/mod-migrate-feature` reprend le critère de succès de `/dev:php-test` pour ses checkpoints.
- **Exécutées à part** : les deux `review:` tournent en `context: fork` (agent `general-purpose`).

Si les huit commandes migrent vers des skills, la correspondance serait la suivante :

| Fichier actuel | Invocation actuelle | Skill cible | Invocation future |
|---|---|---|---|
| `commands/dev/commit.md` | `/dev:commit` | `skills/dev-commit/` | `/dev-commit` |
| `commands/dev/install-stack.md` | `/dev:install-stack` | `skills/dev-install-stack/` | `/dev-install-stack` |
| `commands/dev/php-test.md` | `/dev:php-test` | `skills/dev-php-test/` | `/dev-php-test` |
| `commands/dev/php-lint.md` | `/dev:php-lint` | `skills/dev-php-lint/` | `/dev-php-lint` |
| `commands/dev/front-test.md` | `/dev:front-test` | `skills/dev-front-test/` | `/dev-front-test` |
| `commands/dev/front-lint.md` | `/dev:front-lint` | `skills/dev-front-lint/` | `/dev-front-lint` |
| `commands/review/symfony-review.md` | `/review:symfony-review` | `skills/symfony-review/` | `/symfony-review` |
| `commands/review/frontend-review.md` | `/review:frontend-review` | `skills/frontend-review/` | `/frontend-review` |

### Stratégie de migration (option)

La migration est une option, pas une obligation : les commands restent lues. Si l'équipe la mène :

- **Préfixe dans le nom de dossier** (`dev-commit`) : simple, et le regroupement visuel est conservé dans le menu `/`. C'est la stratégie recommandée.
- Écartée : le **nom court** (`commit`), qui risque d'entrer en collision avec une autre skill ou une commande intégrée (une skill projet remplace la commande intégrée de même nom).
- Écartée : **conserver `/dev:commit` via un plugin** (dossier `.claude/skills/dev/` avec `.claude-plugin/plugin.json`, chargé comme plugin `dev@skills-dir`), plus lourd : confiance du workspace requise, activation à vérifier dans `/plugin`. Voir [Plugins](/concepts/plugins).
- **Migration progressive**, fichier par fichier : tant qu'une command n'est pas migrée, elle reste lue ; dès qu'une skill porte le même nom, la skill gagne.

### Étapes propres au projet

Le déplacement d'un fichier et l'adaptation de son frontmatter sont illustrés par l'[exemple 1 de Commands](/concepts/commands#exemple-1-dev-commit). Ce qui est propre au projet :

1. **Mettre à jour le `CLAUDE.md`** : section « Commandes techniques » (`/dev:commit` → `/dev-commit`, etc.) et toute mention dans les autres sections.
2. **Mettre à jour la rule `git`** (`.claude/rules/git.md`) : remplacer `/dev:commit` par `/dev-commit`.
3. **Mettre à jour `mod-migrate-feature`** : ses commits de lot suivent « le format de `.claude/commands/dev/commit.md` », son pré-requis renvoie à `/dev:install-stack` et ses checkpoints au critère de `/dev:php-test`.
4. **Mettre à jour les autres références croisées** : `.claude/README.md`, exemples internes aux fichiers, ce wiki.
5. **Vérifier** : `/skills` liste les nouvelles skills, et `/dev-commit` apparaît dans le menu `/`.

---

*Vérifié avec **Claude Code v2.1.295** contre la documentation officielle le 10 octobre 2026. Une fonctionnalité plus récente peut manquer : voir le [journal des modifications](https://code.claude.com/docs/en/changelog).*
