<script setup lang="ts">
// Lien vers une page du wiki exemple embarqué (public/exemple-wiki-legacy/), ouvert dans un nouvel onglet.
// Le wiki exemple est un site statique séparé : un lien Markdown n'y mène pas. Cibles vérifiées au build
// par scripts/check-example-links.mjs (page et ancre doivent exister).
import { withBase } from 'vitepress'

const props = defineProps<{ page: string }>()
const href = withBase(`/exemple-wiki-legacy/${props.page}`)
</script>

<template>
  <a class="cas-usage-link" :href="href" target="_blank" rel="noopener"><slot /></a>
</template>
