import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { AccountStatus } from '../../services/superAdminService'
import { useTranslation } from '@/i18n'

// Shared row actions for the admin's Artists and Recruiters tables:
// change the account status (Active / Inactive / Suspended / Banned) or
// delete the account outright.

// Labels come from tEnum(value); the value is what the API receives.
const STATUS_CHOICES: AccountStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED']

interface Props {
  status: AccountStatus
  name: string
  // 'artist' | 'recruiter' — only used in the confirmation wording
  kind: string
  onChangeStatus: (status: AccountStatus, reason?: string) => Promise<void>
  onDelete: (reason?: string) => Promise<void>
}

export const UserModerationActions: React.FC<Props> = ({
  status,
  name,
  kind,
  onChangeStatus,
  onDelete,
}) => {
  const { t, tEnum } = useTranslation()
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [reason, setReason] = useState('')

  const changeStatus = async (next: AccountStatus) => {
    if (next === status) return
    // Blocking someone out of their account deserves a reason for the audit trail
    let note: string | undefined
    if (next !== 'ACTIVE') {
      const input = window.prompt(
        t('adminModeration.reasonPrompt', { name, status: tEnum(next).toLowerCase() }),
        '',
      )
      if (input === null) return // cancelled
      note = input.trim() || undefined
    }
    try {
      setBusy(true)
      await onChangeStatus(next, note)
      toast.success(t('adminModeration.statusChanged', { name, status: tEnum(next).toLowerCase() }))
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('adminModeration.statusUpdateFailed'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    try {
      setBusy(true)
      await onDelete(reason.trim() || undefined)
      toast.success(t('adminModeration.deleted', { name }))
      setConfirmDelete(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('adminModeration.deleteFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className='flex items-center gap-2'>
        <select
          value={status}
          disabled={busy}
          onChange={e => changeStatus(e.target.value as AccountStatus)}
          title={t('adminModeration.changeStatusTitle')}
          className='px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#E36A3A] disabled:opacity-50'>
          {STATUS_CHOICES.map(value => (
            <option key={value} value={value}>
              {tEnum(value)}
            </option>
          ))}
        </select>
        <button
          onClick={() => setConfirmDelete(true)}
          disabled={busy}
          className='text-xs font-medium text-red-600 hover:underline disabled:opacity-50 whitespace-nowrap'>
          {t('common.actions.delete')}
        </button>
      </div>

      {confirmDelete && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
          onClick={() => !busy && setConfirmDelete(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md p-6' onClick={e => e.stopPropagation()}>
            <h3 className='text-lg font-bold text-gray-900'>
              {t('adminModeration.deleteTitle', {
                kind: kind === 'artist' || kind === 'recruiter' ? t(`adminModeration.kinds.${kind}`) : kind,
              })}
            </h3>
            <p className='text-sm text-gray-600 mt-2'>
              {t('adminModeration.deleteBody.before')}
              <span className='font-semibold'>{name}</span>
              {t('adminModeration.deleteBody.after')}
            </p>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={2}
              placeholder={t('adminModeration.reasonPlaceholder')}
              className='w-full mt-4 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
            />
            <div className='flex justify-end gap-3 mt-5'>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={busy}
                className='px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100'>
                {t('common.actions.cancel')}
              </button>
              <button
                onClick={remove}
                disabled={busy}
                className='px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50'>
                {busy ? t('common.actions.deleting') : t('common.actions.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UserModerationActions
