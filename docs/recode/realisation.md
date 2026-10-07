<script setup>
import RecodeSteps from '../.vitepress/theme/components/RecodeSteps.vue'
import RecodeSkill from '../.vitepress/theme/components/RecodeSkill.vue'
</script>

# Réalisation

**Commun aux deux workflows : découper une source validée en tâches testables, puis les coder en TDD.**

<RecodeSteps lane="real" />

## Planification {#plan-tasks}

<RecodeSkill id="plan-tasks" />

<div class="rc-points rc-real">

#### Guide de code ciblé

- Un index aiguille vers les bons fichiers grâce à des scopes : seules les règles utiles à la feature sont chargées
- Règles universelles toujours présentes, scopes `test-*` séparés des scopes de code
- Sélection affichée avant le découpage : l'utilisateur peut la challenger
- Fonctionne sans index ou sans guide, en mode dégradé signalé

#### Règles citées, vérifiables

- Chaque règle a un identifiant stable, repris tel quel dans les tâches
- Un identifiant inexistant est une erreur : la conformité est vérifiable
- L'en-tête du plan liste les fichiers chargés et la raison de leur chargement

#### Découpage par comportement

- Une tâche regroupe ce qui bouge et se teste ensemble, et livre un comportement observable
- Six anti-patterns refusés : découpage par couche, tâche en attente, méga-tâche, couplage artificiel, cycle de dépendances, une tâche par fichier
- Chaque tâche se comprend, se valide et se livre seule

#### Stratégie adaptée au contexte

- Nouvelle feature : squelette de bout en bout d'abord, puis enrichissement
- Migration : big bang par sous-domaine fonctionnel, nettoyage final inclus
- Back + front : une tâche par cible, couplées par une dépendance explicite

#### Ordre par risque

- Dépendances respectées, y compris entre dépôts
- Incertitude élevée et fort impact en premier : un échec se découvre tôt, pas après 80 % du travail

#### Tâches prêtes pour le TDD

- Fichiers touchés avec leur rôle, contrats et données de test si nécessaire
- Un critère d'acceptation = un comportement observable = un test
- Assez précises pour écrire les tests sans relire la spécification

#### Détection de dérive

- La version de la source est mémorisée dans le plan
- Un changement en amont est repéré avant d'implémenter

</div>

## Génération de code {#implement-tasks}

<RecodeSkill id="implement-tasks" />

<div class="rc-points rc-real">

#### Test d'abord

- Les tests découlent des critères d'acceptation
- Ils doivent échouer pour la bonne raison avant d'écrire le code : on prouve qu'ils mesurent le comportement attendu
- Code minimal, puis refactor sous la protection de la suite complète

#### Review avant chaque commit

- Contrôle qualité systématique, sans attendre une revue externe
- Grille fixe : conformité à la tâche, qualité, tests, respect du guide, hygiène
- Trois niveaux de sévérité, verdict binaire, problèmes ancrés dans le code avec cause et correctif

#### Guide adapté à chaque étape

- Chargé une seule fois, consulté avec un focus différent
- Tests : règles de test ; code : règles de code ; review : tout

#### Granularité ajustable

- Un doute sur la taille d'une tâche déclenche un sous-découpage proposé à l'utilisateur
- Chaque sous-tâche garde son propre cycle et son propre commit

#### Historique propre et retour arrière

- Un commit par tâche : annulation fine pendant le travail
- Regroupement final en un commit par feature et par dépôt
- Back + front : deux dépôts traités indépendamment

#### Reprise sans perte

- Suivi à jour à chaque étape : reprise à la première tâche non terminée
- Dérive plan ↔ source signalée avant de commencer
- Une feature close demande confirmation avant toute reprise

</div>
