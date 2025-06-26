'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Euro, 
  CreditCard, 
  Shield, 
  AlertTriangle,
  FileText,
  Clock,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { TrialGuard } from '@/components/trial/TrialGuard';

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;
  bsn: string;
  nationality: string;
  dateOfBirth: string;
  startDate: string;
  endDate?: string;
  probationEndDate?: string;
  position: string;
  department?: string;
  employmentType: string;
  contractType: string;
  workingHours: number;
  workingDays: number;
  salary: number;
  salaryType: string;
  hourlyRate?: number;
  taxTable: string;
  taxCredit: number;
  payrollTaxNumber?: string;
  holidayAllowance: number;
  holidayDays: number;
  pensionScheme?: string;
  bankAccount?: string;
  bankName?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  isActive: boolean;
  isDGA: boolean;
  createdAt: string;
  updatedAt: string;
  payrollRecords?: PayrollRecord[];
}

interface PayrollRecord {
  id: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossPay: number;
  netPay: number;
  processedDate: string;
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (session && params.id) {
      fetchEmployee();
    }
  }, [session, params.id]);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setEmployee(data.employee);
      } else {
        console.error('Failed to fetch employee');
        router.push('/employees');
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      router.push('/employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/employees/${params.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/employees');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Employee not found</h3>
        <p className="text-gray-500">The employee you're looking for doesn't exist.</p>
        <Link
          href="/employees"
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Employees
        </Link>
      </div>
    );
  }

  return (
    <TrialGuard feature="employee details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/employees"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Employees
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
                {employee.isDGA && (
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    DGA
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-500">
                Employee #{employee.employeeNumber} • {employee.position}
                {!employee.isActive && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inactive
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href={`/employees/${employee.id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Employee
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Employee Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-sm text-gray-900">{employee.firstName} {employee.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">BSN</label>
                <p className="text-sm text-gray-900">{employee.bsn}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-sm text-gray-900">
                  {new Date(employee.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nationality</label>
                <p className="text-sm text-gray-900">{employee.nationality}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Mail className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{employee.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-sm text-gray-900">{employee.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-sm text-gray-900">
                  {employee.address ? (
                    <>
                      {employee.address}<br />
                      {employee.postalCode} {employee.city}<br />
                      {employee.country}
                    </>
                  ) : (
                    'Not provided'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Briefcase className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Employment</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Position</label>
                <p className="text-sm text-gray-900">{employee.position}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Department</label>
                <p className="text-sm text-gray-900">{employee.department || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Start Date</label>
                <p className="text-sm text-gray-900">
                  {new Date(employee.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Employment Type</label>
                <p className="text-sm text-gray-900 capitalize">{employee.employmentType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contract & Salary Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contract Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Contract Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Contract Type</label>
                <p className="text-sm text-gray-900 capitalize">{employee.contractType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Working Hours</label>
                <p className="text-sm text-gray-900">{employee.workingHours} hours/week</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Working Days</label>
                <p className="text-sm text-gray-900">{employee.workingDays} days/week</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Holiday Days</label>
                <p className="text-sm text-gray-900">{employee.holidayDays} days/year</p>
              </div>
              {employee.probationEndDate && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Probation Period</label>
                  <p className="text-sm text-gray-900">
                    Until {new Date(employee.probationEndDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Salary & Tax Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Euro className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Salary & Tax</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Salary</label>
                <p className="text-sm text-gray-900">
                  €{employee.salary.toLocaleString()}/{employee.salaryType}
                </p>
              </div>
              {employee.hourlyRate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Hourly Rate</label>
                  <p className="text-sm text-gray-900">€{employee.hourlyRate}/hour</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Tax Table</label>
                <p className="text-sm text-gray-900 uppercase">{employee.taxTable}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tax Credit</label>
                <p className="text-sm text-gray-900">€{employee.taxCredit}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Holiday Allowance</label>
                <p className="text-sm text-gray-900">{employee.holidayAllowance}%</p>
              </div>
              {employee.pensionScheme && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Pension Scheme</label>
                  <p className="text-sm text-gray-900">{employee.pensionScheme}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Banking & Emergency Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Banking Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Banking Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Bank Account (IBAN)</label>
                <p className="text-sm text-gray-900">{employee.bankAccount || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Bank Name</label>
                <p className="text-sm text-gray-900">{employee.bankName || 'Not provided'}</p>
              </div>
              {employee.payrollTaxNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Payroll Tax Number</label>
                  <p className="text-sm text-gray-900">{employee.payrollTaxNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Name</label>
                <p className="text-sm text-gray-900">{employee.emergencyContact || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-sm text-gray-900">{employee.emergencyPhone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Relationship</label>
                <p className="text-sm text-gray-900">{employee.emergencyRelation || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Payroll Records */}
        {employee.payrollRecords && employee.payrollRecords.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Recent Payroll Records</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      Processed Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employee.payrollRecords.map((record) => (
                    <tr key={record.id}>
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
            </div>
          </div>
        )}

        {/* System Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">System Information</h4>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Created:</span> {new Date(employee.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {new Date(employee.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </TrialGuard>
  );
}

