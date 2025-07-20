import { Phone, Mail, MapPin, Clock, MessageSquare, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-teal-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Have questions about SalarySync? Need a demo? Our team is here to help you find the perfect payroll solution for your business.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-center">
                <Phone className="w-6 h-6 text-teal-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-800">Phone</h3>
                  <p className="text-gray-600">+31 20 123 4567</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="w-6 h-6 text-teal-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-800">Email</h3>
                  <p className="text-gray-600">hello@salarysync.nl</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-6 h-6 text-teal-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-800">Address</h3>
                  <p className="text-gray-600">
                    Herengracht 123<br />
                    1015 BG Amsterdam<br />
                    Netherlands
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-teal-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-800">Business Hours</h3>
                  <p className="text-gray-600">
                    Monday - Friday: 9:00 AM - 6:00 PM CET<br />
                    Saturday - Sunday: Closed
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Contact Options</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="tel:+31201234567" className="bg-teal-600 text-white p-4 rounded-lg text-center hover:bg-teal-700 transition-colors flex items-center justify-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Us
                </a>
                <a href="mailto:hello@salarysync.nl" className="bg-white text-teal-600 border-2 border-teal-600 p-4 rounded-lg text-center hover:bg-teal-50 transition-colors flex items-center justify-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Us
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Send us a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="demo">Request a Demo</option>
                  <option value="pricing">Pricing Information</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership Opportunities</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Tell us about your payroll needs or ask any questions you have..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </button>
            </form>
          </div>
        </div>

        <section className="mt-16 text-center bg-teal-50 p-12 rounded-lg">
          <MessageSquare className="w-16 h-16 text-teal-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-teal-800 mb-6">Prefer to Chat?</h2>
          <p className="text-lg text-teal-700 mb-8">Our live chat support is available during business hours for immediate assistance.</p>
          <button className="bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors">
            Start Live Chat
          </button>
        </section>
      </main>
    </div>
  );
}

