"use client"

import { Button } from "@/components/ui/button"
import { UnifiedNavigation } from "@/components/layout/unified-navigation"
import { UnifiedFooter } from "@/components/layout/unified-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Shield,
  Lock,
  Eye,
  FileText,
  ArrowRight,
  Database,
  Users,
  Globe
} from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <UnifiedNavigation />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-20 lg:py-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-20 transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full opacity-20 transform -translate-x-16 translate-y-16"></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-8 max-w-3xl mx-auto">
              How we collect, use, and protect your personal information when you use SalarySync.
            </p>
            <p className="text-blue-200">Last updated: January 15, 2024</p>
          </div>
        </section>

        {/* Privacy Content */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Introduction */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Eye className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-2xl">Introduction</CardTitle>
                </div>
                <CardDescription>Our commitment to your privacy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  At SalarySync B.V. ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our payroll management platform and related services.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  By using our Service, you consent to the data practices described in this policy. If you do not agree with the practices described in this policy, please do not use our Service.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Database className="w-6 h-6 text-green-600" />
                  <CardTitle className="text-2xl">Information We Collect</CardTitle>
                </div>
                <CardDescription>Types of data we gather</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h4>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    We collect personal information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>Name, email address, and contact information</li>
                    <li>Company information and business details</li>
                    <li>Employee data for payroll processing</li>
                    <li>Banking and financial information</li>
                    <li>Tax identification numbers and compliance data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Usage Information</h4>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    We automatically collect information about how you use our Service:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>Log data and access times</li>
                    <li>Device information and IP addresses</li>
                    <li>Browser type and operating system</li>
                    <li>Pages visited and features used</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Cookies and Tracking</h4>
                  <p className="text-gray-600 leading-relaxed">
                    We use cookies and similar tracking technologies to enhance your experience and analyze usage patterns. You can control cookie settings through your browser preferences.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-purple-600" />
                  <CardTitle className="text-2xl">How We Use Your Information</CardTitle>
                </div>
                <CardDescription>Purposes for data processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Provide and maintain our payroll management services</li>
                  <li>Process payroll calculations and payments</li>
                  <li>Ensure compliance with Dutch tax and labor laws</li>
                  <li>Communicate with you about your account and services</li>
                  <li>Provide customer support and technical assistance</li>
                  <li>Improve our services and develop new features</li>
                  <li>Detect and prevent fraud or security breaches</li>
                  <li>Comply with legal obligations and regulatory requirements</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Lock className="w-6 h-6 text-red-600" />
                  <CardTitle className="text-2xl">Data Security</CardTitle>
                </div>
                <CardDescription>How we protect your information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  We implement industry-standard security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>End-to-end encryption for data transmission and storage</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure data centers with physical security measures</li>
                  <li>Employee training on data protection and privacy</li>
                  <li>Incident response procedures for security breaches</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  While we strive to protect your information, no method of transmission or storage is 100% secure. We cannot guarantee absolute security but are committed to maintaining the highest standards of data protection.
                </p>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-indigo-600" />
                  <CardTitle className="text-2xl">Your Rights Under GDPR</CardTitle>
                </div>
                <CardDescription>Your data protection rights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  Under the General Data Protection Regulation (GDPR), you have the following rights:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li><strong>Right to Access:</strong> Request copies of your personal data</li>
                  <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                  <li><strong>Right to Restrict Processing:</strong> Request limitation of data processing</li>
                  <li><strong>Right to Data Portability:</strong> Request transfer of your data</li>
                  <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
                  <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  To exercise any of these rights, please contact us using the information provided below. We will respond to your request within 30 days.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Contact Information</CardTitle>
                <CardDescription>Questions about this privacy policy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg space-y-2">
                  <p className="text-gray-700"><strong>Email:</strong> info@salarysync.nl</p>
                  <p className="text-gray-700"><strong>Data Protection Officer:</strong> privacy@salarysync.nl</p>
                  <p className="text-gray-700"><strong>Address:</strong> Schiphol Boulevard 127, Schiphol 1118 BG, Netherlands</p>
                  <p className="text-gray-700"><strong>Phone:</strong> +31 20 123 4567</p>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
              <p className="text-gray-600 mb-6">
                Your privacy is protected with SalarySync. Start your free trial today and experience secure payroll management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <UnifiedFooter />
    </div>
  )
}

