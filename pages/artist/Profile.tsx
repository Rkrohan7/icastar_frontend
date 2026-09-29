import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Icon from '@/components/Icon'
import artistService from '@/services/artistService'
import artistDashboardService from '@/services/artistDashboardService'
import uploadService from '@/services/uploadService'
import { ImageUpload, DocumentUpload, VideoUpload } from '@/components/FileUpload'
import ExperienceSection, {
  experienceYearsByProfession,
  formatMonths,
  totalExperienceMonths,
  totalExperienceYears,
} from '@/components/experience/ExperienceSection'
import type { ArtistEducation, ArtistExperience } from '@/services/artistService'
import EducationSection from '@/components/education/EducationSection'
import { dateLocale, useTranslation } from '@/i18n'

interface ArtistProfile {
  category: string
  fullName: string
  firstName?: string
  lastName?: string
  stageName?: string
  email: string
  phone: string
  gender: string
  city: string
  languages: string
  bio: string
  profilePhoto?: string
  coverPhoto?: string
  idProof?: string
  idProofVerified?: boolean
  faceVerification?: string
  isVerifiedBadge?: boolean
  isProfileComplete?: boolean
  // Actor specific
  actorType?: 'skilled' | 'known'
  age?: number
  dateOfBirth?: string
  height?: string
  weight?: number
  hairColor?: string
  hairLength?: string
  hasTattoo?: boolean
  hasMole?: boolean
  shoeSize?: string
  eyeColor?: string
  complexion?: string
  hasPassport?: boolean
  // Dancer specific
  danceStyles?: string[]
  experienceYears?: string
  danceVideo?: string
  // Additional fields
  skills?: string
  maritalStatus?: string
  comfortableAreas?: string
  travelCities?: string
  portfolioUrls?: string[]
  videoUrl?: string
  projectsWorked?: string[]
  hourlyRate?: number
  totalApplications?: number
  successfulHires?: number
  artistTypeId?: number
  artistType?: {
    id: number
    name: string
    displayName: string
    fields?: {
      name: string
      label: string
      type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'FILE' | 'URL' | 'BOOLEAN'
      required?: boolean
      placeholder?: string
      options?: string[]
    }[]
  }
  professions?: { id?: number; name?: string; displayName: string; experienceYears?: number }[]
  experiences?: ArtistExperience[]
  educations?: ArtistEducation[]
  dynamicFields?: { fieldName: string; value: any }[]
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ArtistProfile | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<ArtistProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false)
  const navigate = useNavigate()
  const { t, tEnum } = useTranslation()

  // Face Verification state
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [faceVerifyStatus, setFaceVerifyStatus] = useState<'idle' | 'captured' | 'uploading' | 'submitted'>('idle')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [localFaceVerified, setLocalFaceVerified] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [areaInput, setAreaInput] = useState('')
  const [apiCompletionPercentage, setApiCompletionPercentage] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const parseSkillsArray = (val?: string): string[] => {
    if (!val) return []
    const unwrap = (s: string, depth = 0): string[] => {
      if (depth > 8) return s.trim() ? [s.trim()] : []
      const t = s.trim()
      if (!t) return []
      try {
        const p = JSON.parse(t)
        if (Array.isArray(p)) return p.flatMap(x => unwrap(String(x), depth + 1)).filter(Boolean)
        if (typeof p === 'string') return unwrap(p, depth + 1)
        return [String(p).trim()].filter(Boolean)
      } catch { }
      if (t.startsWith('[')) {
        const hits = [...t.matchAll(/"((?:[^"\\]|\\.)*)"/g)]
        if (hits.length > 0)
          return hits.flatMap(m => unwrap(m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\'), depth + 1)).filter(Boolean)
      }
      if (t.includes(',')) return t.split(',').map(x => x.trim()).filter(Boolean)
      return [t]
    }
    return unwrap(val)
  }
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const fetchProfile = useCallback(async () => {
    try {
      const data = await artistService.getMyProfile()
      if (!data) {
        setProfile(null)
        return
      }
      // Capture userId — needed to build the public shareable profile link
      if (data.userId) setUserId(data.userId)
      // Calculate age from dateOfBirth
      const calculateAge = (dob: string | undefined): number | undefined => {
        if (!dob) return undefined
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        return age
      }

      const normalized: ArtistProfile = {
        category: data.category ?? data.artistType?.displayName ?? '',
        fullName: data.fullName ?? '',
        firstName: data.firstName,
        lastName: data.lastName,
        stageName: data.stageName,
        email: data.email ?? '',
        phone: data.phone ?? '',
        gender: data.gender ?? '',
        city: data.city ?? data.location ?? '',
        languages: (() => {
          try {
            if (Array.isArray(data.languages)) {
              return data.languages.join(', ')
            }
            if (Array.isArray(data.languagesSpoken)) {
              return data.languagesSpoken.join(', ')
            }
            if (typeof data.languagesSpoken === 'string' && data.languagesSpoken.startsWith('[')) {
              return JSON.parse(data.languagesSpoken).join(', ')
            }
            return (data.languages as string) ?? ''
          } catch (e) {
            console.error('Error parsing languages:', e)
            return (data.languages as string) ?? ''
          }
        })(),
        bio: data.bio ?? '',
        profilePhoto: data.profilePhoto ?? data.profileUrl ?? data.avatarUrl ?? undefined,
        coverPhoto: data.coverPhoto ?? undefined,
        idProof: data.idProof ?? undefined,
        idProofVerified: data.idProofVerified ?? false,
        faceVerification: data.faceVerification ?? undefined,
        isVerifiedBadge: data.isVerifiedBadge,
        isProfileComplete: data.isProfileComplete,
        actorType: data.actorType,
        age: data.age ?? calculateAge(data.dateOfBirth),
        dateOfBirth: data.dateOfBirth,
        height: data.height ?? undefined,
        weight: data.weight ?? undefined,
        hairColor: data.hairColor,
        hairLength: data.hairLength,
        hasTattoo: data.hasTattoo,
        hasMole: data.hasMole,
        shoeSize: data.shoeSize,
        eyeColor: data.eyeColor,
        complexion: data.complexion,
        hasPassport: data.hasPassport,
        danceStyles: data.danceStyles ?? undefined,
        experienceYears: data.experienceYears ? String(data.experienceYears) : undefined,
        danceVideo: data.danceVideo ?? undefined,
        skills: Array.isArray(data.skills) ? data.skills.join(', ') : data.skills,
        maritalStatus: data.maritalStatus,
        comfortableAreas: Array.isArray(data.comfortableAreas) ? data.comfortableAreas.join(', ') : data.comfortableAreas,
        travelCities: Array.isArray(data.travelCities) ? data.travelCities.join(', ') : data.travelCities,
        portfolioUrls: Array.isArray(data.portfolioUrls) ? data.portfolioUrls : [],
        videoUrl: data.videoUrl,
        projectsWorked: (() => {
          try {
            const pw = data.projectsWorked
            if (typeof pw === 'string') return JSON.parse(pw)
            return Array.isArray(pw) ? pw : []
          } catch { return [] }
        })(),
        hourlyRate: data.hourlyRate,
        totalApplications: data.totalApplications,
        successfulHires: data.successfulHires,
        artistTypeId: data.artistType?.id ?? data.artistTypeId,
        artistType: data.artistType,
        professions: data.professions,
        experiences: data.experiences ?? [],
        educations: data.educations ?? [],
        dynamicFields: data.dynamicFields ?? [],
      }
      setProfile(normalized)

      try {
        const completion = await artistDashboardService.getProfileCompletion()
        if (completion?.completionPercentage != null) {
          setApiCompletionPercentage(completion.completionPercentage)
        }
      } catch { }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // The artist's PUBLIC mini-site link (no login needed to view).
  // Always uses the production domain so shared links work everywhere.
  const PUBLIC_PROFILE_BASE_URL = 'https://icastar.com'
  const shareLink = userId ? `${PUBLIC_PROFILE_BASE_URL}/${userId}/profile` : ''

  // "Share Profile" opens a popup that shows the generated link + a Copy option.
  const handleShareProfile = () => {
    if (!userId) {
      toast.error(t('artistProfile.toast.linkNotReady'))
      return
    }
    setLinkCopied(false)
    setShareModalOpen(true)
  }

  const handleCopyShareLink = async () => {
    if (!shareLink) return
    try {
      await navigator.clipboard.writeText(shareLink)
      setLinkCopied(true)
      toast.success(t('artistProfile.toast.linkCopied'))
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      toast.error(t('artistProfile.toast.copyFailed'))
    }
  }

  const handleEditProfile = () => {
    setIsEditing(true)
    setEditedProfile(profile ? { ...profile } : null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedProfile(null)
  }

  const handleSaveProfile = async () => {
    if (!editedProfile) return

    try {
      setSaving(true)
      // Split fullName into firstName and lastName if not already set
      let firstName = editedProfile.firstName
      let lastName = editedProfile.lastName
      if (!firstName && !lastName && editedProfile.fullName) {
        const nameParts = editedProfile.fullName.trim().split(' ')
        firstName = nameParts[0] || ''
        lastName = nameParts.slice(1).join(' ') || ''
      }

      const payload = {
        firstName: firstName || '',
        lastName: lastName || '',
        artistTypeId: editedProfile.artistTypeId ?? editedProfile.artistType?.id,
        email: editedProfile.email,
        phone: editedProfile.phone,
        city: editedProfile.city,
        bio: editedProfile.bio,
        languagesSpoken: parseSkillsArray(editedProfile.languages),
        gender: editedProfile.gender,
        dateOfBirth: editedProfile.dateOfBirth,
        profilePhoto: editedProfile.profilePhoto,
        coverPhoto: editedProfile.coverPhoto,
        idProof: editedProfile.idProof,
        height: editedProfile.height,
        weight: editedProfile.weight,
        experienceYears: editedProfile.experiences?.length
          ? totalExperienceYears(editedProfile.experiences)
          : editedProfile.experienceYears ? Number(editedProfile.experienceYears) : undefined,
        danceVideo: editedProfile.danceVideo,
        hairColor: editedProfile.hairColor,
        hairLength: editedProfile.hairLength,
        hasTattoo: editedProfile.hasTattoo,
        hasMole: editedProfile.hasMole,
        shoeSize: editedProfile.shoeSize,
        eyeColor: editedProfile.eyeColor,
        complexion: editedProfile.complexion,
        hasPassport: editedProfile.hasPassport,
        maritalStatus: editedProfile.maritalStatus,
        skills: parseSkillsArray(editedProfile.skills),
        comfortableAreas: parseSkillsArray(editedProfile.comfortableAreas),
        travelCities: parseSkillsArray(editedProfile.travelCities),
        portfolioUrls: (editedProfile.portfolioUrls ?? []).filter((url: string) => url.trim() !== ''),
        portfolioItems: (editedProfile.portfolioUrls ?? []).filter((url: string) => url.trim() !== ''),
        videoUrl: editedProfile.videoUrl,
        projectsWorked: editedProfile.projectsWorked ?? [],
        hourlyRate: editedProfile.hourlyRate,
        dynamicFields: editedProfile.dynamicFields,
      }

      await artistService.updateMyProfile(payload)
      setIsEditing(false)
      toast.success(t('artistProfile.toast.profileUpdated'))
      await fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(t('artistProfile.toast.profileUpdateFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ArtistProfile, value: any) => {
    if (editedProfile) {
      setEditedProfile({ ...editedProfile, [field]: value })
    }
  }

  // Experience entries save immediately (Naukri-style), independent of Edit Profile mode.
  const applyExperiences = (update: (list: ArtistExperience[]) => ArtistExperience[]) => {
    setProfile(prev => (prev ? { ...prev, experiences: update(prev.experiences ?? []) } : prev))
    setEditedProfile(prev => (prev ? { ...prev, experiences: update(prev.experiences ?? []) } : prev))
  }

  const handleSaveExperience = async (exp: ArtistExperience) => {
    try {
      const saved = exp.id != null
        ? await artistService.updateExperience(exp.id, exp)
        : await artistService.addExperience(exp)
      // Keep the profession label from the form if the response omits it
      const merged = { ...exp, ...saved, artistTypeName: saved.artistTypeName || exp.artistTypeName }
      applyExperiences(list =>
        exp.id != null ? list.map(e => (e.id === exp.id ? merged : e)) : [...list, merged],
      )
      toast.success(exp.id != null ? t('artistProfile.toast.experienceUpdated') : t('artistProfile.toast.experienceAdded'))
    } catch (error) {
      console.error('Error saving experience:', error)
      toast.error(t('artistProfile.toast.experienceSaveFailed'))
      throw error
    }
  }

  const handleDeleteExperience = async (exp: ArtistExperience, index: number) => {
    try {
      if (exp.id != null) await artistService.deleteExperience(exp.id)
      applyExperiences(list => list.filter((e, i) => (exp.id != null ? e.id !== exp.id : i !== index)))
      toast.success(t('artistProfile.toast.experienceDeleted'))
    } catch (error) {
      console.error('Error deleting experience:', error)
      toast.error(t('artistProfile.toast.experienceDeleteFailed'))
    }
  }

  // Education entries also save immediately, like experience.
  const applyEducations = (update: (list: ArtistEducation[]) => ArtistEducation[]) => {
    setProfile(prev => (prev ? { ...prev, educations: update(prev.educations ?? []) } : prev))
    setEditedProfile(prev => (prev ? { ...prev, educations: update(prev.educations ?? []) } : prev))
  }

  const handleSaveEducation = async (edu: ArtistEducation) => {
    try {
      const saved = edu.id != null
        ? await artistService.updateEducation(edu.id, edu)
        : await artistService.addEducation(edu)
      const merged = { ...edu, ...saved }
      applyEducations(list =>
        edu.id != null ? list.map(e => (e.id === edu.id ? merged : e)) : [...list, merged],
      )
      toast.success(edu.id != null ? t('artistProfile.toast.educationUpdated') : t('artistProfile.toast.educationAdded'))
    } catch (error) {
      console.error('Error saving education:', error)
      toast.error(t('artistProfile.toast.educationSaveFailed'))
      throw error
    }
  }

  const handleDeleteEducation = async (edu: ArtistEducation, index: number) => {
    try {
      if (edu.id != null) await artistService.deleteEducation(edu.id)
      applyEducations(list => list.filter((e, i) => (edu.id != null ? e.id !== edu.id : i !== index)))
      toast.success(t('artistProfile.toast.educationDeleted'))
    } catch (error) {
      console.error('Error deleting education:', error)
      toast.error(t('artistProfile.toast.educationDeleteFailed'))
    }
  }

  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    if (editedProfile) {
      const currentFields = editedProfile.dynamicFields ? [...editedProfile.dynamicFields] : []
      const index = currentFields.findIndex(f => f.fieldName === fieldName)
      if (index >= 0) {
        currentFields[index] = { ...currentFields[index], value }
      } else {
        currentFields.push({ fieldName, value })
      }
      setEditedProfile({ ...editedProfile, dynamicFields: currentFields })
    }
  }

  const openFaceModal = useCallback(async () => {
    setIsFaceModalOpen(true)
    setCapturedImage(null)
    setCapturedBlob(null)
    setFaceVerifyStatus('idle')
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err: any) {
      setCameraError(t('artistProfile.faceModal.cameraDenied'))
    }
  }, [t])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const closeFaceModal = useCallback(() => {
    stopCamera()
    setIsFaceModalOpen(false)
    setCapturedImage(null)
    setCapturedBlob(null)
    setFaceVerifyStatus('idle')
    setCameraError(null)
  }, [stopCamera])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(dataUrl)
    setFaceVerifyStatus('captured')
    canvas.toBlob(blob => {
      if (blob) setCapturedBlob(blob)
    }, 'image/jpeg', 0.9)
    stopCamera()
  }, [stopCamera])

  const retakePhoto = useCallback(async () => {
    setCapturedImage(null)
    setCapturedBlob(null)
    setFaceVerifyStatus('idle')
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err: any) {
      setCameraError(t('artistProfile.faceModal.cameraDeniedShort'))
    }
  }, [t])

  const handleSubmitFaceVerification = useCallback(async () => {
    if (!capturedBlob) return
    try {
      setFaceVerifyStatus('uploading')
      const file = new File([capturedBlob], `face_${Date.now()}.jpg`, { type: 'image/jpeg' })
      const fileUrl = await uploadService.uploadFile(file, 'FACE_VERIFICATION')
      await artistService.submitFaceVerification(fileUrl)
      setFaceVerifyStatus('submitted')
      setLocalFaceVerified(true)
      toast.success(t('artistProfile.toast.faceSubmitted'))
      setTimeout(() => closeFaceModal(), 1500)
    } catch (err: any) {
      toast.error(t('artistProfile.toast.faceSubmitFailed'))
      setFaceVerifyStatus('captured')
    }
  }, [capturedBlob, closeFaceModal, t])

  const handleViewDocument = (docType: string) => {
    toast.info(t('artistProfile.toast.viewingDocument', { docType }))
    // Add document viewing logic here
  }

  const handleUploadDocument = async (file: File, docType: string) => {
    const toastId = toast.loading(t('artistProfile.toast.uploadingDocument', { docType }))
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.dismiss(toastId)
      toast.success(t('artistProfile.toast.documentUploaded', { docType }))
      // Refresh profile data or update state here
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(t('artistProfile.toast.documentUploadFailed', { docType }))
      console.error('Upload error:', error)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500'></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center p-6 text-center'>
        <div className='bg-amber-100 p-4 rounded-full mb-4'>
          <Icon name='User' size={24} className='text-amber-600' />
        </div>
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>{t('artistProfile.notFound.title')}</h2>
        <p className='text-gray-600 mb-6'>{t('artistProfile.notFound.subtitle')}</p>
        <button
          onClick={() => navigate('/settings')}
          className='bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-lg transition-colors'
        >
          {t('artistProfile.notFound.cta')}
        </button>
      </div>
    )
  }

  const renderActorDetails = () => (
    <div className='space-y-6'>
      <div className='bg-white rounded-xl p-6 shadow-sm'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t('artistProfile.actor.title')}</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-gray-500 mb-2'>{t('artistProfile.actor.actorType')}</p>
            {isEditing ? (
              <select
                value={currentProfile?.actorType || 'skilled'}
                onChange={(e) => handleInputChange('actorType', e.target.value as 'skilled' | 'known')}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              >
                <option value='skilled'>{t('artistProfile.actor.skilled')}</option>
                <option value='known'>{t('artistProfile.actor.known')}</option>
              </select>
            ) : (
              <p className='font-medium'>{currentProfile?.actorType === 'known' ? t('artistProfile.actor.known') : t('artistProfile.actor.skilled')}</p>
            )}
          </div>
          <div>
            <p className='text-sm text-gray-500 mb-2'>{t('common.labels.age')}</p>
            {isEditing ? (
              <input
                type='number'
                value={currentProfile?.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            ) : (
              <p className='font-medium'>{t('artistProfile.actor.ageYears', { age: currentProfile?.age ?? '' })}</p>
            )}
          </div>
          <div>
            <p className='text-sm text-gray-500 mb-2'>{t('artistProfile.fields.height')}</p>
            {isEditing ? (
              <input
                type='text'
                value={currentProfile?.height || ''}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder={t('artistProfile.actor.heightPlaceholder')}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            ) : (
              <p className='font-medium'>{currentProfile?.height}</p>
            )}
          </div>
          <div>
            <p className='text-sm text-gray-500 mb-2'>{t('artistProfile.fields.weight')}</p>
            {isEditing ? (
              <input
                type='number'
                value={currentProfile?.weight || ''}
                onChange={(e) => handleInputChange('weight', parseInt(e.target.value) || 0)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            ) : (
              <p className='font-medium'>{t('artistProfile.details.weightKg', { weight: currentProfile?.weight ?? '' })}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderDancerDetails = () => (
    <div className='space-y-6'>
      <div className='bg-white rounded-xl p-6 shadow-sm'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t('artistProfile.dancer.title')}</h3>
        <div className='space-y-4'>
          <div>
            <p className='text-sm text-gray-500 mb-2'>{t('artistProfile.dancer.experienceYears')}</p>
            {isEditing ? (
              <input
                type='text'
                value={currentProfile?.experienceYears || ''}
                onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                placeholder={t('artistProfile.dancer.experiencePlaceholder')}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            ) : (
              <p className='font-medium'>{t('artistProfile.dancer.yearsValue', { value: currentProfile?.experienceYears ?? '' })}</p>
            )}
          </div>
          <div>
            <p className='text-sm text-gray-500 mb-2'>{t('artistProfile.dancer.danceStyles')}</p>
            {isEditing ? (
              <input
                type='text'
                value={currentProfile?.danceStyles?.join(', ') || ''}
                onChange={(e) => handleInputChange('danceStyles', e.target.value.split(',').map((s: string) => s.trim()))}
                placeholder={t('artistProfile.dancer.danceStylesPlaceholder')}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            ) : (
              <div className='flex flex-wrap gap-2'>
                {currentProfile?.danceStyles?.map((style, index) => (
                  <span key={index} className='bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full'>
                    {style}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className='text-sm text-gray-500 mb-2'>{t('artistProfile.dancer.showreel')}</p>
            {isEditing ? (
              <div className="space-y-4">
                <VideoUpload
                  currentVideoUrl={currentProfile?.danceVideo}
                  uploadType="DANCE_SHOWREEL"
                  label={t('artistProfile.dancer.uploadShowreel')}
                  description={t('artistProfile.dancer.showreelDescription')}
                  onUploadSuccess={(fileUrl) => handleInputChange('danceVideo', fileUrl)}
                />
                <div className="text-center text-gray-500 text-sm">{t('artistProfile.or')}</div>
                <div>
                  <label className='text-xs font-medium text-gray-500'>{t('artistProfile.dancer.videoUrlLabel')}</label>
                  <input
                    type='url'
                    value={currentProfile?.danceVideo || ''}
                    onChange={(e) => handleInputChange('danceVideo', e.target.value)}
                    placeholder={t('artistProfile.dancer.videoUrlPlaceholder')}
                    className='w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                  />
                </div>
              </div>
            ) : currentProfile?.danceVideo ? (
              currentProfile.danceVideo.includes('youtube.com') || currentProfile.danceVideo.includes('youtu.be') || currentProfile.danceVideo.includes('vimeo.com') ? (
                <div className='aspect-w-16 aspect-h-9 rounded-lg overflow-hidden'>
                  <iframe
                    src={currentProfile.danceVideo}
                    className='w-full h-64 rounded-lg'
                    title={t('artistProfile.dancer.showreel')}
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <video src={currentProfile.danceVideo} controls className='w-full rounded-lg' />
              )
            ) : (
              <p className='text-gray-500'>{t('artistProfile.dancer.noShowreel')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderDynamicDetails = () => {
    const fields = currentProfile?.artistType?.fields
    if (!fields || fields.length === 0) {
      // Fallback or empty state if no metadata
      if (currentProfile?.category?.toLowerCase() === 'actor') return renderActorDetails()
      if (currentProfile?.category?.toLowerCase() === 'dancer') return renderDancerDetails()
      return null
    }

    const getDynamicValue = (name: string) => {
      return currentProfile?.dynamicFields?.find(f => f.fieldName === name)?.value || ''
    }

    return (
      <div className='space-y-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            {t('artistProfile.dynamic.title', { name: currentProfile?.artistType?.displayName ?? t('common.labels.role') })}
          </h3>
          <div className='grid grid-cols-1 gap-6'>
            {fields.map((field) => {
              const val = getDynamicValue(field.name)

              if (field.type === 'TEXTAREA') {
                return (
                  <div key={field.name}>
                    <label className='text-sm font-medium text-gray-700 mb-1 block'>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {isEditing ? (
                      <textarea
                        value={val}
                        onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                      />
                    ) : (
                      <p className='text-gray-600 whitespace-pre-wrap'>{val || '-'}</p>
                    )}
                  </div>
                )
              }

              if (field.type === 'BOOLEAN') {
                return (
                  <div key={field.name} className="flex items-center gap-3">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={(e) => handleDynamicFieldChange(field.name, e.target.checked)}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                    ) : (
                      <Icon name={val ? 'CheckSquare' : 'Square'} size={20} className={val ? 'text-amber-600' : 'text-gray-400'} />
                    )}
                    <label className='text-sm font-medium text-gray-700'>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                  </div>
                )
              }

              if (field.type === 'FILE') {
                return (
                  <div key={field.name}>
                    <label className='text-sm font-medium text-gray-700 mb-1 block'>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={val}
                          readOnly
                          placeholder={t('artistProfile.dynamic.uploadFilePlaceholder')}
                          className='flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50'
                        />
                        <label className="cursor-pointer bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          {t('common.actions.upload')}
                          <input type="file" className="hidden" onChange={(e) => {
                            if (e.target.files?.[0]) handleDynamicFieldChange(field.name, e.target.files[0].name) // limited mock
                          }} />
                        </label>
                      </div>
                    ) : (
                      val ? <span className="text-amber-600 font-medium">{val}</span> : <span className="text-gray-400">{t('artistProfile.dynamic.noFile')}</span>
                    )}
                  </div>
                )
              }

              // Default TEXT, URL, NUMBER
              return (
                <div key={field.name}>
                  <label className='text-sm font-medium text-gray-700 mb-1 block'>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <input
                      type={field.type === 'NUMBER' ? 'number' : field.type === 'URL' ? 'url' : 'text'}
                      value={val}
                      onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    />
                  ) : (
                    field.type === 'URL' && val ? (
                      <a href={val} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">{val}</a>
                    ) : (
                      <p className='text-gray-600'>{val || '-'}</p>
                    )
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const currentProfile = isEditing ? editedProfile : profile

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (!trimmed) return
    const existing = parseSkillsArray(currentProfile?.skills)
    if (existing.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) return
    handleInputChange('skills', [...existing, trimmed].join(', '))
    setSkillInput('')
  }

  const handleRemoveSkill = (skill: string) => {
    const updated = parseSkillsArray(currentProfile?.skills).filter(s => s !== skill).join(', ')
    handleInputChange('skills', updated)
  }

  const handleAddArea = (area: string) => {
    const trimmed = area.trim()
    if (!trimmed) return
    const existing = parseSkillsArray(currentProfile?.comfortableAreas)
    if (existing.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) return
    handleInputChange('comfortableAreas', [...existing, trimmed].join(', '))
    setAreaInput('')
  }

  const handleRemoveArea = (area: string) => {
    const updated = parseSkillsArray(currentProfile?.comfortableAreas).filter(s => s !== area).join(', ')
    handleInputChange('comfortableAreas', updated)
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    // Helper to check if a value is filled (handles strings, numbers, and arrays)
    const isFilled = (value: any): boolean => {
      if (value === null || value === undefined) return false
      if (typeof value === 'string') return value.trim() !== ''
      if (typeof value === 'number') return true // 0 is a valid value
      if (Array.isArray(value)) return value.length > 0
      return Boolean(value)
    }

    // Helper to format display value
    const formatDisplayValue = (value: any, key?: string): string => {
      if (value === null || value === undefined) return ''
      if (key === 'hourlyRate') return value ? t('artistProfile.completion.perHour', { value }) : ''
      if (typeof value === 'number') return String(value)
      if (Array.isArray(value)) {
        const joined = value.join(', ')
        return joined.length > 25 ? joined.substring(0, 25) + '...' : joined
      }
      if (typeof value === 'string') {
        const parsed = parseSkillsArray(value)
        if (parsed.length > 0) {
          const joined = parsed.join(', ')
          return joined.length > 25 ? joined.substring(0, 25) + '...' : joined
        }
        return value.length > 25 ? value.substring(0, 25) + '...' : value
      }
      return String(value)
    }

    const emptyResult = {
      percentage: 0,
      missing: [] as string[],
      filled: 0,
      total: 0,
      fields: [] as { label: string; value: any; isFilled: boolean; displayValue: string }[]
    }

    if (!profile) return emptyResult

    const fieldsList = [
      { key: 'firstName', label: t('common.labels.firstName'), value: profile.firstName },
      { key: 'lastName', label: t('common.labels.lastName'), value: profile.lastName },
      { key: 'email', label: t('common.labels.email'), value: profile.email },
      { key: 'phone', label: t('common.labels.phone'), value: profile.phone },
      { key: 'city', label: t('common.labels.city'), value: profile.city },
      { key: 'gender', label: t('common.labels.gender'), value: profile.gender },
      { key: 'dateOfBirth', label: t('artistProfile.fields.dateOfBirth'), value: profile.dateOfBirth },
      { key: 'bio', label: t('common.labels.bio'), value: profile.bio },
      { key: 'languages', label: t('common.labels.languages'), value: profile.languages },
      { key: 'experienceYears', label: t('common.labels.experience'), value: profile.experiences?.length ? profile.experiences : profile.experienceYears },
      { key: 'skills', label: t('common.labels.skills'), value: profile.skills },
      { key: 'height', label: t('artistProfile.fields.height'), value: profile.height },
      { key: 'weight', label: t('artistProfile.fields.weight'), value: profile.weight },
      { key: 'profilePhoto', label: t('artistProfile.fields.photo'), value: profile.profilePhoto },
      { key: 'hourlyRate', label: t('artistProfile.fields.hourlyRate'), value: profile.hourlyRate },
      { key: 'comfortableAreas', label: t('artistProfile.fields.comfortableAreas'), value: profile.comfortableAreas },
      { key: 'portfolioUrls', label: t('artistProfile.fields.portfolioLinks'), value: profile.portfolioUrls },
    ]

    // Add dynamic fields to completion check
    if (profile.artistType?.fields) {
      profile.artistType.fields.forEach(field => {
        const val = profile.dynamicFields?.find(df => df.fieldName === field.name)?.value
        fieldsList.push({
          key: field.name,
          label: field.label,
          value: val,
        })
      })
    }

    const fieldsWithStatus = fieldsList.map(f => ({
      label: f.label,
      value: f.value,
      isFilled: isFilled(f.value),
      displayValue: formatDisplayValue(f.value, f.key)
    }))

    const filledCount = fieldsWithStatus.filter(f => f.isFilled).length
    const missingFields = fieldsWithStatus.filter(f => !f.isFilled).map(f => f.label)
    const percentage = apiCompletionPercentage != null
      ? apiCompletionPercentage
      : Math.round((filledCount / fieldsList.length) * 100)

    return {
      percentage,
      missing: missingFields,
      filled: filledCount,
      total: fieldsList.length,
      fields: fieldsWithStatus
    }
  }

  const profileCompletion = calculateProfileCompletion()

  return (
    <>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>{t('common.nav.myProfile')}</h1>
          <div className='flex gap-3'>
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className='flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors font-semibold'
                >
                  <Icon name='X' size={16} />
                  {t('common.actions.cancel')}
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className='flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold disabled:opacity-50'
                >
                  <Icon name='Save' size={16} />
                  {saving ? t('common.actions.saving') : t('common.actions.saveChanges')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleShareProfile}
                  className='flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors'
                >
                  <Icon name='Share2' size={16} />
                  {t('artistProfile.header.shareProfile')}
                </button>
                <button
                  onClick={handleEditProfile}
                  className='flex items-center gap-2 bg-white border border-amber-600 text-amber-600 hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors'
                >
                  <Icon name='Edit' size={16} />
                  {t('artistProfile.header.editProfile')}
                </button>
              </>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - Profile Card */}
          <div className='lg:col-span-1 space-y-6'>
            <div className='bg-white rounded-xl p-6 shadow-sm text-center'>
              {/* Profile Photo Upload in Edit Mode */}
              {isEditing ? (
                <div className="mb-6">
                  <ImageUpload
                    currentImageUrl={currentProfile?.profilePhoto}
                    uploadType="PROFILE_PHOTO"
                    label={t('artistProfile.card.profilePhoto')}
                    aspectRatio="circle"
                    onUploadSuccess={(fileUrl) => handleInputChange('profilePhoto', fileUrl)}
                  />
                </div>
              ) : (
                <div
                  className={`w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-amber-400 bg-amber-50 flex items-center justify-center ${
                    currentProfile?.profilePhoto ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
                  }`}
                  onClick={() => {
                    if (currentProfile?.profilePhoto) setPhotoPreviewOpen(true)
                  }}
                  role={currentProfile?.profilePhoto ? 'button' : undefined}
                  aria-label={currentProfile?.profilePhoto ? t('artistProfile.card.viewProfilePhoto') : undefined}>
                  {currentProfile?.profilePhoto ? (
                    <img
                      src={currentProfile.profilePhoto}
                      alt={currentProfile?.fullName}
                      className='w-full h-full object-cover'
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement?.classList.add('show-icon')
                      }}
                    />
                  ) : (
                    <Icon name='User' size={48} className='text-amber-400' />
                  )}
                </div>
              )}

              {photoPreviewOpen && currentProfile?.profilePhoto && (
                <div
                  className='fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4'
                  onClick={() => setPhotoPreviewOpen(false)}
                  role='dialog'
                  aria-modal='true'>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation()
                      setPhotoPreviewOpen(false)
                    }}
                    className='absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors'
                    aria-label={t('artistProfile.card.closePreview')}>
                    <Icon name='X' size={24} />
                  </button>
                  <img
                    src={currentProfile.profilePhoto}
                    alt={currentProfile?.fullName}
                    className='max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl'
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              {isEditing ? (
                <div className='space-y-3 text-left'>
                  <div>
                    <label className='text-xs font-medium text-gray-500'>{t('common.labels.fullName')}</label>
                    <input
                      type='text'
                      value={currentProfile?.fullName || ''}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className='w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <input
                      type='text'
                      value={currentProfile?.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className='w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='text-xs font-medium text-gray-500'>{t('artistProfile.fields.dateOfBirth')}</label>
                    <input
                      type='date'
                      value={currentProfile?.dateOfBirth ? currentProfile.dateOfBirth.split('T')[0] : ''}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className='w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='text-xs font-medium text-gray-500'>{t('common.labels.gender')}</label>
                    <select
                      value={currentProfile?.gender || ''}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className='w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    >
                      <option value="">{t('artistProfile.card.selectGender')}</option>
                      <option value="MALE">{tEnum('MALE')}</option>
                      <option value="FEMALE">{tEnum('FEMALE')}</option>
                      <option value="OTHER">{tEnum('OTHER')}</option>
                      <option value="PREFER_NOT_TO_SAY">{tEnum('PREFER_NOT_TO_SAY')}</option>
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className='text-xl font-bold text-gray-900'>{currentProfile?.fullName}</h2>
                  {currentProfile?.stageName && <p className="text-gray-500 text-sm">({currentProfile.stageName})</p>}
                  {currentProfile?.professions && currentProfile.professions.length > 0 ? (
                    <div className='flex flex-wrap gap-1.5 mt-1'>
                      {currentProfile.professions.map((p, i) => {
                        // Prefer years derived from experience entries; fall back to the backend value
                        const years = p.id != null && currentProfile.experiences?.length
                          ? experienceYearsByProfession(currentProfile.experiences)[String(p.id)]
                          : p.experienceYears
                        return (
                          <span
                            key={p.id ?? p.displayName ?? i}
                            className='inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium'>
                            {p.displayName}
                            {years != null && years > 0 && (
                              <span className='ml-1 text-amber-500'>· {t('common.units.yearsShort', { count: years })}</span>
                            )}
                          </span>
                        )
                      })}
                    </div>
                  ) : (
                    <p className='text-amber-600 font-medium'>{currentProfile?.category}</p>
                  )}
                  <div className='mt-2 text-gray-600 space-y-1'>
                    <p>{currentProfile?.city}</p>
                    {currentProfile?.dateOfBirth && <p className='text-xs text-gray-500'>{t('artistProfile.card.born', { date: new Date(currentProfile.dateOfBirth).toLocaleDateString(dateLocale()) })}</p>}
                    {currentProfile?.gender && <p className='text-xs text-gray-500'>{tEnum(currentProfile.gender)}</p>}
                  </div>
                </>
              )}

              <div className='mt-6 pt-6 border-t border-gray-100'>
                <h3 className='text-sm font-medium text-gray-500 mb-3'>{t('artistProfile.card.contactInformation')}</h3>
                {isEditing ? (
                  <div className='space-y-3 text-left'>
                    <div>
                      <label className='text-xs font-medium text-gray-500'>{t('common.labels.email')}</label>
                      <input
                        type='email'
                        value={currentProfile?.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className='w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                      />
                    </div>
                    <div>
                      <label className='text-xs font-medium text-gray-500'>{t('common.labels.phone')}</label>
                      <input
                        type='tel'
                        value={currentProfile?.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className='w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                      />
                    </div>
                  </div>
                ) : (
                  <div className='space-y-2 text-sm'>
                    <div className='flex items-center justify-center gap-2 text-gray-600'>
                      <Icon name='Mail' size={16} className='text-amber-500' />
                      <span>{currentProfile?.email}</span>
                    </div>
                    <div className='flex items-center justify-center gap-2 text-gray-600'>
                      <Icon name='Phone' size={16} className='text-amber-500' />
                      <span>{currentProfile?.phone}</span>
                    </div>
                  </div>
                )}

                <div className='mt-4 pt-4 border-t border-gray-100'>
                  <h3 className='text-sm font-medium text-gray-500 mb-3'>{t('common.labels.languages')}</h3>
                  {isEditing ? (
                    <input
                      type='text'
                      value={currentProfile?.languages || ''}
                      onChange={(e) => handleInputChange('languages', e.target.value)}
                      placeholder={t('artistProfile.card.languagesPlaceholder')}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    />
                  ) : (
                    <div className='flex flex-wrap justify-center gap-2'>
                      {currentProfile?.languages.split(',').map((lang, index) => (
                        <span key={index} className='bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full'>
                          {lang.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t('artistProfile.completion.title')}</h3>
              <div className='mb-4'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-sm font-medium text-gray-700'>{t('artistProfile.completion.percentComplete', { percentage: profileCompletion.percentage })}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${profileCompletion.percentage >= 80 ? 'bg-green-100 text-green-700' :
                    profileCompletion.percentage >= 50 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                    {profileCompletion.percentage >= 80 ? t('artistProfile.completion.good') : profileCompletion.percentage >= 50 ? t('artistProfile.completion.needsWork') : t('artistProfile.completion.incomplete')}
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-3'>
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${profileCompletion.percentage >= 80 ? 'bg-green-500' :
                      profileCompletion.percentage >= 50 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                    style={{ width: `${profileCompletion.percentage}%` }}
                  />
                </div>
                <p className='text-xs text-gray-500 mt-2 text-center'>
                  {t('artistProfile.completion.fieldsCompleted', { filled: profileCompletion.filled, total: profileCompletion.total })}
                </p>
              </div>

              {/* All Fields Status */}
              <div className='mt-4 space-y-2'>
                <p className='text-xs font-medium text-gray-500 mb-2'>{t('artistProfile.completion.fieldStatus')}</p>
                <div className='max-h-48 overflow-y-auto space-y-1.5'>
                  {profileCompletion.fields.map((field, index) => (
                    <div key={index} className='flex items-center justify-between text-xs py-1.5 px-2 rounded bg-gray-50'>
                      <span className='text-gray-600'>{field.label}</span>
                      {field.isFilled ? (
                        <span className='flex items-center gap-1 text-green-600'>
                          <Icon name='Check' size={12} />
                          <span className='truncate max-w-[100px]' title={String(field.displayValue)}>
                            {field.displayValue}
                          </span>
                        </span>
                      ) : (
                        <span className='flex items-center gap-1 text-red-500'>
                          <Icon name='X' size={12} />
                          {t('artistProfile.completion.missing')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {profileCompletion.percentage < 100 && (
                <button
                  onClick={handleEditProfile}
                  className='mt-4 w-full bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors'
                >
                  {t('artistProfile.completion.completeYourProfile')}
                </button>
              )}
            </div>

            {/* Cover Photo */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t('artistProfile.coverPhoto.title')}</h3>
              {isEditing ? (
                <ImageUpload
                  currentImageUrl={currentProfile?.coverPhoto}
                  uploadType="COVER_PHOTO"
                  label={t('artistProfile.coverPhoto.title')}
                  aspectRatio="wide"
                  onUploadSuccess={(fileUrl) => handleInputChange('coverPhoto', fileUrl)}
                />
              ) : currentProfile?.coverPhoto ? (
                <img
                  src={currentProfile.coverPhoto}
                  alt={t('artistProfile.coverPhoto.alt')}
                  className='w-full h-40 object-cover rounded-lg'
                />
              ) : (
                <p className='text-gray-500 text-sm'>{t('artistProfile.coverPhoto.empty')}</p>
              )}
            </div>

            {/* ID Proof */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t('artistProfile.idProof.title')}</h3>
              {isEditing ? (
                <DocumentUpload
                  currentDocumentUrl={currentProfile?.idProof}
                  uploadType="ID_PROOF"
                  label={t('artistProfile.idProof.title')}
                  description={t('artistProfile.idProof.description')}
                  onUploadSuccess={(fileUrl) => handleInputChange('idProof', fileUrl)}
                />
              ) : currentProfile?.idProof ? (
                <div className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-gray-100 rounded-lg text-gray-600'>
                      <Icon name='FileText' size={20} />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>{t('artistProfile.idProof.document')}</p>
                      <p className='text-xs text-gray-500'>
                        {currentProfile.idProofVerified ? t('artistProfile.verification.verified') : t('artistProfile.verification.pendingVerification')}
                      </p>
                    </div>
                  </div>
                  <a
                    href={currentProfile.idProof}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-amber-600 hover:text-amber-700 text-sm font-medium'
                  >
                    {t('common.actions.view')}
                  </a>
                </div>
              ) : (
                <p className='text-gray-500 text-sm'>{t('artistProfile.idProof.empty')}</p>
              )}
            </div>

            {/* Verification Badge */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t('artistProfile.verification.title')}</h3>
              <div className='space-y-4'>
                <div className={`flex items-center p-3 rounded-lg ${profile.idProof ? (profile.idProofVerified ? 'bg-green-50' : 'bg-yellow-50') : 'bg-amber-50'}`}>
                  <div className={`p-2 rounded-full ${profile.idProof ? (profile.idProofVerified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600') : 'bg-amber-100 text-amber-600'}`}>
                    <Icon name={profile.idProof ? (profile.idProofVerified ? 'CheckCircle' : 'Clock') : 'AlertCircle'} size={20} />
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-gray-900'>{t('artistProfile.idProof.title')}</p>
                    <p className='text-xs text-gray-500'>
                      {profile.idProof
                        ? profile.idProofVerified
                          ? t('artistProfile.verification.verified')
                          : t('artistProfile.verification.pendingVerification')
                        : t('artistProfile.verification.notUploaded')}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center p-3 rounded-lg ${(profile.faceVerification || localFaceVerified) ? 'bg-green-50' : 'bg-amber-50'}`}>
                  <div className={`p-2 rounded-full ${(profile.faceVerification || localFaceVerified) ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    <Icon name={(profile.faceVerification || localFaceVerified) ? 'CheckCircle' : 'AlertCircle'} size={20} />
                  </div>
                  <div className='ml-3 flex-1'>
                    <p className='text-sm font-medium text-gray-900'>{t('artistProfile.verification.faceVerification')}</p>
                    <p className='text-xs text-gray-500'>
                      {profile.faceVerification ? t('artistProfile.verification.verified') : localFaceVerified ? t('artistProfile.verification.pendingReview') : t('artistProfile.verification.notVerified')}
                    </p>
                  </div>
                  {profile.faceVerification ? (
                    <a
                      href={profile.faceVerification}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='ml-2 flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors'>
                      <Icon name='Eye' size={14} />
                      {t('common.actions.view')}
                    </a>
                  ) : !localFaceVerified && (
                    <button
                      onClick={openFaceModal}
                      className='ml-2 flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors'>
                      <Icon name='Camera' size={14} />
                      {t('artistProfile.verification.start')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className='lg:col-span-2 space-y-6'>
            {/* About Section */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t('artistProfile.about.title')}</h3>
              {isEditing ? (
                <textarea
                  value={currentProfile?.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none'
                  placeholder={t('artistProfile.about.placeholder')}
                />
              ) : (
                <p className='text-gray-600'>{currentProfile?.bio}</p>
              )}
            </div>

            {/* Experience — Naukri-style list, saves each entry immediately */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <ExperienceSection
                experiences={profile.experiences ?? []}
                professionOptions={(profile.professions ?? [])
                  .filter(p => p.id != null)
                  .map(p => ({ id: p.id as number, label: p.displayName }))}
                onSave={handleSaveExperience}
                onDelete={handleDeleteExperience}
              />
            </div>

            {/* Education — same pattern as Experience, saves each entry immediately */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <EducationSection
                educations={profile.educations ?? []}
                onSave={handleSaveEducation}
                onDelete={handleDeleteEducation}
              />
            </div>

            {/* Additional Core Details */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t('artistProfile.details.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>{t('common.labels.skills')}</label>
                  {isEditing ? (
                    <div className='space-y-2'>
                      <div className='flex flex-wrap gap-2 min-h-[44px] p-2 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent'>
                        {parseSkillsArray(currentProfile?.skills).map(skill => (
                          <span key={skill} className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700 font-medium'>
                            {skill}
                            <button
                              type='button'
                              onClick={() => handleRemoveSkill(skill)}
                              className='text-amber-500 hover:text-red-600 font-bold leading-none ml-0.5'>
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type='text'
                          value={skillInput}
                          onChange={e => setSkillInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault()
                              handleAddSkill(skillInput)
                            }
                            if (e.key === 'Backspace' && !skillInput) {
                              const skills = parseSkillsArray(currentProfile?.skills)
                              if (skills.length > 0) handleRemoveSkill(skills[skills.length - 1])
                            }
                          }}
                          onBlur={() => { if (skillInput.trim()) handleAddSkill(skillInput) }}
                          placeholder={parseSkillsArray(currentProfile?.skills).length === 0 ? t('artistProfile.details.skillPlaceholder') : t('artistProfile.details.addMore')}
                          className='flex-1 min-w-[120px] outline-none text-sm text-gray-700 bg-transparent py-1'
                        />
                      </div>
                      <p className='text-xs text-gray-400'>{t('artistProfile.details.skillHint')}</p>
                    </div>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {parseSkillsArray(currentProfile?.skills).length > 0
                        ? parseSkillsArray(currentProfile?.skills).map(skill => (
                          <span key={skill} className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700 font-medium'>
                            {skill}
                          </span>
                        ))
                        : <span className='text-gray-500'>-</span>
                      }
                    </div>
                  )}
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>{t('artistProfile.details.heightWeight')}</label>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <input
                          type='text'
                          value={currentProfile?.height || ''}
                          onChange={(e) => handleInputChange('height', e.target.value)}
                          placeholder={t('artistProfile.details.heightPlaceholder')}
                          className='w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                        />
                        <input
                          type='number'
                          value={currentProfile?.weight || ''}
                          onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                          placeholder={t('artistProfile.details.weightPlaceholder')}
                          className='w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                        />
                      </>
                    ) : (
                      <p className='text-gray-600'>{currentProfile?.height || '-'} / {currentProfile?.weight ? t('artistProfile.details.weightKg', { weight: currentProfile.weight }) : '-'}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>{t('artistProfile.details.experienceYears')}</label>
                  {currentProfile?.experiences?.length ? (
                    // Derived from the Experience section once entries exist
                    <p className='text-gray-600'>
                      {formatMonths(totalExperienceMonths(currentProfile.experiences)) || '-'}
                      <span className='block text-xs text-gray-400'>{t('artistProfile.details.calculatedFromExperience')}</span>
                    </p>
                  ) : isEditing ? (
                    <input
                      type='number'
                      value={currentProfile?.experienceYears || ''}
                      onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    />
                  ) : (
                    <p className='text-gray-600'>{currentProfile?.experienceYears || '-'}</p>
                  )}
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>{t('artistProfile.details.perDay')}
                  </label>
                  {isEditing ? (
                    <input
                      type='number'
                      value={currentProfile?.hourlyRate || ''}
                      onChange={(e) => handleInputChange('hourlyRate', Number(e.target.value))}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    />
                  ) : (
                    <p className='text-gray-600'>{currentProfile?.hourlyRate ? t('artistProfile.details.perDayValue', { value: currentProfile.hourlyRate }) : '-'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Physical Attributes */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t('artistProfile.physical.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Hair Color */}
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>{t('artistProfile.physical.hairColor')}</label>
                  {isEditing ? (
                    <input
                      type='text'
                      value={currentProfile?.hairColor || ''}
                      onChange={(e) => handleInputChange('hairColor', e.target.value)}
                      placeholder={t('artistProfile.physical.hairColorPlaceholder')}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    />
                  ) : (
                    <p className='text-gray-600'>{currentProfile?.hairColor || '-'}</p>
                  )}
                </div>

                {/* Hair Length */}
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>{t('artistProfile.physical.hairLength')}</label>
                  {isEditing ? (
                    <input
                      type='text'
                      value={currentProfile?.hairLength || ''}
                      onChange={(e) => handleInputChange('hairLength', e.target.value)}
                      placeholder={t('artistProfile.physical.hairLengthPlaceholder')}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    />
                  ) : (
                    <p className='text-gray-600'>{currentProfile?.hairLength || '-'}</p>
                  )}
                </div>

                {/* Eye Color */}
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>{t('artistProfile.physical.eyeColor')}</label>
                  {isEditing ? (
                    <input
                      type='text'
                      value={currentProfile?.eyeColor || ''}
                      onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                      placeholder={t('artistProfile.physical.eyeColorPlaceholder')}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    />
                  ) : (
                    <p className='text-gray-600'>{currentProfile?.eyeColor || '-'}</p>
                  )}
                </div>

                {/* Complexion */}
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>{t('artistProfile.physical.complexion')}</label>
                  {isEditing ? (
                    <input
                      type='text'
                      value={currentProfile?.complexion || ''}
                      onChange={(e) => handleInputChange('complexion', e.target.value)}
                      placeholder={t('artistProfile.physical.complexionPlaceholder')}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    />
                  ) : (
                    <p className='text-gray-600'>{currentProfile?.complexion || '-'}</p>
                  )}
                </div>

                {/* Shoe Size */}
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>{t('artistProfile.physical.shoeSize')}</label>
                  {isEditing ? (
                    <input
                      type='text'
                      value={currentProfile?.shoeSize || ''}
                      onChange={(e) => handleInputChange('shoeSize', e.target.value)}
                      placeholder={t('artistProfile.physical.shoeSizePlaceholder')}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    />
                  ) : (
                    <p className='text-gray-600'>{currentProfile?.shoeSize || '-'}</p>
                  )}
                </div>

                {/* Features (Checkboxes) */}
                <div className="md:col-span-2">
                  <label className='text-sm font-medium text-gray-700 block mb-2'>{t('artistProfile.physical.features')}</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <input
                            type="checkbox"
                            checked={currentProfile?.hasTattoo || false}
                            onChange={(e) => handleInputChange('hasTattoo', e.target.checked)}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                          />
                          <label className='text-sm text-gray-700'>{t('artistProfile.physical.hasTattoo')}</label>
                        </>
                      ) : (
                        <>
                          <Icon
                            name={currentProfile?.hasTattoo ? 'CheckSquare' : 'Square'}
                            size={18}
                            className={currentProfile?.hasTattoo ? 'text-amber-600' : 'text-gray-400'}
                          />
                          <span className='text-sm text-gray-700'>{t('artistProfile.physical.hasTattoo')}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <input
                            type="checkbox"
                            checked={currentProfile?.hasMole || false}
                            onChange={(e) => handleInputChange('hasMole', e.target.checked)}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                          />
                          <label className='text-sm text-gray-700'>{t('artistProfile.physical.hasMole')}</label>
                        </>
                      ) : (
                        <>
                          <Icon
                            name={currentProfile?.hasMole ? 'CheckSquare' : 'Square'}
                            size={18}
                            className={currentProfile?.hasMole ? 'text-amber-600' : 'text-gray-400'}
                          />
                          <span className='text-sm text-gray-700'>{t('artistProfile.physical.hasMole')}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <input
                            type="checkbox"
                            checked={currentProfile?.hasPassport || false}
                            onChange={(e) => handleInputChange('hasPassport', e.target.checked)}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                          />
                          <label className='text-sm text-gray-700'>{t('artistProfile.physical.hasPassport')}</label>
                        </>
                      ) : (
                        <>
                          <Icon
                            name={currentProfile?.hasPassport ? 'CheckSquare' : 'Square'}
                            size={18}
                            className={currentProfile?.hasPassport ? 'text-amber-600' : 'text-gray-400'}
                          />
                          <span className='text-sm text-gray-700'>{t('artistProfile.physical.hasPassport')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t('artistProfile.personal.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Marital Status */}
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>{t('artistProfile.personal.maritalStatus')}</label>
                  {isEditing ? (
                    <select
                      value={currentProfile?.maritalStatus || ''}
                      onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    >
                      <option value="">{t('common.actions.select')}</option>
                      <option value="SINGLE">{tEnum('SINGLE')}</option>
                      <option value="MARRIED">{tEnum('MARRIED')}</option>
                      <option value="DIVORCED">{tEnum('DIVORCED')}</option>
                      <option value="WIDOWED">{tEnum('WIDOWED')}</option>
                      <option value="PREFER_NOT_TO_SAY">{tEnum('PREFER_NOT_TO_SAY')}</option>
                    </select>
                  ) : (
                    <p className='text-gray-600'>
                      {currentProfile?.maritalStatus
                        ? tEnum(currentProfile.maritalStatus)
                        : '-'}
                    </p>
                  )}
                </div>

                {/* Comfortable Areas */}
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>{t('artistProfile.fields.comfortableAreas')}</label>
                  {isEditing ? (
                    <div className='space-y-2'>
                      <div className='flex flex-wrap gap-2 min-h-[44px] p-2 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent'>
                        {parseSkillsArray(currentProfile?.comfortableAreas).map(area => (
                          <span key={area} className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 font-medium'>
                            {area}
                            <button
                              type='button'
                              onClick={() => handleRemoveArea(area)}
                              className='text-purple-400 hover:text-red-600 font-bold leading-none ml-0.5'>
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type='text'
                          value={areaInput}
                          onChange={e => setAreaInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault()
                              handleAddArea(areaInput)
                            }
                            if (e.key === 'Backspace' && !areaInput) {
                              const areas = parseSkillsArray(currentProfile?.comfortableAreas)
                              if (areas.length > 0) handleRemoveArea(areas[areas.length - 1])
                            }
                          }}
                          onBlur={() => { if (areaInput.trim()) handleAddArea(areaInput) }}
                          placeholder={parseSkillsArray(currentProfile?.comfortableAreas).length === 0 ? t('artistProfile.personal.areaPlaceholder') : t('artistProfile.details.addMore')}
                          className='flex-1 min-w-[120px] outline-none text-sm text-gray-700 bg-transparent py-1'
                        />
                      </div>
                      <p className='text-xs text-gray-400'>{t('artistProfile.personal.areaHint')}</p>
                    </div>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {parseSkillsArray(currentProfile?.comfortableAreas).length > 0
                        ? parseSkillsArray(currentProfile?.comfortableAreas).map(area => (
                          <span key={area} className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 font-medium'>
                            {area}
                          </span>
                        ))
                        : <span className='text-gray-500'>-</span>
                      }
                    </div>
                  )}
                </div>

                {/* Travel Cities */}
                <div className='md:col-span-2'>
                  <label className='text-sm font-medium text-gray-700 block mb-1'>{t('artistProfile.personal.travelTo')}</label>
                  {isEditing ? (
                    <input
                      type='text'
                      value={parseSkillsArray(currentProfile?.travelCities).join(', ')}
                      onChange={(e) => handleInputChange('travelCities', e.target.value)}
                      placeholder={t('artistProfile.personal.travelPlaceholder')}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    />
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {parseSkillsArray(currentProfile?.travelCities).length > 0
                        ? parseSkillsArray(currentProfile?.travelCities).map(city => (
                          <span key={city} className='bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full'>{city}</span>
                        ))
                        : <span className='text-gray-600'>-</span>
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Artist Type Specific Details */}
            {renderDynamicDetails()}

            {/* Portfolio URLs */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t('artistProfile.fields.portfolioLinks')}</h3>
              {isEditing ? (
                <div className='space-y-3'>
                  {(currentProfile?.portfolioUrls ?? []).map((url, i) => (
                    <div key={i} className='flex gap-2'>
                      <input
                        type='url'
                        value={url}
                        onChange={(e) => {
                          const updated = [...(editedProfile?.portfolioUrls ?? [])]
                          updated[i] = e.target.value
                          handleInputChange('portfolioUrls', updated)
                        }}
                        placeholder='https://...'
                        className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm'
                      />
                      <button
                        type='button'
                        onClick={() => {
                          const updated = (editedProfile?.portfolioUrls ?? []).filter((_, idx) => idx !== i)
                          handleInputChange('portfolioUrls', updated)
                        }}
                        className='p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors'
                      >
                        <Icon name='Trash2' size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type='button'
                    onClick={() => handleInputChange('portfolioUrls', [...(editedProfile?.portfolioUrls ?? []), ''])}
                    className='flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-medium'
                  >
                    <Icon name='Plus' size={16} />
                    {t('artistProfile.portfolio.add')}
                  </button>
                </div>
              ) : (currentProfile?.portfolioUrls?.length ?? 0) > 0 ? (
                <div className='space-y-2'>
                  {currentProfile!.portfolioUrls!.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2 p-3 border border-amber-200 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors'
                    >
                      <Icon name='ExternalLink' size={14} className='text-amber-600 flex-shrink-0' />
                      <span className='text-amber-700 text-sm font-medium truncate'>{url}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className='text-gray-500 text-sm'>{t('artistProfile.portfolio.empty')}</p>
              )}
            </div>

            {/* Profile Video */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t('artistProfile.profileVideo.title')}</h3>
              {isEditing ? (
                <div className='space-y-4'>
                  <VideoUpload
                    currentVideoUrl={currentProfile?.videoUrl}
                    uploadType="AUDITION_VIDEO"
                    label={t('artistProfile.profileVideo.upload')}
                    description={t('artistProfile.profileVideo.description')}
                    onUploadSuccess={(fileUrl) => handleInputChange('videoUrl', fileUrl)}
                  />
                  <div className='text-center text-gray-500 text-sm'>{t('artistProfile.or')}</div>
                  <div>
                    <label className='text-xs font-medium text-gray-500'>{t('artistProfile.profileVideo.urlLabel')}</label>
                    <input
                      type='url'
                      value={currentProfile?.videoUrl || ''}
                      onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                      placeholder='https://youtube.com/watch?v=...'
                      className='w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    />
                  </div>
                </div>
              ) : currentProfile?.videoUrl ? (
                currentProfile.videoUrl.includes('youtube.com') || currentProfile.videoUrl.includes('youtu.be') || currentProfile.videoUrl.includes('vimeo.com') ? (
                  <iframe
                    src={currentProfile.videoUrl}
                    className='w-full h-64 rounded-lg'
                    title={t('artistProfile.profileVideo.title')}
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                  />
                ) : (
                  <video src={currentProfile.videoUrl} controls className='w-full rounded-lg' />
                )
              ) : (
                <p className='text-gray-500 text-sm'>{t('artistProfile.profileVideo.empty')}</p>
              )}
            </div>

            {/* Documents Section */}
            {profile.category?.toLowerCase() === 'dancer' && profile.danceVideo && (
              <div className='bg-white rounded-xl p-6 shadow-sm'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>{t('artistProfile.documents.title')}</h3>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-gray-100 rounded-lg text-gray-600'>
                        <Icon name='Film' size={20} />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>{t('artistProfile.dancer.showreel')}</p>
                        <p className='text-xs text-gray-500'>{t('artistProfile.documents.youtubeLink')}</p>
                      </div>
                    </div>
                    <a
                      href={profile.danceVideo}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-amber-600 hover:text-amber-700 text-sm font-medium'
                    >
                      {t('artistProfile.documents.watch')}
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Share Profile Modal — shows the public link with a Copy option */}
      {shareModalOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
          onClick={() => setShareModalOpen(false)}
        >
          <div
            className='bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden'
            onClick={e => e.stopPropagation()}
          >
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
              <div className='flex items-center gap-2'>
                <Icon name='Share2' size={18} className='text-primary' />
                <h3 className='text-lg font-semibold text-gray-900'>{t('artistProfile.header.shareProfile')}</h3>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className='text-gray-400 hover:text-gray-600 transition-colors'
                aria-label={t('common.actions.close')}
              >
                <Icon name='X' size={20} />
              </button>
            </div>

            <div className='px-6 py-5'>
              <p className='text-sm text-gray-500 mb-3'>
                {t('artistProfile.share.description')}
              </p>

              <div className='flex items-center gap-2'>
                <input
                  type='text'
                  readOnly
                  value={shareLink}
                  onFocus={e => e.target.select()}
                  className='flex-1 min-w-0 px-3 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40'
                />
                <button
                  onClick={handleCopyShareLink}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shrink-0 ${
                    linkCopied ? 'bg-green-600' : 'bg-primary hover:bg-primary-hover'
                  }`}
                >
                  <Icon name={linkCopied ? 'Check' : 'Copy'} size={16} />
                  {linkCopied ? t('artistProfile.share.copied') : t('common.actions.copy')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Face Verification Modal */}
      {isFaceModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden'>
            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
              <div className='flex items-center gap-2'>
                <Icon name='Camera' size={20} className='text-amber-500' />
                <h3 className='text-lg font-semibold text-gray-900'>{t('artistProfile.verification.faceVerification')}</h3>
              </div>
              <button onClick={closeFaceModal} className='text-gray-400 hover:text-gray-600'>
                <Icon name='X' size={20} />
              </button>
            </div>

            {/* Body */}
            <div className='p-6'>
              {cameraError ? (
                <div className='flex flex-col items-center gap-4 py-6 text-center'>
                  <div className='p-4 bg-red-100 rounded-full'>
                    <Icon name='CameraOff' size={32} className='text-red-500' />
                  </div>
                  <p className='text-sm text-red-600'>{cameraError}</p>
                  <button
                    onClick={retakePhoto}
                    className='px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors'>
                    {t('common.actions.tryAgain')}
                  </button>
                </div>
              ) : (
                <>
                  {/* Camera / Preview */}
                  <div className='relative bg-black rounded-xl overflow-hidden mb-4' style={{ aspectRatio: '4/3' }}>
                    {!capturedImage ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <img src={capturedImage} alt={t('artistProfile.faceModal.capturedAlt')} className='w-full h-full object-cover' />
                    )}
                    {/* Face guide overlay */}
                    {!capturedImage && (
                      <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                        <div className='w-48 h-56 border-4 border-amber-400 rounded-full opacity-60' />
                      </div>
                    )}
                    {faceVerifyStatus === 'submitted' && (
                      <div className='absolute inset-0 bg-green-500/80 flex items-center justify-center'>
                        <Icon name='CheckCircle' size={64} className='text-white' />
                      </div>
                    )}
                  </div>

                  {/* Hidden canvas for capture */}
                  <canvas ref={canvasRef} className='hidden' />

                  {/* Instructions */}
                  {!capturedImage && (
                    <p className='text-xs text-gray-500 text-center mb-4'>
                      {t('artistProfile.faceModal.instructions')}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className='flex gap-3 justify-center'>
                    {faceVerifyStatus === 'idle' && (
                      <button
                        onClick={capturePhoto}
                        className='flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors'>
                        <Icon name='Camera' size={18} />
                        {t('artistProfile.faceModal.capture')}
                      </button>
                    )}

                    {faceVerifyStatus === 'captured' && (
                      <>
                        <button
                          onClick={retakePhoto}
                          className='flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors'>
                          <Icon name='RefreshCw' size={16} />
                          {t('artistProfile.faceModal.retake')}
                        </button>
                        <button
                          onClick={handleSubmitFaceVerification}
                          className='flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors'>
                          <Icon name='Send' size={16} />
                          {t('common.actions.submit')}
                        </button>
                      </>
                    )}

                    {faceVerifyStatus === 'uploading' && (
                      <div className='flex items-center gap-2 text-amber-600'>
                        <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-amber-500' />
                        <span className='text-sm font-medium'>{t('common.actions.submitting')}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Profile
