const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const authPrisma = new PrismaClient()

async function createTestUser() {
  try {
    console.log('🚀 Creating test user...')

    const email = 'cihatkaya@glodinas.nl'
    const password = 'test123'
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Check if user already exists
    const existingUser = await authPrisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      console.log('User already exists, updating password...')
      
      // Update the password
      await authPrisma.user.update({
        where: { email },
        data: { 
          password: hashedPassword,
          emailVerified: new Date() // Mark as verified
        }
      })
      
      console.log('✅ User password updated successfully!')
      console.log(`Email: ${email}`)
      console.log(`Password: ${password}`)
    } else {
      console.log('Creating new user...')
      
      // Create new user
      const user = await authPrisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Cihat Kaya',
          emailVerified: new Date()
        }
      })
      
      console.log('✅ User created successfully!')
      console.log(`Email: ${email}`)
      console.log(`Password: ${password}`)
      console.log(`User ID: ${user.id}`)
    }

  } catch (error) {
    console.error('❌ Error creating test user:', error)
  } finally {
    await authPrisma.$disconnect()
  }
}

// Run the setup
createTestUser()

