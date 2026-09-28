import React, { useEffect, useState } from 'react'
import Icon from '@/components/Icon'
import { applicationsService, MyApplication } from '@/services/applicationsService'
import placeholderLogo from '@/assets/icaster.png'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/i18n'

const statusClasses: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-800',
  INTERVIEW: 'bg-yellow-100 text-yellow-800',
  REJECTED: 'bg-red-100 text-red-800',
  OFFER: 'bg-green-100 text-green-800',
  HIRED: 'bg-green-100 text-green-800',
}

const StatusTag: React.FC<{ status: string }> = ({ status }) => {
  const { tEnum } = useTranslation()
  const key = status.toUpperCase()
  const classes = statusClasses[key] || 'bg-gray-100 text-gray-800'
  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${classes}`}>
      {tEnum(status)}
    </span>
  )
}

const Applications: React.FC = () => {
  const [apps, setApps] = useState<MyApplication[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  // Holds a translation key; translated at render
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true)
      setError(null)
      try {
        const { items } = await applicationsService.listMyApplications({
          page: 0,
          size: 20,
          sortBy: 'appliedAt',
          sortDir: 'desc',
          status: 'HIRED',
        })
        setApps(items)
      } catch (e: any) {
        console.error('Failed to load applications', e)
        setError('artistApplications.loadFailed')
      } finally {
        setLoading(false)
      }
    }
    fetchApps()
  }, [])

  return (
    <div className='space-y-6'>
      <h1 className='text-4xl font-bold'>{t('artistApplications.title')}</h1>
      <p className='text-gray-600'>
        {t('artistApplications.subtitle')}
      </p>

      <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
        {loading ? (
          <table className='w-full text-left'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='p-5 font-semibold text-gray-600'>{t('artistApplications.table.jobTitle')}</th>
                <th className='p-5 font-semibold text-gray-600'>{t('common.labels.company')}</th>
                <th className='p-5 font-semibold text-gray-600'>{t('artistApplications.table.dateApplied')}</th>
                <th className='p-5 font-semibold text-gray-600'>{t('common.labels.status')}</th>
                <th className='p-5 font-semibold text-gray-600'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {[...Array(5)].map((_, idx) => (
                <tr key={idx}>
                  <td className='p-5'>
                    <div className='flex items-center gap-3'>
                      <Skeleton className='w-10 h-10 rounded-lg' />
                      <div className='space-y-2'>
                        <Skeleton className='h-4 w-40' />
                        <Skeleton className='h-4 w-24' />
                      </div>
                    </div>
                  </td>
                  <td className='p-5'>
                    <Skeleton className='h-4 w-28' />
                  </td>
                  <td className='p-5'>
                    <Skeleton className='h-4 w-24' />
                  </td>
                  <td className='p-5'>
                    <Skeleton className='h-6 w-20 rounded-full' />
                  </td>
                  <td className='p-5 text-right'>
                    <Skeleton className='h-6 w-6 rounded-md inline-block' />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : error ? (
          <div className='p-6 text-red-600'>{t(error)}</div>
        ) : apps.length === 0 ? (
          <div className='py-16 text-center'>
            <h3 className='text-lg font-medium text-gray-900'>{t('artistApplications.empty.title')}</h3>
            <p className='mt-1 text-sm text-gray-500'>{t('artistApplications.empty.description')}</p>
          </div>
        ) : (
          <table className='w-full text-left'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='p-5 font-semibold text-gray-600'>{t('artistApplications.table.jobTitle')}</th>
                <th className='p-5 font-semibold text-gray-600'>{t('common.labels.company')}</th>
                <th className='p-5 font-semibold text-gray-600'>{t('artistApplications.table.dateApplied')}</th>
                <th className='p-5 font-semibold text-gray-600'>{t('common.labels.status')}</th>
                <th className='p-5 font-semibold text-gray-600'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {apps.map(app => (
                <tr key={app.id} className='hover:bg-gray-50 transition-colors'>
                  <td className='p-5'>
                    <div className='flex items-center gap-3'>
                      <div>
                        <p className='font-bold'>{app.jobTitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className='p-5 text-gray-700'>{app.company || '-'}</td>
                  <td className='p-5 text-gray-700'>
                    {app.appliedAt
                      ? new Date(app.appliedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                      : '-'}
                  </td>
                  <td className='p-5'>
                    <StatusTag status={app.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Applications
