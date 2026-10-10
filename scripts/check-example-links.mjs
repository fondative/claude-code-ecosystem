// Vérifie les liens <CasUsage page="…"> des pages Markdown : la page doit exister dans le wiki exemple
// embarqué (docs/public/exemple-wiki-legacy/) et l'ancre (#sec-N, id d'un titre…), obligatoire, doit y être définie.
// VitePress ne contrôle pas ces liens (site statique séparé) : ce script fait échouer docs:generate.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const docs = fileURLToPath(new URL('../docs/', import.meta.url))
const example = join(docs, 'public/exemple-wiki-legacy')

const mdFiles = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  if (e.name === 'public' || e.name.startsWith('.')) return []
  const p = join(dir, e.name)
  return e.isDirectory() ? mdFiles(p) : e.name.endsWith('.md') ? [p] : []
})

const ids = new Map()
const idsOf = (file) => {
  if (!ids.has(file)) ids.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])))
  return ids.get(file)
}

const errors = []
let count = 0
for (const md of mdFiles(docs)) {
  for (const [, target] of readFileSync(md, 'utf8').matchAll(/<CasUsage(?:Card)?\s+page="([^"]+)"/g)) {
    count++
    const [page, anchor] = target.split('#')
    const file = join(example, page)
    if (!existsSync(file)) errors.push(`${relative(docs, md)} : page absente du wiki exemple → ${page}`)
    else if (!anchor) errors.push(`${relative(docs, md)} : lien sans ancre (chaque lien vise une section précise) → ${target}`)
    else if (!idsOf(file).has(anchor)) errors.push(`${relative(docs, md)} : ancre absente → ${target}`)
  }
}

if (errors.length) {
  console.error(`Liens vers le wiki exemple invalides (${errors.length}) :\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log(`Liens vers le wiki exemple : ${count} vérifiés`)
