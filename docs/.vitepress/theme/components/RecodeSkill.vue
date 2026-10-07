<script setup lang="ts">
import { computed } from 'vue'
import { findSkill } from './recode-data'

// Bandeau sous le titre d'une section : commande du skill, entrée → sortie
const props = defineProps<{ id: string }>()
const found = computed(() => findSkill(props.id))
</script>

<template>
  <div class="rk" :class="`rc-${found.lane.key}`">
    <code class="rk-cmd">/recode:{{ found.skill.id }}</code>
    <div class="rk-io">
      <span><span class="rk-label">Entrée</span>{{ found.skill.input }}</span>
      <span class="rk-arrow" aria-hidden="true">→</span>
      <span><span class="rk-label">Sortie</span>{{ found.skill.output }}</span>
    </div>
  </div>
</template>

<style scoped>
.rk {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 20px;
  margin: 12px 0 4px;
  padding: 10px 14px;
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--c);
  border-radius: 0 8px 8px 0;
  background: var(--recode-surface);
}

.vp-doc .rk-cmd {
  font-size: 13px;
  font-weight: 700;
  color: var(--c);
  background: var(--vp-c-bg);
}

.rk-io {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 12px;
  font-size: 14px;
  font-weight: 600;
}

.rk-label {
  margin-right: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
}

.rk-arrow {
  color: var(--vp-c-text-3);
}
</style>
