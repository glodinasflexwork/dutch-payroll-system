import { CheckCircle, DollarSign, Users, Clock, FileText, Shield, BarChart2, Zap } from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Comprehensive Payroll Features for Dutch Businesses</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            SalarySync offers a robust suite of features designed to simplify complex Dutch payroll processes, ensure compliance, and empower your business with efficiency and accuracy.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Core Payroll Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <DollarSign className="w-12 h-12 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Automated Salary Calculation</h3>
              <p className="text-gray-600">Accurate calculation of gross-to-net salaries, including all Dutch tax and social security contributions.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Payslip Generation</h3>
              <p className="text-gray-600">Generate compliant Dutch payslips (loonstrook) automatically, accessible to employees via a secure portal.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Tax & Social Security Filing</h3>
              <p className="text-gray-600">Automated submission of payroll taxes and social security contributions to the Dutch tax authorities (Belastingdienst).</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Advanced Features for Efficiency</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <Users className="w-10 h-10 text-green-600 mr-4" />
                <h3 className="text-3xl font-semibold text-gray-800">Employee Self-Service Portal</h3>
              </div>
              <p className="text-gray-600 mb-6">Empower your employees with 24/7 access to their payslips, annual statements, personal data, and leave requests, reducing HR queries.</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> View & Download Payslips</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Update Personal Information</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Submit Leave Requests</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Access Annual Statements (Jaaropgaaf)</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <Zap className="w-10 h-10 text-purple-600 mr-4" />
                <h3 className="text-3xl font-semibold text-gray-800">Seamless Integrations</h3>
              </div>
              <p className="text-gray-600 mb-6">Connect SalarySync with your existing HR, accounting, and time-tracking systems for a unified and automated workflow, eliminating data silos.</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> HRIS & HR Management Systems</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Accounting Software (e.g., Exact, Twinfield)</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Time & Attendance Solutions</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Expense Management Platforms</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Compliance & Reporting</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <FileText className="w-12 h-12 text-orange-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Dutch Labor Law Compliance</h3>
              <p className="text-gray-600">Stay up-to-date with ever-changing Dutch labor laws and collective labor agreements (CAO), ensuring your payroll is always compliant.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <BarChart2 className="w-12 h-12 text-orange-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Comprehensive Reporting</h3>
              <p className="text-gray-600">Generate detailed payroll reports for financial analysis, budgeting, and internal audits, providing valuable insights into your workforce costs.</p>
            </div>
          </div>
        </section>

        <section className="text-center bg-blue-50 p-12 rounded-lg">
          <h2 className="text-3xl font-bold text-blue-800 mb-6">Ready to Streamline Your Payroll?</h2>
          <p className="text-lg text-blue-700 mb-8">Discover how SalarySync can transform your payroll operations. Contact us for a personalized demo.</p>
          <a href="/contact" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
            Request a Demo
          </a>
        </section>
      </main>
    </div>
  );
}


