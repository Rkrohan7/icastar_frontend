import React, { useState } from 'react'
import { ArtistCategory } from '@/types'
import CommonFields from '@/components/forms/CommonFields'
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
    if (!formData.category) newErrors.category = 'Artist type is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.city?.trim()) newErrors.city = 'City is required'

    const exp = Number(formData.experienceYears)
    if (Number.isNaN(exp) || exp < 0) newErrors.experienceYears = 'Valid years of experience is required'

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

      // artistTypeId
      if (formData.artistTypeId) {
        payload.artistTypeId = String(formData.artistTypeId)
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

      // experienceYears (number)
      const expYears = Number(formData.experienceYears)
      payload.experienceYears = Number.isNaN(expYears) ? 0 : expYears

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
