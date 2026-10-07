// Visionneuse plein écran pour les images et diagrammes Mermaid (.mermaid-zoom / .img-zoom) :
// zoom molette / boutons / double-clic / pincement, déplacement par glisser, Échap pour fermer.

const MIN_SCALE = 0.1
const MAX_SCALE = 8

// Taille intrinsèque du média, pour zoomer net (pixels réels d'une image, viewBox d'un SVG)
const intrinsicSize = (media: HTMLElement) => {
  if (media instanceof HTMLImageElement && media.naturalWidth) {
    return { w: media.naturalWidth, h: media.naturalHeight }
  }
  const vb = (media as unknown as SVGSVGElement).viewBox?.baseVal
  if (vb && vb.width && vb.height) return { w: vb.width, h: vb.height }
  const r = media.getBoundingClientRect()
  return { w: r.width || 800, h: r.height || 600 }
}

export function openZoomViewer(media: HTMLElement) {
  const { w, h } = intrinsicSize(media)

  const overlay = document.createElement('div')
  overlay.className = 'zoom-viewer'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-label', 'Image agrandie')
  overlay.innerHTML = `
    <div class="zoom-toolbar">
      <button type="button" data-act="out" title="Dézoomer (−)" aria-label="Dézoomer">−</button>
      <span class="zoom-level" aria-live="polite">100 %</span>
      <button type="button" data-act="in" title="Zoomer (+)" aria-label="Zoomer">+</button>
      <button type="button" data-act="fit" title="Ajuster à l'écran (0)">Ajuster</button>
      <button type="button" data-act="real" title="Taille réelle (1)">100 %</button>
      <button type="button" data-act="close" title="Fermer (Échap)" aria-label="Fermer">✕</button>
    </div>
    <div class="zoom-stage"></div>
    <div class="zoom-hint">Molette ou + / − pour zoomer · glisser pour déplacer · double-clic pour zoomer · Échap pour fermer</div>`

  const stage = overlay.querySelector<HTMLElement>('.zoom-stage')!
  const level = overlay.querySelector<HTMLElement>('.zoom-level')!

  // Le zoom s'applique à un conteneur, pas au <svg> lui-même : transformer directement un <svg>
  // décale ses libellés HTML (foreignObject) dans Chrome
  const clone = media.cloneNode(true) as HTMLElement
  clone.removeAttribute('style')
  // Identifiant propre à la copie : Mermaid retrouve ses diagrammes par id lorsqu'il les redessine
  if (clone.id) {
    const oldId = clone.id
    clone.id = `${oldId}-zoom`
    clone.querySelectorAll('style').forEach((st) => {
      st.textContent = (st.textContent ?? '').split(`#${oldId}`).join(`#${clone.id}`)
    })
  }
  clone.setAttribute('width', '100%')
  clone.setAttribute('height', '100%')
  const content = document.createElement('div')
  content.className = 'zoom-content'
  content.style.width = `${w}px`
  content.style.height = `${h}px`
  content.appendChild(clone)
  stage.appendChild(content)

  let scale = 1
  let x = 0
  let y = 0

  const apply = () => {
    content.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
    level.textContent = `${Math.round(scale * 100)} %`
  }

  const fitScale = () => {
    const r = stage.getBoundingClientRect()
    return Math.min((r.width * 0.95) / w, (r.height * 0.95) / h)
  }

  const fit = () => {
    const r = stage.getBoundingClientRect()
    scale = fitScale()
    x = (r.width - w * scale) / 2
    y = (r.height - h * scale) / 2
    apply()
  }

  // Zoome en gardant fixe le point (cx, cy) de la scène
  const zoomAt = (next: number, cx?: number, cy?: number) => {
    const r = stage.getBoundingClientRect()
    const px = cx ?? r.width / 2
    const py = cy ?? r.height / 2
    const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next))
    x = px - (px - x) * (s / scale)
    y = py - (py - y) * (s / scale)
    scale = s
    apply()
  }

  const localPoint = (e: { clientX: number; clientY: number }) => {
    const r = stage.getBoundingClientRect()
    return { cx: e.clientX - r.left, cy: e.clientY - r.top }
  }

  // ---- Molette ----
  stage.addEventListener('wheel', (e) => {
    e.preventDefault()
    const { cx, cy } = localPoint(e)
    zoomAt(scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15), cx, cy)
  }, { passive: false })

  // ---- Glisser (souris) et pincer (tactile) ----
  const pointers = new Map<number, { x: number; y: number }>()
  let pinchDist = 0

  stage.addEventListener('pointerdown', (e) => {
    stage.setPointerCapture(e.pointerId)
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    stage.classList.add('dragging')
  })

  stage.addEventListener('pointermove', (e) => {
    const prev = pointers.get(e.pointerId)
    if (!prev) return
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      if (pinchDist) {
        const { cx, cy } = localPoint({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 })
        zoomAt(scale * (dist / pinchDist), cx, cy)
      }
      pinchDist = dist
      return
    }

    x += e.clientX - prev.x
    y += e.clientY - prev.y
    apply()
  })

  const release = (e: PointerEvent) => {
    pointers.delete(e.pointerId)
    if (pointers.size < 2) pinchDist = 0
    if (pointers.size === 0) stage.classList.remove('dragging')
  }
  stage.addEventListener('pointerup', release)
  stage.addEventListener('pointercancel', release)

  // ---- Double-clic : zoom x2 sur le point, ou retour à l'ajustement ----
  stage.addEventListener('dblclick', (e) => {
    const { cx, cy } = localPoint(e)
    if (scale < fitScale() * 1.9) zoomAt(scale * 2, cx, cy)
    else fit()
  })

  // ---- Barre d'outils et clavier ----
  const close = () => {
    document.removeEventListener('keydown', onKey)
    window.removeEventListener('resize', fit)
    document.body.style.overflow = previousOverflow
    overlay.remove()
  }

  overlay.querySelector('.zoom-toolbar')!.addEventListener('click', (e) => {
    const act = (e.target as HTMLElement).closest('button')?.dataset.act
    if (act === 'in') zoomAt(scale * 1.25)
    else if (act === 'out') zoomAt(scale / 1.25)
    else if (act === 'fit') fit()
    else if (act === 'real') zoomAt(1)
    else if (act === 'close') close()
  })

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
    else if (e.key === '+' || e.key === '=') zoomAt(scale * 1.25)
    else if (e.key === '-') zoomAt(scale / 1.25)
    else if (e.key === '0') fit()
    else if (e.key === '1') zoomAt(1)
  }
  document.addEventListener('keydown', onKey)
  window.addEventListener('resize', fit)

  // Blocage du défilement sur <body> : une classe sur <html> déclencherait le re-rendu des diagrammes
  // par le plugin Mermaid, qui observe cet élément pour le mode sombre
  const previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  document.body.appendChild(overlay)
  fit()
  overlay.querySelector<HTMLButtonElement>('[data-act="close"]')!.focus()
}

// Ajoute le bouton « Agrandir » aux conteneurs qui n'en ont pas encore
export function decorateZoomables() {
  document.querySelectorAll<HTMLElement>('.mermaid-zoom, .img-zoom').forEach((el) => {
    if (el.querySelector(':scope > .mermaid-fullscreen-btn')) return
    if (!el.querySelector('svg, img')) return
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'mermaid-fullscreen-btn'
    btn.innerHTML =
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">' +
      '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg> Agrandir'
    btn.title = 'Agrandir (zoom et déplacement)'
    el.appendChild(btn)
  })
}

// Un seul écouteur pour tout le site : clic sur le bouton ou directement sur l'image / le diagramme
export function installZoomListener() {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const box = target.closest<HTMLElement>('.mermaid-zoom, .img-zoom')
    if (!box || target.closest('a')) return
    const media = box.querySelector<HTMLElement>(':scope svg, :scope img')
    if (!media) return
    e.preventDefault()
    openZoomViewer(media)
  })
}
