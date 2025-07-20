import { Headset, BookOpen, MessageSquare, Phone, Mail, HelpCircle, Search } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Dedicated Support for Your Payroll Needs</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            At SalarySync, we believe in providing exceptional support to ensure your payroll operations run smoothly. Our team is here to help you every step of the way.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">How Can We Help You?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <BookOpen className="w-12 h-12 text-green-700 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Knowledge Base</h3>
              <p className="text-gray-600">Find instant answers to your questions with our comprehensive knowledge base, filled with articles, guides, and FAQs.</p>
              <Link href="#" className="text-green-600 hover:text-green-800 font-medium mt-4 inline-flex items-center">
                Explore Articles <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Headset className="w-12 h-12 text-green-700 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Direct Support</h3>
              <p className="text-gray-600">Our expert support team is available to provide personalized assistance via phone, email, or live chat.</p>
              <Link href="#contact-us" className="text-green-600 hover:text-green-800 font-medium mt-4 inline-flex items-center">
                Contact Us <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <MessageSquare className="w-12 h-12 text-green-700 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Community Forum</h3>
              <p className="text-gray-600">Connect with other SalarySync users, share tips, and get advice from the community.</p>
              <Link href="#" className="text-green-600 hover:text-green-800 font-medium mt-4 inline-flex items-center">
                Join the Community <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Popular Support Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <HelpCircle className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Getting Started with SalarySync</h3>
                <p className="text-gray-600">Step-by-step guides to set up your account and run your first payroll.</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <HelpCircle className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Managing Employee Data</h3>
                <p className="text-gray-600">Learn how to add, edit, and manage employee information efficiently.</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <HelpCircle className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Tax & Compliance</h3>
                <p className="text-gray-600">Understand Dutch tax regulations and ensure your payroll is always compliant.</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <HelpCircle className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Integrations & API</h3>
                <p className="text-gray-600">Guides on connecting SalarySync with your accounting and HR software.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact-us" className="text-center bg-blue-50 p-12 rounded-lg">
          <h2 className="text-3xl font-bold text-blue-800 mb-6">Need to Speak with Someone?</h2>
          <p className="text-lg text-blue-700 mb-8">Our support team is ready to assist you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+31-123-456789" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
              <Phone className="w-5 h-5 mr-2" /> Call Us
            </a>
            <a href="mailto:support@salarysync.nl" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center">
              <Mail className="w-5 h-5 mr-2" /> Email Support
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}


