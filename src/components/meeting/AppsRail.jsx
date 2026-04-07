import { useState, useRef, useEffect } from 'react'

/* ─────────────────────────────────────────────────────────
 * AppsRail
 *
 * My Apps  — short suggestions list
 * Discover — promo banner + full alphabetical catalogue
 *            search auto-focuses on tab switch
 * ───────────────────────────────────────────────────────── */

// Single source of truth — used in both tabs
const ALL_APP_LIST = [
  { id: '3dframe',    name: '3DFrame',                          sub: 'Bring content to life.',       color: '#1565C0' },
  { id: 'boom',       name: 'Aaand BOOM',                       sub: 'Multiplayer game',             color: '#D94040' },
  { id: 'adamai',     name: 'adam.ai',                          sub: 'Easy Meeting Management',      color: '#1976D2' },
  { id: 'sesh',       name: 'Agendas Made Easy with Sesh',      sub: 'Dynamic visual agenda',        color: '#283593' },
  { id: 'laxis',      name: 'AI Meeting Assistant - Laxis',     sub: 'AI Meeting Assistant',         color: '#EEEEEE' },
  { id: 'alleo',      name: 'Alleo',                            sub: 'Better Together',              color: '#1565C0' },
  { id: 'anilive',    name: 'AniLive - Anonymous Live Feedback', sub: 'Anonymous Live Feedback',     color: '#43A047' },
  { id: 'showmaster', name: 'Animations with Showmaster',       sub: 'Stunning animations',          color: '#2C2C2C' },
  { id: 'appyreward', name: 'appyReward',                       sub: 'Reward your attendees',        color: '#8BC34A' },
  { id: 'arrangr',    name: 'Arrangr',                          sub: 'Flexible Invitations',         color: '#FFFFFF' },
  { id: 'aveteleport',name: 'Ave Teleport',                     sub: 'Virtual field trips',          color: '#00BCD4' },
  { id: 'basicops',   name: 'BasicOps',                         sub: 'Projects, Tasks & Notes',      color: '#5B6BF5' },
  { id: 'conf',       name: 'Conferences io',                   sub: 'Live audience engagement',     color: '#1AACAA' },
  { id: 'crowdpurr',  name: 'Crowdpurr',                        sub: 'Create trivia and polls',      color: '#2B72E8' },
]

const MY_APPS_IDS   = ['boom', 'showmaster', 'basicops', 'conf', 'crowdpurr']
const MY_APPS       = ALL_APP_LIST.filter(a => MY_APPS_IDS.includes(a.id))
const DISCOVER_APPS = ALL_APP_LIST

function AppRow({ app, favorited, onToggleFavorite }) {
  const [hovered, setHovered] = useState(false)
  const initial = app.name.charAt(0).toUpperCase()
  const isDark  = app.color === '#2C2C2C' || app.color === '#FFFFFF' || app.color === '#EEEEEE'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '10px 16px 10px 20px',
        background: hovered ? '#222222' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.12s',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 11,
        background: app.color, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 17, fontWeight: 700,
        color: isDark ? '#1A1A1A' : '#FFFFFF',
        border: app.color === '#FFFFFF' || app.color === '#EEEEEE' ? '1px solid #383838' : 'none',
        boxSizing: 'border-box',
      }}>
        {initial}
      </div>

      {/* Name + subtitle */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#E9E9E9', lineHeight: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.name}</p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#999999', lineHeight: '17px' }}>{app.sub}</p>
      </div>

      {/* Info + Favorite — visible on hover */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.15s',
        flexShrink: 0,
      }}>
        <button
          onClick={e => e.stopPropagation()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#888888" strokeWidth="1.5"/>
            <path d="M12 11v5" stroke="#888888" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="7.5" r="0.8" fill="#888888"/>
          </svg>
        </button>
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite(app.id) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              stroke={favorited ? '#F5A623' : '#888888'}
              fill={favorited ? '#F5A623' : 'none'}
              strokeWidth="1.5" strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function AppsRail({ onClose }) {
  const [tab,              setTab]              = useState('my-apps')
  const [search,           setSearch]           = useState('')
  const [bannerDismissed,  setBannerDismissed]  = useState(false)
  const [favoriteIds,      setFavoriteIds]      = useState(new Set())
  const searchRef = useRef(null)

  function toggleFavorite(id) {
    setFavoriteIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const favoriteApps = ALL_APP_LIST.filter(a => favoriteIds.has(a.id))

  // Auto-focus search when switching to Discover
  useEffect(() => {
    if (tab === 'discover') {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [tab])

  const list = tab === 'discover' ? DISCOVER_APPS : MY_APPS
  const filtered = list.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.sub.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{
      width: 371, minWidth: 371, height: 'calc(100% - 8px)',
      margin: '4px 4px 4px 0',
      background: '#1A1A1A',
      borderLeft:   '1px solid #494949',
      borderTop:    '1px solid #494949',
      borderBottom: '1px solid #494949',
      borderRadius: '12px 0 0 12px',
      display: 'flex', flexDirection: 'column',
      boxSizing: 'border-box',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 16px 14px',
        borderBottom: '1px solid #494949',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF' }}>Apps</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3L13 13M13 3L3 13" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── Search ── */}
      <div style={{ padding: '14px 16px 10px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#222222',
          border: '1px solid #383838',
          borderRadius: 10,
          padding: '9px 14px',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#555555" strokeWidth="1.8"/>
            <path d="M17 17L21 21" stroke="#555555" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Apps"
            style={{
              flex: 1, background: 'transparent',
              border: 'none', outline: 'none',
              fontSize: 14, color: '#FFFFFF',
              fontFamily: "'Inter', system-ui, sans-serif",
              caretColor: '#FFFFFF',
            }}
          />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px 12px', flexShrink: 0 }}>
        {[{ id: 'my-apps', label: 'My Apps' }, { id: 'discover', label: 'Discover' }].map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSearch('') }}
            style={{
              background: tab === t.id ? '#2A2A2A' : 'transparent',
              border: 'none', borderRadius: 9999,
              padding: '7px 16px',
              fontSize: 14, fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? '#FFFFFF' : '#888888',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Discover: promo banner */}
        {tab === 'discover' && !bannerDismissed && (
          <div style={{
            margin: '0 16px 16px',
            background: '#252525',
            border: '1px solid #383838',
            borderRadius: 12,
            padding: '14px 14px 14px 16px',
            display: 'flex', alignItems: 'flex-start', gap: 12,
            position: 'relative',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                stroke="#AAAAAA" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#FFFFFF', lineHeight: '20px' }}>
                Find your favorites faster
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#888888', lineHeight: '18px' }}>
                Favorite an app and it will appear in My Apps.
              </p>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 3L13 13M13 3L3 13" stroke="#666666" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* My Apps: Favorites section */}
        {tab === 'my-apps' && favoriteApps.length > 0 && (
          <>
            <div style={{ padding: '0 20px 6px' }}>
              <span style={{ fontSize: 12, color: '#999999', fontWeight: 400 }}>Favorites</span>
            </div>
            {favoriteApps.map(app => (
              <AppRow key={app.id} app={app} favorited={favoriteIds.has(app.id)} onToggleFavorite={toggleFavorite} />
            ))}
            <div style={{ height: 1, background: '#2A2A2A', margin: '8px 0' }} />
          </>
        )}

        {/* My Apps: suggestions label */}
        {tab === 'my-apps' && (
          <div style={{ padding: '0 20px 10px' }}>
            <span style={{ fontSize: 12, color: '#999999', fontWeight: 400 }}>Suggestions for you</span>
          </div>
        )}

        {filtered.map(app => (
          <AppRow key={app.id} app={app} favorited={favoriteIds.has(app.id)} onToggleFavorite={toggleFavorite} />
        ))}

        {filtered.length === 0 && (
          <p style={{ fontSize: 13, color: '#999999', textAlign: 'center', margin: '32px 0' }}>
            No apps found
          </p>
        )}
      </div>

    </div>
  )
}
