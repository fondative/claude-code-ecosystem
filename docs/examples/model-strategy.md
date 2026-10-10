# Stratégie de modèles

Cette page justifie le modèle de chacun des 11 agents du projet. La stratégie générale (quel modèle pour quelle tâche, heuristique de décision, coûts) est décrite dans [Agents — Quel modèle choisir ?](/concepts/agents#quel-modele-choisir) ; la vue d'ensemble de la répartition dans [Méthodologie — Répartition des modèles](/guide/methodology#repartition-des-modeles).

## Justification par agent

Valeurs `model` et `maxTurns` relevées dans le frontmatter des fichiers `.claude/agents/*.md` du projet.

| Agent | `model` | `maxTurns` | Justification |
|-------|---------|------------|---------------|
| `legacy-technical-analyzer` | `opus` | 100 | Reverse engineering d'un code brut non documenté : déduire l'architecture, les flux et les patterns implicites |
| `legacy-functional-analyzer` | `sonnet` | 50 | Inventaire features / rôles / flux à partir du rapport technique déjà généré, pas du code brut |
| `legacy-functional-analyzer-auditor` | `haiku` | 35 | Comparaison d'un inventaire existant avec le legacy : vérification, pas création |
| `legacy-feature-analyzer` | `opus` | 50 | Spécification en 14 sections depuis du code non documenté : règles métier implicites, cas limites |
| `legacy-feature-analyzer-refiner` | `sonnet` | 35 | Enrichissement d'une spec existante, qui demande de comprendre le contexte métier et pas seulement de reformuler |
| `backend-tasks-planner` | `sonnet` | 35 | Décomposition structurée à partir de la spec : la spec Opus fournit le contexte |
| `frontend-tasks-planner` | `sonnet` | 35 | Décomposition à partir de la spec et du contrat OpenAPI défini côté backend |
| `backend-tasks-executor` | `sonnet` | 60 | TDD guidé par les références des skills (`create-entity.md`, `create-dto.md`…) : les patterns sont donnés ; `maxTurns` dimensionné pour un lot de 3 tâches (le launcher découpe) |
| `frontend-tasks-executor` | `sonnet` | 60 | TDD guidé par les skills frontend, y compris l'intégration conditionnelle du design Figma ; `maxTurns` dimensionné pour un lot de 3 tâches |
| `conformity-reporter` | `sonnet` | 45 | Évaluation avec une grille de déduction définie (skill `mod-conformity-conventions`) |
| `health-check` | `haiku` | 50 | Lecture de toute la configuration (11 agents, 12 skills, 7 rules, `settings.json`, script d'installation) et vérifications de cohérence, dont les chemins en dur |

Deux choix ne suivent pas l'intuition « plus c'est important, plus le modèle est gros » : `legacy-functional-analyzer` est sur Sonnet parce qu'il lit le rapport technique et non le code brut, et `legacy-feature-analyzer-refiner` est sur Sonnet plutôt que Haiku parce qu'un affinement doit enrichir la spec, pas seulement la reformuler. → [Méthodologie — Répartition des modèles](/guide/methodology#repartition-des-modeles)

::: info Convention de ce projet
`maxTurns` = budget estimé (fichiers lus + fichiers écrits + commandes) + 10 de marge, noté en commentaire YAML à côté de la valeur. Exemple, `backend-tasks-planner.md` :

```yaml
maxTurns: 35   # ~20 lus (CLAUDE.md, spec, index, OPENAPI_SPEC, references, docs techniques) + 1 ecrit (analyse, section OpenAPI incluse) + 10 = 31
```

Pour les executors, le calcul porte sur un lot : `3 x 12 + 4 fixes + 3 doc + 10 marge = 53`, arrondi à 60. Si un agent est coupé, le launcher le reprend (SendMessage) jusqu'à la fin du lot ; si cela se répète, il passe à des lots de 2 tâches plutôt que d'augmenter `maxTurns`. Voir [Agents, WARN-006](/concepts/agents#warn-006) et la skill `claude-code-parallel-agents`.
:::

---

*Vérifié avec **Claude Code v2.1.295** contre la documentation officielle le 10 octobre 2026. Une fonctionnalité plus récente peut manquer : voir le [journal des modifications](https://code.claude.com/docs/en/changelog).*
