import React, { useEffect, useState } from 'react'
import {
  SearchIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  EditIcon,
  ShieldCheckIcon,
  XIcon,
} from '../../components/icons/IconComponents'
import superAdminService, {
  AdminUser,
  AdminUserCreatePayload,
  AccountStatus,
} from '../../services/superAdminService'
import usePageParam from '../../hooks/usePageParam'
import { Pagination, StatusBadge } from './SuperAdminRecruitersPage'

const PAGE_SIZE = 20

const STATUS_OPTIONS: { label: string; value: AccountStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Banned', value: 'BANNED' },
]

const ROLE_OPTIONS = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPPORT']

const errMsg = (err: any, fallback: string): string => {
  const s = err?.response?.status
  const m = err?.response?.data?.message
  if (s === 401) return 'Unauthorized — please log in as an admin.'
  if (s === 403) return 'Access denied — admin role required.'
  if (s === 404) return 'Endpoint not found.'
  return m || err?.message || fallback
}

export const SuperAdminAdminUsersPage: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = usePageParam('page', 0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState<AccountStatus | ''>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await superAdminService.getAdminUsers({
        page,
        size: PAGE_SIZE,
        search: search.trim() || undefined,
        status: status || undefined,
      })
      setAdmins(result.data)
      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)
    } catch (err: any) {
      setError(errMsg(err, 'Unable to load admin users.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    setSearch(searchInput)
  }

  const handleStatusToggle = async (admin: AdminUser) => {
    const next: AccountStatus = admin.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    if (!confirm(`Change status to ${next}?`)) return
    try {
      await superAdminService.updateAdminUserStatus(admin.id, next)
      load()
    } catch (err: any) {
      alert(errMsg(err, 'Failed to update status'))
    }
  }

  const handleDelete = async (admin: AdminUser) => {
    if (!confirm(`Delete admin "${admin.firstName} ${admin.lastName}"?`)) return
    try {
      await superAdminService.deleteAdminUser(admin.id)
      load()
    } catch (err: any) {
      alert(errMsg(err, 'Failed to delete'))
    }
  }

  return (
    <div className='p-6 space-y-4'>
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
        <div className='flex flex-col md:flex-row gap-3'>
          <form onSubmit={onSearchSubmit} className='flex-1 relative'>
            <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='Search by name or email...'
              className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
            />
          </form>
          <select
            value={status}
            onChange={(e) => {
              setPage(0)
              setStatus(e.target.value as AccountStatus | '')
            }}
            className='px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
            className='px-4 py-2 bg-[#E36A3A] text-white text-sm font-medium rounded-lg hover:bg-[#C95428] transition-colors flex items-center gap-2'>
            <PlusIcon className='h-4 w-4' /> Add Admin
          </button>
        </div>
        <p className='text-xs text-gray-500 mt-3'>
          Showing {admins.length} of {totalItems.toLocaleString()} admin users
        </p>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className='py-16 text-center text-gray-500'>Loading...</div>
        ) : error ? (
          <div className='py-16 text-center text-red-600'>{error}</div>
        ) : admins.length === 0 ? (
          <div className='py-16 text-center text-gray-500'>No admin users found</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <Th>Admin</Th>
                  <Th>Contact</Th>
                  <Th>Role</Th>
                  <Th>Permissions</Th>
                  <Th>Status</Th>
                  <Th>Last Login</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {admins.map((a) => {
                  const firstName = a.firstName || ''
                  const lastName = a.lastName || ''
                  return (
                    <tr key={a.id} className='hover:bg-gray-50'>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          <div className='h-10 w-10 rounded-full bg-gradient-to-br from-[#E36A3A] to-[#F6A57A] flex items-center justify-center text-white font-semibold flex-shrink-0'>
                            {(firstName.charAt(0) || '?')}
                          </div>
                          <div>
                            <p className='font-medium text-gray-900'>{firstName} {lastName}</p>
                            <p className='text-xs text-gray-500'>ID: {a.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-xs'>
                        <div className='flex items-center gap-1 text-gray-700'>
                          <MailIcon className='h-3 w-3' /> {a.email || '—'}
                        </div>
                        <div className='flex items-center gap-1 text-gray-500 mt-0.5'>
                          <PhoneIcon className='h-3 w-3' /> {a.mobile || '—'}
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700'>
                          <ShieldCheckIcon className='h-3 w-3' />
                          {(a.role || '—').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-xs text-gray-700 max-w-xs'>
                        {a.permissions && a.permissions.length > 0 ? (
                          <span className='truncate block'>{a.permissions.join(', ')}</span>
                        ) : (
                          <span className='text-gray-400'>—</span>
                        )}
                      </td>
                      <td className='px-4 py-3'>
                        {a.accountStatus && <StatusBadge status={a.accountStatus} />}
                      </td>
                      <td className='px-4 py-3 text-xs text-gray-500'>
                        {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex gap-1'>
                          <button
                            onClick={() => {
                              setEditing(a)
                              setModalOpen(true)
                            }}
                            className='p-1.5 text-gray-600 hover:bg-gray-100 rounded'
                            title='Edit'>
                            <EditIcon className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => handleStatusToggle(a)}
                            className='px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 rounded border border-orange-200'>
                            {a.accountStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(a)}
                            className='px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded border border-red-200'>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}

      {modalOpen && (
        <AdminUserModal
          admin={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false)
            load()
          }}
        />
      )}
    </div>
  )
}

const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th className='text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider'>
    {children}
  </th>
)

const AdminUserModal: React.FC<{
  admin: AdminUser | null
  onClose: () => void
  onSaved: () => void
}> = ({ admin, onClose, onSaved }) => {
  const [firstName, setFirstName] = useState(admin?.firstName || '')
  const [lastName, setLastName] = useState(admin?.lastName || '')
  const [email, setEmail] = useState(admin?.email || '')
  const [mobile, setMobile] = useState(admin?.mobile || '')
  const [role, setRole] = useState(admin?.role || 'ADMIN')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handleSave = async () => {
    try {
      setSaving(true)
      setErr(null)
      const payload: AdminUserCreatePayload = {
        firstName, lastName, email, mobile: mobile || undefined, role,
      }
      if (!admin) payload.password = password || undefined
      if (admin) {
        await superAdminService.updateAdminUser(admin.id, payload)
      } else {
        await superAdminService.createAdminUser(payload)
      }
      onSaved()
    } catch (e: any) {
      setErr(errMsg(e, 'Failed to save'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4' onClick={onClose}>
      <div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6' onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-bold text-gray-900'>
            {admin ? 'Edit Admin' : 'Add Admin'}
          </h2>
          <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded'>
            <XIcon className='h-5 w-5' />
          </button>
        </div>
        <div className='space-y-3'>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-xs font-medium text-gray-600'>First Name *</label>
              <input
                type='text' value={firstName} onChange={(e) => setFirstName(e.target.value)}
                className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
              />
            </div>
            <div>
              <label className='text-xs font-medium text-gray-600'>Last Name *</label>
              <input
                type='text' value={lastName} onChange={(e) => setLastName(e.target.value)}
                className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
              />
            </div>
          </div>
          <div>
            <label className='text-xs font-medium text-gray-600'>Email *</label>
            <input
              type='email' value={email} onChange={(e) => setEmail(e.target.value)}
              className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
            />
          </div>
          <div>
            <label className='text-xs font-medium text-gray-600'>Mobile</label>
            <input
              type='tel' value={mobile} onChange={(e) => setMobile(e.target.value)}
              className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
            />
          </div>
          <div>
            <label className='text-xs font-medium text-gray-600'>Role</label>
            <select
              value={role} onChange={(e) => setRole(e.target.value)}
              className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          {!admin && (
            <div>
              <label className='text-xs font-medium text-gray-600'>Initial Password</label>
              <input
                type='password' value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder='Leave blank to auto-generate'
                className='w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
              />
            </div>
          )}
          {err && <div className='text-sm text-red-600 bg-red-50 p-2 rounded'>{err}</div>}
        </div>
        <div className='mt-6 flex justify-end gap-2'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50'>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !firstName || !lastName || !email}
            className='px-4 py-2 text-sm font-medium bg-[#E36A3A] text-white rounded-lg hover:bg-[#C95428] disabled:opacity-50'>
            {saving ? 'Saving...' : admin ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminAdminUsersPage
