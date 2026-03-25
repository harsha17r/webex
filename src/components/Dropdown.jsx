import { useRef, useEffect } from 'react'
import { motion } from 'motion/react'

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Dropdown entrance / exit
 *
 * Trigger: click on anchor → mounts via AnimatePresence
 *
 *    0ms   click fires, dropdown mounts
 *    0ms   opacity  0.0 → 1.0  ─┐ 150ms expo-out
 *          scale    0.96 → 1.0  ─┘
 *          anchor='right'        → transformOrigin: left center
 *          anchor='bottom'       → transformOrigin: top right
 *          anchor='bottom-center'→ transformOrigin: top center
 *          anchor='bottom-right' → transformOrigin: top right (width: max-content)
 *
 *   exit   opacity → 0, scale → 0.98   70ms ease-in
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  enter: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },   // expo-out — fast settle
  exit:  { duration: 0.07, ease: 'easeIn' },             // snapped away instantly
}

const PANEL = {
  initialScale: 0.96,
  exitScale:    0.98,
  origin: {
    right:           'left center',
    bottom:          'top right',
    'bottom-center': 'top center',
    'bottom-right':  'top right',   // right-aligned, content-width
  },
}

/* ─────────────────────────────────────────────────────────
 * Dropdown
 *
 * Generic animated panel for click-triggered dropdowns.
 * Handles fixed positioning, entrance / exit animation,
 * and click-outside to close.
 *
 * Props:
 *   anchorRef      — ref to the element that toggles the dropdown
 *   onClose        — called when a click outside the panel/anchor occurs
 *   onMouseEnter   — optional: cancel auto-close timer
 *   onMouseLeave   — optional: start auto-close timer
 *   anchor         — 'right'         opens to the side (default)
 *                    'bottom'         opens downward, right-aligned, fixed width
 *                    'bottom-center'  opens downward, centered on anchor, fixed width
 *                    'bottom-right'   opens downward, right-aligned, content width
 *   dropdownWidth  — required for 'bottom' and 'bottom-center' anchors (px)
 *   offsetX        — gap from anchor right edge (anchor='right', default 8px)
 *   offsetY        — gap below anchor for bottom variants (default 8px)
 *   children       — the dropdown panel content
 * ───────────────────────────────────────────────────────── */
export function Dropdown({
  anchorRef,
  onClose,
  onMouseEnter,
  onMouseLeave,
  anchor = 'right',
  dropdownWidth,
  offsetX = 8,
  offsetY = 8,
  children,
}) {
  const panelRef = useRef(null)

  const rect = anchorRef.current?.getBoundingClientRect()

  const isBottom = anchor === 'bottom' || anchor === 'bottom-center' || anchor === 'bottom-right'
  const top = rect ? (isBottom ? rect.bottom + offsetY : rect.top - offsetY) : 0

  // For bottom-right: use CSS `right` so content width doesn't need to be known
  const useRightEdge = anchor === 'bottom-right'
  const rightEdge    = rect ? window.innerWidth - rect.right : 0
  const left = useRightEdge ? undefined
    : rect
      ? anchor === 'bottom'         ? rect.right - (dropdownWidth ?? 0)
      : anchor === 'bottom-center'  ? rect.left + rect.width / 2 - (dropdownWidth ?? 0) / 2
      : rect.right + offsetX
      : 0

  useEffect(() => {
    function handleClickOutside(e) {
      const insidePanel  = panelRef.current?.contains(e.target)
      const insideAnchor = anchorRef.current?.contains(e.target)
      if (!insidePanel && !insideAnchor) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose, anchorRef])

  return (
    <motion.div
      ref={panelRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, scale: PANEL.initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        scale: PANEL.exitScale,
        transition: TIMING.exit,
      }}
      transition={TIMING.enter}
      style={{
        position: 'fixed',
        top,
        ...(useRightEdge ? { right: rightEdge } : { left }),
        transformOrigin: PANEL.origin[anchor] ?? PANEL.origin.right,
        zIndex: 1000,
      }}
    >
      {children}
    </motion.div>
  )
}
