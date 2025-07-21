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
  FileCheck
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('overview')
  const [uploadingDocument, setUploadingDocument] = useState(false)

  // Mock employee ID - in real implementation, this would come from authentication
  const employeeId = 'mock-employee-id'

  useEffect(() => {
    fetchPortalData()
    fetchDocuments()
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
      id: 'overview',
      label: 'Overview & Insights',
      description: 'Dashboard and analytics',
      icon: BarChart3,
      items: [
        { id: 'dashboard', label: 'Dashboard', description: 'Overview and analytics' }
      ]
    },
    {
      id: 'personal',
      label: 'Personal Management',
      description: 'Your personal information',
      icon: User,
      items: [
        { id: 'payslips', label: 'Payslips', description: 'View and download payslips' },
        { id: 'contracts', label: 'Contracts', description: 'View employment contracts' },
        { id: 'documents', label: 'Documents', description: 'Manage required documents' }
      ]
    },
    {
      id: 'time',
      label: 'Time Management',
      description: 'Leave requests and time tracking',
      icon: Clock,
      items: [
        { id: 'leave', label: 'Leave Management', description: 'Leave requests and balances' },
        { id: 'timetracking', label: 'Time Tracking', description: 'Log your working hours' }
      ]
    }
  ]

  const renderOverviewContent = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {data.employee.firstName}!</h1>
            <p className="text-blue-100">Here's what's happening with your account today</p>
          </div>
          <div className="hidden md:block">
            <FileText className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.payslips.length}</p>
                <p className="text-sm text-gray-500">Available payslips</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.contracts.length}</p>
                <p className="text-sm text-gray-500">Active contracts</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.leaveRequests.length}</p>
                <p className="text-sm text-gray-500">Leave requests</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.timeEntries.length}</p>
                <p className="text-sm text-gray-500">Time entries</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Personal information and employment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
              <p className="text-base font-semibold text-gray-900">{data.employee.firstName} {data.employee.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Position</p>
              <p className="text-base font-semibold text-gray-900">{data.employee.position}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Department</p>
              <p className="text-base font-semibold text-gray-900">{data.employee.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

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

  const renderContractsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contracts</h2>
          <p className="text-gray-600">View and sign employment contracts and amendments</p>
        </div>
      </div>

      <Card>
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
                    <div className="flex items-center justify-between">
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
      case 'contracts':
        return renderContractsContent()
      case 'documents':
        return renderDocumentsContent()
      case 'leave':
        return renderLeaveContent()
      case 'timetracking':
        return renderTimeTrackingContent()
      default:
        return renderOverviewContent()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <div>
              <span className="text-xl font-semibold text-gray-900">SalarySync</span>
              <p className="text-xs text-gray-500">Professional Payroll</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2">
          {sidebarItems.map((section) => (
            <div key={section.id} className="space-y-1">
              <div className="px-3 py-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <section.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{section.label}</span>
                </div>
                <p className="text-xs text-gray-500 ml-6">{section.description}</p>
              </div>
              
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-6 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{item.label}</span>
                  </div>
                  <p className={`text-xs ml-0 ${
                    activeSection === item.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
            <HelpCircle className="h-4 w-4" />
            <span>Help & Support</span>
          </button>
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeSection === 'dashboard' ? 'Dashboard' : 
                   activeSection === 'payslips' ? 'Payslips' :
                   activeSection === 'contracts' ? 'Contracts' :
                   activeSection === 'leave' ? 'Leave Management' :
                   activeSection === 'timetracking' ? 'Time Tracking' : 'Dashboard'}
                </h1>
                <p className="text-gray-600">
                  {activeSection === 'dashboard' ? 'Overview & insights' : 
                   activeSection === 'payslips' ? 'People Management' :
                   activeSection === 'contracts' ? 'People Management' :
                   activeSection === 'leave' ? 'Time Management' :
                   activeSection === 'timetracking' ? 'Time Management' : 'Overview & insights'}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">
                    {data.employee.firstName} {data.employee.lastName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

