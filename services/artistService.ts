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
  category?: string
  documents?: any[]
  dynamicFields?: any[]
  [key: string]: any
}

export interface UpdateArtistProfileInput extends Partial<ArtistProfile> { }

const mapResponseToProfile = (responseData: any): ArtistProfile => ({
  id: responseData.artistProfileId ?? responseData.id,
  oderId: responseData.userId,
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
  category: responseData.artistTypeName?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
  documents: responseData.documents,
  dynamicFields: responseData.dynamicFields,
})

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

  async submitFaceVerification(faceImageUrl: string): Promise<void> {
    // TODO: uncomment when backend is ready
    // await api.post('/artist/face-verification', { faceImageUrl })
    console.log('Face verification submitted:', faceImageUrl)
  },
}

export default artistService