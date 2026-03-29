import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { COMPANY, EMPLOYEE } from '../../../config/employee'

/* ─────────────────────────────────────────────────────────
 * LumonLoginScreen
 *
 * Lumon Industries–branded identity provider page.
 * Light background to signal the user has left Webex
 * and landed on an external corporate SSO portal.
 *
 * Layout:
 *   bg: #EEF2F6 (light blue-gray)
 *   Card: white, shadow, centered
 *     Lumon globe logo
 *     "Lumon Industries" + subtitle
 *     Email (pre-filled, read-only)
 *     Password field
 *     "Sign in" CTA (Lumon blue)
 *   Footer: "Secured by Cisco Webex" text
 * ───────────────────────────────────────────────────────── */

const LUMON = COMPANY.color  // #0076A3

export function LumonLoginScreen() {
  const navigate = useNavigate()
  const location  = useLocation()
  const email     = location.state?.email || EMPLOYEE.email

  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [pwFocus,  setPwFocus]  = useState(false)

  function handleSignIn() {
    if (!password || loading) return
    setLoading(true)
    navigate('/sso-loading', { state: { email } })
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#EEF2F6',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── Card ── */}
      <div style={{
        width: 400,
        padding: '48px 40px 40px',
        background: '#FFFFFF',
        borderRadius: 16,
        boxShadow: '0 2px 24px rgba(0,26,51,0.10)',
        display: 'flex', flexDirection: 'column',
        gap: 28,
      }}>

        {/* Header — Lumon logo + name */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 14,
        }}>
          <img
            src="/lumon-logo.svg"
            alt="Lumon Industries"
            style={{ width: 160, height: 'auto', borderRadius: 6 }}
          />
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: 20, fontWeight: 700,
              color: '#001A33', margin: 0,
              letterSpacing: '-0.01em',
            }}>
              {COMPANY.name}
            </p>
            <p style={{ fontSize: 13, color: '#7A8A99', margin: '5px 0 0' }}>
              Sign in to your account
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Email — read-only, pre-filled */}
          <div>
            <label style={{
              fontSize: 12, fontWeight: 500, color: '#4A5568',
              display: 'block', marginBottom: 6,
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              style={{
                width: '100%', padding: '11px 14px',
                background: '#F5F7FA',
                border: '1px solid #D8DEE6',
                borderRadius: 8,
                fontSize: 14, color: '#5A6473',
                fontFamily: 'inherit', outline: 'none',
                boxSizing: 'border-box',
                cursor: 'default',
              }}
            />
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#4A5568' }}>Password</label>
              <span style={{ fontSize: 12, color: LUMON, cursor: 'pointer', fontWeight: 500 }}>
                Forgot password?
              </span>
            </div>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignIn()}
              onFocus={() => setPwFocus(true)}
              onBlur={() => setPwFocus(false)}
              style={{
                width: '100%', padding: '11px 14px',
                background: '#FFFFFF',
                border: `1px solid ${pwFocus ? LUMON : '#D8DEE6'}`,
                borderRadius: 8,
                fontSize: 14, color: '#111',
                fontFamily: 'inherit', outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
                boxShadow: pwFocus ? `0 0 0 3px rgba(0,118,163,0.15)` : 'none',
              }}
            />
          </div>

          {/* Sign in button */}
          <button
            onClick={handleSignIn}
            disabled={!password || loading}
            style={{
              width: '100%', padding: '13px',
              background: !password || loading ? '#B8C8D8' : LUMON,
              border: 'none', borderRadius: 9999,
              fontSize: 14, fontWeight: 600, color: '#FFFFFF',
              fontFamily: 'inherit',
              cursor: !password || loading ? 'default' : 'pointer',
              transition: 'background 0.15s',
              marginTop: 2,
            }}
            onMouseEnter={e => {
              if (!password || loading) return
              e.currentTarget.style.background = '#0089b5'
            }}
            onMouseLeave={e => {
              if (!password || loading) return
              e.currentTarget.style.background = LUMON
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

        </div>
      </div>

      {/* ── Footer — Secured by Cisco Webex ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginTop: 28,
      }}>
        {/* Small Webex shield-ish icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z"
            stroke="#99AAB8" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize: 12, color: '#99AAB8' }}>
          Secured by Cisco Webex SSO
        </span>
      </div>

    </div>
  )
}
