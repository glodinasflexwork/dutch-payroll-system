/**
 * API endpoint to fetch employee data for the portal
 * 
 * This endpoint retrieves the authenticated employee's data from the HR database
 * and returns it for display in the employee portal.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEmployeeForAuthUser } from "@/lib/employee-auth";
import { hrClient } from "@/lib/database-clients";

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the employee record for the authenticated user
    const employee = await getEmployeeForAuthUser(session.user.id);

    if (!employee) {
      return NextResponse.json(
        { error: "Employee record not found" },
        { status: 404 }
      );
    }

    // Get employee's contract for working schedule information
    const contract = await hrClient.contract.findFirst({
      where: {
        employeeId: employee.id,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get employee's documents
    const documents = await hrClient.document.findMany({
      where: {
        employeeId: employee.id,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    // Get employee's leave requests
    const leaveRequests = await hrClient.leaveRequest.findMany({
      where: {
        employeeId: employee.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Get employee's payslips
    const payrollRecords = await payrollClient.payrollRecord.findMany({
      where: {
        employeeId: employee.id,
      },
      orderBy: {
        periodEnd: "desc",
      },
      take: 6,
    });

    // Calculate next payday (simplified example)
    const today = new Date();
    const nextPayday = new Date(today.getFullYear(), today.getMonth(), 25);
    if (today.getDate() > 25) {
      nextPayday.setMonth(nextPayday.getMonth() + 1);
    }
    const daysToPayday = Math.ceil((nextPayday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Format payslips for display
    const payslips = payrollRecords.map(record => ({
      id: record.id,
      period: `${new Date(record.periodStart).toLocaleDateString('en-NL', { month: 'short', year: 'numeric' })}`,
      netAmount: record.netAmount?.toFixed(2) || "0.00",
      grossAmount: record.grossAmount?.toFixed(2) || "0.00",
      date: new Date(record.createdAt).toLocaleDateString('en-NL'),
      downloadUrl: `/api/employee-portal/payslips/${record.id}/download`,
    }));

    // Format leave requests for display
    const formattedLeaveRequests = leaveRequests.map(request => ({
      id: request.id,
      startDate: new Date(request.startDate).toLocaleDateString('en-NL'),
      endDate: new Date(request.endDate).toLocaleDateString('en-NL'),
      days: request.days,
      status: request.status,
      reason: request.reason,
    }));

    // Format documents for display
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      name: doc.originalName,
      type: doc.documentType,
      date: new Date(doc.uploadedAt).toLocaleDateString('en-NL'),
      status: doc.status,
      viewUrl: `/api/employee-portal/documents/${doc.id}/view`,
    }));

    // Calculate leave balance (simplified example)
    const leaveBalance = 20; // This would normally be calculated based on entitlement and used leave

    // Return the employee data
    return NextResponse.json({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      startDate: new Date(employee.startDate).toLocaleDateString('en-NL'),
      workingHours: employee.workingHours,
      workSchedule: contract?.workSchedule || "Monday-Friday",
      workingDaysPerWeek: contract?.workingDaysPerWeek || 5,
      leaveBalance,
      nextPayday: nextPayday.toLocaleDateString('en-NL'),
      daysToPayday,
      documentCount: formattedDocuments.length,
      payslips,
      leaveRequests: formattedLeaveRequests,
      documents: formattedDocuments,
    });
  } catch (error) {
    console.error("Error fetching employee data:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching employee data" },
      { status: 500 }
    );
  }
}

