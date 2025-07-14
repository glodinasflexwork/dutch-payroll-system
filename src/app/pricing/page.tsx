"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Calculator, 
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Star,
  Users,
  Building2,
  Briefcase,
  Zap,
  Shield,
  Headphones
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function PricingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

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
              <Link href="/pricing" className="text-blue-600 font-medium text-sm border-b-2 border-blue-600 pb-1">
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
                <Link href="/pricing" className="text-blue-600 font-medium">Pricing</Link>
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
              <Badge className="mb-6 bg-white/20 text-white hover:bg-white/20 border-white/30">
                💰 Simple, Transparent Pricing
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Choose the perfect plan
                <span className="block">for your business</span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed mb-10 max-w-4xl mx-auto">
                No hidden fees, no surprises. Start with a free trial and scale as you grow.
              </p>
              
              {/* Billing Toggle */}
              <div className="flex items-center justify-center space-x-4 mb-10">
                <span className={`text-lg ${billingCycle === 'monthly' ? 'text-white' : 'text-blue-200'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-lg ${billingCycle === 'yearly' ? 'text-white' : 'text-blue-200'}`}>
                  Yearly
                </span>
                {billingCycle === 'yearly' && (
                  <Badge className="bg-green-500 text-white">Save 20%</Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Starter Plan */}
              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Starter</CardTitle>
                  <CardDescription className="text-base">Perfect for small businesses</CardDescription>
                  <div className="mt-6">
                    <div className="text-4xl font-bold text-gray-900">
                      €{billingCycle === 'monthly' ? '29' : '23'}
                    </div>
                    <div className="text-gray-600">per employee/month</div>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-green-600 font-medium">Save €72/year</div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Up to 10 employees</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Automated payroll calculations</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Employee self-service portal</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Basic reporting</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Email support</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Mobile app access</span>
                    </li>
                  </ul>
                  <Link href="/auth/signup">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Start Free Trial
                    </Button>
                  </Link>
                  <p className="text-center text-sm text-gray-600 mt-3">
                    14-day free trial • No credit card required
                  </p>
                </CardContent>
              </Card>

              {/* Professional Plan */}
              <Card className="border-2 border-blue-500 shadow-xl hover:shadow-2xl transition-shadow duration-300 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
                </div>
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Professional</CardTitle>
                  <CardDescription className="text-base">Ideal for growing companies</CardDescription>
                  <div className="mt-6">
                    <div className="text-4xl font-bold text-gray-900">
                      €{billingCycle === 'monthly' ? '49' : '39'}
                    </div>
                    <div className="text-gray-600">per employee/month</div>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-green-600 font-medium">Save €120/year</div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Up to 100 employees</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Everything in Starter</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Advanced reporting & analytics</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Multi-company management</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">API access</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Priority support</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Custom integrations</span>
                    </li>
                  </ul>
                  <Link href="/auth/signup">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Start Free Trial
                    </Button>
                  </Link>
                  <p className="text-center text-sm text-gray-600 mt-3">
                    14-day free trial • No credit card required
                  </p>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Enterprise</CardTitle>
                  <CardDescription className="text-base">For large organizations</CardDescription>
                  <div className="mt-6">
                    <div className="text-4xl font-bold text-gray-900">Custom</div>
                    <div className="text-gray-600">Contact for pricing</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Unlimited employees</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Everything in Professional</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Dedicated account manager</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Custom workflows</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Advanced security features</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">24/7 phone support</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">On-premise deployment option</span>
                    </li>
                  </ul>
                  <Link href="/contact">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Contact Sales
                    </Button>
                  </Link>
                  <p className="text-center text-sm text-gray-600 mt-3">
                    Custom implementation • White-glove onboarding
                  </p>
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
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Starter</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Professional</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Employee Limit</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">Up to 10</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">Up to 100</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">Unlimited</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Payroll Processing</td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Employee Self-Service</td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Basic Reporting</td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Advanced Analytics</td>
                      <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Multi-Company Management</td>
                      <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">API Access</td>
                      <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Dedicated Account Manager</td>
                      <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">24/7 Phone Support</td>
                      <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Add-ons */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Optional add-ons
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Enhance your payroll system with these optional features available for all plans.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Time Tracking */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Time Tracking</CardTitle>
                  <CardDescription className="text-base">
                    Advanced time tracking with project allocation and overtime management.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-4">€5/employee/month</div>
                  <ul className="space-y-2 text-sm text-gray-600 mb-6">
                    <li>• GPS-based clock in/out</li>
                    <li>• Project time allocation</li>
                    <li>• Overtime calculations</li>
                    <li>• Mobile app integration</li>
                  </ul>
                  <Button variant="outline" className="w-full">Add to Plan</Button>
                </CardContent>
              </Card>

              {/* HR Management */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">HR Management</CardTitle>
                  <CardDescription className="text-base">
                    Complete HR suite with performance reviews and document management.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-4">€8/employee/month</div>
                  <ul className="space-y-2 text-sm text-gray-600 mb-6">
                    <li>• Performance reviews</li>
                    <li>• Document management</li>
                    <li>• Leave management</li>
                    <li>• Employee onboarding</li>
                  </ul>
                  <Button variant="outline" className="w-full">Add to Plan</Button>
                </CardContent>
              </Card>

              {/* Premium Support */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                    <Headphones className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Premium Support</CardTitle>
                  <CardDescription className="text-base">
                    Priority support with dedicated phone line and faster response times.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-4">€99/month</div>
                  <ul className="space-y-2 text-sm text-gray-600 mb-6">
                    <li>• 24/7 phone support</li>
                    <li>• 1-hour response time</li>
                    <li>• Dedicated support agent</li>
                    <li>• Priority feature requests</li>
                  </ul>
                  <Button variant="outline" className="w-full">Add to Plan</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Pricing FAQ
              </h2>
              <p className="text-xl text-gray-600">
                Common questions about our pricing and plans.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Is there a setup fee?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    No, there are no setup fees for any of our plans. We also provide free data 
                    migration and onboarding support to help you get started quickly.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect 
                    immediately, and we'll prorate the billing accordingly.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">What happens if I exceed my employee limit?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    If you exceed your plan's employee limit, we'll automatically suggest an upgrade 
                    to the next tier. You won't be charged extra until you confirm the upgrade.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Do you offer discounts for non-profits?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Yes, we offer a 25% discount for registered non-profit organizations. 
                    Contact our sales team with your non-profit documentation to apply.
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
              Ready to get started?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join hundreds of Dutch businesses who trust SalarySync with their payroll. 
              Start your free trial today - no credit card required.
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

