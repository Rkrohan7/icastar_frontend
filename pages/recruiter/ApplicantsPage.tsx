import React, { useState, useEffect } from 'react'
import { Card } from '../../components/Card'
import { Applicant, Job, Page } from '../../types'
import { UsersIcon } from '../../components/icons/IconComponents'
import { useLocation, useNavigate } from 'react-router-dom'
import { recruiterApplicantsService } from '../../services/recruiterApplicantsService'
import { toast } from 'react-toastify'
import { useTranslation } from '@/i18n'
const StatusBadge: React.FC<{ status: Applicant['status'] }> = ({ status }) => {
  const { tEnum } = useTranslation()
  const baseClasses =
    'px-2.5 py-1 text-xs font-semibold rounded-full inline-block'
  const statusClasses = {
    New: 'bg-blue-100 text-blue-800',
    Viewed: 'bg-primary-light text-primary',
    Interviewing: 'bg-yellow-100 text-yellow-800',
    Hired: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`${baseClasses} ${statusClasses[status]}`}>{tEnum(status)}</span>
  )
}

export const ApplicantsPage = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const job = location.state?.job

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!job?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await recruiterApplicantsService.getJobApplicants(job.id)
        setApplicants(data as Applicant[])
      } catch (err: any) {
        console.error('Failed to fetch applicants:', err)
        setError(err?.message || t('applicants.loadFailed'))
        toast.error(t('applicants.loadFailedToast'))
      } finally {
        setLoading(false)
      }
    }

    fetchApplicants()
  }, [job?.id])

  if (!job) {
    return (
      <div className='text-center py-16'>
        <p className='text-gray-500'>{t('applicants.noJobSelected')}</p>
        <button
          onClick={() => navigate(-1)}
          className='mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90'>
          {t('common.actions.goBack')}
        </button>
      </div>
    )
  }

  const handleViewProfile = (applicant: Applicant) => {
    navigate('/applicant-profile', { state: { applicant } })
  }

  const filteredApplicants = applicants

  return (
    <div>
      <div className='flex items-center mb-6 gap-4'>
        <button
          onClick={() => navigate(-1)}
          className='text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors'
          aria-label={t('applicants.backToJobs')}>
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
        <h2 className='text-3xl font-bold text-gray-900'>
          {t('applicants.title', { title: job.title })}
        </h2>
      </div>
      {error && (
        <div className='mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
          {error}
        </div>
      )}

      <Card padding='sm'>
        {loading ? (
          <div className='space-y-4'>
            {/* Loading Skeleton */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='bg-white border border-gray-200 rounded-lg p-4 animate-pulse'>
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex items-center gap-3'>
                    <div className='h-12 w-12 bg-gray-200 rounded-full'></div>
                    <div>
                      <div className='h-4 w-32 bg-gray-200 rounded mb-2'></div>
                      <div className='h-3 w-24 bg-gray-200 rounded'></div>
                    </div>
                  </div>
                  <div className='h-6 w-16 bg-gray-200 rounded-full'></div>
                </div>
                <div className='mb-3'>
                  <div className='h-3 w-12 bg-gray-200 rounded mb-2'></div>
                  <div className='flex gap-2'>
                    <div className='h-6 w-20 bg-gray-200 rounded'></div>
                    <div className='h-6 w-20 bg-gray-200 rounded'></div>
                  </div>
                </div>
                <div className='h-10 w-full bg-gray-200 rounded'></div>
              </div>
            ))}
          </div>
        ) : filteredApplicants.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className='block lg:hidden space-y-4'>
              {filteredApplicants.map(applicant => (
                <div
                  key={applicant.id}
                  className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex items-center gap-3'>
                      <img
                        className='h-12 w-12 rounded-full object-cover'
                        src={applicant.avatarUrl}
                        alt={applicant.name}
                      />
                      <div>
                        <div className='text-sm font-semibold text-gray-900'>
                          {applicant.name}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {t('applicants.appliedOn', { date: applicant.appliedDate })}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={applicant.status} />
                  </div>

                  <div className='mb-3'>
                    <div className='text-xs font-medium text-gray-500 mb-2'>{t('common.labels.skills')}</div>
                    <div className='flex flex-wrap gap-1.5'>
                      {applicant.skills.slice(0, 3).map(skill => (
                        <span
                          key={skill}
                          className='px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md'>
                          {skill}
                        </span>
                      ))}
                      {applicant.skills.length > 3 && (
                        <span className='px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded-md'>
                          +{applicant.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewProfile(applicant)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors'>
                    {t('common.actions.viewProfile')}
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className='hidden lg:block overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      {t('applicants.candidate')}
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      {t('common.labels.skills')}
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      {t('common.labels.status')}
                    </th>
                    <th scope='col' className='relative px-6 py-3'>
                      <span className='sr-only'>{t('common.actions.view')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredApplicants.map(applicant => (
                    <tr key={applicant.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-11 w-11'>
                            <img
                              className='h-11 w-11 rounded-full object-cover'
                              src={applicant.avatarUrl}
                              alt={applicant.name}
                            />
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-semibold text-gray-900'>
                              {applicant.name}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {t('applicants.appliedOn', { date: applicant.appliedDate })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex flex-wrap gap-1.5'>
                          {applicant.skills.slice(0, 3).map(skill => (
                            <span
                              key={skill}
                              className='px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md'>
                              {skill}
                            </span>
                          ))}
                          {applicant.skills.length > 3 && (
                            <span className='px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded-md'>
                              +{applicant.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <StatusBadge status={applicant.status} />
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <button
                          onClick={() => handleViewProfile(applicant)}
                          className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors'>
                          {t('common.actions.viewProfile')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className='text-center py-16'>
            <UsersIcon className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-lg font-medium text-gray-900'>
              {t('applicants.empty.title')}
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              {t('applicants.empty.description')}
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
