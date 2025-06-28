const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  
  try {
    console.log('=== COMPANIES ===')
    const companies = await prisma.company.findMany({
      select: { id: true, name: true }
    })
    console.log(companies)
    
    console.log('\n=== EMPLOYEES ===')
    const employees = await prisma.employee.findMany({
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true, 
        companyId: true 
      }
    })
    console.log(employees)
    
    console.log('\n=== USER COMPANIES ===')
    const userCompanies = await prisma.userCompany.findMany({
      include: {
        company: { select: { name: true } },
        user: { select: { email: true } }
      }
    })
    console.log(userCompanies)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
