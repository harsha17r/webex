import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { ProfileProvider } from './context/ProfileContext'
import { WelcomeScreen } from './screens/onboarding/WelcomeScreen'
import { VerifyScreen } from './screens/onboarding/VerifyScreen'
import { SetPasswordScreen } from './screens/onboarding/SetPasswordScreen'
import { HomeScreen } from './screens/home/HomeScreen'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/verify" element={<VerifyScreen />} />
        <Route path="/set-password" element={<SetPasswordScreen />} />
        <Route path="/home" element={<HomeScreen />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ProfileProvider>
  )
}
