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
      .catch(() => toast.error('Unable to load projects'))
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
      toast.error('Project name is required')
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
      toast.success('Project created')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateCharacter = async () => {
    if (!value.projectId) return
    if (!newCharacter.name.trim()) {
      toast.error('Character name is required')
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
      toast.success('Character added')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add character')
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
          <label htmlFor='projectId' className={labelCls}>Project</label>
          <button type='button' className={linkBtnCls} onClick={() => setShowNewProject(s => !s)}>
            {showNewProject ? 'Cancel' : '+ New Project'}
          </button>
        </div>
        <select
          id='projectId'
          className={`mt-1 pr-10 ${inputCls} ${errors.projectId ? errCls : ''}`}
          value={value.projectId ?? ''}
          disabled={loadingProjects}
          onChange={e => selectProject(e.target.value ? Number(e.target.value) : undefined)}>
          <option value=''>{loadingProjects ? 'Loading...' : 'Select project'}</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} ({PROJECT_TYPE_LABELS[p.projectType] ?? p.projectType})
            </option>
          ))}
          {/* Keep the current value visible while editing even if it is not in the list */}
          {value.projectId && !projects.some(p => p.id === value.projectId) && (
            <option value={value.projectId}>{value.projectName ?? `Project #${value.projectId}`}</option>
          )}
        </select>
        {errors.projectId && <p className='mt-1 text-xs text-red-600'>{errors.projectId}</p>}
      </div>

      {/* Casting character */}
      <div>
        <div className='flex items-center justify-between'>
          <label htmlFor='characterId' className={labelCls}>Casting Character</label>
          {value.projectId && (
            <button type='button' className={linkBtnCls} onClick={() => setShowNewCharacter(s => !s)}>
              {showNewCharacter ? 'Cancel' : '+ New Character'}
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
            {!value.projectId ? 'Select a project first' : loadingCharacters ? 'Loading...' : 'Select character'}
          </option>
          {characters.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} · {ROLE_TYPE_LABELS[c.roleType] ?? c.roleType}
            </option>
          ))}
          {value.characterId && !characters.some(c => c.id === value.characterId) && (
            <option value={value.characterId}>{value.characterName ?? `Character #${value.characterId}`}</option>
          )}
        </select>
        {errors.characterId && <p className='mt-1 text-xs text-red-600'>{errors.characterId}</p>}
      </div>

      {/* Role type */}
      <div>
        <label htmlFor='roleType' className={labelCls}>Role</label>
        <select
          id='roleType'
          className={`mt-1 pr-10 ${inputCls}`}
          value={value.roleType ?? 'SUPPORTING'}
          onChange={e => onChange({ ...value, roleType: e.target.value as AuditionRoleType })}>
          {Object.entries(ROLE_TYPE_LABELS).map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
      </div>

      {selectedCharacter && !showNewCharacter && (
        <div className='sm:col-span-3 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-gray-700'>
          <span className='font-semibold'>{selectedCharacter.name}</span>
          {selectedCharacter.gender && selectedCharacter.gender !== 'ANY' && <> · {selectedCharacter.gender}</>}
          {(selectedCharacter.ageMin || selectedCharacter.ageMax) && (
            <> · Age {selectedCharacter.ageMin ?? '?'}–{selectedCharacter.ageMax ?? '?'}</>
          )}
          {selectedCharacter.requiredCount && selectedCharacter.requiredCount > 1 && (
            <> · Needs {selectedCharacter.requiredCount} artists</>
          )}
          {selectedCharacter.description && <p className='text-gray-500 mt-1'>{selectedCharacter.description}</p>}
        </div>
      )}

      {showNewProject && (
        <div className='sm:col-span-3 rounded-lg border border-dashed border-gray-300 p-4 space-y-3 bg-gray-50'>
          <p className='text-sm font-semibold text-gray-800'>New Project</p>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <input className={inputCls} placeholder='Project name *' value={newProject.name}
              onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} />
            <select className={`pr-10 ${inputCls}`} value={newProject.projectType}
              onChange={e => setNewProject(p => ({ ...p, projectType: e.target.value as AuditionProjectType }))}>
              {Object.entries(PROJECT_TYPE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
            <input className={inputCls} placeholder='Language' value={newProject.language}
              onChange={e => setNewProject(p => ({ ...p, language: e.target.value }))} />
            <input className={inputCls} placeholder='Production house' value={newProject.productionHouse}
              onChange={e => setNewProject(p => ({ ...p, productionHouse: e.target.value }))} />
            <input className={inputCls} placeholder='Director' value={newProject.director}
              onChange={e => setNewProject(p => ({ ...p, director: e.target.value }))} />
            <button type='button' disabled={saving} onClick={handleCreateProject}
              className='px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50'>
              {saving ? 'Saving...' : 'Create Project'}
            </button>
          </div>
        </div>
      )}

      {showNewCharacter && value.projectId && (
        <div className='sm:col-span-3 rounded-lg border border-dashed border-gray-300 p-4 space-y-3 bg-gray-50'>
          <p className='text-sm font-semibold text-gray-800'>New Character for {value.projectName}</p>
          <div className='grid grid-cols-1 sm:grid-cols-4 gap-3'>
            <input className={`sm:col-span-2 ${inputCls}`} placeholder='Character name * (e.g., Inspector Vikram)'
              value={newCharacter.name}
              onChange={e => setNewCharacter(c => ({ ...c, name: e.target.value }))} />
            <select className={`pr-10 ${inputCls}`} value={newCharacter.roleType}
              onChange={e => setNewCharacter(c => ({ ...c, roleType: e.target.value as AuditionRoleType }))}>
              {Object.entries(ROLE_TYPE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
            <select className={`pr-10 ${inputCls}`} value={newCharacter.gender}
              onChange={e => setNewCharacter(c => ({ ...c, gender: e.target.value as GenderPreference }))}>
              <option value='ANY'>Any gender</option>
              <option value='MALE'>Male</option>
              <option value='FEMALE'>Female</option>
              <option value='NON_BINARY'>Non-binary</option>
            </select>
            <input type='number' min={0} className={inputCls} placeholder='Age min' value={newCharacter.ageMin}
              onChange={e => setNewCharacter(c => ({ ...c, ageMin: e.target.value === '' ? '' : Number(e.target.value) }))} />
            <input type='number' min={0} className={inputCls} placeholder='Age max' value={newCharacter.ageMax}
              onChange={e => setNewCharacter(c => ({ ...c, ageMax: e.target.value === '' ? '' : Number(e.target.value) }))} />
            <input type='number' min={1} className={inputCls} placeholder='Artists needed' title='How many artists are needed for this character'
              value={newCharacter.requiredCount}
              onChange={e => setNewCharacter(c => ({ ...c, requiredCount: e.target.value === '' ? '' : Number(e.target.value) }))} />
            <button type='button' disabled={saving} onClick={handleCreateCharacter}
              className='px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50'>
              {saving ? 'Saving...' : 'Add Character'}
            </button>
            <textarea rows={2} className={`sm:col-span-4 ${inputCls}`} placeholder='Character brief (look, personality, scenes...)'
              value={newCharacter.description}
              onChange={e => setNewCharacter(c => ({ ...c, description: e.target.value }))} />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectCastingFields
