// Public (no-auth) job endpoints. Uses plain fetch so no token is attached —
// anyone can view a shared job and apply to it without an account.
const BASE_URL = 'https://api.icastar.com/api'

export interface PublicJob {
  id: number
  title: string
  company?: string
  companyName?: string
  location?: string
  isRemote?: boolean
  jobType?: string
  experienceLevel?: string
  budgetMin?: number
  budgetMax?: number
  currency?: string
  description?: string
  responsibilities?: string
  requirements?: string
  skills?: string[] | string
  applicationDeadline?: string
  createdAt?: string
  [key: string]: any
}

// Everything a public (guest) applicant submits. Mirrors the fields a normal
// application needs, plus the identity fields we don't have without a login.
export interface PublicJobApplication {
  fullName: string
  email: string
  phone: string
  address: string
  experienceYears: number
  coverLetter: string
  expectedSalary: number
}

const parseSkills = (val: any): string[] => {
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

export async function getPublicJob(jobId: string | number): Promise<PublicJob> {
  const res = await fetch(`${BASE_URL}/public/jobs/${jobId}`)
  const json = await res.json()

  if (!res.ok || json.success === false) {
    const msg: string = json?.error?.message ?? json?.message ?? ''
    if (res.status === 404 || msg.toLowerCase().includes('not found')) {
      throw new Error('Job not found')
    }
    throw new Error('Failed to load job')
  }

  const data = json.data ?? json
  return { ...data, skills: parseSkills(data.skills) }
}

export async function applyToPublicJob(
  jobId: string | number,
  payload: PublicJobApplication,
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${BASE_URL}/public/jobs/${jobId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  let json: any = {}
  try {
    json = await res.json()
  } catch {
    /* non-JSON response */
  }

  if (!res.ok || json.success === false) {
    const msg: string =
      json?.error?.message ?? json?.message ?? 'Failed to submit application'
    throw new Error(msg)
  }

  return { success: true, message: json?.message }
}
