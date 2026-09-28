import React, { useEffect, useState } from 'react'
import {
  ShieldCheckIcon,
  XIcon,
  EditIcon,
} from '../../components/icons/IconComponents'
import superAdminService, {
  ReportContentItem,
  ReportPriority,
  ReportReviewPayload,
  ReportStatus,
} from '../../services/superAdminService'
import usePageParam from '../../hooks/usePageParam'
import { Pagination } from './SuperAdminRecruitersPage'
import AdminSearchBox from './AdminSearchBox'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

// Labels come from tEnum(value); the empty value is the "All …" filter option.
const STATUS_OPTIONS: { value: ReportStatus | '' }[] = [
  { value: '' },
  { value: 'PENDING' },
  { value: 'IN_REVIEW' },
  { value: 'RESOLVED' },
  { value: 'DISMISSED' },
]

const PRIORITY_OPTIONS: { value: ReportPriority | '' }[] = [
  { value: '' },
  { value: 'CRITICAL' },
  { value: 'HIGH' },
  { value: 'MEDIUM' },
  { value: 'LOW' },
]

const ACTION_OPTIONS = [
  'NO_ACTION',
  'WARNING_ISSUED',
  'CONTENT_REMOVED',
  'USER_SUSPENDED',
  'USER_BANNED',
]

const PRIORITY_COLOR: Record<ReportPriority, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-gray-100 text-gray-700',
}

const STATUS_COLOR: Record<ReportStatus, string> = {
  PENDING: 'bg-orange-50 text-orange-700',
  IN_REVIEW: 'bg-blue-50 text-blue-700',
  RESOLVED: 'bg-green-50 text-green-700',
  DISMISSED: 'bg-gray-50 text-gray-600',
}

const errMsg = (err: any, fallback: string, t: (key: string) => string): string => {
  const s = err?.response?.status
  const m = err?.response?.data?.message
  if (s === 401) return t('adminReportContent.errors.unauthorized')
  if (s === 403) return t('adminReportContent.errors.accessDenied')
  return m || err?.message || fallback
}

export const SuperAdminReportContentPage: React.FC = () => {
  const { t, tEnum } = useTranslation()
  const [list, setList] = useState<ReportContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = usePageParam('page', 0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [status, setStatus] = useState<ReportStatus | ''>('')
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState<ReportPriority | ''>('')
  const [reviewing, setReviewing] = useState<ReportContentItem | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await superAdminService.getReportedContent({
        search: search || undefined,
        page,
        size: PAGE_SIZE,
        status: status || undefined,
        priority: priority || undefined,
      })
      setList(result.data)
      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)
    } catch (e: any) {
      setError(errMsg(e, t('adminReportContent.errors.loadFailed'), t))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, priority, search])

  return (
    <div className='p-6 space-y-4'>
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
        <div className='flex flex-col md:flex-row gap-3'>
          <AdminSearchBox
            value={search}
            onSearch={(term) => {
              setPage(0)
              setSearch(term)
            }}
            placeholder={t('adminReportContent.filters.searchPlaceholder')}
          />
          <select
            value={status}
            onChange={(e) => {
              setPage(0)
              setStatus(e.target.value as ReportStatus | '')
            }}
            className='px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value ? tEnum(o.value) : t('adminReportContent.filters.allStatuses')}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => {
              setPage(0)
              setPriority(e.target.value as ReportPriority | '')
            }}
            className='px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value ? tEnum(o.value) : t('adminReportContent.filters.allPriorities')}
              </option>
            ))}
          </select>
        </div>
        <p className='text-xs text-gray-500 mt-3'>
          {t('adminReportContent.showing', { shown: list.length, total: totalItems.toLocaleString() })}
        </p>
      </div>

      {loading ? (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center text-gray-500'>{t('common.status.loading')}</div>
      ) : error ? (
        <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl'>{error}</div>
      ) : list.length === 0 ? (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center text-gray-500'>
          <ShieldCheckIcon className='h-10 w-10 text-green-500 mx-auto mb-2' />
          {t('adminReportContent.empty')}
        </div>
      ) : (
        <div className='space-y-3'>
          {list.map((r) => (
            <div key={r.id} className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
              <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
                <div className='flex-1'>
                  <div className='flex flex-wrap items-center gap-2 mb-2'>
                    <span className='text-sm font-semibold text-gray-900'>{tEnum(r.reportType || 'CONTENT')}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[r.priority] || 'bg-gray-100 text-gray-700'}`}>
                      {tEnum(r.priority)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[r.status] || 'bg-gray-100 text-gray-600'}`}>
                      {tEnum(r.status)}
                    </span>
                  </div>
                  <p className='text-sm text-gray-900 mb-1'>
                    <strong>{t('adminReportContent.card.reason')}</strong> {r.reason ? tEnum(r.reason) : '—'}
                  </p>
                  {r.description && (
                    <p className='text-sm text-gray-600 mb-2'>{r.description}</p>
                  )}
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500 mt-2'>
                    <div>
                      <p className='font-medium text-gray-700'>{t('adminReportContent.card.reporter')}</p>
                      <p>{r.reporterName || '—'}</p>
                    </div>
                    <div>
                      <p className='font-medium text-gray-700'>{t('adminReportContent.card.reported')}</p>
                      <p>{r.reportedUserName || '—'}</p>
                    </div>
                    <div>
                      <p className='font-medium text-gray-700'>{t('adminReportContent.card.reviewer')}</p>
                      <p>{r.reviewedByName || '—'}</p>
                    </div>
                    {r.actionTaken && (
                      <div>
                        <p className='font-medium text-gray-700'>{t('adminReportContent.card.action')}</p>
                        <p>{tEnum(r.actionTaken)}</p>
                      </div>
                    )}
                  </div>
                  {r.resolutionNotes && (
                    <div className='mt-3 p-2 bg-gray-50 rounded text-xs'>
                      <strong>{t('adminReportContent.card.notes')}</strong> {r.resolutionNotes}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setReviewing(r)}
                  className='px-3 py-1.5 text-sm font-medium bg-[#E36A3A] text-white rounded-lg hover:bg-[#C95428] flex items-center gap-1 flex-shrink-0'>
                  <EditIcon className='h-4 w-4' /> {t('adminReportContent.card.review')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}

      {reviewing && (
        <ReviewModal
          report={reviewing}
          onClose={() => setReviewing(null)}
          onSaved={() => {
            setReviewing(null)
            load()
          }}
        />
      )}
    </div>
  )
}

const ReviewModal: React.FC<{
  report: ReportContentItem
  onClose: () => void
  onSaved: () => void
}> = ({ report, onClose, onSaved }) => {
  const { t, tEnum } = useTranslation()
  const [status, setStatus] = useState<ReportStatus>(report.status || 'IN_REVIEW')
  const [priority, setPriority] = useState<ReportPriority>(report.priority || 'MEDIUM')
  const [resolutionNotes, setResolutionNotes] = useState(report.resolutionNotes || '')
  const [actionTaken, setActionTaken] = useState(report.actionTaken || 'NO_ACTION')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const save = async () => {
    try {
      setSaving(true)
      setErr(null)
      const payload: ReportReviewPayload = {
        status, priority,
        resolutionNotes: resolutionNotes.trim() || undefined,
        actionTaken: actionTaken || undefined,
      }
      await superAdminService.reviewReportedContent(report.id, payload)
      onSaved()
    } catch (e: any) {
      setErr(errMsg(e, t('adminReportContent.errors.updateFailed'), t))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4' onClick={onClose}>
      <div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-bold text-gray-900'>{t('adminReportContent.modal.title')}</h2>
          <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded'>
            <XIcon className='h-5 w-5' />
          </button>
        </div>
        <p className='text-sm text-gray-600 mb-4'>
          <strong>{report.reason ? tEnum(report.reason) : '—'}</strong>
          {report.reportedUserName ? ` · ${report.reportedUserName}` : ''}
        </p>
        <div className='space-y-3'>
          <div>
            <label className='text-xs font-medium text-gray-600'>{t('common.labels.status')}</label>
            <select
              value={status} onChange={(e) => setStatus(e.target.value as ReportStatus)}
              className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
              {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                <option key={o.value} value={o.value}>{tEnum(o.value)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className='text-xs font-medium text-gray-600'>{t('adminReportContent.modal.priority')}</label>
            <select
              value={priority} onChange={(e) => setPriority(e.target.value as ReportPriority)}
              className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
              {PRIORITY_OPTIONS.filter((o) => o.value).map((o) => (
                <option key={o.value} value={o.value}>{tEnum(o.value)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className='text-xs font-medium text-gray-600'>{t('adminReportContent.modal.actionTaken')}</label>
            <select
              value={actionTaken} onChange={(e) => setActionTaken(e.target.value)}
              className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
              {ACTION_OPTIONS.map((a) => (
                <option key={a} value={a}>{tEnum(a)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className='text-xs font-medium text-gray-600'>{t('adminReportContent.modal.resolutionNotes')}</label>
            <textarea
              value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} rows={3}
              placeholder={t('adminReportContent.modal.notesPlaceholder')}
              className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
            />
          </div>
          {err && <div className='text-sm text-red-600 bg-red-50 p-2 rounded'>{err}</div>}
        </div>
        <div className='mt-6 flex justify-end gap-2'>
          <button onClick={onClose} className='px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50'>
            {t('common.actions.cancel')}
          </button>
          <button
            onClick={save} disabled={saving}
            className='px-4 py-2 text-sm font-medium bg-[#E36A3A] text-white rounded-lg hover:bg-[#C95428] disabled:opacity-50'>
            {saving ? t('common.actions.saving') : t('common.actions.save')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminReportContentPage
