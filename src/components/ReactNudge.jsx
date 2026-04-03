import { motion, AnimatePresence } from 'motion/react'

/* ─────────────────────────────────────────────────────────
 * ReactNudge
 *
 * Tooltip nudge that appears above the React button.
 * Arrow notch points downward toward the button.
 *
 * Props:
 *   visible   — boolean, controlled by parent hover state
 *   onDismiss — called when user clicks "Got it"
 * ───────────────────────────────────────────────────────── */
export function ReactNudge({ visible, onDismiss }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.97, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scale: 1,  x: '-50%' }}
          exit={{ opacity: 0, y: 4, scale: 0.97,  x: '-50%' }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 16px)',
            left: '50%',
            width: 272,
            background: '#1C1C1C',
            border: '1px solid #333333',
            borderRadius: 10,
            padding: '16px 16px 14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            zIndex: 50,
            fontFamily: "'Inter', system-ui, sans-serif",
            pointerEvents: 'auto',
          }}
        >
          {/* Downward-pointing arrow notch — centered */}
          <div style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            marginLeft: -6,
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
            React instantly during meetings
          </p>

          <p style={{
            fontSize: 14,
            fontWeight: 400,
            color: '#BBBBBB',
            margin: '0 0 14px',
            lineHeight: '20px',
          }}>
            Turn on gesture recognition to react without clicking.
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
