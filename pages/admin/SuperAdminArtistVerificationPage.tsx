import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import superAdminService, { SuperAdminArtist } from '@/services/superAdminService'

const statusLabel = (artist: SuperAdminArtist): string => {
  const raw = String(artist.faceVerificationStatus ?? '').toUpperCase()
  if (artist.isFaceVerified || raw === 'APPROVED') return 'Approved'
  if (raw === 'PENDING' || Boolean(artist.faceVerificationUrl)) return 'Pending review'
  if (raw === 'REJECTED') return 'Rejected'
  return 'Not submitted'
}

const SuperAdminArtistVerificationPage: React.FC = () => {
  const navigate = useNavigate()
  const [artists, setArtists] = useState<SuperAdminArtist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const handleReview = async (artistId: number, decision: 'APPROVED' | 'REJECTED') => {
    try {
      await superAdminService.reviewArtistVerification(artistId, decision, decision === 'APPROVED' ? 'Face verification approved by admin.' : 'Face verification rejected by admin.')
      setArtists((prev) => prev.map((artist) => {
        if (artist.id !== artistId) return artist
        return {
          ...artist,
          isFaceVerified: decision === 'APPROVED',
          faceVerificationStatus: decision,
        }
      }))
    } catch (err: any) {
      console.error('Failed to review artist verification:', err)
      setError(err?.response?.data?.message || err?.message || 'Review action failed.')
    }
  }

  const pendingArtists = artists.filter((artist) => {
    const raw = String(artist.faceVerificationStatus ?? '').toUpperCase()
    const isPending = raw === 'PENDING' || (Boolean(artist.faceVerificationUrl) && !artist.isFaceVerified)
    return isPending || raw === 'REJECTED'
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

      {loading ? (
        <div className='rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm'>Loading verification queue...</div>
      ) : error ? (
        <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm'>{error}</div>
      ) : pendingArtists.length === 0 ? (
        <div className='rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm'>No pending artist verification requests.</div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-6 gap-4'>
          {pendingArtists.map((artist) => {
            const imageUrl = artist.faceVerificationUrl || artist.profileImage
            const status = statusLabel(artist)

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
                  {imageUrl ? (
                    <a href={imageUrl} target='_blank' rel='noreferrer' className='block overflow-hidden rounded-xl border border-gray-200 bg-gray-50'>
                      <img src={imageUrl} alt='Face verification upload' className='h-40 w-full object-cover transition duration-200 hover:scale-[1.02]' />
                    </a>
                  ) : (
                    <div className='flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 text-center text-xs text-gray-500'>
                      No face verification image submitted.
                    </div>
                  )}
                </div>

                <div className='mt-auto flex flex-col gap-2 px-3 py-3'>
                  <button
                    onClick={() => handleReview(artist.id, 'APPROVED')}
                    className='rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700'>
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(artist.id, 'REJECTED')}
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
