import React, { useEffect, useState } from 'react'
import {
  SearchIcon,
  CalendarIcon,
  MicVocal,
  XIcon,
  EditIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '../../components/icons/IconComponents'
import superAdminService, {
  SuperAdminAudition,
  AuditionAdminStatus,
  AuditionStatusUpdatePayload,
} from '../../services/superAdminService'
import usePageParam from '../../hooks/usePageParam'
import { Pagination } from './SuperAdminRecruitersPage'

const PAGE_SIZE = 20

const STATUS_OPTIONS: { label: string; value: AuditionAdminStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

interface Props {
  initialStatus?: AuditionAdminStatus
  title?: string
}

export const SuperAdminAuditionsPage: React.FC<Props> = ({ initialStatus, title }) => {
  const [list, setList] = useState<SuperAdminAudition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = usePageParam('page', 0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [status, setStatus] = useState<AuditionAdminStatus | ''>(initialStatus || '')
  const [type, setType] = useState('')
  const [editing, setEditing] = useState<SuperAdminAudition | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await superAdminService.getAuditions({
        page,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        sortDir: 'DESC',
        status: status || undefined,
        type: type || undefined,
      })
      setList(result.data)
      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)
    } catch (err: any) {
      const s = err?.response?.status
      const m = err?.response?.data?.message
      if (s === 401) setError('Unauthorized — log in as admin.')
      else if (s === 403) setError('Access denied — admin role required.')
      else setError(m || err?.message || 'Unable to load auditions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, type])

  return (
    <div className='p-6 space-y-4'>
      {title && (
        <div className='text-lg font-semibold text-gray-900'>{title}</div>
      )}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
        <div className='flex flex-col md:flex-row gap-3'>
          <div className='flex-1 relative'>
            <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              value={type}
              onChange={(e) => {
                setPage(0)
                setType(e.target.value)
              }}
              placeholder='Filter by type (e.g. LIVE_VIDEO)...'
              className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setPage(0)
              setStatus(e.target.value as AuditionAdminStatus | '')
            }}
            className='px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <p className='text-xs text-gray-500 mt-3'>
          Showing {list.length} of {totalItems.toLocaleString()} auditions
        </p>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className='py-16 text-center text-gray-500'>Loading...</div>
        ) : error ? (
          <div className='py-16 text-center text-red-600'>{error}</div>
        ) : list.length === 0 ? (
          <div className='py-16 text-center text-gray-500'>No auditions found</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <Th>Audition</Th>
                  <Th>Artist</Th>
                  <Th>Recruiter</Th>
                  <Th>Type</Th>
                  <Th>Scheduled</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {list.map((a) => (
                  <tr key={a.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3'>
                      <p className='font-medium text-gray-900'>{a.title || '—'}</p>
                      <p className='text-xs text-gray-500'>{a.jobTitle || ''}</p>
                    </td>
                    <td className='px-4 py-3'>
                      <p className='text-sm text-gray-900'>{a.artistName || '—'}</p>
                      <p className='text-xs text-gray-500'>{a.artistEmail || ''}</p>
                    </td>
                    <td className='px-4 py-3'>
                      <p className='text-sm text-gray-900'>{a.recruiterName || '—'}</p>
                      <p className='text-xs text-gray-500'>{a.companyName || ''}</p>
                    </td>
                    <td className='px-4 py-3 text-xs'>
                      <span className='inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium'>
                        {(a.auditionType || 'N/A').replace(/_/g, ' ')}
                      </span>
                      {a.durationMinutes && (
                        <p className='text-gray-500 mt-1'>{a.durationMinutes} min</p>
                      )}
                    </td>
                    <td className='px-4 py-3 text-xs text-gray-700'>
                      <div className='flex items-center gap-1'>
                        <CalendarIcon className='h-3 w-3' />
                        {a.scheduledAt ? new Date(a.scheduledAt).toLocaleString() : '—'}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <AuditionStatusBadge status={a.status} />
                    </td>
                    <td className='px-4 py-3'>
                      <button
                        onClick={() => setEditing(a)}
                        className='p-1.5 text-gray-600 hover:bg-gray-100 rounded'
                        title='Update status'>
                        <EditIcon className='h-4 w-4' />
                      </button>
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

      {editing && (
        <AuditionStatusModal
          audition={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
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

const AuditionStatusBadge: React.FC<{ status: AuditionAdminStatus }> = ({ status }) => {
  const cfg: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    SCHEDULED: { bg: 'bg-blue-50', text: 'text-blue-700', icon: <CalendarIcon className='h-3 w-3' /> },
    IN_PROGRESS: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: null },
    COMPLETED: { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircleIcon className='h-3 w-3' /> },
    CANCELLED: { bg: 'bg-gray-50', text: 'text-gray-600', icon: null },
    PENDING: { bg: 'bg-orange-50', text: 'text-orange-700', icon: null },
    APPROVED: { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircleIcon className='h-3 w-3' /> },
    REJECTED: { bg: 'bg-red-50', text: 'text-red-700', icon: <XCircleIcon className='h-3 w-3' /> },
  }
  const c = cfg[status] || { bg: 'bg-gray-50', text: 'text-gray-600', icon: null }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.icon}
      {status}
    </span>
  )
}

const AuditionStatusModal: React.FC<{
  audition: SuperAdminAudition
  onClose: () => void
  onSaved: () => void
}> = ({ audition, onClose, onSaved }) => {
  const [status, setStatus] = useState<AuditionAdminStatus>(audition.status || 'SCHEDULED')
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const save = async () => {
    try {
      setSaving(true)
      setErr(null)
      const payload: AuditionStatusUpdatePayload = { status }
      if (feedback.trim()) payload.feedback = feedback.trim()
      if (rating > 0) payload.rating = rating
      await superAdminService.updateAuditionStatus(audition.id, payload)
      onSaved()
    } catch (e: any) {
      const m = e?.response?.data?.message
      setErr(m || e?.message || 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4' onClick={onClose}>
      <div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6' onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-bold text-gray-900'>Update Audition Status</h2>
          <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded'>
            <XIcon className='h-5 w-5' />
          </button>
        </div>
        <p className='text-sm text-gray-600 mb-4'>
          <MicVocal className='h-4 w-4 inline mr-1 text-[#E36A3A]' />
          {audition.title}
        </p>
        <div className='space-y-3'>
          <div>
            <label className='text-xs font-medium text-gray-600'>Status</label>
            <select
              value={status} onChange={(e) => setStatus(e.target.value as AuditionAdminStatus)}
              className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
              {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className='text-xs font-medium text-gray-600'>Feedback</label>
            <textarea
              value={feedback} onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder='Optional feedback...'
              className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
            />
          </div>
          <div>
            <label className='text-xs font-medium text-gray-600'>Rating (1-5)</label>
            <div className='flex gap-1 mt-1'>
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r} type='button'
                  onClick={() => setRating(r === rating ? 0 : r)}
                  className={`h-8 w-8 rounded-full text-sm font-semibold transition-colors ${
                    rating >= r
                      ? 'bg-[#E36A3A] text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          {err && <div className='text-sm text-red-600 bg-red-50 p-2 rounded'>{err}</div>}
        </div>
        <div className='mt-6 flex justify-end gap-2'>
          <button onClick={onClose} className='px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50'>
            Cancel
          </button>
          <button
            onClick={save} disabled={saving}
            className='px-4 py-2 text-sm font-medium bg-[#E36A3A] text-white rounded-lg hover:bg-[#C95428] disabled:opacity-50'>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Approvals view: same component, pre-filtered to PENDING
export const SuperAdminAuditionApprovalsPage: React.FC = () => (
  <SuperAdminAuditionsPage initialStatus='PENDING' title='Auditions awaiting approval' />
)

export default SuperAdminAuditionsPage
