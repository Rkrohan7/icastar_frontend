import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '@/components/Icon'
import type {
  ArtistEducation,
  EducationCourseType,
  EducationLevel,
} from '@/services/artistService'
import { translate, translateIn, useTranslation, type TranslateVars } from '@/i18n'

type TFn = (key: string, vars?: TranslateVars) => string

// Naukri-style "Education" section, mirroring ExperienceSection: a list of
// education cards with an "Add education" link and a modal to add / edit each
// entry. The parent owns the list and decides how to persist it (local state
// during onboarding, API calls on the profile page).

interface EducationSectionProps {
  educations: ArtistEducation[]
  // index is null when adding a new entry
  onSave: (education: ArtistEducation, index: number | null) => Promise<void> | void
  onDelete: (education: ArtistEducation, index: number) => Promise<void> | void
  readOnly?: boolean
  // Hide the built-in heading when the parent already renders one
  hideHeader?: boolean
}

export const EDUCATION_LEVELS: { value: EducationLevel; labelKey: string }[] = [
  { value: 'CERTIFICATION', labelKey: 'educationSection.levels.certification' },
  { value: 'DIPLOMA', labelKey: 'educationSection.levels.diploma' },
  { value: 'GRADUATION', labelKey: 'educationSection.levels.graduation' },
  { value: 'POST_GRADUATION', labelKey: 'educationSection.levels.postGraduation' },
  { value: 'DOCTORATE', labelKey: 'educationSection.levels.doctorate' },
  { value: 'HIGHER_SECONDARY_12TH', labelKey: 'educationSection.levels.higherSecondary12th' },
  { value: 'SCHOOL_10TH', labelKey: 'educationSection.levels.school10th' },
  { value: 'OTHER', labelKey: 'educationSection.levels.other' },
]

const COURSE_TYPES: { value: EducationCourseType; labelKey: string }[] = [
  { value: 'FULL_TIME', labelKey: 'educationSection.courseTypes.fullTime' },
  { value: 'PART_TIME', labelKey: 'educationSection.courseTypes.partTime' },
  { value: 'DISTANCE', labelKey: 'educationSection.courseTypes.distance' },
]

// Order used when listing: highest qualification first
const LEVEL_RANK: Record<EducationLevel, number> = {
  DOCTORATE: 0,
  POST_GRADUATION: 1,
  GRADUATION: 2,
  DIPLOMA: 3,
  CERTIFICATION: 4,
  HIGHER_SECONDARY_12TH: 5,
  SCHOOL_10TH: 6,
  OTHER: 7,
}

const isSchool = (level: EducationLevel) => level === 'SCHOOL_10TH' || level === 'HIGHER_SECONDARY_12TH'

const CURRENT_YEAR = new Date().getFullYear()
// Passing year may be a few years ahead for ongoing courses
const YEARS = Array.from({ length: 67 }, (_, i) => CURRENT_YEAR + 6 - i)

// Pass `t` from useTranslation() when calling from a component.
export const educationLevelLabel = (value?: EducationLevel, t: TFn = translate) => {
  const level = EDUCATION_LEVELS.find(l => l.value === value)
  return level ? t(level.labelKey) : undefined
}

// English label — used as the stored course name for 10th / 12th entries, so
// saved data does not depend on the UI language.
const englishLevelLabel = (value?: EducationLevel) =>
  educationLevelLabel(value, (key, vars) => translateIn('en', key, vars))

const courseTypeLabel = (t: TFn, value?: EducationCourseType) => {
  const type = COURSE_TYPES.find(c => c.value === value)
  return type ? t(type.labelKey) : undefined
}

// ----- modal ------------------------------------------------------------------

interface Draft {
  educationLevel: EducationLevel
  courseName: string
  specialization: string
  institution: string
  courseType: EducationCourseType
  isPursuing: boolean
  startYear: string
  endYear: string
  grade: string
  description: string
}

const DESCRIPTION_MAX = 500

const toDraft = (edu?: ArtistEducation | null): Draft => ({
  educationLevel: edu?.educationLevel ?? 'GRADUATION',
  courseName: edu?.courseName ?? '',
  specialization: edu?.specialization ?? '',
  institution: edu?.institution ?? '',
  courseType: edu?.courseType ?? 'FULL_TIME',
  isPursuing: edu?.isPursuing ?? false,
  startYear: edu?.startYear != null ? String(edu.startYear) : '',
  endYear: edu?.endYear != null ? String(edu.endYear) : '',
  grade: edu?.grade ?? '',
  description: edu?.description ?? '',
})

const inputCls =
  'h-11 px-3 border border-gray-300 rounded-lg w-full bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition'

interface EducationModalProps {
  initial: ArtistEducation | null
  onClose: () => void
  onSubmit: (edu: ArtistEducation) => Promise<void>
}

const EducationModal: React.FC<EducationModalProps> = ({ initial, onClose, onSubmit }) => {
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial))
  // Values are translation keys, resolved with t() at render
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, saving])

  const set = (patch: Partial<Draft>) => setDraft(prev => ({ ...prev, ...patch }))

  const school = isSchool(draft.educationLevel)
  const certification = draft.educationLevel === 'CERTIFICATION'

  const validate = () => {
    const e: Record<string, string> = {}
    // For 10th / 12th the level itself is the course; the board goes in courseName
    if (!school && !draft.courseName.trim()) e.courseName = 'educationSection.errors.courseRequired'
    if (!draft.institution.trim()) e.institution = 'educationSection.errors.institutionRequired'
    if (!draft.isPursuing && !draft.endYear) e.endYear = 'educationSection.errors.passingYearRequired'
    if (draft.startYear && draft.endYear && Number(draft.endYear) < Number(draft.startYear)) {
      e.endYear = 'educationSection.errors.passingBeforeStart'
    }
    if (draft.startYear && Number(draft.startYear) > CURRENT_YEAR) {
      e.startYear = 'educationSection.errors.startInFuture'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    const edu: ArtistEducation = {
      ...(initial?.id != null ? { id: initial.id } : {}),
      educationLevel: draft.educationLevel,
      courseName: draft.courseName.trim() || englishLevelLabel(draft.educationLevel) || '',
      specialization: draft.specialization.trim() || undefined,
      institution: draft.institution.trim(),
      courseType: school ? undefined : draft.courseType,
      isPursuing: draft.isPursuing,
      startYear: draft.startYear ? Number(draft.startYear) : null,
      endYear: draft.endYear ? Number(draft.endYear) : null,
      grade: draft.grade.trim() || undefined,
      description: draft.description.trim() || undefined,
    }
    try {
      setSaving(true)
      await onSubmit(edu)
    } finally {
      setSaving(false)
    }
  }

  const pill = (active: boolean) =>
    `px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
      active
        ? 'border-primary bg-primary/10 text-primary'
        : 'border-gray-300 text-gray-600 hover:border-gray-400'
    }`

  // Portal keeps the modal's inputs outside any parent <form>, so pressing
  // Enter here can never submit the onboarding form.
  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
      onClick={() => !saving && onClose()}>
      <div
        className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden'
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-modal='true'>
        <div className='flex items-start justify-between px-6 py-4 border-b border-gray-100'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              {initial ? t('educationSection.editEducation') : t('educationSection.addEducation')}
            </h3>
            <p className='text-xs text-gray-500 mt-0.5'>
              {t('educationSection.modal.subtitle')}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            disabled={saving}
            className='text-gray-400 hover:text-gray-600 transition-colors'
            aria-label={t('common.actions.close')}>
            <Icon name='X' size={20} />
          </button>
        </div>

        <div className='px-6 py-5 space-y-5 overflow-y-auto'>
          <div>
            <label className='block text-sm font-medium mb-2'>
              {t('common.labels.education')} <span className='text-red-500'>*</span>
            </label>
            <div className='flex flex-wrap gap-2'>
              {EDUCATION_LEVELS.map(l => (
                <button
                  key={l.value}
                  type='button'
                  className={pill(draft.educationLevel === l.value)}
                  onClick={() => set({ educationLevel: l.value })}>
                  {t(l.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                {school
                  ? t('educationSection.modal.boardLabel')
                  : certification
                  ? t('educationSection.modal.trainingNameLabel')
                  : t('educationSection.modal.courseLabel')}{' '}
                {!school && <span className='text-red-500'>*</span>}
              </label>
              <input
                type='text'
                value={draft.courseName}
                maxLength={150}
                onChange={e => set({ courseName: e.target.value })}
                placeholder={
                  school ? t('educationSection.modal.boardPlaceholder')
                    : certification ? t('educationSection.modal.trainingPlaceholder')
                    : t('educationSection.modal.coursePlaceholder')
                }
                className={`${inputCls} ${errors.courseName ? 'border-red-500' : ''}`}
              />
              {errors.courseName && <p className='text-red-500 text-xs mt-1'>{t(errors.courseName)}</p>}
            </div>
            {!school && (
              <div>
                <label className='block text-sm font-medium mb-2'>{t('educationSection.modal.specializationLabel')}</label>
                <input
                  type='text'
                  value={draft.specialization}
                  maxLength={100}
                  onChange={e => set({ specialization: e.target.value })}
                  placeholder={t('educationSection.modal.specializationPlaceholder')}
                  className={inputCls}
                />
              </div>
            )}
            <div className={school ? '' : 'sm:col-span-2'}>
              <label className='block text-sm font-medium mb-2'>
                {school ? t('educationSection.modal.schoolLabel') : t('educationSection.modal.institutionLabel')} <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={draft.institution}
                maxLength={150}
                onChange={e => set({ institution: e.target.value })}
                placeholder={
                  school
                    ? t('educationSection.modal.schoolPlaceholder')
                    : t('educationSection.modal.institutionPlaceholder')
                }
                className={`${inputCls} ${errors.institution ? 'border-red-500' : ''}`}
              />
              {errors.institution && <p className='text-red-500 text-xs mt-1'>{t(errors.institution)}</p>}
            </div>
          </div>

          {!school && (
            <div>
              <label className='block text-sm font-medium mb-2'>{t('educationSection.modal.courseTypeLabel')}</label>
              <div className='flex flex-wrap gap-2'>
                {COURSE_TYPES.map(type => (
                  <button
                    key={type.value}
                    type='button'
                    className={pill(draft.courseType === type.value)}
                    onClick={() => set({ courseType: type.value })}>
                    {t(type.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className='block text-sm font-medium mb-2'>{t('educationSection.modal.pursuingLabel')}</label>
            <div className='flex gap-2'>
              <button type='button' className={pill(draft.isPursuing)} onClick={() => set({ isPursuing: true })}>
                {t('common.actions.yes')}
              </button>
              <button type='button' className={pill(!draft.isPursuing)} onClick={() => set({ isPursuing: false })}>
                {t('common.actions.no')}
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
            <div>
              <label className='block text-sm font-medium mb-2'>{t('educationSection.modal.startYearLabel')}</label>
              <select
                value={draft.startYear}
                onChange={e => set({ startYear: e.target.value })}
                className={`${inputCls} ${errors.startYear ? 'border-red-500' : ''}`}>
                <option value=''>{t('educationSection.modal.selectYear')}</option>
                {YEARS.filter(y => y <= CURRENT_YEAR).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {errors.startYear && <p className='text-red-500 text-xs mt-1'>{t(errors.startYear)}</p>}
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                {draft.isPursuing
                  ? t('educationSection.modal.expectedPassingYearLabel')
                  : t('educationSection.modal.passingYearLabel')}{' '}
                {!draft.isPursuing && <span className='text-red-500'>*</span>}
              </label>
              <select
                value={draft.endYear}
                onChange={e => set({ endYear: e.target.value })}
                className={`${inputCls} ${errors.endYear ? 'border-red-500' : ''}`}>
                <option value=''>{t('educationSection.modal.selectYear')}</option>
                {YEARS.filter(y => draft.isPursuing || y <= CURRENT_YEAR).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {errors.endYear && <p className='text-red-500 text-xs mt-1'>{t(errors.endYear)}</p>}
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>{t('educationSection.modal.gradeLabel')}</label>
              <input
                type='text'
                value={draft.grade}
                maxLength={30}
                onChange={e => set({ grade: e.target.value })}
                placeholder={t('educationSection.modal.gradePlaceholder')}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>{t('educationSection.modal.detailsLabel')}</label>
            <textarea
              value={draft.description}
              maxLength={DESCRIPTION_MAX}
              rows={3}
              onChange={e => set({ description: e.target.value })}
              placeholder={t('educationSection.modal.detailsPlaceholder')}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition'
            />
            <p className='text-xs text-gray-400 text-right mt-1'>
              {t('educationSection.modal.charactersLeft', { count: DESCRIPTION_MAX - draft.description.length })}
            </p>
          </div>
        </div>

        <div className='flex justify-end gap-3 px-6 py-4 border-t border-gray-100'>
          <button
            type='button'
            onClick={onClose}
            disabled={saving}
            className='px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors'>
            {t('common.actions.cancel')}
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={saving}
            className='px-6 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-60'>
            {saving ? t('common.actions.saving') : t('common.actions.save')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ----- section ----------------------------------------------------------------

const EducationSection: React.FC<EducationSectionProps> = ({
  educations,
  onSave,
  onDelete,
  readOnly = false,
  hideHeader = false,
}) => {
  // undefined = closed, null = adding, number = editing that index
  const [editingIndex, setEditingIndex] = useState<number | null | undefined>(undefined)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)
  const { t } = useTranslation()

  // Pursuing first, then highest qualification, then most recent passing year
  const sorted = educations
    .map((edu, index) => ({ edu, index }))
    .sort((a, b) => {
      if (a.edu.isPursuing !== b.edu.isPursuing) return a.edu.isPursuing ? -1 : 1
      const rank = (LEVEL_RANK[a.edu.educationLevel] ?? 9) - (LEVEL_RANK[b.edu.educationLevel] ?? 9)
      if (rank !== 0) return rank
      return (b.edu.endYear ?? 0) - (a.edu.endYear ?? 0)
    })

  const handleDelete = async (edu: ArtistEducation, index: number) => {
    if (!window.confirm(t('educationSection.confirmDelete', { course: edu.courseName, institution: edu.institution }))) return
    try {
      setDeletingIndex(index)
      await onDelete(edu, index)
    } finally {
      setDeletingIndex(null)
    }
  }

  const addLink = !readOnly && (
    <button
      type='button'
      onClick={() => setEditingIndex(null)}
      className='text-sm font-semibold text-primary hover:underline'>
      {t('educationSection.addEducation')}
    </button>
  )

  return (
    <div>
      {!hideHeader ? (
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-800'>{t('common.labels.education')}</h3>
          {educations.length > 0 && addLink}
        </div>
      ) : (
        educations.length > 0 && <div className='flex justify-end mb-3'>{addLink}</div>
      )}

      {educations.length === 0 ? (
        <div className='border border-dashed border-gray-300 rounded-xl p-5 text-center'>
          <p className='text-sm text-gray-600'>
            {t('educationSection.emptyText')}
          </p>
          {!readOnly && (
            <button
              type='button'
              onClick={() => setEditingIndex(null)}
              className='mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors'>
              <Icon name='Plus' size={16} />
              {t('educationSection.addEducation')}
            </button>
          )}
        </div>
      ) : (
        <ul className='divide-y divide-gray-100'>
          {sorted.map(({ edu, index }) => {
            const years = edu.isPursuing
              ? edu.startYear
                ? edu.endYear
                  ? t('educationSection.years.pursuingFromExpected', { start: edu.startYear, end: edu.endYear })
                  : t('educationSection.years.pursuingFrom', { start: edu.startYear })
                : edu.endYear
                ? t('educationSection.years.pursuingExpected', { end: edu.endYear })
                : t('educationSection.years.pursuing')
              : [edu.startYear, edu.endYear].filter(Boolean).join(' – ')
            const meta = [years, courseTypeLabel(t, edu.courseType), edu.grade].filter(Boolean).join(' · ')
            const level = educationLevelLabel(edu.educationLevel, t)
            // 10th / 12th entries store the English level label as the course name
            const levelEn = englishLevelLabel(edu.educationLevel)
            const courseTitle = level && levelEn === edu.courseName ? level : edu.courseName
            return (
              <li key={edu.id ?? `new-${index}`} className='py-4 first:pt-0 last:pb-0'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='font-semibold text-gray-900'>
                        {courseTitle}
                        {edu.specialization && <span className='font-normal text-gray-600'> — {edu.specialization}</span>}
                      </p>
                      {edu.isPursuing && (
                        <span className='px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium'>
                          {t('educationSection.pursuing')}
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-gray-700'>{edu.institution}</p>
                    {meta && <p className='text-xs text-gray-500 mt-0.5'>{meta}</p>}
                    {level && level !== edu.courseName && levelEn !== edu.courseName && (
                      <span className='inline-block mt-2 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-medium'>
                        {level}
                      </span>
                    )}
                    {edu.description && (
                      <p className='text-sm text-gray-600 mt-2 whitespace-pre-line break-words'>{edu.description}</p>
                    )}
                  </div>
                  {!readOnly && (
                    <div className='flex items-center gap-1 shrink-0'>
                      <button
                        type='button'
                        onClick={() => setEditingIndex(index)}
                        className='p-1.5 rounded-md text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors'
                        aria-label={t('educationSection.editAria')}>
                        <Icon name='Pencil' size={16} />
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDelete(edu, index)}
                        disabled={deletingIndex === index}
                        className='p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors disabled:opacity-50'
                        aria-label={t('educationSection.deleteAria')}>
                        <Icon name='Trash2' size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {editingIndex !== undefined && (
        <EducationModal
          initial={editingIndex === null ? null : educations[editingIndex]}
          onClose={() => setEditingIndex(undefined)}
          onSubmit={async edu => {
            await onSave(edu, editingIndex)
            setEditingIndex(undefined)
          }}
        />
      )}
    </div>
  )
}

export default EducationSection
