import React from 'react'
import { RecruiterProfilePage } from './recruiter/RecruiterProfilePage'
import Profile from './artist/Profile'
import { useTranslation } from '@/i18n'

const ProfileIndex: React.FC = () => {
  const { t } = useTranslation()
  // Read role from stored user payload (set by authService) or fallback to direct 'role' key
  const storedUser = localStorage.getItem('user')
  const directRole = localStorage.getItem('role')
  const rawRole = (() => {
    try {
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        if (parsed && parsed.role) return String(parsed.role)
      }
    } catch {
      // ignore JSON parse errors
    }
    return directRole ?? ''
  })()
  // Normalize to lowercase to handle backend uppercase roles (e.g., 'ARTIST', 'RECRUITER')
  const role = rawRole.toLowerCase()

  switch (role) {
    case 'artist':
      return <Profile />
    case 'recruiter':
      return <RecruiterProfilePage />
    default:
      return (
        <div className='text-center p-6'>
          {t('profileIndex.noProfileForRole')}
        </div>
      )
  }
}

export default ProfileIndex