import React, { useState, useRef } from 'react'
import { toast } from 'react-toastify'
import uploadService, { UploadType, UPLOAD_LIMITS_MB } from '@/services/uploadService'
import Icon from '@/components/Icon'
import { useTranslation } from '@/i18n'

interface ImageUploadProps {
  currentImageUrl?: string
  uploadType: UploadType
  label: string
  onUploadSuccess: (fileUrl: string) => void
  aspectRatio?: 'square' | 'circle' | 'wide' // square = 1:1, circle = 1:1 rounded, wide = 16:9
  maxSizeMB?: number
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  uploadType,
  label,
  onUploadSuccess,
  aspectRatio = 'square',
  maxSizeMB = UPLOAD_LIMITS_MB.image,
}) => {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = uploadService.validateFile(file, 'image')
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      setUploading(true)
      setProgress(0)

      let fileUrl: string
      if (uploadType === 'PROFILE_PHOTO') {
        fileUrl = await uploadService.uploadArtistProfilePhoto(
          file,
          (progressPercent) => setProgress(progressPercent)
        )
      } else if (uploadType === 'COVER_PHOTO') {
        fileUrl = await uploadService.uploadCoverPhoto(
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

      toast.success(t('fileUpload.image.uploadSuccess'))
      onUploadSuccess(fileUrl)
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error(t('fileUpload.image.uploadFailed'))
      setPreviewUrl(currentImageUrl) // Revert to original
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onUploadSuccess('')
  }

  const getContainerClass = () => {
    if (aspectRatio === 'circle') {
      return 'w-32 h-32 rounded-full'
    }
    if (aspectRatio === 'wide') {
      return 'w-full aspect-video rounded-xl'
    }
    return 'w-32 h-32 rounded-xl'
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>

      <p className="flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-left">
        <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0" />
        <span>
          {t('fileUpload.image.hintBefore')}
          <strong>{t('fileUpload.image.hintSize', { size: maxSizeMB })}</strong>
          {t('fileUpload.image.hintAfter')}
        </span>
      </p>

      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className={`relative ${getContainerClass()} border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50`}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={t('fileUpload.image.previewAlt')}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="Image" size={32} className="text-gray-400" />
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-xs font-semibold">{progress}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Upload/Remove Buttons */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {previewUrl ? t('fileUpload.image.change') : t('fileUpload.image.upload')}
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              {t('common.actions.remove')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageUpload
