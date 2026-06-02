import React, { useEffect, useState } from 'react'
import { Card } from '../../components/Card'
import { Artist, Page } from '../../types'
import { SearchIcon, CheckCircleIcon, MapPinIcon, BriefcaseIcon, FilterIcon } from '../../components/icons/IconComponents'
import { ArtistCategory } from '../../types'
import { Pagination } from '../../components/Pagination'
import { useNavigate } from 'react-router-dom'
import { browseArtists } from '../../services/recruiterArtistsService'
import usePageParam from '../../hooks/usePageParam'

// Remote data
const ITEMS_PER_PAGE = 6

const ArtistCard: React.FC<{ artist: Artist; onViewProfile: () => void }> = ({
  artist,
  onViewProfile,
}) => (
  <Card className='flex flex-col text-center items-center hover:-translate-y-1 transition-transform'>
    <img
      className='w-24 h-24 rounded-full mb-4 object-cover ring-2 ring-offset-2 ring-gray-100'
      src={artist.avatarUrl}
      alt={artist.name}
    />
    <div className="flex items-center gap-1">
      <h3 className='text-lg font-bold text-gray-900'>{artist.name}</h3>
      {artist.isVerified && <CheckCircleIcon className="h-4 w-4 text-blue-500" />}
    </div>
    <p className="text-sm font-medium text-primary mt-1">{artist.category || 'Artist'}</p>

    <div className="mt-4 w-full space-y-2 text-sm text-gray-600">
      <div className="flex items-center justify-center gap-2">
        <MapPinIcon className="h-4 w-4 text-gray-400" />
        <span>{artist.location || 'Location not set'}</span>
      </div>
      <div className="flex items-center justify-center gap-2">
        <BriefcaseIcon className="h-4 w-4 text-gray-400" />
        <span>{artist.experienceYears ? `${artist.experienceYears} Years Experience` : 'Experience not specified'}</span>
      </div>
    </div>
    <button
      onClick={onViewProfile}
      className='mt-6 w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors'>
      View Profile
    </button>
  </Card>
)

export const BrowseArtistsPage = () => {
  const [currentPage, setCurrentPage] = usePageParam('page', 1)
  const [artists, setArtists] = useState<Artist[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters State
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    experienceLevel: '',
    skills: '',
    isVerified: false,
    completionRange: 0 // 0 means ignore, or filter > 0
  })
  const [showFilters, setShowFilters] = useState(false)

  const navigate = useNavigate()

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page on filter change
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      experienceLevel: '',
      skills: '',
      isVerified: false,
      completionRange: 0
    })
    setCurrentPage(1)
  }

  const handleViewProfile = (artist: Artist) => {
    navigate('/artist-profile', { state: { artist } })
  }

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await browseArtists({
          page: currentPage,
          size: ITEMS_PER_PAGE,
          skills: filters.skills || undefined,
          artistCategory: filters.category || undefined,
          location: filters.location || undefined,
          experienceLevel: filters.experienceLevel || undefined,
          isVerified: filters.isVerified || undefined,
        })
        setArtists(res.items)
        setTotalItems(res.totalElements)
      } catch (e) {
        console.error('Failed to fetch artists', e)
        setError('Failed to load artists')
        setArtists([])
        setTotalItems(0)
      } finally {
        setLoading(false)
      }
    }
    fetchArtists()
  }, [currentPage, filters])

  return (
    <div>
      <div className='flex flex-col gap-4 mb-6'>
        <div className='flex flex-col md:flex-row justify-between md:items-center gap-4'>
          <h2 className='text-3xl font-bold text-gray-900'>Browse Artists</h2>
          <div className='flex gap-2 items-center'>
            <div className='relative w-full md:max-w-xs'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <SearchIcon className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='text'
                className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary'
                placeholder='Search by skill...'
                value={filters.skills}
                onChange={e => handleFilterChange('skills', e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${showFilters ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            >
              <FilterIcon className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {Object.entries(ArtistCategory).map(([key, label]) => (
                  <option key={key} value={label}>{label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Experience Level</label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                value={filters.experienceLevel}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
              >
                <option value="">Any Experience</option>
                <option value="Entry Level">Entry Level (0-2 years)</option>
                <option value="Mid Level">Mid Level (2-5 years)</option>
                <option value="Senior Level">Senior Level (5+ years)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                placeholder="City, State"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            <div className="flex flex-col justify-end space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verifiedOnly"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={filters.isVerified}
                  onChange={(e) => handleFilterChange('isVerified', e.target.checked)}
                />
                <label htmlFor="verifiedOnly" className="text-sm text-gray-700">Verified Artists Only</label>
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800 font-medium text-left"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className='text-red-600 text-sm mb-4'>{error}</div>
      )}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {artists.map(artist => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            onViewProfile={() => handleViewProfile(artist)}
          />
        ))}
        {loading && (
          <div className='col-span-full text-center text-gray-500'>Loading...</div>
        )}
        {!loading && artists.length === 0 && (
          <div className='col-span-full text-center text-gray-500'>No artists found</div>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={page => setCurrentPage(page)}
        className='mt-8'
      />
    </div>
  )
}
