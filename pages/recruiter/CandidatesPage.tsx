import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  getHireRequests,
  updateHireRequestStatus,
  withdrawHireRequest,
  sendReminderEmail,
  getHireRequestStats,
} from '@/services/hireRequestsService'
import {
  HireRequest,
  HireRequestStatus,
  HireRequestFilters,
  PagedHireRequestsResult,
  HireRequestStats,
} from '@/types'
import Icon from '@/components/Icon'
import UpdateStatusModal from '@/components/UpdateStatusModal'
import usePageParam from '@/hooks/usePageParam'

const CandidatesPage: React.FC = () => {
  const navigate = useNavigate()

  // State
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([])
  const [stats, setStats] = useState<HireRequestStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10,
  })

  // Filters (page kept in URL via usePageParam so refresh preserves position)
  const [pageParam, setPageParam] = usePageParam('page', 0)
  const [filters, setFilters] = useState<HireRequestFilters>({
    page: pageParam,
    size: 10,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<HireRequestStatus | ''>('')

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<HireRequest | null>(null)
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false)

  // Fetch hire requests
  const fetchHireRequests = async () => {
    try {
      setLoading(true)
      const result: PagedHireRequestsResult = await getHireRequests(filters)
      setHireRequests(result.items)
      setPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalElements: result.totalElements,
        size: result.size,
      })
    } catch (error) {
      console.error('Error fetching hire requests:', error)
      toast.error('Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const statsData = await getHireRequestStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchHireRequests()
    fetchStats()
  }, [filters])

  // Keep URL page param in sync with filters.page
  const goToPage = (next: number) => {
    setPageParam(next)
    setFilters((prev) => ({ ...prev, page: next }))
  }

  // Handle search
  const handleSearch = () => {
    setPageParam(0)
    setFilters({ ...filters, searchTerm, page: 0 })
  }

  // Handle status filter
  const handleStatusFilter = (status: HireRequestStatus | '') => {
    setStatusFilter(status)
    setPageParam(0)
    setFilters({ ...filters, status: status || undefined, page: 0 })
  }

  // Handle update status
  const handleUpdateStatus = async (status: HireRequestStatus, notes?: string) => {
    if (!selectedRequest) return

    try {
      await updateHireRequestStatus(selectedRequest.id, { status, notes })
      toast.success('Status updated successfully')
      setShowUpdateStatusModal(false)
      fetchHireRequests()
      fetchStats()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  // Handle withdraw request
  const handleWithdraw = async (id: number) => {
    if (!confirm('Are you sure you want to withdraw this hire request?')) return

    try {
      await withdrawHireRequest(id)
      toast.success('Hire request withdrawn')
      fetchHireRequests()
      fetchStats()
    } catch (error) {
      console.error('Error withdrawing request:', error)
      toast.error('Failed to withdraw request')
    }
  }

  // Handle send reminder
  const handleSendReminder = async (id: number) => {
    try {
      await sendReminderEmail(id)
      toast.success('Reminder email sent to artist')
      fetchHireRequests()
    } catch (error) {
      console.error('Error sending reminder:', error)
      toast.error('Failed to send reminder')
    }
  }

  // Handle view artist profile
  const handleViewProfile = (request: HireRequest) => {
    navigate('/artist-profile', {
      state: {
        artist: {
          id: request.artistId,
          name: request.artistName,
          email: request.artistEmail,
          avatarUrl: request.artistProfileUrl,
          category: request.artistCategory,
          skills: request.artistSkills || [],
          bio: '',
        },
      },
    })
  }

  // Status badge color
  const getStatusColor = (status: HireRequestStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-blue-100 text-blue-800'
      case 'VIEWED': return 'bg-purple-100 text-purple-800'
      case 'ACCEPTED': return 'bg-green-100 text-green-800'
      case 'DECLINED': return 'bg-red-100 text-red-800'
      case 'HIRED': return 'bg-amber-100 text-amber-800'
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-800'
      case 'EXPIRED': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
        <p className="text-gray-600 mt-1">Track all your hire requests and candidates</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Accepted</p>
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Declined</p>
            <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Acceptance Rate</p>
            <p className="text-2xl font-bold text-amber-600">{stats.acceptanceRate.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by artist name, job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
              >
                <Icon name="Search" size={20} />
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value as HireRequestStatus | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VIEWED">Viewed</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="DECLINED">Declined</option>
            <option value="HIRED">Hired</option>
            <option value="WITHDRAWN">Withdrawn</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email Sent
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading candidates...
                  </td>
                </tr>
              ) : hireRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No candidates found
                  </td>
                </tr>
              ) : (
                hireRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={request.artistProfileUrl || '/default-avatar.png'}
                          alt={request.artistName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.artistName}
                          </div>
                          <div className="text-sm text-gray-500">{request.artistCategory}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.jobTitle}</div>
                      <div className="text-sm text-gray-500">{request.jobType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.sentAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.emailSent ? (
                        <Icon name="CheckCircle" size={20} className="text-green-600" />
                      ) : (
                        <Icon name="XCircle" size={20} className="text-red-600" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewProfile(request)}
                          className="text-primary hover:text-primary-hover"
                          title="View Artist Profile"
                        >
                          <Icon name="Eye" size={18} />
                        </button>
                        {request.canEdit && (
                          <button
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowUpdateStatusModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Update Status"
                          >
                            <Icon name="Edit" size={18} />
                          </button>
                        )}
                        {request.canSendReminder && !request.reminderSent && (
                          <button
                            onClick={() => handleSendReminder(request.id)}
                            className="text-amber-600 hover:text-amber-900"
                            title="Send Reminder"
                          >
                            <Icon name="Bell" size={18} />
                          </button>
                        )}
                        {request.canWithdraw && (
                          <button
                            onClick={() => handleWithdraw(request.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Withdraw Request"
                          >
                            <Icon name="Trash" size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{pagination.currentPage * pagination.size + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min((pagination.currentPage + 1) * pagination.size, pagination.totalElements)}
                </span>{' '}
                of <span className="font-medium">{pagination.totalElements}</span> results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(filters.page! - 1)}
                  disabled={pagination.currentPage === 0}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(filters.page! + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages - 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {showUpdateStatusModal && selectedRequest && (
        <UpdateStatusModal
          isOpen={showUpdateStatusModal}
          onClose={() => setShowUpdateStatusModal(false)}
          onUpdate={handleUpdateStatus}
          currentStatus={selectedRequest.status}
          artistName={selectedRequest.artistName}
        />
      )}
    </div>
  )
}

export default CandidatesPage
