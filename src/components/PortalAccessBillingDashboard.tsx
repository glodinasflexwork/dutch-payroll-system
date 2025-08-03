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
  Euro, 
  TrendingUp, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface BillingSummary {
  summary: {
    activeUsers: number
    pendingInvitations: number
    maxPortalUsers: number
    availableSlots: number
    monthlyRevenue: number
    pendingRevenue: number
    totalRevenue: number
    totalBilled: number
    totalPaid: number
    outstandingAmount: number
  }
  quota: {
    totalInvitationsSent: number
    totalAcceptances: number
    totalCancellations: number
    lastUpdated: string
  } | null
  activeUsers: Array<{
    id: string
    employeeId: string
    monthlyRate: number
    startDate: string
    totalBilled: number
    totalPaid: number
  }>
  pendingInvitations: Array<{
    id: string
    employeeId: string
    monthlyRate: number
    invitationSentAt: string | null
  }>
  recentTransactions: Array<{
    id: string
    type: string
    amount: number
    description: string | null
    paymentStatus: string
    createdAt: string
    employeeId: string
  }>
  subscription: {
    planName: string
    planPrice: number
    status: string
  } | null
}

interface PortalAccessBillingDashboardProps {
  companyId: string
}

export default function PortalAccessBillingDashboard({ companyId }: PortalAccessBillingDashboardProps) {
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBillingSummary()
    const interval = setInterval(fetchBillingSummary, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [companyId])

  const fetchBillingSummary = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/billing/portal-access/summary?companyId=${companyId}`)
      if (!response.ok) throw new Error('Failed to fetch billing summary')
      const data = await response.json()
      setBillingSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL')
  }

  const getUsagePercentage = () => {
    if (!billingSummary) return 0
    const { activeUsers, pendingInvitations, maxPortalUsers } = billingSummary.summary
    return ((activeUsers + pendingInvitations) / maxPortalUsers) * 100
  }

  const getAcceptanceRate = () => {
    if (!billingSummary?.quota) return 0
    const { totalInvitationsSent, totalAcceptances } = billingSummary.quota
    return totalInvitationsSent > 0 ? (totalAcceptances / totalInvitationsSent) * 100 : 0
  }

  // Prepare chart data
  const usageData = billingSummary ? [
    { name: 'Active Users', value: billingSummary.summary.activeUsers, color: '#10B981' },
    { name: 'Pending Invitations', value: billingSummary.summary.pendingInvitations, color: '#F59E0B' },
    { name: 'Available Slots', value: billingSummary.summary.availableSlots, color: '#E5E7EB' }
  ] : []

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

  if (!billingSummary) {
    return <div>No billing data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Portal Access Billing</h1>
          <p className="text-gray-600">Manage employee portal access and billing</p>
        </div>
        <Button onClick={fetchBillingSummary} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingSummary.summary.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(billingSummary.summary.monthlyRevenue)}/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingSummary.summary.pendingInvitations}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(billingSummary.summary.pendingRevenue)} potential
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingSummary.summary.availableSlots}</div>
            <p className="text-xs text-muted-foreground">
              of {billingSummary.summary.maxPortalUsers} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(billingSummary.summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              All time revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Alert */}
      {getUsagePercentage() > 80 && (
        <Alert variant={getUsagePercentage() > 95 ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You're using {Math.round(getUsagePercentage())}% of your portal access limit. 
            {getUsagePercentage() > 95 ? (
              <span className="font-medium"> Consider upgrading your plan to add more employees.</span>
            ) : (
              <span> Consider upgrading your plan if you need to add more employees.</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Active Users</TabsTrigger>
          <TabsTrigger value="pending">Pending Invitations</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Portal Access Usage</CardTitle>
                <CardDescription>Current usage of your portal access allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Usage</span>
                      <span>{Math.round(getUsagePercentage())}%</span>
                    </div>
                    <Progress value={getUsagePercentage()} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Active Users</span>
                      <span className="font-medium">{billingSummary.summary.activeUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pending Invitations</span>
                      <span className="font-medium">{billingSummary.summary.pendingInvitations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Available Slots</span>
                      <span className="font-medium">{billingSummary.summary.availableSlots}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Portal access billing summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Monthly Revenue</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(billingSummary.summary.monthlyRevenue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Pending Revenue</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(billingSummary.summary.pendingRevenue)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Billed</span>
                      <span className="font-medium">{formatCurrency(billingSummary.summary.totalBilled)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Paid</span>
                      <span className="font-medium">{formatCurrency(billingSummary.summary.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Outstanding</span>
                      <span className="font-medium">{formatCurrency(billingSummary.summary.outstandingAmount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            {billingSummary.quota && (
              <Card>
                <CardHeader>
                  <CardTitle>Invitation Statistics</CardTitle>
                  <CardDescription>Portal access invitation performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {Math.round(getAcceptanceRate())}%
                      </div>
                      <div className="text-sm text-gray-500">Acceptance Rate</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-medium">{billingSummary.quota.totalInvitationsSent}</div>
                        <div className="text-gray-500">Sent</div>
                      </div>
                      <div>
                        <div className="font-medium">{billingSummary.quota.totalAcceptances}</div>
                        <div className="text-gray-500">Accepted</div>
                      </div>
                      <div>
                        <div className="font-medium">{billingSummary.quota.totalCancellations}</div>
                        <div className="text-gray-500">Cancelled</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription Info */}
            {billingSummary.subscription && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Subscription</CardTitle>
                  <CardDescription>Your current plan and limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{billingSummary.subscription.planName}</span>
                      <Badge className={
                        billingSummary.subscription.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {billingSummary.subscription.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Plan Price</span>
                      <span className="font-medium">{formatCurrency(billingSummary.subscription.planPrice)}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Portal Users Limit</span>
                      <span className="font-medium">{billingSummary.summary.maxPortalUsers} users</span>
                    </div>
                    <Button className="w-full" variant="outline">
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Portal Users</CardTitle>
              <CardDescription>Employees with active portal access</CardDescription>
            </CardHeader>
            <CardContent>
              {billingSummary.activeUsers.length > 0 ? (
                <div className="space-y-3">
                  {billingSummary.activeUsers.map((user) => (
                    <div key={user.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Employee #{user.employeeId}</div>
                        <div className="text-sm text-gray-500">
                          Active since {formatDate(user.startDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(user.monthlyRate)}/month</div>
                        <div className="text-sm text-gray-500">
                          Billed: {formatCurrency(user.totalBilled)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No active portal users</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>Employees with pending portal access invitations</CardDescription>
            </CardHeader>
            <CardContent>
              {billingSummary.pendingInvitations.length > 0 ? (
                <div className="space-y-3">
                  {billingSummary.pendingInvitations.map((invitation) => (
                    <div key={invitation.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Employee #{invitation.employeeId}</div>
                        <div className="text-sm text-gray-500">
                          {invitation.invitationSentAt 
                            ? `Invited on ${formatDate(invitation.invitationSentAt)}`
                            : 'Invitation not sent yet'
                          }
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(invitation.monthlyRate)}/month</div>
                        <div className="text-sm text-blue-600">Pending acceptance</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No pending invitations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Billing Transactions</CardTitle>
              <CardDescription>Portal access billing history</CardDescription>
            </CardHeader>
            <CardContent>
              {billingSummary.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {billingSummary.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {transaction.description || `${transaction.type} for Employee #${transaction.employeeId}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                        <Badge className={
                          transaction.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : transaction.paymentStatus === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {transaction.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No billing transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

