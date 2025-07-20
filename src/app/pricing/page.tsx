import { Check, Star, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Choose the plan that fits your business needs. No hidden fees, no surprises. Scale up or down as your business grows.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Starter Plan */}
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-800">€49</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">Perfect for small businesses with up to 10 employees</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Up to 10 employees</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Automated payroll processing</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Dutch tax compliance</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Employee self-service portal</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Basic reporting</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Email support</li>
              </ul>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Professional Plan */}
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                  <Star className="w-4 h-4 mr-1" /> Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Professional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-800">€149</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">Ideal for growing businesses with up to 50 employees</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Up to 50 employees</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Everything in Starter</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Advanced reporting & analytics</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> HR integrations</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Time & attendance tracking</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Priority phone support</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Dedicated account manager</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-800">Custom</span>
              </div>
              <p className="text-gray-600 mb-6">Tailored solutions for large organizations with 50+ employees</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Unlimited employees</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Everything in Professional</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Custom integrations</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Advanced security features</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Multi-company support</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> 24/7 premium support</li>
                <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> On-site training</li>
              </ul>
              <button className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </section>

        <section className="text-center bg-green-50 p-12 rounded-lg mb-16">
          <h2 className="text-3xl font-bold text-green-800 mb-6">All Plans Include</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-800">14-day free trial</p>
            </div>
            <div className="text-center">
              <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-800">No setup fees</p>
            </div>
            <div className="text-center">
              <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-800">Cancel anytime</p>
            </div>
            <div className="text-center">
              <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-800">Data migration support</p>
            </div>
          </div>
        </section>

        <section className="text-center bg-blue-50 p-12 rounded-lg">
          <h2 className="text-3xl font-bold text-blue-800 mb-6">Questions About Pricing?</h2>
          <p className="text-lg text-blue-700 mb-8">Our sales team is here to help you find the perfect plan for your business needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
              Contact Sales <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            <a href="/features" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
              View All Features
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

