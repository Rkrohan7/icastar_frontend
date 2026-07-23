import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardIcon,
  UsersIcon,
  BriefcaseIcon,
  MicVocal,
  SearchIcon,
  CreditCardIcon,
  ChartBarIcon,
  SettingsIcon,
  BellIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  ShieldCheckIcon,
  ImageIcon,
  CalendarIcon,
  FileTextIcon,
} from '../components/icons/IconComponents'
import { toast } from 'react-toastify'
import userService from '../services/userService'

interface AdminNavItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: AdminNavItem[]
}

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedSections, setExpandedSections] = useState<string[]>(['dashboard'])

  const navItems: AdminNavItem[] = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: DashboardIcon,
    },
    {
      name: 'User Management',
      path: '/admin/users',
      icon: UsersIcon,
      children: [
        { name: 'Recruiters', path: '/admin/recruiters', icon: BriefcaseIcon },
        { name: 'Artists', path: '/admin/artists', icon: MicVocal },
      ],
    },
    {
      name: 'Jobs Management',
      path: '/admin/jobs-mgmt',
      icon: BriefcaseIcon,
      children: [
        { name: 'All Jobs', path: '/admin/jobs', icon: BriefcaseIcon },
        { name: 'Job Approvals', path: '/admin/jobs/approvals', icon: ShieldCheckIcon },
        { name: 'Job Categories', path: '/admin/jobs/categories', icon: FileTextIcon },
      ],
    },
    {
      name: 'Auditions',
      path: '/admin/auditions',
      icon: MicVocal,
      children: [
        { name: 'All Auditions', path: '/admin/auditions/all', icon: MicVocal },
        { name: 'Audition Approvals', path: '/admin/auditions/approvals', icon: ShieldCheckIcon },
      ],
    },
    {
      name: 'Applications',
      path: '/admin/applications',
      icon: FileTextIcon,
      children: [
        { name: 'Job Applications', path: '/admin/applications/jobs', icon: BriefcaseIcon },
        { name: 'Audition Applications', path: '/admin/applications/auditions', icon: MicVocal },
        { name: 'Interviews', path: '/admin/applications/interviews', icon: CalendarIcon },
      ],
    },
    {
      name: 'Content Moderation',
      path: '/admin/content',
      icon: ImageIcon,
      children: [
        { name: 'Artist Portfolios', path: '/admin/artists', icon: ImageIcon },
        { name: 'Reported Content', path: '/admin/content/reports', icon: ShieldCheckIcon },
      ],
    },
    {
      name: 'Payments & Credits',
      path: '/admin/payments',
      icon: CreditCardIcon,
      children: [
        { name: 'Transactions', path: '/admin/payments/transactions', icon: CreditCardIcon },
        { name: 'Credits Usage', path: '/admin/payments/credits', icon: CreditCardIcon },
        { name: 'Payouts', path: '/admin/payments/payouts', icon: CreditCardIcon },
      ],
    },
    {
      name: 'Reports & Analytics',
      path: '/admin/reports',
      icon: ChartBarIcon,
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: SettingsIcon,
      children: [
        { name: 'Platform Config', path: '/admin/config', icon: SettingsIcon },
        { name: 'Roles & Permissions', path: '/admin/settings/roles', icon: ShieldCheckIcon },
        { name: 'Categories', path: '/admin/settings/categories', icon: FileTextIcon },
        { name: 'Skills', path: '/admin/settings/skills', icon: FileTextIcon },
      ],
    },
  ]

  const toggleSection = (name: string) => {
    setExpandedSections((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    )
  }

  const isActive = (path: string) => location.pathname === path
  const isParentActive = (item: AdminNavItem) => {
    if (item.children) {
      return item.children.some((child) => location.pathname.startsWith(child.path))
    }
    return location.pathname === item.path
  }

  return (
    <div className='flex h-screen bg-gray-50 overflow-hidden'>
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white text-gray-800 transition-all duration-300 flex flex-col shadow-2xl border-r border-gray-200`}>
        {/* Header */}
        <div className='p-4 border-b border-gray-200 flex items-center justify-between'>
          {sidebarOpen ? (
            <div>
              <h1 className='text-xl font-bold text-[#E36A3A]'>
                iCastar Admin
              </h1>
              <p className='text-xs text-gray-500 mt-0.5'>System Control Panel</p>
            </div>
          ) : (
            <ShieldCheckIcon className='h-8 w-8 text-[#E36A3A]' />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            {sidebarOpen ? <XIcon className='h-5 w-5' /> : <MenuIcon className='h-5 w-5' />}
          </button>
        </div>

        {/* Search */}
        {sidebarOpen && (
          <div className='p-4'>
            <div className='relative'>
              <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search...'
                className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E36A3A] text-sm'
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className='flex-1 overflow-y-auto px-2 py-4 space-y-1'>
          {navItems.map((item) => (
            <div key={item.name}>
              <button
                onClick={() => {
                  if (item.children) {
                    toggleSection(item.name)
                  } else {
                    navigate(item.path)
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                  isActive(item.path) || isParentActive(item)
                    ? 'bg-[#E36A3A] text-white shadow-lg'
                    : 'text-gray-600 hover:bg-[#F6A57A] hover:text-white'
                }`}>
                <div className='flex items-center gap-3'>
                  <item.icon className='h-5 w-5 flex-shrink-0' />
                  {sidebarOpen && <span className='text-sm font-medium'>{item.name}</span>}
                </div>
                {sidebarOpen && (
                  <div className='flex items-center gap-2'>
                    {item.badge && (
                      <span className='bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full'>
                        {item.badge}
                      </span>
                    )}
                    {item.children && (
                      <svg
                        className={`h-4 w-4 transition-transform ${
                          expandedSections.includes(item.name) ? 'rotate-180' : ''
                        }`}
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                      </svg>
                    )}
                  </div>
                )}
              </button>

              {/* Submenu */}
              {item.children && sidebarOpen && expandedSections.includes(item.name) && (
                <div className='ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2'>
                  {item.children.map((child) => (
                    <button
                      key={child.name}
                      onClick={() => navigate(child.path)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive(child.path)
                          ? 'bg-[#E36A3A] text-white font-medium'
                          : 'text-gray-500 hover:bg-[#F6A57A] hover:text-white'
                      }`}>
                      <div className='flex items-center gap-2'>
                        <child.icon className='h-4 w-4' />
                        <span>{child.name}</span>
                      </div>
                      {child.badge && (
                        <span className='bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full'>
                          {child.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className='p-4 border-t border-gray-200'>
          {sidebarOpen ? (
            <div className='flex items-center gap-3 mb-3'>
              <div className='h-10 w-10 rounded-full bg-gradient-to-br from-[#E36A3A] to-[#F6A57A] flex items-center justify-center text-white font-bold text-sm'>
                AD
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-800'>Admin User</p>
                <p className='text-xs text-gray-500'>Super Admin</p>
              </div>
            </div>
          ) : (
            <div className='h-10 w-10 rounded-full bg-gradient-to-br from-[#E36A3A] to-[#F6A57A] flex items-center justify-center text-white font-bold text-sm mx-auto mb-3'>
              AD
            </div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault()
              // Clears tokens/localStorage and wipes the API response cache,
              // so the next session can't read the previous admin's data.
              userService.logout()
              toast.success('You have been logged out successfully')
              navigate('/auth', { replace: true })
            }}
            title='Logout'
            className='w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium text-white'>
            <LogOutIcon className='h-4 w-4' />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Top Bar */}
        <header className='bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              {navItems
                .flatMap((item) => [item, ...(item.children || [])])
                .find((item) => item.path === location.pathname)?.name || 'Dashboard'}
            </h2>
            <p className='text-sm text-gray-500 mt-0.5'>Manage and monitor your platform</p>
          </div>

          <div className='flex items-center gap-4'>
            {/* Notifications */}
            <button className='relative p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <BellIcon className='h-6 w-6 text-gray-600' />
              <span className='absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full'></span>
            </button>

            {/* Quick Actions */}
            <button className='px-4 py-2 bg-[#E36A3A] text-white rounded-lg hover:bg-[#C95428] transition-colors font-medium text-sm flex items-center gap-2'>
              <ShieldCheckIcon className='h-4 w-4' />
              Quick Action
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className='flex-1 overflow-y-auto bg-gray-50'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
