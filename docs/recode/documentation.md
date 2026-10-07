<script setup>
import RecodeSteps from '../.vitepress/theme/components/RecodeSteps.vue'
import RecodeSkill from '../.vitepress/theme/components/RecodeSkill.vue'
</script>

# Documentation

**Rendre les analyses de la migration consultables par tous : données de graphes, puis wiki.**

<RecodeSteps lane="doc" />

## Données de graphes {#build-graphs-data}

<RecodeSkill id="build-graphs-data" />

<div class="rc-points rc-doc">

#### Données séparées de l'affichage

- Deux JSON : arbre des features et graphe de dépendances
- Réutilisables par d'autres outils que le wiki

#### Aucune relation inventée

- Chaque lien est traçable dans la cartographie
- Deux types de liens : dépendance et usage d'un transverse

#### Lacunes signalées

- Un module cité sans analyse apparaît dans l'arbre et est listé avec la commande à lancer
- Résumé chiffré en sortie

#### Toujours à jour

- Régénérable à tout moment à partir des analyses

</div>

## Génération du wiki {#generate-docs}

<RecodeSkill id="generate-docs" />

<div class="rc-points rc-doc">

#### Wiki consultable par tous

- Accessible aux non-développeurs, sans lire de markdown

#### Cartographie interactive

- Arbre des features et graphe de dépendances navigables
- Une page par module, y compris ceux cités mais pas encore analysés

#### Tableau de bord de progression

- Avancement de chaque feature : non planifiée, planifiée, en cours, terminée
- Vue partageable de l'avancement de la migration

#### Régénération sans casse

- Au choix : tout régénérer, ou seulement données et pages
- Présentation dans des templates versionnés, hors du prompt

</div>
