'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import TrialBanner from "@/components/trial/TrialBanner"
import SessionRefreshHandler from "@/components/SessionRefreshHandler"
import { TutorialSystem } from "@/components/tutorial/TutorialSystem"
import { InteractiveSetupGuide } from "@/components/ui/interactive-setup-guide"
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
import { useDataMode } from "@/components/ui/data-mode-toggle"
import { Switch } from "@/components/ui/switch"
import { DemoDataService } from "@/lib/demo-data"

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

function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isDemoMode, toggleDataMode } = useDataMode()
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

  // Refresh data when demo mode changes
  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardStats()
      fetchAnalyticsData()
    }
  }, [isDemoMode, status])

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
      // Use demo data if in demo mode
      if (isDemoMode) {
        const demoAnalytics = await DemoDataService.getAnalytics()
        setAnalyticsData({
          hasRealData: false,
          isDemoData: true,
          payrollTrends: demoAnalytics.payrollTrends,
          employeeDistribution: demoAnalytics.employeeDistribution,
          departmentAnalytics: [],
          costBreakdown: [],
          insights: demoAnalytics.insights
        })
        return
      }

      // Fetch real analytics data from API
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
      // Use demo data if in demo mode
      if (isDemoMode) {
        const demoStats = await DemoDataService.getStats()
        setStats({
          totalEmployees: demoStats.totalEmployees,
          monthlyEmployees: demoStats.monthlyEmployees,
          hourlyEmployees: demoStats.hourlyEmployees,
          totalPayrollRecords: demoStats.totalPayrollRecords,
          companyName: "Demo Company B.V.",
          employeeGrowth: demoStats.employeeGrowth,
          payrollTrend: demoStats.payrollTrend,
          avgSalary: demoStats.avgSalary,
          salaryTrend: demoStats.salaryTrend,
        })
        return
      }

      // Fetch real data from API
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
    )
  }

  if (!session) {
    return null
  }

  return (
    <>
      <SessionRefreshHandler />
      <div className="space-y-6">
        {/* Dashboard Controls */}
        <div className="flex justify-end items-center">
          <div className="flex items-center space-x-3">
            {/* Simplified Data Mode Toggle - Just the switch */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Demo</span>
              <Switch
                checked={!isDemoMode}
                onCheckedChange={toggleDataMode}
                className="data-[state=checked]:bg-green-600"
              />
              <span className="text-sm text-gray-600">Live</span>
            </div>

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

        {/* Charts Section */}
        {analyticsData ? (
          <>
            {/* AI Insights - Only show for real data */}
            {analyticsData.hasRealData && (
              <Card className="bg-gradient-to-r from-purple-600 to-blue-800 text-white">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Business Insights
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    AI-powered insights from your business data
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
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payroll Trend Chart */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span>Payroll Trends</span>
                    </div>
                    {isDemoMode && (
                      <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">Demo</Badge>
                    )}
                  </CardTitle>
                      <CardDescription>
                        {analyticsData.hasRealData ? 'Your payroll costs over time' : 'Sample payroll trend visualization'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {analyticsData.hasRealData || isDemoMode ? (
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
                  ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <BarChart3 className="w-12 h-12 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">No Payroll Data Available</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Process payroll for at least 2 months to see trend analysis
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push('/payroll')}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Process First Payroll
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Employee Distribution */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <span>Employee Distribution</span>
                    </div>
                    {isDemoMode && (
                      <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">Demo</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {analyticsData.hasRealData ? 'Your team breakdown by employment type' : 'Sample employee distribution'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.hasRealData || isDemoMode ? (
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
                              fillOpacity={analyticsData.hasRealData ? 1 : 0.3}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Users className="w-12 h-12 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">No Employee Data Available</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Add employees to your company to see distribution charts
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push('/employees/add')}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          Add First Employee
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          !isDemoMode && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Empty Payroll Chart */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span>Payroll Trends</span>
                  </CardTitle>
                  <CardDescription>Track your payroll costs over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <BarChart3 className="w-12 h-12 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">No Payroll Data Available</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Process payroll for at least 2 months to see trend analysis
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push('/payroll')}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        Process First Payroll
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Empty Employee Chart */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span>Employee Distribution</span>
                  </CardTitle>
                  <CardDescription>View your team breakdown by employment type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Users className="w-12 h-12 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">No Employee Data Available</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add employees to your company to see distribution charts
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push('/employees/add')}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        Add First Employee
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        )}

      </div>

      {/* Interactive Setup Guide - Stripe Style */}
      <InteractiveSetupGuide 
        isOpen={showQuickSetup}
        onClose={dismissQuickSetup}
      />

      {/* Tutorial System */}
      <TutorialSystem 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onPermanentDismiss={handleTutorialPermanentDismiss}
        startPhase={3}
      />
    </>
  )
}

// Main export component - layout will be handled by layout.tsx
export default function EnhancedDashboard() {
  return <DashboardContent />
}
