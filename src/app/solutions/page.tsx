"use client"

import { Button } from "@/components/ui/button"
import { UnifiedNavigation } from "@/components/layout/unified-navigation"
import { UnifiedFooter } from "@/components/layout/unified-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight,
  Building2,
  Users,
  Briefcase,
  Factory,
  GraduationCap,
  Heart,
  Truck,
  ShoppingBag,
  CheckCircle,
  Star
} from "lucide-react"
import Link from "next/link"

export default function SolutionsPage() {
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
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Solutions for Every Business
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed mb-10 max-w-4xl mx-auto">
                Tailored payroll solutions designed for your industry and business size. From startups to enterprises, we have you covered.
              </p>
            </div>
          </div>
        </section>

        {/* By Industry */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Industry-specific solutions
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Every industry has unique payroll requirements. Our solutions are tailored to meet the specific needs of your business sector.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Professional Services */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <Briefcase className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Professional Services</CardTitle>
                  <CardDescription className="text-base">
                    Perfect for consulting firms, law offices, accounting practices, and other professional service providers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Project-based billing integration</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Time tracking for billable hours</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Partner profit sharing</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Learn More
                  </Button>
                </CardContent>
              </Card>

              {/* Retail & E-commerce */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                    <ShoppingBag className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Retail & E-commerce</CardTitle>
                  <CardDescription className="text-base">
                    Designed for retail stores, online shops, and e-commerce businesses with variable schedules.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Shift-based payroll management</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Commission tracking</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Seasonal worker management</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Learn More
                  </Button>
                </CardContent>
              </Card>

              {/* Manufacturing */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                    <Factory className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Manufacturing</CardTitle>
                  <CardDescription className="text-base">
                    Tailored for manufacturing companies with complex shift patterns and production bonuses.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Shift differential calculations</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Production bonus tracking</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Safety compliance reporting</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Learn More
                  </Button>
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
                    Specialized for healthcare providers, clinics, and medical practices with complex scheduling.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">On-call pay calculations</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Medical license tracking</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Continuing education credits</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Learn More
                  </Button>
                </CardContent>
              </Card>

              {/* Education */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardHeader>
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                    <GraduationCap className="w-8 h-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Education</CardTitle>
                  <CardDescription className="text-base">
                    Built for schools, universities, and educational institutions with academic calendar needs.
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
                      <span className="text-gray-700">Substitute teacher management</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Summer break calculations</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    Learn More
                  </Button>
                </CardContent>
              </Card>

              {/* Transportation */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardHeader>
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                    <Truck className="w-8 h-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">Transportation</CardTitle>
                  <CardDescription className="text-base">
                    Perfect for logistics companies, delivery services, and transportation providers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Mileage-based compensation</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Route efficiency bonuses</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Driver certification tracking</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* By Company Size */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Solutions by company size
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Whether you're a startup or an enterprise, we have the right solution to scale with your business.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Startups */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl">Startups</CardTitle>
                  <CardDescription className="text-lg">1-10 employees</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">€29</div>
                    <div className="text-gray-600">per employee/month</div>
                  </div>
                  <ul className="text-left space-y-3 mb-6">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Basic payroll processing</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Employee self-service</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Tax compliance</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Email support</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>

              {/* Growing Companies */}
              <Card className="border-0 shadow-xl border-2 border-blue-200 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                </div>
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-10 h-10 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">Growing Companies</CardTitle>
                  <CardDescription className="text-lg">11-100 employees</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">€39</div>
                    <div className="text-gray-600">per employee/month</div>
                  </div>
                  <ul className="text-left space-y-3 mb-6">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">Everything in Startup</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">Advanced reporting</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">API access</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">Priority support</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Star className="w-10 h-10 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <CardDescription className="text-lg">100+ employees</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">Custom</div>
                    <div className="text-gray-600">pricing available</div>
                  </div>
                  <ul className="text-left space-y-3 mb-6">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">Everything in Growing</span>
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
                  </ul>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Contact Sales
                  </Button>
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
              Find the perfect solution for your business
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Not sure which solution is right for you? Our team can help you find the perfect fit for your business needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold">
                  Talk to Sales
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

