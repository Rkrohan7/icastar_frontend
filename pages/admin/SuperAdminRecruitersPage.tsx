import React, { useEffect, useState } from 'react'
import {
  SearchIcon,
  CheckCircleIcon,
  XCircleIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
} from '../../components/icons/IconComponents'
import superAdminService, {
  AccountStatus,
  RecruiterCategory,
  RecruitersQuery,
  SuperAdminRecruiter,
} from '../../services/superAdminService'
import usePageParam from '../../hooks/usePageParam'

const STATUS_OPTIONS: { label: string; value: AccountStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Banned', value: 'BANNED' },
]

const CATEGORY_OPTIONS: { label: string; value: RecruiterCategory | '' }[] = [
  { label: 'All Categories', value: '' },
  { label: 'Production House', value: 'PRODUCTION_HOUSE' },
  { label: 'Casting Director', value: 'CASTING_DIRECTOR' },
  { label: 'Individual', value: 'INDIVIDUAL' },
]

const PAGE_SIZE = 20

export const SuperAdminRecruitersPage: React.FC = () => {
  const [recruiters, setRecruiters] = useState<SuperAdminRecruiter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = usePageParam('page', 0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState<AccountStatus | ''>('')
  const [category, setCategory] = useState<RecruiterCategory | ''>('')

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        setError(null)
        const query: RecruitersQuery = {
          page,
          size: PAGE_SIZE,
          sortBy: 'createdAt',
          sortDir: 'DESC',
        }
        if (search.trim()) query.search = search.trim()
        if (status) query.status = status
        if (category) query.category = category

        const result = await superAdminService.getRecruiters(query)
        console.log('[Recruiters] API result:', result)
        setRecruiters(result.data)
        setTotalPages(result.totalPages)
        setTotalItems(result.totalItems)
      } catch (err: any) {
        console.error('Failed to load recruiters:', err)
        const status = err?.response?.status
        const apiMsg = err?.response?.data?.message
        if (status === 401) setError('Unauthorized — please log in as an admin.')
        else if (status === 403) setError('Access denied — admin role required.')
        else if (status === 404) setError('Endpoint not found — check backend route /super-admin/recruiters.')
        else setError(apiMsg || err?.message || 'Unable to load recruiters.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [page, search, status, category])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    setSearch(searchInput)
  }

  return (
    <div className='p-6 space-y-4'>
      {/* Filters */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
        <div className='flex flex-col md:flex-row gap-3'>
          <form onSubmit={onSearchSubmit} className='flex-1 relative'>
            <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='Search by name or email...'
              className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
            />
          </form>
          <select
            value={status}
            onChange={(e) => {
              setPage(0)
              setStatus(e.target.value as AccountStatus | '')
            }}
            className='px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => {
              setPage(0)
              setCategory(e.target.value as RecruiterCategory | '')
            }}
            className='px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <p className='text-xs text-gray-500 mt-3'>
          Showing {recruiters.length} of {totalItems.toLocaleString()} recruiters
        </p>
      </div>

      {/* Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className='py-16 text-center text-gray-500'>Loading...</div>
        ) : error ? (
          <div className='py-16 text-center text-red-600'>{error}</div>
        ) : recruiters.length === 0 ? (
          <div className='py-16 text-center text-gray-500'>No recruiters found</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <Th>Recruiter</Th>
                  <Th>Company</Th>
                  <Th>Contact</Th>
                  <Th>Category</Th>
                  <Th>Stats</Th>
                  <Th>Status</Th>
                  <Th>Joined</Th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {recruiters.map((r) => {
                  const firstName = r.firstName || ''
                  const lastName = r.lastName || ''
                  const cityState = [r.city, r.state].filter(Boolean).join(', ') || '—'
                  return (
                    <tr key={r.id} className='hover:bg-gray-50'>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          {r.profileImage ? (
                            <img
                              src={r.profileImage}
                              alt={firstName}
                              className='h-10 w-10 rounded-full object-cover flex-shrink-0'
                            />
                          ) : (
                            <div className='h-10 w-10 rounded-full bg-gradient-to-br from-[#E36A3A] to-[#F6A57A] flex items-center justify-center text-white font-semibold flex-shrink-0'>
                              {firstName.charAt(0) || '?'}
                            </div>
                          )}
                          <div className='min-w-0'>
                            <p className='font-medium text-gray-900 truncate'>
                              {firstName} {lastName}
                            </p>
                            <p className='text-xs text-gray-500 truncate'>{r.designation || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <p className='font-medium text-gray-900'>{r.companyName || '—'}</p>
                        <p className='text-xs text-gray-500 flex items-center gap-1 mt-0.5'>
                          <MapPinIcon className='h-3 w-3' /> {cityState}
                        </p>
                      </td>
                      <td className='px-4 py-3 text-xs'>
                        <div className='flex items-center gap-1 text-gray-700'>
                          <MailIcon className='h-3 w-3' /> {r.email || '—'}
                        </div>
                        <div className='flex items-center gap-1 text-gray-500 mt-0.5'>
                          <PhoneIcon className='h-3 w-3' /> {r.mobile || '—'}
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <span className='inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-[#E36A3A]'>
                          {(r.recruiterCategory || 'N/A').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-xs text-gray-700'>
                        <div className='flex items-center gap-1'>
                          <BriefcaseIcon className='h-3 w-3' /> {r.totalJobsPosted ?? 0} jobs
                        </div>
                        <div className='text-gray-500 mt-0.5'>
                          {r.totalHires ?? 0} hires · {r.totalApplicationsReceived ?? 0} apps
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        {r.accountStatus && <StatusBadge status={r.accountStatus} />}
                        {r.isVerified && (
                          <div className='flex items-center gap-1 text-xs text-green-600 mt-1'>
                            <CheckCircleIcon className='h-3 w-3' /> Verified
                          </div>
                        )}
                      </td>
                      <td className='px-4 py-3 text-xs text-gray-500'>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
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

export const StatusBadge: React.FC<{ status: AccountStatus }> = ({ status }) => {
  const cfg: Record<AccountStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    ACTIVE: { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircleIcon className='h-3 w-3' /> },
    INACTIVE: { bg: 'bg-gray-50', text: 'text-gray-600', icon: null },
    SUSPENDED: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: null },
    BANNED: { bg: 'bg-red-50', text: 'text-red-700', icon: <XCircleIcon className='h-3 w-3' /> },
  }
  const c = cfg[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.icon}
      {status}
    </span>
  )
}

/**
 * Shared admin pagination. `page` is 0-based (what the API wants); the numbers
 * shown to the user are 1-based. `totalItems` is optional so existing call
 * sites keep working without passing it.
 */
export const Pagination: React.FC<{
  page: number
  totalPages: number
  onChange: (p: number) => void
  totalItems?: number
}> = ({ page, totalPages, onChange, totalItems }) => {
  const current = page + 1
  let nums: (number | '...')[] = []
  if (totalPages <= 12) {
    // Few enough pages — show every one rather than hiding some behind "…"
    nums = Array.from({ length: totalPages }, (_, i) => i + 1)
  } else {
    // Long lists stay windowed: 1 … 4 5 [6] 7 8 … 20
    const range = 2
    const start = Math.max(2, current - range)
    const end = Math.min(totalPages - 1, current + range)
    nums.push(1)
    if (start > 2) nums.push('...')
    for (let i = start; i <= end; i++) nums.push(i)
    if (end < totalPages - 1) nums.push('...')
    nums.push(totalPages)
  }

  return (
    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3'>
      <p className='text-sm text-gray-600'>
        Page <span className='font-semibold'>{current}</span> of{' '}
        <span className='font-semibold'>{totalPages}</span>
        {typeof totalItems === 'number' && (
          <span className='text-gray-400'> · {totalItems.toLocaleString()} total</span>
        )}
      </p>
      <div className='flex items-center gap-1'>
        <button
          onClick={() => onChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className='px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'>
          Previous
        </button>

        {nums.map((n, i) =>
          n === '...' ? (
            <span key={`e-${i}`} className='px-2 text-sm text-gray-400 select-none'>
              …
            </span>
          ) : (
            <button
              key={n}
              onClick={() => onChange((n as number) - 1)}
              aria-current={current === n ? 'page' : undefined}
              className={`min-w-[2rem] px-2 py-1.5 text-sm rounded-lg border transition-colors ${
                current === n
                  ? 'bg-[#E36A3A] text-white border-[#E36A3A] font-semibold'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}>
              {n}
            </button>
          ),
        )}

        <button
          onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          className='px-3 py-1.5 text-sm bg-[#E36A3A] text-white rounded-lg hover:bg-[#C95428] disabled:opacity-40 disabled:cursor-not-allowed'>
          Next
        </button>
      </div>
    </div>
  )
}

export default SuperAdminRecruitersPage
