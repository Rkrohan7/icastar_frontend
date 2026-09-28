import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
  AuditionProjectType,
  AuditionRoleType,
  CastingCharacter,
  CastingProject,
  GenderPreference,
} from '../types'
import recruiterProjectsService, {
  PROJECT_TYPE_LABELS,
  ROLE_TYPE_LABELS,
} from '../services/recruiterProjectsService'
import { translate, useTranslation } from '@/i18n'

export interface ProjectCastingValue {
  projectId?: number
  projectName?: string
  projectType?: AuditionProjectType
  characterId?: number
  characterName?: string
  roleType?: AuditionRoleType
}

interface CastingErrors {
  projectId?: string
  characterId?: string
}

interface Props {
  value: ProjectCastingValue
  onChange: (next: ProjectCastingValue, character?: CastingCharacter) => void
  errors?: CastingErrors
}

const NO_ERRORS: CastingErrors = {}

const inputCls =
  'block w-full rounded-lg border border-gray-300 bg-white shadow-sm transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm px-3 py-2.5'
const errCls = 'border-red-500 focus:border-red-500 focus:ring-red-200'
const labelCls = 'block text-sm font-medium text-gray-700'
const linkBtnCls = 'text-xs font-semibold text-primary hover:underline'

const emptyProject = {
  name: '',
  projectType: 'FEATURE_FILM' as AuditionProjectType,
  productionHouse: '',
  director: '',
  language: '',
}

const emptyCharacter = {
  name: '',
  roleType: 'SUPPORTING' as AuditionRoleType,
  gender: 'ANY' as GenderPreference,
  ageMin: '' as number | '',
  ageMax: '' as number | '',
  requiredCount: 1 as number | '',
  description: '',
}

export const ProjectCastingFields: React.FC<Props> = ({ value, onChange, errors = NO_ERRORS }) => {
  const { t, tEnum } = useTranslation()
  const projectTypeLabel = (type: string) =>
    PROJECT_TYPE_LABELS[type as AuditionProjectType] ? t(`projectCastingFields.projectTypes.${type}`) : type
  const [projects, setProjects] = useState<CastingProject[]>([])
  const [characters, setCharacters] = useState<CastingCharacter[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingCharacters, setLoadingCharacters] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [showNewCharacter, setShowNewCharacter] = useState(false)
  const [newProject, setNewProject] = useState(emptyProject)
  const [newCharacter, setNewCharacter] = useState(emptyCharacter)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoadingProjects(true)
    recruiterProjectsService
      .listProjects()
      .then(setProjects)
      .catch(() => toast.error(translate('projectCastingFields.toast.loadProjectsFailed')))
      .finally(() => setLoadingProjects(false))
  }, [])

  useEffect(() => {
    if (!value.projectId) {
      setCharacters([])
      return
    }
    // Prefer characters embedded in the project list; otherwise fetch them.
    const embedded = projects.find(p => p.id === value.projectId)?.characters
    if (embedded && embedded.length > 0) {
      setCharacters(embedded)
      return
    }
    setLoadingCharacters(true)
    recruiterProjectsService
      .listCharacters(value.projectId)
      .then(setCharacters)
      .catch(() => setCharacters([]))
      .finally(() => setLoadingCharacters(false))
  }, [value.projectId, projects])

  const selectProject = (id: number | undefined) => {
    const project = projects.find(p => p.id === id)
    onChange({
      projectId: project?.id,
      projectName: project?.name,
      projectType: project?.projectType,
      characterId: undefined,
      characterName: undefined,
      roleType: value.roleType,
    })
    setShowNewCharacter(false)
  }

  const selectCharacter = (id: number | undefined) => {
    const character = characters.find(c => c.id === id)
    onChange(
      {
        ...value,
        characterId: character?.id,
        characterName: character?.name,
        roleType: character?.roleType ?? value.roleType,
      },
      character,
    )
  }

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      toast.error(t('projectCastingFields.toast.projectNameRequired'))
      return
    }
    setSaving(true)
    try {
      const created = await recruiterProjectsService.createProject({
        ...newProject,
        name: newProject.name.trim(),
      })
      setProjects(prev => [created, ...prev])
      onChange({
        projectId: created.id,
        projectName: created.name,
        projectType: created.projectType,
        roleType: value.roleType,
      })
      setNewProject(emptyProject)
      setShowNewProject(false)
      toast.success(t('projectCastingFields.toast.projectCreated'))
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('projectCastingFields.toast.createProjectFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleCreateCharacter = async () => {
    if (!value.projectId) return
    if (!newCharacter.name.trim()) {
      toast.error(t('projectCastingFields.toast.characterNameRequired'))
      return
    }
    setSaving(true)
    try {
      const created = await recruiterProjectsService.createCharacter(value.projectId, {
        name: newCharacter.name.trim(),
        roleType: newCharacter.roleType,
        gender: newCharacter.gender,
        ageMin: newCharacter.ageMin === '' ? undefined : newCharacter.ageMin,
        ageMax: newCharacter.ageMax === '' ? undefined : newCharacter.ageMax,
        requiredCount: newCharacter.requiredCount === '' ? 1 : newCharacter.requiredCount,
        description: newCharacter.description || undefined,
      })
      setCharacters(prev => [...prev, created])
      onChange(
        {
          ...value,
          characterId: created.id,
          characterName: created.name,
          roleType: created.roleType,
        },
        created,
      )
      setNewCharacter(emptyCharacter)
      setShowNewCharacter(false)
      toast.success(t('projectCastingFields.toast.characterAdded'))
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('projectCastingFields.toast.addCharacterFailed'))
    } finally {
      setSaving(false)
    }
  }

  const selectedCharacter = characters.find(c => c.id === value.characterId)

  return (
    <div className='grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3'>
      {/* Project */}
      <div>
        <div className='flex items-center justify-between'>
          <label htmlFor='projectId' className={labelCls}>{t('projectCastingFields.project.label')}</label>
          <button type='button' className={linkBtnCls} onClick={() => setShowNewProject(s => !s)}>
            {showNewProject ? t('common.actions.cancel') : t('projectCastingFields.project.newProject')}
          </button>
        </div>
        <select
          id='projectId'
          className={`mt-1 pr-10 ${inputCls} ${errors.projectId ? errCls : ''}`}
          value={value.projectId ?? ''}
          disabled={loadingProjects}
          onChange={e => selectProject(e.target.value ? Number(e.target.value) : undefined)}>
          <option value=''>{loadingProjects ? t('common.status.loading') : t('projectCastingFields.project.select')}</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} ({projectTypeLabel(p.projectType)})
            </option>
          ))}
          {/* Keep the current value visible while editing even if it is not in the list */}
          {value.projectId && !projects.some(p => p.id === value.projectId) && (
            <option value={value.projectId}>{value.projectName ?? t('projectCastingFields.project.fallback', { id: value.projectId })}</option>
          )}
        </select>
        {errors.projectId && <p className='mt-1 text-xs text-red-600'>{errors.projectId}</p>}
      </div>

      {/* Casting character */}
      <div>
        <div className='flex items-center justify-between'>
          <label htmlFor='characterId' className={labelCls}>{t('projectCastingFields.character.label')}</label>
          {value.projectId && (
            <button type='button' className={linkBtnCls} onClick={() => setShowNewCharacter(s => !s)}>
              {showNewCharacter ? t('common.actions.cancel') : t('projectCastingFields.character.newCharacter')}
            </button>
          )}
        </div>
        <select
          id='characterId'
          className={`mt-1 pr-10 ${inputCls} ${errors.characterId ? errCls : ''}`}
          value={value.characterId ?? ''}
          disabled={!value.projectId || loadingCharacters}
          onChange={e => selectCharacter(e.target.value ? Number(e.target.value) : undefined)}>
          <option value=''>
            {!value.projectId
              ? t('projectCastingFields.character.selectProjectFirst')
              : loadingCharacters
                ? t('common.status.loading')
                : t('projectCastingFields.character.select')}
          </option>
          {characters.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} · {tEnum(c.roleType)}
            </option>
          ))}
          {value.characterId && !characters.some(c => c.id === value.characterId) && (
            <option value={value.characterId}>{value.characterName ?? t('projectCastingFields.character.fallback', { id: value.characterId })}</option>
          )}
        </select>
        {errors.characterId && <p className='mt-1 text-xs text-red-600'>{errors.characterId}</p>}
      </div>

      {/* Role type */}
      <div>
        <label htmlFor='roleType' className={labelCls}>{t('projectCastingFields.role')}</label>
        <select
          id='roleType'
          className={`mt-1 pr-10 ${inputCls}`}
          value={value.roleType ?? 'SUPPORTING'}
          onChange={e => onChange({ ...value, roleType: e.target.value as AuditionRoleType })}>
          {Object.keys(ROLE_TYPE_LABELS).map(k => (
            <option key={k} value={k}>{tEnum(k)}</option>
          ))}
        </select>
      </div>

      {selectedCharacter && !showNewCharacter && (
        <div className='sm:col-span-3 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-gray-700'>
          <span className='font-semibold'>{selectedCharacter.name}</span>
          {selectedCharacter.gender && selectedCharacter.gender !== 'ANY' && <> · {tEnum(selectedCharacter.gender)}</>}
          {(selectedCharacter.ageMin || selectedCharacter.ageMax) && (
            <> · {t('projectCastingFields.character.ageRange', { min: selectedCharacter.ageMin ?? '?', max: selectedCharacter.ageMax ?? '?' })}</>
          )}
          {selectedCharacter.requiredCount && selectedCharacter.requiredCount > 1 && (
            <> · {t('projectCastingFields.character.needsArtists', { count: selectedCharacter.requiredCount })}</>
          )}
          {selectedCharacter.description && <p className='text-gray-500 mt-1'>{selectedCharacter.description}</p>}
        </div>
      )}

      {showNewProject && (
        <div className='sm:col-span-3 rounded-lg border border-dashed border-gray-300 p-4 space-y-3 bg-gray-50'>
          <p className='text-sm font-semibold text-gray-800'>{t('projectCastingFields.newProjectForm.title')}</p>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <input className={inputCls} placeholder={t('projectCastingFields.newProjectForm.namePlaceholder')} value={newProject.name}
              onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} />
            <select className={`pr-10 ${inputCls}`} value={newProject.projectType}
              onChange={e => setNewProject(p => ({ ...p, projectType: e.target.value as AuditionProjectType }))}>
              {Object.keys(PROJECT_TYPE_LABELS).map(k => (
                <option key={k} value={k}>{projectTypeLabel(k)}</option>
              ))}
            </select>
            <input className={inputCls} placeholder={t('projectCastingFields.newProjectForm.languagePlaceholder')} value={newProject.language}
              onChange={e => setNewProject(p => ({ ...p, language: e.target.value }))} />
            <input className={inputCls} placeholder={t('projectCastingFields.newProjectForm.productionHousePlaceholder')} value={newProject.productionHouse}
              onChange={e => setNewProject(p => ({ ...p, productionHouse: e.target.value }))} />
            <input className={inputCls} placeholder={t('projectCastingFields.newProjectForm.directorPlaceholder')} value={newProject.director}
              onChange={e => setNewProject(p => ({ ...p, director: e.target.value }))} />
            <button type='button' disabled={saving} onClick={handleCreateProject}
              className='px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50'>
              {saving ? t('common.actions.saving') : t('projectCastingFields.newProjectForm.create')}
            </button>
          </div>
        </div>
      )}

      {showNewCharacter && value.projectId && (
        <div className='sm:col-span-3 rounded-lg border border-dashed border-gray-300 p-4 space-y-3 bg-gray-50'>
          <p className='text-sm font-semibold text-gray-800'>{t('projectCastingFields.newCharacterForm.title', { project: value.projectName ?? '' })}</p>
          <div className='grid grid-cols-1 sm:grid-cols-4 gap-3'>
            <input className={`sm:col-span-2 ${inputCls}`} placeholder={t('projectCastingFields.newCharacterForm.namePlaceholder')}
              value={newCharacter.name}
              onChange={e => setNewCharacter(c => ({ ...c, name: e.target.value }))} />
            <select className={`pr-10 ${inputCls}`} value={newCharacter.roleType}
              onChange={e => setNewCharacter(c => ({ ...c, roleType: e.target.value as AuditionRoleType }))}>
              {Object.keys(ROLE_TYPE_LABELS).map(k => (
                <option key={k} value={k}>{tEnum(k)}</option>
              ))}
            </select>
            <select className={`pr-10 ${inputCls}`} value={newCharacter.gender}
              onChange={e => setNewCharacter(c => ({ ...c, gender: e.target.value as GenderPreference }))}>
              <option value='ANY'>{t('projectCastingFields.newCharacterForm.anyGender')}</option>
              <option value='MALE'>{tEnum('MALE')}</option>
              <option value='FEMALE'>{tEnum('FEMALE')}</option>
              <option value='NON_BINARY'>{tEnum('NON_BINARY')}</option>
            </select>
            <input type='number' min={0} className={inputCls} placeholder={t('projectCastingFields.newCharacterForm.ageMinPlaceholder')} value={newCharacter.ageMin}
              onChange={e => setNewCharacter(c => ({ ...c, ageMin: e.target.value === '' ? '' : Number(e.target.value) }))} />
            <input type='number' min={0} className={inputCls} placeholder={t('projectCastingFields.newCharacterForm.ageMaxPlaceholder')} value={newCharacter.ageMax}
              onChange={e => setNewCharacter(c => ({ ...c, ageMax: e.target.value === '' ? '' : Number(e.target.value) }))} />
            <input type='number' min={1} className={inputCls} placeholder={t('projectCastingFields.newCharacterForm.artistsNeededPlaceholder')} title={t('projectCastingFields.newCharacterForm.artistsNeededTitle')}
              value={newCharacter.requiredCount}
              onChange={e => setNewCharacter(c => ({ ...c, requiredCount: e.target.value === '' ? '' : Number(e.target.value) }))} />
            <button type='button' disabled={saving} onClick={handleCreateCharacter}
              className='px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50'>
              {saving ? t('common.actions.saving') : t('projectCastingFields.newCharacterForm.add')}
            </button>
            <textarea rows={2} className={`sm:col-span-4 ${inputCls}`} placeholder={t('projectCastingFields.newCharacterForm.briefPlaceholder')}
              value={newCharacter.description}
              onChange={e => setNewCharacter(c => ({ ...c, description: e.target.value }))} />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectCastingFields
