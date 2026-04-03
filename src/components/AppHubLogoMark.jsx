/**
 * App Hub mark: 2×2 filled tile grid (sidebar-style proportions, solid fill).
 */
export function AppHubLogoMark({ size = 26 }) {
  const fill = '#E9E9E9'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: 'block' }}
    >
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill={fill} />
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill={fill} />
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill={fill} />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill={fill} />
    </svg>
  )
}
