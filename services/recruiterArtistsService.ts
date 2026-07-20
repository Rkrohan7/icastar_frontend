import { api } from './apiClient'
import { Artist } from '../types'
import { cachedGet, buildCacheKey } from './cache'

// Read-only browse/suggestion/audience data — safe to cache briefly. Header +
// list page + suggestions widget used to re-fetch the same query independently.
const ARTISTS_TTL = 60_000
const SUGGESTIONS_TTL = 120_000

// DTO from backend RecruiterDashboardController /artists response
export interface ArtistSuggestionDto {
  artistId: number
  artistName: string
  artistEmail?: string
  artistCategory?: string
  artistType?: string
  location?: string
  bio?: string
  profilePhoto?: string
  coverPhotoUrl?: string
  matchScore?: number
  matchReasons?: string[]
  skills?: string[]
  genres?: string[]
  languages?: string[]
  experienceYears?: number
  experienceLevel?: string
  portfolioItems?: string[]
  portfolioUrls?: string[]
  achievements?: string[]
  certifications?: string[]
  comfortableAreas?: string[]
  travelCities?: string[]
  availability?: string
  preferredJobType?: string
  expectedSalaryMin?: number | null
  expectedSalaryMax?: number | null
  currency?: string
  workLocation?: string
  workSchedule?: string
  profileCompletionPercentage?: number
  isVerified?: boolean
  verificationStatus?: string
  isPremium?: boolean
  recruiterId?: number
  phone?: string
  website?: string
  socialLinks?: string[]
  contactPreference?: string
  videoUrl?: string
  hourlyRate?: number | null
  gender?: string
  maritalStatus?: string | null
  dateOfBirth?: string
  weight?: number | null
  height?: number | null
  hairColor?: string | null
  hairLength?: string | null
  eyeColor?: string | null
  complexion?: string | null
  hasTattoo?: boolean
  hasMole?: boolean
  shoeSize?: string | null
  hasPassport?: boolean
  lastActive?: string
  totalApplications?: number
  totalHires?: number
  projectsWorked?: string[]
}

export interface AudienceMetricsDto {
  totalViews: number
  uniqueVisitors: number
  profileClicks: number
  appearanceInSearch: number
  demographics: {
    ageGroups: { [key: string]: number }
    locations: { [key: string]: number }
    gender: { [key: string]: number }
  }
}

export interface BrowseArtistsParams {
  page?: number // 1-indexed for UI
  size?: number
  artistCategory?: string
  artistType?: string
  location?: string
  skills?: string
  genres?: string
  experienceLevel?: string
  availability?: string
  isVerified?: boolean
  isPremium?: boolean
}


export interface PagedArtistsResult {
  items: Artist[]
  totalElements: number
  totalPages: number
  currentPage: number // 1-indexed
  size: number
}

const na = (val: string | null | undefined): string | undefined =>
  val && val !== 'N/A' ? val : undefined

const toArtist = (dto: ArtistSuggestionDto): Artist => ({
  id: dto.artistId,
  name: dto.artistName,
  avatarUrl: dto.profilePhoto && dto.profilePhoto !== 'N/A' ? dto.profilePhoto : 'https://picsum.photos/seed/artist/300/300',
  coverPhotoUrl: na(dto.coverPhotoUrl),
  bio: na(dto.bio) || '',
  skills: Array.isArray(dto.skills) ? dto.skills : [],
  email: dto.artistEmail,
  phone: na(dto.phone),
  website: na(dto.website),
  socialLinks: Array.isArray(dto.socialLinks) && dto.socialLinks.length > 0 ? dto.socialLinks : undefined,
  contactPreference: na(dto.contactPreference),
  portfolioUrl: (dto.portfolioUrls && dto.portfolioUrls.length > 0)
    ? dto.portfolioUrls[0]
    : (dto.portfolioItems && dto.portfolioItems.length > 0) ? dto.portfolioItems[0] : undefined,
  videoUrl: na(dto.videoUrl),
  profileCompletionPercentage: dto.profileCompletionPercentage,
  category: dto.artistCategory || dto.artistType || 'Artist',
  location: na(dto.location) || na(dto.workLocation) || 'Unknown',
  experienceYears: dto.experienceYears,
  experienceLevel: na(dto.experienceLevel),
  recruiterId: dto.recruiterId,
  isVerified: dto.isVerified,
  verificationStatus: dto.verificationStatus,
  isPremium: dto.isPremium,
  genres: Array.isArray(dto.genres) ? dto.genres : [],
  languages: Array.isArray(dto.languages) ? dto.languages : [],
  achievements: Array.isArray(dto.achievements) ? dto.achievements : [],
  certifications: Array.isArray(dto.certifications) ? dto.certifications : [],
  comfortableAreas: Array.isArray(dto.comfortableAreas) ? dto.comfortableAreas : [],
  travelCities: Array.isArray(dto.travelCities) ? dto.travelCities : [],
  availability: na(dto.availability),
  preferredJobType: na(dto.preferredJobType),
  expectedSalaryMin: dto.expectedSalaryMin ?? undefined,
  expectedSalaryMax: dto.expectedSalaryMax ?? undefined,
  currency: na(dto.currency),
  workSchedule: na(dto.workSchedule),
  hourlyRate: dto.hourlyRate ?? undefined,
  gender: dto.gender,
  maritalStatus: dto.maritalStatus ?? undefined,
  dateOfBirth: dto.dateOfBirth,
  weight: dto.weight ?? undefined,
  height: dto.height ?? undefined,
  hairColor: na(dto.hairColor),
  hairLength: na(dto.hairLength),
  eyeColor: na(dto.eyeColor),
  complexion: na(dto.complexion),
  hasTattoo: dto.hasTattoo,
  hasMole: dto.hasMole,
  shoeSize: na(dto.shoeSize),
  hasPassport: dto.hasPassport,
  lastActive: dto.lastActive,
  totalApplications: dto.totalApplications,
  totalHires: dto.totalHires,
})

export async function browseArtists(params: BrowseArtistsParams): Promise<PagedArtistsResult> {
  const { page = 1, size = 12, ...filters } = params
  return cachedGet(buildCacheKey('recruiter:artists:browse', { page, size, ...filters }), async () => {
    const response = await api.get<{ success: boolean; data: ArtistSuggestionDto[]; totalElements: number; totalPages: number; currentPage: number; size: number }>(
      '/recruiter/dashboard/artists',
      { params: { page: page - 1, size, ...filters } },
    )

    const payload = response.data
    const items = (payload.data || []).map(toArtist)
    return {
      items,
      totalElements: payload.totalElements || items.length,
      totalPages: payload.totalPages || 1,
      currentPage: (payload.currentPage ?? 0) + 1,
      size: payload.size || size,
    }
  }, { ttl: ARTISTS_TTL })
}

export async function getArtistSuggestions(params: Omit<BrowseArtistsParams, 'page' | 'size'> & { jobId?: number; limit?: number }): Promise<Artist[]> {
  const { limit = 10, ...filters } = params
  return cachedGet(buildCacheKey('recruiter:artists:suggestions', { limit, ...filters }), async () => {
    const response = await api.get<{ success: boolean; data: ArtistSuggestionDto[]; count: number }>(
      '/recruiter/dashboard/suggestions',
      { params: { ...filters, limit } },
    )
    return (response.data.data || []).map(toArtist)
  }, { ttl: SUGGESTIONS_TTL })
}

export async function getAudienceMetrics(artistId: number): Promise<AudienceMetricsDto> {
  return cachedGet(`recruiter:artists:audience:${artistId}`, async () => {
    const response = await api.get<{ success: boolean; data: AudienceMetricsDto }>(
      `/recruiter/artists/${artistId}/audience`
    )
    return response.data.data
  }, { ttl: ARTISTS_TTL })
}