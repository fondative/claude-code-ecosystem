<script setup lang="ts">
import HomeIcon from './HomeIcon.vue'
// Accueil, section 4 : un parcours de lecture numéroté par rôle de modernisation
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const { lang } = useData()
const en = computed(() => lang.value.startsWith('en'))
const p = computed(() => (en.value ? '/en' : ''))
type Step = { label: string; link: string; external?: boolean }
type Role = { key: string; name: string; tagline: string; steps: Step[] }

const t = computed<{ eyebrow: string; title: string; desc: string; roles: Role[] }>(() => {
  const m = `${p.value}/guide/methodology`
  const example: Step = { label: en.value ? 'Real use case' : "Cas d'usage réel", link: '/exemple-wiki-legacy/', external: true }
  return en.value
    ? {
        eyebrow: '4 · Your role',
        title: 'Your role in the modernisation',
        desc: 'A numbered reading path for each role, so nothing is missed.',
        roles: [
          { key: 'archi', name: 'Architect', tagline: 'Guardian of the method and the technical choices', steps: [
            { label: 'Methodology', link: m },
            { label: 'Guardrails', link: `${m}#guardrails-ensuring-functional-conformity` },
            { label: 'Golden rules', link: '/en/guide/best-practices' },
            example ] },
          { key: 'po', name: 'Project lead / PO', tagline: 'Decides on scope, priorities and deviations', steps: [
            { label: 'Human oversight', link: `${m}#human-oversight` },
            { label: 'The wiki as the steering dashboard', link: `${m}#wiki-steering` },
            { label: 'The 14 spec sections', link: `${m}#spec-sections` },
            example ] },
          { key: 'dev', name: 'Developer', tagline: 'Applies the method day to day', steps: [
            { label: 'The recode plugin (in French)', link: '/recode/' },
            { label: 'User manual', link: '/en/examples/' },
            { label: 'Golden rules', link: '/en/guide/best-practices' },
            { label: 'Pitfall catalog', link: '/en/guide/warns' } ] }
        ]
      }
    : {
        eyebrow: '4 · Votre rôle',
        title: 'Votre rôle dans la modernisation',
        desc: 'Un parcours de lecture numéroté par rôle, pour ne rien rater.',
        roles: [
          { key: 'archi', name: 'Architecte', tagline: 'Garant de la méthode et des choix techniques', steps: [
            { label: 'Méthodologie', link: m },
            { label: 'Garde-fous', link: `${m}#garde-fous-garantir-la-conformite-fonctionnelle` },
            { label: "Règles d'or", link: '/guide/best-practices' },
            example ] },
          { key: 'po', name: 'Chef de projet / PO', tagline: 'Décide du périmètre, des priorités et des écarts', steps: [
            { label: 'Le pilotage humain', link: `${m}#le-pilotage-humain` },
            { label: 'Le wiki, tableau de bord', link: `${m}#wiki-pilotage` },
            { label: 'Les 14 sections de la spec', link: `${m}#sections-de-la-spec` },
            example ] },
          { key: 'dev', name: 'Développeur', tagline: 'Applique la méthode au quotidien', steps: [
            { label: 'Le plugin recode', link: '/recode/' },
            { label: "Manuel d'utilisation", link: '/examples/' },
            { label: "Règles d'or", link: '/guide/best-practices' },
            { label: 'Catalogue des pièges', link: '/guide/warns' } ] }
        ]
      }
})
</script>

<template>
  <section class="home-sec">
    <div class="home-sec-head">
      <div>
        <p class="home-eyebrow">{{ t.eyebrow }}</p>
        <div class="home-title-row"><HomeIcon name="roles" /><h2 class="home-title">{{ t.title }}</h2></div>
        <p class="home-desc">{{ t.desc }}</p>
      </div>
    </div>
    <div class="hro-grid">
      <div v-for="r in t.roles" :key="r.key" class="hro-card" :class="`hro-${r.key}`">
        <p class="hro-name">{{ r.name }}</p>
        <p class="hro-tagline">{{ r.tagline }}</p>
        <ol class="hro-steps">
          <li v-for="(s, i) in r.steps" :key="s.label">
            <span class="hro-num">{{ i + 1 }}</span>
            <a :href="withBase(s.link)" v-bind="s.external ? { target: '_blank', rel: 'noopener' } : {}">{{ s.label }}<template v-if="s.external"> ↗</template></a>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hro-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.hro-card {
  padding: 18px 18px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background:
    linear-gradient(90deg, var(--fondative-blue-light), var(--fondative-pink)) top / 100% 3px no-repeat,
    var(--vp-c-bg);
}

.hro-name {
  margin: 0 !important;
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.hro-tagline {
  margin: 2px 0 12px !important;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.hro-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 !important;
  padding: 0 !important;
  list-style: none !important;
}

.hro-steps li {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 !important;
  font-size: 14px;
}

.hro-num {
  flex: none;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--fondative-blue-light), var(--fondative-pink));
}

.hro-steps a {
  font-weight: 600;
  text-decoration: none;
}

.hro-steps a:hover {
  text-decoration: underline;
}
</style>
