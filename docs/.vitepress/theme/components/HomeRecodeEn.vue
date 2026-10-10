<script setup lang="ts">
import HomeIcon from './HomeIcon.vue'
// Accueil EN, section 2 : le plugin recode (sa documentation n'existe qu'en français)
import { withBase } from 'vitepress'

const workflows = [
  { name: 'Development', text: 'From a new need to code, on the current stack', link: '/recode/developpement' },
  { name: 'Migration', text: 'From legacy code to a new stack', link: '/recode/migration' },
  { name: 'Delivery', text: 'Testable tasks, then code in TDD', link: '/recode/realisation' },
  { name: 'Documentation', text: 'Generated from the analyses', link: '/recode/documentation' }
]
</script>

<template>
  <section class="home-sec">
    <div class="home-sec-head">
      <div>
        <p class="home-eyebrow">2 · The recommended tool</p>
        <div class="home-title-row"><HomeIcon name="plugin" /><h2 class="home-title">recode: the method, ready to use</h2></div>
        <p class="home-desc">The Claude Code plugin that applies the method, from a need or a legacy codebase to delivered code. Install it once. Each step is launched and followed by a human with the required skills. Its documentation is in French.</p>
      </div>
      <a class="home-link" :href="withBase('/recode/')">Discover recode (FR) →</a>
    </div>
    <div class="hre-grid">
      <a v-for="w in workflows" :key="w.name" class="hre-card" :href="withBase(w.link)">
        <strong>{{ w.name }}</strong>
        <span>{{ w.text }}</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.hre-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.vp-doc a.hre-card,
.hre-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background:
    linear-gradient(90deg, var(--fondative-blue-light), var(--fondative-pink)) top / 100% 3px no-repeat,
    var(--vp-c-bg);
  font-size: 13.5px;
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.hre-card strong {
  font-size: 15px;
  color: var(--vp-c-text-1);
}

.hre-card:hover {
  border-color: var(--fondative-blue-light);
}
</style>
