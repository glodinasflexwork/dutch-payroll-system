"use client"

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  Clock,
  Users,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  FileText,
  Settings,
  BarChart3,
  CalendarDays,
  UserCheck,
  Timer,
  Award,
  Building2,
  Zap,
  Target,
  PieChart
} from "lucide-react"

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
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />In behandeling</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Goedgekeurd</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Afgewezen</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate overview stats
  const overviewStats = {
    totalRequests: leaveRequests.length,
    pendingRequests: leaveRequests.filter(r => r.status === 'pending').length,
    approvedRequests: leaveRequests.filter(r => r.status === 'approved').length,
    totalLeaveTypes: leaveTypes.length,
    totalDaysRequested: leaveRequests.reduce((sum, r) => sum + r.daysRequested, 0),
    averageLeaveDays: leaveBalances.length > 0 ? leaveBalances.reduce((sum, b) => sum + b.used, 0) / leaveBalances.length : 0
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Action Buttons */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Leave Overview</h2>
            <p className="text-gray-600 mt-1">Comprehensive leave management and team insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Leave Request
            </Button>
          </div>
        </div>

        {/* Professional Stats Cards - Blue Gradient Variations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Requests</p>
                  <p className="text-3xl font-bold text-blue-800">{overviewStats.totalRequests}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    All time
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Pending Approval</p>
                  <p className="text-3xl font-bold text-blue-800">{overviewStats.pendingRequests}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Needs review
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-700 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Approved Requests</p>
                  <p className="text-3xl font-bold text-blue-800">{overviewStats.approvedRequests}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    This period
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <UserCheck className="w-6 h-6 text-blue-800" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-800 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Leave Types</p>
                  <p className="text-3xl font-bold text-blue-800">{overviewStats.totalLeaveTypes}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    <Settings className="w-4 h-4 inline mr-1" />
                    Configured
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Award className="w-6 h-6 text-blue-900" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Leave Management</CardTitle>
                <CardDescription className="text-lg">
                  Manage all aspects of employee leave and time off
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800 px-3 py-1">
                {activeTab === 'requests' ? `${leaveRequests.length} requests` :
                 activeTab === 'balances' ? `${leaveBalances.length} balances` :
                 `${leaveTypes.length} types`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Enhanced Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`py-3 px-1 border-b-2 font-medium text-lg flex items-center space-x-2 ${
                    activeTab === 'requests'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Leave Requests</span>
                  {overviewStats.pendingRequests > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      {overviewStats.pendingRequests}
                    </Badge>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('balances')}
                  className={`py-3 px-1 border-b-2 font-medium text-lg flex items-center space-x-2 ${
                    activeTab === 'balances'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Leave Balances</span>
                </button>
                <button
                  onClick={() => setActiveTab('types')}
                  className={`py-3 px-1 border-b-2 font-medium text-lg flex items-center space-x-2 ${
                    activeTab === 'types'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Leave Types</span>
                </button>
              </nav>
            </div>

            {/* Error Message */}
            {error && (
              <Card className="border-red-200 bg-red-50 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center text-red-700">
                    <XCircle className="w-5 h-5 mr-2" />
                    {error}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading leave data...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Leave Requests Tab */}
                {activeTab === 'requests' && (
                  <div className="space-y-4">
                    {leaveRequests.length === 0 ? (
                      <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-r from-green-50 to-blue-50">
                        <CardContent className="p-12">
                          <div className="bg-green-100 p-6 rounded-full w-24 h-24 mx-auto mb-6">
                            <Calendar className="w-12 h-12 text-green-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Managing Leave</h3>
                          <p className="text-gray-600 mb-6 text-lg">Set up your leave policies and start processing employee leave requests</p>
                          <div className="space-y-4">
                            <Button className="bg-gradient-to-r from-green-500 to-green-600 text-white text-lg px-8 py-3">
                              <Plus className="w-5 h-5 mr-2" />
                              Create First Leave Request
                            </Button>
                            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                Easy approval workflow
                              </div>
                              <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                Automated calculations
                              </div>
                              <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                Dutch compliance
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {leaveRequests.map((request) => (
                          <Card key={request.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  {/* Employee Avatar */}
                                  <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full">
                                    <span className="text-white font-bold text-xl">
                                      {request.employee.firstName[0]}{request.employee.lastName[0]}
                                    </span>
                                  </div>
                                  
                                  {/* Request Info */}
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <h3 className="font-bold text-xl text-gray-900">
                                        {request.employee.firstName} {request.employee.lastName}
                                      </h3>
                                      {getStatusBadge(request.status)}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                      <div className="flex items-center text-gray-600">
                                        <div
                                          className="w-3 h-3 rounded-full mr-2"
                                          style={{ backgroundColor: request.leaveType.color }}
                                        ></div>
                                        {request.leaveType.nameNl || request.leaveType.name}
                                      </div>
                                      <div className="flex items-center text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                      </div>
                                      <div className="flex items-center text-gray-600">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {request.daysRequested} dagen
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2">
                                  {request.status === 'pending' && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => handleApproveRequest(request.id, 'approve')}
                                        className="bg-green-500 hover:bg-green-600 text-white"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Goedkeuren
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleApproveRequest(request.id, 'reject')}
                                        className="border-red-300 text-red-600 hover:bg-red-50"
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Afwijzen
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Leave Balances Tab */}
                {activeTab === 'balances' && (
                  <div className="space-y-4">
                    {leaveBalances.length === 0 ? (
                      <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-r from-blue-50 to-purple-50">
                        <CardContent className="p-12">
                          <div className="bg-blue-100 p-6 rounded-full w-24 h-24 mx-auto mb-6">
                            <BarChart3 className="w-12 h-12 text-blue-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">Track Leave Balances</h3>
                          <p className="text-gray-600 mb-6 text-lg">Monitor employee leave entitlements and usage across your organization</p>
                          <div className="space-y-4">
                            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg px-8 py-3">
                              <PieChart className="w-5 h-5 mr-2" />
                              Set Up Leave Balances
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {leaveBalances.map((balance) => (
                          <Card key={balance.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full">
                                    <span className="text-white font-bold text-xl">
                                      {balance.employee.firstName[0]}{balance.employee.lastName[0]}
                                    </span>
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <h3 className="font-bold text-xl text-gray-900">
                                        {balance.employee.firstName} {balance.employee.lastName}
                                      </h3>
                                      <div className="flex items-center">
                                        <div
                                          className="w-3 h-3 rounded-full mr-2"
                                          style={{ backgroundColor: balance.leaveType.color }}
                                        ></div>
                                        <span className="text-sm text-gray-600">
                                          {balance.leaveType.nameNl || balance.leaveType.name}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">{balance.totalEntitled}</p>
                                        <p className="text-gray-600">Toegewezen</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-2xl font-bold text-orange-600">{balance.used}</p>
                                        <p className="text-gray-600">Gebruikt</p>
                                      </div>
                                      <div className="text-center">
                                        <p className={`text-2xl font-bold ${balance.available < 5 ? 'text-red-600' : 'text-green-600'}`}>
                                          {balance.available}
                                        </p>
                                        <p className="text-gray-600">Beschikbaar</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">{balance.carriedOver}</p>
                                        <p className="text-gray-600">Meegenomen</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Leave Types Tab */}
                {activeTab === 'types' && (
                  <div className="space-y-4">
                    {leaveTypes.length === 0 ? (
                      <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-r from-purple-50 to-pink-50">
                        <CardContent className="p-12">
                          <div className="bg-purple-100 p-6 rounded-full w-24 h-24 mx-auto mb-6">
                            <Settings className="w-12 h-12 text-purple-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">Configure Leave Types</h3>
                          <p className="text-gray-600 mb-6 text-lg">Set up different types of leave for your organization (vacation, sick, personal, etc.)</p>
                          <div className="space-y-4">
                            <Button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-lg px-8 py-3">
                              <Plus className="w-5 h-5 mr-2" />
                              Add Leave Types
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leaveTypes.map((type) => (
                          <Card key={type.id} className="hover:shadow-lg transition-all duration-300 border-l-4" style={{borderLeftColor: type.color}}>
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-3 mb-4">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: type.color }}
                                ></div>
                                <h3 className="font-bold text-lg text-gray-900">
                                  {type.nameNl || type.name}
                                </h3>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Code:</span>
                                  <Badge variant="outline">{type.code}</Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Max dagen/jaar:</span>
                                  <span className="font-medium">{type.maxDaysPerYear || 'Onbeperkt'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Betaald:</span>
                                  <Badge className={type.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {type.isPaid ? 'Ja' : 'Nee'}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Goedkeuring:</span>
                                  <Badge className={type.requiresApproval ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
                                    {type.requiresApproval ? 'Vereist' : 'Niet vereist'}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Actions</h3>
                <p className="text-gray-600">Common leave management tasks</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" className="hover:bg-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Leave Calendar
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-white">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Leave Reports
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Leave Policies
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

