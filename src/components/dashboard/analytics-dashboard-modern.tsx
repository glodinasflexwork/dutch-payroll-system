'use client'

import { useState, useEffect } from 'react'
import { useDataMode } from "@/components/ui/data-mode-toggle"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AnalyticsData {
  hasRealData: boolean
  isDemoData?: boolean
  payrollTrends: any[]
  employeeDistribution: any[]
  departmentAnalytics: any[]
  costBreakdown: any[]
  insights: string[]
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  ComposedChart,
  Legend,
  ScatterChart,
  Scatter
} from 'recharts'
import { InteractiveSetupGuide } from "@/components/ui/interactive-setup-guide"

// Enhanced mock data for comprehensive analytics
const payrollAnalyticsData = [
  { month: 'Jan 2024', totalCost: 45000, employees: 12, avgSalary: 3750, overtime: 2400, benefits: 6750 },
  { month: 'Feb 2024', totalCost: 48000, employees: 13, avgSalary: 3692, overtime: 2800, benefits: 7200 },
  { month: 'Mar 2024', totalCost: 52000, employees: 14, avgSalary: 3714, overtime: 3200, benefits: 7800 },
  { month: 'Apr 2024', totalCost: 49000, employees: 14, avgSalary: 3500, overtime: 2600, benefits: 7350 },
  { month: 'May 2024', totalCost: 55000, employees: 15, avgSalary: 3667, overtime: 3800, benefits: 8250 },
  { month: 'Jun 2024', totalCost: 58000, employees: 16, avgSalary: 3625, overtime: 4200, benefits: 8700 },
  { month: 'Jul 2024', totalCost: 61000, employees: 17, avgSalary: 3588, overtime: 4600, benefits: 9150 },
  { month: 'Aug 2024', totalCost: 59000, employees: 17, avgSalary: 3471, overtime: 4100, benefits: 8850 },
  { month: 'Sep 2024', totalCost: 63000, employees: 18, avgSalary: 3500, overtime: 4800, benefits: 9450 },
]

const departmentAnalytics = [
  { 
    department: 'Engineering', 
    employees: 8, 
    totalCost: 32000, 
    avgSalary: 4000,
    productivity: 92,
    satisfaction: 4.2,
    turnover: 5
  },
  { 
    department: 'Sales', 
    employees: 4, 
    totalCost: 16000, 
    avgSalary: 4000,
    productivity: 88,
    satisfaction: 4.0,
    turnover: 12
  },
  { 
    department: 'Marketing', 
    employees: 3, 
    totalCost: 12000, 
    avgSalary: 4000,
    productivity: 85,
    satisfaction: 4.1,
    turnover: 8
  },
  { 
    department: 'HR', 
    employees: 2, 
    totalCost: 8000, 
    avgSalary: 4000,
    productivity: 90,
    satisfaction: 4.3,
    turnover: 0
  },
  { 
    department: 'Finance', 
    employees: 1, 
    totalCost: 4000, 
    avgSalary: 4000,
    productivity: 95,
    satisfaction: 4.5,
    turnover: 0
  },
]

const employeePerformanceData = [
  { experience: 1, salary: 3200, performance: 75 },
  { experience: 2, salary: 3500, performance: 82 },
  { experience: 3, salary: 3800, performance: 88 },
  { experience: 4, salary: 4200, performance: 91 },
  { experience: 5, salary: 4500, performance: 94 },
  { experience: 6, salary: 4800, performance: 96 },
  { experience: 7, salary: 5200, performance: 95 },
  { experience: 8, salary: 5500, performance: 97 },
]

const costBreakdownData = [
  { name: 'Base Salaries', value: 45000, color: '#3B82F6' },
  { name: 'Benefits', value: 9450, color: '#10B981' },
  { name: 'Overtime', value: 4800, color: '#F59E0B' },
  { name: 'Taxes & Contributions', value: 12600, color: '#EF4444' },
  { name: 'Training & Development', value: 2400, color: '#8B5CF6' },
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1']

interface AnalyticsDashboardProps {
  analyticsData?: AnalyticsData | null
  className?: string
  showSetupGuide?: boolean
}

export default function ModernAnalyticsDashboard({ analyticsData, className, showSetupGuide }: AnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('9months')
  const [selectedMetric, setSelectedMetric] = useState('totalCost')
  const [refreshing, setRefreshing] = useState(false)
  const [insights, setInsights] = useState<string[]>([])
  const { isDemoMode, toggleDemoMode } = useDataMode()

  // Get the appropriate data based on mode and availability
  const getDisplayData = () => {
    if (isDemoMode) {
      return {
        payrollTrends: payrollAnalyticsData,
        departmentAnalytics: departmentAnalytics,
        employeePerformance: employeePerformanceData,
        costBreakdown: costBreakdownData,
        isDemo: true
      }
    } else if (analyticsData?.hasRealData) {
      return {
        payrollTrends: analyticsData.payrollTrends || [],
        departmentAnalytics: analyticsData.departmentAnalytics || [],
        employeePerformance: analyticsData.employeePerformance || [],
        costBreakdown: analyticsData.costBreakdown || [],
        isDemo: false
      }
    } else {
      // Live mode but no real data - show empty states
      return {
        payrollTrends: [],
        departmentAnalytics: [],
        employeePerformance: [],
        costBreakdown: [],
        isDemo: false
      }
    }
  }

  const displayData = getDisplayData()

  // Calculate key metrics from current data
  const getKeyMetrics = () => {
    if (isDemoMode) {
      return {
        totalCost: 63000,
        costPerEmployee: 3500,
        overtimeHours: 156,
        satisfaction: 4.2
      }
    } else if (analyticsData?.hasRealData) {
      const trends = displayData.payrollTrends
      if (trends.length === 0) {
        return {
          totalCost: 0,
          costPerEmployee: 0,
          overtimeHours: 0,
          satisfaction: 0
        }
      }
      
      const latest = trends[trends.length - 1]
      return {
        totalCost: latest.amount || 0,
        costPerEmployee: latest.employees > 0 ? Math.round((latest.amount || 0) / latest.employees) : 0,
        overtimeHours: latest.overtime || 0,
        satisfaction: 4.0 // Default for live data
      }
    } else {
      // Live mode but no real data
      return {
        totalCost: 0,
        costPerEmployee: 0,
        overtimeHours: 0,
        satisfaction: 0
      }
    }
  }

  const keyMetrics = getKeyMetrics()





  useEffect(() => {
    // Generate AI-powered insights based on data mode
    const generateInsights = () => {
      if (isDemoMode) {
        const demoInsights = [
          "📈 Payroll costs increased 8.3% this month, primarily due to overtime",
          "⚠️ Engineering department shows highest productivity but also highest turnover risk", 
          "💡 Average salary growth is outpacing industry standards by 12%",
          "🎯 Q3 budget utilization is at 94% - on track for yearly targets"
        ]
        setInsights(demoInsights)
      } else if (analyticsData?.hasRealData) {
        // Use real insights from analyticsData
        if (analyticsData?.insights && analyticsData.insights.length > 0) {
          setInsights(analyticsData.insights)
        } else {
          setInsights([
            "📊 Your payroll data is being analyzed for insights",
            "🔍 More insights will appear as you process additional payroll cycles"
          ])
        }
      } else {
        // Live mode but no real data
        setInsights([
          "📊 Add employees and process payroll to generate AI-powered insights",
          "🔍 Insights will appear here once you have sufficient payroll data"
        ])
      }
    }

    generateInsights()
  }, [selectedTimeRange, isDemoMode, analyticsData])

  const refreshData = async () => {
    setRefreshing(true)
    
    // Trigger a re-fetch of data by calling the parent's fetch function
    // This will be passed down as a prop or we can emit an event
    try {
      if (!isDemoMode) {
        // Force refresh of live data
        const response = await fetch("/api/dashboard/analytics?timeRange=" + selectedTimeRange, {
          cache: 'no-store'
        })
        const result = await response.json()
        
        if (result.success) {
          // The parent component should handle this, but we can show a success message
          console.log("Data refreshed successfully")
        }
      }
      
      // Simulate refresh delay for demo mode
      setTimeout(() => setRefreshing(false), 1500)
    } catch (error) {
      console.error("Error refreshing data:", error)
      setTimeout(() => setRefreshing(false), 1500)
    }
  }

  const exportData = () => {
    // Simulate data export
    console.log('Exporting analytics data...')
  }

  const getMetricColor = (metric: string) => {
    const colors = {
      totalCost: '#3B82F6',
      employees: '#10B981',
      avgSalary: '#F59E0B',
      overtime: '#EF4444'
    }
    return colors[metric as keyof typeof colors] || '#6B7280'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {showSetupGuide && !isDemoMode && !analyticsData?.hasRealData && (
        <InteractiveSetupGuide
          title="Unlock Your Payroll Analytics"
          description="Start by adding employees and processing payroll to see powerful insights into your workforce costs and trends."
          steps={[
            { title: "Add Your First Employee", description: "Go to People > Employees and add details for your team members.", link: "/dashboard/employees" },
            { title: "Process Your First Payroll", description: "Navigate to Payroll > Run Payroll to calculate and finalize payments.", link: "/dashboard/payroll" },
            { title: "Explore Detailed Reports", description: "Visit the Reports section to generate comprehensive payroll summaries.", link: "/dashboard/reports" },
          ]}
        />
      )}
      {/* Analytics Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>

        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="9months">Last 9 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>

          {/* Demo/Live Toggle */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Demo</span>
              <Switch
                checked={!isDemoMode}
                onCheckedChange={() => toggleDemoMode()}
                className="data-[state=checked]:bg-green-600"
              />
              <span className="text-sm font-medium text-gray-700">Live</span>
            </div>
            <Badge variant={isDemoMode ? "secondary" : "default"} className="text-xs">
              {isDemoMode ? "Demo Data" : "Live Data"}
            </Badge>
          </div>

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* AI-Powered Insights */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-purple-900">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>AI-Powered Insights</span>
            </div>
            {isDemoMode && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                Demo
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-purple-700">
            Automatically generated insights from your payroll data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isDemoMode && !analyticsData?.hasRealData ? (
            <div className="text-center py-8">
              <Zap className="w-16 h-16 mx-auto mb-4 text-purple-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Yet</h3>
              <p className="text-gray-600 mb-4">
                Add employees and process payroll to unlock AI-powered insights about your workforce.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button asChild variant="default" size="sm">
                  <a href="/dashboard/employees">Add Employees</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="/dashboard/payroll">Process Payroll</a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {keyMetrics.totalCost > 0 ? `€${keyMetrics.totalCost.toLocaleString()}` : '€0'}
            </div>
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>{isDemoMode ? '+8.3% from last month' : 'No trend data yet'}</span>
            </div>
            {!isDemoMode && keyMetrics.totalCost === 0 && (
              <div className="mt-2">
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <a href="/dashboard/payroll">Process Payroll</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Per Employee</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {keyMetrics.costPerEmployee > 0 ? `€${keyMetrics.costPerEmployee.toLocaleString()}` : '€0'}
            </div>
            <div className="flex items-center space-x-1 text-xs text-red-600">
              <TrendingDown className="w-3 h-3" />
              <span>{isDemoMode ? '-2.1% from last month' : 'No trend data yet'}</span>
            </div>
            {!isDemoMode && keyMetrics.costPerEmployee === 0 && (
              <div className="mt-2">
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <a href="/dashboard/employees">Add Employees</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics.overtimeHours}</div>
            <div className="flex items-center space-x-1 text-xs text-yellow-600">
              <AlertTriangle className="w-3 h-3" />
              <span>{isDemoMode ? '+15% from last month' : 'No trend data yet'}</span>
            </div>
            {!isDemoMode && keyMetrics.overtimeHours === 0 && (
              <div className="mt-2">
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <a href="/dashboard/payroll">Track Overtime</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employee Satisfaction</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {keyMetrics.satisfaction > 0 ? `${keyMetrics.satisfaction}/5` : 'N/A'}
            </div>
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>{isDemoMode ? '+0.3 from last quarter' : 'No survey data yet'}</span>
            </div>
            {!isDemoMode && keyMetrics.satisfaction === 0 && (
              <div className="mt-2">
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <a href="/dashboard/employees">Conduct Surveys</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll Trends */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span>Payroll Cost Analysis</span>
                  </div>
                  {isDemoMode && <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">Demo</Badge>}
                </CardTitle>
                <CardDescription>Monthly breakdown of payroll expenses</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <select 
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="totalCost">Total Cost</option>
                  <option value="avgSalary">Avg Salary</option>
                  <option value="overtime">Overtime</option>
                  <option value="benefits">Benefits</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={displayData.payrollTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    typeof value === 'number' && name !== 'employees' ? `€${value.toLocaleString()}` : value,
                    name === 'totalCost' || name === 'amount' ? 'Total Cost' : 
                    name === 'avgSalary' ? 'Avg Salary' :
                    name === 'overtime' ? 'Overtime' :
                    name === 'benefits' ? 'Benefits' :
                    name === 'employees' ? 'Employees' : name
                  ]}
                />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey={selectedMetric === 'totalCost' ? 'amount' : selectedMetric} 
                  fill={getMetricColor(selectedMetric)} 
                  name={selectedMetric === 'totalCost' ? 'Total Cost' : 
                        selectedMetric === 'avgSalary' ? 'Avg Salary' :
                        selectedMetric === 'overtime' ? 'Overtime' :
                        'Benefits'}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="employees" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Employees"
                />
              </ComposedChart>
            </ResponsiveContainer>
            {!isDemoMode && displayData.payrollTrends.length === 0 && (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No payroll data yet</p>
                  <p className="text-sm mb-4">Process payroll to see trends</p>
                  <Button asChild variant="default" size="sm">
                    <a href="/dashboard/payroll">Process First Payroll</a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PieChartIcon className="w-5 h-5 text-green-600" />
                <span>Cost Breakdown</span>
              </div>
              {isDemoMode && <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">Demo</Badge>}
            </CardTitle>
            <CardDescription>Current month expense distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={displayData.costBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {displayData.costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`€${value.toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
            {!isDemoMode && displayData.costBreakdown.length === 0 && (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <PieChartIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No cost data yet</p>
                  <p className="text-sm mb-4">Process payroll to see breakdown</p>
                  <Button asChild variant="default" size="sm">
                    <a href="/dashboard/payroll">Process First Payroll</a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Analytics */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span>Department Performance Matrix</span>
              </div>
              {isDemoMode && <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">Demo</Badge>}
            </CardTitle>
          <CardDescription>Comprehensive view of department metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Department</th>
                  <th className="text-right py-3 px-4 font-medium">Employees</th>
                  <th className="text-right py-3 px-4 font-medium">Total Cost</th>
                  <th className="text-right py-3 px-4 font-medium">Avg Salary</th>
                  <th className="text-right py-3 px-4 font-medium">Productivity</th>
                  <th className="text-right py-3 px-4 font-medium">Satisfaction</th>
                  <th className="text-right py-3 px-4 font-medium">Turnover</th>
                </tr>
              </thead>
              <tbody>
                {displayData.departmentAnalytics.map((dept, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{dept.department}</td>
                    <td className="text-right py-3 px-4">{dept.employees}</td>
                    <td className="text-right py-3 px-4">€{dept.totalCost.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">€{dept.avgSalary.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${dept.productivity}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{dept.productivity}%</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      <Badge variant={dept.satisfaction >= 4.0 ? "default" : "secondary"}>
                        {dept.satisfaction}/5
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-4">
                      <Badge variant={dept.turnover <= 5 ? "default" : dept.turnover <= 10 ? "secondary" : "destructive"}>
                        {dept.turnover}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isDemoMode && displayData.departmentAnalytics.length === 0 && (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="font-medium mb-2">No department data yet</p>
                  <p className="text-sm mb-3">Add employees to departments to see analytics</p>
                  <Button asChild variant="default" size="sm">
                    <a href="/dashboard/employees">Add Employees</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Employee Performance Correlation */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-orange-600" />
                <span>Salary vs Performance Correlation</span>
              </div>
              {isDemoMode && <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">Demo</Badge>}
            </CardTitle>
          <CardDescription>Relationship between experience, salary, and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={displayData.employeePerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="experience" name="Experience (years)" />
              <YAxis dataKey="salary" name="Salary (€)" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'salary' ? `€${value}` : `${value}${name === 'performance' ? '%' : ' years'}`,
                  name === 'salary' ? 'Salary' : name === 'performance' ? 'Performance' : 'Experience'
                ]}
              />
              <Scatter 
                dataKey="salary" 
                fill="#3B82F6"
                r={6}
              />
            </ScatterChart>
          </ResponsiveContainer>
          {!isDemoMode && displayData.employeePerformance.length === 0 && (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No performance data yet</p>
                <p className="text-sm mb-4">Add employee performance reviews to see correlation</p>
                <Button asChild variant="default" size="sm">
                  <a href="/dashboard/employees">Add Performance Reviews</a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
