import React, { useState } from 'react'
import { Card } from '../../components/Card'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import auditionService from '../../services/auditionService'
import {
  AuditionRoleType,
  AuditionProjectType,
  GenderPreference,
  ExperienceLevel,
  AuditionMode,
  CompensationType,
  AuditionVisibility,
  ArtistCategory,
  CreateAuditionDto,
} from '../../types'
import { CalendarIcon, MapPinIcon, BriefcaseIcon } from '../../components/icons/IconComponents'
import { useTranslation } from '@/i18n'

const TIP_KEYS = ['tip1', 'tip2', 'tip3', 'tip4', 'tip5']

export const CreateAuditionPage: React.FC = () => {
  const navigate = useNavigate()
  const { t, tEnum } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState<CreateAuditionDto>({
    title: '',
    roleType: 'Actor',
    projectType: 'Movie',
    description: '',
    ageRangeMin: undefined,
    ageRangeMax: undefined,
    gender: 'Any',
    languages: [],
    skills: [],
    category: ArtistCategory.Actor,
    experienceLevel: 'Any',
    auditionMode: 'Online',
    location: '',
    auditionDate: '',
    auditionTime: '',
    submissionDeadline: '',
    compensationType: 'Paid',
    budgetMin: undefined,
    budgetMax: undefined,
    currency: 'USD',
    visibility: 'Public',
    invitedArtistIds: [],
    categoryFilter: [],
    isPublished: false,
  })

  const [languageInput, setLanguageInput] = useState('')
  const [skillInput, setSkillInput] = useState('')

  // Handle input changes
  const handleInputChange = (field: keyof CreateAuditionDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Add language tag
  const addLanguage = () => {
    if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, languageInput.trim()],
      }))
      setLanguageInput('')
    }
  }

  // Remove language tag
  const removeLanguage = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }))
  }

  // Add skill tag
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }))
      setSkillInput('')
    }
  }

  // Remove skill tag
  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  // Save as draft
  const handleSaveDraft = async () => {
    try {
      setIsSubmitting(true)
      const draftData = { ...formData, isPublished: false }
      await auditionService.createAudition(draftData)
      toast.success(t('createAudition.toast.draftSaved'))
      navigate('/recruiter/auditions')
    } catch (error: any) {
      console.error('Failed to save draft:', error)
      toast.error(error.response?.data?.message || t('createAudition.toast.draftFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Publish audition
  const handlePublish = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error(t('createAudition.toast.titleRequired'))
      return
    }
    if (!formData.description.trim()) {
      toast.error(t('createAudition.toast.descriptionRequired'))
      return
    }
    if (!formData.submissionDeadline) {
      toast.error(t('createAudition.toast.deadlineRequired'))
      return
    }

    try {
      setIsSubmitting(true)
      const publishData = { ...formData, isPublished: true }
      await auditionService.createAudition(publishData)
      toast.success(t('createAudition.toast.published'))
      navigate('/recruiter/auditions')
    } catch (error: any) {
      console.error('Failed to publish audition:', error)
      toast.error(error.response?.data?.message || t('createAudition.toast.publishFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='space-y-6 p-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>{t('createAudition.title')}</h1>
          <p className='text-sm text-gray-600 mt-1'>{t('createAudition.subtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/recruiter/auditions')}
          className='px-4 py-2 text-gray-600 hover:text-gray-900 font-medium'>
          {t('common.actions.cancel')}
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Form */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Basic Details */}
          <Card>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>{t('createAudition.basic.title')}</h3>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {t('createAudition.basic.auditionTitle')} <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('createAudition.basic.auditionTitlePlaceholder')}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>{t('createAudition.basic.roleType')}</label>
                  <select
                    value={formData.roleType}
                    onChange={(e) => handleInputChange('roleType', e.target.value as AuditionRoleType)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'>
                    <option value='Actor'>{t('createAudition.roleTypes.actor')}</option>
                    <option value='Singer'>{t('createAudition.roleTypes.singer')}</option>
                    <option value='Dancer'>{t('createAudition.roleTypes.dancer')}</option>
                    <option value='Voice Artist'>{t('createAudition.roleTypes.voiceArtist')}</option>
                    <option value='Model'>{t('createAudition.roleTypes.model')}</option>
                    <option value='Other'>{tEnum('Other')}</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>{t('createAudition.basic.projectType')}</label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => handleInputChange('projectType', e.target.value as AuditionProjectType)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'>
                    <option value='Movie'>{t('createAudition.projectTypes.movie')}</option>
                    <option value='Ad Campaign'>{t('createAudition.projectTypes.adCampaign')}</option>
                    <option value='Web Series'>{t('createAudition.projectTypes.webSeries')}</option>
                    <option value='TV Show'>{t('createAudition.projectTypes.tvShow')}</option>
                    <option value='Event'>{t('createAudition.projectTypes.event')}</option>
                    <option value='Music Video'>{t('createAudition.projectTypes.musicVideo')}</option>
                    <option value='Theatre'>{t('createAudition.projectTypes.theatre')}</option>
                    <option value='Other'>{tEnum('Other')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {t('common.labels.description')} <span className='text-red-500'>*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('createAudition.basic.descriptionPlaceholder')}
                  rows={5}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                />
              </div>
            </div>
          </Card>

          {/* Requirements */}
          <Card>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>{t('createAudition.requirements.title')}</h3>

            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>{t('createAudition.requirements.ageMin')}</label>
                  <input
                    type='number'
                    value={formData.ageRangeMin || ''}
                    onChange={(e) => handleInputChange('ageRangeMin', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder='18'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>{t('createAudition.requirements.ageMax')}</label>
                  <input
                    type='number'
                    value={formData.ageRangeMax || ''}
                    onChange={(e) => handleInputChange('ageRangeMax', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder='35'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>{t('common.labels.gender')}</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value as GenderPreference)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'>
                    <option value='Any'>{tEnum('Any')}</option>
                    <option value='Male'>{tEnum('Male')}</option>
                    <option value='Female'>{tEnum('Female')}</option>
                    <option value='Non-Binary'>{t('createAudition.requirements.nonBinary')}</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>{t('createAudition.requirements.experienceLevel')}</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => handleInputChange('experienceLevel', e.target.value as ExperienceLevel)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'>
                    <option value='Any'>{tEnum('Any')}</option>
                    <option value='Beginner'>{tEnum('Beginner')}</option>
                    <option value='Intermediate'>{tEnum('Intermediate')}</option>
                    <option value='Expert'>{tEnum('Expert')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>{t('common.labels.category')}</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value as ArtistCategory)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'>
                  {Object.entries(ArtistCategory).map(([catKey, cat]) => (
                    <option key={cat} value={cat}>
                      {t(`createAudition.categories.${catKey}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>{t('common.labels.languages')}</label>
                <div className='flex gap-2 mb-2'>
                  <input
                    type='text'
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    placeholder={t('createAudition.requirements.languagePlaceholder')}
                    className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                  <button
                    type='button'
                    onClick={addLanguage}
                    className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'>
                    {t('common.actions.add')}
                  </button>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {formData.languages.map((lang) => (
                    <span
                      key={lang}
                      className='inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm'>
                      {lang}
                      <button type='button' onClick={() => removeLanguage(lang)} className='hover:text-purple-900'>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>{t('common.labels.skills')}</label>
                <div className='flex gap-2 mb-2'>
                  <input
                    type='text'
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder={t('createAudition.requirements.skillPlaceholder')}
                    className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                  <button
                    type='button'
                    onClick={addSkill}
                    className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'>
                    {t('common.actions.add')}
                  </button>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className='inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm'>
                      {skill}
                      <button type='button' onClick={() => removeSkill(skill)} className='hover:text-indigo-900'>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Audition Info */}
          <Card>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>{t('createAudition.info.title')}</h3>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>{t('createAudition.info.mode')}</label>
                <select
                  value={formData.auditionMode}
                  onChange={(e) => handleInputChange('auditionMode', e.target.value as AuditionMode)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'>
                  <option value='Online'>{t('createAudition.info.online')}</option>
                  <option value='In-Person'>{t('createAudition.info.inPerson')}</option>
                  <option value='Hybrid'>{t('createAudition.info.hybrid')}</option>
                </select>
              </div>

              {(formData.auditionMode === 'In-Person' || formData.auditionMode === 'Hybrid') && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    <MapPinIcon className='inline h-4 w-4 mr-1' />
                    {t('common.labels.location')}
                  </label>
                  <input
                    type='text'
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder={t('createAudition.info.locationPlaceholder')}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    <CalendarIcon className='inline h-4 w-4 mr-1' />
                    {t('createAudition.info.date')}
                  </label>
                  <input
                    type='date'
                    value={formData.auditionDate}
                    onChange={(e) => handleInputChange('auditionDate', e.target.value)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>{t('createAudition.info.time')}</label>
                  <input
                    type='time'
                    value={formData.auditionTime}
                    onChange={(e) => handleInputChange('auditionTime', e.target.value)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {t('createAudition.info.deadline')} <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  value={formData.submissionDeadline}
                  onChange={(e) => handleInputChange('submissionDeadline', e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                />
              </div>
            </div>
          </Card>

          {/* Compensation */}
          <Card>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>{t('createAudition.compensation.title')}</h3>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>{t('createAudition.compensation.type')}</label>
                <select
                  value={formData.compensationType}
                  onChange={(e) => handleInputChange('compensationType', e.target.value as CompensationType)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'>
                  <option value='Paid'>{tEnum('Paid')}</option>
                  <option value='Unpaid'>{tEnum('Unpaid')}</option>
                  <option value='Negotiable'>{t('createAudition.compensation.negotiable')}</option>
                </select>
              </div>

              {formData.compensationType === 'Paid' && (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>{t('createAudition.compensation.budgetMin')}</label>
                    <input
                      type='number'
                      value={formData.budgetMin || ''}
                      onChange={(e) => handleInputChange('budgetMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder='10000'
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>{t('createAudition.compensation.budgetMax')}</label>
                    <input
                      type='number'
                      value={formData.budgetMax || ''}
                      onChange={(e) => handleInputChange('budgetMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder='50000'
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>{t('createAudition.compensation.currency')}</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'>
                      <option value='USD'>USD</option>
                      <option value='INR'>INR</option>
                      <option value='EUR'>EUR</option>
                      <option value='GBP'>GBP</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='lg:col-span-1 space-y-6'>
          {/* Visibility Settings */}
          <Card>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>{t('createAudition.visibility.title')}</h3>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>{t('createAudition.visibility.label')}</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => handleInputChange('visibility', e.target.value as AuditionVisibility)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'>
                  <option value='Public'>{t('createAudition.visibility.public')}</option>
                  <option value='Category Based'>{t('createAudition.visibility.categoryBased')}</option>
                  <option value='Invited Only'>{t('createAudition.visibility.invitedOnly')}</option>
                </select>
              </div>

              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <p className='text-sm text-blue-800'>
                  <BriefcaseIcon className='inline h-4 w-4 mr-1' />
                  {formData.visibility === 'Public' && t('createAudition.visibility.publicHint')}
                  {formData.visibility === 'Category Based' &&
                    t('createAudition.visibility.categoryBasedHint')}
                  {formData.visibility === 'Invited Only' && t('createAudition.visibility.invitedOnlyHint')}
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>{t('common.labels.actions')}</h3>

            <div className='space-y-3'>
              <button
                onClick={handlePublish}
                disabled={isSubmitting}
                className='w-full px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'>
                {isSubmitting ? t('createAudition.actions.publishing') : t('createAudition.actions.publish')}
              </button>

              <button
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className='w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed'>
                {isSubmitting ? t('common.actions.saving') : t('createAudition.actions.saveDraft')}
              </button>

              <button
                onClick={() => navigate('/recruiter/auditions')}
                className='w-full px-4 py-3 text-gray-600 hover:text-gray-900 font-medium'>
                {t('common.actions.cancel')}
              </button>
            </div>
          </Card>

          {/* Help Card */}
          <Card className='bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'>
            <h3 className='text-sm font-semibold text-purple-900 mb-2'>{t('createAudition.tips.title')}</h3>
            <ul className='text-xs text-purple-800 space-y-2'>
              {TIP_KEYS.map((key) => (
                <li key={key}>{t(`createAudition.tips.${key}`)}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CreateAuditionPage
