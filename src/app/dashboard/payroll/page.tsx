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
  Calculator, 
  Users, 
  Euro,
  Calendar,
  Play,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  FileText
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

interface PayrollCalculation {
  employeeId: string
  employee: Employee
  grossPay: number
  hoursWorked?: number
  overtimeHours?: number
  holidayAllowance: number
  incomeTax: number
  aowContribution: number
  wlzContribution: number
  wwContribution: number
  wiaContribution: number
  totalDeductions: number
  netPay: number
  employerCosts: number
}

export default function PayrollPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [payrollPeriod, setPayrollPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })
  const [calculations, setCalculations] = useState<PayrollCalculation[]>([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)

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
      setLoading(true)
      const response = await fetch("/api/employees")
      if (response.ok) {
        const result = await response.json()
        const employeesData = result.success ? result.employees : []
        const activeEmployees = employeesData.filter((emp: Employee) => emp.isActive)
        setEmployees(activeEmployees)
        setSelectedEmployees(activeEmployees.map((emp: Employee) => emp.id))
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePayroll = async () => {
    if (selectedEmployees.length === 0) {
      alert("Please select at least one employee")
      return
    }

    setProcessing(true)
    try {
      const response = await fetch("/api/payroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeIds: selectedEmployees,
          month: payrollPeriod.month,
          year: payrollPeriod.year,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCalculations(data.calculations)
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to calculate payroll")
      }
    } catch (error) {
      console.error("Error calculating payroll:", error)
      alert("Network error. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (month: number, year: number) => {
    const date = new Date(year, month - 1)
    return date.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
  }

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const selectAllEmployees = () => {
    setSelectedEmployees(employees.map(emp => emp.id))
  }

  const deselectAllEmployees = () => {
    setSelectedEmployees([])
  }

  const getTotalGrossPay = () => {
    return calculations.reduce((sum, calc) => sum + calc.grossPay, 0)
  }

  const getTotalDeductions = () => {
    return calculations.reduce((sum, calc) => sum + calc.totalDeductions, 0)
  }

  const getTotalNetPay = () => {
    return calculations.reduce((sum, calc) => sum + calc.netPay, 0)
  }

  const getTotalEmployerCosts = () => {
    return calculations.reduce((sum, calc) => sum + calc.employerCosts, 0)
  }

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading payroll data...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Payroll Processing</h1>
            <p className="text-gray-500">Calculate monthly payroll with Dutch tax compliance</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              View History
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Payroll Period Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Payroll Period</span>
            </CardTitle>
            <CardDescription>
              Select the month and year for payroll processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  value={payrollPeriod.month}
                  onChange={(e) => setPayrollPeriod(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2025, i).toLocaleDateString('nl-NL', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  value={payrollPeriod.year}
                  onChange={(e) => setPayrollPeriod(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selected Period
                </label>
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                  {formatDate(payrollPeriod.month, payrollPeriod.year)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Employee Selection</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={selectAllEmployees}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllEmployees}>
                  Deselect All
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Choose employees to include in this payroll run ({selectedEmployees.length} of {employees.length} selected)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">No active employees</p>
                <p className="text-sm text-gray-500">Add employees to start processing payroll</p>
                <Button className="mt-4" onClick={() => router.push("/dashboard/employees/add")}>
                  Add Employee
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedEmployees.includes(employee.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleEmployeeSelection(employee.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => toggleEmployeeSelection(employee.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{employee.position} • {employee.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={employee.employmentType === 'monthly' ? 'default' : 'outline'}>
                        {employee.employmentType === 'monthly' ? 'Monthly' : 'Hourly'}
                      </Badge>
                      <Badge variant={employee.taxTable === 'wit' ? 'default' : 'success'}>
                        {employee.taxTable.toUpperCase()}
                      </Badge>
                      <div className="text-right">
                        <p className="font-medium">
                          {employee.employmentType === 'monthly' 
                            ? formatCurrency(employee.salary)
                            : `${formatCurrency(employee.hourlyRate || 0)}/hour`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calculate Button */}
        {employees.length > 0 && (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={calculatePayroll}
              disabled={processing || selectedEmployees.length === 0}
              className="px-8 py-3"
            >
              {processing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Calculating Payroll...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5" />
                  <span>Calculate Payroll for {formatDate(payrollPeriod.month, payrollPeriod.year)}</span>
                </div>
              )}
            </Button>
          </div>
        )}

        {/* Payroll Results */}
        {calculations.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalGrossPay())}</div>
                  <p className="text-xs text-muted-foreground">
                    Before deductions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(getTotalDeductions())}</div>
                  <p className="text-xs text-muted-foreground">
                    Taxes and contributions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(getTotalNetPay())}</div>
                  <p className="text-xs text-muted-foreground">
                    Amount to pay employees
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Employer Costs</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(getTotalEmployerCosts())}</div>
                  <p className="text-xs text-muted-foreground">
                    Total cost to company
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calculator className="w-5 h-5" />
                    <span>Payroll Calculations - {formatDate(payrollPeriod.month, payrollPeriod.year)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Results
                    </Button>
                    <Button size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Process Payroll
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of payroll calculations for each employee
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Employee</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Gross Pay</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Income Tax</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Social Security</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Total Deductions</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Net Pay</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculations.map((calc) => (
                        <tr key={calc.employeeId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {calc.employee.firstName} {calc.employee.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{calc.employee.position}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-green-600">{formatCurrency(calc.grossPay)}</p>
                            {calc.holidayAllowance > 0 && (
                              <p className="text-xs text-gray-500">
                                +{formatCurrency(calc.holidayAllowance)} holiday allowance
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-red-600">{formatCurrency(calc.incomeTax)}</p>
                            <p className="text-xs text-gray-500">
                              {calc.employee.taxTable.toUpperCase()} table
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <p>AOW: {formatCurrency(calc.aowContribution)}</p>
                              <p>WLZ: {formatCurrency(calc.wlzContribution)}</p>
                              <p>WW: {formatCurrency(calc.wwContribution)}</p>
                              <p>WIA: {formatCurrency(calc.wiaContribution)}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-red-600">{formatCurrency(calc.totalDeductions)}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-blue-600">{formatCurrency(calc.netPay)}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

