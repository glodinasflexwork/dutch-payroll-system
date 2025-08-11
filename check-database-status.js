const { PrismaClient: AuthClient } = require('@prisma/client');
const { PrismaClient: HRClient } = require('@prisma/hr-client');
const { PrismaClient: PayrollClient } = require('@prisma/payroll-client');

async function checkDatabaseStatus() {
  const authClient = new AuthClient();
  const hrClient = new HRClient();
  const payrollClient = new PayrollClient();

  try {
    console.log('🔍 CHECKING DATABASE STATUS...\n');

    // Check Auth Database
    console.log('📊 AUTH DATABASE:');
    const users = await authClient.user.findMany({
      include: {
        Company: true,
        UserCompany: {
          include: {
            Company: true
          }
        }
      }
    });
    console.log(`- Users: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n👤 USERS:');
      users.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id})`);
        if (user.Company) {
          console.log(`    └─ Primary Company: ${user.Company.name} (${user.Company.id})`);
        }
        if (user.UserCompany.length > 0) {
          console.log(`    └─ Associated Companies: ${user.UserCompany.length}`);
          user.UserCompany.forEach(uc => {
            console.log(`      • ${uc.Company.name} (${uc.Company.id}) - Role: ${uc.role}`);
          });
        }
      });
    }

    // Check Companies
    console.log('\n📊 COMPANIES:');
    const companies = await authClient.company.findMany({
      include: {
        User: true,
        UserCompany: true
      }
    });
    console.log(`- Companies: ${companies.length}`);
    
    if (companies.length > 0) {
      companies.forEach(company => {
        console.log(`  - ${company.name} (${company.id})`);
        console.log(`    └─ Users: ${company.User.length + company.UserCompany.length}`);
      });
    }

    // Check HR Database
    console.log('\n📊 HR DATABASE:');
    const hrCompanies = await hrClient.company.findMany({
      include: {
        employees: true
      }
    });
    console.log(`- Companies: ${hrCompanies.length}`);
    console.log(`- Total Employees: ${hrCompanies.reduce((acc, company) => acc + company.employees.length, 0)}`);

    if (hrCompanies.length > 0) {
      console.log('\n🏢 COMPANIES & EMPLOYEES:');
      hrCompanies.forEach(company => {
        console.log(`  - ${company.name} (${company.id})`);
        console.log(`    └─ Employees: ${company.employees.length}`);
        company.employees.forEach(employee => {
          console.log(`      • ${employee.firstName} ${employee.lastName} (${employee.id})`);
          console.log(`        Email: ${employee.email}, Position: ${employee.position}`);
        });
      });
    }

    // Check Payroll Database
    console.log('\n📊 PAYROLL DATABASE:');
    const payrollRecords = await payrollClient.payroll.findMany();
    console.log(`- Payroll Records: ${payrollRecords.length}`);

    // Check for specific employee ID that was missing
    console.log('\n🔍 CHECKING SPECIFIC EMPLOYEE ID...');
    const specificEmployee = await hrClient.employee.findUnique({
      where: { id: 'cmdsv2bl80001js0bs5ztv4p8' }
    });
    
    if (specificEmployee) {
      console.log('✅ Employee cmdsv2bl80001js0bs5ztv4p8 found!');
      console.log(`   Name: ${specificEmployee.firstName} ${specificEmployee.lastName}`);
    } else {
      console.log('❌ Employee cmdsv2bl80001js0bs5ztv4p8 NOT found');
    }

    // Check if there are any employees at all
    const allEmployees = await hrClient.employee.findMany({
      take: 10
    });
    console.log(`\n📋 SAMPLE EMPLOYEES (first 10):`);
    if (allEmployees.length === 0) {
      console.log('❌ NO EMPLOYEES FOUND IN DATABASE');
    } else {
      allEmployees.forEach(emp => {
        console.log(`  - ${emp.firstName} ${emp.lastName} (${emp.id}) - ${emp.email}`);
      });
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await authClient.$disconnect();
    await hrClient.$disconnect();
    await payrollClient.$disconnect();
  }
}

checkDatabaseStatus();

