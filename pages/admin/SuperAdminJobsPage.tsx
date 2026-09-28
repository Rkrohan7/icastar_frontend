import React, { useEffect, useState } from 'react'
import {
  SearchIcon,
  MapPinIcon,
  BriefcaseIcon,
  EyeIcon,
  FileTextIcon,
  PlusIcon,
} from '../../components/icons/IconComponents'
import superAdminService, {
  JobStatus,
  JobType,
  JobsQuery,
  SuperAdminJob,
} from '../../services/superAdminService'
import { Pagination } from './SuperAdminRecruitersPage'
import usePageParam from '../../hooks/usePageParam'
import BulkUploadJobsModal from './BulkUploadJobsModal'
import { useTranslation } from '@/i18n'

// Labels come from tEnum(value); the empty value is the "All …" filter option.
const STATUS_OPTIONS: { value: JobStatus | '' }[] = [
  { value: '' },
  { value: 'ACTIVE' },
  { value: 'CLOSED' },
  { value: 'DRAFT' },
  { value: 'EXPIRED' },
]

const TYPE_OPTIONS: { value: JobType | '' }[] = [
  { value: '' },
  { value: 'FULL_TIME' },
  { value: 'PART_TIME' },
  { value: 'CONTRACT' },
  { value: 'FREELANCE' },
]

const PAGE_SIZE = 20

export const SuperAdminJobsPage: React.FC = () => {
  const { t, tEnum } = useTranslation()
  const [jobs, setJobs] = useState<SuperAdminJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = usePageParam('page', 0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState<JobStatus | ''>('')
  const [jobType, setJobType] = useState<JobType | ''>('')
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  // Bumped after a bulk upload to force the list to refetch.
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        setError(null)
        const query: JobsQuery = {
          page,
          size: PAGE_SIZE,
          sortBy: 'createdAt',
          sortDir: 'DESC',
        }
        if (search.trim()) query.search = search.trim()
        if (status) query.status = status
        if (jobType) query.jobType = jobType

        const result = await superAdminService.getJobs(query)
        console.log('[Jobs] API result:', result)
        setJobs(result.data)
        setTotalPages(result.totalPages)
        setTotalItems(result.totalItems)
      } catch (err: any) {
        console.error('Failed to load jobs:', err)
        const status = err?.response?.status
        const apiMsg = err?.response?.data?.message
        if (status === 401) setError(t('adminJobs.errors.unauthorized'))
        else if (status === 403) setError(t('adminJobs.errors.accessDenied'))
        else if (status === 404) setError(t('adminJobs.errors.notFound'))
        else setError(apiMsg || err?.message || t('adminJobs.errors.loadFailed'))
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [page, search, status, jobType, reloadKey, t])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    setSearch(searchInput)
  }

  return (
    <div className='p-6 space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-semibold text-gray-900'>{t('common.nav.jobs')}</h1>
        <button
          onClick={() => setShowBulkUpload(true)}
          className='flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#E36A3A] text-white hover:bg-[#d05c2e]'>
          <PlusIcon className='h-4 w-4' />
          {t('adminJobs.bulkUpload')}
        </button>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
        <div className='flex flex-col md:flex-row gap-3'>
          <form onSubmit={onSearchSubmit} className='flex-1 relative'>
            <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('adminJobs.searchPlaceholder')}
              className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
            />
          </form>
          <select
            value={status}
            onChange={(e) => {
              setPage(0)
              setStatus(e.target.value as JobStatus | '')
            }}
            className='px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value ? tEnum(o.value) : t('adminJobs.allStatuses')}
              </option>
            ))}
          </select>
          <select
            value={jobType}
            onChange={(e) => {
              setPage(0)
              setJobType(e.target.value as JobType | '')
            }}
            className='px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value ? tEnum(o.value) : t('adminJobs.allTypes')}
              </option>
            ))}
          </select>
        </div>
        <p className='text-xs text-gray-500 mt-3'>
          {t('adminJobs.showing', { shown: jobs.length, total: totalItems.toLocaleString() })}
        </p>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className='py-16 text-center text-gray-500'>{t('common.status.loading')}</div>
        ) : error ? (
          <div className='py-16 text-center text-red-600'>{error}</div>
        ) : jobs.length === 0 ? (
          <div className='py-16 text-center text-gray-500'>{t('adminJobs.empty')}</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <Th>{t('adminJobs.columns.job')}</Th>
                  <Th>{t('adminJobs.columns.recruiter')}</Th>
                  <Th>{t('common.labels.type')}</Th>
                  <Th>{t('common.labels.budget')}</Th>
                  <Th>{t('adminJobs.columns.activity')}</Th>
                  <Th>{t('common.labels.status')}</Th>
                  <Th>{t('adminJobs.columns.posted')}</Th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {jobs.map((j) => {
                  const recruiter = j.recruiter || ({} as any)
                  const recruiterName = [recruiter.firstName, recruiter.lastName]
                    .filter(Boolean)
                    .join(' ') || '—'
                  return (
                  <tr key={j.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3'>
                      <p className='font-medium text-gray-900'>{j.title || '—'}</p>
                      <p className='text-xs text-gray-500 flex items-center gap-1 mt-0.5'>
                        <MapPinIcon className='h-3 w-3' /> {j.isRemote ? t('adminJobs.remote') : (j.location || '—')}
                      </p>
                      <div className='flex gap-1 mt-1'>
                        {j.isFeatured && (
                          <span className='text-[10px] px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded'>
                            {t('adminJobs.featured')}
                          </span>
                        )}
                        {j.isUrgent && (
                          <span className='text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 rounded'>
                            {t('adminJobs.urgent')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <p className='font-medium text-gray-900 text-sm'>{recruiterName}</p>
                      <p className='text-xs text-gray-500'>{recruiter.companyName || '—'}</p>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700'>
                        {j.jobType ? tEnum(j.jobType) : t('common.status.notAvailable')}
                      </span>
                      <p className='text-xs text-gray-500 mt-1'>{j.experienceLevel ? tEnum(j.experienceLevel) : '—'}</p>
                    </td>
                    <td className='px-4 py-3 text-xs text-gray-700'>
                      {j.currency || ''} {(j.budgetMin ?? 0).toLocaleString()}
                      <p className='text-gray-500'>{t('adminJobs.budgetTo', { amount: (j.budgetMax ?? 0).toLocaleString() })}</p>
                    </td>
                    <td className='px-4 py-3 text-xs text-gray-700'>
                      <div className='flex items-center gap-1'>
                        <FileTextIcon className='h-3 w-3' /> {t('adminJobs.apps', { count: j.applicationsCount ?? 0 })}
                      </div>
                      <div className='flex items-center gap-1 text-gray-500 mt-0.5'>
                        <EyeIcon className='h-3 w-3' /> {t('adminJobs.views', { count: (j.viewsCount ?? 0).toLocaleString() })}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      {j.status && <JobStatusBadge status={j.status} />}
                    </td>
                    <td className='px-4 py-3 text-xs text-gray-500'>
                      {j.createdAt ? new Date(j.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={totalItems}
        />
      )}

      {showBulkUpload && (
        <BulkUploadJobsModal
          onClose={() => setShowBulkUpload(false)}
          onUploaded={() => {
            setPage(0)
            setReloadKey((k) => k + 1)
          }}
        />
      )}
    </div>
  )
}

const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th className='text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider'>
    {children}
  </th>
)

const JobStatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
  const { tEnum } = useTranslation()
  const cfg: Record<JobStatus, { bg: string; text: string }> = {
    ACTIVE: { bg: 'bg-green-50', text: 'text-green-700' },
    CLOSED: { bg: 'bg-gray-50', text: 'text-gray-700' },
    DRAFT: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    EXPIRED: { bg: 'bg-red-50', text: 'text-red-700' },
  }
  const c = cfg[status]
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {tEnum(status)}
    </span>
  )
}

export default SuperAdminJobsPage
