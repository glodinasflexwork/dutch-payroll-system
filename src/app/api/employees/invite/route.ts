import { NextRequest, NextResponse } from "next/server";
import { validateAuth } from "@/lib/auth-utils";
import { getHRClient, getAuthClient } from "@/lib/database-clients";
import { BillingGuard } from "@/lib/billingGuard";
import { sendEmployeeInvitationEmail } from "@/lib/email-service"; // Assuming this service exists or will be created

export async function POST(request: NextRequest) {
  try {
    const { context, error, status } = await validateAuth(request, ["admin", "hr", "manager"]);

    if (!context || error) {
      return NextResponse.json({ error }, { status });
    }

    const { employeeId } = await request.json();

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const employee = await getHRClient().employee.findUnique({
      where: { id: employeeId, companyId: context.companyId },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found or does not belong to your company" }, { status: 404 });
    }

    if (!employee.email) {
      return NextResponse.json({ error: "Employee does not have an email address to send an invitation to." }, { status: 400 });
    }

    // Check if the company can add another active portal user
    const permission = await BillingGuard.canAddEmployeeUser(context.companyId);
    if (!permission.canAdd) {
      return NextResponse.json({ error: permission.reason }, { status: 403 });
    }

    // Generate invitation token (reusing logic from auth-utils or creating new)
    // For simplicity, let's assume a simple token generation for now. In a real app,
    // this would be more robust, potentially involving the auth database.
    const invitationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

    // Store the invitation token in the auth database (VerificationToken model)
    await getAuthClient().verificationToken.create({
      data: {
        identifier: employee.email, // Use employee email as identifier
        token: invitationToken,
        expires: expires,
      },
    });

    // Send invitation email
    const invitationLink = `${process.env.NEXTAUTH_URL}/auth/employee-signup?token=${invitationToken}&email=${encodeURIComponent(employee.email)}`;
    await sendEmployeeInvitationEmail(employee.email, employee.firstName, invitationLink);

    // Update employee status in HR database
    await getHRClient().employee.update({
      where: { id: employeeId },
      data: {
        portalAccessStatus: "INVITED",
        invitedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Employee invitation sent successfully.",
    }, { status: 200 });
  } catch (error) {
    console.error("Error sending employee invitation:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


