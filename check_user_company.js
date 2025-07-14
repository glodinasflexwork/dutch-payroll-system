const { PrismaClient } = require('@prisma/client')

async function checkUserCompany() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Checking user company associations...')
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        email: 'glodinas@icloud.com'
      },
      include: {
        UserCompany: {
          include: {
            Company: true
          }
        }
      }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name
    })
    
    console.log('🏢 User companies:', user.UserCompany.length)
    
    user.UserCompany.forEach((userCompany, index) => {
      console.log(`\n📊 Company ${index + 1}:`)
      console.log('  - Company ID:', userCompany.Company.id)
      console.log('  - Company Name:', userCompany.Company.name)
      console.log('  - User Role:', userCompany.role)
      console.log('  - Created:', userCompany.createdAt)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserCompany()
