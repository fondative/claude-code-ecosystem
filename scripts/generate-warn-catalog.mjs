#!/usr/bin/env node
// Génère le catalogue des WARN (docs/guide/warns.md et docs/en/guide/warns.md)
// à partir des sections « Erreurs fréquentes à éviter » des pages Concepts.
// Source de vérité : les pages elles-mêmes (titre, ancre {#warn-NNN}, ligne « Origine »).
// Seule la gravité est définie ici, faute de champ dédié dans les pages.
//
// Usage : node scripts/generate-warn-catalog.mjs   (lancé par npm run docs:generate, donc aussi par docs:dev et docs:build)

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DOCS = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs')

// Gravité de chaque WARN : S = sécurité, F = fiabilité, C = coût & contexte, M = maintenabilité
const SEVERITY = {
  agents: { '001': 'M', '002': 'S', '003': 'C', '004': 'F', '005': 'F', '006': 'F' },
  'claude-md': { '001': 'C', '002': 'M', '003': 'M', '004': 'M', '005': 'S', '006': 'C' },
  commands: { '001': 'F', '002': 'F', '003': 'F', '004': 'M', '005': 'F', '006': 'F', '007': 'F', '008': 'F' },
  hooks: { '001': 'F', '002': 'C', '003': 'F', '004': 'C', '005': 'F', '006': 'F', '007': 'S', '008': 'S' },
  mcp: { '001': 'S', '002': 'S', '003': 'S', '004': 'F', '005': 'M' },
  plugins: { '001': 'M', '002': 'F' },
  rules: { '001': 'F', '002': 'S', '003': 'C', '004': 'C', '005': 'F' },
  settings: { '001': 'S', '002': 'S', '003': 'S', '004': 'S', '005': 'M', '006': 'S', '007': 'S', '008': 'S' },
  skills: { '001': 'C', '002': 'F', '003': 'F', '004': 'M', '005': 'C', '006': 'F' }
}

const PAGE_ORDER = ['claude-md', 'settings', 'rules', 'skills', 'agents', 'hooks', 'mcp', 'plugins', 'commands']
const PAGE_NAME = {
  'claude-md': 'CLAUDE.md', settings: 'Settings', rules: 'Rules', skills: 'Skills', agents: 'Agents',
  hooks: 'Hooks', mcp: 'MCP', plugins: 'Plugins', commands: 'Commands'
}

const LANG = {
  fr: {
    dir: 'concepts', out: 'guide/warns.md', prefix: '',
    originLabel: /^\*Origine\s*:\s*(.*)\*$/,
    severity: { S: 'Sécurité', F: 'Fiabilité', C: 'Coût & contexte', M: 'Maintenabilité' },
    severityHelp: {
      S: 'une protection qui ne protège pas, un secret exposé, une action destructrice possible',
      F: 'un comportement différent de celui attendu, souvent sans message d\'erreur',
      C: 'des tokens, du contexte ou du temps dépensés pour rien',
      M: 'une configuration qui diverge ou devient difficile à faire évoluer'
    },
    livedRe: /vécu/i,
    origin: [
      [/règle du projet|conception du pipeline|de l'équipe/i, '<Icone nom="ruler" /> Règle du projet'],
      [/documentation officielle/i, '<Icone nom="book" /> Doc officielle'],
      [/bonne pratique/i, '<Icone nom="compass" /> Bonne pratique']
    ],
    livedLabel: '<Icone nom="flask" /> Constaté sur le projet',
    header: (n, counts) => `# Catalogue des pièges

::: tip Page générée
Cette page rassemble les **${n} erreurs fréquentes** (WARN) décrites dans les pages [Concepts](/concepts/claude-md). Chaque ligne renvoie au WARN complet, avec le problème, la solution et la source. Elle est générée par \`scripts/generate-warn-catalog.mjs\` : pour la modifier, modifier le WARN dans sa page.
:::

## Comment lire ce catalogue

| Gravité | Signifie | Nombre |
|---------|----------|--------|
${counts}

**Origine** : <Icone nom="flask" /> constaté sur le projet de modernisation (audit, historique git, méthodologie) · <Icone nom="ruler" /> règle du projet · <Icone nom="book" /> documentation officielle · <Icone nom="compass" /> bonne pratique générale.
`,
    cols: '| Piège | Brique | Origine |\n|-------|--------|---------|',
    byBrick: '## Par brique',
    byBrickCols: '| Brique | <Icone nom="shield" /> | <Icone nom="wrench" /> | <Icone nom="coins" /> | <Icone nom="puzzle" /> | Total |\n|--------|----|----|----|----|-------|',
    lived: '## Les pièges constatés sur le projet',
    livedIntro: 'Les pièges qui se sont réellement produits sur le projet de modernisation ou dans ce wiki : ce sont ceux qui ont le plus de chances de vous arriver.'
  },
  en: {
    dir: 'en/concepts', out: 'en/guide/warns.md', prefix: '/en',
    originLabel: /^\*Origin\s*:\s*(.*)\*$/,
    severity: { S: 'Security', F: 'Reliability', C: 'Cost & context', M: 'Maintainability' },
    severityHelp: {
      S: 'a protection that does not protect, an exposed secret, a destructive action left possible',
      F: 'a behavior different from what you expect, often with no error message',
      C: 'tokens, context or time spent for nothing',
      M: 'a configuration that drifts or becomes hard to evolve'
    },
    livedRe: /experienced|lived/i,
    origin: [
      [/project rule|design of this project|the team/i, '<Icone nom="ruler" /> Project rule'],
      [/official doc/i, '<Icone nom="book" /> Official docs'],
      [/good practice/i, '<Icone nom="compass" /> Good practice']
    ],
    livedLabel: '<Icone nom="flask" /> Seen on the project',
    header: (n, counts) => `# Pitfall catalog

::: tip Generated page
This page gathers the **${n} common mistakes** (WARN) described in the [Concepts](/en/concepts/claude-md) pages. Each row links to the full WARN, with the problem, the solution and the source. It is generated by \`scripts/generate-warn-catalog.mjs\`: to change it, change the WARN in its page.
:::

## How to read this catalog

| Severity | Means | Count |
|----------|-------|-------|
${counts}

**Origin**: <Icone nom="flask" /> seen on the modernization project (audit, git history, methodology) · <Icone nom="ruler" /> project rule · <Icone nom="book" /> official documentation · <Icone nom="compass" /> general good practice.
`,
    cols: '| Pitfall | Building block | Origin |\n|---------|----------------|--------|',
    byBrick: '## By building block',
    byBrickCols: '| Building block | <Icone nom="shield" /> | <Icone nom="wrench" /> | <Icone nom="coins" /> | <Icone nom="puzzle" /> | Total |\n|----------------|----|----|----|----|-------|',
    lived: '## Pitfalls seen on the project',
    livedIntro: 'The pitfalls that actually happened on the modernization project or in this wiki: the ones most likely to happen to you.'
  }
}

function parsePage(lang, slug) {
  const L = LANG[lang]
  const lines = readFileSync(join(DOCS, L.dir, `${slug}.md`), 'utf8').split('\n')
  const warns = []
  lines.forEach((line, i) => {
    const m = line.match(/^#### (?:⚠️ )?`WARN-(\d{3})`\s*:?\s*(.*?)\s*\{#(warn-\d{3})(?:\s+\.warn-title)?\}\s*$/)
    if (!m) return
    const [, id, title, anchor] = m
    const originLine = lines.slice(i + 1, i + 4).find((l) => L.originLabel.test(l.trim())) || ''
    const originText = (originLine.trim().match(L.originLabel) || [, ''])[1]
    // « Constaté » l'emporte ; sinon la première source citée dans la ligne Origine
    const first = L.origin
      .map(([re, label]) => ({ i: originText.search(re), label }))
      .filter((o) => o.i >= 0)
      .sort((a, b) => a.i - b.i)[0]
    const origin = L.livedRe.test(originText) ? L.livedLabel : (first ? first.label : L.origin.at(-1)[1])
    const sev = SEVERITY[slug]?.[id]
    if (!sev) throw new Error(`Gravité manquante pour ${slug} WARN-${id} : compléter SEVERITY`)
    // Liens retirés ; « | » échappé pour ne pas casser la cellule du tableau
    const cleanTitle = title.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\|/g, '\\|')
    warns.push({ slug, id, title: cleanTitle, anchor, origin, sev })
  })
  return warns
}

function render(lang) {
  const L = LANG[lang]
  const pages = readdirSync(join(DOCS, L.dir)).map((f) => f.replace(/\.md$/, ''))
  const all = PAGE_ORDER.filter((p) => pages.includes(p)).flatMap((p) => parsePage(lang, p))
  // Nom de la brique devant le numéro : les numéros WARN ne sont uniques que dans une page
  const link = (w) => `[${PAGE_NAME[w.slug]} · WARN-${w.id} · ${w.title}](${L.prefix}/concepts/${w.slug}#${w.anchor})`
  const row = (w) => `| ${link(w)} | ${PAGE_NAME[w.slug]} | ${w.origin} |`

  const SEV_ICON = { S: 'shield', F: 'wrench', C: 'coins', M: 'puzzle' }
  const SEV_ID = { S: 'securite', F: 'fiabilite', C: 'cout-contexte', M: 'maintenabilite' }
  const counts = Object.keys(L.severity)
    .map((k) => `| <Icone nom="${SEV_ICON[k]}" /> ${L.severity[k]} | ${L.severityHelp[k]} | ${all.filter((w) => w.sev === k).length} |`)
    .join('\n')

  let out = L.header(all.length, counts)
  for (const k of Object.keys(L.severity)) {
    const list = all.filter((w) => w.sev === k)
    if (list.length) out += `\n## ${L.severity[k]} {#${SEV_ID[k]} .sev-${k.toLowerCase()}}\n\n${L.cols}\n${list.map(row).join('\n')}\n`
  }

  const lived = all.filter((w) => w.origin === L.livedLabel)
  out += `\n${L.lived}\n\n${L.livedIntro}\n\n${L.cols}\n${lived.map(row).join('\n')}\n`

  out += `\n${L.byBrick}\n\n${L.byBrickCols}\n`
  for (const p of PAGE_ORDER) {
    const ws = all.filter((w) => w.slug === p)
    if (!ws.length) continue
    const n = (k) => ws.filter((w) => w.sev === k).length || '·'
    out += `| [${PAGE_NAME[p]}](${L.prefix}/concepts/${p}) | ${n('S')} | ${n('F')} | ${n('C')} | ${n('M')} | ${ws.length} |\n`
  }

  writeFileSync(join(DOCS, L.out), out)
  return all.length
}

for (const lang of Object.keys(LANG)) console.log(`${LANG[lang].out} : ${render(lang)} WARN`)
