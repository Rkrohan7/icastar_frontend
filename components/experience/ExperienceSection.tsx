import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '@/components/Icon'
import type { ArtistExperience, EmploymentType } from '@/services/artistService'
import { translate, useTranslation, type TranslateVars } from '@/i18n'

type TFn = (key: string, vars?: TranslateVars) => string

// Naukri-style "Employment" section: a list of experience cards with an
// "Add experience" link and a modal to add / edit each entry. The parent owns
// the list and decides how to persist it (local state during onboarding,
// API calls on the profile page).

export interface ProfessionOption {
  id: number | string
  label: string
}

interface ExperienceSectionProps {
  experiences: ArtistExperience[]
  professionOptions?: ProfessionOption[]
  // index is null when adding a new entry
  onSave: (experience: ArtistExperience, index: number | null) => Promise<void> | void
  onDelete: (experience: ArtistExperience, index: number) => Promise<void> | void
  readOnly?: boolean
  // Hide the built-in heading when the parent already renders one
  hideHeader?: boolean
}

const EMPLOYMENT_TYPES: { value: EmploymentType; labelKey: string }[] = [
  { value: 'FULL_TIME', labelKey: 'experienceSection.employmentTypes.fullTime' },
  { value: 'PART_TIME', labelKey: 'experienceSection.employmentTypes.partTime' },
  { value: 'FREELANCE', labelKey: 'experienceSection.employmentTypes.freelance' },
  { value: 'CONTRACT', labelKey: 'experienceSection.employmentTypes.contract' },
  { value: 'INTERNSHIP', labelKey: 'experienceSection.employmentTypes.internship' },
]

// `value` is what gets stored on the backend — keep it in English.
const PROJECT_TYPES: { value: string; labelKey: string }[] = [
  { value: 'Film', labelKey: 'experienceSection.projectTypes.film' },
  { value: 'Web Series', labelKey: 'experienceSection.projectTypes.webSeries' },
  { value: 'TV Serial', labelKey: 'experienceSection.projectTypes.tvSerial' },
  { value: 'Short Film', labelKey: 'experienceSection.projectTypes.shortFilm' },
  { value: 'Advertisement', labelKey: 'experienceSection.projectTypes.advertisement' },
  { value: 'Music Video', labelKey: 'experienceSection.projectTypes.musicVideo' },
  { value: 'Theatre', labelKey: 'experienceSection.projectTypes.theatre' },
  { value: 'Live Event / Show', labelKey: 'experienceSection.projectTypes.liveEvent' },
  { value: 'Modelling / Photoshoot', labelKey: 'experienceSection.projectTypes.modelling' },
  { value: 'Other', labelKey: 'experienceSection.projectTypes.other' },
]

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map(
  m => `experienceSection.months.${m}`,
)

const now = new Date()
const CURRENT_YEAR = now.getFullYear()
const YEARS = Array.from({ length: 61 }, (_, i) => CURRENT_YEAR - i)

// ----- date helpers -----------------------------------------------------------

// Dates travel as 'YYYY-MM-01'. Returns { year, month (1-12) } or null.
const parseYearMonth = (date?: string | null) => {
  if (!date) return null
  const m = /^(\d{4})-(\d{1,2})/.exec(date)
  return m ? { year: Number(m[1]), month: Number(m[2]) } : null
}

const toDateString = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, '0')}-01`

const monthIndex = (ym: { year: number; month: number }) => ym.year * 12 + (ym.month - 1)

const nowIndex = () => now.getFullYear() * 12 + now.getMonth()

// Inclusive month range for one entry, or null if dates are missing.
const monthRange = (exp: ArtistExperience): [number, number] | null => {
  const start = parseYearMonth(exp.startDate)
  if (!start) return null
  const end = exp.isCurrent ? null : parseYearMonth(exp.endDate)
  const endIdx = end ? monthIndex(end) : nowIndex()
  const startIdx = monthIndex(start)
  return endIdx >= startIdx ? [startIdx, endIdx] : null
}

// Overlapping projects (common for artists) are counted once.
const mergedMonths = (list: ArtistExperience[]) => {
  const ranges = list.map(monthRange).filter(Boolean) as [number, number][]
  ranges.sort((a, b) => a[0] - b[0])
  let total = 0
  let cur: [number, number] | null = null
  for (const r of ranges) {
    if (cur && r[0] <= cur[1] + 1) {
      cur[1] = Math.max(cur[1], r[1])
    } else {
      if (cur) total += cur[1] - cur[0] + 1
      cur = [r[0], r[1]]
    }
  }
  if (cur) total += cur[1] - cur[0] + 1
  return total
}

// Pass `t` from useTranslation() when calling from a component; falls back to
// the module-level translate() (current language) for existing callers.
export const formatMonths = (months: number, t: TFn = translate) => {
  if (months <= 0) return ''
  const y = Math.floor(months / 12)
  const m = months % 12
  const years = y ? t('experienceSection.duration.years', { count: y }) : ''
  const mos = m ? t('experienceSection.duration.months', { count: m }) : ''
  if (years && mos) return t('experienceSection.duration.yearsAndMonths', { years, months: mos })
  return years || mos
}

export const totalExperienceMonths = (list: ArtistExperience[] = []) => mergedMonths(list)

// Whole years — for the legacy numeric experienceYears field.
export const totalExperienceYears = (list: ArtistExperience[] = []) =>
  Math.floor(mergedMonths(list) / 12)

// { [artistTypeId]: whole years } — feeds professions[].experienceYears.
export const experienceYearsByProfession = (list: ArtistExperience[] = []) => {
  const groups: Record<string, ArtistExperience[]> = {}
  list.forEach(exp => {
    if (exp.artistTypeId == null) return
    const key = String(exp.artistTypeId)
    ;(groups[key] ||= []).push(exp)
  })
  const out: Record<string, number> = {}
  Object.entries(groups).forEach(([key, items]) => {
    out[key] = Math.floor(mergedMonths(items) / 12)
  })
  return out
}

const formatYearMonth = (t: TFn, date?: string | null) => {
  const ym = parseYearMonth(date)
  return ym ? `${t(MONTH_KEYS[ym.month - 1])} ${ym.year}` : ''
}

const employmentLabel = (t: TFn, value?: EmploymentType) => {
  const type = EMPLOYMENT_TYPES.find(e => e.value === value)
  return type ? t(type.labelKey) : undefined
}

// Known project types are shown translated; anything else is shown as stored.
const projectTypeLabel = (t: TFn, value: string) => {
  const type = PROJECT_TYPES.find(p => p.value === value)
  return type ? t(type.labelKey) : value
}

// ----- modal ------------------------------------------------------------------

interface Draft {
  isCurrent: boolean
  employmentType: EmploymentType
  artistTypeId: string
  title: string
  companyName: string
  projectType: string
  location: string
  startMonth: string
  startYear: string
  endMonth: string
  endYear: string
  description: string
}

const DESCRIPTION_MAX = 1000

const toDraft = (exp?: ArtistExperience | null, defaultProfessionId?: string): Draft => {
  const start = parseYearMonth(exp?.startDate)
  const end = parseYearMonth(exp?.endDate)
  return {
    isCurrent: exp?.isCurrent ?? false,
    employmentType: exp?.employmentType ?? 'FREELANCE',
    artistTypeId: exp?.artistTypeId != null ? String(exp.artistTypeId) : defaultProfessionId ?? '',
    title: exp?.title ?? '',
    companyName: exp?.companyName ?? '',
    projectType: exp?.projectType ?? '',
    location: exp?.location ?? '',
    startMonth: start ? String(start.month) : '',
    startYear: start ? String(start.year) : '',
    endMonth: end ? String(end.month) : '',
    endYear: end ? String(end.year) : '',
    description: exp?.description ?? '',
  }
}

const inputCls =
  'h-11 px-3 border border-gray-300 rounded-lg w-full bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition'

const MonthYear: React.FC<{
  month: string
  year: string
  onMonth: (v: string) => void
  onYear: (v: string) => void
  hasError: boolean
}> = ({ month, year, onMonth, onYear, hasError }) => {
  const { t } = useTranslation()
  return (
    <div className='grid grid-cols-2 gap-3'>
      <select
        value={year}
        onChange={e => onYear(e.target.value)}
        className={`${inputCls} ${hasError ? 'border-red-500' : ''}`}>
        <option value=''>{t('experienceSection.modal.selectYear')}</option>
        {YEARS.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <select
        value={month}
        onChange={e => onMonth(e.target.value)}
        className={`${inputCls} ${hasError ? 'border-red-500' : ''}`}>
        <option value=''>{t('experienceSection.modal.selectMonth')}</option>
        {MONTH_KEYS.map((m, i) => (
          <option key={m} value={i + 1}>{t(m)}</option>
        ))}
      </select>
    </div>
  )
}

interface ExperienceModalProps {
  initial: ArtistExperience | null
  professionOptions: ProfessionOption[]
  onClose: () => void
  onSubmit: (exp: ArtistExperience) => Promise<void>
}

const ExperienceModal: React.FC<ExperienceModalProps> = ({
  initial,
  professionOptions,
  onClose,
  onSubmit,
}) => {
  const [draft, setDraft] = useState<Draft>(() =>
    toDraft(initial, professionOptions.length === 1 ? String(professionOptions[0].id) : undefined),
  )
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

  const validate = () => {
    const e: Record<string, string> = {}
    if (!draft.title.trim()) e.title = 'experienceSection.errors.titleRequired'
    if (!draft.companyName.trim()) e.companyName = 'experienceSection.errors.companyRequired'
    if (professionOptions.length > 0 && !draft.artistTypeId) e.artistTypeId = 'experienceSection.errors.professionRequired'
    if (!draft.startMonth || !draft.startYear) {
      e.start = 'experienceSection.errors.startRequired'
    } else if (
      monthIndex({ year: Number(draft.startYear), month: Number(draft.startMonth) }) > nowIndex()
    ) {
      e.start = 'experienceSection.errors.startInFuture'
    }
    if (!draft.isCurrent) {
      if (!draft.endMonth || !draft.endYear) {
        e.end = 'experienceSection.errors.endRequired'
      } else if (!e.start) {
        const s = monthIndex({ year: Number(draft.startYear), month: Number(draft.startMonth) })
        const en = monthIndex({ year: Number(draft.endYear), month: Number(draft.endMonth) })
        if (en < s) e.end = 'experienceSection.errors.endBeforeStart'
        else if (en > nowIndex()) e.end = 'experienceSection.errors.endInFuture'
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    const profession = professionOptions.find(p => String(p.id) === draft.artistTypeId)
    const exp: ArtistExperience = {
      ...(initial?.id != null ? { id: initial.id } : {}),
      artistTypeId: draft.artistTypeId ? Number(draft.artistTypeId) : null,
      artistTypeName: profession?.label ?? initial?.artistTypeName,
      title: draft.title.trim(),
      companyName: draft.companyName.trim(),
      projectType: draft.projectType || undefined,
      employmentType: draft.employmentType,
      location: draft.location.trim() || undefined,
      isCurrent: draft.isCurrent,
      startDate: toDateString(Number(draft.startYear), Number(draft.startMonth)),
      endDate: draft.isCurrent ? null : toDateString(Number(draft.endYear), Number(draft.endMonth)),
      description: draft.description.trim() || undefined,
    }
    try {
      setSaving(true)
      await onSubmit(exp)
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
              {initial ? t('experienceSection.editExperience') : t('experienceSection.addExperience')}
            </h3>
            <p className='text-xs text-gray-500 mt-0.5'>
              {t('experienceSection.modal.subtitle')}
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
            <label className='block text-sm font-medium mb-2'>{t('experienceSection.modal.isCurrentLabel')}</label>
            <div className='flex gap-2'>
              <button type='button' className={pill(draft.isCurrent)} onClick={() => set({ isCurrent: true })}>
                {t('common.actions.yes')}
              </button>
              <button type='button' className={pill(!draft.isCurrent)} onClick={() => set({ isCurrent: false })}>
                {t('common.actions.no')}
              </button>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>{t('experienceSection.modal.employmentTypeLabel')}</label>
            <div className='flex flex-wrap gap-2'>
              {EMPLOYMENT_TYPES.map(type => (
                <button
                  key={type.value}
                  type='button'
                  className={pill(draft.employmentType === type.value)}
                  onClick={() => set({ employmentType: type.value })}>
                  {t(type.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {professionOptions.length > 0 && (
            <div>
              <label className='block text-sm font-medium mb-2'>
                {t('experienceSection.modal.professionLabel')} <span className='text-red-500'>*</span>
              </label>
              <select
                value={draft.artistTypeId}
                onChange={e => set({ artistTypeId: e.target.value })}
                className={`${inputCls} ${errors.artistTypeId ? 'border-red-500' : ''}`}>
                <option value=''>{t('experienceSection.modal.selectProfession')}</option>
                {professionOptions.map(p => (
                  <option key={p.id} value={String(p.id)}>{p.label}</option>
                ))}
              </select>
              {errors.artistTypeId && <p className='text-red-500 text-xs mt-1'>{t(errors.artistTypeId)}</p>}
            </div>
          )}

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                {t('experienceSection.modal.titleLabel')} <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={draft.title}
                maxLength={100}
                onChange={e => set({ title: e.target.value })}
                placeholder={t('experienceSection.modal.titlePlaceholder')}
                className={`${inputCls} ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && <p className='text-red-500 text-xs mt-1'>{t(errors.title)}</p>}
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                {t('experienceSection.modal.companyLabel')} <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={draft.companyName}
                maxLength={150}
                onChange={e => set({ companyName: e.target.value })}
                placeholder={t('experienceSection.modal.companyPlaceholder')}
                className={`${inputCls} ${errors.companyName ? 'border-red-500' : ''}`}
              />
              {errors.companyName && <p className='text-red-500 text-xs mt-1'>{t(errors.companyName)}</p>}
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>{t('experienceSection.modal.projectTypeLabel')}</label>
              <select
                value={draft.projectType}
                onChange={e => set({ projectType: e.target.value })}
                className={inputCls}>
                <option value=''>{t('experienceSection.modal.selectProjectType')}</option>
                {PROJECT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{t(type.labelKey)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>{t('common.labels.location')}</label>
              <input
                type='text'
                value={draft.location}
                maxLength={100}
                onChange={e => set({ location: e.target.value })}
                placeholder={t('experienceSection.modal.locationPlaceholder')}
                className={inputCls}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                {t('experienceSection.modal.startDateLabel')} <span className='text-red-500'>*</span>
              </label>
              <MonthYear
                month={draft.startMonth}
                year={draft.startYear}
                onMonth={v => set({ startMonth: v })}
                onYear={v => set({ startYear: v })}
                hasError={!!errors.start}
              />
              {errors.start && <p className='text-red-500 text-xs mt-1'>{t(errors.start)}</p>}
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                {t('experienceSection.modal.workedTillLabel')} {!draft.isCurrent && <span className='text-red-500'>*</span>}
              </label>
              {draft.isCurrent ? (
                <div className='h-11 px-3 flex items-center rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600'>
                  {t('experienceSection.present')}
                </div>
              ) : (
                <MonthYear
                  month={draft.endMonth}
                  year={draft.endYear}
                  onMonth={v => set({ endMonth: v })}
                  onYear={v => set({ endYear: v })}
                  hasError={!!errors.end}
                />
              )}
              {errors.end && <p className='text-red-500 text-xs mt-1'>{t(errors.end)}</p>}
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>{t('experienceSection.modal.descriptionLabel')}</label>
            <textarea
              value={draft.description}
              maxLength={DESCRIPTION_MAX}
              rows={4}
              onChange={e => set({ description: e.target.value })}
              placeholder={t('experienceSection.modal.descriptionPlaceholder')}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition'
            />
            <p className='text-xs text-gray-400 text-right mt-1'>
              {t('experienceSection.modal.charactersLeft', { count: DESCRIPTION_MAX - draft.description.length })}
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

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experiences,
  professionOptions = [],
  onSave,
  onDelete,
  readOnly = false,
  hideHeader = false,
}) => {
  // undefined = closed, null = adding, number = editing that index
  const [editingIndex, setEditingIndex] = useState<number | null | undefined>(undefined)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)

  // Current work first, then most recent start date
  const sorted = experiences
    .map((exp, index) => ({ exp, index }))
    .sort((a, b) => {
      if (a.exp.isCurrent !== b.exp.isCurrent) return a.exp.isCurrent ? -1 : 1
      return (b.exp.startDate || '').localeCompare(a.exp.startDate || '')
    })

  const { t } = useTranslation()

  const total = formatMonths(totalExperienceMonths(experiences), t)

  const handleDelete = async (exp: ArtistExperience, index: number) => {
    if (!window.confirm(t('experienceSection.confirmDelete', { title: exp.title, company: exp.companyName }))) return
    try {
      setDeletingIndex(index)
      await onDelete(exp, index)
    } finally {
      setDeletingIndex(null)
    }
  }

  const addLink = !readOnly && (
    <button
      type='button'
      onClick={() => setEditingIndex(null)}
      className='text-sm font-semibold text-primary hover:underline'>
      {t('experienceSection.addExperience')}
    </button>
  )

  return (
    <div>
      {!hideHeader ? (
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-lg font-semibold text-gray-800'>{t('common.labels.experience')}</h3>
            {total && <p className='text-xs text-gray-500'>{t('experienceSection.total', { total })}</p>}
          </div>
          {experiences.length > 0 && addLink}
        </div>
      ) : (
        experiences.length > 0 && (
          <div className='flex items-center justify-between mb-3'>
            <p className='text-sm text-gray-500'>{total && t('experienceSection.total', { total })}</p>
            {addLink}
          </div>
        )
      )}

      {experiences.length === 0 ? (
        <div className='border border-dashed border-gray-300 rounded-xl p-5 text-center'>
          <p className='text-sm text-gray-600'>
            {t('experienceSection.emptyText')}
          </p>
          {!readOnly && (
            <button
              type='button'
              onClick={() => setEditingIndex(null)}
              className='mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors'>
              <Icon name='Plus' size={16} />
              {t('experienceSection.addExperience')}
            </button>
          )}
        </div>
      ) : (
        <ul className='divide-y divide-gray-100'>
          {sorted.map(({ exp, index }) => {
            const range = monthRange(exp)
            const duration = range ? formatMonths(range[1] - range[0] + 1, t) : ''
            const period = t('experienceSection.period', {
              start: formatYearMonth(t, exp.startDate),
              end: exp.isCurrent ? t('experienceSection.present') : formatYearMonth(t, exp.endDate),
            })
            const meta = [employmentLabel(t, exp.employmentType), `${period}${duration ? ` (${duration})` : ''}`, exp.location]
              .filter(Boolean)
              .join(' · ')
            // Prefer the display label of the matching profession; backend may send the raw enum-style name
            const professionLabel =
              professionOptions.find(p => exp.artistTypeId != null && String(p.id) === String(exp.artistTypeId))
                ?.label ?? exp.artistTypeName
            return (
              <li key={exp.id ?? `new-${index}`} className='py-4 first:pt-0 last:pb-0'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='font-semibold text-gray-900'>{exp.title}</p>
                      {exp.isCurrent && (
                        <span className='px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-medium'>
                          {t('experienceSection.current')}
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-gray-700'>
                      {exp.companyName}
                      {professionLabel && <span className='text-gray-400'> · {professionLabel}</span>}
                    </p>
                    <p className='text-xs text-gray-500 mt-0.5'>{meta}</p>
                    {exp.projectType && (
                      <span className='inline-block mt-2 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-medium'>
                        {projectTypeLabel(t, exp.projectType)}
                      </span>
                    )}
                    {exp.description && (
                      <p className='text-sm text-gray-600 mt-2 whitespace-pre-line break-words'>{exp.description}</p>
                    )}
                  </div>
                  {!readOnly && (
                    <div className='flex items-center gap-1 shrink-0'>
                      <button
                        type='button'
                        onClick={() => setEditingIndex(index)}
                        className='p-1.5 rounded-md text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors'
                        aria-label={t('experienceSection.editAria')}>
                        <Icon name='Pencil' size={16} />
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDelete(exp, index)}
                        disabled={deletingIndex === index}
                        className='p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors disabled:opacity-50'
                        aria-label={t('experienceSection.deleteAria')}>
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
        <ExperienceModal
          initial={editingIndex === null ? null : experiences[editingIndex]}
          professionOptions={professionOptions}
          onClose={() => setEditingIndex(undefined)}
          onSubmit={async exp => {
            await onSave(exp, editingIndex)
            setEditingIndex(undefined)
          }}
        />
      )}
    </div>
  )
}

export default ExperienceSection
