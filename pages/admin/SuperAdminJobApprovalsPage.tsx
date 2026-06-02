import React, { useEffect, useState } from 'react'
import {
  BriefcaseIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  XIcon,
} from '../../components/icons/IconComponents'
import superAdminService, { PendingJob } from '../../services/superAdminService'
import usePageParam from '../../hooks/usePageParam'
import { Pagination } from './SuperAdminRecruitersPage'

const PAGE_SIZE = 20

const errMsg = (err: any, fallback: string): string => {
  const s = err?.response?.status
  const m = err?.response?.data?.message
  if (s === 401) return 'Unauthorized — log in as admin.'
  if (s === 403) return 'Access denied — admin role required.'
  if (s === 404) return 'Endpoint not found.'
  return m || err?.message || fallback
}

export const SuperAdminJobApprovalsPage: React.FC = () => {
  const [jobs, setJobs] = useState<PendingJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = usePageParam('page', 0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [actingId, setActingId] = useState<number | null>(null)
  const [rejectFor, setRejectFor] = useState<PendingJob | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await superAdminService.getPendingJobs({ page, size: PAGE_SIZE })
      setJobs(result.data)
      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)
    } catch (err: any) {
      setError(errMsg(err, 'Unable to load pending jobs.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleApprove = async (job: PendingJob) => {
    if (!confirm(`Approve "${job.title}"?`)) return
    try {
      setActingId(job.id)
      await superAdminService.approveJob(job.id)
      load()
    } catch (e: any) {
      alert(errMsg(e, 'Failed to approve'))
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className='p-6 space-y-4'>
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-bold text-gray-900'>Jobs Awaiting Approval</h2>
          <p className='text-sm text-gray-500'>{totalItems.toLocaleString()} pending</p>
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className='py-16 text-center text-gray-500'>Loading...</div>
        ) : error ? (
          <div className='py-16 text-center text-red-600'>{error}</div>
        ) : jobs.length === 0 ? (
          <div className='py-16 text-center text-gray-500'>
            <CheckCircleIcon className='h-10 w-10 text-green-500 mx-auto mb-2' />
            All clear — no jobs pending approval
          </div>
        ) : (
          <div className='divide-y divide-gray-100'>
            {jobs.map((j) => (
              <div key={j.id} className='p-5 hover:bg-gray-50'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <BriefcaseIcon className='h-4 w-4 text-[#E36A3A]' />
                      <h3 className='text-base font-semibold text-gray-900'>{j.title || '—'}</h3>
                    </div>
                    <p className='text-sm text-gray-600 mb-2 line-clamp-2'>{j.description || ''}</p>
                    <div className='flex items-center gap-4 text-xs text-gray-500'>
                      <span>
                        <strong className='text-gray-700'>{j.recruiterName || '—'}</strong>
                        {j.companyName ? ` · ${j.companyName}` : ''}
                      </span>
                      {j.location && (
                        <span className='flex items-center gap-1'>
                          <MapPinIcon className='h-3 w-3' /> {j.location}
                        </span>
                      )}
                      {j.jobType && (
                        <span className='px-2 py-0.5 bg-blue-50 text-blue-700 rounded'>
                          {j.jobType.replace(/_/g, ' ')}
                        </span>
                      )}
                      {j.submittedAt && (
                        <span>Submitted {new Date(j.submittedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className='flex gap-2 flex-shrink-0'>
                    <button
                      onClick={() => handleApprove(j)}
                      disabled={actingId === j.id}
                      className='flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50'>
                      <CheckCircleIcon className='h-4 w-4' /> Approve
                    </button>
                    <button
                      onClick={() => setRejectFor(j)}
                      disabled={actingId === j.id}
                      className='flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50'>
                      <XCircleIcon className='h-4 w-4' /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}

      {rejectFor && (
        <RejectModal
          job={rejectFor}
          onClose={() => setRejectFor(null)}
          onDone={() => {
            setRejectFor(null)
            load()
          }}
        />
      )}
    </div>
  )
}

const RejectModal: React.FC<{
  job: PendingJob
  onClose: () => void
  onDone: () => void
}> = ({ job, onClose, onDone }) => {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    if (!reason.trim()) {
      setErr('Reason is required')
      return
    }
    try {
      setSaving(true)
      setErr(null)
      await superAdminService.rejectJob(job.id, { reason: reason.trim() })
      onDone()
    } catch (e: any) {
      setErr(errMsg(e, 'Failed to reject'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4' onClick={onClose}>
      <div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6' onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-bold text-gray-900'>Reject Job</h2>
          <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded'>
            <XIcon className='h-5 w-5' />
          </button>
        </div>
        <p className='text-sm text-gray-600 mb-4'>{job.title}</p>
        <label className='text-xs font-medium text-gray-600'>Reason *</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder='Explain why this job is being rejected...'
          className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
        />
        {err && <div className='mt-2 text-sm text-red-600 bg-red-50 p-2 rounded'>{err}</div>}
        <div className='mt-4 flex justify-end gap-2'>
          <button onClick={onClose} className='px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50'>
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving || !reason.trim()}
            className='px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50'>
            {saving ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminJobApprovalsPage
