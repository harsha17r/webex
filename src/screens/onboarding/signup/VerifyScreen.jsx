/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Verify flow
 *
 * Read top-to-bottom. Each value is ms after Verify is clicked.
 *
 *    0ms   OTP form slides down + fades out (exit)
 *  350ms   "Verifying ..." heading fades + slides up (enter)
 *  500ms   three dots animate in one by one (stagger 120ms)
 * 2200ms   dots + heading fade out
 * 2500ms   "Verification successful !" slides up (enter)
 * 2700ms   green checkmark pops in with spring bounce
 * ───────────────────────────────────────────────────────── */

import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import logoVerticalRGB from '../../../assets/logos/RGB_Webex_Logo_lockup_vertical_whitetext.svg'

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  bg:           '#111111',
  surface:      '#222222',
  border:       '#494949',
  borderSubtle: '#AAAAAA',
  textPrimary:  '#FFFFFF',
  textSecond:   '#AAAAAA',
  textLink:     '#E9E9E9',
  accentDim:    '#1D8160',
  accentHover:  '#4ac397',
  linkBlue:     '#5cb3f0',
  gradient1:    'linear-gradient(90deg, #4ac397 0%, #5cb3f0 100%)',
}

// ── TIMING — all stage delays in ms ───────────────────────────────────────────
const TIMING = {
  formExit:       0,     // OTP form starts sliding out immediately
  verifyingEnter: 100,   // "Verifying ..." heading fades in
  dotsEnter:      500,   // dots start animating in (staggered)
  verifyingExit:  2200,  // "Verifying ..." fades out
  successEnter:   2500,  // "Verification successful !" slides up
  checkEnter:     2700,  // checkmark pops in
}

// ── Element configs ────────────────────────────────────────────────────────────
const FORM = {
  exitY:   24,   // px form slides down on exit
  spring:  { type: 'spring', stiffness: 320, damping: 28 },
}

const HEADING = {
  enterY:  16,   // px heading slides up from on enter
  spring:  { type: 'spring', stiffness: 350, damping: 26 },
}

const DOTS = {
  stagger: 200,  // ms between each dot animating in
  scale:   0.4,  // initial scale of each dot
  spring:  { type: 'spring', stiffness: 500, damping: 22 },
}

const CHECK = {
  initialScale: 0,     // starts invisible
  overshoot:    1.12,  // slight overshoot — handled by spring bounce
  spring:       { type: 'spring', stiffness: 420, damping: 18 },
}

// ── Stage 0: normal  1: verifying  2: success ─────────────────────────────────

// ── Icons ──────────────────────────────────────────────────────────────────────
function GmailIcon() {
  return <img src="https://api.iconify.design/logos:google-gmail.svg" width="20" height="20" alt="Gmail" />
}
function OutlookIcon() {
  return <img src="https://api.iconify.design/vscode-icons:file-type-outlook.svg" width="20" height="20" alt="Outlook" />
}
function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M8.5 2.5L4 7l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function RetryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7a5 5 0 1 0 1-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 2v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="28" stroke="#2aab7d" strokeWidth="2"/>
      <circle cx="30" cy="30" r="22" fill="#2aab7d"/>
      <path d="M19 30.5l8 8 14-14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const OTP_LENGTH = 6

export function VerifyScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || 'your email'

  const [stage, setStage] = useState(0)
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRefs = useRef([])

  const allFilled = digits.every(d => d !== '')

  // Auto-focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // ── Animation sequence ───────────────────────────────────────────────────────
  function handleVerify() {
    if (!allFilled) return
    setStage(1)
    setTimeout(() => setStage(2), TIMING.successEnter)
    setTimeout(() => navigate('/set-password', { state: { email } }), TIMING.successEnter + 1800)
  }

  function handleDigitChange(idx, val) {
    const cleaned = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = cleaned
    setDigits(next)
    if (cleaned && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus()
  }

  function handleKeyDown(idx, e) {
    if (e.key === 'Enter') { handleVerify(); return }
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        const next = [...digits]; next[idx] = ''; setDigits(next)
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus()
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    e.preventDefault()
    const next = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: C.bg,
      fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ── Glow blob ── */}
      <div style={{
        position: 'absolute', bottom: -135, left: '50%',
        transform: 'translateX(-50%)',
        width: '100vw', height: 200,
        background: C.gradient1,
        filter: 'blur(30px)',
        pointerEvents: 'none', borderRadius: '500%', zIndex: 0,
      }} />

      {/* ── Top bar ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '48px 72px 0',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/', { state: {} })}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 20px',
            background: 'transparent',
            border: `2px solid ${C.borderSubtle}`,
            borderRadius: 9999,
            fontSize: 14, fontWeight: 600, color: C.borderSubtle,
            fontFamily: 'inherit', cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.textPrimary; e.currentTarget.style.color = C.textPrimary }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderSubtle; e.currentTarget.style.color = C.borderSubtle }}
        >
          <ArrowLeftIcon /> Back
        </button>

        <button
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: C.surface, border: `1.5px solid ${C.borderSubtle}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#2e2e2e'; e.currentTarget.style.borderColor = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.borderSubtle }}
          aria-label="More options"
        >
          <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
            <circle cx="2" cy="2" r="1.5" fill="#AAAAAA"/>
            <circle cx="8" cy="2" r="1.5" fill="#AAAAAA"/>
            <circle cx="14" cy="2" r="1.5" fill="#AAAAAA"/>
          </svg>
        </button>
      </div>

      {/* ── Content column ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '6vh',
      }}>
        <div style={{
          width: 352,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 36,
        }}>

          {/* Logo — layoutId keeps it still during route transition */}
          <img src={logoVerticalRGB} alt="Webex" style={{ height: 80, objectFit: 'contain' }} />

          {/* ── Stage 0: OTP form ── */}
          <AnimatePresence mode="wait">
            {stage === 0 && (
              <motion.div
                key="otp-form"
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}
                initial={{ opacity: 0, y: FORM.exitY }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: FORM.exitY }}
                transition={FORM.spring}
              >
                {/* Heading */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <h1 style={{ fontSize: 32, lineHeight: '40px', fontWeight: 600, color: C.textPrimary, margin: 0, textAlign: 'center' }}>
                    We've sent you a code
                  </h1>
                  <p style={{ fontSize: 20, lineHeight: '28px', fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                    to {email}
                  </p>
                  <span
                    style={{ fontSize: 14, color: C.linkBlue, cursor: 'pointer', transition: 'opacity 0.15s', textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'rgba(92,179,240,0.4)' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    onClick={() => navigate('/', { state: { hideCard: true } })}
                  >
                    Use another account
                  </span>
                </div>

                {/* OTP boxes + Verify */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {digits.map((d, i) => (
                      <input
                        key={i}
                        ref={el => inputRefs.current[i] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onFocus={() => setActiveIdx(i)}
                        onChange={e => handleDigitChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        style={{
                          width: 52, height: 56, flexShrink: 0,
                          background: C.surface,
                          border: `1px solid ${activeIdx === i ? C.borderSubtle : C.border}`,
                          borderRadius: 8,
                          fontSize: 23, fontWeight: 500, color: C.textPrimary,
                          fontFamily: 'inherit', textAlign: 'center',
                          outline: 'none', caretColor: C.textPrimary,
                          transition: 'border-color 0.15s',
                          boxSizing: 'border-box',
                        }}
                      />
                    ))}
                  </div>

                  <button
                    disabled={!allFilled}
                    onClick={handleVerify}
                    style={{
                      width: '100%', padding: '14px 16px',
                      background: C.accentDim,
                      opacity: allFilled ? 1 : 0.45,
                      border: 'none', borderRadius: 9999,
                      fontSize: 14, fontWeight: 600, color: C.textPrimary,
                      fontFamily: 'inherit',
                      cursor: allFilled ? 'pointer' : 'default',
                      transition: 'background 0.15s, transform 0.1s, opacity 0.15s',
                    }}
                    onMouseEnter={e => { if (allFilled) { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.transform = 'translateY(-1px)' }}}
                    onMouseLeave={e => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.transform = 'translateY(0)' }}
                    onMouseDown={e => { if (allFilled) e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    Verify
                  </button>
                </div>

                {/* Resend */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: C.borderSubtle, margin: '0 0 6px' }}>
                    Don't see an email? Check your spam folder, or
                  </p>
                  <span
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 500, color: C.textLink, cursor: 'pointer', transition: 'opacity 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <RetryIcon /> Send a new code
                  </span>
                </div>

                {/* Email shortcuts */}
                <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                  {[{ label: 'Open Gmail', Icon: GmailIcon }, { label: 'Open Outlook', Icon: OutlookIcon }].map(({ label, Icon }) => (
                    <button
                      key={label}
                      style={{
                        flex: 1, padding: '12px 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: 'transparent',
                        border: `2px solid ${C.borderSubtle}`,
                        borderRadius: 8,
                        fontSize: 13, fontWeight: 500, color: C.textLink,
                        fontFamily: 'inherit', cursor: 'pointer',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.textPrimary; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderSubtle; e.currentTarget.style.background = 'transparent' }}
                    >
                      <Icon /> {label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Stage 1: Verifying ── */}
            {stage === 1 && (
              <motion.div
                key="verifying"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
                initial={{ opacity: 0, y: HEADING.enterY }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -HEADING.enterY }}
                transition={{ ...HEADING.spring, delay: (TIMING.verifyingEnter - TIMING.formExit) / 1000 }}
              >
                <h1 style={{ fontSize: 32, lineHeight: '40px', fontWeight: 600, color: C.textPrimary, margin: 0, textAlign: 'center' }}>
                  Verifying
                </h1>
                {/* Animated dots */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFFFFF' }}
                      initial={{ opacity: 0, scale: DOTS.scale }}
                      animate={{ opacity: [0, 1, 1, 0.4, 1], scale: [DOTS.scale, 1, 1, 0.7, 1] }}
                      transition={{
                        ...DOTS.spring,
                        delay: i * (DOTS.stagger / 1000),
                        repeat: Infinity,
                        repeatDelay: 0.4,
                        duration: 1.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Stage 2: Success ── */}
            {stage === 2 && (
              <motion.div
                key="success"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
                initial={{ opacity: 0, y: HEADING.enterY }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ ...HEADING.spring, delay: (TIMING.successEnter - TIMING.verifyingExit) / 1000 }}
              >
                {/* Checkmark — pops in with spring */}
                <motion.div
                  initial={{ scale: CHECK.initialScale, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...CHECK.spring, delay: (TIMING.checkEnter - TIMING.successEnter) / 1000 }}
                >
                  <CheckIcon />
                </motion.div>

                <h1 style={{ fontSize: 32, lineHeight: '40px', fontWeight: 600, color: C.textPrimary, margin: 0, textAlign: 'center' }}>
                  Verification successful!
                </h1>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  )
}
