import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import superAdminService, { SuperAdminRecruiter } from '@/services/superAdminService'

type VerificationType = 'FACE' | 'ID_PROOF'

const statusLabel = (recruiter: SuperAdminRecruiter, type: VerificationType): string => {
  const raw = String(type === 'FACE' ? recruiter.faceVerificationStatus : recruiter.idProofVerificationStatus ?? '').toUpperCase()
  const approved = type === 'FACE'
    ? recruiter.isFaceVerified === true || raw === 'APPROVED'
    : recruiter.idProofVerified === true || raw === 'APPROVED'
  const url = type === 'FACE' ? recruiter.faceVerificationUrl : recruiter.idProofUrl
  if (approved) return 'Approved'
  if (raw === 'REJECTED') return 'Rejected'
  if (raw === 'PENDING' || Boolean(url)) return 'Pending review'
  return 'Not submitted'
}

const SuperAdminRecruiterVerificationPage: React.FC = () => {
  const navigate = useNavigate()
  const [recruiters, setRecruiters] = useState<SuperAdminRecruiter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<VerificationType>('FACE')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        setRecruiters(await superAdminService.getRecruiterVerificationQueue())
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load recruiter verification queue.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const handleReview = async (recruiterId: number, decision: 'APPROVED' | 'REJECTED') => {
    const reason = `${activeTab === 'FACE' ? 'Face' : 'ID proof'} verification ${decision.toLowerCase()} by admin.`
    try {
      await superAdminService.reviewRecruiterVerification(recruiterId, decision, activeTab, reason)
      setRecruiters(current => current.map(recruiter => {
        if (recruiter.id !== recruiterId) return recruiter
        return activeTab === 'FACE'
          ? { ...recruiter, isFaceVerified: decision === 'APPROVED', faceVerificationStatus: decision }
          : { ...recruiter, idProofVerified: decision === 'APPROVED', idProofVerificationStatus: decision }
      }))
      toast.success(`Recruiter ${activeTab === 'FACE' ? 'face' : 'ID proof'} verification ${decision.toLowerCase()}.`)
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Review action failed.'
      setError(message)
      toast.error(message)
    }
  }

  const queue = recruiters.filter(recruiter => {
    const status = statusLabel(recruiter, activeTab)
    return status === 'Pending review' || status === 'Rejected'
  })

  return (
    <div className='space-y-5 p-4 sm:p-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <p className='text-xs font-medium uppercase tracking-[0.12em] text-[#E36A3A] sm:text-sm'>Admin</p>
          <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>Recruiter verification</h1>
        </div>
        <button
          onClick={() => navigate('/admin/recruiters')}
          className='rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50'>
          Back to recruiters
        </button>
      </div>

      <div className='flex gap-2 border-b border-gray-200' role='tablist' aria-label='Recruiter verification type'>
        {([
          ['FACE', 'Face verification'],
          ['ID_PROOF', 'ID proof verification'],
        ] as const).map(([type, label]) => (
          <button
            key={type}
            type='button'
            role='tab'
            aria-selected={activeTab === type}
            onClick={() => setActiveTab(type)}
            className={`border-b-2 px-4 py-3 text-sm font-medium ${
              activeTab === type ? 'border-[#E36A3A] text-[#E36A3A]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className='rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500'>Loading verification queue...</div>
      ) : error ? (
        <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-red-700'>{error}</div>
      ) : queue.length === 0 ? (
        <div className='rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500'>
          No pending recruiter {activeTab === 'FACE' ? 'face' : 'ID proof'} verification requests.
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-6'>
          {queue.map(recruiter => {
            const documentUrl = activeTab === 'FACE' ? recruiter.faceVerificationUrl : recruiter.idProofUrl
            const isImage = activeTab === 'FACE' || Boolean(documentUrl && /\.(?:jpe?g|png|gif|webp|bmp)(?:$|[?#])/i.test(documentUrl))
            const status = statusLabel(recruiter, activeTab)
            const name = recruiter.companyName || `${recruiter.firstName || ''} ${recruiter.lastName || ''}`.trim() || 'Recruiter'
            return (
              <div key={recruiter.id} className='flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'>
                <div className='flex items-center gap-3 border-b border-gray-100 px-3 py-3'>
                  {recruiter.profileImage ? (
                    <img src={recruiter.profileImage} alt={name} className='h-10 w-10 rounded-full object-cover' />
                  ) : (
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#E36A3A] to-[#F6A57A] text-sm font-semibold text-white'>
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold text-gray-900'>{name}</p>
                    <p className='truncate text-[11px] text-gray-500'>{recruiter.email || '—'}</p>
                  </div>
                </div>
                <div className='px-3 pt-3'>
                  <p className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500'>Verification status</p>
                  <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${
                    status === 'Approved' ? 'bg-green-100 text-green-700' : status === 'Pending review' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>{status}</span>
                </div>
                <div className='px-3 pt-3'>
                  {documentUrl ? (
                    <a href={documentUrl} target='_blank' rel='noreferrer' className='block overflow-hidden rounded-xl border border-gray-200 bg-gray-50'>
                      {isImage ? (
                        <img src={documentUrl} alt={`${activeTab === 'FACE' ? 'Face verification' : 'ID proof'} submission`} className='h-40 w-full object-cover' />
                      ) : (
                        <div className='flex h-40 items-center justify-center text-sm font-medium text-[#E36A3A]'>Open submitted ID proof</div>
                      )}
                    </a>
                  ) : (
                    <div className='flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 text-center text-xs text-gray-500'>
                      No {activeTab === 'FACE' ? 'face verification image' : 'ID proof'} submitted.
                    </div>
                  )}
                </div>
                <div className='mt-auto flex flex-col gap-2 px-3 py-3'>
                  <button onClick={() => void handleReview(recruiter.id, 'APPROVED')} className='rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700'>Approve</button>
                  <button onClick={() => void handleReview(recruiter.id, 'REJECTED')} className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100'>Reject</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SuperAdminRecruiterVerificationPage
