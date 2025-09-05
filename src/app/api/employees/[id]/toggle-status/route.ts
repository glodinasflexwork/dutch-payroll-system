import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getHRClient } from "@/lib/database-clients"

// PATCH /api/employees/[id]/toggle-status - Toggle employee active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { reason, effectiveDate } = body
    
    console.log('🔄 Employee status toggle request:');
    console.log('Employee ID:', id);
    console.log('Reason:', reason);
    console.log('Effective Date:', effectiveDate);
    
    // Check if employee exists and belongs to the company
    const existingEmployee = await getHRClient().employee.findFirst({
      where: {
        id: id,
        companyId: session.user.companyId
      }
    })
    
    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }
    
    console.log('✅ Existing employee found:', existingEmployee.firstName, existingEmployee.lastName);
    console.log('Current status:', existingEmployee.isActive ? 'Active' : 'Inactive');
    
    const newStatus = !existingEmployee.isActive
    const updateData: any = {
      isActive: newStatus,
      updatedAt: new Date()
    }
    
    // Handle deactivation
    if (!newStatus) {
      updateData.endDate = effectiveDate ? new Date(effectiveDate) : new Date()
      updateData.portalAccessStatus = "NO_ACCESS"
      console.log('🔴 Deactivating employee with end date:', updateData.endDate);
    } else {
      // Handle reactivation
      updateData.endDate = null
      updateData.portalAccessStatus = "INVITED" // Will need to re-invite to portal
      console.log('🟢 Reactivating employee');
    }
    
    // Update employee status
    const updatedEmployee = await getHRClient().employee.update({
      where: { id: id },
      data: updateData
    })
    
    // Create audit trail entry
    await getHRClient().employeeHistory.create({
      data: {
        employeeId: id,
        changeType: newStatus ? "REACTIVATION" : "DEACTIVATION",
        fieldName: "isActive",
        oldValue: existingEmployee.isActive.toString(),
        newValue: newStatus.toString(),
        changedBy: session.user.id || "system",
        reason: reason || (newStatus ? "Employee reactivated" : "Employee deactivated"),
        companyId: session.user.companyId
      }
    })
    
    console.log('✅ Employee status updated successfully');
    console.log('New status:', newStatus ? 'Active' : 'Inactive');
    
    return NextResponse.json({
      success: true,
      employee: updatedEmployee,
      message: `Employee ${newStatus ? 'activated' : 'deactivated'} successfully`,
      previousStatus: existingEmployee.isActive,
      newStatus: newStatus
    })
    
  } catch (error) {
    console.error("Error toggling employee status:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to update employee status"
    }, { status: 500 })
  }
}

