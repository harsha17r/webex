import { useState } from 'react'
import { motion } from 'motion/react'
import { useProfile } from '../../context/ProfileContext'

/* ─────────────────────────────────────────────────────────
 * ConnectCalendarModal
 *
 * Purely fictional — clicking a provider marks the checklist
 * task as done and updates the MeetingsTab button.
 *
 * Props:
 *   onClose — close without saving
 *   onSave  — called when a provider is chosen (marks task done)
 * ───────────────────────────────────────────────────────── */

const PROVIDERS = [
  {
    id: 'microsoft',
    name: 'Microsoft 365',
    sub: 'Outlook, Teams calendar',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="1"    y="1"    width="10.5" height="10.5" fill="#F25022"/>
        <rect x="12.5" y="1"    width="10.5" height="10.5" fill="#7FBA00"/>
        <rect x="1"    y="12.5" width="10.5" height="10.5" fill="#00A4EF"/>
        <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900"/>
      </svg>
    ),
  },
  {
    id: 'google',
    name: 'Google Calendar',
    sub: 'Gmail, Google Workspace',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="19" rx="2" fill="#FFFFFF"/>
        <rect x="2" y="3" width="20" height="7" rx="2" fill="#1967D2"/>
        <rect x="2" y="8"  width="20" height="2" fill="#1967D2"/>
        <rect x="8"  y="1" width="2" height="5" rx="1" fill="#1967D2"/>
        <rect x="14" y="1" width="2" height="5" rx="1" fill="#1967D2"/>
        <rect x="4"  y="13" width="4" height="4" rx="1" fill="#EA4335"/>
        <rect x="10" y="13" width="4" height="4" rx="1" fill="#34A853"/>
        <rect x="16" y="13" width="4" height="4" rx="1" fill="#FBBC04"/>
      </svg>
    ),
  },
]

export function ConnectCalendarModal({ onClose, onSave }) {
  const { profile } = useProfile()
  const [hoveredProvider, setHoveredProvider] = useState(null)

  function handleChoose() {
    onSave?.()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.72)',
        zIndex: 1100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: 440,
          background: '#111111',
          border: '1px solid #494949',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0px 33px 120px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', gap: 16,
          boxSizing: 'border-box',
        }}
      >

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF', margin: 0, lineHeight: '32px' }}>
            Connect a calendar
          </h2>
          {profile.email && (
            <p style={{ fontSize: 14, fontWeight: 400, color: '#AAAAAA', margin: 0, lineHeight: '20px' }}>
              for {profile.email}
            </p>
          )}
        </div>

        {/* Info banner */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          background: '#081E3D',
          border: '1px solid #0E3260',
          borderRadius: 8,
          padding: 12,
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="10" cy="10" r="8.5" stroke="#92CBF2" strokeWidth="1.4"/>
            <path d="M10 9v5" stroke="#92CBF2" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="10" cy="6.5" r="0.8" fill="#92CBF2"/>
          </svg>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#92CBF2', margin: 0, lineHeight: '20px' }}>
            You'll be briefly taken to your calendar provider to sign in, then brought right back.
          </p>
        </div>

        {/* Provider options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {PROVIDERS.map(p => (
            <div
              key={p.id}
              onClick={handleChoose}
              onMouseEnter={() => setHoveredProvider(p.id)}
              onMouseLeave={() => setHoveredProvider(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '12px 20px',
                border: `1px solid ${hoveredProvider === p.id ? '#737373' : '#494949'}`,
                borderRadius: 8,
                cursor: 'pointer',
                background: hoveredProvider === p.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              {/* Icon */}
              <div style={{ flexShrink: 0 }}>{p.icon}</div>

              {/* Text */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: '#FFFFFF', lineHeight: '24px' }}>
                  {p.name}
                </span>
                <span style={{ fontSize: 14, fontWeight: 400, color: '#AAAAAA', lineHeight: '20px' }}>
                  {p.sub}
                </span>
              </div>

              {/* Chevron */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M9 6l6 6-6 6" stroke="#D4D4D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ))}
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '14px 16px',
            background: '#494949', border: 'none', borderRadius: 9999,
            fontSize: 14, fontWeight: 500, color: '#FFFFFF',
            cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#5A5A5A'}
          onMouseLeave={e => e.currentTarget.style.background = '#494949'}
        >
          Cancel
        </button>

      </motion.div>
    </motion.div>
  )
}
