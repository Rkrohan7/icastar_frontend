export enum Page {
  Dashboard = 'Dashboard',
  Jobs = 'Jobs',
  Applicants = 'Applicants',
  BrowseArtists = 'Browse Artists',
  Suggestions = 'Suggestions',
  Candidates = 'Candidates',
  PastHires = 'Past Hires',
  PastHireDetail = 'Past Hire Detail',
  ApplicantProfile = 'Applicant Profile',
  ArtistProfile = 'Artist Profile',
  Profile = 'profile',
  Settings = 'settings',
  Notifications = 'Notifications',
  Bookmarks = 'Bookmarks',
  VerifiedBadge = 'Verified Badge',
  Auditions = 'Auditions',
  Applications = 'Applications',
  Messages = 'Messages',
}

export type VerificationStatus = 'Verified' | 'Pending' | 'Not Verified'
export type RecruiterType = 'In-house' | 'Agency' | 'Freelance'

export interface Recruiter {
  name: string
  title: string
  email: string
  avatarUrl: string
  companyName?: string
  companyWebsite?: string
  companyBio?: string
  verificationStatus?: VerificationStatus
  recruiterType?: RecruiterType
}

export interface Applicant {
  id: number
  name: string
  avatarUrl: string
  skills: string[]
  status: 'New' | 'Viewed' | 'Interviewing' | 'Hired' | 'Rejected'
  job: string
  jobId: number
  appliedDate: string
  email?: string
  phone?: string
  bio?: string
  portfolioUrl?: string
}

export interface Notification {
  id: number
  type: 'applicant' | 'job' | 'message'
  text: string
  time: string
  read: boolean
}

export interface Artist {
  id: number
  name: string
  avatarUrl: string
  coverPhotoUrl?: string
  bio: string
  skills: string[]
  email?: string
  phone?: string
  website?: string
  socialLinks?: string[]
  contactPreference?: string
  portfolioUrl?: string
  videoUrl?: string
  profileCompletionPercentage?: number
  category?: string
  location?: string
  experienceYears?: number
  experienceLevel?: string
  isVerified?: boolean
  verificationStatus?: string
  isPremium?: boolean
  recruiterId?: number
  genres?: string[]
  languages?: string[]
  achievements?: string[]
  certifications?: string[]
  comfortableAreas?: string[]
  travelCities?: string[]
  availability?: string
  preferredJobType?: string
  expectedSalaryMin?: number
  expectedSalaryMax?: number
  currency?: string
  workSchedule?: string
  hourlyRate?: number
  gender?: string
  maritalStatus?: string
  dateOfBirth?: string
  weight?: number
  height?: number
  hairColor?: string
  hairLength?: string
  eyeColor?: string
  complexion?: string
  hasTattoo?: boolean
  hasMole?: boolean
  shoeSize?: string
  hasPassport?: boolean
  lastActive?: string
  totalApplications?: number
  totalHires?: number
}

export interface SuggestedArtist extends Artist {
  matchScore: number
  reason: string
}

export interface Hire {
  id: number
  artist: Artist
  jobTitle: string
  jobId: number
  hiredDate: string
}

// Hire Request Status
export type HireRequestStatus = 'PENDING' | 'VIEWED' | 'ACCEPTED' | 'DECLINED' | 'HIRED' | 'WITHDRAWN' | 'EXPIRED'

// Hire Request Interface
export interface HireRequest {
  id: number
  recruiterId: number
  recruiterName: string
  recruiterCompany?: string
  artistId: number
  artistName: string
  artistEmail: string
  artistProfileUrl?: string
  artistCategory?: string
  artistSkills?: string[]
  jobId: number
  jobTitle: string
  jobType?: string
  message: string
  status: HireRequestStatus
  sentAt: string
  viewedAt?: string
  respondedAt?: string
  hiredAt?: string
  notes?: string
  artistResponse?: string
  emailSent?: boolean
  reminderSent?: boolean
  reminderSentAt?: string
  offeredSalary?: number
  projectDetails?: string
  createdAt?: string
  updatedAt?: string
}

// Create Hire Request DTO
export interface CreateHireRequestDto {
  artistId: number
  jobId: number
  message: string
  offeredSalary?: number
  projectDetails?: string
  notes?: string
}

// Update Hire Request Status DTO
export interface UpdateHireRequestStatusDto {
  status: HireRequestStatus
  notes?: string
}

// Hire Request Filters
export interface HireRequestFilters {
  status?: HireRequestStatus
  artistCategory?: string
  artistId?: number
  jobId?: number
  searchTerm?: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

// Backend Paginated Response (Spring Boot format)
export interface PagedResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      sorted: boolean
      unsorted: boolean
    }
  }
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  numberOfElements: number
}

// Paginated Hire Requests Response
export interface PagedHireRequestsResult {
  items: HireRequest[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
}

// Backend API Response Wrapper
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

// Hire Request Statistics
export interface HireRequestStats {
  total: number
  pending: number
  viewed: number
  accepted: number
  declined: number
  hired: number
  withdrawn: number
  expired: number
  acceptanceRate: number
  responseRate: number
}

export interface Job {
  id: number
  title: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance'
  applicants: number
  status: 'Active' | 'Draft' | 'Closed'
  postedDate: string // For display
  createdDate: string // ISO String for manipulation
  description?: string
  skills?: string
  boosted?: boolean
  experienceLevel?: string
  isRemote?: boolean
  location?: string
  requirements?: string
  budgetMin?: number
  budgetMax?: number
  currency?: string
  durationDays?: number
  applicationDeadline?: string
  isUrgent?: boolean
}

export enum ArtistCategory {
  Actor = 'Actor / Actress / Model',
  Dancer = 'Dancers & Choreographers',
  Director = 'Director',
  Writer = 'Writer',
  Makeup = 'Makeup & Hair Dresser',
  Singer = 'Singer',
  Musician = 'Musician',
  Comedian = 'Stand-up Comedian',
  Band = 'Band / Music Group',
  DJ_RJ = 'DJ / RJ',
}

// Audition Management Types (Casting Calls)
export type AuditionStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'CANCELLED'
export type AuditionRoleType = 'LEAD' | 'SUPPORTING' | 'BACKGROUND' | 'EXTRA'
export type AuditionProjectType = 'FEATURE_FILM' | 'TV_SERIES' | 'COMMERCIAL' | 'THEATER' | 'WEB_SERIES' | 'SHORT_FILM' | 'MUSIC_VIDEO'
export type AuditionFormat = 'IN_PERSON' | 'VIRTUAL' | 'SELF_TAPE'
export type AuditionApplicationStatus = 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'CALLBACK_SCHEDULED' | 'CALLBACK_COMPLETED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
export type CompensationType = 'PAID' | 'UNPAID' | 'DEFERRED' | 'COPY_CREDIT_MEALS'
export type GenderPreference = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'ANY'
export type EthnicityPreference = 'ANY' | 'CAUCASIAN' | 'AFRICAN_AMERICAN' | 'HISPANIC_LATINO' | 'ASIAN' | 'MIDDLE_EASTERN' | 'NATIVE_AMERICAN' | 'PACIFIC_ISLANDER' | 'MIXED' | 'OTHER'

export interface Audition {
  id: number
  recruiterId: number
  recruiterName?: string

  // Basic Details
  title: string
  description: string
  characterName?: string
  characterDescription?: string

  // Project Info
  projectTitle?: string
  projectType: AuditionProjectType
  productionCompany?: string
  director?: string
  castingDirector?: string

  // Role Details
  roleType: AuditionRoleType
  genderPreference: GenderPreference
  ageRangeMin?: number
  ageRangeMax?: number
  ethnicityPreference?: EthnicityPreference
  physicalRequirements?: string
  skillsRequired?: string[]
  experienceRequired?: string

  // Audition Details
  auditionFormat: AuditionFormat
  auditionLocation?: string
  auditionDate?: string
  callbackDate?: string
  shootingStartDate?: string
  shootingEndDate?: string

  // Compensation
  compensation?: string
  compensationType: CompensationType
  isUnionProject: boolean

  // Application Info
  applicationDeadline: string
  requiredDocuments?: string[]
  submissionInstructions?: string
  allowVideoSubmissions: boolean
  requireCoverLetter: boolean

  // Contact
  contactEmail?: string
  contactPhone?: string

  // Additional
  additionalNotes?: string
  isUrgent: boolean
  isFeatured: boolean

  // Status & Metadata
  status: AuditionStatus
  totalApplications: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  closedAt?: string
}

export interface AuditionApplication {
  id: number
  auditionId: number
  auditionTitle: string
  artistId: number
  artistName: string
  artistEmail: string
  artistAvatar?: string
  artistCategory: string
  artistSkills: string[]
  artistBio?: string
  portfolioUrl?: string
  videoSubmissionUrl?: string
  coverLetter?: string
  status: AuditionApplicationStatus
  appliedAt: string
  updatedAt: string

  // Recruiter fields
  notes?: string
  rating?: number // 1-5
  isShortlisted: boolean

  // Callback info
  callbackDate?: string
  callbackLocation?: string
  callbackNotes?: string

  // Feedback
  feedback?: string
  rejectionReason?: string
}

export interface CreateAuditionDto {
  title: string
  description: string
  characterName?: string
  characterDescription?: string
  projectTitle?: string
  projectType: AuditionProjectType
  productionCompany?: string
  director?: string
  castingDirector?: string
  roleType: AuditionRoleType
  genderPreference: GenderPreference
  ageRangeMin?: number
  ageRangeMax?: number
  ethnicityPreference?: EthnicityPreference
  physicalRequirements?: string
  skillsRequired?: string[]
  experienceRequired?: string
  auditionFormat: AuditionFormat
  auditionLocation?: string
  auditionDate?: string
  callbackDate?: string
  shootingStartDate?: string
  shootingEndDate?: string
  compensation?: string
  compensationType: CompensationType
  isUnionProject: boolean
  applicationDeadline: string
  requiredDocuments?: string[]
  submissionInstructions?: string
  allowVideoSubmissions: boolean
  requireCoverLetter: boolean
  contactEmail?: string
  contactPhone?: string
  additionalNotes?: string
  isUrgent: boolean
  isFeatured: boolean
}

export interface AuditionFilters {
  searchTerm?: string
  status?: AuditionStatus
  roleType?: AuditionRoleType
  projectType?: AuditionProjectType
  location?: string
  isUrgent?: boolean
  isFeatured?: boolean
  page?: number
  size?: number
}

export interface ApplicationFilters {
  status?: AuditionApplicationStatus
  isShortlisted?: boolean
  minRating?: number
  page?: number
  size?: number
}

export interface PaginatedResponse<T> {
  success: boolean
  message?: string
  data: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
}

export interface AuditionStats {
  totalCastingCalls: number
  draftCastingCalls: number
  openCastingCalls: number
  closedCastingCalls: number
  totalApplications: number
  appliedApplications: number
  underReviewApplications: number
  shortlistedApplications: number
  selectedApplications: number
  rejectedApplications: number
  selectionRate: number
  avgApplicationsPerCastingCall: number
  recentApplicationsLast30Days: number
}
// Open Audition Types
export type OpenAuditionType = 'LIVE_VIDEO' | 'LIVE_AUDIO' | 'RECORDED_SUBMISSION' | 'IN_PERSON'
export type OpenAuditionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface OpenAudition {
  id: number
  title: string
  description: string
  auditionType: OpenAuditionType
  scheduledAt: string
  durationMinutes?: number
  meetingLink?: string
  instructions?: string
  status: OpenAuditionStatus
  isOpenAudition: boolean
  targetArtistType: {
    id: number
    name: string
    displayName: string
  }
  recruiter?: {
    recruiterId: number
    companyName?: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface CreateOpenAuditionDto {
  artistTypeId: number
  title: string
  description: string
  auditionType: OpenAuditionType
  scheduledAt: string
  durationMinutes?: number
  meetingLink?: string
  instructions?: string
}
