"use client"

import { Button } from "@/components/ui/button"
import { UnifiedNavigation } from "@/components/layout/unified-navigation"
import { UnifiedFooter } from "@/components/layout/unified-footer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Building2,
  Briefcase,
  Zap,
  Shield,
  Headphones,
  Euro
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div className="min-h-screen bg-white">
      <UnifiedNavigation />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-20 lg:py-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-20 transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full opacity-20 transform -translate-x-16 translate-y-16"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Euro className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Simple, transparent pricing
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed mb-10 max-w-4xl mx-auto">
                Choose the perfect plan for your business. All plans include our core payroll features with no hidden fees.
              </p>
              
              {/* Billing Toggle */}
              <div className="flex items-center justify-center space-x-4 mb-10">
                <span className={`text-lg ${billingCycle === 'monthly' ? 'text-white font-semibold' : 'text-blue-200'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="relative inline-flex h-8 w-16 items-center rounded-full bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      billingCycle === 'yearly' ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-lg ${billingCycle === 'yearly' ? 'text-white font-semibold' : 'text-blue-200'}`}>
                  Yearly
                </span>
                {billingCycle === 'yearly' && (
                  <Badge className="bg-green-500 text-white ml-2">Save 20%</Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Starter Plan */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <CardDescription className="text-lg">Perfect for small businesses</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      €{billingCycle === 'monthly' ? '29' : '23'}
                    </div>
                    <div className="text-gray-600">per employee/month</div>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-green-600 mt-1">€276 billed annually</div>
                    )}
                  </div>
                  
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Up to 10 employees</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Basic payroll processing</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Employee self-service portal</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Tax compliance & reporting</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Email support</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Mobile app access</span>
                    </li>
                  </ul>
                  
                  <Link href="/auth/signup">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold">
                      Start Free Trial
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Professional Plan */}
              <Card className="border-0 shadow-xl border-2 border-blue-200 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                </div>
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">Professional</CardTitle>
                  <CardDescription className="text-lg">For growing companies</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      €{billingCycle === 'monthly' ? '39' : '31'}
                    </div>
                    <div className="text-gray-600">per employee/month</div>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-green-600 mt-1">€372 billed annually</div>
                    )}
                  </div>
                  
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">Up to 100 employees</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">Everything in Starter</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">Advanced reporting & analytics</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">API access & integrations</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">Priority support</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">Custom workflows</span>
                    </li>
                  </ul>
                  
                  <Link href="/auth/signup">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold">
                      Start Free Trial
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <CardDescription className="text-lg">For large organizations</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">Custom</div>
                    <div className="text-gray-600">pricing available</div>
                    <div className="text-sm text-gray-500 mt-1">Contact us for quote</div>
                  </div>
                  
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">Unlimited employees</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">Everything in Professional</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">Multi-company management</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">Dedicated account manager</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">Custom integrations</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">24/7 phone support</span>
                    </li>
                  </ul>
                  
                  <Link href="/contact">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold">
                      Contact Sales
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Compare all features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See exactly what's included in each plan to make the best choice for your business.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Features</th>
                      <th className="px-6 py-4 text-center text-lg font-semibold text-green-600">Starter</th>
                      <th className="px-6 py-4 text-center text-lg font-semibold text-blue-600">Professional</th>
                      <th className="px-6 py-4 text-center text-lg font-semibold text-purple-600">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-gray-900 font-medium">Employee Limit</td>
                      <td className="px-6 py-4 text-center text-gray-600">Up to 10</td>
                      <td className="px-6 py-4 text-center text-gray-600">Up to 100</td>
                      <td className="px-6 py-4 text-center text-gray-600">Unlimited</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">Payroll Processing</td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-purple-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-900 font-medium">Employee Self-Service</td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-purple-600 mx-auto" /></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">Tax Compliance</td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-purple-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-900 font-medium">Advanced Reporting</td>
                      <td className="px-6 py-4 text-center text-gray-400">—</td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-purple-600 mx-auto" /></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">API Access</td>
                      <td className="px-6 py-4 text-center text-gray-400">—</td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-blue-600 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-purple-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-900 font-medium">Multi-Company Management</td>
                      <td className="px-6 py-4 text-center text-gray-400">—</td>
                      <td className="px-6 py-4 text-center text-gray-400">—</td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-purple-600 mx-auto" /></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">Dedicated Account Manager</td>
                      <td className="px-6 py-4 text-center text-gray-400">—</td>
                      <td className="px-6 py-4 text-center text-gray-400">—</td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-purple-600 mx-auto" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Frequently asked questions
              </h2>
              <p className="text-xl text-gray-600">
                Have questions about our pricing? We have answers.
              </p>
            </div>

            <div className="space-y-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Is there a free trial?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Yes! We offer a 14-day free trial for all plans. No credit card required to start.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Can I change plans anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">What payment methods do you accept?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We accept all major credit cards, SEPA direct debit, and bank transfers for annual plans.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Is my data secure?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Yes. We use bank-level encryption and are fully GDPR compliant. Your data is stored securely in European data centers.
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
              Ready to streamline your payroll?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join hundreds of Dutch businesses who trust SalarySync with their payroll. 
              Start your free trial today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 transition-colors duration-200 font-semibold px-8 py-4 text-lg shadow-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold">
                  Contact Sales
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

