import { UnifiedNavigation } from "@/components/layout/unified-navigation";
import { UnifiedFooter } from "@/components/layout/unified-footer";
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  return (
    <>
      <UnifiedNavigation />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">SalarySync Insights & Updates</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Stay informed with the latest payroll trends, Dutch labor law updates, and best practices for managing your workforce.
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Latest Articles</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              
              <article className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600"></div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>January 15, 2025</span>
                    <span className="mx-2">•</span>
                    <User className="w-4 h-4 mr-2" />
                    <span>Sarah van der Berg</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    2025 Dutch Payroll Changes: What Employers Need to Know
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Discover the key changes to Dutch payroll regulations for 2025, including updated tax brackets, minimum wage adjustments, and new compliance requirements.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-sm text-blue-600">Tax Updates</span>
                    </div>
                    <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
                      Read More <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </article>

              <article className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-green-500 to-green-600"></div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>January 10, 2025</span>
                    <span className="mx-2">•</span>
                    <User className="w-4 h-4 mr-2" />
                    <span>Mark Jansen</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    5 Ways to Streamline Your Payroll Process
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Learn practical tips and strategies to optimize your payroll operations, reduce errors, and save time with modern payroll technology.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-sm text-green-600">Best Practices</span>
                    </div>
                    <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
                      Read More <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </article>

              <article className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-purple-500 to-purple-600"></div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>January 5, 2025</span>
                    <span className="mx-2">•</span>
                    <User className="w-4 h-4 mr-2" />
                    <span>Lisa de Vries</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Understanding Dutch Employee Benefits and Allowances
                  </h3>
                  <p className="text-gray-600 mb-4">
                    A comprehensive guide to Dutch employee benefits, from holiday allowances to pension contributions, and how to manage them effectively.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-purple-600" />
                      <span className="text-sm text-purple-600">Employee Benefits</span>
                    </div>
                    <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
                      Read More <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </article>

              <article className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-orange-500 to-orange-600"></div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>December 28, 2024</span>
                    <span className="mx-2">•</span>
                    <User className="w-4 h-4 mr-2" />
                    <span>Tom Bakker</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Year-End Payroll Checklist for Dutch Businesses
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Ensure a smooth year-end close with our comprehensive checklist covering tax filings, annual statements, and preparation for the new year.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-orange-600" />
                      <span className="text-sm text-orange-600">Year-End</span>
                    </div>
                    <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
                      Read More <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </article>

              <article className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-red-500 to-red-600"></div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>December 20, 2024</span>
                    <span className="mx-2">•</span>
                    <User className="w-4 h-4 mr-2" />
                    <span>Emma Visser</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    GDPR Compliance in Payroll: Protecting Employee Data
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Learn how to ensure your payroll processes comply with GDPR requirements and protect sensitive employee information.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-sm text-red-600">Compliance</span>
                    </div>
                    <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
                      Read More <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </article>

              <article className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-teal-500 to-teal-600"></div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>December 15, 2024</span>
                    <span className="mx-2">•</span>
                    <User className="w-4 h-4 mr-2" />
                    <span>David Smit</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    The Future of Payroll: Automation and AI Trends
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Explore how artificial intelligence and automation are transforming payroll processing and what it means for Dutch businesses.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-teal-600" />
                      <span className="text-sm text-teal-600">Technology</span>
                    </div>
                    <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
                      Read More <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section className="text-center bg-blue-50 p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-blue-800 mb-6">Stay Updated</h2>
            <p className="text-lg text-blue-700 mb-8">Subscribe to our newsletter to receive the latest payroll insights and updates directly in your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Subscribe
              </button>
            </div>
          </section>
        </main>
      </div>
      <UnifiedFooter />
    </>
  );
}

