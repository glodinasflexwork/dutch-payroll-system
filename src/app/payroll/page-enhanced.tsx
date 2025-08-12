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
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react';
import { TrialGuard } from '@/components/trial/TrialGuard';
import { useToast } from '@/components/ui/toast';

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

interface BatchResult {
  employee: {
    id: string;
    name: string;
    employeeNumber: string;
  };
  status: string;
  calculation?: PayrollCalculation;
  payrollRecord?: any;
  error?: string;
}

export default function PayrollPage() {
  const { data: session } = useSession();
  const toast = useToast();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [company, setCompany] = useState<{ createdAt: string, name?: string } | null>(null);
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
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
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
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
    
    // Create proper month boundaries without timezone issues
    const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate().toString().padStart(2, '0')}`;
    
    setPayPeriodStart(firstDay);
    setPayPeriodEnd(lastDay);
  }, []);

  // Update pay period dates when month/year selection changes
  useEffect(() => {
    if (!useAdvancedDates) {
      // Create proper month boundaries without timezone issues
      const firstDay = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
      const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0).getDate(); // Get last day of the month
      const lastDay = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${lastDayOfMonth.toString().padStart(2, '0')}`;
      
      setPayPeriodStart(firstDay);
      setPayPeriodEnd(lastDay);
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
    toast.info('All employees selected', `Selected ${employees.length} employees for payroll processing`);
  };

  const deselectAllEmployees = () => {
    setSelectedEmployees([]);
    toast.info('Selection cleared', 'All employees deselected');
  };

  const fetchEmployees = async () => {
    try {
      console.log('=== FETCHING EMPLOYEES ===');
      const response = await fetch('/api/employees');
      console.log('Employees response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Employees data:', data);
        setEmployees(data.employees || []);
      } else {
        const errorData = await response.json();
        console.error('Error fetching employees:', errorData);
        toast.error('Failed to load employees', errorData.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees', error instanceof Error ? error.message : 'Network error occurred');
    }
  };

  const fetchCompany = async () => {
    try {
      console.log('=== FETCHING COMPANY ===');
      const response = await fetch('/api/company');
      console.log('Company response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Company data:', data);
        setCompany(data.company);
      } else {
        const errorData = await response.json();
        console.error('Error fetching company:', errorData);
        toast.error('Failed to load company data', errorData.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error fetching company:', error);
      toast.error('Failed to load company data', error instanceof Error ? error.message : 'Network error occurred');
    }
  };

  const fetchPayrollRecords = async () => {
    try {
      console.log('=== FETCHING PAYROLL RECORDS ===');
      const response = await fetch('/api/payroll');
      console.log('Payroll records response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Payroll records data:', data);
        setPayrollRecords(data.payrollRecords || []);
      } else {
        const errorData = await response.json();
        console.error('Error fetching payroll records:', errorData);
        toast.error('Failed to load payroll records', errorData.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error fetching payroll records:', error);
      toast.error('Failed to load payroll records', error instanceof Error ? error.message : 'Network error occurred');
    }
  };

  const calculatePayroll = async () => {
    if (selectedEmployees.length === 0 || !payPeriodStart || !payPeriodEnd) {
      toast.error('Missing information', 'Please select at least one employee and pay period');
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading('Calculating payroll', `Processing ${selectedEmployees.length} employee(s)...`);
    
    try {
      console.log('=== CALCULATING PAYROLL ===');
      console.log('Selected employees:', selectedEmployees);
      console.log('Pay period:', payPeriodStart, 'to', payPeriodEnd);
      
      const newCalculations: {[key: string]: PayrollCalculation} = {};
      let successCount = 0;
      let errorCount = 0;
      
      for (const employeeId of selectedEmployees) {
        console.log(`Calculating for employee: ${employeeId}`);
        
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
        
        console.log(`Response status for ${employeeId}:`, response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Calculation result for ${employeeId}:`, data);
          newCalculations[employeeId] = data.calculation;
          if (selectedEmployees.length === 1) {
            setBreakdown(data.breakdown);
          }
          successCount++;
        } else {
          const errorData = await response.json();
          console.error(`Error calculating for employee ${employeeId}:`, errorData);
          errorCount++;
        }
      }
      
      setCalculations(newCalculations);
      console.log('All calculations completed:', newCalculations);
      
      // Remove loading toast and show success
      toast.removeToast(loadingToastId);
      
      if (errorCount === 0) {
        toast.success('Payroll calculated successfully', 
          `Calculated payroll for ${successCount} employee(s)`);
      } else {
        toast.error('Some calculations failed', 
          `${successCount} successful, ${errorCount} failed`);
      }
      
    } catch (error) {
      console.error('Error calculating payroll:', error);
      toast.removeToast(loadingToastId);
      toast.error('Calculation failed', error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const processPayroll = async () => {
    if (selectedEmployees.length === 0 || !payPeriodStart || !payPeriodEnd) {
      toast.error('Missing information', 'Please select at least one employee and pay period');
      return;
    }

    setProcessing(true);
    const loadingToastId = toast.loading(
      isDryRun ? 'Testing payroll processing' : 'Processing payroll', 
      `${isDryRun ? 'Testing' : 'Processing'} ${selectedEmployees.length} employee(s)...`
    );
    
    try {
      console.log('=== PROCESSING PAYROLL ===');
      console.log('Selected employees:', selectedEmployees);
      console.log('Pay period:', payPeriodStart, 'to', payPeriodEnd);
      console.log('Dry run:', isDryRun);
      
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

      console.log('Batch processing response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Batch processing result:', data);
        
        // Safely handle the response
        const results = data.results || [];
        const errors = data.errors || [];
        const summary = data.summary || {};
        
        setBatchResults(results);
        
        // Remove loading toast
        toast.removeToast(loadingToastId);
        
        if (!isDryRun) {
          if (errors.length === 0) {
            toast.success('Payroll processed successfully!', 
              `Successfully processed ${results.length} employee(s)`);
          } else {
            toast.error('Some employees had errors', 
              `${results.length - errors.length} successful, ${errors.length} failed`);
          }
          // Refresh payroll records
          await fetchPayrollRecords();
        } else {
          toast.success('Dry run completed', 
            `Calculated payroll for ${results.length} employee(s) (not saved)`);
        }
        
        // Show individual errors if any
        if (errors.length > 0) {
          errors.forEach((err: any) => {
            toast.error(`Error for ${err.employee?.name || 'Unknown'}`, err.error);
          });
        }
        
      } else {
        const errorData = await response.json();
        console.error('Batch processing error:', errorData);
        toast.removeToast(loadingToastId);
        toast.error('Processing failed', errorData.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error processing payroll:', error);
      toast.removeToast(loadingToastId);
      toast.error('Processing failed', error instanceof Error ? error.message : 'Network error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const tabs = [
    { id: 'calculate', name: 'Calculate Payroll', icon: Calculator },
    { id: 'records', name: 'Payroll Records', icon: FileText },
  ];

  // Calculate overview statistics
  const totalGrossThisMonth = payrollRecords
    .filter(record => {
      const recordDate = new Date(record.payPeriodStart);
      const currentDate = new Date();
      return recordDate.getMonth() === currentDate.getMonth() && 
             recordDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, record) => sum + record.grossPay, 0);

  const totalNetThisMonth = payrollRecords
    .filter(record => {
      const recordDate = new Date(record.payPeriodStart);
      const currentDate = new Date();
      return recordDate.getMonth() === currentDate.getMonth() && 
             recordDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, record) => sum + record.netPay, 0);

  const processedThisMonth = payrollRecords.filter(record => {
    const recordDate = new Date(record.payPeriodStart);
    const currentDate = new Date();
    return recordDate.getMonth() === currentDate.getMonth() && 
           recordDate.getFullYear() === currentDate.getFullYear();
  }).length;

  return (
    <DashboardLayout>
      <TrialGuard feature="payroll processing">
        <div className="space-y-6">
          {/* Enhanced Header with Gradient */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <Calculator className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Payroll Processing 💰</h1>
                  <p className="text-green-100 mt-1">
                    Calculate and process Dutch payroll with accurate tax calculations
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                      {company?.name || 'Loading...'}
                    </span>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                      {employees.length} Employees
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                  <div className="text-2xl font-bold">€{totalGrossThisMonth.toLocaleString()}</div>
                  <div className="text-sm text-green-100">Total Gross This Month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Gross Pay</p>
                  <p className="text-2xl font-bold text-blue-600">€{totalGrossThisMonth.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Net Pay</p>
                  <p className="text-2xl font-bold text-green-600">€{totalNetThisMonth.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Euro className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processed Records</p>
                  <p className="text-2xl font-bold text-purple-600">{processedThisMonth}</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Employees</p>
                  <p className="text-2xl font-bold text-orange-500">{employees.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Ready for payroll</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600 bg-green-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center rounded-t-lg transition-all`}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Calculate Payroll Tab */}
            {activeTab === 'calculate' && (
              <div className="p-6">
                {employees.length === 0 ? (
                  /* Getting Started Guide */
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8 border border-blue-200">
                    <div className="text-center">
                      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Process Payroll?</h3>
                      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        Add employees to your system to start processing payroll with accurate Dutch tax calculations, 
                        social security contributions, and compliance reporting.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-900">Quick Setup</h4>
                          <p className="text-sm text-gray-600">Add employee details and start processing immediately</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-900">Dutch Compliance</h4>
                          <p className="text-sm text-gray-600">Automatic tax calculations and regulatory compliance</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <BarChart3 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-900">Detailed Reports</h4>
                          <p className="text-sm text-gray-600">Comprehensive payroll reports and analytics</p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.location.href = '/dashboard/employees'}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Add Your First Employee
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Enhanced Payroll Calculation Form */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg p-6 border border-gray-200">
                      <div className="flex items-center mb-6">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <Calculator className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Payroll Calculation</h3>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Enhanced Employee Selection */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Select Employees
                            </label>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={selectAllEmployees}
                                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                              >
                                Select All
                              </button>
                              <button
                                type="button"
                                onClick={deselectAllEmployees}
                                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                Clear All
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-3 max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-4">
                            {employees.map((employee) => (
                              <label key={employee.id} className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedEmployees.includes(employee.id)}
                                  onChange={() => toggleEmployeeSelection(employee.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <div className="ml-3 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">
                                      {employee.firstName} {employee.lastName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {employee.employeeNumber}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {employee.position} • €{employee.salary.toLocaleString()}/year
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                          
                          {selectedEmployees.length > 0 && (
                            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-lg">
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                              {selectedEmployees.length} employee(s) selected for processing
                            </div>
                          )}
                        </div>
                        
                        {/* Enhanced Pay Period Selection */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Pay Period
                            </h4>
                            <button
                              type="button"
                              onClick={() => setUseAdvancedDates(!useAdvancedDates)}
                              className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                            >
                              {useAdvancedDates ? 'Use Month Selector' : 'Advanced Dates'}
                            </button>
                          </div>

                          {!useAdvancedDates ? (
                            /* Enhanced Visual Month/Year Selector */
                            <div className="space-y-4">
                              {/* Year Tabs */}
                              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                                {getYearOptions().map((year) => (
                                  <button
                                    key={year}
                                    onClick={() => setSelectedYear(year)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                      selectedYear === year
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                  >
                                    {year}
                                  </button>
                                ))}
                              </div>

                              {/* Enhanced Month Grid */}
                              <div className="grid grid-cols-3 gap-2">
                                {monthOptions.map((month) => (
                                  <button
                                    key={month.value}
                                    onClick={() => setSelectedMonth(month.value)}
                                    className={`p-3 text-sm font-medium rounded-lg border transition-all hover:shadow-md ${
                                      selectedMonth === month.value
                                        ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white border-blue-300 shadow-md'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    {month.label}
                                  </button>
                                ))}
                              </div>

                              {/* Enhanced Selected Period Display */}
                              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg border border-blue-200">
                                <div className="text-sm font-medium text-gray-900">Selected Period:</div>
                                <div className="text-sm text-blue-600">{payPeriodStart} to {payPeriodEnd}</div>
                              </div>
                            </div>
                          ) : (
                            /* Enhanced Advanced Date Inputs */
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Pay Period Start
                                </label>
                                <input
                                  type="date"
                                  value={payPeriodStart}
                                  onChange={(e) => setPayPeriodStart(e.target.value)}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Additional Fields */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Clock className="w-4 h-4 inline mr-1" />
                              Hours Worked
                            </label>
                            <input
                              type="number"
                              value={hoursWorked}
                              onChange={(e) => setHoursWorked(parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.5"
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <TrendingUp className="w-4 h-4 inline mr-1" />
                              Overtime Hours
                            </label>
                            <input
                              type="number"
                              value={overtimeHours}
                              onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.5"
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Euro className="w-4 h-4 inline mr-1" />
                              Bonuses (€)
                            </label>
                            <input
                              type="number"
                              value={bonuses}
                              onChange={(e) => setBonuses(parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        {/* Enhanced Dry Run Option */}
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="dryRun"
                              checked={isDryRun}
                              onChange={(e) => setIsDryRun(e.target.checked)}
                              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                            />
                            <label htmlFor="dryRun" className="ml-2 text-sm text-gray-700 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1 text-yellow-600" />
                              Dry Run (calculate only, don't save)
                            </label>
                          </div>
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="flex space-x-3">
                          <button
                            onClick={calculatePayroll}
                            disabled={loading || employees.length === 0 || selectedEmployees.length === 0}
                            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
                          >
                            <Calculator className="w-5 h-5 mr-2" />
                            {loading ? 'Calculating...' : 'Calculate Payroll'}
                          </button>
                          
                          <button
                            onClick={processPayroll}
                            disabled={processing || employees.length === 0 || selectedEmployees.length === 0}
                            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
                          >
                            <Play className="w-5 h-5 mr-2" />
                            {processing ? 'Processing...' : isDryRun ? 'Test Process' : 'Process Payroll'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Calculation Results */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg p-6 border border-gray-200">
                      <div className="flex items-center mb-6">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <BarChart3 className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Calculation Results</h3>
                      </div>
                      
                      {/* Show batch results if available */}
                      {batchResults.length > 0 ? (
                        <div className="space-y-6">
                          {/* Enhanced Batch Summary */}
                          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                              Batch Processing Results
                            </h4>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-600">Total Processed</p>
                                <p className="text-2xl font-bold text-gray-900">{batchResults.length}</p>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-600">Total Gross</p>
                                <p className="text-2xl font-bold text-green-600">
                                  €{batchResults.reduce((sum, result) => 
                                    sum + (result.calculation?.grossMonthlySalary || 0), 0
                                  ).toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-600">Total Net</p>
                                <p className="text-2xl font-bold text-blue-600">
                                  €{batchResults.reduce((sum, result) => 
                                    sum + (result.calculation?.netMonthlySalary || 0), 0
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Individual Results */}
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {batchResults.map((result, index) => {
                              const calculation = result.calculation;
                              
                              if (!calculation) {
                                return (
                                  <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-medium text-red-900">
                                        {result.employee?.name || 'Unknown Employee'}
                                      </h4>
                                      <span className="text-xs text-red-500">#{result.employee?.employeeNumber || 'N/A'}</span>
                                    </div>
                                    <p className="text-sm text-red-700 flex items-center">
                                      <AlertCircle className="w-4 h-4 mr-2" />
                                      Error: {result.error || 'Calculation failed'}
                                    </p>
                                  </div>
                                );
                              }
                              
                              return (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-gray-900">
                                      {result.employee?.name || 'Unknown Employee'}
                                    </h4>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-500">#{result.employee?.employeeNumber || 'N/A'}</span>
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        result.status === 'created' ? 'bg-green-100 text-green-800' :
                                        result.status === 'updated' ? 'bg-blue-100 text-blue-800' :
                                        result.status === 'calculated' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {result.status}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                      <p className="text-xs text-green-600 font-medium">Gross Monthly</p>
                                      <p className="text-lg font-bold text-green-900">
                                        €{calculation.grossMonthlySalary.toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                      <p className="text-xs text-blue-600 font-medium">Net Monthly</p>
                                      <p className="text-lg font-bold text-blue-900">
                                        €{calculation.netMonthlySalary.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between">
                                      <span>Tax (after credits):</span>
                                      <span className="font-medium">€{(calculation.incomeTaxAfterCredits / 12).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Employer costs:</span>
                                      <span className="font-medium">€{(calculation.totalEmployerCosts / 12).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        /* Enhanced Empty State */
                        <div className="text-center py-12">
                          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">No calculations yet</h4>
                          <p className="text-gray-600 mb-4">
                            Select employees and calculate payroll to see results here.
                          </p>
                          <div className="text-sm text-gray-500">
                            Results will show gross pay, net pay, tax calculations, and employer costs
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payroll Records Tab */}
            {activeTab === 'records' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <FileText className="w-6 h-6 mr-2 text-blue-600" />
                    Payroll Records
                  </h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                  </button>
                </div>

                {payrollRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No payroll records yet</h4>
                    <p className="text-gray-600">
                      Process your first payroll to see records here.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
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
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {record.employee.firstName} {record.employee.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {record.employee.employeeNumber}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(record.payPeriodStart).toLocaleDateString()} - {new Date(record.payPeriodEnd).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              €{record.grossPay.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
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
                )}
              </div>
            )}
          </div>
        </div>
      </TrialGuard>
    </DashboardLayout>
  );
}

