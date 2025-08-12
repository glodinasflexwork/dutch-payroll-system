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
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral'
    title: string
    description: string
    value?: string
  }>
}

export default function AnalyticsDashboard() {
  const { data: session } = useSession()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch analytics data')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
      
      // Set mock data for development
      setData({
        kpis: {
          totalPayroll: 125000,
          totalEmployees: 15,
          averageSalary: 65000,
          totalTaxes: 45000,
          payrollGrowth: 8.5,
          employeeGrowth: 12.0,
          taxEfficiency: 92.5
        },
        trends: [
          { month: 'Jan', totalPayroll: 110000, employees: 12, averageSalary: 62000, aow: 8500, anw: 1200, wlz: 2800, zvw: 3200 },
          { month: 'Feb', totalPayroll: 115000, employees: 13, averageSalary: 63000, aow: 8800, anw: 1250, wlz: 2900, zvw: 3300 },
          { month: 'Mar', totalPayroll: 125000, employees: 15, averageSalary: 65000, aow: 9500, anw: 1350, wlz: 3100, zvw: 3500 }
        ],
        departmentDistribution: [
          { department: 'Engineering', employees: 8, avgSalary: 75000 },
          { department: 'Sales', employees: 4, avgSalary: 55000 },
          { department: 'Marketing', employees: 2, avgSalary: 60000 },
          { department: 'HR', employees: 1, avgSalary: 50000 }
        ],
        employmentTypeDistribution: [
          { name: 'Full-time', value: 12, color: '#3B82F6' },
          { name: 'Part-time', value: 3, color: '#60A5FA' }
        ],
        insights: [
          {
            type: 'positive',
            title: 'Payroll Growth',
            description: 'Monthly payroll increased by 8.5% compared to last month',
            value: '+8.5%'
          },
          {
            type: 'positive',
            title: 'Team Expansion',
            description: 'Added 2 new employees this month',
            value: '+2'
          },
          {
            type: 'neutral',
            title: 'Tax Compliance',
            description: 'All tax calculations are up to date with 2025 rates'
          }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Professional Header with Blue Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Analytics & Insights 📊</h1>
                <p className="text-blue-100 mt-1">
                  Comprehensive payroll analytics and business intelligence
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Professional Header with Blue Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Analytics & Insights 📊</h1>
                <p className="text-blue-100 mt-1">
                  Comprehensive payroll analytics and business intelligence
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Analytics</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Professional Header with Blue Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Analytics & Insights 📊</h1>
              <p className="text-blue-100 mt-1">
                Comprehensive payroll analytics and business intelligence
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  {data.kpis.totalEmployees} Employees
                </span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  €{data.kpis.totalPayroll.toLocaleString()} Total Payroll
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <div className="text-2xl font-bold">€{Math.round(data.kpis.averageSalary).toLocaleString()}</div>
              <div className="text-sm text-blue-100">Average Salary</div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional KPI Cards - Blue Gradient Variations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Monthly Payroll</CardTitle>
            <Euro className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">€{data.kpis.totalPayroll.toLocaleString()}</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{data.kpis.payrollGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Active Employees</CardTitle>
            <Users className="h-5 w-5 text-blue-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{data.kpis.totalEmployees}</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{data.kpis.employeeGrowth}% growth
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-700 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Average Salary</CardTitle>
            <Target className="h-5 w-5 text-blue-800" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">€{Math.round(data.kpis.averageSalary).toLocaleString()}</div>
            <p className="text-xs text-blue-600 mt-1">
              Per employee annually
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-800 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Loonheffing Rate</CardTitle>
            <Calculator className="h-5 w-5 text-blue-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{data.kpis.taxEfficiency}%</div>
            <p className="text-xs text-blue-600 mt-1">
              Tax calculation accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide for Empty State */}
      {data.kpis.totalEmployees === 0 && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Start Building Analytics</h3>
              <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
                Add employees and process payroll to unlock powerful analytics and insights about your business.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-900">Employee Insights</h4>
                  <p className="text-sm text-blue-700">Track team growth and distribution</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <Euro className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-900">Payroll Trends</h4>
                  <p className="text-sm text-blue-700">Monitor costs and growth patterns</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <Calculator className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-900">Tax Analytics</h4>
                  <p className="text-sm text-blue-700">Optimize tax efficiency and compliance</p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/dashboard/employees'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Your First Employee
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      {data.kpis.totalEmployees > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Payroll Trends
              </CardTitle>
              <CardDescription className="text-blue-700">
                Monthly payroll and employee growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PayrollTrendsChart data={data.trends} />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Employment Types
              </CardTitle>
              <CardDescription className="text-blue-700">
                Distribution of employment contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeDistributionChart data={data.employmentTypeDistribution} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Professional Insights Section */}
      {data.insights && data.insights.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-slate-50">
          <CardHeader>
            <CardTitle className="text-xl text-blue-900 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Key Insights
            </CardTitle>
            <CardDescription className="text-blue-700">
              Important trends and recommendations for your payroll
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-blue-200">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    insight.type === 'positive' ? 'bg-green-500' :
                    insight.type === 'negative' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-blue-900">{insight.title}</h4>
                      {insight.value && (
                        <Badge variant="outline" className="border-blue-300 text-blue-700">
                          {insight.value}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-blue-700 mt-1">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

