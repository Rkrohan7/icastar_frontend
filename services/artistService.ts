import api from './apiClient'
import { cachedGet, invalidateCache } from './cache'

// By-id profile lookups are cached 60s (public profile pages re-render often).
const ARTIST_BYID_TTL = 60_000

// ----- In-memory cache for /artists/profile/complete -----
// Header, DashLayout and the Profile page each called getMyProfile() on mount,
// triggering 2-3 identical heavy fetches per dashboard load. Cache the result
// briefly and dedupe concurrent calls.
const ARTIST_PROFILE_TTL = 60_000
let artistProfileCache: { value: ArtistProfile | null; ts: number } | null = null
let inflightArtistProfile: Promise<ArtistProfile | null> | null = null

export const invalidateArtistProfileCache = () => {
  artistProfileCache = null
  inflightArtistProfile = null
}

export interface ArtistProfile {
  id?: number
  userId?: number
  artistProfileId?: number
  fullName?: string
  firstName?: string
  lastName?: string
  stageName?: string
  email?: string
  phone?: string
  gender?: string
  city?: string
  location?: string
  languages?: string[] | string
  languagesSpoken?: string[] | string
  bio?: string
  profilePhoto?: string
  coverPhoto?: string
  idProof?: string
  idProofVerified?: boolean
  actorType?: 'skilled' | 'known'
  age?: number
  dateOfBirth?: string
  height?: string
  weight?: number
  hairColor?: string
  hairLength?: string
  hasTattoo?: boolean
  hasMole?: boolean
  shoeSize?: string
  danceStyles?: string[]
  experienceYears?: string | number
  danceVideo?: string
  skills?: string[] | string
  maritalStatus?: string
  comfortableAreas?: string[] | string
  projectsWorked?: string[] | string
  travelCities?: string[] | string
  portfolioUrls?: string[] | string
  videoUrl?: string
  hourlyRate?: number
  isVerifiedBadge?: boolean
  isProfileComplete?: boolean
  isOnboardingComplete?: boolean
  isActive?: boolean
  totalApplications?: number
  successfulHires?: number
  artistType?: {
    id: number
    name: string
    displayName: string
    description?: string
    iconUrl?: string
    fields?: {
      name: string
      label: string
      type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'FILE' | 'URL' | 'BOOLEAN'
      required?: boolean
      placeholder?: string
      options?: string[] // For select/multiselect if needed
    }[]
  }
  artistTypeId?: number
  artistTypeName?: string
  // Full list of professions (multi-select). First entry is the primary.
  professions?: { id?: number; name?: string; displayName: string; experienceYears?: number }[]
  experiences?: ArtistExperience[]
  category?: string
  documents?: any[]
  dynamicFields?: any[]
  [key: string]: any
}

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'FREELANCE' | 'CONTRACT' | 'INTERNSHIP'

// One work-experience entry (Naukri-style employment).
export interface ArtistExperience {
  id?: number
  artistTypeId?: number | null
  artistTypeName?: string
  title: string
  companyName: string
  projectType?: string
  employmentType?: EmploymentType
  location?: string
  isCurrent: boolean
  startDate: string // 'YYYY-MM-01'
  endDate?: string | null // null when isCurrent
  description?: string
}

export interface UpdateArtistProfileInput extends Partial<ArtistProfile> { }

// Backend may send LocalDate as 'YYYY-MM-DD' or as a [y, m, d] array.
const toIsoDate = (v: any): string | null => {
  if (!v) return null
  if (Array.isArray(v) && v.length >= 2) {
    return `${v[0]}-${String(v[1]).padStart(2, '0')}-${String(v[2] ?? 1).padStart(2, '0')}`
  }
  return String(v)
}

export const normalizeExperience = (it: any): ArtistExperience => ({
  id: it.id ?? it.experienceId,
  artistTypeId: it.artistTypeId ?? it.artistType?.id ?? null,
  artistTypeName:
    it.artistTypeDisplayName ?? it.artistType?.displayName ?? prettify(it.artistTypeName ?? it.artistType?.name),
  title: it.title ?? it.role ?? '',
  companyName: it.companyName ?? it.company ?? '',
  projectType: it.projectType ?? undefined,
  employmentType: it.employmentType ?? undefined,
  location: it.location ?? undefined,
  isCurrent: Boolean(it.isCurrent ?? it.current),
  startDate: toIsoDate(it.startDate) ?? '',
  endDate: toIsoDate(it.endDate),
  description: it.description ?? undefined,
})

export const normalizeExperiences = (raw: any): ArtistExperience[] => {
  let list = raw
  if (typeof list === 'string') {
    try { list = JSON.parse(list) } catch { return [] }
  }
  return Array.isArray(list) ? list.map(normalizeExperience) : []
}

// Request body for create/update — display-only fields stripped.
const toExperiencePayload = ({ id, artistTypeName, ...rest }: ArtistExperience) => rest

const mapResponseToProfile = (responseData: any): ArtistProfile => ({
  id: responseData.artistProfileId ?? responseData.id,
  userId: responseData.userId,
  firstName: responseData.firstName,
  lastName: responseData.lastName,
  fullName: responseData.firstName && responseData.lastName
    ? `${responseData.firstName} ${responseData.lastName}`
    : responseData.firstName || responseData.lastName || '',
  stageName: responseData.stageName,
  email: responseData.email,
  phone: responseData.phone ?? responseData.mobile,
  bio: responseData.bio,
  dateOfBirth: responseData.dateOfBirth,
  gender: responseData.gender,
  location: responseData.location,
  city: responseData.city ?? responseData.location,
  maritalStatus: responseData.maritalStatus,
  languagesSpoken: (() => {
    try {
      const ls = responseData.languagesSpoken
      if (typeof ls === 'string' && ls.startsWith('[')) {
        return JSON.parse(ls)
      }
      return ls
    } catch (e) {
      console.error('Failed to parse languagesSpoken:', e)
      return []
    }
  })(),
  languages: responseData.languagesSpoken,
  comfortableAreas: responseData.comfortableAreas,
  projectsWorked: responseData.projectsWorked,
  skills: responseData.skills,
  experienceYears: responseData.experienceYears,
  weight: responseData.weight,
  height: responseData.height,
  hairColor: responseData.hairColor,
  hairLength: responseData.hairLength,
  hasTattoo: responseData.hasTattoo,
  hasMole: responseData.hasMole,
  shoeSize: responseData.shoeSize,
  eyeColor: responseData.eyeColor,
  complexion: responseData.complexion,
  hasPassport: responseData.hasPassport,
  travelCities: responseData.travelCities,
  hourlyRate: responseData.hourlyRate,
  profilePhoto: responseData.profileUrl ?? responseData.profilePhoto ?? responseData.avatarUrl,
  coverPhoto: responseData.coverPhotoUrl ?? responseData.coverPhoto,
  idProof: responseData.idProofUrl ?? responseData.idProof,
  idProofVerified: responseData.idProofVerified ?? false,
  videoUrl: responseData.videoUrl,
  faceVerification: responseData.faceVerificationUrl ?? responseData.faceVerification,
  danceVideo: responseData.danceShowreelUrl ?? responseData.danceVideo,
  portfolioUrls: (() => {
    const raw = responseData.portfolioUrls ?? responseData.portfolioItems ?? responseData.portfolioUrl
    if (!raw) return []
    if (typeof raw === 'string') {
      try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [raw] } catch { return [raw] }
    }
    if (Array.isArray(raw)) {
      return raw.flatMap((item: any): string[] => {
        if (typeof item === 'string') {
          try { const p = JSON.parse(item); return Array.isArray(p) ? p.map(String) : [item] } catch { return [item] }
        }
        if (Array.isArray(item)) return item.map(String)
        return item ? [String(item)] : []
      }).filter(Boolean)
    }
    return []
  })(),
  isVerifiedBadge: responseData.isVerifiedBadge,
  isProfileComplete: responseData.isProfileComplete,
  isOnboardingComplete: responseData.isOnboardingComplete,
  totalApplications: responseData.totalApplications,
  successfulHires: responseData.successfulHires,
  artistType: responseData.artistType ?? {
    id: responseData.artistTypeId,
    name: responseData.artistTypeName,
    displayName: responseData.artistTypeName?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
  },
  // Full list of professions (multi-select). Reads the backend's multi field
  // (`artistTypes`) when present, otherwise falls back to the single artistType
  // so existing single-profession users keep working.
  professions: normalizeProfessions(responseData),
  experiences: normalizeExperiences(responseData.experiences ?? responseData.workExperiences),
  category: responseData.artistTypeName?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
  documents: responseData.documents,
  dynamicFields: responseData.dynamicFields,
})

const prettify = (s?: string) =>
  s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : ''

// Build a normalized professions array from whatever shape the backend returns.
// Supports: artistTypes[] (objects or names), artistTypeIds[]+artistTypeNames[],
// and the legacy single artistType/artistTypeName.
const normalizeProfessions = (
  d: any,
): { id?: number; name?: string; displayName: string }[] => {
  const list = d.artistTypes ?? d.professions
  if (Array.isArray(list) && list.length) {
    return list.map((it: any) =>
      typeof it === 'string'
        ? { name: it, displayName: prettify(it) }
        : {
            id: it.id ?? it.artistTypeId,
            name: it.name ?? it.artistTypeName,
            displayName: it.displayName || prettify(it.name ?? it.artistTypeName),
            experienceYears: it.experienceYears ?? it.experience_years,
          },
    )
  }
  // Fallback: single profession
  const single =
    d.artistType ??
    (d.artistTypeName
      ? { id: d.artistTypeId, name: d.artistTypeName, displayName: prettify(d.artistTypeName) }
      : null)
  return single ? [{ id: single.id, name: single.name, displayName: single.displayName || prettify(single.name) }] : []
}

const fetchMyProfileFresh = async (): Promise<ArtistProfile | null> => {
  const res = await api.get('/artists/profile/complete')
  const responseData = res.data?.data ?? res.data
  if (!responseData) return null
  const profile = mapResponseToProfile(responseData)
  artistProfileCache = { value: profile, ts: Date.now() }
  return profile
}

export const artistService = {
  async getMyProfile(forceRefresh: boolean = false): Promise<ArtistProfile | null> {
    if (!forceRefresh && artistProfileCache && Date.now() - artistProfileCache.ts < ARTIST_PROFILE_TTL) {
      return artistProfileCache.value
    }
    if (!forceRefresh && inflightArtistProfile) return inflightArtistProfile
    inflightArtistProfile = fetchMyProfileFresh().finally(() => {
      inflightArtistProfile = null
    })
    return inflightArtistProfile
  },

  async getMyCompleteProfile(): Promise<ArtistProfile | null> {
    return cachedGet('artist:profile:my-complete', async () => {
      const res = await api.get('/artist-profiles/complete')
      return res.data ?? null
    }, { ttl: ARTIST_BYID_TTL })
  },

  async getProfileById(id: number | string): Promise<ArtistProfile | null> {
    return cachedGet(`artist:profile:by-id:${id}`, async () => {
      const res = await api.get(`/artists/profile/${id}`)
      return res.data ?? null
    }, { ttl: ARTIST_BYID_TTL })
  },

  async getCompleteProfileById(id: number | string): Promise<ArtistProfile | null> {
    return cachedGet(`artist:profile:complete-by-id:${id}`, async () => {
      const res = await api.get(`/artists/profile/${id}/complete`)
      return res.data ?? null
    }, { ttl: ARTIST_BYID_TTL })
  },

  async updateMyProfile(input: UpdateArtistProfileInput): Promise<ArtistProfile> {
    const res = await api.put('/artists/profile', input)
    invalidateArtistProfileCache()
    invalidateCache('artist:profile:')
    return res.data
  },

  async addExperience(input: ArtistExperience): Promise<ArtistExperience> {
    const res = await api.post('/artists/profile/experiences', toExperiencePayload(input))
    invalidateArtistProfileCache()
    invalidateCache('artist:profile:')
    return normalizeExperience(res.data?.data ?? res.data)
  },

  async updateExperience(id: number, input: ArtistExperience): Promise<ArtistExperience> {
    const res = await api.put(`/artists/profile/experiences/${id}`, toExperiencePayload(input))
    invalidateArtistProfileCache()
    invalidateCache('artist:profile:')
    return normalizeExperience(res.data?.data ?? res.data)
  },

  async deleteExperience(id: number): Promise<void> {
    await api.delete(`/artists/profile/experiences/${id}`)
    invalidateArtistProfileCache()
    invalidateCache('artist:profile:')
  },

  async submitFaceVerification(faceImageUrl: string): Promise<void> {
    // TODO: uncomment when backend is ready
    // await api.post('/artist/face-verification', { faceImageUrl })
    console.log('Face verification submitted:', faceImageUrl)
  },
}

export default artistService