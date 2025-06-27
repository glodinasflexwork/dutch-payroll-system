const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyTestUser() {
  try {
    // Find the test user
    const user = await prisma.user.findUnique({
      where: {
        email: 'test@salarysync.demo'
      }
    })

    if (!user) {
      console.log('User not found')
      return
    }

    console.log('Found user:', user.id)
    console.log('User email:', user.email)
    console.log('User name:', user.name)

    // Get the company
    const company = await prisma.company.findFirst({
      where: {
        users: {
          some: {
            id: user.id
          }
        }
      }
    })

    if (company) {
      console.log('Company found:', company.id, company.name)

      // Create some sample leave types for testing
      const leaveTypes = await prisma.leaveType.createMany({
        data: [
          {
            companyId: company.id,
            name: 'Vakantie',
            nameEn: 'Annual Leave',
            code: 'VACATION',
            color: '#3B82F6',
            isPaid: true,
            requiresApproval: true,
            maxDaysPerYear: 25,
            carryOverDays: 5,
            isActive: true
          },
          {
            companyId: company.id,
            name: 'Ziekteverlof',
            nameEn: 'Sick Leave',
            code: 'SICK',
            color: '#EF4444',
            isPaid: true,
            requiresApproval: false,
            isActive: true
          },
          {
            companyId: company.id,
            name: 'Persoonlijk Verlof',
            nameEn: 'Personal Leave',
            code: 'PERSONAL',
            color: '#8B5CF6',
            isPaid: false,
            requiresApproval: true,
            maxDaysPerYear: 5,
            isActive: true
          }
        ],
        skipDuplicates: true
      })

      console.log('Sample leave types created:', leaveTypes.count)

      // Create a sample employee for testing
      const employee = await prisma.employee.create({
        data: {
          companyId: company.id,
          employeeNumber: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@democompany.nl',
          bsn: '123456789', // Sample BSN for testing
          dateOfBirth: new Date('1990-01-01'),
          hireDate: new Date('2024-01-01'),
          jobTitle: 'Software Developer',
          department: 'IT',
          salary: 60000,
          isActive: true
        }
      })

      console.log('Sample employee created:', employee.id)

      // Create leave balances for the employee
      const currentYear = new Date().getFullYear()
      const createdLeaveTypes = await prisma.leaveType.findMany({
        where: { companyId: company.id }
      })

      for (const leaveType of createdLeaveTypes) {
        await prisma.leaveBalance.create({
          data: {
            employeeId: employee.id,
            companyId: company.id,
            leaveTypeId: leaveType.id,
            year: currentYear,
            totalEntitled: leaveType.maxDaysPerYear || 25,
            carriedOver: 0,
            available: leaveType.maxDaysPerYear || 25,
            used: 0,
            pending: 0
          }
        })
      }

      console.log('Leave balances created for employee')
    }

    console.log('Setup completed successfully!')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyTestUser()

