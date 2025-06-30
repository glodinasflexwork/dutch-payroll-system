'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { 
  Calculator, 
  Users, 
  Euro, 
  Calendar, 
  FileText, 
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { TrialGuard } from '@/components/trial/TrialGuard';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  position: string;
  department: string;
  salary: number;
}

interface PayrollCalculation {
  grossMonthlySalary: number;
  netMonthlySalary: number;
  netAnnualSalary: number;
  incomeTaxAfterCredits: number;
  totalTaxCredits: number;
  holidayAllowanceGross: number;
  totalEmployerCosts: number;
  taxBracketBreakdown: Array<{
    bracket: number;
    rate: number;
    incomeInBracket: number;
    taxAmount: number;
  }>;
}

interface PayrollRecord {
  id: string;
  employeeId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossPay: number;
  netPay: number;
  totalDeductions: number;
  processedDate: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
}

export default function PayrollPage() {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [company, setCompany] = useState<{ createdAt: string } | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [payPeriodStart, setPayPeriodStart] = useState('');
  const [payPeriodEnd, setPayPeriodEnd] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [useAdvancedDates, setUseAdvancedDates] = useState(false);
  const [hoursWorked, setHoursWorked] = useState<number>(0);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [bonuses, setBonuses] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('calculate');
  const [calculations, setCalculations] = useState<{[key: string]: PayrollCalculation}>({});
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isDryRun, setIsDryRun] = useState(false);

  useEffect(() => {
    if (session) {
      fetchEmployees();
      fetchPayrollRecords();
      fetchCompany();
    }
  }, [session]);

  useEffect(() => {
    // Set default pay period to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setPayPeriodStart(firstDay.toISOString().split('T')[0]);
    setPayPeriodEnd(lastDay.toISOString().split('T')[0]);
  }, []);

  // Update pay period dates when month/year selection changes
  useEffect(() => {
    if (!useAdvancedDates) {
      const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
      const lastDay = new Date(selectedYear, selectedMonth, 0);
      
      setPayPeriodStart(firstDay.toISOString().split('T')[0]);
      setPayPeriodEnd(lastDay.toISOString().split('T')[0]);
    }
  }, [selectedYear, selectedMonth, useAdvancedDates]);

  // Generate year options based on company creation date
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const companyStartYear = company 
      ? new Date(company.createdAt).getFullYear()
      : currentYear; // Fallback to current year if company data not loaded
    
    const years = [];
    // Start from company creation year, go to next year (for planning)
    for (let year = companyStartYear; year <= currentYear + 1; year++) {
      years.push(year);
    }
    return years;
  };

  // Month options
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Employee selection helpers
  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAllEmployees = () => {
    setSelectedEmployees(employees.map(emp => emp.id));
  };

  const deselectAllEmployees = () => {
    setSelectedEmployees([]);
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchCompany = async () => {
    try {
      const response = await fetch('/api/company');
      if (response.ok) {
        const data = await response.json();
        setCompany(data.company);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    }
  };

  const fetchPayrollRecords = async () => {
    try {
      const response = await fetch('/api/payroll');
      if (response.ok) {
        const data = await response.json();
        setPayrollRecords(data.payrollRecords || []);
      }
    } catch (error) {
      console.error('Error fetching payroll records:', error);
    }
  };

  const calculatePayroll = async () => {
    if (selectedEmployees.length === 0 || !payPeriodStart || !payPeriodEnd) {
      alert('Please select at least one employee and pay period');
      return;
    }

    setLoading(true);
    try {
      const newCalculations: {[key: string]: PayrollCalculation} = {};
      
      for (const employeeId of selectedEmployees) {
        const response = await fetch('/api/payroll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employeeId: employeeId,
            payPeriodStart,
            payPeriodEnd
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          newCalculations[employeeId] = data.calculation;
          if (selectedEmployees.length === 1) {
            setBreakdown(data.breakdown);
          }
        } else {
          const error = await response.json();
          alert(`Error calculating for employee ${employeeId}: ${error.error}`);
        }
      }
      
      setCalculations(newCalculations);
    } catch (error) {
      console.error('Error calculating payroll:', error);
      alert('Failed to calculate payroll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processPayroll = async () => {
    if (selectedEmployees.length === 0 || !payPeriodStart || !payPeriodEnd) {
      alert('Please select at least one employee and pay period');
      return;
    }

    setProcessing(true);
    try {
      // Use the batch processing API
      const response = await fetch('/api/payroll/management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeIds: selectedEmployees,
          payPeriodStart,
          payPeriodEnd,
          dryRun: isDryRun
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBatchResults(data.results || []);
        
        if (!isDryRun) {
          alert(`Payroll processed successfully for ${selectedEmployees.length} employee(s)!`);
          // Refresh payroll records
          fetchPayrollRecords();
        } else {
          alert(`Payroll calculated for ${selectedEmployees.length} employee(s) (dry run - not saved)`);
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error processing payroll:', error);
      alert('Failed to process payroll. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const tabs = [
    { id: 'calculate', name: 'Calculate Payroll', icon: Calculator },
    { id: 'records', name: 'Payroll Records', icon: FileText },
    { id: 'reports', name: 'Reports', icon: TrendingUp },
  ];

  return (
    <DashboardLayout>
      <TrialGuard feature="payroll processing">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payroll Processing</h1>
              <p className="mt-1 text-sm text-gray-500">
                Calculate and process Dutch payroll with accurate tax calculations
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Calculate Payroll Tab */}
          {activeTab === 'calculate' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payroll Calculation Form */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payroll Calculation</h3>
                
                <div className="space-y-4">
                  {/* Employee Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Select Employees
                      </label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={selectAllEmployees}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={deselectAllEmployees}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {employees.map((employee) => (
                        <label key={employee.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={() => toggleEmployeeSelection(employee.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {employee.firstName} {employee.lastName} ({employee.employeeNumber})
                          </span>
                        </label>
                      ))}
                    </div>
                    
                    {selectedEmployees.length > 0 && (
                      <div className="text-xs text-blue-600 mt-2">
                        {selectedEmployees.length} employee(s) selected
                      </div>
                    )}
                  </div>
                  
                  {/* Pay Period Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Pay Period</h4>
                      <button
                        type="button"
                        onClick={() => setUseAdvancedDates(!useAdvancedDates)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {useAdvancedDates ? 'Use Month Selector' : 'Advanced Dates'}
                      </button>
                    </div>

                    {!useAdvancedDates ? (
                      /* Visual Month/Year Selector */
                      <div className="space-y-4">
                        {/* Year Tabs */}
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                          {getYearOptions().map((year) => (
                            <button
                              key={year}
                              onClick={() => setSelectedYear(year)}
                              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                selectedYear === year
                                  ? 'bg-white text-blue-600 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              {year}
                            </button>
                          ))}
                        </div>

                        {/* Month Grid */}
                        <div className="grid grid-cols-3 gap-2">
                          {monthOptions.map((month) => (
                            <button
                              key={month.value}
                              onClick={() => setSelectedMonth(month.value)}
                              className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                                selectedMonth === month.value
                                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {month.label}
                            </button>
                          ))}
                        </div>

                        {/* Selected Period Display */}
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          Selected: {payPeriodStart} to {payPeriodEnd}
                        </div>
                      </div>
                    ) : (
                      /* Advanced Date Inputs */
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pay Period Start
                          </label>
                          <input
                            type="date"
                            value={payPeriodStart}
                            onChange={(e) => setPayPeriodStart(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pay Period End
                          </label>
                          <input
                            type="date"
                            value={payPeriodEnd}
                            onChange={(e) => setPayPeriodEnd(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Fields */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hours Worked
                      </label>
                      <input
                        type="number"
                        value={hoursWorked}
                        onChange={(e) => setHoursWorked(parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.5"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overtime Hours
                      </label>
                      <input
                        type="number"
                        value={overtimeHours}
                        onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.5"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bonuses (€)
                      </label>
                      <input
                        type="number"
                        value={bonuses}
                        onChange={(e) => setBonuses(parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Dry Run Option */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dryRun"
                      checked={isDryRun}
                      onChange={(e) => setIsDryRun(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="dryRun" className="ml-2 text-sm text-gray-700">
                      Dry Run (calculate only, don't save)
                    </label>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={calculatePayroll}
                      disabled={loading || selectedEmployees.length === 0}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      {loading ? 'Calculating...' : 'Calculate Payroll'}
                    </button>
                    
                    <button
                      onClick={processPayroll}
                      disabled={processing || selectedEmployees.length === 0}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {processing ? 'Processing...' : isDryRun ? 'Test Process' : 'Process Payroll'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Calculation Results */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Calculation Results</h3>
                
                {Object.keys(calculations).length > 0 ? (
                  <div className="space-y-6">
                    {/* Summary for multiple employees */}
                    {selectedEmployees.length > 1 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Batch Summary</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600">Total Employees</p>
                            <p className="text-lg font-bold text-gray-900">{selectedEmployees.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Gross</p>
                            <p className="text-lg font-bold text-green-600">
                              €{Object.values(calculations).reduce((sum, calc) => sum + calc.grossMonthlySalary, 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Net</p>
                            <p className="text-lg font-bold text-blue-600">
                              €{Object.values(calculations).reduce((sum, calc) => sum + calc.netMonthlySalary, 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Individual Results */}
                    <div className="space-y-4">
                      {selectedEmployees.map(employeeId => {
                        const calculation = calculations[employeeId];
                        const employee = employees.find(emp => emp.id === employeeId);
                        
                        if (!calculation || !employee) return null;
                        
                        return (
                          <div key={employeeId} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">
                                {employee.firstName} {employee.lastName}
                              </h4>
                              <span className="text-xs text-gray-500">#{employee.employeeNumber}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="bg-green-50 rounded p-3">
                                <p className="text-xs text-green-600">Gross Monthly</p>
                                <p className="text-lg font-bold text-green-900">
                                  €{calculation.grossMonthlySalary.toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded p-3">
                                <p className="text-xs text-blue-600">Net Monthly</p>
                                <p className="text-lg font-bold text-blue-900">
                                  €{calculation.netMonthlySalary.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="flex justify-between">
                                <span>Tax (after credits):</span>
                                <span>€{(calculation.incomeTaxAfterCredits / 12).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Employer costs:</span>
                                <span>€{(calculation.totalEmployerCosts / 12).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select employees and calculate payroll to see results here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payroll Records Tab */}
          {activeTab === 'records' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Payroll Records</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pay Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gross Pay
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Pay
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Processed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payrollRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {record.employee.firstName} {record.employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            #{record.employee.employeeNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.payPeriodStart).toLocaleDateString()} - {new Date(record.payPeriodEnd).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          €{record.grossPay.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          €{record.netPay.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.processedDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payrollRecords.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No payroll records</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Process payroll to see records here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Reports Coming Soon</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comprehensive payroll reports and analytics will be available here.
                </p>
              </div>
            </div>
          )}
        </div>
      </TrialGuard>
    </DashboardLayout>
  );
}

