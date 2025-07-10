'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface LeaveType {
  id: string
  name: string
  nameNl: string
  code: string
  color: string
  isPaid: boolean
  requiresApproval: boolean
  maxDaysPerYear?: number
  carryOverDays?: number
}

interface LeaveRequest {
  id: string
  startDate: string
  endDate: string
  daysRequested: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string
  reviewedAt?: string
  comments?: string
  employee: {
    firstName: string
    lastName: string
    employeeNumber: string
  }
  leaveType: {
    name: string
    nameNl: string
    color: string
    code: string
  }
  requestedByUser?: {
    name: string
    email: string
  }
  reviewedByUser?: {
    name: string
    email: string
  }
}

interface LeaveBalance {
  id: string
  year: number
  totalEntitled: number
  used: number
  pending: number
  available: number
  carriedOver: number
  employee: {
    firstName: string
    lastName: string
    employeeNumber: string
  }
  leaveType: {
    name: string
    nameNl: string
    color: string
    code: string
  }
}

export default function LeaveManagementPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'balances' | 'types'>('requests')
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock company ID - in real app this would come from auth context
  const companyId = "cm123456789"

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (activeTab === 'requests') {
        const response = await fetch(`/api/leave-requests?companyId=${companyId}`)
        if (response.ok) {
          const data = await response.json()
          setLeaveRequests(data)
        }
      } else if (activeTab === 'balances') {
        const response = await fetch(`/api/leave-balances?companyId=${companyId}`)
        if (response.ok) {
          const data = await response.json()
          setLeaveBalances(data)
        }
      } else if (activeTab === 'types') {
        const response = await fetch(`/api/leave-types?companyId=${companyId}`)
        if (response.ok) {
          const data = await response.json()
          setLeaveTypes(data)
        }
      }
    } catch (err) {
      setError('Failed to fetch data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: string, action: 'approve' | 'reject', comments?: string) => {
    try {
      const response = await fetch(`/api/leave-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          reviewedBy: 'current-user-id', // In real app, get from auth
          comments
        })
      })

      if (response.ok) {
        fetchData() // Refresh the data
      } else {
        setError('Failed to process request')
      }
    } catch (err) {
      setError('Failed to process request')
      console.error('Error processing request:', err)
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600">Manage leave requests, balances and leave types</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            + New Leave Request
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leave Requests
            </button>
            <button
              onClick={() => setActiveTab('balances')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'balances'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leave Balances
            </button>
            <button
              onClick={() => setActiveTab('types')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'types'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leave Types
            </button>
          </nav>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Leave Requests Tab */}
            {activeTab === 'requests' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Leave Requests</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Werknemer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Periode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dagen
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acties
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaveRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {request.employee.firstName} {request.employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              #{request.employee.employeeNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: request.leaveType.color }}
                              ></div>
                              <span className="text-sm text-gray-900">
                                {request.leaveType.nameNl || request.leaveType.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {request.daysRequested}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadge(request.status)}>
                              {request.status === 'pending' ? 'In behandeling' :
                               request.status === 'approved' ? 'Goedgekeurd' : 'Afgewezen'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {request.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleApproveRequest(request.id, 'approve')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Goedkeuren
                                </button>
                                <button
                                  onClick={() => handleApproveRequest(request.id, 'reject')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Afwijzen
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {leaveRequests.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                            No leave requests found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Leave Balances Tab */}
            {activeTab === 'balances' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Leave Balances</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Werknemer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Toegewezen
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gebruikt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Beschikbaar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Meegenomen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaveBalances.map((balance) => (
                        <tr key={balance.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {balance.employee.firstName} {balance.employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              #{balance.employee.employeeNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: balance.leaveType.color }}
                              ></div>
                              <span className="text-sm text-gray-900">
                                {balance.leaveType.nameNl || balance.leaveType.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {balance.totalEntitled}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {balance.used}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={balance.available < 5 ? 'text-red-600 font-medium' : ''}>
                              {balance.available}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {balance.carriedOver}
                          </td>
                        </tr>
                      ))}
                      {leaveBalances.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                            No leave balances found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Leave Types Tab */}
            {activeTab === 'types' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Leave Types</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Naam
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Max Dagen/Jaar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Betaald
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Goedkeuring Vereist
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaveTypes.map((type) => (
                        <tr key={type.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: type.color }}
                              ></div>
                              <span className="text-sm font-medium text-gray-900">
                                {type.nameNl || type.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {type.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {type.maxDaysPerYear || 'Onbeperkt'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              type.isPaid 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {type.isPaid ? 'Ja' : 'Nee'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              type.requiresApproval 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {type.requiresApproval ? 'Ja' : 'Nee'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {leaveTypes.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            No leave types found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

