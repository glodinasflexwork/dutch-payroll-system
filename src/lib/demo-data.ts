// Demo data service for SalarySync sandbox mode
// Generates realistic sample data for demonstration purposes

export interface DemoEmployee {
  id: string
  name: string
  email: string
  position: string
  department: string
  salary: number
  startDate: string
  employmentType: 'full-time' | 'part-time' | 'contract'
  isActive: boolean
}

export interface DemoPayrollRecord {
  id: string
  employeeId: string
  employeeName: string
  period: string
  grossSalary: number
  netSalary: number
  taxes: number
  socialContributions: number
  processedDate: string
}

export interface DemoStats {
  totalEmployees: number
  monthlyEmployees: number
  hourlyEmployees: number
  totalPayrollRecords: number
  avgSalary: number
  monthlyPayroll: number
  employeeGrowth: number
  payrollTrend: number
  salaryTrend: number
}

export interface DemoAnalytics {
  payrollTrends: Array<{
    month: string
    amount: number
    employees: number
  }>
  employeeDistribution: Array<{
    department: string
    count: number
    avgSalary: number
  }>
  insights: string[]
}

// Sample employee data
const DEMO_EMPLOYEES: DemoEmployee[] = [
  {
    id: 'demo-emp-1',
    name: 'Emma van der Berg',
    email: 'emma.vandenberg@demo.nl',
    position: 'Senior Software Engineer',
    department: 'Engineering',
    salary: 75000,
    startDate: '2023-01-15',
    employmentType: 'full-time',
    isActive: true
  },
  {
    id: 'demo-emp-2',
    name: 'Lars Janssen',
    email: 'lars.janssen@demo.nl',
    position: 'Product Manager',
    department: 'Product',
    salary: 68000,
    startDate: '2023-03-01',
    employmentType: 'full-time',
    isActive: true
  },
  {
    id: 'demo-emp-3',
    name: 'Sophie de Wit',
    email: 'sophie.dewit@demo.nl',
    position: 'UX Designer',
    department: 'Design',
    salary: 58000,
    startDate: '2023-05-10',
    employmentType: 'full-time',
    isActive: true
  },
  {
    id: 'demo-emp-4',
    name: 'Pieter Bakker',
    email: 'pieter.bakker@demo.nl',
    position: 'Marketing Specialist',
    department: 'Marketing',
    salary: 52000,
    startDate: '2023-07-01',
    employmentType: 'full-time',
    isActive: true
  },
  {
    id: 'demo-emp-5',
    name: 'Anna Smit',
    email: 'anna.smit@demo.nl',
    position: 'HR Manager',
    department: 'Human Resources',
    salary: 62000,
    startDate: '2023-02-15',
    employmentType: 'full-time',
    isActive: true
  },
  {
    id: 'demo-emp-6',
    name: 'Tom van Dijk',
    email: 'tom.vandijk@demo.nl',
    position: 'Sales Representative',
    department: 'Sales',
    salary: 48000,
    startDate: '2023-08-20',
    employmentType: 'full-time',
    isActive: true
  },
  {
    id: 'demo-emp-7',
    name: 'Lisa Mulder',
    email: 'lisa.mulder@demo.nl',
    position: 'Financial Analyst',
    department: 'Finance',
    salary: 55000,
    startDate: '2023-04-12',
    employmentType: 'full-time',
    isActive: true
  },
  {
    id: 'demo-emp-8',
    name: 'Mark Visser',
    email: 'mark.visser@demo.nl',
    position: 'DevOps Engineer',
    department: 'Engineering',
    salary: 72000,
    startDate: '2023-06-01',
    employmentType: 'full-time',
    isActive: true
  }
]

// Generate demo payroll records
function generateDemoPayrollRecords(): DemoPayrollRecord[] {
  const records: DemoPayrollRecord[] = []
  const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09']
  
  months.forEach(month => {
    DEMO_EMPLOYEES.forEach(employee => {
      const grossSalary = employee.salary / 12 // Monthly salary
      const taxes = grossSalary * 0.37 // Dutch tax rate approximation
      const socialContributions = grossSalary * 0.28 // Social contributions
      const netSalary = grossSalary - taxes - socialContributions
      
      records.push({
        id: `demo-payroll-${employee.id}-${month}`,
        employeeId: employee.id,
        employeeName: employee.name,
        period: month,
        grossSalary: Math.round(grossSalary),
        netSalary: Math.round(netSalary),
        taxes: Math.round(taxes),
        socialContributions: Math.round(socialContributions),
        processedDate: `${month}-28`
      })
    })
  })
  
  return records
}

// Generate demo statistics
export function getDemoStats(): DemoStats {
  const employees = DEMO_EMPLOYEES.filter(emp => emp.isActive)
  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0)
  const avgSalary = Math.round(totalSalary / employees.length)
  const monthlyPayroll = Math.round(totalSalary / 12)
  
  return {
    totalEmployees: employees.length,
    monthlyEmployees: employees.filter(emp => emp.employmentType === 'full-time').length,
    hourlyEmployees: employees.filter(emp => emp.employmentType === 'part-time').length,
    totalPayrollRecords: generateDemoPayrollRecords().length,
    avgSalary,
    monthlyPayroll,
    employeeGrowth: 12.5, // 12.5% growth
    payrollTrend: 8.3, // 8.3% increase
    salaryTrend: 5.2 // 5.2% salary increase
  }
}

// Generate demo analytics data
export function getDemoAnalytics(): DemoAnalytics {
  const payrollTrends = [
    { month: 'Jan 2024', amount: 42000, employees: 6 },
    { month: 'Feb 2024', amount: 44500, employees: 7 },
    { month: 'Mar 2024', amount: 46800, employees: 7 },
    { month: 'Apr 2024', amount: 48200, employees: 8 },
    { month: 'May 2024', amount: 49500, employees: 8 },
    { month: 'Jun 2024', amount: 51000, employees: 8 },
    { month: 'Jul 2024', amount: 52300, employees: 8 },
    { month: 'Aug 2024', amount: 53800, employees: 8 },
    { month: 'Sep 2024', amount: 55200, employees: 8 }
  ]

  const employeeDistribution = [
    { name: 'Full-time', value: 12, color: '#3B82F6' },
    { name: 'Part-time', value: 4, color: '#10B981' },
    { name: 'Contract', value: 2, color: '#F59E0B' }
  ]

  const insights = [
    "📊 Engineering department has the highest average salary at €73,500",
    "💡 Employee count grew by 33% over the past 9 months",
    "⚠️ Sales department shows potential for salary adjustment to market rates",
    "🎯 Overall payroll costs increased 31% due to team expansion",
    "📈 Average salary across all departments is €59,750",
    "🔍 Full-time employees represent 100% of current workforce"
  ]

  return {
    payrollTrends,
    employeeDistribution,
    insights
  }
}

// Get demo employees
export function getDemoEmployees(): DemoEmployee[] {
  return DEMO_EMPLOYEES.filter(emp => emp.isActive)
}

// Get demo payroll records
export function getDemoPayrollRecords(): DemoPayrollRecord[] {
  return generateDemoPayrollRecords()
}

// Simulate API delay for realistic experience
export function simulateApiDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Demo data service class
export class DemoDataService {
  static async getStats(): Promise<DemoStats> {
    await simulateApiDelay(300)
    return getDemoStats()
  }

  static async getAnalytics(): Promise<DemoAnalytics> {
    await simulateApiDelay(400)
    return getDemoAnalytics()
  }

  static async getEmployees(): Promise<DemoEmployee[]> {
    await simulateApiDelay(200)
    return getDemoEmployees()
  }

  static async getPayrollRecords(): Promise<DemoPayrollRecord[]> {
    await simulateApiDelay(350)
    return getDemoPayrollRecords()
  }
}
