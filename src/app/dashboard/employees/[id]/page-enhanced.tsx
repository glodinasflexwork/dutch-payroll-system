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
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar"
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
  Info
} from "lucide-react"

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  bsn: string
  employmentType: 'monthly' | 'hourly'
  contractType: string
  department: string
  position: string
  salary: number
  hourlyRate?: number
  taxTable: 'wit' | 'groen'
  startDate: string
  address: string
  postalCode: string
  city: string
  phoneNumber: string
  bankAccount: string
  emergencyContact: string
  emergencyPhone: string
  isActive: boolean
  employeeNumber: string
  portalAccessStatus?: 'NO_ACCESS' | 'INVITED' | 'ACTIVE'
  invitedAt?: string
  workingHoursPerWeek?: number
  workingDaysPerWeek?: number
  vacationDaysUsed?: number
  vacationDaysTotal?: number
  lastPayrollDate?: string
  nextPayrollDate?: string
}

export default function EmployeeDetailPageEnhanced() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (params.id) {
      fetchEmployee()
    }
  }, [params.id])

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${params.id}`)
      if (response.ok) {
        const result = await response.json()
        setEmployee(result.employee)
      } else {
        setError("Employee not found")
      }
    } catch (error) {
      console.error("Error fetching employee:", error)
      setError("Failed to load employee details")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '€0'
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
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

  const getInitials = (firstName: string, lastName: string) => {
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
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Employee Not Found</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/dashboard/employees')}
                    className="border-red-300 text-red-700 hover:bg-red-100"
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center space-x-2 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Employees</span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Send className="w-4 h-4 mr-2" />
                Send Invite
              </Button>
              <Button onClick={() => router.push(`/dashboard/employees/${employee.id}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Employee
              </Button>
            </div>
          </div>

          <div className="flex items-start space-x-6">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(employee.firstName, employee.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {employee.firstName} {employee.lastName}
                </h1>
                <Badge variant={employee.isActive ? 'success' : 'destructive'} className="text-sm">
                  {employee.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>{employee.position}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{employee.department}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Started {formatDate(employee.startDate)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">Employee ID:</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                    {employee.employeeNumber || 'N/A'}
                  </code>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">Portal Access:</span>
                  <div className="flex items-center space-x-1">
                    {getPortalStatusIcon(employee.portalAccessStatus)}
                    <Badge variant={getPortalStatusColor(employee.portalAccessStatus) as any} size="sm">
                      {getPortalStatusText(employee.portalAccessStatus)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                          <a 
                            href={`mailto:${employee.email}`}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {employee.email || 'N/A'}
                          </a>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Phone Number</label>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a 
                            href={`tel:${employee.phoneNumber}`}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {employee.phoneNumber || 'N/A'}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-1 block">Address</label>
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="text-sm">
                            {employee.address ? (
                              <div>
                                <div>{employee.address}</div>
                                <div className="text-gray-600">{employee.postalCode} {employee.city}</div>
                              </div>
                            ) : 'N/A'}
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
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a 
                            href={`tel:${employee.emergencyPhone}`}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {employee.emergencyPhone || 'N/A'}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span>Quick Stats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {employee.employmentType === 'monthly' 
                          ? formatCurrency(employee.salary || 0)
                          : `${formatCurrency(employee.hourlyRate || 0)}/hr`
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.employmentType === 'monthly' ? 'Monthly Salary' : 'Hourly Rate'}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Vacation Days</span>
                        <span className="text-sm font-medium">
                          {employee.vacationDaysUsed || 0}/{employee.vacationDaysTotal || 25}
                        </span>
                      </div>
                      <Progress 
                        value={((employee.vacationDaysUsed || 0) / (employee.vacationDaysTotal || 25)) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Working Hours</span>
                        <span className="text-sm font-medium">{employee.workingHoursPerWeek || 40}h/week</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Working Days</span>
                        <span className="text-sm font-medium">{employee.workingDaysPerWeek || 5} days/week</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>Payroll Schedule</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Last Payroll</label>
                      <p className="text-sm">{formatDate(employee.lastPayrollDate || '')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Next Payroll</label>
                      <p className="text-sm font-medium text-green-600">
                        {formatDate(employee.nextPayrollDate || '')}
                      </p>
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
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Department</label>
                      <Badge variant="secondary" className="text-sm">
                        {employee.department || 'N/A'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Position</label>
                      <p className="text-sm font-medium">{employee.position || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Employment Type</label>
                      <Badge variant={employee.employmentType === 'monthly' ? 'default' : 'outline'}>
                        {employee.employmentType === 'monthly' ? 'Monthly' : 'Hourly'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Contract Type</label>
                      <p className="text-sm capitalize">{employee.contractType || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">Start Date</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-sm">{formatDate(employee.startDate)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">Tax Table</label>
                    <Badge variant={employee.taxTable === 'wit' ? 'default' : 'success'}>
                      {(employee.taxTable || 'wit').toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Work Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Hours per Week</label>
                      <p className="text-2xl font-bold text-blue-600">{employee.workingHoursPerWeek || 40}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Days per Week</label>
                      <p className="text-2xl font-bold text-blue-600">{employee.workingDaysPerWeek || 5}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Euro className="w-5 h-5 text-green-600" />
                    <span>Compensation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {employee.employmentType === 'monthly' ? (
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Monthly Salary</label>
                      <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(employee.salary || 0)}
                      </p>
                      <p className="text-sm text-gray-500">Gross monthly salary</p>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Hourly Rate</label>
                      <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(employee.hourlyRate || 0)}/hour
                      </p>
                      <p className="text-sm text-gray-500">Gross hourly rate</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payroll Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">Tax Table</label>
                    <Badge variant={employee.taxTable === 'wit' ? 'default' : 'success'} className="text-sm">
                      {(employee.taxTable || 'wit').toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">Bank Account</label>
                    <code className="text-sm bg-gray-100 px-3 py-2 rounded-md font-mono border block">
                      {employee.bankAccount || 'N/A'}
                    </code>
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
                  <span>Employee Documents</span>
                </CardTitle>
                <CardDescription>
                  Manage employee contracts, payslips, and other documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Yet</h3>
                  <p className="text-gray-500 mb-4">Upload employee documents to get started</p>
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

