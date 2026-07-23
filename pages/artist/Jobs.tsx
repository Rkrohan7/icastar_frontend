import React, { useEffect, useMemo, useState } from 'react'
import Icon from '@/components/Icon'
import { jobsService, JobType, ExperienceLevel } from '@/services/jobsService'
import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ApplyJobModal from '@/components/ApplyJobModal'
import { bookmarksService } from '@/services/bookmarksService'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import usePageParam from '@/hooks/usePageParam'


type JobCardProps = {
  id: number
  title: string
  company?: string
  location?: string
  isRemote?: boolean
  jobType?: string
  experienceLevel?: string
  budgetMin?: number
  budgetMax?: number
  currency?: string
  applicationDeadline?: string
  isUrgent?: boolean
  skills?: string[]
  postedDate?: string
  applicantsCount?: number
  onApply?: (job: { id?: number; title: string }) => void
  onBookmark?: (jobId?: number) => void
  bookmarking?: boolean
  isBookmarked?: boolean
}

const JobCard: React.FC<JobCardProps> = ({
  id,
  title,
  company,
  location,
  isRemote,
  jobType,
  experienceLevel,
  budgetMin,
  budgetMax,
  currency,
  applicationDeadline,
  isUrgent,
  skills,
  postedDate,
  applicantsCount,
  onApply,
  onBookmark,
  bookmarking,
  isBookmarked
}) => {
  const formatSalary = () => {
    if ((budgetMin === undefined || budgetMin === null) && (budgetMax === undefined || budgetMax === null)) return 'Salary not disclosed'
    const curr = currency || '$'
    if (budgetMin != null && budgetMax != null) {
      return `${curr}${Number(budgetMin).toLocaleString()} - ${curr}${Number(budgetMax).toLocaleString()}`
    }
    const val = budgetMin ?? budgetMax
    return `${curr}${Number(val).toLocaleString()}`
  }

  const formatType = (type?: string) => {
    return type ? type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : 'Full Time'
  }

  const formatExp = (exp?: string) => {
    return exp ? exp.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : ''
  }

  const daysLeft = applicationDeadline ? Math.ceil((new Date(applicationDeadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null
  const isExpired = daysLeft !== null && daysLeft < 0

  return (
    <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group h-full relative overflow-hidden'>
      {isUrgent && (
        <div className="absolute top-0 right-0">
          <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm uppercase tracking-wider">
            Urgent
          </span>
        </div>
      )}

      <div>
        <div className='flex items-start justify-between mb-3'>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
              <Icon name="Briefcase" size={20} />
            </div>
            <div>
              <h3 className='text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors line-clamp-2'>
                {title}
              </h3>
              {company && <p className='text-sm text-gray-500 font-medium mt-0.5'>{company}</p>}
            </div>
          </div>
          {!isUrgent && (
            <button
              onClick={(e) => { e.stopPropagation(); onBookmark && onBookmark(id); }}
              className={`text-gray-300 hover:text-amber-500 transition-colors ${isBookmarked ? 'text-amber-500' : ''}`}
            >
              <Icon name="Bookmark" size={20} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        <div className='flex flex-wrap gap-2 mb-4'>
          <span className='inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium'>
            {formatType(jobType)}
          </span>
          {experienceLevel && (
            <span className='inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium'>
              {formatExp(experienceLevel)}
            </span>
          )}
          {isUrgent && (
            <button
              onClick={(e) => { e.stopPropagation(); onBookmark && onBookmark(id); }}
              className={`ml-auto text-gray-300 hover:text-amber-500 transition-colors ${isBookmarked ? 'text-amber-500' : ''}`}
            >
              <Icon name="Bookmark" size={18} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className='flex items-center text-gray-500 text-xs gap-2'>
            <Icon name={isRemote ? 'Globe' : 'MapPin'} size={14} />
            <span>{isRemote ? 'Remote' : (location || 'Location varies')}</span>
          </div>
          <div className='flex items-center text-gray-600 text-xs font-medium gap-2'>
            <Icon name='Banknote' size={14} />
            <span>{formatSalary()}</span>
          </div>
          {applicationDeadline && !isExpired && (
            <div className={`flex items-center text-xs gap-2 ${daysLeft && daysLeft <= 3 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              <Icon name='Clock' size={14} />
              <span>{daysLeft} days left to apply</span>
            </div>
          )}
        </div>

        {skills && skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 3).map((skill, i) => (
                <span key={i} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                  {skill}
                </span>
              ))}
              {skills.length > 3 && (
                <span className="text-[10px] text-gray-400 px-1 py-0.5">
                  +{skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className='flex flex-col gap-3 mt-2 border-t border-gray-100 pt-4'>
        <div className="flex justify-between items-center text-xs text-gray-400 px-1">
          <span>{postedDate ? new Date(postedDate).toLocaleDateString() : 'Recently'}</span>
          {applicantsCount !== undefined && <span>{applicantsCount} applicants</span>}
        </div>
        <button
          onClick={() => onApply && onApply({ id, title })}
          disabled={isExpired}
          className={`w-full font-semibold text-sm py-2.5 px-3 rounded-xl shadow-sm transition-all ${isExpired
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary-hover hover:shadow-md'
            }`}
        >
          {isExpired ? 'Applications Closed' : 'View Details & Apply'}
        </button>
      </div>
    </div>
  )
}

const FilterButton: React.FC<{ label: string; icon: any }> = ({
  label,
  icon,
}) => (
  <button className='flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm hover:bg-amber-50 transition-colors'>
    <Icon name={icon} size={18} className='text-gray-500' />
    <span className='font-medium'>{label}</span>
    <Icon name='ChevronDown' size={16} className='text-gray-400' />
  </button>
)

const Jobs: React.FC = () => {
  const [uiJobs, setUiJobs] = useState<JobCardProps[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [jobType, setJobType] = useState<JobType | ''>('')
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>('')
  // 1-based page index for UI; convert to 0-based for API
  const [currentPage, setCurrentPage] = usePageParam('page', 1)
  const [pageSize, setPageSize] = useState(12)
  const [total, setTotal] = useState(0)
  const [applyOpen, setApplyOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<{ id?: number; title?: string } | null>(null)
  const [bookmarkLoadingId, setBookmarkLoadingId] = useState<number | null>(null)
  const [confirmBookmarkOpen, setConfirmBookmarkOpen] = useState(false)
  const [confirmBookmarkJobId, setConfirmBookmarkJobId] = useState<number | null>(null)
  const [isRemovingBookmark, setIsRemovingBookmark] = useState(false)

  const jobTypes: JobType[] = useMemo(
    () => ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'PROJECT_BASED'],
    [],
  )
  const expLevels: ExperienceLevel[] = useMemo(
    () => ['ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'EXPERT_LEVEL'],
    [],
  )

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const { items, total: t } = await jobsService.listJobs({
          page: Math.max(0, currentPage - 1),
          size: pageSize,
          sortBy: 'createdAt',
          sortDir: 'desc',
          search: search || undefined,
          jobType: jobType || undefined,
          experienceLevel: experienceLevel || undefined,
        })

        const mapped = items.map(j => {
          const parseSkills = (val: any): string[] => {
            if (!val) return []
            if (typeof val === 'string') {
              try {
                const p = JSON.parse(val)
                if (Array.isArray(p)) return p.flatMap((s: any) => parseSkills(s))
                if (typeof p === 'string') return parseSkills(p)
              } catch {}
              return val.split(',').map((s: string) => s.trim()).filter(Boolean)
            }
            if (Array.isArray(val)) return val.flatMap((s: any) => parseSkills(s))
            return [String(val).trim()].filter(Boolean)
          }
          const skills = parseSkills(j.skillsRequired)

          return {
            id: j.id,
            title: j.title ?? 'Untitled Role',
            company: (j.companyName as string) || (j.company as string) || (j.recruiterCompanyName as string) || (j.organizationName as string) || (j.posterCompany as string) || undefined,
            location: (j.location as string),
            isRemote: j.isRemote,
            jobType: j.jobType,
            experienceLevel: j.experienceLevel,
            budgetMin: j.budgetMin,
            budgetMax: j.budgetMax,
            currency: j.currency,
            applicationDeadline: j.applicationDeadline,
            isUrgent: j.isUrgent,
            skills: skills.filter(Boolean),
            postedDate: j.createdAt || j.publishedAt,
            applicantsCount: j.applicationsCount || j.applicants || 0,
            isBookmarked: j.isBookmarked
          }
        })
        setUiJobs(mapped)
        setTotal(t ?? mapped.length)
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load jobs')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentPage, pageSize, search, jobType, experienceLevel])

  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize))

  const askBookmark = (jobId?: number) => {
    if (!jobId) return

    // Check if job is already bookmarked
    const job = uiJobs.find(j => j.id === jobId)
    const isBookmarked = job?.isBookmarked || false

    setConfirmBookmarkJobId(jobId)
    setIsRemovingBookmark(isBookmarked)
    setConfirmBookmarkOpen(true)
  }

  const handleBookmark = async (jobId?: number) => {
    if (!jobId) return

    // Check if job is already bookmarked
    const job = uiJobs.find(j => j.id === jobId)
    const isCurrentlyBookmarked = job?.isBookmarked || false

    try {
      setBookmarkLoadingId(jobId)

      if (isCurrentlyBookmarked) {
        // ❌ Remove bookmark
        await bookmarksService.unbookmarkByJobId(jobId)

        // Update local state to show empty bookmark icon
        setUiJobs(prevJobs =>
          prevJobs.map(job =>
            job.id === jobId
              ? { ...job, isBookmarked: false }
              : job
          )
        )
      } else {
        // ✅ Add bookmark
        await bookmarksService.bookmarkJob(jobId, {})

        // Update local state to show filled bookmark icon
        setUiJobs(prevJobs =>
          prevJobs.map(job =>
            job.id === jobId
              ? { ...job, isBookmarked: true }
              : job
          )
        )
      }
    } catch (err) {
      console.error('Failed to toggle bookmark', err)
    } finally {
      setBookmarkLoadingId(null)
    }
  }

  const pageNumbers = useMemo(() => {
    const nums: (number | '...')[] = []
    const range = 2
    let start = Math.max(2, currentPage - range)
    let end = Math.min(totalPages - 1, currentPage + range)
    nums.push(1)
    if (start > 2) nums.push('...')
    for (let i = start; i <= end; i++) nums.push(i)
    if (end < totalPages - 1) nums.push('...')
    if (totalPages > 1) nums.push(totalPages)
    return nums
  }, [currentPage, totalPages])

  return (
    <div className='space-y-6'>
      <h1 className='text-4xl font-bold'>Find Your Next Gig</h1>
      <p className='text-gray-600'>
        Explore thousands of opportunities tailored for artists like you.
      </p>

      {/* Loading handled with skeletons in the grid below */}
      {error && (
        <div className='bg-white border border-red-200 text-red-700 px-4 py-3 rounded-xl'>
          {error}
        </div>
      )}

      <div className='flex flex-wrap items-center gap-4'>
        <div className='flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm'>
          <Icon name='Search' size={18} className='text-gray-500' />
          <input
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            placeholder='Search jobs...'
            className='outline-none text-sm text-gray-700'
          />
        </div>
        <div className='flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm'>
          <Icon name='LayoutGrid' size={18} className='text-gray-500' />
          <select
            value={jobType}
            onChange={e => {
              setJobType((e.target.value || '') as JobType | '')
              setCurrentPage(1)
            }}
            className='text-sm text-gray-700 outline-none'>
            <option value=''>All Types</option>
            {jobTypes.map(jt => (
              <option key={jt} value={jt}>{jt}</option>
            ))}
          </select>
        </div>
        <div className='flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm'>
          <Icon name='Users' size={18} className='text-gray-500' />
          <select
            value={experienceLevel}
            onChange={e => {
              setExperienceLevel((e.target.value || '') as ExperienceLevel | '')
              setCurrentPage(1)
            }}
            className='text-sm text-gray-700 outline-none'>
            <option value=''>All Experience</option>
            {expLevels.map(el => (
              <option key={el} value={el}>{el}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setSearch('')
            setJobType('')
            setExperienceLevel('')
            setCurrentPage(1)
          }}
          className='flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm text-gray-500 hover:bg-amber-50 transition-colors'>
          <Icon name='X' size={18} />
          <span className='font-medium'>Clear</span>
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {loading ? (
          Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
            <div key={i} className='bg-white rounded-2xl shadow-lg p-6'>
              <div className='flex items-start justify-between'>
                <Skeleton className='h-12 w-12 rounded-xl' />
                <Skeleton className='h-6 w-20 rounded-full' />
              </div>
              <div className='mt-4 space-y-2'>
                <Skeleton className='h-5 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
              </div>
              <div className='mt-6 space-y-2'>
                <Skeleton className='h-4 w-1/3' />
                <Skeleton className='h-4 w-1/4' />
              </div>
              <Skeleton className='mt-4 h-10 w-full rounded-xl' />
            </div>
          ))
        ) : uiJobs.length > 0 ? (
          uiJobs.map((job, index) => (
            <JobCard
              key={index}
              {...job}
              onApply={(j) => {
                setSelectedJob(j)
                setApplyOpen(true)
              }}
              onBookmark={(jobId) => askBookmark(jobId)}
              bookmarking={bookmarkLoadingId === job.id}
            />
          ))
        ) : (
          <div className='col-span-full flex flex-col items-center justify-center py-12 text-gray-500'>
            <Icon name='Briefcase' size={48} className='mb-3 text-gray-400' />
            <div className='text-lg font-medium'>No job found</div>
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
      <div className='flex flex-col items-center gap-2 pt-6'>
        <p className='text-sm text-gray-500'>
          Page {currentPage} of {totalPages} · {total.toLocaleString()} jobs
        </p>
        <UIPagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href='#'
                aria-label='Previous page'
                aria-disabled={currentPage <= 1}
                onClick={e => {
                  e.preventDefault()
                  if (currentPage <= 1) return
                  setCurrentPage(p => Math.max(1, p - 1))
                }}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
              >
                <ChevronLeft className='h-4 w-4' />
              </PaginationPrevious>
            </PaginationItem>
            {pageNumbers.map((n, idx) => (
              n === '...'
                ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
                : (
                  <PaginationItem key={n as number}>
                    <PaginationLink
                      href='#'
                      isActive={currentPage === (n as number)}
                      onClick={e => {
                        e.preventDefault()
                        setCurrentPage(n as number)
                      }}
                    >
                      {n as number}
                    </PaginationLink>
                  </PaginationItem>
                )
            ))}
            <PaginationItem>
              <PaginationNext
                href='#'
                aria-label='Next page'
                aria-disabled={currentPage >= totalPages}
                onClick={e => {
                  e.preventDefault()
                  if (currentPage >= totalPages) return
                  setCurrentPage(p => Math.min(totalPages, p + 1))
                }}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
              >
                <ChevronRight className='h-4 w-4' />
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </UIPagination>
      </div>
      )}

      <AlertDialog open={confirmBookmarkOpen} onOpenChange={setConfirmBookmarkOpen}>
        <AlertDialogContent className='bg-white rounded-2xl border-0 shadow-2xl max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-2xl font-bold text-gray-900'>
              {isRemovingBookmark ? 'Remove this job?' : 'Save this job?'}
            </AlertDialogTitle>
            <AlertDialogDescription className='text-base text-gray-600 mt-2'>
              {isRemovingBookmark
                ? 'This will remove the job from your bookmarks.'
                : 'This will add the job to your bookmarks.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-3 mt-6'>
            <AlertDialogCancel
              disabled={bookmarkLoadingId !== null}
              className='bg-gray-100 hover:bg-gray-200 text-gray-800 border-0 rounded-xl px-6 py-2.5 font-semibold transition-colors'
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmBookmarkJobId) {
                  await handleBookmark(confirmBookmarkJobId)
                }
                setConfirmBookmarkOpen(false)
              }}
              className={`${
                isRemovingBookmark
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              } text-white rounded-xl px-6 py-2.5 font-semibold transition-colors border-0 shadow-md`}
              disabled={bookmarkLoadingId !== null}
            >
              {bookmarkLoadingId !== null
                ? isRemovingBookmark
                  ? 'Removing...'
                  : 'Saving...'
                : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ApplyJobModal
        open={applyOpen}
        onOpenChange={setApplyOpen}
        jobId={selectedJob?.id ?? null}
        jobTitle={selectedJob?.title}
        onSubmitted={() => {
          // Optionally refresh jobs or show a success state
        }}
      />
    </div>
  )
}

export default Jobs
