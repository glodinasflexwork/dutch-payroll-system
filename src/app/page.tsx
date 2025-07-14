"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
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
  Menu,
  X,
  Banknote,
  BarChart3,
  Globe,
  Smartphone
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/dashboard")
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

  // Only show landing page to unauthenticated users
  if (status === "authenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Ageras Style */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">SalarySync</span>
            </div>

            {/* Desktop Navigation */}
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
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm">
                About
              </Link>
            </nav>

            {/* CTA Buttons */}
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

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col space-y-4">
                <Link href="/features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Features</Link>
                <Link href="/solutions" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Solutions</Link>
                <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Pricing</Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">About</Link>
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

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section - Ageras Inspired */}
        <section className="relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"></div>
          
          {/* Organic Background Shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-20 transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full opacity-20 transform -translate-x-16 translate-y-16"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Hero Content */}
              <div className="text-white">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                  Professional payroll 
                  <span className="block">for Dutch businesses</span>
                </h1>
                <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed mb-8">
                  Streamline your payroll process, ensure compliance, and pay your team with confidence.
                </p>
                
                {/* Key Benefits */}
                <div className="space-y-4 mb-10">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-lg text-blue-50">Automated Dutch payroll calculations and tax compliance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-lg text-blue-50">Employee self-service portal and digital payslips</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-lg text-blue-50">Seamless integration with Dutch banking systems</span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth/signup">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 transition-colors duration-200 font-semibold px-8 py-4 text-lg shadow-lg">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
                    <Play className="mr-2 w-5 h-5" />
                    Watch Demo
                  </Button>
                </div>
              </div>

              {/* Hero Visual */}
              <div className="relative">
                <div className="relative z-10">
                  {/* Dashboard Mockup */}
                  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <div className="ml-4 text-sm text-gray-600">SalarySync Dashboard</div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Payroll Overview</h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600 font-medium">All systems operational</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">€45,280</div>
                          <div className="text-sm text-blue-600">Monthly Payroll</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">24</div>
                          <div className="text-sm text-green-600">Employees</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Process Payroll</span>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <FileText className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Generate Reports</span>
                          </div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  ✓ Payment completed!
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  💰 €2,850 saved this month
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Feature Section 1 - Automated Payroll Processing */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                  Calculate complex Dutch payroll automatically
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Built-in tax tables, holiday pay calculations, and social security contributions. 
                  Our system handles all the complexity of Dutch payroll regulations so you don't have to.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Automatic Tax Calculations</h4>
                      <p className="text-gray-600">Income tax, social security, and pension contributions calculated automatically</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Holiday Pay & Bonuses</h4>
                      <p className="text-gray-600">Automatic calculation of vacation allowance and 13th month payments</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Compliance Guaranteed</h4>
                      <p className="text-gray-600">Always up-to-date with the latest Dutch labor laws and tax regulations</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8">
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Payroll Calculation</h3>
                      <Badge className="bg-green-100 text-green-800">Automated</Badge>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Gross Salary</span>
                        <span className="font-semibold text-gray-900">€3,500.00</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-sm text-gray-600">Income Tax</span>
                        <span className="font-semibold text-red-600">-€892.50</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-sm text-gray-600">Social Security</span>
                        <span className="font-semibold text-red-600">-€315.00</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-2 border-green-200">
                        <span className="text-sm font-semibold text-gray-900">Net Salary</span>
                        <span className="font-bold text-green-600 text-lg">€2,292.50</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 2 - Employee Self-Service */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="lg:order-2">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                  Empower employees with self-service portal
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Give your team access to their payslips, leave requests, and personal information 
                  through our intuitive mobile-friendly employee portal.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Smartphone className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Digital Payslips</h4>
                      <p className="text-gray-600">Secure access to current and historical payslips anytime, anywhere</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Leave Management</h4>
                      <p className="text-gray-600">Request time off, track balances, and manage approvals seamlessly</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Personal Information</h4>
                      <p className="text-gray-600">Update contact details, banking information, and tax preferences</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:order-1 relative">
                <div className="relative">
                  {/* Mobile Mockup */}
                  <div className="mx-auto w-80 h-96 bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="bg-gray-800 h-6 flex items-center justify-center">
                      <div className="w-16 h-1 bg-gray-600 rounded-full"></div>
                    </div>
                    <div className="bg-blue-600 px-6 py-8 text-white">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Welcome back, Sarah!</h3>
                          <p className="text-blue-100 text-sm">Employee Portal</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 h-full">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-gray-900">Latest Payslip</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-gray-900">Request Leave</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-gray-900">Time Tracking</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating notification */}
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg">
                    ✓ Leave approved
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 3 - Compliance & Reporting */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                  Stay compliant with automated reporting
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Generate required reports for tax authorities automatically. Our system ensures 
                  you're always compliant with Dutch labor laws and regulations.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Tax Authority Reports</h4>
                      <p className="text-gray-600">Automatic generation of required tax reports and submissions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FileText className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Audit Trail</h4>
                      <p className="text-gray-600">Complete audit trail for all payroll transactions and changes</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Analytics Dashboard</h4>
                      <p className="text-gray-600">Comprehensive insights into payroll costs and trends</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8">
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Compliance Dashboard</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600 font-medium">All compliant</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">100%</div>
                        <div className="text-sm text-green-600">Tax Compliance</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">24</div>
                        <div className="text-sm text-blue-600">Reports Generated</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-900">Monthly Tax Report</span>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-900">Social Security Filing</span>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-900">Annual Report</span>
                        <Clock className="w-5 h-5 text-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Feature Section 4 - Multi-Company Management */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="lg:order-2">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                  Manage multiple companies with ease
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Perfect for accountants and business owners managing multiple entities. 
                  Switch between companies seamlessly with role-based access control.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Building2 className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Company Switching</h4>
                      <p className="text-gray-600">Seamlessly switch between multiple companies from one dashboard</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Role-Based Access</h4>
                      <p className="text-gray-600">Different permission levels for owners, admins, HR, and employees</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Team Invitations</h4>
                      <p className="text-gray-600">Invite team members and assign appropriate roles for each company</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:order-1 relative">
                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-3xl p-8">
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Company Selector</h3>
                      <Badge className="bg-purple-100 text-purple-800">Multi-tenant</Badge>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Tech Solutions B.V.</div>
                            <div className="text-sm text-gray-600">Owner • 24 employees</div>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Marketing Plus</div>
                            <div className="text-sm text-gray-600">Admin • 12 employees</div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Consulting Group</div>
                            <div className="text-sm text-gray-600">HR Manager • 8 employees</div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      <Building2 className="w-4 h-4 mr-2" />
                      Add New Company
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 5 - Banking Integration */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                  Process payments with one click
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Direct integration with Dutch banks for seamless salary payments. 
                  SEPA transfers, automated reconciliation, and complete payment tracking.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Banknote className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">SEPA Integration</h4>
                      <p className="text-gray-600">Direct bank transfers to employee accounts with full SEPA compliance</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Automated Reconciliation</h4>
                      <p className="text-gray-600">Automatic matching of payments with payroll records</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Bank-Level Security</h4>
                      <p className="text-gray-600">Enterprise-grade security for all financial transactions</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8">
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Payment Processing</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-600 font-medium">Processing...</span>
                      </div>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">Sarah Johnson</span>
                        </div>
                        <span className="text-sm font-semibold text-green-600">€2,850</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">Mike van Berg</span>
                        </div>
                        <span className="text-sm font-semibold text-green-600">€3,200</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">Emma de Vries</span>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">€2,950</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total Amount</span>
                        <span className="text-xl font-bold text-gray-900">€45,280</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">24 employees • Processing to ING Bank</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 6 - Multi-Currency & Language */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="lg:order-2">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                  Global workforce, local compliance
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Support for international employees with multi-currency payments and 
                  multi-language interfaces, while maintaining Dutch compliance standards.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Euro className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Multi-Currency Support</h4>
                      <p className="text-gray-600">Handle payments in EUR, USD, GBP and other major currencies</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Globe className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Multi-Language Interface</h4>
                      <p className="text-gray-600">Available in Dutch, English, and other European languages</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Local Compliance</h4>
                      <p className="text-gray-600">Maintain Dutch tax and labor law compliance for all employees</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:order-1 relative">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8">
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">International Payroll</h3>
                      <div className="flex space-x-2">
                        <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">EUR</div>
                        <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">USD</div>
                        <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">GBP</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            NL
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Amsterdam Office</div>
                            <div className="text-sm text-gray-600">18 employees</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">€32,400</div>
                          <div className="text-sm text-gray-600">EUR</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            US
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Remote Team</div>
                            <div className="text-sm text-gray-600">4 employees</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">$8,200</div>
                          <div className="text-sm text-gray-600">USD</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            UK
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">London Contractors</div>
                            <div className="text-sm text-gray-600">2 employees</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">£4,800</div>
                          <div className="text-sm text-gray-600">GBP</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-10 transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full opacity-10 transform -translate-x-16 translate-y-16"></div>
          
          <div className="max-w-4xl mx-auto text-center relative">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to streamline your payroll?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join hundreds of Dutch businesses who trust SalarySync for their payroll needs. 
              Start your free trial today and experience the difference.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 transition-colors duration-200 font-semibold px-8 py-4 text-lg shadow-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
                Schedule Demo
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-blue-100">
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

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Company Info */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold">SalarySync</span>
                </div>
                <p className="text-gray-400 mb-6 max-w-md">
                  Professional Dutch payroll solutions for modern businesses. 
                  Streamline your payroll process with confidence and compliance.
                </p>
                <div className="text-sm text-gray-500">
                  SalarySync redefines payroll management for Dutch businesses by integrating 
                  compliance, automation, and user experience in a single platform.
                </div>
              </div>
              
              {/* Products */}
              <div>
                <h4 className="font-semibold text-white mb-4">Products</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Payroll Processing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Employee Portal</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Compliance Reports</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Banking Integration</a></li>
                </ul>
              </div>
              
              {/* Resources */}
              <div>
                <h4 className="font-semibold text-white mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Status Page</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm">
                © 2024 SalarySync. All rights reserved.
              </div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

