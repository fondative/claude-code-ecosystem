<script setup>
import RecodeSteps from '../.vitepress/theme/components/RecodeSteps.vue'
import RecodeSkill from '../.vitepress/theme/components/RecodeSkill.vue'
</script>

# Développement

**Transformer un besoin neuf en spécification prête à découper en tâches, en deux étapes validées.**

<RecodeSteps lane="dev" />

## Exploration du besoin {#explore-need}

<RecodeSkill id="explore-need" />

<div class="rc-points rc-dev">

#### Dialogue guidé

- Une question à la fois, à choix multiples quand c'est possible
- Couvre le problème, les contraintes, le succès, les cas limites et les intégrations
- Un besoin trop large est détecté et décomposé avant d'aller plus loin

#### Décision explicite

- 2-3 approches présentées avec leurs compromis et une recommandation
- YAGNI : ce qui n'est pas nécessaire est retiré

#### Features comme fil conducteur

- Chaque feature est une unité livrable et testable indépendamment, ordonnée par priorité
- Les identifiants sont repris par toutes les étapes suivantes

#### Document validé et traçable

- Synthèse validée section par section, puis auto-révision et relecture
- Le brouillon original est recopié tel quel dans le document

</div>

## Spécification {#write-spec}

<RecodeSkill id="write-spec" />

<div class="rc-points rc-dev">

#### Règles métier explicites

- Pour chaque feature : scénario nominal, erreurs, cas limites

#### Niveau technique volontairement haut

- Types de composants et dépendances, sans endpoints ni signatures
- Les détails sont résolus plus tard contre le code réel, donc jamais périmés

#### Existant pris en compte

- Quand du code est touché : baseline ancrée dans le code, puis delta (porté, changé, supprimé)
- Un seul format pour créer ou faire évoluer

#### Spec auto-suffisante

- Permet de découper en tâches sans relire le code en bloc
- Reprend les features du besoin sans les réordonner ni les renuméroter

</div>
