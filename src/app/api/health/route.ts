import { NextRequest, NextResponse } from "next/server"
import { getAuthClient, getHRClient } from "@/lib/database-clients"

export async function GET(request: NextRequest) {
  try {
    console.log("Health check API called")
    
    const results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nextauth_url: process.env.NEXTAUTH_URL,
      databases: {
        auth: { status: 'unknown', error: null as string | null },
        hr: { status: 'unknown', error: null as string | null }
      }
    }

    // Test Auth Database
    try {
      console.log("Testing Auth database connection...")
      const authClient = await getAuthClient()
      await authClient.$queryRaw`SELECT 1`
      results.databases.auth.status = 'connected'
      console.log("Auth database: OK")
    } catch (error) {
      console.error("Auth database error:", error)
      results.databases.auth.status = 'error'
      results.databases.auth.error = error instanceof Error ? error.message : 'Unknown error'
    }

    // Test HR Database
    try {
      console.log("Testing HR database connection...")
      const hrClient = await getHRClient()
      await hrClient.$queryRaw`SELECT 1`
      results.databases.hr.status = 'connected'
      console.log("HR database: OK")
    } catch (error) {
      console.error("HR database error:", error)
      results.databases.hr.status = 'error'
      results.databases.hr.error = error instanceof Error ? error.message : 'Unknown error'
    }

    console.log("Health check completed:", results)
    
    return NextResponse.json(results, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })

  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json({
      error: "Health check failed",
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
