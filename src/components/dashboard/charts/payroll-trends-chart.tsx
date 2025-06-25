"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface PayrollTrendsProps {
  data?: Array<{
    month: string
    totalPayroll: number
    employees: number
    averageSalary: number
  }>
}

// Sample data for demonstration
const sampleData = [
  { month: 'Jan', totalPayroll: 45000, employees: 12, averageSalary: 3750 },
  { month: 'Feb', totalPayroll: 47000, employees: 12, averageSalary: 3917 },
  { month: 'Mar', totalPayroll: 48500, employees: 13, averageSalary: 3731 },
  { month: 'Apr', totalPayroll: 52000, employees: 13, averageSalary: 4000 },
  { month: 'May', totalPayroll: 54000, employees: 14, averageSalary: 3857 },
  { month: 'Jun', totalPayroll: 56000, employees: 14, averageSalary: 4000 },
]

export default function PayrollTrendsChart({ data = sampleData }: PayrollTrendsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label} 2025`}</p>
          <p className="text-blue-600">
            {`Total Payroll: ${formatCurrency(payload[0].value)}`}
          </p>
          <p className="text-green-600">
            {`Employees: ${payload[0].payload.employees}`}
          </p>
          <p className="text-purple-600">
            {`Avg Salary: ${formatCurrency(payload[0].payload.averageSalary)}`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span>Payroll Trends</span>
        </CardTitle>
        <CardDescription>
          Monthly payroll expenses and employee growth over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="totalPayroll" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(data[data.length - 1]?.totalPayroll || 0)}
            </p>
            <p className="text-sm text-gray-500">Current Month</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {data[data.length - 1]?.employees || 0}
            </p>
            <p className="text-sm text-gray-500">Active Employees</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(data[data.length - 1]?.averageSalary || 0)}
            </p>
            <p className="text-sm text-gray-500">Average Salary</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

