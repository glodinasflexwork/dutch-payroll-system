"use client"

import { Button } from "@/components/ui/button"
import { UnifiedNavigation } from "@/components/layout/unified-navigation"
import { UnifiedFooter } from "@/components/layout/unified-footer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Calculator, 
  Users, 
  FileText, 
  Shield, 
  Clock, 
  TrendingUp,
  CheckCircle,
  Building2,
  Euro,
  ArrowRight,
  Banknote,
  BarChart3,
  Globe,
  Smartphone,
  Star,
  Zap,
  Lock,
  RefreshCw
} from "lucide-react"
import Link from "next/link"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <UnifiedNavigation />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-20 lg:py-32 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-20 transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full opacity-20 transform -translate-x-16 translate-y-16"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center text-white">
              <Badge className="mb-6 bg-white/20 text-white hover:bg-white/20 border-white/30">
                🚀 Complete Feature Overview
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Everything you need for
                <span className="block">professional payroll</span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed mb-10 max-w-4xl mx-auto">
                Discover all the powerful features that make SalarySync the most comprehensive 
                Dutch payroll solution for modern businesses.
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
                    Schedule Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Categories */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Comprehensive payroll features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From automated calculations to advanced analytics, SalarySync provides everything 
                you need to manage payroll efficiently and compliantly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Core Payroll Features */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                    <Calculator className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Automated Calculations</CardTitle>
                  <CardDescription className="text-base">
                    Complex Dutch payroll calculations handled automatically with built-in tax tables and compliance rules.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Income tax calculations</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Social security contributions</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Holiday pay & bonuses</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Pension contributions</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Employee Management */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Employee Management</CardTitle>
                  <CardDescription className="text-base">
                    Complete employee lifecycle management from onboarding to offboarding.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Digital onboarding</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Contract management</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Performance tracking</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Document storage</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Compliance & Reporting */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Compliance & Reporting</CardTitle>
                  <CardDescription className="text-base">
                    Stay compliant with Dutch labor laws and generate required reports automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Tax authority reports</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Audit trails</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">GDPR compliance</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Legal updates</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Employee Self-Service */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                    <Smartphone className="w-8 h-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">Employee Self-Service</CardTitle>
                  <CardDescription className="text-base">
                    Empower employees with mobile-friendly self-service portal for all their needs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Digital payslips</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Leave requests</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Time tracking</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Personal information</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Banking Integration */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-4">
                    <Banknote className="w-8 h-8 text-teal-600" />
                  </div>
                  <CardTitle className="text-xl">Banking Integration</CardTitle>
                  <CardDescription className="text-base">
                    Direct integration with Dutch banks for seamless salary payments and reconciliation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">SEPA transfers</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Auto reconciliation</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Payment tracking</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Multi-bank support</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Analytics & Insights */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                    <BarChart3 className="w-8 h-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Analytics & Insights</CardTitle>
                  <CardDescription className="text-base">
                    Comprehensive analytics and reporting to understand your payroll costs and trends.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Cost analysis</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Trend reporting</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Budget forecasting</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Custom dashboards</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Advanced enterprise features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Scale your payroll operations with enterprise-grade features designed for 
                growing businesses and multi-company management.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Multi-Company Management */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Multi-Company Management</h3>
                    <p className="text-gray-600">Manage multiple entities from one dashboard</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Company Switching</h4>
                      <p className="text-gray-600">Seamlessly switch between companies with role-based access</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Consolidated Reporting</h4>
                      <p className="text-gray-600">Generate reports across all companies or individual entities</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Team Invitations</h4>
                      <p className="text-gray-600">Invite team members with specific roles per company</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* API & Integrations */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">API & Integrations</h3>
                    <p className="text-gray-600">Connect with your existing business tools</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">REST API</h4>
                      <p className="text-gray-600">Full API access for custom integrations and automation</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Accounting Software</h4>
                      <p className="text-gray-600">Direct integration with popular Dutch accounting platforms</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">HR Systems</h4>
                      <p className="text-gray-600">Sync with existing HR and time tracking systems</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Security & Compliance */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                    <Lock className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Security & Compliance</h3>
                    <p className="text-gray-600">Enterprise-grade security and compliance</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Data Encryption</h4>
                      <p className="text-gray-600">End-to-end encryption for all sensitive payroll data</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">GDPR Compliance</h4>
                      <p className="text-gray-600">Full compliance with European data protection regulations</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Audit Logs</h4>
                      <p className="text-gray-600">Comprehensive audit trails for all system activities</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Automation & Workflows */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Automation & Workflows</h3>
                    <p className="text-gray-600">Streamline processes with intelligent automation</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Automated Payroll Runs</h4>
                      <p className="text-gray-600">Schedule and automate recurring payroll processes</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Smart Notifications</h4>
                      <p className="text-gray-600">Intelligent alerts for important deadlines and actions</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Custom Workflows</h4>
                      <p className="text-gray-600">Build custom approval workflows for your organization</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-10 transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full opacity-10 transform -translate-x-16 translate-y-16"></div>
          
          <div className="max-w-4xl mx-auto text-center relative">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to experience all these features?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Start your free trial today and discover how SalarySync can transform 
              your payroll operations with these powerful features.
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
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <UnifiedFooter />
    </div>
  )
}

