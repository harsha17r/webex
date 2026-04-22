import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ONBOARDING_GRADIENT_90 } from '../screens/onboarding/onboardingGradients'

const SITE_URL = 'webex-onboarding.netlify.app/'

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * Trigger: user clicks "Copy Link"
 *
 *    0ms   button presses: scale 1.0 → 0.93 (spring snap)
 *   60ms   spring back: 0.93 → 1.0
 *   60ms   "Copy Link" slides up + fades out  ↑
 *   60ms   "Copied!" slides up in from below  ↑  (simultaneous)
 *   60ms   green checkmark pops in: scale 0 → 1.2 → 1.0
 *  150ms   toast arrives from below: y: 64 → 0 (soft landing spring)
 *  220ms   monitor icon scales in: 0 → 1.2 → 1.0
 * 1200ms   stage resets → button swap reverts, toast exits downward
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  reset: 2800,   // ms before reverting to idle
}

const BTN = {
  pressScale: 0.93,
  spring:     { type: 'spring', stiffness: 900, damping: 45 },
}

const SWAP = {
  offsetY: 14,
  transition: {
    opacity: { duration: 0.1 },
    y:       { type: 'spring', stiffness: 1000, damping: 55 },
  },
}

const CHECK = {
  spring: { type: 'spring', stiffness: 1100, damping: 28 },
}

const TOAST = {
  offsetY:     64,    // px toast travels from below
  delay:       0.15,  // seconds after copy before toast appears (in framer delay unit)
  enterSpring: { type: 'spring', stiffness: 480, damping: 38 },
  exitSpring:  { type: 'spring', stiffness: 700, damping: 50 },
  iconSpring:  { type: 'spring', stiffness: 900, damping: 26 },
  iconDelay:   0.07,  // seconds after toast arrives before icon pops
}

// ── Icons ──────────────────────────────────────────────────

function LaptopIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
      stroke="#CCCCCC" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="3" width="20" height="13" rx="2" />
      <path d="M1 20h22" />
      <path d="M9 20l.5-4h5l.5 4" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#2AAB7D" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#2AAB7D" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  )
}

// ── Component ──────────────────────────────────────────────

export function MobileGate({ children }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024)
  const [stage, setStage]       = useState(0)  // 0 = idle, 1 = copied

  useEffect(() => {
    function handleResize() { setIsMobile(window.innerWidth < 1024) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function handleCopy() {
    if (stage === 1) return
    navigator.clipboard.writeText(SITE_URL).then(() => {
      setStage(1)
      setTimeout(() => setStage(0), TIMING.reset)
    })
  }

  if (!isMobile) return children

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#111111',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 56px',
      fontFamily: "'Inter', system-ui, sans-serif",
      WebkitFontSmoothing: 'antialiased',
      overflow: 'hidden',
    }}>
      {/* Bottom glow blob */}
      <div style={{
        position: 'absolute', bottom: -135, left: '50%',
        transform: 'translateX(-50%)',
        width: '100vw', height: 200,
        background: ONBOARDING_GRADIENT_90,
        filter: 'blur(30px)',
        pointerEvents: 'none', borderRadius: '500%',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', maxWidth: 360, width: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
      }}>
        {/* Icon tile */}
        <div style={{
          width: 72, height: 72, borderRadius: 16,
          background: '#1E1E1E', border: '1px solid #2A2A2A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28, flexShrink: 0,
        }}>
          <LaptopIcon />
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: 'clamp(20px, 6vw, 32px)', lineHeight: 1.2,
          fontWeight: 600, color: '#FFFFFF', margin: '0 0 10px',
        }}>
          This prototype is built for Desktop
        </h1>

        {/* Sub copy */}
        <p style={{
          fontSize: 'clamp(13px, 3.8vw, 15px)', lineHeight: 1.6,
          color: '#AAAAAA', margin: '0 0 32px',
        }}>
          copy the link and we'll catch you on the big screen, when you get a chance!
        </p>

        {/* URL pill */}
        <div style={{
          width: '100%', marginBottom: 20,
          padding: '10px 16px',
          background: '#1A1A1A', border: '1px solid #2A2A2A',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <span style={{
            fontSize: 13, lineHeight: '18px', color: '#FFFFFF',
            fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace",
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            userSelect: 'all', cursor: 'text',
          }}>
            {SITE_URL}
          </span>
        </div>

        {/* CTA button */}
        <motion.button
          onClick={handleCopy}
          whileHover={stage === 0 ? { scale: 1.02 } : {}}
          whileTap={{ scale: BTN.pressScale }}
          transition={BTN.spring}
          style={{
            width: '100%', height: 48,
            borderRadius: 16,
            background: '#FFFFFF',
            border: 'none',
            fontSize: 14, fontWeight: 600, color: '#111111',
            fontFamily: 'inherit',
            cursor: stage === 1 ? 'default' : 'pointer',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Invisible spacer keeps button width stable */}
          <span style={{ visibility: 'hidden', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CopyIcon /> Copy Link
          </span>

          <AnimatePresence>
            {stage === 0 ? (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: SWAP.offsetY }}
                animate={{ opacity: 1, y: 0 }}
                exit={{   opacity: 0, y: -SWAP.offsetY }}
                transition={SWAP.transition}
                style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <CopyIcon />
                Copy Link
              </motion.span>
            ) : (
              <motion.span
                key="copied"
                initial={{ opacity: 0, y: SWAP.offsetY }}
                animate={{ opacity: 1, y: 0 }}
                exit={{   opacity: 0, y: -SWAP.offsetY }}
                transition={SWAP.transition}
                style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={CHECK.spring}
                  style={{ display: 'inline-flex' }}
                >
                  <CheckIcon />
                </motion.span>
                Copied!
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Toast — fixed at bottom, outside the content flow */}
      <AnimatePresence>
        {stage === 1 && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -TOAST.offsetY, x: '-50%' }}
            animate={{
              opacity: 1,
              y: 0,
              x: '-50%',
              transition: { ...TOAST.enterSpring, delay: TOAST.delay },
            }}
            exit={{
              opacity: 0,
              y: -TOAST.offsetY,
              x: '-50%',
              transition: TOAST.exitSpring,
            }}
            style={{
              position: 'absolute',
              top: 36,
              left: '50%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 20px',
              background: 'rgba(42, 171, 125, 0.12)',
              border: '1px solid rgba(42, 171, 125, 0.28)',
              borderRadius: 8,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {/* Monitor icon pops in just after the toast lands */}
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...TOAST.iconSpring, delay: TOAST.delay + TOAST.iconDelay }}
              style={{ display: 'inline-flex', flexShrink: 0 }}
            >
              <MonitorIcon />
            </motion.span>

            <span style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
            }}>
              See you on the big screen!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
