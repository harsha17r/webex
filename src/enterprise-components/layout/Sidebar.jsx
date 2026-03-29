import { useState, useRef } from 'react'
import { AnimatePresence } from 'motion/react'
import { Dropdown } from '../Dropdown'

/* ─────────────────────────────────────────────────────────
 * Figma Sidebar spec:
 *   x:0, y:76, w:107, h:948
 *   Column layout, justifyContent: space-between, alignItems: center
 *   padding: 0 0 48px
 *   Top group: gap 28px, contains GroupA + GroupB
 *   GroupA (Message/Meet/Call): gap 20px, paddingBottom 28px, gradient bottom border
 *   GroupB (Team/Whiteboard/More): gap 20px
 *   Bottom group: gap 20px (Settings/Help)
 *   Each nav item: column, center, gap 8px
 *   Icon container: 40×40, borderRadius 9999, bg #222222 ALWAYS
 *   Active label: #E9E9E9, inactive label: #D4D4D4
 *   Icon SVGs: white #FFFFFF
 * ───────────────────────────────────────────────────────── */

// Fluent UI icons — regular (default) + filled (active)
// All from fluent:*-20-regular / fluent:*-20-filled via Iconify
const icons = {
  message: (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="M10 2a8 8 0 1 1-3.613 15.14l-.121-.065l-3.645.91a.5.5 0 0 1-.62-.441v-.082l.014-.083l.91-3.644l-.063-.12a8 8 0 0 1-.83-2.887l-.025-.382L2 10a8 8 0 0 1 8-8m0 1a7 7 0 0 0-6.106 10.425a.5.5 0 0 1 .063.272l-.014.094l-.756 3.021l3.024-.754a.5.5 0 0 1 .188-.01l.091.021l.087.039A7 7 0 1 0 10 3m.5 8a.5.5 0 0 1 .09.992L10.5 12h-3a.5.5 0 0 1-.09-.992L7.5 11zm2-3a.5.5 0 0 1 .09.992L12.5 9h-5a.5.5 0 0 1-.09-.992L7.5 8z"/>
    </svg>
  ),
  message_filled: (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="M10 2a8 8 0 1 1-3.613 15.14l-.121-.065l-3.645.91a.5.5 0 0 1-.62-.441v-.082l.014-.083l.91-3.644l-.063-.12a8 8 0 0 1-.83-2.887l-.025-.382L2 10a8 8 0 0 1 8-8m.5 9h-3l-.09.008a.5.5 0 0 0 0 .984L7.5 12h3l.09-.008a.5.5 0 0 0 0-.984zm2-3h-5l-.09.008a.5.5 0 0 0 0 .984L7.5 9h5l.09-.008a.5.5 0 0 0 0-.984z"/>
    </svg>
  ),
  meet: (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="M5 4a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-.321l3.037 2.097a1.25 1.25 0 0 0 1.96-1.029V6.252a1.25 1.25 0 0 0-1.96-1.028L13 7.32V7a3 3 0 0 0-3-3zm8 4.536l3.605-2.49a.25.25 0 0 1 .392.206v7.495a.25.25 0 0 1-.392.206L13 11.463zM3 7a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    </svg>
  ),
  meet_filled: (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="M2 7a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3zm14.037 7.776L14 13.369V6.63l2.037-1.406a1.25 1.25 0 0 1 1.96 1.028v7.495a1.25 1.25 0 0 1-1.96 1.029"/>
    </svg>
  ),
  call: (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="m6.987 2.066l-.717.216a3.5 3.5 0 0 0-2.454 2.854c-.297 2.068.367 4.486 1.968 7.259c1.597 2.766 3.355 4.548 5.29 5.328a3.5 3.5 0 0 0 3.715-.705l.542-.514a2 2 0 0 0 .247-2.623l-1.356-1.88a1.5 1.5 0 0 0-1.655-.556l-2.051.627l-.053.01c-.226.033-.748-.456-1.398-1.582c-.68-1.178-.82-1.867-.633-2.045l1.043-.973a2.5 2.5 0 0 0 .575-2.85l-.662-1.471a2 2 0 0 0-2.4-1.095m1.49 1.505l.66 1.471a1.5 1.5 0 0 1-.344 1.71l-1.046.974C7.078 8.36 7.3 9.442 8.2 11c.846 1.466 1.618 2.19 2.448 2.064l.124-.026l2.088-.637a.5.5 0 0 1 .552.185l1.356 1.88a1 1 0 0 1-.123 1.312l-.543.514a2.5 2.5 0 0 1-2.653.503c-1.698-.684-3.303-2.311-4.798-4.9C5.152 9.3 4.545 7.093 4.806 5.278a2.5 2.5 0 0 1 1.753-2.039l.717-.216a1 1 0 0 1 1.2.548"/>
    </svg>
  ),
  call_filled: (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="M6.987 2.066a2 2 0 0 1 2.327.946l.074.149l.662 1.471a2.5 2.5 0 0 1-.442 2.718l-.133.132l-1.043.973c-.188.178-.047.867.633 2.045c.612 1.06 1.11 1.555 1.355 1.582h.043l.053-.01l2.05-.627a1.5 1.5 0 0 1 1.564.441l.091.115l1.357 1.88a2 2 0 0 1-.125 2.497l-.122.126l-.542.514a3.5 3.5 0 0 1-3.715.705c-1.935-.78-3.693-2.562-5.29-5.328c-1.6-2.773-2.265-5.19-1.968-7.26a3.5 3.5 0 0 1 2.261-2.789l.193-.064z"/>
    </svg>
  ),
  team: (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="M10 3a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3M7.5 4.5a2.5 2.5 0 1 1 5 0a2.5 2.5 0 0 1-5 0m8-.5a1 1 0 1 0 0 2a1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0a2 2 0 0 1-4 0m-10 0a1 1 0 1 1 2 0a1 1 0 0 1-2 0m1-2a2 2 0 1 0 0 4a2 2 0 0 0 0-4m.6 11.998L5 15a2 2 0 0 1-2-2V9.25A.25.25 0 0 1 3.25 9h1.764c.04-.367.17-.708.365-1H3.25C2.56 8 2 8.56 2 9.25V13a3 3 0 0 0 3.404 2.973a5 5 0 0 1-.304-.975m9.496.975Q14.794 16 15 16a3 3 0 0 0 3-3V9.25C18 8.56 17.44 8 16.75 8h-2.129c.196.292.325.633.365 1h1.764a.25.25 0 0 1 .25.25V13a2 2 0 0 1-2.1 1.998a5 5 0 0 1-.304.975M7.25 8C6.56 8 6 8.56 6 9.25V14a4 4 0 0 0 8 0V9.25C14 8.56 13.44 8 12.75 8zM7 9.25A.25.25 0 0 1 7.25 9h5.5a.25.25 0 0 1 .25.25V14a3 3 0 1 1-6 0z"/>
    </svg>
  ),
  team_filled: (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="M12.5 4.5a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0m5 .5a2 2 0 1 1-4 0a2 2 0 0 1 4 0m-13 2a2 2 0 1 0 0-4a2 2 0 0 0 0 4M6 9.25C6 8.56 6.56 8 7.25 8h5.5c.69 0 1.25.56 1.25 1.25V14a4 4 0 0 1-8 0zm-1 0c0-.463.14-.892.379-1.25H3.25C2.56 8 2 8.56 2 9.25V13a3 3 0 0 0 3.404 2.973A5 5 0 0 1 5 14zM15 14c0 .7-.144 1.368-.404 1.973Q14.794 16 15 16a3 3 0 0 0 3-3V9.25C18 8.56 17.44 8 16.75 8h-2.129c.24.358.379.787.379 1.25z"/>
    </svg>
  ),
  whiteboard: (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="m17.331 3.461l.11.102l.102.11a1.93 1.93 0 0 1-.103 2.606l-3.603 3.617a1.9 1.9 0 0 1-.794.477l-1.96.591a.84.84 0 0 1-1.047-.567a.85.85 0 0 1 .005-.503l.621-1.942c.093-.289.252-.55.465-.765l3.612-3.625a1.904 1.904 0 0 1 2.592-.1m-1.884.806l-3.611 3.626a.9.9 0 0 0-.221.363l-.533 1.664l1.672-.505c.14-.042.27-.12.374-.224l3.603-3.617a.93.93 0 0 0 .06-1.24l-.06-.065l-.064-.06a.904.904 0 0 0-1.22.058M12.891 4H5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7.134l-1 1.004V13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.23c.573-.486 1.34-1.11 2.074-1.535c.41-.237.772-.39 1.062-.439c.281-.048.423.01.51.098a.33.33 0 0 1 .106.185a.6.6 0 0 1-.04.276c-.093.276-.31.602-.602 1.01l-.094.132c-.252.35-.538.747-.736 1.144c-.225.447-.392.995-.204 1.557c.17.508.498.845.926 1.011c.402.156.844.144 1.236.073c.785-.14 1.584-.552 2.02-.813a.5.5 0 0 0-.515-.858c-.399.24-1.075.578-1.681.687c-.303.054-.537.042-.698-.021c-.136-.053-.26-.153-.34-.395c-.062-.188-.03-.435.15-.793c.16-.32.396-.649.656-1.01l.093-.131c.276-.386.587-.832.737-1.273c.077-.229.122-.486.08-.753a1.32 1.32 0 0 0-.386-.736c-.397-.396-.914-.456-1.386-.376c-.462.079-.945.3-1.394.559c-.546.315-1.096.722-1.574 1.104V7a2 2 0 0 1 2-2h6.895z"/>
    </svg>
  ),
  whiteboard_filled: (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="m17.331 3.461l.11.102l.102.11a1.93 1.93 0 0 1-.103 2.606l-3.603 3.617a1.9 1.9 0 0 1-.794.477l-1.96.591a.84.84 0 0 1-1.047-.567a.85.85 0 0 1 .005-.503l.621-1.942c.093-.289.252-.55.465-.765l3.612-3.625a1.904 1.904 0 0 1 2.592-.1M12.891 4H4.5A2.5 2.5 0 0 0 2 6.5v2.264a18 18 0 0 1 1.72-1.411c.647-.458 1.342-.86 1.979-1.026c.322-.085.662-.118.987-.042c.34.08.633.272.846.582c.463.674.126 1.404-.194 1.924c-.167.272-.374.556-.576.834l-.023.03c-.211.292-.421.582-.609.881c-.158.285-.2.622-.13.865q.054.174.166.265c.073.061.19.119.379.136c.33.03.759-.083 1.286-.272a.5.5 0 1 1 .338.94c-.52.188-1.14.38-1.714.328a1.66 1.66 0 0 1-.928-.363a1.5 1.5 0 0 1-.486-.753c-.16-.546-.05-1.165.224-1.648l.005-.009l.006-.01c.21-.337.443-.657.655-.948l.01-.014c.213-.291.399-.547.545-.785c.326-.53.298-.724.222-.835a.4.4 0 0 0-.25-.175c-.113-.026-.278-.024-.505.036c-.46.12-1.038.438-1.654.875c-.853.604-1.701 1.38-2.299 1.985V13.5A2.5 2.5 0 0 0 4.5 16h11a2.5 2.5 0 0 0 2.5-2.5V7.134l-3.455 3.468c-.338.34-.755.59-1.213.728l-1.96.591a1.84 1.84 0 0 1-2.295-1.238a1.85 1.85 0 0 1 .011-1.094l.622-1.942c.14-.44.383-.839.709-1.165z"/>
    </svg>
  ),
  more: (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <circle cx="5" cy="10" r="1.5" fill="currentColor"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="M1.911 7.383a8.5 8.5 0 0 1 1.78-3.08a.5.5 0 0 1 .54-.135l1.918.686a1 1 0 0 0 1.32-.762l.366-2.006a.5.5 0 0 1 .388-.4a8.5 8.5 0 0 1 3.554 0a.5.5 0 0 1 .388.4l.366 2.006a1 1 0 0 0 1.32.762l1.919-.686a.5.5 0 0 1 .54.136a8.5 8.5 0 0 1 1.78 3.079a.5.5 0 0 1-.153.535l-1.555 1.32a1 1 0 0 0 0 1.524l1.555 1.32a.5.5 0 0 1 .152.535a8.5 8.5 0 0 1-1.78 3.08a.5.5 0 0 1-.54.135l-1.918-.686a1 1 0 0 0-1.32.762l-.366 2.007a.5.5 0 0 1-.388.399a8.5 8.5 0 0 1-3.554 0a.5.5 0 0 1-.388-.4l-.366-2.006a1 1 0 0 0-1.32-.762l-1.918.686a.5.5 0 0 1-.54-.136a8.5 8.5 0 0 1-1.78-3.079a.5.5 0 0 1 .152-.535l1.555-1.32a1 1 0 0 0 0-1.524l-1.555-1.32a.5.5 0 0 1-.152-.535m1.06-.006l1.294 1.098a2 2 0 0 1 0 3.05l-1.293 1.098c.292.782.713 1.51 1.244 2.152l1.596-.57q.155-.055.315-.085a2 2 0 0 1 2.326 1.609l.304 1.669a7.6 7.6 0 0 0 2.486 0l.304-1.67a1.998 1.998 0 0 1 2.641-1.524l1.596.571a7.5 7.5 0 0 0 1.245-2.152l-1.294-1.098a1.998 1.998 0 0 1 0-3.05l1.294-1.098a7.5 7.5 0 0 0-1.245-2.152l-1.596.57a2 2 0 0 1-2.64-1.524l-.305-1.669a7.6 7.6 0 0 0-2.486 0l-.304 1.669a2 2 0 0 1-2.64 1.525l-1.597-.571a7.5 7.5 0 0 0-1.244 2.152M7.502 10a2.5 2.5 0 1 1 5 0a2.5 2.5 0 0 1-5 0m1 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 0 0-3 0"/>
    </svg>
  ),
  settings_filled: (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="M1.911 7.383a8.5 8.5 0 0 1 1.78-3.08a.5.5 0 0 1 .54-.135l1.918.686a1 1 0 0 0 1.32-.762l.366-2.006a.5.5 0 0 1 .388-.4a8.5 8.5 0 0 1 3.554 0a.5.5 0 0 1 .388.4l.366 2.006a1 1 0 0 0 1.32.762l1.919-.686a.5.5 0 0 1 .54.136a8.5 8.5 0 0 1 1.78 3.079a.5.5 0 0 1-.153.535l-1.555 1.32a1 1 0 0 0 0 1.524l1.555 1.32a.5.5 0 0 1 .152.535a8.5 8.5 0 0 1-1.78 3.08a.5.5 0 0 1-.54.135l-1.918-.686a1 1 0 0 0-1.32.762l-.366 2.007a.5.5 0 0 1-.388.399a8.5 8.5 0 0 1-3.554 0a.5.5 0 0 1-.388-.4l-.366-2.006a1 1 0 0 0-1.32-.762l-1.918.686a.5.5 0 0 1-.54-.136a8.5 8.5 0 0 1-1.78-3.079a.5.5 0 0 1 .152-.535l1.555-1.32a1 1 0 0 0 0-1.524l-1.555-1.32a.5.5 0 0 1-.152-.535M8.001 10a2 2 0 1 0 4 0a2 2 0 0 0-4 0"/>
    </svg>
  ),
  help: (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="M10 2a8 8 0 1 1 0 16a8 8 0 0 1 0-16m0 1a7 7 0 1 0 0 14a7 7 0 0 0 0-14m0 10.5a.75.75 0 1 1 0 1.5a.75.75 0 0 1 0-1.5m0-8a2.5 2.5 0 0 1 1.651 4.377l-.154.125l-.219.163l-.087.072a2 2 0 0 0-.156.149c-.339.36-.535.856-.535 1.614a.5.5 0 0 1-1 0c0-1.012.293-1.752.805-2.298a3 3 0 0 1 .356-.323l.247-.185l.118-.1A1.5 1.5 0 1 0 8.5 8a.5.5 0 0 1-1 .001A2.5 2.5 0 0 1 10 5.5"/>
    </svg>
  ),
  help_filled: (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="M10 2a8 8 0 1 1 0 16a8 8 0 0 1 0-16m0 11.5a.75.75 0 1 0 0 1.5a.75.75 0 0 0 0-1.5m0-8A2.5 2.5 0 0 0 7.5 8a.5.5 0 0 0 1 0a1.5 1.5 0 1 1 2.632.984l-.106.11l-.118.1l-.247.185a3 3 0 0 0-.356.323C9.793 10.248 9.5 10.988 9.5 12a.5.5 0 0 0 1 0c0-.758.196-1.254.535-1.614l.075-.076l.08-.073l.088-.072l.219-.163l.154-.125A2.5 2.5 0 0 0 10 5.5"/>
    </svg>
  ),
}

const groupA = [
  { key: 'message', label: 'Message' },
  { key: 'meet',    label: 'Meet'    },
  { key: 'call',    label: 'Call'    },
]

const groupB = [
  { key: 'team',       label: 'Team'       },
  { key: 'whiteboard', label: 'Whiteboard' },
]

const MORE_ITEMS = [
  {
    key: 'vidcast',
    label: 'Vidcast',
    subtitle: 'Record and share work videos',
    bg: 'var(--bg-elevated)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="5" width="13" height="12" rx="2" stroke="var(--text-primary)" strokeWidth="1.4"/>
        <path d="M15 9.5L20 7V15L15 12.5" stroke="var(--text-primary)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8" cy="11" r="2" fill="var(--text-primary)" opacity="0.6"/>
      </svg>
    ),
  },
  {
    key: 'apphub',
    label: 'App Hub',
    subtitle: 'Find workflows and apps',
    bg: 'var(--border-strong)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="2" width="8" height="8" rx="2" stroke="var(--text-primary)" strokeWidth="1.4"/>
        <rect x="12" y="2" width="8" height="8" rx="2" stroke="var(--text-primary)" strokeWidth="1.4"/>
        <rect x="2" y="12" width="8" height="8" rx="2" stroke="var(--text-primary)" strokeWidth="1.4"/>
        <rect x="12" y="12" width="8" height="8" rx="2" stroke="var(--text-primary)" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    key: 'insights',
    label: 'Personal Insights',
    subtitle: 'Insights for better work connections',
    bg: 'var(--border-strong)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="9" cy="7" r="3.5" stroke="var(--text-primary)" strokeWidth="1.4"/>
        <path d="M2 19c0-3.866 3.134-6 7-6" stroke="var(--text-primary)" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M15 13v6M12.5 15.5h5" stroke="var(--text-primary)" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
]

function CustomizeLink() {
  const [hovered, setHovered] = useState(false)
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '16px 0 12px 8px',
        fontSize: 14, fontWeight: 500,
        color: hovered ? 'var(--accent)' : 'var(--accent)',
        lineHeight: '16px', cursor: 'pointer',
        display: 'block',
        transition: 'color 0.15s',
        textDecoration: hovered ? 'underline' : 'none',
      }}
    >
      Customize side bar
    </span>
  )
}

function MoreDropdown() {
  const [hoveredKey, setHoveredKey] = useState(null)

  return (
    <div
      style={{
        width: 320,
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-strong)',
        borderRadius: 20,
        padding: 12,
        display: 'flex', flexDirection: 'column', gap: 8,
        zIndex: 1000,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        fontFamily: "'Inter', system-ui, sans-serif",
        boxSizing: 'border-box',
      }}
    >
      {MORE_ITEMS.map(item => (
        <div
          key={item.key}
          onMouseEnter={() => setHoveredKey(item.key)}
          onMouseLeave={() => setHoveredKey(null)}
          style={{
            display: 'flex', flexDirection: 'row', alignItems: 'center',
            gap: 8, padding: '8px 0 8px 8px',
            background: hoveredKey === item.key ? 'var(--border)' : 'transparent',
            borderRadius: 12,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          <div style={{
            width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {item.icon}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', lineHeight: '20px' }}>
              {item.label}
            </span>
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', lineHeight: '20px' }}>
              {item.subtitle}
            </span>
          </div>
        </div>
      ))}

      {/* Customize sidebar — plain text link */}
      <CustomizeLink />
    </div>
  )
}

const bottomGroup = [
  { key: 'settings', label: 'Settings' },
  { key: 'help',     label: 'Help'     },
]

function NavItem({ navKey, label, active, onClick }) {
  return (
    <div
      onClick={() => onClick(navKey)}
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 2, cursor: 'pointer',
        width: '100%', boxSizing: 'border-box',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 9999,
        background: active ? 'var(--bg-elevated)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        color: 'var(--text-primary)',
      }}>
        {icons[active && icons[`${navKey}_filled`] ? `${navKey}_filled` : navKey]}
      </div>
      <span style={{
        fontSize: 12, fontWeight: 500,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        textAlign: 'center',
        lineHeight: '16px',
      }}>
        {label}
      </span>
    </div>
  )
}

export function Sidebar({ activeTab, onTabChange }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef    = useRef(null)
  const closeTimer = useRef(null)

  function keepOpen()  { clearTimeout(closeTimer.current) }
  function autoClose() { closeTimer.current = setTimeout(() => setMoreOpen(false), 220) }

  return (
    <div style={{
      width: 90, minWidth: 90, height: '100%',
      background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 0 48px',
      boxSizing: 'border-box',
    }}>

      {/* Top group: GroupA + GroupB */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        gap: 28, width: '100%', paddingTop: 20,
        boxSizing: 'border-box',
      }}>

        {/* Group A — Message / Meet / Call, with gradient bottom border */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          width: '100%',
          paddingBottom: 28,
          borderBottom: 'none',
          position: 'relative',
          boxSizing: 'border-box',
        }}>
          {groupA.map(item => (
            <NavItem
              key={item.key}
              navKey={item.key}
              label={item.label}
              active={activeTab === item.key}
              onClick={onTabChange}
            />
          ))}
          {/* Gradient bottom border pseudo-element via absolutely positioned div */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 1,
            background: 'linear-gradient(270deg, var(--bg-primary) 0%, #D9D9D9 41%, var(--bg-primary) 100%)',
          }} />
        </div>

        {/* Group B — Team / Whiteboard + More button */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          gap: 20, width: '100%',
          boxSizing: 'border-box',
        }}>
          {groupB.map(item => (
            <NavItem
              key={item.key}
              navKey={item.key}
              label={item.label}
              active={activeTab === item.key}
              onClick={onTabChange}
            />
          ))}

          {/* More — custom button with dropdown */}
          <div
            ref={moreRef}
            onClick={() => setMoreOpen(o => !o)}
            onMouseEnter={keepOpen}
            onMouseLeave={autoClose}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 2, cursor: 'pointer',
              width: '100%', boxSizing: 'border-box',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 9999,
              background: moreOpen ? 'var(--bg-elevated)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              color: 'var(--text-primary)',
            }}>
              {icons.more}
            </div>
            <span style={{
              fontSize: 12, fontWeight: 500,
              fontFamily: "'Inter', system-ui, sans-serif",
              color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '16px',
            }}>
              More
            </span>
          </div>
        </div>
      </div>

      {/* Bottom group — Settings / Help */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        gap: 20, width: '100%',
        boxSizing: 'border-box',
      }}>
        {bottomGroup.map(item => (
          <NavItem
            key={item.key}
            navKey={item.key}
            label={item.label}
            active={activeTab === item.key}
            onClick={onTabChange}
          />
        ))}
      </div>

      <AnimatePresence>
        {moreOpen && (
          <Dropdown
            anchorRef={moreRef}
            onClose={() => setMoreOpen(false)}
            onMouseEnter={keepOpen}
            onMouseLeave={autoClose}
          >
            <MoreDropdown />
          </Dropdown>
        )}
      </AnimatePresence>

    </div>
  )
}
