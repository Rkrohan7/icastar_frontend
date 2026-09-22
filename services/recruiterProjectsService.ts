import api from './apiClient'
import { cachedGet, invalidateCache } from './cache'
import {
  AuditionProjectType,
  AuditionRoleType,
  CastingCharacter,
  CastingProject,
  GenderPreference,
  ProjectCastingReport,
  SelectedArtist,
} from '../types'

// Projects change rarely; creating/updating a project or character clears the
// prefix. Job create/update also clears it because the report depends on jobs.
const PROJECTS_TTL = 60_000

export interface CreateProjectInput {
  name: string
  projectType: AuditionProjectType
  productionHouse?: string
  director?: string
  language?: string
  shootLocation?: string
  shootStartDate?: string
  shootEndDate?: string
  description?: string
}

export interface CreateCharacterInput {
  name: string
  roleType: AuditionRoleType
  gender?: GenderPreference
  ageMin?: number
  ageMax?: number
  description?: string
  requiredCount?: number
}

// Backend may wrap payloads as { data: ... } or return them directly.
const unwrap = (data: any) => (data && data.data !== undefined ? data.data : data)

const toList = (data: any): any[] => {
  const d = unwrap(data)
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.content)) return d.content
  if (Array.isArray(d?.items)) return d.items
  return []
}

export const mapSelectedArtist = (a: any): SelectedArtist => ({
  userId: a.userId ?? a.artistUserId ?? a.id,
  artistProfileId: a.artistProfileId ?? a.artistId,
  name: a.name ?? a.artistName ?? a.fullName ?? 'Artist',
  avatarUrl: a.avatarUrl ?? a.profilePhoto ?? a.photoUrl,
  status: a.status,
})

const mapCharacter = (c: any, projectId?: number): CastingCharacter => ({
  id: c.id,
  projectId: c.projectId ?? projectId,
  name: c.name ?? c.characterName,
  roleType: c.roleType ?? 'SUPPORTING',
  gender: c.gender,
  ageMin: c.ageMin,
  ageMax: c.ageMax,
  description: c.description,
  requiredCount: c.requiredCount ?? 1,
})

const mapProject = (p: any): CastingProject => ({
  id: p.id,
  name: p.name ?? p.projectName,
  projectType: p.projectType,
  productionHouse: p.productionHouse,
  director: p.director,
  language: p.language,
  shootLocation: p.shootLocation,
  shootStartDate: p.shootStartDate,
  shootEndDate: p.shootEndDate,
  description: p.description,
  status: p.status,
  characters: Array.isArray(p.characters) ? p.characters.map((c: any) => mapCharacter(c, p.id)) : [],
  createdAt: p.createdAt,
})

export const PROJECT_TYPE_LABELS: Record<AuditionProjectType, string> = {
  FEATURE_FILM: 'Feature Film',
  TV_SERIES: 'TV Series',
  WEB_SERIES: 'Web Series',
  SHORT_FILM: 'Short Film',
  COMMERCIAL: 'Commercial / Ad',
  MUSIC_VIDEO: 'Music Video',
  THEATER: 'Theater',
}

export const ROLE_TYPE_LABELS: Record<AuditionRoleType, string> = {
  LEAD: 'Lead',
  SUPPORTING: 'Supporting',
  BACKGROUND: 'Background',
  EXTRA: 'Extra',
}

// Public artist profile route is `/:userId/profile` (see AppRouter).
export const artistPublicProfileUrl = (userId: number | string) =>
  `${window.location.origin}/${userId}/profile`

export const recruiterProjectsService = {
  async listProjects(): Promise<CastingProject[]> {
    return cachedGet('recruiter:projects:list', async () => {
      const response = await api.get('/recruiter/projects', { params: { page: 0, size: 100 } })
      return toList(response.data).map(mapProject)
    }, { ttl: PROJECTS_TTL })
  },

  async createProject(data: CreateProjectInput): Promise<CastingProject> {
    const response = await api.post('/recruiter/projects', data)
    invalidateCache('recruiter:projects:')
    return mapProject(unwrap(response.data))
  },

  async updateProject(projectId: number, data: Partial<CreateProjectInput>): Promise<CastingProject> {
    const response = await api.put(`/recruiter/projects/${projectId}`, data)
    invalidateCache('recruiter:projects:')
    return mapProject(unwrap(response.data))
  },

  async listCharacters(projectId: number): Promise<CastingCharacter[]> {
    return cachedGet(`recruiter:projects:characters:${projectId}`, async () => {
      const response = await api.get(`/recruiter/projects/${projectId}/characters`)
      return toList(response.data).map((c: any) => mapCharacter(c, projectId))
    }, { ttl: PROJECTS_TTL })
  },

  async createCharacter(projectId: number, data: CreateCharacterInput): Promise<CastingCharacter> {
    const response = await api.post(`/recruiter/projects/${projectId}/characters`, data)
    invalidateCache('recruiter:projects:')
    return mapCharacter(unwrap(response.data), projectId)
  },

  async getCastingReport(): Promise<ProjectCastingReport[]> {
    return cachedGet('recruiter:projects:report', async () => {
      const response = await api.get('/recruiter/dashboard/project-report')
      return toList(response.data).map((r: any) => ({
        ...r,
        characters: (r.characters ?? []).map((c: any) => ({
          ...c,
          requiredCount: c.requiredCount ?? 1,
          selectedArtists: (c.selectedArtists ?? []).map(mapSelectedArtist),
        })),
      }))
    }, { ttl: 30_000 })
  },

  invalidate(): void {
    invalidateCache('recruiter:projects:')
  },
}

export default recruiterProjectsService
