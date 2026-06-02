import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UsersIcon,
  BriefcaseIcon,
  MicVocal,
  FileTextIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
} from '../../components/icons/IconComponents'
import superAdminService, {
  SuperAdminDashboard,
} from '../../services/superAdminService'

interface KpiCardConfig {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
}

// Safe number formatter — handles null/undefined/NaN
const n = (v: number | null | undefined): string => (v ?? 0).toLocaleString()

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SuperAdminDashboard | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await superAdminService.getDashboard()
        setData(result)
      } catch (err) {
        console.error('Failed to load super admin dashboard:', err)
        setError('Unable to load dashboard data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='text-gray-500'>Loading dashboard...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg'>
          {error || 'No data available'}
        </div>
      </div>
    )
  }

  const kpis: KpiCardConfig[] = [
    {
      title: 'Total Users',
      value: n(data.totalUsers),
      subtitle: `+${data.newUsersToday ?? 0} today`,
      icon: UsersIcon,
      iconBg: 'bg-orange-50',
      iconColor: 'text-[#E36A3A]',
    },
    {
      title: 'Total Artists',
      value: n(data.totalArtists),
      subtitle: `${n(data.totalRecruiters)} recruiters`,
      icon: MicVocal,
      iconBg: 'bg-orange-50',
      iconColor: 'text-[#E36A3A]',
    },
    {
      title: 'Active Jobs',
      value: n(data.activeJobs),
      subtitle: `${n(data.totalJobs)} total`,
      icon: BriefcaseIcon,
      iconBg: 'bg-orange-50',
      iconColor: 'text-[#E36A3A]',
    },
    {
      title: 'Total Applications',
      value: n(data.totalApplications),
      subtitle: `${n(data.pendingApplications)} pending`,
      icon: FileTextIcon,
      iconBg: 'bg-orange-50',
      iconColor: 'text-[#E36A3A]',
    },
    {
      title: 'Verified Users',
      value: n(data.verifiedUsers),
      subtitle: `${n(data.unverifiedUsers)} unverified`,
      icon: ShieldCheckIcon,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'New This Month',
      value: n(data.newUsersThisMonth),
      subtitle: `+${data.newUsersThisWeek ?? 0} this week`,
      icon: TrendingUpIcon,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
  ]

  const userStatusBreakdown = [
    { label: 'Active', value: data.activeUsers ?? 0, color: 'bg-green-500' },
    { label: 'Inactive', value: data.inactiveUsers ?? 0, color: 'bg-gray-400' },
    { label: 'Suspended', value: data.suspendedUsers ?? 0, color: 'bg-yellow-500' },
    { label: 'Banned', value: data.bannedUsers ?? 0, color: 'bg-red-500' },
  ]
  const userStatusTotal = userStatusBreakdown.reduce((s, x) => s + x.value, 0) || 1

  const appStatusBreakdown = [
    { label: 'Pending', value: data.pendingApplications ?? 0, color: 'bg-[#F6A57A]' },
    { label: 'Shortlisted', value: data.shortlistedApplications ?? 0, color: 'bg-[#E36A3A]' },
    { label: 'Accepted', value: data.acceptedApplications ?? 0, color: 'bg-green-600' },
    { label: 'Rejected', value: data.rejectedApplications ?? 0, color: 'bg-red-500' },
  ]
  const appStatusTotal = appStatusBreakdown.reduce((s, x) => s + x.value, 0) || 1

  const artistTypeEntries = Object.entries(data.artistTypeDistribution || {}) as [string, number][]
  const maxArtistType = Math.max(...artistTypeEntries.map(([, v]) => v), 1)
  const jobTypeEntries = Object.entries(data.jobTypeDistribution || {}) as [string, number][]
  const jobTypeTotal = jobTypeEntries.reduce((s, [, v]) => s + v, 0) || 1

  return (
    <div className='p-6 space-y-6'>
      {/* KPI Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {kpis.map((kpi) => (
          <div
            key={kpi.title}
            className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-600 mb-1'>{kpi.title}</p>
                <h3 className='text-3xl font-bold text-gray-900 mb-2'>{kpi.value}</h3>
                {kpi.subtitle && (
                  <span className='text-xs text-gray-500'>{kpi.subtitle}</span>
                )}
              </div>
              <div className={`${kpi.iconBg} p-3 rounded-lg`}>
                <kpi.icon className={`h-6 w-6 ${kpi.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status breakdown row */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-bold text-gray-900 mb-1'>User Account Status</h3>
          <p className='text-sm text-gray-500 mb-4'>Current distribution across all users</p>
          <div className='space-y-3'>
            {userStatusBreakdown.map((s) => {
              const pct = (s.value / userStatusTotal) * 100
              return (
                <div key={s.label}>
                  <div className='flex items-center justify-between text-sm mb-1'>
                    <span className='text-gray-700'>{s.label}</span>
                    <span className='font-semibold text-gray-900'>
                      {s.value.toLocaleString()} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className='w-full h-2 bg-gray-100 rounded-full overflow-hidden'>
                    <div className={`h-full ${s.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-bold text-gray-900 mb-1'>Application Status</h3>
          <p className='text-sm text-gray-500 mb-4'>Breakdown across all applications</p>
          <div className='space-y-3'>
            {appStatusBreakdown.map((s) => {
              const pct = (s.value / appStatusTotal) * 100
              return (
                <div key={s.label}>
                  <div className='flex items-center justify-between text-sm mb-1'>
                    <span className='text-gray-700'>{s.label}</span>
                    <span className='font-semibold text-gray-900'>
                      {s.value.toLocaleString()} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className='w-full h-2 bg-gray-100 rounded-full overflow-hidden'>
                    <div className={`h-full ${s.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Distribution charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-bold text-gray-900 mb-1'>Artist Type Distribution</h3>
          <p className='text-sm text-gray-500 mb-6'>Active artists by category</p>
          <div className='space-y-3'>
            {artistTypeEntries.map(([type, count]) => {
              const pct = (count / maxArtistType) * 100
              return (
                <div key={type}>
                  <div className='flex items-center justify-between text-sm mb-1'>
                    <span className='text-gray-700'>{type}</span>
                    <span className='font-semibold text-gray-900'>{count.toLocaleString()}</span>
                  </div>
                  <div className='w-full h-2 bg-gray-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-[#E36A3A] to-[#F6A57A]'
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-bold text-gray-900 mb-1'>Job Type Distribution</h3>
          <p className='text-sm text-gray-500 mb-6'>Jobs by employment type</p>
          <div className='space-y-3'>
            {jobTypeEntries.map(([type, count]) => {
              const pct = (count / jobTypeTotal) * 100
              return (
                <div key={type}>
                  <div className='flex items-center justify-between text-sm mb-1'>
                    <span className='text-gray-700'>{type.replace('_', ' ')}</span>
                    <span className='font-semibold text-gray-900'>
                      {count.toLocaleString()} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className='w-full h-2 bg-gray-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-blue-500 to-blue-300'
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top recruiters / artists / jobs */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <TopList
          title='Top Recruiters'
          subtitle='By jobs posted'
          onViewAll={() => navigate('/admin/recruiters')}
          items={(data.topRecruiters || []).map((r) => ({
            id: r.id,
            primary: r.name || '—',
            secondary: r.companyName || '',
            metricLabel: `${r.totalJobsPosted ?? 0} jobs`,
            metricSub: `${r.totalHires ?? 0} hires`,
            image: r.profileImage,
          }))}
        />
        <TopList
          title='Top Artists'
          subtitle='By applications'
          onViewAll={() => navigate('/admin/artists')}
          items={(data.topArtists || []).map((a) => ({
            id: a.id,
            primary: a.name || '—',
            secondary: a.artistType || '',
            metricLabel: `${a.totalApplications ?? 0} apps`,
            metricSub: `${n(a.profileViews)} views`,
            image: a.profileImage,
          }))}
        />
        <TopList
          title='Top Jobs'
          subtitle='Most applied'
          onViewAll={() => navigate('/admin/jobs')}
          items={(data.topJobs || []).map((j) => ({
            id: j.id,
            primary: j.title || '—',
            secondary: j.recruiterName || '',
            metricLabel: `${j.applicationCount ?? 0} apps`,
            metricSub: `${n(j.viewCount)} views`,
            image: null,
          }))}
        />
      </div>

      <div className='text-xs text-gray-400 text-right'>
        Last updated: {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : '—'}
      </div>
    </div>
  )
}

interface TopListItem {
  id: number
  primary: string
  secondary: string
  metricLabel: string
  metricSub: string
  image: string | null
}

const TopList: React.FC<{
  title: string
  subtitle: string
  items: TopListItem[]
  onViewAll: () => void
}> = ({ title, subtitle, items, onViewAll }) => (
  <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
    <div className='mb-4 flex items-center justify-between'>
      <div>
        <h3 className='text-lg font-bold text-gray-900'>{title}</h3>
        <p className='text-sm text-gray-500'>{subtitle}</p>
      </div>
      <ChartBarIcon className='h-5 w-5 text-[#E36A3A]' />
    </div>
    <div className='space-y-3 max-h-72 overflow-y-auto'>
      {items.length === 0 ? (
        <p className='text-sm text-gray-400 text-center py-4'>No data</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className='flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors'>
            {item.image ? (
              <img
                src={item.image}
                alt={item.primary}
                className='h-10 w-10 rounded-full object-cover flex-shrink-0'
              />
            ) : (
              <div className='h-10 w-10 rounded-full bg-gradient-to-br from-[#E36A3A] to-[#F6A57A] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0'>
                {(item.primary || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>{item.primary}</p>
              <p className='text-xs text-gray-500 truncate'>{item.secondary}</p>
            </div>
            <div className='text-right flex-shrink-0'>
              <p className='text-sm font-semibold text-gray-900'>{item.metricLabel}</p>
              <p className='text-xs text-gray-500'>{item.metricSub}</p>
            </div>
          </div>
        ))
      )}
    </div>
    <button
      onClick={onViewAll}
      className='w-full mt-4 px-4 py-2 text-sm font-medium text-[#E36A3A] hover:bg-orange-50 rounded-lg transition-colors border border-[#E36A3A]'>
      View All
    </button>
  </div>
)

export default AdminDashboardPage
