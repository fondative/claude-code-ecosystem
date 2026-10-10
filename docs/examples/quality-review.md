# Contrôle qualité

::: tip Ce que vous trouverez sur cette page
Trois outils de contrôle coexistent dans le projet et ne répondent pas à la même question : **le code est-il juste ?** (`/code-review`), **respecte-t-il nos conventions ?** (`/review:symfony-review`, `/review:frontend-review`), **fait-il ce que dit la spec ?** (agent `conformity-reporter`). Cette page aide à choisir et donne les commandes prêtes à l'emploi. Le détail des options est dans la [documentation officielle](https://code.claude.com/docs/en/code-review).
:::

## En bref

| Outil | Question posée | Référence | Sortie | Modifie le code ? |
|---|---|---|---|---|
| `/code-review` (intégré, alias `/review`) | Ce diff contient-il des **bugs** ? | Le code lui-même | Liste de constats | Seulement avec `--fix` |
| `/review:symfony-review`, `/review:frontend-review` (projet) | Ce code respecte-t-il **nos conventions** ? | Skills de conventions `sym-*` / `front-*` (+ contrôles sécurité ou accessibilité, code mort), relues en contexte forké | Constats CRITIQUE → BAS + recommandation | Non |
| Agent `conformity-reporter` (projet) | L'implémentation est-elle **conforme à la spec** ? | Spec de la feature, analyses, conventions, sorties réelles des tests et linters | Rapport versionné (V1, puis `-V<N>`) avec score /100 | Non |

Outils intégrés complémentaires : `/simplify` (nettoyage, ne cherche pas les bugs), `/security-review` (vulnérabilités du diff de la branche), `/verify` et `/run` (vérifier dans l'application lancée). Voir [Skills intégrées](https://code.claude.com/docs/en/skills#bundled-skills).

### Quand lancer quoi ?

| Moment | Outil | Pourquoi à ce moment |
|---|---|---|
| Pendant l'implémentation, sur un diff local | `/code-review` | Rapide, ciblé sur le diff : corriger tant que le contexte est frais |
| Hors pipeline, avant `/dev:commit` ; dans le pipeline, sur les lots que `/mod-migrate-feature` a commités | `/review:symfony-review <chemin>` ou `/review:frontend-review <chemin>` | Les conventions se corrigent mieux avant qu'elles ne se propagent |
| Fin du pipeline d'une feature | `conformity-reporter` (étape 4 de `/mod-migrate-feature`) | Il faut le code complet, les tests et la spec pour scorer |
| Avant le merge | `/security-review` | Analyse le diff de la branche par rapport à `origin` |

## Justesse, conventions ou conformité ?

Les trois outils se ressemblent (« relire du code ») mais ne regardent pas la même chose :

- `/code-review` lit le **diff** et cherche ce qui est faux : condition inversée, cas `null` oublié, requête qui ne filtre pas. Il ne connaît pas la spec de la feature.
- `/review:symfony-review` applique **nos conventions** (skills `sym-api-conventions` et `sym-testing-conventions`, qui font foi) : flux Controller → Service → Repository, DTOs, PSR-12, UUID, `DateTimeImmutable`, tests AAA nommés `test{Action}With{Condition}()`, plus quelques contrôles de sécurité et de code mort. Il tourne en contexte neuf (`context: fork`) et ne modifie aucun fichier. Il ne cherche pas les bugs de logique.
- `conformity-reporter` compare l'implémentation à la **spec en 14 sections** (dont la fidélité au legacy : tout comportement qui diffère des sections 1 à 12 sans transposition ni écart `Corriger : …` arbitré est une issue) et aux analyses backend/frontend, **exécute** PHPUnit, phpcs, Vitest, ESLint et le typecheck, puis calcule un score pondéré.

Seul `conformity-reporter` note : ses issues Critical → Low entraînent des déductions (barème : [Méthodologie, étape 4](/guide/methodology#etape-4)) ; les constats CRITIQUE → BAS des `/review:*` ne donnent pas de score.

**La question à se poser :** *qu'est-ce qui serait grave si c'était raté ?*
- Un bug dans ce que je viens d'écrire → `/code-review`.
- Un écart à l'architecture ou aux standards du projet → `/review:symfony-review` ou `/review:frontend-review`.
- Une règle métier du legacy oubliée ou mal reproduite → `conformity-reporter`.

Pour une feature migrée, les trois s'enchaînent avant de la considérer comme terminée. Ailleurs dans le wiki :

- la grille de notation de `conformity-reporter` (déductions, pondération, seuil de 80/100) : [Méthodologie, étape 4](/guide/methodology#etape-4) ;
- la boucle qualité (une seule passe de correction, puis rapport V2) : [Méthodologie, étape 5](/guide/methodology#etape-5) ;
- la sur-correction d'un relecteur à qui l'on demande « ce qui manque » : [Agents, LLM-as-Judge](/concepts/agents#llm-as-judge-relecture-en-contexte-neuf) ;
- la notation `/review:symfony-review` (deux-points, pas barre oblique) : [Commands, WARN-008](/concepts/commands#warn-008).

::: warning Revue en CI : prévoir Docker
L'exemple de job de la [documentation GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd) utilise l'image `node:24-alpine3.21`, qui ne fournit pas Docker. Comme toutes les commandes backend du projet passent par `docker compose exec -T app …`, un job de revue qui doit exécuter les tests (cas de `conformity-reporter`) doit tourner sur un runner qui fournit Docker.
:::

## Erreurs fréquentes à éviter

#### ⚠️ `WARN-001` : Prendre un outil pour un autre {#warn-001}

*Origine : conception du pipeline de ce projet (trois contrôles aux références différentes).*

::: danger Problème
« `/code-review` n'a rien trouvé, la feature est bonne » ou « le score de conformité est à 92, il n'y a pas de bug ». Chaque outil est aveugle à ce que regardent les deux autres.
:::

::: info Solution
Choisir l'outil d'après la question (tableau [En bref](#en-bref)) et, pour une feature migrée, passer les trois.
:::

#### ⚠️ `WARN-002` : Juger les tests sans les exécuter {#warn-002}

*Origine : règle du projet (skill `mod-conformity-conventions`, règle 7 « Exécution réelle des tests »).*

::: danger Problème
Un relecteur qui lit les tests et conclut « ils passent » se trompe régulièrement : il infère au lieu de constater.
:::

::: info Solution
Lancer les outils et s'appuyer sur leur sortie, comme le fait `conformity-reporter` : `cd <BACKEND_TARGET> && docker compose exec -T app php bin/phpunit 2>&1` (sans `| cat`, qui masquerait le code de sortie), `… php vendor/bin/phpcs --standard=PSR12 src/`, `cd <FRONTEND_TARGET> && npm test -- --run --reporter=verbose`, `npm run lint`, `npm run typecheck`.

Critère de succès PHPUnit : celui de `/dev:php-test` (code retour 0 et au moins un test exécuté). Une dépréciation ou un avertissement fait échouer la suite ; « No tests executed! » ou un conteneur arrêté se rapportent comme « tests non exécutés », sans résultat inventé.
:::

## Exemples prêts à l'emploi

```text
# Bugs du diff courant, constats les plus sûrs, puis correction
/code-review high --fix

# Conventions backend sur un dossier précis (sans argument : `git diff HEAD`)
/review:symfony-review api-rest-symfony-target/src/Service/

# Conventions frontend
/review:frontend-review app-react-target/src/

# Rapport de conformité d'une feature (lancé normalement par /mod-migrate-feature)
Utilise l'agent conformity-reporter avec le prompt « Feature : User_Authentication »
```

## Pour aller plus loin

- [Méthodologie](/guide/methodology) — pipeline, grille de conformité et boucle qualité du projet
- [Agents](/concepts/agents) — pattern LLM-as-Judge et sur-correction
- [Commands](/concepts/commands) — nommage `/review:…`
- Documentation officielle : [Code Review](https://code.claude.com/docs/en/code-review) · [Ultrareview](https://code.claude.com/docs/en/ultrareview) · [Skills intégrées](https://code.claude.com/docs/en/skills#bundled-skills) · [GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd)

---

*Vérifié avec **Claude Code v2.1.295** contre la documentation officielle le 10 octobre 2026. Une fonctionnalité plus récente peut manquer : voir le [journal des modifications](https://code.claude.com/docs/en/changelog).*
