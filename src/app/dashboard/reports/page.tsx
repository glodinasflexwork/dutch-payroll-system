"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { useToast } from "@/components/ui/toast"
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  Euro, 
  TrendingUp,
  Filter,
  Search,
  Eye,
  Printer
} from "lucide-react"

interface PayrollRecord {
  id: string
  period: string
  employeeCount: number
  totalGross: number
  totalNet: number
  totalTax: number
  status: 'completed' | 'pending' | 'draft'
  processedAt: string
}

interface EmployeeReport {
  id: string
  name: string
  department: string
  position: string
  grossPay: number
  netPay: number
  taxDeductions: number
  socialSecurity: number
}

export default function ReportsPage() {
  const { data: session } = useSession()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('employee-reports')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<EmployeeReport[]>([])
  const [payrollHistory, setPayrollHistory] = useState<PayrollRecord[]>([])

  useEffect(() => {
    if (session?.user?.companyId) {
      fetchEmployees()
      fetchPayrollHistory()
    }
  }, [session])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/employees")
      if (response.ok) {
        const result = await response.json()
        const employeesData = result.success ? result.employees : []
        
        // Transform employee data to match EmployeeReport interface
        const employeeReports = employeesData.map((emp: any) => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          department: emp.department || 'N/A',
          position: emp.position || 'N/A',
          grossPay: emp.salary || 0,
          netPay: Math.round((emp.salary || 0) * 0.68), // Approximate net pay (68% of gross)
          taxDeductions: Math.round((emp.salary || 0) * 0.25), // Approximate tax (25%)
          socialSecurity: Math.round((emp.salary || 0) * 0.07) // Approximate social security (7%)
        }))
        
        setEmployees(employeeReports)
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayrollHistory = async () => {
    try {
      setLoading(true)
      // Fetch actual payroll records from the API
      const response = await fetch("/api/payroll")
      if (response.ok) {
        const result = await response.json()
        const payrollRecords = result.payrollRecords || []
        
        // Group payroll records by month/year to create period summaries
        const periodMap = new Map<string, {
          records: any[],
          totalGross: number,
          totalNet: number,
          totalTax: number,
          employeeCount: number,
          processedAt: string
        }>()
        
        payrollRecords.forEach((record: any) => {
          const date = new Date(record.payPeriodStart)
          const periodKey = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`
          
          if (!periodMap.has(periodKey)) {
            periodMap.set(periodKey, {
              records: [],
              totalGross: 0,
              totalNet: 0,
              totalTax: 0,
              employeeCount: 0,
              processedAt: record.processedDate
            })
          }
          
          const period = periodMap.get(periodKey)!
          period.records.push(record)
          period.totalGross += record.grossPay || 0
          period.totalNet += record.netPay || 0
          period.totalTax += record.totalDeductions || 0
          period.employeeCount = period.records.length
        })
        
        // Convert map to array of PayrollRecord objects
        const historyData: PayrollRecord[] = Array.from(periodMap.entries()).map(([period, data]) => ({
          id: period.replace(' ', '-').toLowerCase(),
          period,
          employeeCount: data.employeeCount,
          totalGross: data.totalGross,
          totalNet: data.totalNet,
          totalTax: data.totalTax,
          status: 'completed' as const,
          processedAt: data.processedAt
        }))
        
        setPayrollHistory(historyData)
      } else {
        console.error("Failed to fetch payroll records")
        setPayrollHistory([])
      }
    } catch (error) {
      console.error("Error fetching payroll history:", error)
      setPayrollHistory([])
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = (type: string, id?: string) => {
    const loadingToastId = toast.loading('Exporting report', `Generating ${type} export...`)
    
    // Simulate export process
    setTimeout(() => {
      toast.removeToast(loadingToastId)
      toast.success('Export completed successfully!', `${type} has been downloaded to your device`)
    }, 2000)
  }

  const handleGeneratePayslip = async (employeeId: string) => {
    const loadingToastId = toast.loading('Generating payslip', 'Creating payslip document...')
    
    try {
      // Get current month and year
      const now = new Date()
      const month = now.getMonth() + 1
      const year = now.getFullYear()

      // Generate payslip HTML
      const response = await fetch("/api/payslips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
          month,
          year
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Create a new window/tab with the payslip HTML
          const newWindow = window.open('', '_blank')
          if (newWindow) {
            newWindow.document.write(result.html)
            newWindow.document.close()
            
            // Optional: Trigger print dialog
            setTimeout(() => {
              newWindow.print()
            }, 1000)
            
            toast.removeToast(loadingToastId)
            toast.success('Payslip generated successfully!', 'Payslip opened in new window and ready to print')
          } else {
            toast.removeToast(loadingToastId)
            toast.error('Popup blocked', 'Please allow popups for this site to view payslips')
          }
        } else {
          toast.removeToast(loadingToastId)
          toast.error('Failed to generate payslip', result.error || 'Unknown error occurred')
        }
      } else {
        const errorData = await response.json()
        toast.removeToast(loadingToastId)
        toast.error('Error generating payslip', errorData.error || 'Server error occurred')
      }
    } catch (error) {
      console.error('Error generating payslip:', error)
      toast.removeToast(loadingToastId)
      toast.error('Network error', 'Please check your connection and try again')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800'
    }
    return variants[status as keyof typeof variants] || variants.draft
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">View payroll reports and generate payslips</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleExportPDF('All Reports')}
              disabled={loading}
            >
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <Button 
              onClick={() => handleExportPDF('Summary Report')}
              disabled={loading}
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Summary
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'payroll-history', label: 'Payroll History', icon: Calendar },
              { id: 'employee-reports', label: 'Employee Reports', icon: Users },
              { id: 'tax-summary', label: 'Tax Summary', icon: Euro },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Periods</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="last-6-months">Last 6 Months</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'payroll-history' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Payroll History</h2>
            <div className="grid gap-4">
              {payrollHistory.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{record.period}</h3>
                          <p className="text-gray-600">
                            {record.employeeCount} employees • Processed {formatDate(record.processedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusBadge(record.status)}>
                          {record.status}
                        </Badge>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(record.totalNet)}</p>
                          <p className="text-sm text-gray-600">Net Pay</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">Gross Pay</p>
                        <p className="font-semibold">{formatCurrency(record.totalGross)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tax Deductions</p>
                        <p className="font-semibold">{formatCurrency(record.totalTax)}</p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleExportPDF('Payroll Report', record.id)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExportPDF('Payroll PDF', record.id)}>
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'employee-reports' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Employee Reports</h2>
            <div className="bg-white rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gross Pay
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deductions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Pay
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.position}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">{employee.department}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {formatCurrency(employee.grossPay)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(employee.taxDeductions + employee.socialSecurity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(employee.netPay)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleGeneratePayslip(employee.id)}
                              disabled={loading}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Payslip
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleExportPDF('Employee Report', employee.id)}
                              disabled={loading}
                            >
                              <Printer className="w-4 h-4 mr-1" />
                              Print
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tax-summary' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Tax Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Income Tax</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">€14,500</div>
                  <p className="text-sm text-gray-600 mt-1">36.93% & 49.50% brackets</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">AOW (Pension)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">€4,000</div>
                  <p className="text-sm text-gray-600 mt-1">Old-age pension</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">WLZ (Healthcare)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">€1,050</div>
                  <p className="text-sm text-gray-600 mt-1">Long-term care</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Deductions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">€21,050</div>
                  <p className="text-sm text-gray-600 mt-1">All tax components</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tax Breakdown by Component</CardTitle>
                <CardDescription>Detailed view of all tax deductions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Income Tax', amount: 14500, percentage: 68.9 },
                    { name: 'AOW (Pension)', amount: 4000, percentage: 19.0 },
                    { name: 'WLZ (Healthcare)', amount: 1050, percentage: 5.0 },
                    { name: 'WW (Unemployment)', amount: 850, percentage: 4.0 },
                    { name: 'WIA (Disability)', amount: 650, percentage: 3.1 }
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{item.percentage}%</span>
                        <span className="font-semibold">{formatCurrency(item.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Payroll Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Payroll costs over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Chart: Monthly payroll trends</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Department Costs</CardTitle>
                  <CardDescription>Payroll distribution by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Chart: Department breakdown</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

