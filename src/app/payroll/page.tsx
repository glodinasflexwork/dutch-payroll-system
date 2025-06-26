'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  employeeNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  department?: string;
  salary: number;
  isActive: boolean;
  isDGA: boolean;
}

interface PayrollCalculation {
  grossAnnualSalary: number;
  grossMonthlySalary: number;
  netMonthlySalary: number;
  netAnnualSalary: number;
  incomeTaxAfterCredits: number;
  totalTaxCredits: number;
  holidayAllowanceGross: number;
  holidayAllowanceNet: number;
  totalEmployerCosts: number;
  taxBracketBreakdown: Array<{
    bracket: number;
    incomeInBracket: number;
    rate: number;
    taxAmount: number;
    description: string;
  }>;
}

interface PayrollRecord {
  id: string;
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
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [payPeriodStart, setPayPeriodStart] = useState('');
  const [payPeriodEnd, setPayPeriodEnd] = useState('');
  const [hoursWorked, setHoursWorked] = useState<number>(0);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [bonuses, setBonuses] = useState<number>(0);
  const [calculation, setCalculation] = useState<PayrollCalculation | null>(null);
  const [breakdown, setBreakdown] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('calculate');

  useEffect(() => {
    if (session) {
      fetchEmployees();
      fetchPayrollRecords();
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
    if (!selectedEmployee || !payPeriodStart || !payPeriodEnd) {
      alert('Please select an employee and pay period');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          payPeriodStart,
          payPeriodEnd
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCalculation(data.calculation);
        setBreakdown(data.breakdown);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error calculating payroll:', error);
      alert('Failed to calculate payroll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processPayroll = async () => {
    if (!selectedEmployee || !payPeriodStart || !payPeriodEnd) {
      alert('Please select an employee and pay period');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/payroll', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          payPeriodStart,
          payPeriodEnd,
          hoursWorked,
          overtimeHours,
          bonuses
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Payroll processed successfully!');
        fetchPayrollRecords(); // Refresh the records
        setCalculation(null); // Clear calculation
        setBreakdown('');
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

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  const tabs = [
    { id: 'calculate', name: 'Calculate Payroll', icon: Calculator },
    { id: 'records', name: 'Payroll Records', icon: FileText },
    { id: 'reports', name: 'Reports', icon: TrendingUp },
  ];

  return (
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
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
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
            {/* Input Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payroll Calculation</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Employee
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose an employee...</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName} (#{employee.employeeNumber})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEmployeeData && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">Employee Details</h4>
                    <div className="mt-2 text-sm text-gray-600">
                      <p><strong>Position:</strong> {selectedEmployeeData.position}</p>
                      <p><strong>Department:</strong> {selectedEmployeeData.department || 'Not assigned'}</p>
                      <p><strong>Monthly Salary:</strong> €{selectedEmployeeData.salary.toLocaleString()}</p>
                      {selectedEmployeeData.isDGA && (
                        <p><strong>Status:</strong> <span className="text-purple-600">DGA</span></p>
                      )}
                    </div>
                  </div>
                )}

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

                <div className="flex space-x-3">
                  <button
                    onClick={calculatePayroll}
                    disabled={loading || !selectedEmployee}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    {loading ? 'Calculating...' : 'Calculate Payroll'}
                  </button>
                  
                  {calculation && (
                    <button
                      onClick={processPayroll}
                      disabled={processing}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {processing ? 'Processing...' : 'Process Payroll'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Calculation Results */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Calculation Results</h3>
              
              {calculation ? (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Euro className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-green-600">Gross Monthly</p>
                          <p className="text-lg font-bold text-green-900">
                            €{calculation.grossMonthlySalary.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-blue-600">Net Monthly</p>
                          <p className="text-lg font-bold text-blue-900">
                            €{calculation.netMonthlySalary.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tax Breakdown */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tax Breakdown</h4>
                    <div className="space-y-2">
                      {calculation.taxBracketBreakdown.map((bracket, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            Band {bracket.bracket}: €{bracket.incomeInBracket.toLocaleString()} × {(bracket.rate * 100).toFixed(2)}%
                          </span>
                          <span className="font-medium">€{bracket.taxAmount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between items-center font-medium">
                        <span>Total Tax (after credits)</span>
                        <span>€{(calculation.incomeTaxAfterCredits / 12).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Tax Credits</p>
                      <p className="font-medium">€{(calculation.totalTaxCredits / 12).toLocaleString()}/month</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Holiday Allowance</p>
                      <p className="font-medium">€{(calculation.holidayAllowanceGross / 12).toLocaleString()}/month</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Employer Costs</p>
                      <p className="font-medium">€{(calculation.totalEmployerCosts / 12).toLocaleString()}/month</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Annual Net</p>
                      <p className="font-medium">€{calculation.netAnnualSalary.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  {breakdown && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Detailed Breakdown</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                          {breakdown}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No calculation yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select an employee and calculate payroll to see results here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payroll Records Tab */}
        {activeTab === 'records' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Payroll Records</h3>
            </div>
            
            {payrollRecords.length > 0 ? (
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
                        Deductions
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
                          €{record.totalDeductions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          €{record.netPay.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.processedDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No payroll records</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Process your first payroll to see records here.
                </p>
              </div>
            )}
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
  );
}

