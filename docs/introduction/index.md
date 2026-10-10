# Philosophie & Vision

::: tip Ce que vous trouverez sur cette page
En 5 minutes : ce qu'est Claude Code, comment il travaille, les briques qui permettent de l'adapter à un projet, et par où commencer selon votre profil. Aucun prérequis.
:::

## Claude Code en une phrase

**Claude Code est un assistant de développement qui travaille directement dans votre projet** : il lit vos fichiers, les modifie, lance des commandes (tests, build, git…) et enchaîne ces actions jusqu'à atteindre l'objectif que vous lui donnez. Il s'utilise dans le terminal, dans VS Code / JetBrains, dans l'application desktop ou sur le web (voir [Platforms](https://code.claude.com/docs/en/platforms)).

Ce wiki explique comment le **configurer et l'outiller** pour un projet réel, avec un fil rouge : la modernisation d'une application legacy (voir [Méthodologie AI-Driven](/guide/methodology)).

## Comment il travaille : la boucle agentique

Claude Code ne suit pas un script écrit à l'avance. À chaque demande, il répète la même boucle :

```
1. Lire la demande et le contexte du projet
2. Choisir l'action utile (lire un fichier, chercher, modifier, lancer une commande…)
3. Exécuter l'action — si elle est autorisée
4. Analyser le résultat
5. Recommencer à l'étape 2, ou répondre quand l'objectif est atteint
```

C'est le sens de la formule **« less scaffolding, more model »** (moins d'échafaudage, plus de modèle) : plutôt que de coder à l'avance chaque étape d'un processus, on laisse le modèle décider de l'enchaînement des actions.

::: warning Le modèle décide du « comment », vous décidez de « ce qui est permis »
« Laisser le modèle décider » ne veut pas dire « le laisser tout faire ». Chaque action passe par vos **permissions** (ce qui est autorisé, refusé ou soumis à confirmation) puis par le **mode de permission** actif : selon le mode, Claude Code vous demande votre accord, ou fait vérifier l'action par un classifieur de sécurité qui bloque les actions risquées (mode `auto`). Ce qui est refusé dans vos permissions reste refusé dans tous les cas.
→ [Quel mode de permission, à quelle étape](/concepts/which-mechanism#quel-mode-de-permission-a-quelle-etape) · [Settings](/concepts/settings)
:::

### Les outils intégrés

Pour agir, Claude utilise des **outils** fournis d'office, sans configuration. Les principaux :

| Besoin | Outils |
|--------|--------|
| Lire et chercher | `Read`, `Grep`, `Glob` |
| Modifier | `Edit`, `Write` |
| Exécuter | `Bash` |
| Consulter le web | `WebFetch`, `WebSearch` |
| Déléguer et s'organiser | `Agent` (lancer un sous-agent), `Skill` (charger une skill), liste de tâches |

La liste complète évolue avec les versions : voir la [référence officielle des outils](https://code.claude.com/docs/en/tools-reference).

## Les briques de personnalisation

Sans configuration, Claude Code fonctionne déjà. Les briques ci-dessous servent à l'**adapter à votre projet**. Elles se rangent en trois familles — c'est la distinction la plus importante à retenir :

| Famille | Effet | Briques |
|---------|-------|---------|
| **Contexte** | *Informe* Claude. Il en tient compte, mais rien ne l'y **oblige**. | CLAUDE.md, Rules, Skills |
| **Contrôle** | *Contraint* Claude. Appliqué par Claude Code, quoi que décide le modèle. | Settings (permissions), Hooks |
| **Extension** | *Ajoute* des capacités. | Agents, MCP, Plugins |

::: danger Une consigne n'est pas une protection
Écrire « ne modifie jamais `php-legacy/` » dans un CLAUDE.md ou une rule est une **consigne** : Claude la suit presque toujours, mais ce n'est pas garanti. Pour **interdire** réellement, il faut une règle `deny` dans les settings ou un hook. → [Consigne ou blocage ?](/concepts/which-mechanism#consigne-ou-blocage)
:::

### Détail des briques

| Brique | À quoi elle sert | Quand elle agit | Fichier(s) |
|--------|------------------|-----------------|------------|
| [CLAUDE.md](/concepts/claude-md) | Instructions permanentes du projet (stack, commandes, conventions) | Chargé au début de chaque session | `CLAUDE.md`, `CLAUDE.local.md` |
| [Rules](/concepts/rules) | Consignes ciblées sur certains fichiers | Quand Claude touche un fichier qui correspond au motif `paths` (ou toujours, sans `paths`) | `.claude/rules/*.md` |
| [Skills](/concepts/skills) | Savoir-faire et procédures réutilisables | Quand Claude juge la skill utile, ou quand vous tapez `/nom-de-la-skill` | `.claude/skills/<nom>/SKILL.md` |
| [Commands](/concepts/commands) | Ancien format des skills déclenchées par `/nom` — toujours lu, mais on écrit désormais des skills | Quand vous tapez `/nom` | `.claude/commands/*.md` |
| [Settings](/concepts/settings) | Permissions (autoriser / demander / refuser), modèle, réglages | En permanence | `.claude/settings.json` |
| [Hooks](/concepts/hooks) | Scripts exécutés automatiquement à des moments précis (avant un outil, après une modification…) ; peuvent bloquer une action | À chaque événement configuré | Section `hooks` des settings |
| [Agents](/concepts/agents) | Sous-agents spécialisés, chacun avec son propre contexte, ses outils et son modèle | Quand Claude (ou une skill) leur délègue une tâche | `.claude/agents/*.md` |
| [MCP](/concepts/mcp) | Connexion à des services externes (GitHub, base de données, outils internes…) | Quand Claude appelle un outil du serveur | `.mcp.json` |
| [Plugins](/concepts/plugins) | Paquet installable qui regroupe skills, agents, hooks et serveurs MCP pour les partager entre projets | Une fois installé et activé | Installé via `/plugin` |

Pour choisir entre deux briques : [L'essentiel : quelle brique pour quel besoin ?](/concepts/which-mechanism). Pour voir où se rangent ces fichiers : [Architecture .claude/](/introduction/architecture) (structure type) et [Structure du projet .claude/](/examples/project-structure) (exemple réel).

## Où vivent les configurations et qui l'emporte

Chaque brique peut exister à plusieurs **niveaux** :

| Niveau | Emplacement | Portée |
|--------|-------------|--------|
| Organisation (*managed*) | Déployé par l'administrateur | Tous les utilisateurs de l'organisation |
| Personnel | `~/.claude/` | Vous, dans tous vos projets |
| Projet | `.claude/` du dépôt (versionné) | Toute l'équipe, dans ce projet |
| Local | `.claude/settings.local.json`, `CLAUDE.local.md` (non versionnés) | Vous, dans ce projet |
| Plugin | Plugin installé | Là où le plugin est activé |

::: warning Il n'existe pas un ordre de priorité unique
Ce qui se passe quand une même chose est définie à plusieurs niveaux **dépend de la brique** :

| Brique | Règle |
|--------|-------|
| **Settings** | Pour une même clé, l'ordre de priorité est : organisation > ligne de commande (`--settings`) > local > projet > personnel. Les règles de permission de tous les niveaux se cumulent, et un `deny` l'emporte toujours sur un `allow`. |
| **CLAUDE.md et Rules** | Rien n'est remplacé : **tous les fichiers sont chargés et s'additionnent**. |
| **Skills de même nom** | Organisation > personnel > projet. |
| **Plugins** | Pas de conflit : leurs skills sont préfixées par le nom du plugin (`/mon-plugin:review`). |

Le détail est donné sur la page de chaque brique.
:::

## Les principes de ce wiki

Ces principes guident la façon dont le projet de modernisation est configuré. Ce sont **des choix de ce projet**, pas des obligations de Claude Code :

1. **Une seule source de vérité** — chaque information (un chemin, une convention) est écrite à un seul endroit. Exemple : les chemins du projet sont définis uniquement dans le `CLAUDE.md` racine ; les agents et skills les y lisent.
2. **Les conventions vivent dans les skills** — les règles de code backend et frontend sont dans des skills (`sym-api-conventions`, `front-app-conventions`…) que les agents chargent, plutôt que dans un dossier de documentation séparé.
3. **Le bon contexte au bon moment** — les rules ne se chargent que lorsque Claude touche les fichiers concernés, pour ne pas encombrer son contexte.
4. **Un agent = une responsabilité** — chaque sous-agent fait une seule chose (analyser, planifier, implémenter, contrôler) dans son propre contexte.
5. **L'humain valide chaque étape** — Claude produit, l'architecte relit et décide ; tout écart par rapport à la spécification est consigné dans un rapport de conformité.
6. **Interdire par la configuration, pas par la consigne** — tout ce qui doit être impossible (modifier le legacy, lire les secrets) est bloqué dans les settings.

## Par où commencer ?

| Vous êtes… | Commencez par |
|------------|---------------|
| Nouveau sur Claude Code | [Démarrage rapide](/guide/getting-started), puis [L'essentiel : quelle brique pour quel besoin ?](/concepts/which-mechanism), [CLAUDE.md](/concepts/claude-md) et [Modes de permission](https://code.claude.com/docs/en/permission-modes) |
| Développeur qui configure un projet | [L'essentiel : quelle brique pour quel besoin ?](/concepts/which-mechanism), [Architecture .claude/](/introduction/architecture), [Bonnes pratiques](/guide/best-practices), [Skills](/concepts/skills), [Agents](/concepts/agents) |
| Responsable sécurité ou tech lead | [Settings](/concepts/settings), [Hooks](/concepts/hooks), [Catalogue des pièges](/guide/warns) |
| Chef de projet modernisation | [Méthodologie AI-Driven](/guide/methodology), puis le [Manuel d'utilisation](/examples/) |

Un terme vous échappe ? Le [Glossaire](/reference/glossary) les définit tous. Les commandes et raccourcis sont dans la [Cheatsheet](/reference/cheatsheet).

## Ressources

- [Documentation officielle de Claude Code](https://code.claude.com/docs/en/overview)
- [Standard ouvert Agent Skills](https://agentskills.io)
