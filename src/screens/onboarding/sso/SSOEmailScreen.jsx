import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import logoVerticalRGB from '../../../assets/logos/RGB_Webex_Logo_lockup_vertical_whitetext.svg'

/* ─────────────────────────────────────────────────────────
 * SSOEmailScreen
 *
 * Layout mirrors SetPasswordScreen exactly:
 *   Top bar — Back pill (left) + "..." options (right)
 *   Content — flex-start, paddingTop 6vh
 *             vertical Webex logo → form slides up on mount
 * ───────────────────────────────────────────────────────── */

const SSO_DOMAINS = ['lumon.com']

const C = {
  bg:          '#111111',
  surface:     '#222222',
  border:      '#494949',
  borderSubtle:'#AAAAAA',
  textPrimary: '#FFFFFF',
  textSecond:  '#AAAAAA',
  textMuted:   '#737373',
  textLabel:   '#F7F7F7',
  accentDim:   '#1D8160',
  accentHover: '#4ac397',
  red:         '#e05252',
  gradient1:   'linear-gradient(90deg, #4ac397 0%, #5cb3f0 100%)',
}

const CONTENT = {
  enterY: 40,
  spring: { type: 'spring', stiffness: 320, damping: 28 },
  delay:  0.1,
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M8.5 2.5L4 7l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SSOEmailScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [error, setError] = useState('')

  function handleContinue() {
    const v = email.trim()
    if (!v) { setError('Please enter your work email.'); return }
    if (!isValidEmail(v)) { setError('Please enter a valid email address.'); return }
    const domain = v.split('@')[1]?.toLowerCase()
    if (!SSO_DOMAINS.includes(domain)) {
      setError('No SSO provider found for this domain.')
      return
    }
    setError('')
    navigate('/lumon-login', { state: { email: v } })
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: C.bg,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── Glow blob ── */}
      <div style={{
        position: 'absolute',
        bottom: -135, left: '50%',
        transform: 'translateX(-50%)',
        width: '100vw', height: 200,
        background: C.gradient1,
        filter: 'blur(30px)',
        borderRadius: '500%',
        pointerEvents: 'none',
      }} />

      {/* ── Top bar — Back pill + "..." button ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '48px 72px 0',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/')}
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

      {/* ── Content area ── */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '6vh',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: 352, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>

          {/* Vertical Webex logo — appears instantly */}
          <img src={logoVerticalRGB} alt="Webex" style={{ height: 80, objectFit: 'contain' }} />

          {/* Form slides up on mount */}
          <motion.div
            initial={{ opacity: 0, y: CONTENT.enterY }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...CONTENT.spring, delay: CONTENT.delay }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}
          >

            {/* Email input */}
            <div>
              <label style={{
                display: 'block', fontSize: 14, fontWeight: 500,
                color: C.textLabel, marginBottom: 8,
              }}>
                Work email
              </label>
              <input
                autoFocus
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={e => { setEmail(e.target.value); if (error) setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleContinue()}
                style={{
                  width: '100%', padding: 16,
                  background: C.surface,
                  border: `1px solid ${error ? C.red : C.border}`,
                  borderRadius: 8,
                  fontSize: 16, fontWeight: 500, color: C.textPrimary,
                  fontFamily: 'inherit', outline: 'none',
                  caretColor: C.textPrimary, boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = error ? C.red : C.borderSubtle}
                onBlur={e => e.currentTarget.style.borderColor = error ? C.red : C.border}
              />
              {error && (
                <p style={{ fontSize: 12, color: C.red, margin: '6px 0 0 2px' }}>{error}</p>
              )}
            </div>

            {/* Continue button */}
            <button
              onClick={handleContinue}
              style={{
                width: '100%', padding: '14px 16px',
                borderRadius: 9999, border: 'none',
                background: C.accentDim,
                fontSize: 14, fontWeight: 600, color: C.textPrimary,
                fontFamily: 'inherit', cursor: 'pointer',
                transition: 'background 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.transform = 'translateY(0)' }}
              onMouseDown={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Continue
            </button>

          </motion.div>
        </div>
      </div>
    </div>
  )
}
