import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { ProfileProvider } from './context/ProfileContext'
import { MobileGate } from './components/MobileGate'
import { WelcomeScreen } from './screens/onboarding/WelcomeScreen'
import { VerifyScreen } from './screens/onboarding/signup/VerifyScreen'
import { SetPasswordScreen } from './screens/onboarding/signup/SetPasswordScreen'
import { SSOEmailScreen } from './screens/onboarding/sso/SSOEmailScreen'
import { LumonLoginScreen } from './screens/onboarding/sso/LumonLoginScreen'
import { SSOLoadingScreen } from './screens/onboarding/sso/SSOLoadingScreen'
import { ProfileReviewScreen } from './screens/onboarding/sso/ProfileReviewScreen'
import { CalendarSyncScreen } from './screens/onboarding/CalendarSyncScreen'
import { HomeScreen } from './screens/home/HomeScreen'
import { MeetingScreen } from './screens/meeting/MeetingScreen'
import { HomeScreen as EnterpriseHomeScreen } from './screens/enterprise-home/HomeScreen'
import { MeetingScreen as EnterpriseMeetingScreen } from './screens/enterprise-meeting/MeetingScreen'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/verify" element={<VerifyScreen />} />
        <Route path="/set-password" element={<SetPasswordScreen />} />
        <Route path="/sso" element={<SSOEmailScreen />} />
        <Route path="/lumon-login" element={<LumonLoginScreen />} />
        <Route path="/sso-loading" element={<SSOLoadingScreen />} />
        <Route path="/profile-review" element={<ProfileReviewScreen />} />
        <Route path="/calendar-sync" element={<CalendarSyncScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/meeting" element={<MeetingScreen />} />
        <Route path="/enterprise-home" element={<EnterpriseHomeScreen />} />
        <Route path="/enterprise-meeting" element={<EnterpriseMeetingScreen />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <MobileGate>
      <ProfileProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </ProfileProvider>
    </MobileGate>
  )
}
