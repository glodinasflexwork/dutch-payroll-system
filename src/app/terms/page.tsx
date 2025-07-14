"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Calculator, 
  ArrowRight,
  Menu,
  X,
  FileText,
  Scale,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function TermsPage() {
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
                <Scale className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Terms of Service
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed mb-10 max-w-4xl mx-auto">
                The legal terms and conditions governing your use of SalarySync services.
              </p>
              <div className="text-blue-100">
                Last updated: January 15, 2024
              </div>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              
              {/* Acceptance */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Acceptance of Terms</CardTitle>
                      <CardDescription>Agreement to these terms</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed">
                  <p>
                    By accessing or using SalarySync's payroll management platform and related 
                    services (the "Service"), you agree to be bound by these Terms of Service 
                    ("Terms"). If you disagree with any part of these terms, you may not access 
                    the Service.
                  </p>
                  <p>
                    These Terms apply to all visitors, users, and others who access or use the 
                    Service. SalarySync B.V. ("Company," "we," "our," or "us") reserves the right 
                    to update these Terms at any time without prior notice.
                  </p>
                </CardContent>
              </Card>

              {/* Service Description */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Service Description</CardTitle>
                  <CardDescription>What SalarySync provides</CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    SalarySync provides cloud-based payroll management software designed for 
                    Dutch businesses. Our Service includes:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Automated payroll calculations and processing</li>
                    <li>Employee self-service portals</li>
                    <li>Tax compliance and reporting</li>
                    <li>Integration with Dutch banking systems</li>
                    <li>HR management tools and analytics</li>
                    <li>Customer support and training</li>
                  </ul>
                  <p>
                    We reserve the right to modify, suspend, or discontinue any part of the 
                    Service at any time with reasonable notice to users.
                  </p>
                </CardContent>
              </Card>

              {/* User Accounts */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">User Accounts and Registration</CardTitle>
                  <CardDescription>Account requirements and responsibilities</CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Account Creation</h4>
                    <p>
                      To use our Service, you must create an account by providing accurate, 
                      current, and complete information. You are responsible for maintaining 
                      the confidentiality of your account credentials.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Eligibility</h4>
                    <p>
                      You must be at least 18 years old and have the legal authority to enter 
                      into these Terms. If you are using the Service on behalf of a company, 
                      you represent that you have the authority to bind that entity.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Account Security</h4>
                    <p>
                      You are responsible for all activities that occur under your account. 
                      You must immediately notify us of any unauthorized use of your account 
                      or any other breach of security.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Acceptable Use */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Acceptable Use Policy</CardTitle>
                      <CardDescription>Rules for using our service</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed space-y-4">
                  <p>You agree not to use the Service to:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe on intellectual property rights</li>
                    <li>Transmit malicious code or viruses</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with or disrupt the Service</li>
                    <li>Use the Service for any fraudulent or illegal activities</li>
                    <li>Reverse engineer or attempt to extract source code</li>
                    <li>Resell or redistribute the Service without permission</li>
                  </ul>
                  <p>
                    Violation of this policy may result in immediate termination of your 
                    account and access to the Service.
                  </p>
                </CardContent>
              </Card>

              {/* Payment Terms */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Payment Terms and Billing</CardTitle>
                  <CardDescription>Subscription and payment policies</CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Subscription Plans</h4>
                    <p>
                      Our Service is offered through various subscription plans with different 
                      features and pricing. Current pricing is available on our website and 
                      may be updated from time to time.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Billing and Payment</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                      <li>Payment is due immediately upon invoice</li>
                      <li>All fees are non-refundable except as required by law</li>
                      <li>We accept major credit cards and bank transfers</li>
                      <li>Late payments may result in service suspension</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Free Trial</h4>
                    <p>
                      We may offer a free trial period for new users. At the end of the trial, 
                      your subscription will automatically convert to a paid plan unless you 
                      cancel before the trial expires.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Cancellation</h4>
                    <p>
                      You may cancel your subscription at any time through your account settings 
                      or by contacting customer support. Cancellation takes effect at the end 
                      of your current billing period.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Data and Privacy */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Data Protection and Privacy</CardTitle>
                  <CardDescription>How we handle your information</CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    Your privacy is important to us. Our collection and use of personal 
                    information is governed by our Privacy Policy, which is incorporated 
                    into these Terms by reference.
                  </p>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Data Ownership</h4>
                    <p>
                      You retain ownership of all data you input into the Service. We do not 
                      claim ownership of your data and will not use it for purposes other than 
                      providing the Service.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Data Security</h4>
                    <p>
                      We implement industry-standard security measures to protect your data. 
                      However, no method of transmission or storage is 100% secure, and we 
                      cannot guarantee absolute security.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Data Export</h4>
                    <p>
                      You may export your data at any time through the Service interface. 
                      Upon termination, we will provide a reasonable opportunity to export 
                      your data before deletion.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Intellectual Property */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Intellectual Property Rights</CardTitle>
                  <CardDescription>Ownership and licensing</CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Our Rights</h4>
                    <p>
                      The Service and its original content, features, and functionality are 
                      owned by SalarySync B.V. and are protected by international copyright, 
                      trademark, patent, trade secret, and other intellectual property laws.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">License to Use</h4>
                    <p>
                      We grant you a limited, non-exclusive, non-transferable license to use 
                      the Service for your internal business purposes in accordance with these Terms.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Restrictions</h4>
                    <p>
                      You may not copy, modify, distribute, sell, or lease any part of our 
                      Service or included software, nor may you reverse engineer or attempt 
                      to extract the source code.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Limitation of Liability */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Limitation of Liability</CardTitle>
                  <CardDescription>Legal limitations and disclaimers</CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Service Availability</h4>
                    <p>
                      While we strive for 99.9% uptime, we do not guarantee that the Service 
                      will be available at all times. We may experience downtime for maintenance, 
                      updates, or unforeseen circumstances.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Disclaimer of Warranties</h4>
                    <p>
                      The Service is provided "as is" without warranties of any kind, either 
                      express or implied, including but not limited to warranties of merchantability, 
                      fitness for a particular purpose, or non-infringement.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Limitation of Damages</h4>
                    <p>
                      In no event shall SalarySync B.V. be liable for any indirect, incidental, 
                      special, consequential, or punitive damages, including lost profits, 
                      arising from your use of the Service.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Maximum Liability</h4>
                    <p>
                      Our total liability to you for all claims arising from these Terms or 
                      the Service shall not exceed the amount you paid us in the 12 months 
                      preceding the claim.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Termination */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Termination</CardTitle>
                  <CardDescription>How these terms may end</CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Termination by You</h4>
                    <p>
                      You may terminate your account at any time by canceling your subscription 
                      through the Service interface or by contacting customer support.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Termination by Us</h4>
                    <p>
                      We may terminate or suspend your account immediately if you breach these 
                      Terms, fail to pay fees, or engage in prohibited activities.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Effect of Termination</h4>
                    <p>
                      Upon termination, your right to use the Service ceases immediately. 
                      We will provide a reasonable opportunity to export your data before 
                      permanent deletion.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Governing Law */}
              <Card className="border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Governing Law and Disputes</CardTitle>
                  <CardDescription>Legal jurisdiction and dispute resolution</CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Governing Law</h4>
                    <p>
                      These Terms shall be governed by and construed in accordance with the 
                      laws of the Netherlands, without regard to its conflict of law provisions.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Jurisdiction</h4>
                    <p>
                      Any disputes arising from these Terms or the Service shall be subject 
                      to the exclusive jurisdiction of the courts of Amsterdam, Netherlands.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Dispute Resolution</h4>
                    <p>
                      We encourage resolving disputes through direct communication. If a 
                      dispute cannot be resolved informally, it may be submitted to binding 
                      arbitration in accordance with Dutch arbitration rules.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Contact Information</CardTitle>
                  <CardDescription>Questions about these terms</CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 leading-relaxed">
                  <p className="mb-4">
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="space-y-2">
                      <div><strong>Email:</strong> legal@salarysync.nl</div>
                      <div><strong>Address:</strong> SalarySync B.V., Herengracht 123, 1015 BG Amsterdam, Netherlands</div>
                      <div><strong>Phone:</strong> +31 20 123 4567</div>
                      <div><strong>Business Registration:</strong> KvK 12345678</div>
                    </div>
                  </div>
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
              Ready to get started?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              By using SalarySync, you agree to these terms. Start your free trial today 
              and experience professional payroll management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 transition-colors duration-200 font-semibold px-8 py-4 text-lg shadow-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
                  Contact Legal Team
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

