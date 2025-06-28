const { PrismaClient } = require('@prisma/client')

async function testEmployeeAPI() {
  const prisma = new PrismaClient()
  
  try {
    console.log('=== TESTING EMPLOYEE API LOGIC ===')
    
    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: 'cihatkaya@glodinas.nl' },
      select: { id: true, companyId: true }
    })
    console.log('User current company:', user)
    
    // Test what the API would return for this company
    const employees = await prisma.employee.findMany({
      where: {
        companyId: user.companyId,
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyId: true
      }
    })
    
    console.log('Employees for company', user.companyId, ':', employees)
    
    // Also check what company this actually is
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { name: true }
    })
    console.log('Company name:', company?.name)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEmployeeAPI()
