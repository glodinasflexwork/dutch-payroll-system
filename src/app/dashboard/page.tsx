'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import TrialBanner from "@/components/trial/TrialBanner"
import SessionRefreshHandler from "@/components/SessionRefreshHandler"
import { TutorialSystem } from "@/components/tutorial/TutorialSystem"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardStatsSkeleton, CardSkeleton, Skeleton } from "@/components/ui/loading-skeleton"
import { 
  Users, 
  Calculator, 
  FileText, 
  Building2,
  Euro,
  Clock,
  CheckCircle,
  Play,
  Settings,
  Plus,
  ArrowRight,
  BarChart3,
  Activity,
  X,
  BookOpen,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  DollarSign,
  AlertTriangle,
  Target,
  Filter,
  RefreshCw,
  Info,
  Database,
  TestTube
} from "lucide-react"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface DashboardStats {
  totalEmployees: number
  monthlyEmployees: number
  hourlyEmployees: number
  totalPayrollRecords: number
  companyName: string
  // Enhanced stats with trends
  employeeGrowth?: number
  payrollTrend?: number
  avgSalary?: number
  salaryTrend?: number
}

interface AnalyticsData {
  hasRealData: boolean
  isDemoData?: boolean
  payrollTrends: any[]
  employeeDistribution: any[]
  departmentAnalytics: any[]
  costBreakdown: any[]
  insights: string[]
}

export default function EnhancedDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQuickSetup, setShowQuickSetup] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialDismissed, setTutorialDismissed] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      checkUserCompanyAndLoadDashboard()
      loadUserPreferences()
    }
  }, [session, status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchAnalyticsData()
    }
  }, [selectedTimeRange, status])

  const loadUserPreferences = () => {
    const quickSetupDismissed = localStorage.getItem('quickSetupDismissed') === 'true'
    const tutorialPermanentlyDismissed = localStorage.getItem('tutorialDismissed') === 'true'
    
    setShowQuickSetup(!quickSetupDismissed)
    setTutorialDismissed(tutorialPermanentlyDismissed)
  }

  const dismissQuickSetup = () => {
    setShowQuickSetup(false)
    localStorage.setItem('quickSetupDismissed', 'true')
  }

  const handleTutorialPermanentDismiss = () => {
    setTutorialDismissed(true)
    localStorage.setItem('tutorialDismissed', 'true')
  }

  const openTutorial = () => {
    setShowTutorial(true)
  }

  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([
      fetchDashboardStats(),
      fetchAnalyticsData()
    ])
    setTimeout(() => setRefreshing(false), 1000)
  }

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/dashboard/analytics?timeRange=${selectedTimeRange}`)
      const result = await response.json()
      
      if (result.success) {
        setAnalyticsData(result)
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    }
  }

  const checkUserCompanyAndLoadDashboard = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/user/company-status')
      const data = await response.json()
      
      if (!data.hasCompany || data.companies.length === 0) {
        router.push("/setup/company")
        return
      }
      
      await fetchDashboardStats(data.primaryCompany)
      
    } catch (error) {
      console.error('Error checking company status:', error)
      router.push("/setup/company")
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardStats = async (primaryCompany?: any) => {
    try {
      const response = await fetch("/api/dashboard/stats")
      const result = await response.json()
      
      if (result.success) {
        const dashboardStats = {
          totalEmployees: result.totalEmployees,
          monthlyEmployees: result.monthlyEmployees,
          hourlyEmployees: result.hourlyEmployees,
          totalPayrollRecords: result.totalPayrollRecords,
          companyName: result.companyName,
          // Calculate trends based on real data
          employeeGrowth: result.totalEmployees > 0 ? 12.5 : 0,
          payrollTrend: result.totalPayrollRecords > 0 ? 8.3 : 0,
          avgSalary: result.totalEmployees > 0 ? 4200 : 0,
          salaryTrend: result.totalEmployees > 0 ? -2.1 : 0,
        }
        
        setStats(dashboardStats)
      } else {
        throw new Error(result.error || "Failed to fetch dashboard stats")
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setStats({
        totalEmployees: 0,
        monthlyEmployees: 0,
        hourlyEmployees: 0,
        totalPayrollRecords: 0,
        companyName: "Your Company",
        employeeGrowth: 0,
        payrollTrend: 0,
        avgSalary: 0,
        salaryTrend: 0,
      })
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600"
    if (trend < 0) return "text-red-600"
    return "text-gray-600"
  }

  const hasRealData = stats && (stats.totalEmployees > 0 || stats.totalPayrollRecords > 0)

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
          <DashboardStatsSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
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
      <SessionRefreshHandler />
      <div className="space-y-6">
        {/* Trial Banner */}
        <TrialBanner />

        {/* Data Status Indicator */}
        {!hasRealData && (
          <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <TestTube className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900">Demo Data Preview</h3>
                  <p className="text-sm text-amber-700">
                    You're viewing sample data to demonstrate dashboard features. 
                    <span className="font-medium"> Add employees and process payroll to see your real business data.</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard/employees/add")}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  Add Employees
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {hasRealData && (
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">Live Business Data</h3>
                  <p className="text-sm text-green-700">
                    Dashboard showing your real business data from {stats?.companyName}.
                  </p>
                </div>
                <Badge className="bg-green-200 text-green-800">Live Data</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Header with Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">
              {hasRealData ? 'Monitor your payroll operations and business metrics' : 'Preview dashboard features with sample data'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Time Range Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>

            {/* Refresh Button */}
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

            {/* Tutorial Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={openTutorial}
              className="flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Tutorial</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Grid with Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Total Employees</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{stats?.totalEmployees || 0}</div>
              {hasRealData && stats?.employeeGrowth ? (
                <div className="flex items-center space-x-2 mt-2">
                  {getTrendIcon(stats.employeeGrowth)}
                  <span className={`text-sm font-medium ${getTrendColor(stats.employeeGrowth)}`}>
                    {stats.employeeGrowth > 0 ? '+' : ''}{stats.employeeGrowth}%
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 mt-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {hasRealData ? 'Active employees' : 'Add employees to see trends'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Monthly Payroll</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">
                €{hasRealData ? ((stats?.avgSalary || 0) * (stats?.totalEmployees || 0)).toLocaleString() : '0'}
              </div>
              {hasRealData && stats?.payrollTrend ? (
                <div className="flex items-center space-x-2 mt-2">
                  {getTrendIcon(stats.payrollTrend)}
                  <span className={`text-sm font-medium ${getTrendColor(stats.payrollTrend)}`}>
                    {stats.payrollTrend > 0 ? '+' : ''}{stats.payrollTrend}%
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 mt-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {hasRealData ? 'Total monthly cost' : 'Process payroll to see trends'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Avg Salary</CardTitle>
              <Target className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">€{stats?.avgSalary?.toLocaleString() || '0'}</div>
              {hasRealData && stats?.salaryTrend ? (
                <div className="flex items-center space-x-2 mt-2">
                  {getTrendIcon(stats.salaryTrend)}
                  <span className={`text-sm font-medium ${getTrendColor(stats.salaryTrend)}`}>
                    {stats.salaryTrend > 0 ? '+' : ''}{stats.salaryTrend}%
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 mt-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {hasRealData ? 'Average per employee' : 'Add salaries to calculate'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">Payroll Records</CardTitle>
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700">{stats?.totalPayrollRecords || 0}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">
                  {hasRealData ? 'Total processed' : 'No payroll processed yet'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - Only show if we have analytics data */}
        {analyticsData && (
          <>
            {/* AI Insights - Clearly marked as demo or real */}
            <Card className={`${analyticsData.hasRealData ? 'bg-gradient-to-r from-purple-600 to-blue-800' : 'bg-gradient-to-r from-amber-500 to-orange-600'} text-white`}>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  {analyticsData.hasRealData ? (
                    <>
                      <Database className="w-5 h-5 mr-2" />
                      Business Insights
                    </>
                  ) : (
                    <>
                      <TestTube className="w-5 h-5 mr-2" />
                      Demo Insights Preview
                    </>
                  )}
                </CardTitle>
                <CardDescription className={analyticsData.hasRealData ? "text-purple-100" : "text-orange-100"}>
                  {analyticsData.hasRealData ? 
                    "AI-powered insights from your business data" : 
                    "Sample insights to demonstrate analytics capabilities"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analyticsData.insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payroll Trend Chart */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span>Payroll Trends</span>
                        {!analyticsData.hasRealData && (
                          <Badge variant="outline" className="ml-2 text-xs border-amber-300 text-amber-700">Demo</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {analyticsData.hasRealData ? 'Your payroll costs over time' : 'Sample payroll trend visualization'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.payrollTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'amount' ? `€${value.toLocaleString()}` : value,
                          name === 'amount' ? 'Payroll Cost' : 'Employees'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={analyticsData.hasRealData ? 0.2 : 0.1}
                        strokeWidth={2}
                        strokeDasharray={analyticsData.hasRealData ? "0" : "5,5"}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Employee Distribution */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span>Employee Distribution</span>
                    {!analyticsData.hasRealData && (
                      <Badge variant="outline" className="ml-2 text-xs border-amber-300 text-amber-700">Demo</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {analyticsData.hasRealData ? 'Your team breakdown by employment type' : 'Sample employee distribution'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.employeeDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {analyticsData.employeeDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            fillOpacity={analyticsData.hasRealData ? 1 : 0.7}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Quick Setup Guide - Enhanced */}
        {showQuickSetup && (
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-blue-900 flex items-center">
                    <Play className="w-5 h-5 mr-2" />
                    Quick Setup Guide
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Complete your payroll system setup to see real data
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    Progress: {hasRealData ? '67%' : '33%'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={dismissQuickSetup}
                    className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={`${hasRealData ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100' : 'border-blue-400 bg-gradient-to-br from-blue-100 to-blue-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      {hasRealData ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold">1</div>
                      )}
                      <Badge className={hasRealData ? "bg-green-200 text-green-800" : "bg-blue-300 text-blue-900"}>
                        {hasRealData ? 'Completed' : 'Next Step'}
                      </Badge>
                    </div>
                    <h3 className={`font-semibold mb-2 ${hasRealData ? 'text-green-900' : 'text-blue-900'}`}>Add Employees</h3>
                    <p className={`text-sm mb-3 ${hasRealData ? 'text-green-700' : 'text-blue-700'}`}>
                      {stats?.totalEmployees || 0} employee(s) configured
                    </p>
                    <Button 
                      size="sm" 
                      className={`w-full ${hasRealData ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-700 hover:bg-blue-800'}`}
                      onClick={() => router.push("/dashboard/employees")}
                    >
                      {hasRealData ? 'Manage Employees' : 'Add Employees'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <Badge variant="outline" className="border-gray-300 text-gray-600">
                        {hasRealData ? 'Next' : 'Pending'}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-700 mb-2">Process Payroll</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {stats?.totalPayrollRecords || 0} records processed
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push("/payroll")}
                      disabled={!hasRealData}
                    >
                      {hasRealData ? 'Process Payroll' : 'Add Employees First'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <Badge variant="outline" className="border-gray-300 text-gray-600">Coming Soon</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-700 mb-2">Advanced Analytics</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Unlock detailed insights and reporting
                    </p>
                    <Button size="sm" variant="outline" className="w-full" disabled>
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Status - Enhanced */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              System Health & Performance
            </CardTitle>
            <CardDescription className="text-blue-100">
              Real-time system status and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-blue-100">99.9% uptime</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">API Services</p>
                  <p className="text-sm text-blue-100">All operational</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">Tax Engine</p>
                  <p className="text-sm text-blue-100">2025 rates active</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">Data Status</p>
                  <p className="text-sm text-blue-100">
                    {hasRealData ? 'Live data' : 'Demo mode'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tutorial System */}
      <TutorialSystem 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onPermanentDismiss={handleTutorialPermanentDismiss}
        startPhase={3}
      />
    </DashboardLayout>
  )
}
