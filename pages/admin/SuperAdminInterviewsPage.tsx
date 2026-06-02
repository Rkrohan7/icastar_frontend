import React, { useEffect, useState } from 'react'
import {
  CalendarIcon,
  UserCircleIcon,
  BriefcaseIcon,
} from '../../components/icons/IconComponents'
import superAdminService, { InterviewItem } from '../../services/superAdminService'
import usePageParam from '../../hooks/usePageParam'
import { Pagination } from './SuperAdminRecruitersPage'

const PAGE_SIZE = 20

const STATUS_OPTIONS = ['All Statuses', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'CANCELLED']

const STATUS_COLOR: Record<string, string> = {
  INTERVIEW_SCHEDULED: 'bg-blue-50 text-blue-700',
  INTERVIEW_COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
}

export const SuperAdminInterviewsPage: React.FC = () => {
  const [list, setList] = useState<InterviewItem[]>([])
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
        const result = await superAdminService.getInterviews({
          page, size: PAGE_SIZE, status: status || undefined,
        })
        setList(result.data)
        setTotalPages(result.totalPages)
        setTotalItems(result.totalItems)
      } catch (e: any) {
        const s = e?.response?.status
        const m = e?.response?.data?.message
        if (s === 401) setError('Unauthorized — log in as admin.')
        else if (s === 403) setError('Access denied — admin role required.')
        else setError(m || e?.message || 'Unable to load interviews.')
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
          Showing {list.length} of {totalItems.toLocaleString()} interviews
        </p>
      </div>

      {loading ? (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center text-gray-500'>Loading...</div>
      ) : error ? (
        <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl'>{error}</div>
      ) : list.length === 0 ? (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center text-gray-500'>
          No interviews found
        </div>
      ) : (
        <div className='space-y-3'>
          {list.map((i) => (
            <div key={i.applicationId} className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    <CalendarIcon className='h-5 w-5 text-[#E36A3A]' />
                    <h3 className='font-semibold text-gray-900'>
                      {i.interviewScheduledAt
                        ? new Date(i.interviewScheduledAt).toLocaleString()
                        : 'Not scheduled'}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        STATUS_COLOR[i.status || ''] || 'bg-gray-100 text-gray-600'
                      }`}>
                      {(i.status || 'N/A').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-3 text-sm'>
                    <div>
                      <p className='text-xs text-gray-500'>Artist</p>
                      <p className='font-medium text-gray-900 flex items-center gap-1'>
                        <UserCircleIcon className='h-3 w-3' /> {i.artistName || '—'}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Job</p>
                      <p className='font-medium text-gray-900 flex items-center gap-1'>
                        <BriefcaseIcon className='h-3 w-3' /> {i.jobTitle || '—'}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Recruiter</p>
                      <p className='font-medium text-gray-900'>{i.recruiterName || '—'}</p>
                    </div>
                  </div>
                  {i.interviewNotes && (
                    <div className='mt-3 p-3 bg-gray-50 rounded-lg'>
                      <p className='text-xs text-gray-500 mb-1'>Notes</p>
                      <p className='text-sm text-gray-700'>{i.interviewNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
    </div>
  )
}

export default SuperAdminInterviewsPage
