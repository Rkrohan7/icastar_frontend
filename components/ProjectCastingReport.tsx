import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from './Card'
import { ProjectCastingReport as Report } from '../types'
import recruiterProjectsService, {
  PROJECT_TYPE_LABELS,
  ROLE_TYPE_LABELS,
  artistPublicProfileUrl,
  mapSelectedArtist,
} from '../services/recruiterProjectsService'
import recruiterJobsService from '../services/recruiterJobsService'

// Builds the report from the recruiter's jobs when the report endpoint is not available.
const buildReportFromJobs = async (): Promise<Report[]> => {
  const page = await recruiterJobsService.listMyJobs({ page: 0, size: 200 })
  const byProject = new Map<number, Report>()
  page.items.forEach(job => {
    const projectId = job.projectId ?? job.project?.id
    if (!projectId) return
    let r = byProject.get(projectId)
    if (!r) {
      r = {
        projectId,
        projectName: job.projectName ?? job.project?.name ?? `Project #${projectId}`,
        projectType: job.projectType ?? job.project?.projectType,
        totalCharacters: 0,
        castCharacters: 0,
        openJobs: 0,
        totalJobs: 0,
        totalApplications: 0,
        hiredCount: 0,
        characters: [],
      }
      byProject.set(projectId, r)
    }
    const selectedArtists = (job.selectedArtists ?? []).map(mapSelectedArtist)
    r.totalJobs += 1
    r.totalApplications += job.applicationsCount ?? 0
    r.hiredCount += selectedArtists.length
    if (job.status === 'ACTIVE') r.openJobs += 1
    r.characters.push({
      characterId: job.characterId,
      characterName: job.characterName ?? job.title,
      roleType: job.roleType,
      jobId: job.id,
      jobStatus: job.status,
      applications: job.applicationsCount ?? 0,
      requiredCount: 1,
      selectedArtists,
    })
  })
  byProject.forEach(r => {
    r.totalCharacters = r.characters.length
    r.castCharacters = r.characters.filter(c => c.selectedArtists.length > 0).length
  })
  return Array.from(byProject.values())
}

export const ProjectCastingReport: React.FC = () => {
  const navigate = useNavigate()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    recruiterProjectsService
      .getCastingReport()
      .catch(() => buildReportFromJobs())
      .then(setReports)
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  const chartData = reports.map(r => ({
    project: r.projectName.length > 18 ? `${r.projectName.slice(0, 16)}…` : r.projectName,
    Cast: r.castCharacters,
    Pending: Math.max(r.totalCharacters - r.castCharacters, 0),
  }))

  const totals = reports.reduce(
    (acc, r) => ({
      projects: acc.projects + 1,
      characters: acc.characters + r.totalCharacters,
      cast: acc.cast + r.castCharacters,
      applications: acc.applications + r.totalApplications,
    }),
    { projects: 0, characters: 0, cast: 0, applications: 0 },
  )

  return (
    <Card>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>Project-wise Casting Report</h3>
          <p className='text-sm text-gray-500 mt-1'>How many characters are cast in each project</p>
        </div>
        <button
          onClick={() => navigate('/my-jobs')}
          className='text-sm font-medium text-amber-600 hover:text-amber-700'>
          Manage Projects →
        </button>
      </div>

      {loading ? (
        <p className='py-10 text-center text-sm text-gray-500'>Loading report...</p>
      ) : reports.length === 0 ? (
        <div className='py-10 text-center'>
          <p className='text-sm text-gray-500'>No project-wise jobs yet.</p>
          <button
            onClick={() => navigate('/my-jobs')}
            className='mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700'>
            Post a job for a project
          </button>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            {[
              ['Projects', totals.projects],
              ['Characters', totals.characters],
              ['Characters Cast', `${totals.cast}/${totals.characters}`],
              ['Applications', totals.applications],
            ].map(([label, val]) => (
              <div key={label} className='rounded-lg bg-gray-50 px-4 py-3'>
                <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>{label}</p>
                <p className='text-xl font-bold text-gray-900 mt-1'>{val}</p>
              </div>
            ))}
          </div>

          <div style={{ width: '100%', height: Math.max(160, reports.length * 44 + 60) }}>
            <ResponsiveContainer>
              <BarChart data={chartData} layout='vertical' margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' horizontal={false} />
                <XAxis type='number' allowDecimals={false} stroke='#9ca3af' fontSize={12} />
                <YAxis type='category' dataKey='project' stroke='#9ca3af' fontSize={12} width={120} />
                <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey='Cast' stackId='c' fill='#10B981' maxBarSize={24} />
                <Bar dataKey='Pending' stackId='c' fill='#E5E7EB' radius={[0, 6, 6, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className='overflow-x-auto mt-6'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  {['Project', 'Casting Progress', 'Open Jobs', 'Applications', 'Artists Selected', ''].map(h => (
                    <th key={h} className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {reports.map(r => {
                  const pct = r.totalCharacters ? Math.round((r.castCharacters / r.totalCharacters) * 100) : 0
                  const isOpen = expanded === r.projectId
                  return (
                    <React.Fragment key={r.projectId}>
                      <tr className='hover:bg-gray-50'>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          <div className='text-sm font-semibold text-gray-900'>{r.projectName}</div>
                          {r.projectType && (
                            <div className='text-xs text-gray-500'>{PROJECT_TYPE_LABELS[r.projectType] ?? r.projectType}</div>
                          )}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          <div className='flex items-center gap-2'>
                            <div className='w-28 h-2 rounded-full bg-gray-200 overflow-hidden'>
                              <div className='h-full bg-green-500' style={{ width: `${pct}%` }} />
                            </div>
                            <span className='text-xs text-gray-600'>{r.castCharacters}/{r.totalCharacters}</span>
                          </div>
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>{r.openJobs}</td>
                        <td className='px-4 py-3 text-sm text-gray-900'>{r.totalApplications}</td>
                        <td className='px-4 py-3 text-sm text-gray-900'>{r.hiredCount}</td>
                        <td className='px-4 py-3 text-right'>
                          <button
                            onClick={() => setExpanded(isOpen ? null : r.projectId)}
                            className='text-sm font-medium text-amber-600 hover:text-amber-700'>
                            {isOpen ? 'Hide' : 'Characters'}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={6} className='bg-gray-50 px-4 py-3'>
                            <ul className='divide-y divide-gray-200'>
                              {r.characters.map((c, i) => (
                                <li key={c.characterId ?? c.jobId ?? i} className='py-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm'>
                                  <span className='font-semibold text-gray-900 min-w-[10rem]'>{c.characterName}</span>
                                  <span className='text-gray-500 min-w-[6rem]'>
                                    {c.roleType ? ROLE_TYPE_LABELS[c.roleType] ?? c.roleType : '—'}
                                  </span>
                                  <span className='text-gray-500 min-w-[7rem]'>
                                    {c.jobId ? `${c.applications ?? 0} applications` : 'No job posted'}
                                  </span>
                                  <span className='flex flex-wrap gap-3'>
                                    {c.selectedArtists.length === 0 ? (
                                      <span className='text-xs italic text-gray-400'>Not cast yet</span>
                                    ) : (
                                      c.selectedArtists.map((a, i) => !a.userId ? (
                                        <span key={`guest-${i}`} className='font-medium text-gray-700'>{a.name}</span>
                                      ) : (
                                        <a
                                          key={a.userId}
                                          href={artistPublicProfileUrl(a.userId)}
                                          target='_blank'
                                          rel='noopener noreferrer'
                                          className='font-medium text-amber-700 hover:underline'>
                                          {a.name} ↗
                                        </a>
                                      ))
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  )
}

export default ProjectCastingReport
