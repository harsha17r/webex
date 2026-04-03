/**
 * Category icons for App Hub "Browse by category" — Lucide (Iconify) via better-icons.
 * Source: npx better-icons get lucide:<name> --color currentColor
 *
 * Filled paths must NOT sit under a stroked <g> (inherited stroke warps shapes).
 * SVG gets a fixed square box so flex/line-height cannot squash the viewBox.
 */

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function Wrap({ size, children }) {
  const n = Number(size) || 16
  return (
    <svg
      width={n}
      height={n}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
      style={{
        display: 'block',
        flexShrink: 0,
        width: n,
        height: n,
        minWidth: n,
        minHeight: n,
        overflow: 'visible',
      }}
    >
      {children}
    </svg>
  )
}

const ICONS = {
  Analytics: ({ size = 16 }) => (
    <Wrap size={size}>
      <path {...S} d="M3 3v16a2 2 0 0 0 2 2h16m-3-4V9m-5 8V5M8 17v-3" />
    </Wrap>
  ),
  'Calendar & Scheduling': ({ size = 16 }) => (
    <Wrap size={size}>
      <path {...S} d="M8 2v4m8-4v4" />
      <rect fill="currentColor" stroke="none" width="18" height="18" x="3" y="4" rx="2" />
      <path fill="currentColor" stroke="none" d="M3 10h18" />
    </Wrap>
  ),
  Collaboration: ({ size = 16 }) => (
    <Wrap size={size}>
      <path fill="currentColor" stroke="none" d="M18 21a8 8 0 0 0-16 0" />
      <circle fill="currentColor" stroke="none" cx="10" cy="8" r="5" />
      <path fill="currentColor" stroke="none" d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
    </Wrap>
  ),
  'Customer Support': ({ size = 16 }) => (
    <Wrap size={size}>
      <path fill="currentColor" stroke="none" d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" />
      <path fill="currentColor" stroke="none" d="M21 16v2a4 4 0 0 1-4 4h-5" />
    </Wrap>
  ),
  'Developer Tools': ({ size = 16 }) => (
    <Wrap size={size}>
      <path {...S} d="m18 16l4-4l-4-4M6 8l-4 4l4 4m8.5-12l-5 16" />
    </Wrap>
  ),
  Education: ({ size = 16 }) => (
    <Wrap size={size}>
      <path fill="currentColor" stroke="none" d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0zM22 10v6" />
      <path fill="currentColor" stroke="none" d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </Wrap>
  ),
  Healthcare: ({ size = 16 }) => (
    <Wrap size={size}>
      <path fill="currentColor" stroke="none" d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676a.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
      <path fill="currentColor" stroke="none" d="M3.22 13H9.5l.5-1l2 4.5l2-7l1.5 3.5h5.27" />
    </Wrap>
  ),
  'Human Resources': ({ size = 16 }) => (
    <Wrap size={size}>
      <path {...S} d="M12 12h.01M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m14 7a18.15 18.15 0 0 1-20 0" />
      <rect fill="currentColor" stroke="none" width="20" height="14" x="2" y="6" rx="2" />
    </Wrap>
  ),
  'Marketing & Sales': ({ size = 16 }) => (
    <Wrap size={size}>
      <path fill="currentColor" stroke="none" d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
      <path fill="currentColor" stroke="none" d="M6 14a12 12 0 0 0 2.4 7.2a2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14M8 6v8" />
    </Wrap>
  ),
  Productivity: ({ size = 16 }) => (
    <Wrap size={size}>
      <path {...S} d="M13 5h8m-8 7h8m-8 7h8M3 17l2 2l4-4M3 7l2 2l4-4" />
    </Wrap>
  ),
  'Project Management': ({ size = 16 }) => (
    <Wrap size={size}>
      <path {...S} d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2m4-10v4m4-4v2m4-2v6" />
    </Wrap>
  ),
  'Recording & Transcriptions': ({ size = 16 }) => (
    <Wrap size={size}>
      <path {...S} d="M12 19v3m7-12v2a7 7 0 0 1-14 0v-2" />
      <rect fill="currentColor" stroke="none" width="6" height="13" x="9" y="2" rx="3" />
    </Wrap>
  ),
  'Security & Compliance': ({ size = 16 }) => (
    <Wrap size={size}>
      <path fill="currentColor" stroke="none" d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path fill="currentColor" stroke="none" d="m9 12l2 2l4-4" />
    </Wrap>
  ),
  'Social and Fun': ({ size = 16 }) => (
    <Wrap size={size}>
      <path fill="currentColor" stroke="none" d="M5.8 11.3L2 22l10.7-3.79M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10m8 3l-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17M11 2l.33.82c.34.86-.2 1.82-1.11 1.98c-.7.1-1.22.72-1.22 1.43V7" />
      <path fill="currentColor" stroke="none" d="M11 13c1.93 1.93 2.83 4.17 2 5s-3.07-.07-5-2s-2.83-4.17-2-5s3.07.07 5 2" />
    </Wrap>
  ),
  'Workflow & Automation': ({ size = 16 }) => (
    <Wrap size={size}>
      <rect fill="currentColor" stroke="none" width="8" height="8" x="3" y="3" rx="2" />
      <path fill="currentColor" stroke="none" d="M7 11v4a2 2 0 0 0 2 2h4" />
      <rect fill="currentColor" stroke="none" width="8" height="8" x="13" y="13" rx="2" />
    </Wrap>
  ),
}

export function AppHubCategoryIcon({ category, size = 16 }) {
  const Cmp = ICONS[category]
  if (!Cmp) return null
  return <Cmp size={size} />
}
