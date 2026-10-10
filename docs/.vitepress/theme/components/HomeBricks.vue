<script setup lang="ts">
import HomeIcon from './HomeIcon.vue'
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

// Bas de la page d'accueil : les briques Claude Code, regroupées par usage, icônes en trait fin
const { lang } = useData()
const en = computed(() => lang.value.startsWith('en'))

// Icônes 24×24 en trait (style Lucide)
const ICONS: Record<string, string> = {
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>',
  package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  plug: '<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
}

type Brick = { icon: string; title: string; text: string; link: string }
type Group = { label: string; bricks: Brick[] }

const t = computed<{ eyebrow: string; title: string; subtitle: string; groups: Group[] }>(() => {
  const p = en.value ? '/en' : ''
  return en.value
    ? {
        eyebrow: '5 · The tool',
        title: 'Claude Code, the tool behind the method',
        subtitle: 'The building blocks recode and the pipeline rely on: read them to understand or adapt the tooling.',
        groups: [
          { label: 'Get started', bricks: [
            { icon: 'rocket', title: 'Quick Start', text: 'Install Claude Code, set up a first project and run a first command in 5 minutes.', link: `${p}/guide/getting-started` },
          ] },
          { label: 'Configure', bricks: [
            { icon: 'file', title: 'CLAUDE.md', text: 'Persistent project memory: the source of truth for conventions, paths and instructions.', link: `${p}/concepts/claude-md` },
            { icon: 'ruler', title: 'Rules', text: 'Instructions injected automatically based on the files being edited.', link: `${p}/concepts/rules` },
          ] },
          { label: 'Extend', bricks: [
            { icon: 'layers', title: 'Skills', text: 'Reusable knowledge and workflows: passive (conventions) or launchers (pipelines).', link: `${p}/concepts/skills` },
            { icon: 'bot', title: 'Agents', text: 'Specialised Claude instances with their own tools, model and instructions.', link: `${p}/concepts/agents` },
            { icon: 'package', title: 'Plugins', text: 'Portable bundles of skills, agents, hooks and MCP, shared across projects.', link: `${p}/concepts/plugins` },
          ] },
          { label: 'Connect & automate', bricks: [
            { icon: 'zap', title: 'Hooks', text: 'Scripts run before or after Claude actions: validation, security, notifications.', link: `${p}/concepts/hooks` },
            { icon: 'plug', title: 'MCP', text: 'Connect Claude to external tools and data sources through standard servers.', link: `${p}/concepts/mcp` },
          ] },
        ],
      }
    : {
        eyebrow: "5 · L'outil",
        title: "Claude Code, l'outil derrière la méthode",
        subtitle: "Les briques sur lesquelles reposent recode et le pipeline : à lire pour comprendre ou adapter l'outillage.",
        groups: [
          { label: 'Démarrer', bricks: [
            { icon: 'rocket', title: 'Démarrage rapide', text: 'Installer Claude Code, configurer un premier projet et lancer une première commande en 5 minutes.', link: '/guide/getting-started' },
          ] },
          { label: 'Configurer', bricks: [
            { icon: 'file', title: 'CLAUDE.md', text: 'Mémoire persistante du projet : source de vérité pour les conventions, chemins et instructions.', link: '/concepts/claude-md' },
            { icon: 'ruler', title: 'Rules', text: 'Instructions injectées automatiquement selon les fichiers manipulés.', link: '/concepts/rules' },
          ] },
          { label: 'Étendre', bricks: [
            { icon: 'layers', title: 'Skills', text: 'Connaissances et workflows réutilisables : passifs (conventions) ou lanceurs (pipelines).', link: '/concepts/skills' },
            { icon: 'bot', title: 'Agents', text: 'Instances spécialisées de Claude, avec leurs outils, leur modèle et leurs instructions.', link: '/concepts/agents' },
            { icon: 'package', title: 'Plugins', text: 'Paquets portables de skills, agents, hooks et MCP, partagés entre projets.', link: '/concepts/plugins' },
          ] },
          { label: 'Connecter & automatiser', bricks: [
            { icon: 'zap', title: 'Hooks', text: 'Scripts exécutés avant ou après les actions de Claude : validation, sécurité, notifications.', link: '/concepts/hooks' },
            { icon: 'plug', title: 'MCP', text: 'Connecter Claude à des outils et sources de données externes via des serveurs standardisés.', link: '/concepts/mcp' },
          ] },
        ],
      }
})
</script>

<template>
  <section class="hb">
    <p class="home-eyebrow">{{ t.eyebrow }}</p>
    <div class="home-title-row"><HomeIcon name="tool" /><h2 class="hb-title">{{ t.title }}</h2></div>
    <p class="hb-subtitle">{{ t.subtitle }}</p>
    <div class="hb-groups">
      <div v-for="group in t.groups" :key="group.label" class="hb-group">
        <div class="hb-label">{{ group.label }}</div>
        <a v-for="brick in group.bricks" :key="brick.title" class="hb-brick" :href="withBase(brick.link)">
          <svg class="hb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="ICONS[brick.icon]" />
          <span>
            <span class="hb-name">{{ brick.title }}</span>
            <span class="hb-text">{{ brick.text }}</span>
          </span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hb {
  margin: 56px 0 24px;
  padding-top: 40px;
  border-top: 1px solid var(--vp-c-divider);
}

.vp-doc .hb-title {
  margin: 0;
  padding: 0;
  border: none;
  font-size: 22px;
}

.vp-doc .hb-subtitle {
  margin: 6px 0 28px;
  font-size: 15px;
  color: var(--vp-c-text-2);
}

.hb-groups {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 32px;
}

.hb-label {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--vp-c-divider);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.vp-doc a.hb-brick {
  display: flex;
  gap: 12px;
  margin: 0 -10px;
  padding: 10px;
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.vp-doc a.hb-brick:hover {
  background: var(--vp-c-bg-soft);
}

.hb-icon {
  flex: none;
  width: 22px;
  height: 22px;
  margin-top: 2px;
  color: var(--fondative-blue-light);
}

.dark .hb-icon {
  color: #8ab4ff;
}

.vp-doc a.hb-brick:hover .hb-icon {
  color: var(--fondative-pink);
}

.hb-name {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.hb-text {
  display: block;
  margin-top: 2px;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

@media (max-width: 960px) {
  .hb-groups {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .hb-groups {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
