import { CheckCircle, Zap, Layers, BarChart2, Shield, Users, DollarSign } from 'lucide-react';

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Seamless Integrations for a Connected Payroll</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Connect SalarySync with your essential business tools to automate workflows, eliminate manual data entry, and ensure accuracy across your entire HR and finance ecosystem.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Why Integrate Your Payroll?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Automate Workflows</h3>
              <p className="text-gray-600">Eliminate repetitive tasks and manual data transfers between systems, freeing up valuable time for your team.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Layers className="w-12 h-12 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Enhance Data Accuracy</h3>
              <p className="text-gray-600">Reduce errors and discrepancies by ensuring consistent and synchronized data across all integrated platforms.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <BarChart2 className="w-12 h-12 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Gain Deeper Insights</h3>
              <p className="text-gray-600">Centralize your data to generate comprehensive reports and analytics, providing a holistic view of your workforce and finances.</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Key Integration Categories</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <Users className="w-10 h-10 text-green-600 mr-4" />
                <h3 className="text-3xl font-semibold text-gray-800">HR & HRIS Systems</h3>
              </div>
              <p className="text-gray-600 mb-6">Seamlessly connect with leading Human Resources Information Systems (HRIS) to synchronize employee data, onboarding information, and time-off requests. This ensures that your payroll is always up-to-date with the latest employee records, reducing manual updates and potential errors.</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Employee Onboarding & Offboarding</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Time & Attendance Tracking</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Leave Management</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Benefits Administration</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <DollarSign className="w-10 h-10 text-purple-600 mr-4" />
                <h3 className="text-3xl font-semibold text-gray-800">Accounting Software</h3>
              </div>
              <p className="text-gray-600 mb-6">Integrate SalarySync with your preferred accounting software to automate journal entries, reconcile payroll expenses, and maintain accurate financial records. This eliminates the need for manual data export and import, ensuring your books are always balanced and compliant.</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Automated Journal Entries</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Expense Management</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Financial Reporting</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Tax Filing & Compliance</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="text-center bg-blue-50 p-12 rounded-lg">
          <h2 className="text-3xl font-bold text-blue-800 mb-6">Don't see your favorite tool?</h2>
          <p className="text-lg text-blue-700 mb-8">We are continuously expanding our integration capabilities. Contact our sales team to discuss your specific integration needs.</p>
          <a href="/contact" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
            Contact Sales
          </a>
        </section>
      </main>
    </div>
  );
}


