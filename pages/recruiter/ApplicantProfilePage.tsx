import React, { useEffect, useState } from 'react'
import { Card } from '../../components/Card'
import { Applicant, Page } from '../../types'
import {
  MailIcon,
  PhoneIcon,
  LinkIcon,
  CalendarIcon,
  XCircleIcon,
  CheckCircleIcon,
} from '../../components/icons/IconComponents'
import { useLocation, useNavigate } from 'react-router-dom'
import { recruiterApplicantsService } from '../../services/recruiterApplicantsService'
import { toast } from 'react-toastify'
import { useTranslation } from '@/i18n'

// Interview type values are sent to the backend as-is; these keys give their display labels.
const INTERVIEW_TYPE_KEYS: Record<string, string> = {
  'Video Call': 'applicantProfile.interviewTypes.videoCall',
  'Phone Call': 'applicantProfile.interviewTypes.phoneCall',
  'In Person': 'applicantProfile.interviewTypes.inPerson',
}

const StatusBadge: React.FC<{ status: Applicant['status'] }> = ({ status }) => {
  const { tEnum } = useTranslation()
  const baseClasses =
    'px-2.5 py-1 text-xs font-semibold rounded-full inline-block'
  const statusClasses = {
    New: 'bg-blue-100 text-blue-800',
    Viewed: 'bg-amber-100 text-amber-800',
    Interviewing: 'bg-yellow-100 text-yellow-800',
    Hired: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`${baseClasses} ${statusClasses[status]}`}>{tEnum(status)}</span>
  )
}

interface ScheduleInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { interviewDate: string; interviewTime: string; interviewType: string; meetingLink: string; notes: string }) => void
  applicantName: string
  isLoading: boolean
}

const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  applicantName,
  isLoading,
}) => {
  const { t } = useTranslation()
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewTime, setInterviewTime] = useState('')
  const [interviewType, setInterviewType] = useState('Video Call')
  const [meetingLink, setMeetingLink] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ interviewDate, interviewTime, interviewType, meetingLink, notes })
  }

  const today = new Date().toISOString().split('T')[0]

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' onClick={onClose} />
        <div className='inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6'>
          <div className='mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>{t('applicantProfile.scheduleModal.title')}</h3>
            <p className='text-sm text-gray-500 mt-1'>{t('applicantProfile.scheduleModal.subtitle', { name: applicantName })}</p>
          </div>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>{t('applicantProfile.scheduleModal.date')}</label>
              <input
                type='date'
                required
                min={today}
                value={interviewDate}
                onChange={e => setInterviewDate(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>{t('applicantProfile.scheduleModal.time')}</label>
              <input
                type='time'
                required
                value={interviewTime}
                onChange={e => setInterviewTime(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>{t('applicantProfile.scheduleModal.type')}</label>
              <select
                value={interviewType}
                onChange={e => setInterviewType(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
              >
                <option value='Video Call'>{t('applicantProfile.interviewTypes.videoCall')}</option>
                <option value='Phone Call'>{t('applicantProfile.interviewTypes.phoneCall')}</option>
                <option value='In Person'>{t('applicantProfile.interviewTypes.inPerson')}</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>{t('applicantProfile.scheduleModal.meetingLink')}</label>
              <input
                type='url'
                value={meetingLink}
                onChange={e => setMeetingLink(e.target.value)}
                placeholder='https://meet.google.com/abc-def-ghi'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>{t('applicantProfile.scheduleModal.notes')}</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder={t('applicantProfile.scheduleModal.notesPlaceholder')}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
              />
            </div>
            <div className='flex gap-3 pt-4'>
              <button
                type='button'
                onClick={onClose}
                disabled={isLoading}
                className='flex-1 px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
              >
                {t('common.actions.cancel')}
              </button>
              <button
                type='submit'
                disabled={isLoading || !interviewDate || !interviewTime}
                className='flex-1 px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? t('applicantProfile.scheduleModal.scheduling') : t('applicantProfile.scheduleModal.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

interface HireModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { salary: string; contractUrl: string; notes: string }) => void
  applicantName: string
  isLoading: boolean
}

const HireModal: React.FC<HireModalProps> = ({ isOpen, onClose, onSubmit, applicantName, isLoading }) => {
  const { t } = useTranslation()
  const [salary, setSalary] = useState('')
  const [contractUrl, setContractUrl] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ salary, contractUrl, notes })
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' onClick={onClose} />
        <div className='inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6'>
          <div className='mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>{t('applicantProfile.hireModal.title', { name: applicantName })}</h3>
            <p className='text-sm text-gray-500 mt-1'>{t('applicantProfile.hireModal.subtitle')}</p>
          </div>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>{t('applicantProfile.hireModal.salary')}</label>
              <input
                type='text'
                value={salary}
                onChange={e => setSalary(e.target.value)}
                placeholder={t('applicantProfile.hireModal.salaryPlaceholder')}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>{t('applicantProfile.hireModal.contractUrl')}</label>
              <input
                type='url'
                value={contractUrl}
                onChange={e => setContractUrl(e.target.value)}
                placeholder='https://example.com/contract.pdf'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>{t('applicantProfile.hireModal.notes')}</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder={t('applicantProfile.hireModal.notesPlaceholder')}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
              />
            </div>
            <div className='flex gap-3 pt-4'>
              <button
                type='button'
                onClick={onClose}
                disabled={isLoading}
                className='flex-1 px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              >
                {t('common.actions.cancel')}
              </button>
              <button
                type='submit'
                disabled={isLoading}
                className='flex-1 px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? t('applicantProfile.hireModal.hiring') : t('applicantProfile.hireModal.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

interface RejectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
  applicantName: string
  isLoading: boolean
}

const RejectModal: React.FC<RejectModalProps> = ({ isOpen, onClose, onSubmit, applicantName, isLoading }) => {
  const { t } = useTranslation()
  const [rejectionReason, setRejectionReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(rejectionReason)
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' onClick={onClose} />
        <div className='inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6'>
          <div className='mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>{t('applicantProfile.rejectModal.title', { name: applicantName })}</h3>
            <p className='text-sm text-gray-500 mt-1'>{t('applicantProfile.rejectModal.subtitle')}</p>
          </div>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>{t('applicantProfile.rejectModal.reason')}</label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={3}
                placeholder={t('applicantProfile.rejectModal.reasonPlaceholder')}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
              />
            </div>
            <div className='flex gap-3 pt-4'>
              <button
                type='button'
                onClick={onClose}
                disabled={isLoading}
                className='flex-1 px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
              >
                {t('common.actions.cancel')}
              </button>
              <button
                type='submit'
                disabled={isLoading}
                className='flex-1 px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? t('applicantProfile.rejectModal.rejecting') : t('applicantProfile.rejectModal.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export const ApplicantProfilePage = () => {
  const { t, tEnum } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [applicant, setApplicant] = useState(location.state?.applicant)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [showHireModal, setShowHireModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock interview data - replace with API fetch later
  const [interviewData, setInterviewData] = useState<{
    date?: string
    time?: string
    type?: string
    status?: 'SCHEDULED' | 'COMPLETED'
  } | null>(null)

  useEffect(() => {
    if (location.state?.applicant) {
      setApplicant(location.state.applicant)
    }
  }, [location.state])

  const handleScheduleInterview = async (data: {
    interviewDate: string
    interviewTime: string
    interviewType: string
    meetingLink: string
    notes: string
  }) => {
    setIsScheduling(true)
    try {
      const interviewDateTime = `${data.interviewDate}T${data.interviewTime}:00`
      await recruiterApplicantsService.scheduleInterview({
        applicationId: applicant.id,
        interviewDateTime,
        interviewType: data.interviewType,
        meetingLink: data.meetingLink,
        notes: data.notes,
      })

      // Update local state
      setApplicant({ ...applicant, status: 'Interviewing' })
      setInterviewData({
        date: data.interviewDate,
        time: data.interviewTime,
        type: data.interviewType,
        status: 'SCHEDULED',
      })
      setShowInterviewModal(false)
      toast.success(t('applicantProfile.toast.interviewScheduled'))
    } catch (error: any) {
      console.error('Failed to schedule interview:', error)
      const errorMessage = error.response?.data?.message || t('applicantProfile.toast.interviewFailed')
      toast.error(errorMessage)
    } finally {
      setIsScheduling(false)
    }
  }

  const handleHire = async (data: { salary: string; contractUrl: string; notes: string }) => {
    setIsProcessing(true)
    try {
      await recruiterApplicantsService.submitInterviewResult({
        applicationId: applicant.id,
        result: 'HIRED',
        offerDetails: {
          salary: data.salary || undefined,
          contractUrl: data.contractUrl || undefined,
        },
        notes: data.notes || undefined,
      })

      // Update local state
      setApplicant({ ...applicant, status: 'Hired' })
      setShowHireModal(false)
      toast.success(t('applicantProfile.toast.hired', { name: applicant.name }))
    } catch (error: any) {
      console.error('Failed to hire applicant:', error)
      const errorMessage = error.response?.data?.message || t('applicantProfile.toast.hireFailed')
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (rejectionReason: string) => {
    setIsProcessing(true)
    try {
      await recruiterApplicantsService.submitInterviewResult({
        applicationId: applicant.id,
        result: 'REJECTED',
        rejectionReason: rejectionReason || undefined,
      })

      // Update local state
      setApplicant({ ...applicant, status: 'Rejected' })
      setShowRejectModal(false)
      toast.success(t('applicantProfile.toast.rejected', { name: applicant.name }))
    } catch (error: any) {
      console.error('Failed to reject applicant:', error)
      const errorMessage = error.response?.data?.message || t('applicantProfile.toast.rejectFailed')
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateApplicantStatus = (
    applicantId: number,
    status: Applicant['status'],
  ) => {
    if (status === 'Interviewing') {
      setShowInterviewModal(true)
    } else if (status === 'Hired') {
      setShowHireModal(true)
    } else if (status === 'Rejected') {
      setShowRejectModal(true)
    } else {
      setApplicant({ ...applicant, status })
    }
  }

  if (!applicant) {
    return (
      <div className='text-center py-16'>
        <h3 className='text-lg font-medium text-gray-900'>
          {t('applicantProfile.noApplicant.title')}
        </h3>
        <p className='mt-1 text-sm text-gray-500'>
          {t('applicantProfile.noApplicant.message')}
        </p>
        <button
          onClick={() => navigate(-1)}
          className='mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700'>
          {t('common.actions.goBack')}
        </button>
      </div>
    )
  }

  const Actions = () => {
    const baseButtonClasses =
      'w-full inline-flex justify-center items-center px-4 py-2.5 border text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2'
    const primaryButtonClasses = `${baseButtonClasses} border-transparent text-white bg-amber-600 hover:bg-amber-700 focus:ring-amber-500`
    const hireButtonClasses = `${baseButtonClasses} border-transparent text-white bg-green-600 hover:bg-green-700 focus:ring-green-500`
    const rejectButtonClasses = `${baseButtonClasses} border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`

    switch (applicant.status) {
      case 'New':
      case 'Viewed':
        return (
          <div className='space-y-3'>
            <button
              onClick={() =>
                handleUpdateApplicantStatus(applicant.id, 'Interviewing')
              }
              className={primaryButtonClasses}>
              <CalendarIcon className='mr-2 h-5 w-5' />
              {t('applicantProfile.actions.scheduleInterview')}
            </button>
            <button
              onClick={() => handleUpdateApplicantStatus(applicant.id, 'Hired')}
              className={hireButtonClasses}>
              <CheckCircleIcon className='mr-2 h-5 w-5' />
              {t('applicantProfile.actions.hireApplicant')}
            </button>
            <button
              onClick={() =>
                handleUpdateApplicantStatus(applicant.id, 'Rejected')
              }
              className={rejectButtonClasses}>
              <XCircleIcon className='mr-2 h-5 w-5' />
              {t('applicantProfile.actions.rejectApplicant')}
            </button>
          </div>
        )
      case 'Interviewing':
        return (
          <div className='space-y-3'>
            <button
              onClick={() => handleUpdateApplicantStatus(applicant.id, 'Hired')}
              className={hireButtonClasses}>
              <CheckCircleIcon className='mr-2 h-5 w-5' />
              {t('applicantProfile.actions.hireApplicant')}
            </button>
            <button
              onClick={() => handleUpdateApplicantStatus(applicant.id, 'Rejected')}
              className={rejectButtonClasses}>
              <XCircleIcon className='mr-2 h-5 w-5' />
              {t('applicantProfile.actions.rejectApplicant')}
            </button>
          </div>
        )
      default:
        return (
          <p className='text-sm text-gray-500 text-center py-4'>
            {t('applicantProfile.actions.noFurtherActions', { status: tEnum(applicant.status).toLowerCase() })}
          </p>
        )
    }
  }

  return (
    <div>
      <div className='flex items-center mb-6 gap-4'>
        <button
          onClick={() => navigate(-1)}
          className='text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors'
          aria-label={t('applicantProfile.backAria')}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M19 12H5' />
            <path d='m12 19-7-7 7-7' />
          </svg>
        </button>
        <h2 className='text-3xl font-bold text-gray-900'>{t('applicantProfile.title')}</h2>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2 space-y-8'>
          <Card>
            <div className='flex flex-col sm:flex-row items-start sm:space-x-6 space-y-4 sm:space-y-0'>
              <img
                className='h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover ring-4 ring-white'
                src={applicant.avatarUrl}
                alt={applicant.name}
              />
              <div className='flex-1'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h3 className='text-2xl font-bold text-gray-900'>
                      {applicant.name}
                    </h3>
                    <p className='text-md text-gray-600'>
                      {t('applicantProfile.applyingFor')}{' '}
                      <span className='font-semibold'>{applicant.job}</span>
                    </p>
                  </div>
                  <div className='flex-shrink-0 pt-1'>
                    <StatusBadge status={applicant.status} />
                  </div>
                </div>
                <div className='mt-3 text-sm text-gray-500 flex items-center'>
                  <CalendarIcon className='h-4 w-4 mr-2 text-gray-400' />
                  <span>{t('applicantProfile.appliedOn', { date: applicant.appliedDate })}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Interview Status Section */}
          {interviewData && (
            <Card>
              <h4 className='text-lg font-semibold text-gray-800 mb-4'>{t('applicantProfile.interviewDetails.title')}</h4>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>{t('applicantProfile.interviewDetails.dateTime')}</span>
                  <span className='text-sm font-medium text-gray-900'>
                    {new Date(`${interviewData.date}T${interviewData.time}`).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>{t('applicantProfile.interviewDetails.type')}</span>
                  <span className='text-sm font-medium text-gray-900'>
                    {interviewData.type && INTERVIEW_TYPE_KEYS[interviewData.type] ? t(INTERVIEW_TYPE_KEYS[interviewData.type]) : interviewData.type}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>{t('applicantProfile.interviewDetails.status')}</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    interviewData.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {interviewData.status === 'COMPLETED' ? tEnum('COMPLETED') : tEnum('SCHEDULED')}
                  </span>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <h4 className='text-lg font-semibold text-gray-800 mb-4'>
              {t('applicantProfile.about', { name: applicant.name.split(' ')[0] })}
            </h4>
            <p className='text-gray-600 leading-relaxed'>
              {applicant.bio || t('applicantProfile.noBio')}
            </p>
          </Card>

          <Card>
            <h4 className='text-lg font-semibold text-gray-800 mb-4'>{t('applicantProfile.skills')}</h4>
            <div className='flex flex-wrap gap-2'>
              {applicant.skills.map(skill => (
                <span
                  key={skill}
                  className='px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-800 rounded-lg'>
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        </div>

        <div className='lg:col-span-1 space-y-8'>
          <Card>
            <h4 className='text-lg font-semibold text-gray-800 mb-4'>
              {t('applicantProfile.actionsTitle')}
            </h4>
            <Actions />
          </Card>
          <Card>
            <h4 className='text-lg font-semibold text-gray-800 mb-4'>
              {t('applicantProfile.contactTitle')}
            </h4>
            <ul className='space-y-3 text-sm'>
              {applicant.email && (
                <li className='flex items-center'>
                  <MailIcon className='h-5 w-5 text-gray-400 mr-3' />
                  <a
                    href={`mailto:${applicant.email}`}
                    className='text-amber-600 hover:underline hover:text-amber-800'>
                    {applicant.email}
                  </a>
                </li>
              )}
              {applicant.phone && (
                <li className='flex items-center'>
                  <PhoneIcon className='h-5 w-5 text-gray-400 mr-3' />
                  <span className='text-gray-700'>{applicant.phone}</span>
                </li>
              )}
              {applicant.portfolioUrl && (
                <li className='flex items-center'>
                  <LinkIcon className='h-5 w-5 text-gray-400 mr-3' />
                  <a
                    href={applicant.portfolioUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-amber-600 hover:underline hover:text-amber-800 truncate'>
                    {applicant.portfolioUrl.replace('https://', '')}
                  </a>
                </li>
              )}
            </ul>
          </Card>
        </div>
      </div>

      <ScheduleInterviewModal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        onSubmit={handleScheduleInterview}
        applicantName={applicant.name}
        isLoading={isScheduling}
      />

      <HireModal
        isOpen={showHireModal}
        onClose={() => setShowHireModal(false)}
        onSubmit={handleHire}
        applicantName={applicant.name}
        isLoading={isProcessing}
      />

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onSubmit={handleReject}
        applicantName={applicant.name}
        isLoading={isProcessing}
      />
    </div>
  )
}
