'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building, 
  CreditCard,
  FileText,
  Settings,
  Shield
} from 'lucide-react'
import EmployeePortalAccess from './EmployeePortalAccess'

interface Employee {
  id: string
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  department: string
  startDate: string
  endDate?: string
  salary: number
  salaryType: string
  workingHours: number
  contractType: string
  employmentType: string
  portalAccessStatus: 'NO_ACCESS' | 'INVITED' | 'ACTIVE'
  invitedAt?: string
  isActive: boolean
  
  // Address information
  streetName?: string
  houseNumber?: string
  houseNumberAddition?: string
  city?: string
  postalCode?: string
  country: string
  
  // Personal information
  dateOfBirth: string
  bsn: string
  nationality: string
  bankAccount?: string
  bankName?: string
  
  // Emergency contact
  emergencyContact?: string
  emergencyPhone?: string
  emergencyRelation?: string
}

interface EmployeeProfileEnhancedProps {
  employee: Employee
  companyId: string
  onUpdate?: () => void
}

export default function EmployeeProfileEnhanced({ 
  employee, 
  companyId, 
  onUpdate 
}: EmployeeProfileEnhancedProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL')
  }

  const getEmploymentStatusBadge = () => {
    if (!employee.isActive) {
      return <Badge variant="destructive">Inactive</Badge>
    }
    if (employee.endDate && new Date(employee.endDate) < new Date()) {
      return <Badge variant="destructive">Ended</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {employee.firstName} {employee.lastName}
                </CardTitle>
                <CardDescription className="text-lg">
                  {employee.position} • {employee.department}
                </CardDescription>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline">#{employee.employeeNumber}</Badge>
                  {getEmploymentStatusBadge()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Start Date</div>
              <div className="font-medium">{formatDate(employee.startDate)}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="portal">Portal Access</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{employee.email || 'Not provided'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">{employee.phone || 'Not provided'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="font-medium">
                      {employee.streetName && employee.houseNumber ? (
                        <>
                          {employee.streetName} {employee.houseNumber}
                          {employee.houseNumberAddition}
                          <br />
                          {employee.postalCode} {employee.city}
                          <br />
                          {employee.country}
                        </>
                      ) : (
                        'Not provided'
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Employment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Position</div>
                  <div className="font-medium">{employee.position}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Department</div>
                  <div className="font-medium">{employee.department || 'Unassigned'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contract Type</div>
                  <div className="font-medium">{employee.contractType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Working Hours</div>
                  <div className="font-medium">{employee.workingHours} hours/week</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Salary</div>
                  <div className="font-medium">
                    {formatCurrency(employee.salary)} 
                    <span className="text-sm text-gray-500 ml-1">
                      ({employee.salaryType})
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Date of Birth</div>
                  <div className="font-medium">{formatDate(employee.dateOfBirth)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">BSN</div>
                  <div className="font-medium">{employee.bsn}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Nationality</div>
                  <div className="font-medium">{employee.nationality}</div>
                </div>
              </CardContent>
            </Card>

            {/* Banking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Bank Account</div>
                  <div className="font-medium">{employee.bankAccount || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Bank Name</div>
                  <div className="font-medium">{employee.bankName || 'Not provided'}</div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{employee.emergencyContact || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium">{employee.emergencyPhone || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Relation</div>
                  <div className="font-medium">{employee.emergencyRelation || 'Not provided'}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Employee Number</div>
                  <div className="font-medium">{employee.employeeNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Employment Type</div>
                  <div className="font-medium">{employee.employmentType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contract Type</div>
                  <div className="font-medium">{employee.contractType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Start Date</div>
                  <div className="font-medium">{formatDate(employee.startDate)}</div>
                </div>
                {employee.endDate && (
                  <div>
                    <div className="text-sm text-gray-500">End Date</div>
                    <div className="font-medium">{formatDate(employee.endDate)}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compensation */}
            <Card>
              <CardHeader>
                <CardTitle>Compensation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Base Salary</div>
                  <div className="font-medium text-lg">{formatCurrency(employee.salary)}</div>
                  <div className="text-sm text-gray-500">Per {employee.salaryType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Working Hours</div>
                  <div className="font-medium">{employee.workingHours} hours per week</div>
                </div>
                {employee.salaryType === 'hourly' && (
                  <div>
                    <div className="text-sm text-gray-500">Hourly Rate</div>
                    <div className="font-medium">
                      {formatCurrency(employee.salary / employee.workingHours)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portal" className="space-y-4">
          <EmployeePortalAccess 
            employee={employee}
            companyId={companyId}
            onStatusChange={onUpdate}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Employee Documents
              </CardTitle>
              <CardDescription>
                Manage contracts, payslips, and other employee documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Document management coming soon</p>
                <p className="text-sm">Upload and manage employee contracts, payslips, and other documents</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Edit Employee
        </Button>
        <Button variant="outline">
          <Shield className="h-4 w-4 mr-2" />
          Permissions
        </Button>
      </div>
    </div>
  )
}

