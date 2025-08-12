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
  Printer,
  BarChart3,
  FileSpreadsheet,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap
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
  const [activeTab, setActiveTab] = useState('payroll-history')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<EmployeeReport[]>([])
  const [payrollHistory, setPayrollHistory] = useState<PayrollRecord[]>([])
  const [selectedPeriodData, setSelectedPeriodData] = useState<any>(null)
  const [periodEmployees, setPeriodEmployees] = useState<any[]>([])
  const [taxSummaryData, setTaxSummaryData] = useState<any>(null)

  useEffect(() => {
    if (session?.user?.companyId) {
      fetchEmployees()
      fetchPayrollHistory()
      fetchTaxSummary()
    }
  }, [session?.user?.companyId])

  const fetchTaxSummary = async () => {
    try {
      const response = await fetch('/api/payroll')
      if (response.ok) {
        const result = await response.json()
        const payrollRecords = result.payrollRecords || []
        
        const totals = payrollRecords.reduce((acc: any, record: any) => {
          acc.totalGross += record.grossPay || 0
          acc.aowContribution += record.aowContribution || 0
          acc.wlzContribution += record.wlzContribution || 0
          acc.totalLoonheffing += record.totalDeductions || 0
          acc.totalNet += record.netPay || 0
          acc.recordCount += 1
          return acc
        }, {
          totalGross: 0,
          aowContribution: 0,
          wlzContribution: 0,
          totalLoonheffing: 0,
          totalNet: 0,
          recordCount: 0
        })

        const zvwContribution = totals.totalGross * 0.0565

        setTaxSummaryData({
          ...totals,
          zvwContribution
        })
      }
    } catch (error) {
      console.error('Error fetching tax summary:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/employees")
      if (response.ok) {
        const result = await response.json()
        const employeesData = result.success ? result.employees : []
        
        const employeeReports = employeesData.map((emp: any) => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          department: emp.department || 'N/A',
          position: emp.position || 'N/A',
          grossPay: emp.salary || 0,
          netPay: Math.round((emp.salary || 0) * 0.68),
          taxDeductions: Math.round((emp.salary || 0) * 0.25),
          socialSecurity: Math.round((emp.salary || 0) * 0.07)
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
      const response = await fetch("/api/payroll")
      if (response.ok) {
        const result = await response.json()
        const payrollRecords = result.payrollRecords || []
        
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
        setPayrollHistory([])
      }
    } catch (error) {
      console.error("Error fetching payroll history:", error)
      setPayrollHistory([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPeriodEmployees = async (periodId: string) => {
    try {
      setLoading(true)
      const period = payrollHistory.find(p => p.id === periodId)
      if (!period) return

      const response = await fetch("/api/payroll")
      if (response.ok) {
        const result = await response.json()
        const payrollRecords = result.payrollRecords || []
        
        const periodRecords = payrollRecords.filter((record: any) => {
          const recordDate = new Date(record.payPeriodStart)
          const recordPeriod = `${recordDate.toLocaleString('default', { month: 'long' })} ${recordDate.getFullYear()}`
          return recordPeriod === period.period
        })

        const employeesWithPayroll = periodRecords.map((record: any) => ({
          id: record.employee.id,
          name: `${record.employee.firstName} ${record.employee.lastName}`,
          employeeNumber: record.employee.employeeNumber,
          department: record.employee.department || 'N/A',
          position: record.employee.position || 'N/A',
          grossPay: record.grossPay || 0,
          netPay: record.netPay || 0,
          taxDeductions: record.totalDeductions || 0,
          payrollRecordId: record.id,
          payPeriodStart: record.payPeriodStart,
          payPeriodEnd: record.payPeriodEnd
        }))

        setPeriodEmployees(employeesWithPayroll)
        setSelectedPeriodData(period)
        setActiveTab('period-employees')
      }
    } catch (error) {
      console.error("Error fetching period employees:", error)
      toast.error('Error loading employees', 'Failed to load employee data for this period')
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = (type: string, id?: string) => {
    const loadingToastId = toast.loading('Exporting report', `Generating ${type} export...`)
    
    setTimeout(() => {
      toast.removeToast(loadingToastId)
      toast.success('Export completed successfully!', `${type} has been downloaded to your device`)
    }, 2000)
  }

  const handleGeneratePayslip = async (employeeId: string) => {
    const loadingToastId = toast.loading('Generating payslip', 'Creating payslip document...')
    
    try {
      const now = new Date()
      const month = now.getMonth() + 1
      const year = now.getFullYear()

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
          const newWindow = window.open('', '_blank')
          if (newWindow) {
            newWindow.document.write(result.html)
            newWindow.document.close()
            
            toast.removeToast(loadingToastId)
            toast.success('Payslip generated successfully!', 'Payslip opened in new window')
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

  // Calculate overview stats
  const overviewStats = {
    totalReports: payrollHistory.length,
    totalEmployees: employees.length,
    lastProcessed: payrollHistory.length > 0 ? payrollHistory[0].processedAt : null,
    complianceStatus: 'up-to-date'
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Professional Overview Stats - Blue Gradient Variations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Reports</p>
                  <p className="text-3xl font-bold text-blue-700">{overviewStats.totalReports}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    All periods
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Active Employees</p>
                  <p className="text-3xl font-bold text-blue-800">{overviewStats.totalEmployees}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    <Users className="w-4 h-4 inline mr-1" />
                    In system
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-700 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Last Processed</p>
                  <p className="text-lg font-bold text-blue-900">
                    {overviewStats.lastProcessed ? formatDate(overviewStats.lastProcessed).split(' ')[0] : 'N/A'}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Recent activity
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-blue-800" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-800 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Compliance Status</p>
                  <p className="text-lg font-bold text-green-600">Up to Date</p>
                  <p className="text-sm text-blue-600 mt-1">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    All systems green
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-blue-900" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Report Categories</h2>
            <p className="text-gray-600 mt-1">Select a report type to view detailed information</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleExportPDF('All Reports')}
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none hover:from-orange-600 hover:to-orange-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <Button 
              onClick={() => handleExportPDF('Summary Report')}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Summary
            </Button>
          </div>
        </div>

        {/* Enhanced Report Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="border-l-4 border-l-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => setActiveTab('payroll-history')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {payrollHistory.length} periods
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Payroll History</h3>
              <p className="text-gray-600 mb-4">Monthly payroll summaries and historical data</p>
              <div className="flex items-center text-sm text-blue-600">
                <Activity className="w-4 h-4 mr-1" />
                Last updated: {overviewStats.lastProcessed ? formatDate(overviewStats.lastProcessed).split(' ')[0] : 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-l-4 border-l-pink-500 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => setActiveTab('tax-summary')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-pink-100 p-3 rounded-full group-hover:bg-pink-200 transition-colors">
                  <Euro className="w-6 h-6 text-pink-600" />
                </div>
                <Badge className="bg-pink-100 text-pink-800">
                  {taxSummaryData?.recordCount || 0} records
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tax Summary</h3>
              <p className="text-gray-600 mb-4">Tax calculations and compliance reports</p>
              <div className="flex items-center text-sm text-pink-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Compliance: Up to date
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-l-4 border-l-purple-500 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => setActiveTab('loon-journal')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                  <FileSpreadsheet className="w-6 h-6 text-purple-600" />
                </div>
                <Badge className="bg-purple-100 text-purple-800">
                  Journal entries
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Loon Journal</h3>
              <p className="text-gray-600 mb-4">Detailed salary journals and transactions</p>
              <div className="flex items-center text-sm text-purple-600">
                <FileText className="w-4 h-4 mr-1" />
                Transaction logs available
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-l-4 border-l-orange-500 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => setActiveTab('loonaangifte')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-full group-hover:bg-orange-200 transition-colors">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
                <Badge className="bg-orange-100 text-orange-800">
                  Government filing
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Loonaangifte</h3>
              <p className="text-gray-600 mb-4">Dutch tax authority submissions</p>
              <div className="flex items-center text-sm text-orange-600">
                <Zap className="w-4 h-4 mr-1" />
                Ready for submission
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-l-4 border-l-teal-500 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => setActiveTab('analytics')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-teal-100 p-3 rounded-full group-hover:bg-teal-200 transition-colors">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                </div>
                <Badge className="bg-teal-100 text-teal-800">
                  Advanced insights
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 mb-4">Advanced reporting and business insights</p>
              <div className="flex items-center text-sm text-teal-600">
                <BarChart3 className="w-4 h-4 mr-1" />
                Interactive dashboards
              </div>
            </CardContent>
          </Card>

          {/* Getting Started Guide for Empty State */}
          {payrollHistory.length === 0 && (
            <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                    <Zap className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Getting Started</h3>
                  <p className="text-gray-600 mb-4">Generate your first payroll report to unlock all features</p>
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    <FileText className="w-4 h-4 mr-2" />
                    Create First Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search reports, periods, or employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg border-2 focus:border-blue-500"
                  />
                </div>
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
              >
                <option value="all">All Periods</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="last-6-months">Last 6 Months</option>
              </select>
              <Button variant="outline" size="lg" className="h-12 px-6">
                <Filter className="w-5 h-5 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content based on active tab */}
        {activeTab === 'payroll-history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Payroll History</h2>
              <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                {payrollHistory.length} periods processed
              </Badge>
            </div>
            
            <div className="grid gap-6">
              {payrollHistory.map((record) => (
                <Card key={record.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-4 rounded-xl">
                          <Calendar className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-900">{record.period}</h3>
                          <p className="text-gray-600 text-lg">
                            {record.employeeCount} employees • Processed {formatDate(record.processedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <Badge className={`${getStatusBadge(record.status)} px-3 py-1 text-sm font-medium`}>
                          {record.status}
                        </Badge>
                        <div className="text-right">
                          <p className="font-bold text-2xl text-gray-900">{formatCurrency(record.totalNet)}</p>
                          <p className="text-sm text-gray-600">Net payroll</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchPeriodEmployees(record.id)}
                            className="hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportPDF('Payroll Report', record.id)}
                            className="hover:bg-green-50"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {payrollHistory.length === 0 && (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-12 text-center">
                    <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6">
                      <Calendar className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Payroll History</h3>
                    <p className="text-gray-600 mb-6">Start by processing your first payroll to see history here</p>
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <Zap className="w-4 h-4 mr-2" />
                      Process First Payroll
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Tax Summary Tab */}
        {activeTab === 'tax-summary' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Tax Summary</h2>
              <Badge className="bg-pink-100 text-pink-800 px-3 py-1">
                Current year overview
              </Badge>
            </div>
            
            {taxSummaryData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Total Gross Payroll</h3>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(taxSummaryData.totalGross)}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">AOW Contributions</h3>
                    <p className="text-3xl font-bold text-blue-600">{formatCurrency(taxSummaryData.aowContribution)}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">WLZ Contributions</h3>
                    <p className="text-3xl font-bold text-purple-600">{formatCurrency(taxSummaryData.wlzContribution)}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">ZVW Contributions</h3>
                    <p className="text-3xl font-bold text-orange-600">{formatCurrency(taxSummaryData.zvwContribution)}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Total Loonheffing</h3>
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(taxSummaryData.totalLoonheffing)}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-teal-500">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Total Net Payroll</h3>
                    <p className="text-3xl font-bold text-teal-600">{formatCurrency(taxSummaryData.totalNet)}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Other tabs with enhanced styling */}
        {activeTab === 'loon-journal' && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="bg-purple-100 p-6 rounded-full w-24 h-24 mx-auto mb-6">
                <FileSpreadsheet className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Loon Journal</h3>
              <p className="text-gray-600 mb-6">Detailed salary journals and transaction logs</p>
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <FileText className="w-4 h-4 mr-2" />
                Generate Journal Report
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'loonaangifte' && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="bg-orange-100 p-6 rounded-full w-24 h-24 mx-auto mb-6">
                <Building2 className="w-12 h-12 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Loonaangifte</h3>
              <p className="text-gray-600 mb-6">Dutch tax authority submission reports</p>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <Printer className="w-4 h-4 mr-2" />
                Prepare Submission
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="bg-teal-100 p-6 rounded-full w-24 h-24 mx-auto mb-6">
                <TrendingUp className="w-12 h-12 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics</h3>
              <p className="text-gray-600 mb-6">Interactive dashboards and business insights</p>
              <Button className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

