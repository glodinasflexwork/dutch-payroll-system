'use client'

import React from 'react'
import EmployeePortalAccess from '@/components/EmployeePortalAccess'
import EmployeeProfileEnhanced from '@/components/EmployeeProfileEnhanced'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Mock employee data for testing
const mockEmployee = {
  id: 'emp-123',
  employeeNumber: 'EMP001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@company.com',
  phone: '+31 6 12345678',
  position: 'Software Developer',
  department: 'Engineering',
  startDate: '2024-01-15',
  salary: 5000,
  salaryType: 'monthly',
  workingHours: 40,
  contractType: 'Permanent',
  employmentType: 'Full-time',
  portalAccessStatus: 'NO_ACCESS' as const,
  isActive: true,
  
  // Address information
  streetName: 'Damrak',
  houseNumber: '123',
  city: 'Amsterdam',
  postalCode: '1012 AB',
  country: 'Netherlands',
  
  // Personal information
  dateOfBirth: '1990-05-15',
  bsn: '123456789',
  nationality: 'Dutch',
  bankAccount: 'NL91 ABNA 0417 1643 00',
  bankName: 'ABN AMRO',
  
  // Emergency contact
  emergencyContact: 'Jane Doe',
  emergencyPhone: '+31 6 87654321',
  emergencyRelation: 'Spouse'
}

const mockCompanyId = 'company-123'

export default function TestPortalBillingPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Portal Access Billing System</h1>
        <p className="text-xl text-gray-600">Test Implementation</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
          <p className="font-medium">🧪 This is a test page demonstrating the portal access billing system</p>
          <p className="text-sm">In production, this would be integrated into your HR dashboard with real authentication</p>
        </div>
      </div>

      <Tabs defaultValue="employee-profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employee-profile">Employee Profile</TabsTrigger>
          <TabsTrigger value="portal-access">Portal Access Control</TabsTrigger>
          <TabsTrigger value="api-demo">API Demo</TabsTrigger>
        </TabsList>

        <TabsContent value="employee-profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Employee Profile</CardTitle>
              <CardDescription>
                Complete employee profile with integrated portal access management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeProfileEnhanced 
                employee={mockEmployee}
                companyId={mockCompanyId}
                onUpdate={() => console.log('Employee updated')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portal-access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portal Access Control</CardTitle>
              <CardDescription>
                Standalone portal access management component with billing integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeePortalAccess 
                employee={mockEmployee}
                companyId={mockCompanyId}
                onStatusChange={() => console.log('Portal access status changed')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-demo" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>Available portal access billing APIs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Billing Check</h4>
                  <code className="block text-sm bg-gray-100 p-2 rounded">
                    GET /api/billing/portal-access/check?companyId={mockCompanyId}
                  </code>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Enable Portal Access</h4>
                  <code className="block text-sm bg-gray-100 p-2 rounded">
                    POST /api/billing/portal-access/enable
                  </code>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Billing Summary</h4>
                  <code className="block text-sm bg-gray-100 p-2 rounded">
                    GET /api/billing/portal-access/summary?companyId={mockCompanyId}
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features Implemented</CardTitle>
                <CardDescription>Portal access billing system capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Pay-per-employee portal access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Billing integration with subscription limits</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Automated invitation system</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Real-time usage monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Comprehensive billing dashboard</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Enhanced employee profiles</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">✅ System Ready for Production</CardTitle>
          <CardDescription className="text-green-700">
            The portal access billing system is fully implemented and ready for integration
          </CardDescription>
        </CardHeader>
        <CardContent className="text-green-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Backend Implementation</h4>
              <ul className="text-sm space-y-1">
                <li>• Billing database models</li>
                <li>• Portal access APIs</li>
                <li>• Subscription integration</li>
                <li>• Email automation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Frontend Components</h4>
              <ul className="text-sm space-y-1">
                <li>• Enhanced employee profiles</li>
                <li>• Portal access controls</li>
                <li>• Billing dashboard</li>
                <li>• Usage monitoring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

