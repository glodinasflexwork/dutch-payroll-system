/**
 * Debug script to investigate payroll record lookup issues
 */

const { PrismaClient: PayrollPrismaClient } = require('@prisma/payroll-client')
const { PrismaClient: HRPrismaClient } = require('@prisma/hr-client')

// Initialize clients with different database URLs
const payrollClient = new PayrollPrismaClient({
  datasources: {
    db: {
      url: process.env.PAYROLL_DATABASE_URL
    }
  }
})

const hrClient = new HRPrismaClient({
  datasources: {
    db: {
      url: process.env.HR_DATABASE_URL
    }
  }
})

async function debugPayrollLookup() {
  try {
    console.log('🔍 DEBUGGING PAYROLL RECORD LOOKUP')
    console.log('=====================================')
    
    const companyId = 'cme7fn8kf0000k40ag368f3a1' // Glodinas Finance B.V.
    
    // 1. Check HR database for employees
    console.log('\n1. 👥 EMPLOYEES IN HR DATABASE:')
    const employees = await hrClient.employee.findMany({
      where: {
        companyId: companyId,
        isActive: true
      },
      select: {
        id: true,
        employeeNumber: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })
    
    console.log(`Found ${employees.length} employees:`)
    employees.forEach(emp => {
      console.log(`  - ID: ${emp.id}`)
      console.log(`    Employee Number: ${emp.employeeNumber}`)
      console.log(`    Name: ${emp.firstName} ${emp.lastName}`)
      console.log(`    Email: ${emp.email}`)
      console.log('')
    })
    
    // 2. Check payroll database for records
    console.log('\n2. 📊 PAYROLL RECORDS IN PAYROLL DATABASE:')
    const payrollRecords = await payrollClient.payrollRecord.findMany({
      where: {
        companyId: companyId
      },
      select: {
        id: true,
        employeeId: true,
        employeeNumber: true,
        firstName: true,
        lastName: true,
        year: true,
        month: true,
        period: true,
        grossSalary: true,
        netSalary: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`Found ${payrollRecords.length} payroll records:`)
    payrollRecords.forEach(record => {
      console.log(`  - Record ID: ${record.id}`)
      console.log(`    Employee ID: ${record.employeeId}`)
      console.log(`    Employee Number: ${record.employeeNumber}`)
      console.log(`    Name: ${record.firstName} ${record.lastName}`)
      console.log(`    Period: ${record.period} (${record.year}-${String(record.month).padStart(2, '0')})`)
      console.log(`    Gross: €${record.grossSalary}`)
      console.log(`    Net: €${record.netSalary}`)
      console.log(`    Created: ${record.createdAt}`)
      console.log('')
    })
    
    // 3. Check for ID mismatches
    console.log('\n3. 🔍 CHECKING FOR ID MISMATCHES:')
    const employeeIds = employees.map(e => e.id)
    const employeeNumbers = employees.map(e => e.employeeNumber).filter(Boolean)
    const payrollEmployeeIds = [...new Set(payrollRecords.map(r => r.employeeId))]
    
    console.log('Employee IDs in HR:', employeeIds)
    console.log('Employee Numbers in HR:', employeeNumbers)
    console.log('Employee IDs in Payroll:', payrollEmployeeIds)
    
    // Check for matches
    const hrIdMatches = payrollEmployeeIds.filter(id => employeeIds.includes(id))
    const numberMatches = payrollEmployeeIds.filter(id => employeeNumbers.includes(id))
    
    console.log('\nMatches by HR ID:', hrIdMatches)
    console.log('Matches by Employee Number:', numberMatches)
    
    // 4. Test specific lookup that's failing
    console.log('\n4. 🧪 TESTING SPECIFIC LOOKUP:')
    const testEmployeeId = 'cme7fsv070009k40and8jh2l4' // From the logs
    const testYear = 2025
    const testMonth = 1
    
    console.log(`Looking for: employeeId=${testEmployeeId}, year=${testYear}, month=${testMonth}`)
    
    const specificRecord = await payrollClient.payrollRecord.findFirst({
      where: {
        companyId: companyId,
        employeeId: testEmployeeId,
        year: testYear,
        month: testMonth
      }
    })
    
    if (specificRecord) {
      console.log('✅ Found specific record:', specificRecord)
    } else {
      console.log('❌ No record found for specific lookup')
      
      // Try alternative lookups
      console.log('\n🔄 Trying alternative lookups...')
      
      // Try with different employee IDs
      for (const empId of employeeIds) {
        const altRecord = await payrollClient.payrollRecord.findFirst({
          where: {
            companyId: companyId,
            employeeId: empId,
            year: testYear,
            month: testMonth
          }
        })
        
        if (altRecord) {
          console.log(`✅ Found record with HR employee ID ${empId}:`, altRecord)
        }
      }
      
      // Try with employee numbers
      for (const empNum of employeeNumbers) {
        const altRecord = await payrollClient.payrollRecord.findFirst({
          where: {
            companyId: companyId,
            employeeId: empNum,
            year: testYear,
            month: testMonth
          }
        })
        
        if (altRecord) {
          console.log(`✅ Found record with employee number ${empNum}:`, altRecord)
        }
      }
    }
    
    // 5. Check PayslipGeneration records
    console.log('\n5. 📄 PAYSLIP GENERATION RECORDS:')
    const payslipRecords = await payrollClient.payslipGeneration.findMany({
      where: {
        companyId: companyId
      },
      select: {
        id: true,
        payrollRecordId: true,
        employeeId: true,
        fileName: true,
        status: true,
        generatedAt: true
      }
    })
    
    console.log(`Found ${payslipRecords.length} payslip generation records:`)
    payslipRecords.forEach(record => {
      console.log(`  - Payslip ID: ${record.id}`)
      console.log(`    Payroll Record ID: ${record.payrollRecordId}`)
      console.log(`    Employee ID: ${record.employeeId}`)
      console.log(`    File: ${record.fileName}`)
      console.log(`    Status: ${record.status}`)
      console.log('')
    })
    
    console.log('\n✅ DEBUG COMPLETE')
    
  } catch (error) {
    console.error('❌ Debug script error:', error)
  } finally {
    await payrollClient.$disconnect()
    await hrClient.$disconnect()
  }
}

// Run the debug
debugPayrollLookup()

