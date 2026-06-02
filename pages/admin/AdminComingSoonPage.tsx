import React from 'react'
import { useLocation } from 'react-router-dom'
import { ClockIcon } from '../../components/icons/IconComponents'

interface AdminComingSoonPageProps {
  title?: string
  description?: string
}

export const AdminComingSoonPage: React.FC<AdminComingSoonPageProps> = ({ title, description }) => {
  const location = useLocation()
  const pathLabel = location.pathname.replace('/admin/', '').replace(/\//g, ' › ')
  const resolvedTitle = title || pathLabel || 'This section'

  return (
    <div className='p-6'>
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center text-center'>
        <div className='h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center mb-4'>
          <ClockIcon className='h-8 w-8 text-[#E36A3A]' />
        </div>
        <h2 className='text-xl font-bold text-gray-900 mb-2 capitalize'>
          {resolvedTitle}
        </h2>
        <p className='text-sm text-gray-500 max-w-md mb-1'>
          {description ||
            'Backend API for this section is not available yet. The menu link works so the navigation flow can be reviewed.'}
        </p>
        <p className='text-xs text-gray-400 mt-2'>
          Route: <code className='bg-gray-100 px-1.5 py-0.5 rounded'>{location.pathname}</code>
        </p>
      </div>
    </div>
  )
}

export default AdminComingSoonPage
