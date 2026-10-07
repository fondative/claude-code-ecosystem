// Préfixe par `base` les liens absolus écrits en HTML brut dans un site VitePress construit
// (<a href="/docs/...">, src="/screenshots/..."), que VitePress ne réécrit pas lui-même.
// Seuls les liens vers un dossier de premier niveau du site sont touchés.
//
// Usage : node prefix-root-links.mjs <dossier du site construit> <base, ex. /exemple-wiki-legacy/>

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [siteDir, base] = process.argv.slice(2)
if (!siteDir || !base?.startsWith('/') || !base.endsWith('/')) {
  console.error('Usage : node prefix-root-links.mjs <site> </base/>')
  process.exit(1)
}

const topDirs = readdirSync(siteDir).filter((d) => d !== 'assets' && statSync(join(siteDir, d)).isDirectory())
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// href="/docs/…"  ·  href:"/docs/…"  ·  href: \"/docs/…\" (chaînes échappées dans les chunks JS)
const linkRe = new RegExp(
  String.raw`((?:href|src)(?:=|:\s*)\\?")/((?:${topDirs.map(escapeRe).join('|')})(?=[/"\\#?]))`,
  'g',
)

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })

let files = 0
let links = 0
for (const file of walk(siteDir).filter((f) => /\.(html|js)$/.test(f))) {
  const src = readFileSync(file, 'utf8')
  let count = 0
  const out = src.replace(linkRe, (_, prefix, rest) => {
    count++
    return `${prefix}${base}${rest}`
  })
  if (count) {
    writeFileSync(file, out)
    files++
    links += count
  }
}
console.log(`Liens préfixés par ${base} : ${links} dans ${files} fichiers`)
