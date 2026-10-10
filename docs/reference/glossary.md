# Glossaire

## A

### Agent (subagent) {#agent}
Instance spécialisée de Claude configurée dans `.claude/agents/`. Chaque agent a ses propres outils, modèle et instructions, et travaille dans un contexte isolé, sans accès à l'historique de conversation. Voir [Agents](/concepts/agents) et la [documentation officielle](https://code.claude.com/docs/en/sub-agents).

### Agent SDK (Claude Agent SDK)
Bibliothèque Python et TypeScript (ex-« Claude Code SDK ») qui expose les outils, la boucle agentique et la gestion de contexte de Claude Code pour construire ses propres agents. Voir [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview).

### Agent Skills (standard)
Standard ouvert initié par Anthropic pour définir un format portable de skills compatible avec plusieurs outils IA (Claude Code, Cursor, VS Code Copilot, Gemini CLI, etc.). Voir [Standard Agent Skills](https://agentskills.io/specification).

### Agent Teams
Fonctionnalité de coordination multi-agents où plusieurs sessions Claude Code collaborent sur des tâches différentes. Contrairement aux subagents (même session), les agent teams opèrent dans des sessions séparées.

### AGENTS.md
Fichier d'instructions au format partagé entre plusieurs outils IA. Claude Code le lit à la place de CLAUDE.md quand aucun `CLAUDE.md` / `CLAUDE.local.md` n'existe dans le dossier courant ou ses parents. Voir [CLAUDE.md](/concepts/claude-md).

### Artifact
Page web interactive (HTML) que Claude Code publie depuis la session vers une URL privée sur claude.ai, mise à jour au fil de la session et partageable. Voir [Artifacts](https://code.claude.com/docs/en/artifacts).

### @import (`@chemin`)
Syntaxe de CLAUDE.md pour inclure le contenu d'un autre fichier : `@chemin/vers/fichier.md` (relatif au fichier qui importe, ou absolu). Profondeur max : 4 niveaux d'imports imbriqués. Les imports hors du projet déclenchent une demande d'approbation. Voir [CLAUDE.md](/concepts/claude-md).

### Auto mode
[Mode de permission](#modes-de-permission) `auto` : un classifieur évalue les actions en arrière-plan et évite la plupart des demandes de confirmation, tout en bloquant les actions jugées risquées.

### Auto-mémoire (auto memory) {#auto-memory}
Notes que Claude écrit lui-même pour retenir des informations entre sessions, dans `~/.claude/projects/<projet>/memory/` (partagé entre les worktrees d'un dépôt) : un index `MEMORY.md` plus des fichiers thématiques. Au démarrage, seules les 200 premières lignes ou 25 Ko de `MEMORY.md` (le premier atteint) sont chargés. Activable/désactivable via `/memory` (`autoMemoryEnabled`). Voir [CLAUDE.md](/concepts/claude-md) et la [documentation officielle](https://code.claude.com/docs/en/memory).

## B

### Background agent (agent en arrière-plan)
Subagent qui s'exécute sans bloquer la conversation ; Claude reçoit une notification à la fin. C'est le comportement par défaut ; `Ctrl+B` passe une tâche en cours en arrière-plan et `/tasks` liste le travail en cours. Voir [Parallélisme et séquence](/examples/pipeline#parallelisme-et-sequence).

### --bare {#bare}
Option de `claude -p` (mode non interactif) qui saute la découverte automatique des hooks, skills, commands, subagents, plugins, serveurs MCP, auto-mémoire et CLAUDE.md : seul ce qui est passé en ligne de commande s'applique. Recommandée pour les scripts et la CI. Voir [Hooks — WARN-008](/concepts/hooks#warn-008) et la [documentation officielle](https://code.claude.com/docs/en/headless).

### Boucle qualité {#boucle-qualite}
<span class="chez-nous">Chez nous</span> Mécanisme itératif où un agent juge (conformity-reporter) évalue la sortie d'un [executor](#executor). Si le score est inférieur à 80/100, l'executor est relancé avec les corrections. Une seule passe de correction, puis un rapport V2 : sous 80/100 en V2, intervention humaine. Voir [Pipeline](/examples/pipeline).

### /btw
Commande intégrée pour poser une question annexe sur la session sans l'ajouter à la conversation, préservant le contexte pour la tâche en cours.

## C

### Checkpoint (pipeline)
<span class="chez-nous">Chez nous</span> Dans les pipelines du projet : point de vérification entre deux étapes. Vérifie l'existence et la validité des fichiers de sortie avant de passer à l'étape suivante. À ne pas confondre avec les [checkpoints de Claude Code](#checkpoint-rewind).

### Checkpoint / Rewind {#checkpoint-rewind}
Fonctionnalité de Claude Code qui enregistre l'état de la conversation et des fichiers modifiés par Claude, pour revenir à un point antérieur via `Esc` `Esc` ou `/rewind` (alias `/checkpoint`, `/undo`). Voir [Annuler une erreur : `/rewind` ou git ?](/concepts/which-mechanism#annuler-une-erreur-rewind-ou-git).

### claudeMdExcludes {#claudemdexcludes}
Setting (liste de motifs [glob](#glob) sur des chemins absolus) qui empêche Claude Code de charger certains fichiers CLAUDE.md, typiquement ceux d'autres équipes dans un monorepo. Se règle à n'importe quel niveau de settings (les listes se cumulent) ; le CLAUDE.md [managed](#managed) n'est pas excluable. Voir [CLAUDE.md](/concepts/claude-md) et la [documentation officielle](https://code.claude.com/docs/en/memory#exclude-specific-claude-md-files).

### CLAUDE.md
Fichier de mémoire persistante du projet, chargé automatiquement par Claude à chaque session. <span class="chez-nous">Chez nous</span> il sert de source unique de vérité pour les chemins. Voir [CLAUDE.md](/concepts/claude-md).

### CLAUDE.local.md
Variante personnelle de CLAUDE.md, à la racine du projet et à ajouter au `.gitignore`. Chargée en plus de CLAUDE.md, après lui (elle apparaît donc en dernier dans le contexte). Voir [CLAUDE.md](/concepts/claude-md).

### Command (slash command)
Fichier Markdown dans `.claude/commands/` invocable via `/nom` (un sous-dossier devient un préfixe : `dev/commit.md` → `/dev:commit`). Format historique fusionné avec les skills : même frontmatter (sauf `name` et `paths`), toujours fonctionnel. Voir [Commands](/concepts/commands) et [Commands du projet](/examples/project-structure#commands-du-projet).

### Compaction {#compaction}
Résumé automatique de la conversation quand la fenêtre de contexte approche de sa limite (ou à la demande avec `/compact [consignes]`). Les échanges sont remplacés par un résumé : une consigne donnée seulement dans la conversation peut se perdre, alors que le CLAUDE.md racine est relu depuis le disque. Voir [CLAUDE.md](/concepts/claude-md) et la [documentation officielle](https://code.claude.com/docs/en/memory#instructions-seem-lost-after-compact).

### Context (fork)
Option frontmatter `context: fork` qui exécute une skill dans un subagent isolé, sans accès à l'historique de conversation.

### Conventional Commits
Convention de format de messages de commit : `type(scope): description`. Types : feat, fix, refactor, docs, test, chore.

## D

### Dialogue de confiance (workspace trust) {#dialogue-de-confiance}
Question posée au premier lancement de Claude Code dans un dossier : tant qu'on ne l'a pas accepté, les règles `allow` du `settings.json` projet, ses hooks et les serveurs de `.mcp.json` ne s'appliquent pas (les `deny` et `ask`, eux, s'appliquent toujours). `claude -p` n'affiche pas ce dialogue. Voir [Settings](/concepts/settings) et la [documentation officielle](https://code.claude.com/docs/en/permissions#project-allow-rules-and-workspace-trust).

### disable-model-invocation
Champ frontmatter qui empêche Claude de charger une skill automatiquement. Seul l'utilisateur peut l'invoquer via `/nom`.

## E

### Effort
Niveau de réflexion que le modèle consacre à une tâche : `low`, `medium`, `high`, `xhigh`, `max` (selon le modèle). Réglable via `/effort`, le setting `effort` ou le champ frontmatter `effort` des agents et skills. Voir [Model configuration](https://code.claude.com/docs/en/model-config).

### Exec form / shell form {#exec-form}
Deux façons de lancer un hook de type `command`. **Exec form** (champ `args` présent) : l'exécutable est lancé directement avec `args` comme arguments, sans shell (pas de guillemets à gérer, pas d'expansion). **Shell form** (pas de `args`) : la chaîne `command` passe par un shell, donc pipes, `&&` et variables fonctionnent. Voir [Hooks](/concepts/hooks) et la [documentation officielle](https://code.claude.com/docs/en/hooks#exec-form-and-shell-form).

### Executor {#executor}
<span class="chez-nous">Chez nous</span> Agent qui implémente les tâches planifiées en TDD (`backend-tasks-executor`, `frontend-tasks-executor`), puis dont la sortie est notée par le conformity-reporter dans la [boucle qualité](#boucle-qualite). Voir [Pipeline](/examples/pipeline).

## F

### Fable
Famille de modèles Claude. Version actuelle : Fable 5.1 (`claude-fable-5-1`), alias `fable`. Voir [Model configuration](https://code.claude.com/docs/en/model-config).

### Fast mode
Configuration d'Opus orientée vitesse (réponses nettement plus rapides, coût par token plus élevé) — ce n'est pas un autre modèle. Basculer avec `/fast`. Voir [Fast mode](https://code.claude.com/docs/en/fast-mode).

### front-design-conventions (skill)
<span class="chez-nous">Chez nous</span> Skill passive définissant les conventions de design (rem/em/%, breakpoints, design tokens, checklist fidélité). Héritée par le frontend-tasks-executor pour le traitement conditionnel des fichiers Figma JSON. Voir [Skills](/concepts/skills).

### Frontmatter {#frontmatter}
Métadonnées YAML en début de fichier Markdown (entre deux lignes `---`). Configure le comportement des agents, skills, commands, rules et output styles (nom, description, outils, modèle, `paths`…). Voir [Skills](/concepts/skills) et la [référence officielle](https://code.claude.com/docs/en/skills#frontmatter-reference).

## G

### Glob {#glob}
Motif de correspondance de chemins de fichiers : `*` remplace un nom (sans `/`), `**` un nombre quelconque de dossiers. Ex. : `src/**/*.ts` correspond à tous les fichiers TypeScript sous `src/`. Utilisé dans les rules (`paths:`), les permissions (`Edit(src/**)`) et `claudeMdExcludes`. Voir [Rules](/concepts/rules) et la [documentation officielle](https://code.claude.com/docs/en/permissions#wildcard-patterns).

## H

### Haiku
Modèle Claude léger et rapide (version actuelle : Haiku 4.5, `claude-haiku-4-5-20251001`, alias `haiku`). Utilisé pour les tâches structurées : audit d'inventaire, diagnostics. Coût minimal.

### headersHelper {#headershelper}
Champ de configuration d'un serveur MCP distant (`http`, `sse`, `ws`) : une commande exécutée à chaque connexion qui affiche en JSON les en-têtes à envoyer (ex. `Authorization`). Le jeton est ainsi produit à la volée au lieu d'être écrit en clair dans la configuration. Voir [MCP](/concepts/mcp) et la [documentation officielle](https://code.claude.com/docs/en/mcp#use-dynamic-headers-for-custom-authentication).

### Hook {#hook}
Action exécutée automatiquement par Claude Code en réponse à un événement de son cycle de vie (avant/après un outil, à la soumission d'un prompt, à la fin d'un tour…). Plus de 30 événements (PreToolUse, PostToolUse, UserPromptSubmit, Stop, SubagentStop, SessionStart, PreCompact…). 5 types : `command`, `http`, `mcp_tool`, `prompt`, `agent`. C'est du code déterministe, pas une consigne. Voir [Hooks](/concepts/hooks) et la [documentation officielle](https://code.claude.com/docs/en/hooks).

## I

### /init
Commande intégrée qui génère automatiquement un CLAUDE.md adapté au projet (analyse la structure, stack et commandes).

### Injection de prompt (prompt injection) {#injection-de-prompt}
Instructions malveillantes cachées dans un contenu que Claude lit (page web, fichier, issue, résultat d'outil MCP) pour détourner son comportement, par exemple lui faire exfiltrer un secret. Les défenses sont les [règles de permission](#regles-de-permission), le [sandbox](#sandbox) et les hooks de détection. Voir [Hooks — exemple anti-injection](/concepts/hooks#exemple-10-hook-anti-injection) et la [documentation officielle](https://code.claude.com/docs/en/security).

### Injection dynamique (`` !`commande` ``) {#injection-dynamique}
Syntaxe d'une skill ou d'une command : `` !`git diff --staged` `` exécute la commande shell avant l'envoi du prompt et remplace le placeholder par sa sortie. Claude reçoit donc le résultat, pas la commande. Désactivable par le setting `disableSkillShellExecution`. Voir [Skills](/concepts/skills) et [Commands](/concepts/commands).

### InstructionsLoaded (hook event)
Événement de hook déclenché à chaque chargement d'un fichier d'instructions (CLAUDE.md ou `.claude/rules/*.md`) : au démarrage, puis à chaque chargement à la demande (rule à `paths:` qui correspond, CLAUDE.md de sous-dossier, après compaction). Purement observationnel : il ne peut ni bloquer le chargement ni injecter de contexte ; il sert à la journalisation et à l'audit. Voir la [documentation officielle](https://code.claude.com/docs/en/hooks#instructionsloaded).

## L

### Launcher (skill launcher) {#skill-launcher}
Skill invoquée manuellement via `/nom` (souvent avec `disable-model-invocation: true`) qui orchestre un workflow multi-étapes, en général en déléguant à plusieurs agents. S'oppose à la [skill passive](#skill-passive). Voir [Skills](/concepts/skills).

### LLM-as-Judge {#llm-as-judge}
Pattern où un agent, dans un contexte neuf, évalue la sortie d'un autre agent selon des critères explicites. <span class="chez-nous">Chez nous</span> le conformity-reporter note l'[executor](#executor) dans la boucle qualité de `/mod-migrate-feature` (seuil 80/100). Voir [Agents](/concepts/agents) et [Pipeline](/examples/pipeline).

### /loop
Skill intégrée qui répète un prompt à intervalle régulier tant que la session est ouverte (`/loop 5m <prompt>`) ; sans intervalle, Claude choisit lui-même le rythme. Pour une exécution planifiée dans le cloud, voir [Routine](#routine).

### LSP {#lsp}
Language Server Protocol : protocole standard des serveurs de langage (ceux qu'utilisent les éditeurs). Un plugin peut déclarer des serveurs LSP (`.lsp.json` ou champ `lspServers`) pour donner à Claude diagnostics et navigation dans le code (définitions, références). Voir [Plugins](/concepts/plugins) et la [documentation officielle](https://code.claude.com/docs/en/plugins-reference).

## M

### Managed (configuration managed) {#managed}
Configuration déployée par l'organisation (fichier système, MDM ou console d'administration), qui s'applique à tous les utilisateurs et a priorité sur tous les autres niveaux : un utilisateur ne peut pas la contourner. Existe pour les settings et pour CLAUDE.md. Voir [Settings](/concepts/settings) et la [documentation officielle](https://code.claude.com/docs/en/permissions#managed-settings).

### Managed Policy CLAUDE.md
Fichier CLAUDE.md système déployé au niveau organisation. Emplacements : macOS `/Library/Application Support/ClaudeCode/CLAUDE.md`, Linux `/etc/claude-code/CLAUDE.md`, Windows `C:\Program Files\ClaudeCode\CLAUDE.md`. Non excluable via `claudeMdExcludes`. Voir [CLAUDE.md](/concepts/claude-md).

### Manifeste (plugin.json) {#manifeste}
Fichier `.claude-plugin/plugin.json` d'un plugin : métadonnées (nom, version, description…), options à demander à l'utilisateur (`userConfig`) et composants placés hors de leur emplacement par défaut. Voir [Plugins](/concepts/plugins) et la [référence officielle](https://code.claude.com/docs/en/plugins-reference).

### Marketplace {#marketplace}
Catalogue de plugins (fichier `.claude-plugin/marketplace.json` dans un dépôt git, à une URL ou dans un dossier local) ajouté avec `/plugin marketplace add`, depuis lequel on installe des plugins. Voir [Plugins](/concepts/plugins) et la [documentation officielle](https://code.claude.com/docs/en/plugin-marketplaces).

### Matcher {#matcher}
Filtre d'un hook qui précise sur quoi il se déclenche, en général le nom de l'outil : `"Bash"`, `"Edit|Write"`, `"mcp__github__.*"`. Absent ou `"*"` : le hook se déclenche à chaque occurrence de l'événement. Voir [Hooks](/concepts/hooks) et la [documentation officielle](https://code.claude.com/docs/en/hooks#matcher-patterns).

### MCP (Model Context Protocol) {#mcp}
Protocole standard qui connecte Claude à des outils et données externes (GitHub, base de données, navigateur…) via des serveurs ; leurs outils apparaissent sous la forme `mcp__<serveur>__<outil>`. Voir [MCP](/concepts/mcp) et la [documentation officielle](https://code.claude.com/docs/en/mcp).

### /memory
Commande intégrée pour éditer les fichiers CLAUDE.md (et CLAUDE.local.md), activer ou désactiver l'auto-mémoire et consulter ses entrées.

### Mod
Extension de l'interface de Claude Code (panneau, bandeau, status line, notification ou hook) écrite comme un plugin de « function hooks », rechargée à chaud. Claude Code en embarque quelques-uns, désactivables via `/plugin`. Voir [Plugins](/concepts/plugins).

### mod-conformity-conventions (skill)
<span class="chez-nous">Chez nous</span> Skill passive contenant la méthodologie de scoring, les templates de rapport de conformité, la gestion de versions des rapports et le format d'issues. Héritée par le conformity-reporter. Voir [Skills](/concepts/skills).

### Modes de permission {#modes-de-permission}
Niveau d'autonomie de Claude Code, changé avec `Shift+Tab` ou `--permission-mode` : `default` (confirmation), `acceptEdits` (éditions de fichiers sans confirmation), `plan` (lecture seule, voir [plan mode](#plan-mode)), `auto` (classifieur), `dontAsk` (refuse tout ce qui n'est pas pré-autorisé), `bypassPermissions` (aucune demande, environnements isolés uniquement). Voir [Quel mode de permission, à quelle étape ?](/concepts/which-mechanism#quel-mode-de-permission-a-quelle-etape) et la [documentation officielle](https://code.claude.com/docs/en/permission-modes).

## O

### OAuth {#oauth}
Protocole d'autorisation standard. Pour un serveur MCP distant qui le gère, `/mcp` ouvre le navigateur pour se connecter ; Claude Code stocke et rafraîchit le jeton lui-même, sans qu'il apparaisse en clair dans la configuration. Voir [MCP](/concepts/mcp) et la [documentation officielle](https://code.claude.com/docs/en/mcp).

### Opus
Modèle Claude haut de gamme (version actuelle : Opus 5.5, `claude-opus-5-5`, alias `opus`). Utilisé pour l'analyse complexe, le raisonnement multi-étapes et la compréhension de code non documenté. Contexte étendu jusqu'à 1M tokens selon le modèle et le fournisseur.

### Orchestrateur {#orchestrateur}
Session principale (ou skill launcher qui s'y exécute) qui découpe le travail, lance les subagents, contrôle leurs sorties et enchaîne les étapes. Un subagent ne peut pas lancer d'autres subagents : l'orchestration reste dans la session principale. Voir [Agents](/concepts/agents) et [Pipeline](/examples/pipeline).

### Output style {#output-style}
Fichier Markdown (`.claude/output-styles/` ou `~/.claude/output-styles/`) qui définit le rôle, le ton et le format des réponses de Claude pour toute la session. Sélection via `/config` ou le setting `outputStyle`. Voir [Output styles](https://code.claude.com/docs/en/output-styles).

## P

### Passive (skill passive) {#skill-passive}
Skill de conventions avec `user-invocable: false`, invisible dans le menu `/` : Claude la charge quand sa description correspond à la tâche, ou elle est préchargée dans un agent via son champ `skills:`. S'oppose au [skill launcher](#skill-launcher). Voir [Skills](/concepts/skills).

### Plan mode {#plan-mode}
[Mode de permission](#modes-de-permission) `plan` : Claude explore (lecture, commandes en lecture seule) et propose un plan à valider avant toute modification. Activable avec `/plan` ou `Shift+Tab`. Voir [Quel mode de permission, à quelle étape ?](/concepts/which-mechanism#quel-mode-de-permission-a-quelle-etape).

### Plugin
Package portable contenant skills, agents, hooks et/ou serveurs MCP dans un répertoire unique. Installé depuis un [marketplace](#marketplace) via `/plugin install <nom>@<marketplace>` (ou `claude plugin install`). Utilise un namespace `plugin-name:skill-name` pour éviter les conflits. Voir [Plugins](/concepts/plugins).

### Plugin eval
Commande `claude plugin eval` qui exécute un plugin sur une suite de cas de test (prompt réaliste + graders pass/fail : regex, appel d'outil, rubrique jugée par un modèle) et note les résultats. `claude plugin eval init` aide à créer la suite. Voir [Qualité et review](/examples/quality-review).

### PreToolUse / PostToolUse
Événements de hook. PreToolUse s'exécute avant l'action et peut la bloquer ; PostToolUse s'exécute après, pour journaliser, formater ou détecter un problème (ex. une [injection de prompt](#injection-de-prompt) dans le résultat) : il peut renvoyer un retour à Claude mais ne peut pas annuler l'action déjà faite.

## R

### Reference (fichier)
Fichier de documentation détaillée associé à une skill, stocké dans `references/`. Chargé par Claude à la demande.

### Règles de permission (allow / ask / deny) {#regles-de-permission}
Listes de `settings.json` sous la forme `Outil` ou `Outil(spécificateur)`, ex. `Bash(npm run test *)`, `Edit(src/**)`. `deny` refuse toujours, `ask` demande confirmation, `allow` autorise sans demander ; elles sont évaluées dans l'ordre deny → ask → allow, donc un deny l'emporte toujours. Voir [Settings](/concepts/settings) et la [documentation officielle](https://code.claude.com/docs/en/permissions#permission-rule-syntax).

### Routine {#routine}
Configuration Claude Code enregistrée (prompt, dépôts, connecteurs) exécutée automatiquement sur l'infrastructure cloud d'Anthropic selon des déclencheurs (planification…), même ordinateur éteint. Créée via `/schedule`.

### Rule {#rule}
Fichier Markdown dans `.claude/rules/`. Sans `paths:` dans son frontmatter, il est chargé à chaque session comme CLAUDE.md ; avec `paths:`, son contenu n'est injecté que lorsque Claude manipule un fichier qui correspond au motif [glob](#glob). Voir [Rules](/concepts/rules) et la [documentation officielle](https://code.claude.com/docs/en/memory).

## S

### Sandbox {#sandbox}
Isolation au niveau du système d'exploitation (fichiers et réseau) des commandes Bash et de leurs sous-processus (macOS, Linux, WSL2). Configuré dans `settings.json` (`sandbox`, avec `allowWrite`, `denyRead`, `allowedDomains`…). Voir [Settings](/concepts/settings#sandbox) et la [documentation officielle](https://code.claude.com/docs/en/sandboxing).

### Scope {#scope}
Portée d'une configuration, c'est-à-dire le fichier où elle est écrite et qui elle concerne. Settings : `managed`, `user` (`~/.claude/`), `project` (`.claude/settings.json`, versionné), `local` (`.claude/settings.local.json`, personnel). Serveurs MCP : `local` (par défaut, ce projet, privé, dans `~/.claude.json`), `project` (`.mcp.json`, partagé), `user` (tous vos projets). Voir [Settings](/concepts/settings), [MCP](/concepts/mcp) et la [documentation officielle](https://code.claude.com/docs/en/mcp#mcp-installation-scopes).

### SendMessage
Outil qui envoie un message à un autre agent (par ID ou nom), notamment pour **reprendre** un subagent terminé avec son contexte intact. Voir [Parallélisme et séquence](/examples/pipeline#parallelisme-et-sequence).

### Settings (settings.json)
Fichier de configuration des permissions, sandbox, modèle et hooks. 5 niveaux : managed > CLI > local > project > user. Voir [Settings](/concepts/settings).

### settings.local.json
Fichier de settings personnel (`.claude/settings.local.json`), ignoré par git. Idéal pour les préférences personnelles (modèle, langue) sans polluer le dépôt.

### Skill {#skill}
Dossier dans `.claude/skills/<nom>/` contenant un `SKILL.md` (frontmatter + instructions) et éventuellement des fichiers de référence et scripts. Seule sa description est chargée au départ ; le contenu complet l'est quand Claude ou l'utilisateur l'invoque. Peut être [passive](#skill-passive) (conventions) ou [launcher](#skill-launcher) (workflow). Voir [Skills](/concepts/skills) et la [documentation officielle](https://code.claude.com/docs/en/skills).

### SKILL.md
Fichier d'entrée obligatoire d'une skill. Contient le frontmatter de configuration et les instructions principales.

### Sonnet
Modèle Claude équilibré qualité/vitesse (version actuelle : Sonnet 5.5, `claude-sonnet-5-5`, alias `sonnet`). Utilisé pour l'implémentation, la planification et la review. Bon rapport coût/performance.

### Source unique de vérité
<span class="chez-nous">Chez nous</span> Principe selon lequel chaque information a un seul endroit de référence, évitant les duplications et contradictions : les chemins du projet ne sont définis que dans le tableau PATHS de CLAUDE.md.

### Status line
Barre personnalisable en bas de Claude Code, alimentée par un script shell qui reçoit les données de session en JSON (contexte, coût, branche git…). Configurable via `/statusline` ou le setting `statusLine`.

### stdio {#stdio}
Transport MCP local : Claude Code lance le serveur comme un processus sur la machine et dialogue avec lui par son entrée et sa sortie standard. S'oppose aux transports distants (`http`, `sse`, `ws`) où le serveur est joint par une URL. Voir [MCP](/concepts/mcp) et la [documentation officielle](https://code.claude.com/docs/en/mcp).

## T

### TDD (Test-Driven Development)
Approche d'implémentation où les tests sont écrits avant le code : Red (test échoue) → Green (code passe) → Refactor.

### Tool Search (ToolSearch) {#tool-search}
Chargement différé des outils : seuls leurs noms sont chargés au départ, leur schéma complet n'est chargé qu'après appel à l'outil ToolSearch. Concerne les outils MCP (activé par défaut, `ENABLE_TOOL_SEARCH=false` pour le couper) mais aussi certains outils intégrés ; cela économise du contexte quand beaucoup d'outils sont connectés. Voir [MCP](/concepts/mcp) et la [documentation officielle](https://code.claude.com/docs/en/mcp#scale-with-mcp-tool-search).

## U

### user-invocable
Champ frontmatter. `false` = la skill est invisible dans le menu `/`, seul Claude peut la charger.

## V

### Versioning (rapports)
<span class="chez-nous">Chez nous</span> Convention de ne jamais écraser un rapport existant. Chaque nouvelle évaluation crée une version incrémentée : V1, V2, V3.

## W

### Workflow (dynamic workflow)
Script JavaScript, écrit par Claude pour la tâche décrite, qui orchestre de nombreux subagents à la fois ; il s'exécute en arrière-plan pendant que la session reste disponible. Suivi via `/workflows`. Voir [Agent ou workflow ?](/concepts/which-mechanism#agent-ou-workflow).

### Worktree
Copie de travail git isolée (`git worktree`) dans laquelle Claude ou un subagent travaille sans toucher à la branche courante (champ agent `isolation: worktree`). Un worktree temporaire sans changement est nettoyé automatiquement. Voir [Parallélisme et séquence](/examples/pipeline#parallelisme-et-sequence).
