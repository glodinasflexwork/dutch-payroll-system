import { NextRequest, NextResponse } from "next/server"
import { getAuthClient, getHRClient } from "@/lib/database-clients"

export async function POST(request: NextRequest) {
  try {
    console.log("=== TEST REGISTRATION API CALLED ===")
    
    // Step 1: Parse request data
    let data
    try {
      data = await request.json()
      console.log("✅ Request data parsed successfully")
    } catch (error) {
      console.error("❌ Failed to parse request data:", error)
      return NextResponse.json({ error: "Invalid JSON data" }, { status: 400 })
    }

    // Step 2: Test database connections
    let authClient, hrClient
    try {
      console.log("🔄 Getting Auth client...")
      authClient = await getAuthClient()
      console.log("✅ Auth client obtained")
      
      console.log("🔄 Testing Auth connection...")
      await authClient.$queryRaw`SELECT 1`
      console.log("✅ Auth database connected")
    } catch (error) {
      console.error("❌ Auth database failed:", error)
      return NextResponse.json({ 
        error: "Auth database connection failed", 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    try {
      console.log("🔄 Getting HR client...")
      hrClient = await getHRClient()
      console.log("✅ HR client obtained")
      
      console.log("🔄 Testing HR connection...")
      await hrClient.$queryRaw`SELECT 1`
      console.log("✅ HR database connected")
    } catch (error) {
      console.error("❌ HR database failed:", error)
      return NextResponse.json({ 
        error: "HR database connection failed", 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    // Step 3: Test basic queries
    try {
      console.log("🔄 Testing Auth queries...")
      const userCount = await authClient.user.count()
      console.log(`✅ Auth query successful - ${userCount} users`)
      
      console.log("🔄 Testing HR queries...")
      const companyCount = await hrClient.company.count()
      console.log(`✅ HR query successful - ${companyCount} companies`)
    } catch (error) {
      console.error("❌ Database query failed:", error)
      return NextResponse.json({ 
        error: "Database query failed", 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    console.log("✅ All tests passed!")
    return NextResponse.json({
      success: true,
      message: "All database connections and queries working",
      data: {
        receivedData: data,
        environment: process.env.NODE_ENV,
        nextauthUrl: process.env.NEXTAUTH_URL
      }
    })

  } catch (error) {
    console.error("❌ Test registration failed:", error)
    return NextResponse.json({
      error: "Test registration failed",
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
