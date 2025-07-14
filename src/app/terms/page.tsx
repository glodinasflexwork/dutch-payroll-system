"use client"

import { Button } from "@/components/ui/button"
import { UnifiedNavigation } from "@/components/layout/unified-navigation"
import { UnifiedFooter } from "@/components/layout/unified-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText,
  Scale,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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
              <Scale className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-8 max-w-3xl mx-auto">
              The legal terms and conditions governing your use of SalarySync services.
            </p>
            <p className="text-blue-200">Last updated: January 15, 2024</p>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Acceptance of Terms */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <CardTitle className="text-2xl">Acceptance of Terms</CardTitle>
                </div>
                <CardDescription>Agreement to these terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using SalarySync's payroll management platform and related services (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  These Terms apply to all visitors, users, and others who access or use the Service. SalarySync B.V. ("Company," "we," "our," or "us") reserves the right to update these Terms at any time without prior notice.
                </p>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-2xl">Service Description</CardTitle>
                </div>
                <CardDescription>What SalarySync provides</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  SalarySync provides cloud-based payroll management software designed for Dutch businesses. Our Service includes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Automated payroll calculations and processing</li>
                  <li>Employee self-service portals</li>
                  <li>Tax compliance and reporting</li>
                  <li>Integration with Dutch banking systems</li>
                  <li>HR management tools and analytics</li>
                  <li>Customer support and training</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice to users.
                </p>
              </CardContent>
            </Card>

            {/* User Accounts */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">User Accounts and Registration</CardTitle>
                <CardDescription>Account requirements and responsibilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Account Creation</h4>
                  <p className="text-gray-600 leading-relaxed">
                    To use our Service, you must create an account by providing accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Eligibility</h4>
                  <p className="text-gray-600 leading-relaxed">
                    You must be at least 18 years old and have the legal authority to enter into these Terms. If you are using the Service on behalf of a company, you represent that you have the authority to bind that entity.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Account Security</h4>
                  <p className="text-gray-600 leading-relaxed">
                    You are responsible for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account or any other breach of security.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Acceptable Use */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <CardTitle className="text-2xl">Acceptable Use Policy</CardTitle>
                </div>
                <CardDescription>Rules for using our service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit malicious code or viruses</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Use the Service for any fraudulent or illegal activities</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                  <li>Resell or redistribute the Service without permission</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  Violation of this policy may result in immediate termination of your account and access to the Service.
                </p>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Payment Terms and Billing</CardTitle>
                <CardDescription>Subscription and payment policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Subscription Plans</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Our Service is offered through various subscription plans with different features and pricing. Current pricing is available on our website and may be updated from time to time.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Billing and Payment</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                    <li>Payment is due immediately upon invoice</li>
                    <li>All fees are non-refundable except as required by law</li>
                    <li>We accept major credit cards and bank transfers</li>
                    <li>Late payments may result in service suspension</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Free Trial</h4>
                  <p className="text-gray-600 leading-relaxed">
                    We may offer a free trial period for new users. At the end of the trial, your subscription will automatically convert to a paid plan unless you cancel before the trial expires.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Cancellation</h4>
                  <p className="text-gray-600 leading-relaxed">
                    You may cancel your subscription at any time through your account settings or by contacting customer support. Cancellation takes effect at the end of your current billing period.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Contact Information</CardTitle>
                <CardDescription>Questions about these terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg space-y-2">
                  <p className="text-gray-700"><strong>Email:</strong> info@salarysync.nl</p>
                  <p className="text-gray-700"><strong>Address:</strong> Schiphol Boulevard 127, Schiphol 1118 BG, Netherlands</p>
                  <p className="text-gray-700"><strong>Phone:</strong> +31 20 123 4567</p>
                  <p className="text-gray-700"><strong>Business Registration:</strong> KvK 12345678</p>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
              <p className="text-gray-600 mb-6">
                By using SalarySync, you agree to these terms. Start your free trial today and experience professional payroll management.
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
                    Contact Sales
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

