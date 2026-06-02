import React from 'react'
import { Navigate } from 'react-router-dom'
import ArtistDashboard from './artist/ArtistDashboard'
import { RecruiterDashboard } from './recruiter/RecruiterDashboard'
import { UserRole } from '@/types/types'

const DashboardIndex = () => {
  // Read role from stored user payload first, fall back to direct 'role' key.
  // Backend may emit either casing — normalize to uppercase to match UserRole enum.
  const storedUser = localStorage.getItem('user')
  const directRole = localStorage.getItem('role')
  const rawRole = (() => {
    try {
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        if (parsed?.role) return String(parsed.role)
      }
    } catch {
      // ignore JSON parse errors
    }
    return directRole ?? ''
  })()
  const role = rawRole.toUpperCase()

  switch (role) {
    case UserRole.ADMIN:
      // Admin doesn't have artist/recruiter dashboard APIs — bounce to admin section
      return <Navigate to='/admin/dashboard' replace />
    case UserRole.ARTIST:
      return <ArtistDashboard />
    case UserRole.RECRUITER:
      return <RecruiterDashboard />
    default:
      return (
        <div className='text-center p-6 text-gray-600'>
          No dashboard available for your role.
        </div>
      )
  }
}

export default DashboardIndex
