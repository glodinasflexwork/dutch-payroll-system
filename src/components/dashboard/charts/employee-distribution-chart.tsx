"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building } from "lucide-react"

interface EmployeeDistributionProps {
  employmentTypeData?: Array<{
    name: string
    value: number
    color: string
  }>
  departmentData?: Array<{
    department: string
    employees: number
    avgSalary: number
  }>
}

// Sample data for demonstration
const sampleEmploymentTypeData = [
  { name: 'Monthly', value: 8, color: '#3b82f6' },
  { name: 'Hourly', value: 6, color: '#10b981' },
]

const sampleDepartmentData = [
  { department: 'Engineering', employees: 5, avgSalary: 4500 },
  { department: 'Sales', employees: 3, avgSalary: 3800 },
  { department: 'Marketing', employees: 2, avgSalary: 3500 },
  { department: 'HR', employees: 2, avgSalary: 3200 },
  { department: 'Finance', employees: 2, avgSalary: 4000 },
]

export default function EmployeeDistributionChart({ 
  employmentTypeData = sampleEmploymentTypeData,
  departmentData = sampleDepartmentData 
}: EmployeeDistributionProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p style={{ color: data.color }}>
            {`Employees: ${data.value}`}
          </p>
          <p className="text-gray-600">
            {`${((data.value / employmentTypeData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%`}
          </p>
        </div>
      )
    }
    return null
  }

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">
            {`Employees: ${payload[0].value}`}
          </p>
          <p className="text-green-600">
            {`Avg Salary: ${formatCurrency(payload[0].payload.avgSalary)}`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Employment Type Distribution */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Employment Types</span>
          </CardTitle>
          <CardDescription>
            Distribution of monthly vs hourly employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={employmentTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {employmentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {employmentTypeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm text-gray-600">{item.value} employees</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Distribution */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-green-600" />
            <span>Department Overview</span>
          </CardTitle>
          <CardDescription>
            Employee count and average salary by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="department" 
                  stroke="#666"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar 
                  dataKey="employees" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {departmentData.reduce((sum, dept) => sum + dept.employees, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Employees</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

