<script setup lang="ts">
// Carte « livrable du cas d'usage » : toute la carte est un lien vers la section exacte du wiki exemple
// (nouvel onglet). L'icône est déduite du chemin de la page ; cible vérifiée par scripts/check-example-links.mjs.
import { computed } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps<{ page: string; title: string; desc?: string }>()
const href = computed(() => withBase(`/exemple-wiki-legacy/${props.page}`))

// Icônes Lucide (contours 24x24)
const icons: Record<string, string> = {
  map: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
  spec: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  inventory: '<path d="M21 12h-8"/><path d="M21 6H8"/><path d="M21 18h-8"/><path d="M3 6v4c0 1.1.9 2 2 2h3"/><path d="M3 10v6c0 1.1.9 2 2 2h3"/>',
  analysis: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  api: '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
  frontend: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  timeline: '<circle cx="12" cy="12" r="3"/><line x1="3" x2="9" y1="12" y2="12"/><line x1="15" x2="21" y1="12" y2="12"/>',
  journal: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  conformity: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  dashboard: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  config: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
  docs: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'
}

const kind = computed(() => {
  const p = props.page.split('#')[0]
  if (p.startsWith('mapping/')) return 'map'
  if (p === 'docs/features/index.html') return 'inventory'
  if (p.startsWith('docs/features/')) return 'spec'
  if (p.startsWith('docs/analyses/')) return 'analysis'
  if (p === 'docs/index.html') return 'docs'
  if (p.startsWith('modernisation/api/')) return 'api'
  if (p.startsWith('modernisation/frontend/')) return 'frontend'
  if (p.startsWith('modernisation/conformity-')) return 'conformity'
  if (p === 'modernisation/changelog.html') return 'journal'
  if (p === 'modernisation/claude-harness.html') return 'config'
  if (p === 'modernisation/index.html') return 'dashboard'
  if (p.startsWith('modernisation/')) return 'timeline'
  return 'docs'
})
</script>

<template>
  <a class="cas-usage-card" :class="`kind-${kind}`" :href="href" target="_blank" rel="noopener">
    <span class="cuc-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="icons[kind]" />
    </span>
    <span class="cuc-text">
      <span class="cuc-title">{{ title }}</span>
      <span v-if="desc" class="cuc-desc">{{ desc }}</span>
    </span>
    <svg class="cuc-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
  </a>
</template>
