"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  MoreHorizontal
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.companyId) {
      fetchEmployees()
    }
  }, [session])

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      if (response.ok) {
        const result = await response.json()
        const employeesData = result.success ? result.employees : []
        setEmployees(employeesData)
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
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

  const handleEmployeeMenu = (employee: Employee) => {
    setSelectedEmployee(employee)
    // For now, just show a simple alert with options
    // In a real app, you'd show a dropdown menu
    const action = window.confirm(
      `Actions for ${employee.firstName} ${employee.lastName}:\n\n` +
      `Click OK to delete employee, or Cancel to close.`
    )
    
    if (action) {
      setShowDeleteDialog(true)
    }
  }

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return
    
    try {
      const response = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Refresh the employee list
        await fetchEmployees()
        setShowDeleteDialog(false)
        setSelectedEmployee(null)
        alert('Employee deleted successfully')
      } else {
        alert('Failed to delete employee')
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('Error deleting employee')
    }
  }

  const handleViewEmployee = (employeeId: string) => {
    router.push(`/dashboard/employees/${employeeId}`)
  }

  const handleEditEmployee = (employeeId: string) => {
    router.push(`/dashboard/employees/${employeeId}/edit`)
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-500">Manage your company's employee records</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => router.push('/dashboard/employees/add')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
              <p className="text-xs text-muted-foreground">
                {employees.filter(emp => emp.isActive).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter(emp => emp.employmentType === 'monthly').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Fixed salary employees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hourly Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter(emp => emp.employmentType === 'hourly').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Hourly rate employees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
              <p className="text-xs text-muted-foreground">
                Active departments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>
              Search and filter your employee records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search employees by name, email, or BSN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <select
                  value={filterEmploymentType}
                  onChange={(e) => setFilterEmploymentType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="monthly">Monthly</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
            </div>

            {/* Employee Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">BSN</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Employment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Salary</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Tax Table</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        {employees.length === 0 ? (
                          <div>
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-lg font-medium">No employees yet</p>
                            <p className="text-sm">Get started by adding your first employee</p>
                            <Button className="mt-4" onClick={() => router.push('/dashboard/employees/add')}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Employee
                            </Button>
                          </div>
                        ) : (
                          "No employees match your search criteria"
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {(employee.firstName || '')} {(employee.lastName || '')}
                            </p>
                            <p className="text-sm text-gray-500">{employee.email || 'No email'}</p>
                            <p className="text-sm text-gray-500">{employee.position || 'No position'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {employee.bsn || 'No BSN'}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{employee.department || 'No Department'}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={employee.employmentType === 'monthly' ? 'default' : 'outline'}>
                            {employee.employmentType === 'monthly' ? 'Monthly' : 'Hourly'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            {employee.employmentType === 'monthly' ? (
                              <p className="font-medium">{formatCurrency(employee.salary || 0)}</p>
                            ) : (
                              <p className="font-medium">{formatCurrency(employee.hourlyRate || 0)}/hour</p>
                            )}
                            <p className="text-xs text-gray-500">
                              Started {formatDate(employee.startDate)}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={(employee.taxTable || 'wit') === 'wit' ? 'default' : 'success'}>
                            {(employee.taxTable || 'wit').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={employee.isActive ? 'success' : 'destructive'}>
                            {employee.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewEmployee(employee.id)}
                              title="View employee details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditEmployee(employee.id)}
                              title="Edit employee"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEmployeeMenu(employee)}
                              title="More actions"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

