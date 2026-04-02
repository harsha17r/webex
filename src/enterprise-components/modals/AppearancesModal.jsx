import { useState } from 'react'
import { motion } from 'motion/react'

/* ─────────────────────────────────────────────────────────
 * AppearancesModal
 *
 * Purely visual — no actual theme changes.
 * Theme card previews update when Mode changes so the user
 * can see how each theme looks in Light / Dark / System mode.
 * ───────────────────────────────────────────────────────── */

const MODES = [
  { id: 'system', label: 'System default' },
  { id: 'light',  label: 'Light'          },
  { id: 'dark',   label: 'Dark'           },
]

const THEMES = [
  { id: 'classic',  label: 'Classic',  base: '#111111', surface: '#1E1E1E', accent: '#1170CF' },
  // Indigo  — blue-leaning deep navy, clearly different from Lavender
  { id: 'indigo',   label: 'Indigo',   base: '#070A1C', surface: '#0F1336', accent: '#5C6EED' },
  { id: 'bronze',   label: 'Bronze',   base: '#120F08', surface: '#1E1608', accent: '#B07A0A' },
  { id: 'jade',     label: 'Jade',     base: '#0A1410', surface: '#111E18', accent: '#2AAB7D' },
  // Lavender — pink-violet, distinctly warmer/lighter purple than Indigo
  { id: 'lavender', label: 'Lavender', base: '#160E2C', surface: '#211640', accent: '#C07FFF' },
  { id: 'rose',     label: 'Rose',     base: '#180A0E', surface: '#25121A', accent: '#C93D63' },
]

/* ── Mini preview renderers ──────────────────────────── */

/* Dark: used for Dark mode + all theme cards in Dark mode */
function DarkMiniApp({ base, surface, accent }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <div style={{
        width: 22, flexShrink: 0, background: surface,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 9, gap: 5,
      }}>
        <div style={{ width: 11, height: 11, borderRadius: '50%', background: accent }} />
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 13, height: 3, borderRadius: 9, background: 'rgba(255,255,255,0.14)' }} />
        ))}
      </div>
      <div style={{ flex: 1, background: base, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 11, background: surface }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '6px 8px', gap: 5 }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', flexShrink: 0 }} />
            <div style={{ height: 6, flex: 0.6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ height: 6, width: '42%', background: accent + '80', borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', flexShrink: 0 }} />
            <div style={{ height: 6, flex: 0.5, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* Light: used for Light mode + theme cards in Light mode (accent-tinted) */
function LightMiniApp({ accent = '#1170CF' }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <div style={{
        width: 22, flexShrink: 0, background: '#E8E8E8',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 9, gap: 5,
      }}>
        <div style={{ width: 11, height: 11, borderRadius: '50%', background: accent }} />
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 13, height: 3, borderRadius: 9, background: 'rgba(0,0,0,0.12)' }} />
        ))}
      </div>
      <div style={{ flex: 1, background: '#F6F6F6', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 11, background: '#EBEBEB' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '6px 8px', gap: 5 }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#CCCCCC', flexShrink: 0 }} />
            <div style={{ height: 6, flex: 0.6, background: '#DEDEDE', borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ height: 6, width: '42%', background: accent + '60', borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#CCCCCC', flexShrink: 0 }} />
            <div style={{ height: 6, flex: 0.5, background: '#DEDEDE', borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* System default mode card — static diagonal */
function SystemDefaultMiniApp() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 0, 58% 0, 42% 100%, 0 100%)', background: '#F0F0F0' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 22, background: '#E4E4E4' }} />
        <div style={{ position: 'absolute', top: 0, left: 22, right: 0, height: 11, background: '#E8E8E8' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(58% 0, 100% 0, 100% 100%, 42% 100%)', background: '#111111' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 22, background: '#1E1E1E' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 22, height: 11, background: '#1A1A1A' }} />
      </div>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom right, transparent 49%, rgba(180,180,180,0.25) 50%, transparent 51%)',
      }} />
    </div>
  )
}

/* System theme split — diagonal, left=light tinted, right=theme dark */
function SystemThemeSplitApp({ accent, base, surface }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Light left */}
      <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 0, 58% 0, 42% 100%, 0 100%)', background: '#F0F0F0' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 22, background: '#E4E4E4' }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: accent, margin: '9px auto 0' }} />
        </div>
      </div>
      {/* Dark right (theme colors) */}
      <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(58% 0, 100% 0, 100% 100%, 42% 100%)', background: base }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 22, background: surface }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: accent, margin: '9px auto 0' }} />
        </div>
      </div>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom right, transparent 49%, rgba(150,150,150,0.2) 50%, transparent 51%)',
      }} />
    </div>
  )
}

/* ── Check badge ─────────────────────────────────────── */

function CheckBadge() {
  return (
    <div style={{
      position: 'absolute', top: 6, right: 6,
      width: 18, height: 18, borderRadius: '50%',
      background: '#2AAB7D',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 1px 5px rgba(0,0,0,0.45)',
      zIndex: 2,
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 5.5L4 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

/* ── Card shell ──────────────────────────────────────── */

function PreviewCard({ label, selected, onSelect, children }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', cursor: 'pointer', borderRadius: 10,
        border: `2px solid ${selected ? '#2AAB7D' : hovered ? '#555555' : '#2A2A2A'}`,
        overflow: 'hidden', transition: 'border-color 0.15s', userSelect: 'none',
        transform: hovered && !selected ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      <div style={{ height: 90 }}>{children}</div>
      <div style={{
        padding: '7px 8px', background: '#1E1E1E', borderTop: '1px solid #252525',
        fontSize: 12, fontWeight: 500, color: '#CCCCCC', textAlign: 'center', lineHeight: '16px',
      }}>
        {label}
      </div>
      {selected && <CheckBadge />}
    </div>
  )
}

/* ── Shared panel (Settings modal + Appearances modal body) ───────── */

export function AppearanceSettingsPanel({ includeDescription = true }) {
  const [selectedMode,  setSelectedMode]  = useState('dark')
  const [selectedTheme, setSelectedTheme] = useState('classic')

  function themePreview(theme) {
    if (selectedMode === 'light')  return <LightMiniApp accent={theme.accent} />
    if (selectedMode === 'system') return <SystemThemeSplitApp accent={theme.accent} base={theme.base} surface={theme.surface} />
    return <DarkMiniApp base={theme.base} surface={theme.surface} accent={theme.accent} />
  }

  return (
    <>
      {includeDescription && (
        <p style={{ fontSize: 13, fontWeight: 400, color: '#888888', margin: '0 0 20px', lineHeight: '20px' }}>
          Customize how your workspace looks. You can always change this later in Settings.
        </p>
      )}

      {/* Mode */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#AAAAAA', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Mode
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {MODES.map(mode => (
            <PreviewCard key={mode.id} label={mode.label} selected={selectedMode === mode.id} onSelect={() => setSelectedMode(mode.id)}>
              {mode.id === 'system' && <SystemDefaultMiniApp />}
              {mode.id === 'light'  && <LightMiniApp />}
              {mode.id === 'dark'   && <DarkMiniApp base="#111111" surface="#1E1E1E" accent="#1170CF" />}
            </PreviewCard>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#AAAAAA', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Theme
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {THEMES.map(theme => (
            <PreviewCard key={theme.id} label={theme.label} selected={selectedTheme === theme.id} onSelect={() => setSelectedTheme(theme.id)}>
              {themePreview(theme)}
            </PreviewCard>
          ))}
        </div>
      </div>
    </>
  )
}

/* ── Main modal ──────────────────────────────────────── */

export function AppearancesModal({ onClose, onSave }) {
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
          width: 680, background: '#181818',
          border: '1px solid #2A2A2A', borderRadius: 14,
          overflow: 'hidden', boxShadow: '0px 24px 80px rgba(0,0,0,0.72)',
        }}
      >

        {/* Header */}
        <div style={{ padding: '28px 28px 20px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF', margin: '0 0 6px', lineHeight: '28px' }}>
            Change appearances
          </h2>
          <p style={{ fontSize: 13, fontWeight: 400, color: '#888888', margin: 0, lineHeight: '20px' }}>
            Customize how your workspace looks. You can always change this later in Settings.
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '0 28px 4px', overflowY: 'auto', maxHeight: 560 }} className="scrollbar-dark">
          <AppearanceSettingsPanel includeDescription={false} />
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px 24px', borderTop: '1px solid #232323',
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px', background: '#494949',
              border: 'none', borderRadius: 9999,
              fontSize: 14, fontWeight: 500, color: '#FFFFFF',
              cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#5A5A5A'}
            onMouseLeave={e => e.currentTarget.style.background = '#494949'}
          >
            Skip for now
          </button>
          <button
            onClick={() => { onSave?.(); onClose() }}
            style={{
              padding: '10px 20px', background: '#1D8160',
              border: 'none', borderRadius: 9999,
              fontSize: 14, fontWeight: 500, color: '#FFFFFF',
              cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#166649'}
            onMouseLeave={e => e.currentTarget.style.background = '#1D8160'}
          >
            Update Preference
          </button>
        </div>

      </motion.div>
    </motion.div>
  )
}
