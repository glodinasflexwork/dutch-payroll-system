import { UnifiedNavigation } from "@/components/layout/unified-navigation";
import { UnifiedFooter } from "@/components/layout/unified-footer";
import { Code, Database, Zap, ArrowRight, Terminal, Book } from 'lucide-react';
import Link from 'next/link';

export default function APIPage() {
  return (
    <>
      <UnifiedNavigation />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gray-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">Powerful API for Seamless Integration</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Build custom integrations and automate your payroll workflows with our comprehensive REST API. Designed for developers, built for business.
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">API Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Code className="w-12 h-12 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">RESTful API</h3>
                <p className="text-gray-600">Clean, intuitive REST endpoints with JSON responses for easy integration with any programming language.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Database className="w-12 h-12 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Real-time Data Access</h3>
                <p className="text-gray-600">Access employee data, payroll information, and reports in real-time to keep your systems synchronized.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Zap className="w-12 h-12 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Webhook Support</h3>
                <p className="text-gray-600">Receive instant notifications when payroll events occur, enabling real-time automation and workflows.</p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Getting Started</h2>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <Terminal className="w-10 h-10 text-blue-600 mr-4" />
                <h3 className="text-3xl font-semibold text-gray-800">Quick Start Guide</h3>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg mb-6">
                <code className="text-sm text-gray-800">
                  curl -X GET "https://api.salarysync.nl/v1/employees" \<br />
                  &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY" \<br />
                  &nbsp;&nbsp;-H "Content-Type: application/json"
                </code>
              </div>
              <p className="text-gray-600 mb-4">
                Our API uses standard HTTP methods and returns JSON responses. Authentication is handled via API keys that you can generate from your dashboard.
              </p>
              <Link href="/integrations" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
                View Integration Examples <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </section>

          <section className="text-center bg-gray-100 p-12 rounded-lg">
            <Book className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Comprehensive Documentation</h2>
            <p className="text-lg text-gray-700 mb-8">Explore our detailed API documentation with examples, code samples, and interactive testing tools.</p>
            <a href="#" className="bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-900 transition-colors">
              View API Documentation
            </a>
          </section>
        </main>
      </div>
      <UnifiedFooter />
    </>
  );
}

