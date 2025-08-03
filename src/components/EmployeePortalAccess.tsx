'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Mail, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Loader2,
  Euro,
  Users,
  CreditCard,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  position: string
  department: string
  portalAccessStatus: 'NO_ACCESS' | 'INVITED' | 'ACTIVE'
  invitedAt?: string
}

interface BillingCheck {
  canAddEmployee: boolean
  currentActiveUsers: number
  currentPendingUsers: number
  maxAllowed: number
  availableSlots: number
  cost: number
  currency: string
}

interface EmployeePortalAccessProps {
  employee: Employee
  companyId: string
  onStatusChange?: () => void
}

export default function EmployeePortalAccess({ 
  employee, 
  companyId, 
  onStatusChange 
}: EmployeePortalAccessProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showBillingModal, setShowBillingModal] = useState(false)
  const [billingCheck, setBillingCheck] = useState<BillingCheck | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (employee.portalAccessStatus === 'NO_ACCESS') {
      fetchBillingCheck()
    }
  }, [companyId, employee.portalAccessStatus])

  const fetchBillingCheck = async () => {
    try {
      const response = await fetch(`/api/billing/portal-access/check?companyId=${companyId}`)
      if (!response.ok) throw new Error('Failed to check billing')
      const data = await response.json()
      setBillingCheck(data)
    } catch (err) {
      console.error('Error checking billing:', err)
      setError('Failed to check billing limits')
    }
  }

  const handleEnablePortalAccess = async () => {
    if (!billingCheck?.canAddEmployee) {
      setShowBillingModal(true)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/portal-access/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          employeeId: employee.id,
          sendInvitation: true
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          setShowBillingModal(true)
          return
        }
        throw new Error(data.error || 'Failed to enable portal access')
      }

      toast.success(`Portal access enabled for ${employee.firstName}! Invitation sent to ${employee.email}`)
      
      // Refresh billing check
      await fetchBillingCheck()
      
      // Notify parent component
      onStatusChange?.()

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable portal access'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NO_ACCESS':
        return <Badge variant="secondary">No Access</Badge>
      case 'INVITED':
        return <Badge className="bg-blue-100 text-blue-800">Invitation Sent</Badge>
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">Employee Portal Access</CardTitle>
              <CardDescription>
                Manage portal access for {employee.firstName} {employee.lastName}
              </CardDescription>
            </div>
            {getStatusBadge(employee.portalAccessStatus)}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {employee.portalAccessStatus === 'NO_ACCESS' && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-medium text-blue-900 mb-2">Enable Portal Access</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Give {employee.firstName} access to view payslips, request leave, and manage their profile through the employee portal.
                </p>
                
                {billingCheck && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="space-y-1">
                        <div className="font-medium text-blue-900">
                          Monthly Cost: {formatCurrency(billingCheck.cost)}
                        </div>
                        <div className="text-blue-600">
                          Billed to your company account
                        </div>
                      </div>
                      <div className="text-right text-xs text-blue-600">
                        <div>{billingCheck.availableSlots} of {billingCheck.maxAllowed} slots available</div>
                        <div>{billingCheck.currentActiveUsers} active users</div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleEnablePortalAccess}
                      disabled={isProcessing || !employee.email || !billingCheck.canAddEmployee}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enabling Access...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Enable Portal Access ({formatCurrency(billingCheck.cost)}/month)
                        </>
                      )}
                    </Button>

                    {!billingCheck.canAddEmployee && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          You've reached your portal access limit ({billingCheck.maxAllowed} users). 
                          Upgrade your plan to add more employees.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {!employee.email && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Employee has no email address. Please add an email address before enabling portal access.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}

          {employee.portalAccessStatus === 'INVITED' && (
            <div className="p-4 border rounded-lg bg-yellow-50">
              <div className="flex items-center text-yellow-700 mb-2">
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-medium">Invitation Sent - Awaiting Response</span>
              </div>
              <div className="space-y-2 text-sm text-yellow-600">
                <div>
                  Invitation sent to: <span className="font-medium">{employee.email}</span>
                </div>
                {employee.invitedAt && (
                  <div>
                    Sent on: {new Date(employee.invitedAt).toLocaleDateString('nl-NL')}
                  </div>
                )}
                <div className="text-xs text-yellow-500 mt-2">
                  Billing will start when the employee accepts the invitation and creates their account.
                </div>
              </div>
            </div>
          )}

          {employee.portalAccessStatus === 'ACTIVE' && (
            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center text-green-700 mb-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="font-medium">Portal Access Active</span>
              </div>
              <div className="space-y-2 text-sm text-green-600">
                <div>
                  {employee.firstName} has full access to the employee portal
                </div>
                <div className="flex justify-between items-center">
                  <span>Monthly cost: {billingCheck ? formatCurrency(billingCheck.cost) : '€5.00'}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      // TODO: Implement revoke access
                      toast.info('Revoke access functionality coming soon')
                    }}
                  >
                    Revoke Access
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Employee Details */}
          <div className="pt-4 border-t">
            <h5 className="font-medium mb-2">Employee Details</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Email:</span>
                <div className="font-medium">{employee.email || 'Not provided'}</div>
              </div>
              <div>
                <span className="text-gray-500">Position:</span>
                <div className="font-medium">{employee.position}</div>
              </div>
              <div>
                <span className="text-gray-500">Department:</span>
                <div className="font-medium">{employee.department || 'Unassigned'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Upgrade Modal */}
      <Dialog open={showBillingModal} onOpenChange={setShowBillingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Upgrade Required
            </DialogTitle>
            <DialogDescription>
              You've reached your portal access limit. Upgrade your plan to add more employees.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {billingCheck && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Current Plan</div>
                    <div className="font-medium">
                      {billingCheck.maxAllowed} portal users
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Currently Used</div>
                    <div className="font-medium">
                      {billingCheck.currentActiveUsers + billingCheck.currentPendingUsers} users
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Upgrade your subscription to increase your portal access limit and add more employees.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowBillingModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // TODO: Redirect to billing/upgrade page
                toast.info('Redirecting to upgrade page...')
                setShowBillingModal(false)
              }}
              className="w-full sm:w-auto"
            >
              <Euro className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

