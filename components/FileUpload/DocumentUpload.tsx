import React, { useState, useRef } from 'react'
import { toast } from 'react-toastify'
import uploadService, { UPLOAD_LIMITS_MB, UploadType } from '@/services/uploadService'
import Icon from '@/components/Icon'
import { useTranslation } from '@/i18n'

interface DocumentUploadProps {
  currentDocumentUrl?: string
  uploadType: UploadType
  label: string
  description?: string
  onUploadSuccess: (fileUrl: string) => void
  acceptedTypes?: string
  maxSizeMB?: number
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  currentDocumentUrl,
  uploadType,
  label,
  description,
  onUploadSuccess,
  acceptedTypes = 'application/pdf,image/jpeg,image/jpg,image/png',
  maxSizeMB = UPLOAD_LIMITS_MB.document,
}) => {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | undefined>(
    currentDocumentUrl ? currentDocumentUrl.split('/').pop() : undefined
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = uploadService.validateFile(file, 'document')
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    setFileName(file.name)

    try {
      setUploading(true)
      setProgress(0)

      let fileUrl: string
      if (uploadType === 'ID_PROOF') {
        fileUrl = await uploadService.uploadIdProof(
          file,
          (progressPercent) => setProgress(progressPercent)
        )
      } else {
        fileUrl = await uploadService.uploadFile(
          file,
          uploadType,
          (progressPercent) => setProgress(progressPercent)
        )
      }

      toast.success(t('fileUpload.document.uploadSuccess'))
      onUploadSuccess(fileUrl)
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error(t('fileUpload.document.uploadFailed'))
      setFileName(currentDocumentUrl?.split('/').pop()) // Revert to original
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleRemove = () => {
    setFileName(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onUploadSuccess('')
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
        {fileName ? (
          // Uploaded file display
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={24} className="text-amber-600" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{fileName}</p>
              {uploading ? (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{progress}%</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-green-600 font-medium mt-1">{t('fileUpload.uploaded')}</p>
              )}
            </div>

            {!uploading && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  title={t('fileUpload.replace')}
                >
                  <Icon name="RefreshCw" size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('common.actions.remove')}
                >
                  <Icon name="Trash2" size={18} />
                </button>
              </div>
            )}
          </div>
        ) : (
          // Upload prompt
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Icon name="Upload" size={28} className="text-gray-400" />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-sm font-semibold text-amber-600 hover:text-amber-700 disabled:text-gray-400"
            >
              {t('fileUpload.document.clickToUpload')}
            </button>
            <p className="text-xs text-gray-500 mt-1">{t('fileUpload.document.orDragDrop')}</p>
            <p className="text-xs text-gray-400 mt-2">
              {t('fileUpload.document.formats', { size: maxSizeMB })}
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>
    </div>
  )
}

export default DocumentUpload
