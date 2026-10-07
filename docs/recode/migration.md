<script setup>
import RecodeSteps from '../.vitepress/theme/components/RecodeSteps.vue'
import RecodeSkill from '../.vitepress/theme/components/RecodeSkill.vue'
</script>

# Migration

**Comprendre un code existant, puis décider module par module comment le réécrire vers la stack cible.**

<RecodeSteps lane="mig" />

## Analyse de l'application {#analyze-app}

<RecodeSkill id="analyze-app" />

<div class="rc-points rc-mig">

#### Vue globale d'abord

- Objectif métier, stack, conventions, intégrations externes exhaustives

#### Modules triés par dépendance

- Modules fonctionnels et transverses distingués
- Du plus indépendant au plus dépendant : un ordre de migration logique

#### Couplage visible

- Interactions entre modules
- Quels modules fonctionnels consomment quels modules transverses

#### Découpage stable

- Chaque module a un identifiant qui sert de référence à toute la suite

</div>

## Analyse d'un module {#analyze-module}

<RecodeSkill id="analyze-module" />

<div class="rc-points rc-mig">

#### Six axes d'analyse

- Features, flux d'exécution, logique métier, interfaces, flux utilisateurs, effets de bord
- Les règles jamais documentées sont retrouvées dans le code

#### Ancrage dans le code

- Chaque affirmation renvoie à un fichier et une ligne : vérifiable, peu d'inventions

#### Surfaces exhaustives

- Endpoints : payload, réponses, erreurs, middlewares
- Pages : gardes d'accès, états visuels (chargement, erreur, vide, succès)
- Effets de bord : base de données, événements, appels tiers

#### Analyses en parallèle

- Les modules sont indépendants : plusieurs analyses en parallèle

</div>

## Plan de migration {#write-migration}

<RecodeSkill id="write-migration" />

<div class="rc-points rc-mig">

#### Delta, pas traduction

- Pour chaque feature : porté, recréé, changé ou supprimé
- La réécriture sert à corriger, pas à reproduire les défauts

#### Baseline référencée

- Ancrages vers l'analyse : une seule source de vérité

#### Mapping vers la stack cible

- Composants et patterns de destination, détectés depuis les projets cibles
- Sans détails fins, laissés au planning

#### Transverse intégré

- Pas de migration transverse séparée : les décisions vivent dans les modules qui les utilisent
- Seuls les transverses réellement consommés sont chargés

#### Décision humaine

- Validation feature par feature avant écriture

</div>
