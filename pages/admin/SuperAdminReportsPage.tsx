import React, { useEffect, useState } from 'react'
import {
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  CalendarIcon,
} from '../../components/icons/IconComponents'
import superAdminService, {
  JobReport,
  UserReport,
} from '../../services/superAdminService'

type Tab = 'users' | 'jobs'

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function defaultRange(): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 29)
  return { start: toIso(start), end: toIso(end) }
}

export const SuperAdminReportsPage: React.FC = () => {
  const initial = defaultRange()
  const [tab, setTab] = useState<Tab>('users')
  const [startDate, setStartDate] = useState(initial.start)
  const [endDate, setEndDate] = useState(initial.end)
  const [appliedStart, setAppliedStart] = useState(initial.start)
  const [appliedEnd, setAppliedEnd] = useState(initial.end)
  const [userReport, setUserReport] = useState<UserReport | null>(null)
  const [jobReport, setJobReport] = useState<JobReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        setError(null)
        if (tab === 'users') {
          const r = await superAdminService.getUserReport(appliedStart, appliedEnd)
          setUserReport(r)
        } else {
          const r = await superAdminService.getJobReport(appliedStart, appliedEnd)
          setJobReport(r)
        }
      } catch (err) {
        console.error('Failed to load report:', err)
        setError('Unable to load report. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [tab, appliedStart, appliedEnd])

  const applyDates = () => {
    setAppliedStart(startDate)
    setAppliedEnd(endDate)
  }

  return (
    <div className='p-6 space-y-4'>
      {/* Header with tabs and date range */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div className='flex gap-2'>
            <TabButton active={tab === 'users'} onClick={() => setTab('users')} icon={UsersIcon}>
              User Report
            </TabButton>
            <TabButton active={tab === 'jobs'} onClick={() => setTab('jobs')} icon={BriefcaseIcon}>
              Job Report
            </TabButton>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <CalendarIcon className='h-4 w-4 text-gray-500' />
            <input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
            />
            <span className='text-sm text-gray-500'>to</span>
            <input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
            />
            <button
              onClick={applyDates}
              className='px-4 py-1.5 bg-[#E36A3A] text-white text-sm font-medium rounded-lg hover:bg-[#C95428] transition-colors'>
              Apply
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center text-gray-500'>
          Loading report...
        </div>
      ) : error ? (
        <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl'>
          {error}
        </div>
      ) : tab === 'users' && userReport ? (
        <UserReportView report={userReport} />
      ) : tab === 'jobs' && jobReport ? (
        <JobReportView report={jobReport} />
      ) : null}
    </div>
  )
}

const TabButton: React.FC<{
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}> = ({ active, onClick, icon: Icon, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-[#E36A3A] text-white'
        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
    }`}>
    <Icon className='h-4 w-4' />
    {children}
  </button>
)

const StatTile: React.FC<{ label: string; value: number | string; sub?: string }> = ({
  label,
  value,
  sub,
}) => (
  <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
    <p className='text-xs font-medium text-gray-600 mb-1'>{label}</p>
    <p className='text-2xl font-bold text-gray-900'>{value}</p>
    {sub && <p className='text-xs text-gray-500 mt-1'>{sub}</p>}
  </div>
)

const DistributionList: React.FC<{
  title: string
  data: Record<string, number>
  colorClass?: string
}> = ({ title, data, colorClass = 'bg-gradient-to-r from-[#E36A3A] to-[#F6A57A]' }) => {
  const entries = Object.entries(data) as [string, number][]
  const max = Math.max(...entries.map(([, v]) => v), 1)
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
      <h3 className='text-lg font-bold text-gray-900 mb-4'>{title}</h3>
      {entries.length === 0 ? (
        <p className='text-sm text-gray-400 text-center py-4'>No data</p>
      ) : (
        <div className='space-y-3'>
          {entries.map(([key, val]) => (
            <div key={key}>
              <div className='flex justify-between text-sm mb-1'>
                <span className='text-gray-700'>{key.replace(/_/g, ' ')}</span>
                <span className='font-semibold text-gray-900'>{(val ?? 0).toLocaleString()}</span>
              </div>
              <div className='w-full h-2 bg-gray-100 rounded-full overflow-hidden'>
                <div className={`h-full ${colorClass}`} style={{ width: `${((val ?? 0) / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const num = (v: number | null | undefined): string => (v ?? 0).toLocaleString()
const fx = (v: number | null | undefined, d = 1): string => (v ?? 0).toFixed(d)

const UserReportView: React.FC<{ report: UserReport }> = ({ report }) => (
  <div className='space-y-4'>
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      <StatTile label='Total New Users' value={num(report.totalNewUsers)} />
      <StatTile label='New Artists' value={num(report.newArtists)} />
      <StatTile label='New Recruiters' value={num(report.newRecruiters)} />
      <StatTile
        label='Avg Profile Completion'
        value={`${fx(report.averageProfileCompletionRate)}%`}
      />
      <StatTile label='Active Users' value={num(report.activeUsers)} />
      <StatTile label='Verified Users' value={num(report.verifiedUsers)} />
      <StatTile label='Suspended' value={num(report.suspendedUsers)} />
      <StatTile label='Banned' value={num(report.bannedUsers)} />
    </div>
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      <DistributionList title='Users by Location' data={report.usersByLocation || {}} />
      <DistributionList title='Users by Artist Type' data={report.usersByArtistType || {}} />
      <DistributionList
        title='Recruiters by Category'
        data={report.usersByRecruiterCategory || {}}
        colorClass='bg-gradient-to-r from-blue-500 to-blue-300'
      />
      <DailyChart
        title='Daily Registrations'
        data={report.dailyRegistrations || {}}
        colorClass='bg-gradient-to-t from-[#E36A3A] to-[#F6A57A]'
      />
    </div>
    <p className='text-xs text-gray-400 text-right'>
      Generated: {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : '—'}
    </p>
  </div>
)

const JobReportView: React.FC<{ report: JobReport }> = ({ report }) => (
  <div className='space-y-4'>
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      <StatTile label='Jobs Posted' value={num(report.totalJobsPosted)} />
      <StatTile label='Active Jobs' value={num(report.activeJobs)} />
      <StatTile label='Applications' value={num(report.totalApplicationsReceived)} />
      <StatTile label='Avg Apps/Job' value={fx(report.averageApplicationsPerJob)} />
      <StatTile label='Hires Made' value={num(report.totalHiresMade)} />
      <StatTile label='Conversion' value={`${fx(report.conversionRate)}%`} />
      <StatTile label='Featured' value={num(report.featuredJobs)} />
      <StatTile
        label='Closed/Expired'
        value={num((report.closedJobs ?? 0) + (report.expiredJobs ?? 0))}
      />
    </div>
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      <DistributionList title='Jobs by Type' data={report.jobsByType || {}} />
      <DistributionList title='Jobs by Location' data={report.jobsByLocation || {}} />
      <DistributionList
        title='Applications by Status'
        data={report.applicationsByStatus || {}}
        colorClass='bg-gradient-to-r from-green-500 to-green-300'
      />
      <DailyChart
        title='Daily Job Postings'
        data={report.dailyJobPostings || {}}
        colorClass='bg-gradient-to-t from-blue-500 to-blue-300'
      />
    </div>

    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
      <h3 className='text-lg font-bold text-gray-900 mb-4'>Top Performing Jobs</h3>
      {(!report.topPerformingJobs || report.topPerformingJobs.length === 0) ? (
        <p className='text-sm text-gray-400 text-center py-4'>No data</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='text-left px-4 py-2 text-xs font-semibold text-gray-600 uppercase'>Job</th>
                <th className='text-left px-4 py-2 text-xs font-semibold text-gray-600 uppercase'>Recruiter</th>
                <th className='text-right px-4 py-2 text-xs font-semibold text-gray-600 uppercase'>Apps</th>
                <th className='text-right px-4 py-2 text-xs font-semibold text-gray-600 uppercase'>Views</th>
                <th className='text-right px-4 py-2 text-xs font-semibold text-gray-600 uppercase'>Hires</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {report.topPerformingJobs.map((j) => (
                <tr key={j.jobId} className='hover:bg-gray-50'>
                  <td className='px-4 py-3 font-medium text-gray-900'>{j.jobTitle || '—'}</td>
                  <td className='px-4 py-3 text-gray-700'>{j.recruiterName || '—'}</td>
                  <td className='px-4 py-3 text-right text-gray-700'>{j.applicationCount ?? 0}</td>
                  <td className='px-4 py-3 text-right text-gray-700'>{num(j.viewCount)}</td>
                  <td className='px-4 py-3 text-right text-gray-700'>{j.hireCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    <p className='text-xs text-gray-400 text-right'>
      Generated: {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : '—'}
    </p>
  </div>
)

const DailyChart: React.FC<{
  title: string
  data: Record<string, number>
  colorClass: string
}> = ({ title, data, colorClass }) => {
  const entries = (Object.entries(data) as [string, number][]).sort(([a], [b]) =>
    a.localeCompare(b),
  )
  const max = Math.max(...entries.map(([, v]) => v), 1)
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
      <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2'>
        <ChartBarIcon className='h-5 w-5 text-[#E36A3A]' /> {title}
      </h3>
      {entries.length === 0 ? (
        <p className='text-sm text-gray-400 text-center py-4'>No data</p>
      ) : (
        <div className='h-40 flex items-end gap-1'>
          {entries.map(([day, val]) => (
            <div key={day} className='flex-1 flex flex-col items-center justify-end gap-1'>
              <div
                className={`w-full ${colorClass} rounded-t hover:opacity-80 transition-opacity`}
                style={{ height: `${(val / max) * 100}%` }}
                title={`${day}: ${val}`}
              />
            </div>
          ))}
        </div>
      )}
      <p className='text-xs text-gray-400 mt-2'>
        {entries[0]?.[0]} → {entries[entries.length - 1]?.[0]}
      </p>
    </div>
  )
}

export default SuperAdminReportsPage
