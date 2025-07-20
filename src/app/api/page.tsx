import { Code, Zap, Shield, BarChart, Database, Users, CheckCircle, ArrowRight } from 'lucide-react';

export default function ApiPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Powerful API for Developers</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Build custom integrations and applications with our comprehensive REST API. Access payroll data, automate workflows, and create seamless experiences for your users.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Why Choose Our API?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Zap className="w-12 h-12 text-purple-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Fast & Reliable</h3>
              <p className="text-gray-600">99.9% uptime SLA with sub-200ms response times. Built on modern infrastructure to handle enterprise-scale workloads.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Secure by Design</h3>
              <p className="text-gray-600">OAuth 2.0 authentication, rate limiting, and comprehensive audit logging ensure your integrations are secure and compliant.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Code className="w-12 h-12 text-purple-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Developer Friendly</h3>
              <p className="text-gray-600">Comprehensive documentation, SDKs in multiple languages, and interactive API explorer to get you started quickly.</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">API Capabilities</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <Database className="w-10 h-10 text-green-600 mr-4" />
                <h3 className="text-3xl font-semibold text-gray-800">Employee Data Management</h3>
              </div>
              <p className="text-gray-600 mb-6">Complete CRUD operations for employee records, including personal information, employment details, and compensation data.</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Employee Onboarding & Offboarding</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Salary & Benefits Management</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Time & Attendance Tracking</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Leave Management</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <BarChart className="w-10 h-10 text-blue-600 mr-4" />
                <h3 className="text-3xl font-semibold text-gray-800">Payroll Processing</h3>
              </div>
              <p className="text-gray-600 mb-6">Automate payroll calculations, tax withholdings, and payment processing through our comprehensive payroll API endpoints.</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Payroll Run Management</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Tax Calculations & Filings</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Payment Processing</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Payslip Generation</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Common Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">HR System Integration</h3>
              <p className="text-gray-600 mb-4">Sync employee data between your HRIS and payroll system to eliminate manual data entry and ensure consistency.</p>
              <div className="flex items-center text-blue-600 font-medium">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Financial Reporting</h3>
              <p className="text-gray-600 mb-4">Extract payroll data for financial analysis, budgeting, and compliance reporting across multiple business units.</p>
              <div className="flex items-center text-green-600 font-medium">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Benefits Administration</h3>
              <p className="text-gray-600 mb-4">Automate benefit deductions and enrollment processes by connecting benefits providers with payroll data.</p>
              <div className="flex items-center text-purple-600 font-medium">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Custom Applications</h3>
              <p className="text-gray-600 mb-4">Build custom employee portals, mobile apps, or business intelligence dashboards using our comprehensive API.</p>
              <div className="flex items-center text-orange-600 font-medium">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>
        </section>

        <section className="text-center bg-gradient-to-r from-purple-100 to-blue-100 p-12 rounded-lg">
          <Code className="w-16 h-16 text-purple-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-purple-800 mb-6">Ready to Start Building?</h2>
          <p className="text-lg text-purple-700 mb-8">Access our comprehensive API documentation, interactive explorer, and developer resources to get started with your integration.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/documentation" className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors">
              View Documentation
            </a>
            <a href="/contact" className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors">
              Contact API Team
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

