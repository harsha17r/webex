/**
 * Unified green → blue gradient for the onboarding flow (hero blobs, borders, accents).
 * Stops: rgb(28, 200, 76) → rgb(25, 118, 210)
 */
const STOPS = 'rgb(28, 200, 76) 0%, rgb(25, 118, 210) 100%'

/** @param {number} deg */
export function onboardingGradient(deg) {
  return `linear-gradient(${deg}deg, ${STOPS})`
}

export const ONBOARDING_GRADIENT_90 = onboardingGradient(90)
export const ONBOARDING_GRADIENT_135 = onboardingGradient(135)
export const ONBOARDING_GRADIENT_180 = onboardingGradient(180)
