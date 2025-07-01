"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Euro } from "lucide-react"

interface TaxBreakdownProps {
  monthlyTaxData?: Array<{
    month: string
    aow: number
    anw: number
    wlz: number
    zvw: number
  }>
  taxDistributionData?: Array<{
    name: string
    value: number
    color: string
  }>
}

// Sample data for demonstration - Dutch social insurance contributions only
const sampleMonthlyTaxData = [
  { month: 'Jan', aow: 3200, anw: 45, wlz: 1450, zvw: 850 },
  { month: 'Feb', aow: 3300, anw: 47, wlz: 1500, zvw: 880 },
  { month: 'Mar', aow: 3400, anw: 48, wlz: 1550, zvw: 910 },
  { month: 'Apr', aow: 3600, anw: 52, wlz: 1640, zvw: 960 },
  { month: 'May', aow: 3800, anw: 54, wlz: 1730, zvw: 1010 },
  { month: 'Jun', aow: 4000, anw: 56, wlz: 1820, zvw: 1060 },
]

const sampleTaxDistributionData = [
  { name: 'AOW (Pension)', value: 4000, color: '#3b82f6' },
  { name: 'ANW (Surviving)', value: 56, color: '#10b981' },
  { name: 'WLZ (Long-term Care)', value: 1820, color: '#f59e0b' },
  { name: 'ZVW (Health Insurance)', value: 1060, color: '#8b5cf6' },
]

export default function TaxBreakdownChart({ 
  monthlyTaxData = sampleMonthlyTaxData,
  taxDistributionData = sampleTaxDistributionData 
}: TaxBreakdownProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, item: any) => sum + item.value, 0)
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label} 2025`}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} style={{ color: item.color }}>
              {`${item.dataKey.toUpperCase()}: ${formatCurrency(item.value)}`}
            </p>
          ))}
          <div className="border-t pt-1 mt-1">
            <p className="font-medium text-gray-900">
              {`Total: ${formatCurrency(total)}`}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const total = taxDistributionData.reduce((sum, item) => sum + item.value, 0)
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p style={{ color: data.color }}>
            {`Amount: ${formatCurrency(data.value)}`}
          </p>
          <p className="text-gray-600">
            {`${((data.value / total) * 100).toFixed(1)}% of total`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Tax Trends */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <span>Monthly Loonheffing Breakdown</span>
          </CardTitle>
          <CardDescription>
            Breakdown of social insurance contributions over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTaxData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="aow" stackId="a" fill="#3b82f6" />
                <Bar dataKey="anw" stackId="a" fill="#10b981" />
                <Bar dataKey="wlz" stackId="a" fill="#f59e0b" />
                <Bar dataKey="zvw" stackId="a" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Current Month Tax Distribution */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Euro className="w-5 h-5 text-green-600" />
            <span>Current Loonheffing Distribution</span>
          </CardTitle>
          <CardDescription>
            Breakdown of social insurance contributions for current month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taxDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {taxDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {taxDistributionData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm text-gray-600">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(taxDistributionData.reduce((sum, item) => sum + item.value, 0))}
              </p>
              <p className="text-sm text-gray-500">Total Tax Deductions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

