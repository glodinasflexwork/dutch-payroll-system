import { UnifiedNavigation } from "@/components/layout/unified-navigation";
import { UnifiedFooter } from "@/components/layout/unified-footer";
import { Plug, Settings, Database, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

export default function IntegrationsPage() {
  return (
    <>
      <UnifiedNavigation />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-purple-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">Seamless Integrations for Your Business Ecosystem</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              SalarySync connects effortlessly with your existing HR, accounting, and business software, creating a unified and efficient workflow.
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Integrate with Your Favorite Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Settings className="w-12 h-12 text-purple-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">HR Information Systems (HRIS)</h3>
                <p className="text-gray-600">Synchronize employee data, onboarding information, and leave management with leading HR platforms.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Database className="w-12 h-12 text-purple-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Accounting Software</h3>
                <p className="text-gray-600">Automate journal entries and financial reporting by integrating with popular accounting solutions like Exact and Twinfield.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Clock className="w-12 h-12 text-purple-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Time & Attendance Systems</h3>
                <p className="text-gray-600">Import hours directly from your time tracking system, ensuring accurate and timely payroll processing.</p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Developer-Friendly API</h2>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Plug className="w-12 h-12 text-purple-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Build Custom Integrations</h3>
              <p className="text-gray-600 mb-4">Our robust API allows developers to create custom connections and extend SalarySync's functionality to meet unique business requirements.</p>
              <Link href="/api" className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center">
                Explore Our API Documentation <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </section>

          <section className="text-center bg-purple-50 p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-purple-800 mb-6">Don't See Your Integration?</h2>
            <p className="text-lg text-purple-700 mb-8">We are constantly expanding our integration partners. Contact us to discuss your specific needs.</p>
            <a href="/contact" className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors">
              Suggest an Integration
            </a>
          </section>
        </main>
      </div>
      <UnifiedFooter />
    </>
  );
}


