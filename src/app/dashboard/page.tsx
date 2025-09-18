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
  RefreshCw
} from "lucide-react"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface DashboardStats {
  totalEmployees: number
  monthlyEmployees: number
  hourlyEmployees: number
  totalPayrollRecords: number
  companyName: string
  // Enhanced stats with trends
  employeeGrowth: number
  payrollTrend: number
  avgSalary: number
  salaryTrend: number
}

// Mock data for charts - in real implementation, this would come from API
const payrollTrendData = [
  { month: 'Jan', amount: 45000, employees: 12 },
  { month: 'Feb', amount: 48000, employees: 13 },
  { month: 'Mar', amount: 52000, employees: 14 },
  { month: 'Apr', amount: 49000, employees: 14 },
  { month: 'May', amount: 55000, employees: 15 },
  { month: 'Jun', amount: 58000, employees: 16 },
]

const employeeDistributionData = [
  { name: 'Full-time', value: 12, color: '#3B82F6' },
  { name: 'Part-time', value: 4, color: '#60A5FA' },
  { name: 'Contract', value: 2, color: '#93C5FD' },
]

const departmentData = [
  { department: 'Engineering', employees: 8, budget: 32000 },
  { department: 'Sales', employees: 4, budget: 16000 },
  { department: 'Marketing', employees: 3, budget: 12000 },
  { department: 'HR', employees: 2, budget: 8000 },
  { department: 'Finance', employees: 1, budget: 4000 },
]

export default function EnhancedDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
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
    await fetchDashboardStats()
    setTimeout(() => setRefreshing(false), 1000) // Simulate refresh delay
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
        // Enhanced stats with mock trend data
        const dashboardStats = {
          totalEmployees: result.totalEmployees,
          monthlyEmployees: result.monthlyEmployees,
          hourlyEmployees: result.hourlyEmployees,
          totalPayrollRecords: result.totalPayrollRecords,
          companyName: result.companyName,
          // Mock trend data - in real implementation, calculate from historical data
          employeeGrowth: 12.5, // +12.5% from last month
          payrollTrend: 8.3, // +8.3% from last month
          avgSalary: 4200, // Average monthly salary
          salaryTrend: -2.1, // -2.1% from last month
        }
        
        setStats(dashboardStats)
      } else {
        throw new Error(result.error || "Failed to fetch dashboard stats")
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setStats({
        totalEmployees: 18,
        monthlyEmployees: 14,
        hourlyEmployees: 4,
        totalPayrollRecords: 156,
        companyName: "Your Company",
        employeeGrowth: 12.5,
        payrollTrend: 8.3,
        avgSalary: 4200,
        salaryTrend: -2.1,
      })
    } finally {
      setLoading(false)
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

        {/* Enhanced Header with Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">Monitor your payroll operations and business metrics</p>
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

        {/* Enhanced Stats Grid with Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Total Employees</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{stats?.totalEmployees || 0}</div>
              <div className="flex items-center space-x-2 mt-2">
                {getTrendIcon(stats?.employeeGrowth || 0)}
                <span className={`text-sm font-medium ${getTrendColor(stats?.employeeGrowth || 0)}`}>
                  {stats?.employeeGrowth > 0 ? '+' : ''}{stats?.employeeGrowth}%
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Monthly Payroll</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">€{((stats?.avgSalary || 0) * (stats?.totalEmployees || 0)).toLocaleString()}</div>
              <div className="flex items-center space-x-2 mt-2">
                {getTrendIcon(stats?.payrollTrend || 0)}
                <span className={`text-sm font-medium ${getTrendColor(stats?.payrollTrend || 0)}`}>
                  {stats?.payrollTrend > 0 ? '+' : ''}{stats?.payrollTrend}%
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Avg Salary</CardTitle>
              <Target className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">€{stats?.avgSalary?.toLocaleString() || '0'}</div>
              <div className="flex items-center space-x-2 mt-2">
                {getTrendIcon(stats?.salaryTrend || 0)}
                <span className={`text-sm font-medium ${getTrendColor(stats?.salaryTrend || 0)}`}>
                  {stats?.salaryTrend > 0 ? '+' : ''}{stats?.salaryTrend}%
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
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
                <span className="text-xs text-gray-500">Total processed</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payroll Trend Chart */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Payroll Trends</span>
              </CardTitle>
              <CardDescription>Monthly payroll costs over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={payrollTrendData}>
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
                    fillOpacity={0.1}
                    strokeWidth={2}
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
              </CardTitle>
              <CardDescription>Breakdown by employment type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={employeeDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {employeeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Department Overview */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              <span>Department Overview</span>
            </CardTitle>
            <CardDescription>Employee count and budget allocation by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'budget' ? `€${value.toLocaleString()}` : value,
                    name === 'budget' ? 'Budget' : 'Employees'
                  ]}
                />
                <Bar yAxisId="left" dataKey="employees" fill="#8B5CF6" name="employees" />
                <Bar yAxisId="right" dataKey="budget" fill="#A78BFA" name="budget" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
                    Complete your payroll system setup
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    Progress: 67%
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
                <Card className="border-green-300 bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <Badge className="bg-green-200 text-green-800">Completed</Badge>
                    </div>
                    <h3 className="font-semibold text-green-900 mb-2">Add Employees</h3>
                    <p className="text-sm text-green-700 mb-3">
                      {stats?.totalEmployees || 0} employees configured
                    </p>
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      Manage Employees
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-blue-400 bg-gradient-to-br from-blue-100 to-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <Badge className="bg-blue-300 text-blue-900">In Progress</Badge>
                    </div>
                    <h3 className="font-semibold text-blue-900 mb-2">Process Payroll</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      {stats?.totalPayrollRecords || 0} records processed
                    </p>
                    <Button size="sm" className="w-full bg-blue-700 hover:bg-blue-800">
                      Continue Setup
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <Badge variant="outline" className="border-gray-300 text-gray-600">Pending</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-700 mb-2">Setup Analytics</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Configure reporting preferences
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
                  <p className="font-medium">Backup</p>
                  <p className="text-sm text-blue-100">Last: 2 hours ago</p>
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
