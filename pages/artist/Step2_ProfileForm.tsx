import React, { useState } from 'react'
import { ArtistCategory } from '@/types'
import CommonFields from '@/components/forms/CommonFields'
import {
  experienceYearsByProfession,
  totalExperienceYears,
} from '@/components/experience/ExperienceSection'
import type { ArtistExperience } from '@/services/artistService'
import { onboardingService } from '@/services/onboardingService'
import authService from '@/services/userService'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

interface BaseFormData {
  category: ArtistCategory | null
  artistTypeId?: string | null
  gender: string
  city: string

  languages: string[] | string
  experienceYears: string | number
  dateOfBirth: string
  [key: string]: any
}

interface ProfileFormProps {
  formData: BaseFormData
  updateFormData: (data: Partial<BaseFormData>) => void
}

const Step2_ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  updateFormData,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    const hasProfession =
      (Array.isArray(formData.artistTypeIds) && formData.artistTypeIds.length > 0) ||
      !!formData.category
    if (!hasProfession) newErrors.category = 'At least one profession is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.city?.trim()) newErrors.city = 'City is required'
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)

    try {
      // Build JSON payload limited to backend DTO fields
      // SimpleCreateArtistProfileDto: artistTypeId, gender, location, experienceYears, dateOfBirth
      const payload: Record<string, any> = {}

      // Professions — full list of selected profession ids.
      const artistTypeIds: string[] =
        Array.isArray(formData.artistTypeIds) && formData.artistTypeIds.length
          ? formData.artistTypeIds.map(String)
          : formData.artistTypeId
          ? [String(formData.artistTypeId)]
          : []

      // Work experience entries. Drop the profession link if that profession
      // was deselected after the entry was added.
      const experiences: ArtistExperience[] = Array.isArray(formData.experiences) ? formData.experiences : []
      payload.experiences = experiences.map(({ artistTypeName, ...exp }) => ({
        ...exp,
        artistTypeId:
          exp.artistTypeId != null && artistTypeIds.includes(String(exp.artistTypeId))
            ? Number(exp.artistTypeId)
            : null,
      }))

      // Education entries (optional)
      payload.educations = Array.isArray(formData.educations) ? formData.educations : []

      if (artistTypeIds.length) {
        // Full multi-profession list (numbers)
        payload.artistTypeIds = artistTypeIds.map(id => Number(id))
        // Primary profession — kept for backward compatibility + type-specific fields
        payload.artistTypeId = Number(artistTypeIds[0])

        // Per-profession experience derived from the entries: [{ artistTypeId, experienceYears }]
        const yearsByProfession = experienceYearsByProfession(experiences)
        payload.professions = artistTypeIds.map(id => ({
          artistTypeId: Number(id),
          experienceYears: yearsByProfession[id] ?? 0,
        }))
      }

      // gender (normalize to uppercase with underscores)
      const rawGender = String(formData.gender || '').trim()
      const normalizedGender = rawGender.toUpperCase().replace(/\s+/g, '_')
      const allowed = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']
      payload.gender = allowed.includes(normalizedGender)
        ? normalizedGender
        : normalizedGender || ''

      // location (map from city)
      payload.location = String(formData.city || '').trim()

      // experienceYears (number) — total from entries, overlapping projects counted once
      payload.experienceYears = totalExperienceYears(experiences)

      // dateOfBirth (string, e.g. YYYY-MM-DD)
      payload.dateOfBirth = String(formData.dateOfBirth || '').trim()

      // Mark onboarding as complete
      payload.isOnboardingComplete = true

      // Submit onboarding data
      const result = await onboardingService.submitOnboardingJson(payload)
      console.log('Onboarding successful:', result.message)

      // Verify onboarding status via /api/auth/me before navigating
      try {
        // force a network read — the cached /auth/me predates the submit above
        const user = await authService.getMe(true)
        const isOnboardingComplete = user?.isOnboardingComplete === true

        // Store the verified onboarding status
        localStorage.setItem('isOnboardingComplete', String(isOnboardingComplete))

        if (isOnboardingComplete) {
          // Successfully completed onboarding, navigate to dashboard
          toast.success('Profile created successfully! Welcome to iCastar.')
          navigate('/dashboard')
        } else {
          // Backend didn't set isOnboardingComplete flag - show error
          console.error('Backend did not set isOnboardingComplete flag')
          toast.error('Onboarding status not updated. Please contact support.')
        }
      } catch (verifyError) {
        // /api/auth/me call failed - still try to navigate but log warning
        console.warn('Failed to verify onboarding status:', verifyError)
        localStorage.setItem('isOnboardingComplete', 'true')
        toast.success('Profile created successfully!')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Onboarding submission failed:', error)
      setErrors(prev => ({
        ...prev,
        form: 'Failed to submit the form. Please try again.'
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Removed role-specific forms; onboarding now captures only common fields

  return (
    <div className='bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl mx-auto'>
      <h2 className='text-2xl sm:text-3xl font-bold text-center mb-2'>
        Profile Details
      </h2>
      <p className='text-gray-500 text-center mb-8'>
        Complete your artist profile to get started
      </p>

      <form onSubmit={handleSubmit}>
        <div className='space-y-8'>
          <CommonFields
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        </div>

        <div className='mt-10 pt-6 border-t flex justify-center items-center gap-4'>
          <button
            type='submit'
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className='bg-primary text-white font-bold py-3 px-12 rounded-lg shadow-md hover:bg-primary/90 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70'>
            {isSubmitting ? (
              <span className='inline-flex items-center gap-2'>
                <span className='inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                Submitting...
              </span>
            ) : (
              'Submit & Complete Onboarding'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Step2_ProfileForm
