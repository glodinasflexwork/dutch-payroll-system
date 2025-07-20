import { UnifiedNavigation } from "@/components/layout/unified-navigation";
import { UnifiedFooter } from "@/components/layout/unified-footer";
import { Headset, BookOpen, MessageSquare, Phone, Mail, HelpCircle, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <>
      <UnifiedNavigation />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">We're Here to Help You Succeed</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Get the support you need, when you need it. Our dedicated team is committed to ensuring your payroll operations run smoothly.
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">How Can We Help You?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <BookOpen className="w-12 h-12 text-green-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Knowledge Base</h3>
                <p className="text-gray-600 mb-6">Find answers to common questions and step-by-step guides in our comprehensive knowledge base.</p>
                <Link href="#" className="text-green-600 hover:text-green-800 font-medium inline-flex items-center">
                  Browse Articles <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <MessageSquare className="w-12 h-12 text-green-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Live Chat</h3>
                <p className="text-gray-600 mb-6">Get instant help from our support team through our live chat feature, available during business hours.</p>
                <button className="text-green-600 hover:text-green-800 font-medium inline-flex items-center">
                  Start Chat <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Mail className="w-12 h-12 text-green-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Email Support</h3>
                <p className="text-gray-600 mb-6">Send us a detailed message and we'll get back to you within 24 hours with a comprehensive solution.</p>
                <Link href="/contact" className="text-green-600 hover:text-green-800 font-medium inline-flex items-center">
                  Send Email <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">How do I process my first payroll?</h3>
                </div>
                <p className="text-gray-600">Our onboarding wizard will guide you through setting up your first payroll. You can also schedule a demo with our team for personalized assistance.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">What if I need help with Dutch tax regulations?</h3>
                </div>
                <p className="text-gray-600">Our system automatically handles Dutch tax calculations, but our support team includes payroll experts who can answer specific compliance questions.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">Can I import data from my current payroll system?</h3>
                </div>
                <p className="text-gray-600">Yes! We offer data migration services to help you seamlessly transfer your existing payroll data. Contact our support team to get started.</p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Contact Information</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                  <Phone className="w-8 h-8 text-blue-600 mr-4" />
                  <h3 className="text-2xl font-semibold text-gray-800">Phone Support</h3>
                </div>
                <p className="text-gray-600 mb-4">Speak directly with our support team for urgent issues or complex questions.</p>
                <p className="text-lg font-semibold text-gray-800">+31 20 123 4567</p>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM CET</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                  <Headset className="w-8 h-8 text-blue-600 mr-4" />
                  <h3 className="text-2xl font-semibold text-gray-800">Premium Support</h3>
                </div>
                <p className="text-gray-600 mb-4">Professional and Enterprise customers enjoy priority support with faster response times.</p>
                <p className="text-lg font-semibold text-gray-800">Dedicated Account Manager</p>
                <p className="text-gray-600">24/7 support for Enterprise customers</p>
              </div>
            </div>
          </section>

          <section className="text-center bg-green-50 p-12 rounded-lg">
            <Search className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-green-800 mb-6">Still Need Help?</h2>
            <p className="text-lg text-green-700 mb-8">Can't find what you're looking for? Our support team is always ready to assist you with any questions or concerns.</p>
            <a href="/contact" className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors">
              Contact Support Team
            </a>
          </section>
        </main>
      </div>
      <UnifiedFooter />
    </>
  );
}

