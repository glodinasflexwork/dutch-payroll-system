"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calculator, 
  ArrowRight,
  Menu,
  X,
  Users,
  Target,
  Heart,
  Award,
  Globe,
  Shield,
  Zap,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AboutPage() {
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
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm">
                Contact
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
                <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Contact</Link>
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
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                About SalarySync
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed mb-10 max-w-4xl mx-auto">
                We are passionate about simplifying payroll for Dutch businesses, making compliance effortless and growth possible.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge className="bg-blue-100 text-blue-700 mb-6">Our Mission</Badge>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Empowering Dutch businesses with effortless payroll
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  We believe that managing payroll should be simple, accurate, and stress-free. Our mission is to provide Dutch businesses with the most intuitive and compliant payroll solution, allowing them to focus on what they do best - growing their business.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">100% Dutch compliance guaranteed</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Automated tax calculations and filings</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Expert support when you need it</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 shadow-xl">
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">500+</h3>
                        <p className="text-gray-600">Happy Customers</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">99.9%</h3>
                        <p className="text-gray-600">Accuracy Rate</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Globe className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">24/7</h3>
                        <p className="text-gray-600">Support Available</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">5 min</h3>
                        <p className="text-gray-600">Setup Time</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="bg-blue-100 text-blue-700 mb-6">Our Values</Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                What drives us forward
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our core values shape everything we do, from product development to customer support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Trust & Security</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We handle your sensitive payroll data with the highest level of security and transparency. Your trust is our foundation.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Precision</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Every calculation, every compliance check, every detail matters. We deliver accuracy you can depend on.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Customer First</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Your success is our success. We are committed to providing exceptional support and continuously improving our platform.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 shadow-xl">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-600 font-medium">2020 - Founded</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span className="text-gray-600 font-medium">2021 - First 100 customers</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                      <span className="text-gray-600 font-medium">2022 - Advanced automation</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                      <span className="text-gray-600 font-medium">2023 - Multi-company support</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <span className="text-gray-600 font-medium">2024 - 500+ businesses served</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Badge className="bg-blue-100 text-blue-700 mb-6">Our Story</Badge>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Built by entrepreneurs, for entrepreneurs
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  SalarySync was born from our own frustration with complex payroll systems. As business owners ourselves, we experienced firsthand the challenges of managing payroll compliance in the Netherlands.
                </p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  We set out to create a solution that would eliminate the stress and complexity of payroll management, allowing business owners to focus on growing their companies rather than wrestling with administrative tasks.
                </p>
                <Link href="/contact">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold">
                    Join Our Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to simplify your payroll?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join hundreds of Dutch businesses who trust SalarySync with their payroll management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                  Contact Sales
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
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
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

