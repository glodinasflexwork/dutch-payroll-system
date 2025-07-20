import { UnifiedNavigation } from "@/components/layout/unified-navigation";
import { UnifiedFooter } from "@/components/layout/unified-footer";
import { Target, Users, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <UnifiedNavigation />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-slate-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">About SalarySync</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              We're on a mission to simplify payroll for Dutch businesses, making complex processes effortless and ensuring compliance every step of the way.
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <section className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Founded in 2020 by a team of payroll experts and technology enthusiasts, SalarySync was born from the frustration of dealing with outdated, complex payroll systems that didn't understand the unique needs of Dutch businesses.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  We recognized that small and medium-sized businesses in the Netherlands deserved better – a payroll solution that was not only compliant with Dutch regulations but also intuitive, efficient, and affordable.
                </p>
                <p className="text-lg text-gray-600">
                  Today, we're proud to serve hundreds of Dutch businesses, helping them streamline their payroll operations and focus on what they do best – growing their companies.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg h-96 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-6xl font-bold mb-2">500+</div>
                  <div className="text-xl">Businesses Trust Us</div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Simplicity</h3>
                <p className="text-gray-600">We believe payroll should be straightforward, not complicated. Our platform is designed with simplicity at its core.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Customer-Centric</h3>
                <p className="text-gray-600">Our customers are at the heart of everything we do. We listen, learn, and continuously improve based on their feedback.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Award className="w-12 h-12 text-blue-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Excellence</h3>
                <p className="text-gray-600">We strive for excellence in everything we do, from our technology to our customer service and compliance standards.</p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Sarah van der Berg</h3>
                <p className="text-blue-600 mb-3">CEO & Co-Founder</p>
                <p className="text-gray-600 text-sm">Former payroll consultant with 15+ years of experience in Dutch labor law and compliance.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Mark Jansen</h3>
                <p className="text-green-600 mb-3">CTO & Co-Founder</p>
                <p className="text-gray-600 text-sm">Technology leader with expertise in building scalable SaaS platforms and fintech solutions.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Lisa de Vries</h3>
                <p className="text-purple-600 mb-3">Head of Customer Success</p>
                <p className="text-gray-600 text-sm">Dedicated to ensuring our customers achieve success with their payroll operations and business goals.</p>
              </div>
            </div>
          </section>

          <section className="text-center bg-slate-50 p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Ready to Join Our Journey?</h2>
            <p className="text-lg text-slate-700 mb-8">Whether you're looking to streamline your payroll or join our growing team, we'd love to hear from you.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="bg-slate-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-slate-700 transition-colors inline-flex items-center justify-center">
                Try SalarySync <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/careers" className="border-2 border-slate-600 text-slate-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-slate-600 hover:text-white transition-colors inline-flex items-center justify-center">
                View Careers
              </Link>
            </div>
          </section>
        </main>
      </div>
      <UnifiedFooter />
    </>
  );
}

