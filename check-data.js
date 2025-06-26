const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkData() {
  try {
    const userCount = await prisma.user.count()
    const companyCount = await prisma.company.count()
    const employeeCount = await prisma.employee.count()
    const payrollCount = await prisma.payrollRecord.count()
    
    console.log('Database Data Summary:')
    console.log(`Users: ${userCount}`)
    console.log(`Companies: ${companyCount}`)
    console.log(`Employees: ${employeeCount}`)
    console.log(`Payroll Records: ${payrollCount}`)
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        include: { company: true }
      })
      console.log('\nUsers:')
      users.forEach(user => {
        console.log(`- ${user.email} (Company: ${user.company?.name || 'None'})`)
      })
    }
    
    if (companyCount > 0) {
      const companies = await prisma.company.findMany()
      console.log('\nCompanies:')
      companies.forEach(company => {
        console.log(`- ${company.name}`)
      })
    }
    
  } catch (error) {
    console.error('Error checking data:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()

