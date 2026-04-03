import { createContext, useContext, useState, useCallback } from 'react'

/* ─────────────────────────────────────────────────────────
 * AppHubContext
 *
 * Stores the user's personalisation answers, selected apps,
 * and whether onboarding has been completed.
 * Persists to sessionStorage so it survives soft refreshes.
 * ───────────────────────────────────────────────────────── */

const SESSION_KEY = 'webex_apphub'

const DEFAULT_STATE = {
  /** Has the user completed (or skipped) the intro? */
  introComplete: false,
  /** Answers to the two personalisation questions */
  answers: {
    q1: [], // multi-select: array of option keys
    q2: [], // multi-select: workflow / focus areas
  },
  /** Array of app IDs the user picked from recommendations */
  selectedApps: [],
}

function load() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

function save(state) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(state)) } catch { /* noop */ }
}

const Ctx = createContext(null)

export function AppHubProvider({ children }) {
  const [state, setState] = useState(load)

  const update = useCallback((patch) => {
    setState(prev => {
      const next = { ...prev, ...patch }
      save(next)
      return next
    })
  }, [])

  const setAnswer = useCallback((key, value) => {
    setState(prev => {
      const next = { ...prev, answers: { ...prev.answers, [key]: value } }
      save(next)
      return next
    })
  }, [])

  const toggleApp = useCallback((appId) => {
    setState(prev => {
      const selected = prev.selectedApps.includes(appId)
        ? prev.selectedApps.filter(id => id !== appId)
        : [...prev.selectedApps, appId]
      const next = { ...prev, selectedApps: selected }
      save(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    const fresh = { ...DEFAULT_STATE }
    save(fresh)
    setState(fresh)
  }, [])

  return (
    <Ctx.Provider value={{ ...state, update, setAnswer, toggleApp, reset }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAppHub() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAppHub must be used inside <AppHubProvider>')
  return ctx
}
