import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Force fresh deployment - clear Vercel cache
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

