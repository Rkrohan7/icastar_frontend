import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  getPublicJob,
  applyToPublicJob,
  PublicJob,
  PublicJobApplication,
} from '@/services/publicJobService'

// ── Helpers ──────────────────────────────────────────────────────────────────

const toArr = (val: any): string[] => {
  if (!val) return []
  if (Array.isArray(val)) return val.map(String).filter(Boolean)
  if (typeof val === 'string') {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p.map(String) : [val] } catch { return [val] }
  }
  return []
}

const prettify = (s?: string) =>
  s ? s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : ''

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
)

const LoadingState = () => (
  <div className='min-h-screen bg-gray-50'>
    <nav className='bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center'>
      <Skeleton className='h-8 w-28 rounded-lg' />
      <Skeleton className='h-9 w-32 rounded-lg' />
    </nav>
    <div className='max-w-3xl mx-auto px-4 py-10 space-y-4'>
      <Skeleton className='h-8 w-2/3' />
      <Skeleton className='h-4 w-1/3' />
      <Skeleton className='h-40' />
      <Skeleton className='h-64' />
    </div>
  </div>
)

const NotFound = () => (
  <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4'>
    <img src='/favicon.png' alt='iCastar' className='h-14 w-14 mb-6 opacity-60' />
    <h2 className='text-2xl font-bold text-gray-800 mb-2'>Job Not Found</h2>
    <p className='text-gray-500 mb-6'>This job posting doesn't exist or has been closed.</p>
    <a
      href='https://www.icastar.com'
      className='px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-hover transition-colors'
    >
      Go to iCastar
    </a>
  </div>
)

// ── Apply Form ─────────────────────────────────────────────────────────────────

const emptyForm: PublicJobApplication = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  experienceYears: 0,
  coverLetter: '',
  expectedSalary: 0,
}

const Field: React.FC<{
  label: string
  required?: boolean
  children: React.ReactNode
}> = ({ label, required, children }) => (
  <div>
    <label className='block text-sm font-medium text-gray-700 mb-1'>
      {label} {required && <span className='text-red-500'>*</span>}
    </label>
    {children}
  </div>
)

const inputCls =
  'w-full px-3 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40'

const ApplyForm: React.FC<{ jobId: string; jobTitle: string }> = ({ jobId, jobTitle }) => {
  const [form, setForm] = useState<PublicJobApplication>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const set = <K extends keyof PublicJobApplication>(key: K, value: PublicJobApplication[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const phoneValid = /^\+?[0-9]{7,15}$/.test(form.phone.replace(/[\s-]/g, ''))
  const canSubmit =
    form.fullName.trim().length > 1 &&
    emailValid &&
    phoneValid &&
    form.address.trim().length > 2 &&
    form.experienceYears >= 0 &&
    form.coverLetter.trim().length >= 10 &&
    form.expectedSalary > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) {
      toast.error('Please fill in all required fields correctly.')
      return
    }
    try {
      setSubmitting(true)
      await applyToPublicJob(jobId, {
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        coverLetter: form.coverLetter.trim(),
        experienceYears: Number(form.experienceYears),
        expectedSalary: Number(form.expectedSalary),
      })
      setSubmitted(true)
      toast.success('Application submitted successfully!')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className='bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center'>
        <div className='mx-auto mb-4 h-14 w-14 rounded-full bg-green-50 flex items-center justify-center'>
          <svg className='h-7 w-7 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
            <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
          </svg>
        </div>
        <h3 className='text-xl font-bold text-gray-900 mb-1'>Application Sent!</h3>
        <p className='text-sm text-gray-500'>
          Thanks for applying to <span className='font-medium'>{jobTitle}</span>. The recruiter will
          review your application and reach out if it's a match.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4'>
      <h3 className='text-lg font-bold text-gray-900'>Apply for this job</h3>
      <p className='text-sm text-gray-500 -mt-2'>No account needed — just fill in your details.</p>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <Field label='Full Name' required>
          <input className={inputCls} value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder='Your full name' />
        </Field>
        <Field label='Email' required>
          <input className={inputCls} type='email' value={form.email} onChange={e => set('email', e.target.value)} placeholder='you@example.com' />
        </Field>
        <Field label='Phone' required>
          <input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder='e.g. 9876543210' />
        </Field>
        <Field label='Experience (years)' required>
          <input
            className={inputCls}
            type='number'
            min={0}
            value={form.experienceYears || ''}
            onChange={e => set('experienceYears', Number(e.target.value))}
            placeholder='e.g. 3'
          />
        </Field>
      </div>

      <Field label='Address' required>
        <input className={inputCls} value={form.address} onChange={e => set('address', e.target.value)} placeholder='City, State' />
      </Field>

      <Field label='Expected Salary' required>
        <input
          className={inputCls}
          type='number'
          min={0}
          value={form.expectedSalary || ''}
          onChange={e => set('expectedSalary', Number(e.target.value))}
          placeholder='e.g. 50000'
        />
      </Field>

      <Field label='Cover Letter' required>
        <textarea
          className={inputCls}
          rows={5}
          value={form.coverLetter}
          onChange={e => set('coverLetter', e.target.value)}
          placeholder='Tell the recruiter why you are a great fit...'
        />
      </Field>

      <button
        type='submit'
        disabled={!canSubmit || submitting}
        className='w-full py-3 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors'
      >
        {submitting ? 'Submitting…' : 'Submit Application'}
      </button>
    </form>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export const PublicJobPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>()
  const [job, setJob] = useState<PublicJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!jobId) { setError(true); setLoading(false); return }
    getPublicJob(jobId)
      .then(j => {
        setJob(j)
        document.title = `${j.title || 'Job'} | iCastar`
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [jobId])

  if (loading) return <LoadingState />
  if (error || !job || !jobId) return <NotFound />

  const company = job.company || job.companyName
  const skills = toArr(job.skills)
  const salary =
    job.budgetMin != null || job.budgetMax != null
      ? `${job.currency || '₹'}${Number(job.budgetMin ?? job.budgetMax).toLocaleString('en-IN')}` +
        (job.budgetMin != null && job.budgetMax != null
          ? ` - ${job.currency || '₹'}${Number(job.budgetMax).toLocaleString('en-IN')}`
          : '')
      : null

  return (
    <div className='min-h-screen bg-gray-50 font-sans'>
      {/* Top Nav */}
      <nav className='bg-white border-b border-gray-100 sticky top-0 z-20 px-6 py-3 flex items-center justify-between shadow-sm'>
        <a href='https://www.icastar.com' className='flex items-center gap-2'>
          <img src='/favicon.png' alt='iCastar' className='h-8 w-8 rounded-lg' />
          <span className='font-bold text-gray-900 text-lg'>iCastar</span>
        </a>
        <a
          href='https://www.icastar.com/auth'
          className='px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors'
        >
          Join iCastar
        </a>
      </nav>

      <div className='max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
        {/* Job header */}
        <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
          <h1 className='text-2xl font-bold text-gray-900'>{job.title}</h1>
          {company && <p className='text-primary font-semibold text-sm mt-1'>{company}</p>}

          <div className='flex flex-wrap gap-2 mt-4'>
            {job.jobType && (
              <span className='px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium'>{prettify(job.jobType)}</span>
            )}
            {job.experienceLevel && (
              <span className='px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium'>{prettify(job.experienceLevel)}</span>
            )}
            {(job.location || job.isRemote) && (
              <span className='px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium'>
                {job.isRemote ? 'Remote' : job.location}
              </span>
            )}
            {salary && (
              <span className='px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium'>{salary}</span>
            )}
          </div>
        </div>

        {/* Description */}
        {(job.description || job.responsibilities || job.requirements) && (
          <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4'>
            {job.description && (
              <div>
                <h4 className='text-base font-semibold text-gray-800 mb-2'>Description</h4>
                <p className='text-sm text-gray-600 leading-relaxed whitespace-pre-line'>{job.description}</p>
              </div>
            )}
            {job.responsibilities && (
              <div>
                <h4 className='text-base font-semibold text-gray-800 mb-2'>Responsibilities</h4>
                <p className='text-sm text-gray-600 leading-relaxed whitespace-pre-line'>{job.responsibilities}</p>
              </div>
            )}
            {job.requirements && (
              <div>
                <h4 className='text-base font-semibold text-gray-800 mb-2'>Requirements</h4>
                <p className='text-sm text-gray-600 leading-relaxed whitespace-pre-line'>{job.requirements}</p>
              </div>
            )}
            {skills.length > 0 && (
              <div>
                <h4 className='text-base font-semibold text-gray-800 mb-2'>Skills</h4>
                <div className='flex flex-wrap gap-2'>
                  {skills.map(s => (
                    <span key={s} className='px-3 py-1.5 text-sm font-medium rounded-full bg-orange-50 text-orange-700'>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Apply form */}
        <ApplyForm jobId={jobId} jobTitle={job.title} />
      </div>

      <footer className='border-t border-gray-200 bg-white py-6 text-center'>
        <div className='flex items-center justify-center gap-2 mb-1'>
          <img src='/favicon.png' alt='iCastar' className='h-5 w-5 rounded' />
          <span className='text-sm font-semibold text-gray-700'>iCastar</span>
        </div>
        <p className='text-xs text-gray-400'>Best Talent Hunting Platform · <a href='https://www.icastar.com' className='hover:underline text-primary'>www.icastar.com</a></p>
      </footer>
    </div>
  )
}

export default PublicJobPage
