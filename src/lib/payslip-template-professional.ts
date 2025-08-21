/**
 * Professional Dutch Payslip Template
 * Based on legally accepted Dutch payslip format
 */

import { 
  formatDutchCurrency, 
  formatDutchDate, 
  formatDutchAddress,
  formatDutchEmployeeName,
  formatDutchPeriod,
  formatTaxTable,
  formatEmploymentType,
  generateLoonheffingennummer,
  formatBSN,
  calculateVacationAllowance
} from './dutch-formatting';

export interface PayslipData {
  // Company information
  company: {
    name: string;
    streetName?: string;
    houseNumber?: string;
    houseNumberAddition?: string;
    postalCode?: string;
    city?: string;
    payrollTaxNumber?: string;
    kvkNumber?: string;
  };
  
  // Employee information
  employee: {
    firstName?: string;
    lastName?: string;
    streetName?: string;
    houseNumber?: string;
    houseNumberAddition?: string;
    postalCode?: string;
    city?: string;
    employeeNumber?: string;
    bsn?: string;
    dateOfBirth?: Date | string;
    startDate?: Date | string;
    position?: string;
    department?: string;
    employmentType?: string;
    taxTable?: string;
    hourlyRate?: number;
    gender?: string;
  };
  
  // Payroll period
  period: {
    year: number;
    month: number;
    periodNumber?: number;
    startDate?: Date | string;
    endDate?: Date | string;
  };
  
  // Salary breakdown
  salary: {
    grossSalary: number;
    netSalary: number;
    taxDeduction: number;
    socialSecurity: number;
    pensionDeduction?: number;
    otherDeductions?: number;
    overtime?: number;
    bonus?: number;
    holidayAllowance?: number;
    expenses?: number;
    vacationReserve?: number;
  };
  
  // Cumulative totals (year-to-date)
  cumulative?: {
    workDays?: number;
    workHours?: number;
    grossSalary?: number;
    otherGross?: number;
    taxableIncome?: number;
    wga?: number;
    taxDeduction?: number;
    workDiscount?: number;
    vacationAllowance?: number;
    netSalary?: number;
  };
  
  // Additional information
  additional?: {
    bankAccount?: string;
    paymentDate?: Date | string;
    vacationHours?: {
      begin: number;
      used: number;
      added: number;
      balance: number;
      thisPeriod: number;
    };
  };
}

export function generateProfessionalDutchPayslip(data: PayslipData): string {
  const companyAddress = formatDutchAddress(data.company);
  const employeeAddress = formatDutchAddress(data.employee);
  const employeeName = formatDutchEmployeeName(data.employee);
  const loonheffingennummer = data.company.payrollTaxNumber || generateLoonheffingennummer(data.company.name);
  const currentDate = formatDutchDate(new Date());
  const periodDisplay = formatDutchPeriod(data.period.year, data.period.month);
  
  // Calculate vacation allowance if not provided
  const vacationAllowance = data.salary.vacationReserve || calculateVacationAllowance(data.salary.grossSalary);
  
  // Calculate total gross (including vacation allowance)
  const totalGross = data.salary.grossSalary + vacationAllowance + (data.salary.overtime || 0) + (data.salary.bonus || 0);
  
  // Calculate total deductions
  const totalDeductions = data.salary.taxDeduction + data.salary.socialSecurity + (data.salary.pensionDeduction || 0) + (data.salary.otherDeductions || 0);

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Salarisspecificatie - ${employeeName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.3;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .payslip-container {
            background-color: white;
            max-width: 800px;
            margin: 0 auto;
            padding: 0;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .header {
            background-color: #2d8a8a;
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        
        .header-info {
            text-align: right;
            font-size: 12px;
        }
        
        .content {
            padding: 20px;
        }
        
        .company-employee-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        
        .company-info, .employee-info {
            width: 45%;
        }
        
        .company-info h3, .employee-info h3 {
            margin: 0 0 10px 0;
            font-size: 12px;
            font-weight: bold;
        }
        
        .loonheffing-nummer {
            margin: 20px 0;
            font-weight: bold;
            font-size: 12px;
        }
        
        .salary-section {
            margin-bottom: 20px;
        }
        
        .salary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        .salary-table td {
            padding: 4px 8px;
            border-bottom: 1px solid #eee;
        }
        
        .salary-table .amount {
            text-align: right;
            font-weight: bold;
        }
        
        .section-header {
            background-color: #2d8a8a;
            color: white;
            padding: 8px 12px;
            font-weight: bold;
            font-size: 12px;
            margin: 20px 0 10px 0;
        }
        
        .employee-details {
            background-color: #2d8a8a;
            color: white;
            padding: 15px;
            margin: 20px 0;
        }
        
        .employee-details h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
        }
        
        .employee-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 11px;
        }
        
        .cumulative-section {
            background-color: #2d8a8a;
            color: white;
            padding: 15px;
            margin: 20px 0;
        }
        
        .cumulative-section h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
        }
        
        .cumulative-grid {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 10px;
            font-size: 11px;
        }
        
        .net-payment {
            background-color: #f0f8f8;
            padding: 15px;
            margin: 20px 0;
            border: 2px solid #2d8a8a;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
        }
        
        .additional-info {
            margin-top: 20px;
            font-size: 10px;
        }
        
        .vacation-section {
            background-color: #2d8a8a;
            color: white;
            padding: 10px;
            margin: 10px 0;
        }
        
        .vacation-table {
            width: 100%;
            color: white;
            font-size: 10px;
        }
        
        .vacation-table td {
            padding: 2px 5px;
        }
        
        .deduction-marker {
            color: #d32f2f;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="payslip-container">
        <!-- Header -->
        <div class="header">
            <h1>Salarisspecificatie</h1>
            <div class="header-info">
                <div><strong>Datum:</strong> ${currentDate}</div>
                <div><strong>Periode:</strong> ${periodDisplay}</div>
            </div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Company and Employee Information -->
            <div class="company-employee-info">
                <div class="company-info">
                    <div><strong>${data.company.name}</strong></div>
                    <div>${companyAddress.street}</div>
                    <div>${companyAddress.postalCity}</div>
                </div>
                <div class="employee-info">
                    <div><strong>${employeeName}</strong></div>
                    <div>${employeeAddress.street}</div>
                    <div>${employeeAddress.postalCity}</div>
                </div>
            </div>
            
            <!-- Loonheffingennummer -->
            <div class="loonheffing-nummer">
                <strong>Loonheffingennummer:</strong> ${loonheffingennummer}
            </div>
            
            <!-- Salary Breakdown -->
            <div class="salary-section">
                <table class="salary-table">
                    <tr>
                        <td>Loon ${data.period.month}/${data.period.year}</td>
                        <td class="amount">${formatDutchCurrency(data.salary.grossSalary)}</td>
                    </tr>
                    ${data.salary.overtime ? `
                    <tr>
                        <td>Overwerk</td>
                        <td class="amount">${formatDutchCurrency(data.salary.overtime)}</td>
                    </tr>
                    ` : ''}
                    ${data.salary.bonus ? `
                    <tr>
                        <td>Bonus</td>
                        <td class="amount">${formatDutchCurrency(data.salary.bonus)}</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td>Uitbetaling Vakantiegeldreservering 8,33%</td>
                        <td class="amount">${formatDutchCurrency(vacationAllowance)}</td>
                    </tr>
                    <tr style="border-top: 2px solid #2d8a8a; font-weight: bold;">
                        <td><strong>Totaal Bruto</strong></td>
                        <td class="amount"><strong>${formatDutchCurrency(totalGross)}</strong></td>
                    </tr>
                </table>
            </div>
            
            <!-- Deductions -->
            <div class="section-header">Inhoudingen</div>
            <table class="salary-table">
                <tr>
                    <td>Loonheffing met loonheffingskorting</td>
                    <td class="amount">${formatDutchCurrency(data.salary.taxDeduction)}</td>
                </tr>
                <tr>
                    <td>Sociale verzekeringen</td>
                    <td class="amount">${formatDutchCurrency(data.salary.socialSecurity)}</td>
                </tr>
                ${data.salary.pensionDeduction ? `
                <tr>
                    <td>Pensioenuitkering</td>
                    <td class="amount">${formatDutchCurrency(data.salary.pensionDeduction)}</td>
                </tr>
                ` : ''}
                ${data.salary.otherDeductions ? `
                <tr>
                    <td>Overige inhoudingen</td>
                    <td class="amount">${formatDutchCurrency(data.salary.otherDeductions)}</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #d32f2f; font-weight: bold;">
                    <td><strong>Totaal Inhoudingen</strong></td>
                    <td class="amount deduction-marker"><strong>${formatDutchCurrency(totalDeductions)} -/-</strong></td>
                </tr>
            </table>
            
            <!-- Net Payment -->
            <div class="net-payment">
                <div><strong>Netto loon, met loonheffingskorting</strong></div>
                <div style="font-size: 18px; margin-top: 5px;">${formatDutchCurrency(data.salary.netSalary)}</div>
                ${data.additional?.bankAccount ? `
                <div style="font-size: 12px; margin-top: 10px;">
                    Betaald op rekeningnummer: ${data.additional.bankAccount}
                </div>
                ` : ''}
            </div>
            
            <!-- Employee Details -->
            <div class="employee-details">
                <h3>Werknemergegevens</h3>
                <div class="employee-details-grid">
                    <div><strong>Functie:</strong> ${data.employee.position || 'Niet gespecificeerd'}</div>
                    <div><strong>Afdeling:</strong> ${data.employee.department || 'Algemeen'}</div>
                    <div><strong>Geboortedatum:</strong> ${data.employee.dateOfBirth ? formatDutchDate(data.employee.dateOfBirth) : 'Niet gespecificeerd'}</div>
                    <div><strong>Datum in dienst:</strong> ${data.employee.startDate ? formatDutchDate(data.employee.startDate) : 'Niet gespecificeerd'}</div>
                    ${data.employee.hourlyRate ? `
                    <div><strong>Uurloon:</strong> ${formatDutchCurrency(data.employee.hourlyRate)}</div>
                    ` : ''}
                    <div><strong>Tabel:</strong> ${formatTaxTable(data.employee.taxTable || 'wit')}</div>
                    <div><strong>Personeelsnummer:</strong> ${data.employee.employeeNumber || 'Niet gespecificeerd'}</div>
                    ${data.employee.bsn ? `
                    <div><strong>BSN:</strong> ${formatBSN(data.employee.bsn)}</div>
                    ` : ''}
                    <div><strong>Dienstverband:</strong> ${formatEmploymentType(data.employee.employmentType || 'temporary')}</div>
                    <div><strong>Met loonheffingskorting:</strong> Ja</div>
                </div>
            </div>
            
            <!-- Vacation Reserve -->
            ${vacationAllowance > 0 ? `
            <div class="vacation-section">
                <div><strong>Reservering (en):</strong></div>
                <div>Vak. geld 8,33%: ${formatDutchCurrency(vacationAllowance)}</div>
            </div>
            ` : ''}
            
            <!-- Cumulative Totals -->
            ${data.cumulative ? `
            <div class="cumulative-section">
                <h3>Cumulatieven</h3>
                <div class="cumulative-grid">
                    ${data.cumulative.workDays ? `
                    <div>Loondagen</div>
                    <div>${data.cumulative.workDays.toFixed(2)}</div>
                    ` : ''}
                    ${data.cumulative.workHours ? `
                    <div>Loonuren</div>
                    <div>${data.cumulative.workHours.toFixed(2)}</div>
                    ` : ''}
                    ${data.cumulative.grossSalary ? `
                    <div>Bruto loon</div>
                    <div>${formatDutchCurrency(data.cumulative.grossSalary)}</div>
                    ` : ''}
                    ${data.cumulative.otherGross ? `
                    <div>Overig bruto</div>
                    <div>${formatDutchCurrency(data.cumulative.otherGross)}</div>
                    ` : ''}
                    ${data.cumulative.taxableIncome ? `
                    <div>Heffingsloon</div>
                    <div>${formatDutchCurrency(data.cumulative.taxableIncome)}</div>
                    ` : ''}
                    ${data.cumulative.taxDeduction ? `
                    <div>Loonheffing</div>
                    <div>${formatDutchCurrency(data.cumulative.taxDeduction)}</div>
                    ` : ''}
                    ${data.cumulative.netSalary ? `
                    <div>Netto loon</div>
                    <div>${formatDutchCurrency(data.cumulative.netSalary)}</div>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            <!-- Vacation Hours -->
            ${data.additional?.vacationHours ? `
            <div class="section-header">Overige gegevens</div>
            <div class="vacation-section">
                <table class="vacation-table">
                    <tr>
                        <td><strong>Verzuim-/verlofuren:</strong></td>
                        <td><strong>Begin</strong></td>
                        <td><strong>Af</strong></td>
                        <td><strong>Bij</strong></td>
                        <td><strong>Stand</strong></td>
                        <td><strong>Deze periode</strong></td>
                    </tr>
                    <tr>
                        <td>Vakantie</td>
                        <td>${data.additional.vacationHours.begin}</td>
                        <td>${data.additional.vacationHours.used}</td>
                        <td>${data.additional.vacationHours.added}</td>
                        <td>${data.additional.vacationHours.balance}</td>
                        <td>+${data.additional.vacationHours.thisPeriod}</td>
                    </tr>
                </table>
            </div>
            ` : ''}
            
            <!-- Additional Information -->
            <div class="additional-info">
                <div><strong>Gegenereerd op:</strong> ${currentDate}</div>
                ${data.additional?.paymentDate ? `
                <div><strong>Betaaldatum:</strong> ${formatDutchDate(data.additional.paymentDate)}</div>
                ` : ''}
                <div><em>Dit is een automatisch gegenereerde salarisspecificatie.</em></div>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
}

