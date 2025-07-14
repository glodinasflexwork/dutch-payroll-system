"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Calculator, 
  ArrowRight,
  Menu,
  X,
  Shield,
  Lock,
  Eye,
  FileText
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function PrivacyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">SalarySync</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm">
                Features
              </Link>
              <Link href="/solutions" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm">
                Solutions
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm">
                About
              </Link>
            </nav>

            <div className="hidden md:flex items-center space-x-3">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-blue-600 font-medium">
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-6 font-medium shadow-sm">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col space-y-4">
                <Link href="/features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Features</Link>
                <Link href="/solutions" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Solutions</Link>
                <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Pricing</Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">About</Link>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                  <Link href="/auth/signin">
                    <Button variant="ghost" size="sm" className="w-full justify-start">Login</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Start Free Trial</Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-20 lg:py-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-20 transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full opacity-20 transform -translate-x-16 translate-y-16"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Privacy Policy
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed mb-10 max-w-4xl mx-auto">
                Your privacy is important to us. Learn how we collect, use, and protect your information.
              </p>
              <div className="text-blue-100">
                Last updated: January 15, 2024
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Content */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              
              {/* Introduction */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Introduction</CardTitle>
                      <CardDescription>Our commitment to your privacy</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed">
                  <p>
                    SalarySync B.V. ("we," "our," or "us") is committed to protecting your privacy. 
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                    information when you use our payroll management platform and related services.
                  </p>
                  <p>
                    This policy applies to all users of our services, including employers, employees, 
                    and administrators who access our platform. By using SalarySync, you consent to 
                    the data practices described in this policy.
                  </p>
                </CardContent>
              </Card>

              {/* Information We Collect */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Eye className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Information We Collect</CardTitle>
                      <CardDescription>Types of data we gather</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h4>
                    <p>We collect personal information that you provide directly to us, including:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Name, email address, and contact information</li>
                      <li>Employment details (job title, department, start date)</li>
                      <li>Salary and compensation information</li>
                      <li>Bank account details for payroll processing</li>
                      <li>Tax identification numbers (BSN in the Netherlands)</li>
                      <li>Emergency contact information</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Usage Information</h4>
                    <p>We automatically collect information about how you use our services:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Log data (IP address, browser type, pages visited)</li>
                      <li>Device information (operating system, device identifiers)</li>
                      <li>Usage patterns and feature interactions</li>
                      <li>Performance and error data</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Cookies and Tracking</h4>
                    <p>
                      We use cookies and similar technologies to enhance your experience, 
                      analyze usage patterns, and provide personalized content. You can 
                      control cookie settings through your browser preferences.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* How We Use Information */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Lock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">How We Use Your Information</CardTitle>
                      <CardDescription>Our data processing purposes</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Service Provision</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Process payroll and calculate salaries, taxes, and deductions</li>
                      <li>Generate pay slips and tax documents</li>
                      <li>Manage employee records and company data</li>
                      <li>Facilitate direct deposit and payment processing</li>
                      <li>Provide customer support and technical assistance</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Legal Compliance</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Comply with Dutch tax and labor law requirements</li>
                      <li>Submit required reports to government agencies</li>
                      <li>Maintain records as required by law</li>
                      <li>Respond to legal requests and investigations</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Service Improvement</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Analyze usage patterns to improve our platform</li>
                      <li>Develop new features and functionality</li>
                      <li>Conduct research and analytics</li>
                      <li>Send service updates and important notifications</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Data Sharing */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Information Sharing and Disclosure</CardTitle>
                  <CardDescription>When and how we share your data</CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed space-y-6">
                  <p>
                    We do not sell, trade, or rent your personal information to third parties. 
                    We may share your information only in the following circumstances:
                  </p>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Service Providers</h4>
                    <p>
                      We work with trusted third-party service providers who assist us in 
                      operating our platform, such as cloud hosting providers, payment 
                      processors, and security services. These providers are contractually 
                      bound to protect your information.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Legal Requirements</h4>
                    <p>
                      We may disclose your information when required by law, such as in 
                      response to court orders, government investigations, or to comply 
                      with Dutch tax and employment regulations.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Business Transfers</h4>
                    <p>
                      In the event of a merger, acquisition, or sale of assets, your 
                      information may be transferred as part of the business transaction, 
                      subject to the same privacy protections.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Data Security */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Data Security</CardTitle>
                  <CardDescription>How we protect your information</CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    We implement industry-standard security measures to protect your personal 
                    information against unauthorized access, alteration, disclosure, or destruction:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>End-to-end encryption for data transmission and storage</li>
                    <li>Multi-factor authentication for account access</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Employee training on data protection best practices</li>
                    <li>Secure data centers with physical access controls</li>
                    <li>Regular backups and disaster recovery procedures</li>
                  </ul>
                  <p>
                    While we strive to protect your information, no method of transmission 
                    over the internet or electronic storage is 100% secure. We cannot 
                    guarantee absolute security but are committed to maintaining the highest 
                    standards of data protection.
                  </p>
                </CardContent>
              </Card>

              {/* Your Rights */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Your Rights Under GDPR</CardTitle>
                  <CardDescription>Your data protection rights</CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    Under the General Data Protection Regulation (GDPR), you have the following rights:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Right to Access</h5>
                      <p className="text-sm">Request copies of your personal data</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Right to Rectification</h5>
                      <p className="text-sm">Request correction of inaccurate data</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Right to Erasure</h5>
                      <p className="text-sm">Request deletion of your data</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Right to Portability</h5>
                      <p className="text-sm">Request transfer of your data</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Right to Object</h5>
                      <p className="text-sm">Object to processing of your data</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Right to Restrict</h5>
                      <p className="text-sm">Request restriction of processing</p>
                    </div>
                  </div>
                  <p>
                    To exercise any of these rights, please contact us at privacy@salarysync.nl. 
                    We will respond to your request within 30 days.
                  </p>
                </CardContent>
              </Card>

              {/* Data Retention */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Data Retention</CardTitle>
                  <CardDescription>How long we keep your information</CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    We retain your personal information only as long as necessary to fulfill 
                    the purposes outlined in this policy and to comply with legal requirements:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Active accounts:</strong> Data is retained while your account is active</li>
                    <li><strong>Payroll records:</strong> Retained for 7 years as required by Dutch law</li>
                    <li><strong>Tax documents:</strong> Retained for 7 years for tax compliance</li>
                    <li><strong>Usage logs:</strong> Retained for 2 years for security and analytics</li>
                    <li><strong>Marketing data:</strong> Retained until you opt out or request deletion</li>
                  </ul>
                  <p>
                    When data is no longer needed, we securely delete or anonymize it in 
                    accordance with our data retention schedule and applicable laws.
                  </p>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Contact Us</CardTitle>
                  <CardDescription>Questions about this privacy policy</CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed">
                  <p className="mb-4">
                    If you have any questions about this Privacy Policy or our data practices, 
                    please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="space-y-2">
                      <div><strong>Email:</strong> privacy@salarysync.nl</div>
                      <div><strong>Address:</strong> Herengracht 123, 1015 BG Amsterdam, Netherlands</div>
                      <div><strong>Phone:</strong> +31 20 123 4567</div>
                      <div><strong>Data Protection Officer:</strong> dpo@salarysync.nl</div>
                    </div>
                  </div>
                  <p className="mt-4">
                    You also have the right to lodge a complaint with the Dutch Data Protection 
                    Authority (Autoriteit Persoonsgegevens) if you believe we have not handled 
                    your personal data appropriately.
                  </p>
                </CardContent>
              </Card>

              {/* Updates */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Policy Updates</CardTitle>
                  <CardDescription>Changes to this privacy policy</CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed">
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes in 
                    our practices, technology, legal requirements, or other factors. We will 
                    notify you of any material changes by:
                  </p>
                  <ul className="list-disc list-inside space-y-1 my-4">
                    <li>Posting the updated policy on our website</li>
                    <li>Sending an email notification to registered users</li>
                    <li>Displaying a prominent notice in our application</li>
                  </ul>
                  <p>
                    Your continued use of our services after any changes indicates your 
                    acceptance of the updated Privacy Policy. We encourage you to review 
                    this policy periodically to stay informed about how we protect your information.
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-10 transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full opacity-10 transform -translate-x-16 translate-y-16"></div>
          
          <div className="max-w-4xl mx-auto text-center relative">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Questions about privacy?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Our team is here to help you understand how we protect your data and 
              ensure compliance with all privacy regulations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 transition-colors duration-200 font-semibold px-8 py-4 text-lg shadow-lg">
                  Contact Privacy Team
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">SalarySync</span>
              </Link>
              <p className="text-gray-400 mb-6 max-w-md">
                Professional Dutch payroll solutions for modern businesses. 
                Streamline your payroll process with confidence and compliance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/solutions" className="hover:text-white transition-colors">Solutions</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 SalarySync. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

