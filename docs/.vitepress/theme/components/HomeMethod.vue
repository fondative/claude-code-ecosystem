<script setup lang="ts">
// Accueil, section 1 (suite des 4 étapes) : les 3 principes de la méthode + lien vers la méthodologie
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const { lang } = useData()
const en = computed(() => lang.value.startsWith('en'))
const t = computed(() => en.value
  ? {
      title: 'Three principles',
      link: 'Read the full methodology',
      href: '/en/guide/methodology',
      items: [
        { name: 'Humans decide', text: 'The architect and the client validate every key step.' },
        { name: 'Fidelity to the legacy', text: 'The existing behavior is reproduced; any deviation is arbitrated.' },
        { name: 'Everything is traced', text: 'Each step produces a versioned file, reviewed before the next one.' }
      ]
    }
  : {
      title: 'Trois principes',
      link: 'Lire la méthodologie complète',
      href: '/guide/methodology',
      items: [
        { name: "L'humain décide", text: "L'architecte et le client valident chaque étape clé." },
        { name: 'Fidélité au legacy', text: 'On reproduit le comportement existant ; tout écart est arbitré.' },
        { name: 'Tout est tracé', text: 'Chaque étape produit un fichier versionné, relu avant la suivante.' }
      ]
    })
</script>

<template>
  <section class="home-sec home-sec--first">
    <div class="home-sec-head">
      <h2 class="home-title">{{ t.title }}</h2>
      <a class="home-link" :href="withBase(t.href)">{{ t.link }} →</a>
    </div>
    <ul class="hm-list">
      <li v-for="p in t.items" :key="p.name" class="hm-item">
        <strong>{{ p.name }}</strong>
        <span>{{ p.text }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.hm-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
  margin: 0 !important;
  padding: 0 !important;
  list-style: none !important;
}

.hm-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0 !important;
  padding: 14px 16px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--fondative-blue-light);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.hm-item strong {
  font-size: 15px;
  color: var(--vp-c-text-1);
}
</style>
