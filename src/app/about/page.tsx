"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Calculator, 
  Users, 
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Target,
  Heart,
  Shield,
  Award,
  Globe,
  Zap
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
              <Link href="/about" className="text-blue-600 font-medium text-sm border-b-2 border-blue-600 pb-1">
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
                <Link href="/about" className="text-blue-600 font-medium">About</Link>
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
                🚀 About SalarySync
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Revolutionizing payroll
                <span className="block">for Dutch businesses</span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed mb-10 max-w-4xl mx-auto">
                We're on a mission to make payroll simple, compliant, and stress-free for 
                every business in the Netherlands.
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
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                  Our mission
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  We believe that payroll should be the least of your worries when running a business. 
                  That's why we've built SalarySync - a comprehensive, compliant, and user-friendly 
                  payroll solution designed specifically for the Dutch market.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  Our platform combines cutting-edge technology with deep understanding of Dutch 
                  labor laws and regulations, ensuring your payroll is always accurate, compliant, 
                  and delivered on time.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Our Goal</h3>
                    <p className="text-gray-600">Simplify payroll for every Dutch business</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                    <div className="text-gray-600">Employees Managed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                    <div className="text-gray-600">Companies Trust Us</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                    <div className="text-gray-600">Uptime Guarantee</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                    <div className="text-gray-600">Support Available</div>
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
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Our values
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These core values guide everything we do and shape how we build 
                products and serve our customers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Simplicity */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Simplicity</CardTitle>
                  <CardDescription className="text-base">
                    We believe complex problems deserve simple solutions. Our platform is designed 
                    to be intuitive and easy to use.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Reliability */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Reliability</CardTitle>
                  <CardDescription className="text-base">
                    Your payroll runs on time, every time. We maintain 99.9% uptime and ensure 
                    your employees are always paid correctly.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Compliance */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Compliance</CardTitle>
                  <CardDescription className="text-base">
                    We stay ahead of Dutch labor law changes so you don't have to. 
                    Full compliance is built into every feature.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Innovation */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                    <Globe className="w-8 h-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">Innovation</CardTitle>
                  <CardDescription className="text-base">
                    We continuously improve our platform with the latest technology 
                    and user feedback to stay ahead of the curve.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Customer Focus */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-red-600" />
                  </div>
                  <CardTitle className="text-xl">Customer Focus</CardTitle>
                  <CardDescription className="text-base">
                    Our customers are at the heart of everything we do. We listen, 
                    learn, and build features that truly matter.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Transparency */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Transparency</CardTitle>
                  <CardDescription className="text-base">
                    No hidden fees, no surprises. We believe in clear pricing, 
                    honest communication, and open business practices.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 lg:p-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h3>
                <div className="space-y-6 text-gray-600">
                  <p>
                    SalarySync was born out of frustration with existing payroll solutions 
                    that were either too complex, too expensive, or simply not designed 
                    for the Dutch market.
                  </p>
                  <p>
                    Our founders, experienced entrepreneurs who had struggled with payroll 
                    challenges in their own businesses, decided to build the solution they 
                    wished existed.
                  </p>
                  <p>
                    Today, we're proud to serve hundreds of Dutch businesses, from startups 
                    to enterprises, helping them streamline their payroll operations and 
                    focus on what they do best.
                  </p>
                </div>
              </div>
              
              <div>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                  Built for the Dutch market
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Unlike generic payroll solutions, SalarySync is built from the ground up 
                  for Dutch businesses, with deep understanding of local regulations, 
                  tax requirements, and business practices.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Dutch Labor Law Expertise</h4>
                      <p className="text-gray-600">Our team includes legal experts who ensure full compliance with Dutch regulations.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Local Banking Integration</h4>
                      <p className="text-gray-600">Direct integration with major Dutch banks for seamless salary payments.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Dutch Language Support</h4>
                      <p className="text-gray-600">Full Dutch language support for employees and administrators.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Meet our team
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're a diverse team of engineers, designers, and payroll experts 
                passionate about solving complex problems with simple solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Team Member 1 */}
              <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">JD</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">John Doe</h3>
                <p className="text-blue-600 font-medium mb-3">CEO & Co-Founder</p>
                <p className="text-gray-600 text-sm">
                  Former startup founder with 15+ years of experience in Dutch business operations.
                </p>
              </div>

              {/* Team Member 2 */}
              <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">JS</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Jane Smith</h3>
                <p className="text-green-600 font-medium mb-3">CTO & Co-Founder</p>
                <p className="text-gray-600 text-sm">
                  Tech leader with expertise in building scalable SaaS platforms and fintech solutions.
                </p>
              </div>

              {/* Team Member 3 */}
              <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">MJ</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mike Johnson</h3>
                <p className="text-purple-600 font-medium mb-3">Head of Compliance</p>
                <p className="text-gray-600 text-sm">
                  Legal expert specializing in Dutch labor law and payroll regulations.
                </p>
              </div>

              {/* Team Member 4 */}
              <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">SB</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sarah Brown</h3>
                <p className="text-orange-600 font-medium mb-3">Head of Customer Success</p>
                <p className="text-gray-600 text-sm">
                  Customer advocate ensuring every client gets maximum value from our platform.
                </p>
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
              Ready to join our mission?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Experience the difference of payroll software built specifically for Dutch businesses. 
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
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
                  Contact Us
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

