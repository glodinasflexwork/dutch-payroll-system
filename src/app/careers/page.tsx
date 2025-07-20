import { Briefcase, Users, Heart, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Join the SalarySync Team</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Be part of a dynamic team that's revolutionizing Dutch payroll. At SalarySync, we're building innovative solutions that empower businesses and simplify complex processes.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Why Work at SalarySync?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Impactful Work</h3>
              <p className="text-gray-600">Contribute to a product that genuinely helps businesses thrive by simplifying their payroll and compliance.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Collaborative Culture</h3>
              <p className="text-gray-600">Work alongside talented and passionate individuals in a supportive and inclusive environment.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Heart className="w-12 h-12 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Employee Well-being</h3>
              <p className="text-gray-600">We prioritize your health and happiness with comprehensive benefits, flexible working, and a focus on work-life balance.</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Innovation</h3>
              <p className="text-gray-600">We constantly seek new ways to improve our product and processes, embracing creativity and forward-thinking solutions.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Integrity</h3>
              <p className="text-gray-600">We operate with transparency, honesty, and a strong ethical compass in all our interactions and decisions.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Customer Focus</h3>
              <p className="text-gray-600">Our users are at the heart of everything we do. We are dedicated to understanding their needs and exceeding their expectations.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Growth</h3>
              <p className="text-gray-600">We invest in our employees' professional development, providing opportunities for learning, skill enhancement, and career advancement.</p>
            </div>
          </div>
        </section>

        <section className="text-center bg-blue-50 p-12 rounded-lg mb-16">
          <h2 className="text-3xl font-bold text-blue-800 mb-6">Current Openings</h2>
          <p className="text-lg text-blue-700 mb-8">We're always looking for talented individuals to join our growing team. Explore our open positions and find your next career opportunity.</p>
          <Link href="#open-positions" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
            View Open Positions
          </Link>
        </section>

        <section id="open-positions" className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Open Positions</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Senior Software Engineer (Frontend)</h3>
                <p className="text-gray-600">Amsterdam, Netherlands • Full-time</p>
              </div>
              <Link href="/careers/senior-software-engineer-frontend" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                Apply Now <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Payroll Specialist</h3>
                <p className="text-gray-600">Utrecht, Netherlands • Full-time</p>
              </div>
              <Link href="/careers/payroll-specialist" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                Apply Now <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Product Manager</h3>
                <p className="text-gray-600">Amsterdam, Netherlands • Full-time</p>
              </div>
              <Link href="/careers/product-manager" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                Apply Now <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        <section className="text-center bg-gradient-to-r from-purple-100 to-pink-100 p-12 rounded-lg">
          <Award className="w-16 h-16 text-purple-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-purple-800 mb-6">Don't see a role for you?</h2>
          <p className="text-lg text-purple-700 mb-8">We're always growing! Send us your resume and tell us how you can contribute to SalarySync.</p>
          <a href="mailto:careers@salarysync.nl" className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors">
            Submit Your Resume
          </a>
        </section>
      </main>
    </div>
  );
}


