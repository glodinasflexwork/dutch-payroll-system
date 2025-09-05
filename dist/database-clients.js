"use strict";
// Database Clients Utility
// Provides centralized access to all three databases with proper client initialization
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollClient = exports.HRClient = exports.AuthClient = void 0;
exports.getAuthClient = getAuthClient;
exports.getHRClient = getHRClient;
exports.getPayrollClient = getPayrollClient;
exports.disconnectAllClients = disconnectAllClients;
exports.testAllConnections = testAllConnections;
exports.getDatabaseStatistics = getDatabaseStatistics;
exports.performHealthCheck = performHealthCheck;
const client_1 = require("@prisma/client");
Object.defineProperty(exports, "AuthClient", { enumerable: true, get: function () { return client_1.PrismaClient; } });
const hr_client_1 = require("@prisma/hr-client");
Object.defineProperty(exports, "HRClient", { enumerable: true, get: function () { return hr_client_1.PrismaClient; } });
const payroll_client_1 = require("@prisma/payroll-client");
Object.defineProperty(exports, "PayrollClient", { enumerable: true, get: function () { return payroll_client_1.PrismaClient; } });
// Singleton pattern for database clients
let authClient = null;
let hrClient = null;
let payrollClient = null;
/**
 * Get AUTH Database Client
 * Handles user authentication, companies, subscriptions
 */
function getAuthClient() {
    if (!authClient) {
        authClient = new client_1.PrismaClient({
            datasources: {
                db: {
                    url: process.env.AUTH_DATABASE_URL
                }
            }
        });
    }
    return authClient;
}
/**
 * Get HR Database Client
 * Handles employee records, departments, leave management
 */
function getHRClient() {
    if (!hrClient) {
        hrClient = new hr_client_1.PrismaClient({
            datasources: {
                db: {
                    url: process.env.HR_DATABASE_URL
                }
            }
        });
    }
    return hrClient;
}
/**
 * Get PAYROLL Database Client
 * Handles payroll calculations, tax records, payslips
 */
function getPayrollClient() {
    if (!payrollClient) {
        payrollClient = new payroll_client_1.PrismaClient({
            datasources: {
                db: {
                    url: process.env.PAYROLL_DATABASE_URL
                }
            }
        });
    }
    return payrollClient;
}
/**
 * Disconnect all database clients
 * Should be called when shutting down the application
 */
async function disconnectAllClients() {
    const promises = [];
    if (authClient) {
        promises.push(authClient.$disconnect());
        authClient = null;
    }
    if (hrClient) {
        promises.push(hrClient.$disconnect());
        hrClient = null;
    }
    if (payrollClient) {
        promises.push(payrollClient.$disconnect());
        payrollClient = null;
    }
    await Promise.all(promises);
}
/**
 * Test all database connections
 * Returns connection status for each database
 */
async function testAllConnections() {
    const results = {
        auth: { connected: false, error: undefined },
        hr: { connected: false, error: undefined },
        payroll: { connected: false, error: undefined }
    };
    // Test AUTH connection
    try {
        const auth = getAuthClient();
        await auth.$queryRaw `SELECT 1`;
        results.auth.connected = true;
    }
    catch (error) {
        results.auth.error = error instanceof Error ? error.message : 'Unknown error';
    }
    // Test HR connection
    try {
        const hr = getHRClient();
        await hr.$queryRaw `SELECT 1`;
        results.hr.connected = true;
    }
    catch (error) {
        results.hr.error = error instanceof Error ? error.message : 'Unknown error';
    }
    // Test PAYROLL connection
    try {
        const payroll = getPayrollClient();
        await payroll.$queryRaw `SELECT 1`;
        results.payroll.connected = true;
    }
    catch (error) {
        results.payroll.error = error instanceof Error ? error.message : 'Unknown error';
    }
    return results;
}
/**
 * Get database statistics
 * Returns record counts for key tables in each database
 */
async function getDatabaseStatistics() {
    const auth = getAuthClient();
    const hr = getHRClient();
    const payroll = getPayrollClient();
    const [authStats, hrStats, payrollStats] = await Promise.all([
        // AUTH statistics
        Promise.all([
            auth.user.count(),
            auth.company.count(),
            auth.subscription.count()
        ]).then(([users, companies, subscriptions]) => ({
            users,
            companies,
            subscriptions
        })),
        // HR statistics
        Promise.all([
            hr.employee.count(),
            hr.company.count(),
            hr.department.count(),
            hr.leaveRequest.count()
        ]).then(([employees, companies, departments, leaveRequests]) => ({
            employees,
            companies,
            departments,
            leaveRequests
        })),
        // PAYROLL statistics
        Promise.all([
            payroll.payrollRecord.count(),
            payroll.taxCalculation.count(),
            payroll.payslipGeneration.count()
        ]).then(([payrollRecords, taxCalculations, payslipGenerations]) => ({
            payrollRecords,
            taxCalculations,
            payslipGenerations
        }))
    ]);
    return {
        auth: authStats,
        hr: hrStats,
        payroll: payrollStats
    };
}
/**
 * Database health check
 * Comprehensive health check for all databases
 */
async function performHealthCheck() {
    const startTime = Date.now();
    const checkDatabase = async (name, client) => {
        const dbStartTime = Date.now();
        try {
            await client.$queryRaw `SELECT 1`;
            return {
                status: 'up',
                responseTime: Date.now() - dbStartTime
            };
        }
        catch (error) {
            return {
                status: 'down',
                responseTime: Date.now() - dbStartTime,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    };
    const [authResult, hrResult, payrollResult] = await Promise.all([
        checkDatabase('auth', getAuthClient()),
        checkDatabase('hr', getHRClient()),
        checkDatabase('payroll', getPayrollClient())
    ]);
    const databases = {
        auth: authResult,
        hr: hrResult,
        payroll: payrollResult
    };
    // Determine overall status
    const upCount = Object.values(databases).filter(db => db.status === 'up').length;
    let status;
    if (upCount === 3) {
        status = 'healthy';
    }
    else if (upCount >= 2) {
        status = 'degraded';
    }
    else {
        status = 'unhealthy';
    }
    return {
        status,
        databases,
        timestamp: new Date().toISOString()
    };
}
// Default export for convenience
exports.default = {
    getAuthClient,
    getHRClient,
    getPayrollClient,
    disconnectAllClients,
    testAllConnections,
    getDatabaseStatistics,
    performHealthCheck
};
