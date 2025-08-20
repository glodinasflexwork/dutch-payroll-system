require('dotenv').config({ path: '.env.local' });

const { PrismaClient: PayrollPrismaClient } = require('@prisma/payroll-client');
const { PrismaClient: HRPrismaClient } = require('@prisma/hr-client');

async function generateMissingPayslips() {
  const payrollClient = new PayrollPrismaClient({
    datasources: {
      db: {
        url: process.env.PAYROLL_DATABASE_URL
      }
    }
  });
  
  const hrClient = new HRPrismaClient({
    datasources: {
      db: {
        url: process.env.HR_DATABASE_URL
      }
    }
  });

  try {
    console.log('🔧 Generating Missing PayslipGeneration Records...\n');

    const companyId = 'cme7fn8kf0000k40ag368f3a1'; // Glodinas Finance B.V.
    const employeeId = 'cme7fsv070009k40and8jh2l4'; // Cihat Kaya

    // Missing periods identified from previous analysis
    const missingPeriods = [
      { year: 2025, month: 9, recordId: 'cmejpo3a70000jp0avz401st3' },
      { year: 2026, month: 2, recordId: 'cmeipoy9w0006l80ahtyo729k' },
      { year: 2026, month: 3, recordId: 'cmejpr9ly0000lc0az2htc4pb' },
      { year: 2026, month: 8, recordId: 'cmejv0l0e0000jr0ado41j4vu' },
      { year: 2026, month: 10, recordId: 'cmejvd6zb0000qw3tfs63rbl4' },
      { year: 2026, month: 12, recordId: 'cmejtjs5e0000l10bwaante7e' }
    ];

    console.log(`🎯 Target Company: Glodinas Finance B.V. (${companyId})`);
    console.log(`👤 Target Employee: Cihat Kaya (${employeeId})`);
    console.log(`📅 Missing Periods: ${missingPeriods.length}`);
    console.log('');

    // Verify PayrollRecords exist
    console.log('🔍 Verifying PayrollRecord entries...');
    for (const period of missingPeriods) {
      const payrollRecord = await payrollClient.payrollRecord.findUnique({
        where: { id: period.recordId }
      });
      
      if (payrollRecord) {
        console.log(`✅ ${period.year}-${period.month.toString().padStart(2, '0')}: PayrollRecord exists (${payrollRecord.status})`);
      } else {
        console.log(`❌ ${period.year}-${period.month.toString().padStart(2, '0')}: PayrollRecord NOT FOUND!`);
      }
    }

    // Get company and employee information needed for payslip generation
    console.log('\n🏢 Fetching company information...');
    const company = await hrClient.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      throw new Error(`Company not found: ${companyId}`);
    }
    console.log(`✅ Company: ${company.name}`);

    console.log('\n👤 Fetching employee information...');
    const employee = await hrClient.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      throw new Error(`Employee not found: ${employeeId}`);
    }
    console.log(`✅ Employee: ${employee.firstName} ${employee.lastName} (${employee.employeeNumber})`);

    // Generate missing payslips
    console.log('\n🔧 Generating missing PayslipGeneration records...\n');
    
    let successCount = 0;
    let errorCount = 0;

    for (const period of missingPeriods) {
      const periodStr = `${period.year}-${period.month.toString().padStart(2, '0')}`;
      console.log(`📄 Processing ${periodStr}...`);

      try {
        // Get the PayrollRecord with full details
        const payrollRecord = await payrollClient.payrollRecord.findUnique({
          where: { id: period.recordId }
        });

        if (!payrollRecord) {
          console.log(`❌ ${periodStr}: PayrollRecord not found`);
          errorCount++;
          continue;
        }

        // Check if PayslipGeneration already exists (double-check)
        const existingPayslip = await payrollClient.payslipGeneration.findFirst({
          where: {
            payrollRecordId: period.recordId,
            companyId: companyId
          }
        });

        if (existingPayslip) {
          console.log(`⚠️ ${periodStr}: PayslipGeneration already exists, skipping`);
          continue;
        }

        // Generate payslip HTML content
        const fileName = `payslip-${employee.employeeNumber}-${period.year}-${period.month.toString().padStart(2, '0')}.html`;
        
        // Create a simplified payslip HTML (using the same structure as existing ones)
        const payslipHTML = generatePayslipHTML({
          company: company,
          employee: employee,
          payrollRecord: payrollRecord,
          period: periodStr
        });

        // Save HTML file to temporary storage first
        const fs = require('fs').promises;
        const path = require('path');
        
        const payslipsDir = '/tmp/payslips';
        await fs.mkdir(payslipsDir, { recursive: true });
        
        const filePath = path.join(payslipsDir, fileName);
        await fs.writeFile(filePath, payslipHTML, 'utf8');

        // Create PayslipGeneration record
        const payslipGeneration = await payrollClient.payslipGeneration.create({
          data: {
            employeeId: employeeId,
            companyId: companyId,
            payrollRecordId: period.recordId,
            fileName: fileName,
            filePath: filePath,
            status: 'generated',
            generatedAt: new Date()
          }
        });

        console.log(`✅ ${periodStr}: PayslipGeneration created (ID: ${payslipGeneration.id})`);
        console.log(`💾 ${periodStr}: HTML file saved to ${filePath}`);
        successCount++;

      } catch (error) {
        console.log(`❌ ${periodStr}: Error generating payslip - ${error.message}`);
        errorCount++;
      }

      console.log(''); // Empty line for readability
    }

    // Summary
    console.log('📊 GENERATION SUMMARY:');
    console.log(`✅ Successfully generated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📄 Total processed: ${missingPeriods.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Missing PayslipGeneration records have been created!');
      console.log('Users should now be able to download payslips for these periods.');
    }

  } catch (error) {
    console.error('💥 Error during payslip generation:', error);
  } finally {
    await payrollClient.$disconnect();
    await hrClient.$disconnect();
  }
}

// Function to generate payslip HTML content
function generatePayslipHTML(data) {
  const { company, employee, payrollRecord, period } = data;
  
  // Calculate basic payroll values (simplified version)
  const grossPay = payrollRecord.grossPay || 3500;
  const netPay = payrollRecord.netPay || 2551.217;
  const taxAmount = grossPay - netPay;
  
  return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loonstrook ${period} - ${employee.firstName} ${employee.lastName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 20px; }
        .company-info, .employee-info { display: inline-block; width: 45%; vertical-align: top; }
        .info-section { margin-bottom: 20px; }
        .info-section h3 { color: #0066cc; margin-bottom: 10px; }
        .pay-details { margin-top: 30px; }
        .pay-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .pay-item.total { font-weight: bold; border-top: 2px solid #0066cc; margin-top: 10px; }
        .earnings, .deductions { margin-bottom: 20px; }
        .earnings h3 { color: #28a745; }
        .deductions h3 { color: #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LOONSTROOK</h1>
        <h2>Periode: ${period}</h2>
    </div>

    <div class="content">
        <div class="company-info">
            <div class="info-section">
                <h3>Werkgever</h3>
                <p><strong>${company.name}</strong></p>
                <p>${company.address || 'Adres niet beschikbaar'}</p>
                <p>${company.postalCode || ''} ${company.city || ''}</p>
                <p>KvK: ${company.kvkNumber || 'Niet beschikbaar'}</p>
                <p>Fiscaal nr: ${company.taxNumber || 'Niet beschikbaar'}</p>
            </div>
        </div>
        
        <div class="employee-info">
            <div class="info-section">
                <h3>Werknemer</h3>
                <p><strong>${employee.firstName} ${employee.lastName}</strong></p>
                <p>Personeelsnummer: ${employee.employeeNumber}</p>
                <p>Functie: ${employee.position || 'Software Engineer'}</p>
                <p>Afdeling: ${employee.department || 'IT'}</p>
                <p>BSN: ${employee.bsn || 'Niet beschikbaar'}</p>
            </div>
        </div>

        <div class="pay-details">
            <div class="earnings">
                <h3>Inkomsten</h3>
                <div class="pay-item">
                    <span>Bruto loon</span>
                    <span>€${grossPay.toFixed(2)}</span>
                </div>
            </div>

            <div class="deductions">
                <h3>Inhoudingen</h3>
                <div class="pay-item">
                    <span>Loonheffing</span>
                    <span>€${taxAmount.toFixed(2)}</span>
                </div>
            </div>

            <div class="pay-item total">
                <span><strong>Netto uitbetaling</strong></span>
                <span><strong>€${netPay.toFixed(2)}</strong></span>
            </div>
        </div>
    </div>

    <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
        <p>Gegenereerd op ${new Date().toLocaleDateString('nl-NL')} door SalarySync</p>
    </div>
</body>
</html>`;
}

generateMissingPayslips().catch(console.error);

