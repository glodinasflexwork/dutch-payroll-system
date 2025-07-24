/**
 * Debug script to investigate why HR database initialization fails 
 * for "Glodinas Finance B.V." but not other companies
 */

const { PrismaClient } = require('@prisma/client')
const { PrismaClient: HRClient } = require('@prisma/hr-client')

const authClient = new PrismaClient()
const hrClient = new HRClient()

async function investigateCompanySpecificIssue() {
  try {
    console.log('🔍 Investigating company-specific HR database initialization issue...\n')

    // 1. Get all companies from auth database
    console.log('📊 Step 1: Fetching all companies from auth database...')
    const allCompanies = await authClient.company.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            userCompanies: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`Found ${allCompanies.length} companies in auth database:`)
    allCompanies.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name} (ID: ${company.id}, Users: ${company._count.userCompanies})`)
    })

    // 2. Check HR database state for each company
    console.log('\n📊 Step 2: Checking HR database state for each company...')
    
    const companyStates = []
    
    for (const company of allCompanies) {
      try {
        // Check if company exists in HR database
        const hrCompany = await hrClient.company.findUnique({
          where: { id: company.id },
          include: {
            leaveTypes: true,
            employees: true
          }
        })

        const state = {
          authCompany: company,
          hrExists: !!hrCompany,
          hrCompany: hrCompany,
          leaveTypesCount: hrCompany?.leaveTypes?.length || 0,
          employeesCount: hrCompany?.employees?.length || 0,
          hasIssues: false,
          issues: []
        }

        // Check for potential issues
        if (hrCompany) {
          // Check if company has required fields
          if (!hrCompany.name || hrCompany.name === '') {
            state.hasIssues = true
            state.issues.push('Missing or empty company name')
          }

          // Check leave types
          if (hrCompany.leaveTypes.length === 0) {
            state.hasIssues = true
            state.issues.push('No leave types configured')
          }

          // Check for duplicate leave types
          const leaveTypeCodes = hrCompany.leaveTypes.map(lt => lt.code)
          const duplicateCodes = leaveTypeCodes.filter((code, index) => leaveTypeCodes.indexOf(code) !== index)
          if (duplicateCodes.length > 0) {
            state.hasIssues = true
            state.issues.push(`Duplicate leave type codes: ${duplicateCodes.join(', ')}`)
          }

          // Check for leave types without companyId
          const invalidLeaveTypes = hrCompany.leaveTypes.filter(lt => !lt.companyId || lt.companyId !== company.id)
          if (invalidLeaveTypes.length > 0) {
            state.hasIssues = true
            state.issues.push(`Leave types with invalid companyId: ${invalidLeaveTypes.length}`)
          }
        }

        companyStates.push(state)

      } catch (error) {
        companyStates.push({
          authCompany: company,
          hrExists: false,
          error: error.message,
          hasIssues: true,
          issues: [`HR database error: ${error.message}`]
        })
      }
    }

    // 3. Display results
    console.log('\n📋 Step 3: Company-specific analysis results...')
    
    companyStates.forEach((state, index) => {
      const company = state.authCompany
      console.log(`\n${index + 1}. ${company.name}`)
      console.log(`   Auth ID: ${company.id}`)
      console.log(`   HR Database: ${state.hrExists ? '✅ EXISTS' : '❌ MISSING'}`)
      
      if (state.hrExists) {
        console.log(`   Leave Types: ${state.leaveTypesCount}`)
        console.log(`   Employees: ${state.employeesCount}`)
      }
      
      if (state.hasIssues) {
        console.log(`   🚨 ISSUES FOUND:`)
        state.issues.forEach(issue => {
          console.log(`      - ${issue}`)
        })
      } else if (state.hrExists) {
        console.log(`   ✅ No issues detected`)
      }

      if (state.error) {
        console.log(`   ❌ ERROR: ${state.error}`)
      }
    })

    // 4. Focus on Glodinas Finance specifically
    console.log('\n🎯 Step 4: Specific analysis for Glodinas Finance B.V...')
    
    const glodinasCompany = companyStates.find(state => 
      state.authCompany.name.toLowerCase().includes('glodinas') ||
      state.authCompany.name.toLowerCase().includes('finance')
    )

    if (glodinasCompany) {
      console.log('📊 Glodinas Finance B.V. detailed analysis:')
      console.log(`   Company ID: ${glodinasCompany.authCompany.id}`)
      console.log(`   HR Database State: ${glodinasCompany.hrExists ? 'EXISTS' : 'MISSING'}`)
      
      if (glodinasCompany.hrCompany) {
        console.log('   HR Company Details:')
        console.log(`     Name: "${glodinasCompany.hrCompany.name}"`)
        console.log(`     Working Hours: ${glodinasCompany.hrCompany.workingHoursPerWeek}`)
        console.log(`     Leave Types: ${glodinasCompany.hrCompany.leaveTypes.length}`)
        
        if (glodinasCompany.hrCompany.leaveTypes.length > 0) {
          console.log('     Leave Types Details:')
          glodinasCompany.hrCompany.leaveTypes.forEach(lt => {
            console.log(`       - ${lt.name} (${lt.code}) - CompanyId: ${lt.companyId}`)
          })
        }
      }

      if (glodinasCompany.hasIssues) {
        console.log('   🚨 SPECIFIC ISSUES:')
        glodinasCompany.issues.forEach(issue => {
          console.log(`     - ${issue}`)
        })
      }
    } else {
      console.log('❌ Glodinas Finance B.V. not found in company list')
    }

    // 5. Summary and recommendations
    console.log('\n📝 Step 5: Summary and Recommendations...')
    
    const companiesWithIssues = companyStates.filter(state => state.hasIssues)
    const companiesWithoutHR = companyStates.filter(state => !state.hrExists)
    
    console.log(`Total companies: ${companyStates.length}`)
    console.log(`Companies with HR database: ${companyStates.length - companiesWithoutHR.length}`)
    console.log(`Companies without HR database: ${companiesWithoutHR.length}`)
    console.log(`Companies with issues: ${companiesWithIssues.length}`)

    if (companiesWithIssues.length > 0) {
      console.log('\n🔧 Recommended Actions:')
      companiesWithIssues.forEach(state => {
        console.log(`\n${state.authCompany.name}:`)
        state.issues.forEach(issue => {
          console.log(`  - Fix: ${issue}`)
        })
      })
    }

  } catch (error) {
    console.error('❌ Investigation failed:', error)
    console.error('Stack:', error.stack)
  } finally {
    await authClient.$disconnect()
    await hrClient.$disconnect()
  }
}

// Run the investigation
investigateCompanySpecificIssue()

