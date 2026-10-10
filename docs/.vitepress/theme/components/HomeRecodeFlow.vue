<script setup lang="ts">
import { withBase } from 'vitepress'
import { lanes } from './recode-data'

// Accueil : le flux du plugin recode — deux entrées (Développement, Migration) qui convergent
// vers la Réalisation, puis le résultat (code livré) et la branche Documentation
const lane = (key: string) => lanes.find((l) => l.key === key)!
const entries = [lane('dev'), lane('mig')]
const real = lane('real')
const doc = lane('doc')
</script>

<template>
  <section class="hr">
    <div class="hr-head">
      <div class="hr-head-main">
        <p class="home-eyebrow">2 · L'outil recommandé</p>
        <div class="hr-intro">
          <span class="hr-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M15.39 4.39a1 1 0 0 0 1.68-.47 2.5 2.5 0 1 1 3.01 3.01 1 1 0 0 0-.47 1.68l1.68 1.68a2.4 2.4 0 0 1 0 3.42l-1.68 1.68a1 1 0 0 1-1.68-.47 2.5 2.5 0 1 0-3.01 3.01 1 1 0 0 1 .47 1.68l-1.68 1.68a2.4 2.4 0 0 1-3.42 0l-1.68-1.68a1 1 0 0 0-1.68.47 2.5 2.5 0 1 1-3.01-3.01 1 1 0 0 0 .47-1.68l-1.68-1.68a2.4 2.4 0 0 1 0-3.42l1.68-1.68a1 1 0 0 1 1.68.47 2.5 2.5 0 1 0 3.01-3.01 1 1 0 0 1-.47-1.68l1.68-1.68a2.4 2.4 0 0 1 3.42 0z"/></svg>
          </span>
          <h2 class="hr-title">recode : la méthode, prête à l'emploi</h2>
        </div>
        <p class="hr-desc">Le plugin Claude Code qui applique la méthode, du besoin ou du legacy jusqu'au code livré. On l'installe une fois ; chaque étape est lancée et validée par vous.</p>
      </div>
      <a class="hr-link" :href="withBase('/recode/')">Découvrir recode →</a>
    </div>

    <div class="hr-flow">
      <!-- Entrées -->
      <div class="hr-col">
        <span class="hr-col-label">Point de départ</span>
        <a v-for="l in entries" :key="l.key" class="hr-lane" :class="`rc-${l.key}`" :href="withBase(l.page)">
          <span class="hr-lane-name">{{ l.name }}</span>
          <span class="hr-lane-tagline">{{ l.tagline }}</span>
          <span class="hr-chips">
            <code v-for="s in l.skills" :key="s.id">{{ s.id }}</code>
          </span>
        </a>
      </div>

      <span class="hr-arrow" aria-hidden="true">→</span>

      <!-- Convergence -->
      <div class="hr-col">
        <span class="hr-col-label">Commun aux deux</span>
        <a class="hr-lane hr-merge rc-real" :href="withBase(real.page)">
          <span class="hr-lane-name">{{ real.name }}</span>
          <span class="hr-lane-tagline">{{ real.tagline }}</span>
          <span class="hr-steps">
            <span v-for="(s, i) in real.skills" :key="s.id" class="hr-step">
              <code>{{ s.id }}</code>
              <span>{{ s.output }}</span>
              <span v-if="i < real.skills.length - 1" class="hr-down" aria-hidden="true">↓</span>
            </span>
          </span>
        </a>
      </div>

      <span class="hr-arrow" aria-hidden="true">→</span>

      <!-- Résultat -->
      <div class="hr-col">
        <span class="hr-col-label">Résultat</span>
        <div class="hr-result">
          <span class="hr-check" aria-hidden="true">✓</span>
          <span>
            <span class="hr-lane-name">Code livré</span>
            <span class="hr-lane-tagline">Testé, revu, un commit par tâche</span>
          </span>
        </div>
        <a class="hr-lane rc-doc" :href="withBase(doc.page)">
          <span class="hr-lane-name">{{ doc.name }}</span>
          <span class="hr-lane-tagline">{{ doc.tagline }}</span>
          <span class="hr-chips">
            <code v-for="s in doc.skills" :key="s.id">{{ s.id }}</code>
          </span>
        </a>
      </div>
    </div>

    <p class="hr-note">Chaque skill s'invoque explicitement et produit un fichier validé par l'humain avant l'étape suivante.</p>
  </section>
</template>

<style scoped>
.hr {
  margin: 56px 0 0;
  padding-top: 40px;
  border-top: 1px solid var(--vp-c-divider);
}

.hr-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin-bottom: 24px;
}

.hr-intro {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.hr-head-main {
  flex: 1 1 520px;
}

.hr-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--recode-surface);
  border: 1px solid var(--vp-c-divider);
  color: var(--fondative-blue-light);
}

.dark .hr-icon {
  color: #8ab4ff;
}

.hr-icon svg {
  width: 22px;
  height: 22px;
}

.vp-doc .hr-desc {
  margin: 10px 0 0;
  font-size: 15px;
  color: var(--vp-c-text-2);
}

.vp-doc .hr-eyebrow a {
  color: inherit;
  text-decoration: none;
}

.vp-doc .hr-eyebrow {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fondative-pink);
}

.vp-doc .hr-title {
  margin: 0;
  padding: 0;
  border: none;
  font-size: 22px;
}

.vp-doc .hr-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--fondative-pink);
  text-decoration: none;
}

.vp-doc .hr-link:hover {
  text-decoration: underline;
}

.hr-flow {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: stretch;
  gap: 14px;
}

.hr-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hr-col-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.hr-arrow {
  align-self: center;
  font-size: 22px;
  font-weight: 700;
  color: var(--vp-c-text-3);
}

.vp-doc a.hr-lane {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--c);
  border-radius: 0 10px 10px 0;
  background: var(--recode-surface);
  color: inherit;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.vp-doc a.hr-lane:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.hr-merge {
  flex: 1;
}

.hr-lane-name {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--c, var(--vp-c-text-1));
}

.hr-lane-tagline {
  display: block;
  font-size: 13px;
  line-height: 1.45;
  color: var(--vp-c-text-2);
}

.hr-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.vp-doc .hr-chips code,
.vp-doc .hr-step code {
  font-size: 12px;
  color: var(--c);
  background: var(--vp-c-bg);
}

.hr-steps {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.hr-step {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.hr-down {
  align-self: center;
  margin: 2px 0;
  font-weight: 700;
  color: var(--vp-c-text-3);
}

.hr-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--recode-surface);
}

.hr-check {
  display: grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--fondative-blue-light), var(--fondative-pink));
  color: #fff;
  font-weight: 700;
}

.vp-doc .hr-note {
  margin: 16px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

@media (max-width: 900px) {
  .hr-flow {
    grid-template-columns: minmax(0, 1fr);
  }

  .hr-arrow {
    transform: rotate(90deg);
    justify-self: center;
  }
}
</style>
