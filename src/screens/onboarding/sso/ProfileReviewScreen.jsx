import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { COMPANY, EMPLOYEE } from '../../../config/employee'
import { useProfile } from '../../../context/ProfileContext'
import { ProfilePhotoCropOverlay } from '../../../components/profile/ProfilePhotoCropOverlay'
import defaultProfilePhotoUrl from '../../../assets/images/arvind-profile Pic.jpg'

/* ─────────────────────────────────────────────────────────
 * ProfileReviewScreen — Two-column, single-fold layout
 *
 * LEFT PANEL (fixed width — see LAYOUT)
 *   Webex vertical logo
 *   "Review your profile" heading + subtitle
 *   Admin info banner
 *   Avatar + bordered Change photo / Remove photo
 *
 * RIGHT PANEL (flex: 1 — min width + row max in LAYOUT)
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

/* Field chrome matches SetPasswordScreen (1px #494949 → #AAAAAA on focus, surface #222222). */
const C = {
  bg:           '#111111',
  surface:      '#222222',
  surfaceLock:  '#222222',
  border:       '#494949',
  borderSubtle: '#AAAAAA',
  textPrimary:  '#FFFFFF',
  textSecond:   '#AAAAAA',
  textLabel:    '#F7F7F7',
  textMuted:    '#999999',
  textLock:     '#8A8A8A',
  infoBg:       'rgba(92, 179, 240, 0.07)',
  infoBorder:   'rgba(92, 179, 240, 0.22)',
  infoText:     '#5cb3f0',
}

const CONTENT = {
  enterY: 24,
  spring: { type: 'spring', stiffness: 320, damping: 28 },
  delay:  0.15,
}

/** Two-column layout (px). */
const LAYOUT = {
  leftWidthPx:      400,
  rightMinWidthPx:  360,
  rowMaxWidthPx:    1020,
  columnGapPx:      80,
}

/**
 * Profile row (avatar + upload controls) — tweak sizes here.
 */
const PROFILE_HEADER = {
  avatarPx:            120,
  rowGapPx:            24,
  /** Bordered “Change photo” control */
  uploadIconPx:        16,
  uploadFontPx:        14,
  uploadPadding:       '12px 20px',
  uploadBorderRadius:  12,
  uploadIconTextGap:   10,
}

/* ── Icons ────────────────────────────────────────────── */

function LockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

/** Tray + arrow upload (stroke uses `currentColor`). */
function UploadPhotoIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
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

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Locked-field wiggle
 *
 * Triggered: user clicks any admin-managed field
 *
 *    0ms   field x snaps to 0 (reset)
 *   16ms   x → −5  (sharp left)
 *   80ms   x →  5  (bounce right)
 *  140ms   x → −3  (decay left)
 *  200ms   x →  3  (decay right)
 *  260ms   x →  0  (settle)
 *
 * Simultaneously the "Admin-managed" badge pulses opacity
 * 1.0 → 0.5 → 1.0 over 400ms to draw the eye upward.
 * ───────────────────────────────────────────────────────── */

const LOCKED_WIGGLE = {
  keyframes: [0, -5, 5, -3, 3, 0],   // x offsets in px — decay pattern
  duration:  300,                      // ms total
}

const BADGE_PULSE = {
  keyframes: [1, 0.45, 1],            // opacity — flash dim then recover
  duration:  400,                      // ms total
}

/* ── Sub-components ───────────────────────────────────── */

function SectionHeading({ label, badgeRef }) {
  return (
    <div style={{
      width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{
        fontSize: 12, fontWeight: 600, color: C.textMuted,
        textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        {label}
      </span>
      <div
        ref={badgeRef}
        style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.textMuted }}
      >
        <LockIcon />
        <span style={{ fontSize: 11, color: C.textMuted, letterSpacing: '0.02em' }}>
          Admin-managed
        </span>
      </div>
    </div>
  )
}

function LockedField({ label, value, onWiggle }) {
  const fieldRef = useRef(null)

  function handleClick() {
    const el = fieldRef.current
    if (!el) return
    el.animate(
      LOCKED_WIGGLE.keyframes.map(x => ({ transform: `translateX(${x}px)` })),
      { duration: LOCKED_WIGGLE.duration, easing: 'ease-in-out' },
    )
    onWiggle?.()
  }

  return (
    <div style={{ cursor: 'not-allowed' }} onClick={handleClick}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: C.textSecond, marginBottom: 8 }}>
        {label}
      </label>
      <div
        ref={fieldRef}
        style={{
          width: '100%',
          padding: 12,
          display: 'flex', alignItems: 'center',
          background: C.surfaceLock,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          fontSize: 15, fontWeight: 500, color: C.textLock,
          lineHeight: '22px',
          fontFamily: "'Inter', system-ui, sans-serif",
          boxSizing: 'border-box',
          userSelect: 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}
      >
        {value}
      </div>
    </div>
  )
}

/* ── Main screen ──────────────────────────────────────── */

export function ProfileReviewScreen() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const cropBlobRef = useRef(null)
  const badgeRef = useRef(null)
  const { profile, updateProfile } = useProfile()

  const [displayName, setDisplayName] = useState(() => profile.name || EMPLOYEE.name)
  const [phone,       setPhone]       = useState('')
  const [photo,       setPhoto]       = useState(() => profile.photoUrl ?? null)
  const [cropRawUrl,  setCropRawUrl]   = useState(null)
  const [nameFocus,   setNameFocus]   = useState(false)
  const [phoneFocus,  setPhoneFocus]  = useState(false)

  const avatarSrc = photo ?? profile.photoUrl ?? defaultProfilePhotoUrl

  function pulseBadge() {
    const el = badgeRef.current
    if (!el) return
    el.animate(
      BADGE_PULSE.keyframes.map(o => ({ opacity: o })),
      { duration: BADGE_PULSE.duration, easing: 'ease-in-out' },
    )
  }

  function closeCropper() {
    if (cropBlobRef.current) {
      URL.revokeObjectURL(cropBlobRef.current)
      cropBlobRef.current = null
    }
    setCropRawUrl(null)
  }

  useEffect(() => () => {
    if (cropBlobRef.current) URL.revokeObjectURL(cropBlobRef.current)
  }, [])

  function handlePhotoFilePick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (cropBlobRef.current) URL.revokeObjectURL(cropBlobRef.current)
    cropBlobRef.current = url
    setCropRawUrl(url)
    e.target.value = ''
  }

  const handleCropApply = useCallback((dataUrl) => {
    closeCropper()
    setPhoto(dataUrl)
    updateProfile({ photoUrl: dataUrl })
  }, [updateProfile])

  const handleCropCancel = useCallback(() => {
    closeCropper()
  }, [])

  function removePhoto() {
    closeCropper()
    setPhoto(null)
    updateProfile({ photoUrl: null })
  }

  function handleSaveAndContinue() {
    const name = displayName.trim() || profile.name || EMPLOYEE.name
    updateProfile({ name, photoUrl: photo })
    navigate('/calendar-sync')
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: C.bg,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {cropRawUrl && (
        <ProfilePhotoCropOverlay
          rawImageUrl={cropRawUrl}
          onApply={handleCropApply}
          onCancel={handleCropCancel}
        />
      )}

      {/* ── Top bar — "…" only ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        padding: '28px 56px 0',
        flexShrink: 0,
      }}>
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
        padding: '3vh 56px 4vh',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: LAYOUT.columnGapPx,
          width: '100%',
          maxWidth: LAYOUT.rowMaxWidthPx,
        }}>

          {/* ── LEFT PANEL ── */}
          <div style={{
            width: LAYOUT.leftWidthPx, flexShrink: 0,
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
              <p style={{ fontSize: 14, color: C.infoText, margin: 0, lineHeight: 1.55 }}>
                Some fields are managed by <strong>{COMPANY.name}</strong>.
                Contact your IT administrator to update them.
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
              minWidth: LAYOUT.rightMinWidthPx,
              minHeight: 0,
              display: 'flex', flexDirection: 'column',
              justifyContent: 'flex-start',
              gap: 24,
            }}
          >

            {/* ── Profile photo — sizes: PROFILE_HEADER ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: PROFILE_HEADER.rowGapPx }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{
                  width: PROFILE_HEADER.avatarPx, height: PROFILE_HEADER.avatarPx, borderRadius: '50%',
                  background: 'transparent',
                  border: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  <img
                    src={avatarSrc}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: PROFILE_HEADER.uploadIconTextGap,
                    padding: PROFILE_HEADER.uploadPadding,
                    background: 'transparent',
                    border: `1px solid ${C.border}`,
                    borderRadius: PROFILE_HEADER.uploadBorderRadius,
                    fontSize: PROFILE_HEADER.uploadFontPx,
                    fontWeight: 500,
                    color: C.textSecond,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = C.textSecond
                    e.currentTarget.style.color = C.textSecond
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = C.border
                    e.currentTarget.style.color = C.textSecond
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <UploadPhotoIcon size={PROFILE_HEADER.uploadIconPx} />
                  Change photo
                </button>
                {photo && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px 0',
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 500,
                      color: C.textMuted,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Remove photo
                  </button>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoFilePick}
              />
            </div>

            {/* Display name */}
            <div>
              <label style={{
                display: 'block', fontSize: 14, fontWeight: 500,
                color: C.textLabel, marginBottom: 8,
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
                  width: '100%', padding: 12,
                  background: C.surface,
                  border: `1px solid ${nameFocus ? C.borderSubtle : C.border}`,
                  borderRadius: 8,
                  fontSize: 15, fontWeight: 500, color: C.textPrimary,
                  fontFamily: 'inherit', outline: 'none',
                  caretColor: C.textPrimary, boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{
                display: 'block', fontSize: 14, fontWeight: 500,
                color: C.textLabel, marginBottom: 8,
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
                  width: '100%', padding: 12,
                  background: C.surface,
                  border: `1px solid ${phoneFocus ? C.borderSubtle : C.border}`,
                  borderRadius: 8,
                  fontSize: 15, fontWeight: 500, color: C.textPrimary,
                  fontFamily: 'inherit', outline: 'none',
                  caretColor: C.textLock, boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
              />
            </div>

            {/* Section divider — single "Admin-managed" badge lives here */}
            <SectionHeading label="Account details" badgeRef={badgeRef} />

            {/* Locked fields — 2-col grid; click wiggles field + pulses badge */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '28px 24px',
            }}>
              <LockedField label="Full name"    value={EMPLOYEE.name}       onWiggle={pulseBadge} />
              <LockedField label="Work email"   value={EMPLOYEE.email}      onWiggle={pulseBadge} />
              <LockedField label="Job title"    value={EMPLOYEE.jobTitle}   onWiggle={pulseBadge} />
              <LockedField label="Department"   value={EMPLOYEE.department} onWiggle={pulseBadge} />
              <div style={{ gridColumn: '1 / -1' }}>
                <LockedField label="Organization" value={COMPANY.name}      onWiggle={pulseBadge} />
              </div>
            </div>

            {/* Save button */}
            <button
              type="button"
              onClick={handleSaveAndContinue}
              style={{
                width: '100%', padding: '16px 14px',
                marginTop: 16,
                background: '#FFFFFF',
                border: 'none', borderRadius: 9999,
                fontSize: 14, fontWeight: 600, color: C.bg,
                fontFamily: 'inherit', cursor: 'pointer',
                transition: 'background 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ebebeb'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.transform = 'translateY(0)' }}
              onMouseDown={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Save & continue
            </button>

          </motion.div>
        </div>
      </div>
    </div>
  )
}
