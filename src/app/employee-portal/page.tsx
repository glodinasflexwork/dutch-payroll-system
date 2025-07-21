'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  User, 
  Building2,
  CheckCircle,
  AlertCircle,
  Eye,
  Plus,
  BarChart3,
  HelpCircle,
  LogOut,
  Search,
  Upload,
  Trash2,
  Shield,
  AlertTriangle,
  FileCheck,
  Grid3X3,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Users,
  Calculator,
  Settings,
  CreditCard,
  Play,
  Menu,
  X
} from 'lucide-react'

interface PortalData {
  success: boolean
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string
    position: string
    department: string
    contractType: string
    workingHours: number
  }
  contracts: Array<{
    id: string
    title: string
    contractType: string
    fileName: string
    status: string
    signedAt?: string
    createdAt: string
  }>
  leaveRequests: Array<{
    id: string
    startDate: string
    endDate: string
    days: number
    reason: string
    status: string
    createdAt: string
    LeaveType: { name: string; code: string }
  }>
  timeEntries: Array<{
    id: string
    date: string
    hoursWorked: number
    description: string | null
    projectCode: string | null
    isApproved: boolean
    createdAt: string
  }>
  payslips: Array<{
    id: string
    fileName: string
    status: string
    createdAt: string
    PayrollRecord: {
      period: string
      netSalary: number
      grossSalary: number
    }
  }>
  leaveTypes: Array<{
    id: string
    name: string
    code: string
    description: string
    isPaid: boolean
    maxDaysPerYear: number | null
  }>
}

export default function EmployeePortal() {
  const [data, setData] = useState<PortalData | null>(null)
  const [documents, setDocuments] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState("overview")
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(["overview"])
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [newExpense, setNewExpense] = useState({
    expenseType: "HOTEL",
    amount: "",
    currency: "EUR",
    expenseDate: "",
    description: "",
    receiptFile: null as File | null
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Mock employee ID - in real implementation, this would come from authentication
  const employeeId = 'mock-employee-id'

  // Mock expense data
  const mockExpenses = [
    {
      id: "exp-001",
      employeeId: "mock-employee-id",
      expenseType: "HOTEL",
      amount: 150.00,
      currency: "EUR",
      expenseDate: "2024-07-15",
      description: "Hotel stay for client meeting in Amsterdam",
      receiptUrl: "/mock-receipts/hotel-receipt-001.pdf",
      receiptFilename: "hotel-receipt-amsterdam.pdf",
      status: "APPROVED",
      submissionDate: "2024-07-16T09:00:00Z",
      approvalDate: "2024-07-18T14:30:00Z",
      approverComments: "Approved - valid business expense"
    },
    {
      id: "exp-002",
      employeeId: "mock-employee-id",
      expenseType: "UBER",
      amount: 25.50,
      currency: "EUR",
      expenseDate: "2024-07-10",
      description: "Uber ride to client office",
      receiptUrl: "/mock-receipts/uber-receipt-002.pdf",
      receiptFilename: "uber-receipt-july10.pdf",
      status: "PENDING",
      submissionDate: "2024-07-11T10:30:00Z",
      approvalDate: null,
      approverComments: null
    },
    {
      id: "exp-003",
      employeeId: "mock-employee-id",
      expenseType: "MEALS",
      amount: 45.75,
      currency: "EUR",
      expenseDate: "2024-07-08",
      description: "Business lunch with potential client",
      receiptUrl: "/mock-receipts/restaurant-receipt-003.pdf",
      receiptFilename: "restaurant-receipt-july8.pdf",
      status: "REJECTED",
      submissionDate: "2024-07-09T14:15:00Z",
      approvalDate: "2024-07-12T11:20:00Z",
      approverComments: "Receipt unclear - please resubmit with clearer image"
    },
    {
      id: "exp-004",
      employeeId: "mock-employee-id",
      expenseType: "OFFICE_SUPPLIES",
      amount: 89.99,
      currency: "EUR",
      expenseDate: "2024-07-05",
      description: "Ergonomic keyboard for home office setup",
      receiptUrl: "/mock-receipts/office-supplies-004.pdf",
      receiptFilename: "keyboard-receipt.pdf",
      status: "APPROVED",
      submissionDate: "2024-07-06T16:45:00Z",
      approvalDate: "2024-07-07T09:15:00Z",
      approverComments: "Approved - necessary for remote work"
    }
  ]

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  useEffect(() => {
    fetchPortalData()
    fetchDocuments()
    // Initialize expenses with mock data
    setExpenses(mockExpenses)
  }, [])

  const fetchPortalData = async () => {
    try {
      const response = await fetch(`/api/employee-portal-demo?employeeId=${employeeId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch portal data')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/employee-portal-demo/documents?employeeId=${employeeId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      const result = await response.json()
      setDocuments(result)
    } catch (err) {
      console.error('Error fetching documents:', err)
    }
  }

  const downloadPayslip = async (payslipId: string, fileName: string) => {
    try {
      // Mock download - in real implementation, this would download the actual file
      alert(`Downloading ${fileName}...`)
    } catch (err) {
      alert('Failed to download payslip')
    }
  }

  const viewContract = async (contractId: string, fileName: string) => {
    try {
      // Mock view - in real implementation, this would open the contract
      alert(`Opening ${fileName}...`)
    } catch (err) {
      alert('Failed to open contract')
    }
  }

  const handleDocumentUpload = async (file: File, documentType: string, notes?: string) => {
    setUploadingDocument(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)
      if (notes) formData.append('notes', notes)

      const response = await fetch(`/api/employee-portal-demo/documents?employeeId=${employeeId}`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      const result = await response.json()
      alert(`Document uploaded successfully: ${result.document.originalName}`)
      
      // Refresh documents
      await fetchDocuments()
    } catch (err) {
      alert('Failed to upload document: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setUploadingDocument(false)
    }
  }

  const downloadDocument = async (documentId: string, fileName: string) => {
    try {
      // Mock download - in real implementation, this would download the actual file
      alert(`Downloading ${fileName}...`)
    } catch (err) {
      alert('Failed to download document')
    }
  }

  const deleteDocument = async (documentId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/employee-portal-demo/documents?documentId=${documentId}&employeeId=${employeeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      alert('Document deleted successfully')
      
      // Refresh documents
      await fetchDocuments()
    } catch (err) {
      alert('Failed to delete document: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  // Expense management functions
  const submitExpense = async (expenseData: any) => {
    try {
      // Mock expense submission - in real implementation, this would call an API
      const newExpense = {
        id: `exp-${Date.now()}`,
        employeeId: employeeId,
        ...expenseData,
        status: 'PENDING',
        submissionDate: new Date().toISOString(),
        approvalDate: null,
        approverComments: null
      }
      
      setExpenses(prev => [newExpense, ...prev])
      alert('Expense submitted successfully!')
      return newExpense
    } catch (err) {
      alert('Failed to submit expense: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const viewExpenseDetails = (expenseId: string) => {
    const expense = expenses.find(exp => exp.id === expenseId)
    if (expense) {
      alert(`Expense Details:\n\nType: ${expense.expenseType}\nAmount: €${expense.amount}\nDate: ${expense.expenseDate}\nDescription: ${expense.description}\nStatus: ${expense.status}${expense.approverComments ? '\nComments: ' + expense.approverComments : ''}`)
    }
  }

  const downloadReceipt = (expenseId: string, filename: string) => {
    // Mock receipt download - in real implementation, this would download the actual file
    alert(`Downloading receipt: ${filename}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <div className="animate-pulse bg-gray-200 h-6 w-24 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="flex-1">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
          </div>
          <div className="p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-center text-gray-600 mt-4">Loading your portal...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchPortalData} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  const sidebarItems = [
    {
      id: 'tutorial',
      label: 'Start Tutorial',
      description: 'Learn SalarySync step by step',
      icon: Play,
      type: 'single' as const,
      action: () => alert('Tutorial coming soon!')
    },
    {
      id: 'overview',
      label: 'Overview & Insights',
      description: 'Monitoring and business intelligence',
      icon: TrendingUp,
      type: 'category' as const,
      items: [
        { id: 'dashboard', label: 'Dashboard', description: 'Overview and analytics', icon: Grid3X3 }
      ]
    },
    {
      id: 'personal',
      label: 'People Management',
      description: 'Workforce and HR management',
      icon: Users,
      type: 'category' as const,
      items: [
        { id: 'payslips', label: 'Payslips', description: 'View and download payslips', icon: FileText },
        { id: 'documents', label: 'Manage required documents', icon: FileCheck },
        { id: 'leave', label: 'Leave Management', description: 'Leave requests and balances', icon: Calendar }
      ]
    },
    {
      id: 'time',
      label: 'Time Management',
      description: 'Time tracking and attendance',
      icon: Clock,
      type: 'category' as const,
      items: [
        { id: 'timetracking', label: 'Time Tracking', description: 'Log your working hours', icon: Clock }
      ]
    },
    {
      id: 'finances',
      label: 'My Finances',
      description: 'Manage expenses and refunds',
      icon: CreditCard,
      type: 'category' as const,
      items: [
        { id: 'expenses', label: 'Expenses & Refunds', description: 'Submit and track expenses', icon: CreditCard }
      ]
    }
  ]

  const renderOverviewContent = () => {
    const currentDate = new Date()
    const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const approvedLeaveRequests = data.leaveRequests.filter(req => req.status === 'approved').length
    const pendingTimeEntries = data.timeEntries.filter(entry => !entry.isApproved).length
    const latestPayslip = data.payslips[0]
    
    return (
      <div className="space-y-8">
        {/* Enhanced Welcome Banner */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Welcome back, {data.employee.firstName}!</h1>
                <p className="text-blue-100 text-lg">Here's your overview for {currentMonth}</p>
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Active Employee</span>
                  </div>
                  <div className="text-sm text-blue-100">
                    {data.employee.position} • {data.employee.department}
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <BarChart3 className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-800" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-blue-900">{data.payslips.length}</p>
                  <p className="text-sm font-medium text-blue-700">Available Payslips</p>
                  {latestPayslip && (
                    <p className="text-xs text-blue-600">Latest: €{latestPayslip.PayrollRecord.netSalary.toFixed(2)}</p>
                  )}
                </div>
                <div className="p-3 bg-blue-600 rounded-xl">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-green-900 capitalize">{data.employee.contractType}</p>
                  <p className="text-sm font-medium text-green-700">Contract Type</p>
                  <p className="text-xs text-green-600">{data.contracts.length} total contracts</p>
                </div>
                <div className="p-3 bg-green-600 rounded-xl">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-purple-900">{approvedLeaveRequests}</p>
                  <p className="text-sm font-medium text-purple-700">Approved Leave</p>
                  <p className="text-xs text-purple-600">{data.leaveRequests.length} total requests</p>
                </div>
                <div className="p-3 bg-purple-600 rounded-xl">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-orange-900">{data.timeEntries.length}</p>
                  <p className="text-sm font-medium text-orange-700">Time Entries</p>
                  <p className="text-xs text-orange-600">{pendingTimeEntries} pending approval</p>
                </div>
                <div className="p-3 bg-orange-600 rounded-xl">
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-blue-600" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>Common tasks you might want to perform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/employee-portal/leave'}
                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Request New Leave
              </Button>
              <Button 
                onClick={() => window.location.href = '/employee-portal/time'}
                variant="outline"
                className="w-full justify-start border-blue-200 hover:bg-blue-50"
              >
                <Clock className="h-4 w-4 mr-2" />
                Log Time Entry
              </Button>
              <Button 
                onClick={() => setActiveSection('documents')}
                variant="outline"
                className="w-full justify-start border-blue-200 hover:bg-blue-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-green-600" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.payslips.slice(0, 2).map((payslip, index) => (
                <div key={payslip.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Payslip for {payslip.PayrollRecord.period}
                    </p>
                    <p className="text-xs text-gray-500">
                      €{payslip.PayrollRecord.netSalary.toFixed(2)} • {new Date(payslip.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {data.leaveRequests.slice(0, 1).map((request) => (
                <div key={request.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Leave request {request.status}
                    </p>
                    <p className="text-xs text-gray-500">
                      {request.days} days • {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Profile Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Your Profile</span>
            </CardTitle>
            <CardDescription>Personal information and employment details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">{data.employee.firstName} {data.employee.lastName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Position</p>
                <p className="text-lg font-semibold text-gray-900">{data.employee.position}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Department</p>
                <p className="text-lg font-semibold text-gray-900">{data.employee.department}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Working Hours</p>
                <p className="text-lg font-semibold text-gray-900">{data.employee.workingHours}h/week</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="text-base text-gray-900">{data.employee.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Contract Type</p>
                  <Badge variant="outline" className="text-sm">
                    {data.employee.contractType}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Employee ID</p>
                  <p className="text-base font-mono text-gray-900">{data.employee.id.slice(0, 8)}...</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderPayslipsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payslips</h2>
          <p className="text-gray-600">Secure access to current and historical payslips anytime, anywhere</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            {data.payslips.map((payslip, index) => (
              <div key={payslip.id} className={`flex items-center justify-between p-6 ${index !== data.payslips.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <div className="flex items-center space-x-4">
                  <FileText className="h-10 w-10 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{payslip.fileName}</p>
                    <p className="text-sm text-gray-500">
                      {payslip.PayrollRecord.period} • €{payslip.PayrollRecord.netSalary.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => downloadPayslip(payslip.id, payslip.fileName)}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderLeaveContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
          <p className="text-gray-600">Request time off, track balances, and manage approvals seamlessly</p>
        </div>
        <Button 
          onClick={() => window.location.href = '/employee-portal/leave'}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Request New Leave
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {data.leaveRequests.map((request, index) => (
              <div key={request.id} className={`flex items-center justify-between p-6 ${index !== data.leaveRequests.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <div className="flex items-center space-x-4">
                  <Calendar className="h-10 w-10 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {request.days} days • {request.reason}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={request.status === 'approved' ? 'default' : 'secondary'}
                  className={request.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500'}
                >
                  {request.status === 'approved' ? 'Approved' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTimeTrackingContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Time Tracking</h2>
          <p className="text-gray-600">Log your hours and track your time for accurate payroll processing</p>
        </div>
        <Button 
          onClick={() => window.location.href = '/employee-portal/time'}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Time Entry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {data.timeEntries.slice(0, 5).map((entry, index) => (
              <div key={entry.id} className={`flex items-center justify-between p-6 ${index !== Math.min(data.timeEntries.length, 5) - 1 ? 'border-b border-gray-200' : ''}`}>
                <div className="flex items-center space-x-4">
                  <Clock className="h-10 w-10 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(entry.date).toLocaleDateString()} - {entry.hoursWorked}h
                    </p>
                    <p className="text-sm text-gray-500">
                      {entry.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {entry.isApproved ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderExpensesContent = () => {

    const expenseTypes = [
      { value: 'HOTEL', label: 'Hotel' },
      { value: 'UBER', label: 'Uber/Taxi' },
      { value: 'MEALS', label: 'Meals' },
      { value: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
      { value: 'OTHER', label: 'Other' }
    ]

    const handleSubmitExpense = async (e: React.FormEvent) => {
      e.preventDefault()
      
      if (!newExpense.amount || !newExpense.expenseDate || !newExpense.description) {
        alert("Please fill in all required fields")
        return
      }

      const expenseData = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        receiptUrl: newExpense.receiptFile ? `/mock-receipts/${newExpense.receiptFile.name}` : null,
        receiptFilename: newExpense.receiptFile?.name || null
      }

      await submitExpense(expenseData)
      
      // Reset form
      setNewExpense({
        expenseType: "HOTEL",
        amount: "",
        currency: "EUR",
        expenseDate: "",
        description: "",
        receiptFile: null
      })
      setShowSubmitForm(false)
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'APPROVED': return 'bg-green-600 hover:bg-green-700'
        case 'REJECTED': return 'bg-red-600 hover:bg-red-700'
        case 'PENDING': return 'bg-yellow-600 hover:bg-yellow-700'
        default: return 'bg-gray-500'
      }
    }

    const getExpenseTypeIcon = (type: string) => {
      switch (type) {
        case 'HOTEL': return Building2
        case 'UBER': return Calculator
        case 'MEALS': return User
        case 'OFFICE_SUPPLIES': return Settings
        default: return CreditCard
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Expenses & Refunds</h2>
            <p className="text-gray-600">Submit and track your business expenses for reimbursement</p>
          </div>
          <Button 
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showSubmitForm ? 'Cancel' : 'Submit Expense'}
          </Button>
        </div>

        {/* Submit Expense Form */}
        {showSubmitForm && (
          <Card>
            <CardHeader>
              <CardTitle>Submit New Expense</CardTitle>
              <CardDescription>Fill in the details of your business expense</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitExpense} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expense Type *
                    </label>
                    <select
                      value={newExpense.expenseType}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, expenseType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {expenseTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newExpense.expenseDate}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, expenseDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount *
                    </label>
                    <div className="flex">
                      <select
                        value={newExpense.currency}
                        onChange={(e) => setNewExpense(prev => ({ ...prev, currency: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Receipt
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setNewExpense(prev => ({ ...prev, receiptFile: e.target.files?.[0] || null }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newExpense.description}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe the business purpose of this expense..."
                    required
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Submit Expense
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowSubmitForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Expense Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-blue-900">{expenses.length}</p>
                  <p className="text-sm font-medium text-blue-700">Total Expenses</p>
                </div>
                <div className="p-3 bg-blue-600 rounded-xl">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-green-900">
                    {expenses.filter(exp => exp.status === 'APPROVED').length}
                  </p>
                  <p className="text-sm font-medium text-green-700">Approved</p>
                </div>
                <div className="p-3 bg-green-600 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-yellow-900">
                    {expenses.filter(exp => exp.status === 'PENDING').length}
                  </p>
                  <p className="text-sm font-medium text-yellow-700">Pending</p>
                </div>
                <div className="p-3 bg-yellow-600 rounded-xl">
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Expenses</CardTitle>
            <CardDescription>Track the status of your submitted expenses</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {expenses.map((expense, index) => {
                const ExpenseIcon = getExpenseTypeIcon(expense.expenseType)
                return (
                  <div key={expense.id} className={`flex items-center justify-between p-6 ${index !== expenses.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ExpenseIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {expense.expenseType.replace('_', ' ')} - €{expense.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(expense.expenseDate).toLocaleDateString()} • {expense.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          Submitted: {new Date(expense.submissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="default"
                        className={getStatusColor(expense.status)}
                      >
                        {expense.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => viewExpenseDetails(expense.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {expense.receiptFilename && (
                          <Button
                            onClick={() => downloadReceipt(expense.id, expense.receiptFilename)}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderDocumentsContent = () => {
    if (!documents) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
              <p className="text-gray-600">Manage your required employment documents</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading documents...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
            <p className="text-gray-600">Manage your required employment documents for Dutch payroll compliance</p>
          </div>
        </div>

        {/* Compliance Status */}
        <Card className={`border-l-4 ${documents.complianceStatus.isCompliant ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              {documents.complianceStatus.isCompliant ? (
                <Shield className="h-8 w-8 text-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <h3 className={`font-semibold ${documents.complianceStatus.isCompliant ? 'text-green-800' : 'text-red-800'}`}>
                  {documents.complianceStatus.isCompliant ? 'Payroll Compliance Complete' : 'Action Required'}
                </h3>
                <p className={`text-sm ${documents.complianceStatus.isCompliant ? 'text-green-700' : 'text-red-700'}`}>
                  {documents.complianceStatus.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Documents Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Required Documents for Dutch Employment</CardTitle>
            <CardDescription>
              These documents are mandatory for payroll processing under Dutch law
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {documents.complianceStatus.requiredDocuments.map((reqDoc: any, index: number) => {
                const existingDoc = documents.documents.find((d: any) => d.documentType === reqDoc.type)
                const isLast = index === documents.complianceStatus.requiredDocuments.length - 1
                
                return (
                  <div key={reqDoc.type} className={`p-6 ${!isLast ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          reqDoc.status === 'APPROVED' ? 'bg-green-100' :
                          reqDoc.status === 'PENDING' ? 'bg-yellow-100' :
                          reqDoc.status === 'REJECTED' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {reqDoc.status === 'APPROVED' ? (
                            <FileCheck className="h-6 w-6 text-green-600" />
                          ) : reqDoc.status === 'PENDING' ? (
                            <Clock className="h-6 w-6 text-yellow-600" />
                          ) : reqDoc.status === 'REJECTED' ? (
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                          ) : (
                            <FileText className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{reqDoc.name}</h4>
                          <p className="text-sm text-gray-500">{reqDoc.description}</p>
                          {existingDoc && (
                            <p className="text-xs text-gray-400 mt-1">
                              Uploaded: {new Date(existingDoc.uploadedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={reqDoc.status === 'APPROVED' ? 'default' : 'secondary'}
                          className={
                            reqDoc.status === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' :
                            reqDoc.status === 'PENDING' ? 'bg-yellow-600 hover:bg-yellow-700' :
                            reqDoc.status === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-500'
                          }
                        >
                          {reqDoc.status === 'MISSING' ? 'Required' : reqDoc.status}
                        </Badge>
                        {existingDoc ? (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => downloadDocument(existingDoc.id, existingDoc.originalName)}
                              variant="outline"
                              size="sm"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            {reqDoc.status !== 'APPROVED' && (
                              <Button
                                onClick={() => deleteDocument(existingDoc.id, existingDoc.originalName)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              id={`upload-${reqDoc.type}`}
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  handleDocumentUpload(file, reqDoc.type, `${reqDoc.name} - Required for Dutch employment compliance`)
                                }
                              }}
                            />
                            <Button
                              onClick={() => document.getElementById(`upload-${reqDoc.type}`)?.click()}
                              className="bg-blue-600 hover:bg-blue-700"
                              size="sm"
                              disabled={uploadingDocument}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadingDocument ? 'Uploading...' : 'Upload'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Additional Documents */}
        {documents.documents.filter((doc: any) => !['ID_BEWIJS', 'LOONBELASTINGVERKLARING', 'CONTRACT'].includes(doc.documentType)).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Documents</CardTitle>
              <CardDescription>
                Other documents you have uploaded
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {documents.documents
                  .filter((doc: any) => !['ID_BEWIJS', 'LOONBELASTINGVERKLARING', 'CONTRACT'].includes(doc.documentType))
                  .map((doc: any, index: number, filteredDocs: any[]) => (
                    <div key={doc.id} className={`flex items-center justify-between p-6 ${index !== filteredDocs.length - 1 ? 'border-b border-gray-200' : ''}`}>
                      <div className="flex items-center space-x-4">
                        <FileText className="h-10 w-10 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900">{doc.originalName}</p>
                          <p className="text-sm text-gray-500">
                            {doc.documentType} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-gray-400">
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={doc.status === 'APPROVED' ? 'default' : 'secondary'}
                          className={doc.status === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500'}
                        >
                          {doc.status}
                        </Badge>
                        <Button
                          onClick={() => downloadDocument(doc.id, doc.originalName)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          onClick={() => deleteDocument(doc.id, doc.originalName)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contracts Section within Documents */}
        {data.contracts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Employment Contracts</CardTitle>
              <CardDescription>
                View and manage your employment contracts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {data.contracts.map((contract, index) => (
                  <div key={contract.id} className={`flex items-center justify-between p-6 ${index !== data.contracts.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-center space-x-4">
                      <Building2 className="h-10 w-10 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">{contract.title}</p>
                        <p className="text-sm text-gray-500 capitalize">{contract.contractType}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={contract.status === 'signed' ? 'default' : 'secondary'}
                        className={contract.status === 'signed' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500'}
                      >
                        {contract.status === 'signed' ? 'Signed' : 'Pending'}
                      </Badge>
                      <Button
                        onClick={() => viewContract(contract.id, contract.fileName)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
      case 'dashboard':
        return renderOverviewContent()
      case 'payslips':
        return renderPayslipsContent()
      case 'documents':
        return renderDocumentsContent()
      case 'leave':
        return renderLeaveContent()
      case 'timetracking':
        return renderTimeTrackingContent()
      case 'expenses':
        return renderExpensesContent()
      default:
        return renderOverviewContent()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-opacity-0 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 flex flex-col
        transition-transform duration-300 ease-in-out lg:transition-none
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Grid3X3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">SalarySync</span>
                <p className="text-sm text-gray-500">Professional Payroll</p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((section) => (
            <div key={section.id} className="space-y-1">
              {section.type === 'single' ? (
                <button
                  onClick={section.action}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                >
                  <section.icon className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-medium">{section.label}</div>
                    <div className="text-xs text-gray-500">{section.description}</div>
                  </div>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <section.icon className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-medium">{section.label}</div>
                      <div className="text-xs text-gray-500">{section.description}</div>
                    </div>
                    {expandedSections.includes(section.id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSections.includes(section.id) && section.items && (
                    <div className="ml-4 space-y-1">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                            activeSection === item.id
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon className={`h-4 w-4 ${
                            activeSection === item.id ? 'text-white' : 'text-gray-600'
                          }`} />
                          <div className="flex-1 text-left">
                            <div className="font-medium">{item.label}</div>
                            <div className={`text-xs ${
                              activeSection === item.id ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {item.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Section - Employee Info */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          {/* Employee Profile */}
          <div className="flex items-center space-x-3 px-3 py-2 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {data.employee.firstName.charAt(0)}{data.employee.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {data.employee.firstName} {data.employee.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{data.employee.email}</p>
            </div>
          </div>
          
          {/* Help & Support */}
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <HelpCircle className="h-4 w-4 text-gray-600" />
            <span>Help & Support</span>
          </button>
          
          {/* Sign Out */}
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="h-4 w-4 text-red-600" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {activeSection === 'dashboard' ? 'Dashboard' : 
                     activeSection === 'payslips' ? 'Payslips' :
                     activeSection === 'contracts' ? 'Contracts' :
                     activeSection === 'leave' ? 'Leave Management' :
                     activeSection === 'timetracking' ? 'Time Tracking' :
                     activeSection === 'expenses' ? 'Expenses & Refunds' : 'Dashboard'}
                  </h1>
                  <p className="text-sm lg:text-base text-gray-600">
                    {activeSection === 'dashboard' ? 'Overview & insights' : 
                     activeSection === 'payslips' ? 'People Management' :
                     activeSection === 'contracts' ? 'People Management' :
                     activeSection === 'leave' ? 'Time Management' :
                     activeSection === 'timetracking' ? 'Time Management' :
                     activeSection === 'expenses' ? 'My Finances' : 'Overview & insights'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 lg:space-x-4">
                <div className="hidden sm:flex items-center space-x-2 bg-green-50 px-2 lg:px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs lg:text-sm font-medium text-green-700">
                    {data.employee.firstName} {data.employee.lastName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

