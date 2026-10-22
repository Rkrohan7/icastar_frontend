import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import superAdminService, { SuperAdminArtist } from '@/services/superAdminService'

type VerificationType = 'FACE' | 'ID_PROOF'

const statusLabel = (artist: SuperAdminArtist, type: VerificationType): string => {
  const raw = String(type === 'FACE' ? artist.faceVerificationStatus : artist.idProofVerificationStatus ?? '').toUpperCase()
  const isApproved = type === 'FACE'
    ? artist.isFaceVerified || raw === 'APPROVED'
    : artist.idProofVerified || raw === 'APPROVED'
  const documentUrl = type === 'FACE' ? artist.faceVerificationUrl : artist.idProofUrl ?? artist.idProof
  if (isApproved) return 'Approved'
  if (raw === 'REJECTED') return 'Rejected'
  if (raw === 'PENDING' || Boolean(documentUrl)) return 'Pending review'
  return 'Not submitted'
}

const SuperAdminArtistVerificationPage: React.FC = () => {
  const navigate = useNavigate()
  const [artists, setArtists] = useState<SuperAdminArtist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<VerificationType>('FACE')

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const list = await superAdminService.getArtistVerificationQueue()
      setArtists(list)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load verification queue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleReview = async (artistId: number, decision: 'APPROVED' | 'REJECTED', type: VerificationType) => {
    const verificationName = type === 'FACE' ? 'Face' : 'ID proof'
    const reason = decision === 'APPROVED'
      ? `${verificationName} verification approved by admin.`
      : `${verificationName} verification rejected by admin.`

    try {
      await superAdminService.reviewArtistVerification(artistId, decision, reason, type)
      setArtists((prev) => prev.map((artist) => {
        if (artist.id !== artistId) return artist
        return type === 'FACE'
          ? { ...artist, isFaceVerified: decision === 'APPROVED', faceVerificationStatus: decision }
          : { ...artist, idProofVerified: decision === 'APPROVED', idProofVerificationStatus: decision }
      }))

      if (decision === 'APPROVED') {
        toast.success(`Artist ${verificationName.toLowerCase()} verification approved.`)
      } else {
        toast.error(`Artist ${verificationName.toLowerCase()} verification rejected.`)
      }
    } catch (err: any) {
      console.error('Failed to review artist verification:', err)
      const message = err?.response?.data?.message || err?.message || 'Review action failed.'
      setError(message)
      toast.error(message)
    }
  }

  const pendingArtists = artists.filter((artist) => {
    const status = statusLabel(artist, activeTab)
    return status === 'Pending review' || status === 'Rejected'
  })

  return (
    <div className='p-4 sm:p-6 space-y-5'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <p className='text-xs sm:text-sm font-medium text-[#E36A3A] uppercase tracking-[0.12em]'>Admin</p>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Artist verification</h1>
        </div>
        <button
          onClick={() => navigate('/admin/artists')}
          className='inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50'>
          Back to artists
        </button>
      </div>

      <div className='flex gap-2 border-b border-gray-200' role='tablist' aria-label='Artist verification type'>
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
            className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === type ? 'border-[#E36A3A] text-[#E36A3A]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className='rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm'>Loading verification queue...</div>
      ) : error ? (
        <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm'>{error}</div>
      ) : pendingArtists.length === 0 ? (
        <div className='rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm'>No pending {activeTab === 'FACE' ? 'face' : 'ID proof'} verification requests.</div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-6 gap-4'>
          {pendingArtists.map((artist) => {
            const documentUrl = activeTab === 'FACE'
              ? artist.faceVerificationUrl || artist.profileImage
              : artist.idProofUrl || artist.idProof
            const isImage = activeTab === 'FACE' || Boolean(documentUrl && /\.(?:jpe?g|png|gif|webp|bmp)(?:$|[?#])/i.test(documentUrl))
            const status = statusLabel(artist, activeTab)

            return (
              <div key={artist.id} className='flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md'>
                <div className='flex items-center gap-3 border-b border-gray-100 px-3 py-3'>
                  {artist.profileImage ? (
                    <img src={artist.profileImage} alt={artist.stageName || artist.firstName} className='h-10 w-10 rounded-full object-cover ring-2 ring-gray-100' />
                  ) : (
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#E36A3A] to-[#F6A57A] text-sm font-semibold text-white'>
                      {(artist.firstName || artist.stageName || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold text-gray-900'>
                      {artist.stageName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Artist'}
                    </p>
                    <p className='truncate text-[11px] text-gray-500'>{artist.email || '—'}</p>
                  </div>
                </div>

                <div className='px-3 pt-3'>
                  <p className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500'>Verification status</p>
                  <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${
                    status === 'Approved' ? 'bg-green-100 text-green-700' : status === 'Pending review' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {status}
                  </span>
                </div>

                <div className='px-3 pt-3'>
                  {documentUrl ? (
                    <a href={documentUrl} target='_blank' rel='noreferrer' className='block overflow-hidden rounded-xl border border-gray-200 bg-gray-50'>
                      {isImage ? (
                        <img src={documentUrl} alt={activeTab === 'FACE' ? 'Face verification upload' : 'ID proof upload'} className='h-40 w-full object-cover transition duration-200 hover:scale-[1.02]' />
                      ) : (
                        <div className='flex h-40 flex-col items-center justify-center gap-2 px-3 text-center text-sm font-medium text-[#E36A3A]'>
                          <span className='text-3xl' aria-hidden='true'>▤</span>
                          Open submitted ID proof
                        </div>
                      )}
                    </a>
                  ) : (
                    <div className='flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 text-center text-xs text-gray-500'>
                      No {activeTab === 'FACE' ? 'face verification image' : 'ID proof'} submitted.
                    </div>
                  )}
                </div>

                <div className='mt-auto flex flex-col gap-2 px-3 py-3'>
                  <button
                    onClick={() => handleReview(artist.id, 'APPROVED', activeTab)}
                    className='rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700'>
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(artist.id, 'REJECTED', activeTab)}
                    className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100'>
                    Reject
                  </button>
                  <button
                    onClick={() => navigate(`/admin/artists/${artist.id}/portfolio`)}
                    className='rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50'>
                    Portfolio
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SuperAdminArtistVerificationPage
