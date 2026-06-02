import React, { useState, useMemo, useEffect } from 'react'
import { Card } from '../../components/Card'
import { RecentHireDto, getHires } from '../../services/recruiterHiresService'
import { Pagination } from '../../components/Pagination'
import { SearchIcon } from '../../components/icons/IconComponents'
import { useNavigate } from 'react-router-dom'
import usePageParam from '../../hooks/usePageParam'

// Format date to readable format: "22 Dec 2025, 12:36 PM"
const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try {
    const date = new Date(iso)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ', ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return '—'
  }
}

export const PastHiresPage = () => {
  const [currentPage, setCurrentPage] = usePageParam('page', 1)
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [jobFilter, setJobFilter] = useState('All')
  const ITEMS_PER_PAGE = 20
  const [hires, setHires] = useState<RecentHireDto[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const jobTitles = useMemo(() => {
    const titles = hires.map(hire => hire.jobTitle)
    return ['All', ...Array.from(new Set(titles))]
  }, [hires])

  const filteredHires = useMemo(() => {
    return hires.filter(hire => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        searchLower === '' ||
        (hire.artistName || '').toLowerCase().includes(searchLower) ||
        hire.jobTitle.toLowerCase().includes(searchLower) ||
        (hire.artistCategory || '').toLowerCase().includes(searchLower)

      const matchesJob = jobFilter === 'All' || hire.jobTitle === jobFilter

      return matchesSearch && matchesJob
    })
  }, [hires, searchTerm, jobFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, jobFilter])

  useEffect(() => {
    const fetchHires = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await getHires({ page: currentPage - 1, size: ITEMS_PER_PAGE })
        console.log('Hires API Response:', res)
        console.log('Hires items:', res.items)
        setHires(res.items)
        setTotalElements(res.totalElements)
        setTotalPages(res.totalPages)
      } catch (e: any) {
        console.error('Error fetching hires:', e)
        setError(e?.message || 'Failed to load hires')
      } finally {
        setLoading(false)
      }
    }
    fetchHires()
  }, [currentPage])

  const handleClearFilters = () => {
    setSearchTerm('')
    setJobFilter('All')
  }

  // Server-side pagination; filter applies within current page
  const currentHires = filteredHires

  const handleViewDetails = (hire: RecentHireDto) => {
    navigate('/past-hires', { state: { hire } })
  }

  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-3xl font-bold text-gray-900'>Past Hires</h2>
        <p className='text-gray-600 mt-2'>All candidates you have successfully hired</p>
      </div>

      <Card className='mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='md:col-span-2'>
            <label
              htmlFor='search-hires'
              className='block text-sm font-medium text-gray-700'>
              Search by Name, Title, or Skill
            </label>
            <div className='relative mt-1'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                <SearchIcon className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='text'
                id='search-hires'
                className='block w-full rounded-lg border-gray-300 bg-white pl-10 shadow-sm transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm px-3 py-2.5'
                placeholder='e.g., Elaine Benes, Copywriter, SEO'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor='job-filter'
              className='block text-sm font-medium text-gray-700'>
              Filter by Job
            </label>
            <select
              id='job-filter'
              className='mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm px-3 py-2.5 pr-10'
              value={jobFilter}
              onChange={e => setJobFilter(e.target.value)}>
              {jobTitles.map(title => (
                <option key={title} value={title}>
                  {title === 'All' ? 'All Jobs' : title}
                </option>
              ))}
            </select>
          </div>
          <div className='flex items-end'>
            <button
              onClick={handleClearFilters}
              className='w-full justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors'>
              Clear
            </button>
          </div>
        </div>
      </Card>

      <Card padding='sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Artist
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Job Title
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Hired On
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Salary
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Rating
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Feedback
                </th>
                <th scope='col' className='relative px-6 py-3'>
                  <span className='sr-only'>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td colSpan={8} className='text-center py-12 px-6'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mb-3'></div>
                      <p className='text-sm text-gray-500'>Loading your past hires...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className='text-center py-12 px-6'>
                    <div className='flex flex-col items-center justify-center'>
                      <svg className='h-12 w-12 text-red-400 mb-3' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                      </svg>
                      <p className='text-sm font-medium text-red-600'>{error}</p>
                    </div>
                  </td>
                </tr>
              ) : currentHires.length > 0 ? (
                currentHires.map(hire => (
                  <tr key={hire.id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10'>
                          <div className='h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm'>
                            {hire.artistName?.charAt(0).toUpperCase() || '?'}
                          </div>
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-semibold text-gray-900'>
                            {hire.artistName || 'Unknown Artist'}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {hire.artistEmail || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>
                        {hire.jobTitle}
                      </div>
                      {hire.contractType && (
                        <div className='text-xs text-gray-500'>
                          {hire.contractType}
                        </div>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(hire.hiredAt)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
                        HIRED
                      </span>
                      {hire.isCompleted && (
                        <span className='ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700'>
                          Completed
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>
                        {hire.agreedSalary
                          ? `${hire.currency || '$'} ${hire.agreedSalary}`.trim()
                          : '—'}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {hire.performanceRating ? (
                        <div className='flex items-center gap-1'>
                          <span className='text-amber-500 text-lg'>★</span>
                          <span className='text-sm font-semibold text-gray-900'>
                            {hire.performanceRating}
                          </span>
                        </div>
                      ) : (
                        <span className='text-sm text-gray-400'>—</span>
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='max-w-xs'>
                        {hire.feedback ? (
                          <p className='text-sm text-gray-600 line-clamp-2' title={hire.feedback}>
                            {hire.feedback}
                          </p>
                        ) : (
                          <span className='text-sm text-gray-400'>—</span>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <button
                        onClick={() => handleViewDetails(hire)}
                        className='inline-flex items-center px-3 py-1.5 border border-amber-300 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors'>
                        View
                        <svg className='ml-1.5 h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className='text-center py-16 px-6'>
                    <SearchIcon className='mx-auto h-12 w-12 text-gray-400' />
                    <h3 className='mt-2 text-lg font-medium text-gray-900'>
                      No Past Hires Found
                    </h3>
                    <p className='mt-1 text-sm text-gray-500'>
                      {searchTerm || jobFilter !== 'All'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'You haven\'t hired any candidates yet.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalElements > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalElements}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={page => setCurrentPage(page)}
          />
        )}
      </Card>
    </div>
  )
}
