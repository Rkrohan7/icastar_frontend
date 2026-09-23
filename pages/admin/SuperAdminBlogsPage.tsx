import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import blogService, { BlogInput, BlogPost, BlogStatus, slugify } from '../../services/blogService'
import {
  FileTextIcon,
  ImageIcon,
  SearchIcon,
  XIcon,
} from '../../components/icons/IconComponents'

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'

const statusStyles: Record<BlogStatus, string> = {
  PUBLISHED: 'bg-green-100 text-green-800',
  DRAFT: 'bg-yellow-100 text-yellow-800',
}

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const emptyDraft: BlogInput & { tagsText: string } = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  authorName: '',
  tags: [],
  status: 'DRAFT',
  tagsText: '',
}

interface EditorProps {
  blog: BlogPost | null
  onClose: () => void
  onSaved: (blog: BlogPost, isNew: boolean) => void
}

const BlogEditor: React.FC<EditorProps> = ({ blog, onClose, onSaved }) => {
  const [draft, setDraft] = useState(() =>
    blog
      ? { ...blog, tagsText: blog.tags.join(', ') }
      : { ...emptyDraft },
  )
  // Keep auto-generating the slug until the admin edits it by hand
  const [slugTouched, setSlugTouched] = useState(!!blog?.slug)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (patch: Partial<typeof draft>) => setDraft(prev => ({ ...prev, ...patch }))

  const handleTitle = (title: string) =>
    set({ title, ...(slugTouched ? {} : { slug: slugify(title) }) })

  const handleImage = async (file?: File | null) => {
    if (!file) return
    try {
      setUploadProgress(0)
      const url = await blogService.uploadCoverImage(file, setUploadProgress)
      set({ coverImageUrl: url })
      toast.success('Image uploaded')
    } catch (error: any) {
      toast.error(error?.message || 'Image upload failed')
    } finally {
      setUploadProgress(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const save = async (status: BlogStatus) => {
    const e: Record<string, string> = {}
    if (!draft.title.trim()) e.title = 'Title is required'
    if (!draft.content.trim()) e.content = 'Content is required'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    const payload: BlogInput = {
      title: draft.title.trim(),
      slug: draft.slug?.trim() || slugify(draft.title),
      excerpt: draft.excerpt?.trim() || undefined,
      content: draft.content,
      coverImageUrl: draft.coverImageUrl || undefined,
      authorName: draft.authorName?.trim() || undefined,
      tags: draft.tagsText.split(',').map(t => t.trim()).filter(Boolean),
      status,
    }
    try {
      setSaving(true)
      const saved = blog
        ? await blogService.updateBlog(blog.id, payload)
        : await blogService.createBlog(payload)
      toast.success(status === 'PUBLISHED' ? 'Blog published' : 'Draft saved')
      onSaved(saved, !blog)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save blog')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 overflow-y-auto'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-bold text-gray-900'>{blog ? 'Edit blog' : 'New blog'}</h3>
          <button onClick={onClose} disabled={saving} className='text-gray-400 hover:text-gray-600'>
            <XIcon className='h-5 w-5' />
          </button>
        </div>

        <div className='px-6 py-5 space-y-5'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Title *</label>
            <input
              className={`${inputCls} ${errors.title ? 'border-red-500' : ''}`}
              value={draft.title}
              maxLength={200}
              onChange={e => handleTitle(e.target.value)}
              placeholder='e.g. 5 audition tips for new actors'
            />
            {errors.title && <p className='text-xs text-red-600 mt-1'>{errors.title}</p>}
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>URL slug</label>
              <input
                className={inputCls}
                value={draft.slug}
                onChange={e => {
                  setSlugTouched(true)
                  set({ slug: slugify(e.target.value) })
                }}
                placeholder='audition-tips-for-new-actors'
              />
              <p className='text-xs text-gray-400 mt-1'>/blogs/{draft.slug || 'your-slug'}</p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Author</label>
              <input
                className={inputCls}
                value={draft.authorName}
                maxLength={100}
                onChange={e => set({ authorName: e.target.value })}
                placeholder='iCastar Team'
              />
            </div>
          </div>

          {/* Cover image — uploaded straight to S3 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Cover image</label>
            {draft.coverImageUrl ? (
              <div className='relative w-full max-w-sm'>
                <img src={draft.coverImageUrl} alt='' className='w-full h-44 object-cover rounded-lg border border-gray-200' />
                <button
                  type='button'
                  onClick={() => set({ coverImageUrl: '' })}
                  className='absolute top-2 right-2 bg-white/90 rounded-full p-1.5 text-gray-600 hover:text-red-600 shadow'>
                  <XIcon className='h-4 w-4' />
                </button>
              </div>
            ) : (
              <button
                type='button'
                onClick={() => fileRef.current?.click()}
                disabled={uploadProgress !== null}
                className='w-full max-w-sm h-44 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-[#E36A3A] hover:text-[#E36A3A] transition-colors'>
                <ImageIcon className='h-8 w-8' />
                <span className='text-sm font-medium'>
                  {uploadProgress !== null ? `Uploading... ${uploadProgress}%` : 'Upload image'}
                </span>
                <span className='text-xs text-gray-400'>JPEG, PNG or WebP · up to 5MB</span>
              </button>
            )}
            <input
              ref={fileRef}
              type='file'
              accept='image/jpeg,image/png,image/webp'
              className='hidden'
              onChange={e => handleImage(e.target.files?.[0])}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Short summary</label>
            <textarea
              className={inputCls}
              rows={2}
              maxLength={300}
              value={draft.excerpt}
              onChange={e => set({ excerpt: e.target.value })}
              placeholder='One or two lines shown on the blog cards'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Content *</label>
            <textarea
              className={`${inputCls} font-mono ${errors.content ? 'border-red-500' : ''}`}
              rows={12}
              value={draft.content}
              onChange={e => set({ content: e.target.value })}
              placeholder='Write the blog here. Leave a blank line between paragraphs.'
            />
            {errors.content && <p className='text-xs text-red-600 mt-1'>{errors.content}</p>}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Tags</label>
            <input
              className={inputCls}
              value={draft.tagsText}
              onChange={e => set({ tagsText: e.target.value })}
              placeholder='Auditions, Acting tips (comma separated)'
            />
          </div>
        </div>

        <div className='flex flex-wrap justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl'>
          <button onClick={onClose} disabled={saving} className='px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100'>
            Cancel
          </button>
          <button
            onClick={() => save('DRAFT')}
            disabled={saving}
            className='px-5 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50'>
            Save as draft
          </button>
          <button
            onClick={() => save('PUBLISHED')}
            disabled={saving}
            className='px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#E36A3A] hover:bg-[#C95428] disabled:opacity-50'>
            {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}

export const SuperAdminBlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BlogStatus | 'ALL'>('ALL')
  const [editing, setEditing] = useState<BlogPost | null | undefined>(undefined)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const { items } = await blogService.listBlogs({ page: 0, size: 100 })
      setBlogs(items)
    } catch (err) {
      console.error('Failed to load blogs:', err)
      setError('Unable to load blogs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const visible = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSaved = (saved: BlogPost, isNew: boolean) => {
    setBlogs(prev => (isNew ? [saved, ...prev] : prev.map(b => (b.id === saved.id ? saved : b))))
    setEditing(undefined)
  }

  const toggleStatus = async (blog: BlogPost) => {
    const next: BlogStatus = blog.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    try {
      const saved = await blogService.updateBlog(blog.id, { ...blog, status: next })
      setBlogs(prev => prev.map(b => (b.id === blog.id ? saved : b)))
      toast.success(next === 'PUBLISHED' ? 'Blog published' : 'Blog moved to draft')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const remove = async (blog: BlogPost) => {
    if (!window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) return
    try {
      await blogService.deleteBlog(blog.id)
      setBlogs(prev => prev.filter(b => b.id !== blog.id))
      toast.success('Blog deleted')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete blog')
    }
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Blog</h2>
          <p className='text-sm text-gray-500 mt-0.5'>
            Published posts appear on the landing page and on /blogs.
          </p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className='px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#E36A3A] hover:bg-[#C95428]'>
          New Blog
        </button>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-3'>
        <div className='relative flex-1 min-w-[220px]'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            className={`${inputCls} pl-9`}
            placeholder='Search by title'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className={`${inputCls} w-44`}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as BlogStatus | 'ALL')}>
          <option value='ALL'>All statuses</option>
          <option value='PUBLISHED'>Published</option>
          <option value='DRAFT'>Draft</option>
        </select>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {loading ? (
          <p className='py-16 text-center text-sm text-gray-500'>Loading blogs...</p>
        ) : error ? (
          <div className='py-16 text-center'>
            <p className='text-sm text-red-600'>{error}</p>
            <button onClick={load} className='mt-3 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium'>
              Retry
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className='py-16 text-center'>
            <FileTextIcon className='mx-auto h-10 w-10 text-gray-300' />
            <p className='mt-2 text-sm text-gray-500'>
              {blogs.length === 0 ? 'No blogs yet. Write your first one.' : 'No blogs match your filters.'}
            </p>
          </div>
        ) : (
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                {['Blog', 'Status', 'Author', 'Published', ''].map(h => (
                  <th key={h} className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-100'>
              {visible.map(blog => (
                <tr key={blog.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      {blog.coverImageUrl ? (
                        <img src={blog.coverImageUrl} alt='' className='h-12 w-16 rounded object-cover border border-gray-200' />
                      ) : (
                        <div className='h-12 w-16 rounded bg-gray-100 flex items-center justify-center'>
                          <ImageIcon className='h-5 w-5 text-gray-300' />
                        </div>
                      )}
                      <div className='min-w-0'>
                        <p className='text-sm font-semibold text-gray-900'>{blog.title}</p>
                        <p className='text-xs text-gray-400'>/blogs/{blog.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${statusStyles[blog.status]}`}>
                      {blog.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-600'>{blog.authorName || '—'}</td>
                  <td className='px-6 py-4 text-sm text-gray-600'>{formatDate(blog.publishedAt ?? blog.createdAt)}</td>
                  <td className='px-6 py-4 text-right text-sm space-x-3 whitespace-nowrap'>
                    <button onClick={() => setEditing(blog)} className='font-medium text-gray-600 hover:text-gray-900'>
                      Edit
                    </button>
                    <button onClick={() => toggleStatus(blog)} className='font-medium text-[#E36A3A] hover:underline'>
                      {blog.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => remove(blog)} className='font-medium text-red-600 hover:underline'>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing !== undefined && (
        <BlogEditor blog={editing} onClose={() => setEditing(undefined)} onSaved={handleSaved} />
      )}
    </div>
  )
}

export default SuperAdminBlogsPage
