import { ArtistProfile } from './artistService'

// Public (no-auth) endpoint. Uses a plain fetch so the axios auth
// interceptor never attaches a token — the profile must load for anyone.
const BASE_URL = 'https://api.icastar.com/api'

// Filter "N/A" backend placeholder values
const na = (val: string | null | undefined): string | undefined =>
  val && val !== 'N/A' ? val : undefined

// Backend sends skills, languagesSpoken, portfolioUrls as JSON strings OR arrays
const parseArr = (val: any): string[] => {
  if (!val) return []
  if (Array.isArray(val)) return val.map(String).filter(Boolean)
  if (typeof val === 'string') {
    try {
      const p = JSON.parse(val)
      return Array.isArray(p) ? p.map(String).filter(Boolean) : val ? [val] : []
    } catch {
      return val ? [val] : []
    }
  }
  return []
}

function mapPublicProfile(data: any): ArtistProfile {
  return {
    id: data.artistProfileId ?? data.id,
    userId: data.userId,
    firstName: data.firstName,
    lastName: data.lastName,
    fullName:
      data.firstName && data.lastName
        ? `${data.firstName} ${data.lastName}`
        : data.firstName || data.lastName || data.fullName || data.artistName || '',
    stageName: na(data.stageName),
    email: data.email ?? data.artistEmail,
    phone: na(data.phone) ?? na(data.mobile),
    bio: na(data.bio) ?? '',
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    location: na(data.location) ?? na(data.city) ?? na(data.workLocation),
    city: na(data.city) ?? na(data.location),
    maritalStatus: na(data.maritalStatus),
    // languagesSpoken comes as JSON string from backend
    languages: parseArr(data.languagesSpoken ?? data.languages),
    languagesSpoken: parseArr(data.languagesSpoken ?? data.languages),
    comfortableAreas: parseArr(data.comfortableAreas),
    travelCities: parseArr(data.travelCities),
    // skills comes as JSON string from backend
    skills: parseArr(data.skills),
    experienceYears: data.experienceYears,
    weight: data.weight ?? undefined,
    height: data.height ?? undefined,
    hairColor: na(data.hairColor),
    hairLength: na(data.hairLength),
    eyeColor: na(data.eyeColor),
    complexion: na(data.complexion),
    hasTattoo: data.hasTattoo,
    hasMole: data.hasMole,
    shoeSize: na(data.shoeSize),
    hasPassport: data.hasPassport,
    hourlyRate: data.hourlyRate ?? undefined,
    // backend returns profileUrl (not profilePhotoUrl)
    profilePhoto: data.profileUrl ?? data.profilePhotoUrl ?? data.profilePhoto ?? undefined,
    coverPhoto: data.coverPhotoUrl ?? data.coverPhoto ?? undefined,
    videoUrl: na(data.videoUrl),
    danceVideo: na(data.danceShowreelUrl) ?? na(data.danceVideo),
    // portfolioUrls comes as JSON string from backend
    portfolioUrls: parseArr(data.portfolioUrls ?? data.portfolioItems),
    isVerifiedBadge: data.isVerifiedBadge ?? data.isVerified ?? false,
    isProfileComplete: data.isProfileComplete,
    totalApplications: data.totalApplications,
    successfulHires: data.successfulHires,
    artistType: data.artistType ?? {
      id: data.artistTypeId,
      name: data.artistTypeName,
      displayName: data.artistTypeName
        ?.replace(/_/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase()),
    },
    professions: (() => {
      const prettify = (s?: string) =>
        s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : ''
      const list = data.artistTypes ?? data.professions
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
      const name = data.artistTypeName ?? data.artistType?.name
      return name ? [{ id: data.artistTypeId ?? data.artistType?.id, name, displayName: data.artistType?.displayName || prettify(name) }] : []
    })(),
    category:
      data.artistCategory ??
      data.artistTypeName
        ?.replace(/_/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase()) ??
      data.artistType?.displayName,
    dynamicFields: data.dynamicFields ?? [],
  }
}

export async function getPublicArtistProfile(userId: string | number): Promise<ArtistProfile> {
  const res = await fetch(`${BASE_URL}/public/artists/${userId}/profile`)
  const json = await res.json()

  // Backend returns { success: false, error: {...} } on failure
  if (!res.ok || json.success === false) {
    const msg: string = json?.error?.message ?? ''
    if (res.status === 404 || msg.toLowerCase().includes('not found')) {
      throw new Error('Profile not found')
    }
    throw new Error('Failed to load profile')
  }

  // Response shape: { success: true, data: { ...fields } }
  const data = json.data ?? json
  return mapPublicProfile(data)
}
