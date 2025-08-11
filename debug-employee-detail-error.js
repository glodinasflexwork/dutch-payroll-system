const { PrismaClient: HRPrismaClient } = require('@prisma/client');

async function debugEmployeeDetailError() {
  const hrClient = new HRPrismaClient({
    datasources: {
      db: {
        url: process.env.HR_DATABASE_URL
      }
    }
  });

  try {
    console.log('🔍 DEBUGGING EMPLOYEE DETAIL PAGE ERROR...\n');

    // Step 1: Check if the employee exists in the database
    console.log('1️⃣ CHECKING EMPLOYEE DATA IN DATABASE...');
    
    // Get all employees to see what's available
    const allEmployees = await hrClient.employee.findMany({
      include: {
        department: true,
        contracts: true
      }
    });
    
    console.log(`   Found ${allEmployees.length} employee(s) in the database:`);
    
    if (allEmployees.length > 0) {
      allEmployees.forEach((emp, index) => {
        console.log(`\n   EMPLOYEE #${index + 1}:`);
        console.log(`   - ID: ${emp.id}`);
        console.log(`   - Name: ${emp.firstName} ${emp.lastName}`);
        console.log(`   - Email: ${emp.email}`);
        console.log(`   - BSN: ${emp.bsn}`);
        console.log(`   - Department: ${emp.department ? emp.department.name : 'None'}`);
        console.log(`   - Contracts: ${emp.contracts ? emp.contracts.length : 0}`);
        console.log(`   - Created At: ${emp.createdAt}`);
        console.log(`   - Company ID: ${emp.companyId}`);
      });
    } else {
      console.log('   ❌ No employees found in the database!');
    }

    // Step 2: Check the employee detail API route
    console.log('\n2️⃣ EXAMINING EMPLOYEE DETAIL API ROUTE...');
    
    // Find the first employee to use as a test case
    if (allEmployees.length > 0) {
      const testEmployee = allEmployees[0];
      console.log(`   Using employee "${testEmployee.firstName} ${testEmployee.lastName}" (ID: ${testEmployee.id}) for testing`);
      
      // Simulate the API route logic to see if it can find the employee
      const employeeDetail = await hrClient.employee.findUnique({
        where: { id: testEmployee.id },
        include: {
          department: true,
          contracts: {
            orderBy: { startDate: 'desc' },
            take: 1
          },
          emergencyContact: true
        }
      });
      
      if (employeeDetail) {
        console.log('   ✅ Employee detail API logic works correctly');
        console.log('   ✅ Employee found with ID:', testEmployee.id);
      } else {
        console.log('   ❌ Employee detail API logic failed');
        console.log('   ❌ Could not find employee with ID:', testEmployee.id);
      }
      
      // Check if the employee has the correct company association
      console.log('\n   Checking company association:');
      console.log(`   - Employee Company ID: ${testEmployee.companyId}`);
      
      // Get the current user's company ID
      const users = await hrClient.user.findMany({
        where: {
          email: 'adjay1993@gmail.com' // Assuming this is the current user
        }
      });
      
      if (users.length > 0) {
        const currentUser = users[0];
        console.log(`   - Current User Company ID: ${currentUser.companyId}`);
        
        if (testEmployee.companyId === currentUser.companyId) {
          console.log('   ✅ Employee belongs to the current user\'s company');
        } else {
          console.log('   ❌ Employee does NOT belong to the current user\'s company');
          console.log('   This could be causing the "Employee Not Found" error');
        }
      } else {
        console.log('   ❓ Could not find current user');
      }
    }

    // Step 3: Check the route implementation
    console.log('\n3️⃣ ANALYZING POTENTIAL ISSUES:');
    
    console.log('   Possible causes of "Employee Not Found" error:');
    console.log('   1. Employee ID in URL is incorrect or malformed');
    console.log('   2. Employee exists but belongs to a different company');
    console.log('   3. Route is checking for company ownership but using wrong company ID');
    console.log('   4. Permission/authorization check is failing');
    console.log('   5. Database query is incorrectly structured');
    
    // Step 4: Recommend fixes
    console.log('\n4️⃣ RECOMMENDED FIXES:');
    
    console.log('   1. Verify the employee ID in the URL matches the database ID');
    console.log('   2. Ensure the employee belongs to the current user\'s company');
    console.log('   3. Check the company ID comparison in the API route');
    console.log('   4. Add proper error handling with specific error messages');
    console.log('   5. Add logging to the API route to identify the exact failure point');

  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await hrClient.$disconnect();
  }
}

debugEmployeeDetailError();

