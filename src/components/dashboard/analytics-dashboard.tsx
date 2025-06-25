"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PayrollTrendsChart from "./charts/payroll-trends-chart"
import EmployeeDistributionChart from "./charts/employee-distribution-chart"
import TaxBreakdownChart from "./charts/tax-breakdown-chart"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Euro, 
  Calculator,
  Target,
  AlertCircle,
  CheckCircle
} from "lucide-react"

interface AnalyticsDashboardProps {
  data?: {
    totalPayroll: number
    totalEmployees: number
    averageSalary: number
    totalTaxes: number
    payrollGrowth: number
    employeeGrowth: number
    taxEfficiency: number
  }
}

// Sample KPI data
const sampleData = {
  totalPayroll: 56000,
  totalEmployees: 14,
  averageSalary: 4000,
  totalTaxes: 21050,
  payrollGrowth: 12.5,
  employeeGrowth: 8.3,
  taxEfficiency: 37.6,
}

export default function AnalyticsDashboard({ data = sampleData }: AnalyticsDashboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const kpis = [
    {
      title: "Total Monthly Payroll",
      value: formatCurrency(data.totalPayroll),
      change: data.payrollGrowth,
      icon: Euro,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Total gross payroll for current month"
    },
    {
      title: "Active Employees",
      value: data.totalEmployees.toString(),
      change: data.employeeGrowth,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Currently active employees"
    },
    {
      title: "Average Salary",
      value: formatCurrency(data.averageSalary),
      change: 3.2,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Average monthly salary per employee"
    },
    {
      title: "Tax Efficiency",
      value: formatPercentage(data.taxEfficiency),
      change: -1.2,
      icon: Calculator,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Percentage of gross pay deducted as taxes"
    }
  ]

  const insights = [
    {
      type: "success",
      icon: CheckCircle,
      title: "Payroll Growth",
      message: "Monthly payroll increased by 12.5% compared to last month, indicating business growth.",
      color: "text-green-600"
    },
    {
      type: "info",
      icon: AlertCircle,
      title: "Tax Compliance",
      message: "All tax calculations are up to date with 2025 Dutch tax regulations.",
      color: "text-blue-600"
    },
    {
      type: "warning",
      icon: TrendingUp,
      title: "Salary Benchmarking",
      message: "Average salary is competitive within the Dutch market for your industry.",
      color: "text-orange-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center space-x-2 mt-2">
                {kpi.change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${kpi.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercentage(Math.abs(kpi.change))}
                </span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payroll Trends Chart */}
      <PayrollTrendsChart />

      {/* Employee and Tax Charts */}
      <EmployeeDistributionChart />
      <TaxBreakdownChart />

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
          <CardDescription>
            AI-powered insights based on your payroll data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50">
                <insight.icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                </div>
                <Badge variant={insight.type === 'success' ? 'success' : insight.type === 'warning' ? 'warning' : 'info'}>
                  {insight.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Gross Payroll</span>
                <span className="font-medium">{formatCurrency(data.totalPayroll)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Deductions</span>
                <span className="font-medium">{formatCurrency(data.totalTaxes)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium">Net Payroll</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(data.totalPayroll - data.totalTaxes)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employee Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Employees</span>
                <span className="font-medium">{data.totalEmployees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Employees</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hourly Employees</span>
                <span className="font-medium">6</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium">Avg. Salary</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(data.averageSalary)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tax Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tax Rate</span>
                <span className="font-medium">{formatPercentage(data.taxEfficiency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Social Security</span>
                <span className="font-medium">18.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Income Tax</span>
                <span className="font-medium">19.4%</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium">Compliance</span>
                <Badge variant="success">2025 Rates</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

