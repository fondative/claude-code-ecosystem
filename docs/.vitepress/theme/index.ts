import DefaultTheme from 'vitepress/theme'
import { onMounted } from 'vue'
import { decorateZoomables, installZoomListener } from './zoom-viewer'
import './custom.css'

export default {
  extends: DefaultTheme,
  setup() {
    // Plan de page (colonne de droite) : retire les pastilles emoji colorées des titres (🟢🔵🟠🟣), sans toucher aux titres du corps
    const stripOutlineEmojis = () => {
      document.querySelectorAll('.VPDocAsideOutline .outline-link').forEach((link) => {
        const node = link.firstChild
        if (node?.nodeType === Node.TEXT_NODE && /[\u{1F534}\u{1F535}\u{1F7E0}-\u{1F7EB}]/u.test(node.nodeValue ?? '')) {
          node.nodeValue = node.nodeValue!.replace(/[\u{1F534}\u{1F535}\u{1F7E0}-\u{1F7EB}]️?\s*/gu, '')
        }
      })
    }

    onMounted(() => {
      installZoomListener()

      // Les diagrammes Mermaid sont rendus après le chargement et à chaque navigation :
      // on décore au fil des mutations du DOM plutôt qu'après un délai fixe
      let pending = false
      new MutationObserver(() => {
        if (pending) return
        pending = true
        requestAnimationFrame(() => {
          pending = false
          stripOutlineEmojis()
          decorateZoomables()
        })
      }).observe(document.body, { childList: true, subtree: true })
      stripOutlineEmojis()
      decorateZoomables()
    })
  }
}
