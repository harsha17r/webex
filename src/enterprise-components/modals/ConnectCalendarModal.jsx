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
      <svg width="24" height="24" viewBox="0 0 256 256" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
        <path fill="#fff" d="M195.368 60.632H60.632v134.736h134.736z"/>
        <path fill="#ea4335" d="M195.368 256L256 195.368l-30.316-5.172l-30.316 5.172l-5.533 27.73z"/>
        <path fill="#188038" d="M0 195.368v40.421C0 246.956 9.044 256 20.21 256h40.422l6.225-30.316l-6.225-30.316l-33.033-5.172z"/>
        <path fill="#1967d2" d="M256 60.632V20.21C256 9.044 246.956 0 235.79 0h-40.422q-5.532 22.554-5.533 33.196q0 10.641 5.533 27.436q20.115 5.76 30.316 5.76T256 60.631"/>
        <path fill="#fbbc04" d="M256 60.632h-60.632v134.736H256z"/>
        <path fill="#34a853" d="M195.368 195.368H60.632V256h134.736z"/>
        <path fill="#4285f4" d="M195.368 0H20.211C9.044 0 0 9.044 0 20.21v175.158h60.632V60.632h134.736z"/>
        <path fill="#4285f4" d="M88.27 165.154c-5.036-3.402-8.523-8.37-10.426-14.94l11.689-4.816q1.59 6.063 5.558 9.398c2.627 2.223 5.827 3.318 9.566 3.318q5.734 0 9.852-3.487c2.746-2.324 4.127-5.288 4.127-8.875q0-5.508-4.345-8.994c-2.897-2.324-6.535-3.486-10.88-3.486h-6.754v-11.57h6.063q5.608 0 9.448-3.033c2.56-2.02 3.84-4.783 3.84-8.303c0-3.132-1.145-5.625-3.435-7.494c-2.29-1.87-5.188-2.813-8.708-2.813c-3.436 0-6.164.91-8.185 2.745a16.1 16.1 0 0 0-4.413 6.754l-11.57-4.817c1.532-4.345 4.345-8.185 8.471-11.503s9.398-4.985 15.798-4.985c4.733 0 8.994.91 12.767 2.745c3.772 1.836 6.736 4.379 8.875 7.613c2.14 3.25 3.2 6.888 3.2 10.93c0 4.126-.993 7.613-2.98 10.476s-4.43 5.052-7.327 6.585v.69a22.25 22.25 0 0 1 9.398 7.327c2.442 3.284 3.672 7.208 3.672 11.79c0 4.58-1.163 8.673-3.487 12.26c-2.324 3.588-5.54 6.417-9.617 8.472c-4.092 2.055-8.69 3.1-13.793 3.1c-5.912.016-11.369-1.685-16.405-5.087m71.797-58.005l-12.833 9.28l-6.417-9.734l23.023-16.607h8.825v78.333h-12.598z"/>
      </svg>
    ),
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    sub: 'iCloud, iPhone, Mac',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path fill="#FFFFFF" d="M17.05 20.28c-.98.95-2.05.8-3.08.35c-1.09-.46-2.09-.48-3.24 0c-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8c1.18-.24 2.31-.93 3.57-.84c1.51.12 2.65.72 3.4 1.8c-3.12 1.87-2.38 5.98.48 7.13c-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25c.29 2.58-2.34 4.5-3.74 4.25"/>
      </svg>
    ),
  },
  {
    id: 'notion',
    name: 'Notion Calendar',
    sub: 'Notion workspace, team & personal',
    icon: (
      <span
        style={{
          width: 24, height: 24, borderRadius: 6, background: '#F5F5F5',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-hidden
      >
        <img
          src="https://api.iconify.design/devicon:notion.svg"
          width={18}
          height={18}
          alt=""
          style={{ display: 'block' }}
        />
      </span>
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
