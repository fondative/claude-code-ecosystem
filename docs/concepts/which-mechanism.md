# L'essentiel : quelle brique pour quel besoin ?

::: tip Ce que vous trouverez sur cette page
Les huit hésitations les plus courantes quand on configure Claude Code. Pour chacune : ce que font les deux options, la question à se poser, la réponse, et **le choix fait dans le projet de modernisation** (encadré « Chez nous »). Le détail de chaque brique est dans sa page Concept.
:::

## Consigne ou blocage ?

- Une **consigne** (CLAUDE.md, [rule](/reference/glossary#rule), [skill](/reference/glossary#skill)) *demande* à Claude de faire ou d'éviter quelque chose. Il obéit presque toujours, mais rien ne l'y oblige.
- Un **blocage** ([règle `deny`](/reference/glossary#regles-de-permission) dans les settings, [hook](/reference/glossary#hook)) est appliqué par Claude Code lui-même : l'action est refusée avant d'avoir lieu, quoi que Claude décide.

**La question à se poser :** *si Claude ne respecte pas la règle une seule fois, est-ce grave ?*
- Non → une consigne suffit.
- Oui → il faut un blocage :
  - la règle porte toujours sur le même dossier ou la même commande → règle **`deny`** dans `settings.json` ;
  - la décision dépend du contenu (une commande qui contient un mot de passe, par exemple) → **hook `PreToolUse`**.

::: info Chez nous
Le dossier `php-legacy/` ne doit **jamais** être modifié. Le projet utilise donc les deux :
- la rule `legacy-readonly` **explique** à Claude pourquoi ce code est en lecture seule (consigne) ;
- la règle `deny Edit(/php-legacy/**)` de `settings.json` l'**empêche** réellement de le modifier (blocage).

Une rule seule ne suffirait pas : voir [Rules — WARN-002](/concepts/rules#warn-002).
:::

## CLAUDE.md, rule ou skill ?

Les trois contiennent des instructions ; ce qui change, c'est **quand** Claude les lit.

**La question à se poser :** *quand cette information est-elle utile ?*
- À **chaque** session → **CLAUDE.md** (moins de 200 lignes).
- Seulement quand Claude touche **certains fichiers** → **rule** avec `paths`.
- **De temps en temps**, ou c'est une procédure à suivre → **skill**.

::: info Chez nous
- Les **chemins du projet** sont dans CLAUDE.md : tous les agents en ont besoin.
- Le rappel **« TDD obligatoire (tests avant le code) »** est dans la rule `symfony-api` : il ne sert que quand Claude travaille dans `api-rest-symfony-target/`.
- Les **15 fichiers de conventions Symfony** sont dans la skill `sym-api-conventions` : ils ne sont lus que quand on écrit du code backend.
:::

## Skill ou agent ?

- Une **skill** ajoute des instructions **dans la conversation en cours**.
- Un **[agent](/reference/glossary#agent)** travaille **dans son propre contexte**, à part, et ne renvoie qu'un résumé.

**La question à se poser :** *la tâche va-t-elle lire beaucoup de fichiers ou produire beaucoup de résultats ?*
- Oui → **agent** : la conversation principale reste lisible.
- Non → **skill**.

::: info Chez nous
Les deux se combinent. Les conventions sont des **skills**, et elles sont **préchargées** dans les **agents** qui en ont besoin (champ `skills:` de l'agent). Par exemple, l'agent `backend-tasks-executor` démarre avec `sym-api-conventions` et `sym-testing-conventions` déjà chargées.
:::

## Hook ou skill ?

- Un **hook** est un script que **Claude Code lance lui-même**, automatiquement, à un moment précis (par exemple juste après chaque modification de fichier). Claude n'a pas à y penser et ne peut pas l'oublier, comme un détecteur de fumée.
- Une **skill** est une **fiche de procédure** que Claude lit puis applique. Il peut l'adapter à la situation, mais aussi sauter une étape ou l'oublier.

**Même besoin, traité des deux façons :** « après chaque modification d'un fichier PHP, le reformater selon la norme PSR-12 ».

| | Avec un hook | Avec une skill |
|---|---|---|
| Comment | Claude Code lance `phpcbf` juste après chaque modification d'un `.php` | La skill dit à Claude : « après avoir modifié du PHP, lance `phpcbf` » |
| Si Claude oublie ? | Impossible : ce n'est pas Claude qui le lance | Possible : le fichier reste mal formaté |
| Bon choix ? | ✅ C'est toujours la même commande | ❌ |

À l'inverse, « corriger un test qui échoue » demande de lire l'erreur, d'en comprendre la cause et de choisir quoi modifier : un script ne peut pas le faire, c'est une **skill**.

**La question à se poser :** *la tâche est-elle toujours identique (une commande fixe), ou faut-il réfléchir selon la situation ?*
- Toujours identique (formater, bloquer une commande, écrire dans un journal) → **hook**.
- Il faut réfléchir ou s'adapter → **skill**.

::: info Chez nous
Le projet n'a **qu'un hook** : `block-rm.sh` (`PreToolUse` sur `Bash`), qui refuse les suppressions récursives. Le candidat suivant est justement l'exemple ci-dessus : le formatage PSR-12, lancé **à la main** avec `/dev:php-lint`. Avec un hook, il serait fait à chaque modification, sans y penser. → Exemple prêt à l'emploi : [Hooks — exemples](/concepts/hooks#exemples-prets-a-l-emploi).
:::

## MCP ou ligne de commande ?

- Un **serveur [MCP](/reference/glossary#mcp)** ajoute à Claude des outils pour un service externe (base de données, GitHub, Slack…).
- La **ligne de commande** (`git`, `docker`, `psql`, `kubectl`…) est déjà utilisable par Claude via l'outil Bash.

**La question à se poser :** *existe-t-il déjà un outil en ligne de commande pour ce service ?*
- Oui → utiliser la **ligne de commande** : elle coûte moins de contexte.
- Non, ou le service demande une authentification [OAuth](/reference/glossary#oauth) que la ligne de commande ne gère pas → **MCP**.

::: info Chez nous
Aucun serveur MCP. Tout passe par la ligne de commande, en particulier `docker compose exec -T app …` pour le backend.
:::

## Agent ou workflow ? {#agent-ou-workflow}

- Avec des **agents**, Claude décide lui-même, étape par étape, quel agent lancer ensuite.
- Un **[workflow](https://code.claude.com/docs/en/workflows)** est un script qui lance et coordonne de nombreux agents de façon prévisible.

| | Agents pilotés par Claude ([skill de lancement](/reference/glossary#skill-launcher)) | Workflow |
|---|---|---|
| Qui décide de l'étape suivante | Claude, tour par tour | Le script |
| Échelle visée | Quelques agents par tour | Des dizaines à des centaines d'agents |
| Intervention humaine en cours de route | Possible | **Impossible** pendant une exécution |
| Reprise après interruption | Relancer (checkpoints à prévoir) | Les agents terminés renvoient leur résultat en cache |

**La question à se poser :** *combien d'agents, faut-il recouper leurs résultats, et un humain doit-il trancher en cours de route ?*
- Quelques agents, ou un humain doit pouvoir trancher entre deux étapes → Claude les pilote, depuis une skill.
- Des dizaines d'agents, ou des résultats à vérifier les uns par les autres, sans décision humaine pendant l'exécution → **workflow**.
- Un workflow coûte nettement plus de tokens qu'une conversation : l'essayer d'abord sur une tranche (deux ou trois éléments) avant tout le périmètre.
- À la relance d'une exécution arrêtée, un agent en échec est relancé avec tous ceux démarrés après lui : chaque agent doit être rejouable (il écrit ou réécrit son propre fichier, jamais d'ajout).

::: info Chez nous
L'analyse des features du legacy en parallèle (13 agents `legacy-feature-analyzer` simultanés, d'après le retour d'expérience consigné dans la skill `claude-code-parallel-agents`) tient en agents lancés par une skill. Au-delà, un workflow deviendrait utile. `/mod-migrate-feature` reste une skill, car elle s'arrête plusieurs fois pour une décision humaine : voir [Le pilotage humain](/guide/methodology#le-pilotage-humain). Le piège à éviter quand on lance des agents en parallèle : [Agents — WARN-005](/concepts/agents#warn-005).
:::

## Quel mode de permission, à quelle étape ? {#quel-mode-de-permission-a-quelle-etape}

Le **[mode de permission](/reference/glossary#modes-de-permission)** règle ce que Claude peut faire sans vous demander : tout demander (`default`), accepter les modifications de fichiers (`acceptEdits`), seulement lire et proposer (`plan`), laisser un classifieur juger (`auto`), refuser tout ce qui n'est pas autorisé (`dontAsk`)… Le détail des modes : [documentation officielle](https://code.claude.com/docs/en/permission-modes).

**La question à se poser :** *à cette étape, Claude doit-il écrire, et où ?*
- Il ne doit rien écrire → `plan` ([plan mode](/reference/glossary#plan-mode)).
- Il écrit seulement dans des dossiers prévus (par exemple `output/`) → `default`, avec une règle `allow` sur ces dossiers.
- Il modifie beaucoup de code que vous relirez ensuite → `acceptEdits`.
- Personne n'est là pour répondre (CI, tâche planifiée) → `dontAsk`, avec une liste `allow` précise.
- Un agent **en arrière-plan** demande une permission → l'accorder « pour le reste de la session » l'accorde à **toute la session**, conversation principale comprise ([documentation officielle](https://code.claude.com/docs/en/sub-agents#run-subagents-in-foreground-or-background)).
- Pour refuser sans tout arrêter → `Esc` refuse cet appel sans arrêter l'agent ; ne donner une autorisation durable que si vous l'auriez mise dans `settings.json`.

::: info Chez nous
Le choix est inscrit dans le [frontmatter](/reference/glossary#frontmatter) de chaque agent (`permissionMode`) :

| Étape | Agents | Mode | Pourquoi |
|---|---|---|---|
| Analyse, spécification, planification | `legacy-*`, `*-planner` | `default` | Ils n'écrivent que dans `output/`, déjà autorisé |
| Implémentation | `backend-tasks-executor`, `frontend-tasks-executor` | `acceptEdits` | Beaucoup de modifications, relues ensuite par la revue et la conformité |
| Conformité | `conformity-reporter` | `default` | Un seul rapport dans `output/reports/` |
| Diagnostic | `health-check` | `plan` | Il vérifie, il ne corrige pas |

Attention : si la session principale tourne en `auto`, `acceptEdits` ou `bypassPermissions` (mode qui saute toutes les demandes de permission), **tous** les agents prennent ce mode et leur `permissionMode` est ignoré. Le risque reste limité ici, car le legacy et les `.env` sont protégés par des `deny`, valables quel que soit le mode. Le `deny Bash(rm -rf *)`, lui, ne bloque que cette forme exacte : `rm -fr` ou `rm -r -f` sont arrêtés par le hook `block-rm.sh`, garde-fou qui ne voit pas tout (un script Python, par exemple) (voir [Hooks — couches de sécurité](/concepts/hooks#couches-de-securite)).
:::

## Annuler une erreur : `/rewind` ou git ? {#annuler-une-erreur-rewind-ou-git}

- **`/rewind`** (ou `Esc Esc`) revient à l'état d'avant un de vos messages, en un geste. Mais il n'annule que ce que Claude a modifié **avec ses outils d'édition**, dans **cette** session.
- **git** annule tout, quelle que soit l'origine de la modification, et dure au-delà de la session.

**La question à se poser :** *qui a fait la modification ?*
- Claude, avec ses outils d'édition, directement dans la conversation → **`/rewind`** suffit.
- Une **commande** (Docker, npm, un générateur) ou un **agent** → **git** : `/rewind` ne la voit pas.
- C'est un état qui fonctionne et que vous voulez garder → **commit**.

::: info Chez nous
L'essentiel du code de la migration est écrit par les agents **[executors](/reference/glossary#executor)** et par des commandes `docker compose exec` (générateurs Symfony, `phpcbf`). **Ni l'un ni l'autre n'est annulé par `/rewind`.** Exemple : Claude lance `make:migration` via Docker, puis vous faites `Esc Esc` → la migration générée est toujours là. Dans ce projet, **le vrai filet de sécurité est git** : commitez chaque état qui fonctionne.
:::

## Pour aller plus loin

- [Philosophie & Vision](/introduction/) — les trois familles (contexte, contrôle, extension) et les règles de priorité
- [Catalogue des pièges](/guide/warns) — les erreurs fréquentes de toutes les briques, par gravité
- [Structure du projet .claude/](/examples/project-structure) — la configuration du projet fichier par fichier

---

*Vérifié avec **Claude Code v2.1.295** contre la documentation officielle le 10 octobre 2026. Une fonctionnalité plus récente peut manquer : voir le [journal des modifications](https://code.claude.com/docs/en/changelog).*
