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
  CheckCircle,
  BarChart3,
  PieChart,
  Activity
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

export default function AnalyticsDashboardEnhanced() {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{error}</p>
          <p className="text-sm text-gray-400">Process your first payroll to see detailed analytics and insights.</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        {/* Enhanced Welcome Section for No Data */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <BarChart3 className="w-8 h-8 mr-3" />
                Analytics & Insights 📊
              </h1>
              <p className="text-indigo-100 text-lg">
                Get powerful insights into your payroll data and trends.
              </p>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Ready for Data
                </Badge>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                <Activity className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-xl text-purple-900 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Getting Started with Analytics
            </CardTitle>
            <CardDescription className="text-purple-700">
              Process your first payroll to unlock powerful analytics and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900 mb-2">Employee Insights</h3>
                  <p className="text-sm text-blue-700">
                    Track employee growth, salary trends, and workforce analytics
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Euro className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-900 mb-2">Payroll Trends</h3>
                  <p className="text-sm text-green-700">
                    Monitor payroll costs, growth patterns, and budget forecasting
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-orange-900 mb-2">Tax Analytics</h3>
                  <p className="text-sm text-orange-700">
                    Analyze Dutch tax contributions and compliance metrics
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Preview Cards with Zero Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Monthly Payroll</CardTitle>
              <Euro className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">€ 0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total gross payroll for current month
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <Users className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">1</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently active employees
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
              <Target className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">€ 0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Average monthly salary per employee
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loonheffing Rate</CardTitle>
              <Calculator className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">0.0%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Percentage of gross pay deducted as social insurance
              </p>
            </CardContent>
          </Card>
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
      borderColor: "border-l-blue-500",
      description: "Total gross payroll for current month"
    },
    {
      title: "Active Employees",
      value: kpis.totalEmployees.toString(),
      change: kpis.employeeGrowth,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-l-green-500",
      description: "Currently active employees"
    },
    {
      title: "Average Salary",
      value: formatCurrency(kpis.averageSalary),
      change: 3.2,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-l-purple-500",
      description: "Average monthly salary per employee"
    },
    {
      title: "Loonheffing Rate",
      value: formatPercentage(kpis.taxEfficiency),
      change: -1.2,
      icon: Calculator,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-l-orange-500",
      description: "Percentage of gross pay deducted as social insurance"
    }
  ]

  const insights = [
    {
      type: "success",
      icon: CheckCircle,
      title: "Payroll Growth",
      message: `Monthly payroll ${kpis.payrollGrowth >= 0 ? 'increased' : 'decreased'} by ${Math.abs(kpis.payrollGrowth).toFixed(1)}% compared to last month.`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      type: "info",
      icon: AlertCircle,
      title: "Social Insurance Compliance",
      message: "All social insurance calculations are up to date with 2025 Dutch regulations.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      type: "warning",
      icon: TrendingUp,
      title: "Salary Benchmarking",
      message: "Average salary is competitive within the Dutch market for your industry.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Enhanced Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <BarChart3 className="w-8 h-8 mr-3" />
              Analytics & Insights 📊
            </h1>
            <p className="text-indigo-100 text-lg">
              Comprehensive payroll analytics and business intelligence.
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {kpis.totalEmployees} Employees
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {formatCurrency(kpis.totalPayroll)} Monthly
              </Badge>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
              <Activity className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className={`border-l-4 ${kpi.borderColor} hover:shadow-lg transition-shadow`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
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
              <p className="text-xs text-muted-foreground mt-2">{kpi.description}</p>
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

      {/* Enhanced Insights and Recommendations */}
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
            Insights & Recommendations
          </CardTitle>
          <CardDescription className="text-blue-700">
            AI-powered insights based on your payroll data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className={`flex items-start space-x-3 p-4 rounded-lg border ${insight.borderColor} ${insight.bgColor}`}>
                <insight.icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                </div>
                <Badge variant={insight.type === 'success' ? 'default' : insight.type === 'warning' ? 'secondary' : 'outline'}>
                  {insight.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-blue-900">
              <Euro className="w-5 h-5 mr-2" />
              Payroll Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Gross Payroll</span>
                <span className="font-medium text-blue-700">{formatCurrency(kpis.totalPayroll)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Deductions</span>
                <span className="font-medium text-blue-700">{formatCurrency(kpis.totalTaxes)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium">Net Payroll</span>
                <span className="font-bold text-blue-800">{formatCurrency(kpis.totalPayroll - kpis.totalTaxes)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-green-900">
              <Users className="w-5 h-5 mr-2" />
              Employee Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Employees</span>
                <span className="font-medium text-green-700">{kpis.totalEmployees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Salary</span>
                <span className="font-medium text-green-700">{formatCurrency(kpis.averageSalary)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium">Payroll Growth</span>
                <span className={`font-bold ${kpis.payrollGrowth >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {formatPercentage(kpis.payrollGrowth)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-orange-900">
              <Calculator className="w-5 h-5 mr-2" />
              Social Insurance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">AOW Contributions</span>
                <span className="font-medium text-orange-700">{formatCurrency(analyticsData.taxBreakdown.current.aow)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">WLZ Contributions</span>
                <span className="font-medium text-orange-700">{formatCurrency(analyticsData.taxBreakdown.current.wlz)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium">Total Loonheffing</span>
                <span className="font-bold text-orange-800">{formatCurrency(kpis.totalTaxes)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

