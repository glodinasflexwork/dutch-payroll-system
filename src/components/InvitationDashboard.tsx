'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Mail, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Play, 
  Pause, 
  RefreshCw,
  Settings,
  TrendingUp,
  Activity
} from 'lucide-react'

interface InvitationDashboardProps {
  companyId: string
}

interface MonitoringMetrics {
  overview: {
    totalEmployees: number
    needingInvitations: number
    invited: number
    active: number
    acceptanceRate: number
    avgResponseTime: number
  }
  recentActivity: {
    last24Hours: {
      invitationsSent: number
      acceptances: number
      failures: number
    }
    last7Days: {
      invitationsSent: number
      acceptances: number
      failures: number
    }
  }
  healthChecks: {
    stuckInvitations: number
    expiredTokens: number
    failureRate: number
    systemStatus: 'healthy' | 'warning' | 'critical'
    warnings: string[]
    errors: string[]
  }
  trends: {
    dailyInvitations: Array<{
      date: string
      sent: number
      accepted: number
    }>
    departmentBreakdown: Array<{
      department: string
      total: number
      invited: number
      active: number
    }>
  }
}

interface SchedulerState {
  config: {
    enabled: boolean
    batchSize: number
    rateLimitDelay: number
    maxRetries: number
    retryDelay: number
    scheduleInterval: number
  }
  lastRun: string
  isRunning: boolean
  stats: {
    totalRuns: number
    successfulRuns: number
    failedRuns: number
    lastError?: string
  }
  nextRun: string | null
}

export default function InvitationDashboard({ companyId }: InvitationDashboardProps) {
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null)
  const [schedulerState, setSchedulerState] = useState<SchedulerState | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [companyId])

  const fetchData = async () => {
    try {
      setError(null)
      
      // Fetch monitoring metrics
      const metricsResponse = await fetch(`/api/employees/invitations/monitoring?companyId=${companyId}`)
      if (!metricsResponse.ok) throw new Error('Failed to fetch metrics')
      const metricsData = await metricsResponse.json()
      setMetrics(metricsData)

      // Fetch scheduler state
      const schedulerResponse = await fetch(`/api/employees/invitations/scheduler?companyId=${companyId}`)
      if (!schedulerResponse.ok) throw new Error('Failed to fetch scheduler state')
      const schedulerData = await schedulerResponse.json()
      setSchedulerState(schedulerData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSchedulerAction = async (action: string, config?: any) => {
    try {
      setActionLoading(action)
      const response = await fetch('/api/employees/invitations/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, action, config })
      })

      if (!response.ok) throw new Error('Action failed')
      
      await fetchData() // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleBatchInvitation = async () => {
    try {
      setActionLoading('batch')
      const response = await fetch('/api/employees/invitations/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, sendImmediately: true })
      })

      if (!response.ok) throw new Error('Batch invitation failed')
      
      await fetchData() // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch invitation failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRetryFailed = async () => {
    try {
      setActionLoading('retry')
      const response = await fetch('/api/employees/invitations/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
      })

      if (!response.ok) throw new Error('Retry failed')
      
      await fetchData() // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Retry failed')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!metrics || !schedulerState) {
    return <div>No data available</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'critical': return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      default: return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employee Portal Invitations</h1>
          <p className="text-gray-600">Automated invitation management and monitoring</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => fetchData()} 
            variant="outline"
            disabled={actionLoading !== null}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Alert */}
      {metrics.healthChecks.systemStatus !== 'healthy' && (
        <Alert variant={metrics.healthChecks.systemStatus === 'critical' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {metrics.healthChecks.errors.map((error, index) => (
                <div key={index} className="font-medium text-red-600">{error}</div>
              ))}
              {metrics.healthChecks.warnings.map((warning, index) => (
                <div key={index} className="text-yellow-600">{warning}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Active employees with email
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needing Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.overview.needingInvitations}</div>
            <p className="text-xs text-muted-foreground">
              Employees without portal access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portal Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.overview.active}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.overview.acceptanceRate.toFixed(1)}% acceptance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(metrics.healthChecks.systemStatus)}`}></div>
              {getStatusBadge(metrics.healthChecks.systemStatus)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.healthChecks.failureRate.toFixed(1)}% failure rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Invitation Progress</CardTitle>
              <CardDescription>Overall progress of employee portal invitations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Portal Access Progress</span>
                    <span>{Math.round((metrics.overview.active / metrics.overview.totalEmployees) * 100)}%</span>
                  </div>
                  <Progress value={(metrics.overview.active / metrics.overview.totalEmployees) * 100} />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{metrics.overview.active}</div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{metrics.overview.invited}</div>
                    <div className="text-sm text-gray-600">Invited</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{metrics.overview.needingInvitations}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Department Breakdown</CardTitle>
              <CardDescription>Portal access status by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.trends.departmentBreakdown.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{dept.department}</div>
                      <div className="text-sm text-gray-600">
                        {dept.total} employees
                      </div>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-green-600">{dept.active} active</span>
                      <span className="text-blue-600">{dept.invited} invited</span>
                      <span className="text-orange-600">{dept.total - dept.active - dept.invited} pending</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          {/* Scheduler Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Automated Scheduler</span>
              </CardTitle>
              <CardDescription>Configure and monitor automated invitation processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      Status: {schedulerState.config.enabled ? 
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge> : 
                        <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
                      }
                    </div>
                    <div className="text-sm text-gray-600">
                      {schedulerState.config.enabled ? 
                        `Runs every ${schedulerState.config.scheduleInterval} minutes` :
                        'Automatic processing is disabled'
                      }
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {schedulerState.config.enabled ? (
                      <Button 
                        onClick={() => handleSchedulerAction('stop')}
                        variant="outline"
                        disabled={actionLoading !== null}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleSchedulerAction('start')}
                        disabled={actionLoading !== null}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleSchedulerAction('run_now')}
                      variant="outline"
                      disabled={actionLoading !== null || schedulerState.isRunning}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Run Now
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Last Run</div>
                    <div className="text-sm text-gray-600">
                      {schedulerState.lastRun ? new Date(schedulerState.lastRun).toLocaleString() : 'Never'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Next Run</div>
                    <div className="text-sm text-gray-600">
                      {schedulerState.nextRun ? new Date(schedulerState.nextRun).toLocaleString() : 'Not scheduled'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{schedulerState.stats.totalRuns}</div>
                    <div className="text-sm text-gray-600">Total Runs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{schedulerState.stats.successfulRuns}</div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{schedulerState.stats.failedRuns}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>

                {schedulerState.stats.lastError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Last error: {schedulerState.stats.lastError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          {/* Health Checks */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Monitor system performance and identify issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">{metrics.healthChecks.stuckInvitations}</div>
                    <div className="text-sm text-gray-600">Stuck Invitations</div>
                    <div className="text-xs text-gray-500">Pending &gt; 7 days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{metrics.healthChecks.expiredTokens}</div>
                    <div className="text-sm text-gray-600">Expired Tokens</div>
                    <div className="text-xs text-gray-500">Need cleanup</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{metrics.healthChecks.failureRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Failure Rate</div>
                    <div className="text-xs text-gray-500">Last 30 days</div>
                  </div>
                </div>

                {(metrics.healthChecks.warnings.length > 0 || metrics.healthChecks.errors.length > 0) && (
                  <div className="space-y-2">
                    {metrics.healthChecks.errors.map((error, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ))}
                    {metrics.healthChecks.warnings.map((warning, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{warning}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Invitation activity over recent periods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="font-medium mb-2">Last 24 Hours</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Invitations Sent</span>
                      <span className="font-medium">{metrics.recentActivity.last24Hours.invitationsSent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Acceptances</span>
                      <span className="font-medium">{metrics.recentActivity.last24Hours.acceptances}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Failures</span>
                      <span className="font-medium">{metrics.recentActivity.last24Hours.failures}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-2">Last 7 Days</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Invitations Sent</span>
                      <span className="font-medium">{metrics.recentActivity.last7Days.invitationsSent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Acceptances</span>
                      <span className="font-medium">{metrics.recentActivity.last7Days.acceptances}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Failures</span>
                      <span className="font-medium">{metrics.recentActivity.last7Days.failures}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          {/* Manual Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Actions</CardTitle>
              <CardDescription>Perform manual invitation operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleBatchInvitation}
                    disabled={actionLoading !== null}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Mail className="h-6 w-6 mb-2" />
                    <span>Send Batch Invitations</span>
                    <span className="text-xs opacity-75">
                      {metrics.overview.needingInvitations} employees pending
                    </span>
                  </Button>

                  <Button 
                    onClick={handleRetryFailed}
                    disabled={actionLoading !== null}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <RefreshCw className="h-6 w-6 mb-2" />
                    <span>Retry Failed Invitations</span>
                    <span className="text-xs opacity-75">
                      {metrics.healthChecks.stuckInvitations} stuck invitations
                    </span>
                  </Button>
                </div>

                {actionLoading && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Processing {actionLoading}... This may take a few moments.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

