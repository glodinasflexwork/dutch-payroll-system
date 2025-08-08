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
  Shield
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
}

export default function EmployeeDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading employee details...</p>
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
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </div>
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Not Found</h3>
                <p className="text-gray-500">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-gray-500">{employee.position} • {employee.department}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={employee.isActive ? 'success' : 'destructive'}>
              {employee.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Button onClick={() => router.push(`/dashboard/employees/${employee.id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Employee
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee Number</label>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {employee.employeeNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">BSN</label>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {employee.bsn || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-sm">{employee.email || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm">{employee.phoneNumber || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-sm">
                    {employee.address ? (
                      `${employee.address}, ${employee.postalCode} ${employee.city}`
                    ) : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Bank Account</label>
                <div className="flex items-center space-x-2 mt-1">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-mono">{employee.bankAccount || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Employment Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <Badge variant="secondary" className="mt-1">
                    {employee.department || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Position</label>
                  <p className="text-sm mt-1">{employee.position || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Employment Type</label>
                  <Badge variant={employee.employmentType === 'monthly' ? 'default' : 'outline'} className="mt-1">
                    {employee.employmentType === 'monthly' ? 'Monthly' : 'Hourly'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contract Type</label>
                  <p className="text-sm mt-1 capitalize">{employee.contractType || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Start Date</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm">{formatDate(employee.startDate)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Tax Table</label>
                <Badge variant={employee.taxTable === 'wit' ? 'default' : 'success'} className="mt-1">
                  {(employee.taxTable || 'wit').toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Salary Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Euro className="w-5 h-5" />
                <span>Compensation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {employee.employmentType === 'monthly' ? (
                <div>
                  <label className="text-sm font-medium text-gray-500">Monthly Salary</label>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(employee.salary || 0)}
                  </p>
                  <p className="text-sm text-gray-500">Gross monthly salary</p>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-500">Hourly Rate</label>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(employee.hourlyRate || 0)}/hour
                  </p>
                  <p className="text-sm text-gray-500">Gross hourly rate</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Emergency Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Name</label>
                <p className="text-sm mt-1">{employee.emergencyContact || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm">{employee.emergencyPhone || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

