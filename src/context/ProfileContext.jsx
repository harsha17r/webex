import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { EMPLOYEE } from '../config/employee'

/* ─────────────────────────────────────────────────────────
 * ProfileContext
 *
 * Stores: name, photoUrl (base64), bannerColor
 * Persists to sessionStorage — survives soft refreshes,
 * cleared when the tab is closed.
 * ───────────────────────────────────────────────────────── */

const SESSION_KEY = 'webex_profile'

const DEFAULT_PROFILE = {
  name:        EMPLOYEE.name,
  email:       EMPLOYEE.email,
  jobTitle:    EMPLOYEE.jobTitle,
  department:  EMPLOYEE.department,
  photoUrl:    null,
  bannerColor: EMPLOYEE.bannerColor,
  /** Custom status (top bar); clear-after is UX metadata for a real app */
  statusText:        '',
  statusClearAfter:  '1d',
  statusCustomUntil: null,
  /** ISO — when to auto-clear statusText (set on Save from clear-after UI) */
  statusExpiresAt:   null,
}

/** Compute expiry from preset keys or custom ISO (local datetime string ok). */
export function computeStatusExpiresAt(clearAfter, customIso) {
  if (clearAfter === 'custom') {
    if (!customIso) return null
    const t = new Date(customIso).getTime()
    return Number.isNaN(t) ? null : new Date(t).toISOString()
  }
  const ms = {
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '2h': 2 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '14d': 14 * 24 * 60 * 60 * 1000,
  }[clearAfter]
  if (!ms) return null
  return new Date(Date.now() + ms).toISOString()
}

function statusExpired(profile) {
  const text = profile.statusText?.trim()
  if (!text || !profile.statusExpiresAt) return false
  const t = new Date(profile.statusExpiresAt).getTime()
  return Number.isNaN(t) || Date.now() >= t
}

function clearExpiredStatusFields(profile) {
  return {
    ...profile,
    statusText: '',
    statusExpiresAt: null,
    statusCustomUntil: null,
  }
}

function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : null
  } catch { return null }
}

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const base = readSession() ?? DEFAULT_PROFILE
    if (statusExpired(base)) {
      const next = clearExpiredStatusFields(base)
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(next)) } catch {}
      return next
    }
    return base
  })

  const updateProfile = useCallback((patch) => {
    setProfile(prev => {
      const next = { ...prev, ...patch }
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  /* Auto-clear status when statusExpiresAt is reached (also handles tab left open). */
  useEffect(() => {
    const text = profile.statusText?.trim()
    if (!text || !profile.statusExpiresAt) return undefined
    const target = new Date(profile.statusExpiresAt).getTime()
    if (Number.isNaN(target)) return undefined
    const ms = target - Date.now()
    if (ms <= 0) {
      updateProfile({
        statusText: '',
        statusExpiresAt: null,
        statusCustomUntil: null,
      })
      return undefined
    }
    const id = window.setTimeout(() => {
      updateProfile({
        statusText: '',
        statusExpiresAt: null,
        statusCustomUntil: null,
      })
    }, ms)
    return () => window.clearTimeout(id)
  }, [profile.statusText, profile.statusExpiresAt, updateProfile])

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}
