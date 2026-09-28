import React, { useState } from 'react'
import { HireRequestStatus } from '@/types'
import Icon from './Icon'
import { useTranslation } from '@/i18n'

const STATUS_OPTIONS: HireRequestStatus[] = [
  'PENDING',
  'VIEWED',
  'ACCEPTED',
  'DECLINED',
  'HIRED',
  'WITHDRAWN',
  'EXPIRED',
]

interface UpdateStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (status: HireRequestStatus, notes?: string) => void
  currentStatus: HireRequestStatus
  artistName: string
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  currentStatus,
  artistName,
}) => {
  const { t, tEnum } = useTranslation()
  const [selectedStatus, setSelectedStatus] = useState<HireRequestStatus>(currentStatus)
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    onUpdate(selectedStatus, notes.trim() || undefined)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{t('updateStatusModal.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            {t('updateStatusModal.descriptionBefore')}<span className="font-semibold">{artistName}</span>{t('updateStatusModal.descriptionAfter')}
          </p>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.labels.status')}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as HireRequestStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>
                  {tEnum(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('updateStatusModal.notesLabel')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={t('updateStatusModal.notesPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('common.actions.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover"
          >
            {t('updateStatusModal.submit')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpdateStatusModal
