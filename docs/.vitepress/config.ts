import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import recodeSidebar from './recode-sidebar.json'

// Chemin de base du site (GitHub Pages : servi sous /modernize-legacy/)
const SITE_BASE = '/modernize-legacy/'

// Wiki d'exemple (sous-site statique dans public/, construit par scripts/sync-example-wiki.sh)
const EXAMPLE_WIKI = `${SITE_BASE}exemple-wiki-legacy/`
const publicDir = join(__dirname, '..', 'public')

// ---- Menu et barres latérales : comprendre → appliquer → outiller → consulter ----
// Les pages gardent leurs URLs ; seuls les regroupements changent.

const conceptsFr = [
  { text: 'L\'essentiel : quelle brique ?', link: '/concepts/which-mechanism' },
  { text: 'CLAUDE.md', link: '/concepts/claude-md' },
  { text: 'Settings', link: '/concepts/settings' },
  { text: 'Rules', link: '/concepts/rules' },
  { text: 'Skills', link: '/concepts/skills' },
  { text: 'Agents', link: '/concepts/agents' },
  { text: 'Hooks', link: '/concepts/hooks' },
  { text: 'MCP', link: '/concepts/mcp' },
  { text: 'Plugins', link: '/concepts/plugins' },
  { text: 'Commands (ancien format)', link: '/concepts/commands' }
]

const guideFr = [
  { text: 'Démarrage rapide', link: '/guide/getting-started' },
  { text: 'Règles d\'or', link: '/guide/best-practices' },
  { text: 'Catalogue des pièges', link: '/guide/warns' }
]

// Les deux premiers liens sont mis en avant (dégradé Fondative, voir custom.css)
const modernisationFr = [
  { text: 'Méthodologie AI-Driven', link: '/guide/methodology' },
  // Sous-site statique construit par scripts/sync-example-wiki.sh (docs/public/exemple-wiki-legacy/)
  { text: 'Cas d\'usage réel (wiki)', link: '/exemple-wiki-legacy/', target: '_blank' },
  {
    text: 'Manuel d\'utilisation',
    items: [
      { text: 'Vue d\'ensemble', link: '/examples/' },
      { text: 'Structure du projet', link: '/examples/project-structure' },
      { text: 'Pipeline de migration', link: '/examples/pipeline' },
      { text: 'Contrôle qualité', link: '/examples/quality-review' },
      { text: 'Stratégie de modèles', link: '/examples/model-strategy' }
    ]
  }
]

const referenceFr = [
  { text: 'Glossaire', link: '/reference/glossary' },
  { text: 'Cheatsheet', link: '/reference/cheatsheet' }
]

const conceptsEn = [
  { text: 'Essentials: which building block?', link: '/en/concepts/which-mechanism' },
  { text: 'CLAUDE.md', link: '/en/concepts/claude-md' },
  { text: 'Settings', link: '/en/concepts/settings' },
  { text: 'Rules', link: '/en/concepts/rules' },
  { text: 'Skills', link: '/en/concepts/skills' },
  { text: 'Agents', link: '/en/concepts/agents' },
  { text: 'Hooks', link: '/en/concepts/hooks' },
  { text: 'MCP', link: '/en/concepts/mcp' },
  { text: 'Plugins', link: '/en/concepts/plugins' },
  { text: 'Commands (former format)', link: '/en/concepts/commands' }
]

const guideEn = [
  { text: 'Getting Started', link: '/en/guide/getting-started' },
  { text: 'Golden Rules', link: '/en/guide/best-practices' },
  { text: 'Pitfall Catalog', link: '/en/guide/warns' }
]

const modernisationEn = [
  { text: 'AI-Driven Methodology', link: '/en/guide/methodology' },
  { text: 'Real-world use case (wiki, FR)', link: '/exemple-wiki-legacy/', target: '_blank' },
  {
    text: 'User Manual',
    items: [
      { text: 'Overview', link: '/en/examples/' },
      { text: 'Project Structure', link: '/en/examples/project-structure' },
      { text: 'Migration Pipeline', link: '/en/examples/pipeline' },
      { text: 'Quality control', link: '/en/examples/quality-review' },
      { text: 'Model Strategy', link: '/en/examples/model-strategy' }
    ]
  }
]

const referenceEn = [
  { text: 'Glossary', link: '/en/reference/glossary' },
  { text: 'Cheatsheet', link: '/en/reference/cheatsheet' }
]

export default withMermaid(defineConfig({
  base: SITE_BASE,

  // En dev, résout les URLs propres du wiki d'exemple (/page → page.html, /dossier/ → index.html),
  // comme le fait un hébergeur statique en production
  vite: {
    plugins: [{
      name: 'example-wiki-clean-urls',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const [path, query = ''] = (req.url ?? '').split('?')
          if (path.startsWith(EXAMPLE_WIKI) && !/\.[a-z0-9]+$/i.test(path)) {
            const file = path.endsWith('/') ? `${path}index.html` : `${path}.html`
            if (existsSync(join(publicDir, file.slice(SITE_BASE.length)))) req.url = file + (query ? `?${query}` : '')
          }
          next()
        })
      }
    }]
  },

  title: 'AI Coding Workflows',
  // Pas de « Dernière mise à jour » en bas des pages (le tampon de version suffit)
  lastUpdated: false,

  head: [
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192x192.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/favicon-192x192.png' }],
  ],

  locales: {
    root: {
      label: 'Français',
      lang: 'fr-FR',
      description: 'Référentiel complet pour maîtriser Agents, Skills, Rules, Hooks et MCP',
      themeConfig: {
        nav: [
          {
            text: 'Concepts',
            activeMatch: '^/(concepts|introduction)/',
            items: [
              {
                text: 'Introduction',
                items: [
                  { text: 'Philosophie & Vision', link: '/introduction/' },
                  { text: 'Architecture .claude/', link: '/introduction/architecture' }
                ]
              },
              { text: 'Concepts fondamentaux', items: conceptsFr }
            ]
          },
          { text: 'Bonnes pratiques', activeMatch: '^/guide/(?!methodology)', items: guideFr },
          { text: 'AI-Driven Modernisation', activeMatch: '^/(guide/methodology|examples/)', items: modernisationFr },
          { text: 'Plugin recode', activeMatch: '^/recode/', items: recodeSidebar[0].items },
          { text: 'Référence', activeMatch: '^/reference/', items: referenceFr }
        ],
        sidebar: {
          '/introduction/': [
            {
              text: 'Introduction',
              items: [
                { text: 'Philosophie & Vision', link: '/introduction/' },
                { text: 'Architecture .claude/', link: '/introduction/architecture' }
              ]
            }
          ],
          '/concepts/': [{ text: 'Concepts fondamentaux', items: conceptsFr }],
          // Méthodologie et Cheatsheet gardent leur URL /guide/ mais vivent dans Modernisation et Référence.
          // À déclarer AVANT '/guide/' : VitePress départage par nombre de segments, puis par ordre de déclaration
          '/guide/methodology': modernisationFr,
          '/guide/': [{ text: 'Bonnes pratiques', items: guideFr }],
          '/examples/': modernisationFr,
          '/recode/': recodeSidebar,
          '/reference/': [{ text: 'Référence', items: referenceFr }]
        },
        outline: {
          level: [2, 3],
          label: 'Sur cette page'
        },
        editLink: {
          pattern: '#',
          text: 'Suggérer une modification'
        },
        docFooter: {
          prev: 'Page précédente',
          next: 'Page suivante'
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      description: 'Complete reference for mastering Agents, Skills, Rules, Hooks and MCP',
      themeConfig: {
        nav: [
          {
            text: 'Concepts',
            activeMatch: '^/en/(concepts|introduction)/',
            items: [
              {
                text: 'Introduction',
                items: [
                  { text: 'Philosophy & Vision', link: '/en/introduction/' },
                  { text: 'Architecture .claude/', link: '/en/introduction/architecture' }
                ]
              },
              { text: 'Core Concepts', items: conceptsEn }
            ]
          },
          { text: 'Best Practices', activeMatch: '^/en/guide/(?!methodology)', items: guideEn },
          { text: 'AI-Driven Modernisation', activeMatch: '^/en/(guide/methodology|examples/)', items: modernisationEn },
          { text: 'Reference', activeMatch: '^/en/reference/', items: referenceEn }
        ],
        sidebar: {
          '/en/introduction/': [
            {
              text: 'Introduction',
              items: [
                { text: 'Philosophy & Vision', link: '/en/introduction/' },
                { text: 'Architecture .claude/', link: '/en/introduction/architecture' }
              ]
            }
          ],
          '/en/concepts/': [{ text: 'Core Concepts', items: conceptsEn }],
          '/en/guide/methodology': modernisationEn,
          '/en/guide/': [{ text: 'Best Practices', items: guideEn }],
          '/en/examples/': modernisationEn,
          '/en/reference/': [{ text: 'Reference', items: referenceEn }]
        },
        outline: {
          level: [2, 3],
          label: 'On this page'
        },
        editLink: {
          pattern: '#',
          text: 'Suggest a change'
        },
        docFooter: {
          prev: 'Previous page',
          next: 'Next page'
        }
      }
    }
  },

  themeConfig: {
    logo: '/favicon-192x192.png',

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Rechercher',
                buttonAriaLabel: 'Rechercher dans la documentation'
              },
              modal: {
                displayDetails: 'Afficher les détails',
                resetButtonTitle: 'Réinitialiser',
                backButtonTitle: 'Retour',
                noResultsText: 'Aucun résultat pour',
                footer: {
                  selectText: 'Sélectionner',
                  selectKeyAriaLabel: 'Entrée',
                  navigateText: 'Naviguer',
                  navigateUpKeyAriaLabel: 'Flèche haut',
                  navigateDownKeyAriaLabel: 'Flèche bas',
                  closeText: 'Fermer',
                  closeKeyAriaLabel: 'Échap'
                }
              }
            }
          }
        },
        miniSearch: {
          options: {
            tokenize: (text: string) => text.toLowerCase().split(/[\s\-_/]+/),
            processTerm: (term: string) =>
              term
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
          },
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            boost: { title: 4, titles: 2, text: 1 },
            combineWith: 'OR'
          }
        },
        _render(src: string, env: any, md: any) {
          const html = md.render(src, env)
          if (env.frontmatter?.title) {
            return md.render(`# ${env.frontmatter.title}`) + html
          }
          return html
        }
      }
    }
  },

  // Images du contenu : enveloppées dans le conteneur plein écran des diagrammes (voir theme/index.ts)
  markdown: {
    config: (md) => {
      const defaultImage = md.renderer.rules.image!
      md.renderer.rules.image = (tokens, idx, options, env, self) =>
        `<span class="mermaid-zoom img-zoom">${defaultImage(tokens, idx, options, env, self)}</span>`

      // Encadrés propres au projet (« ::: info Chez nous », « ::: info Convention de ce projet »…) :
      // même syntaxe que les encadrés VitePress, mais un style dédié (classe project-block, voir custom.css)
      const PROJECT_TITLE = /^info\s+(Chez nous|Convention de ce projet|Heuristique de ce projet|In our project|This project's (convention|heuristic))/
      const defaultInfoOpen = md.renderer.rules.container_info_open!
      md.renderer.rules.container_info_open = (tokens, idx, options, env, self) => {
        const html = defaultInfoOpen(tokens, idx, options, env, self)
        return PROJECT_TITLE.test(tokens[idx].info.trim())
          ? html.replace('class="info custom-block"', 'class="info custom-block project-block"')
          : html
      }
    }
  },

  // Mermaid global config — Hall of Legacy dark palette
  mermaid: {
    theme: 'base',
    themeVariables: {
      // Primary nodes: dark slate + neon green border
      primaryColor: '#0f172a',
      primaryTextColor: '#f1f5f9',
      primaryBorderColor: '#39ff14',
      // Secondary nodes: dark teal + yellow border
      secondaryColor: '#0d3b3b',
      secondaryTextColor: '#f1f5f9',
      secondaryBorderColor: '#ddff00',
      // Tertiary nodes: dark blue
      tertiaryColor: '#1e3a5f',
      tertiaryTextColor: '#f1f5f9',
      tertiaryBorderColor: '#64748b',
      // Lines & labels
      lineColor: '#22c55e',
      textColor: '#f1f5f9',
      // Fonts
      fontFamily: 'Montserrat, system-ui, sans-serif',
      fontSize: '16px',
      // Subgraphs
      clusterBkg: '#131d35',
      clusterBorder: '#22c55e',
      // Nodes
      nodeBorder: '#39ff14',
      mainBkg: '#0f172a',
      nodeTextColor: '#f1f5f9',
      // Edge labels
      edgeLabelBackground: '#1e3a5f',
    },
    flowchart: {
      padding: 24,
      nodeSpacing: 40,
      rankSpacing: 60,
      htmlLabels: true,
      useMaxWidth: true,
      wrappingWidth: 200,
    },
    block: {
      padding: 20,
    },
  },
  mermaidPlugin: {
    class: 'mermaid-zoom',
  },
}))
