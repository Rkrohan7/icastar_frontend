import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { UserRole } from '@/types/types'
import authService from '@/services/userService'

const DashLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState<string>('dashboard')
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true)
  const navigate = useNavigate()

  // Example dummy data for header props
  const recruiterData = { name: 'John Doe', role: 'Admin' }
  const [notifications, setNotifications] = useState<string[]>(['Welcome!'])

  // Check if artist has completed onboarding.
  // Most loads hit a localStorage cache so we don't re-call /auth/me on every
  // dashboard navigation. We only network-call when the flag is missing.
  useEffect(() => {
    const checkOnboarding = async () => {
      const role = localStorage.getItem('role') as UserRole

      if (role !== UserRole.ARTIST) {
        setIsCheckingOnboarding(false)
        return
      }

      // Only the 'true' flag is trusted from localStorage. A stale 'false'
      // (written before onboarding finished) would otherwise trap the user in
      // a permanent redirect to /onboarding, so that case re-checks the server.
      const cached = localStorage.getItem('isOnboardingComplete')
      if (cached === 'true') {
        setIsCheckingOnboarding(false)
        return
      }

      // No cached flag — fall back to API (cached in userService, so only fires once per minute)
      try {
        const user = await authService.getMe()
        const isOnboardingComplete = user?.isOnboardingComplete === true
        localStorage.setItem('isOnboardingComplete', String(isOnboardingComplete))
        if (!isOnboardingComplete) {
          navigate('/onboarding', { replace: true })
          return
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
        localStorage.setItem('isOnboardingComplete', 'false')
        navigate('/onboarding', { replace: true })
        return
      }

      setIsCheckingOnboarding(false)
    }

    checkOnboarding()
  }, [navigate])

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Show loading state while checking onboarding
  if (isCheckingOnboarding) {
    return (
      <div className="flex h-screen items-center justify-center bg-base-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-base-bg font-sans">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={handleToggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          recruiter={recruiterData}
          setActivePage={setActivePage}
          notifications={notifications}
          setNotifications={setNotifications}
          onMenuClick={handleToggleSidebar}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-base-bg p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashLayout
