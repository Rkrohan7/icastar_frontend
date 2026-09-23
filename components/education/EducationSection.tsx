import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '@/components/Icon'
import type {
  ArtistEducation,
  EducationCourseType,
  EducationLevel,
} from '@/services/artistService'

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

export const EDUCATION_LEVELS: { value: EducationLevel; label: string }[] = [
  { value: 'CERTIFICATION', label: 'Certification / Workshop' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'GRADUATION', label: 'Graduation' },
  { value: 'POST_GRADUATION', label: 'Post Graduation' },
  { value: 'DOCTORATE', label: 'Doctorate / PhD' },
  { value: 'HIGHER_SECONDARY_12TH', label: '12th' },
  { value: 'SCHOOL_10TH', label: '10th' },
  { value: 'OTHER', label: 'Other' },
]

const COURSE_TYPES: { value: EducationCourseType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full time' },
  { value: 'PART_TIME', label: 'Part time' },
  { value: 'DISTANCE', label: 'Correspondence / Distance' },
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

export const educationLevelLabel = (value?: EducationLevel) =>
  EDUCATION_LEVELS.find(l => l.value === value)?.label

const courseTypeLabel = (value?: EducationCourseType) =>
  COURSE_TYPES.find(t => t.value === value)?.label

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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

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
    if (!school && !draft.courseName.trim()) e.courseName = 'Please enter the course name'
    if (!draft.institution.trim()) e.institution = 'Please enter the school, college or institute'
    if (!draft.isPursuing && !draft.endYear) e.endYear = 'Please select the passing year'
    if (draft.startYear && draft.endYear && Number(draft.endYear) < Number(draft.startYear)) {
      e.endYear = 'Passing year cannot be before the start year'
    }
    if (draft.startYear && Number(draft.startYear) > CURRENT_YEAR) {
      e.startYear = 'Start year cannot be in the future'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    const edu: ArtistEducation = {
      ...(initial?.id != null ? { id: initial.id } : {}),
      educationLevel: draft.educationLevel,
      courseName: draft.courseName.trim() || educationLevelLabel(draft.educationLevel) || '',
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
              {initial ? 'Edit education' : 'Add education'}
            </h3>
            <p className='text-xs text-gray-500 mt-0.5'>
              Degrees, acting / dance / music training and workshops all count.
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            disabled={saving}
            className='text-gray-400 hover:text-gray-600 transition-colors'
            aria-label='Close'>
            <Icon name='X' size={20} />
          </button>
        </div>

        <div className='px-6 py-5 space-y-5 overflow-y-auto'>
          <div>
            <label className='block text-sm font-medium mb-2'>
              Education <span className='text-red-500'>*</span>
            </label>
            <div className='flex flex-wrap gap-2'>
              {EDUCATION_LEVELS.map(l => (
                <button
                  key={l.value}
                  type='button'
                  className={pill(draft.educationLevel === l.value)}
                  onClick={() => set({ educationLevel: l.value })}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                {school ? 'Board' : certification ? 'Course / Training name' : 'Course'}{' '}
                {!school && <span className='text-red-500'>*</span>}
              </label>
              <input
                type='text'
                value={draft.courseName}
                maxLength={150}
                onChange={e => set({ courseName: e.target.value })}
                placeholder={
                  school ? 'e.g. CBSE, Maharashtra State Board'
                    : certification ? 'e.g. Acting Workshop, Kathak Visharad'
                    : 'e.g. B.A. Theatre Arts, B.Com'
                }
                className={`${inputCls} ${errors.courseName ? 'border-red-500' : ''}`}
              />
              {errors.courseName && <p className='text-red-500 text-xs mt-1'>{errors.courseName}</p>}
            </div>
            {!school && (
              <div>
                <label className='block text-sm font-medium mb-2'>Specialization</label>
                <input
                  type='text'
                  value={draft.specialization}
                  maxLength={100}
                  onChange={e => set({ specialization: e.target.value })}
                  placeholder='e.g. Acting, Direction, Classical Dance'
                  className={inputCls}
                />
              </div>
            )}
            <div className={school ? '' : 'sm:col-span-2'}>
              <label className='block text-sm font-medium mb-2'>
                {school ? 'School' : 'University / Institute'} <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={draft.institution}
                maxLength={150}
                onChange={e => set({ institution: e.target.value })}
                placeholder={school ? 'e.g. St. Xavier’s High School' : 'e.g. FTII Pune, NSD Delhi, Mumbai University'}
                className={`${inputCls} ${errors.institution ? 'border-red-500' : ''}`}
              />
              {errors.institution && <p className='text-red-500 text-xs mt-1'>{errors.institution}</p>}
            </div>
          </div>

          {!school && (
            <div>
              <label className='block text-sm font-medium mb-2'>Course type</label>
              <div className='flex flex-wrap gap-2'>
                {COURSE_TYPES.map(t => (
                  <button
                    key={t.value}
                    type='button'
                    className={pill(draft.courseType === t.value)}
                    onClick={() => set({ courseType: t.value })}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className='block text-sm font-medium mb-2'>Are you currently pursuing this?</label>
            <div className='flex gap-2'>
              <button type='button' className={pill(draft.isPursuing)} onClick={() => set({ isPursuing: true })}>
                Yes
              </button>
              <button type='button' className={pill(!draft.isPursuing)} onClick={() => set({ isPursuing: false })}>
                No
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
            <div>
              <label className='block text-sm font-medium mb-2'>Start year</label>
              <select
                value={draft.startYear}
                onChange={e => set({ startYear: e.target.value })}
                className={`${inputCls} ${errors.startYear ? 'border-red-500' : ''}`}>
                <option value=''>Select year</option>
                {YEARS.filter(y => y <= CURRENT_YEAR).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {errors.startYear && <p className='text-red-500 text-xs mt-1'>{errors.startYear}</p>}
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                {draft.isPursuing ? 'Expected passing year' : 'Passing year'}{' '}
                {!draft.isPursuing && <span className='text-red-500'>*</span>}
              </label>
              <select
                value={draft.endYear}
                onChange={e => set({ endYear: e.target.value })}
                className={`${inputCls} ${errors.endYear ? 'border-red-500' : ''}`}>
                <option value=''>Select year</option>
                {YEARS.filter(y => draft.isPursuing || y <= CURRENT_YEAR).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {errors.endYear && <p className='text-red-500 text-xs mt-1'>{errors.endYear}</p>}
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Grade / Marks</label>
              <input
                type='text'
                value={draft.grade}
                maxLength={30}
                onChange={e => set({ grade: e.target.value })}
                placeholder='e.g. 75%, 8.2 CGPA'
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Details</label>
            <textarea
              value={draft.description}
              maxLength={DESCRIPTION_MAX}
              rows={3}
              onChange={e => set({ description: e.target.value })}
              placeholder='Mentors, productions staged, awards or anything else worth mentioning'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition'
            />
            <p className='text-xs text-gray-400 text-right mt-1'>
              {DESCRIPTION_MAX - draft.description.length} character(s) left
            </p>
          </div>
        </div>

        <div className='flex justify-end gap-3 px-6 py-4 border-t border-gray-100'>
          <button
            type='button'
            onClick={onClose}
            disabled={saving}
            className='px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors'>
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={saving}
            className='px-6 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-60'>
            {saving ? 'Saving...' : 'Save'}
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
    if (!window.confirm(`Delete "${edu.courseName}" from ${edu.institution}?`)) return
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
      Add education
    </button>
  )

  return (
    <div>
      {!hideHeader ? (
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-800'>Education</h3>
          {educations.length > 0 && addLink}
        </div>
      ) : (
        educations.length > 0 && <div className='flex justify-end mb-3'>{addLink}</div>
      )}

      {educations.length === 0 ? (
        <div className='border border-dashed border-gray-300 rounded-xl p-5 text-center'>
          <p className='text-sm text-gray-600'>
            Add your education — degrees, drama / dance / music schools and workshops you have attended.
          </p>
          {!readOnly && (
            <button
              type='button'
              onClick={() => setEditingIndex(null)}
              className='mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors'>
              <Icon name='Plus' size={16} />
              Add education
            </button>
          )}
        </div>
      ) : (
        <ul className='divide-y divide-gray-100'>
          {sorted.map(({ edu, index }) => {
            const years = edu.isPursuing
              ? `${edu.startYear ? `${edu.startYear} – ` : ''}Pursuing${edu.endYear ? ` (expected ${edu.endYear})` : ''}`
              : [edu.startYear, edu.endYear].filter(Boolean).join(' – ')
            const meta = [years, courseTypeLabel(edu.courseType), edu.grade].filter(Boolean).join(' · ')
            const level = educationLevelLabel(edu.educationLevel)
            return (
              <li key={edu.id ?? `new-${index}`} className='py-4 first:pt-0 last:pb-0'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='font-semibold text-gray-900'>
                        {edu.courseName}
                        {edu.specialization && <span className='font-normal text-gray-600'> — {edu.specialization}</span>}
                      </p>
                      {edu.isPursuing && (
                        <span className='px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium'>
                          Pursuing
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-gray-700'>{edu.institution}</p>
                    {meta && <p className='text-xs text-gray-500 mt-0.5'>{meta}</p>}
                    {level && level !== edu.courseName && (
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
                        aria-label='Edit education'>
                        <Icon name='Pencil' size={16} />
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDelete(edu, index)}
                        disabled={deletingIndex === index}
                        className='p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors disabled:opacity-50'
                        aria-label='Delete education'>
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
