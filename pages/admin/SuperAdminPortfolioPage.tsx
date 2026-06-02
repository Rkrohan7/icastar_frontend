import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MicVocal,
  CheckCircleIcon,
  ArrowDownIcon,
  ImageIcon,
} from '../../components/icons/IconComponents'
import superAdminService, { SuperAdminPortfolio } from '../../services/superAdminService'

export const SuperAdminPortfolioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<SuperAdminPortfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await superAdminService.getArtistPortfolio(Number(id))
        setData(result)
      } catch (e: any) {
        const s = e?.response?.status
        const m = e?.response?.data?.message
        if (s === 401) setError('Unauthorized — log in as admin.')
        else if (s === 403) setError('Access denied — admin role required.')
        else if (s === 404) setError('Artist not found.')
        else setError(m || e?.message || 'Unable to load portfolio.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='text-gray-500'>Loading portfolio...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className='p-6'>
        <button
          onClick={() => navigate('/admin/artists')}
          className='text-sm text-[#E36A3A] hover:underline mb-4'>
          ← Back to Artists
        </button>
        <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl'>
          {error || 'No data'}
        </div>
      </div>
    )
  }

  const fullName = data.stageName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || '—'

  return (
    <div className='p-6 space-y-6'>
      <button
        onClick={() => navigate('/admin/artists')}
        className='text-sm text-[#E36A3A] hover:underline'>
        ← Back to Artists
      </button>

      {/* Header card */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center gap-6'>
        {data.profileImage ? (
          <img
            src={data.profileImage}
            alt={fullName}
            className='h-24 w-24 rounded-full object-cover flex-shrink-0'
          />
        ) : (
          <div className='h-24 w-24 rounded-full bg-gradient-to-br from-[#E36A3A] to-[#F6A57A] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0'>
            {(data.firstName || '?').charAt(0).toUpperCase()}
          </div>
        )}
        <div className='flex-1'>
          <h1 className='text-2xl font-bold text-gray-900'>{fullName}</h1>
          {data.stageName && (
            <p className='text-sm text-gray-500'>{data.firstName} {data.lastName}</p>
          )}
          <div className='flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-700'>
            {data.artistTypeName && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-[#E36A3A] font-medium'>
                <MicVocal className='h-3 w-3' /> {data.artistTypeName}
              </span>
            )}
            {data.experienceLevel && (
              <span className='text-xs'>{data.experienceLevel} · {data.yearsOfExperience ?? 0}y</span>
            )}
            {data.email && <span className='text-xs'>{data.email}</span>}
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4 text-center md:text-right'>
          <div>
            <p className='text-2xl font-bold text-[#E36A3A]'>{data.totalApplications ?? 0}</p>
            <p className='text-xs text-gray-500'>Applications</p>
          </div>
          <div>
            <p className='text-2xl font-bold text-green-600'>{data.successfulHires ?? 0}</p>
            <p className='text-xs text-gray-500'>Hires</p>
          </div>
        </div>
      </div>

      {/* Bio */}
      {data.bio && (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h2 className='text-base font-bold text-gray-900 mb-2'>About</h2>
          <p className='text-sm text-gray-700 whitespace-pre-line'>{data.bio}</p>
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {/* Skills */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h2 className='text-base font-bold text-gray-900 mb-3'>Skills</h2>
          {data.skills && data.skills.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {data.skills.map((s) => (
                <span key={s} className='px-3 py-1 bg-orange-50 text-[#E36A3A] text-sm rounded-full font-medium'>
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className='text-sm text-gray-400'>No skills listed</p>
          )}
        </div>

        {/* Languages */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h2 className='text-base font-bold text-gray-900 mb-3'>Languages</h2>
          {data.languagesSpoken && data.languagesSpoken.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {data.languagesSpoken.map((l) => (
                <span key={l} className='px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium'>
                  {l}
                </span>
              ))}
            </div>
          ) : (
            <p className='text-sm text-gray-400'>No languages listed</p>
          )}
        </div>
      </div>

      {/* Portfolio media */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
        <h2 className='text-base font-bold text-gray-900 mb-3 flex items-center gap-2'>
          <ImageIcon className='h-5 w-5 text-[#E36A3A]' /> Portfolio Media
        </h2>
        {data.portfolioUrls && data.portfolioUrls.length > 0 ? (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
            {data.portfolioUrls.map((url, i) => (
              <a
                key={i}
                href={url}
                target='_blank'
                rel='noreferrer'
                className='aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity'>
                <img
                  src={url}
                  alt={`Portfolio ${i + 1}`}
                  className='w-full h-full object-cover'
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </a>
            ))}
          </div>
        ) : (
          <p className='text-sm text-gray-400'>No media uploaded</p>
        )}
      </div>

      {/* Projects */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
        <h2 className='text-base font-bold text-gray-900 mb-3 flex items-center gap-2'>
          <CheckCircleIcon className='h-5 w-5 text-[#E36A3A]' /> Projects Worked
        </h2>
        {data.projectsWorked && data.projectsWorked.length > 0 ? (
          <div className='divide-y divide-gray-100'>
            {data.projectsWorked.map((p, i) => (
              <div key={i} className='py-3 flex items-center justify-between'>
                <div>
                  <p className='font-medium text-gray-900'>{p.name || '—'}</p>
                  {p.description && <p className='text-xs text-gray-500'>{p.description}</p>}
                  {(p.role || p.year) && (
                    <p className='text-xs text-gray-400 mt-0.5'>
                      {p.role || ''}{p.role && p.year ? ' · ' : ''}{p.year || ''}
                    </p>
                  )}
                </div>
                {p.url && (
                  <a href={p.url} target='_blank' rel='noreferrer' className='text-[#E36A3A] hover:underline text-sm flex items-center gap-1'>
                    View <ArrowDownIcon className='h-3 w-3 rotate-[-90deg]' />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className='text-sm text-gray-400'>No projects listed</p>
        )}
      </div>
    </div>
  )
}

export default SuperAdminPortfolioPage
