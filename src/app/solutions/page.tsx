"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Calculator, 
  Users, 
  Building2,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Briefcase,
  Heart,
  GraduationCap,
  Factory,
  Store,
  Laptop
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function SolutionsPage() {
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
              <Link href="/solutions" className="text-blue-600 font-medium text-sm border-b-2 border-blue-600 pb-1">
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
                <Link href="/solutions" className="text-blue-600 font-medium">Solutions</Link>
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
              <Badge className="mb-6 bg-white/20 text-white hover:bg-white/20 border-white/30">
                🏢 Industry Solutions
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Tailored payroll solutions
                <span className="block">for every industry</span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed mb-10 max-w-4xl mx-auto">
                From small businesses to large enterprises, SalarySync adapts to your industry's 
                unique payroll requirements and compliance needs.
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

        {/* Industry Solutions */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Solutions by industry
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Every industry has unique payroll challenges. Our specialized solutions 
                address the specific needs of your sector.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Technology & Startups */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <Laptop className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Technology & Startups</CardTitle>
                  <CardDescription className="text-base">
                    Fast-growing tech companies need flexible payroll solutions that scale with rapid hiring.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Stock option management</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Remote employee support</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Rapid scaling capabilities</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">API integrations</span>
                    </li>
                  </ul>
                  <Link href="/contact">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Healthcare */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardHeader>
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                    <Heart className="w-8 h-8 text-red-600" />
                  </div>
                  <CardTitle className="text-xl">Healthcare</CardTitle>
                  <CardDescription className="text-base">
                    Complex shift patterns, overtime rules, and compliance requirements made simple.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Shift differential pay</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">On-call compensation</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Healthcare compliance</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Time tracking integration</span>
                    </li>
                  </ul>
                  <Link href="/contact">
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Education */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                    <GraduationCap className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Education</CardTitle>
                  <CardDescription className="text-base">
                    Handle academic calendars, substitute teachers, and seasonal employment patterns.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Academic year scheduling</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Substitute management</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Summer break handling</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Pension contributions</span>
                    </li>
                  </ul>
                  <Link href="/contact">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Manufacturing */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardHeader>
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                    <Factory className="w-8 h-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">Manufacturing</CardTitle>
                  <CardDescription className="text-base">
                    Complex shift work, overtime calculations, and union requirements handled seamlessly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Shift premium calculations</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Union contract compliance</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Overtime management</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Safety compliance tracking</span>
                    </li>
                  </ul>
                  <Link href="/contact">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Retail */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                    <Store className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Retail</CardTitle>
                  <CardDescription className="text-base">
                    Manage seasonal workers, commission structures, and variable schedules with ease.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Commission calculations</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Seasonal employee management</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Variable hour scheduling</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Multi-location support</span>
                    </li>
                  </ul>
                  <Link href="/contact">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Professional Services */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardHeader>
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                    <Briefcase className="w-8 h-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Professional Services</CardTitle>
                  <CardDescription className="text-base">
                    Project-based billing, client allocations, and professional development tracking.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Project time allocation</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Client billing integration</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Expense reimbursements</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Performance bonuses</span>
                    </li>
                  </ul>
                  <Link href="/contact">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Business Size Solutions */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Solutions by business size
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Whether you're a startup or an enterprise, we have the right solution 
                to match your business size and growth stage.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Small Business */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Small Business</h3>
                  <p className="text-gray-600">1-50 employees</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Easy Setup</h4>
                      <p className="text-gray-600">Get started in minutes with guided onboarding</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Affordable Pricing</h4>
                      <p className="text-gray-600">Cost-effective solutions that grow with you</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Essential Features</h4>
                      <p className="text-gray-600">All core payroll features without complexity</p>
                    </div>
                  </li>
                </ul>
                
                <Link href="/pricing">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    View Small Business Plans
                  </Button>
                </Link>
              </div>

              {/* Medium Business */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-blue-200">
                <div className="text-center mb-8">
                  <Badge className="mb-4 bg-blue-100 text-blue-800">Most Popular</Badge>
                  <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Medium Business</h3>
                  <p className="text-gray-600">51-500 employees</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Advanced Features</h4>
                      <p className="text-gray-600">Multi-location support and advanced reporting</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Dedicated Support</h4>
                      <p className="text-gray-600">Priority support with dedicated account manager</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Integrations</h4>
                      <p className="text-gray-600">Connect with HR, accounting, and time tracking systems</p>
                    </div>
                  </li>
                </ul>
                
                <Link href="/pricing">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    View Medium Business Plans
                  </Button>
                </Link>
              </div>

              {/* Enterprise */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
                  <p className="text-gray-600">500+ employees</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Custom Solutions</h4>
                      <p className="text-gray-600">Tailored features and custom integrations</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">White-Glove Service</h4>
                      <p className="text-gray-600">Implementation support and training</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Enterprise Security</h4>
                      <p className="text-gray-600">Advanced security and compliance features</p>
                    </div>
                  </li>
                </ul>
                
                <Link href="/contact">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Contact Sales
                  </Button>
                </Link>
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
              Find the perfect solution for your business
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Ready to see how SalarySync can transform your payroll operations? 
              Start with a free trial or speak with our experts.
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

