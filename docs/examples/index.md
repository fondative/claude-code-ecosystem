# Manuel d'utilisation : Modernisation Legacy

## Contexte

Ce projet utilise Claude Code pour migrer une application PHP legacy vers une architecture moderne :

- **Source** : PHP procédurale, MySQL, pas de framework
- **Cible backend** : Symfony 7.4, PostgreSQL, API REST, JWT
- **Cible frontend** : React 19 + TypeScript + Vite + Tailwind CSS 4, appels HTTP directs à l'API

L'écosystème Claude Code orchestre l'ensemble du processus, de l'analyse initiale à la documentation finale.

## Vue d'ensemble du pipeline

```
Phase 0 : Infrastructure
└── CLAUDE.md, agents, skills, rules, commandes, settings.json, hooks, scripts

Phase 1 : Analyse (/mod-analyze-legacy)
├── Analyse technique (reverse engineering)
├── Inventaire fonctionnel (features, rôles, flux)
├── Audit (enrichissement, features manquantes)
├── Specs détaillées en batch (optionnel)
└── Sync wiki (si le dossier wiki existe)

Phase 2 : Visualisation (/mod-generate-visualization, lancée par la phase 1)
├── Graphe de dépendances (ECharts force-directed)
└── Arbre fonctionnel (ECharts tree)

Phase 3 : Migration, par feature (/mod-migrate-feature)
├── Étape 0 : stacks cibles installés (sinon /dev:install-stack)
├── Étape 1 : spécification détaillée (14 sections, écarts au legacy arbitrés)
├── Étape 2 : planification backend + frontend
├── Étape 3 : implémentation TDD par lots de 3 tâches, chaque lot testé puis commité
├── Étape 4 : rapport de conformité (scoring)
├── Étape 5 : boucle qualité (1 passe de correction puis V2, seuil 80/100)
└── Étape 6 : sync wiki (si WIKI_TARGET existe ; aussi après la spec, la planification et chaque lot)

Phase 4 : Documentation (/mod-generate-docs)
└── Site VitePress adaptatif
```

Le détail de chaque phase et les validations humaines sont dans la [Méthodologie](/guide/methodology).

## Les livrables du pipeline et où les voir

Chaque étape produit un fichier, rangé sous un alias de la table de `CLAUDE.md`. La dernière colonne renvoie à la section du wiki exemple (projet *Classified Ads*) qui montre ce livrable.

| Phase / étape | Livrable | Produit par | Fichier (alias) | Dans le cas d'usage |
|---------------|----------|-------------|-----------------|---------------------|
| Phase 0 | Configuration Claude Code et son inventaire | L'architecte (configuration) ; `/mod-generate-docs harness` (inventaire) | `CLAUDE.md`, `.claude/` ; `WIKI_TARGET/docs/modernisation/claude-harness.md` | <CasUsage page="modernisation/claude-harness.html#agents">agents</CasUsage> · <CasUsage page="modernisation/claude-harness.html#permissions-settings-json">permissions</CasUsage> |
| Phase 1, étape 1 | Analyse technique (7 fichiers) | `legacy-technical-analyzer` | `SOURCE_TECHNICAL_DIR/00-index.md` à `06-audit.md` | <CasUsage page="docs/analyses/overview.html#_2-architecture-de-haut-niveau">vue d'ensemble</CasUsage> · <CasUsage page="docs/analyses/audit.html#_6-4-plan-d-action-priorise">audit</CasUsage> |
| Phase 1, étapes 2 et 3 | Inventaire fonctionnel et arbre, enrichis par l'audit | `legacy-functional-analyzer`, puis `legacy-functional-analyzer-auditor` | `FEATURE_SPECS_DIR/0-index.md`, `FEATURE_SPECS_DIR/0-features-tree.json` | <CasUsage page="docs/features/index.html#inventaire-des-features">inventaire des features</CasUsage> |
| Phase 2 | Graphe de dépendances et arbre fonctionnel (HTML autonomes) ; cartographie du wiki | `/mod-generate-visualization` ; `/mod-generate-docs` (`<MigrationMap />`) | `FEATURE_SPECS_DIR/dependency-graph.html`, `FEATURE_SPECS_DIR/features-tree-visualization.html` ; `WIKI_TARGET/docs/mapping/index.md` | <CasUsage page="mapping/index.html#cartographie-de-la-migration">cartographie</CasUsage> |
| Phase 3, étape 0 | Projets cibles installés | `/dev:install-stack` | `BACKEND_TARGET`, `FRONTEND_TARGET` | — |
| Phase 3, étape 1 | Spec en 14 sections, écarts au legacy arbitrés | `legacy-feature-analyzer` ; arbitrage par `/mod-migrate-feature` | `FEATURE_SPECS_DIR/<feature>_spec.md` | <CasUsage page="docs/features/regions.html#sec-1">spec Régions</CasUsage> · <CasUsage page="docs/features/regions.html#sec-13">écarts arbitrés</CasUsage> |
| Phase 3, étape 2 | Analyses backend (avec la section « Spécification OpenAPI ») et frontend : tâches, dépendances, critères | `backend-tasks-planner`, puis `frontend-tasks-planner` | `BACKEND_ANALYSIS_DIR/<feature>_backend_analysis.md`, `FRONTEND_ANALYSIS_DIR/<feature>_frontend_analysis.md` | <CasUsage page="modernisation/api/regions.html#liste-des-taches-backend">analyse API Régions</CasUsage> · <CasUsage page="modernisation/frontend/regions.html#liste-des-taches-frontend">analyse Frontend Régions</CasUsage> |
| Phase 3, étape 3 | Code et tests par lots de 3 tâches, statut des tâches, contrat d'API ; timeline et journal du wiki | `backend-tasks-executor`, `frontend-tasks-executor` ; commit et `/mod-generate-docs <feature> status` par `/mod-migrate-feature` | `BACKEND_TARGET`, `FRONTEND_TARGET`, `OPENAPI_SPEC` ; `WIKI_TARGET/docs/modernisation/changelog.md` | <CasUsage page="modernisation/regions.html#timeline">timeline Régions</CasUsage> · <CasUsage page="modernisation/changelog.html#journal-de-modernisation">journal</CasUsage> |
| Phase 3, étape 4 | Rapport de conformité V1 (score sur 100) | `conformity-reporter` | `REPORTS_DIR/<feature>_CONFORMITY_REPORT.md` | <CasUsage page="modernisation/conformity-categories.html#score-global">conformité Catégories</CasUsage> |
| Phase 3, étape 5 | Corrections (MODE CORRECTION) et rapport V2 si le V1 est sous 80/100 | Executors, puis `conformity-reporter` | `REPORTS_DIR/<feature>_CONFORMITY_REPORT-V2.md` | <CasUsage page="modernisation/conformity-categories.html#suivi-v1-→-v2-section-11-4-anticipee">suivi V1 → V2</CasUsage> |
| Phase 3, étape 6 | Pages de la feature dans le wiki (timeline, analyses, conformité) | `/mod-generate-docs <feature>` | `WIKI_TARGET/docs/modernisation/` | <CasUsage page="modernisation/index.html#modernisation-—-vue-d-ensemble">tableau de bord</CasUsage> |
| Phase 4 | Wiki VitePress complet, chiffres calculés depuis `migration.data.ts` | `/mod-generate-docs all` | `WIKI_TARGET` | <CasUsage page="modernisation/index.html#resultats-verifies">résultats vérifiés</CasUsage> · <CasUsage page="docs/index.html#analyses-techniques">analyses du legacy</CasUsage> |

Comment l'équipe s'appuie sur ce wiki pour piloter la migration : [Le wiki, tableau de bord du pilotage](/guide/methodology#wiki-pilotage).

## Dimensionnement

| Composant | Quantité |
|-----------|----------|
| Agents | 11 (2 Opus + 7 Sonnet + 2 Haiku) |
| Skills | 12 (4 launchers + 6 passives + 2 internes Claude Code) |
| Rules | 7 (1 globale + 6 ciblées) |
| Commands | 8 (commit, install-stack, php-test, php-lint, front-test, front-lint, symfony-review, frontend-review) |
| Hooks / scripts | 1 hook (`block-rm.sh`, avec son test `block-rm.test.sh`) + 1 script (`install-stack.sh`) |
| Références | 41 fichiers `.md` dans les dossiers `references/` des skills (+ gabarits du wiki dans `mod-generate-docs/references/` : `wiki-src/`, `vitepress-config.ts`, `package.json`) |

## Invocation

Tout le workflow est déclenché par 4 slash commands :

```bash
# Phase 1 : analyser le legacy (enchaîne la phase 2)
/mod-analyze-legacy

# Phase 2 : relancer seules les visualisations (après un enrichissement de l'inventaire)
/mod-generate-visualization

# Phase 3 : migrer chaque feature
/mod-migrate-feature Search_Engine
/mod-migrate-feature User_Authentication
# ...

# Phase 4 : générer la documentation
/mod-generate-docs all
```

## Pages de détail

- [Structure du projet .claude/](/examples/project-structure) — Organisation complète des fichiers
- [Pipeline de migration](/examples/pipeline) — Détail de chaque étape
- [Stratégie de modèles](/examples/model-strategy) — Choix opus/sonnet/haiku
- [Contrôle qualité](/examples/quality-review) — Revue et conformité du code migré

---

*Vérifié avec **Claude Code v2.1.295** contre la documentation officielle le 10 octobre 2026. Une fonctionnalité plus récente peut manquer : voir le [journal des modifications](https://code.claude.com/docs/en/changelog).*
