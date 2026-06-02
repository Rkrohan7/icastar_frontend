import React, { useEffect, useState } from 'react'
import { SearchIcon, BriefcaseIcon, MicVocal } from '../../components/icons/IconComponents'
import superAdminService, { SuperAdminSkill } from '../../services/superAdminService'
import usePageParam from '../../hooks/usePageParam'
import { Pagination } from './SuperAdminRecruitersPage'

const PAGE_SIZE = 30

export const SuperAdminSkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<SuperAdminSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = usePageParam('page', 0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await superAdminService.getSkills({
          page, size: PAGE_SIZE, search: search.trim() || undefined,
        })
        setSkills(result.data)
        setTotalPages(result.totalPages)
        setTotalItems(result.totalItems)
      } catch (e: any) {
        const s = e?.response?.status
        const m = e?.response?.data?.message
        if (s === 401) setError('Unauthorized — log in as admin.')
        else if (s === 403) setError('Access denied — admin role required.')
        else setError(m || e?.message || 'Unable to load skills.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, search])

  return (
    <div className='p-6 space-y-4'>
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setPage(0)
            setSearch(searchInput)
          }}
          className='relative'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            type='text'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder='Search skills...'
            className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
          />
        </form>
        <p className='text-xs text-gray-500 mt-3'>
          {totalItems.toLocaleString()} skills
        </p>
      </div>

      {loading ? (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center text-gray-500'>
          Loading...
        </div>
      ) : error ? (
        <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl'>{error}</div>
      ) : skills.length === 0 ? (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center text-gray-500'>
          No skills found
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
          {skills.map((s) => (
            <div key={s.name} className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow'>
              <h3 className='font-semibold text-gray-900 capitalize mb-2'>{s.name || '—'}</h3>
              <div className='flex items-center justify-between text-xs'>
                <span className='flex items-center gap-1 text-orange-600'>
                  <MicVocal className='h-3 w-3' /> {s.artistCount ?? 0} artists
                </span>
                <span className='flex items-center gap-1 text-blue-600'>
                  <BriefcaseIcon className='h-3 w-3' /> {s.jobCount ?? 0} jobs
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
    </div>
  )
}

export default SuperAdminSkillsPage
