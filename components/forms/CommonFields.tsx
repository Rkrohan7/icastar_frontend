import React, { useState, useEffect } from 'react'
import FileUpload from '../FileUpload'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { onboardingService } from '@/services/onboardingService'
import { ArtistCategory } from '@/types'
import ExperienceSection from '@/components/experience/ExperienceSection'
import type { ArtistEducation, ArtistExperience } from '@/services/artistService'
import EducationSection from '@/components/education/EducationSection'

interface FormErrors {
  fullName?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  gender?: string
  city?: string
  category?: string
  languages?: string
  experienceYears?: string
  dateOfBirth?: string
  idProof?: string
  passport?: string
  aadharCard?: string
  panCard?: string
  faceVerification?: string
  consent?: string
  [key: string]: string | undefined
}

interface FormProps {
  formData: any
  updateFormData: (data: any) => void
  errors?: FormErrors
}

interface Category {
  id: string
  name: string
  displayName: string
  description: string
}

const CommonFields: React.FC<FormProps> = ({
  formData,
  updateFormData,
  errors = {} as FormErrors,
}) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categorySearchOpen, setCategorySearchOpen] = useState(false)
  const [categorySearchQuery, setCategorySearchQuery] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await onboardingService.getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Failed to load categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Currently-selected profession ids. Supports multiple. Falls back to the
  // legacy single `artistTypeId` so existing/in-progress data keeps working.
  const selectedIds: string[] =
    Array.isArray(formData.artistTypeIds) && formData.artistTypeIds.length
      ? formData.artistTypeIds.map(String)
      : formData.artistTypeId
      ? [String(formData.artistTypeId)]
      : []

  // Push the selection back to the form. The FIRST selected profession stays as
  // the "primary" artistTypeId (drives type-specific fields + backend compat),
  // while artistTypeIds holds the full list.
  const commitSelection = (ids: string[]) => {
    const primary = ids[0]
    const primaryCat = categories.find(cat => cat.id === primary)
    updateFormData({
      artistTypeIds: ids,
      artistTypeId: primary ?? null,
      category: (primaryCat?.name as ArtistCategory) ?? null,
    })
  }

  const toggleCategory = (categoryId: string) => {
    const exists = selectedIds.includes(categoryId)
    const next = exists
      ? selectedIds.filter(id => id !== categoryId)
      : [...selectedIds, categoryId]
    commitSelection(next)
    setCategorySearchQuery('')
  }

  const filteredCategories = categories.filter(category => {
    const searchLower = categorySearchQuery.toLowerCase()
    return (
      (category.displayName || category.name).toLowerCase().includes(searchLower) ||
      category.description.toLowerCase().includes(searchLower)
    )
  })

  const selectedCategories = categories.filter(cat => selectedIds.includes(cat.id))

  // Work experience entries — kept locally and sent with the onboarding submit.
  const experiences: ArtistExperience[] = Array.isArray(formData.experiences) ? formData.experiences : []

  const saveExperience = (exp: ArtistExperience, index: number | null) => {
    const next = [...experiences]
    if (index === null) next.push(exp)
    else next[index] = exp
    updateFormData({ experiences: next })
  }

  const deleteExperience = (_exp: ArtistExperience, index: number) => {
    updateFormData({ experiences: experiences.filter((_, i) => i !== index) })
  }

  // Education entries — kept locally and sent with the onboarding submit.
  const educations: ArtistEducation[] = Array.isArray(formData.educations) ? formData.educations : []

  const saveEducation = (edu: ArtistEducation, index: number | null) => {
    const next = [...educations]
    if (index === null) next.push(edu)
    else next[index] = edu
    updateFormData({ educations: next })
  }

  const deleteEducation = (_edu: ArtistEducation, index: number) => {
    updateFormData({ educations: educations.filter((_, i) => i !== index) })
  }

  return (
    <div className='space-y-8'>
      {/* Artist Category Selection */}
      <div>
        <h3 className='text-xl font-bold border-b pb-2 mb-6'>
          Artist Category
        </h3>
        <div className='grid grid-cols-1 gap-6'>
          <div>
            <label htmlFor='category' className='block text-sm font-medium mb-2'>
              Select Your Profession(s) <span className='text-red-500'>*</span>
            </label>
            <p className='text-xs text-gray-500 mb-2'>
              You can choose more than one — e.g. Dancer, Model and Actor.
            </p>
            <Popover open={categorySearchOpen} onOpenChange={setCategorySearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  aria-expanded={categorySearchOpen}
                  disabled={loadingCategories}
                  className={`h-11 w-full justify-between px-3 ${errors.category ? 'border-red-500' : ''}`}>
                  {loadingCategories
                    ? 'Loading professions...'
                    : selectedCategories.length > 0
                    ? `${selectedCategories.length} profession${selectedCategories.length > 1 ? 's' : ''} selected`
                    : 'Select Profession(s)'}
                  <span className='ml-2 text-gray-400'>▾</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-full p-0 bg-white' align='start'>
                <div className='p-3 border-b'>
                  <input
                    type='text'
                    placeholder='Search professions...'
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition'
                    autoFocus
                  />
                </div>
                <div className='max-h-64 overflow-y-auto'>
                  {filteredCategories.length === 0 ? (
                    <div className='p-4 text-center text-gray-500 text-sm'>
                      No professions found
                    </div>
                  ) : (
                    filteredCategories.map((category) => {
                      const checked = selectedIds.includes(category.id)
                      return (
                        <button
                          key={category.id}
                          type='button'
                          onClick={() => toggleCategory(category.id)}
                          className={`w-full flex items-start gap-3 text-left px-4 py-3 hover:bg-gray-100 transition-colors ${
                            checked ? 'bg-primary/10' : ''
                          }`}>
                          <Checkbox checked={checked} className='mt-0.5 pointer-events-none' />
                          <span>
                            <span className='block font-medium text-sm'>
                              {category.displayName || category.name}
                            </span>
                            <span className='block text-xs text-gray-500 mt-1'>
                              {category.description}
                            </span>
                          </span>
                        </button>
                      )
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Selected professions as removable chips */}
            {selectedCategories.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-3'>
                {selectedCategories.map((cat, idx) => (
                  <Badge key={cat.id} variant='secondary' className='flex items-center gap-1 py-1 pl-2.5 pr-1.5'>
                    {(cat.displayName || cat.name)}
                    {idx === 0 && <span className='text-[10px] text-primary font-semibold'>(Primary)</span>}
                    <button
                      type='button'
                      onClick={() => toggleCategory(cat.id)}
                      className='ml-0.5 rounded-full hover:bg-black/10 w-4 h-4 flex items-center justify-center text-gray-500'
                      aria-label={`Remove ${cat.displayName || cat.name}`}>
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {errors.category && (
              <p className='text-red-500 text-sm mt-1'>{errors.category}</p>
            )}

          </div>
        </div>
      </div>

      {/* Work Experience — Naukri-style list with add / edit modal */}
      <div>
        <h3 className='text-xl font-bold border-b pb-2 mb-2'>
          Work Experience
        </h3>
        <p className='text-xs text-gray-500 mb-4'>
          Add each role or project separately. New to the industry? You can skip this and add it later from your profile.
        </p>
        <ExperienceSection
          hideHeader
          experiences={experiences}
          professionOptions={selectedCategories.map(cat => ({
            id: cat.id,
            label: cat.displayName || cat.name,
          }))}
          onSave={saveExperience}
          onDelete={deleteExperience}
        />
      </div>

      {/* Education — same list + modal pattern as Work Experience */}
      <div>
        <h3 className='text-xl font-bold border-b pb-2 mb-2'>
          Education
        </h3>
        <p className='text-xs text-gray-500 mb-4'>
          Add degrees, drama / dance / music schools and workshops. Optional — you can add it later from your profile.
        </p>
        <EducationSection
          hideHeader
          educations={educations}
          onSave={saveEducation}
          onDelete={deleteEducation}
        />
      </div>

      {/* Location & Demographics */}
      <div>
        <h3 className='text-xl font-bold border-b pb-2 mb-6'>
          Location & Demographics
        </h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='city' className='block text-sm font-medium mb-2'>City</label>
            <input
              id='city'
              type='text'
              placeholder='City'
              value={formData.city || ''}
              onChange={e => updateFormData({ city: e.target.value })}
              className='h-11 px-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent transition'
            />
            {errors.city && (
              <p className='text-red-500 text-sm mt-1'>{errors.city}</p>
            )}
          </div>
          <div>
            <label htmlFor='gender' className='block text-sm font-medium mb-2'>Gender</label>
            <select
              id='gender'
              className='h-11 px-3 border border-gray-300 rounded-lg w-full bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition'
              value={formData.gender || ''}
              onChange={e => updateFormData({ gender: e.target.value })}>
              <option value=''>Select Gender</option>
              <option value='MALE'>Male</option>
              <option value='FEMALE'>Female</option>
              <option value='OTHER'>Other</option>
              <option value='PREFER_NOT_TO_SAY'>Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className='text-red-500 text-sm mt-1'>{errors.gender}</p>
            )}
          </div>

          <div>
            <label htmlFor='dateOfBirth' className='block text-sm font-medium mb-2'>Date of Birth</label>
            <input
              type='date'
              placeholder='Date of Birth'
              value={formData.dateOfBirth || ''}
              onChange={e => updateFormData({ dateOfBirth: e.target.value })}
              className='h-11 px-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent transition'
            />
            {errors.dateOfBirth && (
              <p className='text-red-500 text-sm mt-1'>{errors.dateOfBirth}</p>
            )}
          </div>
        </div>
      </div>

      {/* Skills & Experience */}
      <div>
        <h3 className='text-xl font-bold border-b pb-2 mb-6'>
          Skills & Experience
        </h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <div>
            {(() => {
              const availableLanguages = [
                'English',
                'Hindi',
                'Marathi',
                'Tamil',
                'Telugu',
                'Kannada',
                'Malayalam',
                'Bengali',
                'Punjabi',
                'Gujarati',
                'Urdu',
                'Odia',
                'Assamese',
              ]
              const selectedLanguages: string[] = Array.isArray(
                formData.languages,
              )
                ? formData.languages
                : (formData.languages || '')
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter(Boolean)

              return (
                <div>
                  <label className='block text-sm font-medium mb-2'>Languages Known</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className='h-11 w-full justify-between px-3'>
                        {selectedLanguages.length > 0
                          ? `${selectedLanguages.length} selected`
                          : 'Languages Known'}
                        <span className='ml-2 text-gray-400'>▾</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-64 p-3 space-y-2 bg-white'>
                      {availableLanguages.map(lang => {
                        const checked = selectedLanguages.includes(lang)
                        return (
                          <label key={lang} className='flex items-center gap-2'>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={val => {
                                const isChecked = Boolean(val)
                                const next = isChecked
                                  ? [...selectedLanguages, lang]
                                  : selectedLanguages.filter(l => l !== lang)
                                updateFormData({ languages: next })
                              }}
                            />
                            <span className='text-sm'>{lang}</span>
                          </label>
                        )
                      })}
                    </PopoverContent>
                  </Popover>
                  {selectedLanguages.length > 0 && (
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {selectedLanguages.map(lang => (
                        <Badge variant='secondary'>{lang}</Badge>
                      ))}
                    </div>
                  )}
                  {errors.languages && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.languages}
                    </p>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Verification & Legal removed per onboarding requirements */}
    </div>
  )
}

export default CommonFields
