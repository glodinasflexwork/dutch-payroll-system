import { Target, Users, Award, Heart, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">About SalarySync</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            We're on a mission to simplify Dutch payroll for businesses of all sizes, combining cutting-edge technology with deep local expertise to deliver exceptional results.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2022 in Amsterdam, SalarySync was born from a simple observation: Dutch payroll was unnecessarily complex and time-consuming for businesses. Our founders, experienced entrepreneurs with backgrounds in fintech and HR technology, recognized the need for a modern, intuitive solution that could handle the intricacies of Dutch labor law while remaining accessible to businesses of all sizes.
              </p>
              <p className="text-lg text-gray-600">
                Today, we serve hundreds of Dutch businesses, from innovative startups to established enterprises, helping them streamline their payroll operations and focus on what they do best – growing their business.
              </p>
            </div>
            <div className="bg-indigo-100 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-indigo-800 mb-4">By the Numbers</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-700">500+</div>
                  <div className="text-indigo-600">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-700">50,000+</div>
                  <div className="text-indigo-600">Payslips Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-700">99.9%</div>
                  <div className="text-indigo-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-700">24/7</div>
                  <div className="text-indigo-600">Support</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Our Mission & Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Target className="w-12 h-12 text-indigo-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600">To empower Dutch businesses with simple, reliable, and compliant payroll solutions that save time and reduce complexity.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Users className="w-12 h-12 text-indigo-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Customer First</h3>
              <p className="text-gray-600">Every decision we make is guided by what's best for our customers and their success.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Award className="w-12 h-12 text-indigo-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Excellence</h3>
              <p className="text-gray-600">We strive for excellence in everything we do, from product development to customer support.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Heart className="w-12 h-12 text-indigo-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Integrity</h3>
              <p className="text-gray-600">We operate with transparency, honesty, and the highest ethical standards in all our relationships.</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Why Choose SalarySync?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Dutch Expertise</h3>
              <p className="text-gray-600">Our team includes certified Dutch payroll specialists who understand the nuances of local labor law, tax regulations, and collective agreements (CAO).</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Modern Technology</h3>
              <p className="text-gray-600">Built with the latest cloud technologies, our platform is secure, scalable, and designed for the modern workplace.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Dedicated Support</h3>
              <p className="text-gray-600">Our customer success team is committed to your success, providing personalized support and guidance every step of the way.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Continuous Innovation</h3>
              <p className="text-gray-600">We continuously evolve our platform based on customer feedback and changing regulations to ensure you always have the best tools available.</p>
            </div>
          </div>
        </section>

        <section className="text-center bg-indigo-50 p-12 rounded-lg">
          <h2 className="text-3xl font-bold text-indigo-800 mb-6">Ready to Join Our Growing Community?</h2>
          <p className="text-lg text-indigo-700 mb-8">Discover how SalarySync can transform your payroll operations and help your business thrive.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/pricing" className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center">
              View Pricing <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            <a href="/contact" className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-colors">
              Contact Us
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

