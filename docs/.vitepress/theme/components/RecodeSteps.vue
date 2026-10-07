<script setup lang="ts">
import { computed } from 'vue'
import { lanes, type Lane } from './recode-data'

// Parcours d'un workflow en tête de sa page : chaque étape renvoie à sa section (#id du skill)
const props = defineProps<{ lane: Lane['key'] }>()
const lane = computed(() => lanes.find((l) => l.key === props.lane)!)
</script>

<template>
  <nav class="rs" :class="`rc-${lane.key}`" :aria-label="`Étapes du workflow ${lane.name}`">
    <div class="rs-edges">
      <span v-if="lane.before">← {{ lane.before }}</span>
      <span>→ {{ lane.after }}</span>
    </div>
    <div class="rs-flow">
      <a v-for="(skill, i) in lane.skills" :key="skill.id" class="rs-step" :href="`#${skill.id}`">
        <span class="rs-num">{{ i + 1 }}</span>
        <span>
          <span class="rs-id">{{ skill.id }}</span>
          <span class="rs-out">{{ skill.output }}</span>
        </span>
      </a>
    </div>
  </nav>
</template>

<style scoped>
.rs {
  margin: 20px 0 8px;
  padding: 12px 16px 14px;
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--c);
  border-radius: 0 10px 10px 0;
  background: var(--recode-surface);
}

.rs-edges {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.rs-flow {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}

.rs-step {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  text-decoration: none !important;
  transition: border-color 0.15s, transform 0.15s;
}

/* Flèche entre deux étapes consécutives */
.rs-step + .rs-step::before {
  content: '→';
  position: absolute;
  left: -21px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 700;
  color: var(--vp-c-text-3);
}

@media (max-width: 640px) {
  .rs-flow {
    grid-template-columns: minmax(0, 1fr);
    gap: 22px;
  }

  .rs-step + .rs-step::before {
    content: '↓';
    left: 50%;
    top: -19px;
    transform: translateX(-50%);
  }
}

.rs-step:hover {
  border-color: var(--c);
  transform: translateY(-1px);
}

.rs-num {
  display: grid;
  place-items: center;
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--c);
  color: var(--vp-c-bg);
  font-size: 12px;
  font-weight: 700;
}

.rs-id {
  display: block;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--c);
}

.rs-out {
  display: block;
  font-size: 12px;
  line-height: 1.35;
  color: var(--vp-c-text-2);
}
</style>
