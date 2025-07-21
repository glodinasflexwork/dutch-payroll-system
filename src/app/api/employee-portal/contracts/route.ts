import { NextRequest, NextResponse } from "next/server"
import { hrClient } from "@/lib/database-clients"
import fs from 'fs'

// GET /api/employee-portal/contracts - Get employee contracts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const contractId = searchParams.get('contractId')
    const download = searchParams.get('download') === 'true'
    
    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 })
    }

    // Verify employee exists and has portal access
    const employee = await hrClient.employee.findUnique({
      where: { id: employeeId },
      include: { portalAccess: true }
    })

    if (!employee || !employee.portalAccess?.isActive) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    if (contractId) {
      // Get specific contract
      const contract = await hrClient.contract.findFirst({
        where: { 
          id: contractId,
          employeeId: employeeId 
        }
      })

      if (!contract) {
        return NextResponse.json({ error: "Contract not found" }, { status: 404 })
      }

      if (download && contract.filePath) {
        // Return file for download
        try {
          const fileBuffer = fs.readFileSync(contract.filePath)
          return new NextResponse(fileBuffer, {
            headers: {
              'Content-Type': contract.mimeType || 'application/pdf',
              'Content-Disposition': `attachment; filename="${contract.fileName}"`
            }
          })
        } catch (fileError) {
          return NextResponse.json({ error: "File not found" }, { status: 404 })
        }
      }

      return NextResponse.json({
        success: true,
        contract: contract
      })
    }

    // Get all contracts for employee
    const contracts = await hrClient.contract.findMany({
      where: { 
        employeeId: employeeId,
        isActive: true 
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      contracts: contracts
    })

  } catch (error) {
    console.error("Error fetching contracts:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}

// POST /api/employee-portal/contracts - Sign a contract
export async function POST(request: NextRequest) {
  try {
    const { contractId, employeeId, signatureData } = await request.json()
    
    if (!contractId || !employeeId) {
      return NextResponse.json({ error: "Contract ID and Employee ID are required" }, { status: 400 })
    }

    // Verify employee exists and has portal access
    const employee = await hrClient.employee.findUnique({
      where: { id: employeeId },
      include: { portalAccess: true }
    })

    if (!employee || !employee.portalAccess?.isActive) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get contract
    const contract = await hrClient.contract.findFirst({
      where: { 
        id: contractId,
        employeeId: employeeId,
        status: 'pending'
      }
    })

    if (!contract) {
      return NextResponse.json({ error: "Contract not found or already signed" }, { status: 404 })
    }

    // Update contract with signature
    const updatedContract = await hrClient.contract.update({
      where: { id: contractId },
      data: {
        status: 'signed',
        signedAt: new Date(),
        signedBy: employeeId,
        signatureData: signatureData
      }
    })

    return NextResponse.json({
      success: true,
      contract: updatedContract,
      message: 'Contract signed successfully'
    })

  } catch (error) {
    console.error("Error signing contract:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}

