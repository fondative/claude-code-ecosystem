---
layout: home
hero:
  name: Claude Code Ecosystem
  text: AI-Driven Modernisation
  tagline: 'Moderniser un projet legacy avec l''IA, étape par étape, sous le contrôle d''un architecte.'
  actions:
    - theme: brand
      text: AI-Driven Modernisation
      link: /guide/methodology
    - theme: alt
      text: Cas d'usage réel (wiki) ↗
      link: /exemple-wiki-legacy/
      target: _blank
      rel: noopener
    - theme: alt
      text: Manuel d'utilisation
      link: /examples/
    - theme: alt
      text: Plugin recode
      link: /recode/
    - theme: alt
      text: Concepts
      link: /concepts/claude-md

features:
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.8 5.4a2 2 0 0 1-1.28 1.28l-5.4 1.8 1.8-5.4a2 2 0 0 1 1.28-1.28z"/></svg>'
    title: "Méthodologie AI-Driven"
    details: "Les phases, les garde-fous et le pilotage humain pour réécrire un legacy vers une stack moderne."
    link: /guide/methodology
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/></svg>'
    title: "Cas d'usage réel (wiki)"
    details: "Le wiki généré pour un vrai projet legacy : analyses, specs, cartographie et suivi de la migration."
    link: /exemple-wiki-legacy/
    target: _blank
    rel: noopener
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>'
    title: "Manuel d'utilisation"
    details: "Structure du projet, pipeline de migration, stratégie de modèles et templates prêts à l'emploi."
    link: /examples/
---

<script setup>
import HomeRecodeFlow from './.vitepress/theme/components/HomeRecodeFlow.vue'
import HomeBricks from './.vitepress/theme/components/HomeBricks.vue'
</script>

<HomeRecodeFlow />

<HomeBricks />
