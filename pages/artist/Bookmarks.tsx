import React, { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import bookmarksService, { BookmarkedJobDto } from '@/services/bookmarksService'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { Switch } from '@/components/ui/switch'
import usePageParam from '@/hooks/usePageParam'
import { useTranslation } from '@/i18n'

const BookmarkCard: React.FC<{
  bookmark: BookmarkedJobDto
  onDelete: (id: number) => void
}> = ({ bookmark, onDelete }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const navigate = useNavigate()
  const { t, tEnum } = useTranslation()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(bookmark.id)
    setIsDeleteDialogOpen(false)
  }

  const handleCardClick = () => {
    navigate(`/jobs/${bookmark.jobId}`)
  }


  const formatDate = (dateString?: string) => {
    if (!dateString) return t('common.status.notAvailable')
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 cursor-pointer group'
      >
        <div>
          <div className='flex items-start justify-between mb-4'>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className='text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors'>{bookmark.jobTitle}</h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${bookmark.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
                  }`}>
                  {bookmark.status ? tEnum(bookmark.status) : t('common.status.unknown')}
                </span>
              </div>
              <div className='flex items-center text-gray-500 text-sm gap-1'>
                <Icon name='MapPin' size={14} className="flex-shrink-0" />
                <span className="line-clamp-1">{bookmark.jobLocation || t('artistBookmarks.card.locationFallback')}</span>
              </div>
            </div>
            <button
              onClick={handleDelete}
              className='text-gray-400 hover:text-red-600 transition-colors p-2 -mr-2 -mt-2'
              title={t('artistBookmarks.card.removeTitle')}
            >
              <Icon name='Trash2' size={18} />
            </button>
          </div>

          <div className='space-y-3 mb-4'>
            <div className='flex flex-wrap gap-2 text-xs'>
              <span className='px-2.5 py-1 bg-gray-50 text-gray-700 border border-gray-100 rounded-md font-medium'>
                {bookmark.experienceLevel ? tEnum(bookmark.experienceLevel) : t('artistBookmarks.card.experienceFallback')}
              </span>
              <span className='px-2.5 py-1 bg-gray-50 text-gray-700 border border-gray-100 rounded-md font-medium'>
                {bookmark.jobType ? tEnum(bookmark.jobType) : t('artistBookmarks.card.jobTypeFallback')}
              </span>
            </div>

            <div className='flex items-center justify-between text-xs text-gray-500 pt-1'>
              <div className="flex items-center gap-1.5" title={t('artistBookmarks.card.totalApplicants')}>
                <Icon name='Users' size={14} />
                <span className="font-medium">{bookmark.applicationsCount || 0}</span>
              </div>
              <div className="flex items-center gap-1.5" title={t('artistBookmarks.card.bookmarkedDate')}>
                <Icon name='Calendar' size={14} />
                <span>{formatDate(bookmark.bookmarkedAt)}</span>
              </div>
            </div>
          </div>

          {bookmark.notes && (
            <div className='bg-yellow-50/50 rounded-lg p-3 text-sm border border-yellow-100/50' onClick={(e) => e.stopPropagation()}>
              <p className='font-semibold text-[10px] text-yellow-700 mb-1 uppercase tracking-wide flex items-center gap-1'>
                <Icon name='StickyNote' size={10} />
                {t('artistBookmarks.card.myNotes')}
              </p>
              <div className={`text-gray-700 text-xs leading-relaxed ${!isExpanded && 'line-clamp-2'}`}>
                {bookmark.notes}
              </div>
              {bookmark.notes.length > 80 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(!isExpanded)
                  }}
                  className="text-yellow-700 text-[10px] font-bold mt-1 hover:underline"
                >
                  {isExpanded ? t('artistBookmarks.card.showLess') : t('artistBookmarks.card.readMore')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('artistBookmarks.removeDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('artistBookmarks.removeDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-red-600 hover:bg-red-700 text-white'
            >
              {t('common.actions.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const Bookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkedJobDto[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = usePageParam('page', 0)
  const [totalPages, setTotalPages] = useState(0)
  const [activeOnly, setActiveOnly] = useState(true)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const PAGE_SIZE = 10

  const fetchBookmarks = async () => {
    setLoading(true)
    try {
      const response = await bookmarksService.getBookmarks({ page, size: PAGE_SIZE, activeOnly })

      // Relaxed response handling to support multiple structures
      let content: BookmarkedJobDto[] = []
      let total = 0

      // Case 1: Standard PagedBookmarkResponse { content: [...], totalPages: ... }
      if (response && Array.isArray(response.content)) {
        content = response.content
        total = response.totalPages
      }
      // Case 2: Wrapped in data { data: { content: [...] } } or similar common patterns
      else if (response && (response as any).data && Array.isArray((response as any).data.content)) {
        content = (response as any).data.content
        total = (response as any).data.totalPages || 0
      }
      // Case 3: Direct array response or inside data property
      else if (Array.isArray(response)) {
        content = response as any
        total = 1
      }
      else if (response && Array.isArray((response as any).data)) {
        content = (response as any).data
        total = 1
      }

      setBookmarks(content)
      setTotalPages(total)

    } catch (error: any) {
      console.error('Failed to fetch bookmarks', error)
      if (error.response?.status === 401) {
        navigate('/login')
        toast.error(t('artistBookmarks.toast.sessionExpired'))
      } else {
        toast.error(t('artistBookmarks.toast.loadFailed'))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookmarks()
  }, [page, activeOnly])

  const handleDeleteBookmark = async (id: number) => {
    // Optimistic update: Remove immediately from UI
    const previousBookmarks = [...bookmarks]
    setBookmarks(prev => prev.filter(b => b.id !== id))

    try {
      await bookmarksService.removeBookmark(id)
      toast.success(t('artistBookmarks.toast.removed'))
      // No need to refetch if successful, as list is already updated. 
      // However, if we want to ensure total pages/counts are synced we could refetch silently, 
      // but for "remove" action, local update is usually sufficient and better UX.
    } catch (error) {
      console.error('Failed to remove bookmark', error)
      toast.error(t('artistBookmarks.toast.removeFailed'))
      // Revert on error
      setBookmarks(previousBookmarks)
    }
  }

  return (
    <div className='space-y-6 max-w-7xl mx-auto'>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>{t('artistBookmarks.title')}</h1>
          <p className='text-gray-500 mt-1'>
            {t('artistBookmarks.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <Switch
            checked={activeOnly}
            onCheckedChange={setActiveOnly}
            id="active-only"
          />
          <label htmlFor="active-only" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
            {t('artistBookmarks.activeOnly')}
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : bookmarks.length > 0 ? (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onDelete={handleDeleteBookmark}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('common.pagination.previous')}
              </button>
              <span className="text-sm text-gray-600">
                {t('common.pagination.pageOf', { page: page + 1, total: totalPages })}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('common.pagination.next')}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className='text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300'>
          <div className='bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto'>
            <Icon name='Bookmark' size={40} className='text-primary' />
          </div>
          <h2 className='mt-4 text-xl font-bold text-gray-900'>
            {t('artistBookmarks.empty.title')}
          </h2>
          <p className='mt-2 text-gray-500'>
            {activeOnly ? t('artistBookmarks.empty.activeOnlyHint') : t('artistBookmarks.empty.exploreHint')}
          </p>
        </div>
      )}
    </div>
  )
}

export default Bookmarks
