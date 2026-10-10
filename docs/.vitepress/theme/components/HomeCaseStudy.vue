<script setup lang="ts">
import HomeIcon from './HomeIcon.vue'
// Accueil, section 3 : la méthode appliquée à un vrai projet. Les cartes (<CasUsageCard>) sont passées
// dans le slot depuis index.md, pour que scripts/check-example-links.mjs vérifie leurs cibles.
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const { lang } = useData()
const en = computed(() => lang.value.startsWith('en'))
const t = computed(() => en.value
  ? {
      eyebrow: '3 · Proof',
      title: 'The method applied to a real project',
      desc: 'The Classified Ads legacy project, modernised with the method: every deliverable can be browsed.',
      link: 'Understand the pipeline behind this project',
      href: '/en/examples/'
    }
  : {
      eyebrow: '3 · La preuve',
      title: 'La méthode appliquée à un vrai projet',
      desc: 'Le projet legacy Classified Ads, modernisé avec la méthode : chaque livrable est consultable.',
      link: 'Comprendre le pipeline derrière ce projet',
      href: '/examples/'
    })
</script>

<template>
  <section class="home-sec">
    <div class="home-sec-head">
      <div>
        <p class="home-eyebrow">{{ t.eyebrow }}</p>
        <div class="home-title-row"><HomeIcon name="proof" /><h2 class="home-title">{{ t.title }}</h2></div>
        <p class="home-desc">{{ t.desc }}</p>
      </div>
      <a class="home-link" :href="withBase(t.href)">{{ t.link }} →</a>
    </div>
    <slot />
  </section>
</template>
