"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal"
import EmployeeActionsDropdown from "@/components/ui/employee-actions-dropdown"
import EmployeeDeactivationModal from "@/components/ui/employee-deactivation-modal"
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  MoreHorizontal,
  UserPlus,
  Building2,
  Clock,
  TrendingUp,
  Activity,
  Zap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Award,
  CheckCircle,
  AlertCircle,
  Star
} from "lucide-react"

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  bsn: string
  employmentType: 'monthly' | 'hourly'
  department: string
  position: string
  salary: number
  hourlyRate?: number
  taxTable: 'wit' | 'groen'
  startDate: string
  isActive: boolean
}

export default function EmployeesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterEmploymentType, setFilterEmploymentType] = useState("all")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeactivationDialog, setShowDeactivationDialog] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      setLoading(true)
      fetchEmployees()
    }
  }, [session?.user])

  // Listen for company change events
  useEffect(() => {
    const handleCompanyChange = (event: CustomEvent) => {
      console.log('Company changed event received:', event.detail)
      setLoading(true)
      fetchEmployees()
    }

    window.addEventListener('companyChanged', handleCompanyChange as EventListener)
    
    return () => {
      window.removeEventListener('companyChanged', handleCompanyChange as EventListener)
    }
  }, [])

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees for company:', session?.user?.companyId)
      const response = await fetch("/api/employees")
      if (response.ok) {
        const result = await response.json()
        console.log('Employee API response:', result)
        const employeesData = result.success ? result.employees : []
        console.log('Setting employees:', employeesData)
        setEmployees(employeesData)
      } else {
        console.error('Failed to fetch employees:', response.status, response.statusText)
        setEmployees([])
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
      setEmployees([])
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
      return new Date(dateString).toLocaleDateString('nl-NL')
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      (employee.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.bsn || '').includes(searchTerm)

    const matchesDepartment = filterDepartment === "all" || employee.department === filterDepartment
    const matchesEmploymentType = filterEmploymentType === "all" || employee.employmentType === filterEmploymentType

    return matchesSearch && matchesDepartment && matchesEmploymentType
  })

  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))]

  const handleViewEmployee = (employeeId: string) => {
    router.push(`/dashboard/employees/${employeeId}`)
  }

  const handleEditEmployee = (employeeId: string) => {
    router.push(`/dashboard/employees/${employeeId}/edit`)
  }

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchEmployees()
        setShowDeleteDialog(false)
        setSelectedEmployee(null)
      } else {
        console.error('Failed to delete employee')
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSendEmail = (email: string) => {
    window.open(`mailto:${email}`, '_blank')
  }

  const handleExportData = (employeeId: string) => {
    console.log('Export data for employee:', employeeId)
  }

  const handleToggleStatus = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowDeactivationDialog(true)
  }

  const handleConfirmToggleStatus = async (data: { reason: string; effectiveDate: string; customReason?: string }) => {
    if (!selectedEmployee) return
    
    setIsTogglingStatus(true)
    try {
      const response = await fetch(`/api/employees/${selectedEmployee.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: data.reason,
          effectiveDate: data.effectiveDate
        })
      })
      
      if (response.ok) {
        await fetchEmployees()
        setShowDeactivationDialog(false)
        setSelectedEmployee(null)
        
        const result = await response.json()
        console.log('Employee status toggled:', result.message)
      } else {
        const errorData = await response.json()
        console.error('Failed to toggle employee status:', errorData.error)
      }
    } catch (error) {
      console.error('Error toggling employee status:', error)
    } finally {
      setIsTogglingStatus(false)
    }
  }

  // Calculate overview stats
  const overviewStats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.isActive).length,
    monthlyEmployees: employees.filter(emp => emp.employmentType === 'monthly').length,
    hourlyEmployees: employees.filter(emp => emp.employmentType === 'hourly').length,
    totalDepartments: departments.length,
    averageSalary: employees.length > 0 ? employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length : 0
  }

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading employees...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Header with Gradient */}
        <div className="relative">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Employee Management 👥</h1>
                  <p className="text-blue-100 text-lg mt-2">
                    Manage your company's workforce and employee records
                  </p>
                  <div className="flex items-center mt-4 space-x-4">
                    <div className="bg-white/20 px-4 py-2 rounded-full">
                      <span className="text-sm font-medium">{session?.user?.company?.name || 'Your Company'}</span>
                    </div>
                    <div className="bg-white/20 px-4 py-2 rounded-full">
                      <span className="text-sm font-medium">{overviewStats.activeEmployees} Active Employees</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 p-6 rounded-xl">
                  <Building2 className="w-16 h-16 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Workforce Overview</h2>
            <p className="text-gray-600 mt-1">Comprehensive employee management and insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none hover:from-orange-600 hover:to-orange-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none hover:from-green-600 hover:to-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/employees/add')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900">{overviewStats.totalEmployees}</p>
                  <p className="text-sm text-green-600 mt-1">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    {overviewStats.activeEmployees} active
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Employees</p>
                  <p className="text-3xl font-bold text-gray-900">{overviewStats.monthlyEmployees}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Fixed salary
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hourly Employees</p>
                  <p className="text-3xl font-bold text-gray-900">{overviewStats.hourlyEmployees}</p>
                  <p className="text-sm text-orange-600 mt-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Hourly rate
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-3xl font-bold text-gray-900">{overviewStats.totalDepartments}</p>
                  <p className="text-sm text-purple-600 mt-1">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Active teams
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Employee Directory</CardTitle>
                <CardDescription className="text-lg">
                  Search and manage your employee records
                </CardDescription>
              </div>
              <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                {filteredEmployees.length} employees
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search employees by name, email, or BSN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg border-2 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <select
                  value={filterEmploymentType}
                  onChange={(e) => setFilterEmploymentType(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
                >
                  <option value="all">All Types</option>
                  <option value="monthly">Monthly</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
            </div>

            {/* Enhanced Employee Cards/Table */}
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                {employees.length === 0 ? (
                  <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardContent className="p-12">
                      <div className="bg-blue-100 p-6 rounded-full w-24 h-24 mx-auto mb-6">
                        <UserPlus className="w-12 h-12 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Build Your Team</h3>
                      <p className="text-gray-600 mb-6 text-lg">Start by adding your first employee to get your payroll system up and running</p>
                      <div className="space-y-4">
                        <Button 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg px-8 py-3"
                          onClick={() => router.push('/dashboard/employees/add')}
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Add First Employee
                        </Button>
                        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                            Quick setup
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                            Secure data
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
                  <div className="py-8">
                    <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6">
                      <Search className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No employees found</h3>
                    <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Enhanced Employee Cards */}
                {filteredEmployees.map((employee) => (
                  <Card key={employee.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Employee Avatar */}
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full">
                            <span className="text-white font-bold text-xl">
                              {(employee.firstName?.[0] || '') + (employee.lastName?.[0] || '')}
                            </span>
                          </div>
                          
                          {/* Employee Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-bold text-xl text-gray-900">
                                {(employee.firstName || '')} {(employee.lastName || '')}
                              </h3>
                              <Badge variant={employee.isActive ? 'default' : 'secondary'} className="text-sm">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {employee.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Mail className="w-4 h-4 mr-2" />
                                {employee.email || 'No email'}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Building2 className="w-4 h-4 mr-2" />
                                {employee.department || 'No Department'}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Award className="w-4 h-4 mr-2" />
                                {employee.position || 'No position'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Employee Stats and Actions */}
                        <div className="flex items-center space-x-6">
                          {/* Employment Info */}
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant={employee.employmentType === 'monthly' ? 'default' : 'outline'}>
                                {employee.employmentType === 'monthly' ? 'Monthly' : 'Hourly'}
                              </Badge>
                              <Badge variant={(employee.taxTable || 'wit') === 'wit' ? 'default' : 'secondary'}>
                                {(employee.taxTable || 'wit').toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-2xl text-gray-900">
                                {employee.employmentType === 'monthly' 
                                  ? formatCurrency(employee.salary || 0)
                                  : `${formatCurrency(employee.hourlyRate || 0)}/hr`
                                }
                              </p>
                              <p className="text-sm text-gray-600">
                                Started {formatDate(employee.startDate)}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewEmployee(employee.id)}
                              className="hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditEmployee(employee.id)}
                              className="hover:bg-green-50"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <EmployeeActionsDropdown
                              employee={employee}
                              onView={handleViewEmployee}
                              onEdit={handleEditEmployee}
                              onDelete={handleDeleteEmployee}
                              onToggleStatus={handleToggleStatus}
                              onSendEmail={handleSendEmail}
                              onExportData={handleExportData}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        {employees.length > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Actions</h3>
                  <p className="text-gray-600">Common employee management tasks</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" className="hover:bg-white">
                    <Users className="w-4 h-4 mr-2" />
                    Bulk Import
                  </Button>
                  <Button variant="outline" size="sm" className="hover:bg-white">
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                  </Button>
                  <Button variant="outline" size="sm" className="hover:bg-white">
                    <Activity className="w-4 h-4 mr-2" />
                    Activity Log
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setSelectedEmployee(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone and will remove all associated data."
        itemName={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : ''}
        isLoading={isDeleting}
      />

      {/* Employee Deactivation Modal */}
      <EmployeeDeactivationModal
        isOpen={showDeactivationDialog}
        onClose={() => {
          setShowDeactivationDialog(false)
          setSelectedEmployee(null)
        }}
        onConfirm={handleConfirmToggleStatus}
        employee={selectedEmployee}
        isLoading={isTogglingStatus}
      />
    </DashboardLayout>
  )
}

