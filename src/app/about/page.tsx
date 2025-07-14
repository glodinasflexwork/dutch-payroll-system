"use client"

import { Button } from "@/components/ui/button"
import { UnifiedNavigation } from "@/components/layout/unified-navigation"
import { UnifiedFooter } from "@/components/layout/unified-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight,
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

export default function AboutPage() {
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
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                We are passionate about simplifying payroll
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed mb-10 max-w-4xl mx-auto">
                Founded in 2020, SalarySync has been dedicated to making Dutch payroll management effortless for businesses of all sizes.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-blue-50 rounded-3xl p-8">
                <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-lg text-gray-700">Happy Customers</div>
                <div className="text-sm text-gray-600 mt-2">Businesses trust us with their payroll</div>
              </div>
              <div className="bg-green-50 rounded-3xl p-8">
                <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
                <div className="text-lg text-gray-700">Accuracy Rate</div>
                <div className="text-sm text-gray-600 mt-2">Precise calculations every time</div>
              </div>
              <div className="bg-purple-50 rounded-3xl p-8">
                <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-lg text-gray-700">Support</div>
                <div className="text-sm text-gray-600 mt-2">Always here when you need us</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  To revolutionize payroll management in the Netherlands by providing businesses with 
                  intuitive, compliant, and efficient solutions that save time and reduce complexity.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We believe that payroll should be the least of your worries, allowing you to focus 
                  on what matters most - growing your business and taking care of your team.
                </p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <Globe className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  To become the leading payroll platform in Europe, setting the standard for 
                  innovation, compliance, and user experience in HR technology.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We envision a future where payroll management is completely automated, 
                  error-free, and seamlessly integrated with all business operations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">Our Story</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-12">
              SalarySync was born from the frustration of dealing with complex Dutch payroll regulations 
              and outdated software solutions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
              <div className="bg-blue-50 rounded-2xl p-6">
                <div className="text-2xl font-bold text-blue-600 mb-2">2020</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">Founded</div>
                <div className="text-gray-600">Started with a vision to simplify Dutch payroll</div>
              </div>
              
              <div className="bg-green-50 rounded-2xl p-6">
                <div className="text-2xl font-bold text-green-600 mb-2">2021</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">First Customers</div>
                <div className="text-gray-600">Launched with 50 early adopter businesses</div>
              </div>
              
              <div className="bg-purple-50 rounded-2xl p-6">
                <div className="text-2xl font-bold text-purple-600 mb-2">2023</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">Major Growth</div>
                <div className="text-gray-600">Reached 500+ customers and expanded features</div>
              </div>
              
              <div className="bg-orange-50 rounded-2xl p-6">
                <div className="text-2xl font-bold text-orange-600 mb-2">2024</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">Enterprise Ready</div>
                <div className="text-gray-600">Launched multi-company management platform</div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Our Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These core values guide everything we do and shape how we serve our customers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Trust & Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We handle your most sensitive data with the highest levels of security and transparency. 
                    Your trust is our foundation.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Precision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Every calculation, every report, every detail matters. We strive for 100% accuracy 
                    in everything we deliver.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Customer First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Your success is our success. We listen, adapt, and continuously improve based on 
                    your feedback and needs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
              Our diverse team of experts combines deep knowledge of Dutch payroll regulations 
              with cutting-edge technology expertise.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Engineering Team</h3>
                <p className="text-gray-600">Building robust, scalable solutions</p>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Award className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Compliance Experts</h3>
                <p className="text-gray-600">Ensuring legal accuracy and updates</p>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Zap className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Success</h3>
                <p className="text-gray-600">Supporting your payroll journey</p>
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
              Ready to join our growing community?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Experience the difference that passionate, expert-driven payroll management can make for your business.
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

