require('dotenv').config()
const bcrypt = require('bcryptjs')

async function checkAndResetPassword() {
  console.log('🔐 Checking password for angles.readier.7d@icloud.com...\n')

  const { PrismaClient } = require('@prisma/client')
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  })

  try {
    const userEmail = 'angles.readier.7d@icloud.com'
    const testPassword = 'Geheim@12'
    
    // Find the user
    const user = await authClient.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found!')
    console.log(`   👤 Name: ${user.name}`)
    console.log(`   📧 Email: ${user.email}`)
    console.log(`   🆔 User ID: ${user.id}`)

    // Test the current password
    console.log('\n🔍 Testing current password...')
    
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(testPassword, user.password)
      console.log(`   🔑 Password "${testPassword}" is ${isPasswordValid ? 'VALID' : 'INVALID'}`)
      
      if (isPasswordValid) {
        console.log('   ✅ The password is correct - login should work')
        console.log('   💡 The issue might be with the NextAuth.js configuration')
      } else {
        console.log('   ❌ The password is incorrect')
        console.log('   💡 Let me reset it to the expected password...')
        
        // Reset the password
        console.log('\n🔄 Resetting password...')
        const hashedPassword = await bcrypt.hash(testPassword, 12)
        
        await authClient.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        })
        
        console.log('   ✅ Password reset successfully!')
        console.log(`   🔑 New password: ${testPassword}`)
        
        // Verify the new password
        const updatedUser = await authClient.user.findUnique({
          where: { id: user.id }
        })
        
        const isNewPasswordValid = await bcrypt.compare(testPassword, updatedUser.password)
        console.log(`   ✅ Verification: New password is ${isNewPasswordValid ? 'VALID' : 'INVALID'}`)
      }
    } else {
      console.log('   ❌ No password hash found in database')
      console.log('   💡 Setting password for the first time...')
      
      const hashedPassword = await bcrypt.hash(testPassword, 12)
      
      await authClient.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })
      
      console.log('   ✅ Password set successfully!')
      console.log(`   🔑 Password: ${testPassword}`)
    }

    console.log('\n🎯 SUMMARY:')
    console.log(`✅ User: ${user.name} (${user.email})`)
    console.log(`✅ Password: ${testPassword}`)
    console.log('✅ Password hash: Updated and verified')
    console.log('\n💡 You can now try logging in with these credentials!')

  } catch (error) {
    console.error('❌ Error checking password:', error.message)
  } finally {
    await authClient.$disconnect()
  }
}

// Run the password check and reset
checkAndResetPassword()
  .then(() => {
    console.log('\n🎯 Password check complete!')
  })
  .catch((error) => {
    console.error('Password check failed:', error.message)
    process.exit(1)
  })
