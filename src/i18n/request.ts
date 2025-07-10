import { getRequestConfig } from 'next-intl/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { authClient } from '@/lib/database-clients'

export default getRequestConfig(async () => {
  // Get user's language preference from database
  let locale = 'en' // Default to English
  
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user?.email) {
      const user = await authClient.user.findUnique({
        where: { email: session.user.email },
        select: { language: true }
      })
      
      if (user?.language) {
        locale = user.language
      }
    }
  } catch (error) {
    console.error('Error fetching user language preference:', error)
    // Fall back to default locale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})

