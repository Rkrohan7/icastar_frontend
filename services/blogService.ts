import apiClient from './apiClient'
import uploadService, { UploadProgressCallback } from './uploadService'
import { cachedGet, invalidateCache } from './cache'

// Blog posts are written by admins and shown on the public landing page and
// the /blogs page. Admin calls go through the authenticated apiClient; public
// reads use a plain fetch so signed-out visitors can load them.
const PUBLIC_BASE_URL = 'https://api.icastar.com/api'
const BLOGS_TTL = 60_000

export type BlogStatus = 'DRAFT' | 'PUBLISHED'

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImageUrl?: string
  authorName?: string
  tags: string[]
  status: BlogStatus
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface BlogInput {
  title: string
  slug?: string
  excerpt?: string
  content: string
  coverImageUrl?: string
  authorName?: string
  tags?: string[]
  status: BlogStatus
}

export interface BlogListResult {
  items: BlogPost[]
  total: number
}

// 'My First Blog!' -> 'my-first-blog'
export const slugify = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)

const toBlog = (raw: any): BlogPost => ({
  id: raw.id,
  title: raw.title ?? '',
  slug: raw.slug ?? '',
  excerpt: raw.excerpt ?? undefined,
  content: raw.content ?? '',
  coverImageUrl: raw.coverImageUrl ?? raw.imageUrl ?? undefined,
  authorName: raw.authorName ?? raw.author ?? undefined,
  tags: Array.isArray(raw.tags)
    ? raw.tags.map(String)
    : typeof raw.tags === 'string' && raw.tags.trim()
      ? (() => {
          try {
            const parsed = JSON.parse(raw.tags)
            return Array.isArray(parsed) ? parsed.map(String) : String(raw.tags).split(',')
          } catch {
            return String(raw.tags).split(',')
          }
        })().map((t: string) => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
      : [],
  status: raw.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
  publishedAt: raw.publishedAt ?? undefined,
  createdAt: raw.createdAt ?? undefined,
  updatedAt: raw.updatedAt ?? undefined,
})

// Backend may answer with {data: [...]}, {data: {content: [...]}} or a bare array.
const toList = (body: any): BlogListResult => {
  const data = body?.data ?? body
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data?.items)
        ? data.items
        : []
  const total =
    typeof body?.totalElements === 'number' ? body.totalElements
      : typeof data?.totalElements === 'number' ? data.totalElements
      : typeof data?.total === 'number' ? data.total
      : arr.length
  return { items: arr.map(toBlog), total }
}

const toPayload = (input: BlogInput) => ({
  ...input,
  slug: input.slug?.trim() || slugify(input.title),
  tags: input.tags ?? [],
})

export const blogService = {
  // ---- Admin (authenticated) ----
  async listBlogs(params: { page?: number; size?: number; status?: BlogStatus | 'ALL' } = {}): Promise<BlogListResult> {
    const { page = 0, size = 50, status = 'ALL' } = params
    const res = await apiClient.get('/admin/blogs', {
      params: { page, size, ...(status !== 'ALL' ? { status } : {}) },
    })
    return toList(res.data)
  },

  async createBlog(input: BlogInput): Promise<BlogPost> {
    const res = await apiClient.post('/admin/blogs', toPayload(input))
    invalidateCache('public:blogs')
    return toBlog(res.data?.data ?? res.data)
  },

  async updateBlog(id: number, input: BlogInput): Promise<BlogPost> {
    const res = await apiClient.put(`/admin/blogs/${id}`, toPayload(input))
    invalidateCache('public:blogs')
    return toBlog(res.data?.data ?? res.data)
  },

  async deleteBlog(id: number): Promise<void> {
    await apiClient.delete(`/admin/blogs/${id}`)
    invalidateCache('public:blogs')
  },

  // Cover image goes straight to S3 through the existing presigned-URL flow
  async uploadCoverImage(file: File, onProgress?: UploadProgressCallback): Promise<string> {
    const check = uploadService.validateFile(file, 'image')
    if (!check.valid) throw new Error(check.error)
    return uploadService.uploadFile(file, 'BLOG_IMAGE', onProgress)
  },

  // ---- Public (no auth) ----
  async getPublicBlogs(limit?: number): Promise<BlogPost[]> {
    return cachedGet(`public:blogs:list:${limit ?? 'all'}`, async () => {
      const url = new URL(`${PUBLIC_BASE_URL}/public/blogs`)
      if (limit) url.searchParams.set('size', String(limit))
      const res = await fetch(url.toString())
      if (!res.ok) return []
      return toList(await res.json()).items
    }, { ttl: BLOGS_TTL })
  },

  async getPublicBlogBySlug(slug: string): Promise<BlogPost | null> {
    const res = await fetch(`${PUBLIC_BASE_URL}/public/blogs/${encodeURIComponent(slug)}`)
    if (!res.ok) return null
    const body = await res.json()
    const data = body?.data ?? body
    return data ? toBlog(data) : null
  },
}

export default blogService
