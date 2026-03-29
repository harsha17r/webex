import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { COMPANY, EMPLOYEE } from '../../../config/employee'
import logoVerticalRGB from '../../../assets/logos/RGB_Webex_Logo_lockup_vertical_whitetext.svg'

/* ─────────────────────────────────────────────────────────
 * ProfileReviewScreen — Two-column, single-fold layout
 *
 * LEFT PANEL (320px)
 *   Webex vertical logo
 *   "Review your profile" heading + subtitle
 *   Admin info banner
 *   Avatar + name + upload button (row layout)
 *
 * RIGHT PANEL (flex: 1, max ~520px)
 *   Display name (editable)
 *   Phone number (editable, optional)
 *   ── Account details ──
 *   Locked 2-col grid: Full name  | Work email
 *                      Job title  | Department
 *                      Organization (full width)
 *   Save & continue →
 *
 * No glow. No scroll. All content in one fold.
 * Right panel slides up on mount.
 * ───────────────────────────────────────────────────────── */

const C = {
  bg:           '#111111',
  surface:      '#1E1E1E',    // slightly lighter — inputs are visible now
  surfaceLock:  '#1A1A1A',
  border:       '#383838',    // was #2A2A2A — much more visible
  borderFocus:  '#4ac397',
  borderSubtle: '#AAAAAA',
  textPrimary:  '#FFFFFF',
  textSecond:   '#AAAAAA',
  textMuted:    '#666666',
  textLock:     '#8A8A8A',    // was #6A6A6A — actually readable now
  accentDim:    '#1c8160',
  accentHover:  '#4ac397',
  infoBg:       'rgba(92, 179, 240, 0.07)',
  infoBorder:   'rgba(92, 179, 240, 0.22)',
  infoText:     '#5cb3f0',
}

const CONTENT = {
  enterY: 24,
  spring: { type: 'spring', stiffness: 320, damping: 28 },
  delay:  0.15,
}

/* ── Icons ────────────────────────────────────────────── */

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M8.5 2.5L4 7l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4M12 8h.01"/>
    </svg>
  )
}

/* ── Sub-components ───────────────────────────────────── */

function SectionDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <span style={{
        fontSize: 10, fontWeight: 600, color: C.textMuted,
        textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  )
}

function LockedField({ label, value }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 5,
      }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: C.textSecond }}>
          {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: C.textMuted }}>
          <LockIcon />
          <span style={{ fontSize: 11, color: C.textMuted, letterSpacing: '0.02em' }}>
            Admin-managed
          </span>
        </div>
      </div>
      <div style={{
        width: '100%', padding: '8px 12px',
        background: C.surfaceLock,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        fontSize: 13, color: C.textLock,
        fontFamily: "'Inter', system-ui, sans-serif",
        boxSizing: 'border-box',
        userSelect: 'none', cursor: 'default',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {value}
      </div>
    </div>
  )
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

/* ── Main screen ──────────────────────────────────────── */

export function ProfileReviewScreen() {
  const navigate    = useNavigate()
  const fileRef     = useRef(null)

  const [displayName, setDisplayName] = useState(EMPLOYEE.name)
  const [phone,       setPhone]       = useState('')
  const [photo,       setPhoto]       = useState(null)
  const [nameFocus,   setNameFocus]   = useState(false)
  const [phoneFocus,  setPhoneFocus]  = useState(false)

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: C.bg,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ── Top bar — Back pill + "…" button ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '28px 72px 0',
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

      {/* ── Two-column layout ── */}
      {/* Note: no alignItems here — default 'stretch' lets inner div fill full height,
          so justifyContent: 'center' on each panel actually works. */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: '3vh 72px 4vh',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 64,
          width: '100%',
          maxWidth: 940,
        }}>

          {/* ── LEFT PANEL ── */}
          <div style={{
            width: 320, flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: 20,
          }}>

            {/* Heading — single line */}
            <div>
              <h1 style={{
                fontSize: 26, fontWeight: 700, lineHeight: '32px',
                color: C.textPrimary, margin: '0 0 8px',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}>
                Review your profile
              </h1>
              <p style={{ fontSize: 13, color: C.textSecond, margin: 0, lineHeight: 1.55 }}>
                Make sure everything looks right before you get started.
              </p>
            </div>

            {/* Info banner */}
            <div style={{
              background: C.infoBg,
              border: `1px solid ${C.infoBorder}`,
              borderRadius: 10,
              padding: '11px 14px',
              display: 'flex', gap: 9, alignItems: 'flex-start',
            }}>
              <div style={{ color: C.infoText, flexShrink: 0, marginTop: 1 }}>
                <InfoIcon />
              </div>
              <p style={{ fontSize: 12, color: C.infoText, margin: 0, lineHeight: 1.55 }}>
                Some fields are managed by <strong>{COMPANY.name}</strong>. Contact your IT administrator to update them.
              </p>
            </div>
          </div>


          {/* ── RIGHT PANEL: Form ── */}
          <motion.div
            initial={{ opacity: 0, y: CONTENT.enterY }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...CONTENT.spring, delay: CONTENT.delay }}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column',
              justifyContent: 'flex-start',
              gap: 24,
            }}
          >

            {/* ── Profile photo — above display name ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: photo ? 'transparent' : 'linear-gradient(135deg, #2AAB7D, #5cb3f0)',
                  border: `2px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {photo ? (
                    <img src={photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
                      {getInitials(EMPLOYEE.name)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: 1, right: 1,
                    width: 22, height: 22, borderRadius: '50%',
                    background: '#2A2A2A', border: `2px solid ${C.bg}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: C.borderSubtle,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#383838'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#2A2A2A'; e.currentTarget.style.color = C.borderSubtle }}
                  aria-label="Upload photo"
                >
                  <CameraIcon />
                </button>
              </div>

              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: '0 0 3px' }}>
                  {EMPLOYEE.name}
                </p>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    background: 'none', border: 'none',
                    fontSize: 12, color: C.infoText,
                    cursor: 'pointer', fontFamily: 'inherit',
                    fontWeight: 500, padding: 0,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {photo ? 'Change photo' : 'Upload a photo'}
                </button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
            </div>

            {/* Display name */}
            <div>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 500,
                color: C.textSecond, marginBottom: 6,
              }}>
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                onFocus={() => setNameFocus(true)}
                onBlur={() => setNameFocus(false)}
                placeholder="How others see you in Webex"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: C.surface,
                  border: `1px solid ${nameFocus ? C.borderFocus : C.border}`,
                  borderRadius: 8,
                  fontSize: 14, fontWeight: 500, color: C.textPrimary,
                  fontFamily: 'inherit', outline: 'none',
                  caretColor: C.textPrimary, boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                  boxShadow: nameFocus ? '0 0 0 3px rgba(74,195,151,0.10)' : 'none',
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 500,
                color: C.textSecond, marginBottom: 6,
              }}>
                Phone number{' '}
                <span style={{ color: C.textMuted, fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onFocus={() => setPhoneFocus(true)}
                onBlur={() => setPhoneFocus(false)}
                placeholder="+1 (555) 000-0000"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: C.surface,
                  border: `1px solid ${phoneFocus ? C.borderFocus : C.border}`,
                  borderRadius: 8,
                  fontSize: 14, fontWeight: 500, color: C.textPrimary,
                  fontFamily: 'inherit', outline: 'none',
                  caretColor: C.textPrimary, boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                  boxShadow: phoneFocus ? '0 0 0 3px rgba(74,195,151,0.10)' : 'none',
                }}
              />
            </div>

            {/* Section divider */}
            <SectionDivider label="Account details" />

            {/* Locked fields — 2-col grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px 14px',
            }}>
              <LockedField label="Full name"    value={EMPLOYEE.name} />
              <LockedField label="Work email"   value={EMPLOYEE.email} />
              <LockedField label="Job title"    value={EMPLOYEE.jobTitle} />
              <LockedField label="Department"   value={EMPLOYEE.department} />
              <div style={{ gridColumn: '1 / -1' }}>
                <LockedField label="Organization" value={COMPANY.name} />
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={() => navigate('/calendar-sync')}
              style={{
                width: '100%', padding: '13px 16px',
                marginTop: 6,
                background: 'linear-gradient(90deg, #1c8160 0%, #2aab7d 100%)',
                border: 'none', borderRadius: 9999,
                fontSize: 14, fontWeight: 600, color: C.textPrimary,
                fontFamily: 'inherit', cursor: 'pointer',
                transition: 'opacity 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
              onMouseDown={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Save & continue →
            </button>

          </motion.div>
        </div>
      </div>
    </div>
  )
}
