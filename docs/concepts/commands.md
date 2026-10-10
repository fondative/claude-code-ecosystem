# Commands

## En bref

| Aspect | Détail |
|--------|--------|
| **Quoi** | Actions invocables par l'utilisateur via `/nom` |
| **Où** | `.claude/commands/` (projet) ou `~/.claude/commands/` (personnel) |
| **Statut** | Fusionné avec les [skills](/concepts/skills) — les commands continuent de fonctionner, les skills sont recommandées pour les nouveaux workflows |
| **Priorité** | Un command et un skill avec le même nom → le skill gagne |
| **Namespace** | Sous-dossier → préfixe avec `:` (`.claude/commands/dev/commit.md` → `/dev:commit`) |
| **Arguments** | Via `$ARGUMENTS`, `$0`, `$1`, `$nom`, `${CLAUDE_SESSION_ID}`, `${CLAUDE_SKILL_DIR}`… |
| **Ce que cette page apporte** | Quand garder un command ou passer en skill, comment migrer, et les écarts relevés dans les commands du projet |

---

## L'essentiel en 2 minutes

Un command (ou slash command) est un **fichier Markdown unique** dans `.claude/commands/` qui définit une action invocable via `/nom`. Depuis la fusion avec les skills, il accepte **le même [frontmatter](/reference/glossary#frontmatter)** qu'une skill, sauf `name` et `paths` ; il ne peut pas avoir de fichiers de support. Les skills sont recommandées pour les nouveaux workflows.

```
┌────────────────────────────────────────┐
│  Utilisateur tape : /dev:commit        │
│         │                              │
│         ▼                              │
│  Claude charge :                       │
│  .claude/commands/dev/commit.md        │
│         │                              │
│         ▼                              │
│  Exécute les instructions :            │
│  1. git diff --staged                  │
│  2. Déterminer type/scope              │
│  3. Rédiger le message                 │
│  4. Valider avec l'utilisateur         │
│     → commiter                         │
└────────────────────────────────────────┘
```

```markdown
<!-- .claude/commands/dev/php-test.md  →  /dev:php-test unit -->
---
description: Lancer les tests backend via Docker Compose
argument-hint: "[unit|integration|functional|path]"
---
Lancer `docker compose exec -T app php bin/phpunit $ARGUMENTS 2>&1`
```

::: info Convention de ce projet : `/dev/commit` → `/dev:commit`
<span class="chez-nous">Chez nous</span> le `CLAUDE.md` et les rules écrivent `/dev:commit`, `/dev:php-test`, `/review:symfony-review`… : un fichier `.claude/commands/dev/commit.md` s'invoque avec **`/dev:commit`**. La notation `/dev/commit` est l'ancienne forme, qui ne correspond à aucune invocation. Cette page utilise la notation réelle.
:::

Quatre faits changent la façon de concevoir un command :

1. **Le nom vient toujours du chemin** : chaque sous-dossier devient un préfixe suivi de `:`, et un champ `name:` est ignoré.
2. **Une skill du même nom gagne, sans avertissement** : le command n'est plus exécuté.
3. **Claude peut lancer un command comme une skill**, sauf avec `disable-model-invocation: true` — qui bloque aussi son exécution par une tâche planifiée (`/loop`, `/schedule`). Où le mettre et où l'éviter : [WARN-007](#warn-007).
4. **Un seul fichier, pas de support** : dès qu'il faut des `references/`, des scripts ou un nom libre, c'est une skill.

→ Tout le fonctionnement (équivalence avec les skills, scopes, namespaces, injection dynamique) : [documentation officielle — Skills](https://code.claude.com/docs/en/skills) · tous les champs : [Skills — frontmatter](https://code.claude.com/docs/en/skills#frontmatter-reference).

---

## Quand utiliser un command vs un skill ?

```
Besoin de fichiers de support (references, scripts) ?
├── OUI → SKILL (seul format qui le supporte)
└── NON
    Besoin d'un nom libre (champ name) ou d'un déclenchement par paths ?
    ├── OUI → SKILL
    └── NON
        Command existant et fonctionnel ?
        ├── OUI → Garder le command (pas de migration urgente)
        └── NON → Créer une SKILL (format moderne)
```

Format recommandé : [Skills](/concepts/skills).

### Quand migrer vers skill

Migrer un command vers un skill quand :
- Besoin de fichiers de référence
- Besoin de scripts exécutables
- Besoin de `context: fork` (exécution isolée)
- Besoin d'un nom indépendant du chemin (`name`) ou d'une activation liée à des fichiers (`paths`)
- Création d'un nouveau workflow

::: tip Migrer de `commands/` vers `skills/`
La migration est mécanique : `.claude/commands/dev/commit.md` devient `.claude/skills/<nom>/SKILL.md`, et le frontmatter est conservé, **sauf `name:` à retirer** : dans une skill ce champ est pris en compte, et `name: commit` exposerait `/commit`. Attention au **nom d'invocation** : une skill prend le nom de son dossier (ou de son champ `name`), donc `/dev:commit` deviendra `/dev-commit` (dossier `skills/dev-commit/`) — penser à mettre à jour CLAUDE.md et les rules qui le citent. Avant/après : [exemple 1](#exemple-1-dev-commit) ; stratégie et étapes retenues pour le projet : [Commands du projet](/examples/project-structure#commands-du-projet).
:::

---

## Bien concevoir ses commands

### Injection dynamique `` !`…` `` {#injection-dynamique}

Une ligne `` !`commande` `` dans le corps d'un command (ou d'une skill) est une [injection dynamique](/reference/glossary#injection-dynamique) : Claude Code exécute la commande **avant** d'envoyer le texte au modèle et remplace la ligne par sa sortie. Claude reçoit donc le résultat, pas la commande.

```markdown
## Contexte
- Branche : !`git branch --show-current`
- Fichiers modifiés : !`git status --short`
```

La commande s'exécute avec vos droits, au moment de l'invocation. Le réglage `disableSkillShellExecution` (posé de préférence dans les [managed settings](/reference/glossary#managed), que l'utilisateur ne peut pas contourner) désactive cette exécution : chaque commande est alors remplacée par `[shell command execution disabled by policy]`.

### La configuration réelle du projet

::: info Chez nous
Les 8 commands du projet sont dans `.claude/commands/dev/` (6) et `.claude/commands/review/` (2). Par exemple :

| Fichier | Invocation réelle | Notation du CLAUDE.md | `name:` (ignoré) | `disable-model-invocation` |
|---------|-------------------|-----------------------|------------------|----------------------------|
| `dev/commit.md` | `/dev:commit` | `/dev:commit` | absent | `true` |
| `dev/php-test.md` | `/dev:php-test` | `/dev:php-test` | absent | absent |

La liste complète et la migration retenue pour ces fichiers : [Commands du projet](/examples/project-structure#commands-du-projet).

Ce qu'il faut y lire : les 8 fichiers font 66 à 85 lignes et suivent le même gabarit ; seul `commit` utilise `allowed-tools` et l'injection `` !`…` ``, les deux reviews sont en `context: fork` ; **aucun** ne déclare `name:`, et seuls `commit` et `install-stack` réservent l'invocation à l'utilisateur, les tests et les lints restant lançables par Claude (voir [WARN-006](#warn-006) et [WARN-007](#warn-007)).
:::

### Pièges à connaître

- **`name:` est ignoré dans un command** : le nom vient du chemin du fichier. Pour choisir librement le nom, passer en skill.
- **`/dossier/fichier` n'est pas la syntaxe d'invocation** : c'est `/dossier:fichier`.
- **Même nom qu'une skill = command ignoré**, sans avertissement. Même nom qu'une skill intégrée = la vôtre la remplace, mais pas ses alias (`/review` lance toujours la version intégrée).
- **`allowed-tools` pré-approuve, il ne restreint pas** ; les autres outils restent disponibles selon vos permissions.
- **`disable-model-invocation: true` sur une vérification** (tests, lint) : voir [WARN-007](#warn-007).
- **L'injection `` !`…` `` peut être coupée** par `disableSkillShellExecution` (voir [Injection dynamique](#injection-dynamique)) : un command qui en dépend doit fonctionner sans, ou le signaler.

Détails et sources : [documentation officielle — Skills](https://code.claude.com/docs/en/skills).

### Erreurs fréquentes à éviter

→ Les pièges de toutes les briques, classés par gravité : [Catalogue des pièges](/guide/warns).

#### `WARN-001` : Command et Skill avec le même nom {#warn-001 .warn-title}
*Origine : documentation officielle.*

Avoir un command et un skill portant le même nom crée un conflit silencieux : le skill gagne toujours.

::: danger Problème
```text
# ❌ — Conflit de noms
.claude/commands/review.md
.claude/skills/review/SKILL.md
# → Le skill a priorité, le command est ignoré
```
Le command est ignoré sans aucun avertissement.
:::

::: info Solution
Choisir l'un ou l'autre, pas les deux. Si les deux existent, supprimer le command ou le renommer.
:::

---

#### `WARN-002` : Oubli des flags Docker (convention de ce projet) {#warn-002 .warn-title}
*Origine : règle du projet (CLAUDE.md : « Toutes les commandes backend via Docker Compose »).*

Quand les commandes passent par `docker compose exec`, l'absence de `-T` fait demander un TTY à Docker, ce qui bloque ou altère la sortie dans un contexte non interactif comme celui de Claude.

::: danger Problème
```bash
# ❌ — Allocation d'un TTY
docker compose exec app php bin/phpunit
```
Le TTY interactif bloque ou tronque la sortie.
:::

::: info Solution
```bash
# ✅ — Pas de TTY, stderr visible, code de sortie conservé
docker compose exec -T app php bin/phpunit 2>&1
```
`-T` évite l'allocation d'un TTY ; `2>&1` renvoie stderr dans la sortie pour que Claude voie les erreurs.
:::

::: info Chez nous
Le `CLAUDE.md` du projet impose la forme `cd <BACKEND_TARGET> && docker compose exec -T app <commande> 2>&1`, **sans `| cat`** : un tube renvoie le code de sortie de sa dernière commande, ici `cat` (0), ce qui **masquerait l'échec** de la commande Docker. Les commands `php-test`, `php-lint`, `front-test` et `front-lint` répètent la consigne (« Ne pas ajouter `| cat` »).
:::

---

#### `WARN-003` : Command sans description {#warn-003 .warn-title}
*Origine : documentation officielle (la description sert au menu `/` et au choix par Claude).*

Un command sans description n'apparaît pas correctement dans l'autocomplétion et Claude ne sait pas quand l'utiliser.

::: danger Problème
```yaml
# ❌ — L'autocomplétion ne montre rien d'utile
---
argument-hint: "[suite]"
---
```
L'utilisateur ne sait pas ce que fait ce command sans ouvrir le fichier.
:::

::: info Solution
```yaml
# ✅ — Description claire
---
description: Lancer les tests backend via Docker Compose
argument-hint: "[unit|integration|functional]"
---
```
La description guide l'autocomplétion et la délégation automatique.
:::

---

#### `WARN-004` : Logique trop complexe {#warn-004 .warn-title}
*Origine : bonne pratique générale.*

Un command avec du branching, des conditions et des centaines de lignes devient ingérable et difficile à maintenir.

::: danger Problème
```markdown
<!-- ❌ .claude/commands/deploy.md — toutes les branches dans un seul fichier -->
---
description: Déploie l'application
argument-hint: "[staging|prod|rollback]"
---
Si $0 = staging : construire l'image, la pousser sur le registre de test, redémarrer...
Sinon si $0 = prod : vérifier que la branche est main, sauvegarder la base,
  lancer les migrations ; si elles échouent, restaurer la sauvegarde, sauf si...
Sinon si $0 = rollback : retrouver l'image précédente, ...
(+ 180 lignes de cas particuliers)
```
La complexité croissante rend le command fragile et difficile à déboguer.
:::

::: info Solution
```text
# ✅ — Une skill : étapes communes dans SKILL.md, détail par cas chargé à la demande
.claude/skills/deploy/
├── SKILL.md            # étapes communes + « lire references/$0.md »
├── references/
│   ├── staging.md
│   ├── prod.md         # sauvegarde, migrations, restauration
│   └── rollback.md
└── scripts/
    └── check-branch.sh
```
Un command = un fichier unique. Si la logique déborde, c'est un skill.
:::

---

#### `WARN-005` : Dépendances cachées {#warn-005 .warn-title}
*Origine : bonne pratique générale.*

Un command qui requiert des outils externes sans le documenter échoue silencieusement selon l'environnement.

::: danger Problème
```yaml
# ❌ — Nécessite gh CLI + Docker mais ne le dit pas
---
description: Déployer
---
```
L'utilisateur découvre les dépendances manquantes à l'exécution.
:::

::: info Solution
```markdown
<!-- ✅ — Prérequis déclarés ET vérifiés dans le corps -->
---
description: Déploie l'application via Docker
compatibility: Nécessite gh CLI et Docker
---
## Prérequis
- gh : !`command -v gh || echo ABSENT`
- Docker : !`docker compose version 2>&1 | head -1`
Si un outil est ABSENT ou en erreur : STOP, expliquer comment l'installer.
```
La `description` sert au choix de la commande : on y dit ce qu'elle fait, pas ses dépendances. `compatibility` documente les prérequis, et le corps les **vérifie** avant d'agir.
:::

---

#### `WARN-006` : `name:` dans un command {#warn-006 .warn-title}
*Origine : vécu sur ce projet (les 8 commands ont déclaré `name:` ; forme corrigée : sans `name:`).*

Le champ laisse croire que le nom de la commande est choisi dans le frontmatter. Il ne l'est pas : seul le chemin compte.

::: danger Problème
```yaml
# ❌ — .claude/commands/dev/commit.md
---
name: commit          # ignoré : la commande s'appelle /dev:commit, pas /commit
description: Commit les changements en suivant Conventional Commits
---
```
:::

::: info Solution
```yaml
# ✅ — Pas de name dans un command
---
description: Commit les changements en suivant Conventional Commits
---
```
Pour un nom indépendant du chemin, migrer en skill (`.claude/skills/dev-commit/SKILL.md` → `/dev-commit`, voir l'[exemple 1](#exemple-1-dev-commit)).
:::

---

#### `WARN-007` : Vérifications réservées à l'utilisateur {#warn-007 .warn-title}
*Origine : vécu sur ce projet (`php-test`, `php-lint`, `front-test`, `front-lint` ont été en `disable-model-invocation: true` ; forme corrigée : sans ce champ).*

Une commande de tests ou de lint en invocation manuelle uniquement prive Claude du moyen de vérifier son propre travail, et ne peut pas être lancée par une tâche planifiée (`/loop`, `/schedule`). Anthropic recommande au contraire de donner à Claude une vérification qu'il peut lancer lui-même (« Give Claude a check it can run: tests, a build… », [Best practices](https://code.claude.com/docs/en/best-practices#give-claude-a-way-to-verify-its-work)).

::: danger Problème
```yaml
# ❌ — .claude/commands/dev/php-test.md
---
description: Lancer les tests backend via Docker Compose
disable-model-invocation: true   # Claude ne peut pas lancer les tests ; /loop non plus
---
```
:::

::: info Solution
```yaml
# ✅ — Vérification sans effet de bord : Claude peut la lancer
---
description: Lancer les tests backend via Docker Compose
argument-hint: "[unit|integration|functional|path]"
---
```
Sans `disable-model-invocation`, Claude peut lancer les tests et itérer jusqu'au vert. Garder `disable-model-invocation: true` pour les commandes à effet de bord (`commit`, `install-stack`).
:::

---

#### `WARN-008` : Documenter une invocation qui n'existe pas {#warn-008 .warn-title}
*Origine : vécu sur ce projet (CLAUDE.md, rule `git` et `commit.md` ont écrit `/dev/commit` ; forme corrigée : `/dev:commit`).*

La consigne « TOUJOURS utiliser `/dev/commit` » renvoie à un nom que Claude Code n'expose pas : dans le menu `/` comme pour Claude, la commande s'appelle `/dev:commit`.

::: danger Problème
```markdown
<!-- ❌ CLAUDE.md / .claude/rules/git.md -->
Pour tout commit : TOUJOURS utiliser la commande `/dev/commit`.
```
:::

::: info Solution
```markdown
<!-- ✅ La notation réelle : dossier, deux-points, fichier -->
Pour tout commit : TOUJOURS utiliser la commande `/dev:commit`.
```
Après tout déplacement ou migration d'un command, chercher son ancien nom dans CLAUDE.md, les rules et les autres commands.
:::

---

## Exemples prêts à l'emploi

<span class="chez-nous">Chez nous</span> les exemples 2 et 3 reprennent (abrégés) les fichiers du projet, sans champ `name` : il serait **ignoré** pour un command (le nom vient du chemin). L'exemple 1 est une version améliorée de `/dev:commit`.

### Exemple 1 : /dev:commit

```markdown
---
description: Crée un commit Conventional Commits à partir des changements en cours
disable-model-invocation: true
argument-hint: "[message]"
allowed-tools: Bash(git add *), Bash(git status *), Bash(git commit *)
---

## Contexte
- Statut : !`git status`
- Diff (indexé et non indexé) : !`git diff HEAD`
- Branche : !`git branch --show-current`
- Derniers commits : !`git log --oneline -10`

## Tâche
1. Déterminer le type (feat, fix, refactor, docs, test, chore...) et le scope
2. Rédiger `type(scope): description` (le pourquoi, pas le quoi), en tenant compte de $ARGUMENTS
3. Proposer le message et ATTENDRE la validation avant `git commit`
4. Ajouter la ligne d'attribution fournie par Claude Code (ne pas coder le nom du modèle en dur)

⚠️ Si un hook pre-commit échoue → corriger → NOUVEAU commit (PAS amend)
```

::: tip Modèle de référence : `commit-commands`
Cette version suit la commande `commit` du plugin [`commit-commands`](https://github.com/anthropics/claude-code/blob/main/plugins/commit-commands/commands/commit.md) d'Anthropic : le contexte (`git status`, `git diff HEAD`, branche, derniers commits) est **injecté** avant l'envoi au modèle, ce qui évite à Claude des allers-retours, et `allowed-tools` pré-approuve les seules commandes git nécessaires. Un nom de modèle codé en dur (`Claude Opus 5.5`) devient faux au prochain changement de modèle.
:::

**La même commande migrée en skill.** Le fichier est déplacé (`git mv .claude/commands/dev/commit.md .claude/skills/dev-commit/SKILL.md`) et s'invoque désormais `/dev-commit` ; le frontmatter ci-dessus reste valable tel quel. La skill peut en plus porter des fichiers annexes, chargés à la demande :

```
.claude/skills/dev-commit/
├── SKILL.md
└── types.md        # feat, fix, refactor, test, docs, chore, style, perf + exemples
```

| Changement | Raison |
|---|---|
| Pas de champ `name` | Le dossier `dev-commit` donne déjà le nom ; `name: commit` exposerait `/commit` (désormais pris en compte dans une skill) |
| Liste des types → `types.md` | `SKILL.md` plus court, détail chargé à la demande (« Choisir type et scope selon `[types.md](types.md)` ») |
| Exemples internes mis à jour | `/dev:commit` → `/dev-commit` dans le corps du fichier |

### Exemple 2 : /dev:php-test

```markdown
---
description: Lance les tests backend PHPUnit via Docker Compose. Utiliser apres toute modification du code backend pour verifier que les tests passent.
argument-hint: "[unit|integration|functional|path]"
---

# Tests PHP

Commande : `cd <BACKEND_TARGET> && docker compose exec -T app php bin/phpunit 2>&1`

## Arguments
- (vide) : tous les tests
- `unit` : `--testsuite=unit`
- `integration` : `--testsuite=integration`
- `functional` : `--testsuite=functional`
- chemin : fichier de test spécifique
```

::: info Convention de ce projet
La commande suit la forme du CLAUDE.md, sans `| cat` qui masquerait le code de sortie de PHPUnit (voir [WARN-002](#warn-002)), et ne déclare pas `disable-model-invocation` : Claude peut lancer les tests lui-même (voir [WARN-007](#warn-007)). Le réglage est réservé à `commit` et `install-stack`.
:::

### Exemple 3 : /review:symfony-review

```markdown
---
description: Review du code backend Symfony contre les conventions sym-*. Utiliser quand l'utilisateur demande une review backend ou avant de proposer un commit backend important.
argument-hint: "[path]"
context: fork
agent: general-purpose
background: false
---

# Code Review Symfony

## Process
1. **Conventions** : charger les skills `sym-api-conventions` et `sym-testing-conventions` (elles font foi)
2. **Scope** : `$ARGUMENTS`, sinon `git diff HEAD`
3. **En plus** : sécurité (requêtes préparées, validation via DTOs, autorisations JWT), pas de logique métier dans les controllers, pas de code mort

## Sévérités
- CRITIQUE, ÉLEVÉ, MOYEN, BAS (en citant la convention ou le point de sécurité enfreint)

## Verdict
APPROUVÉ | CORRECTIONS REQUISES | REFONTE REQUISE
```

::: tip Pourquoi `context: fork` pour une review
Un reviewer dans un contexte neuf ne voit que le code et les critères, pas le raisonnement qui a produit le changement : il juge le résultat sur pièces. Voir [Add an adversarial review step](https://code.claude.com/docs/en/best-practices#add-an-adversarial-review-step).
:::

### Exemple 4 : Injection dynamique

Un command accepte les mêmes champs qu'une skill (`context: fork`, `agent`, `allowed-tools`) et la même injection `` !`…` `` : voir l'[exemple 3 de la page Skills](/concepts/skills#exemple-3-skill-avec-injection-dynamique), qui résume une PR à partir de `gh pr diff`. Sans `allowed-tools: Bash(gh *)`, les appels `gh` que Claude lance ensuite déclenchent une demande de permission.

---

## Avant de mettre en service

### Contenu

- [ ] Un fichier = une action (extraire la logique complexe en skill)
- [ ] `description` claire et `argument-hint` si arguments
- [ ] Prérequis déclarés (`compatibility`) et **vérifiés dans le corps**, pas dans la description
- [ ] Contexte utile injecté (`` !`git status` ``…) et commandes nécessaires dans `allowed-tools`
- [ ] Pas de champ `name:` (ignoré dans un command)

### Invocation

- [ ] `disable-model-invocation: true` pour les commandes à effet de bord (commit, deploy), pas pour les vérifications (tests, lint)
- [ ] Reviews en `context: fork`
- [ ] Pas de conflit de nom avec un skill existant (ni avec une skill intégrée, sauf remplacement voulu)
- [ ] Invocation documentée avec la notation réelle (`/dossier:command`) dans CLAUDE.md, les rules et les autres commands

### Organisation

- [ ] Sous-dossiers sémantiques (`dev/`, `review/`, `deploy/`) → namespaces `dev:`, `review:`…
- [ ] Commands personnels dans `~/.claude/commands/` si multi-projets
- [ ] Nommage : `{action}.md` (kebab-case)
- [ ] Nouveaux workflows créés directement en skills ([quand migrer](#quand-migrer-vers-skill))

### Docker (convention de ce projet)

- [ ] Flag `-T` pour éviter l'allocation d'un TTY
- [ ] `2>&1` pour que les erreurs apparaissent dans la sortie
- [ ] Pas de `| cat` : le code de sortie de `cat` (0) masquerait l'échec
- [ ] Commande lancée via `cd <BACKEND_TARGET> && docker compose exec -T app <binaire> 2>&1` (ex. `php bin/phpunit`)

---

## Pour aller plus loin

- [Commands du projet](/examples/project-structure#commands-du-projet) — les 8 commands du projet et leur migration vers les skills
- [Skills](/concepts/skills) — le format recommandé pour les nouveaux workflows
- [Plugin `commit-commands` (Anthropic)](https://github.com/anthropics/claude-code/tree/main/plugins/commit-commands) — commandes de référence avec injection de contexte
- [Documentation officielle — Skills (section Commands)](https://code.claude.com/docs/en/skills) · [Interactive Mode](https://code.claude.com/docs/en/interactive-mode) · [Best practices](https://code.claude.com/docs/en/best-practices)

---

*Vérifié avec **Claude Code v2.1.295** contre la documentation officielle le 10 octobre 2026. Une fonctionnalité plus récente peut manquer : voir le [journal des modifications](https://code.claude.com/docs/en/changelog).*
