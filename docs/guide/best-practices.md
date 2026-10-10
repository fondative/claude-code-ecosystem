# Règles d'or

::: tip Ce que vous trouverez sur cette page
Les règles d'or du wiki réunies en une page : chacune tient en une ligne et renvoie à la section qui l'explique, avec, quand c'est utile, ce que fait le projet de modernisation (« Chez nous »). Suit la checklist complète de mise en service de chaque brique. Les erreurs à éviter sont rassemblées dans le [Catalogue des pièges](/guide/warns).
:::

## Les règles d'or

### Contexte : CLAUDE.md, rules, skills

1. **Garder CLAUDE.md sous 200 lignes ; le reste en [rules](/reference/glossary#rule) à `paths` ou en [skills](/reference/glossary#skill).** Les imports `@` n'allègent rien. → [CLAUDE.md — WARN-001](/concepts/claude-md#warn-001) · <span class="chez-nous">Chez nous</span> 82 lignes, conventions dans les skills `sym-*` et `front-*`.
2. **Écrire des consignes courtes, concrètes et vérifiables ; couper toute ligne dont l'absence ne ferait pas faire d'erreur.** → [Bien écrire ses instructions](/concepts/claude-md#bien-ecrire-ses-instructions) · <span class="chez-nous">Chez nous</span> une ligne suffit pour Docker : « Toutes les commandes backend via Docker Compose : `docker compose exec -T app <commande>` (sans `| cat`, pour garder le code de sortie) ».
3. **Centraliser les chemins dans CLAUDE.md, ne jamais les écrire en dur dans les [agents](/reference/glossary#agent).** → [CLAUDE.md — WARN-002](/concepts/claude-md#warn-002) · <span class="chez-nous">Chez nous</span> table PATHS de 11 alias marquée « SOURCE UNIQUE DE VERITE ».
4. **Une information à un seul endroit : la convention dans une skill, la rule se contente d'y renvoyer.** → [Skills — WARN-004](/concepts/skills#warn-004) · <span class="chez-nous">Chez nous</span> la rule `symfony-api` charge `sym-api-conventions` et ne garde que 4 rappels.
5. **Une rule par sujet, courte et liée à une zone du code par `paths`.** → [Rules — WARN-003](/concepts/rules#warn-003) · <span class="chez-nous">Chez nous</span> repère « moins de 30 lignes » recommandé par ce wiki (pas une limite de Claude Code) ; 7 rules, la plus longue fait 15 lignes.
6. **Une description de skill dit quoi ET quand.** Sans le « quand », la skill ne se déclenche pas seule. → [Skills — WARN-002](/concepts/skills#warn-002) · <span class="chez-nous">Chez nous</span> `sym-api-conventions` : « Conventions de developpement backend Symfony 7.4. […] Charger pour tout travail sur l'API REST backend. »

### Contrôle : settings, hooks

7. **Interdire par la configuration, pas par la consigne.** Une rule explique, seul un [`deny`](/reference/glossary#regles-de-permission) ou un [hook](/reference/glossary#hook) empêche. → [Consigne ou blocage ?](/concepts/which-mechanism#consigne-ou-blocage) · <span class="chez-nous">Chez nous</span> rule `legacy-readonly` doublée de `deny Edit(/php-legacy/**)`.
8. **Écrire les règles de chemin en `Edit(…)` et `Read(…)` avec `**`, jamais en `Write(…)`, qui est ignorée.** → [Settings — WARN-006](/concepts/settings#warn-006).
9. **`allow` précis, `ask` pour les actions à impact, `deny` pour les secrets et ce qui ne doit jamais changer.** → [Quoi mettre dans allow vs ask vs deny](/concepts/settings#quoi-mettre-dans-allow-vs-ask-vs-deny) · <span class="chez-nous">Chez nous</span> `git commit` et `git push` en `ask`, `.env*` en `deny` lecture et écriture.
10. **Ne pas prendre un `deny` Bash pour une frontière : contre les commandes destructrices, ajouter un hook ou le [sandbox](/reference/glossary#sandbox).** → [Hooks — couches de sécurité](/concepts/hooks#couches-de-securite) · <span class="chez-nous">Chez nous</span> `deny Bash(rm -rf *)` ne bloque que cette forme exacte ; le hook `block-rm.sh` refuse les autres (`rm -r`, `git rm -r` sans `--cached`, `find -delete`).
11. **Ne pas sortir `docker compose *` du sandbox : limiter `excludedCommands` à la forme exacte utilisée.** Une commande exclue tourne avec tous vos droits, et Claude peut modifier le fichier compose avant de le lancer. → [Settings — WARN-008](/concepts/settings#warn-008) · <span class="chez-nous">Chez nous</span> sandbox non activé ; s'il l'est, n'exclure que `docker compose exec -T app *`.
12. **Tester un hook sur des cas qui doivent passer, pas seulement sur ceux qu'il doit bloquer.** → [Hooks — WARN-006](/concepts/hooks#warn-006) · <span class="chez-nous">Chez nous</span> un hook publié dans ce wiki bloquait `docker compose exec -T app sh -c …`, la forme même des commandes backend.
13. **En CI, choisir explicitement entre [`--bare`](/reference/glossary#bare) et la configuration du dépôt.** `--bare` ne charge ni CLAUDE.md, ni agents, ni skills ; sans lui, hooks et serveurs [MCP](/reference/glossary#mcp) du dépôt s'exécutent sans [dialogue de confiance](/reference/glossary#dialogue-de-confiance). → [Hooks — WARN-008](/concepts/hooks#warn-008).

### Agents et pipeline

14. **Une responsabilité par agent, et seulement les outils dont il a besoin.** → [Agents — WARN-001](/concepts/agents#warn-001) · <span class="chez-nous">Chez nous</span> `legacy-technical-analyzer` et `legacy-functional-analyzer` n'ont pas `Edit`, seulement `Write` pour leur sortie.
15. **Choisir le modèle selon la tâche (Sonnet par défaut, Opus pour l'analyse profonde, Haiku pour le diagnostic) et baisser l'`effort` avant de changer de modèle.** → [Quel modèle choisir ?](/concepts/agents#quel-modele-choisir) · <span class="chez-nous">Chez nous</span> 7 agents Sonnet, 2 Opus, 2 Haiku.
16. **Écrire un plan validé dans la spec ou dans le message de délégation : un agent ne voit pas la conversation.** Ce qui a été décidé en discutant est perdu s'il n'est pas transmis. → [Agents — pièges à connaître](/concepts/agents#pieges-a-connaitre) · <span class="chez-nous">Chez nous</span> les [executors](/reference/glossary#executor) lisent la spec de `output/features/` et les tâches planifiées, pas l'échange qui les a produites.
17. **Vérifier la sortie d'une étape avant de lancer la suivante.** Sinon l'agent suivant tourne à vide. → [Agents — WARN-004](/concepts/agents#warn-004) · <span class="chez-nous">Chez nous</span> `/mod-analyze-legacy` place un checkpoint après chaque étape.
18. **Un seul écrivain par fichier quand des agents tournent en parallèle ; l'[orchestrateur](/reference/glossary#orchestrateur) met à jour les fichiers partagés.** → [Parallélisme et séquence](/examples/pipeline#parallelisme-et-sequence) · <span class="chez-nous">Chez nous</span> les `legacy-feature-analyzer` tournent en MODE BATCH, `0-index.md` est mis à jour une seule fois, à la fin.
19. **Dimensionner `maxTurns` (fichiers à lire + fichiers à écrire + 10) et le vérifier sur un vrai lancement.** Une sortie coupée n'affiche pas d'erreur : le résultat est seulement marqué partiel, à reprendre par SendMessage. → [Agents — WARN-006](/concepts/agents#warn-006).
20. **Faire relire dans un contexte neuf, contre la spec et avec les tests exécutés, plutôt que demander « ce qui manque ».** → [Justesse, conventions ou conformité ?](/examples/quality-review#justesse-conventions-ou-conformite) · <span class="chez-nous">Chez nous</span> `conformity-reporter` valide à partir de 80/100 et crée un rapport V2, V3… au lieu d'écraser le précédent.
21. **Commiter chaque état qui fonctionne.** `/rewind` (Esc Esc) n'annule ni les commandes (`docker compose exec`, npm, générateurs) ni le travail des agents ; seul git le fait. → [`/rewind` ou git ?](/concepts/which-mechanism#annuler-une-erreur-rewind-ou-git) · <span class="chez-nous">Chez nous</span> le code de la migration est écrit par les executors et par des générateurs lancés via Docker.

### Maintenance

22. **Écrire les commandes sous leur forme d'invocation réelle (`/dev:commit`, pas `/dev/commit`).** → [Commands — WARN-008](/concepts/commands#warn-008) · <span class="chez-nous">Chez nous</span> CLAUDE.md et la rule `git` écrivent `/dev:commit`.
23. **Après un renommage de dossier, chercher l'ancien chemin dans `settings.json`, les rules et les skills.** → [Rules — WARN-005](/concepts/rules#warn-005) · <span class="chez-nous">Chez nous</span> CLAUDE.md rappelle de mettre à jour la table PATHS **puis** de chercher l'ancien chemin dans `.claude/` (dont `settings.json`) et `install-stack.sh`.
24. **Lire en entier une skill, un plugin ou un serveur MCP tiers avant de l'installer : il s'exécute avec vos droits.** → [Auditer un plugin avant installation](/concepts/plugins#auditer-un-plugin-avant-installation).

## La checklist complète

Générée depuis les pages Concepts : pour la modifier, modifier la checklist de la page concernée.

<!-- checklist:start -->

### [CLAUDE.md](/concepts/claude-md) · 21 points

**Contenu**

- [ ] Commandes que Claude ne peut pas deviner documentées
- [ ] <span class="chez-nous">Chez nous</span> Chemins centralisés dans une table d'alias, note « SOURCE UNIQUE DE VERITE » visible
- [ ] Stack technique en 1 ligne
- [ ] Agents et skills lisent les chemins via les alias de CLAUDE.md, aucun chemin écrit en dur ([WARN-002](/concepts/claude-md#warn-002))

**Organisation**

- [ ] CLAUDE.md court (< 200 lignes) — détail dans skills ou rules à `paths` (les imports `@chemin` ne réduisent pas le contexte)
- [ ] Chaque ligne passe le test « la supprimer ferait-elle faire une erreur ? »
- [ ] Pas de conventions détaillées (dans les skills)
- [ ] Pas d'instructions temporaires (fichier de plan ou conversation, pas MEMORY.md)
- [ ] Ce qu'un réglage garantit (`language`, `attribution`, permissions, règles de sécurité en `deny`) est dans settings.json, pas dans CLAUDE.md
- [ ] Chaque chemin de la table PATHS recherché dans `settings.json`, `.claude/rules/` et les skills avant un renommage
- [ ] Commandes écrites sous leur forme d'invocation réelle (`/dev:commit`, pas `/dev/commit`)

**Découverte**

- [ ] CLAUDE.md à la racine (`./` ou `./.claude/`)
- [ ] `claudeMdExcludes` (globs sur chemins absolus) pour les CLAUDE.md à ignorer ; CLAUDE.md managed pour les standards d'organisation (non excluable)
- [ ] Consignes propres à un sous-dossier dans son CLAUDE.md ou une rule à `paths` (chargés à la demande, pas au lancement)
- [ ] Imports `@chemin` avec profondeur max 4 sauts
- [ ] `CLAUDE.local.md` présent dans `.gitignore`

**Vérification**

- [ ] `/init` pour générer un CLAUDE.md initial
- [ ] `/context` (section *Memory files*) pour vérifier le chargement
- [ ] `/memory` pour vérifier la mémoire auto
- [ ] Consignes durables dans le CLAUDE.md racine (relu après `/compact`, contrairement aux CLAUDE.md de sous-dossiers et aux rules à `paths`) — tester
- [ ] `/doctor prompt-audit` passé régulièrement (consignes obsolètes ou contradictoires)

### [Settings](/concepts/settings) · 24 points

**Permissions**

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

**Fichiers**

- [ ] `.claude/settings.json` pour l'équipe (git) — ses `allow` n'agissent qu'après le dialogue de confiance
- [ ] `.claude/settings.local.json` pour les préférences perso (gitignore)
- [ ] `$schema` pour l'autocomplétion IDE
- [ ] <span class="chez-nous">Chez nous</span> Chemins du `settings.json` alignés sur la table PATHS du CLAUDE.md

**Sandbox**

- [ ] Sandbox activé si Claude lance sur l'hôte des commandes hors Docker (npm, scripts, réseau) — macOS, Linux, WSL2
- [ ] `denyRead` du sandbox ou deny `Read(…)` des settings user pour les credentials (`~/.aws`, `~/.ssh`) — les deux sont fusionnés
- [ ] `allowedDomains` pour le réseau
- [ ] `excludedCommands` limité à la forme utilisée (`docker compose exec -T app *`), jamais `docker compose *` ([WARN-008](/concepts/settings#warn-008))

**Vérification**

- [ ] `/status` (fichiers chargés), `/permissions` (règles et fichier source), `claude doctor` (entrées rejetées)
- [ ] Aucun avertissement de règle ignorée au démarrage
- [ ] Tester les deny : Claude doit être bloqué
- [ ] Tester les allow : pas de confirmation inutile
- [ ] Hook de sécurité testé aussi sur les commandes autorisées (pas de faux positif)

### [Rules](/concepts/rules) · 16 points

**Contenu**

- [ ] Un sujet par fichier, liée à une zone du code (sinon CLAUDE.md ou skill)
- [ ] Pas de répétition de ce qu'un `deny` ou un hook garantit déjà
- [ ] Pas de duplication entre rule et skill
- [ ] Rule courte ; le détail des conventions délégué à une skill ([WARN-003](/concepts/rules#warn-003))
- [ ] Instructions spécifiques et vérifiables (pas « bien formater le code »)
- [ ] Commandes citées sous leur forme d'invocation réelle (`/dev:commit`)

**Globs**

- [ ] Globs précis et testés (`**` récursif, `*` un niveau)
- [ ] Accolades pour plusieurs extensions (`*.{ts,tsx}`), sans multiplier les groupes
- [ ] Pas de `paths: ["**"]` (équivaut à une rule sans `paths`) ([WARN-004](/concepts/rules#warn-004))
- [ ] `/context` pour les rules sans `paths` ; hook `InstructionsLoaded` pour les rules à `paths` (chargées à la demande)
- [ ] Frontmatter YAML valide (`claude --debug`) — sinon la rule devient globale
- [ ] `paths` alignés sur les dossiers actuels : après un renommage, chercher l'ancien nom dans CLAUDE.md, `settings.json`, `.claude/rules/` et les skills

**Protection**

- [ ] Rule "lecture seule" doublée d'un `deny` dans [`settings.json`](/concepts/settings)

**Organisation**

- [ ] Fichier nommé d'après son sujet ; sous-dossiers possibles (découverte récursive)
- [ ] Rules utilisateur dans `~/.claude/rules/` pour les préférences personnelles
- [ ] Symlinks si rules partagées entre projets (approbation requise si cible hors projet ; seules les rules sans `paths` s'y chargent alors)

### [Skills](/concepts/skills) · 21 points

**Contenu & type**

- [ ] Description : ce que fait la skill **et** quand l'utiliser, à la 3e personne, mots-clés naturels
- [ ] Type correct ([arbre de décision](/concepts/skills#passive-vs-launcher))
- [ ] `disable-model-invocation: true` pour les actions à risque
- [ ] Skill appelée par le pipeline ou préchargée par un agent (`skills:`) : sans `disable-model-invocation`
- [ ] SKILL.md < 500 lignes, détail dans `references/`
- [ ] Rien que Claude sait déjà (standards du langage, explications génériques)
- [ ] Fichiers de référence liés **directement** depuis `SKILL.md` (un seul niveau de profondeur)
- [ ] Table des matières en tête des fichiers de référence de plus de 100 lignes
- [ ] Pas d'information datée (« avant août 2025… ») ou alors dans une section « anciens patterns »

**Cohérence projet**

- [ ] Pas de duplication avec une [rule](/concepts/rules) existante (voir [WARN-004](/concepts/skills#warn-004))
- [ ] Préfixe cohérent (<span class="chez-nous">Chez nous</span> `sym-`, `front-`, `mod-`)
- [ ] Skills listées dans les agents qui en ont besoin (`skills:`)
- [ ] Conventions dans une skill préchargée, pas recopiées dans le prompt des agents ([WARN-006](/concepts/skills#warn-006))

**Sécurité & visibilité**

- [ ] `allowed-tools` limité au strict nécessaire
- [ ] `context: fork` si la skill doit tourner en isolation
- [ ] [Permissions](/concepts/settings) deny configurées si besoin (`Skill(name *)`)
- [ ] Skill tierce (dépôt public, collègue) **lue en entier** avant usage : `SKILL.md`, scripts et injections `` !`…` `` s'exécutent avec vos droits

**Validation**

- [ ] Testée par `/nom` (launcher, standard) et en déclenchement automatique par un message libre qui correspond à la description (passive, standard)
- [ ] Au moins trois scénarios comparés avec / sans la skill ([Évaluer une skill](/concepts/skills#evaluer-une-skill))
- [ ] Testée avec chaque modèle visé
- [ ] Budget vérifié (`/context`, `/doctor` ; avertissement dans `claude --debug`)

### [Agents](/concepts/agents) · 18 points

**Conception**

- [ ] Une seule responsabilité par agent
- [ ] Modèle adapté ([Sonnet par défaut, Opus complexe, Haiku simple](/concepts/agents#quel-modele-choisir))
- [ ] Outils limités au strict nécessaire
- [ ] `disallowedTools` si besoin d'exclure des outils spécifiques

**Description & délégation**

- [ ] Description courte et spécifique — Claude l'utilise pour décider quand déléguer (voir [Écrire une bonne description](/concepts/agents#ecrire-une-bonne-description))
- [ ] Format de retour demandé : résumé court et structuré
- [ ] `"Use proactively"` dans la description si délégation automatique souhaitée
- [ ] Skills listées explicitement (pas d'héritage depuis la conversation parente)
- [ ] Consignes clés et plan validé écrits dans le message de délégation ou la spec (l'agent ne voit pas la conversation)

**Exécution**

- [ ] Checkpoints entre étapes séquentielles
- [ ] Relecture du résultat par un subagent en contexte neuf, limitée à la justesse et aux exigences
- [ ] `maxTurns` ≥ fichiers à lire + fichiers à écrire + 10, vérifié sur un vrai lancement ; à la limite, la sortie est marquée partielle (reprenable)
- [ ] `permissionMode` adapté (`plan` pour lecture seule, `dontAsk` pour CI, `auto` si le mode auto est disponible)

**Maintenance**

- [ ] Fichier versionné dans `.claude/agents/` (partagé équipe)
- [ ] Noms explicites ; <span class="chez-nous">Chez nous</span> préfixe de domaine + rôle (`legacy-…`, `backend-tasks-…`, `frontend-tasks-…`)
- [ ] Fichiers de sortie documentés dans le prompt
- [ ] `memory: project` (ou `user`) si apprentissage entre sessions souhaité
- [ ] Agents lancés en parallèle : un seul écrivain par fichier ; fichiers partagés mis à jour par l'orchestrateur

### [Hooks](/concepts/hooks) · 20 points

**Sécurité**

- [ ] PreToolUse sur `Bash` : commandes dangereuses
- [ ] PreToolUse sur `Write|Edit` : secrets
- [ ] Coupler avec [`settings.json` deny](/concepts/settings) pour les blocages statiques
- [ ] Détection d'injection de prompt en `PostToolUse` sur `Read|WebFetch`, pas en `PreToolUse` ([WARN-007](/concepts/hooks#warn-007))
- [ ] Job CI avec `claude -p` : choix `--bare` / sans `--bare` fait en connaissance de cause ([WARN-008](/concepts/hooks#warn-008))

**Scripts**

- [ ] `chmod +x` sur tous les scripts
- [ ] TOUJOURS `exit 0` explicite en fin de script (et `exit 2`, pas `exit 1`, pour bloquer)
- [ ] PreToolUse rapides et locaux (utiliser `async: true` ou `asyncRewake: true` si long)
- [ ] Tester sur des cas positifs **et** négatifs (négatifs = les commandes courantes du projet, ex. `docker compose exec -T app sh -c …`) : `echo '{"tool_input":{"command":"rm -rf /"}}' | ./hook.sh; echo $?` ; `|` échappé dans les motifs `grep -E`
- [ ] Scripts appelés via `"$CLAUDE_PROJECT_DIR"/…`, ou `${CLAUDE_PROJECT_DIR}/…` en forme exec (pas de chemin relatif)
- [ ] Hook `Stop` : tester `stop_hook_active` pour éviter la boucle

**Configuration**

- [ ] Matchers précis (nom exact ou regex ancrée, pas `*`) + `if` pour filtrer les arguments
- [ ] Choisir exit code OU JSON, pas les deux
- [ ] `timeout` court et explicite (un `PreToolUse` expiré laisse passer l'appel)
- [ ] Hook déclaré dans une skill : actif pour le reste de la session
- [ ] Ne pas compter sur un `allow` de hook pour lever un `deny` ou un `ask`

**Organisation**

- [ ] Scripts dans `.claude/hooks/` (versionnés)
- [ ] Hooks projet dans `.claude/settings.json` (équipe)
- [ ] Hooks personnels dans `~/.claude/settings.json`
- [ ] Hooks personnels à ce dépôt, non partagés : `.claude/settings.local.json`

### [MCP](/concepts/mcp) · 12 points

**Installation**

- [ ] Choisir le bon transport (`http` pour distant, `stdio` pour local, `ws` si le serveur pousse des événements) ; `type` renseigné dès qu'il y a une `url`
- [ ] Choisir le bon scope (`project`, soit `.mcp.json` dans git, si partage équipe ; `local` sinon)
- [ ] Tester la connexion : `/mcp` dans Claude Code

**Sécurité**

- [ ] OAuth, puis `headersHelper`, sinon `${VARIABLE}` (jamais de token en clair)
- [ ] `allow` limité aux outils de lecture ; écritures en `ask`, actions irréversibles en `deny`
- [ ] Serveurs de confiance, de sources vérifiées (serveurs HTTP officiels, serveurs de référence maintenus — pas de packages archivés ; risque d'injection de prompt) ; `.mcp.json` d'un dépôt cloné relu avant approbation

**Organisation**

- [ ] CLI d'abord (`gh`, `psql`, `kubectl`) ; MCP quand il apporte quelque chose
- [ ] `/context` pour mesurer le coût ; serveurs inutilisés désactivés dans `/mcp`
- [ ] `--strict-mcp-config` en CI
- [ ] `MAX_MCP_OUTPUT_TOKENS` si gros résultats attendus ; `timeout` par serveur pour les outils longs
- [ ] Serveurs lourds réservés à un subagent via `mcpServers` plutôt que dans `.mcp.json`
- [ ] Subagent avec `tools:` : outils MCP voulus listés, ou `disallowedTools` à la place

### [Plugins](/concepts/plugins) · 20 points

**Structure**

- [ ] `.claude-plugin/` ne contient que `plugin.json`, tout le reste à la racine
- [ ] Chaque skill dans `skills/<nom>/SKILL.md`
- [ ] Chaque agent dans `agents/<nom>.md`
- [ ] Hooks dans `hooks/hooks.json`, enveloppés dans `"hooks": { … }`
- [ ] MCP dans `.mcp.json` à la racine
- [ ] Pas d'instructions dans un `CLAUDE.md` (non chargé)

**Qualité**

- [ ] Chaque `description` dit quoi faire et quand
- [ ] `"${CLAUDE_PLUGIN_ROOT}"` (entre guillemets) pour les chemins du plugin, `${CLAUDE_PLUGIN_DATA}` pour l'état
- [ ] Secrets déclarés en `userConfig` avec `sensitive: true`
- [ ] Hooks rapides, `timeout` adapté pour ceux qui peuvent bloquer
- [ ] README à la racine

**Distribution**

- [ ] Plugin réservé à un outillage commun à plusieurs projets ; ce qui est propre au projet reste dans `.claude/`
- [ ] Testé localement avec `claude --plugin-dir ./mon-plugin`
- [ ] `claude plugin validate --strict` en CI ; renseigner `version` ou accepter l'avertissement qu'entraîne son absence
- [ ] `version` incrémentée à chaque release, ou omise (suivi des commits)
- [ ] Hooks retirés de `.claude/settings.json` après conversion ([pourquoi](/concepts/plugins#convertir-un-claude-en-plugin))
- [ ] Nom clair, descriptif et non réservé
- [ ] Partage par le dépôt : `extraKnownMarketplaces` pris en compte après le dialogue de confiance ; plugin à source externe à installer par chaque contributeur ([détail](/concepts/plugins#partager-avec-l-equipe))

**Installation d'un plugin tiers**

- [ ] Section **Will install** lue, puis `hooks/hooks.json`, `.mcp.json` et `bin/`
- [ ] Auto-update désactivé pour les marketplaces tiers non audités

### [Commands](/concepts/commands) · 17 points

**Contenu**

- [ ] Un fichier = une action (extraire la logique complexe en skill)
- [ ] `description` claire et `argument-hint` si arguments
- [ ] Prérequis déclarés (`compatibility`) et **vérifiés dans le corps**, pas dans la description
- [ ] Contexte utile injecté (`` !`git status` ``…) et commandes nécessaires dans `allowed-tools`
- [ ] Pas de champ `name:` (ignoré dans un command)

**Invocation**

- [ ] `disable-model-invocation: true` pour les commandes à effet de bord (commit, deploy), pas pour les vérifications (tests, lint)
- [ ] Reviews en `context: fork`
- [ ] Pas de conflit de nom avec un skill existant (ni avec une skill intégrée, sauf remplacement voulu)
- [ ] Invocation documentée avec la notation réelle (`/dossier:command`) dans CLAUDE.md, les rules et les autres commands

**Organisation**

- [ ] Sous-dossiers sémantiques (`dev/`, `review/`, `deploy/`) → namespaces `dev:`, `review:`…
- [ ] Commands personnels dans `~/.claude/commands/` si multi-projets
- [ ] Nommage : `{action}.md` (kebab-case)
- [ ] Nouveaux workflows créés directement en skills ([quand migrer](/concepts/commands#quand-migrer-vers-skill))

**Docker (convention de ce projet)**

- [ ] Flag `-T` pour éviter l'allocation d'un TTY
- [ ] `2>&1` pour que les erreurs apparaissent dans la sortie
- [ ] Pas de `| cat` : le code de sortie de `cat` (0) masquerait l'échec
- [ ] Commande lancée via `cd <BACKEND_TARGET> && docker compose exec -T app <binaire> 2>&1` (ex. `php bin/phpunit`)

<!-- checklist:end -->

## Pour aller plus loin

- [Catalogue des pièges](/guide/warns) : toutes les erreurs fréquentes, classées par gravité
- [L'essentiel : quelle brique pour quel besoin ?](/concepts/which-mechanism) : les huit hésitations les plus courantes
- [Démarrage rapide](/guide/getting-started) : mettre en place une première configuration

---

*Vérifié avec **Claude Code v2.1.295** contre la documentation officielle le 10 octobre 2026. Une fonctionnalité plus récente peut manquer : voir le [journal des modifications](https://code.claude.com/docs/en/changelog).*
