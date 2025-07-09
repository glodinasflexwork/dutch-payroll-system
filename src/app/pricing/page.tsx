"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Zap,
  Crown,
  Rocket
} from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/dashboard")
    }
  }, [status, session, router])

  // Fetch pricing plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // For now, use static plans that match the database structure
        const staticPlans = [
          {
            id: "starter",
            name: "Starter",
            price: 2900, // €29.00 in cents
            maxEmployees: 10,
            maxPayrolls: 12,
            features: {
              employeeManagement: true,
              basicPayroll: true,
              basicReporting: true,
              emailSupport: true,
              dutchCompliance: true,
              multiCompany: false,
              advancedReporting: false,
              apiAccess: false,
              prioritySupport: false,
              customIntegrations: false
            },
            popular: false,
            description: "Perfect for small businesses getting started with payroll"
          },
          {
            id: "professional",
            name: "Professional", 
            price: 7900, // €79.00 in cents - matches database and Stripe
            maxEmployees: 50,
            maxPayrolls: null, // unlimited
            features: {
              employeeManagement: true,
              basicPayroll: true,
              basicReporting: true,
              emailSupport: true,
              dutchCompliance: true,
              multiCompany: true,
              advancedReporting: true,
              apiAccess: true,
              prioritySupport: true,
              customIntegrations: false
            },
            popular: true,
            description: "Ideal for growing businesses and HR professionals"
          },
          {
            id: "enterprise",
            name: "Enterprise",
            price: 19900, // €199.00 in cents - matches database and Stripe
            maxEmployees: null, // unlimited
            maxPayrolls: null, // unlimited
            features: {
              employeeManagement: true,
              basicPayroll: true,
              basicReporting: true,
              emailSupport: true,
              dutchCompliance: true,
              multiCompany: true,
              advancedReporting: true,
              apiAccess: true,
              prioritySupport: true,
              customIntegrations: true
            },
            popular: false,
            description: "Complete solution for accountants and large organizations"
          }
        ]
        setPlans(staticPlans)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching plans:", error)
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  // Show loading state while checking authentication
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Only show pricing page to unauthenticated users
  if (status === "authenticated") {
    return null
  }

  const formatPrice = (priceInCents) => {
    return `€${(priceInCents / 100).toFixed(0)}`
  }

  const getPlanIcon = (planName) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return <Zap className="w-6 h-6" />
      case 'professional':
        return <Rocket className="w-6 h-6" />
      case 'enterprise':
        return <Crown className="w-6 h-6" />
      default:
        return <Calculator className="w-6 h-6" />
    }
  }

  const getFeatureList = (features) => {
    const featureMap = {
      employeeManagement: "Employee Management",
      basicPayroll: "Automated Payroll Processing",
      basicReporting: "Basic Reports & Analytics",
      emailSupport: "Email Support",
      dutchCompliance: "Dutch Tax Compliance",
      multiCompany: "Multi-Company Management",
      advancedReporting: "Advanced Reporting & Analytics",
      apiAccess: "API Access",
      prioritySupport: "Priority Support",
      customIntegrations: "Custom Integrations"
    }

    return Object.entries(features)
      .filter(([key, value]) => value === true)
      .map(([key]) => featureMap[key])
      .filter(Boolean)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SalarySync</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
                Features
              </Link>
              <Link href="/pricing" className="text-blue-600 font-medium">
                Pricing
              </Link>
              <Link href="/#about" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
                About
              </Link>
              <Link href="/#contact" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
                Contact
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Simple, Transparent
              <span className="text-blue-600 block">Pricing</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Choose the plan that fits your business needs. All plans include a 14-day free trial 
              with full access to features.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative border-2 transition-all duration-300 hover:shadow-xl ${
                    plan.popular 
                      ? 'border-blue-500 shadow-lg scale-105' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      plan.popular ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <div className={plan.popular ? 'text-blue-600' : 'text-gray-600'}>
                        {getPlanIcon(plan.name)}
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-6">
                      <div className="text-4xl font-bold text-gray-900">
                        {formatPrice(plan.price)}
                        <span className="text-lg font-normal text-gray-600">/month</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {plan.maxEmployees ? `Up to ${plan.maxEmployees} employees` : 'Unlimited employees'}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4 mb-8">
                      {getFeatureList(plan.features).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link href="/auth/register" className="block">
                      <Button 
                        className={`w-full py-3 text-lg font-semibold ${
                          plan.popular 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        }`}
                      >
                        Start Free Trial
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about our pricing and plans
              </p>
            </div>

            <div className="space-y-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Can I change my plan at any time?
                  </h3>
                  <p className="text-gray-600">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                    and we'll prorate the billing accordingly.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What happens during the free trial?
                  </h3>
                  <p className="text-gray-600">
                    You get full access to all features of your chosen plan for 14 days. 
                    No credit card required to start, and you can cancel anytime during the trial.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Is my data secure and GDPR compliant?
                  </h3>
                  <p className="text-gray-600">
                    Absolutely. We use bank-level security with 256-bit SSL encryption and are fully GDPR compliant. 
                    Your data is stored in secure Dutch data centers.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Do you offer support for accountants managing multiple clients?
                  </h3>
                  <p className="text-gray-600">
                    Yes! Our Professional and Enterprise plans include multi-company management, 
                    perfect for accountants and bookkeepers managing multiple client payrolls.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of Dutch businesses who trust SalarySync for their payroll needs.
            </p>
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Start Your Free Trial Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">SalarySync</span>
              </div>
              <p className="text-gray-400 mb-4">
                Professional Dutch payroll solutions for modern businesses.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#security" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/#about" className="hover:text-white transition-colors">About</Link></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#api" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SalarySync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

