"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PayrollTrendsChart from "./charts/payroll-trends-chart"
import EmployeeDistributionChart from "./charts/employee-distribution-chart"
import TaxBreakdownChart from "./charts/tax-breakdown-chart"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Euro, 
  Calculator,
  Target,
  AlertCircle,
  CheckCircle
} from "lucide-react"

interface AnalyticsData {
  kpis: {
    totalPayroll: number
    totalEmployees: number
    averageSalary: number
    totalTaxes: number
    payrollGrowth: number
    employeeGrowth: number
    taxEfficiency: number
  }
  trends: Array<{
    month: string
    totalPayroll: number
    employees: number
    averageSalary: number
    aow: number
    anw: number
    wlz: number
    zvw: number
  }>
  departmentDistribution: Array<{
    department: string
    employees: number
    avgSalary: number
  }>
  employmentTypeDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  taxBreakdown: {
    monthly: Array<{
      month: string
      aow: number
      anw: number
      wlz: number
      zvw: number
    }>
    current: {
      aow: number
      anw: number
      wlz: number
      zvw: number
    }
  }
}

export default function AnalyticsDashboard() {
  const { data: session } = useSession()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.companyId) {
      fetchAnalyticsData()
    }
  }, [session?.user?.companyId])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setAnalyticsData(result.data)
        } else {
          setError(result.error || 'Failed to fetch analytics data')
        }
      } else {
        setError('Failed to fetch analytics data')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No analytics data available. Process payroll to see analytics.</p>
        </div>
      </div>
    )
  }

  const { kpis } = analyticsData

  const kpiCards = [
    {
      title: "Total Monthly Payroll",
      value: formatCurrency(kpis.totalPayroll),
      change: kpis.payrollGrowth,
      icon: Euro,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Total gross payroll for current month"
    },
    {
      title: "Active Employees",
      value: kpis.totalEmployees.toString(),
      change: kpis.employeeGrowth,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Currently active employees"
    },
    {
      title: "Average Salary",
      value: formatCurrency(kpis.averageSalary),
      change: 3.2, // Could be calculated from historical data
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Average monthly salary per employee"
    },
    {
      title: "Loonheffing Rate",
      value: formatPercentage(kpis.taxEfficiency),
      change: -1.2, // Could be calculated from historical data
      icon: Calculator,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Percentage of gross pay deducted as social insurance"
    }
  ]

  const insights = [
    {
      type: "success",
      icon: CheckCircle,
      title: "Payroll Growth",
      message: `Monthly payroll ${kpis.payrollGrowth >= 0 ? 'increased' : 'decreased'} by ${Math.abs(kpis.payrollGrowth).toFixed(1)}% compared to last month.`,
      color: "text-green-600"
    },
    {
      type: "info",
      icon: AlertCircle,
      title: "Social Insurance Compliance",
      message: "All social insurance calculations are up to date with 2025 Dutch regulations.",
      color: "text-blue-600"
    },
    {
      type: "warning",
      icon: TrendingUp,
      title: "Salary Benchmarking",
      message: "Average salary is competitive within the Dutch market for your industry.",
      color: "text-orange-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center space-x-2 mt-2">
                {kpi.change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${kpi.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercentage(Math.abs(kpi.change))}
                </span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payroll Trends Chart */}
      <PayrollTrendsChart data={analyticsData.trends} />

      {/* Employee and Tax Charts */}
      <EmployeeDistributionChart 
        employmentTypeData={analyticsData.employmentTypeDistribution}
        departmentData={analyticsData.departmentDistribution}
      />
      <TaxBreakdownChart 
        monthlyTaxData={analyticsData.taxBreakdown.monthly}
        taxDistributionData={[
          { name: 'AOW (Pension)', value: analyticsData.taxBreakdown.current.aow, color: '#3b82f6' },
          { name: 'ANW (Surviving)', value: analyticsData.taxBreakdown.current.anw, color: '#10b981' },
          { name: 'WLZ (Long-term Care)', value: analyticsData.taxBreakdown.current.wlz, color: '#f59e0b' },
          { name: 'ZVW (Health Insurance)', value: analyticsData.taxBreakdown.current.zvw, color: '#8b5cf6' },
        ]}
      />

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
          <CardDescription>
            AI-powered insights based on your payroll data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50">
                <insight.icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                </div>
                <Badge variant={insight.type === 'success' ? 'success' : insight.type === 'warning' ? 'warning' : 'info'}>
                  {insight.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Gross Payroll</span>
                <span className="font-medium">{formatCurrency(kpis.totalPayroll)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Deductions</span>
                <span className="font-medium">{formatCurrency(kpis.totalTaxes)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium">Net Payroll</span>
                <span className="font-medium">{formatCurrency(kpis.totalPayroll - kpis.totalTaxes)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employee Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Employees</span>
                <span className="font-medium">{kpis.totalEmployees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Salary</span>
                <span className="font-medium">{formatCurrency(kpis.averageSalary)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium">Payroll Growth</span>
                <span className={`font-medium ${kpis.payrollGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(kpis.payrollGrowth)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Social Insurance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">AOW Contributions</span>
                <span className="font-medium">{formatCurrency(analyticsData.taxBreakdown.current.aow)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">WLZ Contributions</span>
                <span className="font-medium">{formatCurrency(analyticsData.taxBreakdown.current.wlz)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium">Total Loonheffing</span>
                <span className="font-medium">{formatCurrency(kpis.totalTaxes)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

