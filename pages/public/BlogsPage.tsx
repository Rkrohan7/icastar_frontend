import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import blogService, { BlogPost } from '../../services/blogService'

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

const readingTime = (content: string) => Math.max(1, Math.round(content.trim().split(/\s+/).length / 200))

const Header: React.FC = () => {
  const navigate = useNavigate()
  return (
    <header className='border-b border-gray-100 bg-white'>
      <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
        <button onClick={() => navigate('/')} className='text-xl font-extrabold text-gray-900'>
          iCastar
        </button>
        <Link to='/blogs' className='text-sm font-semibold text-orange-600 hover:underline'>
          Blog
        </Link>
      </div>
    </header>
  )
}

export const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    blogService
      .getPublicBlogs()
      .then(setBlogs)
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />
      <div className='container mx-auto px-4 py-12'>
        <div className='max-w-3xl mb-10'>
          <h1 className='text-4xl font-extrabold text-gray-900'>From the iCastar blog</h1>
          <p className='text-gray-500 mt-2'>
            Audition tips, casting news and stories from the industry.
          </p>
        </div>

        {loading ? (
          <p className='py-16 text-center text-gray-500'>Loading blogs...</p>
        ) : blogs.length === 0 ? (
          <p className='py-16 text-center text-gray-500'>No blogs published yet. Please check back soon.</p>
        ) : (
          <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {blogs.map(blog => (
              <Link
                key={blog.id}
                to={`/blogs/${blog.slug}`}
                className='bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow flex flex-col'>
                {blog.coverImageUrl ? (
                  <img src={blog.coverImageUrl} alt='' className='h-48 w-full object-cover' />
                ) : (
                  <div className='h-48 w-full bg-gradient-to-br from-orange-100 to-amber-50' />
                )}
                <div className='p-6 flex flex-col flex-1'>
                  {blog.tags.length > 0 && (
                    <div className='flex flex-wrap gap-2 mb-3'>
                      {blog.tags.slice(0, 2).map(tag => (
                        <span key={tag} className='px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-medium'>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className='text-lg font-bold text-gray-900 mb-2'>{blog.title}</h2>
                  {blog.excerpt && <p className='text-sm text-gray-500 line-clamp-3'>{blog.excerpt}</p>}
                  <div className='mt-auto pt-4 text-xs text-gray-400'>
                    {[blog.authorName, formatDate(blog.publishedAt ?? blog.createdAt)].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    blogService
      .getPublicBlogBySlug(slug)
      .then(setBlog)
      .catch(() => setBlog(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className='min-h-screen bg-white'>
        <Header />
        <p className='py-24 text-center text-gray-500'>Loading...</p>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className='min-h-screen bg-white'>
        <Header />
        <div className='py-24 text-center'>
          <p className='text-gray-600'>This blog is not available.</p>
          <Link to='/blogs' className='mt-4 inline-block text-orange-600 font-semibold hover:underline'>
            Back to all blogs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-white'>
      <Header />
      <article className='container mx-auto px-4 py-12 max-w-3xl'>
        <Link to='/blogs' className='text-sm font-medium text-orange-600 hover:underline'>
          ← All blogs
        </Link>
        <h1 className='text-4xl font-extrabold text-gray-900 mt-4 mb-3'>{blog.title}</h1>
        <p className='text-sm text-gray-500'>
          {[blog.authorName, formatDate(blog.publishedAt ?? blog.createdAt), `${readingTime(blog.content)} min read`]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {blog.coverImageUrl && (
          <img src={blog.coverImageUrl} alt='' className='w-full rounded-2xl object-cover mt-8 max-h-[420px]' />
        )}
        {/* Content is plain text from the admin editor; blank lines separate paragraphs */}
        <div className='mt-8 space-y-5 text-gray-700 leading-relaxed'>
          {blog.content.split(/\n{2,}/).map((para, i) => (
            <p key={i} className='whitespace-pre-line'>{para}</p>
          ))}
        </div>
        {blog.tags.length > 0 && (
          <div className='flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-100'>
            {blog.tags.map(tag => (
              <span key={tag} className='px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium'>
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  )
}

export default BlogsPage
