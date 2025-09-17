import { PrismaClient } from '@prisma/client'

async function verifyProductionEmail() {
  const authClient = new PrismaClient({
    datasourceUrl: process.env.AUTH_DATABASE_URL
  })

  try {
    console.log('🔍 Looking for user: manager.test@techsolutions.nl')
    
    const user = await authClient.user.findUnique({
      where: { email: 'manager.test@techsolutions.nl' }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found:', {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified
    })

    if (!user.emailVerified) {
      console.log('📧 Verifying email...')
      
      const updatedUser = await authClient.user.update({
        where: { id: user.id },
        data: { 
          emailVerified: new Date(),
          emailVerificationToken: null
        }
      })

      console.log('✅ Email verified successfully!')
      console.log('Updated user:', {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified
      })
    } else {
      console.log('✅ Email already verified')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await authClient.$disconnect()
  }
}

verifyProductionEmail()
