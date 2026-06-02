import apiClient from '@/services/apiClient';
import { Recruiter } from '@/types';

export interface RecruiterProfileDto {
  userId?: string;
  email?: string;
  mobile?: string;
  firstName?: string;
  lastName?: string;
  isVerified?: boolean;
  contactPersonName?: string;
  designation?: string;
  companyName?: string;
  companyWebsite?: string;
  companyDescription?: string;
  companyLogoUrl?: string;
  profilePhotoUrl?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  isVerifiedCompany?: boolean;
  totalJobsPosted?: number;
  successfulHires?: number;
  chatCredits?: number;
  categoryId?: string;
  categoryName?: string;
}

function mapDtoToRecruiter(dto: RecruiterProfileDto): Recruiter {
  const name = dto.contactPersonName || [dto.firstName, dto.lastName].filter(Boolean).join(' ').trim() || '—';
  const title = dto.designation || '';
  const email = dto.email || '';
  const avatarUrl = dto.profilePhotoUrl || dto.companyLogoUrl || '';
  const companyName = dto.companyName || '';
  const companyWebsite = dto.companyWebsite || '';
  const companyBio = dto.companyDescription || '';
  const verificationStatus = dto.isVerified ? 'Verified' : 'Not Verified';

  return {
    name,
    title,
    email,
    avatarUrl,
    companyName,
    companyWebsite,
    companyBio,
    verificationStatus,
    recruiterType: undefined,
  } as Recruiter;
}

// ----- Recruiter profile cache (Header + Profile page both fetched independently) -----
const RECRUITER_PROFILE_TTL = 60_000
let recruiterProfileCache: { value: Recruiter; ts: number } | null = null
let inflightRecruiterProfile: Promise<Recruiter> | null = null

export const invalidateRecruiterProfileCache = () => {
  recruiterProfileCache = null
  inflightRecruiterProfile = null
}

export async function getRecruiterProfile(forceRefresh: boolean = false): Promise<Recruiter> {
  if (!forceRefresh && recruiterProfileCache && Date.now() - recruiterProfileCache.ts < RECRUITER_PROFILE_TTL) {
    return recruiterProfileCache.value
  }
  if (!forceRefresh && inflightRecruiterProfile) return inflightRecruiterProfile

  inflightRecruiterProfile = (async () => {
    try {
      const resp = await apiClient.get('/recruiter/dashboard/profile');
      const payload = resp.data;
      const dto: RecruiterProfileDto = payload?.data || payload;
      const mapped = mapDtoToRecruiter(dto)
      recruiterProfileCache = { value: mapped, ts: Date.now() }
      return mapped
    } finally {
      inflightRecruiterProfile = null
    }
  })()

  return inflightRecruiterProfile
}

export async function updateRecruiterProfile(data: Partial<RecruiterProfileDto>): Promise<Recruiter> {
  const resp = await apiClient.put('/recruiter/dashboard/profile', data);
  const payload = resp.data;
  const dto: RecruiterProfileDto = payload?.data || payload;
  invalidateRecruiterProfileCache()
  return mapDtoToRecruiter(dto);
}