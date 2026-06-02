import apiClient from './apiClient'

// ============ Shared enums ============

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED'
export type JobStatus = 'ACTIVE' | 'CLOSED' | 'DRAFT' | 'EXPIRED'
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE'
export type RecruiterCategory =
  | 'PRODUCTION_HOUSE'
  | 'CASTING_DIRECTOR'
  | 'INDIVIDUAL'
export type SortDir = 'ASC' | 'DESC'

// ============ Dashboard ============

export interface DashboardTopRecruiter {
  id: number
  name: string
  companyName: string
  email: string
  totalJobsPosted: number
  totalHires: number
  profileImage: string | null
}

export interface DashboardTopArtist {
  id: number
  name: string
  artistType: string
  email: string
  totalApplications: number
  totalHires: number
  profileViews: number
  profileImage: string | null
}

export interface DashboardTopJob {
  id: number
  title: string
  recruiterName: string
  applicationCount: number
  viewCount: number
  status: JobStatus
}

export interface SuperAdminDashboard {
  totalUsers: number
  totalArtists: number
  totalRecruiters: number
  totalAdmins: number
  activeUsers: number
  inactiveUsers: number
  suspendedUsers: number
  bannedUsers: number
  verifiedUsers: number
  unverifiedUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  totalJobs: number
  activeJobs: number
  closedJobs: number
  draftJobs: number
  featuredJobs: number
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
  shortlistedApplications: number
  topRecruiters: DashboardTopRecruiter[]
  topArtists: DashboardTopArtist[]
  topJobs: DashboardTopJob[]
  artistTypeDistribution: Record<string, number>
  jobTypeDistribution: Record<string, number>
  generatedAt: string
}

export interface DashboardSummary {
  totalUsers: number
  totalArtists: number
  totalRecruiters: number
  totalJobs: number
  activeJobs: number
  totalApplications: number
  pendingApplications: number
  newUsersToday: number
  generatedAt: string
}

// ============ Recruiters ============

export interface RecruiterRecentJob {
  id: number
  title: string
  status: JobStatus
  applicationCount: number
  createdAt: string
}

export interface SuperAdminRecruiter {
  id: number
  userId: number
  firstName: string
  lastName: string
  email: string
  mobile: string
  companyName: string
  recruiterCategory: RecruiterCategory
  designation: string
  location: string
  city: string
  state: string
  country: string
  profileImage: string | null
  companyLogo: string | null
  website: string | null
  linkedIn: string | null
  bio: string | null
  isVerified: boolean
  isEmailVerified: boolean
  isMobileVerified: boolean
  isDocumentVerified: boolean
  accountStatus: AccountStatus
  isActive: boolean
  isOnboardingComplete: boolean
  totalJobsPosted: number
  activeJobs: number
  closedJobs: number
  totalApplicationsReceived: number
  totalHires: number
  totalCastingCalls: number
  totalAuditionsScheduled: number
  totalHireRequestsSent: number
  subscriptionPlan: string | null
  subscriptionStatus: string | null
  subscriptionExpiresAt: string | null
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  lastActivityAt: string | null
  recentJobs: RecruiterRecentJob[]
}

export interface RecruitersQuery {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: SortDir
  search?: string
  status?: AccountStatus
  category?: RecruiterCategory
}

// ============ Artists ============

export interface ArtistRecentApplication {
  id: number
  jobTitle: string
  recruiterName: string
  status: string
  appliedAt: string
}

export interface SuperAdminArtist {
  id: number
  userId: number
  firstName: string
  lastName: string
  email: string
  mobile: string
  stageName: string | null
  artistTypeName: string
  artistTypeId: number
  gender: string
  dateOfBirth: string | null
  age: number | null
  location: string
  city: string
  state: string
  country: string
  bio: string | null
  profileImage: string | null
  coverImage: string | null
  height: string | null
  weight: string | null
  bodyType: string | null
  hairColor: string | null
  eyeColor: string | null
  skinTone: string | null
  skills: string[]
  languages: string[]
  experienceLevel: string | null
  yearsOfExperience: number
  isVerified: boolean
  isEmailVerified: boolean
  isMobileVerified: boolean
  isProfileComplete: boolean
  accountStatus: AccountStatus
  isActive: boolean
  isOnboardingComplete: boolean
  isAvailableForWork: boolean
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
  totalAuditions: number
  completedAuditions: number
  totalHireRequests: number
  acceptedHireRequests: number
  profileViews: number
  bookmarkedCount: number
  subscriptionPlan: string | null
  subscriptionStatus: string | null
  subscriptionExpiresAt: string | null
  portfolioImages: string[]
  portfolioVideos: string[]
  demoReel: string | null
  instagram: string | null
  youtube: string | null
  linkedIn: string | null
  imdb: string | null
  website: string | null
  customFields: Record<string, unknown>
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  lastActivityAt: string | null
  recentApplications: ArtistRecentApplication[]
}

export interface ArtistsQuery {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: SortDir
  search?: string
  status?: AccountStatus
  artistType?: string
}

// ============ Jobs ============

export interface SuperAdminJobRecruiter {
  id: number
  firstName: string
  lastName: string
  companyName: string
}

export interface SuperAdminJob {
  id: number
  title: string
  description: string
  requirements: string
  jobType: JobType
  location: string
  isRemote: boolean
  budgetMin: number
  budgetMax: number
  currency: string
  experienceLevel: string
  skillsRequired: string[]
  applicationDeadline: string
  startDate: string
  status: JobStatus
  isFeatured: boolean
  isUrgent: boolean
  applicationsCount: number
  viewsCount: number
  recruiter: SuperAdminJobRecruiter
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

export interface JobsQuery {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: SortDir
  search?: string
  status?: JobStatus
  jobType?: JobType
}

// ============ Paginated wrapper ============

export interface PaginatedResponse<T> {
  data: T[]
  currentPage: number
  totalItems: number
  totalPages: number
}

// ============ Reports ============

export interface UserReport {
  startDate: string
  endDate: string
  totalNewUsers: number
  newArtists: number
  newRecruiters: number
  activeUsers: number
  inactiveUsers: number
  verifiedUsers: number
  suspendedUsers: number
  bannedUsers: number
  deletedUsers: number
  dailyRegistrations: Record<string, number>
  usersByLocation: Record<string, number>
  usersByArtistType: Record<string, number>
  usersByRecruiterCategory: Record<string, number>
  averageProfileCompletionRate: number
  generatedAt: string
}

export interface JobReportTopJob {
  jobId: number
  jobTitle: string
  recruiterName: string
  applicationCount: number
  viewCount: number
  hireCount: number
}

export interface JobReport {
  startDate: string
  endDate: string
  totalJobsPosted: number
  activeJobs: number
  closedJobs: number
  expiredJobs: number
  featuredJobs: number
  totalApplicationsReceived: number
  averageApplicationsPerJob: number
  totalHiresMade: number
  conversionRate: number
  dailyJobPostings: Record<string, number>
  jobsByType: Record<string, number>
  jobsByLocation: Record<string, number>
  applicationsByStatus: Record<string, number>
  topPerformingJobs: JobReportTopJob[]
  generatedAt: string
}

export interface OverviewReport {
  dashboard: SuperAdminDashboard
  userReport: UserReport
  jobReport: JobReport
  period: {
    startDate: string
    endDate: string
  }
}

// ============ Stats ============

export interface UserStats {
  totalUsers: number
  totalArtists: number
  totalRecruiters: number
  totalAdmins: number
  activeUsers: number
  inactiveUsers: number
  suspendedUsers: number
  bannedUsers: number
  verifiedUsers: number
  unverifiedUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
}

export interface JobStats {
  totalJobs: number
  activeJobs: number
  closedJobs: number
  draftJobs: number
  featuredJobs: number
  jobTypeDistribution: Record<string, number>
}

export interface ApplicationStats {
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
  shortlistedApplications: number
}

export interface DistributionStats {
  artistTypeDistribution: Record<string, number>
  jobTypeDistribution: Record<string, number>
}

// ============ Configuration ============

export interface SystemConfig {
  platformName: string
  platformEmail: string
  supportEmail: string
  supportPhone: string
  allowNewRegistrations: boolean
  requireEmailVerification: boolean
  requireMobileVerification: boolean
  requireProfileApproval: boolean
  otpExpirationMinutes: number
  otpLength: number
  maxLoginAttempts: number
  maxJobsPerRecruiter: number
  jobExpirationDays: number
  maxApplicationsPerArtist: number
  emailNotificationsEnabled: boolean
  smsNotificationsEnabled: boolean
  pushNotificationsEnabled: boolean
  inAppNotificationsEnabled: boolean
}

export interface ConfigUpdatePayload {
  key: keyof SystemConfig
  value: string
  category: string
}

// ============ Admin Users ============

export interface AdminUser {
  id: number
  firstName: string
  lastName: string
  email: string
  mobile: string | null
  role: string
  permissions: string[]
  accountStatus: AccountStatus
  lastLoginAt: string | null
  createdAt: string
  createdBy: string | null
}

export interface AdminUserCreatePayload {
  firstName: string
  lastName: string
  email: string
  mobile?: string
  role: string
  permissions?: string[]
  password?: string
}

export type AdminUserUpdatePayload = Partial<AdminUserCreatePayload>

// ============ Auditions ============

export type AuditionAdminStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'

export interface SuperAdminAudition {
  id: number
  title: string
  description: string
  auditionType: string
  status: AuditionAdminStatus
  scheduledAt: string | null
  durationMinutes: number | null
  meetingLink: string | null
  artistId: number | null
  artistName: string | null
  artistEmail: string | null
  recruiterId: number | null
  recruiterName: string | null
  companyName: string | null
  jobTitle: string | null
  createdAt: string
}

export interface AuditionStatusUpdatePayload {
  status: AuditionAdminStatus
  feedback?: string
  rating?: number
}

// ============ Job Approvals ============

export interface PendingJob {
  id: number
  title: string
  description: string
  status: string
  recruiterId: number
  recruiterName: string
  companyName: string | null
  submittedAt: string
  jobType?: string
  location?: string
}

export interface JobRejectPayload {
  reason: string
}

// ============ Categories ============

export interface SuperAdminCategory {
  id: number
  name: string
  displayName: string
  description: string | null
  iconUrl: string | null
  isActive: boolean
  sortOrder: number
  artistCount: number
  fields?: unknown[]
}

export interface CategoryUpsertPayload {
  name: string
  displayName: string
  description?: string
  iconUrl?: string
  isActive: boolean
  sortOrder: number
}

// ============ Skills ============

export interface SuperAdminSkill {
  name: string
  artistCount: number
  jobCount: number
}

// ============ Job / Audition Applications ============

export interface JobApplicationItem {
  id: number
  status: string
  coverLetter: string | null
  artistId: number
  artistName: string
  artistEmail: string | null
  jobId: number
  jobTitle: string
  recruiterId: number
  recruiterName: string
  appliedAt: string
}

export interface AuditionApplicationItem {
  id: number
  status: string
  coverLetter: string | null
  artistId: number
  artistName: string
  artistEmail: string | null
  auditionId: number
  auditionTitle: string
  recruiterId: number
  recruiterName: string
  appliedAt: string
}

// ============ Interviews ============

export interface InterviewItem {
  applicationId: number
  interviewScheduledAt: string | null
  interviewNotes: string | null
  status: string
  artistName: string
  jobTitle: string
  recruiterName: string
}

// ============ Artist Portfolio ============

export interface PortfolioProject {
  name: string
  url: string | null
  description?: string
  role?: string
  year?: string
}

export interface SuperAdminPortfolio {
  id: number
  firstName: string
  lastName: string
  stageName: string | null
  artistTypeName: string | null
  profileImage: string | null
  skills: string[]
  languagesSpoken: string[]
  portfolioUrls: string[]
  projectsWorked: PortfolioProject[]
  totalApplications: number
  successfulHires: number
  bio?: string | null
  experienceLevel?: string | null
  yearsOfExperience?: number
  email?: string
  mobile?: string
}

// ============ Report Content ============

export type ReportStatus = 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED'
export type ReportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface ReportContentItem {
  id: number
  reportType: string
  reason: string
  description: string | null
  status: ReportStatus
  priority: ReportPriority
  reporterName: string | null
  reportedUserName: string | null
  reviewedByName: string | null
  resolutionNotes?: string | null
  actionTaken?: string | null
  reportedAt?: string
  reviewedAt?: string | null
}

export interface ReportReviewPayload {
  status: ReportStatus
  priority?: ReportPriority
  resolutionNotes?: string
  actionTaken?: string
}

// ============ Service ============

const unwrap = <T>(resp: { data: { data: T } }): T => resp.data.data

// Defensively parse paginated responses. Backend may return the documented
// flat shape ({ data: [...], currentPage, totalItems, totalPages }) OR a
// Spring Page-style shape ({ data: { content: [...], totalElements, totalPages, number } }).
function parsePaginated<T>(body: any, fallbackPage: number): PaginatedResponse<T> {
  if (!body) {
    return { data: [], currentPage: fallbackPage, totalItems: 0, totalPages: 0 }
  }

  // Spring Page wrapped inside data: { data: { content: [...] } }
  if (body.data && !Array.isArray(body.data) && Array.isArray(body.data.content)) {
    const inner = body.data
    return {
      data: inner.content as T[],
      currentPage: inner.number ?? inner.currentPage ?? fallbackPage,
      totalItems: inner.totalElements ?? inner.totalItems ?? inner.content.length,
      totalPages: inner.totalPages ?? 1,
    }
  }

  // Documented flat shape
  if (Array.isArray(body.data)) {
    return {
      data: body.data as T[],
      currentPage: body.currentPage ?? body.page ?? fallbackPage,
      totalItems: body.totalItems ?? body.totalElements ?? body.total ?? body.data.length,
      totalPages: body.totalPages ?? 1,
    }
  }

  // Top-level array
  if (Array.isArray(body)) {
    return {
      data: body as T[],
      currentPage: fallbackPage,
      totalItems: body.length,
      totalPages: 1,
    }
  }

  console.warn('[superAdminService] Unrecognised paginated response shape:', body)
  return { data: [], currentPage: fallbackPage, totalItems: 0, totalPages: 0 }
}

const superAdminService = {
  // Dashboard
  async getDashboard(): Promise<SuperAdminDashboard> {
    const resp = await apiClient.get('/super-admin/dashboard')
    return unwrap(resp)
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    const resp = await apiClient.get('/super-admin/dashboard/summary')
    return unwrap(resp)
  },

  // Recruiters
  async getRecruiters(query: RecruitersQuery = {}): Promise<PaginatedResponse<SuperAdminRecruiter>> {
    const resp = await apiClient.get('/super-admin/recruiters', { params: query })
    return parsePaginated<SuperAdminRecruiter>(resp.data, query.page ?? 0)
  },

  async getRecruiter(id: number): Promise<SuperAdminRecruiter> {
    const resp = await apiClient.get(`/super-admin/recruiters/${id}`)
    return unwrap(resp)
  },

  // Artists
  async getArtists(query: ArtistsQuery = {}): Promise<PaginatedResponse<SuperAdminArtist>> {
    const resp = await apiClient.get('/super-admin/artists', { params: query })
    return parsePaginated<SuperAdminArtist>(resp.data, query.page ?? 0)
  },

  async getArtist(id: number): Promise<SuperAdminArtist> {
    const resp = await apiClient.get(`/super-admin/artists/${id}`)
    return unwrap(resp)
  },

  // Jobs
  async getJobs(query: JobsQuery = {}): Promise<PaginatedResponse<SuperAdminJob>> {
    const resp = await apiClient.get('/super-admin/jobs', { params: query })
    return parsePaginated<SuperAdminJob>(resp.data, query.page ?? 0)
  },

  // Reports
  async getUserReport(startDate: string, endDate: string): Promise<UserReport> {
    const resp = await apiClient.get('/super-admin/reports/users', {
      params: { startDate, endDate },
    })
    return unwrap(resp)
  },

  async getJobReport(startDate: string, endDate: string): Promise<JobReport> {
    const resp = await apiClient.get('/super-admin/reports/jobs', {
      params: { startDate, endDate },
    })
    return unwrap(resp)
  },

  async getOverviewReport(startDate: string, endDate: string): Promise<OverviewReport> {
    const resp = await apiClient.get('/super-admin/reports/overview', {
      params: { startDate, endDate },
    })
    return unwrap(resp)
  },

  // Stats
  async getUserStats(): Promise<UserStats> {
    const resp = await apiClient.get('/super-admin/stats/users')
    return unwrap(resp)
  },

  async getJobStats(): Promise<JobStats> {
    const resp = await apiClient.get('/super-admin/stats/jobs')
    return unwrap(resp)
  },

  async getApplicationStats(): Promise<ApplicationStats> {
    const resp = await apiClient.get('/super-admin/stats/applications')
    return unwrap(resp)
  },

  async getDistributionStats(): Promise<DistributionStats> {
    const resp = await apiClient.get('/super-admin/stats/distribution')
    return unwrap(resp)
  },

  // Configuration
  async getConfig(): Promise<SystemConfig> {
    const resp = await apiClient.get('/super-admin/config')
    return unwrap(resp)
  },

  async updateConfig(payload: ConfigUpdatePayload): Promise<void> {
    await apiClient.put('/super-admin/config', payload)
  },

  // Admin Users
  async getAdminUsers(query: { page?: number; size?: number; search?: string; status?: AccountStatus } = {}): Promise<PaginatedResponse<AdminUser>> {
    const resp = await apiClient.get('/super-admin/admins', { params: query })
    return parsePaginated<AdminUser>(resp.data, query.page ?? 0)
  },

  async getAdminUser(id: number): Promise<AdminUser> {
    const resp = await apiClient.get(`/super-admin/admins/${id}`)
    return unwrap(resp)
  },

  async createAdminUser(payload: AdminUserCreatePayload): Promise<AdminUser> {
    const resp = await apiClient.post('/super-admin/admins', payload)
    return unwrap(resp)
  },

  async updateAdminUser(id: number, payload: AdminUserUpdatePayload): Promise<AdminUser> {
    const resp = await apiClient.put(`/super-admin/admins/${id}`, payload)
    return unwrap(resp)
  },

  async updateAdminUserStatus(id: number, status: AccountStatus): Promise<AdminUser> {
    const resp = await apiClient.patch(`/super-admin/admins/${id}/status`, { status })
    return unwrap(resp)
  },

  async deleteAdminUser(id: number): Promise<void> {
    await apiClient.delete(`/super-admin/admins/${id}`)
  },

  // Auditions
  async getAuditions(query: { page?: number; size?: number; sortBy?: string; sortDir?: SortDir; status?: AuditionAdminStatus; type?: string } = {}): Promise<PaginatedResponse<SuperAdminAudition>> {
    const resp = await apiClient.get('/super-admin/auditions', { params: query })
    return parsePaginated<SuperAdminAudition>(resp.data, query.page ?? 0)
  },

  async updateAuditionStatus(id: number, payload: AuditionStatusUpdatePayload): Promise<SuperAdminAudition> {
    const resp = await apiClient.patch(`/super-admin/auditions/${id}/status`, payload)
    return unwrap(resp)
  },

  // Job Approvals
  async getPendingJobs(query: { page?: number; size?: number } = {}): Promise<PaginatedResponse<PendingJob>> {
    const resp = await apiClient.get('/super-admin/jobs/pending-approval', { params: query })
    return parsePaginated<PendingJob>(resp.data, query.page ?? 0)
  },

  async approveJob(id: number): Promise<PendingJob> {
    const resp = await apiClient.post(`/super-admin/jobs/${id}/approve`)
    return unwrap(resp)
  },

  async rejectJob(id: number, payload: JobRejectPayload): Promise<PendingJob> {
    const resp = await apiClient.post(`/super-admin/jobs/${id}/reject`, payload)
    return unwrap(resp)
  },

  // Categories
  async getCategories(query: { page?: number; size?: number; search?: string } = {}): Promise<PaginatedResponse<SuperAdminCategory>> {
    const resp = await apiClient.get('/super-admin/categories', { params: query })
    return parsePaginated<SuperAdminCategory>(resp.data, query.page ?? 0)
  },

  async getCategory(id: number): Promise<SuperAdminCategory> {
    const resp = await apiClient.get(`/super-admin/categories/${id}`)
    return unwrap(resp)
  },

  async createCategory(payload: CategoryUpsertPayload): Promise<SuperAdminCategory> {
    const resp = await apiClient.post('/super-admin/categories', payload)
    return unwrap(resp)
  },

  async updateCategory(id: number, payload: CategoryUpsertPayload): Promise<SuperAdminCategory> {
    const resp = await apiClient.put(`/super-admin/categories/${id}`, payload)
    return unwrap(resp)
  },

  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/super-admin/categories/${id}`)
  },

  // Skills
  async getSkills(query: { page?: number; size?: number; search?: string } = {}): Promise<PaginatedResponse<SuperAdminSkill>> {
    const resp = await apiClient.get('/super-admin/skills', { params: query })
    const body = resp.data
    // Skills response uses `name` as key, no numeric id — adapt to PaginatedResponse
    if (Array.isArray(body?.data)) {
      return {
        data: body.data as SuperAdminSkill[],
        currentPage: body.currentPage ?? query.page ?? 0,
        totalItems: body.totalItems ?? body.totalElements ?? body.data.length,
        totalPages: body.totalPages ?? 1,
      }
    }
    return parsePaginated<SuperAdminSkill>(body, query.page ?? 0)
  },

  // Job Applications
  async getJobApplications(query: { page?: number; size?: number; sortBy?: string; sortDir?: SortDir; status?: string } = {}): Promise<PaginatedResponse<JobApplicationItem>> {
    const resp = await apiClient.get('/super-admin/job-applications', { params: query })
    return parsePaginated<JobApplicationItem>(resp.data, query.page ?? 0)
  },

  async getJobApplication(id: number): Promise<JobApplicationItem> {
    const resp = await apiClient.get(`/super-admin/job-applications/${id}`)
    return unwrap(resp)
  },

  // Audition Applications
  async getAuditionApplications(query: { page?: number; size?: number; sortBy?: string; sortDir?: SortDir; status?: string } = {}): Promise<PaginatedResponse<AuditionApplicationItem>> {
    const resp = await apiClient.get('/super-admin/audition-applications', { params: query })
    return parsePaginated<AuditionApplicationItem>(resp.data, query.page ?? 0)
  },

  // Interviews
  async getInterviews(query: { page?: number; size?: number; status?: string } = {}): Promise<PaginatedResponse<InterviewItem>> {
    const resp = await apiClient.get('/super-admin/interviews', { params: query })
    return parsePaginated<InterviewItem>(resp.data, query.page ?? 0)
  },

  // Artist Portfolio
  async getArtistPortfolio(artistId: number): Promise<SuperAdminPortfolio> {
    const resp = await apiClient.get(`/super-admin/artists/${artistId}/portfolio`)
    return unwrap(resp)
  },

  // Report Content
  async getReportedContent(query: { page?: number; size?: number; status?: ReportStatus; priority?: ReportPriority } = {}): Promise<PaginatedResponse<ReportContentItem>> {
    const resp = await apiClient.get('/super-admin/report-content', { params: query })
    return parsePaginated<ReportContentItem>(resp.data, query.page ?? 0)
  },

  async getReportedContentItem(id: number): Promise<ReportContentItem> {
    const resp = await apiClient.get(`/super-admin/report-content/${id}`)
    return unwrap(resp)
  },

  async reviewReportedContent(id: number, payload: ReportReviewPayload): Promise<ReportContentItem> {
    const resp = await apiClient.patch(`/super-admin/report-content/${id}/review`, payload)
    return unwrap(resp)
  },
}

export default superAdminService
