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
  firstName: string
  lastName: string
  email: string
  bsn: string
  employmentType: 'monthly' | 'hourly'
  contractType: string
  position: string
  department?: string
  startDate: string
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
    status: string
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
      setEmployee(data)
    } catch (error) {
      console.error("Error fetching employee:", error)
      setError("Failed to load employee details")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount?: number | null) => {
    if (!amount || isNaN(amount)) return '€0'
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
    return employee.phone || employee.phoneNumber || null
  }

  // Safe salary display
  const getSalaryDisplay = (employee: Employee) => {
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
            <Button size="sm" className="flex items-center space-x-2">
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
                  {getInitials(employee.firstName, employee.lastName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {employee.firstName} {employee.lastName}
                  </h1>
                  <p className="text-lg text-gray-600 mb-3">{employee.position || 'Position not set'}</p>
                  
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Building className="w-3 h-3" />
                      <span>{employee.department || 'No Department'}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{employee.employmentType || 'N/A'}</span>
                    </Badge>
                    <div className="flex items-center space-x-2">
                      {getPortalStatusIcon(employee.portalAccess?.status)}
                      <Badge variant={getPortalStatusColor(employee.portalAccess?.status) as any}>
                        {getPortalStatusText(employee.portalAccess?.status)}
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
                            {employee.bsn || 'N/A'}
                          </code>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Email Address</label>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {employee.email ? (
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
                            {employee.bankAccount || 'N/A'}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Emergency Contact */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span>Emergency Contact</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Contact Name</label>
                        <p className="text-sm">{employee.emergencyContact || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Contact Phone</label>
                        {employee.emergencyPhone ? (
                          <a 
                            href={`tel:${employee.emergencyPhone}`}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {employee.emergencyPhone}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats Sidebar */}
              <div className="space-y-6">
                {/* Salary Card */}
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Euro className="w-5 h-5 text-green-600" />
                      <span>Compensation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-700 mb-1">
                      {getSalaryDisplay(employee)}
                    </div>
                    <p className="text-sm text-green-600">
                      {employee.salaryType === 'hourly' ? 'Hourly Rate' : 'Monthly Salary'}
                    </p>
                  </CardContent>
                </Card>

                {/* Vacation Progress */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span>Vacation Days</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Used</span>
                        <span>{employee.vacationDaysUsed || 0} / {employee.vacationDaysTotal || 25}</span>
                      </div>
                      <Progress 
                        value={((employee.vacationDaysUsed || 0) / (employee.vacationDaysTotal || 25)) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500">
                        {(employee.vacationDaysTotal || 25) - (employee.vacationDaysUsed || 0)} days remaining
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Work Schedule */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span>Work Schedule</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Hours/Week</span>
                      <span className="text-sm font-medium">{employee.workingHoursPerWeek || employee.workingHours || 40}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Days/Week</span>
                      <span className="text-sm font-medium">{employee.workingDaysPerWeek || 5} days</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payroll Schedule */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      <span>Payroll</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Last Payroll</span>
                      <p className="text-sm font-medium">{formatDate(employee.lastPayrollDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Next Payroll</span>
                      <p className="text-sm font-medium">{formatDate(employee.nextPayrollDate)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="employment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    <span>Employment Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Department</label>
                      <p className="text-sm font-medium">{employee.department || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Position</label>
                      <p className="text-sm font-medium">{employee.position || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Employment Type</label>
                      <Badge variant="outline">{employee.employmentType || 'N/A'}</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contract Type</label>
                      <Badge variant="outline">{employee.contractType || 'N/A'}</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Start Date</label>
                      <p className="text-sm">{formatDate(employee.startDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tax Table</label>
                      <Badge variant="outline">{employee.taxTable || 'WIT'}</Badge>
                    </div>
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
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Working Hours/Week</label>
                      <p className="text-sm font-medium">{employee.workingHoursPerWeek || employee.workingHours || 40} hours</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Working Days/Week</label>
                      <p className="text-sm font-medium">{employee.workingDaysPerWeek || 5} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Euro className="w-5 h-5 text-green-600" />
                    <span>Compensation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-700 mb-2">
                      {getSalaryDisplay(employee)}
                    </div>
                    <p className="text-green-600">
                      {employee.salaryType === 'hourly' ? 'Hourly Rate' : 'Monthly Salary'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>Payroll Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tax Table</label>
                    <Badge variant="outline" className="ml-2">{employee.taxTable || 'WIT'}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bank Account</label>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded border">
                      {employee.bankAccount || 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Documents</span>
                </CardTitle>
                <CardDescription>
                  Employee documents and files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                  <p className="text-gray-500 mb-4">Upload employee documents like contracts, certificates, and other files.</p>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Portal Access Component */}
        <EmployeePortalAccess employeeId={employee.id} />
      </div>
    </DashboardLayout>
  )
}

