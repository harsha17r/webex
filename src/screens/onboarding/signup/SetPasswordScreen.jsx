import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import logoVerticalRGB from '../../../assets/logos/RGB_Webex_Logo_lockup_vertical_whitetext.svg'

const C = {
  bg:           '#111111',
  surface:      '#222222',
  border:       '#494949',
  borderSubtle: '#AAAAAA',
  textPrimary:  '#FFFFFF',
  textSecond:   '#AAAAAA',
  textMuted:    '#737373',
  textRule:     '#E9E9E9',
  textLabel:    '#F7F7F7',
  accentDim:    '#1D8160',
  accentHover:  '#4ac397',
  green500:     '#2aab7d',
  red:          '#e05252',
  gradient1:    'linear-gradient(90deg, #4ac397 0%, #5cb3f0 100%)',
}

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Password rule error wiggle
 *
 *    0ms   "Set Password" clicked with unmet rules
 *    0ms   unmet dots instantly turn red
 *   30ms   each unmet rule wiggles (stagger 30ms apart)
 *          x: 0 → -5 → 5 → -3 → 3 → 0 (spring decay)
 *  380ms   all wiggles settle — red dots remain until fixed
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  contentEnter:  100,   // ms — content slides up on mount
  wiggleStagger: 30,    // ms — between each failing rule's wiggle
}

const CONTENT = {
  enterY: 40,
  spring: { type: 'spring', stiffness: 320, damping: 28 },
}

const WIGGLE = {
  keyframes:  [0, -5, 5, -3, 3, 0],   // x positions (px) — decay pattern
  duration:   0.38,                    // seconds total
  ease:       'easeInOut',
}

const MUST_CONTAIN = [
  { key: 'number',  label: '1 number',            test: p => /\d/.test(p) },
  { key: 'upper',   label: '1 uppercase letter',   test: p => /[A-Z]/.test(p) },
  { key: 'lower',   label: '1 lowercase letter',   test: p => /[a-z]/.test(p) },
  { key: 'special', label: '1 special character',  test: p => /[^A-Za-z0-9]/.test(p) },
  { key: 'length',  label: '8 characters',         test: p => p.length >= 8 },
]

const MUST_NOT = {
  label: 'Your name or email address',
  test: (p, email) => {
    if (!p) return true
    const lower = p.toLowerCase()
    const emailUser = email.split('@')[0].toLowerCase()
    if (emailUser.length >= 3 && lower.includes(emailUser)) return false
    return true
  },
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M8.5 2.5L4 7l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SetPasswordScreen() {
  const location = useLocation()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [wiggleTrigger, setWiggleTrigger] = useState(0)

  const email = location.state?.email || ''

  const mustContainResults = MUST_CONTAIN.map(r => r.test(password))
  const mustNotResult = MUST_NOT.test(password, email)
  const allValid = mustContainResults.every(Boolean) && mustNotResult

  return (
    <div style={{
      width: '100vw', height: '100vh',
  background: C.bg,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Glow blob */}
      <div style={{
        position: 'absolute',
        bottom: -135,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100vw',
        height: 200,
        background: C.gradient1,
        filter: 'blur(30px)',
        borderRadius: '500%',
        pointerEvents: 'none',
      }} />

      {/* Top bar — matches VerifyScreen exactly */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '48px 72px 0',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate(-1)}
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

      {/* Content area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '6vh',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ width: 352, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>

          {/* Logo — no animation, appears instantly in same position as VerifyScreen */}
          <img src={logoVerticalRGB} alt="Webex" style={{ height: 80, objectFit: 'contain' }} />

          {/* Everything below slides up */}
          <motion.div
            initial={{ opacity: 0, y: CONTENT.enterY }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...CONTENT.spring, delay: TIMING.contentEnter / 1000 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}
          >

          {/* Form inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
            {/* Full name */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: C.textLabel, marginBottom: 8 }}>
                Full name
              </label>
              <input
                autoFocus
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: '100%', padding: 16,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  fontSize: 16, fontWeight: 500, color: C.textPrimary,
                  fontFamily: 'inherit', outline: 'none',
                  caretColor: C.textPrimary, boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = C.borderSubtle}
                onBlur={e => e.currentTarget.style.borderColor = C.border}
              />
            </div>

            {/* Password field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                color: C.textLabel,
                marginBottom: 8,
              }}>
                New password
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                background: C.surface,
                border: `1px solid ${inputFocused ? C.borderSubtle : C.border}`,
                borderRadius: 8,
                transition: 'border-color 0.2s',
              }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { if (allValid) { navigate('/home', { state: { name, email, fromOnboarding: true } }) } else { setSubmitted(true); setWiggleTrigger(t => t + 1) } } }}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: C.textPrimary,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    flex: 1,
                    fontFamily: 'inherit',
                    caretColor: C.textPrimary,
                  }}
                />
                <button
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke={C.borderSubtle} strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="1" y1="1" x2="23" y2="23" stroke={C.borderSubtle} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={C.borderSubtle} strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="3" stroke={C.borderSubtle} strokeWidth="1.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Set Password button */}
            <button
              onClick={() => {
                if (allValid) { navigate('/home', { state: { name, email, fromOnboarding: true } }); return }
                setSubmitted(true)
                setWiggleTrigger(t => t + 1)
              }}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 9999,
                border: 'none',
                background: allValid && btnHovered ? C.accentHover : C.accentDim,
                opacity: allValid ? 1 : 0.45,
                cursor: allValid ? 'pointer' : 'default',
                transform: allValid && btnHovered ? 'translateY(-1px)' : 'none',
                transition: 'background 0.2s, transform 0.2s, opacity 0.2s',
                fontSize: 14,
                fontWeight: 600,
                color: C.textPrimary,
                fontFamily: 'inherit',
              }}
            >
              Set Password
            </button>
          </div>

          {/* Validation rules section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%' }}>
            {/* Must contain at least */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: C.textLabel }}>
                Must contain at least
              </span>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px 16px',
              }}>
                {MUST_CONTAIN.map((rule, i) => {
                  const met = mustContainResults[i]
                  const showError = submitted && !met
                  return (
                    <motion.div
                      key={rule.key}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                      animate={showError ? { x: WIGGLE.keyframes } : { x: 0 }}
                      transition={{ duration: WIGGLE.duration, ease: WIGGLE.ease, delay: i * (TIMING.wiggleStagger / 1000) }}
                      {...(showError ? { key: `${rule.key}-${wiggleTrigger}` } : {})}
                    >
                      <div style={{
                        width: 12, height: 12, borderRadius: '50%',
                        background: met ? C.green500 : (submitted ? C.red : C.surface),
                        border: met || submitted ? 'none' : `1px solid ${C.border}`,
                        transition: 'background 0.2s',
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 14, color: showError ? C.red : C.textRule, transition: 'color 0.2s' }}>{rule.label}</span>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Must not contain */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: C.textLabel }}>
                Must not contain
              </span>
              {(() => {
                const met = mustNotResult
                const showError = submitted && !met
                return (
                  <motion.div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    animate={showError ? { x: WIGGLE.keyframes } : { x: 0 }}
                    transition={{ duration: WIGGLE.duration, ease: WIGGLE.ease, delay: MUST_CONTAIN.length * (TIMING.wiggleStagger / 1000) }}
                    key={showError ? `mustnot-${wiggleTrigger}` : 'mustnot'}
                  >
                    <div style={{
                      width: 12, height: 12, borderRadius: '50%',
                      background: met ? C.green500 : (submitted ? C.red : C.surface),
                      border: met || submitted ? 'none' : `1px solid ${C.border}`,
                      transition: 'background 0.2s',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 14, color: showError ? C.red : C.textRule, transition: 'color 0.2s' }}>{MUST_NOT.label}</span>
                  </motion.div>
                )
              })()}
            </div>
          </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
