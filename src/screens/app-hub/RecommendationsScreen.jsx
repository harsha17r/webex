import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Dropdown } from '../../components/Dropdown'
import {
  APP_CATALOGUE,
  WORKFLOW_LABELS,
  SURFACE_LABELS,
  ALL_CATEGORIES,
  CISCO_BUILT_APP_IDS,
  BRAND_NEW_APP_IDS,
  PARTNER_SOLUTIONS_APP_IDS,
} from '../../data/appHubApps'
import { AppHubCategoryIcon } from '../../data/appHubCategoryIcons'

const SPRING = { type: 'spring', stiffness: 420, damping: 36 }
const FONT = "'Inter', system-ui, sans-serif"

/** Workflow filter pills: selected = gray outline + slight lift (not solid #FFF) — standard dark-UI filter chip. */
const WORKFLOW_CHIP = {
  outline: '#6B6B6B',
  selectedBg: '#343434',
  labelSelected: '#F5F5F5',
  idleBg: '#2A2A2A',
  idleHoverBg: '#333333',
  labelIdle: '#A3A3A3',
}

const SURFACE_KEYS = Object.keys(SURFACE_LABELS)
const APP_TYPES = ['Embedded Apps', 'Integrations', 'Bots']

const Q1_TO_SURFACE = {
  meetings: 'meetings',
  messaging: 'messaging',
  contact_center: 'calls',
}

function getTeamApps(q1) {
  return APP_CATALOGUE
    .filter(app => app.focus.some(f => q1.includes(f)))
    .sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0))
    .slice(0, 4)
}

/** When user skips onboarding (empty Q1), still show a plausible org snapshot in enterprise. */
function getDefaultEnterpriseTeamApps() {
  return [...APP_CATALOGUE]
    .filter(a => a.popular)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 4)
}

/** Stable faux org-size usage for enterprise (avoids inflated catalogue `teamCount` in team cards). */
function getEnterpriseOrgUsageCount(appId) {
  let h = 0
  for (let i = 0; i < appId.length; i++) h = (h + appId.charCodeAt(i) * (i + 1)) % 97
  return 42 + (h % 31)
}

function getOrgPopularCarouselApps() {
  return [...APP_CATALOGUE]
    .filter(a => a.popular)
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** `activeWorkflow === 'all'` skips workflow filtering so the full catalogue can be shown (other filters still apply). */
function getFilteredApps(activeWorkflow, surfaceFilters, categoryFilter, discoverFilter) {
  let apps =
    activeWorkflow === 'all' || activeWorkflow == null
      ? APP_CATALOGUE.slice()
      : APP_CATALOGUE.filter(a => a.workflows.includes(activeWorkflow))
  if (surfaceFilters.length > 0) apps = apps.filter(a => surfaceFilters.some(s => a.surfaces.includes(s)))
  if (categoryFilter) apps = apps.filter(a => a.categories.includes(categoryFilter))
  if (discoverFilter === 'most_popular') apps = apps.filter(a => a.popular)
  else if (discoverFilter === 'brand_new') apps = apps.filter(a => BRAND_NEW_APP_IDS.has(a.id))
  else if (discoverFilter === 'partner_solutions') {
    apps = apps.filter(a => PARTNER_SOLUTIONS_APP_IDS.has(a.id) && !CISCO_BUILT_APP_IDS.has(a.id))
  } else if (discoverFilter === 'built_by_cisco') apps = apps.filter(a => CISCO_BUILT_APP_IDS.has(a.id))
  return apps
}

function getWorkflowChips(q2) {
  return q2
    .filter(key => WORKFLOW_LABELS[key])
    .map(key => ({ key, label: WORKFLOW_LABELS[key] }))
}

/* ── Icons ── */

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <path d="m21 21-4.34-4.34" />
        <circle cx="11" cy="11" r="8" />
      </g>
    </svg>
  )
}

function ChevronDown({ color = '#888888', size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 6l4 4 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AppIcon({ initials, bg, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, background: bg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color: '#FFFFFF',
      fontFamily: FONT,
    }}>
      {initials}
    </div>
  )
}

function AddButton({ onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? '#1D8160' : 'transparent',
        border: '1.5px solid #1D8160', borderRadius: 9999, height: 32, padding: '0 14px',
        display: 'inline-flex', alignItems: 'center', gap: 4,
        cursor: 'pointer', transition: 'background 0.15s',
        fontSize: 13, fontWeight: 600, color: hover ? '#FFFFFF' : '#1D8160',
        fontFamily: FONT, flexShrink: 0,
      }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14m-7-7v14" />
      </svg>
      Add
    </button>
  )
}

function SurfaceTag({ surface }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 500, color: '#888888',
      background: '#2A2A2A', borderRadius: 6, padding: '4px 8px', lineHeight: '16px',
    }}>
      {SURFACE_LABELS[surface] || surface}
    </span>
  )
}

/* ── Dropdown panel (reusable) ── */

function DropdownPanel({ options, active, onSelect, width = 200 }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div style={{
      width, background: '#111111', border: '1px solid #595959',
      borderRadius: 20, padding: 12,
      display: 'flex', flexDirection: 'column', gap: 2,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      fontFamily: FONT, boxSizing: 'border-box',
    }}>
      {options.map(opt => {
        const isActive = opt.key === active
        return (
          <div
            key={opt.key}
            onMouseEnter={() => setHovered(opt.key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(opt.key)}
            style={{
              padding: '7px 16px', borderRadius: 12, cursor: 'pointer',
              background: isActive ? '#222222' : hovered === opt.key ? '#1E1E1E' : 'transparent',
              transition: 'background 0.12s',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <span style={{
              fontSize: 14, fontWeight: 500,
              color: isActive ? '#FFFFFF' : '#CCCCCC', lineHeight: '20px',
            }}>
              {opt.label}
            </span>
            {isActive && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <path d="M2 7l3.5 3.5L12 3.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        )
      })}
    </div>
  )
}

const DISCOVER_OPTIONS = [
  { key: null, label: 'All' },
  { key: 'most_popular', label: 'Most popular' },
  { key: 'brand_new', label: 'Brand new' },
  { key: 'partner_solutions', label: 'Partner solutions' },
  { key: 'built_by_cisco', label: 'Built by Cisco' },
]

const DISCOVER_DROPDOWN_WIDTH = 240

/** Discover (spotlight) filter — familiar app-store pattern; same list row style as other dropdowns. */
function DiscoverPanel({ active, onSelect }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div style={{
      width: DISCOVER_DROPDOWN_WIDTH,
      background: '#111111', border: '1px solid #595959',
      borderRadius: 20, padding: '10px 12px 12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      fontFamily: FONT, boxSizing: 'border-box',
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', padding: '4px 8px 10px', lineHeight: '20px' }}>
        Discover
      </div>
      <div style={{ height: 1, background: '#333333', margin: '0 4px 8px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {DISCOVER_OPTIONS.map(opt => {
          const rowKey = opt.key ?? 'all'
          const isActive = (opt.key == null && active == null) || opt.key === active
          return (
            <div
              key={rowKey}
              onMouseEnter={() => setHovered(rowKey)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(opt.key)}
              style={{
                padding: '7px 16px', borderRadius: 12, cursor: 'pointer',
                background: isActive ? '#222222' : hovered === rowKey ? '#1E1E1E' : 'transparent',
                transition: 'background 0.12s',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <span style={{
                fontSize: 14, fontWeight: 500,
                color: isActive ? '#FFFFFF' : '#CCCCCC', lineHeight: '20px',
              }}>
                {opt.label}
              </span>
              {isActive && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M2 7l3.5 3.5L12 3.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Surface multi-select panel ── */

function SurfacePanel({ selected, onToggle, onClearAll }) {
  const [hovered, setHovered] = useState(null)
  const noneSelected = selected.length === 0
  return (
    <div style={{
      width: 220, background: '#111111', border: '1px solid #595959',
      borderRadius: 20, padding: 12,
      display: 'flex', flexDirection: 'column', gap: 2,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      fontFamily: FONT, boxSizing: 'border-box',
    }}>
      <div
        onMouseEnter={() => setHovered('all')}
        onMouseLeave={() => setHovered(null)}
        onClick={onClearAll}
        style={{
          padding: '7px 16px', borderRadius: 12, cursor: 'pointer',
          background: noneSelected ? '#222222' : hovered === 'all' ? '#1E1E1E' : 'transparent',
          transition: 'background 0.12s',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: noneSelected ? '#FFFFFF' : '#CCCCCC', lineHeight: '20px' }}>
          All surfaces
        </span>
        {noneSelected && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <path d="M2 7l3.5 3.5L12 3.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {SURFACE_KEYS.map(key => {
        const isOn = selected.includes(key)
        return (
          <div
            key={key}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onToggle(key)}
            style={{
              padding: '7px 16px', borderRadius: 12, cursor: 'pointer',
              background: hovered === key ? '#1E1E1E' : 'transparent',
              transition: 'background 0.12s',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, color: isOn ? '#FFFFFF' : '#CCCCCC', lineHeight: '20px' }}>
              {SURFACE_LABELS[key]}
            </span>
            <div style={{
              width: 16, height: 16, borderRadius: 4, flexShrink: 0,
              border: isOn ? 'none' : '1.5px solid #494949',
              background: isOn ? '#1D8160' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.12s', boxSizing: 'border-box',
            }}>
              {isOn && (
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3.5 3.5L12 3.5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Filter trigger button ── */

function FilterButton({ label, active, open, innerRef, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      ref={innerRef}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 32, padding: '0 12px',
        background: open ? '#333333' : hover ? '#2A2A2A' : '#222222',
        border: `1px solid ${open ? '#555555' : '#3A3A3A'}`,
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'background 0.12s, border-color 0.12s',
        fontSize: 13, fontWeight: 500,
        color: active ? '#FFFFFF' : '#AAAAAA',
        fontFamily: FONT, flexShrink: 0,
      }}
    >
      {label}
      <ChevronDown color={open ? '#FFFFFF' : '#888888'} />
    </button>
  )
}

/* ── Section: header row ── */

function HeaderRow() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', margin: 0, lineHeight: '28px', flexShrink: 0 }}>App Hub</h1>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 360,
        background: '#222222', border: '1px solid #3A3A3A',
        borderRadius: 8, padding: '8px 14px', color: '#666666',
      }}>
        <SearchIcon />
        <span style={{ fontSize: 13, fontWeight: 400 }}>Search 200+ apps...</span>
      </div>
    </motion.div>
  )
}

/* ── Section: your team is using ── */

function TeamRow({ app, enterpriseTeamSection = false }) {
  const usageLine = enterpriseTeamSection
    ? `${getEnterpriseOrgUsageCount(app.id)} people are using at your company`
    : `${app.teamCount} people on your team`
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: '#222222', border: '1px solid #2E2E2E', borderRadius: 10, padding: '12px 16px',
    }}>
      <AppIcon initials={app.initials} bg={app.iconBg} size={36} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', lineHeight: '20px' }}>{app.name}</div>
        {enterpriseTeamSection && app.tagline && (
          <div style={{
            fontSize: 12, fontWeight: 400, color: '#AAAAAA', lineHeight: '17px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {app.tagline}
          </div>
        )}
        <div style={{ fontSize: 12, fontWeight: 400, color: '#888888', lineHeight: '18px' }}>{usageLine}</div>
      </div>
      <AddButton />
    </div>
  )
}

function CarouselArrow({ direction, onClick, disabled }) {
  const [hover, setHover] = useState(false)
  const isLeft = direction === 'left'
  return (
    <button
      type="button"
      aria-label={isLeft ? 'Previous' : 'Next'}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 9999,
        border: `1px solid ${disabled ? '#2A2A2A' : hover ? '#555555' : '#3A3A3A'}`,
        background: disabled ? '#1A1A1A' : hover ? '#333333' : '#222222',
        color: disabled ? '#444444' : hover ? '#FFFFFF' : '#AAAAAA',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background 0.12s, border-color 0.12s, color 0.12s',
        padding: 0,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d={isLeft ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'}
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

const CAROUSEL_GAP = 12

function TeamPopularCarousel({ enterpriseTeamSection }) {
  if (!enterpriseTeamSection) return null
  const items = getOrgPopularCarouselApps()
  const trackRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  if (items.length === 0) return null

  function updateScrollState() {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 1)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  function scroll(dir) {
    const el = trackRef.current
    if (!el) return
    const cardW = el.clientWidth / 4
    const step = cardW * 4
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' })
    setTimeout(updateScrollState, 350)
  }

  return (
    <div role="region" aria-label="Popular apps across your organization">
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: '#666666',
          textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: '16px',
        }}>
          Most used in your organisation
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <CarouselArrow direction="left" onClick={() => scroll('left')} disabled={!canScrollLeft} />
          <CarouselArrow direction="right" onClick={() => scroll('right')} disabled={!canScrollRight} />
        </div>
      </div>
      <div
        ref={trackRef}
        className="scrollbar-none"
        onScroll={updateScrollState}
        style={{
          display: 'flex', flexDirection: 'row', flexWrap: 'nowrap',
          gap: CAROUSEL_GAP,
          overflowX: 'auto', overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {items.map(app => (
          <div
            key={app.id}
            style={{
              flex: `0 0 calc(25% - ${CAROUSEL_GAP * 3 / 4}px)`, boxSizing: 'border-box',
              background: '#222222', border: '1px solid #2E2E2E', borderRadius: 10,
              padding: '10px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 6,
            }}
          >
            <AppIcon initials={app.initials} bg={app.iconBg} size={32} />
            <div style={{
              fontSize: 12, fontWeight: 600, color: '#FFFFFF', lineHeight: '16px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {app.name}
            </div>
            {app.tagline && (
              <div style={{
                fontSize: 11, fontWeight: 400, color: '#888888', lineHeight: '15px',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {app.tagline}
              </div>
            )}
            <div style={{ fontSize: 11, fontWeight: 400, color: '#6B6B6B', lineHeight: '14px' }}>
              {getEnterpriseOrgUsageCount(app.id)} at your company
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TeamSection({ q1Answers, enterpriseTeamSection = false }) {
  if (enterpriseTeamSection) {
    return <TeamPopularCarousel enterpriseTeamSection />
  }
  const apps = getTeamApps(q1Answers)
  if (apps.length === 0) return null
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.06 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', margin: 0, lineHeight: '24px' }}>Your team is using</h2>
        <p style={{ fontSize: 13, fontWeight: 400, color: '#888888', margin: '4px 0 0', lineHeight: '20px' }}>Popular with people in your org right now</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        {apps.map(app => <TeamRow key={app.id} app={app} />)}
      </div>
    </motion.div>
  )
}

/* ── Section: apps for your workflows ── */

function WorkflowCard({ app }) {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? '#252525' : '#1F1F1F',
        border: '1px solid #2E2E2E', borderRadius: 12,
        padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
        transition: 'background 0.15s',
      }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <AppIcon initials={app.initials} bg={app.iconBg} size={40} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', lineHeight: '22px' }}>{app.name}</div>
          <p style={{ fontSize: 13, fontWeight: 400, color: '#888888', lineHeight: '20px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.tagline ?? ''}</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {app.surfaces.map(s => <SurfaceTag key={s} surface={s} />)}
      </div>
    </div>
  )
}

function ClearFiltersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Resets Surface, Category, App type, Discover, and workflow chip to All (when chips are visible). */
function ClearFiltersButton({ onClick, disabled }) {
  const [hover, setHover] = useState(false)
  const tooltip = disabled
    ? 'No filters to clear'
    : 'You can clear all the filters at once — surface, category, app type, Discover, and workflow.'
  return (
    <button
      type="button"
      aria-label="Clear all filters"
      title={tooltip}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: 32,
        padding: '0 12px',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        background: disabled ? '#222222' : hover ? '#333333' : '#2A2A2A',
        border: `1px solid ${disabled ? '#2A2A2A' : hover ? '#555555' : '#3A3A3A'}`,
        color: disabled ? '#666666' : hover ? '#FFFFFF' : '#AAAAAA',
        transition: 'background 0.12s, border-color 0.12s, color 0.12s',
        fontSize: 13,
        fontWeight: 500,
        fontFamily: FONT,
      }}
    >
      <ClearFiltersIcon />
      Clear filter
    </button>
  )
}

function LoadMoreButton({ remaining, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
      <button type="button" onClick={onClick}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          background: hover ? '#333333' : '#2A2A2A',
          border: '1px solid #3A3A3A', borderRadius: 8,
          height: 38, padding: '0 20px',
          cursor: 'pointer', transition: 'background 0.12s',
          fontSize: 13, fontWeight: 500, color: '#FFFFFF',
          fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
        Show more ({remaining})
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M4 6l4 4 4-4" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}

function WorkflowSection({ q1Answers, q2Answers, browseAllMode = false }) {
  const userWorkflowChips = getWorkflowChips(q2Answers)
  /** Workflow pills (All + categories) only after the user has workflow preferences (onboarding or Preferences). */
  const showWorkflowChipsRow = userWorkflowChips.length > 0
  const workflowChips = [{ key: 'all', label: 'All' }, ...userWorkflowChips]

  const [activeKey, setActiveKey] = useState(() => (
    browseAllMode ? 'all' : (userWorkflowChips[0]?.key ?? 'all')
  ))

  const filterWorkflowKey = showWorkflowChipsRow ? activeKey : 'all'

  const [surfaceFilter, setSurfaceFilter] = useState(() =>
    (q1Answers ?? []).map(k => Q1_TO_SURFACE[k]).filter(Boolean)
  )
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [appTypeFilter, setAppTypeFilter] = useState(null)
  const [discoverFilter, setDiscoverFilter] = useState(null)

  const surfaceRef = useRef(null)
  const categoryRef = useRef(null)
  const appTypeRef = useRef(null)
  const discoverRef = useRef(null)

  const [surfaceOpen, setSurfaceOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [appTypeOpen, setAppTypeOpen] = useState(false)
  const [discoverOpen, setDiscoverOpen] = useState(false)

  const closeAll = useCallback(() => {
    setSurfaceOpen(false)
    setCategoryOpen(false)
    setAppTypeOpen(false)
    setDiscoverOpen(false)
  }, [])

  const PAGE_SIZE = 15
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [hoverWorkflowKey, setHoverWorkflowKey] = useState(null)

  const filtered = getFilteredApps(filterWorkflowKey, surfaceFilter, categoryFilter, discoverFilter)
  const allApps = browseAllMode
    ? [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    : filtered
  const apps = allApps.slice(0, visibleCount)
  const hasMore = visibleCount < allApps.length

  const categoryOptions = [
    { key: null, label: 'All categories' },
    ...ALL_CATEGORIES.map(c => ({ key: c, label: c })),
  ]
  const appTypeOptions = [
    { key: null, label: 'All types' },
    ...APP_TYPES.map(t => ({ key: t, label: t })),
  ]

  function surfaceLabel() {
    if (surfaceFilter.length === 0) return 'Surface'
    if (surfaceFilter.length === 1) return SURFACE_LABELS[surfaceFilter[0]]
    return `${surfaceFilter.length} surfaces`
  }
  function categoryLabel() {
    return categoryFilter || 'Category'
  }
  function appTypeLabel() {
    return appTypeFilter || 'App type'
  }
  function discoverLabel() {
    if (!discoverFilter) return 'Discover'
    const row = DISCOVER_OPTIONS.find(o => o.key === discoverFilter)
    return row?.label ?? 'Discover'
  }

  const hasActiveFilters = !!(
    surfaceFilter.length > 0 ||
    categoryFilter ||
    appTypeFilter ||
    discoverFilter ||
    (showWorkflowChipsRow && activeKey !== 'all')
  )

  function clearAllFilters() {
    closeAll()
    setSurfaceFilter([])
    setCategoryFilter(null)
    setAppTypeFilter(null)
    setDiscoverFilter(null)
    setActiveKey('all')
    setVisibleCount(PAGE_SIZE)
  }

  function toggleSurface(key) {
    setSurfaceFilter(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.12 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header + filters row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', margin: 0, lineHeight: '24px' }}>
            {browseAllMode ? 'All apps' : 'Apps for your workflows'}
          </h2>
          <p style={{ fontSize: 13, fontWeight: 400, color: '#888888', margin: '4px 0 0', lineHeight: '20px' }}>
            {browseAllMode
              ? 'The full catalog, sorted A–Z. Add filters whenever you want a shorter list.'
              : 'Curated based on what you told us'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <FilterButton label={surfaceLabel()} active={surfaceFilter.length > 0} open={surfaceOpen}
            innerRef={surfaceRef} onClick={() => { closeAll(); setSurfaceOpen(o => !o) }} />
          <FilterButton label={categoryLabel()} active={!!categoryFilter} open={categoryOpen}
            innerRef={categoryRef} onClick={() => { closeAll(); setCategoryOpen(o => !o) }} />
          <FilterButton label={appTypeLabel()} active={!!appTypeFilter} open={appTypeOpen}
            innerRef={appTypeRef} onClick={() => { closeAll(); setAppTypeOpen(o => !o) }} />
          <FilterButton label={discoverLabel()} active={!!discoverFilter} open={discoverOpen}
            innerRef={discoverRef} onClick={() => { closeAll(); setDiscoverOpen(o => !o) }} />
        </div>
      </div>

      {/* Workflow chips (left) + Clear filter (right); row also when only dropdown filters are active (no chips). */}
      {(browseAllMode || showWorkflowChipsRow || hasActiveFilters) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            flex: '1 1 0',
            minWidth: 0,
            alignItems: 'center',
          }}>
            {showWorkflowChipsRow && workflowChips.map(chip => {
              const active = chip.key === activeKey
              const hover = !active && hoverWorkflowKey === chip.key
              return (
                <button
                  key={chip.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => { setActiveKey(chip.key); setVisibleCount(PAGE_SIZE) }}
                  onMouseEnter={() => setHoverWorkflowKey(chip.key)}
                  onMouseLeave={() => setHoverWorkflowKey(null)}
                  style={{
                    boxSizing: 'border-box',
                    background: active
                      ? WORKFLOW_CHIP.selectedBg
                      : hover
                        ? WORKFLOW_CHIP.idleHoverBg
                        : WORKFLOW_CHIP.idleBg,
                    border: active
                      ? `1.5px solid ${WORKFLOW_CHIP.outline}`
                      : '1.5px solid transparent',
                    borderRadius: 9999,
                    height: 32,
                    padding: '0 14px',
                    cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                    fontSize: 13,
                    fontWeight: 500,
                    color: active ? WORKFLOW_CHIP.labelSelected : WORKFLOW_CHIP.labelIdle,
                    fontFamily: FONT,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>
          <ClearFiltersButton onClick={clearAllFilters} disabled={!hasActiveFilters} />
        </div>
      )}

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
        {apps.map((app, i) => (
          <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.04 * i }}>
            <WorkflowCard app={app} />
          </motion.div>
        ))}
      </div>

      {hasMore && <LoadMoreButton remaining={allApps.length - visibleCount}
        onClick={() => setVisibleCount(c => c + PAGE_SIZE)} />}

      {apps.length === 0 && (
        <p style={{ fontSize: 14, color: '#666666', padding: '24px 0' }}>
          No apps match these filters. Try adjusting your selection.
        </p>
      )}

      {/* ── Dropdowns ── */}
      <AnimatePresence>
        {surfaceOpen && (
          <Dropdown anchorRef={surfaceRef} onClose={() => setSurfaceOpen(false)}
            anchor="bottom-center" dropdownWidth={220} offsetY={6} showArrow arrowColor="#111111" arrowBorder="#595959">
            <SurfacePanel
              selected={surfaceFilter}
              onToggle={toggleSurface}
              onClearAll={() => { setSurfaceFilter([]); setVisibleCount(PAGE_SIZE) }}
            />
          </Dropdown>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {categoryOpen && (
          <Dropdown anchorRef={categoryRef} onClose={() => setCategoryOpen(false)}
            anchor="bottom-center" dropdownWidth={240} offsetY={6} showArrow arrowColor="#111111" arrowBorder="#595959">
            <DropdownPanel options={categoryOptions} active={categoryFilter}
              onSelect={v => { setCategoryFilter(v); setCategoryOpen(false); setVisibleCount(PAGE_SIZE) }} width={240} />
          </Dropdown>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {appTypeOpen && (
          <Dropdown anchorRef={appTypeRef} onClose={() => setAppTypeOpen(false)}
            anchor="bottom-center" dropdownWidth={200} offsetY={6} showArrow arrowColor="#111111" arrowBorder="#595959">
            <DropdownPanel options={appTypeOptions} active={appTypeFilter}
              onSelect={v => { setAppTypeFilter(v); setAppTypeOpen(false); setVisibleCount(PAGE_SIZE) }} width={200} />
          </Dropdown>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {discoverOpen && (
          <Dropdown anchorRef={discoverRef} onClose={() => setDiscoverOpen(false)}
            anchor="bottom-center" dropdownWidth={DISCOVER_DROPDOWN_WIDTH} offsetY={6} showArrow arrowColor="#111111" arrowBorder="#595959">
            <DiscoverPanel
              active={discoverFilter}
              onSelect={v => {
                setDiscoverFilter(v)
                setDiscoverOpen(false)
                setVisibleCount(PAGE_SIZE)
              }}
            />
          </Dropdown>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Section: tip banner ── */

function TipBanner() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...SPRING, delay: 0.2 }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: 'rgba(37, 99, 235, 0.12)', border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 10, padding: '16px 20px',
      }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0, marginTop: 1 }}>
        <path stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M15 14c.2-1 .7-1.7 1.5-2.5c1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5c.7.7 1.3 1.5 1.5 2.5m0 4h6m-5 4h4" />
      </svg>
      <p style={{ fontSize: 13, fontWeight: 400, color: '#FFFFFF', lineHeight: '20px', margin: 0 }}>
        <span style={{ fontWeight: 600 }}>Tip:</span>{' '}
        Apps you install appear in your meetings, message spaces, or sidebar depending on the app type. You can manage them anytime from Settings &gt; Apps.
      </p>
    </motion.div>
  )
}

/* ── Section: browse by category ── */

function CategorySection() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', margin: 0, lineHeight: '24px' }}>Browse by category</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ALL_CATEGORIES.map(cat => (
          <span key={cat} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 13, fontWeight: 500, color: '#FFFFFF',
            background: '#222222', border: '1px solid #333333',
            borderRadius: 9999, padding: '6px 14px', lineHeight: '20px', cursor: 'default',
          }}>
            <AppHubCategoryIcon category={cat} size={16} />
            {cat}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

/* ── Main export ── */

/** `showTeamSection` false for SMB new users without org data; enterprise defaults to true. */
export function RecommendationsScreen({
  q1Answers: initialQ1 = [],
  q2Answers: initialQ2 = [],
  showTeamSection = true,
  /** Enterprise: realistic org usage copy, taglines on team cards, trending carousel in section header. */
  enterpriseTeamSection = false,
  /** Skip path: same filters and layout as personalized; defaults show the full catalogue (All + unset filters). */
  browseAllMode = false,
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
      style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 36, textAlign: 'left' }}>
      <HeaderRow />
      {showTeamSection && (
        <TeamSection q1Answers={initialQ1} enterpriseTeamSection={enterpriseTeamSection} />
      )}
      <WorkflowSection
        q1Answers={initialQ1}
        q2Answers={initialQ2}
        browseAllMode={browseAllMode}
      />
      <TipBanner />
      <CategorySection />
    </motion.div>
  )
}
