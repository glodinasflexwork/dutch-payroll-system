'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { 
  Calculator, 
  Users, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Download,
  RefreshCw,
  Eye,
  Trash2,
  CheckSquare,
  Square,
  Filter,
  Calendar,
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
}

interface BatchResult {
  success: boolean;
  message: string;
  totalProcessed: number;
  totalErrors: number;
  results: Array<{
    employeeId: string;
    employeeName: string;
    status: 'success' | 'error' | 'skipped';
    error?: string;
  }>;
  summary: {
    totalGrossPay: number;
    totalNetPay: number;
    totalDeductions: number;
    totalEmployerCosts: number;
  };
}

interface ApprovalWorkflow {
  id: string;
  status: string;
  submittedAt: string;
  payrollRecord: {
    id: string;
    payPeriodStart: string;
    payPeriodEnd: string;
    grossPay: number;
    netPay: number;
    employee: {
      firstName: string;
      lastName: string;
      employeeNumber: string;
    };
  };
  submittedByUser: {
    name: string;
    email: string;
  };
  comments?: string;
  rejectionReason?: string;
}

export default function PayrollManagementPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('batch');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [payPeriodStart, setPayPeriodStart] = useState('');
  const [payPeriodEnd, setPayPeriodEnd] = useState('');
  const [processing, setProcessing] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [approvals, setApprovals] = useState<ApprovalWorkflow[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchEmployees();
      fetchApprovals();
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

  const fetchApprovals = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (payPeriodStart && payPeriodEnd) {
        params.append('payPeriodStart', payPeriodStart);
        params.append('payPeriodEnd', payPeriodEnd);
      }

      const response = await fetch(`/api/payroll/approval?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setApprovals(data.approvals || []);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  };

  const processBatchPayroll = async () => {
    if (!payPeriodStart || !payPeriodEnd) {
      alert('Please select a pay period');
      return;
    }

    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/payroll/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payPeriodStart,
          payPeriodEnd,
          employeeIds: selectedEmployees,
          dryRun
        }),
      });

      if (response.ok || response.status === 207) {
        const data = await response.json();
        setBatchResult(data);
        
        if (!dryRun && data.success) {
          // Refresh approvals after successful processing
          fetchApprovals();
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error processing batch payroll:', error);
      alert('Failed to process batch payroll. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprovalAction = async (approvalIds: string[], action: string, comments?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/payroll/approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payrollRecordIds: approvalIds,
          action,
          comments
        }),
      });

      if (response.ok || response.status === 207) {
        const data = await response.json();
        alert(data.message);
        fetchApprovals(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Failed to process approval. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAllEmployees = () => {
    const activeEmployeeIds = employees.filter(emp => emp.isActive).map(emp => emp.id);
    setSelectedEmployees(
      selectedEmployees.length === activeEmployeeIds.length ? [] : activeEmployeeIds
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'finalized': return 'text-blue-600 bg-blue-100';
      case 'paid': return 'text-purple-600 bg-purple-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'finalized': return <CheckSquare className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'batch', name: 'Batch Processing', icon: Users },
    { id: 'approvals', name: 'Approvals', icon: CheckCircle },
    { id: 'reports', name: 'Reports', icon: TrendingUp },
  ];

  return (
    <DashboardLayout>
      <TrialGuard feature="payroll management">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Batch process payroll and manage approval workflows
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

        {/* Batch Processing Tab */}
        {activeTab === 'batch' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Batch Configuration */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Batch Payroll Processing</h3>
              
              <div className="space-y-4">
                {/* Pay Period */}
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

                {/* Employee Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Employees
                    </label>
                    <button
                      onClick={selectAllEmployees}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {selectedEmployees.length === employees.filter(emp => emp.isActive).length 
                        ? 'Deselect All' : 'Select All Active'}
                    </button>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    {employees.map((employee) => (
                      <div
                        key={employee.id}
                        className={`flex items-center p-3 border-b border-gray-100 last:border-b-0 ${
                          !employee.isActive ? 'opacity-50' : ''
                        }`}
                      >
                        <button
                          onClick={() => toggleEmployeeSelection(employee.id)}
                          disabled={!employee.isActive}
                          className="mr-3"
                        >
                          {selectedEmployees.includes(employee.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            #{employee.employeeNumber} • {employee.position} • €{employee.salary.toLocaleString()}/month
                          </p>
                        </div>
                        {!employee.isActive && (
                          <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dryRun}
                      onChange={(e) => setDryRun(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Dry Run (calculate only, don't save)
                    </span>
                  </label>
                </div>

                {/* Process Button */}
                <button
                  onClick={processBatchPayroll}
                  disabled={processing || selectedEmployees.length === 0}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {dryRun ? 'Calculate Payroll' : 'Process Payroll'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Batch Results */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Results</h3>
              
              {batchResult ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className={`p-4 rounded-lg ${
                    batchResult.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex items-center">
                      {batchResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{batchResult.message}</p>
                        <p className="text-sm text-gray-600">
                          {batchResult.totalProcessed} successful, {batchResult.totalErrors} errors
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600">Total Gross Pay</p>
                      <p className="text-lg font-bold text-gray-900">
                        €{batchResult.summary.totalGrossPay.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600">Total Net Pay</p>
                      <p className="text-lg font-bold text-gray-900">
                        €{batchResult.summary.totalNetPay.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600">Total Deductions</p>
                      <p className="text-lg font-bold text-gray-900">
                        €{batchResult.summary.totalDeductions.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600">Employer Costs</p>
                      <p className="text-lg font-bold text-gray-900">
                        €{batchResult.summary.totalEmployerCosts.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Individual Results */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Individual Results</h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {batchResult.results.map((result, index) => (
                        <div
                          key={index}
                          className={`flex items-center p-3 rounded-lg border ${
                            result.status === 'success' 
                              ? 'bg-green-50 border-green-200' 
                              : result.status === 'error'
                              ? 'bg-red-50 border-red-200'
                              : 'bg-yellow-50 border-yellow-200'
                          }`}
                        >
                          {result.status === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          ) : result.status === 'error' ? (
                            <XCircle className="w-4 h-4 text-red-600 mr-2" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {result.employeeName}
                            </p>
                            {result.error && (
                              <p className="text-sm text-red-600">{result.error}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No results yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure and run batch processing to see results here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Filter
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="finalized">Finalized</option>
                  </select>
                </div>
                <button
                  onClick={fetchApprovals}
                  className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Approvals List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {approvals.length > 0 ? (
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
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {approvals.map((approval) => (
                        <tr key={approval.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {approval.payrollRecord.employee.firstName} {approval.payrollRecord.employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              #{approval.payrollRecord.employee.employeeNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(approval.payrollRecord.payPeriodStart).toLocaleDateString()} - {new Date(approval.payrollRecord.payPeriodEnd).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Gross: €{approval.payrollRecord.grossPay.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              Net: €{approval.payrollRecord.netPay.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(approval.status)}`}>
                              {getStatusIcon(approval.status)}
                              <span className="ml-1 capitalize">{approval.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{new Date(approval.submittedAt).toLocaleDateString()}</div>
                            <div className="text-xs">{approval.submittedByUser.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {approval.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprovalAction([approval.payrollRecord.id], 'approve')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Rejection reason:');
                                    if (reason) {
                                      handleApprovalAction([approval.payrollRecord.id], 'reject', reason);
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {approval.status === 'approved' && (
                              <button
                                onClick={() => handleApprovalAction([approval.payrollRecord.id], 'finalize')}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Finalize
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No approvals found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Process payroll to create approval workflows.
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

