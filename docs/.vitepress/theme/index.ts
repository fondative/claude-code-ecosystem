import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import './custom.css'

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute()

    const initMermaidDiagrams = () => {
      nextTick(() => {
        document.querySelectorAll('.mermaid-zoom').forEach((el) => {
          if (el.getAttribute('data-mermaid-init')) return
          el.setAttribute('data-mermaid-init', 'true')

          // Create fullscreen button
          const btn = document.createElement('button')
          btn.className = 'mermaid-fullscreen-btn'
          btn.innerHTML = '&#x26F6; Plein écran'
          btn.setAttribute('title', 'Afficher en plein écran')
          el.appendChild(btn)

          btn.addEventListener('click', (e) => {
            e.stopPropagation()
            const isFullscreen = el.classList.toggle('fullscreen')
            btn.innerHTML = isFullscreen ? '&#x2715; Fermer' : '&#x26F6; Plein écran'

            if (isFullscreen) {
              const onEsc = (ev: KeyboardEvent) => {
                if (ev.key === 'Escape') {
                  el.classList.remove('fullscreen')
                  btn.innerHTML = '&#x26F6; Plein écran'
                  document.removeEventListener('keydown', onEsc)
                }
              }
              document.addEventListener('keydown', onEsc)
            }
          })
        })
      })
    }

    onMounted(() => {
      setTimeout(initMermaidDiagrams, 800)

      watch(() => route.path, () => {
        setTimeout(() => {
          document.querySelectorAll('.mermaid-zoom').forEach((el) => {
            el.removeAttribute('data-mermaid-init')
          })
          initMermaidDiagrams()
        }, 800)
      })
    })
  }
}
