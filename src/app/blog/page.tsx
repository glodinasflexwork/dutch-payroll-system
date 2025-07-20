import { Newspaper, Lightbulb, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-orange-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">SalarySync Blog</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Stay informed with the latest insights, trends, and expert advice on Dutch payroll, HR, compliance, and business growth.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Recent Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <Newspaper className="w-12 h-12 text-orange-600 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">The Future of Dutch Payroll: Key Trends for 2025</h3>
              <p className="text-gray-600 mb-4">Explore the emerging trends shaping the Dutch payroll landscape, from AI automation to new compliance regulations.</p>
              <Link href="#" className="text-orange-600 hover:text-orange-800 font-medium flex items-center">
                Read More <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <Lightbulb className="w-12 h-12 text-orange-600 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">5 Ways to Optimize Your Payroll Process for Small Businesses</h3>
              <p className="text-gray-600 mb-4">Practical tips and strategies for small and medium-sized enterprises to streamline their payroll operations and save time.</p>
              <Link href="#" className="text-orange-600 hover:text-orange-800 font-medium flex items-center">
                Read More <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <TrendingUp className="w-12 h-12 text-orange-600 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Understanding Dutch Labor Law: A Guide for Employers</h3>
              <p className="text-gray-600 mb-4">Navigate the complexities of Dutch labor laws with our comprehensive guide, ensuring compliance and fair employment practices.</p>
              <Link href="#" className="text-orange-600 hover:text-orange-800 font-medium flex items-center">
                Read More <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        <section className="text-center bg-orange-50 p-12 rounded-lg">
          <h2 className="text-3xl font-bold text-orange-800 mb-6">Subscribe to Our Newsletter</h2>
          <p className="text-lg text-orange-700 mb-8">Get the latest payroll news, updates, and exclusive content delivered directly to your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Enter your email address"
              className="px-6 py-3 rounded-lg border-2 border-orange-300 focus:outline-none focus:border-orange-500 flex-grow"
            />
            <button
              type="submit"
              className="bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}


