import React, { useState, useRef } from 'react'
import { toast } from 'react-toastify'
import uploadService, { UPLOAD_LIMITS_MB, UploadType } from '@/services/uploadService'
import Icon from '@/components/Icon'
import { useTranslation } from '@/i18n'

interface VideoUploadProps {
  currentVideoUrl?: string
  uploadType: UploadType
  label: string
  description?: string
  onUploadSuccess: (fileUrl: string) => void
  auditionId?: number
  maxSizeMB?: number
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  currentVideoUrl,
  uploadType,
  label,
  description,
  onUploadSuccess,
  auditionId,
  maxSizeMB = UPLOAD_LIMITS_MB.video,
}) => {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | undefined>(currentVideoUrl)
  const [fileName, setFileName] = useState<string | undefined>(
    currentVideoUrl ? currentVideoUrl.split('/').pop() : undefined
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = uploadService.validateFile(file, 'video')
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    // Show preview
    const previewUrl = URL.createObjectURL(file)
    setVideoUrl(previewUrl)
    setFileName(file.name)

    try {
      setUploading(true)
      setProgress(0)

      const fileUrl = await uploadService.uploadFile(
        file,
        uploadType,
        (progressPercent) => setProgress(progressPercent),
        auditionId
      )

      // Replace preview URL with actual S3 URL
      URL.revokeObjectURL(previewUrl)
      setVideoUrl(fileUrl)

      toast.success(t('fileUpload.video.uploadSuccess'))
      onUploadSuccess(fileUrl)
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error(t('fileUpload.video.uploadFailed'))
      URL.revokeObjectURL(previewUrl)
      setVideoUrl(currentVideoUrl)
      setFileName(currentVideoUrl?.split('/').pop())
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleRemove = () => {
    if (videoUrl && videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl)
    }
    setVideoUrl(undefined)
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

      <p className="flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0" />
        <span>
          {t('fileUpload.video.hintBefore')}
          <strong>{t('fileUpload.video.hintSize', { size: maxSizeMB })}</strong>
          {t('fileUpload.video.hintAfter')}
        </span>
      </p>

      <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50">
        {videoUrl ? (
          // Video preview
          <div className="relative">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full aspect-video bg-black"
            />

            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
                  <p className="text-sm font-semibold">{t('fileUpload.video.uploading')}</p>
                  <div className="mt-3 w-64 mx-auto">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1">{progress}%</p>
                  </div>
                </div>
              </div>
            )}

            {!uploading && (
              <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="Video" size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-xs">
                      {fileName}
                    </p>
                    <p className="text-xs text-green-600 font-medium">{t('fileUpload.uploaded')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    {t('fileUpload.replace')}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {t('common.actions.remove')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Upload prompt
          <div className="p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Icon name="Video" size={36} className="text-gray-400" />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-block px-6 py-3 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {t('fileUpload.video.upload')}
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>
    </div>
  )
}

export default VideoUpload
