"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import EmployeePortalAccess from "@/components/EmployeePortalAccess"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft,
  Edit,
  User,
  Building,
  Euro,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  AlertTriangle,
  Shield,
  Clock,
  TrendingUp,
  FileText,
  Settings,
  MoreHorizontal,
  Download,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Upload
} from "lucide-react"

interface Employee {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  bsn?: string
  employmentType?: 'monthly' | 'hourly'
  contractType?: string
  position?: string
  department?: string
  startDate?: string
  endDate?: string
  salary?: number
  hourlyRate?: number
  salaryType?: string
  phone?: string
  phoneNumber?: string
  address?: string
  streetName?: string
  houseNumber?: string
  city?: string
  postalCode?: string
  bankAccount?: string
  emergencyContact?: string
  emergencyPhone?: string
  emergencyRelation?: string
  taxTable?: string
  workingHours?: number
  workingHoursPerWeek?: number
  workingDaysPerWeek?: number
  vacationDaysUsed?: number
  vacationDaysTotal?: number
  lastPayrollDate?: string
  nextPayrollDate?: string
  portalAccess?: {
    status?: string
    invitedAt?: string
    activatedAt?: string
  }
}

export default function EmployeeDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (params?.id) {
      fetchEmployee(params.id as string)
    }
  }, [params?.id])

  const fetchEmployee = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/employees/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Employee not found")
        } else {
          setError("Failed to load employee details")
        }
        return
      }
      
      const data = await response.json()
      
      // Fix: Extract employee data from the correct response structure
      if (data.success && data.employee) {
        setEmployee(data.employee)
      } else {
        setError(data.error || "Failed to load employee details")
      }
    } catch (error) {
      console.error("Error fetching employee:", error)
      setError("Failed to load employee details")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '€0'
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getPortalStatusIcon = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'INVITED':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getPortalStatusText = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active'
      case 'INVITED':
        return 'Invited'
      default:
        return 'No Access'
    }
  }

  const getPortalStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success'
      case 'INVITED':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  // Safe address formatting
  const formatAddress = (employee: Employee) => {
    if (!employee) return 'N/A';
    
    const parts = []
    if (employee.streetName) parts.push(employee.streetName)
    if (employee.houseNumber) parts.push(employee.houseNumber)
    if (employee.address) parts.push(employee.address)
    
    const street = parts.join(' ')
    const cityParts = []
    if (employee.postalCode) cityParts.push(employee.postalCode)
    if (employee.city) cityParts.push(employee.city)
    
    if (street || cityParts.length > 0) {
      return (
        <div>
          {street && <div>{street}</div>}
          {cityParts.length > 0 && <div className="text-gray-600">{cityParts.join(' ')}</div>}
        </div>
      )
    }
    return 'N/A'
  }

  // Safe phone formatting
  const getPhoneNumber = (employee: Employee) => {
    if (!employee) return null;
    return employee.phone || employee.phoneNumber || null
  }

  // Safe salary display
  const getSalaryDisplay = (employee: Employee) => {
    if (!employee) return 'Not set';
    
    if (employee.salaryType === 'hourly' && employee.hourlyRate) {
      return `${formatCurrency(employee.hourlyRate)}/hour`
    } else if (employee.salary) {
      return `${formatCurrency(employee.salary)}/month`
    }
    return 'Not set'
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !employee) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center space-x-2 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </div>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Employee Not Found</h3>
                  <p className="text-red-700 mb-4">{error || "Employee not found"}</p>
                  <Button 
                    onClick={() => router.push('/dashboard/employees')}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    View All Employees
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Safety check - if we somehow got here with no employee data, show error
  if (!employee || !employee.id) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center space-x-2 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </div>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Invalid Employee Data</h3>
                  <p className="text-red-700 mb-4">The employee data is incomplete or invalid</p>
                  <Button 
                    onClick={() => router.push('/dashboard/employees')}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    View All Employees
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard/employees')}
              className="flex items-center space-x-2 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Employees</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Send Invite</span>
            </Button>
            <Button size="sm" className="flex items-center space-x-2" onClick={() => router.push(`/dashboard/employees/${employee?.id}/edit`)}>
              <Edit className="w-4 h-4" />
              <span>Edit Employee</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Profile Header */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <AvatarFallback className="text-white text-xl font-bold bg-transparent">
                  {getInitials(employee?.firstName, employee?.lastName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {employee?.firstName || 'Unknown'} {employee?.lastName || ''}
                  </h1>
                  <p className="text-lg text-gray-600 mb-3">{employee?.position || 'Position not set'}</p>
                  
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Building className="w-3 h-3" />
                      <span>{employee?.department || 'No Department'}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{employee?.employmentType || 'N/A'}</span>
                    </Badge>
                    <div className="flex items-center space-x-2">
                      {getPortalStatusIcon(employee?.portalAccess?.status)}
                      <Badge variant={getPortalStatusColor(employee?.portalAccess?.status) as any}>
                        {getPortalStatusText(employee?.portalAccess?.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="employment" className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>Employment</span>
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center space-x-2">
              <Euro className="w-4 h-4" />
              <span>Payroll</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Documents</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information - Enhanced */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Personal Information</span>
                  </CardTitle>
                  <CardDescription>
                    Personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-1 block">BSN</label>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <code className="text-sm bg-gray-100 px-3 py-2 rounded-md font-mono border">
                            {employee?.bsn || 'N/A'}
                          </code>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Email Address</label>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {employee?.email ? (
                            <a 
                              href={`mailto:${employee.email}`}
                              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {employee.email}
                            </a>
                          ) : (
                            <span className="text-sm text-gray-500">N/A</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Phone Number</label>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {getPhoneNumber(employee) ? (
                            <a 
                              href={`tel:${getPhoneNumber(employee)}`}
                              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {getPhoneNumber(employee)}
                            </a>
                          ) : (
                            <span className="text-sm text-gray-500">N/A</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Address</label>
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="text-sm">
                            {formatAddress(employee)}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Bank Account</label>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <code className="text-sm bg-gray-100 px-3 py-2 rounded-md font-mono border">
                            {employee?.bankAccount || 'N/A'}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Emergency Contact */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Name</label>
                        <div className="text-sm font-medium">
                          {employee?.emergencyContact || 'Not provided'}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                        <div className="text-sm font-medium">
                          {employee?.emergencyPhone ? (
                            <a 
                              href={`tel:${employee.emergencyPhone}`}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {employee.emergencyPhone}
                            </a>
                          ) : (
                            'Not provided'
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Relationship</label>
                        <div className="text-sm font-medium">
                          {employee?.emergencyRelation || 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats - Enhanced */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Euro className="w-5 h-5 text-green-600" />
                      <span>Compensation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {getSalaryDisplay(employee)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {employee?.employmentType === 'monthly' ? 'Monthly salary' : 'Hourly rate'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span>Vacation Days</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {employee?.vacationDaysUsed || 0} / {employee?.vacationDaysTotal || 25} days used
                        </span>
                        <span className="text-sm font-medium">
                          {employee?.vacationDaysTotal ? 
                            Math.max(0, employee.vacationDaysTotal - (employee.vacationDaysUsed || 0)) : 
                            25} remaining
                        </span>
                      </div>
                      <Progress 
                        value={employee?.vacationDaysTotal ? 
                          ((employee.vacationDaysUsed || 0) / employee.vacationDaysTotal) * 100 : 
                          0
                        } 
                        max={100} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span>Work Schedule</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Hours per week</span>
                      <span className="text-sm font-medium">{employee?.workingHoursPerWeek || employee?.workingHours || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Days per week</span>
                      <span className="text-sm font-medium">{employee?.workingDaysPerWeek || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Start date</span>
                      <span className="text-sm font-medium">{formatDate(employee?.startDate)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="employment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
                <CardDescription>
                  Job details and employment terms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Department</h4>
                    <p className="text-lg font-medium">{employee?.department || 'Not assigned'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Position</h4>
                    <p className="text-lg font-medium">{employee?.position || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Employment Type</h4>
                    <p className="text-lg font-medium capitalize">{employee?.employmentType || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Contract Type</h4>
                    <p className="text-lg font-medium">{employee?.contractType || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Start Date</h4>
                    <p className="text-lg font-medium">{formatDate(employee?.startDate)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">End Date</h4>
                    <p className="text-lg font-medium">{formatDate(employee?.endDate) || 'Indefinite'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Information</CardTitle>
                <CardDescription>
                  Salary and tax details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Salary Type</h4>
                    <p className="text-lg font-medium capitalize">{employee?.salaryType || employee?.employmentType || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Amount</h4>
                    <p className="text-lg font-medium">
                      {employee?.salaryType === 'hourly' ? 
                        formatCurrency(employee?.hourlyRate) + '/hour' : 
                        formatCurrency(employee?.salary) + '/month'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Tax Table</h4>
                    <p className="text-lg font-medium">{employee?.taxTable || 'Standard'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Bank Account</h4>
                    <p className="text-lg font-medium font-mono">{employee?.bankAccount || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Last Payroll</h4>
                    <p className="text-lg font-medium">{formatDate(employee?.lastPayrollDate) || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Next Payroll</h4>
                    <p className="text-lg font-medium">{formatDate(employee?.nextPayrollDate) || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  Employee documents and files
                </CardDescription>
              </CardHeader>
              <CardContent className="py-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Documents Available</h3>
                  <p className="text-gray-500 mb-6">Upload employee documents to see them here</p>
                  <Button variant="outline" className="flex items-center space-x-2 mx-auto">
                    <Upload className="w-4 h-4" />
                    <span>Upload Document</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

