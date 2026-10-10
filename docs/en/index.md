---
layout: home
hero:
  name: AI-Driven Modernisation
  text: A methodology to modernise a legacy system with AI
  tagline: "Analyse, specify, code and verify each feature, step by step, under an architect's control."
  actions:
    - theme: brand
      text: Discover the methodology
      link: /en/guide/methodology
    - theme: alt
      text: The recode plugin (FR)
      link: /recode/
    - theme: alt
      text: Real use case ↗
      link: /exemple-wiki-legacy/
      target: _blank
      rel: noopener
---

<script setup>
import HomeMethod from '../.vitepress/theme/components/HomeMethod.vue'
import HomeRecodeEn from '../.vitepress/theme/components/HomeRecodeEn.vue'
import HomeCaseStudy from '../.vitepress/theme/components/HomeCaseStudy.vue'
import HomeRoles from '../.vitepress/theme/components/HomeRoles.vue'
import HomeBricks from '../.vitepress/theme/components/HomeBricks.vue'
</script>

<HomeMethod />

<HomeRecodeEn />

<HomeCaseStudy>
<CasUsageCards>
  <CasUsageCard page="modernisation/index.html#modernisation-—-vue-d-ensemble" title="Dashboard" desc="Progress per feature" />
  <CasUsageCard page="mapping/index.html#cartographie-de-la-migration" title="Mapping" desc="Dependencies, migration waves" />
  <CasUsageCard page="docs/features/regions.html#sec-1" title="Regions module spec" desc="14 sections drawn from the legacy" />
  <CasUsageCard page="docs/features/categories.html#sec-1" title="Categories module spec" desc="Another feature, same structure" />
  <CasUsageCard page="modernisation/conformity-categories.html#score-global" title="Conformity report" desc="Score and decision" />
</CasUsageCards>
</HomeCaseStudy>

<HomeRoles />

<HomeBricks />
