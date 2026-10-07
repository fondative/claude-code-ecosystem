<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { findSkill } from './recode-data'

// Carte des workflows : colonnes = phases, lignes = workflows.
// Développement et Migration convergent dans le bloc commun Réalisation ; Documentation part de analyze-module.
const phases = ['Comprendre', 'Spécifier', 'Planifier', 'Coder']

const selectedId = ref('explore-need')
const selected = computed(() => findSkill(selectedId.value))
const output = (id: string) => findSkill(id).skill.output
</script>

<template>
  <div class="rw">
    <div class="rw-map">
      <!-- En-têtes de phases -->
      <div class="rw-corner" />
      <div v-for="(phase, i) in phases" :key="phase" class="rw-phase" :style="{ gridColumn: i + 2 }">
        <span class="rw-phase-num">{{ i + 1 }}</span>{{ phase }}
      </div>

      <!-- Développement -->
      <div class="rw-lane-label rc-dev" style="grid-row: 2">Développement</div>
      <div class="rw-cell rw-to-right rc-dev" style="grid-row: 2; grid-column: 2">
        <button v-for="id in ['explore-need']" :key="id" type="button" class="rw-node" :class="{ active: id === selectedId }" :aria-pressed="id === selectedId" @click="selectedId = id">
          <span class="rw-node-id">{{ id }}</span><span class="rw-node-out">{{ output(id) }}</span>
        </button>
      </div>
      <div class="rw-cell rw-to-right rc-dev" style="grid-row: 2; grid-column: 3">
        <button v-for="id in ['write-spec']" :key="id" type="button" class="rw-node" :class="{ active: id === selectedId }" :aria-pressed="id === selectedId" @click="selectedId = id">
          <span class="rw-node-id">{{ id }}</span><span class="rw-node-out">{{ output(id) }}</span>
        </button>
      </div>

      <!-- Migration -->
      <div class="rw-lane-label rc-mig" style="grid-row: 3">Migration</div>
      <div class="rw-cell rw-to-right rw-stack rc-mig" style="grid-row: 3; grid-column: 2">
        <button v-for="id in ['analyze-app', 'analyze-module']" :key="id" type="button" class="rw-node" :class="{ active: id === selectedId }" :aria-pressed="id === selectedId" @click="selectedId = id">
          <span class="rw-node-id">{{ id }}</span><span class="rw-node-out">{{ output(id) }}</span>
        </button>
      </div>
      <div class="rw-cell rw-to-right rc-mig" style="grid-row: 3; grid-column: 3">
        <button v-for="id in ['write-migration']" :key="id" type="button" class="rw-node" :class="{ active: id === selectedId }" :aria-pressed="id === selectedId" @click="selectedId = id">
          <span class="rw-node-id">{{ id }}</span><span class="rw-node-out">{{ output(id) }}</span>
        </button>
      </div>

      <!-- Réalisation : bloc commun aux deux lignes -->
      <div class="rw-merge rc-real" style="grid-row: 2 / 4; grid-column: 4 / 6">
        <div class="rw-merge-title">Réalisation <span>commun aux deux workflows</span></div>
        <div class="rw-merge-flow">
          <button v-for="id in ['plan-tasks', 'implement-tasks']" :key="id" type="button" class="rw-node" :class="{ active: id === selectedId }" :aria-pressed="id === selectedId" @click="selectedId = id">
            <span class="rw-node-id">{{ id }}</span><span class="rw-node-out">{{ output(id) }}</span>
          </button>
        </div>
      </div>

      <!-- Documentation : branche issue de analyze-module -->
      <div class="rw-lane-label rc-doc" style="grid-row: 4">Documentation</div>
      <div class="rw-branch rc-doc" style="grid-row: 4; grid-column: 2 / 6">
        <span class="rw-branch-from">↳ depuis analyze-module</span>
        <button v-for="id in ['build-graphs-data', 'generate-docs']" :key="id" type="button" class="rw-node" :class="{ active: id === selectedId }" :aria-pressed="id === selectedId" @click="selectedId = id">
          <span class="rw-node-id">{{ id }}</span><span class="rw-node-out">{{ output(id) }}</span>
        </button>
      </div>
    </div>

    <!-- Détail du skill sélectionné -->
    <div class="rw-panel" :class="`rc-${selected.lane.key}`" aria-live="polite">
      <div class="rw-panel-head">
        <span class="rw-panel-lane">{{ selected.lane.name }}</span>
        <code class="rw-panel-cmd">/recode:{{ selected.skill.id }}</code>
      </div>
      <div class="rw-panel-io">
        <div><span class="rw-label">Entrée</span>{{ selected.skill.input }}</div>
        <span class="rw-arrow" aria-hidden="true">→</span>
        <div><span class="rw-label">Sortie</span>{{ selected.skill.output }}</div>
      </div>
      <ul>
        <li v-for="p in selected.skill.points" :key="p">{{ p }}</li>
      </ul>
      <a class="rw-more" :href="withBase(selected.lane.page)">Détail du workflow {{ selected.lane.name }} →</a>
    </div>
  </div>
</template>

<style scoped>
.rw {
  margin: 24px 0;
}

.rw-map {
  display: grid;
  grid-template-columns: 120px repeat(4, minmax(0, 1fr));
  column-gap: 30px;
  row-gap: 14px;
}

/* ---- En-têtes de phases ---- */
.rw-phase {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--vp-c-divider);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-2);
}

.rw-phase-num {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--vp-c-text-2);
  color: var(--vp-c-bg);
  font-size: 11px;
}

/* ---- Libellés de lignes ---- */
.rw-lane-label {
  grid-column: 1;
  display: flex;
  align-items: center;
  padding-left: 10px;
  border-left: 3px solid var(--c);
  font-size: 14px;
  font-weight: 700;
  color: var(--c);
}

/* ---- Cellules et flèches ---- */
.rw-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 22px;
}

.rw-to-right::after {
  content: '→';
  position: absolute;
  right: -22px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 700;
  color: var(--vp-c-text-3);
}

/* analyze-app ↓ analyze-module dans la même phase */
.rw-stack .rw-node + .rw-node::before {
  content: '↓';
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 700;
  color: var(--vp-c-text-3);
}

/* ---- Nœuds ---- */
.rw-node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--c);
  border-radius: 0 8px 8px 0;
  background: var(--vp-c-bg);
  text-align: left;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s, background-color 0.15s;
}

.rw-node:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
}

.rw-node.active {
  background: var(--c-soft);
  box-shadow: 0 0 0 2px var(--c);
}

.rw-node:focus-visible {
  outline: 2px solid var(--c);
  outline-offset: 2px;
}

.rw-node-id {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--c);
}

.rw-node-out {
  font-size: 12px;
  line-height: 1.35;
  color: var(--vp-c-text-2);
}

/* ---- Bloc commun Réalisation ---- */
.rw-merge {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 12px;
  padding: 14px;
  border: 1px dashed var(--c);
  border-radius: 10px;
  background: var(--c-soft);
}

.rw-merge-title,
.rw-branch-from {
  font-size: 12px;
  font-weight: 700;
  color: var(--c);
}

.rw-merge-title span {
  margin-left: 6px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.rw-merge-flow {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  gap: 30px;
}

.rw-merge-flow .rw-node + .rw-node::before,
.rw-branch .rw-node + .rw-node::before {
  content: '→';
  position: absolute;
  left: -22px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 700;
  color: var(--vp-c-text-3);
}

/* ---- Branche Documentation ---- */
.rw-branch {
  display: grid;
  grid-template-columns: max-content repeat(2, minmax(0, 240px));
  justify-content: start;
  align-items: center;
  gap: 30px;
  margin-top: 6px;
  padding-top: 14px;
  border-top: 1px dashed var(--vp-c-divider);
}

.rw-lane-label.rc-doc {
  margin-top: 6px;
}

/* ---- Panneau de détail ---- */
.rw-panel {
  margin-top: 28px;
  padding: 16px 20px;
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--c);
  border-radius: 0 10px 10px 0;
  background: var(--recode-surface);
}

.rw-panel-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.rw-panel-lane {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--c);
}

.vp-doc .rw-panel-cmd {
  font-size: 14px;
  font-weight: 700;
  color: var(--c);
  background: var(--vp-c-bg);
}

.rw-panel-io {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin: 14px 0 4px;
  font-size: 14px;
  font-weight: 600;
}

.rw-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
}

.rw-arrow {
  color: var(--vp-c-text-3);
}

.rw-panel ul {
  margin: 10px 0 12px;
  padding-left: 20px;
}

.rw-panel li {
  margin: 6px 0;
  font-size: 14px;
}

.rw-panel li::marker {
  color: var(--c);
}

.rw-more {
  font-size: 14px;
  font-weight: 600;
  color: var(--c) !important;
  text-decoration: none !important;
}

.rw-more:hover {
  text-decoration: underline !important;
}

/* ---- Mobile : une colonne, dans l'ordre de lecture ---- */
@media (max-width: 768px) {
  .rw-map {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .rw-corner,
  .rw-phase,
  .rw-to-right::after,
  .rw-stack .rw-node + .rw-node::before,
  .rw-merge-flow .rw-node + .rw-node::before,
  .rw-branch .rw-node + .rw-node::before {
    display: none;
  }

  .rw-lane-label {
    margin-top: 12px;
  }

  .rw-stack,
  .rw-merge-flow,
  .rw-branch {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
}
</style>
