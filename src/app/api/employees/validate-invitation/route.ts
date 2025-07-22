/**
 * API endpoint to validate employee invitation tokens
 * 
 * This endpoint validates the token and email from the invitation link
 * and returns employee information if valid.
 */

import { NextRequest, NextResponse } from "next/server";
import { validateEmployeeInvitationToken } from "@/lib/employee-auth";

export async function GET(request: NextRequest) {
  try {
    // Get token and email from query parameters
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.json(
        { valid: false, error: "Missing token or email" },
        { status: 400 }
      );
    }

    // Validate the token
    const validation = await validateEmployeeInvitationToken(token, email);

    if (!validation.valid) {
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: 400 }
      );
    }

    // Return success with employee name for personalization
    return NextResponse.json({
      valid: true,
      employeeName: validation.employee?.firstName || "",
      employeeId: validation.employee?.id,
    });
  } catch (error) {
    console.error("Error validating employee invitation:", error);
    return NextResponse.json(
      { valid: false, error: "An error occurred while validating the invitation" },
      { status: 500 }
    );
  }
}

