import React, { useEffect, useState } from 'react'
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  XIcon,
  FileTextIcon,
} from '../../components/icons/IconComponents'
import superAdminService, {
  SuperAdminCategory,
  CategoryUpsertPayload,
} from '../../services/superAdminService'
import usePageParam from '../../hooks/usePageParam'
import { Pagination } from './SuperAdminRecruitersPage'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

const errMsg = (err: any, fallback: string, t: (key: string) => string): string => {
  const s = err?.response?.status
  const m = err?.response?.data?.message
  if (s === 401) return t('adminCategories.errors.unauthorized')
  if (s === 403) return t('adminCategories.errors.accessDenied')
  return m || err?.message || fallback
}

export const SuperAdminCategoriesPage: React.FC = () => {
  const { t, tEnum } = useTranslation()
  const [list, setList] = useState<SuperAdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = usePageParam('page', 0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ open: boolean; editing: SuperAdminCategory | null }>({
    open: false, editing: null,
  })

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await superAdminService.getCategories({
        page, size: PAGE_SIZE, search: search.trim() || undefined,
      })
      setList(result.data)
      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)
    } catch (e: any) {
      setError(errMsg(e, t('adminCategories.errors.loadFailed'), t))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search])

  const handleDelete = async (cat: SuperAdminCategory) => {
    if (!confirm(t('adminCategories.confirmDelete', { name: cat.displayName }))) return
    try {
      await superAdminService.deleteCategory(cat.id)
      load()
    } catch (e: any) {
      alert(errMsg(e, t('adminCategories.errors.deleteFailed'), t))
    }
  }

  return (
    <div className='p-6 space-y-4'>
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
        <div className='flex flex-col md:flex-row gap-3'>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setPage(0)
              setSearch(searchInput)
            }}
            className='flex-1 relative'>
            <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('adminCategories.searchPlaceholder')}
              className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
            />
          </form>
          <button
            onClick={() => setModal({ open: true, editing: null })}
            className='px-4 py-2 bg-[#E36A3A] text-white text-sm font-medium rounded-lg hover:bg-[#C95428] flex items-center gap-2'>
            <PlusIcon className='h-4 w-4' /> {t('adminCategories.addCategory')}
          </button>
        </div>
        <p className='text-xs text-gray-500 mt-3'>
          {t('adminCategories.count', { count: totalItems.toLocaleString() })}
        </p>
      </div>

      {loading ? (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center text-gray-500'>
          {t('common.status.loading')}
        </div>
      ) : error ? (
        <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl'>{error}</div>
      ) : list.length === 0 ? (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center text-gray-500'>
          {t('adminCategories.empty')}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {list.map((c) => (
            <div key={c.id} className='bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow'>
              <div className='flex items-start justify-between mb-3'>
                <div className='min-w-0'>
                  <h3 className='font-semibold text-gray-900 truncate'>{c.displayName || c.name}</h3>
                  <p className='text-xs text-gray-500'>{c.name}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    c.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {c.isActive ? tEnum('ACTIVE') : tEnum('INACTIVE')}
                </span>
              </div>
              {c.description && (
                <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{c.description}</p>
              )}
              <div className='flex items-center justify-between text-xs text-gray-500'>
                <span className='flex items-center gap-1'>
                  <FileTextIcon className='h-3 w-3' /> {t('adminCategories.artists', { count: c.artistCount ?? 0 })}
                </span>
                <span>{t('adminCategories.order', { order: c.sortOrder ?? 0 })}</span>
              </div>
              <div className='mt-4 flex gap-2'>
                <button
                  onClick={() => setModal({ open: true, editing: c })}
                  className='flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50'>
                  <EditIcon className='h-4 w-4' /> {t('common.actions.edit')}
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className='px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50'>
                  {t('common.actions.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}

      {modal.open && (
        <CategoryModal
          editing={modal.editing}
          onClose={() => setModal({ open: false, editing: null })}
          onSaved={() => {
            setModal({ open: false, editing: null })
            load()
          }}
        />
      )}
    </div>
  )
}

const CategoryModal: React.FC<{
  editing: SuperAdminCategory | null
  onClose: () => void
  onSaved: () => void
}> = ({ editing, onClose, onSaved }) => {
  const { t, tEnum } = useTranslation()
  const [name, setName] = useState(editing?.name || '')
  const [displayName, setDisplayName] = useState(editing?.displayName || '')
  const [description, setDescription] = useState(editing?.description || '')
  const [iconUrl, setIconUrl] = useState(editing?.iconUrl || '')
  const [isActive, setIsActive] = useState(editing?.isActive ?? true)
  const [sortOrder, setSortOrder] = useState(editing?.sortOrder ?? 0)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const save = async () => {
    try {
      setSaving(true)
      setErr(null)
      const payload: CategoryUpsertPayload = {
        name, displayName, description: description || undefined,
        iconUrl: iconUrl || undefined, isActive, sortOrder,
      }
      if (editing) {
        await superAdminService.updateCategory(editing.id, payload)
      } else {
        await superAdminService.createCategory(payload)
      }
      onSaved()
    } catch (e: any) {
      setErr(errMsg(e, t('adminCategories.errors.saveFailed'), t))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4' onClick={onClose}>
      <div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-bold text-gray-900'>
            {editing ? t('adminCategories.editCategory') : t('adminCategories.addCategory')}
          </h2>
          <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded'>
            <XIcon className='h-5 w-5' />
          </button>
        </div>
        <div className='space-y-3'>
          <Field label={t('adminCategories.fields.nameSlug')} value={name} onChange={setName} />
          <Field label={t('adminCategories.fields.displayName')} value={displayName} onChange={setDisplayName} />
          <div>
            <label className='text-xs font-medium text-gray-600'>{t('common.labels.description')}</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
            />
          </div>
          <Field label={t('adminCategories.fields.iconUrl')} value={iconUrl} onChange={setIconUrl} />
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-xs font-medium text-gray-600'>{t('adminCategories.fields.sortOrder')}</label>
              <input
                type='number' value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
              />
            </div>
            <div>
              <label className='text-xs font-medium text-gray-600'>{t('common.labels.status')}</label>
              <select
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
                className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
                <option value='active'>{tEnum('ACTIVE')}</option>
                <option value='inactive'>{tEnum('INACTIVE')}</option>
              </select>
            </div>
          </div>
          {err && <div className='text-sm text-red-600 bg-red-50 p-2 rounded'>{err}</div>}
        </div>
        <div className='mt-6 flex justify-end gap-2'>
          <button onClick={onClose} className='px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50'>
            {t('common.actions.cancel')}
          </button>
          <button
            onClick={save} disabled={saving || !name || !displayName}
            className='px-4 py-2 text-sm font-medium bg-[#E36A3A] text-white rounded-lg hover:bg-[#C95428] disabled:opacity-50'>
            {saving ? t('common.actions.saving') : editing ? t('common.actions.update') : t('common.actions.create')}
          </button>
        </div>
      </div>
    </div>
  )
}

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className='text-xs font-medium text-gray-600'>{label}</label>
    <input
      type='text' value={value} onChange={(e) => onChange(e.target.value)}
      className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
    />
  </div>
)

export default SuperAdminCategoriesPage
