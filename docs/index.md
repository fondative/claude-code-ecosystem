---
layout: home
hero:
  name: AI-Driven Modernisation
  text: Une méthodologie pour moderniser un legacy avec l'IA
  tagline: "Analyser, spécifier, coder et vérifier chaque feature, étape par étape, sous le contrôle d'un architecte."
  actions:
    - theme: brand
      text: Découvrir la méthodologie
      link: /guide/methodology
    - theme: alt
      text: Le plugin recode
      link: /recode/
    - theme: alt
      text: Cas d'usage réel ↗
      link: /exemple-wiki-legacy/
      target: _blank
      rel: noopener
---

<script setup>
import HomeMethod from './.vitepress/theme/components/HomeMethod.vue'
import HomeRecodeFlow from './.vitepress/theme/components/HomeRecodeFlow.vue'
import HomeCaseStudy from './.vitepress/theme/components/HomeCaseStudy.vue'
import HomeRoles from './.vitepress/theme/components/HomeRoles.vue'
import HomeBricks from './.vitepress/theme/components/HomeBricks.vue'
</script>

<HomeMethod />

<HomeRecodeFlow />

<HomeCaseStudy>
<CasUsageCards>
  <CasUsageCard page="modernisation/index.html#modernisation-—-vue-d-ensemble" title="Tableau de bord" desc="Avancement par feature" />
  <CasUsageCard page="mapping/index.html#cartographie-de-la-migration" title="Cartographie" desc="Dépendances, vagues de migration" />
  <CasUsageCard page="docs/features/regions.html#sec-1" title="Spec du module Régions" desc="14 sections tirées du legacy" />
  <CasUsageCard page="docs/features/categories.html#sec-1" title="Spec du module Catégories" desc="Une autre feature, même structure" />
  <CasUsageCard page="modernisation/conformity-categories.html#score-global" title="Rapport de conformité" desc="Score et décision" />
</CasUsageCards>
</HomeCaseStudy>

<HomeRoles />

<HomeBricks />
