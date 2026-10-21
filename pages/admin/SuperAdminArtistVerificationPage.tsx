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
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-sm font-medium text-[#E36A3A]'>Admin</p>
          <h1 className='text-2xl font-bold text-gray-900'>Artist verification</h1>
        </div>
        <button
          onClick={() => navigate('/admin/artists')}
          className='px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'>
          Back to artists
        </button>
      </div>

      {loading ? (
        <div className='rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500'>Loading verification queue...</div>
      ) : error ? (
        <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-red-700'>{error}</div>
      ) : pendingArtists.length === 0 ? (
        <div className='rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500'>No pending artist verification requests.</div>
      ) : (
        <div className='grid gap-4'>
          {pendingArtists.map((artist) => {
            const imageUrl = artist.faceVerificationUrl || artist.profileImage
            const status = statusLabel(artist)

            return (
              <div key={artist.id} className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm'>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-center'>
                  <div className='flex items-center gap-4 min-w-0'>
                    {artist.profileImage ? (
                      <img src={artist.profileImage} alt={artist.stageName || artist.firstName} className='h-14 w-14 rounded-full object-cover' />
                    ) : (
                      <div className='h-14 w-14 rounded-full bg-gradient-to-br from-[#E36A3A] to-[#F6A57A] flex items-center justify-center text-white font-semibold'>
                        {(artist.firstName || artist.stageName || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className='min-w-0'>
                      <p className='font-semibold text-gray-900 truncate'>
                        {artist.stageName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Artist'}
                      </p>
                      <p className='text-sm text-gray-500'>{artist.email || '—'}</p>
                    </div>
                  </div>

                  <div className='flex-1 grid gap-2 md:grid-cols-[minmax(160px,220px)_auto] md:items-center'>
                    <div className='rounded-lg border border-gray-200 bg-gray-50 p-2'>
                      <p className='text-xs uppercase tracking-wide text-gray-500 mb-2'>Verification status</p>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        status === 'Approved' ? 'bg-green-100 text-green-700' : status === 'Pending review' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {status}
                      </span>
                    </div>

                    {imageUrl ? (
                      <a href={imageUrl} target='_blank' rel='noreferrer' className='block overflow-hidden rounded-lg border border-gray-200 bg-gray-50'>
                        <img src={imageUrl} alt='Face verification upload' className='h-28 w-full object-cover' />
                      </a>
                    ) : (
                      <div className='rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-6 text-sm text-gray-500'>No face verification image submitted.</div>
                    )}
                  </div>

                  <div className='flex flex-col gap-2 sm:flex-row lg:flex-col'>
                    <button
                      onClick={() => handleReview(artist.id, 'APPROVED')}
                      className='rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700'>
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(artist.id, 'REJECTED')}
                      className='rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100'>
                      Reject
                    </button>
                    <button
                      onClick={() => navigate(`/admin/artists/${artist.id}/portfolio`)}
                      className='rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'>
                      Portfolio
                    </button>
                  </div>
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
