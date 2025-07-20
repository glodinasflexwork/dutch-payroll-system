import { Shield, Lock, Eye, FileCheck, Server, Users, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Enterprise-Grade Security</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Your payroll data is among your most sensitive business information. We protect it with bank-level security measures, comprehensive compliance frameworks, and continuous monitoring.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Our Security Commitment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Lock className="w-12 h-12 text-red-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Data Encryption</h3>
              <p className="text-gray-600">All data is encrypted both in transit and at rest using AES-256 encryption, ensuring your sensitive payroll information remains protected at all times.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Eye className="w-12 h-12 text-red-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Access Controls</h3>
              <p className="text-gray-600">Role-based access controls and multi-factor authentication ensure only authorized personnel can access specific payroll data and functions.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Server className="w-12 h-12 text-red-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Secure Infrastructure</h3>
              <p className="text-gray-600">Our cloud infrastructure is hosted on enterprise-grade servers with 24/7 monitoring, automated backups, and disaster recovery protocols.</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Compliance & Certifications</h2>
          <div className="bg-white p-10 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Regulatory Compliance</h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" /> GDPR (General Data Protection Regulation)</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" /> SOC 2 Type II Certified</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" /> ISO 27001 Information Security Management</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" /> Dutch Data Protection Authority (AP) Compliant</li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Security Standards</h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" /> PCI DSS Level 1 Compliance</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" /> Regular Penetration Testing</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" /> Third-Party Security Audits</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" /> Vulnerability Management Program</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Security Features</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <Users className="w-10 h-10 text-blue-600 mr-4" />
                <h3 className="text-3xl font-semibold text-gray-800">Identity & Access Management</h3>
              </div>
              <p className="text-gray-600 mb-6">Comprehensive user management with granular permissions, ensuring employees only access the data they need for their role.</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Multi-Factor Authentication (MFA)</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Single Sign-On (SSO) Integration</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Role-Based Access Controls</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Session Management & Timeouts</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <FileCheck className="w-10 h-10 text-green-600 mr-4" />
                <h3 className="text-3xl font-semibold text-gray-800">Audit & Monitoring</h3>
              </div>
              <p className="text-gray-600 mb-6">Complete audit trails and real-time monitoring provide full visibility into all system activities and data access.</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Comprehensive Activity Logging</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Real-Time Security Monitoring</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Automated Threat Detection</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Incident Response Procedures</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="text-center bg-red-50 p-12 rounded-lg">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-red-800 mb-6">Security Questions?</h2>
          <p className="text-lg text-red-700 mb-8">Our security team is available to discuss your specific security requirements and provide detailed documentation about our security practices.</p>
          <a href="/contact" className="bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors">
            Contact Security Team
          </a>
        </section>
      </main>
    </div>
  );
}

