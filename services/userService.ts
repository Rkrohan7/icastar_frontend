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

export interface RegisterRequest extends LoginRequest {
  firstName: string
  lastName: string
  mobile?: string
  role: string
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
export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      console.log('Login response:', response.data.data)

      const { token, email, mobile, role, status, isVerified, firstName, lastName, fullName } = response.data.data

      // Store tokens and user data
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify({ email, mobile, role, status, isVerified, firstName, lastName, fullName }))

      // Set default auth header for future requests
      api.interceptors.request.use(config => {
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      })

      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData)
      return response.data
    } catch (error) {
      console.error('Registration failed:', error)
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
