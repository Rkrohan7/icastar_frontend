import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  SearchIcon,
  CheckCircleIcon,
  EyeIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  FileTextIcon,
} from '../../components/icons/IconComponents'
import superAdminService, {
  AccountStatus,
  ArtistsQuery,
  SuperAdminArtist,
} from '../../services/superAdminService'
import { Pagination, StatusBadge } from './SuperAdminRecruitersPage'
import usePageParam from '../../hooks/usePageParam'

const STATUS_OPTIONS: { label: string; value: AccountStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Banned', value: 'BANNED' },
]

const ARTIST_TYPE_OPTIONS = [
  'All Types',
  'Actor',
  'Dancer',
  'Singer',
  'Model',
  'Director',
  'Musician',
  'Other',
]

const PAGE_SIZE = 20

export const SuperAdminArtistsPage: React.FC = () => {
  const navigate = useNavigate()
  const [artists, setArtists] = useState<SuperAdminArtist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = usePageParam('page', 0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState<AccountStatus | ''>('')
  const [artistType, setArtistType] = useState<string>('')

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        setError(null)
        const query: ArtistsQuery = {
          page,
          size: PAGE_SIZE,
          sortBy: 'createdAt',
          sortDir: 'DESC',
        }
        if (search.trim()) query.search = search.trim()
        if (status) query.status = status
        if (artistType) query.artistType = artistType

        const result = await superAdminService.getArtists(query)
        console.log('[Artists] API result:', result)
        setArtists(result.data)
        setTotalPages(result.totalPages)
        setTotalItems(result.totalItems)
      } catch (err: any) {
        console.error('Failed to load artists:', err)
        const status = err?.response?.status
        const apiMsg = err?.response?.data?.message
        if (status === 401) setError('Unauthorized — please log in as an admin.')
        else if (status === 403) setError('Access denied — admin role required.')
        else if (status === 404) setError('Endpoint not found — check backend route /super-admin/artists.')
        else setError(apiMsg || err?.message || 'Unable to load artists.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [page, search, status, artistType])

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
            value={artistType}
            onChange={(e) => {
              setPage(0)
              const val = e.target.value
              setArtistType(val === 'All Types' ? '' : val)
            }}
            className='px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
            {ARTIST_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <p className='text-xs text-gray-500 mt-3'>
          Showing {artists.length} of {totalItems.toLocaleString()} artists
        </p>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className='py-16 text-center text-gray-500'>Loading...</div>
        ) : error ? (
          <div className='py-16 text-center text-red-600'>{error}</div>
        ) : artists.length === 0 ? (
          <div className='py-16 text-center text-gray-500'>No artists found</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <Th>Artist</Th>
                  <Th>Type</Th>
                  <Th>Contact</Th>
                  <Th>Location</Th>
                  <Th>Activity</Th>
                  <Th>Status</Th>
                  <Th>Joined</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {artists.map((a) => {
                  const firstName = a.firstName || ''
                  const lastName = a.lastName || ''
                  const fullName = `${firstName} ${lastName}`.trim() || '—'
                  return (
                  <tr key={a.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        {a.profileImage ? (
                          <img
                            src={a.profileImage}
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
                            {a.stageName || fullName}
                          </p>
                          <p className='text-xs text-gray-500 truncate'>
                            {fullName} {a.age ? `· ${a.age}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-[#E36A3A]'>
                        {a.artistTypeName || 'N/A'}
                      </span>
                      <p className='text-xs text-gray-500 mt-1'>
                        {a.experienceLevel || '—'} · {a.yearsOfExperience ?? 0}y
                      </p>
                    </td>
                    <td className='px-4 py-3 text-xs'>
                      <div className='flex items-center gap-1 text-gray-700'>
                        <MailIcon className='h-3 w-3' /> {a.email || '—'}
                      </div>
                      <div className='flex items-center gap-1 text-gray-500 mt-0.5'>
                        <PhoneIcon className='h-3 w-3' /> {a.mobile || '—'}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-xs text-gray-700'>
                      <div className='flex items-center gap-1'>
                        <MapPinIcon className='h-3 w-3' /> {a.city || '—'}
                      </div>
                      <p className='text-gray-500 mt-0.5'>{a.state || ''}</p>
                    </td>
                    <td className='px-4 py-3 text-xs text-gray-700'>
                      <div className='flex items-center gap-1'>
                        <FileTextIcon className='h-3 w-3' /> {a.totalApplications ?? 0} apps
                      </div>
                      <div className='flex items-center gap-1 text-gray-500 mt-0.5'>
                        <EyeIcon className='h-3 w-3' /> {(a.profileViews ?? 0).toLocaleString()} views
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      {a.accountStatus && <StatusBadge status={a.accountStatus} />}
                      {a.isVerified && (
                        <div className='flex items-center gap-1 text-xs text-green-600 mt-1'>
                          <CheckCircleIcon className='h-3 w-3' /> Verified
                        </div>
                      )}
                    </td>
                    <td className='px-4 py-3 text-xs text-gray-500'>
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className='px-4 py-3'>
                      <button
                        onClick={() => navigate(`/admin/artists/${a.id}/portfolio`)}
                        className='text-xs text-[#E36A3A] hover:underline whitespace-nowrap'>
                        View Portfolio
                      </button>
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

export default SuperAdminArtistsPage
