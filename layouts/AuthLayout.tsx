import React from 'react'
import { Outlet } from 'react-router-dom'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const AuthLayout: React.FC = () => {
  return (
    <div>
      <Outlet />
      {/* Auth and public pages have no shared header, so the language toggle floats */}
      <LanguageSwitcher compactOnMobile className='fixed bottom-4 right-4 z-50 shadow-md' />
    </div>
  )
}

export default AuthLayout
