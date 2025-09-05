import { getAuthClient } from "./database-clients";

export class BillingGuard {
  public static async canAddEmployeeUser(companyId: string): Promise<{ canAdd: boolean; reason: string }> {
    const subscription = await getAuthClient().subscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });

    if (!subscription || !subscription.plan) {
      return { canAdd: false, reason: "No active subscription found for this company." };
    }

    // Count active users associated with this company in the auth database
    const activeAuthUserCount = await getAuthClient().user.count({
      where: {
        companyId: companyId,
        // Assuming 'employee' role implies an active portal user
        // You might need to refine this based on your actual user roles and statuses
        role: 'employee',
      },
    });

    // Retrieve the maxEmployees limit from the plan
    const maxEmployees = subscription.plan.maxEmployees;

    // If maxEmployees is defined and the limit is reached
    if (maxEmployees !== null && activeAuthUserCount >= maxEmployees) {
      return {
        canAdd: false,
        reason: `Employee portal user limit reached. Your current plan allows up to ${maxEmployees} active portal users. You currently have ${activeAuthUserCount}. Please upgrade your subscription to add more.`,
      };
    }

    // If maxEmployees is null, it implies unlimited or not restricted by this metric
    return { canAdd: true, reason: "Permission granted." };
  }
}


