import React, { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import auditionService from '@/services/auditionService'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import usePageParam from '@/hooks/usePageParam'

interface AuditionData {
  id: number
  title: string
  description: string
  projectTitle?: string
  projectType: string
  roleType: string
  characterName?: string
  characterDescription?: string
  auditionFormat: string
  auditionLocation?: string
  auditionDate?: string
  applicationDeadline?: string
  status: string
  compensationType?: string
  compensationDetails?: string
  skillsRequired?: string[]
  ageRangeMin?: number
  ageRangeMax?: number
  genderPreference?: string
  isUrgent?: boolean
  isFeatured?: boolean
  recruiterName?: string
  productionCompany?: string
  director?: string
  castingDirector?: string
  // Legacy fields for backward compatibility
  type?: string
  scheduledAt?: string
  durationMinutes?: number
  meetingLink?: string
  instructions?: string
  feedback?: string
  rating?: number
  job?: {
    jobId: number
    jobTitle: string
    company: string
    location: string
  }
  recruiter?: {
    id: number
    companyName: string
  }
}

const getIconForFormat = (format: string): string => {
  switch (format) {
    case 'VIRTUAL':
      return 'Video'
    case 'IN_PERSON':
      return 'MapPin'
    case 'SELF_TAPE':
      return 'Camera'
    default:
      return 'Calendar'
  }
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'TBD'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getProjectTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'FEATURE_FILM': 'Feature Film',
    'TV_SERIES': 'TV Series',
    'COMMERCIAL': 'Commercial',
    'THEATER': 'Theater',
    'WEB_SERIES': 'Web Series',
    'SHORT_FILM': 'Short Film',
    'MUSIC_VIDEO': 'Music Video',
  }
  return labels[type] || type
}

const getRoleTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'LEAD': 'Lead Role',
    'SUPPORTING': 'Supporting',
    'BACKGROUND': 'Background',
    'EXTRA': 'Extra',
  }
  return labels[type] || type
}

const AuditionItem: React.FC<{
  audition: AuditionData
  onCancel: (id: number) => void
  onViewDetails: (audition: AuditionData) => void
}> = ({ audition, onCancel, onViewDetails }) => {
  const icon = getIconForFormat(audition.auditionFormat || audition.type || 'VIRTUAL')
  const title = audition.title || audition.job?.jobTitle || 'Audition'
  const location = audition.auditionLocation || audition.job?.location || 'Location TBD'
  const company = audition.productionCompany || audition.job?.company || audition.recruiter?.companyName || 'Production Company'
  const deadline = formatDate(audition.applicationDeadline || '')
  const auditionDate = formatDate(audition.auditionDate || audition.scheduledAt || '')

  const handleViewDetails = () => {
    onViewDetails(audition)
  }

  const handleApply = () => {
    // For now, show the details modal
    // TODO: Implement apply functionality
    onViewDetails(audition)
  }

  const getStatusBadge = () => {
    switch (audition.status) {
      case 'OPEN':
        return <span className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold'>Open</span>
      case 'CLOSED':
        return <span className='px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold'>Closed</span>
      case 'CANCELLED':
        return <span className='px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold'>Cancelled</span>
      case 'DRAFT':
        return <span className='px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold'>Draft</span>
      case 'SCHEDULED':
        return <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold'>Scheduled</span>
      case 'COMPLETED':
        return <span className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold'>Completed</span>
      case 'IN_PROGRESS':
        return <span className='px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold'>In Progress</span>
      default:
        return null
    }
  }

  return (
    <li className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden'>
      <div className='flex flex-col md:flex-row'>
        {/* Left Section - Icon and Basic Info */}
        <div className='flex items-start gap-4 p-6 flex-1'>
          <div className='bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm'>
            <Icon name={icon as any} size={32} />
          </div>

          <div className='flex-1 min-w-0'>
            {/* Title and Badges */}
            <div className='flex items-start gap-2 mb-2 flex-wrap'>
              <h3 className='font-bold text-xl text-gray-900 flex-1'>{title}</h3>
              {getStatusBadge()}
              {audition.isUrgent && (
                <span className='px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1'>
                  <Icon name='AlertCircle' size={12} />
                  Urgent
                </span>
              )}
              {audition.isFeatured && (
                <span className='px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold flex items-center gap-1'>
                  <Icon name='Star' size={12} />
                  Featured
                </span>
              )}
            </div>

            {/* Project and Role Info */}
            <div className='space-y-1 mb-3'>
              {audition.projectTitle && (
                <p className='text-sm text-gray-700 font-medium'>
                  <Icon name='Film' size={14} className='inline mr-1' />
                  {audition.projectTitle}
                </p>
              )}
              <p className='text-sm text-gray-600'>{company}</p>
              <div className='flex flex-wrap gap-2 items-center text-xs text-gray-500'>
                <span className='px-2 py-1 bg-gray-100 rounded-md font-medium'>
                  {getProjectTypeLabel(audition.projectType)}
                </span>
                <span className='px-2 py-1 bg-gray-100 rounded-md font-medium'>
                  {getRoleTypeLabel(audition.roleType)}
                </span>
                {audition.characterName && (
                  <span className='px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium'>
                    Character: {audition.characterName}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {audition.description && (
              <p className='text-sm text-gray-600 line-clamp-2 mb-3'>
                {audition.description}
              </p>
            )}

            {/* Requirements */}
            <div className='flex flex-wrap gap-3 text-xs text-gray-600'>
              {audition.ageRangeMin && audition.ageRangeMax && (
                <span className='flex items-center gap-1'>
                  <Icon name='Users' size={12} />
                  Age: {audition.ageRangeMin}-{audition.ageRangeMax}
                </span>
              )}
              {audition.genderPreference && audition.genderPreference !== 'ANY' && (
                <span className='flex items-center gap-1'>
                  <Icon name='User' size={12} />
                  {audition.genderPreference}
                </span>
              )}
              {audition.compensationType && (
                <span className='flex items-center gap-1'>
                  <Icon name='DollarSign' size={12} />
                  {audition.compensationType}
                </span>
              )}
            </div>

            {/* Skills Required */}
            {audition.skillsRequired && audition.skillsRequired.length > 0 && (
              <div className='mt-3 flex flex-wrap gap-1'>
                {audition.skillsRequired.slice(0, 4).map((skill, idx) => (
                  <span key={idx} className='px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium'>
                    {skill}
                  </span>
                ))}
                {audition.skillsRequired.length > 4 && (
                  <span className='px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs'>
                    +{audition.skillsRequired.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Dates and Actions */}
        <div className='bg-gray-50 p-6 md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200'>
          <div className='space-y-3'>
            {/* Location */}
            <div className='flex items-start gap-2'>
              <Icon name='MapPin' size={16} className='text-gray-400 mt-0.5' />
              <div>
                <p className='text-xs text-gray-500 uppercase font-semibold'>Location</p>
                <p className='text-sm text-gray-700 font-medium'>{location}</p>
              </div>
            </div>

            {/* Audition Date */}
            {auditionDate && auditionDate !== 'TBD' && (
              <div className='flex items-start gap-2'>
                <Icon name='Calendar' size={16} className='text-gray-400 mt-0.5' />
                <div>
                  <p className='text-xs text-gray-500 uppercase font-semibold'>Audition Date</p>
                  <p className='text-sm text-gray-700 font-medium'>{auditionDate}</p>
                </div>
              </div>
            )}

            {/* Application Deadline */}
            {deadline && deadline !== 'TBD' && (
              <div className='flex items-start gap-2'>
                <Icon name='Clock' size={16} className='text-amber-500 mt-0.5' />
                <div>
                  <p className='text-xs text-gray-500 uppercase font-semibold'>Apply By</p>
                  <p className='text-sm text-amber-700 font-bold'>{deadline}</p>
                </div>
              </div>
            )}

            {/* Director/Casting Director */}
            {(audition.director || audition.castingDirector) && (
              <div className='flex items-start gap-2'>
                <Icon name='User' size={16} className='text-gray-400 mt-0.5' />
                <div>
                  {audition.director && (
                    <p className='text-xs text-gray-600'>
                      <span className='font-semibold'>Director:</span> {audition.director}
                    </p>
                  )}
                  {audition.castingDirector && (
                    <p className='text-xs text-gray-600'>
                      <span className='font-semibold'>Casting:</span> {audition.castingDirector}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className='mt-4'>
            <button
              onClick={handleViewDetails}
              className='w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200'>
              View Details
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}

const Auditions: React.FC = () => {
  const [view, setView] = useState<'list' | 'map'>('list')
  const [auditions, setAuditions] = useState<AuditionData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'open'>('open')
  const [page, setPage] = usePageParam('page', 0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedAudition, setSelectedAudition] = useState<AuditionData | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const fetchAuditions = async () => {
    try {
      setLoading(true)
      let response

      if (filter === 'open') {
        // Open auditions - role-based filtering done by backend
        response = await auditionService.getOpenAuditions(page, 20)
        console.log('[Auditions] Open auditions - full response:', response)
        console.log('[Auditions] Open auditions - data array:', response?.data)
        console.log('[Auditions] Open auditions - count:', response?.data?.length)
        setAuditions(Array.isArray(response.data) ? response.data : [])
        setTotalPages(response.totalPages || 0)
      } else if (filter === 'upcoming') {
        const data = await auditionService.getUpcomingAuditions()
        console.log('[Auditions] Upcoming auditions - raw response:', data)
        console.log('[Auditions] Upcoming auditions - count:', data?.length)
        setAuditions(Array.isArray(data) ? data : [])
        setTotalPages(0)
      } else if (filter === 'past') {
        response = await auditionService.getPastAuditions(page, 20)
        console.log('[Auditions] Past auditions - full response:', response)
        console.log('[Auditions] Past auditions - data array:', response?.data)
        console.log('[Auditions] Past auditions - count:', response?.data?.length)
        setAuditions(Array.isArray(response.data) ? response.data : [])
        setTotalPages(response.totalPages || 0)
      } else {
        response = await auditionService.getMyAuditions({ page, size: 20 })
        console.log('[Auditions] All auditions - full response:', response)
        console.log('[Auditions] All auditions - data array:', response?.data)
        console.log('[Auditions] All auditions - count:', response?.data?.length)
        setAuditions(Array.isArray(response.data) ? response.data : [])
        setTotalPages(response.totalPages || 0)
      }
    } catch (error: any) {
      console.error('[Auditions] Failed to fetch auditions:', error)
      console.error('[Auditions] Error details:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to load auditions')
      setAuditions([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditions()
  }, [filter, page])

  const handleCancelAudition = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this audition?')) {
      return
    }

    try {
      await auditionService.cancelMyAudition(id)
      toast.success('Audition cancelled successfully')
      fetchAuditions() // Refresh the list
    } catch (error: any) {
      console.error('Failed to cancel audition:', error)
      toast.error('Failed to cancel audition')
    }
  }

  const handleViewDetails = (audition: AuditionData) => {
    setSelectedAudition(audition)
    setIsDetailsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedAudition(null)
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-4xl font-bold'>My Auditions</h1>
          <p className='text-gray-600'>Your scheduled auditions and interviews.</p>
        </div>
        <div className='flex items-center gap-2'>
          {/* Filter Buttons */}
          <div className='flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm mr-2'>
            <button
              onClick={() => {
                setFilter('open')
                setPage(0)
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === 'open'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-gray-600 hover:bg-amber-50'
              }`}>
              Open Auditions
            </button>
            <button
              onClick={() => {
                setFilter('upcoming')
                setPage(0)
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === 'upcoming'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-gray-600 hover:bg-amber-50'
              }`}>
              Upcoming
            </button>
            <button
              onClick={() => {
                setFilter('past')
                setPage(0)
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === 'past' ? 'bg-amber-600 text-white shadow' : 'text-gray-600 hover:bg-amber-50'
              }`}>
              Past
            </button>
            <button
              onClick={() => {
                setFilter('all')
                setPage(0)
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === 'all' ? 'bg-amber-600 text-white shadow' : 'text-gray-600 hover:bg-amber-50'
              }`}>
              All
            </button>
          </div>

          {/* View Toggle */}
          <div className='flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm'>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                view === 'list'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-gray-600 hover:bg-amber-50'
              }`}>
              <Icon name='List' size={20} className='inline mr-2' />
              List
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                view === 'map' ? 'bg-amber-600 text-white shadow' : 'text-gray-600 hover:bg-amber-50'
              }`}>
              <Icon name='Map' size={20} className='inline mr-2' />
              Map
            </button>
          </div>
        </div>
      </div>

      {view === 'list' ? (
        <>
          {loading ? (
            <div className='bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto'></div>
                <p className='text-gray-600 mt-4'>Loading auditions...</p>
              </div>
            </div>
          ) : auditions.length === 0 ? (
            <div className='bg-white rounded-2xl shadow-lg p-12 flex items-center justify-center min-h-[400px]'>
              <div className='text-center max-w-md'>
                <div className='bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Icon name='Search' size={40} className='text-amber-600' />
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-2'>No Auditions Found</h3>
                <p className='text-gray-600 mb-4'>
                  {filter === 'open'
                    ? 'No open auditions available for your role at the moment. New opportunities are posted regularly, so check back soon!'
                    : filter === 'upcoming'
                    ? 'You have no upcoming auditions scheduled. Browse open auditions to apply for new opportunities.'
                    : filter === 'past'
                    ? 'You have no past auditions. Your audition history will appear here once you start applying.'
                    : 'You have no auditions yet. Start exploring open auditions to find your next opportunity!'}
                </p>
                {filter !== 'open' && (
                  <button
                    onClick={() => {
                      setFilter('open')
                      setPage(0)
                    }}
                    className='px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200'>
                    Browse Open Auditions
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <ul className='space-y-4'>
                {auditions.map((audition) => (
                  <AuditionItem
                    key={audition.id}
                    audition={audition}
                    onCancel={handleCancelAudition}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </ul>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex justify-center gap-2 mt-6'>
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className='px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50'>
                    Previous
                  </button>
                  <span className='px-4 py-2 bg-white rounded-lg shadow'>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className='px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50'>
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className='bg-white rounded-2xl shadow-lg p-6 h-[60vh] flex items-center justify-center text-center'>
          <div>
            <img
              src='https://i.imgur.com/gX3A1v3.png'
              alt='Map placeholder'
              className='rounded-xl'
            />
            <h3 className='text-xl font-bold mt-4 text-gray-700'>Map View is Coming Soon!</h3>
            <p className='text-gray-500'>Visually explore auditions near you.</p>
          </div>
        </div>
      )}

      {/* Audition Details Modal */}
      {isDetailsModalOpen && selectedAudition && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4' onClick={handleCloseModal}>
          <div className='bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl' onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className='sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10'>
              <div className='flex-1'>
                <h2 className='text-2xl font-bold text-gray-900'>{selectedAudition.title}</h2>
                <p className='text-sm text-gray-600 mt-1'>{selectedAudition.productionCompany || 'Production Company'}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className='ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors'>
                <Icon name='X' size={24} className='text-gray-500' />
              </button>
            </div>

            {/* Modal Body */}
            <div className='p-6 space-y-6'>
              {/* Project Information */}
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                  <Icon name='Film' size={20} className='text-amber-600' />
                  Project Information
                </h3>
                <div className='bg-gray-50 rounded-xl p-4 space-y-2'>
                  {selectedAudition.projectTitle && (
                    <div className='flex justify-between'>
                      <span className='text-sm font-medium text-gray-600'>Project Title:</span>
                      <span className='text-sm text-gray-900'>{selectedAudition.projectTitle}</span>
                    </div>
                  )}
                  <div className='flex justify-between'>
                    <span className='text-sm font-medium text-gray-600'>Project Type:</span>
                    <span className='text-sm text-gray-900'>{getProjectTypeLabel(selectedAudition.projectType)}</span>
                  </div>
                  {selectedAudition.director && (
                    <div className='flex justify-between'>
                      <span className='text-sm font-medium text-gray-600'>Director:</span>
                      <span className='text-sm text-gray-900'>{selectedAudition.director}</span>
                    </div>
                  )}
                  {selectedAudition.castingDirector && (
                    <div className='flex justify-between'>
                      <span className='text-sm font-medium text-gray-600'>Casting Director:</span>
                      <span className='text-sm text-gray-900'>{selectedAudition.castingDirector}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Role Details */}
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                  <Icon name='User' size={20} className='text-amber-600' />
                  Role Details
                </h3>
                <div className='bg-gray-50 rounded-xl p-4 space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm font-medium text-gray-600'>Role Type:</span>
                    <span className='text-sm text-gray-900'>{getRoleTypeLabel(selectedAudition.roleType)}</span>
                  </div>
                  {selectedAudition.characterName && (
                    <div className='flex justify-between'>
                      <span className='text-sm font-medium text-gray-600'>Character Name:</span>
                      <span className='text-sm text-gray-900'>{selectedAudition.characterName}</span>
                    </div>
                  )}
                  {selectedAudition.characterDescription && (
                    <div>
                      <span className='text-sm font-medium text-gray-600 block mb-1'>Character Description:</span>
                      <p className='text-sm text-gray-900'>{selectedAudition.characterDescription}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedAudition.description && (
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-3'>Description</h3>
                  <p className='text-sm text-gray-700 leading-relaxed'>{selectedAudition.description}</p>
                </div>
              )}

              {/* Requirements */}
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                  <Icon name='CheckCircle' size={20} className='text-amber-600' />
                  Requirements
                </h3>
                <div className='bg-gray-50 rounded-xl p-4 space-y-2'>
                  {selectedAudition.ageRangeMin && selectedAudition.ageRangeMax && (
                    <div className='flex justify-between'>
                      <span className='text-sm font-medium text-gray-600'>Age Range:</span>
                      <span className='text-sm text-gray-900'>{selectedAudition.ageRangeMin} - {selectedAudition.ageRangeMax} years</span>
                    </div>
                  )}
                  {selectedAudition.genderPreference && (
                    <div className='flex justify-between'>
                      <span className='text-sm font-medium text-gray-600'>Gender:</span>
                      <span className='text-sm text-gray-900'>{selectedAudition.genderPreference}</span>
                    </div>
                  )}
                  {selectedAudition.skillsRequired && selectedAudition.skillsRequired.length > 0 && (
                    <div>
                      <span className='text-sm font-medium text-gray-600 block mb-2'>Skills Required:</span>
                      <div className='flex flex-wrap gap-2'>
                        {selectedAudition.skillsRequired.map((skill, idx) => (
                          <span key={idx} className='px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium'>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Audition Details */}
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                  <Icon name='Calendar' size={20} className='text-amber-600' />
                  Audition Details
                </h3>
                <div className='bg-gray-50 rounded-xl p-4 space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm font-medium text-gray-600'>Format:</span>
                    <span className='text-sm text-gray-900'>{selectedAudition.auditionFormat}</span>
                  </div>
                  {selectedAudition.auditionLocation && (
                    <div className='flex justify-between'>
                      <span className='text-sm font-medium text-gray-600'>Location:</span>
                      <span className='text-sm text-gray-900'>{selectedAudition.auditionLocation}</span>
                    </div>
                  )}
                  {selectedAudition.auditionDate && (
                    <div className='flex justify-between'>
                      <span className='text-sm font-medium text-gray-600'>Audition Date:</span>
                      <span className='text-sm text-gray-900'>{formatDate(selectedAudition.auditionDate)}</span>
                    </div>
                  )}
                  {selectedAudition.applicationDeadline && (
                    <div className='flex justify-between'>
                      <span className='text-sm font-medium text-gray-600'>Application Deadline:</span>
                      <span className='text-sm text-amber-700 font-semibold'>{formatDate(selectedAudition.applicationDeadline)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Compensation */}
              {selectedAudition.compensationType && (
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                    <Icon name='DollarSign' size={20} className='text-amber-600' />
                    Compensation
                  </h3>
                  <div className='bg-gray-50 rounded-xl p-4 space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-sm font-medium text-gray-600'>Type:</span>
                      <span className='text-sm text-gray-900'>{selectedAudition.compensationType}</span>
                    </div>
                    {selectedAudition.compensationDetails && (
                      <div>
                        <span className='text-sm font-medium text-gray-600 block mb-1'>Details:</span>
                        <p className='text-sm text-gray-900'>{selectedAudition.compensationDetails}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className='sticky bottom-0 bg-white border-t border-gray-200 p-6'>
              <button
                onClick={handleCloseModal}
                className='w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200'>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Auditions
