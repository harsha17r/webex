// Auto-generated from Figma "Webex Design" — do not edit manually

export const gradients = {
  // App background gradients
  "bg-primary":   "linear-gradient(180deg, rgba(26, 26, 26, 1) 0%, rgba(15, 15, 15, 1) 100%)",
  "bg-secondary": "linear-gradient(180deg, rgba(38, 38, 38, 1) 0%, rgba(15, 15, 15, 1) 100%)",

  // Gradient divider (fades left + right)
  "divider": "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 22%, rgba(255, 255, 255, 0.2) 72%, rgba(255, 255, 255, 0) 100%)",

  // Illustration / empty state
  "illustration-primary": "linear-gradient(180deg, rgba(147, 196, 55, 1) 0%, rgba(39, 155, 232, 1) 100%)",

  // Brand accent gradients — Gradient-1 through 6 (used in avatars, icons, badges)
  "gradient-1": "linear-gradient(180deg, #81cf62 0%, rgba(0, 188, 244, 1) 100%)",
  "gradient-2": "linear-gradient(180deg, rgba(0, 188, 244, 1) 0%, rgba(167, 117, 253, 1) 100%)",
  "gradient-3": "linear-gradient(180deg, rgba(131, 207, 94, 1) 0%, rgba(251, 187, 36, 1) 100%)",
  "gradient-4": "linear-gradient(180deg, rgba(250, 189, 35, 1) 0%, rgba(255, 123, 61, 1) 100%)",
  "gradient-5": "linear-gradient(180deg, rgba(255, 58, 101, 1) 0%, rgba(252, 188, 37, 1) 100%)",
  "gradient-6": "linear-gradient(180deg, rgba(167, 118, 251, 1) 0%, rgba(255, 58, 102, 1) 100%)",
} as const

export type GradientKey = keyof typeof gradients
