
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  HelpCircle,
  Search,
  MessageCircle,
  Book,
  Video,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calculator,
  FileText,
  Settings,
  CreditCard,
  Shield,
  Zap
} from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
  tags: string[]
  popular?: boolean
}

const faqData: FAQItem[] = [
  {
    id: "getting-started-1",
    category: "Getting Started",
    question: "How do I add my first employee to the system?",
    answer: "Adding your first employee is straightforward and sets the foundation for your payroll operations. Start by navigating to 'People > Employees' in the sidebar menu. Click the prominent 'Add Employee' button to open the employee registration form. You'll need to provide essential information including the employee's full legal name (as it appears on their ID), email address for communication, base salary amount, and their assigned department. Choose the appropriate employment type - select 'monthly' for salaried employees or 'hourly' for those paid by the hour. Additional required fields include the employee's BSN (Burgerservicenummer), IBAN for salary payments, and their official start date. Once you save the employee record, they'll immediately become available for payroll processing and will appear in your employee directory.",
    tags: ["employees", "setup", "onboarding"],
    popular: true
  },
  {
    id: "getting-started-2",
    category: "Getting Started",
    question: "How do I process my first payroll?",
    answer: "Processing your first payroll is a milestone moment that demonstrates SalarySync's powerful automation capabilities. Begin by ensuring you have at least one employee added to your system with complete information including salary details and bank account information. Navigate to 'Payroll Operations > Run Payroll' where you'll find an intuitive interface designed to guide you through each step. Select your desired pay period - whether monthly, bi-weekly, or custom - and choose which employees to include in this payroll run. The system will automatically calculate gross salaries based on the employment type and hours worked. What makes SalarySync exceptional is its automatic calculation of Dutch tax obligations including income tax (loonheffing), social security contributions (sociale premies), pension contributions, and any applicable allowances or deductions. Review all calculated amounts carefully, as the system provides a detailed breakdown showing gross pay, deductions, and net pay for each employee. Once you're satisfied with the calculations, confirm and finalize the payroll. The system will generate payslips, update your financial records, and prepare all necessary documentation for tax reporting.",
    tags: ["payroll", "processing", "taxes"],
    popular: true
  },
  {
    id: "payroll-1",
    category: "Payroll Management",
    question: "How are Dutch taxes and social contributions calculated?",
    answer: "SalarySync's tax calculation engine is built specifically for the Dutch market and incorporates the latest regulations from the Belastingdienst and UWV. The system automatically applies the current income tax brackets (loonheffing) which vary based on the employee's total annual income, age, and personal circumstances. Social security contributions include several components: AOW (state pension), WLZ (long-term care), and various unemployment and disability insurance premiums. The system also calculates employer contributions including WW (unemployment insurance), WIA (disability insurance), and sector-specific premiums. For employees over 65, different rates apply, and the system automatically adjusts calculations accordingly. SalarySync stays current with annual rate changes, tax-free allowances, and special provisions such as the 30% ruling for international employees. The system also handles complex scenarios like part-time work, multiple employers, and seasonal employment patterns. All calculations are transparent and detailed, showing exactly how each deduction is computed, ensuring full compliance with Dutch payroll legislation.",
    tags: ["taxes", "calculations", "dutch-law", "compliance"],
    popular: true
  },
  {
    id: "payroll-2",
    category: "Payroll Management",
    question: "Can I process overtime and bonuses?",
    answer: "Absolutely! SalarySync provides comprehensive support for overtime calculations and bonus payments, ensuring accurate tax treatment for both. When processing overtime, you can input additional hours worked beyond the standard contract hours. The system automatically applies the appropriate overtime rates - typically 125% for the first few hours and 150% for extended overtime, though these rates can be customized based on your company's policies or collective bargaining agreements. For bonus payments, SalarySync handles various types including performance bonuses, holiday bonuses (like the traditional 13th month), and one-time rewards. The system correctly applies tax withholding to bonuses, which may be subject to different rates than regular salary. Both overtime and bonuses are clearly itemized on employee payslips and integrated into your analytics dashboard, allowing you to track these additional costs and their impact on your overall payroll expenses. The system also ensures that overtime and bonuses are properly reported to tax authorities and included in annual tax documentation.",
    tags: ["overtime", "bonuses", "payslip", "tax-treatment"]
  },
  {
    id: "payroll-3",
    category: "Payroll Management",
    question: "How do I handle sick leave and vacation pay?",
    answer: "SalarySync's leave management system is designed around Dutch employment law requirements, making compliance effortless. Navigate to 'People > Leave Management' to access comprehensive leave tracking tools. For vacation leave, the system automatically calculates vacation pay (vakantiegeld) at 8% of the employee's annual salary, as mandated by Dutch law. This vacation allowance is typically paid in May, and SalarySync can automate this process or allow manual triggering based on your preferences. Sick leave is handled according to Dutch regulations where employees receive continued pay during illness periods. The system tracks sick leave duration and automatically applies the correct payment calculations, including the transition from employer responsibility to UWV coverage for extended illnesses. You can record leave requests, track remaining vacation days, and generate reports for compliance purposes. The system also handles special leave types such as maternity/paternity leave, study leave, and emergency leave, each with their specific payment rules and documentation requirements.",
    tags: ["leave", "vacation", "sick-pay", "dutch-law", "compliance"]
  },
  {
    id: "employees-1",
    category: "Employee Management",
    question: "What employee information do I need to collect?",
    answer: "Comprehensive employee data collection is crucial for accurate payroll processing and legal compliance in the Netherlands. Essential information includes the employee's full legal name exactly as it appears on their official identification, their BSN (Burgerservicenummer) which is required for all tax and social security calculations, and their complete residential address for tax purposes. Financial information requirements include the employee's IBAN bank account number for salary payments, their gross salary amount, and employment classification (monthly salary, hourly wage, or contract basis). You'll also need their official start date, assigned department or cost center, and employment type designation. Additional important details include emergency contact information, any special tax circumstances (such as 30% ruling eligibility), pension scheme participation, and benefit elections. For international employees, additional documentation may be required including work permits, visa status, and tax treaty considerations. SalarySync's employee profile system guides you through collecting all necessary information while maintaining GDPR compliance for data protection.",
    tags: ["employee-data", "requirements", "bsn", "gdpr", "compliance"]
  },
  {
    id: "employees-2",
    category: "Employee Management",
    question: "How do I update employee salary or department?",
    answer: "Go to 'People > Employees', find the employee, and click 'Edit'. You can update salary, department, employment type, and other details. Changes will take effect from the next payroll cycle unless you specify a different effective date.",
    tags: ["employee-updates", "salary-changes"]
  },
  {
    id: "reports-1",
    category: "Reports & Analytics",
    question: "What reports can I generate?",
    answer: "SalarySync provides comprehensive reports including payroll summaries, tax reports for the Belastingdienst, employee cost analysis, department analytics, and year-end reports. All reports can be exported to PDF or Excel format.",
    tags: ["reports", "analytics", "export"]
  },
  {
    id: "reports-2",
    category: "Reports & Analytics",
    question: "How do I view my payroll analytics?",
    answer: "Visit the 'Analytics' page to see detailed insights including payroll trends, cost breakdowns by department, employee satisfaction metrics, and AI-powered insights. You can switch between demo data and live data using the toggle.",
    tags: ["analytics", "insights", "trends"]
  },
  {
    id: "compliance-1",
    category: "Compliance & Legal",
    question: "Is SalarySync compliant with Dutch payroll laws?",
    answer: "Yes, SalarySync is designed to comply with Dutch payroll regulations including tax calculations, social security contributions, minimum wage requirements, and reporting obligations to the Belastingdienst and UWV.",
    tags: ["compliance", "dutch-law", "legal"]
  },
  {
    id: "compliance-2",
    category: "Compliance & Legal",
    question: "How do I submit reports to the Belastingdienst?",
    answer: "SalarySync generates all necessary reports for tax authorities. Go to 'Reports' section, select the appropriate tax report, and export it in the required format. The system ensures all calculations meet Belastingdienst requirements.",
    tags: ["belastingdienst", "tax-reports", "submission"]
  },
  {
    id: "billing-1",
    category: "Billing & Subscription",
    question: "What are the pricing plans available?",
    answer: "SalarySync offers flexible pricing based on the number of employees. Plans include essential features for small businesses and advanced analytics for larger organizations. Visit 'Subscription & Billing' for current pricing and to upgrade your plan.",
    tags: ["pricing", "subscription", "billing"]
  },
  {
    id: "billing-2",
    category: "Billing & Subscription",
    question: "How do I upgrade or downgrade my subscription?",
    answer: "Go to 'Subscription & Billing' in the sidebar, select your desired plan, and follow the upgrade process. Changes take effect immediately, and billing is prorated for the current period.",
    tags: ["upgrade", "subscription-changes"]
  },
  {
    id: "technical-1",
    category: "Technical Support",
    question: "Why am I seeing demo data instead of my real data?",
    answer: "If you're seeing demo data, make sure you've switched to 'Live Data' mode using the toggle in the top navigation. Demo mode shows sample data for exploration, while live mode shows your actual payroll information.",
    tags: ["demo-data", "live-data", "troubleshooting"]
  },
  {
    id: "technical-2",
    category: "Technical Support",
    question: "How do I reset my password?",
    answer: "Click 'Forgot Password' on the login page, enter your email address, and follow the instructions in the reset email. If you don't receive the email, check your spam folder or contact support.",
    tags: ["password", "login", "account"]
  }
]

const categories = [
  { name: "All", icon: HelpCircle, count: faqData.length },
  { name: "Getting Started", icon: Zap, count: faqData.filter(item => item.category === "Getting Started").length },
  { name: "Payroll Management", icon: Calculator, count: faqData.filter(item => item.category === "Payroll Management").length },
  { name: "Employee Management", icon: Users, count: faqData.filter(item => item.category === "Employee Management").length },
  { name: "Reports & Analytics", icon: FileText, count: faqData.filter(item => item.category === "Reports & Analytics").length },
  { name: "Compliance & Legal", icon: Shield, count: faqData.filter(item => item.category === "Compliance & Legal").length },
  { name: "Billing & Subscription", icon: CreditCard, count: faqData.filter(item => item.category === "Billing & Subscription").length },
  { name: "Technical Support", icon: Settings, count: faqData.filter(item => item.category === "Technical Support").length }
]

function HelpSupportContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [openItems, setOpenItems] = useState<string[]>([])

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const popularFAQs = faqData.filter(item => item.popular)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600 mt-1">Find answers to common questions and get help with SalarySync</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>24/7 Support</span>
          </Badge>
          <Button variant="outline" className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span>Contact Support</span>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Video className="w-5 h-5 text-blue-600" />
              <span>Video Tutorials</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Watch step-by-step guides for common tasks</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Book className="w-5 h-5 text-green-600" />
              <span>Documentation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Comprehensive guides and API documentation</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              <span>Live Chat</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Get instant help from our support team</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search Help Articles</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search for help articles, features, or common issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Popular FAQs */}
      {searchQuery === "" && selectedCategory === "All" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Popular Questions</span>
            </CardTitle>
            <CardDescription>Most frequently asked questions by our users</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
              {popularFAQs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-2">
                      <span>{faq.question}</span>
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <p className="text-gray-700">{faq.answer}</p>
                      <div className="flex flex-wrap gap-1">
                        {faq.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Categories and FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* FAQ Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCategory === "All" ? "All Questions" : selectedCategory}
              </CardTitle>
              <CardDescription>
                {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFAQs.length > 0 ? (
                <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
                  {filteredFAQs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center space-x-2">
                          <span>{faq.question}</span>
                          {faq.popular && (
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <p className="text-gray-700">{faq.answer}</p>
                          <div className="flex flex-wrap gap-1">
                            {faq.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search terms or browse different categories
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Support */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <MessageCircle className="w-5 h-5" />
            <span>Still Need Help?</span>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Our support team is here to help you with any questions or issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-gray-600">support@salarysync.nl</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
              <Phone className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Phone Support</p>
                <p className="text-sm text-gray-600">+31 20 123 4567</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Button className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Start Live Chat</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Send Email</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function EnhancedHelpSupportPage() {
  return (
    <DashboardLayout>
      <HelpSupportContent />
    </DashboardLayout>
  )
}


