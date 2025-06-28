const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  
  try {
    console.log('=== USER CURRENT COMPANY ===')
    const user = await prisma.user.findUnique({
      where: { email: 'cihatkaya@glodinas.nl' },
      select: { 
        id: true, 
        email: true, 
        companyId: true,
        company: { select: { name: true } }
      }
    })
    console.log('Current user company:', user)
    
    console.log('\n=== USER ACCESS TO COMPANIES ===')
    const userCompanies = await prisma.userCompany.findMany({
      where: { userId: user.id },
      include: {
        company: { select: { id: true, name: true } }
      }
    })
    console.log('User has access to:', userCompanies)
    
    console.log('\n=== EMPLOYEES PER COMPANY ===')
    for (const uc of userCompanies) {
      const employees = await prisma.employee.findMany({
        where: { companyId: uc.company.id },
        select: { firstName: true, lastName: true, email: true }
      })
      console.log(`${uc.company.name} (${uc.company.id}):`, employees)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
