import { UnifiedNavigation } from "@/components/layout/unified-navigation";
import { UnifiedFooter } from "@/components/layout/unified-footer";
import { ShieldCheck, Lock, Server, FileText, Fingerprint, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
  return (
    <>
      <UnifiedNavigation />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-red-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">Your Data, Our Priority: Uncompromising Security</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              At SalarySync, we understand the critical importance of data security and privacy. We employ industry-leading measures to protect your sensitive payroll information.
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Our Security Commitments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Lock className="w-12 h-12 text-red-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Data Encryption</h3>
                <p className="text-gray-600">All your data, both in transit and at rest, is protected with advanced encryption protocols (AES-256).</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Server className="w-12 h-12 text-red-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Secure Infrastructure</h3>
                <p className="text-gray-600">Our systems are hosted on secure, compliant cloud infrastructure with robust physical and environmental controls.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <ShieldCheck className="w-12 h-12 text-red-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Regular Audits & Penetration Testing</h3>
                <p className="text-gray-600">We conduct regular security audits and penetration tests to identify and address potential vulnerabilities.</p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Privacy & Compliance</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                  <FileText className="w-10 h-10 text-blue-600 mr-4" />
                  <h3 className="text-3xl font-semibold text-gray-800">GDPR Compliant</h3>
                </div>
                <p className="text-gray-600">SalarySync is fully compliant with the General Data Protection Regulation (GDPR), ensuring your data privacy rights are protected.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                  <Fingerprint className="w-10 h-10 text-blue-600 mr-4" />
                  <h3 className="text-3xl font-semibold text-gray-800">Access Control & Monitoring</h3>
                </div>
                <p className="text-gray-600">Strict access controls and continuous monitoring ensure that only authorized personnel can access sensitive data, with all activities logged for audit.</p>
              </div>
            </div>
          </section>

          <section className="text-center bg-red-50 p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-red-800 mb-6">Have More Questions About Security?</h2>
            <p className="text-lg text-red-700 mb-8">We are committed to transparency and are happy to provide more details on our security practices.</p>
            <a href="/contact" className="bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors">
              Contact Our Security Team
            </a>
          </section>
        </main>
      </div>
      <UnifiedFooter />
    </>
  );
}


