import { createContext, useContext, useState } from 'react'
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
}

function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : null
  } catch { return null }
}

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => readSession() ?? DEFAULT_PROFILE)

  function updateProfile(patch) {
    setProfile(prev => {
      const next = { ...prev, ...patch }
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}
