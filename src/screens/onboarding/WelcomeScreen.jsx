import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import webexLogo from '../../assets/logos/RGB_Webex_Logo_lockup_horizontal_whitetext.svg'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:           '#111111',
  surface:      '#222222',
  border:       '#494949',
  borderSubtle: '#AAAAAA',
  textPrimary:  '#FFFFFF',
  textSecond:   '#AAAAAA',
  textMuted:    '#737373',
  // Unified accent — single green family for links + CTA
  accent:       '#2AAB7D',   // green-500 from design system (was split blue/green)
  accentDim:    '#1c8160',   // darker shade for CTA button bg
  accentHover:  '#4ac397',   // green.400
  gradient1:    'linear-gradient(90deg, #4ac397 0%, #5cb3f0 100%)',  // green.400 → blue.400
}

// ── Benefit statements ────────────────────────────────────────────────────────
const benefits = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#2AAB7D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="13" height="10" rx="2"/>
        <path d="M15 11.5L22 8v8l-7-3.5"/>
      </svg>
    ),
    headline: 'Meet anyone, from anywhere',
    sub: 'Up to 100 people per meeting — screen sharing, whiteboard, and HD video included.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#2AAB7D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
        <line x1="8" y1="22" x2="16" y2="22"/>
      </svg>
    ),
    headline: 'Sound clear from any room',
    sub: "Cisco AI removes background noise automatically — so every word gets through.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#2AAB7D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    headline: 'Enterprise security, free',
    sub: 'End-to-end encryption and FedRAMP authorization — the same protection Fortune 500s rely on.',
  },
]

// ── Icons ─────────────────────────────────────────────────────────────────────
function VideoCameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="8.5" height="8" rx="1.5" stroke="white" strokeWidth="1.33"/>
      <path d="M9.5 6.8L14.5 4.5V11.5L9.5 9.2" stroke="white" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}


function MicrosoftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="7.5" height="7.5" fill="#F35325"/>
      <rect x="9.5" y="1" width="7.5" height="7.5" fill="#81BC06"/>
      <rect x="1" y="9.5" width="7.5" height="7.5" fill="#05A6F0"/>
      <rect x="9.5" y="9.5" width="7.5" height="7.5" fill="#FFBA08"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.53 4zm-3.1-17.6c.07 1.96-1.43 3.6-3.32 3.76-.24-1.9 1.44-3.63 3.32-3.76z"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function SSOIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path fill="white" d="m10.313 11.566l7.94-7.94l2.121 2.12l-1.414 1.415l2.121 2.121l-3.535 3.536l-2.121-2.121l-2.99 2.99a5.002 5.002 0 0 1-7.97 5.849a5 5 0 0 1 5.848-7.97m-.899 5.848a2 2 0 1 0-2.828-2.828a2 2 0 0 0 2.828 2.828"/>
    </svg>
  )
}

const providers = [
  { id: 'sso',       label: 'SSO',       Icon: SSOIcon },
  { id: 'microsoft', label: 'Microsoft', Icon: MicrosoftIcon },
  { id: 'apple',     label: 'Apple',     Icon: AppleIcon },
  { id: 'google',    label: 'Google',    Icon: GoogleIcon },
]

// ── Shared hover handler ───────────────────────────────────────────────────────
const linkHover = {
  onMouseEnter: e => { e.currentTarget.style.opacity = '0.75' },
  onMouseLeave: e => { e.currentTarget.style.opacity = '1' },
}

// ── SSO domain list ───────────────────────────────────────────────────────────
const SSO_DOMAINS = ['lumon.com']

// ── Component ─────────────────────────────────────────────────────────────────
function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

export function WelcomeScreen() {
  const location = useLocation()
  const [cardVisible, setCardVisible] = useState(!location.state?.hideCard)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleGetStarted() {
    const v = email.trim()
    if (!v) { setError('Please enter your email address.'); return }
    if (!isValidEmail(v)) { setError('Please enter a valid email address.'); return }
    setError('')
    const domain = v.split('@')[1]?.toLowerCase()
    if (SSO_DOMAINS.includes(domain)) {
      navigate('/lumon-login', { state: { email: v } })
    } else {
      navigate('/verify', { state: { email: v } })
    }
  }

  function handleSSOClick() {
    navigate('/sso', { state: { email: email.trim() } })
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: C.bg,
      fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── Glow blob ── */}
      <div style={{
        position: 'absolute',
        bottom: -135,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100vw',
        height: 200,
        background: C.gradient1,
        filter: 'blur(30px)',
        opacity: 1,
        pointerEvents: 'none',
        borderRadius: '500%',
        zIndex: 0,
      }} />

      {/* ── Top bar ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '48px 72px 0',
        flexShrink: 0,
      }}>
        <img src={webexLogo} alt="Webex" style={{ width: 161, height: 32 }} />
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

      {/* ── Two-column layout ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0px 72px 48px',
        gap: cardVisible ? 240 : 0,
        transition: 'gap 0.3s ease',
      }}>

        {/* ── LEFT: Benefits card — animated wrapper ── */}
        <div style={{
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
          width: cardVisible ? 394 : 0,
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? 'translateX(0)' : 'translateX(-24px)',
        }}>
          <div style={{
            position: 'relative',
            width: 394,
            display: 'flex', flexDirection: 'column',
            gap: 32,
            padding: '44px 40px',
            background: C.surface,
            borderRadius: 16,
          }}>
            {/* Gradient border — 1.5px, not 3px, to not overpower the card content */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 16, padding: 1.5,
              background: 'linear-gradient(180deg, #4ac397 0%, #5cb3f0 100%)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor', maskComposite: 'exclude',
              pointerEvents: 'none',
            }} />

            {/* X close button */}
            <button
              onClick={() => setCardVisible(false)}
              aria-label="Dismiss"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.querySelector('svg').style.stroke = '#AAAAAA'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.querySelector('svg').style.stroke = '#737373'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ stroke: '#737373', transition: 'stroke 0.15s' }}>
                <path d="M1 1L11 11M11 1L1 11" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.accent, margin: 0 }}>
                Webex Free
              </span>
              <p style={{ fontSize: 14, lineHeight: '18px', color: C.textMuted, margin: 0 }}>
                No credit card required.
              </p>
            </div>

            {/* 3 benefit blocks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {benefits.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>{b.icon}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <p style={{ fontSize: 15, lineHeight: '21px', fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                      {b.headline}
                    </p>
                    <p style={{ fontSize: 12, lineHeight: '18px', color: C.textSecond, margin: 0 }}>
                      {b.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{ fontSize: 14, fontWeight: 500, color: '#5cb3f0', cursor: 'pointer', transition: 'opacity 0.15s' }}
                {...linkHover}
              >
                See full plan details →
              </span>
              <span
                style={{ fontSize: 12, fontWeight: 500, color: C.textSecond, cursor: 'pointer', transition: 'opacity 0.15s' }}
                {...linkHover}
              >
                Compare plans
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Sign-up form ── */}
        {/* Gap rhythm: 8 (heading cluster) → 24 (section) → 16 (within form) → 24 (section) → 48 (to footer) */}
        <div style={{
          width: 360, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          gap: 28,
        }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Heading */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h1 style={{ fontSize: 32, lineHeight: '40px', fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                Welcome to Webex
              </h1>
              <p style={{ fontSize: 14, lineHeight: '20px', color: C.textSecond, margin: 0 }}>
                Have an account?{' '}
                <span style={{ color: '#5cb3f0', cursor: 'pointer', transition: 'opacity 0.15s' }} {...linkHover}>
                  Login here
                </span>
              </p>
            </div>

            {/* Email + CTA — shared r=8, gap=10 within group */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="email"
                placeholder="name@work-mail.com"
                value={email}
                onChange={e => { setEmail(e.target.value); if (error) setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleGetStarted()}
                style={{
                  width: '100%', padding: '14px 16px',
                  background: C.surface,
                  border: `1px solid ${error ? '#e05252' : C.border}`,
                  borderRadius: 8,
                  fontSize: 14, lineHeight: '20px', color: C.textPrimary,
                  fontFamily: 'inherit', outline: 'none',
                  transition: 'border-color 0.15s, background 0.15s',
                  boxSizing: 'border-box',
                  caretColor: C.textPrimary,
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = error ? '#e05252' : C.textPrimary
                  e.currentTarget.style.background = '#2a2a2a'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = error ? '#e05252' : C.border
                  e.currentTarget.style.background = C.surface
                }}
              />
              {error && (
                <p style={{ fontSize: 12, color: '#e05252', margin: '0 4px' }}>{error}</p>
              )}
              <button
                onClick={handleGetStarted}
                style={{
                  width: '100%', padding: '14px 16px',
                  background: C.accentDim,
                  border: 'none', borderRadius: 9999,
                  fontSize: 14, fontWeight: 600, color: C.textPrimary,
                  fontFamily: 'inherit', cursor: 'pointer',
                  transition: 'background 0.15s, transform 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.transform = 'translateY(0)' }}
                onMouseDown={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Get started for free
              </button>
            </div>

            {/* SSO — 28px gap from CTA to signal new section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
              <p style={{ fontSize: 13, color: C.textSecond, textAlign: 'center', margin: 0 }}>
                or continue with
              </p>

              {/* SSO pills — uniform borderSubtle (same as Join meeting), label at #AAAAAA */}
              <div style={{ display: 'flex', gap: 18 }}>
                {providers.map(({ id, label, Icon }) => (
                  <div key={id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <button
                      style={{
                        width: '100%', height: 48,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'transparent',
                        border: `1px solid ${C.borderSubtle}`,
                        borderRadius: 9999,
                        cursor: 'pointer',
                        transition: 'border-color 0.15s, background 0.15s, transform 0.1s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderSubtle; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)' }}
                      onMouseDown={e => e.currentTarget.style.transform = 'translateY(0)'}
                      onClick={id === 'sso' ? handleSSOClick : undefined}
                      aria-label={`Continue with ${label}`}
                    >
                      <Icon />
                    </button>
                    {/* Labels at #AAAAAA, not #737373 (was same as placeholder — read as disabled) */}
                    <span style={{ fontSize: 11, lineHeight: '20px', color: C.textSecond }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Secondary actions ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>

            {/* FedRAMP — subtle inline label + link, clearly secondary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14, color: C.textMuted }}>for FedRAMP users</span>
              <span
                style={{
                  fontSize: 14, fontWeight: 500, color: C.textSecond,
                  cursor: 'pointer', transition: 'color 0.15s',
                  textDecoration: 'underline', textUnderlineOffset: 3,
                  textDecorationColor: C.border,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.textDecorationColor = C.textSecond }}
                onMouseLeave={e => { e.currentTarget.style.color = C.textSecond; e.currentTarget.style.textDecorationColor = C.border }}
              >
                Switch to Webex for Government
              </span>
            </div>

            {/* Join a meeting — outlined pill button, full width */}
            <button
              style={{
                width: '100%', height: 48,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: 9999,
                fontSize: 14, fontWeight: 500, color: C.textSecond,
                fontFamily: 'inherit', cursor: 'pointer',
                transition: 'border-color 0.15s, color 0.15s, background 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderSubtle; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecond; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)' }}
              onMouseDown={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <VideoCameraIcon />
              Join a meeting
            </button>

            <p style={{ fontSize: 11, lineHeight: '18px', color: C.textMuted, textAlign: 'center', margin: 0 }}>
              By using Webex, you agree to the{' '}
              <span style={{ color: C.accent, cursor: 'pointer', transition: 'opacity 0.15s' }} {...linkHover}>Terms of Service</span>
              {' '}and{' '}
              <span style={{ color: C.accent, cursor: 'pointer', transition: 'opacity 0.15s' }} {...linkHover}>Privacy Statement</span>.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
