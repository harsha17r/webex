import { motion, AnimatePresence } from 'motion/react'

/* ─────────────────────────────────────────────────────────
 * CcNudge
 *
 * Tooltip nudge that appears above the Closed Captions button.
 * Arrow notch points downward toward the button.
 *
 * Props:
 *   visible   — boolean, controlled by parent hover state
 *   onDismiss — called when user clicks "Got it"
 * ───────────────────────────────────────────────────────── */
export function CcNudge({ visible, onDismiss }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 16px)',
            left: 0,
            width: 232,
            background: '#1C1C1C',
            border: '2px solid #737373',
            borderRadius: 10,
            padding: '16px 16px 14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            zIndex: 50,
            fontFamily: "'Inter', system-ui, sans-serif",
            pointerEvents: 'auto',
          }}
        >
          {/* Downward-pointing arrow notch */}
          <div style={{
            position: 'absolute',
            bottom: -6,
            left: 24,
            width: 12,
            height: 12,
            background: '#1C1C1C',
            transform: 'rotate(45deg)',
            borderRadius: '0 0 3px 0',
          }} />

          <p style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#FFFFFF',
            margin: '0 0 8px',
            lineHeight: '20px',
          }}>
            Live translation
          </p>

          <p style={{
            fontSize: 14,
            fontWeight: 400,
            color: '#BBBBBB',
            margin: '0 0 14px',
            lineHeight: '20px',
          }}>
            Choose from 100+ languages for real-time captions.
          </p>

          <button
            onClick={e => { e.stopPropagation(); onDismiss() }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: 14,
              fontWeight: 500,
              color: '#4DA8FF',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            Got it
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
