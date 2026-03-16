# AI-Driven Modernisation : Legacy Transmutation

> Transformer n'importe quel projet legacy en architecture moderne — piloté par l'IA, **supervisé par un architecte/senior** à chaque phase, propulsé par l'écosystème Claude Code.

## Technologies cibles

Cette méthodologie est **agnostique de la technologie source**. Elle s'applique à toute migration legacy, quelle que soit la stack d'origine.

| Cible | Stack type |
|-------|-----------|
| **React** | SPA web avec TypeScript, Vite, Tailwind |
| **React Native** | Application mobile cross-platform |
| **Symfony** | API REST backend PHP, PostgreSQL, JWT |
| **NestJS / Node.js** | API REST backend TypeScript, microservices |

:::info Exemple illustré
Dans cette page, l'exemple concret est une migration **PHP procédural → Symfony 7.4 + React 19**. Les principes et le pipeline s'appliquent identiquement aux autres cibles.
:::

---

## Les 3 principes fondateurs

| Principe | En pratique |
|----------|-----------|
| **Comprendre avant d'agir** | Ne jamais modifier du code sans l'avoir analysé en profondeur. L'analyse produit des artefacts écrits, pas des résumés verbaux. |
| **Le plan est un fichier** | Chaque étape produit un fichier Markdown qui sert de relais vers l'étape suivante. Pas de contexte partagé entre agents. |
| **L'implémentation est mécanique** | Toute la réflexion a lieu dans les phases d'analyse et de planification. Le code suit les specs et les conventions. |

---

## Garde-fous : garantir la conformité fonctionnelle

> **Promesse** : le système modernisé fait **exactement** ce que le legacy faisait.
> Six garde-fous forment une chaîne de traçabilité du code legacy au code moderne.

```mermaid
graph LR
    GF1["GF-1 — Inventaire validé"]
    GF2["GF-2 — Spec 12 sections"]
    GF3["GF-3 — TDD Test First"]
    GF4["GF-4 — Gouvernance humaine"]
    GF5["GF-5 — Conformité fonctionnelle et technique"]
    GF6["GF-6 — Traçabilité"]

    GF1 --> GF2 --> GF3 --> GF5
    GF4 -.-> GF1
    GF4 -.-> GF2
    GF4 -.-> GF5
    GF6 -.-> GF1
    GF6 -.-> GF2
    GF6 -.-> GF3
    GF6 -.-> GF5

    classDef seq fill:#0f172a,stroke:#39ff14,stroke-width:2px,color:#39ff14
    classDef transversal fill:#1a1a2e,stroke:#ddff00,stroke-width:2px,color:#ddff00

    class GF1,GF2,GF3,GF5 seq
    class GF4,GF6 transversal
```

| # | Garde-fou | Phase | Ce qu'il garantit |
|---|-----------|-------|-------------------|
| **GF-1** | **Validation humaine de l'inventaire : on implémente ce qu'on valide** | Phase 1 | Le client/PO confirme que 100% des features, rôles et flux métier sont capturés. Rien n'est implémenté sans avoir été validé. |
| **GF-2** | **Spec en 12 sections depuis le legacy** | Phase 3 | Chaque feature est spécifiée à partir du code legacy. Les scénarios utilisateur et critères d'acceptation reflètent le comportement existant. |
| **GF-3** | **TDD — Test First** | Phase 3 | Chaque scénario de la spec devient un test **avant** le code. Le test échoue d'abord (red), le code le fait passer (green). Aucun comportement legacy n'est oublié — s'il est dans la spec, il a un test. |
| **GF-4** | **Gouvernance humaine** | Toutes | Architecte obligatoire à chaque phase. Client/PO valide le fonctionnel. STOP automatique si score < 80 après 2 itérations — l'humain reprend la main. |
| **GF-5** | **Conformité fonctionnelle et technique** | Phase 3 | Le conformity-reporter compare le code produit à la spec (dérivée du legacy). Score < 80 = corrections obligatoires. Rapports versionnés (V1, V2, V3). |
| **GF-6** | **Traçabilité complète** | Toutes | Chaque artefact est un fichier versionné. On peut remonter de n'importe quel bout de code à la règle métier legacy qui l'a motivé. |

---

## Le pilotage humain

Les agents Claude automatisent l'exécution, mais les **décisions structurantes restent humaines**. Deux rôles complémentaires interviennent tout au long du processus :

<div class="role-cards">
  <div class="role-card architect">
    <h4>Architecte / Senior</h4>
    <ul>
      <li>Pilote techniquement et <strong>valide chaque phase</strong></li>
      <li>Définit les conventions et la structure cible</li>
      <li>Décide de l'ordre de migration</li>
      <li>Supervise la boucle qualité</li>
      <li>Présence <strong>obligatoire</strong> tout au long du processus</li>
    </ul>
  </div>
  <div class="role-card client">
    <h4>Client / PO / Métier</h4>
    <ul>
      <li>Garantit la <strong>fidélité fonctionnelle</strong></li>
      <li>Valide l'inventaire (features, rôles, flux)</li>
      <li>Priorise les features par valeur métier</li>
      <li>Valide les specs avant implémentation</li>
      <li>Présence <strong>fortement recommandée</strong> (phases 1, 2, 3)</li>
    </ul>
  </div>
</div>

```mermaid
graph TB
    subgraph CLIENT["Client / PO / Métier"]
        C1["Valide le fonctionnel"]
        C2["Priorise les features"]
        C3["Valide les specs"]
    end

    subgraph ARCH["Architecte / Senior"]
        V0["Valide"]
        V1["Valide"]
        V2["Décide"]
        V3["Supervise"]
        V4["Valide"]
    end

    subgraph AGENTS["Agents Claude"]
        A0["Phase 0 — Infrastructure"]
        A1["Phase 1 — Analyse"]
        A2["Phase 2 — Visualisation"]
        A3["Phase 3 — Migration"]
        A4["Phase 4 — Documentation"]
    end

    V0 --> A0
    V1 --> A1
    V2 --> A2
    V3 --> A3
    V4 --> A4
    C1 --> A1
    C2 --> A2
    C3 --> A3

    classDef client fill:#1a1a2e,stroke:#ddff00,stroke-width:2px,color:#ddff00
    classDef arch fill:#0d3b3b,stroke:#39ff14,stroke-width:2px,color:#39ff14
    classDef agent fill:#0f172a,stroke:#64748b,stroke-width:2px,color:#f1f5f9

    class C1,C2,C3 client
    class V0,V1,V2,V3,V4 arch
    class A0,A1,A2,A3,A4 agent
```

| Phase | Architecte / Senior | Client / PO / Métier |
|-------|--------------------|--------------------|
| **Phase 0 — Infrastructure** | Définit les conventions, valide la structure `.claude/`, choisit les technologies cibles | — |
| **Phase 1 — Analyse** | Relit le rapport technique, corrige les erreurs d'interprétation | **Valide l'inventaire fonctionnel** : vérifie que toutes les features, rôles et flux métier sont présents. Signale les oublis ou les règles implicites que l'IA ne peut pas déduire du code |
| **Phase 2 — Visualisation** | Décide de l'**ordre de migration** en fonction des dépendances techniques | **Priorise les features** selon la valeur métier. Arbitre avec l'architecte sur l'ordre final |
| **Phase 3 — Migration** | Approuve le plan de tâches, supervise la boucle qualité, intervient si score < 80 après 2 itérations | **Valide les specs** (12 sections) : vérifie les règles métier, les scénarios utilisateur et les critères d'acceptation avant l'implémentation |
| **Phase 4 — Documentation** | Relit et valide la documentation technique | Valide la documentation fonctionnelle |

:::warning Présence obligatoire
La présence d'un architecte ou senior est **obligatoire** tout au long du processus. La participation du client / PO est **fortement recommandée** aux phases 1, 2 et 3 — c'est le moment de détecter les oublis et d'ajuster avant que le code ne soit écrit. Les agents sont des outils d'exécution, pas des décideurs. L'humain garde le contrôle sur :
- Les choix d'architecture et les priorités de migration
- La validation fonctionnelle (complétude des features, règles métier)
- Les arbitrages qualité/délai/périmètre
:::

---

## Vue d'ensemble : 5 phases

```mermaid
graph LR
    P0["Phase 0 — Infrastructure"]
    P1["Phase 1 — Analyse"]
    P2["Phase 2 — Visualisation"]
    P3["Phase 3 — Migration x N"]
    P4["Phase 4 — Documentation"]

    P0 --> P1 --> P2 --> P3 --> P4

    P0 -.-> P4
    P1 -.-> P4
    P2 -.-> P4
    P3 -.-> P4

    classDef phase fill:#0f172a,stroke:#39ff14,stroke-width:2px,color:#39ff14
    classDef doc fill:#0d3b3b,stroke:#ddff00,stroke-width:2px,color:#ddff00

    class P0,P1,P2,P3 phase
    class P4 doc
```

---

## Phase 0 : Construire l'infrastructure

Avant de toucher au code, on construit l'**écosystème déclaratif** qui pilotera tous les agents.

```mermaid
graph TB
    CM["CLAUDE.md — Source de vérité"]

    CM --> AG["12 agents"]
    CM --> SK["11 skills"]
    CM --> RU["7 rules"]
    CM --> CO["5 commandes"]
    CM --> SE["settings.json"]

    classDef source fill:#0d3b3b,stroke:#39ff14,stroke-width:2px,color:#39ff14
    classDef item fill:#1a1a2e,stroke:#ddff00,stroke-width:2px,color:#ddff00
    class CM source
    class AG,SK,RU,CO,SE item
```

:::info Ce qu'on pose comme fondations
- **CLAUDE.md** centralise tous les chemins — un seul endroit à modifier
- **Rules** protègent le legacy en lecture seule (double couche : rule + deny)
- **Skills** portent les conventions — les agents les héritent automatiquement
- **Settings** autorisent Docker et git sans confirmation
:::

<div class="validation-checkpoint">
<strong>Validation architecte</strong> — L'architecte définit les conventions cibles, valide la structure <code>.claude/</code> et les permissions avant de lancer la phase suivante.
</div>

---

## Phase 1 : Comprendre le legacy

On lance une seule commande. Trois agents se relaient :

```mermaid
graph LR
    CMD["/analyze-legacy"]
    T["Analyse technique — Opus"]
    F["Inventaire fonctionnel — Sonnet"]
    A["Audit — Haiku"]
    OUT["Legacy compris"]

    CMD --> T
    T -->|rapport_technique.md| F
    F -->|inventaire.md| A
    A -->|inventaire enrichi| OUT

    classDef cmd fill:#0d3b3b,stroke:#39ff14,stroke-width:2px,color:#39ff14
    classDef opus fill:#1a1a2e,stroke:#ddff00,stroke-width:2px,color:#ddff00
    classDef sonnet fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#93c5fd
    classDef haiku fill:#0f172a,stroke:#64748b,stroke-width:2px,color:#94a3b8
    classDef done fill:#0d3b3b,stroke:#39ff14,stroke-width:3px,color:#39ff14

    class CMD cmd
    class T opus
    class F sonnet
    class A haiku
    class OUT done
```

| Agent | Modèle | Rôle | Pourquoi ce modèle |
|-------|--------|------|-------------------|
| technical-analyzer | **Opus** | Reverse engineering du code brut | Code non documenté, architecture implicite |
| functional-analyzer | **Sonnet** | Inventaire features/rôles/flux | Lit le rapport technique, pas du code brut |
| functional-auditor | **Haiku** | Vérifie la complétude | Simple comparaison, pas de raisonnement |

**Artefacts produits :**

```
output/technique/
├── rapport_technique.md      → Architecture, DB, dépendances
├── inventaire_fonctionnel.md → Features, rôles, flux métier
└── arbre_fonctionnel.md      → Hiérarchie parent-enfant
```

<div class="validation-checkpoint with-client">
<strong>Validation architecte + client</strong> — L'architecte relit le rapport technique et corrige les erreurs d'interprétation. Le client / PO valide l'inventaire fonctionnel — c'est le moment clé pour détecter les features oubliées, les rôles manquants ou les règles métier implicites que l'IA n'a pas pu déduire du code. Ces ajustements sont <strong>bien moins coûteux ici</strong> qu'après l'implémentation.
</div>

---

## Phase 2 : Visualiser pour décider

L'inventaire est transformé en **visualisations interactives** (HTML standalone avec ECharts) :

```mermaid
graph LR
    INV["inventaire.md"]
    VIZ["/generate-visualization"]
    T["Arbre fonctionnel"]
    G["Graphe de dépendances"]
    D["Architecte + Client décident l'ordre"]

    INV --> VIZ
    VIZ --> T
    VIZ --> G
    T --> D
    G --> D

    classDef input fill:#0f172a,stroke:#64748b,stroke-width:2px,color:#f1f5f9
    classDef cmd fill:#0d3b3b,stroke:#39ff14,stroke-width:2px,color:#39ff14
    classDef output fill:#1a1a2e,stroke:#ddff00,stroke-width:2px,color:#ddff00
    classDef decision fill:#1e3a8a,stroke:#39ff14,stroke-width:2px,color:#39ff14

    class INV input
    class VIZ cmd
    class T,G output
    class D decision
```

<div class="validation-checkpoint with-client">
<strong>Décision architecte + client</strong> — L'architecte identifie les <strong>features indépendantes</strong> (pas de dépendances techniques) à migrer en premier. Le client priorise selon la <strong>valeur métier</strong>. Ensemble, ils définissent la roadmap de migration — ce qui garantit que les features les plus critiques pour le business sont livrées en premier.
</div>

---

## Phase 3 : Migrer chaque feature

C'est le coeur du pipeline. Pour chaque feature, on lance :

```bash
/modernization/migrate-feature Search_Engine
```

### Vue d'ensemble des 5 étapes

```mermaid
graph LR
    S["Etape 1 — Spécifier — Opus"]
    P["Etape 2 — Planifier — Sonnet"]
    I["Etape 3 — Implémenter — Sonnet"]
    C["Etape 4 — Evaluer — Sonnet"]
    Q{"Etape 5 — Score >= 80 ?"}
    OK["Feature migrée"]

    S --> P --> I --> C --> Q
    Q -->|Oui| OK
    Q -->|Non| I

    classDef opus fill:#1a1a2e,stroke:#ddff00,stroke-width:2px,color:#ddff00
    classDef sonnet fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#93c5fd
    classDef check fill:#0f172a,stroke:#39ff14,stroke-width:2px,color:#39ff14
    classDef done fill:#0d3b3b,stroke:#39ff14,stroke-width:3px,color:#39ff14

    class S opus
    class P,I,C sonnet
    class Q check
    class OK done
```

---

### Étape 1 — Spécifier (Opus)

L'agent Opus produit une **spec en 12 sections** à partir du code legacy et de l'inventaire fonctionnel.

```mermaid
graph LR
    IN1["Code legacy"]
    IN2["Inventaire fonctionnel"]
    FA["feature-analyzer — Opus"]
    SPEC["Feature_spec.md — 12 sections"]

    IN1 --> FA
    IN2 --> FA
    FA --> SPEC

    classDef input fill:#0f172a,stroke:#64748b,stroke-width:2px,color:#f1f5f9
    classDef opus fill:#1a1a2e,stroke:#ddff00,stroke-width:2px,color:#ddff00
    classDef output fill:#0d3b3b,stroke:#39ff14,stroke-width:2px,color:#39ff14

    class IN1,IN2 input
    class FA opus
    class SPEC output
```

Les 12 sections couvrent **tous les angles** d'une feature :

```
┌─────────────────────────┬─────────────────────────┐
│ 1. Vue d'ensemble       │  7. Gestion d'erreurs   │
│ 2. Référence legacy     │  8. Sécurité            │
│ 3. Scénarios utilisateur│  9. Dépendances         │
│ 4. Interface (UI)       │ 10. Données             │
│ 5. Règles métier        │ 11. Performance         │
│ 6. Validation           │ 12. Critères acceptance │
└─────────────────────────┴─────────────────────────┘
```

<div class="validation-checkpoint with-client">
<strong>Validation architecte + client</strong> — L'architecte vérifie la cohérence technique (dépendances, données, performance). Le client valide les <strong>règles métier, les scénarios utilisateur et les critères d'acceptation</strong> — dernière opportunité de corriger avant la planification. Si nécessaire, l'agent <code>refiner</code> (Sonnet) affine la spec — le fichier corrigé est suffixé <code>-corrected</code>.
</div>

---

### Étape 2 — Planifier (Sonnet)

Deux planners décomposent la spec en **tâches numérotées avec dépendances** :

```mermaid
graph TB
    SPEC["Feature_spec.md"]
    BP["backend-tasks-planner — Sonnet"]
    FP["frontend-tasks-planner — Sonnet"]
    BA["backend_analysis.md"]
    FA["frontend_analysis.md"]

    SPEC --> BP
    SPEC --> FP
    BP --> BA
    FP --> FA

    subgraph TASKS["Exemple de tâches"]
        T1["BACKEND-001 — Créer l'entité"]
        T2["BACKEND-002 — Créer le DTO"]
        T3["FRONTEND-001 — Client HTTP"]
        T4["FRONTEND-002 — Page liste"]
    end

    BA --> T1
    BA --> T2
    FA --> T3
    FA --> T4

    classDef input fill:#0d3b3b,stroke:#39ff14,stroke-width:2px,color:#39ff14
    classDef sonnet fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#93c5fd
    classDef output fill:#1a1a2e,stroke:#ddff00,stroke-width:2px,color:#ddff00
    classDef task fill:#0f172a,stroke:#64748b,stroke-width:2px,color:#f1f5f9

    class SPEC input
    class BP,FP sonnet
    class BA,FA output
    class T1,T2,T3,T4 task
```

Chaque tâche contient :
- Un **ID unique** (BACKEND-001, FRONTEND-002...)
- Ses **dépendances** (quelles tâches doivent être terminées avant)
- Une **référence skill** (ex: `create-entity.md`) pour les conventions
- Des **critères d'acceptation** précis

<div class="validation-checkpoint">
<strong>Validation architecte</strong> — L'architecte approuve le découpage, vérifie les dépendances et l'ordre d'exécution.
</div>

---

### Étape 3 — Implémenter en TDD (Sonnet)

Les executors implémentent chaque tâche en **Test First** :

```mermaid
graph LR
    R["Lire la skill ref"]
    T["Ecrire le test"]
    F["Vérifier test échoue"]
    I["Ecrire le code"]
    P["Vérifier test passe"]
    M["Marquer Processed"]

    R --> T --> F --> I --> P --> M

    classDef step fill:#0f172a,stroke:#39ff14,stroke-width:2px,color:#39ff14
    classDef fail fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fca5a5
    classDef pass fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#86efac

    class R,T,I,M step
    class F fail
    class P pass
```

```mermaid
graph TB
    BA["backend_analysis.md"]
    FA["frontend_analysis.md"]
    BE["backend-executor — Sonnet"]
    FE["frontend-executor — Sonnet"]
    SYM["Backend cible — Code + Tests"]
    FRONT["Frontend cible — Code + Tests"]

    BA --> BE
    FA --> FE
    BE --> SYM
    FE --> FRONT

    classDef input fill:#1a1a2e,stroke:#ddff00,stroke-width:2px,color:#ddff00
    classDef sonnet fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#93c5fd
    classDef output fill:#0d3b3b,stroke:#39ff14,stroke-width:2px,color:#39ff14

    class BA,FA input
    class BE,FE sonnet
    class SYM,FRONT output
```

**Le secret : les skills comme garde-fous.** Les executors ne devinent pas les conventions — ils lisent `create-entity.md`, `create-dto.md`, `create-controller.md`. Cela garantit la cohérence d'une feature à l'autre.

---

### Étape 4 — Évaluer la conformité (Sonnet)

L'agent **score objectivement** le code contre la spec :

```mermaid
graph LR
    SPEC["Feature_spec.md"]
    CODE["Code implémenté"]
    CR["conformity-reporter — Sonnet"]
    REPORT["REPORT-V1.md — Score : XX/100"]

    SPEC --> CR
    CODE --> CR
    CR --> REPORT

    classDef input fill:#0f172a,stroke:#64748b,stroke-width:2px,color:#f1f5f9
    classDef sonnet fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#93c5fd
    classDef output fill:#1a1a2e,stroke:#ddff00,stroke-width:2px,color:#ddff00

    class SPEC,CODE input
    class CR sonnet
    class REPORT output
```

Système de déduction depuis un score initial de 100 :

| Sévérité | Déduction | Exemple concret |
|----------|-----------|-----------------|
| Critique | **-15 pts** | Endpoint manquant dans l'API |
| Haute | **-10 pts** | Pagination non implémentée |
| Moyenne | **-5 pts** | Tri par pertinence absent |
| Basse | **-2 pts** | Nommage non conforme |

Les rapports ne sont **jamais écrasés** — chaque évaluation produit une nouvelle version (V1, V2, V3).

---

### Étape 5 — Boucle qualité (LLM-as-Judge)

Le score détermine la suite :

```mermaid
graph TB
    R["Rapport V1"]
    CHECK{"Score >= 80 ?"}
    OK["Feature terminée"]
    FIX["Extraire non-conformités CRITIQUE + HAUTE"]
    EXEC["Relancer executor avec corrections"]
    R2["Rapport V2"]
    CHECK2{"Score V2 >= 80 ?"}
    STOP["STOP — Architecte intervient"]

    R --> CHECK
    CHECK -->|Oui| OK
    CHECK -->|Non| FIX
    FIX --> EXEC
    EXEC --> R2
    R2 --> CHECK2
    CHECK2 -->|Oui| OK
    CHECK2 -->|Non| STOP

    classDef input fill:#0f172a,stroke:#64748b,stroke-width:2px,color:#f1f5f9
    classDef check fill:#1a1a2e,stroke:#ddff00,stroke-width:2px,color:#ddff00
    classDef ok fill:#0d3b3b,stroke:#39ff14,stroke-width:3px,color:#39ff14
    classDef fix fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#93c5fd
    classDef stop fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fca5a5

    class R,R2 input
    class CHECK,CHECK2 check
    class OK ok
    class FIX,EXEC fix
    class STOP stop
```

:::warning Maximum 2 itérations
Au-delà de 2 itérations, les corrections tendent à dégrader le code plutôt qu'à l'améliorer. L'architecte intervient pour arbitrer.
:::

<div class="validation-checkpoint">
<strong>Validation architecte</strong> — L'architecte supervise la boucle qualité et prend la main si le score reste insuffisant après 2 itérations.
</div>

---

## Phase 4 : Documentation continue

Contrairement à une approche classique où la documentation arrive en fin de projet, la documentation est ici **transversale** : elle peut être générée ou mise à jour à **chaque phase** pour disposer en permanence d'une documentation actualisée.

```mermaid
graph TB
    subgraph PHASES["Chaque phase produit des artefacts"]
        P0["Phase 0 — Infrastructure"]
        P1["Phase 1 — Rapports d'analyse"]
        P2["Phase 2 — Visualisations"]
        P3["Phase 3 — Specs + Rapports"]
    end

    D["documentation-generator — Haiku"]
    V["Site VitePress — toujours à jour"]

    P0 -.-> D
    P1 -.-> D
    P2 -.-> D
    P3 -.-> D
    D --> V

    classDef phase fill:#0f172a,stroke:#39ff14,stroke-width:2px,color:#39ff14
    classDef haiku fill:#0f172a,stroke:#94a3b8,stroke-width:2px,color:#94a3b8
    classDef output fill:#0d3b3b,stroke:#ddff00,stroke-width:3px,color:#ddff00

    class P0,P1,P2,P3 phase
    class D haiku
    class V output
```

:::tip Documentation incrémentale
La commande `/modernization/generate-docs` peut être lancée à **n'importe quel moment** du pipeline. Chaque exécution intègre les derniers artefacts produits (rapports, specs, rapports de conformité). L'équipe dispose ainsi d'une documentation vivante qui reflète l'état réel de la migration.
:::

Haiku suffit car c'est du **Markdown structuré** avec un template clair — pas de raisonnement complexe.

<div class="validation-checkpoint">
<strong>Validation architecte</strong> — L'architecte relit la documentation générée et valide avant publication.
</div>

---

## Comment les agents communiquent

Les agents sont **isolés** — pas de mémoire partagée. Leur seul canal de communication : les **fichiers intermédiaires**.

```mermaid
graph TB
    subgraph P1["Phase 1"]
        LEGACY["Projet legacy"]
        TECH["rapport_technique.md"]
        INV["inventaire.md"]
        LEGACY --> TECH --> INV
    end

    subgraph P3["Phase 3 — par feature"]
        SPEC["Feature_spec.md"]
        BACK["backend_analysis.md"]
        FRONT["frontend_analysis.md"]
        CODE_B["Code backend"]
        CODE_F["Code frontend"]
        REPORT["Feature_REPORT.md"]

        INV --> SPEC
        LEGACY --> SPEC
        SPEC --> BACK
        SPEC --> FRONT
        BACK --> CODE_B
        FRONT --> CODE_F
        CODE_B --> REPORT
        CODE_F --> REPORT
    end

    subgraph P4["Phase 4"]
        DOCS["VitePress"]
        SPEC --> DOCS
        REPORT --> DOCS
    end

    classDef file fill:#0f172a,stroke:#39ff14,stroke-width:2px,color:#39ff14
    classDef code fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#93c5fd
    classDef report fill:#1a1a2e,stroke:#ddff00,stroke-width:2px,color:#ddff00
    classDef output fill:#0d3b3b,stroke:#39ff14,stroke-width:3px,color:#39ff14

    class LEGACY,TECH,INV,SPEC,BACK,FRONT file
    class CODE_B,CODE_F code
    class REPORT report
    class DOCS output
```

**Avantage clé** : chaque étape peut être **rejouée indépendamment**. Si l'implémentation échoue, on relance à l'étape 3 sans refaire l'analyse ni la planification :

```bash
/modernization/migrate-feature Search_Engine stage=3
```

---

## Répartition des modèles

Le principe : **utiliser le modèle le moins cher qui produit la qualité requise**.

<div class="model-distribution">
  <div class="model-bar">
    <div class="model-segment opus" style="flex: 2;">
      <span class="model-label">Opus</span>
      <span class="model-count">2</span>
    </div>
    <div class="model-segment sonnet" style="flex: 7;">
      <span class="model-label">Sonnet</span>
      <span class="model-count">7</span>
    </div>
    <div class="model-segment haiku" style="flex: 3;">
      <span class="model-label">Haiku</span>
      <span class="model-count">3</span>
    </div>
  </div>
  <div class="model-legend">
    <span class="legend-item opus">Opus — analyse profonde</span>
    <span class="legend-item sonnet">Sonnet — implémentation</span>
    <span class="legend-item haiku">Haiku — tâches légères</span>
  </div>
</div>

| Modèle | Quand | Agents |
|--------|-------|--------|
| **Opus** | Code brut non documenté, raisonnement complexe | technical-analyzer, feature-analyzer |
| **Sonnet** | Spec en entrée, patterns définis, TDD | planners, executors, conformity-reporter, refiner, functional-analyzer |
| **Haiku** | Templates clairs, vérifications simples | auditor, documentation-generator, health-check |

---

## Leçons apprises

| Ce qu'on a découvert | Ce qu'on a fait |
|---------------------|----------------|
| Opus est inutile quand l'agent lit un rapport, pas du code | `functional-analyzer` passé d'Opus à Sonnet |
| Les conventions dans les prompts d'agents sont ignorées | Extraites en fichiers `references/` dans les skills |
| Les reviews manuelles varient en qualité | Remplacées par une grille de déduction standardisée |
| L'affinement Haiku reformule sans enrichir | `refiner` passé de Haiku à Sonnet |
| Une rule seule peut être contournée | Double protection : rule + deny dans settings.json |
| Plus de 2 itérations de correction = dégradation | STOP obligatoire + intervention architecte |

---

## Ressources

- [Structure du projet .claude/](/examples/project-structure) — Organisation complète des fichiers
- [Pipeline de migration](/examples/pipeline) — Détail technique de chaque étape
- [Stratégie de modèles](/examples/model-strategy) — Choix Opus/Sonnet/Haiku par agent
