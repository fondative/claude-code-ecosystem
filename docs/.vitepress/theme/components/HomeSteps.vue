<script setup lang="ts">
import HomeIcon from './HomeIcon.vue'
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

// Bandeau d'accueil : les 4 étapes de la modernisation (affiché sous le hero, voir theme/index.ts)
const { lang } = useData()
const en = computed(() => lang.value.startsWith('en'))

const t = computed(() => en.value
  ? {
      eyebrow: '1 · The method',
      title: 'Modernisation in 4 steps',
      note: 'An architect validates every step.',
      link: 'See the methodology',
      href: '/en/guide/methodology',
      steps: [
        { name: 'Analyse', text: 'Reverse-engineer the legacy: architecture, feature inventory' },
        { name: 'Specify', text: 'One 14-section spec per feature, validated by a human' },
        { name: 'Code with TDD', text: 'Tests first, backend then frontend, on the target stack' },
        { name: 'Verify', text: 'Scored conformity report, 80/100 threshold, quality loop' },
      ],
    }
  : {
      eyebrow: '1 · La méthode',
      title: 'La modernisation en 4 étapes',
      note: 'Un architecte valide chaque étape.',
      link: 'Voir la méthodologie',
      href: '/guide/methodology',
      steps: [
        { name: 'Analyser', text: 'Rétro-ingénierie du legacy : architecture, inventaire des features' },
        { name: 'Spécifier', text: 'Une spec en 14 sections par feature, validée par l\'humain' },
        { name: 'Coder en TDD', text: 'Tests d\'abord, backend puis frontend, sur la stack cible' },
        { name: 'Vérifier', text: 'Rapport de conformité noté, seuil 80/100, boucle qualité' },
      ],
    })
</script>

<template>
  <section class="hs">
    <div class="hs-inner">
    <div class="hs-head">
      <p class="home-eyebrow">{{ t.eyebrow }}</p>
      <div class="home-title-row"><HomeIcon name="method" /><h2 class="hs-title">{{ t.title }}</h2></div>
    </div>
    <ol class="hs-steps">
      <li v-for="(step, i) in t.steps" :key="step.name" class="hs-step">
        <span class="hs-num">{{ i + 1 }}</span>
        <span class="hs-name">{{ step.name }}</span>
        <span class="hs-text">{{ step.text }}</span>
      </li>
    </ol>
    </div>
  </section>
</template>

<style scoped>
/* Même gabarit que la grille de cartes VitePress (.VPFeatures) pour rester aligné */
.hs {
  margin: 8px 0 40px;
  padding: 0 24px;
}

.hs-inner {
  max-width: 1152px;
  margin: 0 auto;
}

@media (min-width: 960px) {
  .hs {
    padding: 0 64px;
  }
}

.hs-head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  margin-bottom: 16px;
}

.hs-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.hs-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--fondative-pink);
  text-decoration: none;
}

.hs-link:hover {
  text-decoration: underline;
}

.hs-steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.hs-step {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 18px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  /* Barre de dégradé Fondative en haut de chaque étape */
  background:
    linear-gradient(90deg, var(--fondative-blue-light), var(--fondative-pink)) top / 100% 3px no-repeat,
    var(--vp-c-bg);
  overflow: visible;
}

/* Flèche entre deux étapes */
.hs-step + .hs-step::before {
  content: '→';
  position: absolute;
  left: -22px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 700;
  color: var(--vp-c-text-3);
}

.hs-num {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--fondative-blue-light), var(--fondative-pink));
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.hs-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.hs-text {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.hs-note {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

@media (max-width: 960px) {
  .hs-steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hs-step:nth-child(3)::before {
    display: none;
  }
}

@media (max-width: 560px) {
  .hs-steps {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }

  .hs-step + .hs-step::before {
    display: block;
    content: '↓';
    left: 50%;
    top: -22px;
    transform: translateX(-50%);
  }
}
</style>
