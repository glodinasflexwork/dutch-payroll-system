/**
 * API endpoint to complete the employee invitation process
 * 
 * This endpoint validates the token, creates an auth account for the employee,
 * and links it to their employee record.
 */

import { NextRequest, NextResponse } from "next/server";
import { completeEmployeeInvitation } from "@/lib/employee-auth";

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Complete the invitation process
    const result = await completeEmployeeInvitation(token, email, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Failed to complete invitation" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Employee account created successfully",
    });
  } catch (error: any) {
    console.error("Error completing employee invitation:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "An error occurred while completing the invitation" 
      },
      { status: 500 }
    );
  }
}

