#!/usr/bin/env node
// Génère la checklist complète de la page Règles d'or
// (docs/guide/best-practices.md et docs/en/guide/best-practices.md)
// à partir des sections « Avant de mettre en service » / « Before going live » des pages Concepts.
// Seul le contenu entre <!-- checklist:start --> et <!-- checklist:end --> est remplacé.
//
// Usage : node scripts/generate-checklist.mjs   (lancé par npm run docs:generate, donc aussi par docs:dev et docs:build)

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DOCS = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs')
const START = '<!-- checklist:start -->'
const END = '<!-- checklist:end -->'

const PAGE_ORDER = ['claude-md', 'settings', 'rules', 'skills', 'agents', 'hooks', 'mcp', 'plugins', 'commands']
const PAGE_NAME = {
  'claude-md': 'CLAUDE.md', settings: 'Settings', rules: 'Rules', skills: 'Skills', agents: 'Agents',
  hooks: 'Hooks', mcp: 'MCP', plugins: 'Plugins', commands: 'Commands'
}

const LANG = {
  fr: { dir: 'concepts', page: 'guide/best-practices.md', prefix: '', section: 'Avant de mettre en service', count: (n) => `${n} points` },
  en: { dir: 'en/concepts', page: 'en/guide/best-practices.md', prefix: '/en', section: 'Before going live', count: (n) => `${n} items` }
}

// Points « - [ ] » de la section « ## Avant de mettre en service » d'une page, liens d'ancre locale réécrits.
// Les sous-titres « ### » de la section sont conservés comme libellés en gras pour garder le contexte de chaque point.
function parsePage(lang, slug) {
  const L = LANG[lang]
  const lines = readFileSync(join(DOCS, L.dir, `${slug}.md`), 'utf8').split('\n')
  const start = lines.findIndex((l) => l.trim() === `## ${L.section}`)
  if (start < 0) throw new Error(`Section « ${L.section} » introuvable dans ${L.dir}/${slug}.md`)
  const localLinks = (text) => text.replace(/\]\(#/g, `](${L.prefix}/concepts/${slug}#`)
  const groups = [] // { label, items }
  let current = { label: null, items: [] }
  let inFence = false
  for (const line of lines.slice(start + 1)) {
    if (/^\s*```/.test(line)) inFence = !inFence
    if (inFence) continue
    if (/^## /.test(line)) break
    const sub = line.match(/^###\s+(.+?)\s*(\{#[^}]*\})?\s*$/)
    if (sub) {
      if (current.items.length) groups.push(current)
      current = { label: localLinks(sub[1]), items: [] }
      continue
    }
    if (/^- \[ \] /.test(line)) current.items.push(localLinks(line))
  }
  if (current.items.length) groups.push(current)
  const count = groups.reduce((n, g) => n + g.items.length, 0)
  if (!count) throw new Error(`Aucun point de checklist dans ${L.dir}/${slug}.md`)
  const text = groups.map((g) => (g.label ? `**${g.label}**\n\n` : '') + g.items.join('\n')).join('\n\n')
  return { count, text }
}

function render(lang) {
  const L = LANG[lang]
  const file = join(DOCS, L.page)
  const src = readFileSync(file, 'utf8')
  const a = src.indexOf(START)
  const b = src.indexOf(END)
  if (a < 0 || b < a) throw new Error(`Marqueurs ${START} / ${END} absents de ${L.page}`)

  let total = 0
  const blocks = PAGE_ORDER.map((slug) => {
    const { count, text } = parsePage(lang, slug)
    total += count
    const url = `${L.prefix}/concepts/${slug}`
    return `### [${PAGE_NAME[slug]}](${url}) · ${L.count(count)}\n\n${text}`
  })

  const out = `${src.slice(0, a + START.length)}\n\n${blocks.join('\n\n')}\n\n${src.slice(b)}`
  writeFileSync(file, out)
  return total
}

for (const lang of Object.keys(LANG)) console.log(`${LANG[lang].page} : ${render(lang)} points de checklist`)
