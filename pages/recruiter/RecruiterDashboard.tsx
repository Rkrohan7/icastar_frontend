import React, { useState, useEffect } from 'react'
import { Card } from '../../components/Card'
import { Applicant, Page } from '../../types'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import {
  BriefcaseIcon,
  CalendarIcon,
  CheckCircleIcon,
  UsersIcon,
  XCircleIcon,
  TrendingUpIcon,
  PlusIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '../../components/icons/IconComponents'
import recruiterDashboardService from '../../services/recruiterDashboardService'
import { ProjectCastingReport } from '../../components/ProjectCastingReport'
import { toast } from 'react-toastify'
import { dateLocale, translate, useTranslation, TranslateVars } from '@/i18n'

type LatestApplicantRow = Applicant & { appliedAt: string }

const StatusBadge: React.FC<{ status: Applicant['status'] }> = ({ status }) => {
  const { tEnum } = useTranslation()
  const baseClasses = 'px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1'
  const statusConfig = {
    New: { classes: 'bg-blue-100 text-blue-800', dot: 'bg-blue-600' },
    Viewed: { classes: 'bg-purple-100 text-purple-800', dot: 'bg-purple-600' },
    Interviewing: { classes: 'bg-amber-100 text-amber-800', dot: 'bg-amber-600' },
    Hired: { classes: 'bg-green-100 text-green-800', dot: 'bg-green-600' },
    Rejected: { classes: 'bg-red-100 text-red-800', dot: 'bg-red-600' },
  }
  const config = statusConfig[status]

  return (
    <span className={`${baseClasses} ${config.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`}></span>
      {tEnum(status)}
    </span>
  )
}

export const RecruiterDashboard = () => {
  const navigate = useNavigate()
  const { t, tEnum } = useTranslation()

  // State management
  const [loading, setLoading] = useState(true)
  const [kpiData, setKpiData] = useState<any[]>([])
  const [applicants, setApplicants] = useState<LatestApplicantRow[]>([])
  const [trendData, setTrendData] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [outcomesData, setOutcomesData] = useState<any[]>([])

  // Fetch all dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const [metrics, latestApplicants, trend, status, outcomes] = await Promise.all([
          recruiterDashboardService.getDashboardMetrics(),
          recruiterDashboardService.getLatestApplicants(5),
          recruiterDashboardService.getApplicationsTrend(),
          recruiterDashboardService.getApplicationStatus(),
          recruiterDashboardService.getInterviewOutcomes()
        ])

        // Transform metrics to KPI cards format
        const transformedKpis = [
          {
            nameKey: 'recruiterDashboard.kpi.activeJobs',
            value: metrics.activeJobs.value.toString(),
            change: metrics.activeJobs.trend > 0 ? `+${Math.abs(metrics.activeJobs.trend).toFixed(1)}%` : `${metrics.activeJobs.trend.toFixed(1)}%`,
            changeType: metrics.activeJobs.trend >= 0 ? 'increase' : 'decrease',
            icon: BriefcaseIcon,
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            trend: `${metrics.activeJobs.trend >= 0 ? '+' : ''}${metrics.activeJobs.trend.toFixed(1)}%`,
          },
          {
            nameKey: 'recruiterDashboard.kpi.totalApplications',
            value: metrics.applications.value.toString(),
            change: metrics.applications.trend > 0 ? `+${Math.abs(metrics.applications.trend).toFixed(1)}%` : `${metrics.applications.trend.toFixed(1)}%`,
            changeType: metrics.applications.trend >= 0 ? 'increase' : 'decrease',
            icon: UsersIcon,
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
            trend: `${metrics.applications.trend >= 0 ? '+' : ''}${metrics.applications.trend.toFixed(1)}%`,
          },
          {
            nameKey: 'recruiterDashboard.kpi.interviewsScheduled',
            value: metrics.interviews.value.toString(),
            change: metrics.interviews.trend > 0 ? `+${Math.abs(metrics.interviews.trend).toFixed(1)}%` : `${metrics.interviews.trend.toFixed(1)}%`,
            changeType: metrics.interviews.trend >= 0 ? 'increase' : 'decrease',
            icon: CalendarIcon,
            bgColor: 'bg-amber-50',
            iconColor: 'text-amber-600',
            trend: `${metrics.interviews.trend >= 0 ? '+' : ''}${metrics.interviews.trend.toFixed(1)}%`,
          },
          {
            nameKey: 'recruiterDashboard.kpi.offersReleased',
            value: metrics.offers.value.toString(),
            change: metrics.offers.trend > 0 ? `+${Math.abs(metrics.offers.trend).toFixed(1)}%` : `${metrics.offers.trend.toFixed(1)}%`,
            changeType: metrics.offers.trend >= 0 ? 'increase' : 'decrease',
            icon: TrendingUpIcon,
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
            trend: `${metrics.offers.trend >= 0 ? '+' : ''}${metrics.offers.trend.toFixed(1)}%`,
          },
          {
            nameKey: 'recruiterDashboard.kpi.candidatesHired',
            value: metrics.hires.value.toString(),
            change: metrics.hires.trend > 0 ? `+${Math.abs(metrics.hires.trend).toFixed(1)}%` : `${metrics.hires.trend.toFixed(1)}%`,
            changeType: metrics.hires.trend >= 0 ? 'increase' : 'decrease',
            icon: CheckCircleIcon,
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            trend: `${metrics.hires.trend >= 0 ? '+' : ''}${metrics.hires.trend.toFixed(1)}%`,
          },
          {
            nameKey: 'recruiterDashboard.kpi.rejectedCandidates',
            value: metrics.rejections.value.toString(),
            change: metrics.rejections.trend > 0 ? `+${Math.abs(metrics.rejections.trend).toFixed(1)}%` : `${metrics.rejections.trend.toFixed(1)}%`,
            changeType: metrics.rejections.trend >= 0 ? 'increase' : 'decrease',
            icon: XCircleIcon,
            bgColor: 'bg-red-50',
            iconColor: 'text-red-600',
            trend: `${metrics.rejections.trend >= 0 ? '+' : ''}${metrics.rejections.trend.toFixed(1)}%`,
          },
        ]
        setKpiData(transformedKpis)

        // Transform applicants data
        const transformedApplicants: LatestApplicantRow[] = latestApplicants.map(app => ({
          id: app.id,
          jobId: 0,
          name: app.name,
          avatarUrl: app.avatar || 'https://picsum.photos/seed/' + app.id + '/100/100',
          skills: JSON.parse(app.skills || '[]'),
          status: mapBackendStatusToUI(app.status),
          job: app.job,
          appliedDate: formatRelativeTime(app.appliedAt, translate),
          appliedAt: app.appliedAt,
          email: app.email,
          phone: '',
          bio: '',
          portfolioUrl: '',
        }))
        setApplicants(transformedApplicants)

        // Transform trend data for line chart
        const transformedTrend = trend.months.map((month, index) => ({
          month,
          applications: trend.applications[index],
          interviews: trend.interviews[index],
          hires: trend.hires[index],
        }))
        setTrendData(transformedTrend)

        // Transform status data for donut chart
        const statusColors = ['#3B82F6', '#A855F7', '#F59E0B', '#10B981', '#EF4444']
        const transformedStatus = status.labels.map((label, index) => ({
          name: label,
          value: status.data[index],
          color: statusColors[index] || '#6B7280',
        }))
        setStatusData(transformedStatus)

        // Transform outcomes data for bar chart
        const outcomeColors: Record<string, string> = {
          'Selected': '#10B981',
          'Rejected': '#EF4444',
          'On Hold': '#F59E0B',
          'Pending': '#6B7280',
        }
        const transformedOutcomes = outcomes.labels.map((label, index) => ({
          outcome: label,
          count: outcomes.data[index],
          fill: outcomeColors[label] || '#6B7280',
        }))
        setOutcomesData(transformedOutcomes)

      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error(translate('recruiterDashboard.loadFailed'))
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Helper function to map backend status to UI status
  const mapBackendStatusToUI = (status: string): Applicant['status'] => {
    const statusMap: Record<string, Applicant['status']> = {
      'APPLIED': 'New',
      'NEW': 'New',
      'VIEWED': 'Viewed',
      'INTERVIEWING': 'Interviewing',
      'INTERVIEW_SCHEDULED': 'Interviewing',
      'HIRED': 'Hired',
      'REJECTED': 'Rejected',
    }
    return statusMap[status] || 'New'
  }

  // Helper function to format relative time
  const formatRelativeTime = (dateString: string, tr: (key: string, vars?: TranslateVars) => string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return tr('recruiterDashboard.time.today')
    if (diffDays === 1) return tr('recruiterDashboard.time.dayAgo')
    if (diffDays < 7) return tr('recruiterDashboard.time.daysAgo', { count: diffDays })
    if (diffDays < 30) return tr('recruiterDashboard.time.weeksAgo', { count: Math.floor(diffDays / 7) })
    return tr('recruiterDashboard.time.monthsAgo', { count: Math.floor(diffDays / 30) })
  }

  const handleViewProfile = (applicant: Applicant) => {
    navigate('/applicant-profile', { state: { applicant } })
  }

  const quickActions = [
    {
      title: t('recruiterDashboard.quickActions.postJob'),
      description: t('recruiterDashboard.quickActions.postJobDescription'),
      icon: PlusIcon,
      bgColor: 'bg-amber-600',
      hoverColor: 'hover:bg-amber-700',
      action: () => navigate('/my-jobs'),
    },
    {
      title: t('recruiterDashboard.quickActions.scheduleInterview'),
      description: t('recruiterDashboard.quickActions.scheduleInterviewDescription'),
      icon: CalendarIcon,
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      action: () => navigate('/applicants'),
    },
    {
      title: t('recruiterDashboard.quickActions.viewApplications'),
      description: t('recruiterDashboard.quickActions.viewApplicationsDescription'),
      icon: EyeIcon,
      bgColor: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      action: () => navigate('/applicants'),
    },
  ]

  // Show loading state
  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4'></div>
          <p className='text-gray-600 text-lg'>{t('recruiterDashboard.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='min-w-0'>
          <h1 className='text-2xl font-bold text-gray-900'>{t('common.nav.dashboard')}</h1>
          <p className='text-sm text-gray-600 mt-1'>{t('recruiterDashboard.welcome')}</p>
        </div>
        <div className='text-sm text-gray-500 sm:shrink-0'>
          {t('recruiterDashboard.lastUpdated', { date: new Date().toLocaleDateString(dateLocale('en-US'), { month: 'short', day: 'numeric', year: 'numeric' }) })}
        </div>
      </div>

      {/* KPI Cards - 6 Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
        {kpiData.map((kpi) => {
          const Icon = kpi.icon
          const isIncrease = kpi.changeType === 'increase'

          return (
            <Card key={kpi.nameKey} className='hover:shadow-lg transition-shadow duration-200'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <p className='text-xs font-medium text-gray-600 uppercase tracking-wide'>{t(kpi.nameKey)}</p>
                  <div className='mt-2 flex items-baseline gap-2'>
                    <p className='text-2xl font-bold text-gray-900'>{kpi.value}</p>
                    <div className={`flex items-center text-xs font-semibold ${
                      isIncrease ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isIncrease ? (
                        <ArrowUpIcon className='h-3 w-3 mr-0.5' />
                      ) : (
                        <ArrowDownIcon className='h-3 w-3 mr-0.5' />
                      )}
                      {kpi.trend}
                    </div>
                  </div>
                  <p className='text-xs text-gray-500 mt-1'>{t('recruiterDashboard.kpi.thisMonth', { change: kpi.change })}</p>
                </div>
                <div className={`${kpi.bgColor} p-2.5 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions Panel */}
      <Card>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900'>{t('recruiterDashboard.quickActions.title')}</h3>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.title}
                onClick={action.action}
                className={`${action.bgColor} ${action.hoverColor} text-white rounded-xl p-5 text-left transition-all duration-200 hover:scale-105 hover:shadow-lg group`}>
                <div className='flex items-start gap-4'>
                  <div className='bg-white bg-opacity-20 p-3 rounded-lg group-hover:bg-opacity-30 transition-all'>
                    <Icon className='h-6 w-6' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-base'>{action.title}</h4>
                    <p className='text-sm text-white text-opacity-90 mt-1'>{action.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Project-wise casting */}
      <ProjectCastingReport />

      {/* Charts Row */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Applications Trend - Line Chart */}
        <Card className='lg:col-span-2'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>{t('recruiterDashboard.trend.title')}</h3>
              <p className='text-sm text-gray-500 mt-1'>{t('recruiterDashboard.trend.subtitle')}</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis dataKey='month' stroke='#9ca3af' fontSize={12} />
                <YAxis stroke='#9ca3af' fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type='monotone'
                  dataKey='applications'
                  stroke='#A855F7'
                  strokeWidth={3}
                  dot={{ fill: '#A855F7', r: 4 }}
                  activeDot={{ r: 6 }}
                  name={t('recruiterDashboard.trend.applications')}
                />
                <Line
                  type='monotone'
                  dataKey='interviews'
                  stroke='#F59E0B'
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', r: 4 }}
                  activeDot={{ r: 6 }}
                  name={t('recruiterDashboard.trend.interviews')}
                />
                <Line
                  type='monotone'
                  dataKey='hires'
                  stroke='#10B981'
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name={t('recruiterDashboard.trend.hires')}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Application Status - Donut Chart */}
        <Card>
          <div className='mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>{t('recruiterDashboard.status.title')}</h3>
            <p className='text-sm text-gray-500 mt-1'>{t('recruiterDashboard.status.subtitle')}</p>
          </div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData.map((item: any) => ({ ...item, name: tEnum(item.name) }))}
                  cx='50%'
                  cy='50%'
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey='value'>
                  {statusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className='grid grid-cols-2 gap-2 mt-4'>
            {statusData.map((item: any) => (
              <div key={item.name} className='flex items-center gap-2'>
                <div className='h-3 w-3 rounded-full' style={{ backgroundColor: item.color }}></div>
                <div className='flex-1'>
                  <p className='text-xs font-medium text-gray-700'>{tEnum(item.name)}</p>
                  <p className='text-xs text-gray-500'>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Interview Outcomes Bar Chart */}
      <Card>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>{t('recruiterDashboard.outcomes.title')}</h3>
            <p className='text-sm text-gray-500 mt-1'>{t('recruiterDashboard.outcomes.subtitle')}</p>
          </div>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={outcomesData.map((item: any) => ({ ...item, outcomeLabel: tEnum(item.outcome) }))} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis dataKey='outcomeLabel' stroke='#9ca3af' fontSize={12} />
              <YAxis stroke='#9ca3af' fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar dataKey='count' name={t('recruiterDashboard.outcomes.count')} radius={[8, 8, 0, 0]} maxBarSize={80}>
                {outcomesData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Latest Applicants Table */}
      <Card>
        <div className='flex items-center justify-between mb-6 px-6 pt-4'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>{t('recruiterDashboard.latest.title')}</h3>
            <p className='text-sm text-gray-500 mt-1'>{t('recruiterDashboard.latest.subtitle')}</p>
          </div>
          <button
            onClick={() => navigate('/applicants')}
            className='text-sm font-medium text-amber-600 hover:text-amber-700'>
            {t('recruiterDashboard.latest.viewAll')}
          </button>
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  {t('recruiterDashboard.latest.candidate')}
                </th>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  {t('recruiterDashboard.latest.jobRole')}
                </th>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  {t('common.labels.skills')}
                </th>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  {t('common.labels.status')}
                </th>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  {t('recruiterDashboard.latest.applied')}
                </th>
                <th scope='col' className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  {t('common.labels.actions')}
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {applicants.map((applicant) => (
                <tr key={applicant.id} className='hover:bg-gray-50 transition-colors'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 h-10 w-10'>
                        <img className='h-10 w-10 rounded-full object-cover ring-2 ring-gray-100' src={applicant.avatarUrl} alt='' />
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-semibold text-gray-900'>{applicant.name}</div>
                        <div className='text-xs text-gray-500'>{applicant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>{applicant.job}</div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex flex-wrap gap-1 max-w-xs'>
                      {applicant.skills.slice(0, 2).map((skill) => (
                        <span key={skill} className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700'>
                          {skill}
                        </span>
                      ))}
                      {applicant.skills.length > 2 && (
                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500'>
                          +{applicant.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <StatusBadge status={applicant.status} />
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-500'>{formatRelativeTime(applicant.appliedAt, t)}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right'>
                    <button
                      onClick={() => handleViewProfile(applicant)}
                      className='inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors'>
                      {t('common.actions.viewProfile')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
