/**
 * Employee Authentication Integration Module
 * 
 * This module provides functions to connect the HR database's employee records
 * with the authentication database, enabling employee portal access.
 */

import { authClient, hrClient } from "@/lib/database-clients";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

/**
 * Creates a new user account in the auth database for an employee
 * and links it to their employee record in the HR database.
 */
export async function createEmployeeAuthAccount(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  employeeId: string,
  companyId: string
) {
  try {
    // Check if employee exists in HR database
    const employee = await hrClient.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Check if user already exists in auth database
    const existingUser = await authClient.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists, link to employee
      await linkEmployeeToAuthUser(employeeId, existingUser.id, companyId);
      return existingUser;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in auth database
    const user = await authClient.user.create({
      data: {
        id: uuidv4(),
        email,
        name: `${firstName} ${lastName}`,
        password: hashedPassword,
        emailVerified: new Date(), // Auto-verify since this is from an invitation
        role: "employee", // Default role for employees
        companyId, // Set current company
      },
    });

    // Create UserCompany relationship
    await authClient.userCompany.create({
      data: {
        userId: user.id,
        companyId,
        role: "employee",
        isActive: true,
      },
    });

    // Update employee record with auth user ID
    await hrClient.employee.update({
      where: { id: employeeId },
      data: {
        portalAccessStatus: "ACTIVE",
        // Store auth user ID in a custom field or metadata
        // This depends on your schema - you might need to add this field
      },
    });

    return user;
  } catch (error) {
    console.error("Error creating employee auth account:", error);
    throw error;
  }
}

/**
 * Links an existing employee to an auth user account
 */
export async function linkEmployeeToAuthUser(
  employeeId: string,
  userId: string,
  companyId: string
) {
  try {
    // Check if employee exists
    const employee = await hrClient.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Check if user exists
    const user = await authClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if UserCompany relationship exists
    const existingUserCompany = await authClient.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    // Create UserCompany relationship if it doesn't exist
    if (!existingUserCompany) {
      await authClient.userCompany.create({
        data: {
          userId,
          companyId,
          role: "employee",
          isActive: true,
        },
      });
    }

    // Update employee record
    await hrClient.employee.update({
      where: { id: employeeId },
      data: {
        portalAccessStatus: "ACTIVE",
        // Store auth user ID in a custom field or metadata
        // This depends on your schema - you might need to add this field
      },
    });

    return true;
  } catch (error) {
    console.error("Error linking employee to auth user:", error);
    throw error;
  }
}

/**
 * Validates an employee invitation token
 */
export async function validateEmployeeInvitationToken(
  token: string,
  email: string
) {
  try {
    // Find token in verification tokens
    const verificationToken = await authClient.verificationToken.findFirst({
      where: {
        token,
        identifier: email,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!verificationToken) {
      return { valid: false, error: "Invalid or expired invitation token" };
    }

    // Find employee with this email
    const employee = await hrClient.employee.findFirst({
      where: {
        email,
        portalAccessStatus: "INVITED",
      },
    });

    if (!employee) {
      return { valid: false, error: "No invited employee found with this email" };
    }

    return {
      valid: true,
      employee,
    };
  } catch (error) {
    console.error("Error validating employee invitation token:", error);
    return { valid: false, error: "Error validating invitation" };
  }
}

/**
 * Completes the employee invitation process
 */
export async function completeEmployeeInvitation(
  token: string,
  email: string,
  password: string
) {
  try {
    // Validate token
    const validation = await validateEmployeeInvitationToken(token, email);

    if (!validation.valid || !validation.employee) {
      throw new Error(validation.error || "Invalid invitation");
    }

    // Create auth account
    const user = await createEmployeeAuthAccount(
      email,
      password,
      validation.employee.firstName,
      validation.employee.lastName,
      validation.employee.id,
      validation.employee.companyId
    );

    // Delete the verification token
    await authClient.verificationToken.deleteMany({
      where: {
        token,
        identifier: email,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error completing employee invitation:", error);
    throw error;
  }
}

/**
 * Gets employee information for an authenticated user
 */
export async function getEmployeeForAuthUser(userId: string) {
  try {
    // Get user with company
    const user = await authClient.user.findUnique({
      where: { id: userId },
      include: {
        UserCompany: {
          where: { isActive: true },
          include: {
            Company: true,
          },
        },
      },
    });

    if (!user || !user.UserCompany || user.UserCompany.length === 0) {
      return null;
    }

    // Find employee with matching email in the active company
    const companyId = user.companyId || user.UserCompany[0].companyId;
    
    const employee = await hrClient.employee.findFirst({
      where: {
        email: user.email,
        companyId,
        isActive: true,
      },
    });

    return employee;
  } catch (error) {
    console.error("Error getting employee for auth user:", error);
    return null;
  }
}

