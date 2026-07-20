import api from './apiClient'
import { cachedGet, invalidateCache } from './cache'

// Applicant lists per job cache for 60s; scheduling an interview or submitting
// a result clears the prefix so the list reflects the new status.
const APPLICANTS_TTL = 60_000

export interface ApplicantDto {
  id: number
  jobId?: number
  name: string
  avatarUrl?: string
  skills?: string[]
  status: 'New' | 'Viewed' | 'Interviewing' | 'Hired' | 'Rejected'
  job?: string
  appliedDate?: string
  email?: string
  phone?: string
  bio?: string
  portfolioUrl?: string
  [key: string]: any
}

export interface ScheduleInterviewDto {
  applicationId: number
  interviewDateTime: string
  interviewType: string
  meetingLink?: string
  notes?: string
}

export interface InterviewResultDto {
  applicationId: number
  result: 'HIRED' | 'REJECTED'
  offerDetails?: {
    salary?: string
    contractUrl?: string
  }
  notes?: string
  rejectionReason?: string
}

export const recruiterApplicantsService = {
  async getJobApplicants(jobId: number | string): Promise<ApplicantDto[]> {
    return cachedGet(`recruiter:applicants:job:${jobId}`, async () => {
    const response = await api.get(`/recruiter/dashboard/jobs/${jobId}/applicants`)

    // Normalize the response to match the expected format
    const responseData = response.data

    // Handle different response formats
    let applicants: any[] = []

    // Check for data.data.applicants format (your API response)
    if (responseData?.data?.applicants && Array.isArray(responseData.data.applicants)) {
      applicants = responseData.data.applicants
    } else if (responseData?.applicants && Array.isArray(responseData.applicants)) {
      applicants = responseData.applicants
    } else if (Array.isArray(responseData)) {
      applicants = responseData
    } else if (responseData?.data && Array.isArray(responseData.data)) {
      applicants = responseData.data
    } else if (responseData?.content && Array.isArray(responseData.content)) {
      applicants = responseData.content
    } else if (responseData?.items && Array.isArray(responseData.items)) {
      applicants = responseData.items
    }

    // Map to standardized format
    return applicants.map((applicant: any) => ({
      id: applicant.id ?? applicant.applicantId ?? applicant.artistId,
      jobId: applicant.jobId ?? jobId,
      name: applicant.artistName ?? applicant.name ?? applicant.fullName ?? 'Unknown',
      avatarUrl: applicant.avatarUrl ?? applicant.profilePhoto ?? applicant.photo ?? applicant.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(applicant.artistName || 'User')}&background=random`,
      skills: applicant.skills ?? applicant.skillsList ?? [],
      status: this.mapStatus(applicant.status ?? applicant.applicationStatus ?? 'New'),
      job: applicant.jobTitle ?? applicant.job,
      appliedDate: this.formatDate(applicant.appliedAt ?? applicant.appliedDate ?? applicant.createdAt),
      email: applicant.email ?? applicant.contactEmail ?? applicant.companyName,
      phone: applicant.phone ?? applicant.contactPhone ?? applicant.mobile,
      bio: applicant.artistBio ?? applicant.bio ?? applicant.description ?? applicant.summary,
      portfolioUrl: applicant.portfolioUrl ?? applicant.portfolio ?? applicant.website,
      // Additional fields from API
      coverLetter: applicant.coverLetter,
      proposedRate: applicant.proposedRate,
      artistLocation: applicant.artistLocation,
      artistExperience: applicant.artistExperience,
      isArtistVerified: applicant.isArtistVerified,
    }))
    }, { ttl: APPLICANTS_TTL })
  },

  // Helper method to map backend status to UI status
  mapStatus(status: string): 'New' | 'Viewed' | 'Interviewing' | 'Hired' | 'Rejected' {
    const statusMap: Record<string, 'New' | 'Viewed' | 'Interviewing' | 'Hired' | 'Rejected'> = {
      'APPLIED': 'New',
      'NEW': 'New',
      'VIEWED': 'Viewed',
      'REVIEWED': 'Viewed',
      'INTERVIEWING': 'Interviewing',
      'INTERVIEW': 'Interviewing',
      'HIRED': 'Hired',
      'ACCEPTED': 'Hired',
      'REJECTED': 'Rejected',
      'DECLINED': 'Rejected',
    }
    return statusMap[status?.toUpperCase()] ?? 'New'
  },

  // Helper method to format date
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Recently'

    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return '1 day ago'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return `${Math.floor(diffDays / 30)} months ago`
    } catch (error) {
      return 'Recently'
    }
  },

  async scheduleInterview(data: ScheduleInterviewDto): Promise<any> {
    const response = await api.post('/recruiter/dashboard/schedule-interview', data)
    invalidateCache('recruiter:applicants:')
    return response.data
  },

  async submitInterviewResult(data: InterviewResultDto): Promise<any> {
    const response = await api.post('/recruiter/dashboard/interview-result', data)
    invalidateCache('recruiter:applicants:')
    return response.data
  },
}

export default recruiterApplicantsService
