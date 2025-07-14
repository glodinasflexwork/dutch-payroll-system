"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UnifiedNavigation } from "@/components/layout/unified-navigation"
import { UnifiedFooter } from "@/components/layout/unified-footer"
import { Badge } from "@/components/ui/badge"
import { 
  Calculator, 
  Users, 
  FileText, 
  Shield, 
  Clock, 
  TrendingUp,
  CheckCircle,
  Star,
  Building2,
  Euro,
  ArrowRight,
  Play,
  Banknote,
  BarChart3,
  Globe,
  Smartphone
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Only redirect authenticated users from the root page to dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Check if we're on the exact root path
      if (window.location.pathname === "/") {
        router.push("/dashboard")
      }
    }
  }, [status, session, router])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

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
                <Calculator className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Professional payroll for Dutch businesses
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed mb-10 max-w-4xl mx-auto">
                Streamline your payroll process, ensure compliance, and pay your team with confidence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 transition-colors duration-200 font-semibold px-8 py-4 text-lg shadow-lg">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold">
                    Schedule Demo
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Automated Dutch payroll calculations and tax compliance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Employee self-service portal and digital payslips</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Seamless integration with Dutch banking systems</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="bg-blue-100 text-blue-800 mb-4">Core Features</Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Everything you need for payroll success
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From automated calculations to compliance reporting, SalarySync handles every aspect of Dutch payroll management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Automated Calculations</h3>
                <p className="text-gray-600">
                  Complex Dutch payroll calculations handled automatically with built-in tax tables and compliance rules.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Employee Management</h3>
                <p className="text-gray-600">
                  Complete employee lifecycle management from onboarding to offboarding with digital workflows.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Compliance & Reporting</h3>
                <p className="text-gray-600">
                  Stay compliant with Dutch labor laws and generate required reports automatically.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <Smartphone className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Employee Self-Service</h3>
                <p className="text-gray-600">
                  Empower employees with mobile-friendly self-service portal for all their payroll needs.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                  <Banknote className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Banking Integration</h3>
                <p className="text-gray-600">
                  Direct integration with Dutch banks for seamless salary payments and reconciliation.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics & Insights</h3>
                <p className="text-gray-600">
                  Comprehensive analytics and reporting to understand your payroll costs and trends.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Trusted by Dutch businesses
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join hundreds of companies who have streamlined their payroll with SalarySync.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "SalarySync has completely transformed our payroll process. What used to take days now takes minutes."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">MJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Maria Janssen</p>
                    <p className="text-gray-500 text-sm">HR Director, TechCorp</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "The compliance features give us peace of mind. We never worry about Dutch tax regulations anymore."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-semibold">PV</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Pieter van Berg</p>
                    <p className="text-gray-500 text-sm">CFO, GrowthCo</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "Our employees love the self-service portal. It's reduced our HR workload significantly."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-semibold">AD</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Anna de Wit</p>
                    <p className="text-gray-500 text-sm">Operations Manager, InnovateNL</p>
                  </div>
                </div>
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
              Ready to streamline your payroll?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join hundreds of Dutch businesses who trust SalarySync with their payroll. 
              Start your free trial today and experience the difference.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 transition-colors duration-200 font-semibold px-8 py-4 text-lg shadow-lg">
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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-100">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <UnifiedFooter />
    </div>
  )
}

