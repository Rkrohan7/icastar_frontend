import api from './apiClient'
import { clearCache } from './cache'

export interface User {
  id: string | number
  email: string
  mobile?: string
  fullName?: string
  firstName?: string
  lastName?: string
  phone?: string
  profilePicture?: string
  authProvider?: string
  emailVerified?: boolean
  lastLoginAt?: string
  createdAt?: string
  updatedAt?: string
  roles?: string[]
  role?: string
  status?: string
  isVerified?: boolean
  isOnboardingComplete?: boolean
  profileCompletionPercentage?: number
  artistProfile?: {
    artistProfileId: number
    stageName?: string
    isVerified: boolean
    isProfileComplete: boolean
    artistType?: {
      id: number
      name: string
      displayName: string
    }
  }
  recruiterProfile?: {
    recruiterProfileId: number
    companyName?: string
    isVerifiedCompany: boolean
  }
}

export interface AuthResponse {
  data: {
    token: string
    email: string
    mobile?: string
    role: string
    status: string
    isVerified: boolean
    firstName?: string
    lastName?: string
    fullName?: string
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface OtpChallengeResponse {
  data: {
    challengeId: string
  }
}

export interface RegisterRequest extends LoginRequest {
  firstName: string
  lastName: string
  mobile: string
  role: string
  // Must be true — the backend rejects sign-ups without Terms & Conditions consent
  acceptedTerms: boolean
}

// ----- In-memory cache for /auth/me -----
// Header, DashLayout, Navbar, Profile pages each used to call /auth/me on mount.
// On a single dashboard load that meant 3+ identical network calls.
// We cache the result for USER_CACHE_TTL and deduplicate concurrent in-flight
// requests so back-to-back callers share a single promise.
const USER_CACHE_TTL = 60_000 // 1 minute — long enough to dedupe a page load, short enough to stay fresh
let userCache: { value: User; ts: number } | null = null
let inflightMe: Promise<User> | null = null

export const invalidateUserCache = () => {
  userCache = null
  inflightMe = null
}

// Auth functions
const storeAuthResponse = (response: AuthResponse): void => {
  const { token, email, mobile, role, status, isVerified, firstName, lastName, fullName } = response.data

  localStorage.setItem('authToken', token)
  localStorage.setItem('loginSessionId', `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  localStorage.setItem('user', JSON.stringify({ email, mobile, role, status, isVerified, firstName, lastName, fullName }))
}

export const authService = {
  async requestLoginOtp(credentials: LoginRequest): Promise<string> {
    try {
      const response = await api.post<OtpChallengeResponse>('/auth/login/otp/request', credentials)
      const challengeId = response.data?.data?.challengeId
      if (!challengeId) throw new Error('Login OTP request did not return a challenge ID')
      return challengeId
    } catch (error) {
      console.error('Login OTP request failed:', error)
      throw error
    }
  },

  async verifyLoginOtp(challengeId: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login/otp/verify', { challengeId, otp })
      if (!response.data?.data?.token) throw new Error('Login OTP verification did not return an auth token')
      storeAuthResponse(response.data)
      return response.data
    } catch (error) {
      console.error('Login OTP verification failed:', error)
      throw error
    }
  },

  async resendLoginOtp(challengeId: string): Promise<void> {
    try {
      await api.post('/auth/login/otp/resend', { challengeId })
    } catch (error) {
      console.error('Login OTP resend failed:', error)
      throw error
    }
  },

  async requestRegistrationVerification(userData: RegisterRequest): Promise<string> {
    try {
      const response = await api.post<OtpChallengeResponse>(
        '/auth/register/verification/request',
        userData,
      )
      const challengeId = response.data?.data?.challengeId
      if (!challengeId) throw new Error('Registration verification request did not return a challenge ID')
      return challengeId
    } catch (error) {
      console.error('Registration verification request failed:', error)
      throw error
    }
  },

  async verifyRegistration(
    challengeId: string,
    emailOtp: string,
    mobileOtp: string,
  ): Promise<void> {
    try {
      await api.post('/auth/register/verification/verify', { challengeId, emailOtp, mobileOtp })
    } catch (error) {
      console.error('Registration verification failed:', error)
      throw error
    }
  },

  async resendRegistrationOtp(challengeId: string, channel: 'email' | 'mobile'): Promise<void> {
    try {
      await api.post('/auth/register/verification/resend', { challengeId, channel })
    } catch (error) {
      console.error('Registration OTP resend failed:', error)
      throw error
    }
  },

  async getCurrentUser(forceRefresh: boolean = false): Promise<User> {
    // Serve from cache when fresh — saves repeated /auth/me on the same page
    if (!forceRefresh && userCache && Date.now() - userCache.ts < USER_CACHE_TTL) {
      return userCache.value
    }
    // Share a single in-flight promise across concurrent callers
    if (!forceRefresh && inflightMe) return inflightMe

    inflightMe = (async () => {
      try {
        const response = await api.get('/auth/me')
        const data = response.data?.data ?? response.data
        userCache = { value: data, ts: Date.now() }
        return data
      } catch (error) {
        console.error('Failed to fetch user:', error)
        throw error
      } finally {
        inflightMe = null
      }
    })()

    return inflightMe
  },

  async getMe(forceRefresh: boolean = false): Promise<User> {
    return this.getCurrentUser(forceRefresh)
  },

  logout(): void {
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('isOnboardingComplete')
    localStorage.removeItem('loginSessionId')
    localStorage.removeItem('profileCompletionPopupDismissedSession')
    invalidateUserCache()
    // Wipe the entire client-side response cache so the next session starts fresh
    clearCache()
    // Clear auth header from axios instance
    if (api.defaults.headers.common) {
      delete api.defaults.headers.common['Authorization']
    }
  },

  getStoredUser(): User | null {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken')
  },
}

export default authService
