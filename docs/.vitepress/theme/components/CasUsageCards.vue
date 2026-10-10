<script setup lang="ts">
// Bloc « Dans le cas d'usage » : étiquette + grille de <CasUsageCard>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const label = computed(() => (lang.value.startsWith('en') ? 'In the use case' : "Dans le cas d'usage"))
</script>

<template>
  <section class="cas-usage-cards">
    <p class="cuc-eyebrow">{{ label }}</p>
    <div class="cuc-grid"><slot /></div>
  </section>
</template>
