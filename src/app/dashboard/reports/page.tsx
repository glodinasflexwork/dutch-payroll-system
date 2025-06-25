"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import DashboardLayout from "@/components/layout/dashboard-layout"
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
  const [activeTab, setActiveTab] = useState('payroll-history')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [loading, setLoading] = useState(false)

  // Mock data for demonstration
  const payrollHistory: PayrollRecord[] = [
    {
      id: '1',
      period: 'juni 2025',
      employeeCount: 14,
      totalGross: 56000,
      totalNet: 42000,
      totalTax: 14000,
      status: 'completed',
      processedAt: '2025-06-25T10:30:00Z'
    },
    {
      id: '2',
      period: 'mei 2025',
      employeeCount: 13,
      totalGross: 52000,
      totalNet: 39000,
      totalTax: 13000,
      status: 'completed',
      processedAt: '2025-05-25T10:30:00Z'
    },
    {
      id: '3',
      period: 'april 2025',
      employeeCount: 12,
      totalGross: 48000,
      totalNet: 36000,
      totalTax: 12000,
      status: 'completed',
      processedAt: '2025-04-25T10:30:00Z'
    }
  ]

  const employeeReports: EmployeeReport[] = [
    {
      id: '1',
      name: 'Anna de Vries',
      department: 'Engineering',
      position: 'Senior Software Engineer',
      grossPay: 5500,
      netPay: 4100,
      taxDeductions: 1000,
      socialSecurity: 400
    },
    {
      id: '2',
      name: 'Jan van der Berg',
      department: 'Sales',
      position: 'Sales Manager',
      grossPay: 4800,
      netPay: 3600,
      taxDeductions: 900,
      socialSecurity: 300
    },
    {
      id: '3',
      name: 'Maria Jansen',
      department: 'HR',
      position: 'HR Specialist',
      grossPay: 4200,
      netPay: 3200,
      taxDeductions: 750,
      socialSecurity: 250
    }
  ]

  const handleExportPDF = (type: string, id?: string) => {
    setLoading(true)
    // Simulate export process
    setTimeout(() => {
      setLoading(false)
      alert(`${type} exported successfully!`)
    }, 2000)
  }

  const handleGeneratePayslip = (employeeId: string) => {
    setLoading(true)
    // Simulate payslip generation
    setTimeout(() => {
      setLoading(false)
      alert('Payslip generated successfully!')
    }, 1500)
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
                    {employeeReports.map((employee) => (
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

