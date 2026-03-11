import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Claude Code Ecosystem',
  lastUpdated: true,
  base: '/claude-code-wiki/',  // nom du repo

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
          { text: 'Accueil', link: '/' },
          { text: 'Concepts', link: '/concepts/claude-md' },
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'Exemples', link: '/examples/' },
          { text: 'Référence', link: '/reference/glossary' }
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
          '/concepts/': [
            {
              text: 'Concepts fondamentaux',
              items: [
                { text: 'CLAUDE.md', link: '/concepts/claude-md' },
                { text: 'Settings', link: '/concepts/settings' },
                { text: 'Rules', link: '/concepts/rules' },
                { text: 'Skills', link: '/concepts/skills' },
                { text: 'Agents', link: '/concepts/agents' },
                { text: 'Commands', link: '/concepts/commands' },
                { text: 'Hooks', link: '/concepts/hooks' },
                { text: 'MCP', link: '/concepts/mcp' }
              ]
            }
          ],
          '/guide/': [
            {
              text: 'Guide pratique',
              items: [
                { text: 'Démarrage rapide', link: '/guide/getting-started' },
                { text: 'Bonnes pratiques', link: '/guide/best-practices' },
                { text: 'Patterns multi-agents', link: '/guide/patterns' },
                { text: 'Sécurité & Permissions', link: '/guide/security' },
                { text: 'Menaces de sécurité', link: '/guide/security-threats' },
                { text: 'Diagrammes', link: '/guide/diagrams' },
                { text: 'Cheatsheet', link: '/guide/cheatsheet' },
                { text: 'Workflow Boris Tane', link: '/guide/workflow-boris-tane' }
              ]
            }
          ],
          '/examples/': [
            {
              text: 'Cas d\'usage réel',
              items: [
                { text: 'Vue d\'ensemble', link: '/examples/' },
                { text: 'Structure du projet', link: '/examples/project-structure' },
                { text: 'Pipeline de migration', link: '/examples/pipeline' },
                { text: 'Stratégie de modèles', link: '/examples/model-strategy' },
                { text: 'Templates', link: '/examples/templates' }
              ]
            }
          ],
          '/reference/': [
            {
              text: 'Référence',
              items: [
                { text: 'Glossaire', link: '/reference/glossary' },
                { text: 'Frontmatter', link: '/reference/frontmatter' },
                { text: 'Standard Agent Skills', link: '/reference/agent-skills-standard' }
              ]
            }
          ]
        },
        outline: {
          level: [2, 3],
          label: 'Sur cette page'
        },
        editLink: {
          pattern: '#',
          text: 'Suggérer une modification'
        },
        lastUpdated: {
          text: 'Dernière mise à jour'
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
          { text: 'Home', link: '/en/' },
          { text: 'Concepts', link: '/en/concepts/claude-md' },
          { text: 'Guide', link: '/en/guide/getting-started' },
          { text: 'Examples', link: '/en/examples/' },
          { text: 'Reference', link: '/en/reference/glossary' }
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
          '/en/concepts/': [
            {
              text: 'Core Concepts',
              items: [
                { text: 'CLAUDE.md', link: '/en/concepts/claude-md' },
                { text: 'Settings', link: '/en/concepts/settings' },
                { text: 'Rules', link: '/en/concepts/rules' },
                { text: 'Skills', link: '/en/concepts/skills' },
                { text: 'Agents', link: '/en/concepts/agents' },
                { text: 'Commands', link: '/en/concepts/commands' },
                { text: 'Hooks', link: '/en/concepts/hooks' },
                { text: 'MCP', link: '/en/concepts/mcp' }
              ]
            }
          ],
          '/en/guide/': [
            {
              text: 'Practical Guide',
              items: [
                { text: 'Getting Started', link: '/en/guide/getting-started' },
                { text: 'Best Practices', link: '/en/guide/best-practices' },
                { text: 'Multi-agent Patterns', link: '/en/guide/patterns' },
                { text: 'Security & Permissions', link: '/en/guide/security' },
                { text: 'Security Threats', link: '/en/guide/security-threats' },
                { text: 'Diagrams', link: '/en/guide/diagrams' },
                { text: 'Cheatsheet', link: '/en/guide/cheatsheet' },
                { text: 'Boris Tane Workflow', link: '/en/guide/workflow-boris-tane' }
              ]
            }
          ],
          '/en/examples/': [
            {
              text: 'Real-world Use Cases',
              items: [
                { text: 'Overview', link: '/en/examples/' },
                { text: 'Project Structure', link: '/en/examples/project-structure' },
                { text: 'Migration Pipeline', link: '/en/examples/pipeline' },
                { text: 'Model Strategy', link: '/en/examples/model-strategy' },
                { text: 'Templates', link: '/en/examples/templates' }
              ]
            }
          ],
          '/en/reference/': [
            {
              text: 'Reference',
              items: [
                { text: 'Glossary', link: '/en/reference/glossary' },
                { text: 'Frontmatter', link: '/en/reference/frontmatter' },
                { text: 'Standard Agent Skills', link: '/en/reference/agent-skills-standard' }
              ]
            }
          ]
        },
        outline: {
          level: [2, 3],
          label: 'On this page'
        },
        editLink: {
          pattern: '#',
          text: 'Suggest a change'
        },
        lastUpdated: {
          text: 'Last updated'
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

    socialLinks: [
      { icon: 'github', link: 'https://github.com/agentskills/agentskills' }
    ],

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
  }
})
