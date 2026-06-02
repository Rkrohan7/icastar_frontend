import React, { useEffect, useState } from 'react'
import {
  MailIcon,
  MicVocal,
  CalendarIcon,
} from '../../components/icons/IconComponents'
import superAdminService, {
  AuditionApplicationItem,
} from '../../services/superAdminService'
import usePageParam from '../../hooks/usePageParam'
import { Pagination } from './SuperAdminRecruitersPage'

const PAGE_SIZE = 20

const STATUS_OPTIONS = ['All Statuses', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED', 'REJECTED']

const STATUS_COLOR: Record<string, string> = {
  APPLIED: 'bg-gray-100 text-gray-700',
  UNDER_REVIEW: 'bg-blue-50 text-blue-700',
  SHORTLISTED: 'bg-orange-50 text-orange-700',
  ACCEPTED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
}

export const SuperAdminAuditionApplicationsPage: React.FC = () => {
  const [list, setList] = useState<AuditionApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = usePageParam('page', 0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await superAdminService.getAuditionApplications({
          page,
          size: PAGE_SIZE,
          sortBy: 'appliedAt',
          sortDir: 'DESC',
          status: status || undefined,
        })
        setList(result.data)
        setTotalPages(result.totalPages)
        setTotalItems(result.totalItems)
      } catch (e: any) {
        const s = e?.response?.status
        const m = e?.response?.data?.message
        if (s === 401) setError('Unauthorized — log in as admin.')
        else if (s === 403) setError('Access denied — admin role required.')
        else setError(m || e?.message || 'Unable to load audition applications.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, status])

  return (
    <div className='p-6 space-y-4'>
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
        <select
          value={status}
          onChange={(e) => {
            setPage(0)
            setStatus(e.target.value === 'All Statuses' ? '' : e.target.value)
          }}
          className='px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s === 'All Statuses' ? '' : s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <p className='text-xs text-gray-500 mt-3'>
          Showing {list.length} of {totalItems.toLocaleString()} audition applications
        </p>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className='py-16 text-center text-gray-500'>Loading...</div>
        ) : error ? (
          <div className='py-16 text-center text-red-600'>{error}</div>
        ) : list.length === 0 ? (
          <div className='py-16 text-center text-gray-500'>No applications found</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <Th>Artist</Th>
                  <Th>Audition</Th>
                  <Th>Recruiter</Th>
                  <Th>Status</Th>
                  <Th>Applied</Th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {list.map((a) => (
                  <tr key={a.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3'>
                      <p className='font-medium text-gray-900'>{a.artistName || '—'}</p>
                      <p className='text-xs text-gray-500 flex items-center gap-1'>
                        <MailIcon className='h-3 w-3' /> {a.artistEmail || '—'}
                      </p>
                    </td>
                    <td className='px-4 py-3'>
                      <p className='text-sm text-gray-900 flex items-center gap-1'>
                        <MicVocal className='h-3 w-3' /> {a.auditionTitle || '—'}
                      </p>
                      {a.coverLetter && (
                        <p className='text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs'>
                          {a.coverLetter}
                        </p>
                      )}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-700'>{a.recruiterName || '—'}</td>
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLOR[a.status || ''] || 'bg-gray-100 text-gray-600'
                        }`}>
                        {(a.status || 'N/A').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-xs text-gray-500'>
                      <div className='flex items-center gap-1'>
                        <CalendarIcon className='h-3 w-3' />
                        {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '—'}
                      </div>
                    </td>
                  </tr>
                ))}
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

export default SuperAdminAuditionApplicationsPage
