import React, { useEffect, useState } from 'react'
import {
  SearchIcon,
  MapPinIcon,
  BriefcaseIcon,
  EyeIcon,
  FileTextIcon,
} from '../../components/icons/IconComponents'
import superAdminService, {
  JobStatus,
  JobType,
  JobsQuery,
  SuperAdminJob,
} from '../../services/superAdminService'
import { Pagination } from './SuperAdminRecruitersPage'
import usePageParam from '../../hooks/usePageParam'

const STATUS_OPTIONS: { label: string; value: JobStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Expired', value: 'EXPIRED' },
]

const TYPE_OPTIONS: { label: string; value: JobType | '' }[] = [
  { label: 'All Types', value: '' },
  { label: 'Full Time', value: 'FULL_TIME' },
  { label: 'Part Time', value: 'PART_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Freelance', value: 'FREELANCE' },
]

const PAGE_SIZE = 20

export const SuperAdminJobsPage: React.FC = () => {
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
        if (status === 401) setError('Unauthorized — please log in as an admin.')
        else if (status === 403) setError('Access denied — admin role required.')
        else if (status === 404) setError('Endpoint not found — check backend route /super-admin/jobs.')
        else setError(apiMsg || err?.message || 'Unable to load jobs.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [page, search, status, jobType])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    setSearch(searchInput)
  }

  return (
    <div className='p-6 space-y-4'>
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
        <div className='flex flex-col md:flex-row gap-3'>
          <form onSubmit={onSearchSubmit} className='flex-1 relative'>
            <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='Search by title or description...'
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
                {o.label}
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
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <p className='text-xs text-gray-500 mt-3'>
          Showing {jobs.length} of {totalItems.toLocaleString()} jobs
        </p>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className='py-16 text-center text-gray-500'>Loading...</div>
        ) : error ? (
          <div className='py-16 text-center text-red-600'>{error}</div>
        ) : jobs.length === 0 ? (
          <div className='py-16 text-center text-gray-500'>No jobs found</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <Th>Job</Th>
                  <Th>Recruiter</Th>
                  <Th>Type</Th>
                  <Th>Budget</Th>
                  <Th>Activity</Th>
                  <Th>Status</Th>
                  <Th>Posted</Th>
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
                        <MapPinIcon className='h-3 w-3' /> {j.isRemote ? 'Remote' : (j.location || '—')}
                      </p>
                      <div className='flex gap-1 mt-1'>
                        {j.isFeatured && (
                          <span className='text-[10px] px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded'>
                            Featured
                          </span>
                        )}
                        {j.isUrgent && (
                          <span className='text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 rounded'>
                            Urgent
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
                        {(j.jobType || 'N/A').replace(/_/g, ' ')}
                      </span>
                      <p className='text-xs text-gray-500 mt-1'>{j.experienceLevel || '—'}</p>
                    </td>
                    <td className='px-4 py-3 text-xs text-gray-700'>
                      {j.currency || ''} {(j.budgetMin ?? 0).toLocaleString()}
                      <p className='text-gray-500'>to {(j.budgetMax ?? 0).toLocaleString()}</p>
                    </td>
                    <td className='px-4 py-3 text-xs text-gray-700'>
                      <div className='flex items-center gap-1'>
                        <FileTextIcon className='h-3 w-3' /> {j.applicationsCount ?? 0} apps
                      </div>
                      <div className='flex items-center gap-1 text-gray-500 mt-0.5'>
                        <EyeIcon className='h-3 w-3' /> {(j.viewsCount ?? 0).toLocaleString()} views
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
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
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
  const cfg: Record<JobStatus, { bg: string; text: string }> = {
    ACTIVE: { bg: 'bg-green-50', text: 'text-green-700' },
    CLOSED: { bg: 'bg-gray-50', text: 'text-gray-700' },
    DRAFT: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    EXPIRED: { bg: 'bg-red-50', text: 'text-red-700' },
  }
  const c = cfg[status]
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {status}
    </span>
  )
}

export default SuperAdminJobsPage
