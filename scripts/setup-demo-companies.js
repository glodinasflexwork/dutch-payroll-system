require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client')
const { PrismaClient: HRPrismaClient } = require('@prisma/hr-client')

const authPrisma = new PrismaClient()
const hrPrisma = new HRPrismaClient()

async function setupDemoCompanies() {
  try {
    console.log('🚀 Setting up demo companies for cihatkaya@glodinas.nl...')

    // Find the user
    const user = await authPrisma.user.findUnique({
      where: { email: 'cihatkaya@glodinas.nl' }
    })

    if (!user) {
      console.error('❌ User cihatkaya@glodinas.nl not found')
      return
    }

    console.log('✅ Found user:', user.email)

    // Company data
    const companiesData = [
      {
        name: 'Tech Solutions B.V.',
        role: 'Owner',
        employeeCount: 24,
        address: 'Techniekstraat 15',
        city: 'Amsterdam',
        postalCode: '1012 AB',
        phone: '+31 20 123 4567',
        email: 'info@techsolutions.nl',
        website: 'https://techsolutions.nl',
        kvkNumber: '12345678',
        industry: 'Technology',
        employees: [
          { firstName: 'Jan', lastName: 'de Vries', position: 'Software Engineer', department: 'Development', bsn: '123456789' },
          { firstName: 'Emma', lastName: 'van der Berg', position: 'Product Manager', department: 'Product', bsn: '234567890' },
          { firstName: 'Pieter', lastName: 'Jansen', position: 'DevOps Engineer', department: 'Development', bsn: '345678901' },
          { firstName: 'Sophie', lastName: 'Bakker', position: 'UX Designer', department: 'Design', bsn: '456789012' },
          { firstName: 'Tom', lastName: 'van Dijk', position: 'Backend Developer', department: 'Development', bsn: '567890123' },
          { firstName: 'Lisa', lastName: 'Mulder', position: 'Frontend Developer', department: 'Development', bsn: '678901234' },
          { firstName: 'Mark', lastName: 'Visser', position: 'QA Engineer', department: 'Quality', bsn: '789012345' },
          { firstName: 'Anna', lastName: 'de Jong', position: 'Scrum Master', department: 'Product', bsn: '890123456' },
          { firstName: 'David', lastName: 'Smit', position: 'Data Scientist', department: 'Analytics', bsn: '901234567' },
          { firstName: 'Sarah', lastName: 'van Leeuwen', position: 'Security Engineer', department: 'Security', bsn: '012345678' },
          { firstName: 'Michael', lastName: 'Hendriks', position: 'Cloud Architect', department: 'Infrastructure', bsn: '123450789' },
          { firstName: 'Julia', lastName: 'Peters', position: 'Business Analyst', department: 'Business', bsn: '234561890' },
          { firstName: 'Robert', lastName: 'van der Meer', position: 'Technical Lead', department: 'Development', bsn: '345672901' },
          { firstName: 'Nina', lastName: 'Koster', position: 'Marketing Manager', department: 'Marketing', bsn: '456783012' },
          { firstName: 'Lucas', lastName: 'Brouwer', position: 'Sales Manager', department: 'Sales', bsn: '567894123' },
          { firstName: 'Mila', lastName: 'van den Berg', position: 'HR Manager', department: 'HR', bsn: '678905234' },
          { firstName: 'Kevin', lastName: 'Dijkstra', position: 'Finance Manager', department: 'Finance', bsn: '789016345' },
          { firstName: 'Lotte', lastName: 'Vermeulen', position: 'Operations Manager', department: 'Operations', bsn: '890127456' },
          { firstName: 'Thijs', lastName: 'van der Laan', position: 'Customer Success', department: 'Support', bsn: '901238567' },
          { firstName: 'Isa', lastName: 'Hoekstra', position: 'Content Manager', department: 'Marketing', bsn: '012349678' },
          { firstName: 'Bas', lastName: 'Meijer', position: 'System Administrator', department: 'IT', bsn: '123460789' },
          { firstName: 'Fleur', lastName: 'van Wijk', position: 'Legal Counsel', department: 'Legal', bsn: '234571890' },
          { firstName: 'Joris', lastName: 'Dekker', position: 'Compliance Officer', department: 'Compliance', bsn: '345682901' },
          { firstName: 'Roos', lastName: 'van der Wal', position: 'Executive Assistant', department: 'Executive', bsn: '456793012' }
        ]
      },
      {
        name: 'Marketing Plus',
        role: 'Admin',
        employeeCount: 12,
        address: 'Marketingplein 8',
        city: 'Rotterdam',
        postalCode: '3011 CD',
        phone: '+31 10 987 6543',
        email: 'hello@marketingplus.nl',
        website: 'https://marketingplus.nl',
        kvkNumber: '87654321',
        industry: 'Marketing & Advertising',
        employees: [
          { firstName: 'Sanne', lastName: 'van der Heijden', position: 'Creative Director', department: 'Creative', bsn: '567804123' },
          { firstName: 'Rick', lastName: 'Scholten', position: 'Account Manager', department: 'Account Management', bsn: '678915234' },
          { firstName: 'Noa', lastName: 'van Beek', position: 'Social Media Manager', department: 'Digital', bsn: '789026345' },
          { firstName: 'Daan', lastName: 'Willems', position: 'Graphic Designer', department: 'Creative', bsn: '890137456' },
          { firstName: 'Eva', lastName: 'Kuiper', position: 'Content Strategist', department: 'Strategy', bsn: '901248567' },
          { firstName: 'Finn', lastName: 'van der Pol', position: 'SEO Specialist', department: 'Digital', bsn: '012359678' },
          { firstName: 'Zoe', lastName: 'Martens', position: 'Brand Manager', department: 'Brand', bsn: '123470789' },
          { firstName: 'Lars', lastName: 'van Vliet', position: 'Media Planner', department: 'Media', bsn: '234581890' },
          { firstName: 'Iris', lastName: 'Bosman', position: 'Copywriter', department: 'Creative', bsn: '345692901' },
          { firstName: 'Sem', lastName: 'van der Veen', position: 'Digital Analyst', department: 'Analytics', bsn: '456703012' },
          { firstName: 'Luna', lastName: 'Prins', position: 'Project Manager', department: 'Operations', bsn: '567814123' },
          { firstName: 'Bram', lastName: 'de Wit', position: 'Business Development', department: 'Business', bsn: '678925234' }
        ]
      },
      {
        name: 'Consulting Group',
        role: 'HR Manager',
        employeeCount: 8,
        address: 'Consultingweg 22',
        city: 'Utrecht',
        postalCode: '3511 EF',
        phone: '+31 30 555 7890',
        email: 'contact@consultinggroup.nl',
        website: 'https://consultinggroup.nl',
        kvkNumber: '11223344',
        industry: 'Management Consulting',
        employees: [
          { firstName: 'Maxime', lastName: 'van der Steen', position: 'Senior Consultant', department: 'Consulting', bsn: '789036345' },
          { firstName: 'Olivier', lastName: 'Huisman', position: 'Strategy Consultant', department: 'Strategy', bsn: '890147456' },
          { firstName: 'Amber', lastName: 'van Dongen', position: 'Business Analyst', department: 'Analysis', bsn: '901258567' },
          { firstName: 'Jesse', lastName: 'Roos', position: 'Change Manager', department: 'Change Management', bsn: '012369678' },
          { firstName: 'Tessa', lastName: 'van der Horst', position: 'Project Manager', department: 'Project Management', bsn: '123480789' },
          { firstName: 'Noah', lastName: 'Leenders', position: 'Data Consultant', department: 'Data', bsn: '234591890' },
          { firstName: 'Lara', lastName: 'van Schaik', position: 'HR Consultant', department: 'HR', bsn: '345602901' },
          { firstName: 'Stijn', lastName: 'Verhoeven', position: 'Finance Consultant', department: 'Finance', bsn: '456713012' }
        ]
      }
    ]

    // Create companies and employees
    for (const companyData of companiesData) {
      console.log(`\n📊 Setting up company: ${companyData.name}`)

      // Upsert company in auth database (create or update if exists)
      const authCompany = await authPrisma.company.upsert({
        where: { name: companyData.name },
        update: {
          address: companyData.address,
          city: companyData.city,
          postalCode: companyData.postalCode,
          phone: companyData.phone,
          email: companyData.email,
          website: companyData.website,
          kvkNumber: companyData.kvkNumber,
          industry: companyData.industry,
          employeeCount: companyData.employeeCount
        },
        create: {
          name: companyData.name,
          address: companyData.address,
          city: companyData.city,
          postalCode: companyData.postalCode,
          phone: companyData.phone,
          email: companyData.email,
          website: companyData.website,
          kvkNumber: companyData.kvkNumber,
          industry: companyData.industry,
          employeeCount: companyData.employeeCount
        }
      })

      console.log(`✅ Upserted auth company: ${authCompany.id}`)

      // Upsert UserCompany relationship
      const existingUserCompany = await authPrisma.userCompany.findFirst({
        where: {
          userId: user.id,
          companyId: authCompany.id
        }
      })

      if (!existingUserCompany) {
        await authPrisma.userCompany.create({
          data: {
            userId: user.id,
            companyId: authCompany.id,
            role: companyData.role,
            isActive: true
          }
        })
        console.log(`✅ Created user-company relationship with role: ${companyData.role}`)
      } else {
        await authPrisma.userCompany.update({
          where: { id: existingUserCompany.id },
          data: {
            role: companyData.role,
            isActive: true
          }
        })
        console.log(`✅ Updated user-company relationship with role: ${companyData.role}`)
      }

      // Upsert company in HR database
      const hrCompany = await hrPrisma.company.upsert({
        where: { id: authCompany.id },
        update: {
          name: companyData.name,
          address: companyData.address,
          city: companyData.city,
          postalCode: companyData.postalCode,
          phone: companyData.phone,
          email: companyData.email,
          website: companyData.website,
          kvkNumber: companyData.kvkNumber,
          industry: companyData.industry,
          employeeCount: companyData.employeeCount
        },
        create: {
          id: authCompany.id, // Use same ID for consistency
          name: companyData.name,
          address: companyData.address,
          city: companyData.city,
          postalCode: companyData.postalCode,
          phone: companyData.phone,
          email: companyData.email,
          website: companyData.website,
          kvkNumber: companyData.kvkNumber,
          industry: companyData.industry,
          employeeCount: companyData.employeeCount
        }
      })

      console.log(`✅ Upserted HR company: ${hrCompany.id}`)

      // Create/update employees (only if they don't exist)
      const existingEmployeeCount = await hrPrisma.employee.count({
        where: { companyId: hrCompany.id }
      })

      if (existingEmployeeCount === 0) {
        console.log(`📝 Creating ${companyData.employees.length} employees...`)
        let employeeNumber = 1
        for (const employeeData of companyData.employees) {
          const employee = await hrPrisma.employee.create({
            data: {
              employeeNumber: `EMP${employeeNumber.toString().padStart(3, '0')}`,
              firstName: employeeData.firstName,
              lastName: employeeData.lastName,
              email: `${employeeData.firstName.toLowerCase()}.${employeeData.lastName.toLowerCase().replace(' ', '')}@${companyData.name.toLowerCase().replace(/[^a-z]/g, '')}.nl`,
              bsn: employeeData.bsn,
              dateOfBirth: new Date('1990-01-01'), // Default birth date
              startDate: new Date('2024-01-01'), // Default start date
              position: employeeData.position,
              department: employeeData.department,
              employmentType: 'FULL_TIME',
              contractType: 'PERMANENT',
              workingHours: 40,
              companyId: hrCompany.id,
              createdBy: user.id
            }
          })

          employeeNumber++
        }
        console.log(`✅ Created ${companyData.employees.length} employees`)
      } else {
        console.log(`ℹ️  Company already has ${existingEmployeeCount} employees, skipping employee creation`)
      }
    }

    // Set the first company as the user's current company
    const firstCompany = await authPrisma.company.findFirst({
      where: {
        UserCompany: {
          some: {
            userId: user.id
          }
        }
      }
    })

    if (firstCompany) {
      await authPrisma.user.update({
        where: { id: user.id },
        data: { companyId: firstCompany.id }
      })
      console.log(`✅ Set ${firstCompany.name} as current company`)
    }

    console.log('\n🎉 Demo companies setup completed successfully!')
    console.log('\nCreated companies:')
    console.log('- Tech Solutions B.V. (Owner, 24 employees)')
    console.log('- Marketing Plus (Admin, 12 employees)')
    console.log('- Consulting Group (HR Manager, 8 employees)')

  } catch (error) {
    console.error('❌ Error setting up demo companies:', error)
  } finally {
    await authPrisma.$disconnect()
    await hrPrisma.$disconnect()
  }
}

// Run the setup
setupDemoCompanies()

