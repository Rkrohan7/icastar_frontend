import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { Card } from '../../components/Card'
import { Recruiter, VerificationStatus } from '../../types'
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '../../components/icons/IconComponents'
import { getRecruiterProfile, updateRecruiterProfile } from '@/services/recruiterProfileService'
import uploadService, { UPLOAD_LIMITS_MB } from '@/services/uploadService'
import { Info } from 'lucide-react'
import { useTranslation } from '@/i18n'

const initialRecruiterData: Recruiter = {
  name: 'Alex Morgan',
  title: 'Recruiter',
  email: 'alex.morgan@creativ.com',
  avatarUrl: 'https://picsum.photos/seed/recruiter/100/100',
  companyName: 'Creativ Inc.',
  companyWebsite: 'https://creativ.com',
  companyBio:
    "Creativ is a platform connecting the world's best artists with innovative companies. We believe in the power of creativity to drive progress.",
  verificationStatus: 'Not Verified',
  recruiterType: 'In-house',
}

interface InputFieldProps {
  label: string
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  autoComplete?: string
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  value,
  onChange,
  type = 'text',
  autoComplete = 'off',
}) => (
  <div>
    <label htmlFor={id} className='block text-sm font-medium text-gray-700'>
      {label}
    </label>
    <input
      type={type}
      name={id}
      id={id}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      className='mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm px-3 py-2.5'
    />
  </div>
)

interface TextAreaFieldProps {
  label: string
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
}
const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  id,
  value,
  onChange,
  rows = 4,
}) => (
  <div>
    <label htmlFor={id} className='block text-sm font-medium text-gray-700'>
      {label}
    </label>
    <textarea
      rows={rows}
      name={id}
      id={id}
      value={value}
      onChange={onChange}
      className='mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm px-3 py-2.5'
    />
  </div>
)

const VerificationStatusCard: React.FC<{ status: VerificationStatus }> = ({
  status,
}) => {
  const { t } = useTranslation()
  const statusConfig = {
    Verified: {
      text: t('recruiterProfile.verification.verified.text'),
      description: t('recruiterProfile.verification.verified.description'),
      icon: CheckCircleIcon,
      colorClasses: 'bg-green-50 border-green-200 text-green-800',
      iconColor: 'text-green-500',
    },
    Pending: {
      text: t('recruiterProfile.verification.pending.text'),
      description: t('recruiterProfile.verification.pending.description'),
      icon: ClockIcon,
      colorClasses: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      iconColor: 'text-yellow-500',
    },
    'Not Verified': {
      text: t('recruiterProfile.verification.notVerified.text'),
      description: t('recruiterProfile.verification.notVerified.description'),
      icon: ExclamationCircleIcon,
      colorClasses: 'bg-red-50 border-red-200 text-red-800',
      iconColor: 'text-red-500',
    },
  }

  const config = statusConfig[status] || statusConfig['Not Verified']
  const Icon = config.icon

  return (
    <div
      className={`flex items-center p-3 rounded-lg border ${config.colorClasses}`}>
      <Icon className={`h-6 w-6 mr-3 flex-shrink-0 ${config.iconColor}`} />
      <div className='flex-grow'>
        <p className={`font-semibold text-sm`}>{config.text}</p>
        <p className='text-sm opacity-80'>{config.description}</p>
      </div>
    </div>
  )
}

export const RecruiterProfilePage = () => {
  const { t } = useTranslation()
  const [recruiter, setRecruiter] = useState<Recruiter>(initialRecruiterData)
  const [formData, setFormData] = useState<Recruiter>(recruiter)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const faceProofInputRef = useRef<HTMLInputElement>(null)
  const idProofInputRef = useRef<HTMLInputElement>(null)
  const [verificationUpload, setVerificationUpload] = useState<'FACE' | 'ID_PROOF' | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getRecruiterProfile()
        setRecruiter(data)
        setFormData(data)
      } catch (e: any) {
        setError(e?.message || t('recruiterProfile.errors.loadFailed'))
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = uploadService.validateFile(file, 'image')
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)
      const fileUrl = await uploadService.uploadFile(file, 'PROFILE_PHOTO', setUploadProgress)

      // Immediately save the new photo to the backend
      const updated = await updateRecruiterProfile({ profilePhotoUrl: fileUrl })
      setRecruiter(updated)
      setFormData(prev => ({ ...prev, avatarUrl: fileUrl }))
      // Notify header to update avatar instantly
      window.dispatchEvent(new CustomEvent('recruiter-photo-updated', { detail: { url: fileUrl } }))
      toast.success(t('recruiterProfile.toast.photoUpdated'))
    } catch (err: any) {
      toast.error(t('recruiterProfile.toast.photoUploadFailed'))
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteAvatar = () => {
    setFormData(prev => ({ ...prev, avatarUrl: '' }))
  }

  const handleVerificationUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'FACE' | 'ID_PROOF',
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    const fileKind = type === 'FACE' ? 'image' : 'document'
    const validation = uploadService.validateFile(file, fileKind)
    if (!validation.valid) {
      toast.error(validation.error)
      event.target.value = ''
      return
    }

    try {
      setVerificationUpload(type)
      const fileUrl = await uploadService.uploadFile(
        file,
        type === 'FACE' ? 'FACE_VERIFICATION' : 'ID_PROOF',
        setUploadProgress,
      )
      const updated = await updateRecruiterProfile(
        type === 'FACE'
          ? { faceVerificationUrl: fileUrl }
          : { idProofUrl: fileUrl },
      )
      setRecruiter(updated)
      setFormData(updated)
      toast.success(`${type === 'FACE' ? 'Face verification' : 'ID proof'} submitted for review.`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Verification document upload failed.')
    } finally {
      setVerificationUpload(null)
      setUploadProgress(0)
      event.target.value = ''
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await updateRecruiterProfile({
        contactPersonName: formData.name,
        designation: formData.title,
        email: formData.email,
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        companyDescription: formData.companyBio,
        profilePhotoUrl: formData.avatarUrl,
      })
      // Re-fetch profile to get the latest saved data from backend
      const latest = await getRecruiterProfile()
      // Preserve avatarUrl if backend doesn't echo it back
      const merged = { ...latest, avatarUrl: latest.avatarUrl || formData.avatarUrl }
      setRecruiter(merged)
      setFormData(merged)
      toast.success(t('recruiterProfile.toast.saved'))
    } catch (err: any) {
      toast.error(err?.message || t('recruiterProfile.errors.saveFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(recruiter)
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <h2 className='text-3xl font-bold text-gray-900 mb-6'>{t('common.nav.myProfile')}</h2>

      {error && (
        <div className='mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm'>
          {error}
        </div>
      )}

      <div className='space-y-8'>
        <VerificationStatusCard
          status={formData.verificationStatus || 'Not Verified'}
        />

        <Card>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>Identity verification</h3>
          <p className='text-sm text-gray-500 mb-5'>
            Your recruiter account is verified only after both your face and government ID are approved.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <input
              ref={faceProofInputRef}
              type='file'
              accept='image/jpeg,image/jpg,image/png,image/webp'
              className='hidden'
              onChange={event => void handleVerificationUpload(event, 'FACE')}
            />
            <input
              ref={idProofInputRef}
              type='file'
              accept='application/pdf,image/jpeg,image/jpg,image/png'
              className='hidden'
              onChange={event => void handleVerificationUpload(event, 'ID_PROOF')}
            />
            {([
              {
                type: 'FACE' as const,
                label: 'Face verification',
                status: formData.faceVerificationStatus,
                verified: formData.isFaceVerified,
                url: formData.faceVerificationUrl,
                input: faceProofInputRef,
              },
              {
                type: 'ID_PROOF' as const,
                label: 'ID proof',
                status: formData.idProofVerificationStatus,
                verified: formData.idProofVerified,
                url: formData.idProofUrl,
                input: idProofInputRef,
              },
            ]).map(item => {
              const approved = item.verified === true || item.status?.toUpperCase() === 'APPROVED'
              const rejected = item.status?.toUpperCase() === 'REJECTED'
              const pending = item.status?.toUpperCase() === 'PENDING' || (Boolean(item.url) && !rejected)
              return (
                <div key={item.type} className='rounded-xl border border-gray-200 p-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='font-semibold text-gray-900'>{item.label}</p>
                      <p className={`mt-1 text-sm ${approved ? 'text-green-700' : pending ? 'text-amber-700' : 'text-gray-500'}`}>
                        {approved
                          ? `${item.type === 'FACE' ? 'Face' : 'ID'} Verified`
                          : rejected ? 'Rejected — please submit again' : pending ? 'Pending verification' : 'Not submitted'}
                      </p>
                    </div>
                    {item.url && (
                      <a href={item.url} target='_blank' rel='noreferrer' className='text-sm font-medium text-primary hover:underline'>
                        View
                      </a>
                    )}
                  </div>
                  {!approved && (
                    <button
                      type='button'
                      disabled={verificationUpload !== null}
                      onClick={() => item.input.current?.click()}
                      className='mt-4 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50'>
                      {verificationUpload === item.type
                        ? `Uploading ${uploadProgress}%`
                        : pending ? 'Replace submission' : `Submit ${item.type === 'FACE' ? 'face photo' : 'ID proof'}`}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>
            {t('recruiterProfile.personal.title')}
          </h3>
          <p className='text-sm text-gray-500 mb-6'>
            {t('recruiterProfile.personal.subtitle')}
          </p>

          <div className='flex items-center gap-6 mb-8'>
            <input
              type='file'
              ref={fileInputRef}
              className='hidden'
              accept='image/jpeg,image/jpg,image/png,image/webp'
              onChange={handleAvatarFileChange}
            />

            {/* Avatar preview */}
            <div className='relative flex-shrink-0'>
              {formData.avatarUrl ? (
                <img
                  className='h-20 w-20 rounded-full object-cover ring-2 ring-gray-200'
                  src={formData.avatarUrl}
                  alt={t('recruiterProfile.photo.alt')}
                />
              ) : (
                <div className='h-20 w-20 rounded-full bg-gray-100 ring-2 ring-gray-200 flex items-center justify-center'>
                  <svg className='h-10 w-10 text-gray-400' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8c0 2.208-1.792 4-3.998 4-2.208 0-4-1.792-4-4s1.792-4 4-4c2.206 0 3.998 1.792 3.998 4z' />
                  </svg>
                </div>
              )}
              {isUploading && (
                <div className='absolute inset-0 rounded-full bg-black/50 flex items-center justify-center'>
                  <span className='text-white text-xs font-bold'>{uploadProgress}%</span>
                </div>
              )}
            </div>

            {/* Upload buttons */}
            <div>
              {!formData.avatarUrl ? (
                <button
                  type='button'
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50'>
                  {t('recruiterProfile.photo.add')}
                </button>
              ) : (
                <div className='flex gap-2'>
                  <button
                    type='button'
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50'>
                    {isUploading
                      ? t('recruiterProfile.photo.uploadingProgress', { progress: uploadProgress })
                      : t('recruiterProfile.photo.change')}
                  </button>
                  <button
                    type='button'
                    disabled={isUploading}
                    onClick={handleDeleteAvatar}
                    className='px-4 py-2 border border-red-200 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50'>
                    {t('recruiterProfile.photo.delete')}
                  </button>
                </div>
              )}

              {isUploading && (
                <div className='mt-2 w-48 bg-gray-200 rounded-full h-1.5'>
                  <div
                    className='bg-primary h-1.5 rounded-full transition-all duration-300'
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <p className='mt-3 flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2'>
                <Info size={14} className='mt-0.5 flex-shrink-0' />
                <span>
                  {t('recruiterProfile.photo.sizeHintBefore')}
                  <strong>{t('recruiterProfile.photo.sizeHintLimit', { size: UPLOAD_LIMITS_MB.image })}</strong>
                  {t('recruiterProfile.photo.sizeHintAfter')}
                </span>
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            <InputField
              label={t('common.labels.fullName')}
              id='name'
              value={formData.name || ''}
              onChange={handleChange}
            />
            <InputField
              label={t('common.labels.title')}
              id='title'
              value={formData.title || ''}
              onChange={handleChange}
            />
            <div className='sm:col-span-1'>
              <label
                htmlFor='recruiterType'
                className='block text-sm font-medium text-gray-700'>
                {t('recruiterProfile.fields.recruiterType')}
              </label>
              <select
                id='recruiterType'
                name='recruiterType'
                value={formData.recruiterType || 'In-house'}
                onChange={handleChange}
                className='mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm px-3 py-2.5 pr-10'>
                <option value='In-house'>{t('recruiterProfile.recruiterTypes.inHouse')}</option>
                <option value='Agency'>{t('recruiterProfile.recruiterTypes.agency')}</option>
                <option value='Freelance'>{t('recruiterProfile.recruiterTypes.freelance')}</option>
              </select>
            </div>
            <div className='sm:col-span-1'>
              <InputField
                label={t('recruiterProfile.fields.email')}
                id='email'
                type='email'
                value={formData.email || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>
            {t('recruiterProfile.company.title')}
          </h3>
          <p className='text-sm text-gray-500 mb-6'>
            {t('recruiterProfile.company.subtitle')}
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            <div className='sm:col-span-2'>
              <InputField
                label={t('recruiterProfile.fields.companyName')}
                id='companyName'
                value={formData.companyName || ''}
                onChange={handleChange}
              />
            </div>
            <div className='sm:col-span-2'>
              <InputField
                label={t('recruiterProfile.fields.companyWebsite')}
                id='companyWebsite'
                type='url'
                value={formData.companyWebsite || ''}
                onChange={handleChange}
              />
            </div>
            <div className='sm:col-span-2'>
              <TextAreaField
                label={t('recruiterProfile.fields.companyBio')}
                id='companyBio'
                value={formData.companyBio || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className='mt-8 pt-5 border-t border-gray-200 flex justify-end gap-3'>
        <button
          onClick={handleCancel}
          className='px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors'>
          {t('common.actions.cancel')}
        </button>
        <button
          onClick={handleSave}
          disabled={loading || isUploading}
          className='inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed'>
          {loading ? t('common.actions.saving') : t('common.actions.saveChanges')}
        </button>
      </div>
    </div>
  )
}
